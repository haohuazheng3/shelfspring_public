import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dispatchInventoryAlerts, notificationDecision, syncOptions, type SourceEvent, type SyncState } from "@/lib/stock/source-sync";
import { PgSharedInventoryFeed, syncSharedInventoryOnce, type SharedInventoryFeed, type SharedInventorySession } from "@/lib/stock/shared-inventory";
const sqlState = vi.hoisted(() => ({ queries: [] as { sql: string; params: unknown[] }[], schema: "shelfspring", role: "shelfspring_poller" }));
vi.mock("@/lib/db", async () => {
  const { PgDialect } = await import("drizzle-orm/pg-core");
  const dialect = new PgDialect();
  const execute = async (query: Parameters<typeof dialect.sqlToQuery>[0]) => {
    const compiled = dialect.sqlToQuery(query); sqlState.queries.push(compiled);
    return { rows: compiled.sql.includes("current_user AS role") ? [{ schema: sqlState.schema, role: sqlState.role }]
      : compiled.sql.includes("pg_try_advisory_xact_lock") ? [{ acquired: true }] : [] };
  };
  return { db: () => ({ transaction: (run: (tx: { execute: typeof execute }) => Promise<unknown>) => run({ execute }) }) };
});
const at = (seconds: number) => new Date(Date.UTC(2026, 10, 6, 12, 0, seconds));
const row = (id: string, seconds: number, extra: Partial<SourceEvent> = {}): SourceEvent => ({ id, at: at(seconds), first_seen: false,
  kind: "restock", store_number: "R001", part_number: "TEST/A", quote: null, seen_until: null, ...extra });
const checkpoint = (): SyncState => ({ version: 1, cutoverAt: at(10).toISOString(), highWater: "10", reconcileAfter: "0",
  lastSuccessAt: at(50).toISOString(), lastStatusAt: at(40).toISOString(), lastReportAt: at(40).toISOString(),
  importedEvents: 10, importedStatuses: 2, importedReports: 1 });
class MemoryFeed implements SharedInventoryFeed {
  state: SyncState | null = checkpoint();
  rows: SourceEvent[] = [];
  decisions = new Map<string, { status: string; reason: string | null }>();
  fail = false;
  async transaction<T>(_source: string, run: (session: SharedInventorySession) => Promise<T>) {
    let state = structuredClone(this.state);
    const decisions = structuredClone(this.decisions);
    const sorted = [...this.rows].sort((a,b) => BigInt(a.id) < BigInt(b.id) ? -1 : 1);
    const result = await run({ reader: {
      now: async () => at(100),
      events: async (after, limit) => sorted.filter(e => BigInt(e.id) > BigInt(after)).slice(0,limit),
      overlap: async (high, since, ids, limit) => sorted.filter(e => BigInt(e.id) <= BigInt(high) && (BigInt(e.id) > BigInt(high)-BigInt(ids) || e.at>=since)).reverse().slice(0,limit),
    }, writer: {
      state: async () => state,
      events: async (events, policy) => { for (const e of events) if (!decisions.has(e.id)) decisions.set(e.id, notificationDecision(e, policy)); },
      save: async next => { if(this.fail) throw new Error("rollback"); state=structuredClone(next); },
    } });
    this.state=state; this.decisions=decisions; return result;
  }
}
beforeEach(() => { sqlState.queries=[]; sqlState.schema="shelfspring"; sqlState.role="shelfspring_poller"; vi.stubEnv("PREVIEW_INVENTORY_MODE", "0"); vi.stubEnv("VERCEL_ENV", "production"); });
afterEach(() => vi.unstubAllEnvs());
describe("shared inventory delivery cursor", () => {
  it("refuses to turn startup without a migrated checkpoint into historical notifications", async () => {
    const feed=new MemoryFeed(); feed.state=null; feed.rows=[row("11",99)];
    await expect(syncSharedInventoryOnce(feed,syncOptions({}))).rejects.toThrow("migrated checkpoint");
    expect(feed.decisions.size).toBe(0);
  });
  it("preserves all migrated delivery decisions and catches a numerically earlier late commit", async () => {
    const feed=new MemoryFeed();
    for(const [i,status] of ["sent","delivering","uncertain","failed","suppressed","expired"].entries()) {
      const id=String(i+1); feed.rows.push(row(id,99)); feed.decisions.set(id,{status,reason:"preserved"});
    }
    feed.rows.push(row("9",99),row("10",0),row("11",99),row("12",99,{first_seen:true}),row("13",99,{kind:"soldout"}),row("14",20));
    const options=syncOptions({}); const result=await syncSharedInventoryOnce(feed,options);
    expect(result).toMatchObject({imported:false,statuses:0,reports:0});
    expect(feed.state).toMatchObject({cutoverAt:at(10).toISOString(),highWater:"14",importedEvents:10,importedStatuses:2,lastStatusAt:at(40).toISOString()});
    for(const [i,status] of ["sent","delivering","uncertain","failed","suppressed","expired"].entries()) expect(feed.decisions.get(String(i+1))).toEqual({status,reason:"preserved"});
    expect(feed.decisions.get("9")?.status).toBe("pending"); expect(feed.decisions.get("11")?.status).toBe("pending");
    for(const id of ["10","12","13","14"]) expect(feed.decisions.get(id)?.status).toBe("suppressed");
    const before=structuredClone(feed.decisions); await syncSharedInventoryOnce(feed,options); expect(feed.decisions).toEqual(before);
  });
  it("rolls back its cursor and decisions on failure, and preview never has pending deliveries", async () => {
    const feed=new MemoryFeed(); feed.rows=[row("11",99)]; feed.fail=true; const old=structuredClone(feed.state);
    await expect(syncSharedInventoryOnce(feed,syncOptions({}))).rejects.toThrow("rollback");
    expect(feed.state).toEqual(old); expect(feed.decisions.size).toBe(0);
    feed.fail=false; await syncSharedInventoryOnce(feed,syncOptions({PREVIEW_INVENTORY_MODE:"1"}));
    expect(feed.decisions.get("11")).toEqual({status:"suppressed",reason:"preview-inventory"});
  });
  it("writes only private delivery/state tables and keeps original numeric event IDs", async () => {
    await new PgSharedInventoryFeed().transaction("pickupchecker",async ({reader,writer}) => {
      await reader.events("9",10); await reader.overlap("100",at(0),20,10);
      await writer.events([row("100",99)],{mode:"live",now:at(100),cutoverAt:at(10),maxAgeMs:60_000});
      await writer.save(checkpoint(),syncOptions({}));
    });
    const writes=sqlState.queries.filter(q=>/\b(?:INSERT INTO|UPDATE|DELETE FROM)\b/.test(q.sql));
    expect(writes).toHaveLength(3);
    expect(writes.every(q=>!/(?:INSERT INTO|UPDATE|DELETE FROM)\s+(?:availability_events|store_sku_status|restock_reports|stores|skus)\b/.test(q.sql))).toBe(true);
    expect(writes[0].sql).toContain("id::bigint"); expect(writes[0].sql).toContain("DO NOTHING");
    expect(JSON.parse(String(writes[0].params[1]))).toEqual([{id:"100",status:"pending",reason:null}]);
    expect(sqlState.queries.some(q=>q.sql.includes("ORDER BY e.id LIMIT"))).toBe(true);
    expect(sqlState.queries.some(q=>q.sql.includes("ORDER BY e.id DESC"))).toBe(true);
  });
  it("refuses public schemas and an original collector role before writing anything", async () => {
    for(const [schema,role] of [["public","pickupchecker"],["shelfspring","pickupchecker"],["shelfspring_preview","shelfspring_preview_poller"]]) {
      sqlState.schema=schema;sqlState.role=role;
      await expect(new PgSharedInventoryFeed().transaction("pickupchecker",async()=>undefined)).rejects.toThrow("isolated");
    }
    expect(sqlState.queries.some(q=>q.sql.includes("INSERT INTO"))).toBe(false);
  });
  it("does not send or requeue a claim if cluster authority changes during claim acquisition", async () => {
    const outbox = { claim: vi.fn(async () => ({ token: "owned-before-promotion", alerts: [{ sourceEventId: "11", eventId: 11,
      transition: { storeNumber: "R001", partNumber: "TEST/A", kind: "restock" as const, quote: null, at: at(99), firstSeen: false, seenUntil: null } }] })),
      finish: vi.fn(async () => undefined) };
    const notify = vi.fn(async () => ({ failed: 0 }));
    expect(await dispatchInventoryAlerts(outbox, syncOptions({}), notify, async () => false)).toBe(0);
    expect(outbox.claim).toHaveBeenCalledOnce(); expect(notify).not.toHaveBeenCalled(); expect(outbox.finish).not.toHaveBeenCalled();
  });

});
