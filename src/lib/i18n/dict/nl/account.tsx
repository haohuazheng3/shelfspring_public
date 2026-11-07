/**
 * Dutch strings: account (dashboard page, restock modules on it, install / checkout / pricing pages). Plan names and
 * dollar amounts stay as they are: billing is in US dollars everywhere.
 */
import { num } from "@/lib/i18n/format";
import type { Dict } from "../en";

const L = "nl" as const;
const n$ = (v: number) => num(L, v);
const cnt = (n: number, one: string, many: string) => `${n$(n)} ${n === 1 ? one : many}`;

export const account: Dict["account"] = {
  loading: "Laden",
  meta: { title: "Mijn alerts" },
  signedInAs: (email: string) => `Ingelogd als ${email}`,
  title: "Mijn alerts",
  units: { s: "sec.", min: "min", taps: "tikken" },

  plan: {
    title: "Abonnement",
    none: "Nog geen abonnement: alerts staan uit",
    summary: (plan: string, on: number, limit: number) => `${plan} · ${n$(on)} van ${n$(limit)} alerts aan`,
    renews: (date: string) => ` · verlengt op ${date}`,
    ends: (date: string) => ` · loopt af op ${date}`,
  },

  sent: {
    title: "Verstuurde alerts",
    last: (ago: string) => `Laatste ${ago}`,
    none: "Nog niets verstuurd",
    empty: "Nog niets verstuurd.",
    channel: { push: "melding", email: "e-mail" } as Record<string, string>,
    status: { sent: "verstuurd", failed: "mislukt", skipped: "overgeslagen" } as Record<string, string>,
  },

  fast: {
    title: "Bereid je ophaalbestelling voor",
    sub: "een korte controlelijst voor de volgende passende aanbieding",
    lasts: "mediane duur van vastgelegde Duo-beschikbaarheid",
    push: "bezorgtijd varieert; bevestig de voorraad bij Apple",
    tapsLeft: "controles voordat je de bestelling bevestigt",
    steps: [
      { title: "Bepaal je bereikbare afstand", hint: "Bewaar alleen winkels die je voor een bevestigde afhaling kunt bereiken." },
      { title: "Ken de exacte uitvoering", hint: "Houd model, opslag en kleur bij de hand voordat je Apple opent." },
      { title: "Bekijk je koopmogelijkheden", hint: "Lees Apples betaal- en provideropties voordat je bestelt." },
      { title: "Controleer de aanbieding opnieuw", hint: "Een eerdere waarneming of melding houdt geen telefoon voor je apart." },
      { title: "Wacht op de afhaalbevestiging", hint: "Vertrek nadat Apple heeft bevestigd dat de bestelling klaarstaat." },
    ],
    guide: "Voorbereiding op ophalen (Engels)",
    window: "De geschiedenis van je winkels",
  },

  restock: {
    title: "Wanneer je winkels nieuwe voorraad krijgen",
    anyIphone: "iPhone",
    and: " en ",
    yours: (n: number) => (n === 1 ? "je winkel" : `je ${n$(n)} winkels`),
    Yours: (n: number) => (n === 1 ? "Je winkel" : `Je ${n$(n)} winkels`),
    otherStores: (n: number) => cnt(n, "andere winkel", "andere winkels"),
    meta: (what: string, stores: number, days: number, zone: string) => `${what} · ${cnt(stores, "winkel", "winkels")} · laatste ${n$(days)} dagen · ${zone}`,
    busiest: (yours: string, then: string | null) => (then ? `drukste uur bij ${yours} · daarna ${then}` : `drukste uur bij ${yours}`),
    busiestArea: (stores: number) => `drukste uur over alle ${n$(stores)} winkels in deze tijdzone`,
    next: (inHours: number) => `volgende venster · ${inHours === 0 ? "dit uur" : `over ${n$(inHours)} u`}`,
    typical: "zo lang blijft hij meestal te koop",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `nog geen aanvullingen bij ${yours} · laatste ${n$(days)} dagen` : `aanvullingen bij ${yours} · laatste ${n$(days)} dagen${pattern ? "" : " · te weinig voor een patroon"}`),
    byHour: (busiestInGreen: boolean) => `Per uur${busiestInGreen ? " · drukste in groen" : ""}`,
    byWeekday: (busiest: string | null) => `Per weekdag${busiest ? ` · drukst op ${busiest}` : ""}`,
    hourChart: (yours: string, zone: string, items: string) => `Aanvullingen per uur bij ${yours}, ${zone}: ${items}`,
    weekdayChart: (yours: string, items: string) => `Aanvullingen per weekdag bij ${yours}: ${items}`,
    chartItem: (label: string, n: number, reported: number) => `${label} ${n$(n)}${reported ? ` (+${n$(reported)} gemeld door andere trackers)` : ""}`,
    barTitle: (label: string, n: number, yours: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label}: ${cnt(n, "aanvulling", "aanvullingen")} bij ${yours}${area ? ` · ${n$(area.n)} in deze tijdzone` : ""}${reported ? ` · ${n$(reported)} gemeld door andere trackers` : ""}`,
    now: "nu",
    allZone: (stores: number, zone: string) => `Alle ${n$(stores)} winkels in dezelfde tijdzone (${zone})`,
    reportMarkBars: "Gestippeld",
    reportMarkDots: "Holle stippen",
    sellTitle: "Hoe snel jouw aanvullingen uitverkocht zijn",
    sellMeta: (what: string, stores: number, days: number) => `${what} · ${cnt(stores, "winkel", "winkels")} · laatste ${n$(days)} dagen`,
    sellLabel: (yours: string) => `bij ${yours}`,
  },

  success: {
    metaTitle: "Alerts staan aan",
    isOn: (plan: string) => `${plan} staat aan`,
    yourPlan: "Je abonnement",
    received: "Betaling ontvangen",
    onPlan: (limit: number) => `${n$(limit)} alerts in je abonnement.`,
    planOn: "Je abonnement staat aan.",
    pending: "Je abonnement verschijnt binnen een minuut in je account.",
    open: "Open mijn alerts",
    another: "Nog een alert toevoegen",
    saved: (n: number) => `${cnt(n, "alert", "alerts")} opgeslagen · bonnetje van Stripe`,
    pushOn: "Meldingen",
    pushNext: "Volgende stap: alerts op je telefoon",
  },

  install: {
    metaTitle: "Je apparaat instellen voor ShelfSpring-meldingen",
    metaDescription: "Volg de stappen voor je telefoon of computer, meld je aan en test meldingen. Ontvangst hangt ook af van je browser en apparaatinstellingen.",
  },

  pricing: {
    metaTitle: "Volgplannen: 10, 20 of 50 meldingsregels",
    metaDescription: "Bewaar geschikte iPhones en bereikbare winkels. ShelfSpring begint bij 5 USD per maand; voorraad, kaarten en vastgelegde wijzigingen blijven gratis te bekijken.",
    title: "Een abonnement voor je selectie.",
    lead: "Rondkijken blijft gratis. Neem een abonnement als je passende wijzigingen wilt ontvangen. **Eén regel volgt één exacte iPhone-uitvoering bij één winkel.**",
    chips: ["Openbare voorraad en geschiedenis blijven gratis","Dezelfde voorraadbron voor elk plan","Maandelijkse betaling in Amerikaanse dollars","Verlenging opzeggen via je account"],
    fastest: "Wat het abonnement voor je doet",
    everyFast: "Een melding volgt nadat passende beschikbaarheid is waargenomen. Controle bij de bron, synchronisatie en bezorging kunnen vertraging veroorzaken.",
    historySample: "Alle gevolgde landen · afgelopen 7 dagen · {n} afgesloten beschikbaarheidsvensters",
    sellsOut: (band: string) => `De waargenomen mediane beschikbaarheidsduur van een iPhone Duo is **${band}**. Dit beschrijft de vastgelegde steekproef, niet je volgende kans.`,
    band: (range: string) => `${range} seconden`,
    aboutMinute: "zo'n minuut",
    sameSpeed: "Regelmatige voorraadupdates",
    rechecked: "je winkels opnieuw gecheckt",
    toPhone: "van bevestigde aanvulling tot je telefoon",
    listing: "mediane duur van vastgelegde Duo-beschikbaarheid",
    note: { plus: "1 iPhone × 10 winkels", pro: "2 iPhones × 10 winkels", max: "5 iPhones × 10 winkels" } as Record<string, string>,
    month: "/ maand",
    alerts: (n: number) => `${n$(n)} alerts`,
    perks: ["Exacte opslag en kleur kiezen","Winkels aanpassen aan je reisafstand","Browsermeldingen met e-mail als alternatief"],
    cancel: "Altijd opzegbaar",
    get: (plan: string) => `Kies ${plan}`,
    billing: "Betaling via Stripe · kaart of Link · wijzigingen naar rato verrekend",
    refund: "Toch niets voor jou? [Volledige terugbetaling binnen 7 dagen](/refunds) als er nog geen voorraadalert bij je is aangekomen",
  },
};
