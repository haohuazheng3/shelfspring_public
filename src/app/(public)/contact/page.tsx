import type { Metadata } from "next";
import { Page } from "@/components/site/Page";
import { ContactForm } from "@/components/site/ContactForm";
export const metadata: Metadata = { title: "Contact", description: "Get help with your ShelfSpring account, stock alerts, billing or a data correction. Contact us by email or the secure support form.", alternates: { canonical: "/contact" } };
export default function Contact() {
  return (
    <Page title="Contact" lead="Help with an alert, a payment, or something that does not look right.">
      <p>Email <a href="mailto:contact@shelfspring.com">contact@shelfspring.com</a> or use the form. We aim to reply within one business day.</p>
      <ContactForm />
    </Page>
  );
}
