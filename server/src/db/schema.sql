-- Database schema for the VMC Operator HMI.
-- One operator, one machine -> a single session row plus its checklist items.

CREATE TABLE IF NOT EXISTS sessions (
  id            INTEGER PRIMARY KEY,
  current_stage INTEGER NOT NULL DEFAULT 0,
  status        TEXT    NOT NULL DEFAULT 'READY'
);

CREATE TABLE IF NOT EXISTS items (
  id         TEXT    PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  stage      TEXT    NOT NULL,
  sort_order INTEGER NOT NULL,
  title      TEXT    NOT NULL,
  detail     TEXT    NOT NULL,
  confirmed  BOOLEAN NOT NULL DEFAULT FALSE
);
