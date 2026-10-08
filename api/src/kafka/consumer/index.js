import { logger } from '../../common/logger/index.js';
import { startHistoryConsumer } from './history.consumer.js';
import { startLatestLocationConsumer } from './latest-location.consumer.js';
import { startNormalizerConsumer } from './normalizer.consumer.js';
import { startRealtimeConsumer } from './realtime.consumer.js';

let consumers = [];

export async function startConsumers(io) {
  consumers = await Promise.all([
    startNormalizerConsumer(),
    startHistoryConsumer(),
    startLatestLocationConsumer(),
    startRealtimeConsumer(io),
  ]);
  logger.info({ count: consumers.length }, 'Kafka consumers started');
}

export async function stopConsumers() {
  const activeConsumers = consumers;
  consumers = [];
  await Promise.allSettled(activeConsumers.map((consumer) => consumer.disconnect()));
}
