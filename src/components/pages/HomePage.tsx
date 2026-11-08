import type { Metadata } from "next";
import { DuoLedger } from "@/components/stock/DuoLedger";
import { alertsDelivered, duoLedgerFrom, stockFromRows } from "@/lib/content/duoLedger";
import "./Workspace.css";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { MODELS, modelByKey, STORE_INDEX, appleFamilyUrl, storesOf, mapPath, restocksPath, type ModelKey, catalogFor, partNumbersFor } from "@/lib/apple/catalog";
import { prefixOf, type Country } from "@/lib/apple/countries";
import { restockFeed, restockCounts, stockByStore } from "@/lib/stock/queries";
import { HomeAlertSetup } from "@/components/alerts/AlertSetup";
import { buildPhoneCatalog } from "@/components/alerts/catalog";
import { startFrom, startFromPool } from "@/lib/alertStart";
import { productFor, productPath, storePlace } from "@/lib/seo/products";
import { RestockFeed } from "@/components/restocks/RestockFeed";
import { LiveChecked } from "@/components/site/LiveChecked";
import { BrowseModels, BrowsePopular } from "@/components/seo/Browse";
import { BrowseCountryModels, BrowseCountryPopular } from "@/components/seo/CountryBrowse";
import { RelatedBlock } from "@/components/seo/Related";
import { JsonLd } from "@/components/seo/JsonLd";
import { HOME_TITLES } from "@/content/titles";
import { HOME_FAQ, HOME_SOURCES } from "@/content/home";
import { fieldCopy } from "@/content/field-guide";
import { ORG_ID, SITE_DESCRIPTION, SITE_FEATURES } from "@/lib/seo/siteLd";
import { SellOutTimes } from "@/components/restocks/SellOutTimes";
import { sellouts } from "@/lib/stock/sellouts";
import { getFacts } from "@/lib/content/facts";
import { RichFaq, SourceList } from "@/components/content/RichFaq";
import { alertHref } from "@/lib/seo/enrich";
import { Last24Hours } from "@/components/restocks/Last24Hours";
import { PickupPattern } from "@/components/seo/PickupPattern";
import { recentByConfig } from "@/lib/stock/recent";
import { duoRestockTimes } from "@/lib/content/restockTimes";
import { hreflangFor } from "./shared";
import { englishLocale, pathInLocale, type Locale } from "@/lib/i18n/locales";
import { dict } from "@/lib/i18n/dict";
import { pageLocale, t } from "@/lib/i18n/server";
import { namesFor } from "@/lib/i18n/names";
import { bidi, num } from "@/lib/i18n/format";
import { withCuratedMetadata } from "@/lib/seo/curation";

type SearchParams = Record<string, string | string[] | undefined>;

export function homeMetadata(c: Country, loc: Locale = englishLocale(c.cc)): Metadata {
  const languages = hreflangFor("home", loc);
  const title = c.cc === "us" ? HOME_TITLES.main.title : dict(loc.lang).place.homeTitle(c.cc);
  const description = c.cc === "us" ? HOME_TITLES.description : dict(loc.lang).place.homeDescription(c.cc);
  const url = pathInLocale(prefixOf(c.cc), loc);
  return withCuratedMetadata(url || "/", { title: { absolute: `${title} · ShelfSpring` }, description, alternates: { canonical: url || "/", languages }, openGraph: { type: "website", siteName: "ShelfSpring", title, description, url: url || "/", ...(loc.native ? { locale: loc.tag.replace("-", "_") } : {}) } });
}

/** Task-led country workspace. Alert prefills and the underlying editor state machine are retained. */
export async function HomePage({ country: c, searchParams: sp }: { country: Country; searchParams: SearchParams }) {
  const cc = c.cc, us = cc === "us", loc = pageLocale(), lang = loc.lang;
  const H = t().pages.home, P = t().place, F = fieldCopy(lang), N = namesFor(lang, cc);
  const catalog = buildPhoneCatalog(cc, lang);
  const get = (k: string) => typeof sp[k] === "string" ? sp[k] as string : undefined;
  const start = us ? startFrom(get) : startFromPool(get, catalog.stores ?? [], catalog.configs);
  const model = start.model ?? "duo", next = get("next");
  const p = prefixOf(cc), stores = storesOf(cc);

  // Keep the email field first and avoid loading inventory for a focused sign-in journey.
  if (sp.signin === "1") return (
    <div className="field-page">
      <section className="field-intro"><div><p className="field-kicker">ShelfSpring</p><h1 className="field-title">{F.alert}</h1><p className="field-lead">{F.alertNote}</p></div></section>
      <div className="mx-auto max-w-xl pb-10"><HomeAlertSetup catalog={catalog} start={start} signInOnly next={next} /></div>
    </div>
  );

  const [facts0, sell, recent, rt, duoRows, duoSell, alerts] = await Promise.all([getFacts(cc), sellouts({ country: cc }), recentByConfig({ country: cc }), duoRestockTimes(cc), stockByStore("duo", {}, cc), sellouts({ parts: partNumbersFor("duo", [], [], cc), country: cc }), alertsDelivered(stores.map((s) => s.storeNumber))]);
  const facts = { ...facts0, lang }, current = facts.models[model], modelMeta = modelByKey(model)!;
  const countryName = N.country();
  // The observation ledger (lib/content/duoLedger.ts): the Duo's listing status across the country, from the rows the board reads anyway.
  const ledger = duoLedgerFrom({ stores, stock: stockFromRows(duoRows), others: { pro: facts.models["18-pro"].storesNow, max: facts.models["18-pro-max"].storesNow }, times: rt, sell: duoSell, alerts, configsTotal: catalogFor("duo", cc).length });
  const ledgerPlace = us ? "the US" : countryName;
  const faq = us ? HOME_FAQ : P.homeFaq(cc, { n: rt!.n, stores: rt!.stores, storesTotal: rt!.storesTotal, peakHour: rt!.peakHour, path: `${p}/iphone-duo-restock-times` }).slice(0, 4);
  const sources = us ? HOME_SOURCES : [P.sources(cc as Exclude<typeof cc, "us">).pickupHelp, P.sources(cc as Exclude<typeof cc, "us">).storeList];
  const ld = { "@context": "https://schema.org", "@type": "WebApplication", name: "ShelfSpring", url: `https://shelfspring.com${pathInLocale(p, loc)}`, description: SITE_DESCRIPTION, featureList: SITE_FEATURES, applicationCategory: "UtilitiesApplication", operatingSystem: "Web, iOS and Android", publisher: { "@id": ORG_ID }, areaServed: { "@type": "Country", name: c.name }, offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: us ? "Public inventory and history are free; optional paid restock alerts." : P.home.offer } };
  return (
    <div className="site-content field-page">
      <JsonLd data={ld} />
      <section className="field-intro home-field-intro">
        <div><p className="field-kicker">{F.guide} <span aria-hidden> / </span> {countryName}</p><h1 className="field-title">{F.headline}</h1><p className="field-lead">{F.intro}</p><div className="mt-7 flex flex-wrap gap-3"><Link href={mapPath(cc)} className="btn btn-primary">{H.liveMap}<span aria-hidden>↗</span></Link><a href="#notify" className="btn btn-ghost">{F.alert}<span aria-hidden>↓</span></a></div></div>
        <aside className="home-coverage pane">
          <div className="field-kicker">{H.live} · {countryName}</div><div className="home-coverage-number">{num(lang, stores.length)}</div><p className="text-sm text-ink-2">{us ? "Apple Stores in the coverage area" : P.allStoresPhrase(cc)}</p>
          <div className="mt-6 border-t border-line pt-4"><p className="text-xs text-ink-3">{F.current}</p><p className="mt-1 font-semibold">{modelMeta.name}</p><p className="mt-2 text-sm text-ink-2">{current.unknown ? "—" : num(lang, current.storesNow)} · {H.storesWith(bidi(modelMeta.short, lang))}</p></div><p className="mt-5 text-xs leading-relaxed text-ink-3">{F.historyNote}</p>
        </aside>
      </section>
      <div className="pb-2 pt-8"><DuoLedger d={ledger} place={ledgerPlace} stores={stores} country={cc} hourHref={`${p}/iphone-duo-restock-times`} watchHref={alertHref({ model: "duo", country: cc })} /></div>
      <nav aria-label={F.model} className="home-model-index">
        {MODELS.map((m, i) => <Link key={m.key} href={`${p || "/"}?model=${m.key}`} aria-current={model === m.key ? "page" : undefined} className="home-model-option"><span className="field-kicker" aria-hidden>0{i + 1}</span><span className="font-semibold">{m.name}</span><span className="text-xs text-ink-3">{facts.models[m.key].unknown ? "—" : num(lang, facts.models[m.key].storesNow)} · {H.storesWith(bidi(m.short, lang))}</span><span className="home-model-arrow" aria-hidden>↗</span></Link>)}
      </nav>
      <section className="field-section" aria-labelledby="current-picture">
        <div className="field-section-head"><div><p className="field-kicker">01 / {F.current}</p><h2 id="current-picture" className="display text-3xl">{F.liveBoard}</h2></div><Link href={`${p}/stock/${modelMeta.slug}`} className="btn btn-ghost btn-sm">{H.liveStock(bidi(modelMeta.short, lang))} ↗</Link></div>
        <div className="field-layout"><div className="field-main pane p-5 sm:p-7"><Board model={model} c={c} /></div><aside className="field-aside"><div className="field-callout"><p className="field-kicker">{F.method}</p><ol className="mt-5 space-y-6">{[[F.current, F.nowNote], [F.history, F.historyNote], [F.alert, F.alertNote]].map(([title, text], i) => <li key={title} className="flex gap-3"><span className="font-mono text-xs text-accent" aria-hidden>0{i + 1}</span><div><h3 className="text-sm font-semibold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-ink-2">{text}</p></div></li>)}</ol></div></aside></div>
      </section>
      <section className="field-section" aria-labelledby="history-heading">
        <div className="field-section-head"><div><p className="field-kicker">02 / iPhone Duo</p><h2 id="history-heading" className="display text-3xl">{F.history}</h2></div><Link href={`${restocksPath(cc)}?model=duo`} className="btn btn-ghost btn-sm">{H.allRestocks} ↗</Link></div>
        <PickupPattern data={recent} storeCount={stores.length} country={cc} window="24h" />
        <div className="mt-5"><Last24Hours data={recent} label={us ? "in the US" : P.home.last24Label(cc)} stores={stores} country={cc} alert={alertHref({ model: "duo", country: cc })} compact /></div>
      </section>
      <section className="field-section home-alert-workspace" aria-labelledby="watchlist-heading">
        <div><p className="field-kicker">03 / ShelfSpring</p><h2 id="watchlist-heading" className="display mt-3 text-3xl sm:text-4xl">{F.alert}</h2><p className="mt-4 max-w-sm leading-relaxed text-ink-2">{F.alertNote}</p><p className="mt-5 max-w-sm text-sm text-ink-3">{F.nowNote}</p><Link href="/pricing" className="btn btn-ghost btn-sm mt-6">{t().chrome.footer.pricing} ↗</Link></div>
        <HomeAlertSetup catalog={catalog} start={start} next={next} />
      </section>
      <div className="field-section"><RelatedBlock title={F.browse}>{us ? <><BrowsePopular /><BrowseModels /></> : <><BrowseCountryPopular country={c} /><BrowseCountryModels country={c} /></>}</RelatedBlock></div>
      <div className="field-layout field-section"><div className="field-main"><RichFaq items={faq} facts={facts} title={H.questions} /></div><aside className="field-aside"><section className="pane p-5"><p className="field-kicker">{F.history}</p><h2 className="mt-2 text-xl font-semibold">{us ? "How long did the opportunity last?" : P.home.selloutH2(cc)}</h2><div className="mt-4"><SellOutTimes data={sell} label={us ? "at US Apple Stores" : P.home.selloutLabel(cc)} showStore={stores.length > 1} /></div></section></aside></div>
      <div className="field-section max-w-3xl"><SourceList sources={sources} facts={facts} /></div>
    </div>
  );
}

async function Board({ model, c }: { model: ModelKey; c: Country }) {
  const H = t().pages.home, lang = pageLocale().lang, N = namesFor(lang, c.cc), meta = modelByKey(model)!, cc = c.cc, p = prefixOf(cc);
  const [feed, counts, rows] = await Promise.all([restockFeed({ model, limit: 6, country: cc }), restockCounts({ model, country: cc }), stockByStore(model, {}, cc)]);
  const inStock = rows.filter((r) => r.availableParts.length > 0);
  const newest = rows.reduce<Date | null>((a, r) => r.lastCheckedAt && (!a || r.lastCheckedAt > a) ? r.lastCheckedAt : a, null);
  return <>
    <dl className="field-metrics"><div className="field-metric"><dt className="field-label">{H.storesWith(bidi(meta.short, lang))}</dt><dd className="field-value">{rows.length ? num(lang, inStock.length) : "—"}</dd></div><div className="field-metric"><dt className="field-label">{H.restocks24}</dt><dd className="field-value">{num(lang, counts.day)}</dd></div><div className="field-metric"><dt className="field-label">{H.lastCheck}</dt><dd className="field-value text-xl"><LiveChecked iso={newest} model={model} country={cc === "us" ? undefined : cc} /></dd></div></dl>
    {inStock.length > 0 && <div className="home-store-shortlist mt-5">{inStock.slice(0, 4).map((r) => { const s = STORE_INDEX.get(r.storeNumber); return s ? <Link key={r.storeNumber} href={productPath(productFor(model), storePlace(s))} className="field-row"><span><span className="block font-semibold">{N.store(s)}</span><span className="text-xs text-ink-3">{N.city(s.city)}</span></span><span className="font-mono text-sm">{num(lang, r.availableParts.length)} <span aria-hidden>↗</span></span></Link> : null; })}</div>}
    <h3 className="field-kicker mt-7 mb-3">{H.latest(bidi(meta.short, lang))}</h3><RestockFeed rows={feed} model={model} showModel={false} emptyText={H.none(bidi(meta.short, lang))} />
    <div className="mt-5 flex flex-wrap gap-2"><Link href={`${restocksPath(cc)}?model=${model}`} className="btn btn-ghost btn-sm">{H.allRestocks}</Link><a href={appleFamilyUrl(model, cc)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">{H.buy} ↗</a><Link href={`${p}/stock/${meta.slug}`} className="btn btn-ghost btn-sm">{H.liveStock(bidi(meta.short, lang))}</Link></div>
  </>;
}
