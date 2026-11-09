/**
 * German client strings: install (the /install guide and its phone illustrations). The mock labels use the words
 * iOS, Android and Chrome show in German (iOS: „Teilen“, „Zum Home-Bildschirm“, „Erlauben“; Android: „Zulassen“).
 * ShelfSpring's own button is „Benachrichtigungen aktivieren“ (same label as on the dashboard card).
 */
import type { CDict } from "../en";

export const install: CDict["install"] = {
  hero: {
    eyebrow: "Gerät vorbereiten",
    title: "Damit deine Merkliste dich erreichen kann.",
    lead: "Wähle dein Gerät und folge dem passenden Weg. ShelfSpring beobachtet die Regale auf dem Server; Benachrichtigungen folgen auf Änderungen, die zu deiner Merkliste passen. Die Zustelldauer kann schwanken.",
    seeSteps: "Zum passenden Einrichtungsweg",
    sendTest: "Test-Benachrichtigung senden",
    turnOn: "Benachrichtigungen aktivieren",
    already: "**✓ Ein Gerät empfängt bereits.** Schon eingerichtet: {label}. Den Weg unten brauchst du nur, um dieses Gerät dazuzunehmen. {link}",
    myAlerts: "Meine Merkliste",
  },
  progress: {
    homeScreen: "Auf dem Home-Bildschirm abgelegt",
    signedIn: "Konto geöffnet",
    on: "Benachrichtigungen aktiv",
    blocked: "Deine Einstellungen blockieren Benachrichtigungen; Schritt {n} zeigt, wo sich das ändern lässt.",
  },
  steps: {
    title: "Der passende Weg für dein Gerät",
    intro: {
      ios: "Apple stellt Web-Benachrichtigungen auf iPhone und iPad nur Websites auf dem Home-Bildschirm zu – dieser Schritt kommt deshalb zuerst.",
      android: "Chrome kann Benachrichtigungen aus einem normalen Tab zustellen; die App auf dem Startbildschirm ist optional.",
      desktop: "Ein Desktop-Browser empfängt Benachrichtigungen direkt, ganz ohne Installation.",
    },
    tabsLabel: "Gerätetyp",
    tabs: { ios: "iPhone oder iPad", android: "Android-Smartphone", desktop: "Mac oder PC" },
    ios: {
      safari: { title: "shelfspring.com in Safari laden", text: "Die Bilder folgen Safari. Liest du das gerade in einer anderen App? Öffne die Website zuerst im Browser." },
      share: { title: "Die Taste „Teilen“ finden", text: "Auf dem iPhone sitzt sie in der Leiste unten, auf dem iPad oben im Fenster." },
      choose: { title: "„Zum Home-Bildschirm“ im Menü auswählen", text: "Der Eintrag steht oft unter den ersten Aktionsreihen; scroll durch die Liste, falls er fehlt." },
      add: { title: "Mit „Hinzufügen“ bestätigen", text: "Der vorgeschlagene Name ShelfSpring kann so bleiben." },
      open: { title: "Das neue Symbol starten und erneut anmelden", text: "Die Home-Bildschirm-App führt eine eigene Sitzung, getrennt von Safari. Mit deiner gewohnten E-Mail erscheint die Merkliste unverändert." },
      allow: { title: "„Benachrichtigungen aktivieren“ antippen, dann „Erlauben“", text: "Die Taste findest du in der App auf deiner Merkliste. iOS zeigt die Abfrage nur ein einziges Mal." },
    },
    android: {
      chrome: { title: "shelfspring.com in Chrome laden", text: "Edge und Samsung Internet verhalten sich genauso; in andere Apps eingebaute Browser unterstützen das nicht." },
      install: { title: "Das Installationsangebot von Chrome annehmen", text: "Eine einzige Bestätigung. Nichts davon kommt aus einem App-Store." },
      menu: { title: "⋮ antippen, dann „Zum Startbildschirm hinzufügen“", text: "Manche Chrome-Versionen nennen den Eintrag **App installieren**." },
      open: { title: "ShelfSpring starten und anmelden", text: "Das Symbol liegt auf dem Startbildschirm oder in der App-Übersicht. Mit deiner gewohnten E-Mail siehst du dieselbe Merkliste." },
      allow: { title: "„Benachrichtigungen aktivieren“ antippen, dann „Zulassen“", text: "Android zeigt die Abfrage einmal. Dieselbe Taste funktioniert auch in einem gewöhnlichen Chrome-Tab." },
    },
    desktop: {
      allow: { title: "„Benachrichtigungen aktivieren“ anklicken", text: "Unterstützt werden Chrome, Edge, Firefox und Safari 16.1+ ab macOS Ventura. Bestätige die Abfrage, die dein Browser zeigt." },
      install: { title: "Optional: ShelfSpring in einem eigenen Fenster", text: "Chrome und Edge zeigen dafür ein Installationssymbol. Ob Benachrichtigungen im Hintergrund ankommen, hängt von Browser und Systemeinstellungen ab." },
      phone: { title: "Das Smartphone dazunehmen", text: "Melde dich dort mit derselben E-Mail-Adresse an. Jedes Gerät mit aktiven Benachrichtigungen empfängt jede Benachrichtigung." },
    },
  },
  action: {
    install: "ShelfSpring als App hinzufügen",
    on: "✓ Dieses Gerät ist aktiv.",
    sendTest: "Test-Benachrichtigung senden",
    needsInstall: "Diese Taste funktioniert in der Home-Bildschirm-App, nicht in Safari.",
    signInFirst: "Zum Fortfahren anmelden",
    signInThenOn: "Anmelden und aktivieren",
    turnOn: "Benachrichtigungen aktivieren",
    denied: "Benachrichtigungen sind blockiert. Erlaube ShelfSpring in den Einstellungen und lade die Seite neu.",
  },
  notes: [
    { q: "Geht auf dem iPhone nur Safari?", a: "Die Bilder folgen dem Teilen-Menü von Safari. Ab iOS und iPadOS 16.4 können auch andere unterstützte Browser „Zum Home-Bildschirm“ anbieten. Web-Benachrichtigungen aktivierst du danach in der installierten App." },
    { q: "Beobachtet mein Smartphone selbst die Regale?", a: "Nein, das übernehmen unsere Server. Browser oder Home-Bildschirm-App empfangen und zeigen nur die Benachrichtigungen." },
    { q: "Was passiert ganz ohne aktives Gerät?", a: "Dann geht jede Benachrichtigung an die E-Mail-Adresse deines Kontos. Ist ein Gerät aktiv, wird dorthin gepusht; die E-Mail springt nur ein, wenn kein Gerät erreichbar ist." },
    { q: "Können mehrere Geräte Benachrichtigungen empfangen?", a: "Ja. Melde dich überall mit derselben E-Mail-Adresse an; jedes Gerät mit aktiven Benachrichtigungen empfängt jede Benachrichtigung." },
  ],
  cta: { title: "Ein vorbereitetes Gerät braucht eine passende Auswahl.", button: "Varianten und Abholstores festlegen" },

  mocks: {
    share: "Teilen",
    shareSheet: { copy: "Kopieren", readingList: "Zur Leseliste hinzufügen", bookmark: "Lesezeichen hinzufügen", favorites: "Zu Favoriten hinzufügen", addToHome: "Zum Home-Bildschirm", markup: "Markierungen" },
    addDialog: { cancel: "Abbrechen", title: "Zum Home-Bildschirm", add: "Hinzufügen", note: "Ein Symbol wird zu deinem Home-Bildschirm hinzugefügt, damit du schnell auf diese Website zugreifen kannst." },
    iosAlert: { title: "„ShelfSpring“ möchte dir Mitteilungen senden", text: "Mitteilungen können Hinweise, Töne und Kennzeichensymbole enthalten. Diese können in „Einstellungen“ konfiguriert werden.", dontAllow: "Nicht erlauben", allow: "Erlauben" },
    chromeMenuLabel: "Menü",
    chromeMenu: { before: ["Neuer Tab", "Verlauf", "Downloads", "Lesezeichen", "Teilen…"], add: "Zum Startbildschirm hinzufügen", after: ["Desktopversion"] },
    androidAlert: { title: "ShelfSpring erlauben, dir Benachrichtigungen zu senden?", dontAllow: "Nicht zulassen", allow: "Zulassen" },
    desktopAlert: { wantsTo: "shelfspring.com möchte", show: "Benachrichtigungen anzeigen", block: "Blockieren", allow: "Zulassen" },
    desktopInstall: { callout: "Installieren", title: "App installieren?", text: "Läuft in einem separaten Fenster", cancel: "Abbrechen", install: "Installieren" },
    lockScreen: { date: "Donnerstag, 29. Oktober", now: "jetzt", title: "iPhone 18 Pro 256GB Schwarz", body: "Apple Kurfürstendamm · Berlin – zur Abholung im Regal. Auf apple.com bestellen." },
  },
};
