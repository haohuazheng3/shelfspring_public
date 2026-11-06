/**
 * Notification texts in Spanish (Spain): push, alert email, "notifications stopped" email, device names, Stripe
 * checkout line. Plain TS, types only: the poller sends these too.
 */
import type { NotifyText } from "./en";

export const notifyEs: NotifyText = {
  pushTitle: (cfg: string) => cfg,
  pushBody: (where: string, quote: string | null) => `${where}${quote ? ` — ${quote}` : ""}. Toca para reservarlo en apple.com.`,
  testTitle: "Las notificaciones de ShelfSpring están activadas",
  testBody: (time: string, device: string) => `${time} · ${device}. Las alertas se envían después de detectar disponibilidad coincidente. La comprobación de origen, la sincronización y la entrega pueden añadir demora.`,
  device: {
    iphoneApp: "iPhone (app de la pantalla de inicio)",
    iphoneSafari: "iPhone (Safari)",
    androidApp: "Android (app instalada)",
    android: (browser: string) => `Android${browser ? ` (${browser})` : ""}`,
    computer: (browser: string) => `ordenador${browser ? ` (${browser})` : ""}`,
    // Always follows "tu" ("a tu dispositivo").
    other: "dispositivo",
  },
  email: {
    subject: (cfg: string, store: string, more: number) => `Disponible: ${cfg} en ${store}${more > 0 ? ` y ${more} más` : ""}`,
    intro: "Buenas noticias: ya está disponible para recogida en tienda:",
    reserve: "Reservar",
    store: "Tienda",
    tip: "El stock para recogida vuela: abre la app Apple Store o apple.com, elige «Recogida» y selecciona la tienda.",
    manage: (url: string) => `Gestiona o pausa esta alerta: ${url}`,
    htmlTitle: "Disponible para recogida ahora",
    htmlReserve: "Reservar en apple.com",
    htmlStorePage: "Página de la tienda →",
    htmlTip: "El stock para recogida vuela: resérvalo en la app Apple Store o en apple.com, elige <b>Recogida</b> y selecciona la tienda.",
    htmlManage: "Gestiona o pausa esta alerta",
    cancel: (url: string) => `¿Ya tienes tu iPhone? Cancela cuando quieras: ${url}`,
    htmlGotIt: "¿Ya tienes tu iPhone?",
    htmlCancel: "Cancela cuando quieras",
    nudge: (url: string) => `Tu cuenta no tiene notificaciones activadas en el teléfono, por lo que los avisos llegan actualmente por correo. Abre ShelfSpring desde la pantalla de inicio, inicia sesión y activa las notificaciones en este dispositivo. Las alertas se envían después de detectar disponibilidad coincidente. La comprobación de origen, la sincronización y la entrega pueden añadir demora. ${url}`,
    htmlNudge: (url: string) => `Tu cuenta no tiene notificaciones activadas en el teléfono, por lo que los avisos llegan actualmente por correo. Abre ShelfSpring desde la pantalla de inicio, inicia sesión y activa las notificaciones en este dispositivo. Las alertas se envían después de detectar disponibilidad coincidente. La comprobación de origen, la sincronización y la entrega pueden añadir demora. <a href="${url}" style="color:#0a7f3f">ShelfSpring →</a>`,
  },
  checkoutSubmit: (plan: string, limit: number, _fastSec: number, _checkSec: number, _alertSec: number) => { void _fastSec; void _checkSec; void _alertSec; return `${plan}: ${limit} alertas. Actualizaciones frecuentes; avisos al detectar disponibilidad. La recopilación y la entrega pueden demorarse. Mensual, cancela cuando quieras.`; },
  stopped: {
    deviceWord: { ios: "iPhone", android: "móvil Android", desktop: "ordenador", other: "dispositivo" },
    subject: (device: string) => `Las notificaciones se han detenido en tu ${device}: abre ShelfSpring desde la pantalla de inicio`,
    gone: (device: string) => `Tu ${device} ha dejado de aceptar las notificaciones de ShelfSpring (el servicio de notificaciones indica que la suscripción ya no existe).`,
    byEmail: "Las alertas de reposición de tus reglas te llegarán por correo hasta que vuelvas a activar las notificaciones.",
    reopenIos: "Abre ShelfSpring desde tu pantalla de inicio (no desde Safari) y toca «Activar notificaciones» en la página de tu cuenta.",
    reopenOther: "Abre ShelfSpring, ve a tu cuenta y toca «Activar notificaciones».",
    causes: "Causas habituales: se quitó la app de la pantalla de inicio, se desactivaron las notificaciones en Ajustes o se restauró el móvil.",
  },
  nudge: {
    subject: "Configura los avisos de stock en tu teléfono",
    intro: "Tu cuenta no tiene notificaciones activadas en el teléfono, por lo que los avisos llegan actualmente por correo. Abre ShelfSpring desde la pantalla de inicio, inicia sesión y activa las notificaciones en este dispositivo. Las alertas se envían después de detectar disponibilidad coincidente. La comprobación de origen, la sincronización y la entrega pueden añadir demora.",
    howTitle: "Actívelas en menos de un minuto:",
    stepsIos: ["En su iPhone, abra shelfspring.com en Safari, toque Compartir y luego «Añadir a pantalla de inicio».", "Abra ShelfSpring desde la pantalla de inicio (no desde Safari) e inicie sesión.", "En la página Cuenta, toque «Activar notificaciones» y luego «Permitir»."],
    stepsOther: "En Android o en un ordenador: abra shelfspring.com/account y toque «Activar notificaciones».",
    after: "Mientras ningún dispositivo esté activado, sus alertas seguirán llegando por correo; después llegarán como notificaciones y el correo se detendrá.",
    cta: (url: string) => `Guía con imágenes: ${url}`,
  },
};
