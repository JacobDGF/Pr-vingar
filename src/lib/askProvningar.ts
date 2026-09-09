import { Exam } from '../types';
import { compareByPeriod, hasApplicationClosed, isFullyBooked } from './examStatus';

/**
 * Reading a sentence about a prövning, without a server.
 *
 * The app's search takes a word. What people actually arrive with is a
 * sentence — "jag bor i Göteborg och vill höja mitt betyg i Matte 2b innan
 * december" — which carries four separate constraints (stad, kurs, deadline,
 * och att omgången faktiskt går att söka till) that the search box makes you
 * enter one at a time, in four different controls, having first learned that
 * they exist.
 *
 * This turns the sentence into those constraints. It is deliberately not a
 * language model: it reads the dataset's own vocabulary — every stad, län,
 * ämne, kurs and kurskod that actually exists in `EXAMS` — out of the data it
 * is handed, so it can never offer a course nobody prövar, and it cannot invent
 * a datum or an avgift because it never writes one. The model, when the app has
 * one configured, phrases the answer; the shortlist under it is always this.
 *
 * The other half of that bargain is that the reading is shown rather than
 * assumed: the tab prints what it understood above the results, so a
 * misreading is one visible line instead of a confident paragraph.
 */

export interface Ask {
  cities: string[];
  regions: string[];
  subjects: string[];
  courses: string[];
  /** ISO date the prövning must fall before, from "innan december" and friends. */
  before?: string;
}

export interface AskResult {
  ask: Ask;
  matches: Exam[];
  /**
   * True when the constraints as written matched nothing and the deadline and
   * "går att söka till" parts were dropped to have something to show. The UI
   * says so — silently widening a search is how a wrong answer gets trusted.
   */
  widened: boolean;
}

/** Everyday words for things the dataset spells out in full. */
const ALIASES: [RegExp, string][] = [
  [/\bmatte\b/g, 'matematik'],
  [/\bma\b/g, 'matematik'],
  [/\bsamhalls?\b/g, 'samhallskunskap'],
  [/\beng\b/g, 'engelska'],
  [/\bsva\b/g, 'svenska som andrasprak'],
  [/\bsfi\b/g, 'svenska for invandrare'],
  [/\bnk\b/g, 'naturkunskap'],
  [/\breligion\b/g, 'religionskunskap'],
  [/\bgbg\b/g, 'goteborg'],
  [/\bsthlm\b/g, 'stockholm'],
];

const MONTHS = [
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

/** Lowercase, de-accented, punctuation turned into spaces, padded for whole-word tests. */
function normalize(text: string): string {
  const folded = text
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  return ` ${folded} `;
}

function withAliases(padded: string): string {
  return ALIASES.reduce((text, [pattern, full]) => text.replace(pattern, full), padded);
}

function contains(haystack: string, term: string): boolean {
  const needle = normalize(term);
  return needle.trim() !== '' && haystack.includes(needle);
}

/**
 * The first of the named month strictly after `today`.
 *
 * "innan december" said in augusti means this december; said in december it
 * means the next one. Anchoring on today rather than on the calendar year is
 * the difference between a filter that still works in januari and one that
 * quietly returns nothing.
 */
function nextFirstOfMonth(monthIndex: number, today: Date): string {
  const year = today.getUTCFullYear();
  const thisYear = Date.UTC(year, monthIndex, 1);
  const y = thisYear > today.getTime() ? year : year + 1;
  return `${y}-${String(monthIndex + 1).padStart(2, '0')}-01`;
}

function readDeadline(padded: string, today: Date): string | undefined {
  if (!/\b(innan|fore|senast|inom)\b/.test(padded)) return undefined;
  for (let i = 0; i < MONTHS.length; i++) {
    if (padded.includes(` ${MONTHS[i]} `)) return nextFirstOfMonth(i, today);
  }
  if (padded.includes(' jul ') || padded.includes(' julen ')) return nextFirstOfMonth(11, today);
  if (padded.includes(' sommaren ')) return nextFirstOfMonth(5, today);
  if (padded.includes(' nyar ') || padded.includes(' arsskiftet ')) {
    return `${today.getUTCFullYear() + 1}-01-01`;
  }
  return undefined;
}

/** Distinct values of one field, longest first so "Matematik 2b" is tried before "Matematik". */
function vocabulary(exams: Exam[], pick: (e: Exam) => string): string[] {
  return [...new Set(exams.map(pick))].sort((a, b) => b.length - a.length);
}

/**
 * Still worth acting on: the deadline hasn't passed and the round isn't full.
 *
 * `today` is the same date the rest of the reader works from, not the wall
 * clock. The two halves of the answer used to disagree: "innan oktober" was
 * measured against the caller's date while "kan fortfarande sökas" quietly read
 * `Date.now()`, so the same question gave different answers on different days
 * with the same arguments — and the tests that pin a date drifted out of truth
 * as the real calendar moved past it.
 */
function stillActionable(exam: Exam, today: Date): boolean {
  return !hasApplicationClosed(exam, today.getTime()) && !isFullyBooked(exam);
}

function fallsBefore(exam: Exam, cutoff: string): boolean {
  const p = exam.nextPeriod;
  if (!p.confirmed) return false;
  const when = p.examWindowStart || p.applicationEnd;
  return !!when && when < cutoff;
}

export function readAsk(question: string, exams: Exam[], today = new Date()): Ask {
  const padded = withAliases(normalize(question));
  const matching = (terms: string[]) => terms.filter((term) => contains(padded, term));

  const courses = matching(vocabulary(exams, (e) => e.course));
  for (const code of matching(vocabulary(exams, (e) => e.courseCode))) {
    for (const exam of exams) {
      if (exam.courseCode === code && !courses.includes(exam.course)) courses.push(exam.course);
    }
  }

  return {
    cities: matching(vocabulary(exams, (e) => e.city)),
    regions: matching(vocabulary(exams, (e) => e.region)),
    subjects: matching(vocabulary(exams, (e) => e.subject)),
    courses,
    before: readDeadline(padded, today),
  };
}

export function hasConstraints(ask: Ask): boolean {
  return !!(
    ask.cities.length ||
    ask.regions.length ||
    ask.subjects.length ||
    ask.courses.length ||
    ask.before
  );
}

/**
 * The listings a question asks for, most urgent first.
 *
 * The deadline and "kan fortfarande sökas" are the two constraints dropped
 * together when nothing survives them, because they are the two the user did
 * not so much choose as assume. Dropping the stad or the kurs instead would
 * answer a different question than the one asked.
 */
export function answerAsk(question: string, exams: Exam[], today = new Date()): AskResult {
  const ask = readAsk(question, exams, today);

  const named = exams.filter((e) => {
    const cityOk = !ask.cities.length || ask.cities.includes(e.city);
    const regionOk = !ask.regions.length || ask.regions.includes(e.region);
    const subjectOk = !ask.subjects.length || ask.subjects.includes(e.subject);
    const courseOk = !ask.courses.length || ask.courses.includes(e.course);
    return cityOk && regionOk && subjectOk && courseOk;
  });

  const strict = named.filter(
    (e) => stillActionable(e, today) && (!ask.before || fallsBefore(e, ask.before)),
  );
  const matches = (strict.length ? strict : named).slice().sort(compareByPeriod);
  return { ask, matches, widened: strict.length === 0 && named.length > 0 };
}

/** One line saying what the sentence was read as, for the user to check. */
export function describeAsk(ask: Ask): string {
  const parts: string[] = [];
  if (ask.courses.length) parts.push(ask.courses.join(', '));
  else if (ask.subjects.length) parts.push(ask.subjects.join(', '));
  if (ask.cities.length) parts.push(`i ${ask.cities.join(', ')}`);
  else if (ask.regions.length) parts.push(`i ${ask.regions.join(', ')} län`);
  if (ask.before) parts.push(`före ${MONTHS[Number(ask.before.split('-')[1]) - 1]}`);
  return parts.join(' ');
}
