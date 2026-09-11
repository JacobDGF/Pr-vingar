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

  /**
   * Statistikleverantör: `endpoint` (appens egen räknare i `collector/`, som
   * lägger siffrorna i repot), `plausible` eller `umami`. Allt annat —
   * inklusive tomt, vilket är hur appen byggs tills någon sätter variablerna —
   * stänger av mätningen i hela kedjan. Se README, "Statistik och samtycke".
   */
  readonly VITE_ANALYTICS_PROVIDER?: string;
  /**
   * Räknarens adress (`…/e`) eller leverantörens skript-URL. Alltid https,
   * utom mot `localhost`, där `wrangler dev` svarar på http.
   */
  readonly VITE_ANALYTICS_SRC?: string;
  /**
   * Domännamnet (Plausible) eller webbplats-id:t (Umami). Publikt, inte en
   * nyckel. `endpoint` klarar sig utan — fältet finns för den dag flera sajter
   * delar samma räknare.
   */
  readonly VITE_ANALYTICS_SITE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
