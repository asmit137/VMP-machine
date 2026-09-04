import { Router } from 'express';
import { machineController } from '../controllers/machine.controller';

export const machineRouter = Router();

machineRouter.post('/simulate/door/close',      machineController.closeDoor);
machineRouter.post('/simulate/door/open',       machineController.openDoor);
machineRouter.post('/simulate/estop/release',   machineController.releaseEstop);
machineRouter.post('/simulate/estop/press',     machineController.pressEstop);
machineRouter.post('/simulate/alarm/trigger',   machineController.triggerAlarm);
machineRouter.post('/simulate/alarm/clear',     machineController.clearAlarm);
machineRouter.post('/simulate/reference/complete', machineController.completeReference);
machineRouter.post('/simulate/reference/reset', machineController.resetReference);
machineRouter.post('/simulate/power/on',        machineController.setPowerOn);
machineRouter.post('/simulate/lubrication/ready', machineController.setLubricationReady);
machineRouter.post('/simulate/coolant/ready',   machineController.setCoolantReady);
