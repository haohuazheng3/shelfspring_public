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
    "now": "Pickup stock now",
    "returns": "Recorded returns",
    "compare": "Compare the live list with the recent record, then choose stores you can realistically reach.",
    "evidence": "The live list answers what is available at the last check. The history shows where listings returned; it does not predict the next delivery.",
    "steps": "Pick a configuration first. Add reachable stores, and use an alert if your shortlist is empty. Complete the order with Apple before making the trip.",
    "definition": "A return is a confirmed change from unavailable to available for one store and configuration. Repeated returns are separate events, not a count of phones.",
    "timingQ": "Can a restock pattern tell me when to travel?",
    "timingA": "Use past hours to compare the record, not to schedule a visit. Stock can change between checks; wait for Apple to confirm your pickup order.",
    "reserveQ": "Does ShelfSpring reserve an iPhone?",
    "reserveA": "ShelfSpring helps you spot a pickup window. Apple accepts the order, confirms the collection time and holds the phone.",
    "watchQ": "How should I choose my alerts?",
    "watchA": "Start with a model, storage and color you would buy, then select stores you can reach. One alert covers one store and one exact configuration.",
    "coverage": "Historical inventory coverage begins November 2",
    "last30": "in the last 30 days",
    "sample": "Observed sample",
    "countNote": "Store × configuration counts; not a reservation."
  },
  "ja": {
    "heading": "次のiPhone受け取り機会を探す",
    "options": "iPhoneの受け取り候補",
    "now": "現在の受取在庫",
    "returns": "記録された再入荷",
    "compare": "現在の在庫と過去の記録を見比べ、実際に行ける店舗から候補を絞りましょう。",
    "evidence": "在庫一覧は前回確認時の状況です。履歴は在庫が戻った場所を示し、次の配送時刻を予測するものではありません。",
    "steps": "まず容量と色を決め、行ける店舗を選びます。在庫がなければ通知を設定し、出発前にAppleで注文を確定してください。",
    "definition": "再入荷1回は、1店舗の1構成が在庫なしからありに変わり、確認された記録です。同じ構成の再登場は別の記録で、端末台数ではありません。",
    "timingQ": "過去の入荷時間を見て出発してよいですか？",
    "timingA": "時間別の傾向は記録の比較に使えますが、来店時刻の保証ではありません。Appleの受け取り確認を待ってから出発してください。",
    "reserveQ": "ShelfSpringでiPhoneを取り置きできますか？",
    "reserveA": "ShelfSpringは受け取り可能な在庫を探すためのサービスです。注文の受付、受取時間の確認、商品の確保はAppleが行います。",
    "watchQ": "通知する店舗はどう選べばよいですか？",
    "watchA": "購入したい機種・容量・色を決め、行ける店舗を選びます。通知1件は1店舗と1つの構成の組み合わせです。",
    "coverage": "過去の在庫記録は11月2日から",
    "last30": "過去30日間",
    "sample": "記録のサンプル",
    "countNote": "店舗と構成の組み合わせ数です。予約数ではありません。"
  },
  "ko": {
    "heading": "다음 iPhone 픽업 기회를 찾으세요",
    "options": "iPhone 픽업 후보",
    "now": "현재 픽업 재고",
    "returns": "기록된 재입고",
    "compare": "현재 재고와 최근 기록을 비교하고 실제로 방문할 수 있는 매장부터 추려 보세요.",
    "evidence": "재고 목록은 마지막 확인 시점의 상태입니다. 이력은 재고가 다시 나타난 곳을 보여 주며 다음 배송을 예측하지 않습니다.",
    "steps": "용량과 색상을 정하고 방문 가능한 매장을 선택하세요. 원하는 재고가 없으면 알림을 설정하고, 출발 전 Apple에서 주문을 확정하세요.",
    "definition": "재입고 1건은 한 매장의 특정 구성이 품절에서 구매 가능으로 바뀐 것을 확인한 기록입니다. 반복된 변화는 별도 건수이며 기기 수가 아닙니다.",
    "timingQ": "과거 입고 시간을 보고 방문해도 되나요?",
    "timingA": "시간대별 기록은 비교 자료일 뿐 방문 시간의 보장이 아닙니다. 확인 사이에도 재고가 변하므로 Apple의 픽업 확인을 기다리세요.",
    "reserveQ": "ShelfSpring이 iPhone을 예약해 주나요?",
    "reserveA": "ShelfSpring은 픽업 가능한 재고를 찾도록 돕습니다. 주문 접수, 픽업 시간 확인, 제품 확보는 Apple이 담당합니다.",
    "watchQ": "알림은 어떻게 고르면 좋나요?",
    "watchA": "구매할 모델·용량·색상을 먼저 정하고 갈 수 있는 매장을 선택하세요. 알림 1개는 매장 하나와 정확한 구성 하나를 뜻합니다.",
    "coverage": "과거 재고 기록은 11월 2일부터",
    "last30": "최근 30일 동안",
    "sample": "관측 표본",
    "countNote": "매장과 구성의 조합 수이며 예약이 아닙니다."
  },
  "zh-TW": {
    "heading": "找到下一次iPhone取貨機會",
    "options": "iPhone取貨選項",
    "now": "目前取貨庫存",
    "returns": "已記錄的補貨",
    "compare": "把目前庫存和近期紀錄放在一起比較，優先選擇你確實能到達的門市。",
    "evidence": "庫存表代表上次查詢時的狀態。歷史紀錄呈現哪些門市曾恢復供貨，不預測下一批到貨時間。",
    "steps": "先決定容量和顏色，再選可前往的門市。沒有合適庫存時可設定通知，出發前請先向Apple完成訂購。",
    "definition": "一次補貨是某門市的某個規格由無貨變為有貨，並經確認的事件。重複恢復供貨會分開計算，不代表手機台數。",
    "timingQ": "可以依照過往補貨時段直接前往嗎？",
    "timingA": "時段紀錄可供比較，不能當作到貨預約。兩次查詢之間庫存也可能改變，請等待Apple確認取貨訂單。",
    "reserveQ": "ShelfSpring會替我保留iPhone嗎？",
    "reserveA": "ShelfSpring協助尋找取貨機會；接受訂單、確認取貨時間和保留商品都由Apple處理。",
    "watchQ": "應該怎樣設定通知？",
    "watchA": "先選你願意購買的機型、容量和顏色，再加入可前往的門市。一則通知設定對應一家門市和一個確切規格。",
    "coverage": "歷史庫存紀錄自11月2日起",
    "last30": "最近30天",
    "sample": "觀察樣本",
    "countNote": "門市與規格的組合數，並非預訂數。"
  },
  "zh-HK": {
    "heading": "尋找下一次iPhone取貨機會",
    "options": "iPhone取貨選擇",
    "now": "目前取貨存貨",
    "returns": "已記錄的補貨",
    "compare": "比較即時存貨與近期紀錄，先篩選你實際能到達的Apple Store。",
    "evidence": "存貨表顯示上次查詢的狀態。歷史紀錄說明哪些店曾恢復供貨，不預測下一批送貨時間。",
    "steps": "先選容量及顏色，再選方便前往的店。沒有合適存貨時可設定通知；出發前請先在Apple完成訂購。",
    "definition": "一次補貨指某店的某個配置由缺貨變為有貨，並經確認的事件。同一配置再次出現會另計，不等於手機數量。",
    "timingQ": "可否按過往補貨時段直接到店？",
    "timingA": "時段資料可作比較，不能當作到貨預約。兩次查詢之間存貨亦會改變，請等待Apple確認取貨訂單。",
    "reserveQ": "ShelfSpring會代我留起iPhone嗎？",
    "reserveA": "ShelfSpring協助你找出取貨機會。接受訂單、確認取貨時間及保留商品均由Apple處理。",
    "watchQ": "應該如何選擇通知？",
    "watchA": "先選願意購買的型號、容量及顏色，再加入可到達的店。一項通知對應一間店及一個確切配置。",
    "coverage": "歷史存貨紀錄由11月2日起",
    "last30": "最近30天",
    "sample": "觀察樣本",
    "countNote": "店舖與配置的組合數，並非預訂數。"
  },
  "de": {
    "heading": "Das nächste iPhone zur Abholung finden",
    "options": "iPhone zur Abholung vergleichen",
    "now": "Abholbestand jetzt",
    "returns": "Erfasste Rückkehr in den Bestand",
    "compare": "Vergleiche den aktuellen Bestand mit den letzten Beobachtungen und wähle Stores, die du erreichen kannst.",
    "evidence": "Die Liste zeigt den Stand der letzten Prüfung. Der Verlauf zeigt, wo Angebote wieder erschienen sind; er sagt keine nächste Lieferung voraus.",
    "steps": "Lege Speicher und Farbe fest, wähle erreichbare Stores und richte bei Bedarf einen Alarm ein. Bestelle bei Apple, bevor du losfährst.",
    "definition": "Ein Ereignis ist der bestätigte Wechsel einer Kombination aus Store und Konfiguration von nicht verfügbar zu verfügbar. Wiederholungen zählen einzeln, nicht als Gerätezahl.",
    "timingQ": "Kann ich nach den bisherigen Nachfüllzeiten losfahren?",
    "timingA": "Die Stunden zeigen vergangene Beobachtungen, keinen Termin. Bestand kann zwischen Prüfungen wechseln. Warte auf Apples Bestätigung deiner Abholung.",
    "reserveQ": "Reserviert ShelfSpring ein iPhone für mich?",
    "reserveA": "ShelfSpring hilft bei der Suche nach einer Abholmöglichkeit. Apple nimmt die Bestellung an, bestätigt die Abholung und reserviert das Gerät.",
    "watchQ": "Welche Alarme sind sinnvoll?",
    "watchA": "Wähle Modell, Speicher und Farbe, die du kaufen würdest, sowie erreichbare Stores. Ein Alarm gilt für einen Store und eine genaue Konfiguration.",
    "coverage": "Historische Bestandsdaten ab 2. November",
    "last30": "in den letzten 30 Tagen",
    "sample": "Beobachtete Stichprobe",
    "countNote": "Kombinationen aus Store und Konfiguration; keine Reservierung."
  },
  "fr": {
    "heading": "Trouvez votre prochain retrait iPhone",
    "options": "Comparer les possibilités de retrait iPhone",
    "now": "Stock pour retrait maintenant",
    "returns": "Retours en stock observés",
    "compare": "Comparez le stock actuel aux observations récentes, puis choisissez les magasins où vous pouvez vous rendre.",
    "evidence": "La liste décrit la dernière vérification. L’historique indique où le stock est revenu, sans prédire la prochaine livraison.",
    "steps": "Choisissez capacité et couleur, puis des magasins accessibles. Créez une alerte si nécessaire et commandez auprès d’Apple avant de partir.",
    "definition": "Un événement est le retour confirmé d’une configuration dans un magasin. Plusieurs retours sont des événements distincts, pas un nombre de téléphones.",
    "timingQ": "Puis-je me déplacer selon les anciens horaires de réassort ?",
    "timingA": "Ces horaires décrivent les observations passées, pas un rendez-vous. Le stock peut changer entre deux vérifications. Attendez la confirmation de retrait d’Apple.",
    "reserveQ": "ShelfSpring réserve-t-il un iPhone pour moi ?",
    "reserveA": "ShelfSpring vous aide à repérer une possibilité de retrait. Apple accepte la commande, confirme le retrait et met le téléphone de côté.",
    "watchQ": "Quelles alertes choisir ?",
    "watchA": "Sélectionnez un modèle, une capacité et une couleur que vous achèteriez, puis des magasins accessibles. Une alerte correspond à un magasin et une configuration exacte.",
    "coverage": "Historique de stock à partir du 2 novembre",
    "last30": "sur les 30 derniers jours",
    "sample": "Échantillon observé",
    "countNote": "Combinaisons magasin et configuration ; aucune réservation."
  },
  "it": {
    "heading": "Trova la prossima occasione di ritiro iPhone",
    "options": "Confronta le opzioni di ritiro iPhone",
    "now": "Disponibilità per il ritiro ora",
    "returns": "Ritorni in stock registrati",
    "compare": "Confronta la disponibilità attuale con le osservazioni recenti e scegli gli store che puoi raggiungere.",
    "evidence": "La lista mostra l’ultimo controllo. La cronologia indica dove sono riapparse le disponibilità, senza prevedere la prossima consegna.",
    "steps": "Scegli capacità e colore, poi gli store raggiungibili. Se serve, imposta un avviso e completa l’ordine su Apple prima di partire.",
    "definition": "Un evento è il passaggio confermato da non disponibile a disponibile di una configurazione in uno store. I ritorni ripetuti sono eventi distinti, non un conteggio di telefoni.",
    "timingQ": "Posso partire in base ai vecchi orari di rifornimento?",
    "timingA": "Gli orari descrivono il passato, non un appuntamento. La disponibilità può cambiare fra i controlli: attendi la conferma di ritiro di Apple.",
    "reserveQ": "ShelfSpring prenota un iPhone per me?",
    "reserveA": "ShelfSpring aiuta a trovare un’occasione di ritiro. Apple accetta l’ordine, conferma il ritiro e riserva il telefono.",
    "watchQ": "Quali avvisi conviene impostare?",
    "watchA": "Scegli modello, capacità e colore che compreresti, poi store raggiungibili. Un avviso corrisponde a uno store e a una configurazione precisa.",
    "coverage": "Dati storici di disponibilità dal 2 novembre",
    "last30": "negli ultimi 30 giorni",
    "sample": "Campione osservato",
    "countNote": "Combinazioni store e configurazione; non sono prenotazioni."
  },
  "es": {
    "heading": "Encuentra tu próxima recogida de iPhone",
    "options": "Compara opciones de recogida de iPhone",
    "now": "Stock para recoger ahora",
    "returns": "Reposiciones registradas",
    "compare": "Compara el stock actual con el registro reciente y elige tiendas a las que puedas llegar.",
    "evidence": "La lista refleja la última comprobación. El historial muestra dónde volvió el stock, sin predecir la próxima entrega.",
    "steps": "Elige capacidad y color, después tiendas accesibles. Activa una alerta si hace falta y completa el pedido con Apple antes de salir.",
    "definition": "Un evento es el cambio confirmado de no disponible a disponible para una configuración y una tienda. Las repeticiones son eventos separados, no un número de teléfonos.",
    "timingQ": "¿Puedo ir a la tienda según horarios de reposición anteriores?",
    "timingA": "Las horas describen observaciones pasadas, no una cita. El stock cambia entre comprobaciones: espera la confirmación de recogida de Apple.",
    "reserveQ": "¿ShelfSpring reserva un iPhone por mí?",
    "reserveA": "ShelfSpring ayuda a encontrar una oportunidad de recogida. Apple acepta el pedido, confirma la recogida y aparta el teléfono.",
    "watchQ": "¿Qué alertas debería elegir?",
    "watchA": "Selecciona un modelo, capacidad y color que comprarías y tiendas accesibles. Una alerta corresponde a una tienda y una configuración exacta.",
    "coverage": "Historial de stock desde el 2 de noviembre",
    "last30": "en los últimos 30 días",
    "sample": "Muestra observada",
    "countNote": "Combinaciones de tienda y configuración; no son reservas."
  },
  "nl": {
    "heading": "Vind je volgende iPhone om af te halen",
    "options": "Vergelijk iPhone-afhaalopties",
    "now": "Afhaalvoorraad nu",
    "returns": "Vastgelegde voorraadterugkeer",
    "compare": "Vergelijk de actuele voorraad met recente waarnemingen en kies winkels die je kunt bereiken.",
    "evidence": "De lijst toont de laatste controle. De historie laat zien waar voorraad terugkwam, zonder de volgende levering te voorspellen.",
    "steps": "Kies opslag en kleur, daarna bereikbare winkels. Stel zo nodig een melding in en bestel bij Apple voordat je vertrekt.",
    "definition": "Een gebeurtenis is de bevestigde overgang van niet beschikbaar naar beschikbaar voor één winkel en uitvoering. Herhalingen zijn aparte gebeurtenissen, geen aantal telefoons.",
    "timingQ": "Kan ik op basis van eerdere aanvultijden vertrekken?",
    "timingA": "Die tijden beschrijven eerdere waarnemingen, geen afspraak. Voorraad kan tussen controles veranderen. Wacht op Apples bevestiging van je afhaalbestelling.",
    "reserveQ": "Reserveert ShelfSpring een iPhone voor mij?",
    "reserveA": "ShelfSpring helpt een afhaalmogelijkheid te vinden. Apple neemt de bestelling aan, bevestigt het afhalen en houdt de telefoon apart.",
    "watchQ": "Welke meldingen moet ik kiezen?",
    "watchA": "Kies model, opslag en kleur die je zou kopen, plus bereikbare winkels. Eén melding geldt voor één winkel en één exacte uitvoering.",
    "coverage": "Historische voorraadgegevens vanaf 2 november",
    "last30": "in de afgelopen 30 dagen",
    "sample": "Waargenomen steekproef",
    "countNote": "Combinaties van winkel en uitvoering; geen reserveringen."
  },
  "sv": {
    "heading": "Hitta nästa iPhone att hämta",
    "options": "Jämför hämtning av iPhone",
    "now": "Lager för hämtning nu",
    "returns": "Registrerade lageråterkomster",
    "compare": "Jämför aktuellt lager med de senaste observationerna och välj butiker du kan ta dig till.",
    "evidence": "Listan visar den senaste kontrollen. Historiken visar var lagret återkom, utan att förutsäga nästa leverans.",
    "steps": "Välj lagring och färg, sedan butiker inom räckhåll. Ställ in en avisering vid behov och beställ hos Apple innan du åker.",
    "definition": "En händelse är en bekräftad ändring från slut till tillgänglig för en butik och konfiguration. Upprepade återkomster räknas separat, inte som antal telefoner.",
    "timingQ": "Kan jag åka utifrån tidigare påfyllningstider?",
    "timingA": "Tiderna beskriver tidigare observationer, inte en bokad tid. Lagret kan ändras mellan kontroller. Vänta på Apples bekräftelse av hämtningen.",
    "reserveQ": "Reserverar ShelfSpring en iPhone åt mig?",
    "reserveA": "ShelfSpring hjälper dig hitta en hämtningsmöjlighet. Apple tar emot beställningen, bekräftar hämtningen och reserverar telefonen.",
    "watchQ": "Vilka aviseringar ska jag välja?",
    "watchA": "Välj modell, lagring och färg du skulle köpa samt butiker du kan nå. En avisering gäller en butik och en exakt konfiguration.",
    "coverage": "Historiska lageruppgifter från 2 november",
    "last30": "under de senaste 30 dagarna",
    "sample": "Observerat urval",
    "countNote": "Kombinationer av butik och konfiguration; inga reservationer."
  },
  "ar": {
    "heading": "اعثر على فرصتك التالية لاستلام iPhone",
    "options": "قارن خيارات استلام iPhone",
    "now": "مخزون الاستلام الآن",
    "returns": "مرات عودة المخزون المسجلة",
    "compare": "قارن المخزون الحالي بالسجل الحديث، ثم اختر المتاجر التي يمكنك الوصول إليها فعلاً.",
    "evidence": "تعكس القائمة آخر فحص. يوضح السجل أين عاد المخزون، ولا يتنبأ بموعد الشحنة التالية.",
    "steps": "اختر السعة واللون ثم المتاجر المناسبة. فعّل تنبيهاً عند الحاجة وأكمل طلبك لدى Apple قبل الذهاب.",
    "definition": "الحدث هو تغير مؤكد من غير متوفر إلى متوفر لتكوين واحد في متجر واحد. العودة المتكررة أحداث منفصلة وليست عدداً من الهواتف.",
    "timingQ": "هل يمكنني الذهاب بناءً على ساعات التوفر السابقة؟",
    "timingA": "الساعات تصف مشاهدات سابقة وليست موعداً مضموناً. قد يتغير المخزون بين الفحوصات؛ انتظر تأكيد Apple لطلب الاستلام.",
    "reserveQ": "هل يحجز ShelfSpring جهاز iPhone لي؟",
    "reserveA": "يساعدك ShelfSpring على إيجاد فرصة للاستلام. تتولى Apple قبول الطلب وتأكيد الاستلام وحجز الجهاز.",
    "watchQ": "كيف أختار التنبيهات؟",
    "watchA": "اختر الطراز والسعة واللون الذي ترغب بشرائه، ثم متاجر يمكنك الوصول إليها. كل تنبيه يخص متجراً واحداً وتكويناً محدداً.",
    "coverage": "سجل المخزون التاريخي من 2 نوفمبر",
    "last30": "خلال آخر 30 يوماً",
    "sample": "العينة المرصودة",
    "countNote": "عدد تركيبات المتاجر والتكوينات، وليس حجوزات."
  }
};
const CADENCE = {
  "en": [
    "Frequent inventory updates",
    "Alerts are sent after matching availability is detected. Source checks, synchronization and notification delivery can add delay."
  ],
  "ja": [
    "在庫を定期的に更新",
    "条件に合う在庫を検出した後に通知します。元データの確認、同期、通知配信には遅延が生じることがあります。"
  ],
  "ko": [
    "정기적으로 재고 업데이트",
    "조건에 맞는 재고를 감지한 뒤 알림을 보냅니다. 원본 확인, 동기화, 알림 전달에 지연이 생길 수 있습니다."
  ],
  "zh-TW": [
    "定期更新庫存",
    "偵測到符合條件的庫存後發送通知；來源查詢、資料同步與通知傳送可能增加延遲。"
  ],
  "zh-HK": [
    "定期更新存貨",
    "偵測到符合條件的存貨後發送通知；來源查詢、資料同步及通知傳送可能有延遲。"
  ],
  "de": [
    "Regelmäßige Bestandsaktualisierungen",
    "Alarme werden nach Erkennung passender Verfügbarkeit gesendet. Quellprüfung, Synchronisierung und Zustellung können Verzögerungen verursachen."
  ],
  "fr": [
    "Mises à jour régulières du stock",
    "Les alertes sont envoyées après détection d’une disponibilité correspondante. La vérification à la source, la synchronisation et la livraison peuvent ajouter un délai."
  ],
  "it": [
    "Aggiornamenti regolari della disponibilità",
    "Gli avvisi vengono inviati dopo il rilevamento di disponibilità corrispondente. Controlli alla fonte, sincronizzazione e consegna possono introdurre ritardi."
  ],
  "es": [
    "Actualizaciones frecuentes del stock",
    "Las alertas se envían después de detectar disponibilidad coincidente. La comprobación de origen, la sincronización y la entrega pueden añadir demora."
  ],
  "nl": [
    "Regelmatige voorraadupdates",
    "Meldingen worden verzonden nadat passende voorraad is gedetecteerd. Broncontrole, synchronisatie en bezorging kunnen vertraging toevoegen."
  ],
  "sv": [
    "Regelbundna lageruppdateringar",
    "Aviseringar skickas när matchande tillgänglighet upptäcks. Källkontroll, synkronisering och leverans kan ge fördröjning."
  ],
  "ar": [
    "تحديثات منتظمة للمخزون",
    "تُرسل التنبيهات بعد اكتشاف توفر مطابق. قد تضيف فحوصات المصدر والمزامنة وتسليم الإشعارات بعض التأخير."
  ]
};
function copy(lang: Lang) { const k = lang === "de-CH" ? "de" : lang === "fr-CA" ? "fr" : lang; return { ...COPY[k], cadence: CADENCE[k][0], delivery: CADENCE[k][1] }; }
export function withShelfPlace(lang: Lang, base: PlaceDictionary): PlaceDictionary {
  const c = copy(lang), N = (v: number) => num(lang, v);
  const country = (cc: CountryCode) => countryLabel(cc, lang);
  const where = (i: IntlPlaceInput) => i.kind === "city" ? cityLabel(i.cc, i.name, lang) : regionLabel(i.cc, i.name, lang);
  const title = (name: string) => fitTitleW([`${name}: ${c.options}`, `${name}: iPhone`, name], 70);
  const snapshot = (name: string, n: number, duo: number | string, pro: number | string, pm: number | string) => `${name} · **${N(n)} Apple Stores**. ${c.now}: **iPhone Duo ${duo}/${N(n)} · 18 Pro ${pro}/${N(n)} · 18 Pro Max ${pm}/${N(n)}**. ${c.compare}`;
  const sections = (items: KeywordSection[]) => items.map((s) => s.id === "iphone-stock" ? { ...s, h2: c.options, lead: c.evidence, blocks: s.blocks.map((b) => b.t === "ul" ? { t: "ul" as const, items: [c.compare, c.definition, c.delivery] } : b) } : s.id === "alerts" ? { ...s, h2: c.watchQ, lead: c.watchA, blocks: s.blocks.map((b) => b.t === "ol" ? { t: "p" as const, text: `${c.steps} ${c.delivery}` } : b.t === "note" ? { ...b, text: c.evidence } : b) } : s);
  return {
    ...base,
    sinceWhen: (now = Date.now()) => now - Date.parse("2026-11-02T00:00:00Z") < 30 * 86400_000 ? c.coverage : c.last30,
    homeTitle: (cc) => fitTitleW([`${country(cc)}: ${c.heading}`, `${country(cc)}: ${c.options}`], 70),
    homeH1: (cc) => `${country(cc)} · ${c.heading}`,
    homeDescription: (cc) => fitTitleW([`${country(cc)}: ${c.options}. ${c.compare}`, `${country(cc)}: ${c.options}. ${c.now}.`], 155),
    homeIntro: (cc) => snapshot(country(cc), storesOf(cc).length, "{{duo.storesNow}}", "{{pro.storesNow}}", "{{pm.storesNow}}"),
    storesIndexTitle: (cc) => title(country(cc)),
    homeSections: (i) => sections(base.homeSections(i)),
    homeFaq: (cc) => [{ q: c.timingQ, a: c.timingA }, { q: c.watchQ, a: c.watchA }, { q: c.reserveQ, a: c.reserveA }, base.taxFaq(cc, country(cc))],
    placeTitle: (i) => title(where(i)),
    placeDescription: (i) => fitTitleW([`${where(i)}: ${c.now} · Duo ${N(i.stockNow.duo)}/${N(i.stores.length)}, Pro Max ${N(i.stockNow["18-pro-max"])}/${N(i.stores.length)}. ${c.compare}`, `${where(i)}: ${c.options}. Duo ${N(i.stockNow.duo)}/${N(i.stores.length)} · Pro Max ${N(i.stockNow["18-pro-max"])}/${N(i.stores.length)}.`], 155),
    placeIntro: (i) => snapshot(where(i), i.stores.length, N(i.stockNow.duo), N(i.stockNow["18-pro"]), N(i.stockNow["18-pro-max"])),
    placeSections: (i) => [
      { id: "iphone-duo", h2: `${where(i)} · ${c.now}`, lead: c.compare, blocks: [{ t: "table", head: ["iPhone", c.now, c.returns], rows: [["Duo", `${N(i.stockNow.duo)}/${N(i.stores.length)}`, i.duo.unknown ? "—" : N(i.duo.month)], ["18 Pro Max", `${N(i.stockNow["18-pro-max"])}/${N(i.stores.length)}`, i.max.unknown ? "—" : N(i.max.month)]], caption: `${c.sample}: Duo ${i.duo.days}d · Pro Max ${i.max.days}d. ${c.countNote}` }, { t: "p", text: c.evidence }] },
      { id: "iphone-18-pro-max", h2: c.watchQ, lead: c.watchA, blocks: [{ t: "p", text: c.steps }, { t: "note", text: c.definition }] },
      ...base.placeSections(i).filter((s) => s.id !== "iphone-duo" && s.id !== "iphone-18-pro-max"),
    ],
    modelPageTitles: (cc, model) => { const m = modelByKey(model)!.name; return { title: fitTitleW([`${m} · ${country(cc)} · ${c.now}`, `${m} · ${country(cc)}`], 70), h2: [`${m}: ${c.options}`, base.modelPageTitles(cc, model).h2[1]] }; },
    modelIntro: (cc, model, inStock) => `${country(cc)} · **${modelByKey(model)!.name} ${N(inStock)}/${N(storesOf(cc).length)} Apple Stores**. ${c.compare} ${c.evidence}`,
    modelDescription: (cc, model, inStock) => fitTitleW([`${modelByKey(model)!.name} · ${country(cc)}: ${c.now} ${N(inStock)}/${N(storesOf(cc).length)}. ${c.compare}`, `${modelByKey(model)!.name} · ${country(cc)}: ${c.now} ${N(inStock)}/${N(storesOf(cc).length)}.`], 155),
    storeTitle: (s, region) => fitTitleW([`${appleStoreLabel(s, lang)}${region ? ` (${region})` : ""}: ${c.options}`, `${appleStoreLabel(s, lang)}: ${c.now}`, `${appleStoreLabel(s, lang)}: iPhone`]),
  };
}
export function withShelfPages(lang: Lang, base: PagesDictionary): PagesDictionary {
  const c = copy(lang), N = (v: number) => num(lang, v);
  return { ...base, common: { ...base.common, matrixH2: c.options, matrixHint: c.countNote, checkNote: c.cadence }, region: { ...base.region, counts: (stores, cities) => `${N(stores)} Apple Stores · ${N(cities)} · ${c.cadence}` }, city: { ...base.city, counts: (stores) => `${N(stores)} Apple Stores · ${c.cadence}` }, store: {
    ...base.store,
    description: (a) => [`${a.place}, ${a.city}: ${c.now} · Duo ${N(a.duo)}, 18 Pro ${N(a.pro)}, Pro Max ${N(a.pm)}. ${c.compare}`, `${a.place}: ${c.now} · Duo ${N(a.duo)}, Pro ${N(a.pro)}, Max ${N(a.pm)}.`],
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
      metaTitle: (country) => `${countryLabel(country.cc, lang)} · ${c.returns}`,
      metaDescription: (country) => `${countryLabel(country.cc, lang)} · ${c.returns}. ${c.definition}`,
      h1: (country) => `${countryLabel(country.cc, lang)} · ${c.returns}`,
      datasetDescription: (country) => `${countryLabel(country.cc, lang)} · iPhone Duo, 18 Pro, 18 Pro Max. ${c.definition} ${c.evidence}`,
    },
    map: { ...base.map,
      metaTitle: (country) => `${countryLabel(country.cc, lang)} · ${c.options}`,
      metaDescription: (country) => `${countryLabel(country.cc, lang)} · ${c.compare}`,
    },
    storesIndex: { ...base.storesIndex,
      metaDescription: (country, stores, _regions, _cities, duo, max) => fitTitleW([`${countryLabel(country.cc, lang)} · ${c.now}: Duo ${N(duo)}/${N(stores)}, Pro Max ${N(max)}/${N(stores)}. ${c.compare}`], 160),
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
    title: (country) => `iPhone Duo · ${countryLabel(country.cc, lang)} · ${c.returns}`,
    h1: (x) => `iPhone Duo · ${countryLabel(x.c.cc, lang)}: ${c.returns}`,
    metaDescription: (x) => fitTitleW([`${countryLabel(x.c.cc, lang)} · iPhone Duo: ${N(x.t.n)} ${c.returns}, ${x.t.since}. ${c.compare}`, `iPhone Duo · ${countryLabel(x.c.cc, lang)}: ${c.returns}. ${c.compare}`], 158),
    intro: (x) => x.t.unknown ? <>{c.sample}: —. {c.evidence} {c.delivery}</> : <>{c.sample}: <b className="text-ink">{N(x.t.n)} iPhone Duo</b> · {x.t.since}–{x.t.at.slice(0, 10)} · {N(x.stores)} Apple Stores. {c.evidence} {c.compare}</>,
    ld: (x) => ({ ...base.restockTimes.ld(x), description: `${c.sample}: ${N(x.t.n)} iPhone Duo · ${x.t.since}–${x.t.at.slice(0, 10)}. ${c.definition} ${c.evidence}` }),
    faq: (x) => [{ q: c.timingQ, a: `${c.sample}: ${N(x.t.n)} iPhone Duo · ${x.t.since}–${x.t.at.slice(0, 10)}. ${c.timingA}` }, { q: c.watchQ, a: c.watchA }, { q: c.reserveQ, a: c.reserveA }],
  } };
}

export function withShelfContent(lang: Lang, base: typeof baseContent): typeof baseContent {
  const c = copy(lang);
  return { ...base,
    explainer: (kind, place) => [c.steps, `${lang === "en" ? kind === "store" ? place : kind === "model" ? "US Apple Stores" : `Apple Stores in ${place}` : place}: ${c.delivery}`, `${c.definition} ${c.evidence}`],
    alertRule: `${c.watchA} ${c.delivery}`,
    product: { ...base.product, checkNote: c.cadence },
    titles: { ...base.titles, store: (name, region) => [`${name}${region ? ` (${region})` : ""}: ${c.options}`, `${name}: ${c.now}`, `${name}: iPhone`] },
  };
}
