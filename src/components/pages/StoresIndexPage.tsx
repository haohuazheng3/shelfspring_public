import { fieldGuideCopy,fieldGuideQuestions,FieldIntro,FieldMethod,FieldSection } from "@/components/seo/FieldGuide";
import { t } from "@/lib/i18n/server";
import { DuoLedger } from "@/components/stock/DuoLedger";
import { alertsDelivered, duoLedgerFrom, stockFromRows } from "@/lib/content/duoLedger";
import { duoRestockTimes } from "@/lib/content/restockTimes";
import { countryLabel } from "@/lib/i18n/places";
import { withCuratedMetadata } from "@/lib/seo/curation";
/**
 * A country's store index: /stores (the US, "list of apple stores") and /{cc}/stores ("apple stores in
 * {country}", project documentation §12; body in StoresIndexIntl.tsx). Same skeleton — live cards, how many stores and where,
 * every region, restock charts, FAQ, sources — with the US keeping its sales-tax angle and other countries
 * their own tax rule. Austria and Belgium have one store each: their /stores is that store's page (308).
 */
import { SourceList } from "@/components/content/RichFaq";
import { DailyBars } from "@/components/restocks/DailyBars";
import { RestockClock } from "@/components/restocks/RestockClock";
import { SellOutTimes } from "@/components/restocks/SellOutTimes";
import { BrowseModels,BrowsePopular } from "@/components/seo/Browse";
import { Faq } from "@/components/seo/Faq";
import { JsonLd } from "@/components/seo/JsonLd";
import { ModelPlaceCards } from "@/components/seo/ModelPlaceCards";
import { LinkRow,RelatedBlock } from "@/components/seo/Related";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { SALES_TAX,SALES_TAX_SOURCE } from "@/content/sales-tax";
import { citiesWithStores, cityPath, DEFAULT_MODEL, MODELS, statePath, statesWithStores, storesOf, catalogFor, partNumbersFor } from "@/lib/apple/catalog";
import { prefixOf,type Country } from "@/lib/apple/countries";
import { emptyFacts } from "@/lib/content/facts";
import { englishLocale,pathInLocale,type Locale } from "@/lib/i18n/locales";
import { storesIndexTitle } from "@/lib/seo/countryCopy";
import { alertHref, itemListJsonLd, peakOf } from "@/lib/seo/enrich";
import { US as US_PLACE } from "@/lib/seo/products";
import { treeOf } from "@/lib/seo/tree";
import { placeStats, restockReportStats, restockStats, storesStock, storesWithStockNow, stockByStore } from "@/lib/stock/queries";
import { sellouts } from "@/lib/stock/sellouts";
import type { Metadata } from "next";
import { cache } from "react";
import { hreflangFor } from "./shared";

/**
 * Bound keywords (DataForSEO, project documentation §10): "list of apple stores" 210/mo, KD 0 (title and H1); "how many
 * apple stores in the us" 320, KD 30 (its own section); "apple store locations" 22,200, KD 100 (the
 * heading of the state list). The page used to target "apple stores by state", which measures 10.
 */
function hubTitle(c: Country): string {
  if (c.cc !== "us") return storesIndexTitle(c.cc);
  return `US iPhone Pickup Planner: Compare ${storesOf("us").length} Apple Stores`;
}

/** Nationwide numbers, all cached (60 s): 1 + 3 + 1 queries; another country also reads its stores' stock (one query). */
export const loadIndex = cache(async (cc: Country["cc"]) => {
  const stores = storesOf(cc);
  const tz = cc === "us" ? "America/New_York" : treeOf(cc).root.tz;
  const numbers = stores.map((s) => s.storeNumber);
  const [stockNow, pstats, stats, stock, duo, max, reports, sell, duoClock, duoReports, duoRows, times, duoSell, alerts] = await Promise.all([
    storesWithStockNow(undefined, cc),
    placeStats({ tz, country: cc }),
    restockStats(numbers, tz, 30),
    cc === "us" ? Promise.resolve(new Map()) : storesStock(numbers),
    cc === "us" ? Promise.resolve(null) : placeStats({ model: "duo", tz, country: cc }),
    cc === "us" ? Promise.resolve(null) : placeStats({ model: "18-pro-max", tz, country: cc }),
    restockReportStats(numbers, tz, 30, undefined, undefined, cc),
    sellouts({ country: cc }),
    // iPhone Duo only for the opening ledger and the hour chart (2026-11-08).
    restockStats(numbers, tz, 30, "duo", undefined, cc),
    restockReportStats(numbers, tz, 30, "duo", undefined, cc),
    stockByStore("duo", {}, cc),
    duoRestockTimes(cc),
    sellouts({ parts: partNumbersFor("duo", [], [], cc), country: cc }),
    alertsDelivered(numbers),
  ]);
  const ledger = duoLedgerFrom({ stores, stock: stockFromRows(duoRows), others: { pro: stockNow["18-pro"], max: stockNow["18-pro-max"] }, times, sell: duoSell, alerts, configsTotal: catalogFor("duo", cc).length });
  return { stockNow, pstats, stats, stock, duo, max, reports, sell, duoClock, duoReports, ledger };
});

export async function storesIndexMetadata(c: Country, loc: Locale = englishLocale(c.cc)): Promise<Metadata> {
  const F = fieldGuideCopy(loc.lang);
  const title = c.cc === "us" ? hubTitle(c) : `${countryLabel(c.cc,loc.lang)} · ${F.next}`;
  const n = storesOf(c.cc).length;
  const description = c.cc === "us"
    ? `Find a practical iPhone pickup route through ${n} US Apple Stores. Browse cities, compare configurations and use the observation history to build a shortlist.`.slice(0, 160)
    : `${countryLabel(c.cc,loc.lang)} · ${F.lead}`.slice(0,160);
  const url = loc.native ? pathInLocale(`${prefixOf(c.cc)}/stores`, loc) : `${prefixOf(c.cc)}/stores`;
  return withCuratedMetadata(url, { title, description, alternates: { canonical: url, languages: hreflangFor("stores", loc) }, openGraph: { type: "website", siteName: "ShelfSpring", title, description, url } });
}

/** The US index. Another country's is StoresIndexIntl.tsx (a module of its own, so the US page loads none of its client code). */
export async function StoresIndexPage({ country: c }: { country: Country }) {
  const STORES = storesOf(c.cc);
  const d = await loadIndex("us");
  const states = statesWithStores();
  const cities = citiesWithStores();
  const alert = alertHref({ model: DEFAULT_MODEL });
  const questions = fieldGuideQuestions({place:"the United States",stores:STORES.length,kind:"country"});
  const top = [...states].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).slice(0, 10);
  const thin = states.filter((s) => s.count <= 2).map((s) => s.name);
  const W = t().modules.duoLedger;
  const peakAll = peakOf(d.stats, "en");
  return (
    <div className="field-page">
      <JsonLd data={itemListJsonLd("US Apple Store pickup directory",STORES)} />
      <FieldIntro title="Find your next pickup stop." description="An iPhone search gets more useful when it becomes local. Choose a state, find the cities you can reach, and compare exact configurations at individual stores. This directory separates that practical route from the historical data behind it."
        actions={<><Link href={`/map?model=${DEFAULT_MODEL}`} className="btn btn-primary btn-sm">Explore the pickup map</Link><Link href="/stock/iphone-duo" className="btn btn-ghost btn-sm">Compare iPhone Duo</Link></>}>
        <dl className="field-metrics"><div className="field-metric"><dt className="field-label">Apple Stores in this directory</dt><dd className="field-value">{STORES.length}</dd></div><div className="field-metric"><dt className="field-label">Cities to explore</dt><dd className="field-value">{cities.length}</dd></div><div className="field-metric"><dt className="field-label">States & Washington, D.C.</dt><dd className="field-value">{states.length}</dd></div></dl>
      </FieldIntro>
      <div className="pt-8"><DuoLedger d={d.ledger} place="the US" stores={STORES} country="us" hourHref="/iphone-duo-restock-times" watchHref={alert} /></div>
      <div className="field-layout">
        <div className="field-main">
          <FieldSection id="regions" title="Choose a travel boundary" caption="01 / The directory">
            <div className="field-index">{states.map(s => {
              const mine=cities.filter(x=>x.state===s.name);
              return <article key={s.slug} className="border-t border-line py-4"><Link href={statePath(s.name)} className="flex items-start justify-between gap-3 text-xl font-semibold"><span>{s.name}</span><span className="font-mono text-sm font-normal text-ink-3">{s.count} ↗</span></Link><p className="mt-2 text-xs text-ink-3">{mine.length} {mine.length===1 ? "city" : "cities"}{SALES_TAX[s.name]?.combined===0 ? " · no state or local sales tax in the tracked estimate" : ""}</p><div className="mt-3 flex flex-wrap gap-x-3 gap-y-2 text-sm">{mine.map(x=><Link key={x.slug} href={cityPath(x.state,x.name)} className="text-ink-2 underline-offset-4 hover:underline">{x.name} <span className="font-mono text-xs text-ink-3">{x.stores.length}</span></Link>)}</div></article>;
            })}</div>
          </FieldSection>
          <FieldSection id="models" title="Three model searches, one local decision" caption="02 / Configuration first"><ModelPlaceCards place={US_PLACE} stockNow={d.stockNow} of={STORES.length} unit="stores at the recorded observation" /></FieldSection>
          <FieldSection id="geography" title="Where the directory is densest" caption="03 / Store geography"><p className="max-w-2xl text-sm leading-relaxed text-ink-2">Store count describes the number of places you could compare. It does not measure the number of phones or the probability of finding your chosen configuration.</p><div className="mt-5 overflow-x-auto"><table className="w-full text-start text-sm"><caption className="mb-3 text-start text-xs text-ink-3">Ten states with the most listed Apple Stores</caption><thead><tr className="border-b border-line text-ink-3"><th className="py-3 text-start">State</th><th className="py-3 text-end">Stores</th><th className="py-3 text-end">Cities</th></tr></thead><tbody>{top.map(s=><tr key={s.slug} className="border-b border-line"><td className="py-3"><Link href={statePath(s.name)}>{s.name}</Link></td><td className="text-end font-mono">{s.count}</td><td className="text-end font-mono">{cities.filter(x=>x.state===s.name).length}</td></tr>)}</tbody></table></div></FieldSection>
          <FieldSection id="calendar" title={`A day-by-day record: ${d.pstats.days} days`} caption="04 / Historical evidence"><DailyBars stats={d.pstats} label="across the US" /></FieldSection>
          <FieldSection id="timing" title="Clock hours of logged Duo returns, nationwide"><RestockClock stats={d.duoClock} label="across the US" reports={d.duoReports} /><p className="mt-3 text-xs text-ink-3">{W.allModels({ n: d.pstats.month, days: d.pstats.days, peak: peakAll ? peakAll.hour : null })}</p></FieldSection>
          <FieldSection id="duration" title="How long observed pickup windows lasted"><SellOutTimes data={d.sell} label="across the US" showStore /></FieldSection>
        </div>
        <aside className="field-aside space-y-6"><FieldMethod /><div className="pane p-5"><p className="field-kicker">Your shortlist</p><h2 className="mt-2 text-xl font-semibold">Watch a choice you would actually buy.</h2><p className="mt-3 text-sm leading-relaxed text-ink-2">One alert is one exact model, storage and color at one store. Choose the configuration first; a national total cannot make that decision for you.</p><Link href={alert} className="btn btn-primary mt-5">Set up a pickup alert</Link></div><SourceList sources={[{label:"Apple retail store directory",url:"https://www.apple.com/retail/storelist/"},SALES_TAX_SOURCE]} facts={emptyFacts()} /></aside>
      </div>
      <div className="field-section"><Faq items={questions} title="Planning questions" /></div>

      <RelatedBlock title="Elsewhere in the ledger">
        <LinkRow title="Also in the ledger" links={[{ href: "/restocks", label: "Return record" }, { href: "/map", label: "Pickup map" }, ...MODELS.map((m) => ({ href: `/stock/${m.slug}`, label: `${m.name}: today's shelf` })), { href: "/how-it-works", label: "Method notes" }, { href: "/install", label: "Install the web app" }, { href: "/pricing", label: "Plans and prices" }]} />
        <LinkRow title="Small footprints: states with one or two stores" links={thin.map((n) => ({ href: statePath(n), label: n }))} />
        <BrowsePopular />
        <BrowseModels />
      </RelatedBlock>
    </div>
  );
}

