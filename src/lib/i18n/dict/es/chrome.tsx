import type { ReactNode } from "react";
import type { Dict } from "../en";

/** Spanish (Spain): chrome — footer, 404 page. */
export const chrome: Dict["chrome"] = {
  footer: {
    blurb: "Compara el stock actual con el registro reciente y elige tiendas a las que puedas llegar. Las alertas se envían después de detectar disponibilidad coincidente. La comprobación de origen, la sincronización y la entrega pueden añadir demora.",
    blurbIn: (allStores: string) => `${allStores}. Las alertas se envían después de detectar disponibilidad coincidente. La comprobación de origen, la sincronización y la entrega pueden añadir demora.`,
    trademark: "Sin relación con Apple Inc. ni respaldado por ella. Apple, iPhone y Apple Store son marcas comerciales de Apple Inc.",
    product: "Producto",
    duoStock: "Stock del iPhone Duo",
    proStock: "Stock del iPhone 18 Pro",
    proMaxStock: "Stock del iPhone 18 Pro Max",
    restockLog: "Registro de reposiciones",
    liveMap: "Mapa en directo",
    storesByState: "Tiendas por estado",
    pricing: "Precios",
    company: "Empresa",
    howItWorks: "Cómo funciona",
    getApp: "Instala la app",
    about: "Quiénes somos",
    contact: "Contacto",
    allStates: "Todos los estados y ciudades →",
    storesIn: "Apple Store",
    allStores: "Todas las tiendas →",
    legal: "Legal",
    privacy: "Privacidad",
    terms: "Condiciones",
    refunds: "Reembolsos",
    englishOnly: "En inglés",
    questions: "Preguntas sobre el iPhone Duo",
    restockTimes: "¿Cuándo repone Apple el iPhone Duo?",
    countries: "Países",
    status: "Estado del servicio",
  },
  notFound: {
    title: "Aquí no hay nada",
    body: (stores: ReactNode, map: ReactNode) => <>Esa página no existe. Prueba con {stores} o con el {map}.</>,
    stores: "la lista de tiendas",
    map: "mapa en directo",
    home: "Volver al inicio",
  },
};
