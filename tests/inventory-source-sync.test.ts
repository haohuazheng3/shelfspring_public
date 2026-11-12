import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CLAIM_PUSHDOWN_SKEW_MS, claimScanWindow, dispatchInventoryAlerts, expireSourceInventory, importInventoryHistory, notificationDecision, PgInventoryDestination, PgInventoryOutbox, safeSyncError, sourcePoolConfig, SOURCE_STATUS_STALE_MS,
  syncInventoryOnce, syncOptions, type ClaimedAlert, type EventPolicy, type InventoryDestination,
  type InventoryReader, type InventorySnapshot, type InventoryWriter, type NotificationOutbox,
  type SourceEvent, type SourceReport, type SourceStatus, type SyncState,
} from "@/lib/stock/source-sync";

const sqlState = vi.hoisted(() => ({ queries: [] as { sql: string; params: unknown[]; transaction: boolean }[], inTransaction: false,
  claimedRows: [] as Record<string, unknown>[] }));
vi.mock("@/lib/db", async () => {
  const { PgDialect } = await import("drizzle-orm/pg-core");
  const dialect = new PgDialect();
  const execute = async (query: Parameters<typeof dialect.sqlToQuery>[0]) => {
    const compiled = dialect.sqlToQuery(query);
    sqlState.queries.push({ ...compiled, transaction: sqlState.inTransaction });
    return { rows: compiled.sql.includes("pg_try_advisory_xact_lock") ? [{ acquired: true }]
      : compiled.sql.includes("WITH candidates AS") ? sqlState.claimedRows : [] };
  };
  return { db: () => ({ execute, transaction: async (run: (tx: { execute: typeof execute }) => Promise<unknown>) => {
    sqlState.inTransaction = true;
    try { return await run({ execute }); } finally { sqlState.inTransaction = false; }
  } }) };
});

const at = (sec: number) => new Date(Date.UTC(2026, 10, 6, 12, 0, sec));
const event = (id: number | string, sec: number, extra: Partial<SourceEvent> = {}): SourceEvent => ({
  id: String(id), store_number: "R001", part_number: "MJQ34LL/A", kind: "restock", quote: "Available Today",
  at: at(sec), first_seen: false, seen_until: null, ...extra,
});
const stock = (sec: number, extra: Partial<SourceStatus> = {}): SourceStatus => ({
  store_number: "R001", part_number: "MJQ34LL/A", status: "available", quote: "Available Today",
  since: at(-100), last_checked_at: at(sec), last_changed_at: at(-100), last_available_at: at(sec), ...extra,
});
const options = { ...syncOptions({}), batchSize: 2, maxBatches: 2, overlapIds: 2, overlapMs: 10_000 };

/** Models commit visibility separately from sequence allocation; each snapshot gets an immutable row set. */
class Feed implements InventoryReader {
  events: SourceEvent[] = [];
  statuses: SourceStatus[] = [];
  reports: SourceReport[] = [];
  clock = at(0);
  finishClock: Date | null = null;
  fail = false;
  async snapshot<T>(run: (snapshot: InventorySnapshot) => Promise<T>) {
    const events = structuredClone(this.events).sort((a, b) => BigInt(a.id) < BigInt(b.id) ? -1 : 1);
    const statuses = structuredClone(this.statuses);
    const reports = structuredClone(this.reports);
    let clockReads = 0;
    return run({
      now: async () => clockReads++ && this.finishClock ? this.finishClock : this.clock,
      events: async (after, size) => events.filter((e) => BigInt(e.id) > BigInt(after)).slice(0, size),
      overlap: async (high, since, overlap, size) => events.filter((e) => BigInt(e.id) <= BigInt(high)
        && (BigInt(e.id) > BigInt(high) - BigInt(overlap) || e.at >= since)).reverse().slice(0, size),
      statuses: async (size, consume) => {
        if (this.fail) throw new Error("source failed with secret URL and rows");
        for (let i = 0; i < statuses.length; i += size) await consume(statuses.slice(i, i + size));
      },
      statusesFor: async (rows) => {
        if (this.fail) throw new Error("source failed with secret URL and rows");
        return statuses.filter((s) => rows.some((e) => e.store_number === s.store_number && e.part_number === s.part_number));
      },
      reports: async (after, size) => reports.filter((r) => BigInt(r.id) > BigInt(after)).slice(0, size),
    });
  }
}

interface SavedEvent { id: number; row: SourceEvent; decision: ReturnType<typeof notificationDecision> }
/** Transactional contract double: rollback is real and provenance keys survive replay. SQL needs a PostgreSQL integration check. */
class Destination implements InventoryDestination {
  events = new Map<string, SavedEvent>();
  statuses = new Map<string, SourceStatus>();
  reports = new Map<string, SourceReport>();
  value: SyncState | null = null;
  heartbeat: string | null = null;
  nextId = 400; // A destination with its own serial history; never accept a source primary key.
  async transaction<T>(_source: string, run: (target: InventoryWriter) => Promise<T>) {
    const events = structuredClone(this.events), statuses = structuredClone(this.statuses), reports = structuredClone(this.reports);
    let value = structuredClone(this.value), heartbeat = this.heartbeat, nextId = this.nextId;
    const result = await run({
      state: async () => value,
      events: async (rows, policy) => rows.forEach((e) => {
        const existing = events.get(e.id);
        events.set(e.id, { id: existing?.id ?? nextId++, row: structuredClone(e), decision: existing?.decision ?? notificationDecision(e, policy) });
      }),
      statuses: async (rows) => rows.forEach((s) => {
        const key = `${s.store_number}/${s.part_number}`;
        const prev = statuses.get(key);
        if (!prev?.last_checked_at || (s.last_checked_at && s.last_checked_at >= prev.last_checked_at)) statuses.set(key, structuredClone(s));
      }),
      reports: async (rows) => rows.forEach((r) => reports.set(r.id, structuredClone(r))),
      save: async (state) => { value = structuredClone(state); heartbeat = state.lastSuccessAt; },
    });
    this.events = events; this.statuses = statuses; this.reports = reports;
    this.value = value; this.heartbeat = heartbeat; this.nextId = nextId;
    return result;
  }
}

describe("inventory source import and incremental orchestration", () => {
  it("copies preview statuses on every tick even when the sampled start is only 9999ms later", async () => {
    const preview = syncOptions({ PREVIEW_INVENTORY_MODE: "1" });
    expect(preview).toMatchObject({ source: "shelfspring-production", intervalMs: 10_000,
      statusIntervalMs: 10_000, notificationsEnabled: false });
    const source = new Feed(), target = new Destination();
    source.statuses = [stock(0)];
    await importInventoryHistory(source, target, preview);
    for (const tick of [1, 2]) {
      source.clock = new Date(at(0).getTime() + tick * 9_999);
      source.statuses = [stock(tick * 9)];
      const result = await syncInventoryOnce(source, target, preview);
      expect(result.statuses).toBe(1);
      expect(target.statuses.get("R001/MJQ34LL/A")?.last_checked_at).toEqual(at(tick * 9));
      expect(target.value?.lastStatusAt).toBe(source.clock.toISOString());
      expect(target.events.size).toBe(0);
    }
  });
  it("keeps the production 5s loop behind its unchanged 30s status threshold", async () => {
    const production = syncOptions({});
    expect(production).toMatchObject({ source: "pickupchecker", intervalMs: 5_000, statusIntervalMs: 30_000 });
    const source = new Feed(), target = new Destination();
    source.statuses = [stock(0)];
    await importInventoryHistory(source, target, production);
    source.clock = new Date(at(0).getTime() + 29_999);
    source.statuses = [stock(29)];
    expect((await syncInventoryOnce(source, target, production)).statuses).toBe(0);
    expect(target.statuses.get("R001/MJQ34LL/A")?.last_checked_at).toEqual(at(0));
    expect(target.value?.lastStatusAt).toBe(at(0).toISOString());
    source.clock = at(30);
    expect((await syncInventoryOnce(source, target, production)).statuses).toBe(1);
    expect(target.statuses.get("R001/MJQ34LL/A")?.last_checked_at).toEqual(at(29));
    expect(target.value?.lastStatusAt).toBe(at(30).toISOString());
  });
  it("repairs skipped history immediately without resetting cutover or re-enqueuing previously seen events", async () => {
    const source = new Feed(), target = new Destination();
    source.clock = at(20); source.events = [event(1, 1), event(10, 10)];
    await importInventoryHistory(source, target, options);
    const originalCutover = target.value!.cutoverAt;
    // An event already queued by live sync retains its decision through the repair.
    source.clock = at(40); source.events.push(event(20, 39));
    await syncInventoryOnce(source, target, options);
    expect(target.events.get("20")?.decision.status).toBe("pending");
    // A restored late/previously skipped event and a currently fresh event must both be suppressed.
    source.clock = at(50); source.events.push(event(2, 2), event(21, 49)); source.statuses = [stock(49)];
    const repaired = await importInventoryHistory(source, target, options, { repair: true });
    expect(repaired).toMatchObject({ imported: true, repaired: true, events: 5 });
    expect(target.value).toMatchObject({ cutoverAt: originalCutover, highWater: "21", importedEvents: 2,
      lastHistoryRepair: { events: 5, statuses: 1, reports: 0 } });
    expect(target.events.get("2")?.decision).toEqual({ status: "suppressed", reason: "history" });
    expect(target.events.get("21")?.decision).toEqual({ status: "suppressed", reason: "history" });
    expect(target.events.get("20")?.decision.status).toBe("pending");
    const snapshot = structuredClone(target.events);
    await importInventoryHistory(source, target, options, { repair: true });
    expect(target.events).toEqual(snapshot);
    expect(target.value!.cutoverAt).toBe(originalCutover);
  });
  it("rolls back interrupted repairs, keeps a higher existing cursor, and refuses repair before initial import", async () => {
    const source = new Feed(), target = new Destination();
    await expect(importInventoryHistory(source, target, options, { repair: true })).rejects.toThrow("before repairing");
    source.events = [event(100, -1)];
    await importInventoryHistory(source, target, options);
    const original = structuredClone(target.value);
    source.events = [event(1, -2)]; source.fail = true;
    await expect(importInventoryHistory(source, target, options, { repair: true })).rejects.toThrow();
    expect(target.value).toEqual(original); expect(target.events.has("1")).toBe(false);
    source.fail = false;
    await importInventoryHistory(source, target, options, { repair: true });
    expect(target.value!.highWater).toBe("100"); expect(target.events.has("100")).toBe(true);
  });
  it("copies fresh preview restocks and their original timestamps without creating deliverable alerts", async () => {
    const preview = syncOptions({ PREVIEW_INVENTORY_MODE: "1" });
    const source = new Feed(), target = new Destination();
    source.clock = at(0);
    await importInventoryHistory(source, target, preview);
    source.clock = at(31); source.events = [event(1, 30)]; source.statuses = [stock(30)];
    await syncInventoryOnce(source, target, preview);
    expect(target.events.get("1")?.decision).toEqual({ status: "suppressed", reason: "preview-inventory" });
    expect(target.statuses.get("R001/MJQ34LL/A")?.last_checked_at).toEqual(at(30));
    expect(target.heartbeat).toBe(at(31).toISOString());
    // Replaying with delivery enabled must not re-enqueue the original preview event.
    source.clock = at(32);
    await syncInventoryOnce(source, target, { ...preview, notificationsEnabled: true });
    expect(target.events.get("1")?.decision.reason).toBe("preview-inventory");
  });
  it("imports restocks, first sightings, soldouts, bounds and third-party provenance without any pending alert", async () => {
    const source = new Feed(), target = new Destination();
    source.clock = at(10);
    source.finishClock = at(20);
    source.events = [event(1, -30, { first_seen: true }), event(2, -20, { kind: "soldout", seen_until: at(-23) }), event(3, 5)];
    source.statuses = [stock(9)];
    source.reports = [{ id: "999", store_number: "R001", part_number: "MJQ34LL/A", at: at(-100), source: "DuoReady",
      source_url: "https://example.com/report", kind: "candidate", imported_at: at(-80) }];
    const first = await importInventoryHistory(source, target, options);
    expect(first).toMatchObject({ imported: true, events: 3, statuses: 1, reports: 1 });
    expect(first.state.cutoverAt).toBe(at(20).toISOString());
    expect([...target.events.values()].every((e) => e.decision.status === "suppressed")).toBe(true);
    expect(target.events.get("2")?.row.seen_until).toEqual(at(-23));
    expect(target.events.get("1")?.id).toBe(400);
    expect(target.reports.get("999")).toEqual(source.reports[0]);
    const copy = structuredClone(target.events);
    expect((await importInventoryHistory(source, target, options)).imported).toBe(false);
    expect(target.events).toEqual(copy);
  });

  it("does not alert arrivals during initial import or old catch-up, and replay never re-enqueues history", async () => {
    const source = new Feed(), target = new Destination();
    source.clock = at(0); source.finishClock = at(20); source.events = [event(1, 0)];
    await importInventoryHistory(source, target, options);
    source.finishClock = null; source.clock = at(100);
    source.events.push(event(2, 15), event(3, 25), event(4, 99), event(5, 99, { first_seen: true }));
    await syncInventoryOnce(source, target, options);
    expect(target.events.get("1")?.decision.reason).toBe("history");
    expect(target.events.get("2")?.decision.reason).toBe("before-cutover");
    expect(target.events.get("3")?.decision.reason).toBe("outside-live-window");
    expect(target.events.get("4")?.decision.status).toBe("pending");
    expect(target.events.get("5")?.decision.status).toBe("suppressed");
    const ids = [...target.events.values()].map((e) => e.id);
    await syncInventoryOnce(source, target, options);
    expect([...target.events.values()].map((e) => e.id)).toEqual(ids);
  });

  it("finds a lower ID committed after the high-water event, with IDs larger than JS safe integers", async () => {
    const source = new Feed(), target = new Destination();
    source.events = [event("9007199254740994", -10)];
    await importInventoryHistory(source, target, options);
    source.clock = at(10);
    source.events.push(event("9007199254740993", 9));
    await syncInventoryOnce(source, target, options);
    expect(target.events.get("9007199254740993")?.decision.status).toBe("pending");
    expect(target.value?.highWater).toBe("9007199254740994");
  });

  it("rotating audit finds arbitrarily late commits and changes to old sell-out bounds outside overlap", async () => {
    const source = new Feed(), target = new Destination();
    source.events = [event(1, -100, { kind: "soldout", seen_until: null }), event(100, -90), event(200, -80)];
    await importInventoryHistory(source, target, options);
    source.clock = at(60);
    source.events[0].seen_until = at(-102);
    source.events.push(event(2, -95));
    await syncInventoryOnce(source, target, options);
    expect(target.events.get("1")?.row.seen_until).toEqual(at(-102));
    expect(target.events.get("2")?.decision.status).toBe("suppressed");
    expect(target.value?.reconcileAfter).toBe("2");
    await syncInventoryOnce(source, target, options);
    await syncInventoryOnce(source, target, options);
    expect(target.value?.reconcileAfter).toBe("0");
  });

  it("bounds the new-event batch and advances its cursor without dropping the backlog", async () => {
    const source = new Feed(), target = new Destination();
    await importInventoryHistory(source, target, options);
    source.clock = at(10);
    source.events = Array.from({ length: 9 }, (_, i) => event(i + 1, 9));
    await syncInventoryOnce(source, target, options);
    expect(target.value?.highWater).toBe("4");
    await syncInventoryOnce(source, target, options);
    expect(target.value?.highWater).toBe("8");
    await syncInventoryOnce(source, target, options);
    expect(target.value?.highWater).toBe("9");
    expect(target.events.size).toBe(9);
  });

  it("preserves source freshness and rolls back events, cursors and heartbeat on source failure", async () => {
    const source = new Feed(), target = new Destination();
    source.events = [event(1, -10)]; source.statuses = [stock(-3)];
    await importInventoryHistory(source, target, options);
    const before = structuredClone({ value: target.value, heartbeat: target.heartbeat, events: target.events, statuses: target.statuses });
    source.clock = at(30); source.events.push(event(2, 29)); source.fail = true;
    await expect(syncInventoryOnce(source, target, options)).rejects.toThrow("source failed");
    expect({ value: target.value, heartbeat: target.heartbeat, events: target.events, statuses: target.statuses }).toEqual(before);
    source.fail = false;
    await syncInventoryOnce(source, target, options);
    expect([...target.statuses.values()][0].last_checked_at).toEqual(at(-3));
    // A restored stale source cannot make destination data travel backwards.
    source.clock = at(60); source.statuses = [stock(-9)];
    await syncInventoryOnce(source, target, options);
    expect([...target.statuses.values()][0].last_checked_at).toEqual(at(-3));
  });

  it("an interrupted initial snapshot leaves no partial import, cutover or alerts", async () => {
    const source = new Feed(), target = new Destination();
    source.events = [event(1, -1)]; source.fail = true;
    await expect(importInventoryHistory(source, target, options)).rejects.toThrow();
    expect(target.value).toBeNull(); expect(target.events.size).toBe(0);
    source.fail = false;
    expect((await importInventoryHistory(source, target, options)).imported).toBe(true);
  });
});

class Outbox implements NotificationOutbox {
  status = "pending";
  failFinish = false;
  async claim() {
    if (this.status !== "pending") return { token: "claim", alerts: [] };
    this.status = "delivering";
    const e = event(8, 4);
    const alerts: ClaimedAlert[] = [{ sourceEventId: e.id, eventId: 401, transition: { storeNumber: e.store_number,
      partNumber: e.part_number, kind: e.kind, quote: e.quote, at: e.at, firstSeen: e.first_seen } }];
    return { token: "claim", alerts };
  }
  async finish(_token: string, status: "sent" | "failed" | "uncertain") {
    if (this.failFinish) throw new Error("destination down after send");
    this.status = status;
  }
}
describe("inventory notification crash boundaries", () => {
  beforeEach(() => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("PREVIEW_INVENTORY_MODE", "0");
  });
  afterEach(() => vi.unstubAllEnvs());
  it("never claims or marks pending rows sent when preview delivery is disabled", async () => {
    const outbox = new Outbox();
    const claim = vi.spyOn(outbox, "claim"), finish = vi.spyOn(outbox, "finish");
    const notify = vi.fn(async () => ({ failed: 0 }));
    expect(await dispatchInventoryAlerts(outbox, syncOptions({ PREVIEW_INVENTORY_MODE: "1" }), notify)).toBe(0);
    expect(claim).not.toHaveBeenCalled(); expect(finish).not.toHaveBeenCalled(); expect(notify).not.toHaveBeenCalled();
    vi.stubEnv("PREVIEW_INVENTORY_MODE", "typo-still-disabled");
    expect(await dispatchInventoryAlerts(outbox, options, notify)).toBe(0);
    expect(claim).not.toHaveBeenCalled();
  });
  it("commits the claim before calling the mature notifier and never dispatches it twice", async () => {
    const outbox = new Outbox();
    const notify = vi.fn(async () => { expect(outbox.status).toBe("delivering"); return { failed: 0 }; });
    expect(await dispatchInventoryAlerts(outbox, options, notify)).toBe(1);
    expect(outbox.status).toBe("sent");
    expect(await dispatchInventoryAlerts(outbox, options, notify)).toBe(0);
    expect(notify).toHaveBeenCalledTimes(1);
  });
  it("does not resend after a successful external send whose completion could not be persisted", async () => {
    const outbox = new Outbox(); outbox.failFinish = true;
    const notify = vi.fn(async () => ({ failed: 0 }));
    await expect(dispatchInventoryAlerts(outbox, options, notify)).rejects.toThrow();
    expect(outbox.status).toBe("delivering");
    outbox.failFinish = false;
    await dispatchInventoryAlerts(outbox, options, notify);
    expect(notify).toHaveBeenCalledTimes(1);
  });
  it("retains uncertain or failed attempts for review instead of retrying possible partial deliveries", async () => {
    const outbox = new Outbox();
    const notify = vi.fn(async () => { throw new Error("provider disconnected after partial delivery"); });
    await expect(dispatchInventoryAlerts(outbox, options, notify)).rejects.toThrow();
    expect(outbox.status).toBe("uncertain");
    await dispatchInventoryAlerts(outbox, options, notify);
    expect(notify).toHaveBeenCalledTimes(1);
    const failed = new Outbox();
    await dispatchInventoryAlerts(failed, options, async () => ({ failed: 1 }));
    expect(failed.status).toBe("failed");
  });
});

describe("source connection boundary", () => {
  const env = { INVENTORY_SOURCE_DATABASE_URL: "postgresql://reader:secret@source.example/inventory?sslmode=disable&options=-c%20default_transaction_read_only%3Doff",
    DATABASE_URL: "postgresql://writer:secret@destination.example/shelfspring", INVENTORY_SOURCE_DATABASE_CA: "line1\\nline2" };
  it("enforces one connection, read-only defaults, bounded queries and verified TLS even with URL overrides", () => {
    const config = sourcePoolConfig(env);
    expect(config.max).toBe(1);
    expect(config.options).toContain("default_transaction_read_only=on");
    expect(config.options).toContain("idle_in_transaction_session_timeout=");
    expect(config.connectionString).not.toContain("?");
    expect(config.ssl).toEqual({ rejectUnauthorized: true, ca: "line1\nline2" });
    expect(config.statement_timeout).toBeLessThanOrEqual(15_000);
  });
  it("refuses the source as any destination connection", () => {
    expect(() => sourcePoolConfig({ ...env, DATABASE_URL: "postgres://other:password@source.example:5432/inventory" })).toThrow("separate database");
    expect(() => sourcePoolConfig({ ...env, DATABASE_URL_STANDBY: "postgres://admin@source.example/inventory" })).toThrow("separate database");
  });
  it("logs only a bounded error code, never source URL, SQL parameters or row data", () => {
    expect(safeSyncError({ message: env.INVENTORY_SOURCE_DATABASE_URL, code: "ECONNREFUSED" })).toBe("Inventory sync failed (ECONNREFUSED)");
    expect(safeSyncError({ cause: { code: "secret/password" } })).toBe("Inventory sync failed");
    expect(safeSyncError(null)).toBe("Inventory sync failed");
  });
  it("rejects first sightings, sellouts, pre-cutover, stale and implausibly future events", () => {
    const policy: EventPolicy = { mode: "live", cutoverAt: at(0), now: at(100), maxAgeMs: 60_000 };
    for (const e of [event(1, 100, { first_seen: true }), event(2, 100, { kind: "soldout" }), event(3, -1), event(4, 39), event(5, 110)]) {
      expect(notificationDecision(e, policy).status).toBe("suppressed");
    }
    expect(notificationDecision(event(6, 99), policy).status).toBe("pending");
  });
});


// These compile the real adapter's parameterized SQL; execution/locking still needs PostgreSQL integration.
describe("destination SQL freshness boundaries", () => {
  beforeEach(() => { sqlState.queries = []; sqlState.inTransaction = false; sqlState.claimedRows = []; });
  it("converts PostgreSQL int8 notification IDs without rounding source IDs", async () => {
    sqlState.claimedRows = [{ ...event("9007199254740993", 1), source_event_id: "9007199254740993", event_id: "401" }];
    const result = await new PgInventoryOutbox().claim(options);
    expect(result.alerts[0]).toMatchObject({ sourceEventId: "9007199254740993", eventId: 401 });
    sqlState.claimedRows[0].event_id = "9007199254740993";
    await expect(new PgInventoryOutbox().claim(options)).rejects.toThrow("supported integer range");
  });
  it("claims only the currently available interval, excluding soldout, earlier-cycle and stale observations", async () => {
    await new PgInventoryOutbox().claim(options);
    const query = sqlState.queries.find((q) => q.sql.includes("WITH candidates AS"))!;
    expect(query.sql).toContain("JOIN store_sku_status current_stock");
    expect(query.sql).toContain("current_stock.status = 'available' AND current_stock.since = e.at");
    expect(query.sql).toContain("current_stock.last_checked_at >= e.at");
    expect(query.sql).toMatch(/current_stock.last_checked_at >= now\(\) - \$\d+ \* interval '1 millisecond'/);
    expect(query.sql).toMatch(/e.at >= now\(\) - \$\d+ \* interval '1 millisecond'/);
    expect(query.sql).toContain("e.inventory_source = o.source AND e.source_event_id = o.source_event_id");
    expect(query.sql).toContain("e.first_seen = false");
    expect(query.sql).toContain("e.at >= (s.value->>'cutoverAt')::timestamptz");
    expect(query.sql).toContain("FOR UPDATE OF o SKIP LOCKED");
    expect(query.params.filter((p) => p === options.maxAlertAgeMs)).toHaveLength(3);
  });
  it("bounds both inventory scans with literal parameters so postgres_fdw filters at the source", async () => {
    const before = Date.now();
    await new PgInventoryOutbox().claim(options);
    const after = Date.now();
    const query = sqlState.queries.find((q) => q.sql.includes("WITH candidates AS"))!;
    // now() is not shippable; without these the source returned every restock and every available row.
    expect(query.sql).toMatch(/e\.at >= \$\d+::timestamptz AND e\.at <= \$\d+::timestamptz/);
    expect(query.sql).toMatch(/current_stock\.since >= \$\d+::timestamptz AND current_stock\.since <= \$\d+::timestamptz/);
    expect(query.sql).toMatch(/current_stock\.last_checked_at >= \$\d+::timestamptz/);
    const bounds = query.params.filter((p): p is string => typeof p === "string" && /^\d{4}-\d\d-\d\dT/.test(p)).map((p) => Date.parse(p));
    expect(bounds).toHaveLength(5);
    // Never narrower than the exact checks: from ≤ now − max age, to ≥ now + 5 s, with a minute of skew to spare.
    expect(Math.max(...bounds.filter((b) => b < before))).toBeLessThanOrEqual(after - options.maxAlertAgeMs - CLAIM_PUSHDOWN_SKEW_MS);
    expect(Math.min(...bounds.filter((b) => b > before))).toBeGreaterThanOrEqual(before + 5_000);
  });
  it("widens the claim scan window by the skew allowance on both sides", () => {
    const w = claimScanWindow(120_000, Date.UTC(2026, 10, 12, 22, 0, 0));
    expect(w).toEqual({ from: "2026-11-12T21:57:00.000Z", to: "2026-11-12T22:01:00.000Z" });
  });
  it("expires stale target statuses without rewriting observations or manufacturing events", async () => {
    expect(await expireSourceInventory()).toBe(0);
    expect(SOURCE_STATUS_STALE_MS).toBe(30 * 60_000);
    const query = sqlState.queries[0];
    expect(query.sql).toContain("UPDATE store_sku_status SET status = 'unknown'");
    expect(query.sql).toContain("last_checked_at IS NULL");
    expect(query.params).toContain(30 * 60_000);
    const setClause = query.sql.split("WHERE")[0];
    expect(setClause).not.toMatch(/(?:last_checked_at|last_changed_at|last_available_at|\bsince)\s*=/);
    expect(query.sql).not.toMatch(/INSERT|availability_events|inventory_sync_outbox|poller_state/);
  });
  it("commits expiry separately before a source timeout rolls back the import", async () => {
    const destination = new PgInventoryDestination();
    await expect(destination.transaction(options.source, async () => { throw new Error("source unavailable"); })).rejects.toThrow("source unavailable");
    expect(sqlState.queries[0]).toMatchObject({ transaction: false });
    expect(sqlState.queries[0].sql).toContain("UPDATE store_sku_status");
    expect(sqlState.queries[1]).toMatchObject({ transaction: true });
  });
  it("normalizes stale imported available rows to unknown while retaining original timestamps", async () => {
    await new PgInventoryDestination().transaction(options.source, async (target) => { await target.statuses([stock(-1900)]); });
    const query = sqlState.queries.find((q) => q.sql.includes("INSERT INTO store_sku_status"))!;
    expect(query.sql).toMatch(/CASE WHEN last_checked_at IS NULL OR last_checked_at < now\(\) - \$\d+ \* interval '1 millisecond'/);
    expect(query.sql).toContain("THEN 'unknown' ELSE status END");
    expect(query.sql).toContain("excluded.last_checked_at >= store_sku_status.last_checked_at");
    const rows = JSON.parse(query.params.find((p) => typeof p === "string" && p.startsWith("[{")) as string);
    expect(rows[0].last_checked_at).toBe(at(-1900).toISOString());
    expect(rows[0].since).toBe(at(-100).toISOString());
  });
});
