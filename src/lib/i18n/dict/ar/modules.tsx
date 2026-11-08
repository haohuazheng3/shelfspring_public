/**
 * العربية: modules — وحدات التوفر والمتاجر والمخزون (src/components/{restocks,stores,stock}).
 * `label` عبارة مكان تحمل حرف الجر («في دبي»، «في Apple دبي مول»، «هنا»). الأرقام تصل خامًا فتُنسَّق هنا؛ المدد والأوقات
 * والتواريخ تصل منسّقة. فترات الفحص 15 ثانية (كل متجر) و5 ثوانٍ (المتاجر التي عليها تنبيهات) فقط.
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { CONFIGS, DAYS, SELLOUTS, STORES_G, TIMES, N, count, theStoresG } from "./util";


export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `لم يُسجَّل أي توفر أو نفاد ${label} خلال آخر ${count(days, DAYS)}؛ يمتلئ المخطط من أول حالة.`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `${label} خلال آخر ${count(days, DAYS)}: ${restocks === 0 ? "لا توفر" : `توفر ${count(restocks, TIMES)}`} و${soldouts === 0 ? "لا نفاد" : `نفد ${count(soldouts, TIMES)}`}، على مدى ${count(activeDays, DAYS)}.`,
    busiest: (day: string, restocks: number) => <> وكان أكثر الأيام توفرًا <b className="text-ink">{day}</b> ({count(restocks, TIMES)}).</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day}: توفر ${count(restocks, TIMES)}، ونفاد ${count(soldouts, TIMES)}`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day}: توفر ${N(restocks)} · نفاد ${N(soldouts)}`,
    legendRestocks: "توفر",
    legendSoldouts: "نفاد",
  },

  last24: {
    title: (label: string) => `توفر iPhone Duo ${label} خلال آخر 24 ساعة`,
    asOf: (when: string) => `حتى ${when}`,
    localTime: (when: string) => `${when} بالتوقيت المحلي`,
    anAppleStore: "متجر Apple",
    unknown: "تعذّرت قراءة عدد آخر 24 ساعة الآن؛ المخزون المباشر وسجل التوفر في هذه الصفحة لم يتأثرا.",
    none: (label: string, asOf: string) => <><b className="text-ink">لم يتوفر iPhone Duo {label} خلال آخر 24 ساعة</b> (حتى {asOf}).</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <>خلال آخر 24 ساعة توفر iPhone Duo <b className="text-ink">{count(o.restocks, TIMES)} {o.one ? o.label : `في ${N(o.withStores)} من ${theStoresG(o.allStores)} ${o.label}`}</b>؛ آخرها: <b className="text-ink">{o.config}</b>{o.store != null && <> في {o.store}</>}، {o.when} بالتوقيت المحلي.</>
    ),
    tileRestocks: "توفر مؤكد · 24 ساعة",
    tileConfigsBack: "خيارات عادت للتوفر",
    tileStores: (configs: number, allConfigs: number) => `متاجر شهدت توفرًا${configs ? ` · ${N(configs)} من ${count(allConfigs, CONFIGS)}` : ""}`,
    tileLatest: (config: string, store: string | null) => <>الأحدث · {config}{store != null && <> · {store}</>}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>آخر توفر قبلها · {config}{store != null && <> · {store}</>} · {day}</>,
    tileNoEarlier: "لا توفر أقدم في السجل",
    caption: (label: string, asOf: string) => `التوفر المؤكد لكل خيار من iPhone Duo ${label}، آخر 24 ساعة، حتى ${asOf}`,
    thConfig: "الخيار",
    thRestocks: "التوفر",
    thStores: "المتاجر",
    thLast: "آخر توفر (بالتوقيت المحلي)",
    thNow: "متوفر الآن",
    ofStores: (n: number, total: number) => `${N(n)} من ${N(total)}`,
    noneIn24: "لا شيء خلال 24 ساعة",
    yes: "نعم",
    no: "لا",
    countedTitle: "كيف نحتسب التوفر",
    counted: "الحدث هو تغير مؤكد من غير متوفر إلى متوفر لتكوين واحد في متجر واحد. العودة المتكررة أحداث منفصلة وليست عدداً من الهواتف. تعكس القائمة آخر فحص. يوضح السجل أين عاد المخزون، ولا يتنبأ بموعد الشحنة التالية.",
    alert: (label: string | null) => `إعداد تنبيهات المخزون على هاتفك${label ? ` · ${label}` : ""}`,
  },

  clock: {
    none: (label: string, days: number) => `لم يُسجَّل أي توفر ${label} خلال آخر ${count(days, DAYS)} بعد.`,
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `توفر ${count(total, TIMES)} ${label} خلال آخر ${count(days, DAYS)}${dates != null ? ` (في ${count(dates, DAYS)})` : ""}، وهذا أقل من أن يكشف نمطًا بعد.`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>توفر {count(total, TIMES)} {label} خلال آخر {count(days, DAYS)}، وأغلبها نحو الساعة <b className="text-ink">{hour}</b> بالتوقيت المحلي{day ? <>، و<b className="text-ink">{day}</b> أكثر الأيام توفرًا</> : null}.</>
    ),
    byHour: (zone: string) => `حسب الساعة · ${zone}`,
    byWeekday: "حسب يوم الأسبوع",
    barReported: (n: number) => ` (+${N(n)} أبلغت عنها متتبعات أخرى)`,
    barReportedTitle: (bar: string, n: number) => `${bar}: ${N(n)} أبلغت عنها متتبعات أخرى`,
    legendOurs: "مرات عودة المخزون المسجلة",
  },

  feed: {
    empty: "لم يُسجَّل أي توفر بعد.",
    available: "متوفر",
    soldOut: "نفد",
    soldOutAt: (time: ReactNode) => <>نفد {time}</>,
    since: (time: ReactNode) => <>منذ {time}</>,
    restockedAt: (time: ReactNode) => <>توفر {time}</>,
    mapAria: (store: string) => `اعرض ${store} على الخريطة`,
    map: "الخريطة",
    buyAria: (model: string, config: string) => `اشترِ ${model} ${config} من apple.com`,
    buy: "اشترِ من apple.com",
  },

  byConfig: {
    empty: (label: string, days: number) => `لم يعد أي خيار للتوفر ${label} خلال آخر ${count(days, DAYS)}، لذا لا ترتيب بعد.`,
    intro: (label: string, days: number) => `الخيارات التي عادت للتوفر ${label} خلال آخر ${count(days, DAYS)}، الأكثر تكرارًا أولًا.`,
    times: (n: number) => `${N(n)}×`,
    alert: "نبّهني",
  },

  sellout: {
    typical: (label: string, band: string) => `عادةً ينفد iPhone Duo بعد توفره ${label} خلال نحو ${band}.`,
    half: (label: string, duration: string) => `نصف حالات التوفر ${label} نفدت خلال ${duration}.`,
    none: (label: string, days: number) => `لم ينفد أي توفر ${label} خلال آخر ${count(days, DAYS)} بعد.`,
    whatDuo: "iPhone Duo",
    whatAll: "كل أجهزة iPhone",
    tileHalf: (what: string) => <>نصفها نفد خلال · {what}</>,
    tileWithin30: "نفد خلال 30 ثانية",
    tileWithin60: "نفد خلال دقيقة",
    tileFastest: (n: number, days: number) => <>الأسرع · من {count(n, SELLOUTS)} خلال {count(days, DAYS)}</>,
    caption: (days: number) => `حسب الطراز، آخر ${count(days, DAYS)}`,
    thIphone: "iPhone",
    thSoldOut: "نفد",
    thHalf: "نصفها نفد خلال",
    thWithin30: "≤ 30 ث",
    thWithin60: "≤ دقيقة",
    thFastest: "الأسرع",
    each: "كل توفر على حدة",
    barNote: (full: string) => `الشريط = ثوانٍ معروضة · يمتلئ عند ${full}`,
    stillListed: (duration: string) => `ما زال معروضًا · ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "طريقة القياس",
    measured: (_estimated: boolean) => { void _estimated; return "تقع مدة العرض بين آخر رصد للتوفر وأول رصد لعدم التوفر. تشير ≈ إلى فترة تقديرية. قد تفوت العروض الأقصر من فترة الفحص؛ وهذه المدد لا تضمن وقتاً لإتمام الشراء."; },
  },

  configTable: {
    title: "كل الخيارات في هذا المتجر",
    titleAt: (store: string) => `كل الخيارات في ${store}`,
    lookupOff: (hasRows: boolean) => `لا تتيح Apple حاليًا الاستعلام عن الاستلام من هذا المتجر${hasRows ? " (آخر إجاباتها أدناه)" : ""}`,
    tracked: (n: number) => `نتابع ${count(n, CONFIGS)}`,
    firstSweep: "أول فحص جارٍ — تظهر الحالات خلال دقيقة",
    inStock: (n: number, total: number) => `${N(n)} من ${N(total)} متوفرة`,
    available: "متوفر",
    unavailable: "غير متوفر",
    noLookup: "لا استعلام عن الاستلام",
    notChecked: "لم يُفحص بعد",
    since: (ago: ReactNode) => <>{ago}</>,
    lastAvailable: (ago: ReactNode) => <>آخر توفر {ago}</>,
    neverHere: "لم يُشاهَد متوفرًا هنا",
    buy: "اشترِ",
    alertAria: (model: string, config: string, store: string) => `نبّهني حين يتوفر ${model} ${config} في ${store}`,
    alert: "نبّهني ←",
  },

  matrix: {
    store: "المتجر",
    checked: "آخر فحص",
    cellTitle: (model: string, n: number, total: number) => `${model}: ${N(n)} من ${count(total, CONFIGS)} متوفرة`,
  },

  nearby: {
    duo: (short: string, n: number) => `${short} · ${N(n)}`,
    noDuo: (short: string) => `لا ${short}`,
  },

  stockByModel: {
    availableNow: (n: number, total: number) => `${N(n)} من ${count(total, CONFIGS)} متوفرة الآن`,
    noneNow: (total: number) => `لا شيء من ${count(total, CONFIGS)} الآن`,
    lookupOff: "لا تتيح Apple الاستعلام عن الاستلام هنا حاليًا",
    notChecked: "لم يُفحص بعد",
    more: (n: number) => `+${N(n)}`,
    checked: (ago: ReactNode) => <>آخر فحص {ago}</>,
    alert: "نبّهني ←",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>{ago} · تحديثات منتظمة للمخزون</>,
    map: "اعرض على الخريطة",
    alert: "نبّهني هنا",
    alsoIn: (region: string) => `أيضًا في ${region}`,
    acrossLine: "أقرب المتاجر عبر الحدود",
    elsewhere: "أقرب المتاجر في أماكن أخرى",
  },

  hours: {
    title: "ساعات العمل",
    local: (zone: string) => `التوقيت المحلي · ${zone}`,
    today: (hours: string, week: string) => ` · اليوم ${hours} · ${week}`,
    directions: "الاتجاهات",
    applePage: "صفحة المتجر على apple.com",
    liveMap: "الخريطة المباشرة",
    storePage: "صفحة المتجر",
    closed: "مغلق",
    everyDay: (hours: string) => `يوميًا ${hours}`,
    openNow: (closes: string) => `مفتوح الآن · يغلق الساعة ${closes}`,
    opensAt: (opens: string) => `يفتح الساعة ${opens}`,
    closedToday: (next: string | null) => (next ? `مغلق اليوم · يفتح ${next}` : "مغلق اليوم"),
    closedNow: (next: string | null) => (next ? `مغلق الآن · يفتح ${next}` : "مغلق الآن"),
    nextOpen: (day: string | null, time: string) => `${day ?? "غدًا"} الساعة ${time}`,
  },

  liveStats: {
    inStock: "متوفر الآن",
    storesWith: "متاجر فيها مخزون",
    lastCheck: "آخر فحص",
    none: "—",
  },

  board: {
    summary: (n: number, stores: number, short: string) => `${N(n)} من ${count(stores, STORES_G)} فيها ${short}`,
    lastCheck: (ago: ReactNode) => <>آخر فحص {ago}</>,
    firstSweep: "أول فحص جارٍ.",
    noneListed: (model: string, storage: string | null, color: string | null) => `لا يعرض أي متجر ${model}${storage ? ` ${storage}` : ""}${color ? ` بلون ${color}` : ""} الآن.`,
    more: (n: number) => `+${N(n)}`,
    seen: (ago: ReactNode) => <>شوهد {ago}</>,
    loading: "جارٍ تحميل المخزون",
  },

  /** DuoLedger: سجل الرصد الذي تبدأ به صفحات المناطق والمدن والمتاجر والدول وطراز Duo. يصل `place` اسمًا مجردًا بلا حرف جر. */
  duoLedger: {
    kicker: (place: string) => `سجل الرصد · iPhone Duo · ${place}`,
    headNone: (o) => `لا يعرض أي من ${count(o.n, STORES_G)} Apple في ${o.place} جهاز iPhone Duo للاستلام.`,
    headNoneOne: (place: string) => `${place} لا يعرض أي تكوين من iPhone Duo للاستلام.`,
    headSome: (o) => <>معروض للاستلام في {N(o.k)} من {count(o.n, STORES_G)} Apple في {o.place}: {o.list}.</>,
    headSomeOne: (o) => <>{o.place} يعرض {N(o.k)} من {count(o.total, CONFIGS)} iPhone Duo للاستلام: {o.list}.</>,
    storeItem: (store: ReactNode, configs: number) => <>{store} ({count(configs, CONFIGS)})</>,
    observed: (stamp: string) => `رُصد ${stamp}.`,
    lastReturn: (o) => <>آخر عودة مؤكدة: <b className="text-ink">{o.config}</b>{o.store != null && <> في {o.store}</>}، {o.when}{o.lasted ? <>، {o.lasted}</> : null}.</>,
    noReturnYet: (place: string, since: string) => `لا توجد عودة مؤكدة لـ iPhone Duo في ${place} منذ بدء السجل في ${since}.`,
    others: (o) => (o.one ? `iPhone 18 Pro: ${N(o.pro)} من ${N(o.configs)} تكوينًا معروضة هنا؛ 18 Pro Max: ${N(o.max)} من ${N(o.configs)}.` : `iPhone 18 Pro: معروض في ${N(o.pro)} من هذه المتاجر؛ 18 Pro Max: في ${N(o.max)}.`),
    mReturns: (since: string) => `عودات مؤكدة منذ ${since}`,
    mStores: "متاجر شهدت عودة واحدة على الأقل",
    mDays: "أيام متابَعة شهدت عودة",
    mWindow: (pct: string) => `أكثر ساعتين نشاطًا · ${pct} من السجل`,
    mPerDay: "عودات لكل يوم متابَع",
    mMedian: "وسيط مدة العرض، من الظهور إلى الاختفاء",
    mToday: "عودات اليوم حتى الآن",
    secUnit: "ث",
    minUnit: "د",
    note: (o) => (o.one
      ? `منذ ${o.since} سجّل ShelfSpring ${N(o.n)} عودة مؤكدة لـ iPhone Duo في ${o.place}، في ${N(o.days)} من ${N(o.tracked)} يومًا متابَعًا. كانت أكثر ساعتين نشاطًا ${o.range} (${o.pct} من السجل؛ ${o.morning} بين الثامنة صباحًا والظهر)، وأكثر ساعة منفردة ${o.busiest} بـ${N(o.busiestN)}.${o.median ? ` اختفى نصف العروض المقاسة خلال ${o.median}.` : ""}${o.config ? ` عاد ${o.config} أكثر من غيره (${N(o.top)} من ${N(o.n)}).` : ""}`
      : `في ${count(o.stores, STORES_G)} Apple في ${o.place}، سجّل ShelfSpring ${N(o.n)} عودة مؤكدة لـ iPhone Duo منذ ${o.since}؛ شهد ${N(o.k)} منها عودة واحدة على الأقل. كانت أكثر ساعتين نشاطًا ${o.range} (${o.zone}؛ ${o.pct} من السجل؛ ${o.morning} بين الثامنة صباحًا والظهر)، وأكثر ساعة منفردة ${o.busiest} بـ${N(o.busiestN)}.${o.median ? ` اختفى نصف العروض المقاسة خلال ${o.median}.` : ""}${o.config ? ` عاد ${o.config} أكثر من غيره (${N(o.top)} من ${N(o.n)}).` : ""}`),
    noteFew: (o) => `${N(o.n)} عودة مؤكدة لـ iPhone Duo ${o.one ? `في ${o.place}` : `في ${count(o.stores, STORES_G)} Apple في ${o.place}`} منذ ${o.since}، خلال ${count(o.days, DAYS)} — أقل من عتبة ${N(o.min)} عودات خلال ${N(o.minDays)} أيام التي يطبقها ShelfSpring قبل وصف ساعة معتادة.${o.median ? ` اختفى نصف العروض المقاسة خلال ${o.median}.` : ""} العودات نفسها مدرجة في السجل أدناه.`,
    hourByHour: "افتح السجل ساعة بساعة ←",
    ledger: (k: number) => (k === 1 ? "آخر عودة مسجلة" : `آخر ${N(k)} عودات مسجلة`),
    col: { observed: "الرصد (بتوقيت المتجر)", config: "التكوين", store: "المتجر", listed: "مدة العرض" },
    secs: (k: number) => `${N(k)} ث`,
    mins: (k: number) => `${N(k)} د`,
    listedRange: (low: string, high: string) => `عُرض ${low}–${high}`,
    listedAbout: (x: string) => `عُرض نحو ${x}`,
    stillListed: (x: string) => `ما زال معروضًا (${x})`,
    method: (o) => `السجل منذ ${o.since} · ${o.note} · تُحسب العودة فقط عندما تتفق ملاحظتان متتاليتان؛ ولا يُحسب الظهور الأول لأي تكوين أبدًا.`,
    delivered: (o) => (o.one
      ? `خلال آخر ${N(o.days)} أيام أوصل ShelfSpring ${N(o.sent)} تنبيهًا إلى الأعضاء عن عودات في ${o.place}.`
      : `خلال آخر ${N(o.days)} أيام أوصل ShelfSpring ${N(o.sent)} تنبيهًا إلى الأعضاء عن عودات في ${N(o.stores)} من ${count(o.total, STORES_G)} Apple في ${o.place}.`),
    watch: (place: string) => `راقب تكوينًا في ${place} ←`,
    watchOne: "راقب تكوينًا في هذا المتجر ←",
    unknown: "تعذّرت قراءة سجل الرصد لهذا الطلب؛ العرض المباشر أعلاه غير متأثر.",
    zone: () => "بالتوقيت المحلي",
    allModels: (o) => `كل الطرازات معًا: ${N(o.n)} عودة مسجلة خلال ${N(o.days)} يومًا${o.peak ? `؛ وكانت الساعة الأكثر نشاطًا ${o.peak}` : ""}.`,
  },
};
