import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { pickupPattern } from "@/lib/content/shelfspringInsights";
import { publishedPosts, categoryPage, validatePosts } from "@/content/blog/catalog";
import { BLOG_CATEGORIES } from "@/content/blog/categories";
import { publicRouteCheck } from "@/lib/seo/routes";
import { dict } from "@/lib/i18n/dict";
import { notifyText } from "@/lib/i18n/notify";
import type { CDict } from "@/lib/i18n/cdict/en";
import type { Lang } from "@/lib/i18n/locales";

const post = { category: "pickup-guides", slug: "example-guide", title: "Example pickup guide", description: "An example description for the publishing validator.", publishedAt: "2026-11-06", updatedAt: "2026-11-06", sections: [{ heading: "Example section", paragraphs: ["Example body for validation only."] }], sources: [{ label: "Apple", url: "https://www.apple.com/shop/shipping-pickup" }] };

describe("ShelfSpring evidence summaries", () => {
  it("preserves genuine ties and reports event shares without treating them as availability", () => {
    const input = { restocks: 5, stores: 2, byPart: [{ partNumber: "b", restocks: 2 }, { partNumber: "c", restocks: 1 }, { partNumber: "a", restocks: 2 }] };
    const before = JSON.stringify(input);
    expect(pickupPattern(input)).toEqual({ known: true, total: 5, activeStores: 2, activeConfigurations: 3, tied: true, leaders: [{ partNumber: "a", restocks: 2, share: 40 }, { partNumber: "b", restocks: 2, share: 40 }] });
    expect(JSON.stringify(input)).toBe(before);
  });
  it("keeps a failed read distinct from a known empty window", () => {
    const empty = { restocks: 0, stores: 0, byPart: [] };
    expect(pickupPattern(empty)).toMatchObject({ known: true, total: 0, leaders: [] });
    expect(pickupPattern({ ...empty, unknown: true })).toMatchObject({ known: false, leaders: [] });
  });
});

describe("blog publication pipeline", () => {
  it("keeps category hubs crawlable, including before their first article", () => {
    expect(publicRouteCheck("/blog")).toBeNull();
    for (const category of BLOG_CATEGORIES) {
      expect(publicRouteCheck(`/blog/${category.slug}`)).toBeNull();
      const count = publishedPosts().filter((p) => p.category === category.slug).length;
      const result = categoryPage(category.slug, 1);
      expect(result.valid).toBe(true);
      expect(result.posts).toHaveLength(Math.min(count, 12));
      expect(categoryPage(category.slug, result.pages + 1).valid).toBe(false);
      expect(publicRouteCheck(`/blog/${category.slug}/unpublished-article`)).toEqual({ notFound: true });
      expect(publicRouteCheck(`/blog/${category.slug}/page/${result.pages + 1}`)).toEqual({ notFound: true });
      expect(publicRouteCheck(`/blog/${category.slug}`, `?page=${result.pages + 1}`)).toEqual({ notFound: true });
      expect(publicRouteCheck(`/blog/${category.slug}`, "?page=1")).toEqual({ redirect: `/blog/${category.slug}` });
    }
  });
  it("rejects broken dates, duplicate URLs and unrenderable content before publication", () => {
    expect(validatePosts([post])).toHaveLength(1);
    for (const invalid of [{ ...post, publishedAt: "2026-02-30" }, { ...post, updatedAt: "2026-11-05" }, { ...post, category: "unknown" }, { ...post, sections: [] }, { ...post, sections: [{ heading: {}, paragraphs: ["body"] }] }, { ...post, sources: [{ label: "Bad", url: "javascript:alert(1)" }] }]) expect(() => validatePosts([invalid])).toThrow();
    expect(() => validatePosts([post, post])).toThrow(/Duplicate/);
  });
});

describe("localized public copy", () => {
  const languages: Lang[] = ["en", "ja", "ko", "zh-TW", "zh-HK", "de", "de-CH", "fr", "fr-CA", "it", "es", "nl", "sv", "ar"];
  it("keeps pricing, notification setup and email copy free of fixed delivery promises", async () => {
    for (const lang of languages) {
      const d = dict(lang), n = notifyText(lang);
      const texts = [d.account.pricing.metaDescription, d.account.pricing.fastest, d.account.pricing.everyFast, ...d.account.pricing.perks, d.chrome.footer.blurb, d.chrome.footer.blurbIn("STORES"), d.modules.last24.counted, d.modules.last24.alert(null), d.modules.sellout.measured(true), n.email.nudge("URL"), n.email.htmlNudge("URL"), n.nudge.subject, n.nudge.intro, n.testBody("TIME", "DEVICE"), n.checkoutSubmit("PLAN", 10, 5, 15, 3)];
      for (const text of texts) expect(text, lang).not.toMatch(/(?<!\d)[35]\s*(?:s\b|sec|秒|초|Sek|second|segund|ثوان|ثانية)|fastest published|within seconds|in seconds/);
    }
    const folders = ["en", "ja", "ko", "zh-tw", "zh-hk", "de", "fr", "it", "es", "nl", "sv", "ar"];
    for (const folder of folders) {
      const clientModule = await import(`../src/lib/i18n/cdict/${folder}/index.ts`);
      const client = Object.values(clientModule).find((v) => v && typeof v === "object" && "alerts" in v) as CDict;
      expect(client, folder).toBeTruthy();
      expect(client.alerts.editor.speedLine, folder).not.toMatch(/\{fast\}|\{push\}|within seconds|in seconds/);
      expect(client.install.hero.lead, folder).not.toMatch(/within seconds|in seconds/);
      expect(client.account.push.explain.on, folder).not.toMatch(/within seconds|in seconds/);
    }
  });
  it("separates historical coverage from brand age and avoids a paid fast-lane claim", () => {
    for (const lang of languages) {
      const d = dict(lang);
      const source = renderToStaticMarkup(d.content.trackerSource("TEST_STORE", "HISTORY_START", "UPDATED_AT"));
      expect(source, lang).toContain("HISTORY_START");
      expect(source, lang).toContain("UPDATED_AT");
      expect(source, lang).toContain("TEST_STORE");
      expect(d.pages.common.checkNote, lang).not.toMatch(/[35]/);
      expect(d.content.product.checkNote, lang).not.toMatch(/[35]/);
      expect(d.content.alertRule, lang).not.toMatch(/[35]/);
      expect(d.content.explainer("store", "TEST_STORE").join(" "), lang).not.toMatch(/[35]/);
    }
  });
});
