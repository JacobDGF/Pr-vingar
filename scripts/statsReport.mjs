/**
 * Räknarens summor → filen som ligger i repot.
 *
 * Allt som kan ha fel här är rena funktioner med ett test bredvid
 * (`statsReport.test.mjs`). `update-stats.mjs` gör bara hämtningen och
 * skrivningen.
 *
 * Två beslut är värda att skriva ut:
 *
 * - **Exporten vinner för de dygn den täcker.** Räknaren håller hela dygnets
 *   summa, inte ett tillägg sedan sist, så en körning som ser samma dygn två
 *   gånger ger samma fil. Kör jobbet två gånger, eller efter en dag då det inte
 *   kördes alls, och siffrorna blir ändå rätt. Äldre dygn än räknarens
 *   gallringsfönster rör den aldrig — där är filen arkivet.
 * - **Etiketterna plattas till tre dimensioner.** Räknaren lagrar
 *   `{"kommun":"Örebro","ämne":"Matematik"}` som en nyckel; filen räknar kommun
 *   för sig och ämne för sig. Kombinationen går förlorad, och det är meningen:
 *   den är det enda i datan som ens teoretiskt börjar likna ett spår efter en
 *   person.
 */

/** Dimensioner som lyfts ur händelsernas etiketter, i den ordning de visas. */
const DIMENSIONS = [
  { prop: 'kommun', into: 'kommuner' },
  { prop: 'ämne', into: 'ämnen' },
  { prop: 'kurskod', into: 'kurser' },
];

export function emptyUsage() {
  return { uppdaterad: null, dagar: {} };
}

function emptyDay() {
  return { besök: 0, sidvisningar: {}, händelser: {}, kommuner: {}, ämnen: {}, kurser: {} };
}

function bump(bucket, key, n) {
  if (!key) return;
  bucket[key] = (bucket[key] ?? 0) + n;
}

/**
 * Lägger en export ovanpå den fil som redan finns.
 *
 * `rows` är räknarens egna summor: `{day, kind, name, label, n}`.
 */
export function mergeExport(usage, payload) {
  const dagar = { ...(usage?.dagar ?? {}) };
  const rows = Array.isArray(payload?.rows) ? payload.rows : [];

  // Dygnen exporten nämner skrivs om från grunden, inte ovanpå. Annars
  // dubbleras varje siffra den dag jobbet kördes två gånger.
  for (const day of new Set(rows.map((r) => r?.day).filter((d) => typeof d === 'string'))) {
    dagar[day] = emptyDay();
  }

  for (const row of rows) {
    const day = dagar[row?.day];
    if (!day) continue;
    const n = Number(row.n) || 0;
    if (n <= 0) continue;

    if (row.kind === 'visit') day.besök += n;
    else if (row.kind === 'pageview') bump(day.sidvisningar, row.name, n);
    else if (row.kind === 'event') {
      bump(day.händelser, row.name, n);
      const props = parseLabel(row.label);
      for (const { prop, into } of DIMENSIONS) bump(day[into], props[prop], n);
    }
  }

  return {
    uppdaterad: payload?.generatedAt ?? new Date().toISOString(),
    dagar: Object.fromEntries(Object.entries(dagar).sort(([a], [b]) => a.localeCompare(b))),
  };
}

function parseLabel(label) {
  if (typeof label !== 'string' || !label) return {};
  try {
    const parsed = JSON.parse(label);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

/** De `days` senaste dygnen fram till och med `today`, äldst först. */
export function lastDays(usage, today, days) {
  const first = new Date(`${today}T00:00:00Z`);
  first.setUTCDate(first.getUTCDate() - (days - 1));
  const from = first.toISOString().slice(0, 10);
  return Object.entries(usage?.dagar ?? {})
    .filter(([day]) => day >= from && day <= today)
    .map(([day, v]) => ({ day, ...emptyDay(), ...v }));
}

function total(rows, pick) {
  return rows.reduce((sum, row) => sum + pick(row), 0);
}

function sumBuckets(rows, key) {
  const out = {};
  for (const row of rows) for (const [k, n] of Object.entries(row[key] ?? {})) bump(out, k, n);
  return out;
}

function top(bucket, limit) {
  return Object.entries(bucket)
    .sort(([aK, aN], [bK, bN]) => bN - aN || aK.localeCompare(bK))
    .slice(0, limit);
}

const TAB_NAMES = {
  '/discover': 'Upptäck',
  '/ai': 'AI-prövning',
  '/exams': 'Mina prövningar',
  '/community': 'Community',
  '/history': 'Historik',
  '/profile': 'Profil',
};

/** Statistiken som en sida GitHub renderar av sig självt. */
export function renderReport(usage, today) {
  const month = lastDays(usage, today, 30);
  const visits = total(month, (d) => d.besök);
  const views = total(month, (d) => Object.values(d.sidvisningar).reduce((a, b) => a + b, 0));
  const signups = total(month, (d) => d.händelser['Till anmälan'] ?? 0);

  const lines = [
    '# Statistik',
    '',
    'Så här används [Prövningar](https://xn--prvningar-17a.se). Siffrorna samlas in av',
    'appens egen räknare (`collector/`) och skrivs hit av',
    '[`.github/workflows/stats.yml`](../.github/workflows/stats.yml) en gång per dygn — det',
    'finns ingen instrumentpanel någon annanstans, och ingen tredje part som ser besökarna.',
    '',
    '**Filen är genererad.** Ändringar här skrivs över vid nästa körning; räkningen ändras i',
    '`collector/worker.js` och i `src/lib/analytics.ts`.',
    '',
    `## Senaste 30 dygnen (t.o.m. ${today})`,
    '',
    `| Besök | Sidvisningar | Till anmälan |`,
    `| ----- | ------------ | ------------ |`,
    `| ${visits} | ${views} | ${signups} |`,
    '',
  ];

  if (!month.length) {
    lines.push('Ingen data än. Första körningen efter att räknaren tagits i bruk fyller tabellen.');
    lines.push('');
  } else {
    lines.push('### Per dygn', '', '| Dygn | Besök | Sidvisningar | Till anmälan |');
    lines.push('| ---- | ----- | ------------ | ------------ |');
    for (const day of [...month].reverse()) {
      const dayViews = Object.values(day.sidvisningar).reduce((a, b) => a + b, 0);
      lines.push(
        `| ${day.day} | ${day.besök} | ${dayViews} | ${day.händelser['Till anmälan'] ?? 0} |`,
      );
    }
    lines.push('');

    lines.push(
      ...section('Flikar', sumBuckets(month, 'sidvisningar'), 8, (k) => TAB_NAMES[k] ?? k),
    );
    lines.push(...section('Händelser', sumBuckets(month, 'händelser'), 10));
    lines.push(...section('Kommuner i öppnade prövningar', sumBuckets(month, 'kommuner'), 10));
    lines.push(...section('Ämnen', sumBuckets(month, 'ämnen'), 10));
  }

  lines.push(
    '## Vad som inte står här',
    '',
    'Inga besökar-id, inga IP-adresser, ingen user agent och ingen fritext — det som skrivs i',
    'sökrutan eller till AI-prövning lämnar aldrig enheten. Raderna är summor per dygn, så två',
    'besök går inte att skilja åt ens i råtabellen, och "besök" räknas en gång per',
    'webbläsarsession utan något som följer med till nästa. Statistiken finns bara för dem som',
    'sagt ja i appens samtyckesruta.',
    '',
    `<sub>${usage?.uppdaterad ? `Uppdaterad ${usage.uppdaterad}` : 'Har inte körts än'}.</sub>`,
    '',
  );

  return lines.join('\n');
}

function section(title, bucket, limit, rename = (k) => k) {
  const rows = top(bucket, limit);
  if (!rows.length) return [];
  return [
    `### ${title}`,
    '',
    '| Namn | Antal |',
    '| ---- | ----- |',
    ...rows.map(([key, n]) => `| ${rename(key)} | ${n} |`),
    '',
  ];
}

/**
 * Räknarens adress, läst ur `.env.production`.
 *
 * Appen och nattjobbet ska aldrig kunna peka på olika räknare, så adressen
 * står på ett enda ställe: `VITE_ANALYTICS_SRC`, den URL webbläsaren postar
 * till. Jobbet vill ha basen utan `/e` på slutet, och det är den enda
 * skillnaden — därför härleds den i stället för att skrivas en gång till.
 */
export function endpointFromEnvFile(text) {
  const line = String(text ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .find((l) => l.startsWith('VITE_ANALYTICS_SRC='));
  if (!line) return '';

  const value = line
    .slice('VITE_ANALYTICS_SRC='.length)
    .trim()
    .replace(/^["']|["']$/g, '');
  if (!/^https?:\/\//.test(value)) return '';
  return value.replace(/\/+$/, '').replace(/\/e$/, '');
}
