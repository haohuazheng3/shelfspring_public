import { withShelfPages } from "@/lib/seo/localizedCopy";
/**
 * English strings: pages — the home board and the region, city and store pages of every country tree (the US and
 * the English country trees render these exact strings). Place names arrive already in the page's language.
 * `cc` arguments: the page's country (use the language's own name for it: places.countryLabel).
 * Labels handed to the restock modules (Last24Hours, RestockClock, SellOutTimes, DailyBars, RestocksByConfig):
 * English "in Michigan" / "at Apple Somerset" / "here" — each language writes them to fit its own module sentences.
 */
import { COUNTRIES, type CountryCode } from "@/lib/apple/countries";
import { CHECK_NOTE } from "@/lib/plans";

const inName = (cc: CountryCode) => COUNTRIES[cc].inName;

export const basePages = {
  common: {
    /** "every 15 s, 5 s with an alert" — the check cadence note. */
    checkNote: CHECK_NOTE,
    appleStores: "Store directory",
    showOnMap: "Locate on the map",
    restockLogs: "Return records",
    fullLog: "Open the whole record →",
    restocksBy: "Returns per configuration",
    lastDays: (days: number) => `${days}-day return calendar`,
    nearbyCities: "Other cities within a drive",
    neighboringStates: "Bordering states",
    acrossStateLine: "Just over the state border",
    allUsRestocks: "Every logged US return",
    allRestocksIn: (cc: CountryCode) => `Every logged return ${inName(cc)}`,
    regionRestocks: (place: string) => `${place} return record`,
    onTheMap: (place: string) => `Map view: ${place}`,
    allOf: (place: string) => `${place} overview`,
    allOfArrow: (place: string) => `Whole ${place} record →`,
    storeAndCity: (store: string, city: string) => `${city} · ${store}`,
    /** Source list line: "Apple: Ginza store page". */
    appleStorePage: (store: string) => `${store} listing on apple.com`,
    /** Source list: where the live data comes from ("the 11 Apple Stores in Japan"). */
    sourcesWhere: (n: number, cc: CountryCode) => `${n} observed Apple Stores ${inName(cc)}`,
    /** Label handed to the restock modules for a place: "in Michigan". */
    inPlace: (place: string) => `in ${place}`,
    /** The same for one store: "at Apple Somerset". */
    atPlace: (place: string) => `at ${place}`,
    here: "here",
    storesWithIt: "stores listing it",
    whenRestock: (place: string) => `Return timing for ${place}`,
    /** The Duo-only hour chart on place pages (2026-11-08). */
    duoHours: (place: string) => `Clock hours of logged Duo returns, ${place}`,
    howFast: (place: string) => `How long ${place} listings stayed up`,
    latestIn: (place: string) => `${place}: newest record entries`,
    noneIn: (place: string) => `Nothing logged for ${place} so far.`,
    faqTitle: (place: string) => `Field questions · ${place}`,
    itemList: (place: string) => `Apple Stores in ${place}`,
    alertIn: (place: string) => `Watch stores in ${place}`,
    panelPick: (place: string) => `Your ${place} watchlist: choose phones, then only the stores you could actually reach`,
    matrixH2: "Stock by store and model",
    matrixHint: "Listed at the latest observation / tracked, for each model.",
    matrixLabel: "Store-by-store shelf",
    cityPage: "City overview ↗",
    storePage: "Store overview ↗",
    /** The "Live data since" date on country pages. */
    since: "November 2, 2026",
  },
  home: {
    storesWith: (short: string) => `stores showing ${short}`,
    restocks24: "returns, past 24 h",
    week: (n: number) => ` · ${n} wk`,
    lastCheck: "latest observation",
    more: (n: number) => `+${n} more`,
    latest: (short: string) => `Newest ${short} returns in the record`,
    none: (short: string) => `No ${short} return logged so far.`,
    allRestocks: "Full return record",
    modelMap: (short: string) => `Map: ${short}`,
    buy: "Order at apple.com",
    liveStock: (short: string) => `${short} shelf today`,
    live: "Live",
    alsoTracking: "Also in the ledger:",
    liveMap: "Pickup map",
    allStores: "Store directory",
    questions: "Field questions",
  },
  region: {
    counts: (stores: number, cities: number) => `${cities} cit${cities > 1 ? "ies" : "y"} · ${stores} Apple Stores · observed ${CHECK_NOTE}`,
    nearbyOutside: (place: string) => `Nearest stores past the ${place} line`,
    nearbyHint: (place: string) => `Distances run from the middle of ${place}'s store cluster.`,
    beyond: (place: string) => `Outside ${place}`,
    everyStore: (place: string) => `${place} store list`,
    /** "Nearest provinces in Canada" (the country's word for its regions, plural). */
    nearestRegions: (cc: CountryCode) => `Closest ${COUNTRIES[cc].regionNounPlural ?? "areas"} ${inName(cc)}`,
  },
  city: {
    counts: (stores: number) => `${stores} Apple Stores · observed ${CHECK_NOTE}`,
    storeHeading: (name: string) => `Apple ${name}`,
    details: "Addresses and opening hours",
    outside: (place: string) => `Nearest stores past ${place}`,
    outsideRegion: (region: string) => `Just outside ${region}`,
    around: (place: string) => `${place} and its surroundings`,
    otherCities: (region: string) => `More ${region} cities`,
  },
  store: {
    /** Meta description, three lengths (the first that fits 155 characters wins). */
    description: (a: { place: string; street: string; city: string; where: string; duo: number; pro: number; pm: number }) => [
      `${a.place}, ${a.street}, ${a.city}: live pickup stock for ${a.duo} iPhone Duo, ${a.pro} 18 Pro and ${a.pm} Pro Max configs, today's hours, restock times and nearby stores.`,
      `${a.place}, ${a.where}: live pickup stock for ${a.duo} Duo, ${a.pro} 18 Pro and ${a.pm} Pro Max configs, today's hours and restock times.`,
      `${a.place}, ${a.city}: live stock for ${a.duo} Duo, ${a.pro} 18 Pro, ${a.pm} Pro Max configs, hours and restocks.`,
    ],
    /** "Tokyo, Japan" — where the store is, for the description. */
    where: (city: string, cc: CountryCode) => `${city}, ${COUNTRIES[cc].short}`,
    taxQ: (place: string) => `What does an iPhone Duo cost at ${place} once tax is added?`,
    pickupQ: (place: string) => `Does ${place} hand over apple.com pickup orders?`,
    pickupA: (place: string) => `Yes. Select in-store pickup with ${place} during the apple.com checkout and travel only once Apple says the order is ready. At the desk you show the order number, official photo ID and the live QR code or Wallet pass (Apple refuses screenshots).`,
    /** "Apple Store Ginza": the store as people say it. */
    storeWord: (name: string) => (/^apple\b/i.test(name) ? name.replace(/^apple\s*/i, "Apple Store ") : `Apple Store ${name}`),
    hoursH2: (storeWord: string) => `${storeWord} hours, address and pickup`,
    hoursLead: (place: string, address: string, phone: string | undefined, today: string, week: string) => `${place} is at ${address}${phone ? `, ${phone}` : ""}. Today's hours: ${today}; the full week: ${week}.`,
    pickupRules: (helpUrl: string) => [
      `**Travel after Apple's ready message**, not before ([Apple's pickup rules](${helpUrl}))`,
      `**At the desk:** order number · official photo ID · the live QR code or Wallet pass`,
      `**Refused:** a screenshot of the code`,
      `**Sending someone?** Name them as the pickup contact during checkout`,
    ],
    directions: (place: string, dirUrl: string, appleUrl?: string) => `[Directions to ${place}](${dirUrl})${appleUrl ? ` · [Apple's page for this store](${appleUrl})` : ""}`,
    onlyH2: (where: string, place: string) => `Apple Store ${where}: ${place} is the only one`,
    onlyInCountry: (place: string, cc: CountryCode) => `${place} is the only Apple Store ${inName(cc)}, so every in-store pickup ${inName(cc)} happens here. When it lists a configuration, there is no second store to try: an alert for it is the whole strategy.`,
    /** One store in the city; `backups`: "Apple X in City (12 km)" list, may be empty. */
    onlyInCity: (city: string, place: string, backups: string) => `${city} has one Apple Store, ${place}.${backups ? ` The next closest are ${backups}.` : ""}`,
    backup: (apple: string, city: string, dist: string) => `${apple} in ${city} (${dist})`,
    onlyBlockCountry: (place: string) => `One alert covers one store and one exact configuration, and the push arrives seconds after ${place} lists it for pickup.`,
    onlyBlock: (place: string) => `If ${place} is out of the configuration you want, those are the backups worth watching too: one alert covers one store and one exact configuration, and the push arrives seconds after the store lists it.`,
    /** The first paragraph. Numbers: in stock now / configurations, per model; `peak`: the usual hour or null. */
    intro: (a: { place: string; street: string; duo: number; duoOf: number; pro: number; proOf: number; pm: number; pmOf: number; peak: string | null }) => (
      <>{a.place}{a.street ? ` at ${a.street}` : ""} lists <b className="text-ink">{a.duo} of {a.duoOf}</b> iPhone Duo, <b className="text-ink">{a.pro} of {a.proOf}</b> iPhone 18 Pro and <b className="text-ink">{a.pm} of {a.pmOf}</b> iPhone 18 Pro Max configurations for pickup right now.{a.peak ? <> Restocks here usually land around <b className="text-ink">{a.peak}</b> local time.</> : null}</>
    ),
    restocks30: (n: number) => `${n} logged returns in 30 days`,
    lookupOff: "Apple is not answering pickup lookups for this store at the moment. The ledger asks again every 30 minutes and fills the shelf in once an answer arrives.",
    checked: "Observed",
    alertHere: (short: string) => `Watch ${short} at this store`,
    panel: (name: string) => `Apple ${name} watchlist: choose phones, keep this store and add any backup you could reach`,
    configsInStock: "configurations on the shelf",
    stockNowH2: "Pickup stock right now",
    whenRestock: (name: string) => `Return timing at ${name}`,
    duoHours: (name: string) => `Clock hours of logged Duo returns, ${name}`,
    howFast: (name: string) => `How long ${name} listings stayed up`,
    history: "Return log",
    historyEmpty: "The record holds no return or sell-out for this store so far.",
    nearby: "Backup stores",
    elsewhereIn: (region: string) => `More of ${region}`,
    faqTitle: (place: string) => `Field questions · ${place}`,
    applePage: (place: string) => `${place} on apple.com: opening hours and sessions`,
    /** Source list "where" for a country page: "the Apple Store in Austria" / "the 11 Apple Stores in Japan". */
    sourcesWhere: (n: number, cc: CountryCode) => `the ${n === 1 ? "Apple Store" : `${n} Apple Stores`} ${inName(cc)}`,
    around: (place: string) => `Beyond ${place}`,
    otherInCity: (city: string) => `Same city, other stores: ${city}`,
    cityPage: (city: string) => `${city} overview`,
    moreIn: (region: string) => `Further ${region} stores`,
    everyIn: (cc: CountryCode) => `The rest of the directory ${inName(cc)}`,
    allIn: (cc: CountryCode) => `Full store directory ${inName(cc)}`,
    countryHome: (cc: CountryCode) => `${COUNTRIES[cc].name} overview`,
    footnote: "Shelf states are copied from apple.com's in-store pickup answers at the moment of the latest observation.",
    footnoteIntl: (cc: CountryCode, regionWord: string) => ` Money is shown in ${COUNTRIES[cc].currency} and distance in ${COUNTRIES[cc].unit === "mi" ? "miles" : "kilometres"}; this ledger is independent of any ${regionWord} authority or retailer.`,
  },
};

export const pages: typeof basePages = withShelfPages("en", basePages);
