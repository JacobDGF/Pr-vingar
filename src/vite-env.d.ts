/// <reference types="vite/client" />

/** Build timestamp injected by vite.config.ts, used to detect a newer deploy. */
declare const __BUILD_ID__: string;

interface ImportMetaEnv {
  /**
   * A proxy that adds an Anthropic API key and forwards to
   * `https://api.anthropic.com/v1/messages`. Unset in the published build: a
   * static site cannot hold a key, so AI-prövning answers from the dataset
   * alone unless the deployer runs one. See README, "AI-prövning".
   */
  readonly VITE_AI_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
