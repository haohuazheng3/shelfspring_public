import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({
  admin: true, authFails: false, user: null as null | { id: string; email: string },
  records: [] as { message: string; sample: Record<string, unknown> }[], limits: new Map<string, { count: number; reset: number }>(),
}));
vi.mock("@/lib/auth", () => ({ hasAdminSession: async () => state.admin, sessionUser: async () => { if (state.authFails) throw new Error("authentication unavailable"); return state.user; }, isAdminEmail: (email: string) => email === "owner@example.test" }));
vi.mock("@/lib/errors", () => ({ recordError: async (_source: string, message: string, sample: Record<string, unknown>) => { state.records.push({ message, sample }); } }));
vi.mock("@/lib/rate-limit", () => ({ clientIp: (req: Request) => req.headers.get("x-forwarded-for") ?? "192.0.2.1", rateLimit: async (key: string, limit: number, windowMs: number) => {
  let row = state.limits.get(key);
  if (!row || row.reset < Date.now()) { row = { count: 0, reset: Date.now() + windowMs }; state.limits.set(key, row); }
  row.count++; return row.count <= limit;
} }));
import { POST as diagnostic } from "@/app/api/admin/diagnostics/route";
import { POST as report } from "@/app/api/errors/client/route";
import { onRequestError } from "../src/instrumentation";
import { errorRoute } from "@/lib/error-shape";
import { sameOriginJson } from "@/lib/admin/diagnostics";
const body = { kind: "TypeError", route: "/account", fingerprint: "a".repeat(64) };
const request = (path: string, data: unknown, origin = "https://shelfspring.com") => new Request(`https://shelfspring.com${path}`, {
  method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify(data),
});
beforeEach(() => { vi.useFakeTimers(); state.admin = true; state.authFails = false; state.user = null; vi.stubEnv("CRON_SECRET", "fixture-hmac-secret"); state.records = []; state.limits.clear(); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

describe("diagnostic request origin", () => {
  it("accepts the current production, preview or local origin without relying on a production-domain constant", () => {
    for (const origin of ["https://shelfspring.com", "https://shelfspring-git-preview-example.vercel.app", "http://localhost:3000"]) {
      expect(sameOriginJson(new Request(`${origin}/api/errors/client`, { method: "POST", headers: { origin, "content-type": "application/json; charset=utf-8" } }))).toBe(true);
    }
  });
  it("does not let forwarded headers substitute a different origin or allow missing Origin", () => {
    const forged = new Request("https://shelfspring.com/api/errors/client", { method: "POST", headers: { origin: "https://other.example", "content-type": "application/json", "x-forwarded-host": "other.example", "x-forwarded-proto": "https" } });
    expect(sameOriginJson(forged)).toBe(false);
    forged.headers.delete("origin");
    expect(sameOriginJson(forged)).toBe(false);
  });
});

describe("administrator diagnostic actions", () => {
  it("throws and records one fixed server error, returns 500, and bounds repeated triggers", async () => {
    expect((await diagnostic(request("/api/admin/diagnostics", { action: "server-error" }))).status).toBe(500);
    expect(state.records).toEqual([{ message: "ShelfSpring deliberate server acceptance error", sample: { surface: "server", route: "/api/admin/diagnostics", severity: "error", acceptance: true } }]);
    expect((await diagnostic(request("/api/admin/diagnostics", { action: "server-error" }))).status).toBe(429);
    expect(state.records).toHaveLength(1);
  });
  it("has a separate four-request limit test which recovers after ten seconds without recording errors", async () => {
    const statuses = [];
    for (let n = 0; n < 4; n++) statuses.push((await diagnostic(request("/api/admin/diagnostics", { action: "rate-limit" }))).status);
    expect(statuses).toEqual([200, 200, 200, 429]);
    expect([...state.limits.keys()]).toEqual(["admin-diagnostic-rate:admin-session"]);
    vi.advanceTimersByTime(11_000);
    expect((await diagnostic(request("/api/admin/diagnostics", { action: "rate-limit" }))).status).toBe(200);
    expect(state.records).toHaveLength(0);
  });
  it("refuses anonymous, non-admin and cross-origin triggers", async () => {
    state.admin = false;
    expect((await diagnostic(request("/api/admin/diagnostics", { action: "server-error" }))).status).toBe(401);
    state.user = { id: "user_member", email: "member@example.test" };
    expect((await diagnostic(request("/api/admin/diagnostics", { action: "server-error" }))).status).toBe(401);
    state.admin = true;
    expect((await diagnostic(request("/api/admin/diagnostics", { action: "server-error" }, "https://other.example"))).status).toBe(403);
    expect(state.records).toHaveLength(0); expect(state.limits.size).toBe(0);
  });
  it("does not accept arbitrary exception text or extra actions", async () => {
    expect((await diagnostic(request("/api/admin/diagnostics", { action: "server-error", message: "secret" }))).status).toBe(400);
    expect((await diagnostic(request("/api/admin/diagnostics", { action: "send-email" }))).status).toBe(400);
    expect(state.records).toHaveLength(0);
  });
});

describe("bounded client error intake", () => {
  it("stores admin reports as serious and never writes the supplied fingerprint verbatim", async () => {
    expect((await report(request("/api/errors/client", body))).status).toBe(202);
    expect(state.records[0].sample).toMatchObject({ surface: "client", severity: "error", kind: "TypeError", route: "/account" });
    expect(JSON.stringify(state.records)).not.toContain(body.fingerprint);
  });
  it("keeps ordinary signed-in reports as warnings in a separate group, without alarm escalation or downgrading admin groups", async () => {
    await report(request("/api/errors/client", body));
    state.admin = false; state.user = { id: "user_member", email: "member@example.test" };
    expect((await report(request("/api/errors/client", body))).status).toBe(202);
    expect(state.records[1].sample.severity).toBe("warning");
    expect(state.records[1].message).not.toBe(state.records[0].message);
    expect(JSON.stringify(state.records)).not.toContain("member@example.test");
  });
  it("rejects raw messages, stacks, URLs and unknown fields", async () => {
    for (const unsafe of [{ ...body, message: "secret" }, { ...body, stack: "secret" }, { ...body, route: "/account?token=secret" }, { ...body, kind: "secret" }]) {
      expect((await report(request("/api/errors/client", unsafe))).status).toBe(400);
    }
    expect(state.records).toHaveLength(0);
  });
  it("requires same origin and limits signed-in reports to three per minute", async () => {
    expect((await report(request("/api/errors/client", body, "https://other.example"))).status).toBe(403);
    for (let i = 0; i < 3; i++) expect((await report(request("/api/errors/client", body))).status).toBe(202);
    expect((await report(request("/api/errors/client", body))).status).toBe(429);
    expect(state.records).toHaveLength(3);
  });
  it("accepts an anonymous pre-login error as a warning, with a daily-HMAC IP key and one report per route per hour", async () => {
    state.admin = false;
    expect((await report(request("/api/errors/client", body))).status).toBe(202);
    expect(state.records[0].sample.severity).toBe("warning");
    expect((await report(request("/api/errors/client", body))).status).toBe(429);
    expect(JSON.stringify([...state.limits.keys()])).not.toContain("192.0.2.1");
    expect(JSON.stringify(state.records)).not.toContain("fixture-hmac-secret");
  });
  it("deduplicates an anonymous frame across IPs and bounds all anonymous reports globally", async () => {
    state.admin = false;
    expect((await report(request("/api/errors/client", body))).status).toBe(202);
    const second = request("/api/errors/client", body); second.headers.set("x-forwarded-for", "192.0.2.2");
    expect(await (await report(second)).json()).toEqual({ accepted: true, deduplicated: true });
    expect(state.records).toHaveLength(1);
    state.limits.set("client-error-anon:global-minute", { count: 60, reset: Date.now() + 60_000 });
    const third = request("/api/errors/client", { ...body, fingerprint: "b".repeat(64) }); third.headers.set("x-forwarded-for", "192.0.2.3");
    expect((await report(third)).status).toBe(429);
    expect(state.records).toHaveLength(1);
  });
  it("uses anonymous limits if authentication itself fails, and never stores an unsalted IP", async () => {
    state.admin = false; state.authFails = true;
    expect((await report(request("/api/errors/client", body))).status).toBe(202);
    vi.stubEnv("CRON_SECRET", "");
    expect((await report(request("/api/errors/client", body))).status).toBe(503);
    expect(state.records).toHaveLength(1);
  });
  it("bounds actual streamed request bytes even without Content-Length", async () => {
    expect((await report(request("/api/errors/client", { ...body, extra: "x".repeat(600) }))).status).toBe(413);
    expect((await diagnostic(request("/api/admin/diagnostics", { action: "x".repeat(200) }))).status).toBe(413);
    expect(state.records).toHaveLength(0);
  });
  it("maps paths to a fixed route category without retaining secrets or identifiers", () => {
    expect(errorRoute("/account/private-id?token=secret")).toBe("/account");
    expect(errorRoute("/ja-jp/stores/private-store")).toBe("/stores");
    expect(errorRoute("/arbitrary-private-email")).toBe("/content");
  });
});

describe("uncaught server error instrumentation", () => {
  it("records only safe name/route/hashed frame, without request headers or raw message/stack", async () => {
    vi.stubEnv("NEXT_RUNTIME", "nodejs"); vi.stubEnv("DATABASE_URL", "fixture-present");
    const error = new TypeError("password=secret email=private@example.test");
    error.stack = "TypeError: secret\n    at token=private-stack-value";
    await onRequestError(error, { path: "/account?token=private-query", method: "GET", headers: { authorization: "private-bearer" } }, { routerKind: "App Router", routePath: "/account", routeType: "render", revalidateReason: undefined });
    expect(state.records[0].sample).toMatchObject({ surface: "server", route: "/account", severity: "error" });
    expect(JSON.stringify(state.records)).not.toMatch(/secret|private|password|authorization/);
  });
  it("does not recurse into the error reporter or write during a production build", async () => {
    vi.stubEnv("NEXT_RUNTIME", "nodejs"); vi.stubEnv("DATABASE_URL", "fixture-present");
    const context = { routerKind: "App Router", routePath: "/api/errors/client", routeType: "route", revalidateReason: undefined } as const;
    await onRequestError(new Error(), { path: "/api/errors/client", method: "POST", headers: {} }, context);
    vi.stubEnv("NEXT_PHASE", "phase-production-build");
    await onRequestError(new Error(), { path: "/account", method: "GET", headers: {} }, context);
    expect(state.records).toHaveLength(0);
  });
});
