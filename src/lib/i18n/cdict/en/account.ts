/**
 * English client strings: account (the dashboard's client parts, the notification card every app page shows, the
 * device labels the server sends with it). Plain data: "{name}" → fill(), { one, other } → plural(), **bold** → <Rich>
 * (or the class-less <b> renderer in PushSetup).
 */
export const account = {
  signOut: "Sign out of ShelfSpring",

  /** Device names (lib/devices.ts, summarised for "Alerts already reach your {label}") and the device list. */
  devices: {
    iphone: "iPhone",
    ipad: "iPad",
    /** A Home Screen install of the site: "iPhone app". */
    app: "{device} app",
    android: "Android phone",
    computer: "computer",
    device: "device",
    many: { one: "{n} device", other: "{n} devices" },
    platforms: { ios: "iPhone or iPad", android: "Android phone", desktop: "Mac or PC", unknown: "Unrecognised device" } as Record<string, string>,
    homeScreenApp: "Home Screen app",
    browser: "browser",
    /** Follows the platform name; keep the leading " · ". */
    meta: " · {kind} · registered {added}",
    lastAlert: " · latest delivery {when}",
    stopped: "no longer receiving; enable it again on that device",
    remove: "Forget device",
  },

  /** The notification card (PushSetup) and its state machine (usePush). */
  push: {
    title: "Notifications on this device",
    pill: { checking: "Checking…", "in-app-browser": "Needs Safari", "needs-install": "Not on Home Screen", unsupported: "Not supported", "needs-signin": "Signed out", denied: "Blocked", ready: "Off", on: "Enabled" },
    explain: {
      checking: "Looking at what this device supports…",
      inAppBrowser: "This page is open inside another app. Use its ··· menu and pick **Open in Safari** (or Chrome).",
      needsInstall: "iPhone and iPad deliver web notifications only to sites saved to the Home Screen.",
      unsupported: "Notifications aren't available in this browser; your alerts arrive by email.",
      needsSignin: "Notifications are tied to your account, so sign in on this device first.",
      deniedIos: "Allow in **Settings → Notifications → ShelfSpring**, then reload.",
      denied: "Notifications are blocked for this site. Allow them in the browser's site settings and reload.",
      readyIos: "Off on this iPhone or iPad, so alerts currently go to your email. Press **Enable notifications**, then **Allow**, to receive them here. Detection, synchronization and delivery can each add delay.",
      readyDevice: "Off on this device, so alerts currently go to your email. Press **Enable notifications** to receive them here. Detection, synchronization and delivery can each add delay.",
      readyBrowser: "Off in this browser, so alerts currently go to your email. Press **Enable notifications** to receive them here. Detection, synchronization and delivery can each add delay.",
      on: "Alerts are sent after matching availability is detected. Source checks, synchronization and notification delivery can add delay.",
    },
    /** Another device on the account already gets the alerts; {label} is a device name ("iPhone app", "2 devices"). */
    elsewhere: {
      needsInstall: "Alerts already reach your {label}. On iPhone they appear through the Home Screen app, never in Safari.",
      ready: "Alerts already reach your {label}. Enable this device as well to get them here too.",
      denied: "Alerts already reach your {label}; this browser has notifications blocked.",
      other: "Alerts already reach your {label}.",
    },
    turnOnToo: "Enable this device too",
    sendTest: "Send a test alert",
    showMeHow: "Open the setup guide",
    signIn: "Sign in",
    installApp: "Install app",
    turnOn: "Enable notifications",
    turnOff: "Disable",
    setupGuide: "Device setup guide",
    /** iPhone in Safari: the three steps under the card (iOS's own words for Share / Add to Home Screen). */
    miniSteps: ["Safari’s Share button", "Add to Home Screen", "Launch the icon, then Allow"],
    /** "Send a test": what the server answered. {device} names come from the server. */
    test: {
      gone: "The browser's push service no longer recognises this device. Disable and re-enable notifications on it.",
      none: "The test reached no device{error}. Disable notifications, then enable them again.",
      noneError: " ({error})",
      soon: "The test is sent in {s} seconds. Go to your Home Screen or lock your phone now: iPhone doesn't show banners while this app is open.",
      iosHint: "No banner? iPhone doesn't show banners while this app is open. Swipe down from the top of the screen to check Notification Center.",
      away: "The test was sent while the app was in the background. If no banner appeared, swipe down from the top of the screen to check Notification Center.",
      sent: "Test sent at {when} to {where}. Check that device for the banner; delivery time can vary.{failed}",
      one: "your {device}",
      many: "{n} devices ({list})",
      /** Appended after a space. */
      failed: { one: "Delivery to {n} device did not go through.", other: "Delivery to {n} devices did not go through." },
    },
    errors: {
      notSaved: "This device wasn't registered. Please retry",
      notConfigured: "Notification delivery isn't set up on the server yet",
      allow: "The browser needs your permission before alerts can arrive",
      notSavedPlain: "This device wasn't registered",
      noTest: "The test alert didn't go out",
      noServiceWorker: "The background worker for notifications isn't available",
    },
    onNotice: "This device is enabled. A test alert shows you what a real one looks like.",
  },

  /**
   * The restock timeline. {zone} is "Eastern" in English (hence "{zone} time"); in other languages it is the full
   * zone name from Intl ("日本標準時", "Mitteleuropäische Zeit"), which already says "time": translations drop the word.
   * {time} and {gap} arrive formatted ("9:25 AM", "2 h 5 min").
   */
  timeline: {
    title: "Return times, in order",
    badge: "Logged history · no prediction",
    window: "{yours} · {days}-day window",
    order: "clock order, {zone} time",
    bars: "bar length shows how often",
    mixedSome: "few returns logged at yours; other stores in this time zone are added",
    mixedNone: "no returns logged at yours yet; other stores in this time zone stand in",
    otherStores: "Other stores keeping {zone} time",
    empty: "No returns logged yet. Rows appear as they are recorded.",
    listLabel: "Logged return times, {zone} time",
    now: "Now",
    nowLabel: "Now, {time}",
    nowNext: ". Next logged time {soon}",
    aboutNow: "right about now",
    in: "in {gap}",
    reportedPrefix: "Third-party · ",
    tomorrow: "tomorrow",
    nextTomorrow: "Next: {time} tomorrow, {soon}",
    /** Row labels for screen readers. */
    rowReported: { one: "{time}: {n} third-party report for {where}", other: "{time}: {n} third-party reports for {where}" },
    rowMine: { one: "{time}: {n} return logged at {where}", other: "{time}: {n} returns logged at {where}" },
    rowArea: { one: "{time}: {n} return logged at {where}, {zone} time", other: "{time}: {n} returns logged at {where}, {zone} time" },
    rowNext: ", next",
    rowNextTomorrow: ", next, tomorrow",
    /** Tooltip on a row's bar. */
    often: { one: "{days}-day window: {n} return logged near this time", other: "{days}-day window: {n} returns logged near this time" },
    oftenReported: { one: "{days}-day window: {n} third-party report near this time", other: "{days}-day window: {n} third-party reports near this time" },
    hidden: { one: "Only the busiest times are listed; {n} return at a quieter time is left out.", other: "Only the busiest times are listed; {n} returns at quieter times are left out." },
    /** Starts the third-party footnote, before the shared text naming the sources. */
    reportMark: "Dashed rings",
  },
  /** The dashboard's language setting. */
  language: {
    title: "Language",
    label: "One language for this dashboard, notifications and alert emails",
    help: "Notifications, alert emails and the Stripe checkout use the language chosen here. Prices keep each store's currency and times keep each store's time zone.",
    alertsIn: "Alerts are being written in {lang} at the moment.",
    saving: "Saving…",
  },
};
