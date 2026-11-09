import { withShelfContent } from "@/lib/seo/localizedCopy";
/**
 * 繁體中文（香港）: content — FAQ 答句、瀏覽連結、數字條、產品元件、資料來源、即時元件、enrich 的小工具（開舖時間、
 * 時長、標題）、即時 token、回架規律句與圖片文字。FAQ 的 `where` 是不帶介詞的地點名詞；數量自帶量詞（「31 次確認回架」、「2 個配置」）。
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import type { Forms } from "@/lib/i18n/format";
import { CHECK, cleanCountry, tidyAddress, tidyPhone } from "./common";

const f = (x: Forms): Forms => x;
type Kind = "state" | "city" | "store" | "model";

/** "Apple ifc mall（中環） · 3 km": a nearby store and the line nearLine built ("中環｜3 km"); the place is dropped when the store's name already says it. */
function storeIn(store: string, line: string): string {
  const [place, dist] = line.split("｜");
  if (dist == null) return store.includes(place) ? store : `${store} · ${place}`;
  return store.includes(place) ? `${store} · ${dist}` : `${store} · ${place} ${dist}`;
}

const baseContent: Dict["content"] = {
  hours: {
    closed: "關門",
    everyDay: (hours: string) => `一週七日 ${hours}`,
    tomorrow: "明天",
    dayAt: (day: string, time: string) => `${day} ${time}`,
    closedTodayOpens: (next: string) => `今日關門 · ${next} 再開`,
    closedToday: "今日全日關門",
    opensAt: (time: string) => `${time} 開舖`,
    openNow: (closes: string) => `營業至 ${closes}`,
    closedNowOpens: (next: string) => `暫時關門 · ${next} 再開`,
    closedNow: "暫時關門",
  },

  duration: {
    underAMinute: "少於一分鐘",
    pair: (a: string, b: string) => `${a} ${b}`,
  },
  listMore: (k: string) => `另外 ${k} 個`,
  nearLine: (place: string, distance: string) => `${place}｜${distance}`,

  faq: {
    where: (_kind: Kind, place: string) => place,
    nRestocks: f({ other: "# 次確認回架" }),
    restockA: ({ count, where, days, week, peak }: { count: string | null; where: string; days: string; week: string; peak: { hour: string; day: string | null } | null }) =>
      `${count == null ? `${days} 日的觀察簿裏，${where}沒有任何回架` : `${days} 日的觀察簿裏，${where}有 ${count}，其中 ${week} 次在本週`}${peak ? `；多數集中在當地時間${peak.hour}前後${peak.day ? `，一週中以${peak.day}最忙` : ""}` : ""}，而 Apple 並不公開送貨日程。`,
    lastsNone: (where: string) => `${where}完成「回架→落架」的記錄仍不夠，暫時量度不了。`,
    lasts: (days: string, duration: string) => `${days} 日觀察簿中，由回架到下一次落架，在架時間中位數約為 ${duration}。`,
    storeIn,
    nearestA: (stores: string) => `最接近的其他選擇：${stores}。`,

    modelStockQ: (model: string) => `${model} 此刻在哪裏在架？`,
    modelStockNone: (model: string) => `最新一次觀察中哪裏都沒有；只要有美國 Apple Store 把 ${model} 放上取貨，本頁清單便會更新。`,
    nUsStores: f({ other: "# 間美國 Apple Store" }),
    modelStockSome: (count: string) => `最新一次觀察中見於 ${count}；下面逐一列出每間店和它在架的配置。`,
    priceQ: (model: string) => `${model} 在 apple.com 標價多少？`,
    priceA: (low: string, high: string, storages: string, colors: string) => `無鎖版標價按容量（${storages}）由 ${low} 至 ${high}，機色有${colors}。`,
    modelRestockQ: (model: string) => `${model} 多久回架一次？`,
    modelLastsQ: (model: string) => `回架後的 ${model} 會在架多久？`,
    reserveQ: (model: string) => `落單之前，可以先替我留起一部 ${model} 嗎？`,
    reserveA: "落單之前不可以：店舖上架某個配置後，你要在 apple.com 落單並揀選店內取貨，貨品才會在你的取貨時段替你留起。",

    storeStockQ: (store: string, model: string) => `${store}此刻有 ${model} 在架嗎？`,
    nConfigs: f({ other: "# 個配置" }),
    storeStockYes: (count: string) => `有：最新一次觀察有 ${count}，容量和機色見本頁表格。`,
    storeStockNo: (other: { pro: string; proMax: string } | null) => `最新一次觀察中沒有${other ? `；不過此店有 ${other.pro} 個 iPhone 18 Pro 和 ${other.proMax} 個 18 Pro Max 配置在架` : "，18 Pro 和 18 Pro Max 也同樣落架"}。`,
    hoursQ: (store: string) => `${store}幾點開門？`,
    hoursA: ({ hours, today, address, phone }: { hours: string | null; today: string | null; address: string; phone: string | null }) =>
      `${hours ?? "開舖時間見本頁"}${today ? `（今日 ${today.replace(/\s*\((.+)\)$/, "，$1")}）` : ""}，地址：${tidyAddress(address)}${phone ? `；電話 ${tidyPhone(phone)}` : ""}。`,
    storeRestockQ: (store: string) => `iPhone 在${store}多久回架一次？`,
    storeLastsQ: (store: string) => `${store}的回架會在架多久？`,
    storeNearestQ: (store: string) => `離${store}最近的其他 Apple Store 有哪些？`,

    placeStockQ: (place: string, model: string) => `${place}哪些 Apple Store 此刻有 ${model} 在架？`,
    placeStockNone: (place: string, model: string) => `最新一次觀察中沒有；${place}一有店把 ${model} 放上取貨，本頁就會顯示。`,
    nStores: f({ other: "# 間店" }),
    placeStockSome: (count: string, stores: string) => `最新一次觀察有 ${count}：${stores}。`,
    countQ: (place: string) => `${place}一共有幾間 Apple Store？`,
    nAppleStores: f({ other: "# 間 Apple Store" }),
    countMany: (count: string, stores: string) => `${count}；其中包括${stores}。`,
    countOne: (count: string, store: string) => `${count}，就是${store}。`,
    placeRestockQ: (place: string) => `iPhone 在${place}多久回架一次？`,
    placeLastsQ: (place: string) => `${place}回架之後，貨能在架多久？`,
    placeNearestQ: (place: string) => `${place}以外，最近的是哪幾間 Apple Store？`,
  },

  explainer: (kind: Kind, place: string) => {
    const at = kind === "store" ? place : kind === "model" ? "美國每一間 Apple Store" : `${place}的 Apple Store`;
    return [
      "店舖取貨的貨源屬於 apple.com：結帳時要揀一個配置和一間店，網上付款，再親身到店提取，很多時即日可取。店內現場陳列的貨和電訊商的貨是另一回事。",
      `ShelfSpring 從同步的存貨資料記錄${at}每個追蹤中的配置；變化要再有一次觀察確認，才會寫入觀察簿。`,
      "確認了的變化，各自成為觀察簿的一筆記錄；本頁的回架圖表和歷史正是由這些記錄畫出。",
    ];
  },
  alertRule: "每項監察只對應一間店和一個確切配置；通知在偵測到在架並完成同步後發出，落單前請以 Apple 確認為準。",
  titles: {
    state: (name: string, duoNow: string, stores: string) => [
      `${name} Apple Store：${stores} 間中 ${duoNow} 間現有 iPhone Duo`,
      `${name} Apple Store：iPhone Duo 即時取貨現貨`,
      `${name} Apple Store：iPhone Duo 現貨`,
      `${name} Apple Store iPhone 現貨`,
    ],
    city: (cityName: string, code: string, duoNow: string, stores: string) => [
      `${cityName}, ${code} Apple Store：${stores} 間中 ${duoNow} 間有 iPhone Duo`,
      `${cityName}, ${code} Apple Store：iPhone Duo 取貨現貨`,
      `${cityName}, ${code} Apple Store：iPhone Duo 現貨`,
      `${cityName} Apple Store iPhone 現貨`,
    ],
    store: (name: string, region: string | null) => {
      const r = region ? `（${region}）` : "";
      return [
        `${name}${r}：iPhone 現貨・取貨・營業時間`,
        `${name}${r}：iPhone 現貨及營業時間`,
        `${name}${r}：iPhone 現貨`,
        `${name}：iPhone 現貨・取貨・營業時間`,
        `${name}：iPhone 現貨及營業時間`,
        `${name}：iPhone 現貨`,
        `${name} 現貨`,
      ];
    },
    model: (name: string, storesNow: string) => [
      `${name} 取貨現貨：現有 ${storesNow} 間 Apple Store 有貨`,
      `${name} 取貨現貨：${storesNow} 間 Apple Store 有貨`,
      `${name} 店舖取貨即時現貨`,
    ],
  },

  tokens: {
    tooFewToMeasure: "暫時量度不了",
    noneLoggedYet: "觀察簿暫未有記錄",
    noneYet: "仍未記錄",
  },

  pattern: {
    none: (days: string) => `${days} 日觀察簿內沒有確認的回架。`,
    nConfirmed: f({ other: "確認回架 # 次" }),
    countIn: (count: string, days: string) => `${days} 日內${count}`,
    stay: (minutes: string) => `；在架時間中位數約 ${minutes} 分鐘`,
    nDays: f({ other: "# 日" }),
    tooFew: (count: string, onDays: string | null, stay: string) => `${count}${onDays ? `，全部落在 ${onDays}` : ""}：分散的日子不夠，說不出慣常鐘點${stay}。`,
    usual: (hour: string, weekday: string | null, count: string, stay: string) => `回架集中在當地時間${hour}前後${weekday ? `，以${weekday}最常見` : ""}；${count}${stay}。`,
  },
  regionNouns: {
    state: f({ other: "州" }),
    province: f({ other: "省" }),
    area: f({ other: "地區" }),
    department: f({ other: "省" }),
    prefecture: f({ other: "縣" }),
    emirate: f({ other: "酋長國" }),
    canton: f({ other: "州" }),
    region: f({ other: "大區" }),
    county: f({ other: "郡" }),
    city: f({ other: "縣市" }),
  } as Record<string, Forms>,

  measured: "方法說明",

  faqTitle: "常被問到的問題",
  breadcrumb: "頁面路徑",
  keepExploring: "觀察簿的其他頁面",
  browse: {
    storesByState: "按州份瀏覽",
    allStatesCities: "每個州份及城市 →",
    liveByModel: "各 iPhone 的在架狀態",
    modelStock: (model: string) => `${model} 在架情況`,
    thisPage: "你在這裏",
    restockLog: (short: string) => `${short} 回架日誌`,
    liveMap: "地圖檢視",
    mostStores: "店數最多",
    allStates: "每個州份",
    bigCities: "大城市",
    cities: "有店的地區",
    storesBy: (region: string) => `按${region}瀏覽`,
    allStoresIn: ({ country }: { inName: string; country: string }) => <>{cleanCountry(country)}完整店舖清單 →</>,
    allRegions: (regions: string) => `${regions}完整清單`,
  },
  modelCards: "逐個型號",
  narrative: {
    lastRestock: (config: ReactNode, at: ReactNode, ago: ReactNode) => <>最近錄得的回架：{config}{at}，{ago}。</>,
    at: (store: ReactNode) => <> · {store}</>,
  },
  statStrip: {
    inStockNow: "此刻在架",
    ofStores: (k: string) => `橫跨 ${k} 間店`,
    stores: "地點",
    nCities: f({ other: "分佈 # 個地區" }),
    tracked: "已入觀察簿",
    modelNow: (short: string) => `${short} 在架`,
    configsInStock: "在架配置",
    storesWithStock: f({ other: "間店有貨在架" }),
    restocks24h: "回架 · 24 小時",
    restocksHint: (week: string, month: string, days: string) => `7 日：${week} · ${days} 日：${month}`,
    sellOuts: (days: string) => `再落架（${days} 日）`,
    stays: (duration: string) => (/^少於|^不足/.test(duration) ? `在架中位 ${duration}` : `在架中位約 ${duration}`),
    noPairs: "未有完整配對",
    lastRestock: "最近回架",
    noneYet: "仍未記錄",
    inLastDays: (days: string) => `${days} 日內`,
  },
  product: {
    chooseIphone: "揀型號",
    storage: "容量",
    color: "機色",
    all: "不限",
    numbersAre: (unit: ReactNode) => <>每個數字 = 此刻有它在架的{unit}。</>,
    seen: (ago: ReactNode) => <>錄於 {ago} · 在架</>,
    last: (ago: ReactNode) => <>最後在架 {ago} · 現已落架</>,
    notSeenYet: "仍未錄得在架",
    firstCheckPending: "等候首次觀察",
    inStock: "在架",
    inStockLower: "在架",
    none: "落架",
    here: "就在此",
    notAvailable: "落架",
    notCheckedYet: "仍未有觀察",
    availableForPickup: "已上架可取貨",
    since: (ago: ReactNode) => <> · 首次錄得 {ago}</>,
    lastInStock: (ago: ReactNode) => <>最後在架 {ago}</>,
    neverSeen: "這個貨架仍未錄得",
    firstCheckSoon: "首次觀察快將進行",
    buy: "經 apple.com 落單",
    checked: (checked: ReactNode, note: ReactNode) => <>觀察於 {checked} · {note}</>,
    checkNote: CHECK,
  },

  source: (source: ReactNode) => <>數據：{source}</>,
  photoCredit: (link: ReactNode) => <>圖片：{link}</>,
  sources: "參考資料",
  allUsStores: "美國整套 269 間 Apple Store",
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>{where}的 ShelfSpring 存貨記錄：歷史覆蓋由 {since} 起，數字更新於 {asOf}。偵測到符合條件的在架配置後才會發出提示；來源查詢、資料同步與推送都可能帶來延遲。歷史覆蓋的起始日說的是資料範圍，不是 ShelfSpring 成立多久。</>,
  live: {
    configsCaption: (stores: ReactNode, model: ReactNode) => <>{model}：此次觀察中，{stores} 間 Apple Store 裏各配置有幾多間在架</>,
    storage: "容量",
    pricesCaption: (model: ReactNode) => <>apple.com 上的 {model}：無鎖版未連稅標價，旁邊是此刻有上架的店數</>,
    price: "標價",
    bestColor: "上架最多的機色（店數）",
    noRestock: (model: string) => `觀察簿暫未有 ${model} 回架。`,
    clockLabel: (model: string) => `美國各店的 ${model} `,
    storesWithIt: "上架中的店",
    pairsInStock: "在架的「店 × 配置」",
    restocksLogged: "觀察簿內的回架",
    medianTime: "在架時間中位數",
    underOneMin: (min: string) => `< ${min}`,
  },

  photos: {
    "apple-store-pickup-counter": { alt: "一張木櫃檯，上方掛着 Apple Store 的「Pickup」指示", caption: "網上落單的店內取貨，就在這種櫃檯交收。" },
    "phone-map": { alt: "街上有人拿着手機看地圖找路", caption: "貨只在架一分鐘左右時，路程遠近比想像中重要。" },
    "phone-card-payment": { alt: "女士一手 iPhone、一手信用卡，正在網上結帳", caption: "先在網上付款，之後才到店提取。" },
    "phone-on-box": { alt: "一部新手機，擱在白色盒子上面", caption: "盒子剛打開的新機。" },
    "city-map-phone": { alt: "兩人一起用手機看城市地圖", caption: "先想好去哪間店的路線。" },
    "phone-notification": { alt: "握在手裏的手機，鎖屏上有一則通知", caption: "提示會落在鎖屏上，不用先開 App。" },
    "apple-store-crowd-inside": { alt: "商場內擠滿人的 Apple Store", caption: "發售週的人潮：貨一上架，幾分鐘內就清空。" },
    "apple-store-glass-canopy": { alt: "夜裏的 Apple Store，玻璃幕牆配木簷篷", caption: "天黑之後，玻璃外牆亮起來的分店。" },
    "apple-store-night-vancouver": { alt: "溫哥華一間夜裏亮着燈的 Apple Store", caption: "夜晚的 Apple Store：回架可以在任何鐘點出現，不過多數在早上。" },
    "phone-hand-camera": { alt: "手上一部三鏡頭 iPhone", caption: "大家搶的，正是 Pro 型號。" },
    "place-hk-hong-kong": { alt: "由九龍望過維港，對岸是港島高樓和 Two IFC", caption: "香港島的海旁，國金二期（Two IFC）在正中。" },
  },
};

export const content: Dict["content"] = withShelfContent("zh-HK", baseContent);
