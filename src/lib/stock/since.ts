/**
 * The start of a "last N days" window, computed here and sent as a query parameter.
 *
 * Since 2026-11-10 the stock tables (availability_events, restock_reports, store_sku_status…) are postgres_fdw
 * foreign tables over PickupChecker's database. postgres_fdw only ships conditions it can evaluate remotely:
 * `at > now() - interval …` stays local (now() is not shippable), so the whole table is fetched over the wire and
 * filtered here — slower every day as the events grow. A bound parameter is shipped, and the remote side uses its
 * index on `at`. Keep window bounds in WHERE clauses on those tables as parameters (tests/fdw-pushdown.test.ts).
 */
export function daysAgo(days: number, now: number = Date.now()): Date {
  return new Date(now - days * 86_400_000);
}
