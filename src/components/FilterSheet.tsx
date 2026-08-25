import { X, SlidersHorizontal, Navigation, Loader2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../store/useStore';
import { SUBJECTS, REGIONS } from '../data/exams';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface FilterSheetProps {
  onClose: () => void;
}

export function FilterSheet({ onClose }: FilterSheetProps) {
  useEscapeKey(onClose);
  const {
    filterSubject,
    setFilterSubject,
    filterRegion,
    setFilterRegion,
    filterSortBy,
    setFilterSortBy,
    filterDirectOnly,
    setFilterDirectOnly,
    filterOpenOnly,
    setFilterOpenOnly,
    userLocation,
    locationStatus,
    requestLocation,
  } = useStore();

  const [localSubject, setLocalSubject] = useState(filterSubject);
  const [localRegion, setLocalRegion] = useState(filterRegion);
  const [localSortBy, setLocalSortBy] = useState(filterSortBy);
  const [localDirectOnly, setLocalDirectOnly] = useState(filterDirectOnly);
  const [localOpenOnly, setLocalOpenOnly] = useState(filterOpenOnly);

  const apply = () => {
    setFilterSubject(localSubject);
    setFilterRegion(localRegion);
    setFilterSortBy(localSortBy);
    setFilterDirectOnly(localDirectOnly);
    setFilterOpenOnly(localOpenOnly);
    onClose();
  };

  const reset = () => {
    setLocalSubject('');
    setLocalRegion('');
    setLocalSortBy('date');
    setLocalDirectOnly(false);
    setLocalOpenOnly(false);
  };

  const chip = (active: boolean) =>
    `py-2.5 rounded text-sm font-medium transition-colors ${
      active ? 'bg-brand-500 text-white' : 'bg-sand text-ink-soft'
    }`;

  return (
    // Backdrop closes on click as a mouse convenience; the sheet has its own
    // keyboard-reachable close button below, so this isn't the only way out.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center lg:justify-center"
      onClick={onClose}
    >
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- stops the backdrop's close-on-click from firing when interacting with the sheet itself */}
      <div
        className="bg-cream w-full lg:max-w-lg rounded-t-lg lg:rounded-lg p-6 max-h-[82vh] overflow-y-auto animate-sheet-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={20} className="text-brand-600" />
            <h2 className="text-lg font-bold text-ink font-display">Filter</h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={reset} className="text-brand-600 text-sm font-semibold">
              Rensa
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-sand rounded-full flex items-center justify-center"
            >
              <X size={16} className="text-ink-soft" />
            </button>
          </div>
        </div>

        {/* Only listings whose link lands on the booking itself. The steps are
            already on every card; this turns that into something you can search on. */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setLocalDirectOnly((v) => !v)}
            aria-pressed={localDirectOnly}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded border transition-colors text-left ${
              localDirectOnly ? 'bg-brand-50 border-brand-300' : 'bg-sand border-transparent'
            }`}
          >
            <span>
              <span className="block text-sm font-semibold text-ink">Bara direktanmälan</span>
              <span className="block text-xs text-ink-soft mt-0.5">
                Länken går till bokningen — inte till en sida om den.
              </span>
            </span>
            <span
              className={`w-11 h-6 rounded-full flex-shrink-0 flex items-center px-0.5 transition-colors ${
                localDirectOnly ? 'bg-brand-500 justify-end' : 'bg-line justify-start'
              }`}
            >
              <span className="w-5 h-5 bg-white rounded-full shadow-sm" />
            </span>
          </button>
        </div>

        {/* Application windows open today. Providers stagger their opening days
            across weeks, so "can I still apply?" is the question most often
            behind a search. */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setLocalOpenOnly((v) => !v)}
            aria-pressed={localOpenOnly}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded border transition-colors text-left ${
              localOpenOnly ? 'bg-trust-50 border-trust-500' : 'bg-sand border-transparent'
            }`}
          >
            <span>
              <span className="block text-sm font-semibold text-ink">Öppna för anmälan nu</span>
              <span className="block text-xs text-ink-soft mt-0.5">
                Bara tillfällen vars anmälningsperiod är öppen idag.
              </span>
            </span>
            <span
              className={`w-11 h-6 rounded-full flex-shrink-0 flex items-center px-0.5 transition-colors ${
                localOpenOnly ? 'bg-trust-500 justify-end' : 'bg-line justify-start'
              }`}
            >
              <span className="w-5 h-5 bg-white rounded-full shadow-sm" />
            </span>
          </button>
        </div>

        {/* Sort */}
        <div className="mb-6">
          <span id="filter-sort-label" className="text-sm font-semibold text-ink block mb-2">
            Sortera efter
          </span>
          <div className="flex gap-2" role="group" aria-labelledby="filter-sort-label">
            {(['date', 'distance', 'name'] as const).map((s) => (
              <button
                key={s}
                disabled={s === 'distance' && !userLocation}
                onClick={() => setLocalSortBy(s)}
                className={`flex-1 py-2 rounded text-sm font-semibold transition-colors ${
                  localSortBy === s ? 'bg-brand-500 text-white' : 'bg-sand text-ink-soft'
                } ${s === 'distance' && !userLocation ? 'opacity-40' : ''}`}
              >
                {s === 'date' ? 'Datum' : s === 'distance' ? 'Avstånd' : 'Namn'}
              </button>
            ))}
          </div>
          {!userLocation && (
            <button
              onClick={requestLocation}
              disabled={locationStatus === 'pending'}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-brand-50 text-brand-700 text-xs font-bold py-2.5 rounded"
            >
              {locationStatus === 'pending' ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Navigation size={14} />
              )}
              {locationStatus === 'denied'
                ? 'Plats nekad — aktivera i webbläsarinställningar'
                : 'Aktivera plats för att sortera på avstånd'}
            </button>
          )}
        </div>

        {/* Subject */}
        <div className="mb-6">
          <span id="filter-subject-label" className="text-sm font-semibold text-ink block mb-2">
            Ämne
          </span>
          <div
            className="grid grid-cols-2 gap-2"
            role="group"
            aria-labelledby="filter-subject-label"
          >
            <button onClick={() => setLocalSubject('')} className={chip(!localSubject)}>
              Alla ämnen
            </button>
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => setLocalSubject(s === localSubject ? '' : s)}
                className={chip(localSubject === s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Region */}
        <div className="mb-6">
          <span id="filter-region-label" className="text-sm font-semibold text-ink block mb-2">
            Region
          </span>
          <div
            className="grid grid-cols-2 gap-2"
            role="group"
            aria-labelledby="filter-region-label"
          >
            <button onClick={() => setLocalRegion('')} className={chip(!localRegion)}>
              Alla regioner
            </button>
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => setLocalRegion(r === localRegion ? '' : r)}
                className={chip(localRegion === r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Price info.
            This panel used to state the waiver as one national rule — "500 kr
            hos alla anordnare (gratis om du redan har betyget F)" — and the
            app's own dataset disproves it: {@link getPriceRule} finds providers
            who charge "oavsett tidigare betyg", and more who waive the fee only
            for an F set at their own school, or within a year of it. The fee
            itself is fixed, so there is still nothing to filter on; the waiver
            is the part that varies, and each listing now says its own version. */}
        <div className="mb-8 flex items-start gap-2.5 bg-cream border border-line rounded-md p-3.5">
          <ShieldCheck size={18} className="text-ink-soft flex-shrink-0 mt-0.5" />
          <p className="text-xs text-ink-soft leading-relaxed">
            Avgiften är lagstadgad och samma överallt: <span className="font-semibold">500 kr</span>{' '}
            per prövning — inget pris att filtrera på. Om ett tidigare F gör den gratis avgör
            däremot varje anordnare själv, och alla gör inte det. Villkoren står under{' '}
            <span className="font-semibold">Vad det kostar</span> på varje prövning.
          </p>
        </div>

        <button
          onClick={apply}
          className="w-full bg-brand-500 text-white font-bold py-4 rounded-md text-base active:scale-98 transition-transform shadow-md shadow-brand-200"
        >
          Visa prövningar
        </button>
      </div>
    </div>
  );
}
