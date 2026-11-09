import { withShelfViews } from "@/lib/seo/localizedCopy";
/**
 * Swedish strings: views — the product × place pages, the return log, the pickup map, the iPhone Duo return-times
 * study and the store index. A restock is an "återkomst"; <title>, meta and JSON-LD strings keep their wording. `c: Country` is English data: Sweden is named with countryLabel ("Sverige").
 * Store and Place objects are English data too; names are written with Apple Sweden's forms (places.ts).
 * Check intervals are only ever 15 and 5 seconds; no refund wording.
 */
import type { ReactNode } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import type { Point } from "@/components/ui/Viz";
import type { Faq } from "@/lib/content/types";
import { catalogFor, storePath, storesOf, type Store } from "@/lib/apple/catalog";
import type { Country, CountryCode } from "@/lib/apple/countries";
import { faq as placeFaq, peakOf, type FaqContext, type FaqItem } from "@/lib/seo/enrich";
import type { Place, PlaceLevel, Product } from "@/lib/seo/products";
import type { StoreLine } from "@/lib/seo/productData";
import type { PlaceStats, RestockStats } from "@/lib/stock/queries";
import { hourShare, type DayRow, type SelloutFacts } from "@/lib/content/restockTimes";
import { PATTERN_MIN, PATTERN_MIN_DAYS, WEEKDAY_MIN_SPAN, localStamp } from "@/lib/content/siteFacts";
import { SPEED } from "@/lib/plans";
import { distance, stamp, weekdays } from "@/lib/i18n/format";
import { cityLabel, regionLabel } from "@/lib/i18n/places";
import type { Dict } from "../en";
import type { RestockTimesMeta, RestockTimesView } from "../en/views";
import { SV, about, apple, between, cap, color, dur, fit, klock, kr, land, n, noun, pl, prod, range, share, taxNote, words } from "./util";

/* ---------------------------------------------------------------- helpers */

const WD = weekdays(SV);
/** "tors 29 okt." from a calendar day, or "29 okt." without the weekday. */
const dateLabel = (ymd: string, weekday = true) => new Intl.DateTimeFormat("sv-SE", { timeZone: "UTC", month: "short", day: "numeric", ...(weekday ? { weekday: "short" as const } : {}) }).format(new Date(`${ymd}T12:00:00Z`));
/** "29 oktober 2026". */
const longDate = (ymd: string) => new Intl.DateTimeFormat("sv-SE", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${ymd}T12:00:00Z`));
/** "27 okt. 9:30 CET": an instant in the country's reference zone. */
const zoneStamp = (iso: string, c: Country) => stamp(SV, iso, c.timeZone, true);
const rtRegion = (x: { us: boolean; c: Country }) => (x.us ? "delstat" : noun(x.c));
const rtRegions = (x: { us: boolean; c: Country }) => (x.us ? "delstater" : noun(x.c, true));
const rtYet = (x: RestockTimesMeta) => (x.t.n > 0 ? "" : " ännu");
/** "Ingen"/"Inget" before a region word (område, departement and emirat are neuter). */
const none = (word: string) => (/^(område|departement|emirat)/.test(word) ? "Inget" : "Ingen");
/** Kept for the <title>/meta/JSON-LD strings, which stay as they were. */
const restocksN = (k: number) => pl(k, "påfyllning", "påfyllningar");
const confirmedN = (k: number) => pl(k, "bekräftad påfyllning", "bekräftade påfyllningar");
/** The register's own words: a restock is an "återkomst". */
const returnsN = (k: number) => pl(k, "återkomst", "återkomster");
const confirmedRN = (k: number) => pl(k, "bekräftad återkomst", "bekräftade återkomster");
/** "Valfri delstat" / "Valfritt område" (område, departement and emirat are neuter). */
const anyOf = (word: string) => (/^(område|departement|emirat)/.test(word) ? `Valfritt ${word}` : `Valfri ${word}`);
const storesN = (k: number) => pl(k, "butik", "butiker");
const inLand = (c: Country) => `i ${land(c.cc)}`;
/** "Apple X" from a bare store name. */
const appleOf = (name: string) => (/^apple\b/i.test(name) ? name : `Apple ${name}`);
/** A place in Swedish (Place objects carry English names). */
function placeName(place: Place): string {
  const cc: CountryCode = place.country ?? "us";
  if (place.level === "country") return land(cc);
  if (place.level === "state") return regionLabel(cc, place.state!, SV);
  if (place.level === "city") return cityLabel(cc, place.city!, SV);
  return apple(place.store!);
}

/* ---------------------------------------------------------------- product × place */

function productTitle(product: Product, place: Place, inStock: number): string {
  const k = place.stores.length;
  const cc: CountryCode = place.country ?? "us";
  const name = prod(product.name);
  const short = prod(product.short);
  if (place.level === "country") {
    const w = land(cc);
    return fit([
      ...(inStock > 0 ? [`${name} i lager i ${pl(inStock, "Apple Store", "Apple Store-butiker")} i ${w}`] : []),
      `${name} att hämta i ${w}, live`,
      `${short} att hämta i ${w}`,
      `${short} att hämta`,
    ]);
  }
  if (place.level === "store") {
    const s = place.store!;
    const a = apple(s);
    return fit([`${name} på ${a}: ${inStock > 0 ? "i lager nu" : "lager för hämtning"}`, `${short} på ${a}, ${cityLabel(cc, s.city, SV)}`, `${short} på ${a}`, `${short} på ${s.name}`, `${short} · ${s.name}`]);
  }
  const w = placeName(place);
  return fit([`${name} i lager i ${w}: ${inStock} av ${k}`, `${name} i ${w}: lager för hämtning`, `${short} i lager i ${w}`, `${short} i ${w}`]);
}

function productDescription(product: Product, place: Place, inStock: number, stats: PlaceStats): string {
  const cc: CountryCode = place.country ?? "us";
  const name = prod(product.name);
  const week = `${restocksN(stats.week)} den här veckan`;
  if (place.level === "store") {
    const s = place.store!;
    const a = apple(s);
    return fit([
      `${name} att hämta på ${a}, ${cityLabel(cc, s.city, SV)}: ${inStock > 0 ? "i lager nu" : "inte i lager just nu"}, ${week}. Status live, påfyllningstider och bevakningar.`,
      `${name} på ${a}: ${inStock > 0 ? "i lager nu" : "inte i lager nu"}, ${week}. Status live och bevakningar.`,
    ], 155);
  }
  const where = place.level === "country" ? `Apple Store-butiker i ${land(cc)}` : `Apple Store-butiker i ${placeName(place)}`;
  return fit([
    `${name} att hämta: ${inStock} av ${place.stores.length} ${where} har den nu, ${week}. Live per butik, påfyllningstider och bevakningar.`,
    `${name}: ${inStock} av ${place.stores.length} ${where} har den nu, ${week}. Live per butik och bevakningar.`,
  ], 155);
}

function productFaq(product: Product, place: Place, lines: StoreLine[], stats: PlaceStats, clock: RestockStats, nearest: { name: string; city: string; distance: number } | null): FaqItem[] {
  const cc: CountryCode = place.country ?? "us";
  const out: FaqItem[] = [];
  const name = prod(product.name);
  const at = place.level === "store" ? `hos ${apple(place.store!)}` : `i ${placeName(place)}`;
  const away = nearest ? `${appleOf(nearest.name)} i ${nearest.city}, ${distance(SV, cc, nearest.distance)} härifrån` : "";
  const inStock = lines.filter((l) => l.available.length > 0);
  if (place.level === "store") {
    const l = lines[0];
    out.push({
      q: `Står ${name} på hyllan ${at}?`,
      a: l && l.available.length > 0
        ? `Ja${product.parts.length > 1 ? `: ${words(l.available.map((i) => `${i.storage} ${color(i.color)}`), 4)}` : ""}, vid senaste observationen.`
        : `Inte vid senaste observationen${nearest ? `; närmaste butik som listar den är ${away}` : ""}.`,
    });
  } else {
    out.push({
      q: `Var ${at} står ${name} på hyllan?`,
      a: inStock.length === 0
        ? `Ingenstans vid senaste observationen${nearest ? `; närmast är ${away}` : ""}.`
        : `${storesN(inStock.length)} vid senaste observationen: ${words(inStock.map((l) => apple(l.store)), 4)}.`,
    });
  }
  const peak = peakOf(clock, SV);
  out.push({
    q: `Hur ofta kommer ${name} tillbaka på hyllan ${at}?`,
    a: stats.month === 0 ? `Ingen återkomst loggad ${at} på ${stats.days} dagar.` : `${returnsN(stats.month)} på ${stats.days} dagar, ${n(stats.week)} av dem den här veckan${peak ? `; de flesta runt ${peak.hour} lokal tid` : ""}.`,
  });
  if (stats.medianMs != null) out.push({ q: `Hur länge ligger den på hyllan ${at}?`, a: `${cap(about(stats.medianMs))} i median innan den är borta igen.` });
  return out;
}

function priceLabel(product: Product): string {
  const cc: CountryCode = product.country ?? "us";
  const prices = catalogFor(product.model, cc).filter((c) => product.parts.includes(c.partNumber)).map((c) => c.price);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  return lo === hi ? kr(cc, lo) : `${kr(cc, lo)}–${kr(cc, hi)}`;
}

/* ---------------------------------------------------------------- views */

const baseViews: Dict["views"] = {
  common: {
    inCountry: (c: Country) => inLand(c),
    liveMap: "Hämtningskarta",
    restockLog: "Återkomstregister",
    alertMe: "Lägg på bevakningslistan",
    lastDays: (days: number) => <>Återkomstkalender, {days} dagar</>,
    since: "2 november 2026",
    sourcesWhere: (k: number, c: Country) => (k === 1 ? `den enda observerade Apple Store-butiken ${inLand(c)}` : `${k} observerade Apple Store-butiker ${inLand(c)}`),
    checker: (c: Country) => `Hämtningsregister för ${land(c.cc)}`,
    appleStoresIn: (c: Country) => `Butikskatalogen ${inLand(c)}`,
    storesWithIt: "butiker som listar den",
    more: "Också i registret",
  },

  /* ---------------------------------------------------------------- /stock/{product}/{place…} */
  product: {
    title: productTitle,
    description: productDescription,
    faq: productFaq,
    priceLabel,
    inPlace: (name: string, level: PlaceLevel) => (level === "store" ? `hos ${name}` : `i ${name}`),
    h1Country: (model: string, c: Country) => `${prod(model)} på hyllan ${inLand(c)}`,
    h1Place: (model: string, where: string) => `${prod(model)} ${where}`,
    inStockNow: "På hyllan nu",
    yes: "Listad",
    no: "Ej listad",
    pickup: "hämtningssvar",
    configurations: "listade konfigurationer",
    ofStores: (k: number) => `i ${n(k)} observerade ${k === 1 ? "butik" : "butiker"}`,
    restocks24h: "Återkomster, senaste dygnet",
    restocksHint: (week: number, month: number, days: number) => `7 d: ${n(week)} · ${days} d: ${n(month)}`,
    sellOuts: (days: number) => `Av hyllan igen · ${days} d`,
    stays: (ms: number) => { const d = dur(ms); return /^(under|kortare)\b/.test(d) ? `median på hyllan ${d}` : `median på hyllan ≈${d}`; },
    noPairs: "ingen avslutad vistelse än",
    lastRestock: "Senaste återkomst",
    noneYet: "inte sedd än",
    thisConfig: "just den här konfigurationen",
    inDays: (days: number) => `ingen inom ${days} dagar`,
    notInStockNow: "Borta från hyllan nu",
    configsInStock: (k: number, of: number) => <span><b className="text-ink">{k}</b>/{of} konfigurationer på hyllan</span>,
    inStockAt: (k: number, of: number) => <span>På hyllan i <b className="text-ink">{k}</b>/{of} {of === 1 ? "butik" : "butiker"}</span>,
    checked: (live: ReactNode, price: string, tax: string) => <>{price}{tax} · senaste observation {live}</>,
    taxNote: (c: Country) => taxNote(c),
    beforeTax: "exkl. skatt",
    buyOnApple: "Beställ via apple.com",
    allStoresIn: (c: Country) => `Butikskatalog ${inLand(c)}`,
    everyIphoneHere: "Alla tre iPhone här",
    everyIphone: (where: string) => `Alla tre iPhone ${where}`,
    panel: (model: string, where: string | null) => `Bevakningslista för ${prod(model)}${where ? ` ${where}` : ""}: konfigurationer först, sedan butikerna du når`,
    unitConfigs: "konfigurationer",
    unitStores: "butiker",
    otherConfigsHere: "Andra versioner i den här butiken",
    byStorageColor: "Kapacitet först, sedan färg",
    nearestStores: "Butiker närmast",
    closest: (link: ReactNode, dist: string) => <>Närmaste butik som listar den: {link} ({dist})</>,
    storeCity: (store: string, city: string) => <>{store} ({city})</>,
    mostRecentlyInStock: "Där den senast sågs",
    storesWithItNow: "Butiker som listar den i dag",
    storesIn: (where: string) => `Butikerna ${where}`,
    colStatus: "hylla",
    colConfigs: "listade konfigurationer",
    noStoreHasIt: "Vid senaste observationen listar ingen butik den.",
    noStoreHereHasIt: "Vid senaste observationen listar ingen av de här butikerna den.",
    moreStores: (k: number) => <>{k} butiker till listar den · öppna hela butikskatalogen ↗</>,
    byRegion: (c: Country) => `Uppdelat per ${noun(c)}`,
    byCity: "Uppdelat per stad",
    nearbyStores: "Reservbutiker",
    latestChanges: "Nyaste noteringarna i registret",
    nothingLogged: "Registret är tomt än så länge.",
    whenRestocks: "Klocktimmar för återkomster",
    howFast: "Hur länge listningarna låg uppe",
    restocksByConfig: "Återkomster per konfiguration",
    faqTitleCountry: (model: string, c: Country) => `Fältfrågor · ${prod(model)} ${inLand(c)}`,
    faqTitle: (model: string, where: string) => `Fältfrågor · ${prod(model)} ${where}`,
    buySource: (model: string, c: Country) => `apple.com (${land(c.cc)}): beställningssidan för ${prod(model)}`,
    nearby: "Platser runt omkring",
    otherRegions: (c: Country) => `Fler ${noun(c, true)}`,
    elsewhereIn: (region: string) => `Mer av ${region}`,
    everyAppleStoreIn: (c: Country) => `Hela butikskatalogen ${inLand(c)}`,
    across: (model: string, c: Country) => `${prod(model)} · hela ${land(c.cc)}`,
    itemList: (model: string, where: string) => `${prod(model)} ${where}`,
    nearLead: (c: Country, model: string, inStock: number, k: number, have: { store: string; city: string; configs: number }[]) =>
      inStock === 0
        ? `Ingen Apple Store ${inLand(c)} listar ${model} för hämtning just nu, så närhet handlar om vilken butik som får nästa återkomst. Lägg butikerna du når på bevakningslistan.`
        : `${model} står på hyllan i ${inStock} av ${k} butiker: ${words(have.slice(0, 5).map((l) => `${l.store} i ${l.city} (${pl(l.configs, "konfiguration", "konfigurationer")})`), 5)}.`,
    nearHead: (c: Country) => [cap(noun(c)), "Butiker som listar den nu"],
    nearCaption: (c: Country, model: string) => `${model} på hyllan per ${noun(c)}, vid senaste observationen`,
    nearMe: (_c: Country, model: string, alert: string) => `Vill du se butikerna sorterade från där du står: öppna bevakningslistan på sidan och välj Hitta mig – avstånden är uppskattade vägavstånd i kilometer, och varje butik har en rutt. [Följ ${model}](${alert}).`,
    modelFaq: (c: Country, model: string, low: number, high: number, inStock: number): { price: FaqItem; reserve: FaqItem } => ({
      price: { q: `Vilket pris har ${model} ${inLand(c)}?`, a: `${kr(c.cc, low)} för minsta lagringen upp till ${kr(c.cc, high)} för den största, enligt apple.com (${taxNote(c)}).` },
      reserve: { q: `Går det att hålla en ${model} för hämtning ${inLand(c)}?`, a: `Bara genom att beställa den. En konfiguration blir din när du slutför kassan på apple.com med hämtning i butik vald; sedan håller Apple den till den tid du valt.${inStock === 0 ? " Vid senaste observationen listar ingen butik den, så en plats på bevakningslistan är hur du hör det först." : ""}` },
    }),
  },

  /* ---------------------------------------------------------------- /restocks */
  restocks: {
    metaTitle: (c: Country, k: number) => `Påfyllningslogg för iPhone ${inLand(c)} – ${k === 1 ? "Apple Store" : `alla ${k} butiker`}, live`,
    metaDescription: (c: Country, k: number) => `Varje påfyllning av iPhone Duo, 18 Pro och Pro Max för hämtning i ${k === 1 ? "Apple Store-butiken" : "Apple Store-butikerna"} ${inLand(c)}, med exakt tid, konfiguration och karta.`,
    h1: (c: Country) => `Påfyllningslogg: ${land(c.cc)}`,
    summary: (day: number, week: number, model?: string, region?: string) => <>Senaste dygnet: {returnsN(day)}; senaste sju dagarna: {n(week)}{model ? ` · ${model}` : ""}{region ? ` · ${region}` : ""}. Klockslagen följer din enhet.</>,
    allModels: "Varje modell",
    restocks: "Bara återkomster",
    withSoldOut: "Återkomster och tömda hyllor",
    regionLabel: (c: Country) => cap(noun(c)),
    allRegions: (c: Country) => anyOf(noun(c)),
    filter: "Tillämpa",
    page: (k: number) => <>blad {k}</>,
    newer: "← Färskare",
    older: "Tidigare →",
    getAlerts: "Starta en bevakningslista",
    byPlace: "Återkomstregister per plats",
    byRegion: (c: Country) => `Uppdelat per ${noun(c)}`,
    datasetName: (c: Country) => `Påfyllningslogg för iPhone att hämta i Apple Store, ${land(c.cc)}`,
    datasetDescription: (c: Country) => `Varje bekräftad påfyllning av iPhone Duo, iPhone 18 Pro och iPhone 18 Pro Max för hämtning i butik, och när den tog slut, i ${c.cc === "us" ? "alla 269 Apple Store-butiker i USA" : `Apple Store-butikerna ${inLand(c)}`}, med butik, exakt konfiguration och tid. En påfyllning loggas först efter två samstämmiga svar från apple.com, som kollas var 15:e sekund (var 5:e för butiker med bevakning).`,
    datasetMeasured: ["Apple Store", "iPhone-modell, lagring och färg", "tid för påfyllning", "tid då den tog slut"],
  },

  /* ---------------------------------------------------------------- /map */
  map: {
    metaTitle: (c: Country, k: number) => `Livekarta: iPhone Duo att hämta i ${k === 1 ? "Apple Store" : "alla butiker"} ${inLand(c)}`,
    metaDescription: (c: Country, k: number) => `Livekarta över ${k === 1 ? "Apple Store-butiken" : `alla ${k} Apple Store-butiker`} ${inLand(c)} med iPhone Duo, 18 Pro och Pro Max att hämta just nu, per lagring och färg.`,
    // Data for the map component (it looks the region word up by this English key).
    // Data for the map component (it looks the region word up by this English key).
    country: (c: Country) => ({ name: c.name, inName: c.inName, regionNoun: c.regionNoun, regionNounPlural: c.regionNounPlural }),
    everyStore: "Butikskatalog",
    storeCity: (store: string, city: string) => `${city} · ${store}`,
  },

  /* ---------------------------------------------------------------- /{cc}/stores */
  storesIndex: {
    metaDescription: (c: Country, k: number, regions: number, cities: number, duo: number, max: number) => {
      const named = words(storesOf(c.cc).map((s) => { const nm = apple(s).replace(/^Apple /, ""); const city = cityLabel(c.cc, s.city, SV); return nm.includes(city) ? nm : `${nm} (${city})`; }));
      const by = c.regionNoun && regions > 1 ? ` per ${noun(c)} och stad` : cities > 1 ? " per stad" : "";
      return fit([
        ...(k <= 4 ? [`Alla ${k} Apple Store-butiker ${inLand(c)}: ${named}. iPhone att hämta live – ${duo} har iPhone Duo nu, ${max} har Pro Max.`] : []),
        `Alla ${k} Apple Store-butiker ${inLand(c)}${by}, med iPhone Duo, 18 Pro och Pro Max att hämta live: ${duo} har Duo nu, ${max} har Pro Max.`,
      ], 160);
    },
    countAnswer: (k: number, spread: string, top: { name: string; count: number }[]) => {
      const most = top.length && top[0].count > 1 && (!top[1] || top[0].count > top[1].count) ? `. Största klustret: ${top[0].name}, ${top[0].count}${top[1] ? `; därefter ${top[1].name}, ${top[1].count}` : ""}` : "";
      const sthlm = /Solna/.test(spread) && /Täby/.test(spread) ? ". Stockholmsbutikerna ligger i Solna (Mall of Scandinavia) och Täby (Täby Centrum) – innerstaden har ingen egen" : "";
      return `${k} i katalogen, ${spread}${most}${sthlm}.`;
    },
    howMany: (c: Country) => <>Antal Apple Store-butiker {inLand(c)}</>,
    duoNow: (c: Country, k: number, have: Store[]): FaqItem => ({
      q: `Var ${inLand(c)} står iPhone Duo på hyllan just nu?`,
      a: have.length === 0
        ? `Ingen av de ${k} vid senaste observationen. Sidan och kartan visar det så fort någon listar den, och bevakningslistan hör av sig först.`
        : `${have.length} av de ${k} vid senaste observationen: ${have.length > 6 ? `${have.slice(0, 6).map((x) => apple(x)).join(", ")} m.fl.` : words(have.map((x) => apple(x)))}.`,
    }),
    faq: (ctx: FaqContext) => placeFaq({ ...ctx, omit: [...(ctx.omit ?? []), "count", "stock", "lasts"] }, SV),
    duoBlock: (alert: string) => `En plats på bevakningslistan i butikerna du når: [följ iPhone Duo](${alert}). Varje butik × exakt konfiguration är en avisering.`,
    intro: (c: Country, k: number, spread: string, now: { duo: number; max: number; pro: number }, tax: string) =>
      `${cap(land(c.cc))} · **${pl(k, "Apple Store", "Apple Store-butiker")}**, ${spread}${/Solna/.test(spread) && /Täby/.test(spread) ? " – Solna och Täby är Stockholmsbutikerna" : ""}. På hyllan just nu: iPhone Duo i **${now.duo}**, iPhone 18 Pro Max i **${now.max}**, 18 Pro i **${now.pro}**. ${tax}`,
    crumb: "Butikskatalog",
    panel: (c: Country) => `Din bevakningslista ${inLand(c)}: telefoner först, sedan bara butikerna du kan nå`,
    matrixLabel: "Hyllan butik för butik",
    matrixH2: (c: Country) => <>Hyllsiffror per modell {inLand(c)}</>,
    matrixHint: "Listat vid senaste observationen / följda, per modell.",
    topCaption: (c: Country) => <>{cap(noun(c, true))} med flest butiker (Apples egen butikslista, så som registret följer den)</>,
    regionHead: (c: Country) => cap(noun(c)),
    colStores: "Butiker",
    colCities: "Städer",
    locationsBy: (c: Country) => `Butikskatalog, ${noun(c)} för ${noun(c)}`,
    locationsIn: (c: Country) => `Butikskatalog ${inLand(c)}`,
    storeCount: (k: number) => <>{k} {k > 1 ? "Apple Store-butiker" : "Apple Store"}</>,
    storeCountAll: (k: number) => <>{k} Apple Store-butiker</>,
    whenRestock: (c: Country) => <>Tider för återkomster {inLand(c)}</>,
    howFast: (c: Country) => <>Hur länge listningarna låg uppe {inLand(c)}</>,
    faqTitle: (c: Country) => `Fältfrågor om butikerna ${inLand(c)}`,
    getApp: "Installera webbappen",
    howItWorks: "Metodanteckningar",
    pricing: "Planer och priser",
  },

  /* ---------------------------------------------------------------- /iphone-duo-restock-times */
  restockTimes: {
    fmt: {
      n,
      pct: share,
      date: dateLabel,
      longDate,
      zoneStamp,
      local: (iso: string, store: Pick<Store, "storeNumber" | "country" | "timeZone" | "state">) => localStamp(iso, store, SV),
      hour: (h: number) => klock(h),
      range,
      weekday: (d: number) => WD[d],
      store: (s: Store) => apple(s),
      storeWithPlace: (s: Store) => `${cityLabel(s.country, s.city, SV)} · ${apple(s)}`,
    },
    title: (c: Country) => `När fyller Apple på iPhone Duo ${inLand(c)}?`,
    metaDescription: (x: RestockTimesMeta) => {
      const { c, t, w, pattern } = x;
      const region = c.cc === "us" ? "delstat" : c.regionNoun ? noun(c) : "butik";
      const since = dateLabel(t.since, false);
      return t.n > 0 && pattern
        ? fit([
          `${restocksN(t.n)} av iPhone Duo i Apple Store-butiker ${inLand(c)} sedan ${since}: ${share(w.share)} ${between(w.from, w.to)} lokal tid${t.sellout ? `, ${share(t.sellout.within2min)} borta inom 2 minuter` : ""}. Tabeller per timme, dag, ${region}, butik och konfiguration.`,
          `${restocksN(t.n)} av iPhone Duo i Apple Store-butiker ${inLand(c)} sedan ${since}: ${share(w.share)} ${between(w.from, w.to)} lokal tid. Tabeller per timme, dag, ${region} och konfiguration.`,
          `När iPhone Duo fylls på ${inLand(c)}: ${restocksN(t.n)} sedan ${since}, per timme, dag, ${region} och konfiguration.`,
        ], 158)
        : t.n > 0
          ? fit([
            `${confirmedN(t.n)} av iPhone Duo i Apple Store-butiker ${inLand(c)} sedan ${since}, från kontroller var ${SPEED.checkSec}:e sekund: per lokal timme, dag för dag, per ${region}, butik och konfiguration, och hur länge varje varade.`,
            `När iPhone Duo fylls på ${inLand(c)}: ${confirmedN(t.n)} sedan ${since}, per timme, dag, ${region} och konfiguration.`,
          ], 158)
          : fit([`När Apple Store-butikerna ${inLand(c)} fyller på iPhone Duo, enligt våra egna kontroller var ${SPEED.checkSec}:e sekund sedan ${dateLabel(t.since, false)}: timme för timme, dag för dag och per butik.`, `När iPhone Duo fylls på ${inLand(c)}: kontroller var ${SPEED.checkSec}:e sekund sedan ${dateLabel(t.since, false)}, timme för timme och per butik.`], 158);
    },
    h1: (x: RestockTimesView) => x.t.unknown
      ? `När fyller Apple på iPhone Duo ${inLand(x.c)}?`
      : x.t.n > 0
        ? `Fyller Apple fortfarande på iPhone Duo ${inLand(x.c)}? Ja – här är när, timme för timme`
        : `Fyller Apple på iPhone Duo ${inLand(x.c)}? Inte än enligt våra kontroller – det här bevakar vi`,
    intro: (x: RestockTimesView) => {
      const { t, one, tracked, pattern, w } = x;
      const where = inLand(x.c);
      return t.unknown ? (
        <>Återkomstregistret kunde inte läsas för den här visningen; butikerna {where} läses fortfarande av, och siffrorna är tillbaka vid nästa laddning.</>
      ) : t.n > 0 ? (
        <>
          <b className="text-ink">{confirmedRN(t.n)} sedan {longDate(t.since)}</b> {one ? "i butiken" : "i butikerna"} {where}{tracked > 1 ? <>, fördelade på {t.days} av {tracked} följda dagar</> : <> (registret har en enda dag hittills)</>}
          {pattern && <>; <b className="text-ink">{share(w.share)} av dem loggades {between(w.from, w.to)}</b> enligt butikens klocka</>}.
        </>
      ) : (
        <>
          <b className="text-ink">Ingen återkomst i registret än.</b> Sedan {longDate(t.since)} har ShelfSpring följt {one ? "butiken" : `alla ${x.stores} butikerna`} {where} utan att bekräfta någon återkomst av iPhone Duo för hämtning.
        </>
      );
    },
    hero: {
      restocks: (x: RestockTimesView) => `loggade återkomster sedan ${dateLabel(x.t.since, false)}`,
      window: (x: RestockTimesView) => `${between(x.w.from, x.w.to)}, butikens klocka`,
      days: "dagar med minst en återkomst",
      // English infers a literal return type here; the Swedish words are the same shape.
      now: ((one: boolean) => (one ? "butik listar en just nu" : "butiker listar en just nu")) as unknown as Dict["views"]["restockTimes"]["hero"]["now"],
      today: (x: RestockTimesView, today: DayRow) => `i dag (${dateLabel(today.date)})${x.one ? "" : `, i ${storesN(today.stores)}`}, hittills`,
      weekday: "veckodagen som leder hittills",
    },
    heroPoints: (x: RestockTimesView, latest: { config: string; store: Store; at: string } | null): Point[] => [
      ...(latest ? [{ text: <>Senast: <b className="text-ink">{latest.config}</b>{x.one ? null : <> hos <Link href={storePath(latest.store)} className="underline underline-offset-2">{apple(latest.store)}</Link></>}, {localStamp(latest.at, latest.store, SV)} enligt butikens klocka</> }] : []),
      ...(x.t.peakWeekday != null ? [{ text: <>Veckodag som leder: <b className="text-ink">{WD[x.t.peakWeekday]}</b></> }] : []),
      { text: <>Apple publicerar <b className="text-ink">ingen kalender för återkomster</b>; det här är registrets egna bekräftade observationer, uppdaterade ungefär var femte minut</>, no: true },
    ],
    emptyPoints: (x: RestockTimesView): Point[] => [
      { text: <>Just nu listar <b className="text-ink">{x.duoNow} av {x.stores}</b> en</> },
      { text: <>Tabellerna nedan börjar fyllas vid första bekräftade återkomsten</>, step: true },
      { text: <>Mönster per timme och veckodag där registret är störst: <Link href="/iphone-duo-restock-times" className="underline underline-offset-2">studien för USA (på engelska)</Link></>, step: true },
    ],
    setUpAlert: "Starta en bevakningslista för iPhone Duo",
    logLive: "Öppna återkomstregistret live",
    onThisPage: "Avsnitt",
    nav: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": "Timmar",
      "day-by-day": "Kalender",
      where: `Platser (${rtRegion(x)})`,
      configuration: "Konfigurationer",
      "how-long": "Listningens längd",
      unavailable: "”Inte tillgänglig”?",
      reddit: "Forumpåståenden",
      method: "Räkneregler",
    }),
    h2: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": `Vilka klocktimmar loggas återkomster av iPhone Duo ${inLand(x.c)}?`,
      "day-by-day": `Vilka datum har iPhone Duo kommit tillbaka ${inLand(x.c)}?`,
      where: `Var ${inLand(x.c)} kommer iPhone Duo tillbaka oftast?`,
      configuration: `Vilken iPhone Duo-konfiguration kommer tillbaka oftast ${inLand(x.c)}?`,
      "how-long": `Hur länge ligger en återkommen iPhone Duo på hyllan ${inLand(x.c)}?`,
      unavailable: "Varför står det ”inte tillgänglig” i nästan varje Apple Store?",
      reddit: "Forumens teorier om återkomster av iPhone Duo, ställda mot registret",
      method: "Hur räknar ShelfSpring en återkomst?",
    }),
    faq: (x: RestockTimesView): Faq[] => {
      const { t, w, pattern, sell, us, weekend, tracked } = x;
      const where = inLand(x.c);
      const window = between(w.from, w.to);
      return [
        { q: `Vilken tid dyker återkomster av iPhone Duo upp ${where}?`, a: t.n > 0 && pattern
          ? `${w.from < 12 ? "Oftast på förmiddagen: " : ""}${share(w.share)} av de ${n(t.n)} bekräftade återkomsterna sedan ${longDate(t.since)} loggades ${window} enligt butikens klocka, och ${share(hourShare(t.byHour, 8, 12))} mellan kl. 8 och 12. Apple publicerar ingen kalender; det här är mönstret i registret.`
          : `Apple publicerar ingen kalender, och registret har ${confirmedRN(t.n)} ${where} sedan ${longDate(t.since)}${t.days ? ` på ${pl(t.days, "dag", "dagar")}` : ""}. En vanlig tid anges först vid ${PATTERN_MIN} återkomster på ${PATTERN_MIN_DAYS} olika dagar.` },
        { q: `Kommer iPhone Duo tillbaka på helger${us ? "" : ` ${where}`}?`, a: t.n > 0
          ? `${weekend > 0 ? "Ja, hittills" : "Inte än i registret"}: ${returnsN(weekend)} av ${n(t.n)} loggades en lördag eller söndag (${share(weekend / t.n)}). ${t.peakWeekday != null ? `${cap(WD[t.peakWeekday])} leder veckan.` : `En ledande veckodag anges när datan sträcker sig över ${WEEKDAY_MIN_SPAN} dagar; registret täcker ${tracked}.`}`
          : `Ingen helgdata ${where} än; kalendern på sidan fylls i när återkomster bekräftas.` },
        { q: "När är det värt att titta själv?", a: t.n > 0 && pattern
          ? `Från ${klock(w.from)} lokal tid, med Hämta i butik valt på apple.com; det tvåtimmarsfönstret står för ${share(w.share)} av återkomsterna. ${sell ? `Medianen på hyllan var ${sell.medianSec} sekunder` : "En återkomst ligger sällan uppe länge"}, så en plats på bevakningslistan täcker resten av dygnet.`
          : `Tills ett mönster ${where} syns: låt bevakningslistan hålla utkik åt dig.` },
        { q: "Varför står det ”inte tillgänglig” nästan överallt?", a: sell
          ? `För att återkomster är korta: ${share(sell.within2min)} av de ${n(sell.n)} tidsatta återkomsterna ${where} försvann inom 2 minuter och ${share(sell.within20min)} inom 20. Just nu listar ${x.duoNow} av ${x.stores} butiker en.`
          : `För att hämtningslager dyker upp några minuter i taget. Just nu listar ${x.duoNow} av ${storesN(x.stores)} ${where} en.` },
        { q: "Hur hör jag när min butik får en återkomst?", a: `Lägg butiken och exakt kapacitet och färg på bevakningslistan; en notis går iväg när en matchande återkomst bekräftats ([starta listan](${x.alert})).` },
      ];
    },
    sources: {
      applePickup: "Apples egen förklaring, ”Leverans och hämtning”",
      newsroom: "”iPhone Duo kommer till Apple Store-butiker världen över” · Apples pressmeddelande, 23 oktober 2026",
      macRumors: "”Apples system för hämtning av iPhone Duo i butik är igång igen i USA och Kanada” · rapporterat av MacRumors, 24 oktober 2026",
      reports: (tracker: string) => `${tracker}, anteckningar om iPhone Duo under lanseringsveckan: hålls utanför registret och räknas aldrig`,
    },
    ld: (x: RestockTimesView) => ({
      datasetName: `Påfyllningstider för iPhone Duo i Apple Store-butiker ${inLand(x.c)}`,
      description: `Varje bekräftad påfyllning av iPhone Duo för hämtning i butik i Apple Store-butikerna ${inLand(x.c)} sedan ${x.t.since}, med butik, konfiguration och tid, från ShelfSprings kontroller var ${SPEED.checkSec}:e sekund; sammanställt per lokal timme, dag, ${rtRegion(x)}, butik och konfiguration.`,
      spatial: `Apple Store-butiker ${inLand(x.c)}`,
      measured: ["tid för påfyllning (butikens lokala tid)", "Apple Store", "lagring och färg för iPhone Duo", "sekunder tills den var slutsåld"],
      size: `${restocksN(x.t.n)} i ${storesN(x.t.stores)}`,
    }),
    crumb: "Återkomstregister för iPhone Duo",

    // ---- time of day
    timeLead: (x: RestockTimesView) => <b>{share(x.w.share)} av de {n(x.t.n)} återkomsterna loggades {between(x.w.from, x.w.to)} enligt butikens klocka, och {share(hourShare(x.t.byHour, 8, 12))} mellan kl. 8 och 12.</b>,
    busiestHour: (count: number) => `starkaste enskilda timmen: ${returnsN(count)}`,
    morning: "förmiddag, kl. 8–12",
    evening: "efter kl. 17: kvällarna lever också",
    night: "natt, kl. 0–6",
    tooFew: (x: RestockTimesView) => <b>För få dagar för att peka ut en timme{rtYet(x)}: {confirmedRN(x.t.n)} på {pl(x.t.days, "dag", "dagar")} sedan {longDate(x.t.since)}.</b>,
    tooFewKeys: (): Point[] => [
      { text: <>En typisk timme kräver <b className="text-ink">{PATTERN_MIN} återkomster på {PATTERN_MIN_DAYS} olika dagar</b></> },
      { text: <>Tio återkomster i en enda våg = en händelse, inte ett mönster</>, no: true },
      { text: <>Sidan skriver om sig själv när dagarna blir fler</>, step: true },
    ],
    hourCaption: (x: RestockTimesView) => `Loggade återkomster av iPhone Duo ${inLand(x.c)} per lokal butikstimme, ${dateLabel(x.t.since, false)} → i dag, ${n(x.t.n)} totalt`,
    hourHead: ["Lokal butikstimme (24 h)", "Återkomster", "% av registret"],
    morningKeys: (x: RestockTimesView): Point[] => [
      { text: <>Morgontoppen sammanfaller <b className="text-ink">inte med att dörrarna öppnar</b>{x.us ? ": de flesta Apple Store i USA öppnar kl. 10" : ""}</> },
      { text: <>Hämtningslager släpps <b className="text-ink">online</b>, innan butiken öppnar</> },
      { text: <>Läser du själv: håll ögonen på <b className="text-ink">{range(x.w.from, x.w.to)}</b> på vardagar</>, step: true },
      { text: <>Låt <Link href={x.alert}>bevakningslistan</Link> sköta <b className="text-ink">de övriga 22 timmarna</b>, när ingen sitter och laddar om</>, step: true },
    ],
    storeChartKeys: (x: RestockTimesView): Point[] => [{ text: <>Varje butikssida har ett eget diagram i sin egen tidszon (<Link href={x.storesHref}>{x.us ? "butiker per delstat" : `butikerna ${inLand(x.c)}`}</Link>): en butik som får återkomster kl. 8 när andra får dem kl. 9 är värd att känna till</>, step: true }],

    // ---- day by day
    dayLead: (x: RestockTimesView) => {
      const { t, tracked, one } = x;
      return t.n > 0 && tracked === 1 ? (
        <b>Registret har en enda dag hittills, {dateLabel(t.daily[t.daily.length - 1]?.date ?? t.since)}, med {confirmedRN(t.n)}{one ? "" : ` i ${storesN(t.stores)}`}.</b>
      ) : t.n > 0 ? (
        <b>{t.days === tracked ? `Varje följd dag, ${t.days} av ${t.days},` : `${t.days} av de ${tracked} dagarna sedan ${longDate(t.since)}`} hade minst en bekräftad återkomst{t.peakWeekday != null ? `; ${WD[t.peakWeekday]} leder veckan` : ""}.</b>
      ) : (
        <b>Ingen bekräftad återkomst {inLand(x.c)} sedan {longDate(t.since)}.</b>
      );
    },
    daysTracked: "följda dagar med minst en återkomst",
    busiestDay: (x: RestockTimesView, day: DayRow) => `starkaste dagen, ${dateLabel(day.date)}${x.one ? "" : `, i ${storesN(day.stores)}`}`,
    busiestDayNone: "starkaste dagen",
    drop: (x: RestockTimesView, drop: { at: string; restocks: number }) => `butiker fick en återkomst inom samma halvtimme, ${zoneStamp(drop.at, x.c)} (${pl(drop.restocks, "konfiguration", "konfigurationer")}): en nationell våg sedd utifrån`,
    weekend: (x: RestockTimesView) => `på en lördag eller söndag (${returnsN(x.weekend)})`,
    dayCaption: (x: RestockTimesView) => `Loggade återkomster av iPhone Duo ${inLand(x.c)} per kalenderdag${x.t.reports.length ? ". Grå rader märkta ”rapporterad” kommer från andra bevakningstjänsters offentliga anteckningar för dagar innan registret öppnade; de fyller ut tidslinjen och ingår aldrig i en summa" : ""}`,
    dayHead: { date: "Dag", restocks: "Återkomster", stores: "Butiker", busiest: "Topptimme (24 h)", source: "Noterad av" },
    soFar: " · pågår",
    reportedBy: (names: string[]) => <>{names.join(" / ")}, rapporterad</>,
    dayKeys: (x: RestockTimesView, launch: string, resumed: string): Point[] => [
      { text: <><b className="text-ink">{dateLabel(launch)}</b>: lanseringsdagen, de första exemplaren gick till onlineordrar</> },
      { text: <><b className="text-ink">{dateLabel(resumed)}</b>: bokning av hämtning öppnade igen{x.us ? " (MacRumors)" : ""}</> },
      x.t.reports.length
        ? { text: <>Rader märkta <b className="text-ink">rapporterad</b>: anteckningar från {words(x.reportNames)} från lanseringsveckan; de räknas aldrig</> }
        : { text: <>Registret för varje butik {inLand(x.c)} börjar <b className="text-ink">{longDate(x.t.since)}</b></> },
      ...(x.t.n > 0 && x.t.peakWeekday == null ? [{ text: <>Veckodag som leder: anges när datan sträcker sig över <b className="text-ink">{WEEKDAY_MIN_SPAN} dagar</b> (registret täcker {x.tracked})</>, no: true }] : []),
      { text: <>Titta på kolumnen <b className="text-ink">butiker</b>: lika många återkomster fördelade på fler butiker är en bättre dag för dig</>, step: true },
    ],

    // ---- where
    whereLead: (x: RestockTimesView, hit: { name: string; restocks: number; stores: number; storesTotal: number }[], total: number) => (
      <b>{hit[0].name}: {returnsN(hit[0].restocks)} {hit[0].storesTotal === 1 ? "i den enda butiken där" : `i ${hit[0].stores} av sina ${hit[0].storesTotal} butiker`} sedan {dateLabel(x.t.since, false)}{hit[1] ? <>; därefter {hit[1].name} ({n(hit[1].restocks)})</> : null}{hit[2] ? <> och {hit[2].name} ({n(hit[2].restocks)})</> : null}; {hit.length} av {total} {rtRegions(x)} har haft minst en återkomst{total - hit.length > 0 ? ` och ${total - hit.length} ingen än` : ""}.</b>
    ),
    whereNone: (x: RestockTimesView) => <b>{none(rtRegion(x))} {rtRegion(x)} {inLand(x.c)} har en bekräftad återkomst än; tabellen fylls från den första.</b>,
    regionCaption: (x: RestockTimesView) => `Loggade återkomster av iPhone Duo per ${rtRegion(x)} ${inLand(x.c)}, ${dateLabel(x.t.since, false)} → i dag`,
    regionHead: (x: RestockTimesView) => [cap(rtRegion(x)), "Återkomster", "Butiker med en återkomst", "Senaste (butikstid)"],
    ofN: (a: number, b: number) => <>{a}/{b}</>,
    storesCaption: (x: RestockTimesView) => `Butikerna med längst återkomstregister för iPhone Duo ${inLand(x.c)}, ${dateLabel(x.t.since, false)} → i dag`,
    storesHead: ["Butik", "Återkomster", "Dagar med en", "Typisk timme", "Senaste (butikstid)"],
    swaps: (x: RestockTimesView) => [
      { no: "Butiken med flest återkomster, var den än ligger", yes: `Två eller tre butiker du hinner till inom en timme runt ${x.pattern ? klock(x.w.from) : "morgonen"}`, why: "En återkomst du inte hinner till räknas inte; även den livligaste butiken visar ”inte tillgänglig” större delen av dagen." },
      { no: "En enda butik, och hopp", yes: "En avisering per butik, och åk till den som slår till", why: "Rangordningen säger bara vilken av dina butiker du ska prova först." },
    ],
    nearMe: "Vilka butiker nära mig listar Duo nu",

    // ---- configuration
    configLead: (x: RestockTimesView, top: { label: string; restocks: number }, rarest: { label: string; restocks: number } | null) => (
      <b>{top.label}: {n(top.restocks)} av de {n(x.t.n)} återkomsterna ({share(top.restocks / x.t.n)}){rarest ? `; mest sällsynt var ${rarest.label}, med ${returnsN(rarest.restocks)}` : ""}.</b>
    ),
    mostRestocked: (config: string) => `${config}: konfigurationen som kommer tillbaka oftast`,
    versus: (a: string, bCount: number, b: string) => `återkomster av ${a}, mot ${n(bCount)} för ${b}`,
    restocksOf: (a: string) => `återkomster av ${a}`,
    byStorage: "per kapacitet",
    byColour: "per finish",
    configNone: (x: RestockTimesView) => <b>Ingen konfiguration {inLand(x.c)} har en bekräftad återkomst{rtYet(x)}; alla åtta står listade så att den första återkomsten har en rad att landa på.</b>,
    configCaption: (x: RestockTimesView) => `Loggade återkomster av iPhone Duo ${inLand(x.c)}, en rad per konfiguration, ${dateLabel(x.t.since, false)} → i dag`,
    configHead: ["Konfiguration", "Återkomster", "% av registret", "Senaste (butikstid)"],
    configKeys: (x: RestockTimesView): Point[] => [
      { text: <>Valet av konfiguration väger <b className="text-ink">tyngre än valet av butik</b></> },
      x.storageRatio != null
        ? { text: <>Nöj dig med den kapacitet som kommer tillbaka oftast: ungefär <b className="text-ink">{n(x.storageRatio)} gånger</b> så stor chans som nästa storlek</> }
        : { text: <>Nöj dig med den kapacitet som kommer tillbaka oftast: chansen ökar <b className="text-ink">tydligt</b></> },
      { text: <><b className="text-ink">2TB</b>: en telefon du beställer för leverans och väntar på</>, no: true },
      { text: <>Priser och vad som står på hyllan nu: <Link href="/which-iphone-duo-restocks-most">Vilken iPhone Duo kommer tillbaka oftast? (på engelska)</Link></>, step: true },
    ],

    // ---- how long
    howLongLead: (x: RestockTimesView, sell: SelloutFacts) => <b>Hälften av de {n(sell.n)} tidsatta återkomsterna {inLand(x.c)} hade lämnat hyllan inom {sell.medianSec} sekunder; {share(sell.within2min)} inom 2 minuter och {share(sell.within20min)} inom 20.</b>,
    secUnit: "s",
    medianListing: "median för tid på hyllan",
    within2: "av hyllan inom 2 min",
    within20: "av hyllan inom 20 min",
    fastest: "kortaste uppmätta vistelse",
    howLongNone: (x: RestockTimesView) => <b>För få tidsatta återkomster {inLand(x.c)} för att mäta{rtYet(x)}; siffrorna visas från tio, och studien för USA har hela bilden.</b>,
    howLongKeys: (x: RestockTimesView): Point[] => [
      { text: <>Ett tvåminutersfönster fångas av <b className="text-ink">bevakningslistan</b>, inte genom att ladda om apple.com</> },
      { text: <>Den här siffran förklarar resten av sidan</> },
      { text: <>Varje återkomst med antalet sekunder den låg uppe, per konfiguration och {rtRegion(x)}: <Link href="/iphone-duo-sell-out-times">Hur länge ligger en återkommen iPhone Duo listad? (på engelska)</Link></>, step: true },
    ],
    measured: "Varje siffra mäts från observationen som först såg konfigurationen listad till den som såg den borta, så det är en övre gräns; den verkliga tiden är kortare.",

    // ---- unavailable
    unavailableLead: (x: RestockTimesView) => <b>För att en återkomst är ett ögonblick, inte ett tillstånd: {x.one ? "en butik" : `${n(x.stores)} butiker`} × {x.configs} konfigurationer = {n(x.pairs)} par som kan stå på hyllan {inLand(x.c)}, och just nu listar {x.duoNow === 1 ? "1 butik" : `${x.duoNow} butiker`} någon iPhone Duo.</b>,
    pairs: "par av butik och konfiguration som kan stå på hyllan",
    listingNow: "listar en iPhone Duo för hämtning just nu",
    goneIn2: "av återkomsterna borta inom två minuter",
    last24: "bekräftade återkomster senaste dygnet",
    unavailableKeys: (x: RestockTimesView, today: number): Point[] => [
      x.recent.restocks > 0
        ? { text: <>Senaste dygnet: <b className="text-ink">{confirmedRN(x.recent.restocks)}</b> i {storesN(x.recent.stores)} {inLand(x.c)}</> }
        : today > 0
          ? { text: <>I dag: <b className="text-ink">{confirmedRN(today)}</b> {inLand(x.c)}</> }
          : { text: <>Kalendern ovan visar återkomsterna som faktiskt loggades</> },
      { text: <>Var och en syns på apple.com i <b className="text-ink">en minut eller två</b></> },
      { text: <>”Inte tillgänglig överallt” dag fyra, eller dag fjorton, betyder <b className="text-ink">inte</b> att återkomsterna har upphört</>, no: true },
    ],
    unavailableLinks: { explained: "Så läser du ”inte tillgänglig för hämtning” (på engelska)", howToGet: "En praktisk väg till en iPhone Duo (på engelska)" },

    // ---- reddit
    redditLead: (x: RestockTimesView) => <b>Mycket av det som sägs i <a href="https://www.reddit.com/r/applestore/" target="_blank" rel="noopener nofollow">r/applestore</a> och <a href="https://www.reddit.com/r/iphone/" target="_blank" rel="noopener nofollow">r/iphone</a> är välmenat men bygger på en enda butik och blir inaktuellt inom ett dygn; här är de fyra påståenden som återkommer oftast, ställda mot {n(x.t.n)} bekräftade återkomster {inLand(x.c)}.</b>,
    redditCaption: "Återkommande forumpåståenden om iPhone Duo, jämförda med ShelfSprings register",
    redditHead: ["Påståendet", "Vad registret visar"],
    claims: (x: RestockTimesView): { claim: string; answer: ReactNode }[] => {
      const { t, w, tracked, recent } = x;
      return [
        { claim: "”Hyllorna fylls på natten – titta kl. 3.”", answer: t.n > 0 ? <>{share(hourShare(t.byHour, 0, 6))} av återkomsterna loggades mellan midnatt och kl. 6 lokal tid; {share(w.share)} kom {between(w.from, w.to)}.</> : "Inga återkomster i registret än att pröva det mot." },
        { claim: "”Återkomster sker bara en viss veckodag.”", answer: t.n > 0 ? (t.peakWeekday != null ? <>{cap(WD[t.peakWeekday])} leder hittills ({n(t.byWeekday[t.peakWeekday])} av {n(t.n)}), men återkomster loggades på {t.days} av {tracked} dagar.</> : <>Återkomster loggades på {t.days} av de {tracked} följda dagarna{t.days === tracked ? ", utan en enda tom dag" : ""}; en ledande veckodag anges när datan sträcker sig över {WEEKDAY_MIN_SPAN} dagar.</>) : "Inga återkomster i registret än att pröva det mot." },
        { claim: "”Ring butiken och fråga när leveransen kommer.”", answer: "Apple publicerar ingen kalender för återkomster; det som syns på apple.com är hämtningslager som släpps online, och butiken ser det i samma stund som alla andra." },
        { claim: "”Står det inte tillgänglig är den slut för gott.”", answer: recent.restocks > 0 ? <>{confirmedRN(recent.restocks)} i {storesN(recent.stores)} senaste dygnet säger emot; var och en var ”inte tillgänglig” igen inom några minuter.</> : t.n > 0 ? <>{confirmedRN(t.n)} sedan {dateLabel(t.since, false)} säger emot; var och en var ”inte tillgänglig” igen inom några minuter.</> : "Inget att pröva det mot än." },
      ];
    },
    redditKeys: (): Point[] => [
      { text: <>Rykten fyller tomrummet där <b className="text-ink">data saknas</b>; den här sidan är datan, fri att läsa</> },
      { text: <>Där forumen har rätt: <b className="text-ink">förberedelserna inför kassan</b> – inloggad, betalsätt klart (<Link href="/how-to-grab-an-iphone-duo-restock">checklistan, på engelska</Link>)</> },
    ],

    // ---- method
    methodLead: <b>En återkomst räknas när apple.com listar en konfiguration för hämtning i en butik där den inte var listad, och två observationer i rad stämmer överens.</b>,
    methodKeys: (x: RestockTimesView): Point[] => [
      { text: <>{x.one ? "Butiken" : "Varje Apple Store"} {inLand(x.c)} läses av var <b className="text-ink">{SPEED.checkSec}:e sekund</b>; butiker på en bevakningslista var <b className="text-ink">{SPEED.fastSec}:e</b></> },
      { text: <>Ett första ”tillgänglig” kontrolleras igen innan det räknas</> },
      { text: <>En listning som försvinner bekräftas vid <b className="text-ink">nästa varv</b></> },
      { text: <>Första gången en butik ses, en misslyckad eller avbruten förfrågan: <b className="text-ink">aldrig</b> en återkomst, aldrig en tömd hylla</>, no: true },
      { text: <>Timmar och datum i varje butiks <b className="text-ink">egen klocka</b>; ”vågor” = samma halvtimme över flera tidszoner</> },
      { text: <>Andra bevakningstjänsters rapporter{x.t.reports.length ? ` (${x.reportNames.join(", ")})` : ""}: egna märkta rader, <b className="text-ink">aldrig med i en summa</b></> },
      { text: <>Uppdateras ungefär var femte minut; <Link href={x.logHref}>återkomstregistret</Link> är live</>, step: true },
    ],
    quote: "Siffrorna får gärna citeras med en länk hit; ShelfSpring är fristående, utan koppling till Apple, och läser samma hämtningsläge som vem som helst kan se på apple.com.",
    alertIn: (x: RestockTimesView) => <>Följ iPhone Duo{x.one ? "" : ` ${inLand(x.c)}`}</>,

    // ---- related, FAQ, sources
    related: "Mer ur samma register",
    sameData: "Frågor som registret besvarar",
    questions: {
      sellOut: "Hur länge ligger en återkomst listad?",
      alerts: "Att höra om en återkomst först",
      howToGet: "En praktisk väg till en",
      whichConfig: "Vilken konfiguration kommer tillbaka oftast",
      nearMe: "Vilka butiker nära mig listar den nu",
      unavailable: "Att läsa ”inte tillgänglig just nu”",
    },
    otherCountries: ((us: boolean) => (us ? "Samma studie i andra länder" : "Andra länders register")) as unknown as Dict["views"]["restockTimes"]["otherCountries"],
    faqTitle: "Fältfrågor",
  },
};


export const views: Dict["views"] = withShelfViews("sv", baseViews);
