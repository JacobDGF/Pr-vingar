import { describe, it, expect } from 'vitest';
import { Exam } from '../types';
import { EVENT_TONES, PAST_TONE, eventsFor, nextOpening, payableTotal, toneFor } from './savedPlan';

function exam(overrides: Partial<Exam> = {}): Exam {
  return {
    id: 'x',
    schoolName: 'Skolan',
    provider: 'Kommunen',
    subject: 'Matematik',
    course: 'Matematik 3c',
    courseCode: 'MATMAT03c',
    level: 'Komvux',
    city: 'Staden',
    region: 'Stockholm',
    address: 'Gatan 1',
    lat: 59,
    lng: 18,
    price: 500,
    nextPeriod: { label: 'Period', confirmed: false },
    components: [{ name: 'Prov', duration: '2 h', description: 'Skriftligt' }],
    studyTips: ['Plugga'],
    registrationUrl: 'https://exempel.se/anmalan',
    infoUrl: 'https://exempel.se/provning',
    description: 'Beskrivning',
    tags: ['komvux'],
    verifiedAt: '2026-08-24',
    ...overrides,
  };
}

const TODAY = '2026-08-24';

describe('eventsFor', () => {
  it('turns a confirmed period into its three dates, oldest first', () => {
    const events = eventsFor(
      [
        exam({
          nextPeriod: {
            label: 'Höst',
            applicationStart: '2026-08-10',
            applicationEnd: '2026-08-28',
            examWindowStart: '2026-09-28',
            examWindowEnd: '2026-11-06',
            confirmed: true,
          },
        }),
      ],
      TODAY,
    );
    expect(events.map((e) => [e.date, e.kind])).toEqual([
      ['2026-08-10', 'opens'],
      ['2026-08-28', 'closes'],
      ['2026-09-28', 'exam'],
    ]);
  });

  it('marks the dates that have been, and only those', () => {
    const events = eventsFor(
      [
        exam({
          nextPeriod: {
            label: 'Höst',
            applicationStart: '2026-08-10',
            applicationEnd: '2026-08-28',
            confirmed: true,
          },
        }),
      ],
      TODAY,
    );
    expect(events.map((e) => e.past)).toEqual([true, false]);
  });

  it('counts today itself as not yet past', () => {
    const events = eventsFor(
      [exam({ nextPeriod: { label: 'I dag', applicationEnd: TODAY, confirmed: true } })],
      TODAY,
    );
    expect(events[0].past).toBe(false);
  });

  it('ignores a period the provider hasn’t confirmed', () => {
    expect(eventsFor([exam()], TODAY)).toEqual([]);
  });

  it('ignores a fullbokad round entirely', () => {
    // Its card is red because nothing on it can be acted on. A blue "Anmälan
    // öppnar" for the same round would be the app arguing with itself.
    const full = exam({
      nextPeriod: {
        label: 'Höst',
        applicationStart: '2026-09-01',
        applicationEnd: '2026-09-20',
        confirmed: true,
        full: true,
      },
    });
    expect(eventsFor([full], TODAY)).toEqual([]);
  });
});

describe('toneFor', () => {
  it('gives a coming date its own colour', () => {
    const [ev] = eventsFor(
      [exam({ nextPeriod: { label: 'x', applicationEnd: '2026-09-30', confirmed: true } })],
      TODAY,
    );
    expect(toneFor(ev)).toBe(EVENT_TONES.closes);
  });

  it('greys a date that has been, whatever kind it was', () => {
    const [ev] = eventsFor(
      [exam({ nextPeriod: { label: 'x', applicationEnd: '2026-07-01', confirmed: true } })],
      TODAY,
    );
    expect(toneFor(ev)).toBe(PAST_TONE);
  });
});

describe('nextOpening', () => {
  it('finds the soonest opening still ahead', () => {
    const list = [
      exam({
        id: 'a',
        nextPeriod: { label: 'a', applicationStart: '2026-11-01', confirmed: true },
      }),
      exam({
        id: 'b',
        nextPeriod: { label: 'b', applicationStart: '2026-09-01', confirmed: true },
      }),
    ];
    expect(nextOpening(list, TODAY)?.date).toBe('2026-09-01');
  });

  it('never points at an opening that has been', () => {
    const list = [
      exam({ nextPeriod: { label: 'a', applicationStart: '2026-08-01', confirmed: true } }),
    ];
    expect(nextOpening(list, TODAY)).toBeUndefined();
  });
});

describe('payableTotal', () => {
  const open = exam({
    id: 'open',
    price: 500,
    nextPeriod: {
      label: 'Öppen',
      applicationStart: '2026-08-01',
      applicationEnd: '2026-12-01',
      confirmed: true,
    },
  });
  const closed = exam({
    id: 'closed',
    price: 900,
    nextPeriod: { label: 'Stängd', applicationEnd: '2026-07-01', confirmed: true },
  });
  const full = exam({
    id: 'full',
    price: 700,
    nextPeriod: {
      label: 'Full',
      applicationStart: '2026-08-01',
      applicationEnd: '2026-12-01',
      confirmed: true,
      full: true,
    },
  });

  it('sums only what can still be booked', () => {
    expect(payableTotal([open, closed, full])).toEqual({ total: 500, count: 1, unreachable: 2 });
  });

  it('counts an undated round — the provider hasn’t closed anything', () => {
    expect(payableTotal([exam({ price: 400 })])).toEqual({ total: 400, count: 1, unreachable: 0 });
  });

  it('is zero for nothing saved', () => {
    expect(payableTotal([])).toEqual({ total: 0, count: 0, unreachable: 0 });
  });
});
