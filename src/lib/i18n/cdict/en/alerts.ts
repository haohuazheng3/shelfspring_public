/**
 * English client strings: the alert setup (AlertSetup, AlertEditor, PhoneMatrix, StorePicker, EmailSignIn,
 * PlanPanel, PlanButton). Plain data: "{name}" placeholders (format.fill, or Rich when a value is an element),
 * plural forms { one, other } with "#" for the number (format.plural). These values reproduce the site's
 * English text exactly, spaces and punctuation included (a leading space marks text that follows another
 * piece on the same line). Model names, storage sizes, plan names and "$5" amounts are filled in, never
 * translated; plans are billed in US dollars in every language.
 */
import type { CountryCode } from "@/lib/apple/countries";
import type { Forms } from "@/lib/i18n/format";

export const alerts = {
  /** The home page's block (AlertSetup). */
  setup: {
    title: "Build your watchlist",
    lead: "Start with the phones you would buy. Add reachable stores, then review the number of rules before choosing a plan.",
  },
  /** The lightbox's steps (phones → stores → turn on): the progress line and the buttons. */
  steps: { of: "Step {n} of {total}", next: "Next", back: "Back", finish: "Turn on" },

  /** The editor: phones × stores, the sum line, turning alerts on (AlertEditor). */
  editor: {
    /** Joins the two or three names a folded section lists. */
    listSep: ", ",
    phonesTitle: "01 · Choose your configurations",
    storesTitle: "02 · Choose your pickup locations",
    phonesNone: "Add a model, capacity and color below",
    storesNone: "Add stores you could realistically visit",
    phones: { one: "# configuration", other: "# configurations" } as Forms,
    stores: { one: "# store", other: "# stores" } as Forms,
    alerts: { one: "# alert", other: "# alerts" } as Forms,
    /** "3 alerts on the list · 1 configuration × 3 stores" ({phones}, {stores}, {alerts}: the three forms above; any order). */
    sum: "{alerts} on the list · {phones} × {stores}",
    pickBoth: "Nothing is watched until the list holds a configuration and a store.",
    /** {price}: "$5". */
    fits: "{plan} covers this: up to {limit} alerts, {price} a month.",
    overAny: "Above the largest allowance ({most} alerts).",
    tickStore: "Add a store next. Every configuration on the list is watched at every store you add.",
    tickPhone: "Add a configuration next. It is watched at each store already on the list.",
    tickEach: "Add a configuration and a store. Each pairing becomes one alert.",
    offUntilPlan: "Stored on your watchlist; inactive until a plan is active.",
    onWith: "{plan}: {on} active of {limit}",
    /** After onWith: " · {n} off". */
    off: " · {n} inactive",
    overPlan: "This would be {n} alerts, above the {limit} that {plan} allows. Remove one first, or move to a larger plan.",
    overMost: "This would be {n} alerts. No plan goes beyond {most}, so remove one first.",
    overPlanHave: "{have} alerts are stored, but {plan} sends only {limit}. Remove a few, or move to a larger plan.",
    upgradeTo: "Move to {plan} — {limit} alerts for ${price}/mo",
    saving: "Saving",
    saved: "✓ Logged",
    notSaved: "Save failed",
    saveFailed: "Your watchlist change wasn't stored",
    saveFailedStatus: "Not stored ({status})",
    checkoutUnavailable: "Checkout can't open right now",
    seePlans: "Compare plans",
    signIn: "Open your ShelfSpring workspace",
    signInLead: "Enter your email to receive a six-digit code. It opens your existing account or creates one here—there is no password to remember.",
    turnOn: { one: "Activate this alert", other: "Activate these # alerts" } as Forms,
    thenPlan: "After the email code comes the plan: {plan} covers this list for {price} a month, and renewal can be stopped whenever you like.",
    untickFew: "Trim the list first; no plan covers more than {most}.",
    continueWith: { one: "Save # alert and continue", other: "Save # alerts and continue" } as Forms,
    /** Before choosePlan, just after signing in. */
    savedN: { one: "# alert stored. ", other: "# alerts stored. " } as Forms,
    choosePlan: { one: "A plan activates it.", other: "A plan activates them." } as Forms,
    /** After "$5" in bold. */
    perMo: "/mo",
    fitsYour: " · covers your {n}",
    /** {fast}, {all}, {push}: "5 s", "15 s", "3 s" (format.unit). The only intervals the site states: 15 s and 5 s. */
    speedLine: "Alerts are sent after matching availability is detected. Source checks, synchronization and notification delivery can add delay.",
    /** After speedLine. */
    afterSpeed: " Billed monthly through Stripe (card or Link); renewal can be stopped at any time.",
    alertsOn: "✓ Watchlist active. ",
    /** {device}: the phone's name ("iPhone"), else `phone`. */
    goesTo: "Delivery goes to your {device}.",
    phone: "phone",
    /** {link}: getOnPhoneLink as a link. */
    getOnPhone: "{link}.",
    getOnPhoneLink: "Set up phone notifications",
    myAlerts: "My watchlist",
  },

  /** The phone grid (PhoneMatrix). */
  matrix: {
    model: "iPhone model",
    configs: "Configurations of {model}",
  },

  /** The store list (StorePicker). Place names come from i18n/places. */
  picker: {
    country: "Store country",
    find: "Search for a store",
    searchUs: "ZIP code, city, state or store name",
    search: "City or store name",
    /** {noun}: regionNoun of the country. */
    searchRegion: "City, {noun} or store name",
    locating: "Finding you",
    nearMe: "Locate me",
    nearestYou: "Sorted by distance from you",
    locatedNow: "Location updated — stores sorted by distance",
    locBlocked: "Location access is blocked for this site. Allow it in your browser or device settings, or enter a place.",
    zipNotFound: "Unknown ZIP; sorted from the closest matching area",
    /** {place}: a ZIP, a store ("Apple Fifth Avenue"), a city or a region. */
    nearestTo: "Sorted from {place}",
    regionFirst: "Stores in {place} first (A–Z), then the closest outside it",
    placeFirst: "Stores in {place} first, then the closest outside it",
    finding: "Looking up stores around you…",
    noLocationUs: "Location unavailable. Enter a ZIP or city, or browse by state",
    noLocation: "Location unavailable. Enter a city or a store name",
    noLocationRegion: "Location unavailable. Enter a city or store, or browse by {noun}",
    promptUs: "Start from a ZIP or city, or use Locate me",
    prompt: "Start from a city or store, or use Locate me",
    /** {unit}: `miles` or `km` (every language but English: km); {from}: `you` or a ZIP. */
    byRoad: "estimated road {unit} from {from}",
    miles: "miles",
    km: "km",
    you: "you",
    zip: "ZIP {zip}",
    zipForDistances: "distances appear once you enter a ZIP",
    nearMeForDistances: "distances appear after Locate me",
    alreadyOn: "{n} already watched",
    preticked: "closest {n} pre-selected",
    pickRegion: "Browse by {noun}",
    /** What a country's regions are called (the store list's level between country and city). */
    regionNoun: {
      us: "state", ca: "province", au: "state", uk: "area", de: "state", fr: "department", it: "province", es: "province", jp: "prefecture",
      sg: "area", hk: "area", ae: "emirate", ch: "canton", nl: "province", se: "county", at: "state", be: "region", kr: "province", tw: "city",
    } satisfies Record<CountryCode, string>,
    storesLabel: "Store list",
    on: "watched",
    turningOff: "removing",
    byRoadTitle: "Estimated road distance and drive time",
    /** The drive time of a store you are at. */
    here: "here",
    directions: "Route",
    /** {store}: "Apple Fifth Avenue". */
    directionsTo: "Route to {store}",
    showMore: "Next {n} stores",
    noMatchUs: "Nothing found. Try a ZIP code, a city or a state.",
    noMatch: "Nothing found. Try a city or a store name.",
    noMatchRegion: "Nothing found. Try a city, a {noun} or a store name.",
    alsoChosen: "Already on your list",
  },

  /** Email + code (EmailSignIn). */
  signIn: {
    sendCode: "Email me a code",
    sending: "Sending",
    verify: "Confirm code",
    verifying: "Checking",
    placeholder: "you@example.com",
    emailLabel: "Email address",
    codeLabel: "Six-digit code",
    invalidEmail: "That email address looks incomplete",
    enterCode: "Type the six digits from the email",
    incomplete: "Sign-in not finished ({status}). Please try once more",
    failed: "That didn't work. Please try again",
    /** {email}: the address, as an element. */
    codeSent: "A code is on its way to {email}",
    resend: "send again",
    changeEmail: "use another email",
    /** {terms}, {privacy}: termsLink and privacyLink as links. */
    terms: "Accounts are keyed to an email address and opened with a one-time code. Continuing means you accept the {terms} and the {privacy}.",
    termsLink: "Terms",
    privacyLink: "Privacy Policy",
    /**
     * Clerk's errors by code, for every language but English (English shows Clerk's own message, as always).
     * A code missing here shows Clerk's message.
     */
    clerk: {
      form_code_incorrect: "Those digits don't match. Look at the latest email and type them again.",
      verification_expired: "This code is no longer valid. Use send again for a fresh one.",
      verification_failed: "Several wrong attempts in a row. Use send again for a fresh code.",
      form_param_format_invalid: "That email address looks incomplete",
      form_identifier_exists: "An account already uses this email. Submit it again to sign in.",
      too_many_requests: "Attempts are paused briefly. Give it a minute and retry.",
      rate_limit_exceeded: "Attempts are paused briefly. Give it a minute and retry.",
      user_locked: "Sign-in to this account is temporarily blocked. Please retry later.",
    } as Record<string, string>,
  },

  /** The plan, changing and cancelling it (PlanPanel, ChangeConfirm, CancelConfirm). {price} and {amount}: "$5", "$4.17". */
  plan: {
    nextRenewal: "your next renewal",
    unavailable: "Not available at the moment",
    priceFailed: "The cost of this change couldn't be calculated",
    bankConfirm: "Your bank asks you to approve this payment.",
    notChanged: "Your plan is unchanged. Please retry shortly.",
    changeTo: "Move to {plan}",
    upgradeTo: "Step up to {plan}",
    switchTo: "Step down to {plan}",
    today: "Due now",
    /** An estimate (before Stripe has the exact figure). */
    about: "roughly {amount}",
    aboutCap: "Roughly {amount}",
    daysLeft: { other: "covering the remaining # days of this billing period" } as Forms,
    /** Before the credit in bold. */
    noCharge: "Nothing to pay. ",
    credit: "left on {plan} is credited against upcoming invoices",
    discount: "· covered by your discount",
    then: "Afterwards",
    perMonth: "{price} per month",
    from: "starting {date}",
    alerts: "Alert allowance",
    youHave: "· {n} in use",
    newestOff: "; the {n} most recent become inactive",
    paidWith: "Payment method",
    exactNote: "This is an estimate. Stripe bills the precise remaining-time amount, so the total can be a few cents off.",
    confirmPay: "Pay {amount} and move",
    confirmUpgrade: "Yes, step up",
    confirmSwitch: "Yes, step down",
    cancel: "Not now",
    finishOnStripe: "Complete it on Stripe",
    close: "Dismiss",
    cancelSub: "Stop renewal",
    cancelQ: "Stop renewing {plan}?",
    until: "Through {date}",
    /** {alerts}: "3 alerts" in bold (editor.alerts). */
    keepsWorking: "Nothing changes yet: {plan} keeps {alerts} active.",
    after: "From then on",
    /** {notCharged}: notCharged in bold. */
    alertsStop: "Delivery ends and {notCharged}.",
    notCharged: "no further payment is taken",
    yourAlerts: "Your watchlist",
    staySaved: "Remains stored. Subscribing again later reactivates it as it was.",
    keepPlan: "Keep renewing",
    notCancelled: "Renewal is still on; the request didn't go through. Please retry shortly.",
    notResumed: "Renewal is still off; the request didn't go through. Please retry shortly.",
    continues: "Renewal is back on: {plan} renews {date} at {price} per month.",
    paymentFailed: "last payment declined",
    onOf: "{on} active · allowance {limit}",
    overOff: " · {n} beyond the allowance, inactive",
    ends: " · ends {date}",
    renews: " · renews {date}",
    /** {date}: the end date, in bold. */
    cancelled: "Renewal stopped. {plan} runs until {date}; after that, delivery ends and no further payment is taken.",
    resume: "Turn renewal back on",
    savedOff: { one: "# alert is stored and waiting for a plan.", other: "# alerts are stored and waiting for a plan." } as Forms,
    startNow: "Delivery begins as soon as a plan is active.",
    /** After savedOff / startNow. */
    monthly: " Billed monthly; renewal can be stopped whenever you like.",
    /** After the plan's name. */
    row: " — {price} per month for {limit} alerts",
    fitsYour: "covers your {n}",
    yourPlan: "Current plan",
    upgrade: "Step up",
    switch: "Step down",
    choose: "Start {plan}",
    nowOn: "{plan} is now active, with room for {limit} alerts.",
    cancelledUntil: "Renewal stopped. {plan} stays active through {date} with no further payment.",
    billing: "Invoices and payment method",
    paidNote: "Stepping up bills the remaining days; stepping down leaves a credit.",
    checkoutNote: "Payment runs through Stripe: card or Link.",
  },

  /** The pricing page's plan buttons (PlanButton). */
  button: {
    onPlan: "✓ Current plan: {plan} · open",
    yourPlan: "Current plan · open",
  },
};
