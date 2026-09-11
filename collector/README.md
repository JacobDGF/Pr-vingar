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
cd collector
npx wrangler login

# 1. Databasen. Kommandot skriver ut ett database_id — klistra in det i wrangler.toml.
npx wrangler d1 create provningar-stats
npx wrangler d1 execute provningar-stats --remote --file=./schema.sql

# 2. Nyckeln som GitHub Actions hämtar summorna med. Spara den, den visas inte igen.
openssl rand -base64 32
npx wrangler secret put EXPORT_TOKEN

# 3. Publicera. Adressen som skrivs ut är den appen ska posta till.
npx wrangler deploy
```

Kontrollera att `ALLOWED_ORIGINS` i [`wrangler.toml`](wrangler.toml) räknar upp
sajtens riktiga adress. Origin-kontrollen stoppar inte den som skickar med
`curl`, men den stoppar det den kan stoppa: en annan webbplats som pekar hit och
får sina besökare räknade som våra.

## Koppla in appen och jobbet

**Repository variables** (Settings → Secrets and variables → Actions →
Variables) — de här hamnar i bundlen och är inga hemligheter:

| Variabel                  | Värde                                              |
| ------------------------- | -------------------------------------------------- |
| `VITE_ANALYTICS_PROVIDER` | `endpoint`                                         |
| `VITE_ANALYTICS_SRC`      | `https://provningar-stats.<konto>.workers.dev/e`   |
| `VITE_ANALYTICS_SITE`     | valfritt, bara om flera sajter delar samma räknare |

**Repository secrets** (samma sida, fliken Secrets) — de här är hemliga:

| Hemlighet        | Värde                                                      |
| ---------------- | ---------------------------------------------------------- |
| `STATS_ENDPOINT` | `https://provningar-stats.<konto>.workers.dev` (utan `/e`) |
| `STATS_TOKEN`    | samma sträng som workerns `EXPORT_TOKEN`                   |

Sedan: kör `Statistik` i Actions för hand en gång för att se att kedjan går
ihop. Jobbet går annars 04:17 varje natt och committar bara när något ändrats.

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
