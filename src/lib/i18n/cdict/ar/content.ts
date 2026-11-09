/** العربية: content — لوحة معاينة الرفوف في الشاشة الأولى (QuickCheck) وهياكل التحميل. */
import type { CDict } from "../en";

export const content: CDict["content"] = {
  quickCheck: {
    model: "اختر طراز iPhone",
    search: "اعثر على المتاجر بالرمز البريدي أو المدينة أو اسم المتجر",
    useLocation: "رتّب المتاجر من موقعي",
    nearMe: "📍 حدّد موقعي",
    locationOff: "الوصول إلى الموقع مغلق هنا؛ اكتب رمزًا بريديًا بدلًا منه.",
    storesNow: "{what}: على الرف في **{n} / {total}** من متاجر Apple الأمريكية الآن",
    nearestTo: " · مرتّبة من {place}",
    you: "موقعك الحالي",
    noMatch: "لم يطابق شيء. جرّب اسم مدينة أو رمزًا بريديًا من خمس خانات.",
    inStock: "{n} من {total} على الرف",
    soldOut: "خارج الرف",
    alertMe: "أضِفه إلى قائمة مراقبتي",
    allStores: "قائمة المتاجر كاملة ({n}) ←",
    here: "في هذا المكان",
  },
  skeleton: {
    loading: "جارٍ قراءة الرفوف",
  },
};
