/**
 * Chaînes françaises : account (tableau de bord, modules des heures de retour, pages installation, paiement réussi, tarifs).
 * Les noms de formule et les montants en dollars restent tels quels (facturation en USD partout).
 */
import type { Dict } from "../en";
import { num } from "@/lib/i18n/format";
import { cap } from "./util";

const n = (v: number) => num("fr", v);
const s = (k: number, one: string, many = `${one}s`) => `${n(k)} ${k > 1 ? many : one}`;

export const account: Dict["account"] = {
  loading: "Chargement",
  meta: { title: "Ma liste de veille" },
  signedInAs: (email) => `Compte · ${email}`,
  title: "Votre liste de veille, réunie ici.",
  units: { s: "s", min: "min", taps: "gestes" },

  plan: {
    title: "Adhésion et facturation",
    none: "Aucune formule active · les veilles sont gardées, rien n’est envoyé",
    summary: (plan, on, limit) => `${plan} · ${n(on)}/${n(limit)} veilles actives`,
    renews: (date) => ` · prochain renouvellement : ${date}`,
    ends: (date) => ` · active jusqu’au ${date}`,
  },

  sent: {
    title: "Votre relevé de notifications",
    last: (ago) => `La plus récente ${ago}`,
    none: "Aucun envoi pour l’instant",
    empty: "Aucun retour correspondant n’a encore été signalé à ce compte. Les veilles enregistrées se mettent à envoyer dès qu’une formule payante est active et qu’un changement correspondant est confirmé.",
    channel: { push: "notification", email: "e-mail" } as Record<string, string>,
    status: { sent: "remise", failed: "non remise", skipped: "sautée" } as Record<string, string>,
  },

  fast: {
    title: "Préparer sa commande de retrait",
    sub: "une courte liste à cocher avant la prochaine fiche utile",
    lasts: "temps médian en rayon d’un Duo, d’après le registre",
    push: "l’acheminement varie ; Apple seul confirme le stock",
    tapsLeft: "à faire de votre côté une fois la notification reçue",
    steps: [
      { title: "Cerner votre rayon de déplacement", hint: "Ne gardez que les magasins que vous pourriez rejoindre pour un retrait confirmé." },
      { title: "Avoir la configuration exacte en tête", hint: "Modèle, capacité et finition prêts avant d’ouvrir le site d’Apple." },
      { title: "Lire les options d’achat", hint: "Parcourez les choix de paiement et d’opérateur proposés par Apple avant de commander." },
      { title: "Revérifier la fiche", hint: "Ni une observation passée ni une notification ne mettent un téléphone de côté pour vous." },
      { title: "Attendre l’avis de retrait", hint: "Ne partez qu’une fois qu’Apple confirme que la commande est prête à être retirée." },
    ],
    guide: "Lire la liste de préparation au retrait (en anglais)",
    window: "Vos heures de retour",
  },

  restock: {
    title: "Heures de retour dans vos magasins",
    anyIphone: "iPhone",
    and: " et ",
    yours: (k) => (k === 1 ? "votre magasin" : `vos ${n(k)} magasins`),
    Yours: (k) => (k === 1 ? "Votre magasin" : `Vos ${n(k)} magasins`),
    otherStores: (k) => s(k, "autre magasin", "autres magasins"),
    meta: (what, stores, days, zone) => `${what} · ${s(stores, "magasin")} · registre de ${days} jours · ${zone}`,
    busiest: (yours, then) => (then ? `le plus de retours · ${yours} · ensuite ${then}` : `le plus de retours · ${yours}`),
    busiestArea: (stores, zone) => `pic sur ${s(stores, "magasin")} · ${zone}`,
    next: (inHours) => `fenêtre suivante · ${inHours === 0 ? "dans cette heure-ci" : `d’ici ${n(inHours)} h`}`,
    typical: "temps médian en rayon",
    count: (yours, days, total, pattern) => (total === 0 ? `${cap(yours)} : aucun retour consigné · registre de ${days} jours` : `${cap(yours)} : retours consignés · registre de ${days} jours${pattern ? "" : " · pas assez pour dégager un rythme"}`),
    byHour: (busiestInGreen) => `Journée type${busiestInGreen ? " · pic en vert" : ""}`,
    byWeekday: (busiest) => `Semaine type${busiest ? ` · pic : ${busiest}` : ""}`,
    hourChart: (yours, zone, items) => `Retours selon l’heure de la journée, ${yours} (${zone}) : ${items}`,
    weekdayChart: (yours, items) => `Retours selon le jour de la semaine, ${yours} : ${items}`,
    chartItem: (label, k, reported) => `${label} ${n(k)}${reported ? ` (+${n(reported)} de sources extérieures)` : ""}`,
    barTitle: (label, k, yours, area, reported) =>
      `${label} : ${s(k, "retour consigné", "retours consignés")} · ${yours}${area ? ` · ${n(area.n)} sur l’ensemble du fuseau (${area.zone})` : ""}${reported ? ` · ${n(reported)} de sources extérieures` : ""}`,
    now: "maintenant",
    allZone: (stores, zone) => `Tous les magasins réglés sur ${zone} (${n(stores)})`,
    reportMarkBars: "Contour en tirets",
    reportMarkDots: "Cercles vides",
    sellTitle: "Combien de temps les retours restent en rayon",
    sellMeta: (what, stores, days) => `${what} · ${s(stores, "magasin")} · registre de ${days} jours`,
    sellLabel: (yours) => `pour ${yours}`,
  },

  success: {
    metaTitle: "Les veilles sont en marche",
    isOn: (plan) => `${plan} est actif`,
    yourPlan: "Votre formule",
    received: "Paiement confirmé",
    onPlan: (limit) => `Place pour ${n(limit)} veilles dans votre liste.`,
    planOn: "Votre formule est active.",
    pending: "Stripe termine la confirmation ; la formule s’affichera sur votre compte dans la minute.",
    open: "Ouvrir ma liste de veille",
    another: "Compléter la liste de veille",
    saved: (k) => `${s(k, "veille gardée", "veilles gardées")} · Stripe vous envoie le reçu par e-mail`,
    pushOn: "Notifications",
    pushNext: "Étape suivante : activer un appareil",
  },

  install: {
    metaTitle: "Préparer votre appareil pour les notifications ShelfSpring",
    metaDescription: "Suivez les étapes adaptées à votre téléphone ou ordinateur, connectez-vous et testez les notifications. Leur réception dépend aussi du navigateur et des réglages de l’appareil.",
  },

  pricing: {
    metaTitle: "Formules de suivi : 10, 20 ou 50 règles d’alerte",
    metaDescription: "Gardez une sélection d’iPhone et de magasins accessibles. Les formules ShelfSpring commencent à 5 USD par mois ; le stock, les cartes et l’historique restent consultables gratuitement.",
    title: "Une adhésion pour votre courte liste.",
    lead: "La consultation reste gratuite. Abonnez-vous le jour où vous voulez que le prochain changement utile vienne à vous. **Une règle veille sur un iPhone exact dans un seul magasin.**",
    chips: ["Rayons et historique publics, sans frais", "Le même flux d’inventaire pour chaque formule", "Facturé chaque mois en dollars US", "Renouvellement à stopper depuis votre compte"],
    fastest: "Ce qu’apporte l’abonnement",
    everyFast: "Une alerte part dès qu’une disponibilité conforme à vos règles est repérée. Contrôle à la source, synchronisation et acheminement des notifications peuvent ajouter du délai.",
    historySample: "Ensemble des pays suivis · 7 jours glissants · {n} passages en rayon clos",
    sellsOut: (band: string) => `Dans le registre, un iPhone Duo est resté en rayon **${band}** en valeur médiane. C’est la description de l’échantillon consigné, pas une promesse pour votre prochaine chance.`,
    band: (range) => `${range} secondes`,
    aboutMinute: "une minute environ",
    sameSpeed: "Inventaire actualisé en continu",
    rechecked: "fréquence de passage dans vos magasins",
    toPhone: "d’un retour confirmé jusqu’à votre appareil",
    listing: "temps médian en rayon d’un Duo",
    note: { plus: "par ex. une configuration suivie dans dix magasins", pro: "par ex. deux configurations, dix magasins chacune", max: "par ex. cinq configurations, dix magasins chacune" } as Record<string, string>,
    month: "par mois",
    alerts: (k) => `${n(k)} règles de veille`,
    perks: ["Combinaisons capacité et finition au choix exact", "Magasins accessibles modifiables quand vos plans changent", "Push du navigateur, avec l’e-mail en secours"],
    cancel: "Le renouvellement s’arrête quand vous voulez",
    get: (plan) => `Démarrer ${plan}`,
    billing: "Les paiements passent par Stripe, par carte ou via Link. Passer d’une formule à l’autre est calculé au prorata.",
    refund: "Conditions de remboursement : un paiement des 7 derniers jours, sans aucune alerte de retour remise depuis, peut être remboursé en totalité ([politique de remboursement](/refunds)).",
  },
};
