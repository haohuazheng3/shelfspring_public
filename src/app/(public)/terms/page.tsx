import { withCuratedMetadata } from "@/lib/seo/curation";
import type { Metadata } from "next";
import { Page } from "@/components/site/Page";
export const metadata: Metadata = withCuratedMetadata("/terms", { title: "Terms of Service", description: "The terms for using ShelfSpring: live stock data shown as is, alerts on paid plans, and what we can and cannot promise.", alternates: { canonical: "/terms" } });
export default function Terms() {
  return (
    <Page title="Terms of Service" lead="Last updated November 11, 2026." contents={[{"id": "the-service", "label": "What ShelfSpring provides"}, {"id": "accounts", "label": "Your sign-in"}, {"id": "subscriptions", "label": "Plans, renewal and cancellation"}, {"id": "acceptable-use", "label": "Using the service"}, {"id": "availability-and-accuracy", "label": "What the observations can promise"}, {"id": "changes-and-termination", "label": "Updates and account suspension"}, {"id": "contact", "label": "Contact"}]}>
      <h2 id="the-service">What ShelfSpring provides</h2>
      <p>ShelfSpring follows publicly displayed pickup availability on apple.com for selected iPhone models and supported Apple Stores. Its phone and email notifications help you notice matching listings. We do not sell or reserve devices, and receiving an alert does not guarantee a purchase.</p>
      <h2 id="accounts">Your sign-in</h2>
      <p>Access to your account uses a one-time code sent by email. Protect that mailbox: responsibility for activity on the account remains with you.</p>
      <h2 id="subscriptions">Plans, renewal and cancellation</h2>
      <p>Stock browsing, the map and the restock log are free. Paid alert capacity is Plus: 10 alerts for US$5/month; Pro: 20 for US$10/month; or Max: 50 for US$20/month. Stripe bills each month in advance, with automatic renewal until you cancel. Cancellation is available at any time and stops the next renewal; alerts continue through the paid period. Stepping up takes effect immediately and bills the days left in the period; stepping down takes effect at your next renewal, with no refund or credit for the rest of the current period. The <a href="/refunds">Refund Policy</a> permits a request within 7 days of a payment if no restock alert has reached you since that payment. We give 30 days&apos; notice of price changes.</p>
      <h2 id="acceptable-use">Using the service</h2>
      <p>Use ShelfSpring for personal, non-commercial purposes. Scraping, selling its alerts and creating automated accounts are not permitted.</p>
      <h2 id="availability-and-accuracy">What the observations can promise</h2>
      <p>The data records observed Apple listings, which may change before you open them. Delays can occur during collection, synchronization, network transit or device delivery. Historical records may have been collected before ShelfSpring launched. We provide the service &ldquo;as is&rdquo;, without warranties. Our liability is limited to the fees you paid during the preceding 3 months.</p>
      <h2 id="changes-and-termination">Updates and account suspension</h2>
      <p>These terms and the service may change, and the service may be discontinued. Material changes are announced by email. An account that violates these terms may be suspended.</p>
      <h2 id="contact">Contact</h2>
      <p>contact@shelfspring.com</p>
    </Page>
  );
}
