import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";

// Exercise the real filter callbacks before a React rerender/server response. The
// harness holds navigation pending; visual paint and real slow-network QA are separate.
const h = vi.hoisted(() => ({ slots: [] as unknown[], cursor: 0, effects: [] as (() => void)[], pending: false, push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: h.push }) }));
vi.mock("@/components/ui/PendingLink", () => ({ PendingLink: "a" }));
vi.mock("@/components/i18n/LangProvider", () => ({ useT: () => ({ content: { skeleton: { loading: "Loading" } } }) }));
vi.mock("react", async (original) => {
  const react = await original<typeof import("react")>();
  const state = (initial: unknown) => {
    const index = h.cursor++;
    if (!(index in h.slots)) h.slots[index] = initial;
    return [h.slots[index], (value: unknown) => { h.slots[index] = value; }];
  };
  return { ...react,
    useState: state,
    useOptimistic(initial: unknown) {
      if (!h.pending) h.slots[h.cursor] = initial;
      return state(initial);
    },
    useRef(initial: unknown) { return state({ current: initial })[0]; },
    useTransition: () => [h.pending, (action: () => void) => { h.pending = true; action(); }],
    useEffect(effect: () => void, deps: unknown[]) {
      const index = h.cursor++; const old = h.slots[index] as unknown[] | undefined;
      if (!old || deps.some((value, i) => !Object.is(value, old[i]))) { h.slots[index] = deps; h.effects.push(effect); }
    },
  };
});

import { RestockFilters } from "@/components/restocks/RestockFilters";
import { SkeletonCard } from "@/components/ui/Skeleton";

type Props = Parameters<typeof RestockFilters>[0];
type Node = ReactElement<Record<string, unknown>>;
const initial: Props = { action: "/restocks", initial: { model: "duo", state: "michigan", kind: "restock" },
  models: [{ key: "duo", name: "Duo" }, { key: "18-pro", name: "18 Pro" }],
  states: [{ slug: "michigan", label: "Michigan" }, { slug: "new-york", label: "New York" }],
  labels: { allModels: "All models", restocks: "Restocks", withSoldOut: "Restocks + sold out", region: "State", allRegions: "All states", filter: "Filter" },
  children: "SERVER_RENDERED_FEED_AND_PAGINATION" };
let props: Props;
function nodes(tree: unknown): Node[] {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!tree || typeof tree !== "object" || !("props" in tree)) return [];
  const node = tree as Node; return [node, ...nodes(node.props.children)];
}
function render() { h.cursor = 0; return RestockFilters(props); }
function effects() { h.effects.splice(0).forEach((run) => run()); }
function link(tree: unknown, label: string) { return nodes(tree).find((n) => n.type === "a" && n.props.children === label)!; }
function click(node: Node, extra: Record<string, unknown> = {}) {
  const event = { button: 0, defaultPrevented: false, preventDefault: vi.fn(), ...extra };
  (node.props.onClick as (event: unknown) => void)(event); return event;
}
function submit(tree: unknown, state: string) {
  const form = nodes(tree).find((n) => n.type === "form")!;
  (form.props.onSubmit as (event: unknown) => void)({ currentTarget: { state }, preventDefault: vi.fn() });
}
function lastQuery() { return new URL(h.push.mock.lastCall![0], "https://example.test"); }
beforeEach(() => {
  h.slots = []; h.cursor = 0; h.effects = []; h.pending = false; h.push.mockReset(); props = structuredClone(initial);
  vi.stubGlobal("FormData", class { constructor(private form: { state: string }) {} get(key: string) { return key === "state" ? this.form.state : null; } });
});
afterEach(() => vi.unstubAllGlobals());

describe("restock filter intent and pending feedback", () => {
  it("shows a result-only shimmer while retaining usable filters, then restores the new server children", () => {
    const region = (tree: unknown) => nodes(tree).find((n) => n.type === "div" && n.props.className === "mt-5")!;
    const first = render(); effects();
    expect(region(first).props.children).toBe(props.children);
    expect(nodes(first).some((n) => n.type === SkeletonCard)).toBe(false);
    click(link(first, "Restocks + sold out"));
    const pending = render();
    expect(region(pending).props["aria-busy"]).toBe(true);
    expect(region(pending).props.children).not.toBe(props.children);
    expect(nodes(region(pending)).filter((n) => n.type === SkeletonCard)).toHaveLength(6);
    expect(nodes(region(pending)).some((n) => n.props.role === "status" && n.props["aria-label"] === "Loading")).toBe(true);
    expect(link(pending, "18 Pro").props.disabled).toBeUndefined();
    click(link(pending, "18 Pro"));
    expect(Object.fromEntries(lastQuery().searchParams)).toEqual({ model: "18-pro", state: "michigan", kind: "all" });
    props = { ...props, initial: { ...props.initial, model: "18-pro", kind: "all" }, children: "NEW_SERVER_FEED_AND_PAGINATION" };
    h.pending = false;
    const settled = render(); effects();
    expect(region(settled).props.children).toBe("NEW_SERVER_FEED_AND_PAGINATION");
    expect(region(settled).props["aria-busy"]).toBe(false);
    expect(nodes(settled).some((n) => n.type === SkeletonCard)).toBe(false);
  });
  it.each([["Restocks + sold out", "18 Pro"], ["18 Pro", "Restocks + sold out"]])("merges rapid %s then %s before any server response or rerender", (first, second) => {
    const oldTree = render(); effects();
    click(link(oldTree, first)); click(link(oldTree, second));
    expect(h.push).toHaveBeenCalledTimes(2);
    expect(Object.fromEntries(lastQuery().searchParams)).toEqual({ model: "18-pro", state: "michigan", kind: "all" });
    expect(lastQuery().searchParams.has("page")).toBe(false);
    const optimistic = render();
    expect(link(optimistic, "18 Pro").props["data-on"]).toBe(true);
    expect(link(optimistic, "Restocks + sold out").props["data-on"]).toBe(true);
    expect(link(optimistic, second).props["data-pending"]).toBe(true);
  });

  it("merges a state submission with pending choices and makes the Filter button busy immediately", () => {
    const oldTree = render(); effects();
    click(link(oldTree, "Restocks + sold out")); click(link(oldTree, "18 Pro"));
    submit(oldTree, "new-york");
    expect(Object.fromEntries(lastQuery().searchParams)).toEqual({ model: "18-pro", state: "new-york", kind: "all" });
    const button = nodes(render()).find((n) => n.type === "button")!;
    expect(button.props).toMatchObject({ "aria-busy": true, "data-pending": true, disabled: true });
    props = { ...props, initial: { model: "18-pro", state: "new-york", kind: "all" } }; h.pending = false;
    const settled = render(); effects();
    expect(nodes(settled).find((n) => n.type === "button")!.props).toMatchObject({ "aria-busy": false, disabled: false });
  });

  it("does not overwrite newer intent when an earlier server response arrives while navigation is pending", () => {
    const oldTree = render(); effects();
    click(link(oldTree, "Restocks + sold out")); click(link(oldTree, "18 Pro"));
    props = { ...props, initial: { model: "duo", state: "michigan", kind: "all" } };
    const intermediate = render(); effects(); submit(intermediate, "new-york");
    expect(Object.fromEntries(lastQuery().searchParams)).toEqual({ model: "18-pro", state: "new-york", kind: "all" });
  });

  it("preserves the native locale path and other filters when removing kind or clearing a region", () => {
    props = { ...props, action: "/ja-jp/restocks", initial: { model: "18-pro", state: "michigan", kind: "all" } };
    const tree = render(); effects(); click(link(tree, "Restocks")); submit(tree, "");
    expect(lastQuery().pathname).toBe("/ja-jp/restocks");
    expect(Object.fromEntries(lastQuery().searchParams)).toEqual({ model: "18-pro" });
  });

  it("resynchronizes committed URL filters for back/forward navigation", () => {
    render(); effects();
    props = { ...props, initial: { model: "18-pro", state: "new-york", kind: "restock" } };
    const tree = render(); effects(); click(link(tree, "Restocks + sold out"));
    expect(Object.fromEntries(lastQuery().searchParams)).toEqual({ model: "18-pro", state: "new-york", kind: "all" });
  });

  it("retains real SSR URLs and GET form fields, and lets modified clicks open normally", () => {
    props = { ...props, initial: { ...props.initial, kind: "all" } };
    const tree = render(); effects(); const pro = link(tree, "18 Pro");
    expect(pro.props.href).toBe("/restocks?model=18-pro&state=michigan&kind=all");
    expect(click(pro, { metaKey: true }).preventDefault).not.toHaveBeenCalled();
    expect(h.push).not.toHaveBeenCalled();
    const form = nodes(tree).find((n) => n.type === "form")!;
    expect(form.props).toMatchObject({ action: "/restocks", method: "get" });
    expect(nodes(form).filter((n) => n.type === "input").map((n) => [n.props.name, n.props.value])).toEqual([["model", "duo"], ["kind", "all"]]);
  });
});
