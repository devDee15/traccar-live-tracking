import { config } from '../../config/index.js';
import { locationEventSchema } from '../../events/location-event.js';
import { logger } from '../../common/logger/index.js';
import { latestLocationRepository } from '../../redis/latest-location.repository.js';
import { createConsumer } from './create-consumer.js';

export function startLatestLocationConsumer() {
  return createConsumer({
    groupId: 'tracking-latest-v1',
    topic: config.kafkaLocationTopic,
    handler: async ({ value }) => {
      const event = locationEventSchema.parse(JSON.parse(value));
      const updated = await latestLocationRepository.setIfNewer(event);
      logger.info(
        { eventId: event.eventId, imei: event.imei, updated: Boolean(updated) },
        updated
          ? 'Latest location cache updated in Redis'
          : 'Older location ignored by Redis cache',
      );
    },
  });
}
