import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/seo/Related";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { blogCategory } from "@/content/blog/categories";
import { postPath, publishedPosts } from "@/content/blog/catalog";
import { ORG_ID } from "@/lib/seo/siteLd";
import { withCuratedMetadata } from "@/lib/seo/curation";

export const revalidate = 3600;
export function generateStaticParams() { return publishedPosts().map((p) => ({ category: p.category, slug: p.slug })); }
type Props = { params: Promise<{ category: string; slug: string }> };
async function find({ params }: Props) { const { category, slug } = await params; return publishedPosts().find((p) => p.category === category && p.slug === slug); }
export async function generateMetadata(props: Props): Promise<Metadata> {
  const p = await find(props);
  if (!p) return {};
  return withCuratedMetadata(postPath(p), { title: p.title, description: p.description, openGraph: { type: "article", title: p.title, description: p.description, url: postPath(p), publishedTime: p.publishedAt, modifiedTime: p.updatedAt, authors: ["ShelfSpring"] } });
}
export default async function ArticlePage(props: Props) {
  const p = await find(props); if (!p) notFound();
  const c = blogCategory(p.category)!;
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://shelfspring.com";
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: p.title, description: p.description, datePublished: p.publishedAt, dateModified: p.updatedAt, author: { "@type": "Organization", "@id": ORG_ID, name: "ShelfSpring", url: base }, publisher: { "@id": ORG_ID }, mainEntityOfPage: `${base}${postPath(p)}`, inLanguage: "en", articleSection: c.name };
  return <article className="field-page journal-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <Breadcrumbs items={[{ href: "/", label: "ShelfSpring" }, { href: "/blog", label: "Journal" }, { href: `/blog/${c.slug}`, label: c.name }, { label: p.title }]} />
    <header className="guide-intro"><p className="field-kicker">{c.name}</p><h1 className="field-title">{p.title}</h1><p className="field-lead">{p.description}</p><p className="text-xs text-ink-3">By ShelfSpring · Published <time dateTime={p.publishedAt}>{p.publishedAt}</time> · Updated <time dateTime={p.updatedAt}>{p.updatedAt}</time></p></header>
    <div className="guide-reading-layout"><aside className="guide-index"><nav aria-label="Contents"><h2 className="eyebrow">In this note</h2><ol>{p.sections.map((s, i) => <li key={i}><a href={`#section-${i + 1}`}><span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>{s.heading}</a></li>)}</ol></nav><Link href={`/blog/${c.slug}`} className="guide-index-link">← More in {c.name}</Link></aside>
      <div className="guide-reading prose-site">{p.sections.map((s, i) => <section id={`section-${i + 1}`} key={i} className="guide-chapter"><h2>{s.heading}</h2>{s.paragraphs.map((text, j) => <p key={j}>{text}</p>)}</section>)}
        {p.sources.length > 0 && <section className="field-callout mt-8"><h2>Source notes</h2><ul>{p.sources.map((s) => <li key={s.url}><a href={s.url} rel="noopener noreferrer" target="_blank">{s.label}</a></li>)}</ul></section>}
      </div>
    </div>
  </article>;
}
