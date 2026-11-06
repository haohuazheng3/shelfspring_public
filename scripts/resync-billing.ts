/**
 * Rebuild users + subscriptions from Clerk and Stripe (idempotent). Every subscription tagged
 * metadata.app=shelfspring gets its user row (email from Clerk) and its subscription row, exactly as
 * the webhook would have written them. For a database restored without those tables, or one that missed
 * webhooks while it was down.
 *   DATABASE_URL DATABASE_CA STRIPE_ORG_API STRIPE_CONTEXT CLERK_SECRET_KEY  npx tsx scripts/resync-billing.ts
 */
import { db, schema } from "../src/lib/db";
import { stripe } from "../src/lib/stripe";
import { syncSubscription } from "../src/lib/billing";

async function clerkEmail(userId: string): Promise<string | null> {
  const r = await fetch(`https://api.clerk.com/v1/users/${encodeURIComponent(userId)}`, { headers: { authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` } });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`Clerk user lookup failed (${r.status})`);
  const u = (await r.json()) as { primary_email_address_id?: string; email_addresses?: { id: string; email_address: string }[] };
  return u.email_addresses?.find((e) => e.id === u.primary_email_address_id)?.email_address ?? u.email_addresses?.[0]?.email_address ?? null;
}

async function main() {
  const required = ["DATABASE_URL", "STRIPE_ORG_API", "STRIPE_CONTEXT", "CLERK_SECRET_KEY"];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  let synced = 0, skipped = 0;
  for await (const sub of stripe().subscriptions.list({ status: "all", limit: 100 })) {
    const userId = sub.metadata?.userId;
    if (sub.metadata?.app !== "shelfspring" || !userId) { skipped++; continue; }
    const email = await clerkEmail(userId);
    if (!email) { console.warn(`[resync] ${sub.id}: no Clerk user ${userId}`); skipped++; continue; }
    await db().insert(schema.users).values({ id: userId, email }).onConflictDoNothing();
    await syncSubscription(sub);
    synced++;
    console.log(`[resync] ${sub.id} ${sub.status}`);
  }
  console.log(`[resync] ${synced} subscriptions synced, ${skipped} skipped (other apps or no user)`);
}
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
