/**
 * German strings: account (dashboard page, its restock modules, install / checkout / pricing pages). Plan names
 * and dollar amounts are not translated (billing is in USD everywhere).
 */
import type { Dict } from "../en";
import { n, plural } from "./util";

const stores = (k: number) => plural(k, "Store", "Stores");

export const account: Dict["account"] = {
  loading: "Lädt…",
  meta: { title: "Meine Merkliste" },
  signedInAs: (email: string) => `Konto · ${email}`,
  title: "Meine Merkliste, an einem Ort.",
  units: { s: "Sek.", min: "Min.", taps: "Taps" },

  plan: {
    title: "Mitgliedschaft & Abrechnung",
    none: "Kein aktiver Tarif · Einträge sind gespeichert, werden aber nicht versendet",
    summary: (plan: string, on: number, limit: number) => `${plan} · ${n(on)}/${n(limit)} Einträge aktiv`,
    renews: (date: string) => ` · nächste Verlängerung ${date}`,
    ends: (date: string) => ` · aktiv bis ${date}`,
  },

  sent: {
    title: "Dein Zustellprotokoll",
    last: (ago: string) => `Letzte Zustellung ${ago}`,
    none: "Noch keine Zustellungen",
    empty: "Bisher nichts zugestellt.",
    channel: { push: "Push", email: "E-Mail" } as Record<string, string>,
    status: { sent: "zugestellt", failed: "nicht zugestellt", skipped: "ausgelassen" } as Record<string, string>,
  },

  fast: {
    title: "Deine Abholbestellung vorbereiten",
    sub: "eine kurze Checkliste, bevor die nächste passende Variante ins Regal kommt",
    lasts: "Median der verzeichneten Duo-Regalzeiten",
    push: "Zustelldauer schwankt; Regalstand bei Apple gegenprüfen",
    tapsLeft: "bleiben, nachdem die Benachrichtigung eingetroffen ist",
    steps: [
      { title: "Den erreichbaren Umkreis prüfen", hint: "Behalte nur Stores, die du für eine bestätigte Abholung erreichen kannst." },
      { title: "Die genaue Variante kennen", hint: "Halte Modell, Kapazität und Finish bereit, bevor du Apple öffnest." },
      { title: "Kaufmöglichkeiten durchsehen", hint: "Lies Apples Zahlungs- und Mobilfunkoptionen vor der Bestellung." },
      { title: "Das Angebot erneut prüfen", hint: "Eine frühere Beobachtung oder Mitteilung hält kein Telefon für dich frei." },
      { title: "Auf die Abholbestätigung warten", hint: "Fahr erst los, wenn Apple die Bestellung als abholbereit bestätigt." },
    ],
    guide: "Abhol-Checkliste lesen (Englisch)",
    window: "Deine Rückkehrzeiten",
  },

  restock: {
    /** "Restock by restock" on the dashboard: each restock against the member's alerts (lib/alertMarks.ts). */
    mark: { delivered: "Alarm zugestellt", sent: "Alarm gesendet", other: "Nicht in deinen Alarmen", before: "Vor deinem Alarm" },
    title: "Rückkehrzeiten in deinen Stores",
    anyIphone: "iPhone",
    and: " und ",
    yours: (k: number) => (k === 1 ? "deinem Store" : `deinen ${n(k)} Stores`),
    Yours: (k: number) => (k === 1 ? "Dein Store" : `Deine ${n(k)} Stores`),
    otherStores: (k: number) => (k === 1 ? "1 anderen Store" : `${n(k)} anderen Stores`),
    meta: (what: string, k: number, days: number, zone: string) => `${what} · ${stores(k)} · ${days}-Tage-Log · ${zone}`,
    busiest: (yours: string, then: string | null) => (then ? `meiste Rückkehren in ${yours} · an zweiter Stelle ${then}` : `meiste Rückkehren in ${yours}`),
    busiestArea: (k: number, zone: string) => `Spitze über ${n(k)} Stores derselben Zeitzone (${zone})`,
    next: (inHours: number) => `kommendes Zeitfenster · ${inHours === 0 ? "noch in dieser Stunde" : `noch ${inHours} Std.`}`,
    typical: "Median der Regalzeit",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `keine Rückkehr verzeichnet in ${yours} · ${days}-Tage-Log` : `Rückkehren verzeichnet in ${yours} · ${days}-Tage-Log${pattern ? "" : " · reicht noch nicht für ein Muster"}`),
    byHour: (busiestInGreen: boolean) => `Tagesstunde${busiestInGreen ? " · Spitze in Grün" : ""}`,
    byWeekday: (busiest: string | null) => `Wochentag${busiest ? ` · Spitze ${busiest}` : ""}`,
    hourChart: (yours: string, zone: string, items: string) => `Rückkehren je Tagesstunde in ${yours}, ${zone}: ${items}`,
    weekdayChart: (yours: string, items: string) => `Rückkehren je Wochentag in ${yours}: ${items}`,
    chartItem: (label: string, k: number, reported: number) => `${label} ${n(k)}${reported ? ` (+${n(reported)} Fremdmeldungen)` : ""}`,
    barTitle: (label: string, k: number, yours: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label}: ${plural(k, "Rückkehr", "Rückkehren")} verzeichnet in ${yours}${area ? ` · ${n(area.n)} in der ganzen Zeitzone (${area.zone})` : ""}${reported ? ` · ${n(reported)} Fremdmeldungen` : ""}`,
    now: "jetzt",
    allZone: (k: number, zone: string) => `Jeder Store mit ${zone} (${n(k)})`,
    reportMarkBars: "Gestrichelte Umrisse",
    reportMarkDots: "Offene Kreise",
    sellTitle: "Wie lange Rückkehren im Regal bleiben",
    sellMeta: (what: string, k: number, days: number) => `${what} · ${stores(k)} · ${days}-Tage-Log`,
    sellLabel: (yours: string) => `bei ${yours}`,
  },

  success: {
    metaTitle: "Merkliste ist aktiv",
    isOn: (plan: string) => `${plan} läuft`,
    yourPlan: "Aktueller Tarif",
    received: "Zahlung bestätigt",
    onPlan: (limit: number) => `Platz für ${n(limit)} Einträge auf deiner Merkliste.`,
    planOn: "Dein Tarif läuft.",
    pending: "Stripe bestätigt noch; der Tarif erscheint innerhalb einer Minute in deinem Konto.",
    open: "Meine Merkliste öffnen",
    another: "Weitere Einträge hinzufügen",
    saved: (k: number) => `${plural(k, "Eintrag", "Einträge")} gespeichert · den Beleg schickt Stripe per E-Mail`,
    pushOn: "Benachrichtigungen",
    pushNext: "Nächster Schritt: ein Gerät aktivieren",
  },

  install: {
    metaTitle: "Ihr Gerät für ShelfSpring-Mitteilungen einrichten",
    metaDescription: "Wählen Sie die Anleitung für Ihr Handy oder Ihren Computer, melden Sie sich an und testen Sie Mitteilungen. Der Empfang hängt auch von Browser und Geräteeinstellungen ab.",
  },

  pricing: {
    metaTitle: "Merkliste abonnieren: 10, 20 oder 50 Alarmregeln",
    metaDescription: "Merken Sie passende iPhones und erreichbare Stores. ShelfSpring beginnt bei 5 USD im Monat; Bestände, Karten und aufgezeichnete Änderungen bleiben kostenlos einsehbar.",
    title: "Ein Abo für deine engere Auswahl.",
    lead: "Stöbern bleibt kostenlos. Mit einem Abo erfährst du von passenden Änderungen. **Ein Eintrag beobachtet eine genaue iPhone-Variante in einem Store.**",
    chips: ["Öffentliche Bestände und Verlauf bleiben kostenlos","Dieselbe Bestandsquelle in jedem Tarif","Monatliche Abrechnung in US-Dollar","Verlängerung im Konto beendbar"],
    fastest: "Was das Abo übernimmt",
    everyFast: "Eine Benachrichtigung wird ausgelöst, wenn eine passende Variante ins Regal zurückkehrt. Abfrage, Abgleich und Zustellung brauchen Zeit; ein sofortiger Empfang ist nicht garantiert.",
    historySample: "Alle erfassten Länder · letzte 7 Tage · {n} abgeschlossene Regalzeiten",
    sellsOut: (band: string) => `Die beobachtete mittlere Regalzeit eines iPhone Duo liegt bei **${band}**. Das beschreibt die erfasste Stichprobe, nicht deine nächste Gelegenheit.`,
    band: (range: string) => `${range} Sekunden`,
    aboutMinute: "rund einer Minute",
    sameSpeed: "Regelmäßige Bestandsaktualisierungen",
    rechecked: "wie oft deine Stores angesehen werden",
    toPhone: "von der bestätigten Rückkehr bis auf dein Gerät",
    listing: "Median der Duo-Regalzeit",
    note: { plus: "z. B. eine Variante in zehn Stores", pro: "z. B. zwei Varianten, je zehn Stores", max: "z. B. fünf Varianten, je zehn Stores" } as Record<string, string>,
    month: "pro Monat",
    alerts: (k: number) => `${n(k)} Einträge`,
    perks: ["Kapazität und Finish genau festlegen","Beobachtete Stores an deine Wege anpassen","Browser-Benachrichtigungen, E-Mail als Ersatzweg"],
    cancel: "Die Verlängerung lässt sich jederzeit beenden",
    get: (plan: string) => `${plan} starten`,
    billing: "Zahlungen laufen über Stripe, per Karte oder Link. Ein Wechsel nach oben wird für die Resttage berechnet, ein Wechsel nach unten gilt ab der nächsten Verlängerung.",
    refund: "Erstattung: Eine Zahlung der letzten 7 Tage wird voll zurückgezahlt, wenn seitdem keine Rückkehr-Benachrichtigung zugestellt wurde ([Erstattungsregeln](/refunds)).",
  },
};
