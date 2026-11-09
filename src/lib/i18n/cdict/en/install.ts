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
    seeSteps: "Jump to the setup path",
    sendTest: "Send a test alert",
    turnOn: "Enable notifications",
    /** A device on the account already gets alerts: {label} is its name ("iPhone app"), {link} the "My alerts" link. */
    already: "**✓ A device is already receiving.** Alerts reach your {label}; follow the path below only to add this one as well. {link}",
    myAlerts: "My watchlist",
  },
  progress: {
    homeScreen: "Saved to Home Screen",
    signedIn: "Account open",
    on: "Notifications enabled",
    blocked: "Your settings block notifications; step {n} shows where to change that.",
  },
  steps: {
    title: "Follow your device’s path",
    intro: {
      ios: "Apple delivers web notifications on iPhone and iPad only to sites saved to the Home Screen, so that comes first.",
      android: "Chrome can deliver notifications from a normal tab; adding the app to your Home screen is optional.",
      desktop: "A desktop browser can receive alerts directly, with nothing to install.",
    },
    tabsLabel: "Device type",
    tabs: { ios: "iPhone or iPad", android: "Android phone", desktop: "Mac or PC" },
    ios: {
      safari: { title: "Load shelfspring.com in Safari", text: "The pictures follow Safari. Reading this inside another app? Open the site in your browser before continuing." },
      share: { title: "Find the Share button", text: "iPhone keeps it in the toolbar along the bottom; iPad shows it at the top of the window." },
      choose: { title: "Pick “Add to Home Screen” from the sheet", text: "It often sits below the first rows of actions, so scroll the list if it is missing." },
      add: { title: "Confirm with Add", text: "The suggested name, ShelfSpring, can stay as it is." },
      open: { title: "Launch the new icon and sign in again", text: "The Home Screen app keeps a separate session from Safari. Use your usual email and your watchlist appears unchanged." },
      allow: { title: "Press “Enable notifications”, then Allow", text: "You will find the button on your watchlist page inside the app. iOS shows its permission prompt a single time." },
    },
    android: {
      chrome: { title: "Load shelfspring.com in Chrome", text: "Edge and Samsung Internet behave the same way; browsers built into other apps do not support this." },
      /** Chrome offered its install prompt. */
      install: { title: "Accept Chrome’s install offer", text: "A single confirmation. Nothing comes from an app store." },
      /** No prompt: Chrome's menu. */
      menu: { title: "Use ⋮, then “Add to Home screen”", text: "Some Chrome versions call this entry **Install app**." },
      open: { title: "Launch ShelfSpring and sign in", text: "The icon appears on your Home screen or in the app drawer. Sign in with your usual email to see the same watchlist." },
      allow: { title: "Press “Enable notifications”, then Allow", text: "Android shows its permission prompt one time. The same button also works from an ordinary Chrome tab." },
    },
    desktop: {
      allow: { title: "Press “Enable notifications”", text: "Chrome, Edge, Firefox and Safari 16.1+ on macOS Ventura or later are supported. Approve the permission prompt your browser shows." },
      install: { title: "Optional: run ShelfSpring in its own window", text: "Chrome and Edge show an install icon for this. Whether alerts arrive in the background depends on the browser and your system settings." },
      phone: { title: "Add your phone as well", text: "Use the same email address on the phone. Each device with notifications enabled receives each alert." },
    },
  },
  action: {
    install: "Install ShelfSpring",
    on: "✓ This device is enabled.",
    sendTest: "Send a test alert",
    needsInstall: "This button works inside the Home Screen app, not in Safari.",
    signInFirst: "Sign in to continue",
    signInThenOn: "Sign in to enable",
    turnOn: "Enable notifications",
    denied: "Notifications are blocked. Allow ShelfSpring in Settings and reload the page.",
  },
  notes: [
    { q: "Is Safari the only option on iPhone?", a: "The pictures follow Safari’s Share menu. On iOS and iPadOS 16.4 or later, other supported browsers can also offer Add to Home Screen. Open the installed Home Screen app to enable web notifications." },
    { q: "Does my phone keep checking inventory?", a: "Inventory checks run on our servers. Your browser or Home Screen app handles notification delivery and display." },
    { q: "What happens without any enabled device?", a: "Each alert is then emailed to your account address. With a device enabled, alerts are pushed to it, and email steps in only when no device can be reached." },
    { q: "Can more than one device receive alerts?", a: "Yes. Use one email address wherever you sign in; each device with notifications enabled receives each alert." },
  ],
  cta: { title: "A ready device needs a useful watchlist.", button: "Choose phones and pickup stores" },

  /**
   * The illustrations (components/push/Mocks.tsx): the OS's own labels in that language. The share sheet draws only
   * addToHome in words (its other rows, the add dialog's note and the iOS prompt's body are drawn as blank bars);
   * those entries stay so every language keeps the same shape.
   */
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
    desktopInstall: { callout: "Install", title: "Install ShelfSpring", text: "Runs in a separate window", cancel: "Cancel", install: "Install" },
    lockScreen: { date: "Thursday, October 29", now: "now", title: "iPhone 18 Pro 256GB Black", body: "Apple Fifth Avenue · New York, NY — on the shelf for pickup. Open apple.com to order." },
  },
};
