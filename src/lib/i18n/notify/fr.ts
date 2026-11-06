/**
 * Textes de notification en français (notification push, e-mail d’alerte, e-mail « notifications arrêtées », ligne
 * du paiement Stripe). Code du poller : aucun import hors types. La typographie française (espaces insécables avant
 * : ; ? ! % et dans « ») est appliquée à la fin, sur chaque chaîne et chaque résultat de fonction.
 */
import type { NotifyText } from "./en";

const nb = (s: string): string => s.replace(/ ([:;?!%»])/g, (_m, p: string) => `${p === ":" || p === "»" ? " " : " "}${p}`).replace(/« /g, "« ");
function typo<T>(d: T): T {
  if (typeof d === "string") return nb(d) as T;
  if (Array.isArray(d)) return d.map((x) => typo(x)) as T;
  if (typeof d === "function") return ((...a: unknown[]) => typo((d as (...x: unknown[]) => unknown)(...a))) as T;
  if (d && typeof d === "object") return Object.fromEntries(Object.entries(d).map(([k, v]) => [k, typo(v)])) as T;
  return d;
}

const raw: NotifyText = {
  pushTitle: (cfg) => cfg,
  pushBody: (where, quote) => `${where}${quote ? ` — ${quote}` : ""}. Touchez pour réserver sur apple.com.`,
  testTitle: "Les notifications ShelfSpring sont activées",
  testBody: (time: string, device: string) => `${time} · ${device}. Les alertes sont envoyées après détection d’une disponibilité correspondante. La vérification à la source, la synchronisation et la livraison peuvent ajouter un délai.`,
  device: {
    iphoneApp: "iPhone (app de l’écran d’accueil)",
    iphoneSafari: "iPhone (Safari)",
    androidApp: "Android (app installée)",
    android: (browser) => `Android${browser ? ` (${browser})` : ""}`,
    computer: (browser) => `ordinateur${browser ? ` (${browser})` : ""}`,
    other: "appareil",
  },
  email: {
    subject: (cfg, store, more) => `En stock : ${cfg} chez ${store}${more > 0 ? ` +${more} autre${more > 1 ? "s" : ""}` : ""}`,
    intro: "Bonne nouvelle : disponible en retrait en magasin dès maintenant :",
    reserve: "Réserver",
    store: "Magasin",
    tip: "Le stock en retrait part vite : ouvrez l’app Apple Store ou apple.com, choisissez le retrait en magasin et sélectionnez le magasin.",
    manage: (url) => `Gérer ou mettre en pause cette alerte : ${url}`,
    htmlTitle: "En stock pour le retrait maintenant",
    htmlReserve: "Réserver sur apple.com",
    htmlStorePage: "Page du magasin →",
    htmlTip: "Le stock en retrait part vite : réservez dans l’app Apple Store ou sur apple.com, choisissez <b>le retrait en magasin</b> et sélectionnez le magasin.",
    htmlManage: "Gérer ou mettre en pause cette alerte",
    cancel: (url: string) => `Vous avez votre iPhone ? Résiliez à tout moment : ${url}`,
    htmlGotIt: "Vous avez votre iPhone ?",
    htmlCancel: "Résiliez à tout moment",
    nudge: (url: string) => `Les notifications sur téléphone sont désactivées pour votre compte. Vos alertes arrivent donc actuellement par e-mail. Ouvrez ShelfSpring depuis l’écran d’accueil, connectez-vous et activez les notifications sur cet appareil. Les alertes sont envoyées après détection d’une disponibilité correspondante. La vérification à la source, la synchronisation et la livraison peuvent ajouter un délai. ${url}`,
    htmlNudge: (url: string) => `Les notifications sur téléphone sont désactivées pour votre compte. Vos alertes arrivent donc actuellement par e-mail. Ouvrez ShelfSpring depuis l’écran d’accueil, connectez-vous et activez les notifications sur cet appareil. Les alertes sont envoyées après détection d’une disponibilité correspondante. La vérification à la source, la synchronisation et la livraison peuvent ajouter un délai. <a href="${url}" style="color:#0a7f3f">ShelfSpring →</a>`,
  },
  checkoutSubmit: (plan: string, limit: number, _fastSec: number, _checkSec: number, _alertSec: number) => { void _fastSec; void _checkSec; void _alertSec; return `${plan} : ${limit} alertes. Stocks actualisés fréquemment ; notification après détection. La collecte et la livraison peuvent prendre du temps. Abonnement mensuel, résiliable à tout moment.`; },
  stopped: {
    deviceWord: { ios: "iPhone", android: "téléphone Android", desktop: "ordinateur", other: "appareil" },
    subject: (device) => `Notifications arrêtées sur votre ${device} : ouvrez ShelfSpring depuis l’écran d’accueil`,
    gone: (device) => `Votre ${device} n’accepte plus les notifications ShelfSpring (le service de notifications indique que l’abonnement n’existe plus).`,
    byEmail: "Les alertes de retour en stock de vos règles arrivent désormais par e-mail, jusqu’à ce que vous réactiviez les notifications.",
    reopenIos: "Ouvrez ShelfSpring depuis votre écran d’accueil (pas dans Safari) et touchez « Activer les notifications » sur la page Compte.",
    reopenOther: "Ouvrez ShelfSpring, allez dans Compte et touchez « Activer les notifications ».",
    causes: "Causes fréquentes : l’app a été retirée de l’écran d’accueil, les notifications ont été désactivées dans Réglages, ou le téléphone a été restauré.",
  },
  nudge: {
    subject: "Configurer les alertes de stock sur votre téléphone",
    intro: "Les notifications sur téléphone sont désactivées pour votre compte. Vos alertes arrivent donc actuellement par e-mail. Ouvrez ShelfSpring depuis l’écran d’accueil, connectez-vous et activez les notifications sur cet appareil. Les alertes sont envoyées après détection d’une disponibilité correspondante. La vérification à la source, la synchronisation et la livraison peuvent ajouter un délai.",
    howTitle: "Activez-les en moins d’une minute :",
    stepsIos: ["Sur votre iPhone, ouvrez shelfspring.com dans Safari, touchez Partager, puis « Sur l’écran d’accueil ».", "Ouvrez ShelfSpring depuis l’écran d’accueil (pas Safari) et connectez-vous.", "Sur la page Compte, touchez « Activer les notifications », puis « Autoriser »."],
    stepsOther: "Sur Android ou un ordinateur : ouvrez shelfspring.com/account et touchez « Activer les notifications ».",
    after: "Tant qu’aucun appareil n’est activé, vos alertes continuent par e-mail ; ensuite elles arrivent en notification et l’e-mail s’arrête.",
    cta: (url: string) => `Guide illustré : ${url}`,
  },
};

export const notifyFr: NotifyText = typo(raw);
