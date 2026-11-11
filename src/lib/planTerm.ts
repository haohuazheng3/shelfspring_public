/**
 * Plan changes (owner, 2026-11-11): an upgrade is charged for the days left and starts at once; a downgrade starts at
 * the next renewal — nothing is refunded or credited (no Stripe balance), so "upgrade, use, downgrade, cancel" has
 * nothing to collect. lib/billing.ts changePlan moves the Stripe price to the lower plan without proration and records
 * on the subscription the plan already paid for. Website-only on purpose: the alert runtime's files (plans.ts,
 * db/schema.ts, stock/*) stay untouched, so its code fingerprint and release are not involved — the runtime reads the
 * plan in force from the subscriptions row, which syncSubscription keeps on the paid plan until the period ends.
 */
import { comparePlans, isPaidPlan, priceIdFor, type PaidPlanKey } from "./plans";

/**
 * A subscription's plan for this period and the one it renews on. metadata paid_plan is the plan paid for this period
 * and paid_until (unix seconds) the end of that period: while it matches the current period, the paid plan stays in
 * force. Once the period rolls over, paid_until no longer matches and the price's plan is the plan.
 */
export function planInForce(pricePlan: PaidPlanKey, meta: Record<string, string> | null | undefined, periodEnd: number | null | undefined): { plan: PaidPlanKey; nextPlan: PaidPlanKey | null } {
  const paid = meta?.paid_plan;
  if (isPaidPlan(paid) && periodEnd && Number(meta?.paid_until) === periodEnd && comparePlans(paid, pricePlan) > 0) return { plan: paid, nextPlan: pricePlan };
  return { plan: pricePlan, nextPlan: null };
}

/**
 * A waiting downgrade, read from a subscriptions row: its stored Stripe price is a configured lower plan than the plan
 * in force. Only exact matches of the configured prices count, so an unknown or legacy price never reads as one.
 */
export function waitingPlan(sub: { plan: string; priceId?: string | null } | null | undefined): PaidPlanKey | null {
  if (!sub?.priceId || !isPaidPlan(sub.plan)) return null;
  const p = (["max", "pro", "plus"] as const).find((k) => priceIdFor(k) && priceIdFor(k) === sub.priceId) ?? null;
  return p && comparePlans(p, sub.plan) < 0 ? p : null;
}
