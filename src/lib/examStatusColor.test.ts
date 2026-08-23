import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Exam, NextPeriod } from '../types';
import { EXAMS } from '../data/exams';
import {
  STATUS_ORDER,
  STATUS_TONES,
  countByStatus,
  getExamStatus,
  getStatusKey,
} from './examStatusColor';

const TODAY = '2026-09-15T09:00:00.000Z';

function exam(nextPeriod: NextPeriod): Exam {
  return {
    id: 'test',
    schoolName: 'Testskolan',
    provider: 'Testkommun',
    subject: 'Matematik',
    course: 'Matematik 2b',
    courseCode: 'MATMAT02b',
    level: 'Komvux',
    city: 'Teststad',
    region: 'Stockholm',
    address: 'Testgatan 1',
    lat: 59,
    lng: 18,
    price: 500,
    nextPeriod,
    components: [],
    studyTips: [],
    registrationUrl: 'https://example.se/anmalan',
    infoUrl: 'https://example.se/provning',
    description: '',
    tags: [],
    verifiedAt: '2026-09-01',
  };
}

function days(offset: number): string {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(TODAY));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('getExamStatus', () => {
  it('gives a full round red, even while its dates look open', () => {
    const status = getExamStatus(
      exam({
        label: 'Höst 2026',
        applicationStart: days(-10),
        applicationEnd: days(10),
        confirmed: true,
        full: true,
      }),
    );
    expect(status.tone.key).toBe('full');
    expect(status.tone.pin).toBe('#dc2626');
    expect(status.label).toBe('Fullbokat');
  });

  it('never spends red on a round the user can still book', () => {
    // The whole point of the palette: red means "not for you", so a countdown
    // — however urgent — has to be a different colour from fullbokat.
    for (const offset of [0, 1, 3, 7, 30]) {
      const status = getExamStatus(
        exam({
          label: 'Höst 2026',
          applicationStart: days(-5),
          applicationEnd: days(offset),
          confirmed: true,
        }),
      );
      expect(status.tone.key).not.toBe('full');
      expect(status.tone.pin).not.toBe(STATUS_TONES.full.pin);
    }
  });

  it('turns amber inside the last week, and counts the days', () => {
    const status = getExamStatus(
      exam({
        label: 'Höst 2026',
        applicationStart: days(-5),
        applicationEnd: days(3),
        confirmed: true,
      }),
    );
    expect(status.tone.key).toBe('closing');
    expect(status.label).toBe('3 dagar kvar');
    expect(status.daysLeft).toBe(3);
  });

  it('says "dag" rather than "dagar" when there is one left', () => {
    const status = getExamStatus(
      exam({ label: 'H26', applicationStart: days(-5), applicationEnd: days(1), confirmed: true }),
    );
    expect(status.label).toBe('1 dag kvar');
  });

  it('calls the last day the last day', () => {
    const status = getExamStatus(
      exam({ label: 'H26', applicationStart: days(-5), applicationEnd: days(0), confirmed: true }),
    );
    expect(status.tone.key).toBe('closing');
    expect(status.label).toBe('Sista dagen idag');
  });

  it('is green for an open window with no published closing date', () => {
    const status = getExamStatus(
      exam({ label: 'H26', applicationStart: days(-5), confirmed: true }),
    );
    expect(status.tone.key).toBe('open');
    expect(status.label).toBe('Öppen nu');
  });

  it('is teal, with the date, before the window opens', () => {
    const status = getExamStatus(
      exam({ label: 'H26', applicationStart: days(12), applicationEnd: days(30), confirmed: true }),
    );
    expect(status.tone.key).toBe('upcoming');
    expect(status.label).toBe('Öppnar 27 sep.');
  });

  it('counts down to an opening inside a week instead of naming the date', () => {
    const tomorrow = getExamStatus(
      exam({ label: 'H26', applicationStart: days(1), applicationEnd: days(20), confirmed: true }),
    );
    expect(tomorrow.tone.key).toBe('upcoming');
    expect(tomorrow.label).toBe('Öppnar i morgon');

    const thisWeek = getExamStatus(
      exam({ label: 'H26', applicationStart: days(4), applicationEnd: days(20), confirmed: true }),
    );
    expect(thisWeek.label).toBe('Öppnar om 4 dagar');

    const stillAWeekOut = getExamStatus(
      exam({ label: 'H26', applicationStart: days(7), applicationEnd: days(20), confirmed: true }),
    );
    expect(stillAWeekOut.label).toBe('Öppnar om 7 dagar');
  });

  /**
   * The countdown must not promote the round out of blue. Blue means "you
   * cannot do anything about this yet", and that is exactly as true the day
   * before a window opens as it is two months before — the only thing that
   * changed is how worth remembering it is.
   */
  it('keeps an opening-tomorrow round blue rather than green', () => {
    const status = getExamStatus(
      exam({ label: 'H26', applicationStart: days(1), applicationEnd: days(20), confirmed: true }),
    );
    expect(status.tone.key).toBe('upcoming');
    expect(status.daysLeft).toBeNull();
  });

  it('greys out a deadline that has passed, and says when', () => {
    const status = getExamStatus(
      exam({
        label: 'H26',
        applicationStart: days(-30),
        applicationEnd: days(-4),
        confirmed: true,
      }),
    );
    expect(status.tone.key).toBe('closed');
    expect(status.label).toMatch(/^Stängde /);
  });

  it('prefers "fullbokat" over "stängde" when both are true', () => {
    // A provider that filled up and then let the deadline pass is still,
    // first and foremost, full — that's the answer to "why can't I book".
    const status = getExamStatus(
      exam({
        label: 'H26',
        applicationEnd: days(-4),
        confirmed: true,
        full: true,
      }),
    );
    expect(status.tone.key).toBe('full');
  });

  it('leaves an unconfirmed period colourless rather than inventing a state', () => {
    const status = getExamStatus(exam({ label: 'Se skolans sida', confirmed: false }));
    expect(status.tone.key).toBe('undated');
    expect(status.daysLeft).toBeNull();
  });

  it('does not count down a period with dates but no application window', () => {
    const status = getExamStatus(
      exam({ label: 'H26', examWindowStart: days(20), examWindowEnd: days(24), confirmed: true }),
    );
    expect(status.tone.key).toBe('undated');
  });
});

describe('the palette itself', () => {
  it('gives every state its own pin colour', () => {
    const pins = STATUS_ORDER.map((key) => STATUS_TONES[key].pin);
    expect(new Set(pins).size).toBe(pins.length);
  });

  it('orders the legend from what blocks you to what is open', () => {
    expect(STATUS_ORDER[0]).toBe('full');
    expect(STATUS_ORDER).toContain('open');
    expect(STATUS_ORDER[STATUS_ORDER.length - 1]).toBe('undated');
  });

  it('labels every state in two words or fewer', () => {
    for (const key of STATUS_ORDER) {
      expect(STATUS_TONES[key].shortLabel.split(' ').length).toBeLessThanOrEqual(2);
    }
  });
});

describe('countByStatus', () => {
  it('accounts for every listing exactly once', () => {
    const counts = countByStatus(EXAMS);
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    expect(total).toBe(EXAMS.length);
  });

  it('agrees with getStatusKey listing by listing', () => {
    const counts = countByStatus(EXAMS);
    for (const key of STATUS_ORDER) {
      expect(counts[key]).toBe(EXAMS.filter((e) => getStatusKey(e) === key).length);
    }
  });
});
