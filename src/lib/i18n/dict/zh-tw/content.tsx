import { withShelfContent } from "@/lib/seo/localizedCopy";
/**
 * 台灣中文：content —— SEO 積木（FAQ、瀏覽連結、數字條、產品元件、資料來源、即時元件）、enrich 的營業時段與
 * FAQ 答句、頁面標題、即時 {{token}}、重新上架規律句與圖片說明。參數已是中文、數字已格式化；這裡只負責排字。
 * 機型名、容量、Apple Store、ShelfSpring、apple.com 不翻。檢查間隔只寫 15 秒與 5 秒。
 */
import type { ReactNode } from "react";
import type { Forms } from "@/lib/i18n/format";
import type { Dict } from "../en";
import { zs } from "./util";

const f = (x: Forms): Forms => x;
type Kind = "state" | "city" | "store" | "model";

const baseContent: Dict["content"] = {
  hours: {
    closed: "公休",
    everyDay: (hours: string) => `天天 ${hours}`,
    tomorrow: "明天",
    dayAt: (day: string, time: string) => `${day} ${time}`,
    closedTodayOpens: (next: string) => `今天公休 · ${next} 再開`,
    closedToday: "今天整天公休",
    opensAt: (time: string) => `${time} 開門營業`,
    openNow: (closes: string) => `營業到 ${closes}`,
    closedNowOpens: (next: string) => `目前沒開 · ${next} 再開`,
    closedNow: "目前沒開",
  },

  duration: {
    underAMinute: "不到 1 分鐘",
    pair: (a: string, b: string) => `${a} ${b}`,
  },
  listMore: (k: string) => `還有 ${k} 個`,
  nearLine: (place: string, distance: string) => `${place} · ${distance}`,

  faq: {
    /** 句子以地點開頭（「Apple 信義 A13 …」），所以這裡只給名詞。 */
    where: (_kind: Kind, place: string) => place,
    nRestocks: f({ other: "確認的重新上架 # 次" }),
    restockA: ({ count, where, days, week, peak }: { count: string | null; where: string; days: string; week: string; peak: { hour: string; day: string | null } | null }) =>
      zs(`${count == null ? `${days} 天的觀測簿裡，${where}沒有任何重新上架` : `${days} 天的觀測簿裡，${where}記到${count}，本週占 ${week} 次`}${peak ? `；大多集中在當地時間${peak.hour}附近${peak.day ? `，一週裡${peak.day}最忙` : ""}` : ""}，而 Apple 不公開到貨日程。`),
    lastsNone: (where: string) => zs(`${where}完整的「重新上架→下架」紀錄還不夠，暫時量不出來。`),
    lasts: (days: string, duration: string) => zs(`${days} 天觀測簿中，從重新上架到下一次下架，在架時間中位數大約 ${duration}。`),
    storeIn: (store: string, line: string) => `${store} · ${line}`,
    nearestA: (stores: string) => `最近的其他選擇：${stores}。`,

    modelStockQ: (model: string) => zs(`${model} 目前在哪裡上架中？`),
    modelStockNone: (model: string) => zs(`最新一次觀測哪裡都沒有；美國任何一家 Apple Store 開放 ${model} 取貨，這份清單會跟著變。`),
    nUsStores: f({ other: "# 家美國 Apple Store" }),
    modelStockSome: (count: string) => zs(`最新一次觀測出現在 ${count}；下面逐一列出每家店和它上架的組合。`),
    priceQ: (model: string) => zs(`${model} 在 apple.com 標價多少？`),
    priceA: (low: string, high: string, storages: string, colors: string) => zs(`空機標價依容量（${storages}）從 ${low} 到 ${high}，機身色有${colors}。`),
    modelRestockQ: (model: string) => zs(`${model} 多久重新上架一次？`),
    modelLastsQ: (model: string) => zs(`重新上架的 ${model} 會在架多久？`),
    reserveQ: (model: string) => zs(`下單前，可以先幫我保留一支 ${model} 嗎？`),
    reserveA: "下單前不行：門市上架某個組合後，你要在 apple.com 下單並選門市取貨，那支手機才會在你的取貨時段替你留著。",

    storeStockQ: (store: string, model: string) => zs(`${store}目前有 ${model} 上架嗎？`),
    nConfigs: f({ other: "# 種組合" }),
    storeStockYes: (count: string) => zs(`有：最新一次觀測有 ${count}，容量和機身色請看本頁表格。`),
    storeStockNo: (other: { pro: string; proMax: string } | null) => zs(`最新一次觀測沒有${other ? `；不過這家店有 iPhone 18 Pro ${other.pro} 種、18 Pro Max ${other.proMax} 種組合上架中` : "，18 Pro 與 18 Pro Max 也一樣已下架"}。`),
    hoursQ: (store: string) => zs(`${store}什麼時候有開？`),
    hoursA: ({ hours, today, address, phone }: { hours: string | null; today: string | null; address: string; phone: string | null }) =>
      zs(`${hours ?? "營業時段請看本頁"}${today ? `（今天 ${today}）` : ""}，地址：${address}${phone ? `；電話 ${phone}` : ""}。`),
    storeRestockQ: (store: string) => zs(`iPhone 在${store}多久重新上架一次？`),
    storeLastsQ: (store: string) => zs(`${store}重新上架後通常在架多久？`),
    storeNearestQ: (store: string) => zs(`和${store}距離最近的別家 Apple 直營店是哪幾家？`),

    placeStockQ: (place: string, model: string) => zs(`${place}哪些 Apple 直營店目前有 ${model} 上架？`),
    placeStockNone: (place: string, model: string) => zs(`最新一次觀測沒有；${place}一有門市把 ${model} 開放取貨，本頁就會顯示。`),
    nStores: f({ other: "# 家" }),
    placeStockSome: (count: string, stores: string) => zs(`最新一次觀測有 ${count}：${stores}。`),
    countQ: (place: string) => zs(`${place}總共有幾家 Apple 直營店？`),
    nAppleStores: f({ other: "# 家" }),
    countMany: (count: string, stores: string) => zs(`${count}；其中有${stores}。`),
    countOne: (count: string, store: string) => zs(`${count}，也就是${store}。`),
    placeRestockQ: (place: string) => zs(`iPhone 在${place}多久重新上架一次？`),
    placeLastsQ: (place: string) => zs(`${place}重新上架後，貨能在架多久？`),
    placeNearestQ: (place: string) => zs(`${place}以外，最近的是哪幾家 Apple 直營店？`),
  },

  explainer: (kind: Kind, place: string) => {
    const at = kind === "store" ? place : kind === "model" ? "全美每家 Apple Store" : `${place}的 Apple 直營店`;
    return [
      "門市取貨的貨屬於 apple.com：結帳時要挑一種組合和一家門市，線上付款，再本人到店領取，不少人當天就能拿到。店內現場陳列的貨和電信業者的貨是另一回事。",
      zs(`ShelfSpring 依同步的庫存資料記錄${at}每一種追蹤中的組合；變化要再經過一次觀測確認，才會寫進觀測簿。`),
      "確認過的變化，每一筆都寫成觀測簿的紀錄；本頁的重新上架圖表和歷史正是由它們畫出來。",
    ];
  },
  alertRule: "每筆追蹤只對應一家門市和一種確切組合；通知會在偵測到上架並完成同步後送出，下單前請以 Apple 的確認為準。",
  titles: {
    state: (name: string, duoNow: string, stores: string) => [
      `${name} Apple Store：${stores} 家中 ${duoNow} 家現在有 iPhone Duo`,
      `${name} Apple Store iPhone Duo 門市取貨即時現貨`,
      `${name} Apple Store iPhone Duo 現貨`,
      `${name} Apple Store iPhone 現貨`,
    ].map(zs),
    city: (city: string, code: string, duoNow: string, stores: string) => [
      `${city}（${code}）Apple Store：${stores} 家中 ${duoNow} 家有 iPhone Duo`,
      `${city}（${code}）Apple Store iPhone Duo 門市取貨現貨`,
      `${city} Apple Store iPhone Duo 現貨`,
      `${city} Apple Store iPhone 現貨`,
    ].map(zs),
    /** 門市頁 <title> 與 H1：店名在前（大家搜的就是「apple 信義 a13」），再接現貨、庫存、取貨、營業時間。 */
    store: (name: string, region: string | null) => {
      const r = region ? `（${region}）` : "";
      return [
        `${name}${r}：iPhone 現貨查詢、庫存、門市取貨與營業時間`,
        `${name}${r}：iPhone 現貨查詢、門市取貨與營業時間`,
        `${name}${r}：iPhone 現貨與營業時間`,
        `${name}：iPhone 現貨查詢、庫存、門市取貨與營業時間`,
        `${name}：iPhone 現貨與營業時間`,
        `${name}：iPhone 現貨`,
        `${name} 現貨`,
      ].map(zs);
    },
    model: (name: string, storesNow: string) => [
      `${name} 門市取貨現貨：現在 ${storesNow} 家 Apple Store 有貨`,
      `${name} 門市取貨現貨：${storesNow} 家 Apple Store 有貨`,
      `${name} 門市取貨即時現貨`,
    ].map(zs),
  },

  tokens: {
    tooFewToMeasure: "暫時量不出來",
    noneLoggedYet: "觀測簿還沒有紀錄",
    noneYet: "還沒記到",
  },

  pattern: {
    none: (days: string) => `${days} 天觀測簿裡沒有確認的重新上架。`,
    nConfirmed: f({ other: "確認的重新上架 # 次" }),
    countIn: (count: string, days: string) => `${days} 天內${count}`,
    stay: (minutes: string) => `；在架時間中位數約 ${minutes} 分鐘`,
    nDays: f({ other: "# 天" }),
    tooFew: (count: string, onDays: string | null, stay: string) => `${count}${onDays ? `，全都落在 ${onDays}` : ""}：分散的天數不夠，還說不出慣常時段${stay}。`,
    usual: (hour: string, weekday: string | null, count: string, stay: string) => `重新上架集中在當地時間${hour}附近${weekday ? `，最常出現在${weekday}` : ""}；${count}${stay}。`,
  },
  regionNouns: {
    state: f({ other: "州" }),
    province: f({ other: "省" }),
    area: f({ other: "地區" }),
    department: f({ other: "省" }),
    prefecture: f({ other: "都道府縣" }),
    emirate: f({ other: "酋長國" }),
    canton: f({ other: "州" }),
    region: f({ other: "大區" }),
    county: f({ other: "省" }),
    city: f({ other: "縣市" }),
  } as Record<string, Forms>,

  measured: "方法說明",

  faqTitle: "大家常問的問題",
  breadcrumb: "頁面路徑",
  keepExploring: "觀測簿的其他頁面",
  browse: {
    storesByState: "依州瀏覽",
    allStatesCities: "所有州與城市 →",
    liveByModel: "各機型的上架狀態",
    modelStock: (model: string) => `${model} 上架情況`,
    thisPage: "目前所在",
    restockLog: (short: string) => `${short} 上架日誌`,
    liveMap: "地圖檢視",
    mostStores: "門市數最多",
    allStates: "每一州",
    bigCities: "大城市",
    cities: "有門市的城市",
    storesBy: (region: string) => `依${region}瀏覽`,
    allStoresIn: ({ country }: { inName: string; country: string }) => <>{zs(`${country}完整門市列表`)} →</>,
    allRegions: (regions: string) => `${regions}完整列表`,
  },
  modelCards: "逐一機型",
  narrative: {
    lastRestock: (config: ReactNode, at: ReactNode, ago: ReactNode) => <>最近記到的重新上架：{config}{at}，{ago}。</>,
    at: (store: ReactNode) => <> · {store}</>,
  },
  statStrip: {
    inStockNow: "目前上架中",
    ofStores: (k: string) => `橫跨 ${k} 家門市`,
    stores: "地點",
    nCities: f({ other: "分布在 # 個城市" }),
    tracked: "已進觀測簿",
    modelNow: (short: string) => `${short} 上架中`,
    configsInStock: "種組合上架中",
    storesWithStock: f({ other: "家門市有上架" }),
    restocks24h: "重新上架 · 24 小時",
    restocksHint: (week: string, month: string, days: string) => `7 天：${week} · ${days} 天：${month}`,
    sellOuts: (days: string) => `又下架（${days} 天）`,
    stays: (duration: string) => (/^不到/.test(duration) ? `在架中位數 ${duration}` : `在架中位數約 ${duration}`),
    noPairs: "還沒有完整配對",
    lastRestock: "最近一次重新上架",
    noneYet: "還沒記到",
    inLastDays: (days: string) => `${days} 天內`,
  },
  product: {
    chooseIphone: "挑機型",
    storage: "容量",
    color: "機身色",
    all: "不限",
    numbersAre: (unit: ReactNode) => <>每個數字 = 目前有它上架的{unit}數。</>,
    seen: (ago: ReactNode) => <>記於 {ago} · 上架中</>,
    last: (ago: ReactNode) => <>上次在架 {ago} · 目前已下架</>,
    notSeenYet: "還沒記到上架",
    firstCheckPending: "等第一次觀測",
    inStock: "上架中",
    inStockLower: "上架中",
    none: "已下架",
    here: "就在這",
    notAvailable: "已下架",
    notCheckedYet: "還沒有觀測",
    availableForPickup: "已上架可取貨",
    since: (ago: ReactNode) => <> · 第一次記到 {ago}</>,
    lastInStock: (ago: ReactNode) => <>上次在架 {ago}</>,
    neverSeen: "這個貨架還沒記到過",
    firstCheckSoon: "第一次觀測即將進行",
    buy: "透過 apple.com 下單",
    checked: (checked: ReactNode, note: ReactNode) => <>觀測於 {checked} · {note}</>,
    checkNote: "庫存資料經常更新",
  },

  source: (source: ReactNode) => <>資料：{source}</>,
  photoCredit: (link: ReactNode) => <>圖片：{link}</>,
  sources: "參考資料",
  allUsStores: "美國整整 269 家 Apple Store",
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>{where}的 ShelfSpring 庫存紀錄：歷史涵蓋從 {since} 開始，數字更新於 {asOf}。偵測到符合條件的上架後才會發出提醒；來源查詢、資料同步和推播送達都可能有延遲。歷史涵蓋的起始日說的是資料範圍，不是 ShelfSpring 成立多久。</>,
  live: {
    configsCaption: (stores: ReactNode, model: ReactNode) => <>{model}：這次觀測中，{stores} 家 Apple Store 裡各組合有幾家上架</>,
    storage: "容量",
    pricesCaption: (model: ReactNode) => <>apple.com 上的 {model}：空機未稅標價，旁邊是目前有上架的門市數</>,
    price: "標價",
    bestColor: "上架最多的機身色（門市數）",
    noRestock: (model: string) => zs(`觀測簿還沒有 ${model} 重新上架。`),
    clockLabel: (model: string) => zs(`美國各門市的 ${model}`),
    storesWithIt: "上架中的門市",
    pairsInStock: "上架中的「門市 × 組合」",
    restocksLogged: "觀測簿裡的重新上架",
    medianTime: "在架時間中位數",
    underOneMin: (min: string) => `< ${min}`,
  },

  /** 圖片說明：只翻通用圖與台灣的地點圖，其他 id 沿用英文。 */
  photos: {
    "apple-store-pickup-counter": { alt: "Apple Store 店裡掛著 Pickup 牌子的木頭取貨櫃台", caption: "線上下單、門市取貨，就是在這種櫃台交貨。" },
    "phone-map": { alt: "街頭有人拿手機看地圖找路", caption: "貨只在架一分鐘上下時，路程遠近比想像中重要。" },
    "phone-card-payment": { alt: "一位女性拿著 iPhone 和信用卡在線上付款", caption: "先線上付款，之後才到門市領。" },
    "phone-on-box": { alt: "一支新手機，擱在白色盒子上", caption: "盒子剛打開的新機。" },
    "city-map-phone": { alt: "兩個人一起用手機看城市地圖", caption: "先想好要去哪家門市的路線。" },
    "phone-notification": { alt: "手上手機的鎖定畫面跳出一則通知", caption: "提醒會跳在鎖定畫面上，不用先開 App。" },
    "apple-store-crowd-inside": { alt: "購物中心裡擠滿人的 Apple Store", caption: "上市週的人潮：貨一上架，幾分鐘內就下架。" },
    "apple-store-glass-canopy": { alt: "天黑後，一家玻璃外牆、木頭頂棚的 Apple Store", caption: "晚上亮起燈的玻璃門市。" },
    "apple-store-night-vancouver": { alt: "溫哥華夜裡亮著燈的 Apple Store", caption: "夜裡的 Apple Store：重新上架隨時可能發生，不過多半在早上。" },
    "phone-hand-camera": { alt: "手上拿著三鏡頭 iPhone", caption: "大家搶的，就是 Pro 機型。" },
    "place-tw-taiwan": { alt: "藍天下，從信義區遠眺台北 101", caption: "台北 101 與信義區一帶。" },
  },
};

export const content: Dict["content"] = withShelfContent("zh-TW", baseContent);
