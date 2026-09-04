import type { Request, Response, NextFunction } from 'express';
import { HmiError } from '../errors/HmiError';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof HmiError) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.statusCode === 409 ? 'STAGE_NOT_READY' : 'HMI_ERROR',
      error: err.message,
      message: err.message,
    });
  }

  console.error('API Error:', err);
  const errorMessage = err instanceof Error ? err.message : 'Unknown internal error';

  res.status(500).json({
    success: false,
    code: 'INTERNAL_ERROR',
    error: errorMessage,
    message: errorMessage,
  });
}
