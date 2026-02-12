import app from './app';
import { ENV } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './lib/prisma';

let server: any;

const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info('Connected to SQL Database');
  } catch (error) {
    logger.error('Could not connect to database', error);
    process.exit(1);
  }
};

connectDB().then(() => {
  server = app.listen(ENV.port, () => {
    logger.info(`Listening to port ${ENV.port}`);
  });
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: unknown) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
