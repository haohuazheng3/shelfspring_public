/**
 * 2026-11-12: the 30-day lead() window behind sell-out times ran on a 60-second cache and, across the three sites,
 * loaded the single-core shared primary (linode-1). It is cached 15 minutes; the recent-restock list reads only the
 * newest restocks and the events after them. Guard both so a refactor does not quietly bring the window back.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const src = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const cacheBlock = (s: string, name: string) => s.slice(s.indexOf(`const ${name} = unstable_cache(`)).split("\n);\n")[0];

describe("sell-out statistics stay on a long cache", () => {
  it("lives: 15 minutes; recent list: no window function", () => {
    const s = src("src/lib/stock/sellouts.ts");
    expect(cacheBlock(s, "cachedLives")).toMatch(/revalidate: 900/);
    const recent = cacheBlock(s, "cachedRecent");
    expect(recent).toMatch(/revalidate: 60/);
    expect(recent).not.toMatch(/over w|lead\(/);
  });
});
