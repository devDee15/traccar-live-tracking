import { ZodError } from 'zod';

import { AppError } from '../../common/errors/app-error.js';
import { kafka } from '../client.js';
import { logger } from '../../common/logger/index.js';
import { publishDeadLetter } from '../producer/location.producer.js';

export async function createConsumer({ groupId, topic, handler, deadLetter = true }) {
  const consumer = kafka.consumer({ groupId, allowAutoTopicCreation: false });
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: false });
  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic: sourceTopic, partition, message }) => {
      const key = message.key?.toString() || null;
      const value = message.value?.toString() || '';

      try {
        await handler({ key, value, partition, offset: message.offset });
      } catch (error) {
        logger.error(
          { err: error, groupId, sourceTopic, partition, offset: message.offset, key },
          'Kafka message processing failed',
        );
        const nonRetryable =
          error instanceof ZodError || (error instanceof AppError && error.statusCode < 500);
        if (!deadLetter || !nonRetryable) throw error;
        await publishDeadLetter({ sourceTopic, key, value, error });
      }

      await consumer.commitOffsets([
        { topic: sourceTopic, partition, offset: (BigInt(message.offset) + 1n).toString() },
      ]);
    },
  });
  logger.info({ groupId, topic }, 'Kafka consumer started');
  return consumer;
}
