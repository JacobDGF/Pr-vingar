# Statistik

Så här används [Prövningar](https://xn--prvningar-17a.se). Siffrorna samlas in av
appens egen räknare (`collector/`) och skrivs hit av
[`.github/workflows/stats.yml`](../.github/workflows/stats.yml) en gång per dygn — det
finns ingen instrumentpanel någon annanstans, och ingen tredje part som ser besökarna.

**Filen är genererad.** Ändringar här skrivs över vid nästa körning; räkningen ändras i
`collector/worker.js` och i `src/lib/analytics.ts`.

## Senaste 30 dygnen (t.o.m. 2026-09-13)

| Besök | Sidvisningar | Till anmälan |
| ----- | ------------ | ------------ |
| 8 | 15 | 2 |

### Per dygn

| Dygn | Besök | Sidvisningar | Till anmälan |
| ---- | ----- | ------------ | ------------ |
| 2026-09-13 | 4 | 12 | 1 |
| 2026-09-11 | 4 | 3 | 1 |

### Flikar

| Namn | Antal |
| ---- | ----- |
| Upptäck | 11 |
| Community | 2 |
| Mina prövningar | 2 |

### Händelser

| Namn | Antal |
| ---- | ----- |
| Prövning öppnad | 14 |
| Till anmälan | 2 |

### Kommuner i öppnade prövningar

| Namn | Antal |
| ---- | ----- |
| Örebro | 8 |
| Linköping | 2 |
| Malmö | 2 |
| Norrköping | 1 |
| Södertälje | 1 |
| Sollentuna | 1 |
| Stockholm | 1 |

### Ämnen

| Namn | Antal |
| ---- | ----- |
| Engelska | 9 |
| Kemi | 4 |
| Fysik | 1 |

## Vad som inte står här

Inga besökar-id, inga IP-adresser, ingen user agent och ingen fritext — det som skrivs i
sökrutan eller till AI-prövning lämnar aldrig enheten. Raderna är summor per dygn, så två
besök går inte att skilja åt ens i råtabellen, och "besök" räknas en gång per
webbläsarsession utan något som följer med till nästa. Statistiken finns bara för dem som
sagt ja i appens samtyckesruta.

<sub>Uppdaterad 2026-09-13T07:30:39.486Z.</sub>
