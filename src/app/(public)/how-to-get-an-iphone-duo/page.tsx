import type { Metadata } from "next";
import { GuideLayout } from "@/components/guides/GuideLayout";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { BlockView } from "@/components/content/Blocks";
import { RichFaq, SourceList } from "@/components/content/RichFaq";
import { JsonLd } from "@/components/seo/JsonLd";
import { Stat, StatGrid, StepStrip } from "@/components/ui/Viz";
import { getFacts } from "@/lib/content/facts";
import type { Block, Faq } from "@/lib/content/types";
import { PART_INDEX, STORES, appleName, catalogFor, storeByNumber, storeLocality, storePath } from "@/lib/apple/catalog";
import { PLANS } from "@/lib/plans";
import { hourLabel, localStamp, siteFacts } from "@/lib/content/siteFacts";
import { duoRestockTimes } from "@/lib/content/restockTimes";
import { recentByConfig } from "@/lib/stock/recent";
import { fmtPrice } from "@/lib/seo/enrich";
import { withCuratedMetadata } from "@/lib/seo/curation";

export const revalidate = 3600;
const PATH = "/how-to-get-an-iphone-duo";
const TITLE = "Your iPhone Duo Pickup Plan: Budget, Radius, Next Step";
const DESCRIPTION = "Build a practical iPhone Duo shortlist from prices and recorded returns. Set a travel boundary, interpret the sample and verify the order with Apple.";
const PICKUP = "https://www.apple.com/shop/shipping-pickup";
const PICKUP_HELP = "https://www.apple.com/shop/help/shipping_delivery";
export const metadata: Metadata = withCuratedMetadata(PATH, {
  title: { absolute: `${TITLE} · ShelfSpring` }, description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { type: "article", siteName: "ShelfSpring", title: TITLE, description: DESCRIPTION, url: PATH },
});
const n = (x: number) => x.toLocaleString("en-US");
const pct = (x: number) => x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`;
const longDate = (day: string) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", dateStyle: "long" }).format(new Date(`${day}T12:00:00Z`));
const sections = [
  { id: "budget", label: "Write your acceptable choices" },
  { id: "radius", label: "Set a travel boundary" },
  { id: "record", label: "Read the recent record" },
  { id: "route", label: "Choose a buying route" },
  { id: "response", label: "Turn the shortlist into a routine" },
];

export default async function HowToGetDuo() {
  // Keep the same inventory reads; the notebook changes how their evidence is presented.
  const [t, f, facts, recent] = await Promise.all([duoRestockTimes("us"), siteFacts(), getFacts(), recentByConfig({ country: "us" })]);
  const have = !t.unknown && t.n > 0;
  const since = longDate(t.since);
  const items = catalogFor("duo");
  const storages = [...new Set(items.map((item) => item.storage))];
  const storageTable: Block = {
    t: "table", head: ["Capacity", "US catalog price", "Recorded returns", "Share of this sample"],
    rows: storages.map((storage) => {
      const count = t.byPart.filter((row) => PART_INDEX.get(row.partNumber)?.storage === storage).reduce((sum, row) => sum + row.restocks, 0);
      return [storage, fmtPrice(items.find((item) => item.storage === storage)!.price), t.unknown ? "—" : n(count), have ? pct(count / t.n) : "—"];
    }),
    caption: `US iPhone Duo capacities; return counts cover the imported historical record from ${since}. Prices exclude applicable tax.`,
  };
  const storesTable: Block = {
    t: "table", head: ["Store", "Returns", "Distinct local dates", "Latest recorded return"],
    rows: t.topStores.slice(0, 5).map((row) => {
      const store = storeByNumber(row.storeNumber);
      return [store ? `[${appleName(store)}](${storePath(store)}) · ${storeLocality(store)}` : row.storeNumber, n(row.restocks), n(row.days), store ? `${localStamp(row.lastAt, store)} local` : row.lastAt];
    }),
    caption: `Five stores with the largest recorded iPhone Duo return counts from ${since}; this is a national reference, not a distance ranking.`,
  };
  const dailyTable: Block = {
    t: "table", head: ["Local date", "Returns", "Stores represented", "Most populated hour"],
    rows: [...t.daily].slice(-7).reverse().map((day) => [longDate(day.date), n(day.restocks), n(day.stores), day.peakHour == null ? "—" : hourLabel(day.peakHour)]),
    caption: "Latest seven dates in the US record, newest first. Each event uses its store’s time zone; the current date is incomplete.",
  };
  const routes: Block = {
    t: "table", head: ["Your constraint", "A useful next check", "What this site cannot establish"], rows: [
      ["I can collect from a nearby store", "Compare your exact storage and color on the live board, then open Apple’s pickup checkout", "Whether Apple will accept the order when you submit it"],
      ["I need a delivery estimate", "Enter your address on the seller’s checkout and inspect its current estimate", "The delivery queue or a guaranteed arrival date"],
      ["I am considering another retailer", "Compare that seller’s device, activation and return terms", "Its available units or whether its terms suit you"],
    ], caption: "Choose the route from your deadline and constraints, not from a pickup-history ranking.",
  };
  const faq: Faq[] = [
    { q: "Should I buy a larger capacity because it has more returns?", a: "Only if you would choose that capacity at its actual price. The return share counts availability changes, not units offered, demand or your chance of completing an order. Keep a firm budget before adding alternatives." },
    { q: "Does a store with more recorded returns deserve a longer drive?", a: "The ranking does not account for your journey or future stock. First exclude stores you cannot collect from comfortably; then use their individual records to understand the remaining choices. Wait for Apple’s collection instructions before travelling." },
    { q: "Can I pick a reliable hour from the daily table?", a: "The hour column identifies the largest group of past observations on that date. It does not announce the next delivery. A partial day, an observation gap or a small sample can change that result, so do not arrange a trip around it." },
    { q: "How many saved rules does my shortlist use?", a: "Count each store and exact configuration pairing. Three stores with two acceptable configurations use six rules. Your account shows which saved rules are enabled within your current plan; saving a rule alone does not create an entitlement." },
    { q: "What if a notification leads to an unavailable listing?", a: "Check the store and configuration first. The listing may have changed during collection, synchronization or delivery of the alert. Return to your acceptable alternatives rather than treating the message as a reservation." },
  ];
  const steps = [
    { title: "Save the boundaries", hint: "List the configurations you would buy and the stores you can collect from." },
    { title: "Check your setup", hint: "Review enabled rules in your account and confirm the notification channel you intend to use." },
    { title: "Verify a matching listing", hint: "On Apple, recheck storage, color, store and the order total before submitting." },
    { title: "Keep the confirmation", hint: "Follow Apple’s order status and ready-for-pickup instructions, including its stated collection window." },
  ];
  const site = "https://shelfspring.com";
  const ld = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebPage", "@id": `${site}${PATH}`, url: `${site}${PATH}`, name: TITLE, description: DESCRIPTION, dateModified: t.at, isPartOf: { "@id": `${site}/#website` } },
    { "@type": "HowTo", name: "Create an iPhone Duo pickup shortlist", step: steps.map((step) => ({ "@type": "HowToStep", name: step.title, text: step.hint })) },
  ] };

  return <GuideLayout guide="how-to-get-an-iphone-duo" contents={sections}>
    <JsonLd data={ld} />
    <div className="guide-chapters prose-site">
      <section id="budget" className="guide-chapter">
        <h2>Start with the phone you would keep.</h2>
        <p>Write down a maximum spend, a minimum capacity and any color you would rule out. This gives every later stock check a clear purpose. A busy history row is not a reason to accept a phone outside those boundaries.</p>
        <BlockView b={storageTable} facts={facts} />
        {t.unknown && <p role="status">The historical read is unavailable. Catalog prices remain visible; missing counts are not zero returns.</p>}
        <p>The share column combines colors within each capacity. For an exact pairing, use the <Link href="/which-iphone-duo-restocks-most">configuration notebook</Link>. A return is one change from unavailable to available; it does not reveal how many phones were offered.</p>
      </section>
      <section id="radius" className="guide-chapter">
        <h2>Give the journey a limit before ranking stores.</h2>
        <p>Decide where you could collect an order alongside your existing plans. Start with that boundary in the <Link href="/iphone-duo-near-me">nearby-store finder</Link>. The national sample below is useful for opening a store record, but it cannot tell you which journey is worthwhile.</p>
        {storesTable.rows.length && !t.unknown ? <BlockView b={storesTable} facts={facts} /> : <p>No store comparison is available in this sample. You can still browse the store directory and current pickup listings.</p>}
        <p>Compare the date count alongside the return count: repeated changes on one date describe something different from returns spread across several dates. Neither establishes a regular supply schedule.</p>
      </section>
      <section id="record" className="guide-chapter">
        <h2>Keep a short window beside the longer record.</h2>
        <StatGrid cols={3} className="my-5">
          <Stat value={recent.unknown ? "—" : n(recent.restocks)} label={`US returns in the ${recent.hours}-hour query window`} />
          <Stat value={recent.unknown ? "—" : n(recent.stores)} label="distinct US stores in that short window" />
          <Stat value={f.duoSellout ? n(f.duoSellout.n) : "—"} label="completed Duo durations across all tracked countries in the separate seven-day sample" />
        </StatGrid>
        <p>The short-window query was assembled at <time dateTime={recent.at}>{recent.at}</time>. These are recorded events, including any imported history that falls within the window, rather than current offers. Look up the same store and configuration on the live board before acting.</p>
        {!t.unknown && dailyTable.rows.length ? <BlockView b={dailyTable} facts={facts} /> : <p>The daily series has no readable rows to compare here.</p>}
        <p>The historical dataset starts on {since}. That date belongs to the source record and predates ShelfSpring; it is not the age of this service. Separately attributed third-party reports are excluded from the counts above.</p>
      </section>
      <section id="route" className="guide-chapter">
        <h2>Use your deadline to choose the next screen.</h2>
        <p>If you need the phone by a particular date, compare the seller’s actual offer with that date. Pickup history cannot establish that pickup will beat delivery, and an unavailable online listing cannot settle what a walk-in customer might find.</p>
        <BlockView b={routes} facts={facts} />
      </section>
      <section id="response" className="guide-chapter">
        <h2>Make the next match easy to evaluate.</h2>
        <p>Preparation reduces the decisions you need to make after noticing stock. It does not shorten Apple’s checkout or guarantee that inventory will remain available. Stop and review if the configuration, location or total differs from your plan.</p>
        <StepStrip steps={steps} className="my-5 lg:grid-cols-2!" />
        <p>For example, three reachable stores and two acceptable configurations produce six store–configuration rules. Plus currently allows {PLANS.plus.limit} rules for ${PLANS.plus.priceUsd} per month; compare all capacities on <Link href="/pricing">pricing</Link>. Every plan uses the same inventory feed.</p>
        <div className="my-5 flex flex-wrap gap-3"><Link href="/#notify" className="btn btn-primary">Build my shortlist</Link><Link href="/stock/iphone-duo" className="btn btn-ghost">Check current listings</Link></div>
      </section>
    </div>
    <div className="mt-10"><RichFaq items={faq} facts={facts} title="Check the plan before saving it" /></div>
    <div className="mt-8"><SourceList facts={facts} where={`the ${STORES.length}-store US catalog`} since={since} sources={[{ label: "Apple: Delivery and Pickup", url: PICKUP }, { label: "Apple: Shipping and Pickup Help", url: PICKUP_HELP }]} /></div>
  </GuideLayout>;
}
