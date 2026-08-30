import { Exam } from '../types';

/**
 * The optional half of AI-prövning: letting a model phrase the answer.
 *
 * The app is a static site with no server, so it cannot hold an API key —
 * anything shipped in the bundle is public, and an Anthropic key in a public
 * bundle is somebody else's bill. The request built here is therefore the
 * Messages API's own shape, sent to whatever endpoint `VITE_AI_ENDPOINT` names:
 * a proxy the site's owner runs, which adds the key and forwards to
 * `https://api.anthropic.com/v1/messages`. With the variable unset — which is
 * how the published site is built — nothing is called and the tab answers from
 * the dataset alone.
 *
 * Two rules hold whether or not a model is in the loop, and they are the reason
 * the model is given a shortlist rather than a question:
 *
 * - Every fact it may state is in the JSON it is handed. It is told, in as many
 *   words, never to guess a datum or an avgift, and to send the user to the
 *   provider's own page for anything that isn't there.
 * - The listings under the answer come from `answerAsk`, not from the model.
 *   A sentence can be wrong; a card links to the anmälan it names.
 */

const ENDPOINT: string | undefined = import.meta.env.VITE_AI_ENDPOINT;

/** As specified for this app: Sonnet, and a short answer. */
const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 1000;

/** How many listings are worth putting in front of the model. */
const SHORTLIST = 12;

const SYSTEM = [
  'Du är studievägledare i appen Prövningar, som samlar Sveriges betygsprövningar.',
  'Du får en fråga från en elev och en lista med prövningar ur appens egen databas.',
  '',
  'Regler:',
  '- Använd bara uppgifter som står i listan. Hitta aldrig på datum, avgifter,',
  '  kurskoder eller skolor.',
  '- Om något inte står i listan: säg att det inte står, och hänvisa till',
  '  anordnarens egen sida (fältet kalla_url).',
  '- En prövning där "datum_bekraftat" är false har inga publicerade datum.',
  '  Påstå aldrig när den går att söka — länka vidare i stället.',
  '- Svara på svenska, i högst fem meningar, utan rubriker och punktlistor.',
  '- Eleven ser korten med prövningarna under ditt svar. Räkna inte upp dem —',
  '  säg vad som skiljer dem åt och vilken deadline som är närmast.',
].join('\n');

/** The listing as the model is allowed to see it: facts, and where they came from. */
function forModel(exam: Exam) {
  const p = exam.nextPeriod;
  return {
    id: exam.id,
    skola: exam.schoolName,
    kommun: exam.city,
    lan: exam.region,
    kurs: exam.course,
    kurskod: exam.courseCode,
    avgift_sek: exam.price,
    avgift_villkor: exam.priceNote ?? null,
    datum_bekraftat: p.confirmed,
    anmalan_oppnar: p.applicationStart ?? null,
    sista_anmalan: p.applicationEnd ?? null,
    provperiod_start: p.examWindowStart ?? null,
    provperiod_slut: p.examWindowEnd ?? null,
    fullbokat: p.full === true,
    period: p.label,
    kalla_url: exam.infoUrl,
    anmalan_url: exam.registrationUrl,
  };
}

export function isAiConfigured(): boolean {
  return typeof ENDPOINT === 'string' && ENDPOINT.trim() !== '';
}

/**
 * Ask the model to phrase an answer over `shortlist`.
 *
 * Throws for every failure there is — unconfigured, offline, non-2xx, a body
 * that isn't a Messages response. The caller has a complete answer without it,
 * so there is nothing to degrade gracefully into here: the throw *is* the
 * fallback.
 */
export async function askClaude(
  question: string,
  shortlist: Exam[],
  signal?: AbortSignal,
): Promise<string> {
  if (!ENDPOINT) throw new Error('Ingen AI-endpoint konfigurerad');

  const context = JSON.stringify(shortlist.slice(0, SHORTLIST).map(forModel));
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM,
      messages: [
        {
          role: 'user',
          content: `Elevens fråga: ${question}\n\nPrövningar ur databasen:\n${context}`,
        },
      ],
    }),
  });

  if (!response.ok) throw new Error(`AI-tjänsten svarade ${response.status}`);

  const body: unknown = await response.json();
  const blocks = (body as { content?: unknown }).content;
  if (!Array.isArray(blocks)) throw new Error('Oväntat svar från AI-tjänsten');

  const text = blocks
    .filter(
      (block): block is { type: 'text'; text: string } =>
        typeof block === 'object' &&
        block !== null &&
        (block as { type?: unknown }).type === 'text' &&
        typeof (block as { text?: unknown }).text === 'string',
    )
    .map((block) => block.text)
    .join('\n')
    .trim();

  if (!text) throw new Error('Tomt svar från AI-tjänsten');
  return text;
}
