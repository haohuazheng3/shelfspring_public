/** Separate feed process. Never imports main.ts, an Apple fetcher, cluster promotion or fallback sweeps. */
import "dotenv/config";
import { notifyRestocks } from "../src/lib/stock/notify";
import { recordError } from "../src/lib/errors";
import { dispatchInventoryAlerts, markInterruptedClaims, PgInventoryDestination, PgInventoryOutbox,
  ReadonlyInventorySource, recordSourceFailure, safeSyncError, syncInventoryOnce, syncOptions } from "../src/lib/stock/source-sync";

async function main() {
  if (process.env.INVENTORY_FEED_MODE !== "source") throw new Error("INVENTORY_FEED_MODE must be source");
  const options = syncOptions();
  const source = new ReadonlyInventorySource();
  const destination = new PgInventoryDestination();
  const outbox = new PgInventoryOutbox();
  let stopping = false;
  process.on("SIGTERM", () => { stopping = true; });
  process.on("SIGINT", () => { stopping = true; });
  try {
    const interrupted = options.notificationsEnabled ? await markInterruptedClaims(options.source) : 0;
    if (interrupted) await recordError("poller", "Inventory notification claims need manual review", { count: interrupted });
    console.log(`[inventory-source] started; interval=${options.intervalMs}ms; inventory timestamps are preserved`);
    let consecutiveFailures = 0;
    while (!stopping) {
      const start = Date.now();
      try {
        await syncInventoryOnce(source, destination, options);
        if (options.notificationsEnabled) await dispatchInventoryAlerts(outbox, options, notifyRestocks);
        consecutiveFailures = 0;
      } catch (error) {
        consecutiveFailures++;
        const message = safeSyncError(error);
        console.error(`[inventory-source] ${message}`);
        await recordSourceFailure(error).catch(() => undefined);
        if (consecutiveFailures === 1 || consecutiveFailures % 12 === 0) await recordError("poller", message, { consecutiveFailures });
      }
      if (!stopping) await new Promise((resolve) => setTimeout(resolve, Math.max(100, options.intervalMs - (Date.now() - start))));
    }
  } finally { await source.close(); }
}
main().then(() => process.exit(0)).catch((error) => { console.error(safeSyncError(error)); process.exit(1); });
