import { PendingLink as Link } from "@/components/ui/PendingLink";
import { MODELS, DEFAULT_MODEL } from "@/lib/apple/catalog";
import { stateRefs, topStates, topCities, cityLabel } from "@/lib/seo/links";
import { t, pageLocale } from "@/lib/i18n/server";
import { localizePath } from "@/lib/i18n/locales";
import { curatedRecommendations } from "@/lib/seo/curation";
import { LinkRow, TierRow, type RelatedLink } from "./Related";

/** Every state as a chip — postal code, name, store count (current one highlighted) — then the way to the directory. */
export function BrowseStates({ current, title }: { current?: string; title?: string }) {
  const d = t().chrome.browse;
  return (
    <div>
      <div className="eyebrow">{title ?? d.states}</div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {stateRefs().map((s) => <Link key={s.slug} href={s.href} className="chip px-3 py-1.5 text-xs" data-on={s.name === current}><span className="me-1 font-mono text-[10px] text-ink-3">{s.code}</span>{s.name}<span className="text-ink-3"> · {s.count}</span></Link>)}
        <Link href="/stores" className="ms-1 text-xs text-ink-3 underline-offset-4 hover:text-ink hover:underline">{d.directory} <span className="inline-block rtl:-scale-x-100" aria-hidden="true">→</span></Link>
      </div>
    </div>
  );
}

/** One pair per model — its store-by-store page and its return log — then the Duo on the shelf map. */
export function BrowseModels({ current, title }: { current?: string; title?: string }) {
  const d = t().chrome.browse;
  return (
    <LinkRow
      title={title ?? d.models}
      links={[
        ...MODELS.flatMap((m) => [
          { href: `/stock/${m.slug}`, label: d.modelStores(m.name), meta: m.key === current ? d.here : undefined },
          { href: `/restocks?model=${m.key}`, label: d.modelReturns(m.short) },
        ]),
        { href: `/map?model=${DEFAULT_MODEL}`, label: d.duoMap },
      ]}
    />
  );
}

/**
 * The broad entry points (home page, store directory): the states with the most stores, listed A–Z with their
 * counts, then the biggest cities grouped under how many stores each has.
 */
export function BrowsePopular({ states = 10, cities = 12 }: { states?: number; cities?: number }) {
  const d = t().chrome.browse;
  const lang = pageLocale().lang;
  const big = topStates(states).sort((a, b) => a.name.localeCompare(b.name, "en"));
  const towns: (RelatedLink & { count: number })[] = curatedRecommendations(topCities(cities).map((c) => ({ href: localizePath(c.href, lang), label: cityLabel(c), count: c.count })));
  return (
    <div className="space-y-5">
      <LinkRow curated title={d.largest} links={big.map((s) => ({ href: s.href, label: s.name, meta: String(s.count) }))} more={{ href: "/stores", label: d.directory }} />
      <TierRow title={d.citiesByCount} items={towns} tier={d.tier} lang={lang} />
    </div>
  );
}
