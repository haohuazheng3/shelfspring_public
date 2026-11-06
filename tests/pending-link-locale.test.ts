/* eslint-disable react/no-children-prop -- createElement must satisfy the provider's required children prop. */
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ prefetch: vi.fn() }), usePathname: () => navigation.pathname }));
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => createElement("a", { href, "data-next-link": "true" }, children),
  useLinkStatus: () => ({ pending: false }),
}));
import { PendingLink } from "@/components/ui/PendingLink";
import { LangProvider } from "@/components/i18n/LangProvider";
import { EN_US, localeFromSegment } from "@/lib/i18n/locales";

function link(from: string, to: string, pathname = "/") {
  navigation.pathname = pathname;
  const loc = localeFromSegment(from) ?? EN_US;
  return renderToStaticMarkup(createElement(LangProvider, {
    loc, app: loc.native ? loc : null, d: null, rememberLocale: true,
    children: createElement(PendingLink, { href: to, children: "Navigate" }),
  }));
}

describe("navigation across URL-derived country documents", () => {
  it.each([["de-de", "/de-at/stores"], ["de-at", "/de-de/stores"], ["uk", "/jp/stores"], ["ja-jp", "/stores"]])("loads a new document from %s to %s", (from, to) => {
    expect(link(from, to)).not.toContain("data-next-link");
  });
  it.each([["de-de", "/de-de/stores"], ["ja-jp", "/jp/stores"], ["uk", "/uk/stores"], ["", "/stores"]])("preserves soft navigation within %s", (from, to) => {
    expect(link(from, to)).toContain('data-next-link="true"');
  });
  it("preserves the native target and query when localizing a country link", () => {
    expect(link("de-de", "/at/stores?model=duo#notify")).toContain('href="/de-at/stores?model=duo#notify"');
  });
});


describe("analytics admin document isolation", () => {
  it.each([["/account", "/admin/inbox"], ["/admin/login", "/account"], ["/", "/admin?tab=inbox"], ["/account", "/ad%6din/inbox"]])("forces a document from %s to %s", (from, to) => {
    expect(link("", to, from)).not.toContain("data-next-link");
  });
  it("keeps navigation inside the analytics-free admin document soft", () => {
    expect(link("", "/admin/errors", "/admin/inbox")).toContain('data-next-link="true"');
  });
});
