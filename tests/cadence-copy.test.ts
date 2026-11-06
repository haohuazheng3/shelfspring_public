import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { CHECK_NOTE, CHECK_SENTENCE } from "@/lib/plans";
import { liveKey, parseLiveKey } from "@/lib/liveScope";

/** Every user-facing file under src/, admin excluded (it reports measurements, not promises). */
function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return /admin/.test(p) ? [] : files(p);
    return /\.(tsx?|md)$/.test(f) ? [p] : [];
  });
}

describe("cadence copy is consistent everywhere", () => {
  const sources = files("src").map((p) => [p, readFileSync(p, "utf8")] as const);
  it("historical sampling descriptions only mention supported source intervals", () => {
    const bad = sources.flatMap(([p, s]) => [...s.matchAll(/(?:every|about every) (\d+) ?(?:s\b|sec|seconds)/gi)].filter((m) => !["15", "5"].includes(m[1])).map((m) => `${p}: ${m[0]}`));
    expect(bad).toEqual([]);
  });
  it("never says 'about every 15 seconds' (the sweep is every 15 s, not roughly)", () => {
    expect(sources.filter(([, s]) => /about every 15/i.test(s)).map(([p]) => p)).toEqual([]);
  });
  it("current service labels describe updates and observation time without promising a fast lane", () => {
    expect(sources.filter(([, s]) => /· every 15 s</.test(s)).map(([p]) => p)).toEqual([]);
    expect(CHECK_NOTE).toBe("frequent stock updates");
    expect(CHECK_SENTENCE).toContain("synchronized");
    expect(CHECK_SENTENCE).toContain("observation time");
    expect(CHECK_SENTENCE).not.toMatch(/every [35] seconds/);
  });
});

describe("live check scopes", () => {
  it("round-trips and keeps one canonical key per scope (the CDN cache key)", () => {
    expect(liveKey({ model: "duo" })).toBe("m:duo");
    expect(liveKey({ stores: ["R123", "R085", "R085"] })).toBe("s:R085.R123");
    expect(liveKey({ model: "18-pro", stores: ["R085"] })).toBe("m:18-pro|s:R085");
    expect(liveKey({})).toBeNull();
    expect(parseLiveKey("m:duo|s:R085.R123")).toEqual({ model: "duo", stores: ["R085", "R123"] });
    expect(parseLiveKey("m:pixel")).toBeNull();
    expect(parseLiveKey("x:1")).toBeNull();
    expect(parseLiveKey("s:R085;drop")).toBeNull();
  });
});
