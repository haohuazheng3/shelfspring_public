import { withShelfContent } from "@/lib/seo/localizedCopy";
/**
 * English strings: content — the SEO building blocks (FAQ, browse/related rows, stat strips, product parts, sources,
 * live widgets), the enrich helpers (opening hours, durations, FAQ answers, titles), live {{tokens}}
 * (lib/content/facts.ts), the restock-pattern sentence (lib/content/siteFacts.ts) and photo alt text.
 *
 * For translators: arguments arrive already written for the language — numbers formatted, durations, distances,
 * store, city and colour names in their local form, counts with their noun ("31 restocks", built from the `{ one,
 * other }` forms here, "#" = the number). A translation arranges words around them. Functions that return JSX keep
 * the same elements: only the words around `{…}` change. Never translate model names (iPhone Duo, 18 Pro, 18 Pro Max),
 * storage sizes, "Apple Store", "ShelfSpring" or apple.com. Check intervals are only ever 15 and 5 seconds.
 */
import type { ReactNode } from "react";
import type { Forms } from "@/lib/i18n/format";
import photoList from "@/content/images.json";

/** Plural forms of one phrase ("#" = the number); a language without plurals gives `other` only. */
const f = (x: Forms): Forms => x;

/** The page a FAQ or explainer is about. */
type Kind = "state" | "city" | "store" | "model";

export const baseContent = {
  /* ------------------------------------------------------------ lib/seo/enrich.ts: opening hours (24-hour times) */
  hours: {
    closed: "Closed",
    /** All seven days the same: "Daily 10:00–21:00". */
    everyDay: (hours: string) => `Daily ${hours}`,
    tomorrow: "tomorrow",
    /** The next opening on a later day: "Sunday 11:00" (`day` is a weekday name). */
    dayAt: (day: string, time: string) => `${day} ${time}`,
    /** `next`: "tomorrow 10:00" / "Sunday 11:00". */
    closedTodayOpens: (next: string) => `Shut today · reopens ${next}`,
    closedToday: "Shut all day today",
    opensAt: (time: string) => `Doors open ${time}`,
    openNow: (closes: string) => `Open until ${closes}`,
    closedNowOpens: (next: string) => `Shut for now · reopens ${next}`,
    closedNow: "Shut for now",
  },

  /* ------------------------------------------------------------ enrich.ts: small formatters */
  duration: {
    /** How long stock stayed listed, below one minute. */
    underAMinute: "under a minute",
    /** Two parts of one duration: "2 h" + "15 min" → "2 h 15 min". */
    pair: (a: string, b: string) => `${a} ${b}`,
  },
  /** The last item of a list cut short: "a, b, c and 4 more". */
  listMore: (n: string) => `${n} more`,
  /** "Austin, TX (12 mi)" / "Toronto (19 km)": a nearby store's city and its distance. */
  nearLine: (place: string, distance: string) => `${place} (${distance})`,

  /* ------------------------------------------------------------ enrich.ts: FAQ (one sentence per answer) */
  faq: {
    /** How answers name the page: "at Apple The Summit", "for the iPhone Duo", "in Texas". */
    where: (kind: Kind, place: string) => (kind === "store" ? `at ${place}` : kind === "model" ? `for the ${place}` : `in ${place}`),
    nRestocks: f({ one: "# confirmed return", other: "# confirmed returns" }),
    /**
     * How often a place sees returns. `count`: "31 confirmed returns", or null when none was logged; `where` from faq.where;
     * `peak`: the usual local hour ("10 AM") and busiest weekday ("Tuesday"), when the data shows one.
     */
    restockA: ({ count, where, days, week, peak }: { count: string | null; where: string; days: string; week: string; peak: { hour: string; day: string | null } | null }) =>
      `${count == null ? `The ${days}-day ledger holds no return ${where}` : `The ${days}-day ledger holds ${count} ${where}, ${week} of them this week`}${peak ? `; they cluster near ${peak.hour} local time${peak.day ? `, with ${peak.day} the busiest weekday` : ""}` : ""}, and Apple publishes no delivery calendar.`,
    lastsNone: (where: string) => `Not enough completed return-to-sell-out listings ${where} to measure yet.`,
    /** `duration`: "2 h 15 min". */
    lasts: (days: string, duration: string) => `Median shelf time across the ${days}-day ledger: about ${duration} between a return and the next sell-out.`,
    /** One nearby store in an answer: "Apple Bridge Street · Huntsville, AL (90 mi)". */
    storeIn: (store: string, line: string) => `${store} · ${line}`,
    /** The answer listing the nearest stores ("A, B and C"). */
    nearestA: (stores: string) => `Closest alternatives: ${stores}.`,

    // model pages (the US)
    modelStockQ: (model: string) => `Where is the ${model} on the shelf at the moment?`,
    modelStockNone: (model: string) => `Nowhere in the latest observation; this page updates its list once a US Apple Store puts the ${model} up for pickup.`,
    nUsStores: f({ one: "# US Apple Store", other: "# US Apple Stores" }),
    /** `count`: "3 US Apple Stores". */
    modelStockSome: (count: string) => `At ${count} in the latest observation; each is named below along with the configurations it lists.`,
    priceQ: (model: string) => `What does the ${model} cost on apple.com?`,
    /** `storages`: "256GB, 512GB, 1TB"; `colors`: "Night Sky and Star White". */
    priceA: (low: string, high: string, storages: string, colors: string) => `Unlocked list prices run ${low} to ${high} by capacity (${storages}), with ${colors} as the finishes.`,
    modelRestockQ: (model: string) => `How often does the ${model} return to the shelf?`,
    modelLastsQ: (model: string) => `How long does a returned ${model} stay listed?`,
    reserveQ: (model: string) => `Can a ${model} be held for me before I order?`,
    reserveA: "Not before ordering: once a store lists the configuration, you place an apple.com order with in-store pickup, and only then is it set aside for your collection window.",

    // store pages
    storeStockQ: (store: string, model: string) => `Is the ${model} on the shelf at ${store}?`,
    nConfigs: f({ one: "# configuration", other: "# configurations" }),
    /** `count`: "2 configurations". */
    storeStockYes: (count: string) => `Yes: ${count} in the latest observation, with capacity and finish shown in this page's table.`,
    /** No Duo: `pro` / `proMax` = configurations of the 18 Pro / 18 Pro Max listed now (null when both are 0). */
    storeStockNo: (other: { pro: string; proMax: string } | null) => `Not in the latest observation${other ? `; the store does list ${other.pro} iPhone 18 Pro and ${other.proMax} 18 Pro Max configurations` : ", and the 18 Pro and 18 Pro Max are off the shelf too"}.`,
    hoursQ: (store: string) => `When is ${store} open?`,
    /** `hours`: the week ("Mo–Sa 10:00–21:00 · Su 11:00–18:00") or null; `today`: "10:00–21:00 (open now)" or null. */
    hoursA: ({ hours, today, address, phone }: { hours: string | null; today: string | null; address: string; phone: string | null }) =>
      `${hours ?? "See the hours on this page"}${today ? ` (today ${today})` : ""}, at ${address}${phone ? `; phone ${phone}` : ""}.`,
    storeRestockQ: (store: string) => `How often do iPhones return to the shelf at ${store}?`,
    storeLastsQ: (store: string) => `How long do returns stay listed at ${store}?`,
    storeNearestQ: (store: string) => `Which other Apple Stores sit closest to ${store}?`,

    // state, city and country pages
    placeStockQ: (place: string, model: string) => `Which Apple Stores in ${place} have the ${model} on the shelf now?`,
    placeStockNone: (place: string, model: string) => `None in the latest observation; the moment a store in ${place} lists the ${model} for pickup, this page shows it.`,
    nStores: f({ one: "# store", other: "# stores" }),
    /** `count`: "2 stores"; `stores`: their names, listed. */
    placeStockSome: (count: string, stores: string) => `${count} in the latest observation: ${stores}.`,
    countQ: (place: string) => `How many Apple Stores are there in ${place}?`,
    nAppleStores: f({ one: "# Apple Store", other: "# Apple Stores" }),
    /** Several stores: "5 Apple Stores; among them A, B and C". `stores`: up to three names (state pages add " · {city}"). */
    countMany: (count: string, stores: string) => `${count}; among them ${stores}.`,
    /** One store: "1 Apple Store, namely Apple The Summit". */
    countOne: (count: string, store: string) => `${count}, namely ${store}.`,
    placeRestockQ: (place: string) => `How often do iPhones return to the shelf in ${place}?`,
    placeLastsQ: (place: string) => `How long does stock last after a return in ${place}?`,
    placeNearestQ: (place: string) => `Which Apple Stores outside ${place} are closest?`,
  },

  /* ------------------------------------------------------------ enrich.ts: explainer and the alert rule */
  /** "In-store pickup at …": three short paragraphs. */
  explainer: (kind: Kind, place: string) => {
    const at = kind === "store" ? place : kind === "model" ? "every US Apple Store" : `Apple Stores in ${place}`;
    return [
      "Pickup listings belong to apple.com: checkout asks for a configuration plus a store, payment happens online, and collection is in person, often on the same day. Walk-in shelf stock and carrier stock are separate.",
      `ShelfSpring records each tracked configuration at ${at} from a synchronized inventory feed; a change enters the ledger only after a confirming observation.`,
      "Each confirmed change becomes a ledger entry, and those entries draw the return charts and history shown here.",
    ];
  },
  alertRule: "Each alert is tied to a single store and a single exact configuration; notifications follow detected availability after synchronization, so confirm the order with Apple.",

  /* ------------------------------------------------------------ enrich.ts: page titles (≤ 60 characters; the first that fits wins) */
  titles: {
    state: (name: string, duoNow: string, stores: string) => [
      `Apple Stores in ${name}: ${duoNow} of ${stores} have the iPhone Duo now`,
      `Apple Stores in ${name} – iPhone Duo pickup stock, live`,
      `Apple Stores in ${name} – iPhone Duo stock`,
      `${name} Apple Stores – iPhone stock`,
    ],
    /** `code`: the state's two-letter code. */
    city: (city: string, code: string, duoNow: string, stores: string) => [
      `Apple Stores in ${city}, ${code}: ${duoNow} of ${stores} have the iPhone Duo`,
      `Apple Stores in ${city}, ${code} – iPhone Duo pickup stock`,
      `Apple Stores in ${city}, ${code} – iPhone Duo stock`,
      `${city} Apple Stores – iPhone stock`,
    ],
    /** Store page <title> and H1: "Apple {name}" first (what people search), then the promise. `region`: the only store's city or state, or null. */
    store: (name: string, region: string | null) => {
      const r = region ? ` (${region})` : "";
      return [
        `${name}${r}: iPhone Stock Today, Pickup & Hours`,
        `${name}${r}: iPhone Stock Today & Hours`,
        `${name}${r}: iPhone Stock & Hours`,
        `${name}: iPhone Stock Today, Pickup & Hours`,
        `${name}: iPhone Stock & Hours`,
        `${name}: iPhone Stock`,
        `${name} – stock`,
      ];
    },
    model: (name: string, storesNow: string) => [
      `${name} pickup stock: ${storesNow} Apple Stores have it right now`,
      `${name} pickup stock: ${storesNow} Apple Stores have it now`,
      `${name} in-store pickup stock, live`,
    ],
  },

  /* ------------------------------------------------------------ lib/content/facts.ts: live {{tokens}} in articles */
  tokens: {
    /** {{duo.medianStay}} before there are enough return → sell-out pairs. */
    tooFewToMeasure: "not yet measurable",
    /** {{duo.lastRestock}} before the first return. */
    noneLoggedYet: "not in the ledger yet",
    /** {{duo.topConfig}} before the first return. */
    noneYet: "not recorded yet",
  },

  /* ------------------------------------------------------------ lib/content/siteFacts.ts: one store's restock pattern */
  pattern: {
    /** `days`: the window (30). */
    none: (days: string) => `The ${days}-day ledger holds no confirmed return.`,
    nConfirmed: f({ one: "# confirmed return", other: "# confirmed returns" }),
    /** `count`: "30 confirmed returns". */
    countIn: (count: string, days: string) => `${count} over ${days} days`,
    /** Median minutes a return stayed listed. */
    stay: (minutes: string) => `; median listing about ${minutes} min`,
    nDays: f({ one: "# day", other: "# days" }),
    /** Returns on too few local days to call a pattern: `onDays` "2 days" or null. */
    tooFew: (count: string, onDays: string | null, stay: string) => `${count}${onDays ? `, all on ${onDays}` : ""}: not enough separate days to call out a typical hour${stay}.`,
    /** `hour`: "8 AM" / "noon"; `weekday`: "Friday" or null. */
    usual: (hour: string, weekday: string | null, count: string, stay: string) => `Returns cluster near ${hour} local time${weekday ? `, most often on ${weekday}` : ""}; ${count}${stay}.`,
  },

  /* ------------------------------------------------------------ lib/seo/countryLinks.ts: a country's word for its regions */
  regionNouns: {
    state: f({ one: "state", other: "states" }),
    province: f({ one: "province", other: "provinces" }),
    area: f({ one: "area", other: "areas" }),
    department: f({ one: "department", other: "departments" }),
    prefecture: f({ one: "prefecture", other: "prefectures" }),
    emirate: f({ one: "emirate", other: "emirates" }),
    canton: f({ one: "canton", other: "cantons" }),
    region: f({ one: "region", other: "regions" }),
    county: f({ one: "county", other: "counties" }),
    city: f({ one: "city", other: "cities" }),
  } as Record<string, Forms>,

  /* ------------------------------------------------------------ components/ui/Viz.tsx */
  measured: "Method notes",

  /* ------------------------------------------------------------ components/seo/* */
  /** Faq and RichFaq heading. */
  faqTitle: "Common questions",
  breadcrumb: "Page trail",
  keepExploring: "More from the ledger",
  browse: {
    storesByState: "Browse by state",
    allStatesCities: "Every state and city →",
    liveByModel: "Shelf status per iPhone",
    modelStock: (model: string) => `${model} availability`,
    thisPage: "you are here",
    /** `short`: "Duo", "18 Pro", "18 Pro Max". */
    restockLog: (short: string) => `${short} returns ledger`,
    liveMap: "Map view",
    mostStores: "Largest store counts",
    allStates: "Every state",
    bigCities: "Major cities",
    cities: "Cities with stores",
    /** `region`: the country's word for its regions (regionNouns), singular. */
    storesBy: (region: string) => `Browse by ${region}`,
    /** `inName` is English only ("in the UK"); other languages use `country`, the country's name. */
    allStoresIn: ({ inName }: { inName: string; country: string }) => <>Full store list {inName} →</>,
    /** `regions`: the region word, plural. */
    allRegions: (regions: string) => `Full list of ${regions}`,
  },
  modelCards: "Per model",
  narrative: {
    /** " Latest logged return: <b>iPhone Duo 256GB Black</b> at Apple X, 3m ago." `at` is narrative.at or nothing. */
    lastRestock: (config: ReactNode, at: ReactNode, ago: ReactNode) => <>{" "}Latest logged return: {config}{at}, {ago}.</>,
    at: (store: ReactNode) => <> at {store}</>,
  },
  statStrip: {
    inStockNow: "On the shelf now",
    ofStores: (n: string) => `across ${n} stores`,
    stores: "Locations",
    nCities: f({ one: "in # city", other: "in # cities" }),
    tracked: "in the ledger",
    /** `short`: "Duo", "18 Pro"… */
    modelNow: (short: string) => `${short} on shelf`,
    configsInStock: "configurations on shelf",
    storesWithStock: f({ one: "store holding it", other: "stores holding it" }),
    restocks24h: "Returns, 24 h",
    /** "7 d: 9 · 30 d: 31" (d = days). */
    restocksHint: (week: string, month: string, days: string) => `7 d: ${week} · ${days} d: ${month}`,
    sellOuts: (days: string) => `Gone again (${days} d)`,
    /** "median shelf ~3 min"; fmtDuration's "under a minute" takes no tilde. */
    stays: (duration: string) => (/^under\b/.test(duration) ? `median shelf ${duration}` : `median shelf ~${duration}`),
    noPairs: "no completed pairs",
    lastRestock: "Latest return",
    noneYet: "not yet logged",
    inLastDays: (days: string) => `within ${days} days`,
  },
  product: {
    chooseIphone: "Pick a model",
    storage: "Capacity",
    color: "Finish",
    /** Facet chip for every storage size / every colour. */
    all: "Any",
    /** `unit`: "stores" / "configurations". */
    numbersAre: (unit: ReactNode) => <>Each figure counts {unit} with it on the shelf now.</>,
    seen: (ago: ReactNode) => <>logged {ago} · on shelf</>,
    last: (ago: ReactNode) => <>last on shelf {ago} · off now</>,
    notSeenYet: "not logged on the shelf yet",
    firstCheckPending: "awaiting first observation",
    inStock: "On the shelf",
    /** Place list rows (lower case). */
    inStockLower: "on shelf",
    none: "off shelf",
    /** Drive time under a few hundred metres. */
    here: "right here",
    notAvailable: "Off the shelf",
    notCheckedYet: "No observation yet",
    availableForPickup: "Listed for pickup",
    since: (ago: ReactNode) => <> · first logged {ago}</>,
    lastInStock: (ago: ReactNode) => <>Last on the shelf {ago}</>,
    neverSeen: "Not yet logged on this shelf",
    firstCheckSoon: "First observation due shortly",
    buy: "Order through apple.com",
    /** `checked`: "7s ago" (ticks); `note`: checkNote. */
    checked: (checked: ReactNode, note: ReactNode) => <>Observed {checked} · {note}</>,
    /** Same words as CHECK_NOTE in lib/plans.ts. */
    checkNote: "frequent inventory updates",
  },

  /* ------------------------------------------------------------ components/content/* */
  /** Table source line under a content table. */
  source: (source: ReactNode) => <>Data: {source}</>,
  /** Photo credit: `link` is "{photographer} / Pexels". */
  photoCredit: (link: ReactNode) => <>Image: {link}</>,
  sources: "References",
  /** Default `where` of the tracker line. */
  allUsStores: "the full set of 269 US Apple Stores",
  /** The first source: our own tracker. `since`: the date tracking began; `asOf`: when this page's numbers were read. */
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>ShelfSpring inventory record for {where}: historical coverage from {since}; figures updated {asOf}. Alerts are sent after matching availability is detected. Source checks, synchronization and notification delivery can add delay.  Historical coverage dates describe the dataset, not the age of ShelfSpring.</>,
  live: {
    configsCaption: (stores: ReactNode, model: ReactNode) => <>{model}: how many of the {stores} Apple Stores list each configuration at this observation</>,
    storage: "Capacity",
    pricesCaption: (model: ReactNode) => <>{model} on apple.com: unlocked list price before tax, next to the stores listing it now</>,
    price: "List price",
    bestColor: "Most-listed finish (stores)",
    noRestock: (model: string) => `The ledger has no ${model} return yet.`,
    /** RestockClock label: "across US stores for the iPhone Duo". */
    clockLabel: (model: string) => `across US stores for the ${model}`,
    storesWithIt: "Stores listing it",
    pairsInStock: "Store–configuration pairs on shelf",
    restocksLogged: "Returns in the ledger",
    medianTime: "Median shelf time",
    /** Below one minute. */
    underOneMin: (min: string) => `< ${min}`,
  },

  /** Photo alt text and caption by image id. English is src/content/images.json itself (scripts/pexels.mjs writes it); a translation lists the ids it covers. */
  photos: Object.fromEntries((photoList as { id: string; alt: string; caption?: string }[]).map((p) => [p.id, p.caption ? { alt: p.alt, caption: p.caption } : { alt: p.alt }])) as Record<string, { alt: string; caption?: string }>,
};

export const content: typeof baseContent = withShelfContent("en", baseContent);
