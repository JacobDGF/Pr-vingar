import { Exam } from '../types';
import { compareByPeriod, hasApplicationClosed, isFullyBooked } from './examStatus';

/**
 * The placeholder a "one card, many courses" listing carries instead of a
 * kurskod. Those listings say "kontakta skolan för kurskod", which is exactly
 * the thing that cannot be compared against another provider's row.
 */
const NO_CODE = 'Varierar';

/** True when this listing names one course precisely enough to line up with another's. */
export function hasComparableCourse(exam: Exam): boolean {
  return exam.courseCode !== NO_CODE;
}

/** Still worth acting on: the deadline hasn't passed and the round isn't full. */
export function canStillBook(exam: Exam, now = Date.now()): boolean {
  return !hasApplicationClosed(exam, now) && !isFullyBooked(exam);
}

/**
 * The other listings that prövar the same course, the ones you can still book
 * first.
 *
 * Half the dataset is now the same handful of courses offered by different
 * providers — Matematik 1c is prövad in five kommuner by four anordnare, each
 * with its own avgift, deadline and prövningsperiod. Until now the app could
 * only show that by accident: you had to guess that another provider existed,
 * search for the course, and read the list. A listing whose anmälan closed in
 * August was a dead end, even when an identical round somewhere else is open
 * until October.
 *
 * The match is on `courseCode`, not on the course's name, because the code is
 * the national identity of the course and the name is whatever the provider
 * wrote in its catalogue ("Matematik 3b" and "Matematik 3b/3c" are one course
 * under `MATMAT03b`). The caller shows the other listing's own course name
 * whenever it differs, so a shared code never silently claims two rows are word
 * for word the same thing.
 *
 * Sorted with everything still bookable ahead of everything that isn't, and
 * within each half by how soon the user has to act. That order is the whole
 * point: the first row is the answer to "where can I still do this".
 */
/**
 * The one sentence above the list.
 *
 * The count on its own is trivia — "4 andra listningar" tells nobody what to
 * do. What decides whether the list below is worth reading is how many of them
 * are still open, and when the answer is none, saying so plainly beats a
 * cheerful sentence about the sort order.
 */
export function describeOthers(total: number, live: number, courseCode: string): string {
  if (live === 0) {
    return total === 1
      ? `Den andra listningen på ${courseCode} tar inte emot anmälningar just nu.`
      : `${total} andra prövar ${courseCode}, men ingen av dem tar emot anmälningar just nu.`;
  }
  if (live === total) {
    return total === 1
      ? `Den går fortfarande att anmäla sig till.`
      : `Alla ${total} går fortfarande att anmäla sig till.`;
  }
  return `${live} av ${total} går fortfarande att anmäla sig till, och står först.`;
}

export function otherProvidersFor(exam: Exam, exams: Exam[], now = Date.now()): Exam[] {
  if (!hasComparableCourse(exam)) return [];
  return exams
    .filter((e) => e.id !== exam.id && e.courseCode === exam.courseCode)
    .sort((a, b) => {
      const liveA = canStillBook(a, now);
      const liveB = canStillBook(b, now);
      if (liveA !== liveB) return liveA ? -1 : 1;
      return compareByPeriod(a, b);
    });
}
