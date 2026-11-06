import rawPosts from "./posts.json";
import { blogCategory, type BlogCategorySlug } from "./categories";
import { BLOG_PAGE_SIZE } from "./pagination";
export { BLOG_PAGE_SIZE } from "./pagination";

export interface BlogSection { heading: string; paragraphs: string[] }
export interface BlogPost {
  slug: string; category: BlogCategorySlug; title: string; description: string;
  publishedAt: string; updatedAt: string; featured?: boolean;
  sections: BlogSection[];
  sources: { label: string; url: string }[];
}
const date = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s;
/** Fails the build for malformed or misleading publication metadata. Unpublished articles live outside this registry. */
export function validatePosts(input: unknown): BlogPost[] {
  if (!Array.isArray(input)) throw new Error("Blog posts must be an array");
  const seen = new Set<string>();
  return input.map((entry: unknown) => {
    if (!entry || typeof entry !== "object") throw new Error("Invalid blog entry");
    const p = entry as BlogPost;
    if (!blogCategory(p.category) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)) throw new Error("Invalid blog category or slug");
    const key = `${p.category}/${p.slug}`;
    if (seen.has(key)) throw new Error(`Duplicate blog path: ${key}`);
    seen.add(key);
    if (typeof p.title !== "string" || p.title.trim().length < 5 || typeof p.description !== "string" || p.description.trim().length < 20) throw new Error(`Missing blog title or description: ${key}`);
    if (typeof p.publishedAt !== "string" || typeof p.updatedAt !== "string" || !date(p.publishedAt) || !date(p.updatedAt) || p.updatedAt < p.publishedAt) throw new Error(`Invalid blog dates: ${key}`);
    if (!Array.isArray(p.sections) || p.sections.length === 0 || p.sections.some((s) => typeof s.heading !== "string" || !s.heading.trim() || !Array.isArray(s.paragraphs) || !s.paragraphs.length || s.paragraphs.some((v) => typeof v !== "string" || !v.trim()))) throw new Error(`Missing blog body: ${key}`);
    if (!Array.isArray(p.sources) || p.sources.some((s) => typeof s.label !== "string" || !s.label.trim() || typeof s.url !== "string" || !/^https:\/\//.test(s.url))) throw new Error(`Invalid blog sources: ${key}`);
    return p;
  });
}
export const BLOG_POSTS = validatePosts(rawPosts);
export function publishedPosts(now = new Date()): BlogPost[] {
  const today = now.toISOString().slice(0, 10);
  return BLOG_POSTS.filter((p) => p.publishedAt <= today && p.updatedAt <= today).toSorted((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
export const postPath = (p: Pick<BlogPost, "category" | "slug">) => `/blog/${p.category}/${p.slug}`;
export function categoryPage(category: string, page: number, now = new Date()) {
  const posts = publishedPosts(now).filter((p) => p.category === category);
  const pages = Math.max(1, Math.ceil(posts.length / BLOG_PAGE_SIZE));
  return { posts: posts.slice((page - 1) * BLOG_PAGE_SIZE, page * BLOG_PAGE_SIZE), pages, valid: Number.isInteger(page) && page > 0 && page <= pages };
}
