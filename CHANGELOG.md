# Changelog

En rad per utvecklingsomgång: vad datan växte med, och vilken enda
produktförbättring omgången bar. Äldre historik än den första posten här ligger
i `git log` och i [README](README.md), som är där appens egna regler bor.

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
