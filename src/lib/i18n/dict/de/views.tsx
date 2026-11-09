import { withShelfViews } from "@/lib/seo/localizedCopy";
/**
 * German strings: views — the product × place pages, the restock log, the live map, the iPhone Duo
 * restock-times answer page and the store index. `c: Country` is English data: named here in German
 * (util.land / inLand); place names passed as strings are already German.
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import type { RestockTimesMeta, RestockTimesView } from "../en/views";
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
import { SPEED } from "@/lib/plans";
import { distance, list, stamp, weekdays } from "@/lib/i18n/format";
import { appleStoreLabel, cityLabel, colorLabel, regionLabel, storeLabel } from "@/lib/i18n/places";
import { LANG, cap, dativ, fitDe, ganz, inLand, inOrt, land, modelDe, money, n, pct, plural, regionWord, span, taxNote, uhr, zwischen } from "./util";

/*
 * Voice (2026-11-08): ShelfSpring's observation ledger. A restock is a „Rückkehr“ (ins Regal), a status is „im Regal“ /
 * „nicht im Regal“, a check is a „Blick“ / „Beobachtung“, a configuration a „Variante“, an alert list the „Merkliste“,
 * store-local time the „Store-Uhr“. The reader is addressed with „du“.
 */
const apple = (s: Store) => appleStoreLabel(s, LANG);
const words = (items: string[], max = 6) => list(LANG, items, max, (k) => `${n(k)} weitere`);
const hat = (k: number) => (k === 1 ? "hat" : "haben");
/** "1 Rückkehr", "12 Rückkehren". */
const restocks = (k: number) => plural(k, "Rückkehr", "Rückkehren");
const confirmed = (k: number) => plural(k, "verzeichnete Rückkehr", "verzeichnete Rückkehren");
const listet = (k: number) => (k === 1 ? "listet" : "listen");
/** Meta descriptions keep their established wording (unchanged by the 2026-11-08 voice pass). */
const metaRestocks = (k: number) => plural(k, "Restock", "Restocks");
const storesN = (k: number) => plural(k, "Store", "Stores");
const dayN = (k: number) => (k === 1 ? "einem Tag" : `${n(k)} Tagen`);
const wd = (d: number) => weekdays(LANG)[d];
/** "Montag" → "montags". */
const wdAdv = (d: number) => `${wd(d).toLowerCase()}s`;

/* ---------------------------------------------------------------- restock-times helpers */

const rtN = (x: number) => n(x);
const rtPct = (x: number) => (x > 0 && x < 0.005 ? "<1 %" : pct(Math.round(x * 100)));
const dateLabel = (ymd: string, weekday = true) => new Intl.DateTimeFormat("de-DE", { timeZone: "UTC", month: "short", day: "numeric", ...(weekday ? { weekday: "short" as const } : {}) }).format(new Date(`${ymd}T12:00:00Z`));
const longDate = (ymd: string) => new Intl.DateTimeFormat("de-DE", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${ymd}T12:00:00Z`));
const zoneStamp = (iso: string, c: Country) => stamp(LANG, iso, c.timeZone, true);
const rtRegion = (x: { us: boolean; c: Country }) => (x.us ? "Bundesstaat" : regionWord(x.c));
const rtRegions = (x: { us: boolean; c: Country }) => (x.us ? "Bundesstaaten" : regionWord(x.c, true));
const where = (c: Country) => inLand(c.cc);

/* ---------------------------------------------------------------- product × place helpers */

const ccOf = (p: { country?: CountryCode }) => p.country ?? "us";
/** "iPhone Duo 512GB Nachthimmel" / "Duo 512GB Nachthimmel": the product in German. */
const prodName = (p: Product) => [modelByKey(p.model)!.name, p.storage, p.color ? colorLabel(p.color, LANG) : null].filter(Boolean).join(" ");
const prodShort = (p: Product) => [modelByKey(p.model)!.short, p.storage, p.color ? colorLabel(p.color, LANG) : null].filter(Boolean).join(" ");
/** The place in German: the country, region, city or "Apple …" store. */
function placeN(place: Place): string {
  const cc = ccOf(place);
  if (cc === "us") return place.level === "country" ? "USA" : place.name;
  if (place.level === "country") return land(cc);
  if (place.level === "state") return `${cc === "ch" ? "Kanton " : ""}${regionLabel(cc, place.state!, LANG)}`;
  if (place.level === "city") return cityLabel(cc, place.city!, LANG);
  return apple(place.store!);
}
/** "in München", "bei Apple Rosenstraße", "in Deutschland". */
const atPlace = (place: Place) => (place.level === "store" ? `bei ${placeN(place)}` : place.level === "country" ? inLand(ccOf(place)) : inOrt(placeN(place)));
const withApple = (name: string) => (/^apple\b/i.test(name) ? name : `Apple ${name}`);

function productTitle(product: Product, place: Place, inStock: number): string {
  const name = prodName(product), short = prodShort(product);
  const cc = ccOf(place);
  if (place.level === "country") {
    return fitDe([
      ...(inStock > 0 ? [`${name} vorrätig in ${plural(inStock, "Apple Store", "Apple Stores")} ${inLand(cc)}`] : []),
      `${name}: Abhol-Verfügbarkeit ${inLand(cc)}, live`,
      `${short}: Verfügbarkeit ${inLand(cc)}`,
      `${short}: Verfügbarkeit`,
    ], 60, cc);
  }
  if (place.level === "store") {
    const s = place.store!;
    const now = inStock > 0 ? "jetzt vorrätig" : "Verfügbarkeit";
    const city = cityLabel(cc, s.city, LANG);
    const withCity = apple(s).toLowerCase().includes(city.toLowerCase()) ? [] : [`${short} bei ${apple(s)}, ${city}`];
    return fitDe([`${name} bei ${apple(s)}: ${now}`, ...withCity, `${short} bei ${apple(s)}`, `${short} bei ${storeLabel(s, LANG)}`, `${short} · ${storeLabel(s, LANG)}`], 60, cc);
  }
  const k = place.stores.length;
  const w = inOrt(placeN(place));
  return fitDe([`${name} ${w}: ${inStock} von ${n(k)} vorrätig`, `${name} ${w}: Abhol-Verfügbarkeit`, `${short} ${w} vorrätig`, `${short} ${w}`], 60, cc);
}

function productDescription(product: Product, place: Place, inStock: number, stats: PlaceStats): string {
  const name = prodName(product);
  const week = `${metaRestocks(stats.week)} diese Woche`;
  const cc = ccOf(place);
  if (place.level === "store") {
    const s = place.store!;
    const now = inStock > 0 ? "jetzt vorrätig" : "gerade nicht vorrätig";
    return fitDe([
      `${name} zur Abholung bei ${apple(s)}, ${cityLabel(cc, s.city, LANG)}: ${now}, ${week}. Live-Status, Restock-Zeiten und Alarme.`,
      `${name} bei ${apple(s)}: ${now}, ${week}. Live-Status und Alarme.`,
    ], 155, cc);
  }
  const w = place.level === "country" ? `Apple Stores ${inLand(cc)}` : `Apple Stores ${inOrt(placeN(place))}`;
  const k = place.stores.length;
  return fitDe([
    `${name} zur Abholung: ${inStock} von ${n(k)} ${w} ${hat(inStock)} es jetzt, ${week}. Live je Store, Restock-Zeiten und Alarme.`,
    `${name}: ${inStock} von ${n(k)} ${w} ${hat(inStock)} es jetzt, ${week}. Live je Store und Alarme.`,
  ], 155, cc);
}

function productFaq(product: Product, place: Place, lines: StoreLine[], stats: PlaceStats, clock: RestockStats, nearest: { name: string; city: string; distance: number } | null): FaqItem[] {
  const out: FaqItem[] = [];
  const name = prodName(product);
  const at = atPlace(place);
  const cc = ccOf(place);
  const dist = (miles: number) => distance(LANG, cc, miles);
  const inStock = lines.filter((l) => l.available.length > 0);
  if (place.level === "store") {
    const l = lines[0];
    out.push({
      q: `Liegt das ${name} ${at} gerade im Regal?`,
      a: l && l.available.length > 0
        ? `Laut letzter Beobachtung ja${product.parts.length > 1 ? ` – gelistet sind ${words(l.available.map((i) => `${i.storage} ${colorLabel(i.color, LANG)}`), 4)}` : ""}.`
        : `Laut letzter Beobachtung nein.${nearest ? ` Ausweichen kannst du nach ${withApple(nearest.name)} (${nearest.city}, ${dist(nearest.distance)}), dort ist es im Regal.` : ""}`,
    });
  } else {
    out.push({
      q: `In welchen Apple Stores ${at} liegt das ${name} im Regal?`,
      a: inStock.length === 0
        ? `Laut letzter Beobachtung in keinem.${nearest ? ` Der nächstgelegene Store, der es listet: ${withApple(nearest.name)} (${nearest.city}, ${dist(nearest.distance)}).` : ""}`
        : `Laut letzter Beobachtung in ${storesN(inStock.length)}: ${words(inStock.map((l) => apple(l.store)), 4)}.`,
    });
  }
  const peak = peakOf(clock, LANG);
  out.push({
    q: `Wie oft kehrt das ${name} ${at} ins Regal zurück?`,
    a: stats.month === 0 ? `In ${stats.days} Tagen keine einzige Rückkehr ${at}.` : `Verzeichnet sind ${restocks(stats.month)} in ${stats.days} Tagen (diese Woche: ${n(stats.week)})${peak ? `; die meisten kamen um ${peak.hour} Store-Zeit` : ""}.`,
  });
  if (stats.medianMs != null) out.push({ q: `Wie lange hält sich eine Rückkehr ${at} im Regal?`, a: `Typisch sind rund ${fmtDuration(stats.medianMs, LANG)} (Median), dann ist die Variante wieder weg.` });
  return out;
}

function priceLabel(product: Product): string {
  const cc = ccOf(product);
  const prices = catalogFor(product.model, cc).filter((c) => product.parts.includes(c.partNumber)).map((c) => c.price);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  const f = (v: number) => money(COUNTRIES[cc], v);
  return lo === hi ? f(lo) : `${f(lo)}–${f(hi)}`;
}

/* ---------------------------------------------------------------- views */

const baseViews: Dict["views"] = {
  common: {
    inCountry: (c: Country) => inLand(c.cc),
    liveMap: "Abhol-Atlas",
    restockLog: "Rückkehr-Logbuch",
    alertMe: "Auf die Merkliste",
    lastDays: (days: number) => <>Rückkehr-Kalender · {days} Tage</>,
    since: "2. November 2026",
    sourcesWhere: (k: number, c: Country) => `${k === 1 ? "der einzige beobachtete Apple Store" : `${n(k)} beobachtete Apple Stores`} ${where(c)}`,
    checker: (c: Country) => `Beobachtungsbuch ${land(c.cc)}`,
    /* Also the ItemList (JSON-LD) name of the store index: kept as it was. */
    appleStoresIn: (c: Country) => `Apple Stores ${where(c)}`,
    storesWithIt: "Stores, die es listen",
    more: "Ebenfalls im Beobachtungsbuch",
  },

  /* ---------------------------------------------------------------- /stock/{product}/{place…} */
  product: {
    title: productTitle,
    description: productDescription,
    faq: productFaq,
    priceLabel,
    inPlace: (name: string, level: PlaceLevel) => (level === "store" ? `bei ${name}` : inOrt(name)),
    h1Country: (model: string, c: Country) => `Regalstand ${modelDe(model)} zur Abholung ${where(c)}`,
    h1Place: (model: string, w: string) => `${modelDe(model)} ${w}`,
    inStockNow: "Jetzt im Regal",
    yes: "Gelistet",
    no: "Nicht gelistet",
    pickup: "Abholantwort",
    configurations: "Varianten gelistet",
    ofStores: (k: number) => `in ${storesN(k)} beobachtet`,
    restocks24h: "Rückkehren, letzter Tag",
    restocksHint: (week: number, month: number, days: number) => `7 Tg.: ${n(week)} · ${days} Tg.: ${n(month)}`,
    sellOuts: (days: number) => `Wieder weg · ${days} Tg.`,
    stays: (ms: number) => { const d = fmtDuration(ms, LANG); return /^(unter|weniger)\b/i.test(d) ? `Median im Regal: ${d}` : `Median im Regal ≈ ${d}`; },
    noPairs: "noch keine volle Regalzeit",
    lastRestock: "Letzte Rückkehr",
    noneYet: "noch nicht gesichtet",
    thisConfig: "genau diese Variante",
    inDays: (days: number) => `keine in ${days} Tagen`,
    notInStockNow: "Gerade nicht im Regal",
    configsInStock: (k: number, of: number) => <span><b className="text-ink">{n(k)}</b>/{n(of)} Varianten im Regal</span>,
    inStockAt: (k: number, of: number) => <span>Im Regal in <b className="text-ink">{n(k)}</b>/{storesN(of)}</span>,
    checked: (live: ReactNode, price: string, tax: string) => <>{price}{tax} · letzte Beobachtung {live}</>,
    taxNote: (c: Country) => taxNote(c),
    beforeTax: "ohne Steuer",
    buyOnApple: "Bei apple.com bestellen",
    allStoresIn: (c: Country) => `Store-Verzeichnis ${where(c)}`,
    everyIphoneHere: "Alle drei iPhones hier",
    everyIphone: (w: string) => `Alle drei iPhones ${w}`,
    panel: (model: string, w: string | null) => `Merkliste ${modelDe(model)}${w ? ` ${w}` : ""}: erst die Varianten, dann die Stores in deiner Reichweite`,
    unitConfigs: "Varianten",
    unitStores: "Stores",
    otherConfigsHere: "Weitere Varianten in diesem Store",
    byStorageColor: "Erst Kapazität, dann Finish",
    nearestStores: "Die nächstgelegenen Stores",
    closest: (link: ReactNode, dist: string) => <>Nächster Store, der es listet: {link} ({dist})</>,
    storeCity: (store: string, city: string) => <>{store}, {city}</>,
    mostRecentlyInStock: "Wo es zuletzt gesichtet wurde",
    storesWithItNow: "Stores, die es heute listen",
    storesIn: (w: string) => `Die Stores ${w}`,
    colStatus: "Regal",
    colConfigs: "Varianten gelistet",
    noStoreHasIt: "Bei der letzten Beobachtung listet es kein Store.",
    noStoreHereHasIt: "Bei der letzten Beobachtung listet es keiner dieser Stores.",
    moreStores: (k: number) => <>{n(k)} weitere Stores listen es · ganzes Store-Verzeichnis öffnen ↗</>,
    byRegion: (c: Country) => `Aufgeteilt nach ${regionWord(c)}`,
    byCity: "Aufgeteilt nach Stadt",
    nearbyStores: "Ausweich-Stores",
    latestChanges: "Neueste Einträge im Beobachtungsbuch",
    nothingLogged: "Die Aufzeichnung ist bisher leer.",
    whenRestocks: "Uhrzeiten der Rückkehren",
    howFast: "Wie lange Angebote im Regal blieben",
    restocksByConfig: "Rückkehren je Variante",
    faqTitleCountry: (model: string, c: Country) => `Fragen aus dem Feld · ${modelDe(model)} ${where(c)}`,
    faqTitle: (model: string, w: string) => `Fragen aus dem Feld · ${modelDe(model)} ${w}`,
    buySource: (model: string, c: Country) => `apple.com ${land(c.cc)}: Bestellseite für das ${modelDe(model)}`,
    nearby: "Orte ringsum",
    otherRegions: (c: Country) => `Mehr ${regionWord(c, true)}`,
    elsewhereIn: (region: string) => (/^Kanton /.test(region) ? `Mehr aus dem ${region}` : `Mehr aus ${region}`),
    everyAppleStoreIn: (c: Country) => `Ganzes Store-Verzeichnis ${where(c)}`,
    across: (model: string, c: Country) => `${modelDe(model)} · ${ganz(land(c.cc))}`,
    itemList: (model: string, w: string) => `${modelDe(model)} ${w}`,
    nearLead: (c: Country, model: string, inStock: number, k: number, have: { store: string; city: string; configs: number }[]) =>
      inStock === 0
        ? `Gerade listet kein Apple Store ${where(c)} das ${modelDe(model)} zur Abholung. „In meiner Nähe“ wird damit zur Frage, welcher erreichbare Store als Erster wieder etwas ins Regal legt: Setz die Stores, die du schaffst, auf deine Merkliste, dann meldet sich dein Handy, sobald dort eine passende Variante auftaucht.`
        : `Im Regal liegt das ${modelDe(model)} gerade in ${n(inStock)} von ${storesN(k)}: ${words(have.slice(0, 5).map((l) => `${l.store} in ${l.city} (${plural(l.configs, "Variante", "Varianten")})`), 5)}.`,
    nearHead: (c: Country) => [cap(regionWord(c)), "Stores, die es jetzt listen"],
    nearCaption: (c: Country, model: string) => `${modelDe(model)} zur Abholung je ${regionWord(c)}, laut letzter Beobachtung`,
    nearMe: (_c: Country, model: string, alert: string) => `Willst du alle Stores nach deinem Standort ordnen, öffne auf dieser Seite die Merkliste und tippe auf den Standort-Knopf (📍): Die Strecken sind geschätzte Straßenkilometer, und zu jedem Store gibt es einen Routenlink. [Merkliste für das ${modelDe(model)} anlegen](${alert}).`,
    modelFaq: (c: Country, model: string, low: number, high: number, inStock: number): { price: FaqItem; reserve: FaqItem } => ({
      price: { q: `Welchen Preis nennt apple.com für das ${modelDe(model)} ${where(c)}?`, a: `${money(c, low)} für die kleinste Kapazität bis ${money(c, high)} für die größte (${taxNote(c)}).` },
      reserve: { q: `Lässt sich ein ${modelDe(model)} ${where(c)} zur Abholung zurücklegen?`, a: `Nur über eine Bestellung. Die Variante gehört dir, sobald du den Checkout auf apple.com mit Abholung im Store abschließt; Apple hält sie dann für das gewählte Zeitfenster bereit.${inStock === 0 ? " Laut letzter Beobachtung listet sie gerade kein Store – über die Merkliste erfährst du es zuerst." : ""}` },
    }),
  },

  /* ---------------------------------------------------------------- /restocks */
  restocks: {
    /* metaTitle, metaDescription, h1 and datasetDescription are replaced by withShelfViews (lib/seo/localizedCopy); kept as they were. */
    metaTitle: (c: Country, k: number) => `iPhone-Restock-Protokoll ${where(c)} – ${k === 1 ? "der Apple Store" : `alle ${n(k)} Apple Stores`}, live`,
    metaDescription: (c: Country, k: number) => `Jeder Restock von iPhone Duo, 18 Pro und Pro Max zur Abholung ${k === 1 ? "im Apple Store" : "in den Apple Stores"} ${where(c)} – mit genauer Uhrzeit, Konfiguration und Karte.`,
    h1: (c: Country) => `Restock-Protokoll ${where(c)}`,
    summary: (day: number, week: number, model?: string, region?: string) => <>Letzter Tag: {restocks(day)}; letzte sieben Tage: {n(week)}{model ? ` · ${modelDe(model)}` : ""}{region ? ` · ${region}` : ""}. Uhrzeiten nach deinem Gerät.</>,
    allModels: "Jedes Modell",
    restocks: "Nur Rückkehren",
    withSoldOut: "Rückkehren und Abgänge",
    regionLabel: (c: Country) => cap(regionWord(c)),
    allRegions: (c: Country) => `${cap(regionWord(c))}: alle`,
    filter: "Anwenden",
    page: (k: number) => <>Blatt {k}</>,
    newer: "← Neuere Einträge",
    older: "Frühere →",
    getAlerts: "Merkliste anlegen",
    byPlace: "Aufzeichnungen nach Ort",
    byRegion: (c: Country) => `Aufgeteilt nach ${regionWord(c)}`,
    /* JSON-LD dataset fields: kept as they were. */
    datasetName: (c: Country) => `Restock-Protokoll für iPhones zur Abholung in Apple Stores ${where(c)}`,
    datasetDescription: (c: Country) => `Jeder bestätigte Restock und Ausverkauf von iPhone Duo, iPhone 18 Pro und iPhone 18 Pro Max zur Abholung ${c.cc === "us" ? "in allen 269 Apple Stores in den USA" : `in den Apple Stores ${where(c)}`}, mit Store, genauer Konfiguration und Uhrzeit. Ein Restock wird erst nach zwei übereinstimmenden Antworten von apple.com erfasst, geprüft alle 15 Sekunden (Stores mit Alarm alle 5).`,
    datasetMeasured: ["Apple Store", "iPhone-Modell, Speicher und Farbe", "Zeitpunkt des Restocks", "Zeitpunkt des Ausverkaufs"],
  },

  /* ---------------------------------------------------------------- /map */
  map: {
    /* metaTitle and metaDescription are replaced by withShelfViews; kept as they were. */
    metaTitle: (c: Country, k: number) => `iPhone-Duo-Verfügbarkeit auf der Karte – ${k === 1 ? "der Apple Store" : "jeder Apple Store"} ${where(c)}, live`,
    metaDescription: (c: Country, k: number) => `Live-Karte ${k === 1 ? "des Apple Store" : `aller ${n(k)} Apple Stores`} ${where(c)}: Abhol-Verfügbarkeit von iPhone Duo, 18 Pro und Pro Max jetzt gerade, nach Speicher und Farbe.`,
    // The map looks up its region words by the English key (cdict map.nouns), so the keys stay English.
    country: (c: Country) => ({ name: land(c.cc), inName: where(c), regionNoun: c.regionNoun, regionNounPlural: c.regionNounPlural }),
    everyStore: "Store-Verzeichnis",
    storeCity: (store: string, city: string) => `${city} · ${store}`,
  },

  /* ---------------------------------------------------------------- /{cc}/stores */
  storesIndex: {
    /* metaDescription, intro and duoBlock are replaced by withShelfViews; kept as they were. */
    metaDescription: (c: Country, k: number, regions: number, cities: number, duo: number, max: number) => {
      const by = c.regionNoun && regions > 1 ? ` nach ${regionWord(c)} und Stadt` : cities > 1 ? " nach Stadt" : "";
      return `Alle ${n(k)} Apple Stores ${where(c)}${by}, mit Live-Verfügbarkeit von iPhone Duo, 18 Pro und Pro Max zur Abholung: ${duo} ${hat(duo)} das Duo jetzt, ${max} das Pro Max.`;
    },
    countAnswer: (k: number, spread: string, top: { name: string; count: number }[]) => `${n(k)} im Verzeichnis, ${spread}${top.length ? `. Größte Gruppe: ${top[0].name} mit ${top[0].count}${top[1] ? `; danach ${top[1].name} mit ${top[1].count}` : ""}` : ""}.`,
    howMany: (c: Country) => <>Die Apple Stores {where(c)}, gezählt</>,
    duoNow: (c: Country, k: number, have: Store[]): FaqItem => ({
      q: `In welchen Apple Stores ${where(c)} liegt das iPhone Duo gerade im Regal?`,
      a: have.length === 0 ? `Laut letzter Beobachtung in keinem der ${n(k)}. Seite und Atlas ziehen nach, sobald einer es listet; mit einer Merkliste hörst du es zuerst.` : `Laut letzter Beobachtung in ${n(have.length)} von ${n(k)}: ${words(have.map(apple), 6)}.`,
    }),
    faq: (ctx: FaqContext) => placeFaq({ ...ctx, omit: [...(ctx.omit ?? []), "count", "stock", "lasts"] }, LANG),
    duoBlock: (alert: string) => `Am schnellsten kommen Sie per Alarm an eins – in den Stores, die Sie erreichen: [iPhone-Duo-Alarm einrichten](${alert}). Jeder Store × jede exakte Konfiguration ist ein Alarm, und der Push kommt Sekunden, nachdem ein Store sie anbietet.`,
    intro: (c: Country, k: number, spread: string, now: { duo: number; max: number; pro: number }, tax: string) => `Es gibt **${k === 1 ? "einen Apple Store" : `${n(k)} Apple Stores`}** ${where(c)}, ${spread}. Gerade ${hat(now.duo)} **${now.duo}** davon ein iPhone Duo zur Abholung, **${now.max}** das iPhone 18 Pro Max und **${now.pro}** das 18 Pro. ${tax}`,
    crumb: "Store-Verzeichnis",
    panel: (c: Country) => `Deine Merkliste ${where(c)}: erst die iPhones, dann nur die Stores, die du erreichen kannst`,
    matrixLabel: "Regal Store für Store",
    matrixH2: (c: Country) => <>Regalstand je Modell {where(c)}</>,
    matrixHint: "Gelistet beim letzten Blick / beobachtet, je Modell.",
    topCaption: (c: Country) => <>{cap(regionWord(c, true))} mit der größten Store-Dichte (Grundlage: Apples Store-Liste im hiesigen Verzeichnis)</>,
    regionHead: (c: Country) => cap(regionWord(c)),
    colStores: "Anzahl Stores",
    colCities: "Städte mit Store",
    locationsBy: (c: Country) => `Store-Verzeichnis, ${regionWord(c)} für ${regionWord(c)}`,
    locationsIn: (c: Country) => `Store-Verzeichnis ${where(c)}`,
    storeCount: (k: number) => <>{plural(k, "Apple Store", "Apple Stores")}</>,
    storeCountAll: (k: number) => <>{n(k)} Stores insgesamt</>,
    whenRestock: (c: Country) => <>Zeitpunkt der Rückkehren {where(c)}</>,
    howFast: (c: Country) => <>Wie lange Angebote {where(c)} im Regal blieben</>,
    faqTitle: (c: Country) => `Fragen aus dem Feld zu den Stores ${where(c)}`,
    getApp: "Web-App installieren",
    howItWorks: "Notizen zur Methode",
    pricing: "Tarife und Preise",
  },

  /* ---------------------------------------------------------------- /iphone-duo-restock-times */
  restockTimes: {
    fmt: {
      n: rtN,
      pct: rtPct,
      date: dateLabel,
      longDate,
      zoneStamp,
      local: (iso: string, store: Pick<Store, "storeNumber" | "country" | "timeZone" | "state">) => localStamp(iso, store, LANG),
      hour: (h: number) => uhr(h),
      range: span,
      weekday: wd,
      store: apple,
      storeWithPlace: (s: Store) => `${cityLabel(s.country ?? "us", s.city, LANG)} · ${apple(s)}`,
    },
    title: (c: Country) => `Rückkehrzeiten des iPhone Duo ${where(c)}: das Beobachtungsbuch`,
    metaDescription: (x: RestockTimesMeta) => {
      const { c, t, w, pattern } = x;
      const region = c.cc === "us" ? "Bundesstaat" : c.regionNoun ? regionWord(c) : "Store";
      const since = dateLabel(t.since, false);
      return t.n > 0 && pattern
        ? fitDe([
          `${rtN(t.n)} iPhone-Duo-Rückkehren in Apple Stores ${where(c)} seit ${since}: ${rtPct(w.share)} ${zwischen(w.from, w.to)} Store-Zeit${t.sellout ? `, ${rtPct(t.sellout.within2min)} nach spätestens 2 Minuten weg` : ""}. Tabellen je Stunde, Tag, ${region}, Store und Variante.`,
          `${rtN(t.n)} iPhone-Duo-Rückkehren in Apple Stores ${where(c)} seit ${since}: ${rtPct(w.share)} ${zwischen(w.from, w.to)} Store-Zeit. Je Stunde, Tag, ${region} und Variante.`,
          `iPhone-Duo-Rückkehren ${where(c)}: ${rtN(t.n)} seit ${since}, je Stunde, Tag, ${region} und Variante.`,
        ], 158, c.cc)
        : t.n > 0
          ? fitDe([
            `${rtN(t.n)} verzeichnete iPhone-Duo-Rückkehren in Apple Stores ${where(c)} seit ${since}, aus Beobachtungen alle ${SPEED.checkSec} Sekunden: je Store-Stunde, Tag, ${region}, Store und Variante – samt Regalzeit.`,
            `iPhone-Duo-Rückkehren ${where(c)}: ${rtN(t.n)} verzeichnet seit ${since}, je Stunde, Tag, ${region} und Variante.`,
          ], 158, c.cc)
          : `Wann die Apple Stores ${where(c)} das iPhone Duo wieder ins Regal legen – aus ShelfSprings eigenen Beobachtungen alle ${SPEED.checkSec} Sekunden seit dem ${longDate(t.since)}: je Stunde, Tag, Store und Variante.`;
    },
    h1: (x: RestockTimesView) => x.t.unknown
      ? `iPhone-Duo-Rückkehren ${where(x.c)}: das Beobachtungsbuch`
      : x.t.n > 0
        ? `iPhone-Duo-Rückkehren ${where(x.c)}: ${x.pattern ? `meist ${zwischen(x.w.from, x.w.to)} verzeichnet, Store-Zeit` : "Stunde für Stunde, wie beobachtet"}`
        : `Kehrt das iPhone Duo ${where(x.c)} zurück? Laut unseren Beobachtungen noch nicht – das notieren wir`,
    intro: (x: RestockTimesView) => {
      const { t, one, tracked, pattern, w } = x;
      const wh = where(x.c);
      return t.unknown ? (
        <>Das Rückkehr-Logbuch ließ sich für diese Anfrage nicht öffnen. Die Stores {wh} werden weiter alle {SPEED.checkSec} Sekunden beobachtet; beim nächsten Laden stehen die Zahlen wieder hier.</>
      ) : t.n > 0 ? (
        <>
          <b className="text-ink">Ja.</b> Seit dem {longDate(t.since)} hat ShelfSpring {one ? "im Apple Store" : "in den Apple Stores"} {wh} <b className="text-ink">{t.n === 1 ? "eine iPhone-Duo-Rückkehr" : `${rtN(t.n)} iPhone-Duo-Rückkehren`}</b> verzeichnet{tracked > 1 ? <>, verteilt auf {t.days} von {tracked} Tagen</> : <> (bisher ein aufgezeichneter Tag)</>}
          {pattern && <>; <b className="text-ink">{rtPct(w.share)} davon {zwischen(w.from, w.to)}</b> nach Store-Uhr</>}.
        </>
      ) : (
        <>
          <b className="text-ink">Laut unseren Beobachtungen noch nicht.</b> ShelfSpring schaut seit dem {longDate(t.since)} alle {SPEED.checkSec} Sekunden in {one ? "den Apple Store" : `alle ${n(x.stores)} Apple Stores`} {wh}; eine iPhone-Duo-Rückkehr zur Abholung ist bisher nicht bestätigt.
        </>
      );
    },
    hero: {
      restocks: (x: RestockTimesView) => `Rückkehren verzeichnet seit ${dateLabel(x.t.since, false)}`,
      window: (x: RestockTimesView) => `${zwischen(x.w.from, x.w.to)}, nach Store-Uhr`,
      days: "Tage mit mindestens einer Rückkehr",
      now: (one: boolean) => (one ? "Store listet gerade ein iPhone Duo zur Abholung" : "Stores listen gerade ein iPhone Duo zur Abholung"),
      today: (x: RestockTimesView, today: DayRow) => `heute (${dateLabel(today.date)})${x.one ? "" : `, in ${storesN(today.stores)}`}, laufend`,
      weekday: "Wochentag mit den meisten Rückkehren bisher",
    },
    heroPoints: (x: RestockTimesView, latest: { config: string; store: Store; at: string } | null): Point[] => [
      ...(latest ? [{ text: <>Jüngster Eintrag: <b className="text-ink">{latest.config}</b>{x.one ? null : <> bei <Link href={storePath(latest.store)} className="underline underline-offset-2">{apple(latest.store)}</Link></>}, {localStamp(latest.at, latest.store, LANG)} Store-Zeit</> }] : []),
      ...(x.t.peakWeekday != null ? [{ text: <>Die meisten Rückkehren <b className="text-ink">{wdAdv(x.t.peakWeekday)}</b></> }] : []),
      { text: <>Einen <b className="text-ink">Rückkehr-Fahrplan</b> veröffentlicht Apple nicht; hier stehen eigene, bestätigte Beobachtungen, rund alle fünf Minuten neu zusammengefasst</>, no: true },
    ],
    emptyPoints: (x: RestockTimesView): Point[] => [
      { text: <>Beim letzten Blick: <b className="text-ink">{x.duoNow} von {x.stores}</b> mit einem iPhone Duo zur Abholung</> },
      { text: <>Die Tabellen unten bekommen ihre erste Zeile mit der ersten bestätigten Rückkehr</>, step: true },
      { text: <>Stunden- und Wochentagsmuster mit der dichtesten Datenlage: <Link href="/iphone-duo-restock-times" className="underline underline-offset-2">das US-Beobachtungsbuch</Link></>, step: true },
    ],
    setUpAlert: "iPhone-Duo-Merkliste anlegen",
    logLive: "Das laufende Rückkehr-Logbuch öffnen",
    onThisPage: "Abschnitte",
    nav: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": "Uhrzeiten",
      "day-by-day": "Kalender",
      where: `Orte (${rtRegion(x)})`,
      configuration: "Varianten",
      "how-long": "Regalzeit",
      unavailable: "„Nicht verfügbar“?",
      reddit: "Forenthesen",
      method: "Zählregeln",
    }),
    h2: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": `Um welche Uhrzeit kehrt das iPhone Duo ${where(x.c)} ins Regal zurück?`,
      "day-by-day": `An welchen Kalendertagen gab es ${where(x.c)} iPhone-Duo-Rückkehren?`,
      where: `Wo ${where(x.c)} kehrt das iPhone Duo am häufigsten zurück?`,
      configuration: `Welche iPhone-Duo-Variante kehrt ${where(x.c)} am öftesten zurück?`,
      "how-long": `Wie lange bleibt eine iPhone-Duo-Rückkehr ${where(x.c)} im Regal?`,
      unavailable: "„Derzeit nicht verfügbar“ in jedem Apple Store – was steckt dahinter?",
      reddit: "Reddit-Faustregeln zu iPhone-Duo-Rückkehren im Abgleich mit der Aufzeichnung",
      method: "Nach welchen Regeln verzeichnet ShelfSpring eine Rückkehr?",
    }),
    faq: (x: RestockTimesView): Faq[] => {
      const { t, w, pattern, sell, us, weekend, tracked } = x;
      const wh = where(x.c);
      const window = zwischen(w.from, w.to);
      return [
        { q: `Zu welcher Uhrzeit tauchen iPhone-Duo-Rückkehren ${wh} auf?`, a: t.n > 0 && pattern
          ? `Vor allem vormittags. Von den ${rtN(t.n)} bestätigten Rückkehren seit dem ${longDate(t.since)} fielen ${rtPct(w.share)} ${window} nach Store-Uhr, ${rtPct(hourShare(t.byHour, 8, 12))} von 8 bis 12 Uhr. Einen Fahrplan gibt Apple nicht heraus; das Muster stammt aus ShelfSprings Beobachtungen und wird rund alle fünf Minuten neu berechnet.`
          : `Einen Fahrplan gibt Apple nicht heraus, und ShelfSpring hat ${wh} seit dem ${longDate(t.since)} ${confirmed(t.n)}${t.days ? ` an ${dayN(t.days)}` : ""} notiert. Eine übliche Uhrzeit nennen wir erst ab ${PATTERN_MIN} Rückkehren an ${PATTERN_MIN_DAYS} verschiedenen Tagen; bis dahin ergänzt sich die Seite von selbst.` },
        { q: `Kehrt das iPhone Duo${us ? "" : ` ${wh}`} auch samstags oder sonntags zurück?`, a: t.n > 0
          ? `${weekend > 0 ? "Bisher ja" : "In der Aufzeichnung noch nicht"}: Auf das Wochenende entfielen ${restocks(weekend)} von ${rtN(t.n)} (${rtPct(weekend / t.n)}). ${t.peakWeekday != null ? `Vorn liegt bisher der ${wd(t.peakWeekday)}.` : `Einen Spitzen-Wochentag nennen wir erst ab ${WEEKDAY_MIN_SPAN} Tagen Aufzeichnung; bisher sind es ${tracked}.`}`
          : `Für das Wochenende gibt es ${wh} noch keine Einträge; der Kalender auf dieser Seite wächst mit jeder bestätigten Rückkehr.` },
        { q: "Ab welcher Uhrzeit lohnt sich ein Blick auf apple.com?", a: t.n > 0 && pattern
          ? `Wer selbst schaut, ist ab ${uhr(w.from)} Store-Zeit auf apple.com, die Abholung schon ausgewählt; in dieses Zwei-Stunden-Fenster fielen ${rtPct(w.share)} der Rückkehren. Eine typische Rückkehr ${sell ? `war im Median nach ${sell.medianSec} Sekunden wieder weg` : "hält sich etwa eine Minute"} – das fängt eine Merkliste zuverlässiger als jedes Neuladen ([wie Benachrichtigungen funktionieren](/iphone-duo-stock-alerts)).`
          : `Solange sich ${wh} kein Muster abzeichnet, übernimmt eine Merkliste das Hinschauen, rund um die Uhr ([wie Benachrichtigungen funktionieren](/iphone-duo-stock-alerts)).` },
        { q: "Warum zeigt apple.com das iPhone Duo in allen Apple Stores als „nicht verfügbar“?", a: sell
          ? `Weil eine Rückkehr kurz ist: Von ${rtN(sell.n)} gemessenen Rückkehren ${wh} waren ${rtPct(sell.within2min)} nach spätestens 2 Minuten wieder weg, ${rtPct(sell.within20min)} nach 20. Beim letzten Blick ${listet(x.duoNow)} ${x.duoNow} von ${x.stores} Stores eins; fast zu jedem anderen Zeitpunkt steht auf apple.com zu Recht „nicht verfügbar“, selbst an Tagen mit Dutzenden Rückkehren ([„nicht verfügbar“, erklärt](/apple-store-pickup-availability-explained)).`
          : `Weil Abholware jeweils nur für Minuten im Regal liegt. Beim letzten Blick ${listet(x.duoNow)} ${x.duoNow} von ${storesN(x.stores)} ${wh} eins ([„nicht verfügbar“, erklärt](/apple-store-pickup-availability-explained)).` },
        { q: "Wie erfahre ich, dass mein Apple Store das iPhone Duo wieder listet?", a: `Setz den Store mit genau der Kapazität und dem Finish, die du willst, auf deine Merkliste. Sobald eine passende Rückkehr erkannt ist, geht die Benachrichtigung an dein Handy; Abfrage, Abgleich und Zustellung können etwas Zeit kosten ([Merkliste anlegen](${x.alert}); [Notizen zur Methode](/how-it-works)).` },
      ];
    },
    sources: {
      applePickup: "Apples eigene Erklärung „Lieferung und Abholung“",
      newsroom: "„Das iPhone Duo kommt in die Apple Stores weltweit“ · Pressemitteilung von Apple, 23. Oktober 2026",
      macRumors: "„Apples Abholsystem für das iPhone Duo ist in den USA und Kanada wieder live“ · Bericht von MacRumors, 24. Oktober 2026",
      reports: (tracker: string) => `${tracker}, Notizen zum iPhone Duo aus der Launch-Woche: getrennt von diesem Beobachtungsbuch geführt und nie mitgezählt`,
    },
    /* JSON-LD (WebPage + Dataset): kept as it was; `description` is replaced by withShelfViews. */
    ld: (x: RestockTimesView) => ({
      datasetName: `iPhone-Duo-Restock-Zeiten in den Apple Stores ${where(x.c)}`,
      description: `Jeder bestätigte Restock des iPhone Duo zur Abholung in den Apple Stores ${where(x.c)} seit ${x.t.since}, mit Store, Konfiguration und Uhrzeit, aus ShelfSprings Prüfungen alle ${SPEED.checkSec} Sekunden; zusammengefasst nach Ortszeit, Tag, ${rtRegion(x)}, Store und Konfiguration.`,
      spatial: `Apple Stores ${where(x.c)}`,
      measured: ["Restock-Zeit (Ortszeit des Stores)", "Apple Store", "iPhone Duo Speicher und Farbe", "Sekunden bis ausverkauft"],
      size: `${metaRestocks(x.t.n)} in ${storesN(x.t.stores)}`,
    }),
    crumb: "Rückkehr-Aufzeichnung iPhone Duo",

    // ---- time of day
    timeLead: (x: RestockTimesView) => <b>{rtPct(x.w.share)} der {rtN(x.t.n)} Rückkehren fielen nach Store-Uhr in das Fenster {zwischen(x.w.from, x.w.to)}; von 8 bis 12 Uhr waren es {rtPct(hourShare(x.t.byHour, 8, 12))}.</b>,
    busiestHour: (k: number) => `Spitzenstunde: ${restocks(k)}`,
    morning: "von 8 bis 12 Uhr",
    evening: "ab 17 Uhr – auch abends tut sich etwas",
    night: "von 0 bis 6 Uhr",
    tooFew: (x: RestockTimesView) => <b>Für eine übliche Uhrzeit reicht es noch nicht: {confirmed(x.t.n)} an {dayN(x.t.days)} seit dem {longDate(x.t.since)}.</b>,
    tooFewKeys: (): Point[] => [
      { text: <>Eine übliche Uhrzeit setzt <b className="text-ink">{PATTERN_MIN} Rückkehren an {PATTERN_MIN_DAYS} verschiedenen Tagen</b> voraus</> },
      { text: <>Zehn Rückkehren auf einen Schlag sind ein Ereignis, kein Rhythmus</>, no: true },
      { text: <>Mit jedem weiteren Tag schreibt sich die Seite neu</>, step: true },
    ],
    hourCaption: (x: RestockTimesView) => `Verzeichnete iPhone-Duo-Rückkehren ${where(x.c)} je Stunde nach Store-Uhr, ${dateLabel(x.t.since, false)} → heute, insgesamt ${restocks(x.t.n)}`,
    hourHead: ["Stunde nach Store-Uhr (24 h)", "Rückkehren", "% der Aufzeichnung"],
    morningKeys: (x: RestockTimesView): Point[] => [
      { text: <>Die Häufung am Vormittag hat <b className="text-ink">nichts mit der Ladenöffnung</b> zu tun{x.us ? ": Die meisten US-Apple-Stores öffnen erst um 10 Uhr" : ""}</> },
      { text: <>Apple gibt Abholware <b className="text-ink">online</b> frei, noch bevor die Türen aufgehen</> },
      { text: <>Wer selbst schaut: <b className="text-ink">{span(x.w.from, x.w.to)}</b> an einem Werktagvormittag im Blick behalten</>, step: true },
      { text: <>Die <b className="text-ink">übrigen 22 Stunden</b>, in denen niemand neu lädt, übernimmt eine <Link href={x.alert}>Merkliste</Link></>, step: true },
    ],
    storeChartKeys: (x: RestockTimesView): Point[] => [{ text: <>Jeder Store-Eintrag hat ein eigenes Diagramm in seiner Zeitzone (<Link href={x.storesHref}>{x.us ? "Store-Verzeichnis nach Bundesstaat" : `Store-Verzeichnis ${where(x.c)}`}</Link>): Legt ein Store schon um 8 Uhr nach, während die Region sonst um 9 Uhr kommt, lohnt sich das Wissen</>, step: true }],

    // ---- day by day
    dayLead: (x: RestockTimesView) => {
      const { t, tracked, one } = x;
      return t.n > 0 && tracked === 1 ? (
        <b>Bisher ein einziger aufgezeichneter Tag ({dateLabel(t.daily[t.daily.length - 1]?.date ?? t.since)}) mit {confirmed(t.n)}{one ? "" : ` in ${storesN(t.stores)}`}.</b>
      ) : t.n > 0 ? (
        <b>{t.days === tracked ? `Jeder aufgezeichnete Tag (${t.days} von ${t.days})` : `${t.days} der ${tracked} Tage seit dem ${longDate(t.since)}`} brachte mindestens eine bestätigte Rückkehr{t.peakWeekday != null ? `; vorn liegt bisher der ${wd(t.peakWeekday)}` : ""}.</b>
      ) : (
        <b>Seit dem {longDate(t.since)} keine bestätigte Rückkehr {where(x.c)}.</b>
      );
    },
    daysTracked: "aufgezeichnete Tage mit mindestens einer Rückkehr",
    busiestDay: (x: RestockTimesView, day: DayRow) => `Spitzentag, ${dateLabel(day.date)}${x.one ? "" : `, in ${storesN(day.stores)}`}`,
    busiestDayNone: "Spitzentag",
    drop: (x: RestockTimesView, drop: { at: string; restocks: number }) => `Stores mit einer Rückkehr in derselben halben Stunde, ${zoneStamp(drop.at, x.c)} (${plural(drop.restocks, "Variante", "Varianten")}): eine landesweite Welle, von außen beobachtet`,
    weekend: (x: RestockTimesView) => `samstags oder sonntags (${restocks(x.weekend)})`,
    dayCaption: (x: RestockTimesView) => `Verzeichnete iPhone-Duo-Rückkehren ${where(x.c)} je Kalendertag${x.t.reports.length ? ". Graue Zeilen mit „gemeldet“ stammen aus öffentlichen Notizen anderer Tracker zu Tagen vor Beginn dieses Beobachtungsbuchs; sie füllen nur die Zeitleiste und fließen in keine Summe ein" : ""}`,
    dayHead: { date: "Tag", restocks: "Rückkehren", stores: "Stores", busiest: "Spitzenstunde (24 h)", source: "Verzeichnet von" },
    soFar: " · läuft noch",
    reportedBy: (names: string[]) => <>{names.join(" / ")}, gemeldet</>,
    dayKeys: (x: RestockTimesView, launch: string, resumed: string): Point[] => [
      { text: <><b className="text-ink">{dateLabel(launch)}</b>: Verkaufsstart, die ersten Geräte gehen an Online-Bestellungen</> },
      { text: <><b className="text-ink">{dateLabel(resumed)}</b>: Abholung wieder buchbar{x.us ? " (laut MacRumors)" : ""}</> },
      x.t.reports.length
        ? { text: <>Zeilen mit <b className="text-ink">gemeldet</b>: Launch-Wochen-Notizen von {x.reportNames.join(" und ")}, nie mitgezählt</> }
        : { text: <>Die eigene Aufzeichnung aller Stores {where(x.c)} beginnt am <b className="text-ink">{longDate(x.t.since)}</b></> },
      ...(x.t.n > 0 && x.t.peakWeekday == null ? [{ text: <>Spitzen-Wochentag: wird genannt, sobald die Aufzeichnung <b className="text-ink">{WEEKDAY_MIN_SPAN} Tage</b> umfasst (bisher: {x.tracked})</>, no: true }] : []),
      { text: <>Lies die Spalte <b className="text-ink">Stores</b> mit: Dieselbe Zahl Rückkehren, verteilt auf mehr Stores, ist für dich der bessere Tag</>, step: true },
    ],

    // ---- where
    whereLead: (x: RestockTimesView, hit: { name: string; restocks: number; stores: number; storesTotal: number }[], total: number) => (
      <b>{hit[0].name}: {restocks(hit[0].restocks)} in {hit[0].stores} von {storesN(hit[0].storesTotal)} seit {dateLabel(x.t.since, false)}{hit[1] ? <>; dahinter {hit[1].name} ({rtN(hit[1].restocks)})</> : null}{hit[2] ? <> und {hit[2].name} ({rtN(hit[2].restocks)})</> : null}. Mindestens eine Rückkehr gab es in {hit.length} von {total} {dativ(rtRegions(x))}{total - hit.length > 0 ? `, in ${total - hit.length} noch keine` : ""}.</b>
    ),
    whereNone: (x: RestockTimesView) => <b>Für die {rtRegions(x)} {where(x.c)} ist noch keine Rückkehr bestätigt; mit der ersten bekommt die Tabelle ihre erste Zeile.</b>,
    regionCaption: (x: RestockTimesView) => `Verzeichnete iPhone-Duo-Rückkehren je ${rtRegion(x)} ${where(x.c)}, ${dateLabel(x.t.since, false)} → heute`,
    regionHead: (x: RestockTimesView) => [cap(rtRegion(x)), "Rückkehren", "Stores mit Rückkehr", "Jüngste (Store-Zeit)"],
    ofN: (a: number, b: number) => <>{a}/{b}</>,
    storesCaption: (x: RestockTimesView) => `Stores mit der längsten iPhone-Duo-Rückkehrliste ${where(x.c)}, ${dateLabel(x.t.since, false)} → heute`,
    storesHead: ["Store", "Rückkehren", "Tage mit Rückkehr", "Übliche Stunde", "Jüngste (Store-Zeit)"],
    swaps: (x: RestockTimesView) => [
      { no: "Der Store mit den meisten Rückkehren, egal wie weit weg", yes: `Zwei oder drei Stores, die du ${x.pattern ? `ab ${uhr(x.w.from)}` : "am Vormittag"} binnen einer Stunde erreichst`, why: "Eine Rückkehr, die du nicht erreichst, nützt dir nichts; selbst der aktivste Store zeigt fast den ganzen Tag „nicht verfügbar“." },
      { no: "Ein einziger Store und die Hoffnung", yes: "Jeden erreichbaren Store auf die Merkliste – und zu dem fahren, der sich zuerst meldet", why: "Die Zähltabelle verrät nur, welchen deiner Stores du zuerst ansteuerst." },
    ],
    nearMe: "Welche Stores in meiner Nähe es gerade listen",

    // ---- configuration
    configLead: (x: RestockTimesView, top: { label: string; restocks: number }, rarest: { label: string; restocks: number } | null) => (
      <b>Spitzenreiter ist {top.label} mit {rtN(top.restocks)} der {rtN(x.t.n)} Rückkehren ({rtPct(top.restocks / x.t.n)}){rarest ? `; Schlusslicht: ${rarest.label} (${restocks(rarest.restocks)})` : ""}.</b>
    ),
    mostRestocked: (config: string) => `${config}: die Variante, die am häufigsten zurückkam`,
    versus: (a: string, bCount: number, b: string) => `Rückkehren bei ${a} (${b}: ${rtN(bCount)})`,
    restocksOf: (a: string) => `Rückkehren bei ${a}`,
    byStorage: "je Kapazität",
    byColour: "je Finish",
    configNone: (x: RestockTimesView) => <b>Noch keine Variante {where(x.c)} mit bestätigter Rückkehr; alle acht stehen schon in der Tabelle, damit die erste Rückkehr ihre Zeile findet.</b>,
    configCaption: (x: RestockTimesView) => `Verzeichnete iPhone-Duo-Rückkehren ${where(x.c)}, eine Zeile je Variante, ${dateLabel(x.t.since, false)} → heute`,
    configHead: ["Variante", "Rückkehren", "% der Aufzeichnung", "Jüngste (Store-Zeit)"],
    configKeys: (x: RestockTimesView): Point[] => [
      { text: <>Welche Variante du nimmst, wiegt <b className="text-ink">schwerer als die Wahl des Stores</b></> },
      x.storageRatio != null
        ? { text: <>Die Kapazität mit den meisten Rückkehren nehmen: rund <b className="text-ink">{n(x.storageRatio)}×</b> so viele Gelegenheiten wie bei der nächsten Größe</> }
        : { text: <>Die Kapazität mit den meisten Rückkehren nehmen: Deine Gelegenheiten wachsen <b className="text-ink">spürbar</b></> },
      { text: <>Das <b className="text-ink">2TB</b>-Modell eher zur Lieferung bestellen und warten</>, no: true },
      { text: <>Preise und aktueller Regalstand: <Link href="/which-iphone-duo-restocks-most">Welche iPhone-Duo-Variante kehrt am häufigsten zurück?</Link></>, step: true },
    ],

    // ---- how long
    howLongLead: (x: RestockTimesView, sell: SelloutFacts) => <b>Median {sell.medianSec} Sekunden: So lange hielt sich die Hälfte der {rtN(sell.n)} gemessenen Rückkehren {where(x.c)} im Regal; nach 2 Minuten waren {rtPct(sell.within2min)} weg, nach 20 Minuten {rtPct(sell.within20min)}.</b>,
    secUnit: "s",
    medianListing: "Median der Regalzeit",
    within2: "nach höchstens 2 Min. aus dem Regal",
    within20: "nach höchstens 20 Min. aus dem Regal",
    fastest: "kürzeste gemessene Regalzeit",
    howLongNone: (x: RestockTimesView) => <b>Für eine Messung sind {where(x.c)} noch zu wenige Rückkehren wieder aus dem Regal verschwunden; die Zahlen erscheinen ab zehn, das volle Bild steht im US-Beobachtungsbuch.</b>,
    howLongKeys: (x: RestockTimesView): Point[] => [
      { text: <>Ein Fenster von zwei Minuten erwischt eine <b className="text-ink">Merkliste</b>, kein Neuladen von apple.com</> },
      { text: <>Diese eine Zahl erklärt den Rest der Seite</> },
      { text: <>Jede Rückkehr mit ihrer Regalzeit in Sekunden, je Variante und {rtRegion(x)}: <Link href="/iphone-duo-sell-out-times">Wie lange bleibt eine iPhone-Duo-Rückkehr im Regal?</Link></>, step: true },
    ],
    measured: "Jede Zahl reicht von der Beobachtung, die die Variante zuerst gelistet sah, bis zu der, die sie verschwunden sah – eine Obergrenze also; tatsächlich lag sie kürzer im Regal.",

    // ---- unavailable
    unavailableLead: (x: RestockTimesView) => <b>Weil eine Rückkehr ein kurzes Aufblitzen ist und kein Dauerzustand: {x.one ? "ein Store" : `${rtN(x.stores)} Stores`} × {x.configs} Varianten ergeben {rtN(x.pairs)} mögliche Regalplätze {where(x.c)}, und in diesem Moment {x.duoNow === 1 ? "listet 1 Store" : `listen ${x.duoNow} Stores`} überhaupt ein iPhone Duo.</b>,
    pairs: "mögliche Regalplätze (Store × Variante)",
    listingNow: "Stores, die in diesem Moment ein iPhone Duo zur Abholung listen",
    goneIn2: "der Rückkehren nach spätestens zwei Minuten weg",
    last24: "bestätigte Rückkehren, letzte 24 Stunden",
    unavailableKeys: (x: RestockTimesView, today: number): Point[] => [
      x.recent.restocks > 0
        ? { text: <>Letzte 24 Stunden {where(x.c)}: <b className="text-ink">{confirmed(x.recent.restocks)}</b> in {storesN(x.recent.stores)}</> }
        : today > 0
          ? { text: <>Heute {where(x.c)}: <b className="text-ink">{confirmed(today)}</b></> }
          : { text: <>Welche Rückkehren es gab, steht im Kalender weiter oben</> },
      { text: <>Auf apple.com war jede davon nur <b className="text-ink">ein, zwei Minuten</b> zu sehen</> },
      { text: <>„Überall nicht verfügbar“ an Tag vier oder vierzehn bedeutet <b className="text-ink">nicht</b>, dass Apple aufhört</>, no: true },
    ],
    unavailableLinks: { explained: "„Derzeit nicht zur Abholung verfügbar“, entschlüsselt", howToGet: "Ein praktischer Weg zum iPhone Duo" },

    // ---- reddit
    redditLead: (x: RestockTimesView) => <b>Die Faustregeln aus <a href="https://www.reddit.com/r/applestore/" target="_blank" rel="noopener nofollow">r/applestore</a> und <a href="https://www.reddit.com/r/iphone/" target="_blank" rel="noopener nofollow">r/iphone</a> sind meist ehrlich gemeint, stammen aber aus einem einzelnen Store und veralten binnen eines Tages. Hier stehen die vier häufigsten neben {rtN(x.t.n)} bestätigten Rückkehren {where(x.c)}.</b>,
    redditCaption: "Vier verbreitete Reddit-Thesen zu iPhone-Duo-Rückkehren, abgeglichen mit ShelfSprings bestätigten Rückkehren",
    redditHead: ["These", "Befund aus der Aufzeichnung"],
    claims: (x: RestockTimesView): { claim: string; answer: ReactNode }[] => {
      const { t, w, tracked, recent } = x;
      return [
        { claim: "„Nachts wird aufgefüllt – um 3 Uhr reinschauen.“", answer: t.n > 0 ? <>Von 0 bis 6 Uhr Store-Zeit fielen {rtPct(hourShare(t.byHour, 0, 6))} der Rückkehren, {zwischen(w.from, w.to)} dagegen {rtPct(w.share)}.</> : "Noch keine Rückkehr verzeichnet, an der sich das messen ließe." },
        { claim: "„Apple liefert nur an einem bestimmten Wochentag.“", answer: t.n > 0 ? (t.peakWeekday != null ? <>Vorn liegt bisher der {wd(t.peakWeekday)} ({rtN(t.byWeekday[t.peakWeekday])} von {rtN(t.n)}), Rückkehren gab es aber an {t.days} von {tracked} Tagen.</> : <>Rückkehren gab es an {t.days} der {tracked} aufgezeichneten Tage{t.days === tracked ? ", kein einziger Tag blieb leer" : ""}; einen Spitzen-Wochentag nennen wir erst ab {WEEKDAY_MIN_SPAN} Tagen Aufzeichnung.</>) : "Noch keine Rückkehr verzeichnet, an der sich das messen ließe." },
        { claim: "„Im Store anrufen und fragen, wann die Lieferung kommt.“", answer: "Einen Rückkehr-Fahrplan gibt Apple nicht heraus. Was auf apple.com erscheint, ist online freigegebene Abholware – der Store sieht sie im selben Augenblick wie alle anderen." },
        { claim: "„‚Nicht verfügbar‘ heißt: endgültig weg.“", answer: recent.restocks > 0 ? <>{confirmed(recent.restocks)} in {storesN(recent.stores)} während der letzten 24 Stunden widerlegen das; jede stand nach Minuten wieder auf „nicht verfügbar“.</> : t.n > 0 ? <>{confirmed(t.n)} seit {dateLabel(t.since, false)} widerlegen das; jede stand nach Minuten wieder auf „nicht verfügbar“.</> : "Noch nichts, woran sich das messen ließe." },
      ];
    },
    redditKeys: (): Point[] => [
      { text: <>Gerüchte füllen die Lücke, wo <b className="text-ink">Daten fehlen</b>; hier liegen die Daten offen</> },
      { text: <>Recht hat Reddit bei den <b className="text-ink">Checkout-Tipps</b>: angemeldet sein, Apple Pay bereit (<Link href="/how-to-grab-an-iphone-duo-restock">die Kurzanleitung</Link>)</> },
    ],

    // ---- method
    methodLead: <b>Als Rückkehr verzeichnet ShelfSpring, wenn apple.com eine Variante in einem Store zur Abholung listet, in dem sie vorher fehlte – und zwei Beobachtungen das übereinstimmend bestätigen.</b>,
    methodKeys: (x: RestockTimesView): Point[] => [
      { text: <>Beobachtet wird {x.one ? "der Apple Store" : "jeder Apple Store"} {where(x.c)} alle <b className="text-ink">{SPEED.checkSec} Sekunden</b>, Stores auf einer Merkliste alle <b className="text-ink">{SPEED.fastSec}</b></> },
      { text: <>Ein erstes „verfügbar“ wird <b className="text-ink">rund eine Sekunde später</b> noch einmal abgefragt, bevor es zählt</> },
      { text: <>Verschwindet ein Angebot, bestätigt das die <b className="text-ink">nächste Runde</b></> },
      { text: <>Die erste Sichtung eines Stores, eine fehlgeschlagene oder abgelaufene Anfrage: <b className="text-ink">nie</b> eine Rückkehr, nie „weg“</>, no: true },
      { text: <>Stunden und Daten nach der <b className="text-ink">Store-Uhr</b> jedes Stores; „Welle“ = dieselbe halbe Stunde über mehrere Zeitzonen</> },
      { text: <>Meldungen anderer Tracker{x.t.reports.length ? ` (${x.reportNames.join(", ")})` : ""}: eigene, markierte Zeilen, <b className="text-ink">in keiner Summe</b></> },
      { text: <>Rund alle fünf Minuten neu berechnet; <Link href={x.logHref}>das Rückkehr-Logbuch</Link> selbst läuft live</>, step: true },
    ],
    quote: "Zitieren ist willkommen, bitte mit Link auf diese Seite. ShelfSpring arbeitet unabhängig von Apple und liest dieselben Abholangaben, die jeder auf apple.com sieht – nur deutlich häufiger.",
    alertIn: (x: RestockTimesView) => <>{x.one ? "iPhone-Duo-Merkliste anlegen" : `iPhone-Duo-Merkliste ${where(x.c)} anlegen`}</>,

    // ---- related, FAQ, sources
    related: "Mehr aus derselben Aufzeichnung",
    sameData: "Fragen, die dieses Beobachtungsbuch beantwortet",
    questions: {
      sellOut: "Wie lange bleibt eine Rückkehr im Regal?",
      alerts: "Von einer Rückkehr zuerst erfahren",
      howToGet: "Ein gangbarer Weg zum eigenen Gerät",
      whichConfig: "Welche Variante am häufigsten zurückkehrt",
      nearMe: "Welche Stores in der Nähe es jetzt listen",
      unavailable: "„Derzeit nicht verfügbar“ richtig lesen",
    },
    otherCountries: (us: boolean) => (us ? "Diese Auswertung für andere Länder" : "Aufzeichnungen anderer Länder"),
    faqTitle: "Fragen aus dem Feld",
  },
};

export const views: Dict["views"] = withShelfViews("de", baseViews);
