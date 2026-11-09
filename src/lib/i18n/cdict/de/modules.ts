/** German client strings: modules (MiniMap, and the footnote on outside reports). */
import type { CDict } from "../en";

export const modules: CDict["modules"] = {
  minimap: {
    aria: "{label} im Abhol-Atlas ansehen",
    cta: "Diesen Store im Atlas ansehen →",
  },
  reports: {
    legend: "Fremdmeldungen · {sources} · {range}",
    note: "{mark} = {what} aus öffentlichen Notizen von {links} für {range}. ShelfSpring hat sie nicht selbst beobachtet; sie bleiben außerhalb des Beobachtungsbuchs, und keine Zahl hier enthält sie.",
    what: "Rückkehr-Meldungen für {models}",
    whatAny: "Rückkehr-Meldungen",
    markDashed: "Gestrichelte Umrandung",
    markDashedRings: "Gestrichelte Kreise",
    markHollowDots: "Offene Kreise",
  },
};
