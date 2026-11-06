"use client";
import { useEffect } from "react";
import { reportClientError } from "@/lib/client-error-report";

export function ErrorReporter() {
  useEffect(() => {
    const error = (event: ErrorEvent) => { void reportClientError(event.error).catch(() => undefined); };
    const rejection = (event: PromiseRejectionEvent) => { void reportClientError(event.reason).catch(() => undefined); };
    window.addEventListener("error", error);
    window.addEventListener("unhandledrejection", rejection);
    return () => { window.removeEventListener("error", error); window.removeEventListener("unhandledrejection", rejection); };
  }, []);
  return null;
}
