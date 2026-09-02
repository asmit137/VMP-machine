import express from 'express';
import cors from 'cors';

import { apiRouter } from './routes';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  
  app.use(cors());
  app.use(express.json());

  
  app.use('/api', apiRouter);
  app.use('/api', notFound); // unknown /api/* -> JSON 404

  
  app.get('/', (_req, res) => {
    res.send('VMC Backend API is running.');
  });

  
  app.use(errorHandler);

  return app;
}
