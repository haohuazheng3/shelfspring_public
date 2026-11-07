import type { MetadataRoute } from "next";
import { ALL_CODES } from "@/lib/apple/countries";
import { latestEventPerStore } from "@/lib/stock/queries";
import { CURATED_PAGES } from "@/lib/seo/curation";

/** One deterministic publication set; the other functional routes remain available with noindex. */
export const revalidate = 3600;
const CONTENT_REVIEWED_AT = new Date("2026-11-06T00:00:00Z");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://shelfspring.com";
  const latest = Object.assign({}, ...await Promise.all(ALL_CODES.map((cc) => latestEventPerStore(cc)))) as Record<string, string>;
  return CURATED_PAGES.map((page) => {
    const dates = page.storeNumbers.map((number) => Date.parse(latest[number] ?? "")).filter(Number.isFinite);
    // Missing evidence is not a new update. Static content uses its actual editorial review date.
    const lastModified = page.storeNumbers.length ? (dates.length ? new Date(Math.max(...dates)) : undefined) : page.updatedAt ? new Date(page.updatedAt) : CONTENT_REVIEWED_AT;
    return { url: `${base}${page.path === "/" ? "" : page.path}`, ...(lastModified ? { lastModified } : {}),
      changeFrequency: page.storeNumbers.length ? "hourly" : "monthly" };
  });
}
