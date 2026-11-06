/**
 * ShelfSpring mail worker (shelfspring-mail).
 *
 *  email()     Cloudflare Email Routing hands over mail for owner@example.com (+tags). It is
 *              parsed and POSTed to APP_URL/api/inbox/ingest (bearer INBOX_INGEST_SECRET) with the
 *              receiving server's SPF/DKIM/DMARC verdicts and raw header evidence.
 *  fetch()     POST /notify (bearer NOTIFY_TOKEN) emails the owner through the send_email binding.
 *              GET /health → 200.
 *  scheduled() GET APP_URL/api/health; on failure email the owner (at most every 2 hours
 *              while down) and once on recovery. Also reachable as POST /probe (bearer NOTIFY_TOKEN)
 *              because the account has no free cron trigger left — the new Linode host calls it.
 *  POST /backup/0..6 accepts one bounded database dump with an independent backup token.
 */
import PostalMime from "postal-mime";
import { EmailMessage } from "cloudflare:email";

export interface Env {
  APP_URL: string;
  OWNER_EMAIL: string;
  INBOX_INGEST_SECRET: string;
  NOTIFY_TOKEN: string;
  BACKUP_TOKEN: string;
  BACKUPS: R2Bucket;
  DEPLOY_COMMIT?: string;
  OWNER_MAIL: { send(message: EmailMessage): Promise<void> };
}

const FROM = "alerts@shelfspring.com";
const FROM_DISPLAY = "ShelfSpring Ops";
const MAX_BODY = 200_000;
const REMIND_MS = 2 * 60 * 60 * 1000;
const OWNER = "owner@example.com";
const MAX_HEADERS = 128 * 1024;
export const MAX_BACKUP_BYTES = 96 * 1024 * 1024;
const STATE_URL = "https://shelfspring-mail.internal/health-state";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
function bearerOk(req: Request, secret: string | undefined) {
  if (!secret) return false;
  const h = req.headers.get("authorization") ?? "";
  const t = h.startsWith("Bearer ") ? h.slice(7).trim() : "";
  if (t.length !== secret.length) return false;
  let d = 0;
  for (let i = 0; i < t.length; i++) d |= t.charCodeAt(i) ^ secret.charCodeAt(i);
  return d === 0;
}
function b64(s: string) { const b = new TextEncoder().encode(s); let x = ""; for (const c of b) x += String.fromCharCode(c); return btoa(x); }
function wrap76(s: string) { const o: string[] = []; for (let i = 0; i < s.length; i += 76) o.push(s.slice(i, i + 76)); return o.join("\r\n"); }
function hw(s: string) { return /^[\x20-\x7e]*$/.test(s) ? s : `=?utf-8?B?${b64(s)}?=`; }
function mime(to: string, subject: string, text: string, replyTo?: string) {
  const h = [
    `From: ${FROM_DISPLAY} <${FROM}>`, `To: <${to}>`,
    ...(replyTo && /^[^\s<>@]+@[^\s<>@]+$/.test(replyTo) ? [`Reply-To: <${replyTo}>`] : []),
    `Subject: ${hw(subject.replace(/[\r\n]+/g, " ").slice(0, 900))}`, `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@shelfspring.com>`, "MIME-Version: 1.0", "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: base64", "Auto-Submitted: auto-generated",
  ];
  return `${h.join("\r\n")}\r\n\r\n${wrap76(b64(text))}\r\n`;
}
async function sendOwner(env: Env, subject: string, text: string, replyTo?: string) {
  if (env.OWNER_EMAIL !== OWNER) throw new Error("Owner recipient is not configured");
  await env.OWNER_MAIL.send(new EmailMessage(FROM, OWNER, mime(OWNER, subject, text, replyTo)));
}
/** HELO and MAIL FROM can have different SPF results in the same Authentication-Results header. */
function authClauses(auth: string) {
  const clauses: string[] = [];
  let current = "", commentDepth = 0, quoted = false, escaped = false;
  for (const ch of auth) {
    if (escaped) { if (!commentDepth) current += ch; escaped = false; continue; }
    if (ch === "\\") { escaped = true; if (!commentDepth) current += ch; continue; }
    if (commentDepth) { if (ch === "(") commentDepth++; else if (ch === ")") commentDepth--; continue; }
    if (ch === '"') { quoted = !quoted; current += ch; continue; }
    if (!quoted && ch === "(") { commentDepth++; current += " "; continue; }
    if (!quoted && ch === ";") { clauses.push(current); current = ""; continue; }
    current += ch;
  }
  clauses.push(current);
  return clauses;
}
function identityDomain(identity: string) {
  const candidate = identity.trim().replace(/^<|>$/g, "").toLowerCase();
  const domain = candidate.slice(candidate.lastIndexOf("@") + 1).replace(/\.$/, "");
  return /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test(domain) ? domain : undefined;
}
function verdict(auth: string, mechanism: "spf" | "dkim" | "dmarc", envelopeFrom: string) {
  const matches = authClauses(auth).flatMap((clause) => {
    const match = new RegExp(`^\\s*${mechanism}(?:/\\d+)?\\s*=\\s*([a-z]+)\\b(.*)$`, "i").exec(clause.replace(/[\r\n]/g, " "));
    return match ? [{ result: match[1].toLowerCase(), properties: match[2] }] : [];
  });
  if (mechanism !== "spf") return matches[0]?.result;
  const envelopes = matches.flatMap((match) => {
    const identity = /(?:^|\s)smtp\.mailfrom\s*=\s*(?:"([^"]*)"|([^\s;]+))/i.exec(match.properties);
    return identity ? [{ ...match, domain: identityDomain(identity[1] ?? identity[2]) }] : [];
  });
  if (envelopes.length) {
    const domain = identityDomain(envelopeFrom);
    // Exact equality: an unrelated domain or a HELO pass cannot become sender SPF pass.
    return domain ? envelopes.find((match) => match.domain === domain)?.result : undefined;
  }
  // Legacy headers may carry an unqualified result; a HELO-only verdict is not sender SPF.
  return matches.find((match) => !/(?:^|\s)smtp\.helo\s*=/i.test(match.properties))?.result;
}

export interface IncomingEmail { readonly from: string; readonly to: string; readonly headers: Headers; readonly raw: ReadableStream<Uint8Array>; readonly rawSize: number }

async function rawHeaderEvidence(raw: ReadableStream<Uint8Array>) {
  const reader = raw.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let bytes = 0;
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) return { text, truncated: false };
      const remaining = MAX_HEADERS - bytes;
      text += decoder.decode(chunk.value.subarray(0, remaining), { stream: true });
      bytes += Math.min(chunk.value.byteLength, remaining);
      const boundary = /\r?\n\r?\n/.exec(text);
      if (boundary) return { text: text.slice(0, boundary.index), truncated: false };
      if (bytes >= MAX_HEADERS) return { text, truncated: true };
    }
  } finally { await reader.cancel(); }
}

async function ingest(message: IncomingEmail, env: Env) {
  if (!env.INBOX_INGEST_SECRET) throw new Error("Inbox authentication is not configured");
  const [parseStream, evidenceStream] = message.raw.tee();
  const [parsed, evidence] = await Promise.all([PostalMime.parse(parseStream), rawHeaderEvidence(evidenceStream)]);
  const auth = message.headers.get("authentication-results") ?? "";
  const headers: Record<string, string> = {};
  let headerBytes = 0;
  for (const [key, value] of message.headers) {
    if (headerBytes >= MAX_HEADERS) break;
    headers[key] = value.slice(0, Math.min(32_000, MAX_HEADERS - headerBytes));
    headerBytes += headers[key].length;
  }
  headers["x-shelfspring-raw-headers"] = evidence.text;
  headers["x-shelfspring-raw-headers-truncated"] = String(evidence.truncated);
  headers["x-shelfspring-message-bytes"] = String(message.rawSize);
  const body = {
    to: message.to, from: message.from, subject: parsed.subject ?? "", text: (parsed.text ?? "").slice(0, MAX_BODY), html: (parsed.html ?? "").slice(0, MAX_BODY), headers,
    auth: { spf: verdict(auth, "spf", message.from), dkim: verdict(auth, "dkim", message.from), dmarc: verdict(auth, "dmarc", message.from) },
  };
  const res = await fetch(`${env.APP_URL}/api/inbox/ingest`, { method: "POST", headers: { authorization: `Bearer ${env.INBOX_INGEST_SECRET}`, "content-type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(25_000) });
  if (!res.ok) throw new Error(`Inbox ingest failed with HTTP ${res.status}`);
}

const worker = {
  async email(message: IncomingEmail, env: Env) {
    try {
      if (/^test(?:\+[^@]*)?@shelfspring\.com$/i.test(message.to)) await ingest(message, env);
      else console.warn("Ignored an address outside the test inbox route");
    } catch { console.error("Test inbox ingestion failed"); throw new Error("Test inbox ingestion failed"); }
  },

  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (req.method === "GET" && url.pathname === "/health") return json({ ok: true, service: "shelfspring-mail", commit: env.DEPLOY_COMMIT ?? null });
    if (req.method === "POST" && /^\/backup\/[0-6]$/.test(url.pathname)) return uploadBackup(req, env, url.pathname.slice(-1));
    if (req.method === "POST" && url.pathname === "/notify") {
      if (!bearerOk(req, env.NOTIFY_TOKEN)) return json({ error: "unauthorized" }, 401);
      const b = (await req.json().catch(() => null)) as { subject?: string; text?: string; replyTo?: string } | null;
      if (typeof b?.subject !== "string" || typeof b?.text !== "string" || !b.subject || !b.text || (b.replyTo != null && typeof b.replyTo !== "string")) return json({ error: "subject and text required" }, 400);
      try {
        await sendOwner(env, b.subject, b.text.slice(0, 20000), b.replyTo);
        return json({ ok: true });
      } catch { console.error("Owner notification delivery failed"); return json({ error: "owner delivery failed" }, 503); }
    }
    if (req.method === "POST" && url.pathname === "/probe") {
      if (!bearerOk(req, env.NOTIFY_TOKEN)) return json({ error: "unauthorized" }, 401);
      try {
        const result = await probe(env);
        return json(result, result.ok ? 200 : 503);
      } catch { console.error("Health probe or owner notification failed"); return json({ error: "probe failed" }, 503); }
    }
    return json({ error: "not found" }, 404);
  },

  async scheduled(_c: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(probe(env));
  },
};

export default worker;

async function uploadBackup(req: Request, env: Env, day: string): Promise<Response> {
  if (!bearerOk(req, env.BACKUP_TOKEN)) return json({ error: "unauthorized" }, 401);
  const rawLength = req.headers.get("content-length");
  if (!rawLength || !/^\d+$/.test(rawLength)) return json({ error: "content-length required" }, 411);
  const length = Number(rawLength);
  if (!Number.isSafeInteger(length) || length <= 0 || length > MAX_BACKUP_BYTES || !req.body) return json({ error: "backup size is outside the limit" }, 413);
  if (!env.BACKUPS) return json({ error: "backup storage is unavailable" }, 503);
  try {
    // FixedLengthStream prevents a forged Content-Length from committing a larger or truncated object.
    const stream = new FixedLengthStream(length);
    const [, object] = await Promise.all([
      req.body.pipeTo(stream.writable),
      env.BACKUPS.put(`database/daily-${day}.dump`, stream.readable, { httpMetadata: { contentType: "application/octet-stream" } }),
    ]);
    if (!object || object.size !== length) throw new Error("Backup length mismatch");
    return json({ size: object.size, etag: object.etag });
  } catch { console.error("Bounded database backup upload failed"); return json({ error: "backup upload failed" }, 503); }
}

async function probe(env: Env) {
  const cache = await caches.open("health");
  const cached = await cache.match(STATE_URL);
  const prev = cached ? await cached.json() as { down: boolean; since?: string; lastMail?: string } : { down: false };
  let status = 0; let body = "";
  try {
    const r = await fetch(`${env.APP_URL}/api/health?cf=1`, { signal: AbortSignal.timeout(25000), headers: { "cache-control": "no-cache" } });
    status = r.status; body = await r.text();
  } catch { body = "The full health endpoint did not respond within the probe timeout."; }
  let healthyBody = false;
  try { const parsed = JSON.parse(body); healthyBody = parsed.ok === true && parsed.shallow === false && parsed.checks?.database?.ok === true && parsed.checks?.poller?.ok === true; }
  catch { healthyBody = false; }
  const ok = status === 200 && healthyBody;
  const now = new Date();
  let next = prev;
  if (!ok) {
    const last = prev.lastMail ? new Date(prev.lastMail).getTime() : 0;
    if (!prev.down || now.getTime() - last > REMIND_MS) {
      await sendOwner(env, `[ShelfSpring] /api/health returned ${status || "no response"}`, `GET ${env.APP_URL}/api/health failed from the Cloudflare probe.\n\n${body.slice(0, 4000)}`);
      next = { down: true, since: prev.since ?? now.toISOString(), lastMail: now.toISOString() };
    }
  } else if (prev.down) {
    await sendOwner(env, "[ShelfSpring] Recovered: /api/health is OK again", `Down since ${prev.since ?? "?"}; OK at ${now.toISOString()}.`);
    next = { down: false };
  }
  await cache.put(STATE_URL, new Response(JSON.stringify(next), { headers: { "content-type": "application/json", "cache-control": "max-age=604800" } }));
  return { ok, status };
}
