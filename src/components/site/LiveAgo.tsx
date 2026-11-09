"use client";
/**
 * "7 s ago", ticking every second. The number is the evidence that the shelf was looked at, so it is never
 * rounded away to "just now". Units are written apart from the number ("4 min 12 s", "3 h 5 min", "2 d"), the way
 * the site writes every other duration. Server-rendered with the same formatter; the client takes over on mount
 * (suppressHydrationWarning covers the second that passes in between).
 */
import { useEffect, useState } from "react";
import { useLang } from "@/components/i18n/LangProvider";
import { agoFine, never as neverIn } from "@/lib/i18n/format";

export function formatAgo(d: Date | string | null | undefined, now: number): string {
  if (!d) return "never";
  const t = typeof d === "string" ? new Date(d).getTime() : d.getTime();
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 60) return `${s} s ago`;
  if (s < 600) return `${Math.floor(s / 60)} min ${s % 60} s ago`;
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ${Math.floor((s % 3600) / 60)} min ago`;
  return `${Math.floor(s / 86400)} d ago`;
}

/** One unit only ("42 s ago", "18 min ago", "3 h ago", "2 d ago"): a timestamp's placeholder before the local clock shows. */
export function formatAgoShort(d: Date | string, now: number): string {
  const s = Math.max(0, Math.round((now - new Date(d).getTime()) / 1000));
  if (s < 60) return `${s} s ago`;
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}

export function LiveAgo({ iso, className = "", never }: { iso: Date | string | null | undefined; className?: string; never?: string }) {
  const lang = useLang();
  const value = iso instanceof Date ? iso.toISOString() : iso ?? null;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  if (!value) return <span className={className}>{never ?? neverIn(lang)}</span>;
  return <span className={`tabular-nums ${className}`} suppressHydrationWarning>{lang === "en" ? formatAgo(value, now) : agoFine(lang, value, now)}</span>;
}
