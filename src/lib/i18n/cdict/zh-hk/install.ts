/**
 * 繁體中文（香港）client strings: install（/install 教學與手繪的手機畫面）。示意圖上的字用 iOS、Android、Chrome
 * 香港繁體中文介面本身的字：分享、加至主畫面、加入、允許、設定 → 通知。
 */
import type { CDict } from "../en";

export const install: CDict["install"] = {
  hero: {
    eyebrow: "裝置設定",
    title: "讓監察清單有路找到你。",
    lead: "在下面揀你的裝置，跟着對應的設定路線做。查看存貨的工作在 ShelfSpring 伺服器上進行；符合條件的變化確認之後，這部裝置才會收到通知。送達時間有快有慢。",
    seeSteps: "跳到設定路線",
    sendTest: "發一個測試提示",
    turnOn: "啟用通知",
    already: "**✓ 已有裝置在接收。** 提示會送到你的{label}；只有想加上這部裝置時，才需要跟下面的路線做。{link}",
    myAlerts: "我的監察清單",
  },
  progress: {
    homeScreen: "已存到主畫面",
    signedIn: "帳戶已開啟",
    on: "通知已啟用",
    blocked: "你的設定擋住了通知；第 {n} 步說明在哪裏更改。",
  },
  steps: {
    title: "跟着你裝置的路線做",
    intro: {
      ios: "Apple 只會向存到主畫面的網站送出 iPhone 及 iPad 網頁通知，所以第一步是存到主畫面。",
      android: "Chrome 在一般分頁也能收通知；把 App 加到主畫面只是可選。",
      desktop: "電腦瀏覽器可以直接收提示，毋須安裝任何東西。",
    },
    tabsLabel: "裝置類型",
    tabs: { ios: "iPhone 或 iPad", android: "Android 手機", desktop: "Mac 或 PC" },
    ios: {
      safari: { title: "在 Safari 載入 shelfspring.com", text: "圖片以 Safari 為準。如果你正在其他 App 內閱讀，請先用瀏覽器打開網站再繼續。" },
      share: { title: "找出「分享」按鈕", text: "iPhone 把它放在底部工具列；iPad 則在視窗頂部。" },
      choose: { title: "在選單中揀「加至主畫面」", text: "它多數藏在第一排動作下面；未見到就把清單往下拉。" },
      add: { title: "按「加入」確認", text: "建議名稱 ShelfSpring 可以照用。" },
      open: { title: "打開新圖示，再登入一次", text: "主畫面 App 與 Safari 的登入是分開的。用平時的電郵登入，監察清單會原封不動出現。" },
      allow: { title: "按「啟用通知」，然後允許", text: "這個按鈕在 App 的監察清單頁上。權限詢問 iOS 只會彈出一次。" },
    },
    android: {
      chrome: { title: "在 Chrome 載入 shelfspring.com", text: "Edge 及 Samsung Internet 的做法一樣；其他 App 內置的瀏覽器則不支援。" },
      install: { title: "接受 Chrome 的安裝建議", text: "確認一次即可，毋須經應用程式商店。" },
      menu: { title: "按 ⋮，再按「加至主畫面」", text: "部分 Chrome 版本把這一項叫做**安裝應用程式**。" },
      open: { title: "打開 ShelfSpring 並登入", text: "新圖示會放在主畫面，有時則收在 App 清單裏。用平時的電郵登入，就會見到同一份監察清單。" },
      allow: { title: "按「啟用通知」，然後允許", text: "權限詢問 Android 只彈一次。普通 Chrome 分頁裏，同一個按鈕也用得到。" },
    },
    desktop: {
      allow: { title: "按「啟用通知」", text: "支援 Chrome、Edge、Firefox，以及 macOS Ventura 或以後版本上的 Safari 16.1+。瀏覽器彈出權限詢問時按允許。" },
      install: { title: "可選：讓 ShelfSpring 在獨立視窗運行", text: "Chrome 及 Edge 會為此顯示安裝圖示。提示能否在背景送達，視乎瀏覽器和系統設定。" },
      phone: { title: "手機也加上", text: "手機上登入同一個電郵地址。凡是啟用了通知的裝置，每個提示都會各收一份。" },
    },
  },
  action: {
    install: "安裝 ShelfSpring",
    on: "✓ 這部裝置已啟用。",
    sendTest: "發一個測試提示",
    needsInstall: "這個按鈕要在主畫面 App 內使用，Safari 內不行。",
    signInFirst: "登入後繼續",
    signInThenOn: "登入並啟用",
    turnOn: "啟用通知",
    denied: "通知被擋住了。請在「設定」允許 ShelfSpring，再重新載入頁面。",
  },
  notes: [
    { q: "iPhone 只能用 Safari 嗎？", a: "圖片跟隨 Safari 的分享選單。在 iOS 及 iPadOS 16.4 或以後版本，其他支援的瀏覽器也可能提供「加至主畫面」。要啟用網頁通知，請打開已安裝的主畫面 App。" },
    { q: "我的手機會一直查看存貨嗎？", a: "查看存貨在我們的伺服器上進行。你的瀏覽器或主畫面 App 只負責接收和顯示通知。" },
    { q: "一部啟用了的裝置都沒有，會怎樣？", a: "每個提示會改為電郵寄到你帳戶的地址。有啟用的裝置時，提示會推送到裝置；只有所有裝置都聯絡不上，才由電郵補上。" },
    { q: "可以多過一部裝置收提示嗎？", a: "可以。到處都用同一個電郵登入；凡是啟用了通知的裝置，每個提示都會各收一份。" },
  ],
  cta: { title: "裝置準備好了，還要一份有用的監察清單。", button: "揀選 iPhone 和取貨店舖" },

  mocks: {
    share: "分享",
    shareSheet: { copy: "拷貝", readingList: "加至閱讀列表", bookmark: "加入書籤", favorites: "加至喜好項目", addToHome: "加至主畫面", markup: "標示" },
    addDialog: { cancel: "取消", title: "加至主畫面", add: "加入", note: "一個圖像將會加至你的主畫面，讓你可以快速取用此網站。" },
    iosAlert: { title: "「ShelfSpring」想傳送通知給你", text: "通知可能包括提示、聲音和圖像標記。你可在「設定」中設定這些項目。", dontAllow: "不允許", allow: "允許" },
    chromeMenuLabel: "選單",
    chromeMenu: { before: ["新分頁", "記錄", "下載", "書籤", "分享…"], add: "加至主畫面", after: ["電腦版網站"] },
    androidAlert: { title: "要允許 ShelfSpring 傳送通知給你嗎？", dontAllow: "不允許", allow: "允許" },
    desktopAlert: { wantsTo: "shelfspring.com 想", show: "顯示通知", block: "封鎖", allow: "允許" },
    desktopInstall: { callout: "安裝", title: "安裝 ShelfSpring", text: "會在獨立視窗中開啟", cancel: "取消", install: "安裝" },
    lockScreen: { date: "10月29日 星期四", now: "現在", title: "iPhone 18 Pro 256GB 黑色", body: "Apple Canton Road（廣東道）· 香港尖沙咀——在架，可供取貨。打開 apple.com 落單。" },
  },
};
