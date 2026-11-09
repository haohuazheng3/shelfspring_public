/** "Where to look next" rows for another country's pages: its models, regions and cities, never another country's stores. */
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { bidi, plural } from "@/lib/i18n/format";
import { MODELS, DEFAULT_MODEL, mapPath, restocksPath, placeTarget } from "@/lib/apple/catalog";
import { prefixOf, type Country } from "@/lib/apple/countries";
import { regionRefs, topCities, topRegions, regionWord } from "@/lib/seo/countryLinks";
import { t, pageLocale } from "@/lib/i18n/server";
import { localizePath } from "@/lib/i18n/locales";
import { curatedRecommendations } from "@/lib/seo/curation";
import { cityLabel, countryLabel, regionLabel } from "@/lib/i18n/places";
import { LinkRow, TierRow } from "./Related";

/** One pair per model — its store-by-store page and the country's return log for it — then the Duo on the map. */
export function BrowseCountryModels({ country: c, current, title }: { country: Country; current?: string; title?: string }) {
  const d = t().chrome.browse;
  const p = prefixOf(c.cc);
  const lang = pageLocale().lang;
  return (
    <LinkRow
      title={title ?? d.models}
      links={[
        ...MODELS.flatMap((m) => [
          { href: `${p}/stock/${m.slug}`, label: d.modelStores(m.name), meta: m.key === current ? d.here : undefined },
          { href: `${restocksPath(c.cc)}?model=${m.key}`, label: d.modelReturns(bidi(m.short, lang)) },
        ]),
        { href: `${mapPath(c.cc)}?model=${DEFAULT_MODEL}`, label: d.duoMap },
      ]}
    />
  );
}

/**
 * Every region of the country, grouped under its store count (biggest group first; the current one highlighted),
 * then the way to the country's directory. Nothing where the country has a single region.
 */
export function BrowseCountryRegions({ country: c, current, title }: { country: Country; current?: string; title?: string }) {
  const d = t().chrome.browse;
  const lang = pageLocale().lang;
  const regions = regionRefs(c.cc);
  if (regions.length < 2) return null;
  const index = placeTarget(c.cc);
  const counts = [...new Set(regions.map((r) => r.count))].sort((a, b) => b - a);
  return (
    <div>
      <div className="eyebrow">{title ?? d.regions(regionWord(c.cc, false, false, lang))}</div>
      <dl className="mt-2 space-y-1.5">
        {counts.map((n) => (
          <div key={n} className="flex flex-wrap items-center gap-1.5">
            <dt className="me-1 min-w-16 text-xs font-medium tabular-nums text-ink-3">{plural(lang, n, d.tier)}</dt>
            {regions.filter((r) => r.count === n).map((r) => {
              const name = regionLabel(c.cc, r.name, lang);
              return <dd key={r.slug}><Link href={r.href} className="chip px-3 py-1.5 text-xs" data-on={r.name === current || name === current}>{name}</Link></dd>;
            })}
          </div>
        ))}
      </dl>
      {index?.indexable && <Link href={index.path} className="mt-2 inline-block text-xs text-ink-3 underline-offset-4 hover:text-ink hover:underline">{d.directoryIn({ inName: c.inName, country: countryLabel(c.cc, lang) })} <span className="inline-block rtl:-scale-x-100" aria-hidden="true">→</span></Link>}
    </div>
  );
}

/** The country's biggest regions (A–Z, with their counts) and its biggest cities, grouped under their store count. */
export function BrowseCountryPopular({ country: c, regions = 10, cities = 12 }: { country: Country; regions?: number; cities?: number }) {
  const d = t().chrome.browse;
  const lang = pageLocale().lang;
  const index = placeTarget(c.cc);
  const rs = regionRefs(c.cc).length > 1 ? topRegions(c.cc, regions).map((r) => ({ ...r, label: regionLabel(c.cc, r.name, lang) })).sort((a, b) => a.label.localeCompare(b.label, lang)) : [];
  const towns = curatedRecommendations(topCities(c.cc, cities).map((x) => ({ href: localizePath(x.href, lang), label: cityLabel(c.cc, x.name, lang), count: x.count })));
  return (
    <div className="space-y-5">
      {rs.length > 0 && <LinkRow curated title={d.largest} links={rs.map((r) => ({ href: r.href, label: r.label, meta: String(r.count) }))} more={index?.indexable ? { href: index.path, label: d.allRegions(regionWord(c.cc, true, false, lang)) } : undefined} />}
      <TierRow title={rs.length ? d.citiesByCount : d.cities} items={towns} tier={d.tier} lang={lang} />
    </div>
  );
}
