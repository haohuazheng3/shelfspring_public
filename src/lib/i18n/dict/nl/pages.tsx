import { withShelfPages } from "@/lib/seo/localizedCopy";
/**
 * Dutch strings: pages — the home board and the region, city and store pages of the Dutch versions (/nl-nl, /nl-be).
 * Place names arrive in Dutch. Labels handed to the restock modules ("in Noord-Holland", "bij Apple Haarlem", "hier")
 * fit the Dutch module sentences (modules.tsx).
 */
import type { CountryCode } from "@/lib/apple/countries";
import { COUNTRIES } from "@/lib/apple/countries";
import { num } from "@/lib/i18n/format";
import { countryLabel } from "@/lib/i18n/places";
import type { Dict } from "../en";

const L = "nl" as const;
const n$ = (v: number) => num(L, v);
const ARTICLE: Partial<Record<CountryCode, string>> = { us: "de ", uk: "het ", ae: "de " };
/** "in Nederland", "in de Verenigde Staten". */
const inC = (cc: CountryCode) => `in ${ARTICLE[cc] ?? ""}${countryLabel(cc, L)}`;
const NOUN: Record<string, string> = { state: "staat", province: "provincie", area: "gebied", department: "departement", prefecture: "prefectuur", emirate: "emiraat", canton: "kanton", region: "gewest", county: "provincie", city: "stad" };
const NOUNS: Record<string, string> = { state: "staten", province: "provincies", area: "gebieden", department: "departementen", prefecture: "prefecturen", emirate: "emiraten", canton: "kantons", region: "gewesten", county: "provincies", city: "steden" };
/** The cadence note (CHECK_NOTE's idea; only the wrappers' replacements of it are rendered). */
const CHECK = "frequent bijgewerkte schapgegevens";
/** The store as Dutch speakers name a store called after its city ("Brussels" → "Brussel"). */
const SAID: Record<string, string> = { Brussels: "Brussel", "The Hague": "Den Haag" };
/** Region words that take "elk" (het-woorden) rather than "elke". */
const HET = new Set(["gewest", "gebied", "kanton", "departement", "emiraat"]);

const basePages: Dict["pages"] = {
  common: {
    checkNote: CHECK,
    appleStores: "Winkelregister",
    showOnMap: "Op de atlas tonen",
    restockLogs: "Rentreelogs",
    fullLog: "Het volledige register openen →",
    restocksBy: "Rentrees per uitvoering",
    lastDays: (days: number) => `Rentreekalender · ${n$(days)} dagen`,
    nearbyCities: "Andere steden op rijafstand",
    neighboringStates: "Buurstaten",
    acrossStateLine: "Net voorbij de staatsgrens",
    allUsRestocks: "Elke genoteerde rentree in de VS",
    allRestocksIn: (cc: CountryCode) => `Elke genoteerde rentree ${inC(cc)}`,
    regionRestocks: (place: string) => `Rentreeregister · ${place}`,
    onTheMap: (place: string) => `Kaartbeeld van ${place}`,
    allOf: (place: string) => `Overzicht van ${place}`,
    allOfArrow: (place: string) => `Het hele register van ${place} →`,
    storeAndCity: (store: string, city: string) => `${city} · ${store}`,
    appleStorePage: (store: string) => `Vermelding van ${/^apple\b/i.test(store) ? store : `Apple ${store}`} op apple.com`,
    sourcesWhere: (n: number, cc: CountryCode) => `${n$(n)} waargenomen ${n === 1 ? "Apple Store" : "Apple Stores"} ${inC(cc)}`,
    inPlace: (place: string) => `in ${place}`,
    atPlace: (place: string) => `bij ${place}`,
    here: "hier",
    storesWithIt: "winkels die hem tonen",
    whenRestock: (place: string) => `Rentreetijden in ${place}`,
    duoHours: (place: string) => `Klokuren van genoteerde Duo-rentrees · ${place}`,
    howFast: (place: string) => `Hoe lang uitvoeringen in ${place} in het schap bleven`,
    latestIn: (place: string) => `${place}: nieuwste regels in het register`,
    noneIn: (place: string) => `Voor ${place} is nog niets genoteerd.`,
    faqTitle: (place: string) => `Vragen uit het veld · ${place}`,
    itemList: (place: string) => `Apple Stores in ${place}`,
    alertIn: (place: string) => `Winkels in ${place} volgen`,
    panelPick: (place: string) => `Volglijst voor ${place}: eerst de toestellen, dan alleen de winkels die je echt haalt`,
    matrixH2: "Voorraad per winkel en model",
    matrixHint: "In het schap / gevolgd, per model.",
    matrixLabel: "Schap per winkel",
    cityPage: "Stadsoverzicht ↗",
    storePage: "Winkeloverzicht ↗",
    since: "2 november 2026",
  },
  home: {
    storesWith: (short: string) => `winkels die de ${short} tonen`,
    restocks24: "rentrees, laatste etmaal",
    week: (n: number) => ` · week: ${n$(n)}`,
    lastCheck: "laatste waarneming",
    more: (n: number) => `+${n$(n)} extra`,
    latest: (short: string) => `Recentste ${short}-rentrees in het register`,
    none: (short: string) => `Nog geen ${short}-rentree genoteerd.`,
    allRestocks: "Volledig rentreeregister",
    modelMap: (short: string) => `Kaart: ${short}`,
    buy: "Bestellen via apple.com",
    liveStock: (short: string) => `${short}-schap vandaag`,
    live: "Actueel",
    alsoTracking: "Ook in het logboek:",
    liveMap: "Afhaalkaart",
    allStores: "Winkelregister",
    questions: "Vragen uit het veld",
  },
  region: {
    counts: (stores: number, cities: number) => `${n$(cities)} ${cities === 1 ? "stad" : "steden"} · ${n$(stores)} Apple Stores · waargenomen: ${CHECK}`,
    nearbyOutside: (place: string) => `Dichtste winkels voorbij de grens van ${place}`,
    nearbyHint: (place: string) => `Afstanden gemeten vanaf het zwaartepunt van de winkels in ${place}.`,
    beyond: (place: string) => `Voorbij ${place}`,
    everyStore: (place: string) => `Winkellijst ${place}`,
    nearestRegions: (cc: CountryCode) => `Naburige ${NOUNS[COUNTRIES[cc].regionNoun ?? "area"] ?? "gebieden"} ${inC(cc)}`,
  },
  city: {
    counts: (stores: number) => `${n$(stores)} Apple Stores · waargenomen: ${CHECK}`,
    storeHeading: (name: string) => `Apple ${name}`,
    details: "Adressen en openingstijden",
    outside: (place: string) => `Dichtste winkels voorbij ${place}`,
    outsideRegion: (region: string) => `Net buiten ${region}`,
    around: (place: string) => `${place} en omgeving`,
    otherCities: (region: string) => `Verdere steden in ${region}`,
  },
  store: {
    description: (a: { place: string; street: string; city: string; where: string; duo: number; pro: number; pm: number }) => [
      `${a.place}, ${a.street}, ${a.city}: schap voor afhalen (uitvoeringen: iPhone Duo ${n$(a.duo)}, 18 Pro ${n$(a.pro)}, Pro Max ${n$(a.pm)}), uren van vandaag, rentree-uren en vestigingen dichtbij.`,
      `${a.place}, ${a.where}: in het schap voor afhalen (Duo ${n$(a.duo)} · 18 Pro ${n$(a.pro)} · Pro Max ${n$(a.pm)}), uren en rentree-uren.`,
      `${a.place}, ${a.city}: schap (Duo ${n$(a.duo)} · 18 Pro ${n$(a.pro)} · Pro Max ${n$(a.pm)}), uren en rentrees.`,
    ],
    where: (city: string, cc: CountryCode) => `${city}, ${countryLabel(cc, L)}`,
    taxQ: (place: string) => `Wat kost een iPhone Duo bij ${place} met alle belastingen erbij?`,
    pickupQ: (place: string) => `Werkt online bestellen en afhalen bij ${place}?`,
    pickupA: (place: string) => `Ja. Kies bij het afrekenen "Ik haal het op" met ${place} als winkel en vertrek pas na Apples bericht dat alles klaarligt. Breng je bestelnummer, een officieel identiteitsbewijs met foto en de actuele QR-code of Wallet-pas mee; een schermafbeelding volstaat niet.`,
    storeWord: (name: string) => {
      const bare = name.replace(/^apple\s*/i, "");
      return `Apple Store ${SAID[bare] ?? bare}`;
    },
    hoursH2: (storeWord: string) => `${storeWord} · openingstijden, adres, afhalen`,
    hoursLead: (place: string, address: string, phone: string | undefined, today: string, week: string) => `${place} vind je op ${address}${phone ? ` (tel. ${phone})` : ""}. Vandaag: ${today}. Weekoverzicht: ${week}.`,
    pickupRules: (helpUrl: string) => [
      `**Pas vertrekken na Apples klaar-bericht**, niet eerder ([Apples afhaalregels](${helpUrl}))`,
      "**Aan de balie:** bestelnummer · officieel identiteitsbewijs met foto · de actuele QR-code of Wallet-pas",
      "**Geweigerd:** een schermafbeelding van de code",
      "**Stuur je iemand anders?** Geef die persoon bij het afrekenen op als ophaler",
    ],
    directions: (place: string, dirUrl: string, appleUrl?: string) => `[Routebeschrijving naar ${place}](${dirUrl})${appleUrl ? ` · [Apples eigen pagina over deze winkel](${appleUrl})` : ""}`,
    onlyH2: (where: string, place: string) => `Eén Apple Store voor ${where}: ${place}`,
    onlyInCountry: (place: string, cc: CountryCode) => `Wie ${inC(cc)} in een Apple Store wil afhalen, komt altijd bij ${place} uit: een tweede winkel is er niet. Toont deze winkel een uitvoering niet, dan kun je nergens anders heen, en is een melding voor precies die uitvoering het enige wat werkt.${cc === "be" ? " Ook vanuit Antwerpen (in vogelvlucht ongeveer 45 km) en Gent (ongeveer 50 km) is dit de dichtste vestiging." : ""}`,
    onlyInCity: (city: string, place: string, backups: string) => `${city} telt één Apple Store: ${place}.${backups ? ` Wie verder wil kijken, komt het eerst uit bij ${backups}.` : ""}`,
    backup: (apple: string, city: string, dist: string) => `${apple}, ${city} (${dist})`,
    onlyBlockCountry: (place: string) => `Een melding geldt voor één winkel en één precieze uitvoering; ze vertrekt zodra ${place} die weer voor afhalen vermeldt.`,
    onlyBlock: (place: string) => `Ontbreekt jouw uitvoering bij ${place}, zet dan ook deze uitwijkwinkels op je volglijst. Een melding geldt voor één winkel en één precieze uitvoering, en vertrekt zodra die winkel haar weer vermeldt.`,
    intro: (a: { place: string; street: string; duo: number; duoOf: number; pro: number; proOf: number; pm: number; pmOf: number; peak: string | null }) => (
      <>{a.place}{a.street ? ` (${a.street})` : ""}, in het schap voor afhalen: iPhone Duo <b className="text-ink">{n$(a.duo)}/{n$(a.duoOf)}</b> · iPhone 18 Pro <b className="text-ink">{n$(a.pro)}/{n$(a.proOf)}</b> · iPhone 18 Pro Max <b className="text-ink">{n$(a.pm)}/{n$(a.pmOf)}</b> uitvoeringen.{a.peak ? <> Gebruikelijk rentree-uur: <b className="text-ink">{a.peak}</b> winkeltijd.</> : null}</>
    ),
    restocks30: (n: number) => `${n$(n)} genoteerde rentrees in 30 dagen`,
    lookupOff: "Apple geeft voor deze winkel op dit moment geen afhaalinformatie vrij. Het logboek vraagt het om het halfuur opnieuw en vult het schap in zodra er antwoord komt.",
    checked: "Waargenomen",
    alertHere: (short: string) => `${short} volgen in deze winkel`,
    panel: (name: string) => `Volglijst voor Apple ${SAID[name] ?? name}: kies de toestellen, laat deze winkel aangevinkt en voeg reservewinkels toe die je kunt halen`,
    configsInStock: "uitvoeringen in het schap",
    stockNowH2: "Nu in het schap",
    whenRestock: (name: string) => `Rentreetijden bij ${name}`,
    duoHours: (name: string) => `Klokuren van genoteerde Duo-rentrees · ${name}`,
    howFast: (name: string) => `Hoe lang uitvoeringen bij ${name} in het schap bleven`,
    history: "Verloop in het logboek",
    historyEmpty: "Voor deze winkel is nog geen rentree genoteerd, en ook nog geen moment waarop iets uit het schap ging.",
    nearby: "Reservewinkels",
    elsewhereIn: (region: string) => `Meer uit ${region}`,
    faqTitle: (place: string) => `Vragen uit het veld · ${place}`,
    applePage: (place: string) => `${place} op apple.com: openingstijden en sessies`,
    sourcesWhere: (n: number, cc: CountryCode) => `${n$(n)} ${n === 1 ? "Apple Store" : "Apple Stores"} ${inC(cc)}`,
    around: (place: string) => `Voorbij ${place}`,
    otherInCity: (city: string) => `${city}: andere winkels in de stad`,
    cityPage: (city: string) => `Overzicht van ${city}`,
    moreIn: (region: string) => `Verdere winkels in ${region}`,
    everyIn: (cc: CountryCode) => `De rest van het register ${inC(cc)}`,
    allIn: (cc: CountryCode) => `Volledig winkelregister ${inC(cc)}`,
    countryHome: (cc: CountryCode) => `Overzicht ${countryLabel(cc, L)}`,
    footnote: "De schapstatus komt uit de afhaalantwoorden van apple.com, zoals die luidden bij de laatste waarneming.",
    footnoteIntl: (cc: CountryCode, regionWord: string) => {
      const w = NOUN[regionWord] ?? regionWord;
      return ` Bedragen staan in ${COUNTRIES[cc].currency === "EUR" ? "euro" : COUNTRIES[cc].currency}, afstanden in ${COUNTRIES[cc].unit === "mi" ? "mijl" : "kilometer"}. Dit logboek staat los van ${HET.has(w) ? "elk" : "elke"} ${w} en van elke winkelketen.`;
    },
  },
};

export const pages: Dict["pages"] = withShelfPages("nl", basePages);
