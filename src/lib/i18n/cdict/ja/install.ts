import type { CDict } from "../en";

/** 日本語クライアント文言: install（/install のガイドと手描きの画面イラスト）。イラスト内の文言は iOS・Android・Chrome の日本語表示に合わせる。 */
export const install: CDict["install"] = {
  hero: {
    eyebrow: "通知を受け取る準備",
    title: "候補リストの変化を、使う端末へ。",
    lead: "お使いの端末を選び、手順に沿って準備します。ShelfSpringはサーバーで在庫を確認し、条件に合う変化を検出した後に通知します。受信までの時間は一定ではありません。",
    seeSteps: "手順を見る",
    sendTest: "テストを送信",
    turnOn: "通知をオンにする",
    already: "**設定済みの端末：{label}。** この端末も使う場合は、以下の手順で設定してテストを送信してください。{link}",
    myAlerts: "マイ通知",
  },
  progress: {
    homeScreen: "ホーム画面に追加済み",
    signedIn: "ログイン済み",
    on: "通知オン",
    blocked: "設定でブロックされています。手順{n}をご覧ください。",
  },
  steps: {
    title: "端末に合った手順を選ぶ",
    intro: {
      ios: "iPhoneとiPadでは、まずShelfSpringをホーム画面に追加します。そのアプリを開いて通知を有効にしてください。",
      android: "Androidでは対応ブラウザを使えます。インストールすると専用の入口ができますが、通知に必須ではありません。",
      desktop: "パソコンではブラウザの通知を許可し、OS側の通知設定も確認します。",
    },
    tabsLabel: "お使いの端末",
    tabs: { ios: "iPhone / iPad", android: "Android", desktop: "パソコン" },
    ios: {
      safari: { title: "Safariでshelfspring.comを開く", text: "このガイドはSafariの画面で説明します。図と同じ操作を探せるよう、サイトをブラウザで直接開いてください。" },
      share: { title: "「共有」をタップ", text: "ブラウザのツールバーで共有アイコンを探します。位置はバージョンや選択したレイアウトによって異なります。" },
      choose: { title: "「ホーム画面に追加」を選ぶ", text: "共有メニュー内のこの項目を探します。見えない場合は操作一覧をスクロールしてください。" },
      add: { title: "「追加」をタップ", text: "名前がShelfSpringであることを確認し、ホーム画面へのアイコン追加を確定します。" },
      open: { title: "ホーム画面から開いてログイン", text: "追加したアイコンを開き、アカウントと同じメールアドレスでログインします。ホーム画面アプリでは別途ログインが必要な場合があります。" },
      allow: { title: "「通知をオンにする」→「許可」をタップ", text: "このページまたはアカウントのボタンを押し、システムの許可画面で承認します。その後、この端末からテストを送信してください。" },
    },
    android: {
      chrome: { title: "Chromeでshelfspring.comを開く", text: "図はChromeの手順です。別のアプリ内でリンクを開いた場合は、通常のブラウザで開き直してください。" },
      install: { title: "アプリをインストール", text: "インストールの案内が表示されたら確認画面を承認します。アプリストアからダウンロードする必要はありません。" },
      menu: { title: "メニュー ⋮ →「ホーム画面に追加」", text: "**アプリをインストール**という名前の場合もあります。項目がなければ、ブラウザのタブで続けられます。" },
      open: { title: "ShelfSpringを開いてログイン", text: "アイコンを開くかタブに戻り、同じアカウントのメールアドレスで保存した候補を表示します。" },
      allow: { title: "「通知をオンにする」→「許可」をタップ", text: "ブラウザの通知を許可します。テストが届かない場合は、Androidの通知権限やバッテリー制限も確認してください。" },
    },
    desktop: {
      allow: { title: "「通知をオンにする」をタップ", text: "対応ブラウザでShelfSpringを許可し、テストを送信します。集中モードやOSの設定によって通知が表示されないことがあります。" },
      install: { title: "任意：ShelfSpring専用のウィンドウを作る", text: "ChromeやEdgeにはインストールアイコンが表示される場合があります。インストール後も、バックグラウンド受信はブラウザとOSの設定に依存します。" },
      phone: { title: "スマートフォンにも", text: "スマートフォンでも同じメールアドレスでログインします。通知の許可とテストは端末ごとに行ってください。" },
    },
  },
  action: {
    install: "ShelfSpringをインストール",
    on: "✓ この端末の通知はオンです。",
    sendTest: "テストを送信",
    needsInstall: "ホーム画面のアプリを開くと使えます。",
    signInFirst: "先にログイン",
    signInThenOn: "ログインしてオンにする",
    turnOn: "通知をオンにする",
    denied: "ブロックされています。設定でShelfSpringを許可してから、再読み込みしてください。",
  },
  notes: [{"q":"iPhoneの説明がSafariなのはなぜ？","a":"図はSafariのメニューに合わせています。他のブラウザでもホーム画面への追加を提供する場合がありますが、操作は異なることがあります。"},{"q":"端末が在庫を確認し続けるの？","a":"在庫確認はサーバーで行います。通知の受信と表示は、ブラウザやホーム画面アプリが担当します。"},{"q":"プッシュ通知を使えない場合は？","a":"メールが代わりの経路になります。迷惑メールも確認してください。メールの配信にも時間がかかる場合があります。"},{"q":"複数の端末を準備するには？","a":"同じアカウントでログインし、各端末で個別に通知を許可して、それぞれからテストを送信してください。"}],
  cta: { title: "端末が準備できたら、役立つ候補を選ぼう。", button: "iPhoneと受取店舗を選ぶ" },

  mocks: {
    share: "共有",
    shareSheet: { copy: "コピー", readingList: "リーディングリストに追加", bookmark: "ブックマークを追加", favorites: "お気に入りに追加", addToHome: "ホーム画面に追加", markup: "マークアップ" },
    addDialog: { cancel: "キャンセル", title: "ホーム画面に追加", add: "追加", note: "このWebサイトにすばやくアクセスできるように、ホーム画面にアイコンを追加します。" },
    iosAlert: { title: "“ShelfSpring”は通知を送信します。よろしいですか？", text: "通知方法は、“通知”、“サウンド”、“アイコンバッジ”が利用できる可能性があります。通知方法は“設定”で設定できます。", dontAllow: "許可しない", allow: "許可" },
    chromeMenuLabel: "メニュー",
    chromeMenu: { before: ["新しいタブ", "履歴", "ダウンロード", "ブックマーク", "共有…"], add: "ホーム画面に追加", after: ["PC版サイト"] },
    androidAlert: { title: "ShelfSpring に通知の送信を許可しますか？", dontAllow: "許可しない", allow: "許可" },
    desktopAlert: { wantsTo: "shelfspring.com が次の許可を求めています", show: "通知の表示", block: "ブロック", allow: "許可" },
    desktopInstall: { callout: "インストール", title: "アプリをインストールしますか？", text: "専用のウィンドウで開きます", cancel: "キャンセル", install: "インストール" },
    lockScreen: { date: "10月29日 木曜日", now: "今", title: "iPhone 18 Pro 256GB ブラック", body: "Apple 銀座 · 東京：本日受け取り可能。タップしてapple.comで受け取りを予約。" },
  },
};
