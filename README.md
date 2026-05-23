# WMS Render PWA Prototype

Prosty prototyp:
- PWA na Androida
- formularz z kodem 8 cyfr
- zapis przez API
- dashboard z tabelą
- Express backend
- SQLite jako baza testowa

## Lokalnie

```bash
npm install
npm run dev
```

Frontend:
```text
http://localhost:5173
```

API:
```text
http://localhost:3000/api/records
```

## Deploy na Render

1. Wgraj projekt na GitHub.
2. W Render wybierz: New → Web Service.
3. Podłącz repozytorium.
4. Ustaw:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Po deployu otwórz adres Rendera na telefonie i komputerze.

## Test

1. Otwórz aplikację na telefonie.
2. Wpisz 8 cyfr.
3. Zapisz.
4. Otwórz ten sam URL na komputerze.
5. Wejdź w Dashboard.
6. Rekord powinien być widoczny.

## Uwaga

SQLite na Renderze jest dobre tylko do testu. Po redeployu dane mogą zniknąć.
Do prawdziwego testu wielodniowego lepiej przejść na PostgreSQL.
