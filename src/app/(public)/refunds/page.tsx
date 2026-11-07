import { withCuratedMetadata } from "@/lib/seo/curation";
import type { Metadata } from "next";
import { Page } from "@/components/site/Page";
export const metadata: Metadata = withCuratedMetadata("/refunds", { title: "Refund Policy", description: "Full refund within 7 days of a payment as long as no restock alert has reached you since. Send your request, what counts as an alert, and how cancelling works.", alternates: { canonical: "/refunds" } });
export default function Refunds() {
  return (
    <Page title="Refund Policy" lead="A payment is fully refundable within 7 days if no restock alert has reached you since that payment." contents={[{"id": "when-you-can-get-a-refund", "label": "Check the two conditions"}, {"id": "how-to-ask", "label": "Send your request"}, {"id": "what-happens-after-a-refund", "label": "After the payment is returned"}, {"id": "cancelling-instead", "label": "Cancellation is a separate choice"}]}>
      <h2 id="when-you-can-get-a-refund">Check the two conditions</h2>
      <ul>
        <li><b>Request within 7 days of the charge.</b> The window starts at the time that payment was taken.</li>
        <li><b>No restock alert has reached you since that charge.</b> A restock push sent to any of your devices, or a restock email sent to you, counts as use of the service for that payment and makes it non-refundable.</li>
        <li>Testing your setup does not use up refund eligibility. Neither &ldquo;Send a test notification&rdquo; nor &ldquo;Preview on this device&rdquo; counts as a restock alert.</li>
      </ul>
      <h2 id="how-to-ask">Send your request</h2>
      <p>Write from your account email to <a href="mailto:contact@shelfspring.com?subject=Refund%20request">contact@shelfspring.com</a> and put &ldquo;Refund&rdquo; in the subject. We review the alert log and reply within one business day. An eligible refund goes back to the original payment method; banks usually show it within 5 business days.</p>
      <h2 id="what-happens-after-a-refund">After the payment is returned</h2>
      <ul>
        <li>We return the entire eligible payment. The plan ends immediately, notifications stop and there are no further charges.</li>
        <li>Saved alert rules remain on your account and become active again if you resubscribe.</li>
      </ul>
      <h2 id="cancelling-instead">Cancellation is a separate choice</h2>
      <p>Choose Dashboard → Cancel subscription to stop the next renewal. Your alerts remain active until the paid period ends. Cancellation alone does not return a payment; send the request described above if the payment qualifies.</p>
      <p>Your rights under the consumer law that applies where you live are not limited by this policy.</p>
    </Page>
  );
}
