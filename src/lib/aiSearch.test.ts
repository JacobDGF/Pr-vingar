import { describe, it, expect } from 'vitest';
import { interpret, rank, toContext } from './aiSearch';
import { EXAMS } from '../data/exams';
import { Exam } from '../types';

/**
 * The matcher is what answers when there is no API key, no network, or a
 * rejected one — which is the default state of the tab. It is also the only
 * thing standing between the model and a question it could otherwise answer
 * from memory, so what it selects is a correctness concern, not a nicety.
 *
 * The tests run against the real dataset on purpose. A synthetic fixture would
 * pass while "Matte 2b" quietly stopped finding "Matematik 2b" in the data
 * users actually search.
 */

const AUG = new Date('2026-08-27T12:00:00Z');

describe('interpret', () => {
  it('reads city, course and deadline out of a whole sentence', () => {
    const read = interpret(
      'jag bor i Göteborg och vill höja mitt betyg i Matte 2b innan december',
      EXAMS,
      AUG,
    );
    expect(read.cities).toContain('Göteborg');
    expect(read.courses).toContain('Matematik 2b');
    expect(read.before).toBe('2026-12-31');
  });

  it('resolves a named month forward, never into a month that has ended', () => {
    // Asked in August, "innan mars" cannot mean March that has already gone.
    expect(interpret('klart innan mars', EXAMS, AUG).before).toBe('2027-03-31');
    expect(interpret('klart innan oktober', EXAMS, AUG).before).toBe('2026-10-31');
  });

  it('reads a day-and-month deadline', () => {
    expect(interpret('jag behöver betyget före 15 oktober', EXAMS, AUG).before).toBe('2026-10-15');
  });

  it('hears a question about booking today', () => {
    expect(interpret('kan jag fortfarande anmäla mig till svenska 3?', EXAMS, AUG).openOnly).toBe(
      true,
    );
    expect(interpret('vad kostar en prövning i svenska 3?', EXAMS, AUG).openOnly).toBe(false);
  });

  it('finds nothing in a question that names nothing', () => {
    const read = interpret('hej vad kan du hjälpa mig med', EXAMS, AUG);
    expect(read.cities).toEqual([]);
    expect(read.courses).toEqual([]);
    expect(read.before).toBeNull();
  });
});

describe('rank', () => {
  it('puts the asked-for course in the asked-for city first', () => {
    const top = rank('jag bor i Göteborg och vill höja Matte 2b', EXAMS, AUG)[0].exam;
    expect(top.city).toBe('Göteborg');
    expect(top.course).toBe('Matematik 2b');
  });

  it('keeps the subject when the exact course is not named', () => {
    const hits = rank('finns det prövning i kemi i Göteborg?', EXAMS, AUG);
    const kemiInGbg = hits.filter((m) => m.exam.subject === 'Kemi' && m.exam.city === 'Göteborg');
    expect(kemiInGbg.length).toBeGreaterThan(0);
    // Right subject in the right city outranks everything else. The list does
    // not stop there — kemi elsewhere, and Göteborg in another subject, are
    // both more useful things to show than an empty screen, so they follow.
    expect(hits.slice(0, kemiInGbg.length)).toEqual(kemiInGbg);
  });

  /**
   * The one filter the matcher is allowed to apply, because the user asked a
   * yes/no question and a closed listing is a "no" dressed as a result.
   */
  it('returns only bookable rounds when asked what is still open', () => {
    const hits = rank(
      'vilka prövningar i svenska kan jag fortfarande anmäla mig till?',
      EXAMS,
      AUG,
    );
    expect(hits.length).toBeGreaterThan(0);
    for (const { exam } of hits) {
      expect(exam.nextPeriod.full).not.toBe(true);
      expect(exam.nextPeriod.confirmed).toBe(true);
    }
  });

  it('answers a question that names nothing with the whole dataset, soonest first', () => {
    const hits = rank('hjälp mig komma igång', EXAMS, AUG);
    expect(hits).toHaveLength(EXAMS.length);
  });

  it('never invents a listing — every hit is one of ours', () => {
    const ids = new Set(EXAMS.map((e) => e.id));
    for (const { exam } of rank('matematik i Stockholm innan december', EXAMS, AUG)) {
      expect(ids.has(exam.id)).toBe(true);
    }
  });
});

describe('toContext', () => {
  it('carries a source URL on every row it hands the model', () => {
    for (const exam of EXAMS) {
      const row = toContext(exam);
      expect(row.kalla_url).toMatch(/^https:/);
      expect(row.anmalan_url).toMatch(/^https:/);
    }
  });

  /**
   * The rule the whole feature rests on: an unconfirmed period must reach the
   * model as `null`, not as a date it can round off into a sentence. A model
   * given `sista_anmalan: "2026-09-15"` will tell somebody to apply by the
   * 15th, and they will plan a term around it.
   */
  it('sends null rather than a date for an unconfirmed period', () => {
    const unconfirmed = EXAMS.filter((e) => !e.nextPeriod.confirmed);
    expect(unconfirmed.length).toBeGreaterThan(0);
    for (const exam of unconfirmed) {
      const row = toContext(exam);
      expect(row.anmalan_oppnar).toBeNull();
      expect(row.sista_anmalan).toBeNull();
      expect(row.provdatum).toBeNull();
    }
  });

  it('passes a confirmed period through unchanged', () => {
    const dated = EXAMS.find((e) => e.nextPeriod.confirmed && e.nextPeriod.applicationEnd) as Exam;
    expect(toContext(dated).sista_anmalan).toBe(dated.nextPeriod.applicationEnd);
  });

  it('marks a fully booked round as such', () => {
    const full = EXAMS.filter((e) => e.nextPeriod.full);
    expect(full.length).toBeGreaterThan(0);
    for (const exam of full) {
      expect(toContext(exam).fullbokat).toBe(true);
      expect(toContext(exam).anmalan_oppen_idag).toBe(false);
    }
  });
});
