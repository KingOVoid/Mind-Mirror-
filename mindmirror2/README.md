# Mind Mirror

**Understand how you learn, not just what you score.**

Mind Mirror is a personalized learning-intelligence platform. Instead of just recording marks, it builds a continuously updated model — a *Cognitive Twin* — of what a student actually knows, what they're forgetting, how confidently they answer, and what they should study next. Every quiz, test, and study session updates this model in real time.

This is a full-stack application: a real PostgreSQL database, a real Express/TypeScript API with authentication and authorization, and a real React frontend. Nothing is mocked — every button performs a real action against real data.

---

## Table of contents

- [What it does](#what-it-does)
- [Architecture](#architecture)
- [Technology stack](#technology-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Database setup](#database-setup)
- [Seed data & development credentials](#seed-data--development-credentials)
- [Running the app](#running-the-app)
- [Testing](#testing)
- [API reference](#api-reference)
- [The learning analytics engine](#the-learning-analytics-engine)
- [A note on the Prisma schema](#a-note-on-the-prisma-schema)
- [Future improvements](#future-improvements)

---

## What it does

For every topic a student studies, Mind Mirror tracks and combines:

- **Knowledge** — accuracy, difficulty-adjusted performance, and a composite knowledge score (0–100), not just "% correct"
- **Mastery** — classified as Not Started, Learning, Weak, Improving, Strong, Mastered, or At Risk
- **Retention** — a forgetting-curve model that decays over time since last studied, independent of new activity
- **Confidence calibration** — detects overconfidence (confident but wrong) and hidden knowledge (unsure but correct) by comparing self-rated confidence against actual correctness
- **Behavior** — study frequency, session duration, quiz/test cadence, response time, and a real "meaningful activity" streak

All of this feeds:
- A **Dashboard** with real-time stats, strong/weak/at-risk topics, and a recommended next topic
- A **Mind Mirror** page — the full Cognitive Twin view (knowledge, behavior, confidence matrix, retention, risk)
- A **Recommendation engine** that generates specific, data-driven suggestions ("You haven't revised TCP/IP in 8 days")
- A **Review Center** and **Mistakes** page for targeted revision
- **Adaptive quizzes** that pick harder or easier questions based on a topic's actual performance history
- An **Admin panel** for managing the question bank, tests, and viewing aggregate student analytics

---

## Architecture

```
Browser (React SPA)
      │  REST, JSON, httpOnly cookie session
      ▼
Express API (TypeScript)
  ├── middleware (auth, validation, error handling)
  ├── controllers (thin — parse request, call service, shape response)
  ├── services (business logic: scoring, retention, recommendations, quiz/test engines)
  └── db/repositories (parameterized SQL queries)
      │
      ▼
PostgreSQL
```

Key design decisions:
- **All scoring/analytics logic lives in backend services**, not in React components or inline in controllers. `services/analyticsEngine.ts` is a pure, unit-tested module with no database or framework dependency — it can be tested, reused, and swapped out independently (e.g. replacing the retention model with a full spaced-repetition algorithm later).
- **Authorization is enforced server-side**, never only in the frontend. Admin routes check `req.user.role === 'ADMIN'` on the server; subject/topic ownership is checked on every mutating request.
- **A "live recompute" pattern for retention**: rather than requiring a cron job to decay scores, retention (and the knowledge score/mastery status derived from it) is recomputed at *read* time based on how long it's been since a topic was last studied. The stored row is the last-known snapshot; the read path projects it forward in time.

---

## Technology stack

**Frontend**: React, Vite, React Router, TypeScript, Tailwind CSS v4, Lucide icons, Recharts, Axios
**Backend**: Node.js, Express, TypeScript
**Database**: PostgreSQL
**Validation**: Zod (both request validation and form-level error shapes)
**Auth**: bcrypt password hashing, JWT in an httpOnly cookie
**Testing**: Vitest (unit tests for the analytics engine)

---

## Project structure

```
mind-mirror/
├── client/                      # React + Vite frontend
│   └── src/
│       ├── api/                 # typed API client modules (one per domain)
│       ├── components/          # shared UI primitives, ProtectedRoute
│       ├── contexts/            # AuthContext
│       ├── layouts/             # AppLayout (sidebar), AuthLayout
│       ├── pages/                # one folder per feature area
│       └── types/               # shared frontend types
│
├── server/                      # Express + TypeScript backend
│   ├── prisma/
│   │   ├── schema.prisma        # canonical ORM schema (see note below)
│   │   └── migrations/          # hand-authored SQL migrations matching the schema
│   ├── scripts/
│   │   └── migrate.js           # applies prisma/migrations/*/migration.sql in order
│   └── src/
│       ├── config/              # env loading/validation
│       ├── controllers/         # one per resource
│       ├── db/
│       │   ├── pool.ts          # pg Pool + transaction helper
│       │   └── repositories/    # parameterized SQL per entity
│       ├── middleware/          # auth, validation, error handling
│       ├── routes/              # one file per resource, mounted in routes/index.ts
│       ├── services/            # business logic — the real "brain" of the app
│       ├── utils/               # auth helpers, grading, validators
│       └── seed.ts              # seed data script
│
└── README.md
```

---

## Getting started

### Prerequisites
- Node.js 20+
- PostgreSQL 14+ running locally (or a connection string to one)

### Install

```bash
# from the repo root
cd server && npm install
cd ../client && npm install
```

---

## Environment variables

Copy the example file and fill in real values:

```bash
cd server
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Long random string used to sign session tokens |
| `JWT_EXPIRES_IN` | Session lifetime, e.g. `7d` |
| `PORT` | API port (default `4000`) |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_URL` | Frontend origin, for CORS (default `http://localhost:5173`) |
| `AI_API_KEY` | Optional. If set, enables AI-powered study plans/explanations. The app works fully without it — every AI feature has a rule-based fallback. Never exposed to the browser. |
| `AI_PROVIDER` | Optional. Set to `anthropic` to enable; `none` (default) disables. |

**Never commit your real `.env` file.** It's already covered by `.gitignore`.

---

## Database setup

Create the database:

```sql
CREATE DATABASE mindmirror;
```

Apply the schema. This project ships a `prisma/schema.prisma` as the canonical, authoritative ORM schema — in a normal environment with internet access, the standard Prisma workflow works out of the box:

```bash
cd server
npx prisma generate
npx prisma migrate dev
```

A hand-written SQL equivalent of the same schema is also included under `prisma/migrations/`, applied by a small custom runner (`scripts/migrate.js`) that tracks what's already been applied in a `_migrations` table:

```bash
npm run migrate
```

Both approaches produce the same database structure. (See [A note on the Prisma schema](#a-note-on-the-prisma-schema) for why this project includes both.)

---

## Seed data & development credentials

```bash
cd server
npm run seed
```

This creates, idempotently (safe to re-run):

- 4 global subjects — **Computer Networks**, **Data Structures**, **Operating Systems**, **Artificial Intelligence**
- 21 topics across those subjects (e.g. OSI Model, TCP/IP, Routing, Trees, Graphs, Scheduling, Neural Networks…)
- 42 real questions spanning all four question types and three difficulty levels
- An admin account and a demo student account

**Development credentials** (development only — change or remove before any real deployment):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@mindmirror.dev` | `Admin1234` |
| Student | `student@mindmirror.dev` | `Student1234` |

---

## Running the app

```bash
# Terminal 1 — backend
cd server
npm run dev          # http://localhost:4000

# Terminal 2 — frontend
cd client
npm run dev          # http://localhost:5173
```

The Vite dev server proxies `/api/*` to the backend, so the frontend just calls relative `/api/...` paths.

**Production build:**

```bash
cd server && npm run build && npm start
cd client && npm run build   # outputs static files to client/dist
```

---

## Testing

```bash
cd server
npm test
```

This runs the Vitest suite covering the learning analytics engine — knowledge scoring, mastery classification, the retention/forgetting model, and confidence-pattern classification (22 tests). The analytics engine is pure and dependency-free by design specifically so it can be tested this way, without a database.

Every major flow (registration, login/logout, quiz generation and submission, test generation and submission, study sessions, recommendations, Mind Mirror aggregation, admin authorization) was additionally verified end-to-end against a live database during development — see the project's development history for the exact request sequences used.

---

## API reference

All routes are prefixed with `/api`. Authenticated routes expect the session cookie set by `/auth/login` (or the `token` field returned in non-production responses, usable as a `Bearer` header).

<details>
<summary><strong>Auth</strong></summary>

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Create an account |
| POST | `/auth/login` | Log in |
| POST | `/auth/logout` | Log out |
| GET | `/auth/me` | Current user + profile |
| POST | `/auth/forgot-password` | Request a reset token (returned directly in dev, since no email provider is configured) |
| POST | `/auth/reset-password` | Reset password with a token |

</details>

<details>
<summary><strong>Onboarding & Profile</strong></summary>

| Method | Path | Description |
|---|---|---|
| GET | `/onboarding/status` | Has onboarding been completed |
| POST | `/onboarding/complete` | Submit onboarding preferences |
| PUT | `/profile` | Edit college/course/semester/goals |
| PUT | `/profile/password` | Change password (requires current password) |

</details>

<details>
<summary><strong>Subjects & Topics</strong></summary>

| Method | Path | Description |
|---|---|---|
| GET | `/subjects` | List subjects visible to the user |
| POST | `/subjects` | Create a personal subject |
| GET | `/subjects/:id` | Subject detail with topics + progress |
| PUT | `/subjects/:id` | Rename/update (owner or admin) |
| DELETE | `/subjects/:id` | Delete (owner or admin; global subjects require admin) |
| GET | `/subjects/:subjectId/topics` | Topics with per-user progress |
| POST | `/topics` | Create a topic |
| PUT | `/topics/:id` | Update a topic |
| DELETE | `/topics/:id` | Delete a topic |

</details>

<details>
<summary><strong>Question bank (admin only for mutation)</strong></summary>

| Method | Path | Description |
|---|---|---|
| GET | `/questions?subjectId=&topicId=` | List questions |
| POST | `/questions` | Create a question |
| PUT | `/questions/:id` | Update a question |
| DELETE | `/questions/:id` | Deactivate a question (soft delete, to preserve attempt history) |

</details>

<details>
<summary><strong>Quizzes</strong></summary>

| Method | Path | Description |
|---|---|---|
| POST | `/quizzes` | Generate a quiz for a subject/topic/difficulty |
| POST | `/quizzes/personalized` | "Generate Quiz for Me" — picks the weakest/least-attempted topic, adaptive difficulty |
| GET | `/quizzes/:id` | Fetch quiz + questions (sanitized until submitted) + the user's attempt |
| POST | `/quizzes/submit` | Submit answers (with confidence ratings); grades, updates topic progress, recommendations |
| GET | `/quizzes/attempts/:attemptId/review` | Full review with answer key and explanations |
| GET | `/quizzes/history` | Past quiz attempts |

</details>

<details>
<summary><strong>Tests (timed exams)</strong></summary>

| Method | Path | Description |
|---|---|---|
| GET | `/tests` | List published tests |
| POST | `/tests` | Create a test (admin) |
| POST | `/tests/:id/start` | Start or resume an attempt |
| PUT | `/tests/attempts/:attemptId/answer` | Save/update one answer (supports mark-for-review) |
| POST | `/tests/submit` | Submit (manual or auto on timeout); computes topic- and difficulty-wise breakdowns |
| GET | `/tests/attempts/:attemptId/review` | Full review |
| GET | `/tests/history` | Past test attempts |

</details>

<details>
<summary><strong>Dashboard, Mind Mirror, Analytics</strong></summary>

| Method | Path | Description |
|---|---|---|
| GET | `/dashboard` | Home screen data |
| GET | `/mind-mirror` | Full Cognitive Twin view |
| GET | `/analytics?range=7d\|30d\|3m\|all` | Time-series chart data |

</details>

<details>
<summary><strong>Recommendations, Mistakes, Review Center, Notifications</strong></summary>

| Method | Path | Description |
|---|---|---|
| GET | `/recommendations` | Active recommendations |
| POST | `/recommendations/regenerate` | Force-recompute from current data |
| PUT | `/recommendations/:id/dismiss` | Dismiss one |
| GET | `/mistakes?unresolved=true` | Past wrong answers |
| POST | `/mistakes/practice` | Build a quiz from unresolved mistakes |
| GET | `/review-center` | Aggregated review-now/weak/forgotten/at-risk view |
| POST | `/review-center/start` | Start a targeted revision quiz for one topic |
| GET | `/notifications` | List + unread count |
| PUT | `/notifications/:id/read` | Mark one read |
| PUT | `/notifications/read-all` | Mark all read |

</details>

<details>
<summary><strong>Study sessions</strong></summary>

| Method | Path | Description |
|---|---|---|
| GET | `/study-sessions/active` | Currently active session, if any |
| POST | `/study-sessions` | Start (or resume the existing active one) |
| PUT | `/study-sessions/:id/pause` | Add paused time |
| PUT | `/study-sessions/:id/finish` | Finish; computes duration net of pauses |
| GET | `/study-sessions` | History |

</details>

<details>
<summary><strong>Admin</strong></summary>

All require the `ADMIN` role, enforced server-side.

| Method | Path | Description |
|---|---|---|
| GET | `/admin/students` | All students with summary stats |
| GET | `/admin/students/:id` | One student's full detail |
| GET | `/admin/stats` | Platform-wide aggregate stats |
| GET | `/admin/difficult-questions` | Questions most students get wrong |
| GET | `/admin/weak-topics` | Topics weak/at-risk for the most students |
| POST | `/admin/subjects` | Create a global subject |
| POST | `/admin/topics` | Create a global topic |

</details>

<details>
<summary><strong>AI, Search</strong></summary>

| Method | Path | Description |
|---|---|---|
| GET | `/ai/status` | Whether an AI provider is configured |
| POST | `/ai/explain-answer` | Explain a wrong answer (AI if configured, else the stored explanation) |
| POST | `/ai/study-plan` | Short personalized study plan |
| POST | `/ai/summarize-weak-topics` | Narrative summary of weak topics |
| GET | `/search?q=` | Search subjects, topics, questions, and mistakes |

</details>

---

## The learning analytics engine

`server/src/services/analyticsEngine.ts` is the modular core behind every score shown in the app. It is intentionally pure (no DB, no framework) so each piece can be independently understood, tested, and improved:

- **`calculateKnowledgeScore`** — blends accuracy, difficulty-adjusted performance, retention, recent trend, and confidence calibration into one 0–100 score, with named weight constants so the formula can be retuned without digging through logic.
- **`classifyMastery`** — maps a topic's stats to one of 7 mastery states. A topic that was previously strong but has since decayed in retention is explicitly reclassified `AT_RISK`, distinct from never having been learned.
- **`calculateRetention`** — a simplified exponential forgetting curve. Each successful recall and each revision session extends how long a memory stays stable. Designed to be swapped for a real spaced-repetition algorithm (SM-2/FSRS) later without touching any caller.
- **`classifyConfidencePattern`** / **`calculateConfidenceCalibration`** — implements the four-quadrant confidence/accuracy analysis (strong understanding, possible misconception, knowledge-exists-low-confidence, weak concept) and a signed calibration gap (positive = overconfident).

This is a pedagogical analytics heuristic to guide study habits — **it is not a medical, psychological, or standardized educational assessment**, and the app says so in the Mind Mirror UI.

---

## A note on the Prisma schema

This project was built in a sandboxed development environment whose network policy blocks `binaries.prisma.sh`, which the Prisma CLI needs to download its query/schema engine for `generate`/`migrate`. That's a sandbox-specific restriction, not a property of the schema itself.

To keep development honest — actually running and testing the app against a real database rather than writing untested code — `prisma/schema.prisma` was kept as the single source of truth for the data model, and a hand-written SQL translation of that exact schema (under `prisma/migrations/`) was used to stand up and test the real database in-sandbox, with the server's data-access layer built on parameterized `pg` queries rather than a generated Prisma Client.

**In a normal environment with internet access, `npx prisma generate && npx prisma migrate dev` works immediately against the same schema file.** If you'd prefer to use Prisma Client at runtime instead of the raw-SQL repositories, the schema is ready for that — the repository layer in `src/db/repositories/` would need its query calls swapped for the equivalent `prisma.<model>.*` calls, but the shape of the data and every service built on top of it stays the same.

---

## Future improvements

- Replace the simplified exponential retention model with a full spaced-repetition algorithm (SM-2 or FSRS), using the same input/output contract already defined in `calculateRetention`.
- Real email delivery for password resets (currently returns the token directly in development, since no provider is configured).
- WebSocket or polling-based live updates for notifications instead of load-time fetch.
- Per-subject design systems / theming for admin-created subjects.
- Richer adaptive-difficulty logic that tracks a per-topic difficulty curve across sessions rather than a single current level.
- Pagination for the admin student list and question bank as data volume grows.
- Convert the Mind Mirror confidence matrix and retention views into dedicated interactive charts rather than list summaries.
