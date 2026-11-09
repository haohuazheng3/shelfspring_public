/** Small pieces every country's page template shares. */
import { MODELS, placeTarget, storesIndexPath } from "@/lib/apple/catalog";
import { ALL_CODES, prefixOf, type CountryCode } from "@/lib/apple/countries";
import { englishPath, localeFromSegment, localesOf, pathInLocale, type Locale } from "@/lib/i18n/locales";
import { curatedLanguages, isCuratedPath } from "@/lib/seo/curation";

/** When other countries' stores began to be tracked (the sources line of their pages). */
export const INTL_TRACKING_LABEL = "November 2, 2026";

export type EquivalentPage = "home" | "stores" | "restock-times" | { model: string };

/** The path of one page type in a country, or null where that country has no such page (Austria's store index is its store). */
export function equivalentPath(cc: CountryCode, page: EquivalentPage): string | null {
  if (page === "home") return prefixOf(cc) || "/";
  if (page === "stores") return placeTarget(cc)?.indexable ? storesIndexPath(cc) : null;
  if (page === "restock-times") return `${prefixOf(cc)}/iphone-duo-restock-times`;
  return MODELS.some((m) => m.slug === page.model) ? `${prefixOf(cc)}/stock/${page.model}` : null;
}

/** Reciprocal language/market alternatives contain only selected pages, in every supported language. */
export function hreflangFor(page: EquivalentPage, loc?: Locale): Record<string, string> {
  const out: Record<string, string> = {};
  const own = loc ? equivalentPath(loc.cc, page) : null;
  if (loc && (!own || !isCuratedPath(pathInLocale(own, loc)))) return out;
  for (const cc of ALL_CODES) {
    const p = equivalentPath(cc, page);
    if (p) for (const version of localesOf(cc)) {
      const path = pathInLocale(p, version);
      if (isCuratedPath(path)) out[version.tag] = path;
    }
  }
  const fallback = equivalentPath("us", page);
  if (fallback && isCuratedPath(fallback)) out["x-default"] = fallback;
  return out;
}

/** Selected local pages point reciprocally to their own country's language versions. */
export function versionsOf(path: string): Record<string, string> {
  if (!isCuratedPath(path)) return {};
  const seg = path.split(/[?#]/)[0].split("/")[1];
  const loc = localeFromSegment(seg);
  if (!loc) return {};
  const versions = localesOf(loc.cc);
  if (versions.length < 2) return {};
  const en = englishPath(path);
  return curatedLanguages(Object.fromEntries(versions.map((l) => [l.tag, pathInLocale(en, l)])));
}

/** canonical (this version's own URL) + hreflang (versionsOf) for a page given in its English form. */
export function alternatesIn(path: string, loc: Locale, languages?: Record<string, string>): { canonical: string; languages?: Record<string, string> } {
  const own = pathInLocale(path, loc);
  const langs = isCuratedPath(own) ? curatedLanguages(languages ?? versionsOf(own)) : {};
  return Object.keys(langs).length ? { canonical: own, languages: langs } : { canonical: own };
}

/** A one-hour slot on the 24-hour clock ("09–10"), the restock-time tables' own format; sentences keep the 12-hour wording. */
export const slot24 = (h: number) => `${String(h).padStart(2, "0")}–${String((h + 1) % 24).padStart(2, "0")}`;
