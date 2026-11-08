/**
 * 한국어 문구: modules — 재입고·매장·재고 모듈(src/components/{restocks,stores,stock}).
 * `label`은 페이지가 만든 조사 없는 장소 명사구("서울", "Apple 강남", "이 매장", "국내")예요. 문장마다 조사를 붙여 써요.
 * 숫자는 날것으로 와서 num()으로 적고, 시간·날짜·비율은 이미 형식이 맞춰져 와요. 확인 주기는 15초(전체)와 5초(알림 매장)뿐이에요.
 */
import type { ReactNode } from "react";
import { num } from "@/lib/i18n/format";
import type { Dict } from "../en";

const n = (x: number) => num("ko", x);

export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `최근 ${n(days)}일 동안 ${label}에서 기록된 재입고나 품절이 없어요. 첫 기록부터 차트가 채워져요.`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `최근 ${n(days)}일 동안 ${label}에서 재입고 ${n(restocks)}회, 품절 ${n(soldouts)}회가 있었고, 서로 다른 ${n(activeDays)}일에 걸쳐 있어요.`,
    busiest: (day: string, restocks: number) => <> 가장 많았던 날은 <b className="text-ink">{day}</b>, 재입고 {n(restocks)}회예요.</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day}: 재입고 ${n(restocks)}회, 품절 ${n(soldouts)}회`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day}: 재입고 ${n(restocks)}회 · 품절 ${n(soldouts)}회`,
    legendRestocks: "재입고",
    legendSoldouts: "품절",
  },

  last24: {
    title: (label: string) => `최근 24시간 ${label} iPhone Duo 재입고`,
    asOf: (when: string) => `${when} 기준`,
    localTime: (when: string) => `현지 시간 ${when}`,
    anAppleStore: "Apple Store",
    unknown: "최근 24시간 집계를 지금은 읽지 못했어요. 이 페이지의 실시간 재고와 재입고 기록은 영향이 없어요.",
    none: (label: string, asOf: string) => <><b className="text-ink">최근 24시간 {label}에서 iPhone Duo 재입고 없음</b> ({asOf} 기준).</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <>최근 24시간 동안 <b className="text-ink">{o.one ? `${o.label}에서` : `${o.label} Apple Store ${n(o.allStores)}곳 중 ${n(o.withStores)}곳에서`} iPhone Duo가 {n(o.restocks)}회 재입고</b>됐어요. 가장 최근: <b className="text-ink">{o.config}</b>{o.store != null && <>, {o.store}</>}, 현지 시간 {o.when}.</>
    ),
    tileRestocks: "확인된 재입고 · 24시간",
    tileConfigsBack: "다시 들어온 구성",
    tileStores: (configs: number, allConfigs: number) => `재입고된 매장${configs ? ` · 구성 ${n(allConfigs)}개 중 ${n(configs)}개` : ""}`,
    tileLatest: (config: string, store: string | null) => <>가장 최근 · {config}{store != null && <> · {store}</>}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>그 전 마지막 · {config}{store != null && <> · {store}</>} · {day}</>,
    tileNoEarlier: "이전 재입고 기록 없음",
    caption: (label: string, asOf: string) => `${label} iPhone Duo 구성별 확인된 재입고, 최근 24시간, ${asOf} 기준`,
    thConfig: "구성",
    thRestocks: "재입고",
    thStores: "매장",
    thLast: "마지막 재입고(현지 시간)",
    thNow: "지금 재고",
    ofStores: (k: number, total: number) => `${n(total)}곳 중 ${n(k)}곳`,
    noneIn24: "24시간 내 없음",
    yes: "있음",
    no: "없음",
    countedTitle: "재입고 집계 방법",
    counted: "재입고 1건은 한 매장의 특정 구성이 품절에서 구매 가능으로 바뀐 것을 확인한 기록입니다. 반복된 변화는 별도 건수이며 기기 수가 아닙니다. 재고 목록은 마지막 확인 시점의 상태입니다. 이력은 재고가 다시 나타난 곳을 보여 주며 다음 배송을 예측하지 않습니다.",
    alert: (label: string | null) => `휴대폰에서 재입고 알림 설정하기${label ? ` · ${label}` : ""}`,
  },

  clock: {
    none: (label: string, days: number) => `최근 ${n(days)}일 동안 ${label}에서 아직 기록된 재입고가 없어요.`,
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `최근 ${n(days)}일 동안 ${label}에서 재입고 ${n(total)}회${dates != null ? `(${n(dates)}일에 걸쳐)` : ""}: 패턴을 말하기엔 아직 적어요.`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>최근 {n(days)}일 동안 {label}에서 재입고 {n(total)}회. 대부분 현지 시간 <b className="text-ink">{hour}</b> 전후에 들어와요{day ? <>. 가장 많은 요일은 <b className="text-ink">{day}</b></> : null}.</>
    ),
    byHour: (zone: string) => `시간대별 · ${zone}`,
    byWeekday: "요일별",
    barReported: (k: number) => ` (+다른 트래커 제보 ${n(k)}회)`,
    barReportedTitle: (bar: string, k: number) => `${bar}: 다른 트래커 제보 ${n(k)}회`,
    legendOurs: "기록된 재입고",
  },

  feed: {
    empty: "아직 기록된 재입고가 없어요.",
    available: "재고 있음",
    soldOut: "품절",
    soldOutAt: (time: ReactNode) => <>{time} 품절</>,
    since: (time: ReactNode) => <>{time}부터</>,
    restockedAt: (time: ReactNode) => <>{time} 재입고</>,
    mapAria: (store: string) => `지도에서 ${store} 보기`,
    map: "지도",
    buyAria: (model: string, config: string) => `apple.com에서 ${model} ${config} 구입하기`,
    buy: "apple.com에서 구입하기",
  },

  byConfig: {
    empty: (label: string, days: number) => `최근 ${n(days)}일 동안 ${label}에서 재입고된 구성이 없어 아직 순위가 없어요.`,
    intro: (label: string, days: number) => `최근 ${n(days)}일 동안 ${label}에서 다시 들어온 구성, 많은 순이에요.`,
    times: (k: number) => `${n(k)}회`,
    alert: "알림 받기",
  },

  sellout: {
    typical: (label: string, band: string) => `${label}의 iPhone Duo 재입고는 보통 약 ${band} 만에 품절됐어요.`,
    half: (label: string, duration: string) => `${label} 재입고의 절반은 ${duration} 안에 품절됐어요.`,
    none: (label: string, days: number) => `최근 ${n(days)}일 동안 ${label}에서 품절까지 간 재입고가 아직 없어요.`,
    whatDuo: "iPhone Duo",
    whatAll: "전체 iPhone",
    tileHalf: (what: string) => <>절반 품절까지 · {what}</>,
    tileWithin30: "30초 안에 품절",
    tileWithin60: "1분 안에 품절",
    tileFastest: (k: number, days: number) => <>최단 · 품절된 재입고 {n(k)}회, {n(days)}일</>,
    caption: (days: number) => `iPhone별, 최근 ${n(days)}일`,
    thIphone: "iPhone",
    thSoldOut: "품절",
    thHalf: "절반 품절까지",
    thWithin30: "≤ 30초",
    thWithin60: "≤ 1분",
    thFastest: "최단",
    each: "재입고별",
    barNote: (full: string) => `막대 = 재고가 떠 있던 시간 · ${full}이면 가득`,
    stillListed: (duration: string) => `아직 판매 중 · ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "측정 방법",
    measured: (_estimated: boolean) => { void _estimated; return "게시 지속 시간은 마지막 재고 있음 관측과 첫 재고 없음 관측 사이로 측정합니다. ≈는 추정 구간입니다. 확인 간격보다 짧은 재고는 놓칠 수 있으며, 이 시간은 결제 가능 시간을 보장하지 않습니다."; },
  },

  configTable: {
    title: "이 매장의 모든 구성",
    titleAt: (store: string) => `${store}의 모든 구성`,
    lookupOff: (hasRows: boolean) => `Apple이 지금 이 매장의 매장 픽업 조회를 막아 두었어요${hasRows ? "(마지막으로 받은 응답은 아래에 있어요)" : ""}`,
    tracked: (k: number) => `구성 ${n(k)}개 확인 중`,
    firstSweep: "첫 확인 진행 중: 1분 안에 상태가 표시돼요",
    inStock: (k: number, total: number) => `${n(total)}개 중 ${n(k)}개 재고 있음`,
    available: "픽업 가능",
    unavailable: "재고 없음",
    noLookup: "픽업 조회 불가",
    notChecked: "아직 확인 전",
    since: (ago: ReactNode) => <>{ago}부터</>,
    lastAvailable: (ago: ReactNode) => <>마지막 재고 {ago}</>,
    neverHere: "이 매장에선 아직 재고를 본 적 없음",
    buy: "구입",
    alertAria: (model: string, config: string, store: string) => `${store}에 ${model} ${config} 재고가 들어오면 알림 받기`,
    alert: "알림 받기 →",
  },

  matrix: {
    store: "매장",
    checked: "확인",
    cellTitle: (model: string, k: number, total: number) => `${model}: 구성 ${n(total)}개 중 ${n(k)}개 픽업 가능`,
  },

  nearby: {
    duo: (short: string, k: number) => `${short} · ${n(k)}`,
    noDuo: (short: string) => `${short} 없음`,
  },

  stockByModel: {
    availableNow: (k: number, total: number) => `지금 구성 ${n(total)}개 중 ${n(k)}개 픽업 가능`,
    noneNow: (total: number) => `지금은 구성 ${n(total)}개 모두 없음`,
    lookupOff: "Apple이 지금 이 매장의 픽업 조회를 막아 두었어요",
    notChecked: "아직 확인 전",
    more: (k: number) => `+${n(k)}`,
    checked: (ago: ReactNode) => <>{ago} 확인</>,
    alert: "알림 받기 →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>{ago} · 정기적으로 재고 업데이트</>,
    map: "지도에서 보기",
    alert: "이 매장 알림 받기",
    alsoIn: (region: string) => `${region}의 다른 매장`,
    acrossLine: "다른 지역의 가까운 매장",
    elsewhere: "그 밖의 가까운 매장",
  },

  hours: {
    title: "영업시간",
    local: (zone: string) => `현지 시간 · ${zone}`,
    today: (hours: string, week: string) => ` · 오늘 ${hours} · ${week}`,
    directions: "길찾기",
    applePage: "apple.com 매장 페이지",
    liveMap: "실시간 지도",
    storePage: "매장 페이지",
    closed: "휴무",
    everyDay: (hours: string) => `매일 ${hours}`,
    openNow: (closes: string) => `영업 중 · ${closes} 종료`,
    opensAt: (opens: string) => `${opens} 영업 시작`,
    closedToday: (next: string | null) => (next ? `오늘 휴무 · ${next} 영업 시작` : "오늘 휴무"),
    closedNow: (next: string | null) => (next ? `영업 종료 · ${next} 영업 시작` : "영업 종료"),
    nextOpen: (day: string | null, time: string) => `${day ? `${day}요일` : "내일"} ${time}`,
  },

  liveStats: {
    inStock: "지금 재고",
    storesWith: "재고 있는 매장",
    lastCheck: "마지막 확인",
    none: "—",
  },

  board: {
    summary: (k: number, stores: number, short: string) => `매장 ${n(stores)}곳 중 ${n(k)}곳에 ${short} 재고 있음`,
    lastCheck: (ago: ReactNode) => <>마지막 확인 {ago}</>,
    firstSweep: "첫 확인 진행 중.",
    noneListed: (model: string, storage: string | null, color: string | null) => `지금 ${model}${storage ? ` ${storage}` : ""}${color ? ` ${color}` : ""} 재고가 있는 매장이 없어요.`,
    more: (k: number) => `+${n(k)}`,
    seen: (ago: ReactNode) => <>{ago} 확인</>,
    loading: "재고 불러오는 중",
  },

  /** DuoLedger: 지역·도시·매장·국가·Duo 모델 페이지 첫머리의 관측 장부. `place`는 조사 없는 지명·매장명. */
  duoLedger: {
    kicker: (place: string) => `관측 장부 · iPhone Duo · ${place}`,
    headNone: (o) => `${o.place}의 Apple Store ${n(o.n)}곳 어디에도 픽업 가능한 iPhone Duo가 등록되어 있지 않습니다.`,
    headNoneOne: (place: string) => `${place}에는 픽업 가능한 iPhone Duo 구성이 없습니다.`,
    headSome: (o) => <>{o.place}의 Apple Store {n(o.n)}곳 중 {n(o.k)}곳에 iPhone Duo가 픽업 가능으로 등록되어 있습니다: {o.list}.</>,
    headSomeOne: (o) => <>{o.place}에는 iPhone Duo {n(o.total)}개 구성 중 {n(o.k)}개가 픽업 가능으로 등록되어 있습니다: {o.list}.</>,
    storeItem: (store: ReactNode, configs: number) => <>{store} ({n(configs)}개 구성)</>,
    observed: (stamp: string) => `${stamp} 관측.`,
    lastReturn: (o) => <>최근 확인된 재입고: <b className="text-ink">{o.config}</b>{o.store != null && <> · {o.store}</>}, {o.when}{o.lasted ? <> ({o.lasted})</> : null}.</>,
    noReturnYet: (place: string, since: string) => `기록을 시작한 ${since} 이후 ${place}에서 확인된 iPhone Duo 재입고가 없습니다.`,
    others: (o) => (o.one ? `iPhone 18 Pro: ${n(o.configs)}개 구성 중 ${n(o.pro)}개 등록 · 18 Pro Max: ${n(o.max)}개.` : `iPhone 18 Pro: ${n(o.pro)}곳에 등록 · 18 Pro Max: ${n(o.max)}곳.`),
    mReturns: (since: string) => `${since} 이후 확인된 재입고`,
    mStores: "재입고가 1회 이상 있었던 매장",
    mDays: "재입고가 있었던 날 (추적일 기준)",
    mWindow: (pct: string) => `가장 붐빈 2시간 · 기록의 ${pct}`,
    mPerDay: "추적 1일당 재입고",
    mMedian: "등록 유지 시간 중앙값 (등록부터 사라질 때까지)",
    mToday: "오늘 재입고 (지금까지)",
    secUnit: "초",
    minUnit: "분",
    note: (o) => (o.one
      ? `${o.since} 이후 ShelfSpring은 ${o.place}에서 확인된 iPhone Duo 재입고 ${n(o.n)}건을 기록했습니다 (추적 ${n(o.tracked)}일 중 ${n(o.days)}일). 가장 붐빈 2시간은 ${o.range}로 기록의 ${o.pct}를 차지했고 (오전 8시~정오는 ${o.morning}), 단일 최다 시간대는 ${o.busiest}의 ${n(o.busiestN)}건입니다.${o.median ? ` 측정된 등록의 절반은 ${o.median} 안에 사라졌습니다.` : ""}${o.config ? ` 가장 자주 재입고된 구성은 ${o.config}입니다 (${n(o.n)}건 중 ${n(o.top)}건).` : ""}`
      : `${o.since} 이후 ShelfSpring은 ${o.place}의 Apple Store ${n(o.stores)}곳에서 확인된 iPhone Duo 재입고 ${n(o.n)}건을 기록했고, 그중 ${n(o.k)}곳에서 1회 이상 있었습니다. 가장 붐빈 2시간은 ${o.range}(${o.zone})로 기록의 ${o.pct}를 차지했고 (오전 8시~정오는 ${o.morning}), 단일 최다 시간대는 ${o.busiest}의 ${n(o.busiestN)}건입니다.${o.median ? ` 측정된 등록의 절반은 ${o.median} 안에 사라졌습니다.` : ""}${o.config ? ` 가장 자주 재입고된 구성은 ${o.config}입니다 (${n(o.n)}건 중 ${n(o.top)}건).` : ""}`),
    noteFew: (o) => `${o.since} 이후 ${o.one ? o.place : `${o.place}의 Apple Store ${n(o.stores)}곳`}에서 확인된 iPhone Duo 재입고는 ${n(o.n)}건 (${n(o.days)}일)으로, ShelfSpring이 자주 나오는 시간대를 말하기 전에 적용하는 기준 (${n(o.min)}건, ${n(o.minDays)}일)에 미치지 않습니다.${o.median ? ` 측정된 등록의 절반은 ${o.median} 안에 사라졌습니다.` : ""} 개별 재입고는 아래 장부에 있습니다.`,
    hourByHour: "시간대별 기록 열기 →",
    ledger: (k: number) => `최근 재입고 기록 ${n(k)}건`,
    col: { observed: "관측 (매장 현지 시간)", config: "구성", store: "매장", listed: "등록 유지" },
    secs: (k: number) => `${n(k)}초`,
    mins: (k: number) => `${n(k)}분`,
    listedRange: (low: string, high: string) => `등록 ${low}~${high}`,
    listedAbout: (x: string) => `등록 약 ${x}`,
    stillListed: (x: string) => `아직 등록됨 (${x})`,
    method: (o) => `${o.since}부터의 기록 · ${o.note} · 재입고는 연속 두 번의 관측이 일치할 때 집계하며, 구성이 처음 나타난 것은 집계하지 않습니다.`,
    delivered: (o) => (o.one
      ? `지난 ${n(o.days)}일 동안 ShelfSpring은 ${o.place}의 재입고에 대해 회원에게 알림 ${n(o.sent)}건을 전달했습니다.`
      : `지난 ${n(o.days)}일 동안 ShelfSpring은 ${o.place}의 Apple Store ${n(o.total)}곳 중 ${n(o.stores)}곳의 재입고에 대해 회원에게 알림 ${n(o.sent)}건을 전달했습니다.`),
    watch: (place: string) => `${place}에서 구성 지켜보기 →`,
    watchOne: "이 매장의 구성 지켜보기 →",
    unknown: "지금은 관측 기록을 읽을 수 없습니다. 위의 실시간 등록 정보에는 영향이 없습니다.",
    zone: () => "현지 시간",
    allModels: (o) => `모든 모델 합계: ${n(o.days)}일 동안 재입고 ${n(o.n)}건${o.peak ? `, 최다 시간대 ${o.peak}` : ""}.`,
  },
};
