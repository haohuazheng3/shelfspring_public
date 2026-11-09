import { withShelfViews } from "@/lib/seo/localizedCopy";
/**
 * Spanish (Spain): views — the product × place pages, the return log, the pickup map, the iPhone Duo return-record
 * page and the store index of /es-es/… Same arguments and shapes as English (dict/en/views.tsx). `Store` / `Place`
 * / `Product` objects are English data and are named here in Spanish (places.ts); hours read "9:00".
 */
import type { ReactNode } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import type { Point } from "@/components/ui/Viz";
import type { Faq } from "@/lib/content/types";
import { catalogFor, stateCodeOf, storePath, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type Country, type CountryCode } from "@/lib/apple/countries";
import { faq as placeFaq, fmtDuration, peakOf, type FaqContext, type FaqItem } from "@/lib/seo/enrich";
import type { Place, Product } from "@/lib/seo/products";
import type { PlaceStats, RestockStats } from "@/lib/stock/queries";
import type { StoreLine } from "@/lib/seo/productData";
import { hourShare, type DayRow, type SelloutFacts } from "@/lib/content/restockTimes";
import { PATTERN_MIN, PATTERN_MIN_DAYS, WEEKDAY_MIN_SPAN, localStamp } from "@/lib/content/siteFacts";
import { OTHER_TRACKERS, SPEED } from "@/lib/plans";
import { distance, fitTitleW, list, num, price, weekdays } from "@/lib/i18n/format";
import { appleStoreLabel, cityLabel, colorLabel, regionLabel, storeLabel } from "@/lib/i18n/places";
import type { Dict } from "../en";
import type { RestockTimesMeta, RestockTimesView } from "../en/views";
import { L, n, pc, pais, enPais, dePais, noun, cap, taxNote, h, lasH, range, between, tc, fixHour, fixDay, losDias, todoPais, otherTrackers, apples, tiendas, reposiciones, reapariciones, dias, v, aprox } from "./words";

/* ---------------------------------------------------------------- Spanish names of English data */

const apple = (s: Store): string => appleStoreLabel(s, L);
const cityOf = (s: Store): string => cityLabel(s.country ?? "us", s.city, L);
const ccOf = (p: { country?: CountryCode }): CountryCode => p.country ?? "us";
/** "iPhone Duo 256GB Cielo nocturno". */
const pName = (p: Product): string => tc(p.name);
const pShort = (p: Product): string => tc(p.short);
/** A place's name in Spanish. */
function placeEs(place: Place): string {
  const cc = ccOf(place);
  if (place.level === "country") return cc === "us" ? "EE. UU." : pais(cc);
  if (place.level === "state") return regionLabel(cc, place.state!, L);
  if (place.level === "city") return cityLabel(cc, place.city!, L);
  return apple(place.store!);
}
/** "en España" / "en Madrid" / "en Apple Puerta del Sol". */
const enLugar = (place: Place): string => (place.level === "country" ? (ccOf(place) === "us" ? "en EE. UU." : enPais(ccOf(place))) : `en ${placeEs(place)}`);
/** "de España" / "de Madrid". */
const deLugar = (place: Place): string => (place.level === "country" ? (ccOf(place) === "us" ? "de EE. UU." : dePais(ccOf(place))) : `de ${placeEs(place)}`);
const configs = (x: number) => `${n(x)} ${x === 1 ? "configuración" : "configuraciones"}`;
const confirmadas = (x: number) => `${reposiciones(x)} ${x === 1 ? "confirmada" : "confirmadas"}`;
/** "1 reaparición anotada" / "14 reapariciones anotadas". */
const anotadas = (x: number) => `${reapariciones(x)} ${x === 1 ? "anotada" : "anotadas"}`;
/** "de 9:00 a 11:00". */
const deA = (from: number, to: number) => `de ${h(from)} a ${h(to)}`;
const appleName = (name: string) => (/^apple\b/i.test(name) ? name : `Apple ${name}`);

/* ---------------------------------------------------------------- product × place copy */

function productTitle(product: Product, place: Place, inStock: number): string {
  const cc = ccOf(place);
  if (place.level === "country") {
    const where = cc === "us" ? "EE. UU." : pais(cc);
    return fitTitleW([
      ...(inStock > 0 ? [`${pName(product)} en stock en ${apples(inStock)} ${cc === "us" ? "de EE. UU." : dePais(cc)}`] : []),
      `Stock del ${pName(product)} para recogida en ${where}, en directo`,
      `Stock del ${pShort(product)} para recogida en ${where}`,
      `Stock del ${pShort(product)}`,
    ]);
  }
  if (place.level === "store") {
    const s = place.store!;
    const now = inStock > 0 ? "en stock ahora" : "stock para recogida";
    return fitTitleW([`${pName(product)} en ${apple(s)}: ${now}`, `${pShort(product)} en ${apple(s)}, ${cityOf(s)}`, `${pShort(product)} en ${apple(s)}`, `${pShort(product)} en ${storeLabel(s, L)}`, `${pShort(product)} · ${storeLabel(s, L)}`]);
  }
  const w = placeEs(place);
  return fitTitleW([`${pName(product)} en stock en ${w}: ${n(inStock)} de ${n(place.stores.length)}`, `${pName(product)} en ${w}: stock para recogida`, `${pShort(product)} en stock en ${w}`, `${pShort(product)} en ${w}`]);
}

function productDescription(product: Product, place: Place, inStock: number, stats: PlaceStats): string {
  const week = `${reposiciones(stats.week)} esta semana`;
  if (place.level === "store") {
    const s = place.store!;
    const locality = ccOf(place) === "us" ? `${s.city} ${stateCodeOf(s)}` : cityOf(s);
    return fitTitleW([
      `Stock para recogida del ${pName(product)} en ${apple(s)}, ${locality}: ${inStock > 0 ? "en stock ahora" : "sin stock ahora mismo"}, ${week}. Estado en directo, horas de reposición y alertas.`,
      `${pName(product)} en ${apple(s)}: ${inStock > 0 ? "en stock ahora" : "sin stock ahora"}, ${week}. Estado en directo y alertas.`,
    ], 155);
  }
  const where = `Apple Store ${deLugar(place)}`;
  const k = place.stores.length;
  return fitTitleW([
    `Stock para recogida del ${pName(product)}: ${n(inStock)} de ${n(k)} ${where} lo ${v(inStock, "tiene", "tienen")} ahora, ${week}. En directo por tienda, horas de reposición y alertas.`,
    `${pName(product)}: ${n(inStock)} de ${n(k)} ${where} lo ${v(inStock, "tiene", "tienen")} ahora, ${week}. En directo por tienda y alertas.`,
  ], 155);
}

function productFaq(product: Product, place: Place, lines: StoreLine[], stats: PlaceStats, clock: RestockStats, nearest: { name: string; city: string; distance: number } | null): FaqItem[] {
  const out: FaqItem[] = [];
  const at = enLugar(place);
  const cc = ccOf(place);
  const inStock = lines.filter((l) => l.available.length > 0);
  const near = nearest ? `${appleName(nearest.name)} (${nearest.city}, a ${distance(L, cc, nearest.distance)})` : "";
  if (place.level === "store") {
    const l = lines[0];
    out.push({
      q: `¿Queda algún ${pName(product)} ${at}?`,
      a: l && l.available.length > 0
        ? `En el último vistazo, sí${product.parts.length > 1 ? `: ${list(L, l.available.map((i) => `${i.storage} ${colorLabel(i.color, L)}`), 4, (x) => `${n(x)} más`)}` : ""}.`
        : `En el último vistazo, no${nearest ? `; la tienda más próxima que lo lista es ${near}` : ""}.`,
    });
  } else {
    out.push({
      q: `¿En qué Apple Store ${deLugar(place)} está ahora el ${pName(product)}?`,
      a: inStock.length === 0
        ? `En ninguno durante el último vistazo${nearest ? `; el más próximo que lo lista es ${near}` : ""}.`
        : `En ${tiendas(inStock.length)} durante el último vistazo: ${list(L, inStock.map((x) => apple(x.store)), 4, (x) => `${n(x)} más`)}.`,
    });
  }
  const peak = peakOf(clock, L);
  out.push({
    q: `¿Con qué frecuencia vuelve el ${pName(product)} ${at}?`,
    a: stats.month === 0
      ? `Ninguna reaparición anotada ${at} en ${n(stats.days)} días.`
      : `${anotadas(stats.month)} en ${n(stats.days)} días, ${n(stats.week)} de ellas esta semana${peak ? `; hora habitual: ${peak.hour} en el reloj de la tienda` : ""}.`,
  });
  if (stats.medianMs != null) out.push({ q: `¿Cuánto aguanta en el estante ${at}?`, a: `${cap(aprox(fmtDuration(stats.medianMs, L)))} de mediana antes de volver a salir del estante.` });
  return out;
}

/** "2339 €–3839 €": the price range of the page's configurations. */
function priceLabel(product: Product): string {
  const cc = ccOf(product);
  const prices = catalogFor(product.model, cc).filter((c) => product.parts.includes(c.partNumber)).map((c) => c.price);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  const f = (x: number) => price(L, COUNTRIES[cc], x);
  return lo === hi ? f(lo) : `${f(lo)}–${f(hi)}`;
}

/* ---------------------------------------------------------------- restock-times helpers */

const rtN = (x: number) => num(L, x);
const rtPct = (x: number) => (x > 0 && x < 0.005 ? "<1 %" : pc(Math.round(x * 100)));
const dtf = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("es-ES", o);
/** "jue, 29 oct" / "29 oct". */
const dateLabel = (ymd: string, weekday = true) => dtf({ timeZone: "UTC", month: "short", day: "numeric", ...(weekday ? { weekday: "short" as const } : {}) }).format(new Date(`${ymd}T12:00:00Z`));
/** "2 de noviembre de 2026". */
const longDate = (ymd: string) => dtf({ timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${ymd}T12:00:00Z`));
/** "27 oct, 9:30 CET". */
const zoneStamp = (iso: string, c: Country) => dtf({ timeZone: c.timeZone, month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(new Date(iso));
const wd = (d: number) => weekdays(L)[d];
const rn = (x: { us: boolean; c: Country }) => noun(x.c, x.us);

const OTHER = otherTrackers(OTHER_TRACKERS);

/* ---------------------------------------------------------------- views */

const baseViews: Dict["views"] = {
  common: {
    inCountry: (c: Country) => enPais(c.cc),
    liveMap: "Mapa de recogida",
    restockLog: "Registro de reapariciones",
    alertMe: "Añadir a la lista de seguimiento",
    lastDays: (days: number) => <>Calendario de reapariciones · {n(days)} días</>,
    since: "2 de noviembre de 2026",
    sourcesWhere: (k: number, c: Country) => (k === 1 ? `el único Apple Store observado ${dePais(c.cc)}` : `${apples(k)} observados ${enPais(c.cc)}`),
    checker: (c: Country) => `Registro de recogida ${dePais(c.cc)}`,
    appleStoresIn: (c: Country) => `Tiendas Apple ${dePais(c.cc)}`,
    storesWithIt: "tiendas que lo listan",
    more: "También en el registro",
  },

  product: {
    title: productTitle,
    description: productDescription,
    faq: productFaq,
    priceLabel,
    inPlace: (name: string) => `en ${name}`,
    h1Country: (model: string, c: Country) => `${tc(model)} ${enPais(c.cc)}: el estante de recogida`,
    h1Place: (model: string, where: string) => `${tc(model)} ${where}`,
    inStockNow: "En el estante ahora",
    yes: "Listado",
    no: "Sin listar",
    pickup: "respuesta de recogida",
    configurations: "configuraciones listadas",
    ofStores: (k: number) => (k === 1 ? "en 1 tienda observada" : `entre ${n(k)} tiendas observadas`),
    restocks24h: "Reapariciones, último día",
    restocksHint: (week: number, month: number, days: number) => `7 d: ${n(week)} · ${n(days)} d: ${n(month)}`,
    sellOuts: (days: number) => `Salidas del estante · ${n(days)} d`,
    stays: (ms: number) => { const d = fmtDuration(ms, L); return /^menos /.test(d) ? `estancia mediana: ${d}` : `estancia mediana ≈${d}`; },
    noPairs: "aún sin estancias completas",
    lastRestock: "Reaparición más reciente",
    noneYet: "aún sin ver",
    thisConfig: "esta configuración exacta",
    inDays: (days: number) => `ninguna en ${n(days)} días`,
    notInStockNow: "Fuera del estante ahora",
    configsInStock: (k: number, of: number) => <span><b className="text-ink">{n(k)}</b>/{n(of)} configuraciones en el estante</span>,
    inStockAt: (k: number, of: number) => <span>En el estante en <b className="text-ink">{n(k)}</b>/{n(of)} {of === 1 ? "tienda" : "tiendas"}</span>,
    checked: (live: ReactNode, p: string, tax: string) => <>{p}{tax} · último vistazo {live}</>,
    taxNote: (c: Country) => taxNote(c),
    beforeTax: "antes de impuestos",
    buyOnApple: "Pedir en apple.com",
    allStoresIn: (c: Country) => `Directorio de tiendas ${dePais(c.cc)}`,
    everyIphoneHere: "Los tres iPhone en esta tienda",
    everyIphone: (where: string) => `Los tres iPhone ${where}`,
    panel: (model: string, where: string | null) => `Lista de seguimiento del ${tc(model)}${where ? ` ${where}` : ""}: primero las configuraciones, después las tiendas a tu alcance`,
    unitConfigs: "configuraciones",
    unitStores: "tiendas",
    otherConfigsHere: "Otras versiones en esta tienda",
    byStorageColor: "Primero la capacidad, luego el acabado",
    nearestStores: "Tiendas más próximas",
    closest: (link: ReactNode, dist: string) => <>Tienda más próxima que lo lista: {link} ({dist})</>,
    storeCity: (store: string, city: string) => <>{city} · {store}</>,
    mostRecentlyInStock: "Dónde se vio por última vez",
    storesWithItNow: "Tiendas que lo listan hoy",
    storesIn: (where: string) => `Las tiendas ${where}`,
    colStatus: "estante",
    colConfigs: "configuraciones listadas",
    noStoreHasIt: "En el último vistazo, ninguna tienda lo lista.",
    noStoreHereHasIt: "En el último vistazo, ninguna de estas tiendas lo lista.",
    moreStores: (k: number) => <>Otras {n(k)} tiendas lo listan · abre el directorio completo ↗</>,
    byRegion: (c: Country) => `Desglose por ${noun(c).one}`,
    byCity: "Desglose por ciudad",
    nearbyStores: "Tiendas de reserva",
    latestChanges: "Anotaciones más recientes",
    nothingLogged: "El registro aún está en blanco.",
    whenRestocks: "Horas de reaparición",
    howFast: "Cuánto duraron los anuncios",
    restocksByConfig: "Reapariciones por configuración",
    faqTitleCountry: (model: string, c: Country) => `Preguntas de campo · ${tc(model)} ${enPais(c.cc)}`,
    faqTitle: (model: string, where: string) => `Preguntas de campo · ${tc(model)} ${where}`,
    buySource: (model: string, c: Country) => `apple.com (${pais(c.cc)}): página de pedido del ${tc(model)}`,
    nearby: "Lugares alrededor",
    otherRegions: (c: Country) => `Más ${noun(c).other}`,
    elsewhereIn: (region: string) => `Más de ${region}`,
    everyAppleStoreIn: (c: Country) => `Directorio completo ${dePais(c.cc)}`,
    across: (model: string, c: Country) => `${tc(model)} · ${c.cc === "us" ? "todo EE. UU." : todoPais(c.cc)}`,
    itemList: (model: string, where: string) => `${tc(model)} ${where}`,
    nearLead: (c: Country, model: string, inStock: number, k: number, have: { store: string; city: string; configs: number }[]) =>
      inStock === 0
        ? `En este momento ningún Apple Store ${dePais(c.cc)} lista el ${tc(model)} para recogida, así que «cerca de mí» depende de qué tienda vuelva a mostrarlo antes. Pon en tu lista de seguimiento las tiendas a tu alcance y el aviso saldrá cuando una lo liste.`
        : `${n(inStock)} de las ${n(k)} tiendas lo ${v(inStock, "lista", "listan")} ahora: ${list(L, have.slice(0, 5).map((l) => `${l.store} (${l.city}, ${configs(l.configs)})`), 5)}.`,
    nearHead: (c: Country) => [cap(noun(c).one), "Tiendas que lo listan ahora"],
    nearCaption: (c: Country, model: string) => `El ${tc(model)} en el estante, ${noun(c).one} a ${noun(c).one}, según el último vistazo`,
    nearMe: (_c: Country, model: string, alert: string) => `Para ordenar todas las tiendas desde donde estás, abre la lista de seguimiento de esta página y toca «Localízame»: las distancias son estimadas, por carretera y en kilómetros, y cada tienda enlaza a su ruta. [Empieza una lista para el ${tc(model)}](${alert}).`,
    modelFaq: (c: Country, model: string, low: number, high: number, inStock: number): { price: FaqItem; reserve: FaqItem } => ({
      price: { q: `¿Qué cuesta el ${tc(model)} ${enPais(c.cc)}?`, a: `${price(L, c, low)} con la capacidad menor y hasta ${price(L, c, high)} con la mayor, según apple.com (${taxNote(c)}).` },
      reserve: { q: `¿Hay forma de apartar un ${tc(model)} para recogerlo ${enPais(c.cc)}?`, a: `Solo pidiéndolo. Una configuración es tuya cuando completas el pago en apple.com con la recogida en tienda elegida; Apple la guarda para la franja que escojas.${inStock === 0 ? " En el último vistazo ninguna tienda lo lista, así que una lista de seguimiento es la forma de enterarte antes." : ""}` },
    }),
  },

  restocks: {
    metaTitle: (c: Country, k: number) => fitTitleW([`Registro de reposiciones de iPhone ${enPais(c.cc)}: ${k === 1 ? "su Apple Store" : `los ${apples(k)}`}, en directo`, `Reposiciones de iPhone ${enPais(c.cc)}: ${k === 1 ? "su Apple Store" : `los ${apples(k)}`}, en directo`, `Reposiciones de iPhone ${enPais(c.cc)}, en directo`]),
    metaDescription: (c: Country, k: number) => `Cada reposición del iPhone Duo, 18 Pro y Pro Max para recogida en ${k === 1 ? "el Apple Store" : "los Apple Store"} ${dePais(c.cc)}, con la hora exacta, la configuración y el mapa.`,
    h1: (c: Country) => `Registro de reapariciones ${enPais(c.cc)}`,
    summary: (day: number, week: number, model?: string, region?: string) => <>Último día: {reapariciones(day)}; últimos siete días: {n(week)}{model ? ` · ${model}` : ""}{region ? ` · ${region}` : ""}. Las horas siguen el reloj de tu dispositivo.</>,
    allModels: "Cualquier modelo",
    restocks: "Solo reapariciones",
    withSoldOut: "Reapariciones y salidas",
    regionLabel: (c: Country) => cap(noun(c).one),
    allRegions: (c: Country) => `Cualquier ${noun(c).one}`,
    filter: "Aplicar",
    page: (k: number) => <>hoja {n(k)}</>,
    newer: "← Posteriores",
    older: "Anteriores →",
    getAlerts: "Empezar una lista de seguimiento",
    byPlace: "Registros de reapariciones por lugar",
    byRegion: (c: Country) => `Desglose por ${noun(c).one}`,
    datasetName: (c: Country) => `Registro de reposiciones de iPhone para recogida en los Apple Store ${dePais(c.cc)}`,
    datasetDescription: (c: Country) => `Cada reaparición y salida confirmadas del iPhone Duo, iPhone 18 Pro y iPhone 18 Pro Max para recogida en tienda en ${c.cc === "us" ? "los 269 Apple Store de EE. UU." : `los Apple Store ${dePais(c.cc)}`}, con tienda, configuración exacta y hora.`,
    datasetMeasured: ["Apple Store", "modelo, capacidad y color del iPhone", "hora de la reposición", "hora del agotamiento"],
  },

  map: {
    metaTitle: (c: Country, k: number) => fitTitleW([`Mapa del stock del iPhone Duo: ${k === 1 ? "el Apple Store" : "todos los Apple Store"} ${dePais(c.cc)}, en directo`, `Mapa del stock del iPhone Duo ${enPais(c.cc)}, en directo`]),
    metaDescription: (c: Country, k: number) => `Mapa en directo ${k === 1 ? "del Apple Store" : `de los ${apples(k)}`} ${dePais(c.cc)} con el stock para recogida del iPhone Duo, 18 Pro y Pro Max ahora mismo, por capacidad y color.`,
    // regionNoun stays the country data's key: the map looks its Spanish words up in cdict map.nouns.
    country: (c: Country) => ({ name: pais(c.cc), inName: enPais(c.cc), regionNoun: c.regionNoun, regionNounPlural: c.regionNounPlural }),
    everyStore: "Directorio de tiendas",
    storeCity: (store: string, city: string) => `${city} · ${store}`,
  },

  storesIndex: {
    metaDescription: (c: Country, k: number, regions: number, cities: number, duo: number, max: number) => {
      const by = c.regionNoun && regions > 1 ? ` por ${noun(c).one} y ciudad` : cities > 1 ? " por ciudad" : "";
      return `Los ${apples(k)} ${dePais(c.cc)}${by}, con el stock para recogida del iPhone Duo, 18 Pro y Pro Max en directo: ${n(duo)} ${v(duo, "tiene", "tienen")} ahora el Duo y ${n(max)}, el Pro Max.`;
    },
    countAnswer: (k: number, spread: string, top: { name: string; count: number }[]) => `${n(k)} en el directorio, ${spread}${top.length ? `. Mayor concentración: ${top[0].name}, con ${n(top[0].count)}${top[1] ? `; después, ${top[1].name}, con ${n(top[1].count)}` : ""}` : ""}.`,
    howMany: (c: Country) => <>Recuento de los Apple Store {enPais(c.cc)}</>,
    duoNow: (c: Country, k: number, have: Store[]): FaqItem => ({
      q: `¿En qué tiendas ${dePais(c.cc)} está ahora el iPhone Duo?`,
      a: have.length === 0
        ? `En ninguna de las ${n(k)} durante el último vistazo. Esta página y el mapa cambian en cuanto una lo lista, y con una lista de seguimiento te enteras sin tener que mirar.`
        : `En ${n(have.length)} de las ${n(k)} durante el último vistazo: ${list(L, have.map(apple), 6, (x) => `${n(x)} más`)}.`,
    }),
    faq: (ctx: FaqContext) => placeFaq({ ...ctx, peak: ctx.peak ? { ...ctx.peak, hour: fixHour(ctx.peak.hour), day: ctx.peak.day ? fixDay(ctx.peak.day) : null } : ctx.peak, omit: [...(ctx.omit ?? []), "count", "stock", "lasts"] }, L),
    duoBlock: (alert: string) => `Pon en tu lista de seguimiento las tiendas a tu alcance: [empieza una lista del iPhone Duo](${alert}). Cada combinación de tienda y configuración exacta es un aviso.`,
    intro: (c: Country, k: number, spread: string, now: { duo: number; max: number; pro: number }, tax: string) => `${apples(k)} ${enPais(c.cc)}, ${spread}. En el estante ahora: iPhone Duo en **${n(now.duo)}**, iPhone 18 Pro Max en **${n(now.max)}** y 18 Pro en **${n(now.pro)}**. ${tax}`,
    crumb: "Directorio de tiendas",
    panel: (c: Country) => `Tu lista de seguimiento ${enPais(c.cc)}: primero los teléfonos, después solo las tiendas a las que podrías llegar`,
    matrixLabel: "Estante tienda a tienda",
    matrixH2: (c: Country) => <>Recuento del estante por modelo {enPais(c.cc)}</>,
    matrixHint: "En el estante en el último vistazo / seguidas, por modelo.",
    topCaption: (c: Country) => <>{cap(noun(c).other)} con más Apple Store (según la lista oficial de tiendas de Apple que sigue este registro)</>,
    regionHead: (c: Country) => cap(noun(c).one),
    colStores: "Apple Store",
    colCities: "Ciudades",
    locationsBy: (c: Country) => `Directorio de tiendas, ${noun(c).one} a ${noun(c).one}`,
    locationsIn: (c: Country) => `Directorio de tiendas ${dePais(c.cc)}`,
    storeCount: (k: number) => <>{apples(k)}</>,
    storeCountAll: (k: number) => <>{n(k)} en total</>,
    whenRestock: (c: Country) => <>Horas de reaparición {enPais(c.cc)}</>,
    howFast: (c: Country) => <>Cuánto duraron los anuncios {enPais(c.cc)}</>,
    faqTitle: (c: Country) => `Preguntas de campo sobre las tiendas ${dePais(c.cc)}`,
    getApp: "Instalar la app web",
    howItWorks: "Notas de método",
    pricing: "Planes y precios",
  },

  restockTimes: {
    fmt: {
      n: rtN,
      pct: rtPct,
      date: dateLabel,
      longDate,
      zoneStamp,
      local: (iso: string, store: Parameters<typeof localStamp>[1]) => localStamp(iso, store, L),
      hour: (x: number) => h(x),
      range,
      weekday: (d: number) => wd(d),
      store: (s: Store) => apple(s),
      storeWithPlace: (s: Store) => `${cityOf(s)} · ${apple(s)}`,
    },
    title: (c: Country) => `¿Cuándo repone Apple el iPhone Duo ${enPais(c.cc)}?`,
    metaDescription: (x: RestockTimesMeta) => {
      const { c, t, w, pattern } = x;
      const region = c.cc === "us" ? "estado" : c.regionNoun ? noun(c).one : "tienda";
      const since = dateLabel(t.since, false);
      return t.n > 0 && pattern
        ? fitTitleW([
          `${cap(reposiciones(t.n))} del iPhone Duo ${enPais(c.cc)} desde el ${since}: el ${rtPct(w.share)}, ${between(w.from, w.to)}${t.sellout ? `; el ${rtPct(t.sellout.within2min)}, agotadas en 2 min` : ""}. Tablas por hora, día, ${region} y configuración.`,
          `${cap(reposiciones(t.n))} del iPhone Duo ${enPais(c.cc)} desde el ${since}: el ${rtPct(w.share)}, ${between(w.from, w.to)} (hora local). Tablas por hora, día, ${region} y configuración.`,
          `Horas de reposición del iPhone Duo ${enPais(c.cc)}: ${reposiciones(t.n)} desde el ${since}, por hora, día, ${region} y configuración.`,
        ], 158)
        : t.n > 0
          ? fitTitleW([
            `${cap(confirmadas(t.n))} del iPhone Duo en los Apple Store ${dePais(c.cc)} desde el ${since}, con comprobaciones cada ${SPEED.checkSec} segundos: por hora local, día a día, por ${region}, tienda y configuración, y cuánto duró cada una.`,
            `Horas de reposición del iPhone Duo ${enPais(c.cc)}: ${confirmadas(t.n)} desde el ${since}, por hora, día, ${region} y configuración.`,
          ], 158)
          : fitTitleW([
            `Cuándo reponen el iPhone Duo los Apple Store ${dePais(c.cc)}, según nuestras comprobaciones cada ${SPEED.checkSec} segundos desde el ${dateLabel(t.since, false)}: hora a hora, día a día, por tienda y configuración.`,
            `Cuándo reponen el iPhone Duo los Apple Store ${dePais(c.cc)}: comprobaciones cada ${SPEED.checkSec} segundos desde el ${dateLabel(t.since, false)}, hora a hora y por tienda.`,
          ], 158);
    },
    h1: (x: RestockTimesView) => x.t.unknown
      ? `El iPhone Duo ${enPais(x.c.cc)}: registro de reapariciones`
      : x.t.n > 0
        ? `¿Sigue Apple reponiendo el iPhone Duo ${enPais(x.c.cc)}? Sí: así es como, hora a hora`
        : `¿Está reponiendo Apple el iPhone Duo ${enPais(x.c.cc)}? Aún no, según nuestras comprobaciones: esto es lo que vigilamos`,
    intro: (x: RestockTimesView) => {
      const { t, one, tracked, pattern, w } = x;
      const de = dePais(x.c.cc);
      return t.unknown ? (
        <>Ahora mismo no hemos podido leer el registro de reposiciones; las tiendas {de} se siguen comprobando cada {SPEED.checkSec} segundos, y esta página vuelve con sus cifras en la próxima carga.</>
      ) : t.n > 0 ? (
        <>
          <b className="text-ink">Sí.</b> {one ? "El Apple Store" : "Los Apple Store"} {de} {one ? "ha" : "han"} repuesto el iPhone Duo <b className="text-ink">{rtN(t.n)} {t.n === 1 ? "vez" : "veces"} desde el {longDate(t.since)}</b>{tracked > 1 ? <>, en {rtN(t.days)} de los {rtN(tracked)} días</> : <> (por ahora, un solo día de seguimiento)</>}
          {pattern && <>, <b className="text-ink">el {rtPct(w.share)} {between(w.from, w.to)}</b>, hora local de la tienda</>}.
        </>
      ) : (
        <>
          <b className="text-ink">Aún no, según nuestras comprobaciones.</b> Desde el {longDate(t.since)}, ShelfSpring ha consultado {one ? "el Apple Store" : `los ${x.stores} Apple Store`} {de} cada {SPEED.checkSec} segundos y no ha confirmado ninguna reposición del iPhone Duo para recogida.
        </>
      );
    },
    hero: {
      restocks: (x: RestockTimesView) => `reapariciones anotadas a partir del ${dateLabel(x.t.since, false)}`,
      window: (x: RestockTimesView) => `${deA(x.w.from, x.w.to)}, reloj de la tienda`,
      days: "días con alguna reaparición",
      // English infers literal return types: the Spanish words go through a cast.
      now: ((one: boolean) => (one ? "tienda lo lista ahora para recogida" : "tiendas lo listan ahora para recogida")) as unknown as Dict["views"]["restockTimes"]["hero"]["now"],
      today: (x: RestockTimesView, today: DayRow) => `hoy (${dateLabel(today.date)})${x.one ? "" : `, en ${tiendas(today.stores)}`}, de momento`,
      weekday: "el día de la semana más activo, de momento",
    },
    heroPoints: (x: RestockTimesView, latest: { config: string; store: Store; at: string } | null): Point[] => [
      ...(latest ? [{ text: <>Más reciente: <b className="text-ink">{latest.config}</b>{x.one ? null : <> en <Link href={storePath(latest.store)} className="underline underline-offset-2">{apple(latest.store)}</Link></>}, {localStamp(latest.at, latest.store, L)}, reloj de la tienda</> }] : []),
      ...(x.t.peakWeekday != null ? [{ text: <>Destacan <b className="text-ink">{losDias(wd(x.t.peakWeekday))}</b></> }] : []),
      { text: <>Apple <b className="text-ink">no publica calendario</b> de reposición; esto son observaciones propias y confirmadas, refrescadas más o menos cada cinco minutos</>, no: true },
    ],
    emptyPoints: (x: RestockTimesView): Point[] => [
      { text: <>En el estante ahora: <b className="text-ink">{rtN(x.duoNow)}/{rtN(x.stores)}</b> tiendas</> },
      { text: <>Las tablas de abajo empiezan con la primera reaparición confirmada</>, step: true },
      { text: <>Para patrones por hora y día de la semana con más muestra: <Link href="/iphone-duo-restock-times" className="underline underline-offset-2">el registro de EE. UU. (en inglés)</Link></>, step: true },
    ],
    setUpAlert: "Empezar una lista de seguimiento del iPhone Duo",
    logLive: "Abrir el registro de reapariciones en directo",
    onThisPage: "Secciones",
    nav: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": "Horas",
      "day-by-day": "Calendario",
      where: `Lugares (${rn(x).other})`,
      configuration: "Configuraciones",
      "how-long": "Duración del anuncio",
      unavailable: "¿«No disponible»?",
      reddit: "Lo que dicen los foros",
      method: "Reglas de recuento",
    }),
    h2: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": `¿En qué franja del día vuelve el iPhone Duo ${enPais(x.c.cc)}?`,
      "day-by-day": `¿Qué días ha vuelto el iPhone Duo al estante ${enPais(x.c.cc)}?`,
      where: `¿En qué Apple Store reaparece más a menudo el iPhone Duo ${enPais(x.c.cc)}?`,
      configuration: `¿Qué variante del iPhone Duo reaparece más ${enPais(x.c.cc)}?`,
      "how-long": `¿Cuánto tiempo sigue listado un iPhone Duo que vuelve ${enPais(x.c.cc)}?`,
      unavailable: "¿Por qué casi todos los Apple Store muestran «No disponible»?",
      reddit: "Afirmaciones de Reddit sobre la vuelta del iPhone Duo, frente al registro",
      method: "¿Qué regla sigue ShelfSpring para contar una reaparición?",
    }),
    faq: (x: RestockTimesView): Faq[] => {
      const { t, w, pattern, sell, us, weekend, tracked } = x;
      const where = enPais(x.c.cc);
      return [
        { q: `¿A qué hora aparecen las reapariciones del iPhone Duo ${where}?`, a: t.n > 0 && pattern
          ? `${w.from < 12 ? "Sobre todo por la mañana: " : ""}el ${rtPct(w.share)} de las ${rtN(t.n)} reposiciones confirmadas desde el ${longDate(t.since)} llegó ${between(w.from, w.to)}, hora local de la tienda, y el ${rtPct(hourShare(t.byHour, 8, 12))}, entre las 8:00 y las 12:00. Apple no publica ningún calendario; este es el patrón que observa ShelfSpring, actualizado cada cinco minutos, más o menos.`
          : `Apple no publica ningún calendario, y ShelfSpring ha registrado ${confirmadas(t.n)} ${where} desde el ${longDate(t.since)}${t.days ? ` en ${dias(t.days)}` : ""}. Indicamos una hora habitual cuando hay ${PATTERN_MIN} reposiciones en ${PATTERN_MIN_DAYS} días distintos, y esta página se completa sola.` },
        { q: `¿Repone Apple el iPhone Duo los fines de semana${us ? "" : ` ${where}`}?`, a: t.n > 0
          ? `${weekend > 0 ? "Por ahora, sí" : "Aún no en nuestros datos"}: ${reposiciones(weekend)} de ${rtN(t.n)} ${weekend === 1 ? "cayó" : "cayeron"} en sábado o domingo (${rtPct(weekend / t.n)}). ${t.peakWeekday != null ? `El ${wd(t.peakWeekday)} ha sido el día con más reposiciones.` : `No indicamos qué día de la semana tiene más hasta que los datos abarcan ${WEEKDAY_MIN_SPAN} días; los nuestros cubren ${rtN(tracked)}.`}`
          : `Aún no hay datos de fin de semana ${where}; la tabla día a día de esta página se rellena a medida que se confirman reposiciones.` },
        { q: "¿A qué hora debería empezar a mirar?", a: t.n > 0 && pattern
          ? `Si miras a mano, entra en apple.com con la recogida seleccionada desde ${lasH(w.from)}, hora local: esa franja de dos horas ha concentrado el ${rtPct(w.share)} de las reposiciones. Una reposición típica ${sell ? `se agotó en ${rtN(sell.medianSec)} segundos (mediana)` : "dura más o menos un minuto"}, así que una alerta que comprueba cada ${SPEED.fastSec} segundos ([cómo funcionan las alertas, en inglés](/iphone-duo-stock-alerts)) hace lo que ninguna recarga puede.`
          : `Hasta que haya un patrón claro ${where}, deja que una alerta vigile por ti: las tiendas que elijas se comprueban cada ${SPEED.fastSec} segundos, a todas horas ([cómo funcionan las alertas, en inglés](/iphone-duo-stock-alerts)).` },
        { q: "¿Por qué todos los Apple Store dicen que el iPhone Duo no está disponible?", a: sell
          ? `Porque una reposición dura poco: el ${rtPct(sell.within2min)} de las ${rtN(sell.n)} reposiciones agotadas que hemos medido ${where} desapareció en 2 minutos, y el ${rtPct(sell.within20min)}, en 20. Ahora mismo ${rtN(x.duoNow)} de ${rtN(x.stores)} tiendas lo tienen; casi en cualquier otro momento, lo honesto en apple.com es «No disponible», incluso un día con decenas de reposiciones ([qué significa «no disponible», en inglés](/apple-store-pickup-availability-explained)).`
          : `Porque el stock para recogida aparece durante unos minutos. Ahora mismo ${rtN(x.duoNow)} de ${tiendas(x.stores)} ${where} lo ${x.duoNow === 1 ? "tiene" : "tienen"} ([qué significa «no disponible», en inglés](/apple-store-pickup-availability-explained)).` },
        { q: "¿Cómo me entero de cuándo repone el iPhone Duo mi Apple Store?", a: `Crea una alerta para la tienda, la capacidad y el color exactos: desde ese momento esa tienda se comprueba cada ${SPEED.fastSec} segundos y tu móvil recibe el aviso unos ${SPEED.alertSec} segundos después de que se confirme una reposición ([crear una alerta](${x.alert}); [cómo funciona, en inglés](/how-it-works)).` },
      ];
    },
    sources: {
      applePickup: "La explicación de la propia Apple: «Entrega y recogida»",
      newsroom: "«El iPhone Duo llega a los Apple Store de todo el mundo» · nota de prensa de Apple, 23 de octubre de 2026",
      macRumors: "«El sistema de recogida del Apple Store para el iPhone Duo vuelve a funcionar en EE. UU. y Canadá» · según MacRumors, 24 de octubre de 2026",
      reports: (tracker: string) => `${tracker}, notas sobre el iPhone Duo en la semana del lanzamiento: fuera de este registro y nunca contadas`,
    },
    ld: (x: RestockTimesView) => ({
      datasetName: `Horas de reposición del iPhone Duo en los Apple Store ${dePais(x.c.cc)}`,
      description: `Cada reposición del iPhone Duo para recogida en tienda confirmada en los Apple Store ${dePais(x.c.cc)} desde el ${x.t.since}, con tienda, configuración y hora, a partir de las comprobaciones de ShelfSpring cada ${SPEED.checkSec} segundos; resumida por hora local, día, ${rn(x).one}, tienda y configuración.`,
      spatial: `Apple Store ${dePais(x.c.cc)}`,
      measured: ["hora de la reposición (local de la tienda)", "Apple Store", "capacidad y color del iPhone Duo", "segundos hasta agotarse"],
      size: `${reposiciones(x.t.n)} en ${tiendas(x.t.stores)}`,
    }),
    crumb: "Registro de reapariciones del iPhone Duo",

    timeLead: (x: RestockTimesView) => <b>El {rtPct(x.w.share)} de las {rtN(x.t.n)} reapariciones anotadas cayó {deA(x.w.from, x.w.to)} en el reloj de la tienda; de 8:00 a 12:00, el {rtPct(hourShare(x.t.byHour, 8, 12))}.</b>,
    busiestHour: (count: number) => `hora punta: ${reapariciones(count)}`,
    morning: "de 8:00 a 12:00",
    evening: "a partir de las 17:00: la tarde también cuenta",
    night: "de 0:00 a 6:00",
    tooFew: (x: RestockTimesView) => <b>Todavía faltan días para fijar una hora: {anotadas(x.t.n)} en {dias(x.t.days)} a partir del {longDate(x.t.since)}.</b>,
    tooFewKeys: (): Point[] => [
      { text: <>Para hablar de hora habitual hacen falta <b className="text-ink">{PATTERN_MIN} reapariciones en {PATTERN_MIN_DAYS} fechas distintas</b></> },
      { text: <>Diez reapariciones en una sola tanda son un suceso, no una costumbre</>, no: true },
      { text: <>Esta sección se reescribe sola conforme se suman días</>, step: true },
    ],
    hourCaption: (x: RestockTimesView) => `Reapariciones del iPhone Duo anotadas ${enPais(x.c.cc)} según la hora local de cada tienda, ${dateLabel(x.t.since, false)} → hoy, ${rtN(x.t.n)} en total`,
    hourHead: ["Hora local de la tienda (24 h)", "Reapariciones", "% del registro"],
    morningKeys: (x: RestockTimesView): Point[] => [
      { text: <>El pico matinal <b className="text-ink">no coincide con la apertura</b>{x.us ? ": la mayoría de los Apple Store de EE. UU. abre a las 10:00" : ""}</> },
      { text: <>Las unidades para recogida se liberan <b className="text-ink">en la web</b>, antes de que la tienda abra</> },
      { text: <>Si miras a mano: <b className="text-ink">{h(x.w.from)}–{h(x.w.to)}</b>, una mañana entre semana</>, step: true },
      { text: <>Las <b className="text-ink">otras 22 horas</b>, cuando nadie recarga, que las vigile una <Link href={x.alert}>lista de seguimiento</Link></>, step: true },
    ],
    storeChartKeys: (x: RestockTimesView): Point[] => [{ text: <>Cada ficha de tienda trae su propio gráfico, en su zona horaria (<Link href={x.storesHref}>{x.us ? "directorio por estado" : `directorio ${dePais(x.c.cc)}`}</Link>): si una tienda suele reaparecer a las 8:00 cuando el resto lo hace a las 9:00, conviene saberlo</>, step: true }],

    dayLead: (x: RestockTimesView) => {
      const { t, tracked, one } = x;
      return t.n > 0 && tracked === 1 ? (
        <b>De momento hay un solo día de registro, el {dateLabel(t.daily[t.daily.length - 1]?.date ?? t.since, false)}, con {anotadas(t.n)}{one ? "" : ` en ${tiendas(t.stores)}`}.</b>
      ) : t.n > 0 ? (
        <b>Hubo al menos una reaparición confirmada {t.days === tracked ? `en cada uno de los ${rtN(tracked)} días registrados` : `en ${rtN(t.days)} de los ${rtN(tracked)} días contados a partir del ${longDate(t.since)}`}{t.peakWeekday != null ? `; el ${wd(t.peakWeekday)} es el día de la semana más activo` : ""}.</b>
      ) : (
        <b>Sin reapariciones confirmadas {enPais(x.c.cc)} a partir del {longDate(t.since)}.</b>
      );
    },
    daysTracked: "días de registro con alguna reaparición",
    busiestDay: (x: RestockTimesView, day: DayRow) => `jornada punta, ${dateLabel(day.date)}${x.one ? "" : `, en ${tiendas(day.stores)}`}`,
    busiestDayNone: "jornada punta",
    drop: (x: RestockTimesView, drop: { at: string; restocks: number }) => `tiendas con reaparición en la misma media hora, ${zoneStamp(drop.at, x.c)} (${configs(drop.restocks)}): una tanda nacional vista desde fuera`,
    weekend: (x: RestockTimesView) => `en fin de semana (${reapariciones(x.weekend)})`,
    dayCaption: (x: RestockTimesView) => `Reapariciones del iPhone Duo anotadas ${enPais(x.c.cc)}, por día del calendario${x.t.reports.length ? ". Las filas grises con el nombre de un rastreador vienen de notas públicas de otros sitios en días anteriores a la apertura de este registro; completan la cronología y nunca entran en un total" : ""}`,
    dayHead: { date: "Día", restocks: "Reapariciones", stores: "Tiendas", busiest: "Hora punta (24 h)", source: "Anotado por" },
    soFar: " · en curso",
    reportedBy: (names: string[]) => <>{names.join(" / ")}, según sus notas</>,
    dayKeys: (x: RestockTimesView, launch: string, resumed: string): Point[] => [
      { text: <><b className="text-ink">{dateLabel(launch)}</b>: lanzamiento; las primeras unidades fueron a pedidos online</> },
      { text: <><b className="text-ink">{dateLabel(resumed)}</b>: vuelven las reservas para recogida{x.us ? " (MacRumors)" : ""}</> },
      x.t.reports.length
        ? { text: <>Filas con nombre de rastreador: notas de {x.reportNames.join(" y ")} en la semana del lanzamiento, <b className="text-ink">nunca contadas</b></> }
        : { text: <>El registro de todas las tiendas {dePais(x.c.cc)} arranca el <b className="text-ink">{longDate(x.t.since)}</b></> },
      ...(x.t.n > 0 && x.t.peakWeekday == null ? [{ text: <>Día de la semana más activo: lo damos cuando el registro cubre <b className="text-ink">{WEEKDAY_MIN_SPAN} días</b> (ahora cubre {rtN(x.tracked)})</>, no: true }] : []),
      { text: <>Mira la columna <b className="text-ink">tiendas</b>: las mismas reapariciones repartidas entre más tiendas hacen un día mejor para ti</>, step: true },
    ],

    whereLead: (x: RestockTimesView, hit: { name: string; restocks: number; stores: number; storesTotal: number }[], total: number) => (
      <b>{hit[0].name} encabeza el registro: {reapariciones(hit[0].restocks)} en {rtN(hit[0].stores)} de sus {tiendas(hit[0].storesTotal)} a partir del {dateLabel(x.t.since, false)}{hit[1] ? <>; le siguen {hit[1].name} ({rtN(hit[1].restocks)})</> : null}{hit[2] ? <> y {hit[2].name} ({rtN(hit[2].restocks)})</> : null}. {rtN(hit.length)} de {rtN(total)} {rn(x).other} {hit.length === 1 ? "ha" : "han"} anotado alguna reaparición{total - hit.length > 0 ? ` y ${rtN(total - hit.length)}, todavía ninguna` : ""}.</b>
    ),
    whereNone: (x: RestockTimesView) => <b>Todavía {rn(x).f ? "ninguna" : "ningún"} {rn(x).one} {dePais(x.c.cc)} tiene una reaparición confirmada; la tabla empieza con la primera.</b>,
    regionCaption: (x: RestockTimesView) => `Reapariciones del iPhone Duo anotadas por ${rn(x).one} ${enPais(x.c.cc)}, ${dateLabel(x.t.since, false)} → hoy`,
    regionHead: (x: RestockTimesView) => [cap(rn(x).one), "Reapariciones", "Tiendas con reaparición", "La más reciente (reloj de la tienda)"],
    ofN: (a: number, b: number) => <>{rtN(a)}/{rtN(b)}</>,
    storesCaption: (x: RestockTimesView) => `Tiendas con el registro de reapariciones del iPhone Duo más largo ${enPais(x.c.cc)}, ${dateLabel(x.t.since, false)} → hoy`,
    storesHead: ["Tienda", "Reapariciones", "Días con alguna", "Hora típica", "La más reciente (reloj de la tienda)"],
    swaps: (x: RestockTimesView) => [
      { no: "La tienda con más reposiciones, esté donde esté", yes: `Dos o tres tiendas a las que puedas llegar en menos de una hora, atento desde ${x.pattern ? lasH(x.w.from) : "primera hora de la mañana"}`, why: "Una reposición a la que no puedes llegar no es una reposición; hasta la tienda con más movimiento marca «no disponible» todo el día salvo unos minutos." },
      { no: "Una sola tienda, y a esperar", yes: "Una alerta en cada una, y ve a la que avise primero", why: "La tabla de recuentos solo te dice a cuál de tus tiendas ir primero." },
    ],
    nearMe: "Tiendas cercanas que listan el Duo ahora",

    configLead: (x: RestockTimesView, top: { label: string; restocks: number }, rarest: { label: string; restocks: number } | null) => (
      <b>{top.label} va en cabeza: {rtN(top.restocks)} de {rtN(x.t.n)} reapariciones ({rtPct(top.restocks / x.t.n)}){rarest ? `; en el otro extremo, ${rarest.label}, con ${reapariciones(rarest.restocks)}` : ""}.</b>
    ),
    mostRestocked: (config: string) => `${config}: la variante que más vuelve`,
    versus: (a: string, bCount: number, b: string) => `reapariciones de ${a}, contra ${rtN(bCount)} de ${b}`,
    restocksOf: (a: string) => `reapariciones de ${a}`,
    byStorage: "según capacidad",
    byColour: "según acabado",
    configNone: (x: RestockTimesView) => <b>Ninguna configuración {enPais(x.c.cc)} suma aún una reaparición confirmada; las ocho quedan listadas para que la primera tenga dónde anotarse.</b>,
    configCaption: (x: RestockTimesView) => `Reapariciones del iPhone Duo anotadas ${enPais(x.c.cc)}, una fila por configuración, ${dateLabel(x.t.since, false)} → hoy`,
    configHead: ["Configuración", "Reapariciones", "% del registro", "La más reciente (reloj de la tienda)"],
    configKeys: (x: RestockTimesView): Point[] => [
      { text: <>Elegir la configuración importa <b className="text-ink">más que elegir la tienda</b></> },
      x.storageRatio != null
        ? { text: <>Quédate con la capacidad más repuesta: unas <b className="text-ink">{rtN(x.storageRatio)}×</b> más probabilidades que con la siguiente</> }
        : { text: <>Quédate con la capacidad más repuesta: tus probabilidades mejoran <b className="text-ink">mucho</b></> },
      { text: <>El de <b className="text-ink">2TB</b>: un móvil que se pide con envío a casa y se espera</>, no: true },
      { text: <>Precios y lo que hay en stock ahora: <Link href="/which-iphone-duo-restocks-most">¿Qué iPhone Duo se repone más? (en inglés)</Link></>, step: true },
    ],

    howLongLead: (x: RestockTimesView, sell: SelloutFacts) => <b>De las {rtN(sell.n)} reapariciones que salieron del estante {enPais(x.c.cc)}, la mitad duró {rtN(sell.medianSec)} segundos o menos; el {rtPct(sell.within2min)}, 2 minutos o menos, y el {rtPct(sell.within20min)}, 20.</b>,
    secUnit: "s",
    medianListing: "tiempo mediano en el estante",
    within2: "fuera del estante antes de 2 min",
    within20: "fuera del estante antes de 20 min",
    fastest: "la estancia más corta medida",
    howLongNone: (x: RestockTimesView) => <b>Aún hay muy pocas salidas del estante {enPais(x.c.cc)} para medir esto; las cifras aparecen a partir de diez, y el registro de EE. UU. ofrece la imagen completa.</b>,
    howLongKeys: (x: RestockTimesView): Point[] => [
      { text: <>Una ventana de dos minutos se atrapa con una <b className="text-ink">alerta</b>, no recargando apple.com</> },
      { text: <>Esta es la cifra que explica todo lo demás de esta página</> },
      { text: <>Cada reposición con los segundos que duró, por configuración y {rn(x).one}: <Link href="/iphone-duo-sell-out-times">¿Cuánto tarda en agotarse una reposición del iPhone Duo? (en inglés)</Link></>, step: true },
    ],
    measured: "Cada cifra va del vistazo que vio la configuración en el estante por primera vez al que la vio fuera, así que es un techo: la estancia real fue más corta.",

    unavailableLead: (x: RestockTimesView) => <b>Porque una reaparición es un destello, no un estado: {x.one ? "una tienda" : `${rtN(x.stores)} tiendas`} × {rtN(x.configs)} configuraciones = {rtN(x.pairs)} combinaciones posibles {enPais(x.c.cc)}, y ahora mismo {rtN(x.duoNow)} {x.duoNow === 1 ? "tienda lista" : "tiendas listan"} algún iPhone Duo.</b>,
    pairs: "combinaciones tienda × configuración posibles",
    listingNow: "con algún iPhone Duo en el estante en este momento",
    goneIn2: "de las reapariciones, fuera del estante antes de dos minutos",
    last24: "reapariciones confirmadas, últimas 24 h",
    unavailableKeys: (x: RestockTimesView, today: number): Point[] => [
      x.recent.restocks > 0
        ? { text: <>Últimas 24 horas: <b className="text-ink">{confirmadas(x.recent.restocks)}</b> en {tiendas(x.recent.stores)} {enPais(x.c.cc)}</> }
        : today > 0
          ? { text: <>Hoy: <b className="text-ink">{confirmadas(today)}</b> {enPais(x.c.cc)}</> }
          : { text: <>La tabla día a día de arriba muestra las reposiciones que sí hubo</> },
      { text: <>Cada una, visible en apple.com durante <b className="text-ink">un minuto o dos</b></> },
      { text: <>«No disponible en ninguna parte» el cuarto día, o el decimocuarto, <b className="text-ink">no</b> significa que Apple haya dejado de reponer</>, no: true },
    ],
    unavailableLinks: { explained: "Cómo leer «no disponible para recogida» (en inglés)", howToGet: "Una vía práctica para conseguir un iPhone Duo (en inglés)" },

    redditLead: (x: RestockTimesView) => <b>Lo que se repite en <a href="https://www.reddit.com/r/applestore/" target="_blank" rel="noopener nofollow">r/applestore</a> y <a href="https://www.reddit.com/r/iphone/" target="_blank" rel="noopener nofollow">r/iphone</a> suele ser sincero, se basa en una sola tienda y caduca enseguida; abajo, las cuatro afirmaciones más habituales frente a {rtN(x.t.n)} reapariciones confirmadas {enPais(x.c.cc)}.</b>,
    redditCaption: "Cuatro afirmaciones frecuentes en Reddit sobre la vuelta del iPhone Duo, contrastadas con el registro de ShelfSpring",
    redditHead: ["Lo que se dice", "Lo que muestra el registro"],
    claims: (x: RestockTimesView): { claim: string; answer: ReactNode }[] => {
      const { t, w, tracked, recent } = x;
      return [
        { claim: "«Las tiendas reponen de madrugada: entra a las 3:00.»", answer: t.n > 0 ? <>De 0:00 a 6:00 (hora local) cayó el {rtPct(hourShare(t.byHour, 0, 6))} de las reapariciones; {deA(w.from, w.to)}, el {rtPct(w.share)}.</> : "Todavía no hay reapariciones anotadas para comprobarlo." },
        { claim: "«Apple solo repone un día a la semana.»", answer: t.n > 0 ? (t.peakWeekday != null ? <>De momento el {wd(t.peakWeekday)} va en cabeza ({rtN(t.byWeekday[t.peakWeekday])} de {rtN(t.n)}), pero hubo reapariciones en {rtN(t.days)} de {rtN(tracked)} días.</> : <>Hubo reapariciones en {rtN(t.days)} de los {rtN(tracked)} días registrados{t.days === tracked ? ", sin ningún día en blanco" : ""}; el día más activo se indica cuando el registro cubre {WEEKDAY_MIN_SPAN} días.</>) : "Todavía no hay reapariciones anotadas para comprobarlo." },
        { claim: "«Llama a la tienda y pregunta cuándo llega el camión.»", answer: "Apple no publica calendario alguno; lo que aparece en apple.com son unidades para recogida liberadas en la web, y la tienda las ve a la vez que cualquiera." },
        { claim: "«Si pone no disponible, ya no volverá.»", answer: recent.restocks > 0 ? <>{cap(anotadas(recent.restocks))} en {tiendas(recent.stores)} en las últimas 24 horas lo desmienten; todas volvieron a «no disponible» en cuestión de minutos.</> : t.n > 0 ? <>{cap(anotadas(t.n))} a partir del {dateLabel(t.since, false)} lo desmienten; todas volvieron a «no disponible» en cuestión de minutos.</> : "Todavía no hay nada con lo que comprobarlo." },
      ];
    },
    redditKeys: (): Point[] => [
      { text: <>El rumor es a lo que uno recurre cuando <b className="text-ink">no hay datos</b>; esta página son los datos, y se leen gratis</> },
      { text: <>En lo que Reddit acierta: los <b className="text-ink">trucos del pago</b>, con la sesión iniciada y Apple Pay listo (<Link href="/how-to-grab-an-iphone-duo-restock">nuestra versión en 20 segundos, en inglés</Link>)</> },
    ],

    methodLead: <b>Una reaparición se anota cuando apple.com pasa a ofrecer para recogida en tienda una configuración que en esa tienda no estaba, y dos vistazos seguidos lo confirman.</b>,
    methodKeys: (x: RestockTimesView): Point[] => [
      { text: <>{x.one ? "El Apple Store" : "Todos los Apple Store"} {dePais(x.c.cc)}, cada <b className="text-ink">{SPEED.checkSec} segundos</b>; las tiendas con alertas, cada <b className="text-ink">{SPEED.fastSec}</b></> },
      { text: <>Otros rastreadores publican intervalos <b className="text-ink">{OTHER}</b>; solo comparamos cifras publicadas</> },
      { text: <>Un primer «disponible» se vuelve a consultar <b className="text-ink">aproximadamente un segundo después</b> antes de contar</> },
      { text: <>Una disponibilidad que desaparece se confirma en la <b className="text-ink">siguiente ronda</b></> },
      { text: <>La primera vez que vemos una tienda, o una petición fallida o caducada: <b className="text-ink">nunca</b> es una reposición ni un «sin stock»</>, no: true },
      { text: <>Horas y fechas en la <b className="text-ink">hora local</b> de cada tienda; «oleadas» = la misma media hora en distintas zonas horarias</> },
      { text: <>Avisos de otros rastreadores{x.t.reports.length ? ` (${x.reportNames.join(", ")})` : ""}: en sus propias filas marcadas, <b className="text-ink">nunca en un total</b></> },
      { text: <>Se actualiza cada cinco minutos, más o menos; <Link href={x.logHref}>el registro de reposiciones</Link> en sí es en directo</>, step: true },
    ],
    quote: "Puedes citar estas cifras con un enlace a esta página; ShelfSpring es independiente, no tiene relación con Apple y lee la misma disponibilidad para recogida que cualquiera puede ver en apple.com, solo que muchísimo más a menudo.",
    alertIn: (x: RestockTimesView) => <>Empezar una lista de seguimiento del iPhone Duo{x.one ? "" : ` ${enPais(x.c.cc)}`}</>,

    related: "Más desde el mismo registro",
    sameData: "Preguntas que responde este registro",
    questions: {
      sellOut: "¿Cuánto tiempo sigue listada una reaparición?",
      alerts: "Enterarse el primero de una reaparición",
      howToGet: "Una vía práctica para conseguir uno",
      whichConfig: "Qué configuración vuelve más a menudo",
      nearMe: "Qué tiendas cercanas lo listan ahora",
      unavailable: "Cómo leer «no disponible»",
    },
    otherCountries: ((us: boolean) => (us ? "Este estudio en otros países" : "Los registros de otros países")) as unknown as Dict["views"]["restockTimes"]["otherCountries"],
    faqTitle: "Preguntas de campo",
  },
};

export const views: Dict["views"] = withShelfViews("es", baseViews);
