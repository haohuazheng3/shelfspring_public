import type { Metadata } from "next";
import { GuideLayout } from "@/components/guides/GuideLayout";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { BlockView } from "@/components/content/Blocks";
import { RichFaq, SourceList } from "@/components/content/RichFaq";
import { JsonLd } from "@/components/seo/JsonLd";
import { Stat, StatGrid, StepStrip } from "@/components/ui/Viz";
import { getFacts } from "@/lib/content/facts";
import type { Block, Faq } from "@/lib/content/types";
import { STORES, appleName, storeByNumber, storePath, PART_INDEX } from "@/lib/apple/catalog";
import { duoRestockTimes } from "@/lib/content/restockTimes";
import { recentByConfig } from "@/lib/stock/recent";
import { storesWithStockNow } from "@/lib/stock/queries";
import { alertHref } from "@/lib/seo/enrich";
import { withCuratedMetadata } from "@/lib/seo/curation";

export const revalidate = 3600;
const PATH = "/apple-store-pickup-availability-explained";
const TITLE = "Apple Pickup Status: From Listing to Collection";
const DESCRIPTION = "Distinguish a pickup observation from an Apple order. Read unavailable and unknown states, compare event times and know which confirmation to act on.";
const APPLE_PICKUP = "https://www.apple.com/shop/shipping-pickup";
const APPLE_HELP = "https://www.apple.com/shop/help/shipping_delivery";
export const metadata: Metadata = withCuratedMetadata(PATH, {
  title: { absolute: `${TITLE} · ShelfSpring` }, description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { type: "article", siteName: "ShelfSpring", title: TITLE, description: DESCRIPTION, url: PATH },
});
const n = (x: number) => x.toLocaleString("en-US");
const longDate = (day: string) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", dateStyle: "long" }).format(new Date(`${day}T12:00:00Z`));
const contents = [
  { id: "status", label: "Translate the status" },
  { id: "three-clocks", label: "Separate three timestamps" },
  { id: "scope", label: "Compare the same search" },
  { id: "handoff", label: "Follow the order handoff" },
];

export default async function PickupAvailabilityExplained() {
  const [facts, rt, recent, now] = await Promise.all([getFacts(), duoRestockTimes("us"), recentByConfig({ country: "us" }), storesWithStockNow(undefined, "us")]);
  const since = longDate(rt.since);
  const latest = recent.latest;
  const latestStore = latest ? storeByNumber(latest.storeNumber) : undefined;
  const latestItem = latest ? PART_INDEX.get(latest.partNumber) : undefined;
  const states: Block = { t: "table", head: ["What you are reading", "A supported conclusion", "Your next check"], rows: [
    ["Available in a stock observation", "That store listed the selected configuration at the recorded check", "Open Apple and verify the same store, capacity and color"],
    ["Currently unavailable for pickup on Apple", "The chosen search is not offering that pickup option at this moment", "Compare another acceptable configuration or store, or return later"],
    ["Unknown or an unavailable data read on ShelfSpring", "This page cannot provide a usable observation for that item", "Check the timestamp and consult Apple directly; do not count it as sold out"],
    ["An Apple order confirmation", "You have moved beyond a public listing into Apple’s order process", "Use the order status and wait for its collection instructions"],
  ], caption: "The action depends on which system and which stage produced the message." };
  const comparison: Block = { t: "table", head: ["Match this field", "Why two screens can differ"], rows: [
    ["Model, capacity and color", "A model-level total can include configurations that your exact search excludes"],
    ["The actual store", "Nearby-store lists depend on the location you searched; compare a named store rather than a distance alone"],
    ["Pickup versus delivery", "A delivery estimate is a separate offer and is not measured by this pickup feed"],
    ["Observation time", "A newer check may show a different state; a page load or alert receipt is not the original observation"],
  ], caption: "A four-field check before treating a difference as an error." };
  const steps = [
    { title: "Recheck the offer", hint: "On Apple, select the intended configuration and collection store. Review any choices or terms that checkout presents." },
    { title: "Complete Apple’s order", hint: "Keep the confirmation and follow its order-status page. A ShelfSpring rule or notification does not create this order." },
    { title: "Wait for collection instructions", hint: "Use Apple’s ready-for-pickup message for the place, window and identification requirements applicable to your order." },
    { title: "Handle changes with Apple", hint: "If your plans change, inspect the order’s available options or contact Apple. Do not infer cancellation or collection status from a stock chart." },
  ];
  const faq: Faq[] = [
    { q: "Is a missing listing evidence that a store has no phones inside?", a: "No. The feed describes public online pickup listings for selected configurations. It cannot inspect the stockroom, reserved orders, service inventory or the stock a store may sell through another process." },
    { q: "Can the restock count tell me how many units arrived?", a: "No. One return records a change in the listing for one store and configuration. Several units could share that listing, and a change does not reveal whether it followed a delivery, cancellation or another allocation decision." },
    { q: "Why can I see a recent return and no current availability together?", a: "Those fields answer different questions. The event records a previous transition; the current state comes from a later observation. Compare the timestamps and open Apple to check whether the exact option is still offered." },
    { q: "Does the median listing duration give me time to finish checkout?", a: "It describes completed observations in the past. It is neither time remaining nor a reservation timer, and it does not measure how long you personally need to complete Apple’s order steps." },
    { q: "What should I trust if the page and Apple disagree?", a: "Recheck that the configuration, store and buying route match. ShelfSpring may be displaying an earlier observation after collection or synchronization delay. Apple supplies the purchase offer and your order status, so use its current checkout to decide whether you can order." },
  ];
  const site = "https://shelfspring.com";
  const ld = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebPage", "@id": `${site}${PATH}`, url: `${site}${PATH}`, name: TITLE, description: DESCRIPTION, dateModified: rt.at, isPartOf: { "@id": `${site}/#website` } },
    { "@type": "HowTo", name: "Verify a pickup listing and follow the order", step: steps.map((step) => ({ "@type": "HowToStep", name: step.title, text: step.hint })) },
  ] };

  return <GuideLayout guide="apple-store-pickup-availability-explained" contents={contents}>
    <JsonLd data={ld} />
    <div className="guide-chapters prose-site">
      <section id="status" className="guide-chapter">
        <h2>Read the message as permission for a next step.</h2>
        <p>A stock result can justify opening a purchase page. It does not justify setting off for a store. An accepted order and a collection message come later, and each has information the public stock feed cannot supply.</p>
        <BlockView b={states} facts={facts} />
        <p>“Unavailable” has a narrow scope: the selected pickup option at that point in time. It does not establish a permanent shortage or an explanation for why that option changed. An unreadable or stale observation has a different limitation and is shown as unknown.</p>
      </section>
      <section id="three-clocks" className="guide-chapter">
        <h2>Put the event clock beside the observation clock.</h2>
        <StatGrid cols={3} className="my-5">
          <Stat value={facts.models.duo.unknown ? "—" : n(now.duo)} label="US stores with at least one Duo configuration in the current-state read" />
          <Stat value={recent.unknown ? "—" : n(recent.restocks)} label={`recorded US returns in the last ${recent.hours} hours`} />
          <Stat value={!rt.unknown && rt.sellout ? `${rt.sellout.medianSec} s` : "—"} label="median completed listing duration in the longer historical record" />
        </StatGrid>
        <p>The current-state count groups configurations by store; the event count counts changes. They cannot be subtracted to estimate remaining phones. The summary was assembled at <time dateTime={facts.at}>{facts.at}</time>; individual observations may be older. Use the <Link href="/stock/iphone-duo">live stock board</Link> for each listing’s observation context.</p>
        <div className="field-callout my-5">
          <h3 className="font-semibold">A timestamp you can inspect</h3>
          {!recent.unknown && latest ? <p>The latest return in the short-window result was recorded at <time dateTime={latest.at}>{latest.at}</time>{latestStore ? <> for <Link href={storePath(latestStore)}>{appleName(latestStore)}</Link></> : null}{latestItem ? <> · {latestItem.storage} {latestItem.color}</> : null}. This describes the event, not a promise that the listing remains available.</p> : <p>No latest return is available to illustrate in this read. That does not establish the current stock state of any particular store.</p>}
        </div>
        <p>There is a third clock if you enable alerts: when the message reaches you. Collection, synchronization and delivery can separate all three times. Imported history retains source event times from {since}; it does not represent how long ShelfSpring has operated and does not trigger retrospective notifications.</p>
      </section>
      <section id="scope" className="guide-chapter">
        <h2>Resolve a disagreement by matching the search.</h2>
        <p>Before refreshing repeatedly, compare what the two screens actually requested. “A Duo is available nearby” and “this 512GB color is unavailable at my chosen store” can both describe the same inventory correctly.</p>
        <BlockView b={comparison} facts={facts} />
        <p>Once those fields match, consider the observation time. The feed does not expose a reason for every transition, so a change alone cannot prove a delivery, a cancellation or unusually fast shoppers. The <Link href="/iphone-duo-sell-out-times">timing notebook</Link> explains what the measured intervals do support.</p>
      </section>
      <section id="handoff" className="guide-chapter">
        <h2>Let the order, rather than the chart, guide collection.</h2>
        <StepStrip steps={steps} className="my-5 lg:grid-cols-2!" />
        <p>Pickup, delivery and a walk-in purchase are different routes. This site monitors the public pickup signal; it does not compare their hidden inventories or promise which route will be fastest. Read Apple’s instructions for your actual order rather than applying a fixed hold period from a guide.</p>
        <div className="my-5 flex flex-wrap gap-3"><Link href={alertHref({ model: "duo" })} className="btn btn-primary">Save a pickup watch</Link><a href={APPLE_PICKUP} target="_blank" rel="noopener" className="btn btn-ghost">Read Apple’s pickup process</a></div>
      </section>
    </div>
    <div className="mt-10"><RichFaq items={faq} facts={facts} title="Separate the signals" /></div>
    <div className="mt-8"><SourceList facts={facts} where={`the ${STORES.length}-store US catalog`} since={since} sources={[{ label: "Apple: Delivery and Pickup", url: APPLE_PICKUP }, { label: "Apple: Shipping and Pickup Help", url: APPLE_HELP }]} /></div>
  </GuideLayout>;
}
