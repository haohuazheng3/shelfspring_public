/**
 * Dutch strings: account (watchlist page, the return modules on it, install / checkout / pricing pages). Plan names and
 * dollar amounts stay as they are: billing is in US dollars everywhere.
 */
import { num } from "@/lib/i18n/format";
import type { Dict } from "../en";

const L = "nl" as const;
const n$ = (v: number) => num(L, v);
const cnt = (n: number, one: string, many: string) => `${n$(n)} ${n === 1 ? one : many}`;

export const account: Dict["account"] = {
  loading: "Wordt geladen",
  meta: { title: "Mijn volglijst" },
  signedInAs: (email: string) => `Account · ${email}`,
  title: "Je volglijst, op één plek.",
  units: { s: "s", min: "min", taps: "tikken" },

  plan: {
    title: "Lidmaatschap en betalingen",
    none: "Geen actief pakket · meldingen worden bewaard, niet verstuurd",
    summary: (plan: string, on: number, limit: number) => `${plan} · ${n$(on)}/${n$(limit)} meldingen actief`,
    renews: (date: string) => ` · volgende verlenging ${date}`,
    ends: (date: string) => ` · actief tot ${date}`,
  },

  sent: {
    title: "Je meldingsregister",
    last: (ago: string) => `Jongste ${ago}`,
    none: "Nog geen bezorgingen",
    empty: "Er is nog geen passende rentree naar dit account gestuurd. Bewaarde meldingen gaan pas bezorgen zodra er een betaald pakket loopt en een passende wijziging bevestigd is.",
    channel: { push: "pushmelding", email: "e-mail" } as Record<string, string>,
    status: { sent: "bezorgd", failed: "niet bezorgd", skipped: "overgeslagen" } as Record<string, string>,
  },

  fast: {
    title: "Je afhaalbestelling klaarzetten",
    sub: "een korte checklist voor de volgende bruikbare vermelding",
    lasts: "mediane genoteerde schaptijd van de Duo",
    push: "bezorgtijd wisselt; laat Apple het schap bevestigen",
    tapsLeft: "die je nog zelf doet nadat de melding binnenkomt",
    steps: [
      { title: "Ken je reisbereik", hint: "Houd alleen winkels over die je haalt voor een bevestigde afhaling." },
      { title: "Weet welke uitvoering je wilt", hint: "Zet model, capaciteit en afwerking klaar voordat je Apple opent." },
      { title: "Bekijk hoe je betaalt", hint: "Lees Apples betaal- en provideropties voordat je een bestelling plaatst." },
      { title: "Kijk de vermelding nog eens na", hint: "Een eerdere waarneming of melding legt geen telefoon voor je opzij." },
      { title: "Wacht op de afhaalbevestiging", hint: "Vertrek pas als Apple bevestigt dat de bestelling klaarligt." },
    ],
    guide: "Lees de afhaalchecklist (Engels)",
    window: "Je rentree-uren",
  },

  restock: {
    title: "Rentree-uren bij je winkels",
    anyIphone: "iPhone",
    and: " en ",
    yours: (n: number) => (n === 1 ? "je winkel" : `je ${n$(n)} winkels`),
    Yours: (n: number) => (n === 1 ? "Je winkel" : `Je ${n$(n)} winkels`),
    otherStores: (n: number) => cnt(n, "andere winkel", "andere winkels"),
    meta: (what: string, stores: number, days: number, zone: string) => `${what} · ${cnt(stores, "winkel", "winkels")} · logboek van ${n$(days)} dagen · ${zone}`,
    busiest: (yours: string, then: string | null) => (then ? `meeste rentrees bij ${yours} · tweede ${then}` : `meeste rentrees bij ${yours}`),
    busiestArea: (stores: number, zone: string) => `piek over ${n$(stores)} winkels in ${zone}`,
    next: (inHours: number) => `komend venster · ${inHours === 0 ? "nog dit uur" : `over ${n$(inHours)} u`}`,
    typical: "mediane tijd in het schap",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `geen rentrees genoteerd bij ${yours} · logboek van ${n$(days)} dagen` : `rentrees genoteerd bij ${yours} · logboek van ${n$(days)} dagen${pattern ? "" : " · nog te dun voor een patroon"}`),
    byHour: (busiestInGreen: boolean) => `Uur van de dag${busiestInGreen ? " · piek in groen" : ""}`,
    byWeekday: (busiest: string | null) => `Dag van de week${busiest ? ` · piek op ${busiest}` : ""}`,
    hourChart: (yours: string, zone: string, items: string) => `Rentrees per uur van de dag bij ${yours}, ${zone}: ${items}`,
    weekdayChart: (yours: string, items: string) => `Rentrees per dag van de week bij ${yours}: ${items}`,
    chartItem: (label: string, n: number, reported: number) => `${label} ${n$(n)}${reported ? ` (+${n$(reported)} extern)` : ""}`,
    barTitle: (label: string, n: number, yours: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label}: ${cnt(n, "rentree", "rentrees")} genoteerd bij ${yours}${area ? ` · ${n$(area.n)} in ${area.zone}` : ""}${reported ? ` · ${n$(reported)} extern` : ""}`,
    now: "nu",
    allZone: (stores: number, zone: string) => `Elke winkel in ${zone} (${n$(stores)})`,
    reportMarkBars: "Streepjesrand",
    reportMarkDots: "Open cirkels",
    sellTitle: "Hoe lang rentrees in het schap blijven",
    sellMeta: (what: string, stores: number, days: number) => `${what} · ${cnt(stores, "winkel", "winkels")} · logboek van ${n$(days)} dagen`,
    sellLabel: (yours: string) => `bij ${yours}`,
  },

  success: {
    metaTitle: "Meldingen staan aan",
    isOn: (plan: string) => `${plan} is actief`,
    yourPlan: "Je pakket",
    received: "Betaling bevestigd",
    onPlan: (limit: number) => `Ruimte voor ${n$(limit)} meldingen op je volglijst.`,
    planOn: "Je pakket is actief.",
    pending: "Stripe bevestigt nog; binnen een minuut staat het pakket in je account.",
    open: "Mijn volglijst openen",
    another: "Iets aan de volglijst toevoegen",
    saved: (n: number) => `${cnt(n, "melding", "meldingen")} bewaard · Stripe mailt het betaalbewijs`,
    pushOn: "Meldingen",
    pushNext: "Volgende stap: een toestel inschakelen",
  },

  install: {
    metaTitle: "Je apparaat instellen voor ShelfSpring-meldingen",
    metaDescription: "Volg de stappen voor je telefoon of computer, meld je aan en test meldingen. Ontvangst hangt ook af van je browser en apparaatinstellingen.",
  },

  pricing: {
    metaTitle: "Volgplannen: 10, 20 of 50 meldingsregels",
    metaDescription: "Bewaar geschikte iPhones en bereikbare winkels. ShelfSpring begint bij 5 USD per maand; voorraad, kaarten en vastgelegde wijzigingen blijven gratis te bekijken.",
    title: "Een lidmaatschap voor je shortlist.",
    lead: "Rondkijken kost niets. Neem een abonnement zodra je wilt dat de volgende passende wijziging naar jou toe komt. **Eén melding volgt één exacte iPhone in één winkel.**",
    chips: ["Openbare schappen en register blijven gratis", "Elk pakket leest dezelfde bron", "Maandelijks gefactureerd in US-dollar", "Verlenging stopzetten vanuit je account"],
    fastest: "Wat een abonnement doet",
    everyFast: "Een melding vertrekt pas nadat een passende uitvoering is waargenomen. De bron bevragen, gegevens synchroniseren en de melding afleveren kost elk wat tijd.",
    historySample: "Alle gevolgde markten · voorbije 7 dagen · {n} afgesloten afhaalvensters",
    sellsOut: (band: string) => `Een iPhone Duo-vermelding bleef in de waargenomen mediaan **${band}** staan. Dat beschrijft de genoteerde steekproef, niet je volgende kans.`,
    band: (range: string) => `${range} seconden`,
    aboutMinute: "ongeveer een minuut",
    sameSpeed: "Schappen geregeld opnieuw bekeken",
    rechecked: "hoe vaak je winkels bekeken worden",
    toPhone: "van een bevestigde rentree tot je toestel",
    listing: "mediane schaptijd van de Duo",
    note: { plus: "bv. één uitvoering gevolgd in tien winkels", pro: "bv. twee uitvoeringen, elk in tien winkels", max: "bv. vijf uitvoeringen, elk in tien winkels" } as Record<string, string>,
    month: "per maand",
    alerts: (n: number) => `${n$(n)} meldingen`,
    perks: ["Kies precies welke capaciteit en afwerking", "Pas je bereikbare winkels aan als je plannen wijzigen", "Pushmelding in de browser, e-mail als vangnet"],
    cancel: "Verlenging op elk moment stop te zetten",
    get: (plan: string) => `Start met ${plan}`,
    billing: "Betalen gaat via Stripe, met kaart of Link. Overstappen tussen pakketten wordt naar rato verrekend.",
    refund: "Terugbetaling: een betaling van de voorbije 7 dagen waarna nog geen rentreemelding is bezorgd, krijg je volledig terug ([terugbetalingsbeleid](/refunds)).",
  },
};
