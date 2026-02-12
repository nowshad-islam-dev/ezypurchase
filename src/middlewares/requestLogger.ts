import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${Date.now() - startTime}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip,
      context: 'HttpRequest',
      query: Object.keys(req.query).length ? req.query : undefined,
    };

    if (res.statusCode >= 400) {
      logger.error('Request failed', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });

  next();
};
