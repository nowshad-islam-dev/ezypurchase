import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorConverter, errorHandler } from './middlewares/error';
import { requestLogger } from './middlewares/requestLogger';
import { ApiError } from './utils/apiError';
import routes from './routes';

const app: express.Application = express();

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// parse cookies
app.use(cookieParser());

// enable cors
app.use(cors());

// request logger
app.use(requestLogger);

// v1 api routes
app.use('/api/v1/', routes);

//send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(404, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

export default app;
