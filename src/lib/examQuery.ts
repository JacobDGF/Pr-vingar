import { Exam } from '../types';
import { compareByPeriod, hasApplicationClosed, isOpenForRegistration } from './examStatus';

/**
 * Reads a sentence and answers it out of the dataset.
 *
 * The rest of the app asks the user to take their question apart first: pick a
 * kommun in one filter, an ämne in another, sort by date, then read the cards
 * to work out which rounds they can still make. The sentence they arrived with
 * — "jag bor i Göteborg och vill höja mitt betyg i Matte 2b innan december" —
 * already contains all three, and it is the only form most people have their
 * question in.
 *
 * So the parsing happens here, against the dataset itself: every kommun, län,
 * kurs and kurskod the app knows is a term this understands, because they are
 * read out of `EXAMS` rather than kept in a list beside it. Nothing is
 * generated, guessed or fetched — a match is a listing that is really there,
 * with the dates and the avgift the provider published and the link back to
 * where they published them. The one thing this must never do is invent a
 * date, and the surest way to keep that promise is to have no way to say
 * anything the data does not already say.
 */

export interface ParsedQuery {
  /** Kommuner named in the sentence, exactly as the dataset spells them. */
  cities: string[];
  /** Län named in the sentence. */
  regions: string[];
  /** Whole courses named ("Matematik 2b"), exactly as the dataset spells them. */
  courses: string[];
  /** Subjects named ("Matematik"), when no single course was. */
  subjects: string[];
  /** ISO date the user wants to be finished by, from "innan december" & co. */
  before?: string;
  /** True when the sentence is about applying, not just browsing. */
  wantsOpen: boolean;
}

export interface QueryMatch {
  exam: Exam;
  score: number;
  /**
   * Whether this round is over by the date the user named — `null` when the
   * provider has published no end date to compare against.
   *
   * Three states, not two, because "we don't know" is not "no". A listing whose
   * provider has only said when anmälan opens would otherwise be labelled "blir
   * inte klar till din tid", which is a claim about a date nobody has
   * published — the exact thing this screen must never do.
   */
  inTime: boolean | null;
}

export interface QueryAnswer {
  parsed: ParsedQuery;
  matches: QueryMatch[];
  /** True when nothing in the sentence was recognised at all. */
  understoodNothing: boolean;
  /**
   * Set when the answer had to widen the question to have anything to show —
   * the course exists but not in that kommun, say. The UI says so out loud
   * rather than quietly answering a question nobody asked.
   */
  widened?: 'city' | 'before';
}

/** Everyday shorthand → the word the dataset uses. Longest first. */
const SYNONYMS: [RegExp, string][] = [
  [/\bmatte\b/g, 'matematik'],
  [/\bma\b/g, 'matematik'],
  [/\bsva\b/g, 'svenska som andraspråk'],
  [/\bsvenska 2 som andraspråk\b/g, 'svenska som andraspråk 2'],
  [/\beng\b/g, 'engelska'],
  [/\bsamhälle\b/g, 'samhällskunskap'],
  [/\bsamhällis\b/g, 'samhällskunskap'],
  [/\bsam\b/g, 'samhällskunskap'],
  [/\bnk\b/g, 'naturkunskap'],
  [/\bfys\b/g, 'fysik'],
  [/\bbio\b/g, 'biologi'],
  [/\bidrott\b/g, 'idrott och hälsa'],
  [/\breligion\b/g, 'religionskunskap'],
  [/\bgbg\b/g, 'göteborg'],
  [/\bsthlm\b/g, 'stockholm'],
  [/\bstan\b/g, 'stockholm'],
];

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

/** "vill anmäla", "hinner jag", "innan" — words that mean *bookable*, not *exists*. */
const APPLYING = /\b(anmäl|hinn|innan|före|senast|kan jag|vill|behöver|måste|deadline)/;

function normalise(text: string): string {
  let t = ` ${text
    .toLowerCase()
    .replace(/[.,;:!?"()]/g, ' ')
    .replace(/\s+/g, ' ')} `;
  for (const [re, to] of SYNONYMS) t = t.replace(re, to);
  return t;
}

function iso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * The date the user has to be finished by, when they named one.
 *
 * "innan december" is a deadline, not a date: what it means is "the exam has to
 * be over before December starts", so it resolves to the last day of November.
 * A named day ("före 15 oktober") means that day itself. Everything is read
 * forward from `now` — a December sentence written in December means next
 * December, not one that has already been.
 */
function parseBefore(text: string, now: Date): string | undefined {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const dayMonth = text.match(
    /\b(?:innan|före|senast|inför)\s+(?:den\s+)?(\d{1,2})\s*(januari|februari|mars|april|maj|juni|juli|augusti|september|oktober|november|december)\b/,
  );
  if (dayMonth) {
    const m = MONTHS[dayMonth[2]];
    return iso(m < month ? year + 1 : year, m, Number(dayMonth[1]));
  }

  const bareMonth = text.match(
    /\b(?:innan|före|senast|inför)\s+(januari|februari|mars|april|maj|juni|juli|augusti|september|oktober|november|december)\b/,
  );
  if (bareMonth) {
    const m = MONTHS[bareMonth[1]];
    const y = m <= month ? year + 1 : year;
    // The day before that month begins.
    const d = new Date(Date.UTC(y, m - 1, 1));
    d.setUTCDate(0);
    return d.toISOString().slice(0, 10);
  }

  if (/\binnan jul\b|\bföre jul\b/.test(text)) return iso(month === 12 ? year + 1 : year, 12, 23);
  // Terms, in the words people use for them. Autumn runs to the last day of
  // December, spring to the last day of June — the same boundaries komvux uses.
  if (/\b(i höst|höstterminen|denna termin|den här terminen)\b/.test(text)) {
    return iso(year, 12, 31);
  }
  if (/\b(i vår|vårterminen|till våren)\b/.test(text)) {
    return iso(month >= 7 ? year + 1 : year, 6, 30);
  }
  return undefined;
}

/** Every distinct value of one field, longest first so "Matematik 2b" beats "Matematik". */
function vocabulary(exams: Exam[], of: (e: Exam) => string): string[] {
  return [...new Set(exams.map(of))].sort((a, b) => b.length - a.length);
}

export function parseQuery(text: string, exams: Exam[], now = new Date()): ParsedQuery {
  const t = normalise(text);
  const has = (term: string) =>
    t.includes(` ${term.toLowerCase()} `) || t.includes(` ${term.toLowerCase()},`);

  const cities = vocabulary(exams, (e) => e.city).filter(has);
  const regions = vocabulary(exams, (e) => e.region).filter(
    (r) => has(r) || t.includes(` ${r.toLowerCase()}s län `),
  );
  const courses = vocabulary(exams, (e) => e.course).filter(has);
  const codes = vocabulary(exams, (e) => e.courseCode).filter(has);
  const byCode = exams.filter((e) => codes.includes(e.courseCode)).map((e) => e.course);
  const allCourses = [...new Set([...courses, ...byCode])];

  // Only fall back to the subject when no course was named: "Matematik 2b" and
  // "Matematik" would otherwise both match, and the broader one drags in every
  // maths course in the country as an equal.
  const subjects = allCourses.length ? [] : vocabulary(exams, (e) => e.subject).filter(has);

  return {
    cities,
    regions,
    courses: allCourses,
    subjects,
    before: parseBefore(t, now),
    wantsOpen: APPLYING.test(t),
  };
}

/** Is this round over by `before`? `null` when the provider published no end. */
function finishesBy(exam: Exam, before: string): boolean | null {
  const { nextPeriod: p } = exam;
  if (!p.confirmed) return null;
  const end = p.examWindowEnd ?? p.examWindowStart ?? p.applicationEnd;
  return end === undefined ? null : end <= before;
}

function scoreOne(exam: Exam, q: ParsedQuery, ignorePlace: boolean): number | null {
  let score = 0;
  if (q.courses.length) {
    if (!q.courses.includes(exam.course)) return null;
    score += 60;
  } else if (q.subjects.length) {
    if (!q.subjects.includes(exam.subject)) return null;
    score += 30;
  }
  // Widened, place still counts for something — it just no longer excludes.
  const inCity = q.cities.includes(exam.city);
  const inRegion = q.regions.includes(exam.region);
  if (!ignorePlace && (q.cities.length || q.regions.length) && !inCity && !inRegion) return null;
  if (inCity) score += 40;
  if (inRegion) score += 20;
  // A round you can book beats a round you can only read about, always — that
  // is the whole question the app exists to answer. It weighs even heavier when
  // the sentence was about applying ("hinner jag anmäla mig") rather than about
  // what exists.
  if (isOpenForRegistration(exam)) score += q.wantsOpen ? 55 : 35;
  else if (hasApplicationClosed(exam)) score -= 25;
  if (q.before && finishesBy(exam, q.before) === true) score += 25;
  return score;
}

const LIMIT = 8;

export function answerQuery(text: string, exams: Exam[], now = new Date()): QueryAnswer {
  const parsed = parseQuery(text, exams, now);
  const understoodNothing =
    !parsed.courses.length &&
    !parsed.subjects.length &&
    !parsed.cities.length &&
    !parsed.regions.length;
  // With nothing recognised there is no question to answer, and every listing
  // scores the same. Handing back the eight that happen to sort first would
  // look like an answer; asking for a kurs or a kommun is the honest move.
  if (understoodNothing) return { parsed, matches: [], understoodNothing };

  const rank = (ignorePlace: boolean): QueryMatch[] =>
    exams
      .map((exam) => ({ exam, score: scoreOne(exam, parsed, ignorePlace) }))
      .filter((m): m is { exam: Exam; score: number } => m.score !== null)
      .sort((a, b) => b.score - a.score || compareByPeriod(a.exam, b.exam))
      .slice(0, LIMIT)
      .map(({ exam, score }) => ({
        exam,
        score,
        inTime: parsed.before ? finishesBy(exam, parsed.before) : null,
      }));

  const strict = rank(false);
  if (strict.length) return { parsed, matches: strict, understoodNothing };

  // Nothing where they asked. Saying "0 träffar" would be true and useless: the
  // course exists, and where it exists is exactly what the person is missing.
  if (parsed.cities.length || parsed.regions.length) {
    const wider = rank(true);
    if (wider.length) return { parsed, matches: wider, understoodNothing, widened: 'city' };
  }
  return { parsed, matches: [], understoodNothing };
}

/** "1 sep", without the abbreviation dot — the sentences here end in one. */
const shortDate = (isoDate: string) =>
  new Date(isoDate)
    .toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })
    .replace('.', '');

/**
 * The answer in words, built only from what the listings say.
 *
 * Every sentence here is assembled from fields of the matches — a count, a
 * kommun the dataset spells, a deadline a provider published. There is no
 * sentence this can produce that the data does not already contain, which is
 * the point: the screen reads like an answer, and cannot become a guess.
 */
export function summariseAnswer(answer: QueryAnswer): string[] {
  const { parsed, matches } = answer;
  if (answer.understoodNothing) {
    return [
      'Jag känner inte igen någon kurs eller kommun i det du skrev.',
      'Skriv gärna kursen och var du bor — till exempel "Matte 2b i Göteborg innan december".',
    ];
  }

  const what = parsed.courses[0] ?? parsed.subjects[0] ?? 'prövningar';
  const where = parsed.cities[0] ?? parsed.regions[0];

  if (!matches.length) {
    return [
      `Ingen anordnare i datan har ${what}${where ? ` i ${where}` : ''} just nu.`,
      'Datan växer en anordnare i taget, så det kan finnas ändå — kolla din kommuns egen sida.',
    ];
  }

  const lines: string[] = [];
  if (answer.widened && where) {
    lines.push(`Ingen listning för ${what} i ${where}, så jag har tittat i hela landet i stället.`);
  }

  const open = matches.filter((m) => isOpenForRegistration(m.exam));
  const noun = matches.length === 1 ? 'listning' : 'listningar';
  lines.push(
    `${matches.length} ${noun} för ${what}${answer.widened ? '' : where ? ` i ${where}` : ''}, ` +
      `${open.length} med anmälan öppen i dag.`,
  );

  const deadlines = open
    .map((m) => m.exam.nextPeriod.applicationEnd)
    .filter((d): d is string => !!d)
    .sort();
  if (deadlines.length) {
    lines.push(`Den som stänger först stänger ${shortDate(deadlines[0])}.`);
  }

  if (parsed.before) {
    const late = matches.filter((m) => m.inTime === false);
    if (late.length) {
      lines.push(
        `${late.length} av dem blir inte klara till ${shortDate(parsed.before)} — de är märkta nedan.`,
      );
    }
  }

  lines.push('Datum och avgifter kommer från anordnarens egen sida. Öppna en listning för källan.');
  return lines;
}
