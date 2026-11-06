import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";

const state = vi.hoisted(() => ({
  claims: new Set<string>(), done: new Set<string>(), tail: Promise.resolve(), inTransaction: (): boolean => false,
  syncs: 0, errors: [] as string[], ownerCalls: 0, ownerAccepted: true, acceptedLogs: 0, signatureValid: true,
}));
vi.mock("@/lib/env", () => ({ env: { stripeWebhookSecret: () => "fixture" } }));
vi.mock("@/lib/stripe", () => ({ stripe: () => ({
  webhooks: { constructEvent: (body: string) => { if (!state.signatureValid) throw new Error("bad signature"); return JSON.parse(body); } },
  subscriptions: { retrieve: async () => ({ id: "sub_owner" }) },
}) }));
vi.mock("@/lib/billing", () => ({ syncSubscription: async () => { expect(state.inTransaction()).toBe(true); state.syncs++; } }));
vi.mock("@/lib/errors", () => ({ errorMessage: (e: unknown) => String(e), recordError: async (_source: string, message: string) => {
  expect(state.inTransaction()).toBe(false); state.errors.push(message);
} }));
vi.mock("@/lib/mail/owner", () => ({ notifyOwner: async () => { expect(state.inTransaction()).toBe(false); state.ownerCalls++; return state.ownerAccepted; } }));
vi.mock("@/lib/ops", () => ({ logOps: async () => { expect(state.inTransaction()).toBe(false); state.acceptedLogs++; } }));
vi.mock("@/lib/db", async () => {
  const schema = await import("../src/lib/db/schema");
  const { PgDialect } = await import("drizzle-orm/pg-core");
  const dialect = new PgDialect();
  const { AsyncLocalStorage } = await import("node:async_hooks");
  const transactionScope = new AsyncLocalStorage<boolean>();
  state.inTransaction = () => transactionScope.getStore() === true;
  return { schema, db: () => ({ transaction: async (run: (tx: unknown) => Promise<unknown>) => {
    const previous = state.tail; let release!: () => void;
    state.tail = new Promise<void>((resolve) => { release = resolve; });
    await previous;
    return transactionScope.run(true, async () => {
    let eventId: string | undefined; let claim: string | undefined; let done: string | undefined;
    const tx = {
      execute: async (query: Parameters<typeof dialect.sqlToQuery>[0]) => {
        const compiled = dialect.sqlToQuery(query);
        expect(compiled.sql).toContain("pg_advisory_xact_lock");
        expect(compiled.sql).toContain("shelfspring:stripe-webhook");
        eventId = compiled.params[0] as string;
      },
      select: () => ({ from: () => ({ where: () => ({ limit: async () => state.done.has(eventId!) ? [{ id: eventId }] : [] }) }) }),
      insert: (table: unknown) => ({ values: (value: { id?: string; key?: string }) => table === schema.appState
        ? { onConflictDoNothing: () => ({ returning: async () => {
          if (state.claims.has(value.key!)) return [];
          claim = value.key; return [{ key: claim }];
        } }) }
        : Promise.resolve().then(() => { done = value.id; }),
      }),
      update: () => ({ set: () => ({ where: async () => undefined }) }),
    };
    try {
      const result = await run(tx);
      if (claim) state.claims.add(claim); if (done) state.done.add(done);
      return result;
    } finally { release(); }
    });
  } }) };
});

import { POST } from "@/app/api/stripe/webhook/route";
import { acceptanceWebhookDrillTarget } from "@/lib/billing-webhook-drill";
const now = Math.floor(Date.now() / 1000);
const config = {
  VERCEL_ENV: "production", PREVIEW_INVENTORY_MODE: "", ACCEPTANCE_FAIL_WEBHOOK: "once",
  ACCEPTANCE_WEBHOOK_FAIL_UNTIL: String(now + 600), ACCEPTANCE_EXPIRES_AT: String(now + 3600),
  ACCEPTANCE_USER_ID: "user_owner", ACCEPTANCE_CUSTOMER_ID: "cus_owner", ACCEPTANCE_COUPON_ID: "coupon_scoped",
  ACCEPTANCE_EMAIL: "owner@example.test", ACCEPTANCE_WEBHOOK_EVENT_ID: "",
  ACCEPTANCE_WEBHOOK_EVENT_TYPE: "",
};
const makeEvent = (type = "customer.subscription.created"): Stripe.Event => {
  const metadata = { app: "shelfspring", userId: "user_owner", acceptanceCoupon: "coupon_scoped" };
  return { id: "evt_acceptance", type, livemode: true, created: now, data: { object: {
    id: "sub_owner", metadata, livemode: true, customer: "cus_owner", mode: "subscription", subscription: "sub_owner",
    amount_total: 0, total: 0, amount_paid: 0, currency: "usd", payment_status: "no_payment_required",
    parent: { subscription_details: { metadata, subscription: "sub_owner" } },
  } } } as unknown as Stripe.Event;
};
const post = (event = makeEvent()) => POST(new Request("https://shelfspring.com/api/stripe/webhook", {
  method: "POST", headers: { "stripe-signature": "signed-fixture" }, body: JSON.stringify(event),
}));

beforeEach(() => {
  state.claims.clear(); state.done.clear(); state.tail = Promise.resolve();
  state.syncs = 0; state.errors = []; state.ownerCalls = 0; state.ownerAccepted = true; state.acceptedLogs = 0; state.signatureValid = true;
  for (const [key, value] of Object.entries(config)) vi.stubEnv(key, value);
});
afterEach(() => vi.unstubAllEnvs());

describe("acceptance webhook drill scope", () => {
  it("can select only checkout completion before its event ID is known", () => {
    const chosen = { ...config, ACCEPTANCE_WEBHOOK_EVENT_TYPE: "checkout.session.completed" };
    expect(acceptanceWebhookDrillTarget(makeEvent("checkout.session.completed"), chosen, now)).not.toBeNull();
    expect(acceptanceWebhookDrillTarget(makeEvent("customer.subscription.created"), chosen, now)).toBeNull();
    expect(acceptanceWebhookDrillTarget(makeEvent("invoice.paid"), chosen, now)).toBeNull();
  });
  it("an unsupported event type selector disables the drill instead of using its default", () => {
    expect(acceptanceWebhookDrillTarget(makeEvent("checkout.session.completed"), { ...config, ACCEPTANCE_WEBHOOK_EVENT_TYPE: "checkout.*" }, now)).toBeNull();
  });
  it.each(["checkout.session.completed", "customer.subscription.created", "invoice.paid"])("permits a signed live initial %s with exact identity", (type) => {
    expect(acceptanceWebhookDrillTarget(makeEvent(type), config, now)).toMatchObject({ eventId: "evt_acceptance", userId: "user_owner", customerId: "cus_owner", couponId: "coupon_scoped" });
  });
  it.each([
    { ACCEPTANCE_FAIL_WEBHOOK: "" }, { ACCEPTANCE_FAIL_WEBHOOK: "1" }, { ACCEPTANCE_FAIL_WEBHOOK: "true" },
    { VERCEL_ENV: "preview" }, { PREVIEW_INVENTORY_MODE: "typo" }, { ACCEPTANCE_WEBHOOK_FAIL_UNTIL: String(now) },
    { ACCEPTANCE_WEBHOOK_FAIL_UNTIL: String(now + 901) }, { ACCEPTANCE_EXPIRES_AT: String(now + 599) },
    { ACCEPTANCE_WEBHOOK_EVENT_ID: "evt_other" }, { ACCEPTANCE_USER_ID: "user_other" },
    { ACCEPTANCE_CUSTOMER_ID: "cus_other" }, { ACCEPTANCE_COUPON_ID: "coupon_other" }, { ACCEPTANCE_EMAIL: "" },
  ])("does not inject for unsafe settings %j", (changes) => {
    expect(acceptanceWebhookDrillTarget(makeEvent(), { ...config, ...changes }, now)).toBeNull();
  });
  it("does not act on old/test events or cancellation/update types", () => {
    const event = makeEvent(); event.livemode = false;
    expect(acceptanceWebhookDrillTarget(event, config, now)).toBeNull();
    event.livemode = true; event.created = now - 301;
    expect(acceptanceWebhookDrillTarget(event, config, now)).toBeNull();
    expect(acceptanceWebhookDrillTarget(makeEvent("customer.subscription.deleted"), config, now)).toBeNull();
    expect(acceptanceWebhookDrillTarget(makeEvent("customer.subscription.updated"), config, now)).toBeNull();
  });
  it("does not inject into a nonzero checkout or invoice", () => {
    const checkout = makeEvent("checkout.session.completed");
    (checkout.data.object as Stripe.Checkout.Session).amount_total = 500;
    expect(acceptanceWebhookDrillTarget(checkout, config, now)).toBeNull();
    const invoice = makeEvent("invoice.paid"); (invoice.data.object as Stripe.Invoice).amount_paid = 500;
    expect(acceptanceWebhookDrillTarget(invoice, config, now)).toBeNull();
  });
});

describe("signed route failure and recovery", () => {
  it("commits only a drill claim on failure, records the error and owner alert, then retries idempotently", async () => {
    expect((await post()).status).toBe(500);
    expect(state.claims.size).toBe(1); expect(state.done.size).toBe(0); expect(state.syncs).toBe(0);
    expect(state.errors).toHaveLength(1); expect(state.ownerCalls).toBe(1); expect(state.acceptedLogs).toBe(1);
    expect(await (await post()).json()).toEqual({ received: true });
    expect(await (await post()).json()).toEqual({ duplicate: true });
    expect(state.syncs).toBe(1); expect(state.ownerCalls).toBe(1);
  });
  it("concurrent signed deliveries cannot inject twice or grant twice", async () => {
    const results = await Promise.all([post(), post()]);
    expect(results.map((r) => r.status).sort()).toEqual([200, 500]);
    expect(state.claims.size).toBe(1); expect(state.syncs).toBe(1); expect(state.ownerCalls).toBe(1);
  });
  it("signature rejection and sibling projects never reach the drill or owner notification", async () => {
    state.signatureValid = false;
    expect((await post()).status).toBe(400);
    state.signatureValid = true;
    const foreign = makeEvent(); (foreign.data.object as Stripe.Subscription).metadata.app = "restockwire";
    expect(await (await post(foreign)).json()).toEqual({ ignored: "other app" });
    expect(state.claims.size).toBe(0); expect(state.errors).toHaveLength(0); expect(state.ownerCalls).toBe(0);
  });
  it("does not claim or alert for an ordinary ShelfSpring user", async () => {
    const other = makeEvent(); (other.data.object as Stripe.Subscription).metadata.userId = "user_other";
    expect((await post(other)).status).toBe(200);
    expect(state.claims.size).toBe(0); expect(state.ownerCalls).toBe(0); expect(state.syncs).toBe(1);
  });
  it("does not inject when the event was processed before the drill was enabled", async () => {
    vi.stubEnv("ACCEPTANCE_FAIL_WEBHOOK", ""); expect((await post()).status).toBe(200);
    vi.stubEnv("ACCEPTANCE_FAIL_WEBHOOK", "once");
    expect(await (await post()).json()).toEqual({ duplicate: true });
    expect(state.claims.size).toBe(0); expect(state.ownerCalls).toBe(0); expect(state.syncs).toBe(1);
  });
  it("records a failed owner notification honestly and still allows retry", async () => {
    state.ownerAccepted = false;
    expect((await post()).status).toBe(500);
    expect(state.errors).toHaveLength(2); expect(state.errors[1]).toContain("owner alert failed");
    expect(state.acceptedLogs).toBe(0);
    expect((await post()).status).toBe(200); expect(state.syncs).toBe(1);
  });
});
