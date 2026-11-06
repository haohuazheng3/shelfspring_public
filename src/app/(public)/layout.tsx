import { SiteDocument, siteMetadata, siteViewport } from "@/components/site/Document";
import { EN_US } from "@/lib/i18n/locales";
export const metadata = siteMetadata;
export const viewport = siteViewport;
export const revalidate = 3600;
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <SiteDocument loc={EN_US} publicPage>{children}</SiteDocument>;
}
