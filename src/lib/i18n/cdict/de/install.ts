/**
 * German client strings: install (the /install guide and its phone illustrations). The mock labels use the words
 * iOS, Android and Chrome show in German (iOS: „Teilen“, „Zum Home-Bildschirm“, „Erlauben“; Android: „Zulassen“).
 */
import type { CDict } from "../en";

export const install: CDict["install"] = {
  hero: {
    eyebrow: "Gerät vorbereiten",
    title: "Damit Ihre Merkliste Sie erreichen kann.",
    lead: "Wählen Sie Ihr Gerät und folgen Sie den passenden Schritten. ShelfSpring prüft Bestände auf dem Server; Mitteilungen folgen auf Änderungen, die Ihren Regeln entsprechen. Die Zustellzeit kann variieren.",
    seeSteps: "Zu den Schritten",
    sendTest: "Test senden",
    turnOn: "Mitteilungen einschalten",
    already: "**Ein Gerät ist bereits eingerichtet: {label}.** Richten Sie bei Bedarf auch dieses Gerät ein und senden Sie einen Test. {link}",
    myAlerts: "Meine Alarme",
  },
  progress: {
    homeScreen: "Auf dem Home-Bildschirm",
    signedIn: "Angemeldet",
    on: "Mitteilungen an",
    blocked: "In den Einstellungen blockiert – siehe Schritt {n}.",
  },
  steps: {
    title: "Der passende Weg für Ihr Gerät",
    intro: {
      ios: "Fügen Sie ShelfSpring auf iPhone und iPad zuerst zum Home-Bildschirm hinzu. Öffnen Sie diese App, um Mitteilungen zu aktivieren.",
      android: "Auf Android genügt ein unterstützter Browser. Eine Installation bietet einen eigenen Einstieg, ist für Mitteilungen aber nicht zwingend nötig.",
      desktop: "Erlauben Sie Mitteilungen im Browser und prüfen Sie zusätzlich die Einstellungen Ihres Computers.",
    },
    tabsLabel: "Ihr Gerät",
    tabs: { ios: "iPhone / iPad", android: "Android", desktop: "Computer" },
    ios: {
      safari: { title: "shelfspring.com in Safari öffnen", text: "Diese Anleitung zeigt Safari. Öffnen Sie die Website direkt im Browser, damit die abgebildeten Bedienelemente verfügbar sind." },
      share: { title: "Auf „Teilen“ tippen", text: "Suchen Sie das Teilen-Symbol in der Browserleiste. Die Position hängt von Version und gewähltem Layout ab." },
      choose: { title: "„Zum Home-Bildschirm“ wählen", text: "Suchen Sie die Aktion im Teilen-Menü und scrollen Sie bei Bedarf durch die verfügbaren Einträge." },
      add: { title: "Auf „Hinzufügen“ tippen", text: "Prüfen Sie den Namen ShelfSpring und bestätigen Sie das neue Symbol auf dem Home-Bildschirm." },
      open: { title: "Vom Home-Bildschirm öffnen und anmelden", text: "Starten Sie das neue Symbol mit der E-Mail-Adresse Ihres Kontos. Die Home-Bildschirm-App kann eine eigene Anmeldung benötigen." },
      allow: { title: "Auf „Mitteilungen einschalten“ tippen, dann „Erlauben“", text: "Nutzen Sie den Schalter hier oder in Ihrem Konto und bestätigen Sie die Systemabfrage. Senden Sie danach von diesem Gerät einen Test." },
    },
    android: {
      chrome: { title: "shelfspring.com in Chrome öffnen", text: "Die Abbildungen zeigen Chrome. Öffnen Sie einen Link aus einer anderen App im vollständigen Browser." },
      install: { title: "App installieren", text: "Wenn der Browser die Installation anbietet, bestätigen Sie den Dialog. Dafür ist kein Download aus einem App-Store nötig." },
      menu: { title: "Menü ⋮ → „Zum Startbildschirm hinzufügen“", text: "Der Eintrag kann **App installieren** heißen. Fehlt er, können Sie im Browser-Tab fortfahren." },
      open: { title: "ShelfSpring öffnen und anmelden", text: "Öffnen Sie das Symbol oder den Browser-Tab. Mit derselben Konto-E-Mail finden Sie Ihre gespeicherte Auswahl wieder." },
      allow: { title: "Auf „Mitteilungen einschalten“ tippen, dann „Zulassen“", text: "Erlauben Sie die Mitteilungen des Browsers. Kommt der Test nicht an, prüfen Sie auch Android-Mitteilungen und Akku-Beschränkungen." },
    },
    desktop: {
      allow: { title: "Auf „Mitteilungen einschalten“ klicken", text: "Erlauben Sie ShelfSpring in einem unterstützten Browser und senden Sie einen Test. Fokusmodus und Systemeinstellungen können die Anzeige unterdrücken." },
      install: { title: "Optional: ein eigenes Fenster für ShelfSpring", text: "Chrome und Edge können ein Installationssymbol anbieten. Die Zustellung im Hintergrund hängt weiterhin vom Browser und Betriebssystem ab." },
      phone: { title: "Auch Ihr Handy", text: "Melden Sie sich auf dem Handy mit derselben E-Mail an. Aktivieren und testen Sie Mitteilungen auf jedem Gerät einzeln." },
    },
  },
  action: {
    install: "ShelfSpring installieren",
    on: "✓ Mitteilungen sind auf diesem Gerät an.",
    sendTest: "Test senden",
    needsInstall: "Verfügbar, sobald Sie die Home-Bildschirm-App öffnen.",
    signInFirst: "Erst anmelden",
    signInThenOn: "Anmelden, dann einschalten",
    turnOn: "Mitteilungen einschalten",
    denied: "Blockiert. Erlauben Sie ShelfSpring in den Einstellungen und laden Sie neu.",
  },
  notes: [{"q":"Warum zeigt die iPhone-Anleitung Safari?","a":"Die Bilder folgen dem Safari-Menü. Andere Browser können ebenfalls das Hinzufügen zum Home-Bildschirm anbieten; ihre Menüs können anders aussehen."},{"q":"Prüft mein Handy laufend den Bestand?","a":"Unsere Server führen die Bestandsprüfung aus. Browser oder Home-Bildschirm-App übernehmen Empfang und Anzeige der Mitteilungen."},{"q":"Was passiert ohne verfügbaren Push-Kanal?","a":"E-Mail dient als Ersatzkanal. Prüfen Sie auch den Spam-Ordner; der Versandweg kann zusätzliche Zeit benötigen."},{"q":"Wie richte ich mehrere Geräte ein?","a":"Verwenden Sie überall dasselbe Konto, erlauben Sie Mitteilungen auf jedem Gerät und senden Sie jeweils einen Test."}],
  cta: { title: "Ein vorbereitetes Gerät braucht eine passende Auswahl.", button: "iPhones und Abholstores wählen" },

  mocks: {
    share: "Teilen",
    shareSheet: { copy: "Kopieren", readingList: "Zur Leseliste hinzufügen", bookmark: "Lesezeichen hinzufügen", favorites: "Zu Favoriten hinzufügen", addToHome: "Zum Home-Bildschirm", markup: "Markierungen" },
    addDialog: { cancel: "Abbrechen", title: "Zum Home-Bildschirm", add: "Hinzufügen", note: "Ein Symbol wird zu deinem Home-Bildschirm hinzugefügt, damit du schnell auf diese Website zugreifen kannst." },
    iosAlert: { title: "„ShelfSpring“ möchte dir Mitteilungen senden", text: "Mitteilungen können Hinweise, Töne und Kennzeichensymbole enthalten. Diese können in „Einstellungen“ konfiguriert werden.", dontAllow: "Nicht erlauben", allow: "Erlauben" },
    chromeMenuLabel: "Menü",
    chromeMenu: { before: ["Neuer Tab", "Verlauf", "Downloads", "Lesezeichen", "Teilen…"], add: "Zum Startbildschirm hinzufügen", after: ["Desktopversion"] },
    androidAlert: { title: "ShelfSpring erlauben, dir Benachrichtigungen zu senden?", dontAllow: "Nicht zulassen", allow: "Zulassen" },
    desktopAlert: { wantsTo: "shelfspring.com möchte", show: "Benachrichtigungen anzeigen", block: "Blockieren", allow: "Zulassen" },
    desktopInstall: { callout: "Installieren", title: "App installieren?", text: "Öffnet sich in einem eigenen Fenster", cancel: "Abbrechen", install: "Installieren" },
    lockScreen: { date: "Donnerstag, 29. Oktober", now: "jetzt", title: "iPhone 18 Pro 256GB Schwarz", body: "Apple Kurfürstendamm · Berlin – Heute verfügbar. Tippen, um auf apple.com zu reservieren." },
  },
};
