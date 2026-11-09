/** العربية: modules (الخريطة المصغّرة، وحاشية التقارير الخارجية المشتركة بين وحدات الخادم والعميل). */
import type { CDict } from "../en";

export const modules: CDict["modules"] = {
  minimap: {
    aria: "شاهد {label} على أطلس الاستلام",
    cta: "شاهد هذا المتجر على الأطلس ←",
  },
  reports: {
    legend: "تقارير خارجية · {sources} · {range}",
    note: "{mark} = {what} نشرتها {links} عن الفترة {range}. لم يرصدها ShelfSpring بنفسه، لذا تبقى خارج السجل ولا يُحتسب أيٌّ منها في أي رقم هنا.",
    what: "تقارير عودة {models}",
    whatAny: "تقارير عودة",
    markDashed: "الإطار المتقطع",
    markDashedRings: "الدوائر المتقطعة",
    markHollowDots: "الدوائر المفتوحة",
  },
};
