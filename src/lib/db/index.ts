import { Pool, type PoolClient, type PoolConfig } from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { attachDatabasePool } from "@vercel/functions";
import * as schema from "./schema";

let _db: NodePgDatabase<typeof schema> | null = null;
let _router: FailoverPool | null = null;

/**
 * Postgres on the poller hosts. One small pool per database per process, created on first use so importing at
 * build time never connects. On Vercel the pools are attached to the function instance, which then lives long
 * enough to close idle connections instead of freezing with them open.
 *
 * Two databases when DATABASE_URL_STANDBY is set (project documentation「热备主机」): the primary and its streaming
 * replica on the second host. Every query goes to the one that is the cluster's primary right now (chooseTarget);
 * after a takeover that is the promoted replica, with no redeploy and no DNS change.
 */
export function db(): NodePgDatabase<typeof schema> {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const shared = sharedClusterMode();
  const targets: { name: DbTargetName; url: string }[] = [{ name: "primary", url }];
  if (process.env.DATABASE_URL_STANDBY) targets.push({ name: "standby", url: process.env.DATABASE_URL_STANDBY });
  if (shared && targets.some((target) => new URL(target.url).username !== new URL(url).username)) {
    throw new Error("Shared database targets must use the same isolated role");
  }
  const pools = targets.map((t) => {
    const pool = new Pool(poolConfig(t.url));
    // An idle connection the server closed (idle_session_timeout, a restart): the pool drops it and dials anew.
    pool.on("error", (e) => console.error(`[db] ${t.name}: idle connection closed: ${e.message}`));
    if (process.env.VERCEL) attachDatabasePool(pool);
    return { name: t.name, pool };
  });
  // A shared cluster must validate the original cluster authority even with one configured target.
  _router = pools.length > 1 || shared ? new FailoverPool(pools, shared) : null;
  // FailoverPool implements what drizzle uses of a Pool (query, connect); the cast is only for the type.
  _db = drizzle(_router ? (_router as unknown as Pool) : pools[0].pool, { schema });
  return _db;
}

/**
 * Loopback (the poller, next to the database) is plain; anything else is TLS verified against our own CA
 * (DATABASE_CA, PEM; "\n" escapes allowed) — without it the system roots are used and the handshake fails
 * closed rather than falling back to an unverified connection.
 */
export function poolConfig(url: string, env: Record<string, string | undefined> = process.env): PoolConfig {
  const parsed = new URL(url);
  if (sharedClusterMode(env)) {
    // Its own database "shelfspring" since 2026-11-10 (stock tables there are read-only foreign tables over PickupChecker's);
    // "pickupchecker" is the older layout with the private schemas inside the original database.
    if (!["/pickupchecker", "/shelfspring"].includes(parsed.pathname) || !sharedRoleSchema(parsed.username)) throw new Error("Shared database requires an isolated ShelfSpring role");
    // The role owns the search_path. Do not let URL options silently replace it with public.
    if ([...parsed.searchParams.keys()].some((key) => key.toLowerCase() === "options")) throw new Error("Shared database URL must use its role's schema settings");
  }
  // pg parses connectionString after the explicit config and lets URL options override it.
  // A host override could also turn our loopback/plain decision into a remote plaintext connection.
  const authorityOptions = new Set(["host", "hostaddr", "port", "user", "password", "database", "dbname"]);
  const tlsOptions = new Set(["ssl", "sslmode", "sslcert", "sslkey", "sslrootcert", "sslpassword", "sslnegotiation", "uselibpqcompat"]);
  for (const key of [...parsed.searchParams.keys()]) {
    if (authorityOptions.has(key.toLowerCase())) throw new Error("Database URL connection target must be specified in its authority, not query parameters");
    if (tlsOptions.has(key.toLowerCase())) parsed.searchParams.delete(key);
  }
  const host = parsed.hostname.replace(/^\[|\]$/g, "");
  const local = host === "localhost" || host === "127.0.0.1" || host === "::1";
  const ca = env.DATABASE_CA?.replace(/\\n/g, "\n").trim() || undefined;
  return {
    connectionString: parsed.toString(),
    // Remote = the site on Vercel (the poller hosts set DATABASE_POOL_MAX). 2, not 3: every warm function instance
    // keeps its pool, and on 11-04 ~20 instances × 3 + the pollers' 19 left 6 of the 87 ordinary slots free; the
    // two deploys that day doubled the fleet for a few minutes and ~1,500 page queries got 53300 (too many clients).
    max: Number(env.DATABASE_POOL_MAX) || (local ? 8 : 2),
    // Local roles expire server sessions at 30s. Retire an unused connection well
    // before that boundary so a feed tick cannot acquire it during server expiry.
    idleTimeoutMillis: local ? 10_000 : 5_000,
    connectionTimeoutMillis: 10_000,
    maxLifetimeSeconds: 600,
    keepAlive: true,
    // Nothing should wait forever: a page query that hangs holds a function open, a poller one stalls the sweep.
    statement_timeout: local ? 30_000 : 15_000,
    ssl: local ? false : { ca, rejectUnauthorized: true },
  };
}

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** An explicit, fixed mode; never interpolate an environment value into probe SQL. */
export function sharedClusterMode(env: Record<string, string | undefined> = process.env): boolean {
  if (!env.DATABASE_SHARED_CLUSTER) return false;
  if (env.DATABASE_SHARED_CLUSTER !== "pickupchecker") throw new Error("Invalid shared database cluster");
  return true;
}

function sharedRoleSchema(role: string): string | null {
  if (role === "shelfspring" || role === "shelfspring_poller") return "shelfspring";
  if (role === "shelfspring_preview" || role === "shelfspring_preview_poller") return "shelfspring_preview";
  return null;
}

/* ---------------- failover between the primary and the standby ---------------- */

export type DbTargetName = "primary" | "standby";

/** What one database says about itself (probe query below). */
export interface DbProbe {
  name: DbTargetName;
  ok: boolean;
  ms: number;
  /** pg_is_in_recovery(): true on a streaming replica. */
  recovery: boolean | null;
  /** The server's own host label (postgresql.conf shelfspring.host). */
  host: string | null;
  /** poller_state "cluster": which host is the primary, and the takeover count. */
  owner: string | null;
  epoch: number;
  error?: string;
}

/**
 * Pure: which database queries go to. Writable and calling itself the primary beats everything, the highest
 * epoch first (a takeover bumps it, so a promoted standby wins over an old primary that came back); an old
 * primary that has learnt it was replaced says so (owner ≠ its own host) and is never chosen. With no writable
 * database, a reachable one serves reads (the replica while the takeover is decided); null when none answers.
 */
export function chooseTarget(probes: DbProbe[], shared = false): { index: number; writable: boolean } | null {
  if (shared) {
    const valid = probes.map((probe, index) => ({ probe, index })).filter(({ probe: p }) => p.ok && validAuthority(p));
    const epoch = Math.max(...valid.map(({ probe }) => probe.epoch));
    const current = valid.filter(({ probe }) => probe.epoch === epoch);
    // Conflicting authorities at one epoch cannot authorize application writes.
    if (new Set(current.map(({ probe }) => probe.owner)).size !== 1) return null;
    const writable = current.filter(({ probe }) => probe.recovery === false && probe.owner === probe.host);
    if (writable.length > 1) return null;
    if (writable.length === 1) return { index: writable[0].index, writable: true };
    // A fenced server may still accept SQL writes. Never use it as a nominally read-only fallback.
    const replica = current.find(({ probe }) => probe.recovery === true);
    return replica ? { index: replica.index, writable: false } : null;
  }
  let best = -1;
  probes.forEach((p, i) => {
    if (!p.ok || p.recovery !== false) return;
    if (p.owner && p.host && p.owner !== p.host) return;
    if (best < 0 || p.epoch > probes[best].epoch) best = i;
  });
  if (best >= 0) return { index: best, writable: true };
  const readable = probes.findIndex((p) => p.ok);
  return readable >= 0 ? { index: readable, writable: false } : null;
}

/** Errors after which the choice is re-made and the query tried once more. */
export function isFailoverError(e: unknown): boolean {
  const err = e as { code?: string; message?: string };
  const code = err?.code ?? "";
  if (["ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND", "EHOSTUNREACH", "ECONNRESET", "EPIPE", "57P01", "57P02", "57P03", "25006", "08006", "08001", "08004"].includes(code)) return true;
  return /Connection terminated|timeout exceeded when trying to connect|read-only transaction|the database system is (starting up|shutting down|in recovery mode)/i.test(err?.message ?? "");
}

/**
 * The server is out of connection slots (53300: max_connections, or only the slots reserved for the poller role
 * are left). It passes in seconds as other instances' idle connections close, so it is waited out, not failed.
 */
export function isBusyError(e: unknown): boolean {
  const err = e as { code?: string; message?: string };
  return err?.code === "53300" || /too many clients|remaining connection slots are reserved/i.test(err?.message ?? "");
}

/** Waits before each retry of a query refused for want of a slot: about 3.5 s in all, then the error stands. */
export const BUSY_BACKOFF_MS = [250, 750, 1_000, 1_500];

/** Runs `run`, retrying a busy refusal after each BUSY_BACKOFF_MS wait (exported for the test). */
export async function waitOutBusy<T>(run: () => Promise<T>, backoff: number[] = BUSY_BACKOFF_MS, sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await run();
    } catch (e) {
      if (!isBusyError(e) || i >= backoff.length) throw e;
      await sleep(backoff[i]);
    }
  }
}

const PROBE_SQL = `select pg_is_in_recovery() as recovery, current_setting('shelfspring.host', true) as host,
  (select value from poller_state where key = 'cluster') as cluster`;
// Application queries use the role's shelfspring,public search_path. Authority must bypass that schema.
const SHARED_PROBE_SQL = `select pg_is_in_recovery() as recovery, current_setting('pickupchecker.host', true) as host,
  current_user as app_role, current_schema() as app_schema,
  (select value from public.shelfspring_cluster_authority) as cluster`;
function validAuthority(p: Pick<DbProbe, "host" | "owner" | "epoch">): boolean {
  const label = (value: string | null) => typeof value === "string" && /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$/.test(value);
  return label(p.host) && label(p.owner) && Number.isSafeInteger(p.epoch) && p.epoch >= 1;
}
/** How long a choice stands before it is checked again in the background. */
const PROBE_TTL_MS = 15_000;
const PROBE_TIMEOUT_MS = 2_000;

async function probe(name: DbTargetName, pool: Pool, shared: boolean): Promise<DbProbe> {
  const t0 = Date.now();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const r = await Promise.race([
      pool.query(shared ? SHARED_PROBE_SQL : PROBE_SQL),
      new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error(`no answer in ${PROBE_TIMEOUT_MS} ms`)), PROBE_TIMEOUT_MS); }),
    ]);
    const row = r.rows[0] as { recovery: boolean; host: string | null; cluster: { primary?: string; epoch?: number } | null; app_role?: string; app_schema?: string };
    const result: DbProbe = { name, ok: true, ms: Date.now() - t0, recovery: row.recovery, host: row.host || null, owner: row.cluster?.primary ?? null, epoch: Number(row.cluster?.epoch ?? 0) };
    if (shared && (!validAuthority(result) || typeof row.cluster?.epoch !== "number" || typeof row.recovery !== "boolean"
      || !row.app_role || !sharedRoleSchema(row.app_role) || row.app_schema !== sharedRoleSchema(row.app_role))) {
      throw new Error("Shared database cluster authority is missing or invalid");
    }
    return result;
  } catch (e) {
    return { name, ok: false, ms: Date.now() - t0, recovery: null, host: null, owner: null, epoch: -1,
      error: shared ? "Shared database cluster authority unavailable" : (e as Error).message };
  } finally { if (timeout) clearTimeout(timeout); }
}

/**
 * Looks like a pg Pool to drizzle (its transactions check the constructor name and call connect()), and sends
 * each query to the database chooseTarget picked. A choice stands for PROBE_TTL_MS, then is re-checked in the
 * background; a connection-level error re-checks at once and retries the query once.
 */
export class FailoverPool {
  private probes: DbProbe[] = [];
  private choice: { index: number; writable: boolean } | null = null;
  private checkedAt = 0;
  private pending: Promise<void> | null = null;
  private epochFloor = 0;
  constructor(readonly targets: { name: DbTargetName; pool: Pool }[], private readonly shared = false) {}

  private refresh(): Promise<void> {
    this.pending ??= Promise.all(this.targets.map((t) => probe(t.name, t.pool, this.shared))).then((probes) => {
      const before = this.choice?.index;
      if (this.shared) {
        this.epochFloor = Math.max(this.epochFloor, ...probes.filter((p) => p.ok).map((p) => p.epoch));
        // Once this process has observed a promotion, it cannot fall back to an older writable epoch.
        for (const p of probes) if (p.ok && p.epoch < this.epochFloor) p.ok = false;
      }
      this.probes = probes;
      this.choice = chooseTarget(probes, this.shared);
      this.checkedAt = Date.now();
      if (before != null && this.choice && before !== this.choice.index) console.warn(`[db] now using the ${this.targets[this.choice.index].name} database (${this.choice.writable ? "writable" : "read-only"})`);
    }).finally(() => { this.pending = null; });
    return this.pending;
  }

  private async pool(): Promise<Pool> {
    if (!this.choice) await this.refresh();
    else if (Date.now() - this.checkedAt > PROBE_TTL_MS) {
      // Never issue a new shared-cluster query on an expired authority while refreshing in the background.
      if (this.shared) await this.refresh(); else void this.refresh();
    }
    if (!this.choice) throw new Error(`no database answers: ${this.probes.map((p) => `${p.name} ${p.error ?? "?"}`).join("; ")}`);
    return this.targets[this.choice.index].pool;
  }

  async query(...args: unknown[]): Promise<unknown> {
    const run = () => waitOutBusy(async () => (await this.pool()).query(...(args as Parameters<Pool["query"]>)));
    try {
      return await run();
    } catch (e) {
      if (!isFailoverError(e)) throw e;
      await this.refresh();
      return run();
    }
  }

  async connect(): Promise<PoolClient> {
    return waitOutBusy(async () => (await this.pool()).connect());
  }

  recheck(): Promise<void> {
    return this.refresh();
  }

  /** The latest probes and choice (health checks; triggers a probe when none was made yet). */
  async status(): Promise<{ probes: DbProbe[]; using: DbTargetName | null; writable: boolean }> {
    if (!this.choice || Date.now() - this.checkedAt > PROBE_TTL_MS) await this.refresh();
    return { probes: this.probes, using: this.choice ? this.targets[this.choice.index].name : null, writable: Boolean(this.choice?.writable) };
  }

}

/** One database by name, bypassing the choice (the standby's takeover and the old primary's fence need exactly that one). */
export function targetPool(name: DbTargetName): Pool | null {
  db();
  return _router?.targets.find((t) => t.name === name)?.pool ?? null;
}

/** Make every query re-check which database is the primary now (after a promotion or a fence). */
export async function recheckDatabases(): Promise<void> {
  if (_router) await _router.recheck();
}

/** Both databases as this process sees them; null with a single database configured. */
export async function dbStatus(): Promise<Awaited<ReturnType<FailoverPool["status"]>> | null> {
  db();
  return _router ? _router.status() : null;
}

export { schema };
