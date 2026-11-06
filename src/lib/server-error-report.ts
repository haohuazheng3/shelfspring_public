import { createHash } from "node:crypto";
import { recordError } from "./errors";
import { errorKind, errorRoute } from "./error-shape";

/** Node server errors use the existing inbox, with no request headers or free-form error text. */
export async function recordServerError(error: unknown, path: string): Promise<void> {
  const kind = errorKind(error instanceof Error ? error.name : null);
  const firstFrame = error instanceof Error ? error.stack?.split("\n")[1] ?? "no-frame" : "no-frame";
  const frame = createHash("sha256").update(firstFrame).digest("hex").slice(0, 24);
  const route = errorRoute(path);
  await recordError("web", `server ${kind} at ${route} frame ${frame}`, { surface: "server", kind, route, frame, severity: "error" });
}
