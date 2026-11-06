import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ errors: 0, executions: 0, heartbeatAt: "", fresh: true, failFreshness: false, failDatabase: false }));
vi.mock("@/lib/db", () => ({
  hasDatabase: () => true,
  dbStatus: async () => null,
  db: () => ({ execute: async () => { state.executions++; if (state.failDatabase) throw new Error("database unavailable"); return { rows: state.executions === 1 ? [{}] : [{ count: state.errors }] }; } }),
}));
vi.mock("@/lib/stock/sweep", () => ({ readState: async () => ({ value: { at: state.heartbeatAt, mode: "full", host: "independent-host" }, updatedAt: state.heartbeatAt }) }));
vi.mock("@/lib/stock/cluster", () => ({ intlRunner: async () => null }));
vi.mock("@/lib/stock/fallback", () => ({
  freshness: async () => {
    if (state.failFreshness) throw new Error("stock freshness query failed");
    return { pairs: 100, freshPairs: state.fresh ? 100 : 10, stores: 269, staleStores: [] };
  },
  intlVerdict: () => null,
}));
import { GET } from "@/app/api/health/route";

beforeEach(() => {
  state.errors = 0; state.executions = 0; state.heartbeatAt = new Date().toISOString(); state.fresh = true; state.failFreshness = false; state.failDatabase = false;
  for (const key of ["DATABASE_URL", "CLERK_SECRET_KEY", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "STRIPE_CONTEXT", "STRIPE_WEBHOOK_SECRET", "STRIPE_PRICE_MONTHLY", "STRIPE_PRICE_PRO", "STRIPE_PRICE_MAX", "VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY", "CRON_SECRET", "POLLER_TOKEN"]) vi.stubEnv(key, "test-present-value");
  vi.stubEnv("STRIPE_ORG_API", "sk_org_live_x");
  vi.stubEnv("VERCEL_ENV", "production");
  vi.stubEnv("PREVIEW_INVENTORY_MODE", "");
});

describe("health diagnostics", () => {
  it("reports live mode and zero unresolved errors without revealing secrets", async () => {
    const response = await GET(new Request("https://shelfspring.com/api/health"));
    const text = await response.text();
    expect(response.status).toBe(200);
    expect(JSON.parse(text)).toMatchObject({ stripeMode: "live", unresolvedSeriousErrors: 0, shallow: false });
    expect(text).not.toContain("DoNotExposeThis");
    expect(text).not.toContain("test-present-value");
  });
  it("returns 503 when the error inbox contains unresolved serious failures", async () => {
    state.errors = 2;
    const response = await GET(new Request("https://shelfspring.com/api/health"));
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ unresolvedSeriousErrors: 2, checks: { errorInbox: { ok: false } } });
  });
  it("rejects test-mode Stripe on production", async () => {
    vi.stubEnv("STRIPE_ORG_API", "sk_org_test_x");
    const response = await GET(new Request("https://shelfspring.com/api/health"));
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ stripeMode: "test", checks: { stripe: { ok: false } } });
  });
  it("reports missing names instead of key values", async () => {
    vi.stubEnv("STRIPE_CONTEXT", "");
    const response = await GET(new Request("https://shelfspring.com/api/health"));
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ checks: { config: { ok: false, detail: "missing: STRIPE_CONTEXT" } } });
  });
  it("rejects live payments on preview and accepts its sandbox configuration", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    expect((await GET(new Request("https://preview.example/api/health"))).status).toBe(503);
    vi.stubEnv("STRIPE_ORG_API", "sk_org_test_x");
    state.executions = 0;
    expect((await GET(new Request("https://preview.example/api/health"))).status).toBe(200);
  });
  it("reports disabled preview notifications without VAPID, while still checking the database and inventory", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("STRIPE_ORG_API", "sk_org_test_x");
    vi.stubEnv("VAPID_PUBLIC_KEY", ""); vi.stubEnv("VAPID_PRIVATE_KEY", "");
    const response = await GET(new Request("https://preview.example/api/health"));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ checks: {
      config: { ok: true }, notifications: { ok: true, detail: "disabled-preview: real email and push are blocked" },
      stripe: { ok: true, detail: "test" }, database: { ok: true }, poller: { ok: true },
    } });
    expect(state.executions).toBe(2);
    state.executions = 0; state.fresh = false;
    const stale = await GET(new Request("https://preview.example/api/health"));
    expect(stale.status).toBe(503);
    expect(await stale.json()).toMatchObject({ checks: { poller: { ok: false } } });
    state.executions = 0; state.fresh = true; state.failDatabase = true;
    const disconnected = await GET(new Request("https://preview.example/api/health"));
    expect(disconnected.status).toBe(503);
    expect(await disconnected.json()).toMatchObject({ checks: { database: { ok: false } } });
  });
  it("requires sandbox Stripe for preview-inventory mode even outside Vercel", async () => {
    vi.stubEnv("VERCEL_ENV", "development"); vi.stubEnv("PREVIEW_INVENTORY_MODE", "1");
    const response = await GET(new Request("https://preview.example/api/health"));
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ checks: { stripe: { ok: false, detail: "live" } } });
    vi.stubEnv("STRIPE_ORG_API", "sk_org_test_x"); state.executions = 0;
    expect((await GET(new Request("https://preview.example/api/health"))).status).toBe(200);
  });
  it("continues to require VAPID credentials for production delivery", async () => {
    vi.stubEnv("VAPID_PRIVATE_KEY", "");
    const response = await GET(new Request("https://shelfspring.com/api/health"));
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ checks: { config: { ok: false, detail: "missing: VAPID_PRIVATE_KEY" } } });
  });
  it("does not treat fresh heartbeats as proof of fresh stock", async () => {
    state.fresh = false;
    expect((await GET(new Request("https://shelfspring.com/api/health"))).status).toBe(503);
  });
  it("does not swallow failures of the freshness query and report healthy", async () => {
    state.failFreshness = true;
    expect((await GET(new Request("https://shelfspring.com/api/health"))).status).toBe(503);
  });
  it("marks the legacy shallow probe as limited and skips database work", async () => {
    const response = await GET(new Request("https://shelfspring.com/api/health?shallow=1"));
    expect(await response.json()).toMatchObject({ shallow: true, unresolvedSeriousErrors: null });
    expect(state.executions).toBe(0);
  });
});
