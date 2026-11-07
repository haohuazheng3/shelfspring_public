/** Read shared inventory in-place; only this application's private delivery state is written. */
import { sql } from "drizzle-orm";
import { db } from "../db";
import { previewInventoryMode } from "./inventory-mode";
import { inventoryDate, notificationDecision, PgInventoryWriter, type EventPolicy, type InventorySnapshot, type InventoryWriter,
  type SourceEvent, type SyncOptions, type SyncResult } from "./source-sync";

type EventReader = Pick<InventorySnapshot, "now" | "events" | "overlap">;
type EventWriter = Pick<InventoryWriter, "state" | "events" | "save">;
export interface SharedInventorySession { reader: EventReader; writer: EventWriter }
export interface SharedInventoryFeed {
  transaction<T>(source: string, run: (session: SharedInventorySession) => Promise<T>): Promise<T>;
}

/** Migration supplies the checkpoint and dedupe ledger. Startup never imports or reinitializes history. */
export async function syncSharedInventoryOnce(feed: SharedInventoryFeed, options: SyncOptions): Promise<SyncResult> {
  return feed.transaction(options.source, async ({ reader, writer }) => {
    const state = await writer.state();
    if (!state) throw new Error("Shared inventory requires a migrated checkpoint");
    if (state.version !== 1 || !/^\d+$/.test(state.highWater) || !/^\d+$/.test(state.reconcileAfter)
      || !Number.isFinite(Date.parse(state.cutoverAt))) throw new Error("Invalid shared inventory checkpoint");
    const now = await reader.now();
    const next = { ...state };
    const policy: EventPolicy = { mode: options.notificationsEnabled ? "live" : "preview", now,
      cutoverAt: new Date(state.cutoverAt), maxAgeMs: options.maxAlertAgeMs };
    let events = 0;
    const accept = async (rows: SourceEvent[]) => {
      if (!rows.length) return;
      await writer.events(rows, policy);
      events += rows.length;
    };
    for (let batch = 0; batch < options.maxBatches; batch++) {
      const rows = await reader.events(next.highWater, options.batchSize);
      if (!rows.length) break;
      await accept(rows);
      next.highWater = rows[rows.length - 1].id;
      if (rows.length < options.batchSize) break;
    }
    await accept(await reader.overlap(next.highWater, new Date(now.getTime() - options.overlapMs), options.overlapIds, options.batchSize));
    // A bounded scan still catches sequence allocations that commit behind the high water mark.
    const audit = await reader.events(state.reconcileAfter, options.batchSize);
    await accept(audit);
    next.reconcileAfter = audit.length === options.batchSize ? audit[audit.length - 1].id : "0";
    next.lastSuccessAt = now.toISOString();
    await writer.save(next, options);
    return { imported: false, events, statuses: 0, reports: 0, state: next };
  });
}

type Transaction = Parameters<Parameters<ReturnType<typeof db>["transaction"]>[0]>[0];
const columns = sql.raw("e.id::text, e.store_number, e.part_number, e.kind, e.quote, e.at, e.first_seen, e.seen_until");
type RawEvent = Omit<SourceEvent, "at" | "seen_until"> & { at: string | Date; seen_until: string | Date | null };
const eventDates = (event: RawEvent): SourceEvent => ({ ...event, at: inventoryDate(event.at),
  seen_until: event.seen_until === null ? null : inventoryDate(event.seen_until) });

export class PgSharedInventoryFeed implements SharedInventoryFeed {
  async transaction<T>(source: string, run: (session: SharedInventorySession) => Promise<T>) {
    return db().transaction(async (tx) => {
      await tx.execute(sql`SET TRANSACTION ISOLATION LEVEL REPEATABLE READ`);
      const identity = await tx.execute<{ schema: string; role: string }>(sql`SELECT current_schema() AS schema, current_user AS role`);
      const expected = previewInventoryMode() ? "shelfspring_preview" : "shelfspring";
      const actual = identity.rows[0];
      if (actual?.schema !== expected || ![expected, `${expected}_poller`].includes(actual.role)) {
        throw new Error("Shared inventory requires its isolated application schema and role");
      }
      const lock = await tx.execute<{ acquired: boolean }>(sql`SELECT pg_try_advisory_xact_lock(
        hashtext('inventory-shared:' || current_schema()), hashtext(${source})) AS acquired`);
      if (!lock.rows[0]?.acquired) throw new Error("Another shared inventory worker is running");
      const state = new PgInventoryWriter(tx, source, "shared");
      return run({
        reader: {
          now: async () => inventoryDate((await tx.execute<{ at: string | Date }>(sql`SELECT clock_timestamp() AS at`)).rows[0]?.at),
          events: async (after, limit) => (await tx.execute<RawEvent>(sql`SELECT ${columns}
            FROM availability_events e WHERE e.id > ${after}::bigint ORDER BY e.id LIMIT ${limit}`)).rows.map(eventDates),
          overlap: async (high, since, ids, limit) => (await tx.execute<RawEvent>(sql`SELECT ${columns}
            FROM availability_events e WHERE e.id <= ${high}::bigint
              AND (e.id > ${high}::bigint - ${ids}::bigint OR e.at >= ${since})
            ORDER BY e.id DESC LIMIT ${limit}`)).rows.map(eventDates),
        },
        writer: { state: () => state.state(), save: (value, options) => state.save(value, options),
          events: (rows, policy) => enqueue(tx, source, rows, policy) },
      });
    });
  }
}

async function enqueue(tx: Transaction, source: string, rows: SourceEvent[], policy: EventPolicy) {
  if (!rows.length) return;
  const data = rows.map((event) => {
    if (!/^\d+$/.test(event.id) || !Number.isSafeInteger(Number(event.id)) || Number(event.id) < 1) {
      throw new Error("Shared inventory event ID exceeds the supported integer range");
    }
    return { id: event.id, ...notificationDecision(event, policy) };
  });
  await tx.execute(sql`INSERT INTO inventory_sync_outbox (source, source_event_id, event_id, status, reason)
    SELECT ${source}, id, id::bigint, status, reason FROM jsonb_to_recordset(${JSON.stringify(data)}::jsonb)
      AS x(id text, status text, reason text)
    ON CONFLICT (source, source_event_id) DO NOTHING`);
}
