/**
 * Användarens svar på frågan om statistik — och ingenting annat.
 *
 * Appen mäter först när någon sagt ja. Det är dels lag (ePrivacy och GDPR
 * kräver ett aktivt samtycke innan något lagras eller läses på användarens
 * enhet för statistikändamål), dels det enda hederliga: en sida som räknar sina
 * besökare i smyg har inte frågat, den har bara låtit bli att berätta.
 *
 * Modulen bor utanför `useStore` med flit. Samtycket måste gå att läsa innan
 * React monterar och innan zustand hydrerar — annars hinner ett mätanrop gå
 * iväg under den första framen, och då spelar det ingen roll vad rutan sedan
 * säger. Det är också därför den har en egen nyckel i `localStorage`: den ska
 * överleva att appens övriga data exporteras eller byggs om, men försvinna med
 * "Återställ appen" (som tömmer hela lagret), eftersom ett samtycke utan
 * användare är ingens samtycke.
 */

export const CONSENT_KEY = 'provningar-consent';

/**
 * Höjs bara när frågan ändras — alltså när vi vill mäta något som inte täcks av
 * det användaren en gång sa ja till. Ett gammalt ja till en ny fråga är inget
 * ja, så en högre version här ställer frågan på nytt i stället för att anta.
 */
export const CONSENT_VERSION = 1;

export interface ConsentRecord {
  version: number;
  /** True när användaren tryckt på "Godkänn statistik". */
  analytics: boolean;
  /** ISO-datum för valet, så panelen kan säga när det gjordes. */
  decidedAt: string;
}

export type ConsentChoice = 'granted' | 'denied' | 'undecided';

export interface ConsentState {
  choice: ConsentChoice;
  /**
   * Varifrån svaret kommer.
   *
   * - `user` — någon har tryckt på en av knapparna.
   * - `signal` — webbläsaren svarar åt användaren (Global Privacy Control
   *   eller Do Not Track). Då frågar vi inte: att be om samtycke av någon som
   *   redan sagt nej i sina inställningar är att fråga tills man får rätt svar.
   * - `unavailable` — `localStorage` går inte att läsa eller skriva (privat
   *   läge, blockerade kakor). Valet gäller då bara den här fliken, och
   *   panelen säger det i stället för att låtsas att det sparats.
   */
  source: 'user' | 'signal' | 'unavailable';
  decidedAt?: string;
  /** True när valet inte kunde sparas och alltså inte följer med till nästa besök. */
  ephemeral: boolean;
}

type Listener = () => void;

const listeners = new Set<Listener>();

/**
 * Snapshotens identitet måste vara stabil mellan anrop — `useSyncExternalStore`
 * jämför med `Object.is` och skulle annars rendera om i en evig slinga.
 */
let snapshot: ConsentState = initialState();

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Webbläsarens egen integritetssignal.
 *
 * GPC är den som betyder något i dag (Sec-GPC, lagstadgad i delar av USA och
 * respekterad av flera europeiska aktörer); DNT lever kvar i äldre webbläsare.
 * Båda betyder samma sak för oss: mät inte.
 */
function privacySignal(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.globalPrivacyControl === true || nav.doNotTrack === '1';
}

function initialState(): ConsentState {
  if (privacySignal()) {
    return { choice: 'denied', source: 'signal', ephemeral: false };
  }
  const store = storage();
  if (!store) return { choice: 'undecided', source: 'unavailable', ephemeral: true };
  try {
    const raw = store.getItem(CONSENT_KEY);
    if (!raw) return { choice: 'undecided', source: 'user', ephemeral: false };
    const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
    // Ett svar på en annan fråga än den vi ställer nu är inget svar.
    if (parsed.version !== CONSENT_VERSION || typeof parsed.analytics !== 'boolean') {
      return { choice: 'undecided', source: 'user', ephemeral: false };
    }
    return {
      choice: parsed.analytics ? 'granted' : 'denied',
      source: 'user',
      decidedAt: typeof parsed.decidedAt === 'string' ? parsed.decidedAt : undefined,
      ephemeral: false,
    };
  } catch {
    // Trasig JSON eller en webbläsare som vägrar läsa: fråga hellre igen.
    return { choice: 'undecided', source: 'user', ephemeral: false };
  }
}

function publish(next: ConsentState) {
  snapshot = next;
  for (const listener of listeners) listener();
}

/** Läser om från lagret. Finns för tester och för "Återställ appen". */
export function refreshConsent(): ConsentState {
  publish(initialState());
  return snapshot;
}

export function getConsent(): ConsentState {
  return snapshot;
}

export function hasAnalyticsConsent(): boolean {
  return snapshot.choice === 'granted';
}

/**
 * Sparar användarens val. `false` skrivs lika bestämt som `true` — ett nej är
 * ett svar, och ska inte leda till att rutan kommer tillbaka vid nästa besök.
 */
export function setConsent(analytics: boolean): ConsentState {
  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    analytics,
    decidedAt: new Date().toISOString(),
  };
  let ephemeral = false;
  const store = storage();
  if (store) {
    try {
      store.setItem(CONSENT_KEY, JSON.stringify(record));
    } catch {
      // Fullt lager eller blockerade kakor. Valet gäller den här sessionen.
      ephemeral = true;
    }
  } else {
    ephemeral = true;
  }

  publish({
    choice: analytics ? 'granted' : 'denied',
    source: 'user',
    decidedAt: record.decidedAt,
    ephemeral,
  });
  return snapshot;
}

/** Tar bort valet helt, så frågan ställs på nytt. */
export function clearConsent(): void {
  try {
    storage()?.removeItem(CONSENT_KEY);
  } catch {
    // Går det inte att ta bort raden går det inte heller att lita på den.
  }
  publish(initialState());
}

export function subscribeConsent(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
