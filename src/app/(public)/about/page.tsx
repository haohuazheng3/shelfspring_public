import { withCuratedMetadata } from "@/lib/seo/curation";
import type { Metadata } from "next";
import { Page } from "@/components/site/Page";
import { PendingLink as Link } from "@/components/ui/PendingLink";
export const metadata: Metadata = withCuratedMetadata("/about", { title: { absolute: "About ShelfSpring" }, description: "Independent Apple Store pickup information, recorded restock patterns, and alerts for the iPhone configuration you want.", alternates: { canonical: "/about" } });
export default function About() {
  return <Page title="A field guide for the waiting part." lead="You have picked the phone. ShelfSpring helps you understand the pickup options that come next." wide>
    <div className="about-principles">
      <section><span className="field-kicker">01 / Observe</span><h2>Keep the time attached.</h2><p>An availability flag is useful only with its context. Our boards put a store and configuration beside the latest observation, so you can distinguish a current listing from an earlier return.</p></section>
      <section><span className="field-kicker">02 / Understand</span><h2>Make the history readable.</h2><p>Restock patterns can help you compare options. They do not reveal how many phones arrived or promise what will happen next. We keep those limits visible beside the measurements.</p></section>
      <section><span className="field-kicker">03 / Follow</span><h2>Spend your attention well.</h2><p>Save the combinations and stores that fit your plans. Eligible matching returns can trigger a notification, while browsing the stock board, map and history remains free.</p></section>
    </div>
    <div className="about-foundation pane">
      <div><h2>Shared observations.<br />An independent experience.</h2><p>The inventory feed is shared with an existing collection system. ShelfSpring keeps its own accounts, subscriptions and alert settings, and presents the record through its own tools.</p></div>
      <div><p>Some historical observations predate ShelfSpring. We retain their original timestamps and distinguish recorded stock changes from third-party reports. Imported history never creates a new alert.</p><p>Collection, synchronization and delivery introduce delays. Always confirm a listing with Apple, which handles the order and pickup.</p></div>
    </div>
    <div className="about-closing"><section><h2>Apple handles the purchase.</h2><p>ShelfSpring is independent of Apple Inc.; it is not affiliated with, endorsed by or sponsored by Apple. We do not ask for your Apple ID, place orders or reserve devices. Apple, iPhone and Apple Store are Apple Inc. trademarks.</p></section><section><h2>Help improve the record.</h2><p>A confusing result or an incorrect detail is worth reporting. Use the <Link href="/contact">contact form</Link> or write to <a href="mailto:contact@shelfspring.com">contact@shelfspring.com</a>.</p></section></div>
  </Page>;
}
