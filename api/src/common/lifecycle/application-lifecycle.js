import { logger } from '../logger/index.js';
import { connectMongo, disconnectMongo } from '../database/mongo.js';
import { connectKafkaAdmin, disconnectKafkaAdmin, ensureKafkaTopics } from '../../kafka/client.js';
import { connectRedis, disconnectRedis } from '../../redis/client.js';
import {
  connectLocationProducer,
  disconnectLocationProducer,
} from '../../kafka/producer/location.producer.js';
import { startConsumers, stopConsumers } from '../../kafka/consumer/index.js';
import { startRetentionMonitor, stopRetentionMonitor } from '../../jobs/retention-monitor.job.js';

export async function startInfrastructure(io) {
  logger.info('Infrastructure startup started');
  await connectMongo();
  await connectRedis();
  await connectKafkaAdmin();
  await ensureKafkaTopics();
  await connectLocationProducer();
  await startConsumers(io);
  startRetentionMonitor();
  logger.info('Infrastructure startup completed');
}

export async function stopInfrastructure() {
  stopRetentionMonitor();
  const results = await Promise.allSettled([
    stopConsumers(),
    disconnectLocationProducer(),
    disconnectKafkaAdmin(),
    disconnectRedis(),
    disconnectMongo(),
  ]);

  for (const result of results) {
    if (result.status === 'rejected') {
      logger.error({ err: result.reason }, 'Infrastructure shutdown step failed');
    }
  }
}
