import { FieldCoverage,fieldGuideCopy,fieldGuideQuestions,FieldIntro,FieldMethod,FieldSection } from "@/components/seo/FieldGuide";
import { DuoLedger } from "@/components/stock/DuoLedger";
/** Another country's store index (/{cc}/stores): the live first screen plus every store in one matrix, then where they are, the keyword sections, charts, FAQ and sources. */
import { AlertPanelFor } from "@/components/alerts/AlertPanelServer";
import { SourceList } from "@/components/content/RichFaq";
import { DailyBars } from "@/components/restocks/DailyBars";
import { RestockClock } from "@/components/restocks/RestockClock";
import { SellOutTimes } from "@/components/restocks/SellOutTimes";
import { BrowseCountryModels,BrowseCountryPopular } from "@/components/seo/CountryBrowse";
import { Faq } from "@/components/seo/Faq";
import { JsonLd } from "@/components/seo/JsonLd";
import { ModelPlaceCards } from "@/components/seo/ModelPlaceCards";
import { Breadcrumbs,LinkRow,RelatedBlock } from "@/components/seo/Related";
import { ModelStoreMatrix } from "@/components/stores/ModelStoreMatrix";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { citiesWithStores,cityPath,DEFAULT_MODEL,mapPath,placeTarget,restocksPath,statePath,statesWithStores,storePath,storesOf } from "@/lib/apple/catalog";
import { prefixOf,theName,type Country } from "@/lib/apple/countries";
import { emptyFacts } from "@/lib/content/facts";
import { pathInLocale } from "@/lib/i18n/locales";
import { appleStoreLabel,cityLabel,countryLabel,regionLabel,storeLabel } from "@/lib/i18n/places";
import { t as dictT,pageLocale } from "@/lib/i18n/server";
import { topRegions } from "@/lib/seo/countryLinks";
import { alertHref, itemListJsonLd, peakOf } from "@/lib/seo/enrich";
import { treeOf } from "@/lib/seo/tree";
import { permanentRedirect } from "next/navigation";
import { loadIndex } from "./StoresIndexPage";

export async function IntlStoresIndexPage({ country: c }: { country: Country }) {
  const t = placeTarget(c.cc);
  // A one-store country: its store page is the index (the proxy 308s; this is the backstop).
  if (t && !t.indexable) permanentRedirect(t.path);
  return <IntlStoresIndex c={c} />;
}

/** Another country's index: the same live first screen plus every store in one matrix (no country has more than 39). */
async function IntlStoresIndex({ c }: { c: Country }) {
  const cc = c.cc;
  const loc = pageLocale();
  const lang = loc.lang;
  const D = dictT();
  const P = D.place;
  const V = D.views.storesIndex;
  const C = D.views.common;
  const stores = storesOf(cc);
  const d = await loadIndex(cc);
  const regions = statesWithStores(cc);
  const cities = citiesWithStores(cc);
  const hasRegions = Boolean(c.regionNoun) && regions.length > 1;
  const alert = alertHref({ model: DEFAULT_MODEL, country: cc });
  // The country as a place name in the page's language ("the UK"; native: Intl's name).
  const where = lang === "en" ? theName(c) : countryLabel(cc, lang);
  const short = lang === "en" ? c.short : countryLabel(cc, lang);
  const tops = (hasRegions ? topRegions(cc, 10) : []).map((r) => ({ ...r, name: regionLabel(cc, r.name, lang) }));
  const countQ = { a: V.countAnswer(stores.length, P.spreadPhrase(cc), tops) };
  const questions = [...fieldGuideQuestions({place:where,stores:stores.length,kind:"country",lang}),P.taxFaq(cc,where)];
  const facts = emptyFacts(cc);
  const W = D.modules.duoLedger;
  const peakAll = peakOf(d.stats, lang);
  const ld = itemListJsonLd(C.appleStoresIn(c), stores);
  // A native version lists its own store pages, by the names Apple uses in that language.
  const itemList = loc.native ? { ...ld, itemListElement: stores.map((x, i) => ({ "@type": "ListItem", position: i + 1, name: appleStoreLabel(x, lang), url: `https://shelfspring.com${pathInLocale(storePath(x), loc)}` })) } : ld;
  const F=fieldGuideCopy(lang);
  return (
    <div className="field-page">
      <JsonLd data={itemList} />
      <Breadcrumbs items={[{href:prefixOf(cc),label:short},{label:V.crumb}]} />
      <FieldIntro title={lang === "en" ? `${short}: choose a pickup stop` : `${short} · ${F.next}`} description={lang === "en" ? `Plan around the places you can reach, not a countrywide stock headline. Start with the ${stores.length} Apple Stores in this directory, then compare the exact configuration and observation time before opening Apple's checkout.` : F.lead}
        actions={<><Link href={`${mapPath(cc)}?model=${DEFAULT_MODEL}`} className="btn btn-primary btn-sm">{C.liveMap}</Link><Link href={alert} className="btn btn-ghost btn-sm">{C.alertMe}</Link></>}><FieldCoverage stores={stores} stock={d.stock} /></FieldIntro>
      <div className="pt-8"><DuoLedger d={d.ledger} place={where} stores={stores} country={cc} hourHref={`${prefixOf(cc)}/iphone-duo-restock-times`} watchHref={alert} /></div>
      <div className="field-layout">
        <div className="field-main">
          <FieldSection id="places" title={hasRegions ? V.locationsBy(c) : V.locationsIn(c)} caption={F.next}>
            <div className="field-index">{(hasRegions ? regions : [{name:where,slug:"",count:stores.length,code:""}]).map(s=> {
              const mine=hasRegions ? cities.filter(x=>x.state===s.name) : cities;
              const own=hasRegions ? stores.filter(x=>x.state===s.name) : stores;
              return <article key={s.slug||"all"} className="border-t border-line py-4"><h3 className="text-xl font-semibold">{hasRegions ? <Link href={statePath(s.name,cc)}>{regionLabel(cc,s.name,lang)} ↗</Link> : countryLabel(cc,lang)}</h3><p className="mt-2 text-sm text-ink-3">{V.storeCount(s.count)}</p><div className="mt-3 flex flex-wrap gap-x-3 gap-y-2 text-sm">{mine.length>1||!hasRegions ? mine.map(x=><Link key={x.slug} href={cityPath(x.state,x.name,cc)} className="underline-offset-4 hover:underline">{cityLabel(cc,x.name,lang)} <span className="font-mono text-xs text-ink-3">{x.stores.length}</span></Link>) : own.map(x=><Link key={x.storeNumber} href={storePath(x)} className="underline-offset-4 hover:underline">{storeLabel(x,lang)}</Link>)}</div></article>;
            })}</div>
          </FieldSection>
          <FieldSection id="models" title={V.matrixH2(c)}><ModelPlaceCards place={treeOf(cc).root} stockNow={d.stockNow} of={stores.length} unit={C.storesWithIt} /></FieldSection>
          <FieldSection id="compare" title={F.compare}><div className="pane p-4 sm:p-6"><ModelStoreMatrix stores={[...stores].sort((a,b)=>a.city.localeCompare(b.city)||a.name.localeCompare(b.name))} stock={d.stock} /></div></FieldSection>
          <FieldSection id="calendar" title={C.lastDays(d.pstats.days)} caption={F.evidence}><DailyBars stats={d.pstats} label={C.inCountry(c)} /></FieldSection>
          <FieldSection id="timing" title={D.pages.common.duoHours(where)}><RestockClock stats={d.duoClock} label={C.inCountry(c)} reports={d.duoReports} /><p className="mt-3 text-xs text-ink-3">{W.allModels({ n: d.pstats.month, days: d.pstats.days, peak: peakAll ? peakAll.hour : null })}</p></FieldSection>
          <FieldSection id="duration" title={V.howFast(c)}><SellOutTimes data={d.sell} label={C.inCountry(c)} showStore /></FieldSection>
        </div>
        <aside className="field-aside space-y-6"><FieldMethod /><AlertPanelFor href={alert} summary={V.panel(c)} country={cc} /><section className="field-callout"><h2 className="text-xl font-semibold">{V.howMany(c)}</h2><p className="mt-3 text-sm leading-relaxed text-ink-2">{countQ.a}</p></section><SourceList sources={[D.place.sources(cc as Exclude<typeof cc,"us">).storeList,D.place.sources(cc as Exclude<typeof cc,"us">).pickupHelp,D.place.sources(cc as Exclude<typeof cc,"us">).tax]} facts={facts} where={C.sourcesWhere(stores.length,c)} since={C.since} /></aside>
      </div>
      <div className="field-section"><Faq items={questions} title={V.faqTitle(c)} /></div>

      <RelatedBlock title={lang === "en" ? "Elsewhere in the ledger" : undefined}>
        <LinkRow title={C.more} links={[{ href: restocksPath(cc), label: C.restockLog }, { href: mapPath(cc), label: C.liveMap }, { href: prefixOf(cc), label: C.checker(c) }, { href: "/how-it-works", label: V.howItWorks }, { href: "/install", label: V.getApp }, { href: "/pricing", label: V.pricing }, ...(loc.native ? [{ href: `${prefixOf(cc)}/iphone-duo-restock-times`, label: dictT().place.home.restockTimesChip }] : [])]} />
        <BrowseCountryPopular country={c} />
        <BrowseCountryModels country={c} />
      </RelatedBlock>
    </div>
  );
}
