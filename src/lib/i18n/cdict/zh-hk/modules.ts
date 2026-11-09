/** 繁體中文（香港）client strings: modules（小地圖，以及外部報告的註腳）。 */
import type { CDict } from "../en";

export const modules: CDict["modules"] = {
  minimap: {
    aria: "在貨架地圖上查看 {label}",
    cta: "在貨架地圖上查看此店 →",
  },
  reports: {
    legend: "外部報告 · {sources} · {range}",
    note: "{mark} = {links} 就 {range} 發布的{what}。ShelfSpring 沒有親自觀察到這些，所以它們留在觀察簿以外，這裏任何數字都不包括在內。",
    what: "{models} 回架報告",
    whatAny: "回架報告",
    markDashed: "虛線外框",
    markDashedRings: "虛線圓圈",
    markHollowDots: "空心圓",
  },
};
