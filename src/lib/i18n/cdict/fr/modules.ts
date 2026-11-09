/** Chaînes client françaises : modules (mini-carte, note sur les signalements extérieurs au registre). */
import type { CDict } from "../en";

export const modules: CDict["modules"] = {
  minimap: {
    aria: "Situer {label} sur l’atlas du retrait",
    cta: "Situer ce magasin sur l’atlas →",
  },
  reports: {
    legend: "Signalements extérieurs · {sources} · {range}",
    note: "{mark} = {what} mis en ligne par {links} ({range}). ShelfSpring ne les a pas constatés lui-même : ils restent en marge du registre, et aucun chiffre de cette page ne les intègre.",
    what: "signalements de retour ({models})",
    whatAny: "signalements de retour",
    markDashed: "Contour en tirets",
    markDashedRings: "Cercles en tirets",
    markHollowDots: "Cercles vides",
  },
};
