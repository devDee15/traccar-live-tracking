import { createClient } from 'redis';

import { logger } from '../common/logger/index.js';
import { config } from '../config/index.js';

export const redisClient = createClient({ url: config.redisUrl });

redisClient.on('error', (error) => logger.error({ err: error }, 'Redis error'));
redisClient.on('reconnecting', () => logger.warn('Redis reconnecting'));

export async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    logger.info('Redis connected');
  }
}

export async function disconnectRedis() {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
}

export function isRedisReady() {
  return redisClient.isReady;
}
