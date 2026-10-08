import { config } from '../../config/index.js';
import { logger } from '../../common/logger/index.js';
import { locationEventSchema } from '../../events/location-event.js';
import { createConsumer } from './create-consumer.js';

export function startRealtimeConsumer(io) {
  return createConsumer({
    groupId: 'tracking-realtime-v1',
    topic: config.kafkaLocationTopic,
    handler: async ({ value }) => {
      const event = locationEventSchema.parse(JSON.parse(value));
      io.of('/tracking').emit('vehicle-location-update', event);
      logger.info(
        { eventId: event.eventId, imei: event.imei, vehicleId: event.vehicleId },
        'Location broadcast to tracking clients',
      );
    },
  });
}
