/** العربية: chrome — التذييل، صفحة 404. (عناوين الترويسة نصوص عميل: cdict chrome.nav.) */
import type { ReactNode } from "react";
import type { Dict } from "../en";

export const chrome: Dict["chrome"] = {
  footer: {
    blurb: "قارن المخزون الحالي بالسجل الحديث، ثم اختر المتاجر التي يمكنك الوصول إليها فعلاً. تُرسل التنبيهات بعد اكتشاف توفر مطابق. قد تضيف فحوصات المصدر والمزامنة وتسليم الإشعارات بعض التأخير.",
    blurbIn: (allStores: string) => `${allStores}. تُرسل التنبيهات بعد اكتشاف توفر مطابق. قد تضيف فحوصات المصدر والمزامنة وتسليم الإشعارات بعض التأخير.`,
    trademark: "لا يتبع ShelfSpring شركة Apple Inc. ولا تعتمده. Apple وiPhone وApple Store علامات تجارية لشركة Apple Inc.",
    product: "الخدمة",
    duoStock: "مخزون iPhone Duo",
    proStock: "مخزون iPhone 18 Pro",
    proMaxStock: "مخزون iPhone 18 Pro Max",
    restockLog: "سجل التوفر",
    liveMap: "الخريطة المباشرة",
    storesByState: "المتاجر حسب الولاية",
    pricing: "الباقات",
    company: "عن الموقع",
    howItWorks: "طريقة العمل",
    getApp: "احصل على التطبيق",
    about: "من نحن",
    contact: "تواصل معنا",
    allStates: "كل الولايات والمدن ←",
    storesIn: "متاجر Apple",
    allStores: "كل المتاجر ←",
    legal: "الشروط والسياسات",
    privacy: "الخصوصية",
    terms: "الشروط",
    refunds: "الاسترداد",
    englishOnly: "بالإنجليزية",
    questions: "أسئلة عن iPhone Duo",
    restockTimes: "متى توفّر Apple جهاز iPhone Duo؟",
    countries: "الدول",
    status: "حالة الخدمة",
  },
  notFound: {
    title: "لا شيء هنا",
    body: (stores: ReactNode, map: ReactNode) => <>هذه الصفحة غير موجودة. جرّب {stores} أو {map}.</>,
    stores: "المتاجر حسب المنطقة",
    map: "الخريطة المباشرة",
    home: "العودة إلى الرئيسية",
  },
};
