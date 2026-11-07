/** Separate feed process. Never imports main.ts, an Apple fetcher, cluster promotion or fallback sweeps. */
import "dotenv/config";
import { notifyRestocks } from "../src/lib/stock/notify";
import { recordError } from "../src/lib/errors";
import { PgSharedInventoryFeed, syncSharedInventoryOnce } from "../src/lib/stock/shared-inventory";
import { SharedInventoryLeader } from "../src/lib/stock/shared-leader";
import { sharedInventoryMode } from "../src/lib/stock/inventory-mode";
import { dispatchInventoryAlerts, markInterruptedClaims, PgInventoryDestination, PgInventoryOutbox,
  ReadonlyInventorySource, recordSourceFailure, safeSyncError, syncInventoryOnce, syncOptions } from "../src/lib/stock/source-sync";

async function main() {
  if (!["source", "shared"].includes(process.env.INVENTORY_FEED_MODE ?? "")) throw new Error("INVENTORY_FEED_MODE must be source or shared");
  const shared = sharedInventoryMode();
  const options = syncOptions();
  const source = shared ? null : new ReadonlyInventorySource();
  const destination = new PgInventoryDestination();
  const sharedFeed = new PgSharedInventoryFeed();
  const leadership = shared ? new SharedInventoryLeader() : null;
  const outbox = new PgInventoryOutbox();
  const ownsFeed = async () => {
    if (!leadership) return true;
    const ownership = await leadership.check();
    if (ownership.acquired && options.notificationsEnabled) {
      const abandoned = await markInterruptedClaims(options.source);
      if (abandoned) await recordError("poller", "Inventory notification claims need manual review", { count: abandoned });
    }
    return ownership.leader;
  };
  let stopping = false;
  process.on("SIGTERM", () => { stopping = true; });
  process.on("SIGINT", () => { stopping = true; });
  try {
    const interrupted = !shared && options.notificationsEnabled ? await markInterruptedClaims(options.source) : 0;
    if (interrupted) await recordError("poller", "Inventory notification claims need manual review", { count: interrupted });
    console.log(`[inventory-source] started; interval=${options.intervalMs}ms; inventory timestamps are preserved`);
    let consecutiveFailures = 0;
    while (!stopping) {
      const start = Date.now();
      try {
        if (await ownsFeed()) {
          if (shared) await syncSharedInventoryOnce(sharedFeed, options);
          else await syncInventoryOnce(source!, destination, options);
          // Re-read original cluster authority before claiming anything that can send.
          if (options.notificationsEnabled && await ownsFeed()) {
            await dispatchInventoryAlerts(outbox, options, notifyRestocks,
              leadership ? async () => (await leadership.check(false)).leader : undefined);
          }
        }
        consecutiveFailures = 0;
      } catch (error) {
        consecutiveFailures++;
        const message = safeSyncError(error);
        console.error(`[inventory-source] ${message}`);
        if (!leadership || (await leadership.check(false)).leader) {
          await recordSourceFailure(error).catch(() => undefined);
          if (consecutiveFailures === 1 || consecutiveFailures % 12 === 0) await recordError("poller", message, { consecutiveFailures });
        }
      }
      if (!stopping) await new Promise((resolve) => setTimeout(resolve, Math.max(100, options.intervalMs - (Date.now() - start))));
    }
  } finally { await source?.close(); await leadership?.release(); }
}
main().then(() => process.exit(0)).catch((error) => { console.error(safeSyncError(error)); process.exit(1); });
