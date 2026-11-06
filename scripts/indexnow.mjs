#!/usr/bin/env node
/** Only an indexable, verified ShelfSpring production release can be submitted. No import-time I/O.
 * CI runs this after verify-release.mjs; manual use needs the same current receipt/environment.
 * Optional path arguments select a live-sitemap subset. HTTP 200/202 means accepted, not indexed.
 */
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const ORIGIN = 'https://shelfspring.com';
export const KEY = '15c8b6ceb658e293c7d8f72f54d857ad';
export const ENDPOINT = 'https://api.indexnow.org/indexnow';
const fail = (code) => { throw new Error(code); };

export function productionUrl(value) {
  if (typeof value !== 'string' || /[\s\\#]/u.test(value) || /%(?![a-f\d]{2})/i.test(value)) fail('invalid_sitemap_url');
  let url;
  try { url = new URL(value); if (/[\u0000-\u001f\u007f\\]/.test(decodeURIComponent(url.pathname))) fail('invalid_sitemap_url'); } catch { fail('invalid_sitemap_url'); }
  if (url.origin !== ORIGIN || url.username || url.password || url.port || url.search) fail('foreign_or_filtered_sitemap_url');
  return url.href;
}

function decodeXml(value) {
  if (/&(?![a-z]+;|#\d+;|#x[a-f\d]+;)/i.test(value)) fail('invalid_sitemap_xml');
  return value.replace(/&([^;]*);/g, (_entity, name) => {
    const names = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
    if (Object.hasOwn(names, name)) return names[name];
    if (!/^#(?:\d+|x[a-f\d]+)$/i.test(name)) fail('invalid_sitemap_xml');
    const number = name[1].toLowerCase() === 'x' ? Number.parseInt(name.slice(2), 16) : Number(name.slice(1));
    if (!Number.isSafeInteger(number) || number < 32 || number > 0x10ffff) fail('invalid_sitemap_xml');
    return String.fromCodePoint(number);
  });
}

/** Accept this app's URL-set format, never HTML errors, sitemap indexes or partial XML. */
export function sitemapUrls(xml) {
  if (/<!/i.test(xml)) fail('unsupported_sitemap_xml');
  const root = xml.trim().match(/^(?:<\?xml\s[^?]*\?>\s*)?<urlset(?:\s[^>]*)?>([\s\S]*)<\/urlset>$/);
  if (!root) fail('invalid_sitemap_xml');
  const urls = [];
  const rest = root[1].replace(/<url>([\s\S]*?)<\/url>/g, (_all, body) => {
    const locations = [...body.matchAll(/<loc>([^<]*)<\/loc>/g)];
    const remainder = body.replace(/<loc>[^<]*<\/loc>/g, '').replace(/<(lastmod|changefreq|priority)>[^<]*<\/\1>/g, '');
    if (locations.length !== 1 || remainder.trim()) fail('invalid_sitemap_entry');
    urls.push(productionUrl(decodeXml(locations[0][1].trim())));
    return '';
  });
  if (rest.trim() || !urls.length || urls.length > 50_000) fail('invalid_sitemap_size_or_structure');
  return [...new Set(urls)];
}

export function assertRobotsAllows(text, urls) {
  const groups = []; let current; let hasRules = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim();
    const match = line.match(/^([\w-]+)\s*:\s*(.*)$/);
    if (!match) { if (line) fail('invalid_robots'); continue; }
    const [, field, value] = match;
    if (field.toLowerCase() === 'user-agent') {
      if (!current || hasRules) { current = { agents: [], rules: [] }; groups.push(current); hasRules = false; }
      current.agents.push(value.toLowerCase());
    } else if (['allow', 'disallow'].includes(field.toLowerCase())) {
      if (!current || value && !value.startsWith('/')) fail('invalid_robots');
      hasRules = true;
      if (value) current.rules.push({ allow: field.toLowerCase() === 'allow', pattern: value });
    }
  }
  if (!groups.some((g) => g.agents.includes('*'))) fail('robots_wildcard_missing');
  for (const agent of ['*', 'bingbot', 'yandexbot', 'seznambot', 'naverbot', 'yeti']) {
    const specific = groups.filter((g) => g.agents.includes(agent));
    const rules = (specific.length ? specific : groups.filter((g) => g.agents.includes('*'))).flatMap((g) => g.rules);
    for (const value of [ORIGIN + '/', ...urls]) {
      const path = decodeURIComponent(new URL(value).pathname);
      const matches = rules.filter((r) => {
        const expression = r.pattern.replace(/[.+?^{}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
        return new RegExp('^' + expression).test(path);
      }).sort((a, b) => b.pattern.replace(/[*$]/g, '').length - a.pattern.replace(/[*$]/g, '').length || Number(b.allow) - Number(a.allow));
      if (matches[0] && !matches[0].allow) fail('robots_disallows_submission');
    }
  }
}

export function assertVerifiedRelease(env, receipt, now) {
  const age = now - Date.parse(receipt?.verifiedAt);
  if (env.NEXT_PUBLIC_SITE_URL !== ORIGIN || env.DEPLOY_ENVIRONMENT !== 'production'
    || !/^[a-f\d]{40}$/.test(env.DEPLOY_SHA ?? '') || receipt?.sha !== env.DEPLOY_SHA
    || receipt?.target !== 'production' || receipt?.phase !== 'release'
    || receipt?.url !== env.DEPLOYMENT_URL || !env.GITHUB_RUN_ID || receipt?.run !== env.GITHUB_RUN_ID
    || !Array.isArray(receipt?.verifiedOrigins) || receipt.verifiedOrigins.length !== 1 || receipt.verifiedOrigins[0] !== ORIGIN
    || !Number.isFinite(age) || age < 0 || age > 30 * 60_000) fail('verified_production_release_required');
}

async function boundedText(response, maximum) {
  const reader = response.body?.getReader();
  if (!reader) return '';
  const chunks = []; let size = 0;
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > maximum) { await reader.cancel(); fail('response_too_large'); }
      chunks.push(Buffer.from(part.value));
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks).toString('utf8');
}

function assertHomeIndexable(response, html) {
  if (/\b(?:noindex|none)\b/i.test(response.headers.get('x-robots-tag') ?? '')) fail('home_noindex_header');
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attrs = Object.fromEntries([...tag.matchAll(/([\w-]+)\s*=\s*["']([^"']*)["']/g)].map((m) => [m[1].toLowerCase(), m[2]]));
    if (/^(?:robots|bingbot|googlebot)$/i.test(attrs.name ?? '') && /\b(?:noindex|none)\b/i.test(attrs.content ?? '')) fail('home_noindex_meta');
  }
  if (!/<html\b/i.test(html) || !/<\/html>/i.test(html)) fail('invalid_home_document');
}

export async function submitIndexNow(env, { request = fetch, releaseReceipt, paths = [], now = Date.now() } = {}) {
  const result = { attemptedAt: new Date(now).toISOString(), target: env.DEPLOY_TARGET ?? null,
    sha: /^[a-f\d]{40}$/.test(env.DEPLOY_SHA ?? '') ? env.DEPLOY_SHA : null,
    status: 'skipped', reason: 'indexing_disabled_or_not_production', indexingVerified: false, batches: [] };
  // Before any requests, including manual invocations. Preview/noindex can never submit.
  if (env.DEPLOY_TARGET !== 'production' || env.NEXT_PUBLIC_INDEXABLE !== '1' || env.VERCEL_ENV === 'preview') return result;
  try {
    result.stage = 'release_receipt';
    assertVerifiedRelease(env, releaseReceipt, now);
    result.deploymentAlreadyVerified = true;
    async function get(path, maximum) {
      let response;
      try { response = await request(ORIGIN + path, { redirect: 'error', signal: AbortSignal.timeout(20_000), headers: { accept: '*/*' } }); }
      catch { fail('production_read_failed'); }
      if (!response.ok || response.redirected) fail('production_read_http_' + response.status);
      return { response, text: await boundedText(response, maximum) };
    }
    result.stage = 'key_proof';
    const proof = await get('/' + KEY + '.txt', 4096);
    if (proof.text.trim() !== KEY) fail('key_proof_mismatch');
    result.stage = 'robots';
    const robots = await get('/robots.txt', 64_000);
    result.stage = 'home_indexability';
    const home = await get('/', 2_000_000);
    assertHomeIndexable(home.response, home.text);
    result.stage = 'sitemap_validation';
    const sitemap = await get('/sitemap.xml', 8_000_000);
    const all = sitemapUrls(sitemap.text);
    const urls = paths.length ? [...new Set(paths.map((p) => productionUrl(p.startsWith('/') ? ORIGIN + p : p)))] : all;
    if (urls.some((url) => !all.includes(url))) fail('requested_url_not_in_sitemap');
    result.stage = 'robots_url_permissions';
    assertRobotsAllows(robots.text, urls);
    result.sitemapUrls = all.length; result.validatedUrls = urls.length; result.acceptedUrls = 0;
    result.stage = 'submission';
    for (let start = 0; start < urls.length; start += 10_000) {
      const urlList = urls.slice(start, start + 10_000);
      const batch = { batch: result.batches.length + 1, urls: urlList.length, httpStatus: null, status: 'failed' };
      result.batches.push(batch);
      let response;
      try {
        response = await request(ENDPOINT, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(20_000),
          headers: { 'content-type': 'application/json; charset=utf-8' },
          body: JSON.stringify({ host: new URL(ORIGIN).hostname, key: KEY, keyLocation: ORIGIN + '/' + KEY + '.txt', urlList }) });
      } catch { fail('indexnow_request_failed_no_automatic_retry'); }
      batch.httpStatus = response.status;
      // Never store arbitrary provider response bodies or submitted URL lists in CI evidence.
      await response.body?.cancel();
      if (!response.ok || response.redirected || ![200, 202].includes(response.status)) fail('indexnow_unaccepted_http_' + response.status);
      batch.status = 'accepted'; batch.keyValidationPending = response.status === 202;
      result.acceptedUrls += urlList.length;
    }
    result.status = 'accepted'; result.reason = 'received_by_indexnow_not_proof_of_crawling_or_indexing';
  } catch (error) {
    result.status = 'failed'; result.reason = error instanceof Error && /^[a-z0-9_]+$/.test(error.message) ? error.message : 'indexnow_validation_failed';
  }
  return result;
}

async function main() {
  let releaseReceipt;
  if (process.env.DEPLOY_TARGET === 'production' && process.env.NEXT_PUBLIC_INDEXABLE === '1') {
    try { releaseReceipt = JSON.parse(readFileSync('ops-reports/ci/deployment.json', 'utf8')); } catch { /* fail closed, with a safe report */ }
  }
  const receipt = await submitIndexNow(process.env, { releaseReceipt, paths: process.argv.slice(2) });
  mkdirSync('ops-reports/ci', { recursive: true });
  writeFileSync('ops-reports/ci/indexnow.json', JSON.stringify(receipt, null, 2) + '\n');
  const summary = `IndexNow: ${receipt.status}; ${receipt.acceptedUrls ?? 0} accepted of ${receipt.validatedUrls ?? 0} validated URLs; ${receipt.reason}. Separate from the already-deployed release; not proof of indexing.\n`;
  console.log(summary.trim());
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  if (receipt.status === 'failed') process.exitCode = 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(() => { console.error('IndexNow evidence could not be saved; deployment is not rolled back.'); process.exitCode = 1; });
}
