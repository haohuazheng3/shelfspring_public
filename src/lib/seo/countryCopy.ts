/**
 * Titles, Answer-First intros, keyword sections and FAQs for the pages of the other 18 countries (project documentation §12):
 * the country home, its store index, region, city and model pages. Every sentence is built from that country's
 * live stock, its restock log, its apple.com prices and its tax rule, so a page says what only that place's
 * data can say. All English; prices in the local currency; distances in the country's unit.
 */
import { MODELS, catalogFor, citiesWithStores, statesWithStores, storesOf, appleName, modelByKey, type ModelKey, type Store } from "../apple/catalog";
import { COUNTRIES, formatPrice, theName, type Country, type CountryCode } from "../apple/countries";
import type { PlaceStats, StoreStockSummary } from "../stock/queries";
import { CA_PROVINCE_TAX, CA_TAX_SOURCE, TAX_SOURCES, beforeTax, includedRate, pickupHelp, taxName, withProvinceTax } from "@/content/country-tax";
import { fitTitle, fmtDuration, listWords, plural, alertHref, storeTitle as enStoreTitle, type FaqItem } from "./enrich";
import type { Block } from "../content/types";
import type { KeywordSection } from "@/components/content/KeywordSections";
import type { Faq } from "../content/types";
import { hourLabel } from "../content/siteFacts";

/** Imported international inventory history covers this date onward; this is not the new brand’s launch date. */
export const INTL_TRACKING_SINCE = "2026-11-02";

/** The record window: the imported history while it is younger than 30 days, else the rolling 30-day window. */
export function sinceWhenIntl(now = Date.now()): string {
  return now - Date.parse(`${INTL_TRACKING_SINCE}T00:00:00Z`) < 30 * 86400_000 ? "in the historical record from November 2" : "within the latest 30-day window";
}

const money = (c: Country, v: number) => formatPrice(c, v);

/** Lowest price of a model in one storage size (colours cost the same), in the country's currency. */
export function priceOf(cc: CountryCode, model: ModelKey, storage = "256GB"): number | null {
  const prices = catalogFor(model, cc).filter((i) => i.storage === storage).map((i) => i.price);
  return prices.length ? Math.min(...prices) : null;
}
/** Lowest and highest price of a model. */
export function priceRange(cc: CountryCode, model: ModelKey): { low: number; high: number } {
  const p = catalogFor(model, cc).map((i) => i.price);
  return { low: Math.min(...p), high: Math.max(...p) };
}

/** Place names that are also US Apple Store cities or states get the country (project documentation §12: "Manchester, UK"). */
const US_NAMES = new Set([...citiesWithStores("us").map((c) => c.name.toLowerCase()), ...statesWithStores("us").map((s) => s.name.toLowerCase())]);
export function placeLabel(cc: CountryCode, name: string): string {
  return US_NAMES.has(name.toLowerCase()) ? `${name}, ${COUNTRIES[cc].short}` : name;
}

/** "City" where Taiwan's regions are cities; "province", "prefecture"… */
const noun = (c: Country, plural = false) => (plural ? c.regionNounPlural : c.regionNoun) ?? (plural ? "areas" : "area");

/* ------------------------------------------------------------------ tax */

/** One sentence: what a 256GB Duo costs here and what tax that holds (region = a Canadian province, when known). */
export function taxSentence(cc: CountryCode, region?: string): string {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo");
  if (duo == null) return "";
  if (cc === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    if (t) return `${money(c, duo)} is the 256GB iPhone Duo's pre-tax list price; ${region} adds ${t.rate}% ${CA_PROVINCE_TAX[region!].label} at the counter, for roughly ${money(c, t.total)}.`;
    return `${money(c, duo)} is the 256GB iPhone Duo's pre-tax list price; the province of the pickup store adds between 5% and 15%.`;
  }
  const r = includedRate(c);
  if (r == null) return `Hong Kong levies no sales tax, so a 256GB iPhone Duo collected in store costs its ${money(c, duo)} list price and nothing more.`;
  return `${money(c, duo)} is the 256GB iPhone Duo's list price ${c.inName}; the ${r}% ${taxName(c)} is already inside it, so pickup costs nothing extra.`;
}

const PRICE_ROWS: [ModelKey, string][] = [["duo", "256GB"], ["duo", "1TB"], ["18-pro-max", "256GB"], ["18-pro-max", "1TB"], ["18-pro", "256GB"]];

/** The price section of a place or model page: Canada adds its province taxes, everyone else shows what the price holds. */
export function priceSection(cc: CountryCode, placeName: string, region?: string, model: ModelKey = "duo"): KeywordSection {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const base = priceOf(cc, model) ?? 0;
  const src = TAX_SOURCES[cc as Exclude<CountryCode, "us">];
  const rows: [string, number][] = PRICE_ROWS.flatMap(([k, st]) => { const p = priceOf(cc, k, st); return p == null ? [] : [[`${modelByKey(k)!.name} ${st}`, p] as [string, number]]; });
  if (cc === "ca") {
    const t = region ? CA_PROVINCE_TAX[region] : undefined;
    if (t) {
      const table: Block = {
        t: "table",
        head: ["Configuration", "List price (apple.com)", `After ${t.total}% ${t.label}`],
        rows: rows.map(([label, p]) => [label, money(c, p), money(c, withProvinceTax(p, region!)!.total)]),
        caption: `${region} pickup: Canadian list price with ${t.label} (${t.total}%) added`,
        source: `[${src.label}](${src.url}); prices from apple.com/ca`,
      };
      return {
        id: "price-with-tax",
        h2: `What an ${m.name} costs after tax in ${placeName}`,
        lead: `List price for the 256GB ${m.name}: **${money(c, base)} before tax**. ${region} then applies ${t.hst ? `${t.hst}% HST` : t.pst ? `${t.gst}% GST plus ${t.pst}% ${t.label.split(" + ")[1]}` : `${t.gst}% GST and no provincial levy`}, so a store in ${placeName} charges roughly **${money(c, withProvinceTax(base, region!)!.total)}**.`,
        blocks: [{ t: "note", text: "**The pickup store sets the rate:** its province decides the tax, whatever your billing address says." }, table],
      };
    }
    // The whole country: one row per province with a store.
    const provinces = Object.keys(CA_PROVINCE_TAX).filter((p) => storesOf("ca").some((s) => s.state === p));
    const cheapest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total < CA_PROVINCE_TAX[a].total ? b : a));
    const dearest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total > CA_PROVINCE_TAX[a].total ? b : a));
    return {
      id: "price-with-tax",
      h2: `${m.name} after tax, province by province`,
      lead: `**${money(c, base)}** is the pre-tax list price of a 256GB ${m.name}. Collected in ${cheapest} (${CA_PROVINCE_TAX[cheapest].total}%) it totals **${money(c, withProvinceTax(base, cheapest)!.total)}**; in ${dearest} (${CA_PROVINCE_TAX[dearest].total}%) it reaches **${money(c, withProvinceTax(base, dearest)!.total)}**.`,
      blocks: [{
        t: "table",
        head: ["Province", "Levy", "Rate", `${m.short} 256GB after tax`],
        rows: provinces.map((p) => [p, CA_PROVINCE_TAX[p].label, `${CA_PROVINCE_TAX[p].total}%`, money(c, withProvinceTax(base, p)!.total)]),
        caption: "Tax at the pickup counter, for each province that has an Apple Store",
        source: `[${CA_TAX_SOURCE.label}](${CA_TAX_SOURCE.url}); prices from apple.com/ca`,
      }],
    };
  }
  const r = includedRate(c);
  const tn = taxName(c);
  return {
    id: "price",
    h2: `${m.name} ${c.inName}: ${money(c, base)} list price, ${c.taxNote}`,
    lead: r == null
      ? `Hong Kong levies **no sales tax** and no VAT: the **${money(c, base)}** apple.com list price of a 256GB ${m.name} is the whole bill at pickup in ${placeName}.`
      : `**${money(c, base)}** buys the 256GB ${m.name} ${c.inName}; that figure already holds **${r}% ${tn}** (${money(c, beforeTax(c, base))} without it), so collecting in ${placeName} adds no further tax.`,
    blocks: [{
      t: "table",
      head: r == null ? ["Configuration", "List price (apple.com)"] : ["Configuration", "List price (apple.com)", `Net of ${r}% ${tn}`],
      rows: rows.map(([label, p]) => (r == null ? [label, money(c, p)] : [label, money(c, p), money(c, beforeTax(c, p))])),
      caption: `${c.adjective} list prices${r == null ? "" : ` (${tn} inside)`}`,
      source: `[${src.label}](${src.url}); prices from apple.com/${c.buyPath ?? c.shopPath}`,
    }],
  };
}

/** The tax question for a FAQ. */
export function taxFaqIntl(cc: CountryCode, placeName: string, region?: string): FaqItem {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo") ?? 0;
  if (cc === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    return t
      ? { q: `What does a 256GB iPhone Duo cost after tax in ${placeName}?`, a: `Roughly ${money(c, t.total)}: Apple lists it at ${money(c, duo)} before tax, and ${region}'s ${t.rate}% ${CA_PROVINCE_TAX[region!].label} is applied at the store where you collect it.` }
      : { q: "Is tax already inside Apple's Canadian list price?", a: `It is not: ${money(c, duo)} for a 256GB iPhone Duo is the pre-tax figure, and the pickup store's province then applies GST, HST or its own sales tax (Alberta's 5% is the lowest rate, Quebec's 14.975% the highest).` };
  }
  const r = includedRate(c);
  return r == null
    ? { q: "Does Hong Kong add any tax to an iPhone at pickup?", a: `Nothing is added: Hong Kong has neither VAT nor a sales tax, so a 256GB iPhone Duo collected in store costs its ${money(c, duo)} list price.` }
    : { q: `Is the ${r}% ${taxName(c)} already part of what apple.com charges ${c.inName}?`, a: `It is: the ${money(c, duo)} listed for a 256GB iPhone Duo carries the ${r}% ${taxName(c)}, so the counter asks for no extra tax at collection.` };
}

/* ------------------------------------------------------------------ region / city pages */

export interface IntlPlaceInput {
  cc: CountryCode;
  kind: "state" | "city";
  /** "Ontario" or "Toronto". */
  name: string;
  /** The region (province, state…) the place is in, or is. */
  region: string;
  regionSlug: string;
  citySlug?: string;
  stores: Store[];
  cities?: number;
  stockNow: Record<ModelKey, number>;
  stock: Map<string, StoreStockSummary>;
  duo: PlaceStats;
  max: PlaceStats;
}

export function intlPlaceTitle(i: IntlPlaceInput): string {
  const n = i.stores.length;
  const w = placeLabel(i.cc, i.name);
  return fitTitle([
    `Apple Stores in ${w}: Live iPhone Duo Stock at ${n === 2 ? "Both" : `All ${n}`}`,
    `Apple Stores in ${w}: Live iPhone Duo Stock`,
    `Apple Stores in ${w}: iPhone Stock Today`,
    `${w} Apple Stores: iPhone Stock`,
  ]);
}

/** The description's price clause. */
function priceBit(cc: CountryCode, region?: string): string {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo");
  if (duo == null) return "";
  if (cc === "ca") { const t = region ? withProvinceTax(duo, region) : null; return t ? `, about ${money(c, t.total)} with ${region} tax` : `, ${money(c, duo)} before tax`; }
  return `, ${money(c, duo)} ${c.taxNote}`;
}

export function intlPlaceDescription(i: IntlPlaceInput): string {
  const n = i.stores.length;
  const w = placeLabel(i.cc, i.name);
  return fitTitle([
    `${n} Apple Stores in ${w}: ${i.stockNow.duo} have the iPhone Duo for pickup now, ${i.stockNow["18-pro-max"]} the 18 Pro Max. Live stock by store, restock times${priceBit(i.cc, i.region)}.`,
    `${n} Apple Stores in ${w}: ${i.stockNow.duo} with iPhone Duo pickup stock now, ${i.stockNow["18-pro-max"]} with the 18 Pro Max. Live by store, restock times.`,
  ], 155);
}

/** The opening line: the place's store count, then each model's shelf count at the last observation (price has its own section). */
export function intlPlaceIntro(i: IntlPlaceInput): string {
  const n = i.stores.length;
  const cities = i.kind === "state" && i.cities && i.cities > 1 ? ` (${plural(i.cities, "city", "cities")})` : "";
  return `${i.name}${cities} has **${plural(n, "Apple Store")}** in the ledger. At the latest observation the Duo was on the shelf at **${i.stockNow.duo}**, the 18 Pro Max at **${i.stockNow["18-pro-max"]}** and the 18 Pro at **${i.stockNow["18-pro"]}**.`;
}

/** "Nov 2, 3:04 PM GMT" in the country's zone. */
export function whenIn(cc: CountryCode, iso: string | Date): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: COUNTRIES[cc].timeZone, month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(new Date(iso));
}

export function scarcest(i: IntlPlaceInput, model: ModelKey, k = 2): { label: string; stores: number }[] {
  const items = catalogFor(model, i.cc);
  const counts = new Map<string, number>(items.map((c) => [c.partNumber, 0]));
  for (const s of i.stores) for (const p of i.stock.get(s.storeNumber)?.perModel[model].parts ?? []) if (counts.has(p)) counts.set(p, (counts.get(p) ?? 0) + 1);
  const by = new Map(items.map((c) => [c.partNumber, c]));
  return [...counts.entries()].map(([p, n]) => ({ label: `${by.get(p)!.storage} ${by.get(p)!.color}`, stores: n })).sort((a, b) => a.stores - b.stores).slice(0, k);
}

export function pairsPct(i: IntlPlaceInput, model: ModelKey): number {
  const total = i.stores.length * catalogFor(model, i.cc).length;
  const avail = i.stores.reduce((a, s) => a + (i.stock.get(s.storeNumber)?.perModel[model].available ?? 0), 0);
  return Math.round((100 * avail) / Math.max(1, total));
}

export const duoStoresNow = (i: IntlPlaceInput) => i.stores.filter((s) => (i.stock.get(s.storeNumber)?.perModel.duo.available ?? 0) > 0);

/** The Duo section's one-sentence answer: which stores list one right now. */
function duoLead(i: IntlPlaceInput): string {
  const n = i.stores.length;
  const have = duoStoresNow(i);
  const st = i.duo;
  if (have.length > 0) return `On the shelf at the last observation: ${listWords(have.map((s) => appleName(s)), 4)} (**${have.length}/${n} stores**).`;
  if (st.month > 0) return `The Duo is off the shelf at all **${n} stores** for now; the ledger still holds **${plural(st.month, "confirmed return")}** ${sinceWhenIntl()}.`;
  return `The Duo is off the shelf at all **${n} stores**, and the ledger shows no confirmed return ${sinceWhenIntl()}.`;
}

/** The Duo section's key points: the restock record, the last one, how long a listing lasted, and the alert. */
function duoPoints(i: IntlPlaceInput, w: string, alert: string): Block[] {
  const n = i.stores.length;
  const have = duoStoresNow(i);
  const st = i.duo;
  const last = st.lastRestock ? i.stores.find((s) => s.storeNumber === st.lastRestock!.storeNumber) : undefined;
  const items: string[] = [];
  if (have.length > 0 && st.month > 0) items.push(`**Returns ${sinceWhenIntl()}:** ${plural(st.month, "Duo return")} across these stores`);
  if (st.lastRestock && last) items.push(`**Latest return:** ${appleName(last)}, ${whenIn(i.cc, st.lastRestock.at)}`);
  if (st.medianMs != null) items.push(`**Median shelf time:** about ${fmtDuration(st.medianMs)} from return to sell-out`);
  items.push(`**Watchlist:** [watch the iPhone Duo in ${w}](${alert}) at the ${n <= 3 ? (n === 2 ? "two" : "three") : `${Math.min(n, 5)} nearest`} stores within your reach`);
  items.push("**Rule size:** each alert covers a single store and a single exact configuration; delivery follows detected availability after synchronization, with variable timing");
  const blocks: Block[] = [];
  if (have.length === 0 && st.month === 0) blocks.push({ t: "note", text: "**No recorded return yet:** keep the configuration you want on a watchlist, and compare the latest observation before ordering." });
  blocks.push({ t: "ul", items });
  return blocks;
}

export function intlPlaceSections(i: IntlPlaceInput): KeywordSection[] {
  const n = i.stores.length;
  const w = i.name;
  const alert = alertHref({ model: "duo", state: i.regionSlug, city: i.kind === "city" ? i.citySlug : undefined, country: i.cc });
  const scarce = scarcest(i, "18-pro-max");
  const pm = catalogFor("18-pro-max", i.cc).length;
  return [
    {
      id: "iphone-duo",
      h2: `${w}: where the iPhone Duo is on the shelf`,
      lead: duoLead(i),
      blocks: duoPoints(i, w, alert),
    },
    {
      id: "iphone-18-pro-max",
      h2: `${w}: the 18 Pro Max, store by store`,
      lead: `The Pro Max sits on the shelf at **${i.stockNow["18-pro-max"]}/${n} stores**; counting every store × configuration combination (${n * pm}), **${pairsPct(i, "18-pro-max")}%** are listed.`,
      blocks: [{ t: "ul", items: [
        ...(scarce.length ? [`**Thinnest choice now:** ${listWords(scarce.map((x) => `${x.label}, ${x.stores}/${n} stores`))}`] : []),
        `**18 Pro alongside it:** ${i.stockNow["18-pro"]}/${n} stores, ${pairsPct(i, "18-pro")}% of combinations listed`,
        `**Pro Max returns ${sinceWhenIntl()}:** ${i.max.month ? plural(i.max.month, "confirmed return") : "none recorded"}`,
        ...(i.max.medianMs != null ? [`**Median shelf time:** about ${fmtDuration(i.max.medianMs)} for a returned Pro Max`] : []),
      ] }],
    },
    priceSection(i.cc, w, i.cc === "ca" ? i.region : undefined),
  ];
}

/* ------------------------------------------------------------------ country: store index and home */

export function storesIndexTitle(cc: CountryCode): string {
  const n = storesOf(cc).length;
  const w = theName(COUNTRIES[cc]);
  return fitTitle([`Apple Stores in ${w}: Live iPhone Duo Stock at ${n === 2 ? "Both" : `All ${n}`}`, `Apple Stores in ${w}: Live iPhone Duo Stock`, `Apple Stores in ${COUNTRIES[cc].short}: Live iPhone Stock`], 70);
}

export function homeTitle(cc: CountryCode): string {
  const n = storesOf(cc).length;
  return `iPhone Stock Checker ${COUNTRIES[cc].short}: ${plural(n, "Apple Store")}, Checked Every 15s`;
}

export function homeH1(cc: CountryCode): string {
  const n = storesOf(cc).length;
  const c = COUNTRIES[cc];
  return n === 1 ? `Pickup ledger for the Apple Store ${c.inName}` : `Pickup ledger for ${n} Apple Stores ${c.inName}`;
}

/** The coverage phrase: "39 Apple Stores across the UK" / "the single Apple Store in Austria". */
export function allStoresPhrase(cc: CountryCode): string {
  const n = storesOf(cc).length;
  return n === 1 ? `the single Apple Store ${COUNTRIES[cc].inName}` : `${n} Apple Stores across ${theName(COUNTRIES[cc])}`;
}

/** Where a country's stores are ("spread over 22 cities in 6 provinces"). */
export function spreadPhrase(cc: CountryCode): string {
  const c = COUNTRIES[cc];
  const regions = statesWithStores(cc);
  const cities = citiesWithStores(cc);
  const n = storesOf(cc).length;
  if (n === 1) return `located in ${cities[0].name}`;
  if (cities.length === 1) return `every one of them in ${cities[0].name}`;
  if (!c.regionNoun || regions.length === 1) return `spread over ${plural(cities.length, "city", "cities")}`;
  return `spread over ${plural(cities.length, "city", "cities")} in ${regions.length} ${noun(c, regions.length !== 1)}`;
}

/** The model page's bound titles (project documentation §12): "{Model} in Stock {inCountry}: Live at All {n} Apple Stores". */
export function modelPageTitles(cc: CountryCode, model: ModelKey): { title: string; h2: string[] } {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const n = storesOf(cc).length;
  const all = n === 1 ? "the Apple Store" : n === 2 ? "Both Apple Stores" : `All ${n} Apple Stores`;
  return {
    title: fitTitle([`${m.name} in Stock ${c.inName}: Live at ${all}`, `${m.name} in Stock ${c.inName}: Live`, `${m.name} Stock ${c.inName}`], 70),
    h2: [`${m.name} ${c.inName}: which shelves hold it now`, priceSection(cc, theName(c), undefined, model).h2],
  };
}

/** The model page's Answer-First intro and description. */
export function modelIntro(cc: CountryCode, model: ModelKey, inStock: number): string {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const n = storesOf(cc).length;
  const r = priceRange(cc, model);
  const price = cc === "ca" ? `**${money(c, r.low)}** before tax` : `**${money(c, r.low)}**, ${c.taxNote}`;
  return `${inStock === 0 ? `The ${m.name} is off the shelf at ${n === 1 ? "the single Apple Store" : `all ${n} Apple Stores`} ${c.inName}` : `The ${m.name} is on the shelf at **${inStock}/${n}** Apple Stores ${c.inName}`} as of the observation time shown; list prices start at ${price}.`;
}

export function modelDescription(cc: CountryCode, model: ModelKey, inStock: number): string {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const n = storesOf(cc).length;
  const r = priceRange(cc, model);
  return fitTitle([
    `Is the ${m.name} in stock ${c.inName}? ${inStock} of ${n} Apple Stores have it for pickup now. Live by store and configuration, from ${money(c, r.low)}${cc === "ca" ? " before tax" : ""}, with restock times.`,
    `${m.name} ${c.inName}: ${inStock} of ${n} Apple Stores have it now. Live pickup stock by store and configuration, restock times and alerts.`,
  ], 155);
}

/** Every model's stock line for the country home's table. */
export function modelRows(cc: CountryCode, storesNow: Record<ModelKey, number>, restocks: Record<ModelKey, number>): string[][] {
  const prefix = cc === "us" ? "" : `/${cc}`;
  return MODELS.map((m) => [`[${m.name}](${prefix}/stock/${m.slug})`, String(catalogFor(m.key, cc).length), String(storesNow[m.key] ?? 0), String(restocks[m.key] ?? 0)]);
}

/* ------------------------------------------------------------------ country home (moved from HomePage) */

export function homeDescription(cc: CountryCode): string {
  const c = COUNTRIES[cc];
  const n = storesOf(cc).length;
  return `Check iPhone Duo, 18 Pro and 18 Pro Max pickup stock at ${allStoresPhrase(cc)}, with recent recorded observations. ${n === 1 ? "Prices" : "Restock times, prices"} in ${c.currency}; a push when your store restocks.`;
}

export function homeIntro(cc: CountryCode): string {
  const c = COUNTRIES[cc];
  const n = storesOf(cc).length;
  return `Latest shelf count ${c.inName}: iPhone Duo at **{{duo.storesNow}}/${n}** Apple Store${n === 1 ? "" : "s"}, 18 Pro at **{{pro.storesNow}}**, 18 Pro Max at **{{pm.storesNow}}**.`;
}

export interface HomeCopyInput {
  cc: CountryCode;
  /** Stores with each model now / restocks logged (the table). */
  storesNow: Record<ModelKey, number>;
  restocks: Record<ModelKey, number>;
  /** Paths the copy links to (English form). */
  restocksPath: string;
  index: { path: string; indexable: boolean } | null;
}

/** The country home's three keyword sections (the price one from priceSection). */
export function homeSections(i: HomeCopyInput): KeywordSection[] {
  const cc = i.cc;
  const c = COUNTRIES[cc];
  const n = storesOf(cc).length;
  const stores = storesOf(cc);
  const unit = c.unit === "mi" ? "miles" : "kilometres";
  return [
    {
      id: "iphone-stock",
      h2: `The ${c.adjective} shelf: Duo, 18 Pro and Pro Max per store`,
      lead: `ShelfSpring logs apple.com's in-store pickup listings for each configuration at ${allStoresPhrase(cc)} from a synchronized inventory feed, readable per store${n > 1 ? `, per ${c.regionNoun ?? "city"}` : ""} and per configuration.`,
      blocks: [
        { t: "table", head: ["iPhone", "Tracked configurations", "Stores with it on the shelf", "Returns in the ledger"], rows: modelRows(cc, i.storesNow, i.restocks), caption: `Ledger scope ${c.inName}, observed {{asOf}}` },
        { t: "ul", items: [
          `**Scope:** ${spreadPhrase(cc)}; part numbers and list prices follow Apple's ${c.adjective} store`,
          "**Read the timestamp:** every plan uses the same stock feed; collection and synchronization can add delay",
          "**Matching source checks:** a recorded change requires confirmation; an alert cannot reserve inventory",
          `**Each confirmed change** lands in the [returns ledger](${i.restocksPath}), the source of the hour charts on ${i.index?.indexable ? `[each store page](${i.index.path})` : "the store page"}`,
        ] },
        { t: "img", id: "phone-notification" },
      ],
    },
    priceSection(cc, theName(c)),
    {
      id: "alerts",
      h2: `A watchlist for Apple Store pickups ${c.inName}`,
      lead: `Build a practical pickup shortlist: choose reachable Apple Store${n === 1 ? "" : "s"} and acceptable configurations. Browsing stays free; paid alerts can notify you after matching returns reach ShelfSpring. Delivery times vary.`,
      blocks: [
        { t: "ol", items: [
          "Open **Alert me**, then set model, capacity and finish.",
          n === 1 ? `Select the store: ${stores[0].name} in ${stores[0].city}.` : `Select reachable stores; the list starts with the closest, showing ${unit} by road and an estimated drive.`,
          "On iPhone, install ShelfSpring from Safari to the Home Screen and turn notifications on ([setup guide](/install)).",
          "From a notification, go to apple.com, confirm the store still lists it, and choose in-store pickup there.",
        ] },
        { t: "table", head: ["Watchlist", "Monthly (USD)", "Store × configuration rules"], rows: [["Plus", "$5", "10"], ["Pro", "$10", "20"], ["Max", "$20", "50"]], caption: "Each rule watches one store and one exact configuration; reading the ledger costs nothing ([plans](/pricing))" },
        { t: "note", text: "**Choose from evidence:** compare current listings, sample sizes and recent returns before deciding which stores belong on your watchlist." },
        { t: "img", id: "apple-store-pickup-counter" },
      ],
    },
  ];
}

export interface RestockTimesBrief {
  /** Confirmed Duo restocks since tracking began, stores with one, stores in the country. */
  n: number; stores: number; storesTotal: number;
  /** The usual local hour, once the pattern threshold is met (5 restocks on 3 days), else null. */
  peakHour: number | null;
  /** Path of the country's restock-times page (English form). */
  path: string;
}

/** The country home's FAQ (live tokens filled by RichFaq). */
export function homeFaq(cc: CountryCode, rt: RestockTimesBrief): Faq[] {
  const c = COUNTRIES[cc];
  const n = storesOf(cc).length;
  const p = cc === "us" ? "" : `/${cc}`;
  const when = rt.n === 0
    ? `The imported record from November 2 holds no confirmed return yet; [the Duo returns record ${c.inName}](${rt.path}) will sort every one by local hour and weekday.`
    : rt.peakHour != null
      ? `They cluster near **${hourLabel(rt.peakHour)} local time**, going by ${rt.n.toLocaleString("en-US")} confirmed returns at ${rt.stores}/${rt.storesTotal} stores in the record from November 2 ([full hour and weekday record](${rt.path})).`
      : `The record from November 2 holds ${rt.n.toLocaleString("en-US")} confirmed returns at ${rt.stores}/${rt.storesTotal} stores, spread over too few days for a usual hour ([full hour and weekday record](${rt.path})).`;
  // English country homes keep the FAQ they had (pages with search and AI traffic stay as they are); the native
  // versions answer the restock-times question too (their own place builders).
  void when;
  return [
    { q: `Where ${c.inName} is the iPhone Duo on the shelf at the moment?`, a: `At {{duo.storesNow}}/${n} stores in the latest observation ({{asOf}}); [the Duo board ${c.inName}](${p}/stock/iphone-duo) lists every store and configuration with its own timestamp.` },
    { q: "When does an alert reach me?", a: `After a return shows up in the synchronized feed ${c.inName}. Collection, synchronization, the network and your device settings all add some delay, and every plan reads the same feed, so check the listing on Apple before you travel.` },
    { q: "What is free and what is paid?", a: "Reading the ledger, the map and the returns log is free. Alert rules come in Plus ($5 a month, 10 rules), Pro ($10, 20) and Max ($20, 50), charged in US dollars and cancellable from your account ([plans](/pricing))." },
    taxFaqIntl(cc, theName(c)),
    { q: "Will ShelfSpring hold a phone for me?", a: `It cannot: a notification points at a detected listing, and only an order placed and confirmed on apple.com secures the phone ([Apple's pickup help](${pickupHelp(cc).url})).` },
  ];
}

/** "across the UK"; a one-store country keeps "in Austria". */
const acrossName = (cc: CountryCode) => (storesOf(cc).length === 1 ? COUNTRIES[cc].inName : `across ${theName(COUNTRIES[cc])}`);

/** Small labels of the country home. */
export const homeLabels = {
  appName: (cc: CountryCode) => `ShelfSpring pickup ledger ${COUNTRIES[cc].short}`,
  offer: "Ledger, map and returns log cost nothing; alert plans start at $5 a month",
  itemList: (cc: CountryCode) => `Apple Stores ${COUNTRIES[cc].inName}`,
  restockTimesChip: "Hours of past returns",
  /** The chip to the store index on a country with regions: "Browse by province". */
  storesByRegion: (cc: CountryCode) => `Browse by ${noun(COUNTRIES[cc])}`,
  browse: (cc: CountryCode) => `More of the ledger ${COUNTRIES[cc].inName}`,
  selloutH2: (cc: CountryCode) => `How long did a returned iPhone stay on the shelf ${COUNTRIES[cc].inName}?`,
  selloutLabel: (cc: CountryCode) => acrossName(cc),
  last24Label: (cc: CountryCode) => acrossName(cc),
  newsroom: "Apple Newsroom: iPhone Duo arrives at Apple Store locations worldwide (Oct 23, 2026)",
};

/** A store page's <title> and H1 ("Apple Ginza: iPhone Stock Today, Pickup & Hours"); `region`: the city or state in parentheses when the store is its only one. */
export function storeTitleIntl(s: Store, region?: string): string {
  return enStoreTitle(s, undefined, undefined, region);
}
