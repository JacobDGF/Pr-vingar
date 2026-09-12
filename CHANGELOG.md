# Changelog

En rad per utvecklingsomgång: vad datan växte med, och vilken enda
produktförbättring omgången bar. Äldre historik än den första posten här ligger
i `git log` och i [README](README.md), som är där appens egna regler bor.

## 2026-09-12

**Data: +101 prövningar.** Hela Helsingborgs prövningsutbud, läst rad för rad ur
stadens egen jämförelsetabell mellan gamla kurser och Gy25-ämnesnivåer, och ur
betygsprövningssidan som daterar omgångarna. Datasetet går från 588 till 689
listningar.

| Kommun      | Listningar | Källa                                                                      |
| ----------- | ---------- | -------------------------------------------------------------------------- |
| Helsingborg | 1 → 102    | Helsingborgs stads betygsprövningssida och dess kurstabell (Gy11 mot Gy25) |

Helsingborg står åttonde i prioritetsordningen och hade ett kort. Staden
publicerar i själva verket hela utbudet — 98 gymnasiala ämnesnivåer och fyra
ämnen på grundläggande nivå — i en tabell som dessutom är den andra källan i
datan som skriver ut båda betygssystemen på samma rad.

- **Anmälan stängde i går, och det är hela poängen med raden.** Höstens omgång
  hade anmälan 7–11 september (sista betalningsdag samma dag) och proven skrivs
  12 oktober–6 november. Korten är därför grå "Stängde 11 sep." — men de säger
  vad staden prövar, vad det kostar och när nästa periods datum publiceras, och
  det är det svar den som letar i Helsingborg faktiskt behöver i dag.
- **Du söker i Gy25, inte i Gy11.** Staden tar bara emot anmälningar till
  ämnesnivåerna; vill du pröva den gamla kursen mejlar du
  `betygsprovning@helsingborg.se` efter anmälan, och bara om du redan har ett
  betyg i kursen. Därför är varje rad ett kort med Gy25-koden, med den gamla
  kursens namn och regel i beskrivningen — inte två kort som hos Örebro, som tar
  emot två anmälningar.
- **Betalningen ligger utanför e-tjänsten**, och det är steget som fäller folk:
  plusgiro 918192-6, meddelandet `5060/4760/26075` och ditt namn, och kvittot
  mejlat — allt före sista anmälningsdag. Anmälningsstegen på kortet säger det i
  stället för "betala enligt instruktionerna".
- **Nålen står hos anordnaren, med reservationen utskriven.** Arena Utbildning
  genomför de gymnasiala prövningarna (Planteringsvägen 5), staden skriver inte
  ut vilken sal proven skrivs i, och läraren kallar via Exlearn. Grundläggande
  nivå ligger kvar på Komvux Helsingborg, vars nål flyttats från en punkt 1,2 km
  fel till Rönnowsgatan 10.
- **+45 kurspar.** Tabellen ger sökningen 45 nya Gy11↔Gy25-par, bland dem Fysik
  1a mot Fysik nivå 1b som Örebros tabell listar var för sig. Källorna säger
  samma sak om varje par de båda tar upp. Rader där en kurs möter flera
  ämnesnivåer (`MATMAT00S`, Datorteknik 1a/1b) får ingen motsvarighet alls.
  Fyra kurskoder i tabellen är skrivfel som resten av datan rättar: `SPCSSPE01`,
  `HALAHL0`, `MATE1COOX` och Psykologi 2a:s `PSYL1000X`, som är Psykologi nivå
  1:s kod.
- Kvar att göra: `check:dates` pekar fortfarande ut tolv listningar vars omgång
  helt har passerat — samma åtta som sist plus Uddevalla, ABF:s Engelska 6 och
  två Göteborgskurser vars sista anmälningsdag var 11 september.

**Produkt: listan växer i sidor.** Upptäck ritade varje träff på en gång, vilket
med 689 listningar betyder att en telefon bygger tiotusentals DOM-noder innan
första kortet går att läsa. Nu visas 24 kort, en rad som säger var man är, och
en enda knapp: "Visa 24 till". Raden tystnar när hela träfflistan ändå fick
plats, sista trycket hämtar det som är kvar, och en ny sökning börjar om på
första sidan. Kartan är oförändrad och ritar alla träffar — den frågan har inget
sidnummer. Verifierat i Chromium mot ett riktigt bygge på 390 px. Se
[README](README.md#listan-växer-i-sidor-kartan-gör-det-inte).

## 2026-09-11 (räknaren i drift)

Räknaren står nu hos Cloudflare och appen är byggd mot den. Kedjan är
kontrollerad i sin helhet mot den riktiga workern innan den lades in: den tar
emot ett besök och en händelse (204), den avvisar en främmande sajts `Origin`
(403), och exporten svarar med summorna. `scripts/update-stats.mjs` hittar
adressen ur `.env.production` och når den.

De två anropen i kontrollen var inte torrkörningar utan riktiga rader: första
dygnets siffror innehåller därför **ett testbesök och en test-händelse**
("Till anmälan", Örebro) som inte kommer från någon användare. De försvinner
av sig själva när dygnet rullar ur rapportens fönster.

## 2026-09-11 (senare)

**Produkt: statistiken bor i repot.** Appen räknar nu sina besök själv, och
siffrorna hamnar som en fil i det här repot i stället för hos en leverantör:
[`stats/README.md`](stats/README.md) är hela rapporten, renderad av GitHub, med
git-historik per natt.

- **Kedjan är tre steg**: webbläsaren postar till en 200 rader lång Cloudflare
  Worker ([`collector/`](collector/README.md)), som räknar upp en summa per
  dygn i en D1-databas, och ett nattligt Actions-jobb hämtar summorna och
  committar dem till `stats/`. Mellanledet finns för att GitHub Pages varken
  kör kod eller lämnar ut loggar — och för att en GitHub-token som kan skriva
  till repot aldrig får ligga i en statisk app, allra minst i en som publicerar
  sitt bygge till `gh-pages` i samma repo.
- **Räknaren litar inte på appen.** Den tar bara emot appens sju händelser och
  flikarnas egna sidvägar, kapar all fritext till 48 tecken och högst sex fält,
  och avvisar en annan sajts `Origin`. Den lagrar ingen IP-adress, ingen user
  agent, ingen referrer och inget besökar-id: en rad är en summa för ett dygn,
  aldrig en händelse för en person.
- **Besök räknas en gång per webbläsarsession**, med en flagga i
  `sessionStorage` som aldrig lämnar enheten. Den som kommer tillbaka i morgon
  räknas som ny — priset för att slippa allt som binder ihop två besök.
- **Verifierat i Chromium mot ett riktigt bygge och en riktig worker**: noll
  anrop före ja:t, därefter besök, sidvisning och "Prövning öppnad" med kommun,
  ämne och kurskod — som POST utan preflight — och noll igen efter ett nej.
  Genomkörningen hittade också en bugg ingen enhetstest såg: räknaren krävde
  tre bokstäver i sidvägen och slängde därför varenda sidvisning från `/ai`.
- Dygnet räknas i svensk tid, inte UTC. Skillnaden är kvällen, och kvällen är
  när folk letar prövningar.

## 2026-09-11

**Produkt: statistik, med samtycke först.** Appen kan nu mäta hur den används —
hur många som hittar hit, vilka flikar som öppnas och hur många som går vidare
till en anmälan — men bara efter att användaren tryckt på en knapp.

- **Rutan kommer före mätningen, inte tvärtom.** Ett förstabesök möts av en
  panel som inte går att klicka bort, med två lika stora knappar: "Bara
  nödvändigt" och "Godkänn statistik". Leverantörens skript skapas först av ett
  ja — säger man nej har koden aldrig funnits på sidan. Verifierat i Chromium
  mot ett riktigt bygge: noll anrop före valet, ett skript och en sidvisning
  efter ja, och noll igen så fort samtycket dras tillbaka (skriptet plockas
  bort, den globala funktionen städas, Umamis sessionsnyckel raderas).
- **Vad som mäts står utskrivet i rutan**, samma sex händelser som finns i
  koden. Ingen av dem tar emot fritext: det som skrivs i sökrutan eller till
  AI-prövning lämnar aldrig enheten, och av en AI-fråga skickas bara utfallet.
- **Webbläsarens signal vinner.** Global Privacy Control eller Do Not Track
  betyder nej, och då ställs frågan inte alls.
- **Valet ändras i Profil**, som också visar vad man svarade och när, och kan
  glömma svaret så frågan kommer tillbaka.
- Mätningen är avstängd tills bygget får `VITE_ANALYTICS_PROVIDER`, `_SRC` och
  `_SITE` (Plausible eller Umami, båda kakfria); utan dem säger rutan rakt ut
  att ingenting samlas in. Se [README](README.md#statistik-och-samtycke).

## 2026-09-10

**Data: +82 prövningar.** Hela Komvux Örebros prövningstabell för hösten 2026,
läst rad för rad ur kommunens egen tabell. Datasetet går från 506 till 588
listningar.

| Kommun   | Listningar | Källa                                                              |
| -------- | ---------- | ------------------------------------------------------------------ |
| Örebro   | 1 → 83     | Komvux Örebros prövningstabell hösten 2026 (grund, gymnasial, sfi) |
| Västerås | 1 → 1      | Västerås stads egen prövningssida (omgången är fullbokad)          |

Prioritetsordningen säger Uppsala och Västerås före Örebro, och båda lästes om
först. Uppsala publicerar ingen kurslista: NTI-skolan sköter kommunens
teoretiska prövningar, höstens ansökan stängde 14 augusti, och det enda kortet
säger redan exakt det. Västerås publicerar en kurskatalog men ingen tabell — och
har hunnit skriva ut att årets omgång är fullbokad. Örebro är den första kommun
efter dem som lägger hela sitt utbud i en tabell med kurskod, regi och period.

- **Anmälan är öppen nu**, 14–27 september, med antagningsbesked 1 oktober och
  sista svarsdag 6 oktober. Prövningarna görs 26 oktober–13 november.
- **Två anordnare, två upplägg.** Kolumnen "Regi" avgör vad kortet lovar:
  Komvux egna prövningar (Matematik 2a–2c) har ett utsatt skriftligt prov 6
  november på Campus Risbergska, Talentis löper över tre veckor där läraren
  sätter dagen — minst en inlämningsuppgift, ett salsprov på plats och en
  muntlig uppgift, enligt anordnarens eget prövningsinformationsblad.
- **Gy11 och Gy25 är två kort, som datan kräver.** Örebro publicerar dem på
  samma rad men som två anmälningar: har du läst kursen före juli 2025 söker du
  den gamla kursen, annars ämnesnivån. 76 gymnasiala listningar, 4
  grundskolekurser (vars provdatum kommunen inte publicerat än) och 3
  sfi-kurser.
- **Adressen är utskriven**: Campus Risbergska ligger på Hagagatan 53, inte på
  "adress bekräftas vid anmälan" mitt i stan, och nålen är flyttad dit.
  Samhällskunskap 1b:s Gy25-kod står som `SAMH1B00X` — tabellen skriver
  `SAMH1B0X`, vilket resten av datan och Skolverkets kodmönster säger är ett
  skrivfel.
- Kvar att göra: `check:dates` pekar ut åtta listningar vars omgång helt har
  passerat (Växjö, Värnamo, Kunskapsförbundet Väst, Kristinehamn, Katrineholm,
  Trollhättan, ABF Stockholm, Iris Upplands Väsby). De behöver läsas om mot
  anordnarens sida, inte skrivas om på gissning.

**Produkt: kursen har två namn.** En sökning på "Matematik 3b" hittar nu också
de prövningar som publiceras som Matematik – fortsättning Nivå 1b, och tvärtom.
Paren är lästa ur Örebros tabell — den enda källa i datan som skriver ut båda
systemen på samma rad — aldrig gissade ur kurskoden, och en kurs som bara finns
i ett system får ingen motsvarighet. Detaljvyn säger med anordnarens egen regel
vilken av de två som är din. Se [README](README.md#kursen-har-två-namn).

Dessutom: AI-prövning vägde deadlines mot systemklockan i stället för mot det
`today` frågan lästes med, så en fråga om "innan oktober" kunde behålla en
omgång deadline-läsaren redan räknat som stängd — två svar på samma fråga inom
ett anrop, och ett test som började falla den dag kalendern sa emot det.

## 2026-08-31

**Data: +132 prövningar.** NTI-skolans publicerade prövningsutbud för
Stockholmsregionen, läst kurs för kurs ur anordnarens egen kurslista. Datasetet
går från 374 till 506 listningar.

| Kommun    | Listningar | Källa                                                                 |
| --------- | ---------- | --------------------------------------------------------------------- |
| Stockholm | 11 → 143   | NTI-skolans Gy11-prövningsutbud och deras sida för Stockholmsregionen |

Stockholm står först i prioritetsordningen och hade elva kort, varav tre var
"en anordnare, ett ämne". Stockholms stad låter fyra anordnare pröva de
gymnasiala teoretiska kurserna — Jensen, Komvux Södermalm, NTI och Hermods — och
NTI är den av dem som publicerar hela sitt utbud med kurskod, kurs för kurs.

- **Anmälan är stängd, och det är hela poängen med raden.** Staden har gått över
  till ett ansökningstillfälle per halvår och skola, utspridda över vecka 33–35.
  NTI:s fönster var öppet 17–20 augusti; den som antagits tilldelas en
  prövningsperiod mellan 14 september och 30 oktober, och nästa ansökan gäller
  våren 2027. Datan sa tidigare bara "ansökan öppnar 17 augusti", vilket slutade
  vara sant elva dagar senare — de tre gamla korten är uppdaterade i stället för
  dubblerade, med sina id kvar, så en sparad prövning fortfarande hittar hem.
- **Provlokalen är namngiven**, inte "bekräftas vid anmälan": slutprovet skrivs
  i NTI:s egen lokal på Hammarby Fabriksväg 65 i Hammarby Sjöstad, och
  inlämningsuppgifterna görs på distans. Delproven står som anordnaren beskriver
  dem — 1–5 betygsgrundande inlämningar, ett slutprov på plats med fast tid, och
  en obligatorisk muntlig examination över videolänk med fysisk legitimation.
- **Kraven följer med kursen.** De elva kurser där anordnaren skriver ut ett
  villkor (obligatorisk laboration i Fysik 3, vuxen-HLR respektive barn-HLR för
  Hälso- och sjukvård 1 och 2, validerad APL för omvårdnads- och
  omsorgskurserna) bär det i sin beskrivning i stället för att se ut som vilken
  kurs som helst.
- **Hermods Stockholmslänk är rättad** till den sida staden själv länkar till;
  den gamla var anordnarens hubb för hela länet, inte Stockholms stads egen.
- Kvar att lägga in: de 48 kurser i NTI:s utbud vars ämne inte finns i datan än
  (CAD, Nätverksteknik, Webbutveckling, de estetiska kurserna, Komvuxarbete med
  flera). Varje sådan skulle lägga till ett eget ämnesfilter med en enda kurs
  under sig, och det är ett grupperingsbeslut, inte en rad. Komvux Södermalm och
  Jensen svarar 503 på allt som inte är en riktig webbläsare, så deras utbud
  gick inte att läsa den här omgången.

**Produkt: bevaka ett ämne och en ort.** Välj ämne och ort i Upptäck och tryck
på den enda knapp som dyker upp — bevakningen ligger sedan överst i Mina
prövningar och säger en mening: _"3 nya sedan sist · sista anmälan om 6 dagar"_.
Deadlinen vinner över antalet, en rad som stänger inom en vecka blir orange, och
"nytt" betyder nytt för dig, inte nytt i datan. Sajten är statisk och kan inte
väcka någons telefon, så bevakningen berättar när du öppnar appen och den riktiga
påminnelsen är fortfarande .ics-exporten. Se
[README](README.md#bevaka-ett-ämne-och-en-ort).

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
