import { latestLocationRepository } from '../redis/latest-location.repository.js';
import { locationRepository } from '../repositories/location.repository.js';
import { vehicleRepository } from '../repositories/vehicle.repository.js';
import { distanceInMeters } from '../utils/distance.js';

const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;
const MOVING_SPEED_THRESHOLD = 1;

function calculateMovement(history) {
  const byVehicle = new Map();
  for (const location of history) {
    const vehicleId = location.vehicleId.toString();
    const locations = byVehicle.get(vehicleId) || [];
    locations.push(location);
    byVehicle.set(vehicleId, locations);
  }
  let distanceMeters = 0;
  let trips = 0;

  for (const locations of byVehicle.values()) {
    let moving = false;
    for (let index = 0; index < locations.length; index += 1) {
      const location = locations[index];
      if (index > 0) distanceMeters += distanceInMeters(locations[index - 1], location);
      const nowMoving = location.speed > MOVING_SPEED_THRESHOLD;
      if (nowMoving && !moving) trips += 1;
      moving = nowMoving;
    }
  }
  return { distanceMeters, trips };
}

export const dashboardService = {
  async summary() {
    const vehicles = await vehicleRepository.findAll({ limit: 10_000, skip: 0 });
    const latestLocations = await Promise.all(
      vehicles.map((vehicle) => latestLocationRepository.get(vehicle.imei)),
    );
    const onlineAfter = Date.now() - ONLINE_THRESHOLD_MS;
    const online = latestLocations.filter(
      (location) => location && new Date(location.timestamp).getTime() >= onlineAfter,
    ).length;

    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const movement = calculateMovement(await locationRepository.findSince(startOfDay));

    return {
      totalVehicles: vehicles.length,
      onlineVehicles: online,
      offlineVehicles: vehicles.length - online,
      todayDistanceKm: Number((movement.distanceMeters / 1000).toFixed(2)),
      todayTrips: movement.trips,
      timezone: 'UTC',
    };
  },
};
