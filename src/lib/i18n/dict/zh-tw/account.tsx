/**
 * 台灣中文：account（「我的通知」儀表板、上面的補貨模組、安裝／結帳成功／價格方案頁）。方案名稱與美元金額不翻；
 * {zone} 在中文是 Intl 的時區全名（「台北標準時間」），本身已經含「時間」，所以句子不再加。
 */
import type { Dict } from "../en";
import { n } from "./util";

export const account: Dict["account"] = {
  loading: "載入中",
  meta: { title: "我的通知" },
  signedInAs: (email: string) => `登入帳號：${email}`,
  title: "我的通知",
  units: { s: "秒", min: "分鐘", taps: "下" },

  plan: {
    title: "方案",
    none: "還沒有方案：通知未啟用",
    summary: (plan: string, on: number, limit: number) => `${plan} · ${limit} 則中已啟用 ${on} 則`,
    renews: (date: string) => ` · ${date} 自動續訂`,
    ends: (date: string) => ` · ${date} 到期`,
  },

  sent: {
    title: "已送出的通知",
    last: (ago: string) => `最近一則：${ago}`,
    none: "還沒送出任何通知",
    empty: "還沒送出任何通知。",
    channel: { push: "推播", email: "Email" } as Record<string, string>,
    status: { sent: "已送出", failed: "失敗", skipped: "略過" } as Record<string, string>,
  },

  fast: {
    title: "準備你的取貨訂單",
    sub: "下次合適庫存出現前的簡短檢查清單",
    lasts: "已記錄 Duo 可取貨時段的中位數",
    push: "傳送時間不固定；請向 Apple 確認庫存",
    tapsLeft: "確認訂單前的檢查事項",
    steps: [
      { title: "確認可前往的範圍", hint: "只留下取貨確定後，你實際能抵達的門市。" },
      { title: "決定確切配置", hint: "開啟 Apple 前，先準備好型號、容量與顏色。" },
      { title: "了解購買選項", hint: "下單前閱讀 Apple 的付款方式與電信業者選項。" },
      { title: "再次確認目前庫存", hint: "過去的觀察或通知，不會替你保留手機。" },
      { title: "等待取貨準備完成確認", hint: "等 Apple 確認訂單商品已可取貨，再安排前往。" },
    ],
    guide: "取貨準備指南（英文）",
    window: "你所選門市的記錄",
  },

  restock: {
    title: "你的門市什麼時候補貨",
    anyIphone: "iPhone",
    and: " 和 ",
    yours: (k: number) => (k === 1 ? "你的門市" : `你的 ${k} 家門市`),
    Yours: (k: number) => (k === 1 ? "你的門市" : `你的 ${k} 家門市`),
    otherStores: (k: number) => `其他 ${k} 家門市`,
    meta: (what: string, stores: number, days: number, zone: string) => `${what} · ${stores} 家門市 · 最近 ${days} 天 · ${zone}`,
    busiest: (yours: string, then: string | null) => (then ? `${yours}最忙的時段 · 其次 ${then}` : `${yours}最忙的時段`),
    busiestArea: (stores: number, zone: string) => `${zone}全部 ${stores} 家門市最忙的時段`,
    next: (inHours: number) => `下一個時段 · ${inHours === 0 ? "就是這個小時" : `${inHours} 小時後`}`,
    typical: "賣完前的一般上架時間",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `${yours}還沒有補貨 · 最近 ${days} 天` : `${yours}補貨次數 · 最近 ${days} 天${pattern ? "" : " · 還太少，看不出規律"}`),
    byHour: (busiestInGreen: boolean) => `依小時${busiestInGreen ? " · 綠色是最忙的時段" : ""}`,
    byWeekday: (busiest: string | null) => `依星期${busiest ? ` · ${busiest}最忙` : ""}`,
    hourChart: (yours: string, zone: string, items: string) => `${yours}依小時的補貨次數（${zone}）：${items}`,
    weekdayChart: (yours: string, items: string) => `${yours}依星期的補貨次數：${items}`,
    chartItem: (label: string, k: number, reported: number) => `${label} ${k}${reported ? `（另有其他追蹤網站回報 ${reported} 次）` : ""}`,
    barTitle: (label: string, k: number, yours: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label}：${yours}補貨 ${n(k)} 次${area ? ` · ${area.zone}共 ${area.n} 次` : ""}${reported ? ` · 其他追蹤網站回報 ${reported} 次` : ""}`,
    now: "現在",
    allZone: (stores: number, zone: string) => `${zone}全部 ${stores} 家門市`,
    reportMarkBars: "虛線",
    reportMarkDots: "空心點",
    sellTitle: "你的門市補貨多快賣完",
    sellMeta: (what: string, stores: number, days: number) => `${what} · ${stores} 家門市 · 最近 ${days} 天`,
    sellLabel: (yours: string) => yours,
  },

  success: {
    metaTitle: "通知已啟用",
    isOn: (plan: string) => `${plan} 已啟用`,
    yourPlan: "你的方案",
    received: "已收到付款",
    onPlan: (limit: number) => `你的方案可設 ${limit} 則通知。`,
    planOn: "你的方案已啟用。",
    pending: "你的訂閱一分鐘內就會出現在帳號裡。",
    open: "打開我的通知",
    another: "再新增一則通知",
    saved: (k: number) => `已儲存 ${k} 則通知 · Stripe 會寄收據給你`,
    pushOn: "通知",
    pushNext: "下一步：讓通知送到你的手機",
  },

  install: {
    metaTitle: "準備接收 ShelfSpring 通知的裝置",
    metaDescription: "依手機或電腦的步驟登入並測試通知。接收情況也受到瀏覽器與裝置設定影響。",
  },

  pricing: {
    metaTitle: "候選清單訂閱：10、20 或 50 條通知規則",
    metaDescription: "留下想買的 iPhone 與能前往的門市。ShelfSpring 每月 5 美元起，公開庫存、地圖和變動記錄仍可免費瀏覽。",
    title: "讓訂閱照看你的候選清單。",
    lead: "查庫存不必付費。需要收到符合條件的變動時，再選擇訂閱。**一條規則追蹤一間門市的一種確切 iPhone 配置。**",
    chips: ["公開庫存與歷史記錄免費瀏覽","所有方案使用相同庫存來源","每月以美元計費","可在帳戶內取消續訂"],
    fastest: "訂閱能替你做什麼",
    everyFast: "偵測到符合條件的庫存後才會發送通知。來源檢查、資料同步與通知傳送都可能造成延遲。",
    historySample: "所有追蹤地區 · 最近 7 天 · {n} 個已結束的可取貨時段",
    sellsOut: (band: string) => `觀察到的 iPhone Duo 可取貨時段中位數為 **${band}**。這描述的是已記錄樣本，不代表下次機會會持續多久。`,
    band: (range: string) => `${range} 秒`,
    aboutMinute: "大約 1 分鐘",
    sameSpeed: "定期更新庫存",
    rechecked: "你的門市重新檢查",
    toPhone: "確認補貨到推播上手機",
    listing: "已記錄 Duo 可取貨時段的中位數",
    note: { plus: "1 支 iPhone × 10 家門市", pro: "2 支 iPhone × 10 家門市", max: "5 支 iPhone × 10 家門市" } as Record<string, string>,
    month: "/ 月",
    alerts: (k: number) => `${k} 則通知`,
    perks: ["指定確切容量與顏色","依照行程調整追蹤門市","瀏覽器推播，無法使用時以電子郵件備援"],
    cancel: "隨時可取消",
    get: (plan: string) => `選擇 ${plan}`,
    billing: "Stripe 計費 · 信用卡或 Link · 變更方案按比例計算",
    refund: "不適合你？如果還沒收到任何補貨通知，[7 天內全額退款](/refunds)",
  },
};
