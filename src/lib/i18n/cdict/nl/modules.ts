/** Dutch client strings: modules (MiniMap, and the outside-reports footnote of the return charts). */
import type { CDict } from "../en";

export const modules: CDict["modules"] = {
  minimap: {
    aria: "{label} bekijken in de afhaalatlas",
    cta: "Deze winkel in de atlas bekijken →",
  },
  reports: {
    legend: "Externe meldingen · {sources} · {range}",
    note: "{mark} = {what} die {links} voor {range} online zette. ShelfSpring heeft die niet zelf waargenomen; ze blijven daarom buiten het logboek en zitten in geen enkel cijfer op deze pagina.",
    what: "rentreemeldingen over de {models}",
    whatAny: "rentreemeldingen",
    markDashed: "Streepjesrand",
    markDashedRings: "Cirkels met streepjes",
    markHollowDots: "Open cirkels",
  },
};
