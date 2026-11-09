/**
 * Chaînes client françaises : install (le guide /install et ses écrans dessinés). Les libellés des maquettes reprennent
 * ceux d’iOS, d’Android et de Chrome en français (« Partager », « Sur l’écran d’accueil », « Autoriser »).
 */
import type { CDict } from "../en";

export const install: CDict["install"] = {
  hero: {
    eyebrow: "Préparation de l’appareil",
    title: "Donnez à votre sélection un moyen de vous joindre.",
    lead: "Choisissez votre appareil et suivez son parcours. ShelfSpring surveille le stock sur le serveur ; les notifications suivent les changements correspondant à vos règles. Le délai de réception varie.",
    seeSteps: "Aller au parcours d’installation",
    sendTest: "Envoyer une alerte de test",
    turnOn: "Activer les notifications push",
    already: "**✓ Un appareil reçoit déjà.** Les alertes arrivent sur votre {label} ; suivez le parcours ci-dessous seulement pour ajouter aussi celui-ci. {link}",
    myAlerts: "Ma liste de veille",
  },
  progress: {
    homeScreen: "Enregistrée sur l’écran d’accueil",
    signedIn: "Compte ouvert",
    on: "Notifications en marche",
    blocked: "Vos réglages bloquent les notifications ; l’étape {n} indique où changer cela.",
  },
  steps: {
    title: "Le parcours adapté à votre appareil",
    intro: {
      ios: "Sur iPhone et iPad, Apple ne livre les notifications web qu’aux sites enregistrés sur l’écran d’accueil : c’est donc la première étape.",
      android: "Chrome sait envoyer des notifications depuis un simple onglet ; ajouter l’app à l’écran d’accueil reste facultatif.",
      desktop: "Un navigateur d’ordinateur reçoit les alertes directement, sans rien installer.",
    },
    tabsLabel: "Type d’appareil",
    tabs: { ios: "iPhone ou iPad", android: "Téléphone Android", desktop: "Mac ou PC" },
    ios: {
      safari: { title: "Chargez shelfspring.com dans Safari", text: "Les images suivent Safari. Vous lisez ceci dans une autre app ? Ouvrez d’abord le site dans votre navigateur." },
      share: { title: "Repérez le bouton Partager", text: "Sur iPhone, il se trouve dans la barre d’outils du bas ; sur iPad, en haut de la fenêtre." },
      choose: { title: "Dans la feuille, prenez « Sur l’écran d’accueil »", text: "L’option se cache souvent sous les premières rangées d’actions : faites défiler la liste si elle n’apparaît pas." },
      add: { title: "Validez avec Ajouter", text: "Le nom proposé, ShelfSpring, peut rester tel quel." },
      open: { title: "Lancez la nouvelle icône et reconnectez-vous", text: "L’app de l’écran d’accueil garde une session séparée de Safari. Avec votre e-mail habituel, votre liste de veille réapparaît à l’identique." },
      allow: { title: "Appuyez sur « Activer les notifications push », puis sur Autoriser", text: "Le bouton se trouve sur la page de votre liste de veille, dans l’app. iOS n’affiche sa demande d’autorisation qu’une seule fois." },
    },
    android: {
      chrome: { title: "Chargez shelfspring.com dans Chrome", text: "Edge et Samsung Internet se comportent de la même façon ; les navigateurs intégrés à d’autres apps ne le permettent pas." },
      install: { title: "Acceptez la proposition d’installation de Chrome", text: "Une seule confirmation. Rien ne passe par une boutique d’applications." },
      menu: { title: "Passez par ⋮, puis « Ajouter à l’écran d’accueil »", text: "Selon la version de Chrome, l’entrée s’appelle **Installer l’application**." },
      open: { title: "Lancez ShelfSpring et connectez-vous", text: "L’icône apparaît sur l’écran d’accueil ou dans le tiroir d’applications. Connectez-vous avec votre e-mail habituel pour retrouver la même liste de veille." },
      allow: { title: "Appuyez sur « Activer les notifications push », puis sur Autoriser", text: "Android n’affiche sa demande qu’une fois. Le même bouton marche aussi depuis un onglet Chrome ordinaire." },
    },
    desktop: {
      allow: { title: "Cliquez sur « Activer les notifications push »", text: "Chrome, Edge, Firefox et Safari 16.1+ sous macOS Ventura ou plus récent sont pris en charge. Acceptez la demande d’autorisation affichée par le navigateur." },
      install: { title: "Facultatif : ShelfSpring dans sa propre fenêtre", text: "Chrome et Edge affichent une icône d’installation pour cela. La réception en arrière-plan dépend du navigateur et des réglages de votre système." },
      phone: { title: "Ajoutez aussi votre téléphone", text: "Utilisez la même adresse e-mail sur le téléphone. Toutes les alertes partent vers tous les appareils où les notifications sont en marche." },
    },
  },
  action: {
    install: "Installer ShelfSpring",
    on: "✓ Cet appareil est activé.",
    sendTest: "Envoyer une alerte de test",
    needsInstall: "Ce bouton fonctionne dans l’app de l’écran d’accueil, pas dans Safari.",
    signInFirst: "Se connecter pour continuer",
    signInThenOn: "Se connecter pour activer",
    turnOn: "Activer les notifications push",
    denied: "Notifications bloquées. Autorisez ShelfSpring dans Réglages, puis rechargez la page.",
  },
  notes: [
    { q: "Safari est-il la seule option sur iPhone ?", a: "Les images suivent le menu Partager de Safari. Depuis iOS et iPadOS 16.4, d’autres navigateurs compatibles peuvent aussi proposer « Sur l’écran d’accueil ». C’est en ouvrant l’app installée que l’on active les notifications web." },
    { q: "Mon téléphone doit-il surveiller les rayons lui-même ?", a: "Non : les contrôles des rayons tournent sur nos serveurs. Le navigateur ou l’app de l’écran d’accueil se charge seulement de recevoir et d’afficher les notifications." },
    { q: "Et sans aucun appareil activé ?", a: "Chaque alerte vous est alors envoyée par e-mail, à l’adresse du compte. Dès qu’un appareil est activé, les alertes y sont poussées, et l’e-mail ne prend le relais que si aucun appareil n’est joignable." },
    { q: "Plusieurs appareils peuvent-ils recevoir les alertes ?", a: "Oui. Gardez une seule adresse e-mail partout où vous vous connectez ; tout appareil aux notifications activées reçoit toutes les alertes." },
  ],
  cta: { title: "Un appareil prêt mérite une liste de veille utile.", button: "Choisir les iPhone et les magasins de retrait" },

  mocks: {
    share: "Partager",
    shareSheet: { copy: "Copier", readingList: "Ajouter à la liste de lecture", bookmark: "Ajouter un signet", favorites: "Ajouter aux favoris", addToHome: "Sur l’écran d’accueil", markup: "Annotation" },
    addDialog: { cancel: "Annuler", title: "Ajouter à l’écran d’accueil", add: "Ajouter", note: "Une icône sera ajoutée à votre écran d’accueil pour vous permettre d’accéder rapidement à ce site web." },
    iosAlert: { title: "« ShelfSpring » souhaite vous envoyer des notifications", text: "Les notifications peuvent inclure des alertes, des sons et des pastilles d’icônes. Vous pouvez les configurer dans Réglages.", dontAllow: "Refuser", allow: "Autoriser" },
    chromeMenuLabel: "Menu",
    chromeMenu: { before: ["Nouvel onglet", "Historique", "Téléchargements", "Favoris", "Partager…"], add: "Ajouter à l’écran d’accueil", after: ["Version pour ordinateur"] },
    androidAlert: { title: "Autoriser ShelfSpring à vous envoyer des notifications ?", dontAllow: "Ne pas autoriser", allow: "Autoriser" },
    desktopAlert: { wantsTo: "shelfspring.com souhaite", show: "Afficher des notifications", block: "Bloquer", allow: "Autoriser" },
    desktopInstall: { callout: "Installer", title: "Installer ShelfSpring ?", text: "Fonctionne dans une fenêtre à part", cancel: "Annuler", install: "Installer" },
    lockScreen: { date: "jeudi 29 octobre", now: "maintenant", title: "iPhone 18 Pro 256GB Noir", body: "Apple Champs-Élysées · Paris — en rayon pour le retrait. Ouvrez apple.com pour commander." },
  },
};
