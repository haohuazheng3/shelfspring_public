import { withShelfContent } from "@/lib/seo/localizedCopy";
/**
 * Spanish (Spain): content — the SEO building blocks (FAQ, browse rows, stat strips, product parts, sources), the
 * enrich helpers' words (hours, durations, FAQ answers, titles), live tokens, the return-pattern sentence and
 * photo alt text. Voice: an observation ledger ("reaparición", "en el estante", "vistazo"). Arguments arrive formatted for Spanish (numbers, durations, "9:00" hours, colour names).
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import type { Forms } from "@/lib/i18n/format";
import { aprox, fixDay, fixHour } from "./words";

const f = (x: Forms): Forms => x;

type Kind = "state" | "city" | "store" | "model";

/** "las 9:00" / "la 1:00" for an hour label. */
const lasS = (hour: string): string => { const x = fixHour(hour); return /^1:/.test(x) ? `la ${x}` : `las ${x}`; };
/** "los lunes", "los sábados". */
const losDays = (day: string): string => { const d = fixDay(day); return /o$/.test(d) ? `los ${d}s` : `los ${d}`; };

const baseContent: Dict["content"] = {
  hours: {
    closed: "Cerrada",
    everyDay: (hours: string) => `A diario, ${hours}`,
    tomorrow: "mañana",
    dayAt: (day: string, time: string) => `${day} ${fixHour(time)}`,
    closedTodayOpens: (next: string) => `Cerrada hoy · reabre ${next}`,
    closedToday: "Cerrada todo el día",
    opensAt: (time: string) => `Apertura: ${fixHour(time)}`,
    openNow: (closes: string) => `Abierta hasta ${lasS(closes)}`,
    closedNowOpens: (next: string) => `Cerrada por ahora · reabre ${next}`,
    closedNow: "Cerrada por ahora",
  },

  duration: {
    underAMinute: "menos de un minuto",
    pair: (a: string, b: string) => `${a} ${b}`,
  },
  listMore: (n: string) => `${n} más`,
  nearLine: (place: string, distance: string) => `${place} (${distance})`,

  faq: {
    where: (kind: Kind, place: string) => (kind === "model" ? `del ${place}` : `en ${place}`),
    nRestocks: f({ one: "# reaparición confirmada", other: "# reapariciones confirmadas" }),
    restockA: ({ count, where, days, week, peak }: { count: string | null; where: string; days: string; week: string; peak: { hour: string; day: string | null } | null }) =>
      `${count == null ? `El registro de ${days} días no tiene ninguna reaparición ${where}` : `El registro de ${days} días suma ${count} ${where}, ${week} de ellas esta semana`}${peak ? `; se concentran hacia ${lasS(peak.hour)}, hora local${peak.day ? `, y ${losDays(peak.day)} es cuando más se ven` : ""}` : ""}. Apple no publica calendario.`,
    lastsNone: (where: string) => `Todavía no hay suficientes ciclos completos de reaparición y salida ${where} para medirlo.`,
    lasts: (days: string, duration: string) => `Tiempo mediano en el estante dentro del registro de ${days} días: ${aprox(duration)} entre una reaparición y la siguiente salida.`,
    storeIn: (store: string, line: string) => `${store} · ${line}`,
    nearestA: (stores: string) => `Alternativas más próximas: ${stores}.`,

    modelStockQ: (model: string) => `¿En qué tiendas está ahora el ${model} en el estante?`,
    modelStockNone: (model: string) => `En ninguna, según la última observación; la lista de esta página cambia en cuanto un Apple Store de EE. UU. pone el ${model} para recogida.`,
    nUsStores: f({ one: "# Apple Store de EE. UU.", other: "# Apple Store de EE. UU." }),
    modelStockSome: (count: string) => `En ${count} según la última observación; cada uno aparece abajo con las configuraciones que lista.`,
    priceQ: (model: string) => `¿Qué cuesta el ${model} en apple.com?`,
    priceA: (low: string, high: string, storages: string, colors: string) => `Libre, va de ${low} a ${high} según la capacidad (${storages}); acabados: ${colors}.`,
    modelRestockQ: (model: string) => `¿Con qué frecuencia vuelve el ${model} al estante?`,
    modelLastsQ: (model: string) => `¿Cuánto sigue listado un ${model} que vuelve?`,
    reserveQ: (model: string) => `¿Se puede apartar un ${model} antes de pedirlo?`,
    reserveA: "Antes del pedido, no: cuando una tienda lista la configuración, haces el pedido en apple.com con recogida en tienda, y solo entonces queda apartada para tu franja de recogida.",

    storeStockQ: (store: string, model: string) => `¿Está el ${model} en el estante de ${store}?`,
    nConfigs: f({ one: "# configuración", other: "# configuraciones" }),
    storeStockYes: (count: string) => `Sí: ${count} en la última observación, con capacidad y acabado en la tabla de esta página.`,
    storeStockNo: (other: { pro: string; proMax: string } | null) => `No en la última observación${other ? `; la tienda sí lista ${other.pro} configuraciones del iPhone 18 Pro y ${other.proMax} del 18 Pro Max` : ", y el 18 Pro y el 18 Pro Max también están fuera del estante"}.`,
    hoursQ: (store: string) => `¿Cuándo abre ${store}?`,
    hoursA: ({ hours, today, address, phone }: { hours: string | null; today: string | null; address: string; phone: string | null }) =>
      `${hours ?? "Consulta el horario en esta página"}${today ? ` (hoy ${today})` : ""}, en ${address}${phone ? `; teléfono ${phone}` : ""}.`,
    storeRestockQ: (store: string) => `¿Con qué frecuencia vuelven los iPhone al estante de ${store}?`,
    storeLastsQ: (store: string) => `¿Cuánto siguen listadas las reapariciones en ${store}?`,
    storeNearestQ: (store: string) => `¿Qué otros Apple Store quedan más cerca de ${store}?`,

    placeStockQ: (place: string, model: string) => `¿En qué tiendas de ${place} está el ${model} en el estante ahora?`,
    placeStockNone: (place: string, model: string) => `En ninguna, según la última observación; en cuanto una tienda de ${place} liste el ${model} para recogida, aparecerá en esta página.`,
    nStores: f({ one: "# tienda", other: "# tiendas" }),
    placeStockSome: (count: string, stores: string) => `${count} en la última observación: ${stores}.`,
    countQ: (place: string) => `¿Cuántas tiendas Apple tiene ${place}?`,
    nAppleStores: f({ one: "# Apple Store", other: "# Apple Store" }),
    countMany: (count: string, stores: string) => `${count}; por ejemplo, ${stores}.`,
    countOne: (count: string, store: string) => `${count}, en concreto ${store}.`,
    placeRestockQ: (place: string) => `¿Con qué frecuencia vuelven los iPhone al estante en ${place}?`,
    placeLastsQ: (place: string) => `¿Cuánto dura el stock tras una reaparición en ${place}?`,
    placeNearestQ: (place: string) => `¿Qué Apple Store fuera de ${place} quedan más cerca?`,
  },

  explainer: (kind: Kind, place: string) => {
    const at = kind === "store" ? place : kind === "model" ? "todos los Apple Store de EE. UU." : `los Apple Store de ${place}`;
    return [
      "Las recogidas pertenecen a apple.com: el pago pide una configuración y una tienda, se paga en línea y se recoge en persona, a menudo el mismo día. El stock de los estantes físicos y el de los operadores es otra cosa.",
      `ShelfSpring anota cada configuración seguida en ${at} a partir de un flujo de inventario sincronizado; un cambio entra en el registro solo tras una observación que lo confirme.`,
      "Cada cambio confirmado se convierte en una entrada del registro, y esas entradas dibujan los gráficos de reapariciones y el historial de esta página.",
    ];
  },
  alertRule: "Cada aviso está ligado a una sola tienda y a una sola configuración exacta; las notificaciones siguen a la disponibilidad detectada tras la sincronización, así que confirma el pedido con Apple.",

  titles: {
    state: (name: string, duoNow: string, stores: string) => [
      `Apple Store en ${name}: ${duoNow} de ${stores} ${duoNow === "1" ? "tiene" : "tienen"} el iPhone Duo`,
      `Apple Store en ${name}: stock del iPhone Duo en directo`,
      `Apple Store en ${name}: stock del iPhone Duo`,
      `Apple Store ${name}: stock de iPhone`,
    ],
    city: (city: string, code: string, duoNow: string, stores: string) => [
      `Apple Store en ${city}, ${code}: ${duoNow} de ${stores} ${duoNow === "1" ? "tiene" : "tienen"} el iPhone Duo`,
      `Apple Store en ${city}, ${code}: stock del iPhone Duo`,
      `Apple Store ${city}, ${code}: stock del iPhone Duo`,
      `Apple Store ${city}: stock de iPhone`,
    ],
    store: (name: string, region: string | null) => {
      const r = region ? ` (${region})` : "";
      return [
        `${name}${r}: stock de iPhone hoy, recogida y horario`,
        `${name}${r}: stock de iPhone hoy y horario`,
        `${name}${r}: stock de iPhone y horario`,
        `${name}: stock de iPhone hoy, recogida y horario`,
        `${name}: stock de iPhone y horario`,
        `${name}: stock de iPhone`,
        `${name} – stock`,
      ];
    },
    model: (name: string, storesNow: string) => [
      `Stock del ${name} para recogida: ${storesNow} Apple Store lo ${storesNow === "1" ? "tiene" : "tienen"} ahora`,
      `Stock del ${name}: ${storesNow} Apple Store lo ${storesNow === "1" ? "tiene" : "tienen"} ahora`,
      `Stock del ${name} para recogida en tienda, en directo`,
    ],
  },

  tokens: {
    tooFewToMeasure: "aún no se puede medir",
    noneLoggedYet: "todavía no consta en el registro",
    noneYet: "aún sin anotar",
  },

  pattern: {
    none: (days: string) => `El registro de ${days} días no tiene ninguna reaparición confirmada.`,
    nConfirmed: f({ one: "# reaparición confirmada", other: "# reapariciones confirmadas" }),
    countIn: (count: string, days: string) => `${count} en ${days} días`,
    stay: (minutes: string) => `; anuncio mediano de unos ${minutes} min`,
    nDays: f({ one: "# día", other: "# días" }),
    tooFew: (count: string, onDays: string | null, stay: string) => `${count}${onDays ? `, todas en ${onDays}` : ""}: no hay días suficientes para fijar una hora típica${stay}.`,
    usual: (hour: string, weekday: string | null, count: string, stay: string) => `Las reapariciones se concentran hacia ${lasS(hour)}, hora local${weekday ? `, sobre todo el ${fixDay(weekday)}` : ""}; ${count}${stay}.`,
  },

  regionNouns: {
    state: f({ one: "estado", other: "estados" }),
    province: f({ one: "provincia", other: "provincias" }),
    area: f({ one: "zona", other: "zonas" }),
    department: f({ one: "departamento", other: "departamentos" }),
    prefecture: f({ one: "prefectura", other: "prefecturas" }),
    emirate: f({ one: "emirato", other: "emiratos" }),
    canton: f({ one: "cantón", other: "cantones" }),
    region: f({ one: "región", other: "regiones" }),
    county: f({ one: "provincia", other: "provincias" }),
    city: f({ one: "ciudad", other: "ciudades" }),
  } as Record<string, Forms>,

  measured: "Notas de método",

  faqTitle: "Preguntas habituales",
  breadcrumb: "Rastro de la página",
  keepExploring: "Más del registro",
  browse: {
    storesByState: "Recorrer por estado",
    allStatesCities: "Cada estado y cada ciudad →",
    liveByModel: "Estado del estante por iPhone",
    modelStock: (model: string) => `Disponibilidad del ${model}`,
    thisPage: "estás aquí",
    restockLog: (short: string) => `Registro de reapariciones del ${short}`,
    liveMap: "Vista de mapa",
    mostStores: "Donde hay más tiendas",
    allStates: "Cada estado",
    bigCities: "Ciudades principales",
    cities: "Ciudades con tienda",
    storesBy: (region: string) => `Recorrer por ${region}`,
    allStoresIn: ({ country }: { inName: string; country: string }) => <>Lista completa de tiendas de {country} →</>,
    allRegions: (regions: string) => `Lista completa de ${regions}`,
  },
  modelCards: "Por modelo",
  narrative: {
    lastRestock: (config: ReactNode, at: ReactNode, ago: ReactNode) => <>{" "}Última reaparición anotada: {config}{at}, {ago}.</>,
    at: (store: ReactNode) => <> en {store}</>,
  },
  statStrip: {
    inStockNow: "En el estante ahora",
    ofStores: (n: string) => `entre ${n} tiendas`,
    stores: "Ubicaciones",
    nCities: f({ one: "en # ciudad", other: "en # ciudades" }),
    tracked: "en el registro",
    modelNow: (short: string) => `${short} en el estante`,
    configsInStock: "configuraciones en el estante",
    storesWithStock: f({ one: "tienda que lo tiene", other: "tiendas que lo tienen" }),
    restocks24h: "Reapariciones, 24 h",
    restocksHint: (week: string, month: string, days: string) => `7 d: ${week} · ${days} d: ${month}`,
    sellOuts: (days: string) => `Fuera otra vez (${days} d)`,
    stays: (duration: string) => (/^menos /.test(duration) ? `estancia mediana: ${duration}` : `estancia mediana ~${duration}`),
    noPairs: "sin ciclos completos",
    lastRestock: "Última reaparición",
    noneYet: "sin anotar aún",
    inLastDays: (days: string) => `en ${days} días`,
  },
  product: {
    chooseIphone: "Elige modelo",
    storage: "Capacidad",
    color: "Acabado",
    all: "Cualquiera",
    numbersAre: (unit: ReactNode) => <>Cada cifra cuenta {unit} que lo tienen ahora en el estante.</>,
    seen: (ago: ReactNode) => <>anotado {ago} · en el estante</>,
    last: (ago: ReactNode) => <>en el estante por última vez {ago} · fuera ahora</>,
    notSeenYet: "aún sin anotar en el estante",
    firstCheckPending: "pendiente de la primera observación",
    inStock: "En el estante",
    inStockLower: "en el estante",
    none: "fuera",
    here: "justo aquí",
    notAvailable: "Fuera del estante",
    notCheckedYet: "Sin observación aún",
    availableForPickup: "Listado para recogida",
    since: (ago: ReactNode) => <> · anotado por primera vez {ago}</>,
    lastInStock: (ago: ReactNode) => <>En el estante por última vez {ago}</>,
    neverSeen: "Aún no anotado en este estante",
    firstCheckSoon: "Primera observación en breve",
    buy: "Pedir a través de apple.com",
    checked: (checked: ReactNode, note: ReactNode) => <>Observado {checked} · {note}</>,
    checkNote: "actualizaciones frecuentes del inventario",
  },

  source: (source: ReactNode) => <>Datos: {source}</>,
  photoCredit: (link: ReactNode) => <>Imagen: {link}</>,
  sources: "Referencias",
  allUsStores: "el conjunto completo de 269 Apple Store de EE. UU.",
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>Registro de observaciones de ShelfSpring para {where}: abierto el {since}, con las cifras al día a {asOf}. Los avisos salen cuando se detecta disponibilidad que coincide con tu lista; la consulta en origen, la sincronización y la entrega pueden sumar algo de demora. La fecha de apertura es la de los datos, no la de la antigüedad de ShelfSpring.</>,
  live: {
    configsCaption: (stores: ReactNode, model: ReactNode) => <>{model}: cuántos de los {stores} Apple Store listan cada configuración en esta observación</>,
    storage: "Capacidad",
    pricesCaption: (model: ReactNode) => <>{model} en apple.com: precio de lista, libre y antes de impuestos, junto a las tiendas que lo listan ahora</>,
    price: "Precio de lista",
    bestColor: "Acabado más listado (tiendas)",
    noRestock: (model: string) => `El registro aún no tiene ninguna reaparición del ${model}.`,
    clockLabel: (model: string) => `en las tiendas de EE. UU. para el ${model}`,
    storesWithIt: "Tiendas que lo listan",
    pairsInStock: "Pares tienda–configuración en el estante",
    restocksLogged: "Reapariciones en el registro",
    medianTime: "Tiempo mediano en el estante",
    underOneMin: (min: string) => `< ${min}`,
  },

  photos: {
    "apple-store-pickup-counter": { alt: "Mostrador de madera con el letrero Pickup en el interior de un Apple Store", caption: "Aquí se entregan los pedidos con recogida en tienda." },
    "phone-map": { alt: "Dos manos consultan un mapa en el móvil, en plena calle", caption: "Cuando una reaparición dura un minuto, la distancia pesa más de lo que parece." },
    "phone-card-payment": { alt: "Mujer con un iPhone y una tarjeta bancaria haciendo un pago en línea", caption: "El pago se hace en línea; la recogida, en la tienda." },
    "phone-on-box": { alt: "Smartphone recién estrenado sobre su caja blanca", caption: "Recién salido de la caja." },
    "city-map-phone": { alt: "Dos personas miran un plano de la ciudad en la pantalla de un móvil", caption: "Trazando la ruta hasta la tienda." },
    "phone-notification": { alt: "Una mano sostiene un móvil con avisos en la pantalla bloqueada", caption: "Así llega un aviso a la pantalla bloqueada." },
    "apple-store-crowd-inside": { alt: "Interior abarrotado de un Apple Store de centro comercial, con gente en fila", caption: "Fila en un Apple Store durante la semana del lanzamiento: lo que llega a tienda dura minutos." },
    "apple-store-glass-canopy": { alt: "Fachada de cristal de un Apple Store con marquesina de madera, de noche", caption: "Un Apple Store acristalado, ya de noche." },
    "apple-store-night-vancouver": { alt: "Apple Store iluminado por la noche en Vancouver", caption: "De noche también puede reaparecer stock para recogida, aunque el registro lo ve mucho más por la mañana." },
    "phone-hand-camera": { alt: "Una persona sostiene un iPhone de triple cámara", caption: "Los Pro son los modelos que generan fila." },
    "place-es-spain": { alt: "Ciudad de las Artes y las Ciencias de Valencia con el cielo azul", caption: "Valencia: la Ciudad de las Artes y las Ciencias." },
    "place-es-madrid-region": { alt: "Las Cuatro Torres del norte de Madrid con la sierra detrás", caption: "Madrid: las Cuatro Torres, su distrito de negocios." },
    "place-es-madrid": { alt: "Edificio Metrópolis en la Gran Vía madrileña, con el cielo despejado", caption: "Madrid: el Metrópolis, en plena Gran Vía." },
    "place-es-barcelona": { alt: "La Sagrada Família vista desde el aire sobre el Eixample, al atardecer", caption: "Barcelona: la Sagrada Família al caer la tarde." },
  },
};

export const content: Dict["content"] = withShelfContent("es", baseContent);
