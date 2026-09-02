import { Router } from 'express';
import { hmiController } from '../controllers/hmi.controller';

export const hmiRouter = Router();

hmiRouter.get('/scenario', hmiController.getScenario);
hmiRouter.get('/state', hmiController.getState);
hmiRouter.post('/items/:id/confirm', hmiController.confirmItem);
hmiRouter.post('/stage/next', hmiController.next);
hmiRouter.post('/operation/start', hmiController.start);
hmiRouter.post('/operation/stop', hmiController.stop);
hmiRouter.post('/reset', hmiController.reset);
