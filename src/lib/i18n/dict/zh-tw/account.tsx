/**
 * 台灣中文：account（「我的追蹤清單」儀表板、上面的重新上架模組、安裝／結帳成功／方案頁）。方案名稱與美元金額不翻；
 * {zone} 在中文是 Intl 的時區全名（「台北標準時間」），本身已經含「時間」，所以句子不再加。
 */
import type { Dict } from "../en";
import { n } from "./util";

export const account: Dict["account"] = {
  loading: "載入中…",
  meta: { title: "我的追蹤清單" },
  signedInAs: (email: string) => `帳號 · ${email}`,
  title: "你的追蹤清單，都在這裡。",
  units: { s: "秒", min: "分", taps: "次" },

  plan: {
    title: "會員與付款",
    none: "沒有生效中的方案 · 追蹤已存下，但不會發提醒",
    summary: (plan: string, on: number, limit: number) => `${plan} · ${on}/${limit} 筆追蹤啟動中`,
    renews: (date: string) => ` · 下次續訂 ${date}`,
    ends: (date: string) => ` · 有效到 ${date}`,
  },

  sent: {
    title: "你的通知紀錄",
    last: (ago: string) => `最近一則 ${ago}`,
    none: "還沒有送出任何通知",
    empty: "這個帳號還沒收到任何符合條件的重新上架通知。付費方案生效、而且符合的變化經過確認後，已存的追蹤才會開始送出提醒。",
    channel: { push: "推播", email: "Email" } as Record<string, string>,
    status: { sent: "已送達", failed: "沒送達", skipped: "略過" } as Record<string, string>,
  },

  fast: {
    title: "先準備好取貨訂單",
    sub: "下一次有用的上架出現前，先過一遍的小清單",
    lasts: "記到的 Duo 在架時間中位數",
    push: "送達時間不一定；庫存以 Apple 確認為準",
    tapsLeft: "通知到了之後，剩下要你自己完成的步驟",
    steps: [
      { title: "想清楚你能跑多遠", hint: "只留下確定取貨後你真的到得了的門市。" },
      { title: "記住確切組合", hint: "打開 Apple 之前，先決定機型、容量和機身色。" },
      { title: "看懂購買選項", hint: "下單前先看過 Apple 的付款方式和電信業者選擇。" },
      { title: "再確認一次上架狀態", hint: "過去的觀測或通知，都沒辦法幫你保留手機。" },
      { title: "等取貨確認再出門", hint: "Apple 確認訂單可以取貨之後，再出發。" },
    ],
    guide: "看取貨清單（英文）",
    window: "你的重新上架時段",
  },

  restock: {
    /** "Restock by restock" on the dashboard: each restock against the member's alerts (lib/alertMarks.ts). */
    mark: { delivered: "通知已送達", sent: "已送出通知", other: "不在你的通知內", before: "設定通知之前" },
    title: "你的門市什麼時段重新上架",
    anyIphone: "iPhone",
    and: " 與 ",
    yours: (k: number) => (k === 1 ? "你選的門市" : `你選的 ${k} 家門市`),
    Yours: (k: number) => (k === 1 ? "你選的門市" : `你選的 ${k} 家門市`),
    otherStores: (k: number) => `另外 ${k} 家門市`,
    meta: (what: string, stores: number, days: number, zone: string) => `${what} · ${stores} 家門市 · ${days} 天紀錄 · ${zone}`,
    busiest: (yours: string, then: string | null) => (then ? `${yours}重新上架最多的時段 · 第二名 ${then}` : `${yours}重新上架最多的時段`),
    busiestArea: (stores: number, zone: string) => `使用${zone}的 ${stores} 家門市裡的高峰`,
    next: (inHours: number) => `接下來的時段 · ${inHours === 0 ? "這個小時內" : `還有 ${inHours} 小時`}`,
    typical: "在架時間中位數",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `${yours}沒記到重新上架 · ${days} 天紀錄` : `${yours}記到的重新上架 · ${days} 天紀錄${pattern ? "" : " · 還看不出規律"}`),
    byHour: (busiestInGreen: boolean) => `一天中的時段${busiestInGreen ? " · 綠色是高峰" : ""}`,
    byWeekday: (busiest: string | null) => `星期分布${busiest ? ` · 高峰在${busiest}` : ""}`,
    hourChart: (yours: string, zone: string, items: string) => `${yours}各時段的重新上架（${zone}）：${items}`,
    weekdayChart: (yours: string, items: string) => `${yours}各星期的重新上架：${items}`,
    chartItem: (label: string, k: number, reported: number) => `${label} ${k}${reported ? `（外部 +${reported}）` : ""}`,
    barTitle: (label: string, k: number, yours: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label}：${yours}記到 ${n(k)} 次重新上架${area ? ` · 使用${area.zone}的門市共 ${area.n} 次` : ""}${reported ? ` · 外部回報 ${reported} 次` : ""}`,
    now: "現在這刻",
    allZone: (stores: number, zone: string) => `所有使用${zone}的門市（${stores} 家）`,
    reportMarkBars: "虛線長條",
    reportMarkDots: "空心圓點",
    sellTitle: "重新上架後在架多久",
    sellMeta: (what: string, stores: number, days: number) => `${what} · ${stores} 家門市 · ${days} 天紀錄`,
    sellLabel: (yours: string) => yours,
  },

  success: {
    metaTitle: "追蹤已啟動",
    isOn: (plan: string) => `${plan} 已生效`,
    yourPlan: "目前方案",
    received: "付款已確認",
    onPlan: (limit: number) => `你的追蹤清單可以放 ${limit} 筆追蹤。`,
    planOn: "你的方案已生效。",
    pending: "Stripe 還在確認；大約一分鐘後，方案就會顯示在帳號裡。",
    open: "打開我的追蹤清單",
    another: "加進追蹤清單",
    saved: (k: number) => `已存下 ${k} 筆追蹤 · 收據由 Stripe 用 Email 寄出`,
    pushOn: "通知",
    pushNext: "下一步：啟用一台裝置",
  },
  install: {
    metaTitle: "準備接收 ShelfSpring 通知的裝置",
    metaDescription: "依手機或電腦的步驟登入並測試通知。接收情況也受到瀏覽器與裝置設定影響。",
  },

  pricing: {
    metaTitle: "候選清單訂閱：10、20 或 50 條通知規則",
    metaDescription: "留下想買的 iPhone 與能前往的門市。ShelfSpring 每月 5 美元起，公開庫存、地圖和變動記錄仍可免費瀏覽。",
    title: "專為你的候選清單設計的會員方案。",
    lead: "瀏覽永遠免費。想讓下一次符合的變化主動找上你，再訂閱就好。**一筆追蹤 = 一家門市的一種確切 iPhone 組合。**",
    chips: ["公開庫存與歷史一律免費", "每個方案都用同一個庫存來源", "每月以美元扣款", "在帳號內就能停止續訂"],
    fastest: "訂閱到底做什麼",
    everyFast: "偵測到符合條件的上架後才會發出提醒；來源查詢、資料同步和推播送達都可能有延遲。",
    historySample: "所有追蹤市場 · 最近 7 天 · {n} 個已結束的取貨時段",
    sellsOut: (band: string) => `記到的 iPhone Duo 在架時間中位數是 **${band}**。這只說明已記錄的樣本，不是你下一次機會的長度。`,
    band: (range: string) => `${range} 秒`,
    aboutMinute: "1 分鐘上下",
    sameSpeed: "庫存資料經常更新",
    rechecked: "你的門市多久查看一次",
    toPhone: "從確認重新上架到你的裝置",
    listing: "Duo 在架時間中位數",
    note: { plus: "例如一種組合，在十家門市追蹤", pro: "例如兩種組合，各十家門市", max: "例如五種組合，各十家門市" } as Record<string, string>,
    month: "每月",
    alerts: (k: number) => `${k} 筆追蹤`,
    perks: ["指定確切的容量與機身色組合", "行程一變就能改你到得了的門市", "瀏覽器推播，Email 當備援"],
    cancel: "隨時可以停止續訂",
    get: (plan: string) => `開始 ${plan}`,
    billing: "付款透過 Stripe，可用信用卡或 Link。換方案按比例計算。",
    refund: "退款條件：最近 7 天內的付款，若之後沒有送達任何重新上架提醒，可以全額退款（[退款規則](/refunds)）。",
  },
};
