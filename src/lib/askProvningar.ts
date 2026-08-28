import { Exam } from '../types';
import { compareByPeriod, hasApplicationClosed, hasPeriodPassed } from './examStatus';

/**
 * Reads a sentence a student would actually type and turns it into the three
 * things that decide which listings answer it: where they are, what they want
 * to pröva, and when it has to be done by.
 *
 * "Jag bor i Göteborg och vill höja mitt betyg i Matte 2b innan december" is
 * not a search query. Typed into the ordinary search box it matches nothing at
 * all, because no field contains that sentence — and the one part of it that a
 * filter could use ("innan december") has no filter to go to. This is the
 * translation layer between the two.
 *
 * Everything it knows about courses and cities is read out of the dataset at
 * call time rather than listed here, so a listing added tomorrow is
 * understandable tomorrow. The only hand-written knowledge is the alias table
 * below — the words people type that the dataset does not spell that way.
 */
export interface Interpretation {
  /** A `city` from the dataset the question named. */
  city?: string;
  /** A `region` (län) the question named, when no city matched. */
  region?: string;
  /** An exact `course` from the dataset ("Matematik 2b"). */
  course?: string;
  /** A `subject` ("Matematik") when the question named no level. */
  subject?: string;
  /** ISO date the exam has to have happened by. */
  before?: string;
  /** How the question said it, for quoting back ("december"). */
  beforeLabel?: string;
}

export interface AskResult {
  interpretation: Interpretation;
  /** One to three sentences, built only from what the dataset says. */
  answer: string;
  /** The listings that answer the question, most urgent first. */
  exams: Exam[];
  /**
   * True when nothing in the question was understood. The UI says so plainly
   * rather than showing 160 listings and calling it an answer.
   */
  emptyQuestion: boolean;
}

/**
 * Words people type for courses the dataset spells differently.
 *
 * Kept deliberately short. Every entry is a word a student writes and a
 * provider does not, so each one is a real miss it fixes — not a synonym
 * dictionary that will drift out of date on its own.
 */
const ALIASES: [RegExp, string][] = [
  [/\bmatte\b|\bmatematiken\b/g, 'matematik'],
  [/\bsva\b/g, 'svenska som andraspråk'],
  [/\bsvenska 2:?a\b/g, 'svenska som andraspråk'],
  [/\bsamhälls(kunskapen)?\b|\bsamhäll\b|\bsamma\b/g, 'samhällskunskap'],
  [/\bengelskan\b|\bengelska språket\b/g, 'engelska'],
  [/\bnaturkunskapen\b|\bnk\b/g, 'naturkunskap'],
  [/\breligionen\b|\brelle\b/g, 'religionskunskap'],
  [/\bpsyket\b|\bpsykologin\b/g, 'psykologi'],
  [/\bbion\b|\bbiologin\b/g, 'biologi'],
  [/\bfysiken\b/g, 'fysik'],
  [/\bkemin\b/g, 'kemi'],
  [/\bhistorien\b/g, 'historia'],
  [/\bföretagsekonomin\b|\bfek\b/g, 'företagsekonomi'],
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

function normalise(question: string): string {
  let q = ` ${question.toLowerCase()} `;
  for (const [pattern, replacement] of ALIASES) q = q.replace(pattern, replacement);
  return q;
}

function iso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * The date the question's "innan …" points at, as the first day that is
 * already too late.
 *
 * "Innan december" means the exam has to be over before 1 December, so the
 * cutoff is 1 December and a prövning on 30 November still counts. Anything the
 * sentence doesn't say is left undated — a deadline nobody asked for silently
 * throws away listings.
 */
function findDeadline(q: string, now: Date): { before?: string; beforeLabel?: string } {
  const year = now.getFullYear();

  const explicit = q.match(/\b(?:innan|före|senast|fram till)\s+(\d{1,2})\s+([a-zåäö]+)/);
  if (explicit) {
    const monthIndex = MONTHS.indexOf(explicit[2]);
    if (monthIndex >= 0) {
      const day = Number(explicit[1]);
      const candidate = new Date(Date.UTC(year, monthIndex, day));
      const target =
        candidate.getTime() < now.getTime()
          ? new Date(Date.UTC(year + 1, monthIndex, day))
          : candidate;
      return { before: iso(target), beforeLabel: `${day} ${explicit[2]}` };
    }
  }

  const month = q.match(/\b(?:innan|före|senast|fram till|inför)\s+([a-zåäö]+)/);
  if (month) {
    const monthIndex = MONTHS.indexOf(month[1]);
    if (monthIndex >= 0) {
      const candidate = new Date(Date.UTC(year, monthIndex, 1));
      const target =
        candidate.getTime() < now.getTime()
          ? new Date(Date.UTC(year + 1, monthIndex, 1))
          : candidate;
      return { before: iso(target), beforeLabel: month[1] };
    }
    if (/\bjul\b|\bjulen\b|\bårsskiftet\b|\bnyår\b/.test(month[1])) {
      return { before: iso(new Date(Date.UTC(year, 11, 24))), beforeLabel: 'jul' };
    }
  }

  if (/\b(?:innan|före)\s+(?:jul|julen|årsskiftet|nyår)\b/.test(q)) {
    return { before: iso(new Date(Date.UTC(year, 11, 24))), beforeLabel: 'jul' };
  }
  if (/\bi år\b|\bdetta år\b|\binnan årets slut\b/.test(q)) {
    return { before: iso(new Date(Date.UTC(year, 11, 31))), beforeLabel: 'årets slut' };
  }
  if (/\bi höst\b|\bunder hösten\b|\bhösten\b|\bhöstterminen\b/.test(q)) {
    return { before: iso(new Date(Date.UTC(year, 11, 31))), beforeLabel: 'höstterminen' };
  }

  const within = q.match(/\binom\s+(?:en|ett|två|tre|\d+)\s+(vecka|veckor|månad|månader)\b/);
  if (within) {
    const words: Record<string, number> = { en: 1, ett: 1, två: 2, tre: 3 };
    const raw = within[0].split(/\s+/)[1];
    const count = words[raw] ?? (Number(raw) || 1);
    const days = within[1].startsWith('vecka') ? count * 7 : count * 30;
    const target = new Date(now.getTime() + days * 86_400_000);
    return { before: iso(target), beforeLabel: within[0].replace(/^inom\s+/, 'inom ') };
  }

  return {};
}

/** Longest match wins, so "Svenska som andraspråk 1" beats "Svenska 1". */
function longestMatch(q: string, candidates: string[]): string | undefined {
  return candidates
    .filter((candidate) => q.includes(candidate.toLowerCase()))
    .sort((a, b) => b.length - a.length)[0];
}

export function interpret(question: string, exams: Exam[], now = new Date()): Interpretation {
  const q = normalise(question);

  const city = longestMatch(q, [...new Set(exams.map((e) => e.city))]);
  const region = city ? undefined : longestMatch(q, [...new Set(exams.map((e) => e.region))]);

  // A course is only claimed when the question names the level too — "matte"
  // alone is a subject, and answering it with Matematik 1a would be a guess
  // about which course the person needs.
  const courses = [...new Set(exams.map((e) => e.course))].filter((c) => /\d/.test(c));
  const course = longestMatch(q, courses);
  const subject = course ? undefined : longestMatch(q, [...new Set(exams.map((e) => e.subject))]);

  return { city, region, course, subject, ...findDeadline(q, now) };
}

/** The date this round would actually give you a grade on, if it has one. */
function examDate(exam: Exam): string | undefined {
  const { nextPeriod: p } = exam;
  if (!p.confirmed) return undefined;
  return p.examWindowEnd || p.examWindowStart || p.applicationEnd;
}

function svDate(isoDate: string): string {
  const [, month, day] = isoDate.split('-');
  return `${Number(day)} ${MONTHS[Number(month) - 1]}`;
}

/**
 * Answers a free-text question from the dataset and nothing else.
 *
 * Every sentence it returns is assembled from fields that exist on the
 * listings it returns with it, which is the whole reason this is a function
 * and not a prompt: it cannot invent a date, a fee, or a school, because it has
 * no way to write one down. When it has to widen the search to find anything —
 * out of the city, past the deadline — it says so in the answer rather than
 * quietly returning something that doesn't match what was asked.
 */
export function askProvningar(question: string, exams: Exam[], now = new Date()): AskResult {
  const interpretation = interpret(question, exams, now);
  const { city, region, course, subject, before, beforeLabel } = interpretation;
  const emptyQuestion = !city && !region && !course && !subject && !before;

  if (emptyQuestion) {
    return {
      interpretation,
      answer:
        'Skriv var du bor och vilken kurs du vill pröva, så letar jag upp tillfällena — ' +
        'till exempel "jag bor i Göteborg och vill höja Matte 2b innan december".',
      exams: [],
      emptyQuestion: true,
    };
  }

  const bySubject = (e: Exam) =>
    course ? e.course === course : subject ? e.subject === subject : true;
  const byPlace = (e: Exam) => (city ? e.city === city : region ? e.region === region : true);
  const stillAhead = (e: Exam) => !hasPeriodPassed(e) && !hasApplicationClosed(e);
  const byDeadline = (e: Exam) => {
    if (!before) return true;
    const date = examDate(e);
    // An undated round can't be promised to land before a deadline, but it
    // can't be ruled out either — it stays, and its card says it has no date.
    return date === undefined || date < before;
  };

  const inPlace = exams.filter((e) => bySubject(e) && byPlace(e) && stillAhead(e));
  let matches = inPlace.filter(byDeadline);
  const notes: string[] = [];

  if (matches.length === 0 && before && inPlace.length > 0) {
    matches = inPlace;
    notes.push(
      `Ingen av dem hinner före ${beforeLabel}, så här är de närmaste tillfällena i stället.`,
    );
  }

  let leftThePlace = false;
  if (matches.length === 0 && (city || region)) {
    const anywhere = exams.filter((e) => bySubject(e) && stillAhead(e) && byDeadline(e));
    if (anywhere.length > 0) {
      matches = anywhere;
      leftThePlace = true;
      notes.push(
        `Ingen anordnare i ${city ?? region} har den öppen just nu — det här är resten av landet.`,
      );
    }
  }

  matches = [...matches].sort(compareByPeriod);

  const what = course ?? subject ?? 'prövningar';
  // Once the search has left the city, the city has to leave the sentence with
  // it. "7 prövningar i Kemi 1 i Malmö" followed by "ingen anordnare i Malmö
  // har den öppen" is the app contradicting itself inside one paragraph, and
  // the first half is the one a reader believes.
  const where = leftThePlace ? '' : city ? ` i ${city}` : region ? ` i ${region}` : '';
  const opening =
    matches.length === 0
      ? `Jag hittar ingen öppen prövning i ${what}${where} i datan just nu.`
      : `${matches.length} ${matches.length === 1 ? 'prövning' : 'prövningar'} i ${what}${where}.`;

  // A full round keeps its dates — the provider published them — but it never
  // supplies the deadline sentence. "Sista anmälningsdag 7 september" on a
  // round the provider has already called fullbokat is a countdown to a door
  // that is shut, which is the same mistake the status palette refuses to make
  // by never spending red on something you can still book.
  const bookable = matches.find((e) => !e.nextPeriod.full && e.nextPeriod.applicationEnd);
  const deadlineSentence = bookable
    ? ` Närmaste sista anmälningsdag är ${svDate(bookable.nextPeriod.applicationEnd!)} hos ${bookable.schoolName}.`
    : '';

  return {
    interpretation,
    answer: [opening + deadlineSentence, ...notes].join(' '),
    exams: matches,
    emptyQuestion: false,
  };
}
