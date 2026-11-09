import type { CDict } from "../en";

/** 日本語クライアント文言: install（/install のガイドと手描きの画面イラスト）。イラスト内の文言は iOS・Android・Chrome の日本語表示に合わせる（OS の表示なので変えない）。 */
export const install: CDict["install"] = {
  hero: {
    eyebrow: "通知を受け取る準備",
    title: "候補リストの変化を、使う端末へ。",
    lead: "お使いの端末を選び、手順に沿って準備します。ShelfSpringはサーバーで在庫を確認し、条件に合う変化を検出した後に通知します。受信までの時間は一定ではありません。",
    seeSteps: "設定の道筋へ進む",
    sendTest: "テスト通知を送る",
    turnOn: "通知を有効にする",
    already: "**✓ すでに受け取っている端末があります。** 知らせは{label}に届いています。下の道筋は、この端末も加えたいときだけ進めてください。{link}",
    myAlerts: "見守りリスト",
  },
  progress: {
    homeScreen: "ホーム画面に保存済み",
    signedIn: "アカウントを開いた",
    on: "通知が有効",
    blocked: "端末の設定が通知を止めています。変える場所は手順{n}にあります。",
  },
  steps: {
    title: "端末に合った手順を選ぶ",
    intro: {
      ios: "iPhoneとiPadでAppleがWebの通知を届けるのは、ホーム画面に保存したサイトだけ。なので、最初にそこから始めます。",
      android: "Chromeはふつうのタブのままでも通知を届けられます。ホーム画面へのアプリ追加は、してもしなくてもかまいません。",
      desktop: "パソコンのブラウザはそのまま知らせを受け取れます。インストールするものはありません。",
    },
    tabsLabel: "端末の種類",
    tabs: { ios: "iPhoneまたはiPad", android: "Android端末", desktop: "MacまたはPC" },
    ios: {
      safari: { title: "shelfspring.comをSafariで読み込む", text: "図はSafariに合わせています。別のアプリの中でこのページを読んでいるなら、先にブラウザでサイトを開き直してください。" },
      share: { title: "「共有」ボタンを見つける", text: "iPhoneでは下のツールバー、iPadではウインドウの上側にあります。" },
      choose: { title: "一覧から「ホーム画面に追加」を選ぶ", text: "最初の何行かの下に隠れていることが多いので、見当たらなければ一覧をスクロールします。" },
      add: { title: "「追加」で確定する", text: "名前は提案どおりのShelfSpringのままでかまいません。" },
      open: { title: "新しいアイコンから開き、もう一度ログイン", text: "ホーム画面アプリはSafariとは別にログインを持ちます。いつものメールアドレスを使えば、見守りリストはそのまま出てきます。" },
      allow: { title: "「通知を有効にする」を押し、「許可」を選ぶ", text: "ボタンはアプリの中の見守りリストのページにあります。iOSが許可を尋ねるのは一度きりです。" },
    },
    android: {
      chrome: { title: "shelfspring.comをChromeで読み込む", text: "EdgeやSamsung Internetでも同じように動きます。ほかのアプリに組み込まれたブラウザでは使えません。" },
      install: { title: "Chromeのインストールの案内を受ける", text: "確認は一度だけ。アプリストアからは何も入れません。" },
      menu: { title: "⋮ を開いて「ホーム画面に追加」", text: "Chromeのバージョンによっては、この項目が **アプリをインストール** になっています。" },
      open: { title: "ShelfSpringを起動してログイン", text: "アイコンはホーム画面かアプリ一覧に出ます。いつものメールアドレスでログインすると、同じ見守りリストが見えます。" },
      allow: { title: "「通知を有効にする」を押し、「許可」を選ぶ", text: "Androidが許可を尋ねるのは一度だけ。同じボタンは、ふつうのChromeのタブからでも使えます。" },
    },
    desktop: {
      allow: { title: "「通知を有効にする」を押す", text: "使えるのはChrome、Edge、Firefox、それにmacOS Ventura以降のSafari 16.1以上。ブラウザが出す許可の確認を承認してください。" },
      install: { title: "お好みで：ShelfSpringを専用のウインドウで動かす", text: "ChromeとEdgeには、そのためのインストールアイコンが出ます。裏で知らせが届くかどうかは、ブラウザとシステムの設定しだいです。" },
      phone: { title: "スマートフォンも加える", text: "スマートフォンでも同じメールアドレスを使います。通知を有効にした端末には、どの知らせも1件ずつ届きます。" },
    },
  },
  action: {
    install: "ShelfSpringを追加",
    on: "✓ この端末は有効になっています。",
    sendTest: "テスト通知を送る",
    needsInstall: "このボタンはSafariではなく、ホーム画面アプリの中で使えます。",
    signInFirst: "ログインして進む",
    signInThenOn: "ログインして有効にする",
    turnOn: "通知を有効にする",
    denied: "通知がブロックされています。設定でShelfSpringを許可し、ページを読み込み直してください。",
  },
  notes: [{"q":"iPhoneではSafariしか使えない？","a":"図はSafariの共有メニューに沿っています。iOS・iPadOS 16.4以降なら、ほかの対応ブラウザでも「ホーム画面に追加」を出せることがあります。Webの通知を有効にするのは、追加したホーム画面アプリを開いてからです。"},{"q":"端末がずっと在庫を見張っているの？","a":"在庫を記録しているのはサーバー側です。端末のブラウザやホーム画面アプリは、届いた知らせを受け取って表示するだけです。"},{"q":"有効な端末がひとつもないときは？","a":"知らせはアカウントのメールアドレスに送られます。有効な端末があればそちらへプッシュで届け、メールが代わりに働くのはどの端末にも届かないときだけです。迷惑メールのフォルダも見てください。"},{"q":"複数の端末で受け取れる？","a":"受け取れます。どこでも同じメールアドレスでログインすれば、通知を有効にした端末それぞれに、どの知らせも届きます。"}],
  cta: { title: "受け取る端末がそろったら、見守る構成と店舗を決めましょう。", button: "見守りリストをつくる" },

  mocks: {
    share: "共有",
    shareSheet: { copy: "コピー", readingList: "リーディングリストに追加", bookmark: "ブックマークを追加", favorites: "お気に入りに追加", addToHome: "ホーム画面に追加", markup: "マークアップ" },
    addDialog: { cancel: "キャンセル", title: "ホーム画面に追加", add: "追加", note: "このWebサイトにすばやくアクセスできるように、ホーム画面にアイコンを追加します。" },
    iosAlert: { title: "“ShelfSpring”は通知を送信します。よろしいですか？", text: "通知方法は、“通知”、“サウンド”、“アイコンバッジ”が利用できる可能性があります。通知方法は“設定”で設定できます。", dontAllow: "許可しない", allow: "許可" },
    chromeMenuLabel: "メニュー",
    chromeMenu: { before: ["新しいタブ", "履歴", "ダウンロード", "ブックマーク", "共有…"], add: "ホーム画面に追加", after: ["PC版サイト"] },
    androidAlert: { title: "ShelfSpring に通知の送信を許可しますか？", dontAllow: "許可しない", allow: "許可" },
    desktopAlert: { wantsTo: "shelfspring.com が次の許可を求めています", show: "通知の表示", block: "ブロック", allow: "許可" },
    desktopInstall: { callout: "インストール", title: "アプリをインストールしますか？", text: "別のウインドウで動きます", cancel: "キャンセル", install: "インストール" },
    lockScreen: { date: "10月29日 木曜日", now: "今", title: "iPhone 18 Pro 256GB ブラック", body: "Apple 銀座 · 東京：受け取り用に棚に出ています。apple.comを開いて注文。" },
  },
};
