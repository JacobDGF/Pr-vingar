import { describe, it, expect } from 'vitest';
import { matchesQuery } from './examSearch';
import { EXAMS } from '../data/exams';
import { Exam } from '../types';

const base = EXAMS[0];
const exam = (over: Partial<Exam>): Exam => ({ ...base, ...over });

describe('matchesQuery', () => {
  it('keeps everything when the query is empty or blank', () => {
    expect(matchesQuery(base, '')).toBe(true);
    expect(matchesQuery(base, '   ')).toBe(true);
  });

  it('reads the fields a user is most likely to type', () => {
    const e = exam({
      schoolName: 'Vux Huddinge',
      subject: 'Svenska som andraspråk',
      course: 'Svenska som andraspråk, nivå 1',
      city: 'Huddinge',
      courseCode: 'SVEA1000X',
      provider: 'Huddinge kommun',
      tags: [],
    });
    for (const q of ['huddinge', 'andraspråk', 'nivå 1', 'svea1000x', 'kommun']) {
      expect(matchesQuery(e, q), q).toBe(true);
    }
    expect(matchesQuery(e, 'matematik')).toBe(false);
  });

  it('is case-insensitive and tolerates stray spaces around the query', () => {
    expect(matchesQuery(exam({ city: 'Härnösand' }), '  HÄRNÖSAND ')).toBe(true);
  });

  /**
   * The regression this function was extracted for. A landskap cannot live in
   * `region` — that field holds one of the 21 län, and "Småland" would silently
   * take Jönköping, Kalmar and Kronoberg out of the region filter — so the
   * dataset keeps it as a tag instead. The README has promised since then that
   * a search for the landskap still finds its way; until this was read here, it
   * did not.
   */
  it('reads tags, which is where the landskap and the läroplan live', () => {
    const e = exam({
      schoolName: 'Komvux Växjö',
      city: 'Växjö',
      region: 'Kronoberg',
      tags: ['komvux', 'växjö', 'småland'],
    });
    expect(matchesQuery(e, 'småland')).toBe(true);
    expect(matchesQuery(e, 'kronoberg')).toBe(false); // region is not searched
  });

  it('finds every listing a landskap tag covers, across its län', () => {
    const smaland = EXAMS.filter((e) => matchesQuery(e, 'småland'));
    expect(smaland.length).toBeGreaterThan(1);
    // The point of the tag: one word reaching more than one län.
    expect(new Set(smaland.map((e) => e.region)).size).toBeGreaterThan(1);
  });

  it('finds Huddinges Gy25-nivåer by curriculum', () => {
    const gy25 = EXAMS.filter((e) => matchesQuery(e, 'gy25'));
    expect(gy25.map((e) => e.courseCode)).toEqual(
      expect.arrayContaining(['SVEA1000X', 'SVEA3000X']),
    );
  });
});
