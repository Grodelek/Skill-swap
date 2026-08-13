# SkillSwap

SkillSwap is a web application for exchanging skills and organizing lessons between users. Users can find tutors, create lesson offers, communicate with other users, and agree on lesson details.

The project consists of a React frontend and a Spring Boot REST API. Real-time communication is handled through WebSocket/STOMP.

## Features

- user registration and login;
- tutor and student profiles;
- tutor discovery and offer filtering;
- lesson creation and deletion;
- favorite tutors;
- real-time conversations and messaging;
- sending, accepting, and declining lesson offers;
- bookings and payment confirmation;
- a shared whiteboard for lessons;
- conversation-related notes.

## Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- React Router
- STOMP.js and SockJS
- Excalidraw

### Backend

- Java 21
- Spring Boot
- Spring Security and JWT
- Spring Data JPA / Hibernate
- PostgreSQL
- WebSocket/STOMP
- Maven Wrapper

## Requirements

- Docker and Docker Compose;
- PostgreSQL — local or hosted, for example Neon;
- Git.

## Running with Docker Compose

1. Clone the repository and enter its directory:

   ```bash
   git clone <REPOSITORY_URL>
   cd skill-swap
   ```

2. Create an environment file from the example configuration:

   ```bash
   cp ss-backend/.env.example .env
   ```

3. Fill in `.env` with your PostgreSQL credentials and generated `JWT_SECRET` and `AES_SECRET` values.

4. Start the application:

   ```bash
   docker compose up --build
   ```

Once started:

- frontend: <http://localhost:5173>
- backend API: <http://localhost:8090>
- OpenAPI documentation: <http://localhost:8090/swagger-ui/index.html>

The frontend uses the Vite proxy, so API requests are sent through `/api` and WebSocket connections through `/ws`.

## Running Without Docker

### Backend

Java 21 and access to PostgreSQL are required.

```bash
cp ss-backend/.env.example ss-backend/.env
```

Fill in `ss-backend/.env`, then start the application:

```bash
cd ss-backend
./mvnw spring-boot:run
```

The backend will be available at <http://localhost:8090>.

### Frontend

In a separate terminal:

```bash
cd skill-swap-web
npm ci
npm run dev
```

The frontend will be available at <http://localhost:5173>.

## Database

The backend uses PostgreSQL. In the development environment, Hibernate updates the database schema on application startup.

Database initialization scripts are located in `ss-backend/db/`. Run them only against a local or test database:

```bash
psql "postgresql://username:password@host:5432/database_name" \
  -f ss-backend/db/seed.sql
```

Do not run `seed.sql` against a production database.

## Environment Configuration

The main environment variables are:

| Variable | Description |
| --- | --- |
| `DB_URL` | PostgreSQL JDBC URL |
| `DB_USERNAME` | database username |
| `DB_PASSWORD` | database password |
| `JWT_SECRET` | Base64 key used to sign JWTs |
| `AES_SECRET` | encryption secret with a length of 16, 24, or 32 bytes |

Example secrets can be generated with:

```bash
openssl rand -base64 32
openssl rand -hex 16
```

Never commit `.env` files or real secrets.

## Project Structure

```text
.
├── skill-swap-web/   # React + Vite frontend
├── ss-backend/       # Spring Boot backend
├── docker-compose.yml
└── README.md
```

## Project Status

The project is under active development. A production setup should additionally use database migrations, such as Flyway or Liquibase, and a secure secrets manager.

## License

No license has been selected yet. Add an appropriate license file before public use or redistribution.
