import { asyncHandler } from '../utils/async-handler.js';
import { isMongoReady } from '../common/database/mongo.js';
import { isKafkaReady } from '../kafka/client.js';
import { isRedisReady } from '../redis/client.js';

export const getLiveness = asyncHandler(async (request, response) => {
  response.json({ status: 'ok', service: 'tracking-api' });
});

export const getReadiness = asyncHandler(async (request, response) => {
  const checks = {
    mongo: isMongoReady(),
    redis: isRedisReady(),
    kafka: isKafkaReady(),
  };
  const ready = Object.values(checks).every(Boolean);

  response.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'not_ready', checks });
});
