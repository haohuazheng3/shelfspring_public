import { withCuratedMetadata } from "@/lib/seo/curation";
import { GuideLayout } from "@/components/guides/GuideLayout";
/** A practical preparation and verification checklist, separate from timing evidence. */
import type { Metadata } from "next";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { RichFaq, SourceList } from "@/components/content/RichFaq";
import { emptyFacts } from "@/lib/content/facts";
import type { Faq, Source } from "@/lib/content/types";
import { AlertBannerMock, CheckoutSheetMock, RestockWindowMock, StorePickMock, TermsMock, TimeSlotMock } from "@/components/content/CheckoutMocks";
import { PART_INDEX, STORES } from "@/lib/apple/catalog";
import { TRACKING_SINCE_US, siteFacts } from "@/lib/content/siteFacts";
import { busiestWindow, duoRestockTimes, rangeLabel } from "@/lib/content/restockTimes";
import { medianBand } from "@/lib/stock/sellouts";
import { alertHref } from "@/lib/seo/enrich";
import { Do, Dont, Points, Stat, StatGrid, Swap, type Point } from "@/components/ui/Viz";

export const revalidate = 3600;

const PATH = "/how-to-grab-an-iphone-duo-restock";
const TITLE = "Prepare for an iPhone Duo Pickup Return: Checkout Guide";
const SITE = "https://shelfspring.com";
const APPLE_PICKUP = "https://www.apple.com/shop/shipping-pickup";
const APPLE_PAY = "https://support.apple.com/apple-pay";
const APPLE_STORE_APP = "https://apps.apple.com/us/app/apple-store/id375380948";

const n = (x: number) => x.toLocaleString("en-US");
const pct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
const longDate = (ymd: string) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${ymd}T12:00:00Z`));

/** Checkout preparation is guidance, not a promised completion time. */


export async function generateMetadata(): Promise<Metadata> {
  const t = await duoRestockTimes("us");
  const band = t.sellout ? medianBand(t.sellout.medianSec) : null;
  const description = `Prepare Apple’s checkout, shortlist stores and read a pickup alert carefully${band ? `. The historical median listing is ${band}` : ""}. See what to confirm before placing an order.`;
  return withCuratedMetadata("/how-to-grab-an-iphone-duo-restock", {
    title: { absolute: `${TITLE} · ShelfSpring` },
    description,
    alternates: { canonical: PATH },
    openGraph: { type: "article", siteName: "ShelfSpring", title: TITLE, description, url: PATH },
  });
}

/** A keyword line on a step card; `plain` is the sentence the HowTo schema carries. */
type GuidePoint = Point & { plain: string };
interface Step { title: string; points: GuidePoint[]; art: React.ReactNode }

function StepCard({ step, index }: { step: Step; index: number }) {
  return (
    <li id={`step-${index}`} className="pane flex scroll-mt-24 flex-col p-5 sm:p-6">
      <div className="flex items-center gap-3"><span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-[var(--accent-ink)]">{index}</span><h3 className="text-lg font-semibold leading-tight">{step.title}</h3></div>
      <Points items={step.points} className="mt-3" />
      <div className="mt-5 flex flex-1 items-end justify-center pt-8">{step.art}</div>
    </li>
  );
}

/** A compact list of purchase decisions. */
function TapFlow({ taps }: { taps: string[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-2" aria-label="Purchase decisions to verify">
      {taps.map((t, i) => (
        <li key={t} className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-[var(--pane-solid)] py-1 ps-1 pe-3.5 text-sm font-semibold text-ink">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-[var(--accent-ink)]">{i + 1}</span>{t}
          </span>
          {i < taps.length - 1 && <span aria-hidden className="text-ink-3">→</span>}
        </li>
      ))}
    </ol>
  );
}

export default async function GrabRestockGuide() {
  const [t, f] = await Promise.all([duoRestockTimes("us"), siteFacts()]);
  const facts = emptyFacts();
  const sell = t.sellout;
  const band = sell ? medianBand(sell.medianSec) : null;
  /** "in the 60–80 seconds before it sells out" / "in the minute before it sells out". */

  const w = busiestWindow(t.byHour);
  const window = rangeLabel(w.from, w.to);
  const pattern = t.peakHour != null;
  const ds = f.duoSellout;
  const top = t.byPart[0];
  const topItem = top ? PART_INDEX.get(top.partNumber) : undefined;
  const topName = topItem ? `${topItem.storage} ${topItem.color}` : "not enough recorded returns";
  const topShare = top && t.n ? top.restocks / t.n : 0;
  const alert = alertHref({ model: "duo" });
  const taps = ["Exact configuration", "Reachable store", "Suitable collection time", "Order confirmation"];
  const before: Step[] = [
    { title: "Write down acceptable choices", points: [
      { text: <>Choose capacities and colors you would keep, then stores and collection times that fit your day.</>, plain: "Choose acceptable configurations, reachable stores and suitable collection times." },
      pattern ? { text: <>{pct(w.share)} of recorded US returns fell within {window}, in each store’s local time. That concentration is historical.</>, plain: `${pct(w.share)} of recorded US returns fell within ${window}, store local time; this is history, not a schedule.` } : { text: <>The sample does not yet support an hourly pattern.</>, plain: "There is not enough evidence for an hourly pattern." },
      { text: <>Use <Link href="/account#restock-times" className="underline">your saved stores</Link> to keep the comparison relevant.</>, plain: "Compare the history of stores on your own shortlist." },
    ], art: <RestockWindowMock /> },
    { title: "Review your Apple checkout setup", points: [
      { text: <>Use <a href={APPLE_STORE_APP} target="_blank" rel="noopener" className="underline">Apple’s app</a> or apple.com to review the exact device and your account details.</>, plain: "Review the exact device and your account details in Apple’s app or on apple.com." },
      { text: <>Check your normal payment method before attempting a purchase.</>, plain: "Check that your normal payment method is ready to use." },
      { text: <>An open basket or prepared screen does not hold inventory.</>, plain: "An open basket or payment screen does not hold inventory." },
    ], art: <CheckoutSheetMock /> },
    { title: "Read the purchase conditions", points: [
      { text: <>Carrier, financing and trade-in choices can add requirements. Choose them for their terms and total cost.</>, plain: "Review the requirements and total cost of carrier, financing and trade-in choices." },
      { text: <>Read any agreement before accepting it; screens can differ by market and account.</>, plain: "Read agreements before accepting them; checkout can vary by market and account." },
      { text: <>Keep your usual device security settings. Preparation does not require leaving it unlocked.</>, plain: "Keep your usual device security settings." },
    ], art: <TermsMock /> },
  ];
  const during: Step[] = [
    { title: "Match the message to your plan", points: [
      { text: <>Read the store, capacity, color and observation time.</>, plain: "Read the store, capacity, color and observation time in the alert." },
      { text: <>Source collection, synchronization and delivery can delay the message.</>, plain: "A notification can arrive after availability has changed." },
      { text: <>Open the notification link or your existing Apple session, then check the current listing.</>, plain: "Use the notification link or your existing Apple session to check current availability." },
    ], art: <AlertBannerMock /> },
    { title: "Verify the store on Apple", points: [
      { text: <>Confirm that the exact device is offered for pickup at the named location.</>, plain: "Confirm the exact device and pickup location on Apple." },
      { text: <>An earlier observation cannot override Apple’s current checkout.</>, plain: "An earlier observation cannot override Apple’s current checkout." },
      { text: <>If it is unavailable, return to acceptable alternatives or wait for another opening.</>, plain: "If unavailable, check acceptable alternatives or wait for a later opening." },
    ], art: <StorePickMock /> },
    { title: "Choose a collection time you can meet", points: [
      { text: <>Review the offered collection choices and the order total.</>, plain: "Review the collection choices and total price." },
      { text: <>Complete payment only when the device, place and conditions are right for you.</>, plain: "Complete payment only when the device, store and terms meet your needs." },
      { text: <>Follow Apple’s authentication instructions and inspect the result.</>, plain: "Follow Apple’s authentication instructions and check the payment result." },
    ], art: <TimeSlotMock /> },
    { title: "Follow the order messages", points: [
      { text: <>Check Apple’s accepted order and the required pickup confirmation before travelling.</>, plain: "Check Apple’s accepted order and required pickup confirmation before travelling." },
      { text: <>Bring the identification and order information requested for that collection.</>, plain: "Bring the identification and order information Apple requests." },
      { text: <>ShelfSpring cannot confirm an order or change its collection time.</>, plain: "ShelfSpring cannot confirm an Apple order or change its collection time." },
    ], art: <StorePickMock /> },
  ];
  const steps = [...before, ...during];
  const wrong: [string, string][] = [
    ["The listing disappeared", "Revisit your acceptable alternatives. Repeatedly submitting a stale checkout does not create stock."],
    ["The session lost your choices", "Recheck model, capacity, color and store before continuing."],
    ["Payment did not finish clearly", "Inspect Apple’s result and order status before attempting another purchase."],
    ["An order exists, but collection is not ready", "Follow its pickup messages and stated collection instructions before travelling."],
  ];
  const faq: Faq[] = [
    { q: "Must I use the Apple Store app?", a: "You can check apple.com or Apple’s app. Use the route you know and review its current instructions. Accounts, markets and payment choices can produce different checkout steps." },
    { q: "Should I choose a color because it returns more often?", a: `Decide which versions you would keep before comparing their history.${topShare ? ` The US sample from ${longDate(t.since)} attributes ${pct(topShare)} of recorded returns to ${topName}.` : " There is no leading configuration to report from this sample."} That share counts events, not your probability of buying a phone.` },
    { q: "Does a prepared checkout reserve stock?", a: "A basket, selected store or payment screen is preparation. Check the result of Apple’s order process and follow the messages attached to the accepted order." },
    { q: "How should I choose between simultaneous store alerts?", a: "Compare the collection times and travel involved. Choose a suitable order and check its confirmation before considering another. Several open checkouts can make it harder to tell what you have already purchased." },
    { q: "Will an alert leave enough time to buy?", a: "There is no guaranteed interval. The message follows collection, synchronization and delivery. A measured listing duration covers an entire past opening; it is not a countdown that starts when your notification arrives." },
  ];
  const sources: Source[] = [
    { label: "Apple’s “Delivery and Pickup” page, on store pickup and how long an order is held", url: APPLE_PICKUP },
    { label: "Apple Support: Apple Pay (paying with Face ID)", url: APPLE_PAY },
    { label: "App Store: Apple Store app", url: APPLE_STORE_APP },
  ];

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${SITE}${PATH}`, url: `${SITE}${PATH}`, name: TITLE, isPartOf: { "@id": `${SITE}/#website` }, about: { "@id": `${SITE}/#organization` }, dateModified: t.at },
      {
        "@type": "HowTo", name: "How to prepare an iPhone Duo pickup order",
        description: "Prepare acceptable configurations and stores, verify a matching alert against Apple’s listing, and follow the resulting order instructions.",
        supply: [{ "@type": "HowToSupply", name: "Apple Store app or apple.com, signed in, with a chosen payment method" }, { "@type": "HowToSupply", name: "A ShelfSpring alert for the configuration at the stores you can reach" }],
        step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.points.map((p) => (p.no ? `Do not: ${p.plain}` : p.plain)).join(". ") + ".", url: `${SITE}${PATH}#step-${i + 1}` })),
      },
    ],
  };

  return (
    <GuideLayout guide="how-to-grab-an-iphone-duo-restock" contents={[{ id: "budget-h", label: "Read the timing" }, { id: "before", label: "Prepare your setup" }, { id: "during", label: "Follow the checkout" }]}>
      <JsonLd data={ld} />

      {/* hero */}
      <section className="guide-evidence-lead">
        <div>
          <div className="eyebrow mb-4">ShelfSpring · pickup preparation</div>

          <p className="mt-5 max-w-xl text-lg text-ink-2"><b className="text-ink">Decide before the message. Verify after it.</b> Knowing what you would buy reduces decisions during checkout. No fixed tap count or completion time applies to every order.</p>
          <div className="mt-5"><TapFlow taps={taps} /></div>
          {sell && <p className="mt-5 max-w-xl text-sm text-ink-3">The historical sample includes {n(sell.n)} timed US listings, with a median of <b className="text-ink">{sell.medianSec} s</b>. Treat it as context, not a promise about the next return.</p>}
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#before" className="btn btn-primary btn-lg">See the steps</a>
            <Link href={alert} className="btn btn-ghost btn-lg">Set up an alert</Link>
          </div>
        </div>
        <div className="mx-auto w-full max-w-sm"><CheckoutSheetMock /></div>
      </section>

      <section className="pane mt-14 p-6 sm:p-8" aria-labelledby="budget-h">
        <h2 id="budget-h" className="display text-2xl sm:text-4xl">Read the listing duration as context</h2>
        <p className="mt-3 text-ink-2">{sell ? <>The historical median is {band}, based on {n(sell.n)} timed US listings in the dataset from {longDate(t.since)}. {pct(sell.within2min)} were gone within two minutes.</> : <>There are not enough timed sell-outs to summarize a typical listing yet.</>}</p>
        <StatGrid cols={3} className="mt-5">
          <Stat value={sell ? sell.medianSec : "—"} unit={sell ? "s" : undefined} label="median whole listing duration" />
          <Stat value={sell ? n(sell.n) : "—"} label="timed historical listings" tone="accent" />
          <Stat value="Variable" label="collection, synchronization and delivery delay" />
        </StatGrid>
        <p className="mt-5 text-sm text-ink-2">A notification arrives after the original observation. The median does not tell you how much time is left, and a prepared checkout cannot guarantee a reservation. Confirm the exact store, configuration and pickup option with Apple.</p>
        <p className="mt-4 text-xs text-ink-3">Durations are bounded by source observations, including imported history. <Link href="/iphone-duo-sell-out-times" className="underline-offset-2 hover:underline">Inspect the recorded listing durations</Link>.</p>
      </section>

      {/* steps: before */}
      <section id="before" className="mt-16 scroll-mt-24">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 className="display text-2xl sm:text-4xl">Decisions to make before an alert</h2>
          <span className="text-sm text-ink-3">A shortlist, an account check and a review of the purchase conditions</span>
        </div>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {before.map((s, i) => <StepCard key={s.title} step={s} index={i + 1} />)}
        </ol>
      </section>

      {/* steps: during */}
      <section id="during" className="mt-14 scroll-mt-24">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 className="display text-2xl sm:text-4xl">Checks to make after an alert</h2>
          <span className="text-sm text-ink-3">Availability, location, collection time and the order result</span>
        </div>
        <ol className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {during.map((s, i) => <StepCard key={s.title} step={s} index={before.length + i + 1} />)}
        </ol>
      </section>

      {/* our view */}
      <section className="mt-16 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="pane p-6 sm:p-8">
          <h2 className="display text-2xl sm:text-3xl">Keep decisions separate from urgency</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">A short listing can make every choice feel urgent. Set your own constraints first, then use the alert to check a specific possibility.</p>
          <ol className="mt-5 grid gap-3 sm:grid-cols-3">
            <Swap no="Choose terms for fewer clicks" yes="Choose an affordable purchase" why="Read the full price and any agreement before accepting it." />
            <Swap no="Treat an alert as a hold" yes="Read Apple’s current listing" why="The recorded observation can already be out of date." />
            <Swap no="Buy a different phone under pressure" yes="Use your acceptable shortlist" why={topShare ? <>{topName} accounts for {pct(topShare)} of US recorded returns, but that does not make it the right choice for you.</> : <>A suitable phone at a reachable store is the goal; a high event count is only context.</>} />
          </ol>
        </div>
        <div className="pane p-6 sm:p-8">
          <h2 className="display text-2xl sm:text-3xl">If the purchase plan changes</h2>
          <table className="mt-4 w-full text-sm">
            <thead><tr className="text-start text-xs uppercase tracking-wide text-ink-3"><th className="pb-2 font-semibold">If…</th><th className="pb-2 font-semibold">Do…</th></tr></thead>
            <tbody>
              {wrong.map(([a, b]) => (
                <tr key={a} className="border-t border-line align-top">
                  <td className="py-2.5 pe-3 text-ink-3">{a}</td>
                  <td className="py-2.5 font-medium text-ink">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* faster? */}
      <section className="pane mt-6 p-6 sm:p-8">
        <h2 className="display text-2xl sm:text-3xl">Preparation has limits</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">You can decide what to buy and have your checkout details ready. Apple still controls the listing, payment result and order acceptance. ShelfSpring reports observations and never purchases a phone on your behalf.</p>
        <StatGrid cols={3} className="mt-5">
          <Stat value="Exact" label="configuration and store to verify" />
          <Stat value="Variable" label="time from source observation to message" tone="accent" />
          <Stat value="Apple" label="controls the order and collection instructions" tone="muted" />
        </StatGrid>
        <ul className="mt-5 grid gap-2 text-sm text-ink-2 sm:grid-cols-2">
          <li className="flex items-start gap-2"><Do /><span>Save only stores you can reach and configurations you would buy</span></li>
          <li className="flex items-start gap-2"><Do /><span>Source confirmation precedes synchronization and delivery; the notification may be delayed</span></li>
          {ds && <li className="flex items-start gap-2 text-ink-3"><Dont /><span>The separate seven-day sample across all tracked countries contains <b>{n(ds.n)}</b> completed listings; <b>{pct(ds.within30)}</b> were gone within 30 seconds</span></li>}
          <li className="flex items-start gap-2"><Do /><span>Preparation reduces decisions during checkout; Apple still controls order acceptance</span></li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-3"><Link href={alert} className="btn btn-primary">Set up an alert</Link><Link href="/account#restock-times" className="btn btn-ghost">Your stores&apos; restock window</Link><Link href="/how-to-get-an-iphone-duo" className="btn btn-ghost">The wider plan</Link></div>
      </section>


      <div className="mx-auto mt-10 max-w-3xl"><RichFaq items={faq} facts={facts} title="Questions before you act" /></div>
      <div className="mx-auto mt-8 max-w-3xl"><SourceList sources={sources} facts={facts} where={`all ${STORES.length} US Apple Stores`} since={longDate(TRACKING_SINCE_US)} /></div>
    </GuideLayout>
  );
}
