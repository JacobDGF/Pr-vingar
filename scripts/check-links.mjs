#!/usr/bin/env node
/**
 * Walks every registrationUrl / infoUrl in the dataset and reports the ones
 * that no longer resolve.
 *
 * Municipal websites get restructured constantly, and a listing whose "Anmäl
 * dig" button 404s is worse than no listing at all — the user has already
 * decided to book by the time they find out. This is the cheap periodic sweep
 * that catches that drift; it is deliberately not part of `npm test`, since it
 * depends on ~90 third-party sites being up.
 *
 *   npm run check:links              report everything that failed
 *   npm run check:links -- --all     also list the URLs that redirected
 *
 * Behind a TLS-intercepting proxy, every https host fails at once (typically as
 * a wall of 503s) because Node doesn't trust the proxy's CA. That is the
 * environment failing, not ~70 kommuner going down together — point Node at the
 * bundle before blaming the data:
 *
 *   NODE_EXTRA_CA_CERTS=/path/to/ca-bundle.crt npm run check:links
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(ROOT, 'src/data/exams.ts');

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const CONCURRENCY = 8;
const TIMEOUT_MS = 25_000;
const showAll = process.argv.includes('--all');

/** Read the URLs straight out of the source — no build step, no TS runtime. */
function collectUrls() {
  const src = readFileSync(SOURCE, 'utf8');
  const byUrl = new Map();
  for (const [, field, url] of src.matchAll(/(registrationUrl|infoUrl): '([^']+)'/g)) {
    if (!byUrl.has(url)) byUrl.set(url, new Set());
    byUrl.get(url).add(field);
  }
  return [...byUrl].map(([url, fields]) => ({ url, fields: [...fields].sort().join(', ') }));
}

/**
 * Hosts that answer a bot with 503 while serving the page fine in a browser.
 *
 * Sweeping every link and getting a wall of red teaches you to skim the report,
 * which defeats the point of running it — so these get their own section and
 * don't fail the run. The cost is real: a link that genuinely dies on one of
 * these hosts will not be caught here, and has to be checked by hand. Each
 * entry stays only as long as the last manual check holds, so the list is kept
 * as short as the evidence allows.
 *
 * It used to be longer. Alvis and www.falun.se sat here on the strength of a
 * 503 that turned out to be rate limiting from our own eight-wide pool — they
 * answer 200 every time when asked one at a time (see `recheck` below). Waiving
 * a host is not free: it is the one place a dead link can hide, so a host earns
 * a line here only by failing the serial retry too.
 */
const BOT_BLOCKED = [
  // Checked by hand 2026-08-13: both serve 200 to curl with a browser
  // user-agent and 503 to fetch() on every attempt, serial or not — they
  // fingerprint the client, not the rate.
  'komvuxsodermalm.stockholm', // Stockholms stads komvux sites
  'www.landskrona.se',
  // Carried over from 2026-08-12 and unobserved since: the dataset has no
  // link on this host, so the sweep never asks it. Re-check by hand if one
  // turns up again.
  'komvuxskarholmen.stockholm',
];
// www.akadeva.se and jgy.se were on this list until 2026-08-13. Both now clear
// the sweep — jgy.se needed the serial retry, akadeva.se not even that — so
// they are back under real observation rather than permanently waived.

/**
 * Statuses worth a second, unhurried ask.
 *
 * Eight parallel requests is enough to trip the rate limiter on several kommun
 * platforms, and their way of saying "slow down" is the same 503 a dying host
 * gives. Retrying serially separates the two: a rate-limited host answers 200
 * on its own, a blocked one keeps refusing. Without this the report cries wolf
 * about four or five live links per run, and a report you learn to skim is a
 * report that stops catching anything.
 */
const RETRYABLE = [429, 503, 502, 504, 'timeout', 'error'];

function isBotBlocked(url) {
  try {
    const { hostname } = new URL(url);
    return BOT_BLOCKED.some((h) => (h.startsWith('.') ? hostname.endsWith(h) : hostname === h));
  } catch {
    return false;
  }
}

async function check({ url, fields }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': UA, 'accept-language': 'sv-SE,sv;q=0.9' },
      redirect: 'follow',
      signal: controller.signal,
    });
    // Some kommun platforms answer 200 while redirecting to their own error
    // page — a dead link that never shows up as a dead status code.
    const softDead = /statuscode\/404|\/404($|[/?#])|sidan-finns-inte|page-not-found/i.test(
      res.url,
    );
    return {
      url,
      fields,
      status: softDead ? 'soft-404' : res.status,
      finalUrl: res.url,
      ok: res.ok && !softDead,
    };
  } catch (err) {
    return {
      url,
      fields,
      status: err.name === 'AbortError' ? 'timeout' : 'error',
      finalUrl: '',
      ok: false,
      detail: err.message,
    };
  } finally {
    clearTimeout(timer);
  }
}

/** Fixed-size worker pool — 90 simultaneous requests gets us rate-limited. */
async function mapPool(items, worker, size) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await worker(items[i]);
      }
    }),
  );
  return results;
}

const urls = collectUrls();
console.log(`Kontrollerar ${urls.length} unika länkar från ${SOURCE.replace(ROOT + '/', '')}…\n`);

const results = await mapPool(urls, check, CONCURRENCY);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * How long to let a host forget the burst before asking it again.
 *
 * The serial retry used to start the instant the parallel pass ended, 1,5 s per
 * URL. That is the wrong moment: the rate limiter's window is at its freshest
 * exactly then, so a throttled host answers 503 a second time and gets reported
 * as dead. Four links were reported dead that way on 2026-08-23 —
 * botkyrka.alvis.se and minasidor.kunskapsforbundet.se among them — and all
 * four answered 200 to the same request, with the same headers, a few minutes
 * later.
 *
 * So the rounds back off instead: a pause before the first, longer before the
 * second. Two rounds is where it stops — a host that still refuses after half a
 * minute of quiet is refusing us, not pacing us, and that is what the report
 * should say.
 */
const RETRY_ROUNDS = [5_000, 30_000];

/** Re-ask the ones that may only have been throttled, one at a time. */
async function recheck(all) {
  let current = all;
  for (const [round, settle] of RETRY_ROUNDS.entries()) {
    const retry = current.filter((r) => !r.ok && RETRYABLE.includes(r.status));
    if (!retry.length) break;
    console.log(
      `↻ ${retry.length} svarade trögt — väntar ${settle / 1000} s och kontrollerar dem en i taget` +
        ` (omgång ${round + 1} av ${RETRY_ROUNDS.length})…\n`,
    );
    await sleep(settle);
    const fixed = new Map();
    for (const r of retry) {
      const second = await check(r);
      if (second.ok) fixed.set(r.url, second);
      else await sleep(1_500);
    }
    current = current.map((r) => fixed.get(r.url) ?? r);
  }
  return current;
}

const checked = await recheck(results);
const failed = checked.filter((r) => !r.ok);
// A 404 is a 404 even from a host that usually stonewalls us; only the
// stonewalling itself (503/timeout/connection error) gets the benefit of doubt.
const unverifiable = failed.filter(
  (r) => isBotBlocked(r.url) && [503, 403, 429, 'timeout', 'error'].includes(r.status),
);
const broken = failed.filter((r) => !unverifiable.includes(r));
const redirected = checked.filter((r) => r.ok && r.finalUrl && r.finalUrl !== r.url);

if (redirected.length && showAll) {
  console.log(`↪ ${redirected.length} omdirigerade (fungerar, men länken kan uppdateras):`);
  for (const r of redirected) console.log(`   ${r.url}\n     → ${r.finalUrl}`);
  console.log('');
}

if (unverifiable.length) {
  console.log(`⃠ ${unverifiable.length} kunde inte kontrolleras automatiskt (värden blockerar):`);
  for (const r of unverifiable) console.log(`   [${r.status}] ${r.url}  (${r.fields})`);
  console.log('   Kontrollera dessa i webbläsare — sweepen kan inte se om de dör.\n');
}

if (!broken.length) {
  console.log(
    `✓ ${checked.length - unverifiable.length} av ${checked.length} länkar svarar. ` +
      `${redirected.length} omdirigerar.`,
  );
  process.exit(0);
}

console.error(`✗ ${broken.length} av ${checked.length} länkar svarar inte:\n`);
for (const r of broken) {
  console.error(`   [${r.status}] ${r.url}  (${r.fields})${r.detail ? `\n     ${r.detail}` : ''}`);
}
console.error(
  '\nBlockerar värden automatiserade anrop? Lägg till den i BOT_BLOCKED efter att du\n' +
    'kontrollerat länken i en webbläsare — annars är det datan som behöver rättas.',
);
process.exit(1);
