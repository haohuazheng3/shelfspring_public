import type Stripe from "stripe";
import { priceIdFor, type PaidPlanKey } from "./plans";
import { previewInventoryMode } from "./stock/inventory-mode";

const APP = "shelfspring";
export const ACCEPTANCE_PURPOSE = "production-zero-acceptance";
const MAX_TTL = 24 * 60 * 60;

export class AcceptanceCheckoutError extends Error {}

/** This is a temporary operator-configured discount, never a public promo-code lookup. */
export function acceptanceOwner(userId: string): boolean {
  return Boolean(process.env.ACCEPTANCE_USER_ID) && process.env.ACCEPTANCE_USER_ID === userId;
}

function config(userId: string, email: string, customerId: string | null | undefined) {
  const expires = Number(process.env.ACCEPTANCE_EXPIRES_AT);
  if (!acceptanceOwner(userId) || process.env.VERCEL_ENV !== "production" || previewInventoryMode()
    || !email || email !== process.env.ACCEPTANCE_EMAIL
    || !customerId || customerId !== process.env.ACCEPTANCE_CUSTOMER_ID
    || !process.env.ACCEPTANCE_COUPON_ID || !Number.isSafeInteger(expires)
    || expires <= Math.floor(Date.now() / 1000)) {
    throw new AcceptanceCheckoutError("Acceptance checkout is disabled, expired, or has a different owner");
  }
  return { couponId: process.env.ACCEPTANCE_COUPON_ID, customerId, expires };
}

/** Check Stripe afresh before creating or returning a still-payable acceptance Session. */
export async function acceptanceSettings(s: Stripe, userId: string, email: string, customerId: string | null | undefined) {
  if (!acceptanceOwner(userId)) return null;
  const c = config(userId, email, customerId);
  const plans: PaidPlanKey[] = ["plus", "pro", "max"];
  const [customer, coupon, prices] = await Promise.all([
    s.customers.retrieve(c.customerId), s.coupons.retrieve(c.couponId, { expand: ["applies_to"] }),
    Promise.all(plans.map((plan) => s.prices.retrieve(priceIdFor(plan)))),
  ]);
  if (customer.deleted || !customer.livemode || customer.email !== email
    || customer.metadata.app !== APP || customer.metadata.userId !== userId) {
    throw new AcceptanceCheckoutError("Acceptance customer identity does not match");
  }
  const products = prices.map((price, i) => {
    if (!price.active || !price.livemode || price.metadata.app !== APP || price.metadata.plan !== plans[i]
      || price.currency !== "usd" || price.unit_amount !== [500, 1000, 2000][i]
      || price.recurring?.interval !== "month" || price.recurring.interval_count !== 1) {
      throw new AcceptanceCheckoutError("Acceptance price does not belong to ShelfSpring");
    }
    return typeof price.product === "string" ? price.product : price.product.id;
  });
  const allowed = coupon.applies_to?.products ?? [];
  if (!coupon.valid || !coupon.livemode || coupon.name !== "haohua" || coupon.percent_off !== 100
    || coupon.amount_off != null || coupon.duration !== "once" || coupon.max_redemptions !== 1 || coupon.times_redeemed !== 0
    || coupon.redeem_by !== c.expires || coupon.redeem_by - coupon.created > MAX_TTL
    || coupon.metadata?.app !== APP || coupon.metadata.purpose !== ACCEPTANCE_PURPOSE
    || coupon.metadata.userId !== userId || coupon.metadata.customerId !== c.customerId
    || new Set(products).size !== 3 || allowed.length !== 3 || !products.every((id) => allowed.includes(id))) {
    throw new AcceptanceCheckoutError("Acceptance coupon restrictions do not match");
  }
  return c;
}

export async function acceptanceCheckoutParams(s: Stripe, userId: string, email: string, customerId: string | null | undefined): Promise<Partial<Stripe.Checkout.SessionCreateParams>> {
  const c = await acceptanceSettings(s, userId, email, customerId);
  if (!c) return {};
  // Stripe requires Session expiry at least 30 minutes ahead. Never extend the coupon's TTL.
  if (c.expires < Math.floor(Date.now() / 1000) + 31 * 60) throw new AcceptanceCheckoutError("Acceptance window is too short to open Checkout");
  return { allow_promotion_codes: undefined, discounts: [{ coupon: c.couponId }], payment_method_collection: "if_required", expires_at: c.expires };
}

export function acceptanceCoupon(params: Stripe.Checkout.SessionCreateParams): string | null {
  return typeof params.metadata?.acceptanceCoupon === "string" ? params.metadata.acceptanceCoupon : null;
}

export async function validateAcceptanceAttempt(s: Stripe, params: Stripe.Checkout.SessionCreateParams, userId: string, email: string, boundCustomerId = params.customer): Promise<void> {
  const marker = acceptanceCoupon(params);
  if (!marker && !acceptanceOwner(userId)) return;
  const c = config(userId, email, boundCustomerId);
  if (params.customer !== c.customerId || marker !== c.couponId || params.discounts?.length !== 1 || params.discounts[0]?.coupon !== c.couponId
    || params.payment_method_collection !== "if_required" || params.allow_promotion_codes
    || params.expires_at !== c.expires) {
    throw new AcceptanceCheckoutError("Existing checkout needs reconciliation before acceptance can start");
  }
  await acceptanceSettings(s, userId, email, params.customer);
}

/** Creating a Session does not charge it; inspect the actual total before exposing its URL. */
export function assertAcceptanceTotal(session: Stripe.Checkout.Session, expectedCoupon?: string | null, expectedCustomer?: string): void {
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
  if ((expectedCoupon && session.metadata?.acceptanceCoupon !== expectedCoupon) || (expectedCustomer && customerId !== expectedCustomer)
    || (session.metadata?.acceptanceCoupon && (session.amount_total !== 0 || session.currency !== "usd" || !session.livemode))) {
    throw new AcceptanceCheckoutError("Acceptance checkout did not total zero");
  }
}
