import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const effect = vi.hoisted(() => ({ cleanup: undefined as (() => void) | undefined }));
vi.mock("react", async (original) => ({ ...(await original<typeof import("react")>()), useEffect: (run: () => (() => void) | void) => { effect.cleanup = run() ?? undefined; } }));

const KEY = "BA" + "A".repeat(85);
const origin = "https://shelfspring.example";
let client: typeof import("@/lib/push/client");
let current: PushSubscription | null;
let subscription: PushSubscription;
let storage: Map<string, string>;
let cached: Map<string, Response>;
const fetchMock = vi.fn<typeof fetch>();
const subscribe = vi.fn();
const getSubscription = vi.fn();
const unsubscribe = vi.fn();
const cacheOpen = vi.fn();
const response = (data: unknown = { ok: true }) => Response.json(data);
function deferred<T>() { let resolve!: (value: T) => void; const promise = new Promise<T>((r) => { resolve = r; }); return { promise, resolve }; }
const settle = () => new Promise<void>((resolve) => setImmediate(resolve));

beforeEach(async () => {
  vi.resetModules(); vi.clearAllMocks(); storage = new Map(); cached = new Map(); current = null;
  subscription = {
    endpoint: "https://push.example/device-one", expirationTime: null,
    options: { applicationServerKey: Uint8Array.from(Buffer.from(KEY, "base64url")).buffer },
    toJSON: () => ({ endpoint: "https://push.example/device-one", keys: { p256dh: "fixture-public", auth: "fixture-auth" } }),
    unsubscribe,
  } as unknown as PushSubscription;
  unsubscribe.mockImplementation(async () => { current = null; return true; });
  subscribe.mockImplementation(async () => { current = subscription; return subscription; });
  getSubscription.mockImplementation(async () => current);
  const registration = { pushManager: { subscribe, getSubscription }, update: vi.fn(async () => undefined) };
  const notification = { permission: "granted", requestPermission: vi.fn(async () => "granted") };
  vi.stubGlobal("window", Object.assign(new EventTarget(), { location: { origin }, PushManager: class {}, Notification: notification, setTimeout, clearTimeout }));
  vi.stubGlobal("document", Object.assign(new EventTarget(), { visibilityState: "visible" }));
  vi.stubGlobal("Notification", notification);
  vi.stubGlobal("navigator", { serviceWorker: Object.assign(new EventTarget(), { register: vi.fn(async () => registration), ready: Promise.resolve(registration) }), userAgent: "Chrome" });
  Object.assign(window, { navigator });
  vi.stubGlobal("localStorage", { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value), removeItem: (key: string) => storage.delete(key) });
  cacheOpen.mockImplementation(async () => ({
    put: async (key: string, value: Response) => { cached.set(key, value.clone()); },
    match: async (key: string) => cached.get(key)?.clone(),
  }));
  vi.stubGlobal("caches", { open: cacheOpen });
  fetchMock.mockImplementation(async (_input, init) => response(init?.method === "POST" ? { id: "fixture-device" } : { ok: true, devices: [] }));
  vi.stubGlobal("fetch", fetchMock);
  client = await import("@/lib/push/client");
});
afterEach(() => { effect.cleanup?.(); effect.cleanup = undefined; vi.useRealTimers(); vi.unstubAllGlobals(); });

function writes(method: string) { return fetchMock.mock.calls.filter((call) => call[1]?.method === method); }

describe("the explicit device notification choice", () => {
  it("keeps normal granted-permission repair and server reconciliation", async () => {
    const sub = await client.repairSubscription(KEY);
    expect(sub).toBe(subscription);
    expect(await client.reconcileSubscription(sub!, { probe: true })).toBe("synced");
    expect(subscribe).toHaveBeenCalledTimes(1); expect(writes("POST")).toHaveLength(1);
  });

  it("persists Turn off across reloads and does not undo it when the sync receipt is cleared", async () => {
    current = subscription;
    await client.unsubscribePush();
    expect(unsubscribe).toHaveBeenCalledTimes(1); expect(writes("DELETE")).toHaveLength(1);
    client.clearSyncRecord();
    vi.resetModules(); client = await import("@/lib/push/client");
    expect(client.pushOptedOut()).toBe(true);
    expect(await client.repairSubscription(KEY)).toBeNull();
    expect(await client.reconcileSubscription(subscription, { force: true, probe: true })).toBe("disabled");
    expect(subscribe).not.toHaveBeenCalled(); expect(writes("POST")).toHaveLength(0);
    expect(await cached.get(origin + "/__pc_push_preference__")!.clone().json()).toEqual({ disabled: true });
  });

  it("resumes only after the explicit Turn on preference, preserving the ordinary delivery path", async () => {
    await client.setPushOptedOut(true);
    await expect(client.subscribePush(KEY)).rejects.toThrow(client.PUSH_DISABLED);
    await client.setPushOptedOut(false);
    const sub = await client.subscribePush(KEY);
    expect(await client.syncSubscription(sub)).toMatchObject({ ok: true });
    expect(client.pushOptedOut()).toBe(false);
    expect(await cached.get(origin + "/__pc_push_preference__")!.clone().json()).toEqual({ disabled: false });
  });

  it("honors the persistent worker preference even when localStorage is missing after reload", async () => {
    await client.setPushOptedOut(true); storage.clear();
    vi.resetModules(); client = await import("@/lib/push/client");
    expect(await client.repairSubscription(KEY)).toBeNull();
    expect(await client.syncSubscription(subscription)).toMatchObject({ ok: false, code: "disabled" });
    expect(subscribe).not.toHaveBeenCalled(); expect(writes("POST")).toHaveLength(0);
  });

  it("latches off before a pending browser subscription can complete, and cleans up that new endpoint", async () => {
    const pending = deferred<PushSubscription>(); subscribe.mockReturnValue(pending.promise);
    const repair = client.repairSubscription(KEY); await settle();
    expect(subscribe).toHaveBeenCalledTimes(1);
    await client.unsubscribePush();
    pending.resolve(subscription);
    expect(await repair).toBeNull();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(writes("POST")).toHaveLength(0); expect(writes("DELETE")).toHaveLength(1);
  });

  it("deletes again when a POST already in flight completes after Turn off", async () => {
    current = subscription;
    const pending = deferred<Response>();
    fetchMock.mockImplementation(async (_input, init) => init?.method === "POST" ? pending.promise : response());
    const sync = client.syncSubscription(subscription); await settle();
    expect(writes("POST")).toHaveLength(1);
    await client.unsubscribePush(); expect(writes("DELETE")).toHaveLength(1);
    pending.resolve(response({ id: "fixture-device" }));
    expect(await sync).toMatchObject({ ok: false, code: "disabled" });
    expect(writes("DELETE")).toHaveLength(2);
    expect(storage.has("pc:push:sync")).toBe(false);
  });

  it("does not claim successful Turn off when local unsubscribe or server deletion failed", async () => {
    current = subscription; unsubscribe.mockRejectedValueOnce(new Error("browser refused"));
    fetchMock.mockResolvedValueOnce(Response.json({ error: "not signed in" }, { status: 401 }));
    await expect(client.unsubscribePush()).rejects.toThrow(client.PUSH_DISABLE_FAILED);
    expect(client.pushOptedOut()).toBe(true); expect(writes("DELETE")).toHaveLength(1);
    expect(await client.repairSubscription(KEY)).toBeNull();
  });

  it("still attempts device/server removal if persistent worker preference storage fails", async () => {
    current = subscription; cacheOpen.mockRejectedValue(new Error("storage unavailable"));
    await expect(client.unsubscribePush()).rejects.toThrow(client.PUSH_DISABLE_FAILED);
    expect(unsubscribe).toHaveBeenCalledTimes(1); expect(writes("DELETE")).toHaveLength(1);
    expect(client.pushOptedOut()).toBe(true);
  });

  it("does not restart an opted-out device on actual PwaBoot mount or return-to-foreground", async () => {
    current = subscription; await client.unsubscribePush(); fetchMock.mockClear();
    vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
    Object.assign(window, { setTimeout, clearTimeout });
    const { PwaBoot } = await import("@/components/pwa/PwaBoot");
    PwaBoot(); await vi.advanceTimersByTimeAsync(0); await settle();
    await vi.advanceTimersByTimeAsync(31_000); document.dispatchEvent(new Event("visibilitychange")); await settle();
    expect(subscribe).not.toHaveBeenCalled(); expect(writes("POST")).toHaveLength(0);
  });

  it("retains actual PwaBoot automatic repair for an enabled device", async () => {
    fetchMock.mockImplementation(async (input, init) => String(input) === "/api/push/vapid" ? response({ publicKey: KEY }) : response(init?.method === "POST" ? { id: "fixture-device" } : { ok: true }));
    vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] }); Object.assign(window, { setTimeout, clearTimeout });
    const { PwaBoot } = await import("@/components/pwa/PwaBoot");
    PwaBoot(); await vi.advanceTimersByTimeAsync(0); await settle();
    expect(subscribe).toHaveBeenCalledTimes(1); expect(writes("POST")).toHaveLength(1);
  });
});

describe("service-worker rotation respects the same persistent opt-out", () => {
  function worker() {
    const handlers: Record<string, (event: unknown) => void> = {};
    runInNewContext(readFileSync(new URL("../public/sw.js", import.meta.url), "utf8"), {
      self: { addEventListener: (name: string, handler: (event: unknown) => void) => { handlers[name] = handler; }, location: { origin }, registration: { pushManager: { subscribe } } },
      caches, fetch: fetchMock, URL, Response, Uint8Array, ArrayBuffer, atob, btoa, console,
    });
    return (next: PushSubscription | null = null) => {
      let done: Promise<void> | undefined;
      handlers.pushsubscriptionchange({ oldSubscription: subscription, newSubscription: next, waitUntil: (promise: Promise<void>) => { done = promise; } });
      return done!;
    };
  }
  it("does not create or report a replacement while all pages are closed and this device is off", async () => {
    await client.setPushOptedOut(true);
    await worker()();
    expect(subscribe).not.toHaveBeenCalled(); expect(fetchMock).not.toHaveBeenCalled();
  });
  it("discards a replacement the browser already supplied while off", async () => {
    await client.setPushOptedOut(true);
    await worker()(subscription);
    expect(unsubscribe).toHaveBeenCalledTimes(1); expect(writes("POST")).toHaveLength(0); expect(writes("DELETE")).toHaveLength(1);
  });
  it("keeps automatic rotation enabled for devices that were not turned off", async () => {
    await worker()();
    expect(subscribe).toHaveBeenCalledTimes(1); expect(writes("POST")).toHaveLength(1);
  });
  it("compensates a worker rotation POST that completes after the explicit off decision", async () => {
    const pending = deferred<Response>();
    fetchMock.mockImplementation(async (_input, init) => init?.method === "POST" ? pending.promise : response());
    const rotating = worker()(subscription); await settle();
    expect(writes("POST")).toHaveLength(1);
    await client.setPushOptedOut(true); pending.resolve(response({ id: "fixture-device" })); await rotating;
    expect(writes("DELETE")).toHaveLength(1); expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
  it("attempts worker cleanup after a lost POST response when the user turned off meanwhile", async () => {
    const release = deferred<void>();
    fetchMock.mockImplementation(async (_input, init) => {
      if (init?.method === "POST") { await release.promise; throw new Error("response lost"); }
      return response();
    });
    const rotating = worker()(subscription); await settle();
    expect(writes("POST")).toHaveLength(1);
    await client.setPushOptedOut(true); release.resolve(); await rotating;
    expect(writes("DELETE")).toHaveLength(1); expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
