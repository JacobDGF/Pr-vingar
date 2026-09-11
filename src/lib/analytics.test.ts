import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Exam } from '../types';
import { EXAMS } from '../data/exams';

/**
 * Det enda löftet som spelar roll: ingenting lämnar enheten förrän någon sagt
 * ja, och det slutar lämna den i samma ögonblick som någon ångrar sig.
 *
 * Modulerna läser sin konfiguration och sitt samtycke när de laddas, så varje
 * test startar dem på nytt — annars provar man den förra testets app.
 */

const CONFIG = {
  VITE_ANALYTICS_PROVIDER: 'plausible',
  VITE_ANALYTICS_SRC: 'https://plausible.io/js/script.manual.js',
  VITE_ANALYTICS_SITE: 'provningar.test',
};

const EXAM: Exam = EXAMS[0];

/** Startar om analytics + consent med (eller utan) en konfiguration i bygget. */
async function boot(env: Record<string, string> = CONFIG) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);

  const consent = await import('./consent');
  const analytics = await import('./analytics');
  consent.refreshConsent();
  analytics.startAnalytics();
  return { consent, analytics };
}

function script(): HTMLElement | null {
  return document.getElementById('provningar-analytics');
}

/** Leverantörens skript, som det beter sig när det landat: en global funktion. */
function fakeProviderScript() {
  const calls: unknown[][] = [];
  (window as unknown as Record<string, unknown>).plausible = (...args: unknown[]) =>
    calls.push(args);
  return calls;
}

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  script()?.remove();
  delete (window as unknown as Record<string, unknown>).plausible;
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

describe('analytics', () => {
  it('laddar ingenting och skickar ingenting innan någon svarat', async () => {
    const { analytics } = await boot();
    const calls = fakeProviderScript();

    analytics.track.tabView('discover', 'Upptäck');
    analytics.track.examOpened(EXAM);
    analytics.track.registrationClicked(EXAM, true);

    expect(script()).toBeNull();
    expect(calls).toEqual([]);
  });

  it('laddar ingenting och skickar ingenting efter ett nej', async () => {
    const { analytics, consent } = await boot();
    const calls = fakeProviderScript();

    consent.setConsent(false);
    analytics.track.tabView('ai', 'AI-prövning');

    expect(script()).toBeNull();
    expect(calls).toEqual([]);
  });

  it('lägger skriptet på sidan först när svaret är ja', async () => {
    const { consent } = await boot();
    expect(script()).toBeNull();

    consent.setConsent(true);

    const el = script() as HTMLScriptElement;
    expect(el).not.toBeNull();
    expect(el.src).toBe(CONFIG.VITE_ANALYTICS_SRC);
    expect(el.getAttribute('data-domain')).toBe('provningar.test');
    expect(el.defer).toBe(true);
  });

  it('skickar flikbyten och händelser när samtycket finns', async () => {
    const { analytics, consent } = await boot();
    consent.setConsent(true);
    const calls = fakeProviderScript();

    analytics.track.tabView('exams', 'Mina prövningar');
    analytics.track.examOpened(EXAM);

    expect(calls[0][0]).toBe('pageview');
    expect(calls[0][1]).toMatchObject({ u: expect.stringContaining('/exams') });
    expect(calls[1][0]).toBe('Prövning öppnad');
    expect(calls[1][1]).toEqual({
      props: { kommun: EXAM.city, ämne: EXAM.subject, kurskod: EXAM.courseCode },
    });
  });

  /**
   * Skriptet är sällan framme när den första fliken visas. Kön finns för de
   * sekunderna, och bara för dem — den fylls aldrig innan ett ja.
   */
  it('håller anrop medan skriptet laddar, och släpper dem när det landat', async () => {
    const { analytics, consent } = await boot();
    consent.setConsent(true);

    analytics.track.examSaved(EXAM);
    const calls = fakeProviderScript();
    expect(calls).toEqual([]);

    script()!.dispatchEvent(new Event('load'));
    expect(calls.map((c) => c[0])).toContain('Prövning sparad');
  });

  /**
   * `applyConsent` körs två gånger på ett ja — en gång på valet, en gång när
   * skriptet landat. Sidvisningen ska ändå bara räknas en gång.
   */
  it('räknar den första sidvisningen exakt en gång', async () => {
    const { analytics, consent } = await boot();
    consent.setConsent(true);
    analytics.track.tabView('discover', 'Upptäck');

    const calls = fakeProviderScript();
    script()!.dispatchEvent(new Event('load'));

    expect(calls.filter((c) => c[0] === 'pageview')).toHaveLength(1);
  });

  it('räknar den flik användaren redan står på när ja:t kommer', async () => {
    const { analytics, consent } = await boot();
    analytics.track.tabView('community', 'Community');

    consent.setConsent(true);
    const calls = fakeProviderScript();
    script()!.dispatchEvent(new Event('load'));

    expect(calls[0][1]).toMatchObject({ u: expect.stringContaining('/community') });
  });

  it('plockar bort skriptet och tystnar när någon ångrar sig', async () => {
    const { analytics, consent } = await boot();
    consent.setConsent(true);
    const calls = fakeProviderScript();
    script()!.dispatchEvent(new Event('load'));
    calls.length = 0;

    consent.setConsent(false);

    expect(script()).toBeNull();
    // Den globala funktionen städas med: ett borttaget skript slutar inte av
    // sig självt att finnas i minnet.
    expect((window as unknown as Record<string, unknown>).plausible).toBeUndefined();

    analytics.track.tabView('profile', 'Profil');
    expect(calls).toEqual([]);
  });

  it('städar Umamis sessionsnyckel när samtycket dras tillbaka', async () => {
    const { consent } = await boot({
      VITE_ANALYTICS_PROVIDER: 'umami',
      VITE_ANALYTICS_SRC: 'https://cloud.umami.is/script.js',
      VITE_ANALYTICS_SITE: 'abc',
    });
    consent.setConsent(true);
    window.localStorage.setItem('umami.cache', 'x');
    window.localStorage.setItem('provningar-storage', 'behålls');

    consent.setConsent(false);

    expect(window.localStorage.getItem('umami.cache')).toBeNull();
    expect(window.localStorage.getItem('provningar-storage')).toBe('behålls');
  });

  it('gör ingenting alls i ett bygge utan leverantör — inte ens efter ett ja', async () => {
    const { analytics, consent } = await boot({
      VITE_ANALYTICS_PROVIDER: '',
      VITE_ANALYTICS_SRC: '',
      VITE_ANALYTICS_SITE: '',
    });
    const calls = fakeProviderScript();

    consent.setConsent(true);
    analytics.track.tabView('discover', 'Upptäck');

    expect(analytics.isAnalyticsConfigured()).toBe(false);
    expect(script()).toBeNull();
    expect(calls).toEqual([]);
  });

  it('svarar aldrig på webbläsarens integritetssignal med ett skript', async () => {
    vi.stubGlobal('navigator', { ...navigator, globalPrivacyControl: true });
    const { analytics } = await boot();
    const calls = fakeProviderScript();

    analytics.track.tabView('discover', 'Upptäck');

    expect(script()).toBeNull();
    expect(calls).toEqual([]);
  });

  /* ------------------------------------------------- appens egen räknare */

  describe('den egna räknaren', () => {
    const ENDPOINT = {
      VITE_ANALYTICS_PROVIDER: 'endpoint',
      VITE_ANALYTICS_SRC: 'https://provningar-stats.exempel.workers.dev/e',
      VITE_ANALYTICS_SITE: '',
    };

    /** Alla POST:ar räknaren fått, som tolkade objekt. */
    function captureFetch() {
      const sent: { url: string; body: unknown; init: RequestInit }[] = [];
      vi.stubGlobal(
        'fetch',
        vi.fn((url: string, init: RequestInit) => {
          sent.push({ url, body: JSON.parse(String(init.body)), init });
          return Promise.resolve(new Response(null, { status: 204 }));
        }),
      );
      return sent;
    }

    it('postar ingenting före ett ja, och laddar aldrig något skript', async () => {
      const { analytics } = await boot(ENDPOINT);
      const sent = captureFetch();

      analytics.track.visit();
      analytics.track.tabView('discover', 'Upptäck');
      analytics.track.examOpened(EXAM);

      expect(sent).toEqual([]);
      expect(script()).toBeNull();
    });

    it('postar besök, sidvisning och händelse efter ett ja', async () => {
      const { analytics, consent } = await boot(ENDPOINT);
      const sent = captureFetch();

      // Besöket räknas innan svaret finns — och ska då skickas när ja:t kommer.
      analytics.track.visit();
      consent.setConsent(true);

      analytics.track.tabView('ai', 'AI-prövning');
      analytics.track.registrationClicked(EXAM, true);

      // Besöket köades före valet och skickas när svaret kommer.
      expect(sent.map((s) => s.body)).toEqual([
        { v: 1, site: 'provningar', k: 'visit' },
        { v: 1, site: 'provningar', k: 'pageview', n: '/ai' },
        {
          v: 1,
          site: 'provningar',
          k: 'event',
          n: 'Till anmälan',
          p: { kommun: EXAM.city, kurskod: EXAM.courseCode, öppen: true },
        },
      ]);
      expect(sent[0].url).toBe(ENDPOINT.VITE_ANALYTICS_SRC);
      // Ingen preflight (text/plain) och anropet överlever att sidan lämnas.
      expect(sent[0].init.headers).toMatchObject({ 'Content-Type': 'text/plain;charset=UTF-8' });
      expect(sent[0].init).toMatchObject({ keepalive: true, credentials: 'omit' });
      expect(script()).toBeNull();
    });

    it('räknar besöket en gång per session, inte en gång per flikbyte', async () => {
      const { analytics, consent } = await boot(ENDPOINT);
      consent.setConsent(true);
      const sent = captureFetch();

      analytics.track.visit();
      analytics.track.visit();
      analytics.track.tabView('exams', 'Mina prövningar');

      expect(sent.filter((s) => (s.body as { k: string }).k === 'visit')).toHaveLength(1);
    });

    it('tystnar när samtycket dras tillbaka', async () => {
      const { analytics, consent } = await boot(ENDPOINT);
      consent.setConsent(true);
      const sent = captureFetch();
      consent.setConsent(false);

      analytics.track.tabView('profile', 'Profil');
      analytics.track.examSaved(EXAM);

      expect(sent).toEqual([]);
    });

    it('låter appen gå vidare även när räknaren är nere', async () => {
      const { analytics, consent } = await boot(ENDPOINT);
      vi.stubGlobal(
        'fetch',
        vi.fn(() => Promise.reject(new Error('offline'))),
      );
      consent.setConsent(true);
      expect(() => analytics.track.tabView('discover', 'Upptäck')).not.toThrow();
    });

    it('säger att statistiken är appens egen, för panelen', async () => {
      const { analytics } = await boot(ENDPOINT);
      expect(analytics.isSelfHostedAnalytics()).toBe(true);
      expect(analytics.analyticsProviderName()).toBe('Prövningars egen räknare');
      expect(analytics.analyticsHost()).toBe('provningar-stats.exempel.workers.dev');
    });
  });

  it('säger vem mätningen görs av, för panelen som ska berätta det', async () => {
    const { analytics } = await boot();
    expect(analytics.analyticsProviderName()).toBe('Plausible Analytics');
    expect(analytics.analyticsHost()).toBe('plausible.io');
  });

  /** Frågan användaren skrev är hens egen mening och lämnar aldrig enheten. */
  it('skickar utfallet av en AI-fråga, aldrig frågan', async () => {
    const { analytics, consent } = await boot();
    consent.setConsent(true);
    const calls = fakeProviderScript();
    script()!.dispatchEvent(new Event('load'));

    analytics.track.aiAsked({ hits: 4, widened: true, understood: true });

    expect(calls[calls.length - 1]).toEqual([
      'AI-fråga ställd',
      { props: { träffar: 4, vidgad: true, tolkad: true } },
    ]);
  });
});
