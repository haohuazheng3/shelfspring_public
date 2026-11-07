/**
 * 日本語: account（マイ通知ページ、そこに出る入荷モジュール、/install、/checkout/success、/pricing）。
 * **太字** と [ラベル](リンク) は <Md> で表示。プラン名とドル金額は訳さない（全言語で米ドル課金）。
 */
import { num } from "@/lib/i18n/format";
import type { Dict } from "../en";

const N = (n: number) => num("ja", n);
/** 他サイトが公表しているチェック間隔（"8 seconds to 15 minutes" → 「8秒〜15分」）。 */

export const account: Dict["account"] = {
  loading: "読み込み中",
  meta: { title: "マイ通知" },
  signedInAs: (email: string) => `${email}でログイン中`,
  title: "マイ通知",
  units: { s: "秒", min: "分", taps: "タップ" },

  plan: {
    title: "プラン",
    none: "プラン未加入：通知はオフです",
    summary: (plan: string, on: number, limit: number) => `${plan} · 通知${N(limit)}件中${N(on)}件がオン`,
    renews: (date: string) => ` · ${date}に更新`,
    ends: (date: string) => ` · ${date}に終了`,
  },

  sent: {
    title: "送信済みの通知",
    last: (ago: string) => `最新：${ago}`,
    none: "まだ送信していません",
    empty: "まだ送信していません。",
    channel: { push: "プッシュ通知", email: "メール" },
    status: { sent: "送信済み", failed: "失敗", skipped: "スキップ" },
  },

  fast: {
    title: "受け取り注文の準備",
    sub: "次の購入候補に備える短い確認リスト",
    lasts: "記録されたDuo受取可能時間の中央値",
    push: "通知時間は変動します。在庫はAppleで確認してください",
    tapsLeft: "注文を確定する前の確認事項",
    steps: [
      { title: "移動できる範囲を確認", hint: "受け取りが確定した場合に、実際に行ける店舗だけを残しましょう。" },
      { title: "正確な構成を決める", hint: "Appleを開く前に、モデル・容量・カラーを確認しておきます。" },
      { title: "購入方法を確認", hint: "注文前にAppleの支払い方法や通信会社の選択肢を読みましょう。" },
      { title: "在庫をもう一度確認", hint: "過去の観測や通知は、端末を取り置きするものではありません。" },
      { title: "受け取り準備完了を待つ", hint: "Appleが注文の商品を受け取れると確認してから出発してください。" },
    ],
    guide: "受け取り準備ガイド（英語）",
    window: "選んだ店舗の記録",
  },

  restock: {
    title: "選んだ店舗に入荷する時間帯",
    anyIphone: "iPhone",
    and: "、",
    yours: (n: number) => (n === 1 ? "選んだ店舗" : `選んだ${N(n)}店舗`),
    Yours: (n: number) => (n === 1 ? "選んだ店舗" : `選んだ${N(n)}店舗`),
    otherStores: (n: number) => `ほかの${N(n)}店舗`,
    meta: (what: string, stores: number, days: number, zone: string) => `${what} · ${N(stores)}店舗 · 過去${N(days)}日間 · ${zone}`,
    busiest: (yours: string, then: string | null) => (then ? `${yours}で最も多い時間帯 · 次いで${then}` : `${yours}で最も多い時間帯`),
    busiestArea: (stores: number, zone: string) => `${zone}の全${N(stores)}店舗で最も多い時間帯`,
    next: (inHours: number) => `次の時間帯 · ${inHours === 0 ? "この1時間" : `${N(inHours)}時間後`}`,
    typical: "完売までの在庫時間（通常）",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `${yours}ではまだ入荷なし · 過去${N(days)}日間` : `${yours}の入荷 · 過去${N(days)}日間${pattern ? "" : " · 傾向を出すにはまだ少なすぎます"}`),
    byHour: (busiestInGreen: boolean) => `時間帯別${busiestInGreen ? " · 最多は緑" : ""}`,
    byWeekday: (busiest: string | null) => `曜日別${busiest ? ` · 最多は${busiest}` : ""}`,
    hourChart: (yours: string, zone: string, items: string) => `${yours}の時間帯別の入荷（${zone}）：${items}`,
    weekdayChart: (yours: string, items: string) => `${yours}の曜日別の入荷：${items}`,
    chartItem: (label: string, n: number, reported: number) => `${label} ${N(n)}${reported ? `（他サイトの報告 +${N(reported)}）` : ""}`,
    barTitle: (label: string, n: number, yours: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label}：${yours}で入荷${N(n)}回${area ? ` · ${area.zone}の全店舗で${N(area.n)}回` : ""}${reported ? ` · 他サイトの報告${N(reported)}回` : ""}`,
    now: "現在",
    allZone: (stores: number, zone: string) => `${zone}の全${N(stores)}店舗`,
    reportMarkBars: "破線",
    reportMarkDots: "白抜きの点",
    sellTitle: "選んだ店舗の入荷は、どれくらいで完売するか",
    sellMeta: (what: string, stores: number, days: number) => `${what} · ${N(stores)}店舗 · 過去${N(days)}日間`,
    sellLabel: (yours: string) => yours,
  },

  success: {
    metaTitle: "通知がオンになりました",
    isOn: (plan: string) => `${plan}が有効になりました`,
    yourPlan: "現在のプラン",
    received: "お支払いを受け付けました",
    onPlan: (limit: number) => `このプランで通知${N(limit)}件が使えます。`,
    planOn: "プランが有効になりました。",
    pending: "サブスクリプションは1分以内にアカウントに反映されます。",
    open: "マイ通知を開く",
    another: "通知を追加する",
    saved: (n: number) => `通知${N(n)}件を保存 · 領収書はStripeから届きます`,
    pushOn: "通知",
    pushNext: "次は、スマートフォンで通知を受け取る設定",
  },

  install: {
    metaTitle: "ShelfSpringの通知を受け取る端末を準備する",
    metaDescription: "スマートフォンやパソコンに合う手順でログインし、通知をテストできます。受信はブラウザや端末の設定にも左右されます。",
  },

  pricing: {
    metaTitle: "候補リストの料金プラン：通知ルール10・20・50件",
    metaDescription: "希望するiPhoneと行ける店舗を候補に。ShelfSpringは月額5米ドルから。在庫、地図、記録された変化は無料で閲覧できます。",
    title: "候補を絞ったら、変化を見守ろう。",
    lead: "在庫の閲覧は無料です。希望に合う変化の通知が必要になったら、プランを選べます。**1ルールは、1店舗にある1つの正確なiPhone構成を追跡します。**",
    chips: ["公開在庫と履歴の閲覧は無料","どのプランも同じ在庫情報を使用","米ドルで毎月請求","アカウントから更新を停止可能"],
    fastest: "プランでできること",
    everyFast: "条件に合う在庫を検出した後に通知します。元データの確認、同期、配信に時間がかかる場合があります。",
    historySample: "追跡対象の全地域 · 過去7日間 · 終了した受取可能期間 {n}件",
    sellsOut: (band: string) => `観測したiPhone Duoの受取可能時間の中央値は**${band}**でした。記録済みの標本を表す数値で、次の機会の長さを予測するものではありません。`,
    band: (range: string) => `${range.replace(/[–-]/, "〜")}秒`,
    aboutMinute: "約1分",
    sameSpeed: "在庫を定期的に更新",
    rechecked: "選んだ店舗の再チェック間隔",
    toPhone: "入荷確認からスマートフォンへ",
    listing: "記録されたDuo受取可能時間の中央値",
    note: { plus: "iPhone 1台 × 10店舗", pro: "iPhone 2台 × 10店舗", max: "iPhone 5台 × 10店舗" },
    month: "/ 月",
    alerts: (n: number) => `通知${N(n)}件`,
    perks: ["容量とカラーを正確に指定","移動できる範囲に合わせて店舗を変更","ブラウザ通知と、利用できない場合のメール通知"],
    cancel: "いつでも解約可能",
    get: (plan: string) => `${plan}を始める`,
    billing: "Stripeで決済 · カードまたはLink · プラン変更は日割り計算",
    refund: "合わなかったら：入荷通知がまだ一度も届いていなければ、[7日以内は全額返金](/refunds)します",
  },
};
