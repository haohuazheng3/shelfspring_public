import { withShelfViews } from "@/lib/seo/localizedCopy";
/**
 * 台灣中文：views —— 產品 × 地點頁、補貨紀錄、即時地圖、iPhone Duo 補貨時段頁與門市索引。
 * `c: Country` 是英文資料，國名一律用 places.countryLabel；`Store`／`Place` 物件也是英文資料，店名、城市、
 * 地區用 places.ts 換成 Apple 台灣的寫法。檢查間隔只寫 15 秒與 5 秒；不提退款。
 */
import type { ReactNode } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import type { Point } from "@/components/ui/Viz";
import type { Faq } from "@/lib/content/types";
import { catalogFor, storePath, storeTimeZone, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type Country, type CountryCode } from "@/lib/apple/countries";
import { faq as placeFaq, fmtDuration, peakOf, type FaqContext, type FaqItem } from "@/lib/seo/enrich";
import type { Place, Product } from "@/lib/seo/products";
import type { StoreLine } from "@/lib/seo/productData";
import type { PlaceStats, RestockStats } from "@/lib/stock/queries";
import { hourShare, type DayRow, type SelloutFacts } from "@/lib/content/restockTimes";
import { PATTERN_MIN, PATTERN_MIN_DAYS, WEEKDAY_MIN_SPAN } from "@/lib/content/siteFacts";
import type { Dict } from "../en";
import type { RestockTimesMeta, RestockTimesView } from "../en/views";
import { distance, fitTitleW, list, num, price } from "../../format";
import { appleStoreLabel, cityLabel, configLabel, regionLabel, storeLabel } from "../../places";
import { L, cn, hh, hrange, longYmdZh, n, regionZh, stampZh, taxNoteZh, weekdayZh, ymdZh, zhCfg, zoneName, zs } from "./util";

/* ---------------------------------------------------------------- 小工具 */

type RTMeta = RestockTimesMeta;
type RTView = RestockTimesView;

const C = (c: Country) => cn(c.cc);
/** 百分比；不到 0.5% 寫「<1%」。 */
const pc = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
/** 「11 月 2 日 上午 9:30（台北標準時間）」：國家參考時區。 */
const zoneStamp = (iso: string, c: Country) => `${stampZh(iso, c.timeZone)} ${zoneName(c.timeZone, iso)}`;
/** 門市當地時間：「11 月 2 日 下午 2:31」。 */
const local = (iso: string, store: Pick<Store, "storeNumber" | "country" | "timeZone" | "state">) => stampZh(iso, storeTimeZone(store as Store));
/** 補貨時段頁按地區分組時的名詞：美國「州」，其他國家依 regionNoun，沒有就是「門市」。 */
const rtRegion = (x: { us: boolean; c: Country }) => (x.us ? "州" : x.c.regionNoun ? regionZh(x.c) : "地區");
const apple = (s: Store) => appleStoreLabel(s, L);
/** 地點（英文資料）→ 中文名。 */
function placeName(place: Place): string {
  const code = place.country ?? "us";
  if (place.level === "country") return cn(code);
  if (place.level === "state") return regionLabel(code, place.state!, L);
  if (place.level === "city") return cityLabel(code, place.city!, L);
  return appleStoreLabel(place.store!, L);
}

/* ---------------------------------------------------------------- 產品 × 地點頁的標題、描述與 FAQ */

function productTitle(product: Product, place: Place, inStock: number): string {
  const code = place.country ?? "us";
  const k = place.stores.length;
  const name = zhCfg(product.name);
  const short = zhCfg(product.short);
  const w = placeName(place);
  if (place.level === "country") {
    return fitTitleW([
      ...(inStock > 0 ? [`${name}現貨：${w} ${n(inStock)} 家 Apple ${code === "us" ? "Store" : "直營店"}有貨`] : []),
      `${w} ${name}門市取貨即時現貨`,
      `${w} ${short}門市取貨現貨`,
      `${short}門市取貨現貨`,
    ].map(zs));
  }
  if (place.level === "store") {
    const s = place.store!;
    return fitTitleW([
      `${w} ${name}：${inStock > 0 ? "現在有貨" : "門市取貨現貨"}`,
      `${w}（${cityLabel(code, s.city, L)}）${short}現貨`,
      `${w} ${short}現貨`,
      `${storeLabel(s, L)} ${short}`,
    ].map(zs));
  }
  return fitTitleW([
    `${w} ${name}現貨：${n(k)} 家中 ${n(inStock)} 家有貨`,
    `${w} ${name}門市取貨現貨`,
    `${w} ${short}現貨`,
    `${w} ${short}`,
  ].map(zs));
}

function productDescription(product: Product, place: Place, inStock: number, stats: PlaceStats): string {
  const code = place.country ?? "us";
  const name = zhCfg(product.name);
  const week = `本週補貨 ${n(stats.week)} 次`;
  if (place.level === "store") {
    const s = place.store!;
    return fitTitleW([
      `${apple(s)}（${cityLabel(code, s.city, L)}）的 ${name}門市取貨現貨：${inStock > 0 ? "現在有貨" : "目前沒貨"}，${week}。即時狀態、補貨時段與通知。`,
      `${apple(s)} 的 ${name}：${inStock > 0 ? "現在有貨" : "目前沒貨"}，${week}。即時狀態與通知。`,
    ].map(zs), 155);
  }
  const where = place.level === "country" ? `${cn(code)}的 ${code === "us" ? "Apple Store" : "Apple 直營店"}` : `${placeName(place)}的 Apple 直營店`;
  return fitTitleW([
    `${name}門市取貨現貨：${where}共 ${n(place.stores.length)} 家，現在 ${n(inStock)} 家有貨，${week}。各門市即時狀態、補貨時段與通知。`,
    `${name}：${where} ${n(place.stores.length)} 家中現在 ${n(inStock)} 家有貨，${week}。各門市即時狀態與通知。`,
  ].map(zs), 155);
}

function productFaq(product: Product, place: Place, lines: StoreLine[], stats: PlaceStats, clock: RestockStats, nearest: { name: string; city: string; distance: number } | null): FaqItem[] {
  const code = place.country ?? "us";
  const name = zhCfg(product.name);
  const at = placeName(place);
  const out: FaqItem[] = [];
  const km = (miles: number) => (miles * 1.609344 < 0.5 ? "不到 1 km" : distance(L, code, miles));
  const near = nearest ? `；離這裡最近、而且上架中的是 ${/^apple\b/i.test(nearest.name) ? nearest.name : `Apple ${nearest.name}`}（${nearest.city}），約 ${km(nearest.distance)}` : "";
  const have = lines.filter((l) => l.available.length > 0);
  if (place.level === "store") {
    const l = lines[0];
    out.push({
      q: zs(`${name}此刻在${at}上架中嗎？`),
      a: zs(l && l.available.length > 0
        ? `最新一次查看是上架中${product.parts.length > 1 ? `：${list(L, l.available.map((i) => configLabel(i, L)), 4, (x) => `還有 ${n(x)} 個組合`)}` : ""}。`
        : `最新一次查看時沒有上架${near}。`),
    });
  } else {
    out.push({
      q: zs(`${at}有哪幾家 Apple 直營店把 ${name}擺上架？`),
      a: zs(have.length === 0
        ? `最新一次查看，一家也沒有${near}。`
        : `最新一次查看記到 ${n(have.length)} 家上架中：${list(L, have.map((x) => apple(x.store)), 4, (x) => `還有 ${n(x)} 家`)}。`),
    });
  }
  const peak = peakOf(clock, L);
  out.push({
    q: zs(`${at}的 ${name}重新上架紀錄如何？`),
    a: zs(stats.month === 0 ? `${at}近 ${stats.days} 天一次重新上架都沒記到。` : `近 ${stats.days} 天記到 ${n(stats.month)} 次重新上架，本週占 ${n(stats.week)} 次${peak ? `；最常見的是門市時間${peak.hour}前後` : ""}。`),
  });
  if (stats.medianMs != null) out.push({ q: zs(`${at}的 ${name}通常上架多久？`), a: zs(`上架時間中位數約 ${fmtDuration(stats.medianMs, L)}，接著又下架。`) });
  return out;
}

function priceLabel(product: Product): string {
  const code: CountryCode = product.country ?? "us";
  const prices = catalogFor(product.model, code).filter((x) => product.parts.includes(x.partNumber)).map((x) => x.price);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  const f = (v: number) => price(L, COUNTRIES[code], v);
  return lo === hi ? f(lo) : `${f(lo)}–${f(hi)}`;
}

/* ---------------------------------------------------------------- views */

const baseViews: Dict["views"] = {
  common: {
    inCountry: (c: Country) => C(c),
    liveMap: "取貨地圖",
    restockLog: "上架紀錄",
    alertMe: "加入追蹤清單",
    lastDays: (days: number) => <>近 {days} 天的回架日曆</>,
    since: "2026 年 11 月 2 日",
    sourcesWhere: (k: number, c: Country) => zs(k === 1 ? `${C(c)}納入觀測的唯一一家 Apple 直營店` : `${C(c)}納入觀測的 ${k} 家 Apple 直營店`),
    checker: (c: Country) => zs(`${C(c)}取貨觀測簿`),
    appleStoresIn: (c: Country) => zs(`${C(c)}的 Apple 直營店`),
    storesWithIt: "上架中的門市",
    more: "觀測簿裡還有",
  },

  /* ---------------------------------------------------------------- /stock/{product}/{place…} */
  product: {
    title: productTitle,
    description: productDescription,
    faq: productFaq,
    priceLabel,
    inPlace: (name: string) => name,
    h1Country: (model: string, c: Country) => zs(`${C(c)} ${zhCfg(model)}門市取貨現貨`),
    h1Place: (model: string, where: string) => zs(`${where} ${zhCfg(model)}現貨`),
    inStockNow: "此刻上架中",
    yes: "上架中",
    no: "未上架",
    pickup: "取貨回應",
    configurations: "上架組合",
    ofStores: (k: number) => `觀測 ${k} 家店`,
    restocks24h: "回架 · 過去一天",
    restocksHint: (week: number, month: number, days: number) => `7 天：${week} · ${days} 天：${month}`,
    sellOuts: (days: number) => `又下架 · ${days} 天`,
    stays: (ms: number) => zs(`中位上架時間 ${fmtDuration(ms, L)}`),
    noPairs: "還沒有完整的上架紀錄",
    lastRestock: "最近回架",
    noneYet: "還沒看過",
    thisConfig: "這個組合本身",
    inDays: (days: number) => `${days} 天內沒有`,
    notInStockNow: "此刻已下架",
    configsInStock: (k: number, of: number) => <span>上架中組合 <b className="text-ink">{k}</b>/{of}</span>,
    inStockAt: (k: number, of: number) => <span>上架門市 <b className="text-ink">{k}</b>/{of}</span>,
    checked: (live: ReactNode, p: string, tax: string) => <>{p}{tax} · 最新觀測 {live}</>,
    taxNote: (c: Country) => taxNoteZh(c),
    beforeTax: "稅前",
    buyOnApple: "到 apple.com 下單",
    allStoresIn: (c: Country) => `${C(c)}門市名錄`,
    everyIphoneHere: "這家店的三款 iPhone",
    everyIphone: (where: string) => zs(`${where}三款 iPhone`),
    panel: (model: string, where: string | null) => zs(`${where ? `${where}的 ` : ""}${zhCfg(model)}追蹤清單：先選組合，再選到得了的門市`),
    unitConfigs: "組合",
    unitStores: "店",
    otherConfigsHere: "這家店的其他版本",
    byStorageColor: "先看容量，再看機身色",
    nearestStores: "最近的幾家店",
    closest: (link: ReactNode, dist: string) => <>最近一家上架中的門市：{link}（{dist}）</>,
    storeCity: (store: string, city: string) => <>{store} · {city}</>,
    mostRecentlyInStock: "最後在哪裡看到",
    storesWithItNow: "今天上架中的門市",
    storesIn: (where: string) => zs(`${where}的直營店`),
    colStatus: "架況",
    colConfigs: "上架組合",
    noStoreHasIt: "最新一次觀測：沒有門市上架。",
    noStoreHereHasIt: "最新一次觀測：這幾家門市都沒上架。",
    moreStores: (k: number) => <>另有 {k} 家門市上架中 · 打開完整門市名錄 ↗</>,
    byRegion: (c: Country) => `分${regionZh(c)}看`,
    byCity: "分城市看",
    nearbyStores: "備選門市",
    latestChanges: "觀測簿最新幾筆",
    nothingLogged: "紀錄目前還是空的。",
    whenRestocks: "回架落在幾點",
    howFast: "每次上架撐多久",
    restocksByConfig: "各組合的回架次數",
    faqTitleCountry: (model: string, c: Country) => zs(`觀測問答 · ${C(c)} ${zhCfg(model)}`),
    faqTitle: (model: string, where: string) => zs(`觀測問答 · ${where} ${zhCfg(model)}`),
    buySource: (model: string, c: Country) => zs(`apple.com ${C(c)}：${zhCfg(model)} 訂購頁面`),
    nearby: "附近的地方",
    otherRegions: (c: Country) => `更多${regionZh(c)}`,
    elsewhereIn: (region: string) => zs(`再看${region}`),
    everyAppleStoreIn: (c: Country) => zs(`${C(c)}完整門市名錄`),
    across: (model: string, c: Country) => zs(`${zhCfg(model)} · 全${C(c)}`),
    itemList: (model: string, where: string) => zs(`${where} ${zhCfg(model)}`),
    nearLead: (c: Country, model: string, inStock: number, total: number, have: { store: string; city: string; configs: number }[]) =>
      zs(inStock === 0
        ? `此刻${C(c)}沒有任何一家 Apple 直營店把 ${model} 擺上架給人取貨，所以「附近哪裡有」真正要問的是：哪家店會先重新上架。把你到得了的門市加進追蹤清單，任何一家回架，推播提醒很快就到。`
        : `${n(inStock)}/${n(total)} 家門市此刻有 ${model} 上架：${list(L, have.slice(0, 5).map((l) => `${l.store} · ${l.city} · ${l.configs} 個組合`), 5, (x) => `還有 ${n(x)} 家`)}。`),
    nearHead: (c: Country) => [regionZh(c), "此刻上架中的門市"],
    nearCaption: (c: Country, model: string) => zs(`${model} 取貨架況，逐${regionZh(c)}列出（最新一次查看）`),
    nearMe: (_c: Country, model: string, alert: string) => zs(`想用你的位置重排每家門市，就打開本頁的追蹤清單設定、按「我附近」；距離是沿道路推估的公里數，每家門市旁邊都有導航連結。[建立 ${model} 追蹤清單](${alert})。`),
    modelFaq: (c: Country, model: string, low: number, high: number, inStock: number): { price: FaqItem; reserve: FaqItem } => {
      const money = (v: number) => price(L, c, v);
      return {
        price: { q: zs(`${model} 在${C(c)}賣多少？`), a: zs(`最小容量 ${money(low)}，最大容量 ${money(high)}，以 apple.com 的標價為準（${taxNoteZh(c)}）。`) },
        reserve: { q: zs(`在${C(c)}有沒有辦法先把一支 ${model} 留著、到門市取？`), a: zs(`只能直接下單：在 apple.com 結帳時選門市取貨，那個組合才算是你的，Apple 會照你選的時段替你留著。${inStock === 0 ? "最新一次觀測沒有任何門市上架，加進追蹤清單就是最早得到消息的方式。" : ""}`) },
      };
    },
  },

  /* ---------------------------------------------------------------- /restocks */
  restocks: {
    metaTitle: (c: Country, k: number) => zs(`${C(c)} iPhone 補貨紀錄：${k === 1 ? "Apple 直營店" : `全部 ${k} 家 Apple 直營店`}即時更新`),
    metaDescription: (c: Country, k: number) => zs(`${C(c)}${k === 1 ? "唯一一家" : "各家"} Apple 直營店每一次 iPhone Duo、18 Pro 與 Pro Max 門市取貨補貨，附確切時間、規格與地圖。`),
    h1: (c: Country) => `${C(c)}上架紀錄`,
    summary: (day: number, week: number, model?: string, region?: string) => <>過去一天重新上架 {num(L, day)} 次，過去七天 {num(L, week)} 次{model ? ` · ${model}` : ""}{region ? ` · ${region}` : ""}。時間依你的裝置顯示。</>,
    allModels: "每個機型",
    restocks: "只看重新上架",
    withSoldOut: "上架與下架",
    regionLabel: (c: Country) => regionZh(c),
    allRegions: (c: Country) => `不限${regionZh(c)}`,
    filter: "套用",
    page: (k: number) => <>紀錄第 {k} 頁</>,
    newer: "← 更近的",
    older: "更早 →",
    getAlerts: "建立追蹤清單",
    byPlace: "依地點的上架紀錄",
    byRegion: (c: Country) => `分${regionZh(c)}`,
    datasetName: (c: Country) => zs(`${C(c)} Apple 直營店 iPhone 門市取貨補貨紀錄`),
    datasetDescription: (c: Country) => zs(`${c.cc === "us" ? "全美 269 家 Apple Store" : `${C(c)}的 Apple 直營店`}每一次經確認的 iPhone Duo、iPhone 18 Pro 與 iPhone 18 Pro Max 門市取貨補貨與售完，附門市、確切規格與時間。apple.com 連續兩次回應一致才記為補貨；每 15 秒檢查一次（有通知的門市每 5 秒）。`),
    datasetMeasured: ["Apple 直營店", "iPhone 機型、容量與顏色", "補貨時間", "售完時間"],
  },

  /* ---------------------------------------------------------------- /map */
  map: {
    metaTitle: (c: Country, k: number) => zs(`${C(c)} iPhone Duo 門市取貨現貨地圖：${k === 1 ? "Apple 直營店" : "每家 Apple 直營店"}即時更新`),
    metaDescription: (c: Country, k: number) => zs(`${C(c)}${k === 1 ? "唯一一家" : `全部 ${k} 家`} Apple 直營店的即時地圖：iPhone Duo、18 Pro 與 Pro Max 現在的門市取貨現貨，可依容量與顏色篩選。`),
    /** 地圖元件在非英文時用 regionNoun 當 key 查 cdict map.nouns，所以這裡維持英文 key；國名它自己用 countryLabel。 */
    country: (c: Country) => ({ name: C(c), inName: C(c), regionNoun: c.regionNoun, regionNounPlural: c.regionNounPlural }),
    everyStore: "門市名錄",
    storeCity: (store: string, city: string) => `${city} · ${store}`,
  },

  /* ---------------------------------------------------------------- /{cc}/stores */
  storesIndex: {
    metaDescription: (c: Country, k: number, regions: number, cities: number, duo: number, max: number) => {
      const by = c.regionNoun && regions > 1 ? `，依${regionZh(c)}與城市排列` : cities > 1 ? "，依城市排列" : "";
      return zs(`${C(c)}全部 ${k} 家 Apple 直營店${by}，即時顯示 iPhone Duo、18 Pro 與 Pro Max 門市取貨現貨：現在 ${duo} 家有 Duo、${max} 家有 Pro Max。`);
    },
    countAnswer: (k: number, spread: string, top: { name: string; count: number }[]) => zs(`名錄上共 ${k} 家，${spread}${top.length ? `。最密集的是${top[0].name}（${top[0].count} 家）${top[1] ? `，再來是${top[1].name}（${top[1].count} 家）` : ""}` : ""}。`),
    howMany: (c: Country) => <>清點{C(c)}的 Apple 直營店</>,
    duoNow: (c: Country, k: number, have: Store[]): FaqItem => ({
      q: zs(`此刻${C(c)}哪幾家 Apple 直營店把 iPhone Duo 擺上架？`),
      a: zs(have.length === 0 ? `最新一次觀測，${k} 家全都沒上架。任何一家重新上架，本頁和取貨地圖會馬上更新，追蹤清單也會第一個提醒你。` : `最新一次觀測，${have.length}/${k} 家上架中：${have.slice(0, 6).map(apple).join("、")}${have.length > 6 ? "等" : ""}。`),
    }),
    faq: (ctx: FaqContext) => placeFaq({ ...ctx, omit: [...(ctx.omit ?? []), "count", "stock", "lasts"] }, L),
    duoBlock: (alert: string) => zs(`把到得了的門市加進追蹤清單，是最實際的做法：[建立 iPhone Duo 追蹤清單](${alert})。一家門市 × 一個組合算一項，任何一項重新上架，推播提醒很快就到。`),
    intro: (c: Country, k: number, spread: string, now: { duo: number; max: number; pro: number }, tax: string) => zs(`名錄上${C(c)}有 **${k} 家 Apple 直營店**，${spread}。最新一次觀測：iPhone Duo 在 **${now.duo}** 家上架，iPhone 18 Pro Max **${now.max}** 家，18 Pro **${now.pro}** 家。${tax}`),
    crumb: "門市名錄",
    panel: (c: Country) => zs(`你在${C(c)}的追蹤清單：先選手機，再只挑到得了的門市`),
    matrixLabel: "逐店架況",
    matrixH2: (c: Country) => <>{zs(`${C(c)}各機型的上架數`)}</>,
    matrixHint: "每個機型：最新觀測時上架／追蹤中的組合數。",
    topCaption: (c: Country) => <>Apple 直營店數量最多的{regionZh(c)}（以 Apple 直營店列表為準，也就是這本觀測簿涵蓋的範圍）</>,
    regionHead: (c: Country) => regionZh(c),
    colStores: "Apple 直營店",
    colCities: "城市",
    locationsBy: (c: Country) => zs(`門市名錄 · 逐${regionZh(c)}列出`),
    locationsIn: (c: Country) => zs(`${C(c)}門市名錄`),
    storeCount: (k: number) => <>{k} 家 Apple 直營店</>,
    storeCountAll: (k: number) => <>共 {k} 家</>,
    whenRestock: (c: Country) => <>{C(c)}的回架時段</>,
    howFast: (c: Country) => <>{C(c)}每次上架撐多久</>,
    faqTitle: (c: Country) => zs(`${C(c)}門市觀測問答`),
    getApp: "安裝網頁版 App",
    howItWorks: "方法說明",
    pricing: "方案與價格",
  },

  /* ---------------------------------------------------------------- /iphone-duo-restock-times */
  restockTimes: {
    fmt: {
      n: (x: number) => num(L, x),
      pct: pc,
      date: (ymd: string, weekday = true) => ymdZh(ymd, weekday),
      longDate: longYmdZh,
      zoneStamp,
      local,
      hour: (h: number) => hh(h),
      range: hrange,
      weekday: weekdayZh,
      store: apple,
      storeWithPlace: (s: Store) => `${cityLabel(s.country ?? "us", s.city, L)} · ${apple(s)}`,
    },
    title: (c: Country) => zs(`${C(c)} iPhone Duo 重新上架時段：觀測紀錄`),
    metaDescription: (x: RTMeta) => {
      const { c, t, w, pattern } = x;
      const region = c.cc === "us" ? "州" : c.regionNoun ? regionZh(c) : "門市";
      const since = ymdZh(t.since, false);
      return t.n > 0 && pattern
        ? fitTitleW([
          `${C(c)} iPhone Duo 上架紀錄：${since}以來記到 ${n(t.n)} 次重新上架，${pc(w.share)} 集中在門市時間${hrange(w.from, w.to)}${t.sellout ? `，${pc(t.sellout.within2min)} 在 2 分內下架` : ""}。小時、日期、${region}、門市、組合各一張表。`,
          `${C(c)} iPhone Duo 上架紀錄：${since}以來記到 ${n(t.n)} 次重新上架，${pc(w.share)} 集中在門市時間${hrange(w.from, w.to)}。小時、日期、${region}、組合各一張表。`,
          `${C(c)} iPhone Duo 上架紀錄：${since}以來 ${n(t.n)} 次，小時、日期、${region}、組合分表。`,
        ].map(zs), 158)
        : t.n > 0
          ? fitTitleW([
            `${C(c)} iPhone Duo 上架紀錄：${since}以來記到 ${n(t.n)} 次重新上架，依門市時間、日期、${region}、門市與組合分表，另記下每次上架多久。`,
            `${C(c)} iPhone Duo 上架紀錄：${since}以來 ${n(t.n)} 次，小時、日期、${region}、組合分表。`,
          ].map(zs), 158)
          : zs(`${C(c)} iPhone Duo 上架紀錄：ShelfSpring 自 ${longYmdZh(t.since)}開始記錄，按小時、按日、按門市與組合整理觀測結果。`);
    },
    h1: (x: RTView) => zs(x.t.unknown
      ? `${C(x.c)} iPhone Duo 重新上架：觀測紀錄`
      : x.t.n > 0
        ? `${C(x.c)} iPhone Duo 重新上架：${x.pattern ? `多半記在門市時間${hrange(x.w.from, x.w.to)}` : "逐小時的觀測"}`
        : `${C(x.c)} iPhone Duo 重新上架：開始記錄以來還沒記到`),
    intro: (x: RTView) => {
      const { t, one, tracked, pattern, w } = x;
      const who = one ? `${C(x.c)}僅有的 Apple 直營店` : `${C(x.c)}的 Apple 直營店`;
      return t.unknown ? (
        <>{zs(`這次沒讀到上架紀錄；${C(x.c)}的門市照樣每 15 秒查看；重新載入本頁，數字就會回來。`)}</>
      ) : t.n > 0 ? (
        <>
          <b className="text-ink">{zs(`記到 ${n(t.n)} 次。`)}</b>{zs(`${longYmdZh(t.since)}開始記錄以來，${who}`)}<b className="text-ink">{zs(`重新上架 iPhone Duo ${n(t.n)} 次`)}</b>{tracked > 1 ? `，${tracked} 個追蹤日裡有 ${t.days} 天出現回架` : "（追蹤才滿一天）"}
          {pattern && <>，<b className="text-ink">{pc(w.share)} 集中在門市時間{hrange(w.from, w.to)}</b></>}。
        </>
      ) : (
        <>
          <b className="text-ink">開始記錄以來還沒記到。</b>{zs(`ShelfSpring 從 ${longYmdZh(t.since)}起每 15 秒查看${one ? `${C(x.c)}僅有的 Apple 直營店` : `${C(x.c)}全部 ${x.stores} 家 Apple 直營店`}一回，到現在還沒確認過任何一次 iPhone Duo 取貨回架。`)}
        </>
      );
    },
    hero: {
      restocks: (x: RTView) => zs(`${ymdZh(x.t.since, false)}以來記到的重新上架`),
      window: (x: RTView) => `集中在門市時間${hrange(x.w.from, x.w.to)}`,
      days: "出現過回架的天數",
      now: ((one: boolean): string => (one ? "此刻上架中（1 = 是）" : "家門市此刻上架中")) as Dict["views"]["restockTimes"]["hero"]["now"],
      today: (x: RTView, today: DayRow) => `今天 ${ymdZh(today.date, false)}${x.one ? "" : ` · ${today.stores} 家門市`} · 進行中`,
      weekday: "目前回架最多的星期",
    },
    heroPoints: (x: RTView, latest: { config: string; store: Store; at: string } | null): Point[] => [
      ...(latest ? [{ text: <>最新一筆：<b className="text-ink">{latest.config}</b>{x.one ? null : <>，<Link href={storePath(latest.store)} className="underline underline-offset-2">{apple(latest.store)}</Link></>}，門市時間 {local(latest.at, latest.store)}</> }] : []),
      ...(x.t.peakWeekday != null ? [{ text: <>一週裡的高峰：<b className="text-ink">{weekdayZh(x.t.peakWeekday)}</b></> }] : []),
      { text: <>Apple <b className="text-ink">從來不預告回架時間</b>；以上是這本觀測簿自己確認的結果，大約每 5 分鐘刷新</>, no: true },
    ],
    emptyPoints: (x: RTView): Point[] => [
      { text: <>此刻 <b className="text-ink">{x.duoNow}/{x.stores} 家</b>上架中可取貨</> },
      { text: <>確認第一次重新上架之後，下面的表格就會開始有資料</>, step: true },
      { text: <>小時與星期的規律，樣本最多的是<Link href="/iphone-duo-restock-times" className="underline underline-offset-2">美國版紀錄</Link>（英文）</>, step: true },
    ],
    setUpAlert: "建立 iPhone Duo 追蹤清單",
    logLive: "打開即時上架紀錄",
    onThisPage: "頁面段落",
    nav: (x: RTView): Record<string, string> => ({
      "time-of-day": "小時",
      "day-by-day": "日曆",
      where: `地點（${rtRegion(x)}）`,
      configuration: "組合",
      "how-long": "上架長度",
      unavailable: "顯示缺貨？",
      reddit: "論壇說法",
      method: "計算規則",
    }),
    h2: (x: RTView): Record<string, string> => ({
      "time-of-day": zs(`${C(x.c)}的 iPhone Duo 多半在幾點重新上架？`),
      "day-by-day": zs(`${C(x.c)}哪些日子出現過 iPhone Duo 回架？`),
      where: zs(`${C(x.c)}回架次數最多的是哪幾家 Apple 直營店？`),
      configuration: zs(`${C(x.c)}哪個 iPhone Duo 組合最常重新上架？`),
      "how-long": zs(`${C(x.c)}的 iPhone Duo 每次重新上架，能撐多久？`),
      unavailable: "為什麼大多數時候每家門市都顯示缺貨？",
      reddit: "論壇上的 iPhone Duo 回架傳言，逐條拿紀錄來對",
      method: "這本觀測簿怎麼算一次重新上架？",
    }),
    faq: (x: RTView): Faq[] => {
      const { t, w, pattern, sell, us, weekend, tracked } = x;
      const where = C(x.c);
      const window = hrange(w.from, w.to);
      return [
        { q: zs(`${where}的 iPhone Duo 通常幾點重新上架？`), a: zs(t.n > 0 && pattern
          ? `多半在上午。${longYmdZh(t.since)}開始記錄以來記到 ${n(t.n)} 次：門市時間${window}占 ${pc(w.share)}，上午 8 點到中午 12 點占 ${pc(hourShare(t.byHour, 8, 12))}。Apple 從不預告；規律由觀測簿歸納，約 5 分鐘更新一次。`
          : `Apple 從不預告重新上架。觀測簿自 ${longYmdZh(t.since)}起在${where}記到 ${n(t.n)} 次確認回架${t.days ? `，散在 ${t.days} 天` : ""}；要有 ${PATTERN_MIN} 次、橫跨 ${PATTERN_MIN_DAYS} 個日子，才會寫出慣常的時段，本頁會自動更新。`) },
        { q: zs(`${us ? "" : `${where}的 `}iPhone Duo 週末也會重新上架嗎？`), a: zs(t.n > 0
          ? `${weekend > 0 ? "會，到目前有" : "目前還沒看到"}：${n(t.n)} 次回架裡，週六、週日占 ${n(weekend)} 次（${pc(weekend / t.n)}）。${t.peakWeekday != null ? `回架最多的是${weekdayZh(t.peakWeekday)}。` : `紀錄橫跨 ${WEEKDAY_MIN_SPAN} 天以後才會點名哪一天最多；目前是 ${tracked} 天。`}`
          : `${where}還沒有週末的紀錄；本頁的日曆表會隨確認的回架一天天補上。`) },
        { q: "想自己盯，要從幾點開始？", a: zs(t.n > 0 && pattern
          ? `${pc(w.share)} 的回架落在門市時間${hh(w.from)}開始的兩個小時，那段時間開著 apple.com、先選好門市取貨最划算。不過一次回架${sell ? `的上架中位數只有 ${sell.medianSec} 秒` : "大約只撐一分鐘"}，手動重新整理很難追上；追蹤清單每 5 秒查看一次（[追蹤清單的運作](/iphone-duo-stock-alerts)）。`
          : `${where}的規律還不清楚之前，就交給追蹤清單：你選的門市每 5 秒查看一次，日夜不停（[追蹤清單的運作](/iphone-duo-stock-alerts)）。`) },
        { q: "為什麼大多數時候，Apple 直營店的 iPhone Duo 一律顯示缺貨？", a: zs(sell
          ? `回架太短：觀測簿在${where}量到 ${n(sell.n)} 次下架的回架，${pc(sell.within2min)} 在 2 分內下架，${pc(sell.within20min)} 在 20 分內。此刻 ${x.duoNow}/${x.stores} 家上架中；就算一天回架幾十次，其餘時間 apple.com 老實顯示的仍是無法取貨（[缺貨顯示代表什麼](/apple-store-pickup-availability-explained)）。`
          : `門市取貨的庫存每次只露面幾分鐘。此刻${where} ${x.duoNow}/${x.stores} 家門市上架中（[缺貨顯示代表什麼](/apple-store-pickup-availability-explained)）。`) },
        { q: "我常去的 Apple 直營店有 iPhone Duo 回架時，怎樣第一時間知道？", a: zs(`把那家門市和指定的容量、機身色加進追蹤清單：之後那家店每 5 秒查看一次，確認回架後大約 3 秒，手機就會收到推播（[建立追蹤清單](${x.alert})；[方法說明](/how-it-works)）。`) },
      ];
    },
    sources: {
      applePickup: "Apple 官方說明：「送貨與取貨」",
      newsroom: "「iPhone Duo 抵達全球各地 Apple 直營店」· Apple 新聞稿，2026 年 10 月 23 日",
      macRumors: "「美國與加拿大的 iPhone Duo Apple Store 取貨系統再次上線」· MacRumors 報導，2026 年 10 月 24 日",
      reports: (tracker: string) => zs(`${tracker} 的上市週 iPhone Duo 筆記：和這本觀測簿分開存放，從不計入`),
    },
    ld: (x: RTView) => ({
      datasetName: zs(`${C(x.c)} Apple 直營店 iPhone Duo 補貨時段`),
      description: zs(`自 ${x.t.since} 起${C(x.c)} Apple 直營店每一次經確認的 iPhone Duo 門市取貨補貨，附門市、規格與時間，來自 ShelfSpring 每 15 秒一次的檢查；依當地小時、日期、${rtRegion(x)}、門市與規格彙整。`),
      spatial: zs(`${C(x.c)}的 Apple 直營店`),
      measured: ["補貨時間（門市當地時間）", "Apple 直營店", "iPhone Duo 容量與顏色", "賣完前經過的秒數"],
      size: `${x.t.n} 次補貨，${x.t.stores} 家門市`,
    }),
    crumb: "iPhone Duo 上架紀錄",

    timeLead: (x: RTView) => <b>{zs(`上午 8 點到中午 12 點占 ${pc(hourShare(x.t.byHour, 8, 12))}；最密集的兩個小時是門市時間${hrange(x.w.from, x.w.to)}，占 ${n(x.t.n)} 次回架的 ${pc(x.w.share)}。`)}</b>,
    busiestHour: (count: number) => `最高的單一小時：回架 ${n(count)} 次`,
    morning: "上午 8 點 → 中午 12 點",
    evening: "下午 5 點以後：晚上也有回架",
    night: "午夜 → 清晨 6 點",
    tooFew: (x: RTView) => <b>{zs(`天數不夠，還歸納不出時段：${longYmdZh(x.t.since)}開始記錄以來，只有 ${x.t.days} 天記到回架，共 ${n(x.t.n)} 次。`)}</b>,
    tooFewKeys: (): Point[] => [
      { text: <>歸納慣常時段的門檻：<b className="text-ink">{PATTERN_MIN} 次回架、橫跨 {PATTERN_MIN_DAYS} 個日子</b></> },
      { text: <>同一刻連續回架十次只算一個事件，看不出習慣</>, no: true },
      { text: <>天數夠了，本頁的結論會自動改寫</>, step: true },
    ],
    hourCaption: (x: RTView) => zs(`${C(x.c)}記到的 iPhone Duo 重新上架，依門市時間逐小時，${ymdZh(x.t.since, false)} → 今天，共 ${n(x.t.n)} 次`),
    hourHead: ["門市時間（24 小時制）", "回架次數", "占紀錄 %"],
    morningKeys: (x: RTView): Point[] => [
      { text: <>上午回架多，<b className="text-ink">和開門無關</b>{x.us ? "：美國大部分 Apple Store 要到上午 10 點才營業" : ""}</> },
      { text: <>取貨庫存從<b className="text-ink">線上</b>放出，比門市開門還早</> },
      { text: <>想自己刷：平日鎖定門市時間 <b className="text-ink">{hrange(x.w.from, x.w.to)}</b></>, step: true },
      { text: <>一天剩下的 <b className="text-ink">22 個小時</b>，交給<Link href={x.alert}>追蹤清單</Link>就好</>, step: true },
    ],
    storeChartKeys: (x: RTView): Point[] => [{ text: <>每家門市頁面都依該店時區畫了自己的時段圖（<Link href={x.storesHref}>{x.us ? "依州查 Apple Store" : `${C(x.c)}門市名錄`}</Link>）：附近多數門市 9 點才回架、偏偏有一家 8 點就回架，這種店值得記下來</>, step: true }],

    dayLead: (x: RTView) => {
      const { t, tracked, one } = x;
      return t.n > 0 && tracked === 1 ? (
        <b>{zs(`目前只有一天的紀錄（${ymdZh(t.daily[t.daily.length - 1]?.date ?? t.since)}）：記到 ${n(t.n)} 次回架${one ? "" : `，分散在 ${t.stores} 家門市`}。`)}</b>
      ) : t.n > 0 ? (
        <b>{zs(`${t.days === tracked ? `追蹤的 ${t.days} 天，天天都記到回架` : `${longYmdZh(t.since)}開始記錄至今 ${tracked} 天，其中 ${t.days} 天記到回架`}${t.peakWeekday != null ? `；回架最多的是${weekdayZh(t.peakWeekday)}` : ""}。`)}</b>
      ) : (
        <b>{zs(`${C(x.c)}從 ${longYmdZh(t.since)}開始記錄以來，還沒記到任何確認的回架。`)}</b>
      );
    },
    daysTracked: "記到回架的天數",
    busiestDay: (x: RTView, day: DayRow) => `回架最多的一天：${ymdZh(day.date)}${x.one ? "" : ` · ${day.stores} 家門市`}`,
    busiestDayNone: "回架最多的一天",
    drop: (x: RTView, drop: { at: string; restocks: number }) => `家門市的回架擠在同一個半小時（${zoneStamp(drop.at, x.c)}，${n(drop.restocks)} 個組合）：一次全國性釋出留下的痕跡`,
    weekend: (x: RTView) => `週六、週日占的回架（${n(x.weekend)} 次）`,
    dayCaption: (x: RTView) => zs(`${C(x.c)}記到的 iPhone Duo 重新上架，逐日列出${x.t.reports.length ? "。標著「回報」的灰色列，來自其他追蹤者在這本觀測簿開始記錄前公開的筆記，只用來補齊時間線，任何總數都不含它們" : ""}`),
    dayHead: { date: "日", restocks: "回架", stores: "門市", busiest: "高峰時段（24 小時制）", source: "記錄者" },
    soFar: " · 進行中",
    reportedBy: (names: string[]) => <>來源：{names.join("／")}</>,
    dayKeys: (x: RTView, launch: string, resumed: string): Point[] => [
      { text: <><b className="text-ink">{ymdZh(launch)}</b>：開賣當天，首批貨先出給線上訂單</> },
      { text: <><b className="text-ink">{ymdZh(resumed)}</b>：恢復受理門市取貨訂單{x.us ? "（MacRumors）" : ""}</> },
      x.t.reports.length
        ? { text: <>灰色的<b className="text-ink">回報</b>列：{x.reportNames.join(" 和 ")} 在上市週的筆記，不算進總數</> }
        : { text: <>這本觀測簿對{C(x.c)}各門市的紀錄始於 <b className="text-ink">{longYmdZh(x.t.since)}</b></> },
      ...(x.t.n > 0 && x.t.peakWeekday == null ? [{ text: <>一週的高峰：紀錄要橫跨 <b className="text-ink">{WEEKDAY_MIN_SPAN} 天</b>才會點名（目前 {x.tracked} 天）</>, no: true }] : []),
      { text: <>留意<b className="text-ink">門市</b>欄：同樣的回架次數散在越多家門市，對你越有利</>, step: true },
    ],

    whereLead: (x: RTView, hit: { name: string; restocks: number; stores: number; storesTotal: number }[], total: number) => (
      <b>{zs(`${hit[0].name}居冠：${ymdZh(x.t.since, false)}以來記到 ${n(hit[0].restocks)} 次回架，${hit[0].storesTotal} 家門市裡有 ${hit[0].stores} 家出現過${hit[1] ? `；接著是${hit[1].name}（${n(hit[1].restocks)} 次）` : ""}${hit[2] ? `與${hit[2].name}（${n(hit[2].restocks)} 次）` : ""}。${total} 個${rtRegion(x)}裡，${hit.length} 個記到回架${total - hit.length > 0 ? `，${total - hit.length} 個仍是空白` : ""}。`)}</b>
    ),
    whereNone: (x: RTView) => <b>{zs(`${C(x.c)}目前沒有任何${rtRegion(x)}記到確認的回架；第一筆出現後，表格就會填上。`)}</b>,
    regionCaption: (x: RTView) => zs(`${C(x.c)}逐${rtRegion(x)}記到的 iPhone Duo 重新上架，${ymdZh(x.t.since, false)} → 今天`),
    regionHead: (x: RTView) => [rtRegion(x), "回架次數", "有回架的門市", "最新（門市時間）"],
    ofN: (a: number, b: number) => <>{a}/{b}</>,
    storesCaption: (x: RTView) => zs(`${C(x.c)} iPhone Duo 上架紀錄最長的門市，${ymdZh(x.t.since, false)} → 今天`),
    storesHead: ["門市", "回架次數", "有回架的天數", "慣常時段", "最新（門市時間）"],
    swaps: (x: RTView) => [
      { no: "只認回架最多的那家，不管多遠", yes: `${x.pattern ? hh(x.w.from) : "上午"}左右、開車一小時內能到的兩三家`, why: "去不了的店再常回架也沒用；最常回架的門市，一天真正上架的時間也只有幾分鐘。" },
      { no: "死守一家碰運氣", yes: "每家都加進追蹤清單，誰先響就先去誰", why: "回架次數表只幫你排順序：你那幾家門市，先去哪一家。" },
    ],
    nearMe: "我附近此刻上架 Duo 的門市",

    configLead: (x: RTView, top: { label: string; restocks: number }, rarest: { label: string; restocks: number } | null) => (
      <b>{zs(`${top.label}最多：${n(x.t.n)} 次回架裡占 ${n(top.restocks)} 次（${pc(top.restocks / x.t.n)}）${rarest ? `；最少見的是 ${rarest.label}，只記到 ${n(rarest.restocks)} 次` : ""}。`)}</b>
    ),
    mostRestocked: (config: string) => zs(`${config}：回架次數最多的組合`),
    versus: (a: string, bCount: number, b: string) => zs(`${a} 的回架次數（${b}：${n(bCount)} 次）`),
    restocksOf: (a: string) => zs(`${a} 的回架次數`),
    byStorage: "分容量",
    byColour: "分機身色",
    configNone: (x: RTView) => <b>{zs(`${C(x.c)}目前沒有任何組合記到確認的回架；${x.configs} 個組合先排好，第一筆回架出現就填上。`)}</b>,
    configCaption: (x: RTView) => zs(`${C(x.c)}記到的 iPhone Duo 重新上架，每個組合一列，${ymdZh(x.t.since, false)} → 今天`),
    configHead: ["組合", "回架次數", "占紀錄 %", "最新（門市時間）"],
    configKeys: (x: RTView): Point[] => [
      { text: <>挑組合<b className="text-ink">比挑門市重要</b></> },
      x.storageRatio != null
        ? { text: <>願意選回架最多的那個容量，勝算大約是下一級的 <b className="text-ink">{x.storageRatio} 倍</b></> }
        : { text: <>願意選回架最多的那個容量，勝算<b className="text-ink">高很多</b></> },
      { text: <><b className="text-ink">2TB</b>：比較適合線上下單、等宅配</>, no: true },
      { text: <>價格與此刻架況：<Link href="/which-iphone-duo-restocks-most">哪個 iPhone Duo 組合最常重新上架？</Link></>, step: true },
    ],

    howLongLead: (x: RTView, sell: SelloutFacts) => <b>{zs(`${C(x.c)}量到 ${n(sell.n)} 次下架的回架：中位數 ${sell.medianSec} 秒；2 分內下架占 ${pc(sell.within2min)}，20 分內占 ${pc(sell.within20min)}。`)}</b>,
    secUnit: "秒",
    medianListing: "上架時間中位數",
    within2: "2 分內下架",
    within20: "20 分內下架",
    fastest: "量到最短的一次上架",
    howLongNone: (x: RTView) => <b>{zs(`${C(x.c)}已下架的回架${x.t.n > 0 ? "" : "暫時"}太少，量不出數字；累積到 10 次才會公開，完整數據可以看美國版紀錄。`)}</b>,
    howLongKeys: (x: RTView): Point[] => [
      { text: <>兩分鐘的空檔要靠<b className="text-ink">追蹤清單</b>接住，狂刷 apple.com 追不上</> },
      { text: <>本頁其他數字，都要從這一個讀起</> },
      { text: <>每次回架上架幾秒，依組合與{rtRegion(x)}分開看：<Link href="/iphone-duo-sell-out-times">iPhone Duo 回架能上架多久？</Link></>, step: true },
    ],
    measured: "這些數字是上限：起點是第一次看到某組合上架的那次查看，終點是看到它下架的那次查看；真正的上架時間只會更短。",

    unavailableLead: (x: RTView) => <b>{zs(`${C(x.c)}有 ${n(x.pairs)} 個可能上架的「門市 × 組合」（${x.one ? "一家門市" : `${n(x.stores)} 家門市`} × ${x.configs} 個組合），此刻${x.duoNow === 0 ? "卻沒有任何門市" : `只有 ${x.duoNow} 家門市`}有 iPhone Duo 上架：回架只是一瞬間，不是常態。`)}</b>,
    pairs: "可能上架的「門市 × 組合」",
    listingNow: "此刻有 iPhone Duo 上架可取貨",
    goneIn2: "的回架 2 分內下架",
    last24: "過去 24 小時記到的回架",
    unavailableKeys: (x: RTView, today: number): Point[] => [
      x.recent.restocks > 0
        ? { text: <>過去 24 小時：{zs(`${C(x.c)} ${x.recent.stores} 家門市合計`)}<b className="text-ink">記到 {n(x.recent.restocks)} 次回架</b></> }
        : today > 0
          ? { text: <>今天：{C(x.c)}<b className="text-ink">記到 {n(today)} 次回架</b></> }
          : { text: <>上面的日曆表列出的，都是真的發生過的回架</> },
      { text: <>每一次在 apple.com 上只停留<b className="text-ink">一兩分鐘</b></> },
      { text: <>開賣後第 4 天、第 14 天仍「每家都缺貨」，<b className="text-ink">並不表示</b> Apple 停止供應</>, no: true },
    ],
    unavailableLinks: { explained: "門市取貨顯示缺貨，背後代表什麼", howToGet: "買到 iPhone Duo 的實際路線" },

    redditLead: (x: RTView) => <b>拿{zs(`${C(x.c)}確認的 ${n(x.t.n)} 次回架`)}，逐條檢查 <a href="https://www.reddit.com/r/applestore/" target="_blank" rel="noopener nofollow">r/applestore</a> 與 <a href="https://www.reddit.com/r/iphone/" target="_blank" rel="noopener nofollow">r/iphone</a> 四個最常被轉貼的說法——這些心得多半出於好意，可是往往只看一家店，過一天就不準了。</b>,
    redditCaption: "論壇常見的 iPhone Duo 回架說法 × ShelfSpring 確認紀錄",
    redditHead: ["流傳的說法", "紀錄顯示"],
    claims: (x: RTView): { claim: string; answer: ReactNode }[] => {
      const { t, w, tracked, recent } = x;
      return [
        { claim: "「半夜才會補，凌晨 3 點去看。」", answer: t.n > 0 ? <>凌晨 0 點到 6 點（門市時間）只占 {pc(hourShare(t.byHour, 0, 6))} 的回架；{hrange(w.from, w.to)}則占 {pc(w.share)}。</> : "目前還沒有回架紀錄可以比對。" },
        { claim: "「Apple 固定挑某一天補。」", answer: t.n > 0 ? (t.peakWeekday != null ? <>目前以{weekdayZh(t.peakWeekday)}最多（{n(t.n)} 次裡占 {n(t.byWeekday[t.peakWeekday])} 次），不過 {tracked} 天裡有 {t.days} 天都記到回架。</> : <>追蹤的 {tracked} 天裡，{t.days} 天記到回架{t.days === tracked ? "，一天都沒落空" : ""}；紀錄橫跨 {WEEKDAY_MIN_SPAN} 天以後才會點名哪一天最多。</>) : "目前還沒有回架紀錄可以比對。" },
        { claim: "「打電話問門市，貨幾點進來。」", answer: "Apple 不預告回架；apple.com 上的取貨庫存是線上釋出的，店員跟大家同一刻才看得到。" },
        { claim: "「顯示缺貨，就是賣斷了。」", answer: recent.restocks > 0 ? <>最近 24 小時就有 {recent.stores} 家門市記到 {n(recent.restocks)} 次回架，足以推翻這個說法，而且每次不到幾分鐘又變回缺貨。</> : t.n > 0 ? <>{zs(`${ymdZh(t.since, false)}以來記到的 ${n(t.n)} 次回架已經推翻這個說法，而且每次不到幾分鐘又變回缺貨。`)}</> : "還沒有資料能拿來比對。" },
      ];
    },
    redditKeys: (): Point[] => [
      { text: <>沒有<b className="text-ink">紀錄</b>可查，傳言才會流行；這頁就是紀錄，誰都能看</> },
      { text: <>論壇說對的一點：<b className="text-ink">結帳要快</b>——事先登入、Apple Pay 準備好（<Link href="/how-to-grab-an-iphone-duo-restock">20 秒結帳步驟</Link>）</> },
    ],

    methodLead: <b>算一次重新上架的條件：apple.com 讓某家原本沒上架的門市開放某個組合的門市取貨，而且連續兩次查看結果一致。</b>,
    methodKeys: (x: RTView): Point[] => [
      { text: <>{zs(x.one ? `${C(x.c)}僅有的 Apple 直營店` : `${C(x.c)}每家 Apple 直營店`)}每 <b className="text-ink">15 秒</b>查看一次；追蹤清單上的門市每 <b className="text-ink">5 秒</b></> },
      { text: <>其他追蹤者公布的間隔落在 <b className="text-ink">8 秒到 15 分鐘</b>；我們只拿對方自己公布的數字比</> },
      { text: <>第一次出現的「上架中」，隔<b className="text-ink">大約一秒</b>會再複查，通過才寫進紀錄</> },
      { text: <>上架消失，在<b className="text-ink">下一輪</b>查看時確認</> },
      { text: <>門市第一次被查看、請求失敗或逾時：<b className="text-ink">一律不</b>當作回架，也不當作缺貨</>, no: true },
      { text: <>所有時間與日期都用門市所在地的<b className="text-ink">鐘點</b>；所謂「一波釋出」，指不同時區落在同一個半小時的回架</> },
      { text: <>其他追蹤者的回報{x.t.reports.length ? `（${x.reportNames.join("、")}）` : ""}：另外標示，<b className="text-ink">任何總數都不含</b></> },
      { text: <>大約每 5 分鐘刷新；<Link href={x.logHref}>上架紀錄</Link>則是即時寫入</>, step: true },
    ],
    quote: "引用這些數字時，請連回本頁。ShelfSpring 是獨立的觀測簿，跟 Apple 沒有任何業務往來；我們看的門市取貨狀態，任何人上 apple.com 都看得到，差別只在我們看得更密。",
    alertIn: (x: RTView) => <>{zs(x.one ? "建立 iPhone Duo 追蹤清單" : `${C(x.c)} · 建立 iPhone Duo 追蹤清單`)}</>,

    related: "同一份紀錄的其他頁面",
    sameData: "這份觀測簿能回答的問題",
    questions: {
      sellOut: "一次回架能上架多久？",
      alerts: "第一時間知道重新上架",
      howToGet: "實際買到的路線",
      whichConfig: "哪個組合最常重新上架",
      nearMe: "附近哪幾家門市此刻上架中",
      unavailable: "看懂「目前無法取貨」",
    },
    otherCountries: ((us: boolean): string => (us ? "這份研究的其他國家版" : "其他市場的紀錄")) as Dict["views"]["restockTimes"]["otherCountries"],
    faqTitle: "觀測問答",
  },
};

export const views: Dict["views"] = withShelfViews("zh-TW", baseViews);
