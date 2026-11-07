import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { Breadcrumbs } from "@/components/seo/Related";
import { blogCategory } from "@/content/blog/categories";
import { categoryPage, postPath } from "@/content/blog/catalog";
import { blogPagePath } from "@/content/blog/pagination";
import { withCuratedMetadata } from "@/lib/seo/curation";

export function collectionMetadata(category: string, page = 1): Metadata {
  const c = blogCategory(category);
  if (!c || !categoryPage(category, page).valid) return {};
  const title = `${c.name}${page > 1 ? ` · Page ${page}` : ""}`;
  return withCuratedMetadata(blogPagePath(c.slug, page), { title: c.slug === "using-shelfspring" ? { absolute: title } : title, description: c.description });
}

/** URL-only inputs allow category and pagination HTML to share the one-hour ISR policy. */
export function BlogCollection({ category, page = 1 }: { category: string; page?: number }) {
  const c = blogCategory(category);
  if (!c) notFound();
  const result = categoryPage(c.slug, page);
  if (!result.valid) notFound();
  return <div className="field-page journal-page">
    <Breadcrumbs items={[{ href: "/", label: "ShelfSpring" }, { href: "/blog", label: "Journal" }, { label: c.name }]} />
    <header className="field-intro"><div><div className="field-kicker">Journal / Collection</div><h1 className="field-title mt-5">{c.name}</h1></div><p className="field-lead">{c.intro}</p></header>
    <div className="field-layout">
      <section className="field-main"><div className="field-section-head"><h2>Published notes</h2>{result.pages > 1 && <span className="eyebrow">Page {page} / {result.pages}</span>}</div>
        {result.posts.length === 0 ? <div className="journal-empty"><span className="journal-empty-mark" aria-hidden="true">—</span><h3>The notebook is open.</h3><p>No articles have been published here yet. You can explore the related tools while this collection takes shape.</p></div> : <div className="journal-posts">{result.posts.map((p) => <Link key={p.slug} className="journal-post" href={postPath(p)}><time dateTime={p.publishedAt}>{p.publishedAt}</time><h3>{p.title}</h3><p>{p.description}</p><span aria-hidden="true">↗</span></Link>)}</div>}
        {result.pages > 1 && <nav className="mt-8 flex flex-wrap items-center gap-4" aria-label="Article pages">{page > 1 && <Link className="btn btn-ghost" href={blogPagePath(c.slug, page - 1)}>← Previous</Link>}<span className="text-sm text-ink-3">Page {page} of {result.pages}</span>{page < result.pages && <Link className="btn btn-ghost" href={blogPagePath(c.slug, page + 1)}>Next →</Link>}</nav>}
      </section>
      <aside className="pane journal-tools"><div className="eyebrow">Open a working tool</div><h2>Put it into practice.</h2><ul>{c.tools.map((t) => <li key={t.href}><Link href={t.href}>{t.label}<span aria-hidden="true">↗</span></Link></li>)}</ul><Link href="/blog" className="journal-back">← All collections</Link></aside>
    </div>
  </div>;
}
