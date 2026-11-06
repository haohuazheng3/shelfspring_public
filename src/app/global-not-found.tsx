import { SiteDocument, siteMetadata } from "@/components/site/Document";
import NotFound from "@/components/site/NotFound";
import { requestLocale } from "@/lib/i18n/server";
export const metadata = { ...siteMetadata, title: "Page not found · ShelfSpring", robots: { index: false, follow: false } };
/** Only unmatched URLs read the proxy's locale header; valid public roots remain static. */
export default async function GlobalNotFound() {
  const loc = await requestLocale();
  return <SiteDocument loc={loc} app={loc.native ? loc : null}><NotFound locale={loc} /></SiteDocument>;
}
