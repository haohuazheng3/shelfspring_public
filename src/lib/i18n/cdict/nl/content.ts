/** Dutch client strings: content — the first-screen shelf check (QuickCheck) and the navigation skeletons. */
import type { CDict } from "../en";

export const content: CDict["content"] = {
  quickCheck: {
    model: "Kies een iPhone-model",
    search: "Winkels zoeken op ZIP-code, stad of winkelnaam",
    useLocation: "Winkels sorteren vanaf mijn positie",
    nearMe: "📍 Mijn positie",
    locationOff: "Locatie staat hier uit; vul dan een ZIP-code in.",
    storesNow: "{what}: nu in het schap bij **{n} / {total}** Apple Stores in de VS",
    nearestTo: " · gesorteerd vanaf {place}",
    you: "jou",
    noMatch: "Geen treffer. Vul een ZIP-code van vijf cijfers of een stadsnaam in.",
    inStock: "{n} van {total} in het schap",
    soldOut: "Uit het schap",
    alertMe: "Op mijn volglijst zetten",
    allStores: "Volledige winkellijst ({n}) →",
    here: "hier",
  },
  skeleton: {
    loading: "Wordt geladen",
  },
};
