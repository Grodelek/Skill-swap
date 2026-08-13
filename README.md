# Skill Swap

Monorepo z dwoma usługami:

- `ss-backend` — Spring Boot API na porcie `8090`;
- `skill-swap-web` — aplikacja Vite uruchamiana developersko na porcie `5173`.

Baza danych nie jest uruchamiana przez Compose. Backend korzysta z zewnętrznego PostgreSQL, np. Neon.

## Uruchomienie

```bash
cp .env .env
```

Uzupełnij `.env` danymi Neon oraz nowymi sekretami, a następnie:

```bash
docker compose up --build
```

Aplikacja webowa będzie dostępna pod `http://localhost:5173`, a API pod `http://localhost:8090`.

Frontend korzysta z reverse proxy, dlatego w kontenerze wywołuje API względnymi ścieżkami `/api/...`, a WebSocket przez `/ws`.

## Seedowanie

Seed wykonuj ręcznie na testowej bazie, nigdy na produkcyjnej:

```bash
psql "postgresql://..." -f ss-backend/db/seed.sql
```

## Uwagi produkcyjne

- nie uruchamiać `seed.sql` na produkcyjnej bazie;
- dla produkcji zastąpić `spring.jpa.hibernate.ddl-auto=update` migracjami Flyway/Liquibase;
- sekrety przekazywać przez secret manager lub zmienne środowiskowe platformy;
- Neon powinien używać osobnej bazy/branchu dla testów.
