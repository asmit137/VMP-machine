import { Router } from 'express';
import { toolsController } from '../controllers/tools.controller';

export const toolsRouter = Router();

toolsRouter.post('/:id/load',       toolsController.loadTool);
toolsRouter.post('/:id/unload',     toolsController.unloadTool);
toolsRouter.post('/:id/set-offset', toolsController.setToolOffset);
toolsRouter.post('/:id/confirm',    toolsController.confirmTool);
toolsRouter.post('/:id/reset',      toolsController.resetTool);
