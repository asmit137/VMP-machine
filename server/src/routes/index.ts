import { Router } from 'express';
import { hmiRouter }       from './hmi.routes';
import { healthRouter }    from './health.routes';
import { machineRouter }   from './machine.routes';
import { toolsRouter }     from './tools.routes';
import { workpieceRouter } from './workpiece.routes';

export const apiRouter = Router();

apiRouter.use('/health',    healthRouter);
apiRouter.use('/machine',   machineRouter);
apiRouter.use('/tools',     toolsRouter);
apiRouter.use('/workpiece', workpieceRouter);
apiRouter.use('/',          hmiRouter);
