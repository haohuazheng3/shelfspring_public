"use client";

import { useEffect, useOptimistic, useRef, useState, useTransition, type MouseEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { PendingLink } from "@/components/ui/PendingLink";
import { Skeleton } from "@/components/ui/Skeleton";
import { useT } from "@/components/i18n/LangProvider";

interface Filters { model: string; state: string; kind: "restock" | "all" }
interface Props {
  action: string;
  initial: Filters;
  models: { key: string; name: string }[];
  states: { slug: string; label: string }[];
  labels: { allModels: string; restocks: string; withSoldOut: string; region: string; allRegions: string; filter: string };
  children: ReactNode;
}

function filterUrl(action: string, filters: Filters) {
  const query = new URLSearchParams({ model: filters.model });
  if (filters.state) query.set("state", filters.state);
  if (filters.kind === "all") query.set("kind", "all");
  // Any changed filter starts at the first page, as the server-rendered links did.
  return `${action}?${query}`;
}

export function RestockFilters({ action, initial, models, states, labels, children }: Props) {
  const router = useRouter();
  const loading = useT().content.skeleton.loading;
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useOptimistic(initial);
  const [pendingControl, setPendingControl] = useState<string | null>(null);
  // A second click can happen before either React or the first navigation commits.
  // Merge into the latest intent immediately, not the previous server's link href.
  const latest = useRef(initial);
  const { model, state, kind } = initial;
  useEffect(() => {
    if (!pending) latest.current = { model, state, kind };
  }, [model, state, kind, pending]);

  function navigate(change: Partial<Filters>, control: string) {
    const next = { ...latest.current, ...change };
    latest.current = next;
    setPendingControl(control);
    startTransition(() => {
      setSelected(next);
      router.push(filterUrl(action, next));
    });
  }
  function click(event: MouseEvent<HTMLAnchorElement>, change: Partial<Filters>, control: string) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(change, control);
  }
  const busy = (control: string) => pending && pendingControl === control;
  const chip = (label: string, change: Partial<Filters>, control: string, on: boolean) => (
    <PendingLink key={control} href={filterUrl(action, { ...selected, ...change })}
      className="chip px-3 py-1.5 text-xs" data-on={on} data-pending={busy(control) || undefined}
      aria-busy={busy(control)} onClick={(event) => click(event, change, control)}>{label}</PendingLink>
  );

  return <><div className="flex flex-wrap items-center gap-2 border-b border-line pb-5 text-sm" aria-busy={pending}>
    {chip(labels.allModels, { model: "all" }, "model:all", selected.model === "all")}
    {models.map((m) => chip(m.name, { model: m.key }, `model:${m.key}`, selected.model === m.key))}
    <span className="mx-1 text-ink-3">·</span>
    {chip(labels.restocks, { kind: "restock" }, "kind:restock", selected.kind === "restock")}
    {chip(labels.withSoldOut, { kind: "all" }, "kind:all", selected.kind === "all")}
    {states.length > 1 && <form action={action} method="get" className="mt-2 flex w-full items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const region = new FormData(event.currentTarget).get("state");
        navigate({ state: typeof region === "string" ? region : "" }, "state");
      }}>
      <input type="hidden" name="model" value={selected.model} />
      {selected.kind === "all" && <input type="hidden" name="kind" value="all" />}
      <select key={initial.state} name="state" defaultValue={initial.state} className="input min-w-0 flex-1 py-2 text-sm" aria-label={labels.region}>
        <option value="">{labels.allRegions}</option>
        {states.map((s) => <option key={s.slug} value={s.slug}>{s.label}</option>)}
      </select>
      <button className="chip px-3 py-1.5 text-xs" type="submit" disabled={busy("state")}
        aria-busy={busy("state")} data-pending={busy("state") || undefined}>{labels.filter}</button>
    </form>}
  </div>
    <div className="mt-5" aria-busy={pending}>
      {pending ? <div role="status" aria-label={loading}>
        <span className="sr-only">{loading}</span>
        <div className="divide-y divide-line">
          {Array.from({ length: 6 }, (_, i) => <div key={i} className="grid grid-cols-[4.5rem_1fr] gap-4 py-5"><Skeleton className="h-12 w-full" /><div className="space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /><Skeleton className="h-3 w-2/3" /></div></div>)}
        </div>
        <div className="mt-3 flex items-center justify-between"><Skeleton className="h-3 w-12" /><Skeleton className="h-6 w-20 rounded-full" /></div>
      </div> : children}
    </div>
  </>;
}
