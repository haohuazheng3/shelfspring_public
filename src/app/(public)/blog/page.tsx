import type { Metadata } from "next";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { Breadcrumbs } from "@/components/seo/Related";
import { BLOG_CATEGORIES } from "@/content/blog/categories";
import { postPath, publishedPosts } from "@/content/blog/catalog";
import { withCuratedMetadata } from "@/lib/seo/curation";

export const revalidate = 3600;
export const metadata: Metadata = withCuratedMetadata("/blog", { title: "Pickup notes & stock insights", description: "ShelfSpring's guide to making sense of pickup availability, restock patterns and useful alerts. Browse the editorial collections and live tools." });
export default function BlogHome() {
  const featured = publishedPosts().filter((p) => p.featured).slice(0, 3);
  return <div className="field-page journal-page">
    <Breadcrumbs items={[{ href: "/", label: "ShelfSpring" }, { label: "Journal" }]} />
    <header className="field-intro"><div><div className="field-kicker">The ShelfSpring journal</div><h1 className="field-title mt-5">A place for the longer view.</h1></div><p className="field-lead">The stock board answers what is listed. These collections make room for the questions around it: how to plan a pickup, interpret a pattern and make useful alerts.</p></header>
    <div className="journal-shelves">{BLOG_CATEGORIES.map((c, i) => <Link key={c.slug} href={`/blog/${c.slug}`} className="journal-shelf">
      <span className="journal-shelf-number" aria-hidden="true">0{i + 1}</span><div><span className="eyebrow">Collection</span><h2>{c.name}</h2></div><p>{c.description}</p><span className="journal-shelf-arrow" aria-hidden="true">↗</span>
    </Link>)}</div>
    {featured.length > 0 && <section className="field-section"><div className="field-section-head"><h2>From the notebook</h2></div><div className="journal-posts">{featured.map((p) => <Link className="journal-post" key={p.slug} href={postPath(p)}><time dateTime={p.publishedAt}>{p.publishedAt}</time><h3>{p.title}</h3><p>{p.description}</p><span aria-hidden="true">↗</span></Link>)}</div></section>}
  </div>;
}
