import { withCuratedMetadata } from "@/lib/seo/curation";
import { GuideLayout } from "@/components/guides/GuideLayout";
/** A geographic planning guide: choose a realistic journey, inspect the exact listing, and interpret distance and history separately. */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { RichFaq, SourceList } from "@/components/content/RichFaq";
import { JsonLd } from "@/components/seo/JsonLd";
import { NearMeFinder, type NearMeData } from "@/components/content/NearMeFinder";
import { Measured, Points, Stat, StatGrid, Swap, type Point } from "@/components/ui/Viz";
import { getFacts, tokenValue } from "@/lib/content/facts";
import type { Faq, Source } from "@/lib/content/types";
import { PART_INDEX, STORES, appleName, catalogFor, cityLine, statePath, storeByNumber, storePath, type Store } from "@/lib/apple/catalog";
import { INTL_CODES } from "@/lib/apple/countries";
import { TRACKING_SINCE_US, hourLabel, localStamp } from "@/lib/content/siteFacts";
import { busiestWindow, duoRestockTimes } from "@/lib/content/restockTimes";
import { medianBand } from "@/lib/stock/sellouts";
import { recentByConfig } from "@/lib/stock/recent";
import { stockByStore } from "@/lib/stock/queries";
import { alertHref, itemListJsonLd } from "@/lib/seo/enrich";

export const revalidate = 3600;

const TITLE = "iPhone Duo Near You: Build a Reachable Store Shortlist";
const DESCRIPTION = `Plan a practical iPhone Duo pickup: rank ${STORES.length} US stores from a ZIP or location, check exact listings, and compare travel estimates with recorded history.`;
const APPLE_STORES = "https://www.apple.com/retail/storelist/";
const CENSUS_GAZETTEER = "https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html";
const APPLE_PICKUP = "https://www.apple.com/shop/shipping-pickup";

export const metadata: Metadata = withCuratedMetadata("/iphone-duo-near-me", {
  title: { absolute: `${TITLE} · ShelfSpring` },
  description: DESCRIPTION,
  alternates: { canonical: "/iphone-duo-near-me" },
  openGraph: { type: "article", siteName: "ShelfSpring", title: TITLE, description: DESCRIPTION, url: "/iphone-duo-near-me" },
});

const n = (x: number) => x.toLocaleString("en-US");
/** Whole-percent shares; a share under half a percent reads "<1%", never a misleading "0%". */
const pct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
const LONG = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" });
const longDate = (ymd: string) => LONG.format(new Date(`${ymd}T12:00:00Z`));

type Now = { store: Store; parts: string[] };

/** Keyword lines inside the prose pane (the pane's list indent is turned off). */
function Keys({ items }: { items: Point[] }) {
  return <Points items={items} className="my-3 ml-0!" />;
}

/** A row of page links as chips. */
function ChipLinks({ items }: { items: { href: string; label: string }[] }) {
  return <div className="my-3 flex flex-wrap gap-1.5">{items.map((l) => <Link key={l.href} href={l.href} className="chip chip-sm no-underline!">{l.label}</Link>)}</div>;
}

/** Numbered step cards: a title and a one-line hint each. */
function Steps({ steps }: { steps: { title: ReactNode; hint: ReactNode }[] }) {
  return (
    <ol className="my-4 grid gap-3 sm:grid-cols-3">
      {steps.map((s, i) => (
        <li key={i} className="pane-2 flex gap-3 p-4">
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-[var(--accent-ink)]">{i + 1}</span>
          <span className="min-w-0 text-sm leading-snug"><span className="block font-semibold text-ink">{s.title}</span><span className="mt-1 block text-xs text-ink-3">{s.hint}</span></span>
        </li>
      ))}
    </ol>
  );
}

/** "Figure → how it is made": the legend for the finder's distances. */
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

export default async function NearMePage() {
  const [rows, recent, rt, facts] = await Promise.all([stockByStore("duo"), recentByConfig({ country: "us" }), duoRestockTimes("us"), getFacts()]);
  const items = catalogFor("duo");
  const cfg = (p: string) => { const i = PART_INDEX.get(p); return i ? `${i.storage} ${i.color}` : p; };
  // stockByStore answers [] both for "no rows" and for a read that failed; a status row exists for every tracked store, so [] means unreadable.
  const unknown = rows.length === 0;
  const now: Now[] = rows
    .filter((r) => r.availableParts.length > 0)
    .map((r) => ({ store: storeByNumber(r.storeNumber), parts: r.availableParts }))
    .filter((x): x is Now => Boolean(x.store))
    .sort((a, b) => a.store.state.localeCompare(b.store.state) || a.store.city.localeCompare(b.store.city) || a.store.name.localeCompare(b.store.name));
  const count = now.length;
  const byState = new Map<string, Now[]>();
  for (const x of now) byState.set(x.store.state, [...(byState.get(x.store.state) ?? []), x]);
  const states = [...byState.keys()].sort();
  const asOf = tokenValue("asOf", facts) ?? "";
  const win = busiestWindow(rt.byHour);
  const hasPattern = rt.n > 0 && !rt.unknown;
  const winLabel = `${hourLabel(win.from)} and ${hourLabel(win.to)}`;
  const top: { store: Store; restocks: number }[] = [];
  for (const t of rt.topStores.slice(0, 3)) { const store = storeByNumber(t.storeNumber); if (store) top.push({ store, restocks: t.restocks }); }
  const latest = recent.latest ? { ...recent.latest, store: storeByNumber(recent.latest.storeNumber) } : null;
  const sell = rt.sellout;
  /** "about 60–80 seconds" from the timed sell-outs, or a wording that claims no number while there are none. */
  const lasts = sell ? `about ${medianBand(sell.medianSec)}` : "unavailable";
  const alert = alertHref({ model: "duo" });

  const data: NearMeData = {
    stock: Object.fromEntries(now.map((x) => [x.store.storeNumber, x.parts.map(cfg)])),
    total: items.length,
    alertPattern: alertHref({ model: "duo", store: "STORE_NUMBER" }),
    asOf,
  };

  const sections = [
    { id: "find", nav: "Set your travel boundary" },
    { id: "now", nav: "Read the current shortlist" },
    { id: "best", nav: "Compare nearby alternatives" },
    { id: "distance", nav: "Check the travel estimate" },
    { id: "ai", nav: "Browse without a location" },
  ];
  const faq: Faq[] = [
    { q: "Does the nearest store have the best chance of stock?", a: "Distance and availability answer different questions. The finder orders stores geographically; the inventory badge describes the latest recorded configurations. Keep only locations whose pickup journey works for you, then compare their current listings and history." },
    { q: "Can I use a ZIP instead of device location?", a: "Enter a five-digit US ZIP to use its approximate area center. That is useful for planning from home, work or a destination without granting the browser location permission. It is less precise than your actual starting point." },
    { q: "What should I do when every nearby store shows zero?", a: sell
      ? `A zero describes the snapshot, not the store’s future supply. The historical sample contains ${n(sell.n)} timed listings with a median of ${sell.medianSec} seconds, but that does not explain why any particular store is empty. Compare recent returns or save a watch for acceptable configurations.`
      : "Keep a shortlist that fits your journey and check its observation times. There is not enough timed listing data here to estimate how long a future listing may remain available. You can inspect recent returns or save a matching watch without treating either as a forecast." },
    { q: "Should I travel as soon as a store appears in the results?", a: `First open Apple’s order page and verify the exact model, storage, color and pickup store. A ShelfSpring result is not an order or a hold. Follow Apple’s collection instructions after ordering ([pickup help](${APPLE_PICKUP})).` },
    { q: "Can I plan a pickup in another country?", a: `This finder is scoped to US stores. Use the country switch for the ${INTL_CODES.length} other supported markets; their store pages use the local catalog and observation history. A US listing does not establish availability abroad.` },
  ];
  const sources: Source[] = [
    { label: "Apple store directory: locations", url: APPLE_STORES },
    { label: "Census Gazetteer: ZIP-area reference data", url: CENSUS_GAZETTEER },
    { label: "Apple pickup instructions", url: APPLE_PICKUP },
  ];
  const site = "https://shelfspring.com";
  const ld = [
    { "@context": "https://schema.org", "@type": "WebPage", "@id": `${site}/iphone-duo-near-me`, url: `${site}/iphone-duo-near-me`, name: TITLE, description: DESCRIPTION, isPartOf: { "@id": `${site}/#website` }, about: { "@id": `${site}/#organization` }, dateModified: facts.at },
    ...(count > 0 ? [itemListJsonLd(`US Apple Stores with a recorded iPhone Duo pickup listing (${asOf})`, now.map((x) => x.store))] : []),
  ];
  return (
    <GuideLayout guide="iphone-duo-near-me" contents={sections.map((item) => ({ id: item.id, label: item.nav }))}>
      <JsonLd data={ld} />
      <div className="guide-chapters">
        <section id="find" className="guide-chapter">
          <h2>Begin with a journey you would actually make</h2>
          <p className="mb-5 mt-3 text-ink-2">Choose your starting point before choosing a store. A location near work may be practical on a weekday; a shorter trip from home may suit a different pickup slot. The finder ranks {STORES.length} US Apple Stores and presents the ten nearest so you can make that first cut.</p>
          <NearMeFinder data={data} />
          <Steps steps={[
            { title: "Choose a starting point", hint: "Use a ZIP for an approximate area, or let the browser request your location." },
            { title: "Check your exact version", hint: `A store may list only part of the ${items.length}-configuration range. Read the storage and color alongside its badge.` },
            { title: "Keep a realistic shortlist", hint: "Allow for the offered pickup time, opening hours and the actual route. Save watches only for combinations you would buy." },
          ]} />
          <ChipLinks items={[{ href: "/map", label: "See the geographic picture" }, { href: "/stores", label: "Browse the store directory" }, { href: "/stock/iphone-duo", label: "Compare exact configurations" }]} />
        </section>
        <section id="now" className="guide-chapter prose-site">
          <h2>Turn a result into a specific pickup check</h2>
          <p>{unknown ? <>Current inventory was unavailable when this page was prepared. Distance results still help with planning, but they do not establish which stores have a phone.</> : count > 0 ? <>The snapshot contains an iPhone Duo listing at {count} stores across {states.length} states. Its page timestamp is {asOf}; open a store to inspect the configuration and its observation time before checking Apple.</> : <>This snapshot contains no available iPhone Duo configuration at the tracked US stores. That is a current reading, not evidence that a store will remain empty or that a return is due.</>}</p>
          <StatGrid cols={3} className="my-4">
            <Stat value={unknown ? "—" : count} label="stores with a recorded available configuration" tone={count > 0 ? "accent" : "muted"} />
            <Stat value={recent.unknown ? "—" : n(recent.restocks)} label="returns recorded during the past 24 hours" />
            <Stat value={sell ? lasts : "—"} label={sell ? `median duration in ${n(sell.n)} timed listings` : "listing duration not yet established"} />
          </StatGrid>
          {count > 0 && states.map((st) => (
            <div key={st}><h3><Link href={statePath(st)}>{st}</Link></h3><ul>{byState.get(st)!.map((x) => <li key={x.store.storeNumber}><Link href={storePath(x.store)}>{appleName(x.store)}</Link>, {cityLine(x.store)}: {x.parts.map(cfg).join(", ")}</li>)}</ul></div>
          ))}
          {latest && <p className="text-sm text-ink-3">For historical context, the most recent recorded return was {cfg(latest.partNumber)} at {latest.store ? appleName(latest.store) : "a tracked store"}, {localStamp(latest.at, latest.store ?? STORES[0])} local time. It may already have disappeared.</p>}
          <Measured>A count is a count of stores with observed listings, not a count of phones. A positive result cannot reserve inventory. Collection and synchronization can also leave a gap between the source observation and what you see here.</Measured>
        </section>
        <section id="best" className="guide-chapter prose-site">
          <h2>Use history to compare alternatives within reach</h2>
          <p>Once travel works, history can help distinguish a quiet store from one with more recorded returns. It cannot tell you how many shoppers are waiting, how many units arrived or which location will have the next listing. A distant leader is not automatically a useful choice.</p>
          <ol className="my-4 grid gap-3 sm:grid-cols-2">
            <Swap no="Choose a distant store solely because it tops a ranking" yes="Compare locations you can collect from" why="Travel is a constraint you know now; the next stock return is uncertain." />
            <Swap no="Treat the busiest hour as a pickup appointment" yes="Read the store’s actual pickup offer" why="Historical hours describe earlier changes. Apple supplies the available collection options when you order." />
          </ol>
          {hasPattern && <p>The national sample places {pct(win.share)} of {n(rt.n)} recorded returns between {winLabel}, using each store’s local time, from {longDate(rt.since)}. Check the store-specific pattern before applying that national summary to your shortlist.</p>}
          {top.length > 0 && <KeyTable head={["Historical comparison", "Recorded returns"]} rows={top.map((entry) => [<><Link href={storePath(entry.store)}>{appleName(entry.store)}</Link>, {cityLine(entry.store)}</>, n(entry.restocks)])} />}
          <ChipLinks items={[{ href: "/which-iphone-duo-restocks-most", label: "Compare configuration history" }, { href: "/iphone-duo-restock-times", label: "Inspect local-hour patterns" }, { href: "/iphone-duo-stock-alerts", label: "Understand saved watches" }, { href: "/install", label: "Set up phone notifications" }]} />
        </section>
        <section id="distance" className="guide-chapter prose-site">
          <h2>Keep the distance estimate separate from your route</h2>
          <p>The finder provides a rough planning distance and drive time. It does not calculate a traffic-aware route. A bridge, transit connection, parking restriction or your actual position within a ZIP area can change the trip substantially.</p>
          <KeyTable head={["Input or estimate", "How to interpret it"]} rows={[
            ["Road distance", <>The straight-line distance is multiplied by 1.2–1.35 to approximate a road journey; this is not a measured route.</>],
            ["Drive time", <>The estimate includes about five minutes for departure and parking, then a modeled speed rising from 22 to 60 mph as distance increases. It does not include current traffic.</>],
            ["ZIP starting point", <>The finder uses a reference center for the ZIP area from <a href={CENSUS_GAZETTEER} target="_blank" rel="noopener">Census data</a>, rather than your street address.</>],
            ["Store destination", <>Coordinates identify the {STORES.length} locations in the <a href={APPLE_STORES} target="_blank" rel="noopener">Apple store directory</a>; open the store page for its address.</>],
          ]} />
          <Measured>Before committing to a collection slot, check directions in a mapping service and compare the journey with Apple’s instructions. The estimate here is intended to narrow a search, not to promise an arrival time.</Measured>
        </section>
        <section id="ai" className="guide-chapter prose-site">
          <h2>Build the same shortlist without sharing a location</h2>
          <p>A state or city is enough to start. The directory exposes the same store pages as the finder, so you can compare places manually or follow a link supplied by another person. Each store page retains its own configurations and observation history.</p>
          {unknown ? <p>Current counts are unavailable in this response; treat the directory as a planning aid until you can read a fresh observation.</p> : states.length > 0 ? <><p>These states contain at least one available listing in this snapshot:</p><ChipLinks items={states.map((st) => ({ href: statePath(st), label: st }))} /></> : <p>No state contains an available listing in this snapshot. You can still inspect the store histories and choose where a future watch would be useful.</p>}
          <Keys items={[
            { text: <>Start with <Link href="/stores">the US directory</Link>, or go straight to <Link href={statePath("Texas")}>Texas</Link> or <Link href={statePath("California")}>California</Link>.</> },
            { text: <>City pages group nearby locations; the individual store page is the place to verify the exact configuration.</> },
            { text: <>ShelfSpring is independent of Apple. Follow Apple’s order and collection instructions for any purchase.</> },
          ]} />
          <p><Link href={alert} className="btn btn-primary">Save a watch for your shortlist</Link></p>
        </section>
      </div>
      <div className="mt-10"><RichFaq items={faq} facts={facts} title="Planning questions" /></div>
      <div className="mt-8"><SourceList sources={sources} facts={facts} where={`all ${STORES.length} US Apple Stores`} since={longDate(TRACKING_SINCE_US)} /></div>
    </GuideLayout>
  );
}
