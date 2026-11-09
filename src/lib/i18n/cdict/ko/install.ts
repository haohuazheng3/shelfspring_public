import type { CDict } from "../en";

/** 한국어 클라이언트 문구: install (/install 가이드와 손그림 화면). 목업 라벨은 한국어 iOS·Android·Chrome의 실제 표기를 따라요. */
export const install: CDict["install"] = {
  hero: {
    eyebrow: "기기 연결",
    title: "관찰 목록이 나에게 닿을 길을 하나 열어 두세요.",
    lead: "아래에서 기기를 고르고 그 기기의 순서를 따라가세요. 재고 확인은 ShelfSpring 서버가 하고, 맞는 변화가 확인되면 이 기기가 알림을 받아요. 도착하는 시간은 그때그때 달라요.",
    seeSteps: "연결 순서로 건너뛰기",
    sendTest: "시험 알림 보내기",
    turnOn: "알림 허용하기",
    already: "**✓ 이미 받고 있는 기기가 있어요.** 알림은 {label}(으)로 가요. 이 기기도 더하고 싶을 때만 아래 순서를 따라가세요. {link}",
    myAlerts: "관찰 목록 보기",
  },
  progress: {
    homeScreen: "홈 화면에 저장 완료",
    signedIn: "계정 열림",
    on: "알림 허용 완료",
    blocked: "지금 설정이 알림을 막고 있어요. 어디서 바꾸는지는 {n}단계에 있어요.",
  },
  steps: {
    title: "내 기기의 순서 따라가기",
    intro: {
      ios: "iPhone과 iPad에서 Apple은 홈 화면에 저장된 사이트에만 웹 알림을 보내 줘요. 그래서 그 저장이 첫 단계예요.",
      android: "Chrome은 평범한 탭에서도 알림을 보낼 수 있어요. 홈 화면에 앱을 두는 건 골라서 하면 돼요.",
      desktop: "컴퓨터 브라우저는 따로 설치할 것 없이 바로 알림을 받을 수 있어요.",
    },
    tabsLabel: "기기 종류",
    tabs: { ios: "iPhone 또는 iPad", android: "Android 휴대폰", desktop: "Mac 또는 PC" },
    ios: {
      safari: { title: "Safari로 shelfspring.com 띄우기", text: "그림은 Safari를 따라가요. 다른 앱 안에서 읽고 있다면 먼저 브라우저에서 사이트를 연 뒤 이어 가세요." },
      share: { title: "공유 버튼 찾기", text: "iPhone은 아래쪽 도구 막대에, iPad는 창 위쪽에 있어요." },
      choose: { title: "시트에서 ‘홈 화면에 추가’ 고르기", text: "첫 몇 줄 아래에 숨어 있을 때가 많으니, 안 보이면 목록을 내려 보세요." },
      add: { title: "‘추가’로 확정", text: "제안된 이름 ShelfSpring은 그대로 둬도 돼요." },
      open: { title: "새 아이콘을 실행하고 다시 로그인", text: "홈 화면 앱은 Safari와 로그인 상태를 따로 가져요. 늘 쓰던 이메일로 들어가면 관찰 목록이 그대로 보여요." },
      allow: { title: "‘알림 허용하기’를 누르고 ‘허용’", text: "버튼은 앱 안의 관찰 목록 페이지에 있어요. iOS의 권한 창은 딱 한 번만 떠요." },
    },
    android: {
      chrome: { title: "Chrome으로 shelfspring.com 띄우기", text: "Edge와 삼성 인터넷도 똑같이 돼요. 다른 앱에 들어 있는 브라우저는 이 기능을 지원하지 않아요." },
      install: { title: "Chrome의 설치 제안 받아들이기", text: "확인 한 번이면 끝나요. 앱 스토어를 거치지 않아요." },
      menu: { title: "⋮ 다음 ‘홈 화면에 추가’", text: "Chrome 버전에 따라 이 항목 이름이 **앱 설치**일 수도 있어요." },
      open: { title: "ShelfSpring을 실행하고 로그인", text: "아이콘은 홈 화면이나 앱 서랍에 생겨요. 늘 쓰던 이메일로 로그인하면 같은 관찰 목록이 보여요." },
      allow: { title: "‘알림 허용하기’를 누르고 ‘허용’", text: "Android 권한 창은 한 번만 떠요. 같은 버튼은 평범한 Chrome 탭에서도 작동해요." },
    },
    desktop: {
      allow: { title: "‘알림 허용하기’ 누르기", text: "Chrome, Edge, Firefox, 그리고 macOS Ventura 이상의 Safari 16.1 이상을 지원해요. 브라우저가 띄우는 권한 창에서 허용하세요." },
      install: { title: "골라서: ShelfSpring을 별도 창으로", text: "Chrome과 Edge에는 이를 위한 설치 아이콘이 보여요. 창을 닫아 둔 동안 알림이 오는지는 브라우저와 시스템 설정에 달려 있어요." },
      phone: { title: "휴대폰도 함께 연결", text: "휴대폰에서도 같은 이메일 주소를 쓰세요. 알림을 허용한 기기마다 알림이 한 통씩 가요." },
    },
  },
  action: {
    install: "ShelfSpring 설치하기",
    on: "✓ 이 기기는 연결돼 있어요.",
    sendTest: "시험 알림 보내기",
    needsInstall: "이 버튼은 Safari가 아니라 홈 화면 앱 안에서 작동해요.",
    signInFirst: "로그인하고 계속하기",
    signInThenOn: "로그인하고 허용하기",
    turnOn: "알림 허용하기",
    denied: "알림이 막혀 있어요. 설정에서 ShelfSpring을 허용한 뒤 페이지를 다시 불러오세요.",
  },
  notes: [
    { q: "iPhone에서는 Safari만 되나요?", a: "그림은 Safari의 공유 메뉴를 따라갈 뿐이에요. iOS·iPadOS 16.4 이상에서는 지원되는 다른 브라우저도 ‘홈 화면에 추가’를 보여 줄 수 있어요. 웹 알림은 설치된 홈 화면 앱을 열어서 허용하세요." },
    { q: "내 휴대폰이 계속 재고를 들여다보나요?", a: "아니요. 재고 확인은 저희 서버가 해요. 브라우저나 홈 화면 앱은 알림을 받아서 띄우는 일만 해요." },
    { q: "허용된 기기가 하나도 없으면요?", a: "그때는 알림이 계정 이메일로 한 통씩 가요. 기기가 연결돼 있으면 그 기기로 푸시가 가고, 어느 기기에도 닿지 않을 때만 이메일이 대신해요." },
    { q: "여러 기기로 받을 수 있나요?", a: "네. 어디서 로그인하든 이메일 주소 하나만 쓰세요. 알림을 허용한 기기마다 같은 알림이 도착해요." },
  ],
  cta: { title: "기기가 준비됐다면, 이제 쓸모 있는 관찰 목록이 필요해요.", button: "휴대폰과 픽업 매장 고르기" },

  mocks: {
    share: "공유",
    shareSheet: { copy: "복사", readingList: "읽기 목록에 추가", bookmark: "책갈피 추가", favorites: "즐겨찾기에 추가", addToHome: "홈 화면에 추가", markup: "마크업" },
    addDialog: { cancel: "취소", title: "홈 화면에 추가", add: "추가", note: "이 웹 사이트에 빠르게 접근할 수 있도록 홈 화면에 아이콘이 추가됩니다." },
    iosAlert: { title: "‘ShelfSpring’에서 알림을 보내고자 합니다", text: "경고, 사운드 및 아이콘 배지가 알림에 포함될 수 있습니다. 설정에서 이를 구성할 수 있습니다.", dontAllow: "허용 안 함", allow: "허용" },
    chromeMenuLabel: "메뉴",
    chromeMenu: { before: ["새 탭", "방문 기록", "다운로드", "북마크", "공유…"], add: "홈 화면에 추가", after: ["데스크톱 사이트"] },
    androidAlert: { title: "ShelfSpring에서 알림을 보내도록 허용하시겠습니까?", dontAllow: "허용 안함", allow: "허용" },
    desktopAlert: { wantsTo: "shelfspring.com에서 다음 권한을 요청합니다.", show: "알림 표시", block: "차단", allow: "허용" },
    desktopInstall: { callout: "설치", title: "ShelfSpring 앱 설치", text: "별도 창에서 열려요", cancel: "취소", install: "설치" },
    lockScreen: { date: "10월 29일 목요일", now: "지금", title: "iPhone 18 Pro 256GB 블랙", body: "Apple 가로수길 · 서울 — 픽업 진열 중. 주문은 apple.com에서 하세요." },
  },
};
