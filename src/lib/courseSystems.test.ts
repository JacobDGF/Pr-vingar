import { describe, it, expect } from 'vitest';
import { COURSE_PAIRS, courseCounterpart } from './courseSystems';
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
   * Silence is the answer when no source writes the pair out, and when a source
   * writes something that isn't a pair at all. Helsingborgs tabell lägger både
   * Datorteknik 1a och 1b mot `DATR1000X`, och samma `MATMAT00S` mot både
   * specialisering B och C — att välja en av två här vore att skicka någon till
   * fel prov. `SFIKUB92` finns bara i ett system.
   *
   * Fysik 1a och Fysik nivå 1b stod tidigare här som ett opar-at exempel, på
   * Örebros tabell, som listar dem var för sig. Helsingborg skriver ut dem på
   * samma rad, och en källa som säger det är starkare än en som tiger.
   */
  it('says nothing about a course no source has paired', () => {
    expect(courseCounterpart('DATR1000X')).toBeUndefined();
    expect(courseCounterpart('MATMAT00S')).toBeUndefined();
    expect(courseCounterpart('MASB1000X')).toBeUndefined();
    expect(courseCounterpart('SFIKUB92')).toBeUndefined();
  });

  /** Helsingborgs tabell, som Örebros inte tar upp. */
  it('pairs Fysik 1a with Fysik nivå 1b, as Helsingborg writes it', () => {
    expect(courseCounterpart('FYSFYS01a')?.other.code).toBe('FYSK1B00X');
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
