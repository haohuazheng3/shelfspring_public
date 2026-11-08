/**
 * German strings: modules — restock, store and stock modules. `label` is a place phrase the page builds
 * ("in Bayern", "bei Apple Rosenstraße", "hier"); numbers arrive raw and are formatted here.
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { inOrt, n, plural } from "./util";

const restocks = (x: number) => plural(x, "Restock", "Restocks");
const mal = (x: number) => (x === 1 ? "einmal" : `${n(x)}-mal`);

export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `Kein Restock oder Ausverkauf ${label} in den letzten ${days} Tagen – das Diagramm füllt sich ab dem ersten.`,
    summary: (r: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `${restocks(r)} und ${plural(soldouts, "Ausverkauf", "Ausverkäufe")} ${label} in den letzten ${days} Tagen, an ${activeDays === 1 ? "einem Tag" : `${n(activeDays)} verschiedenen Tagen`}.`,
    busiest: (day: string, r: number) => <> Der stärkste Tag war der <b className="text-ink">{day}</b> mit {n(r)}.</>,
    barAria: (day: string, r: number, soldouts: number) => `${day}: ${restocks(r)}, ${plural(soldouts, "Ausverkauf", "Ausverkäufe")}`,
    barTitle: (day: string, r: number, soldouts: number) => `${day}: ${restocks(r)} · ${plural(soldouts, "Ausverkauf", "Ausverkäufe")}`,
    legendRestocks: "Restocks",
    legendSoldouts: "Ausverkäufe",
  },

  last24: {
    title: (label: string) => `iPhone-Duo-Restocks ${label} in den letzten 24 Stunden`,
    asOf: (when: string) => `Stand ${when}`,
    localTime: (when: string) => `${when} Ortszeit`,
    anAppleStore: "ein Apple Store",
    unknown: "Die Zahl der letzten 24 Stunden ließ sich gerade nicht lesen; Live-Verfügbarkeit und Restock-Protokoll auf dieser Seite sind nicht betroffen.",
    none: (label: string, asOf: string) => <><b className="text-ink">Kein iPhone-Duo-Restock {label} in den letzten 24 Stunden</b> (Stand {asOf}).</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <>In den letzten 24 Stunden war das iPhone Duo <b className="text-ink">{mal(o.restocks)} {o.one ? o.label : `in ${n(o.withStores)} von ${n(o.allStores)} Apple ${o.allStores === 1 ? "Store" : "Stores"} ${o.label}`} wieder da</b>; zuletzt: <b className="text-ink">{o.config}</b>{o.store != null && <> bei {o.store}</>}, {o.when} Ortszeit.</>
    ),
    tileRestocks: "bestätigte Restocks · 24 Std.",
    tileConfigsBack: "Konfigurationen wieder da",
    tileStores: (configs: number, allConfigs: number) => `Stores mit Restock${configs ? ` · ${configs} von ${allConfigs} Konfigurationen` : ""}`,
    tileLatest: (config: string, store: string | null) => <>zuletzt · {config}{store != null && <> · {store}</>}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>davor · {config}{store != null && <> · {store}</>} · {day}</>,
    tileNoEarlier: "kein früherer Restock erfasst",
    caption: (label: string, asOf: string) => `Bestätigte Restocks je iPhone-Duo-Konfiguration ${label}, letzte 24 Stunden, Stand ${asOf}`,
    thConfig: "Konfiguration",
    thRestocks: "Restocks",
    thStores: "Stores",
    thLast: "Letzter Restock (Ortszeit)",
    thNow: "Jetzt vorrätig",
    ofStores: (k: number, total: number) => `${n(k)} von ${n(total)}`,
    noneIn24: "keiner in 24 Std.",
    yes: "ja",
    no: "nein",
    countedTitle: "So zählen wir Restocks",
    counted: "Ein Ereignis ist der bestätigte Wechsel einer Kombination aus Store und Konfiguration von nicht verfügbar zu verfügbar. Wiederholungen zählen einzeln, nicht als Gerätezahl. Die Liste zeigt den Stand der letzten Prüfung. Der Verlauf zeigt, wo Angebote wieder erschienen sind; er sagt keine nächste Lieferung voraus.",
    alert: (label: string | null) => `Bestandsalarme auf dem Handy einrichten${label ? ` · ${label}` : ""}`,
  },

  clock: {
    none: (label: string, days: number) => `Noch keine Restocks ${label} in den letzten ${days} Tagen.`,
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `${restocks(total)} ${label} in den letzten ${days} Tagen${dates != null ? ` (an ${dates === 1 ? "einem Tag" : `${n(dates)} Tagen`})` : ""} – noch zu wenige für ein Muster.`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>{restocks(total)} {label} in den letzten {days} Tagen. Die meisten kommen gegen <b className="text-ink">{hour}</b> Ortszeit{day ? <>, der stärkste Wochentag ist der <b className="text-ink">{day}</b></> : null}.</>
    ),
    byHour: (zone: string) => `Nach Uhrzeit · ${zone}`,
    byWeekday: "Nach Wochentag",
    barReported: (k: number) => ` (+${n(k)} von anderen Trackern gemeldet)`,
    barReportedTitle: (bar: string, k: number) => `${bar}: ${n(k)} von anderen Trackern gemeldet`,
    legendOurs: "Erfasste Rückkehr in den Bestand",
  },

  feed: {
    empty: "Noch keine Restocks erfasst.",
    available: "Verfügbar",
    soldOut: "Ausverkauft",
    soldOutAt: (time: ReactNode) => <>ausverkauft {time}</>,
    since: (time: ReactNode) => <>aufgetaucht {time}</>,
    restockedAt: (time: ReactNode) => <>wieder da {time}</>,
    mapAria: (store: string) => `${store} auf der Karte zeigen`,
    map: "Karte",
    buyAria: (model: string, config: string) => `${model} ${config} auf apple.com kaufen`,
    buy: "Auf apple.com kaufen",
  },

  byConfig: {
    empty: (label: string, days: number) => `Keine Konfiguration war ${label} in den letzten ${days} Tagen wieder vorrätig – noch keine Rangliste.`,
    intro: (label: string, days: number) => `Welche Konfigurationen ${label} in den letzten ${days} Tagen wieder vorrätig waren, die häufigsten zuerst.`,
    times: (k: number) => `${n(k)}×`,
    alert: "Alarm stellen",
  },

  sellout: {
    typical: (label: string, band: string) => `Ein typischer iPhone-Duo-Restock ${label} war in etwa ${band} ausverkauft.`,
    half: (label: string, duration: string) => `Die Hälfte der Restocks ${label} war binnen ${duration} ausverkauft.`,
    none: (label: string, days: number) => `In den letzten ${days} Tagen war noch kein Restock ${label} ausverkauft.`,
    whatDuo: "iPhone Duo",
    whatAll: "alle iPhones",
    tileHalf: (what: string) => <>Hälfte weg binnen · {what}</>,
    tileWithin30: "weg binnen 30 Sek.",
    tileWithin60: "weg binnen 1 Min.",
    tileFastest: (k: number, days: number) => <>am schnellsten · {n(k)} ausverkaufte Restocks, {days} Tg.</>,
    caption: (days: number) => `Nach iPhone, letzte ${days} Tage`,
    thIphone: "iPhone",
    thSoldOut: "Ausverkauft",
    thHalf: "Hälfte weg binnen",
    thWithin30: "≤ 30 Sek.",
    thWithin60: "≤ 1 Min.",
    thFastest: "Am schnellsten",
    each: "Restock für Restock",
    barNote: (full: string) => `Balken = Sekunden gelistet · voll bei ${full}`,
    stillListed: (duration: string) => `noch gelistet · ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "So wird gemessen",
    measured: (_estimated: boolean) => { void _estimated; return "Die Angebotsdauer liegt zwischen der letzten Beobachtung mit Bestand und der ersten ohne Bestand. ≈ kennzeichnet ein geschätztes Intervall. Kürzere Angebote können zwischen Prüfungen übersehen werden; die Dauer garantiert kein Zeitfenster für den Kauf."; },
  },

  configTable: {
    title: "Jede Konfiguration in diesem Store",
    titleAt: (store: string) => `Jede Konfiguration bei ${store}`,
    lookupOff: (hasRows: boolean) => `Apple bietet für diesen Store gerade keine Abholabfrage an${hasRows ? " (die letzten Antworten stehen unten)" : ""}`,
    tracked: (k: number) => `${n(k)} Konfigurationen erfasst`,
    firstSweep: "Erste Prüfrunde läuft – der Status erscheint innerhalb einer Minute",
    inStock: (k: number, total: number) => `${n(k)} von ${n(total)} vorrätig`,
    available: "Verfügbar",
    unavailable: "Nicht verfügbar",
    noLookup: "keine Abholabfrage",
    notChecked: "noch nicht geprüft",
    since: (ago: ReactNode) => <>aufgetaucht {ago}</>,
    lastAvailable: (ago: ReactNode) => <>zuletzt verfügbar {ago}</>,
    neverHere: "hier noch nie vorrätig gesehen",
    buy: "Kaufen",
    alertAria: (model: string, config: string, store: string) => `Alarm, sobald das ${model} ${config} bei ${store} verfügbar ist`,
    alert: "Alarm stellen →",
  },

  matrix: {
    store: "Store",
    checked: "Geprüft",
    cellTitle: (model: string, k: number, total: number) => `${model}: ${n(k)} von ${n(total)} Konfigurationen verfügbar`,
  },

  nearby: {
    duo: (short: string, k: number) => `${short} · ${n(k)}`,
    noDuo: (short: string) => `kein ${short}`,
  },

  stockByModel: {
    availableNow: (k: number, total: number) => `${n(k)} von ${n(total)} Konfigurationen jetzt verfügbar`,
    noneNow: (total: number) => `gerade keine der ${n(total)} Konfigurationen`,
    lookupOff: "Apple bietet hier gerade keine Abholabfrage an",
    notChecked: "noch nicht geprüft",
    more: (k: number) => `+${n(k)}`,
    checked: (ago: ReactNode) => <>geprüft {ago}</>,
    alert: "Alarm stellen →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>{ago} · Regelmäßige Bestandsaktualisierungen</>,
    map: "Auf der Karte zeigen",
    alert: "Hier Alarm stellen",
    alsoIn: (region: string) => `Außerdem ${inOrt(region)}`,
    acrossLine: "Nächste Stores im Nachbar-Bundesstaat",
    elsewhere: "Nächste Stores anderswo",
  },

  hours: {
    title: "Öffnungszeiten",
    local: (zone: string) => `Ortszeit · ${zone}`,
    today: (hours: string, week: string) => ` · heute ${hours} · ${week}`,
    directions: "Route",
    applePage: "Store-Seite auf apple.com",
    liveMap: "Live-Karte",
    storePage: "Store-Seite",
    closed: "Geschlossen",
    everyDay: (hours: string) => `Täglich ${hours}`,
    openNow: (closes: string) => `Jetzt geöffnet · schließt um ${closes}`,
    opensAt: (opens: string) => `Öffnet um ${opens}`,
    closedToday: (next: string | null) => (next ? `Heute geschlossen · öffnet ${next}` : "Heute geschlossen"),
    closedNow: (next: string | null) => (next ? `Jetzt geschlossen · öffnet ${next}` : "Jetzt geschlossen"),
    nextOpen: (day: string | null, time: string) => `${day ?? "morgen"} um ${time}`,
  },

  liveStats: {
    inStock: "Jetzt vorrätig",
    storesWith: "Stores m. Bestand",
    lastCheck: "Letzte Prüfung",
    none: "—",
  },

  board: {
    summary: (k: number, stores: number, short: string) => `${n(k)} von ${n(stores)} Stores haben das ${short} vorrätig`,
    lastCheck: (ago: ReactNode) => <>Letzte Prüfung {ago}</>,
    firstSweep: "Erste Prüfrunde läuft.",
    noneListed: (model: string, storage: string | null, color: string | null) => `Gerade hat kein Store das ${model}${storage ? ` ${storage}` : ""}${color ? ` in ${color}` : ""}.`,
    more: (k: number) => `+${n(k)}`,
    seen: (ago: ReactNode) => <>Gesehen {ago}</>,
    loading: "Verfügbarkeit wird geladen",
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
    others: (o) => (o.one ? `iPhone 18 Pro: ${n(o.pro)} von ${n(o.configs)} Varianten hier gelistet; 18 Pro Max: ${n(o.max)} von ${n(o.configs)}.` : `iPhone 18 Pro: in ${n(o.pro)} dieser Stores gelistet; 18 Pro Max: in ${n(o.max)}.`),
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
    hourByHour: "Aufzeichnung Stunde für Stunde öffnen →",
    ledger: (k: number) => (k === 1 ? "Die letzte erfasste Rückkehr" : `Die letzten ${n(k)} erfassten Rückkehren`),
    col: { observed: "Beobachtet (Store-Ortszeit)", config: "Variante", store: "Store", listed: "Gelistet für" },
    secs: (k: number) => `${n(k)} s`,
    mins: (k: number) => `${n(k)} Min.`,
    listedRange: (low: string, high: string) => `gelistet ${low}–${high}`,
    listedAbout: (x: string) => `gelistet etwa ${x}`,
    stillListed: (x: string) => `noch gelistet (${x})`,
    method: (o) => `Aufzeichnung seit ${o.since} · ${o.note} · eine Rückkehr zählt erst, wenn zwei aufeinanderfolgende Beobachtungen übereinstimmen; das erste Auftauchen einer Variante zählt nie.`,
    delivered: (o) => (o.one
      ? `In den letzten ${n(o.days)} Tagen hat ShelfSpring ${plural(o.sent, "Alarm", "Alarme")} an Mitglieder für Rückkehren bei ${o.place} zugestellt.`
      : `In den letzten ${n(o.days)} Tagen hat ShelfSpring ${plural(o.sent, "Alarm", "Alarme")} an Mitglieder für Rückkehren in ${n(o.stores)} der ${n(o.total)} Apple Stores ${inOrt(o.place)} zugestellt.`),
    watch: (place: string) => `Eine Variante ${inOrt(place)} beobachten →`,
    watchOne: "Eine Variante in diesem Store beobachten →",
    unknown: "Die Aufzeichnung ließ sich für diese Anfrage nicht lesen; die Live-Listung oben ist nicht betroffen.",
    zone: () => "Ortszeit",
    allModels: (o) => `Alle Modelle zusammen: ${plural(o.n, "erfasste Rückkehr", "erfasste Rückkehren")} in ${n(o.days)} Tagen${o.peak ? `; die stärkste Stunde war ${o.peak}` : ""}.`,
  },
};
