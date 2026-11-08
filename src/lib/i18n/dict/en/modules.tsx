/**
 * English strings: modules — the restock, store and stock modules (src/components/{restocks,stores,stock}).
 *
 * For translators:
 * - `label` is a place phrase the page builds ("in Ohio", "at Apple Somerset", "here"); it already carries its preposition.
 * - Numbers arrive raw (English prints them as the site always has, "1170"); other languages format them with
 *   num() / plural() from @/lib/i18n/format. Durations, times, dates and percentages arrive already formatted.
 * - Functions that return JSX keep the bold runs (<b className="text-ink">) and the passed-in nodes (links, live times).
 * - Check intervals are only ever 15 seconds (every store) and 5 seconds (stores with alerts).
 */
import type { ReactNode } from "react";

const s = (n: number) => (n === 1 ? "" : "s");
/** Thousands grouped ("3,891"): the ledger's numbers are quoted, so they read as prose, not as raw counters. */
const ledgerN = (n: number) => n.toLocaleString("en-US");

export const modules = {
  /** DailyBars: 30 days of restocks (bars) and sell-outs (stacked under them). */
  daily: {
    empty: (label: string, days: number) => `No restock or sell-out has been logged ${label} in the last ${days} days — the chart fills in from the first one.`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `${restocks} restock${s(restocks)} and ${soldouts} sell-out${s(soldouts)} ${label} over the last ${days} days, on ${activeDays} different day${s(activeDays)}.`,
    /** Follows `summary` (leading space). `day` is a short date ("10/26"). */
    busiest: (day: string, restocks: number) => <> The busiest day was <b className="text-ink">{day}</b> with {restocks}.</>,
    /** Screen-reader text of one bar. */
    barAria: (day: string, restocks: number, soldouts: number) => `${day}: ${restocks} restocks, ${soldouts} sell-outs`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day}: ${restocks} restocks · ${soldouts} sell-outs`,
    legendRestocks: "restocks",
    legendSoldouts: "sell-outs",
  },

  /** Last24Hours: "iPhone Duo restocks {label} in the last 24 hours" — sentence, three tiles, a table per configuration. */
  last24: {
    title: (label: string) => `iPhone Duo restocks ${label} in the last 24 hours`,
    /** `when` is a date and time ("Nov 3, 10:00 AM EST" or "Nov 3, 6:10 AM local time"). */
    asOf: (when: string) => `as of ${when}`,
    localTime: (when: string) => `${when} local time`,
    /** Stands in for a store the catalogue no longer has. */
    anAppleStore: "an Apple Store",
    unknown: "The last-24-hours count could not be read just now; the live stock and the restock log on this page are unaffected.",
    none: (label: string, asOf: string) => <><b className="text-ink">No iPhone Duo restock {label} in the last 24 hours</b> (as of {asOf}).</>,
    /**
     * `one`: the place is one store (then `withStores`/`allStores` are not said). `config` "256GB Night Sky",
     * `store` a link to the store of the latest restock (null for one store), `when` its local date and time.
     */
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <>In the last 24 hours the iPhone Duo restocked <b className="text-ink">{`${o.restocks} time${s(o.restocks)}`} {o.one ? o.label : `at ${o.withStores} of the ${o.allStores} Apple Store${s(o.allStores)} ${o.label}`}</b>; the latest: <b className="text-ink">{o.config}</b>{o.store != null && <> at {o.store}</>}, {o.when} local time.</>
    ),
    tileRestocks: "confirmed restocks · 24 h",
    tileConfigsBack: "configurations that came back",
    /** `configs` 0: no configuration came back (then only "stores with a restock"). */
    tileStores: (configs: number, allConfigs: number) => `stores with a restock${configs ? ` · ${configs} of ${allConfigs} configurations` : ""}`,
    /** `store` null on a one-store page. */
    tileLatest: (config: string, store: string | null) => <>latest · {config}{store != null && <> · {store}</>}</>,
    /** The last restock before the 24 hours; `day` its local date ("Nov 1"). */
    tileBefore: (config: string, store: string | null, day: string) => <>last before that · {config}{store != null && <> · {store}</>} · {day}</>,
    tileNoEarlier: "no earlier restock on record",
    caption: (label: string, asOf: string) => `Confirmed restocks of each iPhone Duo configuration ${label}, last 24 hours, as of ${asOf}`,
    thConfig: "Configuration",
    thRestocks: "Restocks",
    thStores: "Stores",
    thLast: "Last restock (local time)",
    thNow: "In stock now",
    /** "2 of 5" stores. */
    ofStores: (n: number, total: number) => `${n} of ${total}`,
    noneIn24: "none in 24 h",
    yes: "yes",
    no: "no",
    countedTitle: "How restocks are counted",
    counted: "A return is a confirmed change from unavailable to available for one store and configuration. Repeated returns are separate events, not a count of phones. The live list answers what is available at the last check. The history shows where listings returned; it does not predict the next delivery.",
    /** `label` null on a one-store page. */
    alert: (label: string | null) => `Set up restock alerts on your phone${label ? ` · ${label}` : ""}`,
  },

  /** RestockClock: when restocks arrive, by local hour and weekday. */
  clock: {
    none: (label: string, days: number) => `No restocks recorded ${label} in the last ${days} days yet.`,
    /** Fewer than 5 restocks, or on fewer than 3 dates. `dates` is set only when it is under 3. */
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `${total} restock${s(total)} ${label} in the last ${days} days${dates != null ? ` (on ${dates} day${s(dates)})` : ""} — too few to call a pattern yet.`,
    /** `hour` "9 AM"; `day` the busiest weekday ("Thursday"), null under 14 days of data. */
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>{total} restocks {label} in the last {days} days. Most arrive around <b className="text-ink">{hour}</b> local time{day ? <>, and <b className="text-ink">{day}</b> is the busiest day</> : null}.</>
    ),
    /** `zone` the time zone's city ("New York") in English; other languages get the zone's own name. */
    byHour: (zone: string) => `By hour · ${zone} time`,
    byWeekday: "By weekday",
    /** Appended to a bar's "9 AM: 3" (leading space). */
    barReported: (n: number) => ` (+${n} reported by other trackers)`,
    barReportedTitle: (bar: string, n: number) => `${bar}: ${n} reported by other trackers`,
    legendOurs: "Recorded returns",
  },

  /** RestockFeed: one card per restock or sell-out. */
  feed: {
    empty: "No restocks recorded yet.",
    available: "Available",
    soldOut: "Sold out",
    /** `time` is the reader's local time ("Today 5:42 PM"). */
    soldOutAt: (time: ReactNode) => <>sold out {time}</>,
    since: (time: ReactNode) => <>since {time}</>,
    restockedAt: (time: ReactNode) => <>restocked {time}</>,
    mapAria: (store: string) => `Show ${store} on the map`,
    map: "Map",
    /** `config` "256GB Night Sky". */
    buyAria: (model: string, config: string) => `Buy the ${model} ${config} on apple.com`,
    buy: "Buy on apple.com",
  },

  /** RestocksByConfig: which configurations came back, most first. */
  byConfig: {
    empty: (label: string, days: number) => `No configuration has restocked ${label} in the last ${days} days, so there is no ranking yet.`,
    intro: (label: string, days: number) => `Which configurations came back ${label} in the last ${days} days, most often first.`,
    times: (n: number) => `${n}×`,
    alert: "Alert me",
  },

  /** SellOutTimes: how fast restocks sell out. Durations arrive formatted ("45–60 s", "2 min 05 s"). */
  sellout: {
    /** `band` "60–80 seconds". */
    typical: (label: string, band: string) => `A typical iPhone Duo restock ${label} sold out in about ${band}.`,
    half: (label: string, duration: string) => `Half of the restocks ${label} sold out within ${duration}.`,
    none: (label: string, days: number) => `No restock ${label} has sold out in the last ${days} days yet.`,
    whatDuo: "iPhone Duo",
    whatAll: "all iPhones",
    tileHalf: (what: string) => <>half gone within · {what}</>,
    tileWithin30: "gone within 30 s",
    tileWithin60: "gone within 1 min",
    tileFastest: (n: number, days: number) => <>fastest · {n} sold-out restocks, {days} d</>,
    caption: (days: number) => `By iPhone, last ${days} days`,
    thIphone: "iPhone",
    thSoldOut: "Sold out",
    thHalf: "Half gone within",
    thWithin30: "≤ 30 s",
    thWithin60: "≤ 1 min",
    thFastest: "Fastest",
    each: "Restock by restock",
    /** `full` "180 s": a bar this long is full width. */
    barNote: (full: string) => `bar = seconds listed · full at ${full}`,
    stillListed: (duration: string) => `still listed · ${duration}`,
    /** A range bounded by the 15-second round rather than two recorded checks. */
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "How this is measured",
    /** `estimated`: some rows are marked ≈. */
    measured: (_estimated: boolean) => { void _estimated; return "Listing duration is bounded by the last available and first unavailable observation. The ≈ marker identifies an estimated interval. Listings shorter than a check interval can be missed; these durations are not guaranteed checkout windows."; },
  },

  /** ConfigTable: every configuration at one store. */
  configTable: {
    title: "Every configuration at this store",
    titleAt: (store: string) => `Every configuration at ${store}`,
    /** `hasRows`: earlier answers are listed below. */
    lookupOff: (hasRows: boolean) => `Apple isn't offering in-store pickup lookups at this store right now${hasRows ? " (the last answers it gave are below)" : ""}`,
    tracked: (n: number) => `${n} configurations tracked`,
    firstSweep: "First sweep in progress — statuses appear within a minute",
    inStock: (n: number, total: number) => `${n} of ${total} in stock`,
    /** Shown when Apple's own wording (its pickup quote) is missing. */
    available: "Available",
    unavailable: "Unavailable",
    noLookup: "no pickup lookup",
    notChecked: "not checked yet",
    /** `ago` ticks ("7s ago"). */
    since: (ago: ReactNode) => <>since {ago}</>,
    lastAvailable: (ago: ReactNode) => <>last available {ago}</>,
    neverHere: "never seen in stock here",
    buy: "Buy",
    alertAria: (model: string, config: string, store: string) => `Alert me when the ${model} ${config} is available at ${store}`,
    alert: "Alert me →",
  },

  /** ModelStoreMatrix: one row per store, one cell per model. */
  matrix: {
    store: "Store",
    checked: "Checked",
    cellTitle: (model: string, n: number, total: number) => `${model}: ${n} of ${total} configurations available`,
  },

  /** NearbyStores: `short` "Duo". */
  nearby: {
    duo: (short: string, n: number) => `${short} · ${n}`,
    noDuo: (short: string) => `no ${short}`,
  },

  /** StockByModel: one card per iPhone at a store. */
  stockByModel: {
    availableNow: (n: number, total: number) => `${n} of ${total} configurations available now`,
    noneNow: (total: number) => `none of ${total} configurations right now`,
    lookupOff: "Apple isn't offering pickup lookups here right now",
    notChecked: "not checked yet",
    more: (n: number) => `+${n}`,
    /** `ago` ticks ("7s ago"). */
    checked: (ago: ReactNode) => <>checked {ago}</>,
    alert: "Alert me →",
  },

  /** StoreBlock: a store in full on a thin region or city page. */
  storeBlock: {
    /** `ago` ticks; then the check intervals (15 s, 5 s with an alert). */
    checked: (ago: ReactNode) => <>{ago} · Frequent inventory updates</>,
    map: "Show on map",
    alert: "Alert me here",
    alsoIn: (region: string) => `Also in ${region}`,
    acrossLine: "Nearest stores across the state line",
    elsewhere: "Nearest stores elsewhere",
  },

  /** StoreInfo / HoursTable: address, hours and today's status (times are 24-hour "10:00"). */
  hours: {
    title: "Hours",
    /** `zone` the time zone's city ("New York"). */
    local: (zone: string) => `Local time · ${zone}`,
    /** After today's status (leading " · "). */
    today: (hours: string, week: string) => ` · today ${hours} · ${week}`,
    directions: "Directions",
    applePage: "apple.com store page",
    liveMap: "Live map",
    storePage: "Store page",
    closed: "Closed",
    everyDay: (hours: string) => `Every day ${hours}`,
    openNow: (closes: string) => `Open now · closes ${closes}`,
    opensAt: (opens: string) => `Opens at ${opens}`,
    /** `next` from nextOpen ("tomorrow at 10:00", "Mon at 10:00"); null if no day opens. */
    closedToday: (next: string | null) => (next ? `Closed today · opens ${next}` : "Closed today"),
    closedNow: (next: string | null) => (next ? `Closed now · opens ${next}` : "Closed now"),
    /** `day` a short weekday ("Mon"); null = tomorrow. */
    nextOpen: (day: string | null, time: string) => `${day ?? "tomorrow"} at ${time}`,
  },

  /** LiveStats: three numbers on the home page. */
  liveStats: {
    inStock: "In stock now",
    storesWith: "Stores w/ stock",
    lastCheck: "Last check",
    none: "—",
  },

  /** StockBoard: stores with a model in stock now. */
  board: {
    summary: (n: number, stores: number, short: string) => `${n} of ${stores} stores have the ${short} in stock`,
    lastCheck: (ago: ReactNode) => <>Last check {ago}</>,
    firstSweep: "First sweep in progress.",
    /** `storage` / `color` null when not filtered. */
    noneListed: (model: string, storage: string | null, color: string | null) => `No store lists the ${model}${storage ? ` ${storage}` : ""}${color ? ` in ${color}` : ""} right now.`,
    more: (n: number) => `+${n}`,
    seen: (ago: ReactNode) => <>Seen {ago}</>,
    loading: "Loading stock",
  },

  /**
   * DuoLedger: the observation ledger a place page opens with (region, city, store, country home, store index and the
   * Duo model pages). `place` arrives as the bare name in the page's language ("Michigan", "Tokyo", "Apple Somerset").
   * Written for an answer engine to lift: a dated verdict, the last confirmed return, four measures of the record,
   * one field note and the last three returns with how long each stayed listed.
   */
  duoLedger: {
    kicker: (place: string) => `Observation ledger · iPhone Duo · ${place}`,
    /** The verdict. `list`: the listing stores (storeItem), joined with "; ". */
    headNone: (o: { n: number; place: string }) => `Not listed for pickup at any of the ${ledgerN(o.n)} Apple Store${s(o.n)} in ${o.place}.`,
    headNoneOne: (place: string) => `${place} currently shows no iPhone Duo configuration available for pickup.`,
    headSome: (o: { k: number; n: number; place: string; list: ReactNode }) => <>Listed for pickup at {ledgerN(o.k)} of the {ledgerN(o.n)} Apple Store{s(o.n)} in {o.place}: {o.list}.</>,
    headSomeOne: (o: { k: number; total: number; place: string; list: string }) => <>{o.place} lists {o.k} of {o.total} iPhone Duo configuration{s(o.total)} for pickup: {o.list}.</>,
    storeItem: (store: ReactNode, configs: number) => <>{store} ({configs} configuration{s(configs)})</>,
    observed: (stamp: string) => `Observed ${stamp}.`,
    /** `lasted`: "listed 5–7 min" / "still listed (12 min)" / null when unknown. */
    lastReturn: (o: { config: string; store: ReactNode | null; when: string; lasted: string | null }) => <>Last confirmed return: <b className="text-ink">{o.config}</b>{o.store != null && <> at {o.store}</>}, {o.when}{o.lasted ? <>, {o.lasted}</> : null}.</>,
    noReturnYet: (place: string, since: string) => `No confirmed iPhone Duo return in ${place} since the record opened on ${since}.`,
    /** The other two models in one clause: stores with any configuration (a place) / configurations here (a store). */
    others: (o: { pro: number; max: number; one: boolean; configs: number }) => (o.one ? `iPhone 18 Pro: ${o.pro} of ${o.configs} configurations listed here; 18 Pro Max: ${o.max} of ${o.configs}.` : `iPhone 18 Pro: listed at ${ledgerN(o.pro)} of these stores; 18 Pro Max: at ${ledgerN(o.max)}.`),
    /* The four measures: breadth and pace of the record, not a fixed hour band */
    mReturns: (since: string) => `confirmed returns since ${since}`,
    mStores: "stores with at least one return",
    mDays: "tracked days with a return",
    mWindow: (pct: string) => `busiest two local hours · ${pct} of the record`,
    mPerDay: "returns per tracked day",
    mMedian: "median listing, from appearing to gone",
    mToday: "returns today, so far",
    secUnit: "s",
    minUnit: "min",
    /** The quotable field note. `range` "9–11 AM", `zone` "Eastern time", `median` "roughly 95 seconds". */
    note: (o: { n: number; stores: number; k: number; place: string; since: string; range: string; zone: string; pct: string; morning: string; busiest: string; busiestN: number; median: string | null; config: string | null; top: number; one: boolean; days: number; tracked: number }) =>
      o.one
        ? `Since ${o.since} ShelfSpring has recorded ${ledgerN(o.n)} confirmed iPhone Duo return${s(o.n)} at ${o.place}, on ${ledgerN(o.days)} of ${ledgerN(o.tracked)} tracked days. The two busiest local hours were ${o.range} (${o.pct} of the record; ${o.morning} fell between 8 AM and noon), the single busiest ${o.busiest} with ${ledgerN(o.busiestN)}.${o.median ? ` Half of the measured listings were gone within ${o.median}.` : ""}${o.config ? ` ${o.config} returned most often (${ledgerN(o.top)} of ${ledgerN(o.n)}).` : ""}`
        : `Across the ${ledgerN(o.stores)} Apple Store${s(o.stores)} in ${o.place}, ShelfSpring has recorded ${ledgerN(o.n)} confirmed iPhone Duo return${s(o.n)} since ${o.since}; ${ledgerN(o.k)} of the stores have had at least one. The two busiest local hours were ${o.range} ${o.zone} (${o.pct} of the record; ${o.morning} fell between 8 AM and noon), the single busiest ${o.busiest} with ${ledgerN(o.busiestN)}.${o.median ? ` Half of the measured listings were gone within ${o.median}.` : ""}${o.config ? ` ${o.config} returned most often (${ledgerN(o.top)} of ${ledgerN(o.n)}).` : ""}`,
    noteFew: (o: { n: number; place: string; since: string; one: boolean; stores: number; days: number; min: number; minDays: number; median: string | null }) =>
      `${ledgerN(o.n)} confirmed iPhone Duo return${s(o.n)} ${o.one ? `at ${o.place}` : `across the ${ledgerN(o.stores)} Apple Store${s(o.stores)} in ${o.place}`} since ${o.since}, on ${ledgerN(o.days)} day${s(o.days)} — under the ${o.min}-return, ${o.minDays}-day threshold ShelfSpring applies before describing a usual hour.${o.median ? ` Half of the measured listings were gone within ${o.median}.` : ""} The returns themselves are in the ledger below.`,
    hourByHour: "Open the hour-by-hour record →",
    ledger: (n: number) => (n === 1 ? "The most recent recorded return" : `The ${n} most recent recorded returns`),
    col: { observed: "Observed (store time)", config: "Configuration", store: "Store", listed: "Listed for" },
    /** Lifetimes: "listed 5–7 min", "listed about 2 min", "still listed (12 min)". */
    secs: (n: number) => `${n} s`,
    mins: (n: number) => `${n} min`,
    listedRange: (low: string, high: string) => `listed ${low}–${high}`,
    listedAbout: (x: string) => `listed about ${x}`,
    stillListed: (x: string) => `still listed (${x})`,
    /** `note` is the check-cadence phrase (pages.common.checkNote). */
    method: (o: { since: string; note: string }) => `Record since ${o.since} · ${o.note} · a return is counted once two consecutive observations agree; a configuration's first appearance never counts.`,
    delivered: (o: { sent: number; stores: number; total: number; days: number; place: string; one: boolean }) => (o.one
      ? `ShelfSpring delivered ${ledgerN(o.sent)} alert${s(o.sent)} to members for returns at ${o.place} in the last ${o.days} days.`
      : `ShelfSpring delivered ${ledgerN(o.sent)} alert${s(o.sent)} to members for returns at ${ledgerN(o.stores)} of the ${ledgerN(o.total)} Apple Store${s(o.total)} in ${o.place} in the last ${o.days} days.`),
    watch: (place: string) => `Watch a configuration in ${place} →`,
    watchOne: "Watch a configuration at this store →",
    unknown: "The observation record could not be read for this request; the live listing above is unaffected.",
    /** "Eastern time" for a US zone the note can name, else "store-local time". */
    zone: (tz: string | null): string => {
      const z: Record<string, string> = { "America/New_York": "Eastern", "America/Detroit": "Eastern", "America/Kentucky/Louisville": "Eastern", "America/Indiana/Indianapolis": "Eastern", "America/Chicago": "Central", "America/Denver": "Mountain", "America/Boise": "Mountain", "America/Phoenix": "Arizona", "America/Los_Angeles": "Pacific", "America/Anchorage": "Alaska", "Pacific/Honolulu": "Hawaii", "America/Puerto_Rico": "Atlantic" };
      return tz && z[tz] ? `${z[tz]} time` : "store-local time";
    },
    /** Under the Duo-only hour chart: every model in one line. */
    allModels: (o: { n: number; days: number; peak: string | null }) => `Every model combined: ${ledgerN(o.n)} recorded return${s(o.n)} over ${o.days} days${o.peak ? `; the largest hour was ${o.peak}` : ""}.`,
  },
};
