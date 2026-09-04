import { Router } from 'express';
import { workpieceController } from '../controllers/workpiece.controller';

export const workpieceRouter = Router();

workpieceRouter.post('/orient',          workpieceController.orientWorkpiece);
workpieceRouter.post('/clamp',           workpieceController.clampWorkpiece);
workpieceRouter.post('/establish-zero',  workpieceController.establishPartZero);
workpieceRouter.post('/set-offset',      workpieceController.setWorkOffset);
workpieceRouter.post('/reset',           workpieceController.resetWorkpiece);
