import { fieldGuideCopy,fieldGuideQuestions,FieldIntro,FieldMethod,FieldSection } from "@/components/seo/FieldGuide";
import { DuoLedger } from "@/components/stock/DuoLedger";
import { alertsDelivered, duoLedgerFrom } from "@/lib/content/duoLedger";
import { PickupPattern } from "@/components/seo/PickupPattern";
import { withCuratedMetadata } from "@/lib/seo/curation";
/**
 * The store page of any country: /stores/{state}/{city}/{store} in the US, /{cc}/stores/{region}/{city}/{store}
 * elsewhere. One template; the US keeps exactly what it showed (state lines, sales tax, neighboring states),
 * another country gets its own currency, tax rule, distance unit and only its own stores as neighbours.
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
import { BrowseCountryModels } from "@/components/seo/CountryBrowse";
import { Faq } from "@/components/seo/Faq";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs,LinkRow,RelatedBlock,type Crumb } from "@/components/seo/Related";
import { LiveChecked } from "@/components/site/LiveChecked";
import { ConfigTable } from "@/components/stores/ConfigTable";
import { MiniMap } from "@/components/stores/MiniMap";
import { NearbyStores } from "@/components/stores/NearbyStores";
import { StoreInfo } from "@/components/stores/StoreInfo";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { pickupHelp } from "@/content/country-tax";
import { SALES_TAX,SALES_TAX_SOURCE,withTax } from "@/content/sales-tax";
import { catalogFor, cityPath, citySlug, DEFAULT_MODEL, hasStatePage, mapPath, modelByKey, modelKeyFor, MODELS, placeTarget, restocksPath, stateCodeOf, statePath, stateSlug, storePath, storesIndexPath, storesOf, storeTimeZone, type ModelKey, type Store, partNumbersFor } from "@/lib/apple/catalog";
import { prefixOf,type Country } from "@/lib/apple/countries";
import { emptyFacts } from "@/lib/content/facts";
import { restockTimesPath, duoRestockTimesAt } from "@/lib/content/restockTimes";
import { englishLocale,type Locale } from "@/lib/i18n/locales";
import { namesFor } from "@/lib/i18n/names";
import { pageLocale,t } from "@/lib/i18n/server";
import { cityRefs as intlCityRefs,nearbyCitiesIn,nearestStoresIn } from "@/lib/seo/countryLinks";
import { alertHref, distText, fitTitle, nearestInState, nearestOutsideState, normalizeHours, storeJsonLd, peakOf } from "@/lib/seo/enrich";
import { cityLabel,cityRef,nearbyCities,nearestStores,neighborStates } from "@/lib/seo/links";
import { pickupLookupOff,placeStats,restockFeed,restockReportStats,restockStats,storesStock,storeStatus } from "@/lib/stock/queries";
import { recentByConfig } from "@/lib/stock/recent";
import { sellouts } from "@/lib/stock/sellouts";
import type { Metadata } from "next";
import { notFound,permanentRedirect } from "next/navigation";
import { cache } from "react";
import { alternatesIn } from "./shared";

export type StoreParams = { state: string; city: string; store: string };

/** Return-log entries shown on a store page; the state's full record is one link away. */
const FEED_SHOWN = 15;

export function storeStaticParams(c: Country) {
  return storesOf(c.cc).map((s) => ({ state: stateSlug(s.state), city: citySlug(s.city), store: s.slug }));
}

function find(c: Country, state: string, city: string, store: string) {
  return storesOf(c.cc).find((s) => s.slug === store && stateSlug(s.state) === state && citySlug(s.city) === city);
}

/** Everything the page and its metadata need, loaded once per request (10 queries: 5 live + 5 cached). */
const load = cache(async (s: Store) => {
  const tz = storeTimeZone(s);
  const us = s.country === "us";
  const nearby = us ? nearestStores(s, 6) : nearestStoresIn(s, 6);
  const outside = nearestOutsideState(s, 3);
  const inState = nearestInState(s, 4, { excludeCity: true });
  const others = [...new Set([...nearby, ...outside, ...inState].map((n) => n.storeNumber))];
  const [rows, stock, feed, stats, pstats, reports, lookupOff, sell, recent, duoClock, duoReports, duoStats, duoSell, times, alerts] = await Promise.all([
    storeStatus(s.storeNumber),
    storesStock([s.storeNumber, ...others]),
    restockFeed({ storeNumber: s.storeNumber, kind: "all", limit: 30, country: s.country }),
    restockStats([s.storeNumber], tz, 30),
    placeStats({ storeNumbers: [s.storeNumber], tz }),
    restockReportStats([s.storeNumber], tz, 30),
    pickupLookupOff(s.storeNumber),
    sellouts({ storeNumbers: [s.storeNumber], country: s.country }),
    recentByConfig({ storeNumbers: [s.storeNumber], country: s.country }),
    // iPhone Duo only for the opening ledger, the hour chart and the daily bars (2026-11-08): three models in one chart
    // put the Pro Max's afternoon on the Duo's page.
    restockStats([s.storeNumber], tz, 30, "duo"),
    restockReportStats([s.storeNumber], tz, 30, "duo"),
    placeStats({ storeNumbers: [s.storeNumber], model: "duo", tz }),
    sellouts({ storeNumbers: [s.storeNumber], parts: partNumbersFor("duo", [], [], s.country), country: s.country }),
    duoRestockTimesAt(s.country, [s]),
    alertsDelivered([s.storeNumber]),
  ]);
  const ledger = duoLedgerFrom({ stores: [s], stock, times, sell: duoSell, alerts, configsTotal: catalogFor("duo", s.country).length });
  const summary = stock.get(s.storeNumber);
  const stockNow = Object.fromEntries(MODELS.map((m) => [m.key, summary?.perModel[m.key].available ?? 0])) as Record<ModelKey, number>;
  const configs = Object.fromEntries(MODELS.map((m) => [m.key, rows.filter((r) => modelKeyFor(r.item.model) === m.key).length || catalogFor(m.key, s.country).length])) as Record<ModelKey, number>;
  // The last Duo restock in the feed (30 rows, all models): what the 24-hour block names on a quiet day.
  const lastDuo = feed.find((r) => r.kind === "restock" && modelKeyFor(r.item.model) === "duo");
  const lastDuoRestock = lastDuo ? { storeNumber: lastDuo.storeNumber, partNumber: lastDuo.partNumber, at: lastDuo.at.toISOString() } : null;
  return { tz, nearby, outside, inState, rows, stock, summary, feed, stats, pstats, reports, lookupOff, stockNow, configs, sell, recent, lastDuoRestock, duoClock, duoReports, duoStats, ledger };
});

/** True when this is the only Apple Store in its city (the city query lands here). */
function onlyInCity(s: Store): boolean {
  return !storesOf(s.country).some((x) => x.state === s.state && x.city === s.city && x.storeNumber !== s.storeNumber);
}

export async function storeMetadata(c: Country, p: StoreParams, loc: Locale = englishLocale(c.cc)): Promise<Metadata> {
  const s = find(c, p.state, p.city, p.store);
  if (!s) return {};
  const N = namesFor(loc.lang,c.cc);
  const F = fieldGuideCopy(loc.lang);
  const title = loc.lang === "en" ? fitTitle([`${N.apple(s)}: iPhone pickup options`,`${N.apple(s)} pickup guide`],60) : `${N.apple(s)} · ${F.compare}`;
  const description = loc.lang === "en" ? `Check exact iPhone configurations at ${N.apple(s)}, then compare nearby stores. Includes observation times, pickup history, hours and travel details.`.slice(0,155) : `${N.apple(s)} · ${F.lead}`.slice(0,155);
  const alt = alternatesIn(storePath(s), loc);
  return withCuratedMetadata(alt.canonical, { title, description, alternates: c.cc === "us" ? { canonical: storePath(s) } : alt, openGraph: { type: "website", siteName: "ShelfSpring", title, description, url: alt.canonical } });
}

export async function StorePage({ country: c, params: p }: { country: Country; params: StoreParams }) {
  const { state, city, store } = p;
  const s = find(c, state, city, store);
  if (!s) {
    // Old URL shape /stores/{state}/{store-slug} lands here with city = store slug: send it to the canonical page.
    const legacy = storesOf(c.cc).find((x) => x.slug === city && stateSlug(x.state) === state);
    if (legacy && store === legacy.slug) permanentRedirect(storePath(legacy));
    notFound();
  }
  const us = c.cc === "us";
  const cc = c.cc;
  const loc = pageLocale();
  const lang = loc.lang;
  const P = t().place;
  const G = t().pages.common;
  const S = t().pages.store;
  const N = namesFor(lang, cc);
  const d = await load(s);
  const week = normalizeHours(s.hours);
  const all = storesOf(cc);
  const sameCity = all.filter((x) => x.state === s.state && x.city === s.city && x.storeNumber !== s.storeNumber);
  const sameState = all.filter((x) => x.state === s.state && x.city !== s.city).sort((a, b) => a.city.localeCompare(b.city)).slice(0, 14);
  const here = us ? cityRef(s.state, s.city) : undefined;
  const cities = us
    ? nearbyCities(s.lat, s.lng, { exclude: here, limit: 8 }).map((x) => ({ href: x.href, label: cityLabel(x), meta: `${Math.round(x.distance)} mi` }))
    : nearbyCitiesIn(cc, s.lat, s.lng, { excludeHref: intlCityRefs(cc).find((x) => x.state === s.state && x.name === s.city)?.href, limit: 8 }).map((x) => ({ href: x.href, label: N.city(x.name), meta: distText(x.distance, cc, lang) }));
  const neighbors = us ? neighborStates(s.state) : [];
  const duo = modelByKey(DEFAULT_MODEL)!;
  const code = stateCodeOf(s);
  const place = N.apple(s);
  const sCity = N.city(s.city);
  const sRegion = N.region(s.state);
  const alert = alertHref({ model: DEFAULT_MODEL, store: s.storeNumber, country: cc });
  const questions = fieldGuideQuestions({place:place,stores:1,kind:"store",lang});
  const tax = us ? SALES_TAX[s.state] : undefined;
  const duoTaxed = us ? withTax(1999, s.state) : null;
  if (tax) questions.push({ q: `What does a 256GB iPhone Duo cost at ${place} once sales tax is added?`, a: tax.combined === 0 ? `Exactly $1,999. ${s.state} levies no sales tax, so the figure on apple.com is the whole bill when you collect.` : `Roughly $${withTax(1999, s.state)!.total.toLocaleString("en-US")}. That estimate applies ${tax.combined}%, the average state-plus-local rate for ${s.state}; a city or county can nudge it either way. A pickup order is taxed at the store's address, not at your home address.` });
  if (!us) { const tf = P.taxFaq(cc, place, cc === "ca" ? s.state : undefined); questions.push({ q: cc === "ca" ? S.taxQ(place) : tf.q, a: tf.a }); }
  questions.push({ q: S.pickupQ(place), a: S.pickupA(place) });
  const alone = onlyInCity(s);
  // The restock-times page of this store's city (two-plus stores) or state/region (with a page of its own), every country.
  const rtLink = [{ href: restockTimesPath(s.state, s.city, cc), place: N.city(s.city) }, { href: restockTimesPath(s.state, undefined, cc), place: N.region(s.state) }].find((l) => /^(\/[a-z]{2})?\/iphone-duo-restock-times\//.test(l.href));
  const taxLine = us
    ? (!tax ? "" : tax.combined === 0 ? `Tax note: 256GB iPhone Duo $1,999 flat, since ${s.state} adds no sales tax.` : `Tax note: 256GB iPhone Duo ≈ $${duoTaxed!.total.toLocaleString("en-US")} after the ${tax.combined}% ${s.state} average rate.`)
    : P.taxSentence(cc, cc === "ca" ? s.state : undefined);
  const facts = lang === "en" ? emptyFacts(cc, d.tz) : { ...emptyFacts(cc, d.tz), lang };
  const W = t().modules.duoLedger;
  const peakAll = peakOf(d.stats, lang);
  const help = us ? pickupHelp(cc) : P.sources(cc as Exclude<typeof cc, "us">).pickupHelp;
  const index = placeTarget(cc);
  const crumbs: Crumb[] = us
    ? [{ href: "/stores", label: G.appleStores }, ...(hasStatePage(s.state) ? [{ href: statePath(s.state), label: s.state }] : []), ...(alone ? [] : [{ href: cityPath(s.state, s.city), label: s.city }]), { label: place }]
    : [{ href: prefixOf(cc), label: N.countryShort() }, ...(index?.indexable ? [{ href: storesIndexPath(cc), label: G.appleStores }] : []), ...(hasStatePage(s.state, cc) ? [{ href: statePath(s.state, cc), label: sRegion }] : []), ...(alone || !placeTarget(cc, stateSlug(s.state), citySlug(s.city))?.indexable ? [] : [{ href: cityPath(s.state, s.city, cc), label: sCity }]), { label: place }];
  const restocksAll = `${restocksPath(cc)}?model=all&state=${stateSlug(s.state)}`;
  const regionWord = us ? "state" : (c.regionNoun ?? "area");
  const F = fieldGuideCopy(lang);
  const listed = new Set(d.nearby.map((n) => n.storeNumber));
  const inStateOnly = d.inState.filter((n) => !listed.has(n.storeNumber));
  inStateOnly.forEach((n) => listed.add(n.storeNumber));
  const outsideOnly = d.outside.filter((n) => !listed.has(n.storeNumber));
  return (
    <div className="field-page">
      <JsonLd data={storeJsonLd(s,week,lang)} />
      <Breadcrumbs items={crumbs} />
      <FieldIntro title={lang === "en" ? `${place}: the pickup desk` : `${place} · ${F.compare}`} description={lang === "en" ? `Start with this store's exact configurations, then compare nearby alternatives. The observation time belongs to the stock record; opening hours and travel details help you plan only after Apple confirms an order.` : F.lead}
        actions={<><Link href={alert} className="btn btn-primary btn-sm">{S.alertHere(duo.short)}</Link><Link href={`${mapPath(cc)}?store=${s.storeNumber}&model=${DEFAULT_MODEL}`} className="btn btn-ghost btn-sm">{G.showOnMap}</Link></>}>
        <div className="pane p-5 sm:p-6"><p className="field-kicker">{s.storeNumber} · {sCity}</p><div className="mt-4"><StoreInfo store={s} showMapLink={false} /></div>{taxLine && <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-ink-3">{taxLine}</p>}</div>
      </FieldIntro>
      {/* The observation ledger first (lib/content/duoLedger.ts): configurations listed as of the last observation, the last return, the record, the last three. */}
      <div className="pt-8"><DuoLedger d={d.ledger} place={place} one stores={[s]} country={cc} hourHref={rtLink?.href ?? null} watchHref={alert} /></div>
      <div className="field-layout">
        <div className="field-main">
          {/* ShelfSpring's order: today's shelf, then what returned (which configurations, the last day), then when and for how long, then the raw log. */}
          <FieldSection id="configs" title={F.compare} caption={S.stockNowH2}>
            {d.lookupOff && <p className="mb-4 text-sm font-medium text-warn">{S.lookupOff}</p>}
            <p className="mb-4 text-sm text-ink-3">{G.checkNote} · {S.checked} <LiveChecked iso={d.summary?.lastCheckedAt ?? null} stores={[s.storeNumber]} /></p>
            <ConfigTable store={s} rows={d.rows} {...(lang === "en" ? { title: `Shelf check · ${N.store(s)}, all tracked versions` } : {})} {...(d.lookupOff ? {lookupOff:true} : {})} />
          </FieldSection>
          <FieldSection id="returned" title={G.restocksBy} caption={`${d.pstats.days}d`}><RestocksByConfig stats={d.pstats} label={G.here} store={s.storeNumber} country={cc} /></FieldSection>
          <FieldSection id="recent" title={F.history} caption="24h"><PickupPattern data={d.recent} storeCount={1} country={cc} window="24h" /><Last24Hours data={d.recent} label={G.atPlace(place)} stores={[s]} country={cc} stock={d.stock} lastBefore={d.lastDuoRestock} alert={alert} compact /></FieldSection>
          <FieldSection id="timing" title={S.duoHours(N.store(s))} caption={`${d.pstats.days}d`}>{rtLink && <p className="mb-4"><Link href={rtLink.href} className="text-sm underline underline-offset-4">{lang === "en" ? `${rtLink.place} return study, hour by hour` : G.fullLog} →</Link></p>}<RestockClock stats={d.duoClock} label={G.here} reports={d.duoReports} /><p className="mt-3 text-xs text-ink-3">{W.allModels({ n: d.pstats.month, days: d.pstats.days, peak: peakAll ? peakAll.hour : null })}</p></FieldSection>
          <FieldSection id="calendar" title={G.lastDays(d.pstats.days)}><DailyBars stats={d.duoStats} label={G.here} /></FieldSection>
          <FieldSection id="duration" title={S.howFast(N.store(s))}><SellOutTimes data={d.sell} label={G.here} /></FieldSection>
          {/* The newest fifteen entries; the whole state record sits behind the action link. */}
          <FieldSection id="log" title={S.history} action={<Link href={restocksAll} className="text-sm underline underline-offset-4">{G.allOfArrow(sRegion)}</Link>}><RestockFeed rows={d.feed.slice(0, FEED_SHOWN)} showModel emptyText={S.historyEmpty} /></FieldSection>
        </div>
        <aside className="field-aside space-y-6">
          <AlertPanelFor href={alert} summary={S.panel(N.store(s))} country={cc} />
          {/* Backups: each store appears once, in the first list that holds it. */}
          <NearbyStores title={F.alternatives} stores={d.nearby} stock={d.stock} />
          {inStateOnly.length > 0 && <NearbyStores title={S.elsewhereIn(sRegion)} stores={inStateOnly} stock={d.stock} />}
          {us && outsideOnly.length > 0 && <NearbyStores title={G.acrossStateLine} stores={outsideOnly} stock={d.stock} />}
          <MiniMap lat={s.lat} lng={s.lng} label={place} href={`${mapPath(cc)}?store=${s.storeNumber}&model=${DEFAULT_MODEL}`} />
          <FieldMethod />
          <SourceList sources={[...(s.url ? [{label:S.applePage(place),url:s.url}] : []),help,us ? SALES_TAX_SOURCE : P.sources(cc as Exclude<typeof cc,"us">).tax]} facts={facts} />
        </aside>
      </div>
      <div className="field-section"><Faq items={questions} title={S.faqTitle(place)} /></div>

      <RelatedBlock title={S.around(place)}>
        <LinkRow title={G.restockLogs} links={[{ href: restocksAll, label: G.regionRestocks(sRegion) }, { href: `${mapPath(cc)}?state=${encodeURIComponent(code)}&model=${DEFAULT_MODEL}`, label: G.onTheMap(sRegion) }, { href: restocksPath(cc), label: us ? G.allUsRestocks : G.allRestocksIn(cc) }]} />
        {sameCity.length > 0 && <LinkRow title={S.otherInCity(sCity)} links={sameCity.map((x) => ({ href: storePath(x), label: N.store(x) }))} more={{ href: cityPath(s.state, s.city, cc), label: S.cityPage(sCity) }} />}
        <LinkRow title={S.moreIn(sRegion)} links={sameState.map((x) => ({ href: storePath(x), label: G.storeAndCity(N.store(x), N.city(x.city)) }))} more={{ href: statePath(s.state, cc), label: G.allOf(sRegion) }} />
        {cities.length > 0 && <LinkRow curated title={G.nearbyCities} links={cities} />}
        {neighbors.length > 0 && <LinkRow curated title={G.neighboringStates} links={neighbors.map((n) => ({ href: n.href, label: n.name, meta: String(n.count) }))} />}
        {!us && <LinkRow title={S.everyIn(cc)} links={all.filter((x) => x.storeNumber !== s.storeNumber && !sameCity.includes(x) && !sameState.includes(x)).slice(0, 16).map((x) => ({ href: storePath(x), label: G.storeAndCity(N.store(x), N.city(x.city)) }))} more={{ href: index?.path ?? prefixOf(cc), label: index?.indexable ? S.allIn(cc) : S.countryHome(cc) }} />}
        {us ? <BrowseModels /> : <BrowseCountryModels country={c} />}
      </RelatedBlock>
      <p className="mt-8 text-xs text-ink-3">{S.footnote}{us ? "" : S.footnoteIntl(cc, regionWord)}</p>
    </div>
  );
}
