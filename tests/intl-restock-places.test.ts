/**
 * The region and city restock-times pages of the other 18 countries (/{cc}/iphone-duo-restock-times/{region}[/{city}]):
 * which places get one, where the others 308, restockTimesPath for every country, and the publication policy (they stay
 * outside the curated set, like every other functional route).
 */
import { describe, expect, it } from "vitest";
import { citiesWithStores, placeTarget, statesWithStores, storePath, storesOf } from "@/lib/apple/catalog";
import { INTL_CODES, type CountryCode } from "@/lib/apple/countries";
import { restockTimesPath } from "@/lib/content/restockTimes";
import { intlRestockTimesPath, restockPlacePages, restockPlaceTarget } from "@/lib/content/restockPlaces";
import { isCuratedPath } from "@/lib/seo/curation";
import { publicRouteCheck } from "@/lib/seo/routes";

const COUNTS: Record<Exclude<CountryCode, "us">, [number, number]> = {
  ca: [4, 4], uk: [6, 3], au: [4, 0], de: [3, 4], fr: [3, 2], it: [4, 1], es: [1, 2], jp: [0, 2], kr: [0, 1],
  hk: [0, 0], sg: [0, 0], ae: [1, 2], ch: [1, 0], nl: [1, 0], se: [0, 0], tw: [0, 0], at: [0, 0], be: [0, 0],
};

describe("which places get a restock-times page (the /stores rule: one page per place)", () => {
  it("counts regions and cities per country", () => {
    const got = Object.fromEntries(INTL_CODES.map((cc) => { const p = restockPlacePages(cc); return [cc, [p.regions.length, p.cities.length]]; }));
    expect(got).toEqual(COUNTS);
  });
  it("gives a place a page exactly where its /stores page is its own, and keeps it out of the curated set", () => {
    for (const cc of INTL_CODES) {
      const pages = restockPlacePages(cc);
      const own = new Set([...pages.regions, ...pages.cities].map((p) => p.path));
      for (const r of statesWithStores(cc)) {
        const t = placeTarget(cc, r.slug)!;
        expect(own.has(`/${cc}/iphone-duo-restock-times/${r.slug}`), `${cc} ${r.slug}`).toBe(t.indexable);
      }
      for (const c of citiesWithStores(cc)) {
        const t = placeTarget(cc, c.stateSlug, c.slug)!;
        expect(own.has(`/${cc}/iphone-duo-restock-times/${c.stateSlug}/${c.slug}`), `${cc} ${c.slug}`).toBe(t.indexable);
        if (t.indexable) expect(c.stores.length).toBeGreaterThan(1);
      }
      for (const p of [...pages.regions, ...pages.cities]) {
        expect(publicRouteCheck(p.path), p.path).toBeNull();
        expect(p.storesPath).toBe(p.path.replace("/iphone-duo-restock-times/", "/stores/"));
        expect(isCuratedPath(p.path), p.path).toBe(false);
      }
    }
  });
  it("308s every place without a page to its store, its city's page or the country's page", () => {
    for (const cc of INTL_CODES) {
      for (const r of statesWithStores(cc)) {
        const res = restockPlaceTarget(cc, r.slug)!;
        if ("page" in res) continue;
        const here = storesOf(cc).filter((s) => s.state === r.name);
        if (here.length === 1) expect(res.redirect).toBe(storePath(here[0]));
        else if (here.length === storesOf(cc).length) expect(res.redirect).toBe(`/${cc}/iphone-duo-restock-times`);
        else expect(res.redirect).toBe(`/${cc}/iphone-duo-restock-times/${r.slug}/${citiesWithStores(cc).find((c) => c.state === r.name)!.slug}`);
        expect(publicRouteCheck(`/${cc}/iphone-duo-restock-times/${r.slug}`)).toEqual({ redirect: res.redirect });
      }
      for (const c of citiesWithStores(cc).filter((x) => x.stores.length === 1)) {
        expect(publicRouteCheck(`/${cc}/iphone-duo-restock-times/${c.stateSlug}/${c.slug}`)).toEqual({ redirect: storePath(c.stores[0]) });
      }
    }
    expect(restockPlaceTarget("uk", "atlantis")).toBeNull();
    expect(restockPlaceTarget("uk", "greater-london", "nowhere")).toBeNull();
    expect(publicRouteCheck("/uk/iphone-duo-restock-times/atlantis")).toEqual({ notFound: true });
    expect(publicRouteCheck("/uk/iphone-duo-restock-times/greater-london/london/extra")).toEqual({ notFound: true });
    // The native versions resolve the same way.
    expect(publicRouteCheck("/ja-jp/iphone-duo-restock-times/tokyo/tokyo")).toBeNull();
    expect(publicRouteCheck("/ja-jp/iphone-duo-restock-times/narnia")).toEqual({ notFound: true });
  });
});

describe("restockTimesPath for every country", () => {
  it("is unchanged for the US", () => {
    expect(restockTimesPath("California")).toBe("/iphone-duo-restock-times/california");
    expect(restockTimesPath("Hawaii")).toBe("/iphone-duo-restock-times/hawaii/honolulu");
  });
  it("names the place's page, or the page it collapses into, everywhere else", () => {
    expect(restockTimesPath("Greater London", undefined, "uk")).toBe("/uk/iphone-duo-restock-times/greater-london");
    expect(restockTimesPath("Greater London", "London", "uk")).toBe("/uk/iphone-duo-restock-times/greater-london/london");
    expect(restockTimesPath("Ontario", "Toronto", "ca")).toBe("/ca/iphone-duo-restock-times/ontario/toronto");
    expect(restockTimesPath("Tokyo", undefined, "jp")).toBe("/jp/iphone-duo-restock-times/tokyo/tokyo");
    expect(restockTimesPath("Singapore", undefined, "sg")).toBe("/sg/iphone-duo-restock-times");
    for (const cc of INTL_CODES) {
      for (const r of statesWithStores(cc)) {
        const p = restockTimesPath(r.name, undefined, cc);
        expect(p).toBe(intlRestockTimesPath(cc, r.name));
        expect(publicRouteCheck(p), `${cc} ${r.name} → ${p}`).toBeNull();
      }
      for (const c of citiesWithStores(cc)) {
        const p = restockTimesPath(c.state, c.name, cc);
        expect(publicRouteCheck(p), `${cc} ${c.name} → ${p}`).toBeNull();
        if (c.stores.length === 1) expect(p).toBe(storePath(c.stores[0]));
      }
    }
  });
});
