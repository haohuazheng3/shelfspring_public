import type { Metadata } from "next";
import { PAID_PLANS, PLANS } from "@/lib/plans";
import { siteFacts } from "@/lib/content/siteFacts";
import { medianBand } from "@/lib/stock/sellouts";
import { PlanButton } from "@/components/site/PlanButton";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { Md } from "@/components/i18n/Md";
import { requestLocale, setPageLocale, t, pageLocale } from "@/lib/i18n/server";
import { dict } from "@/lib/i18n/dict";
import { fieldCopy } from "@/content/field-guide";
import { withCuratedMetadata } from "@/lib/seo/curation";
import { signInHome } from "@/lib/i18n/locales";
import { fill, num } from "@/lib/i18n/format";
import "@/components/pages/Workspace.css";

export async function generateMetadata(): Promise<Metadata> {
  const d = dict((await requestLocale()).lang).account.pricing;
  return withCuratedMetadata("/pricing", { title: d.metaTitle, description: d.metaDescription, alternates: { canonical: "/pricing" } });
}
export const dynamic = "force-dynamic";

export default async function Pricing() {
  setPageLocale(await requestLocale());
  const loc = pageLocale();
  const d = t().account.pricing, F = fieldCopy(loc.lang);
  const ds = (await siteFacts()).duoSellout;
  return (
    <div className="field-page">
      <section className="field-intro">
        <div><p className="field-kicker">ShelfSpring / {t().chrome.footer.pricing}</p><h1 className="field-title">{d.title}</h1><p className="field-lead"><Md text={d.lead} tag="b" b="text-ink" /></p></div>
        <aside className="field-callout"><p className="field-kicker">{F.alert}</p><p className="mt-3 text-lg leading-relaxed">{F.alertNote}</p><Link href={`${signInHome(loc.native ? loc : undefined)}#notify`} className="btn btn-ghost btn-sm mt-5">{F.alert} ↗</Link></aside>
      </section>
      <div className="field-layout">
        <div className="field-main">
          <div className="pane">
            {PAID_PLANS.map((k) => { const plan = PLANS[k]; return (
              <section key={k} className="pricing-plan-row" aria-labelledby={`plan-${k}`}>
                <div><h2 id={`plan-${k}`} className="display text-3xl">{plan.name}</h2><p className="mt-2 text-xs text-ink-3">{d.note[k]}</p></div>
                <div><p className="text-xl font-semibold">{d.alerts(plan.limit)}</p><p className="mt-1 text-xs text-ink-3">{d.cancel}</p></div>
                <div><p className="font-mono text-3xl tabular-nums">${plan.priceUsd}</p><p className="mt-1 text-xs text-ink-3">USD {d.month}</p></div>
                <div className="pricing-plan-action"><PlanButton plan={k} label={d.get(plan.name)} primary={k === "plus"} /></div>
              </section>
            ); })}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">{d.chips.map((text, i) => <div key={text} className="field-row"><span className="font-mono text-xs text-accent">0{i + 1}</span><span className="text-sm">{text}</span></div>)}</div>
          <p className="mt-6 text-sm text-ink-3">{d.billing}</p><p className="mt-3 text-sm text-ink-2"><Md text={d.refund} a="underline" /></p>
        </div>
        <aside className="field-aside space-y-5">
          <section className="pane p-6"><p className="field-kicker">{F.method}</p><h2 className="mt-3 text-xl font-semibold">{d.fastest}</h2><p className="mt-3 text-sm leading-relaxed text-ink-2"><Md text={d.everyFast} tag="b" /></p><ul className="mt-5 space-y-3 border-t border-line pt-5 text-sm">{d.perks.map((perk) => <li key={perk} className="flex gap-2"><span aria-hidden className="text-accent">✓</span>{perk}</li>)}</ul></section>
          {ds && <section className="field-callout"><p className="field-kicker">iPhone Duo / {F.history}</p><p className="mt-3 text-sm leading-relaxed"><Md text={d.sellsOut(d.band(medianBand(ds.medianSec).replace(/ seconds$/, "")))} tag="b" /></p><p className="mt-3 text-xs text-ink-3">{fill(d.historySample, { n: num(loc.lang, ds.n) })}</p><p className="mt-3 text-xs text-ink-3">{F.historyNote}</p></section>}
        </aside>
      </div>
    </div>
  );
}
