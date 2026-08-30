import { useState } from 'react';
import { Sparkles, HelpCircle, Loader2, ArrowUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ExamCard } from '../components/ExamCard';
import { Exam } from '../types';
import { answerAsk, describeAsk, hasConstraints } from '../lib/askProvningar';
import { askClaude, isAiConfigured } from '../lib/aiProvning';

/**
 * AI-prövning: skriv meningen, få prövningarna.
 *
 * Sökrutan i Upptäck tar ett ord. Det folk kommer hit med är en mening — "jag
 * bor i Göteborg och vill höja mitt betyg i Matte 2b innan december" — och den
 * bär fyra villkor som annars ska matas in i fyra olika kontroller, av någon
 * som först måste lista ut att kontrollerna finns.
 *
 * Sidan har ett syfte och en primärknapp. Inga bubblor, ingen skrivande-punkt,
 * ingen avatar: frågan står som en rubrik, svaret som ett stycke, och under det
 * ligger vanliga listningskort — samma kort som i resten av appen, med samma
 * färg och samma väg vidare in i anmälan. En chattbubbla hade lagt ett lager
 * mellan användaren och den enda knapp som betyder något.
 *
 * Svarsstycket kommer från Claude när sajten har en endpoint konfigurerad
 * (`VITE_AI_ENDPOINT`), och annars — och när anropet faller — från appens egen
 * läsning av meningen. Korten kommer alltid från datan. Se
 * [`lib/aiProvning.ts`](../lib/aiProvning.ts) för varför nyckeln inte kan bo i
 * ett statiskt bygge.
 */

interface Turn {
  question: string;
  /** The prose above the cards, from Claude or from our own reading. */
  answer: string;
  /** True when `answer` came from the model rather than from the dataset read. */
  fromModel: boolean;
  matches: Exam[];
  widened: boolean;
  understood: boolean;
}

const EXAMPLES = [
  'Jag bor i Göteborg och vill höja mitt betyg i Matte 2b innan december',
  'Var kan jag pröva Engelska 6 i Skåne?',
  'Naturkunskap 1b någonstans i Stockholm, helst snart',
];

/** What the app itself can say about a reading, when no model is in the loop. */
function localAnswer(result: ReturnType<typeof answerAsk>, understood: boolean): string {
  if (!understood) {
    return (
      'Jag hittade inget ämne, ingen kurs och ingen ort i frågan. Skriv gärna med ' +
      'kursen och var du bor, till exempel "Matematik 2b i Göteborg".'
    );
  }
  const reading = describeAsk(result.ask);
  const n = result.matches.length;
  if (n === 0) {
    return `Jag läste frågan som ${reading}, och hittade ingen prövning som stämmer. Prova en angränsande kommun eller ett bredare ämne.`;
  }
  const head = `Jag läste frågan som ${reading}. ${n === 1 ? '1 prövning' : `${n} prövningar`} stämmer${n > 8 ? ' — de närmaste deadlinesen först' : ''}.`;
  return result.widened
    ? `${head} Ingen av dem hinner före din gräns eller är öppen för anmälan just nu, så här är hela träfflistan i stället.`
    : head;
}

export function AiProvning() {
  const { exams, setShowingFaq } = useStore();
  const [draft, setDraft] = useState('');
  const [thread, setThread] = useState<Turn[]>([]);
  const [pending, setPending] = useState(false);

  const ask = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || pending) return;

    const result = answerAsk(trimmed, exams);
    const understood = hasConstraints(result.ask);
    const turn: Turn = {
      question: trimmed,
      answer: localAnswer(result, understood),
      fromModel: false,
      matches: result.matches,
      widened: result.widened,
      understood,
    };

    setDraft('');
    setThread((t) => [...t, turn]);

    if (!isAiConfigured() || !understood || result.matches.length === 0) return;

    // The dataset answer is already on screen. The model only ever replaces the
    // paragraph above the cards, so a failure here costs the user nothing.
    setPending(true);
    try {
      const answer = await askClaude(trimmed, result.matches);
      setThread((t) => t.map((x) => (x === turn ? { ...x, answer, fromModel: true } : x)));
    } catch {
      // Keep the dataset answer, which is already correct.
    } finally {
      setPending(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    void ask(draft);
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
            Skriv med egna ord. Svaret bygger på appens {exams.length} kontrollerade prövningar —
            aldrig på ett gissat datum.
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="focus-ring-host flex items-end gap-2 bg-lapis-tint border-2 border-lapis-ink rounded-[26px] pl-5 pr-2 py-2">
            {/* Pinned to the first line rather than to the field's baseline:
                the field is two rows tall, and an icon that floats down beside
                the second row reads as decoration instead of as a label. */}
            <Sparkles
              size={19}
              strokeWidth={2.2}
              className="text-lapis-ink flex-shrink-0 self-start mt-3.5"
            />
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void ask(draft);
                }
              }}
              rows={2}
              placeholder="T.ex. Matte 2b i Göteborg"
              aria-label="Din fråga"
              className="flex-1 min-w-0 resize-none bg-transparent border-0 outline-none text-[16.5px] font-semibold text-lapis-ink placeholder-lapis-ink/45 py-2.5"
            />
            <button
              type="submit"
              disabled={!draft.trim() || pending}
              aria-label="Fråga"
              className="w-11 h-11 mb-0.5 rounded-[17px] bg-lapis-ink text-white flex items-center justify-center flex-shrink-0 transition-opacity disabled:opacity-30 active:scale-95"
            >
              {pending ? (
                <Loader2 size={19} className="animate-spin" />
              ) : (
                <ArrowUp size={20} strokeWidth={2.4} />
              )}
            </button>
          </div>

          {thread.length === 0 && (
            <div className="flex flex-col gap-2 pt-1">
              <p className="text-[11.5px] font-bold uppercase tracking-[.09em] text-ink-faint px-1">
                Prova att fråga
              </p>
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => void ask(example)}
                  className="text-left text-[14.5px] leading-snug text-lapis-ink underline decoration-lapis-ink/25 underline-offset-4 px-1 active:opacity-60"
                >
                  {example}
                </button>
              ))}
            </div>
          )}
        </form>

        {thread.map((turn, i) => (
          <section key={i} className="flex flex-col gap-4">
            <div className="border-t border-line pt-5">
              <p className="font-display text-[19px] sm:text-[22px] leading-snug text-ink">
                {turn.question}
              </p>
              <p className="text-[15px] leading-relaxed text-ink-soft mt-2.5">{turn.answer}</p>
              {turn.fromModel && (
                <p className="text-[12px] text-ink-faint mt-2">
                  Svaret är formulerat av Claude ur listningarna nedan. Datum och avgifter gäller
                  bara som de står hos anordnaren.
                </p>
              )}
            </div>

            {turn.matches.length > 0 && (
              <div className="grid gap-3.5 sm:grid-cols-2">
                {turn.matches.slice(0, 12).map((exam) => (
                  <ExamCard key={exam.id} exam={exam} />
                ))}
              </div>
            )}

            {turn.matches.length > 12 && (
              <p className="text-[13.5px] text-ink-faint">
                Visar 12 av {turn.matches.length} träffar. Smalna av frågan med en kurs eller en
                kommun.
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
