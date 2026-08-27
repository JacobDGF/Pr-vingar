# Ändringslogg

Datan i den här appen är kontrollerad mot anordnarens egen sida, och det som
står här är vad som kontrollerades när. Loggen börjar 2026-08-27; allt före det
ligger i git-historiken.

## 2026-08-27

**Prövningar: +31 nya (146 totalt, från 115).**

| Kommun     | Före | Efter | Vad som tillkom                                       |
| ---------- | ---: | ----: | ----------------------------------------------------- |
| Göteborg   |    4 |    25 | Prövningsenhetens hela Alvis-katalog, kurs för kurs   |
| Stockholm  |   11 |    14 | Astar, Cuben Fridhemsplan (engelska grund, sva grund) |
| Norrköping |    2 |     5 | Källvindsskolan: fysik, naturkunskap, svenska nivå 2  |
| Borås      |    1 |     4 | Komvux Borås: Matematik 1b, Kemi 1, Engelska 5        |
| Bandhagen  |    0 |     1 | Cuben Högdalen: sfi kurs B, C och D                   |

**Göteborg är den stora posten.** Prövningsenheten är den enda anordnaren i
datan som publicerar en fullständig katalog: varje kurs har en egen rad i Alvis
med prövningsdatum, sista anmälningsdag, sal och ansvarig lärare. Det gjorde
listningar per kurs möjliga där de flesta kommuner bara tillåter ett
"flera kurser"-kort. Nya kurser: Matematik 1b/1c/3b/3c/4, Svenska 1 och 3,
Svenska som andraspråk 3, Engelska 5, Kemi 2, Biologi 1 och 2, Naturkunskap 1b,
Samhällskunskap 1b och 2, Psykologi 1, Religionskunskap 1, Historia 1b,
Filosofi 1, Geografi 1, Företagsekonomi 1.

**Rättningar i befintliga poster** (uppdaterade, inte dubblerade):

- De fyra gamla Göteborgskorten sa alla "anmälan öppnar 1 juli 2026" — sant när
  de skrevs i juni, men i augusti ett passerat datum som inte säger vilken
  omgång som går att boka. De bär nu kursens egna datum ur katalogen.
- **Hermods Stockholm** är fullbokat. Anmälan öppnade 26 augusti kl. 10.00 och
  var slut samma dag; kvar finns reservlistan, som öppnade kl. 10.15.
  `full: true` satt efter anordnarens egna ord, och bokningslänken pekar nu på
  den sida Stockholms stad själv länkar till.
- **Västerås**: kommunens sida säger "Prövningsperioden för 2026 är fullbokad",
  och deras egen länk till kurskatalogen (`vasteras.alvis.se/provning/amnesomrade`)
  svarar 404. Kortet är markerat fullbokat och pekar på kommunens prövningssida
  i stället — den enda sida som lever och den som bär beskedet.
- **Borås** stod som "anmälan sker löpande". Den gör den inte: fönstret är fyra
  dagar långt en gång per termin (24–27 augusti i höst), och datumen står på
  kommunens sida, inte i Alvis. `infoUrl` flyttad dit.
- **Norrköping**: Källvindsskolans riktiga adress (Nygatan 38) i stället för
  "adress bekräftas vid anmälan".

Länksvepet är grönt igen: 89 av 91 länkar svarar, och de två som inte gör det är
värdar som blockerar automatiserade anrop, inte döda länkar.

**Produkt: fliken AI-prövning.**

En fråga i löpande text — "jag bor i Göteborg och vill höja mitt betyg i Matte
2b innan december" — och prövningarna som matchar, som samma kort med samma
statusfärg som i Upptäck. Två halvor: en lokal matchning mot datans egen
vokabulär, som varken behöver nyckel eller nät, och ett anrop till Anthropics
Messages API (`claude-sonnet-4-6`, `max_tokens: 1000`) som skriver svaret utifrån
de tolv högst rankade listningarna. Varje rad bär anordnarens `kalla_url`, och
fält datan saknar går över som `null` — modellen får aldrig fylla i ett datum.
Misslyckas anropet visas den lokala sökningen med en mening om varför.

Appen har ingen server, så det finns ingen API-nyckel i bygget. Fliken fungerar
utan nyckel; den som vill ha det skrivna svaret klistrar in sin egen, och den
sparas bara i webbläsaren — utanför den store profilfliken exporterar som fil.

Detaljerna står under [AI-prövning i README](README.md#ai-prövning).

**Kända luckor efter den här omgången:** Stockholms stads egna komvuxskolor
ligger på `*.stockholm`-underdomäner som inte gick att nå (503), så Komvux
Södermalm, Skärholmen, Rinkeby, Kista, Liljeholmen och SIFA kunde inte läsas om.
Malmö, Uppsala, Linköping, Örebro, Helsingborg, Jönköping, Umeå, Lund, Sundsvall
och Gävle har fortfarande 1–2 listningar var och står näst på tur.
