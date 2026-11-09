import { withShelfContent } from "@/lib/seo/localizedCopy";
/**
 * العربية: content — أجزاء صفحات SEO (أسئلة الميدان، روابط التصفح، شرائط الأرقام، أجزاء صفحة الطراز، المراجع،
 * الوحدات المباشرة)، أوقات الدوام، المدد، عناوين الصفحات (لا تُغيَّر)، رموز {{tokens}}، جملة نمط العودة، ونصوص الصور.
 * المفردات: «عودة» لا «توفر»، «على الرف / خارج الرف»، «معاينة» لا «فحص»، «تكوين» لا «خيار»، «الطلاء» لا «اللون».
 * تصل الأرقام والمدد والمسافات وأسماء المتاجر والمدن والألوان منسّقة بالعربية. لا تُترجم أسماء الطرازات والسعات وApple Store
 * وShelfSpring وapple.com. فترات الفحص 15 ثانية و5 ثوانٍ فقط.
 */
import type { ReactNode } from "react";
import type { Forms } from "@/lib/i18n/format";
import type { Dict } from "../en";
import { APPLE_STORES, CONFIGS, DAYS, MINUTES, NOUNS, STORES, STORES_G, count, daysOf, forms, parseN, searchedStore, streetAr } from "./util";

type Kind = "state" | "city" | "store" | "model";
/** "12 عودة مؤكدة": a confirmed return, counted. */
const CONFIRMED = forms({ one: "عودة مؤكدة واحدة", two: "عودتان مؤكدتان", few: "# عودات مؤكدة", many: "# عودة مؤكدة", other: "# عودة مؤكدة" });

const baseContent: Dict["content"] = {
  hours: {
    closed: "مقفل",
    everyDay: (hours: string) => `كل يوم ${hours}`,
    tomorrow: "غدًا",
    dayAt: (day: string, time: string) => `${day} ${time}`,
    closedTodayOpens: (next: string) => `مقفل اليوم · يعيد الفتح ${next}`,
    closedToday: "مقفل طوال اليوم",
    opensAt: (time: string) => `تُفتح الأبواب ${time}`,
    openNow: (closes: string) => `مفتوح حتى ${closes}`,
    closedNowOpens: (next: string) => `مقفل حاليًا · يعيد الفتح ${next}`,
    closedNow: "مقفل حاليًا",
  },

  duration: {
    underAMinute: "أقل من دقيقة",
    pair: (a: string, b: string) => `${a} و${b}`,
  },
  listMore: (n: string) => `و${n} غيرها`,
  nearLine: (place: string, distance: string) => `${place}، ${distance}`,

  faq: {
    /** How answers name the page: «في Apple دبي مول»، «لجهاز iPhone Duo»، «في دبي». */
    where: (kind: Kind, place: string) => (kind === "model" ? `لجهاز ${place}` : `في ${place}`),
    nRestocks: CONFIRMED,
    restockA: ({ count: c, where, days, week, peak }: { count: string | null; where: string; days: string; week: string; peak: { hour: string; day: string | null } | null }) =>
      `${c == null ? `سجل الأيام الـ${days} الماضية لا يحمل أي عودة ${where}` : `يحمل سجل الأيام الـ${days} الماضية ${c} ${where}${parseN(week) === 0 ? "، ولا شيء منها هذا الأسبوع" : `، منها ${week} هذا الأسبوع`}`}${peak ? `؛ وتتجمع قرب الساعة ${peak.hour} بتوقيت المتجر${peak.day ? `، ويتصدّر ${peak.day} أيام الأسبوع` : ""}` : ""}، وApple لا تنشر أي تقويم للشحنات.`,
    lastsNone: (where: string) => `لا تكفي العروض المكتملة من العودة إلى الخروج من الرف ${where} للقياس بعد.`,
    lasts: (days: string, duration: string) => `وسيط المكوث على الرف عبر سجل ${daysOf(days)}: نحو ${duration} بين العودة والخروج التالي من الرف.`,
    storeIn: (store: string, line: string) => `${store} · ${line}`,
    nearestA: (stores: string) => `أقرب البدائل: ${stores}.`,

    modelStockQ: (model: string) => `أين يوجد ${model} على الرف في هذه اللحظة؟`,
    modelStockNone: (model: string) => `لا مكان في آخر معاينة؛ وتُحدِّث هذه الصفحة قائمتها حالما يضع متجر Apple أمريكي ${model} للاستلام.`,
    nUsStores: forms({ one: "متجر Apple أمريكي واحد", two: "متجرا Apple أمريكيان", few: "# متاجر Apple أمريكية", many: "# متجرًا أمريكيًا", other: "# متجر Apple أمريكي" }),
    modelStockSome: (c: string) => `في ${c} عند آخر معاينة؛ كلٌّ منها مسمّى أدناه مع التكوينات التي يعرضها.`,
    priceQ: (model: string) => `ما سعر ${model} على apple.com؟`,
    priceA: (low: string, high: string, storages: string, colors: string) => `أسعار القائمة للجهاز غير المقفل تمتد من ${low} إلى ${high} بحسب السعة (${storages})، والطلاءات: ${colors}.`,
    modelRestockQ: (model: string) => `كم مرة يعود ${model} إلى الرف؟`,
    modelLastsQ: (model: string) => `كم يبقى ${model} العائد على الرف؟`,
    reserveQ: (model: string) => `هل يمكن حجز ${model} لي قبل أن أطلبه؟`,
    reserveA: "ليس قبل الطلب: حين يعرض متجرٌ التكوين، تقدّم طلبًا على apple.com مع الاستلام من المتجر، وعندها فقط يُجنَّب الجهاز لموعد استلامك.",

    storeStockQ: (store: string, model: string) => `هل ${model} على الرف في ${store}؟`,
    nConfigs: CONFIGS,
    storeStockYes: (c: string) => `نعم: ${c} في آخر معاينة، والسعة والطلاء مبيّنان في جدول هذه الصفحة.`,
    storeStockNo: (other: { pro: string; proMax: string } | null) => `ليس في آخر معاينة${other ? `؛ لكن المتجر يعرض ${other.pro} من تكوينات iPhone 18 Pro و${other.proMax} من تكوينات 18 Pro Max` : "، و18 Pro و18 Pro Max خارج الرف أيضًا"}.`,
    hoursQ: (store: string) => `متى يفتح ${store}؟`,
    hoursA: ({ hours, today, address, phone }: { hours: string | null; today: string | null; address: string; phone: string | null }) =>
      `${hours ?? "أوقات الدوام في هذه الصفحة"}${today ? ` (اليوم ${today})` : ""}، والعنوان ${streetAr(address)}${phone ? `؛ الهاتف ${phone}` : ""}.`,
    storeRestockQ: (store: string) => `كم مرة تعود أجهزة iPhone إلى الرف في ${store}؟`,
    storeLastsQ: (store: string) => `كم تبقى العودات على الرف في ${store}؟`,
    storeNearestQ: (store: string) => `أي متاجر Apple الأخرى هي الأقرب إلى ${store}؟`,

    placeStockQ: (place: string, model: string) => `أي متاجر Apple في ${place} تضع ${model} على الرف الآن؟`,
    placeStockNone: (place: string, model: string) => `لا شيء في آخر معاينة؛ وما إن يعرض متجر في ${place} ${model} للاستلام حتى تُظهره هذه الصفحة.`,
    nStores: STORES,
    placeStockSome: (c: string, stores: string) => `${c} في آخر معاينة: ${stores}.`,
    countQ: (place: string) => `كم متجر Apple في ${place}؟`,
    nAppleStores: APPLE_STORES,
    countMany: (c: string, stores: string) => (c.startsWith("متجرا") ? `${c}، هما ${stores}.` : `${c}؛ من بينها ${stores}.`),
    countOne: (c: string, store: string) => `${c}، هو ${store}.`,
    placeRestockQ: (place: string) => `كم مرة تعود أجهزة iPhone إلى الرف في ${place}؟`,
    placeLastsQ: (place: string) => `كم يبقى المخزون بعد العودة في ${place}؟`,
    placeNearestQ: (place: string) => `أي متاجر Apple خارج ${place} هي الأقرب؟`,
  },

  explainer: (kind: Kind, place: string) => {
    const at = kind === "store" ? place : kind === "model" ? "كل متاجر Apple في الولايات المتحدة" : `متاجر Apple في ${place}`;
    return [
      "عروض الاستلام ملك apple.com: يطلب الدفع تكوينًا ومتجرًا، ويتم السداد أونلاين، والاستلام شخصيًا، وكثيرًا ما يكون في اليوم ذاته. أما رفوف المتجر الحضورية ومخزون شركات الاتصالات فشيء آخر.",
      `يدوّن ShelfSpring كل تكوين متابَع في ${at} من مصدر مخزون متزامن؛ ولا يدخل أي تغيير السجل إلا بعد معاينة تؤكده.`,
      "كل تغيير مؤكد يصبح قيدًا في السجل، ومن هذه القيود تُرسم مخططات العودة والسجل في هذه الصفحة.",
    ];
  },
  alertRule: "كل تنبيه مربوط بمتجر واحد وتكوين واحد محدد؛ تأتي الإشعارات بعد رصد التوفر والمزامنة، فأكّد طلبك لدى Apple.",

  titles: {
    state: (name: string, duoNow: string, stores: string) => [
      `ابل ستور ${name}: iPhone Duo متوفر في ${duoNow} من ${count(parseN(stores), STORES_G)} الآن`,
      `ابل ستور ${name}: مخزون iPhone Duo للاستلام مباشرة`,
      `ابل ستور ${name}: مخزون iPhone Duo`,
      `ابل ستور ${name}: مخزون iPhone`,
    ],
    city: (city: string, code: string, duoNow: string, stores: string) => [
      `ابل ستور ${city}، ${code}: iPhone Duo في ${duoNow} من ${count(parseN(stores), STORES_G)}`,
      `ابل ستور ${city}، ${code}: مخزون iPhone Duo للاستلام`,
      `ابل ستور ${city}، ${code}: مخزون iPhone Duo`,
      `ابل ستور ${city}: مخزون iPhone`,
    ],
    /** «ابل دبي مول» أولًا (كما يكتبها الناس في البحث)، ثم الوعد. */
    store: (name: string, region: string | null) => {
      const n = searchedStore(name);
      const r = region ? ` (${region})` : "";
      return [
        `${n}${r}: مخزون iPhone اليوم، الاستلام وساعات العمل`,
        `${n}${r}: مخزون iPhone اليوم وساعات العمل`,
        `${n}${r}: مخزون iPhone وساعات العمل`,
        `${n}: مخزون iPhone اليوم، الاستلام وساعات العمل`,
        `${n}: مخزون iPhone وساعات العمل`,
        `${n}: مخزون iPhone`,
        `${n} – المخزون`,
      ];
    },
    model: (name: string, storesNow: string) => [
      `مخزون ${name} للاستلام: متوفر الآن في ${storesNow} من متاجر Apple`,
      `مخزون ${name} للاستلام: في ${count(parseN(storesNow), STORES_G)} الآن`,
      `مخزون ${name} للاستلام من المتجر مباشرة`,
    ],
  },

  tokens: {
    tooFewToMeasure: "غير قابل للقياس بعد",
    noneLoggedYet: "ليس في السجل بعد",
    noneYet: "لم يُدوَّن بعد",
  },

  pattern: {
    none: (days: string) => `سجل ${daysOf(days)} لا يحمل أي عودة مؤكدة.`,
    nConfirmed: CONFIRMED,
    countIn: (c: string, days: string) => `${c} على مدى ${daysOf(days)}`,
    stay: (minutes: string) => `؛ وسيط العرض نحو ${count(parseN(minutes), MINUTES)}`,
    nDays: DAYS,
    tooFew: (c: string, onDays: string | null, stay: string) => `${c}${onDays ? `، كلها في ${onDays}` : ""}: أيام متفرقة أقل من أن تحدد ساعة معتادة${stay}.`,
    usual: (hour: string, weekday: string | null, c: string, stay: string) => `تتجمع العودات قرب الساعة ${hour} بتوقيت المتجر${weekday ? `، وأكثرها يوم ${weekday}` : ""}؛ ${c}${stay}.`,
  },

  regionNouns: Object.fromEntries(Object.entries(NOUNS).map(([k, w]) => [k, { one: w.one, other: w.other }])) as Record<string, Forms>,

  measured: "ملاحظات المنهج",

  faqTitle: "أسئلة متكررة",
  breadcrumb: "مسار الصفحة",
  keepExploring: "المزيد من السجل",
  browse: {
    storesByState: "تصفّح حسب الولاية",
    allStatesCities: "كل ولاية ومدينة ←",
    liveByModel: "حالة الرف لكل iPhone",
    modelStock: (model: string) => `توفر ${model}`,
    thisPage: "أنت هنا",
    restockLog: (short: string) => `سجل عودات ${short}`,
    liveMap: "عرض الخريطة",
    mostStores: "أكبر أعداد المتاجر",
    allStates: "كل ولاية",
    bigCities: "المدن الرئيسية",
    cities: "مدن فيها متاجر",
    storesBy: (region: string) => `تصفّح حسب ال${region}`,
    allStoresIn: ({ country }: { inName: string; country: string }) => <>قائمة متاجر {country} كاملة ←</>,
    allRegions: (regions: string) => `قائمة ال${regions} كاملة`,
  },
  modelCards: "لكل طراز",
  narrative: {
    lastRestock: (config: ReactNode, at: ReactNode, ago: ReactNode) => <>{" "}أحدث عودة مدوّنة: {config}{at}، {ago}.</>,
    at: (store: ReactNode) => <> في {store}</>,
  },
  statStrip: {
    inStockNow: "على الرف الآن",
    ofStores: (n: string) => `عبر ${count(parseN(n), STORES_G)}`,
    stores: "المواقع",
    nCities: forms({ one: "في مدينة واحدة", two: "في مدينتين", few: "في # مدن", many: "في # مدينة", other: "في # مدينة" }),
    tracked: "في السجل",
    modelNow: (short: string) => `${short} على الرف`,
    configsInStock: "تكوينات على الرف",
    storesWithStock: forms({ one: "متجر يعرضه", two: "متجران يعرضانه", few: "متاجر تعرضه", many: "متجرًا يعرضه", other: "متجر يعرضه" }),
    restocks24h: "عودات، 24 ساعة",
    restocksHint: (week: string, month: string, days: string) => `7 أيام: ${week} · ${daysOf(days)}: ${month}`,
    sellOuts: (days: string) => `غادر الرف مجددًا (${daysOf(days)})`,
    stays: (duration: string) => `وسيط الرف ~${duration}`,
    noPairs: "لا أزواج مكتملة",
    lastRestock: "أحدث عودة",
    noneYet: "لم يُدوَّن بعد",
    inLastDays: (days: string) => `خلال ${daysOf(days)}`,
  },
  product: {
    chooseIphone: "اختر طرازًا",
    storage: "السعة",
    color: "الطلاء",
    all: "أيٌّ منها",
    numbersAre: (unit: ReactNode) => <>كل رقم يعدّ {unit} التي تضعه على الرف الآن.</>,
    seen: (ago: ReactNode) => <>دُوِّن {ago} · على الرف</>,
    last: (ago: ReactNode) => <>آخر ظهور {ago} · خارجه الآن</>,
    notSeenYet: "لم يظهر على الرف بعد",
    firstCheckPending: "بانتظار أول معاينة",
    inStock: "على الرف",
    inStockLower: "على الرف",
    none: "خارج الرف",
    here: "في هذا المكان",
    notAvailable: "خارج الرف",
    notCheckedYet: "لا معاينة بعد",
    availableForPickup: "معروض للاستلام",
    since: (ago: ReactNode) => <> · أول تدوين {ago}</>,
    lastInStock: (ago: ReactNode) => <>آخر ظهور على الرف {ago}</>,
    neverSeen: "لم يظهر على هذا الرف بعد",
    firstCheckSoon: "أول معاينة وشيكة",
    buy: "اطلب عبر apple.com",
    checked: (checked: ReactNode, note: ReactNode) => <>رُصد {checked} · {note}</>,
    checkNote: "تحديثات متكررة للمخزون",
  },

  source: (source: ReactNode) => <>البيانات: {source}</>,
  photoCredit: (link: ReactNode) => <>مصدر الصورة: {link}</>,
  sources: "المراجع",
  allUsStores: "مجموعة متاجر Apple الأمريكية كاملة (269 متجرًا)",
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>سجل المخزون المعروض لدى ShelfSpring لـ{where}: بيانات تاريخية من {since}، والأرقام محدثة في {asOf}. تُرسل التنبيهات بعد اكتشاف توفر مطابق. قد تضيف فحوصات المصدر والمزامنة وتسليم الإشعارات بعض التأخير.  تاريخ البداية يصف نطاق البيانات وليس عمر ShelfSpring.</>,
  live: {
    configsCaption: (stores: ReactNode, model: ReactNode) => <>{model}: كم متجرًا من متاجر Apple الـ{stores} يعرض كل تكوين في هذه المعاينة</>,
    storage: "السعة",
    pricesCaption: (model: ReactNode) => <>{model} على apple.com: سعر القائمة غير المقفل قبل الضريبة، بجانب المتاجر التي تعرضه الآن</>,
    price: "سعر القائمة",
    bestColor: "الطلاء الأكثر عرضًا (متاجر)",
    noRestock: (model: string) => `لا يحمل السجل أي عودة لـ${model} بعد.`,
    clockLabel: (model: string) => `عبر المتاجر الأمريكية لـ${model}`,
    storesWithIt: "متاجر تعرضه",
    pairsInStock: "أزواج متجر–تكوين على الرف",
    restocksLogged: "العودات في السجل",
    medianTime: "وسيط المكوث على الرف",
    underOneMin: (min: string) => `< ${min}`,
  },

  photos: {
    "apple-store-pickup-counter": { alt: "لافتة Pickup فوق منضدة خشبية للاستلام في أحد متاجر Apple", caption: "هنا تنتهي رحلة طلب الاستلام: منضدة التسليم." },
    "phone-map": { alt: "تطبيق خرائط مفتوح على هاتف بين يدين في الهواء الطلق", caption: "حين يبقى التكوين على الرف دقيقة واحدة، يحسم الطريق إلى المتجر أكثر مما يُتوقع." },
    "phone-card-payment": { alt: "iPhone وبطاقة ائتمان في يد امرأة أثناء دفع أونلاين", caption: "السداد على الإنترنت، والتسلّم من المتجر." },
    "phone-on-box": { alt: "علبة بيضاء يعلوها هاتف ذكي جديد", caption: "جهاز خرج من علبته للتو." },
    "city-map-phone": { alt: "خريطة مدينة على شاشة هاتف ينظر إليها شخصان", caption: "رسم الطريق قبل الانطلاق إلى المتجر." },
    "phone-notification": { alt: "شاشة قفل هاتف ممسوك باليد وعليها إشعارات", caption: "الإشعار يظهر على شاشة القفل." },
    "apple-store-crowd-inside": { alt: "طابور طويل داخل متجر Apple مكتظ في مركز تسوق", caption: "داخل متجر Apple في أسبوع الإطلاق: ما يعود إلى الرف يغادره خلال دقائق." },
    "apple-store-glass-canopy": { alt: "واجهة زجاجية ومظلة خشبية لمتجر Apple في الليل", caption: "واجهة متجر Apple الزجاجية بعد الغروب." },
    "apple-store-night-vancouver": { alt: "متجر Apple في فانكوفر بأضوائه الليلية", caption: "قد يعود التكوين إلى الرف في أي ساعة، لكن السجل يميل بوضوح إلى الصباح." },
    "phone-hand-camera": { alt: "يد تمسك iPhone بثلاث عدسات خلفية", caption: "طرازات Pro هي سبب الطوابير عادة." },
    "place-ae-uae": { alt: "جسر مشاة مقوّس ونخيل أمام برج العرب في مدينة جميرا بدبي", caption: "دبي: برج العرب." },
    "place-ae-abu-dhabi": { alt: "مياه زرقاء صافية تمتد نحو أبراج كورنيش أبوظبي في يوم مشمس", caption: "أبوظبي كما تُرى من البحر." },
    "place-ae-abu-dhabi-emirate": { alt: "جامع الشيخ زايد الكبير بقبابه ومآذنه البيضاء تحت سماء زرقاء", caption: "أبوظبي: جامع الشيخ زايد الكبير." },
    "place-ae-dubai": { alt: "لقطة جوية لبرج خليفة يعلو دبي مول في وسط المدينة", caption: "وسط دبي: متجر Apple دبي مول في المول الملاصق لبرج خليفة." },
  },
};
export const content: Dict["content"] = withShelfContent("ar", baseContent);
