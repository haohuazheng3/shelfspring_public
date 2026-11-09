/** German client strings: content — the first-screen shelf check and the navigation skeletons. */
import type { CDict } from "../en";

export const content: CDict["content"] = {
  quickCheck: {
    model: "iPhone-Modell auswählen",
    search: "Stores per ZIP-Code, Stadt oder Store-Name finden",
    useLocation: "Stores nach meinem Standort sortieren",
    nearMe: "📍 Mich orten",
    locationOff: "Der Standortzugriff ist hier abgeschaltet; gib stattdessen einen ZIP-Code ein.",
    storesNow: "{what}: im Regal bei **{n} / {total}** Apple Stores in den USA, Momentaufnahme",
    nearestTo: " · sortiert ab {place}",
    you: "dir",
    noMatch: "Nichts gefunden. Gib einen fünfstelligen ZIP-Code oder einen Städtenamen ein.",
    inStock: "{n} von {total} im Regal",
    soldOut: "Nicht im Regal",
    alertMe: "Auf meine Merkliste setzen",
    allStores: "Vollständige Store-Liste ({n}) →",
    here: "hier",
  },
  skeleton: {
    loading: "Lädt",
  },
};
