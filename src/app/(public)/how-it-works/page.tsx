/**
 * /how-it-works: the check cycle, the two-answer rule and what is recorded, shown as tiles, tables, keyword lines and a
 * step strip. Each H2 is a question with one answer-first sentence; every number is live.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { BlockView } from "@/components/content/Blocks";
import { Inline } from "@/components/content/Inline";
import { Figure } from "@/components/content/Figure";
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

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/how-it-works" },
  openGraph: { type: "article", siteName: "ShelfSpring", title: TITLE, description: DESCRIPTION, url: "/how-it-works" },
};

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
    <section id={id} className="pane scroll-mt-24 p-5 sm:p-7">
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
    ["New source records are synchronized", "collection and synchronization both add delay"],
    ["A first \"available\" is asked again before it counts", "about 1 second later"],
    ["A newly detected restock can trigger an alert", "delivery depends on synchronization, network and device settings"],
    ["Paid plans use the same stock feed", "the plan changes your alert limit, not collection speed"],
    ["Median iPhone Duo listing in the recent sample", typical],
    ], caption: "From an inventory observation to a notification", source: "ShelfSpring inventory import and alert workflow; check each page’s displayed observation time" };
  const dataTable: Block = { t: "table", head: ["What we record", "Where you see it"], rows: [
    ["Live pickup stock for every storage and color", "every store, city and state page, with the time of the last check"],
    ["Every confirmed restock and sell-out, with store, configuration and time", "[the restock log](/restocks) and each store page"],
    ["When restocks usually land: local hour and weekday", "\"When does … restock?\" on every store, city and state page"],
    [`Restocks in the last 24 hours, 7 and ${PATTERN_DAYS} days`, "store, city, state and iPhone model pages"],
    ["How long a restock typically stays listed", "the same pages (\"stays ~N min\")"],
    ["Which configurations come back most often", "\"Restocks by configuration\" on store pages"],
    ["The local price with tax", "store and state pages"],
    ], caption: f.restocks ? `${n(f.restocks)} recorded restocks and ${n(f.soldouts)} sell-outs in the historical dataset` : "Historical inventory observations", source: `Imported pickup history (US from ${TRACKING_SINCE_US}, other countries from ${TRACKING_SINCE_INTL}); coverage dates are not ShelfSpring’s launch date` };

  const speedLead = "**Frequent inventory collection is one step, not a delivery deadline.** ShelfSpring synchronizes source observations, matches newly detected returns to your saved stores and configurations, and then sends a notification; each stage can add delay.";
  const realLead = "The source confirms a return using **two matching pickup-availability responses**. ShelfSpring imports those recorded events; a matching pair reduces transient errors but does not reserve inventory or guarantee the listing remains available.";
  const dataLead = `Every confirmed restock and sell-out at every store, with the exact configuration and time${f.restocks ? `: **${n(f.restocks)}** restocks at ${n(f.restockStores)} stores so far` : ""}, from which each page works out when restocks usually land, how often they come and how long they last.`;
  const yourStoreLead = `Use the local-hour and weekday summaries as **historical context** for your shortlist. The last ${PATTERN_DAYS} days show when recorded returns occurred; Apple publishes no pickup-restock schedule.`;
  const coverageLead = `**${n(ALL_STORES.length)}** Apple Stores in ${INTL_CODES.length + 1} countries, every configuration of three iPhones.`;
  const costLead = `Browsing is free; alerts start at **$${PLANS.plus.priceUsd}** a month.`;

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
    { q: "Does Apple publish a restock schedule?", a: "No. Apple shows pickup availability per store and configuration but no schedule; the restock times on ShelfSpring are observed, store by store ([Apple: Delivery and Pickup](https://www.apple.com/shop/shipping-pickup))." },
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
        "@type": "HowTo", name: "How to find when your Apple Store restocks the iPhone",
        step: [
          { "@type": "HowToStep", name: "Find your store", text: "Search by store, city or ZIP, or browse Apple Stores by state.", url: `${site}/stores` },
          { "@type": "HowToStep", name: "Read “When does … restock?”", text: "The store page gives the local hour restocks usually land, the busiest weekday and the last 30 days." },
          { "@type": "HowToStep", name: "Check the configuration", text: "“Restocks by configuration” shows which storage and color come back most often." },
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
    <div className="mx-auto max-w-5xl px-4 pt-8 sm:pt-12">
      <JsonLd data={ld} />

      {/* hero */}
      <section className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="eyebrow mb-4">ShelfSpring · the check cycle</div>
          <h1 className="display text-4xl sm:text-6xl">Turn inventory evidence into a pickup plan</h1>
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

      <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-2 text-sm">
        {nav.map((s) => <a key={s.id} href={`#${s.id}`} className="chip px-3 py-1.5 text-xs">{s.label}</a>)}
      </nav>

      <div className="mt-6 grid gap-5">
        {/* speed */}
        <Section id="speed" h2="How fast does ShelfSpring check Apple Stores?" lead={speedLead} facts={facts}>
          <BlockView b={cycleTable} facts={facts} />
          <StatGrid cols={3}>
            <Stat value={ds ? `${ds.medianSec}` : "—"} unit={ds ? "s" : undefined} label={ds ? <>median iPhone Duo listing, last 7 days · {n(ds.n)} restocks</> : "not enough recent sold-out listings"} tone="warn" />
            <Stat value={ds ? n(ds.n) : "—"} label="sold-out listings in the 7-day sample" tone="muted" />
            <Stat value={ds ? pct(ds.within30) : "—"} label="of that sample gone within 30 seconds" tone="muted" />
          </StatGrid>
          <Points className="mt-5" items={[
            { text: <><b className="text-ink">Read the timestamp first</b>: a current listing and a historical return answer different questions</> },
            { text: <>A short listing can disappear before it is detected, synchronized or delivered to your device</>, no: true },
            { text: <>Keep Apple’s checkout details ready, then verify the exact store and configuration when a notification arrives</>, step: true },
            { text: <>Every store, city, state and country page has <b className="text-ink">&quot;How fast do restocks sell out?&quot;</b>: each restock with the seconds it lasted (&quot;sold out in 45–60 s&quot;), and the share gone within 30 seconds and within a minute</> },
          ]} />
          <Figure id="phone-notification" />
        </Section>

        {/* confirmed */}
        <Section id="confirmed" h2="How does ShelfSpring know a restock is real?" lead={realLead} facts={facts}>
          <Points className="mt-5" size="base" items={[
            { text: <><b className="text-ink">Two answers must agree</b> · the second ask ~1 s after the first · a one-response glitch is thrown away</> },
            { text: <><b className="text-ink">Sold-out changes also need confirmation</b> · the source waits for another observation</> },
            { text: <><b className="text-ink">An error is never &quot;out of stock&quot;</b> · a failed or timed-out request changes nothing · asked again from a fresh address</> },
            { text: <><b className="text-ink">One push per restock</b> · no repeats while it stays in stock · nothing for the very first time a store is seen</> },
          ]} />
        </Section>

        {/* data */}
        <Section id="data" h2="What does ShelfSpring record?" lead={dataLead} facts={facts}>
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
        <Section id="your-store" h2="When does my Apple Store restock?" lead={yourStoreLead} facts={facts}>
          <StepStrip className="mt-5 lg:grid-cols-4!" steps={[
            { title: "Find your store", hint: <Inline text="search by store, city or ZIP at the top of any page, or browse [Apple Stores by state](/stores)" facts={facts} /> },
            { title: "Read \"When does … restock?\"", hint: `the hour restocks usually land in local time, the busiest weekday and the last ${PATTERN_DAYS} days` },
            { title: "Check \"Restocks by configuration\"", hint: "whether your exact storage and color is one that comes back" },
            { title: "Set an alert", hint: <>save that store and configuration; watch the notification timestamp and confirm with Apple</> },
          ]} />
          {ex ? (
            <>
              <div className="eyebrow mt-6">For example: <Link href={ex.path} className="normal-case tracking-normal text-ink underline underline-offset-2">{ex.name}</Link>, last {PATTERN_DAYS} days</div>
              <StatGrid cols={4} className="mt-3">
                <Stat value={n(ex.p.restocks)} label="confirmed restocks" />
                <Stat value={hourLabel(ex.p.peakHour!)} label="most land around this hour, local time" tone="accent" />
                <Stat value={ex.p.peakWeekday != null ? WEEKDAYS[ex.p.peakWeekday] : "—"} label={ex.p.peakWeekday != null ? "the busiest day" : "busiest day: needs two weeks of data"} tone={ex.p.peakWeekday != null ? "plain" : "muted"} />
                <Stat value={ex.p.medianStayMin != null ? `~${ex.p.medianStayMin}` : "—"} unit={ex.p.medianStayMin != null ? "min" : undefined} label="a typical restock stayed listed" />
              </StatGrid>
            </>
          ) : (
            <Points className="mt-5" items={[{ text: <>Each store page shows the hour restocks usually land, the busiest weekday and the last {PATTERN_DAYS} days, day by day</> }]} />
          )}
          <Points className="mt-5" items={[
            { text: <><b className="text-ink">A pattern is history, not a promise</b>: Apple publishes no restock schedule, and a launch week can look nothing like the week after</>, no: true },
            { text: <>A chart helps you compare stores; a notification helps you notice a new listing. Neither guarantees a purchase</>, step: true },
          ]} />
          <LinkRow links={[{ label: "When does Apple restock the iPhone Duo? Country-wide, hour by hour", href: "/iphone-duo-restock-times" }, { label: "How fast does an iPhone Duo restock sell out?", href: "/iphone-duo-sell-out-times" }]} />
          <Figure id="apple-store-pickup-counter" />
        </Section>

        {/* coverage */}
        <Section id="coverage" h2="Which stores and iPhones are covered?" lead={coverageLead} facts={facts}>
          <StatGrid cols={3} className="mt-5">
            <Stat value={STORES.length} label="Apple Stores in the US" tone="accent" />
            <Stat value={n(intl)} label={<>more in {INTL_CODES.length} other countries</>} />
            <Stat value="3" label="iPhones: Duo, 18 Pro and 18 Pro Max, every storage and color, with Apple's local prices" />
          </StatGrid>
          <Chips className="mt-4" items={COUNTRIES_COVERED} />
          <LinkRow links={[{ label: "The US stores", href: "/stores" }, { label: "The UK", href: "/uk" }, { label: "Japan", href: "/jp" }]} />
        </Section>

        {/* cost */}
        <Section id="cost" h2="What does ShelfSpring cost?" lead={costLead} facts={facts}>
          <StatGrid cols={3} className="mt-5">
            <Stat value={`$${PLANS.plus.priceUsd}`} unit="/ month" label={<>Plus · {PLANS.plus.limit} alerts</>} tone="accent" />
            <Stat value={`$${PLANS.pro.priceUsd}`} unit="/ month" label={<>Pro · {PLANS.pro.limit} alerts</>} />
            <Stat value={`$${PLANS.max.priceUsd}`} unit="/ month" label={<>Max · {PLANS.max.limit} alerts</>} />
          </StatGrid>
          <Points className="mt-5" items={[
            { text: <>Live stock, restock times and the restock log: <b className="text-ink">free to browse</b></> },
            { text: <>One alert = one store × one exact configuration</> },
            { text: <Inline text="Every plan uses the same stock feed; choose a plan by the number of store–configuration alerts you need ([pricing](/pricing))" facts={facts} /> },
          ]} />
        </Section>

        {/* limits */}
        <Section id="limits" h2="What can't ShelfSpring do?" lead="It sees **what apple.com shows, nothing more**." facts={facts}>
          <Points className="mt-5" items={[
            { text: <>Public availability only: no quantities, no holds</>, no: true },
            { text: <>Apple sometimes shows stock already reserved for other orders</>, no: true },
            { text: <Inline text="Phone notifications need the Home Screen app ([install](/install)); without one, alerts come by email from alerts@shelfspring.com" facts={facts} /> },
          ]} />
          <div className="mt-5"><Link href="/#notify" className="btn btn-primary">Set up an alert</Link></div>
        </Section>
      </div>

      <div className="mx-auto mt-10 max-w-3xl"><RichFaq items={faq} facts={facts} title="Questions" /></div>
      <div className="mx-auto mt-8 max-w-3xl"><SourceList sources={sources} facts={facts} where={`${n(ALL_STORES.length)} Apple Stores in ${INTL_CODES.length + 1} countries`} since={TRACKING_SINCE_US} /></div>
    </div>
  );
}
