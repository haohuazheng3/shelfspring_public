import type { ReactNode } from "react";
import type { Dict } from "../en";

/** Italian strings: chrome — footer, 404 page, the language-version note. */
export const chrome: Dict["chrome"] = {
  footer: {
    blurb: "Confronta la disponibilità attuale con le osservazioni recenti e scegli gli store che puoi raggiungere. Gli avvisi vengono inviati dopo il rilevamento di disponibilità corrispondente. Controlli alla fonte, sincronizzazione e consegna possono introdurre ritardi.",
    blurbIn: (allStores: string) => `${allStores}. Gli avvisi vengono inviati dopo il rilevamento di disponibilità corrispondente. Controlli alla fonte, sincronizzazione e consegna possono introdurre ritardi.`,
    trademark: "Non affiliato né approvato da Apple Inc. Apple, iPhone e Apple Store sono marchi di Apple Inc.",
    product: "Prodotto",
    duoStock: "Disponibilità iPhone Duo",
    proStock: "Disponibilità iPhone 18 Pro",
    proMaxStock: "Disponibilità iPhone 18 Pro Max",
    restockLog: "Registro dei rifornimenti",
    liveMap: "Mappa in tempo reale",
    storesByState: "Negozi per stato",
    pricing: "Prezzi",
    company: "Azienda",
    howItWorks: "Come funziona",
    getApp: "Installa l'app",
    about: "Chi siamo",
    contact: "Contatti",
    allStates: "Tutti gli stati e le città →",
    storesIn: "Apple Store",
    allStores: "Tutti i negozi →",
    legal: "Note legali",
    privacy: "Privacy",
    terms: "Termini",
    refunds: "Rimborsi",
    englishOnly: "In inglese",
    questions: "Domande sull'iPhone Duo",
    restockTimes: "Quando torna disponibile l'iPhone Duo?",
    countries: "Paesi",
    status: "Stato del servizio",
  },
  notFound: {
    title: "Qui non c'è niente",
    body: (stores: ReactNode, map: ReactNode) => <>Questa pagina non esiste. Prova i {stores} o la {map}.</>,
    stores: "negozi per zona",
    map: "mappa in tempo reale",
    home: "Torna alla home",
  },
};
