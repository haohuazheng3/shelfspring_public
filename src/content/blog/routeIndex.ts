import entries from "./index.json";
import { BLOG_PAGE_SIZE } from "./pagination";
const index = entries as { category: string; slug: string; publishedAt: string; updatedAt: string }[];
/** Small build-time index: routing never imports article bodies. Scheduled posts stay private until their date. */
export function publishedBlogPath(category: string, slug: string, now = new Date()): boolean {
  const today = now.toISOString().slice(0, 10);
  return index.some((p) => p.category === category && p.slug === slug && p.publishedAt <= today && p.updatedAt <= today);
}
/** Reject empty/out-of-range pagination before streaming, using only publication metadata. */
export function publishedBlogPage(category: string, page: number, now = new Date()): boolean {
  const today = now.toISOString().slice(0, 10);
  const count = index.filter((p) => p.category === category && p.publishedAt <= today && p.updatedAt <= today).length;
  return Number.isSafeInteger(page) && page > 0 && page <= Math.max(1, Math.ceil(count / BLOG_PAGE_SIZE));
}
