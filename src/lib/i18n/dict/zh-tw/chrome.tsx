/** 台灣中文：chrome（頁尾、404 頁）。 */
import type { ReactNode } from "react";
import type { Dict } from "../en";

export const chrome: Dict["chrome"] = {
  footer: {
    blurb: "把目前庫存和近期紀錄放在一起比較，優先選擇你確實能到達的門市。 偵測到符合條件的庫存後發送通知；來源查詢、資料同步與通知傳送可能增加延遲。",
    blurbIn: (allStores: string) => `${allStores}. 偵測到符合條件的庫存後發送通知；來源查詢、資料同步與通知傳送可能增加延遲。`,
    trademark: "本站與 Apple Inc. 無任何關係，也未獲其認可。Apple、iPhone 與 Apple Store 是 Apple Inc. 的商標。",
    product: "產品",
    duoStock: "iPhone Duo 現貨",
    proStock: "iPhone 18 Pro 現貨",
    proMaxStock: "iPhone 18 Pro Max 現貨",
    restockLog: "補貨紀錄",
    liveMap: "即時地圖",
    storesByState: "美國各州門市",
    pricing: "價格方案",
    company: "關於",
    howItWorks: "運作方式",
    getApp: "安裝 App",
    about: "關於我們",
    contact: "聯絡我們",
    allStates: "所有州與城市 →",
    storesIn: "Apple 直營店",
    allStores: "所有門市 →",
    legal: "法律資訊",
    privacy: "隱私權政策",
    terms: "使用條款",
    refunds: "退款政策",
    englishOnly: "英文版",
    questions: "iPhone Duo 常見問題",
    restockTimes: "Apple 什麼時候補貨 iPhone Duo？",
    countries: "國家／地區",
    status: "系統狀態",
  },
  notFound: {
    title: "找不到這個頁面",
    body: (stores: ReactNode, map: ReactNode) => <>這個頁面不存在。試試{stores}或{map}。</>,
    stores: "門市列表",
    map: "即時地圖",
    home: "回首頁",
  },
};
