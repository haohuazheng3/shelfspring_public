import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { Breadcrumbs } from "@/components/seo/Related";
import { blogCategory } from "@/content/blog/categories";
import { categoryPage, postPath } from "@/content/blog/catalog";
import { blogPagePath } from "@/content/blog/pagination";

export function collectionMetadata(category: string, page = 1): Metadata {
  const c = blogCategory(category);
  if (!c || !categoryPage(category, page).valid) return {};
  const title = `${c.name}${page > 1 ? ` · Page ${page}` : ""}`;
  return { title: c.slug === "using-shelfspring" ? { absolute: title } : title, description: c.description, alternates: { canonical: blogPagePath(c.slug, page) } };
}

/** URL-only inputs allow category and pagination HTML to share the one-hour ISR policy. */
export function BlogCollection({ category, page = 1 }: { category: string; page?: number }) {
  const c = blogCategory(category);
  if (!c) notFound();
  const result = categoryPage(c.slug, page);
  if (!result.valid) notFound();
  return <div className="site-content mx-auto max-w-5xl px-4 py-8">
    <Breadcrumbs items={[{ href: "/", label: "ShelfSpring" }, { href: "/blog", label: "Journal" }, { label: c.name }]} />
    <p className="eyebrow mt-8">ShelfSpring collection</p><h1 className="display mt-3 text-4xl sm:text-5xl">{c.name}</h1>
    <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-2">{c.intro}</p>
    <section className="pane mt-8 p-6"><h2 className="text-xl font-semibold">Useful right now</h2><div className="mt-4 flex flex-wrap gap-3">{c.tools.map((t) => <Link key={t.href} href={t.href} className="btn btn-ghost">{t.label} →</Link>)}</div></section>
    <section className="mt-10"><h2 className="text-xl font-semibold">Published notes</h2>{result.posts.length === 0 ? <p className="mt-3 text-ink-3">No articles have been published in this collection yet. The tools above are ready to use.</p> : <div className="mt-5 grid gap-5 sm:grid-cols-2">{result.posts.map((p) => <Link key={p.slug} className="pane block p-6" href={postPath(p)}><time className="text-xs text-ink-3" dateTime={p.publishedAt}>{p.publishedAt}</time><h3 className="mt-3 text-xl font-semibold">{p.title}</h3><p className="mt-3 text-sm text-ink-2">{p.description}</p></Link>)}</div>}</section>
    {result.pages > 1 && <nav className="mt-8 flex items-center gap-4" aria-label="Article pages">{page > 1 && <Link className="btn btn-ghost" href={blogPagePath(c.slug, page - 1)}>← Previous</Link>}<span className="text-sm text-ink-3">Page {page} of {result.pages}</span>{page < result.pages && <Link className="btn btn-ghost" href={blogPagePath(c.slug, page + 1)}>Next →</Link>}</nav>}
  </div>;
}
