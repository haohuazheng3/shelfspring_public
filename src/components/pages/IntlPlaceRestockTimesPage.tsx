import { FieldCoverage, FieldIntro, FieldMethod, FieldSection, fieldGuideCopy, fieldGuideQuestions } from "@/components/seo/FieldGuide";
import { fieldNarrative } from "@/components/seo/FieldGuideNarrative";
import { PickupPattern } from "@/components/seo/PickupPattern";
import { withCuratedMetadata } from "@/lib/seo/curation";
/**
 * /{cc}/iphone-duo-restock-times/{region}[/{city}] and the native versions under /{lang}-{cc}/…: the iPhone Duo
 * pickup-opening record of one region or two-plus-store city in a country other than the US, in the shape the country
 * page uses (lib/content/restockTimes.ts, duoRestockTimesAt): the sample first, then stores, configurations, hours,
 * days and listing duration, every number counted over the place's own stores and the national figure kept apart.
 * Which places have a page is lib/content/restockPlaces.ts (the /stores rule); the proxy 308s or 404s the rest.
 * English pages carry their own sentences; native versions read the translated field-guide chrome and tables and
 * leave out the English-only narrative rather than translate it badly. Outside the curated publication set (noindex).
 */
import { RichFaq, SourceList } from "@/components/content/RichFaq";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs, LinkRow, RelatedBlock, type Crumb } from "@/components/seo/Related";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { Stat, StatGrid } from "@/components/ui/Viz";
import { catalogFor, storeByNumber, storePath, storeTimeZone, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, prefixOf, theName, type Country, type CountryCode } from "@/lib/apple/countries";
import { emptyFacts } from "@/lib/content/facts";
import { restockPlacePages, restockPlaceTarget, type RestockPlacePage } from "@/lib/content/restockPlaces";
import { busiestWindow, duoRestockTimes, duoRestockTimesAt, rangeLabel, type RestockTimes } from "@/lib/content/restockTimes";
import { PATTERN_MIN, PATTERN_MIN_DAYS } from "@/lib/content/siteFacts";
import type { Faq, Source } from "@/lib/content/types";
import type { RestockTimesView } from "@/lib/i18n/dict/en/views";
import { num, stamp } from "@/lib/i18n/format";
import { englishLocale, pathInLocale, type Lang, type Locale } from "@/lib/i18n/locales";
import { cityLabel, configLabel, countryLabel, regionLabel } from "@/lib/i18n/places";
import { t as dictT, pageLocale } from "@/lib/i18n/server";
import { alertHref, fitTitle, plural } from "@/lib/seo/enrich";
import { storesStock, storesWithStockNow } from "@/lib/stock/queries";
import { recentByConfig } from "@/lib/stock/recent";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cache } from "react";

const SITE = "https://shelfspring.com";
const APPLE_PICKUP = "https://www.apple.com/shop/shipping-pickup";
const APPLE_NEWSROOM = "https://www.apple.com/newsroom/2026/10/iphone-duo-arrives-at-apple-store-locations-worldwide/";

/** The place page for a route's segments, or null (the proxy answered 404 / 308 before this streamed; this is the backstop). */
export function intlRestockPlace(cc: CountryCode, regionSlug: string, citySlug?: string): RestockPlacePage | null {
  const r = restockPlaceTarget(cc, regionSlug, citySlug);
  return r && "page" in r ? r.page : null;
}

// Keyed by strings: React's cache compares arguments by identity, and the page and its metadata resolve the place separately.
const load = cache(async (cc: CountryCode, regionSlug: string, citySlug: string) => {
  const page = intlRestockPlace(cc, regionSlug, citySlug || undefined);
  if (!page) return null;
  const numbers = page.stores.map((s) => s.storeNumber);
  const [t, country, stockNow, recent, stock] = await Promise.all([duoRestockTimesAt(cc, page.stores), duoRestockTimes(cc), storesWithStockNow(numbers, cc), recentByConfig({ storeNumbers: numbers, country: cc }), storesStock(numbers)]);
  return { page, t, country, stockNow, recent, stock };
});

/* ---------------------------------------------------------------- formats */

/** "GMT", "JST", "GMT+9": the zone's short name for a one-zone place; several zones → the store-local-time phrase. */
function zoneOf(stores: Store[], lang: Lang, localWord: string): { tz: string; word: string } {
  const zones = [...new Set(stores.map((s) => storeTimeZone(s)))];
  const tz = zones[0];
  if (zones.length !== 1 || lang !== "en") return { tz, word: localWord };
  const abbr = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" }).formatToParts(new Date()).find((p) => p.type === "timeZoneName")?.value;
  return { tz, word: abbr ? `store local time (${abbr})` : "store local time" };
}
const n = (x: number) => x.toLocaleString("en-US");
const pct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
const longDate = (ymd: string) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${ymd}T12:00:00Z`));
const secs = (s: number) => (s < 120 ? `${s} s` : `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")} s`);
const about = (s: number) => (s < 100 ? `about ${Math.round(s / 5) * 5} seconds` : s < 3600 ? `about ${Math.round(s / 60)} minutes` : `about ${(s / 3600).toFixed(1)} hours`);

function placeName(cc: CountryCode, page: RestockPlacePage, lang: Lang): string {
  return page.level === "city" ? cityLabel(cc, page.city!, lang) : regionLabel(cc, page.region, lang);
}

/** The English sentence everything else repeats: share, sample, since-date, window, zone, median. */
function quotable(name: string, k: number, t: RestockTimes, zone: string): string {
  const where = `${k} Apple Stores in ${name}`;
  if (t.unknown) return `ShelfSpring's restock log for the ${where} could not be read just now; current evidence is unavailable for this request. Reload to request a newer snapshot.`;
  if (t.n === 0) return `The historical record for the ${where}, from ${longDate(t.since)}, contains no confirmed iPhone Duo pickup return yet.`;
  const w = busiestWindow(t.byHour);
  if (t.peakHour != null) return `${pct(w.share)} of the ${n(t.n)} iPhone Duo restocks recorded at the ${where} since ${longDate(t.since)} landed between ${rangeLabel(w.from, w.to)} in ${zone}${t.sellout ? `, and a typical one sold out in ${about(t.sellout.medianSec)}` : ""}.`;
  return `The ${where} have restocked the iPhone Duo ${plural(t.n, "time")} since ${longDate(t.since)}, on ${plural(t.days, "day")} — not yet enough to call a usual hour (ShelfSpring waits for ${PATTERN_MIN} restocks over ${PATTERN_MIN_DAYS} different days)${t.sellout ? `; a typical one sold out in ${about(t.sellout.medianSec)}` : ""}.`;
}

const th = "border-b border-line-2 py-2 pe-3 text-start font-semibold text-ink";
const td = "py-2 pe-3 align-top tabular-nums";
const rowTh = "py-2 pe-3 text-start font-medium text-ink";

function Table({ caption, head, children, min = "28rem" }: { caption: string; head: string[]; children: ReactNode; min?: string }) {
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

/* ---------------------------------------------------------------- metadata */

export async function intlPlaceRestockTimesMetadata(c: Country, regionSlug: string, citySlug: string | undefined, loc: Locale = englishLocale(c.cc)): Promise<Metadata> {
  const d = await load(c.cc, regionSlug, citySlug ?? "");
  if (!d) return {};
  const lang = loc.lang;
  const name = placeName(c.cc, d.page, lang);
  const Guide = fieldGuideCopy(lang);
  const zone = zoneOf(d.page.stores, lang, dictT().modules.duoLedger.zone(null));
  const title = lang === "en" ? fitTitle([`iPhone Duo Pickup Windows in ${name}: The Record`, `iPhone Duo Restock Record: ${name}`], 70) : `${name} · iPhone Duo · ${Guide.evidence}`;
  const q = quotable(name, d.page.stores.length, d.t, zone.word);
  const description = lang === "en" ? fitTitle([q, `${q.split(";")[0].split(", and a typical")[0]}.`, `iPhone Duo restock times in ${name}: ${n(d.t.n)} confirmed restocks since ${d.t.since}, by hour, day and store.`], 158) : `${name} · ${fieldNarrative(lang).study}`.slice(0, 160);
  const url = loc.native ? pathInLocale(d.page.path, loc) : d.page.path;
  return withCuratedMetadata(url, {
    title: { absolute: `${title} · ShelfSpring` },
    description,
    alternates: { canonical: url },
    openGraph: { type: "article", siteName: "ShelfSpring", title, description, url },
  });
}

/* ---------------------------------------------------------------- page */

export async function IntlPlaceRestockTimesPage({ country: c, regionSlug, citySlug }: { country: Country; regionSlug: string; citySlug?: string }) {
  const cc = c.cc;
  const d = await load(cc, regionSlug, citySlug ?? "");
  if (!d) return null;
  const { page, t, country: nat, stockNow, recent, stock } = d;
  const loc = pageLocale();
  const lang = loc.lang;
  const D = dictT();
  const V = D.views.restockTimes;
  const C = D.views.common;
  const F = V.fmt;
  const Guide = fieldGuideCopy(lang);
  const Narrative = fieldNarrative(lang);
  const en = lang === "en";
  const inLoc = (path: string) => (loc.native ? pathInLocale(path, loc) : path);
  const { stores } = page;
  const k = stores.length;
  const city = page.level === "city";
  const name = placeName(cc, page, lang);
  const regionName = regionLabel(cc, page.region, lang);
  const countryName = en ? theName(c) : countryLabel(cc, lang);
  const zone = zoneOf(stores, lang, D.modules.duoLedger.zone(null));
  const facts = emptyFacts(cc, zone.tz);
  const items = catalogFor("duo", cc);
  const cfg = (p: string) => { const i = items.find((x) => x.partNumber === p); return i ? configLabel(i, lang) : p; };
  const w = busiestWindow(t.byHour);
  const pattern = t.peakHour != null;
  const today = t.today;
  const tracked = Math.max(t.daily.length, t.days, 1);
  const hours = t.byHour.map((count, hour) => ({ hour, count })).filter((h) => h.count > 0);
  const sell = t.sellout;
  const storeRows = t.topStores.map((r) => ({ ...r, store: storeByNumber(r.storeNumber) })).filter((r) => r.store);
  const quiet = stores.filter((s) => !t.topStores.some((r) => r.storeNumber === s.storeNumber));
  const parts = t.byPart;
  const alert = alertHref({ model: "duo", state: page.regionSlug, city: page.citySlug, country: cc });
  const logHref = `${prefixOf(cc)}/restocks`;
  const countryHref = `${prefixOf(cc)}/iphone-duo-restock-times`;
  const share = t.n && nat.n ? Math.round((t.n / nat.n) * 1000) / 10 : 0;
  const lead = quotable(name, k, t, zone.word);
  const title = en ? fitTitle([`iPhone Duo Pickup Windows in ${name}: The Record`, `iPhone Duo Restock Record: ${name}`], 70) : `${name} · iPhone Duo · ${Guide.evidence}`;
  const h1 = en ? `${name}: a study of iPhone Duo pickup openings` : `${name} · iPhone Duo · ${Guide.evidence}`;
  const nn = (x: number) => (en ? n(x) : num(lang, x));

  // The sentences and captions the dictionaries write for a country, pointed at this place where they take the country phrase.
  const x: RestockTimesView = {
    c: { ...c, inName: en ? `in ${name}` : c.inName }, t, w, pattern, us: false, one: k === 1, tracked, stores: k, duoNow: stockNow.duo, weekend: t.byWeekday[0] + t.byWeekday[6], sell,
    recent: { restocks: recent.restocks, stores: recent.stores }, configs: items.length, pairs: k * items.length, storageRatio: null, reportNames: [], alert, logHref, storesHref: page.storesPath,
  };
  const NAV = V.nav(x);

  // Sideways: the region's other cities with a page, the country's other regions with a page; the country itself.
  const pages = restockPlacePages(cc);
  const regionPage = pages.regions.find((r) => r.regionSlug === page.regionSlug);
  const cityPages = pages.cities.filter((p) => p.regionSlug === page.regionSlug && p.citySlug !== page.citySlug).map((p) => ({ href: inLoc(p.path), label: cityLabel(cc, p.city!, lang), meta: String(p.stores.length) }));
  const otherRegions = pages.regions.filter((p) => p.regionSlug !== page.regionSlug).map((p) => ({ href: inLoc(p.path), label: regionLabel(cc, p.region, lang), meta: String(p.stores.length) }));
  const otherCities = pages.cities.filter((p) => p.regionSlug !== page.regionSlug).slice(0, 10).map((p) => ({ href: inLoc(p.path), label: cityLabel(cc, p.city!, lang), meta: String(p.stores.length) }));

  const faq: Faq[] = fieldGuideQuestions({ place: name, stores: k, kind: "study", model: "iPhone Duo", lang });
  const sources: Source[] = [
    { label: V.sources.applePickup, url: APPLE_PICKUP },
    { label: V.sources.newsroom, url: APPLE_NEWSROOM },
  ];

  const url = inLoc(page.path);
  const inLanguage = loc.native ? { inLanguage: loc.tag } : {};
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${SITE}${url}`, url: `${SITE}${url}`, name: title, headline: h1, ...(en ? { description: lead } : {}), isPartOf: { "@id": `${SITE}/#website` }, about: { "@id": `${SITE}/#organization` }, dateModified: t.at, ...inLanguage },
      {
        "@type": "Dataset", "@id": `${SITE}${url}#dataset`, name: en ? `iPhone Duo restocks at Apple Stores in ${name}` : `iPhone Duo · ${name}`,
        description: en ? `Every confirmed iPhone Duo in-store pickup restock at the ${k} Apple ${k === 1 ? "Store" : "Stores"} in ${name} since ${longDate(t.since)}, from the historical inventory record: by local hour, by day, by store and by configuration, with how long each restock stayed listed.` : Narrative.study,
        url: `${SITE}${url}`, publisher: { "@id": `${SITE}/#organization` }, isAccessibleForFree: true, temporalCoverage: `${t.since}/..`, dateModified: t.at,
        spatialCoverage: { "@type": "Place", name: city ? `${page.city}, ${page.region}, ${COUNTRIES[cc].iso}` : `${page.region}, ${COUNTRIES[cc].iso}`, ...(city ? { containedInPlace: { "@type": "AdministrativeArea", name: page.region } } : {}) },
        variableMeasured: ["Confirmed iPhone Duo restocks per local hour", "Restocks per day and per store", "Restocks per storage size and color", "Seconds a restock stayed listed before it sold out"],
        ...(t.n ? { size: `${n(t.n)} restocks` } : {}),
        ...inLanguage,
      },
    ],
  };

  const crumbs: Crumb[] = [
    { href: inLoc(prefixOf(cc)), label: en ? c.short : countryName },
    { href: inLoc(countryHref), label: V.crumb },
    ...(city && regionPage ? [{ href: inLoc(regionPage.path), label: regionName }] : []),
    { label: name },
  ];

  return (
    <div className="field-page">
      <JsonLd data={ld} /><Breadcrumbs items={crumbs} />
      <FieldIntro title={h1} description={en ? `A local record is useful only when its sample is visible. This study follows ${k} Apple ${k === 1 ? "Store" : "Stores"} in ${name}, compares their recorded configurations and timing, and keeps the national figures for ${countryName} separate. Read the observations before deciding which stores to watch.` : Narrative.study}
        actions={<><Link href={inLoc(page.storesPath)} className="btn btn-primary btn-sm">{en ? "Open the local pickup board" : Guide.compare}</Link><Link href={alert} className="btn btn-ghost btn-sm">{V.setUpAlert}</Link></>}>
        <div className="pane p-5"><p className="field-kicker">{Guide.evidence}</p><p className="mt-4 font-mono text-4xl">{t.unknown ? "—" : F.n(t.n)}</p><p className="mt-1 text-sm text-ink-3">{V.hero.restocks(x)}</p><p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-ink-3">{Guide.updated}: <time dateTime={t.since}>{F.longDate(t.since)}</time> → <time dateTime={t.at}>{stamp(lang, t.at, zone.tz, true)}</time>{en ? <><br />Hours grouped in {zone.word}</> : null}</p></div>
      </FieldIntro>
      <div className="field-layout">
        <div className="field-main">
          <FieldSection id="stores" title={en ? "Start with the differences between stores" : Guide.compare} caption={en ? "01 / Local comparison" : undefined}>
            <p className="text-sm leading-relaxed text-ink-2">{t.unknown ? Guide.unknown : en ? `${storeRows.length} of the ${k} stores have at least one recorded return in this window. Repeated returns at one location increase its event count, not the number of phones or your chance of buying one.` : Narrative.places}</p>
            {!t.unknown && <Table caption={en ? V.storesCaption(x) : Guide.compare} head={V.storesHead} min="34rem">{storeRows.map((r) => <tr key={r.storeNumber} className="border-b border-line"><th scope="row" className={rowTh}><Link href={inLoc(storePath(r.store!))} className="underline-offset-4 hover:underline">{F.store(r.store!)}</Link></th><td className={td}>{F.n(r.restocks)}</td><td className={td}>{nn(r.days)}</td><td className={td}>{r.peakHour == null ? "—" : F.hour(r.peakHour)}</td><td className={td}>{F.local(r.lastAt, r.store!)}</td></tr>)}{quiet.map((s) => <tr key={s.storeNumber} className="border-b border-line text-ink-3"><th scope="row" className={rowTh}><Link href={inLoc(storePath(s))} className="underline-offset-4 hover:underline">{F.store(s)}</Link></th><td className={td}>0</td><td className={td}>0</td><td className={td}>—</td><td className={td}>—</td></tr>)}</Table>}
          </FieldSection>
          <FieldSection id="configuration" title={en ? "Compare configurations without predicting the next return" : NAV.configuration} caption={en ? "02 / What returned" : undefined}>
            <p className="text-sm leading-relaxed text-ink-2">{en ? "Color and storage totals combine observations across these stores. The same configuration can appear repeatedly. Use this table to understand the sample, then choose something you would actually buy." : Narrative.configuration}</p>
            {!t.unknown && <Table caption={en ? V.configCaption(x) : NAV.configuration} head={V.configHead}>{parts.map((p) => <tr key={p.partNumber} className="border-b border-line"><th scope="row" className={rowTh}>{cfg(p.partNumber)}</th><td className={td}>{F.n(p.restocks)}</td><td className={td}>{t.n ? F.pct(p.restocks / t.n) : "—"}</td><td className={td}>{p.lastAt && p.lastStore && storeByNumber(p.lastStore) ? F.local(p.lastAt, storeByNumber(p.lastStore)!) : "—"}</td></tr>)}</Table>}
            <PickupPattern data={recent} storeCount={k} country={cc} window="24h" />
          </FieldSection>
          <FieldSection id="time-of-day" title={en ? "A distribution of hours, not a delivery schedule" : NAV["time-of-day"]} caption={en ? "03 / Timing" : undefined}>
            <p className="text-sm leading-relaxed text-ink-2">{t.unknown ? Guide.unknown : en ? pattern ? `The largest observed hour was ${F.range(t.peakHour!, t.peakHour! + 1)} in ${zone.word}, with ${n(t.byHour[t.peakHour!])} returns. ${pct(w.share)} fell inside the busiest two-hour window, ${F.range(w.from, w.to)}. Neither figure schedules a future delivery.` : `We have ${n(t.n)} returns across ${t.days} days. The threshold for naming an hour pattern is ${PATTERN_MIN} returns over ${PATTERN_MIN_DAYS} days, so a single burst is not presented as a habit.` : Narrative.hours}</p>
            {hours.length > 0 && <Table caption={en ? V.hourCaption(x) : NAV["time-of-day"]} head={V.hourHead} min="20rem">{hours.map((h) => <tr key={h.hour} className="border-b border-line"><th scope="row" className={rowTh}>{F.range(h.hour, h.hour + 1)}</th><td className={td}>{F.n(h.count)}</td><td className={td}>{t.n ? F.pct(h.count / t.n) : "—"}</td></tr>)}</Table>}
            {!nat.unknown && nat.n > 0 && <p className="mt-5 border-t border-line pt-4 text-sm text-ink-3">{en ? <>For comparison, the national sample for {countryName} contains {n(nat.n)} returns. This local sample represents {share}% of that total. </> : <>{countryName}: {F.n(nat.n)} · {F.pct(nat.n ? t.n / nat.n : 0)}. </>}<Link href={inLoc(countryHref)} className="underline underline-offset-4">{en ? "Read the nationwide study" : V.crumb}</Link>.</p>}
          </FieldSection>
          <FieldSection id="day-by-day" title={en ? "Trace the sample one day at a time" : NAV["day-by-day"]} caption={en ? "04 / The daily ledger" : undefined}>
            <p className="text-sm leading-relaxed text-ink-2">{en ? "Dates follow each store's local calendar. A zero means no confirmed return was recorded that day; it is not proof that a store received no phones. Today is an incomplete day." : Narrative.days}</p>
            <Table caption={en ? V.dayCaption(x) : NAV["day-by-day"]} head={[V.dayHead.date, V.dayHead.restocks, V.dayHead.stores, V.dayHead.busiest]} min="26rem">{[...t.daily].reverse().map((dd) => <tr key={dd.date} className="border-b border-line"><th scope="row" className={rowTh}>{F.date(dd.date)}{today?.date === dd.date ? V.soFar : ""}</th><td className={td}>{F.n(dd.restocks)}</td><td className={td}>{dd.stores}</td><td className={td}>{dd.peakHour == null ? "—" : F.range(dd.peakHour, dd.peakHour + 1)}</td></tr>)}</Table>
          </FieldSection>
          <FieldSection id="how-long" title={en ? "How long did completed pickup windows remain listed?" : NAV["how-long"]} caption={en ? "05 / Listing duration" : undefined}>
            <p className="text-sm leading-relaxed text-ink-2">{en ? sell ? `The timing sample includes ${n(sell.n)} return-to-sellout intervals. Its median is ${secs(sell.medianSec)}: half of those measured intervals were no longer than that. Listings still open are excluded. The spacing between observations makes these upper bounds, not exact reservation deadlines.` : "Fewer than ten completed intervals are available, so this study does not publish a local median. Missing timing data is not a zero-second window." : Narrative.duration}</p>
            {sell && <StatGrid cols={3} className="mt-5"><Stat value={sell.medianSec} unit={V.secUnit} label={V.medianListing} /><Stat value={F.pct(sell.within2min)} label={V.within2} /><Stat value={F.pct(sell.within20min)} label={V.within20} /></StatGrid>}
          </FieldSection>
        </div>
        <aside className="field-aside space-y-6"><FieldMethod /><FieldCoverage stores={stores} stock={stock} /><nav className="field-callout" aria-label={V.onThisPage}>{[{ id: "stores", label: en ? "Compare the stores" : Guide.compare }, { id: "configuration", label: NAV.configuration }, { id: "time-of-day", label: NAV["time-of-day"] }, { id: "day-by-day", label: NAV["day-by-day"] }, { id: "how-long", label: NAV["how-long"] }].map((s) => <a key={s.id} href={`#${s.id}`} className="field-row text-sm">{s.label}<span aria-hidden="true">↓</span></a>)}</nav><SourceList sources={sources} facts={facts} where={en ? `the ${k} Apple ${k === 1 ? "Store" : "Stores"} in ${name}` : C.sourcesWhere(k, c)} since={F.longDate(t.since)} /></aside>
      </div>

      <RelatedBlock title={V.related}>
        {city && regionPage && <LinkRow curated title={en ? `All of ${regionName}` : regionName} links={[{ href: inLoc(regionPage.path), label: en ? `When does the iPhone Duo restock in ${regionName}?` : `iPhone Duo · ${regionName}` }]} />}
        {cityPages.length > 0 && <LinkRow curated title={en ? (city ? `Other cities in ${regionName}` : `By city in ${name}`) : D.views.product.byCity} links={cityPages} />}
        {otherRegions.length > 0 && <LinkRow curated title={en ? `Other ${c.regionNounPlural ?? "areas"} ${c.inName}` : D.views.product.byRegion(c)} links={otherRegions} />}
        {otherCities.length > 0 && <LinkRow curated title={en ? `Cities elsewhere ${c.inName}` : D.views.product.byCity} links={otherCities} />}
        <LinkRow curated title={countryName} links={[{ href: inLoc(countryHref), label: en ? `When does Apple restock the iPhone Duo ${c.inName}?` : V.crumb, meta: t.n && nat.n ? `${share}%` : undefined }]} />
        <LinkRow title={en ? `${name}, live` : name} links={[
          { href: inLoc(page.storesPath), label: en ? `Apple Stores in ${name}` : C.appleStoresIn(c) },
          { href: `${logHref}?model=duo`, label: C.restockLog },
          { href: `${prefixOf(cc)}/stock/iphone-duo`, label: en ? `iPhone Duo stock, every store ${c.inName}` : "iPhone Duo" },
        ]} />
      </RelatedBlock>

      <div className="mt-10"><RichFaq items={faq} facts={facts} title={en ? `iPhone Duo restocks in ${name}: FAQ` : V.faqTitle} /></div>
    </div>
  );
}
