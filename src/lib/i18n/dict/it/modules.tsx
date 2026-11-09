/**
 * Italian strings: modules — the restock, store and stock modules. `label` arrives with its preposition
 * ("a Roma", "da Apple Via del Corso", "in Italia", "qui"); numbers arrive raw and are grouped here.
 * Voice: an observation ledger. A restock is a "rientro", a sell-out is the listing leaving the shelf ("fuori scaffale"),
 * a status is "a scaffale" / "fuori scaffale", a check is an "occhiata".
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { aLuogo, cap, dei, n as N, pl } from "./util";

/** "nei 17" / "negli 8": the plural article before a count. */
const nei = (x: number) => dei(x).replace(/^de/, "ne");
/** "il martedì" / "la domenica" from a weekday name. */
const ilDay = (d: string) => (/^domenic/i.test(d) ? `la ${d}` : `il ${d}`);
/** "dalle 10:00" / "dall'1:00", "alle 21:00" / "all'1:00": an opening time joined the Italian way. */
const dalleH = (t: string) => (/^0?1[:.]/.test(t) ? `dall'${t}` : `dalle ${t}`);
const alleH = (t: string) => (/^0?1[:.]/.test(t) ? `all'${t}` : `alle ${t}`);

export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `Pagina bianca ${label} negli ultimi ${N(days)} giorni: nessun rientro e nessuna voce uscita dallo scaffale. Le barre partono dalla prima annotazione.`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `Rientri ${label} in ${N(activeDays)} degli ultimi ${N(days)} giorni: ${pl(restocks, "annotato", "annotati")} in tutto, ${N(soldouts)} di nuovo fuori scaffale.`,
    busiest: (day: string, restocks: number) => <> Il picco: <b className="text-ink">{day}</b>, {N(restocks)} in quella giornata.</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day}: ${pl(restocks, "rientro", "rientri")}, ${N(soldouts)} fuori scaffale`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day} · ${N(restocks)} rientrati · ${N(soldouts)} fuori scaffale`,
    legendRestocks: "rientri",
    legendSoldouts: "di nuovo fuori scaffale",
  },

  last24: {
    title: (label: string) => `iPhone Duo ${label}: i rientri delle ultime 24 ore`,
    asOf: (when: string) => `istantanea · ${when}`,
    localTime: (when: string) => `${when}, ora del negozio`,
    anAppleStore: "un Apple Store non più in elenco",
    unknown: "Il conteggio delle 24 ore non si è caricato per questa richiesta. Lo stato degli scaffali e il registro dei rientri di questa pagina restano validi.",
    none: (label: string, asOf: string) => <><b className="text-ink">24 ore tranquille {label}:</b> nessun rientro di iPhone Duo annotato nella finestra (chiusura: {asOf}).</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <>Rientro più recente: <b className="text-ink">{o.config}</b>, {o.when} sull&apos;orologio del negozio{o.store != null && <>, annotato presso {o.store}</>}. <b className="text-ink">{pl(o.restocks, "rientro", "rientri")} nella finestra</b>{o.one ? null : <>, in {pl(o.withStores, "negozio", "negozi")} su {N(o.allStores)} {o.label}</>}.</>
    ),
    tileRestocks: "rientri nella finestra",
    tileConfigsBack: "configurazioni tornate a scaffale",
    tileStores: (configs: number, allConfigs: number) => `negozi con un rientro${configs ? ` · ${N(configs)}/${N(allConfigs)} configurazioni` : ""}`,
    tileLatest: (config: string, store: string | null) => <>il più recente · {store != null && <>{store} · </>}{config}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>rientro precedente, {day} · {store != null && <>{store} · </>}{config}</>,
    tileNoEarlier: "niente di precedente nel registro",
    caption: (label: string, asOf: string) => `Rientri per configurazione di iPhone Duo ${label}, 24 ore · chiusura ${asOf}`,
    thConfig: "Capacità · finitura",
    thRestocks: "Rientri",
    thStores: "Negozi coinvolti",
    thLast: "Il più recente (ora del negozio)",
    thNow: "A scaffale adesso",
    ofStores: (n: number, total: number) => `${N(n)}/${N(total)}`,
    noneIn24: "niente annotato",
    yes: "a scaffale",
    no: "fuori",
    countedTitle: "Che cosa vale come rientro",
    counted: "Si annota un rientro quando un negozio passa, per una configurazione, da non disponibile a disponibile e il cambio viene confermato. Se succede di nuovo è un altro evento: non si contano telefoni. L'elenco dal vivo dice che cosa risultava all'ultimo controllo; lo storico mostra dove le voci sono riapparse e non anticipa la prossima consegna.",
    alert: (label: string | null) => `Prepara sul telefono le notifiche di rientro${label ? ` · ${label}` : ""}`,
  },

  clock: {
    none: (label: string, days: number) => `${N(days)} giorni senza rientri annotati ${label}.`,
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `Appena ${pl(total, "rientro annotato", "rientri annotati")} ${label} in ${N(days)} giorni${dates != null ? `, distribuiti su ${pl(dates, "data", "date")}` : ""}: troppo poco per indicare un'ora abituale.`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>Ora abituale dei rientri {label}: <b className="text-ink">{hour}</b> sull&apos;orologio del negozio, ricavata da {pl(total, "rientro", "rientri")} in {N(days)} giorni{day ? <>; in testa alla settimana c&apos;è <b className="text-ink">{ilDay(day)}</b></> : null}.</>
    ),
    byHour: (zone: string) => `Ora del giorno · ${zone}`,
    byWeekday: "Giorno della settimana",
    barReported: (n: number) => ` (+${N(n)} da fonti esterne)`,
    barReportedTitle: (bar: string, n: number) => `${bar}: ${N(n)} da fonti esterne`,
    legendOurs: "Rientri registrati",
  },

  feed: {
    empty: "Il registro dei rientri per ora è vuoto.",
    available: "A scaffale",
    soldOut: "Sparito",
    soldOutAt: (time: ReactNode) => <>uscita · {time}</>,
    since: (time: ReactNode) => <>rientro · {time}</>,
    restockedAt: (time: ReactNode) => <>rientro · {time}</>,
    mapAria: (store: string) => `Trova ${store} sull'atlante`,
    map: "Trova sull'atlante",
    buyAria: (model: string, config: string) => `Ordina ${model} ${config} da apple.com`,
    buy: "Ordina su apple.com",
  },

  byConfig: {
    empty: (label: string, days: number) => `Nessun rientro ${label} in ${N(days)} giorni: non c'è niente da mettere in fila.`,
    intro: (label: string, days: number) => `Configurazioni in fila per numero di rientri ${label}, finestra di ${N(days)} giorni.`,
    times: (n: number) => pl(n, "rientro", "rientri"),
    alert: "Segui",
  },

  sellout: {
    typical: (label: string, band: string) => `Vita mediana a scaffale di un rientro di iPhone Duo ${label}: ${band}, più o meno.`,
    half: (label: string, duration: string) => `Dei rientri cronometrati ${label}, la metà ha lasciato lo scaffale entro ${duration}.`,
    none: (label: string, days: number) => `Nell'arco di ${N(days)} giorni nessun rientro ${label} ha lasciato lo scaffale.`,
    whatDuo: "iPhone Duo",
    whatAll: "ogni modello",
    tileHalf: (what: string) => <>vita mediana a scaffale · {what}</>,
    tileWithin30: "fuori scaffale in ≤ 30 s",
    tileWithin60: "fuori scaffale in ≤ 1 min",
    tileFastest: (n: number, days: number) => <>il più lesto su {pl(n, "rientro cronometrato", "rientri cronometrati")}, {N(days)} g</>,
    caption: (days: number) => `Modello per modello, finestra di ${N(days)} giorni`,
    thIphone: "Modello",
    thSoldOut: "cronometrati",
    thHalf: "mediana",
    thWithin30: "≤ 30 s:",
    thWithin60: "≤ 1 min:",
    thFastest: "il più lesto",
    each: "Un rientro alla volta",
    barNote: (full: string) => `lunghezza della barra = tempo a scaffale · ${full} la riempie tutta`,
    stillListed: (duration: string) => `ancora a scaffale · ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "Come si delimita la vita a scaffale",
    measured: (_estimated: boolean) => { void _estimated; return "Ogni durata sta fra l'ultima osservazione in cui la voce era disponibile e la prima in cui non lo era più. Il segno ≈ indica un intervallo stimato. Una presenza più breve dell'intervallo fra due controlli può passare inosservata, e nessuna di queste durate è una finestra garantita per concludere l'ordine."; },
  },

  configTable: {
    title: "Controllo dello scaffale, configurazione per configurazione",
    titleAt: (store: string) => `Controllo dello scaffale per configurazione · ${store}`,
    lookupOff: (hasRows: boolean) => `Apple ha sospeso le verifiche di ritiro per questo negozio${hasRows ? "; le righe qui sotto riportano le sue ultime risposte" : ""}`,
    tracked: (n: number) => `${N(n)} configurazioni nel registro`,
    firstSweep: "Osservazioni in apertura: i primi stati arrivano entro un minuto",
    inStock: (n: number, total: number) => `a scaffale: ${N(n)} su ${N(total)} seguite`,
    available: "A scaffale",
    unavailable: "Fuori scaffale",
    noLookup: "verifica sospesa",
    notChecked: "manca la prima occhiata",
    since: (ago: ReactNode) => <>comparsa {ago}</>,
    lastAvailable: (ago: ReactNode) => <>vista l&apos;ultima volta {ago}</>,
    neverHere: "mai vista qui",
    buy: "Ordina",
    alertAria: (model: string, config: string, store: string) => `Segui ${model} ${config} presso ${store}`,
    alert: "Segui →",
  },

  matrix: {
    store: "Luogo",
    checked: "Ultima occhiata",
    cellTitle: (model: string, n: number, total: number) => `${model}: a scaffale ${N(n)} configurazioni su ${N(total)}`,
  },

  nearby: {
    duo: (short: string, n: number) => `${short} a scaffale · ${N(n)}`,
    noDuo: (short: string) => `${short} fuori scaffale`,
  },

  stockByModel: {
    availableNow: (n: number, total: number) => `${N(n)}/${N(total)} configurazioni a scaffale`,
    noneNow: (total: number) => `0/${N(total)} a scaffale`,
    lookupOff: "Verifiche di ritiro sospese da Apple per questo negozio",
    notChecked: "manca la prima occhiata",
    more: (n: number) => `+${N(n)} altre`,
    checked: (ago: ReactNode) => <>ultima occhiata {ago}</>,
    alert: "Segui →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>{ago} · Scorte aggiornate di frequente</>,
    map: "Vedi sull'atlante",
    alert: "Segui questo negozio",
    alsoIn: (region: string) => `Altri negozi · provincia di ${region}`,
    acrossLine: "Oltre il confine di stato, i più vicini",
    elsewhere: "Altrove, i più vicini",
  },

  hours: {
    title: "Orari d'apertura",
    local: (zone: string) => `Fuso degli orari: ${zone}`,
    today: (hours: string, week: string) => ` · ${hours} oggi · ${week}`,
    directions: "Come arrivarci",
    applePage: "La scheda di Apple",
    liveMap: "Vedilo sull'atlante",
    storePage: "Scheda del negozio",
    closed: "chiuso",
    everyDay: (hours: string) => `Ogni giorno ${hours}`,
    openNow: (closes: string) => `Porte aperte · fino ${alleH(closes)}`,
    opensAt: (opens: string) => `Le porte aprono ${alleH(opens)}`,
    closedToday: (next: string | null) => (next ? `Oggi chiuso · riapertura ${next}` : "Oggi chiuso"),
    closedNow: (next: string | null) => (next ? `Chiuso in questo momento · riapertura ${next}` : "Chiuso in questo momento"),
    nextOpen: (day: string | null, time: string) => `${day ?? "domani"}, ${time}`,
    span: (opens: string, closes: string) => `${dalleH(opens)} ${alleH(closes)}`,
  },

  liveStats: {
    inStock: "A scaffale",
    storesWith: "Negozi con qualcosa a scaffale",
    lastCheck: "Ultima occhiata",
    none: "—",
  },

  board: {
    summary: (n: number, stores: number, short: string) => `${short} a scaffale in ${N(n)} negozi su ${N(stores)}`,
    lastCheck: (ago: ReactNode) => <>Ultima occhiata {ago}</>,
    firstSweep: "Osservazioni in apertura.",
    noneListed: (model: string, storage: string | null, color: string | null) => `Al momento nessun negozio ha ${model}${storage ? ` ${storage}` : ""}${color ? ` ${color}` : ""} a scaffale.`,
    more: (n: number) => `+${N(n)} altri`,
    seen: (ago: ReactNode) => <>Annotato {ago}</>,
    loading: "Leggo gli scaffali",
  },

  /** DuoLedger: il registro delle osservazioni che apre le pagine di provincia, città, negozio, paese e del modello Duo. `place` arriva senza preposizione. */
  duoLedger: {
    kicker: (place: string) => `Registro delle osservazioni · iPhone Duo · ${place}`,
    headNone: (o) => `Nessuno ${dei(o.n)} Apple Store ${aLuogo(o.place)} espone un iPhone Duo per il ritiro.`,
    headNoneOne: (place: string) => `In questo momento ${place} non espone alcuna configurazione di iPhone Duo per il ritiro.`,
    headSome: (o) => <>A scaffale per il ritiro in {N(o.k)} {dei(o.n)} Apple Store {aLuogo(o.place)}: {o.list}.</>,
    headSomeOne: (o) => <>{o.place} espone per il ritiro {N(o.k)} delle {N(o.total)} configurazioni di iPhone Duo: {o.list}.</>,
    storeItem: (store: ReactNode, configs: number) => <>{store} ({pl(configs, "configurazione", "configurazioni")})</>,
    observed: (stamp: string) => `Osservazione del ${stamp}.`,
    lastReturn: (o) => <>Ultimo rientro confermato: <b className="text-ink">{o.config}</b>{o.store != null && <> presso {o.store}</>}, {o.when}{o.lasted ? <>, {o.lasted}</> : null}.</>,
    noReturnYet: (place: string, since: string) => `Nessun rientro confermato di iPhone Duo per ${place} da quando il registro è stato aperto, il ${since}.`,
    others: (o) => (o.one
      ? `Per confronto, questo negozio espone ${N(o.pro)} delle ${N(o.configs)} configurazioni di iPhone 18 Pro e ${N(o.max)} delle ${N(o.configs)} di Pro Max.`
      : `Per confronto, l'iPhone 18 Pro è a scaffale in ${N(o.pro)} di questi negozi e il Pro Max in ${N(o.max)}.`),
    mReturns: (since: string) => `rientri confermati dal ${since}`,
    mStores: "negozi con almeno un rientro",
    mDays: "giorni seguiti con un rientro",
    mWindow: (pct: string) => `le due ore locali più fitte · ${pct} del registro`,
    mPerDay: "rientri per giorno seguito",
    mMedian: "permanenza mediana, dalla comparsa alla sparizione",
    mToday: "rientri di oggi, finora",
    secUnit: "s",
    minUnit: "min",
    note: (o) => (o.one
      ? `Dal ${o.since} ShelfSpring ha registrato ${pl(o.n, "rientro confermato", "rientri confermati")} di iPhone Duo presso ${o.place}, in ${N(o.days)} ${dei(o.tracked)} giorni seguiti. Le due ore locali più fitte sono state ${o.range} (${o.pct} del registro; ${o.morning} fra le 8 e mezzogiorno), la singola ora più fitta ${o.busiest} con ${N(o.busiestN)}.${o.median ? ` Metà delle presenze misurate era già sparita entro ${o.median}.` : ""}${o.config ? ` La configurazione rientrata più spesso è ${o.config} (${N(o.top)} su ${N(o.n)}).` : ""}`
      : `${cap(nei(o.stores))} Apple Store ${aLuogo(o.place)}, ShelfSpring ha registrato ${pl(o.n, "rientro confermato", "rientri confermati")} di iPhone Duo dal ${o.since}; ${N(o.k)} negozi ne hanno avuto almeno uno. Le due ore locali più fitte sono state ${o.range} (${o.zone}; ${o.pct} del registro; ${o.morning} fra le 8 e mezzogiorno), la singola ora più fitta ${o.busiest} con ${N(o.busiestN)}.${o.median ? ` Metà delle presenze misurate era già sparita entro ${o.median}.` : ""}${o.config ? ` La configurazione rientrata più spesso è ${o.config} (${N(o.top)} su ${N(o.n)}).` : ""}`),
    noteFew: (o) => `${pl(o.n, "rientro confermato", "rientri confermati")} di iPhone Duo ${o.one ? `presso ${o.place}` : `${nei(o.stores)} Apple Store ${aLuogo(o.place)}`} dal ${o.since}, in ${pl(o.days, "giorno", "giorni")}: sotto la soglia di ${N(o.min)} rientri su ${N(o.minDays)} giorni che ShelfSpring richiede prima di descrivere un'ora abituale.${o.median ? ` Metà delle presenze misurate era già sparita entro ${o.median}.` : ""} I singoli rientri sono nel registro qui sotto.`,
    hourByHour: "Apri il registro ora per ora →",
    ledger: (k: number) => (k === 1 ? "L'ultimo rientro registrato" : `Gli ultimi ${N(k)} rientri registrati`),
    col: { observed: "Visto (ora del negozio)", config: "Configurazione", store: "Negozio", listed: "Tempo a scaffale" },
    secs: (k: number) => `${N(k)} s`,
    mins: (k: number) => `${N(k)} min`,
    listedRange: (low: string, high: string) => `${low}–${high} a scaffale`,
    listedAbout: (x: string) => `circa ${x} a scaffale`,
    stillListed: (x: string) => `a scaffale da ${x}, per ora`,
    method: (o) => `Registro aperto il ${o.since} · ${o.note} · un rientro si conta quando due osservazioni consecutive concordano; la prima comparsa di una configurazione non conta mai.`,
    delivered: (o) => (o.one
      ? `Notifiche recapitate da ShelfSpring ai membri per rientri presso ${o.place}, finestra di ${N(o.days)} giorni: ${N(o.sent)}.`
      : `Notifiche recapitate da ShelfSpring ai membri per rientri in ${N(o.stores)} ${dei(o.total)} Apple Store ${aLuogo(o.place)}, finestra di ${N(o.days)} giorni: ${N(o.sent)}.`),
    watch: (place: string) => `Segui una configurazione a ${place} →`,
    watchOne: "Segui una configurazione in questo negozio →",
    unknown: "Il registro delle osservazioni non è leggibile per questa richiesta; l'elenco dal vivo qui sopra non ne risente.",
    zone: () => "ora del negozio",
    allModels: (o) => `Tutti i modelli insieme: ${pl(o.n, "rientro registrato", "rientri registrati")} sull'arco di ${N(o.days)} giorni${o.peak ? `; l'ora più fitta è stata ${o.peak}` : ""}.`,
  },
};
