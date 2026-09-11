import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  CONSENT_KEY,
  CONSENT_VERSION,
  clearConsent,
  getConsent,
  hasAnalyticsConsent,
  refreshConsent,
  setConsent,
  subscribeConsent,
} from './consent';

/**
 * Samtycket är det enda i appen som avgör om något lämnar användarens enhet,
 * så det som testas här är inte att rutan renderar — det är att svaret håller:
 * före valet är svaret nej, ett nej sparas lika bestämt som ett ja, och en
 * webbläsare som säger ifrån för användarens räkning får sista ordet.
 */

beforeEach(() => {
  window.localStorage.clear();
  refreshConsent();
});

afterEach(() => {
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

describe('consent', () => {
  it('börjar obesvarat, och obesvarat betyder nej', () => {
    expect(getConsent().choice).toBe('undecided');
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it('sparar ett ja så att nästa besök slipper frågan', () => {
    setConsent(true);
    expect(hasAnalyticsConsent()).toBe(true);

    const stored = JSON.parse(window.localStorage.getItem(CONSENT_KEY)!);
    expect(stored.analytics).toBe(true);
    expect(stored.version).toBe(CONSENT_VERSION);

    // Ny sidladdning: samma svar, utan att frågan ställs igen.
    refreshConsent();
    expect(getConsent().choice).toBe('granted');
  });

  it('sparar ett nej lika bestämt som ett ja', () => {
    setConsent(false);
    refreshConsent();
    expect(getConsent().choice).toBe('denied');
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it('ställer frågan igen när det som mäts har ändrats', () => {
    window.localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ version: CONSENT_VERSION + 1, analytics: true, decidedAt: '2026-01-01' }),
    );
    refreshConsent();
    // Ett ja till en annan fråga är inget ja till den vi ställer nu.
    expect(getConsent().choice).toBe('undecided');
  });

  it('ställer frågan igen när raden är skräp', () => {
    window.localStorage.setItem(CONSENT_KEY, 'inte json');
    refreshConsent();
    expect(getConsent().choice).toBe('undecided');
  });

  it('låter användaren ångra sig', () => {
    setConsent(true);
    clearConsent();
    expect(getConsent().choice).toBe('undecided');
    expect(window.localStorage.getItem(CONSENT_KEY)).toBeNull();
  });

  it('säger till när valet inte gick att spara', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const state = setConsent(true);
    // Valet gäller fliken — men appen påstår inte att det överlevt.
    expect(state.choice).toBe('granted');
    expect(state.ephemeral).toBe(true);
  });

  /**
   * GPC är webbläsarens sätt att svara åt användaren. Att ändå visa rutan vore
   * att fråga tills man får rätt svar.
   */
  it('respekterar webbläsarens integritetssignal och frågar inte', () => {
    vi.stubGlobal('navigator', { ...navigator, globalPrivacyControl: true });
    refreshConsent();
    expect(getConsent()).toMatchObject({ choice: 'denied', source: 'signal' });
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it('respekterar Do Not Track på samma sätt', () => {
    vi.stubGlobal('navigator', { ...navigator, doNotTrack: '1' });
    refreshConsent();
    expect(getConsent().choice).toBe('denied');
  });

  it('talar om för sina lyssnare att valet ändrats', () => {
    const seen: string[] = [];
    const stop = subscribeConsent(() => seen.push(getConsent().choice));
    setConsent(true);
    setConsent(false);
    stop();
    setConsent(true);
    expect(seen).toEqual(['granted', 'denied']);
  });

  it('ger samma objekt tillbaka tills något ändras', () => {
    // useSyncExternalStore jämför med Object.is och renderar i evig loop annars.
    expect(getConsent()).toBe(getConsent());
    const before = getConsent();
    setConsent(true);
    expect(getConsent()).not.toBe(before);
  });
});
