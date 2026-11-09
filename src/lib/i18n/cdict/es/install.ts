import type { CDict } from "../en";

/**
 * Spanish (Spain) client strings: install (the /install guide and its drawn phone screens). The mock labels are the
 * words iOS, Android and Chrome show in Spanish (Spain): Compartir, Añadir a pantalla de inicio, Permitir, Ajustes.
 */
export const install: CDict["install"] = {
  hero: {
    eyebrow: "Preparación del dispositivo",
    title: "Dale a tu selección una forma de avisarte.",
    lead: "Elige tu dispositivo y sigue su recorrido. ShelfSpring consulta el stock en el servidor; las notificaciones siguen a los cambios que coinciden con tus reglas. El tiempo de recepción puede variar.",
    seeSteps: "Ir a los pasos de configuración",
    sendTest: "Enviar un aviso de prueba",
    turnOn: "Habilitar notificaciones",
    already: "**✓ Ya hay un dispositivo recibiendo avisos:** {label}. Sigue el recorrido de abajo solo si quieres añadir también este. {link}",
    myAlerts: "Mi lista de seguimiento",
  },
  progress: {
    homeScreen: "Guardada en la pantalla de inicio",
    signedIn: "Cuenta abierta",
    on: "Notificaciones habilitadas",
    blocked: "Tus ajustes bloquean las notificaciones; el paso {n} indica dónde cambiarlo.",
  },
  steps: {
    title: "El recorrido para tu dispositivo",
    intro: {
      ios: "En iPhone y iPad, Apple solo entrega notificaciones web a los sitios guardados en la pantalla de inicio, así que eso va primero.",
      android: "Chrome puede entregar notificaciones desde una pestaña normal; añadir la app a la pantalla de inicio es opcional.",
      desktop: "Un navegador de escritorio recibe los avisos directamente, sin instalar nada.",
    },
    tabsLabel: "Tipo de dispositivo",
    tabs: { ios: "iPhone o iPad", android: "Móvil Android", desktop: "Mac o PC" },
    ios: {
      safari: { title: "Carga shelfspring.com en Safari", text: "Las imágenes siguen a Safari. ¿Lees esto dentro de otra app? Abre el sitio en tu navegador antes de seguir." },
      share: { title: "Busca el botón Compartir", text: "En el iPhone está en la barra inferior; en el iPad, en la parte de arriba de la ventana." },
      choose: { title: "Elige «Añadir a pantalla de inicio» en el menú", text: "Suele quedar por debajo de las primeras filas de acciones; desplázate si no aparece." },
      add: { title: "Confirma con Añadir", text: "El nombre propuesto, ShelfSpring, puede quedarse tal cual." },
      open: { title: "Abre el icono nuevo y vuelve a iniciar sesión", text: "La app de la pantalla de inicio guarda una sesión aparte de la de Safari. Entra con tu correo de siempre y tu lista de seguimiento aparece intacta." },
      allow: { title: "Pulsa «Habilitar notificaciones» y después Permitir", text: "El botón está en tu lista de seguimiento, dentro de la app. iOS muestra su solicitud de permiso una sola vez." },
    },
    android: {
      chrome: { title: "Carga shelfspring.com en Chrome", text: "Edge y Samsung Internet funcionan igual; los navegadores integrados en otras apps no lo admiten." },
      install: { title: "Acepta la oferta de instalación de Chrome", text: "Una sola confirmación. Nada pasa por una tienda de apps." },
      menu: { title: "Usa ⋮ y luego «Añadir a pantalla de inicio»", text: "Algunas versiones de Chrome llaman a esta opción **Instalar aplicación**." },
      open: { title: "Abre ShelfSpring e inicia sesión", text: "El icono aparece en la pantalla de inicio o en el cajón de apps. Entra con tu correo de siempre para ver la misma lista de seguimiento." },
      allow: { title: "Pulsa «Habilitar notificaciones» y después Permitir", text: "Android muestra su solicitud de permiso una vez. El mismo botón funciona también desde una pestaña normal de Chrome." },
    },
    desktop: {
      allow: { title: "Pulsa «Habilitar notificaciones»", text: "Funcionan Chrome, Edge, Firefox y Safari 16.1 o posterior en macOS Ventura o posterior. Acepta la solicitud de permiso que muestre el navegador." },
      install: { title: "Opcional: ShelfSpring en su propia ventana", text: "Chrome y Edge muestran un icono de instalación para ello. Que los avisos lleguen en segundo plano depende del navegador y de los ajustes del sistema." },
      phone: { title: "Añade también tu móvil", text: "Usa el mismo correo en el móvil. Cada dispositivo con las notificaciones habilitadas recibe cada aviso." },
    },
  },
  action: {
    install: "Instalar ShelfSpring",
    on: "✓ Este dispositivo está habilitado.",
    sendTest: "Enviar un aviso de prueba",
    needsInstall: "Este botón funciona dentro de la app de la pantalla de inicio, no en Safari.",
    signInFirst: "Inicia sesión para continuar",
    signInThenOn: "Inicia sesión para habilitarlas",
    turnOn: "Habilitar notificaciones",
    denied: "Las notificaciones están bloqueadas. Permite ShelfSpring en Ajustes y recarga la página.",
  },
  notes: [
    { q: "¿En el iPhone solo sirve Safari?", a: "Las imágenes siguen el menú Compartir de Safari. Desde iOS y iPadOS 16.4, otros navegadores compatibles también pueden ofrecer «Añadir a pantalla de inicio». Las notificaciones web se habilitan desde la app ya instalada en la pantalla de inicio." },
    { q: "¿Mi móvil está consultando el inventario todo el rato?", a: "Las consultas de inventario se hacen en nuestros servidores. El navegador o la app de la pantalla de inicio solo se ocupa de recibir y mostrar las notificaciones." },
    { q: "¿Qué pasa si no tengo ningún dispositivo habilitado?", a: "Entonces cada aviso se envía por correo a la dirección de tu cuenta. Con un dispositivo habilitado, los avisos van a él, y el correo solo entra en juego cuando no se puede llegar a ningún dispositivo." },
    { q: "¿Pueden recibir avisos varios dispositivos?", a: "Sí. Usa el mismo correo allí donde inicies sesión; cada dispositivo con las notificaciones habilitadas recibe cada aviso." },
  ],
  cta: { title: "Un dispositivo listo necesita una lista de seguimiento útil.", button: "Elegir teléfonos y tiendas de recogida" },

  mocks: {
    share: "Compartir",
    shareSheet: { copy: "Copiar", readingList: "Añadir a la lista de lectura", bookmark: "Añadir marcador", favorites: "Añadir a Favoritos", addToHome: "Añadir a pantalla de inicio", markup: "Marcación" },
    addDialog: { cancel: "Cancelar", title: "Añadir a pantalla de inicio", add: "Añadir", note: "Se añadirá un icono a tu pantalla de inicio para que puedas acceder rápidamente a este sitio web." },
    iosAlert: { title: "“ShelfSpring” quiere enviarte notificaciones", text: "Las notificaciones pueden incluir alertas, sonidos y globos en los iconos. Puedes configurarlas en Ajustes.", dontAllow: "No permitir", allow: "Permitir" },
    chromeMenuLabel: "Menú",
    chromeMenu: { before: ["Nueva pestaña", "Historial", "Descargas", "Marcadores", "Compartir…"], add: "Añadir a pantalla de inicio", after: ["Versión para ordenadores"] },
    androidAlert: { title: "¿Permitir que ShelfSpring te envíe notificaciones?", dontAllow: "No permitir", allow: "Permitir" },
    desktopAlert: { wantsTo: "shelfspring.com quiere", show: "Mostrar notificaciones", block: "Bloquear", allow: "Permitir" },
    desktopInstall: { callout: "Instalar", title: "¿Instalar ShelfSpring?", text: "Funciona en una ventana aparte", cancel: "Cancelar", install: "Instalar" },
    lockScreen: { date: "jueves, 29 de octubre", now: "ahora", title: "iPhone 18 Pro 256GB Negro", body: "Apple Puerta del Sol · Madrid — en el estante para recogida. Abre apple.com para pedirlo." },
  },
};
