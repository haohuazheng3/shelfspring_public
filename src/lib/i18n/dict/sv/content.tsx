import { withShelfContent } from "@/lib/seo/localizedCopy";
/**
 * Swedish strings: content — FAQ, browse rows, stat strips, product parts, sources, live widgets, the enrich
 * helpers (opening hours, durations, FAQ answers, titles), live tokens, the return-pattern sentence and photo alt
 * text. Arguments arrive formatted ("31 bekräftade återkomster", "kl. 9", "natthimmel"); the words go around them.
 */
import type { ReactNode } from "react";
import type { Forms } from "@/lib/i18n/format";
import type { Dict } from "../en";
import { NOUNS } from "./util";

const f = (x: Forms): Forms => x;

type Kind = "state" | "city" | "store" | "model";

/** The number at the start of a formatted count ("3 Apple Store-butiker" → 3). */
const lead = (count: string) => Number(count.replace(/^\D*(\d[\d\s ]*).*$/, "$1").replace(/\D/g, "")) || 0;

const baseContent: Dict["content"] = {
  hours: {
    closed: "stängt",
    everyDay: (hours: string) => `Dagligen ${hours}`,
    tomorrow: "i morgon",
    dayAt: (day: string, time: string) => `${day} ${time}`,
    closedTodayOpens: (next: string) => `Stängt i dag · öppnar igen ${next}`,
    closedToday: "Stängt hela dagen i dag",
    opensAt: (time: string) => `Dörrarna öppnar ${time}`,
    openNow: (closes: string) => `Öppet till ${closes}`,
    closedNowOpens: (next: string) => `Stängt för stunden · öppnar igen ${next}`,
    closedNow: "Stängt för stunden",
  },

  duration: {
    underAMinute: "kortare än en minut",
    pair: (a: string, b: string) => `${a} ${b}`,
  },
  listMore: (k: string) => `${k} fler`,
  nearLine: (place: string, distance: string) => `${place} (${distance})`,

  faq: {
    where: (kind: Kind, place: string) => (kind === "store" ? `hos ${place}` : kind === "model" ? `för ${place}` : `i ${place}`),
    nRestocks: f({ one: "# bekräftad återkomst", other: "# bekräftade återkomster" }),
    restockA: ({ count, where, days, week, peak }: { count: string | null; where: string; days: string; week: string; peak: { hour: string; day: string | null } | null }) =>
      `${count == null ? `Registret för ${days} dagar har ingen återkomst ${where}` : `Registret för ${days} dagar har ${count} ${where}, varav ${week} den här veckan`}${peak ? `; de samlas runt ${peak.hour} lokal tid${peak.day ? `, med ${peak.day} som starkaste veckodag` : ""}` : ""}, och Apple publicerar ingen leveranskalender.`,
    lastsNone: (where: string) => `Ännu för få avslutade listningar från återkomst till tömd hylla ${where} för att mäta.`,
    lasts: (days: string, duration: string) => `Median för tid på hyllan i registret för ${days} dagar: runt ${duration} mellan en återkomst och nästa tömning.`,
    storeIn: (store: string, line: string) => `${store} · ${line}`,
    nearestA: (stores: string) => `Närmaste alternativ: ${stores}.`,

    modelStockQ: (model: string) => `Var står ${model} på hyllan just nu?`,
    modelStockNone: (model: string) => `Ingenstans vid senaste observationen; listan här uppdateras när en Apple Store i USA lägger upp ${model} för hämtning.`,
    nUsStores: f({ one: "# amerikansk Apple Store", other: "# amerikanska Apple Store-butiker" }),
    modelStockSome: (count: string) => `I ${count} vid senaste observationen; var och en namnges nedan med konfigurationerna den listar.`,
    priceQ: (model: string) => `Vad kostar ${model} på apple.com?`,
    priceA: (low: string, high: string, storages: string, colors: string) => `Listpriset utan operatörsbindning går från ${low} till ${high} beroende på kapacitet (${storages}), med ${colors} som finish.`,
    modelRestockQ: (model: string) => `Hur ofta kommer ${model} tillbaka på hyllan?`,
    modelLastsQ: (model: string) => `Hur länge ligger en återkommen ${model} listad?`,
    reserveQ: (model: string) => `Kan en ${model} hållas åt mig innan jag beställer?`,
    reserveA: "Inte före beställningen: när en butik listar konfigurationen lägger du en order på apple.com med hämtning i butik, och först då ställs den undan för ditt hämtningsfönster.",

    storeStockQ: (store: string, model: string) => `Står ${model} på hyllan hos ${store}?`,
    nConfigs: f({ one: "# konfiguration", other: "# konfigurationer" }),
    storeStockYes: (count: string) => `Ja: ${count} vid senaste observationen, med kapacitet och finish i tabellen på sidan.`,
    storeStockNo: (other: { pro: string; proMax: string } | null) => `Inte vid senaste observationen${other ? `; butiken listar däremot ${other.pro} konfigurationer av iPhone 18 Pro och ${other.proMax} av 18 Pro Max` : ", och 18 Pro och 18 Pro Max är också borta från hyllan"}.`,
    hoursQ: (store: string) => `När har ${store} öppet?`,
    hoursA: ({ hours, today, address, phone }: { hours: string | null; today: string | null; address: string; phone: string | null }) =>
      `${hours ?? "Se tiderna på den här sidan"}${today ? ` (i dag ${today})` : ""}, adress ${address}${phone ? `; telefon ${phone}` : ""}.`,
    storeRestockQ: (store: string) => `Hur ofta kommer iPhone tillbaka på hyllan hos ${store}?`,
    storeLastsQ: (store: string) => `Hur länge ligger återkomster listade hos ${store}?`,
    storeNearestQ: (store: string) => `Vilka andra Apple Store-butiker ligger närmast ${store}?`,

    placeStockQ: (place: string, model: string) => `Var i ${place} står ${model} på hyllan nu?`,
    placeStockNone: (place: string, model: string) => `Ingenstans vid senaste observationen; så fort en butik i ${place} listar ${model} för hämtning syns det här.`,
    nStores: f({ one: "# butik", other: "# butiker" }),
    placeStockSome: (count: string, stores: string) => `${count} vid senaste observationen: ${stores}.`,
    countQ: (place: string) => `Hur många Apple Store-butiker har ${place}?`,
    nAppleStores: f({ one: "# Apple Store", other: "# Apple Store-butiker" }),
    countMany: (count: string, stores: string) => (lead(count) > 3 ? `${count}; bland dem ${stores}.` : `${count}: ${stores}.`),
    countOne: (count: string, store: string) => `${count}, nämligen ${store}.`,
    placeRestockQ: (place: string) => `Hur ofta kommer iPhone tillbaka på hyllan i ${place}?`,
    placeLastsQ: (place: string) => `Hur länge räcker lagret efter en återkomst i ${place}?`,
    placeNearestQ: (place: string) => `Vilka butiker utanför ${place} ligger närmast?`,
  },

  explainer: (kind: Kind, place: string) => {
    const at = kind === "store" ? `hos ${place}` : kind === "model" ? "i varje Apple Store i USA" : `i butikerna i ${place}`;
    return [
      "Listningar för hämtning hör till apple.com: kassan frågar efter en konfiguration och en butik, betalningen sker online och hämtningen på plats, ofta samma dag. Lagret på butikshyllan och operatörernas lager är separata.",
      `ShelfSpring registrerar varje följd konfiguration ${at} från ett synkroniserat lagerflöde; en ändring förs in i registret först efter en bekräftande observation.`,
      "Varje bekräftad ändring blir en post i registret, och de posterna ritar återkomstdiagrammen och historiken här.",
    ];
  },
  alertRule: "Varje avisering hör till en enda butik och en enda exakt konfiguration; notiser följer upptäckt tillgänglighet efter synkronisering, så bekräfta ordern hos Apple.",

  titles: {
    state: (name: string, duoNow: string, stores: string) => [
      `Apple Store i ${name}: ${duoNow} av ${stores} har iPhone Duo nu`,
      `Apple Store i ${name} – iPhone Duo att hämta, live`,
      `Apple Store i ${name} – iPhone Duo i lager`,
      `Apple Store ${name} – iPhone i lager`,
    ],
    city: (city: string, code: string, duoNow: string, stores: string) => [
      `Apple Store i ${city}, ${code}: ${duoNow} av ${stores} har iPhone Duo`,
      `Apple Store i ${city}, ${code} – iPhone Duo att hämta`,
      `Apple Store i ${city}, ${code} – iPhone Duo i lager`,
      `Apple Store ${city} – iPhone i lager`,
    ],
    store: (name: string, region: string | null) => {
      const r = region ? ` (${region})` : "";
      return [
        `${name}${r}: iPhone i lager idag, hämtning & öppettider`,
        `${name}${r}: iPhone i lager idag & öppettider`,
        `${name}${r}: iPhone i lager & öppettider`,
        `${name}: iPhone i lager idag, hämtning & öppettider`,
        `${name}: iPhone i lager & öppettider`,
        `${name}: iPhone i lager`,
        `${name} – lager`,
      ];
    },
    model: (name: string, storesNow: string) => [
      `${name} att hämta: ${storesNow} Apple Store-butiker har den just nu`,
      `${name} att hämta: ${storesNow} butiker har den nu`,
      `${name} – lager för hämtning i butik, live`,
    ],
  },

  tokens: {
    tooFewToMeasure: "ännu inte mätbart",
    noneLoggedYet: "inte i registret än",
    noneYet: "inte noterad än",
  },

  pattern: {
    none: (days: string) => `Registret för ${days} dagar har ingen bekräftad återkomst.`,
    nConfirmed: f({ one: "# bekräftad återkomst", other: "# bekräftade återkomster" }),
    countIn: (count: string, days: string) => `${count} på ${days} dagar`,
    stay: (minutes: string) => `; median på hyllan runt ${minutes} min`,
    nDays: f({ one: "# dag", other: "# dagar" }),
    tooFew: (count: string, onDays: string | null, stay: string) => `${count}${onDays ? `, alla på ${onDays}` : ""}: för få separata dagar för att peka ut en typisk timme${stay}.`,
    usual: (hour: string, weekday: string | null, count: string, stay: string) => `Återkomsterna samlas runt ${hour} lokal tid${weekday ? `, med ${weekday} som vanligaste dag` : ""}; ${count}${stay}.`,
  },

  regionNouns: Object.fromEntries(Object.entries(NOUNS).map(([k, [one, other]]) => [k, f({ one, other })])) as Record<string, Forms>,

  measured: "Metodanteckningar",

  faqTitle: "Återkommande frågor",
  breadcrumb: "Sidspår",
  keepExploring: "Mer ur registret",
  browse: {
    storesByState: "Bläddra per delstat",
    allStatesCities: "Varje delstat och stad →",
    liveByModel: "Hyllstatus per iPhone",
    modelStock: (model: string) => `Tillgänglighet: ${model}`,
    thisPage: "du är här",
    restockLog: (short: string) => `Återkomstregister: ${short}`,
    liveMap: "Kartvy",
    mostStores: "Störst antal butiker",
    allStates: "Varje delstat",
    bigCities: "Större städer",
    cities: "Städer med butiker",
    storesBy: (region: string) => `Bläddra per ${region}`,
    allStoresIn: ({ country }: { inName: string; country: string }) => <>Hela butikslistan för {country} →</>,
    allRegions: (regions: string) => `Hela listan över ${regions}`,
  },
  modelCards: "Per modell",
  narrative: {
    lastRestock: (config: ReactNode, at: ReactNode, ago: ReactNode) => <>{" "}Senast loggade återkomst: {config}{at}, {ago}.</>,
    at: (store: ReactNode) => <> hos {store}</>,
  },
  statStrip: {
    inStockNow: "På hyllan nu",
    ofStores: (k: string) => `i ${k} butiker`,
    stores: "Platser",
    nCities: f({ one: "i # stad", other: "i # städer" }),
    tracked: "i registret",
    modelNow: (short: string) => `${short} på hyllan`,
    configsInStock: "konfigurationer på hyllan",
    storesWithStock: f({ one: "butik som har den", other: "butiker som har den" }),
    restocks24h: "Återkomster, 24 tim",
    restocksHint: (week: string, month: string, days: string) => `7 d: ${week} · ${days} d: ${month}`,
    sellOuts: (days: string) => `Borta igen (${days} d)`,
    stays: (duration: string) => (/^(under|kortare)\b/.test(duration) ? `median på hyllan ${duration}` : `median på hyllan ~${duration}`),
    noPairs: "inga avslutade par",
    lastRestock: "Senaste återkomst",
    noneYet: "inte loggad än",
    inLastDays: (days: string) => `inom ${days} dagar`,
  },
  product: {
    chooseIphone: "Välj modell",
    storage: "Kapacitet",
    color: "Finish",
    all: "Alla",
    numbersAre: (u: ReactNode) => <>Varje siffra räknar {u} som har den på hyllan nu.</>,
    seen: (ago: ReactNode) => <>noterad {ago} · på hyllan</>,
    last: (ago: ReactNode) => <>senast på hyllan {ago} · borta nu</>,
    notSeenYet: "inte noterad på hyllan än",
    firstCheckPending: "väntar på första observationen",
    inStock: "På hyllan",
    inStockLower: "på hyllan",
    none: "borta",
    here: "precis här",
    notAvailable: "Borta från hyllan",
    notCheckedYet: "Ingen observation än",
    availableForPickup: "Listad för hämtning",
    since: (ago: ReactNode) => <> · först noterad {ago}</>,
    lastInStock: (ago: ReactNode) => <>Senast på hyllan {ago}</>,
    neverSeen: "Inte noterad på den här hyllan än",
    firstCheckSoon: "Första observationen kommer strax",
    buy: "Beställ via apple.com",
    checked: (checked: ReactNode, note: ReactNode) => <>Observerad {checked} · {note}</>,
    checkNote: "regelbundna lageruppdateringar",
  },

  source: (s: ReactNode) => <>Data: {s}</>,
  photoCredit: (link: ReactNode) => <>Bild: {link}</>,
  sources: "Referenser",
  allUsStores: "hela uppsättningen av 269 Apple Store-butiker i USA",
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>ShelfSprings lagerregister för {where}: historisk täckning från {since}; siffrorna uppdaterade {asOf}. Aviseringar skickas när matchande tillgänglighet upptäcks. Källkontroll, synkronisering och leverans kan ge fördröjning. Datumen för historisk täckning beskriver datamängden, inte hur gammal ShelfSpring är.</>,
  live: {
    configsCaption: (stores: ReactNode, model: ReactNode) => <>{model}: hur många av de {stores} Apple Store-butikerna som listar varje konfiguration vid den här observationen</>,
    storage: "Kapacitet",
    pricesCaption: (model: ReactNode) => <>{model} på apple.com: olåst listpris före skatt, bredvid butikerna som listar den nu</>,
    price: "Listpris",
    bestColor: "Mest listade finish (butiker)",
    noRestock: (model: string) => `Registret har ingen återkomst av ${model} än.`,
    clockLabel: (model: string) => `i butiker över hela USA för ${model}`,
    storesWithIt: "Butiker som listar den",
    pairsInStock: "Par av butik och konfiguration på hyllan",
    restocksLogged: "Återkomster i registret",
    medianTime: "Median för tid på hyllan",
    underOneMin: (min: string) => `< ${min}`,
  },

  photos: {
    "apple-store-pickup-counter": { alt: "Bänk i trä med hämtningsskylt i en Apple Store", caption: "Hämtningsordrar lämnas ut vid en sådan här disk." },
    "phone-map": { alt: "Någon följer en vägbeskrivning i mobilens kartapp utomhus", caption: "När en återkomst bara ligger uppe en kort stund avgör avståndet mer än man tror." },
    "phone-card-payment": { alt: "Kvinna med iPhone och kort som betalar på nätet", caption: "Betalningen för hämtning i butik görs online." },
    "phone-on-box": { alt: "Ny telefon som vilar ovanpå sin vita förpackning", caption: "Nyuppackad telefon." },
    "city-map-phone": { alt: "Två personer studerar en stadskarta på en mobil", caption: "Rutten till butiken läggs upp." },
    "phone-notification": { alt: "Hand med en mobil vars låsskärm visar notiser", caption: "Notisen syns på låsskärmen." },
    "apple-store-crowd-inside": { alt: "Kö av besökare inne i en full Apple Store i ett köpcentrum", caption: "Lanseringsvecka i en Apple Store: det som når hyllorna är borta på några minuter." },
    "apple-store-glass-canopy": { alt: "Apple Store med glasväggar och trätak i kvällsljus", caption: "Glasfasaden efter mörkrets inbrott." },
    "apple-store-night-vancouver": { alt: "Apple Store i Vancouver, upplyst på kvällen", caption: "Kvällsbild från Vancouver: hämtningslager kan dyka upp när som helst, men registret visar fler återkomster på morgonen." },
    "phone-hand-camera": { alt: "Hand som håller en iPhone med tre kameror", caption: "Pro-modellerna är dem folk köar för." },
    "place-se-sweden": { alt: "Kajen vid Riddarholmen med Riddarholmskyrkan, Gamla stan i Stockholm", caption: "Riddarholmen, Stockholm." },
  },
};

export const content: Dict["content"] = withShelfContent("sv", baseContent);
