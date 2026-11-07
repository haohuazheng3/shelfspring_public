/**
 * Spanish (Spain): account — the dashboard, its restock modules, /install, /checkout/success and /pricing. Plan
 * names and dollar amounts stay as they are (billing is in USD everywhere).
 */
import type { Dict } from "../en";
import { n, tiendas, reposiciones } from "./words";

const s = (k: number, one: string, many: string) => `${n(k)} ${k === 1 ? one : many}`;

export const account: Dict["account"] = {
  loading: "Cargando",
  meta: { title: "Mis alertas" },
  signedInAs: (email: string) => `Sesión iniciada como ${email}`,
  title: "Mis alertas",
  units: { s: "s", min: "min", taps: "toques" },

  plan: {
    title: "Plan",
    none: "Aún sin plan: las alertas están desactivadas",
    summary: (plan: string, on: number, limit: number) => `${plan} · ${n(on)} de ${n(limit)} alertas activas`,
    renews: (date: string) => ` · se renueva el ${date}`,
    ends: (date: string) => ` · termina el ${date}`,
  },

  sent: {
    title: "Alertas enviadas",
    last: (ago: string) => `La última, ${ago}`,
    none: "Aún no se ha enviado nada",
    empty: "Aún no se ha enviado nada.",
    channel: { push: "notificación", email: "correo" } as Record<string, string>,
    status: { sent: "enviada", failed: "fallida", skipped: "omitida" } as Record<string, string>,
  },

  fast: {
    title: "Prepara tu pedido para recoger",
    sub: "unas comprobaciones antes de la próxima disponibilidad útil",
    lasts: "duración mediana de las disponibilidades de Duo registradas",
    push: "el tiempo de entrega varía; confirma el stock con Apple",
    tapsLeft: "comprobaciones antes de confirmar el pedido",
    steps: [
      { title: "Define hasta dónde puedes ir", hint: "Conserva solo las tiendas a las que podrías llegar para una recogida confirmada." },
      { title: "Ten clara la configuración exacta", hint: "Prepara modelo, capacidad y color antes de abrir la web de Apple." },
      { title: "Revisa las opciones de compra", hint: "Lee las opciones de pago y operador de Apple antes de hacer el pedido." },
      { title: "Comprueba otra vez la disponibilidad", hint: "Una observación anterior o una notificación no te reserva un teléfono." },
      { title: "Espera la confirmación de recogida", hint: "Desplázate cuando Apple confirme que el pedido está listo para recoger." },
    ],
    guide: "Guía para preparar la recogida (en inglés)",
    window: "El historial de tus tiendas",
  },

  restock: {
    title: "Cuándo reponen tus tiendas",
    anyIphone: "iPhone",
    and: " y ",
    yours: (k: number) => (k === 1 ? "tu tienda" : `tus ${n(k)} tiendas`),
    Yours: (k: number) => (k === 1 ? "Tu tienda" : `Tus ${n(k)} tiendas`),
    otherStores: (k: number) => s(k, "tienda más", "tiendas más"),
    meta: (what: string, stores: number, days: number, zone: string) => `${what} · ${tiendas(stores)} · últimos ${n(days)} días · ${zone}`,
    busiest: (yours: string, then: string | null) => (then ? `hora con más en ${yours} · después, ${then}` : `hora con más en ${yours}`),
    busiestArea: (stores: number, zone: string) => `la hora con más en las ${n(stores)} tiendas con ${zone}`,
    next: (inHours: number) => `próxima franja · ${inHours === 0 ? "esta hora" : `dentro de ${n(inHours)} h`}`,
    typical: "lo que suele estar disponible antes de agotarse",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `aún sin reposiciones en ${yours} · últimos ${n(days)} días` : `reposiciones en ${yours} · últimos ${n(days)} días${pattern ? "" : " · muy pocas para un patrón"}`),
    byHour: (busiestInGreen: boolean) => `Por hora${busiestInGreen ? " · en verde, la de más reposiciones" : ""}`,
    byWeekday: (busiest: string | null) => `Por día de la semana${busiest ? ` · el de más: ${busiest}` : ""}`,
    hourChart: (yours: string, zone: string, items: string) => `Reposiciones por hora en ${yours}, ${zone}: ${items}`,
    weekdayChart: (yours: string, items: string) => `Reposiciones por día de la semana en ${yours}: ${items}`,
    chartItem: (label: string, k: number, reported: number) => `${label} ${n(k)}${reported ? ` (+${n(reported)} según otros rastreadores)` : ""}`,
    barTitle: (label: string, k: number, yours: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label}: ${reposiciones(k)} en ${yours}${area ? ` · ${n(area.n)} en las tiendas con ${area.zone}` : ""}${reported ? ` · ${n(reported)} según otros rastreadores` : ""}`,
    now: "ahora",
    allZone: (stores: number, zone: string) => `Las ${n(stores)} tiendas con ${zone}`,
    reportMarkBars: "En discontinua",
    reportMarkDots: "Puntos huecos",
    sellTitle: "Cuánto tardan en agotarse tus reposiciones",
    sellMeta: (what: string, stores: number, days: number) => `${what} · ${tiendas(stores)} · últimos ${n(days)} días`,
    sellLabel: (yours: string) => `en ${yours}`,
  },

  success: {
    metaTitle: "Las alertas están activadas",
    isOn: (plan: string) => `${plan} está activado`,
    yourPlan: "Tu plan",
    received: "Pago recibido",
    onPlan: (limit: number) => `${n(limit)} alertas en tu plan.`,
    planOn: "Tu plan está activado.",
    pending: "Tu suscripción aparecerá en tu cuenta en menos de un minuto.",
    open: "Abrir mis alertas",
    another: "Añadir otra alerta",
    saved: (k: number) => `${s(k, "alerta guardada", "alertas guardadas")} · recibo de Stripe`,
    pushOn: "Notificaciones",
    pushNext: "Siguiente paso: las alertas en tu móvil",
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
    rechecked: "tus tiendas, comprobadas de nuevo",
    toPhone: "de la reposición confirmada a tu móvil",
    listing: "duración mediana de las disponibilidades de Duo registradas",
    note: { plus: "1 iPhone × 10 tiendas", pro: "2 iPhone × 10 tiendas", max: "5 iPhone × 10 tiendas" } as Record<string, string>,
    month: "/ mes",
    alerts: (k: number) => `${n(k)} alertas`,
    perks: ["Elegir la capacidad y el color exactos","Cambiar las tiendas según tus desplazamientos","Notificaciones del navegador con correo como alternativa"],
    cancel: "Cancela cuando quieras",
    get: (plan: string) => `Contratar ${plan}`,
    billing: "Facturación con Stripe · tarjeta o Link · los cambios de plan se prorratean",
    refund: "¿No te convence? [Reembolso completo en los primeros 7 días](/refunds) si aún no te ha llegado ninguna alerta de reposición",
  },
};
