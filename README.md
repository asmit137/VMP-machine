# VMC Operator HMI — Startup Guidance

A responsive full-stack HMI that guides one VMC (Vertical Machining Center) operator
through machine checks, tool loading, workpiece setup, a ready review, and a simulated
operation start/stop.

**Flow:** `POWER ON → MACHINE CHECKS → TOOLS → WORKPIECE → READY → RUNNING`

## Tech stack
- **Client:** React + TypeScript (Vite)
- **API:** Node.js + Express + TypeScript
- **Persistence:** PostgreSQL
- **Tests:** Vitest (workflow gating rules)

The **API is the gatekeeper**: a stage advances only when the server confirms every
item on it is checked, and `Start` only works once all setup stages are complete.
The UI just reflects the server's state.

---

## Documentation
- **[docs/SRS.md](docs/SRS.md)** — Software Requirements Specification (what the system does)
- **[docs/SDD.md](docs/SDD.md)** — Software Design Document (how it is built)

## Project structure

Layered backend (**controller → service → repository**, with the workflow rules
isolated in a pure `domain` layer) and a **pages + components + hooks** frontend.

```
New folder/
├── server/                         # Node + Express + TypeScript API
│   └── src/
│       ├── index.ts                # Entry: init DB, start server
│       ├── app.ts                  # Express app assembly (middleware, routes)
│       ├── config/
│       │   └── env.ts              # Typed config from .env
│       ├── middleware/
│       │   ├── errorHandler.ts     # HmiError -> 400, else 500
│       │   └── notFound.ts         # Unknown /api route -> JSON 404
│       ├── routes/
│       │   ├── index.ts            # Aggregates routers under /api
│       │   └── hmi.routes.ts       # Endpoint -> controller mapping
│       ├── controllers/
│       │   └── hmi.controller.ts   # HTTP request/response layer
│       ├── services/
│       │   └── hmi.service.ts      # Business logic + gating
│       ├── repositories/
│       │   ├── session.repository.ts   # Session data access
│       │   └── item.repository.ts      # Checklist item data access
│       ├── domain/
│       │   ├── workflow.ts         # Pure rules (the gating brain)
│       │   └── workflow.test.ts    # Vitest unit tests
│       ├── data/
│       │   └── scenario.ts         # Preloaded mock job + checklist items
│       ├── db/
│       │   ├── pool.ts             # PostgreSQL connection pool
│       │   ├── schema.sql          # Table definitions
│       │   └── init.ts             # Runs schema + seeds data
│       └── errors/
│           └── HmiError.ts         # Domain error type
│
├── client/                         # React + TypeScript front end (Vite)
│   └── src/
│       ├── App.tsx                 # Stage router (renders one page at a time)
│       ├── main.tsx                # React entry
│       ├── api/
│       │   └── hmiApi.ts           # REST client
│       ├── hooks/
│       │   └── useHmi.ts           # State + actions
│       ├── pages/                  # One page per stage
│       │   ├── PowerOnPage.tsx
│       │   ├── MachineChecksPage.tsx
│       │   ├── ToolsPage.tsx
│       │   ├── WorkpiecePage.tsx
│       │   ├── ReadyReviewPage.tsx
│       │   └── OperationPage.tsx
│       ├── components/             # Reusable UI
│       │   ├── TopBar.tsx
│       │   ├── StepHeader.tsx
│       │   └── ChecklistStage.tsx
│       ├── types/
│       │   └── index.ts            # Shared types
│       └── styles.css              # Responsive, large-touch, accessible
└── README.md
```

**Request flow:** `route → controller → service → repository → PostgreSQL`,
with the service consulting the pure `domain/workflow` rules before any write.

---

## Prerequisites
1. **Node.js 18+** — https://nodejs.org (`node -v` to check)
2. **PostgreSQL 14+** — https://www.postgresql.org/download/windows/
   (or use a free hosted DB such as Neon — see "Deploy" below)

---

## Setup & run locally (Windows PowerShell)

### 1. Create the database
Open **psql** (or pgAdmin) and create an empty database:
```sql
CREATE DATABASE vmc_hmi;
```
The tables and seed data are created automatically when the server first starts.

### 2. Start the API
```powershell
cd "server"
copy .env.example .env
# Edit .env so DATABASE_URL matches your Postgres user/password, e.g.:
# DATABASE_URL=postgresql://postgres:YOURPASSWORD@localhost:5432/vmc_hmi
npm install
npm run dev
```
You should see: `VMC HMI API listening on http://localhost:4000`

### 3. Start the client (in a second terminal)
```powershell
cd "client"
npm install
npm run dev
```
Open the URL Vite prints (usually **http://localhost:5173**). The dev server proxies
`/api` calls to the API on port 4000, so no extra config is needed.

### 4. Run the tests
```powershell
cd "server"
npm test
```

---

## API reference
| Method | Endpoint                    | Purpose                                            |
|--------|-----------------------------|----------------------------------------------------|
| GET    | `/api/scenario`             | The preloaded job (operation, material, tools, …)  |
| GET    | `/api/state`                | Current stage, status, and every checklist item    |
| POST   | `/api/items/:id/confirm`    | Confirm one machine/tool/workpiece item            |
| POST   | `/api/stage/next`           | Advance — **only if the stage is fully confirmed** |
| POST   | `/api/operation/start`      | READY → RUNNING (only when setup is complete)      |
| POST   | `/api/operation/stop`       | RUNNING → STOPPED (preserves the current stage)    |
| POST   | `/api/reset`                | Reset the demo to the first screen                 |
| GET    | `/api/health`               | Liveness + DB check (used by the deploy probe)     |

---

## Deploy to a live URL (single service)

The API serves the built client automatically if `client/dist` exists, so everything
runs at one URL. A `render.yaml` blueprint is included.

### Option A — Render blueprint (one click)
1. Push this repo to GitHub.
2. In Render: **New +** → **Blueprint** → pick the repo. It reads `render.yaml`,
   provisions a free Postgres, wires `DATABASE_URL`, and deploys.
3. Open the service URL — the full HMI is live.

### Option B — any Node host, manually
1. **Create a free Postgres** (Neon / Render / Supabase). Copy its connection string.
2. Configure the service:
   - **Build command:** `cd client && npm install && npm run build && cd ../server && npm install`
   - **Start command:** `cd server && npm start`
   - **Environment:** `DATABASE_URL` = your string, `PGSSL` = `true`
3. Open the service URL.

> No login is required for this demo (single operator, single machine). If the reviewer
> wants one, it can be added, but the assignment does not require it.

---

## How this meets the assignment

| Requirement | Where it is implemented |
|---|---|
| Show one stage at a time | `client/src/App.tsx` renders exactly one page per `currentStage` |
| Confirm each item | `ChecklistStage` + `POST /api/items/:id/confirm` |
| `Next` only after every item confirmed | `domain/workflow.ts` `canAdvance` → `hmi.service.advance` |
| `Start`: READY → RUNNING only when setup complete | `canStart` → `hmi.service.start` |
| `Stop`: RUNNING → STOPPED, preserve stage | `hmi.service.stop` (updates status only) |
| Responsive, large, clear controls | `client/src/styles.css` (56px+ targets, responsive grid) |
| Mock data preloaded | `server/src/data/scenario.ts` |
| API + simple persistence | Express routes + PostgreSQL (`repositories/`, `db/`) |
| Only active instruction, progress, status, controls | one page + `StepHeader` progress rail |

## Design decisions
- **The API is the gatekeeper, not the UI.** Disabled buttons are a convenience; the
  server independently refuses to advance an incomplete stage or start before setup is
  done. The rules live in a pure `domain/` layer so they are unit-testable.
- **Layered backend** (`controller → service → repository`) keeps HTTP, business rules,
  and SQL separate and swappable.
- **Server is the source of truth for state.** Every mutating call returns the full
  fresh state, so the UI never drifts and survives a page reload.

## Testing
```powershell
cd server; npm test
```
- `domain/workflow.test.ts` — the pure gating rules (stage completion, start/stop).
- `services/hmi.service.test.ts` — the service layer with mocked repositories
  (verifies gates are enforced and the data layer is called correctly).
