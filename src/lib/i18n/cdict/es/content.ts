import type { CDict } from "../en";

/** Spanish (Spain) client strings: content — the first-screen shelf check and the navigation skeletons. */
export const content: CDict["content"] = {
  quickCheck: {
    model: "Elige un modelo de iPhone",
    search: "Busca tiendas por código postal, ciudad o nombre",
    useLocation: "Ordenar las tiendas desde mi ubicación",
    nearMe: "📍 Localízame",
    locationOff: "El acceso a la ubicación está bloqueado aquí; escribe un código postal.",
    storesNow: "{what}: en el estante de **{n} / {total}** Apple Store de EE. UU. en este momento",
    nearestTo: " · ordenadas desde {place}",
    you: "tu posición",
    noMatch: "Ninguna coincidencia. Escribe un código postal de cinco cifras o el nombre de una ciudad.",
    inStock: "{n} de {total} en el estante",
    soldOut: "Fuera del estante",
    alertMe: "Añadirlo a mi lista de seguimiento",
    allStores: "Lista completa de tiendas ({n}) →",
    here: "aquí mismo",
  },
  skeleton: {
    loading: "Cargando la página",
  },
};
