/**
 * The iPhone Duo observation ledger: the block every place page opens with (region, city, store, country home,
 * store index and the Duo model pages). It exists because answer engines quote the page that already holds the
 * conclusion in its first lines — whether the phone is listed as of now, when it last was, the shape of the record
 * so far and how long the last few listings lasted — instead of the page that scatters those facts over three
 * sections and three models. Everything here is derived from reads the page already makes (live stock, the place's
 * restock-times record, its sell-out rows); the only new read is how many alerts ShelfSpring delivered.
 *
 * Pure except `alertsDelivered`; JSON-safe (ISO strings only).
 */
import { unstable_cache } from "next/cache";
import { and, eq, gt, inArray, sql } from "drizzle-orm";
import { db, hasDatabase, schema } from "../db";
import { PART_INDEX, modelKeyFor, storeTimeZone, type Store } from "../apple/catalog";
import type { StoreStockRow } from "../stock/queries";
import type { Sellouts } from "../stock/sellouts";
import { busiestWindow, dayRange, hourShare, type RestockTimes } from "./restockTimes";
import { localHourDay } from "./siteFacts";
import { doNotCacheReadFailure } from "../cache-read-failure";
import { recordError, errorMessage } from "../errors";

/** What the ledger needs of a store's live stock: the last observation and, per model, the listed configurations. */
export interface StockLike { lastCheckedAt: Date | null; perModel: Partial<Record<"duo" | "18-pro" | "18-pro-max", { available: number; parts: string[] }>> }

/** A country-wide stock map from the Duo rows a country page already reads (stockByStore). */
export function stockFromRows(rows: StoreStockRow[]): Map<string, StockLike> {
  const map = new Map<string, StockLike>();
  for (const r of rows) map.set(r.storeNumber, { lastCheckedAt: r.lastCheckedAt ?? null, perModel: { duo: { available: r.availableParts.length, parts: r.availableParts } } });
  return map;
}

/** Alerts ShelfSpring delivered for returns at these stores in the last `days` days: counts only, nobody named. */
export interface AlertsDelivered { days: number; sent: number; stores: number }

const deliveredCached = unstable_cache(
  async (stores: string[], days: number): Promise<AlertsDelivered> => {
    const n = schema.notifications;
    const rows = await db()
      .select({ sent: sql<number>`count(*)::int`, stores: sql<number>`count(distinct ${n.storeNumber})::int` })
      .from(n)
      .where(and(eq(n.status, "sent"), inArray(n.storeNumber, stores), gt(n.createdAt, new Date(Date.now() - days * 86400_000))));
    return { days, sent: rows[0]?.sent ?? 0, stores: rows[0]?.stores ?? 0 };
  },
  ["alerts-delivered-v1"],
  { revalidate: 300 },
);

export async function alertsDelivered(storeNumbers: string[], days = 7): Promise<AlertsDelivered | null> {
  if (!hasDatabase() || storeNumbers.length === 0) return null;
  try {
    return await deliveredCached([...storeNumbers].sort(), days);
  } catch (e) {
    await recordError("web", `alerts delivered ${storeNumbers.length} stores: ${errorMessage(e)}`).catch(() => undefined);
    doNotCacheReadFailure();
    return null;
  }
}

/** One recorded return with how long it stayed listed (bounded by two observations), or how long it has been listed so far. */
export interface LedgerReturn {
  at: string;
  storeNumber: string;
  partNumber: string;
  /** Seconds it was still listed (lower) and gone by (upper); null while still listed or unknown. */
  lowSec: number | null;
  highSec: number | null;
  /** Bounded by two recorded observations (true) or by the sweep interval (false). */
  exact: boolean;
  /** Still listed: seconds since it appeared. */
  listedSec: number | null;
}

export interface DuoLedger {
  /** When this was computed. */
  at: string;
  /** The newest observation of any of the place's stores; null when none has been observed. */
  observedAt: string | null;
  storesTotal: number;
  /** Stores listing an iPhone Duo for pickup at the last observation, most configurations first. */
  listed: { storeNumber: string; configs: number; parts: string[] }[];
  /** iPhone Duo configurations a store in this country can list (8). */
  configsTotal: number;
  /** The other two models: stores with any configuration (a place) or configurations listed (a store). */
  others: { pro: number; max: number };
  /** The latest confirmed return on record, with its lifetime where the sell-out rows know it. */
  last: LedgerReturn | null;
  /** The last three confirmed returns (newest first) the sell-out rows cover. */
  lastThree: LedgerReturn[];
  /** Confirmed returns since the record began in this country, and its first day. */
  n: number;
  since: string;
  /** Local days with at least one return, and days the record spans so far (first tracked day to today). */
  days: number;
  tracked: number;
  /** Stores with at least one return on record. */
  storesWithReturn: number;
  /** A usual hour may be stated (restockTimes.ts thresholds). */
  pattern: boolean;
  peakHour: number | null;
  peakCount: number;
  /** The busiest two local hours and their share of the record. */
  window: { from: number; to: number; share: number };
  /** Share of returns between 8 AM and noon local time (a morning habit, if any). */
  morningShare: number;
  /** Median seconds a return stayed listed; null under 10 completed intervals. */
  medianSec: number | null;
  /** Most returned configuration on record. */
  topPart: { partNumber: string; returns: number } | null;
  /** Returns today (each store's local date), so far. */
  today: number;
  alerts: AlertsDelivered | null;
  /** Distinct time zones of the place's stores (one → the sentences can name it). */
  zones: string[];
  /** The record could not be read: pattern numbers are placeholders. */
  unknown: boolean;
}

export interface DuoLedgerInput {
  stores: Store[];
  stock: Map<string, StockLike>;
  /** The other models' counts when `stock` carries only the Duo (country pages: stores with any configuration). */
  others?: { pro: number; max: number };
  times: RestockTimes;
  sell: Sellouts;
  alerts?: AlertsDelivered | null;
  now?: Date;
  /** iPhone Duo configurations per store in this country (catalogFor("duo", cc).length). */
  configsTotal: number;
}

const isDuo = (partNumber: string) => { const i = PART_INDEX.get(partNumber); return Boolean(i && modelKeyFor(i.model) === "duo"); };

/** Pure: the ledger's numbers from what the page already loaded. */
export function duoLedgerFrom(i: DuoLedgerInput): DuoLedger {
  const now = i.now ?? new Date();
  const numbers = new Set(i.stores.map((s) => s.storeNumber));
  let observedAt: string | null = null;
  const listed: DuoLedger["listed"] = [];
  let pro = 0, max = 0;
  for (const s of i.stores) {
    const sum = i.stock.get(s.storeNumber);
    if (!sum) continue;
    if (sum.lastCheckedAt && (!observedAt || sum.lastCheckedAt.toISOString() > observedAt)) observedAt = sum.lastCheckedAt.toISOString();
    const duo = sum.perModel.duo;
    if (duo && duo.available > 0) listed.push({ storeNumber: s.storeNumber, configs: duo.available, parts: duo.parts });
    const p = sum.perModel["18-pro"]?.available ?? 0, m = sum.perModel["18-pro-max"]?.available ?? 0;
    if (i.stores.length === 1) { pro = p; max = m; }
    else { if (p > 0) pro++; if (m > 0) max++; }
  }
  if (i.others) { pro = i.others.pro; max = i.others.max; }
  listed.sort((a, b) => b.configs - a.configs || a.storeNumber.localeCompare(b.storeNumber));

  // The sell-out rows (30 days, newest first) carry each return's lifetime; the latest return on record comes from
  // the restock-times read, which reaches back to the first tracked day.
  const lines: LedgerReturn[] = i.sell.recent
    .filter((r) => numbers.has(r.storeNumber) && isDuo(r.partNumber))
    .map((r) => ({ at: r.at.toISOString(), storeNumber: r.storeNumber, partNumber: r.partNumber, lowSec: r.lowSec, highSec: r.highSec, exact: r.exact, listedSec: r.listedSec }))
    .sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
  const lastThree = lines.slice(0, 3);
  const t = i.times;
  let last: LedgerReturn | null = lastThree[0] ?? null;
  if (t.latest && (!last || t.latest.at > last.at)) last = { at: t.latest.at, storeNumber: t.latest.storeNumber, partNumber: t.latest.partNumber, lowSec: null, highSec: null, exact: false, listedSec: null };

  const zones = [...new Set(i.stores.map((s) => storeTimeZone(s)))];
  const todayLocal = localHourDay(now.toISOString(), zones[0] ?? "UTC").date;
  const tracked = Math.max(1, dayRange(t.since, todayLocal).length);
  const window = busiestWindow(t.byHour);
  const peakHour = t.peakHour;
  return {
    at: now.toISOString(),
    observedAt,
    storesTotal: i.stores.length,
    listed,
    configsTotal: i.configsTotal,
    others: { pro, max },
    last,
    lastThree,
    n: t.n,
    since: t.since,
    days: t.days,
    tracked,
    storesWithReturn: Math.min(t.stores, i.stores.length),
    pattern: peakHour != null,
    peakHour,
    peakCount: peakHour != null ? t.byHour[peakHour] ?? 0 : 0,
    window,
    morningShare: hourShare(t.byHour, 8, 12),
    medianSec: t.sellout?.medianSec ?? i.sell.byModel.duo?.medianSec ?? null,
    topPart: t.byPart[0] ? { partNumber: t.byPart[0].partNumber, returns: t.byPart[0].restocks } : null,
    today: t.today?.restocks ?? 0,
    alerts: i.alerts ?? null,
    zones,
    unknown: Boolean(t.unknown),
  };
}
