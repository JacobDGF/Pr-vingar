import { useSyncExternalStore } from 'react';
import { ConsentState, getConsent, subscribeConsent } from '../lib/consent';

/**
 * Samtycket som React-tillstånd.
 *
 * Ligger i `useSyncExternalStore` snarare än i `useStore`, eftersom källan är
 * en modul som måste gå att läsa innan React finns — se
 * [`lib/consent.ts`](../lib/consent.ts). Snapshoten är samma objekt tills
 * någon faktiskt ändrar sitt val, vilket är vad hooken kräver.
 */
export function useConsent(): ConsentState {
  return useSyncExternalStore(subscribeConsent, getConsent, getConsent);
}
