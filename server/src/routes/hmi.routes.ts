import { Router } from 'express';
import { hmiController } from '../controllers/hmi.controller';

export const hmiRouter = Router();

hmiRouter.get('/scenario', hmiController.getScenario);
hmiRouter.get('/hmi/state', hmiController.getState);
hmiRouter.post('/hmi/stage/next', hmiController.nextStage);
hmiRouter.post('/hmi/operation/start', hmiController.startOperation);
hmiRouter.post('/hmi/operation/stop', hmiController.stopOperation);
hmiRouter.post('/hmi/reset', hmiController.reset);
