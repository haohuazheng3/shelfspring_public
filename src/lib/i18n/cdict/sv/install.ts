/**
 * Swedish client strings: install (the /install guide and its hand-drawn phone screens). The mock labels use the
 * words iOS, Android and Chrome show in Swedish: Dela, Lägg till på hemskärmen, Lägg till, Tillåt, Inställningar.
 */
import type { CDict } from "../en";

export const install: CDict["install"] = {
  hero: {
    eyebrow: "Enhetsinställning",
    title: "Ge bevakningslistan en väg fram till dig.",
    lead: "Välj din enhet nedan och följ dess spår. ShelfSpring läser av lagret på servern; den här enheten får en notis när en matchande ändring är bekräftad. Hur snabbt den når fram varierar.",
    seeSteps: "Hoppa till stegen för din enhet",
    sendTest: "Skicka en testavisering",
    turnOn: "Aktivera notiser",
    already: "**✓ En enhet tar redan emot.** Aviseringarna når {label}; följ stegen nedan bara om du vill lägga till den här också. {link}",
    myAlerts: "Min bevakningslista",
  },
  progress: {
    homeScreen: "Sparad på hemskärmen",
    signedIn: "Kontot öppet",
    on: "Notiser aktiverade",
    blocked: "Dina inställningar blockerar notiser; steg {n} visar var du ändrar det.",
  },
  steps: {
    title: "Följ spåret för din enhet",
    intro: {
      ios: "Apple levererar webbnotiser på iPhone och iPad bara till sajter som sparats på hemskärmen, så det steget kommer först.",
      android: "Chrome kan leverera notiser från en vanlig flik; att lägga appen på startskärmen är frivilligt.",
      desktop: "En webbläsare på datorn kan ta emot aviseringar direkt, utan installation.",
    },
    tabsLabel: "Typ av enhet",
    tabs: { ios: "iPhone eller iPad", android: "Android-telefon", desktop: "Mac eller pc" },
    ios: {
      safari: { title: "Ladda shelfspring.com i Safari", text: "Bilderna följer Safari. Läser du det här inuti en annan app? Öppna sajten i webbläsaren innan du fortsätter." },
      share: { title: "Leta upp knappen Dela", text: "På iPhone sitter den i verktygsraden längst ned; på iPad överst i fönstret." },
      choose: { title: "Välj ”Lägg till på hemskärmen” i menyn", text: "Raden ligger ofta under de första åtgärderna, så rulla listan om den inte syns." },
      add: { title: "Bekräfta med Lägg till", text: "Det föreslagna namnet, ShelfSpring, kan stå kvar." },
      open: { title: "Starta den nya ikonen och logga in igen", text: "Hemskärmsappen har en egen session, skild från Safari. Använd din vanliga e-post så dyker bevakningslistan upp oförändrad." },
      allow: { title: "Tryck på ”Aktivera notiser” och sedan Tillåt", text: "Knappen finns på sidan med bevakningslistan inne i appen. iOS visar sin behörighetsfråga en enda gång." },
    },
    android: {
      chrome: { title: "Ladda shelfspring.com i Chrome", text: "Edge och Samsung Internet fungerar likadant; webbläsare som är inbyggda i andra appar stöder inte detta." },
      install: { title: "Godkänn Chromes installationserbjudande", text: "En enda bekräftelse. Inget hämtas från en appbutik." },
      menu: { title: "Använd ⋮ och sedan ”Lägg till på startskärmen”", text: "I vissa versioner av Chrome heter raden **Installera app**." },
      open: { title: "Starta ShelfSpring och logga in", text: "Ikonen hamnar på startskärmen eller i applådan. Logga in med din vanliga e-post för att se samma bevakningslista." },
      allow: { title: "Tryck på ”Aktivera notiser” och sedan Tillåt", text: "Android visar sin behörighetsfråga en gång. Samma knapp fungerar också från en vanlig Chrome-flik." },
    },
    desktop: {
      allow: { title: "Tryck på ”Aktivera notiser”", text: "Chrome, Edge, Firefox och Safari 16.1+ på macOS Ventura eller senare stöds. Godkänn behörighetsfrågan som webbläsaren visar." },
      install: { title: "Valfritt: kör ShelfSpring i ett eget fönster", text: "Chrome och Edge visar en installationsikon för det. Om aviseringar kommer fram i bakgrunden beror på webbläsaren och systeminställningarna." },
      phone: { title: "Lägg till telefonen också", text: "Använd samma e-postadress på telefonen. Varje enhet med aktiverade notiser får varje avisering." },
    },
  },
  action: {
    install: "Installera ShelfSpring",
    on: "✓ Den här enheten är aktiverad.",
    sendTest: "Skicka en testavisering",
    needsInstall: "Knappen fungerar inne i hemskärmsappen, inte i Safari.",
    signInFirst: "Logga in för att fortsätta",
    signInThenOn: "Logga in för att aktivera",
    turnOn: "Aktivera notiser",
    denied: "Notiser är blockerade. Tillåt ShelfSpring i Inställningar och ladda om sidan.",
  },
  notes: [
    { q: "Är Safari enda alternativet på iPhone?", a: "Bilderna följer Safaris delningsmeny. På iOS och iPadOS 16.4 eller senare kan även andra webbläsare som stöds erbjuda Lägg till på hemskärmen. Öppna den installerade hemskärmsappen för att aktivera webbnotiser." },
    { q: "Fortsätter telefonen att läsa av lagret?", a: "Lageravläsningarna körs på våra servrar. Webbläsaren eller hemskärmsappen sköter bara leverans och visning av notiser." },
    { q: "Vad händer utan någon aktiverad enhet?", a: "Då mejlas varje avisering till kontots adress. Med en aktiverad enhet skickas aviseringen som notis dit, och e-post tar bara över när ingen enhet kan nås." },
    { q: "Kan flera enheter få aviseringar?", a: "Ja. Använd samma e-postadress överallt där du loggar in; varje enhet med aktiverade notiser får varje avisering." },
  ],
  cta: { title: "En redo enhet behöver en användbar bevakningslista.", button: "Välj telefoner och butiker att hämta i" },

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
    lockScreen: { date: "torsdag 29 oktober", now: "nu", title: "iPhone 18 Pro 256GB svart", body: "Apple Mall of Scandinavia · Solna – på hyllan för hämtning. Öppna apple.com för att beställa." },
  },
};
