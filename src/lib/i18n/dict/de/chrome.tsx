/** German strings: chrome — footer, 404 page. (Header labels are client strings: cdict chrome.nav.) */
import type { ReactNode } from "react";
import type { Dict } from "../en";

export const chrome: Dict["chrome"] = {
  footer: {
    blurb: "Vergleiche den aktuellen Bestand mit den letzten Beobachtungen und wähle Stores, die du erreichen kannst. Alarme werden nach Erkennung passender Verfügbarkeit gesendet. Quellprüfung, Synchronisierung und Zustellung können Verzögerungen verursachen.",
    blurbIn: (allStores: string) => `${allStores}. Alarme werden nach Erkennung passender Verfügbarkeit gesendet. Quellprüfung, Synchronisierung und Zustellung können Verzögerungen verursachen.`,
    trademark: "Nicht mit Apple Inc. verbunden oder von Apple unterstützt. Apple, iPhone und Apple Store sind Marken der Apple Inc.",
    product: "Produkt",
    duoStock: "iPhone Duo Verfügbarkeit",
    proStock: "iPhone 18 Pro Verfügbarkeit",
    proMaxStock: "iPhone 18 Pro Max Verfügbarkeit",
    restockLog: "Restock-Protokoll",
    liveMap: "Live-Karte",
    storesByState: "Stores nach Bundesstaat",
    pricing: "Preise",
    company: "Unternehmen",
    howItWorks: "So funktioniert’s",
    getApp: "App holen",
    about: "Über uns",
    contact: "Kontakt",
    allStates: "Alle Bundesstaaten & Städte →",
    storesIn: "Apple Stores",
    allStores: "Alle Stores →",
    legal: "Rechtliches",
    privacy: "Datenschutz",
    terms: "Nutzungsbedingungen",
    refunds: "Rückerstattung",
    englishOnly: "Auf Englisch",
    questions: "Fragen zum iPhone Duo",
    restockTimes: "Wann ist das iPhone Duo wieder verfügbar?",
    countries: "Länder",
    status: "Status",
  },
  notFound: {
    title: "Hier ist nichts",
    body: (stores: ReactNode, map: ReactNode) => <>Diese Seite gibt es nicht. Weiter zur {stores} oder zur {map}?</>,
    stores: "Store-Übersicht",
    map: "Live-Karte",
    home: "Zur Startseite",
  },
};
