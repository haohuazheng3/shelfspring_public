/**
 * Chaînes françaises : account (tableau de bord, modules de réassort, pages installation, paiement réussi, tarifs).
 * Les noms de formule et les montants en dollars restent tels quels (facturation en USD partout).
 */
import type { Dict } from "../en";
import { num } from "@/lib/i18n/format";

const n = (v: number) => num("fr", v);
const s = (k: number, one: string, many = `${one}s`) => `${n(k)} ${k > 1 ? many : one}`;

export const account: Dict["account"] = {
  loading: "Chargement",
  meta: { title: "Mes alertes" },
  signedInAs: (email) => `Connecté en tant que ${email}`,
  title: "Mes alertes",
  units: { s: "s", min: "min", taps: "touchers" },

  plan: {
    title: "Formule",
    none: "Pas encore de formule : les alertes sont désactivées",
    summary: (plan, on, limit) => `${plan} · ${n(on)} alerte${on > 1 ? "s" : ""} active${on > 1 ? "s" : ""} sur ${n(limit)}`,
    renews: (date) => ` · renouvellement le ${date}`,
    ends: (date) => ` · se termine le ${date}`,
  },

  sent: {
    title: "Alertes envoyées",
    last: (ago) => `Dernière ${ago}`,
    none: "Rien d’envoyé pour l’instant",
    empty: "Rien d’envoyé pour l’instant.",
    channel: { push: "notification", email: "e-mail" } as Record<string, string>,
    status: { sent: "envoyée", failed: "échec", skipped: "ignorée" } as Record<string, string>,
  },

  fast: {
    title: "Préparer votre commande de retrait",
    sub: "quelques vérifications avant la prochaine disponibilité utile",
    lasts: "durée médiane des disponibilités de Duo enregistrées",
    push: "le délai varie ; confirmez le stock chez Apple",
    tapsLeft: "vérifications avant de confirmer la commande",
    steps: [
      { title: "Définir votre trajet possible", hint: "Gardez uniquement les magasins que vous pourriez rejoindre pour un retrait confirmé." },
      { title: "Connaître la configuration exacte", hint: "Préparez le modèle, la capacité et le coloris avant d’ouvrir le site Apple." },
      { title: "Examiner les options d’achat", hint: "Lisez les choix de paiement et d’opérateur d’Apple avant de commander." },
      { title: "Vérifier à nouveau la disponibilité", hint: "Une observation passée ou une notification ne réserve pas de téléphone." },
      { title: "Attendre la confirmation du retrait", hint: "Déplacez-vous après qu’Apple a confirmé que la commande est prête." },
    ],
    guide: "Guide de préparation du retrait (en anglais)",
    window: "L’historique de vos magasins",
  },

  restock: {
    title: "Quand vos magasins sont réapprovisionnés",
    anyIphone: "iPhone",
    and: " et ",
    yours: (k) => (k === 1 ? "votre magasin" : `vos ${n(k)} magasins`),
    Yours: (k) => (k === 1 ? "Votre magasin" : `Vos ${n(k)} magasins`),
    otherStores: (k) => s(k, "autre magasin", "autres magasins"),
    meta: (what, stores, days, zone) => `${what} · ${s(stores, "magasin")} · ${days} derniers jours · ${zone}`,
    busiest: (yours, then) => (then ? `heure la plus active dans ${yours} · puis ${then}` : `heure la plus active dans ${yours}`),
    busiestArea: (stores, zone) => `la plus active sur les ${n(stores)} magasins (${zone})`,
    next: (inHours) => `prochain créneau · ${inHours === 0 ? "dans l’heure" : `dans ${n(inHours)} h`}`,
    typical: "durée d’affichage typique avant épuisement",
    count: (yours, days, total, pattern) => (total === 0 ? `aucun retour en stock dans ${yours} pour l’instant · ${days} derniers jours` : `retours en stock dans ${yours} · ${days} derniers jours${pattern ? "" : " · trop peu pour une tendance"}`),
    byHour: (busiestInGreen) => `Par heure${busiestInGreen ? " · la plus active en vert" : ""}`,
    byWeekday: (busiest) => `Par jour de la semaine${busiest ? ` · le plus actif : ${busiest}` : ""}`,
    hourChart: (yours, zone, items) => `Retours en stock par heure dans ${yours} (${zone}) : ${items}`,
    weekdayChart: (yours, items) => `Retours en stock par jour de la semaine dans ${yours} : ${items}`,
    chartItem: (label, k, reported) => `${label} ${n(k)}${reported ? ` (+${s(reported, "signalé", "signalés")} par d’autres sites de suivi)` : ""}`,
    barTitle: (label, k, yours, area, reported) =>
      `${label} : ${s(k, "retour en stock", "retours en stock")} dans ${yours}${area ? ` · ${n(area.n)} sur tout le fuseau (${area.zone})` : ""}${reported ? ` · ${s(reported, "signalé", "signalés")} par d’autres sites de suivi` : ""}`,
    now: "maintenant",
    allZone: (stores, zone) => `Les ${n(stores)} magasins du fuseau (${zone})`,
    reportMarkBars: "En pointillés",
    reportMarkDots: "Points creux",
    sellTitle: "En combien de temps vos retours en stock sont épuisés",
    sellMeta: (what, stores, days) => `${what} · ${s(stores, "magasin")} · ${days} derniers jours`,
    sellLabel: (yours) => `dans ${yours}`,
  },

  success: {
    metaTitle: "Les alertes sont activées",
    isOn: (plan) => `${plan} est activé`,
    yourPlan: "Votre formule",
    received: "Paiement reçu",
    onPlan: (limit) => `${n(limit)} alertes dans votre formule.`,
    planOn: "Votre formule est activée.",
    pending: "Votre abonnement apparaîtra dans votre compte d’ici une minute.",
    open: "Ouvrir mes alertes",
    another: "Ajouter une alerte",
    saved: (k) => `${s(k, "alerte enregistrée", "alertes enregistrées")} · reçu envoyé par Stripe`,
    pushOn: "Notifications",
    pushNext: "Prochaine étape : les alertes sur votre téléphone",
  },

  install: {
    metaTitle: "Préparer votre appareil pour les notifications ShelfSpring",
    metaDescription: "Suivez les étapes adaptées à votre téléphone ou ordinateur, connectez-vous et testez les notifications. Leur réception dépend aussi du navigateur et des réglages de l’appareil.",
  },

  pricing: {
    metaTitle: "Formules de suivi : 10, 20 ou 50 règles d’alerte",
    metaDescription: "Gardez une sélection d’iPhone et de magasins accessibles. Les formules ShelfSpring commencent à 5 USD par mois ; le stock, les cartes et l’historique restent consultables gratuitement.",
    title: "Un abonnement pour votre sélection.",
    lead: "Explorez gratuitement. Abonnez-vous pour être averti d’un changement qui vous intéresse. **Une règle suit un iPhone précis dans un seul magasin.**",
    chips: ["Stock et historique publics gratuits","Même source de stock pour chaque formule","Facturation mensuelle en dollars US","Renouvellement résiliable depuis votre compte"],
    fastest: "Ce que comprend le suivi",
    everyFast: "Une alerte part après détection d’une disponibilité correspondant à vos règles. Les contrôles à la source, la synchronisation et l’acheminement peuvent retarder sa réception.",
    historySample: "Tous les pays suivis · 7 derniers jours · {n} périodes de disponibilité terminées",
    sellsOut: (band: string) => `La durée médiane observée d’une disponibilité d’iPhone Duo est de **${band}**. Ce résultat décrit l’échantillon enregistré, pas votre prochaine occasion.`,
    band: (range) => `${range} secondes`,
    aboutMinute: "environ une minute",
    sameSpeed: "Mises à jour régulières du stock",
    rechecked: "vos magasins revérifiés",
    toPhone: "du retour en stock confirmé à votre téléphone",
    listing: "durée médiane des disponibilités de Duo enregistrées",
    note: { plus: "1 iPhone × 10 magasins", pro: "2 iPhone × 10 magasins", max: "5 iPhone × 10 magasins" } as Record<string, string>,
    month: "/ mois",
    alerts: (k) => `${n(k)} alertes`,
    perks: ["Choisir précisément la capacité et le coloris","Adapter les magasins suivis à vos déplacements","Notifications du navigateur avec e-mail de secours"],
    cancel: "Résiliable à tout moment",
    get: (plan) => `Choisir ${plan}`,
    billing: "Facturation Stripe · carte ou Link · changements de formule au prorata",
    refund: "Pas pour vous ? [Remboursement intégral sous 7 jours](/refunds) si aucune alerte de retour en stock ne vous est encore parvenue",
  },
};
