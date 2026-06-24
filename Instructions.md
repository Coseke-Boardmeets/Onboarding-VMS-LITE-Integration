# VMS Lite — Project Instructions

This document is your day-to-day working guide. Read the root [README.md](../README.md) first for setup and prerequisites.

---

## 1. Project Overview & API Contract

We are building a simplified **Visitor Management System** with two core features:

- A **registration form** for pre-registering visitors
- A **reception dashboard** for managing check-in and check-out

Frontend and backend are developed **in parallel**. To stay unblocked, both sides must adhere strictly to this shared contract.

### The Visitor Object

```ts
type Visitor = {
  id: string;         // UUID assigned by the backend
  fullName: string;   // Visitor's full name
  purpose: string;    // Reason for the visit
  status: "PENDING" | "CHECKED_IN" | "CHECKED_OUT";
};
```

### Core Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Confirms the API is running |
| `GET` | `/visitors` | Returns all visitors (array) |
| `POST` | `/visitors` | Registers a new visitor |
| `PUT` | `/visitors/:id/checkin` | Sets status → `CHECKED_IN`, records `timeIn` |
| `PUT` | `/visitors/:id/checkout` | Sets status → `CHECKED_OUT`, records `timeOut` |

---

## 2. Frontend Sprint Breakdown (Next.js + Shadcn)

**Goal:** Build the UI rapidly using Shadcn components and mock the API with `json-server` so you are not blocked by the backend team.

### Sprint 1 — Foundation & Mocking

**Objective:** Get a working environment before writing any feature code.

- [ ] Copy `.env.example` to `.env.local` (API URL defaults to the mock server — no edits needed)
- [ ] Start the mock API: `npx json-server --watch db.json --port 5000`
- [ ] Verify the mock is working: open `http://localhost:5000/visitors` in your browser — you should see 4 seed visitors
- [ ] Run the dev server: `npm run dev`
- [ ] Initialise Shadcn: `npx shadcn@latest init`
- [ ] Install React Hook Form: `npm install react-hook-form`

> **DRY Principle:** All API calls must go through the single `src/lib/apiClient.ts` file. Never call `fetch()` directly inside a React component or page. Open that file — it has `get`, `post`, and `put` methods for you to implement.

---

### Sprint 2 — Visitor Registration Form

**Objective:** Let a visitor (or receptionist) pre-register online.

- [ ] Build a `VisitorForm` component using **React Hook Form** and **Shadcn** `<Input>` and `<Button>` components
- [ ] Fields: `fullName` (required), `purpose` (required)
- [ ] On submit: `POST /visitors` via `apiClient`
- [ ] Show a success toast or alert after a successful registration
- [ ] Handle and display validation errors (empty fields)

---

### Sprint 3 — Reception Dashboard

**Objective:** Give reception staff a live view of all visitors and quick actions.

- [ ] Fetch and display all visitors from `GET /visitors` using a data table (Shadcn `<Table>`)
- [ ] Show a status badge for each visitor (`PENDING`, `CHECKED_IN`, `CHECKED_OUT`) with distinct colours
- [ ] Add a **Check In** button that calls `PUT /visitors/:id/checkin` (only visible for `PENDING` visitors)
- [ ] Add a **Check Out** button that calls `PUT /visitors/:id/checkout` (only visible for `CHECKED_IN` visitors)
- [ ] Refresh the visitor list automatically after each action

---

### Sprint 4 — Integration (Handover)

**Objective:** Switch from the mock to the real backend.

- [ ] In `.env.local`, change `NEXT_PUBLIC_API_URL` to `http://localhost:4000`
- [ ] Confirm the health check: `GET /health` returns `{ "status": "ok" }`
- [ ] Test visitor registration — confirm the record appears in the backend database (ask the backend intern to check **Prisma Studio**: `npx prisma studio`)
- [ ] Test check-in and check-out end-to-end

---

## 3. Backend Sprint Breakdown (Express + Prisma)

**Goal:** Build a robust, SOLID REST API using Express and Prisma ORM to interact with a PostgreSQL database.

### Sprint 1 — Foundation

**Objective:** Get the server running with a database connection.

- [ ] Copy `.env.example` to `.env` and set your `DATABASE_URL`
- [ ] Run `npx prisma db push` to create the `Visitor` table
- [ ] Run `npm run dev` and confirm `GET /health` returns `{ "status": "ok" }`

> The scaffold already provides `server.ts`, routes, controller, service, and validation middleware. Read through each file carefully — understand the layered structure before adding code.

---

### Sprint 2 — Visitor Registration

**Objective:** Allow new visitors to be created via the API.

- [ ] Review `src/middleware/validation.middleware.ts` — understand how it validates the request body
- [ ] Review `src/services/visitor.service.ts` — implement the `create()` function to save a visitor using Prisma
- [ ] Test using a REST client (e.g., Postman or curl):

```bash
curl -X POST http://localhost:4000/visitors \
  -H "Content-Type: application/json" \
  -d '{"fullName": "Test Visitor", "purpose": "Interview"}'
```

---

### Sprint 3 — Dashboard Operations (Get, Check In, Check Out)

**Objective:** Complete the remaining API endpoints.

- [ ] Implement `findAll()` in the service to return all visitors
- [ ] Implement `checkIn()` — update `status` to `CHECKED_IN` and set `timeIn`
- [ ] Implement `checkOut()` — update `status` to `CHECKED_OUT` and set `timeOut`
- [ ] Test all three using Postman or curl

```bash
# Get all visitors
curl http://localhost:4000/visitors

# Check in a visitor (replace <id> with a real UUID from the previous response)
curl -X PUT http://localhost:4000/visitors/<id>/checkin
```

---

### Sprint 4 — Refactoring & SOLID Enforcement

**Objective:** Clean up before integration.

- [ ] Confirm your controller **never imports** `PrismaClient` directly — all Prisma calls must go through the service
- [ ] Confirm your routes file contains **only** route definitions — no logic
- [ ] Confirm `server.ts` contains **only** app initialisation — no route handlers
- [ ] Run `npm run build` to check for TypeScript errors before the handover

> **SOLID Principle Reminder:**  
> - **S** — Each file has one job: routes define paths, controllers handle HTTP, services talk to the DB  
> - **O** — Add new routes by extending `visitor.routes.ts`, not by modifying the controller  
> - **D** — The controller calls the service interface, not Prisma directly

---

## 4. The Integration Protocol

Once the backend completes Sprint 3, the frontend runs Sprint 4:

1. **Health Check** — Frontend intern updates `NEXT_PUBLIC_API_URL` to `http://localhost:4000` and confirms `GET /health` responds.

2. **Data Sync** — Verify that the `Visitor` object returned by the API matches the TypeScript type defined in Section 1 exactly. Pay attention to:
   - `id` is a UUID string (not a number)
   - `status` is one of the three exact string values

3. **Cross-Testing** — Frontend intern registers a new visitor through the UI. Backend intern opens **Prisma Studio** (`npx prisma studio`) and confirms the record was saved to the database.

4. **Sign-off** — Both interns open a joint PR to `main` that includes the backend completion + the frontend integration switch. Both must review each other's code before merging.