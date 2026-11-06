import type { ReactNode } from "react";
import type { Dict } from "../en";

/** Swedish strings: chrome — footer, 404 page. */
export const chrome: Dict["chrome"] = {
  footer: {
    blurb: "Jämför aktuellt lager med de senaste observationerna och välj butiker du kan ta dig till. Aviseringar skickas när matchande tillgänglighet upptäcks. Källkontroll, synkronisering och leverans kan ge fördröjning.",
    blurbIn: (allStores: string) => `${allStores}. Aviseringar skickas när matchande tillgänglighet upptäcks. Källkontroll, synkronisering och leverans kan ge fördröjning.`,
    trademark: "Inte knutet till eller godkänt av Apple Inc. Apple, iPhone och Apple Store är varumärken som tillhör Apple Inc.",
    product: "Produkt",
    duoStock: "iPhone Duo i lager",
    proStock: "iPhone 18 Pro i lager",
    proMaxStock: "iPhone 18 Pro Max i lager",
    restockLog: "Påfyllningslogg",
    liveMap: "Livekarta",
    storesByState: "Butiker per delstat",
    pricing: "Priser",
    company: "Företaget",
    howItWorks: "Så funkar det",
    getApp: "Skaffa appen",
    about: "Om oss",
    contact: "Kontakt",
    allStates: "Alla delstater och städer →",
    storesIn: "Apple Store-butiker",
    allStores: "Alla butiker →",
    legal: "Juridik",
    privacy: "Integritet",
    terms: "Villkor",
    refunds: "Återbetalning",
    englishOnly: "På engelska",
    questions: "Frågor om iPhone Duo",
    restockTimes: "När fyller Apple på iPhone Duo?",
    countries: "Länder",
    status: "Driftstatus",
  },
  notFound: {
    title: "Här finns inget",
    body: (stores: ReactNode, map: ReactNode) => <>Sidan finns inte. Testa {stores} eller {map}.</>,
    stores: "butikslistan",
    map: "livekartan",
    home: "Till startsidan",
  },
};
