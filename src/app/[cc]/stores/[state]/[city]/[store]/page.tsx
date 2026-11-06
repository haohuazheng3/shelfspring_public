import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routeCountry, routeCountryForPage } from "@/components/pages/locale";
import { StorePage, storeMetadata } from "@/components/pages/StorePage";

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<"/[cc]/stores/[state]/[city]/[store]">): Promise<Metadata> {
  const { cc, ...p } = await params;
  const r = routeCountry(cc);
  return r ? storeMetadata(r.c, p, r.loc) : {};
}

export default async function Page({ params }: PageProps<"/[cc]/stores/[state]/[city]/[store]">) {
  const { cc, ...p } = await params;
  const r = routeCountryForPage(cc);
  if (!r) notFound();
  const c = r.c;
  return <StorePage country={c} params={p} />;
}

/** Generate and cache valid paths on first visit; avoid querying every store during a build. */
export function generateStaticParams() { return []; }
