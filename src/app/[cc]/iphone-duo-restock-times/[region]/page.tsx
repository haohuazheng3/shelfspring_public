import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routeCountry, routeCountryForPage } from "@/components/pages/locale";
import { IntlPlaceRestockTimesPage, intlPlaceRestockTimesMetadata, intlRestockPlace } from "@/components/pages/IntlPlaceRestockTimesPage";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[cc]/iphone-duo-restock-times/[region]">): Promise<Metadata> {
  const { cc, region } = await params;
  const r = routeCountry(cc);
  return r && intlRestockPlace(r.c.cc, region) ? intlPlaceRestockTimesMetadata(r.c, region, undefined, r.loc) : {};
}

/**
 * /{cc}/iphone-duo-restock-times/{region}: the iPhone Duo record of one region of another country, counted over its
 * stores. Only regions whose /stores page is their own have one; the proxy 308s the rest (seo/routes.ts, content/restockPlaces.ts).
 */
export default async function Page({ params }: PageProps<"/[cc]/iphone-duo-restock-times/[region]">) {
  const { cc, region } = await params;
  const r = routeCountryForPage(cc);
  if (!r || !intlRestockPlace(r.c.cc, region)) notFound();
  return <IntlPlaceRestockTimesPage country={r.c} regionSlug={region} />;
}
