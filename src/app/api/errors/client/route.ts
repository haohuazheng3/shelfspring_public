import { createHash, createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { diagnosticActor, sameOriginJson, smallJson } from "@/lib/admin/diagnostics";
import { ERROR_KINDS, ERROR_ROUTES } from "@/lib/error-shape";
import { recordError } from "@/lib/errors";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const Body = z.object({ kind: z.enum(ERROR_KINDS), route: z.enum(ERROR_ROUTES), fingerprint: z.string().regex(/^[a-f0-9]{64}$/) }).strict();
export async function POST(req: Request) {
  if (!sameOriginJson(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const input = await smallJson(req, 512);
  if ("error" in input) return NextResponse.json({ error: "invalid report body" }, { status: input.error });
  const parsed = Body.safeParse(input.value);
  if (!parsed.success) return NextResponse.json({ error: "bad request" }, { status: 400 });
  // Authentication can itself be what broke. Missing/unavailable identity gets only anonymous limits.
  const actor = await diagnosticActor().catch(() => null);
  const { kind, route, fingerprint } = parsed.data;
  // Rehash even the bounded client fingerprint; no client-supplied free text reaches logs or storage.
  const frame = createHash("sha256").update(fingerprint).digest("hex").slice(0, 24);
  if (!actor) {
    const secret = process.env.CRON_SECRET;
    if (!secret) return NextResponse.json({ error: "reporting unavailable" }, { status: 503 });
    // Daily HMAC keeps raw IPs out of storage and limits correlation across days.
    const ip = createHmac("sha256", secret).update(`${new Date().toISOString().slice(0, 10)}|${clientIp(req)}`).digest("hex").slice(0, 32);
    if (!(await rateLimit("client-error-anon:global-minute", 60, 60_000))
      || !(await rateLimit("client-error-anon:global-day", 500, 86_400_000))
      || !(await rateLimit(`client-error-anon:${ip}:${route}`, 1, 3_600_000))) {
      return NextResponse.json({ error: "too many reports" }, { status: 429 });
    }
    if (!(await rateLimit(`client-error-anon-frame:${kind}:${route}:${frame}`, 1, 3_600_000))) {
      return NextResponse.json({ accepted: true, deduplicated: true }, { status: 202, headers: { "cache-control": "no-store" } });
    }
  } else if (!(await rateLimit(`client-error:${actor.key}`, 3, 60_000))) return NextResponse.json({ error: "too many reports" }, { status: 429 });
  // Separate groups prevent an ordinary user's warning sample from downgrading an admin's error.
  await recordError("web", `${actor?.admin ? "admin client" : "client"} ${kind} at ${route} frame ${frame}`, { surface: "client", kind, route, frame, severity: actor?.admin ? "error" : "warning" });
  return NextResponse.json({ accepted: true }, { status: 202, headers: { "cache-control": "no-store" } });
}
