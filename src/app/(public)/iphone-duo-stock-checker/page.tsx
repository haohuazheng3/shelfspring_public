import { withCuratedMetadata } from "@/lib/seo/curation";
import { GuideLayout } from "@/components/guides/GuideLayout";
/** A verification workflow for pickup evidence: identify the configuration and place, inspect timestamps, and confirm the current offer with Apple. */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cache } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { Breadcrumbs, LinkRow, RelatedBlock } from "@/components/seo/Related";
import { RichFaq, SourceList } from "@/components/content/RichFaq";
import { JsonLd } from "@/components/seo/JsonLd";
import { LiveChecked } from "@/components/site/LiveChecked";
import { Swatch } from "@/components/stores/ConfigTable";
import { Measured, Points, Stat, StatGrid, StepStrip, type Point } from "@/components/ui/Viz";
import { getFacts, tokenValue } from "@/lib/content/facts";
import type { Faq, Source } from "@/lib/content/types";
import { ALL_STORES, STORES, appleBuyUrl, appleName, catalogFor, cityLine, statePath, statesWithStores, storeByNumber, storePath, storesOf, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, INTL_CODES, prefixOf } from "@/lib/apple/countries";
import { PLANS } from "@/lib/plans";
import { PATTERN_MIN, PATTERN_MIN_DAYS, TRACKING_SINCE_INTL, TRACKING_SINCE_US, hourLabel, localStamp, siteFacts } from "@/lib/content/siteFacts";
import { busiestWindow, duoRestockTimes, hourShare, rangeLabel } from "@/lib/content/restockTimes";
import { recentByConfig } from "@/lib/stock/recent";
import { modelStock, restockFeed, storesWithStockNow } from "@/lib/stock/queries";
import { SALES_TAX_SOURCE, withTax } from "@/content/sales-tax";
import { alertHref, compressHours, fmtPrice, fullAddress, normalizeHours, plural } from "@/lib/seo/enrich";

export const revalidate = 3600;

const SITE = "https://shelfspring.com";
const PATH = "/iphone-duo-stock-checker";
const TITLE_STATIC = "Check iPhone Duo Pickup: Time, Configuration and Store";
const APPLE_PICKUP = "https://www.apple.com/shop/shipping-pickup";
const APPLE_DUO = "https://www.apple.com/shop/buy-iphone/iphone-duo";
const WIKI_INVENTORY = "https://en.wikipedia.org/wiki/Inventory";
/** Shared plan context for the guide and its FAQ. */
const PRICE_SENTENCE = `Alerts from $${PLANS.plus.priceUsd}/month: save store–configuration matches and receive notifications after newly detected availability reaches ShelfSpring. Delivery times vary.`;
const QUOTE = "ShelfSpring is an independent view of synchronized pickup observations. Apple controls its listings and orders; the displayed evidence does not reserve inventory.";

const n = (x: number) => x.toLocaleString("en-US");
/** Whole-percent shares; a share under half a percent reads "<1%", never a misleading "0%". */
const pct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
const LONG = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" });
const longDate = (ymd: string) => LONG.format(new Date(`${ymd}T12:00:00Z`));
const SHORT = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric" });
const shortDate = (ymd: string) => SHORT.format(new Date(`${ymd}T12:00:00Z`));
const UPDATED = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
const hl = (h: number) => hourLabel(h % 24);

/** One read for generateMetadata and the page (React cache): the title's live count is the table's live count. */
const load = cache(async () => Promise.all([
  modelStock("duo", "us"),
  recentByConfig({ country: "us" }),
  duoRestockTimes("us"),
  siteFacts(),
  getFacts(),
  restockFeed({ model: "duo", limit: 200, country: "us" }),
  Promise.all(INTL_CODES.map((cc) => storesWithStockNow(undefined, cc))),
]));

/** Distinct US stores with at least one iPhone Duo configuration available, from the model's status rows. */
function storesNowFrom(rows: { storeNumber: string; status: string }[]): number {
  return new Set(rows.filter((r) => r.status === "available").map((r) => r.storeNumber)).size;
}

export async function generateMetadata(): Promise<Metadata> {
  const [rows, , , , facts] = await load();
  // A status row exists for every tracked store × configuration, so no rows at all means the read failed, not "no stock".
  const live = rows.length > 0;
  const duoNow = live ? storesNowFrom(rows) : null;
  const asOf = tokenValue("asOf", facts) ?? "";
  const title = duoNow ? `iPhone Duo Pickup Check: ${duoNow} Stores in the Snapshot` : TITLE_STATIC;
  // ≤ 158 characters with the largest possible count and the longest "asOf" ("Nov 25, 12:45 PM ET"): 157.
  const description = duoNow != null
    ? `iPhone Duo snapshot: ${duoNow}/${STORES.length} US stores (${asOf}). Check the configuration, observation time and pickup offer before ordering.`
    : `Check an iPhone Duo listing in three steps: time, configuration and store. Compare ${STORES.length} US locations, then verify the offer with Apple.`;
  return withCuratedMetadata("/iphone-duo-stock-checker", {
    title: { absolute: `${title} · ShelfSpring` },
    description,
    alternates: { canonical: PATH },
    openGraph: { type: "article", siteName: "ShelfSpring", title, description, url: PATH },
  });
}

const th = "border-b border-line-2 py-2 pe-3 text-start font-semibold text-ink";
const td = "py-2 pe-3 align-top tabular-nums";
const rowTh = "py-2 pe-3 text-start font-medium text-ink";

function Table({ caption, head, children, min = "28rem" }: { caption: string; head: string[]; children: ReactNode; min?: string }) {
  return (
    <div className="my-5 overflow-x-auto">
      <table className="w-full border-collapse text-sm" style={{ minWidth: min }}>
        <caption className="mb-2 text-start text-xs text-ink-3">{caption}</caption>
        <thead><tr>{head.map((h) => <th key={h} scope="col" className={th}>{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/** Keyword lines inside the prose pane (the pane's list indent is turned off). */
function Keys({ items, className = "my-3" }: { items: Point[]; className?: string }) {
  return <Points items={items} className={`${className} ml-0!`} />;
}

/** A row of page links as chips. */
function ChipLinks({ items }: { items: { href: string; label: string }[] }) {
  return <div className="my-3 flex flex-wrap gap-1.5">{items.map((l) => <Link key={l.href} href={l.href} className="chip chip-sm no-underline!">{l.label}</Link>)}</div>;
}

/** "Reads → means": a two-column legend. */
function KeyTable({ head, rows }: { head: [string, string]; rows: [ReactNode, ReactNode][] }) {
  return (
    <div className="my-4 overflow-x-auto">
      <table className="w-full min-w-[20rem] text-sm">
        <thead><tr className="text-start text-xs uppercase tracking-wide text-ink-3"><th className="pb-2 pe-3 font-semibold">{head[0]}</th><th className="pb-2 font-semibold">{head[1]}</th></tr></thead>
        <tbody>
          {rows.map(([a, b], i) => (
            <tr key={i} className="border-t border-line align-top">
              <td className="whitespace-nowrap py-2 pe-3 font-semibold text-ink">{a}</td>
              <td className="py-2 text-ink-2">{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface StateRow { name: string; path: string; stores: number; withStock: number; configs: number; restocks: number | null; lastAt: string | null; lastStore: Store | null }

export default async function StockCheckerPage() {
  const [rows, recent, t, f, facts, feed, intlNow] = await load();
  const live = rows.length > 0;
  const available = rows.filter((r) => r.status === "available");
  const duoNow = storesNowFrom(rows);
  const asOf = tokenValue("asOf", facts) ?? "";
  const updated = `${UPDATED.format(new Date(facts.at))} ET`;
  const intlStores = ALL_STORES.length - STORES.length;
  const items = catalogFor("duo");
  const cfg = (p: string) => { const i = items.find((x) => x.partNumber === p); return i ? `${i.storage} ${i.color}` : p; };
  const since = longDate(t.since);
  const sell = t.sellout;
  const alert = alertHref({ model: "duo" });
  /** The newest check among the model's status rows: the figure LiveChecked keeps true while the page is open. */
  const lastChecked = rows.reduce<string | null>((a, r) => (r.lastCheckedAt && (!a || r.lastCheckedAt > a) ? r.lastCheckedAt : a), null);
  const stampAt = (iso: string, store: Store) => `${localStamp(iso, store)} local time`;

  // ---- the checker: every US state, stores listing a Duo now, configurations, restocks and the last one
  const byState = new Map<string, { stores: Set<string>; parts: Set<string> }>();
  for (const r of available) {
    const s = storeByNumber(r.storeNumber);
    if (!s) continue;
    const a = byState.get(s.state) ?? { stores: new Set<string>(), parts: new Set<string>() };
    a.stores.add(r.storeNumber); a.parts.add(r.partNumber); byState.set(s.state, a);
  }
  const region = new Map(t.byRegion.map((r) => [r.name, r]));
  // The last restock per state: the 5-minute restock-times read, overlaid with the live feed where it is newer.
  const last = new Map<string, { at: string; store: Store }>();
  for (const r of t.byRegion) { const s = r.lastStore ? storeByNumber(r.lastStore) : undefined; if (r.lastAt && s) last.set(r.name, { at: r.lastAt, store: s }); }
  for (const r of feed) { const cur = last.get(r.store.state); const at = r.at.toISOString(); if (!cur || at > cur.at) last.set(r.store.state, { at, store: r.store }); }
  const states: StateRow[] = statesWithStores().map((st) => ({
    name: st.name, path: statePath(st.name), stores: st.count,
    withStock: byState.get(st.name)?.stores.size ?? 0, configs: byState.get(st.name)?.parts.size ?? 0,
    restocks: t.unknown ? null : region.get(st.name)?.restocks ?? 0,
    lastAt: last.get(st.name)?.at ?? null, lastStore: last.get(st.name)?.store ?? null,
  })).sort((a, b) => (b.withStock > 0 ? 1 : 0) - (a.withStock > 0 ? 1 : 0) || b.withStock - a.withStock || a.name.localeCompare(b.name));
  const statesHit = states.filter((s) => s.withStock > 0);
  const topState = statesHit[0];
  const latest = recent.latest ? { ...recent.latest, store: storeByNumber(recent.latest.storeNumber) } : null;

  // ---- configurations: stores listing each one now, restocks in 24 h and since tracking began
  const nowByPart = new Map<string, number>();
  for (const r of available) nowByPart.set(r.partNumber, (nowByPart.get(r.partNumber) ?? 0) + 1);
  const sincePart = new Map(t.byPart.map((p) => [p.partNumber, p]));
  const dayPart = new Map(recent.byPart.map((p) => [p.partNumber, p]));
  const configs = [...items].sort((a, b) => (sincePart.get(b.partNumber)?.restocks ?? 0) - (sincePart.get(a.partNumber)?.restocks ?? 0) || (nowByPart.get(b.partNumber) ?? 0) - (nowByPart.get(a.partNumber) ?? 0));
  const topCfg = !t.unknown && t.n > 0 ? configs.find((i) => (sincePart.get(i.partNumber)?.restocks ?? 0) > 0) : undefined;
  const topCfgN = topCfg ? sincePart.get(topCfg.partNumber)!.restocks : 0;
  const mostNow = live ? [...configs].sort((a, b) => (nowByPart.get(b.partNumber) ?? 0) - (nowByPart.get(a.partNumber) ?? 0))[0] : undefined;
  const mostNowN = mostNow ? nowByPart.get(mostNow.partNumber) ?? 0 : 0;

  // ---- one real store: the US store with the most confirmed Duo restocks since tracking began
  const topRow = t.topStores[0];
  const topStore = topRow ? storeByNumber(topRow.storeNumber) : undefined;
  const topPattern = topStore ? f.patterns[topStore.storeNumber] : undefined;
  const topNow = topStore ? available.filter((r) => r.storeNumber === topStore.storeNumber).length : 0;
  const cheapest = Math.min(...items.map((i) => i.price));
  const topTax = topStore ? withTax(cheapest, topStore.state) : null;
  const topHours = topStore?.hours ? compressHours(normalizeHours(topStore.hours)) : null;

  // ---- the observed pattern
  const pattern = !t.unknown && t.peakHour != null;
  const w = busiestWindow(t.byHour);

  // ---- the 18 other countries
  const countries = INTL_CODES.map((cc, i) => ({ cc, now: intlNow[i].duo, stores: storesOf(cc).length })).sort((a, b) => (b.now > 0 ? 1 : 0) - (a.now > 0 ? 1 : 0));
  const intlDuoNow = countries.reduce((a, c) => a + c.now, 0);
  const intlHit = countries.filter((c) => c.now > 0);

  const sections = [
    { id: "apple", nav: "Choose the exact question" },
    { id: "states", nav: "Check the place" },
    { id: "configs", nav: "Check the version" },
    { id: "store", nav: "Inspect a store record" },
    { id: "how", nav: "Check the evidence" },
    { id: "when", nav: "Keep patterns in context" },
    { id: "countries", nav: "Change markets" },
    { id: "alerts", nav: "Save a repeat check" },
  ];
  const faq: Faq[] = [
    { q: "What question does the checker answer?", a: `It brings together recorded pickup availability for ${STORES.length} US Apple Stores and ${intlStores} stores in ${INTL_CODES.length} other markets. Use it to identify a store and exact configuration worth checking with Apple. It does not report warehouse quantities, carrier inventory or delivery promises.` },
    { q: "Which timestamp matters when the page and the stock disagree?", a: "The page-render time describes when the page was prepared. A stock observation describes when that source record was checked. Neither guarantees the listing will still be available when you order. Compare the exact store and configuration on Apple’s current page." },
    { q: "What does a blank or zero stock count mean?", a: "A readable zero reports no available configuration in that snapshot. A dash means the required data was not available to this view. A historical return can coexist with either result because it records a past change, not a current reservation." },
    { q: "Can I use the checker without an account?", a: `The inventory pages, store directory, map and event history are free to browse. Optional alerts start at $${PLANS.plus.priceUsd} per month and use the same inventory feed. An account and an eligible plan are needed to save paid matches; [pricing](/pricing) explains the current limits.` },
    { q: "Does a frequent historical return make a configuration easier to buy?", a: "It means that version appeared more often in the observed sample. The data does not measure competing shoppers or units per listing, so it cannot turn that count into a purchase probability. Keep storage, color, budget and travel requirements in view." },
  ];
  const sources: Source[] = [
    { label: "Apple’s pickup process", url: APPLE_PICKUP },
    { label: "Apple’s iPhone Duo configuration page", url: APPLE_DUO },
    { label: SALES_TAX_SOURCE.label, url: SALES_TAX_SOURCE.url },
    { label: "Inventory: background terminology", url: WIKI_INVENTORY },
  ];
  const description = `A checklist for comparing iPhone Duo pickup evidence: verify observation time, configuration and store, then confirm the offer with Apple. Includes ${STORES.length} US stores.`;
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${SITE}${PATH}`, url: `${SITE}${PATH}`, name: TITLE_STATIC, description, isPartOf: { "@id": `${SITE}/#website` }, about: { "@id": `${SITE}/#organization` }, dateModified: facts.at },
      {
        "@type": "WebApplication", "@id": `${SITE}${PATH}#app`, name: "ShelfSpring iPhone Duo stock checker", url: `${SITE}${PATH}`,
        description: `Latest recorded Apple Store pickup listings for iPhone Duo across ${STORES.length} US stores and ${intlStores} stores in ${INTL_CODES.length} other countries, alongside historical returns.`,
        applicationCategory: "UtilitiesApplication", operatingSystem: "Any",
        featureList: [
          `Live iPhone Duo pickup stock at ${STORES.length} US Apple Stores, by state, store and configuration`,
          "Observation timestamps beside the latest stock listings",
          "Every restock confirmed by a second check before it counts",
          "Recorded availability changes with store, configuration and local time",
          "Notifications after matching returns reach the synchronized feed; timing varies",
        ],
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: `Free to browse; alerts from $${PLANS.plus.priceUsd}/month` },
        publisher: { "@id": `${SITE}/#organization` },
      },
      {
        "@type": "Dataset", "@id": `${SITE}${PATH}#dataset`, name: "iPhone Duo pickup stock by US state, live",
        description: `For each US state with an Apple Store: latest recorded iPhone Duo listings by configuration, with historical returns from ${since}. Imported records preserve their original observation dates.`,
        url: `${SITE}${PATH}`, publisher: { "@id": `${SITE}/#organization` }, isAccessibleForFree: true,
        temporalCoverage: `${TRACKING_SINCE_US}/..`, spatialCoverage: "Apple Stores in the United States",
        variableMeasured: ["US state", "Apple Stores listing an iPhone Duo for pickup", "iPhone Duo configurations in stock", "confirmed restocks", "last restock, store local time"],
        measurementTechnique: "Imported apple.com pickup observations; recorded returns require two agreeing source checks, and initial sightings are excluded. Synchronization can add delay.",
        ...(t.unknown || t.n === 0 ? {} : { size: `${n(t.n)} confirmed restocks` }),
      },
    ],
  };

  return (
    <GuideLayout guide="iphone-duo-stock-checker" contents={sections.map((item) => ({ id: item.id, label: item.nav }))}>
      <JsonLd data={ld} />
      <Breadcrumbs items={[{ href: "/", label: "ShelfSpring" }, { label: "Check a pickup listing" }]} />
      <div className="guide-evidence-lead">
        <p className="text-lg leading-relaxed text-ink-2">A stock check is most useful when it is specific: one model, one capacity, one color and a store you could collect from. Use the tables to narrow that combination, then open Apple’s offer to confirm it.</p>
        <p className="mt-3 text-xs text-ink-3">Page prepared {updated}. US historical coverage begins {longDate(TRACKING_SINCE_US)}. {live ? <>Most recent retrieved check: <LiveChecked iso={lastChecked} model="duo" />.</> : "Current stock observations were unavailable in this response."}</p>
        <StatGrid cols={4} className="mt-5">
          <Stat value={live ? duoNow : "—"} label={`stores with an available configuration, out of ${STORES.length}`} live={live} tone={duoNow > 0 ? "accent" : "muted"} />
          <Stat value={recent.unknown ? "—" : recent.restocks} label="returns recorded in the latest 24-hour window" />
          <Stat value={t.unknown ? "—" : n(t.n)} label={`historical returns in the sample from ${since}`} />
          <Stat value={sell ? sell.medianSec : "—"} unit={sell ? "s" : undefined} label={sell ? `median observed duration in ${n(sell.n)} timed listings` : "insufficient timed listings for a median"} />
        </StatGrid>
      </div>
      <div className="guide-chapters prose-site">
        <section id="apple" className="guide-chapter">
          <h2>Start with the configuration, finish with Apple</h2>
          <p>Write down the capacity and colors you would accept before comparing locations. A positive result for another configuration is not an answer to your purchase question. On <a href={APPLE_DUO} target="_blank" rel="noopener">Apple’s configuration page</a>, select that version and inspect the pickup choices for your area.</p>
          <StepStrip className="my-4 lg:grid-cols-3!" steps={[
            { title: "Name the version", hint: "Match the model, capacity and color across the checker and Apple’s order page." },
            { title: "Name the location", hint: "Check the particular store. A state-wide count may refer to a different city or configuration." },
            { title: "Read the current offer", hint: "Review the pickup option, total and order details with Apple. A result here does not hold inventory." },
          ]} />
          <p>Apple’s <a href={APPLE_PICKUP} target="_blank" rel="noopener">pickup guidance</a> governs the order and collection. ShelfSpring adds geographic comparisons and recorded history so you can decide where to look, rather than treating a historical event as an orderable offer.</p>
          <ChipLinks items={[{ href: "/apple-store-pickup-availability-explained", label: "Interpret pickup status wording" }, { href: "/iphone-duo-near-me", label: "Choose stores within reach" }]} />
        </section>
        <section id="states" className="guide-chapter">
          <h2>Read the state table as a directory with evidence</h2>
          <p>{!live ? "Current availability could not be read. The directory and available history remain useful for navigation, but the missing current answer cannot be replaced by a historical count." : duoNow > 0 && topState ? `This snapshot contains listings at ${duoNow} stores across ${plural(statesHit.length, "state")}. ${topState.name} has the largest count in this view, with ${topState.withStock} of ${topState.stores} stores; inspect the individual stores before interpreting that as a useful option.` : `No tracked US store has an available configuration in this snapshot (${asOf}). That does not establish whether a new listing will appear later.`}</p>
          <Table caption={`State comparison: current-store and configuration counts beside returns from ${since}. Event timestamps use the store’s local clock${live ? `; this page was prepared ${asOf}` : "; current stock is unavailable"}.`} head={["State", "Stores in snapshot", "Configurations in stock", `Restocks since ${shortDate(t.since)}`, "Last restock in the state"]} min="40rem">
            {states.map((s) => (
              <tr key={s.name} className={`border-b border-line ${s.withStock > 0 ? "bg-accent/[0.06]" : ""}`}>
                <th scope="row" className={rowTh}><Link href={s.path} className="hover:underline">{s.name}</Link></th>
                <td className={`${td} ${s.withStock > 0 ? "font-semibold text-accent" : ""}`}>{live ? `${s.withStock} of ${s.stores}` : "–"}</td>
                <td className={td}>{live ? (s.configs > 0 ? `${s.configs} of ${items.length}` : "–") : "–"}</td>
                <td className={td}>{s.restocks == null ? "–" : n(s.restocks)}</td>
                <td className="py-2 pe-3 align-top">{s.lastAt && s.lastStore ? <>{localStamp(s.lastAt, s.lastStore)} · <Link href={storePath(s.lastStore)} className="hover:underline">{appleName(s.lastStore)}</Link></> : "–"}</td>
              </tr>
            ))}
          </Table>
          {latest && latest.store && <p className="text-sm text-ink-3">The latest retrieved return was {cfg(latest.partNumber)} at {appleName(latest.store)}, {stampAt(latest.at, latest.store)}. This historical record may be older than the current status.</p>}
          <Keys items={[
            { text: <>The store count is distinct locations. The configuration count is distinct capacity-and-color pairs represented in that state, out of {items.length}.</> },
            { text: <>The return total measures changes in the stated sample. It does not measure units on a shelf.</> },
            { text: <>Follow a state to narrow the geography, or use the <Link href="/map">map</Link> when a state boundary is not useful for your journey.</> },
          ]} />
          <ChipLinks items={[{ href: "/stores", label: "Open the directory" }, { href: "/iphone-duo-near-me", label: "Rank nearby locations" }, { href: "/map", label: "View locations on a map" }, { href: "/stock/iphone-duo", label: "Use the configuration workspace" }]} />
        </section>
        <section id="configs" className="guide-chapter">
          <h2>Compare the version you want with acceptable alternatives</h2>
          <p>{topCfg ? `${cfg(topCfg.partNumber)} has ${pct(topCfgN / t.n)} of the ${n(t.n)} recorded returns in this sample. That is its historical share, not its share of physical stock or a forecast of your chance to buy.` : t.unknown ? "The historical ranking is unreadable in this response. Catalog entries and links remain available, without a frequency claim." : "The sample does not yet contain a return to rank. All catalog configurations remain listed so you can choose the version to check."} {live && mostNow && mostNowN > 0 ? `The largest current store count belongs to ${cfg(mostNow.partNumber)}: ${plural(mostNowN, "store")}.` : "Read the current column separately from the history."}</p>
          <Table caption={`Configuration comparison for ${items.length} US catalog entries: current store counts, 24-hour returns and the historical sample from ${since}, with direct Apple links.`} head={["Configuration", "Price", "Stores now", "Last 24 h", `Since ${shortDate(t.since)}`, "apple.com"]} min="40rem">
            {configs.map((i) => {
              const now = nowByPart.get(i.partNumber) ?? 0;
              const day = dayPart.get(i.partNumber)?.restocks ?? 0;
              const all = sincePart.get(i.partNumber)?.restocks ?? 0;
              return (
                <tr key={i.partNumber} className={`border-b border-line ${now > 0 ? "bg-accent/[0.06]" : ""}`}>
                  <th scope="row" className={rowTh}><span className="inline-flex items-center gap-2"><Swatch color={i.color} />{i.storage} {i.color}</span></th>
                  <td className={td}>{fmtPrice(i.price)}</td>
                  <td className={`${td} ${now > 0 ? "font-semibold text-accent" : ""}`}>{live ? `${now} of ${STORES.length}` : "–"}</td>
                  <td className={td}>{recent.unknown ? "–" : day}</td>
                  <td className={td}>{t.unknown ? "–" : n(all)}</td>
                  <td className="py-2 pe-3 align-top"><a href={appleBuyUrl(i)} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap underline underline-offset-2 hover:text-ink">Buy on apple.com</a></td>
                </tr>
              );
            })}
          </Table>
          <Measured>Use the list price as a starting point; the final charge depends on Apple’s checkout and applicable tax. The buy link carries the configuration to Apple, where pickup availability must be checked again.</Measured>
          <ChipLinks items={[{ href: "/which-iphone-duo-restocks-most", label: "Understand configuration shares" }, { href: "/stock/iphone-duo", label: "Compare a configuration by location" }]} />
        </section>
        <section id="store" className="guide-chapter">
          <h2>Inspect one store record before making the trip</h2>
          <p>A store page joins the current configuration grid with historical returns, local-hour summaries, address and opening information. Treat those as separate inputs: evidence of stock does not tell you that the journey or collection slot works.</p>
          {topStore && topRow ? <>
            <p>The worked example below is <Link href={storePath(topStore)}>{appleName(topStore)}</Link> in {cityLine(topStore)}, selected because it has the largest recorded return count in this sample. Selection for this example does not make it the recommended store for your location.</p>
            <StatGrid cols={3} className="my-4"><Stat value={n(topRow.restocks)} label={`recorded returns across ${topRow.days} days`} /><Stat value={live ? `${topNow}/${items.length}` : "—"} label="configurations in the current snapshot" /><Stat value={topRow.peakHour == null ? "—" : rangeLabel(topRow.peakHour, topRow.peakHour + 1)} label="historical peak interval in local time" /></StatGrid>
            <KeyTable head={["Question for this store", "Recorded detail"]} rows={[
              ["Configuration coverage", <>{items.length} catalog combinations can be checked independently.</>],
              ["Historical activity", <>{n(topRow.restocks)} returns from {since}{topPattern ? `; ${topPattern.restocks} in the 30-day sample` : ""}.</>],
              ["Latest return", <>{localStamp(topRow.lastAt, topStore)} local time.</>],
              ["Supported timing summary", <>{topRow.peakHour != null ? `${rangeLabel(topRow.peakHour, topRow.peakHour + 1)}, based on ${topRow.days} represented days.` : `Not available: the minimum is ${PATTERN_MIN} returns on ${PATTERN_MIN_DAYS} different days.`}</>],
              ...(topHours ? [["Listed opening hours", <>{topHours}</>] as [ReactNode, ReactNode]] : []),
              ["Store address", <>{fullAddress(topStore)}</>],
              ...(topTax ? [["Illustrative tax-inclusive price", <>{fmtPrice(cheapest)} list price becomes approximately {fmtPrice(topTax.total)} using the {topTax.rate}% average combined rate for {topStore.state}. Confirm the final charge at checkout; <a href={SALES_TAX_SOURCE.url} target="_blank" rel="noopener">tax data source</a>.</>] as [ReactNode, ReactNode]] : []),
            ]} />
            <ChipLinks items={[{ href: storePath(topStore), label: "Inspect this store’s full record" }]} />
          </> : <p>A readable historical leader is not available for the example. Choose your own location from <Link href="/stores">the store directory</Link>; the same evidence sections are available there.</p>}
        </section>
        <section id="how" className="guide-chapter">
          <h2>Know what the checker has observed</h2>
          <p>The source collection covers {items.length} configurations at {STORES.length} US stores. ShelfSpring synchronizes those pickup observations and imports their history. Confirmed availability changes require agreeing source responses, while request errors do not become sold-out events.</p>
          <Keys items={[
            { text: <>A fresh status and a historical event serve different purposes. The event log keeps a return after its listing ends.</> },
            { text: <>Initial sightings are excluded from return counts, so the history is not a record of every phone Apple has ever offered.</> },
            { text: <>Collection, synchronization and delivery are separate steps; a page can lag Apple even when the recorded observation was correct.</> },
            { text: <>Subscriptions change saved-match limits. They do not provide a separate or faster inventory feed.</> },
          ]} />
          <Measured title="What the word inventory means here">These are recorded pickup-availability responses, not a count of physical units. Delivery dates and other sellers’ stock are outside the dataset. The general term <a href={WIKI_INVENTORY} target="_blank" rel="noopener">inventory</a> is broader than what this checker measures.</Measured>
          <ChipLinks items={[{ href: "/how-it-works", label: "Read the observation and alert method" }]} />
        </section>
        <section id="when" className="guide-chapter">
          <h2>Use hour patterns to understand the sample</h2>
          <p>{pattern ? `The interval ${hl(w.from)}–${hl(w.to)} contains ${pct(w.share)} of ${n(t.n)} recorded returns from ${since}, after assigning each event to its store’s local clock. Other returns occurred outside that interval.` : t.unknown ? "The timing history is unavailable in this response, so no preferred hour is suggested." : `The timing summary requires ${PATTERN_MIN} returns on ${PATTERN_MIN_DAYS} distinct days. The current US sample has ${n(t.n)} returns and does not provide a supported hour pattern.`} A past concentration is not an announced delivery or pickup schedule.</p>
          {pattern && <StatGrid cols={4} className="my-4"><Stat value={pct(w.share)} label={`share within ${hl(w.from)}–${hl(w.to)}`} /><Stat value={rangeLabel(t.peakHour!, t.peakHour! + 1)} label={`peak hour: ${n(t.byHour[t.peakHour!])} events`} /><Stat value={pct(hourShare(t.byHour, 8, 12))} label="share from 8 AM to noon" /><Stat value={pct(hourShare(t.byHour, 17, 24))} label="share from 5 PM to midnight" /></StatGrid>}
          <p>Use a smaller geography when it fits the question. <Link href="/iphone-duo-restock-times/texas">Texas</Link> and <Link href="/iphone-duo-restock-times/california/los-angeles">Los Angeles</Link> provide local samples; compare their sample size as well as their peak.</p>
          <ChipLinks items={[{ href: "/iphone-duo-restock-times", label: "Explore timing evidence" }, { href: "/iphone-duo-sell-out-times", label: "Explore listing durations" }, { href: "/restocks", label: "Read individual changes" }]} />
        </section>
        <section id="countries" className="guide-chapter">
          <h2>Switch to the catalog for your market</h2>
          <p>The international directory covers {intlStores} stores across {INTL_CODES.length} countries. Its aggregate returns {intlDuoNow} stores with a listed configuration{intlHit.length > 0 ? ` across ${intlHit.map((c) => COUNTRIES[c.cc].short).join(", ")}` : ""}. This compact comparison may show zero when a country’s data is unavailable, so a zero alone is not proof of no stock. Open the market page to inspect its current observations.</p>
          <Table caption={`Market directory for ${INTL_CODES.length} countries outside the US. Counts come from each market’s available snapshot; historical coverage starts ${longDate(TRACKING_SINCE_INTL)}.`} head={["Country", "Stores in snapshot", "Apple Stores tracked", "Live page"]} min="30rem">
            {countries.map((c) => (
              <tr key={c.cc} className={`border-b border-line ${c.now > 0 ? "bg-accent/[0.06]" : ""}`}>
                <th scope="row" className={rowTh}><Link href={`${prefixOf(c.cc)}/stock/iphone-duo`} className="hover:underline">{COUNTRIES[c.cc].name}</Link></th>
                <td className={`${td} ${c.now > 0 ? "font-semibold text-accent" : ""}`}>{live ? `${c.now} of ${c.stores}` : "–"}</td>
                <td className={td}>{c.stores}</td>
                <td className="py-2 pe-3 align-top"><Link href={prefixOf(c.cc) || "/"} className="hover:underline">{COUNTRIES[c.cc].short} home</Link> · <Link href={`${prefixOf(c.cc)}/iphone-duo-restock-times`} className="hover:underline">restock times</Link></td>
              </tr>
            ))}
          </Table>
          <p>International source history begins {longDate(TRACKING_SINCE_INTL)}. Store pages use the market’s catalog, currency and local clock; they are a separate comparison from the US table. For a single-store market, the directory may lead directly to that store.</p>
        </section>
        <section id="alerts" className="guide-chapter">
          <h2>Save a repeat check after you have narrowed the choices</h2>
          <p>{PRICE_SENTENCE} Saving a match is useful when you know which store and configuration you would act on. It is not a purchase instruction, a reservation or a promise that every brief listing will reach your device in time.</p>
          <StatGrid cols={3} className="my-4"><Stat value={`$${PLANS.plus.priceUsd}`} unit="/ month" label={`${PLANS.plus.name}: ${PLANS.plus.limit} saved matches`} /><Stat value={`$${PLANS.pro.priceUsd}`} unit="/ month" label={`${PLANS.pro.name}: ${PLANS.pro.limit} saved matches`} /><Stat value={`$${PLANS.max.priceUsd}`} unit="/ month" label={`${PLANS.max.name}: ${PLANS.max.limit} saved matches`} /></StatGrid>
          <p>A match pairs one store with one exact model, storage and color. If both colors would work, each consumes a separate saved match at that store. Check your <Link href="/install">notification setup</Link> and review <Link href="/pricing">billing terms</Link> before relying on delivery.</p>
          <ChipLinks items={[{ href: "/iphone-duo-stock-alerts", label: "Inspect the notification rules" }, { href: "/how-to-grab-an-iphone-duo-restock", label: "Plan the Apple checkout steps" }, { href: "/install", label: "Configure a notification device" }, { href: "/pricing", label: "Compare plan limits" }]} />
          <p><Link href={alert} className="btn btn-primary">Save the match you would buy</Link></p>
          <p className="text-sm text-ink-3">{QUOTE}</p>
        </section>
      </div>
      <RelatedBlock title="Keep exploring">
        <LinkRow title="More evidence for your shortlist" links={[
          { href: "/iphone-duo-restock-times", label: "When does Apple restock the iPhone Duo?" },
          { href: "/iphone-duo-sell-out-times", label: "How fast does a restock sell out?" },
          { href: "/iphone-duo-stock-alerts", label: "iPhone Duo stock alerts" },
          { href: "/iphone-duo-near-me", label: "iPhone Duo near me" },
          { href: "/how-to-get-an-iphone-duo", label: "How to get an iPhone Duo" },
          { href: "/how-to-grab-an-iphone-duo-restock", label: "How to grab a restock" },
          { href: "/which-iphone-duo-restocks-most", label: "Which iPhone Duo restocks most" },
          { href: "/apple-store-pickup-availability-explained", label: "Pickup availability explained" },
        ]} />
        <LinkRow title="Live pages" links={[
          { href: "/stock/iphone-duo", label: "iPhone Duo stock, every store" },
          { href: "/restocks", label: "Restock log" },
          { href: "/map", label: "Live map" },
          { href: "/stores", label: "Apple Stores by state" },
        ]} />
        <LinkRow title="Continue the purchase plan" links={[
          { href: "/iphone-duo-back-in-stock", label: "Is the iPhone Duo back in stock?" },
          { href: "/where-to-buy-iphone-duo", label: "Where to buy an iPhone Duo today" },
        ]} />
      </RelatedBlock>
      <div className="mt-10"><RichFaq items={faq} facts={facts} title="Before relying on a stock check" /></div>
      <div className="mt-8"><SourceList sources={sources} facts={facts} where={`recorded pickup observations across ${n(ALL_STORES.length)} Apple Stores`} since={longDate(TRACKING_SINCE_US)} /></div>
    </GuideLayout>
  );
}
