import { withShelfViews } from "@/lib/seo/localizedCopy";
/**
 * 繁體中文（香港）: views — product × place pages, the restock log, the live map, the iPhone Duo restock-times page
 * and the store index. `c: Country` is English data: named here with cn(); Store / Place objects are named with
 * places.ts; English product names get Apple's Chinese colour names (zhCfg). Only 15 s and 5 s intervals; no refunds.
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import type { Point } from "@/components/ui/Viz";
import type { Faq } from "@/lib/content/types";
import { catalogFor, stateCodeOf, storePath, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type Country, type CountryCode } from "@/lib/apple/countries";
import { faq as placeFaq, fmtDuration, listWords, peakOf, type FaqContext, type FaqItem } from "@/lib/seo/enrich";
import type { Place, Product } from "@/lib/seo/products";
import type { StoreLine } from "@/lib/seo/productData";
import type { PlaceStats, RestockStats } from "@/lib/stock/queries";
import { hourShare, type DayRow, type SelloutFacts } from "@/lib/content/restockTimes";
import { PATTERN_MIN, PATTERN_MIN_DAYS, WEEKDAY_MIN_SPAN, localStamp } from "@/lib/content/siteFacts";
import { SPEED } from "@/lib/plans";
import { distance, price } from "@/lib/i18n/format";
import { cityLabel, colorLabel, regionLabel } from "@/lib/i18n/places";
import type { RestockTimesMeta, RestockTimesView } from "../en/views";
import { HK_TITLE, L, WEEK, apple, city, cityNoun, cn, cnOf, dayFromEn, fitW, hr, hrFromEn, longYmd, n, rn, rng, shop, storeHead, taxNoteZh, ymd, zhCfg, zhPlace, zoneStampZh } from "./common";

const lw = (items: string[], max = 6) => listWords(items, max, L);
const ccOf = (p: { country?: CountryCode }): CountryCode => p.country ?? "us";
/** A place of the product tree in Chinese: "香港", "尖沙咀", "Apple Canton Road（廣東道）". */
function placeZh(place: Place): string {
  const cc = ccOf(place);
  if (place.level === "country") return cn(cc);
  if (place.level === "state") return regionLabel(cc, place.state!, L);
  if (place.level === "city") return cityLabel(cc, place.city!, L);
  return apple(place.store!);
}
const dist = (place: Place, miles: number) => distance(L, ccOf(place), miles);

/** Whole-percent shares; under half a percent "<1%". */
const pct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
const regionWordOf = (x: { us: boolean; c: Country }) => (x.us ? "州" : x.c.regionNoun ? rn(x.c) : "地區");
const yet = (x: RestockTimesMeta) => (x.t.n > 0 ? "" : "仍");

/* ---------------------------------------------------------------- product × place */

function productTitle(product: Product, place: Place, inStock: number): string {
  const cc = ccOf(place);
  const name = zhCfg(product.name);
  const short = zhCfg(product.short);
  const k = place.stores.length;
  if (place.level === "country" && cc !== "us") return fitW([...(inStock > 0 ? [`${name}：${cn(cc)} ${n(inStock)} 間 Apple Store 有現貨`] : []), `${name} ${cn(cc)}取貨現貨（即時）`, `${short} ${cn(cc)}取貨現貨`, `${short} 取貨現貨`]);
  if (place.level === "country") return fitW([...(inStock > 0 ? [`${name}：現有 ${n(inStock)} 間 Apple Store 有貨`] : []), `${name} 店舖取貨即時現貨`, `${name} 取貨現貨`, `${short} 取貨現貨`]);
  if (place.level === "store") {
    const s = place.store!;
    const now = inStock > 0 ? "現在有貨" : "取貨現貨";
    const head = HK_TITLE[s.storeNumber]?.[0] ?? apple(s);
    return fitW([`${head} ${name}：${now}`, `${head} ${short}：${now}`, `${head} ${short} 現貨`, `${shop(s)} ${short} 現貨`, `${short} 現貨 · ${shop(s)}`]);
  }
  const w = placeZh(place);
  return fitW([`${w} ${name} 現貨：${n(k)} 間中 ${n(inStock)} 間有貨`, `${w} ${name}：取貨現貨`, `${w} ${short} 現貨`, `${short} 現貨（${w}）`]);
}

function productDescription(product: Product, place: Place, inStock: number, stats: PlaceStats): string {
  const cc = ccOf(place);
  const name = zhCfg(product.name);
  const week = `本週補貨 ${n(stats.week)} 次`;
  if (place.level === "store") {
    const s = place.store!;
    const loc = cc === "us" ? `${s.city} ${stateCodeOf(s)}` : city(s);
    const head = HK_TITLE[s.storeNumber] ? storeHead(s) : `${apple(s)} · ${loc}`;
    return fitW([
      `${head}的 ${name} 取貨現貨：${inStock > 0 ? "現在有貨" : "現時沒有貨"}，${week}。即時狀態、補貨時間及提醒。`,
      `${apple(s)} 的 ${name}：${inStock > 0 ? "現在有貨" : "現時沒有貨"}，${week}。即時狀態及提醒。`,
    ], 155);
  }
  const where = place.level === "country" ? `${cn(cc)} Apple Store` : `${placeZh(place)} Apple Store`;
  return fitW([
    `${name} 取貨現貨：${where}共 ${n(place.stores.length)} 間，現有 ${n(inStock)} 間有貨，${week}。逐店即時現貨、補貨時間及提醒。`,
    `${name}：${n(place.stores.length)} 間${where}中 ${n(inStock)} 間現在有貨，${week}。逐店即時現貨及提醒。`,
  ], 155);
}

function productFaq(product: Product, place: Place, lines: StoreLine[], stats: PlaceStats, clock: RestockStats, nearest: { name: string; city: string; distance: number } | null): FaqItem[] {
  const out: FaqItem[] = [];
  const at = placeZh(place);
  const name = zhCfg(product.name);
  const near = nearest ? `；距離最近而在架的是 Apple ${nearest.name}${nearest.name.includes(nearest.city) ? "" : `（${nearest.city}）`}，相距約 ${dist(place, nearest.distance)}` : "";
  const inStock = lines.filter((l) => l.available.length > 0);
  if (place.level === "store") {
    const l = lines[0];
    out.push({
      q: `此刻${at}的架上有 ${name} 嗎？`,
      a: l && l.available.length > 0
        ? `以最新一次查看為準，在架${product.parts.length > 1 ? `：${lw(l.available.map((i) => `${i.storage} ${colorLabel(i.color, L)}`), 4)}` : ""}。`
        : `最新一次查看時不在架${near}。`,
    });
  } else {
    out.push({
      q: `${at}有哪幾間 Apple Store 把 ${name} 放上架？`,
      a: inStock.length === 0 ? `最新一次查看，一間都沒有${near}。` : `最新一次查看錄得 ${n(inStock.length)} 間在架：${lw(inStock.map((l) => apple(l.store)), 4)}。`,
    });
  }
  const peak = peakOf(clock, L);
  out.push({
    q: `${at}的 ${name} 回架記錄怎樣？`,
    a: stats.month === 0 ? `近 ${n(stats.days)} 日，${at}一次回架都未錄得。` : `近 ${n(stats.days)} 日錄得 ${n(stats.month)} 次回架，本週佔 ${n(stats.week)} 次${peak ? `；最常見的鐘數是店舖時間${peak.hour}前後` : ""}。`,
  });
  if (stats.medianMs != null) out.push({ q: `${name} 在${at}一般在架多久？`, a: `在架時間的中位數約 ${fmtDuration(stats.medianMs, L)}，之後又再落架。` });
  return out;
}

function priceLabel(product: Product): string {
  const cc = ccOf(product);
  const prices = catalogFor(product.model, cc).filter((c) => product.parts.includes(c.partNumber)).map((c) => c.price);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  const f = (v: number) => price(L, COUNTRIES[cc], v);
  return lo === hi ? f(lo) : `${f(lo)}–${f(hi)}`;
}

/* ---------------------------------------------------------------- views */

const baseViews: Dict["views"] = {
  common: {
    inCountry: (c: Country) => cnOf(c),
    liveMap: "取貨地圖",
    restockLog: "回架記錄",
    alertMe: "加入監察清單",
    lastDays: (days: number) => <>{n(days)} 日回架日曆</>,
    since: "2026年11月2日",
    sourcesWhere: (k: number, c: Country) => (k === 1 ? `${cnOf(c)}觀察中的唯一一間 Apple Store` : `${cnOf(c)}觀察中的 ${n(k)} 間 Apple Store`),
    checker: (c: Country) => `${cnOf(c)}取貨觀察簿`,
    appleStoresIn: (c: Country) => `${cnOf(c)} Apple Store`,
    storesWithIt: "在架的店",
    more: "觀察簿裏還有",
  },

  product: {
    title: productTitle,
    description: productDescription,
    faq: productFaq,
    priceLabel,
    inPlace: (name: string) => name,
    h1Country: (model: string, c: Country) => `${zhCfg(model)} ${cnOf(c)}取貨現貨`,
    h1Place: (model: string, where: string) => `${where}的 ${zhCfg(model)} 現貨`,
    inStockNow: "此刻在架",
    yes: "在架",
    no: "不在架",
    pickup: "取貨回覆",
    configurations: "在架配置",
    ofStores: (k: number) => `觀察 ${n(k)} 間店`,
    restocks24h: "回架 · 近一日",
    restocksHint: (week: number, month: number, days: number) => `7 日：${n(week)} · ${n(days)} 日：${n(month)}`,
    sellOuts: (days: number) => `再次落架 · ${n(days)} 日`,
    stays: (ms: number) => `在架中位數：${fmtDuration(ms, L)}`,
    noPairs: "未有完整的在架記錄",
    lastRestock: "最近一次回架",
    noneYet: "未見過",
    thisConfig: "就是這個配置",
    inDays: (days: number) => `${n(days)} 日內未見`,
    notInStockNow: "此刻不在架",
    configsInStock: (k: number, of: number) => <span>在架配置 <b className="text-ink">{n(k)}</b>/{n(of)}</span>,
    inStockAt: (k: number, of: number) => <span>在架店舖 <b className="text-ink">{n(k)}</b>/{n(of)}</span>,
    checked: (live: ReactNode, p: string, tax: string) => <>{p}{tax} · 最新觀察 {live}</>,
    taxNote: (c: Country) => taxNoteZh(c),
    beforeTax: "稅前",
    buyOnApple: "到 apple.com 落單",
    allStoresIn: (c: Country) => `${cnOf(c)}零售店名冊`,
    everyIphoneHere: "這間店的三款 iPhone",
    everyIphone: (where: string) => `${where}的三款 iPhone`,
    panel: (model: string, where: string | null) => `${zhCfg(model)} 監察清單${where ? ` · ${where}` : ""}：先揀配置，再揀去得到的店`,
    unitConfigs: "配置",
    unitStores: "店",
    otherConfigsHere: "這間店的其他版本",
    byStorageColor: "先容量，後機色",
    nearestStores: "距離最近的店",
    closest: (link: ReactNode, d: string) => <>最近一間有在架的店：{link}（{d}）</>,
    storeCity: (store: string, c: string) => <>{store}（{c}）</>,
    mostRecentlyInStock: "最後在哪裏見到",
    storesWithItNow: "今日在架的店",
    storesIn: (where: string) => `${where}的店`,
    colStatus: "架況",
    colConfigs: "在架配置",
    noStoreHasIt: "最新一次觀察：沒有任何一間店在架。",
    noStoreHereHasIt: "最新一次觀察：這幾間店都不在架。",
    moreStores: (k: number) => <>另有 {n(k)} 間店在架 · 打開完整零售店名冊 ↗</>,
    byRegion: (c: Country) => `分${rn(c)}看`,
    byCity: "分區看",
    nearbyStores: "後備店舖",
    latestChanges: "觀察簿最新幾筆",
    nothingLogged: "記錄暫時一片空白。",
    whenRestocks: "回架落在哪些鐘數",
    howFast: "每次在架多久",
    restocksByConfig: "逐個配置的回架次數",
    faqTitleCountry: (model: string, c: Country) => `實地問答 · ${cnOf(c)} ${zhCfg(model)}`,
    faqTitle: (model: string, where: string) => `實地問答 · ${where} ${zhCfg(model)}`,
    buySource: (model: string, c: Country) => `apple.com ${cnOf(c)}：${zhCfg(model)} 訂購頁`,
    nearby: "周邊地點",
    otherRegions: (c: Country) => `更多${rn(c)}`,
    elsewhereIn: (region: string) => `${region}更多地方`,
    everyAppleStoreIn: (c: Country) => `${cnOf(c)}完整零售店名冊`,
    across: (model: string, c: Country) => `${zhCfg(model)} · 全${cnOf(c)}`,
    itemList: (model: string, where: string) => `${where}的 ${zhCfg(model)}`,
    nearLead: (c: Country, model: string, inStock: number, k: number, have: { store: string; city: string; configs: number }[]) =>
      inStock === 0
        ? `此刻${cnOf(c)}沒有一間 Apple Store 把 ${model} 放上架供取貨，「附近邊度有」其實要問哪間店會先回架。把你去得到的店放進監察清單，任何一間回架，推送提示很快就到。`
        : `${n(inStock)}/${n(k)} 間店此刻有 ${model} 在架：${lw(have.slice(0, 5).map((l) => `${l.store}${l.store.includes(l.city) ? "" : `（${l.city}）`} · ${n(l.configs)} 個配置`), 5)}。`,
    nearHead: (c: Country) => [rn(c), "此刻在架的店"],
    nearCaption: (c: Country, model: string) => `${model} 取貨架況，逐個${rn(c)}列出（最新一次查看）`,
    nearMe: (_c: Country, model: string, alert: string) => `用你的位置重新排列每一間店：打開本頁的監察清單設定，按「我附近」便可以；距離是按行車路線估出來的公里數，每間店旁邊有導航連結。[開一張 ${model} 監察清單](${alert})。`,
    modelFaq: (c: Country, model: string, low: number, high: number, inStock: number): { price: FaqItem; reserve: FaqItem } => {
      const money = (v: number) => price(L, c, v);
      return {
        price: { q: `${model} 在${cnOf(c)}賣幾錢？`, a: `最細容量 ${money(low)}，最大容量 ${money(high)}，以 apple.com 標價計（${taxNoteZh(c)}）。` },
        reserve: { q: `在${cnOf(c)}有辦法留起一部 ${model} 到店取嗎？`, a: `只有落單一途：用 apple.com 結帳並揀選店舖取貨，那個配置才屬於你，之後 Apple 會在你揀的時段替你保留。${inStock === 0 ? "最新一次觀察沒有任何店在架，加入監察清單就是最早收到消息的方法。" : ""}` },
      };
    },
  },

  restocks: {
    metaTitle: (c: Country, k: number) => `${cnOf(c)} iPhone 補貨記錄：${k === 1 ? "Apple Store" : `全部 ${n(k)} 間 Apple Store`}，即時更新`,
    metaDescription: (c: Country, k: number) => `${cnOf(c)}${k === 1 ? " Apple Store " : "各間 Apple Store "}每一次 iPhone Duo、18 Pro 及 Pro Max 店舖取貨補貨，附準確時間、款式及地圖。`,
    h1: (c: Country) => `${cnOf(c)}回架記錄`,
    summary: (day: number, week: number, model?: string, region?: string) => <>近一日：回架 {n(day)} 次；近七日：{n(week)} 次{model ? ` · ${model}` : ""}{region ? ` · ${region}` : ""}。鐘數跟隨你的裝置。</>,
    allModels: "每款型號",
    restocks: "只看回架",
    withSoldOut: "回架及落架",
    regionLabel: (c: Country) => rn(c),
    allRegions: (c: Country) => `任何${rn(c)}`,
    filter: "套用",
    page: (k: number) => <>記錄第 {n(k)} 頁</>,
    newer: "← 較近期",
    older: "更早 →",
    getAlerts: "開一張監察清單",
    byPlace: "按地點翻查回架記錄",
    byRegion: (c: Country) => `分${rn(c)}`,
    datasetName: (c: Country) => `${cnOf(c)} Apple Store iPhone 取貨補貨記錄`,
    datasetDescription: (c: Country) => `${c.cc === "us" ? "美國全部 269 間 Apple Store" : `${cnOf(c)}各間 Apple Store`}每一次已確認的 iPhone Duo、iPhone 18 Pro 及 iPhone 18 Pro Max 店舖取貨補貨及售罄，附分店、準確款式及時間。apple.com 兩次回應一致才記錄為補貨；每 15 秒檢查一次（有提醒的分店每 5 秒）。`,
    datasetMeasured: ["Apple Store", "iPhone 型號、容量及顏色", "補貨時間", "售罄時間"],
  },

  map: {
    metaTitle: (c: Country, k: number) => `iPhone Duo 取貨現貨地圖：${cnOf(c)}${k === 1 ? " Apple Store " : "每間 Apple Store "}即時更新`,
    metaDescription: (c: Country, k: number) => `${cnOf(c)}${k === 1 ? " Apple Store " : `全部 ${n(k)} 間 Apple Store `}即時地圖：iPhone Duo、18 Pro 及 Pro Max 現時的店舖取貨現貨，可按容量及顏色查看。`,
    country: (c: Country) => ({ name: cnOf(c), inName: cnOf(c), regionNoun: c.regionNoun, regionNounPlural: c.regionNounPlural }),
    everyStore: "零售店名冊",
    storeCity: (store: string, c: string) => `${c} · ${store}`,
  },

  storesIndex: {
    metaDescription: (c: Country, k: number, regions: number, cities: number, duo: number, max: number) => {
      const by = c.regionNoun && regions > 1 ? `，按${rn(c)}及城市排列` : cities > 1 ? `，按${cityNoun(c.cc)}排列` : "";
      return `${cnOf(c)}全部 ${n(k)} 間 Apple Store${by}，附 iPhone Duo、18 Pro 及 Pro Max 即時取貨現貨：現有 ${n(duo)} 間有 Duo，${n(max)} 間有 Pro Max。`;
    },
    countAnswer: (k: number, spread: string, top: { name: string; count: number }[]) => `名冊上有 ${n(k)} 間，${spread}${top.length ? `。最集中：${top[0].name}，${n(top[0].count)} 間${top[1] ? `；之後是${top[1].name}，${n(top[1].count)} 間` : ""}` : ""}。`,
    howMany: (c: Country) => <>點算{cnOf(c)}的 Apple Store</>,
    duoNow: (c: Country, k: number, have: Store[]): FaqItem => ({
      q: `此刻${cnOf(c)}哪幾間 Apple Store 的架上有 iPhone Duo？`,
      a: have.length === 0 ? `最新一次觀察，${n(k)} 間全部不在架。任何一間重新上架，本頁及取貨地圖會即時更新，監察清單會第一個通知你。` : `最新一次觀察，${n(have.length)}/${n(k)} 間在架：${have.slice(0, 6).map((x) => apple(x)).join("、")}${have.length > 6 ? "等" : ""}。`,
    }),
    faq: (ctx: FaqContext) => {
      const cc = ctx.stores[0]?.country ?? "us";
      const peak = ctx.peak ? { hour: hrFromEn(ctx.peak.hour), day: ctx.peak.day ? dayFromEn(ctx.peak.day) : null, total: ctx.peak.total } : ctx.peak;
      return placeFaq({ ...ctx, place: zhPlace(cc, ctx.place), peak, omit: [...(ctx.omit ?? []), "count", "stock", "lasts"] }, L);
    },
    duoBlock: (alert: string) => `把去得到的店放進監察清單，是最實際的做法：[開一張 iPhone Duo 監察清單](${alert})。一間店 × 一個指定配置計一項，任何一項回架，推送提示很快就到。`,
    intro: (c: Country, k: number, spread: string, now: { duo: number; max: number; pro: number }, tax: string) => `名冊上${cnOf(c)}有 **${n(k)} 間 Apple Store**，${spread}。最新一次觀察：iPhone Duo 在 **${n(now.duo)}** 間在架，iPhone 18 Pro Max **${n(now.max)}** 間，18 Pro **${n(now.pro)}** 間。${tax}`,
    crumb: "零售店名冊",
    panel: (c: Country) => `你在${cnOf(c)}的監察清單：先揀手機，再只揀去得到的店`,
    matrixLabel: "逐店架況",
    matrixH2: (c: Country) => <>{cnOf(c)}各型號的在架數</>,
    matrixHint: "每款型號：最新觀察時在架／追蹤中的配置數。",
    topCaption: (c: Country) => <>Apple Store 數目最多的{rn(c)}（以 Apple 零售店列表為準，也就是本觀察簿的範圍）</>,
    regionHead: (c: Country) => rn(c),
    colStores: "Apple Store",
    colCities: "城市",
    locationsBy: (c: Country) => `零售店名冊 · 逐個${rn(c)}`,
    locationsIn: (c: Country) => `${cnOf(c)}零售店名冊`,
    storeCount: (k: number) => <>{n(k)} 間 Apple Store</>,
    storeCountAll: (k: number) => <>共 {n(k)} 間</>,
    whenRestock: (c: Country) => <>{cnOf(c)}的回架時間</>,
    howFast: (c: Country) => <>{cnOf(c)}每次在架多久</>,
    faqTitle: (c: Country) => `關於${cnOf(c)}零售店的實地問答`,
    getApp: "安裝網頁 App",
    howItWorks: "方法筆記",
    pricing: "方案及價錢",
  },

  restockTimes: {
    fmt: {
      n,
      pct,
      date: (d: string, weekday = true) => ymd(d, weekday),
      longDate: longYmd,
      zoneStamp: (iso: string, c: Country) => zoneStampZh(iso, c.cc),
      local: (iso: string, store: Pick<Store, "storeNumber" | "country" | "timeZone" | "state">) => localStamp(iso, store, L),
      hour: (h: number) => hr(h),
      range: (from: number, to: number) => rng(from, to),
      weekday: (d: number) => WEEK[d],
      store: (s: Store) => apple(s),
      storeWithPlace: (s: Store) => { const a = apple(s); const c = city(s); return a.includes(c) ? a : `${c} · ${a}`; },
    },
    title: (c: Country) => `${cnOf(c)} iPhone Duo 回架時間：觀察記錄`,
    metaDescription: (x: RestockTimesMeta) => {
      const { c, t, w, pattern } = x;
      const rw = c.cc === "us" ? "州" : c.regionNoun ? rn(c) : null;
      /** "按鐘數、日子、店舖及配置" from the parts that apply. */
      const by = (...parts: (string | null)[]) => { const p = parts.filter((x): x is string => Boolean(x)); return `按${p.slice(0, -1).join("、")}及${p[p.length - 1]}`; };
      const since = ymd(t.since, false);
      const w2 = cnOf(c);
      return t.n > 0 && pattern
        ? fitW([
          `${w2} iPhone Duo 回架記錄：自${since}起錄得 ${n(t.n)} 次，${pct(w.share)} 集中在店舖時間${rng(w.from, w.to)}${t.sellout ? `，${pct(t.sellout.within2min)} 在 2 分內落架` : ""}。${by("鐘數", "日子", rw, "店舖", "配置")}分表。`,
          `${w2} iPhone Duo 回架記錄：自${since}起錄得 ${n(t.n)} 次，${pct(w.share)} 集中在店舖時間${rng(w.from, w.to)}。${by("鐘數", "日子", rw, "配置")}分表。`,
          `${w2} iPhone Duo 回架記錄：${since}至今 ${n(t.n)} 次，${by("鐘數", "日子", rw, "配置")}分表。`,
        ], 158)
        : t.n > 0
          ? fitW([
            `${w2} iPhone Duo 回架記錄：自${since}起錄得 ${n(t.n)} 次，${by("店舖鐘數", "日子", rw, "店舖", "配置")}分表，並記下每次在架多久。`,
            `${w2} iPhone Duo 回架記錄：${since}至今 ${n(t.n)} 次，${by("鐘數", "日子", rw, "配置")}分表。`,
          ], 158)
          : `${w2} iPhone Duo 回架記錄：ShelfSpring 自${longYmd(t.since)}開簿，逐小時、逐日、按店舖及配置整理觀察結果。`;
    },
    h1: (x: RestockTimesView) => x.t.unknown
      ? `${cnOf(x.c)} iPhone Duo 回架記錄`
      : x.t.n > 0
        ? `${cnOf(x.c)} iPhone Duo 回架記錄：${x.pattern ? `多數錄得於店舖時間${rng(x.w.from, x.w.to)}` : "逐小時觀察所得"}`
        : `${cnOf(x.c)} iPhone Duo 回架記錄：開簿至今未錄得回架`,
    intro: (x: RestockTimesView) => {
      const { t, one, tracked, pattern, w } = x;
      const where = cnOf(x.c);
      return t.unknown ? (
        <>這次未能讀取回架記錄；{where}的店舖照常每 {SPEED.checkSec} 秒查看一次，下次載入本頁便會補回數字。</>
      ) : t.n > 0 ? (
        <>
          <b className="text-ink">錄得 {n(t.n)} 次。</b>自{longYmd(t.since)}開簿，{one ? `${where}的 Apple Store` : `${where}各間 Apple Store`}共錄得 iPhone Duo 回架 <b className="text-ink">{n(t.n)} 次</b>{tracked > 1 ? <>，{n(tracked)} 個追蹤日裏有 {n(t.days)} 日出現回架</> : <>（暫時只追蹤了一日）</>}
          {pattern && <>，<b className="text-ink">{pct(w.share)} 集中在店舖時間{rng(w.from, w.to)}</b></>}。
        </>
      ) : (
        <>
          <b className="text-ink">開簿至今未錄得回架。</b>ShelfSpring 自{longYmd(t.since)}起每 {SPEED.checkSec} 秒查看{one ? `${where}的 Apple Store` : `${where}全部 ${n(x.stores)} 間 Apple Store`}一次，暫時一次 iPhone Duo 取貨回架都未確認。
        </>
      );
    },
    hero: {
      restocks: (x: RestockTimesView) => `自${ymd(x.t.since, false)}起錄得的回架`,
      window: (x: RestockTimesView) => `集中在${rng(x.w.from, x.w.to)}（店舖時間）`,
      days: "出現過回架的日子",
      // English infers a literal return type here; the cast keeps the same signature.
      now: ((one: boolean): string => (one ? "此刻在架（1 = 是）" : "間店此刻在架")) as Dict["views"]["restockTimes"]["hero"]["now"],
      today: (x: RestockTimesView, today: DayRow) => `今日 ${ymd(today.date)}${x.one ? "" : ` · ${n(today.stores)} 間店`} · 進行中`,
      weekday: "暫時回架最多的星期",
    },
    heroPoints: (x: RestockTimesView, latest: { config: string; store: Store; at: string } | null): Point[] => [
      ...(latest ? [{ text: <>最新一筆：<b className="text-ink">{latest.config}</b>{x.one ? null : <>，<Link href={storePath(latest.store)} className="underline underline-offset-2">{apple(latest.store)}</Link></>}，店舖時間 {localStamp(latest.at, latest.store, L)}</> }] : []),
      ...(x.t.peakWeekday != null ? [{ text: <>星期分佈的高峰：<b className="text-ink">{WEEK[x.t.peakWeekday]}</b></> }] : []),
      { text: <>Apple <b className="text-ink">從不預告回架時間</b>；以上是本觀察簿自己確認的結果，大約每 5 分鐘刷新</>, no: true },
    ],
    emptyPoints: (x: RestockTimesView): Point[] => [
      { text: <>此刻 <b className="text-ink">{n(x.duoNow)}/{n(x.stores)} 間</b>在架可取</> },
      { text: <>第一次確認回架之後，下面的表格就會開始有內容</>, step: true },
      { text: <>鐘數和星期的規律，樣本最多的是<Link href="/iphone-duo-restock-times" className="underline underline-offset-2">美國版記錄</Link></>, step: true },
    ],
    setUpAlert: "開一張 iPhone Duo 監察清單",
    logLive: "打開即時回架記錄",
    onThisPage: "本頁分節",
    nav: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": "鐘數",
      "day-by-day": "日曆",
      where: `地點（${regionWordOf(x)}）`,
      configuration: "配置",
      "how-long": "在架長度",
      unavailable: "顯示無貨？",
      reddit: "論壇說法",
      method: "計算規則",
    }),
    h2: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": `${cnOf(x.c)}的 iPhone Duo 回架多數落在哪個鐘數？`,
      "day-by-day": `${cnOf(x.c)}哪些日子出現過 iPhone Duo 回架？`,
      where: `${cnOf(x.c)}回架次數最多的是哪幾間 Apple Store？`,
      configuration: `${cnOf(x.c)}哪個 iPhone Duo 配置最常回架？`,
      "how-long": `${cnOf(x.c)}的 iPhone Duo 每次回架，在架多久？`,
      unavailable: "為甚麼大部分時間每間店都顯示無貨？",
      reddit: "論壇上的 iPhone Duo 回架傳聞，逐條對照記錄",
      method: "這本觀察簿怎樣算一次回架？",
    }),
    faq: (x: RestockTimesView): Faq[] => {
      const { t, w, pattern, sell, us, weekend, tracked } = x;
      const where = cnOf(x.c);
      const window = rng(w.from, w.to);
      return [
        { q: `${where}的 iPhone Duo 回架通常在幾點出現？`, a: t.n > 0 && pattern
          ? `${w.from < 12 ? "多數在早上。" : ""}開簿（${longYmd(t.since)}）以來錄得 ${n(t.n)} 次回架：店舖時間${window}佔 ${pct(w.share)}，上午 8 點至中午 12 點佔 ${pct(hourShare(t.byHour, 8, 12))}。Apple 從不預告；這是本觀察簿看到的規律，大約每 5 分鐘刷新。`
          : `Apple 從不預告回架。本觀察簿自${longYmd(t.since)}起在${where}錄得 ${n(t.n)} 次確認回架${t.days ? `，散落在 ${n(t.days)} 日` : ""}；要有 ${PATTERN_MIN} 次回架、橫跨 ${PATTERN_MIN_DAYS} 個日子，本觀察簿才會寫出慣常鐘數，本頁會自動更新。` },
        { q: `${us ? "" : `${where}的 `}iPhone Duo 週末也會回架嗎？`, a: t.n > 0
          ? `${weekend > 0 ? "會，到目前為止有" : "暫時未見"}：${n(t.n)} 次回架裏，星期六、日佔 ${n(weekend)} 次（${pct(weekend / t.n)}）。${t.peakWeekday != null ? `回架最多的是${WEEK[t.peakWeekday]}。` : `記錄跨越 ${WEEKDAY_MIN_SPAN} 日之後才會點名哪一日最多；現時有 ${n(tracked)} 日。`}`
          : `${where}暫時未有週末的記錄；本頁的日曆表會隨確認回架逐日填上。` },
        { q: "想自己留意，應該由幾點開始？", a: t.n > 0 && pattern
          ? `${pct(w.share)} 的回架落在店舖時間${hr(w.from)}開始的兩小時，那段時間開着 apple.com、預先選好店舖取貨最划算。不過一次回架${sell ? `的在架中位數只有 ${n(sell.medianSec)} 秒` : "大約只在架一分鐘"}，人手刷新很難追上；監察清單每 ${SPEED.fastSec} 秒查看一次（[監察清單的運作](/iphone-duo-stock-alerts)）。`
          : `${where}的規律未清楚之前，交給監察清單留意：你揀的店每 ${SPEED.fastSec} 秒查看一次，日夜不停（[監察清單怎樣運作](/iphone-duo-stock-alerts)）。` },
        { q: "為甚麼每間 Apple Store 大部分時間都顯示 iPhone Duo 無貨？", a: sell
          ? `回架太短暫：本觀察簿在${where}量度了 ${n(sell.n)} 次落架的回架，${pct(sell.within2min)} 在 2 分內落架，${pct(sell.within20min)} 在 20 分內。此刻 ${n(x.duoNow)}/${n(x.stores)} 間在架；就算一日回架幾十次，其餘時間 apple.com 照實顯示的仍是無貨（[無貨代表甚麼](/apple-store-pickup-availability-explained)）。`
          : `取貨存貨每次只露面幾分鐘。此刻${where} ${n(x.duoNow)}/${n(x.stores)} 間店在架（[無貨代表甚麼](/apple-store-pickup-availability-explained)）。` },
        { q: "我那間 Apple Store 有 iPhone Duo 回架時，怎樣第一時間知道？", a: `把那間店和指定的容量、機色加入監察清單：之後該店每 ${SPEED.fastSec} 秒查看一次，確認回架後約 ${SPEED.alertSec} 秒推送到你的手機（[開監察清單](${x.alert})；[方法筆記](/how-it-works)）。` },
      ];
    },
    sources: {
      applePickup: "Apple 自家說明：「送貨及取貨」",
      newsroom: "「iPhone Duo 抵達全球各地 Apple Store」· Apple 新聞稿，2026 年 10 月 23 日",
      macRumors: "「美國及加拿大的 iPhone Duo Apple Store 取貨系統再度上線」· MacRumors 報道，2026 年 10 月 24 日",
      reports: (tracker: string) => `${tracker}，發售週的 iPhone Duo 筆記：與本觀察簿分開存放，從不計入`,
    },
    ld: (x: RestockTimesView) => ({
      datasetName: `${cnOf(x.c)} Apple Store 的 iPhone Duo 補貨時間`,
      description: `自 ${x.t.since} 起${cnOf(x.c)} Apple Store 每一次已確認的 iPhone Duo 店舖取貨補貨，附分店、款式及時間，來自 ShelfSpring 每 ${SPEED.checkSec} 秒一次的檢查；按當地鐘點、日子、${regionWordOf(x)}、分店及款式匯總。`,
      spatial: `${cnOf(x.c)} Apple Store`,
      measured: ["補貨時間（分店當地時間）", "Apple Store", "iPhone Duo 容量及顏色", "售罄前的秒數"],
      size: `${n(x.t.stores)} 間分店共 ${n(x.t.n)} 次補貨`,
    }),
    crumb: "iPhone Duo 回架記錄",

    timeLead: (x: RestockTimesView) => <b>上午 8 點至中午 12 點佔 {pct(hourShare(x.t.byHour, 8, 12))}；最密集的兩小時是店舖時間{rng(x.w.from, x.w.to)}，佔 {n(x.t.n)} 次回架的 {pct(x.w.share)}。</b>,
    busiestHour: (count: number) => `最高的單一鐘數：回架 ${n(count)} 次`,
    morning: "上午 8 點 → 中午 12 點",
    evening: "下午 5 點以後：夜間也有回架",
    night: "午夜 → 上午 6 點",
    tooFew: (x: RestockTimesView) => <b>{yet(x)}未夠日子歸納鐘數：開簿（{longYmd(x.t.since)}）以來只有 {n(x.t.days)} 日錄得回架，共 {n(x.t.n)} 次。</b>,
    tooFewKeys: (): Point[] => [
      { text: <>歸納慣常鐘數的門檻：<b className="text-ink">{PATTERN_MIN} 次回架，橫跨 {PATTERN_MIN_DAYS} 個日子</b></> },
      { text: <>同一刻連續回架 10 次只算一個事件，說明不到習慣</>, no: true },
      { text: <>日子夠了，本頁的結論會自動更新</>, step: true },
    ],
    hourCaption: (x: RestockTimesView) => `${cnOf(x.c)}錄得的 iPhone Duo 回架，按店舖時間逐小時，${ymd(x.t.since, false)} → 今日，合共 ${n(x.t.n)} 次`,
    hourHead: ["店舖時間（24 小時制）", "回架", "佔記錄 %"],
    morningKeys: (x: RestockTimesView): Point[] => [
      { text: <>早上回架多，<b className="text-ink">跟開門無關</b>{x.us ? "：美國多數 Apple Store 上午 10 點才營業" : ""}</> },
      { text: <>取貨存貨是<b className="text-ink">在網上</b>放出來的，比落閘開舖更早</> },
      { text: <>想自己刷：平日留意店舖時間 <b className="text-ink">{rng(x.w.from, x.w.to)}</b></>, step: true },
      { text: <>一日其餘 <b className="text-ink">22 小時</b>，交給<Link href={x.alert}>監察清單</Link>就夠</>, step: true },
    ],
    storeChartKeys: (x: RestockTimesView): Point[] => [{ text: <>每間店的頁面都按該店時區畫了自己的鐘數圖（<Link href={x.storesHref}>{x.us ? "按州翻查 Apple Store" : `${cnOf(x.c)}零售店名冊`}</Link>）：附近多數店 9 點才回架、偏偏有一間 8 點就回架，這種店值得記住</>, step: true }],

    dayLead: (x: RestockTimesView) => {
      const { t, tracked, one } = x;
      return t.n > 0 && tracked === 1 ? (
        <b>暫時只有一日的記錄（{ymd(t.daily[t.daily.length - 1]?.date ?? t.since)}）：錄得 {n(t.n)} 次回架{one ? "" : `，涉及 ${n(t.stores)} 間店`}。</b>
      ) : t.n > 0 ? (
        <b>{t.days === tracked ? `追蹤的 ${n(t.days)} 日，日日都錄得回架` : `開簿（${longYmd(t.since)}）至今 ${n(tracked)} 日，其中 ${n(t.days)} 日錄得回架`}{t.peakWeekday != null ? `；回架最多的是${WEEK[t.peakWeekday]}` : ""}。</b>
      ) : (
        <b>{cnOf(x.c)}自{longYmd(t.since)}開簿以來，未錄得任何確認回架。</b>
      );
    },
    daysTracked: "錄得回架的日子",
    busiestDay: (x: RestockTimesView, day: DayRow) => `回架最多的一日：${ymd(day.date)}${x.one ? "" : ` · ${n(day.stores)} 間店`}`,
    busiestDayNone: "回架最多的一日",
    drop: (x: RestockTimesView, drop: { at: string; restocks: number }) => `同一個半小時內有回架的店數，${zoneStampZh(drop.at, x.c.cc)}（${n(drop.restocks)} 個配置）：這就是一次${x.c.cc === "hk" ? "全港" : "全國"}放貨留下的痕跡`,
    weekend: (x: RestockTimesView) => `星期六、日佔的回架（${n(x.weekend)} 次）`,
    dayCaption: (x: RestockTimesView) => `${cnOf(x.c)}錄得的 iPhone Duo 回架，逐個日曆日列出${x.t.reports.length ? "。標明「報告」的灰色行，來自其他追蹤者在本觀察簿開簿前公開的筆記，只用來補足時間線，任何總數都不包括它們" : ""}`,
    dayHead: { date: "日子", restocks: "回架", stores: "店舖", busiest: "高峰鐘數（24 小時制）", source: "記錄者" },
    soFar: " · 進行中",
    reportedBy: (names: string[]) => <>據 {names.join(" / ")}</>,
    dayKeys: (x: RestockTimesView, launch: string, resumed: string): Point[] => [
      { text: <><b className="text-ink">{ymd(launch)}</b>：開賣當日，首批貨先供應網上訂單</> },
      { text: <><b className="text-ink">{ymd(resumed)}</b>：恢復接受店舖取貨訂單{x.us ? "（MacRumors）" : ""}</> },
      x.t.reports.length
        ? { text: <>灰色的<b className="text-ink">報告</b>行：{x.reportNames.join(" 及 ")} 在發售週的筆記，不計入總數</> }
        : { text: <>本觀察簿對{cnOf(x.c)}各店的記錄始於 <b className="text-ink">{longYmd(x.t.since)}</b></> },
      ...(x.t.n > 0 && x.t.peakWeekday == null ? [{ text: <>星期高峰：記錄要跨越 <b className="text-ink">{WEEKDAY_MIN_SPAN} 日</b>才會點名（現時 {n(x.tracked)} 日）</>, no: true }] : []),
      { text: <>看<b className="text-ink">店舖</b>一欄：同樣的回架次數散落在越多間店，對你越有利</>, step: true },
    ],

    whereLead: (x: RestockTimesView, hit: { name: string; restocks: number; stores: number; storesTotal: number }[], total: number) => (
      <b>{hit[0].name}居首：自{ymd(x.t.since, false)}起錄得 {n(hit[0].restocks)} 次回架，{n(hit[0].storesTotal)} 間店之中有 {n(hit[0].stores)} 間出現過{hit[1] ? <>；跟着是{hit[1].name}（{n(hit[1].restocks)}）</> : null}{hit[2] ? <>和{hit[2].name}（{n(hit[2].restocks)}）</> : null}。{n(total)} 個{regionWordOf(x)}裏，{n(hit.length)} 個錄得回架{total - hit.length > 0 ? `，${n(total - hit.length)} 個仍是空白` : ""}。</b>
    ),
    whereNone: (x: RestockTimesView) => <b>{cnOf(x.c)}暫時沒有一個{regionWordOf(x)}錄得確認回架；第一筆出現後，表格便會填上。</b>,
    regionCaption: (x: RestockTimesView) => `${cnOf(x.c)}逐個${regionWordOf(x)}錄得的 iPhone Duo 回架，${ymd(x.t.since, false)} → 今日`,
    regionHead: (x: RestockTimesView) => [regionWordOf(x), "回架", "曾回架的店", "最新（店舖時間）"],
    ofN: (a: number, b: number) => <>{n(a)}/{n(b)}</>,
    storesCaption: (x: RestockTimesView) => `${cnOf(x.c)} iPhone Duo 回架記錄最長的店，${ymd(x.t.since, false)} → 今日`,
    storesHead: ["店舖", "回架", "有回架的日數", "慣常鐘數", "最新（店舖時間）"],
    swaps: (x: RestockTimesView) => [
      { no: "只認回架最多的那間，不理距離", yes: `${x.pattern ? hr(x.w.from) : "早上"}左右，一小時車程內的兩三間店`, why: "去不到的回架等於沒有；最常回架的店，每日真正在架的時間也不過幾分鐘。" },
      { no: "死守一間店碰運氣", yes: "每間都放進監察清單，誰先響就先去誰", why: "回架次數表只幫你排先後：你那幾間店，先去哪一間。" },
    ],
    nearMe: "我附近此刻有 Duo 在架的店",

    configLead: (x: RestockTimesView, top: { label: string; restocks: number }, rarest: { label: string; restocks: number } | null) => (
      <b>{top.label}佔最多：{n(x.t.n)} 次回架中有 {n(top.restocks)} 次（{pct(top.restocks / x.t.n)}）{rarest ? `；最少見的是 ${rarest.label}，只錄得 ${n(rarest.restocks)} 次` : ""}。</b>
    ),
    mostRestocked: (config: string) => `${config}：回架次數最多的配置`,
    versus: (a: string, bCount: number, b: string) => `${a} 的回架次數（${b}：${n(bCount)} 次）`,
    restocksOf: (a: string) => `${a} 的回架次數`,
    byStorage: "按容量分",
    byColour: "按機色分",
    configNone: (x: RestockTimesView) => <b>{cnOf(x.c)}暫時沒有任何配置錄得確認回架；8 個配置先排好，第一筆回架一出現就填上。</b>,
    configCaption: (x: RestockTimesView) => `${cnOf(x.c)}錄得的 iPhone Duo 回架，每個配置一行，${ymd(x.t.since, false)} → 今日`,
    configHead: ["配置", "回架", "佔記錄 %", "最新（店舖時間）"],
    configKeys: (x: RestockTimesView): Point[] => [
      { text: <>揀配置<b className="text-ink">比揀店重要</b></> },
      x.storageRatio != null
        ? { text: <>肯要回架最多的那個容量，勝算大約是下一級的 <b className="text-ink">{x.storageRatio}×</b></> }
        : { text: <>肯要回架最多的那個容量，勝算<b className="text-ink">高得多</b></> },
      { text: <><b className="text-ink">2TB</b>：比較適合網上落單、等送貨</>, no: true },
      { text: <>價錢及此刻架況：<Link href="/which-iphone-duo-restocks-most">哪個 iPhone Duo 配置最常回架？</Link></>, step: true },
    ],

    howLongLead: (x: RestockTimesView, sell: SelloutFacts) => <b>{cnOf(x.c)}量度了 {n(sell.n)} 次落架的回架：中位數 {n(sell.medianSec)} 秒；2 分內落架佔 {pct(sell.within2min)}，20 分內佔 {pct(sell.within20min)}。</b>,
    secUnit: "秒",
    medianListing: "在架時間中位數",
    within2: "2 分內落架",
    within20: "20 分內落架",
    fastest: "量到最短的在架",
    howLongNone: (x: RestockTimesView) => <b>{cnOf(x.c)}已落架的回架{yet(x)}太少，量不出數字；要累積到 10 次才會公開，完整數據可看美國版記錄。</b>,
    howLongKeys: (x: RestockTimesView): Point[] => [
      { text: <>兩分鐘的空檔要靠<b className="text-ink">監察清單</b>接住，刷新 apple.com 追不上</> },
      { text: <>本頁其餘的數字，都要從這一個讀起</> },
      { text: <>每次回架在架幾秒，按配置及{regionWordOf(x)}分開：<Link href="/iphone-duo-sell-out-times">iPhone Duo 回架在架多久？</Link></>, step: true },
    ],
    measured: "這些數字是上限：起點是首次見到某配置在架的那次查看，終點是見到它消失的那次查看；真正在架的時間只會更短。",

    unavailableLead: (x: RestockTimesView) => <b>{cnOf(x.c)}有 {n(x.pairs)} 個可能在架的「店 × 配置」組合（{x.one ? "一間店" : `${n(x.stores)} 間店`} × {n(x.configs)} 個配置），此刻有 iPhone Duo 在架的店只有 {n(x.duoNow)} 間：回架只是一瞬間，不是常態。</b>,
    pairs: "可能在架的「店 × 配置」組合",
    listingNow: "此刻有 iPhone Duo 在架可取",
    goneIn2: "的回架 2 分內落架",
    last24: "近 24 小時錄得的回架",
    unavailableKeys: (x: RestockTimesView, today: number): Point[] => [
      x.recent.restocks > 0
        ? { text: <>近 24 小時：{cnOf(x.c)} {n(x.recent.stores)} 間店合共<b className="text-ink">錄得 {n(x.recent.restocks)} 次回架</b></> }
        : today > 0
          ? { text: <>今日：{cnOf(x.c)}<b className="text-ink">錄得 {n(today)} 次回架</b></> }
          : { text: <>上面的日曆表列出的，都是真正發生過的回架</> },
      { text: <>每一次在 apple.com 上只停留<b className="text-ink">一兩分鐘</b></> },
      { text: <>開賣後第 4 日、第 14 日仍「間間無貨」，<b className="text-ink">並不代表</b> Apple 停止供應</>, no: true },
    ],
    unavailableLinks: { explained: "店舖取貨顯示無貨，背後代表甚麼", howToGet: "買到 iPhone Duo 的實際路線" },

    redditLead: (x: RestockTimesView) => <b>對照{cnOf(x.c)}已確認的 {n(x.t.n)} 次回架，逐條檢查 <a href="https://www.reddit.com/r/applestore/" target="_blank" rel="noopener nofollow">r/applestore</a> 及 <a href="https://www.reddit.com/r/iphone/" target="_blank" rel="noopener nofollow">r/iphone</a> 最常見的四個說法——這些經驗分享多數出於好意，但往往只看一間店，而且隔日已經過時。</b>,
    redditCaption: "論壇常見的 iPhone Duo 回架說法 × ShelfSpring 確認記錄",
    redditHead: ["坊間說法", "記錄顯示"],
    claims: (x: RestockTimesView): { claim: string; answer: ReactNode }[] => {
      const { t, w, tracked, recent } = x;
      return [
        { claim: "「深夜先會回架，凌晨 3 點去睇。」", answer: t.n > 0 ? <>凌晨 0 點至 6 點（店舖時間）只佔 {pct(hourShare(t.byHour, 0, 6))} 的回架；{rng(w.from, w.to)}則佔 {pct(w.share)}。</> : "暫時未有回架記錄可以對照。" },
        { claim: "「Apple 只揀某一日回架。」", answer: t.n > 0 ? (t.peakWeekday != null ? <>暫時以{WEEK[t.peakWeekday]}最多（{n(t.n)} 次中佔 {n(t.byWeekday[t.peakWeekday])} 次），不過 {n(tracked)} 日裏有 {n(t.days)} 日都錄得回架。</> : <>追蹤的 {n(tracked)} 日裏，{n(t.days)} 日錄得回架{t.days === tracked ? "，一日都沒有落空" : ""}；記錄跨越 {WEEKDAY_MIN_SPAN} 日之後才會點名哪一日最多。</>) : "暫時未有回架記錄可以對照。" },
        { claim: "「打去店舖問幾時有貨到。」", answer: "Apple 不預告回架；apple.com 上出現的取貨存貨是在網上放出來的，店員和大家同一時間才看到。" },
        { claim: "「顯示無貨，即係賣斷咗。」", answer: recent.restocks > 0 ? <>近 24 小時 {n(recent.stores)} 間店錄得 {n(recent.restocks)} 次回架，足以推翻這個說法，而且每次不消幾分鐘又變回無貨。</> : t.n > 0 ? <>自{ymd(t.since, false)}起錄得的 {n(t.n)} 次回架已推翻這個說法，而且每次不消幾分鐘又變回無貨。</> : "暫時未有數據可以對照。" },
      ];
    },
    redditKeys: (): Point[] => [
      { text: <>沒有<b className="text-ink">記錄</b>可查，傳聞才會流行；本頁就是記錄，任何人都可以看</> },
      { text: <>論壇講得對的一點：<b className="text-ink">結帳要快</b>——預先登入、Apple Pay 準備就緒（<Link href="/how-to-grab-an-iphone-duo-restock">20 秒結帳步驟</Link>）</> },
    ],

    methodLead: <b>計一次回架的條件：apple.com 讓某間原本不在架的店開放某個配置的店舖取貨，而且連續兩次查看結果一致。</b>,
    methodKeys: (x: RestockTimesView): Point[] => [
      { text: <>{x.one ? `${cnOf(x.c)}的 Apple Store ` : `${cnOf(x.c)}每間 Apple Store `}每 <b className="text-ink">{SPEED.checkSec} 秒</b>查看一次；監察清單上的店每 <b className="text-ink">{SPEED.fastSec} 秒</b></> },
      { text: <>其他追蹤者公布的間隔介乎 <b className="text-ink">8 秒至 15 分鐘</b>；我們只拿對方公布的數字比較</> },
      { text: <>第一次出現的「在架」，隔<b className="text-ink">大約一秒</b>會覆查，通過才入簿</> },
      { text: <>上架消失，在<b className="text-ink">下一輪</b>查看時確認</> },
      { text: <>店舖首次被查看、請求失敗或逾時：<b className="text-ink">一律不</b>當作回架，也不當作無貨</>, no: true },
      { text: <>鐘數和日期一律用各店的<b className="text-ink">店舖時間</b>；「放貨潮」指不同時區落在同一個半小時的回架</> },
      { text: <>其他追蹤者的報告{x.t.reports.length ? `（${x.reportNames.join("、")}）` : ""}：另行標示，<b className="text-ink">任何總數都不包括</b></> },
      { text: <>大約每 5 分鐘刷新；<Link href={x.logHref}>回架記錄</Link>則是即時寫入</>, step: true },
    ],
    quote: "引用這些數字時，請連結回本頁。ShelfSpring 是獨立的觀察簿，跟 Apple 沒有任何業務關係；我們看的取貨狀態，任何人上 apple.com 都看得到，分別只在於我們看得更密。",
    alertIn: (x: RestockTimesView) => <>{x.one ? "" : `${cnOf(x.c)} · `}開一張 iPhone Duo 監察清單</>,

    related: "同一本觀察簿的其他頁",
    sameData: "這本觀察簿答得到的問題",
    questions: {
      sellOut: "一次回架在架多久？",
      alerts: "第一時間知道回架",
      howToGet: "實際買到的路線",
      whichConfig: "哪個配置最常回架",
      nearMe: "附近哪幾間店此刻在架",
      unavailable: "「無法取貨」代表甚麼",
    },
    otherCountries: ((us: boolean): string => (us ? "其他國家的同一份研究" : "其他市場的記錄")) as Dict["views"]["restockTimes"]["otherCountries"],
    faqTitle: "實地問答",
  },
};

export const views: Dict["views"] = withShelfViews("zh-HK", baseViews);
