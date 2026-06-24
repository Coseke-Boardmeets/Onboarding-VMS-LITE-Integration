# VMS Lite — Frontend

The frontend for the **Visitor Management System** intern project.  
Built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4**, and **Shadcn UI**.

> **New here?** Read the root [README.md](../README.md) first — it covers prerequisites, setup, and the full project overview.

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Shadcn UI (first time only)

```bash
npx shadcn@latest init
```

Follow the prompts to configure your components directory and style preferences.

### 3. Install React Hook Form

```bash
npm install react-hook-form
```

### 4. Configure your environment

```bash
cp .env.example .env.local
```

The default `.env.local` points to the **json-server mock** at `http://localhost:5000`. No edits needed to start development. You will only change this in Sprint 4 when integrating with the real backend.

### 5. Start the mock API (in a separate terminal)

```bash
npx json-server --watch db.json --port 5000
```

Verify it's running by opening `http://localhost:5000/visitors` — you should see 4 pre-seeded visitors.

### 6. Start the dev server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**

---

## Project Structure

```
frontend/
├── src/
│   └── app/
│       ├── layout.tsx        # Root layout (fonts, global styles)
│       └── page.tsx          # Entry page
├── db.json                   # json-server seed data (mock backend)
├── .env.example              # Environment variable template
└── package.json
```

As you build out the sprints, you'll add:

```
src/
├── app/
│   ├── page.tsx              # Reception Dashboard
│   └── register/
│       └── page.tsx          # Visitor Registration Form
├── components/
│   ├── VisitorForm.tsx       # Registration form component
│   └── VisitorTable.tsx      # Dashboard table component
└── lib/
    └── apiClient.ts          # Single API client (all fetch calls go here)
```

---

## Key Libraries

| Library | Purpose | Docs |
|---------|---------|------|
| Next.js 16 | React framework & routing | https://nextjs.org/docs |
| Shadcn UI | Pre-built accessible components | https://ui.shadcn.com |
| React Hook Form | Form state & validation | https://react-hook-form.com |
| Tailwind CSS v4 | Utility-first styling | https://tailwindcss.com/docs |

---

## Sprint Checklist

See [Instructions.md](../Instructions.md) for the full sprint breakdown with task-by-task checklists.

| Sprint | Goal |
|--------|------|
| 1 — Foundation | Setup, mock server, `apiClient.ts` |
| 2 — Registration | Visitor registration form |
| 3 — Dashboard | Visitor table with check-in/out actions |
| 4 — Integration | Switch to real backend, end-to-end testing |

---

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Run production build
npm run lint     # Run ESLint
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Base URL for all API calls. Defaults to `http://localhost:5000` (mock). Change to `http://localhost:4000` for Sprint 4 integration. |
