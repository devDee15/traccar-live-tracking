import { AppError } from '../common/errors/app-error.js';
import { latestLocationRepository } from '../redis/latest-location.repository.js';
import { locationRepository } from '../repositories/location.repository.js';
import { vehicleRepository } from '../repositories/vehicle.repository.js';

export const trackingService = {
  async latest(vehicleId) {
    const vehicle = await vehicleRepository.findById(vehicleId);
    if (!vehicle) throw new AppError(404, 'VEHICLE_NOT_FOUND', 'Vehicle not found');
    return (
      (await latestLocationRepository.get(vehicle.imei)) ||
      (await locationRepository.findLatest(vehicleId))
    );
  },

  history(options) {
    return vehicleRepository.findById(options.vehicleId).then((vehicle) => {
      if (!vehicle) throw new AppError(404, 'VEHICLE_NOT_FOUND', 'Vehicle not found');
      return locationRepository.findHistory(options);
    });
  },
};
