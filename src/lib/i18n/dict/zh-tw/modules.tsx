/**
 * 台灣中文：modules —— 重新上架、門市與上架狀態模組。`label` 是頁面給的地點名詞（「台灣」「台北」「Apple 信義 A13」
 * 「這家店」），句子自己接上；數字到這裡是原始數字，在這裡加千分位。檢查間隔只寫 15 秒與 5 秒。
 * 用詞：重新上架（短標籤「回架」）、上架中／下架、查看（一次查詢）、記到、觀測簿、追蹤、下單、組合。
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { colorLabel } from "../../places";
import { L, n, zs } from "./util";


export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => zs(`${label}最近 ${days} 天這頁還是空白：沒有重新上架，也沒有下架。第一筆紀錄出現後才開始畫長條。`),
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      zs(`最近 ${days} 天裡，${label}有 ${activeDays} 天出現重新上架：總共記到 ${n(restocks)} 次，之後又下架 ${n(soldouts)} 次。`),
    busiest: (day: string, restocks: number) => <>單日最高是 <b className="text-ink">{day}</b>，那天 {n(restocks)} 次。</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day}：${restocks} 次回架，${soldouts} 次下架`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day} · 回架 ${restocks} · 下架 ${soldouts}`,
    legendRestocks: "重新上架",
    legendSoldouts: "又下架",
  },

  last24: {
    title: (label: string) => zs(`最近 24 小時 iPhone Duo 在${label}的重新上架`),
    asOf: (when: string) => `快照 · ${when}`,
    localTime: (when: string) => `門市時間 ${when}`,
    anAppleStore: "一家不在名錄上的 Apple 直營店",
    unknown: "這次沒載入 24 小時統計；本頁的上架狀態與上架日誌一樣有效。",
    none: (label: string, asOf: string) => <><b className="text-ink">{zs(`${label}這 24 小時很安靜：`)}</b>到 {asOf} 為止，沒有記到 iPhone Duo 重新上架。</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <>最近一次重新上架：<b className="text-ink">{o.config}</b>，門市時間 {o.when}{o.store != null && <>，記於 {o.store}</>}。<b className="text-ink">{zs(`這段期間共 ${n(o.restocks)} 次`)}</b>{o.one ? null : <>{zs(`，出現在${o.label}的 ${o.withStores}/${o.allStores} 家直營店`)}</>}。</>
    ),
    tileRestocks: "期間內重新上架",
    tileConfigsBack: "回到架上的組合",
    tileStores: (configs: number, allConfigs: number) => `出現重新上架的門市${configs ? ` · ${configs}/${allConfigs} 種組合` : ""}`,
    tileLatest: (config: string, store: string | null) => <>最新 · {store != null && <>{store} · </>}{config}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>前一次，{day} · {store != null && <>{store} · </>}{config}</>,
    tileNoEarlier: "更早沒有紀錄",
    caption: (label: string, asOf: string) => zs(`${label}每種 iPhone Duo 組合在 ${asOf} 之前 24 小時的重新上架次數`),
    thConfig: "組合",
    thRestocks: "回架",
    thStores: "門市數",
    thLast: "最新一次（門市時間）",
    thNow: "現在上架中",
    ofStores: (k: number, total: number) => `${k}/${total}`,
    noneIn24: "沒有紀錄",
    yes: "上架中",
    no: "下架",
    countedTitle: "什麼才算一次重新上架",
    counted: "某家門市的某個組合從「不能取貨」變成「可以取貨」，並經過確認，就記一次重新上架。同一組合反覆回架會一次一次分開記，跟手機支數無關。即時清單呈現的是最近一次查看的結果；歷史只說明貨曾在哪裡回到架上，不預告下一批何時送達。",
    alert: (label: string | null) => `在手機上設定重新上架提醒${label ? ` · ${label}` : ""}`,
  },

  clock: {
    none: (label: string, days: number) => zs(`最近 ${days} 天，${label}沒有記到任何重新上架。`),
    thin: (total: number, label: string, days: number, dates: number | null) =>
      zs(`${label}在 ${days} 天內只記到 ${n(total)} 次重新上架${dates != null ? `，分散在 ${dates} 天` : ""}，還不足以指出慣常時段。`),
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>{zs(`${label}慣常的重新上架時段：門市時間`)} <b className="text-ink">{hour}</b>{zs(`（依據 ${days} 天內 ${n(total)} 次）`)}{day ? <>；一週中以<b className="text-ink">{day}</b>最多</> : null}。</>
    ),
    byHour: (zone: string) => `時段分布 · ${zone}`,
    byWeekday: "星期分布",
    barReported: (k: number) => `（外部回報 +${k}）`,
    barReportedTitle: (bar: string, k: number) => `${bar}：外部回報 ${k} 次`,
    legendOurs: "觀測簿記到的重新上架",
  },

  feed: {
    empty: "上架日誌目前還是空的。",
    available: "上架中",
    soldOut: "已下架",
    soldOutAt: (time: ReactNode) => <>下架 · {time}</>,
    since: (time: ReactNode) => <>回架 · {time}</>,
    restockedAt: (time: ReactNode) => <>回架 · {time}</>,
    mapAria: (store: string) => zs(`在貨架地圖上找到${store}`),
    map: "在貨架地圖上找",
    buyAria: (model: string, config: string) => `到 apple.com 下單 ${model} ${config}`,
    buy: "到 apple.com 下單",
  },

  byConfig: {
    empty: (label: string, days: number) => zs(`${label}最近 ${days} 天沒有組合重新上架，暫時沒東西可排。`),
    intro: (label: string, days: number) => zs(`${label}最近 ${days} 天的組合，依重新上架次數排序。`),
    times: (k: number) => `回架 ${n(k)} 次`,
    alert: "追蹤",
  },

  sellout: {
    typical: (label: string, band: string) => zs(`${label}的 iPhone Duo 重新上架，在架時間中位數大約是 ${band}。`),
    half: (label: string, duration: string) => zs(`${label}有計時的重新上架中，一半在 ${duration}內下架。`),
    none: (label: string, days: number) => zs(`最近 ${days} 天，${label}還沒有回架後又下架的紀錄。`),
    whatDuo: "iPhone Duo",
    whatAll: "所有機型",
    tileHalf: (what: string) => <>在架時間中位數 · {what}</>,
    tileWithin30: "下架 ≤ 30 秒",
    tileWithin60: "下架 ≤ 1 分鐘",
    tileFastest: (k: number, days: number) => <>{n(k)} 次計時中最快的一次 · {days} 天</>,
    caption: (days: number) => `各機型 · 最近 ${days} 天`,
    thIphone: "機型",
    thSoldOut: "計時",
    thHalf: "中位數",
    thWithin30: "≤ 30 秒：",
    thWithin60: "≤ 1 分鐘：",
    thFastest: "最快",
    each: "一次一次看",
    barNote: (full: string) => `長條長度 = 在架時間 · ${full}填滿整條`,
    stillListed: (duration: string) => `還在架上 · ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "在架時間的範圍怎麼定",
    measured: (_estimated: boolean) => { void _estimated; return "在架時間的上下界，分別來自最後一次看到可以取貨、和第一次看到不能取貨的那兩筆觀測。標 ≈ 的是估計範圍。短過查看間隔的上架有可能沒記到；這些時長不代表一定來得及結帳。"; },
  },

  configTable: {
    title: "逐一組合查架",
    titleAt: (store: string) => zs(`逐一組合查架 · ${store}`),
    lookupOff: (hasRows: boolean) => `這家門市的取貨查詢被 Apple 暫停了${hasRows ? "；下方各列是它最後的回覆" : ""}`,
    tracked: (k: number) => `記錄中的組合：${k} 種`,
    firstSweep: "正在開始觀測，一分鐘內會出現第一批狀態",
    inStock: (k: number, total: number) => `上架中：${k}/${total} 種組合`,
    available: "上架中",
    unavailable: "已下架",
    noLookup: "查詢暫停",
    notChecked: "等第一次查看",
    since: (ago: ReactNode) => <>上架於 {ago}</>,
    lastAvailable: (ago: ReactNode) => <>上次看到 · {ago}</>,
    neverHere: "這裡沒看過",
    buy: "下單",
    alertAria: (model: string, config: string, store: string) => zs(`追蹤 ${store} 的 ${model} ${config}`),
    alert: "追蹤 →",
  },

  matrix: {
    store: "地點",
    checked: "最近查看",
    cellTitle: (model: string, k: number, total: number) => `${model}：${k}/${total} 種組合上架中`,
  },

  nearby: {
    duo: (short: string, k: number) => `${short} 上架中 · ${k}`,
    noDuo: (short: string) => `${short} 已下架`,
  },

  stockByModel: {
    availableNow: (k: number, total: number) => `${k}/${total} 種組合上架中`,
    noneNow: (total: number) => `0/${total} 上架中`,
    lookupOff: "這家門市的取貨查詢被 Apple 暫停了",
    notChecked: "等第一次查看",
    more: (k: number) => `還有 ${k} 種`,
    checked: (ago: ReactNode) => <>最近查看 {ago}</>,
    alert: "追蹤 →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>{ago} · 庫存資料經常更新</>,
    map: "在貨架地圖上看",
    alert: "追蹤這家店",
    alsoIn: (region: string) => zs(`${region}還有這幾家`),
    acrossLine: "州界另一頭最近的店",
    elsewhere: "別的地方最近的店",
  },

  hours: {
    title: "營業時段",
    local: (zone: string) => `依${zone}`,
    today: (hours: string, week: string) => ` · ${hours}（今天）· ${week}`,
    directions: "規劃路線",
    applePage: "Apple 官方門市頁",
    liveMap: "在貨架地圖上看",
    storePage: "門市紀錄",
    closed: "公休",
    everyDay: (hours: string) => `天天 ${hours}`,
    openNow: (closes: string) => `營業中 · 開到 ${closes}`,
    opensAt: (opens: string) => `${opens} 開門營業`,
    closedToday: (next: string | null) => (next ? `今天公休 · ${next} 再開` : "今天公休"),
    closedNow: (next: string | null) => (next ? `目前沒開 · ${next} 再開` : "目前沒開"),
    nextOpen: (day: string | null, time: string) => `${day ?? "明天"} ${time}`,
    span: (opens: string, closes: string) => `${opens} 到 ${closes}`,
  },

  liveStats: {
    inStock: "上架中",
    storesWith: "有上架的門市",
    lastCheck: "最近查看",
    none: "—",
  },

  board: {
    summary: (k: number, stores: number, short: string) => `${short} 上架中：${k}/${stores} 家門市`,
    lastCheck: (ago: ReactNode) => <>最近查看 {ago}</>,
    firstSweep: "正在開始觀測。",
    noneListed: (model: string, storage: string | null, color: string | null) => `目前沒有任何門市的架上有 ${model}${storage ? ` ${storage}` : ""}${color ? ` ${colorLabel(color, L)}` : ""}。`,
    more: (k: number) => `還有 ${k} 家`,
    seen: (ago: ReactNode) => <>記於 {ago}</>,
    loading: "正在讀取貨架",
  },

  /** DuoLedger：地區、城市、門市、市場與 Duo 機型頁開頭的觀測簿。`place` 是不帶介詞的地名或店名。 */
  duoLedger: {
    kicker: (place: string) => `觀測簿 · iPhone Duo · ${place}`,
    headNone: (o) => zs(`${o.place}的 ${n(o.n)} 家 Apple 直營店，目前都沒有可取貨的 iPhone Duo 上架。`),
    headNoneOne: (place: string) => zs(`${place}目前一種可取貨的 iPhone Duo 組合都沒有。`),
    headSome: (o) => <>{zs(`可取貨的 iPhone Duo 出現在${o.place} ${n(o.k)}/${n(o.n)} 家 Apple 直營店：`)}{o.list}。</>,
    headSomeOne: (o) => <>{zs(`${o.place}有 ${n(o.k)}/${n(o.total)} 種 iPhone Duo 組合可以取貨：`)}{o.list}。</>,
    storeItem: (store: ReactNode, configs: number) => <>{store}（{n(configs)} 種組合）</>,
    observed: (stamp: string) => `觀測於 ${stamp}。`,
    lastReturn: (o) => <>最近一次確認的重新上架：<b className="text-ink">{o.config}</b>{o.store != null && <>，在 {o.store}</>}，{o.when}{o.lasted ? <>，{o.lasted}</> : null}。</>,
    noReturnYet: (place: string, since: string) => zs(`${place}從 ${since} 開始記錄到現在，還沒有確認過 iPhone Duo 重新上架。`),
    others: (o) => (o.one ? `對照一下：這家店的 iPhone 18 Pro 有 ${n(o.pro)}/${n(o.configs)} 種組合上架中，Pro Max 有 ${n(o.max)}/${n(o.configs)} 種。` : `對照一下：這些門市中，iPhone 18 Pro 上架中的有 ${n(o.pro)} 家，Pro Max 有 ${n(o.max)} 家。`),
    mReturns: (since: string) => `${since} 以來確認的重新上架`,
    mStores: "至少重新上架一次的門市",
    mDays: "有重新上架的追蹤天數",
    mWindow: (pct: string) => `最忙的兩個當地小時 · 占紀錄 ${pct}`,
    mPerDay: "每個追蹤日的重新上架次數",
    mMedian: "在架時間中位數（出現到下架）",
    mToday: "今天到目前的重新上架",
    secUnit: "秒",
    minUnit: "分",
    note: (o) => zs(o.one
      ? `ShelfSpring 從 ${o.since} 起在${o.place}記到 ${n(o.n)} 次確認的 iPhone Duo 重新上架，落在 ${n(o.tracked)} 個追蹤日裡的 ${n(o.days)} 天。最忙的兩個當地小時是 ${o.range}（占紀錄 ${o.pct}；上午 8 點到中午占 ${o.morning}），單一最忙的是 ${o.busiest}，有 ${n(o.busiestN)} 次。${o.median ? `量到的在架時間，一半在 ${o.median}內結束。` : ""}${o.config ? `最常重新上架的是 ${o.config}（${n(o.n)} 次裡占 ${n(o.top)} 次）。` : ""}`
      : `ShelfSpring 從 ${o.since} 起，在${o.place}的 ${n(o.stores)} 家 Apple 直營店記到 ${n(o.n)} 次確認的 iPhone Duo 重新上架；其中 ${n(o.k)} 家至少出現過一次。最忙的兩個當地小時是 ${o.range}（${o.zone}，占紀錄 ${o.pct}；上午 8 點到中午占 ${o.morning}），單一最忙的是 ${o.busiest}，有 ${n(o.busiestN)} 次。${o.median ? `量到的在架時間，一半在 ${o.median}內結束。` : ""}${o.config ? `最常重新上架的是 ${o.config}（${n(o.n)} 次裡占 ${n(o.top)} 次）。` : ""}`),
    noteFew: (o) => zs(`從 ${o.since} 起，${o.one ? o.place : `${o.place}的 ${n(o.stores)} 家 Apple 直營店`}只記到 ${n(o.n)} 次確認的 iPhone Duo 重新上架（${n(o.days)} 天），還沒達到 ShelfSpring 描述慣常時段前要求的 ${n(o.min)} 次、${n(o.minDays)} 天門檻。${o.median ? `量到的在架時間，一半在 ${o.median}內結束。` : ""}每一次重新上架都記在下方的觀測簿。`),
    hourByHour: "打開逐小時紀錄 →",
    ledger: (k: number) => `最近記到的 ${n(k)} 次重新上架`,
    col: { observed: "看到（門市時間）", config: "組合", store: "門市", listed: "在架時間" },
    secs: (k: number) => `${n(k)} 秒`,
    mins: (k: number) => `${n(k)} 分`,
    listedRange: (low: string, high: string) => `在架 ${low}–${high}`,
    listedAbout: (x: string) => `大約在架 ${x}`,
    stillListed: (x: string) => `到目前已在架 ${x}`,
    method: (o) => zs(`${o.since} 開始記錄 · ${o.note} · 連續兩次觀測一致才算一次重新上架；組合第一次出現一律不算。`),
    delivered: (o) => zs(o.one
      ? `最近 ${n(o.days)} 天，ShelfSpring 因${o.place}的重新上架向會員發出 ${n(o.sent)} 則提醒。`
      : `最近 ${n(o.days)} 天，ShelfSpring 因${o.place} ${n(o.stores)}/${n(o.total)} 家 Apple 直營店的重新上架，向會員發出 ${n(o.sent)} 則提醒。`),
    watch: (place: string) => zs(`追蹤${place}的一種組合 →`),
    watchOne: "追蹤這家店的一種組合 →",
    unknown: "這次讀不到觀測紀錄；上方的即時上架資訊不受影響。",
    zone: () => "門市時間",
    allModels: (o) => zs(`所有機型一起算：${n(o.days)} 天內記到 ${n(o.n)} 次重新上架${o.peak ? `；最多的時段是 ${o.peak}` : ""}。`),
  },
};
