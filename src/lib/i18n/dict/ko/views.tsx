import { withShelfViews } from "@/lib/seo/localizedCopy";
/**
 * 한국어 문구: views — 제품 × 장소 페이지, 재진열 일지, 진열 지도, iPhone Duo 재진열 시각 답변 페이지, 매장 목록. 관측 장부 말투.
 * `c: Country`는 영어 데이터라 나라 이름은 places.countryLabel로, 지역 단위는 한국어 단어로 써요.
 * 한국 페이지에서는 나라를 "국내"라고 불러요(다른 나라는 그 나라 이름).
 */
import type { ReactNode } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import type { Point } from "@/components/ui/Viz";
import type { Faq } from "@/lib/content/types";
import { catalogFor, modelByKey, storePath, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type Country, type CountryCode } from "@/lib/apple/countries";
import { faq as placeFaq, fmtDuration, peakOf, type FaqContext, type FaqItem } from "@/lib/seo/enrich";
import type { Place, Product } from "@/lib/seo/products";
import type { StoreLine } from "@/lib/seo/productData";
import type { PlaceStats, RestockStats } from "@/lib/stock/queries";
import { hourShare, type DayRow, type SelloutFacts } from "@/lib/content/restockTimes";
import { PATTERN_MIN, PATTERN_MIN_DAYS, WEEKDAY_MIN_SPAN, hourLabel, localStamp } from "@/lib/content/siteFacts";
import { SPEED } from "@/lib/plans";
import { includedRate, taxName } from "@/content/country-tax";
import { distance, fitTitleW, list, num, price, stamp, weekdays } from "@/lib/i18n/format";
import { appleStoreLabel, cityLabel, colorLabel, countryLabel, regionLabel, storeLabel } from "@/lib/i18n/places";
import type { RestockTimesMeta, RestockTimesView } from "../en/views";
import type { Dict } from "../en";
import { eulReul, eunNeun, iGa, ieyo } from "./common";

const L = "ko" as const;
const n = (x: number) => num(L, x);
const cn = (c: Country | CountryCode) => countryLabel(typeof c === "string" ? c : c.cc, L);
/** "국내"(한국) / 나라 이름(다른 나라). */
const dom = (c: Country) => (c.cc === "kr" ? "국내" : cn(c));
const REGION_WORD: Record<string, string> = { state: "주", province: "시·도", area: "지역", department: "도", prefecture: "도도부현", emirate: "토후국", canton: "칸톤", region: "지역", county: "주", city: "시" };
const rw = (c: Country) => REGION_WORD[c.regionNoun ?? "area"] ?? "지역";
const taxNote = (c: Country) => {
  if (c.cc === "ca") return "세금 전";
  const r = includedRate(c);
  const t = taxName(c);
  return r == null ? "판매세 없음" : `${t === "VAT" ? "부가세" : t === "consumption tax" ? "소비세" : t} ${r}% 들어 있음`;
};
/** 제품 이름 속 영어 색상 이름을 한국어로("iPhone Duo 512GB Night Sky" → "… 나이트 스카이"). */
const COLORS = ["Night Sky", "Star White", "Black", "Burgundy", "Glacier", "Silver"];
const ko = (s: string) => COLORS.reduce((acc, col) => acc.replace(new RegExp(`\\b${col}\\b`), colorLabel(col, L)), s);
/** 장소 이름(한국어). */
const placeKo = (place: Place) => {
  const code = place.country ?? "us";
  if (place.level === "country") return code === "kr" ? "국내" : cn(code);
  if (place.level === "state") return regionLabel(code, place.state!, L);
  if (place.level === "city") return cityLabel(code, place.city!, L);
  return appleStoreLabel(place.store!, L);
};

/* ---------------------------------------------------------------- 재입고 시간 페이지 형식 */

const rtPct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
const dateLabel = (ymd: string, weekday = true) => new Intl.DateTimeFormat("ko-KR", { timeZone: "UTC", month: "short", day: "numeric", ...(weekday ? { weekday: "short" as const } : {}) }).format(new Date(`${ymd}T12:00:00Z`)).replace(" (", "(");
const longDate = (ymd: string) => new Intl.DateTimeFormat("ko-KR", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${ymd}T12:00:00Z`));
const zoneStamp = (iso: string, c: Country) => stamp(L, iso, c.timeZone, c.cc !== "kr");
const hr = (h: number) => hourLabel(h, L);
/** "9–11시". */
const range = (from: number, to: number) => `${from}–${to % 24}시`;
const wd = (d: number) => weekdays(L)[d];
const local = (iso: string, store: Parameters<typeof localStamp>[1]) => localStamp(iso, store, L);
const yet = (x: RestockTimesMeta) => (x.t.n > 0 ? "" : "아직 ");

/* ---------------------------------------------------------------- 제품 × 장소 */

function productName(product: Product, short = false): string {
  const m = modelByKey(product.model)!;
  return `${short ? m.short : m.name}${product.storage ? ` ${product.storage}` : ""}${product.color ? ` ${colorLabel(product.color, L)}` : ""}`;
}

function productTitle(product: Product, place: Place, inStock: number): string {
  const code = place.country ?? "us";
  const name = productName(product);
  const short = productName(product, true);
  const w = placeKo(place);
  const k = place.stores.length;
  if (place.level === "country") {
    const where = code === "us" ? "미국" : w;
    return fitTitleW([
      ...(inStock > 0 ? [`${name} 재고: ${where} Apple Store ${n(inStock)}곳에 있음`] : []),
      `${name} ${where} 픽업 재고 실시간`,
      `${short} ${where} 픽업 재고`,
      `${short} 픽업 재고`,
    ]);
  }
  if (place.level === "store") {
    const s = place.store!;
    return fitTitleW([
      `${w} ${name} ${inStock > 0 ? "재고 있음" : "픽업 재고"}`,
      `${w} ${short} 재고 · ${cityLabel(code, s.city, L)}`,
      `${w} ${short} 재고`,
      `${storeLabel(s, L)} ${short} 재고`,
    ]);
  }
  return fitTitleW([
    `${w} ${name} 재고: ${n(k)}곳 중 ${n(inStock)}곳`,
    `${w} ${name} 픽업 재고`,
    `${w} ${short} 재고`,
    `${short} · ${w}`,
  ]);
}

function productDescription(product: Product, place: Place, inStock: number, stats: PlaceStats): string {
  const code = place.country ?? "us";
  const name = productName(product);
  const week = `이번 주 재입고 ${n(stats.week)}회`;
  if (place.level === "store") {
    const s = place.store!;
    const w = placeKo(place);
    return fitTitleW([
      `${w}${w.includes(cityLabel(code, s.city, L)) ? "" : `(${cityLabel(code, s.city, L)})`} ${name} 픽업 재고: ${inStock > 0 ? "지금 재고 있음" : "지금은 재고 없음"}, ${week}. 실시간 상태, 재입고 시간, 알림.`,
      `${w} ${name}: ${inStock > 0 ? "지금 재고 있음" : "지금 재고 없음"}, ${week}. 실시간 상태와 알림.`,
    ], 155);
  }
  const where = place.level === "country" ? (code === "us" ? "미국 Apple Store" : `${placeKo(place)} Apple Store`) : `${placeKo(place)} Apple Store`;
  return fitTitleW([
    `${name} 픽업 재고: ${where} ${n(place.stores.length)}곳 중 ${n(inStock)}곳에 지금 있음, ${week}. 매장별 실시간 재고, 재입고 시간, 알림.`,
    `${name}: ${where} ${n(place.stores.length)}곳 중 ${n(inStock)}곳에 있음, ${week}. 매장별 실시간 재고와 알림.`,
  ], 155);
}

function productFaq(product: Product, place: Place, lines: StoreLine[], stats: PlaceStats, clock: RestockStats, nearest: { name: string; city: string; distance: number } | null): FaqItem[] {
  const code = place.country ?? "us";
  const name = productName(product);
  const w = placeKo(place);
  const at = `${w}에서`;
  const dist = (miles: number) => distance(L, code, miles);
  const near = nearest ? `Apple ${nearest.name} · ${nearest.city} · ${dist(nearest.distance)}` : "";
  const out: FaqItem[] = [];
  const inStock = lines.filter((l) => l.available.length > 0);
  if (place.level === "store") {
    const l = lines[0];
    out.push({
      q: `${w} 진열대에 지금 ${iGa(name)} 있나요?`,
      a: l && l.available.length > 0
        ? `있어요. 최근 관측 기준${product.parts.length > 1 ? `으로 올라온 구성: ${list(L, l.available.map((i) => `${i.storage} ${colorLabel(i.color, L)}`), 4, (x) => `외 ${n(x)}개`)}` : "이에요"}.`
        : `최근 관측에서는 없어요${nearest ? `. 지금 진열 중인 가장 가까운 매장: ${near}` : ""}.`,
    });
  } else {
    out.push({
      q: `${at} ${iGa(name)} 진열된 Apple Store는?`,
      a: inStock.length === 0
        ? `최근 관측에서는 한 곳도 없어요${nearest ? `. 가장 가까운 진열 매장: ${near}` : ""}.`
        : `${n(inStock.length)}곳이 올려 두고 있어요(최근 관측): ${list(L, inStock.map((x) => appleStoreLabel(x.store, L)), 4, (x) => `외 ${n(x)}곳`)}.`,
    });
  }
  const peak = peakOf(clock, L);
  out.push({
    q: `${at} ${eunNeun(name)} 얼마나 자주 다시 진열되나요?`,
    a: stats.month === 0 ? `지난 ${n(stats.days)}일 장부에 ${at} 기록된 재진열이 없어요.` : `지난 ${n(stats.days)}일 장부에 재진열 ${n(stats.month)}건, 이번 주에만 ${n(stats.week)}건${peak ? `. 현지 시각 ${peak.hour} 근처에 몰려요` : ""}.`,
  });
  if (stats.medianMs != null) out.push({ q: `${at} 다시 진열되면 얼마나 버티나요?`, a: `진열에서 다시 빠질 때까지의 중앙값은 약 ${fmtDuration(stats.medianMs, L)}.` });
  return out;
}

function priceLabel(product: Product): string {
  const code = product.country ?? "us";
  const prices = catalogFor(product.model, code).filter((c) => product.parts.includes(c.partNumber)).map((c) => c.price);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  const f = (v: number) => price(L, COUNTRIES[code], v);
  return lo === hi ? f(lo) : `${f(lo)}–${f(hi)}`;
}

/* ---------------------------------------------------------------- views */

const baseViews: Dict["views"] = {
  common: {
    inCountry: (c: Country) => dom(c),
    liveMap: "진열 지도",
    restockLog: "재진열 일지",
    alertMe: "알림 걸기",
    lastDays: (days: number) => <>지난 {n(days)}일</>,
    since: "2026년 11월 2일",
    sourcesWhere: (k: number, c: Country) => (k === 1 ? `${cn(c)}에 하나뿐인 Apple Store` : `관측 중인 ${dom(c)} Apple Store ${n(k)}곳`),
    checker: (c: Country) => `${cn(c)} 진열 노트`,
    appleStoresIn: (c: Country) => `${cn(c)}의 Apple Store`,
    storesWithIt: "올린 매장",
    more: "이어서 보기",
  },

  product: {
    title: productTitle,
    description: productDescription,
    faq: productFaq,
    priceLabel,
    inPlace: (name: string) => name,
    h1Country: (model: string, c: Country) => `${dom(c)} ${ko(model)} 픽업 진열 현황`,
    h1Place: (model: string, where: string) => `${ko(model)} 진열 현황 · ${where}`,
    inStockNow: "지금 진열",
    yes: "진열 중",
    no: "진열 없음",
    pickup: "매장 픽업",
    configurations: "구성",
    ofStores: (k: number) => `매장 ${n(k)}곳 기준`,
    restocks24h: "재진열 · 24시간",
    restocksHint: (week: number, month: number, days: number) => `${n(days)}일 ${n(month)} · 7일 ${n(week)}`,
    sellOuts: (days: number) => `다시 빠짐 (${n(days)}일)`,
    stays: (ms: number) => `진열 중앙값 ~${fmtDuration(ms, L)}`,
    noPairs: "끝난 짝 없음",
    lastRestock: "가장 최근 재진열",
    noneYet: "아직 기록 전",
    thisConfig: "지금 보는 구성",
    inDays: (days: number) => `${n(days)}일 안`,
    notInStockNow: "지금 진열 없음",
    configsInStock: (k: number, of: number) => <span>진열 중인 구성 <b className="text-ink">{n(k)}</b>/{n(of)}</span>,
    inStockAt: (k: number, of: number) => <span>올린 매장 <b className="text-ink">{n(k)}</b>/{n(of)}</span>,
    checked: (live: ReactNode, p: string, tax: string) => <>관측 {live} · {p}{tax}</>,
    taxNote,
    beforeTax: "세금 전",
    buyOnApple: "apple.com에서 주문",
    allStoresIn: (c: Country) => `${dom(c)} 매장 전체`,
    everyIphoneHere: "여기 있는 모든 iPhone",
    everyIphone: (where: string) => `${where}의 iPhone 전부`,
    panel: (model: string, where: string | null) => `${where ? `${where} · ` : ""}${ko(model)} 관찰 목록: 구성을 고르고 갈 수 있는 매장만 남기세요`,
    unitConfigs: "구성",
    unitStores: "매장",
    otherConfigsHere: "여기 있는 다른 구성",
    byStorageColor: "용량·마감별",
    nearestStores: "가까이 있는 매장",
    closest: (link: ReactNode, dist: string) => <>가장 가까운 진열: {link}, {dist}</>,
    storeCity: (store: string, city: string) => <>{store} · {city}</>,
    mostRecentlyInStock: "최근에 진열됐던 매장",
    storesWithItNow: "지금 진열한 매장",
    storesIn: (where: string) => `${where}의 매장`,
    colStatus: "진열 상태",
    colConfigs: "진열 중인 구성",
    noStoreHasIt: "지금은 어느 매장에도 진열돼 있지 않아요.",
    noStoreHereHasIt: "지금 여기에는 진열한 매장이 없어요.",
    moreStores: (k: number) => <>외 {n(k)}곳 · 지역별로 나눠 보세요.</>,
    byRegion: (c: Country) => `${rw(c)}마다`,
    byCity: "도시마다",
    nearbyStores: "근처 매장",
    latestChanges: "장부의 최근 변화",
    nothingLogged: "아직 기록된 게 없어요.",
    whenRestocks: "재진열 시각",
    howFast: "진열이 버틴 시간",
    restocksByConfig: "구성마다 재진열",
    faqTitleCountry: (model: string, c: Country) => `현장 질문 · ${dom(c)} ${ko(model)}`,
    faqTitle: (model: string, where: string) => `현장 질문 · ${where} ${ko(model)}`,
    buySource: (model: string, c: Country) => `Apple ${cn(c)} · ${ko(model)} 구입 페이지`,
    nearby: "근처",
    otherRegions: (c: Country) => `그 밖의 ${rw(c)}`,
    elsewhereIn: (region: string) => `${region}의 다른 곳`,
    everyAppleStoreIn: (c: Country) => `${dom(c)} Apple Store 전체`,
    across: (model: string, c: Country) => `${ko(model)} · ${c.cc === "us" ? "미국" : dom(c)} 전체`,
    itemList: (model: string, where: string) => `${where}의 ${ko(model)}`,
    nearLead: (c: Country, model: string, inStock: number, k: number, have: { store: string; city: string; configs: number }[]) =>
      inStock === 0
        ? `지금은 ${dom(c)} 어느 Apple Store에서도 ${eulReul(ko(model))} 픽업으로 받을 수 없어요. 그러니 ‘내 근처’는 어디가 먼저 다시 진열하느냐의 문제가 돼요. 갈 수 있는 매장을 관찰 목록에 넣어 두면, 한 곳에 올라오는 순간 푸시가 나가요.`
        : `${ko(model)} 진열 매장 ${n(inStock)}/${n(k)}곳: ${list(L, have.slice(0, 5).map((l) => `${l.store} · ${l.city} · 구성 ${n(l.configs)}개`), 5)}.`,
    nearHead: (c: Country) => [rw(c), "지금 진열한 매장"],
    nearCaption: (c: Country, model: string) => `${ko(model)} 픽업 진열, ${rw(c)}마다 · 최근 관측`,
    nearMe: (c: Country, model: string, alert: string) => `알림 설정을 열고 ‘지금 위치’를 누르면 매장이 내 자리에서부터 줄을 서요. 옆에 붙는 숫자는 도로로 어림잡은 km이고, 경로 링크도 함께 달려요. [${ko(model)} 관찰 목록 열기](${alert}).`,
    modelFaq: (c: Country, model: string, low: number, high: number, inStock: number): { price: FaqItem; reserve: FaqItem } => {
      const money = (v: number) => price(L, c, v);
      const m = ko(model);
      return {
        price: { q: `${eunNeun(m)} ${dom(c)}에서 얼마인가요?`, a: `apple.com 표시가는 용량에 따라 ${money(low)}에서 ${money(high)} 사이예요(${taxNote(c)}).` },
        reserve: { q: `${dom(c)}에서 ${eulReul(m)} 주문 전에 잡아 둘 수 있나요?`, a: `안 돼요. 매장이 구성을 올리면 apple.com에서 매장 픽업으로 주문하고, 그때부터 고른 픽업 시간대까지만 보관돼요.${inStock === 0 ? " 지금은 진열한 매장이 없으니, 먼저 알고 싶다면 관찰 목록이 답이에요." : ""}` },
      };
    },
  },

  restocks: {
    metaTitle: (c: Country, k: number) => `${dom(c)} iPhone 재입고 기록: ${k === 1 ? "Apple Store" : `Apple Store ${n(k)}곳 전체`} 실시간`,
    metaDescription: (c: Country) => `${dom(c)} Apple Store의 iPhone Duo, 18 Pro, Pro Max 매장 픽업 재입고를 모두 기록해요. 정확한 시각, 구성, 지도와 함께.`,
    h1: (c: Country) => `${dom(c)} 재입고 기록`,
    summary: (day: number, week: number, model?: string, region?: string) => <>재진열 · 24시간 {n(day)} · 이번 주 {n(week)}{model ? ` · ${model}` : ""}{region ? ` · ${region}` : ""}. 시각은 보는 사람의 시간대로 적어요.</>,
    allModels: "모든 모델",
    restocks: "재진열만",
    withSoldOut: "재진열 + 진열 끝",
    regionLabel: (c: Country) => rw(c),
    allRegions: (c: Country) => `모든 ${rw(c)}`,
    filter: "거르기",
    page: (k: number) => <>{n(k)}쪽</>,
    newer: "← 더 최근",
    older: "더 이전 →",
    getAlerts: "알림 걸기",
    byPlace: "장소마다 재진열",
    byRegion: (c: Country) => `${rw(c)}마다`,
    datasetName: (c: Country) => `${dom(c)} Apple Store iPhone 픽업 재입고 기록`,
    datasetDescription: (c: Country) => `${c.cc === "us" ? "미국 Apple Store 269곳 전체" : `${dom(c)} Apple Store`}에서 iPhone Duo, iPhone 18 Pro, iPhone 18 Pro Max의 매장 픽업 재입고와 품절을 매장, 정확한 구성, 시각과 함께 모두 기록한 데이터예요. apple.com 응답 두 번이 일치할 때만 재입고로 기록하며, 15초마다(알림 매장은 5초마다) 확인해요.`,
    datasetMeasured: ["Apple Store", "iPhone 모델, 용량, 색상", "재입고 시각", "품절 시각"],
  },

  map: {
    metaTitle: (c: Country, k: number) => `iPhone Duo 픽업 재고 지도: ${dom(c)} ${k === 1 ? "Apple Store" : "Apple Store 전체"} 실시간`,
    metaDescription: (c: Country, k: number) => `${k === 1 ? `${cn(c)}의 Apple Store` : `${dom(c)} Apple Store ${n(k)}곳 전체`}의 지금 iPhone Duo, 18 Pro, Pro Max 매장 픽업 재고를 용량·색상별로 보여 주는 실시간 지도.`,
    country: (c: Country) => ({ name: c.name, inName: c.inName, regionNoun: c.regionNoun, regionNounPlural: c.regionNounPlural }),
    everyStore: "매장 전체",
    storeCity: (store: string, city: string) => `${city} · ${store}`,
  },

  storesIndex: {
    metaDescription: (c: Country, k: number, regions: number, cities: number, duo: number, max: number) => {
      const by = c.regionNoun && regions > 1 ? `${rw(c)}·도시별` : cities > 1 ? "도시별" : "";
      return `${dom(c)} Apple Store ${n(k)}곳 전체${by ? `(${by})` : ""}의 iPhone Duo, 18 Pro, Pro Max 실시간 픽업 재고: 지금 Duo는 ${n(duo)}곳, Pro Max는 ${n(max)}곳에 있어요.`;
    },
    countAnswer: (k: number, spread: string, top: { name: string; count: number }[]) =>
      `모두 ${n(k)}곳 · ${spread}.${top.length && !spread.includes(top[0].name) ? ` 가장 많은 곳은 ${top[0].name}(${n(top[0].count)}곳)${top[1] ? `, 다음은 ${top[1].name}(${n(top[1].count)}곳)` : ""}.` : ""}`,
    howMany: (c: Country) => <>{dom(c)}에 Apple Store는 모두 몇 곳인가요?</>,
    duoNow: (c: Country, k: number, have: Store[]): FaqItem => ({
      q: `${dom(c)}에서 지금 iPhone Duo가 진열된 Apple Store는?`,
      a: have.length === 0
        ? `최근 관측에서는 ${n(k)}곳 모두 없어요. 한 곳에라도 올라오면 이 페이지와 지도가 바로 바뀌고, 관찰 목록에 넣어 둔 사람에게 먼저 알림이 가요.`
        : `${n(have.length)}곳(전체 ${n(k)}곳, 최근 관측): ${have.slice(0, 6).map((x) => appleStoreLabel(x, L)).join(", ")}${have.length > 6 ? " 외" : ""}.`,
    }),
    faq: (ctx: FaqContext) => placeFaq({ ...ctx, place: ctx.place === cn("kr") ? "국내" : ctx.place, omit: [...(ctx.omit ?? []), "count", "stock", "lasts"] }, L),
    duoBlock: (alert: string) => `가장 빨리 구하는 방법은 갈 수 있는 매장에 알림을 거는 거예요: [iPhone Duo 알림 설정](${alert}). 매장 × 정확한 구성 하나가 알림 하나이고, 매장에 뜨면 몇 초 안에 푸시가 와요.`,
    intro: (c: Country, k: number, spread: string, now: { duo: number; max: number; pro: number }, tax: string) =>
      `${dom(c)}에는 **Apple Store ${n(k)}곳**이 있어요(${spread}). 지금 이 중 **${n(now.duo)}곳**에서 iPhone Duo를, **${n(now.max)}곳**에서 iPhone 18 Pro Max를, **${n(now.pro)}곳**에서 18 Pro를 매장 픽업할 수 있어요. ${tax}`,
    crumb: "매장 목록",
    panel: (c: Country) => `${dom(c)} 관찰 목록: iPhone을 고르고 갈 수 있는 매장만 남기세요`,
    matrixLabel: "매장마다 진열대",
    matrixH2: (c: Country) => <>{dom(c)} Apple Store 전체의 진열 현황</>,
    matrixHint: "모델마다 최근 관측에서 올라온 수 / 추적 수.",
    topCaption: (c: Country) => <>매장 수가 많은 {rw(c)} · 출처는 Apple 매장 목록</>,
    regionHead: (c: Country) => rw(c),
    colStores: "매장 수",
    colCities: "도시 수",
    locationsBy: (c: Country) => `${rw(c)}마다 Apple Store 위치`,
    locationsIn: (c: Country) => `${dom(c)}의 Apple Store 위치`,
    storeCount: (k: number) => <>{n(k)}곳</>,
    storeCountAll: (k: number) => <>모두 {n(k)}곳</>,
    whenRestock: (c: Country) => <>{dom(c)} 매장의 재진열 시각</>,
    howFast: (c: Country) => <>{dom(c)}에서 다시 진열된 iPhone은 얼마나 버텼나</>,
    faqTitle: (c: Country) => `현장 질문 · ${dom(c)} Apple Store`,
    getApp: "홈 화면 앱",
    howItWorks: "기록하는 방식",
    pricing: "플랜",
  },

  restockTimes: {
    fmt: {
      n,
      pct: rtPct,
      date: dateLabel,
      longDate,
      zoneStamp,
      local,
      hour: hr,
      range,
      weekday: wd,
      store: (s: Store) => appleStoreLabel(s, L),
      storeWithPlace: (s: Store) => `${appleStoreLabel(s, L)}(${cityLabel(s.country ?? "us", s.city, L)})`,
    },
    title: (c: Country) => `${dom(c)} iPhone Duo(아이폰 듀오)는 언제 재입고될까?`,
    metaDescription: (x: RestockTimesMeta) => {
      const { c, t, w, pattern } = x;
      const region = c.cc === "us" ? "주" : rw(c);
      const since = dateLabel(t.since, false);
      return t.n > 0 && pattern
        ? fitTitleW([
          `${dom(c)} Apple Store iPhone Duo 재입고 ${n(t.n)}회(${since} 이후): ${rtPct(w.share)}가 현지 시간 ${range(w.from, w.to)}에 몰렸고${t.sellout ? `, ${rtPct(t.sellout.within2min)}는 2분 안에 품절` : ""}. 시간·날짜·${region}·매장·구성별 표.`,
          `${dom(c)} Apple Store iPhone Duo 재입고 ${n(t.n)}회(${since} 이후): ${rtPct(w.share)}가 현지 시간 ${range(w.from, w.to)}. 시간·날짜·${region}·구성별 표.`,
          `${dom(c)} iPhone Duo 재입고 시간: ${since} 이후 ${n(t.n)}회, 시간·날짜·${region}·구성별.`,
        ], 158)
        : t.n > 0
          ? fitTitleW([
            `${since} 이후 ${dom(c)} Apple Store에서 확인된 iPhone Duo 재입고 ${n(t.n)}회. ${SPEED.checkSec}초마다 직접 확인한 데이터를 현지 시간·날짜·${region}·매장·구성별로, 얼마나 갔는지까지.`,
            `${dom(c)} iPhone Duo 재입고 시간: ${since} 이후 확인된 재입고 ${n(t.n)}회, 시간·날짜·${region}·구성별.`,
          ], 158)
          : `${dom(c)} Apple Store의 iPhone Duo 재입고 시간. ${longDate(t.since)}부터 ShelfSpring가 ${SPEED.checkSec}초마다 직접 확인한 데이터를 시간·날짜·매장·구성별로.`;
    },
    h1: (x: RestockTimesView) => x.t.unknown
      ? `${dom(x.c)}에서 iPhone Duo는 언제 재입고되나요?`
      : x.t.n > 0
        ? `${dom(x.c)} iPhone Duo 재입고, 아직 계속될까요? 네, 시간대별로 보여 드려요`
        : `${dom(x.c)} iPhone Duo, 재입고되고 있을까요? 저희 확인으로는 아직이에요`,
    intro: (x: RestockTimesView) => {
      const { t, one, tracked, pattern, w } = x;
      const where = one ? `${cn(x.c)}의 Apple Store` : `${dom(x.c)} Apple Store`;
      return t.unknown ? (
        <>재입고 기록을 지금은 읽지 못했어요. {dom(x.c)} 매장은 계속 {SPEED.checkSec}초마다 확인 중이고, 다음에 불러오면 수치가 다시 나와요.</>
      ) : t.n > 0 ? (
        <>
          <b className="text-ink">네.</b> {where}에서 iPhone Duo는 <b className="text-ink">{longDate(t.since)} 이후 {n(t.n)}회</b> 재입고됐어요{tracked > 1 ? <>(추적한 {n(tracked)}일 중 {n(t.days)}일)</> : <>(아직 추적 1일째)</>}
          {pattern && <>. 그중 <b className="text-ink">{rtPct(w.share)}가 매장 현지 시간 {range(w.from, w.to)}</b>에 들어왔어요</>}.
        </>
      ) : (
        <>
          <b className="text-ink">저희 확인으로는 아직이에요.</b> ShelfSpring는 {longDate(t.since)}부터 {one ? `${cn(x.c)}의 Apple Store` : `${dom(x.c)} Apple Store ${n(x.stores)}곳 전체`}를 {SPEED.checkSec}초마다 확인했지만, 확인된 iPhone Duo 매장 픽업 재입고는 아직 없어요.
        </>
      );
    },
    hero: {
      restocks: (x: RestockTimesView) => `${dateLabel(x.t.since, false)}부터 기록된 재진열`,
      window: (x: RestockTimesView) => `${range(x.w.from, x.w.to)} · 매장 현지 시각`,
      days: "재진열이 있었던 날",
      // 영어 원문이 문자열 리터럴 타입이라 한국어 문장으로 단언해요.
      now: ((one: boolean): string => (one ? "지금 픽업으로 올라와 있음" : "지금 픽업으로 올린 매장")) as Dict["views"]["restockTimes"]["hero"]["now"],
      today: (x: RestockTimesView, today: DayRow) => `${x.one ? "" : `매장 ${n(today.stores)}곳 · `}${dateLabel(today.date)} 하루, 아직 진행 중`,
      weekday: "지금까지 요일 1위",
    },
    heroPoints: (x: RestockTimesView, latest: { config: string; store: Store; at: string } | null): Point[] => [
      ...(latest ? [{ text: <>가장 최근: <b className="text-ink">{latest.config}</b>{x.one ? null : <> · <Link href={storePath(latest.store)} className="underline underline-offset-2">{appleStoreLabel(latest.store, L)}</Link></>} · 현지 시각 {local(latest.at, latest.store)}</> }] : []),
      ...(x.t.peakWeekday != null ? [{ text: <>요일로는 <b className="text-ink">{wd(x.t.peakWeekday)}</b>에 가장 잦아요</> }] : []),
      { text: <>Apple은 <b className="text-ink">재진열 일정을 내놓지 않아요</b>. 여기 숫자는 저희가 직접 확인한 기록이고, 5분쯤마다 새로 고쳐져요</>, no: true },
    ],
    emptyPoints: (x: RestockTimesView): Point[] => [
      { text: <>지금 <b className="text-ink">{n(x.stores)}곳 중 {n(x.duoNow)}곳</b>이 픽업으로 올려 둠</> },
      { text: <>첫 재진열이 확인되면 아래 표가 채워지기 시작해요</>, step: true },
      { text: <>데이터가 가장 많이 쌓인 시각·요일 패턴은 <Link href="/iphone-duo-restock-times" className="underline underline-offset-2">미국 페이지(영문)</Link>에 있어요</>, step: true },
    ],
    setUpAlert: "iPhone Duo 관찰 목록 시작하기",
    logLive: "실시간 재진열 일지 열기",
    onThisPage: "구역",
    nav: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": "시각",
      "day-by-day": "달력",
      where: `장소(${x.us ? "주" : rw(x.c)})`,
      configuration: "구성",
      "how-long": "진열 길이",
      unavailable: "‘픽업 불가’?",
      reddit: "포럼 속설",
      method: "세는 규칙",
    }),
    h2: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": `${dom(x.c)}의 iPhone Duo 재진열은 몇 시에 몰리나요?`,
      "day-by-day": `${dom(x.c)}에서 Apple은 어느 날 iPhone Duo를 다시 풀었나요?`,
      where: `iPhone Duo가 가장 자주 돌아오는 ${dom(x.c)} Apple Store는 어디인가요?`,
      configuration: `${dom(x.c)}에서 가장 자주 돌아오는 iPhone Duo 구성은 무엇인가요?`,
      "how-long": `${dom(x.c)}에서 다시 진열된 iPhone Duo는 몇 초나 버티나요?`,
      unavailable: "왜 Apple Store마다 ‘픽업 불가’만 보이나요?",
      reddit: "Reddit의 iPhone Duo 재입고 속설, 장부와 맞춰 보면",
      method: "ShelfSpring은 재진열 한 건을 어떻게 세나요?",
    }),
    faq: (x: RestockTimesView): Faq[] => {
      const { t, w, pattern, sell, us, weekend, tracked } = x;
      const where = dom(x.c);
      const win = range(w.from, w.to);
      return [
        { q: `${where}에서 iPhone Duo는 언제 재입고되나요?`, a: t.n > 0 && pattern
          ? `주로 오전이에요. ${longDate(t.since)} 이후 확인된 재입고 ${n(t.n)}회 중 ${rtPct(w.share)}가 매장 현지 시간 ${win}에, ${rtPct(hourShare(t.byHour, 8, 12))}가 오전 8시~정오에 들어왔어요. Apple은 일정을 공개하지 않아요. 이건 ShelfSpring가 관찰한 패턴이고, 약 5분마다 업데이트돼요.`
          : `Apple은 일정을 공개하지 않아요. ShelfSpring는 ${longDate(t.since)} 이후 ${where}에서 확인된 재입고 ${n(t.n)}회${t.days ? `(${n(t.days)}일)` : ""}를 기록했어요. 서로 다른 ${PATTERN_MIN_DAYS}일에 걸쳐 재입고가 ${PATTERN_MIN}회 쌓이면 보통 시간대를 알려 드리고, 이 페이지는 자동으로 채워져요.` },
        { q: `${us ? "" : `${where}에서 `}주말에도 iPhone Duo가 재입고되나요?`, a: t.n > 0
          ? `${weekend > 0 ? "지금까지는 네" : "아직 데이터에는 없어요"}: ${n(t.n)}회 중 ${n(weekend)}회(${rtPct(weekend / t.n)})가 토요일이나 일요일이었어요. ${t.peakWeekday != null ? `가장 많은 요일은 ${ieyo(wd(t.peakWeekday))}.` : `가장 많은 요일은 데이터가 ${WEEKDAY_MIN_SPAN}일 이상 쌓여야 알려 드려요. 지금은 ${n(tracked)}일치예요.`}`
          : `${where}의 주말 데이터는 아직 없어요. 재입고가 확인되는 대로 이 페이지의 날짜별 표가 채워져요.` },
        { q: "언제부터 확인하면 되나요?", a: t.n > 0 && pattern
          ? `직접 확인한다면 현지 시간 ${hr(w.from)}부터 매장 픽업을 고른 apple.com 화면을 열어 두세요. 이 2시간에 재입고의 ${rtPct(w.share)}가 몰렸어요. 재입고는 보통 ${sell ? `중앙값 ${n(sell.medianSec)}초 만에 사라지니` : "1분 안팎이면 끝나니"}, ${SPEED.fastSec}초마다 확인하는 알림([알림 작동 방식(영문)](/iphone-duo-stock-alerts))이 새로고침으로는 못 하는 일을 해요.`
          : `${where}의 패턴이 뚜렷해지기 전까지는 알림에 맡기세요. 고른 매장을 24시간 내내 ${SPEED.fastSec}초마다 확인해요([알림 작동 방식(영문)](/iphone-duo-stock-alerts)).` },
        { q: "왜 모든 Apple Store에서 iPhone Duo가 ‘픽업 불가’로 나오나요?", a: sell
          ? `재입고가 짧기 때문이에요. ${where}에서 품절까지 측정한 재입고 ${n(sell.n)}회 중 ${rtPct(sell.within2min)}가 2분 안에, ${rtPct(sell.within20min)}가 20분 안에 사라졌어요. 지금은 ${n(x.stores)}곳 중 ${n(x.duoNow)}곳에 있어요. 재입고가 수십 번 있는 날에도 거의 모든 순간 apple.com의 정직한 답은 ‘픽업 불가’예요([‘픽업 불가’의 뜻(영문)](/apple-store-pickup-availability-explained)).`
          : `픽업 재고는 몇 분씩만 뜨기 때문이에요. 지금 ${where} 매장 ${n(x.stores)}곳 중 ${n(x.duoNow)}곳에 있어요([‘픽업 불가’의 뜻(영문)](/apple-store-pickup-availability-explained)).` },
        { q: "내 Apple Store에 iPhone Duo가 재입고되면 어떻게 알림을 받나요?", a: `매장과 정확한 용량·색상으로 알림을 설정하세요. 그때부터 그 매장은 ${SPEED.fastSec}초마다 확인되고, 재입고가 확인되면 약 ${SPEED.alertSec}초 뒤 휴대폰으로 알려 드려요([알림 설정](${x.alert}); [작동 방식(영문)](/how-it-works)).` },
      ];
    },
    sources: {
      applePickup: "Apple 도움말 · 매장 픽업 재고는 어떻게 표시되나",
      newsroom: "Apple Newsroom: iPhone Duo, 전 세계 Apple Store 출시(2026년 10월 23일)",
      macRumors: "MacRumors: 미국·캐나다에서 iPhone Duo Apple Store 픽업 재개(2026년 10월 24일)",
      reports: (tracker: string) => `${tracker} · 출시 주간 iPhone Duo 재진열 제보 (그쪽 관측이라 따로 표시하고 합계에서 뺌)`,
    },
    ld: (x: RestockTimesView) => ({
      datasetName: `${dom(x.c)} Apple Store iPhone Duo 재입고 시간`,
      description: `${dom(x.c)} Apple Store의 iPhone Duo 매장 픽업 재입고를 ${x.t.since}부터 매장, 구성, 시각과 함께 모두 기록한 데이터. ShelfSpring가 ${SPEED.checkSec}초마다 확인했고, 현지 시간, 날짜, ${x.us ? "주" : rw(x.c)}, 매장, 구성별로 요약했어요.`,
      spatial: `${cn(x.c)} Apple Store`,
      measured: ["재입고 시각(매장 현지)", "Apple Store", "iPhone Duo 용량·색상", "품절까지 걸린 초"],
      size: `매장 ${n(x.t.stores)}곳, 재입고 ${n(x.t.n)}회`,
    }),
    crumb: "iPhone Duo 재진열 기록",

    timeLead: (x: RestockTimesView) => <b>매장 현지 시각 {range(x.w.from, x.w.to)}: 재진열 {n(x.t.n)}건 중 {rtPct(x.w.share)}. 오전 8시~정오로 넓히면 {rtPct(hourShare(x.t.byHour, 8, 12))}.</b>,
    busiestHour: (count: number) => `가장 붐빈 한 시간: 재진열 ${n(count)}건`,
    morning: "오전 8시~정오 사이",
    evening: "오후 5시 이후: 저녁에도 돌아와요",
    night: "자정~오전 6시 사이",
    tooFew: (x: RestockTimesView) => <b>시각을 꼽기엔 {yet(x)}날짜가 모자라요: {longDate(x.t.since)} 이후 {n(x.t.days)}일에 걸쳐 확인된 재진열 {n(x.t.n)}건.</b>,
    tooFewKeys: (): Point[] => [
      { text: <>흔한 시각은 <b className="text-ink">서로 다른 {PATTERN_MIN_DAYS}일에 걸친 재진열 {PATTERN_MIN}건</b>이 쌓여야 적어요</> },
      { text: <>한꺼번에 몰린 10건은 사건 하나일 뿐, 버릇이 아니에요</>, no: true },
      { text: <>날짜가 쌓이면 이 페이지가 스스로 고쳐 써요</>, step: true },
    ],
    hourCaption: (x: RestockTimesView) => `${dom(x.c)} iPhone Duo 재진열을 매장 현지 시각마다 센 표 · ${dateLabel(x.t.since, false)}부터 오늘까지 모두 ${n(x.t.n)}건`,
    hourHead: ["매장 현지 시각(24시간)", "재진열", "장부 비중"],
    morningKeys: (x: RestockTimesView): Point[] => [
      { text: <>아침에 몰리는 건 <b className="text-ink">매장 문이 열려서가 아니에요</b>{x.us ? ": 미국 Apple Store는 대개 오전 10시에야 열어요" : ""}</> },
      { text: <>픽업 재고는 셔터가 오르기 전에 <b className="text-ink">온라인</b>에서 먼저 풀려요</> },
      { text: <>손으로 볼 거라면: 평일 <b className="text-ink">{range(x.w.from, x.w.to)}</b></>, step: true },
      { text: <>아무도 새로고침하지 않는 <b className="text-ink">나머지 22시간</b>은 <Link href={x.alert}>관찰 목록</Link>에 맡기세요</>, step: true },
    ],
    storeChartKeys: (x: RestockTimesView): Point[] => [{ text: <>한 지역이 9시에 몰려도, 8시에 먼저 돌아오는 매장이 섞여 있을 수 있어요. 그런 곳은 매장 기록마다 붙은 자체 시간대 차트에서 드러나요(<Link href={x.storesHref}>{x.us ? "주별 Apple Store" : `${dom(x.c)} 매장 목록`}</Link>)</>, step: true }],

    dayLead: (x: RestockTimesView) => {
      const { t, tracked, one } = x;
      return t.n > 0 && tracked === 1 ? (
        <b>추적 첫날인 {dateLabel(t.daily[t.daily.length - 1]?.date ?? t.since)}, {one ? "" : `매장 ${n(t.stores)}곳에서 `}확인된 재진열 {n(t.n)}건.</b>
      ) : t.n > 0 ? (
        <b>{t.days === tracked ? `추적한 ${n(t.days)}일 하루도 빠짐없이` : `${longDate(t.since)} 이후 ${n(tracked)}일 중 ${n(t.days)}일에`} 재진열이 확인됐어요.{t.peakWeekday != null ? ` 요일 1위는 ${wd(t.peakWeekday)}.` : ""}</b>
      ) : (
        <b>{longDate(t.since)} 이후 {dom(x.c)}에서 확인된 재진열이 없어요.</b>
      );
    },
    daysTracked: "재진열이 있었던 추적일",
    busiestDay: (x: RestockTimesView, day: DayRow) => `가장 붐빈 날 · ${dateLabel(day.date)}${x.one ? "" : ` · 매장 ${n(day.stores)}곳`}`,
    busiestDayNone: "가장 붐빈 날",
    drop: (x: RestockTimesView, drop: { at: string; restocks: number }) => `${zoneStamp(drop.at, x.c)}, 30분 사이에 다시 진열한 매장 수(구성 ${n(drop.restocks)}개): 바깥에서 보면 전국 단위 한 번의 풀림`,
    weekend: (x: RestockTimesView) => `토·일(재진열 ${n(x.weekend)}건)`,
    dayCaption: (x: RestockTimesView) => `${dom(x.c)} iPhone Duo 재진열, 날짜마다${x.t.reports.length ? "; ‘제보’ 줄은 추적을 시작하기 전 날짜에 외부 트래커가 올린 관측이라 흐름 참고용이에요" : ""}`,
    dayHead: { date: "날짜", restocks: "재진열", stores: "매장", busiest: "가장 붐빈 시각", source: "출처" },
    soFar: " · 진행 중",
    reportedBy: (names: string[]) => <>제보: {names.join(" / ")}</>,
    dayKeys: (x: RestockTimesView, launch: string, resumed: string): Point[] => [
      { text: <><b className="text-ink">{dateLabel(launch)}</b> · 출시일, 첫 물량은 온라인 주문용</> },
      { text: <><b className="text-ink">{dateLabel(resumed)}</b> · 픽업 주문 다시 열림{x.us ? " (MacRumors)" : ""}</> },
      x.t.reports.length
        ? { text: <>‘제보’ 줄: {x.reportNames.join(", ")}의 출시 주간 관측 · 합계에는 넣지 않음</> }
        : { text: <>{dom(x.c)} 매장 전체 기록은 <b className="text-ink">{longDate(x.t.since)}</b>에 열렸어요</> },
      ...(x.t.n > 0 && x.t.peakWeekday == null ? [{ text: <>요일 1위는 데이터가 <b className="text-ink">{WEEKDAY_MIN_SPAN}일</b> 넘게 쌓이면 적어요(지금 {n(x.tracked)}일)</>, no: true }] : []),
      { text: <><b className="text-ink">매장</b> 열을 보세요: 재진열 수가 같아도 매장이 많이 걸린 날이 나에게 좋은 날이에요</>, step: true },
    ],

    whereLead: (x: RestockTimesView, hit: { name: string; restocks: number; stores: number; storesTotal: number }[], total: number) => (
      <b>1위 {hit[0].name}: 재진열 {n(hit[0].restocks)}건, 매장 {n(hit[0].stores)}/{n(hit[0].storesTotal)}곳({dateLabel(x.t.since, false)} 이후){hit[1] ? <> · 2위 {hit[1].name} {n(hit[1].restocks)}건</> : null}{hit[2] ? <> · 3위 {hit[2].name} {n(hit[2].restocks)}건</> : null}. {x.us ? "주" : rw(x.c)} {n(total)}곳 가운데 재진열이 한 번이라도 찍힌 곳은 {n(hit.length)}곳{total - hit.length > 0 ? `, ${n(total - hit.length)}곳은 아직 빈칸` : ""}.</b>
    ),
    whereNone: (x: RestockTimesView) => <b>{dom(x.c)}의 어느 {x.us ? "주" : rw(x.c)}에도 확인된 재진열이 아직 없어요. 첫 건이 생기면 표가 채워져요.</b>,
    regionCaption: (x: RestockTimesView) => `${dom(x.c)} iPhone Duo 재진열, ${x.us ? "주" : rw(x.c)}마다 · ${dateLabel(x.t.since, false)}부터 오늘까지`,
    regionHead: (x: RestockTimesView) => [x.us ? "주" : rw(x.c), "재진열", "재진열이 있던 매장", "가장 최근(현지 시각)"],
    ofN: (a: number, b: number) => <>{n(a)}/{n(b)}곳</>,
    storesCaption: (x: RestockTimesView) => `${dom(x.c)}에서 iPhone Duo가 가장 자주 돌아온 매장 · ${dateLabel(x.t.since, false)}부터 오늘까지`,
    storesHead: ["매장", "재진열", "날 수", "흔한 시각", "가장 최근(현지 시각)"],
    swaps: (x: RestockTimesView) => [
      { no: "어디에 있든 재입고가 가장 많은 매장", yes: `${x.pattern ? hr(x.w.from) : "오전"}에 1시간 안에 갈 수 있는 매장 2~3곳`, why: "갈 수 없는 매장의 재입고는 재입고가 아니에요. 가장 바쁜 매장도 하루 중 몇 분을 빼면 ‘픽업 불가’예요." },
      { no: "매장 한 곳에 운 맡기기", yes: "매장마다 알림을 걸고, 울린 곳으로 가기", why: "횟수 표는 내 매장 중 어디로 먼저 갈지만 알려 줘요." },
    ],
    nearMe: "지금 내 근처에서 Duo를 올린 매장",

    configLead: (x: RestockTimesView, top: { label: string; restocks: number }, rarest: { label: string; restocks: number } | null) => (
      <b>{top.label}: 재진열 {n(x.t.n)}건 중 {n(top.restocks)}건({rtPct(top.restocks / x.t.n)}){rarest ? `. 가장 드물게 돌아온 건 ${rarest.label}, ${n(rarest.restocks)}건` : ""}.</b>
    ),
    mostRestocked: (config: string) => `${config} · 가장 자주 돌아온 구성`,
    versus: (a: string, bCount: number, b: string) => `${a} 재진열 · ${eunNeun(b)} ${n(bCount)}건`,
    restocksOf: (a: string) => `${a} 재진열`,
    byStorage: "용량마다",
    byColour: "마감마다",
    configNone: (x: RestockTimesView) => <b>{dom(x.c)}에서 확인된 재진열이 있는 구성은 {yet(x)}없어요. 첫 건이 들어갈 자리로 8개 구성을 모두 적어 뒀어요.</b>,
    configCaption: (x: RestockTimesView) => `${dom(x.c)} iPhone Duo 재진열, 구성마다 · ${dateLabel(x.t.since, false)}부터 오늘까지`,
    configHead: ["구성", "재진열", "비중", "가장 최근(현지 시각)"],
    configKeys: (x: RestockTimesView): Point[] => [
      { text: <>구성 선택이 <b className="text-ink">매장 선택보다 더 중요해요</b></> },
      x.storageRatio != null
        ? { text: <>가장 많이 재입고된 용량으로 타협하면 다음 용량보다 확률이 약 <b className="text-ink">{x.storageRatio}배</b></> }
        : { text: <>가장 많이 재입고된 용량으로 타협하면 확률이 <b className="text-ink">크게</b> 올라가요</> },
      { text: <><b className="text-ink">2TB</b>는 배송으로 주문하고 기다리는 폰이에요</>, no: true },
      { text: <>가격과 지금 재고: <Link href="/which-iphone-duo-restocks-most">어떤 iPhone Duo가 가장 많이 재입고될까?(영문)</Link></>, step: true },
    ],

    howLongLead: (x: RestockTimesView, sell: SelloutFacts) => <b>{dom(x.c)}에서 진열이 끝난 재진열 {n(sell.n)}건 중 절반은 {n(sell.medianSec)}초 안에 빠졌어요. 2분 안에 {rtPct(sell.within2min)}, 20분 안에 {rtPct(sell.within20min)}.</b>,
    secUnit: "초",
    medianListing: "진열 시간 중앙값, 올라온 순간부터 빠질 때까지",
    within2: "2분 안에 빠짐",
    within20: "20분 안에 빠짐",
    fastest: "잰 것 중 가장 빨리 빠진 진열",
    howLongNone: (x: RestockTimesView) => <b>{dom(x.c)}에서 진열이 끝난 재진열이 {yet(x)}잴 만큼 쌓이지 않았어요. 10건부터 이 숫자를 적고, 전체 그림은 미국 페이지에 있어요.</b>,
    howLongKeys: (x: RestockTimesView): Point[] => [
      { text: <>2분짜리 창은 apple.com 새로고침이 아니라 <b className="text-ink">알림</b>으로 잡아요</> },
      { text: <>이 페이지의 다른 모든 수치를 설명하는 숫자예요</> },
      { text: <>구성·{x.us ? "주" : rw(x.c)}별로 재입고마다 몇 초 갔는지: <Link href="/iphone-duo-sell-out-times">iPhone Duo 재입고는 얼마나 빨리 품절될까?(영문)</Link></>, step: true },
    ],
    measured: "숫자마다 구성이 처음 보인 확인부터 사라진 걸 본 확인까지 잰 값이라 위쪽 한계예요. 실제 진열 시간은 이보다 짧아요.",

    unavailableLead: (x: RestockTimesView) => <b>재진열은 머무는 상태가 아니라 깜빡 켜졌다 꺼지는 신호라서요. {dom(x.c)}에서 진열될 수 있는 조합은 {x.one ? "매장 1곳" : `매장 ${n(x.stores)}곳`} × 구성 {n(x.configs)}개 = {n(x.pairs)}가지인데, 지금 iPhone Duo를 올린 매장은 {n(x.duoNow)}곳뿐이에요.</b>,
    pairs: "진열될 수 있는 매장 × 구성",
    listingNow: "지금 이 순간 iPhone Duo를 올린 곳",
    goneIn2: "2분 안에 빠진 재진열",
    last24: "지난 24시간 확인된 재진열",
    unavailableKeys: (x: RestockTimesView, today: number): Point[] => [
      x.recent.restocks > 0
        ? { text: <>최근 24시간: {dom(x.c)} 매장 {n(x.recent.stores)}곳에서 <b className="text-ink">확인된 재입고 {n(x.recent.restocks)}회</b></> }
        : today > 0
          ? { text: <>오늘: {dom(x.c)}에서 <b className="text-ink">확인된 재입고 {n(today)}회</b></> }
          : { text: <>실제로 있었던 재입고는 위 날짜별 표에 있어요</> },
      { text: <>각각 apple.com에 <b className="text-ink">1~2분</b> 떠 있었어요</> },
      { text: <>4일째든 14일째든 ‘어디서나 픽업 불가’는 Apple이 판매를 멈췄다는 뜻이 <b className="text-ink">아니에요</b></>, no: true },
    ],
    unavailableLinks: { explained: "‘픽업 불가’가 뜻하는 것(영문)", howToGet: "iPhone Duo를 실제로 손에 넣는 법(영문)" },

    redditLead: (x: RestockTimesView) => <b><a href="https://www.reddit.com/r/applestore/" target="_blank" rel="noopener nofollow">r/applestore</a>·<a href="https://www.reddit.com/r/iphone/" target="_blank" rel="noopener nofollow">r/iphone</a>의 이야기는 성실하지만 대개 매장 한 곳, 하루치 경험이에요. 그중 자주 되풀이되는 네 가지를 골라 {dom(x.c)} 장부의 확인된 재진열 {n(x.t.n)}건 옆에 나란히 놓았어요.</b>,
    redditCaption: "iPhone Duo 재입고에 관한 흔한 Reddit 주장 vs ShelfSpring 장부의 확인된 재진열",
    redditHead: ["속설", "장부의 답"],
    claims: (x: RestockTimesView): { claim: string; answer: ReactNode }[] => {
      const { t, w, tracked, recent } = x;
      const none = "맞춰 볼 재진열 기록이 아직 없어요.";
      return [
        { claim: "“밤사이에 풀려요. 새벽 3시에 들어가 보세요.”", answer: t.n > 0 ? <>몰린 곳은 현지 시각 {range(w.from, w.to)}({rtPct(w.share)})이고, 자정~오전 6시 몫은 {rtPct(hourShare(t.byHour, 0, 6))}에 그쳤어요.</> : none },
        { claim: "“Apple은 정해진 요일에만 풀어요.”", answer: t.n > 0 ? (t.peakWeekday != null ? <>{n(tracked)}일 가운데 {n(t.days)}일에 재진열이 찍혔으니 요일을 가리지 않는 편이에요. 굳이 꼽으면 {wd(t.peakWeekday)}가 {n(t.n)}건 중 {n(t.byWeekday[t.peakWeekday])}건으로 많았어요.</> : <>요일을 가리지 않았어요: 추적한 {n(tracked)}일 가운데 {n(t.days)}일에 재진열{t.days === tracked ? "(하루도 빠짐없이)" : ""}. 요일 1위는 {WEEKDAY_MIN_SPAN}일치가 쌓이면 적어요.</>) : none },
        { claim: "“매장에 전화해서 입고 시간을 물어보면 돼요.”", answer: "Apple은 재진열 일정을 내놓지 않아요. apple.com에 보이는 건 온라인에서 풀린 픽업 재고이고, 매장 직원도 다른 사람과 같은 순간에 그걸 봐요." },
        { claim: "“픽업 불가라고 뜨면 완전히 끝난 거예요.”", answer: recent.restocks > 0 ? <>반대예요. 지난 24시간에만 매장 {n(recent.stores)}곳에서 재진열 {n(recent.restocks)}건이 확인됐고, 저마다 몇 분 만에 ‘픽업 불가’로 돌아갔어요.</> : t.n > 0 ? <>반대예요. {dateLabel(t.since, false)} 이후 재진열 {n(t.n)}건이 확인됐고, 저마다 몇 분 만에 ‘픽업 불가’로 돌아갔어요.</> : "맞춰 볼 기록이 아직 없어요." },
      ];
    },
    redditKeys: (): Point[] => [
      { text: <>소문은 <b className="text-ink">데이터가 없을 때</b> 기대는 거예요. 이 페이지가 그 데이터이고, 무료로 볼 수 있어요</> },
      { text: <>Reddit이 맞는 부분: <b className="text-ink">결제 팁</b>. 로그인해 두고 Apple Pay 준비(<Link href="/how-to-grab-an-iphone-duo-restock">저희의 20초 버전(영문)</Link>)</> },
    ],

    methodLead: <b>그 매장에 없던 구성이 apple.com 매장 픽업에 올라오고, 연달아 두 번의 확인이 같은 답을 낼 때 재진열 한 건으로 세요.</b>,
    methodKeys: (x: RestockTimesView): Point[] => [
      { text: <>{x.one ? `${cn(x.c)}의 Apple Store` : `${dom(x.c)} 모든 Apple Store`}는 <b className="text-ink">{SPEED.checkSec}초</b>마다, 알림이 걸린 매장은 <b className="text-ink">{SPEED.fastSec}초</b>마다</> },
      { text: <>다른 트래커가 공개한 주기는 <b className="text-ink">8초~15분</b>이에요. 저희는 공개된 수치끼리만 비교해요</> },
      { text: <>처음 보인 ‘재고 있음’은 <b className="text-ink">약 1초 뒤</b> 한 번 더 확인한 다음에야 인정해요</> },
      { text: <>사라진 재고는 <b className="text-ink">다음 확인</b>에서 확정해요</> },
      { text: <>매장을 처음 본 순간, 실패하거나 시간 초과된 요청: <b className="text-ink">절대</b> 재입고도 품절도 아니에요</>, no: true },
      { text: <>시간과 날짜는 각 매장의 <b className="text-ink">현지 시간</b>. ‘물량 풀림’ = 시간대가 달라도 같은 30분</> },
      { text: <>다른 트래커의 제보{x.t.reports.length ? `(${x.reportNames.join(", ")})` : ""}: 별도 표시 행, <b className="text-ink">합계에는 절대 넣지 않아요</b></> },
      { text: <>약 5분마다 업데이트, <Link href={x.logHref}>재입고 기록</Link> 자체는 실시간</>, step: true },
    ],
    quote: "링크를 달아 주시면 이 수치를 얼마든지 인용하셔도 좋아요. ShelfSpring는 Apple과 무관한 독립 서비스이고, 누구나 apple.com에서 볼 수 있는 픽업 재고를 훨씬 자주 읽을 뿐이에요.",
    alertIn: (x: RestockTimesView) => <>{x.one ? "" : `${dom(x.c)} `}iPhone Duo 관찰 목록 만들기</>,

    related: "iPhone Duo에 관한 다른 질문",
    sameData: "같은 장부로 답했어요",
    questions: {
      sellOut: "다시 진열되면 얼마나 버티나요?",
      alerts: "가장 빨리 알림 받는 법",
      howToGet: "실제로 손에 넣는 법",
      whichConfig: "가장 자주 돌아오는 구성",
      nearMe: "지금 내 근처의 진열 매장",
      unavailable: "‘픽업 불가’가 뜻하는 것",
    },
    otherCountries: ((us: boolean): string => (us ? "다른 나라의 같은 기록" : "다른 나라")) as Dict["views"]["restockTimes"]["otherCountries"],
    faqTitle: "현장 질문",
  },
};


export const views: Dict["views"] = withShelfViews("ko", baseViews);
