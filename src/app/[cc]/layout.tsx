import { notFound } from "next/navigation";
import { SiteDocument, siteMetadata, siteViewport } from "@/components/site/Document";
import { localeFromSegment, NATIVE_LOCALES } from "@/lib/i18n/locales";
import { INTL_CODES } from "@/lib/apple/countries";
export const metadata = siteMetadata;
export const viewport = siteViewport;
export const revalidate = 60;
export function generateStaticParams() {
  return [...INTL_CODES, ...NATIVE_LOCALES.map((loc) => loc.id)].map((cc) => ({ cc }));
}
export default async function CountryLayout({ children, params }: { children: React.ReactNode; params: Promise<{ cc: string }> }) {
  const loc = localeFromSegment((await params).cc);
  if (!loc) notFound();
  return <SiteDocument loc={loc} app={loc.native ? loc : null} publicPage>{children}</SiteDocument>;
}
