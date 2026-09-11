import { describe, it, expect } from 'vitest';
import {
  DEFAULT_SITE,
  EVENT_NAMES,
  endpointPayload,
  providerArgs,
  providerGlobal,
  readAnalyticsConfig,
  sanitizeProps,
  scriptAttributes,
} from './analyticsCore';

const PLAUSIBLE = {
  VITE_ANALYTICS_PROVIDER: 'plausible',
  VITE_ANALYTICS_SRC: 'https://plausible.io/js/script.manual.js',
  VITE_ANALYTICS_SITE: 'xn--prvningar-z2a.se',
};

const ENDPOINT = {
  VITE_ANALYTICS_PROVIDER: 'endpoint',
  VITE_ANALYTICS_SRC: 'https://provningar-stats.exempel.workers.dev/e',
  VITE_ANALYTICS_SITE: 'provningar',
};

const UMAMI = {
  VITE_ANALYTICS_PROVIDER: 'umami',
  VITE_ANALYTICS_SRC: 'https://cloud.umami.is/script.js',
  VITE_ANALYTICS_SITE: '0e5f1a2b-0000-4000-8000-abcdefabcdef',
};

describe('readAnalyticsConfig', () => {
  it('läser en komplett konfiguration', () => {
    expect(readAnalyticsConfig(PLAUSIBLE)).toEqual({
      provider: 'plausible',
      src: 'https://plausible.io/js/script.manual.js',
      site: 'xn--prvningar-z2a.se',
    });
  });

  /** Det normala läget: appen byggs utan variabler och mäter då ingenting. */
  it('är avstängd när bygget saknar variabler', () => {
    expect(readAnalyticsConfig({})).toBeNull();
    expect(readAnalyticsConfig({ VITE_ANALYTICS_PROVIDER: '', VITE_ANALYTICS_SRC: '' })).toBeNull();
  });

  it('vägrar en halv konfiguration', () => {
    expect(readAnalyticsConfig({ ...PLAUSIBLE, VITE_ANALYTICS_SITE: '  ' })).toBeNull();
    expect(readAnalyticsConfig({ ...PLAUSIBLE, VITE_ANALYTICS_SRC: '' })).toBeNull();
    expect(readAnalyticsConfig({ ...PLAUSIBLE, VITE_ANALYTICS_PROVIDER: 'ga4' })).toBeNull();
  });

  /** En nedgradering till http är inget vi gör åt användaren. */
  it('vägrar en skript-URL som inte är https', () => {
    expect(
      readAnalyticsConfig({ ...PLAUSIBLE, VITE_ANALYTICS_SRC: 'http://plausible.io/js/x.js' }),
    ).toBeNull();
    expect(readAnalyticsConfig({ ...PLAUSIBLE, VITE_ANALYTICS_SRC: 'inte en url' })).toBeNull();
  });

  /** Undantaget som gör räknaren testbar innan den finns på riktigt. */
  it('släpper igenom http mot den egna maskinen', () => {
    expect(
      readAnalyticsConfig({ ...ENDPOINT, VITE_ANALYTICS_SRC: 'http://localhost:8787/e' })?.src,
    ).toBe('http://localhost:8787/e');
    expect(
      readAnalyticsConfig({ ...ENDPOINT, VITE_ANALYTICS_SRC: 'http://127.0.0.1:8787/e' })?.src,
    ).toBe('http://127.0.0.1:8787/e');
    expect(
      readAnalyticsConfig({ ...ENDPOINT, VITE_ANALYTICS_SRC: 'http://räknaren.example/e' }),
    ).toBeNull();
  });

  describe('den egna räknaren', () => {
    it('klarar sig utan sajtnamn, till skillnad från de andra', () => {
      expect(readAnalyticsConfig({ ...ENDPOINT, VITE_ANALYTICS_SITE: '' })).toEqual({
        provider: 'endpoint',
        src: ENDPOINT.VITE_ANALYTICS_SRC,
        site: DEFAULT_SITE,
      });
      expect(readAnalyticsConfig({ ...PLAUSIBLE, VITE_ANALYTICS_SITE: '' })).toBeNull();
    });

    it('laddar inget skript och har ingen global att ropa på', () => {
      expect(scriptAttributes(readAnalyticsConfig(ENDPOINT)!)).toBeNull();
      expect(providerGlobal('endpoint')).toBeNull();
    });

    it('skickar besök, sidvisning och händelse som räknaren vill ha dem', () => {
      const config = readAnalyticsConfig(ENDPOINT)!;
      expect(JSON.parse(endpointPayload(config, { kind: 'visit' }))).toEqual({
        v: 1,
        site: 'provningar',
        k: 'visit',
      });
      expect(
        JSON.parse(endpointPayload(config, { kind: 'pageview', path: '/ai', title: 'AI' })),
      ).toEqual({ v: 1, site: 'provningar', k: 'pageview', n: '/ai' });
      expect(
        JSON.parse(
          endpointPayload(config, {
            kind: 'event',
            name: 'Till anmälan',
            props: { kommun: 'Örebro' },
          }),
        ),
      ).toEqual({
        v: 1,
        site: 'provningar',
        k: 'event',
        n: 'Till anmälan',
        p: { kommun: 'Örebro' },
      });
    });

    /** Besöket är vårt begrepp; de andra räknar besök själva ur sidvisningarna. */
    it('skickar aldrig besöket till Plausible eller Umami', () => {
      expect(providerArgs(readAnalyticsConfig(PLAUSIBLE)!, { kind: 'visit' }, 'https://x')).toEqual(
        [],
      );
      expect(providerArgs(readAnalyticsConfig(UMAMI)!, { kind: 'visit' }, 'https://x')).toEqual([]);
    });
  });

  it('bryr sig inte om versaler eller blanksteg', () => {
    expect(readAnalyticsConfig({ ...UMAMI, VITE_ANALYTICS_PROVIDER: ' Umami ' })?.provider).toBe(
      'umami',
    );
  });
});

describe('scriptAttributes', () => {
  it('ger Plausible sin domän', () => {
    expect(scriptAttributes(readAnalyticsConfig(PLAUSIBLE)!)).toMatchObject({
      'data-domain': 'xn--prvningar-z2a.se',
    });
  });

  /**
   * Appen har en URL och sex flikar. Leverantörens automatik ser ett besök och
   * inget mer, medan flikbytena — det användaren gör — aldrig syns. Därför
   * skickas de för hand, och automatiken måste vara avstängd för att inte
   * dubbelräkna det första besöket.
   */
  it('stänger av Umamis egen sidräkning', () => {
    expect(scriptAttributes(readAnalyticsConfig(UMAMI)!)).toMatchObject({
      'data-auto-track': 'false',
      'data-website-id': UMAMI.VITE_ANALYTICS_SITE,
    });
  });
});

describe('providerArgs', () => {
  const plausible = readAnalyticsConfig(PLAUSIBLE)!;
  const umami = readAnalyticsConfig(UMAMI)!;
  const origin = 'https://xn--prvningar-z2a.se';

  it('skickar en flik som en sidvisning hos Plausible', () => {
    expect(
      providerArgs(plausible, { kind: 'pageview', path: '/ai', title: 'AI-prövning' }, origin),
    ).toEqual(['pageview', { u: 'https://xn--prvningar-z2a.se/ai' }]);
  });

  it('skickar en flik som en sidvisning hos Umami', () => {
    expect(
      providerArgs(umami, { kind: 'pageview', path: '/ai', title: 'AI-prövning' }, origin),
    ).toEqual([{ url: '/ai', title: 'AI-prövning' }]);
  });

  it('skickar en händelse i respektive leverantörs form', () => {
    const call = { kind: 'event', name: 'Till anmälan', props: { kommun: 'Örebro' } } as const;
    expect(providerArgs(plausible, call, origin)).toEqual([
      'Till anmälan',
      { props: { kommun: 'Örebro' } },
    ]);
    expect(providerArgs(umami, call, origin)).toEqual(['Till anmälan', { kommun: 'Örebro' }]);
  });

  it('namnger rätt globalt objekt', () => {
    expect(providerGlobal('plausible')).toBe('plausible');
    expect(providerGlobal('umami')).toBe('umami');
  });
});

describe('sanitizeProps', () => {
  it('släpper igenom det en rapport kan visa', () => {
    expect(sanitizeProps({ kommun: 'Örebro', träffar: 3, öppen: true })).toEqual({
      kommun: 'Örebro',
      träffar: 3,
      öppen: true,
    });
  });

  it('kapar långa strängar och kastar tomma', () => {
    const long = 'a'.repeat(120);
    expect(sanitizeProps({ x: long })!.x).toHaveLength(48);
    expect(sanitizeProps({ x: '   ' })).toBeUndefined();
  });

  it('kastar det som inte är ett värde', () => {
    expect(sanitizeProps({ a: undefined, b: null, c: { djupt: 1 }, d: NaN })).toBeUndefined();
  });

  it('släpper aldrig igenom mer än en handfull fält', () => {
    const many = Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`f${i}`, i]));
    expect(Object.keys(sanitizeProps(many)!).length).toBeLessThanOrEqual(6);
  });
});

describe('händelselistan', () => {
  /**
   * Listan är samtyckesrutans löfte i kodform: sex händelser, alla på svenska,
   * ingen av dem ett fält användaren skrivit i. Växer den utan att panelen och
   * README växer med, har appen börjat mäta något den inte frågat om.
   */
  it('är sluten, unik och läsbar', () => {
    expect(EVENT_NAMES).toHaveLength(6);
    expect(new Set(EVENT_NAMES).size).toBe(EVENT_NAMES.length);
    for (const name of EVENT_NAMES) expect(name.trim()).toBe(name);
  });
});
