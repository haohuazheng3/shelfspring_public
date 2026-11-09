/**
 * 한국어 문구: modules — 재진열·매장·진열 모듈(src/components/{restocks,stores,stock}). 관측 장부 말투: 재입고 = 재진열, 재고 있음 = 진열 중, 품절 = 빠짐/진열 없음.
 * `label`은 페이지가 만든 조사 없는 장소 명사구("서울", "Apple 강남", "이 매장", "국내")예요. 문장마다 조사를 붙여 써요.
 * 숫자는 날것으로 와서 num()으로 적고, 시간·날짜·비율은 이미 형식이 맞춰져 와요. 확인 주기는 15초(전체)와 5초(알림 매장)뿐이에요.
 */
import type { ReactNode } from "react";
import { num } from "@/lib/i18n/format";
import type { Dict } from "../en";

const n = (x: number) => num("ko", x);

export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `${label} · 지난 ${n(days)}일은 빈 페이지예요. 재진열도, 진열에서 빠진 기록도 없어요. 첫 기록이 생기는 날부터 막대가 시작돼요.`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `지난 ${n(days)}일 중 ${n(activeDays)}일에 ${label}에서 재진열이 있었어요. 모두 ${n(restocks)}건 기록, 그중 다시 빠진 것 ${n(soldouts)}건.`,
    busiest: (day: string, restocks: number) => <> 정점은 <b className="text-ink">{day}</b>, 그날 하루 {n(restocks)}건.</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day}: 재진열 ${n(restocks)}건, 진열에서 빠짐 ${n(soldouts)}건`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day} · 재진열 ${n(restocks)} · 빠짐 ${n(soldouts)}`,
    legendRestocks: "재진열",
    legendSoldouts: "다시 빠짐",
  },

  last24: {
    title: (label: string) => `${label} iPhone Duo 재진열 · 지난 24시간`,
    asOf: (when: string) => `스냅숏 · ${when}`,
    localTime: (when: string) => `매장 시계 ${when}`,
    anAppleStore: "목록에 없는 Apple Store",
    unknown: "이번 요청에서는 24시간 집계를 읽어 오지 못했어요. 이 페이지의 진열 상태와 재진열 일지는 그대로 믿어도 돼요.",
    none: (label: string, asOf: string) => <><b className="text-ink">{label}, 조용했던 24시간:</b> {asOf}에 끝나는 구간에 기록된 iPhone Duo 재진열이 없어요.</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <>가장 최근 재진열은 <b className="text-ink">{o.config}</b>, 매장 시계로 {o.when}{o.store != null && <>, 기록한 곳 {o.store}</>}. <b className="text-ink">{`구간 안 재진열 ${n(o.restocks)}건`}</b>{o.one ? null : <>, {o.label} 매장 {n(o.allStores)}곳 중 {n(o.withStores)}곳에서</>}.</>
    ),
    tileRestocks: "구간 안 재진열",
    tileConfigsBack: "다시 진열된 구성",
    tileStores: (configs: number, allConfigs: number) => `재진열이 있던 매장${configs ? ` · 구성 ${n(configs)}/${n(allConfigs)}` : ""}`,
    tileLatest: (config: string, store: string | null) => <>가장 최근 · {store != null && <>{store} · </>}{config}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>그 앞 재진열, {day} · {store != null && <>{store} · </>}{config}</>,
    tileNoEarlier: "더 앞선 기록 없음",
    caption: (label: string, asOf: string) => `${asOf}까지 24시간 · ${label}의 iPhone Duo 구성별 재진열`,
    thConfig: "구성",
    thRestocks: "재진열",
    thStores: "매장",
    thLast: "가장 최근 (매장 시계)",
    thNow: "지금 진열",
    ofStores: (k: number, total: number) => `${n(k)}/${n(total)}`,
    noneIn24: "기록 없음",
    yes: "진열 중",
    no: "빠짐",
    countedTitle: "무엇을 재진열 한 건으로 세나요",
    counted: "재진열 한 건은 한 매장의 한 구성이 ‘없음’에서 ‘있음’으로 바뀐 것이 확인된 순간이에요. 같은 곳에서 되풀이되면 따로 세고, 휴대폰 대수를 뜻하지는 않아요. 진열 목록은 마지막 확인 때의 답이고, 이력은 진열이 돌아왔던 곳을 보여 줄 뿐 다음 입고를 내다보지 않아요.",
    alert: (label: string | null) => `휴대폰으로 재진열 알림 걸기${label ? ` · ${label}` : ""}`,
  },

  clock: {
    none: (label: string, days: number) => `${label} · 지난 ${n(days)}일 동안 기록된 재진열 없음.`,
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `${label}에서 ${n(days)}일 동안 기록된 재진열은 ${n(total)}건뿐${dates != null ? `(날짜로는 ${n(dates)}일)` : ""}이라, 늘 오는 시각을 꼽기엔 모자라요.`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>{label}의 흔한 재진열 시각: 매장 시계로 <b className="text-ink">{hour}</b>{day ? <>, 요일 1위는 <b className="text-ink">{day}</b></> : null}. {n(days)}일 동안 쌓인 재진열 {n(total)}건에서 나온 값이에요.</>
    ),
    byHour: (zone: string) => `하루 중 시각 · ${zone} 기준`,
    byWeekday: "주중 요일",
    barReported: (k: number) => ` (외부 제보 +${n(k)})`,
    barReportedTitle: (bar: string, k: number) => `${bar}: 외부 제보 ${n(k)}건`,
    legendOurs: "직접 기록한 재진열",
  },

  feed: {
    empty: "재진열 일지가 아직 비어 있어요.",
    available: "진열 중",
    soldOut: "빠짐",
    soldOutAt: (time: ReactNode) => <>진열 끝 · {time}</>,
    since: (time: ReactNode) => <>재진열 · {time}</>,
    restockedAt: (time: ReactNode) => <>재진열 · {time}</>,
    mapAria: (store: string) => `지도책에서 ${store} 위치 찾기`,
    map: "지도책에서 찾기",
    buyAria: (model: string, config: string) => `apple.com에서 ${model} ${config} 주문하기`,
    buy: "apple.com에서 주문",
  },

  byConfig: {
    empty: (label: string, days: number) => `${label}에서 ${n(days)}일 동안 돌아온 구성이 없어 줄 세울 것이 없어요.`,
    intro: (label: string, days: number) => `${label} · 지난 ${n(days)}일 재진열 수로 줄 세운 구성.`,
    times: (k: number) => `재진열 ${n(k)}건`,
    alert: "지켜보기",
  },

  sellout: {
    typical: (label: string, band: string) => `${label}에서 iPhone Duo 재진열이 진열대에 머문 시간의 중앙값: 대략 ${band}.`,
    half: (label: string, duration: string) => `${label}에서 시간을 잰 재진열의 절반은 ${duration} 안에 진열에서 빠졌어요.`,
    none: (label: string, days: number) => `지난 ${n(days)}일 동안 ${label}에서 진열이 끝난 재진열은 없어요.`,
    whatDuo: "iPhone Duo",
    whatAll: "모든 모델",
    tileHalf: (what: string) => <>진열 시간 중앙값 · {what}</>,
    tileWithin30: "30초 이내에 빠짐",
    tileWithin60: "1분 이내에 빠짐",
    tileFastest: (k: number, days: number) => <>시간을 잰 재진열 {n(k)}건 중 가장 짧음, {n(days)}일</>,
    caption: (days: number) => `모델별, 지난 ${n(days)}일`,
    thIphone: "모델",
    thSoldOut: "잰 횟수",
    thHalf: "중앙값",
    thWithin30: "≤ 30초:",
    thWithin60: "≤ 1분:",
    thFastest: "가장 짧음",
    each: "재진열 하나하나",
    barNote: (full: string) => `막대 길이 = 진열 시간 · ${full}이면 끝까지 참`,
    stillListed: (duration: string) => `아직 진열 중 · ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "진열 시간의 범위를 잡는 법",
    measured: (_estimated: boolean) => { void _estimated; return "진열 시간은 마지막 ‘있음’ 관측과 첫 ‘없음’ 관측 사이로 범위를 잡아요. ≈ 표시는 어림한 구간이에요. 확인 간격보다 짧게 올라왔다 사라진 진열은 놓칠 수 있고, 이 시간이 결제할 수 있는 시간을 보장하지는 않아요."; },
  },

  configTable: {
    title: "구성별 진열 점검",
    titleAt: (store: string) => `구성별 진열 점검 · ${store}`,
    lookupOff: (hasRows: boolean) => `Apple이 이 매장의 픽업 조회를 잠시 멈췄어요${hasRows ? ". 아래 줄은 마지막으로 받은 답이에요" : ""}`,
    tracked: (k: number) => `관찰 목록의 구성 ${n(k)}개`,
    firstSweep: "관측을 여는 중이에요. 첫 상태는 1분 안에 들어와요",
    inStock: (k: number, total: number) => `진열 중: 추적하는 ${n(total)}개 중 ${n(k)}개`,
    available: "진열 중",
    unavailable: "진열 없음",
    noLookup: "조회 멈춤",
    notChecked: "아직 관측 전",
    since: (ago: ReactNode) => <>나타난 때 {ago}</>,
    lastAvailable: (ago: ReactNode) => <>마지막으로 본 때 {ago}</>,
    neverHere: "여기서는 본 적 없음",
    buy: "주문",
    alertAria: (model: string, config: string, store: string) => `${store}의 ${model} ${config} 지켜보기`,
    alert: "지켜보기 →",
  },

  matrix: {
    store: "위치",
    checked: "마지막 관측",
    cellTitle: (model: string, k: number, total: number) => `${model}: 진열 중인 구성 ${n(k)}/${n(total)}`,
  },

  nearby: {
    duo: (short: string, k: number) => `${short} 진열 · ${n(k)}`,
    noDuo: (short: string) => `${short} 진열 없음`,
  },

  stockByModel: {
    availableNow: (k: number, total: number) => `진열 중인 구성 ${n(k)}/${n(total)}`,
    noneNow: (total: number) => `진열 0/${n(total)}`,
    lookupOff: "이 매장은 Apple이 픽업 조회를 멈춰 둔 상태",
    notChecked: "아직 관측 전",
    more: (k: number) => `외 ${n(k)}개`,
    checked: (ago: ReactNode) => <>마지막 관측 {ago}</>,
    alert: "지켜보기 →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>{ago} · 재고를 자주 다시 읽어요</>,
    map: "지도책에서 보기",
    alert: "이 매장 지켜보기",
    alsoIn: (region: string) => `${region}에 더 있는 매장`,
    acrossLine: "경계 너머 가장 가까운 곳",
    elsewhere: "다른 곳 중 가장 가까운 곳",
  },

  hours: {
    title: "문 여는 시간",
    local: (zone: string) => `시각은 ${zone} 기준`,
    today: (hours: string, week: string) => ` · 오늘은 ${hours} · ${week}`,
    directions: "가는 길 보기",
    applePage: "Apple의 매장 안내",
    liveMap: "지도책에서 보기",
    storePage: "매장 기록",
    closed: "쉬는 날",
    everyDay: (hours: string) => `날마다 ${hours}`,
    openNow: (closes: string) => `지금 열려 있음 · ${closes}까지`,
    opensAt: (opens: string) => `${opens}에 문 열어요`,
    closedToday: (next: string | null) => (next ? `오늘은 쉬어요 · 다시 여는 때 ${next}` : "오늘은 쉬어요"),
    closedNow: (next: string | null) => (next ? `지금은 닫혀 있음 · 다시 여는 때 ${next}` : "지금은 닫혀 있음"),
    nextOpen: (day: string | null, time: string) => (day ? `${day}요일 ${time}` : `내일 ${time}`),
    span: (opens: string, closes: string) => `${opens}부터 ${closes}까지`,
  },

  liveStats: {
    inStock: "진열 중",
    storesWith: "올라온 매장",
    lastCheck: "마지막 관측",
    none: "—",
  },

  board: {
    summary: (k: number, stores: number, short: string) => `${short} 진열 중 · 매장 ${n(stores)}곳 중 ${n(k)}곳`,
    lastCheck: (ago: ReactNode) => <>마지막 관측 {ago}</>,
    firstSweep: "관측을 여는 중이에요.",
    noneListed: (model: string, storage: string | null, color: string | null) => `지금은 어느 매장에도 ${model}${storage ? ` ${storage}` : ""}${color ? ` ${color}` : ""} 진열이 없어요.`,
    more: (k: number) => `외 ${n(k)}곳`,
    seen: (ago: ReactNode) => <>기록 {ago}</>,
    loading: "진열대를 읽는 중",
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
    others: (o) => (o.one ? `비교하자면 이 매장은 iPhone 18 Pro 구성 ${n(o.configs)}개 중 ${n(o.pro)}개, Pro Max ${n(o.configs)}개 중 ${n(o.max)}개를 보여 주고 있어요.` : `비교하자면 iPhone 18 Pro는 이 매장들 중 ${n(o.pro)}곳, Pro Max는 ${n(o.max)}곳에 진열돼 있어요.`),
    mReturns: (since: string) => `${since} 이후 확인된 재입고`,
    mStores: "한 번 이상 재입고된 매장",
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
    col: { observed: "본 시각 (매장 시계)", config: "구성", store: "매장", listed: "진열 시간" },
    secs: (k: number) => `${n(k)}초`,
    mins: (k: number) => `${n(k)}분`,
    listedRange: (low: string, high: string) => `${low}~${high} 진열`,
    listedAbout: (x: string) => `대략 ${x} 진열`,
    stillListed: (x: string) => `지금까지 ${x}째 진열 중`,
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
