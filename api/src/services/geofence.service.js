import { AppError } from '../common/errors/app-error.js';
import { geofenceRepository } from '../repositories/geofence.repository.js';

function toPersistence(data) {
  return {
    name: data.name.trim(),
    center: { type: 'Point', coordinates: [data.longitude, data.latitude] },
    radius: data.radius,
  };
}

export const geofenceService = {
  async list() {
    return geofenceRepository.findAll();
  },

  async create(data) {
    return geofenceRepository.create(toPersistence(data));
  },

  async update(id, data) {
    const geofence = await geofenceRepository.update(id, toPersistence(data));
    if (!geofence) throw new AppError(404, 'GEOFENCE_NOT_FOUND', 'Geofence not found');
    return geofence;
  },

  async remove(id) {
    const geofence = await geofenceRepository.remove(id);
    if (!geofence) throw new AppError(404, 'GEOFENCE_NOT_FOUND', 'Geofence not found');
  },
};
