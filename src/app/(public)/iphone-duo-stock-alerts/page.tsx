/**
 * /iphone-duo-stock-alerts: what an alert is and why the interval matters, shown as tiles, a step strip, tables and
 * swaps. Each H2 is a question with one answer-first sentence; every number is live.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { BlockView } from "@/components/content/Blocks";
import { Inline } from "@/components/content/Inline";
import { Figure } from "@/components/content/Figure";
import { RichFaq, SourceList } from "@/components/content/RichFaq";
import { JsonLd } from "@/components/seo/JsonLd";
import { AlertBannerMock } from "@/components/content/CheckoutMocks";
import { getFacts, type Facts } from "@/lib/content/facts";
import type { Block, Faq, Source } from "@/lib/content/types";
import { ALL_STORES, STORES, appleName, storePath } from "@/lib/apple/catalog";
import { INTL_CODES } from "@/lib/apple/countries";
import { PLANS } from "@/lib/plans";
import { TRACKING_SINCE_INTL, TRACKING_SINCE_US, hourLabel, siteFacts } from "@/lib/content/siteFacts";
import { busiestWindow, duoRestockTimes } from "@/lib/content/restockTimes";
import { medianBand } from "@/lib/stock/sellouts";
import { alertHref } from "@/lib/seo/enrich";
import { Measured, Points, Stat, StatGrid, StepStrip, Swap } from "@/components/ui/Viz";

export const revalidate = 3600;

const TITLE = "iPhone Duo Pickup Alerts: Build a Store and Configuration Watchlist";
const DESCRIPTION = "Save the iPhone Duo configurations and Apple Stores you would choose. ShelfSpring alerts follow newly detected availability; compare recent listing durations and prepare your pickup order.";
const PATH = "/iphone-duo-stock-alerts";
const WEB_PUSH = "https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers";
const APPLE_HELP = "https://www.apple.com/shop/help/shipping_delivery";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} · ShelfSpring` },
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { type: "article", siteName: "ShelfSpring", title: TITLE, description: DESCRIPTION, url: PATH },
};

const n = (x: number) => x.toLocaleString("en-US");
/** Whole-percent shares; a share under half a percent reads "<1%", never a misleading "0%". */
const pct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
const longDate = (ymd: string) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${ymd}T12:00:00Z`));
const hl = (h: number) => hourLabel(h % 24);

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

export default async function DuoStockAlerts() {
  const [f, facts, rt] = await Promise.all([siteFacts(), getFacts(), duoRestockTimes("us")]);
  const ds = f.duoSellout; // iPhone Duo restocks of the last 7 days that sold out
  const so = rt.sellout; // every confirmed US Duo restock since tracking began that sold out
  const intl = ALL_STORES.length - STORES.length;
  const typical = ds ? `about ${medianBand(ds.medianSec)}` : "not available from a sufficient recent sample";
  const since = longDate(rt.since);
  const bw = rt.peakHour != null && rt.n > 0 ? busiestWindow(rt.byHour) : null;
  const top = rt.topStores[0];
  const topStore = top ? STORES.find((s) => s.storeNumber === top.storeNumber) : undefined;
  const setupHref = alertHref({ model: "duo" });

  const alertTable: Block = { t: "table", head: ["What one alert is", "Detail"], rows: [
    ["Scope", "one Apple Store × one exact configuration (model, storage, color)"],
    ["Confirmation", "two matching answers from apple.com, about 1 second apart"],
    ["Delivery", "push to an enabled device; email fallback when no device is set up. Timing varies."],
    ["Coverage", `${STORES.length} US Apple Stores, plus ${intl} stores in ${INTL_CODES.length} other countries`],
  ], caption: "The same checks for every plan.", source: "Recorded source observations and ShelfSpring alert matching; the two-answer rule is described on [how it works](/how-it-works)" };
  const compareTable: Block = { t: "table", head: ["Signal", "What it tells you", "What to do next"], rows: [
    ["Current listing", "The store and configuration available at the displayed observation time", "Confirm pickup with Apple"],
    ["Recorded return", "A configuration changed back to available in the historical dataset", "Compare stores and recent activity"],
    ["Listing duration", "Time between the source observing availability and observing it gone", "Treat it as historical context, not remaining checkout time"],
    ["Notification", "A new matching return reached ShelfSpring’s alert workflow", "Read the store and configuration, then check Apple"],
  ], caption: "Four signals, four different questions.", source: "ShelfSpring’s inventory pages and notification workflow" };

  const fastLead = ds
    ? `Half within **${ds.medianSec} seconds** over the last 7 days (${n(ds.n)} sold-out Duo restocks, **${pct(ds.within30)}** within 30 s)${so ? `; since ${since}, **${pct(so.within2min)}** of ${n(so.n)} US Duo restocks were gone within 2 minutes` : ""}.`
    : so ? `Within minutes: since ${since}, **${pct(so.within2min)}** of ${n(so.n)} confirmed US iPhone Duo restocks were gone within 2 minutes and ${pct(so.within20min)} within 20, with a median listing of ${so.medianSec} seconds.`
    : "Too early to say: we state sell-out times only once 20 or more confirmed restocks have sold out, and the window does not have them yet.";
  const howLead = "Choose a store and exact configuration. **After a matching recorded return reaches ShelfSpring**, it can trigger a notification. Inventory collection, synchronization and delivery take time; Apple may already have sold out when you open it.";
  const compareLead = "Judge a pickup tool by **what its timestamps and alerts mean**. Current listings, historical patterns and notifications serve different purposes; none is an order confirmation.";
  const setupLead = "Four steps, about two minutes: pick the iPhone, storage and color; tick the stores you can reach; on iPhone add ShelfSpring to your Home Screen; **reserve on apple.com from the push**.";
  const costLead = `Browsing is free; alerts are **$${PLANS.plus.priceUsd}** a month for ${PLANS.plus.limit} (${PLANS.plus.name}), $${PLANS.pro.priceUsd} for ${PLANS.pro.limit} (${PLANS.pro.name}) or $${PLANS.max.priceUsd} for ${PLANS.max.limit} (${PLANS.max.name}), one alert being one store × one exact configuration.`;
  const arrivesLead = `Read the store and configuration, then confirm pickup on apple.com before paying. The recent median listing is ${typical}, but that measures the whole listing—not time remaining when your alert arrives.`;

  const nav = [
    { id: "how-fast", label: "How fast restocks vanish" },
    { id: "how-alerts-work", label: "How alerts work" },
    { id: "compare", label: "Read the signals" },
    { id: "setup", label: "Set up an alert" },
    { id: "cost", label: "Price" },
    { id: "when-it-arrives", label: "When the alert arrives" },
  ];

  const faq: Faq[] = [
    { q: "Do alerts work on iPhone without an app from the App Store?", a: `Yes: add ShelfSpring to your Home Screen from Safari and allow notifications once, a web app with web push that Apple supports for Home Screen web apps ([Apple Developer](${WEB_PUSH}); [install guide](/install)). Without a device set up, alerts arrive by email from alerts@shelfspring.com.` },
    { q: "How many alerts do I need?", a: `Usually ${PLANS.plus.limit} or fewer: one configuration at the stores you can reach, two acceptable colors being two alerts per store. ${PLANS.plus.name} covers ${PLANS.plus.limit}, ${PLANS.pro.name} ${PLANS.pro.limit}, ${PLANS.max.name} ${PLANS.max.limit} ([pricing](/pricing)).` },
    { q: "Can ShelfSpring reserve the phone for me?", a: "No. A notification points to a detected listing. Apple must still show your configuration at that store and accept your order; ShelfSpring cannot reserve stock." },
    { q: "Does a paid plan change how frequently stock is collected?", a: "No. Every plan uses the same synchronized stock feed. Choose a plan by the number of store–configuration alerts you need. Collection, synchronization and notification delivery can all add delay." },
    { q: "Does it cover Apple Stores outside the US?", a: `Yes: ${intl} stores in ${INTL_CODES.length} other countries. The imported historical dataset covers these markets from ${longDate(TRACKING_SINCE_INTL)}; that date is not ShelfSpring’s launch date. Start from [Canada](/ca), [the UK](/uk), [Australia](/au) or [Japan](/jp).` },
  ];

  const sources: Source[] = [
    { label: "Apple: Delivery and Pickup (how in-store pickup works)", url: "https://www.apple.com/shop/shipping-pickup" },
    { label: "Apple: Shipping & Pickup help (what to bring to a pickup)", url: APPLE_HELP },
    { label: "Apple Developer: Sending web push notifications in web apps and browsers", url: WEB_PUSH },
    { label: "Wikipedia: Push technology (what a push notification is)", url: "https://en.wikipedia.org/wiki/Push_technology" },
  ];

  const site = "https://shelfspring.com";
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${site}${PATH}`, url: `${site}${PATH}`, name: TITLE, description: DESCRIPTION, isPartOf: { "@id": `${site}/#website` }, about: { "@id": `${site}/#organization` }, dateModified: f.at },
      {
        "@type": "HowTo", name: "How to set up an iPhone Duo in-stock alert",
        totalTime: "PT2M",
        step: [
          { "@type": "HowToStep", name: "Pick the iPhone, storage and color", text: "One alert is one exact configuration.", url: `${site}${setupHref}` },
          { "@type": "HowToStep", name: "Tick the stores you can reach", text: "Stores are listed nearest first with an estimated drive time." },
          { "@type": "HowToStep", name: "Add ShelfSpring to your Home Screen and allow notifications", text: "On iPhone, alerts are web push notifications to the Home Screen app.", url: `${site}/install` },
          { "@type": "HowToStep", name: "Verify pickup with Apple", text: "After a notification arrives, confirm the named store and configuration on apple.com and complete Apple’s order process." },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pt-8 sm:pt-12">
      <JsonLd data={ld} />

      {/* hero */}
      <section className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="eyebrow mb-4">iPhone Duo · in-stock alerts</div>
          <h1 className="display text-4xl sm:text-6xl">Build an iPhone Duo watchlist for your next pickup opportunity</h1>
          <p className="mt-5 max-w-xl text-lg text-ink-2">Choose the stores you can reach and the exact iPhone Duo you would buy. ShelfSpring watches the synchronized inventory feed for matching returns, so your next check can start with a specific store and configuration.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={setupHref} className="btn btn-primary btn-lg">Set up an iPhone Duo alert</Link>
            <Link href="/how-to-grab-an-iphone-duo-restock" className="btn btn-ghost btn-lg">Pickup checkout guide</Link>
          </div>
        </div>
        <StatGrid cols={2}>
          <Stat value="1 × 1" label="one store and one configuration per alert" tone="accent" />
          <Stat value="Same feed" label="all plans; notification delivery times vary" />
          <Stat value={ds ? `${ds.medianSec}` : "—"} unit={ds ? "s" : undefined} label={ds ? <>median observed listing · last 7 days, {n(ds.n)} restocks</> : "not enough recent sold-out listings"} tone="warn" />
          <Stat value={ds ? pct(ds.within30) : "20–30"} unit={ds ? undefined : "s"} label={ds ? "of last week's restocks gone within 30 seconds" : "some restocks are gone this fast"} tone="warn" />
        </StatGrid>
      </section>

      <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-2 text-sm">
        {nav.map((s) => <a key={s.id} href={`#${s.id}`} className="chip px-3 py-1.5 text-xs">{s.label}</a>)}
      </nav>

      <div className="mt-6 grid gap-5">
        {/* how fast */}
        <Section id="how-fast" h2="How fast does an iPhone Duo restock disappear?" lead={fastLead} facts={facts}>
          {so && (
            <StatGrid cols={3} className="mt-5">
              <Stat value={`${so.medianSec}`} unit="s" label={<>median listing since {since} · {n(so.n)} sold-out restocks</>} tone="warn" />
              <Stat value={pct(so.within2min)} label="gone within 2 minutes" />
              <Stat value={pct(so.within20min)} label="gone within 20 minutes" tone="muted" />
            </StatGrid>
          )}
          {ds ? (
            <>
              <div className="eyebrow mt-6">Illustrative sampling model from the last 7 days’ sold-out listings</div>
              <StatGrid cols={4} className="mt-3">
                <Stat value={n(ds.n)} label="sold-out listings in the 7-day historical sample" tone="accent" />
                <Stat value={pct(ds.caught.m1)} label="checking every 1 minute" tone="muted" />
                <Stat value={pct(ds.caught.m5)} label="checking every 5 minutes" tone="muted" />
                <Stat value={pct(ds.caught.m15)} label="checking every 15 minutes" tone="muted" />
              </StatGrid>
              <Measured>
                A listing that lasts d seconds is seen by a check every T seconds with probability min(1, d ÷ T), over the {n(ds.n)} Duo restocks that sold out in the last 7 days. A restock&apos;s life runs from the check that first saw it to the check that first saw it gone, so every duration is an upper bound and these estimates do not measure any service’s real-world performance or delivery speed.
              </Measured>
            </>
          ) : (
            <p className="pane-2 mt-5 p-4 text-sm text-ink-3">The catch-rate tiles appear once 20 or more confirmed iPhone Duo restocks have sold out within the last 7 days; until then we would rather show nothing than a shaky number.</p>
          )}
          <ol className="mt-5 grid gap-3 sm:grid-cols-2">
            <Swap no="Treat the last restock as current stock" yes="Check the latest listing time" why="History shows where stock returned before. Only a current Apple listing can start a pickup order." />
            <Swap no="Keep every store tab open" yes="Save a practical watchlist" why="Choose stores you can reach and configurations you would buy; alerts identify matching returns after detection." />
          </ol>
          <LinkRow links={[{ label: "Every restock with the seconds it lasted", href: "/iphone-duo-sell-out-times" }]} />
          <Figure id="texting-city-street" />
        </Section>

        {/* how alerts work */}
        <Section id="how-alerts-work" h2="How do ShelfSpring alerts work?" lead={howLead} facts={facts}>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <StepStrip className="lg:grid-cols-2!" steps={[
                { title: "Collect", hint: "source checks cover tracked stores and configurations; every plan uses the same feed" },
                { title: "Confirm", hint: "the first \"available\" is asked again about a second later; a restock counts only when both agree" },
                { title: "Synchronize and notify", hint: <Inline text="new records reach ShelfSpring before delivery to the [Home Screen app](/install); email is a fallback when no device is enabled. Timing can vary." facts={facts} /> },
                { title: "Once", hint: "one push per restock: nothing while it stays listed, nothing for sell-outs or a store's first sighting" },
              ]} />
              <BlockView b={alertTable} facts={facts} />
              <Points items={[
                { text: <Inline text={`On iPhone the notification is a [web push](https://en.wikipedia.org/wiki/Push_technology) to a Home Screen web app, supported in Safari ([Apple Developer](${WEB_PUSH}))`} facts={facts} /> },
                { text: <>Nothing to download · one permission prompt</> },
                { text: <>Read the store name in the banner, then reserve</>, step: true },
              ]} />
            </div>
            <div className="mx-auto w-full max-w-[16rem] lg:mx-0"><AlertBannerMock /></div>
          </div>
          <Figure id="phone-notification" />
        </Section>

        {/* compare */}
        <Section id="compare" h2="What does each stock signal tell you?" lead={compareLead} facts={facts}>
          <BlockView b={compareTable} facts={facts} />
          {ds && (
            <>
              <div className="eyebrow">Historical context for your watchlist</div>
              <StatGrid cols={2} className="mt-3">
                <Stat value={n(ds.n)} label="observed sold-out listings, last 7 days" tone="warn" />
                <Stat value={ds.medianSec} unit="s" label="median whole listing duration; not time left after an alert" tone="accent" />
              </StatGrid>
            </>
          )}
          <Points className="mt-5" items={[
            { text: <>Read the <b className="text-ink">observation time</b> beside the stock table</> },
            { text: <>A notification can arrive after availability changes; it is not a reservation</>, no: true },
            { text: <>Keep a second acceptable store or configuration in your plan</>, step: true },
          ]} />
        </Section>

        {/* setup */}
        <Section id="setup" h2="How do I set up an iPhone Duo alert?" lead={setupLead} facts={facts}>
          <StepStrip className="mt-5 lg:grid-cols-4!" steps={[
            { title: "Pick the iPhone, storage and color", hint: "one alert is one exact configuration; two acceptable colors are two alerts" },
            { title: "Tick the stores you can reach", hint: "nearest first, with an estimated drive time" },
            { title: "Add ShelfSpring to your Home Screen", hint: <Inline text={`on iPhone, then allow notifications ([step by step](/install))`} facts={facts} /> },
            { title: "Reserve from the push", hint: "open apple.com from it and check out with in-store pickup at the store it names" },
          ]} />
          <h3 className="mt-7 text-lg font-semibold">Which stores should I pick?</h3>
          <p className="mt-2 text-ink-2">The two or three you can reach by <b className="text-ink">9 AM</b>, plus the ones that restock most.</p>
          <StatGrid cols={2} className="mt-4">
            {bw
              ? <Stat value={pct(bw.share)} label={<>of the {n(rt.n)} confirmed US Duo restocks since {since} landed between {hl(bw.from)} and {hl(bw.to)} local time</>} tone="accent" />
              : <Stat value="—" label={<>the day-by-day picture is on <Link href="/iphone-duo-restock-times" className="underline underline-offset-2">when the iPhone Duo restocks</Link></>} tone="muted" />}
            {top && topStore
              ? <Stat value={n(top.restocks)} label={<><Link href={storePath(topStore)} className="underline underline-offset-2">{appleName(topStore)}</Link> · most confirmed Duo restocks since {since} · {top.days} days</>} />
              : <Stat value="—" label="the store with the most restocks fills in as they are confirmed" tone="muted" />}
          </StatGrid>
          <Points className="mt-4" items={[
            { text: <>A store you cannot reach in the morning is a weaker pick than a farther one you can</>, no: true },
          ]} />
          <LinkRow links={[{ label: "Which iPhone Duo restocks most", href: "/which-iphone-duo-restocks-most" }, { label: "iPhone Duo near me", href: "/iphone-duo-near-me" }, { label: "When the iPhone Duo restocks", href: "/iphone-duo-restock-times" }]} />
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link href={setupHref} className="btn btn-primary">Set up an iPhone Duo alert</Link>
            <span className="text-sm text-ink-3">Notifications follow detected availability; timing varies.</span>
          </div>
          <Figure id="apple-store-night-vancouver" />
        </Section>

        {/* cost */}
        <Section id="cost" h2="What does it cost?" lead={costLead} facts={facts}>
          <StatGrid cols={3} className="mt-5">
            <Stat value={`$${PLANS.plus.priceUsd}`} unit="/ month" label={<>{PLANS.plus.name} · {PLANS.plus.limit} alerts</>} tone="accent" />
            <Stat value={`$${PLANS.pro.priceUsd}`} unit="/ month" label={<>{PLANS.pro.name} · {PLANS.pro.limit} alerts</>} />
            <Stat value={`$${PLANS.max.priceUsd}`} unit="/ month" label={<>{PLANS.max.name} · {PLANS.max.limit} alerts</>} />
          </StatGrid>
          <Points className="mt-5" items={[
            { text: <><b className="text-ink">{PLANS.plus.limit} alerts</b> = one configuration at {PLANS.plus.limit} stores, or two at five: most people in one metro area</> },
            { text: <>{PLANS.pro.name} and {PLANS.max.name}: several colors, several people or a long drive radius</> },
            { text: <>Every plan uses the same stock feed; live stock and the restock log are free to browse</> },
          ]} />
          <LinkRow links={[{ label: "Pricing", href: "/pricing" }]} />
        </Section>

        {/* when it arrives */}
        <Section id="when-it-arrives" h2="What should I do the moment the alert arrives?" lead={arrivesLead} facts={facts}>
          <StepStrip className="mt-5 lg:grid-cols-4!" steps={[
            { title: "Be signed in before the alert", hint: "Apple Pay or a card and your address saved; typing an address during a restock is how people lose it" },
            { title: "Tap → \"I'll pick it up\"", hint: "at the store named; if it already reads unavailable, try your other stores: a batch often reaches several at once" },
            { title: "Finish checkout", hint: "the reservation is the order; Apple emails when it is ready and states the pickup window" },
            { title: "Bring what Apple asks for", hint: <Inline text={`the order number or QR code from the pickup email and a government-issued photo ID ([Apple: Shipping & Pickup help](${APPLE_HELP}))`} facts={facts} /> },
          ]} />
          <LinkRow links={[{ label: "Prepare the pickup checkout before a return", href: "/how-to-grab-an-iphone-duo-restock" }, { label: "The wider plan: how to get an iPhone Duo", href: "/how-to-get-an-iphone-duo" }, { label: "What the wording on apple.com means", href: "/apple-store-pickup-availability-explained" }]} />
          <div className="mt-5"><Link href={setupHref} className="btn btn-primary">Set up an alert</Link></div>
        </Section>
      </div>

      <div className="mx-auto mt-10 max-w-3xl"><RichFaq items={faq} facts={facts} title="Questions" /></div>
      <div className="mx-auto mt-8 max-w-3xl"><SourceList sources={sources} facts={facts} where={`${n(ALL_STORES.length)} Apple Stores in ${INTL_CODES.length + 1} countries`} since={TRACKING_SINCE_US} /></div>
    </div>
  );
}
