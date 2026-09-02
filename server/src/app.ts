import express from 'express';
import cors from 'cors';

import { apiRouter } from './routes';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  // --- global middleware ---
  app.use(cors());
  app.use(express.json());

  // --- API routes ---
  app.use('/api', apiRouter);
  app.use('/api', notFound); // unknown /api/* -> JSON 404

  // --- Root route ---
  app.get('/', (_req, res) => {
    res.send('VMC Backend API is running.');
  });


  // --- error handler (last) ---
  app.use(errorHandler);

  return app;
}
