import { pool } from '../db/pool';
import { SESSION_ID } from './session.repository';
import { ITEM_SEED } from '../data/scenario';
import type { Item } from '../domain/workflow';

export const itemRepository = {
  async seedIfEmpty(): Promise<void> {
    const { rows } = await pool.query(
      'SELECT COUNT(*)::int AS count FROM items WHERE session_id = $1',
      [SESSION_ID],
    );
    if (rows[0].count > 0) return;

    for (let i = 0; i < ITEM_SEED.length; i++) {
      const it = ITEM_SEED[i];
      await pool.query(
        `INSERT INTO items (id, session_id, stage, sort_order, title, detail, confirmed)
         VALUES ($1, $2, $3, $4, $5, $6, FALSE)`,
        [it.id, SESSION_ID, it.stage, i, it.title, it.detail],
      );
    }
  },

  async all(): Promise<Item[]> {
    const { rows } = await pool.query(
      `SELECT id, stage, sort_order, title, detail, confirmed
       FROM items WHERE session_id = $1 ORDER BY sort_order`,
      [SESSION_ID],
    );
    return rows.map((r) => ({
      id: r.id,
      stage: r.stage,
      sortOrder: r.sort_order,
      title: r.title,
      detail: r.detail,
      confirmed: r.confirmed,
    }));
  },

  // Returns the number of rows changed (0 if the id was unknown).
  async confirm(id: string): Promise<number> {
    const res = await pool.query(
      'UPDATE items SET confirmed = TRUE WHERE id = $1 AND session_id = $2',
      [id, SESSION_ID],
    );
    return res.rowCount ?? 0;
  },

  async resetAll(): Promise<void> {
    await pool.query('UPDATE items SET confirmed = FALSE WHERE session_id = $1', [
      SESSION_ID,
    ]);
  },
};
