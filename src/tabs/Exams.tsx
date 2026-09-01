import { useState, useMemo } from 'react';
import {
  LayoutGrid,
  CalendarDays,
  Columns3,
  Compass,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { ExamCard } from '../components/ExamCard';
import { CompareTable } from '../components/CompareTable';
import { WatchList } from '../components/WatchList';
import { Exam, SavedExam } from '../types';
import { compareByPeriod } from '../lib/examStatus';

/** The three kinds of date a saved round can put in your calendar. */
type EventKind = 'opens' | 'closes' | 'exam';

const EVENT_TONE: Record<EventKind, { label: string; dot: string; tint: string; ink: string }> = {
  opens: {
    label: 'Anmälan öppnar',
    dot: 'bg-brand-500',
    tint: 'bg-brand-50',
    ink: 'text-brand-700',
  },
  closes: {
    label: 'Anmälan stänger',
    dot: 'bg-orange-600',
    tint: 'bg-orange-50',
    ink: 'text-orange-700',
  },
  exam: {
    label: 'Prövningsperiod',
    dot: 'bg-accent2-500',
    tint: 'bg-accent2-50',
    ink: 'text-accent2-700',
  },
};

interface CalEvent {
  date: string;
  kind: EventKind;
  title: string;
  where: string;
}

function eventsFor(exams: Exam[]): CalEvent[] {
  const out: CalEvent[] = [];
  for (const e of exams) {
    const p = e.nextPeriod;
    if (!p.confirmed) continue;
    const where = `${e.course} · ${e.schoolName}`;
    if (p.applicationStart)
      out.push({ date: p.applicationStart, kind: 'opens', title: 'Anmälan öppnar', where });
    if (p.applicationEnd)
      out.push({ date: p.applicationEnd, kind: 'closes', title: 'Sista anmälningsdag', where });
    if (p.examWindowStart)
      out.push({ date: p.examWindowStart, kind: 'exam', title: 'Prövningsperiod', where });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

function monthLabel(y: number, m: number) {
  return new Date(y, m, 1).toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' });
}

/** Monday-first grid offset for the 1st of the month. */
function leadingBlanks(y: number, m: number) {
  return (new Date(y, m, 1).getDay() + 6) % 7;
}

function Calendar({ events }: { events: CalEvent[] }) {
  const today = new Date();
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const days = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const blanks = leadingBlanks(cursor.y, cursor.m);
  const iso = (d: number) =>
    `${cursor.y}-${String(cursor.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const todayIso = today.toISOString().slice(0, 10);

  const byDay = new Map<string, EventKind>();
  for (const ev of events) {
    // First event of the day wins the colour; the list below shows them all.
    if (!byDay.has(ev.date)) byDay.set(ev.date, ev.kind);
  }

  const step = (delta: number) =>
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  const monthEvents = events.filter((e) => e.date.startsWith(iso(1).slice(0, 7)));

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface border-[1.5px] border-line rounded-[32px] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4 mb-[18px]">
          <p className="font-hero text-[28px] sm:text-[34px] leading-none capitalize">
            {monthLabel(cursor.y, cursor.m)}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => step(-1)}
              aria-label="Föregående månad"
              className="w-[42px] h-[42px] border-[1.5px] border-line bg-cream rounded-[15px] flex items-center justify-center text-ink-soft transition-transform hover:-translate-x-0.5"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => step(1)}
              aria-label="Nästa månad"
              className="w-[42px] h-[42px] border-[1.5px] border-line bg-cream rounded-[15px] flex items-center justify-center text-ink-soft transition-transform hover:translate-x-0.5"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="flex gap-2.5 flex-wrap mb-4">
          {(Object.keys(EVENT_TONE) as EventKind[]).map((k) => (
            <span
              key={k}
              className={`inline-flex items-center gap-2 font-bold text-[12.5px] px-[15px] py-2.5 rounded-full ${EVENT_TONE[k].tint} ${EVENT_TONE[k].ink}`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${EVENT_TONE[k].dot}`} />
              {EVENT_TONE[k].label}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'].map((d) => (
            <div
              key={d}
              className="text-center text-[11px] font-bold uppercase tracking-[.08em] text-ink-faint pb-1"
            >
              {d}
            </div>
          ))}
          {Array.from({ length: blanks }, (_, i) => (
            <div key={`b${i}`} />
          ))}
          {Array.from({ length: days }, (_, i) => {
            const d = i + 1;
            const key = iso(d);
            const kind = byDay.get(key);
            const isToday = key === todayIso;
            return (
              <div
                key={d}
                className={`aspect-square rounded-[18px] flex flex-col items-center justify-center gap-1 text-[15px] font-bold tnum ${
                  kind
                    ? `${EVENT_TONE[kind].dot} text-white`
                    : isToday
                      ? 'bg-ink text-cream'
                      : 'bg-cream text-ink-soft'
                }`}
              >
                {d}
                <span
                  className={`w-[7px] h-[7px] rounded-full ${kind ? 'bg-white/60' : 'bg-transparent'}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {monthEvents.length === 0 ? (
          <div className="bg-surface border-[1.5px] border-dashed border-line rounded-[26px] p-8 text-center font-display italic text-[18px] text-ink-soft">
            Inga datum den här månaden.
          </div>
        ) : (
          monthEvents.map((ev, i) => {
            const d = new Date(ev.date);
            return (
              <div
                key={i}
                className="flex items-center gap-[18px] bg-surface border-[1.5px] border-line rounded-[26px] px-[22px] py-[18px]"
              >
                <span
                  className={`w-[52px] h-[52px] rounded-[18px] flex flex-col items-center justify-center text-white flex-shrink-0 leading-[1.05] ${EVENT_TONE[ev.kind].dot}`}
                >
                  <span className="font-hero text-[22px] tnum">{d.getDate()}</span>
                  <span className="text-[9px] font-bold uppercase tracking-[.06em]">
                    {d.toLocaleDateString('sv-SE', { month: 'short' }).replace('.', '')}
                  </span>
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-[19px]">{ev.title}</p>
                  <p className="text-[13.5px] text-ink-soft mt-px truncate">{ev.where}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function Exams() {
  const { savedExams, exams, setActiveTab } = useStore();
  const [view, setView] = useState<'list' | 'compare' | 'cal'>('list');

  const saved = useMemo(
    () =>
      savedExams
        .map((se) => ({ saved: se, exam: exams.find((e) => e.id === se.examId) }))
        .filter((x): x is { saved: SavedExam; exam: Exam } => !!x.exam)
        .sort((a, b) => compareByPeriod(a.exam, b.exam)),
    [savedExams, exams],
  );

  const savedList = saved.map((s) => s.exam);
  const events = useMemo(() => eventsFor(savedList), [savedList]);

  /** The next application opening among the saved rounds. */
  const nextOpen = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return events.filter((e) => e.kind === 'opens' && e.date >= today)[0];
  }, [events]);

  const toPay = savedList.reduce((sum, e) => sum + e.price, 0);

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-cream">
      <div className="max-w-screen-xl mx-auto w-full px-4 lg:px-8 py-6 lg:py-8 pt-14 lg:pt-8 flex flex-col gap-5 animate-rise-in pb-28 lg:pb-10">
        <h1 className="font-hero-xl text-[38px] sm:text-[48px] lg:text-[56px] leading-none text-ink">
          Mina prövningar
        </h1>

        <div className="flex gap-2 bg-surface border-[1.5px] border-line rounded-[24px] p-[7px] w-fit">
          {(
            [
              ['list', 'Sparade prövningar', LayoutGrid],
              ['compare', 'Jämför', Columns3],
              ['cal', 'Kalender', CalendarDays],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setView(id)}
              aria-pressed={view === id}
              className={`flex items-center gap-2.5 rounded-[18px] px-4 sm:px-6 py-3 text-[14.5px] font-bold transition-colors ${
                view === id ? 'bg-ink text-cream' : 'text-ink-soft hover:bg-cream'
              }`}
            >
              <Icon size={17} />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>

        {/* Above the saved rounds, because a watch outlives them: a round you
            saved in September is a dead card in November, while "Matematik i
            Stockholm" is still the errand. */}
        {view === 'list' && <WatchList />}

        {savedList.length === 0 ? (
          <div className="bg-surface border-[1.5px] border-dashed border-line rounded-[26px] p-9 text-center">
            <p className="font-display italic text-[18px] text-ink-soft">
              Inget sparat än — tryck på bokmärket på en prövning så hamnar den här.
            </p>
            <button
              onClick={() => setActiveTab('discover')}
              className="mt-4 inline-flex items-center gap-2 bg-ink text-cream text-[14px] font-bold px-5 py-3 rounded-[20px]"
            >
              <Compass size={16} /> Upptäck prövningar
            </button>
          </div>
        ) : view === 'cal' ? (
          <Calendar events={events} />
        ) : view === 'compare' ? (
          <CompareTable exams={savedList} />
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex gap-3.5 flex-wrap">
              <div className="flex-1 min-w-[200px] bg-trust-50 rounded-[28px] px-6 py-[22px]">
                <p className="text-[10.5px] font-bold uppercase tracking-[.1em] text-trust-700">
                  Sparade
                </p>
                <p className="font-hero text-[38px] sm:text-[46px] leading-none mt-1 text-trust-700 tnum">
                  {savedList.length}
                </p>
              </div>
              <div className="flex-1 min-w-[200px] bg-brand-50 rounded-[28px] px-6 py-[22px]">
                <p className="text-[10.5px] font-bold uppercase tracking-[.1em] text-brand-700">
                  Anmälan öppnar
                </p>
                <p className="font-hero text-[38px] sm:text-[46px] leading-none mt-1 text-brand-700 tnum">
                  {nextOpen
                    ? new Date(nextOpen.date)
                        .toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })
                        .replace('.', '')
                    : '—'}
                </p>
              </div>
              <div className="flex-1 min-w-[200px] bg-amber-accent-50 rounded-[28px] px-6 py-[22px]">
                <p className="text-[10.5px] font-bold uppercase tracking-[.1em] text-amber-accent">
                  Att betala
                </p>
                <p className="font-hero text-[38px] sm:text-[46px] leading-none mt-1 text-amber-accent tnum">
                  {toPay.toLocaleString('sv-SE')} kr
                </p>
              </div>
            </div>

            <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
              {savedList.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
