import { withShelfViews } from "@/lib/seo/localizedCopy";
/**
 * Chaînes françaises : views — pages produit × lieu, journal des retours en stock, carte en direct, page « Quand
 * Apple réapprovisionne-t-il l’iPhone Duo ? » et index des magasins. Mêmes arguments et mêmes formes que l’anglais.
 * Les objets Product / Place / Store / Country arrivent en données anglaises : ils sont nommés ici en français
 * (places.ts) ; les chaînes `name`, `place`, `region`, `city` arrivent déjà en français.
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import type { RestockTimesMeta } from "../en/views";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import type { Point } from "@/components/ui/Viz";
import type { Faq } from "@/lib/content/types";
import { catalogFor, storePath, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type Country, type CountryCode } from "@/lib/apple/countries";
import { faq as placeFaq, fmtDuration, peakOf, type FaqContext, type FaqItem } from "@/lib/seo/enrich";
import type { Place, PlaceLevel, Product } from "@/lib/seo/products";
import type { StoreLine } from "@/lib/seo/productData";
import type { PlaceStats, RestockStats } from "@/lib/stock/queries";
import { hourShare, type DayRow, type SelloutFacts } from "@/lib/content/restockTimes";
import { PATTERN_MIN, PATTERN_MIN_DAYS, WEEKDAY_MIN_SPAN, localStamp } from "@/lib/content/siteFacts";
import { distance, fitTitleW, hour, list, num, pct, plural, price, stamp, weekdays } from "@/lib/i18n/format";
import { appleStoreLabel, cityLabel, colorLabel, countryLabel, regionLabel, storeLabel } from "@/lib/i18n/places";
import { IN, NAME, L, cap, dans, noun } from "./util";
import { taxNote } from "./place";

/* ---------------------------------------------------------------- French names for English data */

const COLORS = ["Night Sky", "Star White", "Black", "Burgundy", "Glacier", "Silver"];
/** "iPhone Duo 512GB Night Sky" → "iPhone Duo 512GB Ciel nocturne". */
const fx = (s: string) => COLORS.reduce((a, c) => a.replace(new RegExp(`\\b${c}\\b`, "g"), colorLabel(c, "fr")), s);
const ccOf = (p: { country?: CountryCode }) => p.country ?? "us";
const apple = (s: Store) => appleStoreLabel(s, L(s.country));
/** A place's French name: "France", "Rhône", "Paris", "Apple Opéra". */
function placeFr(p: Place): string {
  const code = ccOf(p);
  const lg = L(code);
  if (p.level === "country") return NAME[code];
  if (p.level === "state") return regionLabel(code, p.state!, lg);
  if (p.level === "city") return cityLabel(code, p.city!, lg);
  return appleStoreLabel(p.store!, lg);
}
/** "en France", "dans le Rhône", "à Paris", "chez Apple Opéra". */
function atFr(p: Place): string {
  if (p.level === "country") return IN[ccOf(p)];
  return p.level === "store" ? `chez ${placeFr(p)}` : dans(placeFr(p));
}
/** A country's name given in French back to "en France" (else the place's own preposition). */
function inName(name: string): string {
  const code = (Object.keys(NAME) as CountryCode[]).find((k) => NAME[k] === name || countryLabel(k, "fr") === name);
  return code ? IN[code] : dans(name);
}
const prodName = (p: Product) => fx(p.name);
const prodShort = (p: Product) => fx(p.short);
const nStores = (k: number) => plural("fr", k, { one: "# magasin", other: "# magasins" });
const nRestocks = (k: number) => plural("fr", k, { one: "# retour", other: "# retours" });
const nLogged = (k: number) => plural("fr", k, { one: "# retour consigné", other: "# retours consignés" });
const nConfirmed = (k: number) => plural("fr", k, { one: "# retour confirmé", other: "# retours confirmés" });

/* ---------------------------------------------------------------- product × place copy */

function productTitle(product: Product, place: Place, inStock: number): string {
  const code = ccOf(place);
  const name = prodName(product), short = prodShort(product);
  if (place.level === "country") {
    return fitTitleW([
      ...(inStock > 0 ? [`${name} en stock dans ${plural("fr", inStock, { one: "# Apple Store", other: "# Apple Store" })} ${IN[code]}`] : []),
      `${name} : stock en retrait ${IN[code]}, en direct`,
      `${short} : stock en retrait ${IN[code]}`,
      `${short} : stock en retrait`,
    ]);
  }
  if (place.level === "store") {
    const s = place.store!;
    const store = apple(s);
    const now = inStock > 0 ? "en stock maintenant" : "stock en retrait";
    return fitTitleW([`${name} chez ${store} : ${now}`, `${short} chez ${store}, ${cityLabel(code, s.city, L(code))}`, `${short} chez ${store}`, `${short} chez ${storeLabel(s, L(code))}`, `${short} · ${storeLabel(s, L(code))}`]);
  }
  const w = dans(placeFr(place));
  return fitTitleW([`${name} en stock ${w} : ${inStock} sur ${place.stores.length}`, `${name} ${w} : stock en retrait`, `${short} en stock ${w}`, `${short} ${w}`]);
}

function productDescription(product: Product, place: Place, inStock: number, stats: PlaceStats): string {
  const name = prodName(product);
  const week = `${nRestocks(stats.week)} cette semaine`;
  const code = ccOf(place);
  if (place.level === "store") {
    const s = place.store!;
    const now = inStock > 0 ? "en stock maintenant" : "pas en stock en ce moment";
    return fitTitleW([
      `Stock en retrait de l’${name} chez ${apple(s)}, ${cityLabel(code, s.city, L(code))} : ${now}, ${week}. Statut en direct, heures de retour en stock et alertes.`,
      `${name} chez ${apple(s)} : ${now}, ${week}. Statut en direct et alertes.`,
    ], 155);
  }
  const where = place.level === "country" ? `Apple Store ${IN[code]}` : `Apple Store ${dans(placeFr(place))}`;
  return fitTitleW([
    `Stock en retrait de l’${name} : ${inStock} des ${place.stores.length} ${where} l’ont en ce moment, ${week}. En direct par magasin, heures de retour en stock et alertes.`,
    `${name} : ${inStock} des ${place.stores.length} ${where} l’ont en ce moment, ${week}. En direct par magasin et alertes.`,
  ], 155);
}

function productFaq(product: Product, place: Place, lines: StoreLine[], stats: PlaceStats, clock: RestockStats, nearest: { name: string; city: string; distance: number } | null): FaqItem[] {
  const out: FaqItem[] = [];
  const code = ccOf(place);
  const name = prodName(product);
  const at = atFr(place);
  const inStock = lines.filter((l) => l.available.length > 0);
  const near = nearest ? `${/^apple\b/i.test(nearest.name) ? nearest.name : `Apple ${nearest.name}`} (${nearest.city}, à ${distance("fr", code, nearest.distance)})` : "";
  if (place.level === "store") {
    const l = lines[0];
    out.push({
      q: `L’${name} est-il en rayon ${at} ?`,
      a: l && l.available.length > 0
        ? `Oui${product.parts.length > 1 ? ` : ${list("fr", l.available.map((i) => `${i.storage} ${colorLabel(i.color, "fr")}`), 4)}` : ""}, lors de la dernière observation.`
        : `Pas lors de la dernière observation${near ? ` ; magasin le plus proche qui le liste : ${near}` : ""}.`,
    });
  } else {
    out.push({
      q: `Dans quels Apple Store ${at} l’${name} est-il en rayon ?`,
      a: inStock.length === 0
        ? `Aucun lors de la dernière observation${near ? ` ; le plus proche qui le liste : ${near}` : ""}.`
        : `${nStores(inStock.length)} lors de la dernière observation : ${list("fr", inStock.map((l) => apple(l.store)), 4, (r) => `${r} de plus`)}.`,
    });
  }
  const peak = peakOf(clock, "fr");
  out.push({
    q: `À quel rythme l’${name} revient-il en rayon ${at} ?`,
    a: stats.month === 0 ? `Le registre de ${stats.days} jours ne contient aucun retour ${at}.` : `${nRestocks(stats.month)} en ${stats.days} jours, dont ${stats.week} cette semaine${peak ? ` ; ils se regroupent vers ${peak.hour}, heure du magasin` : ""}.`,
  });
  if (stats.medianMs != null) out.push({ q: `Combien de temps dure son passage en rayon ${at} ?`, a: `Environ ${fmtDuration(stats.medianMs, "fr")} en valeur médiane, avant de repasser hors rayon.` });
  return out;
}

function priceLabel(product: Product): string {
  const code = ccOf(product);
  const prices = catalogFor(product.model, code).filter((c) => product.parts.includes(c.partNumber)).map((c) => c.price);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  const f = (v: number) => price(L(code), COUNTRIES[code], v);
  return lo === hi ? f(lo) : `${f(lo)}–${f(hi)}`;
}

/* ---------------------------------------------------------------- restock-times helpers */

const rtN = (x: number) => num("fr", x);
const rtPct = (x: number) => (x > 0 && x < 0.005 ? "<1 %" : pct("fr", Math.round(x * 100)));
const dateLabel = (ymd: string, weekday = true) => new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", month: "short", day: "numeric", ...(weekday ? { weekday: "short" as const } : {}) }).format(new Date(`${ymd}T12:00:00Z`));
const longDate = (ymd: string) => new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${ymd}T12:00:00Z`));
const zoneStamp = (iso: string, c: Country) => stamp(L(c.cc), iso, c.timeZone, true);
const hourFr = (h: number) => hour("fr", h, true);
const rangeFr = (from: number, to: number) => `${hourFr(from)}–${hourFr(to % 24)}`;
/** "de 9 h à 11 h". */
const between = (from: number, to: number) => `de ${hourFr(from)} à ${hourFr(to % 24)}`;
const WD = weekdays("fr");
const rtRegion = (x: { us: boolean; c: Country }) => (x.us ? "État" : noun(x.c).one);
const rtRegions = (x: { us: boolean; c: Country }) => (x.us ? "États" : noun(x.c).other);
const rtYet = (x: RestockTimesMeta) => (x.t.n > 0 ? "" : " à ce jour");
const rtIn = (c: Country) => IN[c.cc];
const EN = " (en anglais)";

/* ---------------------------------------------------------------- views */

const baseViews: Dict["views"] = {
  common: {
    inCountry: (c) => IN[c.cc],
    liveMap: "Carte du retrait",
    restockLog: "Registre des retours",
    alertMe: "Ajouter à ma liste de veille",
    lastDays: (days) => <>Calendrier des retours sur {days} jours</>,
    since: "2 novembre 2026",
    sourcesWhere: (n, c) => (n === 1 ? `l’unique Apple Store observé ${IN[c.cc]}` : `${num(L(c.cc), n)} Apple Store observés ${IN[c.cc]}`),
    checker: (c) => `Registre du retrait · ${NAME[c.cc]}`,
    appleStoresIn: (c) => `Apple Store ${IN[c.cc]}`,
    storesWithIt: "magasins qui le listent",
    more: "Aussi au registre",
  },

  /* ---------------------------------------------------------------- /stock/{product}/{place…} */
  product: {
    title: productTitle,
    description: productDescription,
    faq: productFaq,
    priceLabel,
    inPlace: (name: string, level: PlaceLevel) => (level === "store" ? `chez ${name}` : level === "country" ? inName(name) : dans(name)),
    h1Country: (model, c) => `${fx(model)} ${IN[c.cc]} : où il est en rayon`,
    h1Place: (model, where) => `${fx(model)} ${where}`,
    inStockNow: "En rayon à présent",
    yes: "Listé",
    no: "Non listé",
    pickup: "réponse retrait",
    configurations: "configurations listées",
    ofStores: (n) => `parmi ${nStores(n)} observés`,
    restocks24h: "Retours, dernières 24 h",
    restocksHint: (week, month, days) => `7 j : ${week} · ${days} j : ${month}`,
    sellOuts: (days) => `Repassés hors rayon · ${days} j`,
    stays: (ms) => { const d = fmtDuration(ms, "fr"); return /^moins\b/.test(d) ? `séjour médian ${d}` : `séjour médian ≈${d}`; },
    noPairs: "aucun séjour complet pour l’instant",
    lastRestock: "Retour le plus récent",
    noneYet: "pas encore vu",
    thisConfig: "cette configuration exacte",
    inDays: (days) => `aucun en ${days} jours`,
    notInStockNow: "Hors rayon à présent",
    configsInStock: (n, of) => <span><b className="text-ink">{n}</b>/{of} configurations en rayon</span>,
    inStockAt: (n, of) => <span>En rayon dans <b className="text-ink">{n}</b>/{of} {of > 1 ? "magasins" : "magasin"}</span>,
    checked: (live, priceText, tax) => <>{priceText}{tax} · dernière observation {live}</>,
    taxNote: (c) => taxNote(c.cc),
    beforeTax: "hors taxes",
    buyOnApple: "Commander sur apple.com",
    allStoresIn: (c) => `Annuaire des magasins ${IN[c.cc]}`,
    everyIphoneHere: "Les trois iPhone ici",
    everyIphone: (where) => `Les trois iPhone ${where}`,
    panel: (model, where) => `Liste de veille ${fx(model)}${where ? ` ${where}` : ""} : d’abord les configurations, puis les magasins à votre portée`,
    unitConfigs: "configurations",
    unitStores: "magasins",
    otherConfigsHere: "Autres versions dans ce magasin",
    byStorageColor: "La capacité d’abord, puis la finition",
    nearestStores: "Magasins au plus près",
    closest: (link, dist) => <>Magasin le plus proche qui le liste : {link} ({dist})</>,
    storeCity: (store, city) => <>{store} · {city}</>,
    mostRecentlyInStock: "Où il a été vu en dernier",
    storesWithItNow: "Magasins qui le listent aujourd’hui",
    storesIn: (where) => `Magasins ${where}`,
    colStatus: "rayon",
    colConfigs: "configurations listées",
    noStoreHasIt: "À la dernière observation, aucun magasin ne le liste.",
    noStoreHereHasIt: "À la dernière observation, aucun de ces magasins ne le liste.",
    moreStores: (n) => <>{n} autres magasins le listent · ouvrir l’annuaire complet ↗</>,
    byRegion: (c) => `Détail par ${noun(c).one}`,
    byCity: "Détail par ville",
    nearbyStores: "Magasins de secours",
    latestChanges: "Entrées les plus récentes du registre",
    nothingLogged: "Le registre est vide pour l’instant.",
    whenRestocks: "Heures des retours",
    howFast: "Combien de temps les fiches restent en ligne",
    restocksByConfig: "Retours par configuration",
    faqTitleCountry: (model, c) => `Questions de terrain · ${fx(model)} ${IN[c.cc]}`,
    faqTitle: (model, where) => `Questions de terrain · ${fx(model)} ${where}`,
    buySource: (model, c) => `apple.com (${NAME[c.cc]}) : page de commande de l’${fx(model)}`,
    nearby: "Lieux alentour",
    otherRegions: (c) => `Davantage de ${noun(c).other}`,
    elsewhereIn: (region) => `Plus loin · ${region}`,
    everyAppleStoreIn: (c) => `Annuaire complet des magasins ${IN[c.cc]}`,
    across: (model, c) => `${fx(model)} · vue nationale (${NAME[c.cc]})`,
    itemList: (model, where) => `${fx(model)} ${where}`,
    nearLead: (c, model, inStock, n, have) =>
      inStock === 0
        ? `L’${fx(model)} est hors rayon dans tous les Apple Store ${IN[c.cc]} à cet instant : la vraie question « près de chez moi » devient donc celle du magasin qui le verra revenir en premier. Mettez en veille les magasins à votre portée ; l’alerte part dès que l’un d’eux le liste.`
        : `${fx(model)} en rayon dans ${nStores(inStock)} sur ${n} : ${list(L(c.cc), have.slice(0, 5).map((l) => `${l.store}, ${l.city} (${plural("fr", l.configs, { one: "# config.", other: "# config." })})`), 5)}.`,
    nearHead: (c) => [cap(noun(c).one), "Magasins qui le listent"],
    nearCaption: (c, model) => `${fx(model)} en rayon pour le retrait, ${noun(c).one} par ${noun(c).one}, à la dernière observation`,
    nearMe: (c, model, alert) => `Pour classer tous les magasins à partir de votre position, ouvrez la liste de veille de cette page et utilisez Me localiser : les distances sont des estimations routières en kilomètres, et chaque magasin ouvre un trajet. [Mettre l’${fx(model)} en veille](${alert}).`,
    modelFaq: (c, model, low, high, inStock): { price: FaqItem; reserve: FaqItem } => {
      const money = (v: number) => price(L(c.cc), c, v);
      return {
        price: { q: `Que coûte l’${fx(model)} ${IN[c.cc]} ?`, a: `${money(low)} pour la plus petite capacité, jusqu’à ${money(high)} pour la plus grande, selon les prix d’apple.com (${taxNote(c.cc)}).` },
        reserve: { q: `Peut-on faire mettre un ${fx(model)} de côté pour le retrait ${IN[c.cc]} ?`, a: `Seulement en le commandant. Une configuration vous revient une fois le paiement apple.com terminé avec retrait en magasin ; Apple la garde alors pour le créneau choisi.${inStock === 0 ? " À la dernière observation, aucun magasin ne la liste : une entrée dans votre liste de veille vous préviendra en premier." : ""}` },
      };
    },
  },

  /* ---------------------------------------------------------------- /restocks */
  restocks: {
    metaTitle: (c, n) => `Registre des retours d’iPhone ${IN[c.cc]} : ${n === 1 ? "l’unique Apple Store" : `${num(L(c.cc), n)} Apple Store`}, en direct`,
    metaDescription: (c, n) => `Chaque retour d’iPhone Duo, 18 Pro et Pro Max consigné ${n === 1 ? "pour l’unique Apple Store" : "pour l’ensemble des Apple Store"} ${IN[c.cc]}, avec l’heure, la configuration exacte et sa position sur la carte.`,
    h1: (c) => `Registre des retours ${IN[c.cc]}`,
    summary: (day, week, model, region) => <>Dernières 24 heures : {nRestocks(day)} ; sept derniers jours : {num("fr", week)}{model ? ` · ${fx(model)}` : ""}{region ? ` · ${region}` : ""}. Heures affichées selon votre appareil.</>,
    allModels: "Chaque modèle",
    restocks: "Retours seulement",
    withSoldOut: "Retours et départs",
    regionLabel: (c) => cap(noun(c).one),
    allRegions: (c) => `${noun(c).f ? "Toute" : "Tout"} ${noun(c).one}`,
    filter: "Appliquer",
    page: (k) => <>feuillet {k}</>,
    newer: "← Entrées récentes",
    older: "Entrées antérieures →",
    getAlerts: "Commencer une liste de veille",
    byPlace: "Registres des retours par lieu",
    byRegion: (c) => `Détail par ${noun(c).one}`,
    datasetName: (c) => `Journal des retours en stock iPhone en retrait, Apple Store ${IN[c.cc]}`,
    datasetDescription: (c) => `Retours et départs confirmés de l’iPhone Duo, de l’iPhone 18 Pro et de l’iPhone 18 Pro Max pour le retrait en magasin, ${c.cc === "us" ? "sur l’ensemble des 269 Apple Store des États-Unis" : `sur l’ensemble des Apple Store ${IN[c.cc]}`}, avec magasin, configuration exacte et heure. Un retour n’entre au registre qu’après deux observations concordantes.`,
    datasetMeasured: ["Apple Store", "modèle, capacité et couleur de l’iPhone", "heure du retour en stock", "heure de la rupture"],
  },

  /* ---------------------------------------------------------------- /map */
  map: {
    metaTitle: (c, n) => `Carte du stock iPhone Duo en retrait : ${n === 1 ? "l’Apple Store" : "tous les Apple Store"} ${IN[c.cc]}, en direct`,
    metaDescription: (c, n) => `Carte en direct ${n === 1 ? "de l’Apple Store" : `des ${num(L(c.cc), n)} Apple Store`} ${IN[c.cc]} avec le stock en retrait des iPhone Duo, 18 Pro et Pro Max en ce moment, par capacité et couleur.`,
    // The map keeps the English region keys (its client strings are keyed by them) and names the country itself.
    country: (c) => ({ name: NAME[c.cc], inName: IN[c.cc], regionNoun: c.regionNoun, regionNounPlural: c.regionNounPlural }),
    everyStore: "Annuaire des magasins",
    storeCity: (store, city) => `${city} · ${store}`,
  },

  /* ---------------------------------------------------------------- /{cc}/stores */
  storesIndex: {
    metaDescription: (c, n, regions, cities, duo, max) => {
      const by = c.regionNoun && regions > 1 ? ` par ${noun(c).one} et par ville` : cities > 1 ? " par ville" : "";
      return `Les ${num(L(c.cc), n)} Apple Store ${IN[c.cc]}${by}, avec le stock en retrait en direct des iPhone Duo, 18 Pro et Pro Max : le Duo dans ${duo} magasin${duo > 1 ? "s" : ""} en ce moment, le Pro Max dans ${max}.`;
    },
    countAnswer: (n, spread, top) => `${n} dans l’annuaire, ${spread}${top.length ? `. Plus forte concentration : ${top[0].name}, ${top[0].count}${top[1] ? ` ; ensuite ${top[1].name}, ${top[1].count}` : ""}` : ""}.`,
    howMany: (c) => <>Le compte des Apple Store {IN[c.cc]}</>,
    duoNow: (c, n, have): FaqItem => ({
      q: `Où l’iPhone Duo est-il en rayon ${IN[c.cc]} à cet instant ?`,
      a: have.length === 0 ? `Dans aucun des ${n} lors de la dernière observation. Cette page et la carte s’actualisent dès qu’un magasin le liste, et une veille vous prévient en premier.` : `Dans ${have.length} sur ${n} lors de la dernière observation : ${have.slice(0, 6).map((x) => apple(x)).join(", ")}${have.length > 6 ? ", entre autres" : ""}.`,
    }),
    faq: (ctx: FaqContext) => placeFaq({ ...ctx, omit: [...(ctx.omit ?? []), "count", "stock", "lasts"] }, L(ctx.stores[0]?.country)),
    duoBlock: (alert) => `Pour ne pas le manquer : [mettre l’iPhone Duo en veille](${alert}) sur les magasins à votre portée. Chaque paire magasin–configuration compte pour une veille, et l’alerte part une fois la disponibilité repérée.`,
    intro: (c, n, spread, now, tax) => `${cap(IN[c.cc])}, **${plural(L(c.cc), n, { one: "# Apple Store", other: "# Apple Store" })}** au registre, ${spread}. En rayon pour le retrait à cet instant : iPhone Duo dans **${now.duo}**, iPhone 18 Pro Max dans **${now.max}**, 18 Pro dans **${now.pro}**. ${tax}`,
    crumb: "Annuaire des magasins",
    panel: (c) => `Votre liste de veille ${IN[c.cc]} : d’abord les téléphones, puis uniquement les magasins à votre portée`,
    matrixLabel: "Rayons, magasin par magasin",
    matrixH2: (c) => <>Rayons par modèle {IN[c.cc]}</>,
    matrixHint: "En rayon au dernier passage / suivies, pour chaque modèle.",
    topCaption: (c) => <>{cap(noun(c).other)} {noun(c).f ? "les mieux dotées" : "les mieux dotés"} en Apple Store (d’après la liste officielle d’Apple, telle que suivie ici)</>,
    regionHead: (c) => cap(noun(c).one),
    colStores: "Magasins Apple",
    colCities: "Villes",
    locationsBy: (c) => `Annuaire des magasins, ${noun(c).one} par ${noun(c).one}`,
    locationsIn: (c) => `Annuaire des magasins ${IN[c.cc]}`,
    storeCount: (n) => <>{plural("fr", n, { one: "# Apple Store", other: "# Apple Store" })}</>,
    storeCountAll: (n) => <>{nStores(n)}</>,
    whenRestock: (c) => <>Rythme des retours {IN[c.cc]}</>,
    howFast: (c) => <>Combien de temps les fiches restent en ligne {IN[c.cc]}</>,
    faqTitle: (c) => `Questions de terrain sur les magasins ${IN[c.cc]}`,
    getApp: "Installer l’app web",
    howItWorks: "Notes de méthode",
    pricing: "Formules et prix",
  },

  /* ---------------------------------------------------------------- /iphone-duo-restock-times */
  restockTimes: {
    fmt: {
      n: rtN,
      pct: rtPct,
      date: dateLabel,
      longDate,
      zoneStamp,
      local: (iso: string, store: Parameters<typeof localStamp>[1]) => localStamp(iso, store, L(store.country)),
      hour: hourFr,
      range: rangeFr,
      weekday: (d: number) => WD[d],
      store: (s: Store) => apple(s),
      storeWithPlace: (s: Store) => `${cityLabel(s.country, s.city, L(s.country))} · ${apple(s)}`,
    },
    title: (c) => `Heures de retour de l’iPhone Duo ${IN[c.cc]} : le registre d’observation`,
    metaDescription: (x) => {
      const { c, t, w, pattern } = x;
      const region = c.cc === "us" ? "État" : c.regionNoun ? noun(c).one : "magasin";
      const since = dateLabel(t.since, false);
      return t.n > 0 && pattern
        ? fitTitleW([
          `Registre de l’iPhone Duo ${rtIn(c)} : ${rtN(t.n)} retours consignés depuis le ${since}, dont ${rtPct(w.share)} ${between(w.from, w.to)} (heure du magasin)${t.sellout ? ` ; ${rtPct(t.sellout.within2min)} repartis en 2 min` : ""}. Détail par heure, jour, ${region} et configuration.`,
          `Registre de l’iPhone Duo ${rtIn(c)} : ${rtN(t.n)} retours consignés depuis le ${since}, dont ${rtPct(w.share)} ${between(w.from, w.to)}. Détail par heure, jour, ${region} et configuration.`,
          `iPhone Duo ${rtIn(c)} : ${rtN(t.n)} retours consignés depuis le ${since}, détaillés par heure, jour, ${region} et configuration.`,
        ], 158)
        : t.n > 0
          ? fitTitleW([
            `Registre de l’iPhone Duo ${rtIn(c)} : ${rtN(t.n)} retours confirmés depuis le ${since}, détaillés par heure du magasin, jour, ${region}, magasin et configuration.`,
            `iPhone Duo ${rtIn(c)} : ${rtN(t.n)} retours confirmés depuis le ${since}, par heure, jour, ${region} et configuration.`,
          ], 158)
          : `Registre de l’iPhone Duo ${rtIn(c)} : nos observations depuis le ${dateLabel(t.since, false)}, heure par heure et magasin par magasin.`;
    },
    h1: (x) => x.t.unknown
      ? `Retours de l’iPhone Duo ${rtIn(x.c)} : le registre`
      : x.t.n > 0
        ? `Retours de l’iPhone Duo ${rtIn(x.c)} : ce que le registre a consigné, heure par heure`
        : `Retours de l’iPhone Duo ${rtIn(x.c)} : rien de confirmé à ce jour, voici ce que le registre observe`,
    intro: (x) => {
      const { t, one, tracked, pattern, w } = x;
      const where = rtIn(x.c);
      return t.unknown ? (
        <>Le registre des retours n’a pas pu être lu pour cette requête ; les magasins {where} restent observés, et les chiffres reviennent au prochain chargement.</>
      ) : t.n > 0 ? (
        <>
          <b className="text-ink">{rtN(t.n)} retours d’iPhone Duo consignés depuis le {longDate(t.since)}</b> {one ? "à l’unique Apple Store" : "dans l’ensemble des Apple Store"} {where}{tracked > 1 ? <>, répartis sur {t.days} des {tracked} jours suivis</> : <> (une seule journée de suivi à ce jour)</>}
          {pattern && <> ; <b className="text-ink">{rtPct(w.share)} sont tombés {between(w.from, w.to)}</b>, heure du magasin</>}.
        </>
      ) : (
        <>
          <b className="text-ink">Rien de confirmé à ce jour.</b> Depuis le {longDate(t.since)}, ShelfSpring observe {one ? "l’unique Apple Store" : `les ${x.stores} Apple Store`} {where} sans avoir consigné de retour d’iPhone Duo pour le retrait.
        </>
      );
    },
    hero: {
      restocks: (x) => `retours consignés depuis le ${dateLabel(x.t.since, false)}`,
      window: (x) => `${between(x.w.from, x.w.to)}, heure du magasin`,
      days: "jours ayant connu un retour",
      now: (one) => (one ? "magasin le liste pour le retrait à cet instant" : "magasins le listent pour le retrait à cet instant"),
      today: (x, today: DayRow) => `aujourd’hui (${dateLabel(today.date)})${x.one ? "" : `, dans ${nStores(today.stores)}`}, jusqu’ici`,
      weekday: "jour dominant de la semaine, à ce jour",
    },
    heroPoints: (x, latest): Point[] => [
      ...(latest ? [{ text: <>Plus récent : <b className="text-ink">{latest.config}</b>{x.one ? null : <>, chez <Link href={storePath(latest.store)} className="underline underline-offset-2">{apple(latest.store)}</Link></>}, {localStamp(latest.at, latest.store, L(latest.store.country))}, heure du magasin</> }] : []),
      ...(x.t.peakWeekday != null ? [{ text: <>Jour dominant : <b className="text-ink">{WD[x.t.peakWeekday]}</b></> }] : []),
      { text: <>Apple ne publie <b className="text-ink">aucun calendrier de livraison</b> ; ces chiffres viennent de nos propres observations confirmées, recalculées environ toutes les cinq minutes</>, no: true },
    ],
    emptyPoints: (x): Point[] => [
      { text: <>À cet instant, <b className="text-ink">{x.duoNow} {x.duoNow > 1 ? "magasins" : "magasin"} sur {x.stores}</b> le {x.duoNow > 1 ? "listent" : "liste"} pour le retrait</> },
      { text: <>Chaque tableau ci-dessous attend son premier retour confirmé</>, step: true },
      { text: <>Pour des rythmes horaires et quotidiens mieux fournis : <Link href="/iphone-duo-restock-times" className="underline underline-offset-2">la page des États-Unis</Link>{EN}</>, step: true },
    ],
    setUpAlert: "Commencer une liste de veille iPhone Duo",
    logLive: "Ouvrir le registre des retours en direct",
    onThisPage: "Rubriques",
    nav: (x) => ({
      "time-of-day": "Heures",
      "day-by-day": "Calendrier",
      where: `Lieux (${rtRegion(x)})`,
      configuration: "Configurations",
      "how-long": "Durée en ligne",
      unavailable: "« Indisponible » ?",
      reddit: "Dires des forums",
      method: "Règles de comptage",
    }),
    h2: (x) => ({
      "time-of-day": `Heures de retour de l’iPhone Duo ${rtIn(x.c)} : que montre le registre ?`,
      "day-by-day": `Le calendrier des retours de l’iPhone Duo ${rtIn(x.c)}`,
      where: `Quels Apple Store ${rtIn(x.c)} voient l’iPhone Duo revenir le plus souvent ?`,
      configuration: `Configurations de l’iPhone Duo ${rtIn(x.c)} : lesquelles reviennent le plus ?`,
      "how-long": `Combien de temps un iPhone Duo revenu reste-t-il en ligne ${rtIn(x.c)} ?`,
      unavailable: "« Actuellement indisponible » presque partout : comment le lire ?",
      reddit: "Les forums face au registre : ce que montrent vraiment les retours de l’iPhone Duo",
      method: "Selon quelles règles ShelfSpring compte-t-il un retour ?",
    }),
    faq: (x): Faq[] => {
      const { t, w, pattern, sell, us, weekend, tracked } = x;
      const where = rtIn(x.c);
      const window = between(w.from, w.to);
      return [
        { q: `À quelles heures les retours d’iPhone Duo apparaissent-ils ${where} ?`, a: t.n > 0 && pattern
          ? `Plutôt le matin : ${rtPct(w.share)} des ${rtN(t.n)} retours confirmés depuis le ${longDate(t.since)} sont tombés ${window}, heure du magasin, et ${rtPct(hourShare(t.byHour, 8, 12))} entre 8 h et midi. Apple ne publie aucun calendrier ; c’est le rythme consigné par ShelfSpring, recalculé environ toutes les cinq minutes.`
          : `Apple ne publie aucun calendrier, et ShelfSpring a consigné ${nConfirmed(t.n)} ${where} depuis le ${longDate(t.since)}${t.days ? ` sur ${plural("fr", t.days, { one: "# jour", other: "# jours" })}` : ""}. Une heure type n’est avancée qu’à partir de ${PATTERN_MIN} retours répartis sur ${PATTERN_MIN_DAYS} jours distincts ; la page se complète seule.` },
        { q: `L’iPhone Duo revient-il aussi le week-end${us ? "" : ` ${where}`} ?`, a: t.n > 0
          ? `${weekend > 0 ? `Oui, à ce jour : ${nRestocks(weekend)} sur ${rtN(t.n)} ${weekend > 1 ? "sont tombés" : "est tombé"} un samedi ou un dimanche (${rtPct(weekend / t.n)})` : `Pas encore dans le registre : aucun des ${rtN(t.n)} retours n’est tombé un samedi ou un dimanche`}. ${t.peakWeekday != null ? `Le ${WD[t.peakWeekday]} domine pour l’instant.` : `Le registre ne désigne un jour dominant qu’après ${WEEKDAY_MIN_SPAN} jours de données ; il en couvre ${tracked}.`}`
          : `Pas encore de données de week-end ${where} ; le calendrier de cette page se remplit à mesure des retours confirmés.` },
        { q: "À partir de quelle heure surveiller ?", a: t.n > 0 && pattern
          ? `En surveillant vous-même, soyez sur apple.com, retrait sélectionné, dès ${hourFr(w.from)}, heure du magasin ; cette plage de deux heures a réuni ${rtPct(w.share)} des retours. Un retour médian ${sell ? `quitte le rayon en ${sell.medianSec} secondes` : "dure environ une minute"} : une veille ([fonctionnement des alertes, en anglais](/iphone-duo-stock-alerts)) couvre les heures où personne ne regarde.`
          : `Tant qu’aucun rythme ne se dégage ${where}, confiez la surveillance à une veille ([fonctionnement des alertes, en anglais](/iphone-duo-stock-alerts)).` },
        { q: "Pourquoi presque tous les Apple Store affichent-ils l’iPhone Duo comme indisponible ?", a: sell
          ? `Parce qu’un retour est bref : ${rtPct(sell.within2min)} des ${rtN(sell.n)} retours terminés mesurés ${where} ont quitté le rayon en moins de 2 minutes, et ${rtPct(sell.within20min)} en moins de 20. À cet instant, ${x.duoNow} des ${x.stores} magasins en listent un ; le reste du temps, apple.com affiche honnêtement « indisponible », même un jour riche en retours ([lire « indisponible », en anglais](/apple-store-pickup-availability-explained)).`
          : `Parce que le stock de retrait n’apparaît que quelques minutes à la fois. À cet instant, ${x.duoNow} sur ${nStores(x.stores)} ${where} en ${x.duoNow > 1 ? "listent" : "liste"} un ([lire « indisponible », en anglais](/apple-store-pickup-availability-explained)).` },
        { q: "Comment savoir quand mon Apple Store voit revenir l’iPhone Duo ?", a: `Mettez en veille le magasin, la capacité et la finition exacts : l’alerte part une fois le retour repéré et confirmé ([créer une veille](${x.alert}) ; [notes de méthode, en anglais](/how-it-works)).` },
      ];
    },
    sources: {
      applePickup: "Explication d’Apple, « Livraison et retrait » (en anglais)",
      newsroom: "« iPhone Duo arrives at Apple Store locations worldwide » · communiqué d’Apple, 23 octobre 2026 (en anglais)",
      macRumors: "« Apple Store pickup system for iPhone Duo went live again in the US and Canada » · article de MacRumors, 24 octobre 2026 (en anglais)",
      reports: (tracker) => `${tracker}, notes de la semaine de lancement sur l’iPhone Duo : tenues à l’écart de ce registre, jamais comptées`,
    },
    ld: (x) => ({
      datasetName: `Heures de retour en stock de l’iPhone Duo dans les Apple Store ${rtIn(x.c)}`,
      description: `Chaque retour en stock confirmé de l’iPhone Duo en retrait en magasin dans les Apple Store ${rtIn(x.c)} depuis le ${longDate(x.t.since)}, avec le magasin, la configuration et l’heure, d’après les vérifications de ShelfSpring toutes les 15 secondes ; résumé par heure locale, jour, ${rtRegion(x)}, magasin et configuration.`,
      spatial: `Apple Store ${rtIn(x.c)}`,
      measured: ["heure du retour en stock (heure locale du magasin)", "Apple Store", "capacité et couleur de l’iPhone Duo", "secondes avant épuisement"],
      size: `${nRestocks(x.t.n)} dans ${nStores(x.t.stores)}`,
    }),
    crumb: "Registre des retours de l’iPhone Duo",

    // ---- time of day
    timeLead: (x) => <b>{rtPct(x.w.share)} des {rtN(x.t.n)} retours consignés sont tombés {between(x.w.from, x.w.to)}, heure du magasin ; {rtPct(hourShare(x.t.byHour, 8, 12))} entre 8 h et midi.</b>,
    busiestHour: (count) => `heure de pointe : ${nRestocks(count)}`,
    morning: "de 8 h à midi",
    evening: "après 17 h : la soirée compte aussi",
    night: "de minuit à 6 h",
    tooFew: (x) => <b>Pas assez de jours pour avancer une heure{rtYet(x)} : {nLogged(x.t.n)} sur {plural("fr", x.t.days, { one: "# jour", other: "# jours" })} depuis le {longDate(x.t.since)}.</b>,
    tooFewKeys: (): Point[] => [
      { text: <>Une heure type demande <b className="text-ink">{PATTERN_MIN} retours répartis sur {PATTERN_MIN_DAYS} jours distincts</b></> },
      { text: <>Dix retours le même jour forment un épisode, pas une habitude</>, no: true },
      { text: <>Cette page se réécrit seule à mesure que les jours s’ajoutent</>, step: true },
    ],
    hourCaption: (x) => `Retours d’iPhone Duo consignés ${rtIn(x.c)}, par heure du magasin, depuis le ${dateLabel(x.t.since, false)} : ${rtN(x.t.n)} au total`,
    hourHead: ["Heure du magasin (24 h)", "Retours", "% du registre"],
    morningKeys: (x): Point[] => [
      { text: <>Le pic matinal <b className="text-ink">ne coïncide pas avec l’ouverture des portes</b>{x.us ? " : les Apple Store américains ouvrent pour la plupart à 10 h" : ""}</> },
      { text: <>Le stock de retrait se libère <b className="text-ink">en ligne</b>, avant même l’ouverture</> },
      { text: <>En surveillant vous-même : visez la plage <b className="text-ink">{rangeFr(x.w.from, x.w.to)}</b> un matin de semaine</>, step: true },
      { text: <>Confiez les <b className="text-ink">22 autres heures</b> à une <Link href={x.alert}>veille</Link> : personne ne les rafraîchit</>, step: true },
    ],
    storeChartKeys: (x): Point[] => [{ text: <>Chaque fiche magasin a son graphique, dans son propre fuseau (<Link href={x.storesHref}>{x.us ? "Apple Store par État" : `magasins ${rtIn(x.c)}`}</Link>) : utile quand un magasin voit ses retours à 8 h alors que sa région tourne autour de 9 h</>, step: true }],

    // ---- day by day
    dayLead: (x) => {
      const { t, tracked, one } = x;
      return t.n > 0 && tracked === 1 ? (
        <b>Une seule journée de suivi à ce jour, le {dateLabel(t.daily[t.daily.length - 1]?.date ?? t.since)}, avec {nLogged(t.n)}{one ? "" : ` dans ${nStores(t.stores)}`}.</b>
      ) : t.n > 0 ? (
        <b>{t.days === tracked ? `Les ${t.days} jours suivis ont tous connu` : `${t.days} jours sur ${tracked} depuis le ${longDate(t.since)} ont connu`} au moins un retour confirmé{t.peakWeekday != null ? `, le ${WD[t.peakWeekday]} en tête` : ""}.</b>
      ) : (
        <b>Aucun retour confirmé {rtIn(x.c)} depuis le {longDate(t.since)}.</b>
      );
    },
    daysTracked: "jours suivis ayant connu un retour",
    busiestDay: (x, day) => `jour le plus chargé, ${dateLabel(day.date)}${x.one ? "" : `, dans ${nStores(day.stores)}`}`,
    busiestDayNone: "jour le plus chargé",
    drop: (x, drop) => `magasins touchés au cours d’une même demi-heure, ${zoneStamp(drop.at, x.c)} (${plural("fr", drop.restocks, { one: "# configuration", other: "# configurations" })}) : vu de l’extérieur, une vague nationale`,
    weekend: (x) => `le week-end (${nRestocks(x.weekend)})`,
    dayCaption: (x) => `Retours d’iPhone Duo consignés ${rtIn(x.c)}, par jour calendaire${x.t.reports.length ? ". Les lignes grises marquées « signalé » reprennent les notes publiques d’autres sites de suivi pour les jours précédant l’ouverture de ce registre ; elles complètent la frise et n’entrent dans aucun total" : ""}`,
    dayHead: { date: "Jour", restocks: "Retours", stores: "Magasins", busiest: "Heure de pointe (24 h)", source: "Relevé par" },
    soFar: " · en cours",
    reportedBy: (names) => <>{names.join(" / ")}, signalé</>,
    dayKeys: (x, launch, resumed): Point[] => [
      { text: <><b className="text-ink">{dateLabel(launch)}</b> : jour de lancement, premières unités réservées aux commandes en ligne</> },
      { text: <><b className="text-ink">{dateLabel(resumed)}</b> : le retrait rouvre aux réservations{x.us ? " (MacRumors)" : ""}</> },
      x.t.reports.length
        ? { text: <>Lignes <b className="text-ink">signalé</b> : notes de la semaine de lancement publiées par {x.reportNames.join(" et ")}, jamais comptées</> }
        : { text: <>Le registre de tous les magasins {rtIn(x.c)} s’ouvre le <b className="text-ink">{longDate(x.t.since)}</b></> },
      ...(x.t.n > 0 && x.t.peakWeekday == null ? [{ text: <>Jour le plus chargé : désigné une fois <b className="text-ink">{WEEKDAY_MIN_SPAN} jours</b> de données réunis (le registre en couvre {x.tracked})</>, no: true }] : []),
      { text: <>Surveillez la colonne <b className="text-ink">magasins</b> : à nombre de retours égal, plus de magasins touchés rend la journée plus favorable pour vous</>, step: true },
    ],

    // ---- where
    whereLead: (x, hit, total) => (
      <b>{hit[0].name} : {nRestocks(hit[0].restocks)} dans {hit[0].stores} de ses {nStores(hit[0].storesTotal)} depuis le {dateLabel(x.t.since, false)}{hit[1] ? <>, suivi de {hit[1].name} ({rtN(hit[1].restocks)})</> : null}{hit[2] ? <> et de {hit[2].name} ({rtN(hit[2].restocks)})</> : null} ; {hit.length} {rtRegions(x)} sur {total} ont connu au moins un retour{total - hit.length > 0 ? `, ${total - hit.length} aucun à ce jour` : ""}.</b>
    ),
    whereNone: (x) => <b>{x.us || !noun(x.c).f ? "Aucun" : "Aucune"} {rtRegion(x)} {rtIn(x.c)} n’a encore de retour confirmé ; le tableau attend le premier.</b>,
    regionCaption: (x) => `Retours d’iPhone Duo consignés par ${rtRegion(x)} ${rtIn(x.c)}, depuis le ${dateLabel(x.t.since, false)}`,
    regionHead: (x) => [cap(rtRegion(x)), "Retours", "Magasins avec un retour", "Plus récent (heure du magasin)"],
    ofN: (a, b) => <>{a}/{b}</>,
    storesCaption: (x) => `Magasins au plus long registre de retours d’iPhone Duo ${rtIn(x.c)}, depuis le ${dateLabel(x.t.since, false)}`,
    storesHead: ["Magasin", "Retours", "Jours avec un retour", "Heure type", "Plus récent (heure du magasin)"],
    swaps: (x) => [
      { no: "Le magasin au plus long registre, où qu’il se trouve", yes: `Deux ou trois magasins à moins d’une heure de route, à guetter dès ${x.pattern ? hourFr(x.w.from) : "le matin"}`, why: "Un retour hors de portée ne vous sert à rien ; même le magasin le plus actif reste « indisponible » presque toute la journée." },
      { no: "Un seul magasin, en espérant", yes: "Une veille sur chacun, puis partir vers celui qui se déclenche", why: "Le tableau des comptes ne répond qu’à une question : vers lequel de vos magasins partir d’abord." },
    ],
    nearMe: `Magasins proches qui listent le Duo à cet instant${EN}`,

    // ---- configuration
    configLead: (x, top, rarest) => (
      <b>{top.label} : {rtN(top.restocks)} retours sur {rtN(x.t.n)} ({rtPct(top.restocks / x.t.n)}){rarest ? ` ; la plus rare, ${rarest.label}, n’en compte que ${rtN(rarest.restocks)}` : ""}.</b>
    ),
    mostRestocked: (config) => `${config} : configuration revenue le plus souvent`,
    versus: (a, bCount, b) => `retours en ${a}, contre ${rtN(bCount)} en ${b}`,
    restocksOf: (a) => `retours en ${a}`,
    byStorage: "selon la capacité",
    byColour: "selon la finition",
    configNone: (x) => <b>Aucune configuration {rtIn(x.c)} n’a de retour confirmé{rtYet(x)} ; les huit figurent déjà dans le tableau, prêtes pour le premier.</b>,
    configCaption: (x) => `Retours d’iPhone Duo consignés ${rtIn(x.c)}, une ligne par configuration, depuis le ${dateLabel(x.t.since, false)}`,
    configHead: ["Configuration", "Retours", "% du registre", "Plus récent (heure du magasin)"],
    configKeys: (x): Point[] => [
      { text: <>Le choix de la configuration pèse <b className="text-ink">davantage que celui du magasin</b></> },
      x.storageRatio != null
        ? { text: <>Acceptez la capacité qui revient le plus : environ <b className="text-ink">{num("fr", x.storageRatio)}×</b> plus de chances que la suivante</> }
        : { text: <>Acceptez la capacité qui revient le plus : vos chances progressent <b className="text-ink">sensiblement</b></> },
      { text: <>Le <b className="text-ink">2TB</b> se commande plutôt en livraison, avec un délai</>, no: true },
      { text: <>Prix et rayons à cet instant : <Link href="/which-iphone-duo-restocks-most">Quel iPhone Duo revient le plus souvent ?</Link>{EN}</>, step: true },
    ],

    // ---- how long
    howLongLead: (x, sell: SelloutFacts) => <b>Sur {rtN(sell.n)} retours terminés {rtIn(x.c)}, la moitié a quitté le rayon en moins de {sell.medianSec} secondes ; {rtPct(sell.within2min)} en moins de 2 minutes, {rtPct(sell.within20min)} en moins de 20.</b>,
    secUnit: "s",
    medianListing: "temps médian en rayon",
    within2: "hors rayon en moins de 2 min",
    within20: "hors rayon en moins de 20 min",
    fastest: "séjour le plus bref mesuré",
    howLongNone: (x) => <b>Pas assez de retours terminés {rtIn(x.c)} pour mesurer{rtYet(x)} ; ces chiffres s’affichent à partir de dix, et la page des États-Unis (en anglais) donne le tableau complet.</b>,
    howLongKeys: (x): Point[] => [
      { text: <>Une fiche de deux minutes se saisit grâce à une <b className="text-ink">veille</b>, pas en rechargeant apple.com</> },
      { text: <>Ce chiffre éclaire tout le reste de la page</> },
      { text: <>Chaque retour avec sa durée en secondes, par configuration et par {rtRegion(x)} : <Link href="/iphone-duo-sell-out-times">Combien de temps un retour d’iPhone Duo reste-t-il en ligne ?</Link>{EN}</>, step: true },
    ],
    measured: "Chaque durée est bornée par deux observations, celle où la configuration apparaît et celle où elle a disparu ; c’est donc un plafond, le séjour réel est plus court.",

    // ---- unavailable
    unavailableLead: (x) => <b>Parce qu’un retour est un passage éclair, pas un état durable : {x.one ? "un magasin" : `${rtN(x.stores)} magasins`} × {x.configs} configurations = {rtN(x.pairs)} combinaisons susceptibles d’être en rayon {rtIn(x.c)}, et à cet instant {x.duoNow} {x.duoNow > 1 ? "magasins listent" : "magasin liste"} un iPhone Duo.</b>,
    pairs: "paires magasin–configuration susceptibles d’être en rayon",
    listingNow: "listent un iPhone Duo pour le retrait à cet instant",
    goneIn2: "des retours repassés hors rayon en moins de deux minutes",
    last24: "retours confirmés, 24 dernières heures",
    unavailableKeys: (x, today): Point[] => [
      x.recent.restocks > 0
        ? { text: <>24 dernières heures : <b className="text-ink">{nConfirmed(x.recent.restocks)}</b> dans {nStores(x.recent.stores)} {rtIn(x.c)}</> }
        : today > 0
          ? { text: <>Aujourd’hui : <b className="text-ink">{nConfirmed(today)}</b> {rtIn(x.c)}</> }
          : { text: <>Le calendrier ci-dessus montre les retours qui ont bel et bien eu lieu</> },
      { text: <>Chacun n’est resté visible sur apple.com qu’<b className="text-ink">une minute ou deux</b></> },
      { text: <>« Indisponible partout » au quatrième comme au quatorzième jour : ce n’est <b className="text-ink">pas</b> Apple qui a cessé de livrer</>, no: true },
    ],
    unavailableLinks: { explained: `Lire « actuellement indisponible pour le retrait »${EN}`, howToGet: `Une voie concrète vers un iPhone Duo${EN}` },

    // ---- reddit
    redditLead: (x) => <b>Ce qui circule sur <a href="https://www.reddit.com/r/applestore/" target="_blank" rel="noopener nofollow">r/applestore</a> et <a href="https://www.reddit.com/r/iphone/" target="_blank" rel="noopener nofollow">r/iphone</a> est souvent sincère, mais propre à un magasin et périmé le lendemain ; voici les quatre affirmations qui reviennent le plus, mises en regard de {rtN(x.t.n)} retours confirmés {rtIn(x.c)}.</b>,
    redditCaption: "Affirmations fréquentes des forums sur les retours de l’iPhone Duo, confrontées aux retours confirmés du registre ShelfSpring",
    redditHead: ["Ce qui se dit", "Ce que montre le registre"],
    claims: (x): { claim: string; answer: ReactNode }[] => {
      const { t, w, tracked, recent } = x;
      return [
        { claim: "« Le réassort se fait la nuit : regardez à 3 h du matin. »", answer: t.n > 0 ? <>De minuit à 6 h, heure du magasin : {rtPct(hourShare(t.byHour, 0, 6))} des retours ; {between(w.from, w.to)} : {rtPct(w.share)}.</> : "Aucun retour consigné pour le vérifier." },
        { claim: "« Apple ne réapprovisionne qu’un jour par semaine. »", answer: t.n > 0 ? (t.peakWeekday != null ? <>Le {WD[t.peakWeekday]} domine pour l’instant ({rtN(t.byWeekday[t.peakWeekday])} sur {rtN(t.n)}), mais des retours ont eu lieu {t.days} jours sur {tracked}.</> : <>Des retours ont eu lieu {t.days} jours sur {tracked}{t.days === tracked ? ", sans aucun jour vide" : ""} ; le registre ne désigne un jour dominant qu’après {WEEKDAY_MIN_SPAN} jours de données.</>) : "Aucun retour consigné pour le vérifier." },
        { claim: "« Téléphonez au magasin pour savoir quand passe le camion. »", answer: "Aucun calendrier n’est publié par Apple ; ce que montre apple.com, ce sont des unités de retrait libérées en ligne, que le magasin voit apparaître en même temps que vous." },
        { claim: "« Marqué indisponible ? Alors c’est fini pour de bon. »", answer: recent.restocks > 0 ? <>{nConfirmed(recent.restocks)} dans {nStores(recent.stores)} sur les 24 dernières heures prouvent le contraire ; chacun est redevenu « indisponible » en quelques minutes.</> : t.n > 0 ? <>{rtN(t.n)} retours confirmés depuis le {dateLabel(t.since, false)} prouvent le contraire ; chacun est redevenu « indisponible » en quelques minutes.</> : "Rien pour le vérifier à ce jour." },
      ];
    },
    redditKeys: (): Point[] => [
      { text: <>La rumeur comble l’<b className="text-ink">absence de données</b> ; cette page, ce sont les données, en accès libre</> },
      { text: <>Là où les forums voient juste : la <b className="text-ink">préparation du paiement</b>, compte connecté et Apple Pay prêt (<Link href="/how-to-grab-an-iphone-duo-restock">liste de préparation</Link>{EN})</> },
    ],

    // ---- method
    methodLead: <b>Un retour est compté lorsque apple.com liste une configuration pour le retrait dans un magasin où elle ne l’était pas, et que deux observations successives le confirment.</b>,
    methodKeys: (x): Point[] => [
      { text: <>{x.one ? "L’Apple Store" : "Chaque Apple Store"} {rtIn(x.c)} est consigné à partir d’un <b className="text-ink">flux d’inventaire synchronisé</b></> },
      { text: <>Un premier « disponible » doit être <b className="text-ink">confirmé</b> avant d’entrer au registre</> },
      { text: <>Une fiche qui disparaît est confirmée à l’<b className="text-ink">observation suivante</b></> },
      { text: <>Première observation d’un magasin, requête échouée ou expirée : <b className="text-ink">jamais</b> un retour, jamais un départ</>, no: true },
      { text: <>Heures et dates à l’<b className="text-ink">heure de chaque magasin</b> ; « vague » = la même demi-heure d’un fuseau à l’autre</> },
      { text: <>Signalements d’autres sites de suivi{x.t.reports.length ? ` (${x.reportNames.join(", ")})` : ""} : sur leurs propres lignes, étiquetées, <b className="text-ink">jamais dans un total</b></> },
      { text: <>Recalculé environ toutes les cinq minutes ; <Link href={x.logHref}>le registre des retours</Link> lui-même est en direct</>, step: true },
    ],
    quote: "Vous pouvez citer ces chiffres avec un lien vers cette page ; ShelfSpring tient un registre indépendant, sans lien avec Apple, à partir de la même disponibilité de retrait que chacun peut voir sur apple.com.",
    alertIn: (x) => <>Mettre l’iPhone Duo en veille{x.one ? "" : ` ${rtIn(x.c)}`}</>,

    // ---- related, FAQ, sources
    related: "Ailleurs dans le même registre",
    sameData: `Questions auxquelles ce registre répond${EN}`,
    questions: {
      sellOut: "Combien de temps un retour reste-t-il en ligne ?",
      alerts: "Être averti d’un retour en premier",
      howToGet: "Une voie concrète vers un iPhone Duo",
      whichConfig: "Quelle configuration revient le plus souvent",
      nearMe: "Quels magasins proches le listent maintenant",
      unavailable: "Lire « actuellement indisponible »",
    },
    otherCountries: (us) => (us ? "Cette étude dans d’autres pays" : "Registres des autres pays"),
    faqTitle: "Questions de terrain",
  },
};

export const views: Dict["views"] = withShelfViews("fr", baseViews);
