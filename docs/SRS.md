# Software Requirements Specification (SRS)
## VMC Operator HMI — Startup Guidance

| | |
|---|---|
| **Project** | VMC Operator HMI (Vertical Machining Center) |
| **Document** | Software Requirements Specification |
| **Version** | 1.0 |
| **Date** | 2026-09-01 |
| **Status** | Draft for review |

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Specific Requirements](#3-specific-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [State Model](#5-state-model)
6. [Requirements Traceability](#6-requirements-traceability)

---

## 1. Introduction

### 1.1 Purpose
This document specifies the requirements for a responsive full-stack **Human-Machine
Interface (HMI)** for a single Vertical Machining Center (VMC) operator. The HMI guides
the operator, after the machine is powered on, through machine checks, tool loading,
workpiece setup and a final readiness review, before enabling a simulated operation
start and stop.

### 1.2 Scope
The system presents a fixed, guided startup sequence:

```
POWER ON → MACHINE CHECKS → TOOLS → WORKPIECE → READY → RUNNING
```

**In scope**
- Guided, one-stage-at-a-time operator workflow.
- Confirmation of each machine, tool and workpiece item.
- Progression gating (a stage advances only when fully confirmed).
- A simulated operation with READY / RUNNING / STOPPED status.
- A REST API and persistence of the operator session.

**Out of scope**
- Order creation and acceptance (a single mock scenario is preloaded).
- Real machine/CNC control or connectivity.
- Multi-operator, multi-machine or authentication features.

### 1.3 Definitions, Acronyms and Abbreviations
| Term | Meaning |
|---|---|
| VMC | Vertical Machining Center |
| HMI | Human-Machine Interface |
| E-stop | Emergency stop |
| Work offset | Coordinate origin for the part (e.g. G54) |
| Stage | One screen/step in the startup sequence |
| Item | A single confirmable check within a stage |
| SRS / SDD | Software Requirements / Design Specification |

### 1.4 References
- Primeform Labs — *VMC Operator HMI — Startup Guidance* (assignment brief).

### 1.5 Overview
Section 2 gives the overall context and users. Section 3 lists the functional
requirements. Section 4 lists non-functional requirements. Section 5 defines the state
model, and Section 6 provides traceability from requirements to verification.

---

## 2. Overall Description

### 2.1 Product Perspective
The HMI is a new, self-contained web application. It is a three-tier system:

```
┌───────────────┐     REST/JSON      ┌───────────────┐      SQL       ┌──────────────┐
│  Web client   │ ─────────────────► │  Application  │ ─────────────► │  PostgreSQL  │
│ (React + TS)  │ ◄───────────────── │  API (Node)   │ ◄───────────── │   database   │
└───────────────┘                    └───────────────┘                └──────────────┘
```

### 2.2 Product Functions (summary)
- Display exactly one stage at a time with the current instruction.
- Let the operator confirm each item on the current stage.
- Unlock the next stage only when every item on the current stage is confirmed.
- Present a consolidated ready review with a clear READY state.
- Start and stop a simulated operation.
- Persist the session so it survives a page reload.

### 2.3 User Characteristics
| Attribute | Description |
|---|---|
| Primary user | One VMC machine operator |
| Environment | Shop floor; likely a tablet or panel PC |
| Interaction principle | The operator follows the single instruction currently displayed |
| Expectation | Large, clear status and action controls; no unrelated menus |

### 2.4 Constraints
- **C-1** The UI must show only one stage at a time.
- **C-2** Controls must be large and clearly labelled.
- **C-3** No features beyond the specified workflow may be added.
- **C-4** Progression rules must be enforced by the server, not only the UI.

### 2.5 Assumptions and Dependencies (preloaded mock scenario)
The following values are assumed and preloaded; order creation is not required.

| Attribute | Value |
|---|---|
| Operation | OP20 — Face & Bore Housing |
| Quantity | 25 |
| Material | Aluminium 6061-T6 |
| Drawing revision | DRW-4471 Rev C |
| CNC program | O2040, Rev 3 |
| Fixture | Vise FX-02 with soft jaws |
| Work offset | G54 |
| Required tools | T01 Face Mill, T02 End Mill, T03 Spot Drill, T04 Drill, T05 Boring Bar |

Dependency: a running PostgreSQL instance and Node.js 18+.

---

## 3. Specific Requirements

### 3.1 External Interface Requirements

**3.1.1 User interface**
- **UI-1** A persistent progress rail shows the five stages and the current position.
- **UI-2** Each stage displays only its own instruction(s) and the essential controls.
- **UI-3** Confirmed items are visually distinct (e.g. green, "✓ Confirmed").
- **UI-4** The primary action button is disabled until its precondition is met.

**3.1.2 Software interface (REST API)**
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/scenario` | Preloaded job details |
| GET | `/api/hmi/state` | Current stage, status and all items |
| POST | `/api/hmi/stage/next` | Advance to the next stage (gated) |
| POST | `/api/hmi/operation/start` | READY → RUNNING (gated) |
| POST | `/api/hmi/operation/stop` | RUNNING → STOPPED |
| POST | `/api/hmi/reset` | Reset the session |
| POST | `/api/machine/simulate/*` | Simulate machine actions (power on, close door, release E-stop, etc.) |
| POST | `/api/tools/:id/*` | Simulate tool actions (load, set-offset, confirm) |
| POST | `/api/workpiece/*` | Simulate workpiece actions (orient, clamp, establish-zero, set-offset) |
| GET | `/api/health` | Liveness and DB check |

### 3.2 Functional Requirements

> Priority: **M** = Must, **S** = Should.

**Stage 1 — Machine checks**
- **FR-1 (M):** The system shall display the machine checks: power/control available,
  E-stop released, guard/door closed, no active alarm, lubrication/coolant ready,
  reference return complete.
- **FR-2 (M):** The machine checks must be completed sequentially. The operator shall trigger simulated machine actions (e.g., closing door, releasing E-stop) to satisfy these checks.

**Stage 2 — Required tools**
- **FR-3 (M):** The system shall display each required tool (tool number and type) for
  the CNC program revision.
- **FR-4 (M):** The operator shall simulate loading, setting the offset, and confirming each tool individually.

**Stage 3 — Workpiece setup**
- **FR-5 (M):** The system shall display fixture, workpiece orientation, clamping
  instruction, material/drawing revision and work offset.
- **FR-6 (M):** The operator shall trigger simulated actions for workpiece orientation, clamping, establishing part zero, and setting the work offset.

**Stage 4 — Ready review**
- **FR-7 (M):** The system shall display the completed machine, tooling and workpiece
  checklist with a clear **READY** state and a single "Proceed to operation" action.

**Stage 5 — Operation**
- **FR-8 (M):** The system shall display the operation name and a status of READY,
  RUNNING or STOPPED.
- **FR-9 (M):** `Start Operation` shall change READY → RUNNING **only when all setup
  stages are complete**.
- **FR-10 (M):** `Stop Operation` shall change RUNNING → STOPPED and **preserve the
  current stage**.

**Cross-cutting**
- **FR-11 (M):** `Next` shall open the following stage **only after every item on the
  current stage is confirmed**; otherwise it shall remain disabled/rejected.
- **FR-12 (M):** The system shall display exactly one stage at a time.
- **FR-13 (M):** The system shall persist the session state (current stage, status,
  item confirmations) and restore it after a page reload.
- **FR-14 (S):** The system shall provide a reset action that returns to the first
  screen (supports demonstration and review).
- **FR-15 (M):** Progression, start and stop rules shall be enforced on the server; an
  invalid request shall be rejected with an error and no state change.

### 3.3 Use-Case Summary
| ID | Actor | Goal |
|---|---|---|
| UC-1 | Operator | Complete machine checks |
| UC-2 | Operator | Load and confirm tools |
| UC-3 | Operator | Set up and confirm the workpiece |
| UC-4 | Operator | Review readiness and proceed |
| UC-5 | Operator | Start and stop the operation |

---

## 4. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-1 | Usability | Large touch targets (≥ 56 px), clear labels, one instruction at a time. |
| NFR-2 | Responsiveness | Usable on tablet and desktop; layout adapts to viewport. |
| NFR-3 | Accessibility | Keyboard operable; ARIA roles for status/alerts; visible focus; high contrast. |
| NFR-4 | Persistence | State stored in PostgreSQL; survives reload and server restart. |
| NFR-5 | Integrity | Server is authoritative for all gating; UI cannot bypass rules. |
| NFR-6 | Performance | Typical API response < 300 ms on the demo dataset. |
| NFR-7 | Reliability | Invalid actions return HTTP 4xx with a clear message; no partial state. |
| NFR-8 | Portability | Runs on Node.js 18+; deployable to a hosted service with managed Postgres. |
| NFR-9 | Maintainability | Layered architecture; workflow rules unit-tested. |
| NFR-10 | Availability | Hosted at an accessible live URL for review. |

---

## 5. State Model

The operator session has a **stage** (0–5) and an operation **status**.

| Stage index | Stage | Advance condition |
|---|---|---|
| 0 | Power on | Operator taps Begin |
| 1 | Machine checks | All machine checks confirmed |
| 2 | Tools | All tools confirmed |
| 3 | Workpiece | All workpiece items confirmed |
| 4 | Ready review | Operator taps Proceed |
| 5 | Operation | (final) Start/Stop controls |

Operation status transitions (at stage 5):
- `READY → RUNNING` on Start (only if all setup complete).
- `RUNNING → STOPPED` on Stop (stage preserved).
- `STOPPED → RUNNING` on Start again.

---

## 6. Requirements Traceability

| Requirement | Verified by |
|---|---|
| FR-11 (Next gating) | Unit test: `canAdvance` / service `advance` |
| FR-9 (Start gating) | Unit test: `canStart` / service `start` |
| FR-10 (Stop preserves stage) | Unit test: `canStop` + service `stop` (no stage change) |
| FR-13 (Persistence) | Manual: reload page, state restored from DB |
| FR-15 (Server-enforced) | Service tests with mocked repositories |
| NFR-1/2/3 (UI) | Manual review on tablet and desktop widths |

---

*End of SRS.*
