import { webcrypto } from "node:crypto";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const fetcher = vi.fn();
beforeEach(() => {
  vi.resetModules(); fetcher.mockReset(); fetcher.mockResolvedValue(new Response(null, { status: 202 }));
  vi.stubGlobal("fetch", fetcher); vi.stubGlobal("crypto", webcrypto);
  vi.stubGlobal("window", { location: { pathname: "/account/private-user" }, dispatchEvent: vi.fn() });
});
afterEach(() => vi.unstubAllGlobals());
it("hashes the frame in the browser and sends no raw message, stack, path identifier or URL query", async () => {
  const { reportClientError } = await import("@/lib/client-error-report");
  const error = new TypeError("secret private@example.test");
  error.stack = "TypeError: private-message\n at https://shelfspring.com/private?token=private-token";
  await reportClientError(error); await reportClientError(error);
  expect(fetcher).toHaveBeenCalledTimes(1);
  const [path, options] = fetcher.mock.calls[0];
  expect(path).toBe("/api/errors/client");
  expect(JSON.parse(options.body)).toMatchObject({ kind: "TypeError", route: "/account" });
  expect(options.body).not.toMatch(/private|secret|token|example/);
  expect(JSON.parse(options.body).fingerprint).toMatch(/^[a-f0-9]{64}$/);
});
it("does not double-count server-render digests or report more than three unique errors per page", async () => {
  const { reportClientError } = await import("@/lib/client-error-report");
  await reportClientError(Object.assign(new Error(), { digest: "server-digest" }));
  for (let n = 0; n < 5; n++) { const error = new Error(); error.stack = `Error\nframe-${n}`; await reportClientError(error); }
  expect(fetcher).toHaveBeenCalledTimes(3);
});
it("absorbs report-network failure instead of producing another unhandled rejection", async () => {
  const { reportClientError } = await import("@/lib/client-error-report");
  fetcher.mockRejectedValue(new Error("offline"));
  await expect(reportClientError(new Error("fixture"))).resolves.toBeUndefined();
});
