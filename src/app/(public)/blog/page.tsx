import type { Metadata } from "next";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { Breadcrumbs } from "@/components/seo/Related";
import { BLOG_CATEGORIES } from "@/content/blog/categories";
import { postPath, publishedPosts } from "@/content/blog/catalog";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Pickup notes & stock insights", description: "ShelfSpring's guide to making sense of pickup availability, restock patterns and useful alerts. Browse the editorial collections and live tools.", alternates: { canonical: "/blog" } };
export default function BlogHome() {
  const featured = publishedPosts().filter((p) => p.featured).slice(0, 3);
  return <div className="site-content mx-auto max-w-6xl px-4 py-8">
    <Breadcrumbs items={[{ href: "/", label: "ShelfSpring" }, { label: "Journal" }]} />
    <p className="eyebrow mt-8">The ShelfSpring journal</p>
    <h1 className="display mt-3 text-4xl sm:text-5xl">Make the next pickup easier.</h1>
    <p className="mt-4 max-w-2xl text-lg text-ink-2">Clear explanations, grounded in the inventory record. Choose a collection to explore its live tools and future guides.</p>
    <div className="mt-8 grid gap-5 md:grid-cols-3">{BLOG_CATEGORIES.map((c, i) => <Link key={c.slug} href={`/blog/${c.slug}`} className="pane block p-6 transition-transform hover:-translate-y-1">
      <span className="font-mono text-xs text-ink-3">0{i + 1}</span><h2 className="mt-8 text-xl font-semibold">{c.name}</h2><p className="mt-3 text-sm leading-relaxed text-ink-2">{c.description}</p><span className="mt-6 inline-block text-sm font-medium">Explore collection →</span>
    </Link>)}</div>
    {featured.length > 0 && <section className="mt-12"><h2 className="text-2xl font-semibold">Selected notes</h2><div className="mt-5 grid gap-5 md:grid-cols-3">{featured.map((p) => <Link className="pane p-6" key={p.slug} href={postPath(p)}><time className="text-xs text-ink-3" dateTime={p.publishedAt}>{p.publishedAt}</time><h3 className="mt-3 text-xl font-semibold">{p.title}</h3><p className="mt-2 text-sm text-ink-2">{p.description}</p></Link>)}</div></section>}
  </div>;
}
