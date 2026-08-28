import { useState, useRef, FormEvent } from 'react';
import { ArrowUp, HelpCircle, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ExamCard } from '../components/ExamCard';
import { askProvningar, AskResult } from '../lib/askProvningar';
import { askRemote, isConfigured } from '../lib/aiAnswer';

/**
 * AI-prövning: one box you write a sentence into.
 *
 * Discover answers "what exists"; this answers "what should *I* do". They are
 * different questions and only one of them can be typed into a filter. "Jag bor
 * i Göteborg och vill höja mitt betyg i Matte 2b innan december" contains a
 * city, a course and a deadline, and the search box can use none of them —
 * matched against school names and tags it returns nothing at all.
 *
 * Two rules shape everything below.
 *
 * The answer is a sentence and then the listings it is about. Not a wall of
 * prose with dates retyped into it: the sentence orients, the cards are the
 * answer, and they are the same cards as everywhere else in the app, so they
 * carry the same colour, the same deadline and the same link out. Nothing here
 * can show a date that isn't in the dataset, because nothing here writes dates.
 *
 * And it works with the network off. `askProvningar` runs locally against the
 * dataset already in the bundle; the Claude call in `aiAnswer.ts` is an upgrade
 * on top of it when an endpoint is configured, never a dependency. A student
 * checking a deadline on a bus does not deserve a spinner and an apology.
 */
interface Turn {
  question: string;
  local: AskResult;
  /** Claude's prose, when an endpoint answered. The listings are the same either way. */
  remote?: string;
  /** True while the remote answer is still in flight. */
  pending: boolean;
}

/**
 * Three questions in the shape the box understands — a place, a course, a
 * deadline. They are here to teach that shape in one glance, so they only show
 * before the first question and never come back.
 */
const EXAMPLES = [
  'Jag bor i Göteborg och vill höja Matematik 2b innan december',
  'Var kan jag pröva Svenska 3 i höst?',
  'Kemi 1 i Linköping innan jul',
];

export function Ask() {
  const { exams, setShowingFaq } = useStore();
  const [draft, setDraft] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  const ask = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;
    const local = askProvningar(trimmed, exams);
    const index = turns.length;
    setTurns((previous) => [...previous, { question: trimmed, local, pending: isConfigured() }]);
    setDraft('');
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }));

    if (!isConfigured() || local.emptyQuestion) return;
    askRemote(trimmed, local)
      .then((remote) =>
        setTurns((previous) =>
          previous.map((turn, i) => (i === index ? { ...turn, remote, pending: false } : turn)),
        ),
      )
      // The local answer is already on screen and is already true. A failed
      // upgrade has nothing to report — it just stops being pending.
      .catch(() =>
        setTurns((previous) =>
          previous.map((turn, i) => (i === index ? { ...turn, pending: false } : turn)),
        ),
      );
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    ask(draft);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-cream">
      <div className="lg:hidden sticky top-0 z-30 bg-cream/95 backdrop-blur-sm border-b border-line px-4 py-2 flex items-center justify-between">
        <span className="font-display text-lg font-semibold text-ink">AI-prövning</span>
        <button
          onClick={() => setShowingFaq(true)}
          aria-label="Vanliga frågor"
          className="w-9 h-9 rounded-xl bg-violet-tint flex items-center justify-center"
        >
          <HelpCircle size={17} className="text-violet-ink" />
        </button>
      </div>

      <div className="max-w-screen-md mx-auto w-full px-4 lg:px-8 py-6 lg:py-8 flex flex-col gap-6 animate-rise-in pb-28 lg:pb-10">
        <div>
          <h1 className="font-hero-xl text-[38px] sm:text-[48px] lg:text-[56px] leading-none text-ink">
            Fråga om din prövning
          </h1>
          <p className="font-display italic text-[17px] sm:text-[20px] text-ink-soft mt-2">
            Skriv var du bor, vad du vill pröva och när det ska vara klart.
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          {/* The page's one control, in the tab's own ink. Everything else here
              is text and the cards the app already draws. */}
          <div className="focus-ring-host flex items-center gap-3 bg-surface border-2 border-ink rounded-[26px] pl-5 pr-2 py-1.5">
            <Sparkles size={19} strokeWidth={2.2} className="text-ink flex-shrink-0" />
            <input
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="T.ex. höja Matte 2b i Göteborg innan december"
              aria-label="Skriv din fråga om prövningar"
              enterKeyHint="send"
              autoComplete="off"
              className="flex-1 min-w-0 bg-transparent border-0 outline-none text-[16.5px] font-semibold text-ink placeholder-ink-faint py-3.5"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label="Fråga"
              className="w-11 h-11 rounded-full bg-ink text-white flex items-center justify-center flex-shrink-0 disabled:opacity-30 transition-opacity active:scale-95"
            >
              <ArrowUp size={20} strokeWidth={2.6} />
            </button>
          </div>

          {turns.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => ask(example)}
                  className="text-left text-[13.5px] font-semibold text-ink-soft bg-surface border border-line rounded-2xl px-3.5 py-2 hover:bg-sand transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          )}
        </form>

        {turns.map((turn, index) => (
          <section key={index} className="flex flex-col gap-3">
            <p className="text-[15px] font-bold text-ink-faint">{turn.question}</p>
            <p className="text-[17px] leading-relaxed text-ink whitespace-pre-line">
              {turn.remote ?? turn.local.answer}
            </p>
            {turn.pending && (
              <p className="text-[13.5px] font-semibold text-ink-faint">Frågar Claude …</p>
            )}
            {turn.local.exams.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {turn.local.exams.slice(0, 6).map((exam) => (
                  <ExamCard key={exam.id} exam={exam} />
                ))}
              </div>
            )}
            {turn.local.exams.length > 6 && (
              <p className="text-[13.5px] font-semibold text-ink-faint">
                {turn.local.exams.length - 6} till finns under Upptäck.
              </p>
            )}
          </section>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
