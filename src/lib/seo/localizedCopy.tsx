/** ShelfSpring public copy. Data and tax builders remain shared with the proven source. */
import { modelByKey, storesOf } from "@/lib/apple/catalog";
import type { CountryCode } from "@/lib/apple/countries";
import { appleStoreLabel, cityLabel, countryLabel, regionLabel } from "@/lib/i18n/places";
import { fitTitleW, num } from "@/lib/i18n/format";
import type { Lang } from "@/lib/i18n/locales";
import type { basePlace } from "@/lib/i18n/dict/en/place";
import type { baseContent } from "@/lib/i18n/dict/en/content";
import type { baseViews } from "@/lib/i18n/dict/en/views";
import type { basePages } from "@/lib/i18n/dict/en/pages";
import type { IntlPlaceInput } from "./countryCopy";
import type { KeywordSection } from "@/components/content/KeywordSections";
type PlaceDictionary = typeof basePlace;
type PagesDictionary = typeof basePages;
const COPY = {
  "en": {
    "heading": "Find your next iPhone pickup window",
    "options": "iPhone pickup options",
    "now": "On the shelf now",
    "returns": "Recorded returns",
    "compare": "Read today's shelf against the return log, then keep only the stores you can actually reach.",
    "evidence": "The shelf status reflects the latest look. The return log shows where listings came back; it is not a forecast of the next delivery.",
    "steps": "Settle on one configuration, then add every store within reach. If none of them has it on the shelf, put an alert on your watchlist. Place the order with Apple before you set off.",
    "definition": "A return is one configuration at one store going from off the shelf to on the shelf, once confirmed. Each repeat is logged as its own return; the count is of events, not phones.",
    "timingQ": "Can the usual return hour tell me when to set off?",
    "timingA": "Past hours describe the log, not an appointment. The shelf can change between two looks, so leave only once Apple confirms your pickup order.",
    "reserveQ": "Can ShelfSpring set an iPhone aside for me?",
    "reserveA": "No. ShelfSpring only logs what is on the shelf. Apple takes the order, confirms the collection time and keeps the phone for you.",
    "watchQ": "What belongs on my watchlist?",
    "watchA": "Only the model, capacity and finish you would actually buy, at stores you can reach. Each alert on the list pairs a single store with a single exact configuration.",
    "coverage": "Historical inventory coverage begins November 2",
    "last30": "within the latest 30-day window",
    "sample": "Observed sample",
    "countNote": "Counts are store × configuration pairs, not reservations."
  },
  "ja": {
    "heading": "次のiPhone受け取り機会を探す",
    "options": "iPhoneの受け取り候補",
    "now": "いま棚に",
    "returns": "台帳の再入荷",
    "compare": "今日の棚と再入荷ログを並べて、本当に足を運べる店舗だけを残しましょう。",
    "evidence": "棚の状況は直近の確認時点のものです。再入荷ログは構成が戻ってきた場所を示すだけで、次の入荷を予告するものではありません。",
    "steps": "構成をひとつに決め、行ける店舗を加えます。どの棚にもなければ、見守りリストに通知を追加してください。出かける前にAppleで注文を済ませましょう。",
    "definition": "ある店舗のある構成が「棚になし」から「棚にあり」へ移り、確認がとれたとき、台帳に再入荷を1件記します。繰り返しは毎回別の1件として記し、端末が何台あるかは示しません。",
    "timingQ": "いつもの再入荷時刻を見て出かけてもいいですか？",
    "timingA": "時刻の傾向は台帳の記録であって、来店の約束ではありません。2回の確認のあいだにも棚は動きます。受取の確定をAppleが知らせてくれてから出発してください。",
    "reserveQ": "ShelfSpringはiPhoneを取り置いてくれますか？",
    "reserveA": "いいえ。ShelfSpringは棚にあるものを記録するだけです。注文の受付、受取時刻の確定、端末の確保はすべてAppleが行います。",
    "watchQ": "見守りリストには何を入れればよいですか？",
    "watchA": "実際に買う機種・容量・色だけを、行ける店舗と一緒に登録します。通知1件が受け持つのは、1つの店舗と1つの構成です。",
    "coverage": "過去の在庫記録は11月2日から",
    "last30": "直近30日間の記録で",
    "sample": "記録のサンプル",
    "countNote": "店舗×構成のペアを数えたもので、予約とは別物です。"
  },
  "ko": {
    "heading": "진열대에서 찾는 다음 iPhone",
    "options": "매장별 iPhone 진열 현황",
    "now": "지금 진열",
    "returns": "기록된 재진열",
    "compare": "오늘의 진열 상태를 재진열 일지와 나란히 놓고, 정말 갈 수 있는 매장만 남겨 보세요.",
    "evidence": "진열 상태는 가장 최근 관측 기준이에요. 일지는 구성이 다시 나타난 곳을 보여 줄 뿐, 다음 입고를 예고하지 않아요.",
    "steps": "구성 하나를 정하고 갈 수 있는 매장을 더하세요. 어디에도 진열되어 있지 않으면 관찰 목록에 알림을 넣어 두세요. 출발 전에 Apple에서 주문을 마치세요.",
    "definition": "한 매장에서 한 구성이 ‘빠짐’에서 ‘진열 중’으로 넘어가고 그 변화가 확인되면 일지에 재진열 한 건을 적어요. 되풀이될 때마다 새 건으로 적으며, 기기 대수를 센 것이 아니에요.",
    "timingQ": "평소 재진열 시각을 보고 출발해도 될까요?",
    "timingA": "시각 기록은 일지일 뿐 방문 약속이 아니에요. 두 번의 관측 사이에도 진열은 바뀌니, Apple이 픽업 주문을 확인해 준 뒤에 출발하세요.",
    "reserveQ": "ShelfSpring이 iPhone을 따로 잡아 두나요?",
    "reserveA": "아니요. ShelfSpring은 진열된 것을 기록할 뿐이에요. 주문 접수, 픽업 시간 확정, 기기 보관은 모두 Apple이 맡아요.",
    "watchQ": "관찰 목록에는 무엇을 넣어야 하나요?",
    "watchA": "실제로 살 모델·용량·색상만, 갈 수 있는 매장과 짝지어 넣으세요. 알림 한 건은 한 매장에서 정확히 한 구성만 지켜봐요.",
    "coverage": "과거 재고 기록은 11월 2일부터",
    "last30": "최근 30일 기록에서",
    "sample": "관측 표본",
    "countNote": "매장×구성 쌍의 개수예요. 예약 수가 아니에요."
  },
  "zh-TW": {
    "heading": "找出下一支上架中的 iPhone",
    "options": "各門市 iPhone 上架一覽",
    "now": "現在上架中",
    "returns": "記錄到的重新上架",
    "compare": "把今天的貨架和上架日誌放在一起看，只留下你真的到得了的門市。",
    "evidence": "上架狀態以最近一次查看為準。上架日誌記下組合在哪裡重新上架，不會預告下一批貨何時到。",
    "steps": "先選定一種組合，再加入到得了的門市。如果每家都沒有上架，就在追蹤清單加一則提醒。出發前先向 Apple 完成訂購。",
    "definition": "重新上架的定義：同一家門市、同一種組合，從「已下架」變成「上架中」，而且變化經過確認。每次重複都另記一筆；記的是事件，跟手機支數無關。",
    "timingQ": "平常重新上架的時段，可以拿來決定何時出門嗎？",
    "timingA": "時段只是觀測簿的紀錄，不是預約。兩次查看之間貨架隨時可能變動，等 Apple 確認你的取貨訂單再出發。",
    "reserveQ": "ShelfSpring 可以幫我保留一支 iPhone 嗎？",
    "reserveA": "不行。ShelfSpring 只記錄貨架上有什麼；接單、確認取貨時間和替你保留手機，都由 Apple 負責。",
    "watchQ": "追蹤清單該放哪些東西？",
    "watchA": "只放你真的會買的機型、容量和機身色，再配上到得了的門市。每則提醒只對應一家門市和一種確切組合。",
    "coverage": "歷史庫存紀錄自11月2日起",
    "last30": "近30天的紀錄中",
    "sample": "觀察樣本",
    "countNote": "以「門市 × 組合」逐對計算，不是預訂數。"
  },
  "zh-HK": {
    "heading": "找出下一部在架、可取貨的 iPhone",
    "options": "可取貨的 iPhone 一覽",
    "now": "此刻在架",
    "returns": "已錄得的回架",
    "compare": "把今日的貨架和回架日誌放在一起看，只留下你真正去得到的店。",
    "evidence": "在架狀態以最近一次查看為準。回架日誌記下配置在哪裡回架，並不預告下一批貨何時到。",
    "steps": "先定好一個配置，再加入去得到的店。如果全部都未在架，就在監察清單加一個提示。出發前先向 Apple 落單。",
    "definition": "回架的定義：同一間店、同一個配置，由「落架」變成「在架」，而且變化已經確認。重複發生就逐筆再記；記的是事件，與手機部數無關。",
    "timingQ": "慣常的回架鐘點，可以用來決定幾時出門嗎？",
    "timingA": "鐘點只是觀察簿的紀錄，不是預約。兩次查看之間貨架隨時會變，等 Apple 確認你的取貨訂單後才出發。",
    "reserveQ": "ShelfSpring 可以幫我留起 iPhone 嗎？",
    "reserveA": "不可以。ShelfSpring 只記錄貨架上有甚麼；接單、確認取貨時間和替你留機，全部由 Apple 負責。",
    "watchQ": "監察清單應該放甚麼？",
    "watchA": "只放你真會買的型號、容量及機色，配上去得到的店。每個提示只對應一間店和一個確切配置。",
    "coverage": "歷史存貨紀錄由11月2日起",
    "last30": "近30日的紀錄中",
    "sample": "觀察樣本",
    "countNote": "以「店 × 配置」逐對計算，不是預訂數目。"
  },
  "de": {
    "heading": "Das nächste iPhone zur Abholung finden",
    "options": "iPhone zur Abholung vergleichen",
    "now": "Jetzt im Regal",
    "returns": "Verzeichnete Rückkehren",
    "compare": "Leg den heutigen Regalstand neben das Rückkehr-Logbuch und behalte nur Stores, die du wirklich erreichst.",
    "evidence": "Der Regalstand gibt den letzten Blick wieder. Das Logbuch zeigt, wo Varianten zurückkamen – eine Vorhersage der nächsten Lieferung ist es nicht.",
    "steps": "Leg dich auf eine Variante fest und nimm die Stores dazu, die du erreichst. Liegt sie nirgends im Regal, setz eine Benachrichtigung auf deine Merkliste. Bestell bei Apple, bevor du losfährst.",
    "definition": "Als Rückkehr verzeichnet wird, wenn eine Variante in einem Store von „nicht im Regal“ auf „im Regal“ springt und das bestätigt ist. Jede Wiederholung ist ein eigener Eintrag; gezählt werden Ereignisse, keine Geräte.",
    "timingQ": "Sagt mir die übliche Rückkehrstunde, wann ich losfahren soll?",
    "timingA": "Die Stunden beschreiben das Logbuch, keinen Termin. Zwischen zwei Blicken kann sich das Regal ändern – fahr erst los, wenn Apple deine Abholung bestätigt hat.",
    "reserveQ": "Legt ShelfSpring mir ein iPhone zurück?",
    "reserveA": "Nein. ShelfSpring verzeichnet nur, was im Regal liegt. Bestellung, Abholzeit und das Zurücklegen des Geräts übernimmt Apple.",
    "watchQ": "Was gehört auf meine Merkliste?",
    "watchA": "Nur Modell, Kapazität und Finish, die du wirklich kaufen würdest – in Stores, die du erreichst. Jede Benachrichtigung verbindet genau einen Store mit genau einer Variante.",
    "coverage": "Historische Bestandsdaten ab 2. November",
    "last30": "im Zeitraum der letzten 30 Tage",
    "sample": "Beobachtete Stichprobe",
    "countNote": "Gezählt sind Paare aus Store und Variante, keine Reservierungen."
  },
  "fr": {
    "heading": "Trouvez votre prochain retrait iPhone",
    "options": "Comparer les possibilités de retrait iPhone",
    "now": "En rayon à présent",
    "returns": "Retours consignés",
    "compare": "Confrontez le rayon du jour au registre des retours, et ne gardez que les magasins vraiment à votre portée.",
    "evidence": "L’état du rayon correspond au dernier passage. Le registre montre où les configurations sont revenues ; il n’annonce pas la prochaine livraison.",
    "steps": "Arrêtez une configuration, puis ajoutez les magasins à votre portée. Si aucun ne l’a en rayon, placez une alerte sur votre liste de veille. Passez commande auprès d’Apple avant de vous déplacer.",
    "definition": "Un retour, c’est une configuration qui repasse de « hors rayon » à « en rayon » dans un magasin, une fois le changement confirmé. Chaque répétition est consignée à part : on compte des événements, pas des téléphones.",
    "timingQ": "L’heure habituelle des retours me dit-elle quand partir ?",
    "timingA": "Ces heures décrivent le registre, pas un rendez-vous. Le rayon peut changer entre deux passages : ne partez qu’après la confirmation de retrait d’Apple.",
    "reserveQ": "ShelfSpring peut-il me mettre un iPhone de côté ?",
    "reserveA": "Non. ShelfSpring consigne seulement ce qui est en rayon. La commande, l’heure de retrait et l’appareil mis de côté relèvent d’Apple.",
    "watchQ": "Que mettre sur ma liste de veille ?",
    "watchA": "Uniquement le modèle, la capacité et la finition que vous achèteriez vraiment, dans des magasins à votre portée. Chaque alerte associe un seul magasin à une seule configuration précise.",
    "coverage": "Historique de stock à partir du 2 novembre",
    "last30": "au cours des 30 derniers jours",
    "sample": "Échantillon observé",
    "countNote": "Paires magasin × configuration ; pas des réservations."
  },
  "it": {
    "heading": "Trova la prossima occasione di ritiro iPhone",
    "options": "Confronta le opzioni di ritiro iPhone",
    "now": "A scaffale adesso",
    "returns": "Rientri registrati",
    "compare": "Metti lo scaffale di oggi accanto al registro dei rientri e tieni solo i negozi che riesci davvero a raggiungere.",
    "evidence": "Lo stato dello scaffale è quello dell’ultima occhiata. Il registro mostra dove le configurazioni sono rientrate; non prevede la prossima consegna.",
    "steps": "Fissa una configurazione e aggiungi i negozi alla tua portata. Se nessuno ce l’ha a scaffale, metti una notifica nella tua lista d’osservazione. Completa l’ordine con Apple prima di muoverti.",
    "definition": "Un rientro è una configurazione che torna a scaffale in un negozio dopo esserne uscita, a cambio confermato. Ogni ripetizione si annota a parte: si contano eventi, non telefoni.",
    "timingQ": "L’ora abituale dei rientri mi dice quando partire?",
    "timingA": "Quelle ore descrivono il registro, non un appuntamento. Fra due occhiate lo scaffale può cambiare: parti solo dopo la conferma di ritiro di Apple.",
    "reserveQ": "ShelfSpring può mettermi da parte un iPhone?",
    "reserveA": "No. ShelfSpring annota solo ciò che è a scaffale. Ordine, orario di ritiro e telefono tenuto da parte sono compito di Apple.",
    "watchQ": "Che cosa metto nella lista d’osservazione?",
    "watchA": "Solo modello, capacità e finitura che compreresti davvero, in negozi alla tua portata. Ogni notifica lega un solo negozio a una sola configurazione esatta.",
    "coverage": "Dati storici di disponibilità dal 2 novembre",
    "last30": "nell’arco degli ultimi 30 giorni",
    "sample": "Campione osservato",
    "countNote": "Coppie negozio × configurazione; non sono prenotazioni."
  },
  "es": {
    "heading": "Encuentra tu próxima recogida de iPhone",
    "options": "Compara opciones de recogida de iPhone",
    "now": "En el estante ahora",
    "returns": "Reapariciones anotadas",
    "compare": "Contrasta el estante de hoy con la bitácora de reapariciones y quédate solo con las tiendas que de verdad te quedan a mano.",
    "evidence": "El estado del estante es el del último vistazo. La bitácora enseña dónde volvió cada configuración; no anticipa la próxima entrega.",
    "steps": "Decide una configuración y añade las tiendas a tu alcance. Si ninguna la tiene en el estante, pon un aviso en tu lista de seguimiento. Haz el pedido a Apple antes de salir.",
    "definition": "Hay una reaparición cuando una configuración vuelve al estante de una tienda tras estar fuera y el cambio queda confirmado. Cada repetición se anota aparte: se cuentan sucesos, no teléfonos.",
    "timingQ": "¿La hora habitual de reaparición me dice cuándo salir?",
    "timingA": "Esas horas describen la bitácora, no una cita. El estante puede cambiar entre dos vistazos: sal solo cuando Apple confirme tu recogida.",
    "reserveQ": "¿ShelfSpring me guarda un iPhone?",
    "reserveA": "No. ShelfSpring solo anota lo que hay en el estante. El pedido, la hora de recogida y apartar el teléfono corren a cargo de Apple.",
    "watchQ": "¿Qué va en mi lista de seguimiento?",
    "watchA": "Solo el modelo, la capacidad y el acabado que de verdad comprarías, en tiendas a tu alcance. Cada aviso une una sola tienda con una sola configuración exacta.",
    "coverage": "Historial de stock desde el 2 de noviembre",
    "last30": "en el periodo de los últimos 30 días",
    "sample": "Muestra observada",
    "countNote": "Pares tienda × configuración; no son reservas."
  },
  "nl": {
    "heading": "Vind je volgende iPhone om af te halen",
    "options": "Vergelijk iPhone-afhaalopties",
    "now": "Nu in het schap",
    "returns": "Genoteerde rentrees",
    "compare": "Leg het schap van vandaag naast de rentreelog en houd alleen de winkels over die je echt kunt halen.",
    "evidence": "De schapstatus is die van de laatste blik. De rentreelog toont waar uitvoeringen terugkwamen; een voorspelling van de volgende levering is het niet.",
    "steps": "Kies één uitvoering en voeg de winkels toe die je kunt bereiken. Ligt ze nergens in het schap, zet dan een melding op je volglijst. Bestel bij Apple voordat je vertrekt.",
    "definition": "Een rentree: in één winkel gaat één uitvoering van ‘uit het schap’ naar ‘in het schap’, en die wissel is bevestigd. Elke herhaling krijgt een eigen regel: er worden gebeurtenissen geteld, geen telefoons.",
    "timingQ": "Zegt het gebruikelijke rentree-uur wanneer ik moet vertrekken?",
    "timingA": "Die uren beschrijven de rentreelog, geen afspraak. Tussen twee blikken kan het schap veranderen: vertrek pas als Apple je afhaalbestelling bevestigt.",
    "reserveQ": "Legt ShelfSpring een iPhone voor me opzij?",
    "reserveA": "Nee. ShelfSpring noteert alleen wat in het schap ligt. De bestelling, het afhaaltijdstip en het apart houden van de telefoon regelt Apple.",
    "watchQ": "Wat hoort er op mijn volglijst?",
    "watchA": "Alleen het model, de capaciteit en de afwerking die je echt zou kopen, in winkels die je kunt bereiken. Elke melding koppelt één winkel aan één exacte uitvoering.",
    "coverage": "Historische voorraadgegevens vanaf 2 november",
    "last30": "binnen de laatste 30 dagen",
    "sample": "Waargenomen steekproef",
    "countNote": "Paren van winkel × uitvoering; geen reserveringen."
  },
  "sv": {
    "heading": "Hitta nästa iPhone att hämta",
    "options": "Jämför hämtning av iPhone",
    "now": "På hyllan nu",
    "returns": "Loggade återkomster",
    "compare": "Lägg dagens hylla bredvid återkomstloggen och behåll bara butikerna du faktiskt hinner till.",
    "evidence": "Hyllstatusen gäller den senaste avläsningen. Loggen visar var konfigurationer kom tillbaka; den förutsäger inte nästa leverans.",
    "steps": "Bestäm dig för en konfiguration och lägg till butikerna du når. Finns den inte på hyllan någonstans, sätt en avisering på din bevakningslista. Beställ hos Apple innan du åker.",
    "definition": "En återkomst är när en konfiguration i en butik går från borta från hyllan till på hyllan och ändringen är bekräftad. Varje upprepning loggas för sig; det är händelser som räknas, inte telefoner.",
    "timingQ": "Säger den vanliga återkomsttimmen när jag ska åka?",
    "timingA": "Timmarna beskriver loggen, inte en bokad tid. Hyllan kan ändras mellan två avläsningar – åk först när Apple har bekräftat din hämtning.",
    "reserveQ": "Kan ShelfSpring lägga undan en iPhone åt mig?",
    "reserveA": "Nej. ShelfSpring loggar bara vad som finns på hyllan. Beställningen, hämtningstiden och att telefonen läggs undan sköter Apple.",
    "watchQ": "Vad hör hemma på min bevakningslista?",
    "watchA": "Bara den modell, kapacitet och finish du faktiskt skulle köpa, i butiker du kan nå. Varje avisering kopplar en enda butik till en enda exakt konfiguration.",
    "coverage": "Historiska lageruppgifter från 2 november",
    "last30": "inom de senaste 30 dagarna",
    "sample": "Observerat urval",
    "countNote": "Par av butik × konfiguration; inga reservationer."
  },
  "ar": {
    "heading": "اعثر على فرصتك التالية لاستلام iPhone",
    "options": "قارن خيارات استلام iPhone",
    "now": "على الرف الآن",
    "returns": "العودات المدوّنة",
    "compare": "ضع رف اليوم بجانب سجل العودات، واحتفظ فقط بالمتاجر التي تصل إليها فعلًا.",
    "evidence": "حالة الرف هي ما أظهرته آخر معاينة. يبيّن السجل أين عادت التكوينات، ولا يتنبأ بموعد الشحنة التالية.",
    "steps": "حدّد تكوينًا واحدًا وأضف المتاجر التي تصل إليها. إن لم يكن على الرف في أيٍّ منها، فأضف تنبيهًا إلى قائمة المراقبة. أكمل الطلب لدى Apple قبل أن تنطلق.",
    "definition": "يُدوَّن في السجل قيد عودة حين ينتقل تكوين واحد في متجر واحد من «خارج الرف» إلى «على الرف» ويتأكد التغيير. ولكل تكرار قيده الخاص، فالعدّ للأحداث وليس للأجهزة.",
    "timingQ": "هل تخبرني ساعة العودة المعتادة متى أنطلق؟",
    "timingA": "تصف هذه الساعات ما في السجل، لا موعدًا مضمونًا. قد يتغير الرف بين معاينتين، فلا تنطلق قبل أن تؤكد Apple طلب الاستلام.",
    "reserveQ": "هل يحتفظ لي ShelfSpring بجهاز iPhone؟",
    "reserveA": "لا. يدوّن ShelfSpring ما على الرف فقط. أما قبول الطلب وتحديد موعد الاستلام والاحتفاظ بالجهاز فكلها لدى Apple.",
    "watchQ": "ماذا أضع في قائمة المراقبة؟",
    "watchA": "الطراز والسعة والطلاء التي ستشتريها فعلًا فقط، مع متاجر تصل إليها. كل تنبيه يربط متجرًا واحدًا بتكوين واحد محدد.",
    "coverage": "سجل المخزون التاريخي من 2 نوفمبر",
    "last30": "في آخر 30 يوماً من السجل",
    "sample": "العينة المرصودة",
    "countNote": "أزواج متجر × تكوين، وليست حجوزات."
  }
};
/** Wording inside <title>, meta descriptions and JSON-LD descriptions: frozen as published (the snippets are already distinct). Visible prose comes from COPY. */
const SEO = {
  "en": {
    "heading": "Find your next iPhone pickup window",
    "options": "iPhone pickup options",
    "now": "Pickup stock now",
    "returns": "Recorded returns",
    "compare": "Compare the live list with the recent record, then choose stores you can realistically reach.",
    "definition": "A return is a confirmed change from unavailable to available for one store and configuration. Repeated returns are separate events, not a count of phones.",
    "evidence": "The live list answers what is available at the last check. The history shows where listings returned; it does not predict the next delivery.",
    "sample": "Observed sample"
  },
  "ja": {
    "heading": "次のiPhone受け取り機会を探す",
    "options": "iPhoneの受け取り候補",
    "now": "現在の受取在庫",
    "returns": "記録された再入荷",
    "compare": "現在の在庫と過去の記録を見比べ、実際に行ける店舗から候補を絞りましょう。",
    "definition": "再入荷1回は、1店舗の1構成が在庫なしからありに変わり、確認された記録です。同じ構成の再登場は別の記録で、端末台数ではありません。",
    "evidence": "在庫一覧は前回確認時の状況です。履歴は在庫が戻った場所を示し、次の配送時刻を予測するものではありません。",
    "sample": "記録のサンプル"
  },
  "ko": {
    "heading": "다음 iPhone 픽업 기회를 찾으세요",
    "options": "iPhone 픽업 후보",
    "now": "현재 픽업 재고",
    "returns": "기록된 재입고",
    "compare": "현재 재고와 최근 기록을 비교하고 실제로 방문할 수 있는 매장부터 추려 보세요.",
    "definition": "재입고 1건은 한 매장의 특정 구성이 품절에서 구매 가능으로 바뀐 것을 확인한 기록입니다. 반복된 변화는 별도 건수이며 기기 수가 아닙니다.",
    "evidence": "재고 목록은 마지막 확인 시점의 상태입니다. 이력은 재고가 다시 나타난 곳을 보여 주며 다음 배송을 예측하지 않습니다.",
    "sample": "관측 표본"
  },
  "zh-TW": {
    "heading": "找到下一次iPhone取貨機會",
    "options": "iPhone取貨選項",
    "now": "目前取貨庫存",
    "returns": "已記錄的補貨",
    "compare": "把目前庫存和近期紀錄放在一起比較，優先選擇你確實能到達的門市。",
    "definition": "一次補貨是某門市的某個規格由無貨變為有貨，並經確認的事件。重複恢復供貨會分開計算，不代表手機台數。",
    "evidence": "庫存表代表上次查詢時的狀態。歷史紀錄呈現哪些門市曾恢復供貨，不預測下一批到貨時間。",
    "sample": "觀察樣本"
  },
  "zh-HK": {
    "heading": "尋找下一次iPhone取貨機會",
    "options": "iPhone取貨選擇",
    "now": "目前取貨存貨",
    "returns": "已記錄的補貨",
    "compare": "比較即時存貨與近期紀錄，先篩選你實際能到達的Apple Store。",
    "definition": "一次補貨指某店的某個配置由缺貨變為有貨，並經確認的事件。同一配置再次出現會另計，不等於手機數量。",
    "evidence": "存貨表顯示上次查詢的狀態。歷史紀錄說明哪些店曾恢復供貨，不預測下一批送貨時間。",
    "sample": "觀察樣本"
  },
  "de": {
    "heading": "Das nächste iPhone zur Abholung finden",
    "options": "iPhone zur Abholung vergleichen",
    "now": "Abholbestand jetzt",
    "returns": "Erfasste Rückkehr in den Bestand",
    "compare": "Vergleiche den aktuellen Bestand mit den letzten Beobachtungen und wähle Stores, die du erreichen kannst.",
    "definition": "Ein Ereignis ist der bestätigte Wechsel einer Kombination aus Store und Konfiguration von nicht verfügbar zu verfügbar. Wiederholungen zählen einzeln, nicht als Gerätezahl.",
    "evidence": "Die Liste zeigt den Stand der letzten Prüfung. Der Verlauf zeigt, wo Angebote wieder erschienen sind; er sagt keine nächste Lieferung voraus.",
    "sample": "Beobachtete Stichprobe"
  },
  "fr": {
    "heading": "Trouvez votre prochain retrait iPhone",
    "options": "Comparer les possibilités de retrait iPhone",
    "now": "Stock pour retrait maintenant",
    "returns": "Retours en stock observés",
    "compare": "Comparez le stock actuel aux observations récentes, puis choisissez les magasins où vous pouvez vous rendre.",
    "definition": "Un événement est le retour confirmé d’une configuration dans un magasin. Plusieurs retours sont des événements distincts, pas un nombre de téléphones.",
    "evidence": "La liste décrit la dernière vérification. L’historique indique où le stock est revenu, sans prédire la prochaine livraison.",
    "sample": "Échantillon observé"
  },
  "it": {
    "heading": "Trova la prossima occasione di ritiro iPhone",
    "options": "Confronta le opzioni di ritiro iPhone",
    "now": "Disponibilità per il ritiro ora",
    "returns": "Ritorni in stock registrati",
    "compare": "Confronta la disponibilità attuale con le osservazioni recenti e scegli gli store che puoi raggiungere.",
    "definition": "Un evento è il passaggio confermato da non disponibile a disponibile di una configurazione in uno store. I ritorni ripetuti sono eventi distinti, non un conteggio di telefoni.",
    "evidence": "La lista mostra l’ultimo controllo. La cronologia indica dove sono riapparse le disponibilità, senza prevedere la prossima consegna.",
    "sample": "Campione osservato"
  },
  "es": {
    "heading": "Encuentra tu próxima recogida de iPhone",
    "options": "Compara opciones de recogida de iPhone",
    "now": "Stock para recoger ahora",
    "returns": "Reposiciones registradas",
    "compare": "Compara el stock actual con el registro reciente y elige tiendas a las que puedas llegar.",
    "definition": "Un evento es el cambio confirmado de no disponible a disponible para una configuración y una tienda. Las repeticiones son eventos separados, no un número de teléfonos.",
    "evidence": "La lista refleja la última comprobación. El historial muestra dónde volvió el stock, sin predecir la próxima entrega.",
    "sample": "Muestra observada"
  },
  "nl": {
    "heading": "Vind je volgende iPhone om af te halen",
    "options": "Vergelijk iPhone-afhaalopties",
    "now": "Afhaalvoorraad nu",
    "returns": "Vastgelegde voorraadterugkeer",
    "compare": "Vergelijk de actuele voorraad met recente waarnemingen en kies winkels die je kunt bereiken.",
    "definition": "Een gebeurtenis is de bevestigde overgang van niet beschikbaar naar beschikbaar voor één winkel en uitvoering. Herhalingen zijn aparte gebeurtenissen, geen aantal telefoons.",
    "evidence": "De lijst toont de laatste controle. De historie laat zien waar voorraad terugkwam, zonder de volgende levering te voorspellen.",
    "sample": "Waargenomen steekproef"
  },
  "sv": {
    "heading": "Hitta nästa iPhone att hämta",
    "options": "Jämför hämtning av iPhone",
    "now": "Lager för hämtning nu",
    "returns": "Registrerade lageråterkomster",
    "compare": "Jämför aktuellt lager med de senaste observationerna och välj butiker du kan ta dig till.",
    "definition": "En händelse är en bekräftad ändring från slut till tillgänglig för en butik och konfiguration. Upprepade återkomster räknas separat, inte som antal telefoner.",
    "evidence": "Listan visar den senaste kontrollen. Historiken visar var lagret återkom, utan att förutsäga nästa leverans.",
    "sample": "Observerat urval"
  },
  "ar": {
    "heading": "اعثر على فرصتك التالية لاستلام iPhone",
    "options": "قارن خيارات استلام iPhone",
    "now": "مخزون الاستلام الآن",
    "returns": "مرات عودة المخزون المسجلة",
    "compare": "قارن المخزون الحالي بالسجل الحديث، ثم اختر المتاجر التي يمكنك الوصول إليها فعلاً.",
    "definition": "الحدث هو تغير مؤكد من غير متوفر إلى متوفر لتكوين واحد في متجر واحد. العودة المتكررة أحداث منفصلة وليست عدداً من الهواتف.",
    "evidence": "تعكس القائمة آخر فحص. يوضح السجل أين عاد المخزون، ولا يتنبأ بموعد الشحنة التالية.",
    "sample": "العينة المرصودة"
  }
};
const CADENCE = {
  "en": [
    "Frequent inventory updates",
    "An alert goes out after a matching listing is seen on the shelf. Reading the source, syncing and notification delivery can each add some delay."
  ],
  "ja": [
    "棚の状況はこまめに更新",
    "条件に合う構成が棚に現れたと確認できた後に通知します。元データの確認、同期、配信のそれぞれで、手元に届くまでに少し遅れが生じ得ます。"
  ],
  "ko": [
    "재고를 자주 다시 읽음",
    "조건에 맞는 구성이 진열된 것을 확인한 뒤 알림을 보내요. 원본 관측, 동기화, 알림 전달 단계마다 조금씩 늦어질 수 있어요."
  ],
  "zh-TW": [
    "庫存資料經常更新",
    "看到符合條件的組合上架後才發出提醒；查看來源、同步資料和傳送提醒，每一步都可能稍有延遲。"
  ],
  "zh-HK": [
    "存貨資料經常更新",
    "見到符合條件的配置在架後才發出提示；查看來源、同步資料和傳送提示，每一步都可能稍有延遲。"
  ],
  "de": [
    "Laufend nachgeführter Regalstand",
    "Eine Benachrichtigung geht raus, sobald eine passende Variante im Regal auftaucht. Der Blick auf die Quelle, die Synchronisierung und die Zustellung können jeweils etwas Verzögerung bringen."
  ],
  "fr": [
    "Inventaire actualisé en continu",
    "Une alerte part dès qu’une configuration correspondante est vue en rayon. Le passage à la source, la synchronisation et l’acheminement de la notification peuvent chacun ajouter un délai."
  ],
  "it": [
    "Scorte aggiornate di frequente",
    "La notifica parte quando a scaffale compare una configurazione che corrisponde. Occhiata alla fonte, sincronizzazione e consegna possono aggiungere un po’ di ritardo."
  ],
  "es": [
    "Actualizaciones frecuentes del stock",
    "El aviso sale en cuanto se ve en el estante una configuración que encaja. El vistazo a la fuente, la sincronización y la entrega pueden sumar algo de demora."
  ],
  "nl": [
    "Frequent bijgewerkte schapgegevens",
    "Een melding gaat uit zodra een passende uitvoering in het schap wordt gezien. De blik op de bron, de synchronisatie en de bezorging kunnen elk wat vertraging geven."
  ],
  "sv": [
    "Regelbundna lageruppdateringar",
    "En avisering skickas när en matchande konfiguration syns på hyllan. Avläsningen av källan, synkroniseringen och leveransen kan var för sig ge viss fördröjning."
  ],
  "ar": [
    "تحديثات منتظمة للمخزون",
    "يُرسل التنبيه بعد أن يظهر على الرف تكوين مطابق. وقد تضيف معاينة المصدر والمزامنة والتسليم شيئًا من التأخير."
  ]
};
function copy(lang: Lang) { const k = lang === "de-CH" ? "de" : lang === "fr-CA" ? "fr" : lang; return { ...COPY[k], seo: SEO[k], cadence: CADENCE[k][0], delivery: CADENCE[k][1] }; }
export function withShelfPlace(lang: Lang, base: PlaceDictionary): PlaceDictionary {
  const c = copy(lang), N = (v: number) => num(lang, v);
  const country = (cc: CountryCode) => countryLabel(cc, lang);
  const where = (i: IntlPlaceInput) => i.kind === "city" ? cityLabel(i.cc, i.name, lang) : regionLabel(i.cc, i.name, lang);
  const title = (name: string) => fitTitleW([`${name}: ${c.seo.options}`, `${name}: iPhone`, name], 70);
  const snapshot = (name: string, n: number, duo: number | string, pro: number | string, pm: number | string) => `${name} · **${N(n)} Apple Stores**. ${c.now}: **iPhone Duo ${duo}/${N(n)} · 18 Pro ${pro}/${N(n)} · 18 Pro Max ${pm}/${N(n)}**. ${c.compare}`;
  const sections = (items: KeywordSection[]) => items.map((s) => s.id === "iphone-stock" ? { ...s, h2: c.options, lead: c.evidence, blocks: s.blocks.map((b) => b.t === "ul" ? { t: "ul" as const, items: [c.compare, c.definition, c.delivery] } : b) } : s.id === "alerts" ? { ...s, h2: c.watchQ, lead: c.watchA, blocks: s.blocks.map((b) => b.t === "ol" ? { t: "p" as const, text: `${c.steps} ${c.delivery}` } : b.t === "note" ? { ...b, text: c.evidence } : b) } : s);
  return {
    ...base,
    sinceWhen: (now = Date.now()) => now - Date.parse("2026-11-02T00:00:00Z") < 30 * 86400_000 ? c.coverage : c.last30,
    homeTitle: (cc) => fitTitleW([`${country(cc)}: ${c.seo.heading}`, `${country(cc)}: ${c.seo.options}`], 70),
    homeH1: (cc) => `${country(cc)} · ${c.heading}`,
    homeDescription: (cc) => fitTitleW([`${country(cc)}: ${c.seo.options}. ${c.seo.compare}`, `${country(cc)}: ${c.seo.options}. ${c.seo.now}.`], 155),
    homeIntro: (cc) => snapshot(country(cc), storesOf(cc).length, "{{duo.storesNow}}", "{{pro.storesNow}}", "{{pm.storesNow}}"),
    storesIndexTitle: (cc) => title(country(cc)),
    homeSections: (i) => sections(base.homeSections(i)),
    homeFaq: (cc) => [{ q: c.timingQ, a: c.timingA }, { q: c.watchQ, a: c.watchA }, { q: c.reserveQ, a: c.reserveA }, base.taxFaq(cc, country(cc))],
    placeTitle: (i) => title(where(i)),
    placeDescription: (i) => fitTitleW([`${where(i)}: ${c.seo.now} · Duo ${N(i.stockNow.duo)}/${N(i.stores.length)}, Pro Max ${N(i.stockNow["18-pro-max"])}/${N(i.stores.length)}. ${c.seo.compare}`, `${where(i)}: ${c.seo.options}. Duo ${N(i.stockNow.duo)}/${N(i.stores.length)} · Pro Max ${N(i.stockNow["18-pro-max"])}/${N(i.stores.length)}.`], 155),
    placeIntro: (i) => snapshot(where(i), i.stores.length, N(i.stockNow.duo), N(i.stockNow["18-pro"]), N(i.stockNow["18-pro-max"])),
    placeSections: (i) => [
      { id: "iphone-duo", h2: `${where(i)} · ${c.now}`, lead: c.compare, blocks: [{ t: "table", head: ["iPhone", c.now, c.returns], rows: [["Duo", `${N(i.stockNow.duo)}/${N(i.stores.length)}`, i.duo.unknown ? "—" : N(i.duo.month)], ["18 Pro Max", `${N(i.stockNow["18-pro-max"])}/${N(i.stores.length)}`, i.max.unknown ? "—" : N(i.max.month)]], caption: `${c.sample}: Duo ${i.duo.days}d · Pro Max ${i.max.days}d. ${c.countNote}` }, { t: "p", text: c.evidence }] },
      { id: "iphone-18-pro-max", h2: c.watchQ, lead: c.watchA, blocks: [{ t: "p", text: c.steps }, { t: "note", text: c.definition }] },
      ...base.placeSections(i).filter((s) => s.id !== "iphone-duo" && s.id !== "iphone-18-pro-max"),
    ],
    modelPageTitles: (cc, model) => { const m = modelByKey(model)!.name; return { title: fitTitleW([`${m} · ${country(cc)} · ${c.seo.now}`, `${m} · ${country(cc)}`], 70), h2: [`${m}: ${c.options}`, base.modelPageTitles(cc, model).h2[1]] }; },
    modelIntro: (cc, model, inStock) => `${country(cc)} · **${modelByKey(model)!.name} ${N(inStock)}/${N(storesOf(cc).length)} Apple Stores**. ${c.compare} ${c.evidence}`,
    modelDescription: (cc, model, inStock) => fitTitleW([`${modelByKey(model)!.name} · ${country(cc)}: ${c.seo.now} ${N(inStock)}/${N(storesOf(cc).length)}. ${c.seo.compare}`, `${modelByKey(model)!.name} · ${country(cc)}: ${c.seo.now} ${N(inStock)}/${N(storesOf(cc).length)}.`], 155),
    storeTitle: (s, region) => fitTitleW([`${appleStoreLabel(s, lang)}${region ? ` (${region})` : ""}: ${c.seo.options}`, `${appleStoreLabel(s, lang)}: ${c.seo.now}`, `${appleStoreLabel(s, lang)}: iPhone`]),
  };
}
export function withShelfPages(lang: Lang, base: PagesDictionary): PagesDictionary {
  const c = copy(lang), N = (v: number) => num(lang, v);
  return { ...base, common: { ...base.common, matrixH2: c.options, matrixHint: c.countNote, checkNote: c.cadence }, region: { ...base.region, counts: (stores, cities) => `${base.region.counts(stores, cities).split(" · ").slice(0, 2).join(" · ")} · ${c.cadence}` }, city: { ...base.city, counts: (stores) => `${N(stores)} Apple Stores · ${c.cadence}` }, store: {
    ...base.store,
    description: (a) => [`${a.place}, ${a.city}: ${c.seo.now} · Duo ${N(a.duo)}, 18 Pro ${N(a.pro)}, Pro Max ${N(a.pm)}. ${c.seo.compare}`, `${a.place}: ${c.seo.now} · Duo ${N(a.duo)}, Pro ${N(a.pro)}, Max ${N(a.pm)}.`],
    intro: (a) => <>{a.place}{a.street ? ` · ${a.street}` : ""}. {c.now}: <b className="text-ink">Duo {N(a.duo)}/{N(a.duoOf)} · 18 Pro {N(a.pro)}/{N(a.proOf)} · Pro Max {N(a.pm)}/{N(a.pmOf)}</b>. {c.compare} {c.evidence}</>,
    stockNowH2: c.now,
    history: c.returns,
    onlyBlockCountry: () => c.delivery,
    onlyBlock: () => `${c.watchA} ${c.delivery}`,
    pickupQ: () => c.reserveQ,
    pickupA: () => c.reserveA,
  } };
}

/** Restock reports retain their tested charts while leading with sample scope and uncertainty. */
export function withShelfViews(lang: Lang, base: typeof baseViews): typeof baseViews {
  const c = copy(lang), N = (v: number) => num(lang, v);
  return { ...base,
    restocks: { ...base.restocks,
      metaTitle: (country) => `${countryLabel(country.cc, lang)} · ${c.seo.returns}`,
      metaDescription: (country) => `${countryLabel(country.cc, lang)} · ${c.seo.returns}. ${c.seo.definition}`,
      h1: (country) => `${countryLabel(country.cc, lang)} · ${c.returns}`,
      datasetDescription: (country) => `${countryLabel(country.cc, lang)} · iPhone Duo, 18 Pro, 18 Pro Max. ${c.seo.definition} ${c.seo.evidence}`,
    },
    map: { ...base.map,
      metaTitle: (country) => `${countryLabel(country.cc, lang)} · ${c.seo.options}`,
      metaDescription: (country) => `${countryLabel(country.cc, lang)} · ${c.seo.compare}`,
    },
    storesIndex: { ...base.storesIndex,
      metaDescription: (country, stores, _regions, _cities, duo, max) => fitTitleW([`${countryLabel(country.cc, lang)} · ${c.seo.now}: Duo ${N(duo)}/${N(stores)}, Pro Max ${N(max)}/${N(stores)}. ${c.seo.compare}`], 160),
      intro: (country, stores, _spread, now, tax) => `${countryLabel(country.cc, lang)} · **${N(stores)} Apple Stores**. ${c.now}: **Duo ${N(now.duo)} · 18 Pro ${N(now.pro)} · Pro Max ${N(now.max)}**. ${c.compare} ${tax}`,
      duoBlock: () => `${c.watchA} ${c.delivery}`,
    },
    restockTimes: { ...base.restockTimes,
    methodKeys: () => [{ text: c.definition }, { text: c.delivery }, { text: c.evidence }],
    configKeys: () => [{ text: c.definition }, { text: c.evidence }, { text: c.watchA }],
    howLongKeys: () => [{ text: c.evidence }, { text: c.delivery }],
    redditKeys: () => [{ text: c.evidence }, { text: c.steps }],
    swaps: () => [{ no: c.timingQ, yes: c.options, why: c.timingA }, { no: c.reserveQ, yes: c.watchQ, why: c.steps }],
    unavailableKeys: () => [{ text: c.evidence }, { text: c.definition }],
    quote: `${c.definition} ${c.evidence}`,
    questions: { ...base.restockTimes.questions, alerts: c.watchQ },
    title: (country) => `iPhone Duo · ${countryLabel(country.cc, lang)} · ${c.seo.returns}`,
    h1: (x) => `iPhone Duo · ${countryLabel(x.c.cc, lang)}: ${c.returns}`,
    metaDescription: (x) => fitTitleW([`${countryLabel(x.c.cc, lang)} · iPhone Duo: ${N(x.t.n)} ${c.seo.returns}, ${x.t.since}. ${c.seo.compare}`, `iPhone Duo · ${countryLabel(x.c.cc, lang)}: ${c.seo.returns}. ${c.seo.compare}`], 158),
    intro: (x) => x.t.unknown ? <>{c.sample}: —. {c.evidence} {c.delivery}</> : <>{c.sample}: <b className="text-ink">{N(x.t.n)} iPhone Duo</b> · {x.t.since}–{x.t.at.slice(0, 10)} · {N(x.stores)} Apple Stores. {c.evidence} {c.compare}</>,
    ld: (x) => ({ ...base.restockTimes.ld(x), description: `${c.seo.sample}: ${N(x.t.n)} iPhone Duo · ${x.t.since}–${x.t.at.slice(0, 10)}. ${c.seo.definition} ${c.seo.evidence}` }),
    faq: (x) => [{ q: c.timingQ, a: `${c.sample}: ${N(x.t.n)} iPhone Duo · ${x.t.since}–${x.t.at.slice(0, 10)}. ${c.timingA}` }, { q: c.watchQ, a: c.watchA }, { q: c.reserveQ, a: c.reserveA }],
  } };
}

export function withShelfContent(lang: Lang, base: typeof baseContent): typeof baseContent {
  const c = copy(lang);
  return { ...base,
    explainer: (kind, place) => [c.steps, `${lang === "en" ? kind === "store" ? place : kind === "model" ? "US Apple Stores" : `Apple Stores in ${place}` : place}: ${c.delivery}`, `${c.definition} ${c.evidence}`],
    alertRule: `${c.watchA} ${c.delivery}`,
    product: { ...base.product, checkNote: c.cadence },
    titles: { ...base.titles, store: (name, region) => [`${name}${region ? ` (${region})` : ""}: ${c.seo.options}`, `${name}: ${c.seo.now}`, `${name}: iPhone`] },
  };
}
