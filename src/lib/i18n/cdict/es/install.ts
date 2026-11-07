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
    seeSteps: "Ver los pasos",
    sendTest: "Enviar una prueba",
    turnOn: "Activar notificaciones",
    already: "**Ya hay un dispositivo configurado: {label}.** Para añadir también este, sigue los pasos y envía una prueba. {link}",
    myAlerts: "Mis alertas",
  },
  progress: {
    homeScreen: "En la pantalla de inicio",
    signedIn: "Sesión iniciada",
    on: "Notificaciones activadas",
    blocked: "Bloqueadas en los ajustes: mira el paso {n}.",
  },
  steps: {
    title: "El recorrido para tu dispositivo",
    intro: {
      ios: "En iPhone y iPad, añade primero ShelfSpring a la pantalla de inicio. Abre esa app para activar las notificaciones.",
      android: "En Android puedes usar un navegador compatible. Instalar añade un acceso propio, pero no es obligatorio para las notificaciones.",
      desktop: "En el ordenador, permite las notificaciones del navegador y revisa también los ajustes del sistema.",
    },
    tabsLabel: "Tu dispositivo",
    tabs: { ios: "iPhone / iPad", android: "Android", desktop: "Ordenador" },
    ios: {
      safari: { title: "Abre shelfspring.com en Safari", text: "Esta guía muestra Safari. Abre el sitio directamente en el navegador para encontrar los controles de las ilustraciones." },
      share: { title: "Toca Compartir", text: "Busca el icono de compartir en la barra del navegador. Su posición depende de la versión y de la disposición elegida." },
      choose: { title: "Elige «Añadir a pantalla de inicio»", text: "Busca esta opción en el menú de compartir. Desplázate por las acciones si hace falta." },
      add: { title: "Toca Añadir", text: "Comprueba el nombre ShelfSpring y confirma la creación del icono en la pantalla de inicio." },
      open: { title: "Ábrela desde la pantalla de inicio e inicia sesión", text: "Abre el nuevo icono e inicia sesión con el correo de tu cuenta. La app de la pantalla de inicio puede necesitar su propia sesión." },
      allow: { title: "Toca «Activar notificaciones» y luego Permitir", text: "Usa el botón de esta página o de tu cuenta y acepta la solicitud del sistema. Después envía una prueba desde este dispositivo." },
    },
    android: {
      chrome: { title: "Abre shelfspring.com en Chrome", text: "Las ilustraciones siguen Chrome. Si el enlace está dentro de otra app, ábrelo en el navegador completo." },
      install: { title: "Instala la app", text: "Si el navegador ofrece instalar, confirma su ventana. No hace falta descargar nada desde una tienda de aplicaciones." },
      menu: { title: "Menú ⋮ → «Añadir a pantalla de inicio»", text: "La opción puede llamarse **Instalar aplicación**. Si no aparece, puedes continuar en la pestaña del navegador." },
      open: { title: "Abre ShelfSpring e inicia sesión", text: "Abre el icono o vuelve a la pestaña y usa el correo de tu cuenta para recuperar tu selección." },
      allow: { title: "Toca «Activar notificaciones» y luego Permitir", text: "Permite las notificaciones cuando el navegador lo pida. Si no llega la prueba, revisa los permisos y las restricciones de batería de Android." },
    },
    desktop: {
      allow: { title: "Toca «Activar notificaciones»", text: "Permite ShelfSpring en un navegador compatible y envía una prueba. El modo de concentración y los ajustes del sistema pueden ocultar el aviso." },
      install: { title: "Opcional: una ventana propia para ShelfSpring", text: "Chrome y Edge pueden ofrecer un icono de instalación. La recepción en segundo plano sigue dependiendo del navegador y del sistema operativo." },
      phone: { title: "También en tu móvil", text: "Inicia sesión en el móvil con el mismo correo. Activa y prueba las notificaciones por separado en cada dispositivo." },
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
  notes: [{"q":"¿Por qué se muestra Safari en iPhone?","a":"Las ilustraciones siguen sus menús. Otros navegadores también pueden ofrecer añadir a la pantalla de inicio, con opciones distintas."},{"q":"¿El móvil consulta el stock continuamente?","a":"Nuestros servidores hacen las consultas. El navegador o la app de la pantalla de inicio se ocupa de recibir y mostrar las notificaciones."},{"q":"¿Y si no hay un canal push disponible?","a":"El correo sirve como alternativa. Revisa también la carpeta de spam; la entrega puede tardar."},{"q":"¿Cómo preparo varios dispositivos?","a":"Usa la misma cuenta en todos, permite las notificaciones en cada uno y envía una prueba desde cada dispositivo."}],
  cta: { title: "Un dispositivo listo necesita una selección útil.", button: "Elegir iPhone y tiendas de recogida" },

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
