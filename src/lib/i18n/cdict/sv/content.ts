import type { CDict } from "../en";

/** Swedish client strings: content — the first-screen shelf check and the navigation skeletons. */
export const content: CDict["content"] = {
  quickCheck: {
    model: "Välj iPhone-modell",
    search: "Hitta butiker via postnummer, stad eller butiksnamn",
    useLocation: "Sortera butikerna efter min position",
    nearMe: "📍 Hitta mig",
    locationOff: "Platsåtkomst är avslagen här; ange ett postnummer i stället.",
    storesNow: "{what}: på hyllan i **{n} / {total}** Apple Store-butiker i USA just nu",
    nearestTo: " · sorterat från {place}",
    you: "dig",
    noMatch: "Inget hittades. Ange ett femsiffrigt postnummer eller ett ortnamn.",
    inStock: "{n} av {total} på hyllan",
    soldOut: "Borta från hyllan",
    alertMe: "Lägg till på min bevakningslista",
    allStores: "Hela butikslistan ({n}) →",
    here: "här",
  },
  skeleton: {
    loading: "Hämtar sidan",
  },
};
