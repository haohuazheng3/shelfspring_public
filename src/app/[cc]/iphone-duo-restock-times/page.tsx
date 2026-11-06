import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routeCountry, routeCountryForPage } from "@/components/pages/locale";
import { RestockTimesPage, restockTimesMetadata } from "@/components/pages/RestockTimesPage";

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<"/[cc]/iphone-duo-restock-times">): Promise<Metadata> {
  const r = routeCountry((await params).cc);
  return r ? restockTimesMetadata(r.c, r.loc) : {};
}

/** /{cc}/iphone-duo-restock-times: the same page for another country's Apple Stores. */
export default async function Page({ params }: PageProps<"/[cc]/iphone-duo-restock-times">) {
  const r = routeCountryForPage((await params).cc);
  if (!r) notFound();
  const c = r.c;
  return <RestockTimesPage country={c} />;
}
