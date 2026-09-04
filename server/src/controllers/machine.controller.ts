import type { Request, Response, NextFunction } from 'express';
import { machineService } from '../domain/machine/machine.service';
import { buildHmiState } from '../domain/workflow/workflow.service';

function simulate(action: () => Promise<void>) {
  return async (_req: Request, res: Response, next: NextFunction) => {
    try {
      await action();
      res.json(await buildHmiState());
    } catch (e) { next(e); }
  };
}

export const machineController = {
  closeDoor:           simulate(() => machineService.closeDoor()),
  openDoor:            simulate(() => machineService.openDoor()),
  releaseEstop:        simulate(() => machineService.releaseEstop()),
  pressEstop:          simulate(() => machineService.pressEstop()),
  triggerAlarm:        simulate(() => machineService.triggerAlarm()),
  clearAlarm:          simulate(() => machineService.clearAlarm()),
  completeReference:   simulate(() => machineService.completeReference()),
  resetReference:      simulate(() => machineService.resetReference()),
  setPowerOn:          simulate(() => machineService.setPowerOn()),
  setLubricationReady: simulate(() => machineService.setLubricationReady()),
  setCoolantReady:     simulate(() => machineService.setCoolantReady()),
};
