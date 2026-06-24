# VMS Lite — Visitor Management System

A simplified Visitor Management System built as an intern onboarding project.  
Frontend and backend are developed in **parallel** by separate interns, communicating through a shared API contract.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Repository Structure](#2-repository-structure)
3. [Prerequisites](#3-prerequisites)
4. [Quick Start](#4-quick-start)
   - [Backend](#backend)
   - [Frontend](#frontend)
5. [API Contract](#5-api-contract)
6. [Environment Variables](#6-environment-variables)
7. [Git Workflow](#7-git-workflow)
8. [Sprint Roadmap](#8-sprint-roadmap)

---

## 1. Project Overview

VMS Lite handles two core flows:

- **Visitor Registration** — A receptionist (or the visitor themselves) fills in a form to register before arrival.
- **Reception Dashboard** — Staff can see all registered visitors and check them in or out in real time.

The system is intentionally small — the goal is to practise building a full-stack TypeScript application with clean architecture (SOLID/DRY principles) under realistic parallel-team conditions.

---

## 2. Repository Structure

```
vms-lite/
├── backend/          # Express + Prisma REST API (TypeScript)
│   ├── src/
│   │   ├── server.ts           # App entry point
│   │   ├── routes/
│   │   │   └── visitor.routes.ts
│   │   ├── controllers/
│   │   │   └── visitor.controller.ts
│   │   └── services/
│   │       └── visitor.service.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env                    # Your local secrets (NOT committed)
│   ├── .env.example            # Template — copy this to .env
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/         # Next.js 16 + Tailwind + Shadcn UI (TypeScript)
│   ├── src/app/
│   ├── db.json                 # json-server seed data (mock backend)
│   ├── .env.local              # Your local env vars (NOT committed)
│   ├── .env.example            # Template — copy this to .env.local
│   └── package.json
│
└── Instructions.md   # Sprint breakdown & integration protocol
```

---

## 3. Prerequisites

Make sure these are installed on your machine **before** you start:

| Tool | Version | Install |
|------|---------|---------|
| Node.js | v20 LTS or newer | https://nodejs.org |
| npm | v10+ (comes with Node) | — |
| Git | any recent version | https://git-scm.com |
| PostgreSQL | v15+ *(backend only)* | https://www.postgresql.org/download/ |

> **Tip:** Run `node -v` and `npm -v` to verify your versions.

---

## 4. Quick Start

### Backend

```bash
# 1. Move into the backend folder
cd backend

# 2. Install dependencies
npm install

# 3. Copy the env template and fill in your database URL
cp .env.example .env
# → Edit .env and set DATABASE_URL to your PostgreSQL connection string

# 4. Push the Prisma schema to your database (creates the tables)
npx prisma db push

# 5. Start the development server (auto-restarts on file save)
npm run dev
```

The API will be available at **http://localhost:4000**  
Confirm it's running: `curl http://localhost:4000/health`

---

### Frontend

The frontend uses **json-server** as a mock backend during development so you can work independently of the backend team.

```bash
# 1. Move into the frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Install Shadcn UI (one-time setup)
npx shadcn@latest init

# 4. Install React Hook Form
npm install react-hook-form

# 5. Copy the env template
cp .env.example .env.local
# → The default points to the json-server mock. No edits needed to start.

# 6. Start the mock API server (in a separate terminal)
npx json-server --watch db.json --port 5000

# 7. Start the Next.js dev server
npm run dev
```

The app will be available at **http://localhost:3000**

> **Integration (Sprint 4):** When the backend is ready, update `NEXT_PUBLIC_API_URL` in `.env.local` to point to `http://localhost:4000` instead of the mock.

---

## 5. API Contract

Both sides must adhere to this contract exactly. **Do not change field names or types.**

### The Visitor Object

```json
{
  "id": "string (UUID)",
  "fullName": "string",
  "purpose": "string",
  "status": "PENDING | CHECKED_IN | CHECKED_OUT"
}
```

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Server health check |
| `GET` | `/visitors` | List all visitors |
| `POST` | `/visitors` | Register a new visitor |
| `PUT` | `/visitors/:id/checkin` | Mark visitor as CHECKED_IN |
| `PUT` | `/visitors/:id/checkout` | Mark visitor as CHECKED_OUT |

### Example Payloads

**POST /visitors** (request body):
```json
{
  "fullName": "Jane Doe",
  "purpose": "Interview"
}
```

**GET /visitors** (response):
```json
[
  {
    "id": "a1b2c3d4-...",
    "fullName": "Jane Doe",
    "purpose": "Interview",
    "status": "PENDING"
  }
]
```

---

## 6. Environment Variables

### Backend — `backend/.env`

Copy `backend/.env.example` to `backend/.env` and fill in your values.

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/vms` |
| `PORT` | Port the API listens on | `4000` |

### Frontend — `frontend/.env.local`

Copy `frontend/.env.example` to `frontend/.env.local`.

| Variable | Description | Default (mock) |
|----------|-------------|----------------|
| `NEXT_PUBLIC_API_URL` | Base URL for all API calls | `http://localhost:5000` |

---

## 7. Git Workflow

We use a simple **feature-branch** workflow.

### Branch Naming

```
backend/<feature>    e.g. backend/visitor-registration
frontend/<feature>   e.g. frontend/registration-form
```

### Commit Messages

Use the format: `type(scope): short description`

```
feat(backend): add POST /visitors endpoint
fix(frontend): correct status badge colour
refactor(backend): extract visitor service from controller
docs: update README with env variable table
```

### Pull Request Rules

1. **Never commit directly to `main`.**
2. Open a PR when your sprint task is complete.
3. Tag the other intern for a review — cross-team reviews are encouraged.
4. PRs must pass `npm run lint` before merging.

### Recommended Branching Flow

```
main
 └── backend/sprint-1-foundation
 └── backend/sprint-2-registration
 └── frontend/sprint-1-foundation
 └── frontend/sprint-2-registration-form
 ...
```

---

## 8. Sprint Roadmap

See **[Instructions.md](./Instructions.md)** for the full sprint breakdown, SOLID/DRY principles guidance, and the integration protocol for Sprint 4.

---

## Stuck? Common Issues

| Problem | Fix |
|---------|-----|
| `Cannot find module '@prisma/client'` | Run `npx prisma generate` after `npm install` |
| `Error: listen EADDRINUSE :::4000` | Another process is on port 4000. Run `kill $(lport 4000)` or change `PORT` in `.env` |
| `CORS error` in browser | Ensure the backend has `cors()` middleware enabled (it does by default in the scaffold) |
| `json-server` command not found | Run it with `npx`: `npx json-server --watch db.json --port 5000` |
| Prisma schema changes not reflected | Run `npx prisma db push` again after editing `schema.prisma` |
