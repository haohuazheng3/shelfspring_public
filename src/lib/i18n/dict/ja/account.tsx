/**
 * 日本語: account（見守りリストのページ、そこに出る再入荷モジュール、/install、/checkout/success、/pricing）。
 * **太字** と [ラベル](リンク) は <Md> で表示。プラン名とドル金額は訳さない（全言語で米ドル課金）。
 * 観測台帳の口調：restock＝再入荷、在庫状態＝棚、通知ルール＝見守り。
 */
import { num } from "@/lib/i18n/format";
import type { Dict } from "../en";

const N = (n: number) => num("ja", n);

export const account: Dict["account"] = {
  loading: "読み取り中",
  meta: { title: "見守りリスト" },
  signedInAs: (email: string) => `アカウント · ${email}`,
  title: "あなたの見守りリストを、ひとつの場所に。",
  units: { s: "秒", min: "分", taps: "回の操作" },

  plan: {
    title: "メンバーシップと支払い",
    none: "有効なプランなし · 見守りは記録されていますが、通知は送られません",
    summary: (plan: string, on: number, limit: number) => `${plan} · 有効な見守り ${N(on)}/${N(limit)}`,
    renews: (date: string) => ` · 次の更新は${date}`,
    ends: (date: string) => ` · ${date}まで有効`,
  },

  sent: {
    title: "届けた通知の記録",
    last: (ago: string) => `いちばん新しい配信 ${ago}`,
    none: "配信はまだありません",
    empty: "このアカウントに送った再入荷の知らせはまだありません。記録した見守りは、有料プランが有効で、条件に合う変化が確かめられたときに配信を始めます。",
    channel: { push: "プッシュ通知", email: "メール" },
    status: { sent: "配信済み", failed: "届かず", skipped: "見送り" },
  },

  fast: {
    title: "受け取り注文の段取り",
    sub: "次に役立つ棚が出る前に、短いチェックリストを",
    lasts: "記録したDuoが棚にあった時間の中央値",
    push: "届くまでの時間は毎回ちがいます。在庫の最終確認はAppleで",
    tapsLeft: "通知が届いたあと、あなたに残る手順",
    steps: [
      { title: "動ける範囲を決めておく", hint: "受け取りが決まったら本当に行ける店舗だけを、リストに残しておきます。" },
      { title: "構成を正確に決める", hint: "Appleを開く前に、モデル・ストレージ・色を手元にそろえておきます。" },
      { title: "買い方を下調べする", hint: "Appleの支払い方法や通信会社の選び方は、注文の前に読んでおきます。" },
      { title: "棚をもう一度見る", hint: "過去の観測や通知が、端末を取り置いてくれるわけではありません。" },
      { title: "準備完了の連絡を待つ", hint: "Appleが「受け取れます」と知らせてから出かけてください。" },
    ],
    guide: "受け取りのチェックリストを読む（英語）",
    window: "あなたの店舗の再入荷の時間帯",
  },

  restock: {
    /** "Restock by restock" on the dashboard: each restock against the member's alerts (lib/alertMarks.ts). */
    mark: { delivered: "通知が到着", sent: "通知を送信", other: "通知の対象外", before: "通知の設定前" },
    title: "あなたの店舗で再入荷が記録される時間帯",
    anyIphone: "iPhone",
    and: "と",
    yours: (n: number) => (n === 1 ? "あなたの店舗" : `あなたの${N(n)}店舗`),
    Yours: (n: number) => (n === 1 ? "あなたの店舗" : `あなたの${N(n)}店舗`),
    otherStores: (n: number) => `別の${N(n)}店舗`,
    meta: (what: string, stores: number, days: number, zone: string) => `${what} · ${N(stores)}店舗 · ${N(days)}日分の記録 · ${zone}`,
    busiest: (yours: string, then: string | null) => (then ? `${yours}でいちばん再入荷が多い時刻 · 2番目は${then}` : `${yours}でいちばん再入荷が多い時刻`),
    busiestArea: (stores: number, zone: string) => `${zone}の時計で動く${N(stores)}店舗でのピーク`,
    next: (inHours: number) => `これから来る時間帯 · ${inHours === 0 ? "この1時間のうち" : `あと${N(inHours)}時間`}`,
    typical: "棚にあった時間の中央値",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `${yours}で記録した再入荷はなし · ${N(days)}日分の記録` : `${yours}で記録した再入荷 · ${N(days)}日分の記録${pattern ? "" : " · 決まった時刻を挙げるにはまだ足りません"}`),
    byHour: (busiestInGreen: boolean) => `時刻${busiestInGreen ? " · ピークは緑" : ""}`,
    byWeekday: (busiest: string | null) => `曜日${busiest ? ` · ピークは${busiest}` : ""}`,
    hourChart: (yours: string, zone: string, items: string) => `${yours}の時刻ごとの再入荷（${zone}）：${items}`,
    weekdayChart: (yours: string, items: string) => `${yours}の曜日ごとの再入荷：${items}`,
    chartItem: (label: string, n: number, reported: number) => `${label} ${N(n)}${reported ? `（外部の報告 +${N(reported)}）` : ""}`,
    barTitle: (label: string, n: number, yours: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label}：${yours}で記録した再入荷${N(n)}回${area ? ` · ${area.zone}の店舗全体では${N(area.n)}回` : ""}${reported ? ` · 外部の報告${N(reported)}件` : ""}`,
    now: "いま",
    allZone: (stores: number, zone: string) => `${zone}の時計で動く店舗すべて（${N(stores)}店舗）`,
    reportMarkBars: "破線の枠",
    reportMarkDots: "中抜きの丸",
    sellTitle: "棚に戻った分は、どれだけ棚にあったか",
    sellMeta: (what: string, stores: number, days: number) => `${what} · ${N(stores)}店舗 · ${N(days)}日分の記録`,
    sellLabel: (yours: string) => yours,
  },

  success: {
    metaTitle: "通知がオンになりました",
    isOn: (plan: string) => `${plan}が動き出しました`,
    yourPlan: "あなたのプラン",
    received: "支払いを確認しました",
    onPlan: (limit: number) => `見守りリストに${N(limit)}件まで入ります。`,
    planOn: "プランが動き出しました。",
    pending: "Stripeがまだ確認中です。1分ほどでアカウントにプランが表示されます。",
    open: "見守りリストを開く",
    another: "見守りリストに加える",
    saved: (n: number) => `見守り${N(n)}件を記録 · 領収書はStripeがメールで送ります`,
    pushOn: "通知",
    pushNext: "次の一歩：受け取る端末を有効にする",
  },

  install: {
    metaTitle: "ShelfSpringの通知を受け取る端末を準備する",
    metaDescription: "スマートフォンやパソコンに合う手順でログインし、通知をテストできます。受信はブラウザや端末の設定にも左右されます。",
  },

  pricing: {
    metaTitle: "候補リストの料金プラン：通知ルール10・20・50件",
    metaDescription: "希望するiPhoneと行ける店舗を候補に。ShelfSpringは月額5米ドルから。在庫、地図、記録された変化は無料で閲覧できます。",
    title: "絞り込んだ候補のための、メンバーシップ。",
    lead: "棚を見るのはこれからも無料。条件に合う次の変化を向こうから知らせてほしくなったら、申し込んでください。**見守り1件は、1店舗の、ひとつの正確なiPhone構成を見ます。**",
    chips: ["公開の棚と履歴は無料のまま", "どのプランも同じ在庫データ", "請求は毎月、米ドルで", "更新はアカウントからいつでも停止"],
    fastest: "申し込むと何が変わるか",
    everyFast: "通知は、条件に合う在庫を検出してから送ります。元データの確認・同期・配信のそれぞれで遅れが出ることがあります。",
    historySample: "追跡しているすべての国 · 直近7日 · 棚から消えるまで追えた受け取りの窓 {n}件",
    sellsOut: (band: string) => `観測したiPhone Duoが棚にあった時間の中央値は**${band}**。記録した標本についての数字で、あなたの次の機会の長さを示すものではありません。`,
    band: (range: string) => `${range.replace(/[–-]/, "〜")}秒`,
    aboutMinute: "1分前後",
    sameSpeed: "棚の状況はこまめに更新",
    rechecked: "あなたの店舗を見に行く間隔",
    toPhone: "確かめた再入荷から、あなたの端末まで",
    listing: "Duoが棚にあった時間の中央値",
    note: { plus: "例：1つの構成を10店舗で見守る", pro: "例：2つの構成を、それぞれ10店舗で", max: "例：5つの構成を、それぞれ10店舗で" },
    month: "毎月",
    alerts: (n: number) => `見守り${N(n)}件`,
    perks: ["ストレージと色の組み合わせまで正確に指定", "行ける店舗は予定に合わせていつでも入れ替え", "ブラウザへのプッシュ通知、届かないときはメール"],
    cancel: "更新はいつでも止められます",
    get: (plan: string) => `${plan}で始める`,
    billing: "支払いはStripe経由で、カードかLink。上位プランへは残り日数分を精算し、下位プランへは次回更新日から切り替わります。",
    refund: "返金の条件：直近7日以内のお支払いで、その後に再入荷の通知が一度も届いていなければ、全額を返金できます（[返金ポリシー](/refunds)）。",
  },
};
