import { Bell, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { watchKey, watchLabel } from '../lib/watches';

interface WatchButtonProps {
  subject: string;
  city: string;
}

/**
 * The one line that turns a search into an errand the app remembers.
 *
 * It appears only once the user has narrowed to an ämne or a kommun, because
 * "bevaka alla prövningar i hela Sverige" is the app's front page and not
 * something anyone needs a row for. One button, no dialog, no name field: the
 * ämne and the kommun already on screen *are* the watch, so asking the user to
 * confirm them would be asking them to type back what they just chose.
 */
export function WatchButton({ subject, city }: WatchButtonProps) {
  const { watches, addWatch, removeWatch } = useStore();
  if (!subject && !city) return null;

  const id = watchKey(subject, city);
  const watched = watches.some((w) => w.id === id);
  const label = watchLabel({ subject, city });

  return (
    <button
      onClick={() => (watched ? removeWatch(id) : addWatch(subject, city))}
      aria-pressed={watched}
      className={`w-full flex items-center gap-3 rounded-[24px] px-5 py-4 text-left transition-transform hover:-translate-y-0.5 ${
        watched ? 'bg-amber-accent text-white' : 'bg-amber-accent-50 text-amber-accent'
      }`}
    >
      <span
        className={`w-9 h-9 rounded-[13px] flex items-center justify-center flex-shrink-0 ${
          watched ? 'bg-white/20' : 'bg-white'
        }`}
      >
        {watched ? <Check size={17} strokeWidth={2.4} /> : <Bell size={17} strokeWidth={2.2} />}
      </span>
      <span className="min-w-0">
        <span className="block font-display font-semibold text-[16px] truncate">
          {watched ? `Bevakar ${label}` : `Bevaka ${label}`}
        </span>
        <span
          className={`block text-[13px] truncate ${watched ? 'text-white/80' : 'text-ink-soft'}`}
        >
          {watched ? 'Ligger under Mina prövningar' : 'Nytt och stängande, under Mina prövningar'}
        </span>
      </span>
    </button>
  );
}
