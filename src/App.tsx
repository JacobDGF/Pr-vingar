import { useState, useEffect, lazy, Suspense, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';
import { useStore } from './store/useStore';
import { LoadingScreen } from './components/LoadingScreen';
import { BottomNav } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { ExamDetail } from './components/ExamDetail';
import { FaqSheet } from './components/FaqSheet';
import { UpdateBanner } from './components/UpdateBanner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useVersionCheck } from './hooks/useVersionCheck';
import { NAV_ITEMS } from './lib/navItems';
import { Discover } from './tabs/Discover';
import { TabId } from './types';

// Only Discover (the default tab) loads eagerly. The other five are code-split
// and fetched the first time a user switches to them, since most sessions never
// visit every tab in one sitting.
const AiProvning = lazy(() => import('./tabs/AiProvning').then((m) => ({ default: m.AiProvning })));
const Exams = lazy(() => import('./tabs/Exams').then((m) => ({ default: m.Exams })));
const Community = lazy(() => import('./tabs/Community').then((m) => ({ default: m.Community })));
const History = lazy(() => import('./tabs/History').then((m) => ({ default: m.History })));
const Profile = lazy(() => import('./tabs/Profile').then((m) => ({ default: m.Profile })));

const TAB_ORDER: TabId[] = ['discover', 'ai', 'exams', 'community', 'history', 'profile'];
const TAB_COMPONENTS: Record<TabId, ComponentType> = {
  discover: Discover,
  ai: AiProvning,
  exams: Exams,
  community: Community,
  history: History,
  profile: Profile,
};

function TabFallback() {
  return (
    <div className="h-full flex items-center justify-center">
      <Loader2 size={28} className="text-brand-400 animate-spin" />
    </div>
  );
}

const TAB_LABELS: Record<TabId, string> = Object.fromEntries(
  NAV_ITEMS.map((item) => [item.id, item.label]),
) as Record<TabId, string>;

function TabPanel({ tab, active }: { tab: TabId; active: boolean }) {
  const Component = TAB_COMPONENTS[tab];
  return (
    <div className={`h-full ${active ? 'block' : 'hidden'}`}>
      {/* One boundary per tab, inside the panel and outside Suspense: five of
          the six tabs arrive over the network, and a chunk that 404s after a
          deploy would otherwise take the whole app — nav included — down with
          it. Keyed by tab so a crash in one is not inherited by the next. */}
      <ErrorBoundary key={tab} label={TAB_LABELS[tab]}>
        <Suspense fallback={<TabFallback />}>
          <Component />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default function App() {
  const { activeTab, showingExamDetail, setShowingExamDetail, showingFaq, setShowingFaq } =
    useStore();
  const [loading, setLoading] = useState(true);
  const updateAvailable = useVersionCheck();

  // Tabs are kept mounted once visited (not unmounted on switch-away) so scroll
  // position and in-progress state survive tab switches; only the initial tab
  // needs to be in this set up front. Adjusted during render (React's
  // documented pattern for state derived from a changed value) rather than in
  // an effect, since a post-commit effect would mount the new tab a frame late.
  const [visitedTabs, setVisitedTabs] = useState<Set<TabId>>(() => new Set([activeTab]));
  if (!visitedTabs.has(activeTab)) {
    setVisitedTabs(new Set(visitedTabs).add(activeTab));
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden';
  }, []);

  const handleLoadingDone = () => {
    setLoading(false);
    document.body.style.overflow = '';
  };

  return (
    <div className="lg:flex h-screen bg-cream overflow-hidden relative">
      {loading && <LoadingScreen onDone={handleLoadingDone} />}

      <Sidebar />

      {/* Tab content */}
      <div className="max-w-lg lg:max-w-none mx-auto lg:mx-0 h-full flex-1 overflow-hidden relative">
        <div className="h-full overflow-hidden">
          {TAB_ORDER.map(
            (tab) =>
              visitedTabs.has(tab) && <TabPanel key={tab} tab={tab} active={activeTab === tab} />,
          )}
        </div>

        <BottomNav />
      </div>

      {/* The sheets render over the whole app, so an error in one of them used
          to leave a black backdrop and nothing else. Their boundary covers the
          screen the same way and offers the way out the broken sheet can't. */}
      {showingExamDetail && (
        <ErrorBoundary
          key={showingExamDetail}
          label="Prövningen"
          overlay
          onDismiss={() => setShowingExamDetail(null)}
        >
          <ExamDetail />
        </ErrorBoundary>
      )}
      {showingFaq && (
        <ErrorBoundary label="Vanliga frågor" overlay onDismiss={() => setShowingFaq(false)}>
          <FaqSheet onClose={() => setShowingFaq(false)} />
        </ErrorBoundary>
      )}
      {updateAvailable && <UpdateBanner />}
    </div>
  );
}
