import { Exam } from '../types';
import { toContext } from './aiSearch';

/**
 * The Anthropic call behind AI-prövning.
 *
 * Two constraints shaped everything here.
 *
 * The app has no server. It is a static build on GitHub Pages, and it always
 * has been: no backend means nowhere to keep a secret, so an API key shipped in
 * the bundle would be a key published to everyone who opens the page. The tab
 * therefore works with no key at all — the local matcher answers, and that is
 * the default experience — and a user who wants the written answer supplies
 * their own key, which is kept in their own browser under its own
 * `localStorage` entry and never leaves it for anywhere but Anthropic. It is
 * deliberately outside the zustand `persist` store, because the profile tab
 * exports that store as a JSON file the user can share.
 *
 * And the model is never the source of a fact. Every date, price and deadline
 * in an answer comes from `data/exams.ts`, handed over as JSON with the
 * provider's own URL attached to each row; the system prompt's single hardest
 * rule is that a field it wasn't given is one it must say it doesn't have.
 * An invented deadline is the one error this app cannot afford — somebody plans
 * a term around it.
 */

/** Named in the product brief. Sonnet is enough for a shortlist of ~12 rows. */
const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 1000;
/** Enough to answer from, small enough to stay cheap on the user's own key. */
export const MAX_CONTEXT_LISTINGS = 12;

const KEY_STORAGE = 'provningar-anthropic-key';

export function readApiKey(): string {
  try {
    return localStorage.getItem(KEY_STORAGE) ?? '';
  } catch {
    // Private mode, or storage disabled. No key is a supported state, so this
    // is not an error — the tab falls back to the local search.
    return '';
  }
}

export function writeApiKey(key: string): void {
  try {
    const trimmed = key.trim();
    if (trimmed) localStorage.setItem(KEY_STORAGE, trimmed);
    else localStorage.removeItem(KEY_STORAGE);
  } catch {
    // Nothing to do: without storage the key simply doesn't persist.
  }
}

export const SYSTEM_PROMPT = [
  'Du är studievägledaren i appen Prövningar. Du hjälper vuxna i Sverige att hitta rätt',
  'betygsprövning och hinna anmäla sig innan sista anmälningsdag.',
  '',
  'Du får en lista med prövningar som JSON. Den listan är hela din kunskap om verkligheten.',
  '',
  'Regler du aldrig bryter mot:',
  '1. Hitta aldrig på ett datum, en avgift, ett krav eller en anordnare. Om ett fält är null',
  '   säger du att anordnaren inte har publicerat det, och hänvisar till kalla_url.',
  '2. Nämn bara prövningar som finns i listan. Finns inget som passar säger du det rakt ut',
  '   och föreslår närmaste alternativ i listan.',
  '3. Skriv alltid ut anordnarens namn och kommun när du nämner en prövning.',
  '4. Är fullbokat true, eller anmalan_oppen_idag false, får du inte skriva att man kan anmäla sig.',
  '5. Datum skriver du som de står i fälten. Räkna inte om veckonummer och gissa inte helgdagar.',
  '',
  'Svara på svenska, i högst 120 ord, i löpande text utan rubriker och punktlistor.',
  'Börja med det som avgör: vad personen kan söka och när det stänger.',
  'Avsluta med en mening om vad nästa steg är. Appen visar korten under ditt svar,',
  'så du behöver inte räkna upp alla — lyft de ett eller två som faktiskt svarar på frågan.',
].join('\n');

export interface AskResult {
  answer: string;
  model: string;
}

/**
 * Ask Claude about a shortlist of listings.
 *
 * Throws on every failure — no key, a rejected key, a network error, a refusal.
 * The caller catches and shows the local search instead, which is why nothing
 * here tries to recover: a written answer is the better experience, and the
 * list is the one that has to always work.
 */
export async function ask(question: string, shortlist: Exam[], apiKey: string): Promise<AskResult> {
  if (!apiKey) throw new Error('Ingen API-nyckel');

  // Loaded on demand so the SDK never lands in the bundle of a user who has no
  // key — which is most of them, and all of them on first paint.
  const { default: Anthropic } = await import('@anthropic-ai/sdk');

  const client = new Anthropic({
    apiKey,
    // The key belongs to the person typing the question and is stored in their
    // own browser; there is no server here to hold it for them.
    dangerouslyAllowBrowser: true,
  });

  const listings = shortlist.slice(0, MAX_CONTEXT_LISTINGS).map(toContext);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          'Prövningar (JSON):',
          JSON.stringify(listings),
          '',
          `Dagens datum: ${new Date().toISOString().slice(0, 10)}`,
          '',
          `Frågan: ${question}`,
        ].join('\n'),
      },
    ],
  });

  if (response.stop_reason === 'refusal') {
    throw new Error('Modellen avböjde att svara');
  }

  const answer = response.content
    .map((block) => (block.type === 'text' ? block.text : ''))
    .join('\n')
    .trim();

  if (!answer) throw new Error('Tomt svar från modellen');
  return { answer, model: response.model };
}
