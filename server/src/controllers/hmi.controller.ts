import type { Request, Response, NextFunction } from 'express';
import { workflowService } from '../domain/workflow/workflow.service';
import { SCENARIO } from '../data/scenario';

export const hmiController = {
  getScenario(_req: Request, res: Response) {
    res.json(SCENARIO);
  },

  async getState(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await workflowService.buildHmiState());
    } catch (e) { next(e); }
  },

  async nextStage(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await workflowService.advanceStage());
    } catch (e) { next(e); }
  },

  async startOperation(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await workflowService.startOperation());
    } catch (e) { next(e); }
  },

  async stopOperation(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await workflowService.stopOperation());
    } catch (e) { next(e); }
  },

  async reset(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await workflowService.resetSession());
    } catch (e) { next(e); }
  },
};
