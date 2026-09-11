-- Räknarens hela databas.
--
-- En rad är en summa för ett dygn, inte en händelse för en person: primärnyckeln
-- är (dygn, sajt, sort, namn, etikett) och `n` räknas upp. Det finns därför
-- ingenting här att koppla ihop till ett besök eller en besökare — inte ens för
-- den som har databasen i handen.
--
-- Skapas med:
--   npx wrangler d1 execute provningar-stats --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS events (
  day   TEXT    NOT NULL,           -- 2026-09-11, svensk tid
  site  TEXT    NOT NULL,           -- vilken sajt räknaren delas av, om den delas
  kind  TEXT    NOT NULL,           -- visit | pageview | event
  name  TEXT    NOT NULL,           -- 'besök', '/discover', 'Till anmälan' …
  label TEXT    NOT NULL DEFAULT '',-- händelsens egenskaper som stabil JSON
  n     INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, site, kind, name, label)
);

-- Exporten läser alltid ett datumintervall.
CREATE INDEX IF NOT EXISTS events_day ON events (day);
