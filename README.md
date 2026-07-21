# E-Test System - Full Stack Exam Management

A full-stack web application for managing online exams and student submissions.
Lecturers create, manage, publish, and review exams; students take exams and view
their graded results.

- **Frontend:** React 19 + Vite + React Router + Bootstrap
- **Backend:** Node.js + Express (layered/MVC) + JWT auth
- **Database:** PostgreSQL via Prisma ORM
- **DevOps:** Docker + Docker Compose, GitHub Actions CI, Render deployment

## Links

- **Repository:** _add your GitHub URL_
- **Live demo (frontend):** _add your Render web URL_
- **Live API:** _add your Render API URL_ (`/api/health` for a health check)

## Features

### Lecturer (teacher)
- Login with JWT-based authentication
- Create / edit / delete exams
- Add multiple-choice and open questions, set points and per-question time
- Publish exams to make them visible to students
- Review submissions per exam and see analytics (average, min, max, pass rate)

### Student
- Register and login
- Enter and take a published exam with a live countdown timer
- Auto-save answers in the session; server-side auto-grading on submit
- View personal results and pass/fail feedback

### Engineering
- Clean layered architecture (routes -> controllers -> services -> Prisma)
- Role-based authorization; correct answers never sent to students
- Request validation (zod), central error handling, structured logging (winston/morgan)
- Unit tests (Jest + Vitest), CI pipeline, containerized with Docker

## Repository structure

```
.
├── client/            # React SPA (Vite)
├── server/            # Express API + Prisma
│   └── prisma/        # schema + seed
├── docs/              # architecture, ERD, UML, sequence diagrams, milestones
├── docker-compose.yml # db + api + web
├── render.yaml        # Render deployment blueprint
└── .github/workflows/ # CI
```

## Quick start (Docker - recommended)

```bash
docker compose up --build
```

- Frontend: http://localhost:8080
- API: http://localhost:4000/api
- PostgreSQL: localhost:5432

Demo data is seeded automatically (`SEED_ON_START=true`).

## Quick start (local dev)

```bash
# Database
docker compose up -d db

# Backend
cd server
cp .env.example .env          # set DATABASE_URL, JWT_SECRET
npm install
npx prisma migrate dev        # create + apply schema
npm run seed                  # load demo data
npm run dev                   # http://localhost:4000

# Frontend (new terminal)
cd client
npm install
npm run dev                   # http://localhost:5173
```

## Demo accounts

| Username | Password | Role |
|----------|----------|------|
| `drsmith` | `teacher123` | teacher |
| `alex` | `student123` | student |

## Testing

```bash
cd server && npm test    # Jest: grading logic, id helpers, API smoke tests
cd client && npm test    # Vitest: pure helpers
```

## Documentation

- [Architecture](docs/architecture.md) - system overview, client/server design, API surface
- [Database](docs/database.md) - ERD + JSON models
- [UML](docs/uml.md) - OOP class diagrams
- [Sequence diagrams](docs/sequence-diagrams.md) - login, create exam, take exam
- [Milestones & workflows](docs/milestones.md) - branches, CI, Docker, deploy

## Environment variables

See [server/.env.example](server/.env.example) and [client/.env.example](client/.env.example).
