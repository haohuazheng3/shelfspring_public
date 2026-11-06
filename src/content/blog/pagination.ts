/** Shared with the lightweight routing index; importing this never loads article bodies. */
export const BLOG_PAGE_SIZE = 12;
export function parseBlogPage(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : null;
}
export function blogPagePath(category: string, page = 1): string {
  return `/blog/${category}${page > 1 ? `/page/${page}` : ""}`;
}
