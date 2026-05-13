import { Request, Response, NextFunction } from 'express';

export function performanceLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    if (duration > 2000) {
      console.warn(`SLOW ${method} ${originalUrl} → ${statusCode} (${duration}ms)`);
    } else {
      console.info(`${method} ${originalUrl} → ${statusCode} (${duration}ms)`);
    }
  });

  next();
}
