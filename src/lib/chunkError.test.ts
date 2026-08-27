import { describe, it, expect } from 'vitest';
import { isStaleChunkError, shouldReloadForStaleChunk, type AttemptStore } from './chunkError';

/** A stand-in for sessionStorage, with the option of a hostile one. */
function fakeStore(initial: Record<string, string> = {}, throws = false): AttemptStore {
  const data = { ...initial };
  return {
    getItem: (key) => {
      if (throws) throw new Error('SecurityError: storage is disabled');
      return key in data ? data[key] : null;
    },
    setItem: (key, value) => {
      if (throws) throw new Error('SecurityError: storage is disabled');
      data[key] = value;
    },
  };
}

describe('isStaleChunkError', () => {
  it('recognises how Chrome words a missing chunk', () => {
    expect(
      isStaleChunkError(
        new TypeError(
          'Failed to fetch dynamically imported module: https://x/assets/Profile-a1b2.js',
        ),
      ),
    ).toBe(true);
  });

  it('recognises how Safari and Firefox word the same failure', () => {
    expect(isStaleChunkError(new TypeError('Importing a module script failed.'))).toBe(true);
    expect(isStaleChunkError(new TypeError('error loading dynamically imported module'))).toBe(
      true,
    );
  });

  it('recognises the HTML-instead-of-JS answer a 404 page gives', () => {
    // GitHub Pages answers a missing file with its 404 *page*, so the browser
    // reports a module served as text/html instead of a 404. One failure,
    // three wordings.
    expect(
      isStaleChunkError(
        new TypeError(
          'Failed to load module script: Expected a JavaScript module script but the server ' +
            "responded with a MIME type of 'text/html'. Strict MIME type checking is enforced.",
        ),
      ),
    ).toBe(true);
    expect(
      isStaleChunkError(new TypeError("'text/html' is not a valid JavaScript MIME type.")),
    ).toBe(true);
    expect(
      isStaleChunkError(
        new TypeError(
          'Loading module from “https://x/assets/Exams-9f.js” was blocked because of a ' +
            'disallowed MIME type (“text/html”).',
        ),
      ),
    ).toBe(true);
  });

  it('recognises a named ChunkLoadError even with an unhelpful message', () => {
    const err = new Error('Loading chunk 42 failed.');
    err.name = 'ChunkLoadError';
    expect(isStaleChunkError(err)).toBe(true);
  });

  it('accepts a thrown string, since not everything thrown is an Error', () => {
    expect(isStaleChunkError('Failed to fetch dynamically imported module')).toBe(true);
  });

  it('leaves ordinary crashes alone', () => {
    expect(
      isStaleChunkError(new TypeError("Cannot read properties of undefined (reading 'map')")),
    ).toBe(false);
    expect(isStaleChunkError(new Error('Network request failed'))).toBe(false);
    expect(isStaleChunkError(null)).toBe(false);
    expect(isStaleChunkError(undefined)).toBe(false);
  });
});

describe('shouldReloadForStaleChunk', () => {
  const stale = new TypeError('Failed to fetch dynamically imported module: /assets/Exams-9f.js');

  it('reloads the first time a chunk goes missing', () => {
    expect(shouldReloadForStaleChunk(stale, 1_000_000, fakeStore())).toBe(true);
  });

  it('never reloads for an ordinary crash', () => {
    const store = fakeStore();
    expect(shouldReloadForStaleChunk(new Error('boom'), 1_000_000, store)).toBe(false);
    // An error that does not reload must not spend the attempt either, or the
    // next real stale chunk in the same minute would be shown as a crash.
    expect(shouldReloadForStaleChunk(stale, 1_000_001, store)).toBe(true);
  });

  it('refuses a second reload inside the same minute, so it cannot loop', () => {
    const store = fakeStore();
    expect(shouldReloadForStaleChunk(stale, 1_000_000, store)).toBe(true);
    expect(shouldReloadForStaleChunk(stale, 1_030_000, store)).toBe(false);
  });

  it('allows a fresh reload once the window has passed', () => {
    const store = fakeStore();
    expect(shouldReloadForStaleChunk(stale, 1_000_000, store)).toBe(true);
    expect(shouldReloadForStaleChunk(stale, 1_061_000, store)).toBe(true);
  });

  it('ignores a stored value that is not a timestamp', () => {
    expect(
      shouldReloadForStaleChunk(stale, 1_000_000, fakeStore({ 'provningar:chunk-reload': 'nope' })),
    ).toBe(true);
  });

  it('still reloads when the browser denies storage', () => {
    expect(shouldReloadForStaleChunk(stale, 1_000_000, fakeStore({}, true))).toBe(true);
    expect(shouldReloadForStaleChunk(stale, 1_000_000, undefined)).toBe(true);
  });
});
