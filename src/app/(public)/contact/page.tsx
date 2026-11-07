import { withCuratedMetadata } from "@/lib/seo/curation";
import type { Metadata } from "next";
import { Page } from "@/components/site/Page";
import { ContactForm } from "@/components/site/ContactForm";
export const metadata: Metadata = withCuratedMetadata("/contact", { title: "Contact", description: "Get help with your ShelfSpring account, stock alerts, billing or a data correction. Contact us by email or the secure support form.", alternates: { canonical: "/contact" } });
export default function Contact() {
  return <Page title="Let’s look into it." lead="Account questions, an unexpected result, or a detail we should correct—send us a note." wide>
    <div className="contact-workspace">
      <aside className="contact-context">
        <div className="field-kicker">A direct line</div>
        <h2>What would help?</h2>
        <dl><dt>Stock or alerts</dt><dd>Tell us the model, configuration, store and approximate time you noticed the issue.</dd><dt>An account or payment</dt><dd>Use the email attached to your account. Do not include a password, verification code or card number.</dd><dt>A correction</dt><dd>Include the page address and the detail that needs another look.</dd></dl>
        <p>We aim to respond within one business day.</p><a href="mailto:contact@shelfspring.com">contact@shelfspring.com ↗</a>
      </aside>
      <section className="contact-form-panel pane" aria-labelledby="contact-form-title"><h2 id="contact-form-title">Write to ShelfSpring</h2><p>Your message goes to the person looking after the site.</p><ContactForm /></section>
    </div>
  </Page>;
}
