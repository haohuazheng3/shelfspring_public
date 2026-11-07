/** A private session lock fences duplicate workers; the existing cluster remains the sole authority. */
import { Client } from "pg";
import { dbStatus, poolConfig, recheckDatabases, type DbProbe, type DbTargetName } from "../db";
import { previewInventoryMode } from "./inventory-mode";

export interface LeaderStatus { using: DbTargetName | null; writable: boolean; probes: DbProbe[] }
export function sharedLeaderTarget(status: LeaderStatus | null, host: string | undefined): { target: DbTargetName; epoch: number } | null {
  if (!host || !["linode-1", "linode-2"].includes(host) || !status?.writable || !status.using) return null;
  const probe = status.probes.find((p) => p.name === status.using);
  if (!probe?.ok || probe.recovery !== false || probe.host !== host || probe.owner !== host
    || !Number.isSafeInteger(probe.epoch) || probe.epoch < 0) return null;
  return { target: status.using, epoch: probe.epoch };
}

export interface LeaderConnection {
  query(text: string, values?: string[]): Promise<{ rows: Record<string, unknown>[] }>;
  end(): Promise<void>;
  onError(listener: () => void): void;
}
export interface LeaderDependencies {
  status(): Promise<LeaderStatus | null>;
  connect(target: DbTargetName): Promise<LeaderConnection>;
}

/** One dedicated connection, outside the query pool, so a one-slot query pool cannot deadlock. */
export class SharedInventoryLeader {
  private connection: LeaderConnection | null = null;
  private generation: { target: DbTargetName; epoch: number } | null = null;
  private alive = false;
  private readonly schema: string;
  private readonly dependencies: LeaderDependencies;
  constructor(private readonly env: Record<string, string | undefined> = process.env, dependencies?: LeaderDependencies) {
    this.schema = previewInventoryMode(env) ? "shelfspring_preview" : "shelfspring";
    this.dependencies = dependencies ?? {
      status: async () => { await recheckDatabases(); return dbStatus(); },
      connect: async (target) => {
        const url = target === "primary" ? env.DATABASE_URL : env.DATABASE_URL_STANDBY;
        if (!url) throw new Error("Shared worker database target is missing");
        const client = new Client({ ...poolConfig(url, env), application_name: "shelfspring-private-worker-lock",
          statement_timeout: 3_000, query_timeout: 5_000 });
        try { await client.connect(); } catch (error) { await client.end(); throw error; }
        return { query: (text, values) => client.query(text, values), end: () => client.end(),
          onError: (listener) => { client.on("error", listener); } };
      },
    };
  }

  /** Re-probes authority even when already held; call again immediately before notification dispatch. */
  async check(allowAcquisition = true): Promise<{ leader: boolean; acquired: boolean }> {
    try {
      const next = sharedLeaderTarget(await this.dependencies.status(), this.env.HOST_LABEL);
      if (!next) { await this.release(); return { leader: false, acquired: false }; }
      if (this.connection && (!this.alive || next.target !== this.generation?.target || next.epoch !== this.generation?.epoch)) await this.release();
      if (this.connection) {
        const result = await this.connection.query("SELECT pg_is_in_recovery() AS recovery");
        if (result.rows[0]?.recovery === false && this.alive) return { leader: true, acquired: false };
        await this.release();
        return { leader: false, acquired: false };
      }
      if (!allowAcquisition) return { leader: false, acquired: false };
      const client = await this.dependencies.connect(next.target);
      this.connection = client;
      this.alive = true;
      client.onError(() => { if (this.connection === client) this.alive = false; });
      const identity = await client.query("SELECT current_schema() AS schema, current_user AS role, pg_is_in_recovery() AS recovery");
      const row = identity.rows[0];
      if (row?.schema !== this.schema || ![this.schema, `${this.schema}_poller`].includes(String(row.role)) || row.recovery !== false) {
        await this.release(); return { leader: false, acquired: false };
      }
      const lock = await client.query("SELECT pg_try_advisory_lock(hashtext('shelfspring-private-worker'), hashtext($1)) AS acquired", [this.schema]);
      const fresh = sharedLeaderTarget(await this.dependencies.status(), this.env.HOST_LABEL);
      if (!lock.rows[0]?.acquired || !this.alive || fresh?.target !== next.target || fresh.epoch !== next.epoch) {
        await this.release(); return { leader: false, acquired: false };
      }
      this.generation = next;
      return { leader: true, acquired: true };
    } catch {
      // No authority means no ownership: a follower must not write errors or mutate claims.
      // Its missing heartbeat is diagnosed by the existing health/freshness checks.
      await this.release();
      return { leader: false, acquired: false };
    }
  }

  async release() {
    const client = this.connection;
    this.connection = null; this.generation = null; this.alive = false;
    if (client) await client.end().catch(() => undefined); // Closing releases only this session's private lock.
  }
}
