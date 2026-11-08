import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routeCountry, routeCountryForPage } from "@/components/pages/locale";
import { IntlPlaceRestockTimesPage, intlPlaceRestockTimesMetadata, intlRestockPlace } from "@/components/pages/IntlPlaceRestockTimesPage";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[cc]/iphone-duo-restock-times/[region]/[city]">): Promise<Metadata> {
  const { cc, region, city } = await params;
  const r = routeCountry(cc);
  return r && intlRestockPlace(r.c.cc, region, city) ? intlPlaceRestockTimesMetadata(r.c, region, city, r.loc) : {};
}

/**
 * /{cc}/iphone-duo-restock-times/{region}/{city}: the iPhone Duo record of one two-plus-store city of another country.
 * The proxy 308s one-store cities to their store (seo/routes.ts, content/restockPlaces.ts).
 */
export default async function Page({ params }: PageProps<"/[cc]/iphone-duo-restock-times/[region]/[city]">) {
  const { cc, region, city } = await params;
  const r = routeCountryForPage(cc);
  if (!r || !intlRestockPlace(r.c.cc, region, city)) notFound();
  return <IntlPlaceRestockTimesPage country={r.c} regionSlug={region} citySlug={city} />;
}
