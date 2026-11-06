import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Historical source measurements can use 15- or 5-second sampling. Current ShelfSpring delivery claims are
 * checked on the exported dictionaries separately; a subscription does not accelerate source polling.
 */
const LANGS = ["ja", "ko", "zh-tw", "zh-hk", "de", "fr", "it", "es", "nl", "sv", "ar"];
const EVERY: RegExp[] = [
  /(\d+)\s*秒(?:ごと|おき|毎)/g, /(\d+)\s*초\s*마다/g, /每\s*(\d+)\s*秒/g,
  /\balle\s+(\d+)\s*(?:Sekunden|Sek\.|s\b)/g, /\btoutes les\s+(\d+)\s*(?:secondes|s\b)/g, /\bogni\s+(\d+)\s*(?:secondi|s\b)/g,
  /\bcada\s+(\d+)\s*(?:segundos|s\b)/g, /\belke\s+(\d+)\s*(?:seconden|sec\.?|s\b)/g, /\bvar\s+(\d+)(?::e)?\s*(?:sekund|s\b)/g,
  /كل\s+(\d+)\s*(?:ثانية|ثوانٍ|ثوان|ث\b)/g,
];
function files(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? files(p) : [p]; });
}
const sources = (code: string) => [...files(`src/lib/i18n/dict/${code}`), ...files(`src/lib/i18n/cdict/${code}`), `src/lib/i18n/notify/${code}.ts`].filter((f) => existsSync(f));

describe("translated copy keeps the facts", () => {
  for (const code of LANGS) {
    it(`${code}: historical sampling intervals remain 15 s or 5 s`, () => {
      const bad: string[] = [];
      for (const f of sources(code)) {
        const text = readFileSync(f, "utf8");
        for (const re of EVERY) for (const m of text.matchAll(re)) if (!["15", "5"].includes(m[1])) bad.push(`${f}: ${m[0]}`);
      }
      expect(bad).toEqual([]);
    });
  }
  it("every language has all three dictionaries", () => {
    for (const code of LANGS) {
      expect(existsSync(`src/lib/i18n/dict/${code}/index.ts`), code).toBe(true);
      expect(existsSync(`src/lib/i18n/cdict/${code}/index.ts`), code).toBe(true);
      expect(existsSync(`src/lib/i18n/notify/${code}.ts`), code).toBe(true);
    }
  });
});
