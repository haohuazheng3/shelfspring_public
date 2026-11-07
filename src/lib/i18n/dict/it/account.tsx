/**
 * Italian strings: account (dashboard, its restock modules, install / checkout / pricing pages). {zone} arrives as the
 * full Italian zone name ("Ora dell'Europa centrale"), which already says "ora".
 */
import type { Dict } from "../en";
import { ilData, n as N, pl } from "./util";

export const account: Dict["account"] = {
  loading: "Caricamento",
  meta: { title: "I miei avvisi" },
  signedInAs: (email: string) => `Accesso effettuato come ${email}`,
  title: "I miei avvisi",
  units: { s: "s", min: "min", taps: "tocchi" },

  plan: {
    title: "Piano",
    none: "Nessun piano: gli avvisi sono disattivati",
    summary: (plan: string, on: number, limit: number) => `${plan} · ${N(on)} avvisi attivi su ${N(limit)}`,
    renews: (date: string) => ` · si rinnova ${ilData(date)}`,
    ends: (date: string) => ` · termina ${ilData(date)}`,
  },

  sent: {
    title: "Avvisi inviati",
    last: (ago: string) => `L'ultimo ${ago}`,
    none: "Ancora nessun invio",
    empty: "Ancora nessun invio.",
    channel: { push: "notifica", email: "email" } as Record<string, string>,
    status: { sent: "inviato", failed: "non riuscito", skipped: "saltato" } as Record<string, string>,
  },

  fast: {
    title: "Prepara l’ordine per il ritiro",
    sub: "una breve lista prima della prossima disponibilità utile",
    lasts: "durata mediana delle disponibilità di Duo registrate",
    push: "i tempi variano; conferma la disponibilità con Apple",
    tapsLeft: "verifiche prima di confermare l’ordine",
    steps: [
      { title: "Valuta gli spostamenti possibili", hint: "Conserva soltanto i negozi che potresti raggiungere per un ritiro confermato." },
      { title: "Conosci la configurazione esatta", hint: "Tieni pronti modello, capacità e colore prima di aprire il sito Apple." },
      { title: "Esamina le opzioni di acquisto", hint: "Leggi le scelte di pagamento e operatore di Apple prima di ordinare." },
      { title: "Ricontrolla la disponibilità", hint: "Un’osservazione passata o una notifica non tiene da parte un telefono." },
      { title: "Attendi la conferma del ritiro", hint: "Parti dopo che Apple ha confermato che l’ordine è pronto da ritirare." },
    ],
    guide: "Guida alla preparazione del ritiro (in inglese)",
    window: "La cronologia dei tuoi negozi",
  },

  restock: {
    title: "Quando i tuoi negozi tornano ad averlo",
    anyIphone: "iPhone",
    and: " e ",
    yours: (n: number) => (n === 1 ? "il tuo negozio" : `i tuoi ${N(n)} negozi`),
    Yours: (n: number) => (n === 1 ? "Il tuo negozio" : `I tuoi ${N(n)} negozi`),
    otherStores: (n: number) => pl(n, "altro negozio", "altri negozi"),
    meta: (what: string, stores: number, days: number, zone: string) => `${what} · ${pl(stores, "negozio", "negozi")} · ultimi ${N(days)} giorni · ${zone}`,
    busiest: (yours: string, then: string | null) => (then ? `ora più intensa per ${yours} · poi ${then}` : `ora più intensa per ${yours}`),
    busiestArea: (stores: number, zone: string) => `la più intensa tra tutti i ${N(stores)} negozi (${zone})`,
    next: (inHours: number) => `prossima fascia · ${inHours === 0 ? "in quest'ora" : `tra ${N(inHours)} h`}`,
    typical: "durata tipica prima che si esaurisca",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `ancora nessun rifornimento per ${yours} · ultimi ${N(days)} giorni` : `rifornimenti per ${yours} · ultimi ${N(days)} giorni${pattern ? "" : " · troppo pochi per una tendenza"}`),
    byHour: (busiestInGreen: boolean) => `Per ora${busiestInGreen ? " · la più intensa in verde" : ""}`,
    byWeekday: (busiest: string | null) => `Per giorno della settimana${busiest ? ` · il più intenso: ${busiest}` : ""}`,
    hourChart: (yours: string, zone: string, items: string) => `Rifornimenti per ora per ${yours}, ${zone}: ${items}`,
    weekdayChart: (yours: string, items: string) => `Rifornimenti per giorno della settimana per ${yours}: ${items}`,
    chartItem: (label: string, n: number, reported: number) => `${label} ${N(n)}${reported ? ` (+${N(reported)} ${reported === 1 ? "segnalato" : "segnalati"} da altri tracker)` : ""}`,
    barTitle: (label: string, n: number, yours: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label}: ${pl(n, "rifornimento", "rifornimenti")} per ${yours}${area ? ` · ${N(area.n)} in tutta la zona (${area.zone})` : ""}${reported ? ` · ${N(reported)} ${reported === 1 ? "segnalato" : "segnalati"} da altri tracker` : ""}`,
    now: "ora",
    allZone: (stores: number, zone: string) => `Tutti i ${N(stores)} negozi (${zone})`,
    reportMarkBars: "Tratteggiate",
    reportMarkDots: "Punti vuoti",
    sellTitle: "In quanto tempo si esauriscono i tuoi rifornimenti",
    sellMeta: (what: string, stores: number, days: number) => `${what} · ${pl(stores, "negozio", "negozi")} · ultimi ${N(days)} giorni`,
    sellLabel: (yours: string) => `per ${yours}`,
  },

  success: {
    metaTitle: "Avvisi attivi",
    isOn: (plan: string) => `${plan} è attivo`,
    yourPlan: "Il tuo piano",
    received: "Pagamento ricevuto",
    onPlan: (limit: number) => `${N(limit)} avvisi nel tuo piano.`,
    planOn: "Il tuo piano è attivo.",
    pending: "L'abbonamento comparirà nel tuo account entro un minuto.",
    open: "Apri i miei avvisi",
    another: "Aggiungi un altro avviso",
    saved: (n: number) => `${pl(n, "avviso salvato", "avvisi salvati")} · ricevuta da Stripe`,
    pushOn: "Notifiche",
    pushNext: "Prossimo passo: gli avvisi sul telefono",
  },

  install: {
    metaTitle: "Prepara il dispositivo alle notifiche di ShelfSpring",
    metaDescription: "Segui i passaggi per telefono o computer, accedi e prova le notifiche. La ricezione dipende anche dal browser e dalle impostazioni del dispositivo.",
  },

  pricing: {
    metaTitle: "Piani di monitoraggio: 10, 20 o 50 regole di avviso",
    metaDescription: "Salva gli iPhone e i negozi che puoi raggiungere. ShelfSpring parte da 5 USD al mese; disponibilità, mappe e cronologia restano consultabili gratuitamente.",
    title: "Un abbonamento per la tua selezione.",
    lead: "Consulta i dati gratuitamente. Abbonati per ricevere i cambiamenti che ti interessano. **Una regola segue una precisa configurazione di iPhone in un negozio.**",
    /** The English chip names the 269 US stores; an Italian reader is not on the US page, so no US-only number here. */
    chips: ["Disponibilità e cronologia pubbliche gratuite","La stessa fonte di dati per ogni piano","Fatturazione mensile in dollari USA","Rinnovo annullabile dal tuo account"],
    fastest: "Cosa fa l’abbonamento",
    everyFast: "L’avviso parte dopo aver rilevato una disponibilità corrispondente alle tue regole. Controlli alla fonte, sincronizzazione e consegna possono introdurre ritardi.",
    historySample: "Tutti i paesi monitorati · ultimi 7 giorni · {n} periodi di disponibilità conclusi",
    sellsOut: (band: string) => `La durata mediana osservata di una disponibilità di iPhone Duo è di **${band}**. Descrive il campione registrato, non la tua prossima occasione.`,
    band: (range: string) => `${range} secondi`,
    aboutMinute: "circa un minuto",
    sameSpeed: "Aggiornamenti regolari della disponibilità",
    rechecked: "i tuoi negozi ricontrollati",
    toPhone: "dal rifornimento confermato al telefono",
    listing: "durata mediana delle disponibilità di Duo registrate",
    note: { plus: "1 iPhone × 10 negozi", pro: "2 iPhone × 10 negozi", max: "5 iPhone × 10 negozi" } as Record<string, string>,
    month: "/ mese",
    alerts: (n: number) => `${N(n)} avvisi`,
    perks: ["Scegliere capacità e colore esatti","Aggiornare i negozi in base ai tuoi spostamenti","Notifiche del browser con e-mail come canale alternativo"],
    cancel: "Disdici quando vuoi",
    get: (plan: string) => `Scegli ${plan}`,
    billing: "Pagamenti con Stripe · carta o Link · cambi di piano calcolati pro rata",
    refund: "Non fa per te? [Rimborso completo entro 7 giorni](/refunds) se non ti è ancora arrivato nessun avviso di rifornimento",
  },
};
