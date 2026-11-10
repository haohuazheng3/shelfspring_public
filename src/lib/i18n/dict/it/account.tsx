/**
 * Italian strings: account (dashboard, its restock modules, install / checkout / pricing pages). {zone} arrives as the
 * full Italian zone name ("Ora dell'Europa centrale"), which already says "ora".
 */
import type { Dict } from "../en";
import { ilData, n as N, pl } from "./util";

export const account: Dict["account"] = {
  loading: "In caricamento",
  meta: { title: "La mia lista d'osservazione" },
  signedInAs: (email: string) => `Account · ${email}`,
  title: "La tua lista d'osservazione, tutta qui.",
  units: { s: "s", min: "min", taps: "tocchi" },

  plan: {
    title: "Abbonamento e pagamenti",
    none: "Nessun piano attivo · le notifiche restano in lista ma non partono",
    summary: (plan: string, on: number, limit: number) => `${plan} · notifiche in funzione ${N(on)}/${N(limit)}`,
    renews: (date: string) => ` · prossimo rinnovo ${ilData(date)}`,
    ends: (date: string) => ` · in funzione fino ${ilData(date).replace(/^il /, "al ").replace(/^l'/, "all'")}`,
  },

  sent: {
    title: "Lo storico delle tue notifiche",
    last: (ago: string) => `La più recente ${ago}`,
    none: "Nessun recapito per ora",
    empty: "A questo account non è ancora stato mandato nessun rientro corrispondente. Le voci salvate cominciano a partire quando c'è un piano a pagamento attivo e un cambiamento corrispondente viene confermato.",
    channel: { push: "notifica", email: "email" } as Record<string, string>,
    status: { sent: "recapitata", failed: "non recapitata", skipped: "saltata" } as Record<string, string>,
  },

  fast: {
    title: "Prepara il tuo ordine di ritiro",
    sub: "una lista di controllo breve, prima della prossima voce utile",
    lasts: "permanenza mediana registrata di una voce Duo",
    push: "i tempi di recapito variano; la disponibilità la conferma Apple",
    tapsLeft: "quelli che restano a te dopo l'arrivo della notifica",
    steps: [
      { title: "Fissa fin dove puoi spostarti", hint: "Tieni solo i negozi che raggiungeresti davvero per un ritiro confermato." },
      { title: "Sappi la configurazione al dettaglio", hint: "Modello, capacità e finitura vanno decisi prima di aprire Apple." },
      { title: "Guarda come puoi pagare", hint: "Leggi le opzioni di pagamento e di operatore di Apple prima di ordinare." },
      { title: "Riguarda la voce", hint: "Un'osservazione passata o una notifica non mettono da parte nessun telefono." },
      { title: "Aspetta la conferma del ritiro", hint: "Mettiti in viaggio dopo che Apple conferma che l'ordine si può ritirare." },
    ],
    guide: "Leggi la lista di controllo per il ritiro (in inglese)",
    window: "Gli orari di rientro che ti riguardano",
  },

  restock: {
    /** "Restock by restock" on the dashboard: each restock against the member's alerts (lib/alertMarks.ts). */
    mark: { delivered: "Avviso consegnato", sent: "Avviso inviato", other: "Non tra i tuoi avvisi", before: "Prima del tuo avviso" },
    title: "Gli orari di rientro nei tuoi negozi",
    anyIphone: "iPhone",
    and: " e ",
    yours: (n: number) => (n === 1 ? "il tuo negozio" : `i tuoi ${N(n)} negozi`),
    Yours: (n: number) => (n === 1 ? "Il tuo negozio" : `I tuoi ${N(n)} negozi`),
    otherStores: (n: number) => pl(n, "altro negozio", "altri negozi"),
    meta: (what: string, stores: number, days: number, zone: string) => `${what} · ${pl(stores, "negozio", "negozi")} · registro di ${N(days)} giorni · ${zone}`,
    busiest: (yours: string, then: string | null) => (then ? `più rientri presso ${yours} · subito dopo ${then}` : `più rientri presso ${yours}`),
    busiestArea: (stores: number, zone: string) => `picco su ${N(stores)} negozi con l'orario ${zone}`,
    next: (inHours: number) => `finestra in arrivo · ${inHours === 0 ? "entro quest'ora" : `fra ${N(inHours)} h`}`,
    typical: "tempo mediano a scaffale",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `nessun rientro annotato presso ${yours} · registro di ${N(days)} giorni` : `rientri annotati presso ${yours} · registro di ${N(days)} giorni${pattern ? "" : " · non bastano per un andamento"}`),
    byHour: (busiestInGreen: boolean) => `Ora del giorno${busiestInGreen ? " · il picco in verde" : ""}`,
    byWeekday: (busiest: string | null) => `Giorno della settimana${busiest ? ` · picco ${busiest}` : ""}`,
    hourChart: (yours: string, zone: string, items: string) => `Rientri per ora del giorno presso ${yours}, ${zone}: ${items}`,
    weekdayChart: (yours: string, items: string) => `Rientri per giorno della settimana presso ${yours}: ${items}`,
    chartItem: (label: string, n: number, reported: number) => `${label} ${N(n)}${reported ? ` (+${N(reported)} da fonti esterne)` : ""}`,
    barTitle: (label: string, n: number, yours: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label}: ${pl(n, "rientro annotato", "rientri annotati")} presso ${yours}${area ? ` · ${N(area.n)} nell'insieme del fuso ${area.zone}` : ""}${reported ? ` · ${N(reported)} da fonti esterne` : ""}`,
    now: "adesso",
    allZone: (stores: number, zone: string) => `Ogni negozio con l'orario ${zone} (${N(stores)})`,
    reportMarkBars: "Tratteggio",
    reportMarkDots: "Cerchietti vuoti",
    sellTitle: "Quanto restano a scaffale i rientri",
    sellMeta: (what: string, stores: number, days: number) => `${what} · ${pl(stores, "negozio", "negozi")} · registro di ${N(days)} giorni`,
    sellLabel: (yours: string) => `presso ${yours}`,
  },

  success: {
    metaTitle: "Avvisi attivi",
    isOn: (plan: string) => `${plan} è in funzione`,
    yourPlan: "Piano in corso",
    received: "Pagamento confermato",
    onPlan: (limit: number) => `Spazio per ${N(limit)} notifiche nella tua lista d'osservazione.`,
    planOn: "Il piano è in funzione.",
    pending: "Stripe sta ancora confermando: nel giro di un minuto il piano appare fra i dati dell'account.",
    open: "Apri la mia lista d'osservazione",
    another: "Aggiungi alla lista d'osservazione",
    saved: (n: number) => `${pl(n, "notifica conservata", "notifiche conservate")} · la ricevuta arriva per email da Stripe`,
    pushOn: "Notifiche",
    pushNext: "Passo successivo: accendi un dispositivo",
  },

  install: {
    metaTitle: "Prepara il dispositivo alle notifiche di ShelfSpring",
    metaDescription: "Segui i passaggi per telefono o computer, accedi e prova le notifiche. La ricezione dipende anche dal browser e dalle impostazioni del dispositivo.",
  },

  pricing: {
    metaTitle: "Piani di monitoraggio: 10, 20 o 50 regole di avviso",
    metaDescription: "Salva gli iPhone e i negozi che puoi raggiungere. ShelfSpring parte da 5 USD al mese; disponibilità, mappe e cronologia restano consultabili gratuitamente.",
    title: "Un abbonamento su misura della tua rosa di scelte.",
    lead: "Sfogliare resta gratis. Abbonati quando vuoi che il prossimo cambiamento corrispondente venga lui da te. **Una regola segue un iPhone preciso in un negozio preciso.**",
    chips: ["Scaffali e storico pubblici restano gratuiti", "Lo stesso flusso di scorte in ogni piano", "Addebito mensile in dollari USA", "Rinnovo da fermare nel tuo account"],
    fastest: "A che cosa serve un abbonamento",
    everyFast: "La notifica parte dopo che è stata rilevata una disponibilità corrispondente. Controlli alla fonte, sincronizzazione e recapito possono aggiungere ritardo.",
    historySample: "Tutti i paesi seguiti · ultimi 7 giorni · {n} finestre di ritiro concluse",
    sellsOut: (band: string) => `Nel campione osservato, una voce di iPhone Duo è rimasta a scaffale per una mediana di **${band}**. È la descrizione di ciò che è stato registrato, non della tua prossima occasione.`,
    band: (range: string) => `${range} secondi`,
    aboutMinute: "un minuto circa",
    sameSpeed: "Scorte aggiornate di frequente",
    rechecked: "quanto spesso si guarda nei tuoi negozi",
    toPhone: "dal rientro confermato al tuo dispositivo",
    listing: "tempo mediano a scaffale del Duo",
    note: { plus: "per esempio una configurazione seguita in dieci negozi", pro: "per esempio due configurazioni, dieci negozi ciascuna", max: "per esempio cinque configurazioni, dieci negozi ciascuna" } as Record<string, string>,
    month: "al mese",
    alerts: (n: number) => `${N(n)} regole di notifica`,
    perks: ["Combinazioni esatte di capacità e finitura", "Negozi raggiungibili da cambiare quando cambiano i tuoi piani", "Push del browser, con l'email come riserva"],
    cancel: "Il rinnovo si può fermare in qualsiasi momento",
    get: (plan: string) => `Inizia con ${plan}`,
    billing: "I pagamenti passano da Stripe, con carta o Link. Il passaggio fra piani si calcola in proporzione.",
    refund: "Condizioni di rimborso: un pagamento degli ultimi 7 giorni si rimborsa per intero se da allora non è stata recapitata nessuna notifica di rientro ([regole sui rimborsi](/refunds)).",
  },
};
