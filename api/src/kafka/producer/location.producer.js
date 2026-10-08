import { Partitioners } from 'kafkajs';

import { kafka } from '../client.js';
import { config } from '../../config/index.js';
import { logger } from '../../common/logger/index.js';

const producer = kafka.producer({
  allowAutoTopicCreation: false,
  createPartitioner: Partitioners.DefaultPartitioner,
  idempotent: true,
  maxInFlightRequests: 5,
  retry: { retries: Number.MAX_SAFE_INTEGER },
});
let connected = false;

export async function connectLocationProducer() {
  await producer.connect();
  connected = true;
  logger.info('Kafka location producer connected');
}

export async function publishLocation(event) {
  await producer.send({
    topic: config.kafkaLocationTopic,
    acks: -1,
    messages: [{ key: event.imei, value: JSON.stringify(event) }],
  });
  logger.debug(
    { eventId: event.eventId, imei: event.imei, topic: config.kafkaLocationTopic },
    'Canonical location published',
  );
}

export async function publishDeadLetter({ sourceTopic, key, value, error }) {
  await producer.send({
    topic: config.kafkaDeadLetterTopic,
    acks: -1,
    messages: [
      {
        key,
        value: JSON.stringify({
          sourceTopic,
          key,
          value,
          error: { name: error.name, message: error.message },
          failedAt: new Date().toISOString(),
        }),
      },
    ],
  });
  logger.warn(
    { sourceTopic, imei: key, error: { name: error.name, message: error.message } },
    'Kafka message sent to dead-letter topic',
  );
}

export async function disconnectLocationProducer() {
  if (connected) {
    await producer.disconnect();
    connected = false;
  }
}
