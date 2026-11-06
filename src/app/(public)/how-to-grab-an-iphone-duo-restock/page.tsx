/**
 * /how-to-grab-an-iphone-duo-restock: the pickup checkout guide, told in pictures and keywords. Everything except the
 * last four taps is done before the restock — Apple's checkout staged on the exact configuration, kept open through
 * the hour the reader's stores usually restock — so the push leaves Pickup, the store, the first slot and Apple Pay.
 * Each step is a title, two or three keyword lines and a hand-drawn illustration (CheckoutMocks), never Apple's
 * screens; the sentences live in the FAQ and the HowTo schema. Every number is live.
 */
import type { Metadata } from "next";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { Figure } from "@/components/content/Figure";
import { RichFaq, SourceList } from "@/components/content/RichFaq";
import { emptyFacts } from "@/lib/content/facts";
import type { Faq, Source } from "@/lib/content/types";
import { AlertBannerMock, AutoLockMock, CheckoutSheetMock, RestockWindowMock, StorePickMock, TermsMock, TimeSlotMock } from "@/components/content/CheckoutMocks";
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
const WIKI_APPLE_PAY = "https://en.wikipedia.org/wiki/Apple_Pay";

const n = (x: number) => x.toLocaleString("en-US");
const pct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
const longDate = (ymd: string) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${ymd}T12:00:00Z`));

/** Checkout preparation is guidance, not a promised completion time. */


export async function generateMetadata(): Promise<Metadata> {
  const t = await duoRestockTimes("us");
  const band = t.sellout ? medianBand(t.sellout.medianSec) : null;
  const description = `Prepare Apple’s checkout, shortlist stores and read a pickup alert carefully${band ? `. The historical median listing is ${band}` : ""}. See what to confirm before placing an order.`;
  return {
    title: { absolute: `${TITLE} · ShelfSpring` },
    description,
    alternates: { canonical: PATH },
    openGraph: { type: "article", siteName: "ShelfSpring", title: TITLE, description, url: PATH },
  };
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

/** The four taps as a row of numbered pills. */
function TapFlow({ taps }: { taps: string[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-2" aria-label="The four taps">
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
  const taps = ["Pickup – In-Store", "The store it named", "First slot", "Apple Pay"];

  const before: Step[] = [
    {
      title: "Find your window",
      points: [
        pattern
          ? { text: <><b className="text-ink">{pct(w.share)}</b> of US Duo restocks land <b className="text-ink">{window}</b>, store local time</>, plain: `${pct(w.share)} of US iPhone Duo restocks land ${window} in the store's local time` }
          : { text: <>The hour pattern is on every store page</>, plain: "The hour pattern is on every store page" },
        { text: <>Members: <Link href="/account#restock-times" className="underline underline-offset-2">your stores&apos; own hours</Link></>, plain: "Members see their own stores' hours on the dashboard" },
        { text: <>Be staged <b className="text-ink">10 minutes early</b></>, plain: "Be staged ten minutes before the window opens" },
      ],
      art: <RestockWindowMock />,
    },
    {
      title: "Stage the checkout",
      points: [
        { text: <><a href={APPLE_STORE_APP} target="_blank" rel="noopener" className="underline underline-offset-2">Apple Store app</a> · exact <b className="text-ink">storage + colour</b></>, plain: "In the Apple Store app choose the exact storage and colour" },
        { text: <>Through to <b className="text-ink">Delivery &amp; Pickup</b> · ZIP and <a href={APPLE_PAY} target="_blank" rel="noopener" className="underline underline-offset-2">Apple Pay</a> set</>, plain: "Go as far as the Delivery & Pickup sheet with ZIP, address and Apple Pay set" },
        { text: <>Leave delivery selected · <b className="text-ink">stay on this sheet</b></>, plain: "Leave delivery selected and stay on this sheet" },
      ],
      art: <CheckoutSheetMock />,
    },
    {
      title: "Tick terms · keep it awake",
      points: [
        { text: <>Carrier or financing? Tick <b className="text-ink">I agree</b> now</>, plain: "If you chose a carrier plan or financing, tick I agree to the above terms now" },
        { text: <>Better: <b className="text-ink">Unlocked, paid in full</b> → no box at all</>, plain: "Unlocked and paid in full has no agreement box" },
        { text: <>Auto-Lock → <b className="text-ink">Never</b> · touch the sheet every 10–15 min</>, plain: "Set Auto-Lock to Never for the window and touch the sheet every 10–15 minutes" },
      ],
      art: <TermsMock />,
    },
  ];
  const during: Step[] = [
    {
      title: "Read it, don't tap it",
      points: [
        { text: <>A matching return reaches ShelfSpring before the notification is delivered; timing varies</>, plain: "Notifications follow source collection and synchronization, with variable delivery delay" },
        { text: <>Tapping it = Safari + a fresh checkout</>, plain: "Tapping the notification opens apple.com in Safari, a fresh checkout", no: true },
        { text: <>Read the <b className="text-ink">store name</b> → swipe to the app</>, plain: "Read the store name and swipe back to the Apple Store app" },
      ],
      art: <AlertBannerMock />,
    },
    {
      title: "Pickup → the store named",
      points: [
        { text: <>Tap <b className="text-ink">Pickup – In-Store</b></>, plain: "Tap Pickup – In-Store on the sheet" },
        { text: <><b className="text-ink">Available Today</b> → tap it</>, plain: "Tap the store the alert named, showing Available Today" },
        { text: <>Still unavailable? Back → Pickup again</>, plain: "If the row still reads unavailable, back out and tap Pickup again" },
      ],
      art: <StorePickMock />,
    },
    {
      title: "First slot",
      points: [
        { text: <>Take the <b className="text-ink">first time</b> offered</>, plain: "Take the first pickup time Apple offers" },
        { text: <>Every slot = the same phone</>, plain: "Every slot is the same phone" },
        { text: ds ? <><b className="text-ink">{pct(ds.within30)}</b> of last week&apos;s restocks gone within 30 s</> : <>Some restocks are gone within 30 s</>, plain: ds ? `${pct(ds.within30)} of last week's Duo restocks were gone within 30 seconds` : "Some restocks are gone within 30 seconds" },
      ],
      art: <TimeSlotMock />,
    },
    {
      title: "Apple Pay · done",
      points: [
        { text: <>Double-click · Face ID · <b className="text-ink">reserved</b></>, plain: "Double-click the side button, Face ID, and the order is placed" },
        { text: <>Face ID missed? Passcode, <b className="text-ink">not</b> a re-tap</>, plain: "If Face ID misses, type the passcode; do not re-tap the pay button" },
        { text: <>Bring the QR code + photo ID</>, plain: "Bring the order's QR code and a photo ID to the store" },
      ],
      art: <AutoLockMock />,
    },
  ];
  const steps = [...before, ...during];

  const wrong: [string, string][] = [
    ["Sheet reset · terms un-ticked", "Rebuild now · touch it every 10–15 min"],
    ["Pickup still says unavailable", "Back → tap Pickup again (fresh query)"],
    ["Slot gone", "Next slot · none? wait for the next alert"],
    ["Face ID missed", "Passcode · never re-tap Pay"],
    ["Alert names another colour", "Decide now · ~10 s to change on the sheet"],
  ];

  const faq: Faq[] = [
    { q: "Does this work on apple.com in Safari, or on a Mac?", a: "Yes: the same Delivery & Pickup sheet exists on apple.com, so stage it in Safari on an iPhone, iPad or a Mac with Apple Pay. A second device with its own staged checkout is a reasonable backup, so long as you complete only one order." },
    { q: "Carrier plan or unlocked?", a: "Unlocked, paid in full, is the fewest taps and the fewest things that can fail at the last second: no carrier agreement to tick, no eligibility check. A carrier plan works, but tick the agreement before the window and expect to tick it again if the sheet reloads." },
    { q: "What if the alert is for a different storage or color than I staged?", a: `Changing the configuration on the sheet costs about ten seconds, so decide now whether you would take it. Stage the configuration that restocks most${topShare ? ` (${topName}, ${pct(topShare)} of US Duo restocks since ${longDate(t.since)})` : ""} and set alerts for exactly that configuration at two or three stores ([which configuration restocks most](/which-iphone-duo-restocks-most)).` },
    { q: "Two stores restocked at once — which do I pick?", a: "The nearer one, without thinking: a reservation is only useful at a store you will reach in the pickup window. Set alerts only at stores you can get to, and the question rarely comes up." },
    { q: "Can ShelfSpring reserve it for me?", a: "No. ShelfSpring can notify you of a detected listing. Apple must still show that configuration at that store and accept your order; the alert cannot hold inventory." },
  ];
  const sources: Source[] = [
    { label: "Apple: Delivery and Pickup (how in-store pickup and the hold work)", url: APPLE_PICKUP },
    { label: "Apple Support: Apple Pay (paying with Face ID)", url: APPLE_PAY },
    { label: "App Store: Apple Store app", url: APPLE_STORE_APP },
    { label: "Wikipedia: Apple Pay", url: WIKI_APPLE_PAY },
  ];

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${SITE}${PATH}`, url: `${SITE}${PATH}`, name: TITLE, isPartOf: { "@id": `${SITE}/#website` }, about: { "@id": `${SITE}/#organization` }, dateModified: t.at },
      {
        "@type": "HowTo", name: "How to prepare an iPhone Duo pickup order",
        description: `Stage Apple's checkout on the exact configuration before the restock window, then answer the alert with four taps: Pickup – In-Store, the store the alert named, the first time slot, Apple Pay. A typical iPhone Duo listing lasts ${band}.`,
        supply: [{ "@type": "HowToSupply", name: "Apple Store app or apple.com, signed in, with Apple Pay set up" }, { "@type": "HowToSupply", name: "A ShelfSpring alert for the configuration at the stores you can reach" }],
        step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.points.map((p) => (p.no ? `Do not: ${p.plain}` : p.plain)).join(". ") + ".", url: `${SITE}${PATH}#step-${i + 1}` })),
      },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:pt-12">
      <JsonLd data={ld} />

      {/* hero */}
      <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="eyebrow mb-4">ShelfSpring · pickup preparation</div>
          <h1 className="display text-4xl sm:text-6xl">Be ready to check the next iPhone Duo pickup listing</h1>
          <p className="mt-5 max-w-xl text-lg text-ink-2"><b className="text-ink">Stage Apple&apos;s checkout before the restock.</b> The alert then leaves four taps.</p>
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
          <h2 className="display text-2xl sm:text-4xl">Before the window</h2>
          <span className="text-sm text-ink-3">Three things · 10 minutes before your stores&apos; hour</span>
        </div>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {before.map((s, i) => <StepCard key={s.title} step={s} index={i + 1} />)}
        </ol>
      </section>

      {/* steps: during */}
      <section id="during" className="mt-14 scroll-mt-24">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 className="display text-2xl sm:text-4xl">When the alert comes</h2>
          <span className="text-sm text-ink-3">Four taps · nothing else until Apple&apos;s confirmation is on screen</span>
        </div>
        <ol className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {during.map((s, i) => <StepCard key={s.title} step={s} index={before.length + i + 1} />)}
        </ol>
      </section>

      {/* our view */}
      <section className="mt-16 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="pane p-6 sm:p-8">
          <h2 className="display text-2xl sm:text-3xl">Where we would tighten it</h2>
          <p className="mt-2 text-sm text-ink-2">The shape is right: stage everything, leave four taps. Three swaps take the most seconds off it.</p>
          <ol className="mt-5 grid gap-3 sm:grid-cols-3">
            <Swap no="Carrier plan + installments" yes="Unlocked, paid in full" why="No agreement box, no eligibility check at the finish line." />
            <Swap no="Tap the notification" yes="Read it, swipe to the app" why="The push opens apple.com in Safari from scratch; the staged sheet lives in the app." />
            <Swap no="Stage any configuration" yes="Stage the one your alerts are on" why={topShare ? <>{topName} is {pct(topShare)} of US Duo restocks; a mismatch costs ~10 s.</> : <>Alerts on the staged configuration, at two or three stores; a mismatch costs ~10 s.</>} />
          </ol>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="chip chip-sm pointer-events-none">Also: Auto-Lock → Never (saves 3–4 s)</span>
            <span className="chip chip-sm pointer-events-none">Second device staged as backup · complete one order</span>
          </div>
        </div>
        <div className="pane p-6 sm:p-8">
          <h2 className="display text-2xl sm:text-3xl">Where it goes wrong</h2>
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
        <h2 className="display text-2xl sm:text-3xl">Is there anything faster?</h2>
        <p className="mt-2 text-sm text-ink-2"><b className="text-ink">For a person, not really.</b> The earliest honest signal is the push; the rest is practice.</p>
        <StatGrid cols={3} className="mt-5">
          <Stat value="8–12" unit="s" label="Human floor: push + four taps, eyes already on the sheet" />
          <Stat value="4" label="pickup choices to check in this guide" tone="accent" />
          <Stat value="✗" label="Scripts that order for you: break Apple's terms, risk the account. Not built here." tone="muted" />
        </StatGrid>
        <ul className="mt-5 grid gap-2 text-sm text-ink-2 sm:grid-cols-2">
          <li className="flex items-start gap-2"><Do /><span>Save only stores you can reach and configurations you would buy</span></li>
          <li className="flex items-start gap-2"><Do /><span>Source confirmation precedes synchronization and delivery; the notification may be delayed</span></li>
          {ds && <li className="flex items-start gap-2 text-ink-3"><Dont /><span>The last 7 days contain <b>{n(ds.n)}</b> timed listings; <b>{pct(ds.within30)}</b> were gone within 30 seconds</span></li>}
          <li className="flex items-start gap-2"><Do /><span>Preparation reduces decisions during checkout; Apple still controls order acceptance</span></li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-3"><Link href={alert} className="btn btn-primary">Set up an alert</Link><Link href="/account#restock-times" className="btn btn-ghost">Your stores&apos; restock window</Link><Link href="/how-to-get-an-iphone-duo" className="btn btn-ghost">The wider plan</Link></div>
      </section>

      <div className="mx-auto mt-10 max-w-3xl"><Figure id="phone-card-payment" /></div>
      <div className="mx-auto mt-10 max-w-3xl"><RichFaq items={faq} facts={facts} title="Questions" /></div>
      <div className="mx-auto mt-8 max-w-3xl"><SourceList sources={sources} facts={facts} where={`all ${STORES.length} US Apple Stores`} since={longDate(TRACKING_SINCE_US)} /></div>
    </div>
  );
}
