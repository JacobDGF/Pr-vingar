import { Exam } from '../types';

/** Whether an exam's application window is open right now, computed live
    against today's date. Only ever true for exams with confirmed, real
    dates — never guessed.

    Providers publish these windows half-open in both directions: some only say
    when applications close ("anmälan stänger 11 augusti"), others only when
    they open, and never publish a closing date. Either end alone is enough to
    place today inside or outside the window, so a period counts as open when
    every end it does state has been satisfied. */
export function isOpenForRegistration(exam: Exam): boolean {
  const { nextPeriod: p } = exam;
  if (!p.confirmed) return false;
  // A full round is closed however its dates read: the provider has said so
  // outright, and that beats the calendar.
  if (p.full) return false;
  if (!p.applicationStart && !p.applicationEnd) return false;
  const now = Date.now();
  if (p.applicationStart && now < new Date(p.applicationStart).getTime()) return false;
  if (p.applicationEnd && now > endOfDay(p.applicationEnd)) return false;
  return true;
}

/** True when the provider has published this round as fully booked. Kept
    separate from `isOpenForRegistration` so the UI can say *why* it is closed —
    "fullbokat" and "inte öppnat än" send the user to different next steps. */
export function isFullyBooked(exam: Exam): boolean {
  return exam.nextPeriod.full === true;
}

/** True when this round's published deadline is behind us.
 *
 * `isOpenForRegistration` returns false for three different situations, and
 * they are not the same errand: a round that hasn't opened is worth a reminder,
 * a full round is worth asking about a cancellation, and a round that closed
 * last Tuesday is worth nothing at all — the only useful move is to look for
 * the next one. Without this the card just shows a bold date that happens to be
 * in the past, which reads as an upcoming deadline at a glance.
 *
 * `now` exists for the callers that answer a question as of a stated date
 * rather than as of this instant — AI-prövning reads "innan oktober" against
 * one `today` and must weigh the deadlines against the same one. Left out, it
 * is the clock, which is what every view wants. */
export function hasApplicationClosed(exam: Exam, now: Date = new Date()): boolean {
  const { nextPeriod: p } = exam;
  if (!p.confirmed || !p.applicationEnd) return false;
  return now.getTime() > endOfDay(p.applicationEnd);
}

/**
 * What a card's narrow "Anmälan" cell should say.
 *
 * `nextPeriod.label` is a sentence, sometimes three — written for the detail
 * sheet, where there is room for it. The card used it as a fallback whenever a
 * provider published no closing date, which dropped 230 characters of bold text
 * into a half-width column: fifteen lines tall, pushing pris and nivå off the
 * card, and burying the one word that mattered ("fullbokad") in the middle of
 * it. The cell gets the deadline, or the shortest true thing there is to say.
 *
 * The full sentence is not lost — it is one tap away, under Viktiga datum.
 */
export type ApplicationCell =
  /** Show the published deadline. */
  | 'deadline'
  /** The provider has said the round is full; no date is worth showing. */
  | 'full'
  /** Open, but the provider published no closing date. */
  | 'open'
  /** Dated, and the window hasn't opened yet. */
  | 'opens'
  /** Nothing dated enough to say anything. */
  | 'provider';

export function applicationCell(exam: Exam): ApplicationCell {
  const { nextPeriod: p } = exam;
  if (!p.confirmed) return 'provider';
  // Said before the dates, because a full round with an open-looking window is
  // exactly the case where the dates mislead.
  if (p.full) return 'full';
  if (p.applicationEnd) return 'deadline';
  if (p.applicationStart) {
    return Date.now() < new Date(p.applicationStart).getTime() ? 'opens' : 'open';
  }
  return 'provider';
}

/** True when nothing this round offers lies ahead any more — the application
    closed *and* the exam window is over. */
export function hasPeriodPassed(exam: Exam): boolean {
  const { nextPeriod: p } = exam;
  if (!p.confirmed) return false;
  const last = p.examWindowEnd || p.examWindowStart || p.applicationEnd;
  if (!last) return false;
  return Date.now() > endOfDay(last);
}

/** Sort key for "närmast i tiden först".
 *
 * A deadline that has already passed is not the most urgent thing in the list,
 * even though its date sorts first in a plain string compare — that put dead
 * rounds at the top of the default view. Rounds still ahead of the user come
 * first in date order, then rounds with no published date, and last the ones
 * that are over. */
export function periodSortRank(exam: Exam): [number, string] {
  const { nextPeriod: p } = exam;
  const date = p.confirmed ? p.applicationEnd || p.examWindowStart : undefined;
  if (!date) return [1, ''];
  if (hasPeriodPassed(exam) || hasApplicationClosed(exam)) return [2, date];
  return [0, date];
}

/** Compares two exams by how soon the user has to act. Ties fall back to the
    school's name so the order is stable between renders. */
export function compareByPeriod(a: Exam, b: Exam): number {
  const [rankA, dateA] = periodSortRank(a);
  const [rankB, dateB] = periodSortRank(b);
  if (rankA !== rankB) return rankA - rankB;
  if (dateA && dateB && dateA !== dateB) return dateA.localeCompare(dateB);
  return a.schoolName.localeCompare(b.schoolName, 'sv');
}

export function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** A deadline of "23 augusti" means end of that day, not 00:00 that morning —
    otherwise the last day of an application window reads as already closed. */
function endOfDay(dateStr: string): number {
  const d = new Date(dateStr);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}
