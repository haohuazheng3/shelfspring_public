import type { CDict } from "../en";

/** Swedish client strings: modules (MiniMap, and the footnote on outside reports kept apart from the register). */
export const modules: CDict["modules"] = {
  minimap: {
    aria: "Se {label} i hämtningsatlasen",
    cta: "Se butiken i atlasen →",
  },
  reports: {
    legend: "Externa rapporter · {sources} · {range}",
    note: "{mark} = {what} som {links} lade ut för {range}. ShelfSpring har inte själv sett dem, så de hålls utanför registret och ingår inte i någon siffra här.",
    what: "rapporterade återkomster av {models}",
    whatAny: "rapporterade återkomster",
    markDashed: "Streckad kontur",
    markDashedRings: "Streckade cirklar",
    markHollowDots: "Öppna cirklar",
  },
};
