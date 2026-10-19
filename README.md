# Mind Mirror

**Understand how you learn, not just what you score.**

Mind Mirror is a personalized learning-intelligence platform. Instead of just recording marks, it builds a continuously updated model — a *Cognitive Twin* — of what a student actually knows, what they're forgetting, how confidently they answer, and what they should study next. Every quiz, test, and study session updates this model in real time.

This is a production-ready, full-stack application featuring:
- **Cloud Database**: Neon Serverless PostgreSQL with connection pooling
- **Backend**: Express + TypeScript REST API with JWT authentication and parameterized SQL queries
- **Frontend**: React 19 + Vite + Tailwind CSS + Three.js 3D Zen workspace
- **Hosting**: Deployed continuously via Vercel

---

## Architecture

```
Browser (React + Vite + Three.js)
      │  REST, JSON, JWT Bearer / Cookie session
      ▼
Express API (TypeScript)
  ├── middleware (auth, validation, error handling)
  ├── controllers (REST endpoints)
  ├── services (scoring, retention curve, recommendations, quiz/test engines)
  └── db/repositories (parameterized SQL queries)
      │
      ▼
Neon PostgreSQL (Serverless, Pooled)
```

---

## Live Deployments & Links

- **GitHub Repository**: [https://github.com/KingOVoid/Mind-Mirror-](https://github.com/KingOVoid/Mind-Mirror-)
- **Vercel Project**: Linked to `KingOVoid/Mind-Mirror-` for continuous deployment on push to `main`

---

## Features

- **Cognitive Twin Dashboard**: Real-time tracking of knowledge scores, confidence calibration, forgetting curve retention, and study streaks.
- **Physical Notebook Layout**: Interactive notebook with 3D stationery background, tabbed navigation, and Quiz Practice mode.
- **Adaptive Quiz & Testing**: Real-time evaluation, instant answer feedback, and automated mistake tracking.
- **Database Backed**: Full PostgreSQL schema with 23 tables, ENUM types, and relations.

---

## Local Development

### 1. Install Dependencies
```bash
cd mindmirror2
npm install
npm --prefix client install
npm --prefix server install
```

### 2. Configure Environment Variables
Copy `.env.example` in `mindmirror2/server/` to `.env` and fill in your database credentials:
```bash
cp mindmirror2/server/.env.example mindmirror2/server/.env
```

### 3. Run the Development Server
```bash
npm run dev
```
- Client runs on `http://localhost:5173`
- Server runs on `http://localhost:4000`
