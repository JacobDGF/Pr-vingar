# Prövningar

En app som hjälper folk hitta och anmäla sig till betygsprövningar i hela
Sverige. Alla listningar länkar vidare till anordnarens egen anmälan — appen
tar aldrig emot en anmälan själv.

Två saker bär hela appen: [datan](#datan-är-produkten), som är kontrollerad mot
anordnarens egen sida, och [färgen](#en-färg-per-listning), som säger om du kan
boka omgången eller inte innan du läst ett enda ord.

## Kom igång

```sh
npm ci
npm run dev           # utvecklingsserver
npm test              # dataset- och logiktester
npm run typecheck     # tsc -b
npm run lint          # eslint
npm run format:check  # prettier --check
npm run build         # produktionsbygge till dist/
```

## Datan är produkten

Allt innehåll bor i [`src/data/exams.ts`](src/data/exams.ts). Varje listning är
kontrollerad mot anordnarens egen webbplats, och `verifiedAt` säger när.

Fem regler styr datan, och de testas i
[`src/data/exams.test.ts`](src/data/exams.test.ts) och
[`src/lib/examStatus.test.ts`](src/lib/examStatus.test.ts):

- **Inga gissade datum.** `nextPeriod.confirmed` är `false` när anordnaren inte
  har publicerat datum. Då visar appen ingen period alls, utan länkar vidare.
- **Länken ska leda till anmälan.** `registrationUrl` pekar så nära själva
  bokningen som anordnaren tillåter — e-tjänsten, kurslistan eller kassan, inte
  en informationssida, när ett djupare mål finns.
- **Anordnarens ord gäller före kalendern.** `nextPeriod.full` sätts när
  anordnaren själv skrivit att omgången är fullbokad. Då är listningen stängd
  för anmälan även om datumen ser öppna ut, och nedräkningen tystnar — ett
  "3 dagar kvar" på en omgång ingen kan söka till är bara press utan utväg.
- **Ett datum som varit ska synas som ett datum som varit.** När sista
  anmälningsdag passerat säger kortet "Anmälan stängde 4 aug.", datumet stryks
  över, kalenderexporten försvinner och listningen sjunker under de odaterade i
  "närmast i tiden" — en gången deadline sorterar annars först, eftersom ett
  äldre datum är mindre som text.
- **Samma skola och kurs listas en gång.** Datan växer en anordnare i taget, och
  två omgångar hos samma skola hör hemma i samma listnings etikett. Två kort
  läser som två skolor, där den ena råkar vara fullbokad.

### En färg per listning

[`src/lib/examStatusColor.ts`](src/lib/examStatusColor.ts) är den enda platsen
som bestämmer vilken färg en listning har. Kortets kant, pillret över bilden,
datumtexten, kartans nål och detaljvyns banner läser alla ur samma tabell, så de
kan inte säga olika saker om samma omgång.

| Färg       | Betyder                                               |
| ---------- | ----------------------------------------------------- |
| 🔴 Röd     | Fullbokat — anordnaren har sagt att platserna är slut |
| ⚪ Grå     | Anmälan stängde (datumet står på kortet)              |
| 🟠 Orange  | Öppen, men stänger inom en vecka                      |
| 🟢 Grön    | Öppen för anmälan i dag                               |
| 🔵 Blå     | Datum satt, anmälan har inte öppnat än                |
| ⬜ Neutral | Anordnaren har inte publicerat några datum            |

Rött betyder en enda sak, och det är den regel hela paletten vilar på. Tidigare
sa rött både "fullbokat" (du kan inte boka) och "3 dagar kvar" (du kan boka,
skynda dig) — de två motsatta svaren på den enda fråga en listning ska besvara.
Nedräkningen är orange nu. `never spends red on a round the user can still book`
i [`src/lib/examStatusColor.test.ts`](src/lib/examStatusColor.test.ts) håller
gränsen.

Färgnyckeln under hjältebilden är också filtret: tryck på "Fullbokat" för att se
vad du missade, tryck igen för att få tillbaka allt. Färger utan innehåll visas
inte alls — en tom "Fullbokat"-knapp är ett löfte om resultat som inte finns.

### Knappen får aldrig lova mer än färgen

[`src/lib/examAction.ts`](src/lib/examAction.ts) bestämmer vad knapparna längst
ned får lova. Kortet visade tidigare samma blå "Anmäl dig" på varje listning,
oavsett omgångens tillstånd — inklusive på en omgång anordnaren redan hade
markerat som fullbokad. Färgen sa "stängd" högst upp på kortet och knappen sa
"boka" längst ned, och knappen är den halvan folk trycker på.

En stängd omgång får därför ingen bokningsknapp alls. Den får en röd som säger
varför, och som pekar på anordnarens egen sida — det är där ett återbud eller
nästa omgång faktiskt annonseras. Den döda bokningslänken finns kvar som den
lilla knappen, för den som vill se det stängda formuläret med egna ögon.
Stegen under "Så anmäler du dig" försvinner samtidigt: tre numrerade steg är ett
löfte om vad som händer efter knappen, och på en stängd omgång håller det inte.

### Två vägar ut ur varje listning

[`src/lib/providerLinks.ts`](src/lib/providerLinks.ts) ger varje listning två mål,
och appen visar båda som egna knappar: `booking` är den verifierade djuplänken
in i anordnarens bokning, och `site` är anordnarens egen sida för den som hellre
läser först och gör allt själv. När `infoUrl` och `registrationUrl` är samma sida
härleds `site` till anordnarens startsida — alltid ur `infoUrl`, aldrig ur
bokningslänken, eftersom "skolans webbplats" inte betyder alvis.se.

### Vad det kostar, enligt anordnaren själv

Avgiften är 500 kr enligt Skolverkets förordning, och samma förordning låter
anordnaren efterskänka den för den som redan har ett F i kursen. Appen sa det
som **en** nationell regel — "500 kr hos alla anordnare (gratis om du redan har
betyget F)" — och datan den levererar motsäger den. Karlskoga tar 500 kr
"oavsett tidigare betyg". Trelleborg efterskänker bara för den som var inskriven
i Trelleborg. Flera kräver att F:et satts inom komvux, Växjö att det satts inom
ett år. Den som läser upp ett F är precis appens användare, så det är det
påstående appen minst av allt har råd att ha fel om: att ha fel kostar 500 kr.

[`src/lib/priceRule.ts`](src/lib/priceRule.ts) härleder svaret per listning ur
anordnarens egen `priceNote`, och gör det medvetet pessimistiskt — en
efterskänkning med förbehåll blir `conditionalFree`, och det anordnaren inte
skrivit om blir `unstated`. Färgen får lova för lite. Den får inte lova för
mycket.

| Färg      | Betyder                                                         |
| --------- | --------------------------------------------------------------- |
| 🟢 Grön   | Gratis vid tidigare F — utan förbehåll                          |
| 🟠 Orange | Gratis vid F, men anordnaren har villkorat det                  |
| ⚪ Grå    | Ingen rabatt vid F, eller anordnaren har inte sagt något om det |

Heuristiken är aldrig sista ordet: `priceNote` fanns på nästan varje listning
och renderades ingenstans — pristalet i hjälten sa "se villkor nedan" och det
fanns inga villkor nedan. Nu ligger anordnarens mening ordagrant i panelen
"Vad det kostar", direkt under knapparna, med färgchippet över sig.

### Hur gammal är kontrollen

`verifiedAt` säger vilken dag någon läste anordnarens sida. Detaljvyn har alltid
visat det — som "Kontrollerat mot Växjö kommun 24 juni", i samma trygga gröna
oavsett vad datumet sa, och utan årtal. En kontroll från 2024 och en från i går
var samma mening i samma färg.

Det är samma förfall som datumreglerna på korten finns för, vänt mot appen
själv. [`src/lib/freshness.ts`](src/lib/freshness.ts) ger raden en ålder, ett
årtal och en färg: grön inom 30 dagar, orange därefter, grå efter 90 — och från
orange och uppåt en rad som säger att anordnarens egen sida är den bättre
källan. Kontrollen åldras nu synligt i stället för att se lika frisk ut för
alltid.

### Anmälningsflöden

[`src/lib/registrationFlow.ts`](src/lib/registrationFlow.ts) härleder ur
`registrationUrl` vad användaren möts av — formulär, kurslista, kommunal
e-tjänst, webbshop, PDF-blankett, e-post eller informationssida — och vilka steg
som återstår. Appen visar stegen innan användaren klickar vidare. En listning
kan sätta `registration: { kind: … }` när en anordnare gör något som URL:en inte
avslöjar (t.ex. anmälan per e-post, eller `inperson` för Nässjö, som tar anmälan
över disk tre eftermiddagar i veckan — då är öppettiderna det enda användaren
behöver innan hen lämnar appen).

Ingen listning landar längre på en ren informationssida utan förklaring: när en
anordnare publicerar sitt formulär på sin egen sida först när perioden öppnar
säger `publishedOnPage` i [`src/data/exams.ts`](src/data/exams.ts) vilket datum
det dyker upp, i stället för att be användaren leta efter en länk som inte finns
där än. Testet _"names every listing that only reaches an information page"_ i
[`src/data/exams.test.ts`](src/data/exams.test.ts) håller den listan tom — en ny
listning utan kontrollerad väg vidare måste skrivas in där för hand.

### Kontrollera länkarna

```sh
npm run check:links          # rapporterar döda länkar
npm run check:links -- --all # visar även omdirigeringar
```

Skriptet ingår medvetet inte i `npm test` — det beror på att ~90 externa
webbplatser svarar.

En 503 betyder två helt olika saker, och sweepen skiljer dem åt i två steg.
Åtta samtidiga anrop räcker för att trigga rate-limitern hos flera
kommunplattformar, så allt som svarar 429/503/502/504 eller timeout frågas en
gång till, en i taget — då svarar en överbelastad värd 200. Det som fortfarande
vägrar är värdar som känner igen klienten, inte takten; de står i `BOT_BLOCKED`
och rapporteras som "kunde inte kontrolleras" i stället för som fel, annars
drunknar en verklig död länk i röd text som alltid är röd.

Priset för en rad i `BOT_BLOCKED` är att en länk som faktiskt dör där måste
upptäckas för hand, så listan hålls så kort som bevisen tillåter. Alvis och
`www.falun.se` låg där på en 503 som visade sig vara vår egen rate-limiting —
de kontrolleras på riktigt igen sedan omförsöket kom på plats.

### Kontrollera formulären

```sh
npm run check:forms          # sonderar bokningslänkarna
npm run check:forms -- --all # visar även de som svarade som öppna
```

Den tredje sortens förfall, efter döda länkar och gångna datum, och den
svåraste att se utifrån: länken lever, datumen ligger framåt, kortet är grönt —
och formuläret på andra sidan svarar _"Formuläret är just nu stängt. Antingen
har det inte öppnat eller så har vi redan har fått in det maximala antalet
ansökningar för denna prövningsperiod."_

Det är inget undantagsfall. Flera anordnare kör först-till-kvarn där platserna
går på minuter: JENSEN öppnar ett Typeform kl. 11:00 som stänger sig självt vid
taket, Iris och Medlearn säljer platser som en webbshopsprodukt som slår om till
"slut i lager". Ingenting på deras informationssidor ändras när det händer, så
den enda plats där sanningen finns är bokningssidan — precis den sida datan
aldrig läser om.

Skriptet sonderar bara de listningar appen säger går att boka **i dag**. En
omgång som ännu inte öppnat är den viktiga undantagsregeln: en webbshopsprodukt
som släpps på anmälningsdagen står som "slut i lager" varje dag dessförinnan,
och att flagga det vore att rapportera appens egen korrekta "Öppnar 27 aug." som
ett fel.

En träff betyder att listningen vill ha `full: true` — men sätt det från
anordnarens egna ord, enligt regeln ovan. Skriptet hittar kandidater, det
bestämmer inte datan.

### Kontrollera datumen

```sh
npm run check:dates                    # vad som gått ut idag
npm run check:dates -- --soon          # visar även vad som stänger inom tre veckor
npm run check:dates -- --on 2026-12-01 # låtsas att det är ett annat datum
```

Länksweepen hittar en länk som dör. Det här hittar den andra halvan av samma
förfall, som är tystare: länken lever, sidan laddar, och datumen appen visar
hör till en omgång som stängde för tre veckor sedan. En listning ser precis lika
frisk ut dagen efter sista anmälningsdag som dagen före.

Skriptet skiljer på en omgång som är _helt_ förbi och en där anmälan stängt men
prövningen är kvar — den senare kan komma tillbaka med nya datum på samma sida.
De listningar som bygger sin period i kod i stället för som ett objekt kan inte
läsas ur källtexten, och rapporteras vid namn i stället för att tigande hoppas
över. Skriptet ingår inte i `npm test`: det beror på dagens datum, och skulle
göra `main` röd en tisdag morgon utan att någon commit orsakat det.

Får du plötsligt fel på nästan alla länkar samtidigt är det nästan aldrig datan.
Bakom en TLS-inspekterande proxy litar Node inte på proxyns certifikat och varje
https-anrop faller:

```sh
NODE_EXTRA_CA_CERTS=/sökväg/till/ca-bundle.crt npm run check:links
```

### En region är ett län

`region` innehåller ett av Sveriges 21 länsnamn, aldrig ett landskap, och
[`src/data/exams.test.ts`](src/data/exams.test.ts) håller listan till just de 21.
Filtret i Discover byggs ur fältet, så ett landskap där ("Småland" täckte
Jönköping, Kalmar och Kronoberg) tar tyst bort tre län ur filtret. Landskapet
får däremot gärna ligga kvar som `tag` — då hittar en sökning på "småland"
fortfarande fram.

## Profil och community

Profilen svarar på en fråga innan alla andra: hur många av dina sparade
prövningar kan du fortfarande göra något åt? "Läget för dina sparade" är en
enda stapel i statusfärgerna, med en rad per färg under, och varje sparad rad
bär sin egen färg i stället för ett datum som inte säger om omgången är kvar.
Fem sparade prövningar är annars fem datum att hålla i huvudet.

I communityn har varje inlägg en färgad kant efter sin sort — fråga, tips,
diskussion, seger — och filterknapparna bär samma färg med antalet i. Sorten
var tidigare en emoji och inget mer, och en emoji är det enda på ett kort som
en läsare i ett flöde inte hinner läsa som en kategori.

### Profilbilder

Appen visar aldrig färdiga porträtt av påhittade personer. En profilbild är en
bild användaren själv tar eller väljer, den skalas ned och sparas som `data:`-URL
i webbläsaren, och den lämnar aldrig enheten. Alla andra visas som ett ritat
monogram. [`src/lib/avatar.ts`](src/lib/avatar.ts) vägrar därför bild-URL:er som
pekar utanför enheten — vilket också rensar bort de gamla stockbilderna ur
localStorage hos återvändande användare (`persist` v0 → v1).

Inget i appen är skrivet en gång för alla: ett eget inlägg och ett eget svar går
att ta bort, och en genomförd prövning går att rätta eller radera i
[`src/components/CompletedExamSheet.tsx`](src/components/CompletedExamSheet.tsx),
som är samma ark oavsett om du lägger till eller ändrar. Betygsraderna räknas
in i snittpoängen på profilen, så ett betyg på fel rad var tidigare ett fel svar
på appens enda riktiga fråga — utan annan väg tillbaka än att radera allt.

## Datum, kalender och dina data

Appen påminner ingen om något när den är stängd, och den har ingen server.
Därför två utvägar, båda helt lokala:

- [`src/lib/calendarFile.ts`](src/lib/calendarFile.ts) bygger en `.ics` med
  sista anmälningsdag och provperiod (heldagshändelser, påminnelse dagen före)
  som användaren lägger i telefonens egen kalender. Ingen händelse skapas för en
  period som inte är bekräftad — ett gissat datum i någons kalender är sämre än
  inget datum.
- Profilfliken exporterar allt appen vet om användaren som JSON. Allt ligger i
  en enda webbläsares `localStorage`, så exporten är den enda säkerhetskopia som
  finns — den ligger direkt ovanför knappen som raderar originalet.

## Tillgänglighet

`index.html` låste tidigare zoomen (`maximum-scale=1.0, user-scalable=no`). Det
är ett WCAG-fel (1.4.4 Resize text), och det slår hårdast mot precis den här
appen: det som ska läsas är datum, kurskoder och villkor för 500 kr, på en
telefon. Nypzoom är på igen, och `viewport-fit=cover` håller layouten under
hacket.

## Deploy

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) kör lint,
formatkontroll, typkontroll, tester och bygge på varje push och pull request,
och publicerar `dist/` till `gh-pages` vid push till `main`.
