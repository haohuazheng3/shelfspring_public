/**
 * Notification texts (push, alert email, "notifications stopped" email, device names), English. Plain TS with no
 * imports: the poller sends these too. Every language mirrors this shape in notify/<lang>.ts.
 */
export const notifyEn = {
  /** Push title: "iPhone Duo 256GB Night Sky" alone (`cfg` = model, storage and colour as the reader writes them): a prefix pushed the colour past the one-line banner. */
  pushTitle: (cfg: string) => cfg,
  /** Push body: `where` = "Apple SoHo · New York, NY"; `quote` = Apple's own pickup wording, when it is in the reader's language. */
  pushBody: (where: string, quote: string | null) => `${where}${quote ? ` — ${quote}` : ""}. Tap to reserve on apple.com.`,
  testTitle: "ShelfSpring notifications are on",
  testBody: (time: string, device: string) => `${time} · ${device}. Alerts are sent after matching availability is detected. Source checks, synchronization and notification delivery can add delay.`,
  device: {
    iphoneApp: "iPhone (Home Screen app)",
    iphoneSafari: "iPhone (Safari)",
    androidApp: "Android (installed app)",
    android: (browser: string) => `Android${browser ? ` (${browser})` : ""}`,
    computer: (browser: string) => `computer${browser ? ` (${browser})` : ""}`,
    other: "this device",
  },
  email: {
    /** `more`: how many other alerts the same email carries (0 = none). */
    subject: (cfg: string, store: string, more: number) => `In stock: ${cfg} at ${store}${more > 0 ? ` +${more} more` : ""}`,
    intro: "Good news — available for in-store pickup right now:",
    reserve: "Reserve",
    store: "Store",
    tip: 'Pickup stock moves fast: open the Apple Store app or apple.com, choose "Pick up", and select the store.',
    manage: (url: string) => `Manage or pause this alert: ${url}`,
    htmlTitle: "In stock for pickup now",
    htmlReserve: "Reserve on apple.com",
    htmlStorePage: "Store page →",
    /** HTML: <b>…</b> allowed. */
    htmlTip: "Pickup stock moves fast — reserve in the Apple Store app or on apple.com, choose <b>Pick up</b> and select the store.",
    htmlManage: "Manage or pause this alert",
    /** The plan's way out, under every alert: `url` = /account/cancel (lands on the plan's cancel step). */
    cancel: (url: string) => `Got your iPhone? Cancel anytime: ${url}`,
    htmlGotIt: "Got your iPhone?",
    htmlCancel: "Cancel anytime",
    /** Under every alert that went by e-mail: the faster way exists. `url` = /install. */
    nudge: (url: string) => `Phone notifications are off for your account, so alerts currently arrive by email. Open ShelfSpring from your Home Screen, sign in and turn on notifications to receive alerts on this device. Alerts are sent after matching availability is detected. Source checks, synchronization and notification delivery can add delay. ${url}`,
    /** HTML: <b> and the link allowed; `url` is already escaped. */
    htmlNudge: (url: string) => `Phone notifications are off for your account, so alerts currently arrive by email. Open ShelfSpring from your Home Screen, sign in and turn on notifications to receive alerts on this device. Alerts are sent after matching availability is detected. Source checks, synchronization and notification delivery can add delay. <a href="${url}" style="color:#0a7f3f">ShelfSpring →</a>`,
  },
  /** The one e-mail (at most every 14 days) to a member whose alerts go by e-mail: turn notifications on. */
  nudge: {
    subject: "Set up restock alerts on your phone",
    intro: "Phone notifications are off for your account, so alerts currently arrive by email. Open ShelfSpring from your Home Screen, sign in and turn on notifications to receive alerts on this device. Alerts are sent after matching availability is detected. Source checks, synchronization and notification delivery can add delay.",
    howTitle: "Turn them on in under a minute:",
    stepsIos: ["On your iPhone, open shelfspring.com in Safari, tap Share, then Add to Home Screen.", "Open ShelfSpring from the Home Screen (not Safari) and sign in.", "On the Account page, tap Turn on notifications, then Allow."],
    stepsOther: "On Android or a computer: open shelfspring.com/account and tap Turn on notifications.",
    after: "Until a device is on, your alerts keep coming by email; from then on they arrive as notifications, and the email stops.",
    cta: (url: string) => `Setup guide with pictures: ${url}`,
  },
  /** Stripe Checkout's line above the pay button: the plan, its alerts, how fast checks run (5 s / 15 s / ~3 s push). */
  checkoutSubmit: (plan: string, limit: number, _fastSec: number, _checkSec: number, _alertSec: number) => { void _fastSec; void _checkSec; void _alertSec; return `${plan}: ${limit} alerts. Frequent stock updates; alerts follow detected availability. Collection and delivery can add delay. Monthly, cancel anytime.`; },
  stopped: {
    deviceWord: { ios: "iPhone", android: "Android phone", desktop: "computer", other: "device" },
    subject: (device: string) => `Notifications stopped on your ${device} — open ShelfSpring from the Home Screen`,
    gone: (device: string) => `Your ${device} stopped accepting ShelfSpring notifications (the push service reported the subscription is gone).`,
    byEmail: "Restock alerts for your rules now arrive by email until you turn notifications back on.",
    reopenIos: 'Open ShelfSpring from your Home Screen (not Safari) and tap "Turn on notifications" on the Account page.',
    reopenOther: 'Open ShelfSpring, go to Account and tap "Turn on notifications".',
    causes: "Common causes: the app was removed from the Home Screen, notifications were switched off in Settings, or the phone was restored.",
  },
};
export type NotifyText = typeof notifyEn;
