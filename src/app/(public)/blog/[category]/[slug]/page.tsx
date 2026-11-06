import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/seo/Related";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { blogCategory } from "@/content/blog/categories";
import { postPath, publishedPosts } from "@/content/blog/catalog";
import { ORG_ID } from "@/lib/seo/siteLd";

export const revalidate = 3600;
export function generateStaticParams() { return publishedPosts().map((p) => ({ category: p.category, slug: p.slug })); }
type Props = { params: Promise<{ category: string; slug: string }> };
async function find({ params }: Props) { const { category, slug } = await params; return publishedPosts().find((p) => p.category === category && p.slug === slug); }
export async function generateMetadata(props: Props): Promise<Metadata> {
  const p = await find(props);
  if (!p) return {};
  return { title: p.title, description: p.description, alternates: { canonical: postPath(p) }, openGraph: { type: "article", title: p.title, description: p.description, url: postPath(p), publishedTime: p.publishedAt, modifiedTime: p.updatedAt, authors: ["ShelfSpring"] } };
}
export default async function ArticlePage(props: Props) {
  const p = await find(props); if (!p) notFound();
  const c = blogCategory(p.category)!;
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://shelfspring.com";
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: p.title, description: p.description, datePublished: p.publishedAt, dateModified: p.updatedAt, author: { "@type": "Organization", "@id": ORG_ID, name: "ShelfSpring", url: base }, publisher: { "@id": ORG_ID }, mainEntityOfPage: `${base}${postPath(p)}`, inLanguage: "en", articleSection: c.name };
  return <article className="site-content mx-auto max-w-3xl px-4 py-8">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <Breadcrumbs items={[{ href: "/", label: "ShelfSpring" }, { href: "/blog", label: "Journal" }, { href: `/blog/${c.slug}`, label: c.name }, { label: p.title }]} />
    <header className="mt-8"><p className="eyebrow">{c.name}</p><h1 className="display mt-3 text-4xl sm:text-5xl">{p.title}</h1><p className="mt-4 text-lg text-ink-2">{p.description}</p><p className="mt-4 text-xs text-ink-3">By ShelfSpring · Published <time dateTime={p.publishedAt}>{p.publishedAt}</time> · Updated <time dateTime={p.updatedAt}>{p.updatedAt}</time></p></header>
    <nav className="pane mt-8 p-5" aria-label="Contents"><h2 className="font-semibold">On this page</h2><ol className="mt-3 space-y-2 text-sm">{p.sections.map((s, i) => <li key={i}><a className="underline-offset-4 hover:underline" href={`#section-${i + 1}`}>{s.heading}</a></li>)}</ol></nav>
    {p.sections.map((s, i) => <section id={`section-${i + 1}`} key={i} className="mt-10 scroll-mt-24"><h2 className="text-2xl font-semibold">{s.heading}</h2>{s.paragraphs.map((text, j) => <p key={j} className="mt-4 leading-relaxed text-ink-2">{text}</p>)}</section>)}
    {p.sources.length > 0 && <section className="pane mt-10 p-5"><h2 className="font-semibold">Sources</h2><ul className="mt-3 space-y-2 text-sm">{p.sources.map((s) => <li key={s.url}><a href={s.url} className="underline underline-offset-4" rel="noopener noreferrer" target="_blank">{s.label}</a></li>)}</ul></section>}
    <Link href={`/blog/${c.slug}`} className="btn btn-ghost mt-8">← More in {c.name}</Link>
  </article>;
}
