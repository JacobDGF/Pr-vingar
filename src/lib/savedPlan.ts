import { Exam } from '../types';
import { getExamAction } from './examAction';
import { isFullyBooked } from './examStatus';

/**
 * What the saved rounds add up to: the dates they put in a calendar, and the
 * money they can still cost you.
 *
 * Both were computed inline in the tab, and both counted rounds the rest of the
 * app had already ruled out. "Att betala" summed every saved listing, including
 * the fullbokade and the ones whose anmälan closed in July — a number that
 * promised a price for seats nobody can buy. The calendar coloured a deadline
 * that passed three weeks ago exactly like one that is a week away.
 *
 * The rule is the one the listings already follow: a round you cannot act on
 * does not get to look like one you can.
 */

/** The three kinds of date a saved round can put in your calendar. */
export type EventKind = 'opens' | 'closes' | 'exam';

export interface EventTone {
  label: string;
  dot: string;
  tint: string;
  ink: string;
}

export const EVENT_TONES: Record<EventKind, EventTone> = {
  opens: {
    label: 'Anmälan öppnar',
    dot: 'bg-brand-500',
    tint: 'bg-brand-50',
    ink: 'text-brand-700',
  },
  closes: {
    label: 'Anmälan stänger',
    dot: 'bg-orange-600',
    tint: 'bg-orange-50',
    ink: 'text-orange-700',
  },
  exam: {
    label: 'Prövningsperiod',
    dot: 'bg-accent2-500',
    tint: 'bg-accent2-50',
    ink: 'text-accent2-700',
  },
};

/**
 * A date that has been. Grey is what the rest of the app spends on a round that
 * closed, so it is what a day that has been gets here — the same grey, from the
 * same idea, rather than a fourth colour with its own meaning.
 */
export const PAST_TONE: EventTone = {
  label: 'Varit',
  dot: 'bg-ink-faint',
  tint: 'bg-sand',
  ink: 'text-ink-faint',
};

export interface CalEvent {
  date: string;
  kind: EventKind;
  title: string;
  where: string;
  /** True when the date is before today. */
  past: boolean;
}

export function toneFor(event: CalEvent): EventTone {
  return event.past ? PAST_TONE : EVENT_TONES[event.kind];
}

/** Today as `YYYY-MM-DD` in local time — `toISOString` would shift the day. */
export function todayIso(now: Date = new Date()): string {
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
}

/**
 * The dates the saved rounds put in a calendar, oldest first.
 *
 * A fullbokad round contributes nothing. Every date it has is about applying to
 * or sitting a prövning the provider has already said is full, and the card for
 * it is red for exactly that reason — a blue "Anmälan öppnar 27 sep." in the
 * same view would be the app arguing with itself.
 */
export function eventsFor(exams: Exam[], today: string = todayIso()): CalEvent[] {
  const out: CalEvent[] = [];
  for (const e of exams) {
    const p = e.nextPeriod;
    if (!p.confirmed || isFullyBooked(e)) continue;
    const where = `${e.course} · ${e.schoolName}`;
    const add = (date: string, kind: EventKind, title: string) =>
      out.push({ date, kind, title, where, past: date < today });
    if (p.applicationStart) add(p.applicationStart, 'opens', 'Anmälan öppnar');
    if (p.applicationEnd) add(p.applicationEnd, 'closes', 'Sista anmälningsdag');
    if (p.examWindowStart) add(p.examWindowStart, 'exam', 'Prövningsperiod');
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

/** The next anmälan among the saved rounds that hasn't opened yet. */
export function nextOpening(exams: Exam[], today: string = todayIso()): CalEvent | undefined {
  return eventsFor(exams, today).find((e) => e.kind === 'opens' && e.date >= today);
}

export interface Payable {
  /** What the rounds you can still book cost, together. */
  total: number;
  /** How many of the saved rounds that is. */
  count: number;
  /** How many are closed or full, and therefore cost nothing. */
  unreachable: number;
}

/**
 * What the saved rounds can still cost.
 *
 * `getExamAction(...).live` is the same predicate the detail sheet uses to
 * decide whether to show a booking button at all, so the total can never
 * include a round the app refuses to let you book.
 */
export function payableTotal(exams: Exam[]): Payable {
  let total = 0;
  let count = 0;
  for (const exam of exams) {
    if (!getExamAction(exam).live) continue;
    total += exam.price;
    count += 1;
  }
  return { total, count, unreachable: exams.length - count };
}
