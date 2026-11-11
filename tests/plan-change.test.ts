import { describe, expect, it, vi, beforeEach } from "vitest";
import { planInForce, waitingPlan } from "@/lib/planTerm";

/**
 * Plan changes (owner, 2026-11-11): an upgrade is charged for the days left and starts at once; a downgrade starts at
 * the next renewal and is never refunded or credited — no Stripe balance. The Stripe client is a fake that applies
 * updates to one subscription and records every call; the database fake keeps the plan-change attempt row
 * (app_state) so changePlan's lock-and-attempt passes run as in production.
 */
const START = 1_762_000_000, END = START + 30 * 86_400;
const price = (id: string) => ({ id, unit_amount: id === "price_max" ? 2000 : id === "price_pro" ? 1000 : 500, metadata: {} as Record<string, string> });
type Sub = {
  id: string; customer: string; status: string; cancel_at_period_end: boolean; metadata: Record<string, string>; discounts: unknown[];
  default_payment_method: null; pending_update: null | object; items: { data: { id: string; price: ReturnType<typeof price>; current_period_start: number; current_period_end: number }[] };
};
const st = vi.hoisted(() => ({ sub: null as unknown as Sub, calls: [] as Record<string, unknown>[], previews: 0, bankConfirm: false, app: {} as Record<string, unknown> }));

vi.hoisted(() => {
  process.env.STRIPE_PRICE_MONTHLY = "price_plus";
  process.env.STRIPE_PRICE_PRO = "price_pro";
  process.env.STRIPE_PRICE_MAX = "price_max";
});

vi.mock("@/lib/stripe", () => ({
  stripe: () => ({
    subscriptions: {
      retrieve: async () => structuredClone(st.sub),
      update: async (_id: string, params: Record<string, unknown>) => {
        st.calls.push(params);
        const items = params.items as { price: string }[] | undefined;
        if (st.bankConfirm && params.payment_behavior === "pending_if_incomplete") return { ...structuredClone(st.sub), pending_update: { expires_at: 1 } };
        if (items) st.sub.items.data[0].price = price(items[0].price);
        if (params.metadata) for (const [k, v] of Object.entries(params.metadata as Record<string, string>)) { if (v === "") delete st.sub.metadata[k]; else st.sub.metadata[k] = v; }
        if (typeof params.cancel_at_period_end === "boolean") st.sub.cancel_at_period_end = params.cancel_at_period_end;
        return structuredClone(st.sub);
      },
    },
    invoices: { createPreview: async () => { st.previews++; throw new Error("Invoices Read missing"); } },
    paymentMethods: { retrieve: async () => ({}) },
  }),
}));
vi.mock("@/lib/ops", () => ({ logOps: async () => undefined }));
vi.mock("@/lib/db", async () => {
  const schema = (await vi.importActual("@/lib/db/schema")) as Record<string, unknown>;
  // A query chain: select() resolves to the attempt row, update(app_state).set(v) stores it, anything else to nothing.
  const chain = (kind: "select" | "insert" | "update", table?: unknown): unknown => {
    let set: { value?: Record<string, unknown> } | undefined;
    const c: unknown = new Proxy(function () {}, {
      get: (_t, p) => {
        if (p === "then") return (res: (v: unknown) => void) => {
          if (kind === "update" && table === schema.appState && set?.value) st.app = set.value;
          res(kind === "select" ? [{ key: "billing:plan:sub_1", value: st.app }] : undefined);
        };
        if (p === "set") return (v: typeof set) => { set = v; return c; };
        return () => c;
      },
    });
    return c;
  };
  const fake = { insert: (t: unknown) => chain("insert", t), update: (t: unknown) => chain("update", t), select: () => chain("select"), transaction: async (fn: (tx: unknown) => unknown) => fn(fake) };
  return { db: () => fake, schema };
});

const fresh = (plan: "plus" | "pro" | "max", meta: Record<string, string> = {}): Sub => ({
  id: "sub_1", customer: "cus_1", status: "active", cancel_at_period_end: false, metadata: { userId: "user_1", app: "shelfspring", ...meta }, discounts: [],
  default_payment_method: null, pending_update: null, items: { data: [{ id: "si_1", price: price(`price_${plan}`), current_period_start: START, current_period_end: END }] },
});
const billing = () => import("@/lib/billing");

describe("planInForce / waitingPlan", () => {
  it("keeps the plan paid for until that period ends, then the price's plan", () => {
    expect(planInForce("plus", { paid_plan: "max", paid_until: String(END) }, END)).toEqual({ plan: "max", nextPlan: "plus" });
    expect(planInForce("plus", { paid_plan: "max", paid_until: String(END) }, END + 30 * 86_400)).toEqual({ plan: "plus", nextPlan: null });
    expect(planInForce("max", { paid_plan: "plus", paid_until: String(END) }, END)).toEqual({ plan: "max", nextPlan: null });
  });
  it("reads a waiting downgrade from the stored price, only for configured lower prices", () => {
    expect(waitingPlan({ plan: "max", priceId: "price_plus" })).toBe("plus");
    expect(waitingPlan({ plan: "max", priceId: "price_max" })).toBeNull();
    expect(waitingPlan({ plan: "pro", priceId: "price_old_legacy" })).toBeNull();
    expect(waitingPlan(null)).toBeNull();
  });
});

describe("changePlan", () => {
  beforeEach(() => { st.calls = []; st.previews = 0; st.bankConfirm = false; st.app = {}; vi.useFakeTimers(); vi.setSystemTime((START + 86_400) * 1000); });

  it("a downgrade charges, refunds and credits nothing: the lower price waits for the renewal", async () => {
    st.sub = fresh("max");
    const r = await (await billing()).changePlan("sub_1", "plus");
    expect(r.startsAt).toBe(new Date(END * 1000).toISOString());
    expect(st.calls).toEqual([expect.objectContaining({ items: [{ id: "si_1", price: "price_plus" }], proration_behavior: "none", metadata: expect.objectContaining({ paid_plan: "max", paid_until: String(END) }) })]);
  });
  it("never sends a prorating update for a downgrade", async () => {
    for (const [from, to] of [["max", "pro"], ["max", "plus"], ["pro", "plus"]] as const) {
      st.sub = fresh(from); st.calls = []; st.app = {};
      await (await billing()).changePlan("sub_1", to);
      expect(st.calls.length).toBeGreaterThan(0);
      expect(st.calls.every((c) => c.proration_behavior === "none")).toBe(true);
    }
  });
  it("choosing the paid plan again undoes the waiting downgrade, at no charge", async () => {
    st.sub = fresh("plus", { paid_plan: "max", paid_until: String(END) });
    expect((await (await billing()).changePlan("sub_1", "max")).startsAt).toBeNull();
    expect(st.calls).toEqual([expect.objectContaining({ items: [{ id: "si_1", price: "price_max" }], proration_behavior: "none" })]);
    expect(st.sub.metadata.paid_plan).toBeUndefined();
  });
  it("the same waiting plan again changes nothing", async () => {
    st.sub = fresh("plus", { paid_plan: "max", paid_until: String(END) });
    expect((await (await billing()).changePlan("sub_1", "plus")).startsAt).toBe(new Date(END * 1000).toISOString());
    expect(st.calls).toEqual([]);
  });
  it("an upgrade over a waiting downgrade goes back to the paid price first, then charges only the difference from it", async () => {
    st.sub = fresh("plus", { paid_plan: "pro", paid_until: String(END) });
    await (await billing()).changePlan("sub_1", "max");
    expect(st.calls[0]).toMatchObject({ items: [{ price: "price_pro" }], proration_behavior: "none" });
    expect(st.calls[1]).toMatchObject({ items: [{ price: "price_max" }], proration_behavior: "always_invoice", payment_behavior: "pending_if_incomplete" });
    expect(st.sub.items.data[0].price.id).toBe("price_max");
  });
  it("a plain upgrade is charged at once through a persisted attempt, as before", async () => {
    st.sub = fresh("plus");
    expect(await (await billing()).changePlan("sub_1", "pro")).toEqual({ startsAt: null });
    expect(st.calls[0]).toMatchObject({ items: [{ price: "price_pro" }], proration_behavior: "always_invoice" });
    expect(st.app).toMatchObject({ toPrice: "price_pro", completed: true });
  });
  it("an upgrade waiting for the bank leaves the old plan", async () => {
    st.sub = fresh("plus"); st.bankConfirm = true;
    expect(await (await billing()).changePlan("sub_1", "max")).toEqual({ pending: true });
    expect(st.sub.items.data[0].price.id).toBe("price_plus");
  });
});

describe("previewPlanChange", () => {
  beforeEach(() => { st.calls = []; st.previews = 0; vi.useFakeTimers(); vi.setSystemTime((START + 86_400) * 1000); });

  it("a downgrade costs $0 today and starts at the renewal, without asking Stripe to price it", async () => {
    st.sub = fresh("max");
    expect(await (await billing()).previewPlanChange("sub_1", "plus")).toMatchObject({ from: "max", atRenewal: true, nowCents: 0, monthlyCents: 500, renewsAt: new Date(END * 1000).toISOString() });
    expect(st.previews).toBe(0);
  });
  it("an upgrade over a waiting downgrade is priced from the plan paid for", async () => {
    st.sub = fresh("plus", { paid_plan: "pro", paid_until: String(END) });
    const p = await (await billing()).previewPlanChange("sub_1", "max");
    expect(p).toMatchObject({ from: "pro", upgrade: true, atRenewal: false });
    expect(p.nowCents).toBe(Math.round(1000 * (29 / 30)));
  });
});
