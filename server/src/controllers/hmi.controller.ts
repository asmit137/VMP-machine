import type { Request, Response, NextFunction } from 'express';
import { hmiService } from '../services/hmi.service';
import { SCENARIO } from '../data/scenario';

export const hmiController = {
  getScenario(_req: Request, res: Response) {
    res.json(SCENARIO);
  },

  async getState(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await hmiService.getState());
    } catch (e) {
      next(e);
    }
  },

  async confirmItem(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await hmiService.confirmItem(req.params.id));
    } catch (e) {
      next(e);
    }
  },

  async next(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await hmiService.advance());
    } catch (e) {
      next(e);
    }
  },

  async start(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await hmiService.start());
    } catch (e) {
      next(e);
    }
  },

  async stop(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await hmiService.stop());
    } catch (e) {
      next(e);
    }
  },

  async reset(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await hmiService.reset());
    } catch (e) {
      next(e);
    }
  },
};
