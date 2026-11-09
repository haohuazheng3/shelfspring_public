/** 繁體中文（香港）client strings: content — 首屏在架查詢與換頁骨架。 */
import type { CDict } from "../en";

export const content: CDict["content"] = {
  quickCheck: {
    model: "揀選 iPhone 型號",
    search: "用郵遞區號、城市或店名查找",
    useLocation: "按我的位置排列店舖",
    nearMe: "📍 找出我的位置",
    locationOff: "此網站讀不到你的位置；可以改打郵遞區號。",
    storesNow: "{what}：此刻在 **{n} / {total}** 間美國 Apple Store 在架",
    nearestTo: " · 由 {place} 起排列",
    you: "你",
    noMatch: "沒有相符項目。換個城市名，或打五個數字的郵遞區號。",
    inStock: "{n}/{total} 在架",
    soldOut: "已落架",
    alertMe: "加入我的監察清單",
    allStores: "完整店舖清單（{n}）→",
    here: "就在此",
  },
  skeleton: {
    loading: "正在載入",
  },
};
