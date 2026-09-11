/**
 * Limmet mellan samtycket och räknaren.
 *
 * Ingenting här är ett beslut — vad som får mätas och hur anropet ser ut bor i
 * [`analyticsCore.ts`](analyticsCore.ts). Den här filen gör tre saker: ser till
 * att mätningen finns när (och bara när) någon sagt ja, plockar bort den igen
 * när någon ångrar sig, och håller en kort kö för de sekunder ett externt
 * skript är på väg ned.
 *
 * Ordningen är hela poängen. Skripttaggen skapas först i `ensureScript`, och
 * `post` skickar först efter samma kontroll: säger användaren nej har
 * leverantörens kod aldrig funnits på sidan och inget anrop har gjorts.
 *
 * Två sorters mätning ryms i samma flöde:
 *
 * - **`endpoint`** — appens egen räknare i [`collector/`](../../collector),
 *   som appen postar till själv. Inget skript laddas, ingen tredje part ser
 *   besökaren, och summorna hamnar som en fil i projektets GitHub-repo.
 * - **`plausible` / `umami`** — en vanlig leverantör med egen instrumentpanel,
 *   för den som hellre vill ha det.
 */

import { Exam, TabId } from '../types';
import { hasAnalyticsConsent, subscribeConsent } from './consent';
import {
  AnalyticsConfig,
  EventName,
  EventProps,
  TrackCall,
  endpointPayload,
  providerArgs,
  providerGlobal,
  readAnalyticsConfig,
  sanitizeProps,
  scriptAttributes,
} from './analyticsCore';

const CONFIG: AnalyticsConfig | null = readAnalyticsConfig(import.meta.env);
const SCRIPT_ID = 'provningar-analytics';

/** Nyckeln som gör ett besök till ett besök: en flikssession, inget mer. */
const VISIT_KEY = 'provningar-visit';

/** Så många anrop sparas medan ett externt skript laddar. Fler än så är inte ett besök. */
const QUEUE_LIMIT = 20;

let started = false;
let queue: TrackCall[] = [];
/** Senaste fliken, så det första ja:t räknas som en sidvisning i stället för tystnad. */
let currentView: TrackCall | null = null;
/** Ett besök som väntar på ett svar i rutan. */
let pendingVisit = false;

export function isAnalyticsConfigured(): boolean {
  return CONFIG !== null;
}

/** Vem mätningen görs av, för samtyckespanelen — den ska kunna berätta det. */
export function analyticsProviderName(): string | null {
  if (!CONFIG) return null;
  if (CONFIG.provider === 'endpoint') return 'Prövningars egen räknare';
  return CONFIG.provider === 'plausible' ? 'Plausible Analytics' : 'Umami';
}

/** Värden mätningen går till, som panelen visar. */
export function analyticsHost(): string | null {
  if (!CONFIG) return null;
  try {
    return new URL(CONFIG.src).host;
  } catch {
    return null;
  }
}

/** True när statistiken samlas in av appen själv och hamnar i projektets repo. */
export function isSelfHostedAnalytics(): boolean {
  return CONFIG?.provider === 'endpoint';
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

    if (pendingVisit) {
      pendingVisit = false;
      send({ kind: 'visit' });
      markVisitCounted();
    }
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

/* --------------------------------------------------------------- transport */

function ensureScript(): void {
  if (!CONFIG || typeof document === 'undefined') return;
  const attributes = scriptAttributes(CONFIG);
  // Vår egen räknare har inget skript att ladda: appen postar själv.
  if (!attributes) return;
  if (document.getElementById(SCRIPT_ID)) return;

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  for (const [name, value] of Object.entries(attributes)) {
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
  if (CONFIG.provider === 'endpoint') {
    post(CONFIG, call);
    return;
  }

  const globals = window as unknown as Record<string, unknown>;
  const name = providerGlobal(CONFIG.provider);
  const args = providerArgs(CONFIG, call, window.location.origin);
  // Tomt betyder att leverantören inte har något begrepp för anropet — besöket
  // är vår egen räknares, och Plausible och Umami räknar det själva.
  if (!name || !args.length) return;

  const fn = globals[name];
  if (typeof fn !== 'function') {
    // Skriptet är på väg ned. Kön är kort med flit: det som inte hunnit fram
    // när någon lämnar sidan är inte värt att hålla kvar.
    if (queue.length < QUEUE_LIMIT) queue.push(call);
    return;
  }
  try {
    (fn as (...args: unknown[]) => void)(...args);
  } catch {
    // En blockerad eller havererad mätning får aldrig märkas i appen.
  }
}

/**
 * Posten till vår egen räknare.
 *
 * `text/plain` är inte slarv: det är den enda innehållstypen som slipper en
 * preflight, så varje händelse blir ett anrop i stället för två — och räknaren
 * läser ändå JSON ur kroppen. `keepalive` gör att det sista anropet hinner iväg
 * när någon klickar sig vidare till anordnarens anmälan, vilket är just den
 * händelse som betyder mest.
 */
function post(config: AnalyticsConfig, call: TrackCall): void {
  try {
    void fetch(config.src, {
      method: 'POST',
      body: endpointPayload(config, call),
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      keepalive: true,
      mode: 'cors',
      credentials: 'omit',
      // Referrer-Policy no-referrer: räknaren behöver inte veta vilken sida
      // anropet kom från, och det vi inte skickar kan ingen spara.
      referrerPolicy: 'no-referrer',
    }).catch(() => {
      // Räknaren nere, blockerad eller offline. Appen märker ingenting.
    });
  } catch {
    // Samma sak, för webbläsare som kastar i stället för att avvisa.
  }
}

/* ------------------------------------------------------------------ besök */

function visitCounted(): boolean {
  try {
    return window.sessionStorage.getItem(VISIT_KEY) === '1';
  } catch {
    return false;
  }
}

function markVisitCounted(): void {
  try {
    window.sessionStorage.setItem(VISIT_KEY, '1');
  } catch {
    // Utan lager räknas besöket om vid nästa sidladdning. Ett besök för mycket
    // är ett bättre fel än ett spår som överlever sessionen.
  }
}

/* ------------------------------------------------------------------ track */

function event(name: EventName, props?: Record<string, unknown>): void {
  const clean: EventProps | undefined = sanitizeProps(props);
  send({ kind: 'event', name, props: clean });
}

/**
 * Det appen mäter, som sju funktioner.
 *
 * Ingen av dem tar emot fritext. Den som vill veta vad som skickas läser den
 * här listan — samma rader står i samtyckespanelen, på svenska.
 */
export const track = {
  /**
   * Ett besök, en gång per webbläsarsession.
   *
   * Det närmaste appen kommer "hur många som varit här", och det räknas med en
   * flagga i `sessionStorage` som aldrig lämnar enheten och försvinner när
   * fliken stängs. Ingen hashad IP, ingen besökarnyckel, inget som binder ihop
   * två besök — priset är att den som kommer tillbaka i morgon räknas som en ny
   * person, och det priset är värt att betala.
   */
  visit(): void {
    if (visitCounted()) return;
    if (!CONFIG || !hasAnalyticsConsent()) {
      // Frågan är inte besvarad än. Besöket räknas om och när svaret blir ja.
      pendingVisit = true;
      return;
    }
    send({ kind: 'visit' });
    markVisitCounted();
  },

  /** Flikbyte som sidvisning: `/discover`, `/ai` … Appen har inga andra sidor. */
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
