/**
 * The site's own entity, on every page (root layout): who ShelfSpring is and the facts an answer engine should
 * carry away from any page it lands on — current pickup choices, the historical record behind every
 * store's restock times, the coverage. Other pages point at these @ids instead of repeating them.
 */
import { ALL_STORES } from "../apple/catalog";
import { INTL_CODES } from "../apple/countries";

const SITE = "https://shelfspring.com";
export const ORG_ID = `${SITE}/#organization`;
export const WEBSITE_ID = `${SITE}/#website`;

export const SITE_DESCRIPTION =
  `ShelfSpring tracks iPhone Duo, iPhone 18 Pro and iPhone 18 Pro Max in-store pickup stock at ${ALL_STORES.length} Apple Stores in ${INTL_CODES.length + 1} countries. ` +
  `Alerts follow matching availability detected in the inventory feed; source checks, synchronization and delivery can add delay. Current listings can be compared with recorded returns by configuration, store and local hour. Historical coverage describes the inventory dataset, not the age of ShelfSpring.`;

export const SITE_FEATURES = [
  "Frequent inventory updates for current pickup choices",
  "Phone alerts after matching availability is detected",
  "Every restock confirmed by a second check before it counts",
  "Restock times per Apple Store: usual local hour, busiest weekday, last 30 days",
  "Log of every confirmed restock and sell-out with store, configuration and time",
  `Live pickup stock for every storage and color at ${ALL_STORES.length} Apple Stores in ${INTL_CODES.length + 1} countries`,
];

export const siteLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization", "@id": ORG_ID, name: "ShelfSpring", url: SITE, logo: `${SITE}/icon.svg`,
      slogan: "Find your next pickup window",
      description: SITE_DESCRIPTION,
      knowsAbout: ["iPhone in-store pickup availability", "Apple Store iPhone restock times", "iPhone Duo", "iPhone 18 Pro", "iPhone 18 Pro Max"],
    },
    { "@type": "WebSite", "@id": WEBSITE_ID, name: "ShelfSpring", url: SITE, description: SITE_DESCRIPTION, publisher: { "@id": ORG_ID } },
  ],
};
