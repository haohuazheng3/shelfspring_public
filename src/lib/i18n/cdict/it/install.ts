import type { CDict } from "../en";

/**
 * Italian client strings: install (the /install guide and its drawn phone screens). Mock labels are the words iOS,
 * Android and Chrome show in Italian (Condividi, Aggiungi alla schermata Home, Consenti…).
 */
export const install: CDict["install"] = {
  hero: {
    eyebrow: "Preparazione del dispositivo",
    title: "Dai alla tua selezione un modo per raggiungerti.",
    lead: "Scegli il dispositivo e segui il suo percorso. ShelfSpring controlla la disponibilità sul server; le notifiche seguono i cambiamenti corrispondenti alle tue regole. I tempi di ricezione possono variare.",
    seeSteps: "Vedi i passaggi",
    sendTest: "Invia una prova",
    turnOn: "Attiva le notifiche",
    already: "**Un dispositivo è già configurato: {label}.** Per aggiungere anche questo, segui i passaggi e invia una prova. {link}",
    myAlerts: "I miei avvisi",
  },
  progress: {
    homeScreen: "Nella schermata Home",
    signedIn: "Accesso effettuato",
    on: "Notifiche attive",
    blocked: "Bloccate nelle impostazioni: vedi il passaggio {n}.",
  },
  steps: {
    title: "Il percorso per il tuo dispositivo",
    intro: {
      ios: "Su iPhone e iPad aggiungi prima ShelfSpring alla schermata Home. Apri quell’app per attivare le notifiche.",
      android: "Su Android puoi usare un browser compatibile. Installare crea un accesso dedicato, ma non è indispensabile per le notifiche.",
      desktop: "Sul computer autorizza le notifiche del browser e controlla anche le impostazioni del sistema.",
    },
    tabsLabel: "Il tuo dispositivo",
    tabs: { ios: "iPhone / iPad", android: "Android", desktop: "Computer" },
    ios: {
      safari: { title: "Apri shelfspring.com in Safari", text: "Questa guida mostra Safari. Apri il sito direttamente nel browser per ritrovare i comandi delle illustrazioni." },
      share: { title: "Tocca Condividi", text: "Trova l’icona di condivisione nella barra del browser. La posizione dipende dalla versione e dalla disposizione scelta." },
      choose: { title: "Scegli «Aggiungi alla schermata Home»", text: "Cerca questa azione nel pannello di condivisione, scorrendo l’elenco se necessario." },
      add: { title: "Tocca Aggiungi", text: "Controlla il nome ShelfSpring e conferma l’aggiunta dell’icona alla schermata Home." },
      open: { title: "Aprila dalla schermata Home e accedi", text: "Avvia la nuova icona e accedi con l’e-mail del tuo account. L’app della schermata Home potrebbe richiedere un accesso separato." },
      allow: { title: "Tocca «Attiva le notifiche», poi Consenti", text: "Usa il pulsante qui o nel tuo account, poi accetta la richiesta del sistema. Invia quindi una prova da questo dispositivo." },
    },
    android: {
      chrome: { title: "Apri shelfspring.com in Chrome", text: "Le illustrazioni seguono Chrome. Se il link è dentro un’altra app, aprilo nel browser completo." },
      install: { title: "Installa l'app", text: "Se il browser propone l’installazione, conferma la finestra. Non serve scaricare nulla da uno store di app." },
      menu: { title: "Menu ⋮ → «Aggiungi a schermata Home»", text: "La voce può chiamarsi **Installa app**. Se manca, puoi continuare nella scheda del browser." },
      open: { title: "Apri ShelfSpring e accedi", text: "Apri l’icona o torna alla scheda, poi usa l’e-mail del tuo account per ritrovare la selezione." },
      allow: { title: "Tocca «Attiva le notifiche», poi Consenti", text: "Consenti le notifiche quando il browser lo chiede. Se la prova non arriva, verifica anche permessi e restrizioni della batteria di Android." },
    },
    desktop: {
      allow: { title: "Fai clic su «Attiva le notifiche»", text: "Autorizza ShelfSpring in un browser compatibile e invia una prova. Modalità di concentrazione e impostazioni del sistema possono nascondere l’avviso." },
      install: { title: "Facoltativo: una finestra dedicata a ShelfSpring", text: "Chrome ed Edge possono mostrare un’icona di installazione. La ricezione in background dipende comunque dal browser e dal sistema operativo." },
      phone: { title: "Anche sul telefono", text: "Accedi sul telefono con la stessa e-mail. Attiva e prova le notifiche separatamente su ogni dispositivo." },
    },
  },
  action: {
    install: "Installa ShelfSpring",
    on: "✓ Le notifiche sono attive su questo dispositivo.",
    sendTest: "Invia una prova",
    needsInstall: "Disponibile quando apri l'app dalla schermata Home.",
    signInFirst: "Prima accedi",
    signInThenOn: "Accedi, poi attivale",
    turnOn: "Attiva le notifiche",
    denied: "Bloccate. Consenti ShelfSpring in Impostazioni, poi ricarica.",
  },
  notes: [{"q":"Perché la guida per iPhone mostra Safari?","a":"Le illustrazioni seguono i suoi menu. Anche altri browser possono offrire l’aggiunta alla schermata Home, con comandi differenti."},{"q":"Il telefono controlla continuamente la disponibilità?","a":"I controlli avvengono sui nostri server. Il browser o l’app della schermata Home gestisce ricezione e visualizzazione delle notifiche."},{"q":"Se il push non è disponibile?","a":"L’e-mail è il canale alternativo. Controlla anche la cartella spam; la consegna può richiedere tempo."},{"q":"Come preparo più dispositivi?","a":"Usa lo stesso account su ciascuno, autorizza le notifiche separatamente e invia una prova da ogni dispositivo."}],
  cta: { title: "Un dispositivo pronto merita una selezione utile.", button: "Scegliere iPhone e negozi per il ritiro" },

  mocks: {
    share: "Condividi",
    shareSheet: { copy: "Copia", readingList: "Aggiungi a Elenco lettura", bookmark: "Aggiungi segnalibro", favorites: "Aggiungi a Preferiti", addToHome: "Aggiungi alla schermata Home", markup: "Markup" },
    addDialog: { cancel: "Annulla", title: "Aggiungi alla schermata Home", add: "Aggiungi", note: "Un'icona verrà aggiunta alla schermata Home per consentirti di accedere rapidamente a questo sito web." },
    iosAlert: { title: "“ShelfSpring” vorrebbe inviarti delle notifiche", text: "Le notifiche possono includere avvisi, suoni e badge sulle icone. Puoi configurarle in Impostazioni.", dontAllow: "Non consentire", allow: "Consenti" },
    chromeMenuLabel: "Menu",
    chromeMenu: { before: ["Nuova scheda", "Cronologia", "Download", "Preferiti", "Condividi…"], add: "Aggiungi a schermata Home", after: ["Sito desktop"] },
    androidAlert: { title: "Consentire a ShelfSpring di inviarti notifiche?", dontAllow: "Non consentire", allow: "Consenti" },
    desktopAlert: { wantsTo: "shelfspring.com vuole", show: "Mostrare notifiche", block: "Blocca", allow: "Consenti" },
    desktopInstall: { callout: "Installa", title: "Installa ShelfSpring", text: "Si apre in una finestra dedicata", cancel: "Annulla", install: "Installa" },
    lockScreen: { date: "giovedì 29 ottobre", now: "ora", title: "iPhone 18 Pro 256GB Nero", body: "Apple Via del Corso · Roma — Disponibile oggi. Tocca per prenotarlo su apple.com." },
  },
};
