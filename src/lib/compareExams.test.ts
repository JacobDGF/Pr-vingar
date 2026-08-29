import { describe, it, expect } from 'vitest';
import { buildComparison, countDifferences } from './compareExams';
import { EXAMS } from '../data/exams';
import { Exam } from '../types';

function exam(over: Partial<Exam> = {}): Exam {
  return {
    id: 'a',
    schoolName: 'Komvux Test',
    provider: 'Testkommun',
    subject: 'Matematik',
    course: 'Matematik 2b',
    courseCode: 'MATMAT02b',
    level: 'Komvux',
    city: 'Teststad',
    region: 'Stockholm',
    address: 'Testgatan 1',
    lat: 59.3,
    lng: 18.1,
    price: 500,
    nextPeriod: { label: 'Testperiod', confirmed: false },
    components: [{ name: 'Prov', duration: '2 h', description: 'Skriftligt.' }],
    studyTips: ['Läs boken.'],
    registrationUrl: 'https://example.se/anmalan',
    infoUrl: 'https://example.se/provning',
    description: 'Test.',
    tags: ['test'],
    verifiedAt: '2026-08-29',
    ...over,
  };
}

describe('buildComparison', () => {
  it('needs two listings to say anything', () => {
    expect(buildComparison([])).toEqual([]);
    expect(buildComparison([exam()])).toEqual([]);
  });

  it('gives one cell per listing, in the order passed in', () => {
    const rows = buildComparison([
      exam({ id: 'a', city: 'Malmö' }),
      exam({ id: 'b', city: 'Linköping' }),
      exam({ id: 'c', city: 'Umeå' }),
    ]);
    const where = rows.find((r) => r.key === 'where')!;
    expect(where.values).toEqual([
      'Komvux Test, Malmö',
      'Komvux Test, Linköping',
      'Komvux Test, Umeå',
    ]);
  });

  /**
   * The point of the table. A row every listing answers the same way is noise
   * in a comparison — it is only ever read to discover it says nothing.
   */
  it('marks the rows that separate the listings, and only those', () => {
    const rows = buildComparison([exam({ id: 'a', price: 500 }), exam({ id: 'b', price: 700 })]);
    expect(rows.find((r) => r.key === 'price')!.differs).toBe(true);
    expect(rows.find((r) => r.key === 'code')!.differs).toBe(false);
  });

  it('counts the differing rows', () => {
    const rows = buildComparison([
      exam({ id: 'a', price: 500, city: 'Malmö' }),
      exam({ id: 'b', price: 700, city: 'Lund' }),
    ]);
    expect(countDifferences(rows)).toBe(2);
  });

  it('says a single-day exam window once instead of as a range', () => {
    const day = {
      label: 'En dag',
      confirmed: true,
      examWindowStart: '2026-10-29',
      examWindowEnd: '2026-10-29',
    };
    const rows = buildComparison([exam({ id: 'a', nextPeriod: day }), exam({ id: 'b' })]);
    expect(rows.find((r) => r.key === 'window')!.values[0]).toBe('29 okt. 2026');
  });

  /**
   * An unconfirmed period carries no dates at all (the dataset test enforces
   * that), and the table must not invent one to fill the cell.
   */
  it('leaves the date rows empty when the provider published no dates', () => {
    const rows = buildComparison([exam({ id: 'a' }), exam({ id: 'b' })]);
    for (const key of ['opens', 'closes', 'window']) {
      expect(rows.find((r) => r.key === key)!.values).toEqual(['—', '—']);
    }
  });

  it('builds every row for real listings without throwing', () => {
    const rows = buildComparison(EXAMS.slice(0, 12));
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.values).toHaveLength(12);
      for (const v of row.values) expect(v.trim()).not.toBe('');
    }
  });
});
