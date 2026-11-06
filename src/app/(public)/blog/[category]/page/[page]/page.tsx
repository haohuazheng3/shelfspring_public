import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { BLOG_CATEGORIES, blogCategory } from "@/content/blog/categories";
import { categoryPage } from "@/content/blog/catalog";
import { blogPagePath, parseBlogPage } from "@/content/blog/pagination";
import { BlogCollection, collectionMetadata } from "@/components/pages/BlogCollection";

export const revalidate = 3600;
export function generateStaticParams() {
  return BLOG_CATEGORIES.flatMap((c) => Array.from({ length: categoryPage(c.slug, 1).pages - 1 }, (_, i) => ({ category: c.slug, page: String(i + 2) })));
}
type Props = { params: Promise<{ category: string; page: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  const page = parseBlogPage(p.page);
  return page === null ? {} : collectionMetadata(p.category, page);
}
export default async function PaginatedCategory({ params }: Props) {
  const p = await params;
  const page = parseBlogPage(p.page);
  if (!blogCategory(p.category) || page === null || !categoryPage(p.category, page).valid) notFound();
  // The proxy normally canonicalizes these before rendering; keep direct renders consistent too.
  if (page === 1 || p.page !== String(page)) permanentRedirect(blogPagePath(p.category, page));
  return <BlogCollection category={p.category} page={page} />;
}
