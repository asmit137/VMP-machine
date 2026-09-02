
import type { Request, Response, NextFunction } from 'express';
import { pool } from '../db/pool';
import { SCENARIO } from '../data/scenario';
import { HmiError } from '../errors/HmiError';

export const hmiController = {
  getScenario(_req: Request, res: Response) {
    res.json(SCENARIO);
  },

  async getState(_req: Request, res: Response, next: NextFunction) {
    try {
      const { rows: sessions } = await pool.query('SELECT current_stage as "currentStage", status FROM session LIMIT 1');
      const { rows: items } = await pool.query('SELECT id, stage, title, confirmed FROM checklist_items ORDER BY id');
      
      res.json({
        currentStage: sessions[0]?.currentStage || 'POWER_ON',
        status: sessions[0]?.status || 'STOPPED',
        checklist: items
      });
    } catch (e) { next(e); }
  },

  async confirmItem(req: Request, res: Response, next: NextFunction) {
    try {
      await pool.query('UPDATE checklist_items SET confirmed = true WHERE id = $1', [req.params.id]);
      
      const { rows: sessions } = await pool.query('SELECT current_stage as "currentStage", status FROM session LIMIT 1');
      const { rows: items } = await pool.query('SELECT id, stage, title, confirmed FROM checklist_items ORDER BY id');
      
      res.json({
        currentStage: sessions[0]?.currentStage || 'POWER_ON',
        status: sessions[0]?.status || 'STOPPED',
        checklist: items
      });
    } catch (e) { next(e); }
  },

  async next(_req: Request, res: Response, next: NextFunction) {
    try {
      const STAGES = ['POWER_ON', 'MACHINE_CHECKS', 'TOOLS', 'WORKPIECE', 'READY_REVIEW', 'OPERATION'];
      const { rows: sessions } = await pool.query('SELECT current_stage as "currentStage" FROM session LIMIT 1');
      const current = sessions[0]?.currentStage || 'POWER_ON';
      
      
      const { rows: items } = await pool.query('SELECT confirmed FROM checklist_items WHERE stage = $1', [current]);
      if (items.some(i => !i.confirmed)) {
        throw new HmiError('Complete all checklist items first');
      }

      const idx = STAGES.indexOf(current);
      if (idx < STAGES.length - 1) {
        await pool.query('UPDATE session SET current_stage = $1', [STAGES[idx + 1]]);
      }
      
      const { rows: newSessions } = await pool.query('SELECT current_stage as "currentStage", status FROM session LIMIT 1');
      const { rows: allItems } = await pool.query('SELECT id, stage, title, confirmed FROM checklist_items ORDER BY id');
      
      res.json({
        currentStage: newSessions[0]?.currentStage || 'POWER_ON',
        status: newSessions[0]?.status || 'STOPPED',
        checklist: allItems
      });
    } catch (e) { next(e); }
  },

  async start(_req: Request, res: Response, next: NextFunction) {
    try {
      const { rows: sessions } = await pool.query('SELECT current_stage as "currentStage" FROM session LIMIT 1');
      if (sessions[0]?.currentStage !== 'OPERATION') {
        throw new HmiError('Machine not ready');
      }
      
      await pool.query('UPDATE session SET status = $1', ['RUNNING']);
      
      const { rows: newSessions } = await pool.query('SELECT current_stage as "currentStage", status FROM session LIMIT 1');
      const { rows: allItems } = await pool.query('SELECT id, stage, title, confirmed FROM checklist_items ORDER BY id');
      
      res.json({
        currentStage: newSessions[0]?.currentStage || 'POWER_ON',
        status: newSessions[0]?.status || 'STOPPED',
        checklist: allItems
      });
    } catch (e) { next(e); }
  },

  async stop(_req: Request, res: Response, next: NextFunction) {
    try {
      await pool.query('UPDATE session SET status = $1', ['STOPPED']);
      
      const { rows: sessions } = await pool.query('SELECT current_stage as "currentStage", status FROM session LIMIT 1');
      const { rows: items } = await pool.query('SELECT id, stage, title, confirmed FROM checklist_items ORDER BY id');
      
      res.json({
        currentStage: sessions[0]?.currentStage || 'POWER_ON',
        status: sessions[0]?.status || 'STOPPED',
        checklist: items
      });
    } catch (e) { next(e); }
  },

  async reset(_req: Request, res: Response, next: NextFunction) {
    try {
      await pool.query('UPDATE session SET current_stage = $1, status = $2', ['POWER_ON', 'STOPPED']);
      await pool.query('UPDATE checklist_items SET confirmed = false');
      
      const { rows: sessions } = await pool.query('SELECT current_stage as "currentStage", status FROM session LIMIT 1');
      const { rows: items } = await pool.query('SELECT id, stage, title, confirmed FROM checklist_items ORDER BY id');
      
      res.json({
        currentStage: sessions[0]?.currentStage || 'POWER_ON',
        status: sessions[0]?.status || 'STOPPED',
        checklist: items
      });
    } catch (e) { next(e); }
  }
};
