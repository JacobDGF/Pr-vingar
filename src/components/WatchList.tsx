import { useMemo } from 'react';
import { Bell, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { hasNews, watchLabel, watchNews, watchSummary } from '../lib/watches';
import { useMinuteTick } from '../hooks/useMinuteTick';

/**
 * The watched ämne + kommun pairs, each with the one thing it has to say.
 *
 * The site is static and has no server, so it cannot push anything to anyone —
 * see README. What it *can* do honestly is tell you, the moment you open it,
 * what changed under the searches you said you cared about. That is the whole
 * row: a name you wrote, and one line of news under it.
 *
 * Opening a watch applies it as a filter and marks it read, which is why the
 * row is a button and not a card with buttons on it. There is exactly one
 * thing to do with a watch — go and look at it.
 */
export function WatchList() {
  const {
    watches,
    exams,
    removeWatch,
    markWatchSeen,
    setActiveTab,
    setFilterSubject,
    setFilterRegion,
    setFilterCity,
    setSearchQuery,
  } = useStore();
  const tick = useMinuteTick();

  const rows = useMemo(
    () => watches.map((watch) => ({ watch, news: watchNews(watch, exams) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [watches, exams, tick],
  );

  if (rows.length === 0) return null;

  const open = (watchId: string, subject: string, city: string) => {
    markWatchSeen(watchId);
    setFilterSubject(subject);
    setFilterCity(city);
    // The other two would silently narrow a watch to less than it says it is.
    setFilterRegion('');
    setSearchQuery('');
    setActiveTab('discover');
  };

  return (
    <div className="bg-surface border-[1.5px] border-line rounded-[32px] px-[22px] py-[20px] flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="w-[38px] h-[38px] rounded-[14px] bg-amber-accent-50 flex items-center justify-center flex-shrink-0">
          <Bell size={18} strokeWidth={2.1} className="text-amber-accent" />
        </span>
        <div>
          <p className="font-display font-semibold text-[19px] text-ink">Bevakningar</p>
          <p className="text-[13px] text-ink-soft">
            Vad som är nytt och vad som stänger, i de ämnen och orter du valt.
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {rows.map(({ watch, news }) => {
          const urgent = news.closingSoon > 0;
          return (
            <li key={watch.id} className="flex items-stretch gap-2">
              <button
                onClick={() => open(watch.id, watch.subject, watch.city)}
                className="flex-1 min-w-0 text-left bg-cream rounded-[20px] px-[18px] py-3.5 transition-transform hover:-translate-y-0.5"
              >
                <span className="flex items-center gap-2">
                  {hasNews(news) && (
                    <span
                      aria-hidden
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        urgent ? 'bg-orange-500' : 'bg-amber-accent'
                      }`}
                    />
                  )}
                  <span className="font-display font-semibold text-[16px] text-ink truncate">
                    {watchLabel(watch)}
                  </span>
                </span>
                <span
                  className={`block text-[13.5px] mt-px truncate ${
                    urgent ? 'text-orange-700' : 'text-ink-soft'
                  }`}
                >
                  {watchSummary(news)}
                </span>
              </button>
              <button
                onClick={() => removeWatch(watch.id)}
                aria-label={`Sluta bevaka ${watchLabel(watch)}`}
                className="w-11 rounded-[20px] bg-cream text-ink-faint flex items-center justify-center flex-shrink-0 hover:text-ink"
              >
                <X size={16} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
