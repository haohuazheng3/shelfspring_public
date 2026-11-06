import type { ReactNode } from "react";
import type { Dict } from "../en";

/** 繁體中文（香港）: chrome — footer, 404 page. */
export const chrome: Dict["chrome"] = {
  footer: {
    blurb: "比較即時存貨與近期紀錄，先篩選你實際能到達的Apple Store。 偵測到符合條件的存貨後發送通知；來源查詢、資料同步及通知傳送可能有延遲。",
    blurbIn: (allStores: string) => `${allStores}. 偵測到符合條件的存貨後發送通知；來源查詢、資料同步及通知傳送可能有延遲。`,
    trademark: "本網站與 Apple Inc. 並無關連，亦未獲其認可。Apple、iPhone 及 Apple Store 均為 Apple Inc. 的商標。",
    product: "產品",
    duoStock: "iPhone Duo 現貨",
    proStock: "iPhone 18 Pro 現貨",
    proMaxStock: "iPhone 18 Pro Max 現貨",
    restockLog: "補貨記錄",
    liveMap: "即時地圖",
    storesByState: "按州份查看分店",
    pricing: "收費",
    company: "關於我們",
    howItWorks: "運作原理",
    getApp: "安裝 App",
    about: "關於",
    contact: "聯絡我們",
    allStates: "全部州份及城市 →",
    storesIn: "Apple Store 分店",
    allStores: "全部分店 →",
    legal: "法律條款",
    privacy: "私隱政策",
    terms: "使用條款",
    refunds: "退款政策",
    englishOnly: "英文版本",
    questions: "iPhone Duo 常見問題",
    restockTimes: "Apple 幾時補貨 iPhone Duo？",
    countries: "國家／地區",
    status: "系統狀態",
  },
  notFound: {
    title: "找不到這個頁面",
    body: (stores: ReactNode, map: ReactNode) => <>這個頁面不存在。可以看看{stores}或{map}。</>,
    stores: "按地區查看分店",
    map: "即時地圖",
    home: "返回首頁",
  },
};
