/**
 * Limmet mellan samtycket och leverantörens skript.
 *
 * Ingenting här är ett beslut — vad som får mätas och hur anropet ser ut bor i
 * [`analyticsCore.ts`](analyticsCore.ts). Den här filen gör tre saker: laddar
 * skriptet när (och bara när) någon sagt ja, plockar bort det igen när någon
 * ångrar sig, och håller en kort kö för de sekunder skriptet är på väg ned.
 *
 * Ordningen är hela poängen. Skripttaggen skapas först i `ensureScript`, som
 * bara nås av ett `granted` samtycke: säger användaren nej har leverantörens
 * kod aldrig funnits på sidan, och då finns inget anrop att lita på att den
 * låter bli att göra.
 */

import { Exam, TabId } from '../types';
import { hasAnalyticsConsent, subscribeConsent } from './consent';
import {
  AnalyticsConfig,
  EventName,
  EventProps,
  TrackCall,
  providerArgs,
  providerGlobal,
  readAnalyticsConfig,
  sanitizeProps,
  scriptAttributes,
} from './analyticsCore';

const CONFIG: AnalyticsConfig | null = readAnalyticsConfig(import.meta.env);
const SCRIPT_ID = 'provningar-analytics';

/** Så många anrop sparas medan skriptet laddar. Fler än så är inte ett besök. */
const QUEUE_LIMIT = 20;

let started = false;
let queue: TrackCall[] = [];
/** Senaste fliken, så det första ja:t räknas som en sidvisning i stället för tystnad. */
let currentView: TrackCall | null = null;

export function isAnalyticsConfigured(): boolean {
  return CONFIG !== null;
}

/** Leverantörens namn, för samtyckespanelen — den ska kunna säga vem datan går till. */
export function analyticsProviderName(): string | null {
  if (!CONFIG) return null;
  return CONFIG.provider === 'plausible' ? 'Plausible Analytics' : 'Umami';
}

/** Värden hos leverantören, som panelen visar under "vart datan går". */
export function analyticsHost(): string | null {
  if (!CONFIG) return null;
  try {
    return new URL(CONFIG.src).host;
  } catch {
    return null;
  }
}

/**
 * Kopplar mätningen till samtycket. Anropas en gång, innan React monterar.
 *
 * Utan konfiguration gör den ingenting alls — och det är det normala läget för
 * det publicerade bygget tills någon sätter miljövariablerna. Rutan frågar
 * ändå, eftersom svaret ska gälla nästa deploy också.
 */
export function startAnalytics(): void {
  if (started) return;
  started = true;
  applyConsent();
  subscribeConsent(applyConsent);
}

function applyConsent(): void {
  if (!CONFIG) return;
  if (hasAnalyticsConsent()) {
    ensureScript();
    const pending = queue;
    queue = [];
    // Den flik användaren står på räknas när ja:t kommer — annars hade ett
    // samtycke mitt i besöket gett händelser utan en enda sidvisning. Men bara
    // om kön inte redan bär den: `applyConsent` körs två gånger (en gång på
    // valet, en gång när skriptet landat), och utan den här kontrollen blev
    // första sidvisningen två.
    if (currentView && !pending.some((call) => call.kind === 'pageview')) send(currentView);
    for (const call of pending) send(call);
  } else {
    removeScript();
    queue = [];
  }
}

function ensureScript(): void {
  if (!CONFIG || typeof document === 'undefined') return;
  if (document.getElementById(SCRIPT_ID)) return;

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  for (const [name, value] of Object.entries(scriptAttributes(CONFIG))) {
    if (name === 'src') script.src = value;
    else if (name === 'defer') script.defer = true;
    else script.setAttribute(name, value);
  }
  script.addEventListener('load', applyConsent);
  document.head.appendChild(script);
}

/**
 * Tar bort skriptet och det spår leverantören lämnat.
 *
 * Ett borttaget skript slutar inte av sig självt att finnas i minnet — den
 * globala funktionen ligger kvar och skulle ta emot anrop — så den städas bort
 * med. Umami håller dessutom en sessionsnyckel i `localStorage`; den hör till
 * mätningen och ska försvinna med den, annars ligger den kvar som ett kex efter
 * ett nej.
 */
function removeScript(): void {
  if (typeof document === 'undefined') return;
  document.getElementById(SCRIPT_ID)?.remove();

  const globals = window as unknown as Record<string, unknown>;
  delete globals.plausible;
  delete globals.umami;

  try {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith('umami.')) window.localStorage.removeItem(key);
    }
  } catch {
    // Inget lager att städa i. Då finns inget spår heller.
  }
}

function send(call: TrackCall): void {
  if (!CONFIG || !hasAnalyticsConsent() || typeof window === 'undefined') return;

  const globals = window as unknown as Record<string, unknown>;
  const fn = globals[providerGlobal(CONFIG.provider)];
  if (typeof fn !== 'function') {
    // Skriptet är på väg ned. Kön är kort med flit: det som inte hunnit fram
    // när någon lämnar sidan är inte värt att hålla kvar.
    if (queue.length < QUEUE_LIMIT) queue.push(call);
    return;
  }
  try {
    (fn as (...args: unknown[]) => void)(...providerArgs(CONFIG, call, window.location.origin));
  } catch {
    // En blockerad eller havererad mätning får aldrig märkas i appen.
  }
}

function event(name: EventName, props?: Record<string, unknown>): void {
  const clean: EventProps | undefined = sanitizeProps(props);
  send({ kind: 'event', name, props: clean });
}

/**
 * Det appen mäter, som sex funktioner.
 *
 * Ingen av dem tar emot fritext. Den som vill veta vad som skickas läser den
 * här listan — samma rader står i samtyckespanelen, på svenska.
 */
export const track = {
  /** Flikbyte som sidvisning: `/upptack`, `/ai` … Appen har inga andra sidor. */
  tabView(tab: TabId, title: string): void {
    const call: TrackCall = { kind: 'pageview', path: `/${tab}`, title };
    currentView = call;
    send(call);
  },

  examOpened(exam: Exam): void {
    event('Prövning öppnad', { kommun: exam.city, ämne: exam.subject, kurskod: exam.courseCode });
  },

  registrationClicked(exam: Exam, open: boolean): void {
    event('Till anmälan', { kommun: exam.city, kurskod: exam.courseCode, öppen: open });
  },

  examSaved(exam: Exam): void {
    event('Prövning sparad', { kommun: exam.city, ämne: exam.subject });
  },

  watchCreated(subject: string, city: string): void {
    event('Bevakning skapad', { ämne: subject, kommun: city || 'hela landet' });
  },

  calendarExported(exam: Exam): void {
    event('Kalenderfil hämtad', { kommun: exam.city, kurskod: exam.courseCode });
  },

  /** Bara utfallet — aldrig frågan användaren skrev. */
  aiAsked(result: { hits: number; widened: boolean; understood: boolean }): void {
    event('AI-fråga ställd', {
      träffar: result.hits,
      vidgad: result.widened,
      tolkad: result.understood,
    });
  },
};
