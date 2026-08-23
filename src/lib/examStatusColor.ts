import { Exam } from '../types';
import {
  daysUntil,
  hasApplicationClosed,
  isFullyBooked,
  isOpenForRegistration,
} from './examStatus';

/**
 * The six states a listing can be in, as one colour each.
 *
 * The app used to spend a sentence on each of these — "Prövningsanmälan för
 * våren 2026 är stängd; information om prövning för hösten 2026 meddelas
 * senare enligt skolan" — and a reader scanning twenty cards read none of them.
 * A colour is read before the text next to it, so the colour has to carry the
 * one decision the reader is making: can I book this, or not?
 *
 * That means red is spent on exactly one thing. Before this, red said both
 * "fullbokat" (you cannot book) and "3 dagar kvar" (you can book, hurry) — the
 * two opposite answers to that question in the same colour. The countdown is
 * amber here, and red is reserved for the rounds that are closed to you.
 */
export type StatusKey = 'full' | 'closed' | 'closing' | 'open' | 'upcoming' | 'undated';

export interface StatusTone {
  key: StatusKey;
  /** Two words at most — this is what a card shows instead of the sentence. */
  shortLabel: string;
  /** What the colour means, for the legend and the detail sheet. */
  meaning: string;
  /** Solid badge: white text on the status colour. Used once per card. */
  chip: string;
  /** Tinted badge, for rows too small or too many for a solid one. */
  softChip: string;
  /** The 4px edge along the top of a card — the part read at a glance. */
  rail: string;
  /** A 8px dot, for list rows in Profile and Mina prövningar. */
  dot: string;
  /** Text colour for a value rendered on the page ground. */
  text: string;
  /**
   * Hex for Leaflet pins. Leaflet builds its markers as raw HTML strings
   * outside Tailwind's reach, so the map needs the literal value — keeping it
   * here is what stops the map's greens from drifting from the list's.
   */
  pin: string;
  /** Legend and filter order: what blocks you first, what is open last. */
  rank: number;
}

export const STATUS_TONES: Record<StatusKey, StatusTone> = {
  full: {
    key: 'full',
    shortLabel: 'Fullbokat',
    meaning: 'Anordnaren har skrivit att omgången är full. Datumen spelar ingen roll.',
    chip: 'bg-red-600 text-white',
    softChip: 'bg-red-50 text-red-700 border border-red-200',
    rail: 'bg-red-600',
    dot: 'bg-red-600',
    text: 'text-red-700',
    pin: '#dc2626',
    rank: 0,
  },
  closed: {
    key: 'closed',
    shortLabel: 'Stängd',
    meaning: 'Sista anmälningsdag har passerat. Nästa omgång brukar dyka upp på samma sida.',
    chip: 'bg-ink-soft text-white',
    softChip: 'bg-sand text-ink-soft border border-line',
    rail: 'bg-ink-faint',
    dot: 'bg-ink-faint',
    text: 'text-ink-faint',
    pin: '#9b9797',
    rank: 1,
  },
  closing: {
    key: 'closing',
    shortLabel: 'Stänger snart',
    meaning: 'Öppen, men sista anmälningsdag är inom en vecka.',
    chip: 'bg-orange-600 text-white',
    softChip: 'bg-orange-50 text-orange-700 border border-orange-200',
    rail: 'bg-orange-500',
    dot: 'bg-orange-500',
    text: 'text-orange-700',
    pin: '#ea580c',
    rank: 2,
  },
  open: {
    key: 'open',
    shortLabel: 'Öppen nu',
    meaning: 'Anmälan är öppen i dag — du kan boka direkt.',
    chip: 'bg-trust-600 text-white',
    softChip: 'bg-trust-50 text-trust-700 border border-trust-100',
    rail: 'bg-trust-500',
    dot: 'bg-trust-500',
    text: 'text-trust-700',
    pin: '#2f8457',
    rank: 3,
  },
  upcoming: {
    key: 'upcoming',
    shortLabel: 'Öppnar snart',
    meaning: 'Datum är satt, men anmälan har inte öppnat än. Lägg in den i kalendern.',
    chip: 'bg-brand-600 text-white',
    softChip: 'bg-brand-50 text-brand-700 border border-brand-100',
    rail: 'bg-brand-500',
    dot: 'bg-brand-500',
    text: 'text-brand-700',
    pin: '#0088b0',
    rank: 4,
  },
  undated: {
    key: 'undated',
    shortLabel: 'Datum saknas',
    meaning: 'Anordnaren har inte publicerat några datum. Länken går till deras egen sida.',
    chip: 'bg-ink text-white',
    softChip: 'bg-cream text-ink-soft border border-line',
    rail: 'bg-line',
    dot: 'bg-line',
    text: 'text-ink-soft',
    pin: '#c0bcbc',
    rank: 5,
  },
};

/** The legend's order, and the order of the filter chips built from it. */
export const STATUS_ORDER: StatusKey[] = (Object.keys(STATUS_TONES) as StatusKey[]).sort(
  (a, b) => STATUS_TONES[a].rank - STATUS_TONES[b].rank,
);

export interface ExamStatus {
  tone: StatusTone;
  /**
   * The tone's label with this listing's own date in it where there is one
   * ("Stängde 4 aug."), so the colour and the words never say two things.
   */
  label: string;
  /** Days to the deadline, when there is a deadline still ahead. */
  daysLeft: number | null;
}

/**
 * Which colour a listing gets, and what the colour says.
 *
 * The order of the checks is the whole design. `full` is tested before any
 * date, because a full round with an open-looking window is exactly the case
 * where the dates lie — the provider's own word beats the calendar. Then a
 * passed deadline, which the calendar can settle on its own. Only what
 * survives both is sorted by how soon the user has to act.
 */
export function getExamStatus(exam: Exam): ExamStatus {
  const { nextPeriod: p } = exam;

  if (isFullyBooked(exam)) {
    return { tone: STATUS_TONES.full, label: 'Fullbokat', daysLeft: null };
  }

  if (hasApplicationClosed(exam)) {
    return {
      tone: STATUS_TONES.closed,
      label: `Stängde ${formatShort(p.applicationEnd!)}`,
      daysLeft: null,
    };
  }

  if (!p.confirmed) {
    return { tone: STATUS_TONES.undated, label: 'Datum ej satt', daysLeft: null };
  }

  if (isOpenForRegistration(exam)) {
    const days = p.applicationEnd ? daysUntil(p.applicationEnd) : null;
    if (days !== null && days <= 7) {
      return {
        tone: STATUS_TONES.closing,
        label: days <= 0 ? 'Sista dagen idag' : `${days} ${days === 1 ? 'dag' : 'dagar'} kvar`,
        daysLeft: days,
      };
    }
    return {
      tone: STATUS_TONES.open,
      label: days !== null ? `Öppen · ${days} dagar kvar` : 'Öppen nu',
      daysLeft: days,
    };
  }

  if (p.applicationStart && Date.now() < new Date(p.applicationStart).getTime()) {
    return {
      tone: STATUS_TONES.upcoming,
      label: `Öppnar ${untilOpening(p.applicationStart)}`,
      daysLeft: null,
    };
  }

  // Confirmed dates that place today outside every window the provider
  // published, without a closing date to have passed — nothing to count down.
  return { tone: STATUS_TONES.undated, label: 'Datum ej satt', daysLeft: null };
}

/** Shorthand for the common case of only needing the colour bucket. */
export function getStatusKey(exam: Exam): StatusKey {
  return getExamStatus(exam).tone.key;
}

export interface StatusSlice {
  tone: StatusTone;
  count: number;
  /** The slice's share of the set, 0–1, for a proportional bar. */
  share: number;
}

/**
 * The same set of listings as one row of colours, biggest blocker first.
 *
 * Five saved prövningar are otherwise five dates to hold in your head, and the
 * question underneath all of them is one question: how many can I still do
 * something about? Ordering by `rank` puts what blocks you at the left, so the
 * answer is the *length* of the red-and-grey run rather than a number anywhere.
 *
 * Empty colours are dropped — a 0-wide segment is invisible in the bar but a
 * full row in the legend under it, which reads as a category you have listings
 * in.
 */
export function statusBreakdown(exams: Exam[]): StatusSlice[] {
  const counts = countByStatus(exams);
  const total = exams.length;
  if (total === 0) return [];
  return STATUS_ORDER.filter((key) => counts[key] > 0).map((key) => ({
    tone: STATUS_TONES[key],
    count: counts[key],
    share: counts[key] / total,
  }));
}

/** How many listings sit in each colour, for the filter chips' counts. */
export function countByStatus(exams: Exam[]): Record<StatusKey, number> {
  const counts = {
    full: 0,
    closed: 0,
    closing: 0,
    open: 0,
    upcoming: 0,
    undated: 0,
  } as Record<StatusKey, number>;
  for (const exam of exams) counts[getExamStatus(exam).tone.key] += 1;
  return counts;
}

/**
 * How a not-yet-open round says when it opens.
 *
 * "Öppnar 24 aug." is a date the reader has to subtract today from before it
 * means anything, and blue looks the same whether that subtraction lands on
 * tomorrow or on November. Inside a week the distance *is* the news, so it is
 * what the chip says; further out the date is more useful than "om 46 dagar",
 * which nobody can place in a calendar.
 *
 * This mirrors what `closing` already does at the other end of the window, and
 * it deliberately stays inside blue: an unopened round is not something the
 * user can act on today, however close it is, so it must not borrow the colour
 * of one that is.
 */
function untilOpening(dateStr: string): string {
  const days = daysUntil(dateStr);
  if (days === 1) return 'i morgon';
  if (days <= 7) return `om ${days} dagar`;
  return formatShort(dateStr);
}

function formatShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
}
