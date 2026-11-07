/**
 * 繁體中文（香港）: account (dashboard, its restock modules, install / checkout / pricing pages). Plan names and
 * dollar amounts stay as they are: every plan is billed in US dollars.
 */
import type { Dict } from "../en";
import { n } from "./common";

export const account: Dict["account"] = {
  loading: "載入中",
  meta: { title: "我的提醒" },
  signedInAs: (email: string) => `已登入：${email}`,
  title: "我的提醒",
  units: { s: "秒", min: "分鐘", taps: "下" },

  plan: {
    title: "方案",
    none: "未有方案：提醒尚未啟用",
    summary: (plan: string, on: number, limit: number) => `${plan} · ${n(limit)} 個提醒中 ${n(on)} 個已啟用`,
    renews: (date: string) => ` · ${date} 續期`,
    ends: (date: string) => ` · ${date} 結束`,
  },

  sent: {
    title: "已發出的提醒",
    last: (ago: string) => `最近一次：${ago}`,
    none: "暫未發出任何提醒",
    empty: "暫未發出任何提醒。",
    channel: { push: "通知", email: "電郵" } as Record<string, string>,
    status: { sent: "已發出", failed: "失敗", skipped: "已略過" } as Record<string, string>,
  },

  fast: {
    title: "準備你的取貨訂單",
    sub: "下次合適庫存出現前的簡短檢查清單",
    lasts: "已記錄 Duo 可取貨時段的中位數",
    push: "傳送時間不固定；請向 Apple 確認庫存",
    tapsLeft: "確認訂單前的檢查事項",
    steps: [
      { title: "確認可前往的範圍", hint: "只留下取貨確定後，你實際能到達的店舖。" },
      { title: "決定確切配置", hint: "開啟 Apple 前，先準備好型號、容量及顏色。" },
      { title: "了解購買選項", hint: "下單前閱讀 Apple 的付款方式及流動網絡供應商選項。" },
      { title: "再次確認目前庫存", hint: "過去的觀察或通知，不會替你留起手機。" },
      { title: "等待取貨準備完成確認", hint: "等 Apple 確認訂單商品已可取貨，再安排前往。" },
    ],
    guide: "取貨準備指南（英文）",
    window: "你所選店舖的記錄",
  },

  restock: {
    title: "你的分店幾時補貨",
    anyIphone: "iPhone",
    and: " 及 ",
    yours: (k: number) => (k === 1 ? "你的分店" : `你的 ${n(k)} 間分店`),
    Yours: (k: number) => (k === 1 ? "你的分店" : `你的 ${n(k)} 間分店`),
    otherStores: (k: number) => `其他 ${n(k)} 間分店`,
    meta: (what: string, stores: number, days: number, zone: string) => `${what} · ${n(stores)} 間分店 · 過去 ${n(days)} 日 · ${zone}`,
    busiest: (yours: string, then: string | null) => (then ? `${yours}最多補貨的鐘點 · 其次 ${then}` : `${yours}最多補貨的鐘點`),
    busiestArea: (stores: number, zone: string) => `同一時區（${zone}）全部 ${n(stores)} 間分店最多補貨的鐘點`,
    next: (inHours: number) => `下一個時段 · ${inHours === 0 ? "就在這一小時" : `${n(inHours)} 小時後`}`,
    typical: "一般上架多久便售罄",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `${yours}暫未有補貨 · 過去 ${n(days)} 日` : `${yours}的補貨 · 過去 ${n(days)} 日${pattern ? "" : " · 次數太少，未成規律"}`),
    byHour: (busiestInGreen: boolean) => `按鐘點${busiestInGreen ? " · 最多的以綠色標示" : ""}`,
    byWeekday: (busiest: string | null) => `按星期${busiest ? ` · ${busiest}最多` : ""}`,
    hourChart: (yours: string, zone: string, items: string) => `${yours}按鐘點的補貨（${zone}）：${items}`,
    weekdayChart: (yours: string, items: string) => `${yours}按星期的補貨：${items}`,
    chartItem: (label: string, k: number, reported: number) => `${label} ${n(k)}${reported ? `（另有 ${n(reported)} 次由其他追蹤網站報告）` : ""}`,
    barTitle: (label: string, k: number, yours: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label}：${yours}補貨 ${n(k)} 次${area ? ` · 同一時區（${area.zone}）共 ${n(area.n)} 次` : ""}${reported ? ` · 其他追蹤網站報告 ${n(reported)} 次` : ""}`,
    now: "現在",
    allZone: (stores: number, zone: string) => `同一時區（${zone}）全部 ${n(stores)} 間分店`,
    reportMarkBars: "虛線",
    reportMarkDots: "空心點",
    sellTitle: "你的補貨幾快售罄",
    sellMeta: (what: string, stores: number, days: number) => `${what} · ${n(stores)} 間分店 · 過去 ${n(days)} 日`,
    sellLabel: (yours: string) => yours,
  },

  success: {
    metaTitle: "提醒已啟用",
    isOn: (plan: string) => `${plan} 已啟用`,
    yourPlan: "你的方案",
    received: "已收到付款",
    onPlan: (limit: number) => `你的方案可設 ${n(limit)} 個提醒。`,
    planOn: "你的方案已啟用。",
    pending: "你的訂閱會在一分鐘內出現在帳戶中。",
    open: "打開我的提醒",
    another: "再加一個提醒",
    saved: (k: number) => `已儲存 ${n(k)} 個提醒 · 收據由 Stripe 寄出`,
    pushOn: "通知",
    pushNext: "下一步：在手機收提醒",
  },

  install: {
    metaTitle: "準備接收 ShelfSpring 通知的裝置",
    metaDescription: "按照手機或電腦的步驟登入並測試通知。接收情況亦受瀏覽器及裝置設定影響。",
  },

  pricing: {
    metaTitle: "候選清單訂閱：10、20 或 50 條通知規則",
    metaDescription: "留下想買的 iPhone 及能前往的店舖。ShelfSpring 每月 5 美元起，公開庫存、地圖及變動記錄仍可免費瀏覽。",
    title: "讓訂閱照看你的候選清單。",
    lead: "查庫存毋須付費。需要收到符合條件的變動時，再選擇訂閱。**一條規則追蹤一間店舖的一種確切 iPhone 配置。**",
    chips: ["公開庫存及歷史記錄免費瀏覽","所有方案使用相同庫存來源","每月以美元計費","可在帳戶內取消續訂"],
    fastest: "訂閱可以替你做甚麼",
    everyFast: "偵測到符合條件的庫存後才會發送通知。來源檢查、資料同步及通知傳送都可能造成延遲。",
    historySample: "所有追蹤地區 · 最近 7 天 · {n} 個已結束的可取貨時段",
    sellsOut: (band: string) => `觀察到的 iPhone Duo 可取貨時段中位數為 **${band}**。這描述的是已記錄樣本，並不代表下次機會會維持多久。`,
    band: (range: string) => `${range} 秒`,
    aboutMinute: "約一分鐘",
    sameSpeed: "定期更新存貨",
    rechecked: "你的分店重新檢查",
    toPhone: "確認補貨到推送上手機",
    listing: "已記錄 Duo 可取貨時段的中位數",
    note: { plus: "1 部 iPhone × 10 間分店", pro: "2 部 iPhone × 10 間分店", max: "5 部 iPhone × 10 間分店" } as Record<string, string>,
    month: "/ 月",
    alerts: (k: number) => `${n(k)} 個提醒`,
    perks: ["指定確切容量及顏色","按行程調整追蹤店舖","瀏覽器推送，無法使用時以電郵作後備"],
    cancel: "隨時取消",
    get: (plan: string) => `選擇 ${plan}`,
    billing: "Stripe 收費 · 信用卡或 Link · 轉換方案按比例計算",
    refund: "不合用？如你仍未收到任何補貨提醒，[7 日內可全額退款](/refunds)",
  },
};
