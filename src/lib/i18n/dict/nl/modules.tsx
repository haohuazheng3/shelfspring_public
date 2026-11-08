/**
 * Dutch strings: modules — the restock, store and stock modules. `label` is a place phrase the page builds
 * ("in Noord-Holland", "bij Apple Haarlem", "hier"); numbers arrive raw and are formatted here.
 * Check intervals are only ever 15 seconds (every store) and 5 seconds (stores with alerts).
 */
import type { ReactNode } from "react";
import { num } from "@/lib/i18n/format";
import { colorLabel } from "@/lib/i18n/places";
import type { Dict } from "../en";

const L = "nl" as const;
const n$ = (v: number) => num(L, v);
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
/** "1 aanvulling", "3 aanvullingen". */
const cnt = (n: number, one: string, many: string) => `${n$(n)} ${n === 1 ? one : many}`;

export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `In de afgelopen ${n$(days)} dagen is ${label} nog niets aangevuld of uitverkocht — de grafiek vult zich vanaf de eerste aanvulling.`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `${cnt(restocks, "aanvulling", "aanvullingen")} en ${n$(soldouts)} keer uitverkocht ${label} in de afgelopen ${n$(days)} dagen, op ${cnt(activeDays, "dag", "verschillende dagen")}.`,
    busiest: (day: string, restocks: number) => <> De drukste dag was <b className="text-ink">{day}</b> met {n$(restocks)}.</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day}: ${cnt(restocks, "aanvulling", "aanvullingen")}, ${n$(soldouts)} keer uitverkocht`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day}: ${cnt(restocks, "aanvulling", "aanvullingen")} · ${n$(soldouts)} keer uitverkocht`,
    legendRestocks: "aanvullingen",
    legendSoldouts: "uitverkocht",
  },

  last24: {
    title: (label: string) => `iPhone Duo-aanvullingen ${label} in de afgelopen 24 uur`,
    asOf: (when: string) => `stand van ${when}`,
    localTime: (when: string) => `${when} lokale tijd`,
    anAppleStore: "een Apple Store",
    unknown: "Het aantal van de afgelopen 24 uur kon nu niet worden gelezen; de live voorraad en het voorraadlogboek op deze pagina werken gewoon.",
    none: (label: string, asOf: string) => <><b className="text-ink">Geen iPhone Duo-aanvulling {label} in de afgelopen 24 uur</b> (stand van {asOf}).</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <>In de afgelopen 24 uur kwam de iPhone Duo <b className="text-ink">{`${n$(o.restocks)} keer`} terug {o.one ? o.label : `in ${n$(o.withStores)} van de ${n$(o.allStores)} Apple Store${o.allStores === 1 ? "" : "s"} ${o.label}`}</b>; de laatste: <b className="text-ink">{o.config}</b>{o.store != null && <> bij {o.store}</>}, {o.when} lokale tijd.</>
    ),
    tileRestocks: "bevestigde aanvullingen · 24 u",
    tileConfigsBack: "configuraties die terugkwamen",
    tileStores: (configs: number, allConfigs: number) => `winkels met een aanvulling${configs ? ` · ${n$(configs)} van ${n$(allConfigs)} configuraties` : ""}`,
    tileLatest: (config: string, store: string | null) => <>laatste · {config}{store != null && <> · {store}</>}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>laatste daarvoor · {config}{store != null && <> · {store}</>} · {day}</>,
    tileNoEarlier: "geen eerdere aanvulling bekend",
    caption: (label: string, asOf: string) => `Bevestigde aanvullingen per iPhone Duo-configuratie ${label}, afgelopen 24 uur, stand van ${asOf}`,
    thConfig: "Configuratie",
    thRestocks: "Aanvullingen",
    thStores: "Winkels",
    thLast: "Laatste aanvulling (lokale tijd)",
    thNow: "Nu op voorraad",
    ofStores: (n: number, total: number) => `${n$(n)} van ${n$(total)}`,
    noneIn24: "geen in 24 u",
    yes: "ja",
    no: "nee",
    countedTitle: "Zo tellen we aanvullingen",
    counted: "Een gebeurtenis is de bevestigde overgang van niet beschikbaar naar beschikbaar voor één winkel en uitvoering. Herhalingen zijn aparte gebeurtenissen, geen aantal telefoons. De lijst toont de laatste controle. De historie laat zien waar voorraad terugkwam, zonder de volgende levering te voorspellen.",
    alert: (label: string | null) => `Voorraadmeldingen op je telefoon instellen${label ? ` · ${label}` : ""}`,
  },

  clock: {
    none: (label: string, days: number) => `${cap(label)} zijn in de afgelopen ${n$(days)} dagen nog geen aanvullingen gelogd.`,
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `${cnt(total, "aanvulling", "aanvullingen")} ${label} in de afgelopen ${n$(days)} dagen${dates != null ? ` (op ${cnt(dates, "dag", "dagen")})` : ""} — te weinig om al een patroon te noemen.`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>{cnt(total, "aanvulling", "aanvullingen")} {label} in de afgelopen {n$(days)} dagen. De meeste komen rond <b className="text-ink">{hour}</b> lokale tijd{day ? <>, en <b className="text-ink">{day}</b> is de drukste dag</> : null}.</>
    ),
    byHour: (zone: string) => `Per uur · ${zone}`,
    byWeekday: "Per weekdag",
    barReported: (n: number) => ` (+${n$(n)} gemeld door andere trackers)`,
    barReportedTitle: (bar: string, n: number) => `${bar}: ${n$(n)} gemeld door andere trackers`,
    legendOurs: "Vastgelegde voorraadterugkeer",
  },

  feed: {
    empty: "Nog geen aanvullingen gelogd.",
    available: "Beschikbaar",
    soldOut: "Uitverkocht",
    soldOutAt: (time: ReactNode) => <>uitverkocht {time}</>,
    since: (time: ReactNode) => <>sinds {time}</>,
    restockedAt: (time: ReactNode) => <>aangevuld {time}</>,
    mapAria: (store: string) => `${store} op de kaart tonen`,
    map: "Kaart",
    buyAria: (model: string, config: string) => `De ${model} ${config} kopen op apple.com`,
    buy: "Kopen op apple.com",
  },

  byConfig: {
    empty: (label: string, days: number) => `${cap(label)} is in de afgelopen ${n$(days)} dagen geen enkele configuratie aangevuld, dus er is nog geen ranglijst.`,
    intro: (label: string, days: number) => `Welke configuraties ${label} terugkwamen in de afgelopen ${n$(days)} dagen, de vaakste eerst.`,
    times: (n: number) => `${n$(n)}×`,
    alert: "Waarschuw me",
  },

  sellout: {
    typical: (label: string, band: string) => `Een gemiddelde iPhone Duo-aanvulling ${label} was in zo'n ${band} uitverkocht.`,
    half: (label: string, duration: string) => `De helft van de aanvullingen ${label} was binnen ${duration} uitverkocht.`,
    none: (label: string, days: number) => `${cap(label)} is in de afgelopen ${n$(days)} dagen nog geen aanvulling uitverkocht geraakt.`,
    whatDuo: "iPhone Duo",
    whatAll: "alle iPhones",
    tileHalf: (what: string) => <>helft weg binnen · {what}</>,
    tileWithin30: "weg binnen 30 sec.",
    tileWithin60: "weg binnen 1 min.",
    tileFastest: (n: number, days: number) => <>snelste · {n$(n)} keer uitverkocht, {n$(days)} d</>,
    caption: (days: number) => `Per iPhone, laatste ${n$(days)} dagen`,
    thIphone: "iPhone",
    thSoldOut: "Uitverkocht",
    thHalf: "Helft weg binnen",
    thWithin30: "≤ 30 sec.",
    thWithin60: "≤ 1 min.",
    thFastest: "Snelste",
    each: "Aanvulling voor aanvulling",
    barNote: (full: string) => `balk = seconden te koop · vol bij ${full}`,
    stillListed: (duration: string) => `nog te koop · ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "Zo meten we dit",
    measured: (_estimated: boolean) => { void _estimated; return "De duur ligt tussen de laatste waarneming met voorraad en de eerste zonder voorraad. ≈ markeert een geschat interval. Voorraad die korter blijft dan een controle-interval kan worden gemist; de duur garandeert geen tijd om af te rekenen."; },
  },

  configTable: {
    title: "Elke configuratie in deze winkel",
    titleAt: (store: string) => `Elke configuratie bij ${store}`,
    lookupOff: (hasRows: boolean) => `Apple biedt in deze winkel nu geen voorraadcheck voor ophalen aan${hasRows ? " (de laatste antwoorden staan hieronder)" : ""}`,
    tracked: (n: number) => `${n$(n)} configuraties gevolgd`,
    firstSweep: "Eerste ronde bezig — de status verschijnt binnen een minuut",
    inStock: (n: number, total: number) => `${n$(n)} van ${n$(total)} op voorraad`,
    available: "Beschikbaar",
    unavailable: "Niet beschikbaar",
    noLookup: "geen ophaalcheck",
    notChecked: "nog niet gecheckt",
    since: (ago: ReactNode) => <>{ago} verschenen</>,
    lastAvailable: (ago: ReactNode) => <>laatst beschikbaar {ago}</>,
    neverHere: "hier nog nooit op voorraad gezien",
    buy: "Kopen",
    alertAria: (model: string, config: string, store: string) => `Waarschuw me als de ${model} ${config} beschikbaar is bij ${store}`,
    alert: "Waarschuw me →",
  },

  matrix: {
    store: "Winkel",
    checked: "Gecheckt",
    cellTitle: (model: string, n: number, total: number) => `${model}: ${n$(n)} van ${n$(total)} configuraties beschikbaar`,
  },

  nearby: {
    duo: (short: string, n: number) => `${short} · ${n$(n)}`,
    noDuo: (short: string) => `geen ${short}`,
  },

  stockByModel: {
    availableNow: (n: number, total: number) => `${n$(n)} van ${n$(total)} configuraties nu beschikbaar`,
    noneNow: (total: number) => `nu geen van de ${n$(total)} configuraties`,
    lookupOff: "Apple biedt hier nu geen ophaalcheck aan",
    notChecked: "nog niet gecheckt",
    more: (n: number) => `+${n$(n)}`,
    checked: (ago: ReactNode) => <>gecheckt {ago}</>,
    alert: "Waarschuw me →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>{ago} · Regelmatige voorraadupdates</>,
    map: "Op de kaart",
    alert: "Waarschuw me hier",
    alsoIn: (region: string) => `Ook in ${region}`,
    acrossLine: "Dichtstbijzijnde winkels over de staatsgrens",
    elsewhere: "Dichtstbijzijnde winkels elders",
  },

  hours: {
    title: "Openingstijden",
    local: (zone: string) => `Lokale tijd · ${zone}`,
    today: (hours: string, week: string) => ` · vandaag ${hours} · ${week}`,
    directions: "Route",
    applePage: "winkelpagina op apple.com",
    liveMap: "Live kaart",
    storePage: "Winkelpagina",
    closed: "Gesloten",
    everyDay: (hours: string) => `Elke dag ${hours}`,
    openNow: (closes: string) => `Nu open · sluit om ${closes}`,
    opensAt: (opens: string) => `Opent om ${opens}`,
    closedToday: (next: string | null) => (next ? `Vandaag gesloten · opent ${next}` : "Vandaag gesloten"),
    closedNow: (next: string | null) => (next ? `Nu gesloten · opent ${next}` : "Nu gesloten"),
    nextOpen: (day: string | null, time: string) => `${day ?? "morgen"} om ${time}`,
  },

  liveStats: {
    inStock: "Nu op voorraad",
    storesWith: "Winkels met voorraad",
    lastCheck: "Laatste check",
    none: "—",
  },

  board: {
    summary: (n: number, stores: number, short: string) => `${n$(n)} van de ${n$(stores)} winkels ${n === 1 ? "heeft" : "hebben"} de ${short} op voorraad`,
    lastCheck: (ago: ReactNode) => <>Laatste check {ago}</>,
    firstSweep: "Eerste ronde bezig.",
    noneListed: (model: string, storage: string | null, color: string | null) => `Geen enkele winkel heeft de ${model}${storage ? ` ${storage}` : ""}${color ? ` in ${colorLabel(color, L)}` : ""} nu op voorraad.`,
    more: (n: number) => `+${n$(n)}`,
    seen: (ago: ReactNode) => <>Gezien {ago}</>,
    loading: "Voorraad laden",
  },

  /** DuoLedger: het waarnemingsregister waarmee regio-, stads-, store-, land- en Duo-modelpagina's openen. `place` komt zonder voorzetsel. */
  duoLedger: {
    kicker: (place: string) => `Waarnemingsregister · iPhone Duo · ${place}`,
    headNone: (o) => `Geen van de ${n$(o.n)} Apple Stores in ${o.place} vermeldt een iPhone Duo om af te halen.`,
    headNoneOne: (place: string) => `${place} vermeldt geen enkele iPhone Duo-uitvoering om af te halen.`,
    headSome: (o) => <>Af te halen bij {n$(o.k)} van de {n$(o.n)} Apple Stores in {o.place}: {o.list}.</>,
    headSomeOne: (o) => <>{o.place} vermeldt {n$(o.k)} van de {n$(o.total)} iPhone Duo-uitvoeringen om af te halen: {o.list}.</>,
    storeItem: (store: ReactNode, configs: number) => <>{store} ({cnt(configs, "uitvoering", "uitvoeringen")})</>,
    observed: (stamp: string) => `Waargenomen ${stamp}.`,
    lastReturn: (o) => <>Laatste bevestigde aanvulling: <b className="text-ink">{o.config}</b>{o.store != null && <> bij {o.store}</>}, {o.when}{o.lasted ? <>, {o.lasted}</> : null}.</>,
    noReturnYet: (place: string, since: string) => `Geen bevestigde iPhone Duo-aanvulling in ${place} sinds het register op ${since} begon.`,
    others: (o) => (o.one ? `iPhone 18 Pro: ${n$(o.pro)} van ${n$(o.configs)} uitvoeringen hier vermeld; 18 Pro Max: ${n$(o.max)} van ${n$(o.configs)}.` : `iPhone 18 Pro: vermeld bij ${n$(o.pro)} van deze stores; 18 Pro Max: bij ${n$(o.max)}.`),
    mReturns: (since: string) => `bevestigde aanvullingen sinds ${since}`,
    mStores: "stores met minstens één aanvulling",
    mDays: "gevolgde dagen met een aanvulling",
    mWindow: (pct: string) => `drukste twee uur · ${pct} van het register`,
    mPerDay: "aanvullingen per gevolgde dag",
    mMedian: "mediane vermeldingsduur, van verschijnen tot verdwijnen",
    mToday: "aanvullingen vandaag, tot nu toe",
    secUnit: "s",
    minUnit: "min",
    note: (o) => (o.one
      ? `Sinds ${o.since} heeft ShelfSpring ${cnt(o.n, "bevestigde iPhone Duo-aanvulling", "bevestigde iPhone Duo-aanvullingen")} bij ${o.place} vastgelegd, op ${n$(o.days)} van de ${n$(o.tracked)} gevolgde dagen. De drukste twee uur waren ${o.range} (${o.pct} van het register; ${o.morning} viel tussen 8 en 12 uur), het drukste uur ${o.busiest} met ${n$(o.busiestN)}.${o.median ? ` De helft van de gemeten vermeldingen was binnen ${o.median} weer weg.` : ""}${o.config ? ` ${o.config} kwam het vaakst terug (${n$(o.top)} van ${n$(o.n)}).` : ""}`
      : `In de ${n$(o.stores)} Apple Stores in ${o.place} heeft ShelfSpring sinds ${o.since} ${cnt(o.n, "bevestigde iPhone Duo-aanvulling", "bevestigde iPhone Duo-aanvullingen")} vastgelegd; ${n$(o.k)} stores hadden er minstens één. De drukste twee uur waren ${o.range} (${o.zone}; ${o.pct} van het register; ${o.morning} viel tussen 8 en 12 uur), het drukste uur ${o.busiest} met ${n$(o.busiestN)}.${o.median ? ` De helft van de gemeten vermeldingen was binnen ${o.median} weer weg.` : ""}${o.config ? ` ${o.config} kwam het vaakst terug (${n$(o.top)} van ${n$(o.n)}).` : ""}`),
    noteFew: (o) => `${cnt(o.n, "bevestigde iPhone Duo-aanvulling", "bevestigde iPhone Duo-aanvullingen")} ${o.one ? `bij ${o.place}` : `in de ${n$(o.stores)} Apple Stores in ${o.place}`} sinds ${o.since}, op ${cnt(o.days, "dag", "dagen")} – onder de drempel van ${n$(o.min)} aanvullingen op ${n$(o.minDays)} dagen die ShelfSpring hanteert voordat het een gebruikelijk uur noemt.${o.median ? ` De helft van de gemeten vermeldingen was binnen ${o.median} weer weg.` : ""} De afzonderlijke aanvullingen staan in het register hieronder.`,
    hourByHour: "Open het register uur voor uur →",
    ledger: (k: number) => (k === 1 ? "De laatste vastgelegde aanvulling" : `De laatste ${n$(k)} vastgelegde aanvullingen`),
    col: { observed: "Waargenomen (storetijd)", config: "Uitvoering", store: "Store", listed: "Vermeld gedurende" },
    secs: (k: number) => `${n$(k)} s`,
    mins: (k: number) => `${n$(k)} min`,
    listedRange: (low: string, high: string) => `vermeld ${low}–${high}`,
    listedAbout: (x: string) => `vermeld ongeveer ${x}`,
    stillListed: (x: string) => `nog vermeld (${x})`,
    method: (o) => `Register sinds ${o.since} · ${o.note} · een aanvulling telt pas als twee opeenvolgende waarnemingen overeenkomen; de eerste verschijning van een uitvoering telt nooit.`,
    delivered: (o) => (o.one
      ? `In de afgelopen ${n$(o.days)} dagen bezorgde ShelfSpring ${cnt(o.sent, "melding", "meldingen")} aan leden voor aanvullingen bij ${o.place}.`
      : `In de afgelopen ${n$(o.days)} dagen bezorgde ShelfSpring ${cnt(o.sent, "melding", "meldingen")} aan leden voor aanvullingen bij ${n$(o.stores)} van de ${n$(o.total)} Apple Stores in ${o.place}.`),
    watch: (place: string) => `Volg een uitvoering in ${place} →`,
    watchOne: "Volg een uitvoering in deze store →",
    unknown: "Het waarnemingsregister kon voor deze aanvraag niet worden gelezen; de livevermelding hierboven is niet geraakt.",
    zone: () => "lokale tijd",
    allModels: (o) => `Alle modellen samen: ${cnt(o.n, "vastgelegde aanvulling", "vastgelegde aanvullingen")} in ${n$(o.days)} dagen${o.peak ? `; het drukste uur was ${o.peak}` : ""}.`,
  },
};
