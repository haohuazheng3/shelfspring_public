import type { CDict } from "../en";

/** Italian client strings: modules (MiniMap, and the other-trackers footnote). */
export const modules: CDict["modules"] = {
  minimap: {
    aria: "Vedi {label} sull'atlante del ritiro",
    cta: "Questo negozio sull'atlante →",
  },
  reports: {
    legend: "Rilevazioni esterne · {sources} · {range}",
    note: "{mark} = {what} diffuse da {links} (periodo: {range}). ShelfSpring non le ha osservate direttamente: restano fuori dal registro e nessuna cifra di questa pagina le comprende.",
    what: "segnalazioni di rientro per {models}",
    whatAny: "segnalazioni di rientro",
    markDashed: "Contorno tratteggiato",
    markDashedRings: "Anelli tratteggiati",
    markHollowDots: "Cerchietti vuoti",
  },
};
