/**
 * Chaînes françaises : modules — retours, magasins et rayons (src/components/{restocks,stores,stock}).
 * `label` est déjà une expression de lieu avec sa préposition (« à Paris », « dans le Rhône », « chez Apple Opéra »,
 * « ici »). Les nombres arrivent bruts (num / plural) ; durées, heures et dates arrivent déjà formatées.
 */
import type { Dict } from "../en";
import { num, plural } from "@/lib/i18n/format";

const n = (v: number) => num("fr", v);
/** « de Paris » / « d’Île-de-France » : le lieu après « Apple Store ». */
const deLieu = (p: string) => (/^[aeiouyàâäéèêëîïôöûüÀÂÉÈÊÎÔÛ]/.test(p) ? `d’${p}` : `de ${p}`);
const pl = (v: number, one: string, other: string) => plural("fr", v, { one, other });
const retours = (v: number) => pl(v, "# retour", "# retours");
const consignes = (v: number) => pl(v, "# retour consigné", "# retours consignés");
const duoConfirmes = (v: number) => pl(v, "# retour d’iPhone Duo confirmé", "# retours d’iPhone Duo confirmés");
const cfgs = (v: number) => pl(v, "# configuration", "# configurations");

export const modules: Dict["modules"] = {
  daily: {
    empty: (label, days) => `Page blanche ${label} sur ${days} jours : ni retour, ni passage hors rayon. Les barres démarrent à la première entrée.`,
    summary: (r, s, label, days, activeDays) =>
      `${pl(activeDays, "# jour", "# jours")} sur les ${days} derniers ${activeDays > 1 ? "ont" : "a"} vu un retour ${label} — ${n(r)} au total, et ${pl(s, "# passage", "# passages")} hors rayon.`,
    busiest: (day, r) => <> Date de pointe : <b className="text-ink">{day}</b>, {n(r)} ce jour-là.</>,
    barAria: (day, r, s) => `${day} : retours ${n(r)}, passages hors rayon ${n(s)}`,
    barTitle: (day, r, s) => `${day} · retours ${n(r)} · hors rayon ${n(s)}`,
    legendRestocks: "retours",
    legendSoldouts: "repassés hors rayon",
  },

  last24: {
    title: (label) => `iPhone Duo ${label} : les retours des 24 dernières heures`,
    asOf: (when) => `instantané · ${when}`,
    localTime: (when) => `${when}, horloge du magasin`,
    anAppleStore: "un Apple Store hors catalogue",
    unknown: "Le décompte sur 24 heures n’a pas pu être chargé pour cette requête. L’état des rayons et le registre des retours de cette page restent valables.",
    none: (label, asOf) => <><b className="text-ink">24 heures calmes {label} :</b> aucun retour d’iPhone Duo consigné dans la fenêtre arrêtée au {asOf}.</>,
    some: (o) => (
      <>Retour le plus récent : <b className="text-ink">{o.config}</b>, {o.when} à l’horloge du magasin{o.store != null && <>, relevé chez {o.store}</>}. <b className="text-ink">{pl(o.restocks, "# retour dans la fenêtre", "# retours dans la fenêtre")}</b>{o.one ? null : <>, dans {pl(o.withStores, "# magasin", "# magasins")} sur {n(o.allStores)} {o.label}</>}.</>
    ),
    tileRestocks: "retours dans la fenêtre",
    tileConfigsBack: "configurations revenues en rayon",
    tileStores: (configs, allConfigs) => `magasins avec un retour${configs ? ` · ${n(configs)}/${n(allConfigs)} configurations` : ""}`,
    tileLatest: (config, store) => <>le plus récent · {store != null && <>{store} · </>}{config}</>,
    tileBefore: (config, store, day) => <>retour précédent, {day} · {store != null && <>{store} · </>}{config}</>,
    tileNoEarlier: "rien de plus ancien au registre",
    caption: (label, asOf) => `iPhone Duo ${label}, configuration par configuration : retours sur 24 heures, jusqu’au ${asOf}`,
    thConfig: "Configuration",
    thRestocks: "Retours",
    thStores: "Magasins",
    thLast: "Plus récent (horloge du magasin)",
    thNow: "En rayon à présent",
    ofStores: (k, total) => `${n(k)}/${n(total)}`,
    noneIn24: "rien de consigné",
    yes: "en rayon",
    no: "hors rayon",
    countedTitle: "Ce qui compte comme un retour",
    counted: "Un retour, c’est le passage confirmé de « indisponible » à « disponible » pour un magasin et une configuration. Des retours répétés restent des événements distincts, pas un nombre de téléphones. La liste en direct dit ce qui était disponible au dernier contrôle ; l’historique montre où les fiches sont revenues, sans prédire la prochaine livraison.",
    alert: (label) => `Préparer des alertes de retour sur votre téléphone${label ? ` · ${label}` : ""}`,
  },

  clock: {
    none: (label, days) => `${days} jours sans retour consigné ${label}.`,
    thin: (total, label, days, dates) => `Seulement ${consignes(total)} ${label} en ${days} jours${dates != null ? `, sur ${pl(dates, "# date", "# dates")}` : ""} : pas assez pour désigner une heure habituelle.`,
    pattern: (total, label, days, hour, day) => (
      <>Heure de retour habituelle {label} : <b className="text-ink">{hour}</b> (heure du magasin), d’après {retours(total)} sur {days} jours{day ? <> ; le <b className="text-ink">{day}</b> mène la semaine</> : null}.</>
    ),
    byHour: (zone) => `Journée type · ${zone}`,
    byWeekday: "Semaine type",
    barReported: (k) => ` (+${pl(k, "# signalement extérieur", "# signalements extérieurs")})`,
    barReportedTitle: (bar, k) => `${bar} : ${pl(k, "# signalement extérieur", "# signalements extérieurs")}`,
    legendOurs: "Retours consignés",
  },

  feed: {
    empty: "Le registre des retours est vide pour l’instant.",
    available: "En rayon",
    soldOut: "Parti",
    soldOutAt: (time) => <>écoulé · {time}</>,
    since: (time) => <>retour · {time}</>,
    restockedAt: (time) => <>retour · {time}</>,
    mapAria: (store) => `Situer ${store} sur l’atlas`,
    map: "Situer sur l’atlas",
    buyAria: (model, config) => `Commander l’${model} ${config} via apple.com`,
    buy: "Commander sur apple.com",
  },

  byConfig: {
    empty: (label, days) => `Aucun retour ${label} en ${days} jours : rien à classer.`,
    intro: (label, days) => `Configurations classées selon leurs retours ${label}, sur ${days} jours.`,
    times: (k) => retours(k),
    alert: "Surveiller",
  },

  sellout: {
    typical: (label, band) => `Durée médiane en rayon d’un retour d’iPhone Duo ${label} : ${band}, à peu près.`,
    half: (label, duration) => `La moitié des retours chronométrés ${label} avaient quitté le rayon en ${duration}.`,
    none: (label, days) => `Aucun retour ${label} n’a quitté le rayon ces ${days} derniers jours.`,
    whatDuo: "iPhone Duo",
    whatAll: "tous modèles",
    tileHalf: (what) => <>durée médiane en rayon · {what}</>,
    tileWithin30: "hors rayon en ≤ 30 s",
    tileWithin60: "hors rayon en ≤ 1 min",
    tileFastest: (k, days) => <>le plus bref sur {n(k)} retours chronométrés, {days} j</>,
    caption: (days) => `Modèle par modèle, sur ${days} jours`,
    thIphone: "Modèle",
    thSoldOut: "chronométrés",
    thHalf: "médiane",
    thWithin30: "≤ 30 s :",
    thWithin60: "≤ 1 min :",
    thFastest: "le plus bref",
    each: "Retour après retour",
    barNote: (full) => `longueur de barre = temps en rayon · ${full} la remplit`,
    stillListed: (duration) => `encore en rayon · ${duration}`,
    approx: (range) => `≈ ${range}`,
    measuredTitle: "Comment le temps en rayon est encadré",
    measured: (_estimated: boolean) => { void _estimated; return "Le temps en rayon est borné par la dernière observation « disponible » et la première « indisponible ». Le signe ≈ marque un intervalle estimé. Une fiche plus brève qu’un intervalle de contrôle peut échapper au relevé ; ces durées ne garantissent aucune fenêtre de commande."; },
  },

  configTable: {
    title: "Relevé des rayons par configuration",
    titleAt: (store) => `Relevé des rayons par configuration · ${store}`,
    lookupOff: (hasRows) => `Apple a suspendu la consultation du retrait pour ce magasin${hasRows ? " ; les lignes ci-dessous sont ses dernières réponses" : ""}`,
    tracked: (k) => `${cfgs(k)} sur la liste de veille`,
    firstSweep: "Premières observations en cours ; les premiers statuts arrivent d’ici une minute",
    inStock: (k, total) => `en rayon : ${n(k)} sur ${n(total)} suivies`,
    available: "En rayon",
    unavailable: "Hors rayon",
    noLookup: "consultation suspendue",
    notChecked: "premier passage à venir",
    since: (ago) => <>apparu {ago}</>,
    lastAvailable: (ago) => <>vu en dernier {ago}</>,
    neverHere: "jamais vu ici",
    buy: "Commander",
    alertAria: (model, config, store) => `Surveiller l’${model} ${config} chez ${store}`,
    alert: "Surveiller →",
  },

  matrix: {
    store: "Lieu",
    checked: "Dernier passage",
    cellTitle: (model, k, total) => `${model} : ${pl(k, "# configuration en rayon", "# configurations en rayon")} sur ${n(total)}`,
  },

  nearby: {
    duo: (short, k) => `${short} en rayon · ${n(k)}`,
    noDuo: (short) => `${short} hors rayon`,
  },

  stockByModel: {
    availableNow: (k, total) => `${n(k)}/${n(total)} configurations en rayon`,
    noneNow: (total) => `0/${n(total)} en rayon`,
    lookupOff: "Consultation du retrait suspendue par Apple pour ce magasin",
    notChecked: "premier passage à venir",
    more: (k) => `+${n(k)} de plus`,
    checked: (ago) => <>dernier passage {ago}</>,
    alert: "Surveiller →",
  },

  storeBlock: {
    checked: (ago) => <>{ago} · Inventaire actualisé en continu</>,
    map: "Voir sur l’atlas",
    alert: "Surveiller ce magasin",
    alsoIn: (region) => `Plus de magasins · ${region}`,
    acrossLine: "Au plus près, juste après la limite de l’État",
    elsewhere: "Au plus près, ailleurs",
  },

  hours: {
    title: "Heures d’ouverture",
    local: (zone) => `Fuseau du magasin : ${zone}`,
    today: (hours, week) => ` · ${hours} aujourd’hui · ${week}`,
    directions: "Y aller",
    applePage: "La fiche Apple",
    liveMap: "Le voir sur l’atlas",
    storePage: "Fiche du magasin",
    closed: "fermé",
    everyDay: (hours) => `Chaque jour ${hours}`,
    openNow: (closes) => `Portes ouvertes · jusqu’à ${closes}`,
    opensAt: (opens) => `Ouverture des portes à ${opens}`,
    closedToday: (next) => (next ? `Portes closes aujourd’hui · réouverture ${next}` : "Portes closes aujourd’hui"),
    closedNow: (next) => (next ? `Portes closes pour l’instant · réouverture ${next}` : "Portes closes pour l’instant"),
    nextOpen: (day, time) => `${day ?? "demain"} dès ${time}`,
    span: (opens: string, closes: string) => `${opens} à ${closes}`,
  },

  liveStats: {
    inStock: "En rayon",
    storesWith: "Magasins qui le proposent",
    lastCheck: "Dernier passage",
    none: "—",
  },

  board: {
    summary: (k, stores, short) => `${short} en rayon dans ${pl(k, "# magasin", "# magasins")} sur ${n(stores)}`,
    lastCheck: (ago) => <>Dernier passage {ago}</>,
    firstSweep: "Premières observations en cours.",
    noneListed: (model, storage, color) => `Aucun magasin n’a l’${model}${storage ? ` ${storage}` : ""}${color ? ` ${color}` : ""} en rayon pour le moment.`,
    more: (k) => `+${n(k)} de plus`,
    seen: (ago) => <>Consigné {ago}</>,
    loading: "Lecture des rayons",
  },

  /** DuoLedger : le registre d’observation qui ouvre les pages de région, de ville, de magasin, de pays et du modèle Duo. `place` arrive sans préposition. */
  duoLedger: {
    kicker: (place) => `Registre d’observation · iPhone Duo · ${place}`,
    headNone: (o) => (o.n === 1
      ? `L’unique Apple Store ${deLieu(o.place)} a l’iPhone Duo hors rayon pour le retrait.`
      : `Les ${n(o.n)} Apple Store ${deLieu(o.place)} ont tous l’iPhone Duo hors rayon pour le retrait.`),
    headNoneOne: (place) => `${place} : iPhone Duo hors rayon pour le retrait, toutes configurations confondues.`,
    headSome: (o) => <>iPhone Duo en rayon pour le retrait dans {n(o.k)} des {n(o.n)} Apple Store {deLieu(o.place)} : {o.list}.</>,
    headSomeOne: (o) => <>{o.place} · iPhone Duo en rayon pour le retrait : {cfgs(o.k)} sur {n(o.total)} — {o.list}.</>,
    storeItem: (store, configs) => <>{store} ({cfgs(configs)})</>,
    observed: (stamp) => `Relevé du ${stamp}.`,
    lastReturn: (o) => <>Retour confirmé le plus récent : {o.when} — <b className="text-ink">{o.config}</b>{o.store != null && <>, chez {o.store}</>}{o.lasted ? <> ; {o.lasted}</> : null}.</>,
    noReturnYet: (place, since) => `Registre ouvert le ${since} : pas encore de retour d’iPhone Duo confirmé pour ${place}.`,
    others: (o) => (o.one
      ? `Pour comparer, ce magasin a ${n(o.pro)} des ${n(o.configs)} configurations d’iPhone 18 Pro en rayon, et ${n(o.max)} des ${n(o.configs)} du Pro Max.`
      : `Pour comparer : ${n(o.pro)} de ces magasins ont l’iPhone 18 Pro en rayon, ${n(o.max)} le Pro Max.`),
    mReturns: (since) => `retours confirmés, registre ouvert le ${since}`,
    mStores: "magasins ayant connu au moins un retour",
    mDays: "jours suivis avec au moins un retour",
    mWindow: (pct) => `les deux heures locales les plus chargées · ${pct} du registre`,
    mPerDay: "retours par jour suivi",
    mMedian: "temps médian en rayon, de l’apparition au départ",
    mToday: "retours aujourd’hui, jusqu’ici",
    secUnit: "s",
    minUnit: "min",
    note: (o) => (o.one
      ? `Registre ouvert le ${o.since} : ShelfSpring a consigné ${duoConfirmes(o.n)} chez ${o.place}, répartis sur ${n(o.days)} des ${n(o.tracked)} jours suivis. Créneau le plus chargé : ${o.range} (${o.pct} du registre ; ${o.morning} entre 8 h et midi) ; heure de pointe : ${o.busiest}, avec ${n(o.busiestN)}.${o.median ? ` La moitié des fiches mesurées étaient parties en ${o.median}.` : ""}${o.config ? ` Configuration la plus souvent revenue : ${o.config} (${n(o.top)} sur ${n(o.n)}).` : ""}`
      : `Sur l’ensemble des ${n(o.stores)} Apple Store ${deLieu(o.place)}, ShelfSpring a consigné ${duoConfirmes(o.n)} depuis le ${o.since}, et ${n(o.k)} de ces magasins en ont connu au moins un. Créneau le plus chargé : ${o.range}, ${o.zone} (${o.pct} du registre ; ${o.morning} entre 8 h et midi) ; heure de pointe : ${o.busiest}, avec ${n(o.busiestN)}.${o.median ? ` La moitié des fiches mesurées étaient parties en ${o.median}.` : ""}${o.config ? ` Configuration la plus souvent revenue : ${o.config} (${n(o.top)} sur ${n(o.n)}).` : ""}`),
    noteFew: (o) => `${duoConfirmes(o.n)} ${o.one ? `chez ${o.place}` : `sur l’ensemble des ${n(o.stores)} Apple Store ${deLieu(o.place)}`} depuis le ${o.since}, sur ${pl(o.days, "# jour", "# jours")} — en deçà du seuil de ${n(o.min)} retours et ${n(o.minDays)} jours que ShelfSpring s’impose avant de parler d’heure habituelle.${o.median ? ` La moitié des fiches mesurées étaient parties en ${o.median}.` : ""} Les retours eux-mêmes figurent dans le registre ci-dessous.`,
    hourByHour: "Consulter le registre heure par heure →",
    ledger: (k) => (k === 1 ? "Le retour consigné le plus récent" : `Les ${n(k)} retours consignés les plus récents`),
    col: { observed: "Vu (horloge du magasin)", config: "Configuration", store: "Magasin", listed: "Temps en rayon" },
    secs: (k) => `${n(k)} s`,
    mins: (k) => `${n(k)} min`,
    listedRange: (low, high) => `${low}–${high} en rayon`,
    listedAbout: (x) => `environ ${x} en rayon`,
    stillListed: (x) => `en rayon depuis ${x} déjà`,
    method: (o) => `Registre tenu depuis le ${o.since} · ${o.note} · un retour n’entre au registre que si deux observations successives concordent ; la première apparition d’une configuration n’est jamais comptée.`,
    delivered: (o) => (o.one
      ? `${pl(o.sent, "# alerte remise", "# alertes remises")} aux membres de ShelfSpring en ${n(o.days)} jours, pour des retours chez ${o.place}.`
      : `${pl(o.sent, "# alerte remise", "# alertes remises")} aux membres de ShelfSpring en ${n(o.days)} jours, pour des retours dans ${n(o.stores)} des ${n(o.total)} Apple Store ${deLieu(o.place)}.`),
    watch: (place) => `Mettre une configuration en veille pour ${place} →`,
    watchOne: "Mettre une configuration en veille dans ce magasin →",
    unknown: "Le registre d’observation n’a pas pu être lu pour cette requête ; la liste en direct ci-dessus n’en dépend pas.",
    zone: () => "heure du magasin",
    allModels: (o) => `Tous modèles réunis : ${consignes(o.n)} sur ${n(o.days)} jours${o.peak ? ` ; heure la plus fournie : ${o.peak}` : ""}.`,
  },
};
