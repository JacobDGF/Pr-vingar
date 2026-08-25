import { Exam } from '../types';

/**
 * How old the app's own claim about a listing is.
 *
 * Every listing carries `verifiedAt`, the day someone read the provider's page
 * and confirmed the price, the link and the periods. The detail sheet has
 * always shown it — as "Kontrollerat mot Växjö kommun 24 juni", in the same
 * confident trust-green whatever the date said, and without a year. A check
 * from June 2024 and one from yesterday were the same sentence in the same
 * colour, and the reader had no way to tell them apart.
 *
 * That is the same decay the date rules on the cards exist for, turned on the
 * app itself: a stale fact looks exactly as healthy as a fresh one. So the
 * verification line gets an age, a year, and the palette's own answer to how
 * much weight to put on it — green while the check is recent, amber once it has
 * aged past a provider's usual publishing cycle, grey once it is old enough
 * that the provider's page is the better source.
 *
 * The thresholds are the dataset's own rhythm. Providers publish a new
 * application window roughly per term, so a check inside a month is still
 * describing the round it was taken from; past three months it is describing a
 * round that has probably been replaced.
 */
export type FreshnessKey = 'fresh' | 'aging' | 'stale';

export const FRESH_DAYS = 30;
export const STALE_DAYS = 90;

export interface Freshness {
  key: FreshnessKey;
  /** Whole days between the check and today. Negative dates clamp to 0. */
  ageDays: number;
  /** "i dag", "för 3 dagar sedan", "för 2 månader sedan". */
  age: string;
  /** The full date, with the year the old line dropped: "24 juni 2026". */
  date: string;
  /** Text colour for the verification line. */
  text: string;
  /** Icon colour, so the shield does not stay green on a stale check. */
  icon: string;
  /**
   * What to add when the check has aged — the reader's way out. Empty while
   * the check is fresh, because there is nothing to warn about.
   */
  advice: string;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Whole days from `iso` to `now`, floored at 0 — a future date is not "fresh in -3 days". */
export function verificationAgeDays(iso: string, now: Date = new Date()): number {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return 0;
  return Math.max(0, Math.round((startOfDay(now) - startOfDay(then)) / MS_PER_DAY));
}

/** "i dag" / "för 5 dagar sedan" / "för 3 veckor sedan" / "för 2 månader sedan". */
export function formatAge(days: number): string {
  if (days <= 0) return 'i dag';
  if (days === 1) return 'i går';
  if (days < 14) return `för ${days} dagar sedan`;
  if (days < 60) {
    const weeks = Math.round(days / 7);
    return `för ${weeks} ${weeks === 1 ? 'vecka' : 'veckor'} sedan`;
  }
  const months = Math.round(days / 30);
  if (months < 12) return `för ${months} ${months === 1 ? 'månad' : 'månader'} sedan`;
  const years = Math.floor(months / 12);
  return `för över ${years} ${years === 1 ? 'år' : 'år'} sedan`;
}

export function getFreshness(exam: Exam, now: Date = new Date()): Freshness {
  const ageDays = verificationAgeDays(exam.verifiedAt, now);
  const date = new Date(exam.verifiedAt).toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const age = formatAge(ageDays);

  if (ageDays > STALE_DAYS) {
    return {
      key: 'stale',
      ageDays,
      age,
      date,
      text: 'text-ink-soft',
      icon: 'text-ink-faint',
      advice: `Läs datum och avgift hos ${exam.provider} innan du planerar — vår kontroll är gammal.`,
    };
  }

  if (ageDays > FRESH_DAYS) {
    return {
      key: 'aging',
      ageDays,
      age,
      date,
      text: 'text-orange-700',
      icon: 'text-orange-600',
      advice: `${exam.provider} kan ha publicerat en ny omgång sedan dess.`,
    };
  }

  return {
    key: 'fresh',
    ageDays,
    age,
    date,
    text: 'text-trust-700',
    icon: 'text-trust-600',
    advice: '',
  };
}
