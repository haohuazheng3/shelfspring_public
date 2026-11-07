import { afterEach, describe, expect, it, vi } from "vitest";
import { CURATED_PAGES, curatedRecommendations, isCuratedPath, withCuratedMetadata } from "@/lib/seo/curation";
import { distanceMiles, storesOf } from "@/lib/apple/catalog";
import { localesOf } from "@/lib/i18n/locales";
import { publicRouteCheck } from "@/lib/seo/routes";
import { versionsOf } from "@/components/pages/shared";

afterEach(() => vi.unstubAllEnvs());

describe("stable publication selection", () => {
  it("has 323 distinct routes chosen by supported markets, comparisons and isolated locations", () => {
    expect(CURATED_PAGES).toHaveLength(323);
    expect(new Set(CURATED_PAGES.map((p) => p.path)).size).toBe(323);
    expect(CURATED_PAGES.reduce<Record<string, number>>((out, p) => { out[p.kind] = (out[p.kind] ?? 0) + 1; return out; }, {}))
      .toEqual({ country: 36, core: 11, model: 108, city: 65, guide: 11, "isolated-store": 62, region: 30 });
    for (const page of CURATED_PAGES) {
      expect(publicRouteCheck(page.path), page.path).toBeNull();
      if (page.kind === "city") expect(page.storeNumbers.length).toBeGreaterThan(1);
      if (page.kind === "region") expect(page.storeNumbers.length).toBeGreaterThanOrEqual(5);
      if (page.kind === "isolated-store") {
        const stores = storesOf(page.country!);
        const selected = stores.find((s) => s.storeNumber === page.storeNumbers[0])!;
        expect(selected).toBeDefined();
        for (const other of stores.filter((s) => s.storeNumber !== selected.storeNumber)) {
          expect(distanceMiles(selected.lat, selected.lng, other.lat, other.lng)).toBeGreaterThanOrEqual(100);
        }
      }
    }
  });

  it("keeps every selected location's existing language versions reciprocal", () => {
    for (const page of CURATED_PAGES.filter((p) => ["city", "region", "isolated-store"].includes(p.kind) && localesOf(p.country!).length > 1)) {
      const alternatives = versionsOf(page.path);
      expect(Object.values(alternatives), page.path).toContain(page.path);
      expect(Object.keys(alternatives)).toHaveLength(localesOf(page.country!).length);
      for (const path of Object.values(alternatives)) {
        expect(isCuratedPath(path), path).toBe(true);
        expect(versionsOf(path)).toEqual(alternatives);
      }
    }
  });
});

describe("index directives and canonical consistency", () => {
  it("keeps selected and unselected pages globally closed until production indexing is enabled", () => {
    for (const [flag, target, vercel] of [["0", "production", "production"], ["1", "preview", "production"], ["1", "production", "preview"]]) {
      vi.stubEnv("NEXT_PUBLIC_INDEXABLE", flag); vi.stubEnv("DEPLOY_TARGET", target); vi.stubEnv("VERCEL_ENV", vercel);
      for (const path of ["/stock/iphone-duo", "/iphone-duo-stock-checker"]) {
        expect(withCuratedMetadata(path, {}).robots).toEqual({ index: false, follow: false });
      }
    }
  });

  it("retains legacy pages as noindex follow with their own canonical and no excluded hreflang", () => {
    vi.stubEnv("NEXT_PUBLIC_INDEXABLE", "1"); vi.stubEnv("DEPLOY_TARGET", "production"); vi.stubEnv("VERCEL_ENV", "production");
    const selected = withCuratedMetadata("/stock/iphone-duo", { alternates: { languages: { "en-US": "/stock/iphone-duo", "en-GB": "/uk/stock/iphone-duo", "fr-FR": "/iphone-duo-stock-checker" } } });
    expect(selected.robots).toEqual({ index: true, follow: true });
    expect(selected.alternates?.languages).toEqual({ "en-US": "/stock/iphone-duo", "en-GB": "/uk/stock/iphone-duo" });
    const legacy = withCuratedMetadata("/iphone-duo-stock-checker", { alternates: { canonical: "/stock/iphone-duo", languages: { "en-US": "/stock/iphone-duo" } } });
    expect(legacy.robots).toEqual({ index: false, follow: true });
    expect(legacy.alternates?.canonical).toBe("/iphone-duo-stock-checker");
    expect(legacy.alternates?.languages).toBeUndefined();
    expect(publicRouteCheck("/iphone-duo-stock-checker")).toBeNull();
  });

  it("filters editorial recommendations without treating queries or external URLs as selected pages", () => {
    expect(curatedRecommendations([{ href: "/map" }, { href: "/map?model=duo" }, { href: "/iphone-duo-stock-checker" }, { href: "https://other.example/map" }, { href: "/de-de" }]))
      .toEqual([{ href: "/map" }, { href: "/de-de" }]);
    expect(() => withCuratedMetadata("//other.example/path", {})).toThrow();
    expect(() => withCuratedMetadata("/map?model=duo", {})).toThrow();
  });
});
