/**
 * Swedish strings: account (dashboard, its restock modules, install / checkout / pricing pages). Plan names and
 * dollar amounts stay as they are (billing is in USD everywhere). Strings with **bold** / [label](href) render
 * through <Md>.
 */
import type { Dict } from "../en";
import { n, pl } from "./util";

export const account: Dict["account"] = {
  loading: "Laddar",
  meta: { title: "Mina bevakningar" },
  signedInAs: (email: string) => `Inloggad som ${email}`,
  title: "Mina bevakningar",
  units: { s: "s", min: "min", taps: "tryck" },

  plan: {
    title: "Plan",
    none: "Ingen plan än: bevakningarna är av",
    summary: (plan: string, on: number, limit: number) => `${plan} · ${on} av ${limit} bevakningar på`,
    renews: (date: string) => ` · förnyas ${date}`,
    ends: (date: string) => ` · slutar ${date}`,
  },

  sent: {
    title: "Skickade notiser",
    last: (ago: string) => `Senaste ${ago}`,
    none: "Inget skickat än",
    empty: "Inget skickat än.",
    channel: { push: "notis", email: "mejl" } as Record<string, string>,
    status: { sent: "skickad", failed: "misslyckades", skipped: "hoppades över" } as Record<string, string>,
  },

  fast: {
    title: "Förbered din beställning för hämtning",
    sub: "en kort checklista inför nästa passande tillfälle",
    lasts: "mediantid för registrerad Duo-tillgänglighet",
    push: "leveranstiden varierar; bekräfta lagret hos Apple",
    tapsLeft: "kontroller innan du bekräftar beställningen",
    steps: [
      { title: "Kontrollera hur långt du kan åka", hint: "Behåll bara butiker du kan nå för en bekräftad hämtning." },
      { title: "Känn till den exakta varianten", hint: "Ha modell, lagring och färg redo innan du öppnar Apple." },
      { title: "Läs igenom köpalternativen", hint: "Granska Apples betalnings- och operatörsval innan du beställer." },
      { title: "Kontrollera erbjudandet igen", hint: "En tidigare observation eller avisering reserverar ingen telefon åt dig." },
      { title: "Vänta på hämtningsbekräftelsen", hint: "Åk när Apple har bekräftat att beställningen är klar att hämta." },
    ],
    guide: "Förbered hämtningen (engelska)",
    window: "Historiken för dina butiker",
  },

  restock: {
    title: "När dina butiker fyller på",
    anyIphone: "iPhone",
    and: " och ",
    yours: (k: number) => (k === 1 ? "din butik" : `dina ${k} butiker`),
    Yours: (k: number) => (k === 1 ? "Din butik" : `Dina ${k} butiker`),
    otherStores: (k: number) => pl(k, "annan butik", "andra butiker"),
    meta: (what: string, stores: number, days: number, zone: string) => `${what} · ${pl(stores, "butik", "butiker")} · senaste ${days} dagarna · ${zone}`,
    busiest: (yours: string, then: string | null) => (then ? `flest påfyllningar i ${yours} · sedan ${then}` : `flest påfyllningar i ${yours}`),
    busiestArea: (stores: number, zone: string) => `flest i alla ${stores} butiker inom ${zone}`,
    next: (inHours: number) => `nästa fönster · ${inHours === 0 ? "den här timmen" : `om ${inHours} tim`}`,
    typical: "så länge ligger en typisk påfyllning ute innan den tar slut",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `inga påfyllningar i ${yours} än · senaste ${days} dagarna` : `påfyllningar i ${yours} · senaste ${days} dagarna${pattern ? "" : " · för få för ett mönster"}`),
    byHour: (busiestInGreen: boolean) => `Per timme${busiestInGreen ? " · flest i grönt" : ""}`,
    byWeekday: (busiest: string | null) => `Per veckodag${busiest ? ` · flest på ${busiest}ar` : ""}`,
    hourChart: (yours: string, zone: string, items: string) => `Påfyllningar per timme i ${yours}, ${zone}: ${items}`,
    weekdayChart: (yours: string, items: string) => `Påfyllningar per veckodag i ${yours}: ${items}`,
    chartItem: (label: string, k: number, reported: number) => `${label} ${n(k)}${reported ? ` (+${reported} rapporterade av andra bevakningstjänster)` : ""}`,
    barTitle: (label: string, k: number, yours: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label}: ${pl(k, "påfyllning", "påfyllningar")} i ${yours}${area ? ` · ${area.n} inom hela ${area.zone}` : ""}${reported ? ` · ${reported} rapporterade av andra bevakningstjänster` : ""}`,
    now: "nu",
    allZone: (stores: number, zone: string) => `Alla ${stores} butiker inom ${zone}`,
    reportMarkBars: "Streckade",
    reportMarkDots: "Ihåliga prickar",
    sellTitle: "Hur snabbt dina påfyllningar tar slut",
    sellMeta: (what: string, stores: number, days: number) => `${what} · ${pl(stores, "butik", "butiker")} · senaste ${days} dagarna`,
    sellLabel: (yours: string) => `i ${yours}`,
  },

  success: {
    metaTitle: "Bevakningarna är på",
    isOn: (plan: string) => `${plan} är aktiv`,
    yourPlan: "Din plan",
    received: "Betalningen har kommit in",
    onPlan: (limit: number) => `${limit} bevakningar ingår i din plan.`,
    planOn: "Din plan är aktiv.",
    pending: "Ditt abonnemang syns på ditt konto inom en minut.",
    open: "Öppna mina bevakningar",
    another: "Lägg till en bevakning till",
    saved: (k: number) => `${pl(k, "bevakning sparad", "bevakningar sparade")} · kvitto från Stripe`,
    pushOn: "Notiser",
    pushNext: "Nästa steg: notiser i din telefon",
  },

  install: {
    metaTitle: "Förbered din enhet för ShelfSpring-aviseringar",
    metaDescription: "Följ stegen för din telefon eller dator, logga in och testa aviseringarna. Mottagningen beror också på webbläsaren och enhetens inställningar.",
  },

  pricing: {
    metaTitle: "Bevakningsplaner: 10, 20 eller 50 aviseringsregler",
    metaDescription: "Spara passande iPhone-modeller och butiker du kan nå. ShelfSpring börjar på 5 USD per månad; lager, kartor och registrerade förändringar är gratis att läsa.",
    title: "Ett abonnemang för ditt urval.",
    lead: "Det är gratis att titta runt. Prenumerera när du vill få relevanta förändringar skickade till dig. **En regel bevakar en exakt iPhone-konfiguration i en butik.**",
    chips: ["Offentligt lager och historik är gratis","Samma lagerkälla för alla planer","Månadsbetalning i amerikanska dollar","Avsluta förnyelsen i ditt konto"],
    fastest: "Det här gör abonnemanget",
    everyFast: "En avisering skickas när matchande tillgänglighet har registrerats. Kontroller hos källan, synkronisering och leverans kan orsaka fördröjningar.",
    historySample: "Alla bevakade länder · senaste 7 dagarna · {n} avslutade tillgänglighetsperioder",
    sellsOut: (band: string) => `Den observerade mediantiden för en tillgänglig iPhone Duo är **${band}**. Det beskriver det registrerade urvalet, inte ditt nästa tillfälle.`,
    band: (r: string) => `${r} sekunder`,
    aboutMinute: "ungefär en minut",
    sameSpeed: "Regelbundna lageruppdateringar",
    rechecked: "dina butiker kollas om",
    toPhone: "från bekräftad påfyllning till din telefon",
    listing: "mediantid för registrerad Duo-tillgänglighet",
    note: { plus: "1 iPhone × 10 butiker", pro: "2 iPhone × 10 butiker", max: "5 iPhone × 10 butiker" } as Record<string, string>,
    month: "/ månad",
    alerts: (k: number) => `${k} bevakningar`,
    perks: ["Välj exakt lagring och färg","Anpassa butikerna efter dina resor","Webbläsaraviseringar med e-post som reservkanal"],
    cancel: "Avsluta när du vill",
    get: (plan: string) => `Välj ${plan}`,
    billing: "Fakturering via Stripe · kort eller Link · planbyten räknas om proportionellt",
    refund: "Inte något för dig? [Full återbetalning inom 7 dagar](/refunds) om ingen notis om påfyllning har nått dig än",
  },
};
