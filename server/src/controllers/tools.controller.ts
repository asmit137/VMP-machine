import type { Request, Response, NextFunction } from 'express';
import { toolService } from '../domain/tools/tool.service';
import { buildHmiState } from '../domain/workflow/workflow.service';

export const toolsController = {
  async loadTool(req: Request, res: Response, next: NextFunction) {
    try {
      await toolService.loadTool(req.params.id);
      res.json(await buildHmiState());
    } catch (e) { next(e); }
  },

  async unloadTool(req: Request, res: Response, next: NextFunction) {
    try {
      await toolService.unloadTool(req.params.id);
      res.json(await buildHmiState());
    } catch (e) { next(e); }
  },

  async setToolOffset(req: Request, res: Response, next: NextFunction) {
    try {
      await toolService.setToolOffset(req.params.id);
      res.json(await buildHmiState());
    } catch (e) { next(e); }
  },

  async confirmTool(req: Request, res: Response, next: NextFunction) {
    try {
      await toolService.confirmTool(req.params.id);
      res.json(await buildHmiState());
    } catch (e) { next(e); }
  },

  async resetTool(req: Request, res: Response, next: NextFunction) {
    try {
      await toolService.resetTool(req.params.id);
      res.json(await buildHmiState());
    } catch (e) { next(e); }
  },
};
