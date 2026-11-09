import { withShelfContent } from "@/lib/seo/localizedCopy";
/**
 * German strings: content — SEO building blocks, the enrich helpers (opening hours, durations, FAQ answers,
 * titles), live {{tokens}}, the return-pattern sentence and photo alt text. Voice: the ShelfSpring observation
 * ledger (Rückkehr, im Regal, Beobachtung, Merkliste, Variante, Kapazität/Finish); the reader is addressed with "du". Arguments arrive written for German
 * (numbers formatted, names in Apple's German form, counts with their noun).
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import type { Forms } from "@/lib/i18n/format";
import { inOrt } from "./util";

const f = (x: Forms): Forms => x;
type Kind = "state" | "city" | "store" | "model";

const baseContent: Dict["content"] = {
  hours: {
    closed: "Ruhetag",
    everyDay: (hours: string) => `Jeden Tag ${hours}`,
    tomorrow: "morgen",
    dayAt: (day: string, time: string) => `${day} ${time}`,
    closedTodayOpens: (next: string) => `Heute zu · wieder offen ${next}`,
    closedToday: "Heute ganztägig zu",
    opensAt: (time: string) => `Ab ${time} geöffnet`,
    openNow: (closes: string) => `Geöffnet bis ${closes}`,
    closedNowOpens: (next: string) => `Gerade zu · wieder offen ${next}`,
    closedNow: "Gerade zu",
  },

  duration: {
    underAMinute: "weniger als eine Minute",
    pair: (a: string, b: string) => `${a} ${b}`,
  },
  listMore: (n: string) => `noch ${n}`,
  nearLine: (place: string, distance: string) => `${place} (${distance})`,

  faq: {
    where: (kind: Kind, place: string) => (kind === "store" ? `bei ${place}` : kind === "model" ? `für das ${place}` : inOrt(place)),
    nRestocks: f({ one: "# bestätigte Rückkehr", other: "# bestätigte Rückkehren" }),
    restockA: ({ count, where, days, week, peak }: { count: string | null; where: string; days: string; week: string; peak: { hour: string; day: string | null } | null }) =>
      `${count == null ? `Die ${days}-Tage-Aufzeichnung enthält keine Rückkehr ${where}` : `Die ${days}-Tage-Aufzeichnung enthält ${count} ${where}, ${week} davon in dieser Woche`}${peak ? `; sie häufen sich um ${peak.hour} Store-Zeit${peak.day ? `, mit ${peak.day} als stärkstem Wochentag` : ""}` : ""}. Einen Lieferkalender veröffentlicht Apple nicht.`,
    lastsNone: (where: string) => `Für eine Messung gibt es ${where} noch zu wenige abgeschlossene Listungen von der Rückkehr bis zur Räumung.`,
    lasts: (days: string, duration: string) => `Mittlere Regalzeit in der ${days}-Tage-Aufzeichnung: etwa ${duration} zwischen einer Rückkehr und der nächsten Räumung.`,
    storeIn: (store: string, line: string) => `${store} · ${line}`,
    nearestA: (stores: string) => `Nächste Alternativen: ${stores}.`,

    modelStockQ: (model: string) => `Wo liegt das ${model} gerade im Regal?`,
    modelStockNone: (model: string) => `Bei der letzten Beobachtung nirgends. Die Liste hier ergänzt sich, sobald ein Apple Store in den USA das ${model} zur Abholung einstellt.`,
    nUsStores: f({ one: "# Apple Store in den USA", other: "# Apple Stores in den USA" }),
    modelStockSome: (count: string) => `In ${count} laut letzter Beobachtung; jeder steht unten mit den Varianten, die er listet.`,
    priceQ: (model: string) => `Was kostet das ${model} bei apple.com?`,
    priceA: (low: string, high: string, storages: string, colors: string) => `Ohne Vertrag liegen die Listenpreise je nach Kapazität (${storages}) zwischen ${low} und ${high}; als Finish gibt es ${colors}.`,
    modelRestockQ: (model: string) => `Wie oft kehrt das ${model} ins Regal zurück?`,
    modelLastsQ: (model: string) => `Wie lange bleibt ein zurückgekehrtes ${model} gelistet?`,
    reserveQ: (model: string) => `Lässt sich ein ${model} vor der Bestellung für mich zurücklegen?`,
    reserveA: "Nicht vor der Bestellung. Erst wenn ein Store die Variante listet und du bei apple.com mit Abholung im Store bestellst, wird sie für dein Abholfenster beiseitegelegt.",

    storeStockQ: (store: string, model: string) => `Liegt das ${model} bei ${store} im Regal?`,
    nConfigs: f({ one: "# Variante", other: "# Varianten" }),
    storeStockYes: (count: string) => `Ja: ${count} bei der letzten Beobachtung. Kapazität und Finish stehen in der Tabelle dieser Seite.`,
    storeStockNo: (other: { pro: string; proMax: string } | null) => `Bei der letzten Beobachtung nicht${other ? `; gelistet sind dort aber ${other.pro} Varianten des iPhone 18 Pro und ${other.proMax} des 18 Pro Max` : ", und auch 18 Pro und 18 Pro Max liegen dort nicht im Regal"}.`,
    hoursQ: (store: string) => `Wann hat ${store} geöffnet?`,
    hoursA: ({ hours, today, address, phone }: { hours: string | null; today: string | null; address: string; phone: string | null }) =>
      `${hours ?? "Die Zeiten stehen auf dieser Seite"}${today ? ` (heute ${today})` : ""}. Adresse: ${address}${phone ? `; Telefon ${phone}` : ""}.`,
    storeRestockQ: (store: string) => `Wie oft kehren iPhones bei ${store} ins Regal zurück?`,
    storeLastsQ: (store: string) => `Wie lange bleiben Rückkehren bei ${store} gelistet?`,
    storeNearestQ: (store: string) => `Welche Apple Stores liegen in der Nähe von ${store}?`,

    placeStockQ: (place: string, model: string) => `Welche Apple Stores ${inOrt(place)} haben das ${model} jetzt im Regal?`,
    placeStockNone: (place: string, model: string) => `Bei der letzten Beobachtung keiner. Sobald ein Store ${inOrt(place)} das ${model} zur Abholung listet, steht er hier.`,
    nStores: f({ one: "# Store", other: "# Stores" }),
    placeStockSome: (count: string, stores: string) => `${count} laut letzter Beobachtung: ${stores}.`,
    countQ: (place: string) => `Wie viele Apple Stores stehen ${inOrt(place)}?`,
    nAppleStores: f({ one: "# Apple Store", other: "# Apple Stores" }),
    countMany: (count: string, stores: string) => `${count}, unter anderem ${stores}.`,
    countOne: (count: string, store: string) => `${count}, nämlich ${store}.`,
    placeRestockQ: (place: string) => `Wie oft kehren iPhones ${inOrt(place)} ins Regal zurück?`,
    placeLastsQ: (place: string) => `Wie lange hält sich der Bestand ${inOrt(place)} nach einer Rückkehr?`,
    placeNearestQ: (place: string) => `Wo liegen die nächsten Apple Stores außerhalb von ${place}?`,
  },

  explainer: (kind: Kind, place: string) => {
    const at = kind === "store" ? `bei ${place}` : kind === "model" ? "in allen Apple Stores der USA" : `in den Apple Stores ${inOrt(place)}`;
    return [
      "Abhol-Listungen gehören zu apple.com: Im Checkout wählst du Variante und Store, bezahlst online und holst persönlich ab, oft am selben Tag. Ware im Laden-Regal und bei Mobilfunkanbietern ist davon getrennt.",
      `ShelfSpring zeichnet jede erfasste Variante ${at} aus einem synchronisierten Bestands-Feed auf; eine Änderung kommt erst nach einer bestätigenden Beobachtung ins Beobachtungsbuch.`,
      "Jede bestätigte Änderung wird zu einem Eintrag, und aus diesen Einträgen entstehen die Rückkehr-Diagramme und der Verlauf hier.",
    ];
  },
  alertRule: "Jede Benachrichtigung gehört zu genau einem Store und einer exakten Variante. Sie folgt einem erkannten Regaleintrag nach der Synchronisierung; die Bestellung selbst bestätigt Apple.",

  titles: {
    state: (name: string, duoNow: string, stores: string) => [
      `Apple Stores ${inOrt(name)}: ${duoNow} von ${stores} haben das iPhone Duo`,
      `Apple Stores ${inOrt(name)}: iPhone-Duo-Verfügbarkeit live`,
      `Apple Stores ${inOrt(name)}: iPhone-Duo-Verfügbarkeit`,
      `Apple Store ${name}: iPhone-Verfügbarkeit`,
    ],
    city: (city: string, code: string, duoNow: string, stores: string) => [
      `Apple Stores in ${city}, ${code}: ${duoNow} von ${stores} haben das iPhone Duo`,
      `Apple Stores in ${city}, ${code}: iPhone-Duo-Verfügbarkeit`,
      `Apple Stores in ${city}: iPhone-Duo-Verfügbarkeit`,
      `Apple Store ${city}: iPhone-Verfügbarkeit`,
    ],
    store: (name: string, region: string | null) => {
      const r = region ? ` (${region})` : "";
      return [
        `${name}${r}: iPhone-Verfügbarkeit heute & Öffnungszeiten`,
        `${name}${r}: iPhone-Verfügbarkeit & Öffnungszeiten`,
        `${name}${r}: iPhone-Bestand & Öffnungszeiten`,
        `${name}${r}: iPhone-Verfügbarkeit heute`,
        `${name}${r}: iPhone-Bestand heute`,
        `${name}${r}: iPhone-Bestand`,
        `${name}: iPhone-Verfügbarkeit & Öffnungszeiten`,
        `${name}: iPhone-Verfügbarkeit heute`,
        `${name}: iPhone-Verfügbarkeit`,
        `${name} – Verfügbarkeit`,
      ];
    },
    model: (name: string, storesNow: string) => [
      `${name} zur Abholung: ${storesNow} Apple Stores haben es gerade`,
      `${name}: in ${storesNow} Apple Stores gerade verfügbar`,
      `${name}: Abhol-Verfügbarkeit live`,
    ],
  },

  tokens: {
    tooFewToMeasure: "noch nicht messbar",
    noneLoggedYet: "noch nicht im Beobachtungsbuch",
    noneYet: "noch nicht verzeichnet",
  },

  pattern: {
    none: (days: string) => `Die ${days}-Tage-Aufzeichnung enthält keine bestätigte Rückkehr.`,
    nConfirmed: f({ one: "# bestätigte Rückkehr", other: "# bestätigte Rückkehren" }),
    countIn: (count: string, days: string) => `${count} in ${days} Tagen`,
    stay: (minutes: string) => `; mittlere Listung etwa ${minutes} Min.`,
    nDays: f({ one: "# Tag", other: "# Tagen" }),
    tooFew: (count: string, onDays: string | null, stay: string) => `${count}${onDays ? `, alle an ${onDays}` : ""}: zu wenige verschiedene Tage für eine typische Stunde${stay}.`,
    usual: (hour: string, weekday: string | null, count: string, stay: string) => `Rückkehren häufen sich um ${hour} Store-Zeit${weekday ? `, meist an einem ${weekday}` : ""}; ${count}${stay}.`,
  },

  regionNouns: {
    state: f({ one: "Bundesland", other: "Bundesländer" }),
    province: f({ one: "Provinz", other: "Provinzen" }),
    area: f({ one: "Region", other: "Regionen" }),
    department: f({ one: "Département", other: "Départements" }),
    prefecture: f({ one: "Präfektur", other: "Präfekturen" }),
    emirate: f({ one: "Emirat", other: "Emirate" }),
    canton: f({ one: "Kanton", other: "Kantone" }),
    region: f({ one: "Region", other: "Regionen" }),
    county: f({ one: "Provinz", other: "Provinzen" }),
    city: f({ one: "Stadt", other: "Städte" }),
  } as Record<string, Forms>,

  measured: "Zur Methode",

  faqTitle: "Fragen aus dem Feld",
  breadcrumb: "Seitenpfad",
  keepExploring: "Mehr aus dem Beobachtungsbuch",
  browse: {
    storesByState: "Bundesstaaten im Überblick",
    allStatesCities: "Jeder Bundesstaat, jede Stadt →",
    liveByModel: "Regalstand je iPhone",
    modelStock: (model: string) => `${model} im Regal`,
    thisPage: "du bist hier",
    restockLog: (short: string) => `Rückkehr-Logbuch · ${short}`,
    liveMap: "Abhol-Atlas",
    mostStores: "Größte Store-Zahl",
    allStates: "Jeder Bundesstaat",
    bigCities: "Wichtige Städte",
    cities: "Städte mit Store",
    storesBy: (region: string) => `Übersicht je ${region}`,
    allStoresIn: ({ country }: { inName: string; country: string }) => <>Vollständige Store-Liste {inOrt(country)} →</>,
    allRegions: (regions: string) => `Vollständige Liste: ${regions}`,
  },
  modelCards: "Je Modell",
  narrative: {
    lastRestock: (config: ReactNode, at: ReactNode, ago: ReactNode) => <>{" "}Zuletzt verzeichnete Rückkehr: {config}{at}, {ago}.</>,
    at: (store: ReactNode) => <> bei {store}</>,
  },
  statStrip: {
    inStockNow: "Jetzt im Regal",
    ofStores: (n: string) => `über ${n} Stores`,
    stores: "Standorte",
    nCities: f({ one: "in # Stadt", other: "in # Städten" }),
    tracked: "im Beobachtungsbuch",
    modelNow: (short: string) => `${short} im Regal`,
    configsInStock: "Varianten im Regal",
    storesWithStock: f({ one: "Store listet es", other: "Stores listen es" }),
    restocks24h: "Rückkehren, 24 Std.",
    restocksHint: (week: string, month: string, days: string) => `7 Tg.: ${week} · ${days} Tg.: ${month}`,
    sellOuts: (days: string) => `Wieder weg (${days} Tg.)`,
    stays: (duration: string) => (/^weniger\b/.test(duration) ? `Regalzeit im Median: ${duration}` : `Regalzeit im Median ~${duration}`),
    noPairs: "keine abgeschlossenen Paare",
    lastRestock: "Letzte Rückkehr",
    noneYet: "noch nicht verzeichnet",
    inLastDays: (days: string) => `innerhalb von ${days} Tagen`,
  },
  product: {
    chooseIphone: "Modell wählen",
    storage: "Kapazität",
    color: "Finish",
    all: "Beliebig",
    numbersAre: (unit: ReactNode) => <>Jede Zahl zählt {unit}, die es gerade im Regal haben.</>,
    seen: (ago: ReactNode) => <>verzeichnet {ago} · im Regal</>,
    last: (ago: ReactNode) => <>zuletzt im Regal {ago} · jetzt weg</>,
    notSeenYet: "noch nie im Regal verzeichnet",
    firstCheckPending: "erste Beobachtung steht aus",
    inStock: "Im Regal",
    inStockLower: "im Regal",
    none: "nicht im Regal",
    here: "genau hier",
    notAvailable: "Nicht im Regal",
    notCheckedYet: "Noch keine Beobachtung",
    availableForPickup: "Zur Abholung gelistet",
    since: (ago: ReactNode) => <> · zuerst verzeichnet {ago}</>,
    lastInStock: (ago: ReactNode) => <>Zuletzt im Regal {ago}</>,
    neverSeen: "In diesem Regal noch nie verzeichnet",
    firstCheckSoon: "Erste Beobachtung folgt in Kürze",
    buy: "Über apple.com bestellen",
    checked: (checked: ReactNode, note: ReactNode) => <>Beobachtet {checked} · {note}</>,
    checkNote: "laufende Bestandsaktualisierungen",
  },

  source: (source: ReactNode) => <>Daten: {source}</>,
  photoCredit: (link: ReactNode) => <>Bild: {link}</>,
  sources: "Nachweise",
  allUsStores: "sämtliche 269 Apple Stores in den USA",
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>Bestandsdaten bei ShelfSpring für {where}: historischer Zeitraum ab {since}; Zahlen aktualisiert am {asOf}. Benachrichtigungen folgen erkannten Regaleinträgen; Quellabgleich, Synchronisierung und Zustellung können sie verzögern. Der Beginn des Datenbestands ist kein Gründungsdatum von ShelfSpring.</>,
  live: {
    configsCaption: (stores: ReactNode, model: ReactNode) => <>{model}: wie viele der {stores} Apple Stores jede Variante bei dieser Beobachtung listen</>,
    storage: "Kapazität",
    pricesCaption: (model: ReactNode) => <>{model} bei apple.com: Listenpreis ohne Vertrag vor Steuern, daneben die Stores, die es gerade listen</>,
    price: "Listenpreis",
    bestColor: "Meistgelistetes Finish (Stores)",
    noRestock: (model: string) => `Für das ${model} enthält das Beobachtungsbuch noch keine Rückkehr.`,
    clockLabel: (model: string) => `in den US-Stores für das ${model}`,
    storesWithIt: "Stores, die es listen",
    pairsInStock: "Store-Varianten-Paare im Regal",
    restocksLogged: "Rückkehren im Beobachtungsbuch",
    medianTime: "Regalzeit im Median",
    underOneMin: (min: string) => `< ${min}`,
  },

  photos: {
    "apple-store-pickup-counter": { alt: "Abholschild über einer Holztheke im Apple Store", caption: "An Theken wie dieser gehen Abholbestellungen über den Tresen." },
    "phone-map": { alt: "Smartphone mit geöffneter Karten-App in zwei Händen, draußen", caption: "Wenn eine Rückkehr nur eine Minute im Regal bleibt, entscheidet der Weg zum Store." },
    "phone-card-payment": { alt: "Frau mit iPhone und Kreditkarte beim Bezahlen im Netz", caption: "Bezahlt wird online, abgeholt im Store." },
    "phone-on-box": { alt: "Neues Smartphone, das auf seinem weißen Karton liegt", caption: "Frisch ausgepackt." },
    "city-map-phone": { alt: "Zwei Menschen mit einem Stadtplan auf dem Handy", caption: "Die Route zum Store vorab festlegen." },
    "phone-notification": { alt: "Handy mit Mitteilungen auf dem Sperrbildschirm in einer Hand", caption: "So landet eine Benachrichtigung auf dem Sperrbildschirm." },
    "apple-store-crowd-inside": { alt: "Voller Apple Store in einem Einkaufszentrum, dicht gedrängte Menschen", caption: "Launch-Woche: Was ins Regal zurückkehrt, ist nach Minuten wieder weg." },
    "apple-store-glass-canopy": { alt: "Apple Store mit Glasfront und hölzernem Vordach, nachts", caption: "Die Glasfront eines Apple Store nach Sonnenuntergang." },
    "apple-store-night-vancouver": { alt: "Beleuchteter Apple Store in Vancouver bei Nacht", caption: "Abhol-Listungen kehren zu jeder Stunde zurück, vormittags aber deutlich öfter als abends." },
    "phone-hand-camera": { alt: "iPhone mit Dreifachkamera in einer Hand", caption: "Die Pro-Modelle ziehen die längsten Schlangen an." },
    "place-at-vienna": { alt: "Stephansdom über den Wiener Dächern, blauer Himmel", caption: "Wien: Altstadt mit Stephansdom." },
    "place-ch-geneva": { alt: "Jet d’Eau im Genfersee aus der Luft, dahinter Stadt und Berge", caption: "Genf: der Jet d’Eau im See." },
    "place-ch-zurich": { alt: "Grossmünster mit seinen Doppeltürmen über der Limmat, Zürcher Altstadt", caption: "Zürich: Limmat und Grossmünster." },
    "place-de-bavaria": { alt: "Neuschwanstein über grünem Wald im Allgäu", caption: "Bayern: Schloss Neuschwanstein bei Schwangau." },
    "place-de-berlin": { alt: "Berliner Dom, dahinter der Fernsehturm", caption: "Berlin: Dom und Fernsehturm." },
    "place-de-brandenburg-gate": { alt: "Brandenburger Tor in Berlin bei klarem Himmel", caption: "Berlin: das Brandenburger Tor." },
    "place-de-cologne": { alt: "Hohenzollernbrücke über dem Rhein, dahinter der Kölner Dom in der Sonne", caption: "Köln: Dom und Hohenzollernbrücke." },
    "place-de-hamburg": { alt: "Elbphilharmonie über dem Hafen, davor eine Hafenfähre", caption: "Hamburg: die Elbphilharmonie am Hafen." },
    "place-de-hesse": { alt: "Hochhäuser am Main in Frankfurt unter schweren Wolken", caption: "Hessen: Frankfurt am Main." },
    "place-de-munich": { alt: "Marienplatz, Neues Rathaus und Frauenkirche in München von oben", caption: "München: Marienplatz und Frauenkirche." },
    "place-de-north-rhine-westphalia": { alt: "Düsseldorfer MedienHafen mit dem Rheinturm am Rhein", caption: "Nordrhein-Westfalen: Rheinturm und MedienHafen in Düsseldorf." },
  },
};

export const content: Dict["content"] = withShelfContent("de", baseContent);
