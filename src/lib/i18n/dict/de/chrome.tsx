/**
 * German strings: chrome — footer, 404 page, the "where to look next" rows under the SEO pages (browse).
 * (Header labels are client strings: cdict chrome.nav.) Voice: unabhängiges Beobachtungsbuch — „Rückkehr“ für
 * Restocks, „Regal“ für die Abholbarkeit, „beobachten“ für eine Benachrichtigungsregel.
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";

export const chrome: Dict["chrome"] = {
  footer: {
    blurb: "Leg die aktuelle Liste neben die jüngsten Aufzeichnungen und wähle nur Stores, die du realistisch erreichst. Benachrichtigungen gehen raus, sobald passender Bestand erkannt ist; Quellabfrage, Abgleich und Zustellung können Verzögerung bringen.",
    blurbIn: (allStores: string) => `${allStores}. Benachrichtigungen gehen raus, sobald passender Bestand erkannt ist; Quellabfrage, Abgleich und Zustellung können Verzögerung bringen.`,
    trademark: "Die Marken Apple, iPhone und Apple Store gehören der Apple Inc. ShelfSpring führt ein unabhängiges Beobachtungsbuch ohne geschäftliche Verbindung zu Apple; jede Listung hier ist eine Momentaufnahme, und jede Bestellung bestätigt Apple selbst.",
    product: "Regale nach Modell",
    duoStock: "iPhone-Duo-Regal",
    proStock: "iPhone-18-Pro-Regal",
    proMaxStock: "iPhone-18-Pro-Max-Regal",
    restockLog: "Rückkehr-Logbuch",
    liveMap: "Abhol-Atlas",
    storesByState: "Bundesstaaten im Verzeichnis",
    pricing: "Tarife",
    company: "Über dieses Notizbuch",
    howItWorks: "Wie aufgezeichnet wird",
    getApp: "App für den Home-Bildschirm",
    about: "Über ShelfSpring",
    contact: "Schreib uns",
    allStates: "Jeder Bundesstaat, jede Stadt →",
    storesIn: "Orte im Verzeichnis",
    allStores: "Vollständiges Store-Verzeichnis →",
    legal: "Kleingedrucktes",
    privacy: "Datenschutzhinweise",
    terms: "Nutzungsregeln",
    refunds: "Erstattungsregeln",
    englishOnly: "Nur auf Englisch",
    questions: "Fragen zur Abholung",
    restockTimes: "Stunden, in denen das Duo zurückkehrt",
    countries: "Märkte",
    status: "Systemstatus",
  },
  notFound: {
    title: "Unter dieser Adresse gibt es keine Seite",
    body: (stores: ReactNode, map: ReactNode) => <>Vielleicht ist die Adresse vertippt oder stillgelegt. Nimm die Spur im {stores} oder im {map} wieder auf.</>,
    stores: "Store-Verzeichnis",
    map: "Abhol-Atlas",
    home: "Zurück zur Startseite",
  },
  browse: {
    next: "Wo du weiterschauen kannst",
    models: "Bücher je Modell",
    modelStores: (model: string) => `${model}, Store für Store`,
    modelReturns: (short: string) => `Rückkehr-Logbuch ${short}`,
    duoMap: "Duo im Abhol-Atlas",
    here: "du bist hier",
    states: "Alle Bundesstaaten im Verzeichnis",
    regions: (region: string) => `${region} für ${region}, vollständig`,
    directory: "Vollständiges Store-Verzeichnis",
    directoryIn: ({ country }: { inName: string; country: string }) => <>Vollständiges Verzeichnis: {country}</>,
    largest: "Meiste Stores, A–Z",
    allRegions: (regions: string) => `Alle ${regions} im Überblick`,
    citiesByCount: "Städte nach Zahl der Stores",
    cities: "Städte im Verzeichnis",
    tier: { one: "# Store", other: "# Stores" },
  },
};
