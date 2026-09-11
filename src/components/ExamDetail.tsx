import {
  ArrowLeft,
  MapPin,
  Calendar,
  BookOpen,
  Lightbulb,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  ShieldCheck,
  Navigation,
  Info,
  Globe,
  Ban,
  CalendarX,
  CalendarPlus,
  Share2,
  Check,
  Clock,
  ListChecks,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { Exam } from '../types';
import { useStore } from '../store/useStore';
import { haversineDistanceKm, formatDistanceKm } from '../lib/distance';
import { hasPeriodPassed, daysUntil } from '../lib/examStatus';
import { getExamStatus } from '../lib/examStatusColor';
import { getRegistrationFlow } from '../lib/registrationFlow';
import { getExamAction } from '../lib/examAction';
import { courseCounterpart } from '../lib/courseSystems';
import { track } from '../lib/analytics';
import { examCalendarEvents, downloadCalendar } from '../lib/calendarFile';
import { useEscapeKey } from '../hooks/useEscapeKey';

/**
 * The hero's own colour.
 *
 * The design gives the panel one teal→magenta gradient. That reads beautifully
 * for a round you can act on and wrongly for one you can't: a listing whose
 * seats are gone should not open with the same celebratory wash as one that's
 * booking today. So the two closed states take the gradient over — red for
 * full, ink for a passed deadline — and everything bookable keeps the design's.
 */
const HERO_GRADIENT: Record<string, string> = {
  full: 'bg-gradient-to-br from-red-700 via-red-600 to-rose-600',
  closed: 'bg-gradient-to-br from-ink via-[#3b3837] to-ink-soft',
};
const HERO_DEFAULT = 'bg-gradient-to-br from-brand-500 via-[#1186ac] to-accent2-500';

function formatLong(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
function formatShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
}
/** "12" / "okt" for the timeline's date chip. */
function chipParts(dateStr: string) {
  const d = new Date(dateStr);
  return {
    day: d.toLocaleDateString('sv-SE', { day: 'numeric' }),
    month: d.toLocaleDateString('sv-SE', { month: 'short' }).replace('.', ''),
  };
}

/** The middle stat tile: the one number that changes meaning with the state. */
function applicationStat(exam: Exam): { value: string; note: string } {
  const { nextPeriod: p } = exam;
  const status = getExamStatus(exam);
  switch (status.tone.key) {
    case 'full':
      return { value: 'Slut', note: 'inga platser kvar' };
    case 'closed':
      return { value: 'Stängd', note: `stängde ${formatShort(p.applicationEnd!)}` };
    case 'undated':
      return { value: 'Ej satt', note: 'se skolans sida' };
    case 'closing':
    case 'open': {
      if (p.applicationEnd) {
        const d = daysUntil(p.applicationEnd);
        return {
          value: d <= 0 ? 'I dag' : `${d} dgr`,
          note: `stänger ${formatShort(p.applicationEnd)}`,
        };
      }
      return { value: 'Öppen', note: 'stänger när platserna är slut' };
    }
    case 'upcoming': {
      const d = daysUntil(p.applicationStart!);
      return { value: `${d} dgr`, note: `öppnar ${formatShort(p.applicationStart!)}` };
    }
    default:
      return { value: 'Ej satt', note: 'se skolans egen sida' };
  }
}

type DetailTab = 'dates' | 'parts' | 'tips';

export function ExamDetail() {
  const {
    showingExamDetail,
    setShowingExamDetail,
    exams,
    isExamSaved,
    saveExam,
    unsaveExam,
    userLocation,
  } = useStore();
  const [tab, setTab] = useState<DetailTab>('dates');
  const [shared, setShared] = useState(false);
  const exam = exams.find((e) => e.id === showingExamDetail);
  // Before the early return: hooks can't run conditionally, and the sheet is
  // only mounted while an exam is showing anyway.
  useEscapeKey(useCallback(() => setShowingExamDetail(null), [setShowingExamDetail]));

  if (!exam) return null;

  const saved = isExamSaved(exam.id);
  const { nextPeriod } = exam;
  const status = getExamStatus(exam);
  const passed = hasPeriodPassed(exam);
  const flow = getRegistrationFlow(exam);
  const action = getExamAction(exam);
  const calendarEvents = examCalendarEvents(exam);
  const stat = applicationStat(exam);
  const hero = HERO_GRADIENT[status.tone.key] ?? HERO_DEFAULT;
  // The design was drawn around "Matematik 2b". A third of the dataset reads
  // "Flera kurser (Ma 1a–5, kontakta skolan för kurskod)", which set five
  // lines at 6xl and pushed the stat tiles off the panel.
  const titleSize =
    exam.course.length > 38
      ? 'text-2xl sm:text-3xl lg:text-4xl'
      : exam.course.length > 22
        ? 'text-3xl sm:text-4xl lg:text-5xl'
        : 'text-4xl sm:text-5xl lg:text-6xl';

  // The same prövning is published under two names since Gy25, and picking the
  // wrong one is an anmälan the provider rejects — Örebro says it plainly:
  // "har du läst kursen innan juli 2025 ska du söka prövningen i det gamla
  // systemet". One sentence here is the difference between choosing and
  // guessing; a listing whose course only exists in one system says nothing.
  const counterpart = courseCounterpart(exam.courseCode);
  const counterpartNote = counterpart
    ? counterpart.system === 'gy25'
      ? `Ämnesnivå enligt Gy25. Läste du kursen före juli 2025 är det ${counterpart.other.name} (${counterpart.other.code}) du ska pröva i stället.`
      : `Kurs enligt Gy11, för dig som läste den före juli 2025. Annars heter samma innehåll ${counterpart.other.name} (${counterpart.other.code}).`
    : null;

  const distanceKm = userLocation
    ? haversineDistanceKm(userLocation.lat, userLocation.lng, exam.lat, exam.lng)
    : null;

  const { lat, lng } = exam;
  const osmSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.012},${lat - 0.007},${lng + 0.012},${lat + 0.007}&layer=mapnik&marker=${lat},${lng}`;
  const gmapsView = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const gmapsDir = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const share = async () => {
    const payload = {
      title: `${exam.course} – ${exam.schoolName}`,
      text: `Prövning i ${exam.course} hos ${exam.schoolName} i ${exam.city}.`,
      url: exam.infoUrl,
    };
    try {
      if (navigator.share) await navigator.share(payload);
      else await navigator.clipboard.writeText(exam.infoUrl);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      // Cancelled the share sheet, or no clipboard permission. Nothing to say.
    }
  };

  const TABS: { id: DetailTab; label: string; icon: typeof Calendar }[] = [
    { id: 'dates', label: 'Datum', icon: Calendar },
    { id: 'parts', label: 'Provmoment', icon: BookOpen },
    { id: 'tips', label: 'Studietips', icon: Lightbulb },
  ];

  return (
    // Backdrop closes on click as a mouse convenience; the sheet has its own
    // keyboard-reachable close button below, so this isn't the only way out.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center lg:justify-center lg:p-6"
      onClick={() => setShowingExamDetail(null)}
    >
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- stops the backdrop's close-on-click from firing when interacting with the sheet itself */}
      <div
        className="bg-cream w-full lg:max-w-4xl max-h-[94vh] lg:max-h-[92vh] rounded-t-3xl lg:rounded-3xl overflow-hidden flex flex-col animate-sheet-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex-shrink-0 flex items-center justify-between gap-2 px-4 lg:px-6 py-3 border-b border-line bg-cream">
          <button
            onClick={() => setShowingExamDetail(null)}
            className="inline-flex items-center gap-2 pl-2.5 pr-4 py-2 rounded-full border border-line bg-surface hover:bg-sand text-ink-soft text-[13.5px] font-bold transition-colors"
          >
            <ArrowLeft size={16} />
            Alla prövningar
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => (saved ? unsaveExam(exam.id) : saveExam(exam.id))}
              className={`inline-flex items-center gap-2 pl-3 pr-4 py-2 rounded-full border text-[13.5px] font-bold transition-colors ${
                saved
                  ? 'bg-brand-50 border-brand-200 text-brand-700'
                  : 'bg-surface border-line text-ink-soft hover:bg-sand'
              }`}
            >
              {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              {saved ? 'Sparad' : 'Spara'}
            </button>
            <button
              onClick={share}
              aria-label="Dela prövningen"
              className="w-10 h-10 rounded-full border border-line bg-surface hover:bg-sand flex items-center justify-center text-ink-soft transition-colors"
            >
              {shared ? <Check size={16} className="text-trust-600" /> : <Share2 size={16} />}
            </button>
          </div>
        </div>

        {/* Scroll content */}
        <div className="overflow-y-auto flex-1">
          <div className="p-4 lg:p-6 space-y-4">
            {/* HERO */}
            <div className={`relative overflow-hidden rounded-3xl p-6 lg:p-8 ${hero}`}>
              {/* Soft light behind the stat tiles, the way the design carries
                  its colour into the corner rather than as a flat sheet. */}
              <div
                className="absolute -top-24 -right-16 w-96 h-96 rounded-full bg-white/10 blur-2xl pointer-events-none"
                aria-hidden="true"
              />
              <div className="relative lg:flex lg:items-start lg:gap-8">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 bg-white text-[12.5px] font-bold px-3 py-1.5 rounded-full shadow-sm">
                      {status.tone.key === 'full' ? (
                        <Ban size={12} strokeWidth={2.6} className={status.tone.text} />
                      ) : (
                        <span className={`w-1.5 h-1.5 rounded-full ${status.tone.dot}`} />
                      )}
                      <span className={status.tone.text}>{status.label}</span>
                    </span>
                    <span className="bg-white/20 text-white text-[12.5px] font-semibold px-3 py-1.5 rounded-full">
                      {exam.courseCode}
                    </span>
                    <span className="bg-white/20 text-white text-[12.5px] font-semibold px-3 py-1.5 rounded-full">
                      {exam.level}
                    </span>
                  </div>
                  <h2 className={`font-hero-xl text-white leading-[1.05] ${titleSize}`}>
                    {exam.course}
                  </h2>
                  <p className="font-display italic text-brand-100 text-lg lg:text-xl mt-2">
                    {exam.schoolName} · {exam.city}, {exam.region}
                  </p>
                  {counterpartNote && (
                    <p className="text-brand-100/90 text-[13px] leading-snug mt-3 max-w-prose">
                      {counterpartNote}
                    </p>
                  )}
                </div>

                {/* Three numbers, the ones people compare listings on */}
                <div className="grid grid-cols-3 gap-2 mt-6 lg:mt-0 lg:w-[380px] lg:flex-shrink-0">
                  {[
                    {
                      k: 'Pris',
                      v: `${exam.price} kr`,
                      n: /kostnadsfri|gratis/i.test(exam.priceNote ?? '')
                        ? 'gratis vid tidigare F'
                        : 'se villkor nedan',
                    },
                    { k: 'Anmälan', v: stat.value, n: stat.note },
                    {
                      k: 'Prövning',
                      v:
                        nextPeriod.confirmed && nextPeriod.examWindowStart
                          ? formatShort(nextPeriod.examWindowStart)
                          : '—',
                      n:
                        nextPeriod.confirmed && nextPeriod.examWindowEnd
                          ? nextPeriod.examWindowEnd === nextPeriod.examWindowStart
                            ? 'ett tillfälle'
                            : `till ${formatShort(nextPeriod.examWindowEnd)}`
                          : 'datum ej satt',
                    },
                  ].map((s) => (
                    <div key={s.k} className="bg-white/15 rounded-2xl p-3 backdrop-blur-sm min-w-0">
                      <p className="text-brand-100 text-[10.5px] font-bold uppercase tracking-wider">
                        {s.k}
                      </p>
                      <p
                        className={`font-hero text-white leading-tight mt-0.5 ${
                          s.v.length > 7 ? 'text-xl lg:text-2xl' : 'text-2xl lg:text-[32px]'
                        }`}
                      >
                        {s.v}
                      </p>
                      <p className="text-brand-100 text-[11.5px] leading-snug mt-0.5">{s.n}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* The two ways out. Which one leads is decided by the round's
                state — see lib/examAction.ts. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={action.primary.href}
                target="_blank"
                rel="noopener noreferrer"
                title={action.primary.title}
                // Den enda händelsen som säger om appen gör sitt jobb: att
                // någon faktiskt gick vidare till anordnarens anmälan.
                onClick={() => track.registrationClicked(exam, action.live)}
                className={`group rounded-2xl p-5 flex items-start justify-between gap-3 transition-transform active:scale-98 ${
                  action.variant === 'full'
                    ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/25'
                    : action.variant === 'closed'
                      ? 'bg-ink-soft hover:bg-ink shadow-lg'
                      : 'bg-brand-500 hover:bg-brand-600 shadow-lg shadow-brand-200'
                }`}
              >
                <span className="min-w-0">
                  <span className="block font-hero text-white text-2xl lg:text-[30px] leading-tight">
                    {action.live ? 'Till anmälan' : action.primary.label}
                  </span>
                  <span className="block text-brand-100 text-[13.5px] font-semibold mt-1">
                    {action.live
                      ? `${flow.ctaLabel} · ${exam.price} kr`
                      : `${exam.provider} publicerar nästa omgång`}
                  </span>
                </span>
                {action.variant === 'full' ? (
                  <Ban size={22} strokeWidth={2.5} className="text-white flex-shrink-0 mt-1" />
                ) : action.variant === 'closed' ? (
                  <CalendarX size={22} className="text-white flex-shrink-0 mt-1" />
                ) : (
                  <ExternalLink
                    size={22}
                    className="text-white flex-shrink-0 mt-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                )}
              </a>

              {action.secondary && (
                <a
                  href={action.secondary.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={action.secondary.title}
                  className="group rounded-2xl p-5 flex items-start justify-between gap-3 bg-surface border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)] hover:shadow-[2px_2px_0_0_var(--color-ink)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                >
                  <span className="min-w-0">
                    <span className="block font-hero text-ink text-2xl lg:text-[30px] leading-tight">
                      {action.live ? 'Skolans sida' : 'Anmälningssidan'}
                    </span>
                    <span className="block text-ink-soft text-[13.5px] font-semibold mt-1 truncate">
                      {action.live ? `${exam.provider} · datum och villkor` : 'öppna den ändå'}
                    </span>
                  </span>
                  <Globe size={22} className="text-ink flex-shrink-0 mt-1" />
                </a>
              )}
            </div>

            {/* Where the facts came from */}
            <p className="inline-flex items-center gap-1.5 text-trust-700 text-[12.5px] font-medium px-1">
              <ShieldCheck size={14} className="flex-shrink-0" />
              Kontrollerat mot {exam.provider} {formatShort(exam.verifiedAt)}
            </p>

            {/* Tabs */}
            <div className="grid grid-cols-3 gap-2">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  aria-pressed={tab === id}
                  className={`flex items-center justify-center gap-2 py-3 rounded-full text-[14px] font-bold transition-colors ${
                    tab === id
                      ? 'bg-ink text-cream'
                      : 'bg-surface border border-line text-ink-soft hover:bg-sand'
                  }`}
                >
                  <Icon size={16} />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>

            {/* Panel */}
            <div className="bg-surface rounded-3xl border border-line p-4 lg:p-5">
              {tab === 'dates' &&
                (nextPeriod.confirmed ? (
                  <div className="space-y-2.5">
                    {nextPeriod.applicationStart && (
                      <TimelineRow
                        date={nextPeriod.applicationStart}
                        tint="bg-brand-50"
                        chip="bg-brand-500"
                        title="Anmälan öppnar"
                        sub={
                          !nextPeriod.applicationEnd
                            ? 'Stänger när platserna är slut'
                            : nextPeriod.applicationEnd === nextPeriod.applicationStart
                              ? 'Öppnar och stänger samma dag'
                              : `Stänger ${formatShort(nextPeriod.applicationEnd)}`
                        }
                      />
                    )}
                    {!nextPeriod.applicationStart && nextPeriod.applicationEnd && (
                      <TimelineRow
                        date={nextPeriod.applicationEnd}
                        tint="bg-brand-50"
                        chip="bg-brand-500"
                        title="Sista anmälningsdag"
                        sub={status.label}
                      />
                    )}
                    {nextPeriod.examWindowStart && (
                      <TimelineRow
                        date={nextPeriod.examWindowStart}
                        tint="bg-accent2-50"
                        chip="bg-accent2-500"
                        title="Prövningsperiod"
                        sub={
                          nextPeriod.examWindowEnd &&
                          nextPeriod.examWindowEnd !== nextPeriod.examWindowStart
                            ? `${formatLong(nextPeriod.examWindowStart)} – ${formatLong(nextPeriod.examWindowEnd)}`
                            : formatLong(nextPeriod.examWindowStart)
                        }
                      />
                    )}
                    {/* The provider's own sentence. It is long, and this is the
                        one place with room for it. */}
                    <p className="flex items-start gap-2.5 bg-cream rounded-2xl px-4 py-3 text-ink-soft text-[13.5px] leading-relaxed">
                      <Info size={15} className="text-ink-faint flex-shrink-0 mt-0.5" />
                      {nextPeriod.label}
                    </p>
                    {calendarEvents.length > 0 && !passed && action.live && (
                      <button
                        onClick={() => {
                          track.calendarExported(exam);
                          downloadCalendar(exam);
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-ink hover:bg-black text-cream text-[15px] font-bold py-3.5 rounded-2xl transition-colors active:scale-98"
                      >
                        <CalendarPlus size={17} />
                        Lägg till {calendarEvents.length} datum i kalendern
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5">
                    <Info size={16} className="text-brand-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-ink text-[15px] font-semibold">{nextPeriod.label}</p>
                      <p className="text-ink-soft text-[13px] mt-1 leading-relaxed">
                        Vi visar aldrig gissade datum. Se aktuella anmälningstider hos{' '}
                        {exam.provider} innan du planerar din prövning.
                      </p>
                    </div>
                  </div>
                ))}

              {tab === 'parts' && (
                <div className="space-y-3">
                  {exam.components.map((c) => (
                    <div key={c.name} className="border-l-[3px] border-brand-200 pl-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-display font-semibold text-ink text-[17px]">{c.name}</p>
                        <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 text-[11.5px] font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                          <Clock size={11} />
                          {c.duration}
                        </span>
                      </div>
                      <p className="text-ink-soft text-[13.5px] leading-relaxed mt-1">
                        {c.description}
                      </p>
                    </div>
                  ))}
                  {/* What still has to happen after the button — the steps only
                      hold while the round is open. */}
                  {action.live && (
                    <div className="pt-1">
                      <p className="flex items-center gap-2 font-display font-semibold text-ink text-[17px] mb-2">
                        <ListChecks size={16} className="text-brand-600" />
                        Så anmäler du dig
                      </p>
                      <ol className="space-y-2">
                        {flow.steps.map((step, i) => (
                          <li key={i} className="flex gap-2.5">
                            <span className="w-5 h-5 bg-brand-50 text-brand-600 rounded-full text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <p className="text-ink text-[13.5px] leading-relaxed">{step}</p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}

              {tab === 'tips' && (
                <ul className="space-y-2.5">
                  {exam.studyTips.map((t, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="w-6 h-6 bg-amber-accent-50 text-amber-accent rounded-full text-[12px] font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-ink text-[14px] leading-relaxed">{t}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Hitta hit */}
            <div className="bg-surface rounded-3xl border border-line overflow-hidden">
              <div className="flex items-start gap-3 p-4 lg:p-5">
                <span className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-brand-600" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display font-semibold text-ink text-[19px] leading-tight">
                    Hitta hit
                  </p>
                  <p className="text-ink-soft text-[13px] mt-0.5">{exam.address}</p>
                </div>
                {distanceKm !== null && (
                  <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 text-[12px] font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                    <Navigation size={11} />
                    {formatDistanceKm(distanceKm)}
                  </span>
                )}
              </div>
              <iframe
                title={`Karta över ${exam.schoolName}`}
                src={osmSrc}
                className="w-full h-52 border-0"
                loading="lazy"
              />
              <div className="grid grid-cols-2 gap-2 p-3">
                <a
                  href={gmapsDir}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-ink hover:bg-black text-cream text-[14.5px] font-bold py-3 rounded-2xl transition-colors"
                >
                  <Navigation size={16} />
                  Vägbeskrivning
                </a>
                <a
                  href={gmapsView}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-cream hover:bg-sand text-ink text-[14.5px] font-bold py-3 rounded-2xl transition-colors"
                >
                  Google Maps
                </a>
              </div>
            </div>

            <p className="text-ink-soft text-[13.5px] leading-relaxed px-1 pb-2">
              {exam.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineRow({
  date,
  tint,
  chip,
  title,
  sub,
}: {
  date: string;
  tint: string;
  chip: string;
  title: string;
  sub: string;
}) {
  const { day, month } = chipParts(date);
  return (
    <div className={`flex items-center gap-3.5 rounded-2xl p-3 ${tint}`}>
      <span
        className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 ${chip}`}
      >
        <span className="font-hero text-white text-[22px] leading-none">{day}</span>
        <span className="text-white text-[9.5px] font-bold uppercase tracking-wider mt-0.5">
          {month}
        </span>
      </span>
      <span className="min-w-0">
        <span className="block font-display font-semibold text-ink text-[19px] leading-tight">
          {title}
        </span>
        <span className="block text-ink-soft text-[13.5px] mt-0.5">{sub}</span>
      </span>
    </div>
  );
}
