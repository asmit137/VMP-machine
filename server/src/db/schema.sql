-- VMC Operator HMI — Domain-oriented schema (v2).
-- Full migration: drops all old tables and recreates with domain model.

-- Drop old v1 tables
DROP TABLE IF EXISTS checklist_items CASCADE;
DROP TABLE IF EXISTS session CASCADE;

-- Drop v2 tables to allow clean re-creation on schema changes
DROP TABLE IF EXISTS workpiece_setup CASCADE;
DROP TABLE IF EXISTS tools CASCADE;
DROP TABLE IF EXISTS machine_state CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;

CREATE TABLE sessions (
  id              SERIAL PRIMARY KEY,
  current_stage   TEXT    NOT NULL DEFAULT 'POWER_ON',
  operation_state TEXT    NOT NULL DEFAULT 'STOPPED',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE machine_state (
  id                 SERIAL PRIMARY KEY,
  session_id         INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  power_available    BOOLEAN NOT NULL DEFAULT FALSE,
  estop_released     BOOLEAN NOT NULL DEFAULT FALSE,
  door_closed        BOOLEAN NOT NULL DEFAULT FALSE,
  alarm_active       BOOLEAN NOT NULL DEFAULT FALSE,
  lubrication_ready  BOOLEAN NOT NULL DEFAULT FALSE,
  coolant_ready      BOOLEAN NOT NULL DEFAULT FALSE,
  reference_complete BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tools (
  id                  TEXT    PRIMARY KEY,
  session_id          INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  tool_number         TEXT    NOT NULL,
  name                TEXT    NOT NULL,
  required            BOOLEAN NOT NULL DEFAULT TRUE,
  loaded              BOOLEAN NOT NULL DEFAULT FALSE,
  tool_number_correct BOOLEAN NOT NULL DEFAULT FALSE,
  type_correct        BOOLEAN NOT NULL DEFAULT FALSE,
  offset_available    BOOLEAN NOT NULL DEFAULT FALSE,
  confirmed           BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE workpiece_setup (
  id                    SERIAL PRIMARY KEY,
  session_id            INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  fixture               TEXT    NOT NULL DEFAULT '',
  orientation_correct   BOOLEAN NOT NULL DEFAULT FALSE,
  clamped               BOOLEAN NOT NULL DEFAULT FALSE,
  part_zero_established BOOLEAN NOT NULL DEFAULT FALSE,
  work_offset           TEXT,
  work_offset_set       BOOLEAN NOT NULL DEFAULT FALSE,
  material              TEXT    NOT NULL DEFAULT '',
  drawing_revision      TEXT    NOT NULL DEFAULT '',
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
