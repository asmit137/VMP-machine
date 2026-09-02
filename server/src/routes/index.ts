import { Router } from 'express';
import { hmiRouter } from './hmi.routes';
import { healthRouter } from './health.routes';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/', hmiRouter);
