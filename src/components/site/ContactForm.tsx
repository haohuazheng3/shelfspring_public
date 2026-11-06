"use client";
import { useState } from "react";
export function ContactForm() {
  const [state, setState] = useState<"idle" | "busy" | "done" | "preview" | "error">("idle");
  return (
    <form className="mt-4 space-y-3" onSubmit={async (e) => {
      e.preventDefault(); setState("busy");
      const f = new FormData(e.currentTarget);
      try {
        const res = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(f)) });
        const result = await res.json();
        setState(res.ok ? result.notifications === "disabled-preview" ? "preview" : "done" : "error");
      } catch {
        setState("error");
      }
    }}>
      <input className="input" name="email" type="email" placeholder="Your email" required />
      <input className="input" name="subject" placeholder="Subject" />
      <textarea className="input min-h-32" name="message" placeholder="Message" required minLength={5} />
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
      <button className="btn btn-primary" disabled={state === "busy" || state === "done" || state === "preview"}>{state === "busy" ? <span className="spinner" /> : null}{state === "done" ? "Sent — thank you" : state === "preview" ? "Saved in preview" : "Send"}</button>
      {state === "preview" && <p role="status" className="text-sm text-ink-3">Saved in this preview. No email was sent.</p>}
      {state === "error" && <p className="text-sm text-bad">Could not send. Email us instead.</p>}
    </form>
  );
}
