#!/usr/bin/env node
/**
 * Hämtar summorna från räknaren och lägger dem i repot.
 *
 * Körs av [`.github/workflows/stats.yml`](../.github/workflows/stats.yml) en
 * gång per dygn, och går att köra för hand:
 *
 *   node scripts/update-stats.mjs
 *
 * Adressen läses ur `.env.production` (samma rad appen byggs med), eller ur
 * STATS_ENDPOINT om den är satt. STATS_TOKEN behövs bara om workern fått en
 * EXPORT_TOKEN.
 *
 * Utan adress gör skriptet ingenting och avslutar med 0. Det är avsiktligt:
 * repot ska gå att klona, bygga och köra utan en räknare, och ett nattligt
 * jobb som lyser rött i ett repo som aldrig satt upp någon är ett larm ingen
 * kommer att läsa.
 *
 * Fönstret är brett (14 dygn) trots att jobbet går varje natt. Det som ska
 * överleva är en vecka då Actions legat nere eller räknaren varit onåbar:
 * exporten bär hela dygnets summa, så ett bredare fönster läker hålet av sig
 * självt vid nästa lyckade körning.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { emptyUsage, endpointFromEnvFile, mergeExport, renderReport } from './statsReport.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const USAGE = join(ROOT, 'stats/usage.json');
const REPORT = join(ROOT, 'stats/README.md');

const WINDOW_DAYS = 14;
const ATTEMPTS = 3;

// Adressen kommer i första hand ur miljön (för den som hellre håller den i
// en hemlighet), annars ur .env.production — samma rad appen byggs med, så de
// två kan inte peka på olika räknare.
const endpoint =
  (process.env.STATS_ENDPOINT ?? '').trim().replace(/\/+$/, '') || endpointFromRepo();

// Token är valfri. Workern kräver den bara om den satts där; summorna den
// lämnar ut är ändå de som publiceras i stats/.
const token = (process.env.STATS_TOKEN ?? '').trim();

if (!endpoint) {
  console.log('Ingen räknare konfigurerad (VITE_ANALYTICS_SRC är tom) — hoppar över.');
  process.exit(0);
}

function endpointFromRepo() {
  try {
    return endpointFromEnvFile(readFileSync(join(ROOT, '.env.production'), 'utf8'));
  } catch {
    return '';
  }
}

const since = new Date(Date.now() - WINDOW_DAYS * 86_400_000).toISOString().slice(0, 10);
const payload = await fetchExport(`${endpoint}/export?since=${since}`);

const usage = mergeExport(readUsage(), payload);
const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date());

mkdirSync(join(ROOT, 'stats'), { recursive: true });
writeFileSync(USAGE, `${JSON.stringify(usage, null, 2)}\n`);
writeFileSync(REPORT, renderReport(usage, today));

const days = Object.keys(usage.dagar).length;
console.log(`${payload.rows.length} rader från räknaren, ${days} dygn i stats/usage.json.`);

function readUsage() {
  try {
    return JSON.parse(readFileSync(USAGE, 'utf8'));
  } catch {
    // Första körningen, eller en fil någon har sönder. Räknarens fönster fyller
    // på de senaste dygnen igen; det som är äldre är borta, och det syns i git.
    return emptyUsage();
  }
}

async function fetchExport(url) {
  let lastError;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, {
        headers: token ? { authorization: `Bearer ${token}` } : {},
        signal: AbortSignal.timeout(30_000),
      });
      if (response.status === 401) {
        // Fel token är inget som blir bättre av att försöka igen.
        throw new Error(
          '401 från räknaren: workern har en EXPORT_TOKEN som STATS_TOKEN inte matchar.',
        );
      }
      if (!response.ok) throw new Error(`${response.status} från räknaren`);
      const body = await response.json();
      if (!Array.isArray(body?.rows)) throw new Error('Svaret saknar rows[]');
      return body;
    } catch (error) {
      lastError = error;
      if (String(error.message).startsWith('401')) break;
      if (attempt < ATTEMPTS) await new Promise((r) => setTimeout(r, attempt * 2000));
    }
  }
  console.error(`Kunde inte hämta statistiken: ${lastError?.message ?? lastError}`);
  process.exit(1);
}
