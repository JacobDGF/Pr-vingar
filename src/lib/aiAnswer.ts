import { Exam } from '../types';
import { AskResult } from './askProvningar';

/**
 * The optional half of AI-prövning: the same question, answered by Claude.
 *
 * ## Why this goes through an endpoint and not the Anthropic SDK
 *
 * The app is a static site on GitHub Pages. It has no server, and everything in
 * the bundle is public — `view-source` public. An Anthropic API key put in here,
 * whether typed into a field or baked in at build time as
 * `VITE_ANTHROPIC_API_KEY`, is a key published on the internet, and it would be
 * scraped and spent within the day. There is no version of "call the Messages
 * API from the browser" that does not do that, which is why the SDK's own
 * browser escape hatch is named `dangerouslyAllowBrowser`.
 *
 * So this module builds the Messages API request — the real one, the shape the
 * proxy forwards byte for byte — and POSTs it to whatever endpoint
 * `VITE_AI_ENDPOINT` names. That endpoint holds the key. Until one is
 * configured, `isConfigured()` is false, nothing is sent anywhere, and the tab
 * runs entirely on `askProvningar`, which needs no network at all.
 *
 * ## What the model is allowed to say
 *
 * The dataset rows for the question go in as context and the system prompt
 * forbids inventing anything that isn't in them. That is a guardrail, not a
 * guarantee — which is the second reason the local answer is the default rather
 * than the fallback. Every listing under the answer is a real row either way,
 * with the provider's own link on it, so the dates and fees a user acts on come
 * from the dataset even when the prose around them came from a model.
 */
export const AI_MODEL = 'claude-sonnet-4-6';
export const AI_MAX_TOKENS = 1000;

const ENDPOINT: string = import.meta.env.VITE_AI_ENDPOINT ?? '';

export function isConfigured(): boolean {
  return ENDPOINT.length > 0;
}

const SYSTEM_PROMPT = [
  'Du är studievägledare i appen Prövningar. Du svarar korta, konkreta svar på svenska',
  'om betygsprövningar, utifrån de listningar som följer i användarmeddelandet.',
  '',
  'Regler du aldrig bryter mot:',
  '- Hitta aldrig på datum, avgifter, skolor eller kurser. Om ett fält saknas i listningarna',
  '  nedan, säg att anordnaren inte publicerat det och hänvisa till anordnarens egen sida.',
  '- Räkna aldrig fram ett datum själv. Skriv bara datum som står ordagrant i listningarna.',
  '- Nämn högst tre listningar, och nämn dem vid skola och kurs så att användaren hittar dem',
  '  i listan under svaret.',
  '- Max fem meningar. Ingen inledande artighetsfras.',
].join('\n');

/**
 * The dataset rows, as compact lines rather than JSON.
 *
 * One line per listing, only the fields an answer can legitimately use. Sending
 * the whole `Exam` object would spend most of the context on study tips and
 * component descriptions that no answer needs, and would hand the model more
 * numbers to accidentally mix up.
 */
export function buildContext(exams: Exam[]): string {
  return exams
    .slice(0, 25)
    .map((e) => {
      const p = e.nextPeriod;
      const dates = p.confirmed
        ? [
            p.applicationStart && `anmälan öppnar ${p.applicationStart}`,
            p.applicationEnd && `sista anmälningsdag ${p.applicationEnd}`,
            p.examWindowStart &&
              `provdatum ${p.examWindowStart}${
                p.examWindowEnd && p.examWindowEnd !== p.examWindowStart
                  ? `–${p.examWindowEnd}`
                  : ''
              }`,
            p.full && 'FULLBOKAT enligt anordnaren',
          ]
            .filter(Boolean)
            .join('; ')
        : 'anordnaren har inte publicerat några datum';
      return [
        `- ${e.course} (${e.courseCode}) hos ${e.schoolName}, ${e.city}`,
        `avgift ${e.price} kr`,
        dates,
        `källa ${e.infoUrl}`,
      ].join(' | ');
    })
    .join('\n');
}

/** The Messages API request body, exactly as the endpoint forwards it. */
export function buildRequest(question: string, exams: Exam[]) {
  return {
    model: AI_MODEL,
    max_tokens: AI_MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user' as const,
        content: [
          'Listningar ur databasen som matchar frågan:',
          buildContext(exams),
          '',
          `Frågan: ${question}`,
        ].join('\n'),
      },
    ],
  };
}

/** The text blocks of a Messages API response, joined. Anything else is dropped. */
export function readAnswer(payload: unknown): string {
  const content = (payload as { content?: unknown })?.content;
  if (!Array.isArray(content)) throw new Error('Oväntat svar från AI-tjänsten.');
  const text = content
    .filter((block): block is { type: 'text'; text: string } => {
      const b = block as { type?: unknown; text?: unknown };
      return b.type === 'text' && typeof b.text === 'string';
    })
    .map((block) => block.text)
    .join('\n')
    .trim();
  if (!text) throw new Error('AI-tjänsten svarade utan text.');
  return text;
}

/**
 * Asks the configured endpoint, on the listings the local answer already found.
 *
 * Rejects rather than returning a half-answer: the caller's `catch` is the
 * fallback the whole feature is designed around, so a failure here has to be
 * loud enough to reach it.
 */
export async function askRemote(
  question: string,
  local: AskResult,
  signal?: AbortSignal,
): Promise<string> {
  if (!isConfigured()) throw new Error('Ingen AI-tjänst konfigurerad.');
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildRequest(question, local.exams)),
    signal,
  });
  if (!response.ok) throw new Error(`AI-tjänsten svarade ${response.status}.`);
  return readAnswer(await response.json());
}
