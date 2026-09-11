/**
 * Prövningars egen räknare.
 *
 * En statisk sajt kan inte räkna sina besökare själv — GitHub Pages är en
 * filserver som varken kör kod eller lämnar ut loggar. Något måste alltså ta
 * emot anropet, och det enda som *inte* får göra det är webbläsaren med en
 * GitHub-token i fickan: bygget publiceras till gh-pages i samma repo, så en
 * token i bundlen hamnar i klartext i repot och kan skriva till det.
 *
 * Det här är därför det minsta möjliga mellanledet. Den tar emot en händelse,
 * kontrollerar att den är en av de sju appen får skicka, räknar upp en siffra
 * och glömmer resten. En gång om dygnet hämtar ett GitHub Actions-jobb
 * summorna och lägger dem som en fil i repot — det är där statistiken bor, och
 * det finns ingen instrumentpanel någon annanstans.
 *
 * Vad som aldrig lagras: IP-adress, user agent, referrer, någon form av id för
 * besökaren. Raderna är summor per dygn, inte händelser per person, och det
 * finns ingenting i tabellen som skiljer två besökare åt. Cloudflare ser
 * förstås IP-adressen vid kanten som vilken webbserver som helst — men den
 * lämnar aldrig kanten, och `collect` skriver den ingenstans.
 *
 * Kontrollen av händelsenamnen är medvetet en kopia av appens lista. Den här
 * änden är gränsen mot internet: den ska inte lita på att det som kommer in är
 * appen, utan bara ta emot det som står här.
 *
 * Uppsättning: se README.md i den här mappen.
 */

/** Samma sex händelser som `src/lib/analyticsCore.ts`, plus besöket. */
const EVENT_NAMES = new Set([
  'Prövning öppnad',
  'Till anmälan',
  'Prövning sparad',
  'Bevakning skapad',
  'Kalenderfil hämtad',
  'AI-fråga ställd',
]);

/**
 * Flikarna, som sidvägar: /discover, /ai, /exams …
 *
 * Två bokstäver är minimum, inte tre: fliken AI-prövning heter `/ai`, och en
 * gräns på tre tappade varenda sidvisning därifrån — tyst, eftersom appen med
 * flit aldrig låtsas om att ett mätanrop misslyckats.
 */
const PATH = /^\/[a-z]{2,16}$/;

/** En händelse är några hundra tecken. Allt större är inte appen. */
const MAX_BODY = 1024;

/** Hur länge summorna ligger kvar hos räknaren. Repot är arkivet, inte den här. */
const DEFAULT_RETENTION_DAYS = 90;

const DEFAULT_ORIGINS = 'https://xn--prvningar-17a.se,http://localhost:5173,http://localhost:4173';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') return preflight(request, env);
    if (request.method === 'POST' && url.pathname === '/e') return collect(request, env);
    if (request.method === 'GET' && url.pathname === '/export') return exportSums(request, env);

    return new Response('Prövningar – räknare\n', { status: 404 });
  },
};

/* -------------------------------------------------------------- insamling */

async function collect(request, env) {
  const origin = request.headers.get('Origin') ?? '';
  if (!isAllowed(origin, env)) return new Response(null, { status: 403 });

  const raw = await request.text();
  if (raw.length > MAX_BODY) return new Response(null, { status: 413 });

  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response(null, { status: 400, headers: cors(origin) });
  }

  const row = readEvent(body);
  if (!row) return new Response(null, { status: 400, headers: cors(origin) });

  // En rad per dygn, händelse och etikett — inte en rad per besökare. Tabellen
  // växer med utbudet, inte med trafiken, och det finns ingen historik att
  // spåra en enskild person i ens om någon ville.
  await env.STATS.prepare(
    `INSERT INTO events (day, site, kind, name, label, n) VALUES (?, ?, ?, ?, ?, 1)
     ON CONFLICT(day, site, kind, name, label) DO UPDATE SET n = n + 1`,
  )
    .bind(today(), row.site, row.kind, row.name, row.label)
    .run();

  return new Response(null, { status: 204, headers: cors(origin) });
}

/**
 * Läser en inkommande händelse, eller `null` om den inte är något appen
 * skickar. Ingen del av svaret säger *vad* som var fel: en räknare ska inte
 * vara ett verktyg för att lista ut vad den tar emot.
 */
function readEvent(body) {
  if (!body || typeof body !== 'object' || body.v !== 1) return null;

  const site = short(body.site) || 'provningar';
  const kind = body.k;
  const name = typeof body.n === 'string' ? body.n.trim() : '';

  if (kind === 'visit') return { site, kind, name: 'besök', label: '' };
  if (kind === 'pageview') {
    return PATH.test(name) ? { site, kind, name, label: '' } : null;
  }
  if (kind === 'event') {
    if (!EVENT_NAMES.has(name)) return null;
    return { site, kind, name, label: label(body.p) };
  }
  return null;
}

/**
 * Händelsens egenskaper som en stabil etikett: nycklarna sorterade, värdena
 * kapade, högst sex fält. Sorteringen är inte kosmetik — den är det som gör
 * "Örebro + Matematik" till samma rad varje gång i stället för till två.
 */
function label(props) {
  if (!props || typeof props !== 'object' || Array.isArray(props)) return '';
  const clean = {};
  for (const key of Object.keys(props).sort()) {
    if (Object.keys(clean).length >= 6) break;
    const value = props[key];
    if (typeof value === 'number' && Number.isFinite(value)) clean[short(key)] = value;
    else if (typeof value === 'boolean') clean[short(key)] = value;
    else if (typeof value === 'string' && value.trim()) clean[short(key)] = short(value);
  }
  return Object.keys(clean).length ? JSON.stringify(clean) : '';
}

function short(value) {
  return typeof value === 'string' ? value.trim().slice(0, 48) : '';
}

/**
 * Dygnet enligt svensk tid, inte UTC.
 *
 * Skillnaden är två timmar på sommaren, och de två timmarna är kvällen —
 * exakt när någon sitter och letar prövningar. Ett dygnsbyte kl. 02 flyttar
 * tisdagskvällen till onsdagen i tabellen, vilket gör varje jämförelse mellan
 * veckodagar fel.
 */
function today() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date());
}

/* ----------------------------------------------------------------- export */

async function exportSums(request, env) {
  // EXPORT_TOKEN är valfri, och det är ett medvetet val. Summorna den lämnar
  // ut är exakt de siffror som ändå publiceras öppet i repots stats/ — det
  // finns ingenting här att skydda som inte redan är läsbart för vem som
  // helst. Är token satt krävs den; är den inte satt är exporten öppen, och
  // hela uppsättningen går då att klicka sig igenom i Cloudflares dashboard
  // utan en enda hemlighet att hantera.
  //
  // Insamlingen är en annan sak: den skriver, och den är alltid begränsad till
  // sajtens egen Origin.
  const required = env.EXPORT_TOKEN ?? '';
  if (required) {
    const auth = request.headers.get('Authorization') ?? '';
    const expected = `Bearer ${required}`;
    if (auth.length !== expected.length || auth !== expected) {
      return new Response(null, { status: 401 });
    }
  }

  // Gallringen hör hemma här, inte i ett städjobb någon glömmer att köra:
  // räknaren håller de senaste månaderna, repot håller historiken.
  const days = Number(env.RETENTION_DAYS ?? DEFAULT_RETENTION_DAYS);
  await env.STATS.prepare('DELETE FROM events WHERE day < ?').bind(daysAgo(days)).run();

  const since = new URL(request.url).searchParams.get('since') ?? '0000-00-00';
  const { results } = await env.STATS.prepare(
    'SELECT day, site, kind, name, label, n FROM events WHERE day >= ? ORDER BY day, kind, name',
  )
    .bind(since)
    .all();

  return Response.json({ generatedAt: new Date().toISOString(), rows: results ?? [] });
}

function daysAgo(days) {
  const date = new Date(Date.now() - days * 86_400_000);
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(date);
}

/* ------------------------------------------------------------------- cors */

function allowedOrigins(env) {
  return (env.ALLOWED_ORIGINS ?? DEFAULT_ORIGINS)
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

/**
 * Origin-kontrollen stoppar inte en beslutsam förfalskare — vem som helst kan
 * sätta huvudet med curl. Den stoppar det den kan stoppa: en annan webbplats
 * som lägger in räknarens adress och får sina besökare att räknas som våra.
 */
function isAllowed(origin, env) {
  return origin !== '' && allowedOrigins(env).includes(origin);
}

function cors(origin) {
  return {
    'access-control-allow-origin': origin,
    'access-control-max-age': '86400',
    vary: 'Origin',
  };
}

function preflight(request, env) {
  const origin = request.headers.get('Origin') ?? '';
  if (!isAllowed(origin, env)) return new Response(null, { status: 403 });
  return new Response(null, {
    status: 204,
    headers: { ...cors(origin), 'access-control-allow-methods': 'POST, OPTIONS' },
  });
}
