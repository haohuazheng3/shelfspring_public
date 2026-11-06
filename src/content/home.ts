/** ShelfSpring editorial copy. Counts come from the same live facts as the stock board. */
import type { Block, Faq, Source } from "@/lib/content/types";

export const HOME_INTRO = "Find a pickup plan that fits your day. Compare **iPhone Duo, 18 Pro and Pro Max** by configuration and nearby store, check the observation time, then confirm your choice in Apple's checkout.";

export const HOME_SECTIONS: Record<string, { lead: string; blocks: Block[] }> = {
  "apple inventory checker": {
    lead: "ShelfSpring puts the **current pickup list beside its recent history**. That gives you two different answers: where a phone is listed now, and where another opportunity has appeared before.",
    blocks: [
      { t: "table", head: ["Choose a model", "Tracked configurations", "Pickup locations now", "Recorded returns"], rows: [["[iPhone Duo](/stock/iphone-duo)", "8", "{{duo.storesNow}}", "{{duo.restocks}}"], ["[iPhone 18 Pro](/stock/iphone-18-pro)", "16", "{{pro.storesNow}}", "{{pro.restocks}}"], ["[iPhone 18 Pro Max](/stock/iphone-18-pro-max)", "16", "{{pm.storesNow}}", "{{pm.restocks}}"]], caption: "Current observations plus the historical record beginning {{trackingSince}}", source: "Apple pickup availability, recorded by the tracker; historical records can predate ShelfSpring" },
      { t: "ul", items: [
        "**Start with the exact phone.** A store with one color may have none of the storage you want.",
        "**Use the timestamp.** A live listing is more useful for a purchase decision than an old screenshot.",
        "**Read a return as an event.** The [history](/restocks) counts a configuration becoming available again; it is not a count of phones delivered.",
        "**Confirm on Apple.** Only an accepted pickup order secures a phone for collection.",
      ] },
      { t: "img", id: "phone-notification" },
    ],
  },
  "apple store stock checker": {
    lead: "Build a small watchlist around the stores you would actually travel to. Browsing is free; a subscription lets the next confirmed return come to you as an alert.",
    blocks: [
      { t: "ol", items: [
        "Choose **Alert me**, then set the model, storage and color you would buy.",
        "Select reachable stores. One configuration watched at three stores uses three alert rules.",
        "On iPhone, open the installed ShelfSpring Home Screen app and enable notifications ([setup guide](/install)).",
        "Follow a restock notification to Apple, check that the pickup option is still offered, and finish your order there.",
      ] },
      { t: "table", head: ["Watchlist", "Monthly price", "Store × configuration rules"], rows: [["Plus", "$5", "10"], ["Pro", "$10", "20"], ["Max", "$20", "50"]], caption: "Choose the smallest plan that fits your actual shortlist. [Plan details and cancellation](/pricing).", source: "ShelfSpring subscription plans" },
      { t: "note", text: "**A useful trade-off:** add a second reachable store before watching a color you would not buy. More alerts help only when the resulting pickup is useful to you." },
      { t: "img", id: "apple-store-pickup-counter" },
    ],
  },
};

export const HOME_FAQ: Faq[] = [
  { q: "How does ShelfSpring decide that a phone has returned?", a: "A second observation must confirm the availability change. The underlying inventory is checked frequently. Source checks, synchronization and notification delivery can add delay; a subscription does not speed up the source checks." },
  { q: "Why compare the history with today's stock?", a: "Current stock helps you order now. History shows which configurations have returned and how long past listings lasted; neither a busy hour nor a frequent return guarantees the next one." },
  { q: "What is included before I subscribe?", a: "The stock pages, map and recorded restocks are free. Notifications cost $5/month for 10 rules, $10 for 20 or $20 for 50, with cancellation available in your account ([plans](/pricing))." },
  { q: "What do I need for notifications on an iPhone?", a: "Add shelfspring.com to the Home Screen from Safari, open that app, sign in and allow notifications. [The illustrated setup](/install) walks through those steps." },
  { q: "Does an alert reserve the phone?", a: "No. It is a prompt to check Apple. Complete the purchase with in-store pickup and wait for Apple's ready-to-collect message before travelling ([Apple's guidance](https://www.apple.com/shop/help/shipping_delivery))." },
];

export const HOME_SOURCES: Source[] = [
  { label: "Apple's shipping and pickup instructions", url: "https://www.apple.com/shop/help/shipping_delivery" },
  { label: "Apple's delivery and pickup options", url: "https://www.apple.com/shop/shipping-pickup" },
  { label: "Apple Newsroom: iPhone Duo retail availability, October 23, 2026", url: "https://www.apple.com/newsroom/2026/10/iphone-duo-arrives-at-apple-store-locations-worldwide/" },
];
