import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "@/app/globals.css";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { AlertBar } from "@/components/site/AlertBar";
import { AlertLinkHost } from "@/components/alerts/AlertLinkHost";
import { THEME_BOOT, THEME_COLORS } from "@/lib/theme";
import { Consent } from "@/components/site/Consent";
import { PwaBoot } from "@/components/pwa/PwaBoot";
import { NavSkeleton } from "@/components/ui/NavSkeleton";
import { FreshOnReturn } from "@/components/site/FreshOnReturn";
import { siteLd } from "@/lib/seo/siteLd";
import { LangProvider } from "@/components/i18n/LangProvider";
import { LangSuggest } from "@/components/i18n/LangSuggest";
import { Suspense } from "react";
import type { Locale } from "@/lib/i18n/locales";
import { CDICTS } from "@/lib/i18n/cdict/all";
import { ErrorReporter } from "@/components/site/ErrorReporter";

// "optional": the page renders in the web font only if it is there within ~100 ms (cached after the first
// visit); otherwise it keeps the metric-matched fallback for that view instead of swapping mid-read. Pages now
// paint real text in the first frame, and a late swap re-wrapped the H1 and pushed the content (CLS ~0.15).
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "optional" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "optional" });

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://shelfspring.com";
const INDEXABLE = process.env.NEXT_PUBLIC_INDEXABLE === "1";

export const siteMetadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "ShelfSpring — iPhone pickup alerts, every US Apple Store", template: "%s · ShelfSpring" },
  description:
    "Explore Apple Store pickup availability, compare recorded restocks, and watch the exact iPhone configuration you want. Browse free; alerts start at $5 per month.",
  applicationName: "ShelfSpring",
  robots: INDEXABLE ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: { type: "website", siteName: "ShelfSpring", url: SITE },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "ShelfSpring", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

// theme-color matches the header band (browsers that still read it: Safari before 26, Chrome on Android);
// THEME_BOOT and the toggle switch it with the theme.
export const siteViewport: Viewport = { themeColor: THEME_COLORS.light, width: "device-width", initialScale: 1, viewportFit: "cover" };

/** Locale is URL-derived on public roots; only the personalized root may read request headers. */
export function SiteDocument({ children, loc, app = null, publicPage = false, analytics = true }: {
  children: React.ReactNode; loc: Locale; app?: Locale | null; publicPage?: boolean; analytics?: boolean;
}) {
  return (
    <html lang={loc.native ? loc.tag : "en"} dir={loc.native && loc.lang === "ar" ? "rtl" : undefined} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      {/* Shared App Router root document; next/head is for the Pages Router. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        {/* Runs as the parser reaches it — before any paint — so a dark reader never sees a light flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        {/* Who ShelfSpring is and what it does, on every page an answer engine may land on (lib/seo/siteLd.ts). */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }} />
        {/* Root metadata files do not inherit across independent route-group roots. Keep the one static
            image URL shared by every document without creating duplicate image routes in those groups. */}
        <meta property="og:image" content={new URL("/opengraph-image", SITE).href} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="ShelfSpring — find your iPhone and catch the next restock" />
        <meta name="twitter:image" content={new URL("/opengraph-image", SITE).href} />
        <meta name="twitter:image:alt" content="ShelfSpring — find your iPhone and catch the next restock" />
      </head>
      <body className="flex min-h-full flex-col">
        <LangProvider loc={loc} app={app} d={loc.lang === "en" ? null : CDICTS[loc.lang]} rememberLocale={publicPage}>
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          appearance={{ variables: { colorPrimary: "#24684c" } }}
          signInUrl="/?signin=1"
          signUpUrl="/?signin=1"
        >
          <div className="void-bg" aria-hidden="true" />
          <Header loc={loc} />
          <Suspense fallback={null}><LangSuggest /></Suspense>
          <main className="flex-1 pb-24 sm:pb-28"><NavSkeleton>{children}</NavSkeleton></main>
          <Footer loc={loc} />
          <AlertBar />
          <AlertLinkHost />
          <FreshOnReturn />
          <ErrorReporter />
        </ClerkProvider>
        {analytics && <Consent />}
        <PwaBoot />
        </LangProvider>
      </body>
    </html>
  );
}
