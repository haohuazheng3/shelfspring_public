import type { Metadata } from "next";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { planningGuides, PLANNING_HUB, PLANNING_REVIEWED, type PlanningGuide } from "@/content/planning/guides";
import { withCuratedMetadata } from "@/lib/seo/curation";
import { PLANS } from "@/lib/plans";
import { JsonLd } from "@/components/seo/JsonLd";
import { PlanningTool } from "./PlanningTool";
import styles from "./styles";
const origin = "https://shelfspring.com";
export function planningMetadata(guide?: PlanningGuide): Metadata {
  const path = guide ? `/${guide.slug}` : PLANNING_HUB;
  const title = guide?.title ?? "iPhone pickup planning: four decisions, four useful worksheets";
  const description = guide?.description ?? "Plan an iPhone pickup around your deadline, acceptable configurations, reachable stores and travel cost. Four practical guides with interactive worksheets.";
  return withCuratedMetadata(path, { title, description, openGraph: { title, description, url: origin + path, type: guide ? "article" : "website" }, twitter: { card: "summary_large_image", title, description } });
}
export function PlanningHub() {
  return <div className={styles.page}>
    <nav className={styles.crumb} aria-label="Breadcrumb"><Link href="/">ShelfSpring</Link> / Pickup planning</nav>
    <header className={styles.hero}><p className={styles.eyebrow}>The pickup planning desk</p><h1>A phone that fits.<br />A pickup that works.</h1><p>Availability is only the first question. Decide what you would buy, where you could collect it and how much effort an earlier phone is worth. These four worksheets turn those choices into a practical plan.</p><span className={styles.meta}>By ShelfSpring · Reviewed November 7, 2026 · US purchasing context</span></header>
    <div className={styles.cards}>{planningGuides.map((g, i) => <Link href={`/${g.slug}`} key={g.slug}><span className={styles.eyebrow}>Worksheet 0{i + 1}</span><h2>{g.title}</h2><p>{g.description}</p><p>Open the guide and worksheet →</p></Link>)}</div>
    <section className={styles.related}><h2>Use the plan with current availability</h2><p>These tools use your inputs; they do not predict stock, reserve a phone or edit your account. Once you have a shortlist, compare it with current listings.</p><Link href="/stock/iphone-duo">See iPhone Duo pickup listings</Link><Link href="/stores">Find your stores</Link><Link href="/pricing">Understand alert-rule allowances</Link></section>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "CollectionPage", name: "iPhone pickup planning", url: origin + PLANNING_HUB, hasPart: planningGuides.map((g) => ({ "@type": "Article", name: g.title, url: `${origin}/${g.slug}` })) }} />
  </div>;
}
export function PlanningPage({ guide }: { guide: PlanningGuide }) {
  const url = `${origin}/${guide.slug}`;
  return <div className={styles.page}>
    <nav className={styles.crumb} aria-label="Breadcrumb"><Link href="/">ShelfSpring</Link> / <Link href={PLANNING_HUB}>Pickup planning</Link> / Worksheet</nav>
    <header className={styles.hero}><p className={styles.eyebrow}>Pickup planning · A working guide</p><h1>{guide.title}</h1><p>{guide.answer}</p><span className={styles.meta}>By ShelfSpring · Reviewed <time dateTime={PLANNING_REVIEWED}>November 7, 2026</time> · US purchasing context</span></header>
    <div className={styles.layout}><article className={styles.article}>
      <PlanningTool kind={guide.tool} capacities={[PLANS.free, PLANS.plus, PLANS.pro, PLANS.max].map(({ name, limit }) => ({ name, limit }))} />
      {guide.sections.map((s, i) => <section key={s.title} id={`step-${i + 1}`}><h2>{s.title}</h2>{s.paragraphs.map((p) => <p key={p}>{p}</p>)}</section>)}
      <section><h2>Your next-step checklist</h2><ol className={styles.checklist}>{guide.checklist.map((s) => <li key={s}>{s}</li>)}</ol></section>
      <section className={styles.faq}><h2>Questions before you commit</h2>{guide.faqs.map((f) => <div key={f.question}><h3>{f.question}</h3><p>{f.answer}</p></div>)}</section>
      <section><h2>Sources and worksheet assumptions</h2><p>Collection instructions and the ready-notification requirement: <a href="https://www.apple.com/shop/help/shipping_delivery">Apple US shipping and delivery help</a>. Order status and available changes: <a href="https://www.apple.com/shop/help/viewing_changing_orders">Apple US order help</a>. Follow the current instructions for your own order.</p><p>The planning methods are ShelfSpring editorial guidance. Calculator values are your inputs, not measured demand, route estimates or a prediction of stock. Rule capacities come from ShelfSpring’s current plan definitions. Examples are hypothetical and do not save preferences.</p></section>
      <section className={styles.related}><h2>Continue your plan</h2>{planningGuides.filter((g) => g.slug !== guide.slug).map((g) => <Link href={`/${g.slug}`} key={g.slug}>{g.title} →</Link>)}<Link href="/stock/iphone-duo">Compare the plan with current iPhone Duo listings →</Link></section>
    </article><aside className={styles.aside}><h2>On this working page</h2><ol><li><a href="#worksheet">Try the worksheet</a></li>{guide.sections.map((s, i) => <li key={s.title}><a href={`#step-${i + 1}`}>{s.title}</a></li>)}</ol></aside></div>
    <JsonLd data={[{ "@context": "https://schema.org", "@type": "Article", headline: guide.title, description: guide.description, mainEntityOfPage: url, url, datePublished: PLANNING_REVIEWED, dateModified: PLANNING_REVIEWED, author: { "@type": "Organization", name: "ShelfSpring", url: origin + "/about" }, publisher: { "@type": "Organization", name: "ShelfSpring", url: origin }, articleSection: "Pickup planning", inLanguage: "en-US" }, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "ShelfSpring", item: origin }, { "@type": "ListItem", position: 2, name: "Pickup planning", item: origin + PLANNING_HUB }, { "@type": "ListItem", position: 3, name: guide.title, item: url }] }, { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: guide.faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) }]} />
  </div>;
}
