import type { CDict } from "../en";

/**
 * Spanish (Spain) client strings: install (the /install guide and its drawn phone screens). The mock labels are the
 * words iOS, Android and Chrome show in Spanish (Spain): Compartir, Añadir a pantalla de inicio, Permitir, Ajustes.
 */
export const install: CDict["install"] = {
  hero: {
    eyebrow: "App en la pantalla de inicio · sin descargas",
    title: "Alertas en tu pantalla de bloqueo.",
    lead: "Abre ShelfSpring desde la pantalla de inicio, inicia sesión y activa las notificaciones en este dispositivo. Las alertas se envían después de detectar disponibilidad coincidente. La comprobación de origen, la sincronización y la entrega pueden añadir demora.",
    seeSteps: "Ver los pasos",
    sendTest: "Enviar una prueba",
    turnOn: "Activar notificaciones",
    already: "**✓ Ya está todo listo.** Las alertas llegan a {label}. Con los pasos de abajo añades también este dispositivo. {link}",
    myAlerts: "Mis alertas",
  },
  progress: {
    homeScreen: "En la pantalla de inicio",
    signedIn: "Sesión iniciada",
    on: "Notificaciones activadas",
    blocked: "Bloqueadas en los ajustes: mira el paso {n}.",
  },
  steps: {
    title: "Configura las notificaciones",
    intro: {
      ios: "En el iPhone y el iPad, las notificaciones solo funcionan desde la app de la pantalla de inicio.",
      android: "En Android instalarla es opcional; Chrome puede avisarte por sí solo.",
      desktop: "Funciona en el navegador. No hace falta instalar nada.",
    },
    tabsLabel: "Tu dispositivo",
    tabs: { ios: "iPhone / iPad", android: "Android", desktop: "Ordenador" },
    ios: {
      safari: { title: "Abre shelfspring.com en Safari", text: "Solo Safari. Ni Chrome ni el navegador integrado de otra app." },
      share: { title: "Toca Compartir", text: "En la barra inferior en el iPhone y arriba en el iPad." },
      choose: { title: "Elige «Añadir a pantalla de inicio»", text: "Desplázate hacia abajo si no lo ves." },
      add: { title: "Toca Añadir", text: "Deja el nombre ShelfSpring." },
      open: { title: "Ábrela desde la pantalla de inicio e inicia sesión", text: "La app tiene su propio inicio de sesión. El mismo correo, las mismas alertas." },
      allow: { title: "Toca «Activar notificaciones» y luego Permitir", text: "El botón está en tu página de alertas. El iPhone lo pregunta una sola vez." },
    },
    android: {
      chrome: { title: "Abre shelfspring.com en Chrome", text: "Samsung Internet y Edge también sirven. Los navegadores integrados de otras apps, no." },
      install: { title: "Instala la app", text: "Un toque, sin tienda de apps." },
      menu: { title: "Menú ⋮ → «Añadir a pantalla de inicio»", text: "A veces aparece como **Instalar aplicación**." },
      open: { title: "Abre ShelfSpring e inicia sesión", text: "Desde la pantalla de inicio o el cajón de apps. El mismo correo, las mismas alertas." },
      allow: { title: "Toca «Activar notificaciones» y luego Permitir", text: "Android lo pregunta una sola vez. También funciona en la pestaña de Chrome." },
    },
    desktop: {
      allow: { title: "Toca «Activar notificaciones»", text: "Chrome, Edge, Firefox, Safari 16 o posterior. El navegador lo pregunta una sola vez." },
      install: { title: "Opcional: instálala como app", text: "En Chrome o Edge: el icono de instalar de la barra de direcciones. Avisa incluso con el navegador cerrado." },
      phone: { title: "También en tu móvil", text: "Inicia sesión en el móvil con el mismo correo. Cada dispositivo con las notificaciones activadas recibe todas las alertas." },
    },
  },
  action: {
    install: "Instalar ShelfSpring",
    on: "✓ Las notificaciones están activadas en este dispositivo.",
    sendTest: "Enviar una prueba",
    needsInstall: "Disponible cuando abras la app de la pantalla de inicio.",
    signInFirst: "Inicia sesión primero",
    signInThenOn: "Inicia sesión y actívalas",
    turnOn: "Activar notificaciones",
    denied: "Bloqueadas. Permite ShelfSpring en Ajustes y vuelve a cargar la página.",
  },
  notes: [
    { q: "¿Por qué Safari en el iPhone?", a: "Solo Safari puede añadir una web a la pantalla de inicio. Los navegadores integrados en otras apps, no." },
    { q: "¿Y la batería?", a: "En tu móvil no se ejecuta nada. Las comprobaciones las hacen nuestros servidores." },
    { q: "¿Y el correo?", a: "¿Ningún dispositivo con las notificaciones activadas? Entonces la alerta te llega por correo." },
    { q: "¿Varios dispositivos?", a: "Inicia sesión con el mismo correo en cada uno. Todos reciben todas las alertas." },
  ],
  cta: { title: "¿Aún no tienes ninguna alerta?", button: "Crea una alerta" },

  mocks: {
    share: "Compartir",
    shareSheet: { copy: "Copiar", readingList: "Añadir a la lista de lectura", bookmark: "Añadir marcador", favorites: "Añadir a Favoritos", addToHome: "Añadir a pantalla de inicio", markup: "Marcación" },
    addDialog: { cancel: "Cancelar", title: "Añadir a pantalla de inicio", add: "Añadir", note: "Se añadirá un icono a tu pantalla de inicio para que puedas acceder rápidamente a este sitio web." },
    iosAlert: { title: "“ShelfSpring” quiere enviarte notificaciones", text: "Las notificaciones pueden incluir alertas, sonidos y globos en los iconos. Puedes configurarlas en Ajustes.", dontAllow: "No permitir", allow: "Permitir" },
    chromeMenuLabel: "Menú",
    chromeMenu: { before: ["Nueva pestaña", "Historial", "Descargas", "Marcadores", "Compartir…"], add: "Añadir a pantalla de inicio", after: ["Versión para ordenadores"] },
    androidAlert: { title: "¿Permitir que ShelfSpring te envíe notificaciones?", dontAllow: "No permitir", allow: "Permitir" },
    desktopAlert: { wantsTo: "shelfspring.com quiere", show: "Mostrar notificaciones", block: "Bloquear", allow: "Permitir" },
    desktopInstall: { callout: "Instalar", title: "¿Instalar ShelfSpring?", text: "Se abre en su propia ventana", cancel: "Cancelar", install: "Instalar" },
    lockScreen: { date: "jueves, 29 de octubre", now: "ahora", title: "iPhone 18 Pro 256GB Negro", body: "Apple Puerta del Sol · Madrid — Disponible hoy. Toca para reservarlo en apple.com." },
  },
};
