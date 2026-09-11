import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import worker from './worker.js';

/**
 * Räknaren är gränsen mot internet: den ska ta emot det appen skickar och
 * ingenting annat. Testet kör den mot en påhittad D1, så det som bevisas är
 * kontrollerna — inte att SQLite fungerar.
 */

const ORIGIN = 'https://xn--prvningar-17a.se';

function fakeDb() {
  const writes = [];
  const rows = [];
  return {
    writes,
    rows,
    prepare(sql) {
      return {
        bind(...args) {
          return {
            async run() {
              writes.push({ sql, args });
            },
            async all() {
              return { results: rows };
            },
          };
        },
      };
    },
  };
}

function env(extra = {}) {
  return { STATS: fakeDb(), EXPORT_TOKEN: 'hemlig', ALLOWED_ORIGINS: ORIGIN, ...extra };
}

function post(body, { origin = ORIGIN } = {}) {
  return new Request('https://räknaren.test/e', {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'text/plain;charset=UTF-8' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

const EVENT = {
  v: 1,
  site: 'provningar',
  k: 'event',
  n: 'Till anmälan',
  p: { kommun: 'Örebro', kurskod: 'MATMAT02b' },
};

beforeEach(() => {
  vi.useFakeTimers();
  // 23:30 svensk sommartid = 21:30 UTC. Dygnet ska bli den 11:e, inte den 12:e.
  vi.setSystemTime(new Date('2026-09-11T21:30:00Z'));
});

afterEach(() => vi.useRealTimers());

describe('insamling', () => {
  it('räknar upp en händelse appen skickar', async () => {
    const e = env();
    const response = await worker.fetch(post(EVENT), e);

    expect(response.status).toBe(204);
    expect(response.headers.get('access-control-allow-origin')).toBe(ORIGIN);
    expect(e.STATS.writes).toHaveLength(1);
    const [day, site, kind, name, label] = e.STATS.writes[0].args;
    expect({ day, site, kind, name }).toEqual({
      day: '2026-09-11',
      site: 'provningar',
      kind: 'event',
      name: 'Till anmälan',
    });
    // Nycklarna sorterade, så samma händelse alltid blir samma rad.
    expect(label).toBe('{"kommun":"Örebro","kurskod":"MATMAT02b"}');
  });

  it('räknar ett besök och en sidvisning', async () => {
    const e = env();
    await worker.fetch(post({ v: 1, k: 'visit' }), e);
    await worker.fetch(post({ v: 1, k: 'pageview', n: '/discover' }), e);
    expect(e.STATS.writes.map((w) => w.args[3])).toEqual(['besök', '/discover']);
  });

  /**
   * Alla sex flikarna, med `/ai` först: den är två bokstäver lång, och en
   * gräns på tre tappade varenda sidvisning från AI-prövning utan att något
   * syntes någonstans. Hittades i en genomkörning i webbläsaren, inte här.
   */
  it('tar emot varje fliks egen sidväg', async () => {
    const e = env();
    const tabs = ['/ai', '/discover', '/exams', '/community', '/history', '/profile'];
    for (const n of tabs) {
      expect((await worker.fetch(post({ v: 1, k: 'pageview', n }), e)).status).toBe(204);
    }
    expect(e.STATS.writes.map((w) => w.args[3])).toEqual(tabs);
  });

  /** Listan i workern är en kopia av appens med flit: den här änden litar inte. */
  it('tar inte emot ett händelsenamn appen inte har', async () => {
    const e = env();
    const response = await worker.fetch(post({ ...EVENT, n: 'Egen mätning' }), e);
    expect(response.status).toBe(400);
    expect(e.STATS.writes).toEqual([]);
  });

  it('tar inte emot en sidväg som inte är en flik', async () => {
    const e = env();
    for (const n of ['/Discover', '/../etc', 'discover', '/a', '/' + 'x'.repeat(20)]) {
      expect((await worker.fetch(post({ v: 1, k: 'pageview', n }), e)).status).toBe(400);
    }
    expect(e.STATS.writes).toEqual([]);
  });

  it('tar inte emot fritext som egenskap', async () => {
    const e = env();
    await worker.fetch(post({ ...EVENT, p: { fråga: 'x'.repeat(400), kommun: 'Örebro' } }), e);
    const label = JSON.parse(e.STATS.writes[0].args[4]);
    // Kapad, inte vidarebefordrad i sin helhet — och aldrig fler än sex fält.
    expect(label.fråga).toHaveLength(48);
    expect(Object.keys(label).length).toBeLessThanOrEqual(6);
  });

  it('avvisar en annan webbplats som vill räknas som oss', async () => {
    const e = env();
    const response = await worker.fetch(post(EVENT, { origin: 'https://kopian.example' }), e);
    expect(response.status).toBe(403);
    expect(e.STATS.writes).toEqual([]);
  });

  it('avvisar kroppar som inte är en händelse', async () => {
    const e = env();
    for (const body of ['inte json', JSON.stringify({ v: 2, k: 'visit' }), 'x'.repeat(2000)]) {
      const status = (await worker.fetch(post(body), e)).status;
      expect([400, 413]).toContain(status);
    }
    expect(e.STATS.writes).toEqual([]);
  });

  it('svarar på preflight bara för sajten själv', async () => {
    const e = env();
    const ok = new Request('https://räknaren.test/e', {
      method: 'OPTIONS',
      headers: { Origin: ORIGIN },
    });
    expect((await worker.fetch(ok, e)).status).toBe(204);

    const nej = new Request('https://räknaren.test/e', {
      method: 'OPTIONS',
      headers: { Origin: 'https://kopian.example' },
    });
    expect((await worker.fetch(nej, e)).status).toBe(403);
  });
});

describe('export', () => {
  const request = (token) =>
    new Request('https://räknaren.test/export?since=2026-09-01', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

  it('kräver rätt token', async () => {
    const e = env();
    expect((await worker.fetch(request(), e)).status).toBe(401);
    expect((await worker.fetch(request('fel'), e)).status).toBe(401);
    expect((await worker.fetch(request('hemlig'), e)).status).toBe(200);
  });

  /**
   * Utan token är exporten öppen — med flit. Den lämnar ut samma summor som
   * ändå publiceras i repots stats/, så det finns ingenting att skydda; och
   * utan hemlighet går uppsättningen att klicka sig igenom i dashboarden.
   * Insamlingen är fortfarande stängd för alla utom sajtens egen Origin.
   */
  it('är öppen när ingen token är satt, och stängd så fort en är det', async () => {
    const öppen = env({ EXPORT_TOKEN: undefined });
    expect((await worker.fetch(request(), öppen)).status).toBe(200);

    const stängd = env();
    expect((await worker.fetch(request(), stängd)).status).toBe(401);
    expect((await worker.fetch(request('hemlig'), stängd)).status).toBe(200);
  });

  it('tar fortfarande inte emot en insamling utan rätt Origin, token eller ej', async () => {
    const e = env({ EXPORT_TOKEN: undefined });
    const svar = await worker.fetch(post(EVENT, { origin: 'https://kopian.example' }), e);
    expect(svar.status).toBe(403);
  });

  it('gallrar gammalt och svarar med summorna', async () => {
    const e = env({ RETENTION_DAYS: '30' });
    e.STATS.rows.push({ day: '2026-09-11', kind: 'visit', name: 'besök', label: '', n: 3 });

    const body = await (await worker.fetch(request('hemlig'), e)).json();

    expect(body.rows).toHaveLength(1);
    const prune = e.STATS.writes.find((w) => w.sql.startsWith('DELETE'));
    expect(prune.args[0]).toBe('2026-08-12'); // 30 dygn före den 11 september
  });
});
