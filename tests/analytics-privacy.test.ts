import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { analyticsDocumentBoundary, analyticsPrivatePath } from "@/lib/analytics-privacy";
import { identify, releaseAnalytics, track } from "@/lib/track";
import { setAnalyticsChoice } from "@/components/site/Consent";

const send = vi.fn(), append = vi.fn();
function environment(pathname: string) {
  const location = { pathname, hostname: "shelfspring.com", protocol: "https:" };
  vi.stubGlobal("location", location);
  vi.stubGlobal("window", { location, fw: send, dispatchEvent: vi.fn() });
  vi.stubGlobal("document", { cookie: "pc_consent=granted", getElementById: () => null,
    createElement: () => ({ dataset: {} }), head: { appendChild: append } });
  vi.stubGlobal("CustomEvent", class { constructor(public type: string, public options: unknown) {} });
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_FLOWGLANCE_KEY", "fw_pub_synthetic");
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("admin analytics isolation", () => {
  it.each(["/admin", "/admin/login", "/admin/inbox?mail=synthetic", "/ad%6din/inbox", "/ADMIN/logs"])("refuses manual identity/events and snippet loading on %s even with consent", (path) => {
    environment(path);
    releaseAnalytics();
    track("watch_saved", { rules: 1 }); identify("synthetic", "synthetic@example.test");
    setAnalyticsChoice("granted");
    expect(send).not.toHaveBeenCalled();
    expect(append).not.toHaveBeenCalled();
  });
  it("preserves the authorized public/account capture and named events", () => {
    environment("/account");
    setAnalyticsChoice("granted"); track("watch_saved", { rules: 1 }); identify("synthetic", "synthetic@example.test");
    expect(append).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledTimes(2);
    expect(analyticsPrivatePath("/administrator-guide")).toBe(false);
    expect(analyticsDocumentBoundary("/account", "/admin/inbox")).toBe(true);
    expect(analyticsDocumentBoundary("/admin/inbox", "/account")).toBe(true);
    expect(analyticsDocumentBoundary("/admin/inbox", "/admin/logs")).toBe(false);
  });
  it("places admin in an independent root without disabling authentication or the error reporter", () => {
    expect(existsSync("src/app/(personalized)/admin")).toBe(false);
    expect(readFileSync("src/app/(admin)/layout.tsx", "utf8")).toContain("analytics={false}");
    expect(existsSync("src/app/(admin)/admin/login/page.tsx")).toBe(true);
    const document = readFileSync("src/components/site/Document.tsx", "utf8");
    expect(document).toContain("{analytics && <Consent />}");
    expect(document).toContain("<ErrorReporter />");
    expect(document).toContain("<ClerkProvider");
  });
  it("marks OTP fields with the provider's actual autocomplete/name filtering contract", () => {
    const form = readFileSync("src/components/alerts/EmailSignIn.tsx", "utf8");
    expect(form).toContain('name="one-time-code"');
    expect(form).toContain('autoComplete="one-time-code"');
    expect(form).toContain('data-fw-track="authentication-code"');
  });
});
