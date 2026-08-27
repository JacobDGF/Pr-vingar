import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Key, Loader2, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ExamCard } from '../components/ExamCard';
import { rank } from '../lib/aiSearch';
import { ask, readApiKey, writeApiKey, MAX_CONTEXT_LISTINGS } from '../lib/aiClient';
import { Exam } from '../types';

/**
 * One question, one answer.
 *
 * The brief for this tab was a chat, and the thing a chat is bad at is the
 * thing this app exists for: a scrolling transcript buries the deadline three
 * messages up. So it is a chat in the only sense that matters — you write
 * whatever you want, in your own words — and a page in every other: your
 * question, the answer, and the listings the answer is about, all on screen at
 * once. Ask again and the page becomes the new answer rather than growing a
 * history nobody re-reads.
 *
 * The listings under the answer are the same `ExamCard` as everywhere else,
 * carrying the same status colour and opening the same detail sheet. That is
 * the point: the answer is a way *into* the dataset, not a second, softer copy
 * of it that might disagree.
 */

const EXAMPLES = [
  'Jag bor i Göteborg och vill höja mitt betyg i Matte 2b innan december',
  'Vilka prövningar i svenska kan jag fortfarande anmäla mig till?',
  'Finns det någon prövning i kemi i Skåne i höst?',
];

type Phase = 'idle' | 'thinking' | 'answered';

/**
 * How many listings the answer shows.
 *
 * Deliberately short. A ranked list of everything that scored above zero is
 * what Upptäck is for; here the page is meant to be readable as an answer, and
 * the twenty-fourth row is not part of one. What is left out is said out loud
 * rather than silently dropped, with the way to see the rest next to it.
 */
const SHOWN = 12;

export function AiProvning() {
  const exams = useStore((s) => s.exams);
  const setActiveTab = useStore((s) => s.setActiveTab);

  const [question, setQuestion] = useState('');
  const [asked, setAsked] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [answer, setAnswer] = useState('');
  const [matches, setMatches] = useState<Exam[]>([]);
  /** How many matched in all, so the heading can admit what it left out. */
  const [total, setTotal] = useState(0);
  /** Why there is no written answer, in one sentence. Never a stack trace. */
  const [fallbackNote, setFallbackNote] = useState('');

  const [apiKey, setApiKey] = useState(() => readApiKey());
  const [showingKeyField, setShowingKeyField] = useState(false);
  const [keyDraft, setKeyDraft] = useState('');

  const answerRef = useRef<HTMLDivElement>(null);

  // The answer is below the fold on a phone; without this the button appears to
  // do nothing at all.
  useEffect(() => {
    if (phase === 'answered') answerRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [phase]);

  const submit = async (text: string) => {
    const q = text.trim();
    if (!q || phase === 'thinking') return;

    setAsked(q);
    setPhase('thinking');
    setAnswer('');
    setFallbackNote('');

    // The local match is computed first and always: it is the answer when there
    // is no key, the context when there is one, and the thing still standing if
    // the call fails.
    const shortlist = rank(q, exams).map((m) => m.exam);
    setMatches(shortlist.slice(0, SHOWN));
    setTotal(shortlist.length);

    if (!apiKey) {
      setFallbackNote(
        shortlist.length > 0
          ? 'Sökt i datan här i appen. Koppla din egen API-nyckel längst ned för ett skrivet svar.'
          : 'Ingen prövning i datan matchar det du skrev. Prova ett bredare ämne eller en annan kommun.',
      );
      setPhase('answered');
      return;
    }

    try {
      const { answer: text } = await ask(q, shortlist.slice(0, MAX_CONTEXT_LISTINGS), apiKey);
      setAnswer(text);
    } catch {
      // Every failure lands here on purpose — a bad key, a rate limit, a plane
      // with no wifi. The user gets the listings and one plain sentence, not an
      // error page: the search below is a real answer to their question.
      setFallbackNote(
        'Kunde inte hämta ett skrivet svar just nu — här är prövningarna som matchar din fråga.',
      );
    }
    setPhase('answered');
  };

  const saveKey = () => {
    writeApiKey(keyDraft);
    setApiKey(keyDraft.trim());
    setKeyDraft('');
    setShowingKeyField(false);
  };

  const clearKey = () => {
    writeApiKey('');
    setApiKey('');
    setShowingKeyField(false);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-cream">
      <div className="max-w-screen-md mx-auto w-full px-4 lg:px-8 py-6 lg:py-8 pt-14 lg:pt-8 flex flex-col gap-7 animate-rise-in pb-28 lg:pb-10">
        <div>
          <h1 className="font-hero-xl text-[38px] sm:text-[48px] lg:text-[56px] leading-none text-ink">
            AI-prövning
          </h1>
          <p className="font-display italic text-[17px] text-ink-soft mt-3">
            Skriv vad du vill höja, var du bor och när det ska vara klart.
          </p>
        </div>

        {/* One field, one button. */}
        <div className="bg-surface border-[1.5px] border-line rounded-[28px] p-4 focus-within:border-ink transition-colors">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit(question);
              }
            }}
            rows={3}
            aria-label="Din fråga"
            placeholder="jag bor i Göteborg och vill höja mitt betyg i Matte 2b innan december"
            className="w-full resize-none bg-transparent text-[17px] leading-[1.45] text-ink placeholder:text-ink-faint outline-none"
          />
          <div className="flex items-center justify-between gap-3 pt-2">
            <span className="text-[12.5px] font-bold text-ink-faint">
              {apiKey ? 'Svarar med Claude' : 'Söker i appens data'}
            </span>
            <button
              onClick={() => submit(question)}
              disabled={!question.trim() || phase === 'thinking'}
              className="flex items-center gap-2 bg-ink text-cream text-[14.5px] font-bold pl-5 pr-4 py-3 rounded-[20px] disabled:opacity-30 transition-opacity active:scale-95"
            >
              {phase === 'thinking' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Fråga <ArrowUp size={16} strokeWidth={2.6} />
                </>
              )}
            </button>
          </div>
        </div>

        {phase === 'idle' && (
          <div className="flex flex-col gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                onClick={() => {
                  setQuestion(example);
                  submit(example);
                }}
                className="text-left text-[14.5px] text-ink-soft font-semibold bg-surface border-[1.5px] border-line rounded-[20px] px-[18px] py-3.5 transition-colors hover:border-ink hover:text-ink"
              >
                {example}
              </button>
            ))}
          </div>
        )}

        {phase !== 'idle' && (
          <div ref={answerRef} className="flex flex-col gap-5 scroll-mt-6">
            <p className="font-display italic text-[16px] text-ink-soft">”{asked}”</p>

            {phase === 'thinking' && (
              <div className="flex items-center gap-3 text-ink-soft">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-[15px] font-semibold">Läser prövningarna…</span>
              </div>
            )}

            {answer && (
              <div className="bg-surface border-[1.5px] border-line rounded-[28px] p-[22px]">
                <div className="flex items-center gap-2 text-ink-faint mb-3">
                  <Sparkles size={14} />
                  <span className="text-[11.5px] font-extrabold uppercase tracking-[0.09em]">
                    Svar
                  </span>
                </div>
                <p className="text-[16.5px] leading-[1.55] text-ink whitespace-pre-wrap">
                  {answer}
                </p>
                <p className="text-[12.5px] text-ink-faint mt-4 pt-3.5 border-t-[1.5px] border-sand">
                  Svaret bygger på prövningarna nedan. Datum och avgifter gäller alltid enligt
                  anordnarens egen sida — öppna kortet och följ länken innan du planerar.
                </p>
              </div>
            )}

            {fallbackNote && (
              <p className="text-[14.5px] font-semibold text-ink-soft">{fallbackNote}</p>
            )}

            {phase === 'answered' && matches.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-[11.5px] font-extrabold uppercase tracking-[0.09em] text-ink-faint">
                    {total > matches.length
                      ? `${matches.length} av ${total} prövningar`
                      : `${matches.length} prövningar`}
                  </h2>
                  {total > matches.length && (
                    <button
                      onClick={() => setActiveTab('discover')}
                      className="text-[13px] font-bold text-ink-soft hover:text-ink transition-colors"
                    >
                      Se alla i Upptäck
                    </button>
                  )}
                </div>
                <div className="grid gap-3.5 sm:grid-cols-2">
                  {matches.map((exam) => (
                    <ExamCard key={exam.id} exam={exam} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Kept last and quiet: it is setup, not the errand. */}
        <div className="mt-2 pt-5 border-t-[1.5px] border-sand">
          {showingKeyField ? (
            <div className="flex flex-col gap-3">
              <p className="text-[14px] text-ink-soft leading-[1.5]">
                Appen har ingen server, så nyckeln sparas bara i den här webbläsaren och skickas
                bara till Anthropic. Den följer inte med i dataexporten på profilen.
              </p>
              <input
                type="password"
                value={keyDraft}
                onChange={(e) => setKeyDraft(e.target.value)}
                placeholder="sk-ant-…"
                aria-label="Anthropic API-nyckel"
                className="bg-surface border-[1.5px] border-line rounded-[20px] px-[18px] py-3.5 text-[15px] text-ink outline-none focus:border-ink transition-colors"
              />
              <div className="flex items-center gap-2.5">
                <button
                  onClick={saveKey}
                  disabled={!keyDraft.trim()}
                  className="bg-ink text-cream text-[14px] font-bold px-5 py-3 rounded-[20px] disabled:opacity-30"
                >
                  Spara nyckel
                </button>
                <button
                  onClick={() => setShowingKeyField(false)}
                  className="text-[14px] font-bold text-ink-soft px-3 py-3"
                >
                  Avbryt
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowingKeyField(true)}
              className="flex items-center gap-2 text-[13.5px] font-bold text-ink-soft hover:text-ink transition-colors"
            >
              <Key size={14} />
              {apiKey ? 'Byt eller ta bort din API-nyckel' : 'Koppla din egen API-nyckel'}
            </button>
          )}
          {apiKey && !showingKeyField && (
            <button
              onClick={clearKey}
              className="block mt-2.5 text-[13px] font-bold text-ink-faint hover:text-red-600 transition-colors"
            >
              Ta bort nyckeln ur den här webbläsaren
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
