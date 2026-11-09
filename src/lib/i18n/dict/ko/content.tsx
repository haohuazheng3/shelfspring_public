import { withShelfContent } from "@/lib/seo/localizedCopy";
/**
 * 한국어 문구: content — SEO 구성 요소(FAQ, 둘러보기, 숫자 띠, 제품 부분, 출처, 실시간 위젯), enrich 도우미
 * (영업시간, 기간, FAQ 답, 제목), 실시간 {{토큰}}, 재진열 패턴 문장, 사진 대체 텍스트. 관측 장부 말투(재입고 = 재진열, 재고 있음 = 진열 중).
 * 인자는 이미 한국어로 형식이 맞춰져 와요(숫자, 기간, 거리, 매장·도시·색상 이름, "확인된 재진열 31건" 같은 개수+명사).
 */
import type { ReactNode } from "react";
import type { Forms } from "@/lib/i18n/format";
import type { Dict } from "../en";
import { eulReul, eunNeun, iGa, ieyo, krAddress } from "./common";

const f = (x: Forms): Forms => x;
type Kind = "state" | "city" | "store" | "model";
const CHECK = "재고를 자주 다시 읽음";

const baseContent: Dict["content"] = {
  hours: {
    closed: "쉬는 날",
    everyDay: (hours: string) => `날마다 ${hours}`,
    tomorrow: "내일",
    dayAt: (day: string, time: string) => (/^[월화수목금토일]$/.test(day) ? `${day}요일 ${time}` : `${day} ${time}`),
    closedTodayOpens: (next: string) => `오늘은 쉬어요 · 다시 여는 때 ${next}`,
    closedToday: "오늘은 하루 종일 쉬어요",
    opensAt: (time: string) => `${time}에 문 열어요`,
    openNow: (closes: string) => `${closes}까지 열려 있음`,
    closedNowOpens: (next: string) => `지금은 닫혀 있음 · 다시 여는 때 ${next}`,
    closedNow: "지금은 닫혀 있음",
  },

  duration: {
    underAMinute: "1분 이내",
    pair: (a: string, b: string) => `${a} ${b}`,
  },
  listMore: (n: string) => `외 ${n}개`,
  nearLine: (place: string, distance: string) => `${place}, ${distance}`,

  faq: {
    where: (kind: Kind, place: string) => (kind === "model" ? `${place}의` : `${place}에서`),
    nRestocks: f({ other: "확인된 재진열 #건" }),
    restockA: ({ count, where, days, week, peak }: { count: string | null; where: string; days: string; week: string; peak: { hour: string; day: string | null } | null }) =>
      `${count == null ? `${days}일치 장부에 ${where} 기록된 재진열은 없어요` : `${days}일치 장부에 ${where} ${count}이 남아 있고, 이번 주 몫은 ${week}건이에요`}${peak ? `. 현지 시각 ${peak.hour} 근처에 몰리고${peak.day ? `, 요일로는 ${peak.day}이 가장 붐벼요` : ""}` : ""}. Apple은 입고 달력을 따로 내놓지 않아요.`,
    lastsNone: (where: string) => `${where} 재진열부터 진열 끝까지 잰 기록이 아직 모자라서 잴 수 없어요.`,
    lasts: (days: string, duration: string) => `${days}일치 장부 기준, 재진열부터 다음 진열 끝까지의 중앙값: 약 ${duration}.`,
    storeIn: (store: string, line: string) => `${store} · ${line}`,
    nearestA: (stores: string) => `가까운 대안: ${stores}.`,

    modelStockQ: (model: string) => `지금 ${eunNeun(model)} 어디에 진열돼 있나요?`,
    modelStockNone: (model: string) => `최근 관측에서는 어디에도 없어요. 미국 Apple Store 한 곳이라도 ${eulReul(model)} 픽업으로 올리면 이 페이지 목록이 새로 채워져요.`,
    nUsStores: f({ other: "미국 매장 #곳" }),
    modelStockSome: (count: string) => `최근 관측 기준 ${ieyo(count)}. 매장마다 올라온 구성과 함께 아래에 이름을 적어 뒀어요.`,
    priceQ: (model: string) => `${eunNeun(model)} apple.com에서 얼마에 팔리나요?`,
    priceA: (low: string, high: string, storages: string, colors: string) => `자급제 정가는 용량(${storages})에 따라 ${low}에서 ${high} 사이이고, 마감은 ${ieyo(colors)}.`,
    modelRestockQ: (model: string) => `${eunNeun(model)} 얼마나 자주 다시 진열되나요?`,
    modelLastsQ: (model: string) => `다시 진열된 ${eunNeun(model)} 얼마 동안 올라와 있나요?`,
    reserveQ: (model: string) => `주문하기 전에 ${eulReul(model)} 따로 잡아 둘 수 있나요?`,
    reserveA: "주문 전에는 안 돼요. 매장이 그 구성을 올리면 apple.com에서 매장 픽업으로 주문하고, 그때부터 고른 픽업 시간대까지만 따로 보관돼요.",

    storeStockQ: (store: string, model: string) => `${store} 진열대에 ${iGa(model)} 있나요?`,
    nConfigs: f({ other: "구성 #개" }),
    storeStockYes: (count: string) => `있어요. 최근 관측에서 ${count}, 용량과 마감은 이 페이지 표에 적혀 있어요.`,
    storeStockNo: (other: { pro: string; proMax: string } | null) => `최근 관측에서는 없어요${other ? `. 다만 iPhone 18 Pro 구성 ${other.pro}개와 18 Pro Max 구성 ${other.proMax}개는 올라와 있어요` : `. 18 Pro와 18 Pro Max도 진열대에 없어요`}.`,
    hoursQ: (store: string) => `${eunNeun(store)} 언제 문을 여나요?`,
    hoursA: ({ hours, today, address, phone }: { hours: string | null; today: string | null; address: string; phone: string | null }) =>
      `${hours ?? "문 여는 시간은 이 페이지에 있어요"}${today ? ` (오늘 ${today})` : ""}. 위치: ${krAddress(address)}${phone ? ` · 전화 ${phone}` : ""}.`,
    storeRestockQ: (store: string) => `${store}에는 iPhone이 얼마나 자주 다시 진열되나요?`,
    storeLastsQ: (store: string) => `${store}에서 다시 진열된 구성은 얼마 동안 남아 있나요?`,
    storeNearestQ: (store: string) => `${store}에서 가까운 다른 Apple Store는?`,

    placeStockQ: (place: string, model: string) => `${place}에서 지금 ${iGa(model)} 진열된 Apple Store는?`,
    placeStockNone: (place: string, model: string) => `최근 관측에서는 한 곳도 없어요. ${place}의 매장이 ${eulReul(model)} 픽업으로 올리는 순간 이 페이지에 나타나요.`,
    nStores: f({ other: "매장 #곳" }),
    placeStockSome: (count: string, stores: string) => `최근 관측에서 ${count}: ${stores}.`,
    countQ: (place: string) => `${place}에 Apple Store는 모두 몇 곳인가요?`,
    nAppleStores: f({ other: "Apple Store #곳" }),
    countMany: (count: string, stores: string) => `모두 ${ieyo(count)}. 몇 곳만 꼽으면 ${stores}.`,
    countOne: (count: string, store: string) => `${count}, 바로 ${ieyo(store)}.`,
    placeRestockQ: (place: string) => `${place}에서는 iPhone이 얼마나 자주 다시 진열되나요?`,
    placeLastsQ: (place: string) => `${place}에서 다시 진열된 재고는 얼마나 버티나요?`,
    placeNearestQ: (place: string) => `${place} 바깥에서 가장 가까운 Apple Store는?`,
  },

  explainer: (kind: Kind, place: string) => {
    const at = kind === "store" ? place : kind === "model" ? "미국의 Apple Store" : `${place}의 Apple Store`;
    return [
      "픽업 진열은 apple.com 몫이에요. 결제 화면에서 구성과 매장을 고르고 온라인으로 낸 뒤, 대개 당일에 직접 받으러 가요. 매장에 그냥 들러 사는 재고나 통신사 재고와는 따로예요.",
      `ShelfSpring은 동기화된 재고 피드로 ${at}의 추적 구성을 기록하고, 확인 관측이 한 번 더 맞아야 변화를 장부에 올려요.`,
      "확인된 변화 하나하나가 장부 한 줄이 되고, 그 줄들이 여기 보이는 재진열 차트와 이력을 그려요.",
    ];
  },
  alertRule: "알림 하나는 매장 하나와 정확한 구성 하나에 묶여요. 동기화를 거친 뒤 감지된 진열을 따라 나가니, 주문은 Apple에서 확인하세요.",

  titles: {
    state: (name: string, duoNow: string, stores: string) => [
      `${name} Apple Store: ${stores}곳 중 ${duoNow}곳에 iPhone Duo 재고`,
      `${name} Apple Store · iPhone Duo 픽업 재고 실시간`,
      `${name} Apple Store · iPhone Duo 재고`,
      `${name} Apple Store · iPhone 재고`,
    ],
    city: (city: string, code: string, duoNow: string, stores: string) => [
      `${city}, ${code} Apple Store: ${stores}곳 중 ${duoNow}곳에 iPhone Duo`,
      `${city}, ${code} Apple Store · iPhone Duo 픽업 재고`,
      `${city}, ${code} Apple Store · iPhone Duo 재고`,
      `${city} Apple Store · iPhone 재고`,
    ],
    store: (name: string, region: string | null) => {
      const r = region ? ` (${region})` : "";
      return [
        `${name}${r}: 오늘 iPhone 재고·매장 픽업·영업시간`,
        `${name}${r}: iPhone 재고·매장 픽업·영업시간`,
        `${name}${r}: iPhone 재고·영업시간`,
        `${name}: iPhone 재고·매장 픽업·영업시간`,
        `${name}: iPhone 재고·영업시간`,
        `${name}: iPhone 재고`,
        `${name} 재고`,
      ];
    },
    model: (name: string, storesNow: string) => [
      `${name} 픽업 재고: 지금 Apple Store ${storesNow}곳에 있음`,
      `${name} 픽업 재고: Apple Store ${storesNow}곳`,
      `${name} 매장 픽업 재고 실시간`,
    ],
  },

  tokens: {
    tooFewToMeasure: "아직 잴 수 없음",
    noneLoggedYet: "장부에 아직 없음",
    noneYet: "아직 기록 전",
  },

  pattern: {
    none: (days: string) => `${days}일치 장부에 확인된 재진열이 없어요.`,
    nConfirmed: f({ other: "확인된 재진열 #건" }),
    countIn: (count: string, days: string) => `${days}일 동안 ${count}`,
    stay: (minutes: string) => ` · 진열 시간 중앙값 약 ${minutes}분`,
    nDays: f({ other: "#일" }),
    tooFew: (count: string, onDays: string | null, stay: string) => `${count}${onDays ? `, 모두 ${onDays} 안에` : ""}: 흔한 시각을 꼽을 만큼 날짜가 흩어져 있지 않아요${stay}.`,
    usual: (hour: string, weekday: string | null, count: string, stay: string) => `재진열은 ${weekday ? `${weekday}에 가장 잦고, ` : ""}현지 시각 ${hour} 근처에 몰려요. ${count}${stay}.`,
  },

  regionNouns: {
    state: f({ other: "주" }),
    province: f({ other: "시·도" }),
    area: f({ other: "지역" }),
    department: f({ other: "도" }),
    prefecture: f({ other: "도도부현" }),
    emirate: f({ other: "토후국" }),
    canton: f({ other: "칸톤" }),
    region: f({ other: "지역" }),
    county: f({ other: "주" }),
    city: f({ other: "시" }),
  },

  measured: "방법 메모",

  faqTitle: "자주 받는 질문",
  breadcrumb: "페이지 경로",
  keepExploring: "장부에서 더 보기",
  browse: {
    storesByState: "주별로 둘러보기",
    allStatesCities: "모든 주와 도시 →",
    liveByModel: "iPhone별 진열 상태",
    modelStock: (model: string) => `${model} 진열 현황`,
    thisPage: "지금 보는 곳",
    restockLog: (short: string) => `${short} 재진열 장부`,
    liveMap: "지도로 보기",
    mostStores: "매장이 가장 많은 곳",
    allStates: "모든 주",
    bigCities: "큰 도시",
    cities: "매장이 있는 도시",
    storesBy: (region: string) => `${region}별로 둘러보기`,
    allStoresIn: ({ country }: { inName: string; country: string }) => <>{country} 매장 전체 목록 →</>,
    allRegions: (regions: string) => `${regions} 전체 목록`,
  },
  modelCards: "모델별",
  narrative: {
    lastRestock: (config: ReactNode, at: ReactNode, ago: ReactNode) => <>{" "}장부의 최근 재진열: {config}{at}, {ago}.</>,
    at: (store: ReactNode) => <>({store})</>,
  },
  statStrip: {
    inStockNow: "지금 진열 중",
    ofStores: (n: string) => `매장 ${n}곳 기준`,
    stores: "위치",
    nCities: f({ other: "#개 도시" }),
    tracked: "장부에 오름",
    modelNow: (short: string) => `${short} 진열`,
    configsInStock: "진열 중인 구성",
    storesWithStock: f({ other: "올라온 매장" }),
    restocks24h: "재진열 · 24시간",
    restocksHint: (week: string, month: string, days: string) => `${days}일 ${month} · 7일 ${week}`,
    sellOuts: (days: string) => `다시 빠짐 (${days}일)`,
    stays: (duration: string) => (/이내$/.test(duration) ? `진열 중앙값 ${duration}` : `진열 중앙값 ~${duration}`),
    noPairs: "끝난 짝 없음",
    lastRestock: "가장 최근 재진열",
    noneYet: "아직 기록 전",
    inLastDays: (days: string) => `${days}일 안`,
  },
  product: {
    chooseIphone: "모델 고르기",
    storage: "용량",
    color: "마감",
    all: "전부",
    numbersAre: (unit: ReactNode) => <>각 숫자 = 지금 진열 중인 {unit} 수.</>,
    seen: (ago: ReactNode) => <>기록 {ago} · 진열 중</>,
    last: (ago: ReactNode) => <>마지막 진열 {ago} · 지금은 없음</>,
    notSeenYet: "아직 진열 기록 없음",
    firstCheckPending: "첫 관측을 기다리는 중",
    inStock: "진열 중",
    inStockLower: "진열 중",
    none: "진열 없음",
    here: "바로 여기",
    notAvailable: "진열 없음",
    notCheckedYet: "아직 관측 없음",
    availableForPickup: "픽업으로 올라옴",
    since: (ago: ReactNode) => <> · 처음 기록 {ago}</>,
    lastInStock: (ago: ReactNode) => <>마지막 진열 {ago}</>,
    neverSeen: "이 진열대에선 아직 기록 없음",
    firstCheckSoon: "첫 관측이 곧 있어요",
    buy: "apple.com에서 주문",
    checked: (checked: ReactNode, note: ReactNode) => <>관측 {checked} · {note}</>,
    checkNote: CHECK,
  },

  source: (source: ReactNode) => <>자료: {source}</>,
  photoCredit: (link: ReactNode) => <>이미지: {link}</>,
  sources: "참고 자료",
  allUsStores: "미국 Apple Store 269곳 모두",
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>{where}에 대한 ShelfSpring 재고 기록 · 과거 범위 {since}부터 · 수치 갱신 {asOf}. 맞는 진열이 감지되면 그때 알림이 나가며, 원본 확인·동기화·알림 전달 과정에서 시간이 더 걸릴 수 있어요. 기록 범위의 시작일은 자료의 범위일 뿐 ShelfSpring의 나이가 아니에요.</>,
  live: {
    configsCaption: (stores: ReactNode, model: ReactNode) => <>{model}: 이번 관측에서 각 구성을 올린 Apple Store 수 (전체 {stores}곳)</>,
    storage: "용량",
    pricesCaption: (model: ReactNode) => <>apple.com의 {model}: 세전 자급제 정가와 지금 올린 매장 수</>,
    price: "정가",
    bestColor: "가장 많이 올라온 마감 (매장 수)",
    noRestock: (model: string) => `장부에 ${model} 재진열이 아직 없어요.`,
    clockLabel: (model: string) => `미국 전체 매장(${model})`,
    storesWithIt: "올린 매장",
    pairsInStock: "진열 중인 매장–구성 짝",
    restocksLogged: "장부의 재진열",
    medianTime: "진열 시간 중앙값",
    underOneMin: (min: string) => `< ${min}`,
  },

  photos: {
    "apple-store-pickup-counter": { alt: "‘Pickup’ 표지판 아래 나무 카운터가 놓인 Apple Store 내부", caption: "픽업 주문을 건네받는 자리." },
    "phone-map": { alt: "길 위에서 휴대폰 지도 앱을 들여다보는 손", caption: "진열이 몇 분 만에 끝나는 날에는 매장까지 걸리는 시간이 생각보다 크게 작용해요." },
    "phone-card-payment": { alt: "한 손에 iPhone, 다른 손에 신용카드를 든 채 온라인으로 결제하는 사람", caption: "픽업 주문은 온라인 결제부터." },
    "phone-on-box": { alt: "하얀 상자 위에 올려 둔 새 휴대폰", caption: "막 개봉한 휴대폰." },
    "city-map-phone": { alt: "휴대폰 속 도시 지도를 함께 들여다보는 두 사람", caption: "매장까지의 길을 미리 맞춰 보기." },
    "phone-notification": { alt: "잠금 화면에 알림 하나가 뜬 휴대폰을 쥔 손", caption: "잠금 화면에 도착한 알림 한 통." },
    "apple-store-crowd-inside": { alt: "쇼핑몰 안 Apple Store에 줄지어 선 사람들", caption: "출시 주간의 매장 풍경: 올라온 재고가 몇 분 사이에 빠져요." },
    "apple-store-glass-canopy": { alt: "유리벽과 나무 지붕이 보이는 밤의 Apple Store 외관", caption: "해가 진 뒤 불 켜진 유리 매장." },
    "apple-store-night-vancouver": { alt: "밤에 조명을 켠 밴쿠버의 Apple Store", caption: "밤의 매장: 진열은 언제든 돌아올 수 있지만 장부에는 오전 기록이 훨씬 많아요." },
    "phone-hand-camera": { alt: "카메라 세 개가 달린 iPhone을 손에 쥔 사람", caption: "줄이 길게 서는 쪽은 Pro 모델." },
    "place-kr-seoul": { alt: "노을 진 석촌호수 너머로 솟은 롯데월드타워와 서울 스카이라인", caption: "롯데월드타워. 그 아래 롯데월드몰에 Apple 잠실이 있어요." },
    "place-kr-south-korea": { alt: "푸른 하늘 아래 선 경복궁 정문 광화문", caption: "서울, 경복궁의 광화문." },
  },
};

export const content: Dict["content"] = withShelfContent("ko", baseContent);
