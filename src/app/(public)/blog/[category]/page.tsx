import type { Metadata } from "next";
import { BLOG_CATEGORIES } from "@/content/blog/categories";
import { BlogCollection, collectionMetadata } from "@/components/pages/BlogCollection";

export const revalidate = 3600;
export function generateStaticParams() { return BLOG_CATEGORIES.map((c) => ({ category: c.slug })); }
type Props = { params: Promise<{ category: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return collectionMetadata((await params).category);
}
export default async function CategoryPage({ params }: Props) {
  return <BlogCollection category={(await params).category} />;
}
