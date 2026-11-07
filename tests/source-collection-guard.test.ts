import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
const state = vi.hoisted(() => ({
  mode: undefined as string | undefined,
  reads: vi.fn(), build: vi.fn(), sweep: vi.fn(), writes: vi.fn(), order: vi.fn(),
}));
vi.mock("@/lib/stock/sweep", () => ({
  readState: async (key: string) => { state.reads(key); return key === "heartbeat" && state.mode ? { value: { mode: state.mode } } : null; },
  buildTasks: () => { state.build(); return [{ anchor: { location: "10001" }, batchIndex: 0 }]; },
  runSweep: async (options: unknown) => { state.sweep(options); return { requests: 1, failures: 0, exhausted: false }; },
  singleIdentityEgress: () => ({ state: { used: 1 } }),
  writeState: async (...args: unknown[]) => { state.writes(...args); },
}));
vi.mock("@/lib/stock/fallback", () => ({ fallbackOrder: async (tasks: unknown) => { state.order(); return tasks; } }));
vi.mock("@/lib/errors", () => ({ recordError: vi.fn(), errorMessage: (e: unknown) => String(e) }));
import { degradedTick } from "@/lib/stock/degraded";
import { POST as tick } from "@/app/api/poll/tick/route";
import { POST as egress } from "@/app/api/egress/apple/route";
import { fetchPickup, fetchPickupAtStore } from "@/lib/apple/client";
const request = (path: string, token = "fixture-token") => new Request(`https://shelfspring.com/api/${path}`, {
  method: "POST", headers: { authorization: `Bearer ${token}` },
  body: JSON.stringify({ parts: ["MJQ34LL/A"], store: "R001" }),
});
beforeEach(() => {
  vi.clearAllMocks(); state.mode = undefined;
  vi.stubEnv("INVENTORY_FEED_MODE", "source"); vi.stubEnv("POLLER_TOKEN", "fixture-token"); vi.stubEnv("CRON_SECRET", "fixture-cron");
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("source inventory never triggers direct Apple collection", () => {
  it("fences the manual poll route before tasks, budget writes or collection", async () => {
    const response = await tick(request("poll/tick"));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ skipped: "source-mode", requests: 0 });
    expect(state.reads).not.toHaveBeenCalled();
    expect(state.build).not.toHaveBeenCalled(); expect(state.sweep).not.toHaveBeenCalled(); expect(state.writes).not.toHaveBeenCalled();
  });
  it("also fences direct degraded calls using a persisted source heartbeat when the flag is absent", async () => {
    vi.stubEnv("INVENTORY_FEED_MODE", ""); state.mode = "source-sync";
    expect(await degradedTick()).toMatchObject({ requests: 0, skipped: "source-mode" });
    expect(state.reads).toHaveBeenCalledExactlyOnceWith("heartbeat");
    expect(state.sweep).not.toHaveBeenCalled(); expect(state.writes).not.toHaveBeenCalled();
  });
  it("refuses the Vercel Apple egress route, including the heartbeat-only fence", async () => {
    const network = vi.fn(); vi.stubGlobal("fetch", network);
    expect((await egress(request("egress/apple"))).status).toBe(409);
    vi.stubEnv("INVENTORY_FEED_MODE", ""); state.mode = "source-sync";
    expect((await egress(request("egress/apple"))).status).toBe(409);
    expect(network).not.toHaveBeenCalled();
  });
  it("blocks both client entry points even if a future caller bypasses route guards", async () => {
    const network = vi.fn();
    await expect(fetchPickup(["MJQ34LL/A"], "10001", network)).rejects.toThrow("disabled in source inventory mode");
    await expect(fetchPickupAtStore(["MJQ34LL/A"], "R001", network)).rejects.toThrow("disabled in source inventory mode");
    expect(network).not.toHaveBeenCalled();
  });
  it("fences shared database mode at manual, egress and direct client boundaries", async () => {
    vi.stubEnv("INVENTORY_FEED_MODE", "shared");
    const network = vi.fn(); vi.stubGlobal("fetch", network);
    expect(await (await tick(request("poll/tick"))).json()).toMatchObject({ skipped: "source-mode" });
    expect((await egress(request("egress/apple"))).status).toBe(409);
    await expect(fetchPickup(["MJQ34LL/A"], "10001", network)).rejects.toThrow("disabled");
    await expect(fetchPickupAtStore(["MJQ34LL/A"], "R001", network)).rejects.toThrow("disabled");
    vi.stubEnv("INVENTORY_FEED_MODE", ""); state.mode = "shared";
    expect(await degradedTick()).toMatchObject({ skipped: "source-mode" });
    expect(network).not.toHaveBeenCalled(); expect(state.sweep).not.toHaveBeenCalled(); expect(state.writes).not.toHaveBeenCalled();
  });
  it("retains authentication before revealing mode or running any checks", async () => {
    expect((await tick(request("poll/tick", "wrong"))).status).toBe(401);
    expect((await egress(request("egress/apple", "wrong"))).status).toBe(401);
    expect(state.reads).not.toHaveBeenCalled(); expect(state.sweep).not.toHaveBeenCalled();
  });
  it("preserves independent poller mode and its egress behavior", async () => {
    vi.stubEnv("INVENTORY_FEED_MODE", "poller"); state.mode = "full";
    expect(await degradedTick(2)).toEqual({ requests: 1, failures: 0, exhausted: false, first: "10001#0" });
    expect(state.sweep).toHaveBeenCalledOnce(); expect(state.writes).toHaveBeenCalledOnce();
    const network = vi.fn(async () => ({ status: 200, text: async () => JSON.stringify({ body: { stores: [] } }) }));
    vi.stubGlobal("fetch", network);
    expect((await egress(request("egress/apple"))).status).toBe(200);
    expect(network).toHaveBeenCalledOnce();
  });
  it("fences the standalone collector before its startup side effects", () => {
    const source = readFileSync("poller/main.ts", "utf8");
    expect(source).toMatch(/async function main\(\) \{\s*if \(\["source", "shared"\]\.includes\(process\.env\.INVENTORY_FEED_MODE \?\? ""\)\) throw/);
  });
});
