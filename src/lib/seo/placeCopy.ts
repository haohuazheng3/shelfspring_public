/**
 * Titles, Answer-First intros and keyword sections for the state and city pages (project documentation §10).
 * These are the location tool pages people land on from "apple store {place}" and "iphone duo {place}":
 * every sentence is built from the live stock, the restock log and the 2026 sales-tax table, so each
 * page says something only that place's data can say.
 */
import { PART_INDEX, STATE_CODES, STORES, catalogFor, appleName, statesWithStores, citiesWithStores, type ModelKey, type Store } from "../apple/catalog";
import type { PlaceStats, StoreStockSummary } from "../stock/queries";
import { SALES_TAX, withTax } from "@/content/sales-tax";
import { neighborStates } from "./links";
import { fitTitle, fmtDuration, fmtPrice, listWords, plural, alertHref } from "./enrich";
import type { Block, Faq } from "../content/types";
import type { KeywordSection } from "@/components/content/KeywordSections";

export interface PlaceCopyInput {
  kind: "state" | "city";
  /** "New Jersey" or "Chicago". */
  name: string;
  state: string;
  stateSlug: string;
  citySlug?: string;
  stores: Store[];
  cities?: number;
  stockNow: Record<ModelKey, number>;
  stock: Map<string, StoreStockSummary>;
  duo: PlaceStats;
  max: PlaceStats;
}

/** "in the historical record from October 29" while the 30-day window still reaches back to the start, else "in the last 30 days". */
export function sinceWhen(now = Date.now()): string {
  return now - Date.parse("2026-10-29T00:00:00Z") < 30 * 86400_000 ? "in the historical record from October 29" : "in the last 30 days";
}

const ET = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const money = (n: number) => `$${n.toLocaleString("en-US")}`;

/**
 * Two place names collide with another page's search (DataForSEO, project documentation §10): people looking for New York
 * City type "apple store nyc" (6,600 a month), while the New York state page answers "apple stores in new
 * york" (390); Washington State is "apple stores in washington state" (320), D.C. is "apple store dc"
 * (12,100). The titles and the prose name these places the way their own searches do.
 */
const SAID: Record<string, { title: string; prose: string }> = {
  "city:New York|New York": { title: "NYC", prose: "New York City" },
  "state:Washington": { title: "Washington State", prose: "Washington State" },
};
const said = (i: PlaceCopyInput) => SAID[i.kind === "city" ? `city:${i.name}|${i.state}` : `state:${i.name}`];

/** The place as titles and descriptions name it. */
function where(i: PlaceCopyInput): string {
  return said(i)?.title ?? (i.kind === "city" ? `${i.name}, ${STATE_CODES[i.state] ?? i.state}` : i.name);
}

/** The place as sentences name it. */
export function placeName(i: PlaceCopyInput): string {
  return said(i)?.prose ?? i.name;
}

export function placeTitle(i: PlaceCopyInput): string {
  const n = i.stores.length;
  const w = where(i);
  return fitTitle([
    `iPhone Pickup in ${w}: Compare ${n} Apple Stores`,
    `iPhone Pickup Options in ${w}`,
    `${placeName(i)}: Apple Store Pickup Options`,
    `${placeName(i)}: iPhone Pickup Today`,
    `${placeName(i)}: iPhone Pickup`,
  ]);
}

export function placeDescription(i: PlaceCopyInput): string {
  const n = i.stores.length;
  const tax = SALES_TAX[i.state];
  const taxBit = tax ? (tax.combined === 0 ? `, and no sales tax` : `, plus the price with ${i.state} sales tax`) : "";
  return fitTitle([
    `Plan a pickup in ${where(i)}: Duo at ${i.stockNow.duo}/${n} stores, Pro Max at ${i.stockNow["18-pro-max"]}/${n}. Compare configurations and recorded returns${taxBit}.`,
    `${placeName(i)} pickup options: Duo ${i.stockNow.duo}/${n}, Pro Max ${i.stockNow["18-pro-max"]}/${n} stores. Exact configurations and recent returns.`,
  ], 155);
}

/** One sentence: how many stores, and how many list each model right now (the tax has its own section). */
export function placeIntro(i: PlaceCopyInput): string {
  const n = i.stores.length;
  const cities = i.kind === "state" && i.cities && i.cities > 1 ? ` across ${plural(i.cities, "city", "cities")}` : "";
  return `Build a reachable shortlist in **${placeName(i)}**: **${plural(n, "Apple Store")}**${cities}. The last check found Duo pickup at **${i.stockNow.duo}**, 18 Pro Max at **${i.stockNow["18-pro-max"]}**, and 18 Pro at **${i.stockNow["18-pro"]}**. Compare each exact configuration with the recent return record before deciding where to watch.`;
}

/** Configurations of a model that the fewest stores here have right now (ties broken by catalog order). */
function scarcest(i: PlaceCopyInput, model: ModelKey, k = 2): { label: string; stores: number }[] {
  const counts = new Map<string, number>(catalogFor(model).map((c) => [c.partNumber, 0]));
  for (const s of i.stores) for (const p of i.stock.get(s.storeNumber)?.perModel[model].parts ?? []) counts.set(p, (counts.get(p) ?? 0) + 1);
  return [...counts.entries()].map(([p, n]) => ({ label: `${PART_INDEX.get(p)!.storage} ${PART_INDEX.get(p)!.color}`, stores: n })).sort((a, b) => a.stores - b.stores).slice(0, k);
}

function pairsPct(i: PlaceCopyInput, model: ModelKey): number {
  const total = i.stores.length * catalogFor(model).length;
  const avail = i.stores.reduce((a, s) => a + (i.stock.get(s.storeNumber)?.perModel[model].available ?? 0), 0);
  return Math.round((100 * avail) / Math.max(1, total));
}

const duoStoresNow = (i: PlaceCopyInput) => i.stores.filter((s) => (i.stock.get(s.storeNumber)?.perModel.duo.available ?? 0) > 0);

/** The Duo section's one-sentence answer: which stores list one right now. */
function duoLead(i: PlaceCopyInput): string {
  const n = i.stores.length;
  const have = duoStoresNow(i);
  const st = i.duo;
  if (have.length > 0) return `Start with these pickup candidates: ${listWords(have.map((s) => appleName(s)), 4)}. **${have.length}/${n} stores** list at least one Duo configuration at the last check; confirm the color and storage on Apple.`;
  if (st.month > 0) return `The current Duo shortlist is empty across **${n} stores**. The historical record still contains **${plural(st.month, "confirmed return")}** ${sinceWhen()}; use it to compare where availability has reappeared.`;
  return `There is no current Duo pickup listing across **${n} stores**, and no confirmed return ${sinceWhen()}. That describes the observed record, not the next delivery.`;
}

/** The Duo section's key points: the restock record, the last one, how long a listing lasted, and the alert. */
function duoPoints(i: PlaceCopyInput, w: string, alert: string): Block[] {
  const n = i.stores.length;
  const have = duoStoresNow(i);
  const st = i.duo;
  const last = st.lastRestock ? i.stores.find((s) => s.storeNumber === st.lastRestock!.storeNumber) : undefined;
  const items: string[] = [];
  if (have.length > 0 && st.month > 0) items.push(`**Logged ${sinceWhen()}:** ${plural(st.month, "Duo restock")} at stores here`);
  if (st.lastRestock && last) items.push(`**Last restock:** ${ET.format(new Date(st.lastRestock.at))} ET at ${appleName(last)}`);
  if (st.medianMs != null) items.push(`**Observed listing duration:** a restocked Duo stayed listed about ${fmtDuration(st.medianMs)} (median)`);
  items.push(`**Build a watchlist:** [set an iPhone Duo alert in ${w}](${alert}) at the ${n <= 3 ? (n === 2 ? "two" : "three") : `${Math.min(n, 5)} closest`} stores you can reach`);
  items.push("**One alert** = one store × one exact configuration. Notifications follow detected availability; synchronization and delivery can add delay.");
  const blocks: Block[] = [];
  if (have.length === 0 && st.month === 0) blocks.push({ t: "note", text: "**Keep the two views separate:** a past return is evidence of earlier availability, while the current list is the starting point for an order." });
  blocks.push({ t: "ul", items });
  return blocks;
}

export function placeSections(i: PlaceCopyInput): KeywordSection[] {
  const n = i.stores.length;
  const w = placeName(i);
  const t = SALES_TAX[i.state];
  const alert = alertHref({ model: "duo", state: i.stateSlug, city: i.kind === "city" ? i.citySlug : undefined });
  const scarce = scarcest(i, "18-pro-max");
  const sections: KeywordSection[] = [
    {
      id: "iphone-duo",
      h2: `Duo pickup in ${w}: a shortlist you can act on`,
      lead: duoLead(i),
      blocks: duoPoints(i, w, alert),
    },
    {
      id: "iphone-18-pro-max",
      h2: `Compare the Pro Max alternatives in ${w}`,
      lead: `For the Pro Max, **${i.stockNow["18-pro-max"]}/${n} stores** have at least one option. Across all ${n * 16} store × configuration combinations, **${pairsPct(i, "18-pro-max")}%** are listed now; this is coverage of combinations, not a probability of buying.`,
      blocks: [{ t: "ul", items: [
        ...(scarce.length ? [`**Fewest store choices right now:** ${listWords(scarce.map((x) => `${x.label} (${x.stores} of ${n} stores)`))}`] : []),
        `**iPhone 18 Pro:** at ${i.stockNow["18-pro"]} of ${n} stores, ${pairsPct(i, "18-pro")}% of pairs in stock`,
        `**Logged ${sinceWhen()}:** ${i.max.month ? plural(i.max.month, "18 Pro Max restock") : "no 18 Pro Max restock yet"}`,
        ...(i.max.medianMs != null ? [`**Observed listing duration:** a restocked Pro Max stayed listed about ${fmtDuration(i.max.medianMs)} (median)`] : []),
      ] }],
    },
  ];
  if (t) {
    const nb = neighborStates(i.state).map((s) => ({ name: s.name, t: SALES_TAX[s.name] })).filter((x) => x.t && x.t.combined > 0).sort((a, b) => b.t!.combined - a.t!.combined)[0];
    const rows: [string, number][] = [["iPhone Duo 256GB", 1999], ["iPhone Duo 1TB", 2599], ["iPhone 18 Pro Max 256GB", 1299], ["iPhone 18 Pro Max 1TB", 1899], ["iPhone 18 Pro 256GB", 1199]];
    const table: Block = {
      t: "table",
      head: ["iPhone", "apple.com price", t.combined === 0 ? `In ${i.state}` : `With ${t.combined}% tax`],
      rows: rows.map(([label, price]) => [label, money(price), money(withTax(price, i.state)!.total)]),
      caption: `${i.state} price with the state's average combined sales tax (${t.combined}%)`,
      source: "[Tax Foundation, rates as of January 1, 2026](https://taxfoundation.org/data/all/state/sales-tax-rates/); prices from apple.com",
    };
    const blocks: Block[] = [];
    if (t.combined === 0) {
      if (nb) blocks.push({ t: "note", text: `**Next door:** in ${nb.name} the same phone comes to about ${money(withTax(1999, nb.name)!.total)}, which is why people cross the state line to buy here.` });
    } else {
      blocks.push({ t: "ul", items: [
        `**State sales tax:** ${t.state}%`,
        `**Local taxes, on average:** ${t.avgLocal}%`,
        "**Charged where you pick up:** the store's rate, not your home address",
        ...(i.kind === "city" ? [`**Inside ${w}:** rates can run above the state average`] : []),
      ] });
    }
    blocks.push(table);
    sections.push({
      id: "price-with-tax",
      h2: `Budget for an iPhone Duo pickup in ${w}`,
      lead: t.combined === 0
        ? `**${i.state} has no sales tax**: a 256GB iPhone Duo costs exactly the apple.com price, **$1,999**, at pickup.`
        : `At ${i.state}'s average **${t.combined}%** combined sales tax, a 256GB iPhone Duo comes to about **${money(withTax(1999, i.state)!.total)}** at pickup.`,
      blocks,
    });
  }
  return sections;
}

/** The tax question for the FAQ (null when the state is not in the table). */
export function taxFaq(i: PlaceCopyInput): Faq | null {
  const t = SALES_TAX[i.state];
  if (!t) return null;
  return {
    q: `What should I budget for a Duo pickup in ${placeName(i)}?`,
    a: t.combined === 0
      ? `$1,999 for the 256GB: ${i.state} has no sales tax, so the apple.com price is what you pay at pickup.`
      : `About ${money(withTax(1999, i.state)!.total)} for the 256GB and ${money(withTax(2599, i.state)!.total)} for the 1TB, using ${i.state}'s average combined rate of ${t.combined}% (local rates vary).`,
  };
}

/**
 * The /stores hub's own questions, computed from the store list and the tax table (nothing typed in):
 * how many stores and where most of them are, and which Apple Store states charge no sales tax.
 */
export function hubFaq(): { count: Faq; taxFree: Faq } {
  const states = statesWithStores();
  const cities = citiesWithStores();
  const top = [...states].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).slice(0, 3);
  const free = states.filter((s) => SALES_TAX[s.name]?.combined === 0).map((s) => s.name);
  const highest = states.filter((s) => SALES_TAX[s.name]).sort((a, b) => SALES_TAX[b.name].combined - SALES_TAX[a.name].combined)[0];
  const cheapest = catalogFor("duo").reduce((a, b) => (b.price < a.price ? b : a));
  const taxed = withTax(cheapest.price, highest.name)!;
  return {
    count: { q: "How many Apple Stores are there in the US?", a: `${STORES.length}, in ${cities.length} cities across ${states.length - 1} states and Washington, D.C. ${top[0].name} has the most (${top[0].count}), then ${top[1].name} (${top[1].count}) and ${top[2].name} (${top[2].count}).` },
    taxFree: { q: "Which states with an Apple Store charge no sales tax?", a: `${listWords(free)}. There an iPhone Duo ${cheapest.storage} costs its ${fmtPrice(cheapest.price)} list price at pickup; in ${highest.name} (${taxed.rate}%, the highest average rate of any Apple Store state) it comes to about ${fmtPrice(taxed.total)}.` },
  };
}
