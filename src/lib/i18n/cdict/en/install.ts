/**
 * English client strings: install (the /install guide and its hand-drawn phone screens). The mock labels imitate the
 * operating system's own UI ("Share", "Add to Home Screen", "Allow"): a translation uses the words iOS, Android and
 * Chrome show in that language, not a fresh rendering.
 */
export const install = {
  hero: {
    eyebrow: "Device setup",
    title: "Give your watchlist a way to reach you.",
    lead: "Choose your device below and follow its setup path. ShelfSpring checks inventory on the server; this device receives a notification after a matching change is confirmed. Delivery timing varies.",
    seeSteps: "See the steps",
    sendTest: "Send a test",
    turnOn: "Turn on notifications",
    /** A device on the account already gets alerts: {label} is its name ("iPhone app"), {link} the "My alerts" link. */
    already: "**✓ You're set up.** Alerts go to your {label}. The steps below add this device too. {link}",
    myAlerts: "My alerts",
  },
  progress: {
    homeScreen: "On the Home Screen",
    signedIn: "Signed in",
    on: "Notifications on",
    blocked: "Blocked in settings — see step {n}.",
  },
  steps: {
    title: "Follow your device’s path",
    intro: {
      ios: "On iPhone and iPad, notifications only work from the Home Screen app.",
      android: "Installing is optional on Android; Chrome can notify on its own.",
      desktop: "Works in the browser. No install needed.",
    },
    tabsLabel: "Your device",
    tabs: { ios: "iPhone / iPad", android: "Android", desktop: "Computer" },
    ios: {
      safari: { title: "Open shelfspring.com in Safari", text: "This illustrated path uses Safari. If you are inside another app, open the site in your browser first." },
      share: { title: "Tap Share", text: "Bottom bar on iPhone, top on iPad." },
      choose: { title: "Choose “Add to Home Screen”", text: "Scroll down if you don't see it." },
      add: { title: "Tap Add", text: "Keep the name ShelfSpring." },
      open: { title: "Open it from the Home Screen and sign in", text: "The app has its own sign-in. Same email, same alerts." },
      allow: { title: "Tap “Turn on notifications”, then Allow", text: "The button is on your alerts page. iPhone asks once." },
    },
    android: {
      chrome: { title: "Open shelfspring.com in Chrome", text: "Samsung Internet and Edge also work. In-app browsers don't." },
      /** Chrome offered its install prompt. */
      install: { title: "Install the app", text: "One tap, no app store." },
      /** No prompt: Chrome's menu. */
      menu: { title: "Menu ⋮ → “Add to Home screen”", text: "Sometimes labeled **Install app**." },
      open: { title: "Open ShelfSpring and sign in", text: "From your Home Screen or app drawer. Same email, same alerts." },
      allow: { title: "Tap “Turn on notifications”, then Allow", text: "Android asks once. Also works in the Chrome tab." },
    },
    desktop: {
      allow: { title: "Tap “Turn on notifications”", text: "Use a supported browser such as Chrome, Edge, Firefox, or Safari 16.1+ on macOS Ventura or later. Check the browser’s permission prompt." },
      install: { title: "Optional: give ShelfSpring its own window", text: "Use the install icon in Chrome or Edge. Background delivery depends on the browser and your operating system settings." },
      phone: { title: "Your phone too", text: "Sign in on your phone with the same email. Every device with notifications on gets every alert." },
    },
  },
  action: {
    install: "Install ShelfSpring",
    on: "✓ Notifications are on for this device.",
    sendTest: "Send a test",
    needsInstall: "Available once you open the Home Screen app.",
    signInFirst: "Sign in first",
    signInThenOn: "Sign in, then turn on",
    turnOn: "Turn on notifications",
    denied: "Blocked. Allow ShelfSpring in Settings, then reload.",
  },
  notes: [
    { q: "Why does this guide show Safari?", a: "The pictures follow Safari’s Share menu. On iOS and iPadOS 16.4 or later, other supported browsers can also offer Add to Home Screen. Open the installed Home Screen app to enable web notifications." },
    { q: "Does my phone keep checking inventory?", a: "Inventory checks run on our servers. Your browser or Home Screen app handles notification delivery and display." },
    { q: "Email?", a: "No device with notifications on? The alert goes to your email instead." },
    { q: "Several devices?", a: "Sign in with the same email on each. Every device gets every alert." },
  ],
  cta: { title: "A ready device needs a useful watchlist.", button: "Choose phones and pickup stores" },

  /** The illustrations (components/push/Mocks.tsx): the OS's own labels in that language. */
  mocks: {
    share: "Share",
    shareSheet: { copy: "Copy", readingList: "Add to Reading List", bookmark: "Add Bookmark", favorites: "Add to Favorites", addToHome: "Add to Home Screen", markup: "Markup" },
    addDialog: { cancel: "Cancel", title: "Add to Home Screen", add: "Add", note: "An icon will be added to your Home Screen so you can quickly access this website." },
    iosAlert: { title: "“ShelfSpring” Would Like to Send You Notifications", text: "Notifications may include alerts, sounds and icon badges. These can be configured in Settings.", dontAllow: "Don’t Allow", allow: "Allow" },
    chromeMenuLabel: "Menu",
    /** Chrome's ⋮ menu: the rows above "Add to Home screen", that row, the rows below it. */
    chromeMenu: { before: ["New tab", "History", "Downloads", "Bookmarks", "Share…"], add: "Add to Home screen", after: ["Desktop site"] },
    androidAlert: { title: "Allow ShelfSpring to send you notifications?", dontAllow: "Don’t allow", allow: "Allow" },
    desktopAlert: { wantsTo: "shelfspring.com wants to", show: "Show notifications", block: "Block", allow: "Allow" },
    desktopInstall: { callout: "Install", title: "Install ShelfSpring", text: "Opens in its own window", cancel: "Cancel", install: "Install" },
    lockScreen: { date: "Thursday, October 29", now: "now", title: "iPhone 18 Pro 256GB Black", body: "Apple Fifth Avenue · New York, NY — Available Today. Tap to reserve on apple.com." },
  },
};
