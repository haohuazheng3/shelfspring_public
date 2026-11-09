import { withCuratedMetadata } from "@/lib/seo/curation";
import { GuideLayout } from "@/components/guides/GuideLayout";
/** A purchase-planning comparison. Apple pickup observations are measured; delivery, carrier and retailer offers must be checked with their sellers. */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cache } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { RichFaq, SourceList } from "@/components/content/RichFaq";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs, LinkRow, RelatedBlock } from "@/components/seo/Related";
import { RestockFeed } from "@/components/restocks/RestockFeed";
import { Swatch } from "@/components/stores/ConfigTable";
import { Measured, Stat, StatGrid, StepStrip, Swap } from "@/components/ui/Viz";
import { getFacts } from "@/lib/content/facts";
import type { Faq, Source } from "@/lib/content/types";
import { PART_INDEX, STORES, appleBuyUrl, appleFamilyUrl, appleName, catalogFor, cityLine, statePath, statesWithStores, storeByNumber, storePath, storeTimeZone, storesOf, type CatalogItem, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, INTL_CODES, prefixOf } from "@/lib/apple/countries";
import { PLANS } from "@/lib/plans";
import { PATTERN_MIN, PATTERN_MIN_DAYS, TRACKING_SINCE_INTL, TRACKING_SINCE_US, hourLabel, localStamp, siteFacts } from "@/lib/content/siteFacts";
import { busiestWindow, duoRestockTimes, rangeLabel, type StoreRow } from "@/lib/content/restockTimes";
import { recentByConfig } from "@/lib/stock/recent";
import { modelStock, restockFeed, storesWithStockNow } from "@/lib/stock/queries";
import { medianBand } from "@/lib/stock/sellouts";
import { alertHref, fitTitle, fmtPrice } from "@/lib/seo/enrich";

export const revalidate = 3600;

const PATH = "/where-to-buy-iphone-duo";
const SITE = "https://shelfspring.com";
/** 55 characters; the phrase people type, then the promise the page keeps. */
const TITLE = "Buying an iPhone Duo: Compare Offers Before Choosing";
const APPLE_PICKUP = "https://www.apple.com/shop/shipping-pickup";
const APPLE_DUO = "https://www.apple.com/shop/buy-iphone/iphone-duo";
const FCC_UNLOCK = "https://www.fcc.gov/consumers/guides/cell-phone-unlocking-faqs";
const WIKI_SIM_LOCK = "https://en.wikipedia.org/wiki/SIM_lock";
const CARRIERS = [
  { name: "AT&T", url: "https://www.att.com/buy/phones/" },
  { name: "Verizon", url: "https://www.verizon.com/smartphones/" },
  { name: "T-Mobile", url: "https://www.t-mobile.com/cell-phones" },
];
const BEST_BUY = { name: "Best Buy", url: "https://www.bestbuy.com/" };
/** Shared plan context for the guide and its FAQ. */
const PRICE_SENTENCE = `Alerts from $${PLANS.plus.priceUsd}/month: save store–configuration matches and receive notifications after newly detected availability reaches ShelfSpring. Delivery times vary.`;

const n = (x: number) => x.toLocaleString("en-US");
/** Whole-percent shares; a share under half a percent reads "<1%", never a misleading "0%". */
const pct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
const LONG = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" });
const longDate = (ymd: string) => LONG.format(new Date(`${ymd}T12:00:00Z`));
const ET = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
/** "9:31 AM" on the store's own clock. */
const clockAt = (iso: string, store: Store) => new Intl.DateTimeFormat("en-US", { timeZone: storeTimeZone(store), hour: "numeric", minute: "2-digit" }).format(new Date(iso));
const cfgName = (i: CatalogItem) => `${i.storage} ${i.color}`;
const cfgOf = (partNumber: string) => { const i = PART_INDEX.get(partNumber); return i ? cfgName(i) : partNumber; };

/** One read per request, shared by the metadata and the page. */
const load = cache(async () => {
  const [stockNow, recent, f, facts, t, rows, feed, abroad] = await Promise.all([
    storesWithStockNow(undefined, "us"),
    recentByConfig({ country: "us" }),
    siteFacts(),
    getFacts(),
    duoRestockTimes("us"),
    modelStock("duo", "us"),
    restockFeed({ model: "duo", limit: 8, country: "us" }),
    Promise.all(INTL_CODES.map((cc) => storesWithStockNow(undefined, cc))),
  ]);
  return { stockNow, recent, f, facts, t, rows, feed, abroad };
});

interface StateRow { name: string; now: number; total: number; lastAt: string | null; lastStore: Store | undefined }
interface ConfigRow { item: CatalogItem; now: number; restocks: number }

function add(map: Map<string, Set<string>>, key: string, value: string) {
  const set = map.get(key) ?? new Set<string>();
  set.add(value);
  map.set(key, set);
}

/** Every number on the page, derived once from the reads; `stockUnknown` and `t.unknown` keep zeros from posing as facts. */
function derive(d: Awaited<ReturnType<typeof load>>) {
  const { stockNow, recent, f, facts, t, rows } = d;
  const items = catalogFor("duo");
  // modelStock always has a row for every store × configuration; an empty array means the read failed.
  const stockUnknown = rows.length === 0 || facts.models.duo?.unknown === true;
  const avail = rows.filter((r) => r.status === "available");
  const storesNow = stockUnknown ? stockNow.duo : new Set(avail.map((r) => r.storeNumber)).size;
  const pairsNow = avail.length;

  const totals = new Map(statesWithStores().map((s) => [s.name, s.count]));
  const byState = new Map<string, Set<string>>();
  for (const r of avail) { const s = storeByNumber(r.storeNumber); if (s) add(byState, s.state, r.storeNumber); }
  const regionLast = new Map(t.byRegion.map((r) => [r.name, r]));
  const states: StateRow[] = [...byState.entries()]
    .map(([name, set]) => ({ name, now: set.size, total: totals.get(name) ?? 0, lastAt: regionLast.get(name)?.lastAt ?? null, lastStore: regionLast.get(name)?.lastStore ? storeByNumber(regionLast.get(name)!.lastStore!) : undefined }))
    .sort((a, b) => b.now - a.now || b.total - a.total || a.name.localeCompare(b.name))
    .slice(0, 10);

  const nowByPart = new Map<string, Set<string>>();
  for (const r of avail) add(nowByPart, r.partNumber, r.storeNumber);
  const restocksByPart = new Map(t.byPart.map((p) => [p.partNumber, p.restocks]));
  const configs: ConfigRow[] = items
    .map((item) => ({ item, now: nowByPart.get(item.partNumber)?.size ?? 0, restocks: restocksByPart.get(item.partNumber) ?? 0 }))
    .sort((a, b) => b.restocks - a.restocks || b.now - a.now);
  const topCfg = configs[0] && configs[0].restocks > 0 ? configs[0] : null;
  const lastCfg = topCfg && configs.length > 1 && configs[configs.length - 1].item !== topCfg.item ? configs[configs.length - 1] : null;

  const latest = recent.latest ?? t.latest;
  const latestStore = latest ? storeByNumber(latest.storeNumber) : undefined;
  const ds = f.duoSellout;
  const medianSec = ds?.medianSec ?? t.sellout?.medianSec ?? null;
  const band = medianSec != null ? medianBand(medianSec) : null;
  const top = t.topStores[0];
  const topStore = top ? storeByNumber(top.storeNumber) : undefined;
  const topStores = t.topStores.slice(0, 5).map((r) => ({ ...r, store: storeByNumber(r.storeNumber) })).filter((r): r is StoreRow & { store: Store } => Boolean(r.store));
  const pattern = t.peakHour != null && t.n > 0;
  const bw = pattern ? busiestWindow(t.byHour) : null;
  const since = longDate(t.since);
  const tracked = Math.max(t.daily.length, t.days, 1);

  const abroad = INTL_CODES.map((cc, i) => ({ cc, now: d.abroad[i].duo, total: storesOf(cc).length })).sort((a, b) => b.now - a.now || b.total - a.total);
  const abroadNow = abroad.reduce((a, c) => a + c.now, 0);
  const intlStores = abroad.reduce((a, c) => a + c.total, 0);

  return { items, stockUnknown, storesNow, pairsNow, states, configs, topCfg, lastCfg, latest, latestStore, medianSec, band, top, topStore, topStores, pattern, bw, since, tracked, abroad, abroadNow, intlStores, recent, t, f, facts, feed: d.feed };
}
type View = ReturnType<typeof derive>;

/** ≤ 158 characters, from the live numbers; the first variant that fits wins. */
function description(v: View): string {
  return fitTitle([
    `${v.stockUnknown ? "Current pickup stock is unreadable" : `${v.storesNow}/${STORES.length} US stores in the pickup snapshot`}. Compare iPhone Duo configuration, travel, delivery and seller terms before choosing an offer.`,
    "Compare iPhone Duo purchase routes: configuration, budget, pickup journey and delivery offer. Understand what recorded stock can and cannot tell you.",
  ], 158);
}

export async function generateMetadata(): Promise<Metadata> {
  const v = derive(await load());
  const d = description(v);
  return withCuratedMetadata("/where-to-buy-iphone-duo", {
    title: { absolute: `${TITLE} · ShelfSpring` },
    description: d,
    alternates: { canonical: PATH },
    openGraph: { type: "article", siteName: "ShelfSpring", title: TITLE, description: d, url: PATH },
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

/** A row of page links as chips; outside links open in a new tab. */
function ChipLinks({ items }: { items: { href: string; label: string }[] }) {
  return (
    <div className="my-3 flex flex-wrap gap-1.5">
      {items.map((l) => l.href.startsWith("http")
        ? <a key={l.href} href={l.href} target="_blank" rel="noopener" className="chip chip-sm no-underline!">{l.label}</a>
        : <Link key={l.href} href={l.href} className="chip chip-sm no-underline!">{l.label}</Link>)}
    </div>
  );
}

const Out = ({ href, children }: { href: string; children: ReactNode }) => <a href={href} target="_blank" rel="noopener">{children}</a>;

export default async function WhereToBuyPage() {
  const v = derive(await load());
  const { items, stockUnknown, storesNow, pairsNow, states, configs, topCfg, lastCfg, latest, latestStore, medianSec, band, top, topStore, topStores, bw, since, tracked, abroad, abroadNow, intlStores, recent, t, facts, feed } = v;
  const alert = alertHref({ model: "duo" });
  const asOf = `${ET.format(new Date(facts.at))} ET`;
  const latestLine = latest && latestStore
    ? `${cfgOf(latest.partNumber)} at ${appleName(latestStore)} (${cityLine(latestStore)}), ${localStamp(latest.at, latestStore)} store local time`
    : "none logged yet";
  const storeLink = (s: Store) => <Link href={storePath(s)} className="hover:underline">{appleName(s)}</Link>;
  const win = bw ? rangeLabel(bw.from, bw.to) : null;

  const sections = [
    { id: "carriers", nav: "Compare the purchase routes" },
    { id: "configuration", nav: "Set budget and configuration" },
    { id: "now", nav: "Inspect pickup evidence" },
    { id: "which-store", nav: "Choose reachable stores" },
    { id: "delivery", nav: "Compare a delivery offer" },
    { id: "the-minute", nav: "Prepare the order decision" },
    { id: "abroad", nav: "Shop in another market" },
  ];
  const faq: Faq[] = [
    { q: "Can this page tell me where I can buy one today?", a: stockUnknown
      ? `Current pickup status is unavailable in this response. The historical tables can help you choose stores to check, but only a seller’s current offer establishes an ordering option. ShelfSpring’s dataset covers ${STORES.length} US Apple Stores, not every seller.`
      : `The retrieved snapshot lists an available configuration at ${storesNow} of ${STORES.length} US Apple Stores. That is a starting point for a pickup check, not a promise of a same-day purchase. Confirm the version and collection option with Apple; other sellers must be checked separately.` },
    { q: "Should I choose pickup or delivery?", a: "Compare the actual options offered for the configuration you want: delivery estimate, pickup location and slot, total cost, and any conditions. ShelfSpring records pickup observations but does not track delivery estimates, so it cannot rank the two routes by speed or certainty." },
    { q: "Can I assume a store has walk-in stock?", a: `No conclusion about walk-in stock follows from this dataset. It records online pickup responses. Check with Apple for the current purchase and collection options, and follow the instructions for your order rather than travelling on the basis of a historical event ([pickup guidance](${APPLE_PICKUP})).` },
    { q: "Does the most frequently returning configuration offer the best chance?", a: topCfg
      ? `${cfgName(topCfg.item)} has ${n(topCfg.restocks)} returns in this sample from ${since}. The record does not reveal units per return or the number of other buyers. Use it to compare acceptable alternatives, not to assign a purchase probability.`
      : "There is no supported historical leader in this response. Choose the capacity, colors and budget that work for you; the next return cannot be inferred from a missing ranking." },
    { q: "Does an Apple pickup count cover carriers or retailers?", a: "No. Each seller has its own listings, prices and terms. Open the seller’s current product page and confirm the model, delivery or pickup option, activation requirements and final charge. The links here are starting points, not stock endorsements." },
    { q: "What would a ShelfSpring alert add to this plan?", a: `${PRICE_SENTENCE} An alert can prompt you to revisit an acceptable store–configuration match after a new return is detected. It does not place an order, hold inventory or change Apple’s offer. Public browsing remains free.` },
  ];
  const sources: Source[] = [
    { label: "Apple’s collection and delivery guidance", url: APPLE_PICKUP },
    { label: "Apple’s iPhone Duo order page", url: APPLE_DUO },
    { label: "FCC background on phone unlocking", url: FCC_UNLOCK },
    { label: "SIM lock terminology", url: WIKI_SIM_LOCK },
  ];
  const desc = description(v);
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${SITE}${PATH}`, url: `${SITE}${PATH}`, name: TITLE, description: desc, isPartOf: { "@id": `${SITE}/#website` }, about: { "@id": `${SITE}/#organization` }, dateModified: facts.at },
      {
        "@type": "Dataset", "@id": `${SITE}${PATH}#dataset`, name: "iPhone Duo in-store pickup availability at US Apple Stores, live",
        description: `Latest recorded iPhone Duo pickup listings at ${STORES.length} US Apple Stores, plus imported historical returns from ${longDate(TRACKING_SINCE_US)} by state, store and configuration, with coverage in ${INTL_CODES.length} other countries.`,
        url: `${SITE}${PATH}`, publisher: { "@id": `${SITE}/#organization` }, isAccessibleForFree: true,
        temporalCoverage: `${TRACKING_SINCE_US}/..`, spatialCoverage: `Apple Stores in the United States, with the ${INTL_CODES.length} other countries ShelfSpring tracks`,
        variableMeasured: ["Apple Store", "US state", "iPhone Duo storage and color", "listed for pickup now", "confirmed restocks", "last restock time (store local)"],
        measurementTechnique: "Recorded apple.com pickup observations imported with their original timestamps; two matching source checks confirm a return, and initial sightings are excluded. Synchronization may delay current listings.",
        ...(t.n ? { size: `${n(t.n)} confirmed restocks` } : {}),
      },
    ],
  };

  return (
    <GuideLayout guide="where-to-buy-iphone-duo" contents={sections.map((item) => ({ id: item.id, label: item.nav }))}>
      <JsonLd data={ld} />
      <Breadcrumbs items={[{ href: "/", label: "ShelfSpring" }, { label: "Choose a purchase route" }]} />
      <div className="guide-evidence-lead">
        <p className="text-lg leading-relaxed text-ink-2">Start with the conditions of a useful purchase: the version you want, your spending limit and when and where you can receive it. Pickup history can inform that decision, but it cannot substitute for a seller’s current offer.</p>
        <p className="mt-3 text-xs text-ink-3">Page prepared {asOf}. The measured evidence below concerns Apple Store pickup; delivery estimates and other sellers’ stock are not collected here.</p>
        <StatGrid cols={4} className="mt-5">
          <Stat value={stockUnknown ? "—" : `${storesNow}/${STORES.length}`} label="US stores with a recorded available configuration" live={!stockUnknown} />
          <Stat value={recent.unknown ? "—" : n(recent.restocks)} label="recorded returns in the last 24 hours" />
          <Stat value={latest && latestStore ? clockAt(latest.at, latestStore) : "—"} label={latestStore ? `latest return at ${appleName(latestStore)}, local time` : "latest return unavailable"} />
          <Stat value={medianSec ?? "—"} unit={medianSec == null ? undefined : "s"} label={medianSec == null ? "no qualifying duration summary" : v.f.duoSellout ? "seven-day median across all tracked countries" : "median in the US historical sample"} />
        </StatGrid>
      </div>
      <div className="guide-chapters prose-site">
        <section id="carriers" className="guide-chapter">
          <h2>Compare what each route asks you to decide</h2>
          <p>Use the same configuration when comparing sellers. An attractive headline price, a different color or a different activation arrangement can make two offers look more similar than they are. Read the final terms on the seller’s page.</p>
          <Table caption="A purchase checklist, with the boundary of ShelfSpring’s evidence" head={["Route", "Check before committing", "Evidence available here", "Where to continue"]} min="40rem">
            <tr className="border-b border-line"><th scope="row" className={rowTh}>Apple Store pickup</th><td className={td}>Exact store, configuration, collection option and order confirmation</td><td className={td}>Recorded pickup status and historical availability changes</td><td className={td}><Out href={APPLE_PICKUP}>Apple pickup guidance</Out></td></tr>
            <tr className="border-b border-line"><th scope="row" className={rowTh}>Apple delivery</th><td className={td}>The estimate offered for your address and configuration, plus the order terms</td><td className={td}>No delivery-date or shipping-stock dataset</td><td className={td}><Out href={APPLE_DUO}>Apple’s configuration page</Out></td></tr>
            <tr className="border-b border-line"><th scope="row" className={rowTh}>Carrier purchase</th><td className={td}>Eligibility, activation, service or financing conditions, and whether the phone meets your network needs</td><td className={td}>No carrier inventory or offer verification</td><td className={td}>{CARRIERS.map((carrier, i) => <span key={carrier.url}>{i > 0 && " · "}<Out href={carrier.url}>{carrier.name}</Out></span>)}</td></tr>
            <tr className="border-b border-line"><th scope="row" className={rowTh}>Retailer purchase</th><td className={td}>Seller, exact model, pickup or delivery option, activation and return conditions</td><td className={td}>No retailer inventory or offer verification</td><td className={td}><Out href={BEST_BUY.url}>{BEST_BUY.name}</Out></td></tr>
          </Table>
          <p>If unlocking matters to your plans, verify the conditions of the specific offer rather than assuming them from the seller’s name. The <Out href={FCC_UNLOCK}>FCC’s unlocking guide</Out> and the definition of a <Out href={WIKI_SIM_LOCK}>SIM lock</Out> provide background; the seller must answer questions about its current terms.</p>
        </section>
        <section id="configuration" className="guide-chapter">
          <h2>Define acceptable alternatives before looking at frequency</h2>
          <p>Separate requirements from preferences. Capacity and budget may be fixed while color is flexible, or the exact finish may be the point of the purchase. Keep a short list of versions you would keep, without buying an unsuitable one solely because its historical count is higher.</p>
          {topCfg ? <p>{cfgName(topCfg.item)} has {n(topCfg.restocks)} of the {n(t.n)} recorded returns in this sample ({pct(topCfg.restocks / Math.max(1, t.n))}).{lastCfg ? <> The lowest-count configuration shown for comparison, {cfgName(lastCfg.item)}, has {n(lastCfg.restocks)}.</> : null} These counts describe the sample from {since}; they do not reveal demand, shipment size or a future waiting time.</p> : <p>{t.unknown ? "The historical comparison could not be read in this response." : "No configuration has a recorded return to support a ranking in this sample."} The catalog still provides versions, list prices and links to Apple.</p>}
          <Table caption={`All ${items.length} iPhone Duo configurations: US stores in the retrieved pickup snapshot (page prepared ${asOf}), confirmed restocks since ${since}, Apple's list price before sales tax, and the apple.com order page`} head={["Configuration", "Stores now", `Restocks since ${since}`, "Price", "apple.com"]} min="36rem">
            {configs.map((r) => (
              <tr key={r.item.partNumber} className={`border-b border-line ${r.restocks === 0 && r.now === 0 ? "text-ink-3" : ""}`}>
                <th scope="row" className={rowTh}><span className="inline-flex items-center gap-2"><Swatch color={r.item.color} />{cfgName(r.item)}</span></th>
                <td className={`${td} ${r.now > 0 ? "font-semibold text-accent" : ""}`}>{stockUnknown ? "–" : r.now}</td>
                <td className={td}>{t.unknown ? "–" : n(r.restocks)}</td>
                <td className={td}>{fmtPrice(r.item.price)}</td>
                <td className="py-2 pe-3 align-top"><Out href={appleBuyUrl(r.item)}>Order</Out></td>
              </tr>
            ))}
          </Table>
          <Measured>List prices exclude sales tax and may differ from a personalized offer at checkout. The store-count column refers to recorded availability, while the return column refers to historical changes. Neither column is a stock quantity.</Measured>
          <ChipLinks items={[{ href: "/which-iphone-duo-restocks-most", label: "Read the configuration history" }, { href: "/stock/iphone-duo", label: "Compare a version by store" }]} />
        </section>
        <section id="now" className="guide-chapter">
          <h2>Use pickup evidence to identify the next offer to check</h2>
          <p>{stockUnknown ? `Current inventory could not be read. The dataset covers ${STORES.length} US stores, but history cannot establish an available offer now.` : storesNow > 0 ? `The retrieved snapshot contains ${n(pairsNow)} available store–configuration pairs across ${storesNow} stores. A store can contribute more than one pair, so this is not a count of phones.` : `The snapshot contains no available iPhone Duo configuration at the ${STORES.length} tracked US stores. It does not establish the next restock time or availability through another channel.`}</p>
          {states.length > 0 ? <Table caption={`A ${states.length}-state shortlist from the retrieved pickup snapshot, prepared ${asOf}. The final column records an earlier change in the store’s local time.`} head={["State", "Stores in snapshot", "Last confirmed restock"]} min="30rem">
              {states.map((r) => (
                <tr key={r.name} className="border-b border-line">
                  <th scope="row" className={rowTh}><Link href={statePath(r.name)} className="hover:underline">{r.name}</Link></th>
                  <td className={td}>{r.now} of {r.total}</td>
                  <td className="py-2 pe-3 align-top">{r.lastAt && r.lastStore ? <>{localStamp(r.lastAt, r.lastStore)} · {storeLink(r.lastStore)}</> : "–"}</td>
                </tr>
              ))}
            </Table> : <div className="my-5"><RestockFeed rows={feed} showModel={false} model="duo" emptyText="No readable recent return is available for this comparison." /></div>}
          <p className="text-sm text-ink-3">Latest retrieved event: {latestLine}. Treat it as a record of an earlier change and recheck the exact offer with Apple.</p>
          <ChipLinks items={[{ href: "/iphone-duo-near-me", label: "Rank stores from your starting point" }, { href: "/iphone-duo-stock-checker", label: "Follow the stock-checking checklist" }, { href: "/map", label: "Inspect the geographic view" }]} />
        </section>
        <section id="which-store" className="guide-chapter">
          <h2>Choose the travel boundary before the historical leader</h2>
          <p>Keep only stores you could collect from under the offered conditions. Then compare activity within that shortlist. A large national return count does not make a distant store convenient or tell you how many other shoppers want the same configuration.</p>
          {top && topStore && <p>{appleName(topStore)} in {cityLine(topStore)} leads this historical sample with {n(top.restocks)} returns over {top.days} days. Its last recorded return is {localStamp(top.lastAt, topStore)} local time; that is evidence about the past, not a reason to leave for the store.</p>}
          {topStores.length > 0 && <Table caption={`Historical store comparison from ${since}: ${topStores.length} high-count locations. An hour summary requires ${PATTERN_MIN} returns on ${PATTERN_MIN_DAYS} distinct days; event times are local.`} head={["Store", "Restocks", "Days", "Usual hour", "Last restock"]} min="34rem">
              {topStores.map((r) => (
                <tr key={r.storeNumber} className="border-b border-line">
                  <th scope="row" className={rowTh}>{storeLink(r.store)}<span className="font-normal text-ink-3"> · {cityLine(r.store)}</span></th>
                  <td className={td}>{n(r.restocks)}</td>
                  <td className={td}>{r.days}</td>
                  <td className={td}>{r.peakHour != null ? hourLabel(r.peakHour) : "–"}</td>
                  <td className="py-2 pe-3 align-top">{localStamp(r.lastAt, r.store)}</td>
                </tr>
              ))}
            </Table>}
          <p>{bw && win ? `The national ${win} interval contains ${pct(bw.share)} of ${n(t.n)} returns from ${since}. Store-specific histories may differ, and Apple has not supplied a future pickup schedule through these observations.` : `A supported timing summary requires ${PATTERN_MIN} returns on ${PATTERN_MIN_DAYS} different days. This response does not provide a qualifying window to apply to your trip.`}</p>
          <ChipLinks items={[{ href: "/iphone-duo-restock-times", label: "Inspect national and local timing samples" }, { href: "/iphone-duo-restock-times/florida", label: "See a state-level example: Florida" }, { href: "/stores", label: "Choose your own store" }]} />
        </section>
        <section id="delivery" className="guide-chapter">
          <h2>Compare an actual delivery estimate with an actual pickup option</h2>
          <p>Open <Out href={APPLE_DUO}>Apple’s order page</Out> for the same version and address you would use for the purchase. Read the offered delivery estimate and compare it with any pickup location and collection option available to you. ShelfSpring does not track those delivery estimates, so it cannot declare either route faster or more certain.</p>
          {!t.unknown && t.n > 0 && <StatGrid cols={3} className="my-4"><Stat value={n(t.n)} label={`pickup returns in the sample from ${since}`} /><Stat value={`${t.stores}/${STORES.length}`} label="stores represented in that history" /><Stat value={t.today ? n(t.today.restocks) : `${t.days}/${tracked}`} label={t.today ? "returns recorded so far on local calendar days" : "represented days with a return"} /></StatGrid>}
          <p>The historical counts above explain why pickup may be worth checking. They cannot tell you when your preferred store will offer the phone or whether that will precede a quoted delivery date.</p>
          <ol className="my-4 grid gap-3 sm:grid-cols-2"><Swap no="Compare different capacities or activation terms" yes="Compare equivalent offers" why="Keep the configuration and purchase conditions aligned before comparing total cost or timing." /><Swap no="Treat a return count as a delivery estimate" yes="Use the date and collection options offered by the seller" why="A historical frequency is not a deadline for fulfilling your order." /></ol>
          <p>If you already placed an order, review its status and any cancellation conditions before creating another. Do not assume a second purchase automatically replaces the first.</p>
          <ChipLinks items={[...(topCfg ? [{ href: appleBuyUrl(topCfg.item), label: `Check Apple’s offer for ${cfgName(topCfg.item)}` }] : []), { href: APPLE_DUO, label: "Choose a version on Apple" }, { href: "/stock/iphone-duo", label: "Revisit recorded pickup choices" }]} />
        </section>
        <section id="the-minute" className="guide-chapter">
          <h2>Prepare decisions without promising a completed purchase</h2>
          <p>Before an alert arrives, decide which stores and configurations work and make sure you can access Apple’s checkout. Preparation reduces decisions you must make under time pressure; it does not protect inventory.{band ? <> The {v.f.duoSellout ? "seven-day sample across all tracked countries" : "US historical sample"} has a median of {band}, which is not a countdown for the next listing.</> : null}</p>
          <StepStrip className="my-4 lg:grid-cols-4!" steps={[
            { title: "Define your acceptable match", hint: "One store, one model, one capacity and one color. Keep travel and budget constraints visible." },
            { title: "Check notification access", hint: <>Follow the <Link href="/install">device setup</Link> and permission steps if you want phone notifications.</> },
            { title: "Review the current offer", hint: "On an alert, verify that Apple still offers the named configuration and pickup store." },
            { title: "Confirm the order details", hint: "Review the charge and collection instructions, then rely on Apple’s order confirmation rather than the alert." },
          ]} />
          <p>{PRICE_SENTENCE} All plans use the same synchronized stock feed. The monthly options are {PLANS.plus.name} (${PLANS.plus.priceUsd}, {PLANS.plus.limit} saved matches), {PLANS.pro.name} (${PLANS.pro.priceUsd}, {PLANS.pro.limit}) and {PLANS.max.name} (${PLANS.max.priceUsd}, {PLANS.max.limit}); see <Link href="/pricing">the current terms</Link>.</p>
          <ChipLinks items={[{ href: "/iphone-duo-stock-alerts", label: "Read the alert rules" }, { href: "/how-to-grab-an-iphone-duo-restock", label: "Review the checkout preparation guide" }, { href: "/install", label: "Set up a notification device" }]} />
          <p><Link href={alert} className="btn btn-primary">Save a match for your purchase plan</Link></p>
        </section>
        <section id="abroad" className="guide-chapter">
          <h2>Use local catalog and collection information abroad</h2>
          <p>The international directory contains {n(intlStores)} stores in {INTL_CODES.length} markets. Its aggregate snapshot returns {abroadNow} stores with a listed configuration. Country-level read failures can appear as zero in this compact aggregate; inspect the linked market’s observation times before relying on the count.</p>
          <Table caption={`International pickup aggregate prepared ${asOf}: ${INTL_CODES.length} markets, with zero also possible on a failed country read. Open the market for its observation details.`} head={["Country", "Stores in snapshot", "Stores tracked", "apple.com"]} min="30rem">
            {abroad.map((c) => (
              <tr key={c.cc} className={`border-b border-line ${c.now === 0 ? "text-ink-3" : ""}`}>
                <th scope="row" className={rowTh}><Link href={`${prefixOf(c.cc)}/stock/iphone-duo`} className="hover:underline">{COUNTRIES[c.cc].name}</Link></th>
                <td className={`${td} ${c.now > 0 ? "font-semibold text-accent" : ""}`}>{c.now}</td>
                <td className={td}>{c.total}</td>
                <td className="py-2 pe-3 align-top"><Out href={appleFamilyUrl("duo", c.cc)}>iPhone Duo, {COUNTRIES[c.cc].short}</Out></td>
              </tr>
            ))}
          </Table>
          <p>Check the local seller’s configuration, price, delivery and collection conditions. A listing in one country does not imply that an equivalent offer exists in another. International source history begins {longDate(TRACKING_SINCE_INTL)}, before the launch of this independent site.</p>
          <Measured title="What this comparison can establish">It can identify recorded Apple pickup listings and describe earlier availability changes. It cannot verify other sellers, count physical units, guarantee a collection slot or predict an arrival date. Apple controls its offers and orders; other sellers control theirs.</Measured>
        </section>
      </div>
      <RelatedBlock>
        <LinkRow title="Evidence for the next decision" links={[
          { href: "/iphone-duo-restock-times", label: "The iPhone Duo return study, hour by hour" },
          { href: "/iphone-duo-sell-out-times", label: "How long a return stays listed" },
          { href: "/iphone-duo-stock-alerts", label: "iPhone Duo stock alerts" },
          { href: "/iphone-duo-near-me", label: "iPhone Duo near me" },
          { href: "/how-to-get-an-iphone-duo", label: "How to get an iPhone Duo" },
          { href: "/how-to-grab-an-iphone-duo-restock", label: "How to prepare a pickup order" },
          { href: "/which-iphone-duo-restocks-most", label: "Which iPhone Duo restocks most?" },
          { href: "/apple-store-pickup-availability-explained", label: "Apple Store pickup availability, explained" },
        ]} />
        <LinkRow title="Live pages" links={[
          { href: "/stock/iphone-duo", label: "iPhone Duo stock at every US store" },
          { href: "/restocks", label: "The restock log" },
          { href: "/map", label: "Pickup map" },
          { href: "/stores", label: "All 269 US Apple Stores" },
        ]} />
        <LinkRow title="Continue the purchase plan" links={[
          { href: "/iphone-duo-back-in-stock", label: "Is the iPhone Duo back in stock?" },
          { href: "/iphone-duo-stock-checker", label: "iPhone Duo stock checker" },
        ]} />
      </RelatedBlock>
      <div className="mt-10"><RichFaq items={faq} facts={facts} title="Questions about the purchase route" /></div>
      <div className="mt-8"><SourceList sources={sources} facts={facts} where={`recorded US pickup listings and ${INTL_CODES.length} international markets`} since={longDate(TRACKING_SINCE_US)} /></div>
    </GuideLayout>
  );
}
