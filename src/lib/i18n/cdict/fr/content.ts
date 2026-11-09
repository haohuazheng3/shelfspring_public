/** Chaînes client françaises : content — le vérificateur de rayons en haut de page et les squelettes de navigation. */
import type { CDict } from "../en";

export const content: CDict["content"] = {
  quickCheck: {
    model: "Choisir un modèle d’iPhone",
    search: "Chercher par code ZIP, ville ou nom de magasin",
    useLocation: "Trier les magasins selon ma position",
    nearMe: "📍 Me localiser",
    locationOff: "L’accès à la position est coupé sur ce site ; entrez plutôt un code ZIP.",
    storesNow: "{what} : en rayon dans **{n} / {total}** Apple Store américains à cet instant",
    nearestTo: " · classés par distance depuis {place}",
    you: "votre position",
    noMatch: "Rien ne correspond. Entrez un ZIP à cinq chiffres ou un nom de ville.",
    inStock: "{n} sur {total} en rayon",
    soldOut: "Hors rayon",
    alertMe: "L’ajouter à ma liste de veille",
    allStores: "Liste complète des magasins ({n}) →",
    here: "à deux pas",
  },
  skeleton: {
    loading: "Chargement en cours",
  },
};
