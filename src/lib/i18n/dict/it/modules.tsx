/**
 * Italian strings: modules — the restock, store and stock modules. `label` arrives with its preposition
 * ("a Roma", "da Apple Via del Corso", "in Italia", "qui"); numbers arrive raw and are grouped here.
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { dei, n as N, pl } from "./util";

/** "il martedì" / "la domenica" from a weekday name. */
const ilDay = (d: string) => (/^domenic/i.test(d) ? `la ${d}` : `il ${d}`);

export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `Nessun rifornimento o esaurimento registrato ${label} negli ultimi ${N(days)} giorni: il grafico si riempie dal primo.`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `${pl(restocks, "rifornimento", "rifornimenti")} e ${pl(soldouts, "esaurimento", "esaurimenti")} ${label} negli ultimi ${N(days)} giorni, in ${pl(activeDays, "giorno", "giorni diversi")}.`,
    busiest: (day: string, restocks: number) => <> Il giorno più intenso è stato il <b className="text-ink">{day}</b>, con {N(restocks)}.</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day}: ${pl(restocks, "rifornimento", "rifornimenti")}, ${pl(soldouts, "esaurimento", "esaurimenti")}`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day}: ${pl(restocks, "rifornimento", "rifornimenti")} · ${pl(soldouts, "esaurimento", "esaurimenti")}`,
    legendRestocks: "rifornimenti",
    legendSoldouts: "esaurimenti",
  },

  last24: {
    title: (label: string) => `Rifornimenti di iPhone Duo ${label} nelle ultime 24 ore`,
    asOf: (when: string) => `situazione al ${when}`,
    localTime: (when: string) => `${when} ora locale`,
    anAppleStore: "un Apple Store",
    unknown: "Il conteggio delle ultime 24 ore non è disponibile in questo momento; la disponibilità in tempo reale e il registro dei rifornimenti di questa pagina non ne risentono.",
    none: (label: string, asOf: string) => <><b className="text-ink">Nessun rifornimento di iPhone Duo {label} nelle ultime 24 ore</b> (situazione al {asOf}).</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <>Nelle ultime 24 ore l&apos;iPhone Duo è tornato disponibile <b className="text-ink">{o.restocks === 1 ? "1 volta" : `${N(o.restocks)} volte`} {o.one ? o.label : `in ${N(o.withStores)} ${o.allStores === 1 ? "Apple Store su 1" : `${dei(o.allStores)} Apple Store`} ${o.label}`}</b>; l&apos;ultimo: <b className="text-ink">{o.config}</b>{o.store != null && <> da {o.store}</>}, {o.when} ora locale.</>
    ),
    tileRestocks: "rifornimenti confermati · 24 h",
    tileConfigsBack: "configurazioni tornate disponibili",
    tileStores: (configs: number, allConfigs: number) => `negozi con un rifornimento${configs ? ` · ${N(configs)} configurazioni su ${N(allConfigs)}` : ""}`,
    tileLatest: (config: string, store: string | null) => <>ultimo · {config}{store != null && <> · {store}</>}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>il precedente · {config}{store != null && <> · {store}</>} · {day}</>,
    tileNoEarlier: "nessun rifornimento precedente registrato",
    caption: (label: string, asOf: string) => `Rifornimenti confermati di ogni configurazione di iPhone Duo ${label}, ultime 24 ore, situazione al ${asOf}`,
    thConfig: "Configurazione",
    thRestocks: "Rifornimenti",
    thStores: "Negozi",
    thLast: "Ultimo rifornimento (ora locale)",
    thNow: "Disponibile ora",
    ofStores: (n: number, total: number) => `${N(n)} su ${N(total)}`,
    noneIn24: "nessuno in 24 h",
    yes: "sì",
    no: "no",
    countedTitle: "Come contiamo i rifornimenti",
    counted: "Un evento è il passaggio confermato da non disponibile a disponibile di una configurazione in uno store. I ritorni ripetuti sono eventi distinti, non un conteggio di telefoni. La lista mostra l’ultimo controllo. La cronologia indica dove sono riapparse le disponibilità, senza prevedere la prossima consegna.",
    alert: (label: string | null) => `Configura gli avvisi di disponibilità sul telefono${label ? ` · ${label}` : ""}`,
  },

  clock: {
    none: (label: string, days: number) => `Ancora nessun rifornimento registrato ${label} negli ultimi ${N(days)} giorni.`,
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `${pl(total, "rifornimento", "rifornimenti")} ${label} negli ultimi ${N(days)} giorni${dates != null ? ` (in ${pl(dates, "giorno", "giorni")})` : ""}: troppo pochi per parlare di una tendenza.`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>{pl(total, "rifornimento", "rifornimenti")} {label} negli ultimi {N(days)} giorni. Per lo più arrivano verso <b className="text-ink">le {hour}</b>, ora locale{day ? <>, e il giorno più intenso è <b className="text-ink">{ilDay(day)}</b></> : null}.</>
    ),
    byHour: (zone: string) => `Per fascia oraria · ${zone}`,
    byWeekday: "Per giorno della settimana",
    barReported: (n: number) => ` (+${N(n)} ${n === 1 ? "segnalato" : "segnalati"} da altri tracker)`,
    barReportedTitle: (bar: string, n: number) => `${bar}: ${N(n)} ${n === 1 ? "segnalato" : "segnalati"} da altri tracker`,
    legendOurs: "Ritorni in stock registrati",
  },

  feed: {
    empty: "Ancora nessun rifornimento registrato.",
    available: "Disponibile",
    soldOut: "Esaurito",
    soldOutAt: (time: ReactNode) => <>esaurito {time}</>,
    since: (time: ReactNode) => <>disponibile {time}</>,
    restockedAt: (time: ReactNode) => <>rifornito {time}</>,
    mapAria: (store: string) => `Mostra ${store} sulla mappa`,
    map: "Mappa",
    buyAria: (model: string, config: string) => `Acquista l'${model} ${config} su apple.com`,
    buy: "Acquista su apple.com",
  },

  byConfig: {
    empty: (label: string, days: number) => `Nessuna configurazione è tornata disponibile ${label} negli ultimi ${N(days)} giorni, quindi non c'è ancora una classifica.`,
    intro: (label: string, days: number) => `Le configurazioni tornate disponibili ${label} negli ultimi ${N(days)} giorni, dalla più frequente.`,
    times: (n: number) => `${N(n)}×`,
    alert: "Avvisami",
  },

  sellout: {
    typical: (label: string, band: string) => `Un rifornimento tipico di iPhone Duo ${label} si è esaurito in circa ${band}.`,
    half: (label: string, duration: string) => `Metà dei rifornimenti ${label} si è esaurita entro ${duration}.`,
    none: (label: string, days: number) => `Nessun rifornimento ${label} si è ancora esaurito negli ultimi ${N(days)} giorni.`,
    whatDuo: "iPhone Duo",
    whatAll: "tutti gli iPhone",
    tileHalf: (what: string) => <>metà esaurita entro · {what}</>,
    tileWithin30: "esauriti entro 30 s",
    tileWithin60: "esauriti entro 1 min",
    tileFastest: (n: number, days: number) => <>il più rapido · {pl(n, "rifornimento esaurito", "rifornimenti esauriti")}, {N(days)} g</>,
    caption: (days: number) => `Per iPhone, ultimi ${N(days)} giorni`,
    thIphone: "iPhone",
    thSoldOut: "Esauriti",
    thHalf: "Metà esaurita entro",
    thWithin30: "≤ 30 s",
    thWithin60: "≤ 1 min",
    thFastest: "Il più rapido",
    each: "Rifornimento per rifornimento",
    barNote: (full: string) => `barra = secondi in vendita · piena a ${full}`,
    stillListed: (duration: string) => `ancora disponibile · ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "Come lo misuriamo",
    measured: (_estimated: boolean) => { void _estimated; return "La durata è compresa fra l’ultima osservazione disponibile e la prima non disponibile. ≈ indica un intervallo stimato. Le disponibilità più brevi dell’intervallo di controllo possono sfuggire; queste durate non garantiscono il tempo per completare l’acquisto."; },
  },

  configTable: {
    title: "Tutte le configurazioni in questo negozio",
    titleAt: (store: string) => `Tutte le configurazioni da ${store}`,
    lookupOff: (hasRows: boolean) => `Al momento Apple non offre la verifica del Ritiro in negozio per questo negozio${hasRows ? " (qui sotto le ultime risposte ricevute)" : ""}`,
    tracked: (n: number) => `${N(n)} configurazioni monitorate`,
    firstSweep: "Primo controllo in corso: gli stati compaiono entro un minuto",
    inStock: (n: number, total: number) => `${N(n)} su ${N(total)} disponibili`,
    available: "Disponibile",
    unavailable: "Non disponibile",
    noLookup: "nessuna verifica del ritiro",
    notChecked: "non ancora controllato",
    since: (ago: ReactNode) => <>apparso {ago}</>,
    lastAvailable: (ago: ReactNode) => <>ultima volta disponibile {ago}</>,
    neverHere: "mai visto disponibile qui",
    buy: "Acquista",
    alertAria: (model: string, config: string, store: string) => `Avvisami quando l'${model} ${config} è disponibile da ${store}`,
    alert: "Avvisami →",
  },

  matrix: {
    store: "Negozio",
    checked: "Controllato",
    cellTitle: (model: string, n: number, total: number) => `${model}: ${N(n)} configurazioni su ${N(total)} disponibili`,
  },

  nearby: {
    duo: (short: string, n: number) => `${short} · ${N(n)}`,
    noDuo: (short: string) => `nessun ${short}`,
  },

  stockByModel: {
    availableNow: (n: number, total: number) => `${N(n)} configurazioni su ${N(total)} disponibili ora`,
    noneNow: (total: number) => `nessuna delle ${N(total)} configurazioni in questo momento`,
    lookupOff: "Al momento Apple non offre la verifica del ritiro qui",
    notChecked: "non ancora controllato",
    more: (n: number) => `+${N(n)}`,
    checked: (ago: ReactNode) => <>controllato {ago}</>,
    alert: "Avvisami →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>{ago} · Aggiornamenti regolari della disponibilità</>,
    map: "Mostra sulla mappa",
    alert: "Avvisami qui",
    alsoIn: (region: string) => `Anche in provincia di ${region}`,
    acrossLine: "I negozi più vicini oltre il confine dello stato",
    elsewhere: "I negozi più vicini altrove",
  },

  hours: {
    title: "Orari",
    local: (zone: string) => `Orari locali (${zone})`,
    today: (hours: string, week: string) => ` · oggi ${hours} · ${week}`,
    directions: "Indicazioni",
    applePage: "Pagina del negozio su apple.com",
    liveMap: "Mappa in tempo reale",
    storePage: "Pagina del negozio",
    closed: "Chiuso",
    everyDay: (hours: string) => `Tutti i giorni ${hours}`,
    openNow: (closes: string) => `Aperto ora · chiude alle ${closes}`,
    opensAt: (opens: string) => `Apre alle ${opens}`,
    closedToday: (next: string | null) => (next ? `Chiuso oggi · apre ${next}` : "Chiuso oggi"),
    closedNow: (next: string | null) => (next ? `Chiuso ora · apre ${next}` : "Chiuso ora"),
    nextOpen: (day: string | null, time: string) => `${day ?? "domani"} alle ${time}`,
  },

  liveStats: {
    inStock: "Disponibili ora",
    storesWith: "Negozi con disponibilità",
    lastCheck: "Ultimo controllo",
    none: "—",
  },

  board: {
    summary: (n: number, stores: number, short: string) => `${N(n)} negozi su ${N(stores)} hanno il ${short} disponibile`,
    lastCheck: (ago: ReactNode) => <>Ultimo controllo {ago}</>,
    firstSweep: "Primo controllo in corso.",
    noneListed: (model: string, storage: string | null, color: string | null) => `In questo momento nessun negozio ha disponibile l'${model}${storage ? ` ${storage}` : ""}${color ? ` ${color}` : ""}.`,
    more: (n: number) => `+${N(n)}`,
    seen: (ago: ReactNode) => <>Visto {ago}</>,
    loading: "Caricamento disponibilità",
  },

  /** DuoLedger: il registro delle osservazioni che apre le pagine di regione, città, store, paese e del modello Duo. `place` arriva senza preposizione. */
  duoLedger: {
    kicker: (place: string) => `Registro delle osservazioni · iPhone Duo · ${place}`,
    headNone: (o) => `Nessuno dei ${N(o.n)} Apple Store di ${o.place} propone un iPhone Duo per il ritiro.`,
    headNoneOne: (place: string) => `${place} non propone nessuna configurazione di iPhone Duo per il ritiro.`,
    headSome: (o) => <>Disponibile per il ritiro in {N(o.k)} dei {N(o.n)} Apple Store di {o.place}: {o.list}.</>,
    headSomeOne: (o) => <>{o.place} propone {N(o.k)} delle {N(o.total)} configurazioni di iPhone Duo per il ritiro: {o.list}.</>,
    storeItem: (store: ReactNode, configs: number) => <>{store} ({pl(configs, "configurazione", "configurazioni")})</>,
    observed: (stamp: string) => `Osservato il ${stamp}.`,
    lastReturn: (o) => <>Ultimo ritorno confermato: <b className="text-ink">{o.config}</b>{o.store != null && <> da {o.store}</>}, {o.when}{o.lasted ? <>, {o.lasted}</> : null}.</>,
    noReturnYet: (place: string, since: string) => `Nessun ritorno confermato dell’iPhone Duo per ${place} dall’apertura del registro il ${since}.`,
    others: (o) => (o.one ? `iPhone 18 Pro: ${N(o.pro)} configurazioni su ${N(o.configs)} disponibili qui; 18 Pro Max: ${N(o.max)} su ${N(o.configs)}.` : `iPhone 18 Pro: disponibile in ${N(o.pro)} di questi store; 18 Pro Max: in ${N(o.max)}.`),
    mReturns: (since: string) => `ritorni confermati dal ${since}`,
    mStores: "store con almeno un ritorno",
    mDays: "giorni seguiti con un ritorno",
    mWindow: (pct: string) => `le due ore più attive · ${pct} del registro`,
    mPerDay: "ritorni per giorno seguito",
    mMedian: "durata mediana dell’annuncio, dalla comparsa alla scomparsa",
    mToday: "ritorni di oggi, finora",
    secUnit: "s",
    minUnit: "min",
    note: (o) => (o.one
      ? `Dal ${o.since} ShelfSpring ha registrato ${pl(o.n, "ritorno confermato", "ritorni confermati")} dell’iPhone Duo da ${o.place}, in ${N(o.days)} dei ${N(o.tracked)} giorni seguiti. Le due ore più attive sono state ${o.range} (${o.pct} del registro; ${o.morning} tra le 8 e mezzogiorno), l’ora più attiva ${o.busiest} con ${N(o.busiestN)}.${o.median ? ` Metà degli annunci misurati era scomparsa entro ${o.median}.` : ""}${o.config ? ` ${o.config} è tornato più spesso (${N(o.top)} su ${N(o.n)}).` : ""}`
      : `Nei ${N(o.stores)} Apple Store di ${o.place}, ShelfSpring ha registrato ${pl(o.n, "ritorno confermato", "ritorni confermati")} dell’iPhone Duo dal ${o.since}; ${N(o.k)} store ne hanno avuto almeno uno. Le due ore più attive sono state ${o.range} (${o.zone}; ${o.pct} del registro; ${o.morning} tra le 8 e mezzogiorno), l’ora più attiva ${o.busiest} con ${N(o.busiestN)}.${o.median ? ` Metà degli annunci misurati era scomparsa entro ${o.median}.` : ""}${o.config ? ` ${o.config} è tornato più spesso (${N(o.top)} su ${N(o.n)}).` : ""}`),
    noteFew: (o) => `${pl(o.n, "ritorno confermato", "ritorni confermati")} dell’iPhone Duo ${o.one ? `da ${o.place}` : `nei ${N(o.stores)} Apple Store di ${o.place}`} dal ${o.since}, in ${pl(o.days, "giorno", "giorni")}: sotto la soglia di ${N(o.min)} ritorni in ${N(o.minDays)} giorni che ShelfSpring applica prima di descrivere un orario abituale.${o.median ? ` Metà degli annunci misurati era scomparsa entro ${o.median}.` : ""} I singoli ritorni sono nel registro qui sotto.`,
    hourByHour: "Apri il registro ora per ora →",
    ledger: (k: number) => (k === 1 ? "L’ultimo ritorno registrato" : `Gli ultimi ${N(k)} ritorni registrati`),
    col: { observed: "Osservato (ora dello store)", config: "Configurazione", store: "Store", listed: "Annunciato per" },
    secs: (k: number) => `${N(k)} s`,
    mins: (k: number) => `${N(k)} min`,
    listedRange: (low: string, high: string) => `annunciato ${low}–${high}`,
    listedAbout: (x: string) => `annunciato circa ${x}`,
    stillListed: (x: string) => `ancora annunciato (${x})`,
    method: (o) => `Registro dal ${o.since} · ${o.note} · un ritorno si conta solo quando due osservazioni consecutive concordano; la prima comparsa di una configurazione non conta mai.`,
    delivered: (o) => (o.one
      ? `Negli ultimi ${N(o.days)} giorni ShelfSpring ha recapitato ${pl(o.sent, "avviso", "avvisi")} ai membri per ritorni da ${o.place}.`
      : `Negli ultimi ${N(o.days)} giorni ShelfSpring ha recapitato ${pl(o.sent, "avviso", "avvisi")} ai membri per ritorni in ${N(o.stores)} dei ${N(o.total)} Apple Store di ${o.place}.`),
    watch: (place: string) => `Segui una configurazione a ${place} →`,
    watchOne: "Segui una configurazione in questo store →",
    unknown: "Il registro delle osservazioni non è leggibile per questa richiesta; la disponibilità in tempo reale qui sopra non ne risente.",
    zone: () => "ora locale",
    allModels: (o) => `Tutti i modelli insieme: ${pl(o.n, "ritorno registrato", "ritorni registrati")} in ${N(o.days)} giorni${o.peak ? `; l’ora più attiva è stata ${o.peak}` : ""}.`,
  },
};
