import { Exam, Watch } from '../types';
import { daysUntil, hasApplicationClosed, isOpenForRegistration } from './examStatus';

/** The dedupe key. Two watches on the same pair are the same watch. */
export function watchKey(subject: string, city: string): string {
  return `${subject}|${city}`;
}

export function makeWatch(subject: string, city: string, now: Date = new Date()): Watch {
  return {
    id: watchKey(subject, city),
    subject,
    city,
    createdAt: now.toISOString(),
    // A brand-new watch has shown the user nothing yet, so everything under it
    // is new — which is right: the whole point of creating it is to be told
    // what is in there.
    seenExamIds: [],
    seenAt: now.toISOString(),
  };
}

/** "Matematik i Stockholm", and the two half-empty cases in plain Swedish. */
export function watchLabel(watch: Pick<Watch, 'subject' | 'city'>): string {
  const { subject, city } = watch;
  if (subject && city) return `${subject} i ${city}`;
  if (subject) return `${subject} i hela Sverige`;
  if (city) return `Alla ämnen i ${city}`;
  return 'Alla prövningar i hela Sverige';
}

export function matchesWatch(exam: Exam, watch: Pick<Watch, 'subject' | 'city'>): boolean {
  if (watch.subject && exam.subject !== watch.subject) return false;
  if (watch.city && exam.city !== watch.city) return false;
  return true;
}

/**
 * What a watch has to tell you, in the order it matters.
 *
 * `closingSoon` and `nextDeadline` are the reason the feature exists — a watch
 * that only counted listings would be a saved search, and a saved search never
 * asks you for anything. `newIds` is the other half: listings that have turned
 * up since the last time this watch was read.
 */
export interface WatchNews {
  /** Every listing under the watch, dead rounds included. */
  total: number;
  /** Open for anmälan today. */
  open: number;
  /** Open today, with a published deadline inside a week. */
  closingSoon: number;
  /** Listings the user has not been shown under this watch before. */
  newIds: string[];
  /** The soonest deadline still ahead, among the rounds you can still book. */
  nextDeadline: { examId: string; date: string; days: number } | null;
}

export function watchNews(watch: Watch, exams: Exam[]): WatchNews {
  const matches = exams.filter((e) => matchesWatch(e, watch));
  const seen = new Set(watch.seenExamIds);
  const open = matches.filter(isOpenForRegistration);

  let nextDeadline: WatchNews['nextDeadline'] = null;
  for (const exam of open) {
    const end = exam.nextPeriod.applicationEnd;
    if (!end || hasApplicationClosed(exam)) continue;
    if (!nextDeadline || end < nextDeadline.date) {
      nextDeadline = { examId: exam.id, date: end, days: daysUntil(end) };
    }
  }

  return {
    total: matches.length,
    open: open.length,
    closingSoon: open.filter((e) => {
      const end = e.nextPeriod.applicationEnd;
      return !!end && !hasApplicationClosed(e) && daysUntil(end) <= 7;
    }).length,
    newIds: matches.filter((e) => !seen.has(e.id)).map((e) => e.id),
    nextDeadline,
  };
}

/** True when the row has something the user hasn't already acted on. */
export function hasNews(news: WatchNews): boolean {
  return news.newIds.length > 0 || news.closingSoon > 0;
}

/**
 * The one line under a watch's name.
 *
 * Deliberately one sentence and never two: the row is a list item, and a list
 * where every item is a paragraph is a list nobody scans. The deadline wins
 * over the count, because the deadline is the only part of it that expires.
 */
export function watchSummary(news: WatchNews): string {
  if (news.total === 0) return 'Inga prövningar i datan än — vi säger till när det kommer någon.';

  const parts: string[] = [];
  if (news.newIds.length > 0) {
    parts.push(
      news.newIds.length === 1 ? '1 ny sedan sist' : `${news.newIds.length} nya sedan sist`,
    );
  }
  if (news.nextDeadline) {
    const { days } = news.nextDeadline;
    parts.push(
      days <= 0
        ? 'sista anmälningsdag i dag'
        : days === 1
          ? 'sista anmälan i morgon'
          : `sista anmälan om ${days} dagar`,
    );
  } else if (news.open > 0) {
    parts.push(news.open === 1 ? '1 öppen för anmälan' : `${news.open} öppna för anmälan`);
  } else {
    parts.push('inget öppet för anmälan just nu');
  }

  const line = parts.join(' · ');
  return `${line[0].toUpperCase()}${line.slice(1)}`;
}
