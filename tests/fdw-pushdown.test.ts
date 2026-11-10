import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { daysAgo } from "@/lib/stock/since";

// The stock tables are postgres_fdw foreign tables (2026-11-10): a "last N days" bound written as now() - interval …
// is not shipped to PickupChecker's database, so every row is fetched and filtered locally. Bounds go in as
// parameters (daysAgo); fixed-width filters inside aggregates (count(*) filter (where at > now() - interval '24 hours'))
// are fine because the WHERE clause already limits the rows fetched.
const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.(ts|tsx)$/.test(f) ? [p] : [];
  });

const FOREIGN = /availability_events|availabilityEvents|restock_reports|restockReports|\b(ev|rr)\./;
const lines = (f: string) => readFileSync(f, "utf8").split("\n");

describe("window bounds on foreign stock tables are parameters", () => {
  it("no now()-based N-day window in site queries", () => {
    const bad = files(join(__dirname, "..", "src")).flatMap((f) =>
      readFileSync(f, "utf8")
        .split("\n")
        .map((line, i) => ({ f, i: i + 1, line }))
        .filter(({ line }) => /now\(\)\s*-\s*(make_interval|interval '1 day'\s*\*)/.test(line) || /gt\([^)]*sql`now\(\)/.test(line))
        // Only the event tables: poller_state, sweeps and poll_log are local, and store_sku_status is read whole anyway.
        .filter(({ i, line }) => FOREIGN.test(line) || FOREIGN.test(lines(f).slice(Math.max(0, i - 7), i).join("\n"))),
    );
    expect(bad.map((b) => `${b.f}:${b.i}`)).toEqual([]);
  });
  it("daysAgo counts back whole days from now", () => {
    expect(daysAgo(30, Date.parse("2026-11-10T00:00:00Z")).toISOString()).toBe("2026-10-11T00:00:00.000Z");
  });
});
