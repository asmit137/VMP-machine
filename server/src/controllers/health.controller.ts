import type { Request, Response } from 'express';
import { pool } from '../db/pool';

export const healthController = {
  async check(_req: Request, res: Response) {
    try {
      await pool.query('SELECT 1');
      res.json({ status: 'ok', db: 'up' });
    } catch {
      res.status(503).json({ status: 'degraded', db: 'down' });
    }
  },
};
