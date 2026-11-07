/** The restock log of a country (/restocks, /{cc}/restocks): filter by model, region and sold-outs; paged; times in the reader's zone. */
import type { Metadata } from "next";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { MODELS, DEFAULT_MODEL, modelByKey, statesWithStores, storesOf, mapPath, restocksPath, type ModelKey } from "@/lib/apple/catalog";
import { prefixOf, type Country } from "@/lib/apple/countries";
import { restockFeed, restockCounts } from "@/lib/stock/queries";
import { RestockFeed } from "@/components/restocks/RestockFeed";
import { RestockFilters } from "@/components/restocks/RestockFilters";
import { BrowseModels, BrowseStates } from "@/components/seo/Browse";
import { BrowseCountryModels, BrowseCountryPopular, BrowseCountryRegions } from "@/components/seo/CountryBrowse";
import { LinkRow, RelatedBlock } from "@/components/seo/Related";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG_ID } from "@/lib/seo/siteLd";
import { englishLocale, pathInLocale, type Locale } from "@/lib/i18n/locales";
import { dict } from "@/lib/i18n/dict";
import { pageLocale, t } from "@/lib/i18n/server";
import { countryLabel, regionLabel as regionName } from "@/lib/i18n/places";
import { fieldCopy } from "@/content/field-guide";
import { withCuratedMetadata } from "@/lib/seo/curation";
import "./Workspace.css";

const LIMIT = 50;

export function restocksMetadata(c: Country, loc: Locale = englishLocale(c.cc)): Metadata {
  if (c.cc === "us") {
    return withCuratedMetadata("/restocks", {
      title: "The Restock Journal: iPhone Pickup Changes",
      description: "Follow recorded pickup changes by store and exact iPhone configuration. Filter recent returns and sold-out listings, then compare the present status.",
      alternates: { canonical: "/restocks" },
    });
  }
  const V = dict(loc.lang).views.restocks;
  const n = storesOf(c.cc).length;
  return withCuratedMetadata(loc.native ? pathInLocale(restocksPath(c.cc), loc) : restocksPath(c.cc), {
    title: V.metaTitle(c, n),
    description: V.metaDescription(c, n),
    alternates: { canonical: loc.native ? pathInLocale(restocksPath(c.cc), loc) : restocksPath(c.cc) },
  });
}

export async function RestocksPage({ country: c, searchParams: sp }: { country: Country; searchParams: Record<string, string | string[] | undefined> }) {
  const cc = c.cc;
  const us = cc === "us";
  const loc = pageLocale();
  const lang = loc.lang;
  const F = fieldCopy(lang);
  const D = t().views;
  const V = D.restocks;
  const modelParam = typeof sp.model === "string" ? sp.model : DEFAULT_MODEL;
  const model: ModelKey | undefined = modelParam === "all" ? undefined : modelByKey(modelParam) ? (modelParam as ModelKey) : DEFAULT_MODEL;
  const states = statesWithStores(cc);
  const state = typeof sp.state === "string" ? states.find((s) => s.slug === sp.state)?.name : undefined;
  const kind = sp.kind === "all" ? "all" : "restock";
  const page = Number(sp.page ?? 0) || 0;
  const [rows, counts] = await Promise.all([restockFeed({ model, state, kind, limit: LIMIT, page, country: cc }), restockCounts({ model, state, country: cc })]);
  const self = restocksPath(cc);
  const base = (over: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    const v = { model: model ?? "all", state: state ? states.find((s) => s.name === state)?.slug : undefined, kind: kind === "all" ? "all" : undefined, ...over };
    for (const [k, val] of Object.entries(v)) if (val) q.set(k, val);
    return `${self}?${q.toString()}`;
  };
  // The log as a dataset (answer engines and dataset search): what is recorded, where, since when, by whom.
  const url = `https://shelfspring.com${loc.native ? pathInLocale(self, loc) : self}`;
  const dataset = {
    "@context": "https://schema.org", "@type": "Dataset", "@id": `${url}#dataset`, url,
    name: us ? "US Apple Store iPhone pickup restock log" : V.datasetName(c),
    description: V.datasetDescription(c),
    publisher: { "@id": ORG_ID }, isAccessibleForFree: true, temporalCoverage: `${us ? "2026-10-29" : "2026-11-02"}/..`,
    spatialCoverage: us ? "United States" : countryLabel(cc, lang), variableMeasured: V.datasetMeasured,
    ...(loc.native ? { inLanguage: loc.tag } : {}),
  };
  return (
    <div className="field-page">
      <JsonLd data={dataset} />
      <section className="field-intro">
        <div><p className="field-kicker">{F.guide} / {countryLabel(cc, lang)}</p><h1 className="field-title">{us ? "The restock journal." : V.h1(c)}</h1><p className="field-lead">{F.historyNote}</p></div>
        <div className="field-callout"><p className="field-kicker">{F.history}</p><p className="mt-4 text-lg leading-relaxed">{V.summary(counts.day, counts.week, model ? modelByKey(model)!.name : undefined, state ? regionName(cc, state, lang) : undefined)}</p></div>
      </section>
      <div className="field-layout">
      <section className="field-main pane p-5 sm:p-7" aria-label={F.history}>
      <RestockFilters action={loc.native ? pathInLocale(self, loc) : self}
        initial={{ model: model ?? "all", state: state ? states.find((s) => s.name === state)?.slug ?? "" : "", kind }}
        models={MODELS.map(({ key, name }) => ({ key, name }))}
        states={states.map((s) => ({ slug: s.slug, label: regionName(cc, s.name, lang) }))}
        labels={{ allModels: V.allModels, restocks: V.restocks, withSoldOut: V.withSoldOut,
          region: us ? "State" : V.regionLabel(c), allRegions: us ? "All states" : V.allRegions(c), filter: V.filter }}>
        <RestockFeed rows={rows} model={model} showModel={!model} />
        <div className="mt-3 flex items-center justify-between text-xs text-ink-3">
          <span>{V.page(page + 1)}</span>
          <span className="flex gap-2">{page > 0 && <Link className="chip px-3 py-1" href={base({ page: String(page - 1) })}>{V.newer}</Link>}{rows.length >= LIMIT && <Link className="chip px-3 py-1" href={base({ page: String(page + 1) })}>{V.older}</Link>}</span>
        </div>
      </RestockFilters>
      </section>
      <aside className="field-aside field-callout">
        <p className="field-kicker">{F.method}</p><h2 className="mt-3 text-xl font-semibold">{F.current}</h2><p className="mt-3 text-sm leading-relaxed text-ink-2">{F.nowNote}</p><h2 className="mt-6 text-xl font-semibold">{F.alert}</h2><p className="mt-3 text-sm leading-relaxed text-ink-2">{F.alertNote}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href={`${mapPath(cc)}${model ? `?model=${model}` : ""}`} className="btn btn-ghost btn-sm">{D.common.liveMap}</Link>
        <Link href={`${prefixOf(cc) || "/"}?model=${model ?? DEFAULT_MODEL}#notify`} className="btn btn-primary btn-sm">{V.getAlerts}</Link>
      </div>
      </aside>
      </div>
      <RelatedBlock title={V.byPlace}>
        {us ? <BrowseStates current={state} title="By state" /> : states.length > 1 ? <BrowseCountryRegions country={c} current={state} title={V.byRegion(c)} /> : <BrowseCountryPopular country={c} />}
        {us ? <BrowseModels current={model} /> : <BrowseCountryModels country={c} current={model} />}
        {loc.native && <LinkRow title={D.common.more} links={[{ href: `${prefixOf(cc)}/iphone-duo-restock-times`, label: t().place.home.restockTimesChip }]} />}
      </RelatedBlock>
    </div>
  );
}
