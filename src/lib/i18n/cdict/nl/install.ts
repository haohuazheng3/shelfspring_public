/**
 * Dutch client strings: install (the /install guide and its drawn phone screens). The mock labels are the words
 * iOS, Android and Chrome show in Dutch: Deel, Zet op beginscherm, Voeg toe, Sta toe, Toevoegen aan startscherm.
 */
import type { CDict } from "../en";

export const install: CDict["install"] = {
  hero: {
    eyebrow: "Je apparaat voorbereiden",
    title: "Geef je selectie een manier om je te bereiken.",
    lead: "Kies je apparaat en volg de bijbehorende stappen. ShelfSpring controleert voorraad op de server; meldingen volgen op wijzigingen die bij je regels passen. De bezorgtijd kan verschillen.",
    seeSteps: "Bekijk de stappen",
    sendTest: "Stuur een test",
    turnOn: "Zet meldingen aan",
    already: "**Er is al een apparaat ingesteld: {label}.** Volg de stappen om ook dit apparaat toe te voegen en stuur een test. {link}",
    myAlerts: "Mijn alerts",
  },
  progress: {
    homeScreen: "Op het beginscherm",
    signedIn: "Ingelogd",
    on: "Meldingen aan",
    blocked: "Geblokkeerd in de instellingen — zie stap {n}.",
  },
  steps: {
    title: "De route voor jouw apparaat",
    intro: {
      ios: "Voeg ShelfSpring op iPhone en iPad eerst toe aan het beginscherm. Open die app om meldingen in te schakelen.",
      android: "Op Android kun je een geschikte browser gebruiken. Installeren geeft een eigen snelkoppeling, maar is niet verplicht voor meldingen.",
      desktop: "Sta meldingen toe in je browser en controleer ook de instellingen van je computer.",
    },
    tabsLabel: "Je apparaat",
    tabs: { ios: "iPhone / iPad", android: "Android", desktop: "Computer" },
    ios: {
      safari: { title: "Open shelfspring.com in Safari", text: "Deze handleiding laat Safari zien. Open de website rechtstreeks in de browser om de afgebeelde knoppen te vinden." },
      share: { title: "Tik op Deel", text: "Zoek het deelpictogram in de browserbalk. De plaats hangt af van de versie en de gekozen indeling." },
      choose: { title: "Kies “Zet op beginscherm”", text: "Zoek deze actie in het deelmenu. Scrol zo nodig door de beschikbare opties." },
      add: { title: "Tik op Voeg toe", text: "Controleer de naam ShelfSpring en bevestig het nieuwe pictogram op je beginscherm." },
      open: { title: "Open het vanaf je beginscherm en log in", text: "Open het nieuwe pictogram en meld je aan met het e-mailadres van je account. De beginscherm-app kan een aparte aanmelding vragen." },
      allow: { title: "Tik op “Zet meldingen aan” en dan op Sta toe", text: "Gebruik de knop hier of in je account en accepteer de systeemvraag. Stuur daarna vanaf dit apparaat een test." },
    },
    android: {
      chrome: { title: "Open shelfspring.com in Chrome", text: "De afbeeldingen volgen Chrome. Open een link uit een andere app in de volledige browser." },
      install: { title: "Installeer de app", text: "Biedt de browser installatie aan, bevestig dan het venster. Een download uit een appwinkel is niet nodig." },
      menu: { title: "Menu ⋮ → “Toevoegen aan startscherm”", text: "De optie kan **App installeren** heten. Ontbreekt deze, dan kun je verdergaan in het browsertabblad." },
      open: { title: "Open ShelfSpring en log in", text: "Open het pictogram of ga terug naar het tabblad. Gebruik je account-e-mailadres om je opgeslagen selectie terug te vinden." },
      allow: { title: "Tik op “Zet meldingen aan” en dan op Toestaan", text: "Sta meldingen toe wanneer de browser erom vraagt. Komt de test niet aan, controleer dan ook Android-meldingen en batterijbeperkingen." },
    },
    desktop: {
      allow: { title: "Klik op “Zet meldingen aan”", text: "Sta ShelfSpring toe in een geschikte browser en stuur een test. Focusmodi en systeeminstellingen kunnen de melding verbergen." },
      install: { title: "Optioneel: een eigen venster voor ShelfSpring", text: "Chrome en Edge kunnen een installatiepictogram aanbieden. Ontvangst op de achtergrond blijft afhankelijk van browser en besturingssysteem." },
      phone: { title: "Ook je telefoon", text: "Meld je op je telefoon aan met hetzelfde e-mailadres. Schakel meldingen op elk apparaat apart in en test ze daar." },
    },
  },
  action: {
    install: "ShelfSpring installeren",
    on: "✓ Meldingen staan aan op dit apparaat.",
    sendTest: "Stuur een test",
    needsInstall: "Beschikbaar zodra je de app op je beginscherm opent.",
    signInFirst: "Log eerst in",
    signInThenOn: "Log in en zet ze aan",
    turnOn: "Zet meldingen aan",
    denied: "Geblokkeerd. Sta ShelfSpring toe in Instellingen en laad de pagina opnieuw.",
  },
  notes: [{"q":"Waarom laat de iPhone-gids Safari zien?","a":"De afbeeldingen volgen de Safari-menu’s. Andere browsers kunnen ook toevoegen aan het beginscherm aanbieden, met andere menu’s."},{"q":"Controleert mijn telefoon voortdurend de voorraad?","a":"Onze servers doen de voorraadcontroles. De browser of beginscherm-app verwerkt de ontvangst en weergave van meldingen."},{"q":"Wat als push niet beschikbaar is?","a":"E-mail dient als alternatief. Controleer ook je spammap; de bezorging kan tijd kosten."},{"q":"Hoe stel ik meerdere apparaten in?","a":"Gebruik overal hetzelfde account, geef op elk apparaat toestemming en stuur vanaf ieder apparaat een test."}],
  cta: { title: "Een klaar apparaat heeft een bruikbare selectie nodig.", button: "iPhones en ophaalwinkels kiezen" },

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
    lockScreen: { date: "donderdag 29 oktober", now: "nu", title: "iPhone 18 Pro 256GB Zwart", body: "Apple Amsterdam · Amsterdam — Vandaag beschikbaar. Tik om te reserveren op apple.com." },
  },
};
