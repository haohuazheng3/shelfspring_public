import { withShelfViews } from "@/lib/seo/localizedCopy";
/**
 * Dutch strings: views — the product × place pages, the return log, the shelf map, the iPhone Duo return-times
 * page and the store directory, as the Dutch versions (/nl-nl, /nl-be) print them. Same keys, arguments and
 * markup as English; `c: Country` is English data, named here in Dutch (places.countryLabel), and English place
 * or colour names inside product names are put into Dutch. Voice: an observation ledger ("rentree" for a restock,
 * "in het schap" / "uit het schap", "uitvoering" for a configuration, "volglijst" for alerts, "winkeltijd").
 */
import type { ReactNode } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import type { Point } from "@/components/ui/Viz";
import type { Faq } from "@/lib/content/types";
import { catalogFor, storePath, storesOf, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type Country, type CountryCode } from "@/lib/apple/countries";
import { faq as placeFaq, peakOf, type FaqContext, type FaqItem } from "@/lib/seo/enrich";
import type { Place, PlaceLevel, Product } from "@/lib/seo/products";
import type { StoreLine } from "@/lib/seo/productData";
import type { PlaceStats, RestockStats } from "@/lib/stock/queries";
import { hourShare, type DayRow, type SelloutFacts } from "@/lib/content/restockTimes";
import { PATTERN_MIN, PATTERN_MIN_DAYS, WEEKDAY_MIN_SPAN, hourLabel as hourLabelIn, localStamp as localStampIn } from "@/lib/content/siteFacts";
import { SPEED } from "@/lib/plans";
import { num, pct as pctIn, price, stamp, list, fitTitleW, hour, unit, secs, weekdays, distance } from "@/lib/i18n/format";
import { appleStoreLabel, cityLabel, colorLabel, countryLabel, regionLabel } from "@/lib/i18n/places";
import type { Dict } from "../en";
import type { RestockTimesMeta, RestockTimesView } from "../en/views";

const L = "nl" as const;
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const n$ = (v: number) => num(L, v);
const cnt = (n: number, one: string, many: string) => `${n$(n)} ${n === 1 ? one : many}`;
const ARTICLE: Partial<Record<CountryCode, string>> = { us: "de ", uk: "het ", ae: "de " };
const land = (cc: CountryCode) => countryLabel(cc, L);
/** "in Nederland", "in de Verenigde Staten". */
const inC = (c: Country | CountryCode) => { const cc = typeof c === "string" ? c : c.cc; return `in ${ARTICLE[cc] ?? ""}${land(cc)}`; };
const NOUN: Record<string, [string, string]> = {
  state: ["staat", "staten"], province: ["provincie", "provincies"], area: ["gebied", "gebieden"], department: ["departement", "departementen"],
  prefecture: ["prefectuur", "prefecturen"], emirate: ["emiraat", "emiraten"], canton: ["kanton", "kantons"], region: ["gewest", "gewesten"],
  county: ["provincie", "provincies"], city: ["stad", "steden"],
};
/** The country's word for its regions, in Dutch. */
const noun = (c: Country, many = false) => (NOUN[c.regionNoun ?? "area"] ?? NOUN.area)[many ? 1 : 0];
/** Apple's colour names in a product name ("iPhone Duo 512GB Night Sky" → "… Nachthemel"). */
const COLORS = ["Night Sky", "Star White", "Black", "Burgundy", "Glacier", "Silver"];
const tc = (s: string) => COLORS.reduce((a, col) => a.replace(new RegExp(`\\b${col}\\b`), colorLabel(col, L)), s);
const pname = (p: Product) => tc(p.name);
const pshort = (p: Product) => tc(p.short);
/** "2 d", "1 u 5 min", "korter dan een minuut": how long a listing stayed on the shelf. */
const dur = (ms: number) => {
  const s = Math.round(ms / 1000);
  if (s < 60) return "korter dan een minuut";
  const m = Math.floor(s / 60);
  if (m < 60) return unit(L, m, "m");
  const h = Math.floor(m / 60);
  if (h < 24) return secs(L, m * 60);
  const d = Math.floor(h / 24);
  return h % 24 ? `${unit(L, d, "d")} ${unit(L, h % 24, "h")}` : unit(L, d, "d");
};
const fitT = (v: string[], max = 60) => fitTitleW(v, max);
const ccOf = (p: { country?: CountryCode }) => p.country ?? "us";
const appleOf = (s: Store) => appleStoreLabel(s, L);
/** A place of the product tree, named in Dutch. */
function placeNl(place: Place): string {
  const cc = ccOf(place);
  if (place.level === "country") return cc === "us" ? "de VS" : land(cc);
  if (place.level === "state") return regionLabel(cc, place.state!, L);
  if (place.level === "city") return cityLabel(cc, place.city!, L);
  return appleOf(place.store!);
}
const atPlace = (place: Place) => (place.level === "store" ? `bij ${placeNl(place)}` : `in ${placeNl(place)}`);
/** "€ 2.339" in the country's currency. */
const money = (cc: CountryCode, v: number) => price(L, COUNTRIES[cc], v);
/** "21% btw inbegrepen"; Canada and the US: "belasting nog niet inbegrepen"; Hong Kong: "geen btw". */
function taxNoteOf(c: Country): string {
  if (!c.pricesIncludeTax) return "belasting nog niet inbegrepen";
  const m = c.taxNote.match(/\((\d+(?:\.\d+)?)%\)/);
  if (!m) return "geen btw";
  const word = /^VAT/.test(c.taxNote) ? "btw" : /^GST/.test(c.taxNote) ? "GST" : /^consumption/.test(c.taxNote) ? "consumptiebelasting" : "btw";
  return `${pctIn(L, Number(m[1]))} ${word} inbegrepen`;
}

/* ---------------------------------------------------------------- return-times helpers */

type RT = Dict["views"]["restockTimes"];
const rtN = (x: number) => n$(x);
const rtPct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : pctIn(L, Math.round(x * 100)));
/** "di 3 nov" from a calendar day. */
const dateLabel = (ymd: string, weekday = true) => new Intl.DateTimeFormat("nl-NL", { timeZone: "UTC", month: "short", day: "numeric", ...(weekday ? { weekday: "short" as const } : {}) }).format(new Date(`${ymd}T12:00:00Z`));
const longDate = (ymd: string) => new Intl.DateTimeFormat("nl-NL", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${ymd}T12:00:00Z`));
const zoneStamp = (iso: string, c: Country) => stamp(L, iso, c.timeZone, true);
const localStamp = (iso: string, store: Parameters<typeof localStampIn>[1]) => localStampIn(iso, store, L);
const hourLabel = (h: number) => hourLabelIn(h, L);
/** "9:00–11:00" (tables, labels). */
const rangeLabel = (from: number, to: number) => `${hour(L, from)}–${hour(L, to % 24)}`;
/** "van 9:00 tot 11:00" (sentences). */
const between = (from: number, to: number) => `van ${hour(L, from)} tot ${hour(L, to % 24)}`;
/** One Apple Store in the country (Belgium). */
const oneIn = (c: Country | CountryCode) => storesOf(typeof c === "string" ? c : c.cc).length === 1;
const WEEKDAYS_NL = weekdays(L);
const rtRegion = (x: { us: boolean; c: Country }) => (x.us ? "staat" : noun(x.c));
const rtRegions = (x: { us: boolean; c: Country }) => (x.us ? "staten" : noun(x.c, true));

/* ---------------------------------------------------------------- product copy (lib/seo/productCopy in Dutch) */

function productTitle(product: Product, place: Place, inStock: number): string {
  const n = place.stores.length;
  const name = pname(product);
  const short = pshort(product);
  if (place.level === "country" && ccOf(place) !== "us") {
    const w = inC(ccOf(place));
    return fitT([...(inStock > 0 ? [`${name} op voorraad in ${cnt(inStock, "Apple Store", "Apple Stores")} ${w}`, `${name} nu op voorraad ${w}`] : []), `${name}: voorraad om op te halen ${w}, live`, `${name}: voorraad ${w}`, `${short}: voorraad ${w}`, `${short}: voorraad`]);
  }
  if (place.level === "country") return fitT([...(inStock > 0 ? [`${name} nu op voorraad in ${cnt(inStock, "Apple Store", "Apple Stores")}`] : []), `${name}: voorraad om op te halen, live`, `${short}: voorraad, live`, `${short}: voorraad`]);
  if (place.level === "store") {
    const s = place.store!;
    const apple = appleOf(s);
    const now = inStock > 0 ? "nu op voorraad" : "voorraad om op te halen";
    const city = cityLabel(ccOf(place), s.city, L);
    return fitT([`${name} bij ${apple}: ${now}`, `${name} bij ${apple}`, ...(apple.includes(city) ? [] : [`${short} bij ${apple}, ${city}`]), `${short} bij ${apple}`, `${short} · ${apple.replace(/^Apple /, "")}`]);
  }
  const w = placeNl(place);
  return fitT([`${name} op voorraad in ${w}: ${n$(inStock)} van ${n$(n)}`, `${name} in ${w}: voorraad om op te halen`, `${short} op voorraad in ${w}`, `${short} in ${w}`]);
}

function productDescription(product: Product, place: Place, inStock: number, stats: PlaceStats): string {
  const name = pname(product);
  const week = `${cnt(stats.week, "aanvulling", "aanvullingen")} deze week`;
  if (place.level === "store") {
    const s = place.store!;
    const now = inStock > 0 ? "nu op voorraad" : "nu niet op voorraad";
    return fitT([
      `${name}: voorraad om op te halen bij ${appleOf(s)}, ${cityLabel(ccOf(place), s.city, L)}: ${now}, ${week}. Live status, aanvultijden en alerts.`,
      `${name} bij ${appleOf(s)}: ${now}, ${week}. Live status en alerts.`,
    ], 155);
  }
  if (place.stores.length === 1) {
    const s = place.stores[0];
    return fitT([
      `${name}: ${inStock > 0 ? "nu op voorraad" : "nu niet op voorraad"} bij ${appleOf(s)}, ${week}. Live status, aanvultijden en alerts.`,
      `${name} bij ${appleOf(s)}: ${inStock > 0 ? "nu op voorraad" : "nu niet op voorraad"}, ${week}.`,
    ], 155);
  }
  const where = place.level === "country" ? (ccOf(place) === "us" ? "Apple Stores in de VS" : `Apple Stores ${inC(ccOf(place))}`) : `Apple Stores in ${placeNl(place)}`;
  const verb = inStock === 1 ? "heeft" : "hebben";
  return fitT([
    `${name}: ${n$(inStock)} van de ${n$(place.stores.length)} ${where} ${verb} hem nu om op te halen, ${week}. Live per winkel, aanvultijden en alerts.`,
    `${name}: ${n$(inStock)} van de ${n$(place.stores.length)} ${where} ${verb} hem nu, ${week}. Live per winkel en alerts.`,
  ], 155);
}

function productFaq(product: Product, place: Place, lines: StoreLine[], stats: PlaceStats, clock: RestockStats, nearest: { name: string; city: string; distance: number } | null): FaqItem[] {
  const out: FaqItem[] = [];
  const name = pname(product);
  const at = atPlace(place);
  const inStock = lines.filter((l) => l.available.length > 0);
  const near = nearest ? `${/^apple\b/i.test(nearest.name) ? nearest.name : `Apple ${nearest.name}`} (${nearest.city}, ${distance(L, ccOf(place), nearest.distance)} hiervandaan)` : null;
  if (place.level === "store") {
    const l = lines[0];
    out.push({
      q: `Ligt de ${name} ${at} in het schap?`,
      a: l && l.available.length > 0
        ? `Bij de laatste blik wel${product.parts.length > 1 ? `: ${list(L, l.available.map((i) => `${i.storage} ${colorLabel(i.color, L)}`), 4, (k) => `plus ${n$(k)} andere`)}` : ""}.`
        : `Bij de laatste blik niet${near ? `. Dichtstbij ligt hij wel bij ${near}` : ""}.`,
    });
  } else if (place.stores.length === 1) {
    const s = place.stores[0];
    out.push({
      q: `Ligt de ${name} op dit moment in het schap bij ${appleOf(s)}?`,
      a: inStock.length > 0 ? "Bij de laatste blik: ja." : `Bij de laatste blik: nee${near ? `. Dichtstbij ligt hij wel bij ${near}` : ""}.`,
    });
  } else {
    out.push({
      q: `In welke Apple Stores ${at} ligt de ${name} nu?`,
      a: inStock.length === 0
        ? `Bij de laatste blik in geen enkele${near ? `; dichtstbij ligt hij wel bij ${near}` : ""}.`
        : `Bij de laatste blik in ${cnt(inStock.length, "winkel", "winkels")}: ${list(L, inStock.map((l) => appleOf(l.store)), 4, (k) => `plus ${n$(k)} andere`)}.`,
    });
  }
  const peak = peakOf(clock, L);
  out.push({
    q: `Hoe vaak keert de ${name} terug ${at}?`,
    a: stats.month === 0
      ? `De voorbije ${n$(stats.days)} dagen is ${at} geen rentree genoteerd.`
      : `${cnt(stats.month, "rentree", "rentrees")} in de voorbije ${n$(stats.days)} dagen, waarvan ${n$(stats.week)} deze week${peak ? `; doorgaans rond ${peak.hour} winkeltijd` : ""}.`,
  });
  if (stats.medianMs != null) out.push({ q: `Hoe lang ligt hij ${at} in het schap?`, a: `Mediaan: ${dur(stats.medianMs)} tussen verschijnen en weer weg.` });
  return out;
}

function priceLabel(product: Product): string {
  const cc = ccOf(product);
  const prices = catalogFor(product.model, cc).filter((c) => product.parts.includes(c.partNumber)).map((c) => c.price);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  const f = (v: number) => money(cc, v);
  return lo === hi ? f(lo) : `${f(lo)}–${f(hi)}`;
}

/* ---------------------------------------------------------------- views */

const baseViews: Dict["views"] = {
  common: {
    inCountry: (c: Country) => inC(c),
    liveMap: "Schappenkaart",
    restockLog: "Rentreelog",
    alertMe: "Op de volglijst",
    lastDays: (days: number) => <>Rentreekalender, {n$(days)} dagen</>,
    since: "2 november 2026",
    sourcesWhere: (n: number, c: Country) => (n === 1 ? `de enige waargenomen Apple Store ${inC(c)}` : `${n$(n)} waargenomen Apple Stores ${inC(c)}`),
    checker: (c: Country) => `Afhaallogboek ${land(c.cc)}`,
    appleStoresIn: (c: Country) => `Apple Stores ${inC(c)}`,
    storesWithIt: "winkels die hem tonen",
    more: "Ook in het logboek",
  },

  /* ---------------------------------------------------------------- /stock/{product}/{place…} */
  product: {
    title: productTitle,
    description: productDescription,
    faq: productFaq,
    priceLabel,
    inPlace: (name: string, level: PlaceLevel) => (level === "store" ? `bij ${name}` : `in ${name}`),
    h1Country: (model: string, c: Country) => `${tc(model)} ${inC(c)}: wat er nu in het schap ligt`,
    h1Place: (model: string, where: string) => `${tc(model)} ${where}`,
    inStockNow: "Nu in het schap",
    yes: "Ligt er",
    no: "Ligt er niet",
    pickup: "afhaalantwoord",
    configurations: "uitvoeringen getoond",
    ofStores: (n: number) => `over ${cnt(n, "waargenomen winkel", "waargenomen winkels")}`,
    restocks24h: "Rentrees, laatste etmaal",
    restocksHint: (week: number, month: number, days: number) => `7 d: ${n$(week)} · ${n$(days)} d: ${n$(month)}`,
    sellOuts: (days: number) => `Weer weg · ${n$(days)} d`,
    stays: (ms: number) => { const d = dur(ms); return /^korter\b/.test(d) ? `mediaan ${d} in het schap` : `mediaan ≈${d} in het schap`; },
    noPairs: "nog geen afgeronde periode",
    lastRestock: "Recentste rentree",
    noneYet: "nog niet gezien",
    thisConfig: "precies deze uitvoering",
    inDays: (days: number) => `geen binnen ${n$(days)} dagen`,
    notInStockNow: "Nu uit het schap",
    configsInStock: (n: number, of: number) => <span><b className="text-ink">{n$(n)}</b>/{n$(of)} uitvoeringen in het schap</span>,
    inStockAt: (n: number, of: number) => <span>In het schap bij <b className="text-ink">{n$(n)}</b>/{n$(of)} {of === 1 ? "winkel" : "winkels"}</span>,
    checked: (live: ReactNode, price: string, tax: string) => <>{price}{tax} · laatst bekeken {live}</>,
    taxNote: (c: Country) => taxNoteOf(c),
    beforeTax: "zonder belasting",
    buyOnApple: "Bestellen via apple.com",
    allStoresIn: (c: Country) => `Winkeloverzicht ${inC(c)}`,
    everyIphoneHere: "Alle drie de iPhones hier",
    everyIphone: (where: string) => `Alle drie de iPhones ${where}`,
    panel: (model: string, where: string | null) => `Volglijst voor de ${tc(model)}${where ? ` ${where}` : ""}: eerst de uitvoeringen, dan de winkels die je kunt halen`,
    unitConfigs: "uitvoeringen",
    unitStores: "winkels",
    otherConfigsHere: "Andere uitvoeringen in deze winkel",
    byStorageColor: "Eerst capaciteit, dan afwerking",
    nearestStores: "Winkels het dichtstbij",
    closest: (link: ReactNode, dist: string) => <>Dichtstbijzijnde winkel die hem toont: {link} ({dist})</>,
    storeCity: (store: string, city: string) => <>{store} ({city})</>,
    mostRecentlyInStock: "Waar hij het laatst gezien is",
    storesWithItNow: "Winkels die hem vandaag tonen",
    storesIn: (where: string) => `Winkeloverzicht ${where}`,
    colStatus: "schap",
    colConfigs: "uitvoeringen getoond",
    noStoreHasIt: "Bij de recentste waarneming toont geen enkele winkel hem.",
    noStoreHereHasIt: "Bij de recentste waarneming toont geen van deze winkels hem.",
    moreStores: (n: number) => <>Nog {n$(n)} winkels tonen hem · open het volledige winkeloverzicht ↗</>,
    byRegion: (c: Country) => `Verdeeld per ${noun(c)}`,
    byCity: "Verdeeld per stad",
    nearbyStores: "Uitwijkwinkels",
    latestChanges: "Nieuwste regels in het logboek",
    nothingLogged: "Het logboek is nog leeg.",
    whenRestocks: "Op welke uren rentrees vallen",
    howFast: "Hoe lang hij in het schap bleef",
    restocksByConfig: "Rentrees per uitvoering",
    faqTitleCountry: (model: string, c: Country) => `Veldvragen · ${tc(model)} ${inC(c)}`,
    faqTitle: (model: string, where: string) => `Veldvragen · ${tc(model)} ${where}`,
    buySource: (model: string, c: Country) => `apple.com ${land(c.cc)}: bestelpagina van de ${tc(model)}`,
    nearby: "Plaatsen eromheen",
    otherRegions: (c: Country) => `Meer ${noun(c, true)}`,
    elsewhereIn: (region: string) => `Meer uit ${region}`,
    everyAppleStoreIn: (c: Country) => `Volledig winkeloverzicht ${inC(c)}`,
    across: (model: string, c: Country) => `${tc(model)} · heel ${c.cc === "us" ? "de VS" : land(c.cc)}`,
    itemList: (model: string, where: string) => `${tc(model)} ${where}`,
    nearLead: (c: Country, model: string, inStock: number, n: number, have: { store: string; city: string; configs: number }[]) =>
      inStock === 0
        ? `${n === 1 ? `De Apple Store ${inC(c)} toont` : `Geen enkele Apple Store ${inC(c)} toont`} de ${tc(model)} op dit moment om af te halen. "In de buurt" komt dus neer op de vraag welke winkel hem als eerste terug in het schap krijgt. Zet de winkels die je kunt halen op je volglijst; na een bevestigde rentree volgt een melding.`
        : `Nu ${inStock === 1 ? "toont" : "tonen"} ${n$(inStock)} van de ${cnt(n, "winkel", "winkels")} de ${tc(model)}: ${list(L, have.slice(0, 5).map((l) => `${l.store}, ${l.city} · ${cnt(l.configs, "uitvoering", "uitvoeringen")}`), 5)}.`,
    nearHead: (c: Country) => [cap(noun(c)), "Winkels die hem nu tonen"],
    nearCaption: (c: Country, model: string) => `${tc(model)} in het schap per ${noun(c)}, bij de laatste blik`,
    nearMe: (c: Country, model: string, alert: string) => `Alle winkels gesorteerd op afstand van jouw plek? Open de volglijst op deze pagina en laat je locatie bepalen: elke afstand is een schatting over de weg, in ${c.unit === "mi" ? "mijl" : "kilometers"}, met een link naar de route. [Zet de ${tc(model)} op je volglijst](${alert}).`,
    modelFaq: (c: Country, model: string, low: number, high: number, inStock: number): { price: FaqItem; reserve: FaqItem } => ({
      price: { q: `Wat betaal je voor de ${tc(model)} ${inC(c)}?`, a: `Op apple.com ${money(c.cc, low)} voor de kleinste capaciteit, oplopend tot ${money(c.cc, high)} voor de grootste (${taxNoteOf(c)}).` },
      reserve: { q: `Kun je een ${tc(model)} laten vasthouden om af te halen ${inC(c)}?`, a: `Alleen door hem te bestellen. Rond je op apple.com de bestelling af met afhalen in de winkel, dan houdt Apple die uitvoering vast voor het tijdvak dat je koos.${inStock === 0 ? " Bij de recentste waarneming toont geen enkele winkel hem; staat hij op je volglijst, dan hoor je het als eerste." : ""}` },
    }),
  },

  /* ---------------------------------------------------------------- /restocks */
  restocks: {
    metaTitle: (c: Country, n: number) => `Rentreelog ${inC(c)}: ${n === 1 ? "één Apple Store" : `${n$(n)} Apple Stores`} in beeld`,
    metaDescription: (c: Country, n: number) => `Elke rentree van iPhone Duo, 18 Pro en Pro Max om af te halen ${n === 1 ? "bij de enige Apple Store" : "bij de Apple Stores"} ${inC(c)}: tijd, uitvoering en plek op de kaart.`,
    h1: (c: Country) => `Rentreelog ${inC(c)}`,
    summary: (day: number, week: number, model?: string, region?: string) => <>Laatste etmaal: {cnt(day, "rentree", "rentrees")}; voorbije zeven dagen: {n$(week)}{model ? ` · ${model}` : ""}{region ? ` · ${region}` : ""}. Klokuren volgen je toestel.</>,
    allModels: "Elk model",
    restocks: "Alleen rentrees",
    withSoldOut: "Rentrees en weer weg",
    regionLabel: (c: Country) => cap(noun(c)),
    allRegions: (c: Country) => `Elke ${noun(c)}`,
    filter: "Toepassen",
    page: (k: number) => <>blad {n$(k)}</>,
    newer: "← Recenter",
    older: "Eerder →",
    getAlerts: "Begin een volglijst",
    byPlace: "Rentrees per plaats",
    byRegion: (c: Country) => `Verdeeld per ${noun(c)}`,
    datasetName: (c: Country) => `Logboek van iPhone-aanvullingen om op te halen in Apple Stores ${inC(c)}`,
    datasetDescription: (c: Country) => `Elke bevestigde rentree en elk moment waarop de iPhone Duo, iPhone 18 Pro of iPhone 18 Pro Max weer uit het schap ging, om af te halen in ${c.cc === "us" ? "alle 269 Apple Stores in de VS" : oneIn(c) ? `die ene Apple Store ${inC(c)}` : `de Apple Stores ${inC(c)}`}, met winkel, exacte uitvoering en tijd. Een rentree telt pas na twee overeenstemmende antwoorden van apple.com.`,
    datasetMeasured: ["Apple Store", "iPhone-model, opslag en kleur", "tijd van aanvulling", "tijd van uitverkocht"],
  },

  /* ---------------------------------------------------------------- /map */
  map: {
    metaTitle: (c: Country, n: number) => `Schappenkaart iPhone Duo: ${n === 1 ? "één Apple Store" : "alle Apple Stores"} ${inC(c)}`,
    metaDescription: (c: Country, n: number) => `Kaart van ${n === 1 ? "één Apple Store" : `${n$(n)} Apple Stores`} ${inC(c)}: welke uitvoeringen van iPhone Duo, 18 Pro en Pro Max nu in het schap liggen om af te halen.`,
    // regionNoun stays the English key: the map looks its Dutch word up in cdict map.nouns.
    country: (c: Country) => ({ name: land(c.cc), inName: inC(c), regionNoun: c.regionNoun, regionNounPlural: c.regionNounPlural }),
    everyStore: "Winkeloverzicht",
    storeCity: (store: string, city: string) => `${city} · ${store}`,
  },

  /* ---------------------------------------------------------------- /{cc}/stores */
  storesIndex: {
    metaDescription: (c: Country, n: number, regions: number, cities: number, duo: number, max: number) => {
      const by = c.regionNoun && regions > 1 ? `, geordend per ${noun(c)} en stad` : cities > 1 ? ", geordend per stad" : "";
      if (n === 1) return `${appleOf(storesOf(c.cc)[0])} is de enige Apple Store ${inC(c)}. Schapstand van iPhone Duo, 18 Pro en Pro Max om af te halen: Duo ${duo ? "in het schap" : "uit het schap"}, Pro Max ${max ? "in het schap" : "uit het schap"}.`;
      return `${n$(n)} Apple Stores ${inC(c)}${by}. Schapstand om af te halen: de Duo ligt nu bij ${n$(duo)}, de Pro Max bij ${n$(max)}.`;
    },
    countAnswer: (n: number, spread: string, top: { name: string; count: number }[]) => `${n$(n)} in het overzicht, ${spread}${top.length ? `. Grootste cluster: ${top[0].name}, ${n$(top[0].count)}${top[1] ? `; daarna ${top[1].name}, ${n$(top[1].count)}` : ""}` : ""}.`,
    howMany: (c: Country) => <>De Apple Stores {inC(c)} geteld</>,
    duoNow: (c: Country, n: number, have: Store[]): FaqItem => n === 1 ? ({
      q: `Ligt de iPhone Duo nu in het schap bij de Apple Store ${inC(c)}?`,
      a: have.length === 0 ? "Bij de laatste blik niet. Deze pagina en de schappenkaart passen zich aan zodra de winkel hem weer toont; met de uitvoering op je volglijst hoor je het als eerste." : `Bij de laatste blik wel: ${appleOf(have[0])}.`,
    }) : ({
      q: `In welke Apple Stores ${inC(c)} ligt de iPhone Duo nu?`,
      a: have.length === 0 ? `Bij de laatste blik in geen van de ${n$(n)}. Deze pagina en de schappenkaart passen zich aan zodra er een hem toont; met de uitvoering op je volglijst hoor je het als eerste.` : `Bij de laatste blik in ${n$(have.length)} van de ${n$(n)}: ${have.slice(0, 6).map(appleOf).join(", ")}${have.length > 6 ? " en nog enkele" : ""}.`,
    }),
    faq: (ctx: FaqContext) => placeFaq({ ...ctx, omit: [...(ctx.omit ?? []), "count", "stock", "lasts"] }, L),
    duoBlock: (alert: string) => `Zet de winkels die je kunt halen op je volglijst: [begin een iPhone Duo-volglijst](${alert}). Elke combinatie van winkel en exacte uitvoering is één melding.`,
    intro: (c: Country, n: number, spread: string, now: { duo: number; max: number; pro: number }, tax: string) => n === 1
      ? `${inC(c).replace(/^in/, "In")} staat **1 Apple Store**: ${appleOf(storesOf(c.cc)[0])}, ${spread}. In het schap om af te halen: iPhone Duo **${now.duo ? "ja" : "nee"}**, iPhone 18 Pro Max **${now.max ? "ja" : "nee"}**, 18 Pro **${now.pro ? "ja" : "nee"}**. ${tax}`
      : `${inC(c).replace(/^in/, "In")} staan **${cnt(n, "Apple Store", "Apple Stores")}**, ${spread}. Nu ligt de iPhone Duo bij **${n$(now.duo)}** ervan in het schap, de iPhone 18 Pro Max bij **${n$(now.max)}** en de 18 Pro bij **${n$(now.pro)}**. ${tax}${c.cc === "nl" ? "\n\nIn Rotterdam en Utrecht zit geen Apple Store: Rotterdammers halen het dichtst bij in Den Haag, Utrechters in Amsterdam." : ""}`,
    crumb: "Winkeloverzicht",
    panel: (c: Country) => `Je volglijst ${inC(c)}: eerst de iPhones, dan alleen de winkels die je echt kunt halen`,
    matrixLabel: "Schap per winkel",
    matrixH2: (c: Country) => <>Schaptelling per model {inC(c)}</>,
    matrixHint: "Getoond bij de recentste waarneming / gevolgd, per model.",
    topCaption: (c: Country) => <>{cap(noun(c, true))} gerangschikt op aantal Apple Stores, naar Apples eigen winkellijst</>,
    regionHead: (c: Country) => cap(noun(c)),
    colStores: "Apple Stores",
    colCities: "Steden",
    locationsBy: (c: Country) => `Winkeloverzicht per ${noun(c)}`,
    locationsIn: (c: Country) => `Winkeloverzicht ${inC(c)}`,
    storeCount: (n: number) => <>{cnt(n, "Apple Store", "Apple Stores")}</>,
    storeCountAll: (n: number) => <>{n$(n)} winkels</>,
    whenRestock: (c: Country) => <>Rentreetijden {inC(c)}</>,
    howFast: (c: Country) => <>Hoe lang een rentree {inC(c)} in het schap bleef</>,
    faqTitle: (c: Country) => `Veldvragen over de winkels ${inC(c)}`,
    getApp: "Installeer de webapp",
    howItWorks: "Methodenotities",
    pricing: "Abonnementen en prijzen",
  },

  /* ---------------------------------------------------------------- /iphone-duo-restock-times */
  restockTimes: {
    fmt: {
      n: rtN,
      pct: rtPct,
      date: dateLabel,
      longDate,
      zoneStamp,
      local: localStamp,
      hour: hourLabel,
      range: rangeLabel,
      weekday: (d: number) => WEEKDAYS_NL[d],
      store: (s: Store) => appleOf(s),
      storeWithPlace: (s: Store) => `${cityLabel(s.country ?? "us", s.city, L)} · ${appleOf(s)}`,
    },
    title: (c: Country) => `Rentreetijden iPhone Duo ${inC(c)}: het waarnemingslogboek`,
    metaDescription: (x: RestockTimesMeta) => {
      const { c, t, w, pattern } = x;
      const region = c.cc === "us" ? "staat" : c.regionNoun ? noun(c) : "winkel";
      const since = dateLabel(t.since, false);
      const inStores = oneIn(c) ? `bij de enige Apple Store ${inC(c)}` : `bij Apple Stores ${inC(c)}`;
      return t.n > 0 && pattern
        ? fitT([
          `Sinds ${since} ${rtN(t.n)} iPhone Duo-rentrees ${inStores}, ${rtPct(w.share)} ervan ${between(w.from, w.to)} winkeltijd${t.sellout ? `; ${rtPct(t.sellout.within2min)} lag er korter dan 2 minuten` : ""}. Per uur, dag, ${region}, winkel en uitvoering.`,
          `Sinds ${since} ${rtN(t.n)} iPhone Duo-rentrees ${inStores}, ${rtPct(w.share)} ervan ${between(w.from, w.to)} winkeltijd. Per uur, dag, ${region} en uitvoering.`,
          `Rentreelog iPhone Duo ${inC(c)}: ${rtN(t.n)} rentrees sinds ${since}, per uur, dag, ${region} en uitvoering.`,
        ], 158)
        : t.n > 0
          ? fitT([
            `Sinds ${since} ${rtN(t.n)} genoteerde iPhone Duo-rentrees ${inStores}: per uur op de winkelklok, per dag, per ${region}, winkel en uitvoering, plus hoe lang elke rentree in het schap lag.`,
            `Rentreelog iPhone Duo ${inC(c)}: ${rtN(t.n)} genoteerde rentrees sinds ${since}, per uur, dag, ${region} en uitvoering.`,
          ], 158)
          : `Het waarnemingslogboek van ShelfSpring voor de iPhone Duo ${oneIn(c) ? "bij de enige Apple Store" : "bij de Apple Stores"} ${inC(c)}, bijgehouden sinds ${longDate(t.since)}: per uur, per dag, per winkel en uitvoering.`;
    },
    h1: (x: RestockTimesView) => x.t.unknown
      ? `iPhone Duo-rentrees ${inC(x.c)}: het logboek`
      : x.t.n > 0
        ? `iPhone Duo-rentrees ${inC(x.c)}: ${x.pattern ? `meestal genoteerd ${rangeLabel(x.w.from, x.w.to)}, winkeltijd` : "uur voor uur, zoals waargenomen"}`
        : `iPhone Duo ${inC(x.c)}: nog geen rentree genoteerd — dit houden we bij`,
    intro: (x: RestockTimesView) => {
      const { t, one, tracked, pattern, w } = x;
      const where = inC(x.c);
      return t.unknown ? (
        <>Het rentreelog laadde deze keer niet. De winkels {where} worden gewoon verder bekeken; bij de volgende keer laden staan de cijfers hier weer.</>
      ) : t.n > 0 ? (
        <>
          Sinds {longDate(t.since)} noteerde dit logboek <b className="text-ink">{rtN(t.n)} iPhone Duo-rentrees</b> {one ? "bij de Apple Store" : "bij de Apple Stores"} {where}{tracked > 1 ? <>, verspreid over {rtN(t.days)} van de {rtN(tracked)} dagen</> : <> (pas één meetdag)</>}
          {pattern && <>; <b className="text-ink">{rtPct(w.share)} viel {between(w.from, w.to)}</b> op de winkelklok</>}.
        </>
      ) : (
        <>
          <b className="text-ink">Nog geen rentree genoteerd.</b> Sinds {longDate(t.since)} kijkt ShelfSpring bij {one ? "de Apple Store" : `alle ${rtN(x.stores)} Apple Stores`} {where} naar het afhaalschap, zonder tot nu toe een iPhone Duo-rentree te bevestigen.
        </>
      );
    },
    hero: {
      restocks: (x: RestockTimesView) => `rentrees genoteerd sinds ${dateLabel(x.t.since, false)}`,
      window: (x: RestockTimesView) => `${between(x.w.from, x.w.to)} winkeltijd`,
      days: "dagen met een rentree",
      // English types this as its own two literals: the Dutch pair is cast to the same slot.
      now: ((one: boolean): string => (one ? "winkel toont er nu een om af te halen" : "winkels tonen er nu een om af te halen")) as RT["hero"]["now"],
      today: (x: RestockTimesView, today: DayRow) => `vandaag (${dateLabel(today.date)})${x.one ? "" : `, verspreid over ${cnt(today.stores, "winkel", "winkels")}`}, tot dusver`,
      weekday: "voorlopige piekdag van de week",
    },
    heroPoints: (x: RestockTimesView, latest: { config: string; store: Store; at: string } | null): Point[] => [
      ...(latest ? [{ text: <>Recentste: <b className="text-ink">{latest.config}</b>{x.one ? null : <> in <Link href={storePath(latest.store)} className="underline underline-offset-2">{appleOf(latest.store)}</Link></>}, {localStamp(latest.at, latest.store)} winkeltijd</> }] : []),
      ...(x.t.peakWeekday != null ? [{ text: <>Piekdag van de week: <b className="text-ink">{WEEKDAYS_NL[x.t.peakWeekday]}</b></> }] : []),
      { text: <>Een rentreeschema maakt Apple <b className="text-ink">niet</b> bekend; dit zijn onze eigen bevestigde waarnemingen, ruwweg elke vijf minuten ververst</>, no: true },
    ],
    emptyPoints: (x: RestockTimesView): Point[] => [
      { text: x.one ? <>De winkel toont er nu <b className="text-ink">{x.duoNow ? "een" : "geen"}</b> om af te halen</> : <>Nu {x.duoNow === 1 ? "toont" : "tonen"} <b className="text-ink">{rtN(x.duoNow)} van de {rtN(x.stores)}</b> er een om af te halen</> },
      { text: <>Zodra de eerste rentree bevestigd is, lopen de tabellen hieronder vol</>, step: true },
      { text: <>Uur- en weekdagpatronen met de grootste steekproef: <Link href="/iphone-duo-restock-times" className="underline underline-offset-2">de Amerikaanse pagina</Link></>, step: true },
    ],
    setUpAlert: "Begin een iPhone Duo-volglijst",
    logLive: "Open het rentreelog, live",
    onThisPage: "Onderdelen",
    nav: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": "Uren",
      "day-by-day": "Kalender",
      where: `Plaatsen (${rtRegion(x)})`,
      configuration: "Uitvoeringen",
      "how-long": "Duur in het schap",
      unavailable: "“Niet beschikbaar”?",
      reddit: "Forumclaims",
      method: "Telregels",
    }),
    h2: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": `Op welk uur keert de iPhone Duo terug ${inC(x.c)}?`,
      "day-by-day": `Welke kalenderdagen leverden ${inC(x.c)} een iPhone Duo-rentree op?`,
      where: `In welke Apple Stores ${inC(x.c)} duikt de iPhone Duo het vaakst weer op?`,
      configuration: `Welke iPhone Duo-uitvoering ligt ${inC(x.c)} het vaakst weer in het schap?`,
      "how-long": `Hoe lang ligt een iPhone Duo-rentree ${inC(x.c)} in het schap?`,
      unavailable: "Waarom toont apple.com bij bijna elke Apple Store dat afhalen niet kan?",
      reddit: "Reddit over iPhone Duo-rentrees, naast het logboek gelegd",
      method: "Wanneer noteert ShelfSpring een rentree?",
    }),
    faq: (x: RestockTimesView): Faq[] => {
      const { t, w, pattern, sell, us, weekend, tracked } = x;
      const where = inC(x.c);
      const window = between(w.from, w.to);
      return [
        { q: `Op welk uur duiken iPhone Duo-rentrees ${where} op?`, a: t.n > 0 && pattern
          ? `Vooral in de ochtend: ${rtPct(w.share)} van de ${rtN(t.n)} bevestigde rentrees sinds ${longDate(t.since)} viel ${window} winkeltijd, en ${rtPct(hourShare(t.byHour, 8, 12))} tussen 8:00 en 12:00. Een schema publiceert Apple niet; dit is het patroon in ons logboek, ruwweg elke vijf minuten ververst.`
          : `Apple maakt geen schema bekend, en ShelfSpring noteerde ${where} ${cnt(t.n, "bevestigde rentree", "bevestigde rentrees")} sinds ${longDate(t.since)}${t.days ? `, op ${cnt(t.days, "dag", "dagen")}` : ""}. Pas vanaf ${PATTERN_MIN} rentrees, gespreid over ${PATTERN_MIN_DAYS} dagen, wijst het logboek een vast uur aan; tot dan blijft dat vak bewust open.` },
        { q: `Zijn er ook rentrees op zaterdag en zondag${us ? "" : ` ${where}`}?`, a: t.n > 0
          ? `${weekend > 0 ? "Ja, tot nu toe" : "Nog niet genoteerd"}: op zaterdag of zondag ${weekend === 1 ? "viel" : "vielen"} ${cnt(weekend, "rentree", "rentrees")} van de ${rtN(t.n)}, ofwel ${rtPct(weekend / t.n)}. ${t.peakWeekday != null ? `Voorlopige piekdag: ${WEEKDAYS_NL[t.peakWeekday]}.` : `Een piekdag van de week noemen we pas als de data ${WEEKDAY_MIN_SPAN} dagen omvat; nu zijn het er ${rtN(tracked)}.`}`
          : `Nog geen weekenddata ${where}; de dagtabel op deze pagina loopt vol zodra rentrees bevestigd zijn.` },
        { q: "Vanaf welk uur heeft zelf kijken zin?", a: t.n > 0 && pattern
          ? `Wie liever zelf ververst, opent apple.com vanaf ${hourLabel(w.from)} winkeltijd met afhalen aangevinkt: in dat venster van twee uur viel ${rtPct(w.share)} van de rentrees. ${sell ? `De mediane rentree lag er ${sell.medianSec} seconden` : "Een rentree ligt er doorgaans zo'n minuut"}, dus een volglijst ([zo werken meldingen](/iphone-duo-stock-alerts)) houdt het vol waar verversen opgeeft.`
          : `Zolang er ${where} geen duidelijk patroon is, laat je het wachten aan een volglijst over: de winkels die je kiest blijven dag en nacht in beeld ([zo werken meldingen](/iphone-duo-stock-alerts)).` },
        { q: "Waarom meldt apple.com de iPhone Duo bijna overal als niet beschikbaar?", a: sell
          ? `Een rentree is van korte duur: ${rtPct(sell.within2min)} van de ${rtN(sell.n)} getimede rentrees ${where} lag binnen 2 minuten weer uit het schap, ${rtPct(sell.within20min)} binnen 20. Op dit moment ligt de Duo in ${rtN(x.duoNow)}/${rtN(x.stores)} winkels in het schap; de rest van de tijd geeft apple.com dus terecht “niet beschikbaar” aan ([wat die melding betekent](/apple-store-pickup-availability-explained)).`
          : `Omdat afhaalvoorraad maar enkele minuten zichtbaar blijft. Op dit moment ligt de Duo ${where} in ${rtN(x.duoNow)}/${cnt(x.stores, "winkel", "winkels")} in het schap ([wat die melding betekent](/apple-store-pickup-availability-explained)).` },
        { q: "Hoe krijg ik een seintje zodra mijn winkel de iPhone Duo weer vermeldt?", a: `Zet die winkel met de exacte capaciteit en afwerking op je volglijst; na een bevestigde rentree volgt een melding ([volglijst openen](${x.alert}); [methodenotities](/how-it-works)).` },
      ];
    },
    sources: {
      applePickup: "Apples eigen uitleg, “Levering en ophalen”",
      newsroom: "“iPhone Duo verkrijgbaar in Apple Stores wereldwijd” · persbericht van Apple, 23 oktober 2026",
      macRumors: "“Ophalen in de Apple Store voor de iPhone Duo weer actief in de VS en Canada” · bericht van MacRumors, 24 oktober 2026",
      reports: (tracker: string) => `${tracker}, notities over de iPhone Duo uit de lanceringsweek: buiten dit logboek gehouden en nooit meegeteld`,
    },
    ld: (x: RestockTimesView) => ({
      datasetName: `Aanvultijden van de iPhone Duo in Apple Stores ${inC(x.c)}`,
      description: `Elke bevestigde rentree van de iPhone Duo om af te halen in Apple Stores ${inC(x.c)} sinds ${x.t.since}, met winkel, uitvoering en tijd, uit het waarnemingslogboek van ShelfSpring; samengevat per uur op de winkelklok, dag, ${rtRegion(x)}, winkel en uitvoering.`,
      spatial: `Apple Stores ${inC(x.c)}`,
      measured: ["tijd van aanvulling (lokale tijd van de winkel)", "Apple Store", "opslag en kleur van de iPhone Duo", "seconden tot uitverkocht"],
      size: `${cnt(x.t.n, "aanvulling", "aanvullingen")} in ${cnt(x.t.stores, "winkel", "winkels")}`,
    }),
    crumb: "iPhone Duo-rentreelog",

    // ---- time of day
    timeLead: (x: RestockTimesView) => <b>Venster {rangeLabel(x.w.from, x.w.to)} op de winkelklok: {rtPct(x.w.share)} van alle {rtN(x.t.n)} rentrees. De ochtend van 8:00 tot 12:00 nam er {rtPct(hourShare(x.t.byHour, 8, 12))} voor zijn rekening.</b>,
    busiestHour: (count: number) => `piekuur: ${cnt(count, "rentree", "rentrees")}`,
    morning: "van 8:00 tot 12:00",
    evening: "na 17:00: ook 's avonds gebeurt het",
    night: "van middernacht tot 6:00",
    tooFew: (x: RestockTimesView) => <b>Te vroeg voor een vast uur: {cnt(x.t.n, "bevestigde rentree", "bevestigde rentrees")} op {cnt(x.t.days, "dag", "dagen")} sinds {longDate(x.t.since)}.</b>,
    tooFewKeys: (): Point[] => [
      { text: <>Voor een vast uur zijn <b className="text-ink">{PATTERN_MIN} rentrees verspreid over {PATTERN_MIN_DAYS} dagen</b> nodig</> },
      { text: <>Een golf van tien rentrees tegelijk telt als één gebeurtenis, niet als gewoonte</>, no: true },
      { text: <>Met elke nieuwe meetdag schrijft de pagina zichzelf bij</>, step: true },
    ],
    hourCaption: (x: RestockTimesView) => `Genoteerde iPhone Duo-rentrees ${inC(x.c)} per uur op de winkelklok, ${dateLabel(x.t.since, false)} → vandaag, ${rtN(x.t.n)} in totaal`,
    hourHead: ["Winkeluur (24 u)", "Rentrees", "% van het log"],
    morningKeys: (x: RestockTimesView): Point[] => [
      { text: <>Die ochtendpiek valt <b className="text-ink">niet samen met de opening</b>{x.us ? ": in de VS openen de meeste Apple Stores om 10:00" : ""}</> },
      { text: <>Apple zet afhaalvoorraad <b className="text-ink">online</b> vrij, al voordat de winkel opengaat</> },
      { text: <>Wie zelf kijkt: houd <b className="text-ink">{rangeLabel(x.w.from, x.w.to)}</b> in de gaten op een werkdagochtend</>, step: true },
      { text: <>De <b className="text-ink">overige 22 uur</b> ververst niemand: laat die over aan een <Link href={x.alert}>volglijst</Link></>, step: true },
    ],
    storeChartKeys: (x: RestockTimesView): Point[] => [{ text: <>Elke winkel heeft een eigen urengrafiek op de eigen klok (<Link href={x.storesHref}>{x.us ? "Apple Stores per staat" : `winkeloverzicht ${inC(x.c)}`}</Link>); een winkel die een uur vóór de rest terugkomt, is het weten waard</>, step: true }],

    // ---- day by day
    dayLead: (x: RestockTimesView) => {
      const { t, tracked, one } = x;
      return t.n > 0 && tracked === 1 ? (
        <b>Pas één meetdag, {dateLabel(t.daily[t.daily.length - 1]?.date ?? t.since)}: {cnt(t.n, "bevestigde rentree", "bevestigde rentrees")}{one ? "" : `, verspreid over ${cnt(t.stores, "winkel", "winkels")}`}.</b>
      ) : t.n > 0 ? (
        <b>{t.days === tracked ? `Geen enkele gevolgde dag zonder rentree (${rtN(t.days)} van ${rtN(t.days)})` : `Een rentree op ${rtN(t.days)} van de ${rtN(tracked)} gevolgde dagen sinds ${longDate(t.since)}`}{t.peakWeekday != null ? `; piekdag van de week: ${WEEKDAYS_NL[t.peakWeekday]}` : ""}.</b>
      ) : (
        <b>Sinds {longDate(t.since)} geen bevestigde rentree {inC(x.c)}.</b>
      );
    },
    daysTracked: "gevolgde dagen met een rentree",
    busiestDay: (x: RestockTimesView, day: DayRow) => `piekdatum, ${dateLabel(day.date)}${x.one ? "" : `, verspreid over ${cnt(day.stores, "winkel", "winkels")}`}`,
    busiestDayNone: "piekdatum",
    drop: (x: RestockTimesView, drop: { at: string; restocks: number }) => `winkels met een rentree binnen hetzelfde halfuur, ${zoneStamp(drop.at, x.c)} (${cnt(drop.restocks, "uitvoering", "uitvoeringen")}): van buitenaf oogt dat als één landelijke golf`,
    weekend: (x: RestockTimesView) => `in een weekend (${cnt(x.weekend, "rentree", "rentrees")})`,
    dayCaption: (x: RestockTimesView) => `Genoteerde iPhone Duo-rentrees ${inC(x.c)} per kalenderdag${x.t.reports.length ? ". Rijen met “gemeld” komen uit openbare notities van andere trackers over dagen vóór dit logboek begon; ze vullen de tijdlijn en tellen nergens mee" : ""}`,
    dayHead: { date: "Dag", restocks: "Rentrees", stores: "Winkels", busiest: "Piekuur (24 u)", source: "Genoteerd door" },
    soFar: " · loopt nog",
    reportedBy: (names: string[]) => <>{names.join(" / ")}, gemeld</>,
    dayKeys: (x: RestockTimesView, launch: string, resumed: string): Point[] => [
      { text: <><b className="text-ink">{dateLabel(launch)}</b>: lancering; online bestellingen kregen de eerste toestellen</> },
      { text: <><b className="text-ink">{dateLabel(resumed)}</b>: afhalen in de winkel kon weer{x.us ? " (MacRumors)" : ""}</> },
      x.t.reports.length
        ? { text: <>Rijen met <b className="text-ink">gemeld</b>: lanceringsweeknotities van {x.reportNames.join(" en ")}, nooit opgeteld</> }
        : { text: <>Dit logboek volgt elke winkel {inC(x.c)} sinds <b className="text-ink">{longDate(x.t.since)}</b></> },
      ...(x.t.n > 0 && x.t.peakWeekday == null ? [{ text: <>Een piekdag van de week volgt zodra de data <b className="text-ink">{WEEKDAY_MIN_SPAN} dagen</b> omvat (nu: {rtN(x.tracked)})</>, no: true }] : []),
      { text: <>Let op de kolom <b className="text-ink">winkels</b>: evenveel rentrees over meer winkels verdeeld, geeft jou meer kans</>, step: true },
    ],

    // ---- where
    whereLead: (x: RestockTimesView, hit: { name: string; restocks: number; stores: number; storesTotal: number }[], total: number) => (
      <b>{hit[0].name} voorop: {cnt(hit[0].restocks, "rentree", "rentrees")} bij {rtN(hit[0].stores)} van de {cnt(hit[0].storesTotal, "winkel", "winkels")} daar sinds {dateLabel(x.t.since, false)}{hit[1] ? <>; dan {hit[1].name} ({rtN(hit[1].restocks)})</> : null}{hit[2] ? <> en {hit[2].name} ({rtN(hit[2].restocks)})</> : null}. In {rtN(hit.length)} van de {rtN(total)} {rtRegions(x)} viel minstens één rentree{total - hit.length > 0 ? `, in ${rtN(total - hit.length)} nog niet` : ""}.</b>
    ),
    whereNone: (x: RestockTimesView) => <b>Nog geen bevestigde rentree in een {rtRegion(x)} {inC(x.c)}; de tabel begint bij de eerste.</b>,
    regionCaption: (x: RestockTimesView) => `Genoteerde iPhone Duo-rentrees per ${rtRegion(x)} ${inC(x.c)}, ${dateLabel(x.t.since, false)} → vandaag`,
    regionHead: (x: RestockTimesView) => [cap(rtRegion(x)), "Rentrees", "Winkels met een rentree", "Recentste (winkeltijd)"],
    ofN: (a: number, b: number) => <>{rtN(a)}/{rtN(b)}</>,
    storesCaption: (x: RestockTimesView) => `Winkels met het langste iPhone Duo-rentreelog ${inC(x.c)}, ${dateLabel(x.t.since, false)} → vandaag`,
    storesHead: ["Winkel", "Rentrees", "Dagen met een rentree", "Gebruikelijk uur", "Recentste (winkeltijd)"],
    swaps: (x: RestockTimesView) => [
      { no: "De winkel met de meeste rentrees, waar die ook ligt", yes: `Twee of drie winkels die je ${x.pattern ? `rond ${hourLabel(x.w.from)}` : "'s ochtends"} binnen een uur haalt`, why: "Een rentree die je niet kunt halen, telt voor jou niet; zelfs de drukste winkel staat op een paar minuten per dag na op niet beschikbaar." },
      { no: "Eén winkel, en hopen", yes: "Elk van die winkels op je volglijst, en rijden naar de eerste die afgaat", why: "De telling zegt alleen naar welke van je winkels je als eerste rijdt." },
    ],
    nearMe: "Winkels in je buurt die de Duo nu tonen",

    // ---- configuration
    configLead: (x: RestockTimesView, top: { label: string; restocks: number }, rarest: { label: string; restocks: number } | null) => (
      <b>{top.label} voorop: {rtN(top.restocks)} van de {rtN(x.t.n)} rentrees ({rtPct(top.restocks / x.t.n)}){rarest ? `; achteraan de ${rarest.label}, met ${cnt(rarest.restocks, "rentree", "rentrees")}` : ""}.</b>
    ),
    mostRestocked: (config: string) => `${config}: de uitvoering met de meeste rentrees`,
    versus: (a: string, bCount: number, b: string) => `rentrees ${a}; ${b}: ${rtN(bCount)}`,
    restocksOf: (a: string) => `rentrees ${a}`,
    byStorage: "naar capaciteit",
    byColour: "naar afwerking",
    configNone: (x: RestockTimesView) => <b>Nog geen enkele uitvoering {inC(x.c)} met een bevestigde rentree. Alle acht staan al in de tabel, zodat de eerste meteen een eigen rij heeft.</b>,
    configCaption: (x: RestockTimesView) => `Genoteerde iPhone Duo-rentrees ${inC(x.c)}, één rij per uitvoering, ${dateLabel(x.t.since, false)} → vandaag`,
    configHead: ["Uitvoering", "Rentrees", "% van het log", "Recentste (winkeltijd)"],
    configKeys: (x: RestockTimesView): Point[] => [
      { text: <>De keuze van uitvoering weegt <b className="text-ink">zwaarder dan de keuze van winkel</b></> },
      x.storageRatio != null
        ? { text: <>Kies de capaciteit die het vaakst terugkeert: ruwweg <b className="text-ink">{num(L, x.storageRatio)}×</b> zoveel kans als bij de maat erna</> }
        : { text: <>Kies de capaciteit die het vaakst terugkeert, en je kansen stijgen <b className="text-ink">flink</b></> },
      { text: <>Wie op de <b className="text-ink">2TB</b> mikt, bestelt beter met bezorging en wacht</>, no: true },
      { text: <>Prijzen en wat nu in het schap ligt: <Link href="/which-iphone-duo-restocks-most">Welke iPhone Duo keert het vaakst terug?</Link></>, step: true },
    ],

    // ---- how long
    howLongLead: (x: RestockTimesView, sell: SelloutFacts) => <b>Mediaan {sell.medianSec} seconden: zo lang lag de helft van de {rtN(sell.n)} getimede rentrees {inC(x.c)} in het schap. Binnen 2 minuten weer weg: {rtPct(sell.within2min)}; binnen 20: {rtPct(sell.within20min)}.</b>,
    secUnit: "s",
    medianListing: "mediane tijd in het schap",
    within2: "uit het schap binnen 2 min",
    within20: "uit het schap binnen 20 min",
    fastest: "kortste verblijf gemeten",
    howLongNone: (x: RestockTimesView) => <b>Nog te weinig getimede rentrees {inC(x.c)} voor een meting. Vanaf tien noemen we deze cijfers; de Amerikaanse pagina toont het volledige beeld.</b>,
    howLongKeys: (x: RestockTimesView): Point[] => [
      { text: <>Een venster van twee minuten vang je met een <b className="text-ink">volglijst</b>, niet door apple.com te verversen</> },
      { text: <>Dit getal verklaart al het andere op deze pagina</> },
      { text: <>Elke rentree met de seconden dat hij bleef, per uitvoering en {rtRegion(x)}: <Link href="/iphone-duo-sell-out-times">Hoe lang blijft een iPhone Duo-rentree in het schap?</Link></>, step: true },
    ],
    measured: "Elke duur loopt van de blik die de uitvoering voor het eerst in het schap zag tot de blik die hem weg zag: een bovengrens, dus in werkelijkheid korter.",

    // ---- unavailable
    unavailableLead: (x: RestockTimesView) => <b>Een rentree is een flits, geen toestand. {x.one ? "Eén winkel" : `${rtN(x.stores)} winkels`} × {rtN(x.configs)} uitvoeringen geeft {rtN(x.pairs)} combinaties die {inC(x.c)} in het schap kunnen liggen; op dit moment {x.duoNow === 1 ? "toont 1 winkel" : `tonen ${rtN(x.duoNow)} winkels`} een iPhone Duo.</b>,
    pairs: "combinaties van winkel × uitvoering die in het schap kunnen liggen",
    listingNow: "met nu een iPhone Duo in het schap",
    goneIn2: "van de rentrees binnen twee minuten weer weg",
    last24: "bevestigde rentrees in het laatste etmaal",
    unavailableKeys: (x: RestockTimesView, today: number): Point[] => [
      x.recent.restocks > 0
        ? { text: <>Laatste etmaal: <b className="text-ink">{cnt(x.recent.restocks, "bevestigde rentree", "bevestigde rentrees")}</b> bij {cnt(x.recent.stores, "winkel", "winkels")} {inC(x.c)}</> }
        : today > 0
          ? { text: <>Vandaag: <b className="text-ink">{cnt(today, "bevestigde rentree", "bevestigde rentrees")}</b> {inC(x.c)}</> }
          : { text: <>De dagtabel hierboven toont de rentrees die wél plaatsvonden</> },
      { text: <>Een rentree blijft <b className="text-ink">een minuut of twee</b> zichtbaar op apple.com</> },
      { text: <>“Overal niet beschikbaar” op dag vier, of dag veertien, betekent <b className="text-ink">niet</b> dat Apple ermee ophoudt</>, no: true },
    ],
    unavailableLinks: { explained: "Wat “niet beschikbaar voor ophalen” echt zegt", howToGet: "Een praktische weg naar een iPhone Duo" },

    // ---- reddit
    redditLead: (x: RestockTimesView) => <b>Wat op <a href="https://www.reddit.com/r/applestore/" target="_blank" rel="noopener nofollow">r/applestore</a> en <a href="https://www.reddit.com/r/iphone/" target="_blank" rel="noopener nofollow">r/iphone</a> rondgaat, is meestal goedbedoeld, gaat over één winkel en is na een dag verouderd. Hieronder de vier claims die het vaakst langskomen, naast {rtN(x.t.n)} bevestigde rentrees {inC(x.c)}.</b>,
    redditCaption: "Gangbare Reddit-claims over iPhone Duo-rentrees, naast de bevestigde rentrees in het logboek van ShelfSpring gelegd",
    redditHead: ["Claim", "Wat het logboek laat zien"],
    claims: (x: RestockTimesView): { claim: string; answer: ReactNode }[] => {
      const { t, w, tracked, recent } = x;
      return [
        { claim: "“Winkels vullen 's nachts bij — kijk om 3 uur.”", answer: t.n > 0 ? <>Tussen middernacht en 6:00 winkeltijd viel {rtPct(hourShare(t.byHour, 0, 6))} van de rentrees; {between(w.from, w.to)} was dat {rtPct(w.share)}.</> : "Nog geen rentree om het mee te vergelijken." },
        { claim: "“Apple vult maar één dag per week bij.”", answer: t.n > 0 ? (t.peakWeekday != null ? <>Voorlopige piekdag: {WEEKDAYS_NL[t.peakWeekday]} ({rtN(t.byWeekday[t.peakWeekday])} van {rtN(t.n)}), maar er waren rentrees op {rtN(t.days)} van de {rtN(tracked)} dagen.</> : <>Rentrees op {rtN(t.days)} van de {rtN(tracked)} gevolgde dagen{t.days === tracked ? ", geen enkele dag leeg" : ""}; een piekdag van de week noemen we zodra de data {WEEKDAY_MIN_SPAN} dagen omvat.</>) : "Nog geen rentree om het mee te vergelijken." },
        { claim: "“Gewoon de winkel opbellen: die weet wanneer de zending binnenkomt.”", answer: "Een leverschema publiceert Apple niet. Wat op apple.com opduikt, is afhaalvoorraad die online wordt vrijgegeven, en het personeel ziet die op hetzelfde ogenblik als jij." },
        { claim: "“Niet beschikbaar betekent: voorgoed op.”", answer: recent.restocks > 0 ? <>Het laatste etmaal telde {cnt(recent.restocks, "bevestigde rentree", "bevestigde rentrees")} bij {cnt(recent.stores, "winkel", "winkels")}; elk ervan sprong binnen minuten terug naar “niet beschikbaar”.</> : t.n > 0 ? <>Sinds {dateLabel(t.since, false)}: {cnt(t.n, "bevestigde rentree", "bevestigde rentrees")}; elk ervan sprong binnen minuten terug naar “niet beschikbaar”.</> : "Nog niets om het mee te vergelijken." },
      ];
    },
    redditKeys: (): Point[] => [
      { text: <>Geruchten vullen het gat als er <b className="text-ink">geen data</b> is; deze pagina is de data, vrij te lezen</> },
      { text: <>Op één punt klopt Reddit: <b className="text-ink">snel afrekenen</b> — al ingelogd, Apple Pay klaarstaan (<Link href="/how-to-grab-an-iphone-duo-restock">onze versie van 20 seconden</Link>)</> },
    ],

    // ---- method
    methodLead: <b>Een rentree wordt genoteerd wanneer apple.com een uitvoering ter afhaling toont in een winkel waar die eerst ontbrak, en twee opeenvolgende blikken dat bevestigen.</b>,
    methodKeys: (x: RestockTimesView): Point[] => [
      { text: <>{x.one ? "De Apple Store" : "Elke Apple Store"} {inC(x.c)} elke <b className="text-ink">{SPEED.checkSec} seconden</b> bekeken</> },
      { text: <>Een eerste “beschikbaar” wordt <b className="text-ink">ruwweg een seconde later</b> opnieuw gevraagd voordat het telt</> },
      { text: <>Verdwijnt een uitvoering uit het schap, dan bevestigt de <b className="text-ink">volgende ronde</b> dat</> },
      { text: <>De eerste blik op een winkel, een mislukte of verlopen aanvraag: <b className="text-ink">nooit</b> een rentree, nooit “uit het schap”</>, no: true },
      { text: <>Uren en datums op de <b className="text-ink">winkelklok</b> van elke winkel; “golven” = hetzelfde halfuur over tijdzones heen</> },
      { text: <>Notities van andere trackers{x.t.reports.length ? ` (${x.reportNames.join(", ")})` : ""}: eigen, gemarkeerde rijen, <b className="text-ink">nooit in een totaal</b></> },
      { text: <>Ruwweg elke vijf minuten ververst; <Link href={x.logHref}>het rentreelog</Link> zelf is live</>, step: true },
    ],
    quote: "Je mag deze cijfers citeren met een link naar deze pagina; ShelfSpring is een onafhankelijk logboek zonder band met Apple en leest dezelfde afhaalbeschikbaarheid die iedereen op apple.com kan zien.",
    alertIn: (x: RestockTimesView) => <>iPhone Duo op je volglijst{x.one ? "" : ` ${inC(x.c)}`}</>,

    // ---- related, FAQ, sources
    related: "Meer uit hetzelfde logboek",
    sameData: "Vragen die dit logboek beantwoordt",
    questions: {
      sellOut: "Hoe lang blijft een rentree in het schap?",
      alerts: "Als eerste horen van een rentree",
      howToGet: "Een praktische route naar een toestel",
      whichConfig: "Welke uitvoering keert het vaakst terug",
      nearMe: "Welke winkels in de buurt hem nu tonen",
      unavailable: "“Momenteel niet beschikbaar” lezen",
    },
    otherCountries: ((us: boolean): string => (us ? "Dit onderzoek in andere landen" : "Logboeken van andere landen")) as RT["otherCountries"],
    faqTitle: "Veldvragen",
  },
};

export const views: Dict["views"] = withShelfViews("nl", baseViews);
