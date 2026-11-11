/**
 * English strings: account (dashboard page, restock modules on it, install / checkout / pricing pages). Numbers reach
 * these functions raw and print as the site always has; another language may format them (format.num …). Strings
 * with **bold** / [label](href) render through <Md>.
 */

const s = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export const account = {
  loading: "Loading",
  meta: { title: "My Watchlist" },
  signedInAs: (email: string) => `Account · ${email}`,
  title: "Your watchlist, in one place.",
  /** Short units under the big numbers. */
  units: { s: "s", min: "min", taps: "taps" },

  plan: {
    title: "Membership & billing",
    none: "No active plan · alerts are stored, not sent",
    /** "Plus · 3/10 alerts active", then " · next renewal Dec 1" or " · active until Dec 1" ({date} arrives formatted). */
    summary: (plan: string, on: number, limit: number) => `${plan} · ${on}/${limit} alerts active`,
    renews: (date: string) => ` · next renewal ${date}`,
    ends: (date: string) => ` · active until ${date}`,
  },

  sent: {
    title: "Your notification record",
    last: (ago: string) => `Most recent ${ago}`,
    none: "No deliveries yet",
    empty: "No matching restock has been sent to this account yet. Saved rules start delivering when a paid plan is active and a matching change is confirmed.",
    channel: { push: "notification", email: "email" } as Record<string, string>,
    status: { sent: "delivered", failed: "not delivered", skipped: "skipped" } as Record<string, string>,
  },

  /** The pickup-order checklist card (FastCheckoutCard). */
  fast: {
    title: "Prepare your pickup order",
    sub: "a short checklist before the next useful listing",
    lasts: "median recorded Duo listing duration",
    push: "delivery timing varies; confirm stock with Apple",
    tapsLeft: "remaining for you after the notification arrives",
    steps: [
      { title: "Check your travel range", hint: "Keep only stores you could reach for a confirmed collection." },
      { title: "Know the exact configuration", hint: "Have the model, capacity and color ready before opening Apple." },
      { title: "Review your buying options", hint: "Read Apple’s payment and carrier choices before placing an order." },
      { title: "Check the listing again", hint: "A past observation or notification cannot hold a phone for you." },
      { title: "Wait for the pickup confirmation", hint: "Travel after Apple confirms that the order is ready to collect." },
    ],
    guide: "Read the pickup checklist",
    window: "Your return hours",
  },

  /**
   * The return-hours and time-on-shelf modules (RestockTimes). {zone}: "Eastern" in English
   * (so "… time" follows it); in other languages the full Intl zone name ("日本標準時"), which already says "time".
   * Hours ("9 AM") arrive formatted.
   */
  restock: {
    /** "Restock by restock" on the dashboard: each restock against the member's alerts (lib/alertMarks.ts). */
    mark: { delivered: "Alert delivered", sent: "Alert sent", other: "Not in your alerts", before: "Before your alert" },
    title: "Return hours at your stores",
    /** Every model: "iPhone"; otherwise the models' names joined. */
    anyIphone: "iPhone",
    and: " and ",
    yours: (n: number) => (n === 1 ? "your store" : `your ${n} stores`),
    Yours: (n: number) => (n === 1 ? "Your store" : `Your ${n} stores`),
    otherStores: (n: number) => s(n, "other store"),
    meta: (what: string, stores: number, days: number, zone: string) => `${what} · ${s(stores, "store")} · ${days}-day log · ${zone} time`,
    busiest: (yours: string, then: string | null) => (then ? `most returns at ${yours} · runner-up ${then}` : `most returns at ${yours}`),
    busiestArea: (stores: number, zone: string) => `peak across ${stores} stores keeping ${zone} time`,
    next: (inHours: number) => `upcoming window · ${inHours === 0 ? "within this hour" : `${inHours} h away`}`,
    typical: "median time on the shelf",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `no returns logged at ${yours} · ${days}-day log` : `returns logged at ${yours} · ${days}-day log${pattern ? "" : " · not enough for a pattern"}`),
    byHour: (busiestInGreen: boolean) => `Hour of day${busiestInGreen ? " · peak in green" : ""}`,
    byWeekday: (busiest: string | null) => `Day of week${busiest ? ` · peak ${busiest}` : ""}`,
    /** Screen-reader summary of a chart; {items} are "9 AM 2" / "Monday 1" joined. */
    hourChart: (yours: string, zone: string, items: string) => `Returns by hour of day at ${yours}, ${zone} time: ${items}`,
    weekdayChart: (yours: string, items: string) => `Returns by day of week at ${yours}: ${items}`,
    chartItem: (label: string, n: number, reported: number) => `${label} ${n}${reported ? ` (+${reported} third-party)` : ""}`,
    /** Tooltip over one bar: "10–11 AM: 2 returns logged at your store · 5 across Eastern time · 1 third-party". */
    barTitle: (label: string, n: number, yours: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label}: ${s(n, "return")} logged at ${yours}${area ? ` · ${area.n} across ${area.zone} time` : ""}${reported ? ` · ${reported} third-party` : ""}`,
    now: "now",
    allZone: (stores: number, zone: string) => `Every store keeping ${zone} time (${stores})`,
    /** Starts the other trackers' footnote under the charts. */
    reportMarkBars: "Dashed",
    reportMarkDots: "Hollow dots",
    sellTitle: "How long returns stay on the shelf",
    sellMeta: (what: string, stores: number, days: number) => `${what} · ${s(stores, "store")} · ${days}-day log`,
    /** Completes "A typical iPhone Duo restock … sold out in about 60–80 seconds". */
    sellLabel: (yours: string) => `at ${yours}`,
  },

  /** /checkout/success. */
  success: {
    metaTitle: "Alerts are on",
    isOn: (plan: string) => `${plan} is active`,
    yourPlan: "Your plan",
    received: "Payment confirmed",
    onPlan: (limit: number) => `Room for ${limit} alerts on your watchlist.`,
    planOn: "Your plan is active.",
    pending: "Stripe is still confirming; the plan shows up in your account within a minute.",
    open: "Open my watchlist",
    another: "Add to the watchlist",
    saved: (n: number) => `${n} alert${n === 1 ? "" : "s"} stored · Stripe emails the receipt`,
    pushOn: "Notifications",
    pushNext: "Next step: enable a device",
  },

  /** /install (the guide itself is client: cdict install). */
  install: {
    metaTitle: "Get the app — restock alerts on your Home Screen",
    metaDescription: "Add ShelfSpring to your Home Screen and get a notification the moment an iPhone Duo, 18 Pro or Pro Max is in stock for pickup near you.",
  },

  /** /pricing. Plan names and dollar amounts are not translated (billing is in USD everywhere). */
  pricing: {
    metaTitle: "Watchlist Plans: Choose 10, 20 or 50 Alert Rules",
    metaDescription: "Keep a shortlist of iPhone configurations and reachable stores. ShelfSpring plans start at $5 a month; inventory, maps and recorded changes stay free to browse.",
    title: "A membership for your shortlist.",
    lead: "Keep browsing free. Subscribe when you want the next matching change to come to you. **One rule watches one exact iPhone at one store.**",
    chips: ["Public stock and history stay free", "Same inventory feed on every plan", "Monthly billing in US dollars", "Cancel renewal in your account"],
    fastest: "What a subscription does",
    everyFast: "Alerts are sent after matching availability is detected. Source checks, synchronization and notification delivery can add delay.",
    /** {band} is "60–80 seconds" or "about a minute". */
    historySample: "All tracked countries · last 7 days · {n} completed pickup windows",
    sellsOut: (band: string) => `The observed median iPhone Duo listing lasted **${band}**. This describes the recorded sample, not your next opportunity.`,
    band: (range: string) => `${range} seconds`,
    aboutMinute: "about a minute",
    sameSpeed: "Frequent inventory updates",
    rechecked: "how often your stores are looked at",
    toPhone: "from a confirmed return to your device",
    listing: "median Duo time on the shelf",
    note: { plus: "e.g. one configuration watched at ten stores", pro: "e.g. two configurations, ten stores each", max: "e.g. five configurations, ten stores each" } as Record<string, string>,
    month: "per month",
    alerts: (n: number) => `${n} alert rules`,
    perks: ["Choose exact storage and color combinations", "Edit your reachable stores as plans change", "Browser push with email fallback"],
    cancel: "Renewal can be stopped at any time",
    get: (plan: string) => `Start ${plan}`,
    billing: "Payments run through Stripe, by card or Link. Moving up is billed for the days left; moving down applies from the next renewal.",
    /** The refund policy line, as published (no other refund wording anywhere). */
    refund: "Refund terms: a payment made in the last 7 days with no restock alert delivered since can be refunded in full ([refund policy](/refunds)).",
  },
};
