import type { ReactNode } from "react";
import type { Forms } from "@/lib/i18n/format";

/**
 * English strings: chrome — footer, 404 page, the "where to look next" rows under the SEO pages (browse), the
 * language-version note. (Header labels are client strings: cdict chrome.nav.) ShelfSpring's voice: an independent
 * observation ledger — "returns" for restocks, "shelf" for pickup availability, "watch" for an alert rule.
 */
export const chrome = {
  footer: {
    blurb: "Compare the live list with the recent record, then choose stores you can realistically reach. Alerts are sent after matching availability is detected. Source checks, synchronization and notification delivery can add delay.",
    /** On a country's native pages: the same line for that country (D.place.allStoresPhrase, e.g. the count of the country's stores). */
    blurbIn: (allStores: string) => `${allStores}. Alerts are sent after matching availability is detected. Source checks, synchronization and notification delivery can add delay.`,
    /** One line under the footer directory: whose marks these are, that the ledger is independent, that a listing is a snapshot. */
    trademark: "Apple Inc. owns the Apple, iPhone and Apple Store trademarks. ShelfSpring keeps an independent record with no business tie to Apple; each listing here is a snapshot, and Apple confirms every order.",
    /** Directory column 01: the three model pages, the return log, the map. */
    product: "Shelves by model",
    duoStock: "iPhone Duo shelves",
    proStock: "iPhone 18 Pro shelves",
    proMaxStock: "iPhone 18 Pro Max shelves",
    restockLog: "Return log",
    liveMap: "Shelf map",
    storesByState: "States on record",
    pricing: "Pricing",
    /** Directory column 03 on native pages. */
    company: "About this notebook",
    howItWorks: "How the record is kept",
    getApp: "Home Screen app",
    about: "About ShelfSpring",
    contact: "Write to us",
    allStates: "Every state and city →",
    /** Directory column 02: the country's regions/cities (native pages) or the biggest states (US), A–Z. */
    storesIn: "Places on record",
    allStores: "Full store directory →",
    legal: "Fine print",
    privacy: "Privacy",
    terms: "Terms of use",
    refunds: "Refund rules",
    /** Native pages: legal texts and the guides are in English; said once, next to them. */
    englishOnly: "English only",
    questions: "Pickup questions",
    restockTimes: "Hours when the Duo returns",
    countries: "Markets",
    status: "System status",
  },
  notFound: {
    title: "No page at this address",
    /** `stores`, `map`: the two links (already built), placed in the sentence. */
    body: (stores: ReactNode, map: ReactNode) => <>The address may be mistyped or retired. Pick up the trail from the {stores} or the {map}.</>,
    stores: "store directory",
    map: "shelf map",
    home: "Back to the start page",
  },
  /** The "where to look next" rows (components/seo/Browse.tsx, CountryBrowse.tsx, Related.tsx). */
  browse: {
    /** RelatedBlock's heading when a page gives none. */
    next: "Where to look next",
    /** The per-model row: each model's store-by-store page and its return log, then the Duo on the map. */
    models: "Model ledgers",
    /** `model`: "iPhone Duo". */
    modelStores: (model: string) => `${model}, store by store`,
    /** `short`: "Duo", "18 Pro", "18 Pro Max". */
    modelReturns: (short: string) => `${short} return log`,
    duoMap: "Duo on the shelf map",
    /** Marks the model page being read. */
    here: "you are here",
    /** Every US state as a chip: postal code, name, store count. */
    states: "Every state on record",
    /** Every region of another country, grouped by store count; `region`: the country's word for a region, singular. */
    regions: (region: string) => `Every ${region} on record`,
    /** Link to the full US store directory. */
    directory: "Full store directory",
    /** Link to another country's store directory; `inName` is English only ("in the UK"), other languages use `country`. */
    directoryIn: ({ inName }: { inName: string; country: string }) => <>Full directory {inName}</>,
    /** The biggest states / regions, A–Z, each with its store count. */
    largest: "Largest store counts, A–Z",
    /** `regions`: the region word, plural. */
    allRegions: (regions: string) => `The full list of ${regions}`,
    /** The biggest cities, grouped under how many stores each has. */
    citiesByCount: "Cities by number of stores",
    cities: "Cities on record",
    /** A group label in those rows: "4 stores". "#" = the number. */
    tier: { one: "# store", other: "# stores" } as Forms,
  },
};
