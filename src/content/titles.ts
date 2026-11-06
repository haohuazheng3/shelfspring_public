/**
 * Round 2 of the SEO plan (project documentation《三轮规则》): one entry title per bound keyword.
 * <title> and H1 carry the main keyword's entry title; each secondary keyword gets an H2 written as a
 * standalone result title, followed by a block that answers that keyword's own motive. The same page
 * serves every visitor (no cloaking): Google picks among these on-page candidates per query.
 *
 * The national product pages and the home page read their titles here; the store, city and state pages
 * build theirs in src/lib/seo/enrich.ts (storeTitle) and src/lib/seo/placeCopy.ts (placeTitle).
 */

export interface EntryTitles {
  /** Main keyword → <title> and H1. */
  main: { keyword: string; title: string; h1?: string };
  /** Secondary keywords → H2 entry titles. */
  h2: { keyword: string; title: string }[];
  description: string;
}

/** Product pages at US level, keyed by product slug. */
export const PRODUCT_TITLES: Record<string, EntryTitles> = {
  "iphone-duo": {
    main: { keyword: "iphone duo in store", title: "iPhone Duo: Find Store Pickup & Recent Restocks", h1: "Find your next iPhone Duo pickup window" },
    h2: [
      { keyword: "apple store duo", title: "An Apple Store Duo listing: what can you do with it?" },
      { keyword: "iphone duo near me", title: "Build a reachable iPhone Duo shortlist near you" },
    ],
    description: "Compare iPhone Duo pickup listings at 269 US Apple Stores, from Night Sky to Star White. Use configuration-level stock and recent returns to choose a watchlist.",
  },
  "iphone-18-pro-max": {
    main: { keyword: "iphone 18 pro max in stock", title: "iPhone 18 Pro Max Pickup: Compare Stores & Configurations", h1: "Match your iPhone 18 Pro Max to a pickup store" },
    h2: [
      { keyword: "iphone 18 pro max in stock near me", title: "Find a nearby store with your exact Pro Max" },
      { keyword: "iphone 18 pro max stock", title: "Compare Pro Max storage and color availability" },
    ],
    description: "Find the iPhone 18 Pro Max configuration you want, then compare pickup stores, prices and recorded returns across the US.",
  },
  "iphone-18-pro-max-burgundy": {
    main: { keyword: "iphone 18 pro max burgundy", title: "Burgundy iPhone 18 Pro Max: Pickup Options by Storage", h1: "Find a Burgundy iPhone 18 Pro Max for pickup" },
    h2: [
      { keyword: "iphone 18 pro max dark cherry", title: "Dark Cherry searches: choose Burgundy at checkout" },
      { keyword: "iphone 18 pro max cherry red", title: "Compare Burgundy pickup options before choosing storage" },
    ],
    description: "Keep Burgundy fixed and compare storage sizes, pickup stores and recent returns. Find an option you would buy before setting a watchlist.",
  },
  "iphone-18-pro-max-glacier": {
    main: { keyword: "iphone 18 pro max glacier", title: "Glacier iPhone 18 Pro Max: Stores, Storage & Restocks", h1: "Find a Glacier iPhone 18 Pro Max nearby" },
    h2: [
      { keyword: "iphone 18 pro max blue", title: "Looking for the blue Pro Max? Check Glacier availability" },
      { keyword: "iphone 18 pro max glacier blue", title: "A storage-by-storage view of Glacier pickup stock" },
    ],
    description: "Looking for the light-blue Pro Max? Compare Glacier pickup options by capacity and store, with recent returns alongside the current listing.",
  },
  "iphone-18-pro-max-silver": {
    main: { keyword: "iphone 18 pro max silver", title: "Silver iPhone 18 Pro Max: Compare Pickup Availability", h1: "Choose a Silver Pro Max pickup option" },
    h2: [
      { keyword: "silver iphone 18 pro max", title: "Silver Pro Max availability across the storage sizes" },
      { keyword: "iphone 18 pro max silver color", title: "Deciding between Silver, Glacier and Black" },
    ],
    description: "Choose a Silver Pro Max capacity, then compare reachable pickup stores and the recorded history. Confirm the exact listing with Apple.",
  },
  "iphone-18-pro-glacier": {
    main: { keyword: "iphone 18 pro glacier", title: "Glacier iPhone 18 Pro: Compare Stores & Recent Returns", h1: "Choose your Glacier iPhone 18 Pro pickup" },
    h2: [{ keyword: "iphone 18 pro blue", title: "Blue iPhone 18 Pro pickup: select the Glacier row" }],
    description: "Compare Glacier iPhone 18 Pro storage sizes and pickup locations. Use the recent return record to narrow a practical watchlist.",
  },
  "iphone-duo-night-sky": {
    main: { keyword: "iphone duo night sky", title: "Night Sky iPhone Duo: Pickup Windows & Restocks", h1: "Watch for your Night Sky iPhone Duo" },
    h2: [{ keyword: "iphone duo black", title: "Night Sky: the dark iPhone Duo to choose on Apple" }],
    description: "Watch the dark iPhone Duo in the capacity you want. Compare Night Sky pickup listings with its recent returns at US Apple Stores.",
  },
  "iphone-duo-star-white": {
    main: { keyword: "iphone duo star white", title: "Star White iPhone Duo: Compare Pickup Opportunities", h1: "Watch for your Star White iPhone Duo" },
    h2: [{ keyword: "iphone duo white", title: "Star White: compare the light Duo by storage" }],
    description: "Compare Star White iPhone Duo pickup opportunities by storage and store. The live list and return history help shape your shortlist.",
  },
  "iphone-duo-1tb": {
    main: { keyword: "iphone duo 1tb", title: "iPhone Duo 1TB: $2,599 & Nearby Pickup Options", h1: "Find a 1TB iPhone Duo without widening your search" },
    h2: [{ keyword: "iphone duo 1tb price", title: "Budget for the $2,599 iPhone Duo 1TB" }],
    description: "Budget $2,599 before tax for an unlocked 1TB Duo, then compare both colors and reachable pickup locations using current listings and history.",
  },
  "iphone-duo-2tb": {
    main: { keyword: "iphone duo 2tb", title: "iPhone Duo 2TB: $3,199 & Recorded Pickup Returns", h1: "Watch the next 2TB iPhone Duo pickup window" },
    h2: [{ keyword: "iphone duo 2tb price", title: "The $3,199 Duo 2TB: price and evidence of availability" }],
    description: "Budget $3,199 before tax for the 2TB Duo. Compare current pickup listings and recorded returns for both colors, without assuming a delivery schedule.",
  },
};

/** Home page (the category tool). */
export const HOME_TITLES: EntryTitles = {
  main: { keyword: "iphone stock checker", title: "iPhone Pickup Stock & Restock Windows", h1: "Your next iPhone pickup starts here." },
  h2: [
    { keyword: "apple inventory checker", title: "Read today’s Apple inventory alongside its recent history" },
    { keyword: "apple store stock checker", title: "Turn a useful pickup shortlist into restock alerts" },
  ],
  description: "Find an iPhone pickup option at 269 US Apple Stores. Compare exact configurations, recent restocks and listing durations, then watch the stores you can reach.",
};

/** Store pages bound to measured keywords, keyed by store slug. `city` is set when a one-store city's query is bound too. */
export const STORE_KEYWORDS: Record<string, { main: string; store: string; city?: string }> = {
  fifthavenue: { main: "apple fifth avenue", store: "apple store fifth avenue" },
  soho: { main: "apple soho", store: "apple store soho" },
  downtownbrooklyn: { main: "apple downtown brooklyn", store: "apple store downtown brooklyn" },
  unionsquare: { main: "apple union square", store: "apple store union square" },
  floridamall: { main: "apple florida mall", store: "apple store florida mall" },
  boylstonstreet: { main: "apple boylston street", store: "apple store boylston street", city: "apple store boston" },
  aventura: { main: "apple aventura", store: "apple store aventura" },
  williamsburg: { main: "apple williamsburg", store: "apple store williamsburg" },
  west14thstreet: { main: "apple west 14th street", store: "apple store west 14th street" },
  worldtradecenter: { main: "apple world trade center", store: "apple store world trade center" },
  upperwestside: { main: "apple upper west side", store: "apple store upper west side" },
  millenia: { main: "apple millenia", store: "apple store millenia" },
  lincolnpark: { main: "apple lincoln park", store: "apple store lincoln park" },
  pioneerplace: { main: "apple pioneer place", store: "apple store pioneer place" },
  walnutstreet: { main: "apple walnut street", store: "apple store walnut street", city: "apple store philadelphia" },
  universityvillage: { main: "apple university village", store: "apple store university village" },
  valleyfair: { main: "apple valley fair", store: "apple store valley fair" },
  oakbrook: { main: "apple oakbrook", store: "apple store oakbrook", city: "apple store oak brook" },
  highlandvillage: { main: "apple highland village", store: "apple store highland village" },
  southlaketownsquare: { main: "apple southlake town square", store: "apple store southlake town square", city: "apple store southlake" },
  thegrove: { main: "apple the grove", store: "apple store the grove" },
  pasadena: { main: "apple pasadena", store: "apple store pasadena" },
  victoriagardens: { main: "apple victoria gardens", store: "apple store victoria gardens", city: "apple store rancho cucamonga" },
  fashionvalley: { main: "apple fashion valley", store: "apple store fashion valley" },
  southpark: { main: "apple southpark", store: "apple store southpark", city: "apple store charlotte" },
  bartoncreek: { main: "apple barton creek", store: "apple store barton creek" },
  universityparkvillage: { main: "apple university park village", store: "apple store university park village", city: "apple store fort worth" },
  "4thstreet": { main: "apple 4th street", store: "apple store 4th street", city: "apple store berkeley" },
};
