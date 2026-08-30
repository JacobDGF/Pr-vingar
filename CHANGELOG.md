# Changelog

En rad per utvecklingsomgång: vad datan växte med, och vilken enda
produktförbättring omgången bar. Äldre historik än den första posten här ligger
i `git log` och i [README](README.md), som är där appens egna regler bor.

## 2026-08-30

**Data: +211 prövningar.** Hela Prövningsenheten Göteborgs kurskatalog, läst
kurs för kurs ur anordnarens egen kurslista i Alvis. Datasetet går från 163 till
374 listningar.

| Kommun   | Listningar | Källa                                                        |
| -------- | ---------- | ------------------------------------------------------------ |
| Göteborg | 4 → 215    | Prövningsenhetens kurslista och kurssidor, höstterminen 2026 |

Göteborg stod på fyra kort trots att den är tvåa i prioritetsordningen, och
skälet var att de fyra var skrivna som "en anordnare, fyra ämnen". Anordnaren
publicerar i själva verket varje kurs som en egen post med eget provdatum, egen
sista anmälningsdag och egen lokal — 215 av dem — vilket är precis den upplösning
appen är byggd för.

- **Provdatumet är dagsexakt per kurs**, inte en period: varje listning bär det
  prövningstillfälle vars anmälan fortfarande är öppen, med veckodag och
  klockslag som anordnaren skriver dem. 185 kurser är öppna för anmälan; de 30
  där höstens sista anmälningsdag har passerat ligger kvar som gångna omgångar,
  eftersom de säger vad kommunen prövar och när vårens datum publiceras
  (1 december, första ansökningsdag 15 december).
- **Lokalen är tre**, inte en: Burgårdens gymnasium, Studium Styrmansgatan och
  Lindholmens tekniska gymnasium, med koordinater geokodade per adress. De fyra
  gamla korten låg på en adress anordnaren inte prövar på.
- **Kurskoden kommer ur kursplanslänken**, inte ur anmälningskoden — det är
  skillnaden mellan `MATMAT00S` och Alvis egna `MATMAT00S_LA`, och mellan
  `MATMAT01b` och listningens versaler.
- De fyra befintliga korten uppdaterades i stället för att dubbleras, med sina
  id kvar, så en sparad prövning i någons webbläsare fortfarande hittar hem.
  Avgiften (500 kr per kurs och prövningstillfälle, betald senast fyra veckor
  före provet) och villkoret för avgiftsfrihet står nu som Göteborg skriver dem.

**Produkt: fliken AI-prövning.** Skriv meningen — "jag bor i Göteborg och vill
höja mitt betyg i Matte 2b innan december" — och få prövningarna som passar, i
samma kort som resten av appen. Läsningen skrivs ut ovanför svaret, och fliken
säger ifrån när den fått vidga sökningen. Modellen (`claude-sonnet-4-6`)
formulerar stycket när sajten har en `VITE_AI_ENDPOINT` konfigurerad; korten
kommer alltid ur datan. Se [README](README.md#ai-prövning) för varför nyckeln
inte kan bo i ett statiskt bygge.

## 2026-08-29

**Data: +48 prövningar.** Komvux Malmö (26) och Linvux i Linköping (22), lästa
kurs för kurs mot anordnarnas egna sidor.

| Kommun    | Listningar | Källa                                                                     |
| --------- | ---------- | ------------------------------------------------------------------------- |
| Malmö     | 2 → 28     | Komvux Malmös skrivschema och utbud för gymnasiala kurser, period 4 2026  |
| Linköping | 2 → 24     | Linvux prövningsanvisningar och prövningsperioder, prövningsperiod 3 2026 |

Båda anordnarna publicerar hela sitt utbud i förväg, vilket är varför de gick
före resten av prioritetsordningen: de gick att läsa kurs för kurs i stället
för som ett kort per skola.

- **Malmö**, period 4 2026: anmälan 7–18 september, prövningsperiod 26 oktober
  – 25 november, betygsdatum 25 november. Skrivschemat är dagsexakt, så varje
  listning bär sitt eget skrivpass (incheckningstid och provstart) — du får
  skriva högst ett kursprov per dag, och två kurser samma eftermiddag är en
  anmälan Malmö inte behandlar.
- **Linköping**, prövningsperiod 3 2026: anmälan 10 augusti – 4 september,
  proven skrivs vecka 40–41. Anordnarens egen provinformation per kurs ligger i
  `components`, så delproven står som anordnaren beskriver dem. Du behöver inte
  bo i kommunen, och du kan bli antagen till högst tre kurser per period.
- Ingen befintlig listning ändrades, och inga datum eller avgifter är
  härledda: allt kommer ur anordnarens egen sida. GY25-ämnena finns i båda
  anordnarnas utbud men är inte inlagda än, och samma sak gäller de kurser
  vars kurskod inte gick att bekräfta mot en publicerad källa (Malmös
  Historia, Filosofi, Geografi, Företagsekonomi, Internationella relationer,
  Entreprenörskap och Samhällskunskap 2).

**Produkt: fliken Jämför i Mina prövningar.** De sparade prövningarna ställs i
var sin kolumn — läge, avgift, deadline, prövningsperiod, anmälningsväg — och
raderna där kolumnerna säger samma sak dämpas, så det som faktiskt skiljer
omgångarna åt är det enda som står med full tyngd. Se
[README](README.md#jämför-sida-vid-sida) för varför ingen cell är en knapp.
