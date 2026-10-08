import compression from 'compression';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';

import { config } from './config/index.js';
import { errorHandler, notFoundHandler } from './common/middleware/error-handler.js';
import { requestContext } from './common/middleware/request-context.js';
import { logger } from './common/logger/index.js';
import { router } from './routes/index.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(requestContext);
  app.use(pinoHttp({ logger, genReqId: (request) => request.id }));
  app.use(helmet());
  app.use(compression());
  app.use(express.json({ limit: '256kb' }));
  app.use('/api', router);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
