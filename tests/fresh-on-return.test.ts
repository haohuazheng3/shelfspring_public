import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  path: "/privacy", live: false, refresh: vi.fn(), cleanup: undefined as (() => void) | undefined,
}));
vi.mock("react", () => ({
  // Two effects: the refresh pill's timer (nothing to clean while it is hidden) and the listeners, declared second.
  useEffect: (effect: () => (() => void) | void) => { const c = effect(); if (c) state.cleanup = c; },
  useState: <T,>(v: T) => [v, () => undefined],
  useTransition: () => [false, (fn: () => void) => fn()],
}));
vi.mock("@/components/i18n/LangProvider", () => ({ useT: () => ({ chrome: { refresh: { busy: "Updating…", done: "Updated" } } }) }));
vi.mock("next/navigation", () => ({ usePathname: () => state.path, useRouter: () => ({ refresh: state.refresh }) }));
vi.mock("@/components/site/LiveChecked", () => ({ hasLiveStockSubscribers: () => state.live, STOCK_CHANGED: "pc:stock-changed" }));
import { FreshOnReturn } from "@/components/site/FreshOnReturn";

let page: EventTarget & { visibilityState: string };
let browser: EventTarget;
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-06T12:00:00Z"));
  state.path = "/privacy"; state.live = false; state.refresh.mockReset();
  page = Object.assign(new EventTarget(), { visibilityState: "visible" });
  browser = Object.assign(new EventTarget(), { setInterval, clearInterval, setTimeout, clearTimeout, scrollTo: () => undefined });
  vi.stubGlobal("document", page);
  vi.stubGlobal("window", browser);
});
afterEach(() => {
  state.cleanup?.(); state.cleanup = undefined;
  vi.unstubAllGlobals(); vi.useRealTimers();
});
function visibility(value: "hidden" | "visible") {
  page.visibilityState = value;
  page.dispatchEvent(new Event("visibilitychange"));
}

describe("server refresh only where data needs it", () => {
  it.each(["/privacy", "/terms", "/blog", "/blog/stock-patterns", "/about", "/accounting"])("does not repeatedly render %s without live stock", (path) => {
    state.path = path; FreshOnReturn();
    vi.advanceTimersByTime(6 * 60_000);
    visibility("hidden"); vi.advanceTimersByTime(61_000); visibility("visible");
    browser.dispatchEvent(Object.assign(new Event("pageshow"), { persisted: true }));
    browser.dispatchEvent(new Event("pc:stock-changed")); vi.advanceTimersByTime(30_000);
    expect(state.refresh).not.toHaveBeenCalled();
  });

  it("keeps live stock refreshed when widgets subscribe after the parent mounts", () => {
    state.path = "/stores/california"; FreshOnReturn();
    state.live = true;
    vi.advanceTimersByTime(5 * 60_000);
    expect(state.refresh).toHaveBeenCalledTimes(1);
    browser.dispatchEvent(new Event("pc:stock-changed"));
    vi.advanceTimersByTime(29_999); expect(state.refresh).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1); expect(state.refresh).toHaveBeenCalledTimes(2);
    state.live = false;
    vi.advanceTimersByTime(5 * 60_000);
    expect(state.refresh).toHaveBeenCalledTimes(2);
  });

  it.each(["/account", "/account/settings", "/checkout/success", "/admin/diagnostics"])("preserves fresh private data on %s", (path) => {
    state.path = path; FreshOnReturn();
    visibility("hidden"); vi.advanceTimersByTime(61_000); visibility("visible");
    expect(state.refresh).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(5 * 60_000 + 30_000);
    expect(state.refresh).toHaveBeenCalledTimes(2);
  });

  it("removes timers and event listeners on navigation or unmount", () => {
    state.path = "/account"; FreshOnReturn();
    state.cleanup?.(); state.cleanup = undefined;
    browser.dispatchEvent(Object.assign(new Event("pageshow"), { persisted: true }));
    vi.advanceTimersByTime(6 * 60_000);
    expect(state.refresh).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("a tap on the link to the page on screen (SAME_PAGE_EVENT)", () => {
  it("refreshes a page that shows live stock, once per few seconds", () => {
    state.path = "/stock/iphone-duo"; state.live = true; FreshOnReturn();
    vi.advanceTimersByTime(10_000);
    browser.dispatchEvent(new Event("pc:same-page"));
    browser.dispatchEvent(new Event("pc:same-page"));
    expect(state.refresh).toHaveBeenCalledTimes(1);
  });
  it("only scrolls up on a page without live stock", () => {
    state.path = "/privacy"; state.live = false; FreshOnReturn();
    vi.advanceTimersByTime(10_000);
    browser.dispatchEvent(new Event("pc:same-page"));
    expect(state.refresh).not.toHaveBeenCalled();
  });
});
