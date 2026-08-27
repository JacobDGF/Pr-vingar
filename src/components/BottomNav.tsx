import { useStore } from '../store/useStore';
import { NAV_ITEMS } from '../lib/navItems';

export function BottomNav() {
  const { activeTab, setActiveTab, savedExams, viewedExams, posts } = useStore();

  const badgeFor = (id: string): number | null => {
    const n =
      id === 'exams'
        ? savedExams.length
        : id === 'history'
          ? viewedExams.length
          : id === 'community'
            ? posts.length
            : 0;
    return n > 0 ? n : null;
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-line z-40 safe-bottom">
      <div className="max-w-lg mx-auto flex px-1 pt-1.5">
        {NAV_ITEMS.map(({ id, label, short, icon: Icon, tone }) => {
          const isActive = activeTab === id;
          const badge = badgeFor(id);
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              aria-current={isActive ? 'page' : undefined}
              className="flex-1 min-w-0 flex flex-col items-center py-1 px-0.5 active:scale-95 transition-transform"
            >
              {/* Resting icons keep their own colour rather than going grey.
                  Five grey icons make the bar read as one object; five colours
                  make it read as five places, which is what it is. */}
              <div
                className={`relative px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive ? `${tone.gradient} ${tone.glow}` : ''
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2.1}
                  className={`transition-colors duration-200 ${isActive ? 'text-white' : tone.ink}`}
                />
                {badge !== null && (
                  <span
                    className={`absolute -top-1 -right-1 text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-extrabold ring-2 ring-surface text-white ${
                      isActive ? 'bg-ink' : tone.solid
                    }`}
                  >
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 font-bold tracking-tight transition-colors duration-200 max-w-full truncate ${
                  isActive ? tone.ink : 'text-ink-faint'
                }`}
              >
                {short ?? label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
