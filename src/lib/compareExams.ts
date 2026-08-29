import { Exam } from '../types';
import { getExamStatus } from './examStatusColor';
import { getRegistrationFlow } from './registrationFlow';

/**
 * Two saved prövningar, side by side.
 *
 * Saving is easy — most people end up with the same course at three or four
 * schools, because that is what the search returns. Deciding between them is
 * the hard part, and it was the one thing the app never helped with: the facts
 * that separate them (500 kr or 700, a deadline next week or in March, a form
 * you finish in three minutes or a blankett you print and post) live one tap
 * deep on each listing, so comparing three meant remembering nine numbers while
 * tapping between three sheets.
 *
 * The rows below are that comparison, and nothing else. Every row is a fact
 * somebody actually chooses on. Description, study tips and the provider's
 * paragraph are not here — they are worth reading about the one you pick, never
 * worth reading three of.
 */
export interface CompareRow {
  key: string;
  /** The row's name in the sticky first column. */
  label: string;
  /** One cell per exam, in the order they were passed in. */
  values: string[];
  /**
   * True when the cells are not all the same.
   *
   * This is the whole reason the table is worth looking at. Nine rows of
   * identical "500 kr" is what a comparison looks like when nothing separates
   * the options, and reading them costs the same as reading the rows that do
   * separate them. The view mutes the rows that agree so the eye lands on the
   * ones that decide, which on most of this dataset is two rows out of nine.
   */
  differs: boolean;
}

const NONE = '—';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function price(exam: Exam): string {
  return exam.price === 0 ? 'Kostnadsfri' : `${exam.price.toLocaleString('sv-SE')} kr`;
}

/**
 * The exam window as one cell.
 *
 * A single-day window ("26 okt – 26 okt") reads as a range that failed to
 * render, so a window with the same start and end is said once.
 */
function examWindow(exam: Exam): string {
  const { nextPeriod: p } = exam;
  if (!p.confirmed || !p.examWindowStart) return NONE;
  if (!p.examWindowEnd || p.examWindowEnd === p.examWindowStart) {
    return formatDate(p.examWindowStart);
  }
  return `${formatDate(p.examWindowStart)} – ${formatDate(p.examWindowEnd)}`;
}

function applicationDate(exam: Exam, end: boolean): string {
  const { nextPeriod: p } = exam;
  if (!p.confirmed) return NONE;
  const date = end ? p.applicationEnd : p.applicationStart;
  return date ? formatDate(date) : NONE;
}

const ROWS: { key: string; label: string; value: (exam: Exam) => string }[] = [
  { key: 'status', label: 'Läge', value: (e) => getExamStatus(e).label },
  { key: 'price', label: 'Avgift', value: price },
  // The note is a row of its own rather than a parenthesis after the number:
  // "500 kr" is comparable at a glance, "500 kr (kostnadsfritt om du redan har
  // betyg F i kursen)" is a sentence, and a sentence in a number column stops
  // the column being scannable for every other listing in it.
  { key: 'priceNote', label: 'Om avgiften', value: (e) => e.priceNote || NONE },
  { key: 'opens', label: 'Anmälan öppnar', value: (e) => applicationDate(e, false) },
  { key: 'closes', label: 'Sista anmälan', value: (e) => applicationDate(e, true) },
  { key: 'window', label: 'Prövningsperiod', value: examWindow },
  { key: 'flow', label: 'Så anmäler du dig', value: (e) => getRegistrationFlow(e).landing },
  { key: 'where', label: 'Var', value: (e) => `${e.schoolName}, ${e.city}` },
  { key: 'code', label: 'Kurskod', value: (e) => e.courseCode },
];

/**
 * Builds the comparison table for a set of listings.
 *
 * Returns an empty list for fewer than two exams: a comparison of one is a
 * detail sheet with the words taken out.
 */
export function buildComparison(exams: Exam[]): CompareRow[] {
  if (exams.length < 2) return [];
  return ROWS.map(({ key, label, value }) => {
    const values = exams.map(value);
    return { key, label, values, differs: new Set(values).size > 1 };
  });
}

/** How many rows actually separate these listings — the table's one headline. */
export function countDifferences(rows: CompareRow[]): number {
  return rows.filter((r) => r.differs).length;
}
