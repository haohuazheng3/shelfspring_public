import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { previewInventoryMode } from "@/lib/stock/inventory-mode";
import { sourcePoolConfig, syncOptions } from "@/lib/stock/source-sync";
import { notifyRestocks } from "@/lib/stock/notify";

vi.mock("@/lib/db", () => ({ db: vi.fn(() => { throw new Error("Preview notification must not access a database"); }) }));

const connection = (user: string, database: string, host = "127.0.0.1") => `postgres://${user}:${"test"}@${host}:5432/${database}`;
const preview = {
  PREVIEW_INVENTORY_MODE: "1",
  INVENTORY_SOURCE_DATABASE_URL: connection("shelfspring_inventory_reader", "shelfspring"),
  DATABASE_URL: connection("shelfspring_preview", "shelfspring_preview"),
};

describe("preview inventory isolation", () => {
  it("uses the independent source key and fixes both loops at 10 seconds", () => {
    expect(syncOptions({ ...preview, INVENTORY_SYNC_INTERVAL_MS: "5000", INVENTORY_STATUS_INTERVAL_MS: "5000" })).toMatchObject({
      source: "shelfspring-production", intervalMs: 10_000, statusIntervalMs: 10_000, notificationsEnabled: false,
    });
    expect(syncOptions({ VERCEL_ENV: "preview" }).notificationsEnabled).toBe(false);
    expect(previewInventoryMode({ PREVIEW_INVENTORY_MODE: "false" })).toBe(true);
    expect(previewInventoryMode({ PREVIEW_INVENTORY_MODE: "0", VERCEL_ENV: "production" })).toBe(false);
    expect(() => syncOptions({ ...preview, INVENTORY_SOURCE_KEY: "pickupchecker" })).toThrow("own source key");
  });
  it("allows one local inventory reader and refuses old remote sources, owner roles and destination escapes", () => {
    expect(sourcePoolConfig(preview)).toMatchObject({ max: 1, ssl: false });
    for (const override of [
      { INVENTORY_SOURCE_DATABASE_URL: connection("shelfspring_inventory_reader", "shelfspring", "source.example") },
      { INVENTORY_SOURCE_DATABASE_URL: connection("shelfspring", "shelfspring") },
      { DATABASE_URL: connection("shelfspring_preview", "shelfspring") },
      { DATABASE_URL: connection("shelfspring", "shelfspring_preview") },
      { DATABASE_URL_STANDBY: connection("shelfspring", "shelfspring") },
      { DATABASE_URL_UNPOOLED: connection("shelfspring", "shelfspring") },
    ]) expect(() => sourcePoolConfig({ ...preview, ...override })).toThrow("isolated local");
  });
  it("blocks direct inventory notifier callers before they read watches or contact providers", async () => {
    vi.stubEnv("PREVIEW_INVENTORY_MODE", "1");
    try {
      expect(await notifyRestocks([{ storeNumber: "R001", partNumber: "TEST/A", kind: "restock", quote: "Available", firstSeen: false, at: new Date() }], [1]))
        .toEqual({ matched: 0, sent: 0, failed: 0, skipped: 1 });
    } finally { vi.unstubAllEnvs(); }
  });
});

// Private ops scripts are deliberately absent from the public mirror.
describe.skipIf(!existsSync("scripts/runtime/write-preview-env.py"))("preview environment assembly", () => {
  it("replaces a contaminated env, uses only preview credentials and preserves root-only file permissions", () => {
    const directory = mkdtempSync(join(tmpdir(), "preview-inventory-"));
    try {
      const target = join(directory, "feed.env"), readerPassword = "a".repeat(40);
      writeFileSync(join(directory, "shelfspring_preview-local.url"), connection("shelfspring_preview", "shelfspring_preview"));
      writeFileSync(join(directory, "shelfspring_inventory_reader.pw"), readerPassword);
      writeFileSync(target, "RESEND_API_KEY=should-be-removed\nPOLLER_TOKEN=production-value\n");
      const program = "import importlib.util,sys; s=importlib.util.spec_from_file_location('preview',sys.argv[1]); m=importlib.util.module_from_spec(s); s.loader.exec_module(m); m.write_preview_env(sys.argv[2],sys.argv[3],sys.argv[4])";
      execFileSync("python3", ["-c", program, resolve("scripts/runtime/write-preview-env.py"), target, "a".repeat(40), directory], { stdio: "pipe" });
      const values = Object.fromEntries(readFileSync(target, "utf8").trim().split("\n").map((line) => {
        const equal = line.indexOf("="); return [line.slice(0, equal), JSON.parse(line.slice(equal + 1))];
      }));
      expect(values).toMatchObject({ PREVIEW_INVENTORY_MODE: "1", DATABASE_POOL_MAX: "1", INVENTORY_SOURCE_KEY: "shelfspring-production", INVENTORY_SYNC_INTERVAL_MS: "10000", INVENTORY_STATUS_INTERVAL_MS: "10000" });
      expect(Object.keys(values).filter((key) => /VAPID|MAIL|RESEND|CLERK|STRIPE|POLLER_TOKEN|STANDBY|UNPOOLED/.test(key))).toEqual([]);
      expect(new URL(values.DATABASE_URL).pathname).toBe("/shelfspring_preview");
      expect(new URL(values.INVENTORY_SOURCE_DATABASE_URL).username).toBe("shelfspring_inventory_reader");
      expect(statSync(target).mode & 0o777).toBe(0o600);
      writeFileSync(join(directory, "shelfspring_preview-local.url"), connection("shelfspring", "shelfspring"));
      expect(() => execFileSync("python3", ["-c", program, resolve("scripts/runtime/write-preview-env.py"), target, "a".repeat(40), directory], { stdio: "pipe" })).toThrow();
    } finally { rmSync(directory, { recursive: true, force: true }); }
  });
});
