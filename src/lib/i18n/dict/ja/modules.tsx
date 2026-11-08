/**
 * 日本語: modules — 入荷・店舗・在庫のモジュール（src/components/{restocks,stores,stock}）。
 * `label` は場所を表す名詞句（「東京」「Apple 銀座」「この店舗」「日本」）で届く。助詞はこちらで付ける。
 * 数値は生の値で届くので num() で整形する。所要時間・時刻・日付・割合は整形済み。チェック間隔は15秒と5秒のみ。
 */
import type { ReactNode } from "react";
import { num } from "@/lib/i18n/format";
import type { Dict } from "../en";

const N = (n: number) => num("ja", n);
/** 「日」→「日曜」、それ以外（「明日」など）はそのまま。 */
const dayWord = (day: string) => (day.length === 1 ? `${day}曜` : day);

export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `過去${N(days)}日間、${label}の入荷・完売の記録はありません。最初の記録からグラフが埋まっていきます。`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `過去${N(days)}日間の${label}：入荷${N(restocks)}回・完売${N(soldouts)}回、記録のあった日は${N(activeDays)}日。`,
    busiest: (day: string, restocks: number) => <>最も多かったのは<b className="text-ink">{day}</b>の{N(restocks)}回です。</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day}：入荷${N(restocks)}回、完売${N(soldouts)}回`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day}：入荷${N(restocks)}回 · 完売${N(soldouts)}回`,
    legendRestocks: "入荷",
    legendSoldouts: "完売",
  },

  last24: {
    title: (label: string) => `${label}のiPhone Duo入荷：過去24時間`,
    asOf: (when: string) => `${when}時点`,
    localTime: (when: string) => `現地時間 ${when}`,
    anAppleStore: "アップルストア",
    unknown: "過去24時間の件数をいま読み込めませんでした。このページのライブ在庫と入荷履歴には影響ありません。",
    none: (label: string, asOf: string) => <><b className="text-ink">過去24時間、{label}でiPhone Duoの入荷はありません</b>（{asOf}時点）。</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <>過去24時間で、iPhone Duoは<b className="text-ink">{o.one ? `${o.label}で${N(o.restocks)}回` : `${o.label}のアップルストア${N(o.allStores)}店舗中${N(o.withStores)}店舗で計${N(o.restocks)}回`}</b>入荷しました。最新は<b className="text-ink">{o.config}</b>{o.store != null && <>（{o.store}）</>}、現地時間{o.when}です。</>
    ),
    tileRestocks: "確認済みの入荷 · 24時間",
    tileConfigsBack: "再入荷した構成",
    tileStores: (configs: number, allConfigs: number) => `入荷のあった店舗${configs ? ` · ${N(allConfigs)}構成中${N(configs)}構成` : ""}`,
    tileLatest: (config: string, store: string | null) => <>最新 · {config}{store != null && <> · {store}</>}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>その前の入荷 · {config}{store != null && <> · {store}</>} · {day}</>,
    tileNoEarlier: "それ以前の入荷記録なし",
    caption: (label: string, asOf: string) => `${label}のiPhone Duo、構成別の確認済み入荷（過去24時間・${asOf}時点）`,
    thConfig: "構成",
    thRestocks: "入荷",
    thStores: "店舗",
    thLast: "最新の入荷（現地時間）",
    thNow: "現在の在庫",
    ofStores: (n: number, total: number) => `${N(total)}店舗中${N(n)}`,
    noneIn24: "24時間なし",
    yes: "あり",
    no: "なし",
    countedTitle: "入荷のカウント方法",
    counted: "再入荷1回は、1店舗の1構成が在庫なしからありに変わり、確認された記録です。同じ構成の再登場は別の記録で、端末台数ではありません。 在庫一覧は前回確認時の状況です。履歴は在庫が戻った場所を示し、次の配送時刻を予測するものではありません。",
    alert: (label: string | null) => `スマートフォンで入荷通知を受け取る設定${label ? ` · ${label}` : ""}`,
  },

  clock: {
    none: (label: string, days: number) => `過去${N(days)}日間、${label}の入荷記録はまだありません。`,
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `過去${N(days)}日間の${label}の入荷は${N(total)}回${dates != null ? `（${N(dates)}日間）` : ""}。傾向を判断するにはまだ少なすぎます。`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>過去{N(days)}日間の{label}の入荷は{N(total)}回。多くは現地時間の<b className="text-ink">{hour}</b>ごろ{day ? <>で、最も多い曜日は<b className="text-ink">{day}</b></> : null}です。</>
    ),
    byHour: (zone: string) => `時間帯別 · ${zone}`,
    byWeekday: "曜日別",
    barReported: (n: number) => `（他サイトの報告 +${N(n)}）`,
    barReportedTitle: (bar: string, n: number) => `${bar}：他サイトの報告 ${N(n)}件`,
    legendOurs: "記録された再入荷",
  },

  feed: {
    empty: "入荷の記録はまだありません。",
    available: "在庫あり",
    soldOut: "在庫切れ",
    soldOutAt: (time: ReactNode) => <>{time}に完売</>,
    since: (time: ReactNode) => <>{time}から</>,
    restockedAt: (time: ReactNode) => <>{time}に入荷</>,
    mapAria: (store: string) => `${store}を地図で表示`,
    map: "地図",
    buyAria: (model: string, config: string) => `apple.comで${model} ${config}を購入`,
    buy: "apple.comで購入",
  },

  byConfig: {
    empty: (label: string, days: number) => `過去${N(days)}日間、${label}で入荷した構成はないため、ランキングはまだありません。`,
    intro: (label: string, days: number) => `過去${N(days)}日間に${label}で入荷した構成を、多い順に。`,
    times: (n: number) => `${N(n)}回`,
    alert: "入荷通知",
  },

  sellout: {
    typical: (label: string, band: string) => `${label}のiPhone Duoの入荷は、通常約${band}で完売しました。`,
    half: (label: string, duration: string) => `${label}の入荷の半数は、${duration}以内に完売しました。`,
    none: (label: string, days: number) => `過去${N(days)}日間、${label}で完売した入荷はまだありません。`,
    whatDuo: "iPhone Duo",
    whatAll: "全iPhone",
    tileHalf: (what: string) => <>半数が完売するまで · {what}</>,
    tileWithin30: "30秒以内に完売",
    tileWithin60: "1分以内に完売",
    tileFastest: (n: number, days: number) => <>最速 · 完売した入荷{N(n)}回・{N(days)}日間</>,
    caption: (days: number) => `iPhone別、過去${N(days)}日間`,
    thIphone: "iPhone",
    thSoldOut: "完売",
    thHalf: "半数が完売",
    thWithin30: "≤ 30秒",
    thWithin60: "≤ 1分",
    thFastest: "最速",
    each: "入荷ごとの記録",
    barNote: (full: string) => `バー＝在庫があった秒数 · ${full}で最大`,
    stillListed: (duration: string) => `在庫あり継続中 · ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "測定方法",
    measured: (_estimated: boolean) => { void _estimated; return "掲載時間は、最後に在庫ありを確認した時点と最初に在庫なしを確認した時点の間で測ります。≈は推定区間です。確認間隔より短い掲載は見逃すことがあり、注文できる時間の保証ではありません。"; },
  },

  configTable: {
    title: "この店舗の全構成",
    titleAt: (store: string) => `${store}の全構成`,
    lookupOff: (hasRows: boolean) => `現在、この店舗ではAppleが店頭受け取りの在庫照会を提供していません${hasRows ? "（以下は最後に得られた回答です）" : ""}`,
    tracked: (n: number) => `${N(n)}構成をチェック中`,
    firstSweep: "初回チェック中：1分以内に状況が表示されます",
    inStock: (n: number, total: number) => `${N(total)}構成中${N(n)}構成に在庫`,
    available: "受け取り可能",
    unavailable: "受け取り不可",
    noLookup: "在庫照会なし",
    notChecked: "未チェック",
    since: (ago: ReactNode) => <>{ago}から</>,
    lastAvailable: (ago: ReactNode) => <>最後の在庫：{ago}</>,
    neverHere: "この店舗では在庫を確認したことがありません",
    buy: "購入",
    alertAria: (model: string, config: string, store: string) => `${store}で${model} ${config}が受け取り可能になったら通知`,
    alert: "通知 →",
  },

  matrix: {
    store: "店舗",
    checked: "チェック",
    cellTitle: (model: string, n: number, total: number) => `${model}：${N(total)}構成中${N(n)}構成が受け取り可能`,
  },

  nearby: {
    duo: (short: string, n: number) => `${short} · ${N(n)}`,
    noDuo: (short: string) => `${short}なし`,
  },

  stockByModel: {
    availableNow: (n: number, total: number) => `いま${N(total)}構成中${N(n)}構成が受け取り可能`,
    noneNow: (total: number) => `現在${N(total)}構成とも在庫なし`,
    lookupOff: "現在、この店舗ではAppleが受け取り在庫の照会を提供していません",
    notChecked: "未チェック",
    more: (n: number) => `+${N(n)}`,
    checked: (ago: ReactNode) => <>{ago}にチェック</>,
    alert: "通知 →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>{ago} · 在庫を定期的に更新</>,
    map: "地図で表示",
    alert: "この店舗で入荷通知",
    alsoIn: (region: string) => `${region}のほかの店舗`,
    acrossLine: "州境の向こうの近い店舗",
    elsewhere: "ほかの近い店舗",
  },

  hours: {
    title: "営業時間",
    local: (zone: string) => `現地時間 · ${zone}`,
    today: (hours: string, week: string) => ` · 本日 ${hours} · ${week}`,
    directions: "経路",
    applePage: "apple.comの店舗ページ",
    liveMap: "在庫マップ",
    storePage: "店舗ページ",
    closed: "休業",
    everyDay: (hours: string) => `毎日 ${hours}`,
    openNow: (closes: string) => `営業中 · ${closes}閉店`,
    opensAt: (opens: string) => `${opens}開店`,
    closedToday: (next: string | null) => (next ? `本日休業 · ${next}に開店` : "本日休業"),
    closedNow: (next: string | null) => (next ? `営業時間外 · ${next}に開店` : "営業時間外"),
    nextOpen: (day: string | null, time: string) => `${day == null ? "明日" : dayWord(day)} ${time}`,
  },

  liveStats: {
    inStock: "現在の在庫",
    storesWith: "在庫のある店舗",
    lastCheck: "最終チェック",
    none: "—",
  },

  board: {
    summary: (n: number, stores: number, short: string) => `${N(stores)}店舗中${N(n)}店舗に${short}の在庫あり`,
    lastCheck: (ago: ReactNode) => <>最終チェック {ago}</>,
    firstSweep: "初回チェック中です。",
    noneListed: (model: string, storage: string | null, color: string | null) => `現在、${model}${storage ? ` ${storage}` : ""}${color ? `（${color}）` : ""}の在庫がある店舗はありません。`,
    more: (n: number) => `+${N(n)}`,
    seen: (ago: ReactNode) => <>{ago}に確認</>,
    loading: "在庫を読み込み中",
  },

  /** DuoLedger：地域・都市・店舗・国・Duo機種ページの冒頭に置く観測台帳。`place` は裸の地名・店名（「東京」「Apple 銀座」）。 */
  duoLedger: {
    kicker: (place: string) => `観測台帳 · iPhone Duo · ${place}`,
    headNone: (o) => `${o.place}のアップルストア${N(o.n)}店舗のどこにも、受け取り可能なiPhone Duoの掲載はありません。`,
    headNoneOne: (place: string) => `${place}には受け取り可能なiPhone Duoの構成が掲載されていません。`,
    headSome: (o) => <>{o.place}のアップルストア{N(o.n)}店舗中{N(o.k)}店舗で、iPhone Duoが受け取り可能として掲載されています：{o.list}。</>,
    headSomeOne: (o) => <>{o.place}では、iPhone Duo全{N(o.total)}構成のうち{N(o.k)}構成が受け取り可能です：{o.list}。</>,
    storeItem: (store: ReactNode, configs: number) => <>{store}（{N(configs)}構成）</>,
    observed: (stamp: string) => `${stamp}に観測。`,
    lastReturn: (o) => <>直近の確認済み再入荷：<b className="text-ink">{o.config}</b>{o.store != null && <>・{o.store}</>}、{o.when}{o.lasted ? <>（{o.lasted}）</> : null}。</>,
    noReturnYet: (place: string, since: string) => `記録を始めた${since}以降、${place}で確認済みのiPhone Duo再入荷はありません。`,
    others: (o) => (o.one ? `iPhone 18 Pro：全${N(o.configs)}構成中${N(o.pro)}構成を掲載 · 18 Pro Max：${N(o.max)}構成。` : `iPhone 18 Pro：${N(o.pro)}店舗に掲載 · 18 Pro Max：${N(o.max)}店舗。`),
    mReturns: (since: string) => `${since}以降の確認済み再入荷`,
    mStores: "再入荷が1回以上あった店舗",
    mDays: "再入荷があった日数（追跡日数中）",
    mWindow: (pct: string) => `最も多い2時間帯 · 記録の${pct}`,
    mPerDay: "追跡1日あたりの再入荷",
    mMedian: "掲載時間の中央値（掲載から消えるまで）",
    mToday: "本日の再入荷（現時点）",
    secUnit: "秒",
    minUnit: "分",
    note: (o) => (o.one
      ? `${o.since}以降、ShelfSpringは${o.place}で確認済みのiPhone Duo再入荷を${N(o.n)}回記録しました（追跡${N(o.tracked)}日のうち${N(o.days)}日）。最も多い2時間帯は${o.range}（記録の${o.pct}、8時〜12時が${o.morning}）、単独で最多の時間帯は${o.busiest}の${N(o.busiestN)}回です。${o.median ? `掲載の半数は${o.median}以内に消えました。` : ""}${o.config ? `最も多く再入荷したのは${o.config}（${N(o.n)}回中${N(o.top)}回）。` : ""}`
      : `${o.since}以降、ShelfSpringは${o.place}のアップルストア${N(o.stores)}店舗で確認済みのiPhone Duo再入荷を${N(o.n)}回記録し、うち${N(o.k)}店舗で1回以上ありました。最も多い2時間帯は${o.range}（${o.zone}、記録の${o.pct}、8時〜12時が${o.morning}）、単独で最多の時間帯は${o.busiest}の${N(o.busiestN)}回です。${o.median ? `掲載の半数は${o.median}以内に消えました。` : ""}${o.config ? `最も多く再入荷したのは${o.config}（${N(o.n)}回中${N(o.top)}回）。` : ""}`),
    noteFew: (o) => `${o.since}以降、${o.one ? o.place : `${o.place}のアップルストア${N(o.stores)}店舗`}で確認済みのiPhone Duo再入荷は${N(o.n)}回（${N(o.days)}日）。ShelfSpringが「よくある時間帯」を示す基準（${N(o.min)}回・${N(o.minDays)}日以上）には達していません。${o.median ? `掲載の半数は${o.median}以内に消えました。` : ""}個々の再入荷は下の台帳にあります。`,
    hourByHour: "時間帯別の記録を開く →",
    ledger: (n: number) => `直近${N(n)}件の再入荷記録`,
    col: { observed: "観測（店舗の現地時間）", config: "構成", store: "店舗", listed: "掲載時間" },
    secs: (n: number) => `${N(n)}秒`,
    mins: (n: number) => `${N(n)}分`,
    listedRange: (low: string, high: string) => `掲載${low}〜${high}`,
    listedAbout: (x: string) => `掲載約${x}`,
    stillListed: (x: string) => `掲載中（${x}）`,
    method: (o) => `${o.since}からの記録 · ${o.note} · 再入荷は連続2回の観測が一致した時点で数えます。構成の初回出現は数えません。`,
    delivered: (o) => (o.one
      ? `過去${N(o.days)}日間に、ShelfSpringは${o.place}の再入荷について会員へ${N(o.sent)}件の通知を届けました。`
      : `過去${N(o.days)}日間に、ShelfSpringは${o.place}のアップルストア${N(o.total)}店舗中${N(o.stores)}店舗の再入荷について会員へ${N(o.sent)}件の通知を届けました。`),
    watch: (place: string) => `${place}の構成を見守る →`,
    watchOne: "この店舗の構成を見守る →",
    unknown: "観測記録をいま読み込めませんでした。上のライブ在庫には影響ありません。",
    zone: () => "現地時間",
    allModels: (o) => `全モデル合計：${N(o.days)}日間で${N(o.n)}回の再入荷${o.peak ? `、最多の時間帯は${o.peak}` : ""}。`,
  },
};
