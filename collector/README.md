# Räknaren

Appens egen statistik, i tre delar:

```
webbläsaren ──POST /e──▶ worker.js (Cloudflare)
                             │  summor per dygn i en D1-databas
                             ▼
          .github/workflows/stats.yml ──GET /export──▶ stats/ i det här repot
```

Ingen instrumentpanel, ingen tredje part som ser besökarna, och siffrorna
hamnar som en fil i repot — [`stats/README.md`](../stats/README.md) är hela
rapporten, renderad av GitHub.

Mellanledet finns av ett skäl: GitHub Pages är en filserver som varken kör kod
eller lämnar ut loggar, och för att skriva till GitHub krävs en token. En token
i en statisk app är publik — bygget publiceras dessutom till `gh-pages` i samma
repo, så den skulle ligga i klartext i repot och kunna skriva till det. Workern
är därför det minsta möjliga som kan hålla hemligheten: 200 rader utan
beroenden, på Cloudflares gratisnivå (100 000 anrop/dygn, och D1:s fria kvot
räcker med mycket god marginal för en sajt i den här storleken — kontrollera
Cloudflares aktuella villkor).

## Sätt upp den

```sh
npm run stats:setup                  # se först vad den gör:
npm run stats:setup -- --dry-run
```

Skriptet gör allt: skapar databasen, skriver in `database_id` i
[`wrangler.toml`](wrangler.toml), lägger upp tabellen, slumpar en token och
sätter den som hemlighet hos Cloudflare, publicerar workern och — om `gh` är
installerat och inloggat — sätter de fyra värdena i GitHub åt dig.

Det enda som inte går att automatisera är inloggningen: Cloudflare måste veta
att det är du, och den frågan kan bara du svara på i en webbläsare. Har du inget
konto skapar `npx wrangler login` ett gratis åt dig på vägen.

Skriptet går att köra om — steg som redan är gjorda hoppas över — och varje steg
skriver ut kommandot du kan köra för hand om något går fel.

<details>
<summary>Samma sak för hand</summary>

```sh
cd collector
npx wrangler login

# 1. Databasen. Id:t läser du med `d1 info --json` och klistrar in i wrangler.toml.
npx wrangler d1 create provningar-stats
npx wrangler d1 info provningar-stats --json
npx wrangler d1 execute provningar-stats --remote --file=./schema.sql --yes

# 2. Publicera. Adressen som skrivs ut är den appen ska posta till.
npx wrangler deploy

# 3. Nyckeln som GitHub Actions hämtar summorna med. Spara den, den visas inte igen.
#    Efter deployen, inte före: `secret put` gör en ny version av workern och
#    lägger ut den direkt, så den behöver en worker att arbeta på.
openssl rand -hex 32
npx wrangler secret put EXPORT_TOKEN
```

</details>

Kontrollera att `ALLOWED_ORIGINS` i [`wrangler.toml`](wrangler.toml) räknar upp
sajtens riktiga adress. Origin-kontrollen stoppar inte den som skickar med
`curl`, men den stoppar det den kan stoppa: en annan webbplats som pekar hit och
får sina besökare räknade som våra.

## Koppla in appen och jobbet

En rad, i [`.env.production`](../.env.production) i projektets rot:

```sh
VITE_ANALYTICS_SRC=https://provningar-stats.<konto>.workers.dev/e
```

Det är allt. Appen byggs med den adressen, och nattjobbet härleder sin egen
(samma utan `/e`) ur samma rad — inga repository variables, inga secrets.

Hemligheter behövs bara om du vill stänga exporten: sätter du `EXPORT_TOKEN`
hos workern måste `STATS_TOKEN` i repots secrets ha samma sträng, annars svarar
räknaren 401 på nattjobbet. Utan token är exporten öppen, vilket den gott kan
vara — den lämnar ut samma summor som ändå ligger publikt i `stats/`.

Kör `Statistik` i Actions för hand en gång för att se att kedjan går ihop.
Jobbet går annars 04:17 varje natt och committar bara när något ändrats.

## Utan terminal, bara klick

Går det inte att köra skriptet finns samma sak i Cloudflares dashboard. Fem
moment, alla i webbläsaren:

1. **Storage & databases → D1 → Create database**, namn `provningar-stats`.
2. Öppna databasen, fliken **Console**, klistra in innehållet i
   [`schema.sql`](schema.sql) och kör.
3. **Compute → Workers & Pages → Create → Start with Hello World → Deploy.**
   Döp den till `provningar-stats`.
4. **Edit code** på den nya workern: markera allt, klistra in
   [`worker.js`](worker.js), **Deploy**.
5. Workerns **Settings → Bindings → Add → D1 database**: variabelnamn `STATS`,
   databas `provningar-stats`. Lägg i samma vy till variablerna
   `ALLOWED_ORIGINS` (sajtens adress) och `RETENTION_DAYS` (`90`).

Adressen som står överst på workerns sida, med `/e` på slutet, är den som ska
in i `.env.production`.

Den vägen har en baksida värd att veta om: workern i dashboarden är då en kopia
av `worker.js`, inte en publicering av den. Ändras filen i repot händer
ingenting hos Cloudflare förrän någon kör `npm run stats:setup` eller klistrar
in koden på nytt.

## Kör den lokalt

```sh
cd collector
npx wrangler dev --local        # http://localhost:8787
```

och i projektets rot, i `.env.local`:

```sh
VITE_ANALYTICS_PROVIDER=endpoint
VITE_ANALYTICS_SRC=http://localhost:8787/e
```

`http` accepteras bara mot `localhost` — se `readAnalyticsConfig` i
[`src/lib/analyticsCore.ts`](../src/lib/analyticsCore.ts).

Hämta summorna som jobbet gör:

```sh
STATS_ENDPOINT=http://localhost:8787 STATS_TOKEN=<din token> node scripts/update-stats.mjs
```

## Vad som lagras

En rad per dygn, händelse och etikett — aldrig en rad per person:

| day        | site       | kind     | name         | label                  | n   |
| ---------- | ---------- | -------- | ------------ | ---------------------- | --- |
| 2026-09-11 | provningar | visit    | besök        |                        | 412 |
| 2026-09-11 | provningar | pageview | /discover    |                        | 980 |
| 2026-09-11 | provningar | event    | Till anmälan | {"kommun":"Örebro", …} | 37  |

Ingen IP-adress, ingen user agent, ingen referrer, inget besökar-id. Två besök
går inte att skilja åt ens för den som har databasen framför sig. Cloudflare ser
IP-adressen vid kanten som vilken webbserver som helst, men den lämnar aldrig
kanten och `collect` skriver den ingenstans.

Dygnet räknas i svensk tid, inte UTC: skillnaden är kvällen, vilket är när folk
faktiskt sitter och letar prövningar.

Räknaren gallrar själv vid varje export (`RETENTION_DAYS`, 90 dygn som
standard). Historiken bor i repot, inte här.

## Testa den

```sh
npx vitest run collector/worker.test.mjs
```

Testet kör workern mot en påhittad D1 och kontrollerar det som är värt att
kontrollera: att bara appens sju händelser tas emot, att fritext kapas, att en
annan sajts `Origin` avvisas, att exporten kräver rätt token och att dygnet
blir rätt en kväll klockan 23:30 svensk tid.
