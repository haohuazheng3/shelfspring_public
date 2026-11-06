#!/usr/bin/env node
/**
 * ZIP code centroids for the store finder, from the US Census Bureau's 2020 ZCTA Gazetteer (public domain):
 *   https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2020_Gazetteer/2020_Gaz_zcta_national.zip
 * Writes public/zip/<first three digits>.json = { "07030": [40.7454, -74.0279], … } so a typed ZIP loads
 * one small file. Re-run when the Census publishes a new gazetteer:
 *   node scripts/zip-centroids.mjs path/to/2020_Gaz_zcta_national.txt
 */
import { readFileSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const src = process.argv[2];
if (!src) { console.error("usage: node scripts/zip-centroids.mjs <2020_Gaz_zcta_national.txt>"); process.exit(1); }
const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "zip");
const lines = readFileSync(src, "utf8").split("\n").slice(1).filter((l) => l.trim());
const groups = new Map();
for (const l of lines) {
  const [zip, , , , , lat, lng] = l.split("\t").map((c) => c.trim());
  if (!/^\d{5}$/.test(zip)) continue;
  const g = groups.get(zip.slice(0, 3)) ?? {};
  g[zip] = [Number(Number(lat).toFixed(4)), Number(Number(lng).toFixed(4))];
  groups.set(zip.slice(0, 3), g);
}
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
let n = 0;
for (const [p, g] of groups) { writeFileSync(join(out, `${p}.json`), JSON.stringify(g)); n += Object.keys(g).length; }
console.log(`[zip] ${n} ZIP centroids in ${groups.size} files → public/zip/`);
