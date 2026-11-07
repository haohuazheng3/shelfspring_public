import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ALL_CODES, COUNTRIES } from "@/lib/apple/countries";
import { MODELS, storesOf } from "@/lib/apple/catalog";
import { dict } from "@/lib/i18n/dict";
import { LANGS, localesOf, type Lang } from "@/lib/i18n/locales";
import { emptyFacts, tokenValue } from "@/lib/content/facts";

const locale = vi.hoisted(() => ({ lang: "en" as Lang }));
vi.mock("@/lib/i18n/server", () => ({ pageLocale: () => locale, t: () => dict(locale.lang) }));
import { SourceList } from "@/components/content/RichFaq";
import { fieldGuideQuestions } from "@/components/seo/FieldGuide";

describe("field-guide copy and dataset scope", () => {
  it("does not require an indefinite article for dynamic model names", () => {
    for (const model of [undefined, ...MODELS.map((m) => m.name)]) {
      const questions = fieldGuideQuestions({ place: "California", stores: 53, kind: "region", model });
      expect(questions[1].q).toBe(`How should I compare pickup options for ${model ?? "iPhone"} in California?`);
      expect(questions[1].q).not.toContain("a iPhone");
    }
  });

  it("keeps a city noun beside the regional count in every language", () => {
    for (const lang of LANGS) {
      for (const cities of [1, 45]) {
        const labels = dict(lang).pages.region.counts(53, cities).split(" · ");
        expect(labels, lang).toHaveLength(3);
        expect(labels[1], lang).toMatch(/\p{L}/u);
      }
    }
    expect(dict("en").pages.region.counts(53, 45)).toContain("45 cities");
    expect(dict("en").pages.region.counts(53, 1)).toContain("1 city");
  });

  it("uses each page country's catalog scope and historical date in every locale", () => {
    for (const cc of ALL_CODES) for (const loc of localesOf(cc)) {
      locale.lang = loc.lang;
      // Product and directory pages may omit facts.lang; SourceList must use the page locale.
      const facts = { ...emptyFacts(cc), at: "2026-11-07T12:00:00Z" };
      const d = dict(loc.lang);
      const html = renderToStaticMarkup(createElement(SourceList, { sources: [], facts }));
      const scope = d.views.common.sourcesWhere(storesOf(cc).length, COUNTRIES[cc]);
      expect(html, loc.id).toContain(scope);
      expect(html, loc.id).toContain(tokenValue("asOf", { ...facts, lang: loc.lang }));
      if (cc !== "us") {
        expect(html, loc.id).not.toContain(d.content.allUsStores);
        expect(html, loc.id).toContain(d.views.common.since);
        expect(html, loc.id).not.toContain(tokenValue("trackingSince", { ...facts, lang: loc.lang }));
      } else expect(html).toContain("October 29, 2026");
    }
  });

  it("preserves an explicitly narrower study scope and sample date", () => {
    locale.lang = "en";
    const html = renderToStaticMarkup(createElement(SourceList, { sources: [], facts: emptyFacts("jp"), where: "two selected Tokyo stores", since: "November 5, 2026" }));
    expect(html).toContain("two selected Tokyo stores");
    expect(html).toContain("November 5, 2026");
    expect(html).not.toContain("all 11 Apple Stores");
  });
});
