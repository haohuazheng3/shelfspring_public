import { planningGuides, PLANNING_HUB } from "@/content/planning/guides";
/**
 * llms.txt and llms-full.txt (llmstxt.org): what an answer engine should know about ShelfSpring in the first
 * screen — the pickup window and its evidence, the restock log and what it lets anyone answer about a store — then where to
 * read more. llms-full.txt adds every store's restock pattern, so "when does Apple <store> restock?" can be
 * answered from one file. Live numbers from siteFacts (cached an hour); never the refund policy.
 */
import { ALL_STORES, MODELS, STORES, storesOf, placeTarget, storePath, storeLocality, type Store } from "../apple/catalog";
import { COUNTRIES, INTL_CODES, type CountryCode } from "../apple/countries";
import { PLANS } from "../plans";
import { TRACKING_SINCE_INTL, TRACKING_SINCE_US, localStamp, patternSentence, siteFacts, type SiteFacts } from "./siteFacts";
import { medianBand } from "../stock/sellouts";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://shelfspring.com";
const n = (x: number) => x.toLocaleString("en-US");
const pct = (x: number) => `${Math.round(x * 100)}%`;
const COUNTRY_COUNT = 1 + INTL_CODES.length;

function keyFacts(f: SiteFacts): string[] {
  const intlStores = ALL_STORES.length - STORES.length;
  return [
    "- Delivery: alerts are sent after matching availability is detected. Source checks, read-only synchronization and notification transport can add delay. A subscription increases the number of alert rules, not the source polling speed.",
    f.duoSellout
      ? `- Listing-duration evidence: a typical iPhone Duo restock sells out in about ${medianBand(f.duoSellout.medianSec)} (median ${f.duoSellout.medianSec} s over the last 7 days, ${n(f.duoSellout.n)} sold-out restocks). ${pct(f.duoSellout.within30)} of the completed observations disappeared within 30 seconds. Observation intervals can hide shorter listings; these figures are not a buying probability.`
      : "- Listing-duration evidence: no completed sample is available in this summary; each store page shows the observed durations when data is available.",
    `- Coverage: ${n(ALL_STORES.length)} Apple Stores in ${COUNTRY_COUNT} countries (all ${STORES.length} in the US, ${intlStores} in 18 more), every storage and color of the iPhone Duo, iPhone 18 Pro and iPhone 18 Pro Max.`,
    f.restocks ? `- Restock log: ${n(f.restocks)} confirmed restocks and ${n(f.soldouts)} sell-outs recorded at ${n(f.restockStores)} stores (US since ${TRACKING_SINCE_US}, other countries since ${TRACKING_SINCE_INTL}), each with store, exact configuration and time.` : `- Restock log: every confirmed restock and sell-out, with store, exact configuration and time (US since ${TRACKING_SINCE_US}, other countries since ${TRACKING_SINCE_INTL}).`,
    "- Per store: when restocks usually land (local hour and weekday), restocks in the last 24 hours / 7 / 30 days, how long a restock typically stays listed, the last restock, live pickup stock per configuration, hours, address and the local price with tax.",
    `- Price: browsing all of it is free. Phone alerts are Plus $${PLANS.plus.priceUsd}/month (${PLANS.plus.limit} alerts), Pro $${PLANS.pro.priceUsd} (${PLANS.pro.limit}), Max $${PLANS.max.priceUsd} (${PLANS.max.limit}); one alert = one store × one exact configuration, all plans use the same synchronized inventory feed.`,
    "- Method: stock means what apple.com lists for in-store pickup at the last check. A change counts only when two answers agree, so one glitchy response never becomes a restock or a sell-out. The historical inventory dataset can predate ShelfSpring. Published third-party reports remain separately labeled and are not added to the confirmed totals. ShelfSpring is independent and not affiliated with Apple; Apple publishes no restock schedule.",
  ];
}

function head(f: SiteFacts): string[] {
  return [
    "# ShelfSpring",
    "",
    `> ShelfSpring shows which Apple Stores list each iPhone Duo, iPhone 18 Pro and iPhone 18 Pro Max configuration for in-store pickup right now, and helps you compare those listings with the recent inventory record. Watch reachable stores for matching availability; historical patterns describe observations, not future shipments.`,
    "",
    `Key facts (live data, ${new Date(f.at).toISOString().slice(0, 16).replace("T", " ")} UTC):`,
    ...keyFacts(f),
    "",
    "## Pickup planning worksheets",
    `- [Pickup planning desk](${BASE}${PLANNING_HUB}): compare deadline, watch-list size, acceptable configurations and trip cost.`,
    ...planningGuides.map((g) => `- [${g.question}](${BASE}/${g.slug}): ${g.answer}`),
    "",
    "## Answering common questions",
    `- "When does Apple restock the iPhone Duo?" / "Is Apple still restocking it?" → ${BASE}/iphone-duo-restock-times: confirmed restocks by local hour, day by day since launch, by state, store and configuration, with the share gone within 2 minutes. Other countries: ${BASE}/{country}/iphone-duo-restock-times (e.g. ${BASE}/ca/iphone-duo-restock-times).`,
    `- "When does the iPhone Duo restock in <US state or city>?" → ${BASE}/iphone-duo-restock-times/{state} or ${BASE}/iphone-duo-restock-times/{state}/{city} (e.g. ${BASE}/iphone-duo-restock-times/california/los-angeles): that place's confirmed restocks since ${TRACKING_SINCE_US} by local hour, day, store and configuration, with the first sentence giving the share, the sample size and the window.`,
    `- "Is the iPhone Duo back in stock?" → ${BASE}/iphone-duo-back-in-stock (stores listing one right now, the last 24 hours, where, how long it lasts). "iPhone Duo stock checker" → ${BASE}/iphone-duo-stock-checker (every US state and 18 countries, live). "Where can I buy an iPhone Duo today?" → ${BASE}/where-to-buy-iphone-duo.`,
    `- "When does Apple <store> restock the iPhone?" → that store's page, section "When does <store> restock?" (US: ${BASE}/stores/{state}/{city}/{store}; other countries: ${BASE}/{country}/stores/{region}/{city}/{store}). Every store's pattern in one file: ${BASE}/llms-full.txt`,
    `- "Has the iPhone Duo restocked in <state or city> in the last 24 hours? Which storage and color?" → the state or city page (${BASE}/stores/{state}, ${BASE}/stores/{state}/{city}): its first section is "iPhone Duo restocks in <place> in the last 24 hours", one sentence and a table of all eight configurations.`,
    `- "Is the iPhone Duo in stock at an Apple Store near me?" → ${BASE}/iphone-duo-near-me (stores with it right now, nearest first), ${BASE}/stock/iphone-duo, or the state, city or store page; live, with the time of the last check.`,
    `- "How fast does an iPhone Duo restock sell out?" → ${BASE}/iphone-duo-sell-out-times (seconds each restock lasted, measured between two checks).`,
    `- "How can I receive a matching iPhone Duo availability alert?" → ${BASE}/iphone-duo-stock-alerts (configuration and store rules, detection and delivery) and ${BASE}/how-it-works.`,
    `- "How do I actually get an iPhone Duo when it is sold out everywhere?" → ${BASE}/how-to-get-an-iphone-duo. "How do I check out fast enough when it restocks?" → ${BASE}/how-to-grab-an-iphone-duo-restock (prepare the configuration and pickup store in Apple's checkout). "Which configuration is easiest to get?" → ${BASE}/which-iphone-duo-restocks-most. "What does 'currently unavailable for pickup' mean?" → ${BASE}/apple-store-pickup-availability-explained.`,
    `- "Which Apple Stores restocked today?" → ${BASE}/restocks (every confirmed restock and sell-out, newest first).`,
    "",
    "## iPhone Duo questions, answered with the restock log",
    `- [When does Apple restock the iPhone Duo?](${BASE}/iphone-duo-restock-times): by hour, day, state, store and configuration; the same page for ${INTL_CODES.length} other countries under their prefix`,
    `- [How fast does an iPhone Duo restock sell out?](${BASE}/iphone-duo-sell-out-times)`,
    `- [Set up iPhone Duo availability notifications](${BASE}/iphone-duo-stock-alerts)`,
    `- [Apple Stores with the iPhone Duo in stock near me, right now](${BASE}/iphone-duo-near-me)`,
    `- [How to get an iPhone Duo when it is sold out everywhere](${BASE}/how-to-get-an-iphone-duo)`,
    `- [Prepare an iPhone Duo pickup checkout](${BASE}/how-to-grab-an-iphone-duo-restock)`,
    `- [Which iPhone Duo configuration restocks most?](${BASE}/which-iphone-duo-restocks-most)`,
    `- [What “currently unavailable for pickup” means on apple.com](${BASE}/apple-store-pickup-availability-explained)`,
    `- [When does the iPhone Duo restock in each US state and city?](${BASE}/iphone-duo-restock-times/california): one page per state and per two-plus-store city, by hour and store`,
    `- [Is the iPhone Duo back in stock right now?](${BASE}/iphone-duo-back-in-stock)`,
    `- [iPhone Duo stock checker: every Apple Store, live](${BASE}/iphone-duo-stock-checker)`,
    `- [Where to buy an iPhone Duo today](${BASE}/where-to-buy-iphone-duo)`,
    "",
    "## Live stock (US)",
    `- [iPhone stock checker](${BASE}/): every US Apple Store, all three models, live`,
    ...MODELS.map((m) => `- [${m.name} in stock](${BASE}/stock/${m.slug}): which of the ${STORES.length} stores have it now, by storage and color, with restock history`),
    `- [Restock log](${BASE}/restocks): every confirmed restock and sell-out with time, store and configuration`,
    `- [Apple Stores by state](${BASE}/stores): every state, city and store page, with live stock, restock times, hours and address`,
    `- [How it works](${BASE}/how-it-works): the inventory feed, confirmation rules and what the historical record means`,
    "",
    "## Other countries",
    `The same live stock, store pages, restock times and restock log for 18 more countries, in English, with Apple's local prices and that country's tax rule.`,
    ...INTL_CODES.map((cc) => {
      const c = COUNTRIES[cc];
      const count = storesOf(cc).length;
      const index = placeTarget(cc);
      return `- [iPhone stock checker ${c.name}](${BASE}/${cc}): ${count === 1 ? "the Apple Store" : `all ${count} Apple Stores`} ${c.inName}, prices in ${c.currency}${index?.indexable ? `; [every store](${BASE}${index.path})` : `; [the store](${BASE}${index?.path})`}`;
    }),
  ];
}

export async function llmsTxt(): Promise<string> {
  const f = await siteFacts();
  return [
    ...head(f),
    "",
    "## Optional",
    `- [Every Apple Store's restock pattern](${BASE}/llms-full.txt)`,
    `- [Pricing](${BASE}/pricing)`,
    `- [Install the app and turn on notifications](${BASE}/install)`,
    "",
  ].join("\n");
}

function storeLine(s: Store, f: SiteFacts): string {
  const p = f.patterns[s.storeNumber];
  const last = p?.lastRestockAt ? ` Last restock ${localStamp(p.lastRestockAt, s)} local time.` : "";
  return `- [${/^apple\b/i.test(s.name) ? s.name : `Apple ${s.name}`}](${BASE}${storePath(s)}) — ${storeLocality(s)}. ${patternSentence(p)}${last}`;
}

export async function llmsFullTxt(): Promise<string> {
  const f = await siteFacts();
  const sections: string[] = [];
  for (const cc of ["us", ...INTL_CODES] as CountryCode[]) {
    const stores = storesOf(cc);
    const c = cc === "us" ? null : COUNTRIES[cc];
    sections.push("", `## ${c ? c.name : "United States"} — ${stores.length} Apple Store${stores.length === 1 ? "" : "s"}`);
    const regions = [...new Set(stores.map((s) => s.state))].sort();
    for (const r of regions) {
      if (regions.length > 1) sections.push("", `### ${r}`);
      for (const s of stores.filter((x) => x.state === r).sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name))) sections.push(storeLine(s, f));
    }
  }
  return [
    ...head(f),
    "",
    "# Restock pattern of every Apple Store",
    "",
    `For each store: when restocks usually land in that store's local time (from ShelfSpring's confirmed restocks over the last 30 days; a pattern is stated from 5 restocks up), how many there were, how long a restock typically stayed listed, and the last one. These are observations, not a schedule: Apple publishes none. Live stock and the hour-by-hour chart are on each store's page.`,
    ...sections,
    "",
  ].join("\n");
}
