import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  path: "/privacy", live: false, refresh: vi.fn(), cleanup: undefined as (() => void) | undefined,
}));
vi.mock("react", () => ({ useEffect: (effect: () => (() => void) | void) => { state.cleanup = effect() ?? undefined; } }));
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
  browser = Object.assign(new EventTarget(), { setInterval, clearInterval, setTimeout, clearTimeout });
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
