import { describe, expect, it } from "vitest";
import { numericInput, pickupNextStep, ruleBudget, tripBudget } from "@/lib/planning/calculators";
import { planningGuides, PLANNING_HUB } from "@/content/planning/guides";
import { CURATED_PAGES, isCuratedPath } from "@/lib/seo/curation";

describe("pickup planning worksheets", () => {
  it("does not turn empty, negative, nonfinite or fractional store counts into valid coverage", () => {
    for (const raw of ["", " ", "NaN", "Infinity", "-1", "501", "1.5"]) expect(numericInput(raw, 500, true)).toBeNull();
    expect(numericInput("0", 500, true)).toBe(0);
    expect(numericInput("0.50", 100)).toBe(0.5);
  });
  it("counts store-configuration pairs rather than calling rule capacity a store limit", () => {
    expect(ruleBudget(6, 2, 10)).toEqual({ rules: 12, fits: false, over: 2, completeStores: 5 });
    expect(ruleBudget(5, 2, 10).fits).toBe(true);
    expect(ruleBudget(5, 0, 0)).toEqual({ rules: 0, fits: true, over: 0, completeStores: 0 });
  });
  it("keeps cash separate from optional time value, including a fare-only journey", () => {
    expect(tripBudget(80, .5, 10, 180, 20)).toEqual({ cash: 50, timeValue: 60, combined: 110 });
    expect(tripBudget(0, 0, 12, 90, 0)).toEqual({ cash: 12, timeValue: 0, combined: 12 });
  });
  it("does not recommend departure when an order is not ready or collection is impractical", () => {
    expect(pickupNextStep(false, true, false)).toContain("do not travel");
    expect(pickupNextStep(true, false, false)).toContain("not practical");
    expect(pickupNextStep(false, true, true)).toContain("Delivery fits");
  });
  it("includes all worksheets in the curated publication set with editorial dates and no stock-derived lastmod", () => {
    const paths = [PLANNING_HUB, ...planningGuides.map((g) => `/${g.slug}`)];
    expect(new Set(paths).size).toBe(5);
    for (const path of paths) {
      expect(isCuratedPath(path)).toBe(true);
      const entry = CURATED_PAGES.find((p) => p.path === path)!;
      expect(entry.storeNumbers).toEqual([]);
      expect(entry.updatedAt).toBe("2026-11-07");
    }
  });
});
