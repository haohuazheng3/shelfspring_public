import { FieldCoverage,FieldIntro,FieldMethod,FieldSection,fieldGuideCopy,fieldGuideQuestions } from "@/components/seo/FieldGuide";
import { PickupPattern } from "@/components/seo/PickupPattern";
import { withCuratedMetadata } from "@/lib/seo/curation";
/**
 * The page of a US state or another country's region (province, prefecture, area…): /stores/{state} or
 * /{cc}/stores/{region}. Indexed only where the region has two or more stores in two or more cities and is
 * not the whole country (placeTarget); the proxy 308s every other region URL to the page that answers it.
 */
import { AlertPanelFor } from "@/components/alerts/AlertPanelServer";
import { SourceList } from "@/components/content/RichFaq";
import { DailyBars } from "@/components/restocks/DailyBars";
import { Last24Hours } from "@/components/restocks/Last24Hours";
import { RestockClock } from "@/components/restocks/RestockClock";
import { RestockFeed } from "@/components/restocks/RestockFeed";
import { RestocksByConfig } from "@/components/restocks/RestocksByConfig";
import { SellOutTimes } from "@/components/restocks/SellOutTimes";
import { BrowseModels,BrowseStates } from "@/components/seo/Browse";
import { BrowseCountryModels,BrowseCountryRegions } from "@/components/seo/CountryBrowse";
import { Faq } from "@/components/seo/Faq";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs,LinkRow,RelatedBlock,type Crumb } from "@/components/seo/Related";
import { ModelStoreMatrix } from "@/components/stores/ModelStoreMatrix";
import { NearbyStores } from "@/components/stores/NearbyStores";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { pickupHelp } from "@/content/country-tax";
import { SALES_TAX_SOURCE } from "@/content/sales-tax";
import { DEFAULT_MODEL,MODELS,citiesWithStores,cityPath,distanceMiles,hasStatePage,mapPath,placeTarget,restocksPath,statesWithStores,storePath,storeTimeZone,storesIndexPath,storesOf,type ModelKey } from "@/lib/apple/catalog";
import { prefixOf,type Country } from "@/lib/apple/countries";
import { emptyFacts } from "@/lib/content/facts";
import { restockTimesPath } from "@/lib/content/restockTimes";
import { englishLocale,type Locale } from "@/lib/i18n/locales";
import { namesFor } from "@/lib/i18n/names";
import { pageLocale,t } from "@/lib/i18n/server";
import { type IntlPlaceInput } from "@/lib/seo/countryCopy";
import { regionRefs } from "@/lib/seo/countryLinks";
import { alertHref,centroid,itemListJsonLd,nearestOutsideState } from "@/lib/seo/enrich";
import { neighborStates } from "@/lib/seo/links";
import { taxFaq,type PlaceCopyInput } from "@/lib/seo/placeCopy";
import { placeStats,restockFeed,restockReportStats,restockStats,storesStatusFull,storesStock } from "@/lib/stock/queries";
import { recentByConfig } from "@/lib/stock/recent";
import { sellouts } from "@/lib/stock/sellouts";
import type { Metadata } from "next";
import { notFound,permanentRedirect } from "next/navigation";
import { cache } from "react";
import { alternatesIn } from "./shared";

/** States with this many stores or fewer render every store in full (a complete landing page even with zero events). */
const THIN = 2;

export function regionStaticParams(c: Country) {
  return statesWithStores(c.cc).filter((s) => hasStatePage(s.name, c.cc)).map((s) => ({ state: s.slug }));
}

/** One load per request, shared by the page and its metadata: ≤ 7 queries (4 live + 3 cached statistics). */
const load = cache(async (cc: Country["cc"], slug: string) => {
  const s = statesWithStores(cc).find((x) => x.slug === slug);
  if (!s) return null;
  const stores = storesOf(cc).filter((x) => x.state === s.name).sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name));
  const cities = citiesWithStores(cc).filter((c) => c.state === s.name);
  const numbers = stores.map((x) => x.storeNumber);
  const tz = storeTimeZone(stores[0]);
  const thin = stores.length <= THIN;
  const outside = nearestOutsideState({ ...centroid(stores), state: s.name, country: cc }, 6);
  const extra = thin ? [...new Set([...outside, ...stores.flatMap((x) => nearestOutsideState(x, 4))].map((x) => x.storeNumber))] : outside.map((x) => x.storeNumber);
  const [stock, feed, stats, pstats, full, duoStats, maxStats, reports, sell, recent] = await Promise.all([
    storesStock([...numbers, ...extra]),
    restockFeed({ state: s.name, limit: 12, country: cc }),
    restockStats(numbers, tz, 30),
    placeStats({ storeNumbers: numbers, tz }),
    thin ? storesStatusFull(numbers) : Promise.resolve(new Map()),
    placeStats({ storeNumbers: numbers, model: "duo", tz }),
    placeStats({ storeNumbers: numbers, model: "18-pro-max", tz }),
    restockReportStats(numbers, tz, 30),
    sellouts({ storeNumbers: numbers, country: cc }),
    recentByConfig({ storeNumbers: numbers, country: cc }),
  ]);
  const stockNow = Object.fromEntries(MODELS.map((m) => [m.key, stores.filter((x) => (stock.get(x.storeNumber)?.perModel[m.key].available ?? 0) > 0).length])) as Record<ModelKey, number>;
  const duoStores = stores.filter((x) => (stock.get(x.storeNumber)?.perModel[DEFAULT_MODEL].available ?? 0) > 0);
  const copy: PlaceCopyInput = { kind: "state", name: s.name, state: s.name, stateSlug: s.slug, stores, cities: cities.length, stockNow, stock, duo: duoStats, max: maxStats };
  const intl: IntlPlaceInput | null = cc === "us" ? null : { cc, kind: "state", name: s.name, region: s.name, regionSlug: s.slug, stores, cities: cities.length, stockNow, stock, duo: duoStats, max: maxStats };
  return { s, stores, cities, numbers, tz, thin, outside, stock, feed, stats, pstats, full, stockNow, duoStores, copy, intl, reports, sell, recent };
});

export async function regionMetadata(c: Country, p: { state: string }, loc: Locale = englishLocale(c.cc)): Promise<Metadata> {
  const d = await load(c.cc, p.state);
  if (!d) return {};
  const { s } = d;
  const F = fieldGuideCopy(loc.lang);
  const N = namesFor(loc.lang, c.cc);
  const title = loc.lang === "en" ? `${s.name} iPhone pickup: a regional field guide` : `${N.region(s.name)} · ${F.next}`;
  const description = loc.lang === "en" ? `Compare ${d.stores.length} Apple Stores in ${s.name} by city and configuration. Explore the observation record and build a reachable pickup shortlist.`.slice(0,160) : `${N.region(s.name)} · ${F.lead}`.slice(0,160);
  const en = `${prefixOf(c.cc)}/stores/${s.slug}`;
  const alt = alternatesIn(en, loc);
  return withCuratedMetadata(alt.canonical, { title, description, alternates: c.cc === "us" ? { canonical: en } : alt, openGraph: { type: "website", siteName: "ShelfSpring", title, description, url: alt.canonical } });
}

export async function RegionPage({ country: c, params: p }: { country: Country; params: { state: string } }) {
  const cc = c.cc;
  const us = cc === "us";
  const d = await load(cc, p.state);
  if (!d) notFound();
  if (!us) {
    // Streaming pages cannot send a real 308; the proxy does. This is the backstop.
    const t = placeTarget(cc, p.state);
    if (t && !t.indexable) permanentRedirect(t.path);
  }
  const { s, stores, cities } = d;
  const lang = pageLocale().lang;
  const P = t().place;
  const G = t().pages.common;
  const R = t().pages.region;
  const N = namesFor(lang, cc);
  const name = N.region(s.name);
  const neighbors = us
    ? neighborStates(s.name)
    : regionRefs(cc).filter((r) => r.name !== s.name).map((r) => ({ ...r, d: distanceMiles(r.lat, r.lng, centroid(stores).lat, centroid(stores).lng) })).sort((a, b) => a.d - b.d).slice(0, 8);
  const alert = alertHref({ model: DEFAULT_MODEL, state: s.slug, country: cc });
  // Five questions: the "how long does stock last" answer now lives in the iPhone Duo section, the tax question takes its place.
  const tq = us ? taxFaq(d.copy) : P.taxFaq(cc, name, cc === "ca" ? s.name : undefined);
  const questions = fieldGuideQuestions({place:name,stores:stores.length,kind:"region",lang});
  if (tq) questions.splice(2, 0, tq);
  const facts = lang === "en" ? emptyFacts(cc) : { ...emptyFacts(cc), lang };
  const index = placeTarget(cc);
  const crumbs: Crumb[] = us
    ? [{ href: "/stores", label: "Apple Stores" }, { label: s.name }]
    : [{ href: prefixOf(cc), label: N.countryShort() }, ...(index?.indexable ? [{ href: storesIndexPath(cc), label: G.appleStores }] : []), { label: name }];
  const mapHref = `${mapPath(cc)}?state=${us ? s.code : encodeURIComponent(s.code)}&model=${DEFAULT_MODEL}`;
  const restocksHere = `${restocksPath(cc)}?model=all&state=${s.slug}`;
  const F = fieldGuideCopy(lang);
  return (
    <div className="field-page">
      <JsonLd data={itemListJsonLd(G.itemList(us ? s.name : P.placeLabel(cc,name)),stores,lang)} />
      <Breadcrumbs items={crumbs} />
      <FieldIntro title={lang === "en" ? `${name}: plan an iPhone pickup route` : `${name} · ${F.next}`} description={lang === "en" ? `A useful search starts with a travel boundary. This guide connects ${cities.length} ${cities.length === 1 ? "city" : "cities"} and ${stores.length} Apple Stores in ${name}, so you can compare configurations without mistaking a regional total for a phone waiting at your nearest store.` : F.lead}
        actions={<><Link href={mapHref} className="btn btn-ghost btn-sm">{G.showOnMap}</Link><Link href={alert} className="btn btn-primary btn-sm">{G.alertIn(name)}</Link></>}>
        <FieldCoverage stores={stores} stock={d.stock} />
      </FieldIntro>
      <div className="field-layout">
        <div className="field-main">
          <FieldSection id="compare" title={F.compare} caption={R.counts(stores.length,cities.length)}>
            <nav className="field-index mb-6">{cities.map(x => <Link key={x.slug} href={cityPath(x.state,x.name,cc)} className="field-row"><span>{N.city(x.name)}</span><span className="font-mono text-sm">{x.stores.length} ↗</span></Link>)}</nav>
            {cities.map(x => <article key={x.slug} className="mb-7"><div className="mb-3 flex items-baseline justify-between gap-3"><h3 className="text-xl font-semibold">{N.city(x.name)}</h3><Link href={cityPath(x.state,x.name,cc)} className="text-sm underline underline-offset-4">{x.stores.length > 1 || us ? G.cityPage : G.storePage}</Link></div><div className="pane p-4 sm:p-5"><ModelStoreMatrix stores={[...x.stores].sort((a,b) => a.name.localeCompare(b.name))} stock={d.stock} showCity={false} /></div></article>)}
          </FieldSection>
          <FieldSection id="recent" title={F.history} caption="24h"><Last24Hours data={d.recent} label={G.inPlace(name)} stores={stores} country={cc} stock={d.stock} lastBefore={d.copy.duo.lastRestock} alert={alert} /><PickupPattern data={d.recent} storeCount={stores.length} country={cc} window="24h" /></FieldSection>
          <FieldSection id="timing" title={G.whenRestock(name)} caption={`${d.pstats.days}d`}><RestockClock stats={d.stats} label={G.inPlace(name)} reports={d.reports} />{us && <p className="mt-4"><Link href={restockTimesPath(s.name)} className="text-sm underline underline-offset-4">Read the {s.name} restock study →</Link></p>}</FieldSection>
          <FieldSection title={G.howFast(name)}><SellOutTimes data={d.sell} label={G.inPlace(name)} showStore /></FieldSection>
          <FieldSection title={G.lastDays(d.pstats.days)}><DailyBars stats={d.pstats} label={G.inPlace(name)} /></FieldSection>
          <FieldSection title={G.restocksBy}><RestocksByConfig stats={d.pstats} label={G.inPlace(name)} country={us ? undefined : cc} /></FieldSection>
          <FieldSection title={G.latestIn(name)} action={<Link href={restocksHere} className="text-sm underline underline-offset-4">{G.fullLog}</Link>}><RestockFeed rows={d.feed} showModel emptyText={G.noneIn(name)} /></FieldSection>
        </div>
        <aside className="field-aside space-y-6">
          <FieldMethod />
          <AlertPanelFor href={alert} summary={G.panelPick(name)} country={cc} />
          <NearbyStores title={F.alternatives} stores={d.outside} stock={d.stock} hint={R.nearbyHint(name)} />
          <SourceList sources={[...stores.slice(0,3).filter(x => x.url).map(x => ({label:G.appleStorePage(N.store(x)),url:x.url!})), us ? pickupHelp(cc) : P.sources(cc as Exclude<typeof cc,"us">).pickupHelp, us ? SALES_TAX_SOURCE : P.sources(cc as Exclude<typeof cc,"us">).tax]} facts={facts} />
        </aside>
      </div>
      <div className="field-section"><Faq items={questions} title={G.faqTitle(name)} /></div>

      <RelatedBlock title={R.beyond(name)}>
        <LinkRow title={R.everyStore(name)} links={stores.map((x) => ({ href: storePath(x), label: G.storeAndCity(N.store(x), N.city(x.city)) }))} />
        {neighbors.length > 0 && <LinkRow curated title={us ? G.neighboringStates : R.nearestRegions(cc)} links={neighbors.map((n) => ({ href: n.href, label: us ? n.name : N.region(n.name), meta: String(n.count) }))} />}
        {us ? <BrowseModels /> : <BrowseCountryModels country={c} />}
        <LinkRow title={G.restockLogs} links={[{ href: restocksHere, label: G.regionRestocks(name) }, { href: restocksPath(cc), label: us ? G.allUsRestocks : G.allRestocksIn(cc) }, { href: mapHref, label: G.onTheMap(name) }]} />
        {us ? <BrowseStates current={s.name} /> : <BrowseCountryRegions country={c} current={s.name} />}
      </RelatedBlock>
    </div>
  );
}
