import { headers } from "next/headers";
import { SiteDocument, siteMetadata, siteViewport } from "@/components/site/Document";
import { requestLocale } from "@/lib/i18n/server";
import { APP_LOCALE_HEADER, nativeLocale } from "@/lib/i18n/locales";
export const metadata = siteMetadata;
export const viewport = siteViewport;
export const dynamic = "force-dynamic";
export default async function PersonalizedLayout({ children }: { children: React.ReactNode }) {
  const loc = await requestLocale();
  const app = nativeLocale((await headers()).get(APP_LOCALE_HEADER)) ?? null;
  return <SiteDocument loc={loc} app={app}>{children}</SiteDocument>;
}
