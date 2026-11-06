"use client";
/**
 * Browser side of Web Push. Everything that touches navigator/window lives here so the UI
 * components stay small and the pure helpers (platform.ts, payload.ts, policy.ts) stay testable.
 *
 * Lifecycle the helpers cover:
 *  - subscribePush: reuses a healthy subscription, replaces one made with a rotated VAPID key or
 *    about to expire (unsubscribe → subscribe), so a dead subscription never lingers.
 *  - repairSubscription: permission is granted but the browser lost the subscription (storage
 *    cleared, app re-added): subscribe again without a gesture.
 *  - reconcileSubscription: tells the server about this endpoint when it is unknown, disabled
 *    (410 earlier) or last reported more than a day ago.
 */
import { urlBase64ToBytes } from "./payload";
import { platformFromUA, isInAppBrowser, type Platform } from "./platform";
import { bytesToUrlBase64, RESYNC_AFTER_MS, resyncDecision, subscriptionNeedsRenewal, type ServerDevice } from "./policy";

export const SW_URL = "/sw.js";
const SYNC_KEY = "pc:push:sync"; // JSON { endpoint, at }
const OPT_OUT_KEY = "pc:push:off";
const PREFERENCE_CACHE = "shelfspring-push-preferences";
const PREFERENCE_PATH = "/__pc_push_preference__";
export const PUSH_PREFERENCE_CHANGED = "pc:push:preference";
export const PUSH_DISABLED = "Push explicitly disabled on this browser";
export const PUSH_DISABLE_FAILED = "Push disable could not be fully saved";
let memoryOptOut: boolean | null = null;
let memoryOnlyPreference = false;

/** A device-local choice, separate from the OS permission and the disposable sync receipt. */
export function pushOptedOut(): boolean {
  if (memoryOnlyPreference) return memoryOptOut ?? true;
  try { return localStorage.getItem(OPT_OUT_KEY) === "1"; }
  catch { return memoryOptOut ?? true; }
}

async function pushDeliveryDisabled(): Promise<boolean> {
  if (pushOptedOut()) return true;
  try {
    const cache = await caches.open(PREFERENCE_CACHE);
    const record = await cache.match(new URL(PREFERENCE_PATH, window.location.origin).href);
    return record ? Boolean((await record.json()).disabled) : false;
  } catch { return true; }
}

/** Only explicit Turn on/off actions change this preference. The SW needs its own persistent view. */
export async function setPushOptedOut(disabled: boolean): Promise<void> {
  memoryOptOut = disabled;
  try {
    if (disabled) localStorage.setItem(OPT_OUT_KEY, "1");
    else localStorage.removeItem(OPT_OUT_KEY);
    memoryOnlyPreference = false;
  } catch { memoryOnlyPreference = true; }
  const cache = await caches.open(PREFERENCE_CACHE);
  await cache.put(new URL(PREFERENCE_PATH, window.location.origin).href, Response.json({ disabled }));
  window.dispatchEvent(new Event(PUSH_PREFERENCE_CHANGED));
}

async function discardDisabledSubscription(sub: PushSubscription): Promise<void> {
  // A POST already in flight can complete after Turn off's DELETE. Delete only this endpoint again.
  await Promise.all([sub.unsubscribe(), forgetSubscription(sub.endpoint)]);
  clearSyncRecord();
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia?.("(display-mode: standalone)").matches || window.matchMedia?.("(display-mode: fullscreen)").matches || nav.standalone === true;
}

export function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "unknown";
  return platformFromUA(navigator.userAgent, { maxTouchPoints: navigator.maxTouchPoints });
}

export function inAppBrowser(): boolean {
  return typeof navigator !== "undefined" && isInAppBrowser(navigator.userAgent);
}

/** The APIs exist (Safari exposes them only inside an installed Home Screen app). */
export function pushSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export function permissionState(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

/**
 * Asks for permission. Call it synchronously inside the tap handler: iOS only shows the prompt
 * from a user gesture, and an `await` before the call ends the gesture. Old Safari builds take a
 * callback instead of returning a promise; both shapes resolve here.
 */
export function requestPermission(): Promise<NotificationPermission> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("Notification" in window)) return resolve("denied");
    try {
      const r = Notification.requestPermission((p) => resolve(p));
      if (r && typeof (r as Promise<NotificationPermission>).then === "function") (r as Promise<NotificationPermission>).then(resolve, () => resolve(Notification.permission));
    } catch {
      resolve(Notification.permission);
    }
  });
}

export async function registerSw(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    await navigator.serviceWorker.register(SW_URL, { scope: "/", updateViaCache: "none" });
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}

export async function currentSubscription(strict = false): Promise<PushSubscription | null> {
  if (!pushSupported()) return null;
  const reg = await registerSw();
  if (!reg) { if (strict) throw new Error(PUSH_DISABLE_FAILED); return null; }
  try {
    return await reg.pushManager.getSubscription();
  } catch {
    if (strict) throw new Error(PUSH_DISABLE_FAILED);
    return null;
  }
}

let vapidKeyCache: string | null = null;

/** The server's VAPID public key, for pages that were not handed it as a prop (cached per page load, 1 h on the wire). */
export async function fetchVapidKey(): Promise<string | null> {
  if (vapidKeyCache) return vapidKeyCache;
  try {
    const res = await fetch("/api/push/vapid");
    if (!res.ok) return null;
    const j = (await res.json()) as { publicKey?: string };
    vapidKeyCache = j.publicKey ?? null;
    return vapidKeyCache;
  } catch {
    return null;
  }
}

function needsRenewal(sub: PushSubscription, vapidPublicKey: string): boolean {
  const opts = sub.options as PushSubscriptionOptions | undefined;
  return subscriptionNeedsRenewal({ expirationTime: sub.expirationTime, applicationServerKey: opts?.applicationServerKey ?? null }, vapidPublicKey) !== null;
}

/**
 * Returns a subscription made with the current VAPID key that is not about to expire. Prompts for
 * permission only when it is still "default" (must then run inside a user gesture).
 */
/** Endpoint of the subscription subscribePush just replaced; consumed by the next syncSubscription. */
let replacedEndpoint: string | null = null;

/** The message subscribePush throws without a service worker (usePush shows it in the reader's language). */
export const SW_UNAVAILABLE = "Service worker unavailable";

export async function subscribePush(vapidPublicKey: string, opts: { fresh?: boolean } = {}): Promise<PushSubscription> {
  if (await pushDeliveryDisabled()) throw new Error(PUSH_DISABLED);
  const reg = await registerSw();
  if (!reg) throw new Error(SW_UNAVAILABLE);
  const existing = await reg.pushManager.getSubscription();
  if (await pushDeliveryDisabled()) throw new Error(PUSH_DISABLED);
  if (existing) {
    if (!opts.fresh && !needsRenewal(existing, vapidPublicKey)) return existing;
    replacedEndpoint = existing.endpoint; // syncSubscription hands it to the server so the row is rewritten, not duplicated
    try {
      await existing.unsubscribe();
    } catch {
      /* the push service may already have dropped it */
    }
  }
  // Uint8Array is a BufferSource; the copy keeps TypeScript's ArrayBufferLike variance happy.
  const key = urlBase64ToBytes(vapidPublicKey);
  const applicationServerKey = new Uint8Array(key).buffer as ArrayBuffer;
  if (await pushDeliveryDisabled()) throw new Error(PUSH_DISABLED);
  const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
  if (await pushDeliveryDisabled()) { await discardDisabledSubscription(sub); throw new Error(PUSH_DISABLED); }
  return sub;
}

/**
 * Permission is granted but there may be no subscription (the browser cleared it, the app was
 * re-added to the Home Screen): subscribe silently, no gesture required. Null when nothing to do.
 */
export async function repairSubscription(vapidPublicKey?: string | null): Promise<PushSubscription | null> {
  if (!pushSupported() || permissionState() !== "granted" || await pushDeliveryDisabled()) return null;
  const key = vapidPublicKey || (await fetchVapidKey());
  if (!key) return null;
  try {
    return await subscribePush(key);
  } catch {
    return null;
  }
}

export async function unsubscribePush(): Promise<string | null> {
  // Latch before any await, including a slow service-worker/subscription lookup.
  const saved = setPushOptedOut(true).then(() => null, () => new Error(PUSH_DISABLE_FAILED));
  const sub = await currentSubscription(true);
  const results = sub ? await Promise.allSettled([sub.unsubscribe(), forgetSubscription(sub.endpoint)]) : [];
  clearSyncRecord();
  if (await saved || results.some((r) => r.status === "rejected")) throw new Error(PUSH_DISABLE_FAILED);
  return sub?.endpoint ?? null;
}

export interface DeviceInfo {
  platform: Platform;
  standalone: boolean;
  userAgent: string;
}

export function deviceInfo(): DeviceInfo {
  return { platform: detectPlatform(), standalone: isStandalone(), userAgent: typeof navigator === "undefined" ? "" : navigator.userAgent.slice(0, 300) };
}

function syncRecord(): { endpoint: string; at: number } | null {
  try {
    const raw = localStorage.getItem(SYNC_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw) as { endpoint?: string; at?: number };
    return j.endpoint && typeof j.at === "number" ? { endpoint: j.endpoint, at: j.at } : null;
  } catch {
    return null;
  }
}
function writeSyncRecord(endpoint: string) {
  try { localStorage.setItem(SYNC_KEY, JSON.stringify({ endpoint, at: Date.now() })); } catch { /* private mode */ }
}
export function clearSyncRecord() {
  try { localStorage.removeItem(SYNC_KEY); } catch { /* ignore */ }
}

export interface SyncResult {
  ok: boolean;
  status: number;
  id?: string;
  /** "owned": the endpoint belongs to another account (409). */
  code?: string;
}

/** Stores the subscription for the signed-in user. 401 = sign in first, 409 = another account's device. */
export async function syncSubscription(sub: PushSubscription, extra: { oldEndpoint?: string } = {}): Promise<SyncResult> {
  if (await pushDeliveryDisabled()) return { ok: false, status: 409, code: "disabled" };
  const json = sub.toJSON();
  const opts = sub.options as PushSubscriptionOptions | undefined;
  const body = {
    endpoint: json.endpoint, keys: json.keys, ...deviceInfo(),
    expirationTime: typeof sub.expirationTime === "number" ? Math.round(sub.expirationTime) : null,
    appServerKey: bytesToUrlBase64(opts?.applicationServerKey ?? null) ?? undefined,
    oldEndpoint: extra.oldEndpoint ?? (replacedEndpoint && replacedEndpoint !== sub.endpoint ? replacedEndpoint : undefined),
  };
  replacedEndpoint = null; // consumed: a later sync must not rewrite an unrelated row
  let res: Response;
  try {
    res = await fetch("/api/push/subscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  } catch {
    if (await pushDeliveryDisabled()) {
      await discardDisabledSubscription(sub);
      return { ok: false, status: 409, code: "disabled" };
    }
    return { ok: false, status: 0 };
  }
  const j = (await res.json().catch(() => ({}))) as { id?: string; code?: string };
  if (await pushDeliveryDisabled()) {
    await discardDisabledSubscription(sub);
    return { ok: false, status: 409, code: "disabled" };
  }
  if (res.ok && json.endpoint) writeSyncRecord(json.endpoint);
  return { ok: res.ok, status: res.status, id: j.id, code: j.code };
}

/** The signed-in user's devices as the server knows them (401 → devices null). */
export async function fetchDevices(): Promise<{ status: number; devices: ServerDevice[] | null }> {
  try {
    const res = await fetch("/api/push/subscribe", { cache: "no-store" });
    if (!res.ok) return { status: res.status, devices: null };
    const j = (await res.json()) as { devices?: ServerDevice[] };
    return { status: res.status, devices: j.devices ?? [] };
  } catch {
    return { status: 0, devices: null };
  }
}

export type ReconcileOutcome = "fresh" | "synced" | "needs-signin" | "conflict" | "disabled" | "error";

/**
 * Makes sure the server has this device. With `probe`, asks the server first and re-POSTs when the
 * endpoint is unknown or disabled (a 410 earlier, "Remove" on another device); without it, only the
 * 24 h gate decides, which is enough for a background touch on every page load.
 */
export async function reconcileSubscription(sub: PushSubscription, opts: { probe?: boolean; force?: boolean } = {}): Promise<ReconcileOutcome> {
  if (await pushDeliveryDisabled()) return "disabled";
  const rec = syncRecord();
  const lastAt = rec && rec.endpoint === sub.endpoint ? rec.at : null;
  let due: boolean = Boolean(opts.force) || lastAt == null || Date.now() - lastAt > RESYNC_AFTER_MS;
  if (opts.probe) {
    const { status, devices } = await fetchDevices();
    if (await pushDeliveryDisabled()) return "disabled";
    if (status === 401) return "needs-signin";
    if (devices) due = due || resyncDecision(sub.endpoint, devices, lastAt) !== "fresh";
  }
  if (!due) return "fresh";
  const r = await syncSubscription(sub);
  if (r.code === "disabled") return "disabled";
  if (r.status === 401) return "needs-signin";
  if (r.status === 409) return "conflict";
  return r.ok ? "synced" : "error";
}

/**
 * The endpoint is linked to another account (shared phone): drop it, mint a fresh one and store
 * that for the current user. Needs granted permission, no gesture.
 */
export async function resolveConflict(vapidPublicKey?: string | null): Promise<{ sub: PushSubscription; result: SyncResult } | null> {
  if (await pushDeliveryDisabled()) return null;
  const key = vapidPublicKey || (await fetchVapidKey());
  if (!key) return null;
  const sub = await subscribePush(key, { fresh: true });
  const result = await syncSubscription(sub);
  return { sub, result };
}

export async function forgetSubscription(endpoint: string): Promise<void> {
  const response = await fetch("/api/push/subscribe", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ endpoint }) });
  const body = await response.json().catch(() => null) as { ok?: boolean } | null;
  if (!response.ok || body?.ok !== true) throw new Error(PUSH_DISABLE_FAILED);
}

/** Android/desktop Chrome hands us the install prompt; PwaBoot parks it here. */
export interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
declare global {
  interface Window {
    __pcInstallPrompt?: InstallPromptEvent | null;
  }
}
export function installPrompt(): InstallPromptEvent | null {
  return typeof window === "undefined" ? null : (window.__pcInstallPrompt ?? null);
}
