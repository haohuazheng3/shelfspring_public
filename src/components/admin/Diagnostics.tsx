"use client";
import { useEffect, useState } from "react";

export function Diagnostics() {
  const [busy, setBusy] = useState(false);
  const [clientTriggered, setClientTriggered] = useState(false);
  const [result, setResult] = useState("Ready. Each error intentionally makes full health fail until its group is resolved.");
  useEffect(() => {
    const reported = (event: Event) => {
      const status = (event as CustomEvent<{ status: number }>).detail.status;
      setResult(`Client report HTTP ${status || "network failure"}. A 202 means accepted; verify the Errors page and full health response.`);
    };
    window.addEventListener("shelfspring:error-report", reported);
    return () => window.removeEventListener("shelfspring:error-report", reported);
  }, []);
  async function run(action: "server-error" | "rate-limit", count = 1) {
    setBusy(true); setResult("Running…");
    const statuses: number[] = [];
    try {
      for (let i = 0; i < count; i++) {
        const response = await fetch("/api/admin/diagnostics", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }) });
        statuses.push(response.status);
        if (![200, 429, 500].includes(response.status)) break;
      }
      setResult(`${action}: HTTP ${statuses.join(", ")}. ${action === "rate-limit" ? "Expected fresh run: 200, 200, 200, 429. Wait 11 seconds, then check recovery." : "Expected 500. Verify the error inbox, health 503, and actual owner alert before resolving."}`);
    } catch { setResult("The request did not complete. Inspect the error inbox before trying again."); }
    finally { setBusy(false); }
  }
  return <section className="pane p-5">
    <h1 className="display text-2xl">Operational acceptance</h1>
    <p className="mt-3 text-sm">Administrator only. Error reports contain fixed categories and a hashed frame, never raw messages or stack contents. The existing health probe sends the owner alert; these controls do not send email directly.</p>
    <div className="mt-5 flex flex-wrap gap-3">
      <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => void run("server-error")}>Trigger server error</button>
      <button type="button" className="btn btn-ghost" disabled={busy || clientTriggered} onClick={() => {
        setClientTriggered(true);
        setResult("Throwing a real browser error. Wait for the reporting result.");
        window.setTimeout(() => { throw new Error("ShelfSpring deliberate client acceptance error"); }, 0);
      }}>Trigger client error</button>
      <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => void run("rate-limit", 4)}>Run four-request limit test</button>
      <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => void run("rate-limit")}>Check limit recovery</button>
    </div>
    <p className="mt-4 text-sm" role="status" aria-live="polite">{result}</p>
    <p className="mt-4 text-sm"><a className="underline" href="/admin/errors">Open error inbox</a> · <a className="underline" href="/api/health" target="_blank" rel="noreferrer">Full health</a></p>
    <p className="mt-3 text-xs text-ink-3">Resolve only the deliberate groups after evidence is captured. Reload this page after the client error to finish with a clean browser console.</p>
  </section>;
}
