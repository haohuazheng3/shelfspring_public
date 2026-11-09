/**
 * العربية: modules — وحدات العودات والمتاجر والرفوف (src/components/{restocks,stores,stock}).
 * صوت ShelfSpring: دفتر رصد مستقل. «عودة» بدل «توفر»، «على الرف / خارج الرف» بدل «متوفر / نفد»، «معاينة» بدل «فحص»،
 * «تكوين» بدل «خيار»، «راقِب» بدل «نبّهني»، «بتوقيت المتجر» بدل «بالتوقيت المحلي». الصفوف مقتضبة بلا حشو مكرر.
 * `label` عبارة مكان تحمل حرف الجر («في دبي»، «في Apple دبي مول»، «هنا»). الأرقام تصل خامًا فتُنسَّق هنا؛ المدد والأوقات
 * والتواريخ تصل منسّقة. فترات الفحص 15 ثانية (كل متجر) و5 ثوانٍ (المتاجر التي عليها تنبيهات) فقط.
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { CONFIGS, CONFIGS_G, DAYS, RETURNS, RETURNS_G, SELLOUTS, STORES, STORES_G, TIMES, N, count } from "./util";


export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `صفحة بيضاء ${label} على مدى ${count(days, DAYS)}: لا عودة ولا خروج من الرف. تظهر الأعمدة مع أول قيد.`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `في ${N(activeDays)} من الأيام الـ${N(days)} الماضية سُجّلت عودة ${label}: ${count(restocks, RETURNS)} إجمالًا، ثم غادر الرف ${count(soldouts, TIMES)}.`,
    busiest: (day: string, restocks: number) => <> يوم الذروة <b className="text-ink">{day}</b>، وفيه {count(restocks, RETURNS)}.</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day}: عاد ${count(restocks, TIMES)}، وغادر الرف ${count(soldouts, TIMES)}`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day} · عودات: ${N(restocks)} · خروج من الرف: ${N(soldouts)}`,
    legendRestocks: "عودات",
    legendSoldouts: "غادر الرف مجددًا",
  },

  last24: {
    title: (label: string) => `عودات iPhone Duo ${label} خلال الساعات الـ24 الماضية`,
    asOf: (when: string) => `لقطة · ${when}`,
    localTime: (when: string) => `${when} بتوقيت المتجر`,
    anAppleStore: "متجر Apple غير مدرج",
    unknown: "لم تُحمَّل حصيلة الـ24 ساعة في هذا الطلب. حالة الرفوف وسجل العودات في هذه الصفحة ما زالا قائمين.",
    none: (label: string, asOf: string) => <><b className="text-ink">24 ساعة هادئة {label}:</b> لم تُدوَّن أي عودة لـ iPhone Duo في النافذة المنتهية {asOf}.</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <>أحدث عودة: <b className="text-ink">{o.config}</b>، {o.when} على ساعة المتجر{o.store != null && <>، دُوِّنت في {o.store}</>}. <b className="text-ink">{`${count(o.restocks, RETURNS)} في النافذة`}</b>{o.one ? null : <>، في {count(o.withStores, STORES_G)} من أصل {N(o.allStores)} {o.label}</>}.</>
    ),
    tileRestocks: "عودات في النافذة",
    tileConfigsBack: "تكوينات رجعت إلى الرف",
    tileStores: (configs: number, allConfigs: number) => `متاجر سجّلت عودة${configs ? ` · ${N(configs)}/${N(allConfigs)} من التكوينات` : ""}`,
    tileLatest: (config: string, store: string | null) => <>آخر ما دُوِّن · {store != null && <>{store} · </>}{config}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>العودة السابقة، {day} · {store != null && <>{store} · </>}{config}</>,
    tileNoEarlier: "لا شيء أقدم في السجل",
    caption: (label: string, asOf: string) => `العودات لكل تكوين من iPhone Duo ${label} في الـ24 ساعة المنتهية ${asOf}`,
    thConfig: "التكوين",
    thRestocks: "العودات",
    thStores: "عدد المتاجر",
    thLast: "الأحدث (ساعة المتجر)",
    thNow: "على الرف الآن",
    ofStores: (n: number, total: number) => `${N(n)}/${N(total)}`,
    noneIn24: "لا شيء مدوَّن",
    yes: "على الرف",
    no: "خارجه",
    countedTitle: "ما الذي يُحسب عودة؟",
    counted: "العودة تغيّر مؤكد من «خارج الرف» إلى «على الرف» لتكوين واحد في متجر واحد. كل رجوع جديد قيد مستقل، لا عدد هواتف. القائمة تعكس آخر معاينة، والسجل يبيّن أين رجع التكوين ولا يتنبأ بموعد الشحنة التالية.",
    alert: (label: string | null) => `ابدأ قائمة مراقبة على هاتفك${label ? ` · ${label}` : ""}`,
  },

  clock: {
    none: (label: string, days: number) => `لا عودة مدوَّنة ${label} على مدى ${count(days, DAYS)}.`,
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `لم يُدوَّن ${label} سوى ${count(total, RETURNS_G)} خلال ${count(days, DAYS)}${dates != null ? `، موزعة على ${count(dates, DAYS)}` : ""}: لا يكفي ذلك لتسمية ساعة معتادة.`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>الساعة المعتادة للعودة {label}: <b className="text-ink">{hour}</b> على ساعة المتجر، استنادًا إلى {count(total, RETURNS_G)} على مدى {count(days, DAYS)}{day ? <>؛ ويتصدّر <b className="text-ink">{day}</b> أيام الأسبوع</> : null}.</>
    ),
    byHour: (zone: string) => `ساعات اليوم · ${zone}`,
    byWeekday: "أيام الأسبوع",
    barReported: (n: number) => ` (+${N(n)} من تقارير خارجية)`,
    barReportedTitle: (bar: string, n: number) => `${bar}: ${N(n)} من تقارير خارجية`,
    legendOurs: "عودات دوّنها هذا السجل",
  },

  feed: {
    empty: "سجل العودات فارغ حتى الآن.",
    available: "على الرف",
    soldOut: "غادر الرف",
    soldOutAt: (time: ReactNode) => <>خروج من الرف · {time}</>,
    since: (time: ReactNode) => <>عودة · {time}</>,
    restockedAt: (time: ReactNode) => <>عودة · {time}</>,
    mapAria: (store: string) => `حدّد موقع ${store} على الأطلس`,
    map: "على الأطلس",
    buyAria: (model: string, config: string) => `اطلب ${model} ${config} من apple.com`,
    buy: "اطلبه من apple.com",
  },

  byConfig: {
    empty: (label: string, days: number) => `لا ترتيب هنا: لم يرجع أي تكوين ${label} على مدى ${count(days, DAYS)}.`,
    intro: (label: string, days: number) => `التكوينات مرتّبة بعدد عوداتها ${label} على مدى ${count(days, DAYS)}.`,
    times: (n: number) => count(n, RETURNS),
    alert: "راقِب",
  },

  sellout: {
    typical: (label: string, band: string) => `وسيط بقاء عودة iPhone Duo على الرف ${label}: ${band} تقريبًا.`,
    half: (label: string, duration: string) => `نصف العودات المقيسة ${label} غادرت الرف خلال ${duration}.`,
    none: (label: string, days: number) => `لم تغادر أي عودة الرف ${label} على مدى ${count(days, DAYS)}.`,
    whatDuo: "iPhone Duo",
    whatAll: "الطرازات كلها",
    tileHalf: (what: string) => <>وسيط المكوث على الرف · {what}</>,
    tileWithin30: "غادر الرف في ≤ 30 ث",
    tileWithin60: "غادر الرف في ≤ دقيقة",
    tileFastest: (n: number, days: number) => <>أقصر مكوث من بين {count(n, SELLOUTS)} · {count(days, DAYS)}</>,
    caption: (days: number) => `لكل طراز، على مدى ${count(days, DAYS)}`,
    thIphone: "الطراز",
    thSoldOut: "عودات مقيسة",
    thHalf: "الوسيط",
    thWithin30: "≤ 30 ث:",
    thWithin60: "≤ دقيقة:",
    thFastest: "الأقصر",
    each: "عودة تلو عودة",
    barNote: (full: string) => `طول الشريط هو المدة على الرف · ${full} تملؤه`,
    stillListed: (duration: string) => `ما زال على الرف · ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "كيف تُحصر مدة البقاء على الرف",
    measured: (_estimated: boolean) => { void _estimated; return "تقع المدة على الرف بين آخر معاينة رأت التكوين وأول معاينة لم تره. العلامة ≈ تعني فترة تقديرية. قد يفوتنا ظهور أقصر من الفاصل بين معاينتين، وهذه المدد لا تضمن وقتًا لإتمام الطلب."; },
  },

  configTable: {
    title: "معاينة الرف حسب التكوين",
    titleAt: (store: string) => `معاينة الرف حسب التكوين · ${store}`,
    lookupOff: (hasRows: boolean) => `أوقفت Apple الاستعلام عن الاستلام لهذا المتجر${hasRows ? "؛ الصفوف أدناه آخر ما أجابت به" : ""}`,
    tracked: (n: number) => `${count(n, CONFIGS)} في السجل`,
    firstSweep: "نفتح الملاحظات الأولى الآن؛ تصل أولى الحالات خلال دقيقة",
    inStock: (n: number, total: number) => `على الرف: ${N(n)} من ${N(total)} متابَعة`,
    available: "على الرف",
    unavailable: "خارج الرف",
    noLookup: "الاستعلام موقوف",
    notChecked: "بانتظار أول معاينة",
    since: (ago: ReactNode) => <>ظهر {ago}</>,
    lastAvailable: (ago: ReactNode) => <>آخر ظهور {ago}</>,
    neverHere: "لم يظهر هنا قط",
    buy: "اطلب",
    alertAria: (model: string, config: string, store: string) => `راقِب ${model} ${config} في ${store}`,
    alert: "راقِب ←",
  },

  matrix: {
    store: "الموقع",
    checked: "آخر معاينة",
    cellTitle: (model: string, n: number, total: number) => `${model}: ${N(n)} من ${count(total, CONFIGS_G)} على الرف`,
  },

  nearby: {
    duo: (short: string, n: number) => `${short} على الرف · ${N(n)}`,
    noDuo: (short: string) => `${short} خارج الرف`,
  },

  stockByModel: {
    availableNow: (n: number, total: number) => `${N(n)}/${N(total)} من التكوينات على الرف`,
    noneNow: (total: number) => `0/${N(total)} على الرف`,
    lookupOff: "أوقفت Apple الاستعلام عن الاستلام لهذا المتجر",
    notChecked: "بانتظار أول معاينة",
    more: (n: number) => `+${N(n)} أخرى`,
    checked: (ago: ReactNode) => <>آخر معاينة {ago}</>,
    alert: "راقِب ←",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>{ago} · تحديثات منتظمة للمخزون</>,
    map: "على الأطلس",
    alert: "راقِب هذا المتجر",
    alsoIn: (region: string) => `المزيد في ${region}`,
    acrossLine: "الأقرب عبر حدود الولاية",
    elsewhere: "الأقرب في مكان آخر",
  },

  hours: {
    title: "أوقات الدوام",
    local: (zone: string) => `الأوقات المعروضة: ${zone}`,
    today: (hours: string, week: string) => ` · ${hours} اليوم · ${week}`,
    directions: "طريق الوصول",
    applePage: "قائمة Apple الرسمية",
    liveMap: "على الأطلس",
    storePage: "سجل المتجر",
    closed: "مقفل",
    everyDay: (hours: string) => `كل يوم ${hours}`,
    openNow: (closes: string) => `الأبواب مفتوحة · حتى ${closes}`,
    opensAt: (opens: string) => `تُفتح الأبواب ${opens}`,
    closedToday: (next: string | null) => (next ? `مقفل اليوم · يعيد الفتح ${next}` : "مقفل اليوم"),
    closedNow: (next: string | null) => (next ? `مقفل حاليًا · يعيد الفتح ${next}` : "مقفل حاليًا"),
    nextOpen: (day: string | null, time: string) => `${day ?? "غدًا"} ${time}`,
    span: (opens: string, closes: string) => `من ${opens} إلى ${closes}`,
  },

  liveStats: {
    inStock: "على الرف",
    storesWith: "متاجر تعرضه",
    lastCheck: "آخر معاينة",
    none: "—",
  },

  board: {
    summary: (n: number, stores: number, short: string) => `${short} على الرف في ${N(n)} من ${count(stores, STORES_G)}`,
    lastCheck: (ago: ReactNode) => <>آخر معاينة {ago}</>,
    firstSweep: "نفتح الملاحظات الأولى الآن.",
    noneListed: (model: string, storage: string | null, color: string | null) => `لا يضع أي متجر ${model}${storage ? ` ${storage}` : ""}${color ? ` بطلاء ${color}` : ""} على الرف في هذه اللحظة.`,
    more: (n: number) => `+${N(n)} أخرى`,
    seen: (ago: ReactNode) => <>دُوِّن {ago}</>,
    loading: "جارٍ قراءة الرفوف",
  },

  /** DuoLedger: سجل الرصد الذي تبدأ به صفحات المناطق والمدن والمتاجر والدول وطراز Duo. يصل `place` اسمًا مجردًا بلا حرف جر. */
  duoLedger: {
    kicker: (place: string) => `سجل الرصد · iPhone Duo · ${place}`,
    headNone: (o) => `الرف خالٍ من iPhone Duo في كل متاجر Apple في ${o.place} (${count(o.n, STORES)}).`,
    headNoneOne: (place: string) => `${place}: لا تكوين من iPhone Duo على الرف.`,
    headSome: (o) => <>iPhone Duo على الرف في {N(o.k)} من {count(o.n, STORES_G)} Apple في {o.place}: {o.list}.</>,
    headSomeOne: (o) => <>{o.place}: {N(o.k)} من {count(o.total, CONFIGS_G)} لـ iPhone Duo على الرف: {o.list}.</>,
    storeItem: (store: ReactNode, configs: number) => <>{store} ({count(configs, CONFIGS)})</>,
    observed: (stamp: string) => `دُوِّن ${stamp}.`,
    lastReturn: (o) => <>{o.when}: أحدث عودة مؤكدة، <b className="text-ink">{o.config}</b>{o.store != null && <> في {o.store}</>}{o.lasted ? <>، {o.lasted}</> : null}.</>,
    noReturnYet: (place: string, since: string) => `فُتح السجل في ${since}، ولم تُدوَّن منذئذ أي عودة مؤكدة لـ iPhone Duo في ${place}.`,
    others: (o) => (o.one ? `للمقارنة: يضع هذا المتجر على الرف ${N(o.pro)} من ${count(o.configs, CONFIGS_G)} لـ iPhone 18 Pro، و${N(o.max)} من ${N(o.configs)} لـ Pro Max.` : `للمقارنة: iPhone 18 Pro على الرف في ${N(o.pro)} من هذه المتاجر، وPro Max في ${N(o.max)}.`),
    mReturns: (since: string) => `عودات مؤكدة منذ ${since}`,
    mStores: "متاجر شهدت عودة واحدة على الأقل",
    mDays: "أيام متابَعة شهدت عودة",
    mWindow: (pct: string) => `أكثر ساعتين نشاطًا · ${pct} من السجل`,
    mPerDay: "عودات لكل يوم متابَع",
    mMedian: "وسيط المكوث على الرف، من الظهور إلى الغياب",
    mToday: "عودات اليوم حتى الآن",
    secUnit: "ث",
    minUnit: "د",
    note: (o) => (o.one
      ? `منذ ${o.since} سجّل ShelfSpring ${N(o.n)} عودة مؤكدة لـ iPhone Duo في ${o.place}، في ${N(o.days)} من ${N(o.tracked)} يومًا متابَعًا. كانت أكثر ساعتين نشاطًا ${o.range} (${o.pct} من السجل؛ ${o.morning} بين الثامنة صباحًا والظهر)، وأكثر ساعة منفردة ${o.busiest} بـ${N(o.busiestN)}.${o.median ? ` اختفى نصف العروض المقاسة خلال ${o.median}.` : ""}${o.config ? ` عاد ${o.config} أكثر من غيره (${N(o.top)} من ${N(o.n)}).` : ""}`
      : `في ${count(o.stores, STORES_G)} Apple في ${o.place}، سجّل ShelfSpring ${N(o.n)} عودة مؤكدة لـ iPhone Duo منذ ${o.since}؛ شهد ${N(o.k)} منها عودة واحدة على الأقل. كانت أكثر ساعتين نشاطًا ${o.range} (${o.zone}؛ ${o.pct} من السجل؛ ${o.morning} بين الثامنة صباحًا والظهر)، وأكثر ساعة منفردة ${o.busiest} بـ${N(o.busiestN)}.${o.median ? ` اختفى نصف العروض المقاسة خلال ${o.median}.` : ""}${o.config ? ` عاد ${o.config} أكثر من غيره (${N(o.top)} من ${N(o.n)}).` : ""}`),
    noteFew: (o) => `${N(o.n)} عودة مؤكدة لـ iPhone Duo ${o.one ? `في ${o.place}` : `في ${count(o.stores, STORES_G)} Apple في ${o.place}`} منذ ${o.since}، خلال ${count(o.days, DAYS)} — أقل من عتبة ${N(o.min)} عودات خلال ${N(o.minDays)} أيام التي يطبقها ShelfSpring قبل وصف ساعة معتادة.${o.median ? ` اختفى نصف العروض المقاسة خلال ${o.median}.` : ""} العودات نفسها مدرجة في السجل أدناه.`,
    hourByHour: "افتح السجل ساعة بساعة ←",
    ledger: (k: number) => (k === 1 ? "آخر عودة مسجلة" : `آخر ${N(k)} عودات مسجلة`),
    col: { observed: "شوهد (ساعة المتجر)", config: "التكوين", store: "المتجر", listed: "المدة على الرف" },
    secs: (k: number) => `${N(k)} ث`,
    mins: (k: number) => `${N(k)} د`,
    listedRange: (low: string, high: string) => `${low}–${high} على الرف`,
    listedAbout: (x: string) => `قرابة ${x} على الرف`,
    stillListed: (x: string) => `على الرف منذ ${x} حتى الآن`,
    method: (o) => `السجل منذ ${o.since} · ${o.note} · تُحسب العودة فقط عندما تتفق ملاحظتان متتاليتان؛ ولا يُحسب الظهور الأول لأي تكوين أبدًا.`,
    delivered: (o) => (o.one
      ? `خلال آخر ${N(o.days)} أيام أوصل ShelfSpring ${N(o.sent)} تنبيهًا إلى الأعضاء عن عودات في ${o.place}.`
      : `خلال آخر ${N(o.days)} أيام أوصل ShelfSpring ${N(o.sent)} تنبيهًا إلى الأعضاء عن عودات في ${N(o.stores)} من ${count(o.total, STORES_G)} Apple في ${o.place}.`),
    watch: (place: string) => `راقب تكوينًا في ${place} ←`,
    watchOne: "راقب تكوينًا في هذا المتجر ←",
    unknown: "تعذّرت قراءة سجل الرصد لهذا الطلب؛ العرض المباشر أعلاه غير متأثر.",
    zone: () => "بتوقيت المتجر",
    allModels: (o) => `كل الطرازات معًا: ${count(o.n, RETURNS)} في السجل خلال ${count(o.days, DAYS)}${o.peak ? `؛ وكانت الساعة الأكثر نشاطًا ${o.peak}` : ""}.`,
  },
};
