import { withCuratedMetadata } from "@/lib/seo/curation";
import { GuideLayout } from "@/components/guides/GuideLayout";
/** A reading guide for pickup changes: distinguish a current snapshot, a historical return, and a timed listing. Query and aggregation behavior is shared with the mature inventory implementation. */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cache } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs, LinkRow, RelatedBlock } from "@/components/seo/Related";
import { RichFaq, SourceList } from "@/components/content/RichFaq";
import { RestockFeed } from "@/components/restocks/RestockFeed";
import { Swatch } from "@/components/stores/ConfigTable";
import { Measured, Points, Stat, StatGrid, StepStrip, type Point } from "@/components/ui/Viz";
import { getFacts } from "@/lib/content/facts";
import type { Faq, Source } from "@/lib/content/types";
import { PART_INDEX, STORES, appleName, catalogFor, cityLine, statePath, statesWithStores, storeByNumber, storePath, storeTimeZone, storesOf, type CatalogItem, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, INTL_CODES, prefixOf } from "@/lib/apple/countries";
import { PLANS } from "@/lib/plans";
import { TRACKING_SINCE_INTL, TRACKING_SINCE_US, WEEKDAYS, hourLabel, localHourDay, localStamp, siteFacts } from "@/lib/content/siteFacts";
import { busiestWindow, duoRestockTimes } from "@/lib/content/restockTimes";
import { medianBand } from "@/lib/stock/sellouts";
import { recentByConfig } from "@/lib/stock/recent";
import { modelStock, restockFeed, storesWithStockNow, type RestockRow } from "@/lib/stock/queries";
import { alertHref, fmtPrice, plural } from "@/lib/seo/enrich";

export const revalidate = 3600;

const SITE = "https://shelfspring.com";
const PATH = "/iphone-duo-back-in-stock";
const TITLE = `iPhone Duo Returns: Read Current Stock and Past Changes`;
const APPLE_PICKUP = "https://www.apple.com/shop/shipping-pickup";
const WIKI_STOCKOUT = "https://en.wikipedia.org/wiki/Stockout";
const DAY_MS = 86400_000;
/** restockFeed hands out at most 200 rows a page; the 24-hour window is walked page by page, up to this many. */
const FEED_PAGE = 200;
const FEED_PAGES = 5;
/** Shared plan context for the guide and its FAQ. */
const PRICE_SENTENCE = `Alerts from $${PLANS.plus.priceUsd}/month: save store–configuration matches and receive notifications after newly detected availability reaches ShelfSpring. Delivery times vary.`;

const n = (x: number) => x.toLocaleString("en-US");
/** Whole-percent shares; a share under half a percent reads "<1%", never a misleading "0%". */
const pct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
const LONG = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" });
const longDate = (ymd: string) => LONG.format(new Date(`${ymd}T12:00:00Z`));
const ET_STAMP = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
/** "9:41 AM" on the store's own clock. */
const clockAt = (iso: string, store: Store) => new Intl.DateTimeFormat("en-US", { timeZone: storeTimeZone(store), hour: "numeric", minute: "2-digit" }).format(new Date(iso));
const cfgName = (i: CatalogItem) => `${i.storage} ${i.color}`;
/** A ratio for a sentence: "3×" above 3, "1.8×" below. */
const times = (r: number) => (r >= 3 ? `${Math.round(r)}×` : `${(Math.round(r * 10) / 10).toFixed(1)}×`);

/** "today", "yesterday" or "on Nov 3", by the store's own calendar. */
function dayWord(iso: string, store: Store, now: Date): string {
  const tz = storeTimeZone(store);
  const d = localHourDay(iso, tz).date;
  if (d === localHourDay(now.toISOString(), tz).date) return "today";
  if (d === localHourDay(new Date(now.getTime() - DAY_MS).toISOString(), tz).date) return "yesterday";
  return `on ${new Intl.DateTimeFormat("en-US", { timeZone: tz, month: "short", day: "numeric" }).format(new Date(iso))}`;
}

/** "about 4 minutes ago", computed when the server prepares the cached page. */
function agoText(iso: string, now: Date): string {
  const s = Math.max(0, Math.round((now.getTime() - Date.parse(iso)) / 1000));
  if (s < 60) return "less than a minute ago";
  const m = Math.round(s / 60);
  if (m < 60) return `about ${plural(m, "minute")} ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `about ${plural(h, "hour")} ago`;
  return `about ${plural(Math.round(h / 24), "day")} ago`;
}

/**
 * Confirmed US iPhone Duo restocks, newest first, reaching back at least 24 hours: restockFeed pages at 200 rows,
 * so pages are read until one ends before the window (or FEED_PAGES pages, `complete: false`).
 */
async function duoFeed(now: Date): Promise<{ rows: RestockRow[]; complete: boolean }> {
  const since = now.getTime() - DAY_MS;
  const rows: RestockRow[] = [];
  for (let page = 0; page < FEED_PAGES; page++) {
    const batch = await restockFeed({ model: "duo", limit: FEED_PAGE, country: "us", page });
    rows.push(...batch);
    if (batch.length < FEED_PAGE || batch[batch.length - 1].at.getTime() < since) return { rows, complete: true };
  }
  return { rows, complete: false };
}

/** One read per request, shared by the metadata and the page. */
const load = cache(async () => {
  const now = new Date();
  const [t, recent, stock, feed, f, facts, abroad] = await Promise.all([
    duoRestockTimes("us"),
    recentByConfig({ country: "us" }),
    modelStock("duo", "us"),
    duoFeed(now),
    siteFacts(),
    getFacts(),
    Promise.all(INTL_CODES.map((cc) => storesWithStockNow(undefined, cc))),
  ]);
  return { now, t, recent, stock, feed, f, facts, abroad };
});

/** Pure: every number the page and its description quote, from the raw reads. */
function derive(d: Awaited<ReturnType<typeof load>>) {
  const { now, t, recent, stock, feed } = d;
  // A status row exists for every store × configuration since the first sweep, so an empty read is a failed one.
  const stockUnknown = stock.length === 0;
  const nowByStore = new Map<string, Set<string>>();
  for (const r of stock) {
    if (r.status !== "available") continue;
    const set = nowByStore.get(r.storeNumber) ?? new Set<string>();
    set.add(r.partNumber);
    nowByStore.set(r.storeNumber, set);
  }
  const storesNow = nowByStore.size;
  const nowByState = new Map<string, number>();
  const nowByPart = new Map<string, number>();
  for (const [storeNumber, parts] of nowByStore) {
    const s = storeByNumber(storeNumber);
    if (s) nowByState.set(s.state, (nowByState.get(s.state) ?? 0) + 1);
    for (const p of parts) nowByPart.set(p, (nowByPart.get(p) ?? 0) + 1);
  }

  const since24 = now.getTime() - DAY_MS;
  const last24 = feed.rows.filter((r) => r.at.getTime() >= since24);
  // Thousands of restocks sit in the log: an empty feed while the log has rows is a failed read, not a quiet day.
  const feedUnknown = feed.rows.length === 0 && (t.n > 0 || Boolean(t.unknown));
  // The 24-hour figures: the walked feed when it covers the window, else the cached grouped read.
  const h24 = !feedUnknown && feed.complete
    ? { restocks: last24.length, stores: new Set(last24.map((r) => r.storeNumber)).size, unknown: false }
    : { restocks: recent.restocks, stores: recent.stores, unknown: Boolean(recent.unknown) || feedUnknown };

  // The latest confirmed restock: the feed is the freshest read; the five-minute aggregate stands in when it failed.
  const first = feed.rows[0];
  const latestStore = first ? first.store : t.latest ? storeByNumber(t.latest.storeNumber) : undefined;
  const latest = first
    ? { store: first.store, item: first.item as CatalogItem | undefined, at: first.at.toISOString() }
    : t.latest && latestStore
      ? { store: latestStore, item: PART_INDEX.get(t.latest.partNumber), at: t.latest.at }
      : null;

  const states = statesWithStores().map((st) => {
    const rows = last24.filter((r) => r.store.state === st.name);
    const newest = rows[0];
    return {
      name: st.name, code: st.code, total: st.count, path: statePath(st.name),
      now: nowByState.get(st.name) ?? 0,
      restocks: rows.length, stores: new Set(rows.map((r) => r.storeNumber)).size,
      latest: newest ? { store: newest.store, at: newest.at.toISOString() } : null,
    };
  }).sort((a, b) => b.now - a.now || b.restocks - a.restocks || a.name.localeCompare(b.name));
  const statesNow = states.filter((s) => s.now > 0);
  const states24 = states.filter((s) => s.restocks > 0);
  const active = states.filter((s) => s.now > 0 || s.restocks > 0);

  const items = catalogFor("duo");
  const partRows = new Map(t.byPart.map((p) => [p.partNumber, p]));
  const recentParts = new Map(recent.byPart.map((p) => [p.partNumber, p]));
  const configs = items.map((item) => {
    const p = partRows.get(item.partNumber);
    const restocks = p?.restocks ?? 0;
    const lastStore = p?.lastStore ? storeByNumber(p.lastStore) : undefined;
    return { item, name: cfgName(item), restocks, share: t.n ? restocks / t.n : 0, lastAt: p?.lastAt ?? null, lastStore, now: nowByPart.get(item.partNumber) ?? 0, h24: recentParts.get(item.partNumber)?.restocks ?? 0 };
  }).sort((a, b) => b.restocks - a.restocks || a.name.localeCompare(b.name));
  const topCfg = configs[0];
  const lastCfg = configs[configs.length - 1];
  // The spread between the most- and least-restocked configuration, stated only when it is a real one.
  const spread = topCfg && lastCfg && lastCfg.restocks > 0 && topCfg !== lastCfg ? topCfg.restocks / lastCfg.restocks : 0;
  const ratio = spread >= 1.2 ? spread : null;
  // Which lever moves the odds more: the gap between storage sizes or the gap between colors, in restocks.
  const byStorage = new Map<string, number>(), byColor = new Map<string, number>();
  for (const c of configs) { byStorage.set(c.item.storage, (byStorage.get(c.item.storage) ?? 0) + c.restocks); byColor.set(c.item.color, (byColor.get(c.item.color) ?? 0) + c.restocks); }
  const gap = (m: Map<string, number>) => { const v = [...m.values()]; return v.length ? Math.max(...v) - Math.min(...v) : 0; };
  const storageWins = gap(byStorage) >= gap(byColor);

  const tracked = Math.max(t.daily.length, t.days, 1);
  const have = t.n > 0 && !t.unknown;
  const pattern = have && t.peakHour != null;
  const w = busiestWindow(t.byHour);
  const sell = t.sellout;
  const ds = d.f.duoSellout;
  const band = sell ? medianBand(sell.medianSec) : ds ? medianBand(ds.medianSec) : null;
  const top = t.topStores[0];
  const topStore = top ? storeByNumber(top.storeNumber) : undefined;

  const intl = INTL_CODES.map((cc, i) => ({ cc, name: COUNTRIES[cc].name, now: d.abroad[i].duo, total: storesOf(cc).length, href: `${prefixOf(cc)}/stock/iphone-duo` }))
    .sort((a, b) => b.now - a.now || INTL_CODES.indexOf(a.cc) - INTL_CODES.indexOf(b.cc));
  const intlNow = intl.reduce((a, c) => a + c.now, 0);
  const intlTotal = intl.reduce((a, c) => a + c.total, 0);

  return { now, t, stockUnknown, storesNow, h24, latest, last24, feedUnknown, feedComplete: feed.complete && !feedUnknown, states, statesNow, states24, active, items, configs, topCfg, lastCfg, ratio, storageWins, tracked, have, pattern, w, sell, ds, band, top, topStore, intl, intlNow, intlTotal, feedRows: feed.rows.slice(0, 12) };
}

/** The meta description: the quotable first sentence, cut to the clause that fits 158 characters. */
function describe(v: ReturnType<typeof derive>): string {
  const snapshot = v.stockUnknown ? "Current stock is unreadable" : `${v.storesNow}/${STORES.length} US stores in the latest available snapshot`;
  const text = `${snapshot}. Separate iPhone Duo pickup listings from past returns, compare configurations, and read the limits of timing data.`;
  return text.length <= 158 ? text : `${snapshot}. Read iPhone Duo pickup changes, configuration history and listing durations.`.slice(0, 158);
}

export async function generateMetadata(): Promise<Metadata> {
  const description = describe(derive(await load()));
  return withCuratedMetadata("/iphone-duo-back-in-stock", {
    title: { absolute: `${TITLE} · ShelfSpring` },
    description,
    alternates: { canonical: PATH },
    openGraph: { type: "article", siteName: "ShelfSpring", title: TITLE, description, url: PATH },
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

export default async function DuoBackInStock() {
  const d = await load();
  const v = derive(d);
  const { now, t, stockUnknown, storesNow, h24, latest, feedUnknown, states, statesNow, states24, active, items, configs, topCfg, lastCfg, ratio, storageWins, tracked, have, pattern, w, sell, ds, band, top, topStore, intl, intlNow, intlTotal, feedRows } = v;
  const facts = d.facts;
  const since = longDate(t.since);
  const asOf = `${ET_STAMP.format(now)} ET`;
  const alert = alertHref({ model: "duo" });
  const description = describe(v);
  const storeLink = (s: Store) => <Link href={storePath(s)} className="hover:underline">{appleName(s)}</Link>;
  const nowKnown = !stockUnknown;
  const yesNow = nowKnown && storesNow > 0;
  const perDay = have ? Math.round(t.n / tracked) : 0;
  const quietStates = states.length - active.length;
  const configs24 = configs.filter((c) => c.h24 > 0).length;
  const topIntl = intl[0];

  const sections = [
    { id: "now", nav: "Separate a listing from a return" },
    { id: "configurations", nav: "Match the version you want" },
    { id: "where", nav: "Narrow the geography" },
    { id: "when", nav: "Read timing as history" },
    { id: "how-long", nav: "Understand the duration sample" },
    { id: "alerts", nav: "Choose your next check" },
    { id: "abroad", nav: "Use the correct market" },
  ];
  const faq: Faq[] = [
    { q: "Does a return in the log mean I can order now?", a: "A return records an earlier unavailable-to-available change. It remains in the log after the listing disappears. To decide whether to order, inspect the latest status for your exact store and configuration, then confirm the pickup option with Apple." },
    { q: "How many returns does this dataset contain?", a: have
      ? `The US sample contains ${n(t.n)} confirmed changes across ${t.stores} stores over ${tracked} represented days from ${since}, about ${n(perDay)} changes per day across the entire sample. That average is not a per-store arrival rate, a shipment count or a promise for tomorrow.`
      : `The current response does not contain enough readable history to summarize a return rate. The dataset’s US coverage begins ${since}; missing history must not be interpreted as proof that no store received stock.` },
    { q: "Can a single store account for several returns?", a: "Yes. Each event belongs to one store and one exact configuration. Different colors or capacities can produce separate events at the same store, and a configuration can return again after a confirmed sell-out. Event totals do not reveal the number of phones." },
    { q: "What does the median listing duration tell me?", a: sell
      ? `The median is ${sell.medianSec} seconds in ${n(sell.n)} timed US listings. Those are completed observations in the historical sample, not a countdown on the listing you are viewing. Collection and delivery delays reduce whatever opportunity remains. Inspect the [duration evidence](/iphone-duo-sell-out-times) before comparing samples.`
      : "This response has no qualifying duration summary. A future listing could be brief or persist longer; no default duration is substituted for missing evidence." },
    { q: "Which store should I monitor?", a: top && topStore
      ? `${appleName(topStore)} has the largest recorded count in this sample: ${n(top.restocks)} returns across ${top.days} days. That is a historical comparison, not a recommendation to travel there. Start with reachable stores and compare their individual histories in the [directory](/stores).`
      : "Begin with stores you can collect from. The current sample does not support naming a historical leader; use the directory to build a practical shortlist and revisit the evidence later." },
    { q: "Does paying for alerts give me different inventory?", a: `${PRICE_SENTENCE} Subscription tiers change how many store–configuration matches you can save, not the stock feed. A notification may arrive after a listing has changed. [Review the plans](/pricing) and [notification setup](/install) before subscribing.` },
  ];
  const sources: Source[] = [
    { label: "Apple’s pickup ordering and collection guidance", url: APPLE_PICKUP },
    { label: "Stockout: terminology for a change in availability", url: WIKI_STOCKOUT },
  ];
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${SITE}${PATH}`, url: `${SITE}${PATH}`, name: TITLE, description, isPartOf: { "@id": `${SITE}/#website` }, about: { "@id": `${SITE}/#organization` }, dateModified: now.toISOString() },
      {
        "@type": "Dataset", "@id": `${SITE}${PATH}#dataset`, name: "iPhone Duo pickup availability and confirmed restocks at US Apple Stores",
        description: `Latest recorded iPhone Duo pickup listings across ${STORES.length} US Apple Stores, with confirmed historical returns by store, configuration and time. Imported history preserves source observation dates; current stock must be confirmed with Apple.`,
        url: `${SITE}${PATH}`, publisher: { "@id": `${SITE}/#organization` }, isAccessibleForFree: true,
        temporalCoverage: `${TRACKING_SINCE_US}/..`, spatialCoverage: "Apple Stores in the United States",
        variableMeasured: ["Apple Store", "US state", "iPhone Duo storage and color", "listed for pickup now", "confirmed restock time", "restocks in the last 24 hours", "seconds listed before sell-out"],
        ...(have ? { size: `${n(t.n)} confirmed restocks at ${t.stores} stores` } : {}),
      },
    ],
  };

  return (
    <GuideLayout guide="iphone-duo-back-in-stock" contents={sections.map((item) => ({ id: item.id, label: item.nav }))}>
      <JsonLd data={ld} />
      <Breadcrumbs items={[{ href: "/", label: "ShelfSpring" }, { label: "Reading stock returns" }]} />
      <div className="guide-evidence-lead">
        <p className="text-lg leading-relaxed text-ink-2">A useful stock update answers two questions: what was observed most recently, and what changed before that observation. Keep those answers separate. A full history can sit beside an empty current listing without either being wrong.</p>
        <p className="mt-3 text-xs text-ink-3">Page prepared {asOf}. The history includes source records from {longDate(TRACKING_SINCE_US)}; this is dataset coverage, not the age of ShelfSpring.</p>
        <StatGrid cols={4} className="mt-5">
          <Stat value={stockUnknown ? "—" : `${storesNow}/${STORES.length}`} label="US stores with an available configuration in the snapshot" tone={yesNow ? "accent" : "muted"} live={nowKnown} />
          <Stat value={h24.unknown ? "—" : n(h24.restocks)} label="recorded returns over the last 24 hours" />
          <Stat value={h24.unknown ? "—" : `${h24.stores}/${STORES.length}`} label="stores represented in those returns" />
          <Stat value={h24.unknown ? "—" : `${configs24}/${items.length}`} label="configurations represented in that window" />
        </StatGrid>
      </div>
      <div className="guide-chapters prose-site">
        <section id="now" className="guide-chapter">
          <h2>Read the current status before the return log</h2>
          <p>{stockUnknown ? <>Current status could not be read in this response. The history below can still describe earlier events, but it cannot fill in the missing current answer.</> : yesNow ? <>The available snapshot includes {storesNow} of {STORES.length} US stores. Open the inventory page to see which configurations those stores list, and check the observation time beside each one.</> : <>The available snapshot contains no iPhone Duo pickup listing at the tracked US stores. This reading does not establish when another return will occur.</>}</p>
          {latest && <p>The newest event in this response is at {appleName(latest.store)}, {cityLine(latest.store)}: {clockAt(latest.at, latest.store)} local time {dayWord(latest.at, latest.store, now)} ({agoText(latest.at, now)} when the page was prepared). It records a change, not stock held for you.</p>}
          <Keys items={[
            { text: <>A return requires agreeing source observations of a change from unavailable to available. Initial sightings are excluded from return totals.</> },
            { text: <>Rows stay in the history after availability changes again. Read their status as well as their timestamp.</> },
            { text: <>The <Link href="/stock/iphone-duo">configuration inventory</Link> answers the current-listing question; the <Link href="/restocks">full log</Link> lets you investigate earlier changes.</> },
          ]} />
          <div className="my-5 [&_a]:no-underline"><RestockFeed rows={feedRows} model="duo" showModel={false} emptyText={feedUnknown || t.unknown ? "The event history is unavailable in this response." : `No qualifying return is recorded in this response from ${since}.`} /></div>
          <ChipLinks items={[{ href: "/stock/iphone-duo", label: "Inspect the latest configuration listings" }, { href: "/restocks", label: "Open the complete event journal" }, { href: "/apple-store-pickup-availability-explained", label: "Read Apple’s pickup labels" }]} />
        </section>
        <section id="configurations" className="guide-chapter">
          <h2>Compare only configurations you would keep</h2>
          <p>Set your storage requirement and budget first, then decide which colors are acceptable. Historical frequency can help compare those choices, but it is not a reason to purchase a version you do not want.</p>
          {have && topCfg && topCfg.restocks > 0 ? <p>{topCfg.name} accounts for {n(topCfg.restocks)} returns, or {pct(topCfg.share)} of this sample.{ratio && lastCfg ? <> Its recorded count is {times(ratio)} that of {lastCfg.name}.</> : null} This comparison counts availability changes, not units delivered or customers served.</p> : <p>{t.unknown ? "The historical ranking is unavailable; catalog details remain usable." : "No qualifying return is present in this sample, so the configurations have no evidence-based ranking yet."}</p>}
          <Table caption={`Compare ${items.length} catalog versions across ${STORES.length} US stores. Rows are ordered by historical returns; the current snapshot, recent window and pre-tax list price remain separate columns.`} head={["Configuration", "Price", `Restocks since ${since}`, "Share", "Last 24 h", "Listing it now", "Last restock, local time"]} min="44rem">
            {configs.map((c) => (
              <tr key={c.item.partNumber} className="border-b border-line">
                <th scope="row" className={rowTh}><span className="inline-flex items-center gap-2"><Swatch color={c.item.color} />{c.name}</span></th>
                <td className={td}>{fmtPrice(c.item.price)}</td>
                <td className={td}>{t.unknown ? "–" : n(c.restocks)}</td>
                <td className={td}>{t.unknown || !t.n ? "–" : pct(c.share)}</td>
                <td className={td}>{h24.unknown ? "–" : n(c.h24)}</td>
                <td className={td}>{stockUnknown ? "–" : c.now ? <span className="font-semibold text-accent">{c.now} of {STORES.length}</span> : `0 of ${STORES.length}`}</td>
                <td className="py-2 pe-3 align-top">{c.lastAt && c.lastStore ? <>{localStamp(c.lastAt, c.lastStore)} · {storeLink(c.lastStore)}</> : "–"}</td>
              </tr>
            ))}
          </Table>
          <Measured>{have ? <>The larger absolute spread in this sample is between {storageWins ? "storage sizes" : "colors"}. That describes the recorded groups; it does not isolate demand or predict the next available version. </> : null}Price and availability are separate columns. Listed prices exclude sales tax; check the final order total with Apple.</Measured>
          <ChipLinks items={[{ href: "/which-iphone-duo-restocks-most", label: "Read the configuration comparison method" }, { href: "/stock/iphone-duo", label: "Open the configuration selector" }]} />
        </section>
        <section id="where" className="guide-chapter">
          <h2>Use the state view to narrow the search</h2>
          <p>{stockUnknown ? "The current-stock column is unavailable in this response. Use historical columns only where their sample is readable, then check the individual store." : statesNow.length > 0 ? `The latest snapshot has listings in ${plural(statesNow.length, "state")}. Geography narrows the search; only the store’s exact configuration identifies a possible order.` : "No state contains an available listing in this snapshot. The table can still show locations represented in recent returns."} {states24.length > 0 ? `${plural(states24.length, "state")} appear in the retrieved 24-hour events.` : "The retrieved events do not establish recent activity in a state."}</p>
          {active.length > 0 ? <Table caption={`States meeting the current-snapshot or retrieved-event filter; ${quietStates} state rows do not meet those filters. ${v.feedComplete ? "The retrieved events cover the 24-hour window." : "The event sample may be incomplete; it is limited to the newest 1,000 returns."}`.trim()} head={["State", "Stores in snapshot", "Restocks, last 24 h", "Stores restocked", "Latest, local time"]} min="36rem">
              {active.map((s) => (
                <tr key={s.name} className={`border-b border-line ${s.now > 0 ? "bg-accent/[0.06]" : ""}`}>
                  <th scope="row" className={rowTh}><Link href={s.path} className="hover:underline">{s.name}</Link></th>
                  <td className={`${td} ${s.now > 0 ? "font-semibold text-accent" : ""}`}>{stockUnknown ? "–" : `${s.now} of ${s.total}`}</td>
                  <td className={td}>{n(s.restocks)}</td>
                  <td className={td}>{s.stores ? `${s.stores} of ${s.total}` : "–"}</td>
                  <td className="py-2 pe-3 align-top">{s.latest ? <>{localStamp(s.latest.at, s.latest.store)} · {storeLink(s.latest.store)}</> : "–"}</td>
                </tr>
              ))}
            </Table> : <p>No state meets this table’s current-listing or recent-event condition. Open the directory to inspect a particular location.</p>}
          <Keys items={[
            { text: <>A state with more stores has more possible store–configuration pairs. Compare its store count before interpreting a larger event total.</> },
            { text: <>The current column is a snapshot. The 24-hour columns count changes within a time window; they are not inventory totals.</> },
            { text: <>For a travel decision, switch to the <Link href="/iphone-duo-near-me">distance-based finder</Link> or <Link href="/map">map</Link>.</> },
          ]} />
          <ChipLinks items={[{ href: "/stores", label: "Choose a state or store" }, { href: "/iphone-duo-near-me", label: "Build a reachable shortlist" }, { href: "/map", label: "Inspect the map" }]} />
        </section>
        <section id="when" className="guide-chapter">
          <h2>Use a time pattern without turning it into an appointment</h2>
          <p>{pattern ? `${pct(w.share)} of ${n(t.n)} returns in the sample from ${since} occurred between ${hourLabel(w.from)} and ${hourLabel(w.to % 24)}, in each store’s local time. The remainder occurred outside that interval.` : have ? `There are ${n(t.n)} returns across ${plural(t.days, "day")} in the current sample, but no supported hour pattern is available.` : "A timing pattern cannot be derived from the current response. Missing or insufficient history is not replaced by a suggested arrival time."} Apple’s future pickup availability is not determined by this chart.</p>
          {have && <StatGrid cols={3} className="my-4">
            <Stat value={`${t.days}/${tracked}`} label="represented days with at least one return" />
            <Stat value={t.today ? n(t.today.restocks) : "0"} label="returns recorded so far in local calendar days" />
            <Stat value={t.peakWeekday == null ? "—" : WEEKDAYS[t.peakWeekday]} label="weekday with the largest supported historical count" />
          </StatGrid>}
          <p>Choose the geography that matches your shortlist. A national distribution combines many stores and time zones; <Link href="/iphone-duo-restock-times/california">California</Link> and <Link href="/iphone-duo-restock-times/new-york/new-york">New York City</Link> have their own evidence pages.</p>
          <ChipLinks items={[{ href: "/iphone-duo-restock-times", label: "Explore the local-hour distributions" }]} />
        </section>
        <section id="how-long" className="guide-chapter">
          <h2>A completed listing has a duration; a current one has no countdown</h2>
          <p>{sell ? `The historical median is ${band}, based on ${n(sell.n)} completed listings. Within that sample, ${pct(sell.within2min)} ended within two minutes and ${pct(sell.within20min)} within twenty minutes.` : ds ? `The seven-day sample across all tracked countries contains ${n(ds.n)} completed listings with a median of ${ds.medianSec} seconds. It is a separate observation window, not a lifetime estimate for the current listing.` : "There is no qualifying duration sample in this response. No number is used as a substitute."} A notification reaches you after observation, synchronization and delivery, so these durations do not describe the time remaining to order.</p>
          {sell && <StatGrid cols={4} className="my-4"><Stat value={sell.medianSec} unit="s" label="median observed interval" /><Stat value={pct(sell.within2min)} label="completed within two minutes" /><Stat value={pct(sell.within20min)} label="completed within twenty minutes" /><Stat value={sell.fastestSec} unit="s" label="shortest interval in the sample" /></StatGrid>}
          {ds && <p className="text-sm">The separate seven-day comparison across all tracked countries contains {n(ds.n)} timed listings; {pct(ds.within30)} ended within 30 seconds. It should not be extrapolated into a promised notification or checkout success rate.</p>}
          <Measured>Durations are measured between recorded source observations. Those observations bound the measured interval rather than reveal the exact instant a shopper ordered. Imported records retain their original timestamps.</Measured>
          <ChipLinks items={[{ href: "/iphone-duo-sell-out-times", label: "Inspect the duration sample and its limits" }]} />
        </section>
        <section id="alerts" className="guide-chapter">
          <h2>Decide whether a saved watch is useful for your plan</h2>
          <p>{PRICE_SENTENCE} Browsing the same inventory and history remains free. A paid match can prompt a new check; it cannot reserve a phone or make the source collect stock faster for you.</p>
          <StepStrip className="my-4 lg:grid-cols-3!" steps={[
            { title: "Define acceptable matches", hint: "Each saved rule combines one store with one model, capacity and color. Include only combinations you would purchase." },
            { title: "Choose a delivery route", hint: <>Review <Link href="/install">phone setup</Link> and notification permissions. Collection, synchronization and delivery can all add delay.</> },
            { title: "Verify before paying", hint: "Open Apple’s current offer, check the named store and configuration, then review the pickup details and order total." },
          ]} />
          <p>Current monthly plans are {PLANS.plus.name} at ${PLANS.plus.priceUsd} for {PLANS.plus.limit} saved matches, {PLANS.pro.name} at ${PLANS.pro.priceUsd} for {PLANS.pro.limit}, and {PLANS.max.name} at ${PLANS.max.priceUsd} for {PLANS.max.limit}. Review the <Link href="/pricing">plan terms</Link> before checkout.</p>
          <ChipLinks items={[{ href: "/iphone-duo-stock-alerts", label: "Check notification behavior" }, { href: "/how-to-grab-an-iphone-duo-restock", label: "Prepare your pickup decisions" }, { href: "/install", label: "Set up notifications" }]} />
          <p><Link href={alert} className="btn btn-primary">Save an acceptable pickup match</Link></p>
        </section>
        <section id="abroad" className="guide-chapter">
          <h2>Read each market on its own terms</h2>
          <p>The international comparison covers {n(intlTotal)} stores in {INTL_CODES.length} countries. Its returned snapshot contains {intlNow} stores with an available configuration{topIntl && topIntl.now > 0 ? `, including ${topIntl.now} in ${topIntl.name}` : ""}. Catalogs and observation histories are local; a US return says nothing about the next update elsewhere.</p>
          <Table caption={`International aggregate by market; historical coverage from ${longDate(TRACKING_SINCE_INTL)}. A failed country read can appear as zero: check the market page before drawing a stock conclusion.`} head={["Country", "Stores in snapshot", "Apple Stores tracked"]} min="22rem">
            {intl.map((c) => (
              <tr key={c.cc} className={`border-b border-line ${c.now > 0 ? "bg-accent/[0.06]" : ""}`}>
                <th scope="row" className={rowTh}><Link href={c.href} className="hover:underline">{c.name}</Link></th>
                <td className={`${td} ${c.now > 0 ? "font-semibold text-accent" : ""}`}>{c.now}</td>
                <td className={td}>{c.total}</td>
              </tr>
            ))}
          </Table>
          <p>A zero in this compact international aggregate can also result from an unreadable country response. Open the country page and inspect its observation times before treating the number as evidence of no availability.</p>
          <Measured title="Dataset boundaries">These tables concern Apple Store pickup observations. They do not cover carrier stock, shipping estimates or physical unit counts. International history begins {longDate(TRACKING_SINCE_INTL)} and may predate this website.</Measured>
        </section>
      </div>
      <RelatedBlock>
        <LinkRow title="Continue your pickup plan" links={[
          { href: "/iphone-duo-stock-checker", label: "iPhone Duo stock checker" },
          { href: "/where-to-buy-iphone-duo", label: "Where to buy an iPhone Duo" },
          { href: "/iphone-duo-restock-times", label: "When Apple restocks the iPhone Duo" },
          { href: "/iphone-duo-sell-out-times", label: "How fast it sells out" },
          { href: "/iphone-duo-stock-alerts", label: "Stock alerts" },
          { href: "/iphone-duo-near-me", label: "iPhone Duo near me" },
          { href: "/how-to-get-an-iphone-duo", label: "How to get an iPhone Duo" },
          { href: "/how-to-grab-an-iphone-duo-restock", label: "Prepare a pickup order" },
          { href: "/which-iphone-duo-restocks-most", label: "Which configuration restocks most" },
          { href: "/apple-store-pickup-availability-explained", label: "Pickup availability explained" },
        ]} />
        <LinkRow title="Live pages" links={[
          { href: "/stock/iphone-duo", label: "iPhone Duo stock by store" },
          { href: "/restocks", label: "Restock log" },
          { href: "/map", label: "Map" },
          { href: "/stores", label: "Apple Stores by state" },
        ]} />
      </RelatedBlock>
      <div className="mt-10"><RichFaq items={faq} facts={facts} title="Reading a return correctly" /></div>
      <div className="mt-8"><SourceList sources={sources} facts={facts} where={`US pickup observations and ${INTL_CODES.length} international markets`} since={longDate(TRACKING_SINCE_US)} /></div>
    </GuideLayout>
  );
}
