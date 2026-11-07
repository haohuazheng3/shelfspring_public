/**
 * English strings: account (dashboard page, restock modules on it, install / checkout / pricing pages). Numbers reach
 * these functions raw and print as the site always has; another language may format them (format.num …). Strings
 * with **bold** / [label](href) render through <Md>.
 */

const s = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export const account = {
  loading: "Loading",
  meta: { title: "My Watchlist" },
  signedInAs: (email: string) => `Signed in as ${email}`,
  title: "Your watchlist, in one place.",
  /** Short units under the big numbers. */
  units: { s: "s", min: "min", taps: "taps" },

  plan: {
    title: "Membership & billing",
    none: "No plan yet: alerts are off",
    /** "Plus · 3 of 10 alerts on", then " · renews Dec 1" or " · ends Dec 1" ({date} arrives formatted). */
    summary: (plan: string, on: number, limit: number) => `${plan} · ${on} of ${limit} alerts on`,
    renews: (date: string) => ` · renews ${date}`,
    ends: (date: string) => ` · ends ${date}`,
  },

  sent: {
    title: "Your notification record",
    last: (ago: string) => `Last one ${ago}`,
    none: "Nothing sent yet",
    empty: "No matching restock has been sent to this account yet. Saved rules start delivering when a paid plan is active and a matching change is confirmed.",
    channel: { push: "notification", email: "email" } as Record<string, string>,
    status: { sent: "sent", failed: "failed", skipped: "skipped" } as Record<string, string>,
  },

  /** "Reserve it in 20 seconds" (FastCheckoutCard). */
  fast: {
    title: "Prepare your pickup order",
    sub: "a short checklist before the next useful listing",
    lasts: "median recorded Duo listing duration",
    push: "delivery timing varies; confirm stock with Apple",
    tapsLeft: "left for you once the push lands",
    steps: [
      { title: "Check your travel range", hint: "Keep only stores you could reach for a confirmed collection." },
      { title: "Know the exact configuration", hint: "Have the model, capacity and color ready before opening Apple." },
      { title: "Review your buying options", hint: "Read Apple’s payment and carrier choices before placing an order." },
      { title: "Check the listing again", hint: "A past observation or notification cannot hold a phone for you." },
      { title: "Wait for the pickup confirmation", hint: "Travel after Apple confirms that the order is ready to collect." },
    ],
    guide: "The 2-minute guide",
    window: "Your restock window",
  },

  /**
   * "When your stores restock" and "How fast your restocks sell out" (RestockTimes). {zone}: "Eastern" in English
   * (so "… time" follows it); in other languages the full Intl zone name ("日本標準時"), which already says "time".
   * Hours ("9 AM") arrive formatted.
   */
  restock: {
    title: "When your stores restock",
    /** Every model: "iPhone"; otherwise the models' names joined. */
    anyIphone: "iPhone",
    and: " and ",
    yours: (n: number) => (n === 1 ? "your store" : `your ${n} stores`),
    Yours: (n: number) => (n === 1 ? "Your store" : `Your ${n} stores`),
    otherStores: (n: number) => s(n, "other store"),
    meta: (what: string, stores: number, days: number, zone: string) => `${what} · ${s(stores, "store")} · last ${days} days · ${zone} time`,
    busiest: (yours: string, then: string | null) => (then ? `busiest hour at ${yours} · then ${then}` : `busiest hour at ${yours}`),
    busiestArea: (stores: number, zone: string) => `busiest across all ${stores} stores on ${zone} time`,
    next: (inHours: number) => `next window · ${inHours === 0 ? "this hour" : `in ${inHours} h`}`,
    typical: "typical listing before it sells out",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `no restocks at ${yours} yet · last ${days} days` : `restocks at ${yours} · last ${days} days${pattern ? "" : " · too few for a pattern"}`),
    byHour: (busiestInGreen: boolean) => `By hour${busiestInGreen ? " · busiest in green" : ""}`,
    byWeekday: (busiest: string | null) => `By weekday${busiest ? ` · busiest ${busiest}` : ""}`,
    /** Screen-reader summary of a chart; {items} are "9 AM 2" / "Monday 1" joined. */
    hourChart: (yours: string, zone: string, items: string) => `Restocks by hour at ${yours}, ${zone} time: ${items}`,
    weekdayChart: (yours: string, items: string) => `Restocks by weekday at ${yours}: ${items}`,
    chartItem: (label: string, n: number, reported: number) => `${label} ${n}${reported ? ` (+${reported} reported by other trackers)` : ""}`,
    /** Tooltip over one bar: "10–11 AM: 2 restocks at your store · 5 across Eastern time · 1 reported by other trackers". */
    barTitle: (label: string, n: number, yours: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label}: ${s(n, "restock")} at ${yours}${area ? ` · ${area.n} across ${area.zone} time` : ""}${reported ? ` · ${reported} reported by other trackers` : ""}`,
    now: "now",
    allZone: (stores: number, zone: string) => `All ${stores} stores on ${zone} time`,
    /** Starts the other trackers' footnote under the charts. */
    reportMarkBars: "Dashed",
    reportMarkDots: "Hollow dots",
    sellTitle: "How fast your restocks sell out",
    sellMeta: (what: string, stores: number, days: number) => `${what} · ${s(stores, "store")} · last ${days} days`,
    /** Completes "A typical iPhone Duo restock … sold out in about 60–80 seconds". */
    sellLabel: (yours: string) => `at ${yours}`,
  },

  /** /checkout/success. */
  success: {
    metaTitle: "Alerts are on",
    isOn: (plan: string) => `${plan} is on`,
    yourPlan: "Your plan",
    received: "Payment received",
    onPlan: (limit: number) => `${limit} alerts on your plan.`,
    planOn: "Your plan is on.",
    pending: "Your subscription will appear in your account within a minute.",
    open: "Open my alerts",
    another: "Add another alert",
    saved: (n: number) => `${n} alert${n === 1 ? "" : "s"} saved · receipt from Stripe`,
    pushOn: "Notifications",
    pushNext: "Next: alerts on your phone",
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
    rechecked: "your stores re-checked",
    toPhone: "confirmed restock to your phone",
    listing: "typical Duo listing, listed to gone",
    note: { plus: "1 iPhone × 10 stores", pro: "2 iPhones × 10 stores", max: "5 iPhones × 10 stores" } as Record<string, string>,
    month: "/ month",
    alerts: (n: number) => `${n} alerts`,
    perks: ["Choose exact storage and color combinations", "Edit your reachable stores as plans change", "Browser push with email fallback"],
    cancel: "Cancel anytime",
    get: (plan: string) => `Get ${plan}`,
    billing: "Stripe billing · card or Link · plan changes prorated",
    /** The refund policy line, as published (no other refund wording anywhere). */
    refund: "Not for you? [Full refund within 7 days](/refunds) if no restock alert has reached you yet",
  },
};
