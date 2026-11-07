import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { types, type Client } from "pg";
import { PgSharedInventoryFeed } from "@/lib/stock/shared-inventory";
import { inventoryDate, PgInventoryOutbox, syncOptions } from "@/lib/stock/source-sync";
const binding = vi.hoisted(() => ({ database: undefined as unknown }));
vi.mock("@/lib/db", () => ({ db: () => binding.database }));
const timestamp = "2026-11-07 02:41:19.557+00";
let invalid = false;
let nullable = false;
const rawTypes: unknown[] = [];
beforeEach(() => {
  vi.stubEnv("VERCEL_ENV", "production"); vi.stubEnv("PREVIEW_INVENTORY_MODE", "0");
  invalid = false; nullable = false; rawTypes.length = 0;
  // Real Drizzle supplies its raw-query type parser to this node-postgres driver fixture.
  binding.database = drizzle({ query: async (query: { text: string; types?: { getTypeParser: typeof types.getTypeParser } }) => {
    const text = typeof query === "string" ? query : query.text;
    const parse = query.types?.getTypeParser(types.builtins.TIMESTAMPTZ, "text");
    const at = parse ? parse(invalid ? "invalid" : timestamp) : timestamp;
    if (parse) rawTypes.push(at);
    const event = { id: "42", source_event_id: "42", event_id: "42", store_number: "R001", part_number: "TEST/A",
      kind: "restock", quote: null, at, first_seen: false, seen_until: nullable ? null : at };
    return { rows: text.includes("current_user AS role") ? [{ schema: "shelfspring", role: "shelfspring_poller" }]
      : text.includes("pg_try_advisory_xact_lock") ? [{ acquired: true }]
      : text.includes("clock_timestamp()") ? [{ at }]
      : text.includes("SELECT c.*") || text.includes("SELECT e.id::text") ? [event] : [] };
  } } as unknown as Client);
});
afterEach(() => vi.unstubAllEnvs());
describe("raw Drizzle inventory timestamps", () => {
  it("normalizes clock, cursor and overlap timestamps without losing milliseconds", async () => {
    await new PgSharedInventoryFeed().transaction("pickupchecker", async ({ reader }) => {
      expect((await reader.now()).toISOString()).toBe("2026-11-07T02:41:19.557Z");
      for (const events of [await reader.events("0", 1), await reader.overlap("42", new Date(timestamp), 1, 1)]) {
        expect(events[0].at).toBeInstanceOf(Date);
        expect(events[0].seen_until?.getTime()).toBe(events[0].at.getTime());
      }
      nullable = true;
      expect((await reader.events("0", 1))[0].seen_until).toBeNull();
    });
    expect(rawTypes.length).toBeGreaterThan(0);
    expect(rawTypes.every(value => typeof value === "string")).toBe(true);
  });
  it("normalizes claimed alerts before passing transitions to notification delivery", async () => {
    const result = await new PgInventoryOutbox().claim(syncOptions({}));
    expect(result.alerts[0].transition.at.toISOString()).toBe("2026-11-07T02:41:19.557Z");
    expect(result.alerts[0].transition.seenUntil).toEqual(result.alerts[0].transition.at);
    nullable = true;
    expect((await new PgInventoryOutbox().claim(syncOptions({}))).alerts[0].transition.seenUntil).toBeNull();
  });
  it("rejects invalid or missing timestamps instead of advancing cursors or delivering", async () => {
    invalid = true;
    await expect(new PgSharedInventoryFeed().transaction("pickupchecker", ({ reader }) => reader.now())).rejects.toThrow("Invalid inventory timestamp");
    await expect(new PgSharedInventoryFeed().transaction("pickupchecker", ({ reader }) => reader.events("0", 1))).rejects.toThrow("Invalid inventory timestamp");
    await expect(new PgInventoryOutbox().claim(syncOptions({}))).rejects.toThrow("Invalid inventory timestamp");
    for (const value of [null, undefined, 0, new Date(NaN)]) expect(() => inventoryDate(value)).toThrow("Invalid inventory timestamp");
    const date = new Date(timestamp); expect(inventoryDate(date)).toBe(date);
  });
});
