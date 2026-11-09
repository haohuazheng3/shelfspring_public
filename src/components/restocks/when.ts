import { LANG_TAG } from "@/lib/i18n/format";
import type { Lang } from "@/lib/i18n/locales";

/**
 * A return's moment in the store's own zone, weekday first: "Sat, Nov 8, 3:29 PM" (other languages their own
 * order, "Sa., 8. Nov., 15:29"). The weekday keeps a configuration name from running straight into a bare number.
 */
export function returnStamp(lang: Lang, iso: string | Date, timeZone: string): string {
  const d = iso instanceof Date ? iso : new Date(iso);
  return new Intl.DateTimeFormat(lang === "en" ? "en-US" : LANG_TAG[lang], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone }).format(d);
}
