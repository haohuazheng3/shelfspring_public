/** A new feed release must complete two successful source rounds; no inventory timestamp is invented. */
import { sql } from "drizzle-orm";
import { db } from "../../src/lib/db";

async function main() {
  const started = Date.now();
  const seen = new Set<string>();
  while (Date.now() - started < 120_000) {
    const result = await db().execute<{ value: { at?: string; mode?: string; error?: string } }>(sql`SELECT value FROM poller_state WHERE key = 'inventory-source'`);
    const feed = result.rows[0]?.value;
    if (feed?.mode === "source-sync" && !feed.error && feed.at && Date.parse(feed.at) >= started - 5_000) seen.add(feed.at);
    if (seen.size >= 2) { console.log("Inventory feed passed two successful source rounds"); return; }
    await new Promise((resolve) => setTimeout(resolve, 5_000));
  }
  throw new Error("Inventory feed did not pass its startup gate");
}
main().then(() => process.exit(0)).catch(() => { console.error("Inventory feed startup gate failed; inspect the destination feed status"); process.exit(1); });
