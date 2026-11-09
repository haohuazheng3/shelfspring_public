import { FieldCoverage,FieldIntro,FieldMethod,FieldSection,fieldGuideQuestions } from "@/components/seo/FieldGuide";
import { PickupPattern } from "@/components/seo/PickupPattern";
import { withCuratedMetadata } from "@/lib/seo/curation";
/**
 * /iphone-duo-restock-times/{state} and /iphone-duo-restock-times/{state}/{city}: "When does the iPhone Duo restock in
 * Los Angeles?" answered for one US state or two-plus-store city, in the shape an answer engine quotes (project documentation
 * §8): the title is the question, the first sentence carries the share, the sample size, the since-date and the local
 * time, the date it was updated is visible, and every table is the place's own stores. Every number is ShelfSpring's
 * own confirmed observation over the place's stores (lib/content/restockTimes.ts, duoRestockTimesAt), compared with
 * the national figures where that says something. English only: these pages exist for the US tree.
 */
import { RichFaq,SourceList } from "@/components/content/RichFaq";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs,LinkRow,RelatedBlock,type Crumb } from "@/components/seo/Related";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { Stat,StatGrid } from "@/components/ui/Viz";
import { STATE_CODES,STORES,appleName,catalogFor,citiesWithStores,cityPath,hasStatePage,statePath,statesWithStores,storeByNumber,storePath,storeTimeZone,type Store } from "@/lib/apple/catalog";
import { emptyFacts } from "@/lib/content/facts";
import { busiestWindow,duoRestockTimes,duoRestockTimesAt,rangeLabel,restockTimesPath,type RestockTimes } from "@/lib/content/restockTimes";
import { PATTERN_MIN,PATTERN_MIN_DAYS,localStamp } from "@/lib/content/siteFacts";
import type { Faq,Source } from "@/lib/content/types";
import { alertHref,fitTitle,plural } from "@/lib/seo/enrich";
import { nearbyCities,neighborStates } from "@/lib/seo/links";
import { storesStock,storesWithStockNow } from "@/lib/stock/queries";
import { recentByConfig } from "@/lib/stock/recent";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cache } from "react";

const SITE = "https://shelfspring.com";
const APPLE_PICKUP = "https://www.apple.com/shop/shipping-pickup";
const APPLE_NEWSROOM = "https://www.apple.com/newsroom/2026/10/iphone-duo-arrives-at-apple-store-locations-worldwide/";
const MACRUMORS = "https://macrumors.com/2026/10/24/apple-store-pickup-iphone-duo-us/";
const WIKI_MEDIAN = "https://en.wikipedia.org/wiki/Median";

/** A US state with a page of its own, or a two-plus-store city (the only places with a restock-times page). */
export interface RestockPlace {
  kind: "state" | "city";
  state: string;
  stateSlug: string;
  stateCode: string;
  city?: string;
  citySlug?: string;
  /** As sentences say it: "Los Angeles", "New York City", "Texas", "Washington State". */
  name: string;
  /** As the breadcrumb says it: "Los Angeles", "Texas". */
  label: string;
  stores: Store[];
  /** /stores/{state}[/{city}]: the place's live page. */
  storesHref: string;
  /** This page. */
  href: string;
}

/** The two names titles and sentences use where the plain city or state name would mislead (placeCopy.ts says the same). */
const SAID: Record<string, string> = { "city:New York|New York": "New York City", "state:Washington": "Washington State" };

/** The state's page place, or null when the state has no page of its own (one store, or one city: the proxy 308s). */
export function statePlaceOf(slug: string): RestockPlace | null {
  const s = statesWithStores().find((x) => x.slug === slug);
  if (!s || !hasStatePage(s.name)) return null;
  const stores = STORES.filter((x) => x.state === s.name).sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name));
  const name = SAID[`state:${s.name}`] ?? s.name;
  return { kind: "state", state: s.name, stateSlug: s.slug, stateCode: s.code, name, label: s.name, stores, storesHref: statePath(s.name), href: `/iphone-duo-restock-times/${s.slug}` };
}

/** The city's page place, or null for a one-store city (its store's page answers) or an unknown one. */
export function cityPlaceOf(state: string, city: string): RestockPlace | null {
  const c = citiesWithStores().find((x) => x.stateSlug === state && x.slug === city);
  if (!c || c.stores.length < 2) return null;
  const stores = [...c.stores].sort((a, b) => a.name.localeCompare(b.name));
  const name = SAID[`city:${c.name}|${c.state}`] ?? c.name;
  return { kind: "city", state: c.state, stateSlug: c.stateSlug, stateCode: STATE_CODES[c.state] ?? c.state, city: c.name, citySlug: c.slug, name, label: c.name, stores, storesHref: cityPath(c.state, c.name), href: `/iphone-duo-restock-times/${c.stateSlug}/${c.slug}` };
}

/** Every place with a page: the states first, then the cities (sitemap, the national page's link rows). */
export function restockPlaces(): { states: RestockPlace[]; cities: RestockPlace[] } {
  const states = statesWithStores().map((s) => statePlaceOf(s.slug)).filter((p): p is RestockPlace => Boolean(p));
  const cities = citiesWithStores().filter((c) => c.stores.length > 1).map((c) => cityPlaceOf(c.stateSlug, c.slug)).filter((p): p is RestockPlace => Boolean(p));
  return { states, cities };
}

/* ---------------------------------------------------------------- formats */

const n = (x: number) => x.toLocaleString("en-US");
/** Whole-percent shares; under half a percent reads "<1%", never "0%". */
const pct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
const dateLabel = (ymd: string, weekday = true) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric", ...(weekday ? { weekday: "short" as const } : {}) }).format(new Date(`${ymd}T12:00:00Z`));
const longDate = (ymd: string) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${ymd}T12:00:00Z`));
/** "Nov 5, 2026, 10:12 AM PST": the visible "updated" stamp, in the place's zone. */
const updatedStamp = (iso: string, tz: string) => new Intl.DateTimeFormat("en-US", { timeZone: tz, month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(new Date(iso));
const secs = (s: number) => (s < 120 ? `${s} s` : `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")} s`);
/** "about 70 seconds", "about 3 minutes": the sell-out median as a sentence says it. */
const about = (s: number) => (s < 100 ? `about ${Math.round(s / 5) * 5} seconds` : s < 3600 ? `about ${Math.round(s / 60)} minutes` : `about ${(s / 3600).toFixed(1)} hours`);

/** "Pacific time", "Eastern time"; a place across two zones says "store local time". */
const ZONE_WORD: Record<string, string> = {
  "America/New_York": "Eastern", "America/Detroit": "Eastern", "America/Kentucky/Louisville": "Eastern", "America/Indiana/Indianapolis": "Eastern",
  "America/Chicago": "Central", "America/Denver": "Mountain", "America/Boise": "Mountain", "America/Phoenix": "Arizona",
  "America/Los_Angeles": "Pacific", "America/Anchorage": "Alaska", "Pacific/Honolulu": "Hawaii", "America/Puerto_Rico": "Atlantic",
};
function zoneWord(stores: Store[]): { word: string; one: boolean; tz: string } {
  const zones = [...new Set(stores.map((s) => storeTimeZone(s)))];
  const tz = zones[0];
  if (zones.length === 1 && ZONE_WORD[tz]) return { word: `${ZONE_WORD[tz]} time`, one: true, tz };
  return { word: "store local time", one: zones.length === 1, tz };
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

/* ---------------------------------------------------------------- data */

const load = cache(async (place: RestockPlace) => {
  const numbers = place.stores.map((s) => s.storeNumber);
  return Promise.all([duoRestockTimesAt("us", place.stores), duoRestockTimes("us"), storesWithStockNow(numbers, "us"), recentByConfig({ storeNumbers: numbers, country: "us" }), storesStock(numbers)]);
});

/** "58% of the 412 iPhone Duo restocks … since October 29, 2026 landed between 9 and 11 AM Pacific time": the sentence everything else repeats. */
function quotable(place: RestockPlace, t: RestockTimes, zone: string): string {
  const k = place.stores.length;
  const where = `${k} Apple Stores in ${place.name}`;
  if (t.unknown) return `ShelfSpring's restock log for the ${where} could not be read just now; current evidence is unavailable for this request. Reload to request a newer snapshot.`;
  if (t.n === 0) return `The historical record for the ${where}, from ${longDate(t.since)}, contains no confirmed iPhone Duo pickup return yet.`;
  const w = busiestWindow(t.byHour);
  if (t.peakHour != null) {
    return `${pct(w.share)} of the ${n(t.n)} iPhone Duo restocks recorded at the ${where} since ${longDate(t.since)} landed between ${rangeLabel(w.from, w.to)} ${zone}${t.sellout ? `, and a typical one sold out in ${about(t.sellout.medianSec)}` : ""}.`;
  }
  return `The ${where} have restocked the iPhone Duo ${plural(t.n, "time")} since ${longDate(t.since)}, on ${plural(t.days, "day")} — not yet enough to call a usual hour (ShelfSpring waits for ${PATTERN_MIN} restocks over ${PATTERN_MIN_DAYS} different days)${t.sellout ? `; a typical one sold out in ${about(t.sellout.medianSec)}` : ""}.`;
}

/**
 * The question is the title; "Times by Hour" rides along only while the whole tag (with the " · ShelfSpring" suffix,
 * 16 characters) stays within the 65 Bing's URL inspection flags as "title too long". Never truncated: a long place
 * name keeps its full question.
 */
function titleOf(place: RestockPlace): string {
  return fitTitle([`iPhone Duo Pickup Windows in ${place.name}: The Record`, `iPhone Duo Restock Record: ${place.name}`], 70);
}

export async function placeRestockTimesMetadata(place: RestockPlace): Promise<Metadata> {
  const [t] = await load(place);
  const title = titleOf(place);
  const zone = zoneWord(place.stores).word;
  const q = quotable(place, t, zone);
  const description = fitTitle([q, `${q.split(";")[0].split(", and a typical")[0]}.`, `iPhone Duo restock times in ${place.name}: ${n(t.n)} confirmed restocks since ${dateLabel(t.since, false)}, by hour, day and store.`], 158);
  return withCuratedMetadata(place.href, {
    title: { absolute: `${title} · ShelfSpring` },
    description,
    alternates: { canonical: place.href },
    openGraph: { type: "article", siteName: "ShelfSpring", title, description, url: place.href },
  });
}

export async function PlaceRestockTimesPage({ place }: { place: RestockPlace }) {
  const [t, us, , recent, stock] = await load(place);
  const { stores } = place;
  const k = stores.length;
  const city = place.kind === "city";
  const zone = zoneWord(stores);
  const facts = emptyFacts("us");
  const items = catalogFor("duo");
  const cfg = (p: string) => { const i = items.find((x) => x.partNumber === p); return i ? `${i.storage} ${i.color}` : p; };
  const w = busiestWindow(t.byHour);
  const pattern = t.peakHour != null;
  const today = t.today;
  const hours = t.byHour.map((count, hour) => ({ hour, count })).filter((h) => h.count > 0);
  const sell = t.sellout;
  const storeRows = t.topStores.map((r) => ({ ...r, store: storeByNumber(r.storeNumber) })).filter((r) => r.store);
  const quiet = stores.filter((s) => !t.topStores.some((r) => r.storeNumber === s.storeNumber));
  const parts = t.byPart;
  const alert = alertHref({ model: "duo", state: place.stateSlug, city: place.citySlug });
  const stateHref = hasStatePage(place.state) ? restockTimesPath(place.state) : null;
  const share = t.n && us.n ? Math.round((t.n / us.n) * 1000) / 10 : 0;
  const lead = quotable(place, t, zone.word);
  const title = titleOf(place);
  const h1 = `${place.name}: a study of iPhone Duo pickup openings`;

  // Sideways: the state's other cities with a page, the bordering states' pages; a city's nearest other cities' pages.
  const cityPages = citiesWithStores().filter((c) => c.state === place.state && c.stores.length > 1 && c.slug !== place.citySlug).map((c) => ({ href: restockTimesPath(c.state, c.name), label: c.name, meta: String(c.stores.length) }));
  const neighborPages = neighborStates(place.state).filter((s) => hasStatePage(s.name)).map((s) => ({ href: restockTimesPath(s.name), label: s.name, meta: String(s.count) }));
  const mid = { lat: stores.reduce((a, s) => a + s.lat, 0) / k, lng: stores.reduce((a, s) => a + s.lng, 0) / k };
  const nearPages = city ? nearbyCities(mid.lat, mid.lng, { limit: 10, maxMiles: 200 }).filter((c) => c.count > 1 && !(c.state === place.state && c.name === place.city)).slice(0, 6).map((c) => ({ href: restockTimesPath(c.state, c.name), label: `${c.name}, ${c.stateCode}`, meta: `${Math.round(c.distance)} mi` })) : [];

  const faq: Faq[] = fieldGuideQuestions({place:place.name,stores:k,kind:"study",model:"iPhone Duo"});

  const sources: Source[] = [
    { label: "Apple — Shipping & Pickup (how in-store pickup works)", url: APPLE_PICKUP },
    { label: "“iPhone Duo arrives at Apple Store locations worldwide” · Apple’s press release", url: APPLE_NEWSROOM },
    { label: "MacRumors — iPhone Duo Apple Store pickup in the US (October 24, 2026)", url: MACRUMORS },
    { label: "Wikipedia — Median", url: WIKI_MEDIAN },
  ];

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${SITE}${place.href}`, url: `${SITE}${place.href}`, name: title, headline: h1, description: lead, isPartOf: { "@id": `${SITE}/#website` }, about: { "@id": `${SITE}/#organization` }, dateModified: t.at, inLanguage: "en-US" },
      {
        "@type": "Dataset", "@id": `${SITE}${place.href}#dataset`, name: `iPhone Duo restocks at Apple Stores in ${place.name}`,
        description: `Every confirmed iPhone Duo in-store pickup restock at the ${k} Apple Stores in ${place.name} since ${longDate(t.since)}, from the historical inventory record: by local hour, by day, by store and by configuration, with how long each restock stayed listed.`,
        url: `${SITE}${place.href}`, publisher: { "@id": `${SITE}/#organization` }, isAccessibleForFree: true, temporalCoverage: `${t.since}/..`, dateModified: t.at,
        spatialCoverage: { "@type": "Place", name: city ? `${place.city}, ${place.stateCode}, US` : `${place.state}, US`, ...(city ? { containedInPlace: { "@type": "AdministrativeArea", name: place.state } } : {}) },
        variableMeasured: ["Confirmed iPhone Duo restocks per local hour", "Restocks per day and per store", "Restocks per storage size and color", "Seconds a restock stayed listed before it sold out"],
        ...(t.n ? { size: `${n(t.n)} restocks` } : {}),
        inLanguage: "en-US",
      },
    ],
  };

  const crumbs: Crumb[] = [
    { href: "/", label: "ShelfSpring" },
    { href: "/iphone-duo-restock-times", label: "iPhone Duo return record" },
    ...(city && stateHref ? [{ href: stateHref, label: place.state }] : []),
    { label: place.label },
  ];

  return (
    <div className="field-page">
      <JsonLd data={ld} /><Breadcrumbs items={crumbs} />
      <FieldIntro title={h1} description={`A local record is useful only when its sample is visible. This study follows ${k} Apple Stores, compares their recorded configurations and timing, and keeps the national figures separate. Read the observations before deciding which stores to watch.`}
        actions={<><Link href={place.storesHref} className="btn btn-primary btn-sm">Open the local pickup board</Link><Link href={alert} className="btn btn-ghost btn-sm">Watch a local configuration</Link></>}>
        <div className="pane p-5"><p className="field-kicker">Study record</p><p className="mt-4 font-mono text-4xl">{t.unknown ? "—" : n(t.n)}</p><p className="mt-1 text-sm text-ink-3">confirmed store–configuration returns</p><p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-ink-3">From {longDate(t.since)}<br/>Snapshot {updatedStamp(t.at,zone.tz)}<br/>Hours grouped in {zone.word}</p></div>
      </FieldIntro>
      <div className="field-layout">
        <div className="field-main">
          <FieldSection id="stores" title="Start with the differences between stores" caption="01 / Local comparison">
            <p className="text-sm leading-relaxed text-ink-2">{t.unknown ? "The history query is unavailable. We cannot describe this sample until it can be read again." : `${storeRows.length} of the ${k} stores have at least one recorded return in this window. Repeated returns at one location increase its event count, not the number of phones or your chance of buying one.`}</p>
            {!t.unknown&&<Table caption={`Store-level observation record since ${dateLabel(t.since,false)}`} head={["Store","Returns","Days with returns","Last observed return"]} min="30rem">{storeRows.map(r=><tr key={r.storeNumber} className="border-b border-line"><th scope="row" className={rowTh}><Link href={storePath(r.store!)}>{appleName(r.store!)}</Link></th><td className={td}>{n(r.restocks)}</td><td className={td}>{r.days}</td><td className={td}>{localStamp(r.lastAt,r.store!)}</td></tr>)}{quiet.map(s=><tr key={s.storeNumber} className="border-b border-line text-ink-3"><th scope="row" className={rowTh}><Link href={storePath(s)}>{appleName(s)}</Link></th><td className={td}>0</td><td className={td}>0</td><td className={td}>No confirmed return in this window</td></tr>)}</Table>}
          </FieldSection>
          <FieldSection id="configuration" title="Compare configurations without predicting the next return" caption="02 / What returned">
            <p className="text-sm leading-relaxed text-ink-2">Color and storage totals combine observations across these stores. The same configuration can appear repeatedly. Use this table to understand the sample, then choose something you would actually buy.</p>
            <Table caption="Confirmed returns by exact configuration" head={["Configuration","Returns","Share of sample","Last return"]}>{parts.map(p=><tr key={p.partNumber} className="border-b border-line"><th scope="row" className={rowTh}>{cfg(p.partNumber)}</th><td className={td}>{n(p.restocks)}</td><td className={td}>{t.n ? pct(p.restocks/t.n) : "—"}</td><td className={td}>{p.lastAt&&p.lastStore&&storeByNumber(p.lastStore) ? localStamp(p.lastAt,storeByNumber(p.lastStore)!) : "—"}</td></tr>)}</Table>
            <PickupPattern data={recent} storeCount={k} country="us" window="24h" />
          </FieldSection>
          <FieldSection id="time-of-day" title="A distribution of hours, not a delivery schedule" caption="03 / Timing">
            <p className="text-sm leading-relaxed text-ink-2">{t.unknown ? "Hour evidence is unavailable." : pattern ? `The largest observed hour was ${rangeLabel(t.peakHour!,t.peakHour!+1)} in ${zone.word}, with ${n(t.byHour[t.peakHour!])} returns. ${pct(w.share)} fell inside the busiest two-hour window, ${rangeLabel(w.from,w.to)}. Neither figure schedules a future delivery.` : `We have ${n(t.n)} returns across ${t.days} days. The threshold for naming an hour pattern is ${PATTERN_MIN} returns over ${PATTERN_MIN_DAYS} days, so a single burst is not presented as a habit.`}</p>
            {hours.length>0&&<Table caption={`Observed hours in ${zone.word}; hours with no events are omitted`} head={["Local hour","Returns","Share"]} min="20rem">{hours.map(h=><tr key={h.hour} className="border-b border-line"><th scope="row" className={rowTh}>{rangeLabel(h.hour,h.hour+1)}</th><td className={td}>{n(h.count)}</td><td className={td}>{t.n ? pct(h.count/t.n) : "—"}</td></tr>)}</Table>}
            {!us.unknown&&us.n>0&&<p className="mt-5 border-t border-line pt-4 text-sm text-ink-3">For comparison, the national sample contains {n(us.n)} returns. This local sample represents {share}% of that total. <Link href="/iphone-duo-restock-times" className="underline underline-offset-4">Read the nationwide study</Link>.</p>}
          </FieldSection>
          <FieldSection id="day-by-day" title="Trace the sample one day at a time" caption="04 / The daily ledger">
            <p className="text-sm leading-relaxed text-ink-2">Dates follow each store&apos;s local calendar. A zero means no confirmed return was recorded that day; it is not proof that a store received no phones. Today is an incomplete day.</p>
            <Table caption={`Daily observations from ${longDate(t.since)}`} head={["Date","Returns","Stores","Largest observed hour"]} min="26rem">{[...t.daily].reverse().map(d=><tr key={d.date} className="border-b border-line"><th scope="row" className={rowTh}>{dateLabel(d.date)}{today?.date===d.date ? " · so far" : ""}</th><td className={td}>{n(d.restocks)}</td><td className={td}>{d.stores}</td><td className={td}>{d.peakHour==null ? "—" : rangeLabel(d.peakHour,d.peakHour+1)}</td></tr>)}</Table>
          </FieldSection>
          <FieldSection id="how-long" title="How long did completed pickup windows remain listed?" caption="05 / Listing duration">
            <p className="text-sm leading-relaxed text-ink-2">{sell ? `The timing sample includes ${n(sell.n)} return-to-sellout intervals. Its median is ${secs(sell.medianSec)}: half of those measured intervals were no longer than that. Listings still open are excluded. The spacing between observations makes these upper bounds, not exact reservation deadlines.` : "Fewer than ten completed intervals are available, so this study does not publish a local median. Missing timing data is not a zero-second window."}</p>
            {sell&&<StatGrid cols={3} className="mt-5"><Stat value={sell.medianSec} unit="s" label="median observed interval"/><Stat value={pct(sell.within2min)} label="closed within 2 minutes"/><Stat value={pct(sell.within20min)} label="closed within 20 minutes"/></StatGrid>}
          </FieldSection>
        </div>
        <aside className="field-aside space-y-6"><FieldMethod /><FieldCoverage stores={stores} stock={stock}/><nav className="field-callout" aria-label="In this study">{[{id:"stores",label:"Compare the stores"},{id:"configuration",label:"Explore configurations"},{id:"time-of-day",label:"Inspect the hours"},{id:"day-by-day",label:"Read the daily ledger"},{id:"how-long",label:"Understand duration"}].map(s=><a key={s.id} href={`#${s.id}`} className="field-row text-sm">{s.label}<span aria-hidden="true">↓</span></a>)}</nav><SourceList sources={sources} facts={facts} where={`the ${k} Apple Stores in ${place.name}`} since={longDate(t.since)}/></aside>
      </div>

      <RelatedBlock title="Restock times elsewhere">
        {city && stateHref && <LinkRow curated title={`All of ${place.state}`} links={[{ href: stateHref, label: `When does the iPhone Duo restock in ${SAID[`state:${place.state}`] ?? place.state}?` }]} />}
        {cityPages.length > 0 && <LinkRow curated title={city ? `Other cities in ${place.state}` : `By city in ${place.name}`} links={cityPages} />}
        {nearPages.length > 0 && <LinkRow curated title="Nearby cities" links={nearPages} />}
        {neighborPages.length > 0 && <LinkRow curated title="Bordering states" links={neighborPages} />}
        <LinkRow curated title="Nationwide record" links={[{ href: "/iphone-duo-restock-times", label: "The US iPhone Duo return study, hour by hour", meta: t.n && us.n ? `${place.name} = ${share}% of US restocks` : undefined }]} />
        <LinkRow title={`${place.name}, live`} links={[
          { href: place.storesHref, label: `Apple Stores in ${place.name}` },
          { href: `/restocks?model=duo&state=${place.stateSlug}`, label: `${place.state} restock log` },
          { href: `/map?state=${place.stateCode}&model=duo`, label: "On the map" },
          { href: "/stock/iphone-duo", label: "iPhone Duo stock, all US stores" },
        ]} />
        <LinkRow curated title="More iPhone Duo questions" links={[
          { href: "/iphone-duo-sell-out-times", label: "How long a return stays listed" },
          { href: "/iphone-duo-stock-alerts", label: "How matching alerts work" },
          { href: "/how-to-get-an-iphone-duo", label: "How to get one when it's sold out" },
          { href: "/which-iphone-duo-restocks-most", label: "Which configuration restocks most?" },
          { href: "/iphone-duo-back-in-stock", label: "Is it back in stock right now?" },
          { href: "/where-to-buy-iphone-duo", label: "Where to buy one today" },
        ]} />
      </RelatedBlock>

      <div className="mt-10"><RichFaq items={faq} facts={facts} title={`Field questions · iPhone Duo returns in ${place.name}`} /></div>
    </div>
  );
}
