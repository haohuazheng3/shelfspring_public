import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ execute: vi.fn(), noStore: vi.fn(), record: vi.fn() }));
vi.mock("next/cache", () => ({ unstable_cache: (run: unknown) => run, unstable_noStore: mocks.noStore }));
vi.mock("@/lib/db", async () => ({ schema: await import("@/lib/db/schema"), hasDatabase: () => true, db: () => ({ execute: mocks.execute }) }));
vi.mock("@/lib/errors", () => ({ recordError: mocks.record, errorMessage: () => "database read failed" }));
import { siteFacts } from "@/lib/content/siteFacts";

beforeEach(() => { mocks.execute.mockReset(); mocks.noStore.mockReset(); mocks.record.mockReset().mockResolvedValue(undefined); });
describe("failed inventory reads never become cacheable empty pages", () => {
  it("retains the dynamic-page fallback while marking its failed render uncacheable", async () => {
    mocks.execute.mockRejectedValue(new Error("connection unavailable"));
    const result = await siteFacts();
    expect(result.restocks).toBe(0);
    expect(mocks.noStore).toHaveBeenCalledTimes(1);
    expect(mocks.record).toHaveBeenCalledTimes(1);
  });
  it("lets Next's static-render bailout propagate instead of returning an empty snapshot", async () => {
    mocks.execute.mockRejectedValue(new Error("connection unavailable"));
    const bailout = new Error("Dynamic server usage: unstable_noStore()");
    mocks.noStore.mockImplementation(() => { throw bailout; });
    await expect(siteFacts()).rejects.toBe(bailout);
  });
  it("keeps successful observations cacheable", async () => {
    mocks.execute.mockResolvedValue({ rows: [] });
    await siteFacts();
    expect(mocks.noStore).not.toHaveBeenCalled();
    expect(mocks.record).not.toHaveBeenCalled();
  });
});
