# VMC Operator HMI — Startup Guidance

A responsive full-stack HMI that guides one VMC (Vertical Machining Center) operator
through machine checks, tool loading, workpiece setup, a ready review, and a simulated
operation start/stop.

**Flow:** `POWER ON → MACHINE CHECKS → TOOLS → WORKPIECE → READY → RUNNING`

---

## Tech Stack

| Layer        | Technology                                      |
|--------------|-------------------------------------------------|
| **Frontend** | React 18 + TypeScript — Vite 5                  |
| **Backend**  | Node.js 18+ + Express 4 + TypeScript            |
| **Database** | PostgreSQL 14+                                  |
| **Testing**  | Vitest 2 (pure domain rules — no I/O required)  |
| **Runtime**  | `tsx` (zero-build dev server)                   |

The **API is the gatekeeper**: a stage advances only when the server confirms every
item on it is checked, and `Start` only works once all setup stages are complete.
The UI just reflects the server's state.

---

## Project Structure

Layered backend (**controller → service → domain → db**) with each domain concern
(machine, tools, workpiece, workflow) isolated in its own sub-module, and a
**pages + components + hooks** frontend.

```text
VMP-assignment/
├── client/                             # React + TypeScript front end (Vite)
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── vercel.json                     # Vercel SPA routing rewrites
│   └── src/
│       ├── main.tsx                    # React entry point
│       ├── App.tsx                     # Stage router (renders one page per stage)
│       ├── styles.css                  # Responsive, large-touch, accessible CSS
│       ├── api/
│       │   └── hmiApi.ts               # REST client (all fetch calls in one place)
│       ├── hooks/
│       │   └── useHmi.ts               # State + actions (single source of truth)
│       ├── pages/                      # One page component per workflow stage
│       │   ├── PowerOnPage.tsx
│       │   ├── MachineChecksPage.tsx
│       │   ├── ToolsPage.tsx
│       │   ├── WorkpiecePage.tsx
│       │   ├── ReadyReviewPage.tsx
│       │   └── OperationPage.tsx
│       ├── components/                 # Reusable UI primitives
│       │   ├── TopBar.tsx              # App title + status bar
│       │   ├── StepHeader.tsx          # Progress rail across stages
│       │   ├── ChecklistStage.tsx      # Generic checklist wrapper
│       │   └── SubstageList.tsx        # Expandable sub-stage item list
│       └── types/
│           └── index.ts                # Shared TypeScript interfaces & enums
│
└── server/                             # Express API + PostgreSQL back end
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts                    # Entry point — starts the HTTP server
        ├── app.ts                      # Express app factory (middleware + routes)
        ├── config/
        │   └── env.ts                  # Typed, validated config from .env
        ├── routes/                     # URL → controller mapping
        │   ├── index.ts                # Aggregates all routers under /api
        │   ├── hmi.routes.ts           # Workflow-level routes (state, reset, start/stop)
        │   ├── machine.routes.ts       # Machine-check sub-stage routes
        │   ├── tools.routes.ts         # Tool-check routes
        │   ├── workpiece.routes.ts     # Workpiece-check routes
        │   └── health.routes.ts        # Liveness + DB check
        ├── controllers/                # HTTP request / response layer (thin)
        │   ├── hmi.controller.ts       # Stage advance, operation start/stop, reset
        │   ├── machine.controller.ts   # Machine check confirm / status
        │   ├── tools.controller.ts     # Tool confirm / status
        │   ├── workpiece.controller.ts # Workpiece confirm / status
        │   └── health.controller.ts    # Health-check response
        ├── domain/                     # Pure business logic — no I/O, fully testable
        │   ├── machine/
        │   │   ├── machine.types.ts        # Machine check types & interfaces
        │   │   ├── machineChecks.ts        # Machine-check rules (pure functions)
        │   │   ├── machine.service.ts      # Machine service (rules + repo orchestration)
        │   │   └── __tests__/
        │   │       └── machineChecks.test.ts
        │   ├── tools/
        │   │   ├── tool.types.ts           # Tool types & interfaces
        │   │   ├── toolChecks.ts           # Tool-check rules (pure functions)
        │   │   ├── tool.service.ts         # Tool service
        │   │   └── __tests__/
        │   │       └── toolChecks.test.ts
        │   ├── workpiece/
        │   │   ├── workpiece.types.ts      # Workpiece types & interfaces
        │   │   ├── workpieceChecks.ts      # Workpiece-check rules (pure functions)
        │   │   ├── workpiece.service.ts    # Workpiece service
        │   │   └── __tests__/
        │   │       └── workpieceChecks.test.ts
        │   └── workflow/
        │       ├── workflow.types.ts       # Stage & status enums, shared types
        │       ├── workflowRules.ts        # Gating rules: canAdvance, canStart, canStop
        │       ├── workflow.service.ts     # Orchestrates state transitions end-to-end
        │       └── __tests__/
        │           └── workflowRules.test.ts
        ├── data/
        │   ├── scenario.ts             # Preloaded mock job + checklist items
        │   └── stages.ts               # Stage ordering / metadata
        ├── db/
        │   ├── pool.ts                 # PostgreSQL connection pool (pg)
        │   ├── schema.sql              # Table definitions (CREATE TABLE …)
        │   └── init.ts                 # Runs schema + seeds data on startup
        ├── middleware/
        │   ├── errorHandler.ts         # HmiError → 400, unhandled → 500
        │   └── notFound.ts             # Unknown /api route → JSON 404
        └── errors/
            └── HmiError.ts             # Typed domain error class
```

**Request flow:**
```
HTTP Request
  → route
  → controller        (parse req, call service, send res)
  → domain/service    (enforce business rules via pure domain functions)
  → db / repository   (PostgreSQL via pg pool)
  → response
```

---

## Prerequisites

1. **Node.js 18+** — https://nodejs.org (`node -v` to check)
2. **PostgreSQL 14+** — https://www.postgresql.org/download/windows/
   (or use a free hosted DB such as [Neon](https://neon.tech) / [Render](https://render.com))

---

## Setup & Run Locally (Windows PowerShell)

### 1. Create the database
Open **psql** (or pgAdmin) and create an empty database:
```sql
CREATE DATABASE vmc_hmi;
```
Tables and seed data are created automatically when the server first starts.

### 2. Start the API (Backend)
```powershell
cd server
copy .env.example .env
# Edit .env — set DATABASE_URL to match your Postgres credentials, e.g.:
# DATABASE_URL=postgresql://postgres:YOURPASSWORD@localhost:5432/vmc_hmi
npm install
npm run dev
```
Expected output: `VMC HMI API listening on http://localhost:4000`

### 3. Start the Client (Frontend) *(second terminal)*
```powershell
cd client
npm install
npm run dev
```
Open the URL Vite prints (usually **http://localhost:5173**).
The Vite dev server proxies all `/api` calls to port 4000 automatically.

### 4. Run the Tests
```powershell
cd server
npm test
```

---

## API Reference

| Method | Endpoint                        | Purpose                                                    |
|--------|---------------------------------|------------------------------------------------------------|
| GET    | `/api/scenario`                 | Preloaded job (operation, material, tools, etc.)           |
| GET    | `/api/state`                    | Current stage, status, and every checklist item            |
| POST   | `/api/stage/next`               | Advance stage — **only if every item is confirmed**        |
| POST   | `/api/operation/start`          | READY → RUNNING (only when all setup stages complete)      |
| POST   | `/api/operation/stop`           | RUNNING → STOPPED (preserves the current stage)            |
| POST   | `/api/reset`                    | Reset demo back to the first screen                        |
| GET    | `/api/machine/checks`           | List all machine-check sub-stages + items                  |
| POST   | `/api/machine/checks/:id`       | Confirm a single machine-check item                        |
| GET    | `/api/tools`                    | List all tool-check items                                  |
| POST   | `/api/tools/:id`                | Confirm a single tool item                                 |
| GET    | `/api/workpiece`                | List all workpiece-check items                             |
| POST   | `/api/workpiece/:id`            | Confirm a single workpiece item                            |
| GET    | `/api/health`                   | Liveness + DB check (used by deploy probes)                |

---

## Testing

```powershell
cd server
npm test
```

| Test file                                              | What it covers                                               |
|--------------------------------------------------------|--------------------------------------------------------------|
| `domain/machine/__tests__/machineChecks.test.ts`       | Machine-check pure rules (all items confirmed, partial, etc) |
| `domain/tools/__tests__/toolChecks.test.ts`            | Tool-check pure rules                                        |
| `domain/workpiece/__tests__/workpieceChecks.test.ts`   | Workpiece-check pure rules                                   |
| `domain/workflow/__tests__/workflowRules.test.ts`      | Stage gating rules (canAdvance, canStart, canStop)           |

All domain tests are **pure unit tests** — no database, no HTTP, no mocks required.

---

## Deployment (Separated Architecture)

The project is designed to deploy as two independent services.

### 1. Backend → Render

| Setting          | Value                          |
|------------------|--------------------------------|
| Root Directory   | `server`                       |
| Environment      | Node                           |
| Build Command    | `npm install && npm run build` |
| Start Command    | `npm start`                    |
| Env Variable     | `DATABASE_URL=<your-pg-url>`   |

After deployment, copy the live `.onrender.com` URL.

### 2. Frontend → Vercel

| Setting          | Value                                          |
|------------------|------------------------------------------------|
| Root Directory   | `client`                                       |
| Framework Preset | Vite                                           |
| Env Variable     | `VITE_API_URL=https://your-api.onrender.com`   |

`client/vercel.json` handles React SPA routing rewrites automatically.

> No authentication is required for this demo (single operator, single machine).

---

## How This Meets the Assignment

| Requirement                            | Implementation                                                           |
|----------------------------------------|--------------------------------------------------------------------------|
| Show one stage at a time               | `App.tsx` renders exactly one page per `currentStage`                    |
| Confirm each item before advancing     | `SubstageList` + `POST /api/machine/checks/:id`, `/api/tools/:id`, etc.  |
| `Next` only after all items confirmed  | `workflowRules.ts` `canAdvance` → `workflow.service.advance`             |
| `Start`: READY → RUNNING when complete | `canStart` → `workflow.service.start`                                    |
| `Stop`: RUNNING → STOPPED, keep stage  | `workflow.service.stop` (updates status only, stage unchanged)           |
| Responsive, large, clear controls      | `styles.css` (56 px+ touch targets, responsive grid)                     |
| Mock data preloaded                    | `server/src/data/scenario.ts`                                            |
| API + simple persistence               | Express routes + PostgreSQL (`domain/*/`, `db/`)                         |
| Only active instruction shown          | One page per stage + `StepHeader` progress rail                          |

---

## Design Decisions

- **The API is the gatekeeper, not the UI.** Disabled buttons are a UX convenience;
  the server independently refuses to advance an incomplete stage or start before all
  setup is done. Rules live in pure `domain/` functions — zero I/O, fully unit-testable.

- **Domain-driven folder layout.** Each concern (machine, tools, workpiece, workflow)
  owns its types, rules, service, and tests in one co-located sub-folder. Adding a new
  check category is a self-contained change with no cross-cutting edits.

- **Layered backend** (`controller → service → domain → db`) keeps HTTP, business
  rules, and SQL separate and independently swappable.

- **Server is the single source of truth for state.** Every mutating call returns the
  full fresh state, so the UI never drifts and survives a page reload without any
  client-side cache invalidation logic.
