/**
 * 繁體中文（香港）: account（監察清單儀表板、上面的回架模組、安裝／結帳成功／方案頁）。方案名稱與美元金額不翻：
 * 每個方案都以美元收費。{zone} 是 Intl 的時區全名（「香港標準時間」），本身已含「時間」。
 */
import type { Dict } from "../en";
import { n } from "./common";

export const account: Dict["account"] = {
  loading: "正在載入",
  meta: { title: "我的監察清單" },
  signedInAs: (email: string) => `帳戶 · ${email}`,
  title: "你的監察清單，集中一處。",
  units: { s: "秒", min: "分", taps: "次" },

  plan: {
    title: "會籍與付款",
    none: "未有生效方案 · 監察已存下，但不會發出提示",
    summary: (plan: string, on: number, limit: number) => `${plan} · ${n(on)}/${n(limit)} 項監察運作中`,
    renews: (date: string) => ` · 下次續期 ${date}`,
    ends: (date: string) => ` · 有效至 ${date}`,
  },

  sent: {
    title: "你的通知記錄",
    last: (ago: string) => `最近一次 ${ago}`,
    none: "仍未送出任何通知",
    empty: "這個帳戶仍未收到任何相符的回架通知。付費方案生效、而且相符的變化經確認之後，已存的監察才會開始送出提示。",
    channel: { push: "推送", email: "電郵" } as Record<string, string>,
    status: { sent: "已送達", failed: "未送達", skipped: "跳過" } as Record<string, string>,
  },

  fast: {
    title: "預備你的取貨訂單",
    sub: "下一次有用的上架出現之前，先過一遍的短清單",
    lasts: "錄得的 Duo 在架時間中位數",
    push: "送達時間有快有慢；存貨以 Apple 確認為準",
    tapsLeft: "通知到達後，留給你自己完成的步驟",
    steps: [
      { title: "核對你的出行範圍", hint: "只保留確認取貨後你真正去得到的店。" },
      { title: "記清楚確切配置", hint: "打開 Apple 之前，先想好型號、容量和機色。" },
      { title: "看清購買選項", hint: "落單前先看 Apple 的付款方法和電訊商選擇。" },
      { title: "再看一次在架狀態", hint: "過往的觀察或通知，都不能替你留住手機。" },
      { title: "等取貨確認才出發", hint: "Apple 確認訂單可以取貨之後，才動身。" },
    ],
    guide: "閱讀取貨清單（英文）",
    window: "你的回架鐘點",
  },

  restock: {
    title: "你的店舖幾點回架",
    anyIphone: "iPhone",
    and: " 及 ",
    yours: (k: number) => (k === 1 ? "你的店" : `你的 ${n(k)} 間店`),
    Yours: (k: number) => (k === 1 ? "你的店" : `你的 ${n(k)} 間店`),
    otherStores: (k: number) => `另外 ${n(k)} 間店`,
    meta: (what: string, stores: number, days: number, zone: string) => `${what} · ${n(stores)} 間店 · ${n(days)} 日記錄 · ${zone}`,
    busiest: (yours: string, then: string | null) => (then ? `${yours}回架最多的鐘點 · 第二位 ${then}` : `${yours}回架最多的鐘點`),
    busiestArea: (stores: number, zone: string) => `用${zone}的 ${n(stores)} 間店之中的高峰`,
    next: (inHours: number) => `即將來臨的時段 · ${inHours === 0 ? "這個鐘頭之內" : `尚有 ${n(inHours)} 小時`}`,
    typical: "在架時間中位數",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `${yours}未錄得回架 · ${n(days)} 日記錄` : `${yours}錄得的回架 · ${n(days)} 日記錄${pattern ? "" : " · 未足以看出規律"}`),
    byHour: (busiestInGreen: boolean) => `一天中的鐘點${busiestInGreen ? " · 高峰以綠色標示" : ""}`,
    byWeekday: (busiest: string | null) => `星期分佈${busiest ? ` · 高峰在${busiest}` : ""}`,
    hourChart: (yours: string, zone: string, items: string) => `${yours}按鐘點的回架（${zone}）：${items}`,
    weekdayChart: (yours: string, items: string) => `${yours}按星期的回架：${items}`,
    chartItem: (label: string, k: number, reported: number) => `${label} ${n(k)}${reported ? `（外部 +${n(reported)}）` : ""}`,
    barTitle: (label: string, k: number, yours: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label}：${yours}錄得回架 ${n(k)} 次${area ? ` · 用${area.zone}的店共 ${n(area.n)} 次` : ""}${reported ? ` · 外部報告 ${n(reported)} 次` : ""}`,
    now: "此刻",
    allZone: (stores: number, zone: string) => `所有用${zone}的店（${n(stores)} 間）`,
    reportMarkBars: "虛線柱",
    reportMarkDots: "空心圓",
    sellTitle: "回架之後在架多久",
    sellMeta: (what: string, stores: number, days: number) => `${what} · ${n(stores)} 間店 · ${n(days)} 日記錄`,
    sellLabel: (yours: string) => yours,
  },

  success: {
    metaTitle: "監察已啟動",
    isOn: (plan: string) => `${plan} 已生效`,
    yourPlan: "目前方案",
    received: "付款已確認",
    onPlan: (limit: number) => `你的監察清單可容納 ${n(limit)} 項監察。`,
    planOn: "你的方案已生效。",
    pending: "Stripe 仍在確認；大約一分鐘後，方案便會顯示在帳戶裏。",
    open: "打開我的監察清單",
    another: "加入監察清單",
    saved: (k: number) => `已存下 ${n(k)} 項監察 · 收據由 Stripe 電郵寄出`,
    pushOn: "通知",
    pushNext: "下一步：啟用一部裝置",
  },
  install: {
    metaTitle: "準備接收 ShelfSpring 通知的裝置",
    metaDescription: "按照手機或電腦的步驟登入並測試通知。接收情況亦受瀏覽器及裝置設定影響。",
  },

  pricing: {
    metaTitle: "候選清單訂閱：10、20 或 50 條通知規則",
    metaDescription: "留下想買的 iPhone 及能前往的店舖。ShelfSpring 每月 5 美元起，公開庫存、地圖及變動記錄仍可免費瀏覽。",
    title: "為你的候選清單而設的會籍。",
    lead: "瀏覽一直免費。想讓下一次相符的變化主動找上你，才需要訂閱。**一項監察 = 一間店的一個確切 iPhone 配置。**",
    chips: ["公開存貨與歷史一直免費", "每個方案用同一個存貨來源", "每月以美元收費", "可在帳戶內停止續期"],
    fastest: "訂閱做的是甚麼",
    everyFast: "偵測到符合條件的在架配置後才會發出提示；來源查詢、資料同步與推送都可能帶來延遲。",
    historySample: "所有追蹤市場 · 近 7 日 · {n} 個已完結的取貨時段",
    sellsOut: (band: string) => `錄得的 iPhone Duo 在架時間中位數是 **${band}**。這只描述已記錄的樣本，並非你下一次機會的長度。`,
    band: (range: string) => `${range} 秒`,
    aboutMinute: "一分鐘左右",
    sameSpeed: "存貨資料經常更新",
    rechecked: "你的店多久查看一次",
    toPhone: "由確認回架到你的裝置",
    listing: "Duo 在架時間中位數",
    note: { plus: "例如一個配置，在十間店監察", pro: "例如兩個配置，各十間店", max: "例如五個配置，各十間店" } as Record<string, string>,
    month: "每月",
    alerts: (k: number) => `${n(k)} 項監察`,
    perks: ["指定確切的容量與機色組合", "行程有變時隨時改動去得到的店", "瀏覽器推送，電郵作後備"],
    cancel: "續期隨時可以停止",
    get: (plan: string) => `開始 ${plan}`,
    billing: "付款經 Stripe 處理，可用信用卡或 Link。轉方案時，差價按比例計。",
    refund: "退款條款：過去 7 日內的付款，如之後未曾送達任何回架提示，可全數退款（[退款規則](/refunds)）。",
  },
};
