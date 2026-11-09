/**
 * German strings: modules — Rückkehr-, Store- und Regal-Module. `label` is a place phrase the page builds
 * ("in Bayern", "bei Apple Rosenstraße", "hier"); numbers arrive raw and are formatted here.
 * Voice (2026-11-08): Beobachtungsbuch. Ein Restock ist eine „Rückkehr“, ein Ausverkauf heißt „aus dem Regal“,
 * der Status lautet „im Regal“ / „nicht im Regal“, eine Prüfung ist ein „Blick“. Zeilen bleiben knapp; die
 * Reihenfolge der Felder legen die Komponenten fest.
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { inOrt, n, plural } from "./util";

const rk = (x: number) => plural(x, "Rückkehr", "Rückkehren");

export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `Leeres Blatt ${label} für die vergangenen ${days} Tage: keine Rückkehr, nichts aus dem Regal verschwunden. Die Balken beginnen mit dem ersten Eintrag.`,
    summary: (r: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `An ${n(activeDays)} von ${days} Tagen gab es ${label} eine Rückkehr – ${rk(r)} insgesamt, ${n(soldouts)}× wieder aus dem Regal.`,
    busiest: (day: string, r: number) => <> Spitzentag <b className="text-ink">{day}</b>, {n(r)} an diesem Tag.</>,
    barAria: (day: string, r: number, soldouts: number) => `${day}: ${n(r)} zurückgekehrt, ${n(soldouts)} aus dem Regal`,
    barTitle: (day: string, r: number, soldouts: number) => `${day} · ${n(r)} zurück · ${n(soldouts)} aus dem Regal`,
    legendRestocks: "Rückkehren",
    legendSoldouts: "wieder aus dem Regal",
  },

  last24: {
    title: (label: string) => `iPhone-Duo-Rückkehren ${label} · die vergangenen 24 Stunden`,
    asOf: (when: string) => `Momentaufnahme · ${when}`,
    localTime: (when: string) => `${when} nach Store-Uhr`,
    anAppleStore: "ein nicht mehr gelisteter Apple Store",
    unknown: "Die 24-Stunden-Bilanz kam bei diesem Aufruf nicht an. Regalstand und Rückkehr-Logbuch auf dieser Seite gelten trotzdem.",
    none: (label: string, asOf: string) => <><b className="text-ink">Ruhige 24 Stunden {label}:</b> im Zeitraum bis {asOf} keine iPhone-Duo-Rückkehr verzeichnet.</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <>Jüngste Rückkehr: <b className="text-ink">{o.config}</b>, {o.when} nach Store-Uhr{o.store != null && <>, verzeichnet bei {o.store}</>}. <b className="text-ink">{`${rk(o.restocks)} im Zeitraum`}</b>{o.one ? null : <>, in {n(o.withStores)} von {n(o.allStores)} {o.allStores === 1 ? "Store" : "Stores"} {o.label}</>}.</>
    ),
    tileRestocks: "Rückkehren im Zeitraum",
    tileConfigsBack: "Varianten wieder im Regal",
    tileStores: (configs: number, allConfigs: number) => `Stores mit Rückkehr${configs ? ` · ${configs}/${allConfigs} Varianten` : ""}`,
    tileLatest: (config: string, store: string | null) => <>jüngste · {store != null && <>{store} · </>}{config}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>vorige Rückkehr, {day} · {store != null && <>{store} · </>}{config}</>,
    tileNoEarlier: "nichts Früheres verzeichnet",
    caption: (label: string, asOf: string) => `Rückkehren je iPhone-Duo-Variante ${label} in den 24 Stunden bis ${asOf}`,
    thConfig: "Variante",
    thRestocks: "Rückkehren",
    thStores: "Stores",
    thLast: "Jüngste (Store-Uhr)",
    thNow: "Jetzt im Regal",
    ofStores: (k: number, total: number) => `${n(k)}/${n(total)}`,
    noneIn24: "nichts verzeichnet",
    yes: "im Regal",
    no: "weg",
    countedTitle: "Was als Rückkehr zählt",
    counted: "Eine Rückkehr ist der bestätigte Wechsel einer Store-Varianten-Kombination von „nicht im Regal“ zu „im Regal“. Wiederholte Rückkehren zählen als eigene Ereignisse, nicht als Stückzahl. Die Liste gibt wieder, was beim letzten Blick im Regal lag; die Aufzeichnung zeigt, wo Listungen zurückkamen, und sagt keine nächste Lieferung voraus.",
    alert: (label: string | null) => `Benachrichtigungen fürs Handy einrichten${label ? ` · ${label}` : ""}`,
  },

  clock: {
    none: (label: string, days: number) => `Keine Rückkehr ${label} in den vergangenen ${days} Tagen verzeichnet.`,
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `Erst ${rk(total)} ${label} in ${days} Tagen${dates != null ? `, verteilt auf ${dates === 1 ? "einen Kalendertag" : `${n(dates)} Kalendertage`}` : ""} – zu wenig, um eine übliche Stunde zu nennen.`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>Übliche Rückkehrstunde {label}: <b className="text-ink">{hour}</b> Store-Zeit, ermittelt aus {rk(total)} in {days} Tagen{day ? <>; <b className="text-ink">{day}</b> führt die Woche an</> : null}.</>
    ),
    byHour: (zone: string) => `Tagesstunde · ${zone}`,
    byWeekday: "Wochentag",
    barReported: (k: number) => ` (+${n(k)} Fremdmeldungen)`,
    barReportedTitle: (bar: string, k: number) => `${bar}: ${n(k)} Fremdmeldungen`,
    legendOurs: "Selbst verzeichnete Rückkehren",
  },

  feed: {
    empty: "Das Rückkehr-Logbuch ist bisher leer.",
    available: "Im Regal",
    soldOut: "Weg",
    soldOutAt: (time: ReactNode) => <>geräumt · {time}</>,
    since: (time: ReactNode) => <>Rückkehr · {time}</>,
    restockedAt: (time: ReactNode) => <>Rückkehr · {time}</>,
    mapAria: (store: string) => `${store} im Abhol-Atlas zeigen`,
    map: "Im Atlas zeigen",
    buyAria: (model: string, config: string) => `${model} ${config} bei apple.com bestellen`,
    buy: "Bei apple.com bestellen",
  },

  byConfig: {
    empty: (label: string, days: number) => `Keine Rückkehr ${label} in ${days} Tagen, also auch keine Rangfolge.`,
    intro: (label: string, days: number) => `Varianten nach Zahl der Rückkehren ${label}, vergangene ${days} Tage.`,
    times: (k: number) => rk(k),
    alert: "Beobachten",
  },

  sellout: {
    typical: (label: string, band: string) => `Mittlere Regalzeit einer iPhone-Duo-Rückkehr ${label}: rund ${band}.`,
    half: (label: string, duration: string) => `Die Hälfte der gemessenen Rückkehren ${label} war nach ${duration} wieder aus dem Regal.`,
    none: (label: string, days: number) => `Keine Rückkehr ${label} ist in den vergangenen ${days} Tagen aus dem Regal verschwunden.`,
    whatDuo: "iPhone Duo",
    whatAll: "alle Modelle",
    tileHalf: (what: string) => <>mittlere Regalzeit · {what}</>,
    tileWithin30: "aus dem Regal in ≤ 30 s",
    tileWithin60: "aus dem Regal in ≤ 1 Min.",
    tileFastest: (k: number, days: number) => <>kürzeste von {n(k)} gemessenen Rückkehren, {days} Tage</>,
    caption: (days: number) => `Je Modell, vergangene ${days} Tage`,
    thIphone: "Modell",
    thSoldOut: "gemessen",
    thHalf: "Median",
    thWithin30: "≤ 30 s:",
    thWithin60: "≤ 1 Min.:",
    thFastest: "kürzeste",
    each: "Rückkehr für Rückkehr",
    barNote: (full: string) => `Balkenlänge = Zeit im Regal · ${full} füllt ihn ganz`,
    stillListed: (duration: string) => `noch im Regal · ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "Wie die Regalzeit eingegrenzt wird",
    measured: (_estimated: boolean) => { void _estimated; return "Die Regalzeit liegt zwischen dem letzten Blick, bei dem die Variante noch gelistet war, und dem ersten, bei dem sie fehlte. ≈ kennzeichnet ein geschätztes Intervall. Kürzere Listungen können zwischen zwei Blicken unbemerkt kommen und gehen; die Dauer sichert kein Zeitfenster für den Kauf zu."; },
  },

  configTable: {
    title: "Regalcheck nach Variante",
    titleAt: (store: string) => `Regalcheck nach Variante · ${store}`,
    lookupOff: (hasRows: boolean) => `Apple hat die Abholabfrage für diesen Store pausiert${hasRows ? "; die Zeilen unten sind die letzten Antworten von dort" : ""}`,
    tracked: (k: number) => `${n(k)} Varianten unter Beobachtung`,
    firstSweep: "Die Beobachtung beginnt gerade; die ersten Zustände folgen binnen einer Minute",
    inStock: (k: number, total: number) => `im Regal: ${n(k)} von ${n(total)} beobachteten`,
    available: "Im Regal",
    unavailable: "Nicht im Regal",
    noLookup: "Abfrage pausiert",
    notChecked: "wartet auf den ersten Blick",
    since: (ago: ReactNode) => <>erschienen {ago}</>,
    lastAvailable: (ago: ReactNode) => <>zuletzt gesehen {ago}</>,
    neverHere: "hier nie gesehen",
    buy: "Bestellen",
    alertAria: (model: string, config: string, store: string) => `${model} ${config} bei ${store} beobachten`,
    alert: "Beobachten →",
  },

  matrix: {
    store: "Standort",
    checked: "Letzter Blick",
    cellTitle: (model: string, k: number, total: number) => `${model}: ${n(k)} von ${n(total)} Varianten im Regal`,
  },

  nearby: {
    duo: (short: string, k: number) => `${short} im Regal · ${n(k)}`,
    noDuo: (short: string) => `${short} nicht im Regal`,
  },

  stockByModel: {
    availableNow: (k: number, total: number) => `${n(k)}/${n(total)} Varianten im Regal`,
    noneNow: (total: number) => `0/${n(total)} im Regal`,
    lookupOff: "Abholabfrage für diesen Store von Apple pausiert",
    notChecked: "wartet auf den ersten Blick",
    more: (k: number) => `+${n(k)} weitere`,
    checked: (ago: ReactNode) => <>letzter Blick {ago}</>,
    alert: "Beobachten →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>{ago} · laufend nachgeführter Regalstand</>,
    map: "Im Atlas ansehen",
    alert: "Diesen Store beobachten",
    alsoIn: (region: string) => `Mehr ${inOrt(region)}`,
    acrossLine: "Am nächsten jenseits der Bundesstaatsgrenze",
    elsewhere: "Am nächsten anderswo",
  },

  hours: {
    title: "Ladenzeiten",
    local: (zone: string) => `Zeitangaben: ${zone}`,
    today: (hours: string, week: string) => ` · ${hours} (heute) · ${week}`,
    directions: "Wegbeschreibung",
    applePage: "Eintrag bei Apple",
    liveMap: "Im Atlas ansehen",
    storePage: "Store-Eintrag",
    closed: "zu",
    everyDay: (hours: string) => `Jeden Tag ${hours}`,
    openNow: (closes: string) => `Türen offen · bis ${closes}`,
    opensAt: (opens: string) => `Türen öffnen um ${opens}`,
    closedToday: (next: string | null) => (next ? `Heute zu · wieder offen ${next}` : "Heute zu"),
    closedNow: (next: string | null) => (next ? `Gerade zu · wieder offen ${next}` : "Gerade zu"),
    nextOpen: (day: string | null, time: string) => `${day ?? "morgen"} ${time}`,
    span: (opens: string, closes: string) => `${opens} bis ${closes}`,
  },

  liveStats: {
    inStock: "Im Regal",
    storesWith: "Listende Stores",
    lastCheck: "Letzter Blick",
    none: "—",
  },

  board: {
    summary: (k: number, stores: number, short: string) => `${short} im Regal bei ${n(k)} von ${n(stores)} Stores`,
    lastCheck: (ago: ReactNode) => <>Letzter Blick {ago}</>,
    firstSweep: "Die Beobachtung beginnt gerade.",
    noneListed: (model: string, storage: string | null, color: string | null) => `Kein Store hat das ${model}${storage ? ` ${storage}` : ""}${color ? ` in ${color}` : ""} momentan im Regal.`,
    more: (k: number) => `+${n(k)} weitere`,
    seen: (ago: ReactNode) => <>Verzeichnet {ago}</>,
    loading: "Regale werden gelesen",
  },

  /** DuoLedger: das Beobachtungsbuch am Anfang der Regions-, Stadt-, Store-, Länder- und Duo-Modellseiten. `place` kommt ohne Präposition. */
  duoLedger: {
    kicker: (place: string) => `Beobachtungsbuch · iPhone Duo · ${place}`,
    headNone: (o) => `In keinem der ${n(o.n)} Apple Stores ${inOrt(o.place)} ist ein iPhone Duo zur Abholung gelistet.`,
    headNoneOne: (place: string) => `${place} listet derzeit keine iPhone-Duo-Variante zur Abholung.`,
    headSome: (o) => <>Zur Abholung gelistet in {n(o.k)} von {n(o.n)} Apple Stores {inOrt(o.place)}: {o.list}.</>,
    headSomeOne: (o) => <>{o.place} listet {n(o.k)} von {n(o.total)} iPhone-Duo-Varianten zur Abholung: {o.list}.</>,
    storeItem: (store: ReactNode, configs: number) => <>{store} ({plural(configs, "Variante", "Varianten")})</>,
    observed: (stamp: string) => `Beobachtet ${stamp}.`,
    lastReturn: (o) => <>Letzte bestätigte Rückkehr: <b className="text-ink">{o.config}</b>{o.store != null && <> bei {o.store}</>}, {o.when}{o.lasted ? <>, {o.lasted}</> : null}.</>,
    noReturnYet: (place: string, since: string) => `Seit Beginn der Aufzeichnung am ${since} keine bestätigte iPhone-Duo-Rückkehr ${inOrt(place)}.`,
    others: (o) => (o.one ? `Zum Vergleich: Dieser Store zeigt ${n(o.pro)} der ${n(o.configs)} Varianten des iPhone 18 Pro und ${n(o.max)} der ${n(o.configs)} des Pro Max.` : `Zum Vergleich: Das iPhone 18 Pro liegt in ${n(o.pro)} dieser Stores im Regal, das Pro Max in ${n(o.max)}.`),
    mReturns: (since: string) => `bestätigte Rückkehren seit ${since}`,
    mStores: "Stores mit mindestens einer Rückkehr",
    mDays: "erfasste Tage mit einer Rückkehr",
    mWindow: (pct: string) => `stärkste zwei Stunden · ${pct} der Aufzeichnung`,
    mPerDay: "Rückkehren pro erfasstem Tag",
    mMedian: "mittlere Listungsdauer, vom Erscheinen bis zum Verschwinden",
    mToday: "Rückkehren heute, bisher",
    secUnit: "s",
    minUnit: "Min.",
    note: (o) => (o.one
      ? `Seit ${o.since} hat ShelfSpring bei ${o.place} ${plural(o.n, "bestätigte iPhone-Duo-Rückkehr", "bestätigte iPhone-Duo-Rückkehren")} erfasst, an ${n(o.days)} von ${n(o.tracked)} erfassten Tagen. Die stärksten zwei Stunden waren ${o.range} (${o.pct} der Aufzeichnung; ${o.morning} fielen zwischen 8 und 12 Uhr), die stärkste einzelne Stunde ${o.busiest} mit ${n(o.busiestN)}.${o.median ? ` Die Hälfte der gemessenen Listungen war innerhalb von ${o.median} wieder verschwunden.` : ""}${o.config ? ` Am häufigsten kehrte ${o.config} zurück (${n(o.top)} von ${n(o.n)}).` : ""}`
      : `In den ${n(o.stores)} Apple Stores ${inOrt(o.place)} hat ShelfSpring seit ${o.since} ${plural(o.n, "bestätigte iPhone-Duo-Rückkehr", "bestätigte iPhone-Duo-Rückkehren")} erfasst; ${n(o.k)} der Stores hatten mindestens eine. Die stärksten zwei Stunden waren ${o.range} ${o.zone} (${o.pct} der Aufzeichnung; ${o.morning} fielen zwischen 8 und 12 Uhr), die stärkste einzelne Stunde ${o.busiest} mit ${n(o.busiestN)}.${o.median ? ` Die Hälfte der gemessenen Listungen war innerhalb von ${o.median} wieder verschwunden.` : ""}${o.config ? ` Am häufigsten kehrte ${o.config} zurück (${n(o.top)} von ${n(o.n)}).` : ""}`),
    noteFew: (o) => `${plural(o.n, "bestätigte iPhone-Duo-Rückkehr", "bestätigte iPhone-Duo-Rückkehren")} ${o.one ? `bei ${o.place}` : `in den ${n(o.stores)} Apple Stores ${inOrt(o.place)}`} seit ${o.since}, an ${plural(o.days, "Tag", "Tagen")} – unter der Schwelle von ${n(o.min)} Rückkehren an ${n(o.minDays)} Tagen, ab der ShelfSpring eine übliche Stunde nennt.${o.median ? ` Die Hälfte der gemessenen Listungen war innerhalb von ${o.median} wieder verschwunden.` : ""} Die einzelnen Rückkehren stehen im Buch darunter.`,
    hourByHour: "Die ganze Aufzeichnung nach Stunden öffnen →",
    ledger: (k: number) => (k === 1 ? "Die letzte erfasste Rückkehr" : `Die letzten ${n(k)} erfassten Rückkehren`),
    col: { observed: "Gesehen (Store-Uhr)", config: "Variante", store: "Store", listed: "Regalzeit" },
    secs: (k: number) => `${n(k)} s`,
    mins: (k: number) => `${n(k)} Min.`,
    listedRange: (low: string, high: string) => `${low}–${high} im Regal`,
    listedAbout: (x: string) => `rund ${x} im Regal`,
    stillListed: (x: string) => `bisher ${x} im Regal`,
    method: (o) => `Aufzeichnung seit ${o.since} · ${o.note} · eine Rückkehr zählt erst, wenn zwei aufeinanderfolgende Beobachtungen übereinstimmen; das erste Auftauchen einer Variante zählt nie.`,
    delivered: (o) => (o.one
      ? `In den letzten ${n(o.days)} Tagen hat ShelfSpring ${plural(o.sent, "Benachrichtigung", "Benachrichtigungen")} an Mitglieder für Rückkehren bei ${o.place} zugestellt.`
      : `In den letzten ${n(o.days)} Tagen hat ShelfSpring ${plural(o.sent, "Benachrichtigung", "Benachrichtigungen")} an Mitglieder für Rückkehren in ${n(o.stores)} der ${n(o.total)} Apple Stores ${inOrt(o.place)} zugestellt.`),
    watch: (place: string) => `Eine Variante ${inOrt(place)} beobachten →`,
    watchOne: "Eine Variante in diesem Store beobachten →",
    unknown: "Die Aufzeichnung ließ sich für diese Anfrage nicht lesen; die Live-Listung oben ist nicht betroffen.",
    zone: () => "Store-Zeit",
    allModels: (o) => `Alle Modelle zusammen: ${plural(o.n, "erfasste Rückkehr", "erfasste Rückkehren")} in ${n(o.days)} Tagen${o.peak ? `; die stärkste Stunde war ${o.peak}` : ""}.`,
  },
};
