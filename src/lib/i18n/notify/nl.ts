/**
 * Notification texts in Dutch (push, alert email, "notifications stopped" email, device names, Stripe checkout line).
 * Plain TS with no imports besides types: the poller sends these too.
 */
import type { NotifyText } from "./en";

export const notifyNl: NotifyText = {
  pushTitle: (cfg: string) => cfg,
  pushBody: (where: string, quote: string | null) => `${where}${quote ? ` — ${quote}` : ""}. Tik om te reserveren op apple.com.`,
  testTitle: "Meldingen van ShelfSpring staan aan",
  testBody: (time: string, device: string) => `${time} · ${device}. Meldingen worden verzonden nadat passende voorraad is gedetecteerd. Broncontrole, synchronisatie en bezorging kunnen vertraging toevoegen.`,
  device: {
    iphoneApp: "iPhone (app op beginscherm)",
    iphoneSafari: "iPhone (Safari)",
    androidApp: "Android (geïnstalleerde app)",
    android: (browser: string) => `Android${browser ? ` (${browser})` : ""}`,
    computer: (browser: string) => `computer${browser ? ` (${browser})` : ""}`,
    other: "dit apparaat",
  },
  email: {
    subject: (cfg: string, store: string, more: number) => `Op voorraad: ${cfg} bij ${store}${more > 0 ? ` +${more} meer` : ""}`,
    intro: "Goed nieuws — nu beschikbaar om op te halen in de winkel:",
    reserve: "Reserveren",
    store: "Winkel",
    tip: 'Ophaalvoorraad gaat snel: open de Apple Store-app of apple.com, kies "Ophalen" en selecteer de winkel.',
    manage: (url: string) => `Deze alert beheren of pauzeren: ${url}`,
    htmlTitle: "Nu op voorraad om op te halen",
    htmlReserve: "Reserveren op apple.com",
    htmlStorePage: "Winkelpagina →",
    htmlTip: "Ophaalvoorraad gaat snel — reserveer in de Apple Store-app of op apple.com, kies <b>Ophalen</b> en selecteer de winkel.",
    htmlManage: "Deze alert beheren of pauzeren",
    cancel: (url: string) => `Heb je je iPhone al? Opzeggen kan altijd: ${url}`,
    htmlGotIt: "Heb je je iPhone al?",
    htmlCancel: "Opzeggen kan altijd",
    nudge: (url: string) => `Telefoonmeldingen staan uit voor je account. Je meldingen komen daarom momenteel per e-mail. Open ShelfSpring vanaf het beginscherm, meld je aan en schakel meldingen in op dit apparaat. Meldingen worden verzonden nadat passende voorraad is gedetecteerd. Broncontrole, synchronisatie en bezorging kunnen vertraging toevoegen. ${url}`,
    htmlNudge: (url: string) => `Telefoonmeldingen staan uit voor je account. Je meldingen komen daarom momenteel per e-mail. Open ShelfSpring vanaf het beginscherm, meld je aan en schakel meldingen in op dit apparaat. Meldingen worden verzonden nadat passende voorraad is gedetecteerd. Broncontrole, synchronisatie en bezorging kunnen vertraging toevoegen. <a href="${url}" style="color:#0a7f3f">ShelfSpring →</a>`,
  },
  checkoutSubmit: (plan: string, limit: number, _fastSec: number, _checkSec: number, _alertSec: number) => { void _fastSec; void _checkSec; void _alertSec; return `${plan}: ${limit} meldingen. Regelmatige voorraadupdates; melding na gedetecteerde beschikbaarheid. Verzamelen en bezorgen kan vertragen. Maandelijks, altijd opzegbaar.`; },
  stopped: {
    deviceWord: { ios: "iPhone", android: "Android-telefoon", desktop: "computer", other: "apparaat" },
    subject: (device: string) => `Meldingen gestopt op je ${device} — open ShelfSpring vanaf je beginscherm`,
    gone: (device: string) => `Je ${device} accepteert geen meldingen van ShelfSpring meer (de pushdienst meldde dat het abonnement niet meer bestaat).`,
    byEmail: "Voorraadalerts komen nu per e-mail binnen, tot je meldingen weer aanzet.",
    reopenIos: 'Open ShelfSpring vanaf je beginscherm (niet in Safari) en tik op "Zet meldingen aan" op de accountpagina.',
    reopenOther: 'Open ShelfSpring, ga naar Account en tik op "Zet meldingen aan".',
    causes: "Veelvoorkomende oorzaken: de app is van het beginscherm verwijderd, meldingen zijn uitgezet in Instellingen, of de telefoon is hersteld.",
  },
  nudge: {
    subject: "Voorraadmeldingen op je telefoon instellen",
    intro: "Telefoonmeldingen staan uit voor je account. Je meldingen komen daarom momenteel per e-mail. Open ShelfSpring vanaf het beginscherm, meld je aan en schakel meldingen in op dit apparaat. Meldingen worden verzonden nadat passende voorraad is gedetecteerd. Broncontrole, synchronisatie en bezorging kunnen vertraging toevoegen.",
    howTitle: "Zet ze in minder dan een minuut aan:",
    stepsIos: ["Open op uw iPhone shelfspring.com in Safari, tik op Deel en dan op ‘Zet op beginscherm’.", "Open ShelfSpring vanaf het beginscherm (niet in Safari) en log in.", "Tik op de pagina Account op ‘Meldingen inschakelen’ en dan op ‘Sta toe’."],
    stepsOther: "Op Android of een computer: open shelfspring.com/account en tik op ‘Meldingen inschakelen’.",
    after: "Zolang geen apparaat aanstaat, blijven uw meldingen per e-mail komen; daarna komen ze als melding en stopt de e-mail.",
    cta: (url: string) => `Handleiding met afbeeldingen: ${url}`,
  },
};
