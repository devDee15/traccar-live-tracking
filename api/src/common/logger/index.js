import pino from 'pino';

import { config } from '../../config/index.js';

export const logger = pino({
  level: config.logLevel,
  base: {
    service: 'tracking-api',
    environment: config.nodeEnv,
  },
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'password', 'token', '*.password'],
    censor: '[REDACTED]',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
