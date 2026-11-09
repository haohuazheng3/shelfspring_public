import { withShelfContent } from "@/lib/seo/localizedCopy";
/**
 * Italian strings: content — SEO building blocks, the enrich helpers (hours, durations, FAQ answers, titles),
 * live {{tokens}}, the restock-pattern sentence and photo alt text. Arguments arrive already in Italian.
 * Voice: an observation ledger ("rientro" for a restock, "a scaffale" / "fuori scaffale" for the status).
 */
import type { ReactNode } from "react";
import type { Forms } from "@/lib/i18n/format";
import type { Dict } from "../en";
import { ad, aLuogo, cap, inNome, nounForms } from "./util";

const f = (x: Forms): Forms => x;
type Kind = "state" | "city" | "store" | "model";
/** "il martedì" / "la domenica". */
const ilDay = (d: string) => (/^domenic/i.test(d) ? `la ${d}` : `il ${d}`);
/** "alle 9:00" / "all'1:00". */
const alleH = (t: string) => (/^0?1[:.]/.test(t) ? `all'${t}` : `alle ${t}`);

const baseContent: Dict["content"] = {
  hours: {
    closed: "chiuso",
    everyDay: (hours: string) => `Ogni giorno ${hours}`,
    tomorrow: "domani",
    dayAt: (day: string, time: string) => `${day}, ${time}`,
    closedTodayOpens: (next: string) => `Oggi chiuso · riapertura ${next}`,
    closedToday: "Chiuso per tutta la giornata",
    opensAt: (time: string) => `Le porte aprono ${alleH(time)}`,
    openNow: (closes: string) => `Aperto fino ${alleH(closes)}`,
    closedNowOpens: (next: string) => `Chiuso in questo momento · riapertura ${next}`,
    closedNow: "Chiuso in questo momento",
  },

  duration: {
    underAMinute: "sotto il minuto",
    pair: (a: string, b: string) => `${a} ${b}`,
  },
  listMore: (n: string) => `${n} in più`,
  nearLine: (place: string, distance: string) => `${place} (${distance})`,

  faq: {
    where: (kind: Kind, place: string) => (kind === "store" ? `presso ${place}` : kind === "model" ? `per l'${place}` : aLuogo(place)),
    nRestocks: f({ one: "# rientro confermato", other: "# rientri confermati" }),
    restockA: ({ count, where, days, week, peak }: { count: string | null; where: string; days: string; week: string; peak: { hour: string; day: string | null } | null }) =>
      `${count == null ? `Il registro di ${days} giorni non contiene rientri ${where}` : `Il registro di ${days} giorni contiene ${count} ${where}, di cui ${week} in questa settimana`}${peak ? `; si concentrano attorno ${alleH(peak.hour)}, ora locale${peak.day ? `, e il giorno più fitto è ${ilDay(peak.day)}` : ""}` : ""}. Apple non pubblica alcun calendario delle consegne.`,
    lastsNone: (where: string) => `Non ci sono ancora abbastanza passaggi completi dal rientro all'esaurimento ${where} per misurarlo.`,
    lasts: (days: string, duration: string) => `Tempo mediano a scaffale nel registro di ${days} giorni: circa ${duration} fra un rientro e l'esaurimento successivo.`,
    storeIn: (store: string, line: string) => `${store} · ${line}`,
    nearestA: (stores: string) => `Le alternative più vicine: ${stores}.`,

    modelStockQ: (model: string) => `Dove si trova a scaffale l'${model} in questo momento?`,
    modelStockNone: (model: string) => `Da nessuna parte nell'ultima osservazione; l'elenco si aggiorna non appena un Apple Store USA mette l'${model} in vendita con ritiro.`,
    nUsStores: f({ one: "# Apple Store USA", other: "# Apple Store USA" }),
    modelStockSome: (count: string) => `In ${count} nell'ultima osservazione; qui sotto ognuno è nominato con le configurazioni che espone.`,
    priceQ: (model: string) => `Che prezzo ha l'${model} su apple.com?`,
    priceA: (low: string, high: string, storages: string, colors: string) => `Il listino da sbloccato va da ${low} a ${high} secondo la capacità (${storages}); le finiture sono ${colors}.`,
    modelRestockQ: (model: string) => `Con che frequenza l'${model} torna a scaffale?`,
    modelLastsQ: (model: string) => `Quanto resta in elenco un ${model} rientrato?`,
    reserveQ: (model: string) => `Si può far mettere da parte un ${model} prima di ordinarlo?`,
    reserveA: "Non prima dell'ordine: quando un negozio espone la configurazione si fa un ordine su apple.com con ritiro in negozio, e solo a quel punto il telefono viene accantonato per la tua finestra di ritiro.",

    storeStockQ: (store: string, model: string) => `L'${model} è a scaffale presso ${store}?`,
    nConfigs: f({ one: "# configurazione", other: "# configurazioni" }),
    storeStockYes: (count: string) => `Sì: ${count} nell'ultima osservazione, con capacità e finitura nella tabella di questa pagina.`,
    storeStockNo: (other: { pro: string; proMax: string } | null) => `Non nell'ultima osservazione${other ? `; il negozio espone però ${other.pro} configurazioni di iPhone 18 Pro e ${other.proMax} di 18 Pro Max` : ", e anche 18 Pro e 18 Pro Max sono fuori scaffale"}.`,
    hoursQ: (store: string) => `Che orari fa ${store}?`,
    hoursA: ({ hours, today, address, phone }: { hours: string | null; today: string | null; address: string; phone: string | null }) =>
      `${hours ? cap(hours) : "Gli orari sono riportati in questa pagina"}${today ? ` (oggi ${today})` : ""}, all'indirizzo ${address}${phone ? `; telefono ${phone}` : ""}.`,
    storeRestockQ: (store: string) => `Con che frequenza gli iPhone tornano a scaffale presso ${store}?`,
    storeLastsQ: (store: string) => `Quanto restano in elenco i rientri presso ${store}?`,
    storeNearestQ: (store: string) => `Quali altri Apple Store sono i più vicini ${ad(store)}?`,

    placeStockQ: (place: string, model: string) => `${cap(aLuogo(place))}, in quali Apple Store è a scaffale l'${model} adesso?`,
    placeStockNone: (place: string, model: string) => `Nessuno nell'ultima osservazione; appena un negozio ${aLuogo(place)} espone l'${model} per il ritiro, compare qui.`,
    nStores: f({ one: "# negozio", other: "# negozi" }),
    placeStockSome: (count: string, stores: string) => `${count} nell'ultima osservazione: ${stores}.`,
    countQ: (place: string) => `${cap(aLuogo(place))}, quanti sono gli Apple Store?`,
    nAppleStores: f({ one: "# Apple Store", other: "# Apple Store" }),
    countMany: (count: string, stores: string) => `${count}; fra questi ${stores}.`,
    countOne: (count: string, store: string) => `${count}, cioè ${store}.`,
    placeRestockQ: (place: string) => `Con che frequenza gli iPhone tornano a scaffale ${aLuogo(place)}?`,
    placeLastsQ: (place: string) => `Dopo un rientro ${aLuogo(place)}, quanto durano le scorte?`,
    placeNearestQ: (place: string) => `Quali Apple Store fuori da ${place} sono i più vicini?`,
  },

  explainer: (kind: Kind, place: string) => {
    const at = kind === "store" ? `presso ${place}` : kind === "model" ? "in ogni Apple Store USA" : `negli Apple Store ${aLuogo(place)}`;
    return [
      "Le voci con ritiro appartengono ad apple.com: al pagamento si sceglie una configurazione e un negozio, si paga online e si ritira di persona, spesso in giornata. La merce sugli scaffali fisici e quella degli operatori sono un'altra cosa.",
      `ShelfSpring annota ogni configurazione seguita ${at} a partire da un flusso di scorte sincronizzato; un cambiamento entra nel registro solo dopo un'osservazione di conferma.`,
      "Ogni cambiamento confermato diventa una voce del registro, e da quelle voci nascono i grafici dei rientri e lo storico di questa pagina.",
    ];
  },
  alertRule: "Ogni notifica è legata a un solo negozio e a una sola configurazione esatta; parte dopo la sincronizzazione, quando la disponibilità viene rilevata, e l'ordine va confermato con Apple.",

  titles: {
    state: (name: string, duoNow: string, stores: string) => [
      `Apple Store ${name}: ${duoNow} su ${stores} ${duoNow === "1" ? "ha" : "hanno"} l'iPhone Duo ora`,
      `Apple Store ${name}: disponibilità iPhone Duo per il ritiro`,
      `Apple Store ${name}: disponibilità iPhone Duo`,
      `Apple Store ${name}: disponibilità iPhone`,
    ],
    city: (city: string, code: string, duoNow: string, stores: string) => [
      `Apple Store ${city} (${code}): ${duoNow} su ${stores} ${duoNow === "1" ? "ha" : "hanno"} l'iPhone Duo`,
      `Apple Store ${city} (${code}): disponibilità iPhone Duo per il ritiro`,
      `Apple Store ${city} (${code}): disponibilità iPhone Duo`,
      `Apple Store ${city}: disponibilità iPhone`,
    ],
    store: (name: string, region: string | null) => {
      const r = region ? ` (${region})` : "";
      return [
        `${name}${r}: disponibilità iPhone oggi, ritiro e orari`,
        `${name}${r}: disponibilità iPhone oggi e orari`,
        `${name}${r}: disponibilità iPhone e orari`,
        `${name}: disponibilità iPhone oggi, ritiro e orari`,
        `${name}: disponibilità iPhone e orari`,
        `${name}: disponibilità iPhone`,
        `${name} – disponibilità`,
      ];
    },
    model: (name: string, storesNow: string) => [
      `${name}: disponibile ora in ${storesNow} Apple Store`,
      `Disponibilità ${name} per il ritiro: ${storesNow} Apple Store`,
      `Disponibilità ${name} per il ritiro in tempo reale`,
    ],
  },

  tokens: {
    tooFewToMeasure: "non ancora misurabile",
    noneLoggedYet: "non ancora nel registro",
    noneYet: "non ancora annotato",
  },

  pattern: {
    none: (days: string) => `Il registro di ${days} giorni non contiene rientri confermati.`,
    nConfirmed: f({ one: "# rientro confermato", other: "# rientri confermati" }),
    countIn: (count: string, days: string) => `${count} in ${days} giorni`,
    stay: (minutes: string) => `; permanenza mediana in elenco circa ${minutes} min`,
    nDays: f({ one: "# giorno", other: "# giorni" }),
    tooFew: (count: string, onDays: string | null, stay: string) => `${count}${onDays ? `, tutti in ${onDays}` : ""}: troppo pochi giorni distinti per indicare un'ora tipica${stay}.`,
    usual: (hour: string, weekday: string | null, count: string, stay: string) => `I rientri si concentrano attorno ${alleH(hour)}, ora locale${weekday ? `, più spesso ${ilDay(weekday)}` : ""}; ${count}${stay}.`,
  },

  regionNouns: Object.fromEntries(Object.entries(nounForms).map(([k, v]) => [k, { one: v.one, other: v.other }])) as Record<string, Forms>,

  measured: "Note di metodo",

  faqTitle: "Domande ricorrenti",
  breadcrumb: "Traccia della pagina",
  keepExploring: "Altro dal registro",
  browse: {
    storesByState: "Sfoglia per stato",
    allStatesCities: "Ogni stato e ogni città →",
    liveByModel: "Stato degli scaffali per iPhone",
    modelStock: (model: string) => `${model}: dove si trova`,
    thisPage: "sei qui",
    restockLog: (short: string) => `Registro dei rientri · ${short}`,
    liveMap: "Vista mappa",
    mostStores: "Dove i negozi sono di più",
    allStates: "Ogni stato",
    bigCities: "Città principali",
    cities: "Città con negozi",
    storesBy: (region: string) => `Sfoglia per ${region}`,
    allStoresIn: ({ country }: { inName: string; country: string }) => <>Elenco completo dei negozi {inNome(country)} →</>,
    allRegions: (regions: string) => `Elenco completo: ${regions}`,
  },
  modelCards: "Modello per modello",
  narrative: {
    lastRestock: (config: ReactNode, at: ReactNode, ago: ReactNode) => <>{" "}Ultimo rientro annotato: {config}{at}, {ago}.</>,
    at: (store: ReactNode) => <> presso {store}</>,
  },
  statStrip: {
    inStockNow: "A scaffale adesso",
    ofStores: (n: string) => `in ${n} negozi`,
    stores: "Luoghi",
    nCities: f({ one: "in # città", other: "in # città" }),
    tracked: "nel registro",
    modelNow: (short: string) => `${short} a scaffale`,
    configsInStock: "configurazioni a scaffale",
    storesWithStock: f({ one: "negozio che lo espone", other: "negozi che lo espongono" }),
    restocks24h: "Rientri, 24 h",
    restocksHint: (week: string, month: string, days: string) => `7 g: ${week} · ${days} g: ${month}`,
    sellOuts: (days: string) => `Di nuovo spariti (${days} g)`,
    stays: (duration: string) => (/^sotto\b/.test(duration) ? `scaffale mediano ${duration}` : `scaffale mediano ~${duration}`),
    noPairs: "nessun passaggio completo",
    lastRestock: "Ultimo rientro",
    noneYet: "non ancora annotato",
    inLastDays: (days: string) => `entro ${days} giorni`,
  },
  product: {
    chooseIphone: "Scegli un modello",
    storage: "Capacità",
    color: "Finitura",
    all: "Qualsiasi",
    numbersAre: (unit: ReactNode) => <>Ogni cifra conta {unit} che lo hanno a scaffale adesso.</>,
    seen: (ago: ReactNode) => <>annotato {ago} · a scaffale</>,
    last: (ago: ReactNode) => <>a scaffale l&apos;ultima volta {ago} · ora fuori</>,
    notSeenYet: "mai annotato a scaffale finora",
    firstCheckPending: "in attesa della prima osservazione",
    inStock: "A scaffale",
    inStockLower: "a scaffale",
    none: "fuori scaffale",
    here: "proprio qui",
    notAvailable: "Fuori scaffale",
    notCheckedYet: "Ancora nessuna osservazione",
    availableForPickup: "In elenco per il ritiro",
    since: (ago: ReactNode) => <> · prima annotazione {ago}</>,
    lastInStock: (ago: ReactNode) => <>A scaffale l&apos;ultima volta {ago}</>,
    neverSeen: "Mai annotato su questo scaffale",
    firstCheckSoon: "Prima osservazione a breve",
    buy: "Ordina tramite apple.com",
    checked: (checked: ReactNode, note: ReactNode) => <>Osservato {checked} · {note}</>,
    checkNote: "scorte aggiornate di frequente",
  },

  source: (source: ReactNode) => <>Dati: {source}</>,
  photoCredit: (link: ReactNode) => <>Immagine: {link}</>,
  sources: "Riferimenti",
  allUsStores: "l'insieme completo dei 269 Apple Store USA",
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>Registro delle scorte di ShelfSpring per {where}: copertura storica a partire dal {since}; cifre aggiornate al {asOf}. La notifica parte dopo che è stata rilevata una disponibilità corrispondente. Controlli alla fonte, sincronizzazione e recapito possono aggiungere ritardo. Le date di copertura storica descrivono l&apos;archivio dei dati, non l&apos;età di ShelfSpring.</>,
  live: {
    configsCaption: (stores: ReactNode, model: ReactNode) => <>{model}: quanti dei {stores} Apple Store espongono ciascuna configurazione in questa osservazione</>,
    storage: "Capacità",
    pricesCaption: (model: ReactNode) => <>{model} su apple.com: prezzo di listino da sbloccato, tasse escluse, accanto ai negozi che lo espongono adesso</>,
    price: "Listino",
    bestColor: "Finitura più presente (negozi)",
    noRestock: (model: string) => `Il registro non ha ancora rientri di ${model}.`,
    clockLabel: (model: string) => `nei negozi USA per l'${model}`,
    storesWithIt: "Negozi che lo espongono",
    pairsInStock: "Coppie negozio–configurazione a scaffale",
    restocksLogged: "Rientri nel registro",
    medianTime: "Tempo mediano a scaffale",
    underOneMin: (min: string) => `< ${min}`,
  },

  /** Italian alt text and captions for the generic photos and Italy's place photos; other ids fall back to English. */
  photos: {
    "apple-store-crowd-inside": { alt: "Gente in fila all'interno di un Apple Store pieno, dentro un centro commerciale", caption: "Un Apple Store nei giorni del lancio: quello che arriva sugli scaffali dura pochi minuti." },
    "apple-store-glass-canopy": { alt: "Facciata di vetro di un Apple Store con tettoia in legno, la sera", caption: "Vetrate accese di un Apple Store dopo il calar del sole." },
    "apple-store-night-vancouver": { alt: "Apple Store di Vancouver illuminato nel buio", caption: "Di notte il negozio è chiuso, ma una voce con ritiro può riapparire a qualunque ora; il registro la vede arrivare soprattutto al mattino." },
    "apple-store-pickup-counter": { alt: "Dentro un Apple Store, banco di legno sotto l'insegna del ritiro", caption: "È a un banco così che si consegnano gli ordini con ritiro." },
    "city-map-phone": { alt: "Due persone consultano una mappa cittadina sullo smartphone", caption: "Prima di muoversi si studia la strada fino al negozio." },
    "phone-card-payment": { alt: "Donna con iPhone e carta di credito che paga un acquisto online", caption: "Il ritiro in negozio si paga online, prima di partire." },
    "phone-hand-camera": { alt: "Mano che regge un iPhone con il modulo a tre fotocamere", caption: "Per i modelli Pro la coda si forma sempre." },
    "phone-map": { alt: "Mani su un'app di mappe aperta sullo smartphone, all'aperto", caption: "Se una voce resta a scaffale un minuto, ogni chilometro pesa più del previsto." },
    "phone-notification": { alt: "Telefono in mano con le notifiche sulla schermata di blocco", caption: "La segnalazione compare sulla schermata di blocco." },
    "phone-on-box": { alt: "Smartphone appena tolto dalla confezione, appoggiato sulla scatola bianca", caption: "Telefono nuovo, scatola ancora sul tavolo." },
    "place-it-florence": { alt: "Firenze dall'alto, con la cupola del Brunelleschi e il campanile di Giotto", caption: "La cupola di Santa Maria del Fiore domina Firenze." },
    "place-it-italy": { alt: "Gondole sul Canal Grande davanti al Ponte di Rialto, in pieno giorno", caption: "Venezia, il Canal Grande sotto Rialto." },
    "place-it-milan": { alt: "Le guglie gotiche del Duomo di Milano viste da piazza del Duomo", caption: "Milano, la facciata del Duomo sulla piazza." },
    "place-it-rome": { alt: "Ponte Sant'Angelo e Castel Sant'Angelo specchiati nel Tevere, di giorno", caption: "Roma, il Tevere davanti a Castel Sant'Angelo." },
    "place-it-rome-region": { alt: "Il Colosseo tra gli alberi nella luce del tramonto", caption: "Il Colosseo all'ora del tramonto." },
    "place-it-turin": { alt: "Tetti di Torino con la Mole Antonelliana e le Alpi innevate dietro", caption: "Torino: la Mole e, sullo sfondo, le Alpi." },
  },
};

export const content: Dict["content"] = withShelfContent("it", baseContent);
