import { pool } from '../db/pool';
import type { Status } from '../domain/workflow';

// One operator, one machine -> a single fixed session id.
export const SESSION_ID = 1;

export const sessionRepository = {
  async ensure(): Promise<void> {
    await pool.query(
      `INSERT INTO sessions (id, current_stage, status)
       VALUES ($1, 0, 'READY')
       ON CONFLICT (id) DO NOTHING`,
      [SESSION_ID],
    );
  },

  async get(): Promise<{ currentStage: number; status: Status }> {
    const { rows } = await pool.query(
      'SELECT current_stage, status FROM sessions WHERE id = $1',
      [SESSION_ID],
    );
    return { currentStage: rows[0].current_stage, status: rows[0].status as Status };
  },

  async setStage(stage: number): Promise<void> {
    await pool.query('UPDATE sessions SET current_stage = $1 WHERE id = $2', [
      stage,
      SESSION_ID,
    ]);
  },

  async setStatus(status: Status): Promise<void> {
    await pool.query('UPDATE sessions SET status = $1 WHERE id = $2', [
      status,
      SESSION_ID,
    ]);
  },

  async reset(): Promise<void> {
    await pool.query(
      "UPDATE sessions SET current_stage = 0, status = 'READY' WHERE id = $1",
      [SESSION_ID],
    );
  },
};
