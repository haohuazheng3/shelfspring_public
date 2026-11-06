import { errorKind, errorRoute } from "./error-shape";

const sent = new Set<string>();
/** Browser-only bounded reporting. Never transmit the raw message, stack, query string or form data. */
export async function reportClientError(value: unknown): Promise<void> {
  if (typeof window === "undefined" || sent.size >= 3) return;
  const error = value instanceof Error ? value : new Error();
  // Next already reports server-render errors through instrumentation; don't count their boundary twice.
  if (typeof (error as { digest?: unknown }).digest === "string") return;
  const kind = errorKind(error.name);
  const route = errorRoute(window.location.pathname);
  const frame = error.stack?.split("\n").slice(1).find((line) => line.trim()) ?? "no-frame";
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${kind}|${route}|${frame}`));
  const fingerprint = Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
  if (sent.has(fingerprint) || sent.size >= 3) return;
  sent.add(fingerprint);
  try {
    const response = await fetch("/api/errors/client", { method: "POST", credentials: "same-origin", cache: "no-store", keepalive: true,
      headers: { "content-type": "application/json" }, body: JSON.stringify({ kind, route, fingerprint }) });
    window.dispatchEvent(new CustomEvent("shelfspring:error-report", { detail: { status: response.status } }));
  } catch {
    // Reporting must never trigger an unhandled rejection or recursively report itself.
    window.dispatchEvent(new CustomEvent("shelfspring:error-report", { detail: { status: 0 } }));
  }
}
