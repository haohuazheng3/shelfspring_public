import Stripe from "stripe";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, schema } from "./db";
import { stripe } from "./stripe";
import { env } from "./env";
import { notifyText } from "./i18n/notify";
import type { Lang } from "./i18n/locales";
import { SPEED, PLANS, comparePlans, planFromPrice, priceIdFor, effectivePlan, isPaidPlan, type PaidPlanKey } from "./plans";
import { acceptanceCheckoutParams, acceptanceCoupon, acceptanceOwner, assertAcceptanceTotal, validateAcceptanceAttempt } from "./billing-acceptance";
import { logOps } from "./ops";

const BILLING_APP = "shelfspring";

/** Upsert a subscription row from a Stripe subscription object (idempotent). */
export async function syncSubscription(sub: Stripe.Subscription, executor: Pick<ReturnType<typeof db>, "insert" | "update"> = db()): Promise<void> {
  const userId = sub.metadata?.userId;
  if (!userId || sub.metadata?.app !== BILLING_APP) throw new Error("Subscription does not belong to ShelfSpring");
  const item = sub.items.data[0];
  const price = item?.price as (Stripe.Price & { metadata?: Record<string, string> }) | undefined;
  const plan = planFromPrice(price ? { id: price.id, metadata: price.metadata, unit_amount: price.unit_amount } : { id: null });
  const alertLimit = PLANS[plan].limit;
  const periodEnd = item?.current_period_end ? new Date(item.current_period_end * 1000) : null;
  await executor
    .insert(schema.subscriptions)
    .values({
      id: sub.id,
      userId,
      model: "all",
      plan,
      alertLimit,
      status: sub.status,
      priceId: price?.id ?? null,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.subscriptions.id,
      set: {
        plan,
        alertLimit,
        status: sub.status,
        priceId: price?.id ?? null,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
        updatedAt: new Date(),
      },
    });
  // Link the customer id to the user for the billing portal.
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  await executor.update(schema.users).set({ stripeCustomerId: customerId }).where(eq(schema.users.id, userId));
  // Every rule of this user hangs off the current subscription (informational; coverage is computed).
  await executor.update(schema.watches).set({ subscriptionId: sub.id, updatedAt: new Date() }).where(eq(schema.watches.userId, userId));
}

export async function activeSubscriptionsFor(userId: string) {
  return db().select().from(schema.subscriptions).where(eq(schema.subscriptions.userId, userId));
}

/** Plan in force + the subscription row behind it (null on the free plan). */
export async function userPlan(userId: string) {
  return effectivePlan(await activeSubscriptionsFor(userId));
}

/**
 * Create a Checkout Session for a paid plan; returns the hosted URL. Subscriptions renew monthly
 * until cancelled — there is deliberately no one-off month. Link is offered next to cards via the
 * payment method configuration named in STRIPE_PMC_ID.
 */
/** Stripe's own locales for ours (Checkout, the billing portal). English: Stripe picks from the browser, as before. */
const STRIPE_LOCALE: Partial<Record<Lang, string>> = { ja: "ja", ko: "ko", "zh-TW": "zh-TW", "zh-HK": "zh-HK", de: "de", "de-CH": "de", fr: "fr", "fr-CA": "fr-CA", it: "it", es: "es", nl: "nl", sv: "sv" };

export async function createCheckout(userId: string, email: string, plan: PaidPlanKey, watchId?: string | null, lang: Lang = "en"): Promise<string> {
  const d = db();
  const key = `billing:checkout:${userId}`;
  const prepare = async (customerId?: string | null): Promise<CheckoutAttempt> => {
    const attemptId = randomUUID();
    const params = checkoutParams(userId, email, plan, watchId ?? null, customerId ?? undefined, lang, attemptId);
    const acceptance = await acceptanceCheckoutParams(stripe(), userId, email, customerId);
    Object.assign(params, acceptance);
    const coupon = acceptance.discounts?.[0]?.coupon;
    if (coupon) {
      params.metadata = { ...params.metadata, acceptanceCoupon: coupon };
      params.subscription_data!.metadata = { ...params.subscription_data!.metadata, acceptanceCoupon: coupon };
    }
    return { attemptId, createdAt: Date.now(), customerEmail: email, params };
  };
  const [user] = await d.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
  if (!user) throw new Error("Checkout requires an existing user");
  // Commit the request and its random id BEFORE contacting Stripe. A lost response / rolled-back
  // transaction can then retry the exact same request, including from another Vercel instance.
  const [existing] = await d.select().from(schema.appState).where(eq(schema.appState.key, key)).limit(1);
  if (!existing) await d.insert(schema.appState).values({ key, value: await prepare(user.stripeCustomerId) }).onConflictDoNothing();
  for (let pass = 0; pass < 4; pass++) {
    const result = await d.transaction(async (tx): Promise<string | null> => {
      const [row] = await tx.select().from(schema.appState).where(eq(schema.appState.key, key)).for("update");
      if (!row) throw new Error("Checkout attempt is missing");
      const attempt = row.value as CheckoutAttempt;
      if (!attempt.attemptId || !attempt.params || attempt.params.metadata?.userId !== userId || attempt.params.metadata?.app !== BILLING_APP) {
        throw new Error("Checkout attempt is invalid");
      }
      // Another tab may have finished paying since the API route first read the plan.
      const subscriptions = await tx.select().from(schema.subscriptions).where(eq(schema.subscriptions.userId, userId));
      if (effectivePlan(subscriptions).sub) return "/account";
      const s = stripe();
      let session: Stripe.Checkout.Session;
      if (attempt.sessionId) {
        session = await s.checkout.sessions.retrieve(attempt.sessionId, { expand: ["subscription"] });
      } else {
        // Stripe may prune idempotency keys after 24 h. An ambiguous old attempt must be reconciled,
        // never blindly replayed as a fresh charge. Normal expired sessions below can be renewed.
        if (Date.now() - attempt.createdAt > 23 * 60 * 60_000) throw new Error("Checkout attempt needs reconciliation before retrying");
        await validateAcceptanceAttempt(s, attempt.params, userId, email, user.stripeCustomerId ?? undefined);
        try {
          session = await s.checkout.sessions.create(attempt.params, { idempotencyKey: `checkout:${attempt.attemptId}` });
        } catch (e) {
          const err = e as { code?: string; param?: string };
          if (acceptanceCoupon(attempt.params) || !attempt.params.customer || err.code !== "resource_missing" || err.param !== "customer") throw e;
          // Keep the source site's recovery for a deleted Stripe customer. The fallback has its own
          // stable key and parameters; do not mutate the already-persisted original request.
          await tx.update(schema.users).set({ stripeCustomerId: null }).where(eq(schema.users.id, userId));
          session = await s.checkout.sessions.create({ ...attempt.params, customer: undefined, customer_email: attempt.customerEmail }, { idempotencyKey: `checkout:${attempt.attemptId}:new-customer` });
        }
        await tx.update(schema.appState).set({ value: { ...attempt, sessionId: session.id }, updatedAt: new Date() }).where(eq(schema.appState.key, key));
      }
      assertCheckoutOwner(session, userId);
      const sub = session.subscription && typeof session.subscription !== "string" ? session.subscription : null;
      if (session.status === "complete" && !(sub && ["canceled", "incomplete_expired"].includes(sub.status))) {
        assertAcceptanceTotal(session, acceptanceCoupon(attempt.params), acceptanceCoupon(attempt.params) ? attempt.params.customer : undefined);
        return `${env.siteUrl()}/checkout/success?session_id=${encodeURIComponent(session.id)}`;
      }
      const samePrice = attempt.params.line_items?.[0]?.price === priceIdFor(plan);
      if (session.status === "open" && (acceptanceCoupon(attempt.params) || acceptanceOwner(userId))) {
        try {
          await validateAcceptanceAttempt(s, attempt.params, userId, email, user.stripeCustomerId ?? undefined);
          assertAcceptanceTotal(session, acceptanceCoupon(attempt.params), acceptanceCoupon(attempt.params) ? attempt.params.customer : undefined);
        } catch (e) {
          // Revoked/expired acceptance must never fall through to a full-price session.
          await s.checkout.sessions.expire(session.id);
          throw e;
        }
      }
      if (session.status === "open" && samePrice && session.url) return session.url;
      // There can be only one payable session for this user. Changing plans first expires the old
      // session; a failure here leaves the old attempt intact instead of opening another checkout.
      if (session.status === "open") {
        try {
          await s.checkout.sessions.expire(session.id);
        } catch (e) {
          // Payment can finish while a second tab asks to switch plans. Reconcile that payment,
          // instead of either creating another checkout or reporting the successful payment lost.
          const latest = await s.checkout.sessions.retrieve(session.id);
          assertCheckoutOwner(latest, userId);
          if (latest.status === "complete") {
            assertAcceptanceTotal(latest, acceptanceCoupon(attempt.params), acceptanceCoupon(attempt.params) ? attempt.params.customer : undefined);
            return `${env.siteUrl()}/checkout/success?session_id=${encodeURIComponent(latest.id)}`;
          }
          throw e;
        }
      }
      else if (session.status !== "expired" && !sub) throw new Error("Checkout state is not ready to replace");
      const [currentUser] = await tx.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
      // A stopped acceptance stays stopped even if all operator settings were removed.
      if (acceptanceCoupon(attempt.params)) await validateAcceptanceAttempt(s, attempt.params, userId, email, user.stripeCustomerId ?? undefined);
      await tx.update(schema.appState).set({ value: await prepare(currentUser?.stripeCustomerId), updatedAt: new Date() }).where(eq(schema.appState.key, key));
      return null; // Commit the new attempt before the next pass calls Stripe.
    });
    if (result) return result;
  }
  throw new Error("Checkout changed in another tab. Please try again.");
}

interface CheckoutAttempt {
  attemptId: string;
  createdAt: number;
  customerEmail: string;
  params: Stripe.Checkout.SessionCreateParams;
  sessionId?: string;
}

function checkoutParams(userId: string, email: string, plan: PaidPlanKey, watchId: string | null, customerId: string | undefined, lang: Lang, attemptId: string): Stripe.Checkout.SessionCreateParams {
  const site = env.siteUrl();
  const meta = { userId, plan, watchId: watchId ?? "", app: BILLING_APP, checkoutAttempt: attemptId };
  return {
    mode: "subscription",
    // Payment methods are dynamic: a ShelfSpring-specific configuration (card + Link on) keeps the
    // shared account's other products untouched. Without it Stripe uses the account default.
    payment_method_configuration: env.stripePmc() || undefined,
    line_items: [{ price: priceIdFor(plan), quantity: 1 }],
    customer: customerId,
    customer_email: customerId ? undefined : email,
    ...(STRIPE_LOCALE[lang] ? { locale: STRIPE_LOCALE[lang] } : {}),
    client_reference_id: userId,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    success_url: `${site}/checkout/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}${watchId ? `&watch=${encodeURIComponent(watchId)}` : ""}`,
    cancel_url: `${site}/account?checkout=cancelled`,
    metadata: meta,
    subscription_data: { metadata: meta },
    custom_text: {
      // The line under Stripe's button in the page's own language: Arabic has no Stripe Checkout locale, so English there.
      submit: { message: notifyText(STRIPE_LOCALE[lang] ? lang : "en").checkoutSubmit(PLANS[plan].name, PLANS[plan].limit, SPEED.fastSec, SPEED.checkSec, SPEED.alertSec) },
    },
    // Per-session branding: the Stripe account is shared with sibling products, so the brand is set here.
    branding_settings: { display_name: "ShelfSpring", background_color: "#f6f7f5", button_color: "#0a7f49", border_style: "rounded" },
  } as Stripe.Checkout.SessionCreateParams;
}

export class CheckoutOwnershipError extends Error {}

/** No URL parameter can choose the owner, product, or payment result. */
export function assertCheckoutOwner(session: Stripe.Checkout.Session, userId: string): void {
  if (session.mode !== "subscription" || session.metadata?.app !== BILLING_APP || session.metadata?.userId !== userId || session.client_reference_id !== userId) {
    throw new CheckoutOwnershipError("Checkout is not available for this account");
  }
}

export interface VerifiedCheckout {
  state: "pending" | "inactive" | "active";
  sessionId: string;
  plan: PaidPlanKey;
  activePlan?: PaidPlanKey;
  amount: number | null;
  currency: string | null;
}

/** Stripe charge units (ISK / UGX still use two decimals; HUF / TWD charge units differ from payouts). */
export function checkoutAmount(amount: number, currency: string): number {
  const code = currency.toLowerCase();
  const zero = new Set(["bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga", "pyg", "rwf", "vnd", "vuv", "xaf", "xof", "xpf"]);
  return amount / (zero.has(code) ? 1 : 100);
}

/** The return-page path reconciles immediately; the independently verified webhook remains the fallback. */
export async function verifyAndSyncCheckout(sessionId: string, userId: string, source: "return" | "reconciliation" = "return"): Promise<VerifiedCheckout> {
  if (!/^cs_(?:live|test)_[A-Za-z0-9]+$/.test(sessionId)) throw new CheckoutOwnershipError("Invalid checkout reference");
  let s: Stripe.Checkout.Session;
  try {
    s = await stripe().checkout.sessions.retrieve(sessionId, { expand: ["subscription"] });
  } catch (e) {
    // A guessed/deleted URL is an ordinary 404, not a payment incident that can turn health red.
    if ((e as { code?: string }).code === "resource_missing") throw new CheckoutOwnershipError("Checkout was not found");
    throw e;
  }
  assertCheckoutOwner(s, userId);
  if (!isPaidPlan(s.metadata?.plan)) throw new Error("Checkout has no recognized plan");
  if (env.isProd() && !s.livemode) throw new Error("Production checkout is not in live mode");
  const result: VerifiedCheckout = { state: "pending", sessionId: s.id, plan: s.metadata.plan, amount: null, currency: s.currency };
  if (s.status !== "complete" || !["paid", "no_payment_required"].includes(s.payment_status)) return result;
  assertAcceptanceTotal(s);
  if (!s.subscription) throw new Error("Completed checkout has no subscription");
  const sub = typeof s.subscription === "string" ? await stripe().subscriptions.retrieve(s.subscription) : s.subscription;
  const customerId = (c: typeof sub.customer | typeof s.customer) => typeof c === "string" ? c : c?.id;
  if (sub.metadata?.app !== BILLING_APP || sub.metadata?.userId !== userId || customerId(sub.customer) !== customerId(s.customer)) {
    throw new CheckoutOwnershipError("Checkout subscription is not available for this account");
  }
  // A subscription can have been upgraded since this checkout. Permit any current site price, while
  // keeping the purchase event's plan/amount tied to the original, verified session.
  const price = sub.items.data[0]?.price;
  if (!price || !["plus", "pro", "max"].some((p) => price.id === priceIdFor(p as PaidPlanKey))) throw new Error("Subscription price does not belong to ShelfSpring");
  // The real outage drill must distinguish return-page recovery from an earlier webhook write.
  // Only the explicitly configured acceptance identity gets this extra observation and receipt.
  const acceptanceTrace = s.metadata?.acceptanceCoupon && process.env.ACCEPTANCE_USER_ID === userId;
  const beforeSyncAt = acceptanceTrace ? new Date().toISOString() : null;
  let observationKnown = false;
  let before: Awaited<ReturnType<typeof activeSubscriptionsFor>>[number] | undefined;
  if (acceptanceTrace) {
    try {
      before = (await activeSubscriptionsFor(userId)).find((row) => row.id === sub.id);
      observationKnown = true;
    } catch {
      // A diagnostic read is not allowed to block the normal payment recovery path.
      await logOps("web", "warn", "acceptance pre-sync observation unavailable", { source, sessionId: s.id });
    }
  }
  await syncSubscription(sub);
  // Read back the actual entitlement, without a cache, before telling the browser it is unlocked.
  const entitlement = await userPlan(userId);
  const active = ["active", "trialing"].includes(sub.status) && entitlement.sub?.id === sub.id;
  if (acceptanceTrace) await logOps("web", "info", "acceptance checkout verified and reconciled", {
    source, sessionId: s.id, subscriptionId: sub.id, beforeSyncAt, afterReadbackAt: new Date().toISOString(),
    observationKnown, entitlementExistedBefore: observationKnown ? Boolean(before) : null, previousStatus: before?.status ?? null, active,
  });
  return { ...result, state: active ? "active" : "inactive", activePlan: isPaidPlan(entitlement.plan.key) ? entitlement.plan.key : undefined, amount: s.amount_total == null || !s.currency ? null : checkoutAmount(s.amount_total, s.currency) };
}

/** Stripe refused because the API key lacks a permission (a restricted key), not because of the request. */
export function isPermissionError(e: unknown): boolean {
  const err = e as { type?: string; statusCode?: number; message?: string };
  return err?.type === "StripePermissionError" || err?.statusCode === 403 || /permission/i.test(err?.message ?? "");
}

export class BillingPermissionError extends Error {
  constructor(public missing: string) { super(`Stripe key lacks ${missing}`); }
}

/** What switching plans would do, shown before the user confirms. Money in cents (USD). */
export interface PlanChangePreview {
  from: PaidPlanKey; to: PaidPlanKey; upgrade: boolean;
  /** Charged today (upgrade) or credited to the account (downgrade, negative). */
  nowCents: number;
  /** Stripe's own figure (invoice preview) or our estimate from the days left in the period. */
  exact: boolean;
  /** The monthly price from the next renewal on, after any lasting discount. */
  monthlyCents: number;
  renewsAt: string | null;
  daysLeft: number;
  /** "Visa ·· 4242" when Stripe lets us read it. */
  card: string | null;
  /** Unix seconds: the moment the preview prices, sent back on confirm so the charge matches it. */
  prorationDate: number;
}

type Disc = { coupon?: Coupon | string | null; source?: { coupon?: Coupon | string | null } | null; end?: number | null };
type Coupon = { percent_off?: number | null; amount_off?: number | null; duration?: string | null };

/** The share of a price that is still paid under the subscription's discounts (1 = none, 0 = free). */
function paidShare(discounts: unknown[]): number {
  let share = 1;
  for (const d of discounts) {
    if (!d || typeof d !== "object") continue;
    const c = ((d as Disc).coupon ?? (d as Disc).source?.coupon) as Coupon | string | null | undefined;
    if (c && typeof c === "object" && c.percent_off) share *= 1 - c.percent_off / 100;
  }
  return Math.max(0, share);
}

export async function previewPlanChange(subscriptionId: string, to: PaidPlanKey): Promise<PlanChangePreview> {
  const s = stripe();
  // Discounts with their coupons (a promo code may take some or all of the price), when the key may read them.
  const sub = await s.subscriptions.retrieve(subscriptionId, { expand: ["discounts.source.coupon"] })
    .catch(() => s.subscriptions.retrieve(subscriptionId, { expand: ["discounts"] }))
    .catch(() => s.subscriptions.retrieve(subscriptionId));
  const item = sub.items.data[0];
  if (!item) throw new Error("subscription has no item");
  const from = planFromPrice({ id: item.price.id, metadata: item.price.metadata, unit_amount: item.price.unit_amount });
  const now = Math.floor(Date.now() / 1000);
  const start = item.current_period_start, end = item.current_period_end;
  const left = Math.max(0, Math.min(1, (end - now) / Math.max(1, end - start)));
  const share = paidShare((sub.discounts ?? []) as unknown[]);
  const oldCents = item.price.unit_amount ?? PLANS[from].priceUsd * 100, newCents = PLANS[to].priceUsd * 100;
  let nowCents = Math.round((newCents - oldCents) * left * share), exact = false;
  try {
    // Exact, when the key may read invoices: the invoice Stripe would raise right now for the switch.
    const inv = await s.invoices.createPreview({
      customer: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
      subscription: sub.id,
      subscription_details: { items: [{ id: item.id, price: priceIdFor(to) }], proration_behavior: "always_invoice", proration_date: now },
    });
    nowCents = inv.total; exact = true;
  } catch { /* estimate stands */ }
  let card: string | null = null;
  const pm = sub.default_payment_method ?? null;
  if (pm) {
    try {
      const m = typeof pm === "string" ? await s.paymentMethods.retrieve(pm) : pm;
      if (m.card) card = `${m.card.brand.charAt(0).toUpperCase()}${m.card.brand.slice(1)} ·· ${m.card.last4}`;
      else if (m.type === "link") card = "Link";
    } catch { /* not readable with this key */ }
  }
  return {
    from, to, upgrade: comparePlans(to, from) > 0, nowCents, exact,
    monthlyCents: Math.round(newCents * share), renewsAt: end ? new Date(end * 1000).toISOString() : null,
    daysLeft: Math.round(((end - now) / 86400) * 10) / 10, card, prorationDate: now,
  };
}

/**
 * Move an existing subscription to another paid plan, after the user confirmed the preview. The difference
 * is invoiced at once (an upgrade is charged, a downgrade becomes account credit), and with
 * pending_if_incomplete the new plan only takes hold once that payment succeeds: a card that needs the
 * bank's confirmation (3-D Secure) or is declined leaves the old plan in place ({ pending: true }).
 */
export async function changePlan(subscriptionId: string, plan: PaidPlanKey, prorationDate?: number): Promise<{ pending?: boolean }> {
  const s = stripe();
  try {
    const d = db(), key = `billing:plan:${subscriptionId}`;
    type ChangeAttempt = { attemptId: string; fromPrice: string; toPrice: string; periodStart: number; createdAt: number; completed?: boolean; params: Stripe.SubscriptionUpdateParams };
    await d.insert(schema.appState).values({ key, value: {} }).onConflictDoNothing();
    for (let pass = 0; pass < 4; pass++) {
      const result = await d.transaction(async (tx): Promise<{ sub?: Stripe.Subscription; pending?: boolean } | null> => {
        const [row] = await tx.select().from(schema.appState).where(eq(schema.appState.key, key)).for("update");
        if (!row) throw new Error("Plan change attempt is missing");
        // Serialize confirmation clicks across processes, then reread Stripe's actual current plan.
        const sub = await s.subscriptions.retrieve(subscriptionId);
        if (sub.metadata?.app !== BILLING_APP) throw new Error("Subscription does not belong to ShelfSpring");
        const item = sub.items.data[0];
        if (!item) throw new Error("subscription has no item");
        if (sub.pending_update) return { pending: true };
        const old = row.value as Partial<ChangeAttempt>;
        if (item.price.id === priceIdFor(plan)) {
          if (old.attemptId && !old.completed) await tx.update(schema.appState).set({ value: { ...old, completed: true }, updatedAt: new Date() }).where(eq(schema.appState.key, key));
          return { sub };
        }
        if (!old.attemptId || old.completed || old.fromPrice !== item.price.id || old.toPrice !== priceIdFor(plan) || old.periodStart !== item.current_period_start) {
          const now = Math.floor(Date.now() / 1000);
          const at = prorationDate && prorationDate <= now && now - prorationDate < 30 * 60 && prorationDate >= item.current_period_start ? prorationDate : now;
          const attempt: ChangeAttempt = {
            attemptId: randomUUID(), fromPrice: item.price.id, toPrice: priceIdFor(plan), periodStart: item.current_period_start, createdAt: Date.now(),
            params: { items: [{ id: item.id, price: priceIdFor(plan) }], proration_behavior: "always_invoice", proration_date: at, payment_behavior: "pending_if_incomplete" },
          };
          await tx.update(schema.appState).set({ value: attempt, updatedAt: new Date() }).where(eq(schema.appState.key, key));
          return null; // Persist exact proration parameters before the Stripe request.
        }
        const attempt = old as ChangeAttempt;
        if (Date.now() - attempt.createdAt > 23 * 60 * 60_000) throw new Error("Plan change needs reconciliation before retrying");
        // A plan change keeps the subscription going (pending updates take no other parameters).
        if (sub.cancel_at_period_end) await s.subscriptions.update(subscriptionId, { cancel_at_period_end: false }, { idempotencyKey: `plan:${attempt.attemptId}:resume` });
        const updated = await s.subscriptions.update(subscriptionId, attempt.params, { idempotencyKey: `plan:${attempt.attemptId}` });
        if (updated.pending_update) return { pending: true };
        let tagged = updated;
        try {
          tagged = await s.subscriptions.update(subscriptionId, { metadata: { ...updated.metadata, plan } }, { idempotencyKey: `plan:${attempt.attemptId}:tag` });
        } catch (e) {
          // Price metadata remains authoritative; a metadata-only failure must not repeat a charge.
          console.warn("[billing] plan changed but metadata update failed", e instanceof Error ? e.message : String(e));
        }
        await tx.update(schema.appState).set({ value: { ...attempt, completed: true }, updatedAt: new Date() }).where(eq(schema.appState.key, key));
        return { sub: tagged };
      });
      if (!result) continue;
      if (result.pending) return { pending: true };
      if (result.sub) { await syncSubscription(result.sub); return {}; }
    }
    throw new Error("Plan changed in another tab. Please try again.");
  } catch (e) {
    if (isPermissionError(e)) throw new BillingPermissionError("Subscriptions write");
    throw e;
  }
}

/**
 * Cancel at the end of the paid period — the plan keeps working until then and nothing more is charged —
 * or take that back before the period ends. Same as the customer portal's "cancel at period end".
 */
export async function setCancelAtPeriodEnd(subscriptionId: string, cancel: boolean): Promise<{ endsAt: string | null }> {
  try {
    const updated = await stripe().subscriptions.update(subscriptionId, { cancel_at_period_end: cancel });
    await syncSubscription(updated);
    const end = updated.items.data[0]?.current_period_end;
    return { endsAt: end ? new Date(end * 1000).toISOString() : null };
  } catch (e) {
    if (isPermissionError(e)) throw new BillingPermissionError("Subscriptions write");
    throw e;
  }
}

let portalConfig: string | null = null;
/** ShelfSpring's own customer-portal configuration (invoices, card, cancel at period end), found or created once. */
async function portalConfiguration(): Promise<string> {
  if (portalConfig) return portalConfig;
  if (env.stripePortalConfig()) return (portalConfig = env.stripePortalConfig());
  const s = stripe();
  const list = await s.billingPortal.configurations.list({ limit: 100 });
  const mine = list.data.find((c) => c.metadata?.app === "shelfspring" && c.active);
  if (mine) return (portalConfig = mine.id);
  const site = env.siteUrl();
  const created = await s.billingPortal.configurations.create({
    metadata: { app: "shelfspring" },
    business_profile: { headline: "ShelfSpring — iPhone pickup alerts", privacy_policy_url: `${site}/privacy`, terms_of_service_url: `${site}/terms` },
    default_return_url: `${site}/account`,
    features: {
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      subscription_cancel: { enabled: true, mode: "at_period_end" },
      // Plan switching happens in place through the API; Stripe's portal cannot list three monthly prices of one product.
      subscription_update: { enabled: false },
    },
  });
  return (portalConfig = created.id);
}

export async function portalUrl(customerId: string, flow?: { subscriptionId: string; returnTo: string }, lang: Lang = "en"): Promise<string> {
  const site = env.siteUrl();
  const session = await stripe().billingPortal.sessions.create({
    customer: customerId,
    configuration: await portalConfiguration(),
    return_url: `${site}/account`,
    ...(STRIPE_LOCALE[lang] ? { locale: STRIPE_LOCALE[lang] } : {}),
    ...(flow ? { flow_data: { type: "subscription_update", subscription_update: { subscription: flow.subscriptionId }, after_completion: { type: "redirect", redirect: { return_url: `${site}${flow.returnTo}` } } } } : {}),
  } as Stripe.BillingPortal.SessionCreateParams);
  return session.url;
}
