/**
 * "How long do returns stay on the shelf here?": one quotable line, four big numbers, a line per iPhone, then each
 * return as a bar whose length is the time it stayed listed. Server-rendered (times in the store's own zone,
 * formatted here, so nothing differs between server and browser). Numbers are bounds between two of our checks
 * (lib/stock/sellouts.ts), shown as ranges, never rounded up to a claim the checks cannot support; the method
 * sits folded under the module.
 */
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { MODELS, PART_INDEX, STORE_INDEX, appleName, modelByKey, modelKeyFor, storePath, storeTimeZone } from "@/lib/apple/catalog";
import { medianBand, type SelloutSummary, type Sellouts } from "@/lib/stock/sellouts";
import { t, pageLocale } from "@/lib/i18n/server";
import type { Dict } from "@/lib/i18n/dict";
import type { Lang } from "@/lib/i18n/locales";
import { num, pct as pctOf, unit, bidi } from "@/lib/i18n/format";
import { appleStoreLabel, configLabel } from "@/lib/i18n/places";
import { Measured, Stat, StatGrid } from "@/components/ui/Viz";
import type { AlertMark } from "@/lib/alertMarks";
import { returnStamp } from "./when";

type Words = Dict["modules"]["sellout"];

const pct = (x: number, lang: Lang) => pctOf(lang, Math.round(x * 100));
const pad = (n: number) => String(n).padStart(2, "0");
/** English, compact: "45s", "2m 05s", "3h 41m" (other languages: "45秒", "2 Min. 5 Sek."). */
function secs(s: number | null, lang: Lang): string {
  if (s == null) return "–";
  if (lang === "en") return s < 120 ? `${s}s` : s < 3600 ? `${Math.floor(s / 60)}m ${pad(s % 60)}s` : `${Math.floor(s / 3600)}h ${pad(Math.floor((s % 3600) / 60))}m`;
  return s < 120 ? unit(lang, s, "s") : `${unit(lang, Math.floor(s / 60), "m")} ${unit(lang, s % 60, "s")}`;
}
/** A return's life between two checks: "45–60s", "2m 05s – 2m 20s". */
function life(low: number, high: number, lang: Lang): string {
  if (high - low < 1) return secs(high, lang);
  if (high < 120) return lang === "en" ? `${low}–${high}s` : `${num(lang, low)}–${unit(lang, high, "s")}`;
  return `${secs(low, lang)} – ${secs(high, lang)}`;
}
/** The 20-second band around a median: "60–80 seconds" (English: sellouts.medianBand). */
function band(medianSec: number, lang: Lang): string {
  const b = medianBand(medianSec);
  const m = lang === "en" ? null : b.match(/^(\d+)–(\d+)/);
  return m ? `${num(lang, Number(m[1]))}–${unit(lang, Number(m[2]), "s")}` : b;
}
/** A big number and its unit: English "45" + "s" under two minutes; other languages the whole duration. */
function tile(sec: number | null, lang: Lang): { value: string; unit?: string } {
  if (lang !== "en" || sec == null || sec >= 120) return { value: secs(sec, lang) };
  return { value: String(sec), unit: "s" };
}
/** The bar's full width: a listing that lasted this long or longer fills it. */
const BAR_SEC = 180;

/** The one line an answer engine can quote; everything else is tiles. */
function headline(d: Sellouts, label: string, duo: SelloutSummary | undefined, w: Words, lang: Lang): string {
  if (duo && duo.n >= 3 && duo.medianSec != null) return w.typical(label, band(duo.medianSec, lang));
  const s = d.summary;
  if (s.n > 0 && s.medianSec != null) return w.half(label, secs(s.medianSec, lang));
  return w.none(label, s.days);
}

/** One iPhone in a line: the label sits before each value ("timed 57 · median 93s · ≤ 30 s: 7% …"). */
function ModelLine({ name, s, w, lang }: { name: string; s: SelloutSummary; w: Words; lang: Lang }) {
  const v = (x: string) => <b className="font-semibold tabular-nums text-ink">{x}</b>;
  return (
    <li className="leading-relaxed">
      <span className="font-medium text-ink">{name}</span>
      <span className="text-ink-3">{" — "}{w.thSoldOut} {v(lang === "en" ? String(s.n) : num(lang, s.n))}{" · "}{w.thHalf} {v(secs(s.medianSec, lang))}{" · "}{w.thWithin30} {v(pct(s.within30, lang))}{" · "}{w.thWithin60} {v(pct(s.within60, lang))}{" · "}{w.thFastest} {v(secs(s.fastestSec, lang))}</span>
    </li>
  );
}

/** The dashboard's chip on a restock row: alerted (bell), or why there was no alert (muted). */
function MarkChip({ mark, label }: { mark: AlertMark; label: string }) {
  const alerted = mark === "delivered" || mark === "sent";
  return (
    <span className={`ms-1.5 inline-flex items-center gap-1 whitespace-nowrap rounded-full px-1.5 py-px align-[1px] text-[11px] font-medium ${alerted ? "bg-accent/12 text-accent" : "bg-ink/6 text-ink-3"}`} data-mark={mark}>
      {alerted && <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" /></svg>}
      {label}
    </span>
  );
}

export function SellOutTimes({ data, label, showStore = false, limit = 10, marks, markLabels }: { data: Sellouts; label: string; showStore?: boolean; limit?: number; marks?: Record<number, AlertMark>; markLabels?: Record<AlertMark, string> }) {
  const w = t().modules.sellout;
  const lang = pageLocale().lang;
  const models = MODELS.filter((m) => data.byModel[m.key]?.n);
  const rows = data.recent.slice(0, limit);
  const estimated = rows.some((r) => r.highSec != null && !r.exact);
  const duo = data.byModel.duo;
  // The tiles follow the Duo once it has three timed sell-outs; before that, everything here.
  const s = duo && duo.n >= 3 && duo.medianSec != null ? duo : data.summary;
  const what = s === duo ? w.whatDuo : w.whatAll;
  const have = s.n > 0 && s.medianSec != null;
  const median = tile(s.medianSec, lang);
  const fastest = tile(s.fastestSec, lang);
  return (
    <div>
      <p className="text-sm font-medium text-ink">{headline(data, label, duo, w, lang)}</p>

      {have && (
        <StatGrid cols={4} className="mt-3">
          <Stat value={median.value} unit={median.unit} label={w.tileHalf(what)} tone="accent" />
          <Stat value={pct(s.within30, lang)} label={w.tileWithin30} tone="warn" />
          <Stat value={pct(s.within60, lang)} label={w.tileWithin60} />
          <Stat value={fastest.value} unit={fastest.unit} label={w.tileFastest(s.n, s.days)} tone="muted" />
        </StatGrid>
      )}

      {models.length > 1 && (
        <div className="mt-4">
          <p className="text-xs text-ink-3">{w.caption(data.summary.days)}</p>
          <ul className="mt-1.5 space-y-1 text-sm">{models.map((m) => <ModelLine key={m.key} name={m.name} s={data.byModel[m.key]!} w={w} lang={lang} />)}</ul>
        </div>
      )}

      {rows.length > 0 && (
        <>
          <div className="mt-5 flex items-baseline justify-between gap-3"><h3 className="text-sm font-semibold text-ink">{w.each}</h3><span className="text-[11px] text-ink-3">{w.barNote(lang === "en" ? `${BAR_SEC}s` : unit(lang, BAR_SEC, "s"))}</span></div>
          <ul className="mt-2 divide-y divide-line text-sm">
            {rows.map((r) => {
              const item = PART_INDEX.get(r.partNumber);
              const store = STORE_INDEX.get(r.storeNumber);
              if (!item || !store) return null;
              const model = modelByKey(modelKeyFor(item.model));
              // From the data cache `at` comes back as an ISO string (it is stored as JSON); stamp() takes either.
              const when = returnStamp(lang, r.at, storeTimeZone(store));
              const gone = r.highSec != null;
              const lived = gone ? r.highSec! : r.listedSec ?? 0;
              const fast = gone && r.highSec! <= 30;
              const width = `${Math.max(3, Math.min(100, (lived / BAR_SEC) * 100))}%`;
              const mark = marks?.[r.id];
              // Row order: store (where several), configuration, then the time it appeared; the duration closes the row.
              return (
                <li key={r.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 py-2 sm:grid-cols-[minmax(0,1fr)_7rem_auto]">
                  <span className={`min-w-0 ${mark ? "" : "truncate"}`}>
                    {showStore && <><Link href={storePath(store)} className="underline-offset-2 hover:underline">{lang === "en" ? appleName(store) : appleStoreLabel(store, lang)}</Link>{" · "}</>}
                    <span className={mark === "other" || mark === "before" ? "text-ink-3" : "text-ink"}>{bidi(model?.short ?? "", lang)} {configLabel(item, lang)}</span>{" · "}
                    <span className="tabular-nums text-ink-3">{when}</span>
                    {mark && markLabels && <MarkChip mark={mark} label={markLabels[mark]} />}
                  </span>
                  <span className="col-span-2 flex h-2 items-center sm:col-span-1" aria-hidden>
                    <span className={`h-1.5 rounded-full ${!gone ? "bg-accent/35" : fast ? "bg-warn" : "bg-ink/25"}`} style={{ width }} />
                  </span>
                  <span className={`col-start-2 row-start-1 shrink-0 text-end tabular-nums font-medium sm:col-start-3 ${!gone ? "text-accent" : fast ? "text-warn" : "text-ink"}`}>
                    {!gone ? w.stillListed(secs(r.listedSec, lang)) : r.exact ? life(r.lowSec!, r.highSec!, lang) : w.approx(life(r.lowSec!, r.highSec!, lang))}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <Measured title={w.measuredTitle}>
        {w.measured(estimated)}
      </Measured>
    </div>
  );
}
