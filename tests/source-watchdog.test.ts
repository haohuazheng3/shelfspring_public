import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  heartbeat: null as null | { value: { at: string; mode: string; host: string }; updatedAt: Date },
  freshPairs: 100,
  values: new Map<string, unknown>(),
  mails: [] as string[],
  fallbackCalls: 0,
  expiryCalls: 0,
}));
vi.mock("@/lib/stock/sweep", () => ({
  readState: async (key: string) => key === "heartbeat" ? state.heartbeat : state.values.has(key) ? { value: state.values.get(key), updatedAt: new Date() } : null,
  writeState: async (key: string, value: unknown) => { state.values.set(key, value); },
}));
vi.mock("@/lib/stock/source-sync", () => ({ expireSourceInventory: async () => { state.expiryCalls++; return 0; } }));
vi.mock("@/lib/stock/degraded", () => ({ degradedTick: async () => { state.fallbackCalls++; return {}; } }));
vi.mock("@/lib/mail/owner", () => ({ notifyOwner: async (subject: string) => { state.mails.push(subject); } }));
vi.mock("@/lib/ops", () => ({ logOps: async () => undefined }));
vi.mock("@/lib/errors", () => ({ recordError: async () => undefined, errorMessage: (e: unknown) => String(e) }));
vi.mock("@/lib/stock/cluster", () => ({
  intlRunner: async () => null, readAlive: async () => [], standbyVerdict: () => ({ state: "none" }), workerVerdict: () => ({ state: "none" }),
}));
vi.mock("@/lib/stock/fallback", async (importOriginal) => ({
  ...await importOriginal<typeof import("../src/lib/stock/fallback")>(),
  freshness: async () => ({ pairs: 100, freshPairs: state.freshPairs, stores: 269, staleStores: [], oldestSec: 5 }),
}));
import { GET } from "@/app/api/cron/watchdog/route";
const run = () => GET(new Request("https://shelfspring.com/api/cron/watchdog", { headers: { authorization: "Bearer test-cron" } }));

beforeEach(() => {
  vi.stubEnv("CRON_SECRET", "test-cron"); vi.stubEnv("INVENTORY_FEED_MODE", "source");
  state.heartbeat = { value: { at: new Date(Date.now() - 120_000).toISOString(), mode: "source-sync", host: "new-host" }, updatedAt: new Date() };
  state.values.clear(); state.mails = []; state.fallbackCalls = 0; state.freshPairs = 100; state.expiryCalls = 0;
});

describe("source-feed watchdog isolation", () => {
  it("diagnoses stale shared stock without changing inventory or starting collection", async () => {
    vi.stubEnv("INVENTORY_FEED_MODE", "shared"); state.heartbeat!.value.mode = "shared";
    state.heartbeat!.value.at = new Date().toISOString(); state.freshPairs = 10;
    expect(await (await run()).json()).toMatchObject({ mode: "shared", state: "blind", degraded: false });
    vi.stubEnv("INVENTORY_FEED_MODE", "");
    await run();
    expect(state.expiryCalls).toBe(0); expect(state.fallbackCalls).toBe(0);
    expect(state.mails).toHaveLength(1);
  });
  it("debounces a silent feed and alerts without ever starting fallback polling", async () => {
    expect(await (await run()).json()).toMatchObject({ state: "silent", sourceOnly: true, degraded: false });
    await run();
    expect(state.mails).toEqual(["[ShelfSpring] Inventory feed needs attention"]);
    expect(state.fallbackCalls).toBe(0);
    expect(state.expiryCalls).toBe(2);
  });
  it("does not poll Apple when the source has never written a heartbeat", async () => {
    state.heartbeat = null;
    expect(await (await run()).json()).toMatchObject({ mode: "source-sync", state: "silent", degraded: false });
    expect(state.fallbackCalls).toBe(0);
  });
  it("keeps the heartbeat safety guard when the environment flag is absent", async () => {
    vi.stubEnv("INVENTORY_FEED_MODE", "");
    expect(await (await run()).json()).toMatchObject({ sourceOnly: true, degraded: false });
    expect(state.fallbackCalls).toBe(0);
  });
  it("alerts on fresh heartbeats carrying stale inventory", async () => {
    state.heartbeat!.value.at = new Date().toISOString(); state.freshPairs = 10;
    expect(await (await run()).json()).toMatchObject({ state: "blind", degraded: false });
    await run();
    expect(state.mails).toHaveLength(1);
    expect(state.fallbackCalls).toBe(0);
  });
  it("sends one recovery notice only after five good observations", async () => {
    await run(); await run();
    state.heartbeat!.value.at = new Date().toISOString();
    for (let i = 0; i < 4; i++) await run();
    expect(state.mails).toHaveLength(1);
    await run();
    expect(state.mails).toEqual(["[ShelfSpring] Inventory feed needs attention", "[ShelfSpring] Inventory feed recovered"]);
    expect(state.fallbackCalls).toBe(0);
  });
  it("preserves fallback polling for the original independent-poller mode", async () => {
    vi.stubEnv("INVENTORY_FEED_MODE", "poller"); state.heartbeat!.value.mode = "full";
    expect(await (await run()).json()).toMatchObject({ state: "silent", degraded: true });
    expect(state.fallbackCalls).toBe(1);
    expect(state.expiryCalls).toBe(0);
  });
});
