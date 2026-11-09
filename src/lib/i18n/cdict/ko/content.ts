import type { CDict } from "../en";

/** 한국어 클라이언트 문구: content — 첫 화면 진열 확인(QuickCheck)과 이동 중 스켈레톤. */
export const content: CDict["content"] = {
  quickCheck: {
    model: "볼 iPhone 모델 고르기",
    search: "우편번호·도시·매장 이름으로 매장 찾기",
    useLocation: "내 위치에서 가까운 순으로",
    nearMe: "📍 지금 위치",
    locationOff: "여기서는 위치 접근이 꺼져 있어요. 대신 우편번호를 넣어 주세요.",
    storesNow: "{what} · 지금 진열 중인 미국 Apple Store **{n} / {total}곳**",
    nearestTo: " · {place}에서 가까운 순",
    you: "현재 위치",
    noMatch: "맞는 곳이 없어요. 다섯 자리 우편번호나 도시 이름을 넣어 보세요.",
    inStock: "진열 {n} / {total}",
    soldOut: "진열 없음",
    alertMe: "관찰 목록에 넣기",
    allStores: "매장 목록 전체 ({n}) →",
    here: "바로 여기",
  },
  skeleton: {
    loading: "여는 중",
  },
};
