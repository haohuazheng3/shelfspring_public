import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import ts from "typescript";

/**
 * 2026-11-06: next/link's viewport prefetch, re-run after every router.refresh(), made one page view cost ~50
 * Vercel function invocations (1.3 M a day, ~$16/day). Public links go through PendingLink, which prefetches on
 * intent only (hover, touch, focus). These guards keep it that way.
 */
const SRC = join(process.cwd(), "src");
function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(e)) out.push(p);
  }
  return out;
}

describe("link prefetching is on intent only", () => {
  it("PendingLink turns next/link's viewport prefetch off unless a link asks for it", () => {
    const s = readFileSync(join(SRC, "components/ui/PendingLink.tsx"), "utf8");
    expect(s).toContain("prefetch={prefetch === true ? true : false}");
    expect(s).toContain("router.prefetch(to)");
    for (const ev of ["onMouseEnter", "onTouchStart", "onFocus"]) expect(s).toContain(`${ev}={(e) => {`);
  });

  it("every component and page uses the shared link, including admin and checkout", () => {
    const offenders = walk(SRC)
      .filter((f) => /(?:from\s*|import\s*\(|require\s*\()?["']next\/link["']/.test(readFileSync(f, "utf8")))
      .map((f) => relative(SRC, f))
      .filter((f) => f !== "components/ui/PendingLink.tsx");
    expect(offenders).toEqual([]);
  });

  it("no link opts back into viewport prefetch, including bare or computed props", () => {
    const offenders: string[] = [];
    for (const file of walk(SRC).filter((f) => !f.endsWith("PendingLink.tsx"))) {
      const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, file.endsWith("tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
      const visit = (node: ts.Node) => {
        if (ts.isJsxAttribute(node) && node.name.getText(source) === "prefetch") {
          const initializer = node.initializer;
          if (!initializer || !ts.isJsxExpression(initializer) || initializer.expression?.kind !== ts.SyntaxKind.FalseKeyword) offenders.push(relative(SRC, file));
        }
        ts.forEachChild(node, visit);
      };
      visit(source);
    }
    expect(offenders).toEqual([]);
  });

  it("manual prefetch is confined to the shared intent handler", () => {
    const offenders = walk(SRC)
      .filter((f) => !f.endsWith("PendingLink.tsx"))
      .filter((f) => /\.prefetch\s*\(/.test(readFileSync(f, "utf8")))
      .map((f) => relative(SRC, f));
    expect(offenders).toEqual([]);
  });
});
