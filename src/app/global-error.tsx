"use client";
import { useEffect } from "react";
import { reportClientError } from "@/lib/client-error-report";

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => { void reportClientError(error).catch(() => undefined); }, [error]);
  return <html lang="en"><body><main style={{ maxWidth: 520, margin: "64px auto", padding: 24, fontFamily: "system-ui" }}>
    <h1>This page could not load</h1><p>Please try again. Your saved alerts continue independently.</p>
    <button type="button" onClick={retry}>Try again</button> <a href="/">Home</a>
  </main></body></html>;
}
