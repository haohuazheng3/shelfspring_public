import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

vi.mock("@/components/ui/PendingLink", () => ({ PendingLink: (props: ComponentProps<"a">) => createElement("a", props) }));
import { GUIDE_BRIEFS, GuideLayout, type GuideKey } from "@/components/guides/GuideLayout";
import { Page } from "@/components/site/Page";

function nodes(source: ts.Node): ts.Node[] { const out: ts.Node[] = [source]; source.forEachChild((node) => { out.push(...nodes(node)); }); return out; }
function attribute(node: ts.JsxOpeningElement | ts.JsxSelfClosingElement, name: string) {
  return node.attributes.properties.find((attr): attr is ts.JsxAttribute => ts.isJsxAttribute(attr) && attr.name.getText() === name);
}
function literalAttribute(node: ts.JsxOpeningElement | ts.JsxSelfClosingElement, name: string) {
  const value = attribute(node, name)?.initializer;
  return value && ts.isStringLiteral(value) ? value.text : null;
}
function properties(node: ts.ObjectLiteralExpression): Record<string, string> {
  return Object.fromEntries(node.properties.flatMap((prop) => ts.isPropertyAssignment(prop) && ts.isStringLiteral(prop.initializer)
    ? [[prop.name.getText().replaceAll('"', ""), prop.initializer.text]] : []));
}

/** Follow the actual contents expression, independent of the author's variable name. */
function chapters(file: ts.SourceFile, frame: ts.JsxOpeningElement | ts.JsxSelfClosingElement) {
  const value = attribute(frame, "contents")?.initializer;
  if (!value || !ts.isJsxExpression(value) || !value.expression) throw new Error("Missing chapter contents");
  const declarations = nodes(file).filter(ts.isVariableDeclaration);
  function resolve(expression: ts.Expression, seen = new Set<string>()): Record<string, string>[] {
    if (ts.isParenthesizedExpression(expression)) return resolve(expression.expression, seen);
    if (ts.isArrayLiteralExpression(expression)) return expression.elements.map((entry) => {
      if (!ts.isObjectLiteralExpression(entry)) throw new Error("Chapter must be an explicit object");
      const row = properties(entry);
      if (!row.id) throw new Error("Chapter needs a literal target");
      return row;
    });
    if (ts.isIdentifier(expression)) {
      const name = expression.text;
      if (seen.has(name)) throw new Error("Circular chapter contents");
      const matches = declarations.filter((node) => node.name.getText() === name);
      if (matches.length !== 1 || !matches[0].initializer) throw new Error("Unresolved chapter contents");
      return resolve(matches[0].initializer, new Set([...seen, name]));
    }
    if (ts.isCallExpression(expression) && ts.isPropertyAccessExpression(expression.expression) && expression.expression.name.text === "map") {
      const project = expression.arguments[0];
      if (!project || !ts.isArrowFunction(project) || !project.parameters[0] || !ts.isIdentifier(project.parameters[0].name)) throw new Error("Unsupported chapter mapping");
      const body = ts.isParenthesizedExpression(project.body) ? project.body.expression : project.body;
      const id = ts.isObjectLiteralExpression(body) ? body.properties.find((prop): prop is ts.PropertyAssignment => ts.isPropertyAssignment(prop) && prop.name.getText() === "id") : undefined;
      if (!id || !ts.isPropertyAccessExpression(id.initializer) || id.initializer.expression.getText() !== project.parameters[0].name.text || id.initializer.name.text !== "id") throw new Error("Chapter mapping must preserve actual target IDs");
      return resolve(expression.expression.expression, seen);
    }
    throw new Error("Unsupported chapter contents expression");
  }
  return resolve(value.expression);
}

// The redesign moves existing jump links into a separate column. Verify their real targets survive,
// including the dynamic configuration guide and the checkout guide's h2-level anchor.
describe("editorial navigation preserves real destinations", () => {
  it.each(Object.keys(GUIDE_BRIEFS) as GuideKey[])("keeps %s chapter links usable with a single heading", (guide) => {
    const path = `src/app/(public)/${guide}/page.tsx`;
    const file = ts.createSourceFile(path, readFileSync(path, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const all = nodes(file);
    const elements = all.filter((node): node is ts.JsxOpeningElement | ts.JsxSelfClosingElement => ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node));
    const frame = elements.find((node) => node.tagName.getText() === "GuideLayout")!;
    expect(literalAttribute(frame, "guide")).toBe(guide);
    const entries = chapters(file, frame);
    const targets = new Set(elements.map((node) => literalAttribute(node, "id")).filter(Boolean));
    expect(entries.length).toBeGreaterThan(0);
    for (const item of entries) expect(targets.has(item.id), `${guide} → #${item.id}`).toBe(true);
    expect(elements.some((node) => node.tagName.getText() === "h1")).toBe(false);
    const html = renderToStaticMarkup(GuideLayout({ guide, contents: entries.map((entry) => ({ id: entry.id, label: entry.label ?? entry.nav ?? entry.id })), children: "Evidence fixture" }));
    expect((html.match(/<h1\b/g) ?? [])).toHaveLength(1);
    expect(html).toContain('aria-label="In this notebook"');
    expect(html).toContain("Evidence fixture");
    for (const item of entries) expect(html).toContain(`href="#${item.id}"`);
  });

  it("follows the supplied array rather than an unrelated navigation variable, and rejects changed IDs", () => {
    function read(source: string) {
      const file = ts.createSourceFile("fixture.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const frame = nodes(file).find((node): node is ts.JsxSelfClosingElement => ts.isJsxSelfClosingElement(node) && node.tagName.getText() === "GuideLayout")!;
      return chapters(file, frame);
    }
    const source = 'const nav = [{id:"wrong"}]; const reading = [{id:"real",label:"Evidence"}];';
    expect(read(`${source}<GuideLayout contents={reading} />`)).toEqual([{ id: "real", label: "Evidence" }]);
    expect(read(`${source}<GuideLayout contents={reading.map(row => ({id:row.id,label:row.label}))} />`)).toEqual([{ id: "real", label: "Evidence" }]);
    expect(() => read(`${source}<GuideLayout contents={reading.map(row => ({id:"wrong",label:row.label}))} />`)).toThrow("preserve actual target IDs");
  });

  it.each(["privacy", "terms", "refunds"])("keeps the %s document index attached to actual policy sections", (slug) => {
    const path = `src/app/(public)/${slug}/page.tsx`;
    const file = ts.createSourceFile(path, readFileSync(path, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const all = nodes(file);
    const elements = all.filter((node): node is ts.JsxOpeningElement => ts.isJsxOpeningElement(node));
    const page = elements.find((node) => node.tagName.getText() === "Page")!;
    const contents = nodes(attribute(page, "contents")!).filter(ts.isObjectLiteralExpression).map(properties);
    const targets = elements.filter((node) => node.tagName.getText() === "h2").map((node) => literalAttribute(node, "id"));
    expect(contents.length).toBe(targets.length);
    for (const item of contents) expect(targets).toContain(item.id);
  });

  it("renders policy content and its index in separate accessible regions", () => {
    const html = renderToStaticMarkup(Page({ title: "Policy", contents: [{ id: "rights", label: "Your rights" }], children: createElement("h2", { id: "rights" }, "Your rights") }));
    expect(html).toContain('aria-label="Page sections"');
    expect(html).toContain('href="#rights"');
    expect(html).toContain('id="rights"');
    expect((html.match(/<h1\b/g) ?? [])).toHaveLength(1);
  });
});
