/* eslint-disable react/no-children-prop -- createElement must satisfy the provider's required children prop. */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("@/components/ui/PendingLink", () => ({ PendingLink: (props: Record<string, unknown>) => createElement("a", props) }));
import NotFound from "@/components/site/NotFound";
import { LangProvider, preferredLocaleFromCookie } from "@/components/i18n/LangProvider";
import { EN_US, NATIVE_LOCALES } from "@/lib/i18n/locales";

describe("URL-derived public locale rendering", () => {
  it.each(NATIVE_LOCALES)("renders $id 404s with valid localized content and country links", (loc) => {
    const html = renderToStaticMarkup(createElement(LangProvider, { loc, app: loc, d: null, children: createElement(NotFound) }));
    expect(html).toContain(`<h1`);
    expect(html).toContain(`href="/${loc.id}/stores"`);
    expect(html).toContain(`href="/${loc.id}"`);
    expect(html).not.toContain("undefined");
  });
  it("keeps the English public 404 independent of personal preferences", () => {
    const html = renderToStaticMarkup(createElement(LangProvider, { loc: EN_US, app: null, d: null, children: createElement(NotFound) }));
    expect(html).toContain("No page at this address");
    expect(html).toContain('href="/stores"');
  });
  it("accepts only known native preference cookies without confusing similarly named cookies", () => {
    expect(preferredLocaleFromCookie("other=1; pc_lang=ja-jp; more=2")).toBe("ja-jp");
    expect(preferredLocaleFromCookie("pc_language=ja-jp")).toBe("");
    expect(preferredLocaleFromCookie("pc_lang=en")).toBe("");
    expect(preferredLocaleFromCookie("pc_lang=unknown")).toBe("");
    expect(preferredLocaleFromCookie("pc_lang=%E0%A4%A")).toBe("");
  });
});
