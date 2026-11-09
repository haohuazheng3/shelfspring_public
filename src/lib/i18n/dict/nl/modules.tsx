/**
 * Dutch strings: modules — the return, shelf and store modules. `label` is a place phrase the page builds
 * ("in Noord-Holland", "bij Apple Haarlem", "hier"); numbers arrive raw and are formatted here.
 * Voice: a calm observation ledger — a restock is a "rentree", a status is "in het schap" / "uit het schap",
 * a check is a "blik", a configuration an "uitvoering". Rows stay terse.
 * Check intervals are only ever 15 seconds (every store) and 5 seconds (stores with alerts).
 */
import type { ReactNode } from "react";
import { num } from "@/lib/i18n/format";
import { colorLabel } from "@/lib/i18n/places";
import type { Dict } from "../en";

const L = "nl" as const;
const n$ = (v: number) => num(L, v);
/** "1 rentree", "3 rentrees". */
const cnt = (n: number, one: string, many: string) => `${n$(n)} ${n === 1 ? one : many}`;

export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `De bladzijde ${label} bleef de voorbije ${n$(days)} dagen leeg: geen rentree, niets uit het schap. De staven verschijnen bij de eerste notitie.`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `Op ${n$(activeDays)} van de voorbije ${n$(days)} dagen was er ${label} een rentree: ${cnt(restocks, "rentree", "rentrees")} genoteerd, ${n$(soldouts)} keer weer uit het schap.`,
    busiest: (day: string, restocks: number) => <> Piekdatum: <b className="text-ink">{day}</b>, {n$(restocks)} op één dag.</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day}: ${n$(restocks)} terug in het schap, ${n$(soldouts)} er weer uit`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day} · ${n$(restocks)} terug · ${n$(soldouts)} uit het schap`,
    legendRestocks: "rentrees",
    legendSoldouts: "weer uit het schap",
  },

  last24: {
    title: (label: string) => `iPhone Duo-rentrees ${label}, laatste etmaal`,
    asOf: (when: string) => `momentopname · ${when}`,
    localTime: (when: string) => `${when} winkeltijd`,
    anAppleStore: "een niet-vermelde Apple Store",
    unknown: "De telling van het laatste etmaal laadde niet bij deze aanvraag. De schapstatus en het rentreelog op deze pagina blijven gewoon geldig.",
    none: (label: string, asOf: string) => <><b className="text-ink">Een stil etmaal {label}:</b> geen iPhone Duo-rentree genoteerd in het venster tot {asOf}.</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <>Jongste rentree: <b className="text-ink">{o.config}</b>, {o.when} op de winkelklok{o.store != null && <>, genoteerd bij {o.store}</>}. <b className="text-ink">{`${cnt(o.restocks, "rentree", "rentrees")} in dit venster`}</b>{o.one ? null : <>, verspreid over {n$(o.withStores)} van de {n$(o.allStores)} winkels {o.label}</>}.</>
    ),
    tileRestocks: "rentrees in dit venster",
    tileConfigsBack: "uitvoeringen terug in het schap",
    tileStores: (configs: number, allConfigs: number) => `winkels met een rentree${configs ? ` · ${n$(configs)}/${n$(allConfigs)} uitvoeringen` : ""}`,
    tileLatest: (config: string, store: string | null) => <>jongste · {store != null && <>{store} · </>}{config}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>rentree daarvoor, {day} · {store != null && <>{store} · </>}{config}</>,
    tileNoEarlier: "niets eerders in het register",
    caption: (label: string, asOf: string) => `Rentrees per iPhone Duo-uitvoering ${label} in het etmaal tot ${asOf}`,
    thConfig: "Uitvoering",
    thRestocks: "Rentrees",
    thStores: "Vestigingen",
    thLast: "Jongste (winkeltijd)",
    thNow: "Nu in het schap",
    ofStores: (n: number, total: number) => `${n$(n)}/${n$(total)}`,
    noneIn24: "niets genoteerd",
    yes: "in het schap",
    no: "uit",
    countedTitle: "Wat telt als rentree",
    counted: "Een rentree is één bevestigde wissel van ‘uit het schap’ naar ‘in het schap’, voor één winkel en één uitvoering. Keert dezelfde uitvoering later opnieuw terug, dan is dat een nieuwe rentree; het getal zegt niets over het aantal toestellen. De actuele lijst geeft de stand bij de laatste blik. Het register toont waar iets terugkwam, maar voorspelt geen volgende levering.",
    alert: (label: string | null) => `Rentreemeldingen naar je telefoon${label ? ` · ${label}` : ""}`,
  },

  clock: {
    none: (label: string, days: number) => `Geen rentree genoteerd ${label} in de voorbije ${n$(days)} dagen.`,
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `Pas ${cnt(total, "rentree", "rentrees")} genoteerd ${label} in ${n$(days)} dagen${dates != null ? `, verspreid over ${cnt(dates, "dag", "dagen")}` : ""}: te dun om een gebruikelijk uur aan te wijzen.`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>Gebruikelijk rentree-uur {label}: <b className="text-ink">{hour}</b> op de winkelklok, op basis van {cnt(total, "rentree", "rentrees")} in {n$(days)} dagen{day ? <>; <b className="text-ink">{day}</b> voert de week aan</> : null}.</>
    ),
    byHour: (zone: string) => `Uur van de dag · ${zone}`,
    byWeekday: "Dag van de week",
    barReported: (n: number) => ` (+${n$(n)} externe meldingen)`,
    barReportedTitle: (bar: string, n: number) => `${bar}: ${n$(n)} externe meldingen`,
    legendOurs: "Eigen genoteerde rentrees",
  },

  feed: {
    empty: "Het rentreelog is nog leeg.",
    available: "In het schap",
    soldOut: "Weg",
    soldOutAt: (time: ReactNode) => <>weg · {time}</>,
    since: (time: ReactNode) => <>rentree · {time}</>,
    restockedAt: (time: ReactNode) => <>rentree · {time}</>,
    mapAria: (store: string) => `${store} opzoeken in de atlas`,
    map: "Opzoeken in de atlas",
    buyAria: (model: string, config: string) => `De ${model} ${config} bestellen via apple.com`,
    buy: "Bestellen via apple.com",
  },

  byConfig: {
    empty: (label: string, days: number) => `Niets kwam terug ${label} in ${n$(days)} dagen, dus er valt niets te rangschikken.`,
    intro: (label: string, days: number) => `Uitvoeringen gerangschikt naar rentrees ${label}, voorbije ${n$(days)} dagen.`,
    times: (n: number) => cnt(n, "rentree", "rentrees"),
    alert: "Volgen",
  },

  sellout: {
    typical: (label: string, band: string) => `Mediane schaptijd van een iPhone Duo-rentree ${label}: ongeveer ${band}.`,
    half: (label: string, duration: string) => `De helft van de getimede rentrees ${label} lag binnen ${duration} weer uit het schap.`,
    none: (label: string, days: number) => `Geen enkele rentree ${label} is de voorbije ${n$(days)} dagen uit het schap verdwenen.`,
    whatDuo: "iPhone Duo",
    whatAll: "elk model",
    tileHalf: (what: string) => <>mediane schaptijd · {what}</>,
    tileWithin30: "uit het schap in ≤ 30 s",
    tileWithin60: "uit het schap in ≤ 1 min",
    tileFastest: (n: number, days: number) => <>kortste van {cnt(n, "getimede rentree", "getimede rentrees")}, {n$(days)} d</>,
    caption: (days: number) => `Per model, voorbije ${n$(days)} dagen`,
    thIphone: "Model",
    thSoldOut: "getimed",
    thHalf: "mediaan",
    thWithin30: "≤ 30 s:",
    thWithin60: "≤ 1 min:",
    thFastest: "kortste",
    each: "Rentree per rentree",
    barNote: (full: string) => `staaflengte = tijd in het schap · ${full} vult de staaf`,
    stillListed: (duration: string) => `nog in het schap · ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "Hoe de schaptijd wordt afgebakend",
    measured: (_estimated: boolean) => { void _estimated; return "Elke schaptijd ligt tussen de laatste waarneming in het schap en de eerste erbuiten. Een ≈ wijst op een geschat interval. Wat korter in het schap ligt dan één kijkronde, kan ontbreken; geen enkele duur belooft dat je op tijd kunt afrekenen."; },
  },

  configTable: {
    title: "Schapcontrole per uitvoering",
    titleAt: (store: string) => `Schapcontrole per uitvoering · ${store}`,
    lookupOff: (hasRows: boolean) => `Apple heeft de afhaalopvraging voor deze winkel stilgelegd${hasRows ? "; de rijen hieronder zijn de laatste antwoorden" : ""}`,
    tracked: (n: number) => `${n$(n)} uitvoeringen op de volglijst`,
    firstSweep: "De eerste waarnemingen lopen; binnen een minuut staat hier per rij een status",
    inStock: (n: number, total: number) => `in het schap: ${n$(n)} van ${n$(total)} gevolgd`,
    available: "In het schap",
    unavailable: "Uit het schap",
    noLookup: "opvraging stilgelegd",
    notChecked: "wacht op een eerste blik",
    since: (ago: ReactNode) => <>opgedoken {ago}</>,
    lastAvailable: (ago: ReactNode) => <>laatst gezien {ago}</>,
    neverHere: "hier nooit gezien",
    buy: "Bestellen",
    alertAria: (model: string, config: string, store: string) => `De ${model} ${config} volgen bij ${store}`,
    alert: "Volg →",
  },

  matrix: {
    store: "Vestiging",
    checked: "Laatste blik",
    cellTitle: (model: string, n: number, total: number) => `${model}: ${n$(n)} van ${n$(total)} uitvoeringen in het schap`,
  },

  nearby: {
    duo: (short: string, n: number) => `${short} in het schap · ${n$(n)}`,
    noDuo: (short: string) => `${short} uit het schap`,
  },

  stockByModel: {
    availableNow: (n: number, total: number) => `${n$(n)}/${n$(total)} uitvoeringen in het schap`,
    noneNow: (total: number) => `0/${n$(total)} in het schap`,
    lookupOff: "Afhaalopvraging voor deze winkel door Apple stilgelegd",
    notChecked: "wacht op een eerste blik",
    more: (n: number) => `+${n$(n)} meer`,
    checked: (ago: ReactNode) => <>laatste blik {ago}</>,
    alert: "Volg →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>{ago} · schappen geregeld opnieuw bekeken</>,
    map: "Bekijk in de atlas",
    alert: "Deze winkel volgen",
    alsoIn: (region: string) => `Meer in ${region}`,
    acrossLine: "Het dichtst bij, over de staatsgrens",
    elsewhere: "Het dichtst bij, elders",
  },

  hours: {
    title: "Openingsuren",
    local: (zone: string) => `Alle tijden in ${zone}`,
    today: (hours: string, week: string) => ` · ${hours} vandaag · ${week}`,
    directions: "Routebeschrijving",
    applePage: "Apples eigen vermelding",
    liveMap: "Bekijk in de atlas",
    storePage: "Winkeldossier",
    closed: "dicht",
    everyDay: (hours: string) => `Dagelijks ${hours}`,
    openNow: (closes: string) => `Deuren open · tot ${closes}`,
    opensAt: (opens: string) => `Deuren open om ${opens}`,
    closedToday: (next: string | null) => (next ? `Vandaag dicht · weer open ${next}` : "Vandaag dicht"),
    closedNow: (next: string | null) => (next ? `Nu even dicht · weer open ${next}` : "Nu even dicht"),
    nextOpen: (day: string | null, time: string) => `${day ?? "morgen"} ${time}`,
    span: (opens: string, closes: string) => `${opens} tot ${closes}`,
  },

  liveStats: {
    inStock: "In het schap",
    storesWith: "Winkels met vermelding",
    lastCheck: "Laatste blik",
    none: "—",
  },

  board: {
    summary: (n: number, stores: number, short: string) => `${short} in het schap bij ${n$(n)} van ${n$(stores)} winkels`,
    lastCheck: (ago: ReactNode) => <>Laatste blik {ago}</>,
    firstSweep: "De eerste waarnemingen lopen.",
    noneListed: (model: string, storage: string | null, color: string | null) => `Op dit moment ligt de ${model}${storage ? ` ${storage}` : ""}${color ? ` in ${colorLabel(color, L)}` : ""} in geen enkele winkel in het schap.`,
    more: (n: number) => `+${n$(n)} meer`,
    seen: (ago: ReactNode) => <>Genoteerd {ago}</>,
    loading: "Schappen worden gelezen",
  },

  /** DuoLedger: het waarnemingslogboek waarmee regio-, stads-, winkel-, land- en Duo-modelpagina's openen. `place` komt zonder voorzetsel. */
  duoLedger: {
    kicker: (place: string) => `Waarnemingslogboek · iPhone Duo · ${place}`,
    headNone: (o) => (o.n === 1 ? `Afhalen kan nergens: de enige Apple Store in ${o.place} heeft de iPhone Duo uit het schap.` : `Afhalen kan nergens: alle ${n$(o.n)} Apple Stores in ${o.place} hebben de iPhone Duo uit het schap.`),
    headNoneOne: (place: string) => `${place}: momenteel geen enkele iPhone Duo-uitvoering in het schap om af te halen.`,
    headSome: (o) => <>{o.place} · afhaalbaar bij {n$(o.k)}/{n$(o.n)} Apple Stores: {o.list}.</>,
    headSomeOne: (o) => <>Bij {o.place} {o.k === 1 ? "ligt" : "liggen"} {n$(o.k)} van de {n$(o.total)} iPhone Duo-uitvoeringen klaar voor afhalen: {o.list}.</>,
    storeItem: (store: ReactNode, configs: number) => <>{store} ({cnt(configs, "uitvoering", "uitvoeringen")})</>,
    observed: (stamp: string) => `Momentopname ${stamp}.`,
    lastReturn: (o) => <>Jongste bevestigde rentree: <b className="text-ink">{o.config}</b>{o.store != null && <> bij {o.store}</>}, {o.when}{o.lasted ? <>, {o.lasted}</> : null}.</>,
    noReturnYet: (place: string, since: string) => `Sinds het register op ${since} openging, nog geen bevestigde iPhone Duo-rentree in ${place}.`,
    others: (o) => (o.one ? `Ter vergelijking: deze winkel toont ${n$(o.pro)} van de ${n$(o.configs)} iPhone 18 Pro-uitvoeringen en ${n$(o.max)} van de ${n$(o.configs)} Pro Max-uitvoeringen.` : `Ter vergelijking: de iPhone 18 Pro ligt bij ${n$(o.pro)} van deze winkels in het schap, de Pro Max bij ${n$(o.max)}.`),
    mReturns: (since: string) => `bevestigde rentrees sinds ${since}`,
    mStores: "winkels met minstens één rentree",
    mDays: "gevolgde dagen met een rentree",
    mWindow: (pct: string) => `twee drukste uren (winkeltijd) · ${pct} van het register`,
    mPerDay: "rentrees per gevolgde dag",
    mMedian: "mediane schaptijd, van opduiken tot weg",
    mToday: "rentrees vandaag, tot dusver",
    secUnit: "s",
    minUnit: "min",
    note: (o) => (o.one
      ? `ShelfSpring noteerde bij ${o.place} sinds ${o.since} ${cnt(o.n, "bevestigde iPhone Duo-rentree", "bevestigde iPhone Duo-rentrees")}, verspreid over ${n$(o.days)} van ${n$(o.tracked)} gevolgde dagen. Twee uren springen eruit: ${o.range} op de winkelklok, goed voor ${o.pct} van het register (${o.morning} lag tussen 8 en 12 uur). Het drukste losse uur was ${o.busiest}, met ${n$(o.busiestN)}.${o.median ? ` De helft van de getimede vermeldingen lag binnen ${o.median} weer uit het schap.` : ""}${o.config ? ` Vaakst terug: ${o.config} (${n$(o.top)} van ${n$(o.n)}).` : ""}`
      : `Over de ${n$(o.stores)} Apple Stores in ${o.place} samen noteerde ShelfSpring sinds ${o.since} ${cnt(o.n, "bevestigde iPhone Duo-rentree", "bevestigde iPhone Duo-rentrees")}; ${n$(o.k)} van die winkels hadden er minstens één. Twee uren springen eruit: ${o.range} ${o.zone}, goed voor ${o.pct} van het register (${o.morning} lag tussen 8 en 12 uur). Het drukste losse uur was ${o.busiest}, met ${n$(o.busiestN)}.${o.median ? ` De helft van de getimede vermeldingen lag binnen ${o.median} weer uit het schap.` : ""}${o.config ? ` Vaakst terug: ${o.config} (${n$(o.top)} van ${n$(o.n)}).` : ""}`),
    noteFew: (o) => `${cnt(o.n, "bevestigde iPhone Duo-rentree", "bevestigde iPhone Duo-rentrees")} ${o.one ? `bij ${o.place}` : `verspreid over de ${n$(o.stores)} Apple Stores in ${o.place}`} sinds ${o.since}, op ${cnt(o.days, "dag", "dagen")}. Dat blijft onder de grens van ${n$(o.min)} rentrees op ${n$(o.minDays)} dagen die ShelfSpring aanhoudt voordat het logboek een gebruikelijk uur noemt.${o.median ? ` De helft van de getimede vermeldingen lag binnen ${o.median} weer uit het schap.` : ""} Elke rentree afzonderlijk staat in het logboek hieronder.`,
    hourByHour: "Bekijk het register uur per uur →",
    ledger: (k: number) => (k === 1 ? "De jongste genoteerde rentree" : `De ${n$(k)} jongste genoteerde rentrees`),
    col: { observed: "Gezien (winkelklok)", config: "Uitvoering", store: "Winkel", listed: "Schaptijd" },
    secs: (k: number) => `${n$(k)} s`,
    mins: (k: number) => `${n$(k)} min`,
    listedRange: (low: string, high: string) => `${low}–${high} in het schap`,
    listedAbout: (x: string) => `circa ${x} in het schap`,
    stillListed: (x: string) => `al ${x} in het schap`,
    method: (o) => `Register sinds ${o.since} · ${o.note} · een rentree telt pas mee als twee opeenvolgende waarnemingen overeenstemmen; het allereerste opduiken van een uitvoering telt nooit.`,
    delivered: (o) => (o.one
      ? `Voor rentrees bij ${o.place} bezorgde ShelfSpring de voorbije ${n$(o.days)} dagen ${cnt(o.sent, "melding", "meldingen")} aan leden.`
      : `Voor rentrees bij ${n$(o.stores)} van de ${n$(o.total)} Apple Stores in ${o.place} bezorgde ShelfSpring de voorbije ${n$(o.days)} dagen ${cnt(o.sent, "melding", "meldingen")} aan leden.`),
    watch: (place: string) => `Zet een uitvoering in ${place} op je volglijst →`,
    watchOne: "Zet een uitvoering van deze winkel op je volglijst →",
    unknown: "Het waarnemingslogboek liet zich voor deze aanvraag niet lezen; de actuele vermelding hierboven staat daar los van.",
    zone: () => "winkeltijd",
    allModels: (o) => `Alle modellen samen: ${cnt(o.n, "genoteerde rentree", "genoteerde rentrees")} over ${n$(o.days)} dagen${o.peak ? `; het grootste uur was ${o.peak}` : ""}.`,
  },
};
