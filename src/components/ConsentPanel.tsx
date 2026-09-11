import { useEffect, useRef, useState } from 'react';
import { BarChart3, Check, ChevronDown, ExternalLink, ShieldCheck, X } from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { useConsent } from '../hooks/useConsent';
import { clearConsent, setConsent } from '../lib/consent';
import {
  analyticsHost,
  analyticsProviderName,
  isAnalyticsConfigured,
  isSelfHostedAnalytics,
} from '../lib/analytics';

/**
 * Frågan, och svaret på den.
 *
 * Samma panel i två lägen. `gate` är rutan som möter ett förstabesök och som
 * inte går att klicka bort — det är den enda gången appen kräver ett svar av
 * någon, och den kräver det därför att alternativet vore att mäta först och
 * fråga sen. `settings` är samma text öppnad från Profil, med ett kryss i
 * hörnet och valet man redan gjort utskrivet.
 *
 * Två saker är medvetna och ska stå kvar:
 *
 * - **Nej är lika lätt som ja.** Knapparna är lika stora, ligger bredvid
 *   varandra och har samma avstånd till tummen. En ruta där "godkänn" är en
 *   knapp och "neka" är en länk i sidfoten har inte frågat, den har tjatat.
 * - **Listan är inte en sammanfattning.** Raderna under "Vad mäts?" är samma
 *   händelser som finns i `analytics.ts`, för ett löfte man inte kan
 *   kontrollera är inget löfte.
 */

const MEASURED = [
  'Att ett besök börjat — en gång per webbläsarsession, utan något som följer med till nästa',
  'Vilken flik du öppnar, som en sidvisning',
  'Att en prövning öppnats — kommun, ämne och kurskod',
  'Att någon gått vidare till anordnarens anmälan',
  'Att en prövning sparats eller en bevakning skapats',
  'Att en kalenderfil hämtats',
  'Att en fråga ställts i AI-prövning — antal träffar, aldrig frågan',
];

const NEVER_MEASURED = [
  'Vad du skriver i sökrutan eller till AI-prövning',
  'Namn, e-post, betyg och annat du fyllt i under Profil',
  'Din position — kartan räknar avstånd i din egen webbläsare',
  'Kakor för annonser eller spårning mellan webbplatser',
];

interface ConsentPanelProps {
  mode: 'gate' | 'settings';
  onClose?: () => void;
}

export function ConsentPanel({ mode, onClose }: ConsentPanelProps) {
  const consent = useConsent();
  const [showDetails, setShowDetails] = useState(false);
  const settings = mode === 'settings';
  const panel = useRef<HTMLDivElement>(null);

  // Rutan ligger över appen och ska äga tangentbordet medan den gör det.
  // Utan det här står fokus kvar på sidan bakom, och den som tabbar sig fram
  // hamnar i en sökruta hen inte kan se.
  useEffect(() => {
    panel.current?.focus();
  }, []);

  // Escape stänger inställningsläget. Grinden har inget "senare" att stänga
  // till — där är valet vägen vidare, och båda vägarna är lika nära.
  useEscapeKey(() => {
    if (settings) onClose?.();
  });

  const choose = (analytics: boolean) => {
    setConsent(analytics);
    onClose?.();
  };

  const provider = analyticsProviderName();
  const host = analyticsHost();
  const selfHosted = isSelfHostedAnalytics();
  const signalled = consent.source === 'signal';

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-end lg:items-center lg:justify-center ${
        settings ? 'bg-black/50' : 'bg-ink/70 backdrop-blur-sm'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
    >
      <div
        ref={panel}
        tabIndex={-1}
        className="bg-cream w-full lg:max-w-xl max-h-[92vh] lg:max-h-[85vh] rounded-t-lg lg:rounded-lg overflow-hidden flex flex-col animate-sheet-up outline-none"
      >
        {/* Header */}
        <div className="bg-surface px-5 pt-5 pb-4 border-b border-line flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-brand-500 rounded-md flex items-center justify-center flex-shrink-0">
              <BarChart3 size={20} className="text-white" />
            </div>
            <h2 id="consent-title" className="text-xl font-bold text-ink font-display">
              Statistik om hur appen används
            </h2>
          </div>
          {settings && (
            <button
              onClick={onClose}
              aria-label="Stäng"
              className="w-9 h-9 bg-sand rounded-full flex items-center justify-center flex-shrink-0 active:scale-90 hover:bg-line transition-colors"
            >
              <X size={18} className="text-ink-soft" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          <p className="text-ink-soft text-sm leading-relaxed">
            Prövningar har ingen inloggning och tjänar inga pengar på dig. Men för att veta vilka
            kommuner som behöver läggas till härnäst behöver vi se hur många som hittar hit och
            vilka delar av appen som används. Statistiken är anonym, går inte att koppla till dig,
            och siffrorna är öppna — de ligger i projektets eget GitHub-repo.
          </p>

          <p className="text-ink-soft text-sm leading-relaxed">
            Dina sparade prövningar, betyg och inlägg ligger kvar i den här webbläsaren och skickas
            aldrig någonstans — oavsett vad du väljer här.
          </p>

          {/* What is measured — the promise, spelled out */}
          <div className="bg-surface border border-line rounded-md overflow-hidden">
            <button
              onClick={() => setShowDetails((v) => !v)}
              aria-expanded={showDetails}
              className="w-full flex items-center justify-between gap-3 p-4 text-left"
            >
              <span className="font-bold text-ink text-sm">Vad mäts?</span>
              <ChevronDown
                size={18}
                className={`text-ink-faint flex-shrink-0 transition-transform ${
                  showDetails ? 'rotate-180' : ''
                }`}
              />
            </button>
            {showDetails && (
              <div className="px-4 pb-4 -mt-1 space-y-4">
                <ul className="space-y-1.5">
                  {MEASURED.map((row) => (
                    <li key={row} className="flex items-start gap-2 text-ink-soft text-[13px]">
                      <Check size={14} className="text-trust-600 flex-shrink-0 mt-[3px]" />
                      <span className="leading-relaxed">{row}</span>
                    </li>
                  ))}
                </ul>
                <div>
                  <p className="font-bold text-ink text-[13px] mb-1.5">Det här mäts aldrig</p>
                  <ul className="space-y-1.5">
                    {NEVER_MEASURED.map((row) => (
                      <li key={row} className="flex items-start gap-2 text-ink-soft text-[13px]">
                        <X size={14} className="text-accent2-500 flex-shrink-0 mt-[3px]" />
                        <span className="leading-relaxed">{row}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-ink-faint text-[12px] leading-relaxed">
                  {!provider || !host
                    ? 'Det här bygget har ingen räknare konfigurerad, så ingenting skickas i dag oavsett vad du väljer. Svaret gäller från den dag en finns på plats.'
                    : selfHosted
                      ? `Siffrorna räknas av appens egen räknare (${host}) och summeras en gång per dygn till en fil i projektets öppna GitHub-repo. Ingen instrumentpanel, ingen tredje part, inga kakor — och ingen IP-adress sparas. Du kan ändra ditt val när som helst under Profil.`
                      : `Mätningen görs av ${provider} (${host}), utan kakor och utan att din IP-adress sparas. Du kan ändra ditt val när som helst under Profil.`}
                </p>
                {selfHosted && (
                  <a
                    href="https://github.com/JacobDGF/Provningar/blob/main/stats/README.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-600 underline"
                  >
                    Se siffrorna <ExternalLink size={11} />
                  </a>
                )}
                {/* Kartrutorna är en funktion, inte mätning — men de är ett
                    anrop till någon annan, och en ruta som räknar upp vad appen
                    gör ska inte hoppa över det. */}
                <p className="text-ink-faint text-[12px] leading-relaxed">
                  Kartan hämtar sina kartbilder från OpenStreetMap när du tittar på den. Det är en
                  del av funktionen och sker oavsett vad du väljer här — men det betyder att din
                  IP-adress syns för dem, precis som för vilken bild som helst du laddar på nätet.
                </p>
              </div>
            )}
          </div>

          {/* The browser already answered */}
          {signalled && (
            <div className="bg-trust-50 border border-trust-100 rounded-md p-4 flex items-start gap-2.5">
              <ShieldCheck size={18} className="text-trust-600 flex-shrink-0 mt-0.5" />
              <p className="text-trust-700 text-xs leading-relaxed">
                Din webbläsare skickar en integritetssignal (GPC eller Do Not Track). Vi respekterar
                den: statistiken är avstängd och frågan ställs inte igen.
              </p>
            </div>
          )}

          {/* Current choice, in the settings mode */}
          {settings && !signalled && (
            <p className="text-ink-faint text-[12px] leading-relaxed">
              {consent.choice === 'undecided'
                ? 'Du har inte svarat än.'
                : consent.choice === 'granted'
                  ? 'Du har sagt ja till statistik.'
                  : 'Du har tackat nej till statistik.'}
              {consent.decidedAt &&
                ` Valet gjordes ${new Date(consent.decidedAt).toLocaleDateString('sv-SE')}.`}
              {consent.ephemeral &&
                ' Webbläsaren tillåter ingen lagring här, så valet gäller bara den här fliken.'}
            </p>
          )}
        </div>

        {/* Två knappar, lika stora. Den som vill säga nej ska inte behöva leta. */}
        <div className="px-5 py-4 border-t border-line bg-surface">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => choose(false)}
              disabled={signalled}
              className="rounded-2xl px-5 py-4 bg-cream border-[1.5px] border-line text-ink font-bold text-[15px] transition-colors hover:bg-sand active:scale-98 disabled:opacity-50"
            >
              Bara nödvändigt
            </button>
            <button
              onClick={() => choose(true)}
              disabled={signalled}
              className="rounded-2xl px-5 py-4 bg-brand-500 text-white font-bold text-[15px] shadow-lg shadow-brand-200 transition-colors hover:bg-brand-600 active:scale-98 disabled:opacity-50 disabled:shadow-none"
            >
              Godkänn statistik
            </button>
          </div>

          {settings && consent.choice !== 'undecided' && !signalled && (
            <button
              onClick={() => {
                clearConsent();
                onClose?.();
              }}
              className="mt-3 w-full text-center text-[12.5px] text-ink-faint underline"
            >
              Glöm mitt val och fråga igen
            </button>
          )}

          {!isAnalyticsConfigured() && !signalled && (
            <p className="text-ink-faint text-[11.5px] leading-relaxed mt-3 text-center">
              Ingen statistik samlas in i det här bygget än — ditt svar sparas för framtiden.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
