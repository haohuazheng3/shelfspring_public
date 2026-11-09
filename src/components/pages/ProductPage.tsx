import { FieldIntro,FieldMethod,FieldSection,fieldGuideCopy,fieldGuideQuestions } from "@/components/seo/FieldGuide";
import { DuoLedger } from "@/components/stock/DuoLedger";
import { alertsDelivered, duoLedgerFrom, stockFromRows } from "@/lib/content/duoLedger";
import { duoRestockTimes, duoRestockTimesAt, restockTimesPath } from "@/lib/content/restockTimes";
import { PickupPattern } from "@/components/seo/PickupPattern";
import { withCuratedMetadata } from "@/lib/seo/curation";
/**
 * One page per product × place, in any country: /stock/{product}/{place…} in the US, /{cc}/stock/… elsewhere.
 * Reads: three cached status reads (one per model and country, shared by every page), the cached place
 * statistics, the restock-hour histogram and the latest changes. The place's country (seo/tree.ts) decides
 * the catalogue, stores and links. Indexed: the US national model/storage/colour pages (project documentation §10) and, in
 * every other country, its three model pages (§12); everything else is noindex, follow.
 */
import { AlertPanelFor } from "@/components/alerts/AlertPanelServer";
import { QuickCheckServer } from "@/components/content/QuickCheckServer";
import { SourceList } from "@/components/content/RichFaq";
import { DailyBars } from "@/components/restocks/DailyBars";
import { RestockClock } from "@/components/restocks/RestockClock";
import { RestockFeed } from "@/components/restocks/RestockFeed";
import { RestocksByConfig } from "@/components/restocks/RestocksByConfig";
import { SellOutTimes } from "@/components/restocks/SellOutTimes";
import { Faq } from "@/components/seo/Faq";
import { JsonLd } from "@/components/seo/JsonLd";
import { PlaceCountList,ProductGrid,ProductNav,ProductStoreList,StatusCard } from "@/components/seo/ProductParts";
import { Breadcrumbs,LinkRow,RelatedBlock } from "@/components/seo/Related";
import { StatStrip,type Stat } from "@/components/seo/StatStrip";
import { LiveAgo } from "@/components/site/LiveAgo";
import { LiveChecked } from "@/components/site/LiveChecked";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { pickupHelp } from "@/content/country-tax";
import { STORE_INDEX, appleBuyUrl, cityPath, itemFor, mapPath, placeTarget, restocksPath, statePath, storePath, storesIndexPath, catalogFor } from "@/lib/apple/catalog";
import { prefixOf,theName,type Country } from "@/lib/apple/countries";
import { emptyFacts } from "@/lib/content/facts";
import { type Dict } from "@/lib/i18n/dict";
import { bidi,distance } from "@/lib/i18n/format";
import { englishLocale,pathInLocale,type Lang,type Locale } from "@/lib/i18n/locales";
import { appleStoreLabel,cityLabel,configLabel,countryLabel,regionLabel,storeLabel } from "@/lib/i18n/places";
import { t as dictT,pageLocale } from "@/lib/i18n/server";
import { priceRange } from "@/lib/seo/countryCopy";
import { alertHref,distText } from "@/lib/seo/enrich";
import { productJsonLdFor } from "@/lib/seo/productCopy";
import { childPlaces,configGrid,facetsFor,indexStock,lastChecked,nearestWithStock,siblingPlaces,storeLines } from "@/lib/seo/productData";
import { isIndexedProductPage,productPath,storePlace,type Place,type Product } from "@/lib/seo/products";
import { treeOf } from "@/lib/seo/tree";
import { modelStock, placeStats, restockFeed, restockReportStats, restockStats, stockByStore, storesStock, storesWithStockNow } from "@/lib/stock/queries";
import { sellouts } from "@/lib/stock/sellouts";
import type { Metadata } from "next";
import { notFound,permanentRedirect } from "next/navigation";
import { cache } from "react";
import { hreflangFor } from "./shared";

const INDEXABLE = process.env.NEXT_PUBLIC_INDEXABLE === "1";
const BASE = "https://shelfspring.com";

export type ProductParams = { product: string; place?: string[] };

// Keyed by strings: React's cache compares arguments by identity, and the page and its metadata get different arrays.
const load = cache(async (cc: Country["cc"], slug: string, path: string) => {
  const t = treeOf(cc);
  const product = t.productBySlug(slug);
  if (!product) return null;
  const place = t.resolvePlace(path ? path.split("/") : []);
  if (!place) return null;
  if ("redirect" in place) return { kind: "redirect" as const, to: productPath(product, { segments: place.redirect, country: product.country }) };
  const numbers = place.stores.map((s) => s.storeNumber);
  const [duo, pro, max, stats, clock, feed, reports, sell] = await Promise.all([
    modelStock("duo", cc),
    modelStock("18-pro", cc),
    modelStock("18-pro-max", cc),
    placeStats({ storeNumbers: numbers, parts: product.parts, tz: place.tz, country: cc }),
    restockStats(numbers, place.tz, 30, undefined, product.parts, cc),
    restockFeed({ parts: product.parts, storeNumbers: numbers, kind: "all", limit: 8, country: cc }),
    restockReportStats(numbers, place.tz, 30, undefined, product.parts, cc),
    sellouts({ storeNumbers: numbers, parts: product.parts, country: cc }),
  ]);
  const ix = indexStock({ duo, "18-pro": pro, "18-pro-max": max });
  const lines = storeLines(ix, product, place.stores);
  const inStock = lines.filter((l) => l.available.length > 0).length;
  // Index scope (project documentation §10, §12): the national page of a model (US: also a storage size or a color). Every
  // place-level product page and every exact configuration is noindex, follow: the /stores page of that place
  // is the one indexed page for "iPhone Duo in <place>", which keeps near-duplicates out of the index.
  const indexable = isIndexedProductPage(product, place);
  // The iPhone Duo model page opens with the observation ledger (lib/content/duoLedger.ts), at every level of the tree.
  let ledger = null;
  if (product.kind === "model" && product.model === "duo") {
    const country = place.level === "country";
    const [stock, others, times, alerts] = await Promise.all([
      country ? stockByStore("duo", {}, cc).then(stockFromRows) : storesStock(numbers),
      country ? storesWithStockNow(undefined, cc) : Promise.resolve(null),
      country ? duoRestockTimes(cc) : duoRestockTimesAt(cc, place.stores),
      alertsDelivered(numbers),
    ]);
    ledger = duoLedgerFrom({ stores: place.stores, stock, ...(others ? { others: { pro: others["18-pro"], max: others["18-pro-max"] } } : {}), times, sell, alerts, configsTotal: catalogFor("duo", cc).length });
  }
  return { kind: "page" as const, product, place, ix, lines, inStock, stats, clock, feed, reports, indexable, sell, ledger };
});

/** A place's name in the page's language (English: the tree's own name, or its breadcrumb label when `short`). */
function placeName(place: Place, lang: Lang, short = false): string {
  if (lang === "en") return short ? place.label : place.name;
  const cc = place.country ?? "us";
  if (place.level === "country") return countryLabel(cc, lang);
  if (place.level === "state") return regionLabel(cc, place.state!, lang);
  if (place.level === "city") return cityLabel(cc, place.city!, lang);
  return short ? storeLabel(place.store!, lang) : appleStoreLabel(place.store!, lang);
}

export async function productMetadata(c: Country, p: ProductParams, loc: Locale = englishLocale(c.cc)): Promise<Metadata> {
  const { product: slug, place: segments = [] } = p;
  const d = await load(c.cc, slug, segments.join("/"));
  if (!d || d.kind === "redirect") return {};
  const t = treeOf(c.cc);
  const F = fieldGuideCopy(loc.lang);
  const title = loc.lang === "en" ? `${d.product.name} pickup · ${placeName(d.place,loc.lang,true)}` : `${d.product.name} · ${placeName(d.place,loc.lang,true)} · ${F.next}`;
  const description = loc.lang === "en" ? `Choose a ${d.product.name} configuration, compare pickup stores in ${placeName(d.place,loc.lang,true)}, and inspect the recorded return history before ordering.`.slice(0,160) : `${d.product.name} · ${placeName(d.place,loc.lang,true)} · ${F.lead}`.slice(0,160);
  const inLoc = (path: string) => (loc.native ? pathInLocale(path, loc) : path);
  const url = inLoc(productPath(d.product, d.place));
  const canonical = inLoc(productPath(d.product, t.canonicalPlace(d.place)));
  // The three model pages are the same page in every country (hreflang, x-default = the US one).
  const languages = d.place.level === "country" && d.product.kind === "model" ? hreflangFor({ model: d.product.slug }, loc) : undefined;
  return withCuratedMetadata(url, {
    title, description, alternates: { canonical, ...(languages ? { languages } : {}) },
    ...(INDEXABLE && !d.indexable ? { robots: { index: false, follow: true } } : {}),
    openGraph: { type: "website", siteName: "ShelfSpring", title, description, url },
  });
}

/** The all-models page for the same place. */
function placePagePath(place: Place): string {
  const cc = place.country ?? "us";
  if (place.level === "country") return cc === "us" ? "/stores" : (placeTarget(cc)?.path ?? prefixOf(cc));
  if (place.level === "state") return statePath(place.state!, cc);
  if (place.level === "city") return cityPath(place.state!, place.city!, cc);
  return storePath(place.store!);
}

function placeAlert(product: Product, place: Place): string {
  return alertHref({ model: product.model, storage: product.storage, color: product.color, store: place.store?.storeNumber, state: place.level === "state" || place.level === "city" ? place.stateSlug : undefined, city: place.level === "city" ? place.citySlug : undefined, country: place.country });
}

export async function ProductPage({ country: c, params: p }: { country: Country; params: ProductParams }) {
  const { product: slug, place: segments = [] } = p;
  const d = await load(c.cc, slug, segments.join("/"));
  if (!d) notFound();
  if (d.kind === "redirect") permanentRedirect(d.to);
  const us = c.cc === "us";
  const t = treeOf(c.cc);
  const loc = pageLocale();
  const lang = loc.lang;
  const D = dictT();
  const V = D.views.product;
  const C = D.views.common;
  const inLoc = (path: string) => (loc.native ? pathInLocale(path, loc) : path);
  const { product, place, ix, lines, inStock, stats, clock, feed, reports, sell, ledger } = d;
  const top = place.level === "country";
  const atStore = place.level === "store";
  const line = lines[0];
  const chain = t.placeChain(place);
  const facets = facetsFor(ix, product, place);
  const grid = configGrid(ix, product, place);
  const children = childPlaces(ix, product, place);
  const siblings = siblingPlaces(ix, product, place, atStore ? 8 : 6);
  const nearest = inStock === 0 || (atStore && (line?.available.length ?? 0) === 0) ? nearestWithStock(ix, product, place) : null;
  const checked = lastChecked(lines);
  const one = product.parts.length === 1;
  const configItem = one ? itemFor(product.parts[0], c.cc) : undefined;
  const lr = stats.lastRestock;
  const lrItem = lr ? itemFor(lr.partNumber, c.cc) : undefined;
  const lrStore = lr ? STORE_INDEX.get(lr.storeNumber) : undefined;
  const dist = (miles: number) => (lang !== "en" ? distance(lang, c.cc, miles) : us ? `${Math.round(miles)} mi` : distText(miles, c.cc));
  // "in Tokyo" / "at Apple Ginza", and the country's "in the UK", in the page's language.
  const where = V.inPlace(placeName(place, lang), place.level);
  const inCountry = C.inCountry(c);
  const label = top && !us ? inCountry : where;
  // The whole country: the stores that have it, or — when none do — the ones that had it most recently.
  const usNone = top && inStock === 0;
  // A country page lists the first sixteen stores that have it; the store directory (every store × model) holds the rest.
  const shownLines = !top ? lines : usNone ? lines.filter((l) => l.lastAvailableAt).slice(0, 12) : lines.filter((l) => l.available.length > 0).slice(0, 16);
  const faq = fieldGuideQuestions({place:placeName(place,lang),stores:place.stores.length,kind:"product",model:product.name,lang});
  const countryName = lang === "en" ? theName(c) : countryLabel(c.cc,lang);
  const intlFaq = !us && top ? modelFaq(c,product,inStock,D,countryName) : [];

  const stat: Stat[] = [
    atStore
      ? { label: V.inStockNow, value: !checked ? "—" : one ? (inStock ? V.yes : V.no) : `${line?.available.length ?? 0}/${product.parts.length}`, hint: one ? (line?.status?.quote ?? V.pickup) : V.configurations, live: inStock > 0 }
      : { label: V.inStockNow, value: checked ? inStock : "—", hint: V.ofStores(place.stores.length), live: inStock > 0 },
    { label: V.restocks24h, value: stats.unknown ? "—" : stats.day, hint: V.restocksHint(stats.week, stats.month, stats.days) },
    { label: V.sellOuts(stats.days), value: stats.unknown ? "—" : stats.soldouts, hint: stats.medianMs != null ? V.stays(stats.medianMs) : V.noPairs },
    { label: V.lastRestock, value: stats.unknown ? fieldGuideCopy(lang).unknown : lr ? <LiveAgo iso={lr.at} /> : V.noneYet, hint: lr && lrItem ? `${one ? "" : configLabel(lrItem, lang)}${lrStore && !atStore ? `${one ? "" : " · "}${storeLabel(lrStore, lang)}` : ""}` || V.thisConfig : V.inDays(stats.days) },
  ];
  const intlTop = !us && top;
  const short = lang === "en" ? c.short : countryLabel(c.cc, lang);

  const Guide=fieldGuideCopy(lang);
  return (
    <div className="field-page">
      <JsonLd data={loc.native ? {...productJsonLdFor(product,place,atStore ? line?.available.length ?? 0 : inStock),url:`${BASE}${inLoc(productPath(product,place))}`} : productJsonLdFor(product,place,atStore ? line?.available.length ?? 0 : inStock)} />
      {chain.length > 1 ? <Breadcrumbs items={chain.map((x,i)=>({href:i<chain.length-1 ? productPath(product,x) : undefined,label:placeName(x,lang,true)}))} /> : intlTop && <Breadcrumbs items={[{href:prefixOf(c.cc),label:short},{label:product.name}]} />}
      <FieldIntro title={`${product.name} · ${placeName(place,lang,true)}`} description={lang === "en" ? `Choose the version you would buy before choosing the store. This workspace follows ${product.parts.length === 1 ? "one exact configuration" : `${product.parts.length} configurations`} across ${place.stores.length} ${place.stores.length === 1 ? "store" : "stores"}. Compare today's observed choices with the return history, without treating either as a reservation.` : Guide.lead}
        actions={<><Link href={placeAlert(product,place)} className="btn btn-primary btn-sm">{C.alertMe}</Link><Link href={placePagePath(place)} className="btn btn-ghost btn-sm">{top ? V.allStoresIn(c) : V.everyIphone(where)}</Link>{configItem && <a href={appleBuyUrl(configItem,c.cc)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">{V.buyOnApple}</a>}</>}>
        <div className="pane p-5"><p className="field-kicker">{Guide.coverage}</p><p className="mt-4 text-sm leading-relaxed text-ink-2">{V.checked(<LiveChecked iso={checked} model={product.model} stores={top ? null : place.stores.map(s=>s.storeNumber)} country={us ? undefined : c.cc} />,V.priceLabel(product),!us && c.cc!=="ca" ? ` · ${V.taxNote(c)}` : c.cc==="ca" ? ` · ${V.beforeTax}` : "")}</p><p className="mt-3 text-xs text-ink-3">{Guide.methodBody}</p></div>
      </FieldIntro>
      {ledger && <div className="pt-8"><DuoLedger d={ledger} place={placeName(place, lang)} one={atStore} stores={place.stores} country={c.cc} hourHref={top ? `${prefixOf(c.cc)}/iphone-duo-restock-times` : atStore ? null : restockTimesPath(place.state!, place.level === "city" ? place.city : undefined, c.cc)} watchHref={placeAlert(product, place)} /></div>}
      <div className="field-layout">
        <div className="field-main">
          <FieldSection id="configuration" title={V.byStorageColor} caption={Guide.next}><div className="pane p-4 sm:p-6"><ProductNav facets={facets} place={place} unit={atStore ? V.unitConfigs : V.unitStores} /><div className="mt-5 border-t border-line pt-4"><ProductGrid grid={grid} place={place} current={product} /></div></div>{us && top && <div className="mt-5"><QuickCheckServer model={product.model} product={product} /></div>}</FieldSection>
          <FieldSection id="pickup-options" title={atStore ? V.inStockNow : usNone ? V.mostRecentlyInStock : Guide.compare}>
            {atStore && one && line ? <StatusCard line={line} /> : <ProductStoreList product={product} lines={shownLines} showCity={place.level!=="city"} emptyText={checked ? top ? V.noStoreHasIt : V.noStoreHereHasIt : Guide.unknown} />}
            {top && !usNone && inStock>shownLines.length && <p className="mt-3 text-sm text-ink-3"><Link href={placePagePath(place)} className="underline underline-offset-4">{V.moreStores(inStock-shownLines.length)}</Link></p>}
          </FieldSection>
          {/* ShelfSpring's order: shelf today, the record's measures, which configurations came back, then hour, calendar, duration and the raw entries. */}
          <FieldSection id="history" title={Guide.history} caption={`${stats.days}d`}><StatStrip items={stat} cols={4} /><PickupPattern data={{restocks:stats.month,stores:stats.restockStores,byPart:stats.byPart,unknown:stats.unknown}} storeCount={place.stores.length} country={c.cc} model={product.model} window={`${stats.days}d`} parts={product.parts} /></FieldSection>
          {stats.month>0 && !one && <FieldSection id="returned" title={V.restocksByConfig}><RestocksByConfig stats={stats} label={label} store={place.store?.storeNumber} country={us ? undefined : c.cc} /></FieldSection>}
          <FieldSection id="timing" title={V.whenRestocks}><RestockClock stats={clock} label={label} reports={reports} /></FieldSection>
          {stats.month>0 && <FieldSection id="calendar" title={C.lastDays(stats.days)}><DailyBars stats={stats} label={label} /></FieldSection>}
          <FieldSection id="duration" title={V.howFast}><SellOutTimes data={sell} label={label} showStore={place.stores.length>1} /></FieldSection>
          <FieldSection id="log" title={V.latestChanges}><RestockFeed rows={feed} showModel={product.kind==="model"} emptyText={V.nothingLogged} /></FieldSection>
        </div>
        <aside className="field-aside space-y-6">
          <AlertPanelFor href={placeAlert(product,place)} summary={V.panel(product.name,top ? us ? null : inCountry : where)} country={c.cc} />
          {siblings.length>0 && <section className="field-callout"><h2 className="text-xl font-semibold">{Guide.alternatives}</h2>{nearest && <p className="mt-3 text-sm">{V.closest(<Link href={productPath(product,storePlace(nearest.store))} className="underline">{storeLabel(nearest.store,lang)}</Link>,dist(nearest.distance))}</p>}<div className="mt-4"><PlaceCountList product={product} items={siblings} /></div></section>}
          {children.length>0 && <section className="field-callout"><h2 className="text-xl font-semibold">{top ? V.byRegion(c) : V.byCity}</h2><div className="mt-4"><PlaceCountList product={product} items={children} /></div></section>}
          <FieldMethod />
          <SourceList sources={[pickupHelp(c.cc),{label:V.buySource(product.name,c),url:appleBuyUrl({model:product.name,storage:"256GB",color:""},c.cc)}]} facts={emptyFacts(c.cc)} />
        </aside>
      </div>
      <div className="field-section"><Faq items={[...faq,...intlFaq]} title={V.faqTitle(bidi(product.short,lang),label)} /></div>

      <RelatedBlock title={V.nearby}>
        <LinkRow title={C.more} links={[
          { href: `${restocksPath(c.cc)}?model=${product.model}`, label: C.restockLog },
          { href: `${mapPath(c.cc)}?model=${product.model}${place.store ? `&store=${place.store.storeNumber}` : ""}`, label: C.liveMap },
          { href: placePagePath(place), label: top ? (us ? "Full store directory" : V.everyAppleStoreIn(c)) : V.everyIphone(where) },
          ...(top ? [] : [{ href: productPath(product, t.root), label: V.across(bidi(product.short, lang), c) }]),
          ...(intlTop ? [{ href: prefixOf(c.cc), label: C.checker(c) }, ...(placeTarget(c.cc)?.indexable ? [{ href: storesIndexPath(c.cc), label: C.appleStoresIn(c) }] : [])] : []),
          // Native versions only (English pages keep their links): the Duo page leads to the restock-times page.
          ...(intlTop && loc.native && product.model === "duo" ? [{ href: `${prefixOf(c.cc)}/iphone-duo-restock-times`, label: dictT().place.home.restockTimesChip }] : []),
        ]} />
        {(place.level === "city" || place.level === "store") && place.state && t.regionPlace(place.state) && (
          <LinkRow title={V.elsewhereIn(regionLabel(c.cc, place.state, lang))} links={[t.regionPlace(place.state)!, ...(place.level === "store" && place.city ? [t.cityPlace(place.state, place.city)].filter((x): x is Place => Boolean(x)) : [])].map((x) => ({ href: productPath(product, x), label: placeName(x, lang) }))} />
        )}
        {place.level === "state" && siblings.length > 0 && <LinkRow curated title={us ? "Bordering states" : V.otherRegions(c)} links={siblings.map((s) => ({ href: productPath(product, s.place), label: placeName(s.place, lang), meta: `${s.inStock}/${s.stores}` }))} />}
      </RelatedBlock>
    </div>
  );
}

/** Two more questions for another country's model page, around the tax one: the price and whether it can be reserved. */
function modelFaq(c: Country, product: Product, inStock: number, D: Dict, countryName: string): { q: string; a: string }[] {
  const r = priceRange(c.cc, product.model);
  const f = D.views.product.modelFaq(c, product.name, r.low, r.high, inStock);
  return [f.price, D.place.taxFaq(c.cc, countryName)];
}
