import type { CDict } from "../en";

/** Italian client strings: content — the first-screen stock checker and the navigation skeletons. */
export const content: CDict["content"] = {
  quickCheck: {
    model: "Scegli il modello di iPhone",
    search: "Cerca negozi per CAP, città o nome",
    useLocation: "Ordina i negozi partendo da dove sono",
    nearMe: "📍 Trovami",
    locationOff: "Qui l'accesso alla posizione è spento: inserisci un CAP.",
    storesNow: "{what}: a scaffale in **{n} / {total}** Apple Store USA in questo momento",
    nearestTo: " · ordinati a partire da {place}",
    you: "te",
    noMatch: "Nessuna corrispondenza. Inserisci un CAP di cinque cifre o il nome di una città.",
    inStock: "{n} di {total} a scaffale",
    soldOut: "Fuori scaffale",
    alertMe: "Mettilo nella lista d'osservazione",
    allStores: "Elenco completo dei negozi ({n}) →",
    here: "qui",
  },
  skeleton: {
    loading: "In caricamento",
  },
};
