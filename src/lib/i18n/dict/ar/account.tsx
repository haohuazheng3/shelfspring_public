/**
 * العربية: account (صفحة «تنبيهاتي» ووحدات التوفر فيها، و/install و/checkout/success و/pricing). تتبع الشخص لا المتجر،
 * فقد تكون متاجره في أي دولة. **الخط العريض** و[النص](الرابط) عبر <Md>. أسماء الباقات ومبالغ الدولار لا تُترجم.
 */
import type { Dict } from "../en";
import { ALERTS, ALERTS_G, DAYS, HOURS, N, STORES, TIMES, count, forms } from "./util";

/** "من 8 ثوانٍ إلى 15 دقيقة". */
const OTHER_STORES = forms({ one: "متجر آخر", two: "متجران آخران", few: "# متاجر أخرى", many: "# متجرًا آخر", other: "# متجر آخر" });
const yours = (n: number) => (n === 1 ? "متجرك" : n === 2 ? "متجريك" : `متاجرك (${N(n)})`);

export const account: Dict["account"] = {
  loading: "جارٍ التحميل",
  meta: { title: "تنبيهاتي" },
  signedInAs: (email: string) => `مسجّل الدخول: ${email}`,
  title: "تنبيهاتي",
  units: { s: "ث", min: "د", taps: "نقرات" },

  plan: {
    title: "الباقة",
    none: "لا باقة بعد: التنبيهات متوقفة",
    summary: (plan: string, on: number, limit: number) => `${plan} · ${N(on)} من ${count(limit, ALERTS)} مفعّلة`,
    renews: (date: string) => ` · تتجدد في ${date}`,
    ends: (date: string) => ` · تنتهي في ${date}`,
  },

  sent: {
    title: "التنبيهات المرسلة",
    last: (ago: string) => `آخرها ${ago}`,
    none: "لم يُرسَل شيء بعد",
    empty: "لم يُرسَل شيء بعد.",
    channel: { push: "إشعار", email: "بريد إلكتروني" },
    status: { sent: "أُرسل", failed: "فشل", skipped: "تُخطّي" },
  },

  fast: {
    title: "حضّر طلبك للاستلام",
    sub: "قائمة قصيرة قبل ظهور خيار مناسب آخر",
    lasts: "وسيط مدة توفر Duo في السجلات",
    push: "يختلف وقت التسليم؛ أكد المخزون لدى Apple",
    tapsLeft: "تحققات قبل تأكيد الطلب",
    steps: [
      { title: "حدد نطاق التنقل الممكن", hint: "احتفظ فقط بالمتاجر التي تستطيع الوصول إليها بعد تأكيد الاستلام." },
      { title: "اعرف المواصفات الدقيقة", hint: "جهّز الطراز والسعة واللون قبل فتح موقع Apple." },
      { title: "راجع خيارات الشراء", hint: "اقرأ خيارات الدفع وشركات الاتصالات لدى Apple قبل تقديم الطلب." },
      { title: "تحقق من العرض مرة أخرى", hint: "لا تحجز لك الملاحظة السابقة أو رسالة التنبيه هاتفًا." },
      { title: "انتظر تأكيد جاهزية الاستلام", hint: "اذهب بعد أن تؤكد Apple أن طلبك جاهز للاستلام." },
    ],
    guide: "دليل التحضير للاستلام (بالإنجليزية)",
    window: "سجل المتاجر التي اخترتها",
  },

  restock: {
    title: "متى تتوفر متاجرك",
    anyIphone: "iPhone",
    and: " و",
    yours,
    Yours: yours,
    otherStores: (n: number) => count(n, OTHER_STORES),
    meta: (what: string, stores: number, days: number, zone: string) => `${what} · ${count(stores, STORES)} · آخر ${count(days, DAYS)} · ${zone}`,
    busiest: (y: string, then: string | null) => (then ? `أكثر ساعة في ${y} · ثم ${then}` : `أكثر ساعة في ${y}`),
    busiestArea: (stores: number, zone: string) => `الأكثر في كل المتاجر الـ${N(stores)} على ${zone}`,
    next: (inHours: number) => `النافذة التالية · ${inHours === 0 ? "هذه الساعة" : `بعد ${count(inHours, HOURS)}`}`,
    typical: "مدة العرض المعتادة قبل النفاد",
    count: (y: string, days: number, total: number, pattern: boolean) => (total === 0 ? `لا توفر في ${y} بعد · آخر ${count(days, DAYS)}` : `التوفر في ${y} · آخر ${count(days, DAYS)}${pattern ? "" : " · أقل من أن يكشف نمطًا"}`),
    byHour: (busiestInGreen: boolean) => `حسب الساعة${busiestInGreen ? " · الأكثر بالأخضر" : ""}`,
    byWeekday: (busiest: string | null) => `حسب يوم الأسبوع${busiest ? ` · الأكثر ${busiest}` : ""}`,
    hourChart: (y: string, zone: string, items: string) => `التوفر حسب الساعة في ${y}، ${zone}: ${items}`,
    weekdayChart: (y: string, items: string) => `التوفر حسب يوم الأسبوع في ${y}: ${items}`,
    chartItem: (label: string, n: number, reported: number) => `${label} ${N(n)}${reported ? ` (+${N(reported)} أبلغت عنها متتبعات أخرى)` : ""}`,
    barTitle: (label: string, n: number, y: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label}: توفر ${count(n, TIMES)} في ${y}${area ? ` · ${N(area.n)} على ${area.zone}` : ""}${reported ? ` · ${N(reported)} أبلغت عنها متتبعات أخرى` : ""}`,
    now: "الآن",
    allZone: (stores: number, zone: string) => `كل المتاجر الـ${N(stores)} على ${zone}`,
    reportMarkBars: "الأعمدة المتقطعة",
    reportMarkDots: "النقاط المفرغة",
    sellTitle: "كم يصمد التوفر في متاجرك",
    sellMeta: (what: string, stores: number, days: number) => `${what} · ${count(stores, STORES)} · آخر ${count(days, DAYS)}`,
    sellLabel: (y: string) => `في ${y}`,
  },

  success: {
    metaTitle: "التنبيهات مفعّلة",
    isOn: (plan: string) => `${plan} مفعّلة`,
    yourPlan: "باقتك",
    received: "تم استلام الدفع",
    onPlan: (limit: number) => `${count(limit, ALERTS)} في باقتك.`,
    planOn: "باقتك مفعّلة.",
    pending: "سيظهر اشتراكك في حسابك خلال دقيقة.",
    open: "افتح تنبيهاتي",
    another: "أضف تنبيهًا آخر",
    saved: (n: number) => `تم حفظ ${count(n, ALERTS_G)} · الإيصال من Stripe`,
    pushOn: "الإشعارات",
    pushNext: "التالي: التنبيهات على هاتفك",
  },

  install: {
    metaTitle: "جهّز جهازك لإشعارات ShelfSpring",
    metaDescription: "اتبع خطوات هاتفك أو حاسوبك، وسجّل الدخول واختبر الإشعارات. يعتمد الاستلام أيضًا على المتصفح وإعدادات الجهاز.",
  },

  pricing: {
    metaTitle: "خطط قائمة المتابعة: 10 أو 20 أو 50 قاعدة تنبيه",
    metaDescription: "احفظ أجهزة iPhone المناسبة والمتاجر التي يمكنك زيارتها. تبدأ خطط ShelfSpring من 5 دولارات أمريكية شهريًا، وتبقى بيانات المخزون والخرائط والسجل متاحة مجانًا.",
    title: "اشتراك لقائمة خياراتك المناسبة.",
    lead: "تصفّح مجانًا، واشترك عندما ترغب في تلقي التغييرات التي تهمك. **تتابع كل قاعدة مواصفات iPhone محددة في متجر واحد.**",
    chips: ["المخزون والسجل العامان متاحان مجانًا","مصدر المخزون نفسه في جميع الخطط","فوترة شهرية بالدولار الأمريكي","إلغاء التجديد من حسابك"],
    fastest: "ما الذي يقدمه الاشتراك؟",
    everyFast: "يُرسل التنبيه بعد رصد توفر يطابق قواعدك. قد تتأخر الرسالة بسبب فحص المصدر والمزامنة والتسليم.",
    historySample: "جميع البلدان المتابَعة · آخر 7 أيام · {n} فترة توفر مكتملة للاستلام",
    sellsOut: (band: string) => `بلغ وسيط مدة توفر iPhone Duo المرصودة **${band}**. تصف هذه النتيجة العينة المسجلة، ولا تتنبأ بمدة فرصتك المقبلة.`,
    band: (range: string) => `${range} ثانية`,
    aboutMinute: "دقيقة تقريبًا",
    sameSpeed: "تحديثات منتظمة للمخزون",
    rechecked: "إعادة فحص متاجرك",
    toPhone: "من تأكيد التوفر إلى هاتفك",
    listing: "وسيط مدة توفر Duo في السجلات",
    note: { plus: "iPhone واحد × 10 متاجر", pro: "جهازا iPhone × 10 متاجر", max: "5 أجهزة iPhone × 10 متاجر" },
    month: "/ الشهر",
    alerts: (n: number) => count(n, ALERTS),
    perks: ["اختيار السعة واللون بدقة","تعديل المتاجر وفق الأماكن التي يمكنك زيارتها","إشعارات المتصفح مع البريد الإلكتروني كقناة بديلة"],
    cancel: "ألغِ في أي وقت",
    get: (plan: string) => `اشترك في ${plan}`,
    billing: "الدفع عبر Stripe · بطاقة أو Link · تغيير الباقة يُحتسب بالتناسب",
    refund: "لم تناسبك؟ [استرداد كامل خلال 7 أيام](/refunds) إن لم يصلك أي تنبيه توفر بعد",
  },
};
