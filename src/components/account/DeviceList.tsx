"use client";
import { useRef, useState } from "react";
import { platformLabel, type Platform } from "@/lib/push/platform";
import { useT } from "@/components/i18n/LangProvider";
import { fill } from "@/lib/i18n/format";
import { useApiError } from "@/components/i18n/useApiError";

/** `added` / `lastAlert` arrive formatted ("3h ago"): computed here they would drift from the server render and fail hydration. */
export interface DeviceView { id: string; platform: string; standalone: boolean; added: string; lastAlert: string | null; disabledAt: string | null; lastError: string | null }

/** Every browser / Home Screen app that registered for notifications on this account. */
export function DeviceList({ devices }: { devices: DeviceView[] }) {
  const text = useT();
  const d = text.account.devices;
  const tErr = useApiError();
  const [removed, setRemoved] = useState<string[]>([]); // over the server's list, which a refresh replaces
  const items = devices.filter((d) => !removed.includes(d.id));
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef(false);
  const remove = async (id: string) => {
    if (pending.current) return;
    pending.current = true;
    setBusy(id); setError(null);
    setRemoved((r) => [...r, id]);
    try {
      const response = await fetch("/api/push/subscribe", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
      const result = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || result.ok !== true) throw new Error(result.error ? tErr(result.error) : text.account.push.errors.notSaved);
    } catch (e) {
      setRemoved((r) => r.filter((item) => item !== id));
      setError(e instanceof Error ? e.message : text.account.push.errors.notSaved);
    } finally { pending.current = false; setBusy(null); }
  };
  if (items.length === 0) return null;
  return (
    <>
    {error && <p role="alert" className="mt-3 text-sm text-bad">{error}</p>}
    <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-ink/3 text-sm" aria-busy={busy != null}>
      {items.map((x) => (
        <li key={x.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
          <span>
            <span className="font-medium">{d.platforms[x.platform] ?? platformLabel(x.platform as Platform)}</span>
            <span className="text-ink-3">{fill(d.meta, { kind: x.standalone ? d.homeScreenApp : d.browser, added: x.added })}{x.lastAlert ? fill(d.lastAlert, { when: x.lastAlert }) : ""}</span>
            {x.disabledAt && <span className="ms-2 rounded-full bg-bad/15 px-2 py-0.5 text-xs text-bad">{d.stopped}</span>}
          </span>
          <button type="button" className="text-ink-3 hover:text-ink" disabled={busy != null} onClick={() => void remove(x.id)}>{d.remove}</button>
        </li>
      ))}
    </ul>
    </>
  );
}
