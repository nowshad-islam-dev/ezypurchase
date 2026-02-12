import winston from 'winston';
import { ENV } from '../config/env';

const isProduction = ENV.env === 'production';

const formatConfig = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.metadata(),

  isProduction
    ? winston.format.json()
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
);

export const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: formatConfig,
  transports: [
    new winston.transports.Console({
      handleExceptions: true, // Log crashes before the process exits
      handleRejections: true, // Log unhandled promise rejections
    }),
  ],
  exitOnError: false, // Don't let a logging failure kill the app
});
