/**
 * English client strings: map (the live pickup-stock map). {model} is a model's short name ("Duo") or "iPhone", never
 * translated; {in} is "in Japan" (English: the site's own "in the US", "in the UK"; other languages fill `inCountry`).
 */
export const map = {
  title: "The pickup atlas.",
  leadUs: "Explore {n} US Apple Stores",
  leadOne: "The Apple Store {in}",
  leadAll: "All {n} Apple Stores {in}",
  leadTail: ". Narrow the {model} configuration, then choose a location. Larger markers represent more listed configurations.",
  inCountry: "in {country}",
  /** "Last look 7s ago": {ago} is the live counter. */
  updated: "Last look {ago}",
  waiting: "The first look is still under way",
  allModels: "Every model",
  storage: "Capacity",
  anyStorage: "Any capacity",
  color: "Finish",
  anyColor: "Any finish",
  mapLabelUs: "Pickup atlas of US Apple Stores",
  mapLabel: "Pickup atlas of Apple Stores {in}",
  loading: "Drawing the atlas…",
  errors: {
    library: "The atlas could not load its map library.",
    webgl: "This browser cannot draw the atlas (WebGL2 is switched off or missing)",
    tiles: "The base map did not load ({reason})",
    network: "connection problem",
    /** Follows the error. */
    tail: "{error}. The list of locations beside it still works.",
  },
  locating: "Finding you…",
  nearMe: "📍 Center on me",
  /** The US region buttons (keys stay the region names; values are what the buttons say). */
  regions: { "Lower 48": "Mainland", Alaska: "Alaska", Hawaii: "Hawaii", "Puerto Rico": "Puerto Rico" } as Record<string, string>,
  allOf: "Whole of {country}",
  legend: { inStock: "on the shelf", none: "off the shelf", unchecked: "awaiting a first look" },
  rightNow: "Your selection, across the map",
  ofStores: "of {n} stores list it",
  configs: { one: "{n} {model} configuration on the shelf", other: "{n} {model} configurations on the shelf" },
  noneListed: "This selection is off the shelf everywhere at the moment.",
  firstSweep: "The first look is still under way.",
  selected: "Location in focus",
  close: "Close",
  /** {ago} is the live counter. */
  checked: "{city}, {region} · last look {ago}",
  openStore: "Store record →",
  alertHere: "Watch this store",
  withStock: "Places with a matching listing",
  tapDot: "Choose a marker to read that store’s current options.",
  nothingMatching: "None of this selection is on the shelf here.",
  /** The tooltip over a dot. */
  popupCount: "{n} on the shelf",
  popupNone: "off the shelf",
  byRegion: "Breakdown by {noun}",
  regionsHave: "{model} on the shelf · {n}/{total} {nouns}",
  /** The US table. */
  usNoun: "state",
  usNouns: "states and territories",
  usHeader: "State",
  table: { stores: "Stores", withStock: "Listing", configs: "On the shelf", share: "Coverage", page: "open" },
  /**
   * What each country's stores are grouped by (countries.ts regionNoun), singular and plural. English pages keep the
   * country data's own words; another language reads these. `area` also stands for a country without such a level.
   */
  nouns: {
    state: { one: "state", other: "states" },
    province: { one: "province", other: "provinces" },
    area: { one: "area", other: "areas" },
    department: { one: "department", other: "departments" },
    prefecture: { one: "prefecture", other: "prefectures" },
    emirate: { one: "emirate", other: "emirates" },
    canton: { one: "canton", other: "cantons" },
    county: { one: "county", other: "counties" },
    region: { one: "region", other: "regions" },
    city: { one: "city", other: "cities" },
  } as Record<string, { one: string; other: string }>,
};
