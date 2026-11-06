/**
 * 通知文（プッシュ、入荷メール、「通知が止まりました」メール、端末名、Stripe 決済ページの一行）、日本語。
 * ポーラーからも送るため、型以外の import はしない。
 */
import type { NotifyText } from "./en";

export const notifyJa: NotifyText = {
  pushTitle: (cfg: string) => cfg,
  pushBody: (where: string, quote: string | null) => `${where}${quote ? `：${quote}` : ""}。タップしてapple.comで受け取りを予約。`,
  testTitle: "ShelfSpringの通知がオンになりました",
  testBody: (time: string, device: string) => `${time} · ${device}. 条件に合う在庫を検出した後に通知します。元データの確認、同期、通知配信には遅延が生じることがあります。`,
  device: {
    iphoneApp: "iPhone（ホーム画面のアプリ）",
    iphoneSafari: "iPhone（Safari）",
    androidApp: "Android（インストール済みアプリ）",
    android: (browser: string) => `Android${browser ? `（${browser}）` : ""}`,
    computer: (browser: string) => `パソコン${browser ? `（${browser}）` : ""}`,
    other: "この端末",
  },
  email: {
    subject: (cfg: string, store: string, more: number) => `在庫あり：${cfg}（${store}）${more > 0 ? `ほか${more}件` : ""}`,
    intro: "朗報です。いま店頭受け取りできます：",
    reserve: "購入・受け取り予約",
    store: "店舗",
    tip: "店頭受け取りの在庫はすぐになくなります。Apple Storeアプリかapple.comを開き、「受け取り」を選んで店舗を指定してください。",
    manage: (url: string) => `この通知の管理・一時停止：${url}`,
    htmlTitle: "いま店頭受け取りできます",
    htmlReserve: "apple.comで受け取りを予約",
    htmlStorePage: "店舗ページ →",
    htmlTip: "店頭受け取りの在庫はすぐになくなります。Apple Storeアプリかapple.comで<b>受け取り</b>を選び、店舗を指定してください。",
    htmlManage: "この通知を管理・一時停止",
    cancel: (url: string) => `iPhoneを手に入れましたか？いつでも解約できます：${url}`,
    htmlGotIt: "iPhoneを手に入れましたか？",
    htmlCancel: "いつでも解約できます",
    nudge: (url: string) => `このアカウントではスマートフォンの通知がオフのため、現在はメールでお知らせしています。 ホーム画面からShelfSpringを開き、ログインして通知をオンにすると、この端末で通知を受け取れます。 条件に合う在庫を検出した後に通知します。元データの確認、同期、通知配信には遅延が生じることがあります。 ${url}`,
    htmlNudge: (url: string) => `このアカウントではスマートフォンの通知がオフのため、現在はメールでお知らせしています。 ホーム画面からShelfSpringを開き、ログインして通知をオンにすると、この端末で通知を受け取れます。 条件に合う在庫を検出した後に通知します。元データの確認、同期、通知配信には遅延が生じることがあります。 <a href="${url}" style="color:#0a7f3f">ShelfSpring →</a>`,
  },
  checkoutSubmit: (plan: string, limit: number, _fastSec: number, _checkSec: number, _alertSec: number) => { void _fastSec; void _checkSec; void _alertSec; return `${plan}：通知${limit}件。在庫を定期的に更新し、入荷を検知すると通知します。収集や配信に遅れが生じる場合があります。月額制、いつでも解約可能。`; },
  stopped: {
    deviceWord: { ios: "iPhone", android: "Androidスマートフォン", desktop: "パソコン", other: "端末" },
    subject: (device: string) => `${device}への通知が止まりました。ホーム画面からShelfSpringを開いてください`,
    gone: (device: string) => `${device}がShelfSpringの通知を受け付けなくなりました（プッシュサービスから、登録が無効になったと報告がありました）。`,
    byEmail: "通知をオンに戻すまで、入荷通知はメールでお届けします。",
    reopenIos: "ホーム画面から（Safariではなく）ShelfSpringを開き、「マイ通知」ページで「通知をオンにする」をタップしてください。",
    reopenOther: "ShelfSpringを開き、「マイ通知」ページで「通知をオンにする」をタップしてください。",
    causes: "よくある原因：ホーム画面からアプリを削除した、設定で通知をオフにした、iPhoneを復元した。",
  },
  nudge: {
    subject: "スマートフォンで入荷通知を受け取る設定",
    intro: "このアカウントではスマートフォンの通知がオフのため、現在はメールでお知らせしています。 ホーム画面からShelfSpringを開き、ログインして通知をオンにすると、この端末で通知を受け取れます。 条件に合う在庫を検出した後に通知します。元データの確認、同期、通知配信には遅延が生じることがあります。",
    howTitle: "1分以内にオンにできます：",
    stepsIos: ["iPhoneのSafariでshelfspring.comを開き、共有ボタンから「ホーム画面に追加」をタップします。", "ホーム画面から（Safariではなく）ShelfSpringを開き、ログインします。", "アカウントページで「通知をオンにする」をタップし、「許可」を選びます。"],
    stepsOther: "Androidやパソコンの場合：shelfspring.com/accountを開き、「通知をオンにする」をタップしてください。",
    after: "端末で通知をオンにするまでは、通知はメールで届き続けます。オンにした後は通知として届き、メールは止まります。",
    cta: (url: string) => `図解付きの設定ガイド：${url}`,
  },
};
