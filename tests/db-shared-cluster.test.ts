import { afterEach, describe, expect, it, vi } from "vitest";
import type { Pool } from "pg";
import { chooseTarget, FailoverPool, poolConfig, sharedClusterMode, type DbProbe } from "@/lib/db";

afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });
const shared = { DATABASE_SHARED_CLUSTER: "pickupchecker" };
const p = (extra: Partial<DbProbe> = {}): DbProbe => ({ name: "primary", ok: true, ms: 1, recovery: false,
  host: "linode-1", owner: "linode-1", epoch: 1, ...extra });
function fakeTarget(name: "primary" | "standby", initial: Record<string, unknown>) {
  let row = initial;
  const query = vi.fn(async (sql: string) => {
    if (sql.includes("pg_is_in_recovery")) return { rows: [row] };
    return { rows: [{ ok: true }] };
  });
  return { target: { name, pool: { query } as unknown as Pool }, query, set: (next: Record<string, unknown>) => { row = next; } };
}
const authority = (extra: Record<string, unknown> = {}) => ({ recovery: false, host: "linode-1",
  cluster: { primary: "linode-1", epoch: 1 }, app_role: "shelfspring", app_schema: "shelfspring", ...extra });

describe("shared cluster identity and isolated roles", () => {
  it("only enables the fixed explicit cluster mode", () => {
    expect(sharedClusterMode({})).toBe(false);
    expect(sharedClusterMode(shared)).toBe(true);
    expect(() => sharedClusterMode({ DATABASE_SHARED_CLUSTER: "public;drop" })).toThrow("Invalid");
  });
  it.each(["shelfspring", "shelfspring_preview", "shelfspring_poller", "shelfspring_preview_poller"])("allows only namespaced %s on the shared database", (role) => {
    expect(poolConfig(`postgres://${role}:fixture@127.0.0.1/pickupchecker`, shared).ssl).toBe(false);
  });
  it.each(["postgres://poller:p@host.example/pickupchecker", "postgres://pickupchecker:p@host.example/pickupchecker",
    "postgres://shelfspring:p@host.example/shelfspring", "postgres://shelfspring:p@host.example/pickupchecker?options=-csearch_path%3Dpublic"])("refuses unsafe shared connection %s", (url) => {
    expect(() => poolConfig(url, shared)).toThrow();
  });
  it.each(["shelfspring", "shelfspring_preview", "shelfspring_poller", "shelfspring_preview_poller"])("probes original authority while %s keeps its private application schema", async (role) => {
    const schema = role.startsWith("shelfspring_preview") ? "shelfspring_preview" : "shelfspring";
    const target = fakeTarget("primary", authority({ app_role: role, app_schema: schema }));
    const router = new FailoverPool([target.target], true);
    await expect(router.query("select application_data")).resolves.toEqual({ rows: [{ ok: true }] });
    expect(target.query.mock.calls[0][0]).toContain("public.shelfspring_cluster_authority");
    expect(target.query.mock.calls[0][0]).toContain("current_setting('pickupchecker.host', true)");
    expect(target.query.mock.calls[0][0]).not.toContain("from poller_state");
    expect((await router.status()).writable).toBe(true);
  });
  it.each([{ host: null }, { cluster: null }, { cluster: { primary: "linode-1", epoch: "1" } },
    { cluster: { primary: "linode-1", epoch: 0 } }, { cluster: { primary: "linode-1", epoch: 1.5 } },
    { recovery: null }, { app_role: "poller" }, { app_schema: "public" }, { app_role: "shelfspring_preview" }])("refuses missing, malformed or wrongly scoped authority %j", async (extra) => {
    const target = fakeTarget("primary", authority(extra));
    const router = new FailoverPool([target.target], true);
    await expect(router.query("update application_data")).rejects.toThrow("authority unavailable");
    expect(target.query).toHaveBeenCalledTimes(1);
  });
  it("keeps standalone probe semantics unchanged", async () => {
    const target = fakeTarget("primary", { recovery: false, host: null, cluster: null });
    const router = new FailoverPool([target.target]);
    await router.query("select application_data");
    expect(target.query.mock.calls[0][0]).toContain("current_setting('shelfspring.host', true)");
    expect((await router.status()).writable).toBe(true);
  });
});

describe("shared cluster fencing", () => {
  it("follows higher authority epochs and refuses equal-epoch split ownership", () => {
    expect(chooseTarget([p(), p({ name: "standby", host: "linode-2", owner: "linode-2", epoch: 2 })], true)).toEqual({ index: 1, writable: true });
    expect(chooseTarget([p(), p({ name: "standby", host: "linode-2", owner: "linode-2" })], true)).toBeNull();
    expect(chooseTarget([p({ owner: "linode-2", epoch: 2 })], true)).toBeNull();
    expect(chooseTarget([p({ host: null })], true)).toBeNull();
  });
  it("permits a genuine replica for reads but never a lower-epoch writable server", () => {
    expect(chooseTarget([p(), p({ name: "standby", recovery: true, host: "linode-2", epoch: 2 })], true)).toEqual({ index: 1, writable: false });
  });
  it("waits for expired authority validation before a new application query", async () => {
    vi.useFakeTimers();
    const target = fakeTarget("primary", authority());
    const router = new FailoverPool([target.target], true);
    await router.query("select application_data");
    target.set(authority({ cluster: null }));
    vi.advanceTimersByTime(15_001);
    await expect(router.query("update application_data")).rejects.toThrow("authority unavailable");
    expect(target.query.mock.calls.filter(([sql]) => sql === "update application_data")).toHaveLength(0);
  });
  it("remembers an observed promotion if only the old writable primary returns", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const primary = fakeTarget("primary", authority());
    const standby = fakeTarget("standby", authority({ recovery: false, host: "linode-2", cluster: { primary: "linode-2", epoch: 2 } }));
    const router = new FailoverPool([primary.target, standby.target], true);
    await router.query("select application_data");
    expect((await router.status()).using).toBe("standby");
    standby.set(authority({ cluster: null }));
    await router.recheck();
    await expect(router.query("update application_data")).rejects.toThrow("no database answers");
    expect(primary.query.mock.calls.filter(([sql]) => sql === "update application_data")).toHaveLength(0);
  });
});
