import { afterEach, beforeEach, expect, it, vi } from "vitest";

beforeEach(() => { vi.resetModules(); });
afterEach(() => { vi.unstubAllEnvs(); });

it("refuses a live organization key before a preview can create a payment", async () => {
  vi.stubEnv("VERCEL_ENV", "preview");
  vi.stubEnv("STRIPE_ORG_API", "sk_org_live_x");
  const { stripe } = await import("@/lib/stripe");
  expect(() => stripe()).toThrow("independent Stripe sandbox");
});

it("initializes a preview only with its sandbox organization key", async () => {
  vi.stubEnv("VERCEL_ENV", "preview");
  vi.stubEnv("STRIPE_ORG_API", "sk_org_test_x");
  const { stripe } = await import("@/lib/stripe");
  expect(stripe()).toBeDefined(); // Construction performs no network request.
});
