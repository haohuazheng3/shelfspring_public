import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  email: vi.fn(), push: vi.fn(), fetch: vi.fn(), db: vi.fn(), insert: vi.fn(), values: vi.fn(),
  auth: vi.fn(), limit: vi.fn(), error: vi.fn(), ops: vi.fn(), readState: vi.fn(),
}));
vi.mock("resend", () => ({ Resend: class { emails = { send: mocks.email }; } }));
vi.mock("web-push", () => ({ default: { sendNotification: mocks.push } }));
vi.mock("@/lib/db", async () => ({ db: mocks.db, schema: await import("@/lib/db/schema") }));
vi.mock("@/lib/auth", () => ({ ensureUser: mocks.auth, userById: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: mocks.limit, clientIp: () => "127.0.0.1" }));
vi.mock("@/lib/errors", () => ({ recordError: mocks.error, errorMessage: (e: unknown) => String(e) }));
vi.mock("@/lib/ops", () => ({ logOps: mocks.ops }));
vi.mock("@/lib/stock/sweep", () => ({ readState: mocks.readState, writeState: vi.fn() }));

import { sendAlertEmail, sendPlainEmail } from "@/lib/mail/resend";
import { notifyOwner } from "@/lib/mail/owner";
import { notifyPushStopped, pushConfigured, sendPushNudge, sendPushToRows, type PushRow } from "@/lib/push/server";
import { testPayload } from "@/lib/push/payload";
import { POST as testPush } from "@/app/api/push/test/route";
import { GET as publicVapid } from "@/app/api/push/vapid/route";
import { POST as subscribe } from "@/app/api/push/subscribe/route";
import { POST as contact } from "@/app/api/contact/route";
import { POST as ingestInbox } from "@/app/api/inbox/ingest/route";
import { GET as watchdog } from "@/app/api/cron/watchdog/route";
import { env as runtimeEnv } from "@/lib/env";

const device = { id: "fixture-device", endpoint: "https://push.invalid/device", platform: "desktop" } as PushRow;
const payload = testPayload({ device: "Fixture browser", now: new Date("2026-11-06T10:00:00Z") });

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("VERCEL_ENV", "production");
  vi.stubEnv("PREVIEW_INVENTORY_MODE", "");
  vi.stubEnv("RESEND_API_KEY", "fixture-provider-key");
  vi.stubEnv("MAIL_WORKER_URL", "https://mail.invalid");
  vi.stubEnv("MAIL_WORKER_TOKEN", "fixture-worker-token");
  vi.stubEnv("OWNER_EMAIL", "owner@example.invalid");
  vi.stubEnv("VAPID_PUBLIC_KEY", "fixture-public-key");
  vi.stubEnv("VAPID_PRIVATE_KEY", "fixture-private-key");
  vi.stubEnv("INBOX_INGEST_SECRET", "fixture-inbox-token");
  vi.stubEnv("CRON_SECRET", "fixture-cron-token");
  vi.stubGlobal("fetch", mocks.fetch);
  mocks.fetch.mockResolvedValue(new Response(null, { status: 200 }));
  mocks.email.mockResolvedValue({ data: { id: "fixture-provider-id" }, error: null });
  mocks.auth.mockResolvedValue({ id: "fixture-user" });
  mocks.limit.mockResolvedValue(true);
  mocks.error.mockResolvedValue(undefined);
  mocks.ops.mockResolvedValue(undefined);
  mocks.db.mockReturnValue({ insert: mocks.insert });
  mocks.insert.mockReturnValue({ values: mocks.values });
  mocks.values.mockReturnValue({ returning: async () => [{ id: "fixture-inbox-id" }] });
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("preview application notification boundary", () => {
  it.each([
    { env: "preview", flag: "0" },
    { env: "development", flag: "1" },
    { env: "development", flag: "misspelled-enabled-value" },
  ])("blocks every real delivery path with configured credentials: $env / $flag", async ({ env, flag }) => {
    vi.stubEnv("VERCEL_ENV", env); vi.stubEnv("PREVIEW_INVENTORY_MODE", flag);
    await expect(sendAlertEmail("reader@example.invalid", [], "fixture-watch")).rejects.toMatchObject({ code: "PREVIEW_NOTIFICATIONS_DISABLED" });
    await expect(sendPlainEmail("reader@example.invalid", "Subject", "Body")).rejects.toMatchObject({ code: "PREVIEW_NOTIFICATIONS_DISABLED" });
    await expect(sendPushToRows([device], payload)).rejects.toMatchObject({ code: "PREVIEW_NOTIFICATIONS_DISABLED" });
    expect(pushConfigured()).toBe(false);
    expect(runtimeEnv.vapidPublicKey()).toBe("");
    expect(await notifyOwner("Feed stale", "Diagnostic body")).toBe(false);
    expect(await sendPushNudge("fixture-user", "reader@example.invalid")).toBe(false);
    expect(await notifyPushStopped("fixture-user", "reader@example.invalid", [device])).toBe(false);
    for (const spy of [mocks.email, mocks.push, mocks.fetch, mocks.db, mocks.error, mocks.ops]) expect(spy).not.toHaveBeenCalled();
  });

  it("checks at send time after a provider client was cached, without changing production delivery", async () => {
    vi.stubEnv("PREVIEW_INVENTORY_MODE", "0");
    expect(await sendPlainEmail("reader@example.invalid", "Subject", "Body")).toBe("fixture-provider-id");
    expect(await notifyOwner("Feed recovered", "Diagnostic body")).toBe(true);
    expect(mocks.email).toHaveBeenCalledTimes(1);
    expect(mocks.fetch).toHaveBeenCalledTimes(1);
    vi.stubEnv("VERCEL_ENV", "preview");
    await expect(sendPlainEmail("reader@example.invalid", "Again", "Body")).rejects.toMatchObject({ code: "PREVIEW_NOTIFICATIONS_DISABLED" });
    expect(await notifyOwner("Do not send", "Body")).toBe(false);
    expect(mocks.email).toHaveBeenCalledTimes(1);
    expect(mocks.fetch).toHaveBeenCalledTimes(1);
  });

  it("returns an explicit disabled response before registering or sending a browser push", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    const response = await testPush();
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ code: "PREVIEW_NOTIFICATIONS_DISABLED", sent: 0 });
    const key = await publicVapid();
    expect(key.status).toBe(409);
    expect(key.headers.get("cache-control")).toBe("no-store");
    expect(await key.json()).not.toHaveProperty("publicKey");
    expect((await subscribe(new Request("https://preview.invalid/api/push/subscribe", { method: "POST" }))).status).toBe(409);
    expect(mocks.db).not.toHaveBeenCalled();
    expect(mocks.limit).not.toHaveBeenCalled();
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("stores preview contact submissions without claiming that an email was delivered", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    const response = await contact(new Request("https://preview.invalid/api/contact", {
      method: "POST", body: JSON.stringify({ email: "reader@example.invalid", message: "A preview contact message" }),
    }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, notifications: "disabled-preview", notificationDelivered: false });
    expect(mocks.values).toHaveBeenCalledWith(expect.objectContaining({ message: "A preview contact message" }));
    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(mocks.email).not.toHaveBeenCalled();
  });

  it("does not trigger the mail worker's independent health email when the preview watchdog fails", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    mocks.readState.mockRejectedValue(new Error("fixture database failure"));
    const response = await watchdog(new Request("https://preview.invalid/api/cron/watchdog", {
      headers: { authorization: "Bearer fixture-cron-token" },
    }));
    expect(response.status).toBe(500);
    expect(mocks.error).toHaveBeenCalled();
    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(mocks.email).not.toHaveBeenCalled();
  });

  it("allows authenticated inbound test mail while keeping outbound delivery blocked", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    const mail = { to: "owner@example.com", from: "clerk@example.invalid", text: "Fixture verification code", auth: { spf: "pass", dkim: "pass" } };
    const response = await ingestInbox(new Request("https://preview.invalid/api/inbox/ingest", {
      method: "POST", headers: { authorization: "Bearer fixture-inbox-token" }, body: JSON.stringify(mail),
    }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, id: "fixture-inbox-id" });
    expect(mocks.values).toHaveBeenCalledWith(expect.objectContaining({ auth: mail.auth, text: mail.text }));
    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(mocks.email).not.toHaveBeenCalled();
    expect((await ingestInbox(new Request("https://preview.invalid/api/inbox/ingest", { method: "POST", body: JSON.stringify(mail) }))).status).toBe(401);
  });
});
