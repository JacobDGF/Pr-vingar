import { Component, ReactNode } from 'react';
import { RefreshCw, TriangleAlert } from 'lucide-react';
import {
  isStaleChunkError,
  sessionAttemptStore,
  shouldReloadForStaleChunk,
} from '../lib/chunkError';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Named in the fallback so the user knows how much of the app is affected. */
  label?: string;
  /**
   * Set on a sheet that renders over the app. The fallback then covers the
   * screen the way the sheet did, instead of appearing as a stray card at the
   * bottom of the page with the broken sheet's backdrop still over it.
   */
  overlay?: boolean;
  /** Closes the sheet this boundary guards, giving the user back the app. */
  onDismiss?: () => void;
}

interface ErrorBoundaryState {
  error: unknown;
  /** True while a reload for a moved chunk is on its way — say "laddar om", not "fel". */
  reloading: boolean;
}

/**
 * The floor under the app.
 *
 * React unmounts the whole tree when a render throws and nothing catches it,
 * which on this app means a white screen with no nav and no way back: the tabs
 * are lazy, the sheets render over everything, and any one of them throwing
 * took the other four tabs with it. A boundary per tab keeps the failure the
 * size of the thing that failed.
 *
 * Two errors, two answers. A chunk that 404s after a deploy is not a fault the
 * user should read about — the working build is already on the server, so we
 * fetch it (see `lib/chunkError.ts`). Anything else gets an explanation and two
 * ways out: try again without losing the session, or reload.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, reloading: false };

  static getDerivedStateFromError(error: unknown): Partial<ErrorBoundaryState> {
    return { error, reloading: isStaleChunkError(error) };
  }

  componentDidCatch(error: unknown) {
    if (shouldReloadForStaleChunk(error, Date.now(), sessionAttemptStore())) {
      window.location.reload();
      return;
    }
    // A stale chunk we have already reloaded for once falls through to the
    // fallback rather than looping — the message below is at least readable.
    if (this.state.reloading) this.setState({ reloading: false });
    console.error('[Prövningar] Ohanterat fel:', error);
  }

  private retry = () => this.setState({ error: null, reloading: false });

  render() {
    if (!this.state.error) return this.props.children;

    const { label, overlay, onDismiss } = this.props;
    const frame = overlay
      ? 'fixed inset-0 z-50 bg-cream overflow-y-auto flex items-center justify-center px-6 py-10'
      : 'h-full overflow-y-auto flex items-center justify-center px-6 py-10';

    if (this.state.reloading) {
      return (
        <div className={`${frame} flex-col gap-3 text-center`}>
          <RefreshCw size={22} className="text-brand-500 animate-spin" />
          <p className="text-ink-soft text-sm">Hämtar den nya versionen…</p>
        </div>
      );
    }

    const stale = isStaleChunkError(this.state.error);
    const where = label ? `${label} kunde inte visas` : 'Något gick fel';

    return (
      <div className={frame}>
        <div className="bg-surface border border-line rounded-md p-6 max-w-sm w-full">
          <div className="w-10 h-10 bg-accent2-50 rounded-md flex items-center justify-center mb-4">
            <TriangleAlert size={20} className="text-accent2-700" />
          </div>

          <h2 className="text-xl font-bold text-ink font-display">{where}</h2>
          <p className="text-ink-soft text-sm leading-relaxed mt-2">
            {stale
              ? 'Appen uppdaterades medan du hade den öppen, och den gamla versionen finns inte kvar. Ladda om så hämtas den nya.'
              : 'Det är appen som krånglar, inte din anmälan — inga prövningar är påverkade och ingenting du sparat har försvunnit. Resten av appen fungerar som vanligt.'}
          </p>

          <div className="flex gap-2 mt-5">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-brand-500 text-white text-sm font-bold px-4 py-3 rounded active:scale-95 transition-transform"
            >
              Ladda om appen
            </button>
            {/* Closing beats retrying on a sheet: the sheet is what broke, and
                the app behind it is still whole. Only a tab, which has nothing
                behind it, offers a re-render instead. */}
            {onDismiss ? (
              <button
                onClick={onDismiss}
                className="bg-sand text-ink text-sm font-bold px-4 py-3 rounded active:scale-95 transition-transform"
              >
                Stäng
              </button>
            ) : (
              !stale && (
                <button
                  onClick={this.retry}
                  className="bg-sand text-ink text-sm font-bold px-4 py-3 rounded active:scale-95 transition-transform"
                >
                  Försök igen
                </button>
              )
            )}
          </div>
        </div>
      </div>
    );
  }
}
