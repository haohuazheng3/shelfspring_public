/** Run seed.ts first. Reads only public inventory; no artifacts or source credentials are written to disk. */
import "dotenv/config";
import { importInventoryHistory, PgInventoryDestination, ReadonlyInventorySource, safeSyncError, syncOptions } from "../src/lib/stock/source-sync";

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--repair") || args.length > 1) throw new Error("Unsupported history import option");
  const repair = args.includes("--repair");
  if (repair) {
    const destination = new URL(process.env.DATABASE_URL || "");
    if (process.env.INVENTORY_FEED_MODE !== "source" || process.env.INVENTORY_HISTORY_REPAIR_ALLOWED !== "1"
      || destination.hostname !== "127.0.0.1" || !["/shelfspring", "/shelfspring_preview"].includes(destination.pathname)
      || process.env.DATABASE_URL_STANDBY || process.env.DATABASE_URL_UNPOOLED) {
      throw new Error("History repair must run through the dedicated host bootstrap");
    }
  }
  const source = new ReadonlyInventorySource();
  try {
    const result = await importInventoryHistory(source, new PgInventoryDestination(), syncOptions(), { repair });
    console.log(JSON.stringify({ imported: result.imported, repaired: result.repaired ?? false, events: result.events, statuses: result.statuses, reports: result.reports,
      cutoverAt: result.state.cutoverAt, message: result.repaired ? "Inventory history repaired without notifications; original cutover preserved"
        : result.imported ? "Inventory history imported without notifications" : "Inventory history already imported" }));
  } finally { await source.close(); }
}
main().then(() => process.exit(0)).catch((error) => { console.error(safeSyncError(error)); process.exit(1); });
