/** العربية: chrome — التذييل، صفحة 404، صفوف «أين تنظر بعد ذلك» تحت صفحات المتاجر والطرازات. (عناوين الترويسة نصوص عميل: cdict chrome.nav.) */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { STORES } from "./util";

export const chrome: Dict["chrome"] = {
  footer: {
    blurb: "قارن المخزون الحالي بالسجل الحديث، ثم اختر المتاجر التي يمكنك الوصول إليها فعلاً. تُرسل التنبيهات بعد اكتشاف توفر مطابق. قد تضيف فحوصات المصدر والمزامنة وتسليم الإشعارات بعض التأخير.",
    blurbIn: (allStores: string) => `${allStores}. تُرسل التنبيهات بعد اكتشاف توفر مطابق. قد تضيف فحوصات المصدر والمزامنة وتسليم الإشعارات بعض التأخير.`,
    trademark: "علامات Apple وiPhone وApple Store التجارية ملك لشركة Apple Inc. يدوّن ShelfSpring سجلًا مستقلًا لا تربطه بـ Apple أي علاقة تجارية؛ كل ما يظهر هنا لقطة، وApple وحدها تؤكد كل طلب.",
    product: "الرفوف حسب الطراز",
    duoStock: "رفوف iPhone Duo",
    proStock: "رفوف iPhone 18 Pro",
    proMaxStock: "رفوف iPhone 18 Pro Max",
    restockLog: "سجل العودات",
    liveMap: "خريطة الرفوف",
    storesByState: "الولايات في السجل",
    pricing: "الخطط والأسعار",
    company: "عن هذا الدفتر",
    howItWorks: "كيف يُدوَّن السجل",
    getApp: "تطبيق الشاشة الرئيسية",
    about: "عن ShelfSpring",
    contact: "راسِلنا",
    allStates: "كل ولاية ومدينة ←",
    storesIn: "أماكن في السجل",
    allStores: "دليل المتاجر الكامل ←",
    legal: "التفاصيل القانونية",
    privacy: "سياسة الخصوصية",
    terms: "شروط الاستخدام",
    refunds: "قواعد الاسترداد",
    englishOnly: "بالإنجليزية فقط",
    questions: "أسئلة الاستلام",
    restockTimes: "الساعات التي يعود فيها Duo",
    countries: "الأسواق",
    status: "حالة النظام",
  },
  notFound: {
    title: "لا صفحة على هذا العنوان",
    body: (stores: ReactNode, map: ReactNode) => <>ربما كُتب العنوان خطأً أو أُوقف. تابع الأثر من {stores} أو من {map}.</>,
    stores: "دليل المتاجر",
    map: "خريطة الرفوف",
    home: "العودة إلى صفحة البداية",
  },
  browse: {
    next: "أين تنظر بعد ذلك",
    models: "سجلات الطرازات",
    modelStores: (model: string) => `${model}، متجرًا متجرًا`,
    modelReturns: (short: string) => `سجل عودات ${short}`,
    duoMap: "Duo على خريطة الرفوف",
    here: "أنت هنا",
    states: "كل الولايات في السجل",
    /** `region`: كلمة المنطقة مفردة بلا «ال» («إمارة»). */
    regions: (region: string) => `كل ${region} في السجل`,
    directory: "دليل المتاجر الكامل",
    directoryIn: ({ country }: { inName: string; country: string }) => <>دليل {country} الكامل</>,
    largest: "أكبر أعداد المتاجر، أبجديًا",
    /** `regions`: كلمة المنطقة جمعًا بلا «ال» («إمارات» ← «للإمارات»). */
    allRegions: (regions: string) => `القائمة الكاملة لل${regions}`,
    citiesByCount: "المدن حسب عدد المتاجر",
    cities: "مدن في السجل",
    tier: STORES,
  },
};
