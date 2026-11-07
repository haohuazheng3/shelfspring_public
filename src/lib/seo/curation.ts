/** A publication policy, not a traffic forecast. Functional routes outside this set remain available. */
import type { Metadata } from "next";
import { MODELS, citiesWithStores, distanceMiles, placeTarget, statesWithStores, storePath, storesOf } from "@/lib/apple/catalog";
import { ALL_CODES, prefixOf, type CountryCode } from "@/lib/apple/countries";
import { localesOf, pathInLocale } from "@/lib/i18n/locales";
import { publishedPosts, postPath } from "@/content/blog/catalog";
import { BLOG_PAGE_SIZE, blogPagePath } from "@/content/blog/pagination";

export type CuratedKind = "country" | "model" | "city" | "region" | "isolated-store" | "core" | "guide" | "journal" | "article";
export interface CuratedPage {
  path: string;
  kind: CuratedKind;
  purpose: string;
  country?: CountryCode;
  locale?: string;
  storeNumbers: string[];
  updatedAt?: string;
}

export const CURATED_GUIDES = [
  "/iphone-duo-restock-times",
  "/iphone-duo-sell-out-times",
  "/which-iphone-duo-restocks-most",
  "/apple-store-pickup-availability-explained",
  "/how-to-get-an-iphone-duo",
] as const;
export const CURATED_CORE = [
  "/stores", "/map", "/restocks", "/how-it-works", "/pricing", "/install",
  "/about", "/contact", "/privacy", "/terms", "/refunds",
] as const;

const PURPOSE: Record<CuratedKind, string> = {
  country: "Choose a pickup market and compare its supported phone models.",
  model: "Compare this model's actual configurations and pickup choices within one market.",
  city: "Compare two or more local pickup stores without changing the city.",
  region: "Compare a regional network of at least five stores across its existing distinct place page.",
  "isolated-store": "Check a store with no same-market alternative within 100 straight-line miles, or the market's only store.",
  core: "Use a primary tool or understand the service, price, contact and customer policies.",
  guide: "Interpret inventory evidence or prepare a pickup order, with distinct questions and explicit limitations.",
  journal: "Browse an existing collection of reviewed, published articles.",
  article: "Read a validated editorial article with publication dates and source context.",
};

function buildPages(): readonly CuratedPage[] {
  const pages: CuratedPage[] = [];
  for (const cc of ALL_CODES) {
    const stores = storesOf(cc);
    const add = (path: string, kind: CuratedKind, storeNumbers: string[]) => {
      for (const loc of localesOf(cc)) pages.push({ path: pathInLocale(path, loc), kind, purpose: PURPOSE[kind], country: cc, locale: loc.id, storeNumbers });
    };
    add(prefixOf(cc) || "/", "country", stores.map((s) => s.storeNumber));
    for (const model of MODELS) add(`${prefixOf(cc)}/stock/${model.slug}`, "model", stores.map((s) => s.storeNumber));
    for (const city of citiesWithStores(cc)) {
      const target = placeTarget(cc, city.stateSlug, city.slug);
      if (city.stores.length > 1 && target?.indexable) add(target.path, "city", target.stores.map((s) => s.storeNumber));
    }
    for (const region of statesWithStores(cc)) {
      const target = placeTarget(cc, region.slug);
      if (target?.indexable && target.stores.length >= 5) add(target.path, "region", target.stores.map((s) => s.storeNumber));
    }
    for (const store of stores) {
      // This is straight-line distance within the same country/catalog, never a driving-time promise.
      const nearest = Math.min(...stores.filter((other) => other.storeNumber !== store.storeNumber)
        .map((other) => distanceMiles(store.lat, store.lng, other.lat, other.lng)));
      if (stores.length === 1 || nearest >= 100) add(storePath(store), "isolated-store", [store.storeNumber]);
    }
  }
  for (const path of CURATED_CORE) pages.push({ path, kind: "core", purpose: PURPOSE.core,
    storeNumbers: ["/stores", "/map", "/restocks"].includes(path) ? storesOf("us").map((s) => s.storeNumber) : [] });
  for (const path of CURATED_GUIDES) pages.push({ path, kind: "guide", purpose: PURPOSE.guide, storeNumbers: storesOf("us").map((s) => s.storeNumber) });
  // Entry in the validated publication registry is the deliberate editorial action. Empty collections
  // stay noindex; real articles and nonempty pagination become eligible without a second hidden list.
  const posts = publishedPosts();
  if (posts.length) {
    pages.push({ path: "/blog", kind: "journal", purpose: PURPOSE.journal, storeNumbers: [], updatedAt: posts.map((p) => p.updatedAt).sort().at(-1) });
    for (const category of new Set(posts.map((p) => p.category))) {
      const members = posts.filter((p) => p.category === category);
      for (let page = 1; page <= Math.ceil(members.length / BLOG_PAGE_SIZE); page++) {
        pages.push({ path: blogPagePath(category, page), kind: "journal", purpose: PURPOSE.journal, storeNumbers: [], updatedAt: members.map((p) => p.updatedAt).sort().at(-1) });
      }
    }
    for (const post of posts) pages.push({ path: postPath(post), kind: "article", purpose: PURPOSE.article, storeNumbers: [], updatedAt: post.updatedAt });
  }
  return pages.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
}

export const CURATED_PAGES = buildPages();
const PATHS = new Set(CURATED_PAGES.map((page) => page.path));

/** Preview remains closed even if a public flag is accidentally set. */
export function publicIndexingEnabled(): boolean {
  return process.env.NEXT_PUBLIC_INDEXABLE === "1" && process.env.DEPLOY_TARGET !== "preview" && process.env.VERCEL_ENV !== "preview";
}

function cleanPath(value: string): string | null {
  if (!value.startsWith("/") || value.startsWith("//") || /[?#\\\s]/.test(value)) return null;
  return value === "/" ? "/" : value.replace(/\/$/, "");
}

export function isCuratedPath(path: string): boolean {
  const clean = cleanPath(path);
  return clean !== null && PATHS.has(clean);
}

/** For editorial recommendations only. Functional filters, store navigation and breadcrumbs stay usable. */
export function curatedRecommendations<T extends { href: string }>(links: readonly T[]): T[] {
  return links.filter((link) => isCuratedPath(link.href));
}

/** Retain explicit language versions only when both pages are in the publication set. */
export function curatedLanguages(languages: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(languages).filter(([, path]) => isCuratedPath(path)));
}

/** Called by page metadata functions; does not read cookies, headers, a database or current inventory. */
export function withCuratedMetadata(path: string, metadata: Metadata): Metadata {
  const canonical = cleanPath(path);
  if (!canonical) throw new Error("Curated metadata requires a canonical path without query or fragment");
  const enabled = publicIndexingEnabled();
  const selected = isCuratedPath(canonical);
  const previous = typeof metadata.robots === "object" && metadata.robots ? metadata.robots : {};
  const languages = selected && metadata.alternates?.languages
    ? Object.fromEntries(Object.entries(metadata.alternates.languages).filter(([, target]) => typeof target === "string" && isCuratedPath(target)))
    : {};
  return {
    ...metadata,
    alternates: { ...metadata.alternates, canonical, languages: Object.keys(languages).length ? languages : undefined },
    robots: { ...previous, index: enabled && selected, follow: enabled,
      ...(previous.googleBot && typeof previous.googleBot === "object" ? { googleBot: { ...previous.googleBot, index: enabled && selected, follow: enabled } } : {}) },
  };
}
