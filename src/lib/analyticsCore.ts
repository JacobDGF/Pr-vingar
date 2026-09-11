/**
 * Vad mätningen får säga, och hur den sägs — utan att röra vare sig DOM eller
 * nätverk.
 *
 * All logik som går att ha fel om ligger här: vilka händelser som finns, vad de
 * får bära med sig, vilken leverantör som är konfigurerad och exakt vilket
 * anrop det blir hos den. `analytics.ts` är limmet som laddar skriptet och
 * ropar — det innehåller inga beslut, så det som behöver bevisas kan bevisas i
 * ett test i stället för i en webbläsare.
 *
 * Två regler bestämmer formen:
 *
 * - **Ingen fritext lämnar enheten.** Det finns ingen funktion här som tar emot
 *   en sökruta eller en fråga till AI-prövning. Händelserna bär kommun, ämne,
 *   kurskod och antal — värden som redan står i appens egen data — och inget
 *   annat. Det är inte en policy någon ska minnas, det är vad API:et tillåter.
 * - **Namnen är en sluten lista.** `EVENT_NAMES` är både typen och löftet i
 *   samtyckesrutan: den som läser listan i panelen ser samma rader som koden
 *   kan skicka.
 */

export const EVENT_NAMES = [
  'Prövning öppnad',
  'Till anmälan',
  'Prövning sparad',
  'Bevakning skapad',
  'Kalenderfil hämtad',
  'AI-fråga ställd',
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

/** Värden en händelse får bära: aldrig fritext, alltid något datan själv säger. */
export type PropValue = string | number | boolean;
export type EventProps = Record<string, PropValue>;

export type TrackCall =
  | { kind: 'visit' }
  | { kind: 'pageview'; path: string; title: string }
  | { kind: 'event'; name: EventName; props?: EventProps };

export const ANALYTICS_PROVIDERS = ['endpoint', 'plausible', 'umami'] as const;
export type AnalyticsProvider = (typeof ANALYTICS_PROVIDERS)[number];

export interface AnalyticsConfig {
  provider: AnalyticsProvider;
  /**
   * Skriptets URL hos leverantören — eller, för `endpoint`, adressen till vår
   * egen räknare (`collector/worker.js`). Alltid https.
   */
  src: string;
  /**
   * Domännamnet (Plausible), webbplats-id:t (Umami) eller sajtens namn i vår
   * egen räknare, som kan delas av flera sajter. Bara de två första kräver
   * den; `endpoint` klarar sig med ett standardnamn.
   */
  site: string;
}

/** Sajtnamnet vår egen räknare bokför under när inget annat är satt. */
export const DEFAULT_SITE = 'provningar';

interface RawEnv {
  VITE_ANALYTICS_PROVIDER?: string;
  VITE_ANALYTICS_SRC?: string;
  VITE_ANALYTICS_SITE?: string;
}

/**
 * Konfigurationen, eller `null` när bygget inte har någon.
 *
 * Ett statiskt bygge kan inte hålla en hemlighet, men det behöver inte heller
 * göra det: både Plausible och Umami identifierar sajten med ett publikt
 * domännamn respektive id. Saknas variablerna — vilket är hur appen byggs tills
 * någon sätter dem — är mätningen avstängd i hela kedjan, och samtyckesrutan
 * säger det i stället för att lova något som inte händer.
 *
 * En halv konfiguration är ingen konfiguration: ett skript utan sajt-id
 * rapporterar in i tomma intet, och en `http`-URL vore en nedgradering vi
 * aldrig ska göra åt användaren.
 */
export function readAnalyticsConfig(env: RawEnv): AnalyticsConfig | null {
  const provider = (env.VITE_ANALYTICS_PROVIDER ?? '').trim().toLowerCase();
  const src = (env.VITE_ANALYTICS_SRC ?? '').trim();
  const named = (env.VITE_ANALYTICS_SITE ?? '').trim();
  if (!isProvider(provider) || !src) return null;

  // Plausible och Umami vet inte vilken sajt datan hör till utan sitt id. Vår
  // egen räknare har bara en sajt att bokföra under tills någon säger annat.
  const site = named || (provider === 'endpoint' ? DEFAULT_SITE : '');
  if (!site) return null;

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return null;
  }
  // `http` accepteras bara mot den egna maskinen, där webbläsaren ändå räknar
  // sidan som säker. Det är inte en lucka utan hela sättet att testa räknaren
  // innan den finns på riktigt: `wrangler dev` svarar på http://localhost:8787.
  const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && local)) return null;

  return { provider, src: url.toString(), site };
}

function isProvider(value: string): value is AnalyticsProvider {
  return (ANALYTICS_PROVIDERS as readonly string[]).includes(value);
}

/**
 * Attributen skripttaggen ska bära.
 *
 * Båda leverantörerna stänger av sin egen automatiska sidräkning här. Appen är
 * en enda sida med sex flikar: den automatiska räkningen skulle se ett besök
 * och sedan ingenting mer, medan flikbytena — som är det användaren faktiskt
 * gör — aldrig syntes. Därför skickar `analytics.ts` varje flik som en egen
 * sidvisning, och leverantörens automatik måste vara ur vägen för att de inte
 * ska dubbelräknas.
 */
export function scriptAttributes(config: AnalyticsConfig): Record<string, string> | null {
  if (config.provider === 'endpoint') return null;
  return config.provider === 'plausible'
    ? { src: config.src, defer: '', 'data-domain': config.site }
    : { src: config.src, defer: '', 'data-website-id': config.site, 'data-auto-track': 'false' };
}

/**
 * Namnet på det globala objekt leverantörens skript lägger på `window`, eller
 * `null` för vår egen räknare, som inte laddar något skript alls: appen postar
 * själv, med `fetch`.
 */
export function providerGlobal(provider: AnalyticsProvider): 'plausible' | 'umami' | null {
  return provider === 'endpoint' ? null : provider;
}

/**
 * Händelsen som räknaren i `collector/worker.js` vill ha den.
 *
 * Med flit tunn och tråkig: `v` så formatet kan ändras utan att gamla bygg
 * börjar räknas fel, och sedan bara sorten, namnet och de sanerade
 * egenskaperna. Ingen tidsstämpel (räknaren sätter dygnet själv, i svensk tid),
 * inget id, ingenting om webbläsaren.
 */
export function endpointPayload(config: AnalyticsConfig, call: TrackCall): string {
  const body =
    call.kind === 'visit'
      ? { v: 1, site: config.site, k: 'visit' }
      : call.kind === 'pageview'
        ? { v: 1, site: config.site, k: 'pageview', n: call.path }
        : { v: 1, site: config.site, k: 'event', n: call.name, p: call.props };
  return JSON.stringify(body);
}

/**
 * Anropet, som leverantörens eget API vill ha det.
 *
 * Plausible tar en sidvisning som en händelse vid namn `pageview` med en
 * absolut URL i `u` (skriptvarianten `script.manual.js`), och en egen händelse
 * som namn + `props`. Umami tar ett objekt för sidvisningen och namn + data för
 * händelsen. Skillnaden bor här, en gång, i stället för i varje anropsställe.
 */
export function providerArgs(config: AnalyticsConfig, call: TrackCall, origin: string): unknown[] {
  // Besöket är vår egen räknares begrepp. Plausible och Umami räknar besök
  // själva, ur sina sidvisningar, så det skickas aldrig dit.
  if (call.kind === 'visit') return [];

  if (config.provider === 'plausible') {
    return call.kind === 'pageview'
      ? ['pageview', { u: origin + call.path }]
      : [call.name, call.props ? { props: call.props } : {}];
  }
  return call.kind === 'pageview'
    ? [{ url: call.path, title: call.title }]
    : [call.name, call.props ?? {}];
}

/**
 * Rensar ett händelseobjekt: bara de tre typer en dashboard kan visa, inga
 * tomma strängar, inget längre än en etikett och högst sex fält.
 *
 * Anropsställena skickar redan bara värden ur datan, men det här är bältet till
 * hängslet — den dag någon lägger till ett fält på fel sida om den här
 * funktionen ska det kapas här, inte upptäckas i en rapport.
 */
export function sanitizeProps(props?: Record<string, unknown>): EventProps | undefined {
  if (!props) return undefined;
  const clean: EventProps = {};
  for (const [key, value] of Object.entries(props)) {
    if (Object.keys(clean).length >= 6) break;
    if (typeof value === 'number' && Number.isFinite(value)) clean[key] = value;
    else if (typeof value === 'boolean') clean[key] = value;
    else if (typeof value === 'string' && value.trim()) clean[key] = value.trim().slice(0, 48);
  }
  return Object.keys(clean).length ? clean : undefined;
}
