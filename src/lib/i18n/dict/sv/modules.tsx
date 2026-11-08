/**
 * Swedish strings: modules — the restock, store and stock modules. `label` arrives with its preposition
 * ("i Sverige", "på Apple Emporia", "här"); numbers arrive raw and are written Swedish style (12 345).
 * Check intervals are only ever 15 seconds (every store) and 5 seconds (stores with alerts).
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { n, pl } from "./util";

export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `Ingen påfyllning och inget slutsålt har loggats ${label} de senaste ${days} dagarna – diagrammet fylls i från den första.`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `${pl(restocks, "påfyllning", "påfyllningar")} och ${n(soldouts)} slutsålda ${label} de senaste ${days} dagarna, på ${pl(activeDays, "dag", "olika dagar")}.`,
    busiest: (day: string, restocks: number) => <> Flest kom <b className="text-ink">{day}</b>: {n(restocks)}.</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day}: ${pl(restocks, "påfyllning", "påfyllningar")}, ${n(soldouts)} slutsålda`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day}: ${pl(restocks, "påfyllning", "påfyllningar")} · ${n(soldouts)} slutsålda`,
    legendRestocks: "påfyllningar",
    legendSoldouts: "slutsålda",
  },

  last24: {
    title: (label: string) => `Påfyllningar av iPhone Duo ${label} de senaste 24 timmarna`,
    asOf: (when: string) => `per ${when}`,
    localTime: (when: string) => `${when} lokal tid`,
    anAppleStore: "en Apple Store",
    unknown: "Antalet för de senaste 24 timmarna gick inte att läsa just nu; lagret live och påfyllningsloggen på sidan påverkas inte.",
    none: (label: string, asOf: string) => <><b className="text-ink">Ingen påfyllning av iPhone Duo {label} de senaste 24 timmarna</b> (per {asOf}).</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <>De senaste 24 timmarna har iPhone Duo fyllts på <b className="text-ink">{pl(o.restocks, "gång", "gånger")} {o.one ? o.label : `i ${o.withStores} av ${o.allStores} Apple Store-butiker ${o.label}`}</b>; senast: <b className="text-ink">{o.config}</b>{o.store != null && <> på {o.store}</>}, {o.when} lokal tid.</>
    ),
    tileRestocks: "bekräftade påfyllningar · 24 tim",
    tileConfigsBack: "konfigurationer som kom tillbaka",
    tileStores: (configs: number, allConfigs: number) => `butiker med påfyllning${configs ? ` · ${configs} av ${allConfigs} konfigurationer` : ""}`,
    tileLatest: (config: string, store: string | null) => <>senast · {config}{store != null && <> · {store}</>}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>senast före det · {config}{store != null && <> · {store}</>} · {day}</>,
    tileNoEarlier: "ingen tidigare påfyllning registrerad",
    caption: (label: string, asOf: string) => `Bekräftade påfyllningar av varje iPhone Duo-konfiguration ${label}, senaste 24 timmarna, per ${asOf}`,
    thConfig: "Konfiguration",
    thRestocks: "Påfyllningar",
    thStores: "Butiker",
    thLast: "Senaste påfyllning (lokal tid)",
    thNow: "I lager nu",
    ofStores: (k: number, total: number) => `${k} av ${total}`,
    noneIn24: "ingen på 24 tim",
    yes: "ja",
    no: "nej",
    countedTitle: "Så räknas påfyllningar",
    counted: "En händelse är en bekräftad ändring från slut till tillgänglig för en butik och konfiguration. Upprepade återkomster räknas separat, inte som antal telefoner. Listan visar den senaste kontrollen. Historiken visar var lagret återkom, utan att förutsäga nästa leverans.",
    alert: (label: string | null) => `Ställ in lageraviseringar på telefonen${label ? ` · ${label}` : ""}`,
  },

  clock: {
    none: (label: string, days: number) => `Inga påfyllningar registrerade ${label} de senaste ${days} dagarna ännu.`,
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `${pl(total, "påfyllning", "påfyllningar")} ${label} de senaste ${days} dagarna${dates != null ? ` (på ${pl(dates, "dag", "dagar")})` : ""} – för få för att se ett mönster ännu.`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>{pl(total, "påfyllning", "påfyllningar")} {label} de senaste {days} dagarna. De flesta kommer runt <b className="text-ink">{hour}</b> lokal tid{day ? <>, och flest blir det på <b className="text-ink">{day}ar</b></> : null}.</>
    ),
    byHour: (zone: string) => `Per timme · ${zone}`,
    byWeekday: "Per veckodag",
    barReported: (k: number) => ` (+${k} rapporterade av andra bevakningstjänster)`,
    barReportedTitle: (bar: string, k: number) => `${bar}: ${k} rapporterade av andra bevakningstjänster`,
    legendOurs: "Registrerade lageråterkomster",
  },

  feed: {
    empty: "Inga påfyllningar registrerade ännu.",
    available: "Tillgänglig",
    soldOut: "Slutsåld",
    soldOutAt: (time: ReactNode) => <>slutsåld {time}</>,
    since: (time: ReactNode) => <>sedan {time}</>,
    restockedAt: (time: ReactNode) => <>påfylld {time}</>,
    mapAria: (store: string) => `Visa ${store} på kartan`,
    map: "Karta",
    buyAria: (model: string, config: string) => `Köp ${model} ${config} på apple.com`,
    buy: "Köp på apple.com",
  },

  byConfig: {
    empty: (label: string, days: number) => `Ingen konfiguration har fyllts på ${label} de senaste ${days} dagarna, så det finns ingen topplista ännu.`,
    intro: (label: string, days: number) => `Konfigurationerna som kom tillbaka ${label} de senaste ${days} dagarna, de vanligaste först.`,
    times: (k: number) => `${k}×`,
    alert: "Bevaka",
  },

  sellout: {
    typical: (label: string, band: string) => `En typisk påfyllning av iPhone Duo ${label} var slutsåld efter ungefär ${band}.`,
    half: (label: string, duration: string) => `Hälften av påfyllningarna ${label} var slutsålda inom ${duration}.`,
    none: (label: string, days: number) => `Ingen påfyllning ${label} har tagit slut de senaste ${days} dagarna ännu.`,
    whatDuo: "iPhone Duo",
    whatAll: "alla iPhone",
    tileHalf: (what: string) => <>hälften slut inom · {what}</>,
    tileWithin30: "slut inom 30 s",
    tileWithin60: "slut inom 1 min",
    tileFastest: (k: number, days: number) => <>snabbast · {pl(k, "slutsåld påfyllning", "slutsålda påfyllningar")}, {days} d</>,
    caption: (days: number) => `Per iPhone, senaste ${days} dagarna`,
    thIphone: "iPhone",
    thSoldOut: "Slutsålda",
    thHalf: "Hälften slut inom",
    thWithin30: "≤ 30 s",
    thWithin60: "≤ 1 min",
    thFastest: "Snabbast",
    each: "Påfyllning för påfyllning",
    barNote: (full: string) => `stapel = sekunder i lager · full vid ${full}`,
    stillListed: (duration: string) => `fortfarande i lager · ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "Så mäts det",
    measured: (_estimated: boolean) => { void _estimated; return "Tiden avgränsas av den sista observationen med lager och den första utan. ≈ markerar ett uppskattat intervall. Kortare tillgänglighet kan missas mellan kontroller; tiden garanterar ingen möjlighet att slutföra köpet."; },
  },

  configTable: {
    title: "Alla konfigurationer i den här butiken",
    titleAt: (store: string) => `Alla konfigurationer på ${store}`,
    lookupOff: (hasRows: boolean) => `Apple erbjuder just nu ingen koll av hämtning i butik för den här butiken${hasRows ? " (de senaste svaren den gav visas nedan)" : ""}`,
    tracked: (k: number) => `${k} konfigurationer bevakas`,
    firstSweep: "Första kontrollen pågår – status visas inom en minut",
    inStock: (k: number, total: number) => `${k} av ${total} i lager`,
    available: "Tillgänglig",
    unavailable: "Inte tillgänglig",
    noLookup: "ingen koll av hämtning",
    notChecked: "inte kollad än",
    since: (ago: ReactNode) => <>sedan {ago}</>,
    lastAvailable: (ago: ReactNode) => <>senast tillgänglig {ago}</>,
    neverHere: "aldrig sedd i lager här",
    buy: "Köp",
    alertAria: (model: string, config: string, store: string) => `Bevaka ${model} ${config} på ${store}`,
    alert: "Bevaka →",
  },

  matrix: {
    store: "Butik",
    checked: "Kollad",
    cellTitle: (model: string, k: number, total: number) => `${model}: ${k} av ${total} konfigurationer tillgängliga`,
  },

  nearby: {
    duo: (short: string, k: number) => `${short} · ${k}`,
    noDuo: (short: string) => `ingen ${short}`,
  },

  stockByModel: {
    availableNow: (k: number, total: number) => `${k} av ${total} konfigurationer tillgängliga nu`,
    noneNow: (total: number) => `ingen av ${total} konfigurationer just nu`,
    lookupOff: "Apple erbjuder just nu ingen koll av hämtning här",
    notChecked: "inte kollad än",
    more: (k: number) => `+${k}`,
    checked: (ago: ReactNode) => <>kollad {ago}</>,
    alert: "Bevaka →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>{ago} · Regelbundna lageruppdateringar</>,
    map: "Visa på kartan",
    alert: "Bevaka här",
    alsoIn: (region: string) => `Också i ${region}`,
    acrossLine: "Närmaste butikerna på andra sidan delstatsgränsen",
    elsewhere: "Närmaste butikerna på andra håll",
  },

  hours: {
    title: "Öppettider",
    local: (zone: string) => `Lokal tid · ${zone}`,
    today: (hours: string, week: string) => ` · idag ${hours} · ${week}`,
    directions: "Vägbeskrivning",
    applePage: "Butikssidan på apple.com",
    liveMap: "Livekarta",
    storePage: "Butikssida",
    closed: "Stängt",
    everyDay: (hours: string) => `Alla dagar ${hours}`,
    openNow: (closes: string) => `Öppet nu · stänger kl. ${closes}`,
    opensAt: (opens: string) => `Öppnar kl. ${opens}`,
    closedToday: (next: string | null) => (next ? `Stängt idag · öppnar ${next}` : "Stängt idag"),
    closedNow: (next: string | null) => (next ? `Stängt nu · öppnar ${next}` : "Stängt nu"),
    nextOpen: (day: string | null, time: string) => `${day ?? "i morgon"} kl. ${time}`,
  },

  liveStats: {
    inStock: "I lager nu",
    storesWith: "Butiker med lager",
    lastCheck: "Senaste kontroll",
    none: "—",
  },

  board: {
    summary: (k: number, stores: number, short: string) => `${k} av ${stores} butiker har ${short} i lager`,
    lastCheck: (ago: ReactNode) => <>Senaste kontroll {ago}</>,
    firstSweep: "Första kontrollen pågår.",
    noneListed: (model: string, storage: string | null, color: string | null) => `Ingen butik har ${model}${storage ? ` ${storage}` : ""}${color ? ` i ${color}` : ""} just nu.`,
    more: (k: number) => `+${k}`,
    seen: (ago: ReactNode) => <>Sedd {ago}</>,
    loading: "Laddar lager",
  },

  /** DuoLedger: observationsregistret som region-, stads-, butiks-, lands- och Duo-modellsidorna öppnar med. `place` kommer utan preposition. */
  duoLedger: {
    kicker: (place: string) => `Observationsregister · iPhone Duo · ${place}`,
    headNone: (o) => `Ingen av de ${n(o.n)} Apple Store-butikerna i ${o.place} listar en iPhone Duo för hämtning.`,
    headNoneOne: (place: string) => `${place} listar ingen iPhone Duo-variant för hämtning.`,
    headSome: (o) => <>Listad för hämtning i {n(o.k)} av de {n(o.n)} Apple Store-butikerna i {o.place}: {o.list}.</>,
    headSomeOne: (o) => <>{o.place} listar {n(o.k)} av {n(o.total)} iPhone Duo-varianter för hämtning: {o.list}.</>,
    storeItem: (store: ReactNode, configs: number) => <>{store} ({pl(configs, "variant", "varianter")})</>,
    observed: (stamp: string) => `Observerat ${stamp}.`,
    lastReturn: (o) => <>Senaste bekräftade påfyllning: <b className="text-ink">{o.config}</b>{o.store != null && <> hos {o.store}</>}, {o.when}{o.lasted ? <>, {o.lasted}</> : null}.</>,
    noReturnYet: (place: string, since: string) => `Ingen bekräftad påfyllning av iPhone Duo i ${place} sedan registret öppnade ${since}.`,
    others: (o) => (o.one ? `iPhone 18 Pro: ${n(o.pro)} av ${n(o.configs)} varianter listade här; 18 Pro Max: ${n(o.max)} av ${n(o.configs)}.` : `iPhone 18 Pro: listad i ${n(o.pro)} av dessa butiker; 18 Pro Max: i ${n(o.max)}.`),
    mReturns: (since: string) => `bekräftade påfyllningar sedan ${since}`,
    mStores: "butiker med minst en påfyllning",
    mDays: "följda dagar med en påfyllning",
    mWindow: (pct: string) => `mest aktiva två timmarna · ${pct} av registret`,
    mPerDay: "påfyllningar per följd dag",
    mMedian: "medianlistning, från att den dyker upp till att den försvinner",
    mToday: "påfyllningar i dag, hittills",
    secUnit: "s",
    minUnit: "min",
    note: (o) => (o.one
      ? `Sedan ${o.since} har ShelfSpring registrerat ${pl(o.n, "bekräftad påfyllning", "bekräftade påfyllningar")} av iPhone Duo hos ${o.place}, på ${n(o.days)} av ${n(o.tracked)} följda dagar. De två mest aktiva timmarna var ${o.range} (${o.pct} av registret; ${o.morning} föll mellan 8 och 12), den mest aktiva enskilda timmen ${o.busiest} med ${n(o.busiestN)}.${o.median ? ` Hälften av de mätta listningarna var borta inom ${o.median}.` : ""}${o.config ? ` ${o.config} kom tillbaka oftast (${n(o.top)} av ${n(o.n)}).` : ""}`
      : `I de ${n(o.stores)} Apple Store-butikerna i ${o.place} har ShelfSpring registrerat ${pl(o.n, "bekräftad påfyllning", "bekräftade påfyllningar")} av iPhone Duo sedan ${o.since}; ${n(o.k)} butiker har haft minst en. De två mest aktiva timmarna var ${o.range} (${o.zone}; ${o.pct} av registret; ${o.morning} föll mellan 8 och 12), den mest aktiva enskilda timmen ${o.busiest} med ${n(o.busiestN)}.${o.median ? ` Hälften av de mätta listningarna var borta inom ${o.median}.` : ""}${o.config ? ` ${o.config} kom tillbaka oftast (${n(o.top)} av ${n(o.n)}).` : ""}`),
    noteFew: (o) => `${pl(o.n, "bekräftad påfyllning", "bekräftade påfyllningar")} av iPhone Duo ${o.one ? `hos ${o.place}` : `i de ${n(o.stores)} Apple Store-butikerna i ${o.place}`} sedan ${o.since}, på ${pl(o.days, "dag", "dagar")} – under tröskeln på ${n(o.min)} påfyllningar under ${n(o.minDays)} dagar som ShelfSpring kräver innan en vanlig timme beskrivs.${o.median ? ` Hälften av de mätta listningarna var borta inom ${o.median}.` : ""} De enskilda påfyllningarna står i registret nedan.`,
    hourByHour: "Öppna registret timme för timme →",
    ledger: (k: number) => (k === 1 ? "Den senaste registrerade påfyllningen" : `De ${n(k)} senaste registrerade påfyllningarna`),
    col: { observed: "Observerad (butikens tid)", config: "Variant", store: "Butik", listed: "Listad i" },
    secs: (k: number) => `${n(k)} s`,
    mins: (k: number) => `${n(k)} min`,
    listedRange: (low: string, high: string) => `listad ${low}–${high}`,
    listedAbout: (x: string) => `listad ungefär ${x}`,
    stillListed: (x: string) => `fortfarande listad (${x})`,
    method: (o) => `Register sedan ${o.since} · ${o.note} · en påfyllning räknas först när två observationer i rad stämmer överens; en variants första uppdykande räknas aldrig.`,
    delivered: (o) => (o.one
      ? `De senaste ${n(o.days)} dagarna levererade ShelfSpring ${pl(o.sent, "avisering", "aviseringar")} till medlemmar för påfyllningar hos ${o.place}.`
      : `De senaste ${n(o.days)} dagarna levererade ShelfSpring ${pl(o.sent, "avisering", "aviseringar")} till medlemmar för påfyllningar i ${n(o.stores)} av de ${n(o.total)} Apple Store-butikerna i ${o.place}.`),
    watch: (place: string) => `Bevaka en variant i ${place} →`,
    watchOne: "Bevaka en variant i den här butiken →",
    unknown: "Observationsregistret kunde inte läsas för den här begäran; livelistningen ovan påverkas inte.",
    zone: () => "lokal tid",
    allModels: (o) => `Alla modeller tillsammans: ${pl(o.n, "registrerad påfyllning", "registrerade påfyllningar")} på ${n(o.days)} dagar${o.peak ? `; den mest aktiva timmen var ${o.peak}` : ""}.`,
  },
};
