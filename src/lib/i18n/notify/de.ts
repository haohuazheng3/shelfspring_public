/**
 * Notification texts in German (push, alert email, "notifications stopped" email, Stripe checkout line).
 * Plain TS, no imports but types: the poller sends these too. Switzerland gets them with ß → ss.
 */
import type { NotifyText } from "./en";

export const notifyDe: NotifyText = {
  pushTitle: (cfg: string) => cfg,
  pushBody: (where: string, quote: string | null) => `${where}${quote ? ` – ${quote}` : ""}. Tippen, um auf apple.com zu reservieren.`,
  testTitle: "ShelfSpring-Mitteilungen sind an",
  testBody: (time: string, device: string) => `${time} · ${device}. Alarme werden nach Erkennung passender Verfügbarkeit gesendet. Quellprüfung, Synchronisierung und Zustellung können Verzögerungen verursachen.`,
  device: {
    iphoneApp: "iPhone (Home-Bildschirm-App)",
    iphoneSafari: "iPhone (Safari)",
    androidApp: "Android (installierte App)",
    android: (browser: string) => `Android${browser ? ` (${browser})` : ""}`,
    computer: (browser: string) => `Computer${browser ? ` (${browser})` : ""}`,
    other: "dieses Gerät",
  },
  email: {
    subject: (cfg: string, store: string, more: number) => `Verfügbar: ${cfg} bei ${store}${more > 0 ? ` +${more} weitere` : ""}`,
    intro: "Gute Nachricht – jetzt zur Abholung im Store verfügbar:",
    reserve: "Reservieren",
    store: "Store",
    tip: "Abhol-Ware ist schnell weg: Öffnen Sie die Apple Store App oder apple.com, wählen Sie „Abholen“ und dann den Store.",
    manage: (url: string) => `Diesen Alarm verwalten oder pausieren: ${url}`,
    htmlTitle: "Jetzt zur Abholung verfügbar",
    htmlReserve: "Auf apple.com reservieren",
    htmlStorePage: "Store-Seite →",
    htmlTip: "Abhol-Ware ist schnell weg – reservieren Sie in der Apple Store App oder auf apple.com, wählen Sie <b>Abholen</b> und dann den Store.",
    htmlManage: "Diesen Alarm verwalten oder pausieren",
    cancel: (url: string) => `Schon Ihr iPhone bekommen? Jederzeit kündbar: ${url}`,
    htmlGotIt: "Schon Ihr iPhone bekommen?",
    htmlCancel: "Jederzeit kündigen",
    nudge: (url: string) => `Für Ihr Konto sind auf keinem Handy Mitteilungen aktiv. Alarme kommen daher derzeit per E-Mail. Öffnen Sie ShelfSpring vom Home-Bildschirm, melden Sie sich an und aktivieren Sie Mitteilungen auf diesem Gerät. Alarme werden nach Erkennung passender Verfügbarkeit gesendet. Quellprüfung, Synchronisierung und Zustellung können Verzögerungen verursachen. ${url}`,
    htmlNudge: (url: string) => `Für Ihr Konto sind auf keinem Handy Mitteilungen aktiv. Alarme kommen daher derzeit per E-Mail. Öffnen Sie ShelfSpring vom Home-Bildschirm, melden Sie sich an und aktivieren Sie Mitteilungen auf diesem Gerät. Alarme werden nach Erkennung passender Verfügbarkeit gesendet. Quellprüfung, Synchronisierung und Zustellung können Verzögerungen verursachen. <a href="${url}" style="color:#0a7f3f">ShelfSpring →</a>`,
  },
  checkoutSubmit: (plan: string, limit: number, _fastSec: number, _checkSec: number, _alertSec: number) => { void _fastSec; void _checkSec; void _alertSec; return `${plan}: ${limit} Benachrichtigungen. Häufige Bestandsupdates; Meldung nach erkannter Verfügbarkeit. Erfassung und Zustellung können sich verzögern. Monatlich, jederzeit kündbar.`; },
  stopped: {
    deviceWord: { ios: "iPhone", android: "Android-Handy", desktop: "Computer", other: "Gerät" },
    subject: (device: string) => `Mitteilungen auf Ihrem ${device} gestoppt – ShelfSpring vom Home-Bildschirm öffnen`,
    gone: (device: string) => `Ihr ${device} nimmt keine ShelfSpring-Mitteilungen mehr an (der Push-Dienst meldet, dass das Abo nicht mehr existiert).`,
    byEmail: "Restock-Alarme für Ihre Regeln kommen jetzt per E-Mail, bis Sie Mitteilungen wieder einschalten.",
    reopenIos: "Öffnen Sie ShelfSpring vom Home-Bildschirm (nicht in Safari) und tippen Sie auf der Kontoseite auf „Mitteilungen einschalten“.",
    reopenOther: "Öffnen Sie ShelfSpring, gehen Sie zu „Konto“ und tippen Sie auf „Mitteilungen einschalten“.",
    causes: "Häufige Ursachen: Die App wurde vom Home-Bildschirm entfernt, Mitteilungen wurden in den Einstellungen ausgeschaltet, oder das Handy wurde wiederhergestellt.",
  },
  nudge: {
    subject: "Bestandsalarme auf dem Handy einrichten",
    intro: "Für Ihr Konto sind auf keinem Handy Mitteilungen aktiv. Alarme kommen daher derzeit per E-Mail. Öffnen Sie ShelfSpring vom Home-Bildschirm, melden Sie sich an und aktivieren Sie Mitteilungen auf diesem Gerät. Alarme werden nach Erkennung passender Verfügbarkeit gesendet. Quellprüfung, Synchronisierung und Zustellung können Verzögerungen verursachen.",
    howTitle: "In unter einer Minute einschalten:",
    stepsIos: ["Öffnen Sie shelfspring.com auf dem iPhone in Safari, tippen Sie auf Teilen und dann auf „Zum Home-Bildschirm“.", "Öffnen Sie ShelfSpring vom Home-Bildschirm (nicht in Safari) und melden Sie sich an.", "Tippen Sie auf der Kontoseite auf „Mitteilungen einschalten“ und dann auf „Erlauben“."],
    stepsOther: "Auf Android oder am Computer: shelfspring.com/account öffnen und auf „Mitteilungen einschalten“ tippen.",
    after: "Bis ein Gerät eingeschaltet ist, kommen Ihre Alarme weiter per E-Mail; danach kommen sie als Mitteilung, und die E-Mail hört auf.",
    cta: (url: string) => `Anleitung mit Bildern: ${url}`,
  },
};
