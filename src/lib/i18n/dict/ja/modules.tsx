/**
 * 日本語: modules — 再入荷・店舗・棚のモジュール（src/components/{restocks,stores,stock}）。
 * `label` は場所を表す名詞句（「東京」「Apple 銀座」「この店舗」「日本」）で届く。助詞はこちらで付ける。
 * 数値は生の値で届くので num() で整形する。所要時間・時刻・日付・割合は整形済み。チェック間隔は15秒と5秒のみ。
 * 語彙（2026-11-08）：観測台帳の口調。restock＝「再入荷」、sell-out＝「棚から消えた」、在庫状態＝「棚にあり／棚になし」、
 * チェック＝「確認」、通知ルール＝「見守り」、現地時間＝「店舗時刻」。行は短く、毎行くり返す言葉は置かない。
 */
import type { ReactNode } from "react";
import { num } from "@/lib/i18n/format";
import type { Dict } from "../en";

const N = (n: number) => num("ja", n);
/** 「日」→「日曜」、それ以外（「明日」など）はそのまま。 */
const dayWord = (day: string) => (day.length === 1 ? `${day}曜` : day);

export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `${label}の観測メモは、この${N(days)}日間白紙のままです（再入荷も、棚から消えた記録もなし）。最初の1件が入るとバーが立ちます。`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `${label}で再入荷が記録されたのは、この${N(days)}日のうち${N(activeDays)}日。合計${N(restocks)}回、棚から消えた記録は${N(soldouts)}回。`,
    busiest: (day: string, restocks: number) => <>ピークは<b className="text-ink">{day}</b>で、その日だけで{N(restocks)}回。</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day} — 再入荷 ${N(restocks)}／棚から消えた ${N(soldouts)}`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day} · 再入荷 ${N(restocks)} · 消えた ${N(soldouts)}`,
    legendRestocks: "再入荷",
    legendSoldouts: "ふたたび棚から消えた",
  },

  last24: {
    title: (label: string) => `直近24時間 · ${label}のiPhone Duo再入荷`,
    asOf: (when: string) => `記録時点 · ${when}`,
    localTime: (when: string) => `${when}（店舗時刻）`,
    anAppleStore: "目録にないApple Store",
    unknown: "24時間の集計はこのリクエストで取得できませんでした。このページの棚の状況と再入荷ログはそのまま有効です。",
    none: (label: string, asOf: string) => <><b className="text-ink">{label}は静かな24時間でした：</b>{asOf}までの記録に、iPhone Duoの再入荷はありません。</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <>いちばん新しい再入荷は<b className="text-ink">{o.config}</b>、店舗時刻で{o.when}{o.store != null && <>（記録地：{o.store}）</>}。<b className="text-ink">{`この24時間の再入荷は${N(o.restocks)}回`}</b>{o.one ? null : <>、{o.label}の{N(o.allStores)}店舗のうち{N(o.withStores)}店舗で記録</>}。</>
    ),
    tileRestocks: "この24時間の再入荷",
    tileConfigsBack: "棚に戻った構成",
    tileStores: (configs: number, allConfigs: number) => `再入荷を記録した店舗${configs ? ` · 構成 ${N(configs)}/${N(allConfigs)}` : ""}`,
    tileLatest: (config: string, store: string | null) => <>いちばん新しい記録 · {store != null && <>{store} · </>}{config}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>ひとつ前の再入荷（{day}） · {store != null && <>{store} · </>}{config}</>,
    tileNoEarlier: "これより前の記録はなし",
    caption: (label: string, asOf: string) => `${asOf}までの24時間に${label}で記録された、iPhone Duoの構成ごとの再入荷`,
    thConfig: "構成",
    thRestocks: "再入荷",
    thStores: "店舗",
    thLast: "いちばん新しい記録（店舗時刻）",
    thNow: "いま棚に",
    ofStores: (n: number, total: number) => `${N(n)}/${N(total)}`,
    noneIn24: "記録なし",
    yes: "棚にあり",
    no: "なし",
    countedTitle: "何を再入荷と数えるか",
    counted: "再入荷とは、ひとつの店舗のひとつの構成が「受け取れない」から「受け取れる」へ変わり、それが確かめられた出来事です。同じ構成が何度戻っても一件ずつ別に記録し、台数は数えません。いまの一覧が示すのは直近の確認時点の棚、履歴が示すのは棚に戻った場所で、次の入荷時刻を予告するものではありません。",
    alert: (label: string | null) => `${label ? `${label}の` : ""}再入荷をスマートフォンで見守る`,
  },

  clock: {
    none: (label: string, days: number) => `この${N(days)}日間、${label}で再入荷は一度も記録されていません。`,
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `${label}で${N(days)}日間に記録された再入荷は${N(total)}回だけ${dates != null ? `（記録のある日付は${N(dates)}日）` : ""}。決まった時刻を挙げるには足りません。`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>{label}でよく再入荷する時刻は、店舗時刻の<b className="text-ink">{hour}</b>台（{N(days)}日間・{N(total)}回の記録から）{day ? <>。曜日では<b className="text-ink">{day}</b>が先頭</> : null}。</>
    ),
    byHour: (zone: string) => `時刻 · ${zone}の時計`,
    byWeekday: "曜日",
    barReported: (n: number) => `（外部の報告 +${N(n)}）`,
    barReportedTitle: (bar: string, n: number) => `${bar}：外部の報告 ${N(n)}件`,
    legendOurs: "台帳に記録した再入荷",
  },

  feed: {
    empty: "再入荷ログはまだ空です。",
    available: "棚にあり",
    soldOut: "棚から消えた",
    soldOutAt: (time: ReactNode) => <>消えた · {time}</>,
    since: (time: ReactNode) => <>再入荷 · {time}</>,
    restockedAt: (time: ReactNode) => <>再入荷 · {time}</>,
    mapAria: (store: string) => `棚マップで${store}の位置を見る`,
    map: "棚マップで位置を見る",
    buyAria: (model: string, config: string) => `${model} ${config}をapple.comで注文`,
    buy: "apple.comで注文",
  },

  byConfig: {
    empty: (label: string, days: number) => `${label}では${N(days)}日間どの構成も戻っていないので、並べるものがありません。`,
    intro: (label: string, days: number) => `${label}の構成を、この${N(days)}日間の再入荷回数で並べた一覧。`,
    times: (n: number) => `再入荷${N(n)}回`,
    alert: "見守る",
  },

  sellout: {
    typical: (label: string, band: string) => `${label}でiPhone Duoが再入荷してから棚にあった時間の中央値は、およそ${band}。`,
    half: (label: string, duration: string) => `${label}で計測できた再入荷のうち半分は、${duration}以内に棚から消えています。`,
    none: (label: string, days: number) => `この${N(days)}日間、${label}で棚から消えた再入荷はまだありません。`,
    whatDuo: "iPhone Duo",
    whatAll: "全モデル",
    tileHalf: (what: string) => <>棚にあった時間の中央値 · {what}</>,
    tileWithin30: "30秒以内に棚から消えた",
    tileWithin60: "1分以内に棚から消えた",
    tileFastest: (n: number, days: number) => <>計測した{N(n)}回（{N(days)}日間）での最短</>,
    caption: (days: number) => `モデルごと · この${N(days)}日間`,
    thIphone: "モデル",
    thSoldOut: "計測数",
    thHalf: "中央値",
    thWithin30: "30秒以内：",
    thWithin60: "1分以内：",
    thFastest: "最短",
    each: "再入荷を1回ずつ",
    barNote: (full: string) => `バーの長さ＝棚にあった時間 · ${full}で端まで`,
    stillListed: (duration: string) => `まだ棚に · ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "棚にあった時間の区切り方",
    measured: (_estimated: boolean) => { void _estimated; return "棚にあった時間は、「受け取れる」と確かめた最後の観測と、「受け取れない」と確かめた最初の観測のあいだで区切ります。≈の付いた行は推定の幅です。確認の間隔より短く棚に出た分は記録から漏れることがあり、ここの時間は注文が間に合う長さを約束するものではありません。"; },
  },

  configTable: {
    title: "構成ごとの棚の確認",
    titleAt: (store: string) => `構成ごとの棚の確認 · ${store}`,
    lookupOff: (hasRows: boolean) => `Appleはこの店舗の受け取り照会を止めています${hasRows ? "。下の行は止まる前の最後の回答です" : ""}`,
    tracked: (n: number) => `記録している構成：${N(n)}`,
    firstSweep: "観測を始めたところです。1分ほどで最初の状態が並びます",
    inStock: (n: number, total: number) => `棚にあり：${N(n)}/${N(total)}`,
    available: "棚にあり",
    unavailable: "棚になし",
    noLookup: "照会停止中",
    notChecked: "初回確認待ち",
    since: (ago: ReactNode) => <>出現 {ago}</>,
    lastAvailable: (ago: ReactNode) => <>最後に棚で確認 {ago}</>,
    neverHere: "ここでは棚に並んだ記録なし",
    buy: "注文",
    alertAria: (model: string, config: string, store: string) => `${store}の${model} ${config}を見守る`,
    alert: "見守る →",
  },

  matrix: {
    store: "場所",
    checked: "直近の確認",
    cellTitle: (model: string, n: number, total: number) => `${model}：棚にある構成 ${N(n)}/${N(total)}`,
  },

  nearby: {
    duo: (short: string, n: number) => `${short} 棚にあり · ${N(n)}`,
    noDuo: (short: string) => `${short} 棚になし`,
  },

  stockByModel: {
    availableNow: (n: number, total: number) => `棚にある構成 ${N(n)}/${N(total)}`,
    noneNow: (total: number) => `棚にあり 0/${N(total)}`,
    lookupOff: "この店舗の受け取り照会はAppleが止めています",
    notChecked: "初回確認待ち",
    more: (n: number) => `ほか${N(n)}件`,
    checked: (ago: ReactNode) => <>直近の確認 {ago}</>,
    alert: "見守る →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>{ago} · 棚の状況はこまめに更新</>,
    map: "棚マップで見る",
    alert: "この店舗を見守る",
    alsoIn: (region: string) => `${region}にある別の店舗`,
    acrossLine: "州境を越えて近い店舗",
    elsewhere: "そのほかで近い店舗",
  },

  hours: {
    title: "開店時間",
    local: (zone: string) => `時刻は${zone}の店舗時刻`,
    today: (hours: string, week: string) => ` · きょうは${hours} · ${week}`,
    directions: "道順を調べる",
    applePage: "Appleの店舗情報",
    liveMap: "棚マップで見る",
    storePage: "店舗の記録",
    closed: "閉店日",
    everyDay: (hours: string) => `毎日${hours}`,
    openNow: (closes: string) => `ただいま開店中 · ${closes}まで`,
    opensAt: (opens: string) => `${opens}に開店`,
    closedToday: (next: string | null) => (next ? `きょうは閉店日 · 次は${next}から` : "きょうは閉店日"),
    closedNow: (next: string | null) => (next ? `いまは閉店中 · 次は${next}から` : "いまは閉店中"),
    nextOpen: (day: string | null, time: string) => `${day == null ? "明日" : dayWord(day)}${time}`,
    span: (opens: string, closes: string) => `${opens}から${closes}まで`,
  },

  liveStats: {
    inStock: "棚にあり",
    storesWith: "棚のある店舗",
    lastCheck: "直近の確認",
    none: "—",
  },

  board: {
    summary: (n: number, stores: number, short: string) => `${short}が棚にある店舗：${N(n)}/${N(stores)}`,
    lastCheck: (ago: ReactNode) => <>直近の確認 {ago}</>,
    firstSweep: "観測を始めたところです。",
    noneListed: (model: string, storage: string | null, color: string | null) => `${model}${storage ? ` ${storage}` : ""}${color ? `・${color}` : ""}は、いまどの店舗の棚にもありません。`,
    more: (n: number) => `ほか${N(n)}件`,
    seen: (ago: ReactNode) => <>記録 {ago}</>,
    loading: "棚を読み取り中",
  },

  /** DuoLedger：地域・都市・店舗・国・Duo機種ページの冒頭に置く観測台帳。`place` は裸の地名・店名（「東京」「Apple 銀座」）。 */
  duoLedger: {
    kicker: (place: string) => `観測台帳 · iPhone Duo · ${place}`,
    headNone: (o) => `${o.place}のApple Store ${N(o.n)}店舗のどこにも、受け取りできるiPhone Duoは出ていません。`,
    headNoneOne: (place: string) => `${place}には、いま受け取りできるiPhone Duoの構成が出ていません。`,
    headSome: (o) => <>{o.place}のApple Store {N(o.n)}店舗のうち{N(o.k)}店舗で、iPhone Duoが受け取りできる状態です：{o.list}。</>,
    headSomeOne: (o) => <>{o.place}で受け取りできるiPhone Duoは、{N(o.total)}構成のうち{N(o.k)}構成：{o.list}。</>,
    storeItem: (store: ReactNode, configs: number) => <>{store}（{N(configs)}構成）</>,
    observed: (stamp: string) => `${stamp}に観測。`,
    lastReturn: (o) => <>直近の確認済み再入荷：<b className="text-ink">{o.config}</b>{o.store != null && <>・{o.store}</>}、{o.when}{o.lasted ? <>（{o.lasted}）</> : null}。</>,
    noReturnYet: (place: string, since: string) => `${since}に記録を開いてから、${place}で確かめられたiPhone Duoの再入荷はまだありません。`,
    others: (o) => (o.one ? `比較のために：この店舗の棚にはiPhone 18 Proが${N(o.configs)}構成のうち${N(o.pro)}、Pro Maxが${N(o.max)}。` : `比較のために：これらの店舗のうちiPhone 18 Proが棚にあるのは${N(o.pro)}店舗、Pro Maxは${N(o.max)}店舗。`),
    mReturns: (since: string) => `${since}以降の確認済み再入荷`,
    mStores: "再入荷が1回以上あった店舗",
    mDays: "再入荷があった日数（追跡日数中）",
    mWindow: (pct: string) => `最も多い2時間帯 · 記録の${pct}`,
    mPerDay: "追跡1日あたりの再入荷",
    mMedian: "棚にあった時間の中央値（出現から消えるまで）",
    mToday: "本日の再入荷（現時点）",
    secUnit: "秒",
    minUnit: "分",
    note: (o) => (o.one
      ? `${o.since}以降、ShelfSpringは${o.place}で確認済みのiPhone Duo再入荷を${N(o.n)}回記録しました（追跡${N(o.tracked)}日のうち${N(o.days)}日）。最も多い2時間帯は${o.range}（記録の${o.pct}、8時〜12時が${o.morning}）、単独で最多の時間帯は${o.busiest}の${N(o.busiestN)}回です。${o.median ? `棚に出た分の半数は${o.median}以内に消えました。` : ""}${o.config ? `最も多く再入荷したのは${o.config}（${N(o.n)}回中${N(o.top)}回）。` : ""}`
      : `${o.since}以降、ShelfSpringは${o.place}のApple Store ${N(o.stores)}店舗で確認済みのiPhone Duo再入荷を${N(o.n)}回記録し、うち${N(o.k)}店舗で1回以上ありました。最も多い2時間帯は${o.range}（${o.zone}、記録の${o.pct}、8時〜12時が${o.morning}）、単独で最多の時間帯は${o.busiest}の${N(o.busiestN)}回です。${o.median ? `棚に出た分の半数は${o.median}以内に消えました。` : ""}${o.config ? `最も多く再入荷したのは${o.config}（${N(o.n)}回中${N(o.top)}回）。` : ""}`),
    noteFew: (o) => `${o.since}以降、${o.one ? o.place : `${o.place}のApple Store ${N(o.stores)}店舗`}で確認済みのiPhone Duo再入荷は${N(o.n)}回（${N(o.days)}日）。ShelfSpringが「よくある時間帯」を示す基準（${N(o.min)}回・${N(o.minDays)}日以上）には達していません。${o.median ? `棚に出た分の半数は${o.median}以内に消えました。` : ""}個々の再入荷は下の台帳にあります。`,
    hourByHour: "時間帯別の記録を開く →",
    ledger: (n: number) => `直近${N(n)}件の再入荷記録`,
    col: { observed: "観測（店舗時刻）", config: "構成", store: "店舗", listed: "棚にあった時間" },
    secs: (n: number) => `${N(n)}秒`,
    mins: (n: number) => `${N(n)}分`,
    listedRange: (low: string, high: string) => `棚に${low}〜${high}`,
    listedAbout: (x: string) => `棚におよそ${x}`,
    stillListed: (x: string) => `いまも棚に（${x}経過）`,
    method: (o) => `${o.since}からの記録 · ${o.note} · 再入荷は連続2回の観測が一致した時点で数えます。構成の初回出現は数えません。`,
    delivered: (o) => (o.one
      ? `過去${N(o.days)}日間に、ShelfSpringは${o.place}の再入荷について会員へ${N(o.sent)}件の通知を届けました。`
      : `過去${N(o.days)}日間に、ShelfSpringは${o.place}のApple Store ${N(o.total)}店舗中${N(o.stores)}店舗の再入荷について会員へ${N(o.sent)}件の通知を届けました。`),
    watch: (place: string) => `${place}の構成を見守る →`,
    watchOne: "この店舗の構成を見守る →",
    unknown: "観測記録をいま読み込めませんでした。上の棚の状況には影響ありません。",
    zone: () => "店舗時刻",
    allModels: (o) => `全モデル合計：${N(o.days)}日間で${N(o.n)}回の再入荷${o.peak ? `、最多の時間帯は${o.peak}` : ""}。`,
  },
};
