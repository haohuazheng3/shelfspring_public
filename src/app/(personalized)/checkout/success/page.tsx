import { PendingLink as Link } from "@/components/ui/PendingLink";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { ensureUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { CheckoutOwnershipError, verifyAndSyncCheckout, type VerifiedCheckout } from "@/lib/billing";
import { PLANS } from "@/lib/plans";
import { recordError, errorMessage } from "@/lib/errors";
import { TrackOnce } from "@/components/site/TrackOnce";
import { PushSetup } from "@/components/push/PushSetup";
import { env } from "@/lib/env";
import { deviceSummary } from "@/lib/devices";
import { pageLocale, requestLocale, setPageLocale, t } from "@/lib/i18n/server";
import { dict } from "@/lib/i18n/dict";
import { signInHome } from "@/lib/i18n/locales";
import { fieldCopy } from "@/content/field-guide";
import "@/components/pages/Workspace.css";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return { title: dict((await requestLocale()).lang).account.success.yourPlan, robots: { index: false } };
}

export default async function Success({ searchParams }: PageProps<"/checkout/success">) {
  setPageLocale(await requestLocale());
  const d = t().account.success;
  const loc = pageLocale();
  const F = fieldCopy(loc.lang);
  const sp = await searchParams;
  const u = await ensureUser();
  const sessionId = typeof sp.session_id === "string" ? sp.session_id : null;
  if (!sessionId) notFound();
  if (!u) {
    const next = `/checkout/success?session_id=${encodeURIComponent(sessionId)}`;
    redirect(`${signInHome(loc.native ? loc : undefined)}?signin=1&next=${encodeURIComponent(next)}`);
  }
  let verified: VerifiedCheckout | null = null;
  try {
    verified = await verifyAndSyncCheckout(sessionId, u.id);
  } catch (e) {
    if (e instanceof CheckoutOwnershipError) notFound();
    await recordError("web", `checkout verification failed: ${errorMessage(e)}`, { userId: u.id, sessionId, route: "/checkout/success", severity: "critical" });
  }
  const synced = verified?.state === "active";
  const [watches, devices] = await Promise.all([db().select().from(schema.watches).where(eq(schema.watches.userId, u.id)), deviceSummary(u.id, loc.lang)]);
  const def = verified ? PLANS[verified.activePlan ?? verified.plan] : null;
  const saved = watches.filter((w) => w.active).length; // deleted and retired rules stay as inactive rows
  return (
    <div className="field-page pt-10">
      {/* Actual Stripe amount, including zero after a coupon. Never report a purchase from URL input. */}
      {synced && verified && verified.amount != null && verified.currency && <TrackOnce event="purchase" props={{ amount: verified.amount, currency: verified.currency, item: verified.plan, id: verified.sessionId }} />}
      {synced && verified && <TrackOnce event="unlock" props={{ item: verified.activePlan ?? verified.plan, id: verified.sessionId }} />}
      <div className="pane checkout-receipt">
      <div>
        <p className="field-kicker">ShelfSpring / {d.yourPlan}</p>
        <h1 className="display mt-5 text-4xl">{synced ? d.isOn(def?.name ?? d.yourPlan) : verified?.state === "inactive" ? "This subscription is no longer active" : "Your checkout is not confirmed yet"}</h1>
        <p className="mt-3 text-ink-2">{synced ? (def ? d.onPlan(def.limit) : d.planOn) : verified?.state === "inactive" ? "Open your account to review your plan." : "We have not confirmed an active subscription. If you finished paying, check again; you do not need to pay twice."}</p>
        {!synced && verified?.state !== "inactive" && <a href={`/checkout/success?session_id=${encodeURIComponent(sessionId)}`} className="btn btn-primary mt-4">Check payment again</a>}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/account" className="btn btn-primary">{d.open}</Link>
          {/* Alerts are set on the home page of the person's language ("/" in English). */}
          <Link href={`${signInHome(loc.native ? loc : undefined)}#notify`} className="btn btn-ghost">{d.another}</Link>
        </div>
        {synced && <p className="mt-6 text-xs text-ink-3">{d.saved(saved)}</p>}
      </div>
      <aside className="checkout-receipt-status"><span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-2xl text-[var(--accent-ink)]" aria-hidden>{synced ? "✓" : "…"}</span><p className="mt-5 text-lg font-semibold">{F.alert}</p><p className="mt-3 text-sm leading-relaxed text-ink-2">{F.alertNote}</p></aside>
      </div>
      <div className="mt-4">
        {synced && <PushSetup vapidPublicKey={env.vapidPublicKey()} title={devices?.active ? d.pushOn : d.pushNext} account={devices} />}
      </div>
    </div>
  );
}
