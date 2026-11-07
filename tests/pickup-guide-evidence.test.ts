import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { catalogFor, MODELS, STORES } from "@/lib/apple/catalog";
import { dict } from "@/lib/i18n/dict";
import { emptyFacts, type Facts } from "@/lib/content/facts";
import { emptyRestockTimes, type RestockTimes } from "@/lib/content/restockTimes";
import type { RecentByConfig } from "@/lib/stock/recent";
import type { SiteFacts } from "@/lib/content/siteFacts";
import { summarize, type Sellouts } from "@/lib/stock/sellouts";

const reads = vi.hoisted(() => ({ facts: vi.fn(), times: vi.fn(), recent: vi.fn(), current: vi.fn(), site: vi.fn(), sellouts: vi.fn() }));
vi.mock("@/lib/content/facts", async (original) => ({ ...await original<typeof import("@/lib/content/facts")>(), getFacts: reads.facts }));
vi.mock("@/lib/content/restockTimes", async (original) => ({ ...await original<typeof import("@/lib/content/restockTimes")>(), duoRestockTimes: reads.times }));
vi.mock("@/lib/content/siteFacts", async (original) => ({ ...await original<typeof import("@/lib/content/siteFacts")>(), siteFacts: reads.site }));
vi.mock("@/lib/stock/sellouts", async (original) => ({ ...await original<typeof import("@/lib/stock/sellouts")>(), sellouts: reads.sellouts }));
vi.mock("@/lib/stock/recent", () => ({ recentByConfig: reads.recent }));
vi.mock("@/lib/stock/queries", () => ({ storesWithStockNow: reads.current }));
vi.mock("@/lib/i18n/server", () => ({ pageLocale: () => ({ lang: "en" }), t: () => dict("en") }));
vi.mock("@/components/ui/PendingLink", () => ({ PendingLink: ({ children, href, ...props }: Record<string, unknown>) => createElement("a", { ...props, href }, children as never) }));

import Planning from "@/app/(public)/how-to-get-an-iphone-duo/page";
import Timing from "@/app/(public)/iphone-duo-sell-out-times/page";
import Availability from "@/app/(public)/apple-store-pickup-availability-explained/page";

const at = "2026-11-07T01:00:00.000Z", eventAt = "2026-11-07T00:52:00.000Z";
const item = catalogFor("duo")[0], store = STORES[0];
let facts: Facts, times: RestockTimes, recent: RecentByConfig, site: SiteFacts, durations: Sellouts;
const markup = async (page: () => Promise<ReturnType<typeof createElement>>) => renderToStaticMarkup(await page());
const section = (html: string, id: string) => html.split(`<section id="${id}"`)[1]?.split("</section>")[0] ?? "";

beforeEach(() => {
  vi.clearAllMocks();
  facts = { ...emptyFacts(), at, models: Object.fromEntries(MODELS.map(({ key }) => [key, {
    key, unknown: false, storesNow: 0, pairsNow: 0, pairsTotal: 0, restocks: 0, soldouts: 0, medianMs: null, lastRestockAt: null, topConfig: null,
    byConfig: {}, byColor: {}, byStorage: {}, restocksByConfig: {}, restocksByColor: {}, restocksByStorage: {}, restockStores: 0, priceLow: 0, priceHigh: 0,
  }])) as Facts["models"] };
  facts.models.duo.unknown = false;
  times = { ...emptyRestockTimes("us", new Date(at)), n: 4, stores: 1, days: 1, spanDays: 1,
    byPart: [{ partNumber: item.partNumber, restocks: 4, lastAt: eventAt, lastStore: store.storeNumber }],
    topStores: [{ storeNumber: store.storeNumber, restocks: 4, days: 1, peakHour: 10, lastAt: eventAt }],
    daily: [{ date: "2026-11-06", weekday: 5, restocks: 4, stores: 1, peakHour: 10, ours: true }],
  };
  recent = { at, hours: 24, restocks: 0, stores: 0, latest: null, byPart: [] };
  site = { at, restocks: 0, soldouts: 0, restockStores: 0, duoSellout: null, patterns: {} };
  durations = { summary: summarize([], 30), byModel: {}, recent: [] };
  reads.facts.mockImplementation(async () => facts);
  reads.times.mockImplementation(async () => times);
  reads.recent.mockImplementation(async () => recent);
  reads.site.mockImplementation(async () => site);
  reads.current.mockResolvedValue({ duo: 3, "18-pro": 0, "18-pro-max": 0 });
  reads.sellouts.mockImplementation(async () => durations);
});

describe("pickup notebooks preserve the meaning of their evidence", () => {
  it("keeps historical configuration counts separate from a genuine zero in the recent window", async () => {
    const html = await markup(Planning);
    expect(section(html, "budget")).toContain("100%");
    expect(section(html, "radius")).toContain("Distinct local dates");
    expect(section(html, "record")).toContain(">0</span>");
    expect(section(html, "record")).toContain(`dateTime="${at}"`);
    expect(html).toContain("not the age of this service");
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(reads.times).toHaveBeenCalledWith("us");
    expect(reads.recent).toHaveBeenCalledWith({ country: "us" });
    expect(reads.site).toHaveBeenCalledTimes(1);
  });

  it("withholds unavailable history instead of reusing populated rows or inventing a stock schedule", async () => {
    times.unknown = true;
    recent.unknown = true;
    const html = await markup(Planning);
    expect(section(html, "budget")).toContain("missing counts are not zero returns");
    expect(section(html, "budget")).not.toContain("100%");
    expect(section(html, "radius")).not.toContain("<table");
    expect(section(html, "record")).not.toContain("<table");
    expect(section(html, "record")).not.toContain(">0</span>");
    expect(html).not.toMatch(/arriving every day|overnight restock is a myth|checkout has to take seconds/);
  });

  it("shows current-state and historical event timestamps as separate evidence", async () => {
    recent = { ...recent, restocks: 1, stores: 1, latest: { storeNumber: store.storeNumber, partNumber: item.partNumber, at: eventAt } };
    const html = await markup(Availability);
    const clocks = section(html, "three-clocks");
    expect(clocks).toContain(">3</span>");
    expect(clocks).toContain(">1</span>");
    expect(clocks).toContain(`dateTime="${at}"`);
    expect(clocks).toContain(`dateTime="${eventAt}"`);
    expect(clocks).toContain("not a promise that the listing remains available");
    expect(clocks).toContain("does not trigger retrospective notifications");
    expect(reads.current).toHaveBeenCalledWith(undefined, "us");
    facts.models.duo.unknown = true;
    recent.unknown = true;
    const unknown = section(await markup(Availability), "three-clocks");
    expect(unknown).not.toContain(">3</span>");
    expect(unknown).not.toContain(`dateTime="${eventAt}"`);
  });

  it("distinguishes the full timing summary from capped completed-row groups and the separate model", async () => {
    durations = { summary: { ...summarize([100], 30), n: 2000 }, byModel: {}, recent: [
      { id: 1, at: new Date(eventAt), storeNumber: store.storeNumber, partNumber: item.partNumber, lowSec: 35, highSec: 40, exact: true, listedSec: null },
      { id: 2, at: new Date(eventAt), storeNumber: store.storeNumber, partNumber: item.partNumber, lowSec: 55, highSec: 60, exact: true, listedSec: null },
      { id: 3, at: new Date(eventAt), storeNumber: store.storeNumber, partNumber: item.partNumber, lowSec: null, highSec: null, exact: false, listedSec: 900 },
    ] };
    site.duoSellout = { n: 25, medianSec: 60, within30: 0, caught: { m1: 0.9, m5: 0.2, m15: 0.1 } };
    const html = await markup(Timing);
    expect(section(html, "measurement")).toContain("2,000");
    const choices = section(html, "choices");
    expect(choices).toContain("1,000 recent listing rows");
    expect(choices).toContain(">50 s</td>"); // median of the two completed rows, never the 900-second open row
    expect(choices).not.toContain(">900 s</td>");
    expect(section(html, "sampling")).toContain("90%");
    expect(section(html, "sampling")).toContain("not measured delivery rates");
    expect(reads.sellouts).toHaveBeenCalledTimes(8);
    expect(reads.sellouts).toHaveBeenCalledWith({ country: "us", model: "duo", limit: 1000 });
  });

  it("does not manufacture a lifetime from an empty timing result and keeps structured steps visible", async () => {
    const html = await markup(Timing);
    expect(section(html, "measurement")).toContain("No usable completed-duration sample");
    expect(section(html, "sampling")).toContain("No sampling estimate is available");
    for (const page of [Planning, Availability, Timing]) {
      const result = await markup(page);
      const graphs = [...result.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
      expect(graphs.length).toBeGreaterThanOrEqual(2);
      const howTo = graphs.flatMap((graph) => graph["@graph"] ?? []).find((node) => node["@type"] === "HowTo");
      for (const step of howTo?.step ?? []) expect(result).toContain(step.name);
    }
  });
});
