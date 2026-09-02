import type { Request, Response, NextFunction } from 'express';
import { HmiError } from '../errors/HmiError';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof HmiError) {
    return res.status(400).json({ 
      success: false,
      code: 400,
      error: err.message, // Kept for backwards compatibility with frontend
      message: err.message
    });
  }

  console.error('API Error:', err);
  
  const errorMessage = err instanceof Error ? err.message : 'Unknown internal error';
  
  res.status(500).json({ 
    success: false,
    code: 500,
    error: errorMessage, // Send actual error message instead of generic internal server error
    message: errorMessage
  });
}
