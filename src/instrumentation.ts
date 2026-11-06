import type { Instrumentation } from "next";

export const onRequestError: Instrumentation.onRequestError = async (error, request) => {
  if (process.env.NEXT_PHASE === "phase-production-build" || !process.env.DATABASE_URL) return;
  // Never recurse if the reporting endpoint itself failed. All app routes, including OG, use Node.
  if (request.path.startsWith("/api/errors/client")) return;
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { recordServerError } = await import("./lib/server-error-report");
    await recordServerError(error, request.path);
  }
};
