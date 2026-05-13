import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      status: 400,
      message: 'Invalid request parameters',
      details: err.flatten().fieldErrors,
    });
    return;
  }

  console.error('Unhandled error:', err);

  res.status(500).json({
    status: 500,
    message: 'Internal server error',
  });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    status: 404,
    message: 'Route not found',
  });
}
