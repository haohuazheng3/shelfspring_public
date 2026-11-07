import { withCuratedMetadata } from "@/lib/seo/curation";
import { GuideLayout } from "@/components/guides/GuideLayout";
/**
 * Explain how to interpret observations, their history and alert eligibility. Data queries stay shared with the core service.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { BlockView } from "@/components/content/Blocks";
import { Inline } from "@/components/content/Inline";
import { RichFaq, SourceList } from "@/components/content/RichFaq";
import { JsonLd } from "@/components/seo/JsonLd";
import { getFacts, type Facts } from "@/lib/content/facts";
import type { Block, Faq, Source } from "@/lib/content/types";
import { ALL_STORES, STORES, storePath, appleName } from "@/lib/apple/catalog";
import { INTL_CODES } from "@/lib/apple/countries";
import { PLANS } from "@/lib/plans";
import { PATTERN_DAYS, TRACKING_SINCE_INTL, TRACKING_SINCE_US, WEEKDAYS, hourLabel, siteFacts, type SiteFacts } from "@/lib/content/siteFacts";
import { medianBand } from "@/lib/stock/sellouts";
import { Chips, Measured, Points, Stat, StatGrid, StepStrip } from "@/components/ui/Viz";

export const revalidate = 3600;

const TITLE = "How ShelfSpring Works: Pickup Stock & Alerts";
const DESCRIPTION = "See how ShelfSpring brings together recent pickup availability, recorded restocks and store-specific alerts. Check the observation time, compare nearby stores and reserve with Apple.";

export const metadata: Metadata = withCuratedMetadata("/how-it-works", {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/how-it-works" },
  openGraph: { type: "article", siteName: "ShelfSpring", title: TITLE, description: DESCRIPTION, url: "/how-it-works" },
});

const n = (x: number) => x.toLocaleString("en-US");
const pct = (x: number) => `${Math.round(x * 100)}%`;
const COUNTRIES_COVERED = ["Canada", "the UK", "Australia", "Germany", "France", "Italy", "Spain", "Japan", "South Korea", "Hong Kong", "Singapore", "the UAE", "Switzerland", "the Netherlands", "Sweden", "Taiwan", "Austria", "Belgium"];

/** The US store with the most restocks and a stated pattern: the worked example of "when does my store restock". */
function example(f: SiteFacts) {
  const best = Object.values(f.patterns).filter((p) => p.peakHour != null && STORES.some((s) => s.storeNumber === p.storeNumber)).sort((a, b) => b.restocks - a.restocks)[0];
  const store = best ? STORES.find((s) => s.storeNumber === best.storeNumber) : undefined;
  return best && store ? { p: best, store, name: appleName(store), path: storePath(store) } : null;
}

/** A question, its one-sentence answer, then the UI. */
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

export default async function HowItWorks() {
  const f = await siteFacts();
  const facts = await getFacts();
  const ex = example(f);
  const intl = ALL_STORES.length - STORES.length;
  const ds = f.duoSellout;
  const typical = ds ? `about ${medianBand(ds.medianSec)}` : "not enough recent observations to summarize";

  const cycleTable: Block = { t: "table", head: ["What happens", "How long"], rows: [
    ["Source inventory is collected", "frequently, across the tracked stores and configurations"],
    ["A first \"available\" is asked again before it counts", "about 1 second later"],
    ["Confirmed source records are synchronized", "collection and synchronization both add delay"],
    ["A newly detected restock can trigger an alert", "delivery depends on synchronization, network and device settings"],
    ["Paid plans use the same stock feed", "the plan changes your alert limit, not collection speed"],
    ["Median iPhone Duo listing in the recent sample", typical],
    ], caption: "From an inventory observation to a notification", source: "ShelfSpring inventory import and alert workflow; check each page’s displayed observation time" };
  const dataTable: Block = { t: "table", head: ["What we record", "Where you see it"], rows: [
    ["Latest known store–configuration status", "the pickup board, with its observation timestamp"],
    ["Recorded changes to available or unavailable", "the chronological [event journal](/restocks) and local detail pages"],
    ["Distribution of past events by local hour or weekday", "historical charts where the sample meets the minimum evidence requirements"],
    [`Event counts within 24-hour, 7-day and ${PATTERN_DAYS}-day windows`, "dated summaries for a place or device selection"],
    ["Observed interval between a return and a later sell-out", "completed-listing statistics, distinct from openings still in progress"],
    ["How recorded returns are distributed across configurations", "comparison tables and ShelfSpring field notes"],
    ["Catalog prices and applicable local tax context", "location and configuration views; verify the final total on Apple"],
    ], caption: f.restocks ? `${n(f.restocks)} recorded restocks and ${n(f.soldouts)} sell-outs in the historical dataset` : "Historical inventory observations", source: `Imported pickup history (US from ${TRACKING_SINCE_US}, other countries from ${TRACKING_SINCE_INTL}); coverage dates are not ShelfSpring’s launch date` };

  const speedLead = "**Frequent inventory collection is one step, not a delivery deadline.** ShelfSpring synchronizes source observations, matches newly detected returns to your saved stores and configurations, and then sends a notification; each stage can add delay.";
  const realLead = "The source confirms a return using **two matching pickup-availability responses**. ShelfSpring imports those recorded events; a matching pair reduces transient errors but does not reserve inventory or guarantee the listing remains available.";
  const dataLead = `The record connects a store, a device configuration and an observation time.${f.restocks ? ` It currently contains **${n(f.restocks)}** confirmed returns across ${n(f.restockStores)} stores.` : ""} Pages summarize those events over explicit windows so that recent activity, local timing and listing duration remain separate comparisons.`;
  const yourStoreLead = `Use the local-hour and weekday summaries as **historical context** for your shortlist. The last ${PATTERN_DAYS} days show when recorded returns occurred; Apple publishes no pickup-restock schedule.`;
  const coverageLead = `Choose a market before comparing availability. The catalog covers **${n(ALL_STORES.length)}** Apple Stores across ${INTL_CODES.length + 1} countries and the tracked configurations of Duo, 18 Pro and 18 Pro Max.`;
  const costLead = `Explore the public record without a subscription. A paid plan supplies an alert allowance, beginning at **$${PLANS.plus.priceUsd} USD per month**, for the combinations you choose to follow.`;

  const nav = [
    { id: "speed", label: "Collection and delivery" },
    { id: "confirmed", label: "Confirmed restocks" },
    { id: "data", label: "What we record" },
    { id: "your-store", label: "Your store's restock times" },
    { id: "coverage", label: "Stores and iPhones" },
    { id: "cost", label: "Price" },
    { id: "limits", label: "Limits" },
  ];

  const faq: Faq[] = [
    { q: "Does a subscription make stock checks faster?", a: "No. Every plan uses the same synchronized stock feed. A plan changes how many store–configuration alerts you can save. Collection, synchronization and delivery can delay a notification, and Apple may sell out before you open it." },
    { q: "Where does the restock data come from?", a: `The dataset contains recorded apple.com pickup observations, including imported history covering US stores from ${TRACKING_SINCE_US} and other countries from ${TRACKING_SINCE_INTL}. Those dates describe the data, not how long ShelfSpring has operated. Recorded returns require matching responses ([restock log](/restocks)).` },
    { q: "Does Apple publish a restock schedule?", a: "A past concentration of returns is not a published timetable. Use Apple’s current pickup listing to check a device and store; ShelfSpring’s local charts describe only the recorded sample ([Apple pickup information](https://www.apple.com/shop/shipping-pickup))." },
    { q: "Can ShelfSpring reserve a phone for me?", a: "No. An alert identifies a newly detected listing for your chosen configuration. Confirm its current availability on apple.com and complete Apple’s order process; ShelfSpring cannot hold it." },
    { q: "Is ShelfSpring affiliated with Apple?", a: "No. ShelfSpring is an independent pickup-planning service using recorded public pickup availability. Apple controls listings, orders and collection." },
  ];
  const sources: Source[] = [
    { label: "Apple: Delivery and Pickup (how pickup availability works)", url: "https://www.apple.com/shop/shipping-pickup" },
    { label: "Apple: Shipping & Pickup help (what to bring to a pickup)", url: "https://www.apple.com/shop/help/shipping_delivery" },
  ];

  const site = "https://shelfspring.com";
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${site}/how-it-works`, url: `${site}/how-it-works`, name: TITLE, description: DESCRIPTION, isPartOf: { "@id": `${site}/#website` }, about: { "@id": `${site}/#organization` }, dateModified: f.at },
      {
        "@type": "HowTo", name: "How to use pickup history for a reachable store shortlist",
        step: [
          { "@type": "HowToStep", name: "Set your travel boundary", text: "Use the store directory or search to identify places where you could collect a confirmed order.", url: `${site}/stores` },
          { "@type": "HowToStep", name: "Inspect the local sample", text: "Read the local-hour distribution with its sample size and date window; insufficient evidence may leave a summary blank." },
          { "@type": "HowToStep", name: "Check the configuration", text: "Compare recorded returns for the exact storage and colors you would buy." },
          { "@type": "HowToStep", name: "Save a store and configuration", text: "An alert can notify you after a matching return reaches ShelfSpring. Recheck availability and complete the order with Apple." },
        ],
      },
      {
        "@type": "Dataset", "@id": `${site}/restocks#dataset`, name: "Apple Store iPhone pickup restock log",
        description: "Recorded pickup restocks and sell-outs for iPhone Duo, iPhone 18 Pro and iPhone 18 Pro Max at Apple Stores in 19 countries. Imported history is preserved with its original store, configuration and observation time.",
        url: `${site}/restocks`, publisher: { "@id": `${site}/#organization` }, isAccessibleForFree: true,
        temporalCoverage: `${TRACKING_SINCE_US}/..`, spatialCoverage: "Apple Stores in the United States and 18 other countries",
        variableMeasured: ["Apple Store", "iPhone model, storage and color", "restock time", "sell-out time", "time in stock"],
        ...(f.restocks ? { size: `${f.restocks} restocks, ${f.soldouts} sell-outs` } : {}),
      },
    ],
  };

  return (
    <GuideLayout guide="how-it-works" contents={nav.map((item) => ({ id: item.id, label: item.label }))}>
      <JsonLd data={ld} />

      {/* hero */}
      <section className="guide-evidence-lead">
        <div>
          <div className="eyebrow mb-4">ShelfSpring · the check cycle</div>

          <p className="mt-5 max-w-xl text-lg text-ink-2">Start with a store you can reach, compare its current listings with recent returns, then save the configurations you would buy. ShelfSpring brings those observations together and can notify you after a matching return is detected.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/#notify" className="btn btn-primary btn-lg">Set up an alert</Link>
            <Link href="/restocks" className="btn btn-ghost btn-lg">The restock log</Link>
          </div>
        </div>
        <StatGrid cols={2}>
          <Stat value={n(ALL_STORES.length)} label="Apple Stores in the inventory coverage" tone="accent" />
          <Stat value={INTL_CODES.length + 1} label="countries with local store pages" />
          <Stat value="Same feed" label="across all subscription plans" />
          <Stat value={f.restocks ? n(f.restocks) : "—"} label={f.restocks ? <>confirmed restocks logged · {n(f.soldouts)} sell-outs</> : "confirmed restocks logged since tracking began"} live={!!f.restocks} />
        </StatGrid>
      </section>



      <div className="mt-6 grid gap-5">
        {/* speed */}
        <Section id="speed" h2="Trace the path from observation to notification" lead={speedLead} facts={facts}>
          <BlockView b={cycleTable} facts={facts} />
          <StatGrid cols={3}>
            <Stat value={ds ? `${ds.medianSec}` : "—"} unit={ds ? "s" : undefined} label={ds ? <>global Duo median, last 7 days · {n(ds.n)} completed listings</> : "not enough recent sold-out listings"} tone="warn" />
            <Stat value={ds ? n(ds.n) : "—"} label="sold-out listings in the 7-day sample" tone="muted" />
            <Stat value={ds ? pct(ds.within30) : "—"} label="of that sample gone within 30 seconds" tone="muted" />
          </StatGrid>
          <Points className="mt-5" items={[
            { text: <><b className="text-ink">Read the timestamp first</b>: a current listing and a historical return answer different questions</> },
            { text: <>A short listing can disappear before it is detected, synchronized or delivered to your device</>, no: true },
            { text: <>Keep Apple’s checkout details ready, then verify the exact store and configuration when a notification arrives</>, step: true },
            { text: <>For a local comparison, inspect completed-listing intervals alongside the sample count. An opening still in progress does not yet have a completed duration</> },
          ]} />

        </Section>

        {/* confirmed */}
        <Section id="confirmed" h2="Understand what confirmation establishes" lead={realLead} facts={facts}>
          <Points className="mt-5" size="base" items={[
            { text: <><b className="text-ink">Corroboration comes first</b>: a follow-up source observation must support a change before it becomes a recorded return</> },
            { text: <><b className="text-ink">The reverse change is checked too</b>: a disappearance is confirmed by another source observation</> },
            { text: <><b className="text-ink">Failed reads remain missing evidence</b>: a timeout cannot establish that a phone has sold out</> },
            { text: <><b className="text-ink">An alert needs a new eligible return</b>: repeated available observations and a location&apos;s initial sighting do not create repeated restock notifications</> },
          ]} />
        </Section>

        {/* data */}
        <Section id="data" h2="Match each measurement to its question" lead={dataLead} facts={facts}>
          <StatGrid cols={3} className="mt-5">
            <Stat value={f.restocks ? n(f.restocks) : "—"} label="confirmed restocks" tone="accent" />
            <Stat value={f.soldouts ? n(f.soldouts) : "—"} label="confirmed sell-outs" />
            <Stat value={f.restockStores ? n(f.restockStores) : "—"} label="stores with at least one restock" />
          </StatGrid>
          <BlockView b={dataTable} facts={facts} />
          <Measured>
            Recorded source observations enter these totals. Imported history can predate ShelfSpring; US coverage begins {TRACKING_SINCE_US}, other countries {TRACKING_SINCE_INTL}. Any separately labelled reports from other trackers are excluded.
          </Measured>
        </Section>

        {/* your store */}
        <Section id="your-store" h2="Read a local pattern without predicting the next return" lead={yourStoreLead} facts={facts}>
          <StepStrip className="mt-5 lg:grid-cols-4!" steps={[
            { title: "Set your travel boundary", hint: <Inline text="use the [store directory](/stores) or search to identify places you could collect an order" facts={facts} /> },
            { title: "Inspect the sample", hint: `read local-hour charts with their event counts and ${PATTERN_DAYS}-day window; small samples may have no stated pattern` },
            { title: "Compare acceptable devices", hint: "use the configuration breakdown to see which choices returned and how often" },
            { title: "Set an alert", hint: <>save that store and configuration; watch the notification timestamp and confirm with Apple</> },
          ]} />
          {ex ? (
            <>
              <div className="eyebrow mt-6">For example: <Link href={ex.path} className="normal-case tracking-normal text-ink underline underline-offset-2">{ex.name}</Link>, last {PATTERN_DAYS} days</div>
              <StatGrid cols={4} className="mt-3">
                <Stat value={n(ex.p.restocks)} label="confirmed restocks" />
                <Stat value={hourLabel(ex.p.peakHour!)} label="hour with the largest recorded count, local time" tone="accent" />
                <Stat value={ex.p.peakWeekday != null ? WEEKDAYS[ex.p.peakWeekday] : "—"} label={ex.p.peakWeekday != null ? "the busiest day" : "busiest day: needs two weeks of data"} tone={ex.p.peakWeekday != null ? "plain" : "muted"} />
                <Stat value={ex.p.medianStayMin != null ? `~${ex.p.medianStayMin}` : "—"} unit={ex.p.medianStayMin != null ? "min" : undefined} label="a typical restock stayed listed" />
              </StatGrid>
            </>
          ) : (
            <Points className="mt-5" items={[{ text: <>The local pages keep a {PATTERN_DAYS}-day event history. An unavailable summary means its sample is not sufficient to state that pattern</> }]} />
          )}
          <Points className="mt-5" items={[
            { text: <><b className="text-ink">Keep the observation window attached</b>: an hourly concentration describes the recorded dates and may not repeat</>, no: true },
            { text: <>A chart helps you compare stores; a notification helps you notice a new listing. Neither guarantees a purchase</>, step: true },
          ]} />
          <LinkRow links={[{ label: "When does Apple restock the iPhone Duo? Country-wide, hour by hour", href: "/iphone-duo-restock-times" }, { label: "How fast does an iPhone Duo restock sell out?", href: "/iphone-duo-sell-out-times" }]} />

        </Section>

        {/* coverage */}
        <Section id="coverage" h2="Keep the market and model in view" lead={coverageLead} facts={facts}>
          <StatGrid cols={3} className="mt-5">
            <Stat value={STORES.length} label="Apple Stores in the US" tone="accent" />
            <Stat value={n(intl)} label={<>more in {INTL_CODES.length} other countries</>} />
            <Stat value="3" label="iPhones: Duo, 18 Pro and 18 Pro Max, every storage and color, with Apple's local prices" />
          </StatGrid>
          <Chips className="mt-4" items={COUNTRIES_COVERED} />
          <LinkRow links={[{ label: "The US stores", href: "/stores" }, { label: "The UK", href: "/uk" }, { label: "Japan", href: "/jp" }]} />
        </Section>

        {/* cost */}
        <Section id="cost" h2="Choose an allowance for a useful shortlist" lead={costLead} facts={facts}>
          <StatGrid cols={3} className="mt-5">
            <Stat value={`$${PLANS.plus.priceUsd}`} unit="/ month" label={<>Plus · {PLANS.plus.limit} alerts</>} tone="accent" />
            <Stat value={`$${PLANS.pro.priceUsd}`} unit="/ month" label={<>Pro · {PLANS.pro.limit} alerts</>} />
            <Stat value={`$${PLANS.max.priceUsd}`} unit="/ month" label={<>Max · {PLANS.max.limit} alerts</>} />
          </StatGrid>
          <Points className="mt-5" items={[
            { text: <>The public boards and historical comparisons remain <b className="text-ink">available without a paid plan</b></> },
            { text: <>Count each watched store–configuration pair once when choosing your allowance</> },
            { text: <Inline text="Every plan uses the same stock feed; choose a plan by the number of store–configuration alerts you need ([pricing](/pricing))" facts={facts} /> },
          ]} />
        </Section>

        {/* limits */}
        <Section id="limits" h2="Know where the observation ends" lead="The feed reflects **public pickup listings**, while Apple retains control of the order and collection process." facts={facts}>
          <Points className="mt-5" items={[
            { text: <>A public availability flag does not reveal the stockroom quantity and creates no hold</>, no: true },
            { text: <>A previously available configuration can disappear before Apple accepts an order</>, no: true },
            { text: <Inline text="Prepare notifications for your actual device using the [installation guide](/install). On iPhone or iPad, web push uses the Home Screen app. Email is the fallback when no device is enabled" facts={facts} /> },
          ]} />
          <div className="mt-5"><Link href="/#notify" className="btn btn-primary">Set up an alert</Link></div>
        </Section>
      </div>

      <div className="mx-auto mt-10 max-w-3xl"><RichFaq items={faq} facts={facts} title="Questions before you act" /></div>
      <div className="mx-auto mt-8 max-w-3xl"><SourceList sources={sources} facts={facts} where={`${n(ALL_STORES.length)} Apple Stores in ${INTL_CODES.length + 1} countries`} since={TRACKING_SINCE_US} /></div>
    </GuideLayout>
  );
}
