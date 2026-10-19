import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: 'Not found', path: req.path });
}

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message, details: err.details });
  }

  // Postgres unique violation
  if (err?.code === '23505') {
    return res.status(409).json({ error: 'Resource already exists' });
  }
  // Postgres FK violation
  if (err?.code === '23503') {
    return res.status(400).json({ error: 'Invalid reference to related resource' });
  }

  console.error('\n[Unhandled error]:', err?.message || err);
  console.error(err);
  if (err?.stack) {
    console.error(err.stack);
  }
  res.status(500).json({
    error: 'Internal server error',
    message: err?.message || 'Internal server error',
    code: err?.code,
    ...(env.IS_PROD ? {} : { debug: err?.message || String(err) }),
  });
}
