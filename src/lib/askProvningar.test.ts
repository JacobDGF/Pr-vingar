import { describe, it, expect } from 'vitest';
import { askProvningar, interpret } from './askProvningar';
import { EXAMS } from '../data/exams';
import { Exam } from '../types';

/**
 * Two halves, deliberately split by what they depend on.
 *
 * `interpret` is tested against the real dataset, because the whole point of
 * reading the vocabulary out of the data is that a sentence naming a real city
 * and a real course keeps working as the data grows. It reads no clock beyond
 * rolling a month that has already been round, so it is safe there.
 *
 * `askProvningar` is tested against a fixture. It filters on today's date
 * through `examStatus`, so pointing it at the real dataset would write a test
 * that passes this week and fails the morning an application window closes —
 * `main` going red on a Tuesday with no commit behind it, which is exactly why
 * `check:dates` is kept out of `npm test`. The fixture's dates are built
 * relative to now, so they are always the same distance away.
 */

const NOW = new Date('2026-08-28T09:00:00Z');

describe('interpret', () => {
  it('reads the city, the course and the deadline out of one sentence', () => {
    const result = interpret(
      'jag bor i Göteborg och vill höja mitt betyg i Matte 2b innan december',
      EXAMS,
      NOW,
    );
    expect(result.city).toBe('Göteborg');
    expect(result.course).toBe('Matematik 2b');
    expect(result.before).toBe('2026-12-01');
    expect(result.beforeLabel).toBe('december');
  });

  it('keeps a subject a subject when no level is named', () => {
    const result = interpret('var kan jag pröva kemi?', EXAMS, NOW);
    expect(result.subject).toBe('Kemi');
    expect(result.course).toBeUndefined();
  });

  /** "Svenska som andraspråk 3" contains "svenska", and a shortest-match would
      answer a question about sva with Svenska 3 — a different course, a
      different prövning, and a different preparation document. */
  it('prefers the longest course name that matches', () => {
    const result = interpret('svenska som andraspråk 3 i Göteborg', EXAMS, NOW);
    expect(result.course).toBe('Svenska som andraspråk 3');
  });

  it('understands "i höst" as a deadline', () => {
    expect(interpret('matematik 1c i höst', EXAMS, NOW).before).toBe('2026-12-31');
  });

  it('rolls a month that has already been round to next year', () => {
    // Asked in August, "innan mars" cannot mean the March that has gone.
    expect(interpret('svenska 3 innan mars', EXAMS, NOW).before).toBe('2027-03-01');
  });

  it('leaves the deadline unset when the question names none', () => {
    expect(interpret('kemi 1 i Linköping', EXAMS, NOW).before).toBeUndefined();
  });
});

/** Days from now as an ISO date, so a fixture is never overtaken by the clock. */
function inDays(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

function fixture(overrides: Partial<Exam>): Exam {
  return {
    id: 'x',
    schoolName: 'Provskolan',
    provider: 'Provkommunen',
    subject: 'Matematik',
    course: 'Matematik 2b',
    courseCode: 'MATMAT02b',
    level: 'Komvux',
    city: 'Göteborg',
    region: 'Västra Götaland',
    address: 'Provgatan 1',
    lat: 57.7,
    lng: 11.97,
    price: 500,
    nextPeriod: { label: 'Höst', applicationEnd: inDays(20), confirmed: true },
    components: [{ name: 'Prov', duration: '2 h', description: 'Prov' }],
    studyTips: ['Plugga'],
    registrationUrl: 'https://example.se/anmalan',
    infoUrl: 'https://example.se/',
    description: 'Prövning',
    tags: ['matematik'],
    verifiedAt: '2026-08-28',
    ...overrides,
  };
}

const SOON = fixture({
  id: 'soon',
  nextPeriod: {
    label: 'Snart',
    applicationEnd: inDays(10),
    examWindowStart: inDays(30),
    examWindowEnd: inDays(30),
    confirmed: true,
  },
});

const LATER = fixture({
  id: 'later',
  nextPeriod: {
    label: 'Sen',
    applicationEnd: inDays(120),
    examWindowStart: inDays(200),
    examWindowEnd: inDays(200),
    confirmed: true,
  },
});

const CLOSED = fixture({
  id: 'closed',
  nextPeriod: {
    label: 'Stängd',
    applicationEnd: inDays(-5),
    examWindowStart: inDays(-1),
    examWindowEnd: inDays(-1),
    confirmed: true,
  },
});

const ELSEWHERE = fixture({ id: 'elsewhere', city: 'Malmö', region: 'Skåne' });

const OTHER_COURSE = fixture({ id: 'other', subject: 'Kemi', course: 'Kemi 1' });

const SET = [SOON, LATER, CLOSED, ELSEWHERE, OTHER_COURSE];

describe('askProvningar', () => {
  it('answers a sentence with only the listings that match it', () => {
    const result = askProvningar('jag bor i Göteborg och vill höja Matte 2b', SET);
    expect(result.exams.map((e) => e.id)).toEqual(['soon', 'later']);
  });

  it('never returns a round whose application already closed', () => {
    const result = askProvningar('matematik 2b i Göteborg', SET);
    expect(result.exams.map((e) => e.id)).not.toContain('closed');
  });

  it('honours a deadline the question sets', () => {
    const result = askProvningar('Matte 2b i Göteborg inom två månader', SET);
    expect(result.exams.map((e) => e.id)).toEqual(['soon']);
  });

  /**
   * The rule the whole feature rests on: the prose is assembled from fields, so
   * every date it prints belongs to a listing printed under it. Nothing here
   * can write a date the dataset does not hold.
   */
  it('never speaks a date that is not on a listing it returned', () => {
    const result = askProvningar('Matte 2b i Göteborg', SET);
    const dates = result.exams.flatMap((e) =>
      [
        e.nextPeriod.applicationStart,
        e.nextPeriod.applicationEnd,
        e.nextPeriod.examWindowStart,
        e.nextPeriod.examWindowEnd,
      ].filter((d): d is string => Boolean(d)),
    );
    const months = [
      'januari',
      'februari',
      'mars',
      'april',
      'maj',
      'juni',
      'juli',
      'augusti',
      'september',
      'oktober',
      'november',
      'december',
    ];
    const spoken = [...result.answer.matchAll(/(\d{1,2}) ([a-zåäö]+)/g)].filter(([, , word]) =>
      months.includes(word),
    );
    expect(spoken.length).toBeGreaterThan(0);
    for (const [, day, month] of spoken) {
      const suffix = `-${String(months.indexOf(month) + 1).padStart(2, '0')}-${String(Number(day)).padStart(2, '0')}`;
      expect(dates.some((d) => d.endsWith(suffix))).toBe(true);
    }
  });

  it('says so rather than guessing when the question says nothing usable', () => {
    const result = askProvningar('hej, hur funkar det här?', SET);
    expect(result.emptyQuestion).toBe(true);
    expect(result.exams).toEqual([]);
  });

  it('widens past an impossible deadline rather than answering with nothing', () => {
    const result = askProvningar('Matte 2b i Göteborg inom en vecka', SET);
    expect(result.exams.map((e) => e.id)).toEqual(['soon', 'later']);
    expect(result.answer).toContain('Ingen av dem hinner');
  });

  it('leaves the city and says it did when nobody there has the course', () => {
    const result = askProvningar('Kemi 1 i Göteborg', SET);
    expect(result.exams.map((e) => e.id)).toEqual(['other']);
    // 'other' is in Göteborg, so nothing was widened — the honest opposite case
    // is a course nobody in the named city offers.
    const widened = askProvningar('Kemi 1 i Malmö', SET);
    expect(widened.exams.map((e) => e.id)).toEqual(['other']);
    expect(widened.answer).toContain('Ingen anordnare i Malmö');
  });

  it('drops a round the provider has marked fullbokat', () => {
    const full = fixture({
      id: 'full',
      nextPeriod: { label: 'Full', applicationEnd: inDays(10), confirmed: true, full: true },
    });
    const result = askProvningar('Matte 2b i Göteborg', [full]);
    // A full round is still ahead of the user in time, so it is still listed —
    // its card carries the red the palette reserves for exactly this. What must
    // never happen is the answer promising a deadline it can't be booked by.
    expect(result.exams.map((e) => e.id)).toEqual(['full']);
    expect(result.answer).not.toContain('Närmaste sista anmälningsdag');
  });
});
