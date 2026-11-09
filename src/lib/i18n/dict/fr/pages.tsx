import { withShelfPages } from "@/lib/seo/localizedCopy";
/**
 * Chaînes françaises : pages — tableau d’accueil, pages région, ville et magasin (France, Belgique, Suisse, Canada).
 * Les noms de lieux arrivent déjà en français ; les libellés passés aux modules des retours se lisent « à Paris »,
 * « dans le Rhône », « au Québec », « chez Apple Opéra », « dans ce magasin ».
 */
import type { Dict } from "../en";
import { COUNTRIES, type CountryCode } from "@/lib/apple/countries";
import { num, plural } from "@/lib/i18n/format";
import { IN, NAME, L, cap, dans, noun } from "./util";

const CHECK = "Inventaire actualisé en continu";
/** "de Paris" / "d’Apple Opéra". */
const de = (x: string) => (/^[aeiouyhâéèêîôû]/i.test(x) ? `d’${x}` : `de ${x}`);
const n = (cc: CountryCode | undefined, v: number) => num(L(cc), v);
const pl = (v: number, one: string, other: string) => plural("fr", v, { one, other });

const basePages: Dict["pages"] = {
  common: {
    checkNote: CHECK,
    appleStores: "Annuaire des magasins",
    showOnMap: "Situer sur la carte",
    restockLogs: "Registres des retours",
    fullLog: "Ouvrir le registre complet →",
    restocksBy: "Retours par configuration",
    lastDays: (days) => `Calendrier des retours sur ${days} jours`,
    nearbyCities: "Autres villes à portée de route",
    neighboringStates: "États limitrophes",
    acrossStateLine: "Juste après la frontière de l’État",
    allUsRestocks: "Chaque retour consigné aux États-Unis",
    allRestocksIn: (cc) => `Chaque retour consigné ${IN[cc]}`,
    regionRestocks: (place) => `Registre des retours · ${place}`,
    onTheMap: (place) => `Vue carte : ${place}`,
    allOf: (place) => `Vue d’ensemble · ${place}`,
    allOfArrow: (place) => `Tout le registre · ${place} →`,
    storeAndCity: (store, city) => `${city} · ${store}`,
    appleStorePage: (store) => `Fiche ${store} sur apple.com`,
    sourcesWhere: (k, cc) => (k === 1 ? `l’Apple Store observé ${IN[cc]}` : `${n(cc, k)} Apple Store observés ${IN[cc]}`),
    inPlace: (place) => dans(place),
    atPlace: (place) => `chez ${place}`,
    here: "dans ce magasin",
    storesWithIt: "magasins qui le proposent",
    whenRestock: (place) => `Rythme des retours ${dans(place)}`,
    duoHours: (place) => `Heures des retours de Duo consignés ${dans(place)}`,
    howFast: (place) => `Combien de temps les fiches restent en ligne ${dans(place)}`,
    latestIn: (place) => `${place} : dernières entrées du registre`,
    noneIn: (place) => `Rien de consigné pour ${place} à ce jour.`,
    faqTitle: (place) => `Questions de terrain · ${place}`,
    itemList: (place) => `Apple Store ${dans(place)}`,
    alertIn: (place) => `Surveiller des magasins ${dans(place)}`,
    panelPick: (place) => `Votre liste de veille ${dans(place)} : choisissez les téléphones, puis seulement les magasins que vous pourriez vraiment rejoindre`,
    matrixH2: "Rayons par magasin et par modèle",
    matrixHint: "En rayon au dernier passage / suivies, pour chaque modèle.",
    matrixLabel: "Rayons, magasin par magasin",
    cityPage: "Vue de la ville ↗",
    storePage: "Vue du magasin ↗",
    since: "2 novembre 2026",
  },
  home: {
    storesWith: (short) => `magasins qui affichent le ${short}`,
    restocks24: "retours, 24 dernières heures",
    week: (k) => ` · ${num("fr", k)} / 7 j`,
    lastCheck: "dernière observation",
    more: (k) => `+${num("fr", k)} de plus`,
    latest: (short) => `Retours de ${short} les plus récents au registre`,
    none: (short) => `Aucun retour de ${short} consigné à ce jour.`,
    allRestocks: "Registre complet des retours",
    modelMap: (short) => `Carte : ${short}`,
    buy: "Commander sur apple.com",
    liveStock: (short) => `Rayon ${short} du jour`,
    live: "En direct",
    alsoTracking: "Aussi au registre :",
    liveMap: "Carte du retrait",
    allStores: "Annuaire des magasins",
    questions: "Questions de terrain",
  },
  region: {
    counts: (stores, cities) => `${pl(cities, "# ville", "# villes")} · ${pl(stores, "# Apple Store", "# Apple Store")} · observés ${CHECK}`,
    nearbyOutside: (place) => `Magasins voisins, hors ${place}`,
    nearbyHint: (place) => `Distances mesurées depuis le centre du groupe de magasins ${dans(place)}.`,
    beyond: (place) => `En dehors · ${place}`,
    everyStore: (place) => `Liste des magasins · ${place}`,
    nearestRegions: (cc) => {
      const no = noun(COUNTRIES[cc]);
      return `${cap(no.other)} ${no.f ? "voisines" : "voisins"} ${IN[cc]}`;
    },
  },
  city: {
    counts: (stores) => `${pl(stores, "# Apple Store", "# Apple Store")} · observés ${CHECK}`,
    storeHeading: (name) => `Apple ${name}`,
    details: "Adresses et heures d’ouverture",
    outside: (place) => `Magasins voisins, hors ${place}`,
    outsideRegion: (region) => `Juste au-delà · ${region}`,
    around: (place) => `${place} et ses environs`,
    otherCities: (region) => `Autres villes · ${region}`,
  },
  store: {
    description: (a) => [
      `${a.place}, ${a.street}, ${a.city} : ${a.duo} configurations iPhone Duo, ${a.pro} iPhone 18 Pro et ${a.pm} Pro Max en stock pour le retrait, horaires du jour, heures de retour en stock et magasins proches.`,
      `${a.place}, ${a.where} : ${a.duo} configurations iPhone Duo, ${a.pro} 18 Pro et ${a.pm} Pro Max en stock pour le retrait, horaires du jour et retours en stock.`,
      `${a.place}, ${a.city} : stock en direct, ${a.duo} Duo, ${a.pro} 18 Pro, ${a.pm} Pro Max en stock, horaires et retours en stock.`,
    ],
    where: (city, cc) => `${city}, ${NAME[cc]}`,
    taxQ: (place) => `Que coûte un iPhone Duo chez ${place}, taxes comprises ?`,
    pickupQ: (place) => `${place} remet-il les commandes apple.com à retirer ?`,
    pickupA: (place) => `Oui. Pendant le paiement sur apple.com, choisissez le retrait en magasin chez ${place}, et ne vous déplacez qu’une fois qu’Apple annonce la commande prête. Au comptoir, présentez le pass Wallet ou le code QR en direct, votre numéro de commande et un document d’identité officiel avec photo (Apple refuse les captures d’écran).`,
    storeWord: (name) => (/^apple\b/i.test(name) ? name.replace(/^apple\s*/i, "Apple Store ") : `Apple Store ${name}`),
    hoursH2: (storeWord) => `Horaires, adresse et retrait · ${storeWord}`,
    hoursLead: (place, address, phone, today, week) => `Adresse ${de(place)} : ${address}${phone ? `, ${phone}` : ""}. Horaires du jour : ${today} ; semaine complète : ${week}.`,
    pickupRules: (helpUrl) => [
      `**Ne partez qu’après le message « prête » d’Apple**, pas avant ([règles de retrait d’Apple](${helpUrl}))`,
      "**Au comptoir :** le pass Wallet ou le code QR affiché en direct · votre numéro de commande · un document d’identité officiel avec photo",
      "**Refusée :** toute capture d’écran du code",
      "**Vous envoyez quelqu’un ?** Désignez-le comme contact de retrait pendant la commande",
    ],
    directions: (place, dirUrl, appleUrl) => `[Trajet jusqu’à ${place}](${dirUrl})${appleUrl ? ` · [Fiche Apple de ce magasin](${appleUrl})` : ""}`,
    onlyH2: (where, place) => `${place} : l’unique Apple Store ${where}`,
    onlyInCountry: (place, cc) => `${place} est l’unique Apple Store ${IN[cc]} ; chaque retrait en magasin ${IN[cc]} passe donc par lui. S’il liste une configuration, aucun second magasin ne permet de retenter sa chance : une veille sur lui constitue toute la stratégie.`,
    onlyInCity: (city, place, backups) => `Un seul Apple Store à ${city} : ${place}.${backups ? ` Viennent ensuite ${backups}.` : ""}`,
    backup: (apple, city, dist) => `${apple}, ${city} (${dist})`,
    onlyBlockCountry: (place) => `Une veille vise un seul magasin et une configuration précise ; l’alerte part une fois que ${place} la liste pour le retrait.`,
    onlyBlock: (place) => `Quand la configuration voulue manque chez ${place}, ces magasins méritent aussi votre veille : chacune vise un seul magasin et une configuration précise, et l’alerte part une fois que le magasin la liste.`,
    intro: (a) => (
      <>{a.place}{a.street ? ` (${a.street})` : ""} : en rayon pour le retrait à cet instant, <b className="text-ink">{num("fr", a.duo)}/{num("fr", a.duoOf)}</b> configurations d’iPhone Duo, <b className="text-ink">{num("fr", a.pro)}/{num("fr", a.proOf)}</b> d’iPhone 18 Pro et <b className="text-ink">{num("fr", a.pm)}/{num("fr", a.pmOf)}</b> d’iPhone 18 Pro Max.{a.peak ? <> Les retours y tombent le plus souvent vers <b className="text-ink">{a.peak}</b>, heure du magasin.</> : null}</>
    ),
    restocks30: (k) => `${pl(k, "# retour consigné", "# retours consignés")} en 30 jours`,
    lookupOff: "Apple ne répond pas aux demandes de retrait pour ce magasin actuellement. Le registre redemande toutes les 30 minutes et remplit le rayon dès qu’une réponse arrive.",
    checked: "Observé",
    alertHere: (short) => `Surveiller le ${short} dans ce magasin`,
    panel: (name) => `Liste de veille Apple ${name} : choisissez les téléphones, gardez ce magasin et ajoutez un magasin de secours à votre portée`,
    configsInStock: "configurations en rayon",
    stockNowH2: "Rayons de retrait à cet instant",
    whenRestock: (name) => `Apple Store ${name} : rythme des retours`,
    duoHours: (name) => `Apple Store ${name} : heures des retours de Duo consignés`,
    howFast: (name) => `Apple Store ${name} : combien de temps les fiches restent en ligne`,
    history: "Registre des retours",
    historyEmpty: "Le registre ne contient encore ni retour ni passage hors rayon pour ce magasin.",
    nearby: "Magasins de secours",
    elsewhereIn: (region) => `Plus loin · ${region}`,
    faqTitle: (place) => `Questions de terrain · ${place}`,
    applePage: (place) => `${place} sur apple.com : horaires et séances`,
    sourcesWhere: (k, cc) => (k === 1 ? `l’unique Apple Store ${IN[cc]}` : `${n(cc, k)} Apple Store ${IN[cc]}`),
    around: (place) => `Au-delà ${de(place)}`,
    otherInCity: (city) => `Même ville, autres magasins : ${city}`,
    cityPage: (city) => `Vue d’ensemble · ${city}`,
    moreIn: (region) => `Autres magasins plus loin · ${region}`,
    everyIn: (cc) => `Le reste de l’annuaire ${IN[cc]}`,
    allIn: (cc) => `Annuaire complet des magasins ${IN[cc]}`,
    countryHome: (cc) => `Vue d’ensemble · ${NAME[cc]}`,
    footnote: "Les états de rayon reprennent ce qu’apple.com répond sur le retrait en magasin, au moment de la dernière observation.",
    footnoteIntl: (cc) => ` Montants en ${COUNTRIES[cc].currency}, distances en kilomètres ; ce registre ne dépend d’aucune autorité ni d’aucun revendeur.`,
  },
};

export const pages: Dict["pages"] = withShelfPages("fr", basePages);
