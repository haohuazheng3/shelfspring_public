import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock("@vercel/functions", () => ({ attachDatabasePool: () => undefined }));
vi.mock("@/lib/db", async (orig) => ({ ...(await orig<typeof import("@/lib/db")>()), hasDatabase: () => false }));
vi.mock("@/components/ui/PendingLink", () => ({ PendingLink: (props: ComponentProps<"a">) => createElement("a", props) }));
const locale = vi.hoisted(() => ({ lang: "en" as import("@/lib/i18n/locales").Lang, cc: "us" as const, id: "", tag: "en-US", native: false }));
vi.mock("@/lib/i18n/server", async () => {
  const { dict } = await import("@/lib/i18n/dict");
  return { pageLocale: () => locale, t: () => dict(locale.lang) };
});

const { partNumbersFor, storesOf, storeTimeZone } = await import("@/lib/apple/catalog");
const { emptyRestockTimes } = await import("@/lib/content/restockTimes");
const { summarize } = await import("@/lib/stock/sellouts");
const { duoLedgerFrom, stockFromRows } = await import("@/lib/content/duoLedger");
type DuoLedgerInput = import("@/lib/content/duoLedger").DuoLedgerInput;
const { DuoLedger } = await import("@/components/stock/DuoLedger");

const stores = storesOf("us").filter((s) => s.state === "Michigan");
const parts = partNumbersFor("duo", [], [], "us");
const now = new Date("2026-11-08T14:00:00Z");
const at = (iso: string) => new Date(iso);
const sell = (recent: DuoLedgerInput["sell"]["recent"]): DuoLedgerInput["sell"] => ({ summary: summarize([], 30), byModel: { duo: summarize([60, 90, 120, 50, 80, 70, 95, 110, 40, 85], 30) }, recent });
const stock = (listed: Record<string, string[]>, checked = "2026-11-08T13:59:50Z") =>
  new Map(stores.map((s) => [s.storeNumber, { lastCheckedAt: at(checked), perModel: { duo: { available: listed[s.storeNumber]?.length ?? 0, parts: listed[s.storeNumber] ?? [] }, "18-pro": { available: 3, parts: [] }, "18-pro-max": { available: 0, parts: [] } } }]));

function times(over: Partial<ReturnType<typeof emptyRestockTimes>> = {}) {
  const t = emptyRestockTimes("us", now, { stores });
  return { ...t, since: "2026-10-29", ...over };
}

describe("duoLedgerFrom — the ledger's numbers from what the page already loaded", () => {
  it("counts listing stores, keeps the newest observation and names the other models per store or per place", () => {
    const [a, b] = stores;
    const d = duoLedgerFrom({ stores, stock: stock({ [a.storeNumber]: [parts[0]], [b.storeNumber]: [parts[0], parts[1], parts[2]] }), times: times(), sell: sell([]), configsTotal: 8, now });
    expect(d.listed.map((x) => x.storeNumber)).toEqual([b.storeNumber, a.storeNumber]);
    expect(d.listed[0].configs).toBe(3);
    expect(d.observedAt).toBe("2026-11-08T13:59:50.000Z");
    expect(d.others).toEqual({ pro: stores.length, max: 0 });
    expect(d.storesTotal).toBe(stores.length);
    expect(d.tracked).toBeGreaterThan(5);
    // One store: configurations, not stores.
    const one = duoLedgerFrom({ stores: [a], stock: stock({}), times: times(), sell: sell([]), configsTotal: 8, now });
    expect(one.others).toEqual({ pro: 3, max: 0 });
  });

  it("takes the last return from the record when it is newer than the sell-out rows, and keeps only this place's Duo rows", () => {
    const [a, b] = stores;
    const other = storesOf("us").find((s) => s.state === "Ohio")!;
    const recent = [
      { id: 1, at: at("2026-11-07T15:00:00Z"), storeNumber: a.storeNumber, partNumber: parts[0], lowSec: 100, highSec: 115, exact: true, listedSec: null },
      { id: 2, at: at("2026-11-07T16:00:00Z"), storeNumber: other.storeNumber, partNumber: parts[0], lowSec: 100, highSec: 115, exact: true, listedSec: null },
      { id: 3, at: at("2026-11-06T09:00:00Z"), storeNumber: b.storeNumber, partNumber: parts[3], lowSec: 0, highSec: 15, exact: false, listedSec: null },
      { id: 4, at: at("2026-11-07T10:00:00Z"), storeNumber: b.storeNumber, partNumber: "MJWE4LL/A", lowSec: 0, highSec: 15, exact: false, listedSec: null }, // an 18 Pro part: not Duo
    ];
    const d = duoLedgerFrom({ stores, stock: stock({}), times: times({ n: 12, stores: 3, days: 4, latest: { storeNumber: b.storeNumber, partNumber: parts[1], at: "2026-11-08T12:30:00.000Z" } }), sell: sell(recent), configsTotal: 8, now });
    expect(d.lastThree.map((r) => r.at)).toEqual(["2026-11-07T15:00:00.000Z", "2026-11-06T09:00:00.000Z"]);
    expect(d.last?.at).toBe("2026-11-08T12:30:00.000Z");
    expect(d.last?.lowSec).toBeNull();
    expect(d.storesWithReturn).toBe(3);
    expect(d.medianSec).toBe(summarize([60, 90, 120, 50, 80, 70, 95, 110, 40, 85], 30).medianSec); // byModel.duo median when the record has no sell-out facts yet
  });

  it("reads the pattern, the busiest window and the morning share from the record", () => {
    const byHour = Array(24).fill(0); byHour[9] = 12; byHour[10] = 8; byHour[16] = 4;
    const d = duoLedgerFrom({ stores, stock: stock({}), times: times({ n: 24, stores: 5, days: 6, byHour, peakHour: 9, sellout: { n: 20, medianSec: 70, within2min: 0.6, within20min: 0.9, fastestSec: 20 }, byPart: [{ partNumber: parts[2], restocks: 9, lastAt: null, lastStore: null }] }), sell: sell([]), configsTotal: 8, now });
    expect(d.pattern).toBe(true);
    expect(d.window).toEqual({ from: 9, to: 11, share: 20 / 24 });
    expect(d.morningShare).toBeCloseTo(20 / 24);
    expect(d.peakCount).toBe(12);
    expect(d.medianSec).toBe(70);
    expect(d.topPart).toEqual({ partNumber: parts[2], returns: 9 });
    expect(d.zones).toEqual([storeTimeZone(stores[0])]);
  });

  it("builds a stock map from a country page's Duo rows", () => {
    const m = stockFromRows([{ storeNumber: "R001", availableParts: [parts[0]], lastCheckedAt: at("2026-11-08T13:00:00Z"), lastAvailableAt: null }]);
    expect(m.get("R001")?.perModel.duo).toEqual({ available: 1, parts: [parts[0]] });
  });
});

describe("DuoLedger — the block as a reader and an answer engine see it", () => {
  const render = (d: ReturnType<typeof duoLedgerFrom>, one = false) => renderToStaticMarkup(createElement(DuoLedger, { d, place: one ? "Apple Somerset" : "Michigan", one, stores: one ? [stores[0]] : stores, country: "us", hourHref: "/iphone-duo-restock-times/michigan", watchHref: "/?model=duo#notify" }));

  it("opens with the dated verdict, states the measures and emits dateModified + a Dataset", () => {
    const byHour = Array(24).fill(0); byHour[9] = 12; byHour[10] = 8; byHour[16] = 4;
    const d = duoLedgerFrom({ stores, stock: stock({}), times: times({ n: 24, stores: 5, days: 6, byHour, peakHour: 9, sellout: { n: 20, medianSec: 70, within2min: 0.6, within20min: 0.9, fastestSec: 20 } }), sell: sell([]), alerts: { days: 7, sent: 41, stores: 4 }, configsTotal: 8, now });
    const html = render(d);
    expect(html).toContain("Observation ledger · iPhone Duo · Michigan");
    expect(html).toContain(`Not listed for pickup at any of the ${stores.length} Apple Stores in Michigan.`);
    expect(html).toContain("Observed Nov 8, 8:59 AM EST.");
    expect(html).toContain("confirmed returns since October 29, 2026");
    expect(html).toContain("busiest two local hours · 83% of the record");
    expect(html).toContain("Half of the measured listings were gone within roughly 70 seconds.");
    expect(html).toContain(`ShelfSpring delivered 41 alerts to members for returns at 4 of the ${stores.length} Apple Stores in Michigan in the last 7 days.`);
    expect(html).toContain("Open the hour-by-hour record →");
    expect(html).toContain('"dateModified":"2026-11-08T13:59:50.000Z"');
    expect(html).toContain('"@type":"Dataset"');
    // Not the main site's wording.
    expect(html).not.toMatch(/PickupChecker|right now|Not in stock as of|Hour by hour, every store/);
  });

  it("lists the stores that have it, and on a store page the configurations", () => {
    const [a, b] = stores;
    const d = duoLedgerFrom({ stores, stock: stock({ [a.storeNumber]: [parts[0]], [b.storeNumber]: [parts[0], parts[1]] }), times: times({ n: 2, stores: 1, days: 1 }), sell: sell([]), configsTotal: 8, now });
    const html = render(d);
    expect(html).toContain(`Listed for pickup at 2 of the ${stores.length} Apple Stores in Michigan:`);
    expect(html).toContain("(2 configurations)");
    expect(html).toContain("under the 5-return, 3-day threshold");
    const one = duoLedgerFrom({ stores: [a], stock: stock({ [a.storeNumber]: [parts[0], parts[1]] }), times: times(), sell: sell([]), configsTotal: 8, now });
    const h1 = render(one, true);
    expect(h1).toContain("Apple Somerset lists 2 of 8 iPhone Duo configurations for pickup:");
    expect(h1).toContain("No confirmed iPhone Duo return in Apple Somerset since the record opened on October 29, 2026.");
    expect(h1).toContain("Watch a configuration at this store →");
  });

  it("keeps the last three returns as ledger rows with their lifetimes", () => {
    const [a] = stores;
    const recent = [
      { id: 1, at: at("2026-11-07T15:00:00Z"), storeNumber: a.storeNumber, partNumber: parts[0], lowSec: 40, highSec: 55, exact: true, listedSec: null },
      { id: 2, at: at("2026-11-07T12:00:00Z"), storeNumber: a.storeNumber, partNumber: parts[1], lowSec: 0, highSec: 15, exact: false, listedSec: null },
      { id: 3, at: at("2026-11-08T13:50:00Z"), storeNumber: a.storeNumber, partNumber: parts[2], lowSec: null, highSec: null, exact: false, listedSec: 600 },
    ];
    const html = render(duoLedgerFrom({ stores, stock: stock({}), times: times({ n: 3, stores: 1, days: 2 }), sell: sell(recent), configsTotal: 8, now }));
    expect(html).toContain("The 3 most recent recorded returns");
    expect(html).toContain("listed 40 s–55 s");
    expect(html).toContain("listed about 15 s");
    expect(html).toContain("still listed (10 min)");
  });

  it("says the record could not be read without inventing numbers", () => {
    const html = render(duoLedgerFrom({ stores, stock: stock({}), times: { ...times(), unknown: true }, sell: sell([]), configsTotal: 8, now }));
    expect(html).toContain("The observation record could not be read for this request");
    expect(html).not.toContain("confirmed returns since October 29, 2026\">0");
  });
});
