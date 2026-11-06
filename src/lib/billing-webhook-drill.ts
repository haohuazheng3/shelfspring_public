import type Stripe from "stripe";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "./db";
import { recordError, errorMessage } from "./errors";
import { notifyOwner } from "./mail/owner";
import { logOps } from "./ops";
import { previewInventoryMode } from "./stock/inventory-mode";

interface DrillTarget {
  eventId: string;
  eventType: string;
  userId: string;
  customerId: string;
  couponId: string;
  expiresAt: number;
}

export class AcceptanceWebhookDrillError extends Error {
  constructor(readonly target: DrillTarget) {
    super("Intentional zero-total acceptance webhook failure (once per event)");
  }
}

/** Only call with the Event returned by Stripe's signature verifier, never raw request JSON. */
export function acceptanceWebhookDrillTarget(event: Stripe.Event, config: Record<string, string | undefined> = process.env, now = Math.floor(Date.now() / 1000)): DrillTarget | null {
  const until = Number(config.ACCEPTANCE_WEBHOOK_FAIL_UNTIL);
  const acceptanceExpiry = Number(config.ACCEPTANCE_EXPIRES_AT);
  // Optional low-email mode. An unsupported/typo value disables injection, never widens it.
  const selectedType = config.ACCEPTANCE_WEBHOOK_EVENT_TYPE;
  if (selectedType && (selectedType !== "checkout.session.completed" || event.type !== selectedType)) return null;
  if (config.VERCEL_ENV !== "production" || previewInventoryMode(config) || config.ACCEPTANCE_FAIL_WEBHOOK !== "once"
    || !Number.isSafeInteger(until) || until <= now || until > now + 15 * 60
    || !Number.isSafeInteger(acceptanceExpiry) || until > acceptanceExpiry
    || !config.ACCEPTANCE_EMAIL || !/^user_[A-Za-z0-9]+$/.test(config.ACCEPTANCE_USER_ID ?? "")
    || !/^cus_[A-Za-z0-9]+$/.test(config.ACCEPTANCE_CUSTOMER_ID ?? "") || !config.ACCEPTANCE_COUPON_ID
    || !event.livemode || !/^evt_[A-Za-z0-9]+$/.test(event.id)
    || !Number.isSafeInteger(event.created) || event.created < until - 15 * 60 || event.created > now + 60
    || (config.ACCEPTANCE_WEBHOOK_EVENT_ID && config.ACCEPTANCE_WEBHOOK_EVENT_ID !== event.id)) return null;

  // Initial zero-total purchase only. Cancellation/renewal/failure events are never held back.
  if (!["checkout.session.completed", "customer.subscription.created", "invoice.paid"].includes(event.type)) return null;
  const object = event.data.object as unknown as {
    livemode?: boolean; metadata?: Record<string, string>; customer?: string | { id: string };
    mode?: string; payment_status?: string; amount_total?: number; currency?: string; total?: number; amount_paid?: number;
    parent?: { subscription_details?: { metadata?: Record<string, string> } };
  };
  const meta = event.type === "invoice.paid" ? object.parent?.subscription_details?.metadata : object.metadata;
  const customerId = typeof object.customer === "string" ? object.customer : object.customer?.id;
  if (!object.livemode || meta?.app !== "shelfspring" || meta.userId !== config.ACCEPTANCE_USER_ID
    || meta.acceptanceCoupon !== config.ACCEPTANCE_COUPON_ID || customerId !== config.ACCEPTANCE_CUSTOMER_ID) return null;
  if (event.type === "checkout.session.completed" && (object.mode !== "subscription" || object.amount_total !== 0
    || object.currency !== "usd" || !["paid", "no_payment_required"].includes(object.payment_status ?? ""))) return null;
  if (event.type === "invoice.paid" && (object.total !== 0 || object.amount_paid !== 0 || object.currency !== "usd")) return null;
  return { eventId: event.id, eventType: event.type, userId: config.ACCEPTANCE_USER_ID!,
    customerId: config.ACCEPTANCE_CUSTOMER_ID!, couponId: config.ACCEPTANCE_COUPON_ID, expiresAt: until };
}

/** Commit the failure claim separately, so retry/restart cannot inject the same failure twice. */
export async function maybeFailAcceptanceWebhook(event: Stripe.Event): Promise<void> {
  const target = acceptanceWebhookDrillTarget(event);
  if (!target) return;
  const claimed = await db().transaction(async (tx) => {
    // Same lock as the real handler: a completed delivery wins over a later drill/replay.
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext('shelfspring:stripe-webhook'), hashtext(${event.id}))`);
    const [done] = await tx.select({ id: schema.stripeEvents.id }).from(schema.stripeEvents).where(eq(schema.stripeEvents.id, event.id)).limit(1);
    if (done) return false;
    const inserted = await tx.insert(schema.appState).values({
      key: `acceptance:webhook-once:${target.couponId}:${target.eventId}`,
      value: { ...target, claimedAt: new Date().toISOString() },
    }).onConflictDoNothing().returning({ key: schema.appState.key });
    return inserted.length === 1;
  });
  if (claimed) throw new AcceptanceWebhookDrillError(target);
}

/** The ordinary error-inbox path runs first. Provider acceptance is not mailbox-delivery proof. */
export async function notifyAcceptanceWebhookFailure(error: AcceptanceWebhookDrillError): Promise<void> {
  const { eventId, eventType, expiresAt } = error.target;
  try {
    const accepted = await notifyOwner("[ShelfSpring] Acceptance webhook failed once", [
      "A deliberately scoped production zero-total acceptance event returned HTTP 500.",
      `Event: ${eventId} (${eventType})`,
      `Drill deadline: ${new Date(expiresAt * 1000).toISOString()}`,
      "The return-page verification remains active. Retry this event: its durable drill claim prevents a second injected failure.",
      "Verify immediate browser unlock, the error inbox, this alert, and the subsequent endpoint HTTP 200. Clear the drill settings after verification.",
    ].join("\n"));
    if (!accepted) throw new Error("No owner notification provider accepted the drill alert");
    await logOps("web", "info", "acceptance webhook drill owner alert accepted", { eventId });
  } catch (e) {
    await recordError("web", `acceptance webhook drill owner alert failed: ${errorMessage(e)}`, { eventId });
  }
}
