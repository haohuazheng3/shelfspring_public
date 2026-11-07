import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { catalogFor, STORES } from "@/lib/apple/catalog";
import { dict } from "@/lib/i18n/dict";
import type { Lang } from "@/lib/i18n/locales";
import { configGrid, indexStock } from "@/lib/seo/productData";
import { productBySlug, productPath, storePlace, US } from "@/lib/seo/products";
import type { PartStatus } from "@/lib/stock/queries";

const request = vi.hoisted(() => ({ lang: "en" as Lang }));
vi.mock("@/lib/i18n/server", () => ({ t: () => dict(request.lang), pageLocale: () => ({ lang: request.lang }) }));
vi.mock("@/components/ui/PendingLink", () => ({
  PendingLink: ({ scroll, ...props }: ComponentProps<"a"> & { scroll?: boolean }) => {
    void scroll;
    return createElement("a", props);
  },
}));
import { ProductGrid } from "@/components/seo/ProductParts";

const product = productBySlug("iphone-duo")!;
const items = catalogFor("duo");
const row = (partNumber: string, status: string): PartStatus => ({
  storeNumber: STORES[0].storeNumber, partNumber, status, quote: null, since: null,
  lastCheckedAt: "2026-11-06T23:00:00.000Z", lastAvailableAt: null,
});
const stock = indexStock({ duo: [row(items[0].partNumber, "available"), row(items[1].partNumber, "unavailable")], "18-pro": [], "18-pro-max": [] });

function links(html: string) {
  return [...html.matchAll(/<a\b[^>]*>/g)].map(([tag]) => ({
    href: tag.match(/href="([^"]*)"/)?.[1],
    label: tag.match(/aria-label="([^"]*)"/)?.[1],
  }));
}

describe("configuration matrix link names", () => {
  beforeEach(() => { request.lang = "en"; });

  it("names every configuration even when several cells show the same zero", () => {
    const grid = configGrid(stock, product, US);
    const rendered = links(renderToStaticMarkup(createElement(ProductGrid, { grid, place: US, current: product })));
    expect(rendered).toHaveLength(grid.cells.size);
    expect(new Set(rendered.map(link => link.label)).size).toBe(grid.cells.size);
    for (const cell of grid.cells.values()) {
      expect(rendered.find(link => link.href === productPath(cell.product, US))?.label).toBe(
        `${cell.item.model} ${cell.item.storage} ${cell.item.color} · ${cell.count} ${cell.count === 1 ? "store" : "stores"} with stock`,
      );
    }
  });

  it("uses the native color and stock-count words in the accessible name", () => {
    request.lang = "ja";
    const grid = configGrid(stock, product, US);
    const rendered = links(renderToStaticMarkup(createElement(ProductGrid, { grid, place: US, current: product })));
    expect(rendered.find(link => link.href === "/stock/iphone-duo-256gb-night-sky")?.label).toBe("iPhone Duo 256GB ナイトスカイ · 1 在庫のある店舗");
    expect(rendered.every(link => !link.label?.includes("stores with stock"))).toBe(true);
  });

  it("announces store-level availability and distinguishes an unchecked configuration", () => {
    const place = storePlace(STORES[0]);
    const grid = configGrid(stock, product, place);
    const rendered = links(renderToStaticMarkup(createElement(ProductGrid, { grid, place, current: product })));
    for (const cell of grid.cells.values()) {
      const label = rendered.find(link => link.href === productPath(cell.product, place))?.label;
      const status = cell.status?.status === "available" ? "In stock" : cell.status ? "Not available" : "Not checked yet";
      expect(label).toBe(`${cell.item.model} ${cell.item.storage} ${cell.item.color} · ${status}`);
    }
  });
});
