import type { CDict } from "../en";

/** 한국어 클라이언트 문구: modules (MiniMap, 외부 제보 각주). */
export const modules: CDict["modules"] = {
  minimap: {
    aria: "픽업 지도에서 {label} 위치 보기",
    cta: "이 매장을 지도에서 보기 →",
  },
  reports: {
    legend: "외부 제보 · {sources} · {range}",
    note: "{mark} = {links}이(가) {range}에 올린 {what}. ShelfSpring이 직접 관측한 것이 아니어서 장부 바깥에 두며, 이 페이지의 어떤 숫자에도 들어가지 않아요.",
    what: "{models} 재진열 제보",
    whatAny: "재진열 제보",
    markDashed: "점선 테두리",
    markDashedRings: "점선 동그라미",
    markHollowDots: "속이 빈 동그라미",
  },
};
