import { withShelfPages } from "@/lib/seo/localizedCopy";
/**
 * Italian strings: pages — the home board and the region, city and store pages of the Italian page tree.
 * Place names arrive already in Italian. Labels handed to the restock modules carry their preposition (a/ad + city,
 * presso + store, or qui).
 */
import { COUNTRIES, type CountryCode } from "@/lib/apple/countries";
import type { Dict } from "../en";
import { cap, inPaese, n as N, paese, pl, regione } from "./util";

const CHECK_NOTE = "scorte aggiornate di frequente";
/** "a Roma", "ad Arezzo". */
const a = (place: string) => (/^[aA]/.test(place) ? `ad ${place}` : `a ${place}`);

const basePages: Dict["pages"] = {
  common: {
    checkNote: CHECK_NOTE,
    appleStores: "Elenco dei negozi",
    showOnMap: "Trova sulla mappa",
    restockLogs: "Registri dei rientri",
    fullLog: "Apri il registro intero →",
    restocksBy: "Rientri per configurazione",
    lastDays: (days: number) => `Calendario dei rientri, ${N(days)} giorni`,
    nearbyCities: "Altre città a portata d'auto",
    neighboringStates: "Stati confinanti",
    acrossStateLine: "Appena oltre il confine di stato",
    allUsRestocks: "Ogni rientro annotato negli USA",
    allRestocksIn: (cc: CountryCode) => `Ogni rientro annotato ${inPaese(cc)}`,
    /** These five name a region: in Italy a province ("provincia di Roma"). */
    regionRestocks: (place: string) => `Provincia di ${place}: registro dei rientri`,
    onTheMap: (place: string) => `Vista mappa: provincia di ${place}`,
    allOf: (place: string) => `Provincia di ${place} in sintesi`,
    allOfArrow: (place: string) => `Il registro intero della provincia di ${place} →`,
    storeAndCity: (store: string, city: string) => `${city} · ${store}`,
    appleStorePage: (store: string) => `Scheda di ${store} su apple.com`,
    sourcesWhere: (n: number, cc: CountryCode) => `${N(n)} Apple Store osservati ${inPaese(cc)}`,
    inPlace: (place: string) => a(place),
    atPlace: (place: string) => `presso ${place}`,
    here: "qui",
    storesWithIt: "negozi che lo espongono",
    whenRestock: (place: string) => `Gli orari dei rientri · ${place}`,
    duoHours: (place: string) => `Ore d'orologio dei rientri di Duo annotati · ${place}`,
    howFast: (place: string) => `Quanto sono rimaste in elenco le voci ${a(place)}`,
    latestIn: (place: string) => `${place}: le annotazioni più recenti`,
    noneIn: (place: string) => `Per ${place} non c'è ancora niente di annotato.`,
    faqTitle: (place: string) => `Domande dal campo · ${place}`,
    itemList: (place: string) => `Apple Store ${a(place)}`,
    alertIn: (place: string) => `Segui i negozi ${a(place)}`,
    panelPick: (place: string) => `La tua lista d'osservazione per ${place}: prima i telefoni, poi solo i negozi che raggiungeresti davvero`,
    matrixH2: "Scorte per negozio e modello",
    matrixHint: "In elenco all'ultima osservazione / seguite, modello per modello.",
    matrixLabel: "Scaffale negozio per negozio",
    cityPage: "Sintesi della città ↗",
    storePage: "Sintesi del negozio ↗",
    since: "2 novembre 2026",
  },
  home: {
    storesWith: (short: string) => `negozi che mostrano il ${short}`,
    restocks24: "rientri, ultime 24 h",
    week: (n: number) => ` · ${N(n)} in sett.`,
    lastCheck: "ultima osservazione",
    more: (n: number) => `+${N(n)} in più`,
    latest: (short: string) => `I rientri di ${short} più recenti nel registro`,
    none: (short: string) => `Nessun rientro di ${short} annotato finora.`,
    allRestocks: "Registro completo dei rientri",
    modelMap: (short: string) => `Mappa: ${short}`,
    buy: "Ordina su apple.com",
    liveStock: (short: string) => `Lo scaffale del ${short} oggi`,
    live: "Dal vivo",
    alsoTracking: "Nel registro anche:",
    liveMap: "Mappa del ritiro",
    allStores: "Elenco dei negozi",
    questions: "Domande dal campo",
  },
  region: {
    counts: (stores: number, cities: number) => `${pl(cities, "città", "città")} · ${N(stores)} Apple Store · ${CHECK_NOTE}`,
    nearbyOutside: (place: string) => `I negozi più vicini oltre la provincia di ${place}`,
    nearbyHint: (place: string) => `Le distanze partono dal centro del gruppo di negozi della provincia di ${place}.`,
    beyond: (place: string) => `Fuori dalla provincia di ${place}`,
    everyStore: (place: string) => `Elenco dei negozi · provincia di ${place}`,
    nearestRegions: (cc: CountryCode) => {
      const c = COUNTRIES[cc];
      return `${cap(regione(c, true))} più a portata ${inPaese(cc)}`;
    },
  },
  city: {
    counts: (stores: number) => `${N(stores)} Apple Store · ${CHECK_NOTE}`,
    storeHeading: (name: string) => `Apple ${name}`,
    details: "Indirizzi e orari d'apertura",
    outside: (place: string) => `I negozi più vicini oltre ${place}`,
    outsideRegion: (region: string) => `Appena fuori dalla provincia di ${region}`,
    around: (place: string) => `${place} e il suo circondario`,
    otherCities: (region: string) => `Altre città · provincia di ${region}`,
  },
  store: {
    description: (x: { place: string; street: string; city: string; where: string; duo: number; pro: number; pm: number }) => [
      `${x.place}, ${x.street}, ${x.city}: disponibilità per il ritiro di iPhone Duo (${N(x.duo)} configurazioni), 18 Pro (${N(x.pro)}) e Pro Max (${N(x.pm)}), orari di oggi, rifornimenti e negozi vicini.`,
      `${x.place}, ${x.where}: disponibilità per il ritiro di iPhone Duo (${N(x.duo)} configurazioni), 18 Pro (${N(x.pro)}) e Pro Max (${N(x.pm)}), orari di oggi e rifornimenti.`,
      `${x.place}, ${x.city}: disponibilità di Duo (${N(x.duo)}), 18 Pro (${N(x.pro)}), Pro Max (${N(x.pm)}), orari e rifornimenti.`,
    ],
    where: (city: string, cc: CountryCode) => `${city}, ${paese(cc)}`,
    taxQ: (place: string) => `Tasse comprese, quanto si spende per un iPhone Duo presso ${place}?`,
    pickupQ: (place: string) => `${place} consegna gli ordini fatti su apple.com con ritiro?`,
    pickupA: (place: string) => `Sì. Durante il pagamento su apple.com scegli il ritiro presso ${place} e mettiti in viaggio solo quando Apple dice che l'ordine è pronto. Al banco mostri il numero d'ordine, un documento ufficiale con foto e il codice QR dal vivo o il pass di Wallet (le schermate catturate non valgono).`,
    storeWord: (name: string) => (/^apple\b/i.test(name) ? name.replace(/^apple\s*/i, "Apple Store ") : `Apple Store ${name}`),
    hoursH2: (storeWord: string) => `${storeWord}: dove si trova, quando apre, come si ritira`,
    hoursLead: (place: string, address: string, phone: string | undefined, today: string, week: string) => `L'indirizzo di ${place} è ${address}${phone ? `, telefono ${phone}` : ""}. Oggi: ${today}; settimana intera: ${week}.`,
    pickupRules: (helpUrl: string) => [
      `**Mettiti in viaggio solo quando Apple segnala l'ordine come pronto** ([regole di Apple sul ritiro](${helpUrl}))`,
      "**Al banco:** numero d'ordine · documento d'identità ufficiale · codice QR dal vivo o pass di Wallet",
      "**Non vale:** la schermata catturata del codice",
      "**Mandi un'altra persona?** Indicala come incaricata del ritiro durante il pagamento",
    ],
    directions: (place: string, dirUrl: string, appleUrl?: string) => `[Percorso fino a ${place}](${dirUrl})${appleUrl ? ` · [La scheda di Apple per questo negozio](${appleUrl})` : ""}`,
    onlyH2: (where: string, place: string) => `Apple Store ${where}: c'è solo ${place}`,
    onlyInCountry: (place: string, cc: CountryCode) => `${inPaese(cc).replace(/^./, (ch) => ch.toUpperCase())} esiste un solo Apple Store, ${place}: ogni ritiro in negozio del paese passa da lì. Quando espone una configurazione manca un'alternativa vicina, quindi tutta la strategia sta in una notifica su quel negozio.`,
    onlyInCity: (city: string, place: string, backups: string) => `${cap(a(city))} c'è soltanto ${place}.${backups ? ` Subito dopo, per distanza: ${backups}.` : ""}`,
    backup: (apple: string, city: string, dist: string) => `${apple} ${a(city)} (${dist})`,
    onlyBlockCountry: (place: string) => `Ogni notifica copre un negozio e una configurazione esatta, e parte poco dopo che ${place} la mette in elenco per il ritiro.`,
    onlyBlock: (place: string) => `Quando ${place} non ha la configurazione che vuoi, conviene seguire anche quei negozi di riserva: ogni notifica copre un negozio e una configurazione esatta.`,
    intro: (x: { place: string; street: string; duo: number; duoOf: number; pro: number; proOf: number; pm: number; pmOf: number; peak: string | null }) => (
      <>In questo momento {x.place}{x.street ? `, in ${x.street},` : ""} espone per il ritiro <b className="text-ink">{N(x.duo)}/{N(x.duoOf)}</b> configurazioni di iPhone Duo, <b className="text-ink">{N(x.pro)}/{N(x.proOf)}</b> di iPhone 18 Pro e <b className="text-ink">{N(x.pm)}/{N(x.pmOf)}</b> di iPhone 18 Pro Max.{x.peak ? <> I rientri qui cadono di solito attorno <b className="text-ink">alle {x.peak}</b>, ora del negozio.</> : null}</>
    ),
    restocks30: (n: number) => `${pl(n, "rientro annotato", "rientri annotati")} in 30 giorni`,
    lookupOff: "In questo momento Apple non risponde alle verifiche di ritiro per questo negozio. Il registro ritenta ogni 30 minuti e riempie lo scaffale appena arriva una risposta.",
    checked: "Osservato",
    alertHere: (short: string) => `Segui il ${short} in questo negozio`,
    panel: (name: string) => `Lista d'osservazione per Apple ${name}: scegli i telefoni, tieni questo negozio e aggiungi le riserve che potresti raggiungere`,
    configsInStock: "configurazioni a scaffale",
    stockNowH2: "Scorte per il ritiro in questo momento",
    whenRestock: (name: string) => `Gli orari dei rientri presso Apple ${name}`,
    duoHours: (name: string) => `Ore d'orologio dei rientri di Duo annotati, Apple ${name}`,
    howFast: (name: string) => `Quanto sono rimaste in elenco le voci presso Apple ${name}`,
    history: "Registro dei rientri",
    historyEmpty: "Per questo negozio il registro non contiene ancora rientri né esaurimenti.",
    nearby: "Negozi di riserva",
    elsewhereIn: (region: string) => `Il resto della provincia di ${region}`,
    faqTitle: (place: string) => `Domande dal campo · ${place}`,
    applePage: (place: string) => `${place} su apple.com: orari d'apertura e sessioni`,
    sourcesWhere: (n: number, cc: CountryCode) => (n === 1 ? `l'unico Apple Store ${inPaese(cc)}` : `${N(n)} Apple Store ${inPaese(cc)}`),
    around: (place: string) => `Oltre ${place}`,
    otherInCity: (city: string) => `Stessa città, altri negozi: ${city}`,
    cityPage: (city: string) => `${city} in sintesi`,
    moreIn: (region: string) => `Più lontano nella provincia di ${region}`,
    everyIn: (cc: CountryCode) => `Il resto dell'elenco ${inPaese(cc)}`,
    allIn: (cc: CountryCode) => `Elenco completo dei negozi ${inPaese(cc)}`,
    countryHome: (cc: CountryCode) => `${paese(cc)} in sintesi`,
    footnote: "Lo stato degli scaffali è copiato dalle risposte di apple.com sul ritiro in negozio, al momento dell'ultima osservazione.",
    /** `regionWord` (the country's region level, English key) is not needed in Italian. */
    footnoteIntl: (cc: CountryCode) => ` Importi in ${COUNTRIES[cc].currency === "EUR" ? "euro" : COUNTRIES[cc].currency}, distanze in chilometri; questo registro non dipende da alcuna autorità pubblica né da alcun rivenditore.`,
  },
};

export const pages: Dict["pages"] = withShelfPages("it", basePages);
