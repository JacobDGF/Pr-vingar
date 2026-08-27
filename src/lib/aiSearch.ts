import { Exam } from '../types';
import { compareByPeriod, hasApplicationClosed, isOpenForRegistration } from './examStatus';

/**
 * Reading a sentence like "jag bor i Göteborg och vill höja mitt betyg i Matte
 * 2b innan december" against the dataset.
 *
 * This is the half of AI-prövning that does not need an API key, a network, or
 * anyone's trust. It reads the question against the dataset's own vocabulary —
 * the cities, subjects, courses and tags that are actually in `exams.ts` — and
 * returns the listings that match. That makes it three things at once: the
 * fallback when the API call fails, the context the model is given when it
 * doesn't, and the reason the answer can never be about a school we don't have.
 *
 * It deliberately knows nothing the dataset doesn't. There is no synonym list
 * of Swedish towns and no course ontology: if "Matte 2b" is to find
 * "Matematik 2b", it is because the dataset spells it that way somewhere the
 * matcher looks.
 */

export interface Interpretation {
  /** Cities named in the question, spelled as `exams.ts` spells them. */
  cities: string[];
  /** Län named in the question. */
  regions: string[];
  /** Subjects named in the question. */
  subjects: string[];
  /** Courses named in the question, longest name first. */
  courses: string[];
  /**
   * A deadline the user gave in words: "innan december", "före 15 oktober".
   * ISO date, inclusive — listings whose application closes after it are ranked
   * below, never hidden, because a user who says "innan december" usually means
   * "I'd like it before then", not "hide everything else".
   */
  before: string | null;
  /** True when the question asks about booking now ("kan jag fortfarande anmäla mig"). */
  openOnly: boolean;
}

const MONTHS: Record<string, number> = {
  januari: 1,
  februari: 2,
  mars: 3,
  april: 4,
  maj: 5,
  juni: 6,
  juli: 7,
  augusti: 8,
  september: 9,
  oktober: 10,
  november: 11,
  december: 12,
};

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const OPEN_HINTS = [
  'öppen',
  'öppna',
  'fortfarande',
  'hinner jag',
  'hinner',
  'kan jag anmäla',
  'går att anmäla',
  'söka nu',
];

/** "Matte 2b" and "matematik 2b" are the same request, and only one is in the data. */
function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/\bmatte\b/g, 'matematik')
    .replace(/\bsva\b/g, 'svenska som andraspråk')
    .replace(/\bsamhälls?kunskap\b/g, 'samhällskunskap')
    .replace(/\bnaturkunskap\b/g, 'naturkunskap')
    .replace(/[.,;:!?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Distinct values of one field across the dataset, longest first so
    "Matematik 2b" is tried before "Matematik". */
function vocabulary(exams: Exam[], pick: (e: Exam) => string): string[] {
  return [...new Set(exams.map(pick))].sort((a, b) => b.length - a.length);
}

/**
 * The last day of the month the user named, in the nearest sensible year.
 *
 * "innan december" written in August means this December; written in December
 * it means next year's. The rule is simply: never resolve to a month that has
 * already ended.
 */
function monthDeadline(month: number, now: Date): string {
  const year = month < now.getMonth() + 1 ? now.getFullYear() + 1 : now.getFullYear();
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const day = month === 2 && !leap ? 28 : DAYS_IN_MONTH[month - 1];
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function interpret(question: string, exams: Exam[], now = new Date()): Interpretation {
  const q = normalise(question);
  const has = (term: string) => q.includes(term.toLowerCase());

  // "innan/före 15 oktober" is a day; "innan december" is the whole month.
  let before: string | null = null;
  const dayMatch = /\b(?:innan|före|senast|fram till)\s+(?:den\s+)?(\d{1,2})\s+([a-zåäö]+)/.exec(q);
  const monthMatch = /\b(?:innan|före|senast|fram till)\s+(?:i\s+)?([a-zåäö]+)/.exec(q);
  if (dayMatch && MONTHS[dayMatch[2]]) {
    const month = MONTHS[dayMatch[2]];
    const iso = monthDeadline(month, now);
    before = `${iso.slice(0, 8)}${String(Number(dayMatch[1])).padStart(2, '0')}`;
  } else if (monthMatch && MONTHS[monthMatch[1]]) {
    before = monthDeadline(MONTHS[monthMatch[1]], now);
  }

  return {
    cities: vocabulary(exams, (e) => e.city).filter(has),
    regions: vocabulary(exams, (e) => e.region).filter(has),
    subjects: vocabulary(exams, (e) => e.subject).filter(has),
    courses: vocabulary(exams, (e) => e.course).filter(has),
    before,
    openOnly: OPEN_HINTS.some(has),
  };
}

export interface Match {
  exam: Exam;
  /** How many things in the question this listing answers. Ranking only. */
  score: number;
}

/**
 * Rank the dataset against an interpreted question.
 *
 * Nothing is filtered out except on an explicit "can I still apply" — a
 * question that names Göteborg should still be able to show a Malmö listing at
 * the bottom rather than an empty screen, because "there is nothing" is a much
 * stronger claim than the matcher is entitled to make.
 */
export function rank(question: string, exams: Exam[], now = new Date()): Match[] {
  const read = interpret(question, exams, now);
  const named =
    read.cities.length + read.regions.length + read.subjects.length + read.courses.length;

  const pool = read.openOnly ? exams.filter(isOpenForRegistration) : exams;

  const scored = pool.map((exam) => {
    let score = 0;
    if (read.cities.includes(exam.city)) score += 3;
    if (read.regions.includes(exam.region)) score += 2;
    if (read.courses.includes(exam.course)) score += 4;
    if (read.subjects.includes(exam.subject)) score += 2;
    // A round the user can act on beats one they can only read about, but only
    // as a tiebreak — it never outweighs asking for the right course.
    if (isOpenForRegistration(exam)) score += 1;
    if (hasApplicationClosed(exam)) score -= 1;
    if (read.before && exam.nextPeriod.confirmed) {
      const end = exam.nextPeriod.examWindowEnd || exam.nextPeriod.applicationEnd;
      if (end && end <= read.before) score += 2;
    }
    return { exam, score };
  });

  // With nothing recognised in the question there is no ranking to do, and
  // pretending otherwise would put an arbitrary school at the top of an answer.
  // Soonest deadline first is the honest default, and it is the app's default.
  const ordered = named === 0 ? scored : scored.filter((m) => m.score > 1);

  return ordered.sort((a, b) => b.score - a.score || compareByPeriod(a.exam, b.exam));
}

/**
 * What the model is allowed to know.
 *
 * One object per listing, with the provider's own URL on every one, so the
 * answer can always be traced back to the page it came from. Fields the dataset
 * does not have are `null` rather than absent — an explicit null is something a
 * model will repeat back as "anordnaren har inte publicerat det", while a
 * missing key is an invitation to fill it in.
 */
export function toContext(exam: Exam) {
  const p = exam.nextPeriod;
  return {
    id: exam.id,
    kommun: exam.city,
    lan: exam.region,
    anordnare: exam.schoolName,
    amne: exam.subject,
    kurs: exam.course,
    kurskod: exam.courseCode,
    niva: exam.level,
    avgift_sek: exam.price,
    avgift_villkor: exam.priceNote ?? null,
    anmalan_oppnar: p.confirmed ? (p.applicationStart ?? null) : null,
    sista_anmalan: p.confirmed ? (p.applicationEnd ?? null) : null,
    provdatum: p.confirmed ? (p.examWindowStart ?? null) : null,
    provdatum_slut: p.confirmed ? (p.examWindowEnd ?? null) : null,
    fullbokat: p.full === true,
    anmalan_oppen_idag: isOpenForRegistration(exam),
    period_text: p.label,
    adress: exam.address,
    kalla_url: exam.infoUrl,
    anmalan_url: exam.registrationUrl,
    senast_kontrollerad: exam.verifiedAt,
  };
}
