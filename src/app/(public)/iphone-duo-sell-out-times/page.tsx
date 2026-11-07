import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GuideLayout } from "@/components/guides/GuideLayout";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { RichFaq, SourceList } from "@/components/content/RichFaq";
import { JsonLd } from "@/components/seo/JsonLd";
import { SellOutTimes } from "@/components/restocks/SellOutTimes";
import { Stat, StatGrid } from "@/components/ui/Viz";
import { getFacts } from "@/lib/content/facts";
import type { Faq } from "@/lib/content/types";
import { STORES, catalogFor, statePath, storeByNumber, storeTimeZone, type CatalogItem } from "@/lib/apple/catalog";
import { COUNTRIES, type CountryCode } from "@/lib/apple/countries";
import { TRACKING_SINCE_INTL, TRACKING_SINCE_US, WEEKDAY_MIN_SPAN, localHourDay, siteFacts } from "@/lib/content/siteFacts";
import { duoRestockTimes } from "@/lib/content/restockTimes";
import { ROUND_SEC, sellouts, summarize, type SelloutRow, type SelloutSummary } from "@/lib/stock/sellouts";
import { withCuratedMetadata } from "@/lib/seo/curation";

export const revalidate = 3600;
const PATH = "/iphone-duo-sell-out-times";
const TITLE = "iPhone Duo Timing Lab: Listing Windows and Their Limits";
const DESCRIPTION = "Inspect measured iPhone Duo pickup windows. Compare sample sizes, configurations and locations, then see why a past duration is not time left to buy.";
const APPLE_PICKUP = "https://www.apple.com/shop/shipping-pickup";
export const metadata: Metadata = withCuratedMetadata(PATH, {
  title: { absolute: `${TITLE} · ShelfSpring` }, description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { type: "article", siteName: "ShelfSpring", title: TITLE, description: DESCRIPTION, url: PATH },
});
const n = (x: number) => x.toLocaleString("en-US");
const pct = (x: number) => x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`;
const secs = (s: number | null) => s == null ? "—" : s < 120 ? `${s} s` : `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")} s`;
const longDate = (day: string) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", dateStyle: "long" }).format(new Date(`${day}T12:00:00Z`));
const cfgName = (item: CatalogItem) => `${item.storage} ${item.color}`;
const SOLID = 10;
const ABROAD: CountryCode[] = ["ca", "uk", "au", "jp", "de", "fr"];

/** Pure: the sold-out rows grouped by a key, each group summarised, most rows first. Restocks still listed are left out. */
function grouped<K extends string>(rows: SelloutRow[], days: number, keyOf: (r: SelloutRow) => K | undefined): { key: K; s: SelloutSummary }[] {
  const by = new Map<K, number[]>();
  for (const r of rows) {
    if (r.highSec == null) continue;
    const k = keyOf(r);
    if (!k) continue;
    by.set(k, [...(by.get(k) ?? []), r.highSec]);
  }
  return [...by.entries()].map(([key, v]) => ({ key, s: summarize(v, days) })).sort((a, b) => b.s.n - a.s.n);
}

/** Pure: weekday against weekend sell-outs (each store's own local day) and the span of days the rows cover. */
function weekendSplit(rows: SelloutRow[], days: number): { weekday: SelloutSummary; weekend: SelloutSummary; spanDays: number } {
  const wk: number[] = [], we: number[] = [], dates = new Set<string>();
  for (const r of rows) {
    if (r.highSec == null) continue;
    const store = storeByNumber(r.storeNumber);
    const { weekday, date } = localHourDay(new Date(r.at).toISOString(), store ? storeTimeZone(store) : "America/New_York");
    dates.add(date);
    (weekday === 0 || weekday === 6 ? we : wk).push(r.highSec);
  }
  const sorted = [...dates].sort();
  const spanDays = sorted.length ? Math.round((Date.parse(sorted[sorted.length - 1]) - Date.parse(sorted[0])) / 86400_000) + 1 : 0;
  return { weekday: summarize(wk, days), weekend: summarize(we, days), spanDays };
}

function LifeTable({ caption, head, rows }: { caption: string; head: string; rows: { label: ReactNode; s: SelloutSummary }[] }) {
  return (
    <div className="my-4 overflow-x-auto">
      <table className="w-full min-w-[30rem] border-collapse text-sm">
        <caption className="mb-2 text-start text-xs text-ink-3">{caption}</caption>
        <thead>
          <tr className="border-b border-line-2 text-start text-ink">
            <th scope="col" className="py-2 pe-3 font-semibold">{head}</th>
            <th scope="col" className="py-2 pe-3 font-semibold">Completed rows</th>
            <th scope="col" className="py-2 pe-3 font-semibold">Median upper bound</th>
            <th scope="col" className="py-2 pe-3 font-semibold">≤ 30 s</th>
            <th scope="col" className="py-2 pe-3 font-semibold">≤ 1 min</th>
            <th scope="col" className="py-2 pe-3 font-semibold">Smallest upper bound</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line">
              <th scope="row" className="py-2 pe-3 text-start font-medium text-ink">{r.label}</th>
              <td className="py-2 pe-3 tabular-nums">{r.s.n}{r.s.n > 0 && r.s.n < SOLID ? <span className="text-ink-3"> · thin</span> : null}</td>
              <td className="py-2 pe-3 tabular-nums">{secs(r.s.medianSec)}</td>
              <td className="py-2 pe-3 tabular-nums">{r.s.n ? pct(r.s.within30) : "–"}</td>
              <td className="py-2 pe-3 tabular-nums">{r.s.n ? pct(r.s.within60) : "–"}</td>
              <td className="py-2 pe-3 tabular-nums">{secs(r.s.fastestSec)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


const contents = [
  { id: "measurement", label: "Establish the measurement" },
  { id: "ledger", label: "Inspect individual intervals" },
  { id: "choices", label: "Compare acceptable configurations" },
  { id: "place", label: "Check geographic coverage" },
  { id: "sampling", label: "Try the sampling model" },
  { id: "decision", label: "Use the result responsibly" },
];

export default async function SellOutTimesPage() {
  const [us, all, rt, f, facts, abroad] = await Promise.all([
    sellouts({ country: "us", model: "duo", limit: 1000 }),
    sellouts({ country: "us" }), duoRestockTimes("us"), siteFacts(), getFacts(),
    Promise.all(ABROAD.map((cc) => sellouts({ country: cc, model: "duo" }))),
  ]);
  const s = us.summary;
  const days = s.days;
  const have = s.n > 0 && s.medianSec != null;
  const byPart = new Map(grouped(us.recent, days, (row) => row.partNumber).map((group) => [group.key, group.s]));
  const configs = catalogFor("duo").map((item) => ({ item, s: byPart.get(item.partNumber) ?? summarize([], days) }));
  const eligible = configs.filter((row) => row.s.n >= SOLID && row.s.medianSec != null);
  const regions = grouped(us.recent, days, (row) => storeByNumber(row.storeNumber)?.state).slice(0, 8);
  const wk = weekendSplit(us.recent, days);
  const weekendKnown = wk.spanDays >= WEEKDAY_MIN_SPAN && wk.weekday.n >= SOLID && wk.weekend.n >= SOLID && wk.weekday.medianSec != null && wk.weekend.medianSec != null;
  const countries = ABROAD.map((cc, index) => ({ cc, s: abroad[index].summary })).sort((a, b) => b.s.n - a.s.n);
  const ds = f.duoSellout;
  const historical = !rt.unknown ? rt.sellout : null;
  const faq: Faq[] = [
    { q: "Can I use the median as a checkout deadline?", a: "No. The clock starts at the first recorded available observation, before you may have seen the listing. A median summarizes completed intervals; it cannot say how much time remains on another listing or reserve that inventory." },
    { q: "Why is a state or configuration count smaller than the headline sample?", a: "The headline uses all completed intervals returned by the summary query. The detailed configuration, state and weekday comparisons use the most recent 1,000 listing rows, excluding rows that remain open. Their sample can therefore be smaller." },
    { q: "Do ten completed rows make a reliable prediction?", a: "Ten is a display threshold for flagging sparse groups, not a confidence guarantee. The rows may cluster on a few dates or stores, and observation gaps affect their precision. More data can change a median substantially." },
    { q: "Does an interval explain why the phone disappeared?", a: "It measures a public listing changing from available to unavailable. The feed does not identify a buyer, count units or reveal Apple’s allocation decisions, so the duration alone cannot establish the cause." },
    { q: "Does the sampling chart compare notification services?", a: "No. It applies a mathematical interval model to recorded durations. It does not include real network conditions, repeated checks, source errors or notification delivery, and it does not measure whether a person completed a purchase." },
  ];
  const site = "https://shelfspring.com";
  const ld = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebPage", "@id": `${site}${PATH}`, url: `${site}${PATH}`, name: TITLE, description: DESCRIPTION, dateModified: facts.at, isPartOf: { "@id": `${site}/#website` } },
    { "@type": "Dataset", "@id": `${site}${PATH}#dataset`, name: "Observed iPhone Duo pickup listing intervals", description: "Completed observation intervals and their upper-bound summaries. Configuration and state breakdowns use a capped recent-row sample; national summaries use the reporting window. Imported history retains source timestamps.", url: `${site}${PATH}`, publisher: { "@id": `${site}/#organization` }, isAccessibleForFree: true, spatialCoverage: "United States, with separate comparisons for Canada, United Kingdom, Australia, Japan, Germany and France", variableMeasured: ["Store and configuration", "First available observation", "Last available observation where recorded", "First unavailable observation", "Duration bounds in seconds"], measurementTechnique: "Pair a confirmed return with its subsequent unavailable observation. Preserve the last-available bound when present; exclude initial sightings and still-open intervals from completed-duration summaries." },
  ] };

  return <GuideLayout guide="iphone-duo-sell-out-times" contents={contents}>
    <JsonLd data={ld} />
    <div className="guide-chapters prose-site">
      <section id="measurement" className="guide-chapter">
        <h2>Measure the listing, not the buyer.</h2>
        <p>This notebook follows a configuration at a store from its first recorded return to the next unavailable observation. The result describes visibility in the source feed. It cannot time a customer’s checkout or show when the physical phones arrived.</p>
        <StatGrid cols={3} className="my-5">
          <Stat value={have ? secs(s.medianSec) : "—"} label="median of completed interval upper bounds" />
          <Stat value={have ? pct(s.within30) : "—"} label="completed intervals with an upper bound of 30 seconds or less" />
          <Stat value={have ? n(s.n) : "—"} label={`completed US Duo intervals in the ${days}-day reporting window`} />
        </StatGrid>
        {!have && <p role="status">No usable completed-duration sample is available in this read. No listing lifetime or checkout-time estimate can be inferred from an empty result.</p>}
        <p>Read a range such as 45–60 seconds as two observations: still available at the lower bound and unavailable by the upper bound, measured from the first recorded return. The summary uses upper bounds consistently. A single displayed value is still limited by source observation precision.</p>
        <p>Rows marked approximately use the historical {ROUND_SEC}-second fallback bound because a last-available timestamp was not recorded. Initial sightings do not establish a return, and open intervals have not yet supplied a completed duration. Both are excluded from the completed sample.</p>
      </section>
      <section id="ledger" className="guide-chapter">
        <h2>Inspect a few intervals before trusting a summary.</h2>
        <p>The ledger keeps store, configuration and timing together. A row that remains listed has an open clock; it does not prove the listing will remain available when you open Apple. The clock is based on the recorded feed, which can arrive after collection and synchronization delay.</p>
        <div className="my-5"><SellOutTimes data={us} label="in the US observation record" showStore limit={12} /></div>
        {historical && <div className="field-callout my-5"><h3 className="font-semibold">A separate, longer-window comparison</h3><p>Across {n(historical.n)} completed intervals in the historical Duo record from {longDate(rt.since)}, {pct(historical.within2min)} have upper bounds within two minutes and {pct(historical.within20min)} within twenty minutes. This is a different denominator from the {days}-day headline sample.</p></div>}
        {(all.byModel["18-pro"] || all.byModel["18-pro-max"]) && <LifeTable head="Model" caption={`Other US models, the same ${days}-day reporting window; each has its own completed-row sample.`} rows={[
          ...(all.byModel["18-pro"] ? [{ label: "iPhone 18 Pro", s: all.byModel["18-pro"]! }] : []),
          ...(all.byModel["18-pro-max"] ? [{ label: "iPhone 18 Pro Max", s: all.byModel["18-pro-max"]! }] : []),
        ]} />}
      </section>
      <section id="choices" className="guide-chapter">
        <h2>Use your acceptable configurations as the comparison set.</h2>
        <p>Read the completed-row count before comparing medians. {eligible.length} of {configs.length} configurations in the detailed sample reach the {SOLID}-row display threshold. A lower count is marked thin; it is still shown so that a missing comparison is not mistaken for a zero-second listing.</p>
        <LifeTable head="Capacity and color" caption={`US Duo breakdown from at most 1,000 recent listing rows within ${days} days. Open intervals are omitted; thin means fewer than ${SOLID} completed rows.`} rows={configs.map((row) => ({ label: cfgName(row.item), s: row.s }))} />
        <p>A longer median may be interesting if you already want that configuration. It is not evidence that the next listing will last longer, and it should not override your storage needs or budget. Return frequency is a separate measure in the <Link href="/which-iphone-duo-restocks-most">configuration notebook</Link>.</p>
      </section>
      <section id="place" className="guide-chapter">
        <h2>Check whose observations a location comparison includes.</h2>
        <p>A state with more rows has more representation in this sample, not necessarily better access to stock. Its stores, configurations and observation gaps may differ from another state’s. Use the links to inspect a location rather than converting a national ranking into travel advice.</p>
        {regions.length ? <LifeTable head="State" caption={`Up to eight states with the most completed rows in the capped US sample; ${days}-day window.`} rows={regions.map((row) => ({ label: <Link href={statePath(row.key)}>{row.key}</Link>, s: row.s }))} /> : <p>No state breakdown is available in the completed-row sample.</p>}
        <LifeTable head="Country" caption={`Separate national summaries requested for the last ${days} days. Available source history can cover less than that window.`} rows={[{ label: "United States", s }, ...countries.map((row) => ({ label: <Link href={`/${row.cc}`}>{COUNTRIES[row.cc].name}</Link>, s: row.s }))]} />
        <p>The imported US record begins on {longDate(TRACKING_SINCE_US)}; the selected international records begin on {longDate(TRACKING_SINCE_INTL)}. Those are dataset boundaries, not ShelfSpring operating dates. Different coverage periods and sparse groups limit direct country comparisons.</p>
        <div className="field-callout my-5"><h3 className="font-semibold">A weekday check with a stopping rule</h3>{weekendKnown ? <p>Within the detailed sample, weekday intervals have a median upper bound of {secs(wk.weekday.medianSec)} across {n(wk.weekday.n)} completed rows; weekend intervals have {secs(wk.weekend.medianSec)} across {n(wk.weekend.n)}. The observations span {wk.spanDays} local dates from first to last. These are descriptions, not a finding that one day is easier.</p> : <p>The weekday comparison is withheld until the observations span at least {WEEKDAY_MIN_SPAN} days and both groups have {SOLID} completed rows. This sample spans {wk.spanDays} days, with {n(wk.weekday.n)} weekday and {n(wk.weekend.n)} weekend rows.</p>}</div>
      </section>
      <section id="sampling" className="guide-chapter">
        <h2>A timing experiment, with its assumptions visible.</h2>
        <p>Imagine checking at a fixed interval while a listing’s start is uniformly positioned between checks. A duration of d seconds and an interval of T seconds give a modeled chance of observation of min(1, d ÷ T). The values below average that model over the separate seven-day sample across all tracked countries; they are not measured delivery rates.</p>
        {ds ? <StatGrid cols={4} className="my-5"><Stat value={pct(ds.caught.m1)} label="modeled observation share with a 1-minute interval" /><Stat value={pct(ds.caught.m5)} label="modeled share with a 5-minute interval" /><Stat value={pct(ds.caught.m15)} label="modeled share with a 15-minute interval" /><Stat value={n(ds.n)} label="completed intervals across all tracked countries in this seven-day model" /></StatGrid> : <p>No sampling estimate is available: the seven-day source summary has not supplied the required completed-duration sample.</p>}
        <p>Real collection does not follow every assumption of that experiment. A listing can fall entirely between source checks and leave no recorded interval. This selection effect means the observed distribution cannot establish the distribution of every listing, including missed ones.</p>
      </section>
      <section id="decision" className="guide-chapter">
        <h2>Take preparation from the chart, not a countdown.</h2>
        <p>Decide on acceptable configurations and reachable stores before you need to evaluate a match. When one appears, inspect the current Apple offer. Neither a short median nor a long interval tells you whether that particular order will succeed.</p>
        <p>A notification adds another timing stage after the original observation. All ShelfSpring plans share the inventory feed; a higher rule limit does not buy a faster source. Use your account to confirm enabled matches and delivery settings.</p>
        <div className="my-5 flex flex-wrap gap-3"><Link href="/how-to-get-an-iphone-duo" className="btn btn-primary">Build a practical pickup plan</Link><Link href="/apple-store-pickup-availability-explained" className="btn btn-ghost">Read the availability signals</Link></div>
      </section>
    </div>
    <div className="mt-10"><RichFaq items={faq} facts={facts} title="What the timing cannot answer" /></div>
    <div className="mt-8"><SourceList facts={facts} where={`the ${STORES.length}-store US catalog, with six separately labelled country samples`} since={longDate(TRACKING_SINCE_US)} sources={[{ label: "Apple: Delivery and Pickup", url: APPLE_PICKUP }]} /></div>
  </GuideLayout>;
}
