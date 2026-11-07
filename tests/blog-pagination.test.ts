import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const fixture = vi.hoisted(() => Array.from({ length: 14 }, (_, i) => ({
  category: "pickup-guides", slug: `fixture-guide-${i + 1}`, title: `Fixture guide ${i + 1}`,
  description: "A test-only article used to verify published pagination.",
  publishedAt: i === 13 ? "2099-01-01" : "2026-01-01", updatedAt: i === 13 ? "2099-01-01" : "2026-01-01",
  sections: [{ heading: "Fixture section", paragraphs: ["Not published on the site."] }], sources: [],
})));
vi.mock("@/content/blog/posts.json", () => ({ default: fixture }));
vi.mock("@/content/blog/index.json", () => ({ default: fixture.map(({ category, slug, publishedAt, updatedAt }) => ({ category, slug, publishedAt, updatedAt })) }));
vi.mock("@/components/ui/PendingLink", async () => {
  const { createElement } = await import("react");
  return { PendingLink: ({ children, href }: { children: import("react").ReactNode; href: string }) => createElement("a", { href }, children) };
});
vi.mock("@/components/seo/Related", () => ({ Breadcrumbs: () => null }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("not-found"); }, permanentRedirect: (path: string) => { throw new Error(`redirect:${path}`); } }));

import { publicRouteCheck } from "@/lib/seo/routes";
import { BlogCollection, collectionMetadata } from "@/components/pages/BlogCollection";
import CategoryPage, { generateMetadata } from "@/app/(public)/blog/[category]/page";
import PaginatedCategory, { generateStaticParams } from "@/app/(public)/blog/[category]/page/[page]/page";
import { CURATED_PAGES, isCuratedPath, withCuratedMetadata } from "@/lib/seo/curation";

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-06T12:00:00Z")); });
afterEach(() => vi.useRealTimers());

describe("cacheable journal pagination", () => {
  it("makes validated published articles and populated collections eligible without indexing future or empty pages", () => {
    vi.stubEnv("NEXT_PUBLIC_INDEXABLE", "1"); vi.stubEnv("DEPLOY_TARGET", "production"); vi.stubEnv("VERCEL_ENV", "production");
    try {
      expect(CURATED_PAGES).toHaveLength(338); // 322 core + 13 actual articles + journal/category/page 2.
      for (const path of ["/blog", "/blog/pickup-guides", "/blog/pickup-guides/page/2", "/blog/pickup-guides/fixture-guide-13"]) {
        expect(isCuratedPath(path), path).toBe(true);
        expect(withCuratedMetadata(path, {}).robots).toEqual({ index: true, follow: true });
      }
      for (const path of ["/blog/stock-patterns", "/blog/pickup-guides/page/3", "/blog/pickup-guides/fixture-guide-14"]) expect(isCuratedPath(path), path).toBe(false);
    } finally { vi.unstubAllEnvs(); }
  });
  it("redirects legacy query pages to clean paths while preserving unrelated query values", () => {
    expect(publicRouteCheck("/blog/pickup-guides", "?page=2&utm_source=example")).toEqual({ redirect: "/blog/pickup-guides/page/2?utm_source=example" });
    expect(publicRouteCheck("/blog/pickup-guides", "?page=1")).toEqual({ redirect: "/blog/pickup-guides" });
    expect(publicRouteCheck("/blog/pickup-guides/page/1")).toEqual({ redirect: "/blog/pickup-guides" });
    expect(publicRouteCheck("/blog/pickup-guides/page/02")).toEqual({ redirect: "/blog/pickup-guides/page/2" });
    expect(publicRouteCheck("/blog/pickup-guides/page/2", "?page=3")).toEqual({ redirect: "/blog/pickup-guides/page/2" });
  });
  it("allows only pages with published content and rejects malformed, duplicate and future-only pages before streaming", () => {
    expect(publicRouteCheck("/blog/pickup-guides/page/2")).toBeNull();
    for (const page of ["0", "-1", "1.5", "NaN", "9007199254740992", "3"]) {
      expect(publicRouteCheck(`/blog/pickup-guides/page/${page}`), page).toEqual({ notFound: true });
      expect(publicRouteCheck("/blog/pickup-guides", `?page=${page}`), page).toEqual({ notFound: true });
    }
    expect(publicRouteCheck("/blog/pickup-guides", "?page=1&page=2")).toEqual({ notFound: true });
    expect(publicRouteCheck("/blog/stock-patterns/page/2")).toEqual({ notFound: true });
    expect(publicRouteCheck("/blog/no-category/page/2")).toEqual({ notFound: true });
    expect(publicRouteCheck("/blog/pickup-guides/page/2/extra")).toEqual({ notFound: true });
    expect(publicRouteCheck("/blog/pickup-guides/fixture-guide-14")).toEqual({ notFound: true });
  });
  it("renders clean canonical/previous/next URLs and the correct non-overlapping article slice", () => {
    expect(collectionMetadata("pickup-guides", 2)).toMatchObject({ title: "Pickup guides · Page 2", alternates: { canonical: "/blog/pickup-guides/page/2" } });
    const first = renderToStaticMarkup(BlogCollection({ category: "pickup-guides" }));
    const second = renderToStaticMarkup(BlogCollection({ category: "pickup-guides", page: 2 }));
    expect(first).toContain('href="/blog/pickup-guides/page/2"');
    expect(second).toContain('href="/blog/pickup-guides"');
    expect(first).not.toContain("Fixture guide 13");
    expect(second).toContain("Fixture guide 13");
    expect(second).not.toContain("Fixture guide 12");
    expect(first + second).not.toContain("?page=");
  });
  it("renders base categories without reading searchParams and keeps direct invalid renders consistent", async () => {
    const params = Promise.resolve({ category: "pickup-guides" });
    expect((await CategoryPage({ params })).props).toEqual({ category: "pickup-guides" });
    expect(await generateMetadata({ params })).toMatchObject({ alternates: { canonical: "/blog/pickup-guides" } });
    expect(generateStaticParams()).toEqual([{ category: "pickup-guides", page: "2" }]);
    await expect(PaginatedCategory({ params: Promise.resolve({ category: "pickup-guides", page: "3" }) })).rejects.toThrow("not-found");
    await expect(PaginatedCategory({ params: Promise.resolve({ category: "pickup-guides", page: "1" }) })).rejects.toThrow("redirect:/blog/pickup-guides");
  });
});
