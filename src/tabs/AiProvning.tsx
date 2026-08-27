import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Sparkles, CalendarX2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ExamCard } from '../components/ExamCard';
import { answerQuery, summariseAnswer, QueryMatch } from '../lib/examQuery';
import { useMinuteTick } from '../hooks/useMinuteTick';

/**
 * One screen, one question: "vad ska jag göra åt mitt betyg?"
 *
 * Everywhere else the app asks you to take that question apart before it will
 * answer — kommun in one filter, ämne in another, sort by date, then read the
 * cards to work out which rounds you can still make. Here you write the
 * sentence you already had, and the answer comes back as listings.
 *
 * The answer is built out of `data/exams.ts` and nothing else. Every date, every
 * avgift and every deadline on this screen is a field of a listing that is
 * really in the dataset, checked against the provider's own page — see
 * `lib/examQuery.ts`. Nothing here can produce a sentence the data does not
 * already contain, which is the only way a screen shaped like a chat can be
 * trusted with a deadline.
 */

interface Turn {
  id: number;
  question: string;
  lines: string[];
  matches: QueryMatch[];
  /** Set when the user named a date and some rounds land after it. */
  before?: string;
}

const EXAMPLES = [
  'Jag bor i Göteborg och vill höja mitt betyg i Matte 2b innan december',
  'Hinner jag pröva Engelska 6 i höst?',
  'Var kan jag pröva Kemi 1?',
];

export function AiProvning() {
  const { exams } = useStore();
  const [draft, setDraft] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const threadEnd = useRef<HTMLDivElement>(null);
  // The answers say "öppen i dag" and "stänger 1 sep", so they have to be
  // recomputed as the clock crosses a deadline, exactly like the cards do.
  useMinuteTick();

  useEffect(() => {
    if (turns.length) threadEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns.length]);

  const ask = (question: string) => {
    const q = question.trim();
    if (!q) return;
    const answer = answerQuery(q, exams);
    setTurns((prev) => [
      ...prev,
      {
        id: prev.length,
        question: q,
        lines: summariseAnswer(answer),
        matches: answer.matches,
        before: answer.parsed.before,
      },
    ]);
    setDraft('');
  };

  return (
    <div className="flex flex-col h-full bg-cream">
      {/* Mobile title bar, same shape as the other tabs' */}
      <div className="lg:hidden shrink-0 bg-cream/95 backdrop-blur-sm border-b border-line px-4 py-2">
        <span className="font-display text-lg font-semibold text-ink">AI-prövning</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-screen-md mx-auto w-full px-4 lg:px-8 py-6 lg:py-8 flex flex-col gap-6 animate-rise-in">
          <header>
            <h1 className="font-hero-xl text-[38px] sm:text-[48px] lg:text-[56px] leading-none text-ink">
              Skriv frågan.
            </h1>
            <p className="font-display italic text-[17px] sm:text-[20px] text-ink-soft mt-2">
              Som du skulle sagt den. Svaret byggs av appens egna, kontrollerade listningar — inga
              datum eller avgifter gissas fram.
            </p>
          </header>

          {turns.length === 0 && (
            <div className="flex flex-col gap-2.5">
              <p className="text-[11.5px] font-bold uppercase tracking-[.09em] text-ink-faint">
                Prova
              </p>
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  onClick={() => ask(example)}
                  className="text-left bg-surface border-[1.5px] border-line rounded-[22px] px-[18px] py-3.5 text-[15px] font-semibold text-ink-soft hover:border-ink hover:text-ink transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          )}

          {turns.map((turn) => (
            <article key={turn.id} className="flex flex-col gap-4">
              <p className="self-end max-w-[85%] bg-ink text-cream rounded-[22px] rounded-br-lg px-[18px] py-3 text-[15.5px] font-semibold">
                {turn.question}
              </p>

              <div className="bg-surface border-[1.5px] border-line rounded-[28px] p-[22px] flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <span className="w-[34px] h-[34px] rounded-xl bg-ink text-cream flex items-center justify-center flex-shrink-0">
                    <Sparkles size={16} strokeWidth={2.2} />
                  </span>
                  <div className="flex flex-col gap-1.5 pt-1">
                    {turn.lines.map((line, i) => (
                      <p
                        key={line}
                        className={
                          i === 0
                            ? 'font-display text-[17.5px] font-semibold text-ink leading-snug'
                            : 'text-[14.5px] text-ink-soft leading-snug'
                        }
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                {turn.matches.length > 0 && (
                  <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
                    {turn.matches.map((match) => (
                      <div key={match.exam.id} className="flex flex-col gap-1.5">
                        <ExamCard exam={match.exam} />
                        {turn.before && match.inTime === false && (
                          <p className="flex items-center gap-1.5 text-[12.5px] font-bold text-ink-faint px-1">
                            <CalendarX2 size={13} strokeWidth={2.3} />
                            Blir inte klar till din tid
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}

          <div ref={threadEnd} />
        </div>
      </div>

      {/* The one primary action on the screen. */}
      <div className="shrink-0 border-t border-line bg-cream/95 backdrop-blur-sm px-4 lg:px-8 pt-3 pb-24 lg:pb-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(draft);
          }}
          className="max-w-screen-md mx-auto focus-ring-host flex items-end gap-2 bg-surface border-2 border-ink rounded-[26px] pl-5 pr-2 py-1.5"
        >
          <label htmlFor="ai-question" className="sr-only">
            Din fråga
          </label>
          <textarea
            id="ai-question"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                ask(draft);
              }
            }}
            rows={1}
            placeholder="Jag bor i … och vill höja …"
            className="flex-1 min-w-0 resize-none bg-transparent border-0 outline-none text-[16.5px] font-semibold text-ink placeholder-ink-faint py-3 max-h-32"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="Fråga"
            className="w-[42px] h-[42px] mb-1 rounded-[18px] bg-ink text-cream flex items-center justify-center flex-shrink-0 disabled:opacity-30 transition-opacity"
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  );
}
