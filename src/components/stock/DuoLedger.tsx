/**
 * The iPhone Duo observation ledger a place page opens with (lib/content/duoLedger.ts says why). Reading order: the
 * dated verdict in one line → the last confirmed return → four measures of the record (breadth and pace, not a fixed
 * hour band) → one quotable field note → the last three returns as ledger rows → what ShelfSpring delivered. Server
 * component: every number comes from `DuoLedger`, every string from the dictionary, so the native versions read the
 * same facts in their own words. Emits WebPage.dateModified and a Dataset for answer engines.
 */
import type { ReactNode } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { PART_INDEX, storeByNumber, storePath, storeTimeZone, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type CountryCode } from "@/lib/apple/countries";
import type { DuoLedger as Ledger, LedgerReturn } from "@/lib/content/duoLedger";
import { PATTERN_MIN, PATTERN_MIN_DAYS } from "@/lib/content/siteFacts";
import { num, stamp } from "@/lib/i18n/format";
import type { Lang } from "@/lib/i18n/locales";
import { appleStoreLabel, configLabel } from "@/lib/i18n/places";
import { pageLocale, t } from "@/lib/i18n/server";
import { ORG_ID } from "@/lib/seo/siteLd";

export interface DuoLedgerProps {
  d: Ledger;
  /** The bare place or store name in the page's language: "Michigan", "Tokyo", "Apple Somerset". */
  place: string;
  /** One store (a store page): sentences count configurations, not stores. */
  one?: boolean;
  stores: Store[];
  country?: CountryCode;
  /** The place's hour-by-hour record, when it has a page. */
  hourHref?: string | null;
  /** Where "Watch a configuration" goes. */
  watchHref?: string;
  id?: string;
}

/* ---------------------------------------------------------------- formats */

function stampIn(iso: string, tz: string, lang: Lang): string {
  if (lang !== "en") return stamp(lang, iso, tz, true);
  return new Intl.DateTimeFormat("en-US", { timeZone: tz, month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(new Date(iso));
}
function dateIn(ymd: string, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === "en" ? "en-US" : lang, { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${ymd}T12:00:00Z`));
}
const N = (n: number, lang: Lang) => (lang === "en" ? n.toLocaleString("en-US") : num(lang, n));
const pct = (x: number) => `${Math.round(x * 100)}%`;

type Words = ReturnType<typeof t>["modules"]["duoLedger"];

/** "45 s", "2 min", "1 h 10 min" through the dictionary's units. */
function dur(sec: number, w: Words): string {
  if (sec < 100) return w.secs(Math.max(1, Math.round(sec)));
  if (sec < 5400) return w.mins(Math.round(sec / 60));
  const h = Math.floor(sec / 3600), m = Math.round((sec % 3600) / 60);
  return m ? `${h} h ${w.mins(m)}` : `${h} h`;
}
/** The median as a sentence says it: "roughly 95 seconds" in English; other languages use their units. */
function roughly(sec: number, lang: Lang, w: Words): string {
  if (lang !== "en") return dur(sec, w);
  if (sec < 100) return `roughly ${Math.max(5, Math.round(sec / 5) * 5)} seconds`;
  if (sec < 3600) return `roughly ${Math.round(sec / 60)} minutes`;
  return `roughly ${(sec / 3600).toFixed(1)} hours`;
}
function lifetime(r: LedgerReturn, w: Words): string | null {
  if (r.listedSec != null) return w.stillListed(dur(r.listedSec, w));
  if (r.highSec == null) return null;
  const low = r.lowSec ?? 0;
  const a = dur(low, w), b = dur(r.highSec, w);
  return a === b || low === 0 ? w.listedAbout(b) : w.listedRange(a, b);
}
/** Plain text of a verdict node, for the Dataset description. */
function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (typeof node === "object" && "props" in node) return textOf((node as { props: { children?: ReactNode } }).props.children);
  return "";
}

/* ---------------------------------------------------------------- component */

export function DuoLedger({ d, place, one = false, stores, country = "us", hourHref, watchHref, id = "duo-ledger" }: DuoLedgerProps) {
  const lang = pageLocale().lang;
  const w = t().modules.duoLedger;
  const F = t().views.restockTimes.fmt;
  const note = t().pages.common.checkNote;
  const byNumber = new Map(stores.map((s) => [s.storeNumber, s]));
  const storeOf = (n: string) => byNumber.get(n) ?? storeByNumber(n);
  const storeLink = (n: string): ReactNode => { const s = storeOf(n); return s ? <Link href={storePath(s)} className="font-medium text-ink underline-offset-4 hover:underline">{appleStoreLabel(s, lang)}</Link> : n; };
  const cfg = (p: string) => { const i = PART_INDEX.get(p); return i ? configLabel(i, lang) : p; };
  // One zone: every stamp in it; a country across zones: its reference zone (store-level times keep the store's own).
  const tz = d.zones.length === 1 ? d.zones[0] : COUNTRIES[country].timeZone;
  const observed = stampIn(d.observedAt ?? d.at, tz, lang);
  const since = dateIn(d.since, lang);

  /* The verdict */
  let head: ReactNode;
  if (d.listed.length === 0) head = one ? w.headNoneOne(place) : w.headNone({ n: d.storesTotal, place });
  else if (one) head = w.headSomeOne({ k: d.listed[0].configs, total: d.configsTotal, place, list: d.listed[0].parts.slice(0, 8).map(cfg).join(", ") });
  else {
    const shown = d.listed.slice(0, 5);
    const list = <>{shown.map((x, i) => <span key={x.storeNumber}>{i ? "; " : ""}{w.storeItem(storeLink(x.storeNumber), x.configs)}</span>)}{d.listed.length > shown.length ? ` +${N(d.listed.length - shown.length, lang)}` : ""}</>;
    head = w.headSome({ k: d.listed.length, n: d.storesTotal, place, list });
  }
  const last = d.last;
  const lastStore = last ? storeOf(last.storeNumber) : undefined;
  const lastLine = last
    ? w.lastReturn({ config: cfg(last.partNumber), store: one ? null : storeLink(last.storeNumber), when: stampIn(last.at, lastStore ? storeTimeZone(lastStore) : tz, lang), lasted: lifetime(last, w) })
    : d.unknown ? null : w.noReturnYet(place, since);
  const others = w.others({ pro: d.others.pro, max: d.others.max, one, configs: 16 });

  /* The measures */
  const zone = w.zone(d.zones.length === 1 ? d.zones[0] : null);
  const range = F.range(d.window.from, d.window.to);
  const busiest = d.peakHour != null ? F.range(d.peakHour, d.peakHour + 1) : null;
  const perDay = d.tracked > 0 ? Math.round((d.n / d.tracked) * 10) / 10 : 0;
  const metrics: { value: ReactNode; label: string }[] = [{ value: d.unknown ? "—" : N(d.n, lang), label: w.mReturns(since) }];
  metrics.push(one ? { value: d.unknown ? "—" : <>{N(d.days, lang)}<span className="text-base text-ink-3"> / {N(d.tracked, lang)}</span></>, label: w.mDays } : { value: d.unknown ? "—" : <>{N(d.storesWithReturn, lang)}<span className="text-base text-ink-3"> / {N(d.storesTotal, lang)}</span></>, label: w.mStores });
  if (d.pattern && busiest && !d.unknown) metrics.push({ value: <span className="text-xl sm:text-2xl">{range}</span>, label: w.mWindow(pct(d.window.share)) });
  else metrics.push({ value: d.unknown ? "—" : N(perDay, lang), label: w.mPerDay });
  if (d.medianSec != null && !d.unknown) metrics.push({ value: <>{d.medianSec < 100 ? N(Math.round(d.medianSec), lang) : N(Math.round(d.medianSec / 60), lang)}<span className="text-base text-ink-3"> {d.medianSec < 100 ? w.secUnit : w.minUnit}</span></>, label: w.mMedian });
  else metrics.push({ value: d.unknown ? "—" : N(d.today, lang), label: w.mToday });

  /* The field note */
  const median = d.medianSec != null ? roughly(d.medianSec, lang, w) : null;
  const fieldNote = d.unknown
    ? w.unknown
    : d.n === 0
      ? null
      : d.pattern && busiest
        ? w.note({ n: d.n, stores: d.storesTotal, k: d.storesWithReturn, place, since, range, zone, pct: pct(d.window.share), morning: pct(d.morningShare), busiest, busiestN: d.peakCount, median, config: d.topPart ? cfg(d.topPart.partNumber) : null, top: d.topPart?.returns ?? 0, one, days: d.days, tracked: d.tracked })
        : w.noteFew({ n: d.n, place, since, one, stores: d.storesTotal, days: d.days, min: PATTERN_MIN, minDays: PATTERN_MIN_DAYS, median });

  const ld = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    dateModified: d.observedAt ?? d.at,
    mainEntity: {
      "@type": "Dataset",
      name: w.kicker(place),
      description: `${textOf(head)} ${fieldNote ?? textOf(lastLine)}`.trim(),
      temporalCoverage: `${d.since}/${d.at.slice(0, 10)}`,
      publisher: { "@id": ORG_ID },
      isAccessibleForFree: true,
      variableMeasured: ["pickup listing status per store at the last observation", "confirmed returns since the record began", "seconds a return stayed listed"],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <section id={id} className="pane duo-ledger p-5 sm:p-7" aria-label={w.kicker(place)} data-block="duo-ledger">
        <p className="field-kicker">{w.kicker(place)}</p>
        <p className="display mt-4 max-w-4xl text-2xl text-ink sm:text-3xl">{head}</p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-2"><time dateTime={d.observedAt ?? d.at}>{w.observed(observed)}</time>{lastLine ? <> {lastLine}</> : null} {others}</p>
        <dl className="field-metrics duo-ledger-metrics mt-6">
          {metrics.map((m, i) => <div key={i} className="field-metric"><dt className="field-label">{m.label}</dt><dd className="field-value">{m.value}</dd></div>)}
        </dl>
        {fieldNote && (
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-ink-2">
            {fieldNote}
            {hourHref && <> <Link href={hourHref} className="font-medium text-ink underline-offset-4 hover:underline">{w.hourByHour}</Link></>}
          </p>
        )}
        {d.lastThree.length > 0 && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse text-sm" style={{ minWidth: one ? "20rem" : "30rem" }}>
              <caption className="mb-2 text-start text-xs text-ink-3">{w.ledger(d.lastThree.length)}</caption>
              <thead><tr>
                <th scope="col" className="border-b border-line-2 py-2 pe-3 text-start font-semibold text-ink">{w.col.config}</th>
                {!one && <th scope="col" className="border-b border-line-2 py-2 pe-3 text-start font-semibold text-ink">{w.col.store}</th>}
                <th scope="col" className="border-b border-line-2 py-2 pe-3 text-start font-semibold text-ink">{w.col.observed}</th>
                <th scope="col" className="border-b border-line-2 py-2 pe-3 text-start font-semibold text-ink">{w.col.listed}</th>
              </tr></thead>
              <tbody>
                {d.lastThree.map((r) => {
                  const s = storeOf(r.storeNumber);
                  return (
                    <tr key={`${r.storeNumber}-${r.partNumber}-${r.at}`} className="border-b border-line">
                      <td className="py-2 pe-3 align-top">{cfg(r.partNumber)}</td>
                      {!one && <td className="py-2 pe-3 align-top">{s ? storeLink(r.storeNumber) : r.storeNumber}</td>}
                      <td className="py-2 pe-3 align-top font-mono tabular-nums"><time dateTime={r.at}>{stampIn(r.at, s ? storeTimeZone(s) : tz, lang)}</time></td>
                      <td className="py-2 pe-3 align-top tabular-nums text-ink-2">{lifetime(r, w) ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-5 border-t border-line pt-3 text-xs leading-relaxed text-ink-3">
          {d.alerts && d.alerts.sent > 0 ? <>{w.delivered({ sent: d.alerts.sent, stores: d.alerts.stores, total: d.storesTotal, days: d.alerts.days, place, one })} </> : null}
          {w.method({ since, note })}
          {watchHref && <> <Link href={watchHref} className="font-medium text-ink underline-offset-4 hover:underline">{one ? w.watchOne : w.watch(place)}</Link></>}
        </p>
      </section>
    </>
  );
}
