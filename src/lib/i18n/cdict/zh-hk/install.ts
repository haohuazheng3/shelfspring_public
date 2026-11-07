/**
 * 繁體中文（香港）client strings: install (the /install guide and its phone screens). The mock labels are the words
 * iOS, Android and Chrome show in Traditional Chinese (Hong Kong): 分享, 加至主畫面, 加入, 允許, 設定 → 通知.
 */
import type { CDict } from "../en";

export const install: CDict["install"] = {
  hero: {
    eyebrow: "準備通知裝置",
    title: "讓候選清單的變化找得到你。",
    lead: "選擇你的裝置，按照對應步驟設定。ShelfSpring 在伺服器上檢查庫存，偵測到符合規則的變動後才發送通知。實際接收時間可能不同。",
    seeSteps: "查看步驟",
    sendTest: "發送測試",
    turnOn: "開啟通知",
    already: "**已有設定好的裝置：{label}。** 如要同時使用這部裝置，請完成以下步驟並發送測試。{link}",
    myAlerts: "我的提醒",
  },
  progress: {
    homeScreen: "已在主畫面",
    signedIn: "已登入",
    on: "通知已開啟",
    blocked: "已在設定中封鎖——見第 {n} 步。",
  },
  steps: {
    title: "按照你的裝置選擇設定步驟",
    intro: {
      ios: "在 iPhone 或 iPad 上，先將 ShelfSpring 加入主畫面，再從該 App 開啟通知。",
      android: "Android 可使用支援通知的瀏覽器。安裝會建立專用入口，但並非接收通知的必要條件。",
      desktop: "在電腦上允許瀏覽器通知，並一併檢查作業系統的通知設定。",
    },
    tabsLabel: "你的裝置",
    tabs: { ios: "iPhone / iPad", android: "Android", desktop: "電腦" },
    ios: {
      safari: { title: "用 Safari 打開 shelfspring.com", text: "本指南以 Safari 示範。請直接在瀏覽器內開啟網站，方便找到圖中的操作選項。" },
      share: { title: "按「分享」", text: "在瀏覽器工具列尋找分享圖示；位置會隨版本及選用的版面配置而不同。" },
      choose: { title: "選擇「加至主畫面」", text: "在分享選單內尋找這個動作。如未能立即找到，請捲動操作清單。" },
      add: { title: "按「加入」", text: "確認名稱為 ShelfSpring，再完成新增主畫面圖示。" },
      open: { title: "從主畫面打開並登入", text: "開啟新圖示，以帳戶使用的電郵登入。主畫面 App 可能需要另外登入。" },
      allow: { title: "按「開啟通知」，再按「允許」", text: "使用這個頁面或帳戶中的按鈕，並允許系統提出的通知要求。然後從這部裝置發送測試。" },
    },
    android: {
      chrome: { title: "用 Chrome 打開 shelfspring.com", text: "圖示以 Chrome 為例。如連結在其他 App 內開啟，請改用完整瀏覽器開啟網站。" },
      install: { title: "安裝 App", text: "如瀏覽器提供安裝提示，請確認其對話視窗。毋須從應用程式商店下載。" },
      menu: { title: "選單 ⋮ →「加至主畫面」", text: "選項亦可能顯示為**安裝應用程式**。即使沒有此選項，也能繼續使用瀏覽器分頁。" },
      open: { title: "打開 ShelfSpring 並登入", text: "開啟圖示或返回分頁，使用同一帳戶的電郵找回已儲存的候選清單。" },
      allow: { title: "按「開啟通知」，再按「允許」", text: "允許瀏覽器的通知要求。如未收到測試，亦請檢查 Android 通知權限及電池使用限制。" },
    },
    desktop: {
      allow: { title: "按「開啟通知」", text: "在支援的瀏覽器中允許 ShelfSpring，然後發送測試。專注模式或系統設定可能令通知不顯示。" },
      install: { title: "可選：替 ShelfSpring 建立獨立視窗", text: "Chrome 及 Edge 可能提供安裝圖示。即使已安裝，背景接收仍取決於瀏覽器及作業系統設定。" },
      phone: { title: "手機也一樣", text: "在手機上以同一電郵登入。每部裝置都需要分別允許通知並進行測試。" },
    },
  },
  action: {
    install: "安裝 ShelfSpring",
    on: "✓ 這部裝置的通知已開啟。",
    sendTest: "發送測試",
    needsInstall: "打開主畫面 App 後即可使用。",
    signInFirst: "請先登入",
    signInThenOn: "登入後開啟",
    turnOn: "開啟通知",
    denied: "已封鎖。請在「設定」中允許 ShelfSpring，然後重新載入。",
  },
  notes: [{"q":"為甚麼 iPhone 指南使用 Safari？","a":"圖示按照 Safari 的選單製作。其他瀏覽器亦可能提供加入主畫面的功能，但選單及操作方式可能不同。"},{"q":"手機會持續檢查庫存嗎？","a":"庫存檢查在伺服器上進行。瀏覽器或主畫面 App 負責接收及顯示通知。"},{"q":"無法使用推送時怎麼辦？","a":"電郵是後備通知途徑。亦請查看垃圾郵件資料夾；電郵傳送同樣可能需要時間。"},{"q":"如何準備多部裝置？","a":"每部都使用同一帳戶登入，分別允許通知，再從每部裝置發送測試。"}],
  cta: { title: "裝置準備好了，再選一份實用的候選清單。", button: "選擇 iPhone 及取貨店舖" },

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
    lockScreen: { date: "10月29日 星期四", now: "現在", title: "iPhone 18 Pro 256GB 黑色", body: "Apple Canton Road（廣東道）· 香港尖沙咀——今天可提供。按此在 apple.com 預訂。" },
  },
};
