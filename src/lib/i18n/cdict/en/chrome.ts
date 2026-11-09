/** English client strings: chrome — header nav, sign-in link, language/country switch, search, theme, consent, the floating alert button, live "checked … ago", error page. */
export const chrome = {
  nav: {
    duoStock: "iPhone Duo",
    restocks: "Return log",
    map: "Shelf map",
    stores: "Store directory",
    pricing: "Plans",
    getApp: "Home Screen app",
    home: "ShelfSpring start page",
    main: "Primary",
    sections: "Site sections",
  },
  /** Header account slot: signed in → the watchlist (dashboard); signed out → sign-in. */
  auth: { myAlerts: "Watchlist", signIn: "Log in" },
  switcher: {
    /** Button label: "Market: Japan. Change market". */
    aria: "Market: {country}. Change market",
    title: "Change market",
    language: "Reading language",
    country: "Market",
  },
  theme: { toLight: "Use light pages", toDark: "Use dark pages", light: "Light pages", dark: "Dark pages" },
  search: {
    open: "Find a state, city or store",
    label: "Find",
    placeholder: "Store, city, state, ZIP or iPhone model",
    clear: "Erase",
    cancel: "Close",
    /** Heading over the example searches (shown below the shortcuts). */
    try: "Sample searches",
    /** Heading over the shortcuts (shown first). */
    goTo: "Jump straight to",
    loading: "Opening the index…",
    results: "Matches",
    none: "No match for “{q}”. State, city and store names work, and so do 5-digit ZIP codes.",
    kinds: { store: "Store", city: "City", state: "State", model: "iPhone", page: "Section", country: "Market" },
    shortcuts: { duo: "iPhone Duo, store by store", log: "Return log, newest first", map: "Shelf map", stores: "Directory of 269 stores", storesHere: "Store directory" },
  },
  consent: {
    region: "Analytics question",
    title: "May we include this visit in our counts?",
    body: "ShelfSpring uses one analytics tool, FlowGlance, to learn which pages help people reach a phone. It logs the pages you open, your clicks and how you use forms; while you are signed in, that activity is tied to your email. It stays off unless you say yes.",
    details: "Read more",
    accept: "Yes, count it",
    decline: "No thanks",
    off: "Analytics paused ·",
    turnOn: "Resume",
    dontTrack: "Pause analytics",
  },
  /** The floating button that opens the watch setup with the page's store or phone filled in. */
  alertBar: { cta: "Set an alert" },
  refresh: { busy: "Refreshing the record…", done: "Record refreshed" },
  time: { today: "{time} today", yesterday: "{time} yesterday" },
  error: {
    title: "The page stopped loading",
    body: "A fault on our side interrupted this page. Watches are unaffected: store checks and push delivery keep running. The page retries on its own.",
    retry: "Retry now",
    home: "Start page",
    tried: { one: "Attempt #. ", other: "Attempts so far: #. " },
    next: "Next attempt in {s} s.",
    reference: "Error reference {id}",
  },
  /** On an English country page whose language has its own version: "日本語で見る" style offer (shown in that language). */
  suggest: { view: "This page also exists in {lang}", dismiss: "Not now" },
  /**
   * Error messages the server sends (English) → what the reader sees. Keys are the server's exact English text; each
   * language gives its own wording. Templates: {n} / {cap} / {count} / {store} / {config} filled from the English message.
   */
  apiErrors: {
    "sign in first": "sign in first",
    "too many requests": "too many requests",
    "bad request": "bad request",
    "could not save the rules — try again": "could not save the rules — try again",
    "too many changes — wait a minute": "too many changes — wait a minute",
    "no billing account yet": "no billing account yet",
    "push is not configured on the server": "push is not configured on the server",
    "too many tests — try again in an hour": "too many tests — try again in an hour",
    "no device has notifications on": "no device has notifications on",
    "no plan to change — choose one first": "no plan to change — choose one first",
    "that is your plan already": "that is your plan already",
    "watch not found": "watch not found",
    "not found": "not found",
    "There is no subscription to change.": "There is no subscription to change.",
    "Couldn't price the change. Try again in a minute.": "Couldn't price the change. Try again in a minute.",
    "Plan changes are offline for a moment. Your current plan keeps working.": "Plan changes are offline for a moment. Your current plan keeps working.",
    "Billing is offline for a moment. Your plan keeps working.": "Billing is offline for a moment. Your plan keeps working.",
    "Billing didn't open. Try again in a minute.": "Billing didn't open. Try again in a minute.",
    "Checkout didn't open. Try again in a minute.": "Checkout didn't open. Try again in a minute.",
    "Subscription changes are offline for a moment. Try again shortly, or use Billing and invoices.": "Subscription changes are offline for a moment. Try again shortly, or use Billing and invoices.",
    "Your bank needs to confirm the payment. Your plan stays as it is until it goes through.": "Your bank needs to confirm the payment. Your plan stays as it is until it goes through.",
  },
  apiErrorTemplates: {
    tooMany: "that is {n} alerts — at most {cap} per account",
    capped: "you can keep at most {cap} alerts — {count} of these were not saved; delete some first",
    full: "you can keep at most {cap} alerts — delete some first",
    room: "you can keep at most {cap} alerts — room for {count} more; untick some stores or delete alerts first",
    notSold: "{config} is not sold at {store} ({country})",
    unknownStore: "unknown store {store}",
    unknownConfig: "unknown configuration {config}",
  },
};
