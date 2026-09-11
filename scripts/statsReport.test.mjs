import { describe, it, expect } from 'vitest';
import { emptyUsage, lastDays, mergeExport, renderReport } from './statsReport.mjs';

const row = (day, kind, name, label = '', n = 1) => ({
  day,
  site: 'provningar',
  kind,
  name,
  label,
  n,
});

const EXPORT = {
  generatedAt: '2026-09-12T03:17:00.000Z',
  rows: [
    row('2026-09-11', 'visit', 'besök', '', 42),
    row('2026-09-11', 'pageview', '/discover', '', 80),
    row('2026-09-11', 'pageview', '/ai', '', 12),
    row('2026-09-11', 'event', 'Till anmälan', '{"kommun":"Örebro","kurskod":"MATMAT02b"}', 5),
    row('2026-09-11', 'event', 'Prövning öppnad', '{"kommun":"Örebro","ämne":"Matematik"}', 9),
    row('2026-09-11', 'event', 'Prövning öppnad', '{"kommun":"Göteborg","ämne":"Matematik"}', 4),
  ],
};

describe('mergeExport', () => {
  it('summerar ett dygn ur räknarens rader', () => {
    const usage = mergeExport(emptyUsage(), EXPORT);
    expect(usage.dagar['2026-09-11']).toMatchObject({
      besök: 42,
      sidvisningar: { '/discover': 80, '/ai': 12 },
      händelser: { 'Till anmälan': 5, 'Prövning öppnad': 13 },
      kommuner: { Örebro: 14, Göteborg: 4 },
      ämnen: { Matematik: 13 },
      kurser: { MATMAT02b: 5 },
    });
  });

  /**
   * Jobbet går varje natt och exporten bär hela dygnets summa, inte tillägget
   * sedan sist. Kör den två gånger — eller efter en natt då den inte kördes —
   * och filen ska se likadan ut.
   */
  it('ger samma fil när samma export körs två gånger', () => {
    const once = mergeExport(emptyUsage(), EXPORT);
    const twice = mergeExport(once, EXPORT);
    expect(twice.dagar).toEqual(once.dagar);
  });

  it('rör inte dygn som exporten inte nämner', () => {
    const gammalt = { uppdaterad: null, dagar: { '2026-01-01': { besök: 7 } } };
    const usage = mergeExport(gammalt, EXPORT);
    expect(usage.dagar['2026-01-01']).toEqual({ besök: 7 });
    expect(usage.dagar['2026-09-11'].besök).toBe(42);
  });

  it('håller dygnen i ordning', () => {
    const usage = mergeExport(emptyUsage(), {
      rows: [row('2026-09-11', 'visit', 'besök'), row('2026-09-09', 'visit', 'besök')],
    });
    expect(Object.keys(usage.dagar)).toEqual(['2026-09-09', '2026-09-11']);
  });

  it('överlever skräp i svaret', () => {
    expect(mergeExport(emptyUsage(), null).dagar).toEqual({});
    expect(mergeExport(emptyUsage(), { rows: 'nej' }).dagar).toEqual({});
    const trasig = mergeExport(emptyUsage(), {
      rows: [row('2026-09-11', 'event', 'Till anmälan', 'inte json', 3)],
    });
    // Etiketten går förlorad, händelsen räknas ändå.
    expect(trasig.dagar['2026-09-11']).toMatchObject({
      händelser: { 'Till anmälan': 3 },
      kommuner: {},
    });
  });

  it('räknar inte en händelse appen inte skickar som en dimension', () => {
    const usage = mergeExport(emptyUsage(), {
      rows: [row('2026-09-11', 'event', 'Till anmälan', '{"kommun":""}', 2)],
    });
    expect(usage.dagar['2026-09-11'].kommuner).toEqual({});
  });
});

describe('lastDays', () => {
  it('tar med fönstrets båda ändar och inget utanför', () => {
    const usage = mergeExport(emptyUsage(), {
      rows: [
        row('2026-09-01', 'visit', 'besök'),
        row('2026-09-05', 'visit', 'besök'),
        row('2026-09-10', 'visit', 'besök'),
      ],
    });
    expect(lastDays(usage, '2026-09-10', 6).map((d) => d.day)).toEqual([
      '2026-09-05',
      '2026-09-10',
    ]);
  });
});

describe('renderReport', () => {
  it('skriver en sida GitHub kan visa', () => {
    const md = renderReport(mergeExport(emptyUsage(), EXPORT), '2026-09-12');
    expect(md).toContain('# Statistik');
    expect(md).toContain('| 42 | 92 | 5 |'); // besök, sidvisningar, till anmälan
    expect(md).toContain('| Upptäck | 80 |'); // flikens namn, inte /discover
    expect(md).toContain('| Örebro | 14 |');
    expect(md).toContain('Uppdaterad 2026-09-12T03:17:00.000Z');
  });

  it('säger att det är tomt i stället för att visa tomma tabeller', () => {
    const md = renderReport(emptyUsage(), '2026-09-12');
    expect(md).toContain('Ingen data än');
    expect(md).not.toContain('| Dygn |');
  });

  /** Löftet i samtyckesrutan ska stå kvar även här, där siffrorna hamnar. */
  it('skriver ut vad som inte mäts', () => {
    const md = renderReport(mergeExport(emptyUsage(), EXPORT), '2026-09-12');
    expect(md).toContain('Inga besökar-id');
    expect(md).toContain('samtyckesruta');
  });
});
