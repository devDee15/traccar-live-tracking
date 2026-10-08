import { AppError } from '../../common/errors/app-error.js';
import { logger } from '../../common/logger/index.js';
import { config } from '../../config/index.js';
import { createLocationEvent, rawTraccarPositionSchema } from '../../events/location-event.js';
import { vehicleRepository } from '../../repositories/vehicle.repository.js';
import { createConsumer } from './create-consumer.js';
import { publishLocation } from '../producer/location.producer.js';

export function startNormalizerConsumer() {
  return createConsumer({
    groupId: 'tracking-normalizer-v1',
    topic: config.kafkaRawTopic,
    handler: async ({ value }) => {
      let parsed;
      try {
        parsed = JSON.parse(value);
      } catch (error) {
        throw new AppError(400, 'INVALID_TRACCAR_JSON', 'Raw Traccar message is not valid JSON', {
          cause: error,
        });
      }

      const raw = rawTraccarPositionSchema.parse(parsed);
      const vehicle = await vehicleRepository.findByImei(raw.device.uniqueId);
      if (!vehicle) {
        throw new AppError(
          422,
          'UNKNOWN_IMEI',
          `No active vehicle for IMEI ${raw.device.uniqueId}`,
        );
      }

      const event = createLocationEvent(raw, vehicle);
      await publishLocation(event);
      logger.info(
        {
          eventId: event.eventId,
          imei: event.imei,
          vehicleId: event.vehicleId,
          vehicleNumber: vehicle.vehicleNumber,
          latitude: event.latitude,
          longitude: event.longitude,
          timestamp: event.timestamp,
        },
        'Tracker position normalized and published',
      );
    },
  });
}
