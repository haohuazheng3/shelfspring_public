/**
 * English strings: modules — the restock, store and stock modules (src/components/{restocks,stores,stock}).
 *
 * For translators:
 * - `label` is a place phrase the page builds ("in Ohio", "at Apple Somerset", "here"); it already carries its preposition.
 * - Numbers arrive raw (English prints them as the site always has, "1170"); other languages format them with
 *   num() / plural() from @/lib/i18n/format. Durations, times, dates and percentages arrive already formatted.
 * - Functions that return JSX keep the bold runs (<b className="text-ink">) and the passed-in nodes (links, live times).
 * - Check intervals are only ever 15 seconds (every store) and 5 seconds (stores with alerts).
 * - Voice (2026-11-08): an observation ledger. A restock is a "return", a sell-out is the listing going "off the
 *   shelf", a status is "on the shelf" / "off the shelf", a check is a "look". Rows are terse: no filler repeated
 *   on every line. Field order inside rows is set by the components; keep each string short and self-contained.
 */
import type { ReactNode } from "react";

const s = (n: number) => (n === 1 ? "" : "s");
/** Thousands grouped ("3,891"): the ledger's numbers are quoted, so they read as prose, not as raw counters. */
const ledgerN = (n: number) => n.toLocaleString("en-US");

export const modules = {
  /** DailyBars: 30 days of returns (bars) and listings going off the shelf (stacked under them). Day labels are "Nov 5". */
  daily: {
    empty: (label: string, days: number) => `Blank page ${label} for the past ${days} days: no return and no listing gone off the shelf. Bars start with the first entry.`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `${activeDays} of the past ${days} days had a return ${label}: ${restocks} logged in all, ${soldouts} off the shelf again.`,
    /** Follows `summary` (leading space). `day` is a short date ("Nov 5"). */
    busiest: (day: string, restocks: number) => <> Peak date <b className="text-ink">{day}</b>, {restocks} that day.</>,
    /** Screen-reader text of one bar. */
    barAria: (day: string, restocks: number, soldouts: number) => `${day}: ${restocks} returned, ${soldouts} went off the shelf`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day} · ${restocks} returned · ${soldouts} off the shelf`,
    legendRestocks: "returns",
    legendSoldouts: "off the shelf again",
  },

  /**
   * Last24Hours: the 24-hour return window — heading, one sentence (most recent return first), three tiles, and a
   * table per configuration. Column order: configuration, most recent return, returns, stores, on the shelf now.
   */
  last24: {
    title: (label: string) => `iPhone Duo returns ${label}, past 24 hours`,
    /** `when` is a date and time ("Nov 3, 10:00 AM EST" or "Nov 3, 6:10 AM store time"). */
    asOf: (when: string) => `snapshot · ${when}`,
    localTime: (when: string) => `${when} store time`,
    /** Stands in for a store the catalogue no longer has. */
    anAppleStore: "an unlisted Apple Store",
    unknown: "The 24-hour tally didn't load for this request. The shelf status and the return log on this page still stand.",
    none: (label: string, asOf: string) => <><b className="text-ink">A quiet 24 hours {label}:</b> no iPhone Duo return logged in the window ending {asOf}.</>,
    /**
     * `one`: the place is one store (then `withStores`/`allStores` are not said). `config` "256GB Night Sky",
     * `store` a link to the store of the latest return (null for one store), `when` its store-local moment ("Sat, Nov 8, 3:00 PM").
     */
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <>Most recent return: <b className="text-ink">{o.config}</b>, {o.when} on the store clock{o.store != null && <>, logged at {o.store}</>}. <b className="text-ink">{`${o.restocks} return${s(o.restocks)} in the window`}</b>{o.one ? null : <>, at {o.withStores} store{s(o.withStores)} out of {o.allStores} {o.label}</>}.</>
    ),
    tileRestocks: "returns in the window",
    tileConfigsBack: "configurations back on the shelf",
    /** `configs` 0: no configuration came back (then only "stores with a return"). */
    tileStores: (configs: number, allConfigs: number) => `stores with a return${configs ? ` · ${configs}/${allConfigs} configurations` : ""}`,
    /** `store` null on a one-store page; the store is named before the configuration. */
    tileLatest: (config: string, store: string | null) => <>most recent · {store != null && <>{store} · </>}{config}</>,
    /** The last return before the 24 hours; `day` its local date ("Nov 1"). */
    tileBefore: (config: string, store: string | null, day: string) => <>previous return, {day} · {store != null && <>{store} · </>}{config}</>,
    tileNoEarlier: "nothing earlier on record",
    caption: (label: string, asOf: string) => `Returns per iPhone Duo configuration ${label} in the 24 hours up to ${asOf}`,
    thConfig: "Configuration",
    thRestocks: "Returns",
    thStores: "Stores",
    thLast: "Most recent (store clock)",
    thNow: "On the shelf now",
    /** "2/5" stores. */
    ofStores: (n: number, total: number) => `${n}/${total}`,
    noneIn24: "nothing logged",
    yes: "on the shelf",
    no: "off",
    countedTitle: "What counts as a return",
    counted: "A return is a confirmed change from unavailable to available for one store and configuration. Repeated returns are separate events, not a count of phones. The live list answers what is available at the last check. The history shows where listings returned; it does not predict the next delivery.",
    /** `label` null on a one-store page. */
    alert: (label: string | null) => `Set up restock alerts on your phone${label ? ` · ${label}` : ""}`,
  },

  /** RestockClock: when returns arrive, by store-local hour (ticks 12am…9pm) and weekday (Mo…Su, with counts). */
  clock: {
    none: (label: string, days: number) => `No return logged ${label} in the past ${days} days.`,
    /** Fewer than 5 returns, or on fewer than 3 dates. `dates` is set only when it is under 3. */
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `Only ${total} return${s(total)} logged ${label} in ${days} days${dates != null ? `, on ${dates} date${s(dates)}` : ""}: not enough to name a usual hour.`,
    /** `hour` "9 AM"; `day` the busiest weekday ("Thursday"), null under 14 days of data. */
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>Usual return hour {label}: <b className="text-ink">{hour}</b> on the store clock, from {total} returns over {days} days{day ? <>; <b className="text-ink">{day}</b> leads the week</> : null}.</>
    ),
    /** `zone` the time zone's city ("New York") in English; other languages get the zone's own name. */
    byHour: (zone: string) => `Hour of day · ${zone} clock`,
    byWeekday: "Day of week",
    /** Appended to a bar's "9 AM: 3" (leading space). */
    barReported: (n: number) => ` (+${n} outside reports)`,
    barReportedTitle: (bar: string, n: number) => `${bar}: ${n} outside reports`,
    legendOurs: "Recorded returns",
  },

  /** RestockFeed: one journal row per event — when and what kind first, then the configuration, the store, the shelf now. */
  feed: {
    empty: "The return log is empty so far.",
    /** The shelf right now (the row's last field). */
    available: "On the shelf",
    soldOut: "Gone",
    /** The event and its time; `time` is the reader's local time ("Today 5:42 PM"). */
    soldOutAt: (time: ReactNode) => <>cleared · {time}</>,
    since: (time: ReactNode) => <>return · {time}</>,
    restockedAt: (time: ReactNode) => <>return · {time}</>,
    mapAria: (store: string) => `Locate ${store} on the atlas`,
    map: "Locate on the atlas",
    /** `config` "256GB Night Sky". */
    buyAria: (model: string, config: string) => `Order the ${model} ${config} from apple.com`,
    buy: "Order on apple.com",
  },

  /** RestocksByConfig: configurations ranked by returns; a row reads count, configuration, watch link. */
  byConfig: {
    empty: (label: string, days: number) => `Nothing returned ${label} in ${days} days, so there is nothing to rank.`,
    intro: (label: string, days: number) => `Configurations ranked by returns ${label}, past ${days} days.`,
    times: (n: number) => `${n} return${s(n)}`,
    alert: "Watch",
  },

  /**
   * SellOutTimes: how long returns stay on the shelf. Durations arrive formatted ("45–60s", "2m 05s"). The per-model
   * summary is a line per iPhone with inline labels (`thSoldOut` … `thFastest`), not a table.
   */
  sellout: {
    /** `band` "60–80 seconds". */
    typical: (label: string, band: string) => `Median shelf life of an iPhone Duo return ${label}: ${band}, give or take.`,
    half: (label: string, duration: string) => `Half the timed returns ${label} left the shelf within ${duration}.`,
    none: (label: string, days: number) => `No return ${label} has left the shelf in the past ${days} days.`,
    whatDuo: "iPhone Duo",
    whatAll: "every model",
    tileHalf: (what: string) => <>median shelf life · {what}</>,
    tileWithin30: "off the shelf in ≤ 30 s",
    tileWithin60: "off the shelf in ≤ 1 min",
    tileFastest: (n: number, days: number) => <>quickest of {n} timed returns, {days} d</>,
    caption: (days: number) => `Per model, past ${days} days`,
    /* Inline labels of the per-model lines, in this order. */
    thIphone: "Model",
    thSoldOut: "timed",
    thHalf: "median",
    thWithin30: "≤ 30 s:",
    thWithin60: "≤ 1 min:",
    thFastest: "quickest",
    each: "Return by return",
    /** `full` "180s": a bar this long is full width. */
    barNote: (full: string) => `bar length = time on the shelf · ${full} fills it`,
    stillListed: (duration: string) => `still on the shelf · ${duration}`,
    /** A range bounded by the 15-second round rather than two recorded checks. */
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "How the shelf life is bounded",
    /** `estimated`: some rows are marked ≈. */
    measured: (_estimated: boolean) => { void _estimated; return "Listing duration is bounded by the last available and first unavailable observation. The ≈ marker identifies an estimated interval. Listings shorter than a check interval can be missed; these durations are not guaranteed checkout windows."; },
  },

  /** ConfigTable: the shelf check at one store — configuration and price, then our status word and its time, Apple's own pickup wording only when on the shelf. */
  configTable: {
    title: "Shelf check by configuration",
    titleAt: (store: string) => `Shelf check by configuration · ${store}`,
    /** `hasRows`: earlier answers are listed below. */
    lookupOff: (hasRows: boolean) => `Apple has paused pickup lookups for this store${hasRows ? "; the rows below are its last answers" : ""}`,
    tracked: (n: number) => `${n} configurations in the record`,
    firstSweep: "Opening observations now; the first statuses land within a minute",
    inStock: (n: number, total: number) => `on the shelf: ${n} of ${total} tracked`,
    /** The status word of a row (Apple's quote, when there is one, follows separately). */
    available: "On the shelf",
    unavailable: "Off the shelf",
    noLookup: "lookup paused",
    notChecked: "awaiting a first look",
    /** `ago` ticks ("7s ago"). */
    since: (ago: ReactNode) => <>appeared {ago}</>,
    lastAvailable: (ago: ReactNode) => <>last seen {ago}</>,
    neverHere: "never seen here",
    buy: "Order",
    alertAria: (model: string, config: string, store: string) => `Watch the ${model} ${config} at ${store}`,
    alert: "Watch →",
  },

  /** ModelStoreMatrix: one row per store, one count per model (configurations on the shelf). */
  matrix: {
    store: "Location",
    checked: "Last look",
    cellTitle: (model: string, n: number, total: number) => `${model}: ${n} of ${total} configurations on the shelf`,
  },

  /** NearbyStores: a row reads store, distance and city, then the Duo on the shelf. `short` "Duo". */
  nearby: {
    duo: (short: string, n: number) => `${short} on the shelf · ${n}`,
    noDuo: (short: string) => `${short} off the shelf`,
  },

  /** StockByModel: one card per iPhone at a store. */
  stockByModel: {
    availableNow: (n: number, total: number) => `${n}/${total} configurations on the shelf`,
    noneNow: (total: number) => `0/${total} on the shelf`,
    lookupOff: "Pickup lookups paused by Apple for this store",
    notChecked: "awaiting a first look",
    more: (n: number) => `+${n} more`,
    /** `ago` ticks ("7s ago"). */
    checked: (ago: ReactNode) => <>last look {ago}</>,
    alert: "Watch →",
  },

  /** StoreBlock: a store in full on a thin region or city page. */
  storeBlock: {
    /** `ago` ticks; then the check intervals (15 s, 5 s with an alert). */
    checked: (ago: ReactNode) => <>{ago} · Frequent inventory updates</>,
    map: "See on the atlas",
    alert: "Watch this store",
    alsoIn: (region: string) => `More in ${region}`,
    acrossLine: "Closest across the state line",
    elsewhere: "Closest elsewhere",
  },

  /**
   * StoreInfo / HoursTable / ModelStoreMatrix: today's status, the week, address and links (every language, English
   * included, is built from these; times are 24-hour "10:00"; English weekdays print as "Mo", "Tu" …).
   */
  hours: {
    title: "Opening hours",
    /** `zone` the time zone's city ("New York"). */
    local: (zone: string) => `Times are ${zone} local`,
    /** After today's status (leading " · "). */
    today: (hours: string, week: string) => ` · ${hours} today · ${week}`,
    directions: "Get directions",
    applePage: "Apple's listing",
    liveMap: "See it on the atlas",
    storePage: "Store record",
    closed: "shut",
    everyDay: (hours: string) => `Daily ${hours}`,
    openNow: (closes: string) => `Doors open · until ${closes}`,
    opensAt: (opens: string) => `Doors open at ${opens}`,
    /** `next` from nextOpen ("tomorrow 10:00", "Mo 10:00"); null if no day opens. */
    closedToday: (next: string | null) => (next ? `Shut today · reopens ${next}` : "Shut today"),
    closedNow: (next: string | null) => (next ? `Shut for now · reopens ${next}` : "Shut for now"),
    /** `day` a short weekday ("Mo"); null = tomorrow. */
    nextOpen: (day: string | null, time: string) => `${day ?? "tomorrow"} ${time}`,
    /** One day's hours, opening and closing joined by a word rather than a dash ("10:00 to 21:00"). */
    span: (opens: string, closes: string) => `${opens} to ${closes}`,
  },

  /** LiveStats: three numbers on the home page. */
  liveStats: {
    inStock: "On the shelf",
    storesWith: "Stores listing",
    lastCheck: "Last look",
    none: "—",
  },

  /** StockBoard: stores with a model on the shelf now. */
  board: {
    summary: (n: number, stores: number, short: string) => `${short} on the shelf at ${n} of ${stores} stores`,
    lastCheck: (ago: ReactNode) => <>Last look {ago}</>,
    firstSweep: "Opening observations now.",
    /** `storage` / `color` null when not filtered. */
    noneListed: (model: string, storage: string | null, color: string | null) => `No store has the ${model}${storage ? ` ${storage}` : ""}${color ? ` in ${color}` : ""} on the shelf at the moment.`,
    more: (n: number) => `+${n} more`,
    seen: (ago: ReactNode) => <>Logged {ago}</>,
    loading: "Reading the shelves",
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
    others: (o: { pro: number; max: number; one: boolean; configs: number }) => (o.one ? `For comparison, this store shows ${o.pro} of the ${o.configs} iPhone 18 Pro configurations and ${o.max} of the ${o.configs} Pro Max ones.` : `For comparison, the iPhone 18 Pro is on the shelf at ${ledgerN(o.pro)} of these stores and the Pro Max at ${ledgerN(o.max)}.`),
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
    col: { observed: "Seen (store clock)", config: "Configuration", store: "Store", listed: "Shelf time" },
    /** Shelf times: "5–7 min on the shelf", "roughly 2 min on the shelf", "on the shelf for 12 min so far". */
    secs: (n: number) => `${n} s`,
    mins: (n: number) => `${n} min`,
    listedRange: (low: string, high: string) => `${low}–${high} on the shelf`,
    listedAbout: (x: string) => `roughly ${x} on the shelf`,
    stillListed: (x: string) => `on the shelf for ${x} so far`,
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
