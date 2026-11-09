/**
 * Swedish strings: account (dashboard, its return modules, install / checkout / pricing pages). Plan names and
 * dollar amounts stay as they are (billing is in USD everywhere). Strings with **bold** / [label](href) render
 * through <Md>.
 */
import type { Dict } from "../en";
import { n, pl } from "./util";

export const account: Dict["account"] = {
  loading: "Hämtar",
  meta: { title: "Min bevakningslista" },
  signedInAs: (email: string) => `Konto · ${email}`,
  title: "Hela bevakningslistan, samlad på ett ställe.",
  units: { s: "s", min: "min", taps: "tryck" },

  plan: {
    title: "Medlemskap och betalning",
    none: "Ingen aktiv plan · aviseringarna sparas men skickas inte",
    summary: (plan: string, on: number, limit: number) => `${plan} · ${on}/${limit} aviseringar aktiva`,
    renews: (date: string) => ` · nästa förnyelse ${date}`,
    ends: (date: string) => ` · aktiv till ${date}`,
  },

  sent: {
    title: "Din leveranslogg",
    last: (ago: string) => `Senast ${ago}`,
    none: "Inga leveranser än",
    empty: "Ingen matchande återkomst har skickats till det här kontot än. Sparade aviseringar börjar levereras när en betald plan är aktiv och en matchande ändring bekräftas.",
    channel: { push: "notis", email: "e-post" } as Record<string, string>,
    status: { sent: "levererad", failed: "ej levererad", skipped: "överhoppad" } as Record<string, string>,
  },

  fast: {
    title: "Förbered din hämtningsbeställning",
    sub: "en kort checklista inför nästa användbara listning",
    lasts: "median för en registrerad Duo-listning",
    push: "leveranstiden varierar; stäm av lagret hos Apple",
    tapsLeft: "kvar för dig när notisen har kommit",
    steps: [
      { title: "Bestäm hur långt du kan åka", hint: "Behåll bara butiker du kan ta dig till för en bekräftad hämtning." },
      { title: "Ha den exakta konfigurationen klar", hint: "Modell, kapacitet och färg bör vara bestämda innan du öppnar Apple." },
      { title: "Gå igenom köpalternativen", hint: "Läs Apples val för betalning och operatör innan du lägger ordern." },
      { title: "Titta på listningen en gång till", hint: "En tidigare observation eller notis kan inte hålla en telefon åt dig." },
      { title: "Invänta bekräftelsen på hämtningen", hint: "Åk först när Apple har bekräftat att ordern är klar att hämta." },
    ],
    guide: "Läs checklistan för hämtning",
    window: "Dina återkomsttimmar",
  },

  restock: {
    title: "Återkomsttimmar i dina butiker",
    anyIphone: "iPhone",
    and: " och ",
    yours: (k: number) => (k === 1 ? "din butik" : `dina ${k} butiker`),
    Yours: (k: number) => (k === 1 ? "Din butik" : `Dina ${k} butiker`),
    otherStores: (k: number) => pl(k, "annan butik", "andra butiker"),
    meta: (what: string, stores: number, days: number, zone: string) => `${what} · ${pl(stores, "butik", "butiker")} · logg på ${days} dagar · ${zone}`,
    busiest: (yours: string, then: string | null) => (then ? `flest återkomster i ${yours} · tvåa ${then}` : `flest återkomster i ${yours}`),
    busiestArea: (stores: number, zone: string) => `topp bland ${stores} butiker som följer ${zone}`,
    next: (inHours: number) => `kommande fönster · ${inHours === 0 ? "inom den här timmen" : `om ${inHours} tim`}`,
    typical: "median för tid på hyllan",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `inga återkomster loggade i ${yours} · logg på ${days} dagar` : `återkomster loggade i ${yours} · logg på ${days} dagar${pattern ? "" : " · för lite för ett mönster"}`),
    byHour: (busiestInGreen: boolean) => `Timme på dygnet${busiestInGreen ? " · toppen i grönt" : ""}`,
    byWeekday: (busiest: string | null) => `Dag i veckan${busiest ? ` · topp: ${busiest}` : ""}`,
    hourChart: (yours: string, zone: string, items: string) => `Återkomster per timme på dygnet i ${yours}, ${zone}: ${items}`,
    weekdayChart: (yours: string, items: string) => `Återkomster per dag i veckan i ${yours}: ${items}`,
    chartItem: (label: string, k: number, reported: number) => `${label} ${n(k)}${reported ? ` (+${reported} externa)` : ""}`,
    barTitle: (label: string, k: number, yours: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label}: ${pl(k, "loggad återkomst", "loggade återkomster")} i ${yours}${area ? ` · ${area.n} inom ${area.zone}` : ""}${reported ? ` · ${reported} externa` : ""}`,
    now: "nu",
    allZone: (stores: number, zone: string) => `Varje butik som följer ${zone} (${stores})`,
    reportMarkBars: "Streckad",
    reportMarkDots: "Öppna cirklar",
    sellTitle: "Hur länge återkomsterna ligger på hyllan",
    sellMeta: (what: string, stores: number, days: number) => `${what} · ${pl(stores, "butik", "butiker")} · logg på ${days} dagar`,
    sellLabel: (yours: string) => `i ${yours}`,
  },

  success: {
    metaTitle: "Aviseringarna är aktiva",
    isOn: (plan: string) => `${plan} gäller nu`,
    yourPlan: "Nuvarande plan",
    received: "Betalningen bekräftad",
    onPlan: (limit: number) => `Plats för ${limit} aviseringar på bevakningslistan.`,
    planOn: "Planen är aktiv.",
    pending: "Stripe bekräftar fortfarande; planen syns på kontot inom en minut.",
    open: "Öppna min bevakningslista",
    another: "Lägg till på bevakningslistan",
    saved: (k: number) => `${pl(k, "avisering sparad", "aviseringar sparade")} · Stripe mejlar kvittot`,
    pushOn: "Notiser",
    pushNext: "Nästa steg: aktivera en enhet",
  },

  install: {
    metaTitle: "Förbered din enhet för ShelfSpring-aviseringar",
    metaDescription: "Följ stegen för din telefon eller dator, logga in och testa aviseringarna. Mottagningen beror också på webbläsaren och enhetens inställningar.",
  },

  pricing: {
    metaTitle: "Bevakningsplaner: 10, 20 eller 50 aviseringsregler",
    metaDescription: "Spara passande iPhone-modeller och butiker du kan nå. ShelfSpring börjar på 5 USD per månad; lager, kartor och registrerade förändringar är gratis att läsa.",
    title: "Ett medlemskap för din kortlista.",
    lead: "Fortsätt titta gratis. Prenumerera när du vill att nästa matchande ändring ska komma till dig. **En avisering bevakar en exakt iPhone i en butik.**",
    chips: ["Offentligt lager och historik förblir gratis", "Samma lagerflöde i varje plan", "Månadsdebitering i amerikanska dollar", "Stoppa förnyelsen från kontot"],
    fastest: "Vad en prenumeration gör",
    everyFast: "Aviseringar skickas när matchande tillgänglighet upptäcks. Källkontroll, synkronisering och leverans kan ge fördröjning.",
    historySample: "Alla följda länder · senaste 7 dagarna · {n} avslutade hämtningsfönster",
    sellsOut: (band: string) => `Den observerade mediantiden för en iPhone Duo-listning var **${band}**. Det beskriver det registrerade urvalet, inte ditt nästa tillfälle.`,
    band: (r: string) => `${r} sekunder`,
    aboutMinute: "ungefär en minut",
    sameSpeed: "Regelbundna lageruppdateringar",
    rechecked: "hur ofta dina butiker läses av",
    toPhone: "från bekräftad återkomst till din enhet",
    listing: "median för Duo på hyllan",
    note: { plus: "t.ex. en konfiguration bevakad i tio butiker", pro: "t.ex. två konfigurationer, tio butiker vardera", max: "t.ex. fem konfigurationer, tio butiker vardera" } as Record<string, string>,
    month: "per månad",
    alerts: (k: number) => `${k} aviseringar`,
    perks: ["Välj exakta kombinationer av kapacitet och färg", "Ändra butikerna inom räckhåll när planerna ändras", "Webbläsarnotiser med e-post som reserv"],
    cancel: "Förnyelsen kan stoppas när som helst",
    get: (plan: string) => `Starta ${plan}`,
    billing: "Betalningar går via Stripe, med kort eller Link. Byte mellan planer räknas om proportionellt.",
    refund: "Återbetalning: en betalning från de senaste 7 dagarna återbetalas helt om ingen avisering om en återkomst har levererats sedan dess ([återbetalningsregler](/refunds)).",
  },
};
