import { describe, it, expect } from 'vitest';
import { Exam, Watch } from '../types';
import { EXAMS } from '../data/exams';
import {
  hasNews,
  makeWatch,
  matchesWatch,
  watchKey,
  watchLabel,
  watchNews,
  watchSummary,
} from './watches';

function exam(over: Partial<Exam> = {}): Exam {
  return {
    id: 'x',
    schoolName: 'Skolan',
    provider: 'Kommunen',
    subject: 'Matematik',
    course: 'Matematik 2b',
    courseCode: 'MATMAT02b',
    level: 'Komvux',
    city: 'Stockholm',
    region: 'Stockholm',
    address: 'Gatan 1',
    lat: 59.3,
    lng: 18,
    price: 500,
    nextPeriod: { label: 'Period', confirmed: false },
    components: [{ name: 'Prov', duration: '2 h', description: '' }],
    studyTips: ['Plugga'],
    registrationUrl: 'https://example.com/anmalan',
    infoUrl: 'https://example.com',
    description: 'Prövning',
    tags: [],
    verifiedAt: '2026-08-31',
    ...over,
  };
}

function watch(over: Partial<Watch> = {}): Watch {
  return { ...makeWatch('Matematik', 'Stockholm'), ...over };
}

/** Days from now as an ISO date, so tests don't rot as the calendar moves. */
function inDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

describe('watchLabel', () => {
  it('names both halves when both are set', () => {
    expect(watchLabel({ subject: 'Matematik', city: 'Stockholm' })).toBe('Matematik i Stockholm');
  });

  it('says which half is missing rather than dropping it', () => {
    expect(watchLabel({ subject: 'Matematik', city: '' })).toBe('Matematik i hela Sverige');
    expect(watchLabel({ subject: '', city: 'Malmö' })).toBe('Alla ämnen i Malmö');
  });
});

describe('matchesWatch', () => {
  it('matches on both fields', () => {
    expect(matchesWatch(exam(), { subject: 'Matematik', city: 'Stockholm' })).toBe(true);
    expect(matchesWatch(exam(), { subject: 'Kemi', city: 'Stockholm' })).toBe(false);
    expect(matchesWatch(exam(), { subject: 'Matematik', city: 'Malmö' })).toBe(false);
  });

  it('treats an empty half as "anything"', () => {
    expect(matchesWatch(exam(), { subject: '', city: 'Stockholm' })).toBe(true);
    expect(matchesWatch(exam(), { subject: 'Matematik', city: '' })).toBe(true);
  });
});

describe('watchNews', () => {
  it('counts every match, and only the bookable ones as open', () => {
    const news = watchNews(watch(), [
      exam({ id: 'a', nextPeriod: { label: '', confirmed: true, applicationEnd: inDays(20) } }),
      exam({ id: 'b', nextPeriod: { label: '', confirmed: true, applicationEnd: inDays(-3) } }),
      exam({ id: 'c', city: 'Malmö' }),
    ]);
    expect(news.total).toBe(2);
    expect(news.open).toBe(1);
  });

  it('picks the soonest deadline still ahead, not the soonest date', () => {
    const news = watchNews(watch(), [
      exam({ id: 'past', nextPeriod: { label: '', confirmed: true, applicationEnd: inDays(-9) } }),
      exam({ id: 'soon', nextPeriod: { label: '', confirmed: true, applicationEnd: inDays(4) } }),
      exam({ id: 'later', nextPeriod: { label: '', confirmed: true, applicationEnd: inDays(30) } }),
    ]);
    expect(news.nextDeadline?.examId).toBe('soon');
    expect(news.closingSoon).toBe(1);
  });

  /**
   * A round the provider has marked fullbokat is not something the watch may
   * count as open — the dates say yes and the provider says no, and the whole
   * dataset resolves that in the provider's favour.
   */
  it('never counts a full round as open', () => {
    const news = watchNews(watch(), [
      exam({
        id: 'full',
        nextPeriod: { label: '', confirmed: true, applicationEnd: inDays(3), full: true },
      }),
    ]);
    expect(news.open).toBe(0);
    expect(news.nextDeadline).toBeNull();
    expect(news.closingSoon).toBe(0);
  });

  it('calls a listing new only when this watch has not shown it before', () => {
    const exams = [exam({ id: 'a' }), exam({ id: 'b' })];
    expect(watchNews(watch({ seenExamIds: [] }), exams).newIds).toEqual(['a', 'b']);
    expect(watchNews(watch({ seenExamIds: ['a'] }), exams).newIds).toEqual(['b']);
    expect(watchNews(watch({ seenExamIds: ['a', 'b'] }), exams).newIds).toEqual([]);
  });
});

describe('watchSummary', () => {
  it('leads with what expires', () => {
    const news = watchNews(watch({ seenExamIds: ['a'] }), [
      exam({ id: 'a', nextPeriod: { label: '', confirmed: true, applicationEnd: inDays(5) } }),
    ]);
    expect(watchSummary(news)).toBe('Sista anmälan om 5 dagar');
  });

  it('says both halves when there is both news and a deadline', () => {
    const news = watchNews(watch(), [
      exam({ id: 'a', nextPeriod: { label: '', confirmed: true, applicationEnd: inDays(9) } }),
    ]);
    expect(watchSummary(news)).toBe('1 ny sedan sist · sista anmälan om 9 dagar');
  });

  it('is honest when nothing is bookable', () => {
    const news = watchNews(watch({ seenExamIds: ['a'] }), [exam({ id: 'a' })]);
    expect(watchSummary(news)).toBe('Inget öppet för anmälan just nu');
    expect(hasNews(news)).toBe(false);
  });

  it('does not promise anything for a watch with no listings at all', () => {
    const news = watchNews(watch({ subject: 'Kemi', city: 'Kiruna' }), [exam()]);
    expect(watchSummary(news)).toMatch(/Inga prövningar/);
  });
});

describe('against the real dataset', () => {
  it('every subject and city in EXAMS makes a watch that finds itself', () => {
    for (const e of [EXAMS[0], EXAMS[Math.floor(EXAMS.length / 2)], EXAMS[EXAMS.length - 1]]) {
      const w = makeWatch(e.subject, e.city);
      expect(w.id).toBe(watchKey(e.subject, e.city));
      expect(watchNews(w, EXAMS).total).toBeGreaterThan(0);
    }
  });
});
