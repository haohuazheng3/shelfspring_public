/**
 * A one-way, read-only inventory feed. The source is never passed to db() or the stock engine.
 * Only three public inventory tables are read; identities, billing, watches and messages stay separate.
 * ID allocation is not commit order: the fast cursor is backed by a recent overlap and a rotating audit.
 */
import { randomUUID } from "node:crypto";
import { Pool, type PoolClient, type PoolConfig } from "pg";
import { sql } from "drizzle-orm";
import { db } from "../db";
import type { Transition } from "./ingest";
import { previewInventoryMode } from "./inventory-mode";

export interface SourceEvent {
  id: string;
  store_number: string;
  part_number: string;
  kind: "restock" | "soldout";
  quote: string | null;
  at: Date;
  first_seen: boolean;
  seen_until: Date | null;
}
export interface SourceStatus {
  store_number: string;
  part_number: string;
  status: string;
  quote: string | null;
  since: Date | null;
  last_checked_at: Date | null;
  last_changed_at: Date | null;
  last_available_at: Date | null;
}
export interface SourceReport {
  id: string;
  store_number: string;
  part_number: string;
  at: Date;
  source: string;
  source_url: string | null;
  kind: string;
  imported_at: Date;
}
export interface SyncState {
  version: 1;
  cutoverAt: string;
  highWater: string;
  reconcileAfter: string;
  lastSuccessAt: string;
  lastStatusAt: string;
  lastReportAt: string;
  importedEvents: number;
  importedStatuses: number;
  importedReports: number;
  lastHistoryRepair?: { at: string; events: number; statuses: number; reports: number };
}
export interface SyncOptions {
  source: string;
  batchSize: number;
  maxBatches: number;
  intervalMs: number;
  statusIntervalMs: number;
  reportIntervalMs: number;
  overlapIds: number;
  overlapMs: number;
  maxAlertAgeMs: number;
  host: string;
  notificationsEnabled: boolean;
}
export function syncOptions(env: Record<string, string | undefined> = process.env): SyncOptions {
  const number = (key: string, fallback: number, min: number, max: number) => {
    const value = Number(env[key] ?? fallback);
    if (!Number.isFinite(value) || value < min || value > max) throw new Error(`Invalid ${key}`);
    return Math.floor(value);
  };
  const preview = previewInventoryMode(env);
  const source = env.INVENTORY_SOURCE_KEY || (preview ? "shelfspring-production" : "pickupchecker");
  if (!/^[a-z0-9_-]{1,64}$/.test(source)) throw new Error("Invalid INVENTORY_SOURCE_KEY");
  if (preview && source !== "shelfspring-production") throw new Error("Preview inventory requires its own source key");
  return {
    source,
    notificationsEnabled: !preview,
    batchSize: number("INVENTORY_SYNC_BATCH_SIZE", 500, 1, 2_000),
    maxBatches: number("INVENTORY_SYNC_MAX_BATCHES", 10, 1, 100),
    // Preview copies the new host's local public inventory. A second 30-second hop can
    // push genuine source observations beyond the unchanged 60-second freshness check.
    intervalMs: preview ? 10_000 : number("INVENTORY_SYNC_INTERVAL_MS", 5_000, 2_000, 60_000),
    statusIntervalMs: preview ? 10_000 : number("INVENTORY_STATUS_INTERVAL_MS", 30_000, 2_000, 60_000),
    reportIntervalMs: number("INVENTORY_REPORT_INTERVAL_MS", 900_000, 60_000, 86_400_000),
    overlapIds: number("INVENTORY_SYNC_OVERLAP_IDS", 256, 1, 10_000),
    overlapMs: number("INVENTORY_SYNC_OVERLAP_MS", 120_000, 10_000, 3_600_000),
    maxAlertAgeMs: number("INVENTORY_ALERT_MAX_AGE_MS", 60_000, 5_000, 120_000),
    host: env.HOST_LABEL || "shelfspring-source-sync",
  };
}

/** Never include connection strings, query parameters, row data or raw database errors in logs. */
export function safeSyncError(error: unknown): string {
  const code = (error as { code?: unknown; cause?: { code?: unknown } })?.code
    ?? (error as { cause?: { code?: unknown } })?.cause?.code;
  return `Inventory sync failed${typeof code === "string" && /^[A-Z0-9_]{2,30}$/.test(code) ? ` (${code})` : ""}`;
}

export function sourcePoolConfig(env: Record<string, string | undefined> = process.env): PoolConfig {
  if (!env.INVENTORY_SOURCE_DATABASE_URL || !env.DATABASE_URL) throw new Error("Inventory source and destination URLs are required");
  let source: URL;
  try { source = new URL(env.INVENTORY_SOURCE_DATABASE_URL); } catch { throw new Error("Invalid inventory source URL"); }
  if (!["postgres:", "postgresql:"].includes(source.protocol)) throw new Error("Invalid inventory source protocol");
  const identity = (url: URL) => `${url.hostname.toLowerCase().replace(/^\[|\]$/g, "")}:${url.port || "5432"}${url.pathname}`;
  if (previewInventoryMode(env)) {
    const local = (url: URL) => ["127.0.0.1", "localhost", "::1"].includes(url.hostname.replace(/^\[|\]$/g, "")) && (!url.port || url.port === "5432");
    const destination = new URL(env.DATABASE_URL);
    if (!local(source) || source.pathname !== "/shelfspring" || source.username !== "shelfspring_inventory_reader"
      || !local(destination) || destination.pathname !== "/shelfspring_preview" || destination.username !== "shelfspring_preview"
      || env.DATABASE_URL_STANDBY || env.DATABASE_URL_UNPOOLED) {
      throw new Error("Preview inventory must use the isolated local source reader and preview database");
    }
  }
  for (const target of [env.DATABASE_URL, env.DATABASE_URL_UNPOOLED, env.DATABASE_URL_STANDBY].filter(Boolean)) {
    let dest: URL;
    try { dest = new URL(target!); } catch { throw new Error("Invalid inventory destination URL"); }
    if (identity(dest) === identity(source)) throw new Error("Inventory source must be a separate database");
  }
  // pg's URL parser can override explicit TLS/options settings. Discard all source query overrides.
  source.search = "";
  const local = ["localhost", "127.0.0.1", "::1"].includes(source.hostname.replace(/^\[|\]$/g, ""));
  return {
    connectionString: source.toString(),
    max: 1,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 10_000,
    maxLifetimeSeconds: 600,
    keepAlive: true,
    statement_timeout: 15_000,
    query_timeout: 20_000,
    application_name: "shelfspring-inventory-readonly",
    options: "-c default_transaction_read_only=on -c statement_timeout=15000 -c lock_timeout=2000 -c idle_in_transaction_session_timeout=60000",
    ssl: local ? false : { rejectUnauthorized: true, ca: env.INVENTORY_SOURCE_DATABASE_CA?.replace(/\\n/g, "\n").trim() || undefined },
  };
}

export interface InventorySnapshot {
  now(): Promise<Date>;
  events(after: string, limit: number): Promise<SourceEvent[]>;
  overlap(highWater: string, since: Date, overlapIds: number, limit: number): Promise<SourceEvent[]>;
  statuses(batchSize: number, consume: (rows: SourceStatus[]) => Promise<void>): Promise<void>;
  statusesFor(events: SourceEvent[]): Promise<SourceStatus[]>;
  reports(after: string, limit: number): Promise<SourceReport[]>;
}
export interface InventoryReader {
  snapshot<T>(run: (source: InventorySnapshot) => Promise<T>): Promise<T>;
}
const EVENT_COLUMNS = "id::text, store_number, part_number, kind, quote, at, first_seen, seen_until";
const STATUS_COLUMNS = "store_number, part_number, status, quote, since, last_checked_at, last_changed_at, last_available_at";

export class ReadonlyInventorySource implements InventoryReader {
  readonly pool: Pool;
  constructor(env: Record<string, string | undefined> = process.env) {
    this.pool = new Pool(sourcePoolConfig(env));
    // A closed idle connection is discarded by pg. Do not print a raw error containing connection details.
    this.pool.on("error", () => console.warn("[inventory-source] idle connection closed"));
  }
  async snapshot<T>(run: (source: InventorySnapshot) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
      const mode = await client.query<{ transaction_read_only: string }>("SHOW transaction_read_only");
      if (mode.rows[0]?.transaction_read_only !== "on") throw new Error("Inventory source is not read only");
      const result = await run(new PgInventorySnapshot(client));
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally { client.release(); }
  }
  async close() { await this.pool.end(); }
}

class PgInventorySnapshot implements InventorySnapshot {
  constructor(private readonly client: PoolClient) {}
  async now() { return (await this.client.query<{ at: Date }>("SELECT clock_timestamp() AS at")).rows[0].at; }
  async events(after: string, limit: number) {
    // id::text is transport-only. ORDER BY the underlying numeric column, never its output alias.
    return (await this.client.query<SourceEvent>(`SELECT ${EVENT_COLUMNS} FROM availability_events WHERE id > $1::bigint ORDER BY availability_events.id LIMIT $2`, [after, limit])).rows;
  }
  async overlap(highWater: string, since: Date, overlapIds: number, limit: number) {
    return (await this.client.query<SourceEvent>(`SELECT ${EVENT_COLUMNS} FROM availability_events
      WHERE id <= $1::bigint AND (id > $1::bigint - $2::bigint OR at >= $3)
      ORDER BY availability_events.id DESC LIMIT $4`, [highWater, overlapIds, since, limit])).rows;
  }
  async statuses(batchSize: number, consume: (rows: SourceStatus[]) => Promise<void>) {
    let store = "", part = "";
    for (;;) {
      const rows = (await this.client.query<SourceStatus>(`SELECT ${STATUS_COLUMNS} FROM store_sku_status
        WHERE (store_number, part_number) > ($1, $2) ORDER BY store_number, part_number LIMIT $3`, [store, part, batchSize])).rows;
      if (!rows.length) return;
      await consume(rows);
      store = rows[rows.length - 1].store_number;
      part = rows[rows.length - 1].part_number;
      if (rows.length < batchSize) return;
    }
  }
  async statusesFor(events: SourceEvent[]) {
    if (!events.length) return [];
    return (await this.client.query<SourceStatus>(`SELECT ${STATUS_COLUMNS} FROM store_sku_status
      WHERE (store_number, part_number) IN (SELECT store_number, part_number FROM jsonb_to_recordset($1::jsonb)
      AS x(store_number text, part_number text))`, [JSON.stringify(events.map((e) => ({ store_number: e.store_number, part_number: e.part_number })))])).rows;
  }
  async reports(after: string, limit: number) {
    return (await this.client.query<SourceReport>(`SELECT id::text, store_number, part_number, at, source, source_url, kind, imported_at
      FROM restock_reports WHERE id > $1::bigint ORDER BY restock_reports.id LIMIT $2`, [after, limit])).rows;
  }
}

export interface EventPolicy { mode: "history" | "live" | "preview"; now: Date; cutoverAt: Date; maxAgeMs: number }
export function notificationDecision(event: SourceEvent, policy: EventPolicy): { status: "pending" | "suppressed"; reason: string | null } {
  if (policy.mode === "preview") return { status: "suppressed", reason: "preview-inventory" };
  if (policy.mode === "history") return { status: "suppressed", reason: "history" };
  if (event.kind !== "restock" || event.first_seen) return { status: "suppressed", reason: "not-confirmed-restock" };
  if (event.at < policy.cutoverAt) return { status: "suppressed", reason: "before-cutover" };
  const age = policy.now.getTime() - event.at.getTime();
  if (age < -5_000 || age > policy.maxAgeMs) return { status: "suppressed", reason: "outside-live-window" };
  return { status: "pending", reason: null };
}
export interface InventoryWriter {
  state(): Promise<SyncState | null>;
  events(rows: SourceEvent[], policy: EventPolicy): Promise<void>;
  statuses(rows: SourceStatus[]): Promise<void>;
  reports(rows: SourceReport[]): Promise<void>;
  save(state: SyncState, options: SyncOptions): Promise<void>;
}
export interface InventoryDestination {
  /** The adapter must hold an exclusive feed lock and commit all rows and cursors together. */
  transaction<T>(source: string, run: (destination: InventoryWriter) => Promise<T>): Promise<T>;
}
export interface SyncResult { imported: boolean; repaired?: boolean; events: number; statuses: number; reports: number; state: SyncState }

/** A complete consistent snapshot commits atomically at the destination and NEVER calls a notifier. */
export async function importInventoryHistory(reader: InventoryReader, destination: InventoryDestination, options: SyncOptions, operation: { repair?: boolean } = {}): Promise<SyncResult> {
  return destination.transaction(options.source, async (target) => {
    const existing = await target.state();
    if (operation.repair && !existing) throw new Error("Import inventory history before repairing it");
    if (existing && !operation.repair) return { imported: false, events: 0, statuses: 0, reports: 0, state: existing };
    return reader.snapshot(async (source) => {
      const started = await source.now();
      const policy: EventPolicy = { mode: "history", now: started, cutoverAt: started, maxAgeMs: options.maxAlertAgeMs };
      let highWater = "0", events = 0, statuses = 0, reports = 0, reportId = "0";
      for (;;) {
        const batch = await source.events(highWater, options.batchSize);
        if (!batch.length) break;
        await target.events(batch, policy);
        events += batch.length;
        highWater = batch[batch.length - 1].id;
        if (batch.length < options.batchSize) break;
      }
      await source.statuses(options.batchSize, async (batch) => { await target.statuses(batch); statuses += batch.length; });
      for (;;) {
        const batch = await source.reports(reportId, options.batchSize);
        if (!batch.length) break;
        await target.reports(batch);
        reports += batch.length;
        reportId = batch[batch.length - 1].id;
        if (batch.length < options.batchSize) break;
      }
      // clock_timestamp at the END, not transaction_timestamp: arrivals during a lengthy import are catch-up.
      const cutover = await source.now();
      const state: SyncState = existing ? {
        ...existing, // Preserve the original cutover and its historical run counters.
        highWater: BigInt(highWater) > BigInt(existing.highWater) ? highWater : existing.highWater,
        reconcileAfter: "0", lastSuccessAt: cutover.toISOString(), lastStatusAt: started.toISOString(), lastReportAt: started.toISOString(),
        lastHistoryRepair: { at: cutover.toISOString(), events, statuses, reports },
      } : { version: 1, cutoverAt: cutover.toISOString(), highWater, reconcileAfter: "0",
        lastSuccessAt: cutover.toISOString(), lastStatusAt: started.toISOString(), lastReportAt: started.toISOString(),
        importedEvents: events, importedStatuses: statuses, importedReports: reports };
      await target.save(state, options);
      return { imported: true, repaired: Boolean(existing), events, statuses, reports, state };
    });
  });
}

export async function syncInventoryOnce(reader: InventoryReader, destination: InventoryDestination, options: SyncOptions): Promise<SyncResult> {
  return destination.transaction(options.source, async (target) => {
    const state = await target.state();
    if (!state) throw new Error("Run import-inventory-history before starting inventory sync");
    return reader.snapshot(async (source) => {
      const now = await source.now();
      const next = { ...state };
      const policy: EventPolicy = { mode: options.notificationsEnabled ? "live" : "preview", now, cutoverAt: new Date(state.cutoverAt), maxAgeMs: options.maxAlertAgeMs };
      let events = 0, statuses = 0, reports = 0;
      const accept = async (batch: SourceEvent[]) => {
        if (!batch.length) return;
        await target.events(batch, policy);
        const stock = await source.statusesFor(batch);
        await target.statuses(stock);
        events += batch.length;
        statuses += stock.length;
      };
      for (let i = 0; i < options.maxBatches; i++) {
        const batch = await source.events(next.highWater, options.batchSize);
        if (!batch.length) break;
        await accept(batch);
        next.highWater = batch[batch.length - 1].id;
        if (batch.length < options.batchSize) break;
      }
      await accept(await source.overlap(next.highWater, new Date(now.getTime() - options.overlapMs), options.overlapIds, options.batchSize));
      // A rotating complete scan catches arbitrarily late commits and changes to old seen_until values.
      const audit = await source.events(state.reconcileAfter, options.batchSize);
      await accept(audit);
      next.reconcileAfter = audit.length === options.batchSize ? audit[audit.length - 1].id : "0";
      // A status cadence at or below the loop cadence means every tick. Comparing two
      // sampled start times can otherwise skip a preview tick by a few milliseconds.
      if (options.statusIntervalMs <= options.intervalMs
        || now.getTime() - Date.parse(state.lastStatusAt) >= options.statusIntervalMs) {
        await source.statuses(options.batchSize, async (batch) => { await target.statuses(batch); statuses += batch.length; });
        next.lastStatusAt = now.toISOString();
      }
      if (now.getTime() - Date.parse(state.lastReportAt) >= options.reportIntervalMs) {
        let after = "0";
        for (;;) {
          const batch = await source.reports(after, options.batchSize);
          if (!batch.length) break;
          await target.reports(batch);
          reports += batch.length;
          after = batch[batch.length - 1].id;
          if (batch.length < options.batchSize) break;
        }
        next.lastReportAt = now.toISOString();
      }
      next.lastSuccessAt = now.toISOString();
      await target.save(next, options);
      return { imported: false, events, statuses, reports, state: next };
    });
  });
}

// Same 30-minute expiry as the original poller; expiry is not a new source observation.
export const SOURCE_STATUS_STALE_MS = 30 * 60_000;
export async function expireSourceInventory(): Promise<number> {
  const result = await db().execute(sql`UPDATE store_sku_status SET status = 'unknown',
    pending_status = NULL, pending_since = NULL, pending_seen = 0
    WHERE status <> 'unknown' AND (last_checked_at IS NULL
      OR last_checked_at < now() - ${SOURCE_STATUS_STALE_MS} * interval '1 millisecond')
    RETURNING store_number`);
  return result.rows.length;
}

type DatabaseTransaction = Parameters<Parameters<ReturnType<typeof db>["transaction"]>[0]>[0];
export class PgInventoryDestination implements InventoryDestination {
  async transaction<T>(source: string, run: (destination: InventoryWriter) => Promise<T>) {
    // Independent commit: a source timeout must not roll back the target's stale-data expiry.
    await expireSourceInventory();
    return db().transaction(async (tx) => {
      const lock = await tx.execute<{ acquired: boolean }>(sql`SELECT pg_try_advisory_xact_lock(hashtext('inventory-source-sync'), hashtext(${source})) AS acquired`);
      if (!lock.rows[0]?.acquired) throw new Error("Another inventory sync is running");
      return run(new PgInventoryWriter(tx, source));
    });
  }
}
class PgInventoryWriter implements InventoryWriter {
  constructor(private readonly tx: DatabaseTransaction, private readonly source: string) {}
  async state() {
    const result = await this.tx.execute<{ value: SyncState }>(sql`SELECT value FROM inventory_sync_state WHERE source = ${this.source}`);
    return result.rows[0]?.value ?? null;
  }
  async events(rows: SourceEvent[], policy: EventPolicy) {
    if (!rows.length) return;
    const data = rows.map((e) => ({ ...e, ...notificationDecision(e, policy) }));
    // Source IDs remain text provenance. Let the destination allocate every event_id from its own sequence.
    // The outbox is inserted in this SAME transaction; replay can never resurrect a suppressed/claimed event.
    await this.tx.execute(sql`WITH incoming AS (
      SELECT * FROM jsonb_to_recordset(${JSON.stringify(data)}::jsonb)
      AS x(id text, store_number text, part_number text, kind text, quote text, at timestamptz,
        first_seen boolean, seen_until timestamptz, status text, reason text)
    ), changed AS (
      SELECT incoming.* FROM incoming LEFT JOIN availability_events e
        ON e.inventory_source = ${this.source} AND e.source_event_id = incoming.id
      WHERE e.id IS NULL OR (e.store_number, e.part_number, e.kind, e.quote, e.at, e.first_seen, e.seen_until)
        IS DISTINCT FROM (incoming.store_number, incoming.part_number, incoming.kind, incoming.quote,
          incoming.at, incoming.first_seen, incoming.seen_until)
    ), imported AS (
      INSERT INTO availability_events (inventory_source, source_event_id, store_number, part_number, kind, quote, at, first_seen, seen_until)
      SELECT ${this.source}, id, store_number, part_number, kind, quote, at, first_seen, seen_until FROM changed
      ON CONFLICT (inventory_source, source_event_id) DO UPDATE SET
        store_number = excluded.store_number, part_number = excluded.part_number, kind = excluded.kind,
        quote = excluded.quote, at = excluded.at, first_seen = excluded.first_seen, seen_until = excluded.seen_until
      WHERE (availability_events.store_number, availability_events.part_number, availability_events.kind,
        availability_events.quote, availability_events.at, availability_events.first_seen, availability_events.seen_until)
        IS DISTINCT FROM (excluded.store_number, excluded.part_number, excluded.kind,
          excluded.quote, excluded.at, excluded.first_seen, excluded.seen_until)
      RETURNING id, source_event_id
    ) INSERT INTO inventory_sync_outbox (source, source_event_id, event_id, status, reason)
      SELECT ${this.source}, incoming.id, imported.id, incoming.status, incoming.reason
      FROM incoming JOIN imported ON imported.source_event_id = incoming.id
      ON CONFLICT (source, source_event_id) DO NOTHING`);
  }
  async statuses(rows: SourceStatus[]) {
    if (!rows.length) return;
    await this.tx.execute(sql`INSERT INTO store_sku_status
      (store_number, part_number, status, quote, since, last_checked_at, last_changed_at, last_available_at, pending_status, pending_since, pending_seen)
      SELECT store_number, part_number,
        CASE WHEN last_checked_at IS NULL OR last_checked_at < now() - ${SOURCE_STATUS_STALE_MS} * interval '1 millisecond'
          THEN 'unknown' ELSE status END,
        quote, since, last_checked_at, last_changed_at, last_available_at, NULL, NULL, 0
      FROM jsonb_to_recordset(${JSON.stringify(rows)}::jsonb) AS x(store_number text, part_number text, status text, quote text,
        since timestamptz, last_checked_at timestamptz, last_changed_at timestamptz, last_available_at timestamptz)
      ON CONFLICT (store_number, part_number) DO UPDATE SET status = excluded.status, quote = excluded.quote,
        since = excluded.since, last_checked_at = excluded.last_checked_at, last_changed_at = excluded.last_changed_at,
        last_available_at = excluded.last_available_at, pending_status = NULL, pending_since = NULL, pending_seen = 0
      WHERE (store_sku_status.last_checked_at IS NULL OR excluded.last_checked_at >= store_sku_status.last_checked_at)
        AND (store_sku_status.status, store_sku_status.quote, store_sku_status.since, store_sku_status.last_checked_at,
          store_sku_status.last_changed_at, store_sku_status.last_available_at, store_sku_status.pending_status,
          store_sku_status.pending_since, store_sku_status.pending_seen)
          IS DISTINCT FROM (excluded.status, excluded.quote, excluded.since, excluded.last_checked_at,
            excluded.last_changed_at, excluded.last_available_at, NULL::text, NULL::timestamptz, 0)`);
  }
  async reports(rows: SourceReport[]) {
    if (!rows.length) return;
    await this.tx.execute(sql`INSERT INTO restock_reports
      (inventory_source, source_report_id, store_number, part_number, at, source, source_url, kind, imported_at)
      SELECT ${this.source}, id, store_number, part_number, at, source, source_url, kind, imported_at
      FROM jsonb_to_recordset(${JSON.stringify(rows)}::jsonb) AS x(id text, store_number text, part_number text, at timestamptz,
        source text, source_url text, kind text, imported_at timestamptz)
      ON CONFLICT (store_number, part_number, at, source) DO UPDATE SET inventory_source = excluded.inventory_source,
        source_report_id = excluded.source_report_id, source_url = excluded.source_url, kind = excluded.kind, imported_at = excluded.imported_at`);
  }
  async save(state: SyncState, options: SyncOptions) {
    await this.tx.execute(sql`INSERT INTO inventory_sync_state (source, value, updated_at)
      VALUES (${this.source}, ${JSON.stringify(state)}::jsonb, now())
      ON CONFLICT (source) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`);
    const heartbeat = { at: state.lastSuccessAt, mode: "source-sync", host: options.host,
      cadenceSec: options.intervalMs / 1_000, statusCadenceSec: options.statusIntervalMs / 1_000,
      source: this.source, feedOnly: true, notificationsEnabled: options.notificationsEnabled };
    const feed = { ...heartbeat, highWater: state.highWater, reconcileAfter: state.reconcileAfter,
      cutoverAt: state.cutoverAt, lastStatusAt: state.lastStatusAt, error: null };
    await this.tx.execute(sql`INSERT INTO poller_state (key, value, updated_at) VALUES
      ('heartbeat', ${JSON.stringify(heartbeat)}::jsonb, now()), ('inventory-source', ${JSON.stringify(feed)}::jsonb, now())
      ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`);
  }
}

export interface ClaimedAlert { sourceEventId: string; eventId: number; transition: Transition }
export interface NotificationOutbox {
  claim(options: SyncOptions): Promise<{ token: string; alerts: ClaimedAlert[] }>;
  finish(token: string, status: "sent" | "failed" | "uncertain", reason: string | null): Promise<void>;
}
export type NotifyInventory = (transitions: Transition[], eventIds: number[], now?: Date) => Promise<{ failed: number }>;

/** One irreversible send attempt per claim. A crash after sending cannot safely be retried automatically. */
export async function dispatchInventoryAlerts(outbox: NotificationOutbox, options: SyncOptions, notify: NotifyInventory): Promise<number> {
  if (!options.notificationsEnabled || previewInventoryMode()) return 0;
  const { token, alerts } = await outbox.claim(options);
  if (!alerts.length) return 0;
  try {
    const stats = await notify(alerts.map((e) => e.transition), alerts.map((e) => e.eventId));
    await outbox.finish(token, stats.failed ? "failed" : "sent", stats.failed ? "delivery-failed-review-required" : null);
    return alerts.length;
  } catch (error) {
    await outbox.finish(token, "uncertain", "interrupted-delivery-review-required");
    throw error;
  }
}

export class PgInventoryOutbox implements NotificationOutbox {
  async claim(options: SyncOptions) {
    const token = randomUUID();
    const alerts = await db().transaction(async (tx) => {
      // Re-check the current interval at claim time: a restock followed by a soldout in one
      // sync batch must never send “available now”, nor may an older restock use a later cycle.
      // Source time gates eligibility; wall time gates waiting in OUR outbox. Neither renews stale inventory.
      await tx.execute(sql`UPDATE inventory_sync_outbox SET status = 'expired', reason = 'delivery-window-expired', completed_at = now()
        WHERE source = ${options.source} AND status = 'pending' AND created_at < now() - ${options.maxAlertAgeMs} * interval '1 millisecond'`);
      const result = await tx.execute<{ source_event_id: string; event_id: string | number; store_number: string; part_number: string;
        kind: "restock"; quote: string | null; at: Date; first_seen: boolean; seen_until: Date | null }>(sql`
        WITH candidates AS (
          SELECT o.source, o.source_event_id FROM inventory_sync_outbox o
          JOIN availability_events e ON e.id = o.event_id
          JOIN inventory_sync_state s ON s.source = o.source
          JOIN store_sku_status current_stock ON current_stock.store_number = e.store_number AND current_stock.part_number = e.part_number
          WHERE o.source = ${options.source} AND o.status = 'pending' AND e.kind = 'restock' AND e.first_seen = false
            AND e.inventory_source = o.source AND e.source_event_id = o.source_event_id
            AND current_stock.status = 'available' AND current_stock.since = e.at
            AND current_stock.last_checked_at >= e.at
            AND current_stock.last_checked_at >= now() - ${options.maxAlertAgeMs} * interval '1 millisecond'
            AND current_stock.last_checked_at <= now() + interval '5 seconds'
            AND e.at >= (s.value->>'cutoverAt')::timestamptz
            AND e.at >= (s.value->>'lastSuccessAt')::timestamptz - ${options.maxAlertAgeMs} * interval '1 millisecond'
            AND e.at >= now() - ${options.maxAlertAgeMs} * interval '1 millisecond'
            AND e.at <= now() + interval '5 seconds'
          ORDER BY o.created_at, o.event_id LIMIT ${options.batchSize} FOR UPDATE OF o SKIP LOCKED
        ), claimed AS (
          UPDATE inventory_sync_outbox o SET status = 'delivering', claim = ${token}, claimed_at = now()
          FROM candidates c WHERE o.source = c.source AND o.source_event_id = c.source_event_id
          RETURNING o.source_event_id, o.event_id
        ) SELECT c.*, e.store_number, e.part_number, e.kind, e.quote, e.at, e.first_seen, e.seen_until
          FROM claimed c JOIN availability_events e ON e.id = c.event_id`);
      return result.rows.map((e) => {
        // node-postgres returns int8 as a string; notification IDs use safe JS integers.
        const eventId = Number(e.event_id);
        if (!Number.isSafeInteger(eventId) || eventId < 1) throw new Error("Inventory event ID exceeds the supported integer range");
        return { sourceEventId: e.source_event_id, eventId,
          transition: { storeNumber: e.store_number, partNumber: e.part_number, kind: e.kind, quote: e.quote,
            at: e.at, firstSeen: e.first_seen, seenUntil: e.seen_until } };
      });
    });
    return { token, alerts };
  }
  async finish(token: string, status: "sent" | "failed" | "uncertain", reason: string | null) {
    await db().execute(sql`UPDATE inventory_sync_outbox SET status = ${status}, reason = ${reason}, completed_at = now()
      WHERE claim = ${token} AND status = 'delivering'`);
  }
}

/** Called only by a single supervised feed process on startup; no uncertain claim is ever requeued. */
export async function markInterruptedClaims(source: string): Promise<number> {
  const result = await db().execute(sql`UPDATE inventory_sync_outbox SET status = 'uncertain',
    reason = 'process-restarted-during-delivery', completed_at = now()
    WHERE source = ${source} AND status = 'delivering' RETURNING source_event_id`);
  return result.rows.length;
}

export async function recordSourceFailure(error: unknown): Promise<void> {
  const value = { error: safeSyncError(error), failedAt: new Date().toISOString() };
  await db().execute(sql`INSERT INTO poller_state (key, value, updated_at) VALUES ('inventory-source', ${JSON.stringify(value)}::jsonb, now())
    ON CONFLICT (key) DO UPDATE SET value = poller_state.value || excluded.value, updated_at = excluded.updated_at`);
  // Deliberately leave heartbeat.at and every last_checked_at untouched.
}
