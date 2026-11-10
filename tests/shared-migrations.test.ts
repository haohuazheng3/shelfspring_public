import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";
import { Client } from "pg";
import { applyMigrations, migrationConnectionConfig } from "../scripts/migrate.mjs";

const roots: string[] = [];
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });
function fixture(withShared = false) {
  const root = mkdtempSync(join(tmpdir(), "shelfspring-migration-")); roots.push(root);
  mkdirSync(join(root, "drizzle"));
  for (const name of ["0000_init.sql", "0015_inventory_source.sql"]) writeFileSync(join(root, "drizzle", name), "ALTER TABLE public.users ADD COLUMN legacy_must_never_run text;");
  if (withShared) {
    mkdirSync(join(root, "drizzle-shared"));
    writeFileSync(join(root, "drizzle-shared", "0001_private.sql"), "ALTER TABLE shelfspring.users ADD COLUMN private_note text;");
  }
  return root;
}
function connection({ extra = {}, ledger = ["0000_init.sql", "0015_inventory_source.sql"], exists = true, failDdl = false } = {}) {
  const calls: { sql: string; args?: unknown[] }[] = [];
  const state = { role: "shelfspring", schema: "shelfspring", host: "linode-1", recovery: false, cluster: { primary: "linode-1", epoch: 1 }, ...extra };
  return { calls, query: async (sql: string, args?: unknown[]) => {
    calls.push({ sql, args });
    if (sql.includes("current_user")) return { rows: [state] };
    if (sql.includes("to_regclass")) return { rows: [{ name: exists ? `${state.schema}._migrations` : null }] };
    if (sql.startsWith("SELECT name")) return { rows: ledger.map((name) => ({ name })) };
    if (failDdl && sql.startsWith("ALTER")) throw new Error("fixture DDL failure");
    return { rows: [] };
  } };
}
const options = (root: string) => ({ root, sharedCluster: "pickupchecker", log: () => {} });

it("a fully restored shared schema with no new private migrations executes no legacy or bootstrap DDL", async () => {
  const client = connection();
  await applyMigrations(client, options(fixture()));
  expect(client.calls.every(({ sql }) => sql.startsWith("SELECT"))).toBe(true);
  expect(client.calls[0].sql).toContain("public.shelfspring_cluster_authority");
  expect(client.calls.filter(({ sql }) => sql.startsWith("SELECT name")).every(({ sql }) => sql.includes("shelfspring._migrations"))).toBe(true);
});

it.each([{ exists: false }, { ledger: [] }, { ledger: ["0000_init.sql"] }])("refuses missing/incomplete private ledger before any DDL: %j", async (setup) => {
  const client = connection(setup);
  await expect(applyMigrations(client, options(fixture(true)))).rejects.toThrow(/restored|legacy migration ledger/);
  expect(client.calls.every(({ sql }) => sql.startsWith("SELECT"))).toBe(true);
});

it.each([{ role: "pickupchecker" }, { schema: "public" }, { schema: "shelfspring_preview" }, { host: null },
  { recovery: true }, { cluster: null }, { cluster: { primary: "linode-2", epoch: 2 } },
  { cluster: { primary: "linode-1", epoch: 0 } }, { cluster: { primary: "linode-1", epoch: "1" } }])("refuses a wrong identity or unwritable/fenced cluster: %j", async (extra) => {
  const client = connection({ extra });
  await expect(applyMigrations(client, options(fixture(true)))).rejects.toThrow("authority is invalid");
  expect(client.calls).toHaveLength(1);
});

it("uses preview's own schema and never the public or production migration ledger", async () => {
  const client = connection({ extra: { role: "shelfspring_preview", schema: "shelfspring_preview" } });
  await applyMigrations(client, options(fixture()));
  expect(client.calls.find(({ sql }) => sql.includes("to_regclass"))?.args).toEqual(["shelfspring_preview._migrations"]);
  expect(client.calls.filter(({ sql }) => sql.startsWith("SELECT name")).every(({ sql }) => sql.includes("shelfspring_preview._migrations"))).toBe(true);
});

it("executes only the separate private directory and records names without legacy collisions", async () => {
  const client = connection();
  await applyMigrations(client, options(fixture(true)));
  expect(client.calls.filter(({ sql }) => sql.startsWith("ALTER")).map(({ sql }) => sql)).toEqual(["ALTER TABLE shelfspring.users ADD COLUMN private_note text;"]);
  expect(client.calls.find(({ sql }) => sql.startsWith("INSERT"))).toEqual({
    sql: "INSERT INTO shelfspring._migrations (name) VALUES ($1) ON CONFLICT DO NOTHING", args: ["shared/0001_private.sql"],
  });
  expect(client.calls.some(({ sql }) => sql === "COMMIT")).toBe(true);
});

it("skips recorded private changes and rolls back a failed new private migration", async () => {
  const root = fixture(true);
  const done = connection({ ledger: ["0000_init.sql", "0015_inventory_source.sql", "shared/0001_private.sql"] });
  await applyMigrations(done, options(root));
  expect(done.calls.every(({ sql }) => sql.startsWith("SELECT"))).toBe(true);
  const failed = connection({ failDdl: true });
  await expect(applyMigrations(failed, options(root))).rejects.toThrow("fixture DDL failure");
  expect(failed.calls.at(-1)?.sql).toBe("ROLLBACK");
  expect(failed.calls.some(({ sql }) => sql.startsWith("INSERT"))).toBe(false);
});

it("retains the existing standalone migration flow when shared mode is absent", async () => {
  const client = connection({ ledger: [] });
  await applyMigrations(client, { root: fixture(), log: () => {} });
  expect(client.calls[0].sql).toContain("CREATE TABLE IF NOT EXISTS _migrations");
  expect(client.calls.filter(({ sql }) => sql.startsWith("ALTER"))).toHaveLength(2);
});

it("a standalone database (a fresh clone) runs the legacy files, then the shared-era ones", async () => {
  const client = connection({ ledger: [] });
  await applyMigrations(client, { root: fixture(true), log: () => {} });
  const alters = client.calls.filter(({ sql }) => sql.startsWith("ALTER")).map(({ sql }) => sql);
  expect(alters).toHaveLength(3);
  expect(alters[2]).toContain("private_note");
  const recorded = client.calls.filter(({ sql }) => sql.startsWith("INSERT INTO _migrations")).map(({ args }) => args?.[0]);
  expect(recorded).toEqual(["0000_init.sql", "0015_inventory_source.sql", "shared/0001_private.sql"]);
});

it("pins verified TLS through the real driver and rejects shared role/search_path overrides", () => {
  const config = migrationConnectionConfig("postgres://shelfspring:fixture@db.example/pickupchecker?sslmode=disable", {
    DATABASE_SHARED_CLUSTER: "pickupchecker", DATABASE_CA: "fixture-ca",
  });
  const client = new Client(config) as unknown as { connectionParameters: { ssl: unknown } };
  expect(client.connectionParameters.ssl).toEqual({ ca: "fixture-ca", rejectUnauthorized: true });
  for (const url of ["postgres://poller:fixture@db.example/pickupchecker", "postgres://shelfspring:fixture@db.example/postgres",
    "postgres://shelfspring:fixture@db.example/pickupchecker?options=-csearch_path%3Dpublic",
    "postgres://shelfspring:fixture@db.example/pickupchecker?host=other.example"]) {
    expect(() => migrationConnectionConfig(url, { DATABASE_SHARED_CLUSTER: "pickupchecker" })).toThrow();
  }
  expect(() => migrationConnectionConfig("postgres://shelfspring:fixture@db.example/shelfspring", { DATABASE_SHARED_CLUSTER: "pickupchecker", DATABASE_CA: "fixture-ca" })).not.toThrow();
});
