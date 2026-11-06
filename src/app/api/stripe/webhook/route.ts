import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { syncSubscription } from "@/lib/billing";
import { recordError, errorMessage } from "@/lib/errors";
import { logOps } from "@/lib/ops";
import { AcceptanceWebhookDrillError, maybeFailAcceptanceWebhook, notifyAcceptanceWebhookFailure } from "@/lib/billing-webhook-drill";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * subscriptions.retrieve needs a permission the organisation key may lack ("Permission denied … on
 * account"). That is not a failure of ours: return null and let the subscription events carry the data.
 */
async function retrieveIfAllowed(subId: string, where: string, notices: { subId: string; where: string }[]): Promise<Stripe.Subscription | null> {
  try {
    return await stripe().subscriptions.retrieve(subId);
  } catch (e) {
    const err = e as { statusCode?: number; code?: string; message?: string };
    if (err.statusCode === 403 || /permission/i.test(err.message ?? "")) {
      notices.push({ subId, where });
      return null;
    }
    throw e;
  }
}

/** Stripe → us. Signature-verified, idempotent by event id. */
export async function POST(req: Request) {
  const secret = env.stripeWebhookSecret();
  const sig = req.headers.get("stripe-signature");
  if (!secret || !sig) return NextResponse.json({ error: "not configured" }, { status: 503 });
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    return NextResponse.json({ error: `invalid signature: ${errorMessage(e)}` }, { status: 400 });
  }
  // The Stripe account is shared with sibling products: only objects tagged app=shelfspring are
  // ours. Our sessions and subscriptions always carry that tag; invoices carry it on the subscription.
  const obj = event.data.object as { metadata?: Record<string, string>; parent?: { subscription_details?: { metadata?: Record<string, string> } } };
  const tag = obj?.metadata?.app ?? obj?.parent?.subscription_details?.metadata?.app;
  if (tag !== "shelfspring") return NextResponse.json({ ignored: tag ? "other app" : "untagged object" });

  const notices: { subId: string; where: string }[] = [];
  try {
    await maybeFailAcceptanceWebhook(event);
    const result = await db().transaction(async (tx) => {
      // Same-event deliveries wait for the first transaction to finish. A failure rolls back
      // both subscription writes and its completed marker, so Stripe retries can do the work.
      // Every database write below uses tx: no nested connection waits on small pools.
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext('shelfspring:stripe-webhook'), hashtext(${event.id}))`);
      const [done] = await tx.select({ id: schema.stripeEvents.id }).from(schema.stripeEvents).where(eq(schema.stripeEvents.id, event.id)).limit(1);
      if (done) return { duplicate: true };
      switch (event.type) {
        case "checkout.session.completed": {
          // The subscription itself arrives as customer.subscription.created (same second, full object).
          // Retrieving it here needs the "Subscriptions" permission the organisation key does not have,
          // so: remember the customer, try the retrieve, and treat a permission error as "nothing to do".
          const s = event.data.object as Stripe.Checkout.Session;
          const customerId = typeof s.customer === "string" ? s.customer : s.customer?.id;
          const userId = s.metadata?.userId ?? s.client_reference_id ?? undefined;
          if (customerId && userId) await tx.update(schema.users).set({ stripeCustomerId: customerId }).where(eq(schema.users.id, userId));
          if (s.mode === "subscription" && s.subscription) {
            const subId = typeof s.subscription === "string" ? s.subscription : s.subscription.id;
            const sub = await retrieveIfAllowed(subId, event.type, notices);
            if (sub) await syncSubscription(sub, tx);
          }
          break;
        }
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          await syncSubscription(event.data.object as Stripe.Subscription, tx);
          break;
        }
        case "invoice.paid":
        case "invoice.payment_failed": {
          // Renewals: the invoice carries the new period; a retrieve is only a bonus (see above).
          const inv = event.data.object as Stripe.Invoice;
          const subRef = inv.parent?.subscription_details?.subscription;
          const subId = typeof subRef === "string" ? subRef : subRef?.id;
          if (!subId) break;
          const sub = await retrieveIfAllowed(subId, event.type, notices);
          if (sub) { await syncSubscription(sub, tx); break; }
          const periodEnd = inv.lines?.data?.reduce<number | null>((a, l) => (l.period?.end && (!a || l.period.end > a) ? l.period.end : a), null);
          await tx
            .update(schema.subscriptions)
            .set({ status: event.type === "invoice.paid" ? "active" : "past_due", ...(periodEnd ? { currentPeriodEnd: new Date(periodEnd * 1000) } : {}), updatedAt: new Date() })
            .where(eq(schema.subscriptions.id, subId));
          break;
        }
        default:
          break;
      }
      await tx.insert(schema.stripeEvents).values({ id: event.id, type: event.type });
      return { received: true };
    });
    // Logging uses its own pool connection, only after the transaction has released its connection.
    for (const { subId, where } of notices) {
      await logOps("web", "info", `stripe ${where}: subscription retrieve not permitted, relying on subscription events`, { subId });
    }
    return NextResponse.json(result);
  } catch (e) {
    await recordError("web", `stripe webhook ${event.type}: ${errorMessage(e)}`, { eventId: event.id });
    if (e instanceof AcceptanceWebhookDrillError) await notifyAcceptanceWebhookFailure(e);
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }
}
