"use client";
import { useEffect, useRef, useState } from "react";
export function ContactForm() {
  const [state, setState] = useState<"idle" | "busy" | "done" | "preview" | "error">("idle");
  const invalidFrame = useRef<number | null>(null);
  useEffect(() => () => {
    if (invalidFrame.current !== null) cancelAnimationFrame(invalidFrame.current);
    invalidFrame.current = null;
  }, []);
  return (
    <form className="mt-4 space-y-3" onInvalidCapture={(e) => {
      if (invalidFrame.current !== null) return;
      const form = e.currentTarget;
      // Native validation owns focus and its tooltip. Wait for its scroll, then
      // correct only an invalid field that the sticky masthead still covers.
      invalidFrame.current = requestAnimationFrame(() => {
        invalidFrame.current = null;
        const field = form.querySelector<HTMLInputElement | HTMLTextAreaElement>("input:invalid, textarea:invalid");
        const header = document.querySelector<HTMLElement>("header.site-header");
        if (!field?.isConnected || !header || document.activeElement !== field) return;
        const gap = field.getBoundingClientRect().top - (header.getBoundingClientRect().bottom + 32);
        if (gap < 0) window.scrollBy({ top: gap, behavior: "instant" });
      });
    }} onSubmit={async (e) => {
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
      <div><label className="contact-field-label" htmlFor="contact-email">Your email</label><input id="contact-email" className="input" name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></div>
      <div><label className="contact-field-label" htmlFor="contact-subject">Subject <span className="text-ink-3">· optional</span></label><input id="contact-subject" className="input" name="subject" placeholder="What can we help with?" /></div>
      <div><label className="contact-field-label" htmlFor="contact-message">Your message</label><textarea id="contact-message" className="input min-h-40" name="message" placeholder="Tell us what happened and what you expected." required minLength={5} /></div>
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
      <button className="btn btn-primary" disabled={state === "busy" || state === "done" || state === "preview"}>{state === "busy" ? <span className="spinner" /> : null}{state === "done" ? "Message sent. Thank you." : state === "preview" ? "Kept in this preview" : "Send message"}</button>
      {state === "preview" && <p role="status" className="text-sm text-ink-3">Saved in this preview. No email was sent.</p>}
      {state === "error" && <p className="text-sm text-bad">The message did not go through. Write to contact@shelfspring.com instead.</p>}
    </form>
  );
}
