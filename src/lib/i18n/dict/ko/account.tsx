/**
 * 한국어 문구: account (대시보드, 그 안의 재진열 모듈, 설치·결제 완료·요금제 페이지). 숫자는 날것으로 와서 num()으로 적어요.
 * **굵게** / [라벨](링크)는 <Md>로 렌더링돼요. 요금제 이름과 달러 금액은 번역하지 않아요(모든 언어에서 USD 청구).
 */
import { num } from "@/lib/i18n/format";
import type { Dict } from "../en";

const n = (x: number) => num("ko", x);

export const account: Dict["account"] = {
  loading: "여는 중",
  meta: { title: "내 관찰 목록" },
  signedInAs: (email: string) => `계정 · ${email}`,
  title: "내 관찰 목록을 한곳에서.",
  units: { s: "초", min: "분", taps: "번 누름" },

  plan: {
    title: "멤버십과 결제",
    none: "켜진 플랜 없음 · 알림은 보관만 되고 나가지 않아요",
    summary: (plan: string, on: number, limit: number) => `${plan} · 작동 중인 알림 ${n(on)}/${n(limit)}`,
    renews: (date: string) => ` · 다음 갱신 ${date}`,
    ends: (date: string) => ` · ${date}까지 유효`,
  },

  sent: {
    title: "알림 전달 기록",
    last: (ago: string) => `가장 최근 ${ago}`,
    none: "아직 전달 기록 없음",
    empty: "이 계정으로 나간 재진열 알림은 아직 없어요. 유료 플랜이 켜져 있고 맞는 변화가 확인되면 저장된 규칙이 전달을 시작해요.",
    channel: { push: "기기 알림", email: "이메일" },
    status: { sent: "전달됨", failed: "전달 안 됨", skipped: "건너뜀" },
  },

  fast: {
    title: "픽업 주문, 미리 준비해 두기",
    sub: "쓸 만한 다음 진열이 오기 전에 볼 짧은 점검표",
    lasts: "기록된 Duo 진열 시간 중앙값",
    push: "도착 시간은 그때그때 달라요 · 재고는 Apple에서 확인하세요",
    tapsLeft: "알림이 온 뒤 내 몫으로 남는 단계",
    steps: [
      { title: "갈 수 있는 거리부터 따져 보기", hint: "주문이 확정됐을 때 정말 받으러 갈 수 있는 매장만 남겨 두세요." },
      { title: "구성을 정확히 알아 두기", hint: "Apple을 열기 전에 모델, 용량, 마감을 정해 두세요." },
      { title: "살 방법 훑어보기", hint: "주문 전에 Apple의 결제 방식과 통신사 선택지를 읽어 두세요." },
      { title: "진열을 한 번 더 확인하기", hint: "지난 관측이나 알림이 휴대폰을 대신 잡아 두지는 못해요." },
      { title: "픽업 확정 소식을 기다리기", hint: "Apple이 받을 준비가 됐다고 알려 준 다음에 출발하세요." },
    ],
    guide: "픽업 점검표 읽기 (영어)",
    window: "내 매장의 재진열 시각",
  },

  restock: {
    /** "Restock by restock" on the dashboard: each restock against the member's alerts (lib/alertMarks.ts). */
    mark: { delivered: "알림 도착", sent: "알림 발송됨", other: "내 알림 대상 아님", before: "알림 설정 전" },
    title: "내 매장들의 재진열 시각",
    anyIphone: "iPhone",
    and: "·",
    yours: (k: number) => (k === 1 ? "내 매장" : `내 매장 ${n(k)}곳`),
    Yours: (k: number) => (k === 1 ? "내 매장" : `내 매장 ${n(k)}곳`),
    otherStores: (k: number) => `그 밖의 매장 ${n(k)}곳`,
    meta: (what: string, stores: number, days: number, zone: string) => `${what} · 매장 ${n(stores)}곳 · ${n(days)}일치 기록 · ${zone}`,
    busiest: (yours: string, then: string | null) => (then ? `${yours}에서 재진열이 가장 많은 때 · 2위 ${then}` : `${yours}에서 재진열이 가장 많은 때`),
    busiestArea: (stores: number, zone: string) => `${zone} 기준 매장 ${n(stores)}곳의 정점`,
    next: (inHours: number) => `다가오는 구간 · ${inHours === 0 ? "이번 시간 안" : `${n(inHours)}시간 남음`}`,
    typical: "진열 시간 중앙값",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `${yours}에 기록된 재진열 없음 · ${n(days)}일치 기록` : `${yours}에 기록된 재진열 · ${n(days)}일치 기록${pattern ? "" : " · 패턴으로 보기엔 모자람"}`),
    byHour: (busiestInGreen: boolean) => `하루 중 시각${busiestInGreen ? " · 정점은 초록" : ""}`,
    byWeekday: (busiest: string | null) => `주중 요일${busiest ? ` · 정점 ${busiest}` : ""}`,
    hourChart: (yours: string, zone: string, items: string) => `${yours}의 시각별 재진열(${zone}): ${items}`,
    weekdayChart: (yours: string, items: string) => `${yours}의 요일별 재진열: ${items}`,
    chartItem: (label: string, k: number, reported: number) => `${label} ${n(k)}건${reported ? ` (외부 +${n(reported)})` : ""}`,
    barTitle: (label: string, k: number, yours: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label}: ${yours}에 기록된 재진열 ${n(k)}건${area ? ` · ${area.zone} 전체로는 ${n(area.n)}건` : ""}${reported ? ` · 외부 제보 ${n(reported)}건` : ""}`,
    now: "지금",
    allZone: (stores: number, zone: string) => `${zone} 기준의 모든 매장 (${n(stores)}곳)`,
    reportMarkBars: "점선 막대",
    reportMarkDots: "속이 빈 점",
    sellTitle: "재진열이 진열대에 머무는 시간",
    sellMeta: (what: string, stores: number, days: number) => `${what} · 매장 ${n(stores)}곳 · ${n(days)}일치 기록`,
    sellLabel: (yours: string) => yours,
  },

  success: {
    metaTitle: "알림이 작동하기 시작했어요",
    isOn: (plan: string) => `${plan} 작동 중`,
    yourPlan: "지금 플랜",
    received: "결제 확인됨",
    onPlan: (limit: number) => `관찰 목록에 알림 ${n(limit)}개 자리가 생겼어요.`,
    planOn: "플랜이 켜졌어요.",
    pending: "Stripe가 아직 확인하는 중이에요. 1분 안에 계정에 플랜이 보일 거예요.",
    open: "관찰 목록 열기",
    another: "관찰 목록에 더하기",
    saved: (k: number) => `알림 ${n(k)}개 보관됨 · 영수증은 Stripe가 이메일로 보내요`,
    pushOn: "기기 알림",
    pushNext: "다음 단계: 기기 하나 허용하기",
  },

  install: {
    metaTitle: "ShelfSpring 알림을 받을 기기 준비하기",
    metaDescription: "휴대전화 또는 컴퓨터에 맞는 절차로 로그인하고 알림을 테스트하세요. 수신 여부는 브라우저와 기기 설정에도 영향을 받습니다.",
  },

  pricing: {
    metaTitle: "관심 목록 요금제: 알림 규칙 10개, 20개 또는 50개",
    metaDescription: "원하는 iPhone과 방문 가능한 매장을 저장하세요. ShelfSpring은 월 5달러부터이며 재고, 지도, 기록된 변화는 무료로 볼 수 있습니다.",
    title: "추려 둔 목록을 위한 멤버십.",
    lead: "둘러보는 건 계속 무료예요. 다음에 맞는 변화가 생겼을 때 그 소식이 나에게 오길 바랄 때 구독하세요. **규칙 하나 = 한 매장의 정확한 iPhone 하나.**",
    chips: ["공개 진열 현황과 이력은 계속 무료", "어느 플랜이든 같은 재고 피드", "미국 달러로 매달 결제", "갱신은 계정에서 멈춤"],
    fastest: "구독이 해 주는 일",
    everyFast: "맞는 진열이 감지되면 그때 알림이 나가요. 원본 확인, 동기화, 알림 전달 과정에서 시간이 더 걸릴 수 있어요.",
    historySample: "추적하는 모든 나라 · 지난 7일 · 끝난 픽업 진열 {n}건",
    sellsOut: (band: string) => `관측된 iPhone Duo 진열 시간의 중앙값은 **${band}**였어요. 기록된 표본을 그린 숫자일 뿐, 내 다음 기회가 얼마나 갈지는 말해 주지 않아요.`,
    band: (range: string) => `${range}초`,
    aboutMinute: "1분 남짓",
    sameSpeed: "재고를 자주 다시 읽어요",
    rechecked: "내 매장을 들여다보는 간격",
    toPhone: "확인된 재진열에서 내 기기까지",
    listing: "Duo 진열 시간 중앙값",
    note: { plus: "예: 구성 하나를 매장 열 곳에서", pro: "예: 구성 둘, 각각 매장 열 곳", max: "예: 구성 다섯, 각각 매장 열 곳" },
    month: "/ 한 달",
    alerts: (k: number) => `알림 규칙 ${n(k)}개`,
    perks: ["용량과 마감 조합을 정확히 골라요", "계획이 바뀌면 갈 수 있는 매장도 고쳐요", "브라우저 푸시, 안 되면 이메일"],
    cancel: "갱신은 언제든 멈출 수 있어요",
    get: (plan: string) => `${plan} 시작하기`,
    billing: "결제는 Stripe에서 카드나 Link로 해요. 상위 플랜은 남은 기간만큼 청구되고, 하위 플랜은 다음 갱신일부터 적용돼요.",
    refund: "환불 조건: 최근 7일 안에 낸 결제이고 그 뒤로 재입고 알림이 한 번도 전달되지 않았다면 전액 돌려드려요([환불 정책](/refunds)).",
  },
};
