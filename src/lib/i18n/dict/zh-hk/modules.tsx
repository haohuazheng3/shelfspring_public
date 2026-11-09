/**
 * 繁體中文（香港）: modules — 回架、店舖與在架狀態模組。`label` 是不帶介詞的地點名詞（「香港」、
 * 「Apple Canton Road（廣東道）」、「本店」、「你的 3 間分店」）；句子自己安放它。只寫 15 秒與 5 秒兩種間隔。
 * 用詞：回架（restock）、在架／落架（on / off the shelf）、清架（賣光那刻）、查看（一次查詢）、錄得、觀察簿、監察、落單。
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { n, zhCfg } from "./common";

export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `${label}近 ${n(days)} 日仍是空白一頁：沒有回架，也沒有配置落架。長條由第一筆記錄開始畫。`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `${label}近 ${n(days)} 日之中，有 ${n(activeDays)} 日錄得回架：合共 ${n(restocks)} 次，其後再落架 ${n(soldouts)} 次。`,
    busiest: (day: string, restocks: number) => <>高峰在 <b className="text-ink">{day}</b>，當日 {n(restocks)} 次。</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day}，${n(restocks)} 次回架、${n(soldouts)} 次落架`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day} · 回架 ${n(restocks)} · 落架 ${n(soldouts)}`,
    legendRestocks: "回架",
    legendSoldouts: "再落架",
  },

  last24: {
    title: (label: string) => `近 24 小時 iPhone Duo 在${label}的回架`,
    asOf: (when: string) => `快照 · ${when}`,
    localTime: (when: string) => `店舖時間 ${when}`,
    anAppleStore: "一間名冊以外的 Apple Store",
    unknown: "今次未能載入 24 小時統計；本頁的在架狀態與回架日誌照常有效。",
    none: (label: string, asOf: string) => <><b className="text-ink">{label}這 24 小時很平靜：</b>截至 {asOf} 的時段內，未錄得 iPhone Duo 回架。</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <>最近一次回架：<b className="text-ink">{o.config}</b>，店舖時間 {o.when}{o.store != null && <>，錄於 {o.store}</>}。<b className="text-ink">這段時間共回架 {n(o.restocks)} 次</b>{o.one ? null : <>，分佈於{o.label}的 {n(o.withStores)}/{n(o.allStores)} 間店</>}。</>
    ),
    tileRestocks: "時段內回架",
    tileConfigsBack: "重新在架的配置",
    tileStores: (configs: number, allConfigs: number) => `錄得回架的店${configs ? ` · ${n(configs)}/${n(allConfigs)} 個配置` : ""}`,
    tileLatest: (config: string, store: string | null) => <>最近 · {store != null && <>{store} · </>}{config}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>上一次回架，{day} · {store != null && <>{store} · </>}{config}</>,
    tileNoEarlier: "再早已無記錄",
    caption: (label: string, asOf: string) => `${label}每個 iPhone Duo 配置的回架次數，計至 ${asOf} 為止的 24 小時`,
    thConfig: "配置",
    thRestocks: "回架",
    thStores: "店數",
    thLast: "最近一次（店舖時間）",
    thNow: "此刻在架",
    ofStores: (k: number, total: number) => `${n(k)}/${n(total)}`,
    noneIn24: "未有記錄",
    yes: "在架",
    no: "落架",
    countedTitle: "怎樣才算一次回架",
    counted: "某間店的某個配置，由「不可取貨」轉為「可取貨」並經確認，便記一次回架。同一配置多次回架會逐次分開記，不代表手機部數。即時清單反映上一次查看的結果；歷史只交代貨在哪裏回過架，並不預告下一批何時到。",
    alert: (label: string | null) => `在手機設定回架提示${label ? ` · ${label}` : ""}`,
  },

  clock: {
    none: (label: string, days: number) => `${label}近 ${n(days)} 日未錄得任何回架。`,
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `${label}近 ${n(days)} 日只錄得 ${n(total)} 次回架${dates != null ? `，散落 ${n(dates)} 日` : ""}，未足以說出慣常鐘點。`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>{label}慣常的回架鐘點：店舖時間 <b className="text-ink">{hour}</b>（根據 {n(days)} 日內 {n(total)} 次回架）{day ? <>；一週之中以<b className="text-ink">{day}</b>最多</> : null}。</>
    ),
    byHour: (zone: string) => `鐘點分佈 · ${zone}`,
    byWeekday: "星期分佈",
    barReported: (k: number) => `（外部報告 +${n(k)}）`,
    barReportedTitle: (bar: string, k: number) => `${bar}：外部報告 ${n(k)} 次`,
    legendOurs: "觀察簿錄得的回架",
  },

  feed: {
    empty: "回架日誌暫時仍是空的。",
    available: "在架",
    soldOut: "已落架",
    soldOutAt: (time: ReactNode) => <>清架 · {time}</>,
    since: (time: ReactNode) => <>回架 · {time}</>,
    restockedAt: (time: ReactNode) => <>回架 · {time}</>,
    mapAria: (store: string) => `在貨架地圖上找出${store}`,
    map: "在貨架地圖上找",
    buyAria: (model: string, config: string) => `到 apple.com 為 ${model} ${config} 落單`,
    buy: "到 apple.com 落單",
  },

  byConfig: {
    empty: (label: string, days: number) => `${label}近 ${n(days)} 日沒有配置回架，暫時無從排名。`,
    intro: (label: string, days: number) => `${label}近 ${n(days)} 日的配置，按回架次數排序。`,
    times: (k: number) => `回架 ${n(k)} 次`,
    alert: "監察",
  },

  sellout: {
    typical: (label: string, band: string) => `${label}的 iPhone Duo 回架，在架時間中位數大約 ${band}。`,
    half: (label: string, duration: string) => `${label}有計時的回架之中，一半在 ${duration}內落架。`,
    none: (label: string, days: number) => `近 ${n(days)} 日，${label}未有一次回架落架。`,
    whatDuo: "iPhone Duo",
    whatAll: "全部型號",
    tileHalf: (what: string) => <>在架時間中位數 · {what}</>,
    tileWithin30: "落架 ≤ 30 秒",
    tileWithin60: "落架 ≤ 1 分鐘",
    tileFastest: (k: number, days: number) => <>{n(k)} 次計時回架中最快一次 · {n(days)} 日</>,
    caption: (days: number) => `各型號 · 近 ${n(days)} 日`,
    thIphone: "型號",
    thSoldOut: "計時",
    thHalf: "中位",
    thWithin30: "≤ 30 秒：",
    thWithin60: "≤ 1 分鐘：",
    thFastest: "最快",
    each: "逐次回架",
    barNote: (full: string) => `長條長度 = 在架時間 · ${full}即滿格`,
    stillListed: (duration: string) => `仍然在架 · ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "在架時間的上下限怎樣定",
    measured: (_estimated: boolean) => { void _estimated; return "在架時間的上限與下限，分別取自最後一次見到可取貨、以及第一次見到不可取貨的觀察。標上 ≈ 的是估算區間。比查看間隔更短的在架可能被漏掉；這些時長並不代表一定夠時間結帳。"; },
  },

  configTable: {
    title: "逐個配置查架",
    titleAt: (store: string) => `逐個配置查架 · ${store}`,
    lookupOff: (hasRows: boolean) => `Apple 已暫停這間店的取貨查詢${hasRows ? "；下面各行是它最後的回覆" : ""}`,
    tracked: (k: number) => `記錄中的配置：${n(k)} 個`,
    firstSweep: "正在開始觀察；一分鐘內會有第一批狀態",
    inStock: (k: number, total: number) => `在架：${n(k)}/${n(total)} 個配置`,
    available: "在架",
    unavailable: "落架",
    noLookup: "查詢已暫停",
    notChecked: "等候首次查看",
    since: (ago: ReactNode) => <>上架於 {ago}</>,
    lastAvailable: (ago: ReactNode) => <>最後見到 · {ago}</>,
    neverHere: "這裏未見過",
    buy: "落單",
    alertAria: (model: string, config: string, store: string) => `監察 ${store} 的 ${model} ${config}`,
    alert: "監察 →",
  },

  matrix: {
    store: "地點",
    checked: "上次查看",
    cellTitle: (model: string, k: number, total: number) => `${model}：${n(k)}/${n(total)} 個配置在架`,
  },

  nearby: {
    duo: (short: string, k: number) => `${short} 在架 · ${n(k)}`,
    noDuo: (short: string) => `${short} 落架`,
  },

  stockByModel: {
    availableNow: (k: number, total: number) => `${n(k)}/${n(total)} 個配置在架`,
    noneNow: (total: number) => `0/${n(total)} 在架`,
    lookupOff: "Apple 已暫停這間店的取貨查詢",
    notChecked: "等候首次查看",
    more: (k: number) => `+${n(k)} 個`,
    checked: (ago: ReactNode) => <>上次查看 {ago}</>,
    alert: "監察 →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>{ago} · 存貨資料經常更新</>,
    map: "在貨架地圖上看",
    alert: "監察這間店",
    alsoIn: (region: string) => `${region}還有這些店`,
    acrossLine: "州界對面最近的店",
    elsewhere: "別處最近的店",
  },

  hours: {
    title: "開舖時間",
    local: (zone: string) => `以${zone}計`,
    today: (hours: string, week: string) => ` · ${hours}（今日）· ${week}`,
    directions: "規劃路線",
    applePage: "Apple 的店舖頁",
    liveMap: "在貨架地圖上看",
    storePage: "店舖記錄",
    closed: "關門",
    everyDay: (hours: string) => `一週七日 ${hours}`,
    openNow: (closes: string) => `開門中 · 營業至 ${closes}`,
    opensAt: (opens: string) => `${opens} 開舖`,
    closedToday: (next: string | null) => (next ? `今日關門 · ${next} 再開` : "今日關門"),
    closedNow: (next: string | null) => (next ? `暫時關門 · ${next} 再開` : "暫時關門"),
    nextOpen: (day: string | null, time: string) => `${day ?? "明天"} ${time}`,
    span: (opens: string, closes: string) => `${opens} 至 ${closes}`,
  },

  liveStats: {
    inStock: "在架",
    storesWith: "有貨在架的店",
    lastCheck: "上次查看",
    none: "—",
  },

  board: {
    summary: (k: number, stores: number, short: string) => `${short} 在架：${n(k)}/${n(stores)} 間店`,
    lastCheck: (ago: ReactNode) => <>上次查看 {ago}</>,
    firstSweep: "正在開始觀察。",
    noneListed: (model: string, storage: string | null, color: string | null) => `此刻沒有任何店有 ${model}${storage ? ` ${storage}` : ""}${color ? ` ${zhCfg(color)}` : ""} 在架。`,
    more: (k: number) => `+${n(k)} 間`,
    seen: (ago: ReactNode) => <>錄於 {ago}</>,
    loading: "正在讀取貨架",
  },

  /** DuoLedger：地區、城市、店舖、市場及 Duo 型號頁開頭的觀察簿。`place` 是不帶介詞的地名或店名。 */
  duoLedger: {
    kicker: (place: string) => `觀察簿 · iPhone Duo · ${place}`,
    headNone: (o) => `${o.place}的 ${n(o.n)} 間 Apple Store 都沒有可供取貨的 iPhone Duo 在架。`,
    headNoneOne: (place: string) => `${place}此刻沒有任何 iPhone Duo 配置可供取貨。`,
    headSome: (o) => <>可取貨的 iPhone Duo 見於{o.place}的 {n(o.k)}/{n(o.n)} 間 Apple Store：{o.list}。</>,
    headSomeOne: (o) => <>{o.place}有 {n(o.k)}/{n(o.total)} 個 iPhone Duo 配置可供取貨：{o.list}。</>,
    storeItem: (store: ReactNode, configs: number) => <>{store}（{n(configs)} 個配置）</>,
    observed: (stamp: string) => `觀察於 ${stamp}。`,
    lastReturn: (o) => <>最近一次確認回架：<b className="text-ink">{o.config}</b>{o.store != null && <>，於 {o.store}</>}，{o.when}{o.lasted ? <>，{o.lasted}</> : null}。</>,
    noReturnYet: (place: string, since: string) => `${place}自 ${since} 開簿以來，未有確認的 iPhone Duo 回架。`,
    others: (o) => (o.one ? `作為對照，此店在架的 iPhone 18 Pro 配置有 ${n(o.pro)}/${n(o.configs)} 個，Pro Max 有 ${n(o.max)}/${n(o.configs)} 個。` : `作為對照，這些店之中 iPhone 18 Pro 在架的有 ${n(o.pro)} 間，Pro Max 有 ${n(o.max)} 間。`),
    mReturns: (since: string) => `${since} 以來確認的回架`,
    mStores: "最少回架一次的店",
    mDays: "有回架的追蹤日",
    mWindow: (pct: string) => `最忙的兩個當地鐘頭 · 佔記錄 ${pct}`,
    mPerDay: "每個追蹤日的回架次數",
    mMedian: "在架時間中位數（出現至落架）",
    mToday: "今日至今的回架",
    secUnit: "秒",
    minUnit: "分",
    note: (o) => (o.one
      ? `ShelfSpring 自 ${o.since} 起在${o.place}錄得 ${n(o.n)} 次確認的 iPhone Duo 回架，分佈在 ${n(o.tracked)} 個追蹤日中的 ${n(o.days)} 日。最忙的兩個當地鐘頭是 ${o.range}（佔記錄 ${o.pct}；上午 8 時至中午佔 ${o.morning}），單一最忙的是 ${o.busiest}，共 ${n(o.busiestN)} 次。${o.median ? `量度到的在架時間，一半在 ${o.median}內結束。` : ""}${o.config ? `回架最多的是 ${o.config}（${n(o.n)} 次中佔 ${n(o.top)} 次）。` : ""}`
      : `ShelfSpring 自 ${o.since} 起，在${o.place}的 ${n(o.stores)} 間 Apple Store 錄得 ${n(o.n)} 次確認的 iPhone Duo 回架；其中 ${n(o.k)} 間最少有過一次。最忙的兩個當地鐘頭是 ${o.range}（${o.zone}，佔記錄 ${o.pct}；上午 8 時至中午佔 ${o.morning}），單一最忙的是 ${o.busiest}，共 ${n(o.busiestN)} 次。${o.median ? `量度到的在架時間，一半在 ${o.median}內結束。` : ""}${o.config ? `回架最多的是 ${o.config}（${n(o.n)} 次中佔 ${n(o.top)} 次）。` : ""}`),
    noteFew: (o) => `自 ${o.since} 起，${o.one ? o.place : `${o.place}的 ${n(o.stores)} 間 Apple Store`}只錄得 ${n(o.n)} 次確認的 iPhone Duo 回架（${n(o.days)} 日），未到 ShelfSpring 描述慣常鐘點前要求的 ${n(o.min)} 次、${n(o.minDays)} 日門檻。${o.median ? `量度到的在架時間，一半在 ${o.median}內結束。` : ""}各次回架都記在下面的觀察簿。`,
    hourByHour: "打開逐小時記錄 →",
    ledger: (k: number) => `最近錄得的 ${n(k)} 次回架`,
    col: { observed: "見到（店舖時間）", config: "配置", store: "店", listed: "在架時間" },
    secs: (k: number) => `${n(k)} 秒`,
    mins: (k: number) => `${n(k)} 分`,
    listedRange: (low: string, high: string) => `在架 ${low}–${high}`,
    listedAbout: (x: string) => `大約在架 ${x}`,
    stillListed: (x: string) => `至今已在架 ${x}`,
    method: (o) => `${o.since} 開簿 · ${o.note} · 連續兩次觀察一致才算一次回架；配置第一次出現永不計算。`,
    delivered: (o) => (o.one
      ? `近 ${n(o.days)} 日，ShelfSpring 因${o.place}的回架向會員送出 ${n(o.sent)} 個提示。`
      : `近 ${n(o.days)} 日，ShelfSpring 因${o.place} ${n(o.stores)}/${n(o.total)} 間 Apple Store 的回架，向會員送出 ${n(o.sent)} 個提示。`),
    watch: (place: string) => `監察${place}的一個配置 →`,
    watchOne: "監察此店的一個配置 →",
    unknown: "今次讀不到觀察記錄；上面的即時在架資料不受影響。",
    zone: () => "店舖時間",
    allModels: (o) => `全部型號一併計：${n(o.days)} 日內錄得 ${n(o.n)} 次回架${o.peak ? `；最多的鐘頭是 ${o.peak}` : ""}。`,
  },
};
