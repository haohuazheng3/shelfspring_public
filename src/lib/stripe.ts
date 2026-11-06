import Stripe from "stripe";
import { env } from "./env";

let _stripe: Stripe | null = null;

/** Stripe through the owner's organization key, scoped to the shared account via Stripe-Context. */
export function stripe(): Stripe {
  const key = env.stripeKey();
  if (!key) throw new Error("STRIPE_ORG_API is not set");
  if (process.env.VERCEL_ENV === "preview" && !key.startsWith("sk_org_test_")) throw new Error("Preview payments require an independent Stripe sandbox organization key");
  if (_stripe) return _stripe;
  _stripe = new Stripe(key, {
    apiVersion: env.stripeApiVersion() as Stripe.LatestApiVersion,
    stripeContext: env.stripeContext() || undefined,
    appInfo: { name: "ShelfSpring", url: "https://shelfspring.com" },
  });
  return _stripe;
}
