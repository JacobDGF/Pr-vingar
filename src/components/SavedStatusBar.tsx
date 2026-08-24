import { Exam } from '../types';
import { statusBreakdown } from '../lib/examStatusColor';

interface SavedStatusBarProps {
  /** The user's saved listings, resolved to the listings themselves. */
  exams: Exam[];
  /** Where an empty state should send someone with nothing saved yet. */
  onBrowse: () => void;
}

/**
 * "Läget för dina sparade" — the profile's first answer.
 *
 * Five saved prövningar are five dates to hold in your head, and every one of
 * them is really the same question: how many of these can I still do something
 * about? A list of dates makes the reader work that out one row at a time,
 * against today's date, in their head. One bar in the status colours answers it
 * before a single word is read — the red-and-grey run on the left is what is
 * gone, the rest is what is left.
 *
 * The colours are the same six the cards, the map pins and the filter use, out
 * of `examStatusColor`, so the profile can't develop its own opinion about what
 * "stängd" looks like.
 */
export function SavedStatusBar({ exams, onBrowse }: SavedStatusBarProps) {
  const slices = statusBreakdown(exams);

  if (slices.length === 0) {
    return (
      <div className="bg-surface border-[1.5px] border-dashed border-line rounded-[32px] p-7 text-center">
        <p className="font-hero text-[26px] leading-none text-ink">Inget sparat än</p>
        <p className="font-display italic text-[16px] text-ink-soft mt-2 mb-5">
          Spara en prövning så visas läget för den här.
        </p>
        <button
          onClick={onBrowse}
          className="bg-ink text-cream font-bold text-[14.5px] px-6 py-3 rounded-full transition-transform hover:-translate-y-0.5"
        >
          Hitta prövningar
        </button>
      </div>
    );
  }

  /** How many of the saved rounds the user can still act on today. */
  const actionable = slices
    .filter((s) => s.tone.key === 'open' || s.tone.key === 'closing')
    .reduce((n, s) => n + s.count, 0);

  return (
    <div className="bg-surface border-[1.5px] border-line rounded-[32px] p-6">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <p className="text-[10.5px] font-bold uppercase tracking-[.1em] text-ink-soft">
          Läget för dina sparade
        </p>
        <p className="text-[13.5px] font-bold text-ink-soft tnum">
          {actionable} av {exams.length} går att anmäla nu
        </p>
      </div>

      <div
        className="flex gap-1 mt-4 h-3"
        role="img"
        aria-label={slices.map((s) => `${s.tone.shortLabel}: ${s.count}`).join(', ')}
      >
        {slices.map((s) => (
          <span
            key={s.tone.key}
            className={`rounded-full ${s.tone.rail}`}
            style={{ flexGrow: s.count, flexBasis: 0 }}
          />
        ))}
      </div>

      <ul className="flex flex-col gap-2.5 mt-[18px]">
        {slices.map((s) => (
          <li key={s.tone.key} className="flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.tone.dot}`} />
            <span className="text-[14.5px] font-bold text-ink flex-shrink-0">
              {s.tone.shortLabel}
            </span>
            {/* The meaning is the legend's fine print, not the row. Truncated
                mid-sentence it reads as broken, so on a narrow screen it goes
                away entirely — dot, label and count already say everything the
                row is for. */}
            <span className="hidden sm:block text-[12.5px] text-ink-faint truncate min-w-0 flex-1">
              {s.tone.meaning}
            </span>
            <span
              className={`text-[14.5px] font-bold tnum flex-shrink-0 ml-auto sm:ml-0 ${s.tone.text}`}
            >
              {s.count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
