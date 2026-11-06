import { beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";
const state = vi.hoisted(() => ({
  done: new Set<string>(), tail: Promise.resolve(), syncCalls: 0, writes: 0,
  failSync: false, failMark: false, retrieveDenied: false, inTransaction: false,
  errors: [] as string[], notices: 0,
}));
vi.mock("@/lib/env", () => ({ env: { stripeWebhookSecret: () => "fixture-signature-secret" } }));
vi.mock("@/lib/stripe", () => ({ stripe: () => ({
  webhooks: { constructEvent: (body: string) => JSON.parse(body) },
  subscriptions: { retrieve: async () => { if (state.retrieveDenied) throw Object.assign(new Error("permission denied"), { statusCode: 403 }); return { id: "sub_1" }; } },
}) }));
vi.mock("@/lib/errors", () => ({ errorMessage: (e: unknown) => String(e), recordError: async (_source: string, message: string) => { expect(state.inTransaction).toBe(false); state.errors.push(message); } }));
vi.mock("@/lib/ops", () => ({ logOps: async () => { expect(state.inTransaction).toBe(false); state.notices++; } }));
vi.mock("@/lib/billing", () => ({ syncSubscription: async (_sub: Stripe.Subscription, executor: { update?: unknown }) => {
  expect(state.inTransaction).toBe(true);
  expect(executor?.update).toBeTypeOf("function");
  state.syncCalls++;
  if (state.failSync) { state.failSync = false; throw new Error("temporary database interruption"); }
  state.writes++;
} }));
vi.mock("@/lib/db", async () => {
  const schema = await import("../src/lib/db/schema");
  const { PgDialect } = await import("drizzle-orm/pg-core");
  const dialect = new PgDialect();
  return { schema, db: () => ({ transaction: async (run: (tx: unknown) => Promise<unknown>) => {
    const prior = state.tail; let release!: () => void;
    state.tail = new Promise<void>((resolve) => { release = resolve; });
    await prior; state.inTransaction = true;
    const before = state.writes; let eventId: string | undefined; let completed: string | undefined;
    const tx = {
      execute: async (query: Parameters<typeof dialect.sqlToQuery>[0]) => {
        const compiled = dialect.sqlToQuery(query);
        expect(compiled.sql).toContain("pg_advisory_xact_lock");
        eventId = compiled.params[0] as string;
      },
      select: () => ({ from: () => ({ where: () => ({ limit: async () => {
        expect(eventId).toBeDefined(); return state.done.has(eventId!) ? [{ id: eventId }] : [];
      } }) }) }),
      update: () => ({ set: () => ({ where: async () => { state.writes++; } }) }),
      insert: () => ({ values: async (value: { id: string }) => {
        expect(state.syncCalls > 0 || state.retrieveDenied).toBe(true);
        if (state.failMark) { state.failMark = false; throw new Error("commit-marker write failed"); }
        completed = value.id;
      } }),
    };
    try { const result = await run(tx); if (completed) state.done.add(completed); return result; }
    catch (error) { state.writes = before; throw error; }
    finally { state.inTransaction = false; release(); }
  } }) };
});
import { POST } from "@/app/api/stripe/webhook/route";
const event = (type = "customer.subscription.updated", app = "shelfspring") => ({
  id: "evt_retry", type, data: { object: { id: "sub_1", metadata: { app, userId: "user_1" } } },
});
const post = (data = event()) => POST(new Request("https://shelfspring.com/api/stripe/webhook", {
  method: "POST", headers: { "stripe-signature": "fixture" }, body: JSON.stringify(data),
}));
beforeEach(() => {
  state.done.clear(); state.tail = Promise.resolve(); state.syncCalls = 0; state.writes = 0;
  state.failSync = false; state.failMark = false; state.retrieveDenied = false;
  state.inTransaction = false; state.errors = []; state.notices = 0;
});
describe("Stripe completion markers", () => {
  it("retries a failed sync instead of acknowledging a false duplicate", async () => {
    state.failSync = true;
    expect((await post()).status).toBe(500); expect(state.done.size).toBe(0);
    expect((await post()).status).toBe(200); expect(state.done.has("evt_retry")).toBe(true);
    expect(state.syncCalls).toBe(2); expect(state.errors).toHaveLength(1);
  });
  it("two concurrent deliveries synchronize once and acknowledge the duplicate", async () => {
    const results = await Promise.all([post(), post()]);
    expect(await results[0].json()).toEqual({ received: true });
    expect(await results[1].json()).toEqual({ duplicate: true });
    expect(state.syncCalls).toBe(1);
  });
  it("marker failure rolls back writes and remains retryable", async () => {
    state.failMark = true;
    expect((await post()).status).toBe(500); expect(state.writes).toBe(0); expect(state.done.size).toBe(0);
    expect((await post()).status).toBe(200); expect(state.writes).toBe(1);
  });
  it("preserves foreign-product filtering", async () => {
    expect(await (await post(event("customer.subscription.updated", "other-product"))).json()).toEqual({ ignored: "other app" });
    expect(state.syncCalls).toBe(0); expect(state.done.size).toBe(0);
  });
  it("logs permission fallbacks only after releasing the transaction", async () => {
    state.retrieveDenied = true;
    const data = event("checkout.session.completed");
    Object.assign(data.data.object, { customer: "cus_1", mode: "subscription", subscription: "sub_1" });
    expect((await post(data)).status).toBe(200);
    expect(state.notices).toBe(1); expect(state.syncCalls).toBe(0);
  });
});
