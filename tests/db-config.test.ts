import { describe, expect, it, vi } from "vitest";
import { isBusyError, poolConfig, waitOutBusy } from "@/lib/db";
import { Client, Pool, type PoolConfig } from "pg";
import { EventEmitter } from "node:events";

/** Construct the real driver without connecting: pg reparses the URL after poolConfig returns. */
function driverConfig(url: string, env: Record<string, string | undefined> = {}) {
  const client = new Client(poolConfig(url, env));
  return (client as unknown as { connectionParameters: { ssl: unknown; host: string; application_name: string; options: string } }).connectionParameters;
}

describe("database pool config", () => {
  it("talks plain to a database on loopback (the poller)", () => {
    for (const url of ["postgres://u:p@127.0.0.1:5432/db", "postgres://u:p@localhost/db", "postgres://u:p@[::1]:5432/db"]) {
      const c = poolConfig(url, {});
      expect(c.ssl).toBe(false);
      expect(c.max).toBe(8);
      expect(c.idleTimeoutMillis).toBe(10_000);
      expect(c.statement_timeout).toBe(30_000);
    }
  });

  it("verifies anything else against the pinned CA, with escaped newlines unfolded", () => {
    const c = poolConfig("postgres://u:p@203.0.113.7:5432/db", { DATABASE_CA: "-----BEGIN CERTIFICATE-----\\nabc\\n-----END CERTIFICATE-----" });
    expect(c.ssl).toEqual({ ca: "-----BEGIN CERTIFICATE-----\nabc\n-----END CERTIFICATE-----", rejectUnauthorized: true });
    expect(c.max).toBe(2);
    expect(c.idleTimeoutMillis).toBe(5_000);
    expect(c.statement_timeout).toBe(15_000);
  });

  it("fails closed without a CA: still verified, never plain", () => {
    const c = poolConfig("postgres://u:p@203.0.113.7:5432/db", {});
    expect(c.ssl).toEqual({ ca: undefined, rejectUnauthorized: true });
  });

  it("takes a pool size from the environment", () => {
    expect(poolConfig("postgres://u:p@203.0.113.7/db", { DATABASE_POOL_MAX: "5" }).max).toBe(5);
  });

  it.each(["shelfspring", "shelfspring_preview"])("reuses active local %s connections and retires idle ones before the server's 30s expiry", async (database) => {
    // Exercise the real pg pool timers with an offline transport, never a database.
    class OfflineClient extends EventEmitter {
      _queryable = true;
      _ending = false;
      connect(done: (error?: Error) => void) { done(); }
      end(done?: () => void) { this._ending = true; this.emit("end"); done?.(); }
    }
    vi.useFakeTimers();
    const pool = new Pool({ ...poolConfig(`postgres://u:p@127.0.0.1/${database}`, { DATABASE_POOL_MAX: "1" }),
      Client: OfflineClient as unknown as NonNullable<PoolConfig["Client"]> });
    try {
      const first = await pool.connect(); first.release();
      await vi.advanceTimersByTimeAsync(5_000);
      const productionTick = await pool.connect();
      expect(productionTick).toBe(first); productionTick.release();
      await vi.advanceTimersByTimeAsync(9_999);
      const previewTick = await pool.connect();
      expect(previewTick).toBe(first); previewTick.release();
      await vi.advanceTimersByTimeAsync(10_000);
      expect(pool.totalCount).toBe(0);
      const renewed = await pool.connect();
      expect(renewed).not.toBe(first); renewed.release();
    } finally { await pool.end(); vi.useRealTimers(); }
  });

  it.each(["sslmode=disable", "sslmode=no-verify", "ssl=0", "ssl=no-verify", "sslmode=require&uselibpqcompat=true", "sslrootcert=/missing-ca.pem&sslcert=/missing-cert.pem&sslkey=/missing-key.pem", "sslnegotiation=direct"])("keeps verified remote TLS after pg parses %s", (query) => {
    const c = driverConfig(`postgres://u:p@203.0.113.7/db?${query}`, { DATABASE_CA: "pinned-ca" });
    expect(c.ssl).toEqual({ ca: "pinned-ca", rejectUnauthorized: true });
    expect(c.host).toBe("203.0.113.7");
  });

  it("preserves ordinary driver options and the deliberate loopback policy", () => {
    const c = driverConfig("postgres://u:p@127.0.0.1/db?sslmode=require&application_name=local-feed&options=-c%20default_transaction_read_only%3Don");
    expect(c.ssl).toBe(false);
    expect(c.application_name).toBe("local-feed");
    expect(c.options).toBe("-c default_transaction_read_only=on");
  });

  it.each(["host=203.0.113.7", "user=other", "password=other", "port=6543", "dbname=other"])("refuses connection-target overrides: %s", (query) => {
    expect(() => driverConfig(`postgres://u:p@localhost/db?${query}`)).toThrow("connection target");
  });
});

describe("out of connection slots (53300) is waited out", () => {
  const busy = Object.assign(new Error('remaining connection slots are reserved for roles with privileges of the "pg_use_reserved_connections" role'), { code: "53300" });

  it("recognises the refusal, and only it", () => {
    expect(isBusyError(busy)).toBe(true);
    expect(isBusyError(new Error("sorry, too many clients already"))).toBe(true);
    expect(isBusyError({ code: "23505", message: "duplicate key" })).toBe(false);
  });

  it("retries after each backoff step, then succeeds", async () => {
    const waits: number[] = [];
    let n = 0;
    const out = await waitOutBusy(async () => { if (n++ < 2) throw busy; return "rows"; }, [1, 2, 3], async (ms) => { waits.push(ms); });
    expect(out).toBe("rows");
    expect(waits).toEqual([1, 2]);
  });

  it("gives up after the last step, and never retries another error", async () => {
    await expect(waitOutBusy(async () => { throw busy; }, [1, 2], async () => {})).rejects.toBe(busy);
    let n = 0;
    await expect(waitOutBusy(async () => { n++; throw new Error("syntax error"); }, [1, 2], async () => {})).rejects.toThrow("syntax error");
    expect(n).toBe(1);
  });
});
