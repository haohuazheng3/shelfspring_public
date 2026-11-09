/** 台灣中文客戶端字串：modules（迷你地圖，以及伺服器與客戶端共用的外部回報註腳）。 */
import type { CDict } from "../en";

export const modules: CDict["modules"] = {
  minimap: {
    aria: "到貨架地圖上看 {label}",
    cta: "到貨架地圖上看這家店 →",
  },
  reports: {
    legend: "外部回報 · {sources} · {range}",
    note: "{mark} = {links} 針對 {range} 貼出的{what}。這些不是 ShelfSpring 自己觀測到的，所以放在觀測簿之外，本頁所有數字都沒有算進去。",
    what: "{models} 重新上架回報",
    whatAny: "重新上架回報",
    markDashed: "虛線框",
    markDashedRings: "虛線圈",
    markHollowDots: "空心圓點",
  },
};
