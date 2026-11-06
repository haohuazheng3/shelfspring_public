import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";
import { acceptanceCheckoutParams, assertAcceptanceTotal, validateAcceptanceAttempt } from "@/lib/billing-acceptance";

const now = 1_800_000_000;
const expires = now + 3_600;
let customer: Record<string, unknown>;
let coupon: Record<string, unknown>;
let prices: Record<string, Record<string, unknown>>;
const api = {
  customers: { retrieve: vi.fn(async () => customer) },
  coupons: { retrieve: vi.fn(async (_id: string, params?: { expand?: string[] }) =>
    params?.expand?.includes("applies_to") ? coupon : { ...coupon, applies_to: null }) },
  prices: { retrieve: vi.fn(async (id: string) => prices[id]) },
};
const stripe = api as unknown as Stripe;

beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(now * 1_000); vi.clearAllMocks();
  for (const [name, value] of Object.entries({
    VERCEL_ENV: "production", PREVIEW_INVENTORY_MODE: "", ACCEPTANCE_USER_ID: "user_owner",
    ACCEPTANCE_EMAIL: "owner@example.test", ACCEPTANCE_CUSTOMER_ID: "cus_owner", ACCEPTANCE_COUPON_ID: "coupon_acceptance",
    ACCEPTANCE_EXPIRES_AT: String(expires), STRIPE_PRICE_MONTHLY: "price_plus", STRIPE_PRICE_PRO: "price_pro", STRIPE_PRICE_MAX: "price_max",
  })) vi.stubEnv(name, value);
  customer = { id: "cus_owner", livemode: true, email: "owner@example.test", metadata: { app: "shelfspring", userId: "user_owner" } };
  coupon = { id: "coupon_acceptance", livemode: true, valid: true, name: "haohua", percent_off: 100, amount_off: null,
    duration: "once", max_redemptions: 1, times_redeemed: 0, created: now - 60, redeem_by: expires,
    metadata: { app: "shelfspring", purpose: "production-zero-acceptance", userId: "user_owner", customerId: "cus_owner" },
    applies_to: { products: ["prod_plus", "prod_pro", "prod_max"] } };
  prices = Object.fromEntries(["plus", "pro", "max"].map((plan, i) => [`price_${plan}`, { id: `price_${plan}`, product: `prod_${plan}`,
    active: true, livemode: true, metadata: { app: "shelfspring", plan }, currency: "usd", unit_amount: [500, 1000, 2000][i], recurring: { interval: "month", interval_count: 1 } }]));
});
afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); });

const prepare = (user = "user_owner", email = "owner@example.test", customerId: string | null = "cus_owner") => acceptanceCheckoutParams(stripe, user, email, customerId);
const params = (): Stripe.Checkout.SessionCreateParams => ({ customer: "cus_owner", metadata: { acceptanceCoupon: "coupon_acceptance" },
  discounts: [{ coupon: "coupon_acceptance" }], payment_method_collection: "if_required", expires_at: expires });

describe("production acceptance is isolated from ordinary checkout", () => {
  it("is off without an owner and leaves other users untouched without provider requests", async () => {
    expect(await prepare("user_someone_else")).toEqual({});
    vi.stubEnv("ACCEPTANCE_USER_ID", "");
    expect(await prepare()).toEqual({});
    expect(api.customers.retrieve).not.toHaveBeenCalled();
  });
  it("binds the fixed discount, skips card collection, and limits Session lifetime", async () => {
    expect(await prepare()).toEqual({ allow_promotion_codes: undefined, discounts: [{ coupon: "coupon_acceptance" }], payment_method_collection: "if_required", expires_at: expires });
    expect(api.coupons.retrieve).toHaveBeenCalledWith("coupon_acceptance", { expand: ["applies_to"] });
  });
  it.each([
    ["VERCEL_ENV", "preview"], ["PREVIEW_INVENTORY_MODE", "typo"], ["ACCEPTANCE_EMAIL", "different@example.test"],
    ["ACCEPTANCE_CUSTOMER_ID", "cus_other"], ["ACCEPTANCE_COUPON_ID", ""], ["ACCEPTANCE_EXPIRES_AT", String(now - 1)],
  ])("fails closed for the matching owner when %s is unsafe", async (name, value) => {
    vi.stubEnv(name, value);
    await expect(prepare()).rejects.toThrow("disabled, expired, or has a different owner");
    expect(api.coupons.retrieve).not.toHaveBeenCalled();
  });
  it("requires an existing customer and exact provider identity", async () => {
    await expect(prepare("user_owner", "owner@example.test", null)).rejects.toThrow();
    customer.email = "someone@example.test";
    await expect(prepare()).rejects.toThrow("customer identity");
    customer.email = "owner@example.test"; customer.metadata = { app: "restockwire" };
    await expect(prepare()).rejects.toThrow("customer identity");
  });
  it.each([
    { percent_off: 99 }, { max_redemptions: 2 }, { times_redeemed: 1 }, { duration: "forever" }, { livemode: false },
    { redeem_by: expires + 60 }, { created: expires - 86_401 }, { applies_to: null }, { applies_to: { products: ["prod_other"] } },
    { metadata: { app: "restockwire" } },
  ])("rejects an unsafe coupon %j", async (change) => {
    Object.assign(coupon, change);
    await expect(prepare()).rejects.toThrow("coupon restrictions");
  });
  it("rejects a sibling product despite a local price environment variable", async () => {
    prices.price_pro.metadata = { app: "restockwire", plan: "pro" };
    await expect(prepare()).rejects.toThrow("price does not belong");
  });
  it("does not open a Session too close to expiry", async () => {
    vi.setSystemTime((expires - 1_000) * 1_000);
    await expect(prepare()).rejects.toThrow("window is too short");
  });
  it("does not revive persisted acceptance after operator settings are removed", async () => {
    vi.stubEnv("ACCEPTANCE_USER_ID", "");
    await expect(validateAcceptanceAttempt(stripe, params(), "user_owner", "owner@example.test")).rejects.toThrow("disabled");
  });
  it("does not reuse an old full-price attempt for the acceptance owner", async () => {
    await expect(validateAcceptanceAttempt(stripe, { customer: "cus_owner" }, "user_owner", "owner@example.test")).rejects.toThrow("reconciliation");
  });
  it("checks actual Stripe amount before exposing an acceptance checkout", () => {
    const session = { metadata: { acceptanceCoupon: "coupon_acceptance" }, livemode: true, currency: "usd", amount_total: 0 } as unknown as Stripe.Checkout.Session;
    expect(() => assertAcceptanceTotal(session)).not.toThrow();
    session.amount_total = 500;
    expect(() => assertAcceptanceTotal(session)).toThrow("did not total zero");
  });
});
