import type { Request, Response, NextFunction } from 'express';
import { workpieceService } from '../domain/workpiece/workpiece.service';
import { buildHmiState } from '../domain/workflow/workflow.service';

function act(action: () => Promise<void>) {
  return async (_req: Request, res: Response, next: NextFunction) => {
    try {
      await action();
      res.json(await buildHmiState());
    } catch (e) { next(e); }
  };
}

export const workpieceController = {
  orientWorkpiece:   act(() => workpieceService.orientWorkpiece()),
  clampWorkpiece:    act(() => workpieceService.clampWorkpiece()),
  establishPartZero: act(() => workpieceService.establishPartZero()),
  setWorkOffset:     act(() => workpieceService.setWorkOffset('G54')),
  resetWorkpiece:    act(() => workpieceService.resetWorkpiece()),
};
