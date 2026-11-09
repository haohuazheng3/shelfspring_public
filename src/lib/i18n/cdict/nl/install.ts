/**
 * Dutch client strings: install (the /install guide and its drawn phone screens). The mock labels are the words
 * iOS, Android and Chrome show in Dutch: Deel, Zet op beginscherm, Voeg toe, Sta toe, Toevoegen aan startscherm.
 */
import type { CDict } from "../en";

export const install: CDict["install"] = {
  hero: {
    eyebrow: "Toestel klaarzetten",
    title: "Zorg dat je volglijst je kan bereiken.",
    lead: "Kies hieronder je toestel en volg het pad dat erbij hoort. ShelfSpring bekijkt de schappen op de server; dit toestel krijgt een melding zodra een passende wijziging bevestigd is. Hoe lang de bezorging duurt, wisselt.",
    seeSteps: "Naar het stappenpad",
    sendTest: "Testmelding sturen",
    turnOn: "Meldingen inschakelen",
    already: "**✓ Er ontvangt al een toestel.** Meldingen komen binnen op je {label}; volg het pad hieronder alleen als je dit toestel erbij wilt. {link}",
    myAlerts: "Mijn volglijst",
  },
  progress: {
    homeScreen: "Bewaard op beginscherm",
    signedIn: "Account geopend",
    on: "Meldingen ingeschakeld",
    blocked: "Je instellingen houden meldingen tegen; stap {n} laat zien waar je dat verandert.",
  },
  steps: {
    title: "Volg het pad van je toestel",
    intro: {
      ios: "Op iPhone en iPad bezorgt Apple webmeldingen alleen aan sites die op het beginscherm staan, dus dat komt eerst.",
      android: "Chrome kan meldingen bezorgen vanuit een gewoon tabblad; de app op je startscherm zetten mag, maar hoeft niet.",
      desktop: "Een browser op je computer ontvangt meldingen rechtstreeks, zonder iets te installeren.",
    },
    tabsLabel: "Soort toestel",
    tabs: { ios: "iPhone of iPad", android: "Android-telefoon", desktop: "Mac of pc" },
    ios: {
      safari: { title: "Laad shelfspring.com in Safari", text: "De afbeeldingen volgen Safari. Lees je dit in een andere app? Open de site dan eerst in je browser." },
      share: { title: "Zoek de knop Deel", text: "Op de iPhone staat die in de werkbalk onderaan; op de iPad bovenaan het venster." },
      choose: { title: "Kies “Zet op beginscherm” in het menu", text: "Die staat vaak onder de eerste rijen acties; scrol dus verder als je hem niet ziet." },
      add: { title: "Bevestig met Voeg toe", text: "De voorgestelde naam, ShelfSpring, mag blijven staan." },
      open: { title: "Start het nieuwe symbool en meld je opnieuw aan", text: "De beginscherm-app houdt een eigen sessie bij, los van Safari. Gebruik je vertrouwde e-mailadres en je volglijst staat er ongewijzigd." },
      allow: { title: "Druk op “Meldingen inschakelen” en daarna op Sta toe", text: "De knop staat op de pagina van je volglijst in de app. iOS stelt de toestemmingsvraag maar één keer." },
    },
    android: {
      chrome: { title: "Laad shelfspring.com in Chrome", text: "Edge en Samsung Internet werken hetzelfde; browsers die in andere apps zijn ingebouwd, kunnen dit niet." },
      install: { title: "Ga in op het installatieaanbod van Chrome", text: "Eén bevestiging volstaat. Er komt niets uit een appwinkel." },
      menu: { title: "Gebruik ⋮ en dan “Toevoegen aan startscherm”", text: "Sommige Chrome-versies noemen dit **App installeren**." },
      open: { title: "Start ShelfSpring en meld je aan", text: "Het symbool staat op je startscherm of in de app-lade. Meld je aan met je vertrouwde e-mailadres en je ziet dezelfde volglijst." },
      allow: { title: "Druk op “Meldingen inschakelen” en daarna op Toestaan", text: "Android stelt de toestemmingsvraag één keer. Dezelfde knop werkt ook gewoon vanuit een Chrome-tabblad." },
    },
    desktop: {
      allow: { title: "Druk op “Meldingen inschakelen”", text: "Chrome, Edge, Firefox en Safari 16.1+ op macOS Ventura of nieuwer worden ondersteund. Keur de toestemmingsvraag van je browser goed." },
      install: { title: "Optioneel: ShelfSpring in een eigen venster", text: "Chrome en Edge tonen daarvoor een installatiesymbool. Of meldingen ook op de achtergrond binnenkomen, hangt af van de browser en je systeeminstellingen." },
      phone: { title: "Voeg ook je telefoon toe", text: "Gebruik op de telefoon hetzelfde e-mailadres. Elk toestel met ingeschakelde meldingen krijgt elke melding." },
    },
  },
  action: {
    install: "ShelfSpring installeren",
    on: "✓ Dit toestel is ingeschakeld.",
    sendTest: "Testmelding sturen",
    needsInstall: "Deze knop werkt in de beginscherm-app, niet in Safari.",
    signInFirst: "Meld je aan om verder te gaan",
    signInThenOn: "Aanmelden en inschakelen",
    turnOn: "Meldingen inschakelen",
    denied: "Meldingen worden tegengehouden. Geef ShelfSpring toestemming via Instellingen en herlaad dan deze pagina.",
  },
  notes: [
    { q: "Moet het op de iPhone per se via Safari?", a: "De afbeeldingen volgen het deelmenu van Safari. Vanaf iOS en iPadOS 16.4 kunnen ook andere ondersteunde browsers Zet op beginscherm aanbieden. Open daarna de geïnstalleerde beginscherm-app om webmeldingen in te schakelen." },
    { q: "Blijft mijn telefoon zelf de schappen afspeuren?", a: "Nee, de schappen worden op onze servers bekeken. Je browser of beginscherm-app zorgt alleen voor het ontvangen en tonen van meldingen." },
    { q: "En als geen enkel toestel is ingeschakeld?", a: "Dan gaat elke melding per e-mail naar het adres van je account. Is er wel een toestel ingeschakeld, dan krijgt dat de push, en springt e-mail alleen bij als geen toestel bereikbaar is." },
    { q: "Kunnen meerdere toestellen meldingen krijgen?", a: "Ja. Meld je overal aan met hetzelfde e-mailadres; elk toestel met ingeschakelde meldingen krijgt elke melding." },
  ],
  cta: { title: "Een klaar toestel heeft een bruikbare volglijst nodig.", button: "Toestellen en afhaalwinkels kiezen" },

  mocks: {
    share: "Deel",
    shareSheet: { copy: "Kopieer", readingList: "Voeg toe aan leeslijst", bookmark: "Voeg bladwijzer toe", favorites: "Voeg toe aan favorieten", addToHome: "Zet op beginscherm", markup: "Markering" },
    addDialog: { cancel: "Annuleer", title: "Zet op beginscherm", add: "Voeg toe", note: "Er wordt een symbool aan je beginscherm toegevoegd, zodat je snel naar deze website kunt gaan." },
    iosAlert: { title: "“ShelfSpring” wil je berichten sturen", text: "Berichtgeving kan meldingen, geluiden en symboolbadges bevatten. Deze kunnen in Instellingen worden geconfigureerd.", dontAllow: "Sta niet toe", allow: "Sta toe" },
    chromeMenuLabel: "Menu",
    chromeMenu: { before: ["Nieuw tabblad", "Geschiedenis", "Downloads", "Bladwijzers", "Delen…"], add: "Toevoegen aan startscherm", after: ["Desktopsite"] },
    androidAlert: { title: "Toestaan dat ShelfSpring je meldingen stuurt?", dontAllow: "Niet toestaan", allow: "Toestaan" },
    desktopAlert: { wantsTo: "shelfspring.com wil", show: "Meldingen weergeven", block: "Blokkeren", allow: "Toestaan" },
    desktopInstall: { callout: "Installeren", title: "ShelfSpring installeren", text: "Opent in een eigen venster", cancel: "Annuleren", install: "Installeren" },
    lockScreen: { date: "donderdag 29 oktober", now: "nu", title: "iPhone 18 Pro 256GB Zwart", body: "Apple Amsterdam · Amsterdam — in het schap om af te halen. Bestel via apple.com." },
  },
};
