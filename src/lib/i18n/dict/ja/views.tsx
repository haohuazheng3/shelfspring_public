import { withShelfViews } from "@/lib/seo/localizedCopy";
/**
 * 日本語: views — 製品×場所ページ、再入荷ログ、棚マップ、iPhone Duo の再入荷時刻ページ、店舗目録（/ja-jp/…）。
 * 語彙（観測台帳の口調）：再入荷・棚にあり／棚になし・棚から消えた・見守り（リスト）・注文・店舗時刻・確認。
 * `c: Country` は英語データ：国名は countryLabel、地域の呼び方は日本語の対応表で書く。
 * `name` `place` `region` `city` `store` `config` の文字列は日本語で届く。`Store` / `Place` オブジェクトは英語データなので places で名前を引く。
 * モジュールへ渡すラベル（inPlace / inCountry）は助詞なしの名詞句（「東京」「Apple 銀座」「日本」）。
 * 機種名・容量・Apple Store・ShelfSpring・URL・型番は訳さない。チェック間隔は 15 秒と 5 秒のみ。返金には触れない。
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
import { PATTERN_MIN, PATTERN_MIN_DAYS, WEEKDAY_MIN_SPAN, localStamp } from "@/lib/content/siteFacts";
import { OTHER_TRACKERS, SPEED } from "@/lib/plans";
import { includedRate, taxName } from "@/content/country-tax";
import { num, list, stamp, weekdays, price as priceIn, distance, fitTitleW } from "@/lib/i18n/format";
import { appleStoreLabel, cityLabel, colorLabel, countryLabel, regionLabel, storeLabel } from "@/lib/i18n/places";
import type { Dict } from "../en";
import type { RestockTimesMeta, RestockTimesView } from "../en/views";
import { content } from "./content";

type RT = Dict["views"]["restockTimes"];

const L = "ja" as const;
const N = (n: number) => num(L, n);
const country = (c: Pick<Country, "cc">) => countryLabel(c.cc, L);
const listJa = (items: string[], max = 6) => list(L, items, max, (n) => content.listMore(N(n)));
/** 地域の呼び方（日本：都道府県）。 */
const NOUN: Record<string, string> = { state: "州", province: "州", area: "エリア", department: "県", prefecture: "都道府県", emirate: "首長国", canton: "州", region: "地域", county: "県", city: "市" };
const noun = (c: Country) => NOUN[c.regionNoun ?? "area"] ?? "エリア";
/** 他サイトが公表しているチェック間隔（「8秒〜15分」）。 */
const others = (() => {
  const m = OTHER_TRACKERS.match(/^(\d+) seconds? to (\d+) minutes?$/);
  return m ? `${m[1]}秒〜${m[2]}分` : OTHER_TRACKERS;
})();
/** 価格に含まれる税：「税込・消費税10%」。 */
function taxNoteJa(c: Country): string {
  if (c.cc === "us") return "税別・税率は州ごとに異なる";
  if (c.cc === "ca") return "税別・GST/HSTと州税は会計時に加算";
  const r = includedRate(c);
  if (r == null) return "売上税なし（香港）";
  const t = taxName(c);
  return `税込・${t === "consumption tax" ? "消費税" : t === "VAT" ? "付加価値税" : t}${r}%`;
}

/* ---------------------------------------------------------------- 製品×場所の名前 */

const ccOf = (p: { country?: CountryCode }) => p.country ?? "us";
/** 「iPhone Duo 512GB ナイトスカイ」。 */
function productName(p: Product, short = false): string {
  const m = modelByKey(p.model)!;
  return `${short ? m.short : m.name}${p.storage ? ` ${p.storage}` : ""}${p.color ? ` ${colorLabel(p.color, L)}` : ""}`;
}
/** 店舗名に都市名が含まれないときだけ「（東京）」を添える。 */
const cityNote = (s: Store) => { const city = cityLabel(s.country ?? "us", s.city, L); return appleStoreLabel(s, L).includes(city) ? "" : `（${city}）`; };
/** 場所の日本語名：国、地域、都市、「Apple 銀座」。 */
function placeNameJa(place: Place): string {
  const cc = ccOf(place);
  if (place.level === "country") return countryLabel(cc, L);
  if (place.level === "state") return regionLabel(cc, place.state!, L);
  if (place.level === "city") return cityLabel(cc, place.city!, L);
  return appleStoreLabel(place.store!, L);
}
const apple = (name: string) => (/^apple\b/i.test(name) ? name : `Apple ${name}`);

function productTitle(product: Product, place: Place, inStock: number): string {
  const n = place.stores.length;
  const name = productName(product), short = productName(product, true);
  if (place.level === "country") {
    const w = countryLabel(ccOf(place), L);
    return fitTitleW([...(inStock > 0 ? [`${name}の在庫：${w}のアップルストア${N(inStock)}店舗にあり`] : []), `${name}の店頭受け取り在庫（${w}・ライブ）`, `${short}の受け取り在庫（${w}）`, `${short}の受け取り在庫`]);
  }
  if (place.level === "store") {
    const s = place.store!;
    const a = appleStoreLabel(s, L);
    const now = inStock > 0 ? "いま在庫あり" : "受け取り在庫";
    return fitTitleW([`${a}の${name}：${now}`, `${a}${cityNote(s)}の${short}`, `${a}の${short}`, `${storeLabel(s, L)}の${short}`]);
  }
  const w = placeNameJa(place);
  return fitTitleW([`${w}の${name}在庫：${N(n)}店舗中${N(inStock)}店舗`, `${w}の${name}：受け取り在庫`, `${w}の${short}在庫`, `${w}の${short}`]);
}

function productDescription(product: Product, place: Place, inStock: number, stats: PlaceStats): string {
  const name = productName(product);
  const week = `今週の入荷${N(stats.week)}回`;
  if (place.level === "store") {
    const s = place.store!;
    const a = appleStoreLabel(s, L);
    const now = inStock > 0 ? "いま在庫あり" : "現在在庫なし";
    return fitTitleW([
      `${a}${cityNote(s)}の${name}受け取り在庫：${now}、${week}。ライブの状況、入荷時間、入荷通知。`,
      `${a}の${name}：${now}、${week}。ライブの状況と入荷通知。`,
    ], 155);
  }
  const where = `${placeNameJa(place)}のアップルストア`;
  const n = N(place.stores.length);
  return fitTitleW([
    `${name}の受け取り在庫：${where}${n}店舗中${N(inStock)}店舗にあり、${week}。店舗別のライブ在庫、入荷時間、入荷通知。`,
    `${name}：${where}${n}店舗中${N(inStock)}店舗にあり、${week}。店舗別のライブ在庫と入荷通知。`,
  ], 155);
}

function productFaq(product: Product, place: Place, lines: StoreLine[], stats: PlaceStats, clock: RestockStats, nearest: { name: string; city: string; distance: number } | null): FaqItem[] {
  const out: FaqItem[] = [];
  const name = productName(product);
  const at = placeNameJa(place);
  const cc = ccOf(place);
  const near = nearest ? `${apple(nearest.name)}・${nearest.city}（${distance(L, cc, nearest.distance)}）` : null;
  const inStock = lines.filter((l) => l.available.length > 0);
  const noneNow = `直近の確認では棚に並んでいませんでした${near ? `。いちばん近くで棚にあるのは${near}です` : ""}。`;
  if (place.level === "store") {
    const l = lines[0];
    out.push({
      q: `${name}は、いま${at}の棚にありますか？`,
      a: l && l.available.length > 0
        ? product.parts.length > 1 ? `直近の確認時点で棚にあったのは${listJa(l.available.map((i) => `${i.storage} ${colorLabel(i.color, L)}`), 4)}です。` : "直近の確認時点では棚にありました。"
        : noneNow,
    });
  } else {
    out.push({
      q: `${at}で${name}が棚にあるApple Storeはどこ？`,
      a: inStock.length === 0
        ? noneNow
        : `直近の確認では${N(inStock.length)}店舗の棚にありました（${listJa(inStock.map((x) => appleStoreLabel(x.store, L)), 4)}）。`,
    });
  }
  const peak = peakOf(clock, L);
  out.push({
    q: `${name}は${at}でどのくらい再入荷していますか？`,
    a: stats.month === 0 ? `直近${N(stats.days)}日の台帳には、再入荷の記録がありません。` : `直近${N(stats.days)}日の再入荷は${N(stats.month)}回、うち今週${N(stats.week)}回${peak ? `。店舗時刻の${peak.hour}前後に集まっています` : ""}。`,
  });
  if (stats.medianMs != null) {
    const d = fmtDuration(stats.medianMs, L);
    out.push({ q: `${at}では、再入荷した${name}が棚にどのくらい残りますか？`, a: `棚にあった時間の中央値は${d.endsWith("未満") ? d : `約${d}`}。それを過ぎると、たいていまた棚から消えています。` });
  }
  return out;
}

function priceLabelJa(product: Product): string {
  const cc = ccOf(product);
  const prices = catalogFor(product.model, cc).filter((c) => product.parts.includes(c.partNumber)).map((c) => c.price);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  const f = (v: number) => priceIn(L, COUNTRIES[cc], v);
  return lo === hi ? f(lo) : `${f(lo)}〜${f(hi)}`;
}

/* ---------------------------------------------------------------- 入荷時間ページの書式 */

/** 0〜1 の割合を整数％で（0.5% 未満は「<1%」）。 */
const rtPct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
/** 暦日（YYYY-MM-DD）：「11月3日(火)」、曜日なしで「11月3日」。 */
const dateLabel = (ymd: string, weekday = true) => new Intl.DateTimeFormat("ja-JP", { timeZone: "UTC", month: "short", day: "numeric", ...(weekday ? { weekday: "short" as const } : {}) }).format(new Date(`${ymd}T12:00:00Z`));
const longDate = (ymd: string) => new Intl.DateTimeFormat("ja-JP", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${ymd}T12:00:00Z`));
const zoneStamp = (iso: string, c: Country) => stamp(L, iso, c.timeZone, true);
const hourLabel = (h: number) => `${h}時`;
/** 「9〜11時」。 */
const rangeLabel = (from: number, to: number) => `${from}〜${to}時`;
const weekdayName = (d: number) => weekdays(L)[d];
const storeJa = (s: Store) => appleStoreLabel(s, L);
const rtRegion = (x: { us: boolean; c: Country }) => (x.us ? "州" : noun(x.c));
const zero = "照らし合わせられる再入荷の記録が、台帳にまだありません。";

/** 英語の時刻（「10 AM」）と曜日（「Tuesday」）で届いた peak を日本語に。 */
function peakJa(p: FaqContext["peak"]): FaqContext["peak"] {
  if (!p) return p;
  const m = p.hour.match(/^(\d{1,2}) (AM|PM)$/);
  const hour = m ? `${(Number(m[1]) % 12) + (m[2] === "PM" ? 12 : 0)}時` : p.hour;
  const en = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(p.day ?? "");
  return { ...p, hour, day: en >= 0 ? weekdayName(en) : p.day };
}

const baseViews: Dict["views"] = {
  common: {
    inCountry: (c: Country) => country(c),
    liveMap: "棚マップ",
    restockLog: "再入荷ログ",
    alertMe: "見守りリストに追加",
    lastDays: (days: number) => <>再入荷カレンダー（{N(days)}日分）</>,
    since: "2026年11月2日",
    sourcesWhere: (n: number, c: Country) => `${country(c)}で観測しているApple Store ${N(n)}店舗`,
    checker: (c: Country) => `${country(c)}の受け取り台帳`,
    appleStoresIn: (c: Country) => `${country(c)}にあるApple Store`,
    storesWithIt: "棚にある店舗",
    more: "台帳のほかの項目",
  },

  /* ---------------------------------------------------------------- /stock/{product}/{place…} */
  product: {
    title: productTitle,
    description: productDescription,
    faq: productFaq,
    priceLabel: priceLabelJa,
    inPlace: (name: string) => name,
    h1Country: (model: string, c: Country) => `${country(c)}の${model}店頭受け取り在庫`,
    h1Place: (model: string, where: string) => `${where}の${model}`,
    inStockNow: "現在の棚",
    yes: "棚にあり",
    no: "棚になし",
    pickup: "受け取りの回答",
    configurations: "棚にある構成",
    ofStores: (n: number) => `観測${N(n)}店舗のうち`,
    restocks24h: "再入荷（直近1日）",
    restocksHint: (week: number, month: number, days: number) => `7日：${N(week)} · ${N(days)}日：${N(month)}`,
    sellOuts: (days: number) => `棚から消えた回数 · ${N(days)}日`,
    stays: (ms: number) => { const d = fmtDuration(ms, L); return d.endsWith("未満") ? `棚にいた時間の中央値 ${d}` : `棚にいた時間の中央値 ≈${d}`; },
    noPairs: "消えるまで追えた例はまだなし",
    lastRestock: "直近の再入荷",
    noneYet: "まだ観測なし",
    thisConfig: "この構成そのもの",
    inDays: (days: number) => `${N(days)}日以内は記録なし`,
    notInStockNow: "いまは棚になし",
    configsInStock: (n: number, of: number) => <span>棚にある構成 <b className="text-ink">{N(n)}</b>/{N(of)}</span>,
    inStockAt: (n: number, of: number) => <span>棚にある店舗 <b className="text-ink">{N(n)}</b>/{N(of)}</span>,
    checked: (live: ReactNode, price: string, tax: string) => <>{price}{tax} · 直近の観測 {live}</>,
    taxNote: (c: Country) => taxNoteJa(c),
    beforeTax: "税別",
    buyOnApple: "apple.comで注文",
    allStoresIn: (c: Country) => `${country(c)}の店舗目録`,
    everyIphoneHere: "ここの3機種すべて",
    everyIphone: (where: string) => `${where}の3機種すべて`,
    panel: (model: string, where: string | null) => `${where ? `${where}・` : ""}${model}の見守りリスト：先に構成、次に行ける店舗を選ぶ`,
    unitConfigs: "構成",
    unitStores: "店舗",
    otherConfigsHere: "この店舗のほかの構成",
    byStorageColor: "ストレージ→色の順",
    nearestStores: "いちばん近い店舗",
    closest: (link: ReactNode, dist: string) => <>棚にある最寄りの店舗：{link}（{dist}）</>,
    storeCity: (store: string, city: string) => <>{store} · {city}</>,
    mostRecentlyInStock: "最後に棚で見かけた店舗",
    storesWithItNow: "きょう棚にある店舗",
    storesIn: (where: string) => `${where}にある店舗`,
    colStatus: "棚",
    colConfigs: "棚にある構成",
    noStoreHasIt: "直近の観測では、どの店舗の棚にもありません。",
    noStoreHereHasIt: "直近の観測では、この範囲の店舗の棚にはありません。",
    moreStores: (n: number) => <>棚にある店舗はほかに{N(n)}店 · 店舗目録をすべて開く ↗</>,
    byRegion: (c: Country) => `${noun(c)}ごとに見る`,
    byCity: "都市ごとに見る",
    nearbyStores: "代わりに行ける店舗",
    latestChanges: "台帳の新しい記入",
    nothingLogged: "台帳はまだ白紙です。",
    whenRestocks: "再入荷が記録される時刻",
    howFast: "棚にあった時間",
    restocksByConfig: "構成ごとの再入荷",
    faqTitleCountry: (model: string, c: Country) => `観測ノートQ&A · ${country(c)}の${model}`,
    faqTitle: (model: string, where: string) => `観測ノートQ&A · ${where}の${model}`,
    buySource: (model: string, c: Country) => `apple.com（${country(c)}）：${model}の注文ページ`,
    nearby: "周りの場所",
    otherRegions: (c: Country) => `ほかの${noun(c)}も見る`,
    elsewhereIn: (region: string) => `${region}をさらに見る`,
    everyAppleStoreIn: (c: Country) => `${country(c)}の店舗目録（全店）`,
    across: (model: string, c: Country) => `${model} · ${country(c)}全域`,
    itemList: (model: string, where: string) => `${where}の${model}`,
    nearLead: (c: Country, model: string, inStock: number, n: number, have: { store: string; city: string; configs: number }[]) =>
      inStock === 0
        ? `直近の観測では、${country(c)}のApple Storeのどの棚にも${model}はありません。近くで手に入るかどうかは、どの店舗に先に戻るかで決まります。行ける店舗を見守りリストに入れておけば、棚に戻った時点でプッシュ通知が届きます。`
        : `直近の観測で${model}を棚に出していたのは${N(inStock)}/${N(n)}店舗。${listJa(have.slice(0, 5).map((l) => `${l.store}・${l.city}（${N(l.configs)}構成）`), 5)}。`,
    nearHead: (c: Country) => [noun(c), "棚にある店舗（現在）"],
    nearCaption: (c: Country, model: string) => `${model}が棚にある店舗を${noun(c)}ごとに（直近の観測時点）`,
    nearMe: (_c: Country, model: string, alert: string) => `全店舗を自分からの距離順に並べたいときは、このページの見守り設定で現在地を使ってください。距離は道のりで測った推定km、各店舗から経路も開けます。[${model}を見守りリストに入れる](${alert})。`,
    modelFaq: (c: Country, model: string, low: number, high: number, inStock: number): { price: FaqItem; reserve: FaqItem } => {
      const money = (v: number) => priceIn(L, c, v);
      return {
        price: { q: `${country(c)}で${model}はいくら？`, a: `apple.comの価格で、いちばん小さいストレージの${money(low)}から最大ストレージの${money(high)}まで（${taxNoteJa(c)}）。` },
        reserve: { q: `${country(c)}で${model}を店頭受け取り用に取り置く方法はありますか？`, a: `方法は注文だけです。店頭受け取りを選んでapple.comの注文手続きを終えた時点でその構成が確保され、選んだ時間枠までAppleが保管します。${inStock === 0 ? "直近の観測ではどの店舗の棚にもないため、見守りリストに入れておくのがいちばん早く知る手段です。" : ""}` },
      };
    },
  },

  /* ---------------------------------------------------------------- /restocks */
  restocks: {
    metaTitle: (c: Country, n: number) => `${country(c)}のiPhone入荷履歴：${n === 1 ? "アップルストア" : `アップルストア全${N(n)}店舗`}をライブ記録`,
    metaDescription: (c: Country) => `${country(c)}のアップルストアで、iPhone Duo・18 Pro・Pro Maxの店頭受け取り在庫が入荷するたびに記録。正確な時刻、構成、地図つき。`,
    h1: (c: Country) => `${country(c)}の入荷履歴`,
    summary: (day: number, week: number, model?: string, region?: string) => <>直近1日：再入荷{N(day)}回 / 直近7日：{N(week)}回{model ? ` · ${model}` : ""}{region ? ` · ${region}` : ""}。時刻はお使いの端末の時計に合わせて表示。</>,
    allModels: "全機種",
    restocks: "再入荷のみ",
    withSoldOut: "再入荷と消えた記録",
    regionLabel: (c: Country) => noun(c),
    allRegions: (c: Country) => `${noun(c)}：指定なし`,
    filter: "適用",
    page: (k: number) => <>{N(k)}枚目</>,
    newer: "← より新しい記入",
    older: "さかのぼる →",
    getAlerts: "見守りリストを始める",
    byPlace: "場所ごとの再入荷記録",
    byRegion: (c: Country) => `${noun(c)}ごと`,
    datasetName: (c: Country) => `${country(c)}のアップルストア iPhone店頭受け取り入荷記録`,
    datasetDescription: (c: Country) => `${c.cc === "us" ? "米国のアップルストア全269店舗" : `${country(c)}のアップルストア`}における、iPhone Duo、iPhone 18 Pro、iPhone 18 Pro Maxの店頭受け取り在庫の確認済みの入荷と完売を、店舗・正確な構成・時刻とともにすべて記録。15秒ごと（通知のある店舗は5秒ごと）のチェックで、apple.comから一致する回答を2回得たときだけ入荷として記録しています。`,
    datasetMeasured: ["アップルストア", "iPhoneの機種・容量・カラー", "入荷時刻", "完売時刻"],
  },

  /* ---------------------------------------------------------------- /map */
  map: {
    metaTitle: (c: Country, n: number) => `iPhone Duo受け取り在庫マップ：${country(c)}の${n === 1 ? "アップルストア" : "全アップルストア"}をライブ表示`,
    metaDescription: (c: Country, n: number) => `${country(c)}の${n === 1 ? "アップルストア" : `アップルストア全${N(n)}店舗`}で、いまiPhone Duo・18 Pro・Pro Maxを店頭受け取りできるかを、容量・カラー別に表示するライブマップ。`,
    country: (c: Country) => ({ name: country(c), inName: `${country(c)}の`, regionNoun: c.regionNoun, regionNounPlural: c.regionNounPlural }),
    everyStore: "店舗目録",
    storeCity: (store: string, city: string) => `${city} · ${store}`,
  },

  /* ---------------------------------------------------------------- /{cc}/stores */
  storesIndex: {
    metaDescription: (c: Country, n: number, regions: number, cities: number, duo: number, max: number) => {
      const by = c.regionNoun && regions > 1 ? `${noun(c)}・都市別に` : cities > 1 ? "都市別に" : "";
      return `${country(c)}のアップルストア全${N(n)}店舗を${by}一覧。iPhone Duo・18 Pro・Pro Maxの店頭受け取り在庫をライブ表示：いまDuoは${N(duo)}店舗、Pro Maxは${N(max)}店舗に在庫あり。`;
    },
    countAnswer: (n: number, spread: string, top: { name: string; count: number }[]) => `目録に載っているのは${N(n)}店舗（分布：${spread}）${top.length ? `。いちばん集まっているのは${top[0].name}の${N(top[0].count)}店舗${top[1] ? `、続いて${top[1].name}の${N(top[1].count)}店舗` : ""}` : ""}。`,
    howMany: (c: Country) => <>{country(c)}にあるApple Storeの数</>,
    duoNow: (c: Country, n: number, have: Store[]): FaqItem => ({
      q: `${country(c)}でいまiPhone Duoが棚にあるApple Storeは？`,
      a: have.length === 0 ? `直近の観測では、${N(n)}店舗のどの棚にもありません。棚に戻ればこのページと棚マップにすぐ反映され、見守りリストに入れておけばプッシュ通知で知らせます。` : `直近の観測で棚にあったのは${N(have.length)}/${N(n)}店舗：${have.slice(0, 6).map(storeJa).join("、")}${have.length > 6 ? "など" : ""}。`,
    }),
    faq: (ctx: FaqContext) => placeFaq({ ...ctx, peak: peakJa(ctx.peak), omit: [...(ctx.omit ?? []), "count", "stock", "lasts"] }, L),
    duoBlock: (alert: string) => `近道は、行ける店舗を見守ることです：[iPhone Duoを見守りリストに入れる](${alert})。見守り1件＝1店舗×1構成で、棚に戻るとプッシュ通知が届きます。`,
    intro: (c: Country, n: number, spread: string, now: { duo: number; max: number; pro: number }, tax: string) => `${country(c)}にはApple Storeが**${N(n)}店舗**（分布：${spread}）。直近の観測で棚にあるのは、iPhone Duoが**${N(now.duo)}店舗**、iPhone 18 Pro Maxが**${N(now.max)}店舗**、18 Proが**${N(now.pro)}店舗**。${tax}`,
    crumb: "店舗目録",
    panel: (c: Country) => `${country(c)}の見守りリスト：iPhoneを決めてから、行ける店舗だけを選ぶ`,
    matrixLabel: "店舗ごとの棚",
    matrixH2: (c: Country) => <>機種ごとに見た{country(c)}の棚</>,
    matrixHint: "機種ごとに「直近の観測で棚にある数／追跡している数」。",
    topCaption: (c: Country) => <>{noun(c)}別・Apple Storeの多い順（Apple直営店リストより）</>,
    regionHead: (c: Country) => noun(c),
    colStores: "Apple Store数",
    colCities: "含まれる都市",
    locationsBy: (c: Country) => `店舗目録（${noun(c)}ごと）`,
    locationsIn: (c: Country) => `${country(c)}の店舗目録`,
    storeCount: (n: number) => <>Apple Store {N(n)}店</>,
    storeCountAll: (n: number) => <>全{N(n)}店</>,
    whenRestock: (c: Country) => <>{country(c)}の再入荷のタイミング</>,
    howFast: (c: Country) => <>{country(c)}で棚にあった時間</>,
    faqTitle: (c: Country) => `観測ノートQ&A · ${country(c)}の店舗`,
    getApp: "ホーム画面アプリを入れる",
    howItWorks: "記録の方法（英語）",
    pricing: "プランと料金",
  },

  /* ---------------------------------------------------------------- /iphone-duo-restock-times */
  restockTimes: {
    fmt: {
      n: N,
      pct: rtPct,
      date: dateLabel,
      longDate,
      zoneStamp,
      local: (iso: string, store: Parameters<typeof localStamp>[1]) => localStamp(iso, store, L),
      hour: hourLabel,
      range: rangeLabel,
      weekday: weekdayName,
      store: storeJa,
      storeWithPlace: (s: Store) => `${cityLabel(s.country ?? "us", s.city, L)} · ${storeJa(s)}`,
    },
    title: (c: Country) => `${country(c)}のiPhone Duo再入荷時刻：観測記録`,
    metaDescription: (x: RestockTimesMeta) => {
      const { c, t, w, pattern } = x;
      const w0 = country(c);
      const region = c.cc === "us" ? "州" : c.regionNoun ? noun(c) : "店舗";
      const since = dateLabel(t.since, false);
      return t.n > 0 && pattern
        ? fitTitleW([
          `${w0}のアップルストアで${since}以降に確認したiPhone Duoの入荷は${N(t.n)}回。${rtPct(w.share)}が現地時間${rangeLabel(w.from, w.to)}に集中${t.sellout ? `、${rtPct(t.sellout.within2min)}は2分以内に完売` : ""}。時間帯・日・${region}・店舗・構成別の表。`,
          `${w0}のアップルストアで${since}以降のiPhone Duo入荷${N(t.n)}回、${rtPct(w.share)}が現地時間${rangeLabel(w.from, w.to)}。時間帯・日・${region}・構成別の表。`,
          `${w0}のiPhone Duo再入荷の記録：${since}以降の${N(t.n)}回を、時間帯・日・${region}・構成ごとに。`,
        ], 158)
        : t.n > 0
          ? fitTitleW([
            `${since}以降、${w0}のアップルストアで確認したiPhone Duoの入荷${N(t.n)}回を、${SPEED.checkSec}秒ごとのチェックから集計：現地の時間帯別、日別、${region}・店舗・構成別、それぞれの在庫時間も。`,
            `${w0}のiPhone Duo再入荷の記録：${since}以降に記録した${N(t.n)}回を、時間帯・日・${region}・構成ごとに。`,
          ], 158)
          : `${w0}のアップルストアにiPhone Duoが入荷するのはいつか。ShelfSpringが${longDate(t.since)}から${SPEED.checkSec}秒ごとに続けているチェックをもとに、時間帯・日・店舗・構成別にまとめます。`;
    },
    h1: (x: RestockTimesView) => x.t.unknown
      ? `${country(x.c)}のiPhone Duo再入荷：観測記録`
      : x.t.n > 0
        ? `${country(x.c)}のiPhone Duo再入荷：${x.pattern ? `記録が多いのは店舗時刻の${rangeLabel(x.w.from, x.w.to)}` : "観測した時間帯ごとに"}`
        : `${country(x.c)}ではiPhone Duoの再入荷をまだ観測していません。台帳で見ている項目はこちら`,
    intro: (x: RestockTimesView) => {
      const { t, tracked, pattern, w } = x;
      const where = country(x.c);
      return t.unknown ? (
        <>再入荷の記録を今回は読み込めませんでした。{where}の店舗は{SPEED.checkSec}秒ごとの確認を続けていて、次に読み込めた時点で数値が出ます。</>
      ) : t.n > 0 ? (
        <>
          <b className="text-ink">{longDate(t.since)}以降、{where}のApple StoreでiPhone Duoの再入荷を{N(t.n)}回記録</b>しました{tracked > 1 ? <>（追跡{N(tracked)}日のうち{N(t.days)}日）</> : <>（追跡はまだ初日）</>}
          {pattern && <>。<b className="text-ink">うち{rtPct(w.share)}は店舗時刻の{rangeLabel(w.from, w.to)}</b>に集中しています</>}。
        </>
      ) : (
        <>
          <b className="text-ink">台帳にはまだ記録がありません。</b>ShelfSpringは{longDate(t.since)}から{x.one ? `${where}のApple Store` : `${where}のApple Store ${N(x.stores)}店舗すべて`}を{SPEED.checkSec}秒ごとに確認していますが、iPhone Duoの店頭受け取りの再入荷はまだ観測していません。
        </>
      );
    },
    hero: {
      restocks: (x: RestockTimesView) => `${dateLabel(x.t.since, false)}以降に記録した再入荷`,
      window: (x: RestockTimesView) => `店舗時刻の${rangeLabel(x.w.from, x.w.to)}`,
      days: "再入荷のあった日／追跡日数",
      // 英語の型は戻り値が文字列リテラルなので、日本語の文字列を渡すために型を合わせる。
      now: (() => "いま棚にある店舗") as unknown as RT["hero"]["now"],
      today: (x: RestockTimesView, today: DayRow) => `本日分（${dateLabel(today.date)}）・途中経過${x.one ? "" : ` · ${N(today.stores)}店舗`}`,
      weekday: "記録上いちばん多い曜日",
    },
    heroPoints: (x: RestockTimesView, latest: { config: string; store: Store; at: string } | null): Point[] => [
      ...(latest ? [{ text: <>直近の記録：{localStamp(latest.at, latest.store, L)}（店舗時刻）、<b className="text-ink">{latest.config}</b>{x.one ? null : <> · <Link href={storePath(latest.store)} className="underline underline-offset-2">{storeJa(latest.store)}</Link></>}</> }] : []),
      ...(x.t.peakWeekday != null ? [{ text: <>曜日別でいちばん多いのは<b className="text-ink">{weekdayName(x.t.peakWeekday)}</b></> }] : []),
      { text: <><b className="text-ink">Appleは再入荷の予定を出していません</b>。ここにあるのはShelfSpringが自分で観測した記録で、更新はおよそ5分ごと</>, no: true },
    ],
    emptyPoints: (x: RestockTimesView): Point[] => [
      { text: <>いま棚にあるのは<b className="text-ink">{N(x.duoNow)}/{N(x.stores)}店舗</b></> },
      { text: <>最初の再入荷を観測した時点で、下の表への記入が始まります</>, step: true },
      { text: <>時間帯・曜日の傾向をいちばん多いデータで見るなら<Link href="/iphone-duo-restock-times" className="underline underline-offset-2">米国の記録（英語）</Link></>, step: true },
    ],
    setUpAlert: "iPhone Duoの見守りリストを始める",
    logLive: "再入荷ログをライブで開く",
    onThisPage: "目次",
    nav: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": "時刻",
      "day-by-day": "カレンダー",
      where: `場所（${rtRegion(x)}）`,
      configuration: "構成ごと",
      "how-long": "棚にあった時間",
      unavailable: "「ご利用いただけません」とは",
      reddit: "掲示板のうわさ",
      method: "数え方のルール",
    }),
    h2: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": `${country(x.c)}のiPhone Duoは何時に再入荷している？`,
      "day-by-day": `${country(x.c)}でiPhone Duoの再入荷があった日は？`,
      where: `${country(x.c)}で再入荷の記録が多いApple Storeは？`,
      configuration: `${country(x.c)}でよく再入荷するiPhone Duoの構成は？`,
      "how-long": `${country(x.c)}で、再入荷したiPhone Duoはどのくらい棚に残る？`,
      unavailable: "どのApple Storeでも「現在ご利用いただけません」と出るのはなぜ？",
      reddit: "iPhone Duoの再入荷をめぐるRedditの通説と、記録が示すこと",
      method: "ShelfSpringは再入荷をどう数えている？",
    }),
    faq: (x: RestockTimesView): Faq[] => {
      const { t, w, pattern, sell, us, weekend, tracked } = x;
      const where = country(x.c);
      const window = rangeLabel(w.from, w.to);
      return [
        { q: `${where}では、iPhone Duoの再入荷は何時ごろ現れる？`, a: t.n > 0 && pattern
          ? `${w.from >= 5 && w.from < 12 ? "朝に偏っています。" : ""}${longDate(t.since)}以降に記録した再入荷${N(t.n)}回のうち、${rtPct(w.share)}が店舗時刻の${window}、${rtPct(hourShare(t.byHour, 8, 12))}が8〜12時でした。Appleは予定を出しておらず、これはShelfSpringの観測から出した傾向で、およそ5分ごとに更新します。`
          : `Appleは予定を公表していません。${longDate(t.since)}以降、ShelfSpringが${where}で記録した再入荷は${N(t.n)}回${t.days ? `（${N(t.days)}日）` : ""}。再入荷が${PATTERN_MIN}回以上、${PATTERN_MIN_DAYS}日以上に分かれてそろった時点で、いつもの時刻をここに書き足します。` },
        { q: `${us ? "" : `${where}で`}週末にもiPhone Duoは再入荷する？`, a: t.n > 0
          ? `${weekend > 0 ? "記録上はあります" : "記録上はまだありません"}。全${N(t.n)}回のうち土日は${N(weekend)}回（${rtPct(weekend / t.n)}）。${t.peakWeekday != null ? `曜日の最多は${weekdayName(t.peakWeekday)}。` : `曜日の最多は${WEEKDAY_MIN_SPAN}日分の記録がたまるまで書きません（いま${N(tracked)}日分）。`}`
          : `${where}の週末の記録はまだありません。再入荷を観測するたび、日ごとの表に書き足されます。` },
        { q: "自分で見張るなら、何時から？", a: t.n > 0 && pattern
          ? `店舗時刻の${hourLabel(w.from)}には、店頭受け取りを選んだ状態でapple.comを開いておくのが目安です。この2時間に再入荷の${rtPct(w.share)}が集まっています。ただ棚にあるのは${sell ? `中央値${N(sell.medianSec)}秒` : "たいてい1分前後"}なので、再読み込みで追いきれない分は、${SPEED.fastSec}秒ごとに確認する見守り（[見守りの仕組み（英語）](/iphone-duo-stock-alerts)）に任せられます。`
          : `${where}の傾向が見えてくるまでは、見張りは見守りリストに任せるのが現実的です。選んだ店舗を${SPEED.fastSec}秒ごとに一日中確認します（[見守りの仕組み（英語）](/iphone-duo-stock-alerts)）。` },
        { q: "iPhone Duoがどの店でも「現在ご利用いただけません」なのはなぜ？", a: sell
          ? `再入荷が一瞬で終わるからです。${where}で消えるまで測れた再入荷${N(sell.n)}回のうち、${rtPct(sell.within2min)}は2分以内、${rtPct(sell.within20min)}は20分以内に棚から消えました。いま棚にあるのは${N(x.duoNow)}/${N(x.stores)}店舗。数十回戻った日でも、ほとんどの時間はapple.comが「現在ご利用いただけません」と出すのが正常です（[表示の読み方（英語）](/apple-store-pickup-availability-explained)）。`
          : `店頭受け取りの在庫は、数分単位でしか棚に出ないからです。いま${where}で棚にあるのは${N(x.duoNow)}/${N(x.stores)}店舗です（[表示の読み方（英語）](/apple-store-pickup-availability-explained)）。` },
        { q: "行きたいApple StoreにiPhone Duoが戻ったら知らせてもらうには？", a: `店舗とストレージ・色まで決めて、見守りリストに入れます。以後その店舗は${SPEED.fastSec}秒ごとに確認され、再入荷を確認するとスマートフォンにプッシュ通知が届きます（[見守りを設定](${x.alert})、[仕組み（英語）](/how-it-works)）。` },
      ];
    },
    sources: {
      applePickup: "Appleの解説ページ「Delivery and Pickup」（英語）",
      newsroom: "「iPhone Duo arrives at Apple Store locations worldwide」 · Appleのプレスリリース、2026年10月23日（英語）",
      macRumors: "「Apple Store pickup system for iPhone Duo went live again in the US and Canada」 · MacRumorsの報道、2026年10月24日（英語）",
      reports: (tracker: string) => `${tracker}の発売週iPhone Duoメモ：この台帳とは分けて表示し、集計には入れません`,
    },
    ld: (x: RestockTimesView) => ({
      datasetName: `${country(x.c)}のアップルストアにおけるiPhone Duoの入荷時間`,
      description: `${x.t.since}以降、${country(x.c)}のアップルストアで確認したiPhone Duoの店頭受け取りの入荷をすべて、店舗・構成・時刻とともに記録したデータ。ShelfSpringの${SPEED.checkSec}秒ごとのチェックに基づき、現地の時間帯・日・${rtRegion(x)}・店舗・構成別に集計しています。`,
      spatial: `${country(x.c)}のアップルストア`,
      measured: ["入荷時刻（店舗の現地時間）", "アップルストア", "iPhone Duoの容量とカラー", "完売までの秒数"],
      size: `入荷${N(x.t.n)}回、${N(x.t.stores)}店舗`,
    }),
    crumb: "iPhone Duo再入荷の記録",

    // ---- 時刻
    timeLead: (x: RestockTimesView) => <b>店舗時刻の{rangeLabel(x.w.from, x.w.to)}に記録された再入荷は{rtPct(x.w.share)}（全{N(x.t.n)}回中）、8〜12時に絞ると{rtPct(hourShare(x.t.byHour, 8, 12))}。</b>,
    busiestHour: (count: number) => `ピークの1時間：${N(count)}回`,
    morning: "朝 8〜12時",
    evening: "17時以降（夜も記録あり）",
    night: "深夜 0〜6時",
    tooFew: (x: RestockTimesView) => <b>{longDate(x.t.since)}以降の記録は{N(x.t.days)}日・再入荷{N(x.t.n)}回。いつもの時刻を書くには、まだ足りません。</b>,
    tooFewKeys: (): Point[] => [
      { text: <>いつもの時刻を書く条件：<b className="text-ink">再入荷{PATTERN_MIN}回以上、それが{PATTERN_MIN_DAYS}日以上に分散</b></> },
      { text: <>一度に10回まとまって戻っても、それは1回の出来事。習慣とは数えません</>, no: true },
      { text: <>記録の日数が増えると、このページは自分で書き換わります</>, step: true },
    ],
    hourCaption: (x: RestockTimesView) => `${country(x.c)}で記録したiPhone Duoの再入荷、店舗時刻の1時間ごと（${dateLabel(x.t.since, false)}→今日、計${N(x.t.n)}回）`,
    hourHead: ["店舗時刻（24時間制）", "再入荷", "記録に占める割合"],
    morningKeys: (x: RestockTimesView): Point[] => [
      { text: <>朝の山は<b className="text-ink">開店時刻のせいではありません</b>{x.us ? "（米国のApple Storeは多くが10時開店）" : ""}</> },
      { text: <>受け取り用の在庫は、店が開く前に<b className="text-ink">オンライン側で</b>出てきます</> },
      { text: <>自分の目で追うなら、平日朝の<b className="text-ink">{rangeLabel(x.w.from, x.w.to)}</b></>, step: true },
      { text: <>誰も画面を見ていない<b className="text-ink">残り22時間</b>は<Link href={x.alert}>見守りリスト</Link>の担当</>, step: true },
    ],
    storeChartKeys: (x: RestockTimesView): Point[] => [{ text: <>店舗ごとの時刻グラフは、各店舗の記録にあります（<Link href={x.storesHref}>{x.us ? "州別のApple Store" : `${country(x.c)}の店舗`}</Link>）。周りより1時間早く戻る店舗を見つけたら、覚えておく価値があります</>, step: true }],

    // ---- カレンダー
    dayLead: (x: RestockTimesView) => {
      const { t, tracked, one } = x;
      return t.n > 0 && tracked === 1 ? (
        <b>追跡はまだ初日（{dateLabel(t.daily[t.daily.length - 1]?.date ?? t.since)}）。これまでに記録した再入荷は{N(t.n)}回{one ? "" : `・${N(t.stores)}店舗`}。</b>
      ) : t.n > 0 ? (
        <b>{t.days === tracked ? `追跡した${N(t.days)}日間、毎日どこかで再入荷を記録しました` : `${longDate(t.since)}から追跡した${N(tracked)}日のうち、再入荷を記録したのは${N(t.days)}日`}{t.peakWeekday != null ? `。曜日では${weekdayName(t.peakWeekday)}が最多` : ""}。</b>
      ) : (
        <b>{longDate(t.since)}以降、{country(x.c)}では再入荷が記録されていません。</b>
      );
    },
    daysTracked: "再入荷のあった日／追跡日数",
    busiestDay: (x: RestockTimesView, day: DayRow) => `いちばん多かった日 ${dateLabel(day.date)}${x.one ? "" : ` · ${N(day.stores)}店舗`}`,
    busiestDayNone: "いちばん多かった日",
    drop: (x: RestockTimesView, drop: { at: string; restocks: number }) => `同じ30分に再入荷した店舗の数（${zoneStamp(drop.at, x.c)}、${N(drop.restocks)}構成）：外から見た全国一斉の放出`,
    weekend: (x: RestockTimesView) => `週末（土日）に記録された再入荷・${N(x.weekend)}回`,
    dayCaption: (x: RestockTimesView) => `${country(x.c)}で記録したiPhone Duoの再入荷、暦日ごと${x.t.reports.length ? "。「報告」と書いた灰色の行は、この台帳を開く前の日について外部の追跡サイトが公開したメモで、時系列を埋めるだけで合計には入りません" : ""}`,
    dayHead: { date: "日", restocks: "再入荷", stores: "店舗", busiest: "ピーク時刻（24時間制）", source: "記録元" },
    soFar: " · 集計中",
    reportedBy: (names: string[]) => <>報告：{names.join(" / ")}</>,
    dayKeys: (x: RestockTimesView, launch: string, resumed: string): Point[] => [
      { text: <><b className="text-ink">{dateLabel(launch)}</b>：発売日（初回分はオンライン注文に回った）</> },
      { text: <><b className="text-ink">{dateLabel(resumed)}</b>：店頭受け取りの予約受付が戻った日{x.us ? "（MacRumors）" : ""}</> },
      x.t.reports.length
        ? { text: <><b className="text-ink">報告</b>と書いた行は、{x.reportNames.join("・")}が発売週に残した観測。合計には入れていません</> }
        : { text: <>{country(x.c)}全店舗の記録開始：<b className="text-ink">{longDate(x.t.since)}</b></> },
      ...(x.t.n > 0 && x.t.peakWeekday == null ? [{ text: <>曜日の最多は<b className="text-ink">{WEEKDAY_MIN_SPAN}日分</b>の記録がたまってから書きます（いま{N(x.tracked)}日分）</>, no: true }] : []),
      { text: <>見るべきは<b className="text-ink">店舗</b>の列。再入荷の回数が同じなら、店舗が散らばった日のほうが行ける店に当たりやすい</>, step: true },
    ],

    // ---- 場所
    whereLead: (x: RestockTimesView, hit: { name: string; restocks: number; stores: number; storesTotal: number }[], total: number) => (
      <b>{hit[0].name}：{dateLabel(x.t.since, false)}以降、{N(hit[0].stores)}/{N(hit[0].storesTotal)}店舗で再入荷{N(hit[0].restocks)}回{hit[1] ? <>、続いて{hit[1].name}（{N(hit[1].restocks)}回）</> : null}{hit[2] ? <>、{hit[2].name}（{N(hit[2].restocks)}回）</> : null}。再入荷を記録した{rtRegion(x)}は{N(hit.length)}/{N(total)}{total - hit.length > 0 ? `（残る${N(total - hit.length)}はまだ記録なし）` : "で、全域に記録があります"}。</b>
    ),
    whereNone: (x: RestockTimesView) => <b>{country(x.c)}ではまだ、再入荷を記録した{rtRegion(x)}がありません。最初の1件から表が埋まり始めます。</b>,
    regionCaption: (x: RestockTimesView) => `${country(x.c)}で記録したiPhone Duoの再入荷、${rtRegion(x)}ごと（${dateLabel(x.t.since, false)}→今日）`,
    regionHead: (x: RestockTimesView) => [rtRegion(x), "再入荷", "再入荷のあった店舗", "直近（店舗時刻）"],
    ofN: (a: number, b: number) => <>{N(a)}/{N(b)}</>,
    storesCaption: (x: RestockTimesView) => `${country(x.c)}でiPhone Duoの再入荷記録がいちばん長い店舗（${dateLabel(x.t.since, false)}→今日）`,
    storesHead: ["店舗", "再入荷", "記録のあった日", "よくある時刻", "直近（店舗時刻）"],
    swaps: (x: RestockTimesView) => [
      { no: "場所を問わず、再入荷の回数がいちばん多い店舗", yes: `${x.pattern ? `${hourLabel(x.w.from)}前後に` : "朝のうちに"}1時間以内で行ける2〜3店舗`, why: "行けない店の再入荷は、自分にとっては無いのと同じ。最多の店舗でも、棚にあるのは1日に数分だけです。" },
      { no: "1店舗だけに賭けて待つ", yes: "行ける店すべてを見守り、通知が来た店へ向かう", why: "回数の表でわかるのは、どの店へ先に向かうかだけです。" },
    ],
    nearMe: "近くでいまDuoが棚にある店舗（英語）",

    // ---- 構成
    configLead: (x: RestockTimesView, top: { label: string; restocks: number }, rarest: { label: string; restocks: number } | null) => (
      <b>いちばん多く戻ったのは{top.label}で、{N(x.t.n)}回中{N(top.restocks)}回（{rtPct(top.restocks / x.t.n)}）{rarest ? `。最少は${rarest.label}（${N(rarest.restocks)}回）` : ""}。</b>
    ),
    mostRestocked: (config: string) => `再入荷の最多構成 · ${config}`,
    versus: (a: string, bCount: number, b: string) => `${a}の再入荷（比較：${b}は${N(bCount)}回）`,
    restocksOf: (a: string) => `${a}の再入荷`,
    byStorage: "ストレージ別",
    byColour: "色別",
    configNone: (x: RestockTimesView) => <b>{country(x.c)}では、再入荷を記録した構成がまだありません。最初の1件の行き先として、{N(x.configs)}構成を並べてあります。</b>,
    configCaption: (x: RestockTimesView) => `${country(x.c)}で記録したiPhone Duoの再入荷、構成ごとに1行（${dateLabel(x.t.since, false)}→今日）`,
    configHead: ["構成", "再入荷", "記録に占める割合", "直近（店舗時刻）"],
    configKeys: (x: RestockTimesView): Point[] => [
      { text: <>結果を左右するのは、<b className="text-ink">どの店か</b>より<b className="text-ink">どの構成か</b></> },
      x.storageRatio != null
        ? { text: <>いちばん再入荷の多いストレージに寄せれば、次点のおよそ<b className="text-ink">{x.storageRatio}倍</b>の機会</> }
        : { text: <>いちばん再入荷の多いストレージに寄せるだけで、機会は<b className="text-ink">ぐっと</b>増えます</> },
      { text: <><b className="text-ink">2TB</b>は、配送で注文して待つ前提のiPhone</>, no: true },
      { text: <>価格と現在の棚：<Link href="/which-iphone-duo-restocks-most">よく戻るiPhone Duoはどれ？（英語）</Link></>, step: true },
    ],

    // ---- 棚にあった時間
    howLongLead: (x: RestockTimesView, sell: SelloutFacts) => <b>{country(x.c)}で消えるまで測れた再入荷{N(sell.n)}回のうち、半分は{N(sell.medianSec)}秒以内に棚から消えました。2分以内は{rtPct(sell.within2min)}、20分以内は{rtPct(sell.within20min)}。</b>,
    secUnit: "秒",
    medianListing: "棚にあった時間（中央値）",
    within2: "2分以内に棚から消えた",
    within20: "20分以内に棚から消えた",
    fastest: "測定した最短の滞在",
    howLongNone: (x: RestockTimesView) => <b>{country(x.c)}では、棚から消えるまで測れた再入荷がまだ少なすぎます。数値は10回分たまってから出します。全体像は米国の記録で。</b>,
    howLongKeys: (x: RestockTimesView): Point[] => [
      { text: <>2分の窓は<b className="text-ink">見守り</b>でとらえるもの。apple.comの再読み込みでは間に合いません</> },
      { text: <>このページのほかの数字は、ほぼこの1つで説明がつきます</> },
      { text: <>再入荷ごとの棚の秒数を構成・{rtRegion(x)}別に：<Link href="/iphone-duo-sell-out-times">iPhone Duoは何秒で棚から消える？（英語）</Link></>, step: true },
    ],
    measured: "数値は、棚にあると観測した確認から、消えたと観測した確認までの間隔です。上限側の値なので、実際に棚にあった時間はこれ以下です。",

    // ---- 「現在ご利用いただけません」
    unavailableLead: (x: RestockTimesView) => <b>再入荷は数分で終わる出来事で、棚にとどまる状態ではないからです。{x.one ? "1店舗" : `${N(x.stores)}店舗`}×{N(x.configs)}構成で、{country(x.c)}の棚に並びうる組み合わせは{N(x.pairs)}通り。いまiPhone Duoが棚にある店舗は{N(x.duoNow)}店舗です。</b>,
    pairs: "棚に並びうる店舗×構成の組み合わせ",
    listingNow: "いまiPhone Duoが棚にある店舗",
    goneIn2: "2分以内に棚から消えた再入荷の割合",
    last24: "直近24時間に記録した再入荷",
    unavailableKeys: (x: RestockTimesView, today: number): Point[] => [
      x.recent.restocks > 0
        ? { text: <>直近24時間：{country(x.c)}の{N(x.recent.stores)}店舗で<b className="text-ink">再入荷{N(x.recent.restocks)}回を記録</b></> }
        : today > 0
          ? { text: <>本日：{country(x.c)}で<b className="text-ink">再入荷{N(today)}回を記録</b></> }
          : { text: <>実際の再入荷は、上の日ごとの表に残っています</> },
      { text: <>どれもapple.comに出ていたのは<b className="text-ink">1〜2分</b>ほど</> },
      { text: <>4日目でも14日目でも、どこも「現在ご利用いただけません」なのは、Appleが販売をやめたという意味では<b className="text-ink">ありません</b></>, no: true },
    ],
    unavailableLinks: { explained: "「現在ご利用いただけません」の読み方（英語）", howToGet: "iPhone Duoを手に入れる道筋（英語）" },

    // ---- Reddit
    redditLead: (x: RestockTimesView) => <b><a href="https://www.reddit.com/r/applestore/" target="_blank" rel="noopener nofollow">r/applestore</a>や<a href="https://www.reddit.com/r/iphone/" target="_blank" rel="noopener nofollow">r/iphone</a>に集まる経験談は、たいてい善意です。ただ1店舗の体験で、翌日には古くなります。よく出る4つの説を、{country(x.c)}で記録した再入荷{N(x.t.n)}回と突き合わせました。</b>,
    redditCaption: "Redditでよく見るiPhone Duo再入荷の説を、ShelfSpringの観測記録で検証",
    redditHead: ["よく見る説", "記録が示すこと"],
    claims: (x: RestockTimesView): { claim: string; answer: ReactNode }[] => {
      const { t, w, tracked, recent } = x;
      return [
        { claim: "「再入荷は真夜中。午前3時に張り込め」", answer: t.n > 0 ? <>記録では{rangeLabel(w.from, w.to)}が{rtPct(w.share)}、0〜6時（店舗時刻）は{rtPct(hourShare(t.byHour, 0, 6))}にとどまります。</> : zero },
        { claim: "「Appleが補充するのは決まった曜日だけ」", answer: t.n > 0 ? (t.peakWeekday != null ? <>記録上の最多は{weekdayName(t.peakWeekday)}（全{N(t.n)}回中{N(t.byWeekday[t.peakWeekday])}回）。ただし再入荷は、追跡{N(tracked)}日のうち{N(t.days)}日で起きています。</> : <>追跡{N(tracked)}日のうち再入荷があったのは{N(t.days)}日{t.days === tracked ? "で、ゼロの日はありません" : ""}。曜日の最多は、{WEEKDAY_MIN_SPAN}日分の記録がたまってから書きます。</>) : zero },
        { claim: "「店に電話して、配送トラックの曜日を聞け」", answer: "Appleは再入荷の予定を公表していません。apple.comに出る受け取り在庫はオンラインで放出されるもので、店舗が知るのも全員と同じ瞬間です。" },
        { claim: "「“ご利用いただけません”になったら、もう戻らない」", answer: recent.restocks > 0 ? <>直近24時間だけでも、{N(recent.stores)}店舗で{N(recent.restocks)}回の再入荷を記録しています。いずれも数分で「現在ご利用いただけません」に戻りました。</> : t.n > 0 ? <>{dateLabel(t.since, false)}以降に記録した{N(t.n)}回の再入荷が反証です。どれも数分で「現在ご利用いただけません」に戻っています。</> : "反証に使える記録も、まだ台帳にありません。" },
      ];
    },
    redditKeys: (): Point[] => [
      { text: <>うわさが頼りになるのは<b className="text-ink">記録がない</b>ときだけ。このページがその記録で、誰でも無料で読めます</> },
      { text: <>Redditが当たっているのは<b className="text-ink">注文手続きのコツ</b>：事前にサインイン、Apple Payを用意（<Link href="/how-to-grab-an-iphone-duo-restock">20秒で済ませる手順（英語）</Link>）</> },
    ],

    // ---- 数え方
    methodLead: <b>数える条件は一つ：apple.comが、それまで出していなかった構成をある店舗で店頭受け取り可能と表示し、それを連続する2回の確認がそろって裏づけたときです。</b>,
    methodKeys: (x: RestockTimesView): Point[] => [
      { text: <>{x.one ? `${country(x.c)}のApple Store` : `${country(x.c)}の全Apple Store`}を<b className="text-ink">{SPEED.checkSec}秒ごと</b>に、見守りのある店舗は<b className="text-ink">{SPEED.fastSec}秒ごと</b>に確認</> },
      { text: <>外部の追跡サイトが公表している間隔は<b className="text-ink">{others}</b>。比べるのは公表値だけです</> },
      { text: <>初めての「棚にあり」は<b className="text-ink">約1秒後</b>に確かめ直してから数えます</> },
      { text: <>棚から消えたことは<b className="text-ink">次の確認</b>で確定</> },
      { text: <>店舗を初めて確認したときの結果と、失敗・タイムアウトしたリクエストは、再入荷にも「棚になし」にも<b className="text-ink">数えません</b></>, no: true },
      { text: <>時刻と日付は各店舗の<b className="text-ink">店舗時刻</b>。「波」とは、タイムゾーンをまたいで同じ30分に起きた再入荷のこと</> },
      { text: <>外部の報告{x.t.reports.length ? `（${x.reportNames.join("、")}）` : ""}は別の行に分け、<b className="text-ink">合計には入れません</b></> },
      { text: <>集計はおよそ5分ごとに更新。<Link href={x.logHref}>再入荷ログ</Link>そのものはライブ</>, step: true },
    ],
    quote: "数値は出典としてリンクを添えれば自由に引用できます。ShelfSpringはAppleと関係のない独立した記録で、apple.comで誰でも見られる受け取り在庫を高い頻度で読み取っています。",
    alertIn: (x: RestockTimesView) => <>iPhone Duoの見守りを設定{x.one ? "" : `（${country(x.c)}）`}</>,

    // ---- 関連、FAQ、出典
    related: "同じ記録からもう少し",
    sameData: "この台帳で答えられる質問（英語）",
    questions: {
      sellOut: "再入荷はどのくらい棚に残る？",
      alerts: "再入荷を最初に知るには",
      howToGet: "手に入れるための現実的な道筋",
      whichConfig: "いちばんよく戻る構成は",
      nearMe: "近くで棚にある店舗はどこ",
      unavailable: "「現在ご利用いただけません」の読み方",
    },
    otherCountries: ((us: boolean) => (us ? "ほかの国の同じ調査" : "ほかの国の記録")) as unknown as RT["otherCountries"],
    faqTitle: "観測ノートQ&A",
  },
};

export const views: Dict["views"] = withShelfViews("ja", baseViews);
