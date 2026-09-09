import { describe, it, expect } from 'vitest';
import { describeOthers, hasComparableCourse, otherProvidersFor } from './otherProviders';
import { EXAMS } from '../data/exams';
import { Exam } from '../types';

/** Fixed, so "still bookable" never depends on the day the suite is run. */
const NOW = new Date('2026-09-09T12:00:00Z').getTime();

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
    verifiedAt: '2026-09-09',
    ...over,
  };
}

const open = { label: 'Öppen', applicationEnd: '2026-11-01', confirmed: true };
const closed = { label: 'Stängd', applicationEnd: '2026-08-01', confirmed: true };

describe('hasComparableCourse', () => {
  it('is false for a listing that stands for a whole catalogue', () => {
    expect(hasComparableCourse(exam({ courseCode: 'Varierar' }))).toBe(false);
  });

  it('is true for a listing that names one course', () => {
    expect(hasComparableCourse(exam())).toBe(true);
  });
});

describe('describeOthers', () => {
  it('says outright when none of them can be booked', () => {
    expect(describeOthers(4, 0, 'MATMAT01c')).toBe(
      '4 andra prövar MATMAT01c, men ingen av dem tar emot anmälningar just nu.',
    );
  });

  it('never counts to one', () => {
    expect(describeOthers(1, 1, 'MATMAT01c')).toBe('Den går fortfarande att anmäla sig till.');
    expect(describeOthers(1, 0, 'MATMAT01c')).toBe(
      'Den andra listningen på MATMAT01c tar inte emot anmälningar just nu.',
    );
  });

  it('drops the fraction when every one of them is open', () => {
    expect(describeOthers(3, 3, 'MATMAT01c')).toBe('Alla 3 går fortfarande att anmäla sig till.');
  });

  it('leads with what is open when only some are', () => {
    expect(describeOthers(10, 4, 'ENGENG06')).toBe(
      '4 av 10 går fortfarande att anmäla sig till, och står först.',
    );
  });
});

describe('otherProvidersFor', () => {
  it('never includes the listing you are looking at', () => {
    const self = exam();
    expect(otherProvidersFor(self, [self], NOW)).toEqual([]);
  });

  it('says nothing at all for a listing without a real kurskod', () => {
    const vague = exam({ id: 'v', courseCode: 'Varierar' });
    const other = exam({ id: 'o', courseCode: 'Varierar' });
    expect(otherProvidersFor(vague, [vague, other], NOW)).toEqual([]);
  });

  it('matches on the kurskod, not on the course’s name', () => {
    const self = exam({ id: 'a' });
    const renamed = exam({ id: 'b', course: 'Matematik 2b/2c', schoolName: 'Annan skola' });
    const otherCourse = exam({ id: 'c', course: 'Matematik 2b', courseCode: 'MATE2B00X' });
    const found = otherProvidersFor(self, [self, renamed, otherCourse], NOW);
    expect(found.map((e) => e.id)).toEqual(['b']);
  });

  /** The whole reason the section exists: a dead round should point at a live one. */
  it('puts every round you can still book ahead of every round you cannot', () => {
    const self = exam({ id: 'a', nextPeriod: closed });
    const dead = exam({ id: 'dead', schoolName: 'B', nextPeriod: closed });
    const full = exam({
      id: 'full',
      schoolName: 'C',
      nextPeriod: { ...open, full: true },
    });
    const live = exam({ id: 'live', schoolName: 'D', nextPeriod: open });
    const found = otherProvidersFor(self, [self, dead, full, live], NOW);
    expect(found[0].id).toBe('live');
    expect(
      found
        .map((e) => e.id)
        .slice(1)
        .sort(),
    ).toEqual(['dead', 'full']);
  });

  it('orders the bookable ones by how soon they close', () => {
    const self = exam({ id: 'a', nextPeriod: closed });
    const late = exam({
      id: 'late',
      schoolName: 'B',
      nextPeriod: { ...open, applicationEnd: '2026-12-01' },
    });
    const soon = exam({
      id: 'soon',
      schoolName: 'C',
      nextPeriod: { ...open, applicationEnd: '2026-09-20' },
    });
    expect(otherProvidersFor(self, [self, late, soon], NOW).map((e) => e.id)).toEqual([
      'soon',
      'late',
    ]);
  });

  /**
   * Against the real dataset, because the section is only worth its space if
   * the overlap it assumes actually exists.
   */
  it('finds the other anordnare for a course the dataset really shares', () => {
    const nti = EXAMS.find((e) => e.id === 'nti-matmat01b')!;
    const found = otherProvidersFor(nti, EXAMS, NOW);
    expect(found.length).toBeGreaterThan(0);
    for (const e of found) expect(e.courseCode).toBe('MATMAT01b');
    expect(found.map((e) => e.id)).not.toContain('nti-matmat01b');
  });
});
