/**
 * Spanish (Spain): modules — the return, store and stock modules, written as an observation ledger: a restock is a
 * "reaparición", a status is "en el estante" / "fuera del estante", a check is a "vistazo", the log is the "bitácora".
 * `label` arrives with its preposition ("en Madrid", "en Apple Puerta del Sol", "aquí"); numbers raw (formatted here),
 * durations and times already formatted.
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { n, reapariciones, configuraciones, dias, tiendas, v } from "./words";

/** "1 salida" / "9 salidas" (a listing that left the shelf). */
const salidas = (x: number) => `${n(x)} ${x === 1 ? "salida" : "salidas"}`;
/** "las 9:00" / "la 1:00". */
const las = (hour: string) => (/^1:/.test(hour) ? `la ${hour}` : `las ${hour}`);

export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `Página en blanco ${label} durante ${n(days)} días: ni reapariciones ni salidas del estante. Las barras empiezan con la primera anotación.`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `Días con reaparición ${label}: ${n(activeDays)} de ${n(days)}. En total, ${reapariciones(restocks)} y ${salidas(soldouts)} del estante.`,
    busiest: (day: string, restocks: number) => <> Fecha punta: <b className="text-ink">{day}</b>, con {n(restocks)} en esa jornada.</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day}: ${v(restocks, "volvió", "volvieron")} ${n(restocks)}, ${v(soldouts, "salió", "salieron")} ${n(soldouts)}`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day} · ${n(restocks)} de vuelta · ${n(soldouts)} fuera`,
    legendRestocks: "reapariciones",
    legendSoldouts: "salidas del estante",
  },

  last24: {
    title: (label: string) => `El iPhone Duo ${label}: lo que volvió en 24 horas`,
    asOf: (when: string) => `instantánea · ${when}`,
    localTime: (when: string) => `${when} (reloj de la tienda)`,
    anAppleStore: "un Apple Store fuera del catálogo",
    unknown: "El balance de 24 horas no ha cargado en esta petición. El estado del estante y la bitácora de reapariciones de esta página siguen siendo válidos.",
    none: (label: string, asOf: string) => <><b className="text-ink">24 horas en calma {label}:</b> ninguna reaparición del iPhone Duo anotada en la ventana hasta {asOf}.</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <>Reaparición más reciente: <b className="text-ink">{o.config}</b>, {o.when} según el reloj de la tienda{o.store != null && <>, anotada en {o.store}</>}. <b className="text-ink">{`${reapariciones(o.restocks)} en la ventana`}</b>{o.one ? null : <>, repartidas por {n(o.withStores)} {v(o.withStores, "tienda", "tiendas")} de {n(o.allStores)} {o.label}</>}.</>
    ),
    tileRestocks: "reapariciones en la ventana",
    tileConfigsBack: "configuraciones de nuevo en el estante",
    tileStores: (cfgs: number, allConfigs: number) => `tiendas con reaparición${cfgs ? ` · ${n(cfgs)}/${n(allConfigs)} configuraciones` : ""}`,
    tileLatest: (config: string, store: string | null) => <>la más reciente · {store != null && <>{store} · </>}{config}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>la anterior, {day} · {store != null && <>{store} · </>}{config}</>,
    tileNoEarlier: "nada anterior en el registro",
    caption: (label: string, asOf: string) => `Ventana de 24 horas hasta ${asOf} · reapariciones por configuración, iPhone Duo ${label}`,
    thConfig: "Configuración",
    thRestocks: "Reapariciones",
    thStores: "Tiendas",
    thLast: "La más reciente (reloj de la tienda)",
    thNow: "En el estante ahora",
    ofStores: (k: number, total: number) => `${n(k)}/${n(total)}`,
    noneIn24: "nada anotado",
    yes: "en el estante",
    no: "fuera",
    countedTitle: "Qué cuenta como reaparición",
    counted: "Una reaparición es el paso confirmado de no disponible a disponible de una configuración en una tienda. Cada una es un evento aparte, no un recuento de teléfonos. La lista en directo dice qué había en el último vistazo; el historial enseña dónde volvió el stock, pero no anticipa la próxima entrega.",
    alert: (label: string | null) => `Avisos de reaparición en tu móvil${label ? ` · ${label}` : ""}`,
  },

  clock: {
    none: (label: string, days: number) => `Sin reapariciones anotadas ${label} en ${n(days)} días.`,
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `Solo ${reapariciones(total)} ${v(total, "anotada", "anotadas")} ${label} en ${n(days)} días${dates != null ? `, en ${n(dates)} ${v(dates, "fecha", "fechas")}` : ""}: no basta para fijar una hora habitual.`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>Hora habitual de reaparición {label}: <b className="text-ink">{hour}</b> en el reloj de la tienda, según {reapariciones(total)} en {n(days)} días{day ? <>; el <b className="text-ink">{day}</b> encabeza la semana</> : null}.</>
    ),
    byHour: (zone: string) => `Franja horaria · ${zone}`,
    byWeekday: "Día de la semana",
    barReported: (k: number) => ` (+${n(k)} de informes externos)`,
    barReportedTitle: (bar: string, k: number) => `${bar}: ${n(k)} de informes externos`,
    legendOurs: "Reapariciones anotadas",
  },

  feed: {
    empty: "La bitácora de reapariciones aún está en blanco.",
    available: "En el estante",
    soldOut: "Ya no está",
    soldOutAt: (time: ReactNode) => <>salida · {time}</>,
    since: (time: ReactNode) => <>vuelta · {time}</>,
    restockedAt: (time: ReactNode) => <>vuelta · {time}</>,
    mapAria: (store: string) => `Situar ${store} en el atlas`,
    map: "Situar en el atlas",
    buyAria: (model: string, config: string) => `Pedir el ${model} ${config} en apple.com`,
    buy: "Pedir en apple.com",
  },

  byConfig: {
    empty: (label: string, days: number) => `Nada ha vuelto ${label} en ${n(days)} días, así que no hay nada que ordenar.`,
    intro: (label: string, days: number) => `Configuraciones ordenadas por reapariciones ${label} · ${n(days)} días.`,
    times: (k: number) => reapariciones(k),
    alert: "Vigilar",
  },

  sellout: {
    typical: (label: string, band: string) => `Vida mediana en el estante de una reaparición del iPhone Duo ${label}: ${band}, más o menos.`,
    half: (label: string, duration: string) => `La mitad de las reapariciones cronometradas ${label} salió del estante en ${duration} o menos.`,
    none: (label: string, days: number) => `Ninguna reaparición ${label} ha salido del estante en ${n(days)} días.`,
    whatDuo: "iPhone Duo",
    whatAll: "todos los modelos",
    tileHalf: (what: string) => <>vida mediana en el estante · {what}</>,
    tileWithin30: "fuera del estante en ≤ 30 s",
    tileWithin60: "fuera del estante en ≤ 1 min",
    tileFastest: (k: number, days: number) => <>la más breve de {n(k)} cronometradas, {n(days)} d</>,
    caption: (days: number) => `Modelo a modelo · ${n(days)} días`,
    thIphone: "Modelo",
    thSoldOut: "cronometradas",
    thHalf: "mediana",
    thWithin30: "≤ 30 s:",
    thWithin60: "≤ 1 min:",
    thFastest: "la más breve",
    each: "Una a una",
    barNote: (full: string) => `longitud = tiempo en el estante · ${full} la completa`,
    stillListed: (duration: string) => `sigue en el estante · ${duration}`,
    approx: (r: string) => `≈ ${r}`,
    measuredTitle: "Cómo se acota la vida en el estante",
    measured: (_estimated: boolean) => { void _estimated; return "Cada duración va de la última observación en el estante a la primera fuera de él. ≈ marca un intervalo estimado. Lo que dura menos que el hueco entre dos vistazos puede pasar sin verse, y ninguna de estas duraciones garantiza tiempo para completar la compra."; },
  },

  configTable: {
    title: "Revisión del estante por configuración",
    titleAt: (store: string) => `Revisión del estante por configuración · ${store}`,
    lookupOff: (hasRows: boolean) => `Apple ha pausado las consultas de recogida en esta tienda${hasRows ? "; las filas de abajo son sus últimas respuestas" : ""}`,
    tracked: (k: number) => `${configuraciones(k)} en el registro`,
    firstSweep: "Abriendo las observaciones; los primeros estados llegan en menos de un minuto",
    inStock: (k: number, total: number) => `en el estante: ${n(k)} de ${n(total)} seguidas`,
    available: "En el estante",
    unavailable: "Fuera del estante",
    noLookup: "consulta en pausa",
    notChecked: "pendiente del primer vistazo",
    since: (ago: ReactNode) => <>apareció {ago}</>,
    lastAvailable: (ago: ReactNode) => <>se vio por última vez {ago}</>,
    neverHere: "nunca visto aquí",
    buy: "Pedir",
    alertAria: (model: string, config: string, store: string) => `Vigilar el ${model} ${config} en ${store}`,
    alert: "Vigilar →",
  },

  matrix: {
    store: "Ubicación",
    checked: "Último vistazo",
    cellTitle: (model: string, k: number, total: number) => `${model}: ${n(k)} de ${configuraciones(total)} en el estante`,
  },

  nearby: {
    duo: (short: string, k: number) => `${short} en el estante · ${n(k)}`,
    noDuo: (short: string) => `${short} fuera del estante`,
  },

  stockByModel: {
    availableNow: (k: number, total: number) => `${n(k)}/${configuraciones(total)} en el estante`,
    noneNow: (total: number) => `0/${n(total)} en el estante`,
    lookupOff: "Consultas de recogida pausadas por Apple en esta tienda",
    notChecked: "pendiente del primer vistazo",
    more: (k: number) => `+${n(k)} más`,
    checked: (ago: ReactNode) => <>último vistazo {ago}</>,
    alert: "Vigilar →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>{ago} · Actualizaciones frecuentes del stock</>,
    map: "Ver en el atlas",
    alert: "Vigilar esta tienda",
    alsoIn: (region: string) => `Más en ${region}`,
    acrossLine: "Lo más cercano al otro lado del límite estatal",
    elsewhere: "Lo más cercano en otras zonas",
  },

  hours: {
    title: "Horario de apertura",
    local: (zone: string) => `Referencia horaria: ${zone}`,
    today: (hours: string, week: string) => ` · ${hours} hoy · ${week}`,
    directions: "Cómo ir",
    applePage: "Ficha de Apple",
    liveMap: "Verla en el atlas",
    storePage: "Registro de la tienda",
    closed: "cerrada",
    everyDay: (hours: string) => `A diario, ${hours}`,
    openNow: (closes: string) => `Abierta · hasta ${las(closes)}`,
    opensAt: (opens: string) => `Apertura: ${opens}`,
    closedToday: (next: string | null) => (next ? `Cerrada hoy · reabre ${next}` : "Cerrada hoy"),
    closedNow: (next: string | null) => (next ? `Cerrada por ahora · reabre ${next}` : "Cerrada por ahora"),
    nextOpen: (day: string | null, time: string) => `${day ?? "mañana"} ${time}`,
    span: (opens: string, closes: string) => `${opens} a ${closes}`,
  },

  liveStats: {
    inStock: "En el estante",
    storesWith: "Tiendas que lo tienen",
    lastCheck: "Último vistazo",
    none: "—",
  },

  board: {
    summary: (k: number, stores: number, short: string) => `${short} en el estante: ${n(k)} de ${tiendas(stores)}`,
    lastCheck: (ago: ReactNode) => <>Último vistazo {ago}</>,
    firstSweep: "Abriendo las observaciones.",
    noneListed: (model: string, storage: string | null, color: string | null) => `De momento, el ${model}${storage ? ` ${storage}` : ""}${color ? ` ${color}` : ""} no está en el estante de ninguna tienda.`,
    more: (k: number) => `+${n(k)} más`,
    seen: (ago: ReactNode) => <>Anotado {ago}</>,
    loading: "Leyendo los estantes",
  },

  /** DuoLedger: el registro de observaciones que abre las páginas de región, ciudad, tienda, país y del modelo Duo. `place` llega sin preposición. */
  duoLedger: {
    kicker: (place: string) => `Registro de observaciones · iPhone Duo · ${place}`,
    headNone: (o) => `${o.place}: ningún iPhone Duo listado para recogida en ${o.n === 1 ? "su Apple Store" : `sus ${n(o.n)} Apple Store`}.`,
    headNoneOne: (place: string) => `${place} no tiene a la vista ninguna configuración del iPhone Duo para recogida.`,
    headSome: (o) => <>{o.place}: el iPhone Duo figura para recogida en {n(o.k)} de {o.n === 1 ? "su Apple Store" : <>sus {n(o.n)} Apple Store</>} — {o.list}.</>,
    headSomeOne: (o) => <>{o.place} tiene en el estante {n(o.k)} de las {n(o.total)} configuraciones del iPhone Duo: {o.list}.</>,
    storeItem: (store: ReactNode, cfgs: number) => <>{store} ({configuraciones(cfgs)})</>,
    observed: (stamp: string) => `Anotado: ${stamp}.`,
    lastReturn: (o) => <>Última reaparición confirmada: <b className="text-ink">{o.config}</b>{o.store != null && <>, anotada en {o.store}</>} · {o.when}{o.lasted ? <> · {o.lasted}</> : null}.</>,
    noReturnYet: (place: string, since: string) => `${place}: ninguna reaparición confirmada del iPhone Duo desde que se abrió el registro, el ${since}.`,
    others: (o) => (o.one
      ? `Como referencia, esta tienda muestra ${n(o.pro)} de las ${n(o.configs)} configuraciones del iPhone 18 Pro y ${n(o.max)} de las ${n(o.configs)} del Pro Max.`
      : `Como referencia, el iPhone 18 Pro aparece en el estante de ${n(o.pro)} de estas tiendas, y el Pro Max en el de ${n(o.max)}.`),
    mReturns: (since: string) => `reapariciones confirmadas · registro abierto el ${since}`,
    mStores: "tiendas con alguna reaparición",
    mDays: "días seguidos con reaparición",
    mWindow: (pct: string) => `las dos horas locales con más actividad · ${pct} del registro`,
    mPerDay: "reapariciones por día seguido",
    mMedian: "estancia mediana, de aparecer a desaparecer",
    mToday: "reapariciones de hoy, por ahora",
    secUnit: "s",
    minUnit: "min",
    note: (o) => (o.one
      ? `Registro abierto el ${o.since}. En ${o.place}, ShelfSpring ha anotado desde entonces ${reapariciones(o.n)} ${v(o.n, "confirmada", "confirmadas")} del iPhone Duo, en ${n(o.days)} de ${n(o.tracked)} días seguidos. Las dos horas locales más activas fueron ${o.range} (${o.pct} del registro; ${o.morning} entre las 8 y el mediodía), y la hora punta ${o.busiest}, con ${n(o.busiestN)}.${o.median ? ` La mitad de las estancias medidas terminó en ${o.median}.` : ""}${o.config ? ` La configuración que más volvió fue ${o.config} (${n(o.top)} de ${n(o.n)}).` : ""}`
      : `Registro abierto el ${o.since}. En ${o.place}, entre sus ${n(o.stores)} Apple Store, ShelfSpring ha anotado ${reapariciones(o.n)} ${v(o.n, "confirmada", "confirmadas")} del iPhone Duo, y ${n(o.k)} de esas tiendas han tenido al menos una. Las dos horas locales más activas fueron ${o.range} (${o.zone}; ${o.pct} del registro; ${o.morning} entre las 8 y el mediodía), y la hora punta ${o.busiest}, con ${n(o.busiestN)}.${o.median ? ` La mitad de las estancias medidas terminó en ${o.median}.` : ""}${o.config ? ` La configuración que más volvió fue ${o.config} (${n(o.top)} de ${n(o.n)}).` : ""}`),
    noteFew: (o) => `${o.one ? o.place : `${o.place}, entre sus ${n(o.stores)} Apple Store`}: ${reapariciones(o.n)} ${v(o.n, "confirmada", "confirmadas")} del iPhone Duo a partir del ${o.since}, en ${dias(o.days)}. Queda por debajo del umbral de ${n(o.min)} reapariciones en ${n(o.minDays)} días que ShelfSpring exige antes de describir una hora habitual.${o.median ? ` La mitad de las estancias medidas terminó en ${o.median}.` : ""} Todas figuran en el registro de abajo.`,
    hourByHour: "Abrir el registro hora por hora →",
    ledger: (k: number) => (k === 1 ? "La reaparición más reciente del registro" : `Las ${n(k)} reapariciones más recientes del registro`),
    col: { observed: "Visto (reloj de la tienda)", config: "Configuración", store: "Tienda", listed: "Tiempo en el estante" },
    secs: (k: number) => `${n(k)} s`,
    mins: (k: number) => `${n(k)} min`,
    listedRange: (low: string, high: string) => `${low}–${high} en el estante`,
    listedAbout: (x: string) => `unos ${x} en el estante`,
    stillListed: (x: string) => `lleva ${x} en el estante`,
    method: (o) => `Registro abierto el ${o.since} · ${o.note} · una reaparición cuenta cuando dos observaciones seguidas coinciden; la primera aparición de una configuración nunca cuenta.`,
    delivered: (o) => (o.one
      ? `En los últimos ${n(o.days)} días, ShelfSpring entregó a sus miembros ${n(o.sent)} ${v(o.sent, "aviso", "avisos")} por reapariciones en ${o.place}.`
      : `En los últimos ${n(o.days)} días, ShelfSpring entregó a sus miembros ${n(o.sent)} ${v(o.sent, "aviso", "avisos")} por reapariciones en ${n(o.stores)} de las ${n(o.total)} tiendas Apple de ${o.place}.`),
    watch: (place: string) => `Vigilar una configuración en ${place} →`,
    watchOne: "Vigilar una configuración en esta tienda →",
    unknown: "No se pudo leer el registro de observaciones en esta petición; el estante en directo de arriba no se ve afectado.",
    zone: () => "hora de la tienda",
    allModels: (o) => `Todos los modelos juntos: ${reapariciones(o.n)} ${v(o.n, "anotada", "anotadas")} en ${n(o.days)} días${o.peak ? `; la hora más cargada fue ${o.peak}` : ""}.`,
  },
};
