/// <reference types="vite/client" />

/** Build timestamp injected by vite.config.ts, used to detect a newer deploy. */
declare const __BUILD_ID__: string;

interface ImportMetaEnv {
  /**
   * URL of an endpoint that forwards a Messages API request and adds the
   * Anthropic key on its own side. Unset in the public build — see
   * `src/lib/aiAnswer.ts` for why a key can never live in this bundle.
   */
  readonly VITE_AI_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
