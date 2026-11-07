import type { ReactNode } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";

export const GUIDE_BRIEFS = {
  "iphone-duo-near-me": {
    category: "Location notebook", title: "Make a shortlist, not a long drive.",
    deck: "Start with the stores you can comfortably reach. Then separate a nearby listing from a configuration you actually want, and check its timestamp before making plans.",
    decisions: [["Set your radius", "A ZIP code or location sorts the finder by distance. Use it as a shortlist; displayed drive times are estimates."], ["Match the phone", "A store may list one color and capacity while the combination you want remains unavailable."], ["Confirm the handoff", "Open Apple’s checkout before travelling. A listing on this page does not hold a phone."]],
    note: "Distance and availability answer different questions. A farther store with your exact configuration may be more useful than the nearest store with a different one.",
  },
  "iphone-duo-back-in-stock": {
    category: "Return-to-stock notebook", title: "A return is a signal. Check what remains.",
    deck: "Read a new restock as a recorded change at one store, for one configuration. Use the current listing alongside the event history to decide what to open next.",
    decisions: [["Read the event", "The restock time tells you when a return was observed; it is not a promise that stock is still there."], ["Check the present", "Look for the same store, storage and color in current availability."], ["Keep a fallback", "If that listing has gone, save the combination or compare another store you can reach."]],
    note: "The useful comparison is event time versus observation time. A busy restock log can coexist with little current availability.",
  },
  "iphone-duo-stock-checker": {
    category: "Availability notebook", title: "Read the listing before you chase it.",
    deck: "A useful stock check has four parts: the model, its exact configuration, the store and the age of the observation. This reference keeps those parts together.",
    decisions: [["Choose precisely", "Use storage and color together. Availability for a model alone may describe a phone you would not buy."], ["Compare locally", "Narrow the list to stores that fit your pickup plans before comparing the wider picture."], ["Finish with Apple", "Apple’s checkout supplies the order and pickup confirmation. ShelfSpring supplies the observation."]],
    note: "An unreadable observation is unknown, not sold out. Read the freshness information before treating an empty list as a decision.",
  },
  "where-to-buy-iphone-duo": {
    category: "Buying-route notebook", title: "Choose the route that fits your deadline.",
    deck: "Store pickup, delivery and another retailer solve different problems. Compare the trade-offs before spending time following a route that does not fit your plans.",
    decisions: [["Need a local pickup?", "Compare the exact configuration at stores you can reach. Confirm it with an Apple order."], ["Can wait for delivery?", "Use the delivery estimate Apple gives your address at checkout; this site does not track that queue."], ["Considering a carrier?", "Check activation, financing and return terms with that seller. Their inventory is outside this dataset."]],
    note: "A restock ranking describes past pickup listings. It cannot compare carrier allocations, predict delivery dates or guarantee the quickest purchase.",
  },
  "iphone-duo-sell-out-times": {
    category: "Timing notebook", title: "How much time does a listing leave you?",
    deck: "Observed listing durations help explain why a phone can appear and disappear between visits. Read them as measurements with limits, rather than a countdown for the next restock.",
    decisions: [["Start with the sample", "A duration needs an observed return and a later sold-out observation. Small samples deserve caution."], ["Compare like for like", "A national median can hide differences between stores, storage sizes and colors."], ["Prepare in advance", "Have your preferred configurations and reachable stores ready. Do not rely on a historical median as a grace period."]],
    note: "Timing measures visibility in the collected observations. It does not reveal unit counts, the moment a shelf was stocked or how long Apple will hold an order.",
  },
  "how-to-get-an-iphone-duo": {
    category: "Pickup planning notebook", title: "Build a plan you can act on.",
    deck: "Decide what you will buy, where you can collect it and what you will do when a listing appears. The evidence below can inform that plan without promising a reservation.",
    decisions: [["Name your trade-offs", "Separate essential storage or color choices from combinations you would also accept."], ["Choose reachable stores", "Keep the list practical. A recorded return is less useful if you cannot collect the order."], ["Prepare the order", "Keep your Apple sign-in and payment details ready, then follow Apple’s pickup instructions after ordering."]],
    note: "More historical returns do not make a store a guaranteed winner. Use the record to decide where to look, and the live listing to decide what to open.",
  },
  "how-to-grab-an-iphone-duo-restock": {
    category: "Checkout preparation notebook", title: "Be ready before the next notification.",
    deck: "The work you can control happens before stock returns: choose your alternatives, prepare your Apple account and know which parts of the checkout still need confirmation.",
    decisions: [["Before the alert", "Check the Apple account, preferred payment method and store options you plan to use."], ["When it arrives", "Confirm the configuration and store on Apple. Availability may change while you are opening the link."], ["After the order", "Wait for Apple’s ready-for-pickup message and follow its identification and collection instructions."]],
    note: "ShelfSpring never checks out for you or reserves stock. A notification gives you a place to look; only the seller can confirm the order.",
  },
  "apple-store-pickup-availability-explained": {
    category: "Pickup terminology notebook", title: "What a pickup listing actually tells you.",
    deck: "“Available” is one step in the purchase process. Keep a public stock observation, an accepted order and a ready-for-pickup message separate when making plans.",
    decisions: [["Observation", "A configuration was listed for pickup at a store when it was checked."], ["Order", "You choose the phone and store on Apple and complete its checkout."], ["Collection", "Apple confirms when the order is ready and tells you what to bring."]],
    note: "A public availability flag is not a view into the stockroom. Staff-only stock, reserved orders and online delivery inventory are outside this feed.",
  },
  "iphone-duo-stock-alerts": {
    category: "Notification notebook", title: "Give every alert a clear job.",
    deck: "A useful alert has an exact configuration, a store you can reach and a delivery channel you have checked. Build a small practical watchlist before expanding it.",
    decisions: [["Specify the match", "Each saved rule pairs a store with a model, storage and color."], ["Choose the channel", "Enable a supported browser’s phone notifications, or use the email fallback when no device is enabled."], ["Check your plan", "Plan capacity controls how many rules can be active. A subscription does not reserve a phone or guarantee delivery time."]],
    note: "A notification follows a matching observed return. Source collection, synchronization, device settings and network delivery all affect when you see it.",
  },
  "which-iphone-duo-restocks-most": {
    category: "Configuration notebook", title: "Find where you can be flexible.",
    deck: "Compare the mix of recorded returns with your own preferences. A configuration that appeared more often in the past is useful context, not an instruction to buy something you do not want.",
    decisions: [["Keep a must-have list", "Start with the storage and colors you would be happy to own."], ["Read the distribution", "Compare restock shares, the observation window and the stores covered by the sample."], ["Watch sensible alternatives", "Add a second configuration only when it fits your needs and your plan’s rule capacity."]],
    note: "A restock is a change in availability, not a count of phones delivered. Shares describe recorded events and can change as more observations arrive.",
  },
  "how-it-works": {
    category: "Inside ShelfSpring", title: "From an observation to your next move.",
    deck: "ShelfSpring brings collected pickup listings, their recorded changes and your saved preferences into one place. Here is what happens between a store showing stock and an alert reaching you.",
    decisions: [["Observe", "Inventory observations arrive from the shared collection feed with their original timestamps."], ["Interpret", "Current availability and historical returns answer different questions; neither is a reservation."], ["Follow", "Saved rules match a store and configuration. Eligible new returns enter the notification flow."]],
    note: "The inventory source is shared; ShelfSpring accounts, billing and alert settings are separate. Imported history helps explain patterns and never sends old restock notifications.",
  },
} as const;
export type GuideKey = keyof typeof GUIDE_BRIEFS;

export function GuideLayout({ guide, contents, children }: { guide: GuideKey; contents: { id: string; label: string }[]; children: ReactNode }) {
  const brief = GUIDE_BRIEFS[guide];
  return <div className="field-page guide-page">
    <header className="guide-intro">
      <div className="field-kicker">{guide !== "how-it-works" && guide !== "apple-store-pickup-availability-explained" ? "iPhone Duo / " : ""}{brief.category}</div>
      <h1 className="field-title">{brief.title}</h1>
      <p className="field-lead">{brief.deck}</p>
    </header>
    <ol className="guide-decisions">{brief.decisions.map(([title, copy], index) => <li key={title}><span className="guide-decision-number" aria-hidden="true">0{index + 1}</span><div><h2>{title}</h2><p>{copy}</p></div></li>)}</ol>
    <div className="guide-reading-layout">
      <aside className="guide-index">
        <nav aria-label="In this notebook"><div className="eyebrow">In this notebook</div><ol>{contents.map((item, index) => <li key={item.id}><a href={`#${item.id}`}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{item.label}</a></li>)}</ol></nav>
        <div className="guide-margin-note"><div className="eyebrow">Keep in mind</div><p>{brief.note}</p></div>
        <Link href="/stock/iphone-duo" className="guide-index-link">Open the live stock board <span aria-hidden="true">↗</span></Link>
      </aside>
      <article className="guide-reading">{children}</article>
    </div>
  </div>;
}
