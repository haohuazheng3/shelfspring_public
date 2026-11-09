import { PendingLink as Link } from "@/components/ui/PendingLink";
import { t, pageLocale } from "@/lib/i18n/server";
import { plural, type Forms } from "@/lib/i18n/format";
import type { Lang } from "@/lib/i18n/locales";
import { localizePath } from "@/lib/i18n/locales";
import { curatedRecommendations, isCuratedPath } from "@/lib/seo/curation";

export interface Crumb { href?: string; label: string }

/** Breadcrumb trail + BreadcrumbList JSON-LD (the last crumb is the current page; its URLs in the page's language version). */
export function Breadcrumbs({ items, base = "https://shelfspring.com" }: { items: Crumb[]; base?: string }) {
  const lang = pageLocale().lang;
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, ...(c.href ? { item: `${base}${localizePath(c.href, lang)}` } : {}) })),
  };
  return (
    <nav className="text-sm text-ink-3" aria-label={t().content.breadcrumb}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      {items.map((c, i) => (
        <span key={i}>{i > 0 && " / "}{c.href ? <Link href={c.href} className="hover:text-ink">{c.label}</Link> : <span className="text-ink-2">{c.label}</span>}</span>
      ))}
    </nav>
  );
}

export interface RelatedLink { href: string; label: string; meta?: string }

/**
 * A titled row of link chips. The optional "more" link closes the row, after the last chip, so the row reads
 * heading → places → the way to the full list.
 */
export function LinkRow({ title, links: input, more: moreInput, curated = false, className = "" }: { title: string; links: RelatedLink[]; more?: RelatedLink; curated?: boolean; className?: string }) {
  const lang = pageLocale().lang;
  const links = curated ? curatedRecommendations(input.map((link) => ({ ...link, href: localizePath(link.href, lang) }))) : input;
  const more = !curated || moreInput && isCuratedPath(localizePath(moreInput.href, lang)) ? moreInput : undefined;
  if (links.length === 0) return null;
  return (
    <div className={className}>
      <div className="eyebrow">{title}</div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {links.map((l) => <Link key={l.href + l.label} href={l.href} className="chip px-3 py-1.5 text-xs">{l.label}{l.meta && <span className="text-ink-3"> · {l.meta}</span>}</Link>)}
        {more && <Link href={more.href} className="ms-1 text-xs text-ink-3 underline-offset-4 hover:text-ink hover:underline">{more.label} <span className="inline-block rtl:-scale-x-100" aria-hidden="true">→</span></Link>}
      </div>
    </div>
  );
}

/**
 * Places grouped under their store count, biggest group first ("4 stores: Houston, Las Vegas, Los Angeles · 3 stores: …"):
 * the count is said once per group instead of after every chip. Links arrive already localized and curated.
 */
export function TierRow({ title, items, tier, lang, more }: { title: string; items: (RelatedLink & { count: number })[]; tier: Forms; lang: Lang; more?: RelatedLink }) {
  if (items.length === 0) return null;
  const groups = [...new Set(items.map((x) => x.count))].sort((a, b) => b - a).map((n) => ({ n, places: items.filter((x) => x.count === n) }));
  return (
    <div>
      <div className="eyebrow">{title}</div>
      <dl className="mt-2 space-y-1.5">
        {groups.map(({ n, places }) => (
          <div key={n} className="flex flex-wrap items-center gap-1.5">
            <dt className="me-1 min-w-16 text-xs font-medium tabular-nums text-ink-3">{plural(lang, n, tier)}</dt>
            {places.map((l) => <dd key={l.href + l.label}><Link href={l.href} className="chip px-3 py-1.5 text-xs">{l.label}</Link></dd>)}
          </div>
        ))}
      </dl>
      {more && <Link href={more.href} className="mt-2 inline-block text-xs text-ink-3 underline-offset-4 hover:text-ink hover:underline">{more.label} <span className="inline-block rtl:-scale-x-100" aria-hidden="true">→</span></Link>}
    </div>
  );
}

/** Container for the "where to look next" block at the bottom of an SEO page. */
export function RelatedBlock({ children, title }: { children: React.ReactNode; title?: string }) {
  const heading = title ?? t().chrome.browse.next;
  return (
    <section className="pane mt-8 space-y-5 p-5 sm:p-6" aria-label={heading}>
      <h2 className="text-lg font-semibold">{heading}</h2>
      {children}
    </section>
  );
}
