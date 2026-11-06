/**
 * نصوص الإشعارات بالعربية (الإشعار الفوري، بريد التنبيه، بريد «توقفت الإشعارات»، أسماء الأجهزة، سطر صفحة الدفع في Stripe).
 * يرسلها الـpoller أيضًا، لذا لا استيراد إلا للأنواع. الأرقام غربية.
 */
import type { NotifyText } from "./en";


export const notifyAr: NotifyText = {
  pushTitle: (cfg: string) => cfg,
  pushBody: (where: string, quote: string | null) => `${where}${quote ? ` — ${quote}` : ""}. اضغط للحجز على apple.com.`,
  testTitle: "إشعارات ShelfSpring مفعّلة",
  testBody: (time: string, device: string) => `${time} · ${device}. تُرسل التنبيهات بعد اكتشاف توفر مطابق. قد تضيف فحوصات المصدر والمزامنة وتسليم الإشعارات بعض التأخير.`,
  device: {
    iphoneApp: "iPhone (تطبيق الشاشة الرئيسية)",
    iphoneSafari: "iPhone (Safari)",
    androidApp: "Android (تطبيق مثبّت)",
    android: (browser: string) => `Android${browser ? ` (${browser})` : ""}`,
    computer: (browser: string) => `الكمبيوتر${browser ? ` (${browser})` : ""}`,
    other: "هذا الجهاز",
  },
  email: {
    subject: (cfg: string, store: string, more: number) => `متوفر: ${cfg} في ${store}${more > 0 ? ` و${more} أخرى` : ""}`,
    intro: "خبر سار — متوفر للاستلام من المتجر الآن:",
    reserve: "احجز",
    store: "المتجر",
    tip: "مخزون الاستلام ينفد بسرعة: افتح تطبيق Apple Store أو apple.com، واختر «Pick up» (الاستلام) ثم المتجر.",
    manage: (url: string) => `إدارة هذا التنبيه أو إيقافه مؤقتًا: ${url}`,
    htmlTitle: "متوفر للاستلام الآن",
    htmlReserve: "احجز على apple.com",
    htmlStorePage: "صفحة المتجر ←",
    htmlTip: "مخزون الاستلام ينفد بسرعة — احجز من تطبيق Apple Store أو apple.com، واختر <b>Pick up</b> (الاستلام) ثم المتجر.",
    htmlManage: "إدارة هذا التنبيه أو إيقافه مؤقتًا",
    cancel: (url: string) => `حصلت على iPhone؟ يمكنك الإلغاء في أي وقت: ${url}`,
    htmlGotIt: "حصلت على iPhone؟",
    htmlCancel: "ألغِ في أي وقت",
    nudge: (url: string) => `إشعارات الهاتف غير مفعّلة لحسابك، لذا تصلك التنبيهات حالياً بالبريد الإلكتروني. افتح ShelfSpring من الشاشة الرئيسية، وسجّل الدخول وفعّل الإشعارات على هذا الجهاز. تُرسل التنبيهات بعد اكتشاف توفر مطابق. قد تضيف فحوصات المصدر والمزامنة وتسليم الإشعارات بعض التأخير. ${url}`,
    htmlNudge: (url: string) => `إشعارات الهاتف غير مفعّلة لحسابك، لذا تصلك التنبيهات حالياً بالبريد الإلكتروني. افتح ShelfSpring من الشاشة الرئيسية، وسجّل الدخول وفعّل الإشعارات على هذا الجهاز. تُرسل التنبيهات بعد اكتشاف توفر مطابق. قد تضيف فحوصات المصدر والمزامنة وتسليم الإشعارات بعض التأخير. <a href="${url}" style="color:#0a7f3f">ShelfSpring →</a>`,
  },
  checkoutSubmit: (plan: string, limit: number, _fastSec: number, _checkSec: number, _alertSec: number) => { void _fastSec; void _checkSec; void _alertSec; return `${plan}: ${limit} تنبيهًا. تحديثات متكررة للمخزون وتنبيه بعد رصد التوفر. قد يتأخر جمع البيانات أو وصول التنبيه. اشتراك شهري، ويمكن الإلغاء في أي وقت.`; },
  stopped: {
    deviceWord: { ios: "iPhone", android: "هاتف Android", desktop: "الكمبيوتر", other: "الجهاز" },
    subject: (device: string) => `توقفت الإشعارات على ${device} — افتح ShelfSpring من الشاشة الرئيسية`,
    gone: (device: string) => `توقف ${device} عن استقبال إشعارات ShelfSpring (أبلغت خدمة الإشعارات أن الاشتراك لم يعد موجودًا).`,
    byEmail: "تصلك تنبيهات التوفر الآن عبر البريد الإلكتروني حتى تعيد تفعيل الإشعارات.",
    reopenIos: "افتح ShelfSpring من الشاشة الرئيسية (لا من Safari)، واضغط «تفعيل الإشعارات» في صفحة «تنبيهاتي».",
    reopenOther: "افتح ShelfSpring، وانتقل إلى «تنبيهاتي» واضغط «تفعيل الإشعارات».",
    causes: "أسباب شائعة: حُذف التطبيق من الشاشة الرئيسية، أو أُوقفت الإشعارات من الإعدادات، أو استُعيد الهاتف.",
  },
  nudge: {
    subject: "إعداد تنبيهات المخزون على هاتفك",
    intro: "إشعارات الهاتف غير مفعّلة لحسابك، لذا تصلك التنبيهات حالياً بالبريد الإلكتروني. افتح ShelfSpring من الشاشة الرئيسية، وسجّل الدخول وفعّل الإشعارات على هذا الجهاز. تُرسل التنبيهات بعد اكتشاف توفر مطابق. قد تضيف فحوصات المصدر والمزامنة وتسليم الإشعارات بعض التأخير.",
    howTitle: "فعّلها في أقل من دقيقة:",
    stepsIos: ["على iPhone افتح shelfspring.com في Safari، اضغط «مشاركة» ثم «إضافة إلى الشاشة الرئيسية».", "افتح ShelfSpring من الشاشة الرئيسية (وليس من Safari) وسجّل الدخول.", "في صفحة الحساب اضغط «تفعيل الإشعارات» ثم «السماح»."],
    stepsOther: "على Android أو الحاسوب: افتح shelfspring.com/account واضغط «تفعيل الإشعارات».",
    after: "إلى أن يُفعَّل جهاز، تستمر تنبيهاتك بالبريد؛ وبعدها تصل كإشعارات ويتوقف البريد.",
    cta: (url: string) => `دليل الإعداد بالصور: ${url}`,
  },
};
