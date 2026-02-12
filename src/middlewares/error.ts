import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { ENV } from '../config/env';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/apiError';
import { Prisma } from '../generated/prisma/client';

export const errorConverter: ErrorRequestHandler = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode ||
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof ZodError
        ? 400
        : 500;

    const message =
      error.message ||
      (statusCode === 500 ? 'Internal Server Error' : 'Bad Request');
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

export const errorHandler: ErrorRequestHandler = (
  err: ApiError,
  req,
  res,
  next,
) => {
  let { statusCode, message } = err;
  if (ENV.env === 'production' && !err.isOperational) {
    statusCode = 500;
    message = 'Internal Server Error';
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(ENV.env === 'development' && { stack: err.stack }),
  };

  if (ENV.env === 'development') {
    logger.error(err);
  }

  res.status(statusCode).send(response);
};
