import { withCuratedMetadata } from "@/lib/seo/curation";
import type { Metadata } from "next";
import { Page } from "@/components/site/Page";
export const metadata: Metadata = withCuratedMetadata("/privacy", { title: "Privacy Policy", description: "How ShelfSpring handles account details, notifications and analytics, with information on retention, deletion and the choices you control.", alternates: { canonical: "/privacy" } });
export default function Privacy() {
  const emailDelivery = process.env.RESEND_API_KEY ? "Resend delivers stock-alert emails. " : "";
  return (
    <Page title="Privacy Policy" lead="Last updated November 6, 2026." contents={[{"id": "what-we-collect", "label": "The information the service uses"}, {"id": "how-we-use-it", "label": "Why it is processed"}, {"id": "processors", "label": "Services that help run ShelfSpring"}, {"id": "analytics", "label": "Your analytics controls"}, {"id": "retention-and-deletion", "label": "How long records stay"}, {"id": "your-rights", "label": "Access, correction and other rights"}, {"id": "cookies", "label": "What the browser remembers"}]}>
      <h2 id="what-we-collect">The information the service uses</h2>
      <ul>
        <li><b>Email address</b> — Clerk uses this address for sign-in by one-time code. It is also the destination for alert emails when none of your devices has notifications enabled.</li>
        <li><b>Push subscription</b> — enabling device notifications supplies us with a browser-generated, anonymous delivery address: an endpoint and two encryption keys. The subscription is linked to your account. Turning notifications off or removing the device deletes that record.</li>
        <li><b>Alert settings</b> — we retain your chosen model, capacity, color and store selections. If you grant location access, your browser uses the location to order nearby stores; that location stays in the browser and is not sent to ShelfSpring.</li>
        <li><b>Payment</b> — Stripe handles the transaction. Our records contain the Stripe identifiers for your customer and subscription, but no card numbers.</li>
        <li><b>Usage analytics</b> — FlowGlance collects page visits, clicks and interactions with forms, including submitted text and uploaded images, for product improvement. The full capture scope and your choices appear under <a href="#analytics">Your analytics controls</a>. We do not use advertising trackers.</li>
        <li><b>Server logs</b> — security and rate limiting use records containing IP addresses and request metadata. These logs are retained for 30 days.</li>
      </ul>
      <h2 id="how-we-use-it">Why it is processed</h2>
      <p>The requested service determines these uses: checking inventory, finding matches for your saved alerts, delivering phone notifications or email, and administering billing. We neither sell nor rent personal data.</p>
      <h2 id="processors">Services that help run ShelfSpring</h2>
      <p>Sign-in relies on Clerk, and payment processing relies on Stripe. {emailDelivery}Device push messages travel through services operated by Apple, Google and Mozilla. The website is hosted on Vercel and the database runs on Linode. Cloudflare supplies DNS, inbound mail, operational messages and private backups. FlowGlance supplies analytics.</p>
      <h2 id="analytics">Your analytics controls</h2>
      <p>We use one analytics provider: FlowGlance. Its record brings together visited pages, clicks, form interactions, device and browser types, and an approximate location inferred from the network address. For a signed-in visit, the record is associated with your account id and email. This lets us connect a support request with the experience you had on the site.</p>
      <p>Allowing analytics enables every FlowGlance capture feature. The captured material includes text submitted in forms, copied text, images uploaded through the site, interactions with media, page content, technical errors and account identity. Text and images you supply can therefore add personal information to the record. We use it to understand how the site is experienced and to investigate problems. Please leave unnecessary sensitive information out of support messages.</p>
      <ul>
        <li><b>EU, EEA, UK and Switzerland</b> — consent comes before loading analytics. The same rule applies when your location cannot be determined. Choosing <b>Accept</b> allows FlowGlance to load; choosing <b>Decline</b> means it does not load.</li>
        <li><b>Everywhere else, including the US</b> — analytics runs by default, with an opt-out available through <b>Do not track me</b> in the page footer. After opting out, FlowGlance no longer loads. A page on which it was already running reloads once to remove it. A browser sending <a href="https://globalprivacycontrol.org" rel="noopener">Global Privacy Control</a> is also treated as having opted out.</li>
      </ul>
      <p>Two browser cookies keep these choices in context. <code>pc_consent</code> retains the analytics choice for 180 days; the footer control, including <b>Analytics off · Turn on</b>, lets you change it at any time. To determine whether consent is needed first, the browser makes a one-time request to Vercel for the country associated with your network address. That answer stays in <code>pc_region</code> for 180 days and is not stored on our servers.</p>
      <h2 id="retention-and-deletion">How long records stay</h2>
      <p>We keep account details and saved alerts for the life of the account. To have the account deleted, send the request from its email address. Deletion takes place within 7 days; only payment records that tax law requires us to retain are kept afterward.</p>
      <h2 id="your-rights">Access, correction and other rights</h2>
      <p>Contact contact@shelfspring.com to request access to your data, a correction or deletion, or to object to its processing. Consent-based processing, including analytics in the EU, EEA, UK and Switzerland, can be stopped by withdrawing consent at any time; withdrawal does not change what was collected previously. Residents of the EU or UK may also raise a complaint with their supervisory authority. For California residents, we do not sell or share personal information within the meaning of the CCPA, and we honor Global Privacy Control.</p>
      <h2 id="cookies">What the browser remembers</h2>
      <p>The necessary sign-in cookies belong to Clerk. ShelfSpring&apos;s <code>pc_consent</code> records your analytics preference, while <code>pc_region</code> records whether the consent-first rule applies. When FlowGlance runs under the rules above, it also sets a first-party analytics cookie. There are no third-party advertising cookies.</p>
    </Page>
  );
}
