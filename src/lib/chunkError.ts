/**
 * Telling "the app broke" apart from "the app moved".
 *
 * Four of the five tabs are loaded with `import()` the first time they are
 * opened, and every deploy rewrites the file names those imports point at —
 * `rsync --delete` in the deploy workflow removes the previous build's chunks
 * the moment the new one lands. So a user who had the app open across a deploy
 * and then taps a tab they had not visited yet asks for a file that no longer
 * exists. The import rejects, React unwinds the tree, and the app goes white
 * with nothing on screen to press.
 *
 * That failure is not a bug in the tab, and it must not be shown as one. The
 * fix is already on the server; the running page just has to fetch it. So we
 * recognise this one class of error by the browser's own wording and reload
 * instead of apologising.
 */

/**
 * How each engine words "the file behind that import() is gone".
 *
 * There is no error type to check and no code — only prose, and it differs per
 * browser. Chrome and Safari phrase it around the import, Firefox around the
 * module script, and bundlers of the webpack lineage throw a named
 * `ChunkLoadError` that some hosting layers still surface. Matching text is
 * fragile by nature, which is why the consequence of a match is a reload and
 * never something destructive.
 */
const STALE_CHUNK_PATTERNS = [
  /failed to fetch dynamically imported module/i,
  /error loading dynamically imported module/i,
  /importing a module script failed/i,
  // A missing file on GitHub Pages is answered with the 404 *page*, so the
  // browser reports a module served as text/html rather than a 404. Three
  // wordings for the one thing: Chrome, Safari, Firefox.
  /expected a javascript module script/i,
  /is not a valid javascript mime type/i,
  /disallowed mime type/i,
  /chunkloaderror/i,
  /loading chunk \d+ failed/i,
];

/** True when `error` says a dynamically imported file could not be fetched. */
export function isStaleChunkError(error: unknown): boolean {
  if (!error) return false;
  const name = error instanceof Error ? error.name : '';
  const message = error instanceof Error ? error.message : String(error);
  const text = `${name} ${message}`;
  return STALE_CHUNK_PATTERNS.some((pattern) => pattern.test(text));
}

/** The subset of `sessionStorage` this module needs, so tests need no browser. */
export interface AttemptStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const ATTEMPT_KEY = 'provningar:chunk-reload';

/**
 * How long a reload counts as "we already tried that".
 *
 * A reload that lands on the same broken state would reload again, and a page
 * that reloads itself in a loop is worse than a page that stays broken and
 * says so — the user cannot even read the error. One minute is longer than any
 * reload takes and shorter than the gap between two deploys, so a genuine
 * second deploy later in the session still gets its own automatic reload.
 */
const ATTEMPT_WINDOW_MS = 60_000;

/**
 * Whether to reload the page for this error, recording the attempt if so.
 *
 * Returns false for anything that is not a missing chunk — an ordinary crash
 * deserves an explanation, not a reload that loses whatever the user was doing
 * and most likely crashes again. Storage that throws (Safari private browsing
 * denies `sessionStorage`) costs the loop guard, not the reload: we would
 * rather fetch the fixed build than protect a hypothetical loop, so the
 * decision falls through to true.
 */
export function shouldReloadForStaleChunk(
  error: unknown,
  now: number,
  store: AttemptStore | undefined,
): boolean {
  if (!isStaleChunkError(error)) return false;
  if (!store) return true;

  try {
    const last = Number(store.getItem(ATTEMPT_KEY));
    if (Number.isFinite(last) && last > 0 && now - last < ATTEMPT_WINDOW_MS) return false;
    store.setItem(ATTEMPT_KEY, String(now));
    return true;
  } catch {
    return true;
  }
}

/** `sessionStorage` when the browser allows reading it, otherwise undefined. */
export function sessionAttemptStore(): AttemptStore | undefined {
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
}
