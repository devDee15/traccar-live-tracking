import { config } from '../../config/index.js';
import { locationEventSchema } from '../../events/location-event.js';
import { logger } from '../../common/logger/index.js';
import { locationRepository } from '../../repositories/location.repository.js';
import { createConsumer } from './create-consumer.js';

export function startHistoryConsumer() {
  return createConsumer({
    groupId: 'tracking-history-v1',
    topic: config.kafkaLocationTopic,
    handler: async ({ value }) => {
      const event = locationEventSchema.parse(JSON.parse(value));
      await locationRepository.upsert(event);
      logger.info(
        { eventId: event.eventId, imei: event.imei, vehicleId: event.vehicleId },
        'Location history saved to MongoDB',
      );
    },
  });
}
