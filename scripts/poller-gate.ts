/**
 * update.sh's release gate (infra/linode/cloud-init.yaml), run through the poller's own database connection so it
 * also works on a host without a database of its own (the US worker): how many rounds this host finished since the
 * restart — full US sweeps covering ≥ 250 stores, rounds of the other countries covering ≥ 150 — plus two for an
 * alive record with no duty at all (a standby, or a primary whose US runs on the worker). update.sh wants ≥ 2.
 *
 *   node --import tsx scripts/poller-gate.ts <host label> <since, epoch seconds>
 */
import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "../src/lib/db";

async function main() {
  const [host, since] = process.argv.slice(2);
  if (!host || !/^\d+$/.test(since ?? "")) {
    console.error("usage: poller-gate.ts <host> <since-epoch-sec>");
    process.exit(2);
  }
  const at = new Date(Number(since) * 1000);
  const r = await db().execute(sql`
    select (select count(*) from sweeps where host = ${host} and started_at > ${at} and finished_at is not null
              and ((mode = 'full' and stores_covered >= 250) or (mode = 'intl' and stores_covered >= 150)))
         + (select count(*) * 2 from poller_state where key = ${`alive:${host}`} and updated_at > ${at} and value->>'duties' = 'none') as n`);
  console.log(Number((r.rows[0] as { n: number | string } | undefined)?.n ?? 0));
}

// The package is CommonJS for tsx: no top-level await.
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
