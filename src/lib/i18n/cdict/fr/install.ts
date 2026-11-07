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
    seeSteps: "Voir les étapes",
    sendTest: "Envoyer un test",
    turnOn: "Activer les notifications",
    already: "**Un appareil est déjà configuré : {label}.** Pour utiliser aussi celui-ci, suivez les étapes ci-dessous et envoyez un test. {link}",
    myAlerts: "Mes alertes",
  },
  progress: {
    homeScreen: "Sur l’écran d’accueil",
    signedIn: "Connecté",
    on: "Notifications activées",
    blocked: "Bloquées dans les réglages : voir l’étape {n}.",
  },
  steps: {
    title: "Le parcours adapté à votre appareil",
    intro: {
      ios: "Sur iPhone et iPad, commencez par ajouter ShelfSpring à l’écran d’accueil, puis ouvrez cette app pour activer les notifications.",
      android: "Sur Android, vous pouvez utiliser un navigateur compatible. L’installation ajoute un raccourci, mais n’est pas indispensable aux notifications.",
      desktop: "Sur ordinateur, autorisez les notifications dans le navigateur et vérifiez aussi les réglages du système.",
    },
    tabsLabel: "Votre appareil",
    tabs: { ios: "iPhone / iPad", android: "Android", desktop: "Ordinateur" },
    ios: {
      safari: { title: "Ouvrez shelfspring.com dans Safari", text: "Ce guide utilise Safari. Ouvrez directement le site dans le navigateur pour retrouver les commandes illustrées." },
      share: { title: "Touchez Partager", text: "Repérez l’icône de partage dans la barre du navigateur ; sa position dépend de la version et de la disposition choisie." },
      choose: { title: "Choisissez « Sur l’écran d’accueil »", text: "Cherchez cette commande dans la feuille de partage. Faites défiler les actions si nécessaire." },
      add: { title: "Touchez Ajouter", text: "Vérifiez le nom ShelfSpring et confirmez l’ajout de l’icône à l’écran d’accueil." },
      open: { title: "Ouvrez-la depuis l’écran d’accueil et connectez-vous", text: "Lancez la nouvelle icône et connectez-vous avec l’e-mail de votre compte. Une connexion distincte peut être nécessaire dans l’app." },
      allow: { title: "Touchez « Activer les notifications », puis Autoriser", text: "Utilisez le bouton de cette page ou de votre compte, puis acceptez la demande du système. Envoyez ensuite un test depuis cet appareil." },
    },
    android: {
      chrome: { title: "Ouvrez shelfspring.com dans Chrome", text: "Utilisez Chrome pour suivre ces illustrations. Si vous êtes dans une autre app, ouvrez le lien dans le navigateur complet." },
      install: { title: "Installez l’app", text: "Si le navigateur propose l’installation, confirmez sa fenêtre. Aucun téléchargement depuis un magasin d’apps n’est nécessaire." },
      menu: { title: "Menu ⋮ → « Ajouter à l’écran d’accueil »", text: "La commande peut s’appeler **Installer l’application**. Sans cette option, vous pouvez continuer dans l’onglet du navigateur." },
      open: { title: "Ouvrez ShelfSpring et connectez-vous", text: "Ouvrez l’icône ou revenez dans l’onglet, puis utilisez l’e-mail de votre compte pour retrouver votre sélection." },
      allow: { title: "Touchez « Activer les notifications », puis Autoriser", text: "Autorisez le site lorsque le navigateur le demande. Si le test n’arrive pas, vérifiez aussi les notifications et les restrictions de batterie d’Android." },
    },
    desktop: {
      allow: { title: "Cliquez sur « Activer les notifications »", text: "Dans un navigateur compatible, autorisez ShelfSpring puis envoyez un test. Le mode de concentration et les réglages système peuvent masquer la notification." },
      install: { title: "Facultatif : une fenêtre dédiée à ShelfSpring", text: "Chrome et Edge peuvent proposer une icône d’installation. La réception en arrière-plan dépend du navigateur et du système, même avec l’app installée." },
      phone: { title: "Votre téléphone aussi", text: "Connectez-vous sur le téléphone avec le même e-mail, activez ses notifications séparément et testez-le aussi." },
    },
  },
  action: {
    install: "Installer ShelfSpring",
    on: "✓ Les notifications sont activées sur cet appareil.",
    sendTest: "Envoyer un test",
    needsInstall: "Disponible une fois l’app de l’écran d’accueil ouverte.",
    signInFirst: "Connectez-vous d’abord",
    signInThenOn: "Se connecter, puis activer",
    turnOn: "Activer les notifications",
    denied: "Bloquées. Autorisez ShelfSpring dans Réglages, puis rechargez.",
  },
  notes: [{"q":"Pourquoi montrer Safari sur iPhone ?","a":"Les illustrations suivent le parcours de Safari. D’autres navigateurs peuvent aussi proposer l’ajout à l’écran d’accueil ; leurs menus peuvent différer."},{"q":"Mon téléphone vérifie-t-il le stock en continu ?","a":"Les vérifications tournent sur nos serveurs. Le navigateur ou l’app de l’écran d’accueil gère la réception et l’affichage des notifications."},{"q":"Et si le push n’est pas disponible ?","a":"L’e-mail sert de canal de secours. Vérifiez aussi le dossier indésirable ; son acheminement peut prendre du temps."},{"q":"Comment préparer plusieurs appareils ?","a":"Utilisez le même compte sur chacun, autorisez les notifications séparément et envoyez un test depuis chaque appareil."}],
  cta: { title: "Un appareil prêt, une sélection qui vous correspond.", button: "Choisir les iPhone et les magasins" },

  mocks: {
    share: "Partager",
    shareSheet: { copy: "Copier", readingList: "Ajouter à la liste de lecture", bookmark: "Ajouter un signet", favorites: "Ajouter aux favoris", addToHome: "Sur l’écran d’accueil", markup: "Annotation" },
    addDialog: { cancel: "Annuler", title: "Ajouter à l’écran d’accueil", add: "Ajouter", note: "Une icône sera ajoutée à votre écran d’accueil pour vous permettre d’accéder rapidement à ce site web." },
    iosAlert: { title: "« ShelfSpring » souhaite vous envoyer des notifications", text: "Les notifications peuvent inclure des alertes, des sons et des pastilles d’icônes. Vous pouvez les configurer dans Réglages.", dontAllow: "Refuser", allow: "Autoriser" },
    chromeMenuLabel: "Menu",
    chromeMenu: { before: ["Nouvel onglet", "Historique", "Téléchargements", "Favoris", "Partager…"], add: "Ajouter à l’écran d’accueil", after: ["Version pour ordinateur"] },
    androidAlert: { title: "Autoriser ShelfSpring à vous envoyer des notifications ?", dontAllow: "Ne pas autoriser", allow: "Autoriser" },
    desktopAlert: { wantsTo: "shelfspring.com souhaite", show: "Afficher des notifications", block: "Bloquer", allow: "Autoriser" },
    desktopInstall: { callout: "Installer", title: "Installer ShelfSpring ?", text: "S’ouvre dans sa propre fenêtre", cancel: "Annuler", install: "Installer" },
    lockScreen: { date: "jeudi 29 octobre", now: "maintenant", title: "iPhone 18 Pro 256GB Noir", body: "Apple Champs-Élysées · Paris — Disponible aujourd’hui. Touchez pour réserver sur apple.com." },
  },
};
