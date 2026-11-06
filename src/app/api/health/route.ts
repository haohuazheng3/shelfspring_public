import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db, dbStatus, hasDatabase } from "@/lib/db";
import { readState } from "@/lib/stock/sweep";
import { env } from "@/lib/env";
import { freshness, intlVerdict } from "@/lib/stock/fallback";
import type { CountryCode } from "@/lib/apple/countries";
import { intlRunner } from "@/lib/stock/cluster";
import { notificationsDisabled } from "@/lib/notifications/delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEARTBEAT_STALE_MS = 150_000;

/**
 * GET /api/health[?shallow=1]
 *  200 when config + database + polling are fine; 503 otherwise, with the reason. Polling is judged by the
 *  heartbeat and by the data: a poller that runs but gets no answers from Apple fails the check too.
 *  The verdict is the US one (its share of pairs fresh in the last minute); the other countries' freshness is
 *  appended to the detail for information and never fails the check.
 *  shallow=1 skips the database (used by frequent external probes).
 *  db=1 adds `databases`: whether the site reaches each database (primary, standby) and what each says it is.
 *  The standby host asks for it before a takeover: the site is the third vantage point (stock/cluster.ts).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const shallow = url.searchParams.get("shallow") === "1";
  const disabledNotifications = notificationsDisabled();
  const checks: Record<string, { ok: boolean; detail?: string }> = {};
  const required = ["DATABASE_URL", "CLERK_SECRET_KEY", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "STRIPE_ORG_API", "STRIPE_CONTEXT", "STRIPE_WEBHOOK_SECRET", "STRIPE_PRICE_MONTHLY", "STRIPE_PRICE_PRO", "STRIPE_PRICE_MAX", "CRON_SECRET", "POLLER_TOKEN", ...(disabledNotifications ? [] : ["VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY"])];
  const missing = required.filter((k) => !process.env[k]);
  checks.config = { ok: missing.length === 0, detail: missing.length ? `missing: ${missing.join(", ")}` : undefined };
  checks.notifications = { ok: true, detail: disabledNotifications ? "disabled-preview: real email and push are blocked" : "delivery permitted" };
  const stripeMode = /^sk_org_live_/.test(env.stripeKey()) ? "live" : /^sk_org_test_/.test(env.stripeKey()) ? "test" : "unknown";
  checks.stripe = { ok: stripeMode !== "unknown" && (!env.isProd() || stripeMode === "live")
    && (!disabledNotifications || stripeMode === "test"), detail: stripeMode };
  let unresolvedSeriousErrors: number | null = null;
  let databases: Record<string, { ok: boolean; ms?: number; recovery?: boolean | null; host?: string | null; owner?: string | null; epoch?: number; error?: string }> | undefined;
  if (url.searchParams.get("db") === "1" && hasDatabase()) {
    const st = await dbStatus().catch(() => null);
    if (st) databases = Object.fromEntries(st.probes.map((p) => [p.name, { ok: p.ok, ms: p.ms, recovery: p.recovery, host: p.host, owner: p.owner, epoch: p.epoch, error: p.error }]));
    else {
      const t0 = Date.now();
      const ok = await db().execute(sql`select 1`).then(() => true, () => false);
      databases = { primary: { ok, ms: Date.now() - t0 } };
    }
  }

  if (!shallow && hasDatabase()) {
    try {
      const t0 = Date.now();
      await db().execute(sql`select 1`);
      checks.database = { ok: true, detail: `${Date.now() - t0} ms` };
      // Existing groups have no severity column: unclassified errors remain serious. Explicitly
      // informational/warning samples do not take the service down; new failures default to error.
      const errors = await db().execute(sql`select count(*)::int as count from error_groups
        where resolved_at is null and lower(coalesce(sample->>'severity', 'error')) not in ('debug', 'info', 'warning', 'warn')`);
      unresolvedSeriousErrors = Number(errors.rows[0]?.count ?? 0);
      checks.errorInbox = { ok: unresolvedSeriousErrors === 0, detail: `${unresolvedSeriousErrors} unresolved serious errors` };
      const hb = await readState<{ at?: string; mode?: string; host?: string; cadenceSec?: number; intl?: { cadenceSec?: number; countries?: CountryCode[]; paused?: boolean } | null }>("heartbeat");
      const age = hb ? Date.now() - new Date(hb.value.at ?? hb.updatedAt).getTime() : Infinity;
      // The other countries may run on the standby host: then their stats are in its alive record.
      const intlInfo = (hb?.value.intl ?? (await intlRunner().catch(() => null))?.intl ?? null) as { cadenceSec?: number; countries?: CountryCode[]; paused?: boolean } | null;
      const f = await freshness({ intlCadenceSec: intlInfo?.cadenceSec });
      const share = f && f.pairs > 0 ? f.freshPairs / f.pairs : null;
      const intl = intlInfo ? intlVerdict(f, intlInfo.countries) : null;
      checks.poller = {
        ok: age < HEARTBEAT_STALE_MS && share != null && share >= 0.5,
        detail: (hb ? `${hb.value.mode ?? "?"} on ${hb.value.host ?? "?"}, ${Math.round(age / 1000)} s ago` : "no heartbeat yet") +
          (f && share != null ? ` · ${Math.round(share * 100)}% of ${f.stores} stores' phones checked in the last minute${f.staleStores.length ? ` · ${f.staleStores.length} stale` : ""}` : "") +
          (intl ? ` · other countries${intlInfo?.paused ? " (paused)" : ""}: ${intl.summary}` : ""),
      };
    } catch (e) {
      checks.database = { ok: false, detail: e instanceof Error ? e.message : String(e) };
    }
  }
  const ok = Object.values(checks).every((c) => c.ok);
  return NextResponse.json(
    {
      ok, service: "shelfspring", env: process.env.VERCEL_ENV ?? "local", site: env.siteUrl(), checks, stripeMode, unresolvedSeriousErrors, shallow, ...(databases ? { databases } : {}), at: new Date().toISOString(),
      // The poller host's auto-update reads these: the deployed commit, and the poller code it was built with.
      commit: process.env.APP_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || null, pollerCode: process.env.POLLER_CODE_HASH || null,
    },
    { status: ok ? 200 : 503, headers: { "cache-control": "no-store" } },
  );
}
