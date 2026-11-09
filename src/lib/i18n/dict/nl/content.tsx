import { withShelfContent } from "@/lib/seo/localizedCopy";
/**
 * Dutch strings: content — the SEO building blocks (FAQ, browse/related rows, stat strips, product parts, sources,
 * live widgets), the enrich helpers, live {{tokens}}, the restock-pattern sentence and photo alt text.
 * Arguments arrive written for Dutch (numbers, durations, names); these functions arrange the words around them.
 */
import type { ReactNode } from "react";
import type { Forms } from "@/lib/i18n/format";
import type { Dict } from "../en";

const f = (x: Forms): Forms => x;
type Kind = "state" | "city" | "store" | "model";
/** CHECK_NOTE's idea (only the wrapper's replacement of product.checkNote is rendered). No digits here. */
const CHECK = "frequent bijgewerkte schapgegevens";
/** "(Open tot 21:00)" inside a sentence: the first letter after the bracket goes lower case. */
const lc = (v: string) => v.replace(/\((\p{Lu})/u, (_m, c: string) => `(${c.toLowerCase()}`);

const baseContent: Dict["content"] = {
  hours: {
    closed: "Dicht",
    everyDay: (hours: string) => `Dagelijks ${hours}`,
    tomorrow: "morgen",
    dayAt: (day: string, time: string) => `${day} ${time}`,
    closedTodayOpens: (next: string) => `Vandaag dicht · weer open ${next}`,
    closedToday: "Vandaag de hele dag dicht",
    opensAt: (time: string) => `Open vanaf ${time}`,
    openNow: (closes: string) => `Open tot ${closes}`,
    closedNowOpens: (next: string) => `Nu dicht · weer open ${next}`,
    closedNow: "Nu dicht",
  },

  duration: {
    underAMinute: "korter dan een minuut",
    pair: (a: string, b: string) => `${a} ${b}`,
  },
  listMore: (n: string) => `${n} andere`,
  nearLine: (place: string, distance: string) => `${place} (${distance})`,

  faq: {
    where: (kind: Kind, place: string) => (kind === "store" ? `bij ${place}` : kind === "model" ? `voor de ${place}` : `in ${place}`),
    nRestocks: f({ one: "# bevestigde rentree", other: "# bevestigde rentrees" }),
    restockA: ({ count, where, days, week, peak }: { count: string | null; where: string; days: string; week: string; peak: { hour: string; day: string | null } | null }) =>
      `${count == null ? `Het logboek van ${days} dagen bevat geen rentree ${where}` : `Het logboek van ${days} dagen telt ${count} ${where}, waarvan ${week} deze week`}${peak ? `; ze vallen meestal rond ${peak.hour} winkeltijd${peak.day ? `, met ${peak.day} als piekdag` : ""}` : ""}. Een leveringskalender maakt Apple niet bekend.`,
    lastsNone: (where: string) => `Nog te weinig afgeronde cycli ${where}, van rentree tot leeg schap, om een duur te meten.`,
    lasts: (days: string, duration: string) => `Mediane schaptijd in het logboek van ${days} dagen: ongeveer ${duration} tussen een rentree en het moment dat het schap weer leeg is.`,
    storeIn: (store: string, line: string) => `${store} · ${line}`,
    nearestA: (stores: string) => `Dichtste alternatieven: ${stores}.`,

    modelStockQ: (model: string) => `Waar ligt de ${model} op dit moment in het schap?`,
    modelStockNone: (model: string) => `Nergens, volgens de laatste waarneming. De eerste Amerikaanse Apple Store die de ${model} weer voor afhalen vermeldt, duikt hier op.`,
    nUsStores: f({ one: "# Amerikaanse Apple Store", other: "# Amerikaanse Apple Stores" }),
    modelStockSome: (count: string) => `Bij ${count} volgens de laatste waarneming; hieronder staat per winkel welke uitvoeringen er liggen.`,
    priceQ: (model: string) => `Wat vraagt apple.com voor de ${model}?`,
    priceA: (low: string, high: string, storages: string, colors: string) => `De simlockvrije catalogusprijs loopt van ${low} tot ${high} per capaciteit (${storages}); afwerkingen: ${colors}.`,
    modelRestockQ: (model: string) => `Hoe vaak keert de ${model} terug in het schap?`,
    modelLastsQ: (model: string) => `Hoe lang blijft een teruggekeerde ${model} in het schap?`,
    reserveQ: (model: string) => `Wordt een ${model} voor me vastgehouden voordat ik bestel?`,
    reserveA: "Niet zonder bestelling. Ligt de uitvoering in het schap van een winkel, dan bestel je via apple.com met afhalen in de winkel; pas daarna wordt het toestel voor jouw afhaalmoment opzijgezet.",

    storeStockQ: (store: string, model: string) => `Ligt de ${model} bij ${store} in het schap?`,
    nConfigs: f({ one: "# uitvoering", other: "# uitvoeringen" }),
    storeStockYes: (count: string) => `Ja, ${count} bij de laatste waarneming; capaciteit en afwerking staan in de tabel op deze pagina.`,
    storeStockNo: (other: { pro: string; proMax: string } | null) => `Niet bij de laatste waarneming${other ? `; wel in het schap, in aantal uitvoeringen: iPhone 18 Pro ${other.pro}, 18 Pro Max ${other.proMax}` : `; ook de 18 Pro en de 18 Pro Max liggen er niet`}.`,
    hoursQ: (store: string) => `Wanneer is ${store} open?`,
    hoursA: ({ hours, today, address, phone }: { hours: string | null; today: string | null; address: string; phone: string | null }) =>
      `Adres: ${address}${phone ? ` (tel. ${phone})` : ""}. Openingstijden: ${hours ?? "zie deze pagina"}${today ? ` · vandaag ${lc(today)}` : ""}.`,
    storeRestockQ: (store: string) => `Hoe vaak keren iPhones terug in het schap bij ${store}?`,
    storeLastsQ: (store: string) => `Hoe lang blijft een rentree bij ${store} in het schap?`,
    storeNearestQ: (store: string) => `Welke andere Apple Stores liggen het dichtst bij ${store}?`,

    placeStockQ: (place: string, model: string) => `In welke winkels in ${place} ligt de ${model} op dit moment in het schap?`,
    placeStockNone: (place: string, model: string) => `Bij de laatste waarneming nergens. Vermeldt een vestiging in ${place} de ${model} weer voor afhalen, dan verschijnt ze hier.`,
    nStores: f({ one: "# vestiging", other: "# vestigingen" }),
    placeStockSome: (count: string, stores: string) => `Bij de laatste waarneming ${count}: ${stores}.`,
    countQ: (place: string) => `Hoeveel Apple Stores telt ${place}?`,
    nAppleStores: f({ one: "# Apple Store", other: "# Apple Stores" }),
    countMany: (count: string, stores: string) => `${count}, onder meer ${stores}.`,
    countOne: (count: string, store: string) => `${count}, namelijk ${store}.`,
    placeRestockQ: (place: string) => `Hoe vaak keren iPhones in ${place} terug in het schap?`,
    placeLastsQ: (place: string) => `Hoe lang blijft een rentree in ${place} in het schap liggen?`,
    placeNearestQ: (place: string) => `Welke Apple Stores buiten ${place} liggen het dichtst bij?`,
  },

  /** Replaced for nl by withShelfContent; kept in the English meaning (no digits). */
  explainer: (kind: Kind, place: string) => {
    const at = kind === "store" ? place : kind === "model" ? "alle Amerikaanse Apple Stores" : `de Apple Stores in ${place}`;
    return [
      "Afhalen loopt via apple.com: bij het afrekenen kies je een uitvoering en een winkel, je betaalt online en haalt in persoon op, vaak dezelfde dag nog. Wat los in het schap ligt en wat providers verkopen, valt daarbuiten.",
      `ShelfSpring legt elke gevolgde uitvoering bij ${at} vast vanuit een gesynchroniseerde voorraadbron; een wijziging komt pas in het logboek na een bevestigende waarneming.`,
      "Elke bevestigde wijziging wordt één regel in het logboek; de rentreegrafieken en het verloop op deze pagina zijn uit die regels opgebouwd.",
    ];
  },
  alertRule: "Een melding hoort bij precies één winkel en één exacte uitvoering; ze volgt op gedetecteerde beschikbaarheid na synchronisatie, dus bevestig de bestelling altijd bij Apple.",

  titles: {
    state: (name: string, duoNow: string, stores: string) => [
      `Apple Stores in ${name}: ${duoNow} van ${stores} ${duoNow === "1" ? "heeft" : "hebben"} nu de iPhone Duo`,
      `Apple Stores in ${name} – iPhone Duo-voorraad live`,
      `Apple Stores in ${name} – iPhone Duo-voorraad`,
      `Apple Stores ${name} – iPhone-voorraad`,
    ],
    city: (city: string, code: string, duoNow: string, stores: string) => [
      `Apple Stores in ${city}, ${code}: ${duoNow} van ${stores} ${duoNow === "1" ? "heeft" : "hebben"} de iPhone Duo`,
      `Apple Stores in ${city}, ${code} – iPhone Duo-voorraad live`,
      `Apple Stores in ${city}, ${code} – iPhone Duo-voorraad`,
      `Apple Stores ${city} – iPhone-voorraad`,
    ],
    store: (name: string, region: string | null) => {
      const r = region ? ` (${region})` : "";
      return [
        `${name}${r}: iPhone-voorraad vandaag, ophalen & openingstijden`,
        `${name}${r}: iPhone-voorraad, ophalen & openingstijden`,
        `${name}${r}: iPhone-voorraad vandaag & openingstijden`,
        `${name}: iPhone-voorraad, ophalen & openingstijden`,
        `${name}: iPhone-voorraad & openingstijden`,
        `${name}: iPhone-voorraad`,
        `${name} – voorraad`,
      ];
    },
    model: (name: string, storesNow: string) => [
      `${name}-voorraad: ${storesNow} Apple Stores hebben hem nu`,
      `${name} ophalen: ${storesNow} Apple Stores hebben hem nu`,
      `${name}: ophaalvoorraad live`,
    ],
  },

  tokens: {
    tooFewToMeasure: "nog niet meetbaar",
    noneLoggedYet: "nog niet in het logboek",
    noneYet: "nog niet vastgelegd",
  },

  pattern: {
    none: (days: string) => `Het logboek van ${days} dagen bevat geen bevestigde rentree.`,
    nConfirmed: f({ one: "# bevestigde rentree", other: "# bevestigde rentrees" }),
    countIn: (count: string, days: string) => `${count} in ${days} dagen`,
    stay: (minutes: string) => `; mediane schaptijd ongeveer ${minutes} min`,
    nDays: f({ one: "# dag", other: "# dagen" }),
    tooFew: (count: string, onDays: string | null, stay: string) => `${count}${onDays ? `, allemaal op ${onDays}` : ""}: te weinig verschillende dagen voor een vast uur${stay}.`,
    usual: (hour: string, weekday: string | null, count: string, stay: string) => `Rentrees vallen meestal rond ${hour} winkeltijd${weekday ? ` (vooral op ${weekday})` : ""}; ${count}${stay}.`,
  },

  regionNouns: {
    state: f({ one: "staat", other: "staten" }),
    province: f({ one: "provincie", other: "provincies" }),
    area: f({ one: "gebied", other: "gebieden" }),
    department: f({ one: "departement", other: "departementen" }),
    prefecture: f({ one: "prefectuur", other: "prefecturen" }),
    emirate: f({ one: "emiraat", other: "emiraten" }),
    canton: f({ one: "kanton", other: "kantons" }),
    region: f({ one: "gewest", other: "gewesten" }),
    county: f({ one: "provincie", other: "provincies" }),
    city: f({ one: "stad", other: "steden" }),
  } as Record<string, Forms>,

  measured: "Over de meting",

  faqTitle: "Vragen die vaak terugkomen",
  breadcrumb: "Paginaspoor",
  keepExploring: "Meer uit het logboek",
  browse: {
    storesByState: "Bladeren per staat",
    allStatesCities: "Elke staat en stad →",
    liveByModel: "Schapstatus per iPhone",
    modelStock: (model: string) => `${model} in het schap`,
    thisPage: "je bent hier",
    restockLog: (short: string) => `Rentreelog ${short}`,
    liveMap: "Kaartbeeld",
    mostStores: "Grootste aantallen winkels",
    allStates: "Elke staat",
    bigCities: "Grotere steden",
    cities: "Steden met een winkel",
    storesBy: (region: string) => `Bladeren per ${region}`,
    allStoresIn: ({ country }: { inName: string; country: string }) => <>Volledige winkellijst, {country} →</>,
    allRegions: (regions: string) => `Volledige lijst van ${regions}`,
  },
  modelCards: "Per model",
  narrative: {
    lastRestock: (config: ReactNode, at: ReactNode, ago: ReactNode) => <>{" "}Laatst genoteerde rentree: {config}{at}, {ago}.</>,
    at: (store: ReactNode) => <> in {store}</>,
  },
  statStrip: {
    inStockNow: "Nu in het schap",
    ofStores: (n: string) => `verspreid over ${n} winkels`,
    stores: "Vestigingen",
    nCities: f({ one: "in # stad", other: "in # steden" }),
    tracked: "in het logboek",
    modelNow: (short: string) => `${short} in het schap`,
    configsInStock: "uitvoeringen in het schap",
    storesWithStock: f({ one: "winkel die hem heeft", other: "winkels die hem hebben" }),
    restocks24h: "Rentrees, etmaal",
    restocksHint: (week: string, month: string, days: string) => `7 d: ${week} · ${days} d: ${month}`,
    sellOuts: (days: string) => `Weer weg (${days} d)`,
    stays: (duration: string) => (/^korter\b/.test(duration) ? `mediane schaptijd ${duration}` : `mediane schaptijd ~${duration}`),
    noPairs: "geen afgeronde cycli",
    lastRestock: "Laatste rentree",
    noneYet: "nog niet genoteerd",
    inLastDays: (days: string) => `binnen ${days} dagen`,
  },
  product: {
    chooseIphone: "Kies een model",
    storage: "Capaciteit",
    color: "Afwerking",
    all: "Elke",
    numbersAre: (unit: ReactNode) => <>Getallen tellen {unit} die hem nu in het schap hebben.</>,
    seen: (ago: ReactNode) => <>genoteerd {ago} · in het schap</>,
    last: (ago: ReactNode) => <>laatst in het schap {ago} · nu weg</>,
    notSeenYet: "nog niet in het schap gezien",
    firstCheckPending: "wacht op eerste waarneming",
    inStock: "In het schap",
    inStockLower: "in het schap",
    none: "uit het schap",
    here: "om de hoek",
    notAvailable: "Uit het schap",
    notCheckedYet: "Nog niet waargenomen",
    availableForPickup: "Klaar voor afhalen",
    since: (ago: ReactNode) => <> · voor het eerst genoteerd {ago}</>,
    lastInStock: (ago: ReactNode) => <>Laatst in het schap {ago}</>,
    neverSeen: "Hier nog niet in het schap genoteerd",
    firstCheckSoon: "Eerste waarneming volgt zo",
    buy: "Bestellen via apple.com",
    checked: (checked: ReactNode, note: ReactNode) => <>Waargenomen {checked} · {note}</>,
    checkNote: CHECK,
  },

  source: (source: ReactNode) => <>Gegevens: {source}</>,
  photoCredit: (link: ReactNode) => <>Beeld: {link}</>,
  sources: "Bronvermelding",
  allUsStores: "de volledige reeks van 269 Amerikaanse Apple Stores",
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>Voorraadregister van ShelfSpring voor {where}: historische gegevens vanaf {since}, cijfers bijgewerkt {asOf}. Meldingen vertrekken pas nadat passende voorraad is gedetecteerd; broncontrole, synchronisatie en bezorging kunnen vertraging geven. De begindatum hoort bij de dataset, niet bij de leeftijd van ShelfSpring.</>,
  live: {
    configsCaption: (stores: ReactNode, model: ReactNode) => <>{model}: hoeveel van de {stores} Apple Stores elke uitvoering in het schap hebben, bij deze waarneming</>,
    storage: "Capaciteit",
    pricesCaption: (model: ReactNode) => <>{model} op apple.com: simlockvrije catalogusprijs vóór belasting, naast de winkels die hem nu tonen</>,
    price: "Catalogusprijs",
    bestColor: "Vaakst getoonde afwerking (winkels)",
    noRestock: (model: string) => `Het logboek heeft nog geen rentree van de ${model}.`,
    clockLabel: (model: string) => `voor de ${model} in alle Amerikaanse winkels`,
    storesWithIt: "Winkels die hem tonen",
    pairsInStock: "Paren winkel–uitvoering in het schap",
    restocksLogged: "Rentrees in het logboek",
    medianTime: "Mediane schaptijd",
    underOneMin: (min: string) => `< ${min}`,
  },

  /** Alt text and captions for the generic photos and the Dutch-speaking countries' place photos (others fall back to English). */
  photos: {
    "apple-store-pickup-counter": { alt: "Ophaalbalie van hout in een Apple Store, met een bordje Pickup erboven", caption: "Aan een afhaalbalie als deze krijg je een afhaalbestelling mee." },
    "phone-map": { alt: "Iemand navigeert op straat met een kaartapp op de smartphone", caption: "Reistijd weegt zwaar wanneer een rentree na een minuut alweer weg is." },
    "phone-card-payment": { alt: "Online afrekenen: een bankkaart in de ene hand, een iPhone in de andere", caption: "Betalen gebeurt online; het toestel haal je in de winkel." },
    "phone-on-box": { alt: "Nieuwe smartphone bovenop de witte verpakking", caption: "Net uitgepakt." },
    "city-map-phone": { alt: "Twee personen bekijken samen een stadskaart op een telefoon", caption: "Uitzoeken hoe je bij de winkel komt." },
    "phone-notification": { alt: "Telefoon in de hand met meldingen op het vergrendelscherm", caption: "Een melding verschijnt op het vergrendelscherm." },
    "apple-store-crowd-inside": { alt: "Volle Apple Store in een winkelcentrum, met een lange rij wachtenden", caption: "Lanceringsweek: wat het schap bereikt, is binnen enkele minuten verdwenen." },
    "apple-store-glass-canopy": { alt: "Apple Store met glazen gevel en houten overkapping in de avond", caption: "Glazen pui, na zonsondergang." },
    "apple-store-night-vancouver": { alt: "Apple Store in Vancouver, 's avonds verlicht", caption: "Avond bij een Apple Store. Een rentree kan op elk uur vallen, maar 's ochtends gebeurt het veel vaker." },
    "phone-hand-camera": { alt: "Hand die een iPhone met drie camera's vasthoudt", caption: "Voor de Pro-modellen wordt aangeschoven." },
    "place-nl-netherlands": { alt: "Amsterdamse grachtenpanden met puntgevels die in het water spiegelen, onder een strakblauwe lucht", caption: "Amsterdam, aan de gracht." },
    "place-nl-north-holland": { alt: "Haarlemse windmolen De Adriaan, gezien vanaf het water van het Spaarne", caption: "Haarlem, met De Adriaan op de oever van het Spaarne." },
    "place-be-belgium": { alt: "De Grote Markt in Brussel met stadhuis en gildehuizen, bij zonsondergang", caption: "Brussel, Grote Markt, zonsondergang." },
  },
};

export const content: Dict["content"] = withShelfContent("nl", baseContent);
