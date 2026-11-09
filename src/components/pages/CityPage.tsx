import { FieldCoverage,FieldIntro,FieldMethod,FieldSection,FieldStoreIndex,fieldGuideCopy,fieldGuideQuestions } from "@/components/seo/FieldGuide";
import { DuoLedger } from "@/components/stock/DuoLedger";
import { alertsDelivered, duoLedgerFrom } from "@/lib/content/duoLedger";
import { PickupPattern } from "@/components/seo/PickupPattern";
import { withCuratedMetadata } from "@/lib/seo/curation";
/**
 * The page of a city with two or more Apple Stores, in any country: /stores/{state}/{city} or
 * /{cc}/stores/{region}/{city}. A one-store city is its store's page (the proxy 308s it there); a city that
 * holds every store of its country is the country's store index.
 */
import { AlertPanelFor } from "@/components/alerts/AlertPanelServer";
import { SourceList } from "@/components/content/RichFaq";
import { DailyBars } from "@/components/restocks/DailyBars";
import { Last24Hours } from "@/components/restocks/Last24Hours";
import { RestockClock } from "@/components/restocks/RestockClock";
import { RestockFeed } from "@/components/restocks/RestockFeed";
import { RestocksByConfig } from "@/components/restocks/RestocksByConfig";
import { SellOutTimes } from "@/components/restocks/SellOutTimes";
import { BrowseModels } from "@/components/seo/Browse";
import { BrowseCountryModels,BrowseCountryRegions } from "@/components/seo/CountryBrowse";
import { Faq } from "@/components/seo/Faq";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs,LinkRow,RelatedBlock,type Crumb } from "@/components/seo/Related";
import { ModelStoreMatrix } from "@/components/stores/ModelStoreMatrix";
import { NearbyStores } from "@/components/stores/NearbyStores";
import { StoreInfo } from "@/components/stores/StoreInfo";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { pickupHelp } from "@/content/country-tax";
import { SALES_TAX_SOURCE } from "@/content/sales-tax";
import { DEFAULT_MODEL, MODELS, STATE_CODES, citiesWithStores, cityBySlug, cityPath, hasStatePage, mapPath, placeTarget, restocksPath, statePath, stateSlug, storePath, storeTimeZone, storesIndexPath, storesOf, type ModelKey, catalogFor, partNumbersFor } from "@/lib/apple/catalog";
import { prefixOf,type Country } from "@/lib/apple/countries";
import { emptyFacts } from "@/lib/content/facts";
import { restockTimesPath, duoRestockTimesAt } from "@/lib/content/restockTimes";
import { englishLocale,type Locale } from "@/lib/i18n/locales";
import { namesFor } from "@/lib/i18n/names";
import { pageLocale,t } from "@/lib/i18n/server";
import { type IntlPlaceInput } from "@/lib/seo/countryCopy";
import { cityRefs as intlCityRefs,nearbyCitiesIn } from "@/lib/seo/countryLinks";
import { alertHref, centroid, distText, itemListJsonLd, nearestInState, nearestOutsideState, nearestTo, peakOf } from "@/lib/seo/enrich";
import { cityLabel,cityRef,nearbyCities,neighborStates } from "@/lib/seo/links";
import { taxFaq,type PlaceCopyInput } from "@/lib/seo/placeCopy";
import { placeStats,restockFeed,restockReportStats,restockStats,storesStatusFull,storesStock } from "@/lib/stock/queries";
import { recentByConfig } from "@/lib/stock/recent";
import { sellouts } from "@/lib/stock/sellouts";
import type { Metadata } from "next";
import { notFound,permanentRedirect } from "next/navigation";
import { cache } from "react";
import { alternatesIn } from "./shared";

export function cityStaticParams(c: Country) {
  return citiesWithStores(c.cc).filter((x) => x.stores.length > 1).map((x) => ({ state: x.stateSlug, city: x.slug }));
}

/** One load per request, shared by the page and its metadata: ≤ 7 queries (4 live + 3 cached statistics). */
const load = cache(async (cc: Country["cc"], state: string, city: string) => {
  const c = cityBySlug(state, city, cc);
  if (!c) return null;
  const stores = [...c.stores].sort((a, b) => a.name.localeCompare(b.name));
  const numbers = stores.map((s) => s.storeNumber);
  const tz = storeTimeZone(stores[0]);
  const thin = stores.length === 1;
  const mid = centroid(stores);
  const near = nearestTo(mid, new Set(numbers), 6, cc);
  const outside = nearestOutsideState({ ...mid, state: c.state, country: cc }, 3);
  // StoreBlock lists the three nearest in-state stores too — load their stock as well, or they render as "no Duo".
  const extra = [...new Set([...near, ...outside, ...(thin ? [...nearestOutsideState(stores[0], 4), ...nearestInState(stores[0], 3)] : [])].map((x) => x.storeNumber))];
  const [stock, feed, stats, pstats, full, duoStats, maxStats, reports, sell, recent, duoClock, duoReports, duoSell, times, alerts] = await Promise.all([
    storesStock([...numbers, ...extra]),
    restockFeed({ state: c.state, city: c.name, limit: 12, country: cc }),
    restockStats(numbers, tz, 30),
    placeStats({ storeNumbers: numbers, tz }),
    thin ? storesStatusFull(numbers) : Promise.resolve(new Map()),
    placeStats({ storeNumbers: numbers, model: "duo", tz }),
    placeStats({ storeNumbers: numbers, model: "18-pro-max", tz }),
    restockReportStats(numbers, tz, 30),
    sellouts({ storeNumbers: numbers, country: cc }),
    recentByConfig({ storeNumbers: numbers, country: cc }),
    // iPhone Duo only for the hour chart, the daily bars and the opening ledger (2026-11-08).
    restockStats(numbers, tz, 30, "duo"),
    restockReportStats(numbers, tz, 30, "duo"),
    sellouts({ storeNumbers: numbers, parts: partNumbersFor("duo", [], [], cc), country: cc }),
    duoRestockTimesAt(cc, stores),
    alertsDelivered(numbers),
  ]);
  const ledger = duoLedgerFrom({ stores, stock, times, sell: duoSell, alerts, configsTotal: catalogFor("duo", cc).length });
  const stockNow = Object.fromEntries(MODELS.map((m) => [m.key, stores.filter((x) => (stock.get(x.storeNumber)?.perModel[m.key].available ?? 0) > 0).length])) as Record<ModelKey, number>;
  const duoStores = stores.filter((x) => (stock.get(x.storeNumber)?.perModel[DEFAULT_MODEL].available ?? 0) > 0);
  const copy: PlaceCopyInput = { kind: "city", name: c.name, state: c.state, stateSlug: c.stateSlug, citySlug: c.slug, stores, stockNow, stock, duo: duoStats, max: maxStats };
  const intl: IntlPlaceInput | null = cc === "us" ? null : { cc, kind: "city", name: c.name, region: c.state, regionSlug: c.stateSlug, citySlug: c.slug, stores, stockNow, stock, duo: duoStats, max: maxStats };
  return { c, stores, numbers, tz, thin, near, outside, stock, feed, stats, pstats, full, stockNow, duoStores, copy, intl, reports, sell, recent, duoClock, duoReports, ledger };
});

export async function cityMetadata(country: Country, p: { state: string; city: string }, loc: Locale = englishLocale(country.cc)): Promise<Metadata> {
  const d = await load(country.cc, p.state, p.city);
  if (!d) return {};
  const { c } = d;
  const F = fieldGuideCopy(loc.lang);
  const N = namesFor(loc.lang, country.cc);
  const title = loc.lang === "en" ? `${c.name} iPhone pickup: compare local stores` : `${N.city(c.name)} · ${F.next}`;
  const description = loc.lang === "en" ? `Build a pickup shortlist across ${d.stores.length} Apple Stores in ${c.name}. Compare configurations, recorded returns and nearby alternatives before ordering.`.slice(0,160) : `${N.city(c.name)} · ${F.lead}`.slice(0,160);
  const en = cityPath(c.state, c.name, country.cc);
  const alt = alternatesIn(en, loc);
  return withCuratedMetadata(alt.canonical, { title, description, alternates: country.cc === "us" ? { canonical: en } : alt, openGraph: { type: "website", siteName: "ShelfSpring", title, description, url: alt.canonical } });
}

/** City page; also the landing spot for the old /stores/{state}/{store-slug} URLs, which redirect. */
export async function CityPage({ country, params: p }: { country: Country; params: { state: string; city: string } }) {
  const cc = country.cc;
  const us = cc === "us";
  const { state, city } = p;
  const d = await load(cc, state, city);
  if (!d) {
    const legacy = storesOf(cc).find((x) => x.slug === city && stateSlug(x.state) === state);
    if (legacy) permanentRedirect(storePath(legacy));
    notFound();
  }
  if (!us) {
    // Streaming pages cannot send a real 308; the proxy does. This is the backstop.
    const t = placeTarget(cc, state, city);
    if (t && !t.indexable) permanentRedirect(t.path);
  }
  const { c, stores } = d;
  const lang = pageLocale().lang;
  const P = t().place;
  const G = t().pages.common;
  const CT = t().pages.city;
  const N = namesFor(lang, cc);
  const cname = N.city(c.name);
  const rname = N.region(c.state);
  const code = us ? (STATE_CODES[c.state] ?? c.state) : c.state;
  const siblings = citiesWithStores(cc).filter((x) => x.state === c.state && x.slug !== c.slug);
  const me = us ? cityRef(c.state, c.name) : undefined;
  const nearCities = us
    ? (me ? nearbyCities(me.lat, me.lng, { exclude: me, limit: 8 }) : []).map((x) => ({ href: x.href, label: cityLabel(x), meta: `${Math.round(x.distance)} mi` }))
    : nearbyCitiesIn(cc, centroid(stores).lat, centroid(stores).lng, { excludeHref: intlCityRefs(cc).find((x) => x.state === c.state && x.name === c.name)?.href, limit: 8 }).map((x) => ({ href: x.href, label: N.city(x.name), meta: distText(x.distance, cc, lang) }));
  const neighbors = us ? neighborStates(c.state) : [];
  const place = us ? `${c.name}, ${code}` : P.placeLabel(cc, cname);
  const alert = alertHref({ model: DEFAULT_MODEL, state: c.stateSlug, city: c.slug, country: cc });
  const tq = us ? taxFaq(d.copy) : P.taxFaq(cc, cname, cc === "ca" ? c.state : undefined);
  const questions = fieldGuideQuestions({place:cname,stores:stores.length,kind:"city",lang});
  if (tq) questions.splice(2, 0, tq);
  const facts = lang === "en" ? emptyFacts(cc, d.tz) : { ...emptyFacts(cc, d.tz), lang };
  const W = t().modules.duoLedger;
  const peakAll = peakOf(d.stats, lang);
  const index = placeTarget(cc);
  const crumbs: Crumb[] = us
    ? [{ href: "/stores", label: G.appleStores }, ...(hasStatePage(c.state) ? [{ href: statePath(c.state), label: c.state }] : []), { label: c.name }]
    : [{ href: prefixOf(cc), label: N.countryShort() }, ...(index?.indexable ? [{ href: storesIndexPath(cc), label: G.appleStores }] : []), ...(hasStatePage(c.state, cc) ? [{ href: statePath(c.state, cc), label: rname }] : []), { label: cname }];
  const restocksRegion = `${restocksPath(cc)}?model=all&state=${c.stateSlug}`;
  const F = fieldGuideCopy(lang);
  const outsideOnly = d.outside.filter((x) => !d.near.some((n) => n.storeNumber === x.storeNumber));
  return (
    <div className="field-page">
      <JsonLd data={itemListJsonLd(G.itemList(place), stores, lang)} />
      <Breadcrumbs items={crumbs} />
      <FieldIntro title={lang === "en" ? `${cname}: an iPhone pickup shortlist` : `${cname} · ${F.next}`} description={lang === "en" ? `One city can offer several different pickup choices. Use this ${stores.length}-store comparison to decide where to check first, then open the exact storage and color at the store you can reach. Keep a second location in reserve if the first one changes.` : F.lead}
        actions={<><Link href={`${mapPath(cc)}?stores=${d.numbers.join(",")}&model=${DEFAULT_MODEL}`} className="btn btn-ghost btn-sm">{G.showOnMap}</Link><Link href={alert} className="btn btn-primary btn-sm">{G.alertIn(cname)}</Link></>}>
        <FieldCoverage stores={stores} stock={d.stock} />
      </FieldIntro>
      {/* The observation ledger first (lib/content/duoLedger.ts). */}
      <div className="pt-8"><DuoLedger d={d.ledger} place={cname} stores={stores} country={cc} hourHref={restockTimesPath(c.state, c.name, cc)} watchHref={alert} /></div>
      <div className="field-layout">
        <div className="field-main">
          <FieldSection id="compare" title={F.compare} caption={CT.counts(stores.length)}>
            <div className="pane overflow-hidden p-4 sm:p-6"><ModelStoreMatrix stores={stores} stock={d.stock} showCity={false} /></div>
            <div className="mt-5"><FieldStoreIndex stores={stores} /></div>
          </FieldSection>
          {/* ShelfSpring's order: today's shelf, which configurations came back, the last day, then timing, duration and the raw log; addresses close the column. */}
          <FieldSection id="returned" title={G.restocksBy} caption={`${d.pstats.days}d`}><RestocksByConfig stats={d.pstats} label={G.inPlace(cname)} country={us ? undefined : cc} /></FieldSection>
          <FieldSection id="recent" title={F.history} caption="24h">
            <PickupPattern data={d.recent} storeCount={stores.length} country={cc} window="24h" />
            <Last24Hours data={d.recent} label={G.inPlace(cname)} stores={stores} country={cc} stock={d.stock} lastBefore={d.copy.duo.lastRestock} alert={alert} compact />
          </FieldSection>
          <FieldSection id="timing" title={G.duoHours(cname)} caption={`${d.pstats.days}d`}>
            {/^(\/[a-z]{2})?\/iphone-duo-restock-times\//.test(restockTimesPath(c.state, c.name, cc)) && <p className="mb-4"><Link href={restockTimesPath(c.state, c.name, cc)} className="text-sm underline underline-offset-4">{lang === "en" ? `${cname} return study, hour by hour` : G.fullLog} →</Link></p>}
            <RestockClock stats={d.duoClock} label={G.inPlace(cname)} reports={d.duoReports} />
            <p className="mt-3 text-xs text-ink-3">{W.allModels({ n: d.pstats.month, days: d.pstats.days, peak: peakAll ? peakAll.hour : null })}</p>
          </FieldSection>
          <FieldSection id="calendar" title={G.lastDays(d.pstats.days)}><DailyBars stats={d.copy.duo} label={G.inPlace(cname)} /></FieldSection>
          <FieldSection id="duration" title={G.howFast(cname)}><SellOutTimes data={d.sell} label={G.inPlace(cname)} showStore /></FieldSection>
          <FieldSection id="log" title={G.latestIn(cname)} action={<Link href={restocksRegion} className="text-sm underline underline-offset-4">{G.fullLog}</Link>}><RestockFeed rows={d.feed} showModel emptyText={G.noneIn(cname)} /></FieldSection>
          <FieldSection id="locations" title={CT.details}>
            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">{stores.map(s => <article key={s.storeNumber} className="border-t border-line pt-4"><h3 className="text-lg font-semibold"><Link href={storePath(s)}>{N.apple(s)}</Link></h3><div className="mt-3"><StoreInfo store={s} compact /></div></article>)}</div>
          </FieldSection>
        </div>
        <aside className="field-aside space-y-6">
          <AlertPanelFor href={alert} summary={G.panelPick(cname)} country={cc} />
          <NearbyStores title={F.alternatives} stores={d.near} stock={d.stock} />
          {outsideOnly.length > 0 && <NearbyStores title={us ? G.acrossStateLine : CT.outsideRegion(rname)} stores={outsideOnly} stock={d.stock} />}
          <FieldMethod />
          <SourceList sources={[...stores.slice(0,3).filter(x => x.url).map(x => ({label:G.appleStorePage(N.store(x)),url:x.url!})), us ? pickupHelp(cc) : P.sources(cc as Exclude<typeof cc,"us">).pickupHelp, us ? SALES_TAX_SOURCE : P.sources(cc as Exclude<typeof cc,"us">).tax]} facts={facts} />
        </aside>
      </div>
      <div className="field-section"><Faq items={questions} title={G.faqTitle(cname)} /></div>

      <RelatedBlock title={CT.around(cname)}>
        <LinkRow title={G.restockLogs} links={[{ href: restocksRegion, label: G.regionRestocks(rname) }, { href: `${mapPath(cc)}?state=${us ? code : encodeURIComponent(c.state)}&model=${DEFAULT_MODEL}`, label: G.onTheMap(rname) }, { href: restocksPath(cc), label: us ? G.allUsRestocks : G.allRestocksIn(cc) }]} />
        {siblings.length > 0 && <LinkRow curated title={CT.otherCities(rname)} links={siblings.map((x) => ({ href: cityPath(x.state, x.name, cc), label: N.city(x.name), meta: String(x.stores.length) }))} more={{ href: statePath(c.state, cc), label: G.allOf(rname) }} />}
        {nearCities.length > 0 && <LinkRow curated title={G.nearbyCities} links={nearCities} />}
        {neighbors.length > 0 && <LinkRow curated title={G.neighboringStates} links={neighbors.map((n) => ({ href: n.href, label: n.name, meta: String(n.count) }))} />}
        {us ? <BrowseModels /> : <BrowseCountryModels country={country} />}
        {!us && <BrowseCountryRegions country={country} current={c.state} />}
      </RelatedBlock>
    </div>
  );
}
