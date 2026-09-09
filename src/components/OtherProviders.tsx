import { ArrowRight } from 'lucide-react';
import { Exam } from '../types';
import { useStore } from '../store/useStore';
import { getExamStatus } from '../lib/examStatusColor';
import { canStillBook, describeOthers, otherProvidersFor } from '../lib/otherProviders';

/** Enough to see the pattern, short enough to stay a footnote to the listing. */
const SHOWN = 5;

function priceLabel(price: number): string {
  return price === 0 ? 'Gratis' : `${price} kr`;
}

/**
 * "Samma kurs hos andra anordnare" — the way out of a round you just missed.
 *
 * The sheet answers one question well: is this the prövning for me. What it
 * could never answer is the one asked immediately after a grey "Anmälan
 * stängde 12 aug." — *then where*. The dataset has known the answer for a while
 * (the same course is prövad by four anordnare in five kommuner) and had no
 * place to say it.
 *
 * It stays a list, not a table: the columns that would justify a table are
 * already the Jämför-vy in Mina prövningar, and that view earns its width by
 * only holding listings the user chose. Here the useful part is the ordering —
 * bookable first, soonest first — so the first row is the answer and the rest
 * is context.
 */
export function OtherProviders({ exam }: { exam: Exam }) {
  const { exams, setShowingExamDetail, setSearchQuery, setFilterSubject, setFilterCity } =
    useStore();
  const setFilterStatus = useStore((s) => s.setFilterStatus);
  const setActiveTab = useStore((s) => s.setActiveTab);

  const others = otherProvidersFor(exam, exams);
  if (others.length === 0) return null;

  const shown = others.slice(0, SHOWN);
  const rest = others.length - shown.length;
  const live = others.filter((e) => canStillBook(e)).length;

  /** Hand the rest to Upptäck, with the filters that would hide them cleared —
      a search that lands on an empty list because a chip was still set would
      read as "there are none", which is the opposite of why we sent them. */
  const showAll = () => {
    setSearchQuery(exam.courseCode);
    setFilterSubject('');
    setFilterCity('');
    setFilterStatus('');
    setShowingExamDetail(null);
    setActiveTab('discover');
  };

  return (
    <div className="bg-surface rounded-3xl border border-line p-4 lg:p-5">
      <p className="font-display font-semibold text-ink text-[19px] leading-tight">
        Samma kurs hos andra anordnare
      </p>
      <p className="text-ink-soft text-[13px] mt-0.5">
        {describeOthers(others.length, live, exam.courseCode)}
      </p>

      <ul className="mt-3 -mx-1">
        {shown.map((other) => {
          const status = getExamStatus(other);
          return (
            <li key={other.id}>
              <button
                onClick={() => setShowingExamDetail(other.id)}
                className="w-full text-left flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-cream transition-colors"
              >
                <span
                  aria-hidden="true"
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${status.tone.dot}`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-ink text-[14.5px] truncate">
                    {other.schoolName}
                  </span>
                  <span className="block text-[12.5px] text-ink-soft truncate">
                    {other.course !== exam.course && <>{other.course} · </>}
                    {other.city} · <span className={status.tone.text}>{status.label}</span>
                  </span>
                </span>
                <span className="text-[13px] font-bold text-ink tnum flex-shrink-0">
                  {priceLabel(other.price)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {rest > 0 && (
        <button
          onClick={showAll}
          className="mt-1 inline-flex items-center gap-1.5 px-3 py-2 text-[13.5px] font-bold text-brand-700 hover:text-brand-500 transition-colors"
        >
          Sök på {exam.courseCode} i Upptäck
          <ArrowRight size={15} />
        </button>
      )}
    </div>
  );
}
