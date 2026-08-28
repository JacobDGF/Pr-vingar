# Ändringar

En rad per utvecklingsomgång: vad datan växte med, och vilken produktändring
som gjordes. Det som hände före 2026-08-28 står i `git log` och i
[README](README.md) — den här filen börjar där, så att nästa omgång kan läsa
vad föregående redan gjort i stället för att göra om det.

## 2026-08-28

**Datan: +47 listningar (115 → 162), 5 uppdaterade.**

- **Göteborg (+26, 4 uppdaterade → 30 totalt).** Prövningsenhetens hela katalog
  i Alvis, kurs för kurs. Göteborg låg på fyra listningar som alla sa samma
  vaga sak — "anmälan öppnar 1 juli" — trots att Alvis publicerar varje enskilt
  prövningstillfälle med datum, klockslag, sal och sista anmälningsdag. Varje
  kurs bär nu sitt eget nästa bokningsbara tillfälle med djuplänk. Adressen
  rättad från Prövningsenhetens kontor (Brogatan 4) till där proven faktiskt
  skrivs: Burgårdens gymnasium, Skånegatan 20.
- **Linköping (+21 → 23 totalt).** Linvux prövningsperiod 3 (anmälan
  10 augusti–4 september 2026, skrivdagar vecka 40–41), kurs för kurs ur det
  ansökningsformulär Linvux publicerar per period.
- **Västerås (1 uppdaterad).** Kommunen skriver nu ordagrant
  "Prövningsperioden för 2026 är fullbokad" under rubriken Prövningsperioder.
  Anmälningsfönstret 17–31 augusti låg kvar i datan och hade lyst grönt i tre
  dagar till — `full: true` satt, enligt regeln att anordnarens ord går före
  kalendern.

Sex nya ämnen fick egna provdelar och studietips (biologi, historia,
religionskunskap, företagsekonomi, idrott och hälsa, programmering, svenska som
andraspråk) i stället för att låna ett annat ämnes.

**Produkten: fliken AI-prövning.**

En ruta du skriver en mening i — "jag bor i Göteborg och vill höja Matte 2b
innan december" — som svarar med de listningar meningen handlar om. Tolkningen
sker lokalt mot datan, så inget datum kan gissas och fliken fungerar med nätet
av; Claude-anropet (`claude-sonnet-4-6`) ligger ovanpå och går via en
konfigurerbar endpoint, eftersom en API-nyckel aldrig kan bo i en statisk sajt.
Hela resonemanget står under [AI-prövning i README](README.md#ai-prövning).

**Blockerat.** Anthropic-anropet är inte påslaget i den publika deployen: det
kräver en endpoint som håller nyckeln, och den finns inte än. Koden är skriven
och väntar på `VITE_AI_ENDPOINT`.
