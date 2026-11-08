/**
 * 台灣中文：modules —— 補貨、門市與現貨模組。`label` 是頁面給的地點名詞（「台灣」「台北」「Apple 信義 A13」
 * 「這家店」），句子自己接上；數字到這裡是原始數字，在這裡加千分位。檢查間隔只寫 15 秒與 5 秒。
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { colorLabel } from "../../places";
import { L, n, zs } from "./util";


export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => zs(`${label}最近 ${days} 天還沒有補貨或售完紀錄，第一筆出現後圖表就會開始累積。`),
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      zs(`${label}最近 ${days} 天共補貨 ${n(restocks)} 次、售完 ${n(soldouts)} 次，分布在 ${activeDays} 個不同的日子。`),
    busiest: (day: string, restocks: number) => <>最多的一天是 <b className="text-ink">{day}</b>，共 {n(restocks)} 次。</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day}：補貨 ${restocks} 次，售完 ${soldouts} 次`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day}：補貨 ${restocks} · 售完 ${soldouts}`,
    legendRestocks: "補貨",
    legendSoldouts: "售完",
  },

  last24: {
    title: (label: string) => zs(`${label}過去 24 小時的 iPhone Duo 補貨`),
    asOf: (when: string) => `截至 ${when}`,
    localTime: (when: string) => `當地時間 ${when}`,
    anAppleStore: "一家 Apple 直營店",
    unknown: "暫時讀不到過去 24 小時的統計；本頁的即時現貨與補貨紀錄不受影響。",
    none: (label: string, asOf: string) => <><b className="text-ink">{zs(`${label}過去 24 小時沒有 iPhone Duo 補貨`)}</b>（截至 {asOf}）。</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <>過去 24 小時，iPhone Duo <b className="text-ink">{zs(o.one ? `在${o.label}補貨 ${n(o.restocks)} 次` : `在${o.label} ${o.allStores} 家 Apple 直營店中的 ${o.withStores} 家補貨 ${n(o.restocks)} 次`)}</b>；最近一次：<b className="text-ink">{o.config}</b>{o.store != null && <>，在 {o.store}</>}，當地時間 {o.when}。</>
    ),
    tileRestocks: "確認補貨 · 24 小時",
    tileConfigsBack: "回補的規格",
    tileStores: (configs: number, allConfigs: number) => `有補貨的門市${configs ? ` · ${allConfigs} 種規格中 ${configs} 種` : ""}`,
    tileLatest: (config: string, store: string | null) => <>最近一次 · {config}{store != null && <> · {store}</>}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>再之前一次 · {config}{store != null && <> · {store}</>} · {day}</>,
    tileNoEarlier: "沒有更早的補貨紀錄",
    caption: (label: string, asOf: string) => zs(`${label}各 iPhone Duo 規格過去 24 小時確認的補貨，截至 ${asOf}`),
    thConfig: "規格",
    thRestocks: "補貨",
    thStores: "門市",
    thLast: "上次補貨（當地時間）",
    thNow: "現在有貨",
    ofStores: (k: number, total: number) => `${total} 家中 ${k} 家`,
    noneIn24: "24 小時內沒有",
    yes: "有",
    no: "沒有",
    countedTitle: "補貨怎麼算",
    counted: "一次補貨是某門市的某個規格由無貨變為有貨，並經確認的事件。重複恢復供貨會分開計算，不代表手機台數。 庫存表代表上次查詢時的狀態。歷史紀錄呈現哪些門市曾恢復供貨，不預測下一批到貨時間。",
    alert: (label: string | null) => `設定手機補貨通知${label ? ` · ${label}` : ""}`,
  },

  clock: {
    none: (label: string, days: number) => zs(`${label}最近 ${days} 天還沒有補貨紀錄。`),
    thin: (total: number, label: string, days: number, dates: number | null) =>
      zs(`${label}最近 ${days} 天補貨 ${n(total)} 次${dates != null ? `（分布在 ${dates} 天）` : ""}，還太少，看不出規律。`),
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>{zs(`${label}最近 ${days} 天補貨 ${n(total)} 次，多半落在當地時間`)}<b className="text-ink">{hour}</b>前後{day ? <>，<b className="text-ink">{day}</b>最多</> : null}。</>
    ),
    byHour: (zone: string) => `依小時 · ${zone}`,
    byWeekday: "依星期",
    barReported: (k: number) => `（另有其他追蹤網站回報 ${k} 次）`,
    barReportedTitle: (bar: string, k: number) => `${bar}：其他追蹤網站回報 ${k} 次`,
    legendOurs: "已記錄的補貨",
  },

  feed: {
    empty: "還沒有補貨紀錄。",
    available: "有現貨",
    soldOut: "已售完",
    soldOutAt: (time: ReactNode) => <>{time} 售完</>,
    since: (time: ReactNode) => <>{time} 上架</>,
    restockedAt: (time: ReactNode) => <>{time} 補貨</>,
    mapAria: (store: string) => zs(`在地圖上查看${store}`),
    map: "地圖",
    buyAria: (model: string, config: string) => `在 apple.com 購買 ${model} ${config}`,
    buy: "前往 apple.com 購買",
  },

  byConfig: {
    empty: (label: string, days: number) => zs(`${label}最近 ${days} 天還沒有任何規格補貨，所以還沒有排名。`),
    intro: (label: string, days: number) => zs(`${label}最近 ${days} 天補貨過的規格，次數多的在前。`),
    times: (k: number) => `${n(k)} 次`,
    alert: "通知我",
  },

  sellout: {
    typical: (label: string, band: string) => zs(`在${label}，iPhone Duo 補貨通常約 ${band}就賣完。`),
    half: (label: string, duration: string) => zs(`在${label}，一半的補貨在 ${duration}內就賣完。`),
    none: (label: string, days: number) => zs(`${label}最近 ${days} 天還沒有賣完的補貨。`),
    whatDuo: "iPhone Duo",
    whatAll: "所有 iPhone",
    tileHalf: (what: string) => <>一半在這時間內賣完 · {what}</>,
    tileWithin30: "30 秒內賣完",
    tileWithin60: "1 分鐘內賣完",
    tileFastest: (k: number, days: number) => <>最快 · {days} 天內 {n(k)} 次售完</>,
    caption: (days: number) => `依機型，最近 ${days} 天`,
    thIphone: "iPhone",
    thSoldOut: "售完次數",
    thHalf: "一半賣完於",
    thWithin30: "≤ 30 秒",
    thWithin60: "≤ 1 分鐘",
    thFastest: "最快",
    each: "每一次補貨",
    barNote: (full: string) => `長條 = 上架秒數 · ${full}為滿格`,
    stillListed: (duration: string) => `仍在架上 · ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "怎麼量的",
    measured: (_estimated: boolean) => { void _estimated; return "上架時間介於最後一次確認有貨與第一次確認無貨的觀察之間。≈代表估計區間。比查詢間隔更短的上架可能被遺漏，這些時長不保證能完成結帳。"; },
  },

  configTable: {
    title: "這家店的所有規格",
    titleAt: (store: string) => zs(`${store}的所有規格`),
    lookupOff: (hasRows: boolean) => `Apple 目前沒有開放這家門市的取貨查詢${hasRows ? "（下方是它最後一次的回應）" : ""}`,
    tracked: (k: number) => `追蹤 ${k} 種規格`,
    firstSweep: "第一輪檢查進行中，一分鐘內就會出現狀態",
    inStock: (k: number, total: number) => `${total} 款中 ${k} 款有現貨`,
    available: "有現貨",
    unavailable: "無現貨",
    noLookup: "不提供取貨查詢",
    notChecked: "尚未檢查",
    since: (ago: ReactNode) => <>{ago}上架</>,
    lastAvailable: (ago: ReactNode) => <>上次有貨：{ago}</>,
    neverHere: "這裡從未出現現貨",
    buy: "購買",
    alertAria: (model: string, config: string, store: string) => zs(`${store}有 ${model} ${config}時通知我`),
    alert: "通知我 →",
  },

  matrix: {
    store: "門市",
    checked: "檢查時間",
    cellTitle: (model: string, k: number, total: number) => `${model}：${total} 款中 ${k} 款有現貨`,
  },

  nearby: {
    duo: (short: string, k: number) => `${short} · ${k}`,
    noDuo: (short: string) => `無 ${short}`,
  },

  stockByModel: {
    availableNow: (k: number, total: number) => `${total} 款中現在有 ${k} 款`,
    noneNow: (total: number) => `${total} 款現在都沒有`,
    lookupOff: "Apple 目前沒有開放這裡的取貨查詢",
    notChecked: "尚未檢查",
    more: (k: number) => `+${k}`,
    checked: (ago: ReactNode) => <>檢查於 {ago}</>,
    alert: "通知我 →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>{ago} · 定期更新庫存</>,
    map: "在地圖上查看",
    alert: "設定這家的通知",
    alsoIn: (region: string) => zs(`${region}其他門市`),
    acrossLine: "州界另一側最近的門市",
    elsewhere: "其他地方最近的門市",
  },

  hours: {
    title: "營業時間",
    local: (zone: string) => `當地時間 · ${zone}`,
    today: (hours: string, week: string) => ` · 今日 ${hours} · ${week}`,
    directions: "路線",
    applePage: "apple.com 門市頁面",
    liveMap: "即時地圖",
    storePage: "門市頁面",
    closed: "休息",
    everyDay: (hours: string) => `每日 ${hours}`,
    openNow: (closes: string) => `營業中 · ${closes} 打烊`,
    opensAt: (opens: string) => `${opens} 開門`,
    closedToday: (next: string | null) => (next ? `今日休息 · ${next} 開門` : "今日休息"),
    closedNow: (next: string | null) => (next ? `已打烊 · ${next} 開門` : "已打烊"),
    nextOpen: (day: string | null, time: string) => `${day ?? "明天"} ${time}`,
  },

  liveStats: {
    inStock: "目前有現貨",
    storesWith: "有貨門市",
    lastCheck: "上次檢查",
    none: "—",
  },

  board: {
    summary: (k: number, stores: number, short: string) => `${stores} 家門市中有 ${k} 家有 ${short} 現貨`,
    lastCheck: (ago: ReactNode) => <>上次檢查 {ago}</>,
    firstSweep: "第一輪檢查進行中。",
    noneListed: (model: string, storage: string | null, color: string | null) => `目前沒有門市上架 ${model}${storage ? ` ${storage}` : ""}${color ? ` ${colorLabel(color, L)}` : ""}。`,
    more: (k: number) => `+${k}`,
    seen: (ago: ReactNode) => <>{ago}看到</>,
    loading: "載入現貨中",
  },

  /** DuoLedger：地區、城市、門市、國家與 Duo 機型頁開頭的觀測帳冊。`place` 是不帶介詞的地名或店名。 */
  duoLedger: {
    kicker: (place: string) => `觀測帳冊 · iPhone Duo · ${place}`,
    headNone: (o) => zs(`${o.place} ${n(o.n)} 家 Apple 直營店目前都沒有上架可取貨的 iPhone Duo。`),
    headNoneOne: (place: string) => zs(`${place}目前沒有上架任何可取貨的 iPhone Duo 規格。`),
    headSome: (o) => <>{zs(`${o.place} ${n(o.n)} 家 Apple 直營店中有 ${n(o.k)} 家上架可取貨的 iPhone Duo：`)}{o.list}。</>,
    headSomeOne: (o) => <>{zs(`${o.place}上架了 iPhone Duo 全部 ${n(o.total)} 種規格中的 ${n(o.k)} 種：`)}{o.list}。</>,
    storeItem: (store: ReactNode, configs: number) => <>{store}（{n(configs)} 種規格）</>,
    observed: (stamp: string) => `觀測時間 ${stamp}。`,
    lastReturn: (o) => <>最近一次確認補貨：<b className="text-ink">{o.config}</b>{o.store != null && <>，{o.store}</>}，{o.when}{o.lasted ? <>（{o.lasted}）</> : null}。</>,
    noReturnYet: (place: string, since: string) => zs(`自 ${since} 開始記錄以來，${place}沒有確認過 iPhone Duo 補貨。`),
    others: (o) => (o.one ? `iPhone 18 Pro：${n(o.configs)} 種規格中上架 ${n(o.pro)} 種 · 18 Pro Max：${n(o.max)} 種。` : `iPhone 18 Pro：${n(o.pro)} 家門市有貨 · 18 Pro Max：${n(o.max)} 家。`),
    mReturns: (since: string) => `${since} 以來的確認補貨`,
    mStores: "至少補貨一次的門市",
    mDays: "有補貨的天數（追蹤天數中）",
    mWindow: (pct: string) => `最密集的兩小時 · 占紀錄 ${pct}`,
    mPerDay: "每個追蹤日的補貨次數",
    mMedian: "上架時間中位數（從上架到下架）",
    mToday: "今天的補貨（截至目前）",
    secUnit: "秒",
    minUnit: "分",
    note: (o) => zs(o.one
      ? `自 ${o.since} 起，ShelfSpring 在${o.place}記錄了 ${n(o.n)} 次確認的 iPhone Duo 補貨（追蹤 ${n(o.tracked)} 天中有 ${n(o.days)} 天）。最密集的兩小時是 ${o.range}，占紀錄 ${o.pct}（上午 8 點到中午占 ${o.morning}）；單一最多的時段是 ${o.busiest}，共 ${n(o.busiestN)} 次。${o.median ? `一半的上架在 ${o.median} 內下架。` : ""}${o.config ? `補貨最多的規格是 ${o.config}（${n(o.n)} 次中有 ${n(o.top)} 次）。` : ""}`
      : `自 ${o.since} 起，ShelfSpring 在${o.place} ${n(o.stores)} 家 Apple 直營店記錄了 ${n(o.n)} 次確認的 iPhone Duo 補貨，其中 ${n(o.k)} 家至少補貨一次。最密集的兩小時是 ${o.range}（${o.zone}），占紀錄 ${o.pct}（上午 8 點到中午占 ${o.morning}）；單一最多的時段是 ${o.busiest}，共 ${n(o.busiestN)} 次。${o.median ? `一半的上架在 ${o.median} 內下架。` : ""}${o.config ? `補貨最多的規格是 ${o.config}（${n(o.n)} 次中有 ${n(o.top)} 次）。` : ""}`),
    noteFew: (o) => zs(`自 ${o.since} 起，${o.one ? o.place : `${o.place} ${n(o.stores)} 家 Apple 直營店`}確認的 iPhone Duo 補貨只有 ${n(o.n)} 次（${n(o.days)} 天），未達 ShelfSpring 描述常見時段所要求的門檻（${n(o.min)} 次、${n(o.minDays)} 天）。${o.median ? `一半的上架在 ${o.median} 內下架。` : ""}每一次補貨都列在下方帳冊。`),
    hourByHour: "開啟逐小時紀錄 →",
    ledger: (k: number) => `最近 ${n(k)} 次補貨紀錄`,
    col: { observed: "觀測（門市當地時間）", config: "規格", store: "門市", listed: "上架時間" },
    secs: (k: number) => `${n(k)} 秒`,
    mins: (k: number) => `${n(k)} 分鐘`,
    listedRange: (low: string, high: string) => `上架 ${low}–${high}`,
    listedAbout: (x: string) => `上架約 ${x}`,
    stillListed: (x: string) => `仍在架上（${x}）`,
    method: (o) => zs(`紀錄自 ${o.since} 起 · ${o.note} · 連續兩次觀測一致才計為一次補貨；規格首次出現不計。`),
    delivered: (o) => zs(o.one
      ? `過去 ${n(o.days)} 天，ShelfSpring 為${o.place}的補貨向會員送出了 ${n(o.sent)} 則提醒。`
      : `過去 ${n(o.days)} 天，ShelfSpring 為${o.place} ${n(o.total)} 家 Apple 直營店中 ${n(o.stores)} 家的補貨向會員送出了 ${n(o.sent)} 則提醒。`),
    watch: (place: string) => zs(`追蹤${place}的規格 →`),
    watchOne: "追蹤這家門市的規格 →",
    unknown: "暫時讀不到觀測紀錄；上方的即時上架資訊不受影響。",
    zone: () => "當地時間",
    allModels: (o) => zs(`全部型號合計：${n(o.days)} 天內 ${n(o.n)} 次補貨${o.peak ? `，最多的時段是 ${o.peak}` : ""}。`),
  },
};
