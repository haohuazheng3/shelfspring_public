import { beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";

const state = vi.hoisted(() => ({
  attempt: null as unknown,
  subscriptions: [] as Record<string, unknown>[],
  customerId: "cus_owner" as string | null,
  tail: Promise.resolve(),
  failSave: false,
  session: null as unknown as Stripe.Checkout.Session,
  created: new Map<string, Stripe.Checkout.Session>(),
  createKeys: [] as string[],
  planUpdates: [] as Stripe.SubscriptionUpdateParams[],
  syncWrites: 0,
  acceptanceTotal: 0,
  failObservation: false,
  receipts: [] as Record<string, unknown>[],
}));

vi.mock("@/lib/ops", () => ({ logOps: async (_source: string, _level: string, _message: string, data: Record<string, unknown>) => { state.receipts.push(data); } }));

vi.mock("@/lib/db", async () => {
  const schema = await import("../src/lib/db/schema");
  const d = {
    select: () => ({ from: (table: unknown) => ({ where: () => {
      const rows = () => {
        if (table === schema.subscriptions && state.failObservation) { state.failObservation = false; throw new Error("observation disconnected"); }
        return table === schema.appState ? (state.attempt ? [{ key: "billing:checkout:user_1", value: structuredClone(state.attempt) }] : [])
          : table === schema.users ? [{ id: "user_1", stripeCustomerId: state.customerId }] : state.subscriptions;
      };
      return { then: (resolve: (v: unknown) => unknown) => Promise.resolve(rows()).then(resolve), limit: async () => rows(), for: async () => rows() };
    } }) }),
    insert: (table: unknown) => ({ values: (value: Record<string, unknown>) => ({
      onConflictDoNothing: async () => { if (table === schema.appState && !state.attempt) state.attempt = structuredClone(value.value); },
      onConflictDoUpdate: async () => { if (table === schema.subscriptions) { state.syncWrites++; state.subscriptions = [value]; } },
    }) }),
    update: (table: unknown) => ({ set: (value: Record<string, unknown>) => ({ where: async () => {
      if (table === schema.appState) {
        if (state.failSave) { state.failSave = false; throw new Error("database disconnected after Stripe responded"); }
        state.attempt = structuredClone(value.value);
      }
      if (table === schema.users && "stripeCustomerId" in value) state.customerId = value.stripeCustomerId as string | null;
    } }) }),
    transaction: async (run: (tx: unknown) => Promise<unknown>) => {
      const prior = state.tail;
      let release!: () => void;
      state.tail = new Promise<void>((resolve) => { release = resolve; });
      await prior;
      const before = structuredClone(state.attempt);
      try { return await run(d); }
      catch (e) { state.attempt = before; throw e; }
      finally { release(); }
    },
  };
  return { schema, db: () => d };
});

vi.mock("@/lib/stripe", () => ({ stripe: () => ({
  customers: { retrieve: async () => ({ id: "cus_owner", livemode: true, email: "owner@example.test", metadata: { app: "shelfspring", userId: "user_1" } }) },
  coupons: { retrieve: async (_id: string, params?: { expand?: string[] }) => ({ id: "coupon_acceptance", livemode: true, valid: true, name: "haohua", percent_off: 100, amount_off: null,
    duration: "once", max_redemptions: 1, times_redeemed: 0, created: Math.floor(Date.now() / 1000), redeem_by: Number(process.env.ACCEPTANCE_EXPIRES_AT),
    metadata: { app: "shelfspring", purpose: "production-zero-acceptance", userId: "user_1", customerId: "cus_owner" },
    applies_to: params?.expand?.includes("applies_to") ? { products: ["prod_plus", "prod_pro", "prod_max"] } : null }) },
  prices: { retrieve: async (id: string) => ({ id, active: true, livemode: true, product: id.replace("price_", "prod_"), currency: "usd",
    unit_amount: { price_plus: 500, price_pro: 1000, price_max: 2000 }[id], metadata: { app: "shelfspring", plan: id.replace("price_", "") },
    recurring: { interval: "month", interval_count: 1 } }) },
  checkout: { sessions: {
    create: async (params: Stripe.Checkout.SessionCreateParams, options: { idempotencyKey: string }) => {
      state.createKeys.push(options.idempotencyKey);
      let session = state.created.get(options.idempotencyKey);
      if (!session) {
        session = {
          id: `cs_live_created${state.created.size + 1}`, mode: "subscription", status: "open", payment_status: "unpaid", livemode: true,
          metadata: params.metadata, client_reference_id: params.client_reference_id,
          customer: "cus_owner", subscription: null, url: `https://checkout.stripe.com/session${state.created.size + 1}`,
          amount_total: params.discounts ? state.acceptanceTotal : 500, currency: "usd",
        } as Stripe.Checkout.Session;
        state.created.set(options.idempotencyKey, session);
      }
      return session;
    },
    retrieve: async (id: string) => [...state.created.values()].find((s) => s.id === id) ?? state.session,
    expire: async (id: string) => { const s = [...state.created.values()].find((s) => s.id === id); if (s) s.status = "expired"; return s; },
  } },
  subscriptions: {
    retrieve: async () => state.session.subscription,
    update: async (_id: string, params: Stripe.SubscriptionUpdateParams) => {
      const sub = state.session.subscription as Stripe.Subscription;
      if (params.items) {
        state.planUpdates.push(params);
        const id = params.items[0].price!;
        sub.items.data[0].price = { ...sub.items.data[0].price, id, metadata: { plan: id.replace("price_", "") } };
      }
      if (params.metadata) sub.metadata = params.metadata as Stripe.Metadata;
      return sub;
    },
  },
}) }));

import { CheckoutOwnershipError, changePlan, checkoutAmount, createCheckout, verifyAndSyncCheckout } from "@/lib/billing";

function paidSession(): Stripe.Checkout.Session {
  return {
    id: "cs_live_paid1", mode: "subscription", status: "complete", payment_status: "paid", livemode: true,
    metadata: { app: "shelfspring", userId: "user_1", plan: "plus" }, client_reference_id: "user_1", customer: "cus_owner",
    amount_total: 500, currency: "usd",
    subscription: {
      id: "sub_1", metadata: { app: "shelfspring", userId: "user_1", plan: "plus" }, status: "active", customer: "cus_owner",
      items: { data: [{ id: "si_1", price: { id: "price_plus", metadata: { plan: "plus" }, unit_amount: 500 }, current_period_start: 1700000000, current_period_end: 1800000000 }] },
    },
  } as unknown as Stripe.Checkout.Session;
}

beforeEach(() => {
  state.attempt = null; state.subscriptions = []; state.customerId = "cus_owner"; state.tail = Promise.resolve();
  state.failSave = false; state.session = paidSession(); state.created.clear(); state.createKeys = []; state.planUpdates = []; state.syncWrites = 0;
  vi.stubEnv("STRIPE_PRICE_MONTHLY", "price_plus"); vi.stubEnv("STRIPE_PRICE_PRO", "price_pro"); vi.stubEnv("STRIPE_PRICE_MAX", "price_max");
  vi.stubEnv("VERCEL_ENV", "production");
  vi.stubEnv("PREVIEW_INVENTORY_MODE", ""); vi.stubEnv("ACCEPTANCE_USER_ID", ""); state.acceptanceTotal = 0;
  state.receipts = []; state.failObservation = false;
});

describe("plan confirmation retries", () => {
  it("two concurrent upgrade confirmations produce only one prorated change", async () => {
    await Promise.all([changePlan("sub_1", "pro"), changePlan("sub_1", "pro")]);
    expect(state.planUpdates).toHaveLength(1);
    expect(state.subscriptions[0]).toMatchObject({ plan: "pro", alertLimit: 20 });
  });
  it("does not issue another invoice while a payment needs bank confirmation", async () => {
    (state.session.subscription as Stripe.Subscription).pending_update = {} as Stripe.Subscription.PendingUpdate;
    expect(await changePlan("sub_1", "pro")).toEqual({ pending: true });
    expect(state.planUpdates).toHaveLength(0);
  });
  it("allows a later legitimate upgrade after downgrading back in the same period", async () => {
    await changePlan("sub_1", "pro");
    await changePlan("sub_1", "plus");
    await changePlan("sub_1", "pro");
    expect(state.planUpdates).toHaveLength(3);
    expect(state.subscriptions[0]).toMatchObject({ plan: "pro", alertLimit: 20 });
  });
});

describe("one Checkout per account", () => {
  it("concurrent double-click requests reuse one payable session", async () => {
    const urls = await Promise.all([createCheckout("user_1", "owner@example.test", "plus"), createCheckout("user_1", "owner@example.test", "plus")]);
    expect(urls[0]).toBe(urls[1]);
    expect(state.created.size).toBe(1);
  });
  it("retries a lost database acknowledgement with the original Stripe idempotency key", async () => {
    state.failSave = true;
    await expect(createCheckout("user_1", "owner@example.test", "plus")).rejects.toThrow("disconnected");
    await createCheckout("user_1", "owner@example.test", "plus");
    expect(state.createKeys).toHaveLength(2);
    expect(state.createKeys[0]).toBe(state.createKeys[1]);
    expect(state.created.size).toBe(1);
  });
  it("expires an unfinished checkout before opening a different plan", async () => {
    await createCheckout("user_1", "owner@example.test", "plus");
    await createCheckout("user_1", "owner@example.test", "pro");
    expect([...state.created.values()].map((s) => s.status)).toEqual(["expired", "open"]);
  });
  it("does not create another subscription when a webhook activated the account", async () => {
    state.subscriptions = [{ id: "sub_existing", status: "active", plan: "plus", alertLimit: 10 }];
    expect(await createCheckout("user_1", "owner@example.test", "plus")).toBe("/account");
    expect(state.created.size).toBe(0);
  });
});

describe("acceptance uses the normal durable checkout", () => {
  function enable() {
    for (const [key, value] of Object.entries({ ACCEPTANCE_USER_ID: "user_1", ACCEPTANCE_EMAIL: "owner@example.test",
      ACCEPTANCE_CUSTOMER_ID: "cus_owner", ACCEPTANCE_COUPON_ID: "coupon_acceptance", ACCEPTANCE_EXPIRES_AT: String(Math.floor(Date.now() / 1000) + 3600) })) vi.stubEnv(key, value);
  }
  it("persists the scoped discount and reuses it after a lost database acknowledgement", async () => {
    enable(); state.failSave = true;
    await expect(createCheckout("user_1", "owner@example.test", "plus")).rejects.toThrow("disconnected");
    await createCheckout("user_1", "owner@example.test", "plus");
    expect(state.createKeys[0]).toBe(state.createKeys[1]);
    expect(state.created.size).toBe(1);
    expect(state.attempt).toMatchObject({ params: { discounts: [{ coupon: "coupon_acceptance" }], payment_method_collection: "if_required", metadata: { acceptanceCoupon: "coupon_acceptance" } } });
  });
  it("expires a live acceptance URL after configuration is disabled without opening a paid replacement", async () => {
    enable(); await createCheckout("user_1", "owner@example.test", "plus");
    vi.stubEnv("ACCEPTANCE_USER_ID", "");
    await expect(createCheckout("user_1", "owner@example.test", "plus")).rejects.toThrow("disabled");
    expect(state.created.size).toBe(1);
    expect([...state.created.values()][0].status).toBe("expired");
  });
  it("expires a nonzero acceptance Session before exposing the hosted URL", async () => {
    enable(); state.acceptanceTotal = 500;
    await expect(createCheckout("user_1", "owner@example.test", "plus")).rejects.toThrow("did not total zero");
    expect([...state.created.values()][0].status).toBe("expired");
  });
  it("does not return a previously opened full-price checkout to the acceptance owner", async () => {
    await createCheckout("user_1", "owner@example.test", "plus");
    enable();
    await expect(createCheckout("user_1", "owner@example.test", "plus")).rejects.toThrow("reconciliation");
    expect([...state.created.values()][0].status).toBe("expired");
    expect(state.created.size).toBe(1);
  });
});

describe("verified return-page fulfillment", () => {
  it("writes and rereads the entitlement before reporting an active plan", async () => {
    expect(await verifyAndSyncCheckout("cs_live_paid1", "user_1")).toMatchObject({ state: "active", plan: "plus", activePlan: "plus", amount: 5, currency: "usd" });
    expect(state.syncWrites).toBe(1);
    expect(state.receipts).toHaveLength(0);
  });
  it("records whether scoped acceptance fulfillment existed before return-page and repeat operator recovery", async () => {
    vi.stubEnv("ACCEPTANCE_USER_ID", "user_1");
    state.session.metadata!.acceptanceCoupon = "coupon_acceptance";
    state.session.amount_total = 0; state.session.payment_status = "no_payment_required";
    await verifyAndSyncCheckout("cs_live_paid1", "user_1");
    expect(state.receipts[0]).toMatchObject({ source: "return", entitlementExistedBefore: false, previousStatus: null, active: true, subscriptionId: "sub_1" });
    await verifyAndSyncCheckout("cs_live_paid1", "user_1", "reconciliation");
    expect(state.receipts[1]).toMatchObject({ source: "reconciliation", entitlementExistedBefore: true, previousStatus: "active", active: true });
    expect(state.syncWrites).toBe(2);
    expect(state.subscriptions).toHaveLength(1);
  });
  it("accepts a completed 100% coupon checkout and reports zero revenue", async () => {
    state.session.payment_status = "no_payment_required"; state.session.amount_total = 0;
    expect(await verifyAndSyncCheckout("cs_live_paid1", "user_1")).toMatchObject({ state: "active", amount: 0 });
  });
  it("keeps diagnostic observation failure from blocking payment recovery and never reports unknown as absent", async () => {
    vi.stubEnv("ACCEPTANCE_USER_ID", "user_1");
    state.session.metadata!.acceptanceCoupon = "coupon_acceptance";
    state.session.amount_total = 0; state.session.payment_status = "no_payment_required";
    state.failObservation = true;
    expect(await verifyAndSyncCheckout("cs_live_paid1", "user_1")).toMatchObject({ state: "active", amount: 0 });
    expect(state.syncWrites).toBe(1);
    expect(state.receipts.at(-1)).toMatchObject({ observationKnown: false, entitlementExistedBefore: null, active: true });
  });
  it.each(["open", "expired"] as const)("does not grant access for %s sessions", async (status) => {
    state.session.status = status;
    expect(await verifyAndSyncCheckout("cs_live_paid1", "user_1")).toMatchObject({ state: "pending", amount: null });
    expect(state.syncWrites).toBe(0);
  });
  it("does not grant access while an asynchronous payment is unpaid", async () => {
    state.session.payment_status = "unpaid";
    expect(await verifyAndSyncCheckout("cs_live_paid1", "user_1")).toMatchObject({ state: "pending", amount: null });
    expect(state.syncWrites).toBe(0);
  });
  it("rejects another user's checkout, even with this site's app tag", async () => {
    await expect(verifyAndSyncCheckout("cs_live_paid1", "user_other")).rejects.toBeInstanceOf(CheckoutOwnershipError);
    expect(state.syncWrites).toBe(0);
  });
  it("rejects a sibling product using the same Stripe account", async () => {
    state.session.metadata!.app = "another-app";
    await expect(verifyAndSyncCheckout("cs_live_paid1", "user_1")).rejects.toBeInstanceOf(CheckoutOwnershipError);
    expect(state.syncWrites).toBe(0);
  });
  it("rejects a subscription with a mismatching customer or price", async () => {
    const sub = state.session.subscription as Stripe.Subscription;
    sub.customer = "cus_someone_else";
    await expect(verifyAndSyncCheckout("cs_live_paid1", "user_1")).rejects.toBeInstanceOf(CheckoutOwnershipError);
    sub.customer = "cus_owner"; sub.items.data[0].price.id = "price_other_app";
    await expect(verifyAndSyncCheckout("cs_live_paid1", "user_1")).rejects.toThrow("price");
    expect(state.syncWrites).toBe(0);
  });
  it("syncs a canceled subscription without reporting an unlock", async () => {
    (state.session.subscription as Stripe.Subscription).status = "canceled";
    expect(await verifyAndSyncCheckout("cs_live_paid1", "user_1")).toMatchObject({ state: "inactive" });
  });
  it("rejects test-mode checkouts in production", async () => {
    state.session.livemode = false;
    await expect(verifyAndSyncCheckout("cs_live_paid1", "user_1")).rejects.toThrow("live mode");
    expect(state.syncWrites).toBe(0);
  });
  it("uses Stripe currency units including zero-decimal and special cases", () => {
    expect(checkoutAmount(800, "jpy")).toBe(800);
    expect(checkoutAmount(800, "usd")).toBe(8);
    expect(checkoutAmount(800, "isk")).toBe(8);
    expect(checkoutAmount(800, "ugx")).toBe(8);
  });
});
