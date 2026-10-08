import { createServer } from 'node:http';

import { createApp } from './app.js';
import {
  startInfrastructure,
  stopInfrastructure,
} from './common/lifecycle/application-lifecycle.js';
import { logger } from './common/logger/index.js';
import { config } from './config/index.js';
import { createSocketServer } from './sockets/index.js';

const app = createApp();
const server = createServer(app);
const io = createSocketServer(server);
let shuttingDown = false;

server.listen(config.port, config.host, () => {
  logger.info({ host: config.host, port: config.port }, 'API server started');
});

startInfrastructure(io).catch(async (error) => {
  logger.fatal({ err: error }, 'API startup failed');
  await stopInfrastructure();
  shutdown('startupFailure');
});

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'API shutdown started');
  const forceExit = setTimeout(() => {
    logger.fatal({ signal }, 'API shutdown timed out');
    process.exit(1);
  }, 15_000);
  forceExit.unref();
  server.close(async (error) => {
    await io.close();
    await stopInfrastructure();
    clearTimeout(forceExit);
    process.exitCode = error ? 1 : 0;
    if (error) logger.error({ err: error }, 'API shutdown failed');
  });
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
process.on('unhandledRejection', (error) => {
  logger.fatal({ err: error }, 'Unhandled promise rejection');
  shutdown('unhandledRejection');
});
process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Uncaught exception');
  shutdown('uncaughtException');
});
