/**
 * Spanish (Spain): account — the dashboard (the watchlist), its return modules, /install, /checkout/success and /pricing. Plan
 * names and dollar amounts stay as they are (billing is in USD everywhere).
 */
import type { Dict } from "../en";
import { n, tiendas, reapariciones, v } from "./words";

const s = (k: number, one: string, many: string) => `${n(k)} ${k === 1 ? one : many}`;

export const account: Dict["account"] = {
  loading: "Cargando",
  meta: { title: "Lista de seguimiento" },
  signedInAs: (email: string) => `Cuenta · ${email}`,
  title: "Mi lista de seguimiento",
  units: { s: "s", min: "min", taps: "toques" },

  plan: {
    title: "Plan",
    none: "Sin plan activo · los avisos se guardan, no se envían",
    summary: (plan: string, on: number, limit: number) => `${plan} · ${n(on)}/${n(limit)} avisos activos`,
    renews: (date: string) => ` · próxima renovación: ${date}`,
    ends: (date: string) => ` · activo hasta el ${date}`,
  },

  sent: {
    title: "Avisos entregados",
    last: (ago: string) => `El más reciente, ${ago}`,
    none: "Aún no hay entregas",
    empty: "Aún no hay entregas.",
    channel: { push: "notificación", email: "correo" } as Record<string, string>,
    status: { sent: "entregado", failed: "no entregado", skipped: "omitido" } as Record<string, string>,
  },

  fast: {
    title: "Prepara tu pedido para recoger",
    sub: "unas comprobaciones antes de la próxima disponibilidad útil",
    lasts: "duración mediana de las disponibilidades de Duo registradas",
    push: "el tiempo de entrega varía; confirma el stock con Apple",
    tapsLeft: "pasos que te quedan cuando llega la notificación",
    steps: [
      { title: "Define hasta dónde puedes ir", hint: "Conserva solo las tiendas a las que podrías llegar para una recogida confirmada." },
      { title: "Ten clara la configuración exacta", hint: "Prepara modelo, capacidad y color antes de abrir la web de Apple." },
      { title: "Revisa las opciones de compra", hint: "Lee las opciones de pago y operador de Apple antes de hacer el pedido." },
      { title: "Comprueba otra vez la disponibilidad", hint: "Una observación anterior o una notificación no te reserva un teléfono." },
      { title: "Espera la confirmación de recogida", hint: "Desplázate cuando Apple confirme que el pedido está listo para recoger." },
    ],
    guide: "Leer la lista de comprobación para recoger (en inglés)",
    window: "Tus horas de reaparición",
  },

  restock: {
    title: "Horas de reaparición en tus tiendas",
    anyIphone: "iPhone",
    and: " y ",
    yours: (k: number) => (k === 1 ? "tu tienda" : `tus ${n(k)} tiendas`),
    Yours: (k: number) => (k === 1 ? "Tu tienda" : `Tus ${n(k)} tiendas`),
    otherStores: (k: number) => s(k, "tienda más", "tiendas más"),
    meta: (what: string, stores: number, days: number, zone: string) => `${what} · ${tiendas(stores)} · registro de ${n(days)} días · ${zone}`,
    busiest: (yours: string, then: string | null) => (then ? `más reapariciones en ${yours} · segunda, ${then}` : `más reapariciones en ${yours}`),
    busiestArea: (stores: number, zone: string) => `pico en las ${n(stores)} tiendas que siguen la ${zone}`,
    next: (inHours: number) => `próxima ventana · ${inHours === 0 ? "dentro de esta hora" : `a ${n(inHours)} h`}`,
    typical: "tiempo mediano en el estante",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `ninguna reaparición anotada en ${yours} · registro de ${n(days)} días` : `reapariciones anotadas en ${yours} · registro de ${n(days)} días${pattern ? "" : " · no bastan para un patrón"}`),
    byHour: (busiestInGreen: boolean) => `Hora del día${busiestInGreen ? " · el pico, en verde" : ""}`,
    byWeekday: (busiest: string | null) => `Día de la semana${busiest ? ` · pico: ${busiest}` : ""}`,
    hourChart: (yours: string, zone: string, items: string) => `Reapariciones por hora del día en ${yours}, ${zone}: ${items}`,
    weekdayChart: (yours: string, items: string) => `Reapariciones por día de la semana en ${yours}: ${items}`,
    chartItem: (label: string, k: number, reported: number) => `${label} ${n(k)}${reported ? ` (+${n(reported)} de terceros)` : ""}`,
    barTitle: (label: string, k: number, yours: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label}: ${reapariciones(k)} ${v(k, "anotada", "anotadas")} en ${yours}${area ? ` · ${n(area.n)} en la zona (${area.zone})` : ""}${reported ? ` · ${n(reported)} de terceros` : ""}`,
    now: "ahora",
    allZone: (stores: number, zone: string) => `Todas las tiendas que siguen la ${zone} (${n(stores)})`,
    reportMarkBars: "Contorno discontinuo",
    reportMarkDots: "Círculos abiertos",
    sellTitle: "Cuánto siguen en el estante las reapariciones",
    sellMeta: (what: string, stores: number, days: number) => `${what} · ${tiendas(stores)} · registro de ${n(days)} días`,
    sellLabel: (yours: string) => `en ${yours}`,
  },

  success: {
    metaTitle: "Lista de seguimiento activa",
    isOn: (plan: string) => `${plan} está activo`,
    yourPlan: "Plan actual",
    received: "Pago confirmado",
    onPlan: (limit: number) => `Sitio para ${n(limit)} avisos en tu lista de seguimiento.`,
    planOn: "Tu plan está activo.",
    pending: "Stripe aún lo está confirmando; el plan aparece en tu cuenta en menos de un minuto.",
    open: "Abrir mi lista de seguimiento",
    another: "Añadir a la lista de seguimiento",
    saved: (k: number) => `${s(k, "aviso guardado", "avisos guardados")} · Stripe te envía el recibo por correo`,
    pushOn: "Notificaciones",
    pushNext: "Siguiente paso: habilitar un dispositivo",
  },

  install: {
    metaTitle: "Prepara tu dispositivo para las notificaciones de ShelfSpring",
    metaDescription: "Sigue la guía para tu móvil u ordenador, inicia sesión y prueba las notificaciones. La recepción también depende del navegador y de los ajustes del dispositivo.",
  },

  pricing: {
    metaTitle: "Planes de seguimiento: 10, 20 o 50 reglas de alerta",
    metaDescription: "Guarda una selección de iPhone y tiendas a las que puedas ir. ShelfSpring cuesta desde 5 USD al mes; el stock, los mapas y el historial siguen siendo gratuitos.",
    title: "Una suscripción para tu selección.",
    lead: "Explora gratis. Suscríbete cuando quieras recibir los cambios que te interesan. **Cada regla sigue una configuración exacta de iPhone en una tienda.**",
    chips: ["Stock e historial públicos gratuitos","La misma fuente de stock en todos los planes","Facturación mensual en dólares estadounidenses","Cancela la renovación desde tu cuenta"],
    fastest: "Qué hace la suscripción",
    everyFast: "La alerta se envía al detectar disponibilidad que coincide con tus reglas. Las comprobaciones de origen, la sincronización y la entrega pueden añadir retraso.",
    historySample: "Todos los países seguidos · últimos 7 días · {n} periodos de disponibilidad finalizados",
    sellsOut: (band: string) => `La mediana observada de duración de una disponibilidad de iPhone Duo es de **${band}**. Describe la muestra registrada, no tu próxima oportunidad.`,
    band: (r: string) => `${r} segundos`,
    aboutMinute: "aproximadamente un minuto",
    sameSpeed: "Actualizaciones frecuentes del stock",
    rechecked: "cada cuánto se miran tus tiendas",
    toPhone: "de una reaparición confirmada a tu dispositivo",
    listing: "tiempo mediano del Duo en el estante",
    note: { plus: "p. ej., una configuración vigilada en diez tiendas", pro: "p. ej., dos configuraciones, diez tiendas cada una", max: "p. ej., cinco configuraciones, diez tiendas cada una" } as Record<string, string>,
    month: "al mes",
    alerts: (k: number) => `${n(k)} reglas de aviso`,
    perks: ["Elegir la capacidad y el color exactos","Cambiar las tiendas según tus desplazamientos","Notificaciones del navegador con correo como alternativa"],
    cancel: "La renovación se puede detener en cualquier momento",
    get: (plan: string) => `Empezar con ${plan}`,
    billing: "Los pagos van por Stripe, con tarjeta o Link. Cambiar de plan se prorratea.",
    refund: "Condiciones de reembolso: un pago de los últimos 7 días sin ningún aviso de reposición entregado desde entonces se reembolsa entero ([política de reembolsos](/refunds)).",
  },
};
