import { describe, it, expect } from 'vitest';
import { getFreshness, formatAge, verificationAgeDays, FRESH_DAYS, STALE_DAYS } from './freshness';
import { EXAMS } from '../data/exams';
import { Exam } from '../types';

const NOW = new Date('2026-08-25T12:00:00');

function verifiedOn(iso: string): Exam {
  return { ...EXAMS[0], provider: 'Testkommun', verifiedAt: iso };
}

describe('verificationAgeDays', () => {
  it('counts whole days, ignoring the time of day', () => {
    expect(verificationAgeDays('2026-08-25', NOW)).toBe(0);
    expect(verificationAgeDays('2026-08-24', NOW)).toBe(1);
    expect(verificationAgeDays('2026-06-24', NOW)).toBe(62);
  });

  it('clamps a date in the future to today rather than reading as fresher than fresh', () => {
    expect(verificationAgeDays('2027-01-01', NOW)).toBe(0);
  });

  it('survives a date it cannot parse', () => {
    expect(verificationAgeDays('inte ett datum', NOW)).toBe(0);
  });
});

describe('formatAge', () => {
  it('reads as Swedish at every scale', () => {
    expect(formatAge(0)).toBe('i dag');
    expect(formatAge(1)).toBe('i går');
    expect(formatAge(5)).toBe('för 5 dagar sedan');
    expect(formatAge(21)).toBe('för 3 veckor sedan');
    expect(formatAge(62)).toBe('för 2 månader sedan');
    expect(formatAge(400)).toBe('för över 1 år sedan');
  });
});

describe('getFreshness', () => {
  it('is green while the check is recent', () => {
    expect(getFreshness(verifiedOn('2026-08-25'), NOW).key).toBe('fresh');
    expect(getFreshness(verifiedOn('2026-07-27'), NOW).key).toBe('fresh');
  });

  it('turns amber once the check has outlived a provider’s publishing cycle', () => {
    const justOver = getFreshness(verifiedOn('2026-07-25'), NOW);
    expect(justOver.ageDays).toBeGreaterThan(FRESH_DAYS);
    expect(justOver.key).toBe('aging');
  });

  it('turns grey once the provider’s own page is the better source', () => {
    const old = getFreshness(verifiedOn('2026-01-01'), NOW);
    expect(old.ageDays).toBeGreaterThan(STALE_DAYS);
    expect(old.key).toBe('stale');
  });

  it('keeps the year the old line dropped', () => {
    // "24 juni" alone read the same in 2025 and 2026 — the whole reason the
    // line could not be trusted.
    expect(getFreshness(verifiedOn('2026-06-24'), NOW).date).toContain('2026');
  });

  it('says nothing extra while the check is fresh, and names the way out once it is not', () => {
    expect(getFreshness(verifiedOn('2026-08-20'), NOW).advice).toBe('');
    expect(getFreshness(verifiedOn('2026-06-24'), NOW).advice).toContain('Testkommun');
    expect(getFreshness(verifiedOn('2025-06-24'), NOW).advice).toContain('Testkommun');
  });

  it('gives each state its own colour, so the line cannot stay green while it ages', () => {
    const tones = (['2026-08-25', '2026-07-01', '2025-01-01'] as const).map(
      (d) => getFreshness(verifiedOn(d), NOW).text,
    );
    expect(new Set(tones).size).toBe(3);
  });
});

describe('the dataset’s own freshness', () => {
  it('never claims a check that has not happened yet', () => {
    const future = EXAMS.filter((e) => new Date(e.verifiedAt).getTime() > Date.now());
    expect(future.map((e) => e.id)).toEqual([]);
  });

  it('gives every listing a parseable verification date', () => {
    for (const exam of EXAMS) {
      expect(Number.isNaN(new Date(exam.verifiedAt).getTime())).toBe(false);
      expect(exam.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
