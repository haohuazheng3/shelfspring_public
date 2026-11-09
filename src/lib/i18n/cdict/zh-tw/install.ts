/**
 * 台灣中文客戶端字串：install（/install 教學與手繪的手機畫面）。示意圖上的字用 iOS、Android、Chrome 繁體中文
 * （台灣）介面本身的字：分享、加入主畫面、加入、允許、設定 → 通知、加到主畫面。
 */
import type { CDict } from "../en";

export const install: CDict["install"] = {
  hero: {
    eyebrow: "裝置設定",
    title: "讓追蹤清單有辦法通知到你。",
    lead: "在下方選你的裝置，照著它的設定路線走。查庫存的工作在 ShelfSpring 伺服器上進行；符合條件的變化確認後，這台裝置才會收到通知。送達時間不一定。",
    seeSteps: "跳到設定路線",
    sendTest: "送一則測試提醒",
    turnOn: "啟用通知",
    already: "**✓ 已經有裝置在接收。** 提醒會送到你的{label}；只有想把這台也加進來，才需要照下面的路線做。{link}",
    myAlerts: "我的追蹤清單",
  },
  progress: {
    homeScreen: "已存到主畫面",
    signedIn: "帳號已開啟",
    on: "通知已啟用",
    blocked: "你的設定擋掉了通知；第 {n} 步告訴你去哪裡改。",
  },
  steps: {
    title: "照著你裝置的路線走",
    intro: {
      ios: "Apple 只對存到主畫面的網站送出 iPhone 和 iPad 的網頁通知，所以要先存到主畫面。",
      android: "Chrome 在一般分頁就能收通知；把 App 加到主畫面可有可無。",
      desktop: "電腦瀏覽器可以直接收提醒，不必安裝任何東西。",
    },
    tabsLabel: "裝置類型",
    tabs: { ios: "iPhone 或 iPad", android: "Android 手機", desktop: "Mac 或 PC" },
    ios: {
      safari: { title: "在 Safari 載入 shelfspring.com", text: "圖片以 Safari 為準。如果你是在別的 App 裡看到這頁，請先改用瀏覽器開啟網站。" },
      share: { title: "找到「分享」按鈕", text: "iPhone 放在下方工具列；iPad 則在視窗上方。" },
      choose: { title: "在選單裡點「加入主畫面」", text: "它多半在第一排動作下方；找不到就把清單往下拉。" },
      add: { title: "點「加入」確認", text: "建議名稱 ShelfSpring 不用改。" },
      open: { title: "打開新圖示，再登入一次", text: "主畫面 App 和 Safari 的登入狀態是分開的。用平常的 Email 登入，追蹤清單會原樣出現。" },
      allow: { title: "點「啟用通知」，接著允許", text: "這個按鈕在 App 的追蹤清單頁上。權限詢問 iOS 只跳一次。" },
    },
    android: {
      chrome: { title: "在 Chrome 載入 shelfspring.com", text: "Edge 和 Samsung Internet 做法相同；其他 App 內建的瀏覽器不支援。" },
      install: { title: "接受 Chrome 的安裝提示", text: "按一次確認即可，完全不用去 App Store 或 Play 商店。" },
      menu: { title: "點 ⋮，再點「加到主畫面」", text: "有些 Chrome 版本把這個項目叫做**安裝應用程式**。" },
      open: { title: "打開 ShelfSpring 並登入", text: "新圖示會放在主畫面上，有時則在 App 列表裡。用平常的 Email 登入，就能看到同一份追蹤清單。" },
      allow: { title: "點「啟用通知」，接著允許", text: "權限詢問 Android 只跳一次。一般 Chrome 分頁裡，同一個按鈕也能用。" },
    },
    desktop: {
      allow: { title: "點「啟用通知」", text: "支援 Chrome、Edge、Firefox，以及 macOS Ventura 以上版本的 Safari 16.1+。瀏覽器跳出權限詢問時點允許。" },
      install: { title: "選用：讓 ShelfSpring 在獨立視窗執行", text: "Chrome 和 Edge 會為此顯示安裝圖示。提醒能不能在背景送達，要看瀏覽器和系統設定。" },
      phone: { title: "也把手機加進來", text: "手機上登入同一個 Email。凡是啟用通知的裝置，每則提醒都會各收一份。" },
    },
  },
  action: {
    install: "安裝 ShelfSpring",
    on: "✓ 這台裝置已啟用。",
    sendTest: "送一則測試提醒",
    needsInstall: "這個按鈕要在主畫面 App 裡用，Safari 不行。",
    signInFirst: "登入後繼續",
    signInThenOn: "登入並啟用",
    turnOn: "啟用通知",
    denied: "通知被擋掉了。請到「設定」允許 ShelfSpring，再重新載入頁面。",
  },
  notes: [
    { q: "iPhone 只能用 Safari 嗎？", a: "圖片照 Safari 的分享選單畫。在 iOS 與 iPadOS 16.4 以上，其他支援的瀏覽器也可能有「加入主畫面」。要啟用網頁通知，請打開裝好的主畫面 App。" },
    { q: "我的手機會一直幫忙查庫存嗎？", a: "查庫存是在我們的伺服器上跑。你的瀏覽器或主畫面 App 只負責接收和顯示通知。" },
    { q: "一台啟用的裝置都沒有，會怎麼樣？", a: "每則提醒會改用 Email 寄到你帳號的信箱。有啟用的裝置時，提醒會推播到裝置；只有所有裝置都聯絡不到，才由 Email 補上。" },
    { q: "可以讓不只一台裝置收提醒嗎？", a: "可以。到哪裡都用同一個 Email 登入；凡是啟用通知的裝置，每則提醒都會各收一份。" },
  ],
  cta: { title: "裝置準備好了，還需要一份有用的追蹤清單。", button: "挑 iPhone 和取貨門市" },

  mocks: {
    share: "分享",
    shareSheet: { copy: "拷貝", readingList: "加入閱讀列表", bookmark: "加入書籤", favorites: "加入喜好項目", addToHome: "加入主畫面", markup: "標示" },
    addDialog: { cancel: "取消", title: "加入主畫面", add: "加入", note: "將會在你的主畫面加入一個圖像，讓你能快速取用此網站。" },
    iosAlert: { title: "「ShelfSpring」想要傳送通知給你", text: "通知可能包含提示、聲音和圖像標記。這些可在「設定」中設定。", dontAllow: "不允許", allow: "允許" },
    chromeMenuLabel: "選單",
    chromeMenu: { before: ["新分頁", "歷史記錄", "下載", "書籤", "分享…"], add: "加到主畫面", after: ["電腦版網站"] },
    androidAlert: { title: "要允許「ShelfSpring」傳送通知給你嗎？", dontAllow: "不允許", allow: "允許" },
    desktopAlert: { wantsTo: "shelfspring.com 要求取得以下權限：", show: "顯示通知", block: "封鎖", allow: "允許" },
    desktopInstall: { callout: "安裝", title: "要安裝 ShelfSpring 嗎？", text: "會在獨立視窗中開啟", cancel: "取消", install: "安裝" },
    lockScreen: { date: "10月29日 星期四", now: "現在", title: "iPhone 18 Pro 256GB 黑色", body: "Apple 信義 A13 · 台北——上架中，可以取貨。打開 apple.com 下單。" },
  },
};
