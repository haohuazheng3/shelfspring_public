import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../poller/codeHash.mjs", () => ({ pollerCodeHash: () => "fixture" }));
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

async function globalHeaders(flag: string | undefined, target: string | undefined, vercel: string | undefined) {
  vi.stubEnv("NEXT_PUBLIC_INDEXABLE", flag);
  vi.stubEnv("DEPLOY_TARGET", target);
  vi.stubEnv("VERCEL_ENV", vercel);
  vi.resetModules();
  const config = (await import("../next.config")).default;
  const rules = await config.headers!();
  return rules.find((rule) => rule.source === "/(.*)")!.headers;
}

describe("build-time noindex response headers, including prerendered pages", () => {
  it.each(["0", "", undefined])("adds the global response header when production indexing is %s", async (flag) => {
    const headers = await globalHeaders(flag, "production", "production");
    expect(headers).toContainEqual({ key: "X-Robots-Tag", value: "noindex, nofollow" });
    expect(headers).toContainEqual({ key: "X-Content-Type-Options", value: "nosniff" });
  });

  it.each([["preview", undefined], [undefined, "preview"], ["preview", "preview"]])("keeps preview noindex even if its index flag is accidentally enabled (%s/%s)", async (target, vercel) => {
    expect(await globalHeaders("1", target, vercel)).toContainEqual({ key: "X-Robots-Tag", value: "noindex, nofollow" });
  });

  it("does not add an indexing restriction to explicitly indexable production", async () => {
    const headers = await globalHeaders("1", "production", "production");
    expect(headers.some((header) => header.key.toLowerCase() === "x-robots-tag")).toBe(false);
    expect(headers).toContainEqual({ key: "X-Frame-Options", value: "DENY" });
  });
});
