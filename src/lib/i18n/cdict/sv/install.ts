/**
 * Swedish client strings: install (the /install guide and its hand-drawn phone screens). The mock labels use the
 * words iOS, Android and Chrome show in Swedish: Dela, Lägg till på hemskärmen, Lägg till, Tillåt, Inställningar.
 */
import type { CDict } from "../en";

export const install: CDict["install"] = {
  hero: {
    eyebrow: "Förbered enheten",
    title: "Låt din bevakningslista nå dig.",
    lead: "Välj din enhet och följ dess steg. ShelfSpring kontrollerar lager på servern; aviseringar följer på förändringar som matchar dina regler. Leveranstiden kan variera.",
    seeSteps: "Se stegen",
    sendTest: "Skicka ett test",
    turnOn: "Slå på notiser",
    already: "**En enhet är redan inställd: {label}.** Följ stegen för att lägga till även den här och skicka ett test. {link}",
    myAlerts: "Mina bevakningar",
  },
  progress: {
    homeScreen: "På hemskärmen",
    signedIn: "Inloggad",
    on: "Notiser på",
    blocked: "Blockerade i inställningarna – se steg {n}.",
  },
  steps: {
    title: "Vägen för just din enhet",
    intro: {
      ios: "Lägg först till ShelfSpring på hemskärmen på iPhone och iPad. Öppna den appen för att aktivera aviseringar.",
      android: "På Android kan du använda en kompatibel webbläsare. Installation ger en egen genväg men krävs inte för aviseringar.",
      desktop: "Tillåt aviseringar i webbläsaren och kontrollera även datorns systeminställningar.",
    },
    tabsLabel: "Din enhet",
    tabs: { ios: "iPhone / iPad", android: "Android", desktop: "Dator" },
    ios: {
      safari: { title: "Öppna shelfspring.com i Safari", text: "Den här guiden visar Safari. Öppna webbplatsen direkt i webbläsaren för att hitta de avbildade knapparna." },
      share: { title: "Tryck på Dela", text: "Leta efter delningsikonen i webbläsarens verktygsfält. Placeringen beror på version och vald layout." },
      choose: { title: "Välj ”Lägg till på hemskärmen”", text: "Leta efter åtgärden i delningsmenyn. Rulla bland alternativen om den inte syns direkt." },
      add: { title: "Tryck på Lägg till", text: "Kontrollera namnet ShelfSpring och bekräfta den nya ikonen på hemskärmen." },
      open: { title: "Öppna den från hemskärmen och logga in", text: "Starta den nya ikonen och logga in med kontots e-postadress. Hemskärmsappen kan behöva en separat inloggning." },
      allow: { title: "Tryck på ”Slå på notiser” och sedan Tillåt", text: "Använd knappen här eller i ditt konto och godkänn systemets fråga. Skicka sedan ett test från den här enheten." },
    },
    android: {
      chrome: { title: "Öppna shelfspring.com i Chrome", text: "Bilderna visar Chrome. Öppna en länk från en annan app i den fullständiga webbläsaren." },
      install: { title: "Installera appen", text: "Om webbläsaren erbjuder installation bekräftar du dialogen. Ingen hämtning från en appbutik behövs." },
      menu: { title: "Meny ⋮ → ”Lägg till på startskärmen”", text: "Alternativet kan heta **Installera app**. Om det saknas kan du fortsätta i webbläsarfliken." },
      open: { title: "Öppna ShelfSpring och logga in", text: "Öppna ikonen eller återvänd till fliken. Använd kontots e-postadress för att hitta ditt sparade urval." },
      allow: { title: "Tryck på ”Slå på notiser” och sedan Tillåt", text: "Tillåt aviseringar när webbläsaren frågar. Om testet inte kommer fram, kontrollera även Androids aviserings- och batteribegränsningar." },
    },
    desktop: {
      allow: { title: "Tryck på ”Slå på notiser”", text: "Tillåt ShelfSpring i en kompatibel webbläsare och skicka ett test. Fokusläge och systeminställningar kan dölja aviseringen." },
      install: { title: "Valfritt: ett eget fönster för ShelfSpring", text: "Chrome och Edge kan visa en installationsikon. Leverans i bakgrunden beror fortfarande på webbläsaren och operativsystemet." },
      phone: { title: "Din telefon också", text: "Logga in på telefonen med samma e-postadress. Aktivera och testa aviseringar separat på varje enhet." },
    },
  },
  action: {
    install: "Installera ShelfSpring",
    on: "✓ Notiser är på för den här enheten.",
    sendTest: "Skicka ett test",
    needsInstall: "Tillgängligt när du öppnar appen på hemskärmen.",
    signInFirst: "Logga in först",
    signInThenOn: "Logga in, slå sedan på",
    turnOn: "Slå på notiser",
    denied: "Blockerade. Tillåt ShelfSpring i Inställningar och ladda sedan om.",
  },
  notes: [{"q":"Varför visar iPhone-guiden Safari?","a":"Bilderna följer Safaris menyer. Andra webbläsare kan också erbjuda tillägg på hemskärmen, men menyerna kan se annorlunda ut."},{"q":"Kontrollerar telefonen lagret hela tiden?","a":"Våra servrar gör lagerkontrollerna. Webbläsaren eller hemskärmsappen hanterar mottagning och visning av aviseringar."},{"q":"Vad händer om push inte är tillgängligt?","a":"E-post är reservkanalen. Kontrollera även skräpposten; leveransen kan ta tid."},{"q":"Hur förbereder jag flera enheter?","a":"Använd samma konto på varje enhet, tillåt aviseringar var för sig och skicka ett test från varje enhet."}],
  cta: { title: "En redo enhet behöver ett användbart urval.", button: "Välj iPhone och butiker för upphämtning" },

  mocks: {
    share: "Dela",
    shareSheet: { copy: "Kopiera", readingList: "Lägg till i läslista", bookmark: "Lägg till bokmärke", favorites: "Lägg till i favoriter", addToHome: "Lägg till på hemskärmen", markup: "Markering" },
    addDialog: { cancel: "Avbryt", title: "Lägg till på hemskärmen", add: "Lägg till", note: "En symbol läggs till på hemskärmen så att du snabbt kan komma åt den här webbplatsen." },
    iosAlert: { title: "”ShelfSpring” vill skicka notiser till dig", text: "Notiser kan innehålla meddelanden, ljud och symbolbrickor. Dessa kan konfigureras i Inställningar.", dontAllow: "Tillåt inte", allow: "Tillåt" },
    chromeMenuLabel: "Meny",
    chromeMenu: { before: ["Ny flik", "Historik", "Nedladdningar", "Bokmärken", "Dela…"], add: "Lägg till på startskärmen", after: ["Datorversion"] },
    androidAlert: { title: "Vill du tillåta att ShelfSpring skickar aviseringar till dig?", dontAllow: "Tillåt inte", allow: "Tillåt" },
    desktopAlert: { wantsTo: "shelfspring.com vill", show: "Visa aviseringar", block: "Blockera", allow: "Tillåt" },
    desktopInstall: { callout: "Installera", title: "Installera ShelfSpring", text: "Öppnas i ett eget fönster", cancel: "Avbryt", install: "Installera" },
    lockScreen: { date: "torsdag 29 oktober", now: "nu", title: "iPhone 18 Pro 256GB svart", body: "Apple Mall of Scandinavia · Solna – Tillgänglig idag. Tryck för att reservera på apple.com." },
  },
};
