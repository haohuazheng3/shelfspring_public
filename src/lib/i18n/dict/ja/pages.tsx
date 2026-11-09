import { withShelfPages } from "@/lib/seo/localizedCopy";
/**
 * 日本語: pages — ホームのボード、地域・都市・店舗ページ（/ja-jp/…）。地名は日本語で届く。観測台帳の口調（再入荷・棚・見守り）。
 * 再入荷モジュールに渡すラベル（inPlace / atPlace / here）は助詞なしの名詞句：「東京」「Apple 銀座」「この店舗」。
 */
import { COUNTRIES, type CountryCode } from "@/lib/apple/countries";
import { countryLabel } from "@/lib/i18n/places";
import { num } from "@/lib/i18n/format";
import type { Dict } from "../en";

const country = (cc: CountryCode) => countryLabel(cc, "ja");
const N = (n: number) => num("ja", n);
const CHECK = "棚の状況はこまめに更新";
/** 地域の呼び方（日本：都道府県）。 */
const REGION: Record<string, string> = { state: "州", province: "州", area: "エリア", department: "県", prefecture: "都道府県", emirate: "首長国", canton: "州", region: "地域", county: "県", city: "都市" };
const regionOf = (cc: CountryCode) => REGION[COUNTRIES[cc].regionNoun ?? "area"] ?? "エリア";
/** 「銀座」→「Apple 銀座」（すでに Apple で始まる名前はそのまま）。 */
const apple = (name: string) => (/^apple\b/i.test(name) ? name : `Apple ${name}`);

const basePages: Dict["pages"] = {
  common: {
    checkNote: CHECK,
    appleStores: "店舗目録",
    showOnMap: "地図で位置を見る",
    restockLogs: "再入荷の記録",
    fullLog: "記録をすべて開く →",
    restocksBy: "構成ごとの再入荷",
    lastDays: (days: number) => `${N(days)}日間の再入荷カレンダー`,
    nearbyCities: "足をのばせるほかの都市",
    neighboringStates: "隣り合う地域",
    acrossStateLine: "州境のすぐ先",
    allUsRestocks: "記録した米国の再入荷すべて",
    allRestocksIn: (cc: CountryCode) => `記録した${country(cc)}の再入荷すべて`,
    regionRestocks: (place: string) => `${place}の再入荷記録`,
    onTheMap: (place: string) => `地図で見る：${place}`,
    allOf: (place: string) => `${place}の概要`,
    allOfArrow: (place: string) => `${place}の記録をすべて →`,
    storeAndCity: (store: string, city: string) => `${city} · ${store}`,
    appleStorePage: (store: string) => `apple.comにある${store}の店舗情報`,
    sourcesWhere: (n: number, cc: CountryCode) => `観測している${country(cc)}のApple Store ${N(n)}店舗`,
    inPlace: (place: string) => place,
    atPlace: (place: string) => place,
    here: "この店舗",
    storesWithIt: "棚に出している店舗",
    whenRestock: (place: string) => `${place}の再入荷のタイミング`,
    duoHours: (place: string) => `${place}で記録したDuo再入荷の時刻`,
    howFast: (place: string) => `${place}で棚に出ていた時間`,
    latestIn: (place: string) => `${place}：記録の新しい順`,
    noneIn: (place: string) => `${place}の記録はまだ何もありません。`,
    faqTitle: (place: string) => `現場の疑問 · ${place}`,
    itemList: (place: string) => `${place}のアップルストア`,
    alertIn: (place: string) => `${place}の店舗を見守る`,
    panelPick: (place: string) => `${place}の見守りリスト：iPhoneを選び、実際に行ける店舗だけを残す`,
    matrixH2: "店舗×モデルの棚",
    matrixHint: "モデルごとに「直近の観測で棚にあり / 見守りの対象」。",
    matrixLabel: "店舗ごとの棚",
    cityPage: "都市の概要 ↗",
    storePage: "店舗の概要 ↗",
    since: "2026年11月2日",
  },
  home: {
    storesWith: (short: string) => `${short}を出している店舗`,
    restocks24: "再入荷 · 直近24時間",
    week: (n: number) => ` · 1週間で${N(n)}`,
    lastCheck: "直近の観測",
    more: (n: number) => `ほか${N(n)}件`,
    latest: (short: string) => `記録に入った${short}の再入荷（新しい順）`,
    none: (short: string) => `${short}の再入荷はまだ記録されていません。`,
    allRestocks: "再入荷の記録をすべて",
    modelMap: (short: string) => `地図：${short}`,
    buy: "apple.comで注文",
    liveStock: (short: string) => `きょうの${short}の棚`,
    live: "リアルタイム",
    alsoTracking: "台帳にはほかに：",
    liveMap: "棚マップ",
    allStores: "店舗目録",
    questions: "現場の疑問",
  },
  region: {
    counts: (stores: number, cities: number) => `${N(cities)}都市 · Apple Store ${N(stores)}店舗 · ${CHECK}`,
    nearbyOutside: (place: string) => `${place}の境を越えて近い店舗`,
    nearbyHint: (place: string) => `距離は、${place}の店舗が集まるあたりの中心から測っています。`,
    beyond: (place: string) => `${place}の外側`,
    everyStore: (place: string) => `${place}の店舗リスト`,
    nearestRegions: (cc: CountryCode) => `${country(cc)}でいちばん近い${regionOf(cc)}`,
  },
  city: {
    counts: (stores: number) => `Apple Store ${N(stores)}店舗 · ${CHECK}`,
    storeHeading: (name: string) => apple(name),
    details: "住所と開店時間",
    outside: (place: string) => `${place}を出てすぐの店舗`,
    outsideRegion: (region: string) => `${region}のすぐ外`,
    around: (place: string) => `${place}とその周り`,
    otherCities: (region: string) => `${region}の別の都市`,
  },
  store: {
    description: (a: { place: string; street: string; city: string; where: string; duo: number; pro: number; pm: number }) => [
      `${a.place}（${a.city}${a.street ? `・${a.street}` : ""}）のiPhone在庫：いま店頭受け取りできるのはDuo ${N(a.duo)}構成、18 Pro ${N(a.pro)}構成、Pro Max ${N(a.pm)}構成。本日の営業時間、入荷時間、近くの店舗も。`,
      `${a.place}（${a.where}）のiPhone在庫：Duo ${N(a.duo)}構成、18 Pro ${N(a.pro)}構成、Pro Max ${N(a.pm)}構成が受け取り可能。本日の営業時間と入荷時間も。`,
      `${a.place}（${a.city}）：Duo ${N(a.duo)}・18 Pro ${N(a.pro)}・Pro Max ${N(a.pm)}構成の在庫、営業時間、入荷。`,
    ],
    where: (city: string, cc: CountryCode) => `${country(cc)}・${city}`,
    taxQ: (place: string) => `${place}でiPhone Duoを買うと、税を含めていくらになる？`,
    pickupQ: (place: string) => `${place}はapple.comの受け取り注文を渡してくれますか？`,
    pickupA: (place: string) => `はい。apple.comの手続きで店舗受け取りと${place}を選び、Appleから準備完了の連絡が来てから出かけます。カウンターでは注文番号、公的な写真付き身分証、表示中のQRコードかWalletのパスを見せます（スクリーンショットは受け付けられません）。`,
    /** 「銀座」→「アップルストア銀座」：人が検索する呼び方（名前の慣用形なので変えない）。 */
    storeWord: (name: string) => (/^apple\b/i.test(name) ? name.replace(/^apple\s*/i, "アップルストア") : `アップルストア${name}`),
    hoursH2: (storeWord: string) => `${storeWord}：開店時間・所在地・受け取りの流れ`,
    hoursLead: (place: string, address: string, phone: string | undefined, today: string, week: string) => `${place}があるのは${address}${phone ? `（電話 ${phone}）` : ""}。きょうは${today}、1週間の開店時間は${week}。`,
    pickupRules: (helpUrl: string) => [
      `**Appleの準備完了メッセージが届いてから出かける**。先に行っても渡してもらえません（[Appleの受け取りのルール](${helpUrl})）`,
      "**カウンターで見せるもの：**注文番号 · 公的な写真付き身分証 · 表示中のQRコードかWalletのパス",
      "**受け付けられないもの：**コードのスクリーンショット",
      "**ほかの人に頼むなら：**手続きの途中でその人を受け取り担当として登録",
    ],
    directions: (place: string, dirUrl: string, appleUrl?: string) => `[${place}までの道順](${dirUrl})${appleUrl ? ` · [apple.comにあるこの店舗の情報](${appleUrl})` : ""}`,
    onlyH2: (where: string, place: string) => `${where}のApple Storeは${place}ひとつだけ`,
    onlyInCountry: (place: string, cc: CountryCode) => `${country(cc)}にApple Storeは${place}しかなく、国内の店頭受け取りはすべてここに集まります。ある構成が棚に出ても、代わりに当たれる店舗はありません。その構成を見守っておくことが、ほぼ唯一の手です。`,
    onlyInCity: (city: string, place: string, backups: string) => `${city}にあるApple Storeは${place}だけです。${backups ? `控えの候補は${backups}。` : ""}`,
    backup: (appleName: string, city: string, dist: string) => `${appleName}（${dist}・${city}）`,
    onlyBlockCountry: (place: string) => `見守り1件が見るのは1店舗・1構成。${place}で受け取れる状態になったと確かめた時点で、プッシュ通知を送ります。`,
    onlyBlock: (place: string) => `${place}に欲しい構成が出ないときは、これらの店舗も見守りに加える価値があります。見守り1件につき1店舗・1構成を見て、受け取れる状態を確かめた時点でプッシュ通知を送ります。`,
    intro: (a: { place: string; street: string; duo: number; duoOf: number; pro: number; proOf: number; pm: number; pmOf: number; peak: string | null }) => (
      <>{a.place}{a.street ? `（${a.street}）` : ""}の棚には、いまiPhone Duoが<b className="text-ink">{N(a.duo)}/{N(a.duoOf)}構成</b>、iPhone 18 Proが<b className="text-ink">{N(a.pro)}/{N(a.proOf)}</b>、iPhone 18 Pro Maxが<b className="text-ink">{N(a.pm)}/{N(a.pmOf)}</b>。{a.peak ? <>再入荷は店舗時刻の<b className="text-ink">{a.peak}</b>前後に記録されることが多い店舗です。</> : null}</>
    ),
    restocks30: (n: number) => `30日間に記録した再入荷 ${N(n)}回`,
    lookupOff: "この店舗について、Appleはいま受け取り照会に答えていません。台帳は30分ごとに問い合わせ直し、答えが戻りしだい棚の状況を埋めます。",
    checked: "観測",
    alertHere: (short: string) => `この店舗で${short}を見守る`,
    panel: (name: string) => `${apple(name)}の見守りリスト：iPhoneを選び、この店舗に加えて行ける控えの店舗も`,
    configsInStock: "棚にある構成",
    stockNowH2: "いまの受け取りの棚",
    whenRestock: (name: string) => `${apple(name)}の再入荷のタイミング`,
    duoHours: (name: string) => `${apple(name)}で記録したDuo再入荷の時刻`,
    howFast: (name: string) => `${apple(name)}で棚に出ていた時間`,
    history: "再入荷ログ",
    historyEmpty: "この店舗の記録には、再入荷も棚から消えた出来事もまだありません。",
    nearby: "控えの店舗",
    elsewhereIn: (region: string) => `${region}のその他`,
    faqTitle: (place: string) => `現場の疑問 · ${place}`,
    applePage: (place: string) => `apple.comの${place}：開店時間とセッション`,
    sourcesWhere: (n: number, cc: CountryCode) => `${country(cc)}にあるApple Store${n === 1 ? "" : ` ${N(n)}店舗`}`,
    around: (place: string) => `${place}から足をのばすなら`,
    otherInCity: (city: string) => `同じ${city}にある別の店舗`,
    cityPage: (city: string) => `${city}の概要`,
    moreIn: (region: string) => `${region}のさらに別の店舗`,
    everyIn: (cc: CountryCode) => `${country(cc)}の目録の残り`,
    allIn: (cc: CountryCode) => `${country(cc)}の店舗目録（全店）`,
    countryHome: (cc: CountryCode) => `${country(cc)}の概要`,
    footnote: "棚の状況は、直近の観測時点でapple.comの店頭受け取りが返した答えを写したものです。",
    footnoteIntl: (cc: CountryCode) => `金額は${COUNTRIES[cc].currency === "JPY" ? "日本円" : COUNTRIES[cc].currency}、距離はキロメートルで表示。この台帳は行政機関とも販売店とも関係のない独立した記録です。`,
  },
};

export const pages: Dict["pages"] = withShelfPages("ja", basePages);
