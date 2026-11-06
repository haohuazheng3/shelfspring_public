import { hasAdminSession, isAdminEmail, sessionUser } from "../auth";

/** The password admin cookie is checked cryptographically by the existing auth implementation. */
export async function diagnosticActor() {
  if (await hasAdminSession()) return { key: "admin-session", admin: true };
  const user = await sessionUser();
  return user ? { key: user.id, admin: isAdminEmail(user.email) } : null;
}
export function sameOriginJson(req: Request): boolean {
  return req.headers.get("origin") === new URL(req.url).origin
    && (req.headers.get("content-type") ?? "").split(";", 1)[0] === "application/json";
}

/** Bound bytes while reading, including requests without a trustworthy Content-Length. */
export async function smallJson(req: Request, maxBytes: number): Promise<{ value: unknown } | { error: 400 | 413 }> {
  if (Number(req.headers.get("content-length") ?? 0) > maxBytes) return { error: 413 };
  const reader = req.body?.getReader();
  if (!reader) return { error: 400 };
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let size = 0; let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); return { error: 413 }; }
      text += decoder.decode(value, { stream: true });
    }
    return { value: JSON.parse(text + decoder.decode()) };
  } catch { return { error: 400 }; }
  finally { reader.releaseLock(); }
}
