"use client";
/**
 * The page's language for client components. The root layout provides it once per full page load (crossing
 * languages is always a full load: PendingLink), with that language's client strings; English strings are
 * bundled, so English pages carry nothing extra.
 */
import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { EN_US, LANG_COOKIE, nativeLocale, type Lang, type Locale } from "@/lib/i18n/locales";
import { cen, type CDict } from "@/lib/i18n/cdict/en";

interface Ctx { loc: Locale; app: Locale | null; d: CDict }
const C = createContext<Ctx>({ loc: EN_US, app: null, d: cen });

/** `app`: the person's language for app pages (cookie), null for English. */
const PREFERENCE_CHANGED = "shelfspring:language-preference";
export function preferredLocaleFromCookie(cookie: string): string {
  const value = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${LANG_COOKIE}=`))?.slice(LANG_COOKIE.length + 1);
  try { return nativeLocale(value ? decodeURIComponent(value) : "")?.id ?? ""; } catch { return ""; }
}
const preferenceSnapshot = () => preferredLocaleFromCookie(document.cookie);
function subscribePreference(changed: () => void) {
  window.addEventListener(PREFERENCE_CHANGED, changed);
  window.addEventListener("focus", changed);
  return () => { window.removeEventListener(PREFERENCE_CHANGED, changed); window.removeEventListener("focus", changed); };
}
export function LangProvider({ loc, app, d, children, rememberLocale = false }: { loc: Locale; app: Locale | null; d: CDict | null; children: ReactNode; rememberLocale?: boolean }) {
  // Shared HTML contains only a URL-derived preference. Read personal cookies after hydration.
  const preferred = useSyncExternalStore(subscribePreference, preferenceSnapshot, () => app?.id ?? "");
  useEffect(() => {
    if (!rememberLocale || !loc.native || preferenceSnapshot() === loc.id) return;
    document.cookie = `${LANG_COOKIE}=${encodeURIComponent(loc.id)}; Path=/; Max-Age=31536000; SameSite=Lax`;
    window.dispatchEvent(new Event(PREFERENCE_CHANGED));
  }, [rememberLocale, loc.id, loc.native]);
  const currentApp = rememberLocale && loc.native ? loc : nativeLocale(preferred) ?? app;
  return <C.Provider value={{ loc, app: currentApp, d: d ?? cen }}>{children}</C.Provider>;
}
export function useLocale(): Locale {
  return useContext(C).loc;
}
export function useLang(): Lang {
  return useContext(C).loc.lang;
}
/** The person's language for app pages (null = English). */
export function useAppLocale(): Locale | null {
  return useContext(C).app;
}
export function useT(): CDict {
  return useContext(C).d;
}
