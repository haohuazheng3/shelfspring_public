"use client";
import { useEffect } from "react";
import { reportClientError } from "@/lib/client-error-report";

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => { void reportClientError(error).catch(() => undefined); }, [error]);
  return <html lang="en"><body style={{ margin: 0, background: "#f7f6f2", color: "#212936", fontFamily: "system-ui", minHeight: "100vh" }}><main style={{ maxWidth: 560, margin: "0 auto", padding: "72px 24px" }}>
    <div style={{ color: "#2455d6", fontSize: 14, letterSpacing: ".05em", marginBottom: 32 }}>ShelfSpring.</div>
    <section style={{ padding: 28, border: "1px solid #dcdfe3", borderRadius: 24, background: "#fffefa", boxShadow: "0 20px 45px -30px #8d98aa" }}>
      <h1 style={{ marginTop: 0, fontFamily: "Georgia, serif", fontWeight: 400, fontSize: 36, lineHeight: 1.1 }}>A pause in the page.</h1><p style={{ color: "#4c5664", lineHeight: 1.7 }}>This page could not load. Try opening it again. Your saved alerts continue independently.</p>
      <div style={{ display: "flex", gap: 20, alignItems: "center", marginTop: 24 }}><button type="button" onClick={retry} style={{ background: "#2455d6", color: "white", border: 0, borderRadius: 12, padding: "14px 20px", fontSize: 14, cursor: "pointer" }}>Try again</button><a href="/" style={{ color: "#2455d6", fontSize: 14 }}>Go to ShelfSpring</a></div>
    </section>
  </main></body></html>;
}
