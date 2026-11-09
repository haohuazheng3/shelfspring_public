import { withShelfViews } from "@/lib/seo/localizedCopy";
/**
 * العربية: views — صفحات «الطراز × المكان»، وسجل التوفر، والخريطة المباشرة، وصفحة أوقات توفر iPhone Duo، وفهرس المتاجر.
 * `c: Country` بيانات إنجليزية: اسم الدولة من util.country، وكلمة المنطقة من util.regionNoun. السلاسل `name` `place` `region`
 * `city` `store` `config` تصل بالعربية؛ أما كائنات Store / Place فإنجليزية فتُسمّى عبر places. العبارات المسلّمة للوحدات
 * (inPlace / inCountry) تحمل حرف الجر («في دبي»، «في الإمارات»). لا تُترجم أسماء الطرازات والسعات وShelfSpring والروابط.
 * فترات الفحص 15 ثانية و5 ثوانٍ فقط؛ ولا ذكر للاسترداد.
 */
import type { ReactNode } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import type { Point } from "@/components/ui/Viz";
import type { Faq } from "@/lib/content/types";
import { catalogFor, modelByKey, storePath, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type Country, type CountryCode } from "@/lib/apple/countries";
import { faq as placeFaq, peakOf, type FaqContext, type FaqItem } from "@/lib/seo/enrich";
import type { Place, Product } from "@/lib/seo/products";
import type { StoreLine } from "@/lib/seo/productData";
import type { PlaceStats, RestockStats } from "@/lib/stock/queries";
import { hourShare, type DayRow, type SelloutFacts } from "@/lib/content/restockTimes";
import { PATTERN_MIN, PATTERN_MIN_DAYS, WEEKDAY_MIN_SPAN, localStamp } from "@/lib/content/siteFacts";
import { OTHER_TRACKERS, SPEED } from "@/lib/plans";
import { list, stamp, weekdays, price as priceIn, distance, fitTitleW } from "@/lib/i18n/format";
import { appleStoreLabel, cityLabel, colorLabel, regionLabel, storeLabel } from "@/lib/i18n/places";
import type { Dict } from "../en";
import type { RestockTimesMeta, RestockTimesView } from "../en/views";
import { content } from "./content";
import {
  APPLE_STORES, CONFIGS, DAYS, L, N, RETURNS, RETURNS_G, SECONDS, STORES, STORES_G, TIMES, allWord, apple, count, country, durAr, inCountry,
  regionNoun, regionsCount, taxNoteAr, theStores, theStoresG,
} from "./util";

const cn = (c: Pick<Country, "cc">) => country(c.cc);
const inC = (c: Pick<Country, "cc">) => inCountry(c.cc);
const listAr = (items: string[], max = 6) => list(L, items, max, (n) => content.listMore(N(n)));
const secs = (n: number) => count(n, SECONDS);
/** "من 8 ثوانٍ إلى 15 دقيقة": what other trackers publish about themselves. */
const others = (() => {
  const m = OTHER_TRACKERS.match(/^(\d+) seconds? to (\d+) minutes?$/);
  return m ? `من ${count(Number(m[1]), SECONDS)} إلى ${N(Number(m[2]))} دقيقة` : OTHER_TRACKERS;
})();

/* ---------------------------------------------------------------- product × place names */

const ccOf = (p: { country?: CountryCode }) => p.country ?? "us";
/** "iPhone Duo 512GB سماء الليل". */
function productName(p: Product, short = false): string {
  const m = modelByKey(p.model)!;
  return `${short ? m.short : m.name}${p.storage ? ` ${p.storage}` : ""}${p.color ? ` ${colorLabel(p.color, L)}` : ""}`;
}
/** " (العين)" when the store's name does not already say its city. */
const cityNote = (s: Store) => { const city = cityLabel(s.country ?? "us", s.city, L); return appleStoreLabel(s, L).includes(city) ? "" : ` (${city})`; };
/** The place in Arabic: the country, an emirate, a city, «Apple دبي مول». */
function placeNameAr(place: Place): string {
  const cc = ccOf(place);
  if (place.level === "country") return country(cc);
  if (place.level === "state") return regionLabel(cc, place.state!, L);
  if (place.level === "city") return cityLabel(cc, place.city!, L);
  return appleStoreLabel(place.store!, L);
}

function productTitle(product: Product, place: Place, inStock: number): string {
  const n = place.stores.length;
  const name = productName(product), short = productName(product, true);
  if (place.level === "country") {
    const w = inCountry(ccOf(place));
    return fitTitleW([...(inStock > 0 ? [`${name} ${w}: متوفر الآن في ${N(inStock)} من متاجر Apple`] : []), `مخزون ${name} للاستلام ${w} مباشرة`, `مخزون ${short} للاستلام ${w}`, `مخزون ${short} للاستلام`]);
  }
  if (place.level === "store") {
    const s = place.store!;
    const a = appleStoreLabel(s, L);
    const now = inStock > 0 ? "متوفر الآن" : "مخزون الاستلام";
    return fitTitleW([`${name} في ${a}: ${now}`, `${short} في ${a}${cityNote(s)}`, `${short} في ${a}`, `${short} في ${storeLabel(s, L)}`]);
  }
  const w = placeNameAr(place);
  return fitTitleW([`مخزون ${name} في ${w}: ${N(inStock)} من ${count(n, STORES_G)}`, `${name} في ${w}: مخزون الاستلام`, `مخزون ${short} في ${w}`, `${short} في ${w}`]);
}

function productDescription(product: Product, place: Place, inStock: number, stats: PlaceStats): string {
  const name = productName(product);
  const week = stats.week === 0 ? "لا توفر هذا الأسبوع" : `توفر ${count(stats.week, TIMES)} هذا الأسبوع`;
  if (place.level === "store") {
    const s = place.store!;
    const a = appleStoreLabel(s, L);
    const now = inStock > 0 ? "متوفر الآن" : "غير متوفر الآن";
    return fitTitleW([
      `مخزون ${name} للاستلام في ${a}${cityNote(s)}: ${now}، و${week}. الحالة المباشرة وأوقات التوفر والتنبيهات.`,
      `${name} في ${a}: ${now}، و${week}. الحالة المباشرة والتنبيهات.`,
    ], 155);
  }
  const w = placeNameAr(place);
  const n = place.stores.length;
  const avail = inStock === 0 ? "غير متوفر الآن في أيٍّ من" : `متوفر في ${N(inStock)} من`;
  return fitTitleW([
    `مخزون ${name} للاستلام في ${w}: ${avail} ${count(n, STORES_G)}، و${week}. مخزون مباشر لكل متجر وأوقات التوفر والتنبيهات.`,
    `${name} في ${w}: ${avail} ${count(n, STORES_G)}، و${week}. مخزون مباشر لكل متجر والتنبيهات.`,
  ], 155);
}

function productFaq(product: Product, place: Place, lines: StoreLine[], stats: PlaceStats, clock: RestockStats, nearest: { name: string; city: string; distance: number } | null): FaqItem[] {
  const out: FaqItem[] = [];
  const name = productName(product);
  const at = placeNameAr(place);
  const cc = ccOf(place);
  const near = nearest ? `${apple(nearest.name)} في ${nearest.city} (${distance(L, cc, nearest.distance)})` : null;
  const inStock = lines.filter((l) => l.available.length > 0);
  if (place.level === "store") {
    const l = lines[0];
    out.push({
      q: `هل ${name} على الرف في ${at}؟`,
      a: l && l.available.length > 0
        ? product.parts.length > 1 ? `في آخر معاينة، نعم: ${listAr(l.available.map((i) => `${i.storage} ${colorLabel(i.color, L)}`), 4)}.` : "في آخر معاينة، نعم."
        : `ليس في آخر معاينة${near ? `؛ أقرب متجر يضعه على الرف: ${near}` : ""}.`,
    });
  } else {
    out.push({
      q: `في أي متاجر Apple في ${at} تجد ${name} على الرف؟`,
      a: inStock.length === 0
        ? `في لا متجر عند آخر معاينة${near ? `؛ أقرب بديل يعرضه: ${near}` : ""}.`
        : `آخر معاينة وجدته في ${count(inStock.length, STORES_G)}: ${listAr(inStock.map((x) => appleStoreLabel(x.store, L)), 4)}.`,
    });
  }
  const peak = peakOf(clock, L);
  out.push({
    q: `كم مرة يعود ${name} إلى الرف في ${at}؟`,
    a: stats.month === 0 ? `سجل ${count(stats.days, DAYS)} لا يحمل أي عودة.` : `${count(stats.month, RETURNS)} في سجل ${count(stats.days, DAYS)}، منها ${N(stats.week)} هذا الأسبوع${peak ? `، وتتجمع قرب الساعة ${peak.hour} بتوقيت المتجر` : ""}.`,
  });
  if (stats.medianMs != null) out.push({ q: `كم يبقى على الرف في ${at} بعد عودته؟`, a: `وسيط المكوث نحو ${durAr(stats.medianMs)}، ثم يغادر الرف مجددًا.` });
  return out;
}

function priceLabelAr(product: Product): string {
  const cc = ccOf(product);
  const prices = catalogFor(product.model, cc).filter((c) => product.parts.includes(c.partNumber)).map((c) => c.price);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  const f = (v: number) => priceIn(L, COUNTRIES[cc], v);
  return lo === hi ? f(lo) : `${f(lo)} – ${f(hi)}`;
}

/* ---------------------------------------------------------------- restock-times formats */

const rtPct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
const df = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("ar-AE-u-nu-latn", { timeZone: "UTC", ...o });
/** "الثلاثاء، 3 نوفمبر" / "3 نوفمبر". */
const dateLabel = (ymd: string, weekday = true) => df({ month: "long", day: "numeric", ...(weekday ? { weekday: "long" as const } : {}) }).format(new Date(`${ymd}T12:00:00Z`));
const longDate = (ymd: string) => df({ month: "long", day: "numeric", year: "numeric" }).format(new Date(`${ymd}T12:00:00Z`));
const zoneStamp = (iso: string, c: Country) => (c.cc === "ae" ? `${stamp(L, iso, c.timeZone)} بتوقيت الإمارات` : stamp(L, iso, c.timeZone, true));
/** "9:00". */
const hourLabel = (h: number) => `${h % 24}:00`;
/** "9:00–11:00". */
const rangeLabel = (from: number, to: number) => `${hourLabel(from)}–${hourLabel(to)}`;
/** "بين 9:00 و11:00" inside a sentence. */
const between = (from: number, to: number) => `بين ${hourLabel(from)} و${hourLabel(to)}`;
const weekdayName = (d: number) => weekdays(L)[d];
const storeAr = (s: Store) => appleStoreLabel(s, L);
const rtRegion = (x: { us: boolean; c: Country }) => (x.us ? "ولاية" : regionNoun(x.c));
const zero = "لا قيد في السجل نختبر به الادعاء بعد.";

/** The peak handed over in English ("10 AM", "Tuesday") → Arabic ("10:00", "الثلاثاء"). */
function peakAr(p: FaqContext["peak"]): FaqContext["peak"] {
  if (!p) return p;
  const m = p.hour.match(/^(\d{1,2}) (AM|PM)$/);
  const hour = m ? hourLabel((Number(m[1]) % 12) + (m[2] === "PM" ? 12 : 0)) : p.hour === "noon" ? "12:00" : p.hour === "midnight" ? "0:00" : p.hour;
  const en = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(p.day ?? "");
  return { ...p, hour, day: en >= 0 ? weekdayName(en) : p.day };
}

const baseViews: Dict["views"] = {
  common: {
    inCountry: (c: Country) => inC(c),
    liveMap: "خريطة الاستلام",
    restockLog: "سجل العودات",
    alertMe: "أضِف إلى قائمة المراقبة",
    lastDays: (days: number) => <>تقويم العودات · {count(days, DAYS)}</>,
    since: "2 نوفمبر 2026",
    sourcesWhere: (n: number, c: Country) => (n === 1 ? `متجر Apple الوحيد المرصود ${inC(c)}` : `${count(n, APPLE_STORES)} تحت الرصد ${inC(c)}`),
    checker: (c: Country) => `دفتر الاستلام ${inC(c)}`,
    appleStoresIn: (c: Country) => `متاجر Apple ${inC(c)}`,
    storesWithIt: "متاجر تعرضه",
    more: "أيضًا في السجل",
  },

  /* ---------------------------------------------------------------- /stock/{product}/{place…} */
  product: {
    title: productTitle,
    description: productDescription,
    faq: productFaq,
    priceLabel: priceLabelAr,
    inPlace: (name: string) => `في ${name}`,
    h1Country: (model: string, c: Country) => `مخزون ${model} للاستلام ${inC(c)}`,
    h1Place: (model: string, where: string) => `${model} ${where}`,
    inStockNow: "على الرف الآن",
    yes: "معروض",
    no: "غير معروض",
    pickup: "جواب الاستلام",
    configurations: "تكوينات معروضة",
    ofStores: (n: number) => `عبر ${count(n, STORES_G)} تحت الرصد`,
    restocks24h: "عودات، آخر يوم",
    restocksHint: (week: number, month: number, days: number) => `7 أيام: ${N(week)} · ${count(days, DAYS)}: ${N(month)}`,
    sellOuts: (days: number) => `غادر الرف مجددًا · ${count(days, DAYS)}`,
    stays: (ms: number) => (ms < 60_000 ? `وسيط المكوث ${durAr(ms)}` : `وسيط المكوث ≈${durAr(ms)}`),
    noPairs: "لا مكوث مكتمل بعد",
    lastRestock: "أحدث عودة",
    noneYet: "لم يظهر بعد",
    thisConfig: "هذا التكوين بعينه",
    inDays: (days: number) => `لا شيء خلال ${count(days, DAYS)}`,
    notInStockNow: "خارج الرف الآن",
    configsInStock: (n: number, of: number) => <span><b className="text-ink">{N(n)}</b>/{N(of)} من التكوينات على الرف</span>,
    inStockAt: (n: number, of: number) => <span>على الرف في <b className="text-ink">{N(n)}</b>/{N(of)} {of === 1 ? "متجر" : "من المتاجر"}</span>,
    checked: (live: ReactNode, price: string, tax: string) => <>{price}{tax} · آخر رصد {live}</>,
    taxNote: (c: Country) => taxNoteAr(c),
    beforeTax: "دون الضريبة",
    buyOnApple: "اطلب من apple.com",
    allStoresIn: (c: Country) => `دليل المتاجر ${inC(c)}`,
    everyIphoneHere: "أجهزة iPhone الثلاثة هنا",
    everyIphone: (where: string) => `أجهزة iPhone الثلاثة ${where}`,
    panel: (model: string, where: string | null) => `قائمة مراقبة ${model}${where ? ` ${where}` : ""}: التكوينات أولًا، ثم المتاجر التي تصل إليها`,
    unitConfigs: "التكوينات",
    unitStores: "المتاجر",
    otherConfigsHere: "إصدارات أخرى في هذا المتجر",
    byStorageColor: "السعة أولًا، ثم الطلاء",
    nearestStores: "أقرب المتاجر إليك",
    closest: (link: ReactNode, dist: string) => <>أقرب متجر يعرضه: {link} ({dist})</>,
    storeCity: (store: string, city: string) => <>{city} · {store}</>,
    mostRecentlyInStock: "أين شوهد آخر مرة",
    storesWithItNow: "متاجر تعرضه اليوم",
    storesIn: (where: string) => `متاجر ${where}`,
    colStatus: "الرف",
    colConfigs: "تكوينات معروضة",
    noStoreHasIt: "عند آخر رصد لا يعرضه أي متجر.",
    noStoreHereHasIt: "عند آخر رصد لا يعرضه أيٌّ من هذه المتاجر.",
    moreStores: (n: number) => <>متاجر أخرى تعرضه: {N(n)} · افتح دليل المتاجر الكامل ↗</>,
    byRegion: (c: Country) => `مقسّمة حسب ال${regionNoun(c)}`,
    byCity: "مقسّمة حسب المدينة",
    nearbyStores: "متاجر احتياطية",
    latestChanges: "أحدث القيود في السجل",
    nothingLogged: "السجل فارغ حتى الآن.",
    whenRestocks: "ساعات العودة على مدار اليوم",
    howFast: "كم بقيت العروض على الرف",
    restocksByConfig: "العودات لكل تكوين",
    faqTitleCountry: (model: string, c: Country) => `أسئلة من الميدان · ${model} ${inC(c)}`,
    faqTitle: (model: string, where: string) => `أسئلة من الميدان · ${model} ${where}`,
    buySource: (model: string, c: Country) => `apple.com ${cn(c)}: صفحة طلب ${model} (بالإنجليزية)`,
    nearby: "أماكن حوله",
    otherRegions: (c: Country) => `المزيد من ال${regionNoun(c, true)}`,
    elsewhereIn: (region: string) => `المزيد من ${region}`,
    everyAppleStoreIn: (c: Country) => `دليل المتاجر الكامل ${inC(c)}`,
    across: (model: string, c: Country) => `${model} · ${cn(c)} كلها`,
    itemList: (model: string, where: string) => `${model} ${where}`,
    nearLead: (c: Country, model: string, inStock: number, n: number, have: { store: string; city: string; configs: number }[]) =>
      inStock === 0
        ? `${model} خارج الرف في كل متاجر Apple ${inC(c)} الآن، فيصبح «الأقرب مني» سؤالًا عن أول متجر يعود إليه. ضع المتاجر التي تصل إليها في قائمة مراقبتك، وسيصلك الإشعار بعد أن يعرضه أحدها ونرصد ذلك.`
        : `${model} على الرف في ${N(inStock)} من ${count(n, STORES_G)} الآن: ${listAr(have.slice(0, 5).map((l) => `${l.city} · ${l.store} (${count(l.configs, CONFIGS)})`), 5)}.`,
    nearHead: (c: Country) => [`ال${regionNoun(c)}`, "متاجر تعرضه الآن"],
    nearCaption: (c: Country, model: string) => `${model} على رفوف الاستلام حسب ال${regionNoun(c)}، عند آخر رصد`,
    nearMe: (_c: Country, model: string, alert: string) => `لترتيب كل المتاجر من موقعك، افتح إعداد المراقبة في هذه الصفحة واستخدم «حدّد موقعي»: المسافات تقدير بالطريق بالكيلومتر، ولكل متجر رابط لطريق الوصول. [راقِب ${model}](${alert}).`,
    modelFaq: (c: Country, model: string, low: number, high: number, inStock: number): { price: FaqItem; reserve: FaqItem } => {
      const money = (v: number) => priceIn(L, c, v);
      return {
        price: { q: `ما كلفة ${model} ${inC(c)}؟`, a: `${money(low)} لأصغر سعة وحتى ${money(high)} لأكبرها، كما يسعّرها apple.com (${taxNoteAr(c)}).` },
        reserve: { q: `هل يمكن حجز ${model} للاستلام ${inC(c)}؟`, a: `بالطلب فقط. يصبح التكوين لك حين تكمل الدفع على apple.com${c.cc === "ae" ? " (صفحة الشراء بالإنجليزية)" : ""} مع اختيار الاستلام من المتجر، ثم تحفظه Apple للموعد الذي اخترته.${inStock === 0 ? " وعند آخر رصد لا يعرضه أي متجر، فبند في قائمة المراقبة هو ما يخبرك أولًا." : ""}` },
      };
    },
  },

  /* ---------------------------------------------------------------- /restocks */
  restocks: {
    metaTitle: (c: Country, n: number) => `سجل توفر iPhone ${inC(c)}: ${n === 1 ? "متجر Apple" : theStores(n)} مباشرة`,
    metaDescription: (c: Country, n: number) => `كل حالة توفر لأجهزة iPhone Duo و18 Pro وPro Max للاستلام من ${n === 1 ? "متجر Apple" : "متاجر Apple"} ${inC(c)}، بالوقت الدقيق والخيار والخريطة.`,
    h1: (c: Country) => `سجل التوفر ${inC(c)}`,
    summary: (day: number, week: number, model?: string, region?: string) => <>آخر يوم: {day === 0 ? "لا عودات" : count(day, RETURNS)}؛ آخر سبعة أيام: {N(week)}{model ? ` · ${model}` : ""}{region ? ` · ${region}` : ""}. الأوقات تتبع ساعة جهازك.</>,
    allModels: "الطرازات كلها",
    restocks: "العودات فقط",
    withSoldOut: "العودات والخروج من الرف",
    regionLabel: (c: Country) => `ال${regionNoun(c)}`,
    allRegions: (c: Country) => `أي ${regionNoun(c)}`,
    filter: "طبّق",
    page: (k: number) => <>الورقة {N(k)}</>,
    newer: "→ الأحدث عهدًا",
    older: "الأقدم عهدًا ←",
    getAlerts: "ابدأ قائمة مراقبة",
    byPlace: "سجلات العودة حسب المكان",
    byRegion: (c: Country) => `مقسّمة حسب ال${regionNoun(c)}`,
    datasetName: (c: Country) => `سجل توفر iPhone للاستلام في متاجر Apple ${inC(c)}`,
    datasetDescription: (c: Country) => `كل توفر ونفاد مؤكد لأجهزة iPhone Duo وiPhone 18 Pro وiPhone 18 Pro Max للاستلام من ${c.cc === "us" ? "جميع متاجر Apple الـ269 في الولايات المتحدة" : `متاجر Apple ${inC(c)}`}، مع المتجر والخيار الدقيق والوقت. لا يُسجَّل التوفر إلا بعد إجابتين متطابقتين من apple.com، بفحص كل 15 ثانية (وكل 5 ثوانٍ للمتاجر التي عليها تنبيهات).`,
    datasetMeasured: ["متجر Apple", "طراز iPhone وسعته ولونه", "وقت التوفر", "وقت النفاد"],
  },

  /* ---------------------------------------------------------------- /map */
  map: {
    metaTitle: (c: Country, n: number) => `خريطة مخزون iPhone Duo للاستلام: ${n === 1 ? "متجر Apple" : "كل متاجر Apple"} ${inC(c)} مباشرة`,
    metaDescription: (c: Country, n: number) => `خريطة مباشرة ل${n === 1 ? "متجر Apple" : theStoresG(n)} ${inC(c)} مع مخزون iPhone Duo و18 Pro وPro Max للاستلام الآن، حسب السعة واللون.`,
    country: (c: Country) => ({ name: cn(c), inName: inC(c), regionNoun: c.regionNoun, regionNounPlural: c.regionNounPlural }),
    everyStore: "دليل المتاجر",
    storeCity: (store: string, city: string) => `${city} · ${store}`,
  },

  /* ---------------------------------------------------------------- /{cc}/stores */
  storesIndex: {
    metaDescription: (c: Country, n: number, regions: number, cities: number, duo: number, max: number) => {
      const by = c.regionNoun && regions > 1 ? ` حسب ال${regionNoun(c)} والمدينة` : cities > 1 ? " حسب المدينة" : "";
      return `${theStores(n)} ${inC(c)}${by}، مع مخزون iPhone Duo و18 Pro وPro Max للاستلام مباشرة: Duo متوفر الآن في ${N(duo)}، وPro Max في ${N(max)}.`;
    },
    countAnswer: (n: number, spread: string, top: { name: string; count: number }[]) => `${count(n, APPLE_STORES)} في الدليل، ${spread}${top.length ? `. أكبر تجمّع: ${top[0].name}، ${N(top[0].count)}${top[1] ? `؛ يليه ${top[1].name}، ${N(top[1].count)}` : ""}` : ""}.`,
    howMany: (c: Country) => <>عدد متاجر Apple {inC(c)}</>,
    duoNow: (c: Country, n: number, have: Store[]): FaqItem => ({
      q: `أين iPhone Duo على الرف ${inC(c)} الآن؟`,
      a: have.length === 0 ? `في لا مكان عند آخر رصد، عبر ${allWord(n)} كلها. تُظهر هذه الصفحة والخريطة أول متجر يعرضه، وقائمة المراقبة تخبرك قبلهما.` : `في ${N(have.length)} من ${count(n, STORES_G)} عند آخر رصد: ${listAr(have.map(storeAr), 6)}.`,
    }),
    faq: (ctx: FaqContext) => placeFaq({ ...ctx, peak: peakAr(ctx.peak), omit: [...(ctx.omit ?? []), "count", "stock", "lasts"] }, L),
    duoBlock: (alert: string) => `أسرع طريقة للحصول عليه هي تنبيه على المتاجر التي يمكنك الوصول إليها: [فعّل تنبيه iPhone Duo](${alert}). كل متجر × خيار محدد = تنبيه واحد، ويصل الإشعار بعد ثوانٍ من عرض المتجر له.`,
    intro: (c: Country, n: number, spread: string, now: { duo: number; max: number; pro: number }, tax: string) => `يوجد ${inC(c)} **${count(n, APPLE_STORES)}**، ${spread}. الآن iPhone Duo متوفر للاستلام في **${N(now.duo)}** ${n === 2 ? "منهما" : "منها"}، وiPhone 18 Pro Max في **${N(now.max)}**، و18 Pro في **${N(now.pro)}**. ${tax}`,
    crumb: "دليل المتاجر",
    panel: (c: Country) => `قائمة مراقبتك ${inC(c)}: الهواتف أولًا، ثم المتاجر التي تصلها فعلًا فقط`,
    matrixLabel: "الرف متجرًا متجرًا",
    matrixH2: (c: Country) => <>أعداد الرف لكل طراز {inC(c)}</>,
    matrixHint: "المعروض عند آخر رصد / المتابَع، لكل طراز.",
    topCaption: (c: Country) => <>ال{regionNoun(c, true)} مرتّبة بعدد متاجر Apple فيها (من قائمة المتاجر كما يرصدها السجل)</>,
    regionHead: (c: Country) => `ال${regionNoun(c)}`,
    colStores: "عدد متاجر Apple",
    colCities: "عدد المدن",
    locationsBy: (c: Country) => `دليل المتاجر، ${regionNoun(c)} تلو ${regionNoun(c)}`,
    locationsIn: (c: Country) => `دليل المتاجر ${inC(c)}`,
    storeCount: (n: number) => <>{count(n, APPLE_STORES)}</>,
    storeCountAll: (n: number) => <>{count(n, APPLE_STORES)}</>,
    whenRestock: (c: Country) => <>توقيت العودات {inC(c)}</>,
    howFast: (c: Country) => <>كم بقيت العروض على الرف {inC(c)}</>,
    faqTitle: (c: Country) => `أسئلة من الميدان عن المتاجر ${inC(c)}`,
    getApp: "ثبّت تطبيق الويب",
    howItWorks: "ملاحظات المنهج (بالإنجليزية)",
    pricing: "الخطط والأسعار",
  },

  /* ---------------------------------------------------------------- /iphone-duo-restock-times */
  restockTimes: {
    fmt: {
      n: N,
      pct: rtPct,
      date: dateLabel,
      longDate,
      zoneStamp,
      local: (iso: string, store: Parameters<typeof localStamp>[1]) => localStamp(iso, store, L),
      hour: hourLabel,
      range: rangeLabel,
      weekday: weekdayName,
      store: storeAr,
      storeWithPlace: (s: Store) => `${cityLabel(s.country ?? "us", s.city, L)} · ${storeAr(s)}`,
    },
    title: (c: Country) => `متى يتوفر iPhone Duo من جديد ${inC(c)}؟`,
    metaDescription: (x: RestockTimesMeta) => {
      const { c, t, w, pattern } = x;
      const region = c.cc === "us" ? "الولاية" : c.regionNoun ? `ال${regionNoun(c)}` : "المتجر";
      const since = dateLabel(t.since, false);
      return t.n > 0 && pattern
        ? fitTitleW([
          `تأكد توفر iPhone Duo ${count(t.n, TIMES)} في متاجر Apple ${inC(c)} منذ ${since}: ${rtPct(w.share)} منها ${between(w.from, w.to)} بتوقيت المتجر${t.sellout ? `، و${rtPct(t.sellout.within2min)} نفد خلال دقيقتين` : ""}. جداول حسب الساعة واليوم و${region} والمتجر والخيار.`,
          `تأكد توفر iPhone Duo ${count(t.n, TIMES)} في متاجر Apple ${inC(c)} منذ ${since}: ${rtPct(w.share)} منها ${between(w.from, w.to)} بتوقيت المتجر. جداول حسب الساعة واليوم و${region} والخيار.`,
          `أوقات توفر iPhone Duo ${inC(c)}: ${count(t.n, TIMES)} منذ ${since}، حسب الساعة واليوم و${region} والخيار.`,
        ], 158)
        : t.n > 0
          ? fitTitleW([
            `تأكد توفر iPhone Duo ${count(t.n, TIMES)} في متاجر Apple ${inC(c)} منذ ${since}، بفحص كل ${secs(SPEED.checkSec)}: حسب الساعة المحلية، يومًا بيوم، وحسب ${region} والمتجر والخيار، وكم دام كل توفر.`,
            `أوقات توفر iPhone Duo ${inC(c)}: تأكد التوفر ${count(t.n, TIMES)} منذ ${since}، حسب الساعة واليوم و${region} والخيار.`,
          ], 158)
          : `متى تعيد متاجر Apple ${inC(c)} توفير iPhone Duo، من فحوص ShelfSpring كل ${secs(SPEED.checkSec)} منذ ${longDate(t.since)}: ساعةً بساعة، ويومًا بيوم، وحسب المتجر والخيار.`;
    },
    h1: (x: RestockTimesView) => x.t.unknown
      ? `متى يتوفر iPhone Duo من جديد ${inC(x.c)}؟`
      : x.t.n > 0
        ? `هل ما زالت Apple توفّر iPhone Duo ${inC(x.c)}؟ نعم — وهذه أوقاته ساعةً بساعة`
        : `هل بدأت Apple توفير iPhone Duo ${inC(x.c)}؟ ليس بعد حسب فحوصنا — وهذا ما نراقبه`,
    intro: (x: RestockTimesView) => {
      const { t, one, tracked, pattern, w } = x;
      const where = inC(x.c);
      return t.unknown ? (
        <>تعذّرت قراءة سجل التوفر الآن؛ ما زلنا نفحص المتاجر {where} كل {secs(SPEED.checkSec)}، وستعود هذه الصفحة بأرقامها عند التحميل التالي.</>
      ) : t.n > 0 ? (
        <>
          <b className="text-ink">نعم.</b> توفّر iPhone Duo في {one ? "متجر Apple" : "متاجر Apple"} {where} <b className="text-ink">{count(t.n, TIMES)} منذ {longDate(t.since)}</b>{tracked > 1 ? <>، في {N(t.days)} من الأيام الـ{N(tracked)} التي تتبعناها</> : <> (يوم واحد من التتبع حتى الآن)</>}
          {pattern && <>، و<b className="text-ink">{rtPct(w.share)} منها {between(w.from, w.to)}</b> على ساعة المتجر</>}.
        </>
      ) : (
        <>
          <b className="text-ink">ليس بعد، حسب فحوصنا.</b> منذ {longDate(t.since)} يسأل ShelfSpring {one ? "متجر Apple" : theStoresG(x.stores)} {where} كل {secs(SPEED.checkSec)}، ولم يتأكد بعد أي توفر لـiPhone Duo للاستلام.
        </>
      );
    },
    hero: {
      restocks: (x: RestockTimesView) => `عودات مدوّنة منذ ${dateLabel(x.t.since, false)}`,
      window: (x: RestockTimesView) => `${between(x.w.from, x.w.to)}، على ساعة المتجر`,
      days: "أيام سُجّلت فيها عودة واحدة على الأقل",
      now: (one: boolean): string => (one ? "متجر يضعه على الرف الآن" : "متاجر تضعه على الرف الآن"),
      today: (x: RestockTimesView, today: DayRow) => `حصيلة اليوم حتى الآن (${dateLabel(today.date)})${x.one ? "" : `، عبر ${count(today.stores, STORES_G)}`}`,
      weekday: "اليوم الذي يتصدّر الأسبوع حتى الآن",
    },
    heroPoints: (x: RestockTimesView, latest: { config: string; store: Store; at: string } | null): Point[] => [
      ...(latest ? [{ text: <>{localStamp(latest.at, latest.store, L)} على ساعة المتجر: <b className="text-ink">{latest.config}</b>{x.one ? null : <> في <Link href={storePath(latest.store)} className="underline underline-offset-2">{storeAr(latest.store)}</Link></>}، آخر ما دُوِّن</> }] : []),
      ...(x.t.peakWeekday != null ? [{ text: <>اليوم الذي يتصدّر: <b className="text-ink">{weekdayName(x.t.peakWeekday)}</b></> }] : []),
      { text: <><b className="text-ink">لا جدول منشورًا</b> من Apple؛ ما تراه هنا قيود مؤكدة في السجل، تُحدَّث كل خمس دقائق تقريبًا</>, no: true },
    ],
    emptyPoints: (x: RestockTimesView): Point[] => [
      { text: <>على الرف الآن: <b className="text-ink">{N(x.duoNow)} من {count(x.stores, STORES_G)}</b></> },
      { text: <>أول عودة مؤكدة تفتح الجداول أدناه</>, step: true },
      { text: <>أكبر سجل لأنماط الساعة واليوم موجود في <Link href="/iphone-duo-restock-times" className="underline underline-offset-2">الصفحة الأمريكية (بالإنجليزية)</Link></>, step: true },
    ],
    setUpAlert: "ابدأ قائمة مراقبة لـ iPhone Duo",
    logLive: "افتح سجل العودات الحي",
    onThisPage: "الأقسام",
    nav: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": "الساعات",
      "day-by-day": "التقويم",
      where: `الأماكن (${rtRegion(x)})`,
      configuration: "التكوينات",
      "how-long": "مدة العرض",
      unavailable: "«غير متوفر»؟",
      reddit: "ادعاءات المنتديات",
      method: "قواعد العدّ",
    }),
    h2: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": `في أي ساعات اليوم يعود iPhone Duo إلى الرف ${inC(x.c)}؟`,
      "day-by-day": `ما الأيام التي شهدت عودة iPhone Duo ${inC(x.c)}؟`,
      where: `أين تتركز عودات iPhone Duo بين متاجر Apple ${inC(x.c)}؟`,
      configuration: `ما تكوين iPhone Duo الذي يعود أكثر ${inC(x.c)}؟`,
      "how-long": `كم يبقى iPhone Duo على الرف بعد عودته ${inC(x.c)}؟`,
      unavailable: "لماذا تُظهر متاجر Apple كلها «غير متوفر حاليًا»؟",
      reddit: "ادعاءات Reddit عن عودات iPhone Duo في مواجهة السجل",
      method: "ما الذي يحسبه ShelfSpring عودة؟",
    }),
    faq: (x: RestockTimesView): Faq[] => {
      const { t, w, pattern, sell, us, weekend, tracked } = x;
      const where = inC(x.c);
      const fast = secs(SPEED.fastSec);
      return [
        { q: `متى توفّر Apple جهاز iPhone Duo ${where}؟`, a: t.n > 0 && pattern
          ? `${w.from >= 5 && w.from < 12 ? "غالبًا صباحًا: " : ""}${rtPct(w.share)} من حالات التوفر المؤكدة منذ ${longDate(t.since)} (وعددها ${N(t.n)}) وقعت ${between(w.from, w.to)} على ساعة المتجر، و${rtPct(hourShare(t.byHour, 8, 12))} بين 8:00 و12:00. لا تنشر Apple أي جدول؛ هذا هو النمط الذي رصده ShelfSpring، ويتحدث كل خمس دقائق تقريبًا.`
          : `لا تنشر Apple أي جدول، وقد سجّل ShelfSpring ${where} ${t.n === 0 ? "لا توفر مؤكدًا" : `توفرًا مؤكدًا ${count(t.n, TIMES)}`} منذ ${longDate(t.since)}${t.days ? ` على مدى ${count(t.days, DAYS)}` : ""}. نذكر الساعة المعتادة حين تبلغ حالات التوفر ${N(PATTERN_MIN)} على ${count(PATTERN_MIN_DAYS, DAYS)} مختلفة، وتتحدث هذه الصفحة تلقائيًا.` },
        { q: `هل توفّر Apple جهاز iPhone Duo في عطلة نهاية الأسبوع${us ? "" : ` ${where}`}؟`, a: t.n > 0
          ? `${weekend > 0 ? `نعم حتى الآن: وقع ${N(weekend)} من حالات التوفر الـ${N(t.n)} يوم سبت أو أحد (${rtPct(weekend / t.n)}).` : `ليس بعد في بياناتنا: لم يقع أيٌّ من حالات التوفر الـ${N(t.n)} يوم سبت أو أحد.`} ${t.peakWeekday != null ? `وكان ${weekdayName(t.peakWeekday)} اليوم الأكثر عودات.` : `ولا نذكر اليوم الأكثر عودات حتى تغطي البيانات ${count(WEEKDAY_MIN_SPAN, DAYS)}؛ وبياناتنا تغطي ${count(tracked, DAYS)}.`}`
          : `لا بيانات لعطلة نهاية الأسبوع ${where} بعد؛ يمتلئ جدول «يومًا بيوم» في هذه الصفحة مع تأكيد كل توفر.` },
        { q: "متى أبدأ الفحص؟", a: t.n > 0 && pattern
          ? `إن كنت تفحص يدويًا، فكن على apple.com مع اختيار الاستلام من الساعة ${hourLabel(w.from)} بتوقيت المتجر؛ فهاتان الساعتان حملتا ${rtPct(w.share)} من حالات التوفر. ${sell ? `ونصف حالات التوفر نفد خلال ${secs(sell.medianSec)}` : "والتوفر المعتاد يدوم دقيقة تقريبًا"}، لذا فالتنبيه الذي يفحص كل ${fast} ([كيف تعمل التنبيهات](/iphone-duo-stock-alerts)، بالإنجليزية) يفعل ما لا يفعله أي تحديث للصفحة.`
          : `إلى أن يتضح النمط ${where}، دع التنبيه يراقب عنك: نفحص المتاجر التي تختارها كل ${fast} على مدار الساعة ([كيف تعمل التنبيهات](/iphone-duo-stock-alerts)، بالإنجليزية).` },
        { q: "لماذا تقول كل متاجر Apple إن iPhone Duo غير متوفر؟", a: sell
          ? `لأن التوفر قصير: ${rtPct(sell.within2min)} من حالات التوفر التي نفدت وقسناها ${where} (وعددها ${N(sell.n)}) اختفت خلال دقيقتين، و${rtPct(sell.within20min)} خلال 20 دقيقة. الآن يعرضه ${N(x.duoNow)} من ${count(x.stores, STORES_G)}؛ وفي أي لحظة أخرى تقريبًا، القراءة الصادقة لـapple.com هي «غير متوفر» حتى في يوم شهد عشرات حالات التوفر ([ماذا تعني «غير متوفر»](/apple-store-pickup-availability-explained)، بالإنجليزية).`
          : `لأن مخزون الاستلام يظهر لدقائق في كل مرة. الآن يعرضه ${N(x.duoNow)} من ${count(x.stores, STORES_G)} ${where} ([ماذا تعني «غير متوفر»](/apple-store-pickup-availability-explained)، بالإنجليزية).` },
        { q: "كيف يصلني إشعار حين يتوفر iPhone Duo في متجر Apple الذي أريده؟", a: `فعّل تنبيهًا للمتجر وللسعة واللون بالتحديد: من حينها يُفحص ذلك المتجر كل ${fast}، ويصل الخبر إلى هاتفك بعد نحو ${secs(SPEED.alertSec)} من تأكيد التوفر ([فعّل تنبيهًا](${x.alert})؛ [طريقة العمل](/how-it-works)، بالإنجليزية).` },
      ];
    },
    sources: {
      applePickup: "شرح Apple نفسها: «التوصيل والاستلام» (بالإنجليزية)",
      newsroom: "«وصول iPhone Duo إلى متاجر Apple حول العالم» · بيان Apple الصحفي، 23 أكتوبر 2026 (بالإنجليزية)",
      macRumors: "«عودة نظام الاستلام من متاجر Apple لجهاز iPhone Duo في الولايات المتحدة وكندا» · نشرته MacRumors في 24 أكتوبر 2026 (بالإنجليزية)",
      reports: (tracker: string) => `${tracker}، ملاحظات أسبوع إطلاق iPhone Duo: تبقى خارج هذا السجل ولا تُحتسب أبدًا`,
    },
    ld: (x: RestockTimesView) => ({
      datasetName: `أوقات توفر iPhone Duo في متاجر Apple ${inC(x.c)}`,
      description: `كل توفر مؤكد لـiPhone Duo للاستلام من متاجر Apple ${inC(x.c)} منذ ${x.t.since}، مع المتجر والخيار والوقت، من فحوص ShelfSpring كل ${secs(SPEED.checkSec)}؛ ملخّصًا حسب الساعة المحلية واليوم وال${rtRegion(x)} والمتجر والخيار.`,
      spatial: `متاجر Apple ${inC(x.c)}`,
      measured: ["وقت التوفر (على ساعة المتجر)", "متجر Apple", "سعة iPhone Duo ولونه", "الثواني حتى النفاد"],
      size: `توفر ${count(x.t.n, TIMES)} في ${count(x.t.stores, STORES_G)}`,
    }),
    crumb: "سجل عودات iPhone Duo",

    // ---- time of day
    timeLead: (x: RestockTimesView) => <b>على ساعة المتجر، وقعت {rtPct(x.w.share)} من العودات الـ{N(x.t.n)} {between(x.w.from, x.w.to)}، و{rtPct(hourShare(x.t.byHour, 8, 12))} منها بين 8:00 و12:00.</b>,
    busiestHour: (c: number) => `الساعة الأكثر ازدحامًا: ${count(c, RETURNS)}`,
    morning: "الصباح، من 8:00 إلى 12:00",
    evening: "بعد 17:00: للمساء نصيب أيضًا",
    night: "الليل، من 0:00 إلى 6:00",
    tooFew: (x: RestockTimesView) => <b>{x.t.n > 0 ? `${count(x.t.n, RETURNS)} على مدى ${count(x.t.days, DAYS)}` : "لا عودة مؤكدة"} منذ {longDate(x.t.since)}: أيام متفرقة أقل من أن تسمّي ساعة معتادة{x.t.n > 0 ? "" : " بعد"}.</b>,
    tooFewKeys: (): Point[] => [
      { text: <>شرط تسمية ساعة معتادة: <b className="text-ink">{N(PATTERN_MIN)} عودات موزعة على {count(PATTERN_MIN_DAYS, DAYS)} مختلفة</b></> },
      { text: <>عشر عودات في دفعة واحدة حدث واحد، وليست عادة</>, no: true },
      { text: <>كلما تراكمت الأيام أعادت الصفحة صياغة نفسها</>, step: true },
    ],
    hourCaption: (x: RestockTimesView) => `عودات iPhone Duo المدوّنة ${inC(x.c)} لكل ساعة على ساعة المتجر، ${dateLabel(x.t.since, false)} ← اليوم، ${N(x.t.n)} في المجموع`,
    hourHead: ["ساعة المتجر (24 س)", "العودات", "% من السجل"],
    morningKeys: (x: RestockTimesView): Point[] => [
      { text: <>ذروة الصباح <b className="text-ink">لا علاقة لها بفتح الأبواب</b>{x.us ? ": أغلب متاجر Apple الأمريكية تفتح عند 10:00" : ""}</> },
      { text: <>عروض الاستلام تظهر <b className="text-ink">على الإنترنت</b> قبل أن يُفتح المتجر</> },
      { text: <>إن كنت تتابع بنفسك: صباح أيام العمل، <b className="text-ink">{rangeLabel(x.w.from, x.w.to)}</b></>, step: true },
      { text: <>واترك <Link href={x.alert}>قائمة المراقبة</Link> تغطي <b className="text-ink">الساعات الـ22 الباقية</b> التي لا يحدّث فيها أحد الصفحة</>, step: true },
    ],
    storeChartKeys: (x: RestockTimesView): Point[] => [{ text: <>صفحة كل متجر ترسم ساعاته بتوقيته (<Link href={x.storesHref}>{x.us ? "دليل المتاجر حسب الولاية" : `دليل المتاجر ${inC(x.c)}`}</Link>): فرق ساعة بين متجر يعود عند 8:00 وآخر عند 9:00 معلومة تستحق المعرفة</>, step: true }],

    // ---- day by day
    dayLead: (x: RestockTimesView) => {
      const { t, tracked, one } = x;
      return t.n > 0 && tracked === 1 ? (
        <b>السجل يغطي يومًا واحدًا حتى الآن ({dateLabel(t.daily[t.daily.length - 1]?.date ?? t.since)}): {count(t.n, RETURNS)} مؤكدة{one ? "" : ` عبر ${count(t.stores, STORES_G)}`}.</b>
      ) : t.n > 0 ? (
        <b>{t.days === tracked ? `لم يخلُ يوم واحد من السجل (${N(t.days)}/${N(t.days)})` : `${N(t.days)} من ${count(tracked, DAYS)} منذ ${longDate(t.since)} حملت`} عودة مؤكدة واحدة على الأقل{t.peakWeekday != null ? `، ويتصدّر ${weekdayName(t.peakWeekday)} أيام الأسبوع` : ""}.</b>
      ) : (
        <b>منذ {longDate(t.since)} لم تُدوَّن أي عودة مؤكدة {inC(x.c)}.</b>
      );
    },
    daysTracked: "أيام في السجل حملت عودة واحدة على الأقل",
    busiestDay: (x: RestockTimesView, day: DayRow) => `يوم الذروة: ${dateLabel(day.date)}${x.one ? "" : `، عبر ${count(day.stores, STORES_G)}`}`,
    busiestDayNone: "يوم الذروة",
    drop: (x: RestockTimesView, drop: { at: string; restocks: number }) => `عودات متزامنة في نصف ساعة واحدة، ${zoneStamp(drop.at, x.c)} (${count(drop.restocks, CONFIGS)}): دفعة على مستوى البلد تظهر من الخارج`,
    weekend: (x: RestockTimesView) => `السبت والأحد (${x.weekend === 0 ? "لا شيء حتى الآن" : count(x.weekend, RETURNS)})`,
    dayCaption: (x: RestockTimesView) => `عودات iPhone Duo المدوّنة ${inC(x.c)} لكل يوم في التقويم${x.t.reports.length ? ". الصفوف الرمادية الموسومة «مُبلَّغ» من ملاحظات علنية لمتتبعات أخرى عن أيام سبقت فتح هذا السجل؛ تملأ الخط الزمني ولا تدخل أي مجموع" : ""}`,
    dayHead: { date: "اليوم", restocks: "العودات", stores: "عدد المتاجر", busiest: "ساعة الذروة (24 س)", source: "دوّنه" },
    soFar: " · جارٍ",
    reportedBy: (names: string[]) => <>{names.join(" / ")}، مُبلَّغ</>,
    dayKeys: (x: RestockTimesView, launch: string, resumed: string): Point[] => [
      { text: <><b className="text-ink">{dateLabel(launch)}</b>: الإطلاق، وذهبت أولى الأجهزة إلى طلبات الإنترنت</> },
      { text: <><b className="text-ink">{dateLabel(resumed)}</b>: استؤنفت حجوزات الاستلام{x.us ? " (MacRumors)" : ""}</> },
      x.t.reports.length
        ? { text: <>صفوف <b className="text-ink">مُبلَّغ</b>: ملاحظات {x.reportNames.join(" و")} في أسبوع الإطلاق، خارج كل مجموع</> }
        : { text: <>فُتح السجل لكل متجر {inC(x.c)} في <b className="text-ink">{longDate(x.t.since)}</b></> },
      ...(x.t.n > 0 && x.t.peakWeekday == null ? [{ text: <>اليوم الذي يتصدّر الأسبوع يُسمّى حين يغطي السجل <b className="text-ink">{count(WEEKDAY_MIN_SPAN, DAYS)}</b> (يغطي الآن {count(x.tracked, DAYS)})</>, no: true }] : []),
      { text: <>انظر إلى عمود <b className="text-ink">عدد المتاجر</b>: العودات نفسها موزعة على متاجر أكثر تعني فرصة أوسع لك</>, step: true },
    ],

    // ---- where
    whereLead: (x: RestockTimesView, hit: { name: string; restocks: number; stores: number; storesTotal: number }[], total: number) => (
      <b>في الصدارة {hit[0].name}: {count(hit[0].restocks, RETURNS)} عبر {N(hit[0].stores)} من {count(hit[0].storesTotal, STORES_G)} منذ {dateLabel(x.t.since, false)}{hit[1] ? <>؛ يليها {hit[1].name} ({N(hit[1].restocks)})</> : null}{hit[2] ? <> و{hit[2].name} ({N(hit[2].restocks)})</> : null}. {hit.length === total ? `لم تخلُ أي ${x.us ? "ولاية" : regionNoun(x.c)} من عودة واحدة على الأقل` : `${N(hit.length)} من ${x.us ? `${N(total)} ولاية` : regionsCount(x.c, total)} سجّلت عودة، و${N(total - hit.length)} لم تسجّل شيئًا بعد`}.</b>
    ),
    whereNone: (x: RestockTimesView) => <b>لا {rtRegion(x)} سجّلت عودة مؤكدة حتى الآن؛ أول قيد يفتح الجدول.</b>,
    regionCaption: (x: RestockTimesView) => `عودات iPhone Duo المدوّنة لكل ${rtRegion(x)} ${inC(x.c)}، ${dateLabel(x.t.since, false)} ← اليوم`,
    regionHead: (x: RestockTimesView) => [`ال${rtRegion(x)}`, "العودات", "متاجر فيها عودة", "الأحدث (ساعة المتجر)"],
    ofN: (a: number, b: number) => <>{N(a)}/{N(b)}</>,
    storesCaption: (x: RestockTimesView) => `المتاجر ذات أطول سجل لعودات iPhone Duo ${inC(x.c)}، ${dateLabel(x.t.since, false)} ← اليوم`,
    storesHead: ["المتجر", "العودات", "أيام فيها عودة", "الساعة المعتادة", "الأحدث (ساعة المتجر)"],
    swaps: (x: RestockTimesView) => [
      { no: "المتجر صاحب أكثر حالات التوفر، أينما كان", yes: `متجران أو ثلاثة يمكنك الوصول إليها خلال ساعة من ${x.pattern ? `الساعة ${hourLabel(x.w.from)}` : "الصباح"}`, why: "التوفر الذي لا تستطيع الوصول إليه ليس توفرًا؛ حتى أكثر المتاجر توفرًا يقول «غير متوفر» طوال اليوم إلا بضع دقائق." },
      { no: "متجر واحد، والأمل", yes: "تنبيه على كلٍّ منها، ثم انطلق إلى المتجر الذي يصلك إشعاره", why: "جدول الأعداد يخبرك فقط بأي متاجرك تبدأ." },
    ],
    nearMe: "متاجر قريبة تضع Duo على الرف الآن",

    // ---- configuration
    configLead: (x: RestockTimesView, top: { label: string; restocks: number }, rarest: { label: string; restocks: number } | null) => (
      <b>{top.label} يتصدّر بـ{N(top.restocks)} من العودات الـ{N(x.t.n)} ({rtPct(top.restocks / x.t.n)}){rarest ? `؛ وفي المؤخرة ${rarest.label} بـ${count(rarest.restocks, RETURNS_G)}` : ""}.</b>
    ),
    mostRestocked: (config: string) => `${config}: التكوين الأكثر عودة`,
    versus: (a: string, bCount: number, b: string) => `عودات ${a}، في مقابل ${N(bCount)} لـ${b}`,
    restocksOf: (a: string) => `عودات ${a}`,
    byStorage: "لكل سعة",
    byColour: "لكل طلاء",
    configNone: (x: RestockTimesView) => <b>لا تكوين {inC(x.c)} سجّل عودة مؤكدة{x.t.n > 0 ? "" : " بعد"}؛ التكوينات الـ{N(x.configs)} مدرجة مسبقًا ليجد أول قيد صفه.</b>,
    configCaption: (x: RestockTimesView) => `عودات iPhone Duo المدوّنة ${inC(x.c)}، صف لكل تكوين، ${dateLabel(x.t.since, false)} ← اليوم`,
    configHead: ["التكوين", "العودات", "% من السجل", "الأحدث (ساعة المتجر)"],
    configKeys: (x: RestockTimesView): Point[] => [
      { text: <>قرار الخيار أهم <b className="text-ink">من قرار المتجر</b></> },
      x.storageRatio != null
        ? { text: <>اقبل بالسعة الأكثر توفرًا: فرصتك نحو <b className="text-ink">{x.storageRatio}×</b> فرصة السعة التالية</> }
        : { text: <>اقبل بالسعة الأكثر توفرًا: تتحسن فرصتك <b className="text-ink">بوضوح</b></> },
      { text: <>سعة <b className="text-ink">2TB</b>: هاتف تطلبه للتوصيل وتنتظره</>, no: true },
      { text: <>الأسعار والمتوفر الآن: <Link href="/which-iphone-duo-restocks-most">أي خيارات iPhone Duo تتوفر أكثر؟ (بالإنجليزية)</Link></>, step: true },
    ],

    // ---- how long
    howLongLead: (x: RestockTimesView, sell: SelloutFacts) => <b>من {N(sell.n)} عودة {inC(x.c)} قيس مكوثها، غادر نصفها الرف خلال {secs(sell.medianSec)}؛ {rtPct(sell.within2min)} خلال دقيقتين و{rtPct(sell.within20min)} خلال 20 دقيقة.</b>,
    secUnit: "ث",
    medianListing: "وسيط المكوث على الرف",
    within2: "غادر الرف في أقل من دقيقتين",
    within20: "غادر الرف في أقل من 20 دقيقة",
    fastest: "أقصر مكوث قيس",
    howLongNone: (x: RestockTimesView) => <b>المكوث المقيس {inC(x.c)} أقل من أن يُعرض{x.t.n > 0 ? "" : " بعد"}؛ تظهر هذه الأرقام من عشر عودات فصاعدًا، والصورة الكاملة في الصفحة الأمريكية.</b>,
    howLongKeys: (x: RestockTimesView): Point[] => [
      { text: <>نافذة الدقيقتين يلتقطها <b className="text-ink">التنبيه</b>، لا تحديث apple.com</> },
      { text: <>هذا هو الرقم الذي يفسّر كل ما عداه في هذه الصفحة</> },
      { text: <>كل توفر بالثواني التي دامها، حسب الخيار وال{rtRegion(x)}: <Link href="/iphone-duo-sell-out-times">كم يصمد توفر iPhone Duo قبل النفاد؟ (بالإنجليزية)</Link></>, step: true },
    ],
    measured: "كل رقم يقيس المسافة بين أول معاينة رأت التكوين على الرف وأول معاينة وجدته قد غادر؛ إنه سقف، والمكوث الفعلي أقصر منه.",

    // ---- unavailable
    unavailableLead: (x: RestockTimesView) => <b>العودة لمحة عابرة، لا حالة ثابتة: {x.one ? "متجر واحد" : count(x.stores, STORES)} × {count(x.configs, CONFIGS)} = {N(x.pairs)} موضعًا يمكن أن يعود إليه الجهاز {inC(x.c)}، والمتاجر التي تضع أي iPhone Duo على الرف في هذه اللحظة: {N(x.duoNow)}.</b>,
    pairs: "مواضع «متجر × تكوين» ممكنة",
    listingNow: "تضع iPhone Duo على الرف الآن",
    goneIn2: "من العودات غادرت الرف في أقل من دقيقتين",
    last24: "عودات مؤكدة في الساعات الـ24 الماضية",
    unavailableKeys: (x: RestockTimesView, today: number): Point[] => [
      x.recent.restocks > 0
        ? { text: <>الساعات الـ24 الماضية: <b className="text-ink">{count(x.recent.restocks, RETURNS)} مؤكدة</b> عبر {count(x.recent.stores, STORES_G)} {inC(x.c)}</> }
        : today > 0
          ? { text: <>حصيلة اليوم: <b className="text-ink">{count(today, RETURNS)} مؤكدة</b> {inC(x.c)}</> }
          : { text: <>تقويم العودات أعلاه يبيّن ما حدث فعلًا</> },
      { text: <>كل واحدة منها بقيت على apple.com <b className="text-ink">دقيقة أو اثنتين</b></> },
      { text: <>أن تجد «غير متوفر» في كل مكان في اليوم الرابع أو الرابع عشر <b className="text-ink">ليس</b> دليلًا على أن Apple توقفت</>, no: true },
    ],
    unavailableLinks: { explained: "قراءة عبارة «غير متوفر حاليًا للاستلام» (بالإنجليزية)", howToGet: "طريق عملي للحصول على iPhone Duo (بالإنجليزية)" },

    // ---- reddit
    redditLead: (x: RestockTimesView) => <b>ما يُتداول في <a href="https://www.reddit.com/r/applestore/" target="_blank" rel="noopener nofollow">r/applestore</a> و<a href="https://www.reddit.com/r/iphone/" target="_blank" rel="noopener nofollow">r/iphone</a> يُقال غالبًا بحسن نية، لكنه تجربة متجر واحد ويبلى خلال يوم. هنا أكثر أربعة ادعاءات تكرارًا، موضوعة أمام العودات المؤكدة الـ{N(x.t.n)} {inC(x.c)}.</b>,
    redditCaption: "أربعة ادعاءات متكررة على Reddit عن عودات iPhone Duo، في مواجهة ما دوّنه ShelfSpring",
    redditHead: ["ما يُقال", "ما يقوله السجل"],
    claims: (x: RestockTimesView): { claim: string; answer: ReactNode }[] => {
      const { t, w, tracked, recent } = x;
      return [
        { claim: "«المخزون يصل ليلًا، فافتح الصفحة الساعة 3 فجرًا.»", answer: t.n > 0 ? <>بين 0:00 و6:00 على ساعة المتجر وقعت {rtPct(hourShare(t.byHour, 0, 6))} من العودات، مقابل {rtPct(w.share)} {between(w.from, w.to)}.</> : zero },
        { claim: "«Apple تعيد المخزون في يوم واحد من الأسبوع فقط.»", answer: t.n > 0 ? (t.peakWeekday != null ? <>يتصدّر {weekdayName(t.peakWeekday)} حتى الآن ({N(t.byWeekday[t.peakWeekday])} من {N(t.n)})، غير أن العودات توزعت على {N(t.days)} من {N(tracked)} يومًا في السجل.</> : <>توزعت العودات على {N(t.days)} من {N(tracked)} يومًا في السجل{t.days === tracked ? "، ولم يخلُ منها يوم" : ""}؛ واليوم الذي يتصدّر يُسمّى حين يغطي السجل {count(WEEKDAY_MIN_SPAN, DAYS)}.</>) : zero },
        { claim: "«اتصل بالمتجر واسأل عن موعد الشحنة.»", answer: "Apple لا تنشر جدولًا للشحنات؛ وعروض الاستلام تظهر على apple.com على الإنترنت، فيراها المتجر في اللحظة التي يراها فيها أي شخص آخر." },
        { claim: "«عبارة غير متوفر تعني أنه انتهى.»", answer: recent.restocks > 0 ? <>عودات الساعات الـ24 الماضية ({N(recent.restocks)} عبر {count(recent.stores, STORES_G)}) تنفي ذلك؛ وكل واحدة منها رجعت إلى «غير متوفر» بعد دقائق.</> : t.n > 0 ? <>العودات المؤكدة الـ{N(t.n)} منذ {dateLabel(t.since, false)} تنفي ذلك؛ وكل واحدة منها رجعت إلى «غير متوفر» بعد دقائق.</> : "لا قيد في السجل نختبر به الادعاء بعد." },
      ];
    },
    redditKeys: (): Point[] => [
      { text: <>الشائعة هي ما يلجأ إليه الناس حين <b className="text-ink">لا توجد بيانات</b>؛ وهذه الصفحة هي البيانات، ومجانية للقراءة</> },
      { text: <>حيث يصيب Reddit: <b className="text-ink">نصائح الدفع</b>، سجّل الدخول وجهّز Apple Pay (<Link href="/how-to-grab-an-iphone-duo-restock">نسختنا في 20 ثانية، بالإنجليزية</Link>)</> },
    ],

    // ---- method
    methodLead: <b>تُدوَّن العودة حين يضع apple.com تكوينًا على رف الاستلام في متجر لم يكن معروضًا فيه، وتؤكد ذلك معاينتان متطابقتان.</b>,
    methodKeys: (x: RestockTimesView): Point[] => [
      { text: <>{x.one ? `متجر Apple ${inC(x.c)}` : `كل متجر Apple ${inC(x.c)}`} كل <b className="text-ink">{secs(SPEED.checkSec)}</b>؛ والمتاجر التي تشير إليها التنبيهات كل <b className="text-ink">{secs(SPEED.fastSec)}</b></> },
      { text: <>المتتبعات الأخرى تعلن فواصل فحص <b className="text-ink">{others}</b>؛ ونقارن بالأرقام المنشورة فقط</> },
      { text: <>أول «متوفر» نعيد السؤال عنه <b className="text-ink">بعد نحو ثانية</b> قبل أن يُحتسب</> },
      { text: <>العرض الذي يختفي يتأكد في <b className="text-ink">الجولة التالية</b></> },
      { text: <>أول رؤية لمتجر، أو طلب فاشل أو انتهت مهلته: <b className="text-ink">لا يُحتسب أبدًا</b> توفرًا ولا «نفادًا»</>, no: true },
      { text: <>الساعات والتواريخ <b className="text-ink">بتوقيت المتجر</b> لكل متجر؛ و«الموجات» = نصف الساعة نفسه عبر المناطق الزمنية</> },
      { text: <>تقارير المتتبعات الأخرى{x.t.reports.length ? ` (${x.reportNames.join("، ")})` : ""}: صفوف خاصة بها ومعلَّمة، <b className="text-ink">ولا تدخل أي مجموع</b></> },
      { text: <>تتحدث كل خمس دقائق تقريبًا؛ و<Link href={x.logHref}>سجل التوفر</Link> نفسه مباشر</>, step: true },
    ],
    quote: "يسعدنا أن تقتبس هذه الأرقام مع رابط إلى هذه الصفحة؛ ShelfSpring مستقل ولا يتبع Apple، ويقرأ توفر الاستلام نفسه الذي يراه أي شخص على apple.com، لكن بتكرار أكبر بكثير.",
    alertIn: (x: RestockTimesView) => <>راقِب iPhone Duo{x.one ? "" : ` ${inC(x.c)}`}</>,

    // ---- related, FAQ, sources
    related: "المزيد من السجل نفسه",
    sameData: "أسئلة يجيب عنها هذا السجل (بالإنجليزية)",
    questions: {
      sellOut: "كم تبقى العودة على الرف؟",
      alerts: "أن تعرف بالعودة أولًا",
      howToGet: "طريق عملي للحصول عليه",
      whichConfig: "أي تكوين يعود أكثر",
      nearMe: "أي المتاجر القريبة تعرضه الآن",
      unavailable: "قراءة «غير متوفر حاليًا»",
    },
    otherCountries: (us: boolean): string => (us ? "هذه الدراسة في بلدان أخرى" : "سجلات بلدان أخرى"),
    faqTitle: "أسئلة من الميدان",
  },
};

export const views: Dict["views"] = withShelfViews("ar", baseViews);
