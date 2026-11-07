/**
 * German strings: account (dashboard page, its restock modules, install / checkout / pricing pages). Plan names
 * and dollar amounts are not translated (billing is in USD everywhere).
 */
import type { Dict } from "../en";
import { n, plural } from "./util";

const stores = (k: number) => plural(k, "Store", "Stores");

export const account: Dict["account"] = {
  loading: "Wird geladen",
  meta: { title: "Meine Alarme" },
  signedInAs: (email: string) => `Angemeldet als ${email}`,
  title: "Meine Alarme",
  units: { s: "Sek.", min: "Min.", taps: "Taps" },

  plan: {
    title: "Tarif",
    none: "Noch kein Tarif: Alarme sind aus",
    summary: (plan: string, on: number, limit: number) => `${plan} · ${n(on)} von ${n(limit)} Alarmen an`,
    renews: (date: string) => ` · verlängert sich am ${date}`,
    ends: (date: string) => ` · endet am ${date}`,
  },

  sent: {
    title: "Gesendete Alarme",
    last: (ago: string) => `Zuletzt ${ago}`,
    none: "Noch nichts gesendet",
    empty: "Noch nichts gesendet.",
    channel: { push: "Mitteilung", email: "E-Mail" } as Record<string, string>,
    status: { sent: "gesendet", failed: "fehlgeschlagen", skipped: "übersprungen" } as Record<string, string>,
  },

  fast: {
    title: "Ihre Abholbestellung vorbereiten",
    sub: "eine kurze Checkliste vor der nächsten passenden Verfügbarkeit",
    lasts: "mediane Dauer erfasster Duo-Verfügbarkeiten",
    push: "Zustellzeit variiert; Bestand bei Apple bestätigen",
    tapsLeft: "vor dem Bestätigen der Bestellung prüfen",
    steps: [
      { title: "Den erreichbaren Umkreis prüfen", hint: "Behalten Sie nur Stores, die Sie für eine bestätigte Abholung erreichen können." },
      { title: "Die genaue Variante kennen", hint: "Halten Sie Modell, Speicher und Farbe bereit, bevor Sie Apple öffnen." },
      { title: "Kaufmöglichkeiten durchsehen", hint: "Lesen Sie Apples Zahlungs- und Mobilfunkoptionen vor der Bestellung." },
      { title: "Das Angebot erneut prüfen", hint: "Eine frühere Beobachtung oder Mitteilung hält kein Telefon für Sie frei." },
      { title: "Auf die Abholbestätigung warten", hint: "Fahren Sie erst los, wenn Apple die Bestellung als abholbereit bestätigt." },
    ],
    guide: "Vorbereitung zur Abholung (Englisch)",
    window: "Der Verlauf Ihrer Stores",
  },

  restock: {
    title: "Wann Ihre Stores wieder vorrätig sind",
    anyIphone: "iPhone",
    and: " und ",
    yours: (k: number) => (k === 1 ? "Ihrem Store" : `Ihren ${n(k)} Stores`),
    Yours: (k: number) => (k === 1 ? "Ihr Store" : `Ihre ${n(k)} Stores`),
    otherStores: (k: number) => (k === 1 ? "1 anderen Store" : `${n(k)} anderen Stores`),
    meta: (what: string, k: number, days: number, zone: string) => `${what} · ${stores(k)} · letzte ${days} Tage · ${zone}`,
    busiest: (yours: string, then: string | null) => (then ? `stärkste Stunde in ${yours} · danach ${then}` : `stärkste Stunde in ${yours}`),
    busiestArea: (k: number, zone: string) => `am stärksten über alle ${n(k)} Stores (${zone})`,
    next: (inHours: number) => `nächstes Zeitfenster · ${inHours === 0 ? "diese Stunde" : `in ${inHours} Std.`}`,
    typical: "typische Dauer, bis ausverkauft",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `noch keine Restocks in ${yours} · letzte ${days} Tage` : `Restocks in ${yours} · letzte ${days} Tage${pattern ? "" : " · zu wenige für ein Muster"}`),
    byHour: (busiestInGreen: boolean) => `Nach Uhrzeit${busiestInGreen ? " · stärkste in Grün" : ""}`,
    byWeekday: (busiest: string | null) => `Nach Wochentag${busiest ? ` · am stärksten ${busiest}` : ""}`,
    hourChart: (yours: string, zone: string, items: string) => `Restocks nach Uhrzeit in ${yours}, ${zone}: ${items}`,
    weekdayChart: (yours: string, items: string) => `Restocks nach Wochentag in ${yours}: ${items}`,
    chartItem: (label: string, k: number, reported: number) => `${label} ${n(k)}${reported ? ` (+${n(reported)} von anderen Trackern gemeldet)` : ""}`,
    barTitle: (label: string, k: number, yours: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label}: ${plural(k, "Restock", "Restocks")} in ${yours}${area ? ` · ${n(area.n)} insgesamt (${area.zone})` : ""}${reported ? ` · ${n(reported)} von anderen Trackern gemeldet` : ""}`,
    now: "jetzt",
    allZone: (k: number, zone: string) => `Alle ${n(k)} Stores (${zone})`,
    reportMarkBars: "Gestrichelt",
    reportMarkDots: "Hohle Punkte",
    sellTitle: "Wie schnell Ihre Restocks ausverkauft sind",
    sellMeta: (what: string, k: number, days: number) => `${what} · ${stores(k)} · letzte ${days} Tage`,
    sellLabel: (yours: string) => `in ${yours}`,
  },

  success: {
    metaTitle: "Alarme sind an",
    isOn: (plan: string) => `${plan} ist aktiv`,
    yourPlan: "Ihr Tarif",
    received: "Zahlung erhalten",
    onPlan: (limit: number) => `${n(limit)} Alarme in Ihrem Tarif.`,
    planOn: "Ihr Tarif ist aktiv.",
    pending: "Ihr Abo erscheint innerhalb einer Minute in Ihrem Konto.",
    open: "Meine Alarme öffnen",
    another: "Weiteren Alarm einrichten",
    saved: (k: number) => `${plural(k, "Alarm", "Alarme")} gespeichert · Beleg von Stripe`,
    pushOn: "Mitteilungen",
    pushNext: "Als Nächstes: Alarme auf Ihrem Handy",
  },

  install: {
    metaTitle: "Ihr Gerät für ShelfSpring-Mitteilungen einrichten",
    metaDescription: "Wählen Sie die Anleitung für Ihr Handy oder Ihren Computer, melden Sie sich an und testen Sie Mitteilungen. Der Empfang hängt auch von Browser und Geräteeinstellungen ab.",
  },

  pricing: {
    metaTitle: "Merkliste abonnieren: 10, 20 oder 50 Alarmregeln",
    metaDescription: "Merken Sie passende iPhones und erreichbare Stores. ShelfSpring beginnt bei 5 USD im Monat; Bestände, Karten und aufgezeichnete Änderungen bleiben kostenlos einsehbar.",
    title: "Ein Abo für Ihre engere Auswahl.",
    lead: "Stöbern bleibt kostenlos. Mit einem Abo erfahren Sie von passenden Änderungen. **Eine Regel beobachtet eine genaue iPhone-Konfiguration in einem Store.**",
    chips: ["Öffentliche Bestände und Verlauf bleiben kostenlos","Dieselbe Bestandsquelle in jedem Tarif","Monatliche Abrechnung in US-Dollar","Verlängerung im Konto kündbar"],
    fastest: "Was das Abo übernimmt",
    everyFast: "Ein Alarm wird nach einer passenden Verfügbarkeitsänderung ausgelöst. Quellprüfung, Synchronisierung und Zustellung benötigen Zeit; der Empfang ist nicht unmittelbar garantiert.",
    historySample: "Alle erfassten Länder · letzte 7 Tage · {n} abgeschlossene Verfügbarkeitsfenster",
    sellsOut: (band: string) => `Die beobachtete mediane Verfügbarkeitsdauer eines iPhone Duo beträgt **${band}**. Das beschreibt die erfasste Stichprobe, nicht Ihre nächste Gelegenheit.`,
    band: (range: string) => `${range} Sekunden`,
    aboutMinute: "etwa einer Minute",
    sameSpeed: "Regelmäßige Bestandsaktualisierungen",
    rechecked: "Ihre Stores erneut geprüft",
    toPhone: "bestätigter Restock bis aufs Handy",
    listing: "mediane Dauer aufgezeichneter Duo-Verfügbarkeiten",
    note: { plus: "1 iPhone × 10 Stores", pro: "2 iPhones × 10 Stores", max: "5 iPhones × 10 Stores" } as Record<string, string>,
    month: "/ Monat",
    alerts: (k: number) => `${n(k)} Alarme`,
    perks: ["Speicher und Farbe genau festlegen","Beobachtete Stores an Ihre Wege anpassen","Browser-Mitteilungen mit E-Mail als Ersatzkanal"],
    cancel: "Jederzeit kündbar",
    get: (plan: string) => `${plan} wählen`,
    billing: "Abrechnung über Stripe · Karte oder Link · Tarifwechsel anteilig",
    refund: "Doch nichts für Sie? [Volle Rückerstattung innerhalb von 7 Tagen](/refunds), solange Sie noch keinen Restock-Alarm erhalten haben",
  },
};
