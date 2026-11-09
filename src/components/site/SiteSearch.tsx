"use client";
/**
 * Header search: a state, city, store name, ZIP or model takes you straight to its page.
 * Opens with the button, ⌘K / Ctrl+K, or "/" outside a text field; arrows + Enter to pick.
 *
 * A native <dialog> shown with showModal(), so it lives in the top layer: the header's pane has a
 * backdrop-filter, which makes it the containing block of any `position: fixed` child — the old overlay
 * only covered the header, and the page read through the half-transparent panel. The whole screen on
 * phones (field on top, Cancel beside it), a command palette on larger screens.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { useRouter } from "next/navigation";
import { searchIndex, type SearchEntry, type SearchKind } from "@/lib/search";
import { track } from "@/lib/track";
import { usePathname } from "next/navigation";
import { useAppLocale, useLocale, useT } from "@/components/i18n/LangProvider";
import { treePrefix } from "./HeaderNav";
import { fill as fillIn } from "@/lib/i18n/format";

/**
 * Sample searches under the shortcuts, in the reader's own market: English pages of a country use that country's
 * English place names, a native version its own spelling (each resolves through the search index's aliases).
 */
const EXAMPLES: Record<string, string[]> = {
  us: ["Ohio", "Seattle", "Michigan Avenue", "94108", "Duo 512GB"],
  ca: ["Vancouver", "Eaton Centre", "Calgary", "18 Pro Max"], uk: ["Liverpool", "Covent Garden", "Edinburgh", "18 Pro Max"],
  au: ["Chadstone", "Brisbane", "Sydney", "18 Pro Max"], de: ["Cologne", "Rosenstraße", "Hamburg", "18 Pro Max"],
  fr: ["Bordeaux", "Opéra", "Lyon", "18 Pro Max"], it: ["Turin", "Piazza Liberty", "Rome", "18 Pro Max"],
  es: ["Valencia", "Passeig de Gràcia", "Madrid", "18 Pro Max"], jp: ["Shibuya", "Kyoto", "Osaka", "18 Pro Max"],
  kr: ["Gangnam", "Hanam", "18 Pro Max"], hk: ["Canton Road", "Sha Tin", "18 Pro Max"], sg: ["Orchard Road", "Marina Bay Sands", "18 Pro Max"],
  ae: ["Dubai Mall", "Al Ain", "18 Pro Max"], ch: ["Geneva", "Glattzentrum", "18 Pro Max"], nl: ["Haarlem", "The Hague", "18 Pro Max"],
  se: ["Solna", "Emporia", "18 Pro Max"], tw: ["Taipei 101", "18 Pro Max"], at: ["Vienna", "18 Pro Max"], be: ["Brussels", "18 Pro Max"],
};
/** Native versions: sample searches in the country's own names. */
const NATIVE_EXAMPLES: Record<string, string[]> = { jp: ["渋谷", "京都", "梅田", "18 Pro"], kr: ["강남", "하남", "잠실", "18 Pro"], tw: ["台北 101", "A13", "18 Pro"], hk: ["尖沙咀", "又一城", "沙田", "18 Pro"], de: ["Hamburg", "Köln", "Jungfernstieg", "18 Pro"], at: ["Kärntner Straße", "18 Pro Max"], ch: ["Rennweg", "Glattzentrum", "Rue de Rive", "18 Pro"], fr: ["Marseille", "Bordeaux", "Opéra", "18 Pro"], be: ["18 Pro Max", "Bruxelles"], ca: ["Laval", "Ottawa", "Sainte-Catherine", "18 Pro"], it: ["Torino", "Firenze", "Piazza Liberty", "18 Pro"], es: ["Valencia", "Zaragoza", "Passeig de Gràcia", "18 Pro"], nl: ["Haarlem", "Den Haag", "18 Pro"], se: ["Solna", "Emporia", "18 Pro"], ae: ["دبي مول", "العين", "18 Pro"] };

const SearchIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);

export function SiteSearch() {
  const router = useRouter();
  const d = useT().chrome.search;
  const loc = useLocale();
  const app = useAppLocale();
  const pathname = usePathname() ?? "/";
  const p = treePrefix(pathname, app?.id ?? null);
  const KIND_LABEL: Record<SearchKind, string> = d.kinds;
  const examples = (loc.native ? NATIVE_EXAMPLES[loc.cc] : undefined) ?? EXAMPLES[loc.cc] ?? EXAMPLES.us;
  // Map and return log first: the two pages that answer "where is it now" and "when did it come back".
  const shortcuts: [string, string][] = [[`${p}/map`, d.shortcuts.map], [`${p}/restocks`, d.shortcuts.log], [`${p}/stock/iphone-duo`, d.shortcuts.duo], [`${p}/stores`, p ? d.shortcuts.storesHere : d.shortcuts.stores]];
  const ref = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [active, setActive] = useState(0);

  const load = useCallback(async () => {
    if (index) return;
    try {
      const r = await fetch("/api/search-index");
      if (r.ok) setIndex((await r.json()) as SearchEntry[]);
    } catch { /* offline: the box still works as a way to close */ }
  }, [index]);

  const show = useCallback(() => {
    const d = ref.current;
    if (!d || d.open) return;
    setActive(0); void load(); track("search_open");
    document.documentElement.classList.add("dialog-open");
    d.showModal();
    // In the same tap: iOS only raises the keyboard for a focus() made inside the user's gesture.
    inputRef.current?.focus();
  }, [load]);
  const hide = useCallback(() => ref.current?.close(), []);
  const onClose = () => { setQ(""); document.documentElement.classList.remove("dialog-open"); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const open = Boolean(ref.current?.open);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); if (open) hide(); else show(); return; }
      if (e.key === "/" && !open) {
        const t = e.target as HTMLElement | null;
        const typing = Boolean(t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable));
        if (!typing) { e.preventDefault(); show(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, hide]);

  const query = q.trim();
  const results = index && query ? searchIndex(index, q) : [];
  const go = (e: SearchEntry) => { track("search_go", { kind: e.k, q: query.slice(0, 40) }); hide(); };
  const fill = (text: string) => { setQ(text); setActive(0); inputRef.current?.focus(); };
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, Math.max(0, results.length - 1))); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    else if (e.key === "Enter" && results[active]) { e.preventDefault(); const r = results[active]; go(r); router.push(r.h); }
  };

  return (
    <>
      <button type="button" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line-2 bg-ink/4 text-ink transition hover:bg-ink/10 active:scale-95" aria-label={d.open} title="Find (⌘K)" onClick={show}><SearchIcon /></button>
      <dialog ref={ref} className="search-dialog" aria-label={d.label} onClose={onClose} onClick={(e) => { if (e.target === e.currentTarget) hide(); }}>
        <div className="flex items-center gap-2 border-b border-line px-3 py-3 sm:px-4">
          {/* Ink on the label: the global `input { color: inherit }` is unlayered and beats a text-* utility on the input. */}
          <label className="search-field flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-2xl border border-line-2 bg-ink/4 px-3.5 text-ink">
            <span className="text-ink-3"><SearchIcon className="h-[18px] w-[18px]" /></span>
            <input ref={inputRef} className="search-input h-full min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-ink-3" placeholder={d.placeholder} value={q}
              onChange={(e) => { setQ(e.target.value); setActive(0); }} onKeyDown={onKeyDown} inputMode="search" enterKeyHint="go"
              autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} role="combobox" aria-expanded={results.length > 0} aria-autocomplete="list" aria-controls="site-search-results" aria-label={d.label} />
            {q && <button type="button" className="-me-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg text-ink-3 hover:bg-ink/8 hover:text-ink" aria-label={d.clear} onClick={() => fill("")}>×</button>}
          </label>
          <button type="button" className="shrink-0 px-1.5 text-[15px] font-medium text-accent sm:hidden" onClick={hide}>{d.cancel}</button>
          <kbd className="hidden shrink-0 rounded-md border border-line-2 px-1.5 py-0.5 text-[10px] text-ink-3 sm:block">esc</kbd>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {query === "" ? (
            <div className="px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-ink-3">{d.goTo}</div>
              <ul className="mt-1">
                {shortcuts.map(([h, l]) => (
                  <li key={h}><Link href={h} onClick={hide} className="-mx-2 flex items-center justify-between rounded-xl px-2 py-3 text-[15px] text-ink hover:bg-ink/5">{l}<span aria-hidden className="text-ink-3">›</span></Link></li>
                ))}
              </ul>
              <div className="mt-5 text-xs font-semibold uppercase tracking-wide text-ink-3">{d.try}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {examples.map((x) => <button key={x} type="button" className="chip px-3 py-1.5 text-sm" onClick={() => fill(x)}>{x}</button>)}
              </div>
            </div>
          ) : !index ? (
            <p className="px-4 py-4 text-sm text-ink-3">{d.loading}</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-4 text-sm text-ink-3">{fillIn(d.none, { q: query })}</p>
          ) : (
            <ul id="site-search-results" role="listbox" aria-label={d.results} className="py-2">
              {results.map((r, i) => (
                <li key={`${r.k}:${r.h}:${r.l}`} role="option" aria-selected={i === active}>
                  <Link href={r.h} onClick={() => go(r)} onMouseEnter={() => setActive(i)} className={`flex items-center gap-3 px-4 py-3 ${i === active ? "bg-ink/6" : ""}`}>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-medium text-ink">{r.k === "store" ? `Apple ${r.l}` : r.l}</span>
                      <span className="block truncate text-xs text-ink-3">{r.s}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-ink/6 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-3">{KIND_LABEL[r.k]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </dialog>
    </>
  );
}
