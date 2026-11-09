import type { CDict } from "../en";

/** Spanish (Spain) client strings: modules (MiniMap, and the footnote on outside return reports). */
export const modules: CDict["modules"] = {
  minimap: {
    aria: "Ver {label} en el atlas de recogida",
    cta: "Ver esta tienda en el atlas →",
  },
  reports: {
    legend: "Informes externos · {sources} · {range}",
    note: "{mark}: {what} de {links}, para {range}. No son observaciones de ShelfSpring: quedan fuera del registro y ninguna cifra de esta página las incluye.",
    what: "informes de reaparición del {models}",
    whatAny: "informes de reaparición",
    markDashed: "Contorno discontinuo",
    markDashedRings: "Círculos discontinuos",
    markHollowDots: "Círculos abiertos",
  },
};
