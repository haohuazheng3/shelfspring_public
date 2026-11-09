import { withShelfContent } from "@/lib/seo/localizedCopy";
import type { ReactNode } from "react";
/**
 * Chaînes françaises : content — briques SEO (FAQ, liens, bandeaux de chiffres, pièces produit, sources, widgets en
 * direct), helpers d’enrich (horaires, durées, réponses FAQ, titres), jetons {{…}}, phrase de tendance d’un magasin
 * et textes alternatifs des photos. Les arguments arrivent déjà rédigés pour la langue (nombres, durées, noms).
 */
import type { Dict } from "../en";
import type { Forms } from "@/lib/i18n/format";
import { dans } from "./util";
import { storeTitleVariants } from "./place";

const f = (x: Forms): Forms => x;
/** "de Paris" / "d’Apple Opéra". */
const de = (x: string) => (/^[aeiouyhâéèêîôû]/i.test(x) ? `d’${x}` : `de ${x}`);
type Kind = "state" | "city" | "store" | "model";

const baseContent: Dict["content"] = {
  hours: {
    closed: "fermé",
    everyDay: (hours) => `Chaque jour ${hours}`,
    tomorrow: "demain",
    dayAt: (day, time) => `${day} ${time}`,
    closedTodayOpens: (next) => `Portes closes aujourd’hui · réouverture ${next}`,
    closedToday: "Portes closes toute la journée",
    opensAt: (time) => `Ouverture des portes ${time}`,
    openNow: (closes) => `Ouvert jusqu’à ${closes}`,
    closedNowOpens: (next) => `Portes closes pour l’instant · réouverture ${next}`,
    closedNow: "Portes closes pour l’instant",
  },

  duration: {
    underAMinute: "moins d’une minute",
    pair: (a, b) => `${a} ${b}`,
  },
  listMore: (n) => `${n} de plus`,
  nearLine: (place, distance) => `${place} (${distance})`,

  faq: {
    where: (kind: Kind, place: string) => (kind === "store" ? `chez ${place}` : kind === "model" ? `pour l’${place}` : dans(place)),
    nRestocks: f({ one: "# retour confirmé", other: "# retours confirmés" }),
    restockA: ({ count, where, days, week, peak }) =>
      `${count == null ? `Le registre de ${days} jours ne contient aucun retour ${where}` : `Le registre de ${days} jours contient ${count} ${where}, dont ${week} cette semaine`}${peak ? ` ; ils se regroupent vers ${peak.hour}, heure du magasin${peak.day ? `, le ${peak.day} étant le jour le plus chargé` : ""}` : ""}, et Apple ne publie aucun calendrier de livraison.`,
    lastsNone: (where) => `Pas encore assez de fiches complètes, du retour au départ, ${where} pour mesurer.`,
    lasts: (days, duration) => `Temps médian en rayon sur le registre de ${days} jours : environ ${duration} entre un retour et le départ suivant.`,
    storeIn: (store, line) => `${store} · ${line}`,
    nearestA: (stores) => `Solutions de repli les plus proches : ${stores}.`,

    modelStockQ: (model) => `Où l’${model} est-il en rayon en ce moment ?`,
    modelStockNone: (model) => `Nulle part lors de la dernière observation ; cette page actualise sa liste sitôt qu’un Apple Store des États-Unis met l’${model} en rayon pour le retrait.`,
    nUsStores: f({ one: "# Apple Store américain", other: "# Apple Store américains" }),
    modelStockSome: (count) => `Dans ${count} lors de la dernière observation ; chacun est nommé plus bas avec les configurations qu’il liste.`,
    priceQ: (model) => `Que coûte l’${model} sur apple.com ?`,
    priceA: (low, high, storages, colors) => `Prix catalogue débloqué de ${low} à ${high} selon la capacité (${storages}) ; finitions : ${colors}.`,
    modelRestockQ: (model) => `À quel rythme l’${model} revient-il en rayon ?`,
    modelLastsQ: (model) => `Combien de temps un ${model} revenu reste-t-il en ligne ?`,
    reserveQ: (model) => `Peut-on me mettre un ${model} de côté avant de commander ?`,
    reserveA: "Pas avant la commande : une fois que le magasin liste la configuration, vous passez commande sur apple.com avec l’option de retrait en magasin, et c’est seulement là qu’elle est réservée pour votre créneau de retrait.",

    storeStockQ: (store, model) => `L’${model} est-il en rayon chez ${store} ?`,
    nConfigs: f({ one: "# configuration", other: "# configurations" }),
    storeStockYes: (count) => `Oui : ${count} lors de la dernière observation, capacité et finition indiquées dans le tableau de cette page.`,
    storeStockNo: (other) => `Pas lors de la dernière observation${other ? ` ; le magasin liste en revanche ${other.pro} configurations d’iPhone 18 Pro et ${other.proMax} de 18 Pro Max` : ", et les 18 Pro et 18 Pro Max sont eux aussi hors rayon"}.`,
    hoursQ: (store) => `Quand ${store} est-il ouvert ?`,
    hoursA: ({ hours, today, address, phone }) => `${hours ?? "Voir les horaires sur cette page"}${today ? ` (aujourd’hui ${today})` : ""} · adresse : ${address}${phone ? ` · tél. ${phone}` : ""}.`,
    storeRestockQ: (store) => `À quel rythme les iPhone reviennent-ils en rayon chez ${store} ?`,
    storeLastsQ: (store) => `Combien de temps les retours restent-ils en ligne chez ${store} ?`,
    storeNearestQ: (store) => `Quels autres Apple Store se trouvent au plus près ${de(store)} ?`,

    placeStockQ: (place, model) => `Dans quels Apple Store ${dans(place)} l’${model} est-il en rayon maintenant ?`,
    placeStockNone: (place, model) => `Aucun lors de la dernière observation ; dès qu’un magasin ${dans(place)} liste l’${model} pour le retrait, cette page l’affiche.`,
    nStores: f({ one: "# magasin", other: "# magasins" }),
    placeStockSome: (count, stores) => `${count} lors de la dernière observation : ${stores}.`,
    countQ: (place) => `Combien d’Apple Store compte-t-on ${dans(place)} ?`,
    nAppleStores: f({ one: "# Apple Store", other: "# Apple Store" }),
    countMany: (count, stores) => `${count} ; parmi eux, ${stores}.`,
    countOne: (count, store) => `${count}, à savoir ${store}.`,
    placeRestockQ: (place) => `À quel rythme les iPhone reviennent-ils en rayon ${dans(place)} ?`,
    placeLastsQ: (place) => `Combien de temps le stock tient-il après un retour ${dans(place)} ?`,
    placeNearestQ: (place) => `Quels Apple Store hors ${place} sont les plus proches ?`,
  },

  explainer: (kind: Kind, place: string) => {
    const at = kind === "store" ? `chez ${place}` : kind === "model" ? "dans chaque Apple Store américain" : `dans les Apple Store ${dans(place)}`;
    return [
      "Les fiches de retrait relèvent d’apple.com : le paiement demande une configuration et un magasin, il se règle en ligne, et le retrait se fait sur place, souvent le jour même. Le stock vendu en libre-service et celui des opérateurs sont à part.",
      `ShelfSpring consigne chaque configuration suivie ${at} à partir d’un flux d’inventaire synchronisé ; un changement n’entre au registre qu’après une observation qui le confirme.`,
      "Chaque changement confirmé devient une entrée du registre, et ces entrées dessinent les graphiques et l’historique des retours affichés ici.",
    ];
  },
  alertRule: "Chaque veille porte sur un seul magasin et une seule configuration exacte ; les notifications suivent la disponibilité repérée après synchronisation, alors confirmez la commande auprès d’Apple.",

  titles: {
    state: (name, duoNow, stores) => [
      `Apple Store ${name} : l’iPhone Duo dans ${duoNow} des ${stores} magasins`,
      `Apple Store ${name} : stock iPhone Duo en retrait, en direct`,
      `Apple Store ${name} : stock iPhone Duo`,
      `Apple Store ${name} : stock iPhone`,
    ],
    city: (city, code, duoNow, stores) => [
      `Apple Store ${city} (${code}) : l’iPhone Duo dans ${duoNow} des ${stores}`,
      `Apple Store ${city} (${code}) : stock iPhone Duo en retrait`,
      `Apple Store ${city} (${code}) : stock iPhone Duo`,
      `Apple Store ${city} : stock iPhone`,
    ],
    store: (name, region) => storeTitleVariants(name, region),
    model: (name, storesNow) => [
      `Stock ${name} en retrait : ${storesNow} Apple Store l’ont en ce moment`,
      `${name} : en stock dans ${storesNow} Apple Store`,
      `Stock ${name} en retrait, en direct`,
    ],
  },

  tokens: {
    tooFewToMeasure: "pas encore mesurable",
    noneLoggedYet: "pas encore au registre",
    noneYet: "pas encore relevé",
  },

  pattern: {
    none: (days) => `Le registre de ${days} jours ne contient aucun retour confirmé.`,
    nConfirmed: f({ one: "# retour confirmé", other: "# retours confirmés" }),
    countIn: (count, days) => `${count} en ${days} jours`,
    stay: (minutes) => ` ; fiche médiane d’environ ${minutes} min`,
    nDays: f({ one: "# jour", other: "# jours" }),
    tooFew: (count, onDays, stay) => `${count}${onDays ? `, tous sur ${onDays}` : ""} : trop peu de jours distincts pour avancer une heure type${stay}.`,
    usual: (hour, weekday, count, stay) => `Les retours se regroupent vers ${hour}, heure du magasin${weekday ? `, le plus souvent le ${weekday}` : ""} ; ${count}${stay}.`,
  },

  regionNouns: {
    state: f({ one: "État", other: "États" }),
    province: f({ one: "province", other: "provinces" }),
    area: f({ one: "région", other: "régions" }),
    department: f({ one: "département", other: "départements" }),
    prefecture: f({ one: "préfecture", other: "préfectures" }),
    emirate: f({ one: "émirat", other: "émirats" }),
    canton: f({ one: "canton", other: "cantons" }),
    region: f({ one: "région", other: "régions" }),
    county: f({ one: "comté", other: "comtés" }),
    city: f({ one: "ville", other: "villes" }),
  } as Record<string, Forms>,

  measured: "Notes de méthode",

  faqTitle: "Questions courantes",
  breadcrumb: "Chemin de la page",
  keepExploring: "Ailleurs dans le registre",
  browse: {
    storesByState: "Parcourir par État",
    allStatesCities: "Chaque État, chaque ville →",
    liveByModel: "État des rayons par iPhone",
    modelStock: (model) => `Disponibilité ${model}`,
    thisPage: "page ouverte",
    restockLog: (short) => `Registre des retours ${short}`,
    liveMap: "Vue carte",
    mostStores: "Plus grands nombres de magasins",
    allStates: "Chaque État",
    bigCities: "Grandes agglomérations",
    cities: "Villes dotées d’un magasin",
    storesBy: (region) => `Parcourir par ${region}`,
    allStoresIn: ({ country }) => <>Liste complète des magasins · {country} →</>,
    allRegions: (regions) => `Liste complète des ${regions}`,
  },
  modelCards: "Modèle par modèle",
  narrative: {
    lastRestock: (config, at, ago) => <>{" "}Dernier retour consigné : {config}{at}, {ago}.</>,
    at: (store) => <> chez {store}</>,
  },
  statStrip: {
    inStockNow: "En rayon à présent",
    ofStores: (n) => `parmi ${n} magasins`,
    stores: "Lieux",
    nCities: f({ one: "dans # ville", other: "dans # villes" }),
    tracked: "au registre",
    modelNow: (short) => `${short} en rayon`,
    configsInStock: "configurations en rayon",
    storesWithStock: f({ one: "magasin qui l’a", other: "magasins qui l’ont" }),
    restocks24h: "Retours, 24 h",
    restocksHint: (week, month, days) => `7 j : ${week} · ${days} j : ${month}`,
    sellOuts: (days) => `Repartis (${days} j)`,
    stays: (duration) => (/^moins\b/.test(duration) ? `rayon médian : ${duration}` : `rayon médian : ~${duration}`),
    noPairs: "aucune paire complète",
    lastRestock: "Dernier retour",
    noneYet: "pas encore consigné",
    inLastDays: (days) => `en ${days} jours`,
  },
  product: {
    chooseIphone: "Choisir un modèle",
    storage: "Capacité",
    color: "Finition",
    all: "Indifférent",
    numbersAre: (unit) => <>Chaque chiffre compte les {unit} qui l’ont en rayon à présent.</>,
    seen: (ago) => <>consigné {ago} · en rayon</>,
    last: (ago) => <>dernier passage en rayon {ago} · hors rayon</>,
    notSeenYet: "jamais consigné en rayon",
    firstCheckPending: "première observation attendue",
    inStock: "En rayon",
    inStockLower: "en rayon",
    none: "hors rayon",
    here: "juste ici",
    notAvailable: "Hors rayon",
    notCheckedYet: "Aucune observation pour l’instant",
    availableForPickup: "Listé pour le retrait",
    since: (ago) => <> · consigné pour la première fois {ago}</>,
    lastInStock: (ago) => <>Dernière présence en rayon {ago}</>,
    neverSeen: "Jamais encore consigné dans ce rayon",
    firstCheckSoon: "Première observation imminente",
    buy: "Commander via apple.com",
    checked: (checked, note) => <>Observé {checked} · {note}</>,
    checkNote: "inventaire actualisé en continu",
  },

  source: (source) => <>Données : {source}</>,
  photoCredit: (link) => <>Image : {link}</>,
  sources: "Références",
  allUsStores: "l’ensemble des 269 Apple Store américains",
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>Registre d’inventaire ShelfSpring pour {where} : couverture historique à partir du {since} ; état des chiffres : {asOf}. Une alerte part dès qu’une disponibilité correspondante est repérée ; contrôle à la source, synchronisation et acheminement des notifications peuvent ajouter du délai. La date de couverture décrit le jeu de données, pas l’âge de ShelfSpring.</>,
  live: {
    configsCaption: (stores, model) => <>{model} : combien des {stores} Apple Store listent chaque configuration lors de cette observation</>,
    storage: "Capacité",
    pricesCaption: (model) => <>{model} sur apple.com : prix catalogue débloqué hors taxes, à côté des magasins qui le listent maintenant</>,
    price: "Prix catalogue",
    bestColor: "Finition la plus listée (magasins)",
    noRestock: (model) => `Le registre ne contient encore aucun retour d’${model}.`,
    clockLabel: (model) => `dans les magasins américains pour l’${model}`,
    storesWithIt: "Magasins qui le listent",
    pairsInStock: "Paires magasin–configuration en rayon",
    restocksLogged: "Retours au registre",
    medianTime: "Temps médian en rayon",
    underOneMin: (min) => `< ${min}`,
  },

  /** Les photos génériques et celles des lieux de France, Belgique, Suisse et Canada ; les autres restent en anglais. */
  photos: {
    "apple-store-pickup-counter": { alt: "Panneau « Pickup » au-dessus d’un comptoir en bois clair, à l’intérieur d’un Apple Store", caption: "C’est à ce genre de comptoir que l’on présente sa commande de retrait." },
    "phone-map": { alt: "Un itinéraire tracé sur une app de cartes, téléphone tenu à deux mains dehors", caption: "Une fiche brève rend la distance décisive : mieux vaut connaître son trajet à l’avance." },
    "phone-card-payment": { alt: "iPhone dans une main, carte bancaire dans l’autre, au moment de payer en ligne", caption: "Le retrait se paie en ligne, avant de se déplacer." },
    "phone-on-box": { alt: "Smartphone neuf posé à plat sur son emballage blanc", caption: "L’objet de la veille, enfin sorti de sa boîte." },
    "city-map-phone": { alt: "Deux personnes penchées sur un plan de ville affiché sur un téléphone", caption: "Repérer le chemin du magasin avant que la fiche ne disparaisse." },
    "phone-notification": { alt: "Écran verrouillé d’un téléphone tenu en main, avec des notifications empilées", caption: "L’alerte se lit sur l’écran verrouillé, sans ouvrir l’app." },
    "apple-store-crowd-inside": { alt: "File de clients serrés dans un Apple Store de centre commercial bondé", caption: "Jour de lancement, Apple Store bondé : ce qui revient en rayon repart vite." },
    "apple-store-glass-canopy": { alt: "Façade entièrement vitrée et auvent de bois d’un Apple Store, photographiés la nuit", caption: "Façade vitrée d’un Apple Store, une fois la nuit venue." },
    "apple-store-night-vancouver": { alt: "Apple Store de Vancouver éclairé dans l’obscurité", caption: "Les retours peuvent tomber à toute heure, mais le registre les montre surtout le matin." },
    "phone-hand-camera": { alt: "Main tenant un iPhone au dos équipé de trois objectifs", caption: "Les modèles Pro restent les plus attendus en magasin." },
    "place-fr-france": { alt: "Bateaux sur la Seine au pied de la tour Eiffel, sous un ciel dégagé", caption: "Paris : la Seine et la tour Eiffel." },
    "place-fr-paris": { alt: "Vue plongeante sur les Champs-Élysées bordés d’arbres, à la tombée du jour", caption: "Paris : les Champs-Élysées à la tombée du jour." },
    "place-fr-lyon": { alt: "Quais aux façades colorées du Vieux Lyon, dominés par la basilique de Fourvière", caption: "Lyon : le Vieux Lyon sous Fourvière." },
    "place-fr-bouches-du-rhone": { alt: "Marseille, Vieux-Port : bateaux à quai, la Bonne Mère sur sa colline", caption: "Marseille : le Vieux-Port et Notre-Dame de la Garde." },
    "place-fr-seine-et-marne": { alt: "Reflet du château de Fontainebleau dans l’eau de son étang", caption: "Seine-et-Marne : le château de Fontainebleau." },
    "place-fr-yvelines": { alt: "Façade dorée et cour de marbre du château de Versailles", caption: "Yvelines : le château de Versailles." },
    "place-be-belgium": { alt: "Grand-Place de Bruxelles : hôtel de ville et maisons des corporations, soleil couchant", caption: "Bruxelles : la Grand-Place au soleil couchant." },
    "place-ch-geneva": { alt: "Vue aérienne : le jet d’eau genevois, la ville et les montagnes au loin", caption: "Genève : le jet d’eau sur le Léman." },
    "place-ch-zurich": { alt: "Grossmünster et ses deux tours dominant la Limmat, vieille ville de Zurich", caption: "Zurich : le Grossmünster au bord de la Limmat." },
    "place-ca-canada": { alt: "Tour CN, Rogers Centre et gratte-ciel de Toronto, vus depuis le lac par beau temps", caption: "Toronto vu du lac, tour CN en tête." },
    "place-ca-quebec": { alt: "Le Château Frontenac au-dessus des toits du Vieux-Québec", caption: "Québec : le Château Frontenac." },
    "place-ca-ontario": { alt: "Brume au-dessus des chutes du Fer-à-Cheval sur la rivière Niagara, en Ontario", caption: "Ontario : chutes du Fer-à-Cheval (Niagara Falls)." },
    "place-ca-alberta": { alt: "Eaux turquoise du lac Louise et sommets enneigés, parc national Banff, en Alberta", caption: "Alberta : le lac Louise, dans le parc national Banff." },
    "place-ca-british-columbia": { alt: "Marina au premier plan, tours de Vancouver puis, au fond, les montagnes de la Rive-Nord", caption: "Colombie-Britannique : Vancouver, adossée aux montagnes de la Rive-Nord." },
    "place-ca-calgary": { alt: "Centre de Calgary et sa tour, ciel sans nuage", caption: "Calgary : le centre-ville et sa tour." },
    "place-ca-edmonton": { alt: "Centre d’Edmonton surplombant la rivière Saskatchewan Nord prise par les glaces, un jour d’hiver ensoleillé", caption: "Edmonton en hiver, au-dessus de la Saskatchewan Nord." },
    "place-ca-ottawa": { alt: "Tour de la Paix et édifice du Centre sur la colline du Parlement d’Ottawa, ciel bleu", caption: "Ottawa : la colline du Parlement." },
    "place-ca-toronto": { alt: "Bassin du square Nathan Phillips devant l’ancien hôtel de ville, au cœur de Toronto", caption: "Toronto : l’ancien hôtel de ville vu du square Nathan Phillips." },
  },
};

export const content: Dict["content"] = withShelfContent("fr", baseContent);
