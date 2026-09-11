#!/usr/bin/env bash
#
# Sätter upp räknaren, hela vägen: databas, publicering, nyckel och de
# variabler appen och nattjobbet behöver.
#
#   npm run stats:setup
#   npm run stats:setup -- --dry-run   # skriver ut vad den skulle göra
#
# Det enda som inte går att automatisera är inloggningen: Cloudflare måste veta
# att det är du, och den frågan kan bara du svara på i en webbläsare. Resten —
# sex kommandon, ett database_id att klistra in, en token att kopiera till två
# ställen i GitHub — gör skriptet.
#
# Misslyckas ett steg avbryter skriptet och skriver ut kommandot du kan köra
# för hand. Ingenting här är magi; varje rad står också i README.md bredvid.

set -euo pipefail

cd "$(dirname "$0")"

DB_NAME="provningar-stats"
WORKER_NAME="provningar-stats"
DRY_RUN=0
for arg in "$@"; do
  [ "$arg" = "--dry-run" ] && DRY_RUN=1
done

say() { printf '\n\033[1m%s\033[0m\n' "$*"; }
note() { printf '  %s\n' "$*"; }
fail() {
  printf '\n\033[31m%s\033[0m\n' "$*" >&2
  exit 1
}

# I torrkörning skrivs kommandot ut i stället för att köras, och de värden
# skriptet annars läser ur svaren ersätts med uppenbara platshållare. Det gör
# att hela flödet går att läsa igenom innan något händer på riktigt.
run() {
  if [ "$DRY_RUN" = 1 ]; then
    printf '  $ %s\n' "$*"
  else
    "$@"
  fi
}

run_capture() {
  if [ "$DRY_RUN" = 1 ]; then
    printf '  $ %s\n' "$*" >&2
    echo "<utdata från $1>"
  else
    "$@"
  fi
}

command -v node >/dev/null || fail 'node saknas. Installera Node 20 eller senare först.'

say 'Räknaren för Prövningar'
note 'Fyra steg: databas, publicering, nyckel, inkoppling.'
[ "$DRY_RUN" = 1 ] && note '(torrkörning — ingenting utförs)'

# ---------------------------------------------------------------- 1. databas

say '1/4  Databasen'

if grep -q 'KLISTRA_IN_DITT_DATABASE_ID' wrangler.toml; then
  create_out="$(run_capture npx --yes wrangler d1 create "$DB_NAME" 2>&1 || true)"
  printf '%s\n' "$create_out" | sed 's/^/  /'

  # Id:t läses ur `d1 info --json`, inte ur utskriften ovan. Den mänskliga
  # utskriften har bytt form flera gånger mellan wrangler-versioner; `--json`
  # är ett dokumenterat gränssnitt, och det svarar likadant vare sig databasen
  # skapades nyss eller fanns sedan ett avbrutet försök.
  if [ "$DRY_RUN" = 0 ]; then
    database_id="$(npx --yes wrangler d1 info "$DB_NAME" --json 2>/dev/null |
      node -e "
        let raw = '';
        process.stdin.on('data', (c) => (raw += c));
        process.stdin.on('end', () => {
          try {
            const info = JSON.parse(raw);
            process.stdout.write(info.uuid ?? info.database_id ?? info.uid ?? '');
          } catch {}
        });
      " || true)"

    # Sista utvägen: uuid:t står i klartext i svaret från create.
    if [ -z "$database_id" ]; then
      database_id="$(printf '%s' "$create_out" |
        grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | head -1 || true)"
    fi
  fi

  if [ "$DRY_RUN" = 1 ]; then
    database_id='00000000-0000-4000-8000-000000000000'
    note "  (torrkörning: låtsas-id $database_id)"
  fi

  [ -n "$database_id" ] ||
    fail "Kunde inte läsa ut något database_id. Kör 'npx wrangler d1 create $DB_NAME' för hand och klistra in id:t i collector/wrangler.toml."

  run node -e "
    const fs = require('fs');
    const file = 'wrangler.toml';
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('KLISTRA_IN_DITT_DATABASE_ID', '$database_id'));
  "
  note "database_id inskrivet i wrangler.toml: $database_id"
else
  note 'wrangler.toml har redan ett database_id — hoppar över skapandet.'
fi

note 'Lägger upp tabellen.'
# --yes finns inte i alla wrangler-versioner, och en okänd flagga är ett fel,
# inte en fråga. Faller tillbaka på den interaktiva varianten i stället för att
# avbryta hela uppsättningen på en versionsskillnad.
if ! run npx --yes wrangler d1 execute "$DB_NAME" --remote --file=./schema.sql --yes; then
  note 'Den wrangler du har vill fråga i stället — svara ja på nästa fråga.'
  run npx --yes wrangler d1 execute "$DB_NAME" --remote --file=./schema.sql
fi

# ------------------------------------------------------------ 2. publicering

# Publiceringen ligger före hemligheten med flit. `wrangler secret put` är
# ingen inställning utan en deploy: den skapar en ny version av workern och
# lägger ut den direkt. Finns ingen worker att göra en ny version av har den
# ingenting att arbeta på — så koden först, nyckeln sedan. Att workern lever
# en kort stund utan EXPORT_TOKEN är ofarligt: exporten svarar 401 tills den
# finns, vilket är exakt vad den ska göra.

say '2/4  Publicerar räknaren'

deploy_out="$(run_capture npx --yes wrangler deploy 2>&1 || true)"
printf '%s\n' "$deploy_out" | sed 's/^/  /'

worker_url="$(printf '%s' "$deploy_out" | grep -oE 'https://[a-z0-9.-]+\.workers\.dev' | head -1 || true)"
if [ "$DRY_RUN" = 1 ]; then
  worker_url="https://$WORKER_NAME.<konto>.workers.dev"
fi

[ -n "$worker_url" ] ||
  fail "Hittade ingen workers.dev-adress i svaret. Kör 'npx wrangler deploy' för hand och koppla in adressen enligt README.md."

note "Räknaren svarar på $worker_url"

# ----------------------------------------------------------------- 3. nyckel

say '3/4  Nyckeln som nattjobbet hämtar summorna med'

if [ "$DRY_RUN" = 1 ]; then
  export_token='<slumpad token>'
  printf '  $ %s\n' 'node -e "randomBytes(32).toString(\"hex\")"'
  printf '  $ %s\n' 'echo <token> | npx wrangler secret put EXPORT_TOKEN'
else
  export_token="$(node -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))")"
  # Token via stdin, aldrig som argument: argument syns i processlistan och
  # hamnar i skalets historik.
  printf '%s' "$export_token" | npx --yes wrangler secret put EXPORT_TOKEN
fi
note 'EXPORT_TOKEN satt hos Cloudflare (den lagras aldrig i repot).'

# ------------------------------------------------------------- 4. inkoppling

say '4/4  Kopplar in appen och nattjobbet'

if command -v gh >/dev/null && gh auth status >/dev/null 2>&1; then
  run gh variable set VITE_ANALYTICS_PROVIDER --body 'endpoint'
  run gh variable set VITE_ANALYTICS_SRC --body "$worker_url/e"
  run gh secret set STATS_ENDPOINT --body "$worker_url"
  run gh secret set STATS_TOKEN --body "$export_token"
  note 'Variabler och hemligheter satta i GitHub.'
  note 'Kör "gh workflow run Statistik" när grenen är på main, så fylls stats/ i natt.'
else
  cat <<INFO

  gh-kommandot saknas eller är inte inloggat, så de fyra sista värdena får
  klistras in för hand under Settings → Secrets and variables → Actions.

  Variables:
    VITE_ANALYTICS_PROVIDER   endpoint
    VITE_ANALYTICS_SRC        $worker_url/e

  Secrets:
    STATS_ENDPOINT            $worker_url
    STATS_TOKEN               $export_token

  (Eller: installera gh, kör 'gh auth login' och kör det här skriptet igen —
  det hoppar över stegen som redan är gjorda.)
INFO
fi

say 'Klart.'
note 'Appen börjar mäta vid nästa deploy, men bara för dem som säger ja i rutan.'
note 'Siffrorna hamnar i stats/ efter nattens körning — eller direkt, med:'
note '  gh workflow run Statistik'
