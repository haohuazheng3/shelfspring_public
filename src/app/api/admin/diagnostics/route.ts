import { NextResponse } from "next/server";
import { diagnosticActor, sameOriginJson, smallJson } from "@/lib/admin/diagnostics";
import { recordError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  if (!sameOriginJson(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const actor = await diagnosticActor();
  if (!actor?.admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const input = await smallJson(req, 128);
  if ("error" in input) return NextResponse.json({ error: "invalid body" }, { status: input.error });
  let action: unknown;
  if (input.value && typeof input.value === "object" && Object.keys(input.value).length === 1 && "action" in input.value) action = input.value.action;
  if (action === "rate-limit") {
    const allowed = await rateLimit(`admin-diagnostic-rate:${actor.key}`, 3, 10_000);
    return NextResponse.json({ allowed, limit: 3, windowSeconds: 10 }, { status: allowed ? 200 : 429, headers: { "cache-control": "no-store", ...(allowed ? {} : { "retry-after": "10" }) } });
  }
  if (action !== "server-error") return NextResponse.json({ error: "bad request" }, { status: 400 });
  if (!(await rateLimit(`admin-diagnostic-error:${actor.key}`, 1, 60_000))) return NextResponse.json({ error: "wait one minute" }, { status: 429 });
  try {
    throw new Error("ShelfSpring deliberate server acceptance error");
  } catch {
    await recordError("web", "ShelfSpring deliberate server acceptance error", { surface: "server", route: "/api/admin/diagnostics", severity: "error", acceptance: true });
    return NextResponse.json({ error: "Deliberate server error. Verify the error inbox and full health endpoint, then resolve this group." }, { status: 500, headers: { "cache-control": "no-store" } });
  }
}
