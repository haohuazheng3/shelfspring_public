import type { CDict } from "../en";

/** 한국어 클라이언트 문구: install (/install 가이드와 손그림 화면). 목업 라벨은 한국어 iOS·Android·Chrome의 실제 표기를 따라요. */
export const install: CDict["install"] = {
  hero: {
    eyebrow: "기기 준비",
    title: "관심 목록의 변화를 내 기기로.",
    lead: "사용하는 기기를 선택하고 알맞은 절차를 따르세요. ShelfSpring은 서버에서 재고를 확인하고 조건에 맞는 변화를 감지한 뒤 알림을 보냅니다. 수신까지 걸리는 시간은 달라질 수 있습니다.",
    seeSteps: "방법 보기",
    sendTest: "테스트 보내기",
    turnOn: "알림 켜기",
    already: "**이미 설정된 기기: {label}.** 이 기기도 사용하려면 아래 절차를 완료하고 테스트를 보내세요. {link}",
    myAlerts: "내 알림",
  },
  progress: {
    homeScreen: "홈 화면에 추가됨",
    signedIn: "로그인됨",
    on: "알림 켜짐",
    blocked: "설정에서 차단됨: {n}단계를 보세요.",
  },
  steps: {
    title: "기기에 맞는 경로 선택하기",
    intro: {
      ios: "iPhone과 iPad에서는 먼저 ShelfSpring을 홈 화면에 추가하세요. 추가한 앱을 열어 알림을 켜야 합니다.",
      android: "Android에서는 지원되는 브라우저를 사용할 수 있습니다. 설치하면 별도 아이콘이 생기지만 알림에 꼭 필요한 것은 아닙니다.",
      desktop: "컴퓨터에서는 브라우저 알림을 허용하고 운영체제의 알림 설정도 확인하세요.",
    },
    tabsLabel: "내 기기",
    tabs: { ios: "iPhone / iPad", android: "Android", desktop: "컴퓨터" },
    ios: {
      safari: { title: "Safari에서 shelfspring.com 열기", text: "이 가이드는 Safari 화면으로 설명합니다. 그림과 같은 기능을 찾을 수 있도록 사이트를 브라우저에서 직접 여세요." },
      share: { title: "공유 탭하기", text: "브라우저 도구 막대에서 공유 아이콘을 찾으세요. 위치는 버전과 선택한 화면 구성에 따라 달라집니다." },
      choose: { title: "‘홈 화면에 추가’ 선택", text: "공유 메뉴에서 이 항목을 찾으세요. 바로 보이지 않으면 동작 목록을 스크롤하세요." },
      add: { title: "추가 탭하기", text: "이름이 ShelfSpring인지 확인하고 홈 화면에 아이콘 추가를 확정하세요." },
      open: { title: "홈 화면에서 열고 로그인", text: "새 아이콘을 열고 계정의 이메일로 로그인하세요. 홈 화면 앱에서 별도로 로그인해야 할 수 있습니다." },
      allow: { title: "‘알림 켜기’를 누른 뒤 허용", text: "이 페이지나 계정의 버튼을 누르고 시스템의 권한 요청을 허용하세요. 그런 다음 이 기기에서 테스트를 보내세요." },
    },
    android: {
      chrome: { title: "Chrome에서 shelfspring.com 열기", text: "그림은 Chrome을 기준으로 합니다. 다른 앱 안에서 링크를 열었다면 일반 브라우저로 다시 여세요." },
      install: { title: "앱 설치", text: "브라우저가 설치를 제안하면 확인 창에서 진행하세요. 앱 스토어에서 다운로드할 필요는 없습니다." },
      menu: { title: "메뉴 ⋮ → ‘홈 화면에 추가’", text: "**앱 설치**로 표시될 수도 있습니다. 항목이 없어도 브라우저 탭에서 계속 사용할 수 있습니다." },
      open: { title: "ShelfSpring를 열고 로그인", text: "아이콘을 열거나 탭으로 돌아와 같은 계정의 이메일로 저장한 후보 목록을 확인하세요." },
      allow: { title: "‘알림 켜기’를 누른 뒤 허용", text: "브라우저의 알림 요청을 허용하세요. 테스트가 오지 않으면 Android의 알림 권한과 배터리 제한도 확인하세요." },
    },
    desktop: {
      allow: { title: "‘알림 켜기’ 누르기", text: "지원되는 브라우저에서 ShelfSpring을 허용하고 테스트를 보내세요. 집중 모드나 시스템 설정 때문에 알림이 표시되지 않을 수 있습니다." },
      install: { title: "선택 사항: ShelfSpring 전용 창 만들기", text: "Chrome과 Edge에서 설치 아이콘을 제공할 수 있습니다. 설치 후에도 백그라운드 수신은 브라우저와 운영체제 설정에 영향을 받습니다." },
      phone: { title: "휴대폰에서도", text: "휴대전화에서도 같은 이메일로 로그인하세요. 기기마다 따로 알림을 허용하고 테스트하세요." },
    },
  },
  action: {
    install: "ShelfSpring 설치",
    on: "✓ 이 기기에서 알림이 켜져 있어요.",
    sendTest: "테스트 보내기",
    needsInstall: "홈 화면 앱을 열면 쓸 수 있어요.",
    signInFirst: "먼저 로그인",
    signInThenOn: "로그인 후 알림 켜기",
    turnOn: "알림 켜기",
    denied: "차단됨. 설정에서 ShelfSpring 알림을 허용한 뒤 새로고침하세요.",
  },
  notes: [{"q":"iPhone 가이드는 왜 Safari를 보여 주나요?","a":"그림이 Safari 메뉴를 기준으로 하기 때문입니다. 다른 브라우저도 홈 화면 추가 기능을 제공할 수 있지만 메뉴가 다를 수 있습니다."},{"q":"휴대전화가 계속 재고를 확인하나요?","a":"재고 확인은 서버에서 합니다. 브라우저나 홈 화면 앱은 알림 수신과 표시를 처리합니다."},{"q":"푸시를 사용할 수 없으면 어떻게 되나요?","a":"이메일이 대체 전달 경로입니다. 스팸함도 확인하세요. 이메일 전달에도 시간이 걸릴 수 있습니다."},{"q":"여러 기기를 준비하려면요?","a":"모두 같은 계정으로 로그인하고 각 기기에서 알림을 허용한 뒤 기기별로 테스트를 보내세요."}],
  cta: { title: "기기를 준비했다면 필요한 후보를 골라보세요.", button: "iPhone과 픽업 매장 선택" },

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
    lockScreen: { date: "10월 29일 목요일", now: "지금", title: "iPhone 18 Pro 256GB 블랙", body: "Apple 가로수길 · 서울 — 오늘 픽업 가능. 탭해서 apple.com에서 예약하세요." },
  },
};
