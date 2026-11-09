import { FieldIntro,FieldMethod,FieldSection,fieldGuideCopy,fieldGuideQuestions } from "@/components/seo/FieldGuide";
import { fieldNarrative } from "@/components/seo/FieldGuideNarrative";
import { PickupPattern } from "@/components/seo/PickupPattern";
import { withCuratedMetadata } from "@/lib/seo/curation";
/**
 * /iphone-duo-restock-times and /{cc}/iphone-duo-restock-times: "Is Apple still restocking the iPhone Duo, and
 * when?" answered the way an answer engine can quote it — one sentence with the numbers under every question — and
 * shown the way a reader scans it: tiles, tables by local hour, day, region, store and configuration, keyword lines,
 * swap cards and folded notes. Every number is ShelfSpring's own confirmed observation (lib/content/restockTimes.ts);
 * other trackers' launch-week reports appear as their own, labelled rows and are never counted.
 */
import { RichFaq,SourceList } from "@/components/content/RichFaq";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs,LinkRow,RelatedBlock,type Crumb } from "@/components/seo/Related";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { Stat,StatGrid } from "@/components/ui/Viz";
import { catalogFor,storeByNumber,storePath,storesOf } from "@/lib/apple/catalog";
import { ALL_CODES,COUNTRIES,prefixOf,type Country } from "@/lib/apple/countries";
import { emptyFacts } from "@/lib/content/facts";
import { busiestWindow,duoRestockTimes } from "@/lib/content/restockTimes";
import { restockPlacePages } from "@/lib/content/restockPlaces";
import { cityLabel } from "@/lib/i18n/places";
import type { Faq,Source } from "@/lib/content/types";
import type { RestockTimesView } from "@/lib/i18n/dict/en/views";
import { englishLocale,pathInLocale,type Lang,type Locale } from "@/lib/i18n/locales";
import { configLabel,countryLabel,regionLabel,storeLabel } from "@/lib/i18n/places";
import { t as dictT,pageLocale } from "@/lib/i18n/server";
import { REPORT_SOURCES } from "@/lib/restockReports";
import { alertHref } from "@/lib/seo/enrich";
import { storesWithStockNow } from "@/lib/stock/queries";
import { recentByConfig } from "@/lib/stock/recent";
import type { Metadata } from "next";
import { cache } from "react";
import { restockPlaces } from "./PlaceRestockTimesPage";
import { hreflangFor, slot24 } from "./shared";

const SITE = "https://shelfspring.com";

const load = cache(async (cc: Country["cc"]) => Promise.all([duoRestockTimes(cc), storesWithStockNow(undefined, cc), recentByConfig({ country: cc })]));

export const RESTOCK_TIMES_TITLE_US = "iPhone Duo Restock Windows: The Recorded Evidence";

export function restockTimesTitle(c: Country, lang: Lang = "en"): string {
  return c.cc === "us" ? RESTOCK_TIMES_TITLE_US : `iPhone Duo · ${countryLabel(c.cc,lang)} · ${fieldGuideCopy(lang).evidence}`;
}

export async function restockTimesMetadata(c: Country, loc: Locale = englishLocale(c.cc)): Promise<Metadata> {
  const title = restockTimesTitle(c, loc.lang);
  const description = `${countryLabel(c.cc,loc.lang)} · ${fieldNarrative(loc.lang).study}`.slice(0,160);
  const path = `${prefixOf(c.cc)}/iphone-duo-restock-times`;
  const url = loc.native ? pathInLocale(path, loc) : path;
  return withCuratedMetadata(url, {
    title: { absolute: `${title} · ShelfSpring` },
    description,
    alternates: { canonical: url, languages: hreflangFor("restock-times", loc) },
    openGraph: { type: "article", siteName: "ShelfSpring", title, description, url },
  });
}

const th = "border-b border-line-2 py-2 pe-3 text-start font-semibold text-ink";
const td = "py-2 pe-3 align-top tabular-nums";
const rowTh = "py-2 pe-3 text-start font-medium text-ink";

function Table({ caption, head, children, min = "28rem" }: { caption: string; head: string[]; children: React.ReactNode; min?: string }) {
  return (
    <div className="my-5 overflow-x-auto">
      <table className="w-full border-collapse text-sm" style={{ minWidth: min }}>
        <caption className="mb-2 text-start text-xs text-ink-3">{caption}</caption>
        <thead><tr>{head.map((h) => <th key={h} scope="col" className={th}>{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export async function RestockTimesPage({ country: c }: { country: Country }) {
  const cc = c.cc;
  const us = cc === "us";
  const loc = pageLocale();
  const lang = loc.lang;
  const V = dictT().views.restockTimes;
  const C = dictT().views.common;
  const F = V.fmt;
  const [t, stockNow, recent] = await load(cc);
  const stores = storesOf(cc);
  const one = stores.length === 1;
  const facts = emptyFacts(cc);
  const items = catalogFor("duo", cc);
  const cfg = (p: string) => { const i = items.find((x) => x.partNumber === p); return i ? configLabel(i, lang) : p; };
  const w = busiestWindow(t.byHour);
  const pattern = t.peakHour != null;
  const duoNow = stockNow.duo;
  const today = t.today;
  const stamp = (iso: string, storeNumber: string) => F.local(iso, storeByNumber(storeNumber) ?? stores[0]);
  const alert = alertHref({ model: "duo", country: cc });
  const logHref = us ? "/restocks" : `${prefixOf(cc)}/restocks`;
  const storesHref = us ? "/stores" : (prefixOf(cc) || "/");
  const url = loc.native ? pathInLocale(`${prefixOf(cc)}/iphone-duo-restock-times`, loc) : `${prefixOf(cc)}/iphone-duo-restock-times`;
  const title = restockTimesTitle(c, lang);
  const region = (name: string) => regionLabel(cc, name, lang);

  /** Days from the first tracked one to today, restocks or not (spanDays counts only days between the first and last restock). */
  const tracked = Math.max(t.daily.length, t.days, 1);
  const hours = t.byHour.map((count, hour) => ({ hour, count })).filter((h) => h.count > 0);
  const regions = t.byRegion;
  const regionsHit = regions.filter((r) => r.restocks > 0);
  const topRegions = regionsHit.slice(0, 12);
  const topStores = t.topStores.slice(0, 8).map((r) => ({ ...r, store: storeByNumber(r.storeNumber) })).filter((r) => r.store);
  const parts = t.byPart;
  const byStorage = new Map<string, number>(), byColor = new Map<string, number>();
  for (const p of parts) { const i = items.find((x) => x.partNumber === p.partNumber); if (!i) continue; byStorage.set(i.storage, (byStorage.get(i.storage) ?? 0) + p.restocks); byColor.set(i.color, (byColor.get(i.color) ?? 0) + p.restocks); }
  const storageTop = [...byStorage.entries()].sort((a, b) => b[1] - a[1]);
  const storageRatio = storageTop.length > 1 && storageTop[1][1] > 0 ? Math.max(1, Math.round((storageTop[0][1] / storageTop[1][1]) * 10) / 10) : null;
  const pairs = stores.length * items.length;
  const reportNames = Object.keys(REPORT_SOURCES);
  const weekend = t.byWeekday[0] + t.byWeekday[6];
  const sell = t.sellout;

  // Every sentence below reads its numbers from here (the dictionary's RestockTimesView).
  const x: RestockTimesView = {
    c, t, w, pattern, us, one, tracked, stores: stores.length, duoNow, weekend, sell,
    recent: { restocks: recent.restocks, stores: recent.stores }, configs: items.length, pairs, storageRatio, reportNames, alert, logHref, storesHref,
  };

  const NAV = V.nav(x), H2 = V.h2(x);
  const sections: { id: string; nav: string; h2: string }[] = ["time-of-day", "day-by-day", ...(one ? [] : ["where"]), "configuration", "how-long", "unavailable", "reddit", "method"].map((id) => ({ id, nav: NAV[id], h2: H2[id] }));
  const h2Of = (id: string) => sections.find((s) => s.id === id)!.h2;

  const faq: Faq[] = fieldGuideQuestions({place:lang === "en" ? c.short : countryLabel(cc,lang),stores:stores.length,kind:"study",model:"iPhone Duo",lang});

  const sources: Source[] = [
    { label: V.sources.applePickup, url: "https://www.apple.com/shop/shipping-pickup" },
    { label: V.sources.newsroom, url: "https://www.apple.com/newsroom/2026/10/iphone-duo-arrives-at-apple-store-locations-worldwide/" },
    ...(us ? [{ label: V.sources.macRumors, url: "https://macrumors.com/2026/10/24/apple-store-pickup-iphone-duo-us/" }] : []),
    ...(t.reports.length ? reportNames.filter((k) => REPORT_SOURCES[k]).map((k) => ({ label: V.sources.reports(k), url: REPORT_SOURCES[k] })) : []),
  ];

  const L = V.ld(x);
  const inLanguage = loc.native ? { inLanguage: loc.tag } : {};
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${SITE}${url}`, url: `${SITE}${url}`, name: title, isPartOf: { "@id": `${SITE}/#website` }, about: { "@id": `${SITE}/#organization` }, dateModified: t.at, ...inLanguage },
      {
        "@type": "Dataset", "@id": `${SITE}${url}#dataset`, name: L.datasetName,
        description: L.description,
        url: `${SITE}${url}`, publisher: { "@id": `${SITE}/#organization` }, isAccessibleForFree: true, temporalCoverage: `${t.since}/..`,
        spatialCoverage: L.spatial, variableMeasured: L.measured,
        ...(t.n ? { size: L.size } : {}),
        ...inLanguage,
      },
    ],
  };

  const short = (k: Country["cc"]) => (lang === "en" ? COUNTRIES[k].short : countryLabel(k, lang));
  const crumbs: Crumb[] = us ? [{ href: "/", label: "ShelfSpring" }, { label: V.crumb }] : [{ href: prefixOf(cc), label: short(cc) }, { label: V.crumb }];
  const otherCountries = ALL_CODES.filter((k) => k !== cc).map((k) => ({ href: `${prefixOf(k)}/iphone-duo-restock-times`, label: short(k) }));

  const Guide=fieldGuideCopy(lang), Narrative=fieldNarrative(lang);
  return (
    <div className="field-page">
      <JsonLd data={ld} /><Breadcrumbs items={crumbs} />
      <FieldIntro title={lang === "en" ? `The iPhone Duo return record · ${c.short}` : `iPhone Duo · ${short(cc)} · ${Guide.evidence}`} description={lang === "en" ? `A study of observed pickup openings across ${stores.length} Apple ${one ? "Store" : "Stores"}. Begin with the sample and its limits, then inspect the configurations, places and hours behind the totals. This is a historical record, not Apple's delivery timetable.` : Narrative.study}
        actions={<><Link href={logHref} className="btn btn-primary btn-sm">{V.logLive}</Link><Link href={alert} className="btn btn-ghost btn-sm">{V.setUpAlert}</Link></>}>
        <div className="pane p-5"><p className="field-kicker">{Guide.evidence}</p><dl className="mt-4 space-y-4"><div><dt className="text-xs text-ink-3">{V.hero.restocks(x)}</dt><dd className="font-mono text-4xl">{t.unknown ? "—" : F.n(t.n)}</dd></div><div className="border-t border-line pt-3"><dt className="text-xs text-ink-3">{Guide.updated}</dt><dd className="mt-2 text-sm"><time dateTime={t.since}>{F.longDate(t.since)}</time> → <time dateTime={t.at}>{new Intl.DateTimeFormat(lang,{dateStyle:"medium",timeZone:c.timeZone}).format(new Date(t.at))}</time></dd></div></dl></div>
      </FieldIntro>
      <div className="field-layout">
        <div className="field-main">
          <FieldSection id="configuration" title={lang === "en" ? "Which choices returned?" : h2Of("configuration")} caption={Guide.evidence}>
            <p className="text-sm leading-relaxed text-ink-2">{lang === "en" ? "A configuration with more recorded returns is not necessarily easier to buy. Each row counts separate openings across stores, so repeat appearances can raise its total without increasing the number of places to collect it." : Narrative.configuration}</p>
            {t.unknown ? <p className="mt-4 text-sm">{Guide.unknown}</p> : <Table caption={V.configCaption(x)} head={[V.configHead[0],V.configHead[2],V.configHead[1],V.configHead[3]]}>{parts.map(p=><tr key={p.partNumber} className="border-b border-line"><th scope="row" className={rowTh}>{cfg(p.partNumber)}</th><td className={td}>{t.n ? F.pct(p.restocks/t.n) : "—"}</td><td className={td}>{F.n(p.restocks)}</td><td className={td}>{p.lastAt && p.lastStore ? <>{stamp(p.lastAt,p.lastStore)}{storeByNumber(p.lastStore) ? <span className="text-ink-3"> · {storeLabel(storeByNumber(p.lastStore)!,lang)}</span> : null}</> : "—"}</td></tr>)}</Table>}
            <PickupPattern data={recent} storeCount={stores.length} country={cc} window="24h" />
          </FieldSection>
          {!one && <FieldSection id="where" title={lang === "en" ? "Where the record is concentrated" : h2Of("where")}>
            <p className="text-sm leading-relaxed text-ink-2">{t.unknown ? Guide.unknown : lang === "en" ? `These are the stores with the most observed returns in this sample. Store size, repeated openings and coverage all affect the ranking; use it to compare a reachable shortlist, not to predict the next phone.` : Narrative.places}</p>
            <Table caption={V.storesCaption(x)} head={[V.storesHead[0],V.storesHead[3],V.storesHead[1],V.storesHead[2],V.storesHead[4]]} min="34rem">{topStores.map(r=><tr key={r.storeNumber} className="border-b border-line"><th scope="row" className={rowTh}><Link href={storePath(r.store!)} className="underline-offset-4 hover:underline">{F.storeWithPlace(r.store!)}</Link></th><td className={td}>{r.peakHour==null ? "—" : F.hour(r.peakHour)}</td><td className={td}>{F.n(r.restocks)}</td><td className={td}>{r.days}</td><td className={td}>{F.local(r.lastAt,r.store!)}</td></tr>)}</Table>
            {topRegions.length>0 && <Table caption={V.regionCaption(x)} head={V.regionHead(x)}>{topRegions.map(r=><tr key={r.slug} className="border-b border-line"><th scope="row" className={rowTh}><Link href={r.path}>{region(r.name)}</Link></th><td className={td}>{F.n(r.restocks)}</td><td className={td}>{V.ofN(r.stores,r.storesTotal)}</td><td className={td}>{r.lastAt&&r.lastStore ? <>{stamp(r.lastAt,r.lastStore)}{storeByNumber(r.lastStore) ? <span className="text-ink-3"> · {storeLabel(storeByNumber(r.lastStore)!,lang)}</span> : null}</> : "—"}</td></tr>)}</Table>}
          </FieldSection>}
          <FieldSection id="time-of-day" title={lang === "en" ? "The hour distribution, in store-local time" : h2Of("time-of-day")}>
            <p className="text-sm leading-relaxed text-ink-2">{t.unknown ? Guide.unknown : lang === "en" ? pattern ? `The largest observed hour was ${F.range(t.peakHour!,t.peakHour!+1)}, with ${F.n(t.byHour[t.peakHour!])} returns. This describes the sample only. A concentrated history is not an announced restock schedule.` : `The sample is too small to describe a usual hour. Individual observations remain visible below without promoting a small burst into a prediction.` : Narrative.hours}</p>
            {hours.length>0 && <Table caption={V.hourCaption(x)} head={V.hourHead} min="20rem">{hours.map(h=><tr key={h.hour} className="border-b border-line"><th scope="row" className={rowTh}>{slot24(h.hour)}</th><td className={td}>{F.n(h.count)}</td><td className={td}>{t.n ? F.pct(h.count/t.n) : "—"}</td></tr>)}</Table>}
          </FieldSection>
          <FieldSection id="day-by-day" title={lang === "en" ? "Daily observations and separately reported history" : h2Of("day-by-day")}>
            <p className="text-sm leading-relaxed text-ink-2">{lang === "en" ? "The date follows each store's local calendar. Third-party reports remain labelled in the source column and are excluded from the confirmed-observation totals above." : Narrative.days}</p>
            <Table caption={V.dayCaption(x)} head={[V.dayHead.date,V.dayHead.busiest,V.dayHead.restocks,...(one ? [] : [V.dayHead.stores]),V.dayHead.source]} min="30rem">{[...t.daily].reverse().map(d=><tr key={d.date} className="border-b border-line"><th scope="row" className={rowTh}>{F.date(d.date)}{today?.date===d.date ? V.soFar : ""}</th><td className={td}>{d.peakHour==null ? "—" : slot24(d.peakHour)}</td><td className={td}>{F.n(d.restocks)}</td>{!one&&<td className={td}>{d.stores}</td>}<td className={td}>ShelfSpring ledger</td></tr>)}{[...t.reports].reverse().map(d=><tr key={`reported-${d.date}`} className="border-b border-line text-ink-3"><th scope="row" className={rowTh}>{F.date(d.date)}</th><td className={td}>{d.peakHour==null ? "—" : slot24(d.peakHour)}</td><td className={td}>{F.n(d.restocks)}</td>{!one&&<td className={td}>{d.stores}</td>}<td className={td}>{V.reportedBy(reportNames)}</td></tr>)}</Table>
          </FieldSection>
          <FieldSection id="how-long" title={lang === "en" ? "How quickly did the observed windows close?" : h2Of("how-long")}>
            <p className="text-sm leading-relaxed text-ink-2">{t.unknown ? Guide.unknown : lang === "en" ? sell ? `There are ${F.n(sell.n)} completed return-to-sellout intervals in the timing sample. Half measured ${sell.medianSec} seconds or less. Open listings are not included; observation intervals make these durations upper bounds, not an exact stopwatch.` : "There are not enough completed intervals to publish a median. We leave the estimate blank rather than borrow a prediction from another place." : Narrative.duration}</p>
            {sell&&<StatGrid cols={3} className="mt-5"><Stat value={sell.medianSec} unit={V.secUnit} label={V.medianListing}/><Stat value={F.pct(sell.within2min)} label={V.within2}/><Stat value={F.pct(sell.within20min)} label={V.within20}/></StatGrid>}
          </FieldSection>
        </div>
        <aside className="field-aside space-y-6"><FieldMethod /><nav className="field-callout" aria-label={V.onThisPage}>{["configuration",...(!one?["where"]:[]),"time-of-day","day-by-day","how-long"].map(id=><a key={id} href={`#${id}`} className="field-row text-sm">{NAV[id]} <span aria-hidden="true">↓</span></a>)}</nav><SourceList sources={sources} facts={facts} where={C.sourcesWhere(stores.length,c)} since={F.longDate(t.since)} /></aside>
      </div>

      <RelatedBlock title={V.related}>
        <LinkRow curated title={V.sameData} links={[
          { href: "/iphone-duo-sell-out-times", label: V.questions.sellOut },
          { href: "/iphone-duo-stock-alerts", label: V.questions.alerts },
          { href: "/how-to-get-an-iphone-duo", label: V.questions.howToGet },
          { href: "/which-iphone-duo-restocks-most", label: V.questions.whichConfig },
          { href: "/iphone-duo-near-me", label: V.questions.nearMe },
          { href: "/apple-store-pickup-availability-explained", label: V.questions.unavailable },
        ]} />
        <LinkRow curated title={V.otherCountries(us)} links={otherCountries} />
        {/* The US page hands down to its states and cities: "When does the iPhone Duo restock in Los Angeles?" (project documentation §8.3 B). */}
        {us && <LinkRow curated title="Split by state" links={restockPlaces().states.map((p) => ({ href: p.href, label: p.label, meta: String(p.stores.length) }))} />}
        {us && <LinkRow curated title="Split by city" links={restockPlaces().cities.map((p) => ({ href: p.href, label: `${p.label}, ${p.stateCode}`, meta: String(p.stores.length) }))} />}
        {/* Another country hands down to its regions and two-plus-store cities with a /stores page of their own (content/restockPlaces.ts). */}
        {!us && restockPlacePages(cc).regions.length > 0 && <LinkRow title={dictT().views.product.byRegion(c)} links={restockPlacePages(cc).regions.map((p) => ({ href: loc.native ? pathInLocale(p.path, loc) : p.path, label: region(p.region), meta: String(p.stores.length) }))} />}
        {!us && restockPlacePages(cc).cities.length > 0 && <LinkRow title={dictT().views.product.byCity} links={restockPlacePages(cc).cities.map((p) => ({ href: loc.native ? pathInLocale(p.path, loc) : p.path, label: cityLabel(cc, p.city!, lang), meta: String(p.stores.length) }))} />}
      </RelatedBlock>

      <div className="mt-10"><RichFaq items={faq} facts={facts} title={V.faqTitle} /></div>
    </div>
  );
}
