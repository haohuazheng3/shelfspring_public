import { withShelfContent } from "@/lib/seo/localizedCopy";
/**
 * 日本語: content — SEO の部品（FAQ、関連リンク、数値の帯、製品ページの部品、出典、ライブ部品）、enrich の補助
 * （開店時間、所要時間、FAQ の答え、タイトル）、ライブ {{tokens}}、再入荷パターンの一文、写真の代替テキスト。
 * 観測台帳の口調：restock＝再入荷、在庫状態＝棚にあり／棚になし、チェック＝観測・確認。タイトル（titles）は検索向けのため据え置き。
 * 数値・所要時間・店舗名・都市名・カラー名は日本語に整形済みで届く。機種名、容量、Apple Store、ShelfSpring、apple.com は訳さない。
 * チェック間隔は 15 秒と 5 秒のみ。
 */
import type { ReactNode } from "react";
import type { Forms } from "@/lib/i18n/format";
import type { Dict } from "../en";

const f = (x: Forms): Forms => x;

type Kind = "state" | "city" | "store" | "model";

const baseContent: Dict["content"] = {
  hours: {
    closed: "閉店日",
    everyDay: (hours: string) => `毎日${hours}`,
    tomorrow: "明日",
    /** 曜日は「日」のような一文字で届く：「日曜11:00」。 */
    dayAt: (day: string, time: string) => `${day.length === 1 ? `${day}曜` : day}${time}`,
    closedTodayOpens: (next: string) => `きょうは閉店日 · 次は${next}から`,
    closedToday: "きょうは終日閉店",
    opensAt: (time: string) => `${time}に開店`,
    openNow: (closes: string) => `${closes}まで開いています`,
    closedNowOpens: (next: string) => `いまは閉店中 · 次は${next}から`,
    closedNow: "いまは閉店中",
  },

  duration: {
    underAMinute: "1分に満たない",
    pair: (a: string, b: string) => `${a}${b}`,
  },
  listMore: (n: string) => `ほか${n}件`,
  nearLine: (place: string, distance: string) => `${place}（${distance}）`,

  faq: {
    /** 文の主題として使う：「Apple 銀座では」「東京では」「iPhone Duoは」。 */
    where: (kind: Kind, place: string) => (kind === "model" ? `${place}は` : `${place}では`),
    nRestocks: f({ other: "確認済みの再入荷#回" }),
    restockA: ({ count, where, days, week, peak }: { count: string | null; where: string; days: string; week: string; peak: { hour: string; day: string | null } | null }) =>
      `${count == null ? `${days}日分の台帳を見ても、${where}再入荷が一度もありません` : `${days}日分の台帳に、${where}${count}（今週分は${week}回）`}${peak ? `。記録は店舗時刻の${peak.hour}前後に集まり${peak.day ? `、曜日では${peak.day}がいちばん多め` : ""}` : ""}。なお、Appleは納品の予定を公開していません。`,
    lastsNone: (where: string) => `${where}再入荷から棚が空になるまでを追えた記録がまだ少なく、時間を出せません。`,
    lasts: (days: string, duration: string) => `${days}日分の台帳で、再入荷してから次に棚から消えるまでの中央値はおよそ${duration}。`,
    storeIn: (store: string, line: string) => `${store} · ${line}`,
    nearestA: (stores: string) => `近い代わりの候補：${stores}。`,

    modelStockQ: (model: string) => `${model}は、いまどこの棚にありますか？`,
    modelStockNone: (model: string) => `直近の観測ではどこにもありません。米国のApple Storeが${model}を受け取り用に出せば、このページの一覧に加わります。`,
    nUsStores: f({ other: "米国の#店舗" }),
    modelStockSome: (count: string) => `直近の観測では${count}。下に店舗ごとの名前と、棚に出ている構成を載せています。`,
    priceQ: (model: string) => `apple.comでの${model}の値段は？`,
    priceA: (low: string, high: string, storages: string, colors: string) => `SIMフリーの定価はストレージ（${storages}）によって${low}から${high}まで。色は${colors}。`,
    modelRestockQ: (model: string) => `${model}はどのくらいの間隔で棚に戻りますか？`,
    modelLastsQ: (model: string) => `棚に戻った${model}は、どれくらい出たままですか？`,
    reserveQ: (model: string) => `注文する前に${model}を取り置いてもらえますか？`,
    reserveA: "注文の前には取り置けません。店舗の棚にその構成が出たら、apple.comで店頭受け取りを選んで注文し、そこで初めて受け取り時間帯のぶんが確保されます。",

    storeStockQ: (store: string, model: string) => `${model}は${store}の棚にありますか？`,
    nConfigs: f({ other: "#構成" }),
    storeStockYes: (count: string) => `あります。直近の観測で${count}。ストレージと色はこのページの表に出ています。`,
    storeStockNo: (other: { pro: string; proMax: string } | null) => `直近の観測ではありません${other ? `。この店舗の棚には、iPhone 18 Proが${other.pro}構成、18 Pro Maxが${other.proMax}構成出ています` : `。18 Proと18 Pro Maxも棚になしです`}。`,
    hoursQ: (store: string) => `${store}は何時から何時まで開いていますか？`,
    hoursA: ({ hours, today, address, phone }: { hours: string | null; today: string | null; address: string; phone: string | null }) =>
      `${hours ?? "開店時間はこのページに載せています"}${today ? `（きょうは${today}）` : ""}。場所は${address}${phone ? `、電話は${phone}` : ""}。`,
    storeRestockQ: (store: string) => `${store}では、iPhoneはどのくらいの間隔で棚に戻りますか？`,
    storeLastsQ: (store: string) => `${store}で戻った分は、どれくらい棚に出たままですか？`,
    storeNearestQ: (store: string) => `${store}から近いほかのApple Storeはどこ？`,

    placeStockQ: (place: string, model: string) => `${place}で、いま${model}が棚にあるApple Storeは？`,
    placeStockNone: (place: string, model: string) => `直近の観測ではゼロ。${place}のどこかの店舗が${model}を受け取り用に出したとたん、このページに出ます。`,
    nStores: f({ other: "#店舗" }),
    placeStockSome: (count: string, stores: string) => `直近の観測では${count}：${stores}。`,
    countQ: (place: string) => `${place}にはApple Storeがいくつありますか？`,
    nAppleStores: f({ other: "#店舗" }),
    countMany: (count: string, stores: string) => `${count}。たとえば${stores}。`,
    countOne: (count: string, store: string) => `${count}だけで、${store}がそれにあたります。`,
    placeRestockQ: (place: string) => `${place}では、iPhoneはどのくらいの間隔で棚に戻りますか？`,
    placeLastsQ: (place: string) => `${place}で戻った分は、どれくらい持ちますか？`,
    placeNearestQ: (place: string) => `${place}の外で近いApple Storeはどこ？`,
  },

  explainer: (kind: Kind, place: string) => {
    const at = kind === "store" ? place : kind === "model" ? "米国のApple Store全店" : `${place}のApple Store`;
    return [
      "受け取り用の在庫はapple.comのものです。手続きで構成と店舗を選び、支払いはオンライン、受け取りは店頭で、同じ日に受け取れることもよくあります。ふらりと店で買える在庫や、携帯キャリアの在庫とは別に管理されています。",
      `ShelfSpringは、${at}で追っている構成のひとつひとつを、同期された在庫データから記録しています。変化が台帳に入るのは、それを裏づける観測がもう一度あってからです。`,
      "裏づけの取れた変化はそれぞれ台帳の1行になり、その行がこのページの再入荷グラフと履歴を描いています。",
    ];
  },
  alertRule: "見守り1件が見るのは、ひとつの店舗とひとつの構成だけ。通知は同期のあとに検出した在庫にもとづいて届くので、注文の成否はAppleで確かめてください。",

  titles: {
    state: (name: string, duoNow: string, stores: string) => [
      `${name}のアップルストア：${stores}店舗中${duoNow}店舗にiPhone Duoの在庫`,
      `${name}のアップルストア｜iPhone Duoの受け取り在庫をライブ確認`,
      `${name}のアップルストア｜iPhone Duoの在庫`,
      `${name}のアップルストア｜iPhone在庫`,
    ],
    city: (city: string, code: string, duoNow: string, stores: string) => [
      `${city}（${code}）のアップルストア：${stores}店舗中${duoNow}店舗にiPhone Duo`,
      `${city}（${code}）のアップルストア｜iPhone Duoの受け取り在庫`,
      `${city}（${code}）のアップルストア｜iPhone Duoの在庫`,
      `${city}のアップルストア｜iPhone在庫`,
    ],
    store: (name: string, region: string | null) => {
      const r = region ? `（${region}）` : "";
      return [
        `${name}${r}：iPhone在庫・店頭受け取り・営業時間`,
        `${name}${r}：iPhoneの在庫と営業時間`,
        `${name}${r}：iPhone在庫`,
        `${name}：iPhone在庫・店頭受け取り・営業時間`,
        `${name}：iPhoneの在庫と営業時間`,
        `${name}：iPhone在庫`,
        `${name}｜在庫`,
      ];
    },
    model: (name: string, storesNow: string) => [
      `${name}の受け取り在庫：いま${storesNow}店舗のアップルストアに在庫あり`,
      `${name}の受け取り在庫：${storesNow}店舗に在庫あり`,
      `${name}の店頭受け取り在庫をライブ確認`,
    ],
  },

  tokens: {
    tooFewToMeasure: "まだ測れる段階にありません",
    noneLoggedYet: "台帳にまだ記録なし",
    noneYet: "まだ記録なし",
  },

  pattern: {
    none: (days: string) => `${days}日分の台帳に、確認済みの再入荷はひとつもありません。`,
    nConfirmed: f({ other: "確認済みの再入荷#回" }),
    countIn: (count: string, days: string) => `${days}日間で${count}`,
    stay: (minutes: string) => `、棚にあった時間の中央値はおよそ${minutes}分`,
    nDays: f({ other: "#日" }),
    tooFew: (count: string, onDays: string | null, stay: string) => `${count}${onDays ? `（どれも${onDays}のうち）` : ""}${stay}。よくある時刻を挙げるには、記録のある日がまだ足りません。`,
    usual: (hour: string, weekday: string | null, count: string, stay: string) => `再入荷の記録は店舗時刻の${hour}前後に集まり${weekday ? `、曜日では${weekday}がいちばん多め` : ""}。${count}${stay}。`,
  },

  regionNouns: {
    state: f({ other: "州" }),
    province: f({ other: "州" }),
    area: f({ other: "エリア" }),
    department: f({ other: "県" }),
    prefecture: f({ other: "都道府県" }),
    emirate: f({ other: "首長国" }),
    canton: f({ other: "州" }),
    region: f({ other: "地域" }),
    county: f({ other: "県" }),
    city: f({ other: "都市" }),
  } as Record<string, Forms>,

  measured: "記録の取り方",

  faqTitle: "よく届く質問",
  breadcrumb: "ページの道筋",
  keepExploring: "台帳のほかのページ",
  browse: {
    storesByState: "州ごとにたどる",
    allStatesCities: "州と都市をすべて見る →",
    liveByModel: "iPhoneごとの棚の状況",
    modelStock: (model: string) => `${model}の棚`,
    thisPage: "いま見ているページ",
    restockLog: (short: string) => `${short}の再入荷台帳`,
    liveMap: "地図で見る",
    mostStores: "店舗の多い地域",
    allStates: "州をすべて",
    bigCities: "大きな都市",
    cities: "店舗のある都市",
    storesBy: (region: string) => `${region}ごとにたどる`,
    allStoresIn: ({ country }: { inName: string; country: string }) => <>{country}の店舗目録（全店） →</>,
    allRegions: (regions: string) => `${regions}の一覧をすべて`,
  },
  modelCards: "モデルごと",
  narrative: {
    lastRestock: (config: ReactNode, at: ReactNode, ago: ReactNode) => <>台帳に入った最後の再入荷は{config}{at}、{ago}。</>,
    at: (store: ReactNode) => <>・{store}</>,
  },
  statStrip: {
    inStockNow: "いま棚にあり",
    ofStores: (n: string) => `全${n}店舗のうち`,
    stores: "場所",
    nCities: f({ other: "#都市にまたがる" }),
    tracked: "台帳で追跡中",
    modelNow: (short: string) => `${short}が棚に`,
    configsInStock: "棚にある構成",
    storesWithStock: f({ other: "棚に出している店舗" }),
    restocks24h: "再入荷 · 24時間",
    restocksHint: (week: string, month: string, days: string) => `7日：${week} · ${days}日：${month}`,
    sellOuts: (days: string) => `ふたたび棚から消えた（${days}日）`,
    stays: (duration: string) => `棚にあった時間の中央値 約${duration}`,
    noPairs: "追い切れた記録なし",
    lastRestock: "いちばん新しい再入荷",
    noneYet: "まだ記録なし",
    inLastDays: (days: string) => `${days}日以内`,
  },
  product: {
    chooseIphone: "モデルを選ぶ",
    storage: "ストレージ",
    color: "色",
    all: "指定なし",
    numbersAre: (unit: ReactNode) => <>数字は、いま棚に出している{unit}の数。</>,
    seen: (ago: ReactNode) => <>記録 {ago} · 棚にあり</>,
    last: (ago: ReactNode) => <>最後に棚で確認 {ago} · いまは棚になし</>,
    notSeenYet: "まだ棚に並んだ記録なし",
    firstCheckPending: "初回観測待ち",
    inStock: "棚にあり",
    inStockLower: "棚にあり",
    none: "棚になし",
    here: "すぐそこ",
    notAvailable: "棚になし",
    notCheckedYet: "まだ観測なし",
    availableForPickup: "受け取り用に出ています",
    since: (ago: ReactNode) => <> · 初めての記録 {ago}</>,
    lastInStock: (ago: ReactNode) => <>最後に棚で確認 {ago}</>,
    neverSeen: "この店舗の棚ではまだ記録なし",
    firstCheckSoon: "まもなく初回の観測",
    buy: "apple.comで注文",
    checked: (checked: ReactNode, note: ReactNode) => <>観測 {checked} · {note}</>,
    checkNote: "棚の状況はこまめに更新",
  },

  source: (source: ReactNode) => <>データ：{source}</>,
  photoCredit: (link: ReactNode) => <>画像：{link}</>,
  sources: "参照した資料",
  allUsStores: "米国のApple Store 269店舗すべて",
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>{where}についてShelfSpringがつけている在庫の記録です。履歴が始まるのは{since}、数字を更新したのは{asOf}。条件に合う在庫を検出してから通知を送り、元データの確認・同期・配信のそれぞれで遅れが出ることがあります。履歴の開始日はデータの範囲を表すもので、ShelfSpringの開設日ではありません。</>,
  live: {
    configsCaption: (stores: ReactNode, model: ReactNode) => <>{model}：この観測で、{stores}店舗のApple Storeのうち各構成を出している店舗の数</>,
    storage: "ストレージ",
    pricesCaption: (model: ReactNode) => <>apple.comでの{model}：SIMフリーの税抜定価と、いま棚に出している店舗</>,
    price: "定価",
    bestColor: "いちばん多く出ている色（店舗数）",
    noRestock: (model: string) => `台帳には、${model}の再入荷がまだありません。`,
    clockLabel: (model: string) => `米国の店舗全体での${model}`,
    storesWithIt: "棚に出している店舗",
    pairsInStock: "棚にある店舗×構成の組",
    restocksLogged: "台帳に入った再入荷",
    medianTime: "棚にあった時間の中央値",
    underOneMin: (min: string) => `< ${min}`,
  },

  photos: {
    "apple-store-pickup-counter": { alt: "Apple Storeの木のカウンターと、その上に掲げられた「Pickup」の文字", caption: "受け取り注文の品物は、このようなカウンター越しに渡されます。" },
    "phone-map": { alt: "屋外で地図アプリを開いたスマートフォンを片手で操作している様子", caption: "棚に出ていた時間が1分ほどなら、店までの道のりの長さが結果を左右します。" },
    "phone-card-payment": { alt: "片手にiPhone、もう片手にクレジットカードを持ってオンライン決済をする女性", caption: "受け取り注文の支払いは、来店前にオンラインで済ませます。" },
    "phone-on-box": { alt: "白い化粧箱の上に置かれた、開けたばかりのスマートフォン", caption: "開封したての新しいiPhone。" },
    "city-map-phone": { alt: "二人でひとつのスマートフォンをのぞき込み、街の地図を確かめている", caption: "店までの道を出発前に確かめる。" },
    "phone-notification": { alt: "ロック画面に通知が出ているスマートフォンを握る手", caption: "見守りの通知はロック画面に表示されます。" },
    "apple-store-crowd-inside": { alt: "ショッピングモールの中、大勢の客でにぎわうApple Store", caption: "発売直後の週の店内。棚に戻った在庫は、ここでは数分ともちません。" },
    "apple-store-glass-canopy": { alt: "木のひさしを備えたガラス張りのApple Store、夜の外観", caption: "夜のガラス張りの店舗。" },
    "apple-store-night-vancouver": { alt: "夜のバンクーバー、灯りのともったApple Store", caption: "夜の店舗。受け取り用の在庫は何時に出てもおかしくありませんが、台帳では朝のほうがずっと多く記録されています。" },
    "phone-hand-camera": { alt: "カメラが3つ並んだiPhoneを手にしている人", caption: "列ができやすいのはProのモデルです。" },
    "place-jp-japan": { alt: "よく晴れた日の新倉山浅間公園、手前に忠霊塔、奥に富士山", caption: "山梨県の忠霊塔と富士山。" },
    "place-jp-tokyo": { alt: "青空のもと、空から見下ろした東京の街並みと東京スカイツリー", caption: "空から見た東京、中央にスカイツリー。" },
    "place-jp-osaka": { alt: "大阪・道頓堀、運河に沿って派手な看板が連なる通り", caption: "大阪の道頓堀。" },
  },
};

export const content: Dict["content"] = withShelfContent("ja", baseContent);
