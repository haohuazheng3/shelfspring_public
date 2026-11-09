/**
 * Swedish strings: modules — the return, store and shelf modules. `label` arrives with its preposition
 * ("i Sverige", "hos Apple Emporia", "här"); numbers arrive raw and are written Swedish style (12 345).
 * Voice: an observation register. A restock is an "återkomst", a sell-out is the listing leaving the shelf
 * ("borta från hyllan"), a status is "på hyllan" / "borta från hyllan", a check is an "avläsning".
 * Check intervals are only ever 15 seconds (every store) and 5 seconds (stores with alerts).
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { n, pl } from "./util";

export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `Tomt blad ${label} de senaste ${days} dagarna: ingen återkomst och ingen listning som lämnat hyllan. Staplarna börjar vid första noteringen.`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `${n(activeDays)} av de senaste ${days} dagarna hade en återkomst ${label}: totalt ${pl(restocks, "loggad återkomst", "loggade återkomster")}, ${n(soldouts)} av hyllan igen.`,
    busiest: (day: string, restocks: number) => <> Toppdatum <b className="text-ink">{day}</b>, {n(restocks)} den dagen.</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day}: ${n(restocks)} tillbaka, ${n(soldouts)} borta från hyllan`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day} · ${n(restocks)} tillbaka · ${n(soldouts)} av hyllan`,
    legendRestocks: "återkomster",
    legendSoldouts: "av hyllan igen",
  },

  last24: {
    title: (label: string) => `Återkomster av iPhone Duo ${label} – senaste dygnet`,
    asOf: (when: string) => `ögonblicksbild · ${when}`,
    localTime: (when: string) => `${when} butikstid`,
    anAppleStore: "en Apple Store som inte längre finns i katalogen",
    unknown: "Dygnets summering kunde inte hämtas för den här visningen. Hyllstatusen och återkomstloggen längre ned gäller ändå.",
    none: (label: string, asOf: string) => <><b className="text-ink">Ett lugnt dygn {label}:</b> ingen återkomst av iPhone Duo noterad under perioden som slutar {asOf}.</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <>Senaste återkomst: <b className="text-ink">{o.config}</b>, {o.when} enligt butikens klocka{o.store != null && <>, noterad hos {o.store}</>}. <b className="text-ink">{pl(o.restocks, "återkomst", "återkomster")} under dygnet</b>{o.one ? null : <>, fördelade på {n(o.withStores)} av {n(o.allStores)} butiker {o.label}</>}.</>
    ),
    tileRestocks: "återkomster under dygnet",
    tileConfigsBack: "konfigurationer tillbaka på hyllan",
    tileStores: (configs: number, allConfigs: number) => `butiker med en återkomst${configs ? ` · ${configs}/${allConfigs} konfigurationer` : ""}`,
    tileLatest: (config: string, store: string | null) => <>senaste · {store != null && <>{store} · </>}{config}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>återkomsten innan, {day} · {store != null && <>{store} · </>}{config}</>,
    tileNoEarlier: "inget tidigare i registret",
    caption: (label: string, asOf: string) => `Återkomster per iPhone Duo-konfiguration ${label} under dygnet fram till ${asOf}`,
    thConfig: "Konfiguration",
    thRestocks: "Återkomster",
    thStores: "Butiker",
    thLast: "Senaste (butikens klocka)",
    thNow: "På hyllan nu",
    ofStores: (k: number, total: number) => `${k}/${total}`,
    noneIn24: "inget noterat",
    yes: "på hyllan",
    no: "borta",
    countedTitle: "Vad räknas som en återkomst?",
    counted: "En återkomst är en bekräftad övergång från ej tillgänglig till tillgänglig, för en butik och en konfiguration. Varje ny återkomst blir en egen rad – den säger inget om hur många telefoner som kom in. Hyllstatusen gäller läget vid senaste avläsningen; historiken visar var listningar dök upp igen men förutspår ingen kommande leverans.",
    alert: (label: string | null) => `Få återkomsterna som notis i telefonen${label ? ` · ${label}` : ""}`,
  },

  clock: {
    none: (label: string, days: number) => `Inga återkomster ${label} på ${days} dagar.`,
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `Bara ${pl(total, "loggad återkomst", "loggade återkomster")} ${label} på ${days} dagar${dates != null ? `, fördelade på ${pl(dates, "datum", "datum")}` : ""}: för tunt underlag för att peka ut en vanlig timme.`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>Vanligaste timmen för en återkomst {label}: <b className="text-ink">{hour}</b> enligt butikens klocka, utifrån {pl(total, "återkomst", "återkomster")} på {days} dagar{day ? <>; veckans starkaste dag är <b className="text-ink">{day}</b></> : null}.</>
    ),
    byHour: (zone: string) => `Timme på dygnet · ${zone}`,
    byWeekday: "Dag i veckan",
    barReported: (k: number) => ` (+${k} externa rapporter)`,
    barReportedTitle: (bar: string, k: number) => `${bar}: ${k} externa rapporter`,
    legendOurs: "Egna loggade återkomster",
  },

  feed: {
    empty: "Återkomstloggen är tom än så länge.",
    available: "På hyllan",
    soldOut: "Borta",
    soldOutAt: (time: ReactNode) => <>tömd · {time}</>,
    since: (time: ReactNode) => <>återkomst · {time}</>,
    restockedAt: (time: ReactNode) => <>återkomst · {time}</>,
    mapAria: (store: string) => `Hitta ${store} i atlasen`,
    map: "Hitta i atlasen",
    buyAria: (model: string, config: string) => `Beställ ${model} ${config} från apple.com`,
    buy: "Beställ via apple.com",
  },

  byConfig: {
    empty: (label: string, days: number) => `Inget kom tillbaka ${label} på ${days} dagar, så det finns inget att rangordna.`,
    intro: (label: string, days: number) => `Konfigurationer rangordnade efter antal återkomster ${label}, senaste ${days} dagarna.`,
    times: (k: number) => pl(k, "återkomst", "återkomster"),
    alert: "Följ",
  },

  sellout: {
    typical: (label: string, band: string) => `Medianen för hur länge en återkommen iPhone Duo låg på hyllan ${label}: runt ${band}.`,
    half: (label: string, duration: string) => `Hälften av de tidsatta återkomsterna ${label} hade lämnat hyllan inom ${duration}.`,
    none: (label: string, days: number) => `Ingen återkomst ${label} har lämnat hyllan de senaste ${days} dagarna.`,
    whatDuo: "iPhone Duo",
    whatAll: "alla modeller",
    tileHalf: (what: string) => <>median på hyllan · {what}</>,
    tileWithin30: "borta från hyllan på ≤ 30 s",
    tileWithin60: "borta från hyllan på ≤ 1 min",
    tileFastest: (k: number, days: number) => <>kortast av {pl(k, "tidsatt återkomst", "tidsatta återkomster")}, {days} d</>,
    caption: (days: number) => `Modell för modell, senaste ${days} dagarna`,
    thIphone: "Modell",
    thSoldOut: "tidsatta",
    thHalf: "median",
    thWithin30: "≤ 30 s:",
    thWithin60: "≤ 1 min:",
    thFastest: "kortast",
    each: "Återkomst för återkomst",
    barNote: (full: string) => `stapelns längd = tid på hyllan · ${full} fyller den`,
    stillListed: (duration: string) => `ligger kvar på hyllan · ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "Hur tiden på hyllan avgränsas",
    measured: (_estimated: boolean) => { void _estimated; return "Tiden ringas in mellan den sista avläsningen där konfigurationen fanns och den första där den saknades. Tecknet ≈ betyder att intervallet är uppskattat. En listning som är kortare än avståndet mellan två avläsningar kan passera obemärkt, och ingen tid här lovar att du hinner slutföra ett köp."; },
  },

  configTable: {
    title: "Hyllkoll per konfiguration",
    titleAt: (store: string) => `Hyllkoll per konfiguration · ${store}`,
    lookupOff: (hasRows: boolean) => `Apple har pausat hämtningsförfrågningar för den här butiken${hasRows ? "; raderna nedan är dess senaste svar" : ""}`,
    tracked: (k: number) => `${n(k)} konfigurationer under observation`,
    firstSweep: "Observationerna startar nu; de första statusarna kommer inom en minut",
    inStock: (k: number, total: number) => `på hyllan: ${k} av ${total} följda`,
    available: "På hyllan",
    unavailable: "Borta från hyllan",
    noLookup: "förfrågan pausad",
    notChecked: "väntar på första avläsningen",
    since: (ago: ReactNode) => <>dök upp {ago}</>,
    lastAvailable: (ago: ReactNode) => <>senast sedd {ago}</>,
    neverHere: "aldrig sedd här",
    buy: "Beställ",
    alertAria: (model: string, config: string, store: string) => `Följ ${model} ${config} på ${store}`,
    alert: "Följ →",
  },

  matrix: {
    store: "Plats",
    checked: "Senast avläst",
    cellTitle: (model: string, k: number, total: number) => `${model}: ${k} av ${total} konfigurationer på hyllan`,
  },

  nearby: {
    duo: (short: string, k: number) => `${short} på hyllan · ${k}`,
    noDuo: (short: string) => `${short} inte på hyllan`,
  },

  stockByModel: {
    availableNow: (k: number, total: number) => `${k}/${total} konfigurationer på hyllan`,
    noneNow: (total: number) => `0/${total} på hyllan`,
    lookupOff: "Apple har pausat hämtningsförfrågningar för butiken",
    notChecked: "väntar på första avläsningen",
    more: (k: number) => `+${k} till`,
    checked: (ago: ReactNode) => <>avläst {ago}</>,
    alert: "Följ →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>{ago} · Regelbundna lageruppdateringar</>,
    map: "Se i atlasen",
    alert: "Följ den här butiken",
    alsoIn: (region: string) => `Fler i ${region}`,
    acrossLine: "Närmast på andra sidan delstatsgränsen",
    elsewhere: "Närmast på annat håll",
  },

  hours: {
    title: "Butikens öppettider",
    local: (zone: string) => `Tiderna anges i ${zone}`,
    today: (hours: string, week: string) => ` · ${hours} i dag · ${week}`,
    directions: "Hitta hit",
    applePage: "Apples egen butiksbeskrivning",
    liveMap: "Se butiken i atlasen",
    storePage: "Butiksposten",
    closed: "stängt",
    everyDay: (hours: string) => `Dagligen ${hours}`,
    openNow: (closes: string) => `Dörrarna öppna · till ${closes}`,
    opensAt: (opens: string) => `Dörrarna öppnar ${opens}`,
    closedToday: (next: string | null) => (next ? `Stängt i dag · öppnar igen ${next}` : "Stängt i dag"),
    closedNow: (next: string | null) => (next ? `Stängt för stunden · öppnar igen ${next}` : "Stängt för stunden"),
    nextOpen: (day: string | null, time: string) => `${day ?? "i morgon"} ${time}`,
    span: (opens: string, closes: string) => `${opens} till ${closes}`,
  },

  liveStats: {
    inStock: "På hyllan",
    storesWith: "Butiker som listar",
    lastCheck: "Senaste avläsning",
    none: "—",
  },

  board: {
    summary: (k: number, stores: number, short: string) => `${short} på hyllan i ${k} av ${stores} butiker`,
    lastCheck: (ago: ReactNode) => <>Senaste avläsning {ago}</>,
    firstSweep: "Observationerna startar nu.",
    noneListed: (model: string, storage: string | null, color: string | null) => `Ingen butik har ${model}${storage ? ` ${storage}` : ""}${color ? ` i ${color}` : ""} på hyllan för tillfället.`,
    more: (k: number) => `+${k} till`,
    seen: (ago: ReactNode) => <>Noterad {ago}</>,
    loading: "Läser av hyllorna",
  },

  /** DuoLedger: observationsregistret som region-, stads-, butiks-, lands- och Duo-modellsidorna öppnar med. `place` kommer utan preposition. */
  duoLedger: {
    kicker: (place: string) => `Observationsregister · iPhone Duo · ${place}`,
    headNone: (o) => `Ingen iPhone Duo listad för hämtning i någon av de ${n(o.n)} butikerna i ${o.place}.`,
    headNoneOne: (place: string) => `${place} visar just nu ingen iPhone Duo-variant att hämta.`,
    headSome: (o) => <>Listad för hämtning i {n(o.k)} av {n(o.n)} butiker i {o.place}: {o.list}.</>,
    headSomeOne: (o) => <>{o.place} har {n(o.k)} av {n(o.total)} iPhone Duo-varianter framme för hämtning: {o.list}.</>,
    storeItem: (store: ReactNode, configs: number) => <>{store} ({pl(configs, "variant", "varianter")})</>,
    observed: (stamp: string) => `Observerat ${stamp}.`,
    lastReturn: (o) => <>Senaste bekräftade återkomst: <b className="text-ink">{o.config}</b>{o.store != null && <> hos {o.store}</>}, {o.when}{o.lasted ? <>, {o.lasted}</> : null}.</>,
    noReturnYet: (place: string, since: string) => `Ingen bekräftad återkomst av iPhone Duo i ${place} sedan registret öppnades ${since}.`,
    others: (o) => (o.one ? `Som jämförelse visar butiken ${n(o.pro)} av ${n(o.configs)} varianter av iPhone 18 Pro och ${n(o.max)} av ${n(o.configs)} av Pro Max.` : `Som jämförelse står iPhone 18 Pro på hyllan i ${n(o.pro)} av butikerna och Pro Max i ${n(o.max)}.`),
    mReturns: (since: string) => `bekräftade återkomster sedan ${since}`,
    mStores: "butiker med minst en återkomst",
    mDays: "följda dagar med en återkomst",
    mWindow: (pct: string) => `två mest aktiva timmarna · ${pct} av registret`,
    mPerDay: "återkomster per följd dag",
    mMedian: "median på hyllan, från att varianten dyker upp till att den är borta",
    mToday: "återkomster i dag, hittills",
    secUnit: "s",
    minUnit: "min",
    note: (o) => (o.one
      ? `Sedan ${o.since} har ShelfSpring noterat ${pl(o.n, "bekräftad återkomst", "bekräftade återkomster")} av iPhone Duo hos ${o.place}, på ${n(o.days)} av ${n(o.tracked)} följda dagar. De två mest aktiva timmarna var ${o.range} (${o.pct} av registret; ${o.morning} föll mellan 8 och 12), den mest aktiva enskilda timmen ${o.busiest} med ${n(o.busiestN)}.${o.median ? ` Hälften av de uppmätta listningarna var borta inom ${o.median}.` : ""}${o.config ? ` ${o.config} kom tillbaka oftast (${n(o.top)} av ${n(o.n)}).` : ""}`
      : `Bland de ${n(o.stores)} butikerna i ${o.place} har ShelfSpring noterat ${pl(o.n, "bekräftad återkomst", "bekräftade återkomster")} av iPhone Duo sedan ${o.since}; ${n(o.k)} av butikerna har haft minst en. De två mest aktiva timmarna var ${o.range} (${o.zone}; ${o.pct} av registret; ${o.morning} föll mellan 8 och 12), den mest aktiva enskilda timmen ${o.busiest} med ${n(o.busiestN)}.${o.median ? ` Hälften av de uppmätta listningarna var borta inom ${o.median}.` : ""}${o.config ? ` ${o.config} kom tillbaka oftast (${n(o.top)} av ${n(o.n)}).` : ""}`),
    noteFew: (o) => `${pl(o.n, "bekräftad återkomst", "bekräftade återkomster")} av iPhone Duo ${o.one ? `hos ${o.place}` : `bland de ${n(o.stores)} butikerna i ${o.place}`} sedan ${o.since}, på ${pl(o.days, "dag", "dagar")} – under tröskeln på ${n(o.min)} återkomster under ${n(o.minDays)} dagar som ShelfSpring kräver innan en vanlig timme beskrivs.${o.median ? ` Hälften av de uppmätta listningarna var borta inom ${o.median}.` : ""} Varje enskild återkomst står i registret nedan.`,
    hourByHour: "Öppna registret timme för timme →",
    ledger: (k: number) => (k === 1 ? "Den senast registrerade återkomsten" : `De ${n(k)} senast registrerade återkomsterna`),
    col: { observed: "Sedd (butikens klocka)", config: "Variant", store: "Butik", listed: "Tid på hyllan" },
    secs: (k: number) => `${n(k)} s`,
    mins: (k: number) => `${n(k)} min`,
    listedRange: (low: string, high: string) => `${low}–${high} på hyllan`,
    listedAbout: (x: string) => `ungefär ${x} på hyllan`,
    stillListed: (x: string) => `på hyllan i ${x} hittills`,
    method: (o) => `Register sedan ${o.since} · ${o.note} · en återkomst räknas först när två observationer i rad stämmer överens; en variants första uppdykande räknas aldrig.`,
    delivered: (o) => (o.one
      ? `De senaste ${n(o.days)} dagarna levererade ShelfSpring ${pl(o.sent, "avisering", "aviseringar")} till medlemmar om återkomster hos ${o.place}.`
      : `De senaste ${n(o.days)} dagarna levererade ShelfSpring ${pl(o.sent, "avisering", "aviseringar")} till medlemmar om återkomster i ${n(o.stores)} av ${n(o.total)} butiker i ${o.place}.`),
    watch: (place: string) => `Bevaka en variant i ${place} →`,
    watchOne: "Bevaka en variant i den här butiken →",
    unknown: "Observationsregistret kunde inte läsas för den här begäran; hyllstatusen ovan påverkas inte.",
    zone: () => "lokal tid",
    allModels: (o) => `Alla modeller tillsammans: ${pl(o.n, "registrerad återkomst", "registrerade återkomster")} på ${n(o.days)} dagar${o.peak ? `; den mest aktiva timmen var ${o.peak}` : ""}.`,
  },
};
