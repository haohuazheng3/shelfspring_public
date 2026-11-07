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
import { ALL_STORES, STORES, appleName, storePath } from "@/lib/apple/catalog";
import { INTL_CODES } from "@/lib/apple/countries";
import { PLANS } from "@/lib/plans";
import { TRACKING_SINCE_INTL, TRACKING_SINCE_US, hourLabel, siteFacts } from "@/lib/content/siteFacts";
import { busiestWindow, duoRestockTimes } from "@/lib/content/restockTimes";
import { medianBand } from "@/lib/stock/sellouts";
import { alertHref } from "@/lib/seo/enrich";
import { Measured, Points, Stat, StatGrid, StepStrip } from "@/components/ui/Viz";

export const revalidate = 3600;

const TITLE = "iPhone Duo Alerts: Plan a Useful Watchlist · ShelfSpring";
const DESCRIPTION = "Build an iPhone Duo watchlist around stores and configurations you can use. Count alert slots, check delivery settings and read historical pickup windows with their sample limits.";
const PATH = "/iphone-duo-stock-alerts";
const WEB_PUSH = "https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers";
const APPLE_HELP = "https://www.apple.com/shop/help/shipping_delivery";

export const metadata: Metadata = withCuratedMetadata(PATH, {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { type: "article", siteName: "ShelfSpring", title: TITLE, description: DESCRIPTION, url: PATH },
});

const n = (x: number) => x.toLocaleString("en-US");
/** Whole-percent shares; a share under half a percent reads "<1%", never a misleading "0%". */
const pct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
const longDate = (ymd: string) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${ymd}T12:00:00Z`));
const hl = (h: number) => hourLabel(h % 24);

function Section({ id, h2, lead, facts, children }: { id: string; h2: string; lead: string; facts: Facts; children: ReactNode }) {
  return (
    <section id={id} className="guide-chapter">
      <h2 className="display text-2xl sm:text-3xl">{h2}</h2>
      <p className="mt-3 text-base text-ink-2 sm:text-lg"><Inline text={lead} facts={facts} /></p>
      {children}
    </section>
  );
}

function LinkRow({ links, className = "mt-4" }: { links: { label: string; href: string }[]; className?: string }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {links.map((l) => l.href.startsWith("http") ? <a key={l.href} href={l.href} target="_blank" rel="noopener" className="chip chip-sm">{l.label}</a> : <Link key={l.href} href={l.href} className="chip chip-sm">{l.label}</Link>)}
    </div>
  );
}

export default async function DuoStockAlerts() {
  const [f, facts, rt] = await Promise.all([siteFacts(), getFacts(), duoRestockTimes("us")]);
  const ds = f.duoSellout; // Completed Duo listings across all tracked countries, last 7 days.
  const so = rt.sellout; // Completed US Duo listings since the start of the historical dataset.
  const intl = ALL_STORES.length - STORES.length;
  const typical = ds ? medianBand(ds.medianSec) : null;
  const since = longDate(rt.since);
  const bw = rt.peakHour != null && rt.n > 0 ? busiestWindow(rt.byHour) : null;
  const top = rt.topStores[0];
  const topStore = top ? STORES.find((s) => s.storeNumber === top.storeNumber) : undefined;
  const setupHref = alertHref({ model: "duo" });

  const setupSteps = [
    { title: "Write down acceptable configurations", hint: "Choose the storage and color combinations you would actually order. Each exact combination needs its own alert at each selected store." },
    { title: "Choose a realistic pickup area", hint: "Consider travel, store opening hours and your schedule. You will still need a pickup option that Apple offers when you order." },
    { title: "Save the store–configuration pairs", hint: "Review the alert count and your plan capacity in the account editor before saving your watchlist." },
    { title: "Check the delivery channel", hint: "Use the installation guide for your device, enable notifications where supported and send a test. Check your account email for the fallback channel." },
  ];

  const deliveryTable: Block = { t: "table", head: ["Stage", "What happens", "Limit to keep in mind"], rows: [
    ["Inventory evidence", "The source confirms an availability change with two matching Apple responses, about a second apart.", "A check records what Apple returned at that moment."],
    ["Alert matching", "Synchronized return events are matched to your saved store and exact configuration.", "The source must detect the change and ShelfSpring must receive it before a match can be delivered."],
    ["Device or email", "Enabled devices receive push attempts; email is the fallback when no device is enabled or push fails for every device.", "Permissions, device settings and network conditions affect delivery. There is no fixed arrival-time guarantee."],
  ], caption: "All subscription tiers use the same inventory feed and matching workflow.", source: "[How ShelfSpring reads inventory](/how-it-works) and the account’s notification settings" };

  const signalTable: Block = { t: "table", head: ["What you are reading", "The question it can answer", "The separate check you still need"], rows: [
    ["An alert naming a store and configuration", "Which saved choice matched a newly recorded return?", "Does Apple still offer that exact choice for pickup?"],
    ["A stock table with an observation time", "What did the latest recorded check show?", "Is that observation recent enough to guide your next check?"],
    ["A completed listing in the history", "How long was this configuration observed before it disappeared?", "A historical duration does not reveal time remaining on a new listing."],
    ["Apple’s order and pickup messages", "Has Apple accepted the order, and what are the collection instructions?", "Follow the status and requirements in Apple’s messages before travelling."],
  ], caption: "Use each record for the decision it supports.", source: "Recorded inventory observations and [Apple’s pickup guidance](https://www.apple.com/shop/shipping-pickup)" };

  const nav = [
    { id: "setup", label: "Define your watchlist" },
    { id: "cost", label: "Count the alert slots" },
    { id: "how-alerts-work", label: "Check delivery" },
    { id: "compare", label: "Read a notification" },
    { id: "how-fast", label: "Use the evidence" },
    { id: "when-it-arrives", label: "Continue with Apple" },
  ];

  const faq: Faq[] = [
    { q: "Will saving an alert tell me about stock that is already listed?", a: "Alerts respond to new matching returns in the synchronized feed; they are not a replay of the current stock table. Check the [live listings](/) when you create your watchlist. A store’s initial observation and a change to sold out do not trigger a restock alert." },
    { q: "How do I decide which subscription fits my list?", a: `Count every store–configuration pair. One configuration at three stores needs three slots; two configurations at those same stores need six. The current limits are ${PLANS.plus.limit} for ${PLANS.plus.name}, ${PLANS.pro.limit} for ${PLANS.pro.name} and ${PLANS.max.limit} for ${PLANS.max.name}. All tiers use the same inventory feed; [compare capacity and prices](/pricing).` },
    { q: "What should I check if a test notification does not appear?", a: "Open [the installation guide](/install) on the device you want to use. Review the browser or Home Screen app setup, notification permission and system notification settings, then try the test again. A successful test checks the delivery setup at that time; it does not guarantee that a future alert will arrive before stock changes." },
    { q: "Does the seven-day median describe my local store?", a: "No. That sample combines completed iPhone Duo listings across all tracked countries. The separate US history on this page has a different scope and start date. Neither aggregate predicts the duration of your next local listing or measures how long you will have after receiving a notification." },
    { q: "Can I use the same approach outside the United States?", a: `The catalog includes ${intl} Apple Stores across ${INTL_CODES.length} other countries. Begin with the relevant country page, such as [Canada](/ca), [the United Kingdom](/uk), [Australia](/au) or [Japan](/jp), and choose stores there. International records in the imported history begin on ${longDate(TRACKING_SINCE_INTL)}; the date describes dataset coverage, not ShelfSpring’s operating history.` },
    { q: "When is it safe to make the trip to a store?", a: `Use Apple’s order status and pickup instructions to decide. ShelfSpring cannot hold a device, accept a pickup order or determine that it is ready to collect. Read [Apple’s shipping and pickup help](${APPLE_HELP}) for the requirements that apply to your order.` },
  ];

  const sources: Source[] = [
    { label: "Apple: delivery and pickup options", url: "https://www.apple.com/shop/shipping-pickup" },
    { label: "Apple: order collection and pickup requirements", url: APPLE_HELP },
    { label: "Apple Developer: web push delivery in apps and browsers", url: WEB_PUSH },
  ];

  const site = "https://shelfspring.com";
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${site}${PATH}`, url: `${site}${PATH}`, name: TITLE, description: DESCRIPTION, isPartOf: { "@id": `${site}/#website` }, about: { "@id": `${site}/#organization` }, dateModified: f.at },
      {
        "@type": "HowTo", name: "Build an iPhone Duo pickup watchlist",
        step: setupSteps.map((step) => ({ "@type": "HowToStep", name: step.title, text: step.hint, url: `${site}${PATH}#setup` })),
      },
    ],
  };

  return (
    <GuideLayout guide="iphone-duo-stock-alerts" contents={nav}>
      <JsonLd data={ld} />

      <section className="guide-evidence-lead">
        <div>
          <div className="eyebrow mb-4">Watchlist planning · iPhone Duo</div>
          <p className="mt-5 max-w-xl text-lg text-ink-2">Start with a decision you could act on: which iPhone Duo, which store, and whether collecting it would fit your day. A saved alert connects those choices to future inventory changes. This notebook explains how to build that list and interpret what comes back.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={setupHref} className="btn btn-primary btn-lg">Build my Duo watchlist</Link>
            <Link href="/iphone-duo-near-me" className="btn btn-ghost btn-lg">Explore reachable stores</Link>
          </div>
        </div>
        <StatGrid cols={2}>
          <Stat value="1 pair" label="one store plus one exact configuration uses one alert slot" tone="accent" />
          <Stat value={n(ALL_STORES.length)} label={`catalog stores across ${INTL_CODES.length + 1} tracked countries`} />
        </StatGrid>
      </section>

      <div className="mt-6 grid gap-5">
        <Section id="setup" h2="Make every saved choice usable" lead="An alert is useful when both halves of the match work for you: **the configuration you would buy and the store you could collect from**. Decide those limits before adding more choices." facts={facts}>
          <StepStrip className="mt-5 lg:grid-cols-4!" steps={setupSteps} />
          <p className="mt-5 text-ink-2">Treat nearby stores as alternatives, then check their practical differences. A frequent historical return cannot make an inconvenient journey workable, and an early-morning pattern does not require you to arrive at a fixed hour. Apple’s available pickup options govern the actual order.</p>
          <LinkRow links={[{ label: "Find stores around your location", href: "/iphone-duo-near-me" }, { label: "Review device setup", href: "/install" }]} />
        </Section>

        <Section id="cost" h2="Budget for combinations, not devices" lead="The watchlist count grows with every store–configuration pair. Browsing stock and history is free; a subscription adds capacity for saved alerts." facts={facts}>
          <StatGrid cols={3} className="mt-5">
            <Stat value={`$${PLANS.plus.priceUsd}`} unit="/ month" label={<>{PLANS.plus.name} · {PLANS.plus.limit} alert slots</>} tone="accent" />
            <Stat value={`$${PLANS.pro.priceUsd}`} unit="/ month" label={<>{PLANS.pro.name} · {PLANS.pro.limit} alert slots</>} />
            <Stat value={`$${PLANS.max.priceUsd}`} unit="/ month" label={<>{PLANS.max.name} · {PLANS.max.limit} alert slots</>} />
          </StatGrid>
          <Points className="mt-5" items={[
            { text: <>Example: one storage and color combination at three stores uses <b className="text-ink">3 slots</b>. Adding a second acceptable combination at each store brings the total to <b className="text-ink">6</b>.</> },
            { text: <>Different stores can have different selections. Count the pairs you intend to save instead of assuming every configuration belongs at every store.</> },
            { text: <>Choose capacity for that list. A larger subscription does not buy a different inventory feed or a guaranteed notification arrival time.</> },
          ]} />
          <LinkRow links={[{ label: "Review subscription terms and capacity", href: "/pricing" }]} />
        </Section>

        <Section id="how-alerts-work" h2="Check the route from a record to your device" lead="A recorded return passes through collection, synchronization, matching and delivery. **Those stages take time**, so a valid notification can describe availability that has already changed." facts={facts}>
          <BlockView b={deliveryTable} facts={facts} />
          <p className="mt-5 text-ink-2">Before depending on push, use the test in the notification settings on the device you will carry. On iPhone, follow the Home Screen app instructions in the installation guide. Browser support, permissions and system settings matter; keeping an account page open is not a substitute for checking delivery.</p>
          <p className="mt-3 text-ink-2">A restock alert represents a new return event. The workflow does not send another restock alert merely because an item remains available, and it excludes sold-out changes and the source’s first observation of a store–configuration pair.</p>
          <LinkRow links={[{ label: "Set up and test notifications", href: "/install" }, { label: "Read the inventory method", href: "/how-it-works" }]} />
        </Section>

        <Section id="compare" h2="Separate the useful lead from the order confirmation" lead="When a notification arrives, extract **the store, storage and color**. Use those details to check Apple’s current pickup offer; the message itself has not placed an order." facts={facts}>
          <BlockView b={signalTable} facts={facts} />
          <Points className="mt-5" items={[
            { text: <>Compare the complete configuration. Availability for another color or storage size does not confirm the one you saved.</> },
            { text: <>Read the observation time when returning to ShelfSpring. A past match can remain in the history after the stock is gone.</> },
            { text: <>If Apple no longer offers pickup, check another acceptable choice from your list. There is no need to infer a new arrival time from the previous alert.</> },
          ]} />
        </Section>

        <Section id="how-fast" h2="Use completed windows to understand the limits" lead="History helps explain why occasional checks can miss a listing. It does not establish a checkout deadline, a service delivery speed or your chance of obtaining the next phone." facts={facts}>
          <h3 className="mt-6 text-lg font-semibold">Recent sample · all tracked countries · last 7 days</h3>
          {ds ? (
            <>
              <p className="mt-2 text-ink-2">This combined sample contains {n(ds.n)} completed iPhone Duo pickup windows. Its median falls in the {typical} band. Each window is a store–configuration listing, so the count is neither individual phones nor successful purchases.</p>
              <StatGrid cols={3} className="mt-4">
                <Stat value={n(ds.n)} label="completed windows across all tracked countries, last 7 days" tone="accent" />
                <Stat value={ds.medianSec} unit="s" label="median observed listed-to-gone interval" tone="warn" />
                <Stat value={pct(ds.within30)} label="of this sample observed gone within 30 seconds" />
              </StatGrid>
              <h4 className="mt-6 font-semibold">An illustration of gaps between checks</h4>
              <StatGrid cols={3} className="mt-3">
                <Stat value={pct(ds.caught.m1)} label="modeled share seen with a 1-minute check interval" tone="muted" />
                <Stat value={pct(ds.caught.m5)} label="modeled share seen with a 5-minute check interval" tone="muted" />
                <Stat value={pct(ds.caught.m15)} label="modeled share seen with a 15-minute check interval" tone="muted" />
              </StatGrid>
              <Measured>
                The model averages min(1, d ÷ T) across these {n(ds.n)} completed windows, where d is the observed duration and T is the check interval in seconds. It assumes a regular check schedule whose starting point is uniformly distributed relative to the listing. Durations end at the first recorded absent check and are upper bounds on the observed window; shorter listings can be missed entirely. These estimates describe this historical sample only. They do not test any tracker, include notification delay or estimate purchase success.
              </Measured>
            </>
          ) : (
            <p className="pane-2 mt-4 p-4 text-sm text-ink-3">No recent duration estimate is available. The summary requires at least 20 completed iPhone Duo listings in the seven-day sample across all tracked countries. Until that sample is available, no median, short-window share or sampling estimate is shown.</p>
          )}

          <h3 className="mt-7 text-lg font-semibold">Separate reference · United States · since {since}</h3>
          <p className="mt-2 text-ink-2">The following records cover US stores from the start of the imported dataset. They use a longer window than the seven-day summary across all tracked countries above. Historical concentration can guide which store pages you investigate, but it is not a published restocking schedule.</p>
          {so ? (
            <>
              <p className="mt-3 text-sm text-ink-3">Duration sample: {n(so.n)} completed US iPhone Duo listings since {since}.</p>
              <StatGrid cols={3} className="mt-3">
                <Stat value={so.medianSec} unit="s" label="median US observed listed-to-gone interval" tone="warn" />
                <Stat value={pct(so.within2min)} label="US sample observed gone within 2 minutes" />
                <Stat value={pct(so.within20min)} label="US sample observed gone within 20 minutes" tone="muted" />
              </StatGrid>
            </>
          ) : (
            <p className="mt-3 text-sm text-ink-3">The US duration summary is unavailable for this sample. An absent summary does not mean there were no pickup opportunities.</p>
          )}
          <StatGrid cols={2} className="mt-4">
            {bw
              ? <Stat value={pct(bw.share)} label={<>of {n(rt.n)} recorded US Duo returns since {since} fell between {hl(bw.from)} and {hl(bw.to)}, using each store’s local time</>} tone="accent" />
              : <Stat value="—" label="US returns do not yet support a busiest-window summary" tone="muted" />}
            {top && topStore
              ? <Stat value={n(top.restocks)} label={<><Link href={storePath(topStore)} className="underline underline-offset-2">{appleName(topStore)}</Link> · largest recorded US Duo return count since {since}, across {top.days} days with returns</>} />
              : <Stat value="—" label="no leading US store is available in this historical sample" tone="muted" />}
          </StatGrid>
          <LinkRow links={[{ label: "Inspect the duration records", href: "/iphone-duo-sell-out-times" }, { label: "Explore US return times", href: "/iphone-duo-restock-times" }, { label: "Compare recorded configurations", href: "/which-iphone-duo-restocks-most" }]} />
        </Section>

        <Section id="when-it-arrives" h2="Let Apple confirm the next step" lead="Your watchlist has done its job when it gives you a relevant choice to investigate. **Apple’s current checkout and order status** determine whether you can buy and collect it." facts={facts}>
          <StepStrip className="mt-5 lg:grid-cols-4!" steps={[
            { title: "Match the offer", hint: "Open Apple’s buying flow and verify the named configuration and store against the notification." },
            { title: "Review the pickup option", hint: "Check the collection time and any requirements shown for that order. Continue only if the option suits you." },
            { title: "Complete Apple’s checkout", hint: "Review the purchase details and submit the order with Apple. A saved ShelfSpring alert has not reserved inventory." },
            { title: "Follow the order updates", hint: "Wait for Apple’s pickup instructions before travelling, and bring what those instructions require." },
          ]} />
          <LinkRow links={[{ label: "Prepare for Apple’s pickup checkout", href: "/how-to-grab-an-iphone-duo-restock" }, { label: "Understand pickup status wording", href: "/apple-store-pickup-availability-explained" }]} />
          <div className="mt-5"><Link href={setupHref} className="btn btn-primary">Open the watchlist editor</Link></div>
        </Section>
      </div>

      <div className="mx-auto mt-10 max-w-3xl"><RichFaq items={faq} facts={facts} title="Watchlist decisions and delivery questions" /></div>
      <div className="mx-auto mt-8 max-w-3xl"><SourceList sources={sources} facts={facts} where={`${n(ALL_STORES.length)} tracked Apple Stores across ${INTL_CODES.length + 1} countries`} since={`${longDate(TRACKING_SINCE_US)} for US records; international records begin ${longDate(TRACKING_SINCE_INTL)}`} /></div>
    </GuideLayout>
  );
}
