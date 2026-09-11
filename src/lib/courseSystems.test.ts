import { describe, it, expect } from 'vitest';
import { COURSE_PAIRS, courseCounterpart, counterpartListing } from './courseSystems';
import { EXAMS } from '../data/exams';

describe('courseCounterpart', () => {
  it('reads the pair from either side', () => {
    expect(courseCounterpart('MATMAT03b')).toEqual({
      system: 'gy11',
      other: { code: 'MATO1B00X', name: 'Matematik – fortsättning Nivå 1b' },
    });
    expect(courseCounterpart('MATO1B00X')).toEqual({
      system: 'gy25',
      other: { code: 'MATMAT03b', name: 'Matematik 3b' },
    });
  });

  it('tolerates the case and spacing a kurskod is typed with', () => {
    expect(courseCounterpart(' matmat02b ')?.other.code).toBe('MATE2B00X');
  });

  /**
   * Silence is still the answer for a course no source has paired — an sfi-kurs
   * has no Gy25 ämnesnivå to point at, and inventing one would send somebody to
   * the wrong prov.
   */
  it('says nothing about a course no source has paired', () => {
    expect(courseCounterpart('SFIKUB92')).toBeUndefined();
    expect(courseCounterpart('GRNMAT2')).toBeUndefined();
  });

  /**
   * Fysik 1a and Fysik nivå 1b were the documented silence: Örebro lists them on
   * separate rows, and the names don't look like a pair. Helsingborg's table
   * puts them on one row, both at 150 poäng, and a pairing nobody could guess is
   * exactly the kind only a source can settle.
   */
  it('pairs Fysik 1a with Fysik Nivå 1b, on Helsingborg’s authority', () => {
    expect(courseCounterpart('FYSFYS01a')?.other.code).toBe('FYSK1B00X');
    expect(courseCounterpart('FYSK1B00X')?.other.name).toBe('Fysik 1a');
  });

  it('pairs each code exactly once, and never with itself', () => {
    const codes = COURSE_PAIRS.flatMap((p) => [p.gy11.code, p.gy25.code]);
    expect(new Set(codes).size).toBe(codes.length);
    for (const pair of COURSE_PAIRS) expect(pair.gy11.code).not.toBe(pair.gy25.code);
  });

  /**
   * The names are the dataset's own spelling of each code. If a listing later
   * renames a course, the pair has to follow — otherwise search offers a name
   * no card carries, and the detail line names a course the user can't find.
   */
  it('spells every paired course the way the dataset spells it', () => {
    const namesByCode = new Map<string, Set<string>>();
    for (const e of EXAMS) {
      if (!namesByCode.has(e.courseCode)) namesByCode.set(e.courseCode, new Set());
      namesByCode.get(e.courseCode)!.add(e.course);
    }
    const drifted: string[] = [];
    for (const variant of COURSE_PAIRS.flatMap((p) => [p.gy11, p.gy25])) {
      const names = namesByCode.get(variant.code);
      if (names && !names.has(variant.name)) {
        drifted.push(`${variant.code}: ${variant.name} ≠ ${[...names].join(' / ')}`);
      }
    }
    expect(drifted).toEqual([]);
  });
});

describe('counterpartListing', () => {
  const exam = (schoolName: string, city: string, courseCode: string) => ({
    id: `${schoolName}-${courseCode}`.toLowerCase(),
    schoolName,
    city,
    courseCode,
  });

  it('finds the other curriculum’s listing at the same school', () => {
    const gy11 = exam('Komvux Örebro (Talenti)', 'Örebro', 'MATMAT03b');
    const gy25 = exam('Komvux Örebro (Talenti)', 'Örebro', 'MATO1B00X');
    expect(counterpartListing(gy11, [gy11, gy25])).toBe(gy25);
    expect(counterpartListing(gy25, [gy11, gy25])).toBe(gy11);
  });

  /**
   * The twin has to be the same school in the same town. Another provider's
   * listing of the same course is a different prövning — different dates, fee
   * and forms — and offering it as "the other name for this one" would move the
   * user to a booking they never chose.
   */
  it('never crosses to another school or another town', () => {
    const here = exam('Komvux Helsingborg', 'Helsingborg', 'MATE2B00X');
    const otherSchool = exam('Komvux Örebro (Talenti)', 'Örebro', 'MATMAT02b');
    const otherTown = exam('Komvux Helsingborg', 'Malmö', 'MATMAT02b');
    expect(counterpartListing(here, [here, otherSchool, otherTown])).toBeUndefined();
  });

  it('says nothing when the school only prövar one of the two', () => {
    const alone = exam('Komvux Helsingborg', 'Helsingborg', 'MATE2B00X');
    expect(counterpartListing(alone, [alone])).toBeUndefined();
  });

  it('says nothing for a course with no pair at all', () => {
    const sfi = exam('Komvux Göteborg', 'Göteborg', 'SFIKUD93');
    expect(counterpartListing(sfi, [sfi])).toBeUndefined();
  });

  /** Every twin the real dataset offers points back at the listing it came from. */
  it('is symmetric across the dataset', () => {
    const broken: string[] = [];
    for (const e of EXAMS) {
      const twin = counterpartListing(e, EXAMS);
      if (twin && counterpartListing(twin, EXAMS)?.id !== e.id) broken.push(e.id);
    }
    expect(broken).toEqual([]);
  });
});
