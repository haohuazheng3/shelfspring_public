"use client";
/**
 * The header's section links. English pages (the US and every English country tree) keep the links they always had
 * (/stock/iphone-duo…: pages with search and AI traffic keep their internal links as they were); a native version
 * links into its own tree (/ja-jp/stock/iphone-duo), and app pages into the person's language version.
 */
import { usePathname } from "next/navigation";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { useAppLocale, useT } from "@/components/i18n/LangProvider";
import { isAppPath, localeFromSegment } from "@/lib/i18n/locales";

/** The prefix of the country tree a path belongs to ("" for the US). */
export function treePrefix(pathname: string, app: string | null): string {
  const seg = pathname.split("/")[1];
  if (localeFromSegment(seg)?.native) return `/${seg}`;
  return isAppPath(pathname) && app ? `/${app}` : "";
}

export function HeaderNav({ variant }: { variant: "main" | "sections" }) {
  const pathname = usePathname() ?? "/";
  const app = useAppLocale();
  const d = useT().chrome.nav;
  const p = treePrefix(pathname, app?.id ?? null);
  const links: [string, string][] = [[`${p}/stock/iphone-duo`, d.duoStock], [`${p}/restocks`, d.restocks], [`${p}/map`, d.map], [`${p}/stores`, d.stores], ["/pricing", d.pricing]];
  return (
    <nav className="section-navigation" aria-label={variant === "main" ? d.main : d.sections}>
      {links.map(([href, label], index) => <Link key={href} className="section-link" aria-current={pathname === href ? "page" : undefined} href={href}><span className="section-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{label}</Link>)}
      <Link className="section-link not-in-app" aria-current={pathname === "/install" ? "page" : undefined} href="/install">{d.getApp}<span aria-hidden="true">↗</span></Link>
    </nav>
  );
}
