import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Deployment decisions are made only by the quota-checked CI workflow.
 * A generic failed build must never trigger an unverified production build.
 */
export async function POST() {
  return NextResponse.json({ error: "Webhook deployment fallback is disabled; use the verified deployment workflow." },
    { status: 410, headers: { "cache-control": "no-store" } });
}
