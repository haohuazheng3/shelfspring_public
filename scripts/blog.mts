/** Validate publication metadata and keep middleware's small route index in sync. */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { validatePosts } from "../src/content/blog/catalog";
const content = new URL("../src/content/blog/", import.meta.url);
const posts = validatePosts(JSON.parse(await readFile(new URL("posts.json", content), "utf8")));
const expected = posts.map(({ category, slug, publishedAt, updatedAt }) => ({ category, slug, publishedAt, updatedAt })).sort((a, b) => `${a.category}/${a.slug}`.localeCompare(`${b.category}/${b.slug}`));
const target = new URL("index.json", content);
if (process.argv.includes("--write-index")) {
  await writeFile(target, `${JSON.stringify(expected, null, 2)}\n`);
  console.log(`Indexed ${posts.length} articles in ${fileURLToPath(target)}`);
} else {
  const actual = JSON.parse(await readFile(target, "utf8"));
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error("Blog index is stale. Run npm run blog:index and commit both JSON files.");
  console.log(`Validated ${posts.length} articles; category pages remain available before publication.`);
}
