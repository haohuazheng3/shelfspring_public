import { withCuratedMetadata } from "@/lib/seo/curation";
import { GuideLayout } from "@/components/guides/GuideLayout";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { BlockView } from "@/components/content/Blocks";
import { Inline } from "@/components/content/Inline";
import { RichFaq, SourceList } from "@/components/content/RichFaq";
import { JsonLd } from "@/components/seo/JsonLd";
import { getFacts, type Facts } from "@/lib/content/facts";
import type { Block, Faq, Source } from "@/lib/content/types";
import { PART_INDEX, STORES, appleName, catalogFor, storeByNumber, storePath } from "@/lib/apple/catalog";
import { COUNTRIES, type CountryCode } from "@/lib/apple/countries";
import { PLANS } from "@/lib/plans";
import { TRACKING_SINCE_INTL, TRACKING_SINCE_US, localStamp } from "@/lib/content/siteFacts";
import { duoRestockTimes, type RestockTimes } from "@/lib/content/restockTimes";
import { fmtPrice, listWords, plural } from "@/lib/seo/enrich";
import { Measured, Points, Stat, StatGrid, StepStrip } from "@/components/ui/Viz";

export const revalidate = 3600;

const TITLE = "iPhone Duo Configuration Mix: Read the Return Records";
const DESCRIPTION = "Build a flexible iPhone Duo shortlist using US configuration counts, storage and color comparisons, and separate country samples. Keep event shares distinct from live pickup listings.";

export const metadata: Metadata = withCuratedMetadata("/which-iphone-duo-restocks-most", {
  title: { absolute: `${TITLE} · ShelfSpring` },
  description: DESCRIPTION,
  alternates: { canonical: "/which-iphone-duo-restocks-most" },
  openGraph: { type: "article", siteName: "ShelfSpring", title: TITLE, description: DESCRIPTION, url: "/which-iphone-duo-restocks-most" },
});

const APPLE_DUO = "https://www.apple.com/shop/buy-iphone/iphone-duo";
const PICKUP = "https://www.apple.com/shop/shipping-pickup";
/** The other countries whose mix we compare, in the order the site lists them. */
const ABROAD: CountryCode[] = ["ca", "uk", "au", "jp"];

const n = (x: number) => x.toLocaleString("en-US");
/** Whole-percent shares; a share under half a percent reads "<1%", never a misleading "0%". */
const pct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
const points = (x: number) => `${Math.round(x * 100)} points`;
const LONG = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" });
const longDate = (date: string) => LONG.format(new Date(`${date}T12:00:00Z`));
const ET = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

function storeLink(storeNumber: string): string {
  const s = storeByNumber(storeNumber);
  return s ? `[${appleName(s)}](${storePath(s)})` : storeNumber;
}
/** "[Apple Fifth Avenue](…), Nov 2, 9:31 AM local time" for a restock. */
function lastLine(at: string | null, storeNumber: string | null): string {
  if (!at || !storeNumber) return "no recorded return";
  const s = storeByNumber(storeNumber);
  return s ? `${storeLink(storeNumber)}, ${localStamp(at, s)} local time` : `${ET.format(new Date(at))} ET`;
}
/** A country's most-restocked configuration (storage, color), or null before its first confirmed restock. */
function topAbroad(t: RestockTimes): { name: string; storage: string; restocks: number } | null {
  const p = t.byPart.find((x) => x.restocks > 0);
  const i = p ? PART_INDEX.get(p.partNumber) : undefined;
  return p && i ? { name: `${i.storage} ${i.color}`, storage: i.storage, restocks: p.restocks } : null;
}

function Section({ id, h2, lead, facts, children }: { id: string; h2: string; lead: string; facts: Facts; children: ReactNode }) {
  return (
    <section id={id} className="guide-chapter">
      <h2 className="display text-2xl sm:text-3xl">{h2}</h2>
      <p className="mt-3 text-base text-ink-2 sm:text-lg"><Inline text={lead} facts={facts} /></p>
      {children}
    </section>
  );
}
/** Where to go next: a row of chip links. */
function LinkRow({ links, className = "mt-4" }: { links: { label: string; href: string }[]; className?: string }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {links.map((l) => l.href.startsWith("http") ? <a key={l.href} href={l.href} target="_blank" rel="noopener" className="chip chip-sm">{l.label}</a> : <Link key={l.href} href={l.href} className="chip chip-sm">{l.label}</Link>)}
    </div>
  );
}

export default async function WhichDuoRestocksMost() {
  const [t, facts, ...abroad] = await Promise.all([duoRestockTimes("us"), getFacts(), ...ABROAD.map((cc) => duoRestockTimes(cc))]);
  const duo = facts.models.duo;
  const have = t.n > 0 && !t.unknown;
  const since = longDate(t.since);
  const intlSince = longDate(TRACKING_SINCE_INTL);
  const items = catalogFor("duo");
  const storages = [...new Set(items.map((i) => i.storage))];
  const colors = [...new Set(items.map((i) => i.color))];
  const nowOf = (name: string): number | null => (duo && !duo.unknown ? duo.byConfig[name] ?? 0 : null);
  const nowText = (v: number | null) => (v == null ? "—" : n(v));

  // One row per configuration, most restocks first (byPart is zero-filled for all eight).
  const rows = t.byPart.flatMap((p) => {
    const item = items.find((i) => i.partNumber === p.partNumber) ?? PART_INDEX.get(p.partNumber);
    if (!item) return [];
    const name = `${item.storage} ${item.color}`;
    return [{ ...p, item, name, price: item.price, share: t.n ? p.restocks / t.n : 0, now: nowOf(name) }];
  });
  const most = rows[0];
  const fewest = rows.length ? rows[rows.length - 1] : undefined;
  const storageRows = storages.map((storage) => {
    const rs = rows.filter((r) => r.item.storage === storage);
    const restocks = rs.reduce((a, r) => a + r.restocks, 0);
    return { storage, restocks, share: t.n ? restocks / t.n : 0, price: rs[0]?.price ?? items.find((i) => i.storage === storage)?.price ?? 0, now: rs.reduce<number | null>((a, r) => (a == null || r.now == null ? null : a + r.now), 0) };
  });
  const colorRows = colors.map((color) => ({ color, restocks: rows.filter((r) => r.item.color === color).reduce((a, r) => a + r.restocks, 0) })).map((r) => ({ ...r, share: t.n ? r.restocks / t.n : 0 }));
  const storageSorted = [...storageRows].sort((a, b) => b.restocks - a.restocks);
  const colorSorted = [...colorRows].sort((a, b) => b.restocks - a.restocks);
  const storageGap = storageSorted.length ? storageSorted[0].share - storageSorted[storageSorted.length - 1].share : 0;
  const colorGap = colorSorted.length >= 2 ? colorSorted[0].share - colorSorted[colorSorted.length - 1].share : 0;
  const storageWins = storageGap >= colorGap;
  const biggest = storages[storages.length - 1];
  const big = storageRows.find((r) => r.storage === biggest);
  const bigRows = rows.filter((r) => r.item.storage === biggest);
  const bigLast = bigRows.filter((r) => r.lastAt).sort((a, b) => (b.lastAt! > a.lastAt! ? 1 : -1))[0];
  const abroadRows = ABROAD.map((cc, i) => ({ cc, name: COUNTRIES[cc].name, t: abroad[i], top: abroad[i].unknown ? null : topAbroad(abroad[i]) }));
  const abroadWithData = abroadRows.filter((r) => r.top);
  const todayLine = !t.unknown && t.today ? `${plural(t.today.restocks, "recorded return")} across ${plural(t.today.stores, "store")}` : "a current daily count is unavailable";
  const ratio = most && fewest && have && fewest.share > 0 ? Math.max(1, Math.round(most.share / fewest.share)) : null;
  const oneIn = big && big.share > 0 ? Math.max(1, Math.round(1 / big.share)) : null;

  const count = (value: number) => t.unknown ? "—" : n(value);
  const share = (value: number) => have ? pct(value) : "—";
  const leaders = have && most ? rows.filter((row) => row.restocks === most.restocks) : [];
  const rankTable: Block = { t: "table", head: ["Configuration", "US catalog price", "Recorded returns", "Share of US returns", "Latest recorded return", "Currently listing US stores"], rows: rows.map((r) => [r.name, fmtPrice(r.price), count(r.restocks), share(r.share), t.unknown ? "—" : lastLine(r.lastAt, r.lastStore), `{{duo.cfg:${r.name}}}`]), caption: `${items.length} configurations · ${STORES.length} US stores · history since ${since}`, source: `Imported inventory events and catalog prices before sales tax; verify the offer on [Apple](${APPLE_DUO})` };
  const storageTable: Block = { t: "table", head: ["Storage", "US catalog price", "Recorded returns", "Share of US returns", "Listed store–configuration pairs"], rows: storageRows.map((r) => [r.storage, fmtPrice(r.price), count(r.restocks), share(r.share), nowText(r.now)]), caption: "Storage groups combine their colors; a store listing two colors contributes two current pairs.", source: `US inventory history since ${since}; current counts use the latest stock snapshot` };
  const colorTable: Block = { t: "table", head: ["Color", "Recorded returns", "Share of US returns", "Distinct US stores listing this color"], rows: colorRows.map((r) => [r.color, count(r.restocks), share(r.share), `{{duo.color:${r.color}}}`]), caption: "Color groups combine storage sizes; current store totals count each store once within a color.", source: `US inventory history since ${since}; current counts use the latest stock snapshot` };
  const abroadTable: Block = { t: "table", head: ["Country", "First configuration by return count", "Its recorded returns", "Country return sample", "Stores represented"], rows: abroadRows.map((r) => [`[${r.name}](/${r.cc}/iphone-duo-restock-times)`, r.t.unknown ? "Unavailable" : r.top ? r.top.name : "No returns recorded", r.t.unknown ? "—" : r.top ? n(r.top.restocks) : "0", r.t.unknown ? "—" : n(r.t.n), r.t.unknown ? "—" : `${n(r.t.stores)} / ${r.t.storesTotal}`]), caption: `Four separate country samples · coverage begins ${intlSince} · country-specific stores and part numbers`, source: "Historical inventory observations; equal counts can share first place even when this summary shows one configuration" };

  const mostLead = have && most
    ? `${leaders.length > 1 ? `**${listWords(leaders.map((r) => r.name))}** share the highest recorded count` : `**${most.name}** has the highest recorded count`}: ${n(most.restocks)} returns ${leaders.length > 1 ? "each " : ""}within a US sample of ${n(t.n)} events since ${since}. The ordering describes this sample, not the next pickup opportunity.`
    : t.unknown ? "The US history could not be read. Catalog choices and any available current snapshot remain separate; missing history is not a record of zero returns."
    : "There are no recorded US returns in this history yet. The catalog can still help you compare choices, but it cannot establish a leading configuration.";
  const storageLead = have
    ? `Grouping the same ${n(t.n)} US events by storage and by color answers two different comparison questions. Read the counts first, then use the percentage-point spread to describe the distribution within each group.`
    : "Both tables reuse the same US event sample. Without recorded returns, no share or spread can be calculated; current listings are shown independently when available.";
  const bigLead = have && big
    ? `${biggest} accounts for ${n(big.restocks)} of ${n(t.n)} recorded US Duo returns (${pct(big.share)}) since ${since}. That share does not establish how frequently it will appear at a particular store.`
    : `Use the ${biggest} catalog price and current listings to decide whether this storage size belongs on your shortlist. A return-frequency claim needs an available historical sample.`;
  const watchLead = "Start with your storage needs and budget. Historical records can help compare acceptable alternatives; they cannot make an unsuitable configuration a good purchase.";
  const abroadLead = `${abroadWithData.length} of the ${ABROAD.length} country samples below currently contain readable configuration returns. Keep each country's coverage, sample size and latest listings together when planning a pickup there.`;
  const countLead = "The unit in these tables is a recorded return: a store and configuration changing back to available in the source feed. It is an event count, not a shipment count, an order count or a measure of demand.";

  const nav = [
    { id: "counting", label: "Define the evidence" },
    { id: "most", label: "Read the US ranking" },
    { id: "storage-or-color", label: "Compare grouped counts" },
    { id: "2tb", label: `Inspect ${biggest}` },
    { id: "countries", label: "Keep countries separate" },
    { id: "watch", label: "Build your shortlist" },
  ];

  const s0 = storages[0], s1 = storages[1] ?? storages[0];
  const priceGap = fmtPrice((items.find((i) => i.storage === s1)?.price ?? 0) - items[0].price);
  const faq: Faq[] = [
    { q: "Does the first row identify the easiest phone to buy?", a: "It identifies a configuration with the largest recorded return count in this US sample. The feed does not show demand, unit quantities or completed purchases, so that position cannot establish purchase odds. Equal counts may produce several leaders; check the full rows and Apple’s current pickup offer." },
    { q: "Should I change color because its share is higher?", a: have && colorSorted.length >= 2
      ? `The observed counts are ${n(colorSorted[0].restocks)} for ${colorSorted[0].color} (${pct(colorSorted[0].share)}) and ${n(colorSorted[1].restocks)} for ${colorSorted[1].color} (${pct(colorSorted[1].share)}) in the US history since ${since}. These totals combine storage sizes and stores. Add another color only if you would want to own it; a national share is not a local availability forecast.`
      : "No color preference can be inferred from an unavailable or empty return sample. Choose colors you would be happy to own, and consult current stock for each exact configuration." },
    { q: `How should I compare ${s0} with ${s1}?`, a: `${s1} has a catalog price ${priceGap} above ${s0} in the US. Decide whether the extra storage fits your needs and budget, then compare the recorded counts and current listings in the storage table. The historical ranking does not explain Apple’s production or allocation decisions.` },
    { q: "Why do storage and color tables use different current-count labels?", a: "The storage table adds the currently listed store–configuration pairs for its colors. A store listing both colors therefore appears twice in that sum. The color table instead reports distinct stores with any listed storage size in that color. These are different counting units and should not be compared as equal totals." },
    { q: "How many saved alerts would my alternatives use?", a: `Each store and exact configuration uses one alert slot. Three configurations at three stores use nine slots. Current plan capacities are ${PLANS.plus.limit} for ${PLANS.plus.name}, ${PLANS.pro.limit} for ${PLANS.pro.name} and ${PLANS.max.limit} for ${PLANS.max.name}; all use the same feed. [Review the watchlist guide](/iphone-duo-stock-alerts) before choosing capacity.` },
    { q: "Where can I inspect individual observations?", a: `Open [the US event journal](/restocks) for store, configuration and observation times. For its latest US daily bucket, ${todayLine}. A journal entry describes a past change, so use the [stock board](/stock/iphone-duo) and Apple’s checkout to check what is available now.` },
  ];
  const sources: Source[] = [
    { label: "Apple’s iPhone Duo configuration and purchase options", url: APPLE_DUO },
    { label: "Apple’s delivery and collection guidance", url: PICKUP },
  ];

  const site = "https://shelfspring.com";
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${site}/which-iphone-duo-restocks-most`, url: `${site}/which-iphone-duo-restocks-most`, name: TITLE, description: DESCRIPTION, isPartOf: { "@id": `${site}/#website` }, about: { "@id": `${site}/#organization` }, dateModified: t.at },
      {
        "@type": "Dataset", "@id": `${site}/which-iphone-duo-restocks-most#dataset`, name: "Observed US iPhone Duo returns grouped by configuration",
        description: `Store–configuration return events from imported US inventory history beginning ${longDate(TRACKING_SINCE_US)}. Counts and shares describe recorded availability transitions at ${STORES.length} catalog stores, not units or purchase outcomes. Current listings are a separate snapshot.`,
        url: `${site}/which-iphone-duo-restocks-most`, publisher: { "@id": `${site}/#organization` }, isAccessibleForFree: true,
        temporalCoverage: `${TRACKING_SINCE_US}/..`, spatialCoverage: "United States Apple Store inventory observations",
        variableMeasured: ["Configuration", "Recorded return count", "Share of recorded US returns", "Latest observed return time", "Current listing snapshot"],
        ...(have ? { size: `${t.n} recorded US return events across ${rows.length} configurations` } : {}),
      },
    ],
  };

  return (
    <GuideLayout guide="which-iphone-duo-restocks-most" contents={nav}>
      <JsonLd data={ld} />
      <section className="guide-evidence-lead">
        <div>
          <div className="eyebrow mb-4">Configuration evidence · United States</div>
          <p className="mt-5 max-w-xl text-lg text-ink-2">A useful shortlist starts with what you need from the phone. This record adds context: which combinations appeared in the observed history, how the counts split across storage and color, and which choices the latest snapshot lists. Keep those questions separate when deciding where to be flexible.</p>
          <p className="mt-3 text-sm text-ink-3">History snapshot: <time dateTime={t.at}>{ET.format(new Date(t.at))} ET</time>. Current stock snapshot: <time dateTime={facts.at}>{ET.format(new Date(facts.at))} ET</time>.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/stock/iphone-duo" className="btn btn-primary btn-lg">Check the configuration board</Link>
            <Link href="/#notify" className="btn btn-ghost btn-lg">Save acceptable choices</Link>
          </div>
        </div>
        <StatGrid cols={2}>
          <Stat value={count(t.n)} label={`recorded US return events since ${since}`} tone="accent" />
          <Stat value={items.length} label={`${storages.length} storage sizes × ${colors.length} colors in the US catalog`} />
        </StatGrid>
      </section>

      <div className="mt-6 grid gap-5">
        <Section id="counting" h2="Begin with the counting unit" lead={countLead} facts={facts}>
          <Points className="mt-5" size="base" items={[
            { text: <>The source rechecks a changed availability response about a second later and records the transition when both responses agree.</> },
            { text: <>The first observation of a store–configuration pair establishes a starting state. It is excluded from the return totals.</> },
            { text: <>These US tables use recorded source history from {since}. The country comparison below starts from {intlSince}. Imported dates describe dataset coverage, not the age of ShelfSpring.</> },
            { text: <>Repeated returns for the same pair count as separate events. The availability response does not reveal how many phones were behind any one listing.</> },
          ]} />
          <Measured title="Read the denominator before the percentage">
            A configuration’s share divides its return count by the {t.unknown ? "unavailable" : n(t.n)} recorded US events in this sample. No percentage is shown when that history is unavailable or contains no returns. Separately labelled third-party reports are excluded from these source-event totals.
          </Measured>
          <LinkRow links={[{ label: "Follow the inventory method", href: "/how-it-works" }, { label: "Inspect the US event journal", href: "/restocks" }]} />
        </Section>

        <Section id="most" h2="Read a ranking without turning it into a forecast" lead={mostLead} facts={facts}>
          <BlockView b={rankTable} facts={facts} />
          <p className="mt-4 text-ink-2">The price column belongs to the US catalog. The event columns describe history since {since}; the final column is a separate current-state snapshot. A configuration can rank highly in past returns and have no stores listing it in the current snapshot.</p>
          {!t.unknown && t.sellout ? (
            <Measured title="A different sample measures completed windows">
              The duration summary contains {n(t.sellout.n)} completed observed US Duo listings since {since}, with a median listed-to-gone interval of {n(t.sellout.medianSec)} seconds. Open listings are not in that duration sample. The interval ends at the next absent observation, so it is an observation bound, not time left to order after a notification.
            </Measured>
          ) : (
            <p className="pane-2 mt-4 p-4 text-sm text-ink-3">No usable completed-duration summary is available. This table does not supply a typical lifetime for a listing; missing duration data cannot support a claim that most listings disappear within minutes.</p>
          )}
        </Section>

        <Section id="storage-or-color" h2="Compare the distributions within each group" lead={storageLead} facts={facts}>
          <StatGrid cols={2} className="mt-5">
            <Stat value={have ? points(storageGap) : "—"} label="percentage-point spread between highest and lowest US storage shares" tone={have && storageWins ? "accent" : "plain"} />
            <Stat value={have ? points(colorGap) : "—"} label="percentage-point spread between highest and lowest US color shares" tone={have && !storageWins ? "accent" : "plain"} />
          </StatGrid>
          <BlockView b={storageTable} facts={facts} />
          <BlockView b={colorTable} facts={facts} />
          <p className="mt-4 text-ink-2">{have ? storageGap === colorGap ? "The two groupings have equal spreads in this sample." : `${storageWins ? "Storage groups" : "Color groups"} have the wider observed spread in this sample.` : "There is no measured spread to compare yet."} Storage and color have different numbers of categories, and both aggregate many stores. A wider spread does not establish which choice will matter more for your next local pickup.</p>
          <p className="mt-3 text-ink-2">The storage table’s current column counts listed pairs, so a store with two colors can contribute twice. The color table uses distinct stores instead. Read the unit with each count; neither table measures notification delivery.</p>
        </Section>

        <Section id="2tb" h2={`Evaluate ${biggest} on its own terms`} lead={bigLead} facts={facts}>
          <StatGrid cols={4} className="mt-5">
            <Stat value={big ? count(big.restocks) : "—"} label={<>{biggest} recorded US returns{big && have ? <> · {pct(big.share)} of this sample</> : null}</>} tone="accent" />
            <Stat value={<Inline text={`{{duo.storage:${biggest}}}`} facts={facts} />} label={<>distinct US stores currently listing any {biggest} color</>} live={!!duo && !duo.unknown} />
            {bigRows.length === 2
              ? <Stat value={<>{count(bigRows[0].restocks)}<span className="text-base text-ink-3"> / </span>{count(bigRows[1].restocks)}</>} label={<>US returns: {bigRows[0].item.color} / {bigRows[1].item.color}</>} tone="muted" />
              : <Stat value="—" label="color breakdown unavailable" tone="muted" />}
            <Stat value={fmtPrice(items[items.length - 1].price)} label={<>US catalog · {fmtPrice(items[items.length - 1].price - items[0].price)} above {storages[0]}</>} />
          </StatGrid>
          <p className="mt-5 text-ink-2"><Inline text={`Latest recorded ${biggest} return: ${t.unknown ? "history unavailable" : bigLast ? `${bigLast.name} at ${lastLine(bigLast.lastAt, bigLast.lastStore)}` : "none in this history"}.`} facts={facts} /></p>
          {have && oneIn && big ? <p className="mt-3 text-ink-2">Its {pct(big.share)} share is approximately one in {oneIn} recorded US returns in this sample. That is a way to express the distribution, not an estimate of how many days a store will take to receive it.</p> : <p className="mt-3 text-ink-2">There is no positive event share to express as a frequency here. Check current listings without assuming that this size is rare or unavailable everywhere.</p>}
          <LinkRow links={[{ label: `Review current ${biggest} choices`, href: "/stock/iphone-duo" }, { label: "Find a practical collection area", href: "/iphone-duo-near-me" }]} />
        </Section>

        <Section id="countries" h2="Read each country as its own sample" lead={abroadLead} facts={facts}>
          <BlockView b={abroadTable} facts={facts} />
          <p className="mt-4 text-ink-2">These country rows show one highest-count configuration per sample; tied configurations can share that count. A country with fewer stores or a smaller event sample is not directly comparable by raw totals to the United States.</p>
          <Measured title="Coverage is not a confidence score">
            International history begins on {intlSince}. The sample sizes remain visible as records accumulate. This ranking has no statistical-confidence threshold and cannot establish a stable national preference, a supply allocation policy or a future restocking schedule.
          </Measured>
          <LinkRow links={ABROAD.map((cc) => ({ label: `Inspect ${COUNTRIES[cc].name} history`, href: `/${cc}/iphone-duo-restock-times` }))} />
        </Section>

        <Section id="watch" h2="Turn your preferences into a shortlist" lead={watchLead} facts={facts}>
          <StepStrip className="mt-5" steps={[
            { title: "Set a storage floor", hint: "Name the capacity you need and the maximum price you would accept before considering the ranking." },
            { title: "Choose colors you want", hint: "Only include a color if you would be satisfied keeping the phone in that finish." },
            { title: "Pair choices with reachable stores", hint: "Your travel options and Apple’s collection choices determine which matches would be useful." },
            { title: "Check the rule count", hint: `For example, three configurations at three stores use nine alerts. Compare that count with your plan’s capacity of ${PLANS.plus.limit}, ${PLANS.pro.limit} or ${PLANS.max.limit}.` },
          ]} />
          <StatGrid cols={3} className="mt-6">
            <Stat value={ratio ? `≈${ratio}×` : "—"} label={ratio && most && fewest ? <>recorded-count ratio: {most.name} ({pct(most.share)}) / {fewest.name} ({pct(fewest.share)}) · rounded</> : "no ratio shown without positive counts at both ends"} tone="accent" />
            <Stat value="1 pair" label="one exact configuration at one store uses one alert slot" />
            <Stat value="Shared feed" label="plan capacity changes saved rules, not the inventory evidence" />
          </StatGrid>
          <p className="mt-4 text-ink-2">The ratio compares national historical counts. It does not promise a proportional number of alerts: your selected stores, saved rules, future events and delivery conditions all affect the messages you receive.</p>
          <LinkRow links={[{ label: "Plan the notification setup", href: "/iphone-duo-stock-alerts" }, { label: "Compare plan capacity", href: "/pricing" }]} />
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link href="/#notify" className="btn btn-primary">Save my configuration shortlist</Link>
            <span className="text-sm text-ink-3">{PLANS.plus.name}: ${PLANS.plus.priceUsd}/month · {PLANS.plus.limit} alert slots.</span>
          </div>
        </Section>
      </div>

      <div className="mx-auto mt-10 max-w-3xl"><RichFaq items={faq} facts={facts} title="Questions about the configuration record" /></div>
      <div className="mx-auto mt-8 max-w-3xl"><SourceList sources={sources} facts={facts} where={`${STORES.length} US Apple Stores; the four country comparison rows use their own catalogs`} since={`${since} for US history and ${intlSince} for the international comparison`} /></div>
    </GuideLayout>
  );
}
