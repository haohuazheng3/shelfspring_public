/**
 * 한국어 문구: account (대시보드, 그 안의 재입고 모듈, 설치·결제 완료·요금제 페이지). 숫자는 날것으로 와서 num()으로 적어요.
 * **굵게** / [라벨](링크)는 <Md>로 렌더링돼요. 요금제 이름과 달러 금액은 번역하지 않아요(모든 언어에서 USD 청구).
 */
import { num } from "@/lib/i18n/format";
import type { Dict } from "../en";

const n = (x: number) => num("ko", x);

export const account: Dict["account"] = {
  loading: "불러오는 중",
  meta: { title: "내 알림" },
  signedInAs: (email: string) => `로그인: ${email}`,
  title: "내 알림",
  units: { s: "초", min: "분", taps: "번" },

  plan: {
    title: "요금제",
    none: "아직 요금제 없음: 알림이 꺼져 있어요",
    summary: (plan: string, on: number, limit: number) => `${plan} · 알림 ${n(limit)}개 중 ${n(on)}개 켜짐`,
    renews: (date: string) => ` · ${date} 갱신`,
    ends: (date: string) => ` · ${date} 종료`,
  },

  sent: {
    title: "보낸 알림",
    last: (ago: string) => `마지막 알림 ${ago}`,
    none: "아직 보낸 알림 없음",
    empty: "아직 보낸 알림이 없어요.",
    channel: { push: "푸시", email: "이메일" },
    status: { sent: "발송됨", failed: "실패", skipped: "건너뜀" },
  },

  fast: {
    title: "픽업 주문 준비하기",
    sub: "다음 기회에 앞서 확인할 짧은 체크리스트",
    lasts: "기록된 Duo 픽업 가능 시간의 중앙값",
    push: "전달 시간은 달라집니다. Apple에서 재고를 확인하세요",
    tapsLeft: "주문 확정 전 확인 사항",
    steps: [
      { title: "방문 가능한 범위 확인", hint: "픽업이 확정되었을 때 실제로 갈 수 있는 매장만 남기세요." },
      { title: "정확한 구성 정하기", hint: "Apple을 열기 전에 모델, 용량, 색상을 확인해 두세요." },
      { title: "구매 옵션 살펴보기", hint: "주문 전에 Apple의 결제 및 통신사 선택 사항을 읽어보세요." },
      { title: "현재 재고 다시 확인", hint: "과거 관측이나 알림이 휴대전화를 따로 확보해 주지는 않습니다." },
      { title: "픽업 준비 완료 확인 기다리기", hint: "Apple이 주문한 상품을 픽업할 준비가 되었다고 확인한 뒤 이동하세요." },
    ],
    guide: "픽업 준비 가이드 (영어)",
    window: "선택한 매장의 기록",
  },

  restock: {
    title: "내 매장은 언제 재입고되나",
    anyIphone: "iPhone",
    and: " 및 ",
    yours: (k: number) => (k === 1 ? "내 매장" : `내 매장 ${n(k)}곳`),
    Yours: (k: number) => (k === 1 ? "내 매장" : `내 매장 ${n(k)}곳`),
    otherStores: (k: number) => `다른 매장 ${n(k)}곳`,
    meta: (what: string, stores: number, days: number, zone: string) => `${what} · 매장 ${n(stores)}곳 · 최근 ${n(days)}일 · ${zone}`,
    busiest: (yours: string, then: string | null) => (then ? `${yours} 최다 시간대 · 다음은 ${then}` : `${yours} 최다 시간대`),
    busiestArea: (stores: number, zone: string) => `${zone} 전체 매장 ${n(stores)}곳 기준 최다`,
    next: (inHours: number) => `다음 시간대 · ${inHours === 0 ? "지금" : `${n(inHours)}시간 후`}`,
    typical: "품절 전까지 보통 떠 있는 시간",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `${yours} 재입고 아직 없음 · 최근 ${n(days)}일` : `${yours} 재입고 · 최근 ${n(days)}일${pattern ? "" : " · 패턴을 말하기엔 적음"}`),
    byHour: (busiestInGreen: boolean) => `시간대별${busiestInGreen ? " · 최다는 초록색" : ""}`,
    byWeekday: (busiest: string | null) => `요일별${busiest ? ` · 최다 ${busiest}` : ""}`,
    hourChart: (yours: string, zone: string, items: string) => `${yours} 시간대별 재입고, ${zone}: ${items}`,
    weekdayChart: (yours: string, items: string) => `${yours} 요일별 재입고: ${items}`,
    chartItem: (label: string, k: number, reported: number) => `${label} ${n(k)}회${reported ? ` (+다른 트래커 제보 ${n(reported)}회)` : ""}`,
    barTitle: (label: string, k: number, yours: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label}: ${yours} 재입고 ${n(k)}회${area ? ` · ${area.zone} 전체 ${n(area.n)}회` : ""}${reported ? ` · 다른 트래커 제보 ${n(reported)}회` : ""}`,
    now: "지금",
    allZone: (stores: number, zone: string) => `${zone} 전체 매장 ${n(stores)}곳`,
    reportMarkBars: "점선",
    reportMarkDots: "빈 점",
    sellTitle: "내 매장 재입고는 얼마나 빨리 품절되나",
    sellMeta: (what: string, stores: number, days: number) => `${what} · 매장 ${n(stores)}곳 · 최근 ${n(days)}일`,
    sellLabel: (yours: string) => yours,
  },

  success: {
    metaTitle: "알림이 켜졌어요",
    isOn: (plan: string) => `${plan} 요금제가 켜졌어요`,
    yourPlan: "내 요금제",
    received: "결제 완료",
    onPlan: (limit: number) => `요금제에 알림 ${n(limit)}개가 포함돼요.`,
    planOn: "요금제가 켜졌어요.",
    pending: "구독 정보는 1분 안에 계정에 표시돼요.",
    open: "내 알림 열기",
    another: "알림 하나 더 추가",
    saved: (k: number) => `알림 ${n(k)}개 저장됨 · 영수증은 Stripe에서 발송`,
    pushOn: "알림",
    pushNext: "다음 단계: 휴대폰으로 알림 받기",
  },

  install: {
    metaTitle: "ShelfSpring 알림을 받을 기기 준비하기",
    metaDescription: "휴대전화 또는 컴퓨터에 맞는 절차로 로그인하고 알림을 테스트하세요. 수신 여부는 브라우저와 기기 설정에도 영향을 받습니다.",
  },

  pricing: {
    metaTitle: "관심 목록 요금제: 알림 규칙 10개, 20개 또는 50개",
    metaDescription: "원하는 iPhone과 방문 가능한 매장을 저장하세요. ShelfSpring은 월 5달러부터이며 재고, 지도, 기록된 변화는 무료로 볼 수 있습니다.",
    title: "필요한 후보만 지켜보는 구독.",
    lead: "재고 조회는 무료입니다. 원하는 변화의 알림이 필요할 때 구독하세요. **규칙 하나는 한 매장의 정확한 iPhone 구성 하나를 추적합니다.**",
    chips: ["공개 재고와 이력은 무료","모든 요금제가 같은 재고 자료 사용","미국 달러로 매월 결제","계정에서 갱신 취소 가능"],
    fastest: "구독으로 할 수 있는 일",
    everyFast: "조건에 맞는 재고가 감지된 뒤 알림을 보냅니다. 원본 확인, 동기화, 알림 전달 과정에서 지연이 생길 수 있습니다.",
    historySample: "추적 대상 전체 국가 · 최근 7일 · 종료된 픽업 가능 구간 {n}건",
    sellsOut: (band: string) => `관측된 iPhone Duo 픽업 가능 시간의 중앙값은 **${band}**입니다. 기록된 표본을 설명하는 값이며 다음 기회의 지속 시간을 예측하지 않습니다.`,
    band: (range: string) => `${range}초`,
    aboutMinute: "약 1분",
    sameSpeed: "정기적으로 재고 업데이트",
    rechecked: "내 매장 재확인 주기",
    toPhone: "재입고 확인 → 휴대폰까지",
    listing: "기록된 Duo 픽업 가능 시간의 중앙값",
    note: { plus: "iPhone 1대 × 매장 10곳", pro: "iPhone 2대 × 매장 10곳", max: "iPhone 5대 × 매장 10곳" },
    month: "/ 월",
    alerts: (k: number) => `알림 ${n(k)}개`,
    perks: ["정확한 용량과 색상 선택","방문 계획에 따라 매장 변경","브라우저 알림과 사용 불가 시 이메일 대체 전달"],
    cancel: "언제든 해지",
    get: (plan: string) => `${plan} 시작하기`,
    billing: "Stripe 결제 · 카드 또는 Link · 요금제 변경은 일할 계산",
    refund: "맞지 않으신가요? 아직 재입고 알림을 한 번도 받지 않았다면 [7일 이내 전액 환불](/refunds)해 드려요",
  },
};
