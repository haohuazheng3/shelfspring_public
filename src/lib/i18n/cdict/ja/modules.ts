import type { CDict } from "../en";

/** 日本語クライアント文言: modules（ミニマップと、台帳の外に置く外部の報告の注記）。 */
export const modules: CDict["modules"] = {
  minimap: {
    aria: "棚マップで{label}を見る",
    cta: "この店舗を棚マップで見る →",
  },
  reports: {
    legend: "外部の報告 · {sources} · {range}",
    note: "{mark}＝{links}が{range}について出した{what}。ShelfSpring自身が観測したものではないため台帳には入れず、ここに出ている数字にも一切含めていません。",
    what: "{models}の再入荷報告",
    whatAny: "再入荷の報告",
    markDashed: "破線の枠",
    markDashedRings: "破線の丸",
    markHollowDots: "中抜きの丸",
  },
};
