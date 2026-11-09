/** 台灣中文客戶端字串：content —— 首屏上架查詢（美國首頁）與換頁骨架。 */
import type { CDict } from "../en";

export const content: CDict["content"] = {
  quickCheck: {
    model: "選擇 iPhone 機型",
    search: "用郵遞區號、城市或門市名稱找",
    useLocation: "依我的位置排列門市",
    nearMe: "📍 找我的位置",
    locationOff: "這裡讀不到你的位置；可以改打郵遞區號。",
    storesNow: "{what}：目前在 **{n} / {total}** 家美國 Apple Store 上架中",
    nearestTo: " · 從 {place} 開始排",
    you: "你",
    noMatch: "沒有符合的項目。換個城市名，或輸入 5 碼的郵遞區號。",
    inStock: "{n}/{total} 上架中",
    soldOut: "已下架",
    alertMe: "加進我的追蹤清單",
    allStores: "完整門市列表（{n}）→",
    here: "就在這",
  },
  skeleton: {
    loading: "載入中…",
  },
};
