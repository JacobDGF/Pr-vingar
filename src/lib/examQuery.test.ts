import { describe, it, expect } from 'vitest';
import { EXAMS } from '../data/exams';
import { answerQuery, parseQuery } from './examQuery';

/**
 * These run against the real dataset, not fixtures.
 *
 * The parser's whole vocabulary is read out of `EXAMS` — every kommun, län,
 * kurs and kurskod it understands is one that is really listed. A fixture would
 * therefore test a vocabulary nobody has, and would keep passing on the day a
 * rename in the dataset stopped a real sentence from matching.
 */

const NOW = new Date('2026-08-27T09:00:00Z');

describe('parseQuery', () => {
  it('reads the sentence the app was built for', () => {
    const q = parseQuery(
      'jag bor i Göteborg och vill höja mitt betyg i Matte 2b innan december',
      EXAMS,
      NOW,
    );
    expect(q.cities).toContain('Göteborg');
    expect(q.courses).toContain('Matematik 2b');
    expect(q.before).toBe('2026-11-30');
    expect(q.wantsOpen).toBe(true);
  });

  /** "Matematik 2b" and "Matematik" both match the text; the broader one would
      otherwise drag every maths course in the country in as an equal. */
  it('prefers the course over its subject when both are in the sentence', () => {
    const q = parseQuery('matematik 2b i göteborg', EXAMS, NOW);
    expect(q.courses).toEqual(['Matematik 2b']);
    expect(q.subjects).toEqual([]);
  });

  it('falls back to the subject when no single course is named', () => {
    const q = parseQuery('finns det prövning i kemi i göteborg', EXAMS, NOW);
    expect(q.subjects).toContain('Kemi');
    expect(q.courses).toEqual([]);
  });

  it('understands a kurskod', () => {
    const q = parseQuery('jag vill pröva SVESVE03', EXAMS, NOW);
    expect(q.courses).toContain('Svenska 3');
  });

  it('reads a named day as that day, and a bare month as the day before it starts', () => {
    expect(parseQuery('klart före 15 oktober', EXAMS, NOW).before).toBe('2026-10-15');
    expect(parseQuery('klart innan december', EXAMS, NOW).before).toBe('2026-11-30');
  });

  /** A December sentence written in December means next December, not one that
      has already been. */
  it('reads a month that has passed as next year’s', () => {
    const inDecember = new Date('2026-12-10T09:00:00Z');
    expect(parseQuery('innan mars', EXAMS, inDecember).before).toBe('2027-02-28');
  });

  it('understands the terms by name', () => {
    expect(parseQuery('hinner jag i höst', EXAMS, NOW).before).toBe('2026-12-31');
    expect(parseQuery('jag siktar på vårterminen', EXAMS, NOW).before).toBe('2027-06-30');
  });
});

describe('answerQuery', () => {
  it('answers the sentence with listings in the right kommun and course', () => {
    const a = answerQuery('jag bor i Göteborg och vill höja Matte 2b innan december', EXAMS, NOW);
    expect(a.matches.length).toBeGreaterThan(0);
    for (const m of a.matches) {
      expect(m.exam.city).toBe('Göteborg');
      expect(m.exam.course).toBe('Matematik 2b');
    }
  });

  /** The one thing this must never do. Every fact the answer can show is a
      field of a listing that is really in the dataset. */
  it('only ever returns listings that exist', () => {
    const a = answerQuery('engelska 6 i göteborg', EXAMS, NOW);
    expect(a.matches.length).toBeGreaterThan(0);
    for (const m of a.matches) expect(EXAMS).toContain(m.exam);
  });

  it('puts a round you can still apply to above one that has closed', () => {
    const a = answerQuery('jag vill anmäla mig till en prövning i Göteborg', EXAMS, NOW);
    const closed = a.matches.findIndex((m) => m.exam.nextPeriod.applicationEnd! < '2026-08-27');
    const open = a.matches.findIndex((m) => m.exam.nextPeriod.applicationEnd! >= '2026-08-27');
    if (closed !== -1 && open !== -1) expect(open).toBeLessThan(closed);
  });

  /** Saying "0 träffar" would be true and useless: the course exists, and where
      it exists is exactly the thing the person is missing. */
  it('widens past the kommun rather than answering with nothing', () => {
    const a = answerQuery('finns Matematik 5 i Kiruna', EXAMS, NOW);
    expect(a.widened).toBe('city');
    expect(a.matches.length).toBeGreaterThan(0);
    expect(a.matches.every((m) => m.exam.course === 'Matematik 5')).toBe(true);
  });

  it('asks for more instead of answering a sentence it did not understand', () => {
    const a = answerQuery('hej vad kan du hjälpa mig med', EXAMS, NOW);
    expect(a.understoodNothing).toBe(true);
    expect(a.matches).toEqual([]);
  });

  it('marks which rounds finish in time for the date the user named', () => {
    const a = answerQuery('matematik 2b innan december', EXAMS, NOW);
    for (const m of a.matches) {
      const p = m.exam.nextPeriod;
      const end = p.examWindowEnd ?? p.examWindowStart ?? p.applicationEnd;
      const known = p.confirmed && end !== undefined;
      expect(m.inTime).toBe(known ? end! <= '2026-11-30' : null);
    }
  });

  /** "Vi vet inte" is not "nej". A provider who published only an opening day
      has said nothing about when the prövning is over, and labelling that round
      "blir inte klar till din tid" would be a claim about a date nobody wrote. */
  it('says nothing about a round whose provider published no end date', () => {
    const a = answerQuery('kemi 1 i Stockholm innan december', EXAMS, NOW);
    const openEnded = a.matches.filter(
      (m) =>
        m.exam.nextPeriod.confirmed &&
        !m.exam.nextPeriod.examWindowEnd &&
        !m.exam.nextPeriod.examWindowStart &&
        !m.exam.nextPeriod.applicationEnd,
    );
    expect(openEnded.length).toBeGreaterThan(0);
    for (const m of openEnded) expect(m.inTime).toBeNull();
  });
});
