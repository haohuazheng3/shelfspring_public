import type { Metadata } from "next";
import { Page } from "@/components/site/Page";
import { PendingLink as Link } from "@/components/ui/PendingLink";
export const metadata: Metadata = { title: { absolute: "About ShelfSpring" }, description: "Independent Apple Store pickup information, recorded restock patterns, and alerts for the iPhone configuration you want.", alternates: { canonical: "/about" } };
export default function About() {
  return (
    <Page title="About ShelfSpring" lead="A clearer view of pickup availability, before you make the trip.">
      <p>Choosing an iPhone is one decision. Finding the right model, storage and color at a store you can reach is another. ShelfSpring brings Apple Store pickup listings, recent stock changes and store-level history into one place.</p>
      <h2>What the data can tell you</h2>
      <p>The stock board shows the latest observations available to us. Recorded restocks help you compare stores and configurations, and alerts can notify you when matching availability is detected. Collection, synchronization and delivery take time. Apple confirms the current listing and completes every reservation.</p>
      <p>Our historical dataset includes observations collected before ShelfSpring launched. We preserve their original timestamps and distinguish confirmed stock events from third-party reports. Past frequency is context, not a prediction or a guarantee that you can buy.</p>
      <h2>Independent of Apple</h2>
      <p>ShelfSpring is not affiliated with, endorsed by or sponsored by Apple Inc. We never ask for your Apple ID or place an order on your behalf. Apple, iPhone and Apple Store are trademarks of Apple Inc.</p>
      <h2>Talk to ShelfSpring</h2>
      <p>Use the <Link href="/contact" className="underline">contact form</Link> or email <a href="mailto:contact@shelfspring.com" className="underline">contact@shelfspring.com</a> for questions, corrections or support.</p>
    </Page>
  );
}
