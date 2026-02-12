import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import httpStatus from 'http-status';
import { ApiError } from '../utils/apiError';

const validate =
  (schema: {
    body?: z.ZodType<any>;
    query?: z.ZodType<any>;
    params?: z.ZodType<any>;
  }) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      next();
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues[0]?.message || 'Validation Error';
        return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
      } else {
        throw error;
      }
    }
  };

export default validate;
