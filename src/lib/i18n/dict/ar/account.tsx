/**
 * العربية: account (صفحة «قائمة المراقبة» ووحدات العودات فيها، و/install و/checkout/success و/pricing). تتبع الشخص لا المتجر،
 * فقد تكون متاجره في أي دولة. **الخط العريض** و[النص](الرابط) عبر <Md>. أسماء الخطط ومبالغ الدولار لا تُترجم.
 */
import type { Dict } from "../en";
import { ALERTS, ALERTS_G, DAYS, HOURS, N, RETURNS, STORES, STORES_G, count, forms } from "./util";

/** "من 8 ثوانٍ إلى 15 دقيقة". */
const OTHER_STORES = forms({ one: "متجر آخر", two: "متجران آخران", few: "# متاجر أخرى", many: "# متجرًا آخر", other: "# متجر آخر" });
/** "10 قواعد تنبيه" / "20 قاعدة تنبيه". */
const RULES = forms({ one: "قاعدة تنبيه واحدة", two: "قاعدتا تنبيه", few: "# قواعد تنبيه", many: "# قاعدة تنبيه", other: "# قاعدة تنبيه" });
const yours = (n: number) => (n === 1 ? "متجرك" : n === 2 ? "متجريك" : `متاجرك (${N(n)})`);

export const account: Dict["account"] = {
  loading: "جارٍ فتح اللوحة",
  meta: { title: "قائمة مراقبتي" },
  signedInAs: (email: string) => `الحساب · ${email}`,
  title: "قائمة مراقبتك، في مكان واحد.",
  units: { s: "ث", min: "د", taps: "لمسات" },

  plan: {
    title: "العضوية والفوترة",
    none: "لا خطة نشطة · التنبيهات مدوّنة لكنها لا تُرسل",
    summary: (plan: string, on: number, limit: number) => `${plan} · ${N(on)}/${N(limit)} تنبيهات نشطة`,
    renews: (date: string) => ` · التجديد القادم ${date}`,
    ends: (date: string) => ` · نشطة حتى ${date}`,
  },

  sent: {
    title: "سجل إشعاراتك",
    last: (ago: string) => `الأحدث ${ago}`,
    none: "لا تسليمات بعد",
    empty: "لم يُسلَّم أي تنبيه حتى الآن.",
    channel: { push: "إشعار", email: "بريد إلكتروني" },
    status: { sent: "سُلّم", failed: "لم يُسلَّم", skipped: "تُرك" },
  },

  fast: {
    title: "حضّر طلبك للاستلام",
    sub: "قائمة قصيرة قبل ظهور خيار مناسب آخر",
    lasts: "وسيط مدة توفر Duo في السجلات",
    push: "يختلف وقت التسليم؛ أكد المخزون لدى Apple",
    tapsLeft: "باقية لك بعد أن يصل الإشعار",
    steps: [
      { title: "حدد نطاق التنقل الممكن", hint: "احتفظ فقط بالمتاجر التي تستطيع الوصول إليها بعد تأكيد الاستلام." },
      { title: "اعرف المواصفات الدقيقة", hint: "جهّز الطراز والسعة واللون قبل فتح موقع Apple." },
      { title: "راجع خيارات الشراء", hint: "اقرأ خيارات الدفع وشركات الاتصالات لدى Apple قبل تقديم الطلب." },
      { title: "تحقق من العرض مرة أخرى", hint: "لا تحجز لك الملاحظة السابقة أو رسالة التنبيه هاتفًا." },
      { title: "انتظر تأكيد جاهزية الاستلام", hint: "اذهب بعد أن تؤكد Apple أن طلبك جاهز للاستلام." },
    ],
    guide: "اقرأ قائمة التحضير للاستلام (بالإنجليزية)",
    window: "ساعات العودة لديك",
  },

  restock: {
    title: "ساعات العودة في متاجرك",
    anyIphone: "iPhone",
    and: " و",
    yours,
    Yours: yours,
    otherStores: (n: number) => count(n, OTHER_STORES),
    meta: (what: string, stores: number, days: number, zone: string) => `${what} · ${count(stores, STORES)} · سجل ${count(days, DAYS)} · ${zone}`,
    busiest: (y: string, then: string | null) => (then ? `أكثر العودات في ${y} · يليه ${then}` : `أكثر العودات في ${y}`),
    busiestArea: (stores: number, zone: string) => `الذروة عبر ${count(stores, STORES_G)} تعمل على ${zone}`,
    next: (inHours: number) => `النافذة القادمة · ${inHours === 0 ? "خلال هذه الساعة" : `بعد ${count(inHours, HOURS)}`}`,
    typical: "وسيط المكوث على الرف",
    count: (y: string, days: number, total: number, pattern: boolean) => (total === 0 ? `لا عودات مدوّنة في ${y} · سجل ${count(days, DAYS)}` : `عودات مدوّنة في ${y} · سجل ${count(days, DAYS)}${pattern ? "" : " · لا تكفي لنمط"}`),
    byHour: (busiestInGreen: boolean) => `ساعات اليوم${busiestInGreen ? " · الذروة بالأخضر" : ""}`,
    byWeekday: (busiest: string | null) => `أيام الأسبوع${busiest ? ` · الذروة ${busiest}` : ""}`,
    hourChart: (y: string, zone: string, items: string) => `العودات حسب ساعة اليوم في ${y}، ${zone}: ${items}`,
    weekdayChart: (y: string, items: string) => `العودات حسب يوم الأسبوع في ${y}: ${items}`,
    chartItem: (label: string, n: number, reported: number) => `${label} ${N(n)}${reported ? ` (+${N(reported)} من طرف ثالث)` : ""}`,
    barTitle: (label: string, n: number, y: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label}: ${count(n, RETURNS)} مدوّنة في ${y}${area ? ` · ${N(area.n)} عبر ${area.zone}` : ""}${reported ? ` · ${N(reported)} من طرف ثالث` : ""}`,
    now: "الآن",
    allZone: (stores: number, zone: string) => `كل متجر يعمل على ${zone} (${N(stores)})`,
    reportMarkBars: "الأعمدة المتقطعة",
    reportMarkDots: "الدوائر المفتوحة",
    sellTitle: "كم تبقى العودات على الرف",
    sellMeta: (what: string, stores: number, days: number) => `${what} · ${count(stores, STORES)} · سجل ${count(days, DAYS)}`,
    sellLabel: (y: string) => `في ${y}`,
  },

  success: {
    metaTitle: "التنبيهات مفعّلة",
    isOn: (plan: string) => `${plan} نشطة`,
    yourPlan: "خطتك",
    received: "تأكد الدفع",
    onPlan: (limit: number) => `في قائمة مراقبتك متسع لـ${count(limit, ALERTS_G)}.`,
    planOn: "خطتك نشطة.",
    pending: "ما زالت Stripe تؤكد الدفع؛ ستظهر الخطة في حسابك خلال دقيقة.",
    open: "افتح قائمة مراقبتي",
    another: "أضف إلى قائمة المراقبة",
    saved: (n: number) => `دُوِّن ${count(n, ALERTS)} · ترسل Stripe الإيصال بالبريد`,
    pushOn: "الإشعارات",
    pushNext: "الخطوة التالية: شغّل جهازًا",
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
    rechecked: "كم مرة تُعايَن متاجرك",
    toPhone: "من عودة مؤكدة إلى جهازك",
    listing: "وسيط مكوث Duo على الرف",
    note: { plus: "مثلًا: تكوين واحد يُراقَب في عشرة متاجر", pro: "مثلًا: تكوينان، عشرة متاجر لكل منهما", max: "مثلًا: خمسة تكوينات، عشرة متاجر لكل منها" },
    month: "في الشهر",
    alerts: (n: number) => count(n, RULES),
    perks: ["اختيار السعة واللون بدقة","تعديل المتاجر وفق الأماكن التي يمكنك زيارتها","إشعارات المتصفح مع البريد الإلكتروني كقناة بديلة"],
    cancel: "يمكن إيقاف التجديد في أي وقت",
    get: (plan: string) => `ابدأ ${plan}`,
    billing: "يمر الدفع عبر Stripe ببطاقة أو Link، والانتقال بين الخطط يُحسب بالتناسب.",
    refund: "شروط الاسترداد: الدفعة التي تمت خلال آخر 7 أيام ولم يُسلَّم بعدها أي تنبيه عودة تُسترد كاملة ([سياسة الاسترداد](/refunds)).",
  },
};
