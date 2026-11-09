import type { CDict } from "../en";

/**
 * Italian client strings: install (the /install guide and its drawn phone screens). Mock labels are the words iOS,
 * Android and Chrome show in Italian (Condividi, Aggiungi alla schermata Home, Consenti…).
 */
export const install: CDict["install"] = {
  hero: {
    eyebrow: "Preparare il dispositivo",
    title: "Dai alla tua lista d'osservazione una strada per arrivare a te.",
    lead: "Scegli qui sotto il tuo dispositivo e segui il suo percorso. ShelfSpring controlla le scorte dal server; questo dispositivo riceve una notifica quando un cambiamento corrispondente è confermato. I tempi di recapito variano.",
    seeSteps: "Vai al percorso di preparazione",
    sendTest: "Manda una notifica di prova",
    turnOn: "Accendi le notifiche",
    already: "**✓ Un dispositivo riceve già.** Le segnalazioni arrivano al tuo {label}; segui il percorso qui sotto solo se vuoi aggiungere anche questo. {link}",
    myAlerts: "La mia lista d'osservazione",
  },
  progress: {
    homeScreen: "Salvata sulla schermata Home",
    signedIn: "Account aperto",
    on: "Notifiche accese",
    blocked: "Le tue impostazioni bloccano le notifiche; il passaggio {n} mostra dove sbloccarle.",
  },
  steps: {
    title: "Segui il percorso del tuo dispositivo",
    intro: {
      ios: "Su iPhone e iPad Apple recapita le notifiche web solo ai siti salvati sulla schermata Home: per questo si comincia da lì.",
      android: "Chrome può recapitare notifiche anche da una scheda normale; aggiungere l'app alla schermata Home è facoltativo.",
      desktop: "Un browser da computer riceve le segnalazioni direttamente, senza installare niente.",
    },
    tabsLabel: "Tipo di dispositivo",
    tabs: { ios: "iPhone o iPad", android: "Telefono Android", desktop: "Mac o PC" },
    ios: {
      safari: { title: "Carica shelfspring.com in Safari", text: "Le immagini seguono Safari. Stai leggendo dentro un'altra app? Apri il sito nel browser prima di proseguire." },
      share: { title: "Individua il pulsante Condividi", text: "Su iPhone sta nella barra lungo il bordo inferiore; su iPad compare in cima alla finestra." },
      choose: { title: "Nel pannello, la voce «Aggiungi alla schermata Home»", text: "Spesso si trova sotto le prime file di azioni: se non la vedi, scorri l'elenco." },
      add: { title: "Conferma con Aggiungi", text: "Il nome proposto, ShelfSpring, può restare così." },
      open: { title: "Avvia la nuova icona ed entra di nuovo", text: "L'app della schermata Home ha una sessione separata da Safari. Usa la solita email e la lista d'osservazione ricompare identica." },
      allow: { title: "Premi «Accendi le notifiche», poi Consenti", text: "Il pulsante sta nella pagina della lista d'osservazione, dentro l'app. iOS mostra la richiesta di permesso una volta sola." },
    },
    android: {
      chrome: { title: "Carica shelfspring.com in Chrome", text: "Edge e Samsung Internet si comportano allo stesso modo; i browser incorporati in altre app non lo supportano." },
      install: { title: "Accetta l'offerta di installazione di Chrome", text: "Basta una conferma. Niente passa da uno store di app." },
      menu: { title: "Usa ⋮, poi «Aggiungi a schermata Home»", text: "Alcune versioni di Chrome chiamano questa voce **Installa app**." },
      open: { title: "Avvia ShelfSpring ed entra", text: "L'icona compare sulla schermata Home o nel cassetto delle app. Entra con la solita email per ritrovare la stessa lista d'osservazione." },
      allow: { title: "Premi «Accendi le notifiche», poi Consenti", text: "Android mostra la richiesta di permesso una volta. Lo stesso pulsante funziona anche da una normale scheda di Chrome." },
    },
    desktop: {
      allow: { title: "Premi «Accendi le notifiche»", text: "Sono supportati Chrome, Edge, Firefox e Safari 16.1+ su macOS Ventura o successivi. Approva la richiesta di permesso che il browser mostra." },
      install: { title: "Facoltativo: ShelfSpring in una finestra tutta sua", text: "Chrome ed Edge mostrano un'icona di installazione apposta. Se le segnalazioni arrivino in background dipende dal browser e dalle impostazioni di sistema." },
      phone: { title: "Aggiungi pure il telefono", text: "Sul telefono usa lo stesso indirizzo email: le segnalazioni arrivano a tutti i dispositivi con le notifiche accese." },
    },
  },
  action: {
    install: "Installa ShelfSpring",
    on: "✓ Questo dispositivo è acceso.",
    sendTest: "Manda una notifica di prova",
    needsInstall: "Questo pulsante funziona dentro l'app della schermata Home, non in Safari.",
    signInFirst: "Entra per proseguire",
    signInThenOn: "Entra per accenderle",
    turnOn: "Accendi le notifiche",
    denied: "Notifiche bloccate. Concedi il permesso a ShelfSpring in Impostazioni e ricarica la pagina.",
  },
  notes: [
    { q: "Su iPhone serve per forza Safari?", a: "Le immagini seguono il menu Condividi di Safari. Da iOS e iPadOS 16.4 anche altri browser supportati possono offrire Aggiungi alla schermata Home. Per accendere le notifiche web apri l'app installata sulla schermata Home." },
    { q: "Il telefono resta a controllare le scorte?", a: "I controlli sulle scorte girano sui nostri server. Il browser o l'app della schermata Home si occupa solo di recapitare e mostrare la notifica." },
    { q: "E se nessun dispositivo è acceso?", a: "Allora ogni segnalazione arriva per email all'indirizzo dell'account. Con un dispositivo acceso la segnalazione va lì, e l'email interviene solo quando nessun dispositivo è raggiungibile." },
    { q: "Possono ricevere più dispositivi?", a: "Sì. Usa lo stesso indirizzo email ovunque entri; ogni dispositivo con le notifiche accese riceve ogni segnalazione." },
  ],
  cta: { title: "Un dispositivo pronto ha bisogno di una lista d'osservazione utile.", button: "Scegli telefoni e negozi di ritiro" },

  mocks: {
    share: "Condividi",
    shareSheet: { copy: "Copia", readingList: "Aggiungi a Elenco lettura", bookmark: "Aggiungi segnalibro", favorites: "Aggiungi a Preferiti", addToHome: "Aggiungi alla schermata Home", markup: "Markup" },
    addDialog: { cancel: "Annulla", title: "Aggiungi alla schermata Home", add: "Aggiungi", note: "Un'icona verrà aggiunta alla schermata Home per consentirti di accedere rapidamente a questo sito web." },
    iosAlert: { title: "“ShelfSpring” vorrebbe inviarti delle notifiche", text: "Le notifiche possono includere avvisi, suoni e badge sulle icone. Puoi configurarle in Impostazioni.", dontAllow: "Non consentire", allow: "Consenti" },
    chromeMenuLabel: "Menu",
    chromeMenu: { before: ["Nuova scheda", "Cronologia", "Download", "Preferiti", "Condividi…"], add: "Aggiungi a schermata Home", after: ["Sito desktop"] },
    androidAlert: { title: "Consentire a ShelfSpring di inviarti notifiche?", dontAllow: "Non consentire", allow: "Consenti" },
    desktopAlert: { wantsTo: "shelfspring.com vuole", show: "Mostrare notifiche", block: "Blocca", allow: "Consenti" },
    desktopInstall: { callout: "Installa", title: "Installa ShelfSpring", text: "Gira in una finestra separata", cancel: "Annulla", install: "Installa" },
    lockScreen: { date: "giovedì 29 ottobre", now: "ora", title: "iPhone 18 Pro 256GB Nero", body: "Apple Via del Corso · Roma — a scaffale per il ritiro. Apri apple.com per ordinarlo." },
  },
};
