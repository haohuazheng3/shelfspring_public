/**
 * 繁體中文（香港）: modules — the restock, store and stock modules. `label` is a bare place noun ("香港",
 * "Apple Canton Road（廣東道）", "本店", "你的 3 間分店"); each sentence places it. Only 15 s and 5 s intervals.
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { n, zhCfg } from "./common";

export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `${label}過去 ${n(days)} 日未有補貨或售罄記錄——圖表會由第一次開始累積。`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `${label}過去 ${n(days)} 日共補貨 ${n(restocks)} 次、售罄 ${n(soldouts)} 次，分佈在 ${n(activeDays)} 個不同日子。`,
    busiest: (day: string, restocks: number) => <>最多的一日是 <b className="text-ink">{day}</b>，共 {n(restocks)} 次。</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day}：補貨 ${n(restocks)} 次，售罄 ${n(soldouts)} 次`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day}：補貨 ${n(restocks)} 次 · 售罄 ${n(soldouts)} 次`,
    legendRestocks: "補貨",
    legendSoldouts: "售罄",
  },

  last24: {
    title: (label: string) => `${label}過去 24 小時的 iPhone Duo 補貨`,
    asOf: (when: string) => `截至 ${when}`,
    localTime: (when: string) => `${when}（當地時間）`,
    anAppleStore: "一間 Apple Store",
    unknown: "暫時未能讀取過去 24 小時的數字；本頁的即時現貨和補貨記錄不受影響。",
    none: (label: string, asOf: string) => <><b className="text-ink">{label}過去 24 小時沒有 iPhone Duo 補貨</b>（截至 {asOf}）。</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <>過去 24 小時，<b className="text-ink">{o.one ? o.label : `${o.label} ${n(o.allStores)} 間 Apple Store 中有 ${n(o.withStores)} 間`}補貨 iPhone Duo 共 {n(o.restocks)} 次</b>；最近一次：<b className="text-ink">{o.config}</b>{o.store != null && <>，{o.store}</>}，當地時間 {o.when}。</>
    ),
    tileRestocks: "已確認補貨 · 24 小時",
    tileConfigsBack: "重新上架的款式",
    tileStores: (configs: number, allConfigs: number) => `有補貨的分店${configs ? ` · ${n(allConfigs)} 款中 ${n(configs)} 款` : ""}`,
    tileLatest: (config: string, store: string | null) => <>最近一次 · {config}{store != null && <> · {store}</>}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>之前最後一次 · {config}{store != null && <> · {store}</>} · {day}</>,
    tileNoEarlier: "之前沒有補貨記錄",
    caption: (label: string, asOf: string) => `${label}各款 iPhone Duo 過去 24 小時已確認的補貨，截至 ${asOf}`,
    thConfig: "款式",
    thRestocks: "補貨",
    thStores: "分店",
    thLast: "最近補貨（當地時間）",
    thNow: "現時有貨",
    ofStores: (k: number, total: number) => `${n(total)} 間中 ${n(k)} 間`,
    noneIn24: "24 小時內沒有",
    yes: "有",
    no: "沒有",
    countedTitle: "補貨怎樣計算",
    counted: "一次補貨指某店的某個配置由缺貨變為有貨，並經確認的事件。同一配置再次出現會另計，不等於手機數量。 存貨表顯示上次查詢的狀態。歷史紀錄說明哪些店曾恢復供貨，不預測下一批送貨時間。",
    alert: (label: string | null) => `設定手機補貨通知${label ? ` · ${label}` : ""}`,
  },

  clock: {
    none: (label: string, days: number) => `${label}過去 ${n(days)} 日暫未有補貨記錄。`,
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `${label}過去 ${n(days)} 日補貨 ${n(total)} 次${dates != null ? `（只分佈在 ${n(dates)} 日）` : ""}——次數太少，暫未能看出規律。`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>{label}過去 {n(days)} 日補貨 {n(total)} 次，大多在當地時間<b className="text-ink">{hour}</b>左右出現{day ? <>，<b className="text-ink">{day}</b>最多</> : null}。</>
    ),
    byHour: (zone: string) => `按鐘點 · ${zone}`,
    byWeekday: "按星期",
    barReported: (k: number) => `（另有 ${n(k)} 次由其他追蹤網站報告）`,
    barReportedTitle: (bar: string, k: number) => `${bar}：其他追蹤網站報告 ${n(k)} 次`,
    legendOurs: "已記錄的補貨",
  },

  feed: {
    empty: "暫未有補貨記錄。",
    available: "有貨",
    soldOut: "已售罄",
    soldOutAt: (time: ReactNode) => <>{time} 售罄</>,
    since: (time: ReactNode) => <>{time} 起有貨</>,
    restockedAt: (time: ReactNode) => <>{time} 補貨</>,
    mapAria: (store: string) => `在地圖上顯示${store}`,
    map: "地圖",
    buyAria: (model: string, config: string) => `在 apple.com 購買 ${model} ${config}`,
    buy: "在 apple.com 購買",
  },

  byConfig: {
    empty: (label: string, days: number) => `${label}過去 ${n(days)} 日沒有任何款式補貨，所以暫未有排名。`,
    intro: (label: string, days: number) => `${label}過去 ${n(days)} 日重新上架的款式，次數最多的排最前。`,
    times: (k: number) => `${n(k)} 次`,
    alert: "提醒我",
  },

  sellout: {
    typical: (label: string, band: string) => `${label}的 iPhone Duo 補貨，一般約 ${band}內售罄。`,
    half: (label: string, duration: string) => `${label}一半的補貨在 ${duration}內售罄。`,
    none: (label: string, days: number) => `${label}過去 ${n(days)} 日暫未有補貨售罄。`,
    whatDuo: "iPhone Duo",
    whatAll: "所有 iPhone",
    tileHalf: (what: string) => <>一半在此時間內售罄 · {what}</>,
    tileWithin30: "30 秒內售罄",
    tileWithin60: "1 分鐘內售罄",
    tileFastest: (k: number, days: number) => <>最快 · {n(days)} 日內 {n(k)} 次售罄的補貨</>,
    caption: (days: number) => `按 iPhone 型號，過去 ${n(days)} 日`,
    thIphone: "iPhone",
    thSoldOut: "售罄次數",
    thHalf: "一半售罄所需",
    thWithin30: "≤ 30 秒",
    thWithin60: "≤ 1 分鐘",
    thFastest: "最快",
    each: "逐次補貨",
    barNote: (full: string) => `長條 = 上架秒數 · ${full} 為滿格`,
    stillListed: (duration: string) => `仍在上架 · ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "怎樣量度",
    measured: (_estimated: boolean) => { void _estimated; return "上架時間介乎最後一次確認有貨與首次確認無貨的觀察之間。≈代表估計區間。短於查詢間隔的上架可能被錯過，這些時長不保證能完成結帳。"; },
  },

  configTable: {
    title: "本店每一款配置",
    titleAt: (store: string) => `${store}每一款配置`,
    lookupOff: (hasRows: boolean) => `Apple 現時沒有開放這間分店的店舖取貨查詢${hasRows ? "（下面是它最後給出的結果）" : ""}`,
    tracked: (k: number) => `追蹤 ${n(k)} 款`,
    firstSweep: "首輪檢查進行中——一分鐘內顯示狀態",
    inStock: (k: number, total: number) => `${n(total)} 款中 ${n(k)} 款有貨`,
    available: "有貨",
    unavailable: "沒有貨",
    noLookup: "不設取貨查詢",
    notChecked: "尚未檢查",
    since: (ago: ReactNode) => <>{ago}起有貨</>,
    lastAvailable: (ago: ReactNode) => <>上次有貨：{ago}</>,
    neverHere: "這裏從未有貨",
    buy: "購買",
    alertAria: (model: string, config: string, store: string) => `${store}有 ${model} ${config} 時提醒我`,
    alert: "提醒我 →",
  },

  matrix: {
    store: "分店",
    checked: "最近檢查",
    cellTitle: (model: string, k: number, total: number) => `${model}：${n(total)} 款中 ${n(k)} 款有貨`,
  },

  nearby: {
    duo: (short: string, k: number) => `${short} · ${n(k)}`,
    noDuo: (short: string) => `沒有 ${short}`,
  },

  stockByModel: {
    availableNow: (k: number, total: number) => `現時 ${n(total)} 款中 ${n(k)} 款有貨`,
    noneNow: (total: number) => `${n(total)} 款現時全部沒有貨`,
    lookupOff: "Apple 現時沒有開放這裏的取貨查詢",
    notChecked: "尚未檢查",
    more: (k: number) => `+${n(k)}`,
    checked: (ago: ReactNode) => <>{ago}檢查</>,
    alert: "提醒我 →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>{ago} · 定期更新存貨</>,
    map: "在地圖上顯示",
    alert: "在這裏設定提醒",
    alsoIn: (region: string) => `${region}其他分店`,
    acrossLine: "州界另一邊最近的分店",
    elsewhere: "其他地方最近的分店",
  },

  hours: {
    title: "營業時間",
    local: (zone: string) => `當地時間 · ${zone}`,
    today: (hours: string, week: string) => ` · 今日 ${hours} · ${week}`,
    directions: "路線",
    applePage: "apple.com 分店頁",
    liveMap: "即時地圖",
    storePage: "分店頁",
    closed: "休息",
    everyDay: (hours: string) => `每日 ${hours}`,
    openNow: (closes: string) => `營業中 · ${closes} 關門`,
    opensAt: (opens: string) => `${opens} 開門`,
    closedToday: (next: string | null) => (next ? `今日休息 · ${next} 開門` : "今日休息"),
    closedNow: (next: string | null) => (next ? `現已關門 · ${next} 開門` : "現已關門"),
    nextOpen: (day: string | null, time: string) => `${day ?? "明日"} ${time}`,
  },

  liveStats: {
    inStock: "現時有貨",
    storesWith: "有貨分店",
    lastCheck: "最近檢查",
    none: "—",
  },

  board: {
    summary: (k: number, stores: number, short: string) => `${n(stores)} 間分店中 ${n(k)} 間有 ${short} 現貨`,
    lastCheck: (ago: ReactNode) => <>最近檢查 {ago}</>,
    firstSweep: "首輪檢查進行中。",
    noneListed: (model: string, storage: string | null, color: string | null) => `現時沒有分店有 ${model}${storage ? ` ${storage}` : ""}${color ? ` ${zhCfg(color)}` : ""} 現貨。`,
    more: (k: number) => `+${n(k)}`,
    seen: (ago: ReactNode) => <>{ago}看到</>,
    loading: "載入現貨中",
  },

  /** DuoLedger：地區、城市、分店、國家及 Duo 型號頁開頭的觀測帳冊。`place` 是不帶介詞的地名或店名。 */
  duoLedger: {
    kicker: (place: string) => `觀測帳冊 · iPhone Duo · ${place}`,
    headNone: (o) => `${o.place} ${n(o.n)} 間 Apple Store 目前都沒有上架可取貨的 iPhone Duo。`,
    headNoneOne: (place: string) => `${place}目前沒有上架任何可取貨的 iPhone Duo 配置。`,
    headSome: (o) => <>{o.place} {n(o.n)} 間 Apple Store 中有 {n(o.k)} 間上架可取貨的 iPhone Duo：{o.list}。</>,
    headSomeOne: (o) => <>{o.place}上架了 iPhone Duo 全部 {n(o.total)} 款配置中的 {n(o.k)} 款：{o.list}。</>,
    storeItem: (store: ReactNode, configs: number) => <>{store}（{n(configs)} 款配置）</>,
    observed: (stamp: string) => `觀測時間 ${stamp}。`,
    lastReturn: (o) => <>最近一次確認補貨：<b className="text-ink">{o.config}</b>{o.store != null && <>，{o.store}</>}，{o.when}{o.lasted ? <>（{o.lasted}）</> : null}。</>,
    noReturnYet: (place: string, since: string) => `自 ${since} 開始記錄以來，${place}沒有確認過 iPhone Duo 補貨。`,
    others: (o) => (o.one ? `iPhone 18 Pro：${n(o.configs)} 款配置中上架 ${n(o.pro)} 款 · 18 Pro Max：${n(o.max)} 款。` : `iPhone 18 Pro：${n(o.pro)} 間分店有貨 · 18 Pro Max：${n(o.max)} 間。`),
    mReturns: (since: string) => `${since} 以來的確認補貨`,
    mStores: "至少補貨一次的分店",
    mDays: "有補貨的日數（追蹤日數中）",
    mWindow: (pct: string) => `最密集的兩小時 · 佔記錄 ${pct}`,
    mPerDay: "每個追蹤日的補貨次數",
    mMedian: "上架時間中位數（由上架到下架）",
    mToday: "今日補貨（截至目前）",
    secUnit: "秒",
    minUnit: "分",
    note: (o) => (o.one
      ? `自 ${o.since} 起，ShelfSpring 在${o.place}記錄了 ${n(o.n)} 次確認的 iPhone Duo 補貨（追蹤 ${n(o.tracked)} 日中有 ${n(o.days)} 日）。最密集的兩小時是 ${o.range}，佔記錄 ${o.pct}（上午 8 時至中午佔 ${o.morning}）；單一最多的時段是 ${o.busiest}，共 ${n(o.busiestN)} 次。${o.median ? `一半的上架在 ${o.median} 內下架。` : ""}${o.config ? `補貨最多的配置是 ${o.config}（${n(o.n)} 次中有 ${n(o.top)} 次）。` : ""}`
      : `自 ${o.since} 起，ShelfSpring 在${o.place} ${n(o.stores)} 間 Apple Store 記錄了 ${n(o.n)} 次確認的 iPhone Duo 補貨，其中 ${n(o.k)} 間至少補貨一次。最密集的兩小時是 ${o.range}（${o.zone}），佔記錄 ${o.pct}（上午 8 時至中午佔 ${o.morning}）；單一最多的時段是 ${o.busiest}，共 ${n(o.busiestN)} 次。${o.median ? `一半的上架在 ${o.median} 內下架。` : ""}${o.config ? `補貨最多的配置是 ${o.config}（${n(o.n)} 次中有 ${n(o.top)} 次）。` : ""}`),
    noteFew: (o) => `自 ${o.since} 起，${o.one ? o.place : `${o.place} ${n(o.stores)} 間 Apple Store`}確認的 iPhone Duo 補貨只有 ${n(o.n)} 次（${n(o.days)} 日），未達 ShelfSpring 描述常見時段所要求的門檻（${n(o.min)} 次、${n(o.minDays)} 日）。${o.median ? `一半的上架在 ${o.median} 內下架。` : ""}每一次補貨都列在下方帳冊。`,
    hourByHour: "開啟逐小時記錄 →",
    ledger: (k: number) => `最近 ${n(k)} 次補貨記錄`,
    col: { observed: "觀測（分店當地時間）", config: "配置", store: "分店", listed: "上架時間" },
    secs: (k: number) => `${n(k)} 秒`,
    mins: (k: number) => `${n(k)} 分鐘`,
    listedRange: (low: string, high: string) => `上架 ${low}–${high}`,
    listedAbout: (x: string) => `上架約 ${x}`,
    stillListed: (x: string) => `仍在架上（${x}）`,
    method: (o) => `記錄自 ${o.since} 起 · ${o.note} · 連續兩次觀測一致才計為一次補貨；配置首次出現不計。`,
    delivered: (o) => (o.one
      ? `過去 ${n(o.days)} 日，ShelfSpring 為${o.place}的補貨向會員發出了 ${n(o.sent)} 個提醒。`
      : `過去 ${n(o.days)} 日，ShelfSpring 為${o.place} ${n(o.total)} 間 Apple Store 中 ${n(o.stores)} 間的補貨向會員發出了 ${n(o.sent)} 個提醒。`),
    watch: (place: string) => `追蹤${place}的配置 →`,
    watchOne: "追蹤這間分店的配置 →",
    unknown: "暫時未能讀取觀測記錄；上方的即時上架資訊不受影響。",
    zone: () => "當地時間",
    allModels: (o) => `全部型號合計：${n(o.days)} 日內 ${n(o.n)} 次補貨${o.peak ? `，最多的時段是 ${o.peak}` : ""}。`,
  },
};
