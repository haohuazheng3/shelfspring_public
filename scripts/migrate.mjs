#!/usr/bin/env node
/**
 * Applies drizzle/*.sql in order, once each (table `_migrations`), each file in one transaction.
 * Idempotent; skipped without a database URL so `next build` works anywhere. TLS rules match
 * src/lib/db (plain on loopback, otherwise verified against DATABASE_CA).
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const roleSchemas = new Map([["shelfspring", "shelfspring"], ["shelfspring_poller", "shelfspring"],
  ["shelfspring_preview", "shelfspring_preview"], ["shelfspring_preview_poller", "shelfspring_preview"]]);
const sqlFiles = (dir) => existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".sql")).sort() : [];

/** @param {Record<string, string | undefined>} env */
export function migrationConnectionConfig(url, env = process.env) {
  const parsed = new URL(url);
  const shared = env.DATABASE_SHARED_CLUSTER || "";
  if (shared && shared !== "pickupchecker") throw new Error("Invalid shared database cluster");
  if (shared && (!['postgres:', 'postgresql:'].includes(parsed.protocol) || !["/pickupchecker", "/shelfspring"].includes(parsed.pathname) || !roleSchemas.has(parsed.username) || parsed.hash)) {
    throw new Error("Shared migrations require an isolated ShelfSpring role");
  }
  const targets = new Set(["host", "hostaddr", "port", "user", "password", "database", "dbname"]);
  const tls = new Set(["ssl", "sslmode", "sslcert", "sslkey", "sslrootcert", "sslpassword", "sslnegotiation", "uselibpqcompat"]);
  for (const key of [...parsed.searchParams.keys()]) {
    if (targets.has(key.toLowerCase()) || shared && key.toLowerCase() === "options") throw new Error("Migration connection settings must not be overridden");
    if (tls.has(key.toLowerCase())) parsed.searchParams.delete(key);
  }
  const host = parsed.hostname.replace(/^\[|\]$/g, "");
  const local = ["localhost", "127.0.0.1", "::1"].includes(host);
  const ca = env.DATABASE_CA?.replace(/\\n/g, "\n").trim() || undefined;
  return { connectionString: parsed.toString(), ssl: local ? false : { ca, rejectUnauthorized: true }, connectionTimeoutMillis: 15_000 };
}

/** Shared schemas are restored first; this runner never bootstraps them using legacy public DDL. */
export async function applyMigrations(client, { root = repositoryRoot, sharedCluster = "", log = console.log } = {}) {
  if (sharedCluster && sharedCluster !== "pickupchecker") throw new Error("Invalid shared database cluster");
  const legacy = sqlFiles(join(root, "drizzle"));
  let table = "_migrations";
  // Passes in order: a standalone database (a fresh clone, local development) runs the legacy files and then the
  // shared-era ones; the shared cluster has the legacy ledger restored and runs only drizzle-shared/. New changes go in
  // drizzle-shared/ only (unqualified names: they resolve to the role's own schema), so both kinds of database get them.
  let passes = [{ dir: join(root, "drizzle"), prefix: "" }, { dir: join(root, "drizzle-shared"), prefix: "shared/" }];
  if (sharedCluster) {
    const row = (await client.query(`SELECT current_user AS role, current_schema() AS schema,
      current_setting('pickupchecker.host', true) AS host, pg_is_in_recovery() AS recovery,
      (SELECT value FROM public.shelfspring_cluster_authority) AS cluster`)).rows[0];
    const schema = roleSchemas.get(row?.role);
    const label = (value) => typeof value === "string" && /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$/.test(value);
    if (!schema || row.schema !== schema || row.recovery !== false || !label(row.host)
      || row.cluster?.primary !== row.host || !Number.isSafeInteger(row.cluster?.epoch) || row.cluster.epoch < 1) {
      throw new Error("Shared migration role, schema or cluster authority is invalid");
    }
    table = `${schema}._migrations`;
    // Qualified lookup cannot mistake the original application's migration ledger for ours.
    const existing = (await client.query("SELECT to_regclass($1)::text AS name", [table])).rows[0]?.name;
    if (!existing) throw new Error("Shared private schema must be restored before migrations");
    const restored = new Set((await client.query(`SELECT name FROM ${table}`)).rows.map((r) => r.name));
    if (legacy.length === 0 || legacy.some((file) => !restored.has(file))) throw new Error("Shared schema is missing the complete legacy migration ledger; refusing legacy DDL");
    passes = [{ dir: join(root, "drizzle-shared"), prefix: "shared/" }];
  } else {
    if (legacy.length === 0) { log("[migrate] no drizzle/ directory — skipped"); return; }
    await client.query("CREATE TABLE IF NOT EXISTS _migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())");
  }
  const done = new Set((await client.query(`SELECT name FROM ${table}`)).rows.map((r) => r.name));
  let applied = 0, total = 0;
  for (const { dir, prefix } of passes) {
    const files = sqlFiles(dir);
    total += files.length;
    for (const f of files) {
      const name = prefix + f;
      if (done.has(name)) continue;
      const text = readFileSync(join(dir, f), "utf8");
      // drizzle-kit separates statements with "--> statement-breakpoint"
      const statements = text.split(/-->\s*statement-breakpoint/g).map((s) => s.trim()).filter(Boolean);
      await client.query("BEGIN");
      try {
        for (const s of statements) await client.query(s);
        await client.query(`INSERT INTO ${table} (name) VALUES ($1) ON CONFLICT DO NOTHING`, [name]);
        await client.query("COMMIT");
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      }
      applied++;
      log(`[migrate] applied ${name} (${statements.length} statements)`);
    }
  }
  log(`[migrate] up to date (${applied} new, ${total} ${sharedCluster ? "shared-schema" : "total"})`);
}

async function main() {
  const sharedCluster = process.env.DATABASE_SHARED_CLUSTER || "";
  if (sharedCluster && process.env.DATABASE_URL_UNPOOLED) throw new Error("Shared migrations refuse an alternate unpooled target");
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url || url.includes("[SENSITIVE]")) {
    if (sharedCluster) throw new Error("Shared migrations require a database URL");
    console.log("[migrate] no database URL — skipped");
    return;
  }
  const config = migrationConnectionConfig(url);
  // A busy deployment may briefly exhaust ordinary slots; preserve the existing bounded retry.
  let client;
  for (let i = 0; ; i++) {
    client = new pg.Client(config);
    try { await client.connect(); break; } catch (e) {
      await client.end().catch(() => {});
      if (e?.code !== "53300" || i >= 7) throw e;
      console.warn(`[migrate] database out of connection slots, retrying in ${1 + i} s`);
      await new Promise((r) => setTimeout(r, 1000 * (1 + i)));
    }
  }
  try { await applyMigrations(client, { sharedCluster }); } finally { await client.end(); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
