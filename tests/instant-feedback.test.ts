import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";
import type { AlertSet } from "@/lib/alertSet";
import type { PhoneCatalog } from "@/components/alerts/PhoneMatrix";

// A small hook-state harness exercises real callbacks without a browser, dependencies, or provider requests.
// Browser layout/paint timing still needs the separate desktop/mobile acceptance pass.
const harness = vi.hoisted(() => ({ slots: [] as unknown[], cursor: 0, effects: [] as (() => void)[],
  auth: { isLoaded: true, isSignedIn: true }, translate: (message: string) => message }));
vi.mock("react", async (original) => {
  const react = await original<typeof import("react")>();
  const memo = <T,>(factory: () => T, deps: unknown[]) => {
    const index = harness.cursor++;
    const old = harness.slots[index] as { deps: unknown[]; value: T } | undefined;
    if (!old || deps.some((value, i) => !Object.is(value, old.deps[i]))) harness.slots[index] = { deps, value: factory() };
    return (harness.slots[index] as { value: T }).value;
  };
  return { ...react,
    useState(initial: unknown) {
      const index = harness.cursor++;
      if (!(index in harness.slots)) harness.slots[index] = typeof initial === "function" ? initial() : initial;
      return [harness.slots[index], (next: unknown) => { harness.slots[index] = typeof next === "function" ? next(harness.slots[index]) : next; }];
    },
    useRef(initial: unknown) {
      const index = harness.cursor++;
      if (!(index in harness.slots)) harness.slots[index] = { current: initial };
      return harness.slots[index];
    },
    useMemo: memo,
    useCallback: <T,>(callback: T, deps: unknown[]) => memo(() => callback, deps),
    useEffect(effect: () => void, deps: unknown[]) { memo(() => { harness.effects.push(effect); }, deps); },
  };
});
vi.mock("@clerk/nextjs", () => ({ useAuth: () => harness.auth, useSignIn: () => ({}), useSignUp: () => ({}) }));
vi.mock("@/components/i18n/LangProvider", async () => ({ useT: () => (awaitedDictionary), useLang: () => "en" }));
// Imported data is intentionally shared rather than duplicating English component strings in the tests.
import { cen as awaitedDictionary } from "@/lib/i18n/cdict/en";
vi.mock("@/components/i18n/useApiError", () => ({ useApiError: () => harness.translate }));
vi.mock("@/lib/alertEvents", () => ({ announceAlertsChanged: vi.fn() }));
vi.mock("@/lib/me", () => ({ forgetMe: vi.fn(), fetchMe: vi.fn(async () => null) }));
vi.mock("@/lib/track", () => ({ track: vi.fn() }));

import { useAlertSet } from "@/components/alerts/useAlertSet";
import { AlertEditor } from "@/components/alerts/AlertEditor";
import { DeviceList } from "@/components/account/DeviceList";
import { announceAlertsChanged } from "@/lib/alertEvents";
import { fetchMe } from "@/lib/me";

const phone = { model: "duo", storage: "256GB", color: "Night Sky" };
const initial: AlertSet = { phones: [phone], stores: ["R095"] };
const changed: AlertSet = { phones: [phone], stores: ["R095", "R415"] };
const latest: AlertSet = { phones: [phone], stores: ["R415"] };
const plan = { key: "free" as const, limit: 0, used: 1 };
const catalog: PhoneCatalog = { configs: { duo: [{ storage: phone.storage, color: phone.color, price: 999, partNumber: "SYNTHETIC/A" }], "18-pro": [], "18-pro-max": [] } };
function render<T>(component: () => T) { harness.cursor = 0; return component(); }
function commitEffects() { const effects = harness.effects.splice(0); for (const effect of effects) effect(); }
function nodes(tree: unknown): ReactElement<Record<string, unknown>>[] {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!tree || typeof tree !== "object" || !("props" in tree)) return [];
  const element = tree as ReactElement<Record<string, unknown>>;
  return [element, ...nodes(element.props.children)];
}
function click(element: ReactElement<Record<string, unknown>>) { (element.props.onClick as () => void)(); }
function deferred<T>() { let resolve!: (value: T) => void; let reject!: (error: Error) => void; const promise = new Promise<T>((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; }
const settle = () => new Promise<void>((resolve) => setImmediate(resolve));
const fetchMock = vi.fn<typeof fetch>();
const navigate = vi.fn();
beforeEach(() => {
  harness.slots = []; harness.cursor = 0; harness.effects = []; harness.auth = { isLoaded: true, isSignedIn: true };
  vi.clearAllMocks(); fetchMock.mockReset(); vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("window", { setTimeout, clearTimeout, location: { pathname: "/", assign: navigate }, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("optimistic watch saves", () => {
  const view = () => render(() => useAlertSet(initial, plan));
  it("shows pending immediately during debounce and rolls an HTTP failure back to the confirmed set", async () => {
    const request = deferred<Response>(); fetchMock.mockReturnValue(request.promise);
    view().apply(changed);
    expect(view()).toMatchObject({ set: changed, state: "saving", error: null });
    expect(fetchMock).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(300);
    request.resolve(Response.json({ error: "Temporary failure" }, { status: 503 })); await settle();
    expect(view()).toMatchObject({ set: initial, state: "error", error: "Temporary failure" });
    expect(announceAlertsChanged).not.toHaveBeenCalled();
  });
  it("keeps the latest queued edit on an earlier failure and clears that error after the later save succeeds", async () => {
    const first = deferred<Response>(), second = deferred<Response>();
    fetchMock.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    view().apply(changed); await vi.advanceTimersByTimeAsync(300);
    view().apply(latest);
    first.resolve(Response.json({ error: "First failed" }, { status: 500 })); await settle();
    expect(view().set).toEqual(latest); expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual(latest);
    second.resolve(Response.json({ set: latest, plan })); await settle();
    expect(view()).toMatchObject({ set: latest, state: "saved", error: null });
    expect(announceAlertsChanged).toHaveBeenCalledTimes(1);
  });
  it("preserves the mature first-phone selection when zero rules make the server return an empty pair set", async () => {
    const empty = { phones: [], stores: [] }; const phoneOnly = { phones: [phone], stores: [] };
    fetchMock.mockResolvedValue(Response.json({ set: empty, plan }));
    render(() => useAlertSet(empty, plan)).apply(phoneOnly); await vi.advanceTimersByTimeAsync(300); await settle();
    expect(render(() => useAlertSet(empty, plan))).toMatchObject({ set: phoneOnly, state: "saved" });
  });
});

describe("checkout and initial account feedback", () => {
  const editor = () => render(() => AlertEditor({ catalog, account: { set: initial, plan } }));
  const checkoutButtons = (tree: unknown) => nodes(tree).filter((node) => node.type === "button" && "aria-busy" in node.props);
  it("locks checkout immediately against a double click and restores usable buttons after rejection", async () => {
    const request = deferred<Response>(); fetchMock.mockReturnValue(request.promise);
    const before = checkoutButtons(editor());
    expect(before).toHaveLength(3); click(before[0]); click(before[1]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const pending = checkoutButtons(editor());
    expect(pending.every((node) => node.props.disabled === true)).toBe(true);
    expect(pending[0].props["aria-busy"]).toBe(true);
    request.resolve(Response.json({ error: "Checkout temporarily unavailable" }, { status: 503 })); await settle();
    const failed = editor();
    expect(checkoutButtons(failed).every((node) => node.props.disabled === false)).toBe(true);
    expect(nodes(failed).some((node) => node.props.role === "alert")).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
  });
  it("keeps checkout pending until the returned destination is navigated to", async () => {
    const request = deferred<Response>(); fetchMock.mockReturnValue(request.promise);
    click(checkoutButtons(editor())[0]);
    request.resolve(Response.json({ url: "https://checkout.stripe.com/synthetic" })); await settle();
    expect(navigate).toHaveBeenCalledExactlyOnceWith("https://checkout.stripe.com/synthetic");
    expect(checkoutButtons(editor())[0].props["aria-busy"]).toBe(true);
  });
  it("shows an account skeleton, avoids overlapping initial reads, and exposes a retry after failure", async () => {
    const first = deferred<Response>(), retry = deferred<Response>();
    fetchMock.mockReturnValueOnce(first.promise).mockReturnValueOnce(retry.promise);
    const view = () => render(() => AlertEditor({ catalog }));
    expect(nodes(view()).some((node) => node.props["aria-busy"] === "true")).toBe(true);
    commitEffects(); await vi.advanceTimersByTimeAsync(0);
    view(); commitEffects(); await vi.advanceTimersByTimeAsync(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    first.resolve(Response.json({ error: "Please retry" }, { status: 503 })); await settle();
    const failed = view(); expect(nodes(failed).some((node) => node.props.role === "alert")).toBe(true);
    const button = nodes(failed).find((node) => node.type === "button")!; click(button); click(button);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(nodes(view()).some((node) => node.props["aria-busy"] === "true")).toBe(true);
    retry.resolve(Response.json({ watches: [], plan })); await settle();
    expect(nodes(view()).some((node) => node.props.role === "alert")).toBe(false);
  });
  it.each(["read", "save"])("recovers a post-sign-in %s failure without another OTP or losing existing watches", async (failure) => {
    harness.auth.isSignedIn = false;
    const existing = { id: "existing", active: true, createdAt: "2026-01-01", model: phone.model, storages: [phone.storage], colors: [phone.color], storeNumbers: ["R415"] };
    const server = { watches: [existing], plan };
    if (failure === "save") fetchMock.mockResolvedValueOnce(Response.json(server));
    fetchMock.mockResolvedValueOnce(Response.json({ error: "Please retry syncing alerts" }, { status: 503 }));
    const view = () => render(() => AlertEditor({ catalog, start: { model: "duo", storage: phone.storage, color: phone.color, store: "R095" } }));
    const form = nodes(view()).find((node) => typeof node.props.onSignedIn === "function")!;
    (form.props.onVerifying as () => void)();
    harness.auth.isSignedIn = true; // Clerk activates the session before invoking this callback.
    await (form.props.onSignedIn as () => Promise<void>)();
    const failed = view();
    expect(nodes(failed).some((node) => node.props.role === "alert")).toBe(true);
    expect(nodes(failed).some((node) => typeof node.props.onSignedIn === "function")).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(failure === "read" ? 1 : 2);
    if (failure === "read") expect(fetchMock.mock.calls.every((call) => call[1]?.method !== "PUT")).toBe(true);
    commitEffects(); await vi.advanceTimersByTimeAsync(0);
    expect(fetchMock).toHaveBeenCalledTimes(failure === "read" ? 1 : 2); // No competing automatic account load.

    const retry = deferred<Response>();
    const merged = { phones: [phone], stores: ["R415", "R095"] };
    fetchMock.mockReturnValueOnce(retry.promise).mockResolvedValueOnce(Response.json({ set: merged, plan }));
    const retryButton = nodes(failed).find((node) => node.type === "button")!;
    const previous = fetchMock.mock.calls.length;
    click(retryButton); click(retryButton);
    expect(fetchMock).toHaveBeenCalledTimes(previous + 1);
    expect(nodes(view()).some((node) => node.props["aria-busy"] === "true")).toBe(true);
    retry.resolve(Response.json(server)); await settle();
    expect(fetchMock).toHaveBeenCalledTimes(previous + 2);
    expect(JSON.parse(String(fetchMock.mock.calls.at(-1)![1]?.body))).toEqual(merged);
    const saved = view();
    expect(nodes(saved).some((node) => node.props.role === "alert")).toBe(false);
    expect(checkoutButtons(saved)).toHaveLength(3);
  });
  it("returns a newly authenticated free member to the account page that required sign-in", async () => {
    harness.auth.isSignedIn = false;
    vi.mocked(fetchMe).mockResolvedValueOnce({ signedIn: true, everPaid: false, plan });
    const tree = render(() => AlertEditor({ catalog, signInOnly: true, next: "/account" }));
    const form = nodes(tree).find((node) => typeof node.props.onSignedIn === "function")!;
    (form.props.onVerifying as () => void)();
    harness.auth.isSignedIn = true;
    await (form.props.onSignedIn as () => Promise<void>)();
    expect(navigate).toHaveBeenCalledExactlyOnceWith("/account");
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("retries a sign-in-only navigation failure without loading watches or repeating verification", async () => {
    harness.auth.isSignedIn = false;
    const view = () => render(() => AlertEditor({ catalog, signInOnly: true, next: "/pricing" }));
    const form = nodes(view()).find((node) => typeof node.props.onSignedIn === "function")!;
    (form.props.onVerifying as () => void)();
    harness.auth.isSignedIn = true;
    navigate.mockImplementationOnce(() => { throw new Error("Navigation unavailable"); });
    await (form.props.onSignedIn as () => Promise<void>)();
    const failed = view();
    expect(nodes(failed).some((node) => node.props.role === "alert")).toBe(true);
    commitEffects(); await settle();
    expect(navigate).toHaveBeenCalledTimes(1);
    click(nodes(failed).find((node) => node.type === "button")!); await settle();
    expect(navigate).toHaveBeenLastCalledWith("/pricing");
    expect(navigate).toHaveBeenCalledTimes(2);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(nodes(view()).some((node) => node.type === "a" && node.props.href === "/account")).toBe(true);
    expect(nodes(view()).some((node) => typeof node.props.onSignedIn === "function")).toBe(false);
  });
});

describe("device removal rollback", () => {
  const devices = ["first", "second"].map((id) => ({ id, platform: "ios", standalone: true, added: "today", lastAlert: null, disabledAt: null, lastError: null }));
  const view = () => render(() => DeviceList({ devices }));
  const buttons = (tree: unknown) => nodes(tree).filter((node) => node.type === "button");
  it("restores the row on HTTP failure and rejects repeated clicks while removal is pending", async () => {
    const request = deferred<Response>(); fetchMock.mockReturnValue(request.promise);
    const before = buttons(view()); click(before[0]); click(before[1]);
    expect(fetchMock).toHaveBeenCalledTimes(1); expect(buttons(view())).toHaveLength(1);
    request.resolve(Response.json({ error: "Sign in again" }, { status: 401 })); await settle();
    expect(buttons(view())).toHaveLength(2); expect(nodes(view()).some((node) => node.props.role === "alert")).toBe(true);
  });
  it("restores a rejected network request and keeps a later acknowledged removal", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Network unavailable"));
    click(buttons(view())[0]); await settle(); expect(buttons(view())).toHaveLength(2);
    fetchMock.mockResolvedValueOnce(Response.json({ ok: true, removed: 1 }));
    click(buttons(view())[0]); await settle();
    expect(buttons(view())).toHaveLength(1); expect(nodes(view()).some((node) => node.props.role === "alert")).toBe(false);
  });
});
