# Ändringslogg

Vad varje omgång tillförde: hur många prövningar, från vilka kommuner, och
vilken produktförbättring som byggdes. Äldre omgångar än de som står här ligger
i git-historiken — den här filen börjar den dag den skapades.

## 2026-08-27

**Data: +34 prövningar, alla i Göteborg.** Hela Prövningsenheten Göteborgs
kurskatalog i Alvis lästes kurs för kurs (215 kurser), och de 38 gymnasiala
GY11-kurser som flest behöver skrevs in med anordnarens egna datum: matematik
1b–5, engelska 5–7, svenska 1–3, svenska som andraspråk 1–3, fysik 1a och 2,
kemi 1 och 2, biologi 1 och 2, naturkunskap 1b och 2, samhällskunskap 1a1–3,
historia 1a1/1b/2a, religionskunskap 1, psykologi 1 och 2a, filosofi 1,
företagsekonomi 1 och idrott och hälsa 1.

Fyra av dem fanns redan och uppdaterades i stället för att dubbleras
(`goteborg-ma2b`, `-eng6`, `-kemi1`, `-fysik1a`). De bar kvar etiketten
"anmälan öppnar 1 juli 2026", som var sann i juni och sedan länge inte är det.

Varje listning har nu:

- **Provdatum och sista anmälningsdag per kurs**, inte per termin. Datumen står
  bara på kursens egen sida i Alvis, och det är dit `registrationUrl` går.
- **Rätt lokal.** Kemiprövningen skrivs i B-huset, idrottens informationsmöte i
  receptionen, allt annat i Burgårdens konferens. Det stod i katalogen.
- **Prövningens fler moment i etiketten**, med anordnarens egna ord: kemi 1 är
  fyra tillfällen mellan 29 september och 3 november, inte ett.
- **Rätt avgiftsregel.** Göteborg är avgiftsfritt bara om man _både_ har F i
  kursen _och_ samtidigt läser andra kurser på komvux — inte bara det första,
  som den gemensamma texten i datan säger.

Två av dem — Engelska 7 och Naturkunskap 2 — har ingen omgång kvar att söka
till i höst. De ligger inne med den stängda omgångens datum, så kortet säger
"Anmälan stängde 25 aug." i stället för att kursen inte finns.

**Datafix utanför Göteborg:** Hermods prövningslänk för Stockholm gick till en
meny över 24 kommuner i Storstockholm. Stockholms stad länkar numera till en
Stockholmsspecifik sida, och det gör listningen också.

**Produkt: fliken `AI-prövning`.** En ruta att skriva frågan i, som man skulle
sagt den — "jag bor i Göteborg och vill höja mitt betyg i Matte 2b innan
december" — och ett svar i listningar. Ordförrådet läses ur datan, så varje
kommun, län, kurs och kurskod appen känner till är ett ord som fungerar.
Se README för vad som _inte_ byggdes och varför.

**Inte gjort:** modellanropet till Anthropic Messages API. Appen är en statisk
sajt utan server, så ett anrop därifrån skulle kräva att API-nyckeln ligger i
klientbundeln, publikt läsbar för vem som helst. Det görs inte. Det som i
uppdraget var fallbacken — en filtrerad sökning på den egna datan — är det som
byggdes, och det behöver ingen nyckel för att fungera.
