import { withShelfViews } from "@/lib/seo/localizedCopy";
/**
 * Italian strings: views — product × place pages, the restock log, the live map, the iPhone Duo restock-times page
 * and the store index. `Country`, `Store`, `Product` and `Place` arrive as English data and are named here in Italian;
 * string arguments (`name`, `place`, `region`, `where`, `config`) arrive already in Italian. Model names stay as Apple
 * writes them; a `model` that carries an English colour ("iPhone Duo 256GB Night Sky") is given Apple's Italian one.
 */
import type { ReactNode } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import type { Point } from "@/components/ui/Viz";
import type { Faq } from "@/lib/content/types";
import { catalogFor, modelByKey, storePath, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type Country, type CountryCode } from "@/lib/apple/countries";
import { faq as placeFaq, fmtDuration, peakOf, type FaqContext, type FaqItem } from "@/lib/seo/enrich";
import type { Place, PlaceLevel, Product } from "@/lib/seo/products";
import type { StoreLine } from "@/lib/seo/productData";
import type { PlaceStats, RestockStats } from "@/lib/stock/queries";
import { hourShare, type DayRow, type SelloutFacts } from "@/lib/content/restockTimes";
import { PATTERN_MIN, PATTERN_MIN_DAYS, WEEKDAY_MIN_SPAN, localStamp } from "@/lib/content/siteFacts";
import { distance, fitTitleW, list, pct, price } from "@/lib/i18n/format";
import { appleStoreLabel, cityLabel, colorLabel, regionLabel, storeLabel } from "@/lib/i18n/places";
import type { Dict } from "../en";
import type { RestockTimesMeta, RestockTimesView } from "../en/views";
import {
  GIORNI, IT, aLuogo, altre, cap, conFuso, dalle, dei, fascia, giorno, giornoLungo, il, ilGiorno, inPaese, inTutto, n as N, nessuna,
  ora, paese, pl, regione, tra, taxNoteIt,
} from "./util";

/* ---------------------------------------------------------------- helpers */

const COLORS = ["Night Sky", "Star White", "Burgundy", "Glacier", "Silver", "Black"];
/** "iPhone Duo 256GB Night Sky" → "iPhone Duo 256GB Cielo notturno". */
const itName = (s: string) => COLORS.reduce((a, c) => a.replace(new RegExp(`\\b${c}\\b`, "g"), colorLabel(c, IT)), s);
const ccOf = (p: { country?: CountryCode }) => p.country ?? "us";
const apple = (s: Store) => appleStoreLabel(s, IT);
/** Product names in Italian: model, storage, Apple's Italian colour. */
const pName = (p: Product) => [modelByKey(p.model)!.name, p.storage, p.color ? colorLabel(p.color, IT) : undefined].filter(Boolean).join(" ");
const pShort = (p: Product) => [modelByKey(p.model)!.short, p.storage, p.color ? colorLabel(p.color, IT) : undefined].filter(Boolean).join(" ");
/** A place in Italian (country, region, city or store). */
function placeIt(place: Place): string {
  const cc = ccOf(place);
  if (place.level === "country") return paese(cc);
  if (place.level === "state") return `${regionLabel(cc, place.state ?? place.name, IT)}${cc === "it" ? " e provincia" : ""}`;
  if (place.level === "city") return cityLabel(cc, place.city ?? place.label, IT);
  return apple(place.store!);
}
/** "in Italia", "a Roma", or "presso" + a store. */
function atIt(place: Place): string {
  if (place.level === "country") return inPaese(ccOf(place));
  if (place.level === "store") return `presso ${apple(place.store!)}`;
  return aLuogo(placeIt(place));
}
/** Whole-percent share of 0–1; under half a percent "<1%", never a misleading "0%". */
const rtPct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : pct(IT, Math.round(x * 100)));
const rtRegion = (x: { us: boolean; c: Country }) => (x.us ? "stato" : regione(x.c));
const rtRegions = (x: { us: boolean; c: Country }) => (x.us ? "stati" : regione(x.c, true));
const nounOf = (x: { us: boolean; c: Country }) => (x.us ? { regionNoun: "state" } : x.c);

/* ---------------------------------------------------------------- product × place copy */

function productTitle(product: Product, place: Place, inStock: number): string {
  const n = place.stores.length;
  const name = pName(product), short = pShort(product);
  if (place.level === "country") {
    const where = inPaese(ccOf(place));
    return fitTitleW([...(inStock > 0 ? [`${name} disponibile in ${inStock === 1 ? "1 Apple Store" : `${N(inStock)} Apple Store`} ${where}`] : []), `${name}: disponibilità per il ritiro ${where}, in tempo reale`, `${name}: disponibilità per il ritiro ${where}`, `${name} ${where}: disponibilità`, `${short}: disponibilità per il ritiro ${where}`, `${short}: disponibilità per il ritiro`]);
  }
  if (place.level === "store") {
    const s = place.store!;
    const now = inStock > 0 ? "disponibile ora" : "disponibilità per il ritiro";
    return fitTitleW([`${name} da ${apple(s)}: ${now}`, `${name} da ${apple(s)}: disponibilità`, `${short} da ${apple(s)}, ${cityLabel(s.country, s.city, IT)}`, `${short} da ${apple(s)}`, `${short} da ${storeLabel(s, IT)}`, `${short} · ${storeLabel(s, IT)}`]);
  }
  const at = aLuogo(placeIt(place));
  return fitTitleW([...(inStock > 0 ? [`${name} disponibile ${at}: ${N(inStock)} ${inStock === 1 ? "negozio" : "negozi"} su ${N(n)}`] : []), `${name} ${at}: disponibilità per il ritiro`, `${short} ${at}: disponibilità per il ritiro`, `${short} disponibile ${at}`, `${short} ${at}`]);
}

function productDescription(product: Product, place: Place, inStock: number, stats: PlaceStats): string {
  const name = pName(product);
  const week = `${pl(stats.week, "rifornimento", "rifornimenti")} questa settimana`;
  if (place.level === "store") {
    const s = place.store!;
    const cc = ccOf(place);
    const loc = `${cityLabel(s.country, s.city, IT)}${cc === "us" ? ` ${s.stateCode ?? ""}`.trimEnd() : `, ${paese(cc)}`}`;
    return fitTitleW([
      `Disponibilità ${name} per il ritiro da ${apple(s)}, ${loc}: ${inStock > 0 ? "disponibile ora" : "non disponibile in questo momento"}, ${week}. Stato in tempo reale, orari dei rifornimenti e avvisi.`,
      `${name} da ${apple(s)}: ${inStock > 0 ? "disponibile ora" : "non disponibile ora"}, ${week}. Stato in tempo reale e avvisi.`,
    ], 155);
  }
  const where = atIt(place);
  const n = place.stores.length;
  return fitTitleW([
    `${name} per il ritiro: disponibile ora in ${N(inStock)} Apple Store su ${N(n)} ${where}, ${week}. Per negozio in tempo reale, orari dei rifornimenti e avvisi.`,
    `${name}: disponibile ora in ${N(inStock)} Apple Store su ${N(n)} ${where}, ${week}. Per negozio e avvisi.`,
  ], 155);
}

function productFaq(product: Product, place: Place, lines: StoreLine[], stats: PlaceStats, clock: RestockStats, nearest: { name: string; city: string; distance: number } | null): FaqItem[] {
  const out: FaqItem[] = [];
  const name = pName(product);
  const at = atIt(place);
  const cc = ccOf(place);
  const inStock = lines.filter((l) => l.available.length > 0);
  const near = nearest ? `${/^apple\b/i.test(nearest.name) ? nearest.name : `Apple ${nearest.name}`} (${nearest.city}, ${distance(IT, cc, nearest.distance)})` : "";
  if (place.level === "store") {
    const l = lines[0];
    out.push({
      q: `L'${name} è a scaffale ${at}?`,
      a: l && l.available.length > 0
        ? `Sì${product.parts.length > 1 ? `: ${list(IT, l.available.map((i) => `${i.storage} ${colorLabel(i.color, IT)}`), 4, (k) => `${N(k)} in più`)}` : ""}, all'ultima osservazione.`
        : `Non all'ultima osservazione${near ? `; il negozio più vicino che lo espone è ${near}` : ""}.`,
    });
  } else {
    out.push({
      q: `${cap(at)}, quali Apple Store espongono l'${name}?`,
      a: inStock.length === 0
        ? `Nessuno all'ultima osservazione${near ? `; il più vicino che lo espone è ${near}` : ""}.`
        : `${pl(inStock.length, "negozio", "negozi")} all'ultima osservazione: ${list(IT, inStock.map((x) => apple(x.store)), 4, (k) => `${N(k)} in più`)}.`,
    });
  }
  const peak = peakOf(clock, IT);
  out.push({
    q: `Con che frequenza l'${name} torna a scaffale ${at}?`,
    a: stats.month === 0 ? `Nessun rientro annotato ${at} nella finestra di ${N(stats.days)} giorni.` : `${pl(stats.month, "rientro", "rientri")} nella finestra di ${N(stats.days)} giorni, ${N(stats.week)} in questa settimana${peak ? `, per lo più attorno alle ${peak.hour}, ora locale` : ""}.`,
  });
  if (stats.medianMs != null) out.push({ q: `Quanto resta a scaffale ${at}?`, a: `Una mediana di circa ${fmtDuration(stats.medianMs, IT)} prima di sparire di nuovo.` });
  return out;
}

function priceLabel(product: Product): string {
  const cc = ccOf(product);
  const prices = catalogFor(product.model, cc).filter((c) => product.parts.includes(c.partNumber)).map((c) => c.price);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  const f = (v: number) => price(IT, COUNTRIES[cc], v);
  return lo === hi ? f(lo) : `${f(lo)}–${f(hi)}`;
}

/* ---------------------------------------------------------------- views */


const baseViews: Dict["views"] = {
  common: {
    inCountry: (c: Country) => inPaese(c.cc),
    liveMap: "Mappa del ritiro",
    restockLog: "Registro dei rientri",
    alertMe: "Aggiungi alla lista d'osservazione",
    lastDays: (days: number) => <>Calendario dei rientri, {N(days)} giorni</>,
    since: "2 novembre 2026",
    sourcesWhere: (n: number, c: Country) => (n === 1 ? `il solo Apple Store osservato ${inPaese(c.cc)}` : `${N(n)} Apple Store osservati ${inPaese(c.cc)}`),
    checker: (c: Country) => `Registro del ritiro · ${paese(c.cc)}`,
    appleStoresIn: (c: Country) => `Apple Store ${inPaese(c.cc)}`,
    storesWithIt: "negozi che lo espongono",
    more: "Nel registro anche",
  },

  /* ---------------------------------------------------------------- /stock/{product}/{place…} */
  product: {
    title: productTitle,
    description: productDescription,
    faq: productFaq,
    priceLabel,
    /** A region in Italy is a province: "a Roma e provincia". */
    inPlace: (name: string, level: PlaceLevel) => (level === "store" ? `presso ${name}` : level === "state" ? `${aLuogo(name)} e provincia` : aLuogo(name)),
    h1Country: (model: string, c: Country) => `${itName(model)}: scorte per il ritiro ${inPaese(c.cc)}`,
    h1Place: (model: string, where: string) => `${itName(model)} ${where}`,
    inStockNow: "A scaffale adesso",
    yes: "In elenco",
    no: "Non in elenco",
    pickup: "risposta sul ritiro",
    configurations: "configurazioni in elenco",
    ofStores: (n: number) => `su ${pl(n, "negozio osservato", "negozi osservati")}`,
    restocks24h: "Rientri, ultima giornata",
    restocksHint: (week: number, month: number, days: number) => `7 g: ${N(week)} · ${N(days)} g: ${N(month)}`,
    sellOuts: (days: number) => `Di nuovo fuori scaffale · ${N(days)} g`,
    stays: (ms: number) => { const d = fmtDuration(ms, IT); return /^sotto\b/.test(d) ? `permanenza mediana ${d}` : `permanenza mediana ≈${d}`; },
    noPairs: "nessuna permanenza completa finora",
    lastRestock: "Rientro più recente",
    noneYet: "non ancora visto",
    thisConfig: "questa configurazione esatta",
    inDays: (days: number) => `nessuno in ${N(days)} giorni`,
    notInStockNow: "Fuori scaffale adesso",
    configsInStock: (n: number, of: number) => <span><b className="text-ink">{N(n)}</b>/{N(of)} configurazioni a scaffale</span>,
    inStockAt: (n: number, of: number) => <span>A scaffale in <b className="text-ink">{N(n)}</b>/{N(of)} {of === 1 ? "negozio" : "negozi"}</span>,
    checked: (live: ReactNode, p: string, tax: string) => <>{p}{tax} · ultima osservazione {live}</>,
    taxNote: (c: Country) => taxNoteIt(c),
    beforeTax: "al netto delle tasse",
    buyOnApple: "Ordina su apple.com",
    allStoresIn: (c: Country) => `Elenco dei negozi ${inPaese(c.cc)}`,
    everyIphoneHere: "Tutti e tre gli iPhone qui",
    everyIphone: (where: string) => `Tutti e tre gli iPhone ${where}`,
    panel: (model: string, where: string | null) => `Lista d'osservazione per l'${itName(model)}${where ? ` ${where}` : ""}: prima le configurazioni, poi i negozi alla tua portata`,
    unitConfigs: "configurazioni",
    unitStores: "negozi",
    otherConfigsHere: "Altre versioni in questo negozio",
    byStorageColor: "Prima la capacità, poi la finitura",
    nearestStores: "Negozi più vicini",
    closest: (link: ReactNode, dist: string) => <>Il negozio più vicino che lo espone: {link} ({dist})</>,
    storeCity: (store: string, city: string) => <>{store}, {city}</>,
    mostRecentlyInStock: "Dove è stato visto per ultimo",
    storesWithItNow: "Negozi che lo espongono oggi",
    storesIn: (where: string) => `Negozi ${where}`,
    colStatus: "scaffale",
    colConfigs: "configurazioni in elenco",
    noStoreHasIt: "All'ultima osservazione nessun negozio lo espone.",
    noStoreHereHasIt: "All'ultima osservazione nessuno di questi negozi lo espone.",
    moreStores: (n: number) => <>Lo espongono altri {N(n)} negozi · apri l&apos;elenco completo ↗</>,
    byRegion: (c: Country) => `Ripartito per ${regione(c)}`,
    byCity: "Ripartito per città",
    nearbyStores: "Negozi di riserva",
    latestChanges: "Le annotazioni più recenti",
    nothingLogged: "Il registro per ora è vuoto.",
    whenRestocks: "Ore d'orologio dei rientri",
    howFast: "Quanto sono rimaste in elenco le voci",
    restocksByConfig: "Rientri per configurazione",
    faqTitleCountry: (model: string, c: Country) => `Domande dal campo · ${itName(model)} ${inPaese(c.cc)}`,
    faqTitle: (model: string, where: string) => `Domande dal campo · ${itName(model)} ${where}`,
    buySource: (model: string, c: Country) => `apple.com ${paese(c.cc)}: la pagina d'ordine di ${itName(model)}`,
    nearby: "Luoghi attorno",
    otherRegions: (c: Country) => altre(c),
    elsewhereIn: (region: string) => `Il resto della provincia di ${region}`,
    everyAppleStoreIn: (c: Country) => `Elenco completo dei negozi ${inPaese(c.cc)}`,
    across: (model: string, c: Country) => `${itName(model)} · ${inTutto(c.cc)}`,
    itemList: (model: string, where: string) => `${itName(model)} ${where}`,
    nearLead: (c: Country, model: string, inStock: number, n: number, have: { store: string; city: string; configs: number }[]) =>
      inStock === 0
        ? `Al momento l'${itName(model)} è fuori scaffale in ogni Apple Store ${inPaese(c.cc)}: «vicino a me» diventa quindi la domanda su quale negozio lo riavrà per primo. Metti in lista i negozi alla tua portata; la notifica parte quando uno lo rimette in elenco.`
        : `L'${itName(model)} è a scaffale in ${pl(inStock, "negozio", "negozi")} su ${N(n)}: ${list(IT, have.slice(0, 5).map((l) => `${l.store} (${l.city}, ${pl(l.configs, "configurazione", "configurazioni")})`), 5)}.`,
    nearHead: (c: Country) => [cap(regione(c)), "Negozi che lo espongono adesso"],
    nearCaption: (c: Country, model: string) => `${itName(model)}: scorte per il ritiro ripartite per ${regione(c)}, all'ultima osservazione`,
    nearMe: (_c: Country, model: string, alert: string) => `Per mettere in fila tutti i negozi a partire da dove sei, apri la lista d'osservazione in questa pagina e tocca Trovami: le distanze sono stradali, in chilometri e stimate, e accanto a ogni negozio c'è il percorso. [Metti l'${itName(model)} in lista](${alert}).`,
    modelFaq: (c: Country, model: string, low: number, high: number, inStock: number): { price: FaqItem; reserve: FaqItem } => {
      const m = itName(model);
      return {
        price: { q: `${cap(inPaese(c.cc))}, che prezzo ha l'${m}?`, a: `Si parte da ${price(IT, c, low)} per la capacità più piccola e si arriva a ${price(IT, c, high)} per la più grande, secondo il listino di apple.com (${taxNoteIt(c)}).` },
        reserve: { q: `C'è un modo per farsi tenere un ${m} per il ritiro ${inPaese(c.cc)}?`, a: `Solo ordinandolo. Una configurazione diventa tua quando concludi l'ordine su apple.com scegliendo di ritirarla in negozio; da lì Apple la conserva per la fascia che hai scelto.${inStock === 0 ? " All'ultima osservazione nessun negozio la espone: una voce nella lista d'osservazione è il modo per saperlo per primo." : ""}` },
      };
    },
  },

  /* ---------------------------------------------------------------- /restocks */
  restocks: {
    metaTitle: (c: Country, n: number) => fitTitleW([`Rifornimenti iPhone ${inPaese(c.cc)}: registro ${n === 1 ? "dell'Apple Store" : `${dei(n)} Apple Store`}`, `Registro dei rifornimenti iPhone ${inPaese(c.cc)}`, `Rifornimenti iPhone ${inPaese(c.cc)}`]),
    metaDescription: (c: Country, n: number) => `Ogni rifornimento di iPhone Duo, 18 Pro e Pro Max ${n === 1 ? "nell'Apple Store" : "negli Apple Store"} ${inPaese(c.cc)} per il Ritiro in negozio, con ora esatta, configurazione e mappa.`,
    h1: (c: Country) => `Registro dei rientri ${inPaese(c.cc)}`,
    summary: (day: number, week: number, model?: string, region?: string) => <>Ultima giornata: {pl(day, "rientro", "rientri")}; ultimi sette giorni: {N(week)}{model ? ` · ${model}` : ""}{region ? ` · ${region}` : ""}. Gli orari seguono il tuo dispositivo.</>,
    allModels: "Ogni modello",
    restocks: "Solo rientri",
    withSoldOut: "Rientri ed esaurimenti",
    regionLabel: (c: Country) => cap(regione(c)),
    allRegions: (c: Country) => `${cap(regione(c))} qualsiasi`,
    filter: "Applica",
    page: (k: number) => <>foglio {N(k)}</>,
    newer: "← Più recenti",
    older: "Precedenti →",
    getAlerts: "Inizia una lista d'osservazione",
    byPlace: "Registri dei rientri per luogo",
    byRegion: (c: Country) => `Ripartiti per ${regione(c)}`,
    datasetName: (c: Country) => `Registro dei rifornimenti iPhone per il ritiro negli Apple Store ${inPaese(c.cc)}`,
    datasetDescription: (c: Country) => `Ogni rientro ed esaurimento confermato di iPhone Duo, iPhone 18 Pro e iPhone 18 Pro Max per il ritiro in negozio ${c.cc === "us" ? "nei 269 Apple Store USA" : `negli Apple Store ${inPaese(c.cc)}`}, con negozio, configurazione esatta e ora.`,
    datasetMeasured: ["Apple Store", "modello, capacità e colore dell'iPhone", "ora del rifornimento", "ora dell'esaurimento"],
  },

  /* ---------------------------------------------------------------- /map */
  map: {
    metaTitle: (c: Country, n: number) => fitTitleW([`Mappa disponibilità iPhone Duo: ${n === 1 ? "l'Apple Store" : "gli Apple Store"} ${inPaese(c.cc)}`, `Mappa disponibilità iPhone Duo ${inPaese(c.cc)}`, "Mappa disponibilità iPhone Duo"]),
    metaDescription: (c: Country, n: number) => `Mappa in tempo reale ${n === 1 ? "dell'Apple Store" : `${dei(n)} Apple Store`} ${inPaese(c.cc)} con la disponibilità di iPhone Duo, 18 Pro e Pro Max per il Ritiro in negozio adesso, per capacità e colore.`,
    /** regionNoun stays the English key: the map reads its Italian words from cdict map.nouns. */
    country: (c: Country) => ({ name: paese(c.cc), inName: inPaese(c.cc), regionNoun: c.regionNoun, regionNounPlural: c.regionNounPlural }),
    everyStore: "Elenco dei negozi",
    storeCity: (store: string, city: string) => `${city} · ${store}`,
  },

  /* ---------------------------------------------------------------- /{cc}/stores */
  storesIndex: {
    metaDescription: (c: Country, n: number, regions: number, cities: number, duo: number, max: number) => {
      const by = c.regionNoun && regions > 1 ? ` per ${regione(c)} e città` : cities > 1 ? " per città" : "";
      return `Tutti i ${N(n)} Apple Store ${inPaese(c.cc)}${by}, con la disponibilità di iPhone Duo, 18 Pro e Pro Max per il ritiro in tempo reale: il Duo è disponibile in ${N(duo)}, il Pro Max in ${N(max)}.`;
    },
    countAnswer: (n: number, spread: string, top: { name: string; count: number }[]) => `${N(n)} in elenco, ${spread}${top.length ? `. Gruppo più numeroso: ${top[0].name}, ${N(top[0].count)}${top[1] ? `; subito dopo ${top[1].name}, ${N(top[1].count)}` : ""}` : ""}.`,
    howMany: (c: Country) => <>Il conteggio degli Apple Store {inPaese(c.cc)}</>,
    duoNow: (c: Country, n: number, have: Store[]): FaqItem => ({
      q: `${cap(inPaese(c.cc))}, quali Apple Store espongono l'iPhone Duo adesso?`,
      a: have.length === 0 ? `Nessuno ${dei(n)} all'ultima osservazione. Questa pagina e la mappa cambiano appena uno lo rimette in elenco, e una voce nella lista d'osservazione te lo fa sapere per prima.` : `${N(have.length)} su ${N(n)} all'ultima osservazione: ${have.slice(0, 6).map(apple).join(", ")}${have.length > 6 ? " e altri ancora" : ""}.`,
    }),
    faq: (ctx: FaqContext) => placeFaq({ ...ctx, omit: [...(ctx.omit ?? []), "count", "stock", "lasts"] }, IT),
    duoBlock: (alert: string) => `Per averne uno conviene mettere in lista i negozi che puoi raggiungere: [segui l'iPhone Duo](${alert}). Ogni negozio × configurazione esatta è una notifica.`,
    intro: (c: Country, n: number, spread: string, now: { duo: number; max: number; pro: number }, tax: string) => `${n === 1 ? "C'è" : "Ci sono"} **${N(n)} Apple Store** ${inPaese(c.cc)}, ${spread}. In questo momento l'iPhone Duo è a scaffale per il ritiro in **${N(now.duo)}** di questi, l'iPhone 18 Pro Max in **${N(now.max)}** e il 18 Pro in **${N(now.pro)}**. ${tax}`,
    crumb: "Elenco dei negozi",
    panel: (c: Country) => `La tua lista d'osservazione ${inPaese(c.cc)}: prima i telefoni, poi solo i negozi che potresti raggiungere`,
    matrixLabel: "Scaffale negozio per negozio",
    matrixH2: (c: Country) => <>Conteggi a scaffale per modello {inPaese(c.cc)}</>,
    matrixHint: "In elenco all'ultima osservazione / seguite, modello per modello.",
    topCaption: (c: Country) => <>{cap(regione(c, true))} con più Apple Store (dall&apos;elenco dei negozi Apple, così come lo seguiamo qui)</>,
    regionHead: (c: Country) => cap(regione(c)),
    colStores: "Apple Store",
    colCities: "Città",
    locationsBy: (c: Country) => `Elenco dei negozi, ${regione(c)} per ${regione(c)}`,
    locationsIn: (c: Country) => `Elenco dei negozi ${inPaese(c.cc)}`,
    storeCount: (n: number) => <>{N(n)} Apple Store</>,
    storeCountAll: (n: number) => <>{pl(n, "negozio", "negozi")}</>,
    whenRestock: (c: Country) => <>Gli orari dei rientri {inPaese(c.cc)}</>,
    howFast: (c: Country) => <>Quanto sono rimaste in elenco le voci {inPaese(c.cc)}</>,
    faqTitle: (c: Country) => `Domande dal campo sui negozi ${inPaese(c.cc)}`,
    getApp: "Installa l'app web",
    howItWorks: "Note di metodo",
    pricing: "Piani e prezzi",
  },

  /* ---------------------------------------------------------------- /iphone-duo-restock-times */
  restockTimes: {
    fmt: {
      n: N,
      pct: rtPct,
      date: giorno,
      longDate: giornoLungo,
      zoneStamp: conFuso,
      local: (iso: string, store: Parameters<typeof localStamp>[1]) => localStamp(iso, store, IT),
      hour: ora,
      range: fascia,
      weekday: (d: number) => GIORNI[d],
      store: (s: Store) => apple(s),
      storeWithPlace: (s: Store) => `${cityLabel(s.country, s.city, IT)} · ${apple(s)}`,
    },
    title: (c: Country) => `Rientri dell'iPhone Duo ${inPaese(c.cc)}: il registro delle osservazioni`,
    metaDescription: (x: RestockTimesMeta) => {
      const { c, t, w, pattern } = x;
      const where = inPaese(c.cc);
      const region = c.cc === "us" ? "stato" : c.regionNoun ? regione(c) : "negozio";
      const since = giorno(t.since, false);
      return t.n > 0 && pattern
        ? fitTitleW([
          `${pl(t.n, "rientro", "rientri")} di iPhone Duo ${where} dal ${since}: ${il(rtPct(w.share))} ${tra(w.from, w.to)}${t.sellout ? `, ${il(rtPct(t.sellout.within2min))} sparito entro 2 minuti` : ""}. Per ora, giorno, ${region}, negozio e configurazione.`,
          `Registro dei rientri di iPhone Duo ${where}: ${N(t.n)} dal ${since}, per ora, giorno, ${region} e configurazione.`,
        ], 158)
        : `Registro dei rientri di iPhone Duo ${where}: ${pl(t.n, "rientro annotato", "rientri annotati")} dal ${since}, per ora, giorno, ${region} e configurazione.`;
    },
    h1: (x: RestockTimesView) => `Rientri dell'iPhone Duo ${inPaese(x.c.cc)}: ${x.t.n > 0 && x.pattern ? `annotati soprattutto ${tra(x.w.from, x.w.to)}, ora del negozio` : "il registro, ora per ora"}`,
    intro: (x: RestockTimesView) => {
      const { t, one, tracked } = x;
      const where = inPaese(x.c.cc);
      return t.unknown ? (
        <>Il registro dei rientri non è leggibile in questo momento; le osservazioni sui negozi {where} continuano, e la pagina ritrova i suoi numeri al prossimo caricamento.</>
      ) : t.n > 0 ? (
        <>Il registro {one ? "dell'Apple Store" : "degli Apple Store"} {where} contiene <b className="text-ink">{pl(t.n, "rientro di iPhone Duo", "rientri di iPhone Duo")} dal {giornoLungo(t.since)}</b>{tracked > 1 ? <>, distribuiti su {N(t.days)} {dei(tracked)} giorni</> : <> (finora una sola giornata di osservazione)</>}.</>
      ) : (
        <>Dal {giornoLungo(t.since)} il registro {one ? "dell'Apple Store" : `dei ${N(x.stores)} Apple Store`} {where} non contiene ancora alcun rientro confermato di iPhone Duo per il ritiro.</>
      );
    },
    hero: {
      restocks: (x: RestockTimesView) => `rientri annotati dal ${giorno(x.t.since, false)}`,
      window: (x: RestockTimesView) => `${fascia(x.w.from, x.w.to)}, ora del negozio`,
      days: "giorni con almeno un rientro",
      /** English infers a literal union for this ternary; the cast widens it to Italian text. */
      now: ((one: boolean): string => (one ? "negozio lo espone per il ritiro in questo momento" : "negozi lo espongono per il ritiro in questo momento")) as Dict["views"]["restockTimes"]["hero"]["now"],
      today: (x: RestockTimesView, today: DayRow) => `oggi (${giorno(today.date)})${x.one ? "" : `, presso ${pl(today.stores, "negozio", "negozi")}`}, per ora`,
      weekday: "il giorno della settimana più fitto finora",
    },
    heroPoints: (x: RestockTimesView, latest: { config: string; store: Store; at: string } | null): Point[] => [
      ...(latest ? [{ text: <>Il più recente: <b className="text-ink">{latest.config}</b>{x.one ? null : <> presso <Link href={storePath(latest.store)} className="underline underline-offset-2">{apple(latest.store)}</Link></>}, {localStamp(latest.at, latest.store, IT)} ora del negozio</> }] : []),
      ...(x.t.peakWeekday != null ? [{ text: <>Il giorno che ricorre di più: <b className="text-ink">{GIORNI[x.t.peakWeekday]}</b></> }] : []),
      { text: <>Apple <b className="text-ink">non pubblica un calendario</b> delle consegne; qui ci sono solo le nostre osservazioni confermate, rilette circa ogni cinque minuti</>, no: true },
    ],
    emptyPoints: (x: RestockTimesView): Point[] => [
      { text: <>Adesso <b className="text-ink">{N(x.duoNow)}/{N(x.stores)}</b> {x.one ? "lo espone" : "lo espongono"} per il ritiro</> },
      { text: <>Le tabelle qui sotto cominciano a riempirsi dal primo rientro confermato</>, step: true },
      { text: <>Andamenti orari e settimanali, dove il registro è più lungo: <Link href="/iphone-duo-restock-times" className="underline underline-offset-2">la pagina USA (in inglese)</Link></>, step: true },
    ],
    setUpAlert: "Inizia una lista d'osservazione per l'iPhone Duo",
    logLive: "Apri il registro dei rientri dal vivo",
    onThisPage: "Sezioni",
    nav: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": "Ore",
      "day-by-day": "Calendario",
      where: `Luoghi (${rtRegion(x)})`,
      configuration: "Configurazioni",
      "how-long": "Permanenza",
      unavailable: "«Non disponibile»?",
      reddit: "Voci dai forum",
      method: "Regole di conteggio",
    }),
    h2: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": `${cap(inPaese(x.c.cc))}, in che ore del giorno rientra l'iPhone Duo?`,
      "day-by-day": `${cap(inPaese(x.c.cc))}, in quali giornate è rientrato l'iPhone Duo?`,
      where: `${cap(inPaese(x.c.cc))}, quali Apple Store vedono rientrare più spesso l'iPhone Duo?`,
      configuration: `${cap(inPaese(x.c.cc))}, quale configurazione di iPhone Duo rientra più spesso?`,
      "how-long": `${cap(inPaese(x.c.cc))}, quanto resta a scaffale un iPhone Duo rientrato?`,
      unavailable: "Perché ogni Apple Store risponde «al momento non disponibile»?",
      reddit: "I rientri di iPhone Duo secondo Reddit, e secondo il registro",
      method: "Con quali regole ShelfSpring conta un rientro?",
    }),
    faq: (x: RestockTimesView): Faq[] => {
      const { t, w, pattern } = x;
      const where = inPaese(x.c.cc);
      return [
        { q: `${cap(where)}, a che ora compaiono i rientri dell'iPhone Duo?`, a: t.n > 0 && pattern
          ? `Il registro ne colloca ${il(rtPct(w.share))} ${tra(w.from, w.to)}, ora del negozio, su ${pl(t.n, "rientro confermato", "rientri confermati")} dal ${giornoLungo(t.since)}. Apple non pubblica alcun calendario.`
          : `Apple non pubblica alcun calendario; il registro contiene ${pl(t.n, "rientro confermato", "rientri confermati")} ${where} dal ${giornoLungo(t.since)}. Un'ora tipica si indica solo da ${PATTERN_MIN} rientri su ${PATTERN_MIN_DAYS} giorni diversi.` },
      ];
    },
    sources: {
      applePickup: "La spiegazione di Apple, «Consegna e ritiro»",
      newsroom: "«iPhone Duo arriva negli Apple Store di tutto il mondo» · comunicato stampa di Apple (in inglese), 23 ottobre 2026",
      macRumors: "«Il sistema di ritiro negli Apple Store per l'iPhone Duo torna attivo negli Stati Uniti e in Canada» · notizia di MacRumors (in inglese), 24 ottobre 2026",
      reports: (tracker: string) => `${tracker}, note sull'iPhone Duo nella settimana del lancio: tenute fuori da questo registro e mai conteggiate`,
    },
    ld: (x: RestockTimesView) => ({
      datasetName: `Orari dei rifornimenti di iPhone Duo negli Apple Store ${inPaese(x.c.cc)}`,
      description: `Ogni rientro confermato di iPhone Duo per il ritiro in negozio negli Apple Store ${inPaese(x.c.cc)} dal ${giornoLungo(x.t.since)}, con negozio, configurazione e ora; riassunto per ora locale, giorno, ${rtRegion(x)}, negozio e configurazione.`,
      spatial: `Apple Store ${inPaese(x.c.cc)}`,
      measured: ["ora del rifornimento (ora locale del negozio)", "Apple Store", "capacità e colore dell'iPhone Duo", "secondi prima dell'esaurimento"],
      size: `${pl(x.t.n, "rifornimento", "rifornimenti")} in ${pl(x.t.stores, "negozio", "negozi")}`,
    }),
    crumb: "Registro dei rientri dell'iPhone Duo",

    // ---- time of day
    timeLead: (x: RestockTimesView) => <b>Fascia {fascia(x.w.from, x.w.to)} (ora del negozio): {il(rtPct(x.w.share))} {dei(x.t.n)} rientri annotati. Fra le 8:00 e mezzogiorno: {il(rtPct(hourShare(x.t.byHour, 8, 12)))}.</b>,
    busiestHour: (count: number) => `l'ora più fitta: ${pl(count, "rientro", "rientri")}`,
    morning: "fra le 8:00 e mezzogiorno",
    evening: "dopo le 17:00: anche la sera conta",
    night: "fra mezzanotte e le 6:00",
    tooFew: (x: RestockTimesView) => (x.t.n > 0
      ? <b>Giorni ancora troppo pochi per un&apos;ora tipica: {pl(x.t.n, "rientro confermato", "rientri confermati")} su {pl(x.t.days, "giorno", "giorni")} dal {giornoLungo(x.t.since)}.</b>
      : <b>Giorni ancora troppo pochi per un&apos;ora tipica: dal {giornoLungo(x.t.since)} nessun rientro confermato.</b>),
    tooFewKeys: (): Point[] => [
      { text: <>Un&apos;ora tipica richiede <b className="text-ink">{PATTERN_MIN} rientri su {PATTERN_MIN_DAYS} giorni distinti</b></> },
      { text: <>Dieci rientri arrivati tutti insieme sono un episodio, non un&apos;abitudine</>, no: true },
      { text: <>Ogni nuova giornata osservata riscrive la pagina da sola</>, step: true },
    ],
    hourCaption: (x: RestockTimesView) => `Rientri di iPhone Duo annotati ${inPaese(x.c.cc)} per ora del negozio, ${giorno(x.t.since, false)} → oggi, ${N(x.t.n)} in tutto`,
    hourHead: ["Ora del negozio (24 h)", "Rientri", "% del registro"],
    morningKeys: (x: RestockTimesView): Point[] => [
      { text: <>Il picco del mattino <b className="text-ink">non coincide con l&apos;apertura</b>{x.us ? ": negli USA quasi ogni Apple Store apre alle 10:00" : ""}</> },
      { text: <>Le voci con ritiro vengono liberate <b className="text-ink">online</b>, prima che le porte si aprano</> },
      { text: <>Se guardi a mano, concentrati sulla fascia <b className="text-ink">{fascia(x.w.from, x.w.to)}</b> nei giorni feriali</>, step: true },
      { text: <>Per le <b className="text-ink">altre 22 ore</b>, quando nessuno ricarica la pagina, c&apos;è la <Link href={x.alert}>lista d&apos;osservazione</Link></>, step: true },
    ],
    storeChartKeys: (x: RestockTimesView): Point[] => [{ text: <>Il grafico di ciascun negozio usa l&apos;ora di quel negozio (<Link href={x.storesHref}>{x.us ? "Apple Store per stato" : `negozi ${inPaese(x.c.cc)}`}</Link>): utile per scoprire se un negozio rientra alle 8:00 mentre gli altri lo fanno alle 9:00</>, step: true }],

    // ---- day by day
    dayLead: (x: RestockTimesView) => {
      const { t, tracked, one } = x;
      if (t.n > 0 && tracked === 1) return <b>Una sola giornata di osservazione finora, {giorno(t.daily[t.daily.length - 1]?.date ?? t.since)}: {pl(t.n, "rientro confermato", "rientri confermati")}{one ? "" : ` presso ${pl(t.stores, "negozio", "negozi")}`}.</b>;
      if (t.n > 0) {
        const days = t.days === tracked ? `Tutti i giorni osservati (${N(t.days)} su ${N(t.days)}) contengono` : `Dal ${giornoLungo(t.since)}, ${N(t.days)} ${dei(tracked)} giorni ${t.days === 1 ? "contiene" : "contengono"}`;
        return <b>{days} almeno un rientro confermato{t.peakWeekday != null ? `; il giorno della settimana più fitto è ${ilGiorno(t.peakWeekday)}` : ""}.</b>;
      }
      return <b>Dal {giornoLungo(t.since)} nessun rientro confermato {inPaese(x.c.cc)}.</b>;
    },
    daysTracked: "giorni osservati con almeno un rientro",
    busiestDay: (x: RestockTimesView, day: DayRow) => `giornata più fitta, ${giorno(day.date)}${x.one ? "" : `, presso ${pl(day.stores, "negozio", "negozi")}`}`,
    busiestDayNone: "giornata più fitta",
    drop: (x: RestockTimesView, drop: { at: string; restocks: number }) => `negozi con un rientro nella stessa mezz'ora, ${conFuso(drop.at, x.c)} (${pl(drop.restocks, "configurazione", "configurazioni")}): da fuori ha l'aspetto di un rilascio nazionale`,
    weekend: (x: RestockTimesView) => `di sabato o di domenica (${pl(x.weekend, "rientro", "rientri")})`,
    dayCaption: (x: RestockTimesView) => `Rientri di iPhone Duo annotati ${inPaese(x.c.cc)} per giorno di calendario${x.t.reports.length ? ". Le righe grigie «segnalato» vengono da note pubbliche di altri tracker sui giorni prima dell'apertura del registro; completano la cronologia e non entrano in nessun conteggio" : ""}`,
    dayHead: { date: "Giorno", restocks: "Rientri", stores: "Negozi", busiest: "Ora di punta (24 h)", source: "Annotato da" },
    soFar: " · in corso",
    reportedBy: (names: string[]) => <>{names.join(" / ")}, segnalato</>,
    dayKeys: (x: RestockTimesView, launch: string, resumed: string): Point[] => [
      { text: <><b className="text-ink">{giorno(launch)}</b>: il lancio, con le prime unità destinate agli ordini online</> },
      { text: <><b className="text-ink">{giorno(resumed)}</b>: le prenotazioni con ritiro ripartono{x.us ? " (MacRumors)" : ""}</> },
      x.t.reports.length
        ? { text: <>Righe <b className="text-ink">«segnalato»</b>: note di {list(IT, x.reportNames)} sui primi giorni del lancio, escluse da ogni totale</> }
        : { text: <>Il registro di ogni negozio {inPaese(x.c.cc)} si apre il <b className="text-ink">{giornoLungo(x.t.since)}</b></> },
      ...(x.t.n > 0 && x.t.peakWeekday == null ? [{ text: <>Il giorno della settimana più fitto si indica quando il registro copre <b className="text-ink">{WEEKDAY_MIN_SPAN} giorni</b> (per ora ne copre {N(x.tracked)})</>, no: true }] : []),
      { text: <>Occhio alla colonna <b className="text-ink">negozi</b>: a parità di rientri, una giornata distribuita su più negozi ti offre più possibilità</>, step: true },
    ],

    // ---- where
    whereLead: (x: RestockTimesView, hit: { name: string; restocks: number; stores: number; storesTotal: number }[], total: number) => (
      <b>In testa {hit[0].name}, con {pl(hit[0].restocks, "rientro", "rientri")} {hit[0].storesTotal === 1 ? "nel suo unico negozio" : `presso ${N(hit[0].stores)}/${N(hit[0].storesTotal)} negozi`} dal {giorno(x.t.since, false)}{hit[1] ? <>; seguono {hit[1].name} ({N(hit[1].restocks)})</> : null}{hit[2] ? <> e {hit[2].name} ({N(hit[2].restocks)})</> : null}. Con almeno un rientro: {N(hit.length)}/{N(total)} {hit.length === 1 && total === 1 ? rtRegion(x) : rtRegions(x)}{total - hit.length > 0 ? `; ancora a zero: ${N(total - hit.length)}` : ""}.</b>
    ),
    whereNone: (x: RestockTimesView) => <b>{cap(nessuna(nounOf(x)))} {inPaese(x.c.cc)} ha ancora un rientro confermato; la tabella parte dal primo.</b>,
    regionCaption: (x: RestockTimesView) => `Rientri di iPhone Duo annotati per ${rtRegion(x)} ${inPaese(x.c.cc)}, ${giorno(x.t.since, false)} → oggi`,
    regionHead: (x: RestockTimesView) => [cap(rtRegion(x)), "Rientri", "Negozi con un rientro", "Il più recente (ora del negozio)"],
    ofN: (a: number, b: number) => <>{N(a)}/{N(b)}</>,
    storesCaption: (x: RestockTimesView) => `I negozi con il registro di rientri di iPhone Duo più lungo ${inPaese(x.c.cc)}, ${giorno(x.t.since, false)} → oggi`,
    storesHead: ["Negozio", "Rientri", "Giorni con un rientro", "Ora tipica", "Il più recente (ora del negozio)"],
    swaps: (x: RestockTimesView) => [
      { no: "Il negozio con più rientri, dovunque sia", yes: `Due o tre negozi a meno di un'ora da te, tenuti d'occhio ${x.pattern ? dalle(x.w.from) : "dal mattino"}`, why: "Un rientro irraggiungibile non serve; anche il negozio più vivace resta fuori scaffale tutto il giorno, salvo pochi minuti." },
      { no: "Un negozio solo, sperando", yes: "Una voce in lista per ciascuno, poi vai dove scatta", why: "La tabella dei conteggi serve solo a decidere quale dei tuoi negozi controllare per primo." },
    ],
    nearMe: "Negozi vicini con il Duo a scaffale, adesso",

    // ---- configuration
    configLead: (x: RestockTimesView, top: { label: string; restocks: number }, rarest: { label: string; restocks: number } | null) => (
      <b>In cima {top.label}, con {N(top.restocks)} {dei(x.t.n)} rientri ({rtPct(top.restocks / x.t.n)}){rarest ? `; in fondo ${rarest.label}, ${pl(rarest.restocks, "rientro", "rientri")}` : ""}.</b>
    ),
    mostRestocked: (config: string) => `${config}: la configurazione rientrata più spesso`,
    versus: (a: string, bCount: number, b: string) => `rientri di ${a}, a fronte di ${N(bCount)} di ${b}`,
    restocksOf: (a: string) => `rientri di ${a}`,
    byStorage: "per capacità",
    byColour: "per finitura",
    configNone: (x: RestockTimesView) => <b>{x.t.n > 0 ? "Nessuna" : "Per ora nessuna"} configurazione {inPaese(x.c.cc)} ha un rientro confermato; le {N(x.configs)} configurazioni sono comunque in tabella, così il primo rientro trova già la sua riga.</b>,
    configCaption: (x: RestockTimesView) => `Rientri di iPhone Duo annotati ${inPaese(x.c.cc)}, una riga per configurazione, ${giorno(x.t.since, false)} → oggi`,
    configHead: ["Configurazione", "Rientri", "% del registro", "Il più recente (ora del negozio)"],
    configKeys: (x: RestockTimesView): Point[] => [
      { text: <>Scegliere la configurazione pesa <b className="text-ink">più che scegliere il negozio</b></> },
      x.storageRatio != null
        ? { text: <>Accetta la capacità che rientra più spesso: circa <b className="text-ink">{N(x.storageRatio)}×</b> le occasioni della capacità che segue</> }
        : { text: <>Accetta la capacità che rientra più spesso: le occasioni crescono <b className="text-ink">parecchio</b></> },
      { text: <>Il <b className="text-ink">2TB</b>: meglio ordinarlo con consegna e aspettare</>, no: true },
      { text: <>Prezzi e scaffali adesso: <Link href="/which-iphone-duo-restocks-most">Quale iPhone Duo rientra più spesso?</Link></>, step: true },
    ],

    // ---- how long
    howLongLead: (x: RestockTimesView, sell: SelloutFacts) => <b>Permanenza mediana a scaffale {inPaese(x.c.cc)}: {N(sell.medianSec)} secondi, su {pl(sell.n, "rientro misurato", "rientri misurati")}. Fuori scaffale entro 2 minuti: {il(rtPct(sell.within2min))}; entro 20: {il(rtPct(sell.within20min))}.</b>,
    secUnit: "s",
    medianListing: "tempo mediano a scaffale",
    within2: "fuori scaffale entro 2 min",
    within20: "fuori scaffale entro 20 min",
    fastest: "la permanenza più breve misurata",
    howLongNone: (x: RestockTimesView) => <b>{x.t.n > 0 ? "Troppo" : "Per ora troppo"} pochi rientri conclusi {inPaese(x.c.cc)} per misurare la permanenza; queste cifre compaiono da dieci in su, e la pagina USA ha il quadro intero.</b>,
    howLongKeys: (x: RestockTimesView): Point[] => [
      { text: <>Una finestra di due minuti si coglie con la <b className="text-ink">lista d&apos;osservazione</b>, non ricaricando apple.com</> },
      { text: <>È la cifra che spiega il resto di questa pagina</> },
      { text: <>Ogni rientro con i secondi di permanenza, per configurazione e {rtRegion(x)}: <Link href="/iphone-duo-sell-out-times">Quanto resta a scaffale un rientro di iPhone Duo?</Link></>, step: true },
    ],
    measured: "Ogni durata va dall'osservazione che ha visto per prima la configurazione disponibile a quella che l'ha trovata sparita: è quindi un tetto massimo, e la permanenza vera è più breve.",

    // ---- unavailable
    unavailableLead: (x: RestockTimesView) => <b>Un rientro dura un attimo, non è una condizione stabile: {x.one ? "un negozio" : `${N(x.stores)} negozi`} × {N(x.configs)} configurazioni fanno {N(x.pairs)} voci che possono comparire {inPaese(x.c.cc)}, e adesso l&apos;iPhone Duo è a scaffale in {pl(x.duoNow, "negozio", "negozi")}.</b>,
    pairs: "coppie negozio × configurazione che possono comparire",
    listingNow: "con un iPhone Duo a scaffale adesso",
    goneIn2: "dei rientri spariti entro due minuti",
    last24: "rientri confermati nelle ultime 24 ore",
    unavailableKeys: (x: RestockTimesView, today: number): Point[] => [
      x.recent.restocks > 0
        ? { text: <>Ultime 24 ore: <b className="text-ink">{pl(x.recent.restocks, "rientro confermato", "rientri confermati")}</b> presso {pl(x.recent.stores, "negozio", "negozi")} {inPaese(x.c.cc)}</> }
        : today > 0
          ? { text: <>Oggi: <b className="text-ink">{pl(today, "rientro confermato", "rientri confermati")}</b> {inPaese(x.c.cc)}</> }
          : { text: <>La tabella giorno per giorno qui sopra mostra i rientri avvenuti</> },
      { text: <>Ciascuno visibile su apple.com per <b className="text-ink">un paio di minuti</b></> },
      { text: <>«Non disponibile ovunque» al quarto giorno, o al quattordicesimo, <b className="text-ink">non</b> vuol dire che Apple ha smesso</>, no: true },
    ],
    unavailableLinks: { explained: "Come leggere «al momento non disponibile per il ritiro»", howToGet: "Una strada concreta per averne uno" },

    // ---- reddit
    redditLead: (x: RestockTimesView) => <b>Le voci che girano su <a href="https://www.reddit.com/r/applestore/" target="_blank" rel="noopener nofollow">r/applestore</a> e <a href="https://www.reddit.com/r/iphone/" target="_blank" rel="noopener nofollow">r/iphone</a> sono in buona fede, ma riguardano un negozio solo e invecchiano in un giorno; qui le quattro più frequenti, messe accanto a {pl(x.t.n, "rientro confermato", "rientri confermati")} {inPaese(x.c.cc)}.</b>,
    redditCaption: "Voci frequenti su Reddit sui rientri di iPhone Duo, confrontate con i rientri confermati nel registro di ShelfSpring",
    redditHead: ["La voce", "Che cosa dice il registro"],
    claims: (x: RestockTimesView): { claim: string; answer: ReactNode }[] => {
      const { t, w, tracked, recent } = x;
      return [
        { claim: "«Rientrano di notte: guarda alle 3.»", answer: t.n > 0 ? <>Fra mezzanotte e le 6:00, ora del negozio: {il(rtPct(hourShare(t.byHour, 0, 6)))} dei rientri. Fascia {fascia(w.from, w.to)}: {il(rtPct(w.share))}.</> : "Il registro non ha ancora rientri per verificarlo." },
        { claim: "«Apple rifornisce un solo giorno a settimana.»", answer: t.n > 0 ? (t.peakWeekday != null ? <>Il giorno più fitto finora è {ilGiorno(t.peakWeekday)} ({N(t.byWeekday[t.peakWeekday])} su {N(t.n)}), ma i rientri cadono in {N(t.days)} giorni su {N(tracked)}.</> : <>I rientri cadono in {N(t.days)} {dei(tracked)} giorni osservati{t.days === tracked ? ", nessuno escluso" : ""}; il giorno più fitto si indica quando il registro copre {WEEKDAY_MIN_SPAN} giorni.</>) : "Il registro non ha ancora rientri per verificarlo." },
        { claim: "«Telefona al negozio: ti dicono quando scaricano.»", answer: "Apple non pubblica alcun calendario delle consegne; su apple.com compaiono voci con ritiro liberate online, e il personale del negozio le scopre insieme a tutti gli altri." },
        { claim: "«Se dice non disponibile, è finito per sempre.»", answer: recent.restocks > 0 ? <>Nelle ultime 24 ore il registro ha {pl(recent.restocks, "rientro confermato", "rientri confermati")} presso {pl(recent.stores, "negozio", "negozi")}; {recent.restocks === 1 ? "è tornato" : "ognuno è tornato"} «non disponibile» in pochi minuti.</> : t.n > 0 ? <>Dal {giorno(t.since, false)} il registro ha {pl(t.n, "rientro confermato", "rientri confermati")}; {t.n === 1 ? "è tornato" : "ognuno è tornato"} «non disponibile» in pochi minuti.</> : "Ancora niente per verificarlo." },
      ];
    },
    redditKeys: (): Point[] => [
      { text: <>Il passaparola riempie il vuoto quando <b className="text-ink">mancano i dati</b>; questo registro è i dati, ed è gratis</> },
      { text: <>Dove Reddit ci prende: i <b className="text-ink">consigli sul pagamento</b>, cioè accesso già fatto e Apple Pay pronto (<Link href="/how-to-grab-an-iphone-duo-restock">la nostra versione, in 20 secondi</Link>)</> },
    ],

    // ---- method
    methodLead: <b>Un rientro entra nel registro quando una configurazione assente compare fra le voci con ritiro di un negozio su apple.com e due osservazioni consecutive lo confermano.</b>,
    methodKeys: (x: RestockTimesView): Point[] => [
      { text: <>{x.one ? "L'Apple Store" : "Ogni Apple Store"} {inPaese(x.c.cc)} è osservato con <b className="text-ink">aggiornamenti frequenti</b></> },
      { text: <>Un primo «disponibile» viene <b className="text-ink">riletto</b> prima di contare</> },
      { text: <>Una voce che sparisce si conferma all&apos;<b className="text-ink">osservazione successiva</b></> },
      { text: <>La prima volta che vediamo un negozio, una richiesta fallita o scaduta: <b className="text-ink">mai</b> un rientro, mai «esaurito»</>, no: true },
      { text: <>Ore e date nell&apos;<b className="text-ink">ora del negozio</b>; «ondate» = la stessa mezz&apos;ora in fusi diversi</> },
      { text: <>Note di altri tracker{x.t.reports.length ? ` (${list(IT, x.reportNames)})` : ""}: righe a parte, etichettate, <b className="text-ink">mai in un totale</b></> },
      { text: <>Riletto circa ogni cinque minuti; <Link href={x.logHref}>il registro dei rientri</Link> è dal vivo</>, step: true },
    ],
    quote: "Puoi citare queste cifre con un link a questa pagina; ShelfSpring è indipendente, non ha legami con Apple e osserva la stessa disponibilità per il ritiro che chiunque vede su apple.com.",
    alertIn: (x: RestockTimesView) => <>Metti l&apos;iPhone Duo nella lista d&apos;osservazione{x.one ? "" : ` ${inPaese(x.c.cc)}`}</>,

    // ---- related, FAQ, sources
    related: "Altro dallo stesso registro",
    sameData: "Domande a cui questo registro risponde",
    questions: {
      sellOut: "Quanto resta in elenco un rientro?",
      alerts: "Sapere per primi di un rientro",
      howToGet: "Una strada concreta per averne uno",
      whichConfig: "Quale configurazione rientra più spesso",
      nearMe: "Quali negozi vicini lo espongono adesso",
      unavailable: "Come leggere «al momento non disponibile»",
    },
    otherCountries: ((us: boolean): string => (us ? "Lo stesso studio in altri paesi" : "I registri di altri paesi")) as Dict["views"]["restockTimes"]["otherCountries"],
    faqTitle: "Domande dal campo",
  },
};


export const views: Dict["views"] = withShelfViews("it", baseViews);
