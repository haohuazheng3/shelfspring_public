/**
 * Notification texts in Swedish (push, alert email, "notifications stopped" email, device names, Stripe checkout
 * line). Plain TS with no imports besides types: the poller sends these too.
 */
import type { NotifyText } from "./en";

export const notifySv: NotifyText = {
  pushTitle: (cfg: string) => cfg,
  pushBody: (where: string, quote: string | null) => `${where}${quote ? ` – ${quote}` : ""}. Tryck för att reservera på apple.com.`,
  testTitle: "Notiser från ShelfSpring är på",
  testBody: (time: string, device: string) => `${time} · ${device}. Aviseringar skickas när matchande tillgänglighet upptäcks. Källkontroll, synkronisering och leverans kan ge fördröjning.`,
  device: {
    iphoneApp: "iPhone (hemskärmsapp)",
    iphoneSafari: "iPhone (Safari)",
    androidApp: "Android (installerad app)",
    android: (browser: string) => `Android${browser ? ` (${browser})` : ""}`,
    computer: (browser: string) => `dator${browser ? ` (${browser})` : ""}`,
    other: "enhet",
  },
  email: {
    subject: (cfg: string, store: string, more: number) => `I lager: ${cfg} på ${store}${more > 0 ? ` +${more} till` : ""}`,
    intro: "Goda nyheter – går att hämta i butik just nu:",
    reserve: "Reservera",
    store: "Butik",
    tip: "Lager för hämtning försvinner snabbt: öppna appen Apple Store eller apple.com, välj ”Hämta i butik” och välj butiken.",
    manage: (url: string) => `Hantera eller pausa den här bevakningen: ${url}`,
    htmlTitle: "Går att hämta nu",
    htmlReserve: "Reservera på apple.com",
    htmlStorePage: "Butikssidan →",
    htmlTip: "Lager för hämtning försvinner snabbt – reservera i appen Apple Store eller på apple.com, välj <b>Hämta i butik</b> och välj butiken.",
    htmlManage: "Hantera eller pausa den här bevakningen",
    cancel: (url: string) => `Har du fått din iPhone? Säg upp när du vill: ${url}`,
    htmlGotIt: "Har du fått din iPhone?",
    htmlCancel: "Säg upp när du vill",
    nudge: (url: string) => `Telefonaviseringar är avstängda för ditt konto, så aviseringar kommer för närvarande via e-post. Öppna ShelfSpring från hemskärmen, logga in och slå på aviseringar på den här enheten. Aviseringar skickas när matchande tillgänglighet upptäcks. Källkontroll, synkronisering och leverans kan ge fördröjning. ${url}`,
    htmlNudge: (url: string) => `Telefonaviseringar är avstängda för ditt konto, så aviseringar kommer för närvarande via e-post. Öppna ShelfSpring från hemskärmen, logga in och slå på aviseringar på den här enheten. Aviseringar skickas när matchande tillgänglighet upptäcks. Källkontroll, synkronisering och leverans kan ge fördröjning. <a href="${url}" style="color:#0a7f3f">ShelfSpring →</a>`,
  },
  checkoutSubmit: (plan: string, limit: number, _fastSec: number, _checkSec: number, _alertSec: number) => { void _fastSec; void _checkSec; void _alertSec; return `${plan}: ${limit} bevakningar. Täta lageruppdateringar; avisering efter upptäckt tillgänglighet. Insamling och leverans kan fördröjas. Månadsvis, avsluta när du vill.`; },
  stopped: {
    deviceWord: { ios: "iPhone", android: "Android-telefon", desktop: "dator", other: "enhet" },
    subject: (device: string) => `Notiserna har slutat fungera på din ${device} – öppna ShelfSpring från hemskärmen`,
    gone: (device: string) => `Din ${device} har slutat ta emot notiser från ShelfSpring (notistjänsten meddelade att prenumerationen har försvunnit).`,
    byEmail: "Notiser om påfyllningar för dina bevakningar kommer nu via e-post tills du slår på notiserna igen.",
    reopenIos: "Öppna ShelfSpring från hemskärmen (inte Safari) och tryck på ”Slå på notiser” på kontosidan.",
    reopenOther: "Öppna ShelfSpring, gå till kontosidan och tryck på ”Slå på notiser”.",
    causes: "Vanliga orsaker: appen togs bort från hemskärmen, notiserna stängdes av i Inställningar, eller telefonen återställdes.",
  },
  nudge: {
    subject: "Ställ in lageraviseringar på telefonen",
    intro: "Telefonaviseringar är avstängda för ditt konto, så aviseringar kommer för närvarande via e-post. Öppna ShelfSpring från hemskärmen, logga in och slå på aviseringar på den här enheten. Aviseringar skickas när matchande tillgänglighet upptäcks. Källkontroll, synkronisering och leverans kan ge fördröjning.",
    howTitle: "Slå på dem på under en minut:",
    stepsIos: ["Öppna shelfspring.com i Safari på din iPhone, tryck på Dela och sedan ”Lägg till på hemskärmen”.", "Öppna ShelfSpring från hemskärmen (inte Safari) och logga in.", "Tryck på ”Slå på notiser” på kontosidan och sedan på ”Tillåt”."],
    stepsOther: "På Android eller dator: öppna shelfspring.com/account och tryck på ”Slå på notiser”.",
    after: "Tills en enhet är påslagen fortsätter larmen att komma med e-post; därefter kommer de som notiser och e-posten upphör.",
    cta: (url: string) => `Guide med bilder: ${url}`,
  },
};
