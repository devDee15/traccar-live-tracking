import { AppError } from '../common/errors/app-error.js';
import { vehicleRepository } from '../repositories/vehicle.repository.js';

function normalizeVehicle(data) {
  return {
    ...data,
    imei: data.imei?.replace(/\s/g, ''),
    vehicleNumber: data.vehicleNumber?.trim().toUpperCase(),
    deviceName: data.deviceName?.trim(),
  };
}

function translatePersistenceError(error) {
  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || 'field';
    throw new AppError(409, 'DUPLICATE_RESOURCE', `A vehicle with this ${field} already exists`);
  }
  throw error;
}

export const vehicleService = {
  async list({ page, limit }) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      vehicleRepository.findAll({ limit, skip }),
      vehicleRepository.count(),
    ]);
    return { items, page, limit, total };
  },

  async get(id) {
    const vehicle = await vehicleRepository.findById(id);
    if (!vehicle) throw new AppError(404, 'VEHICLE_NOT_FOUND', 'Vehicle not found');
    return vehicle;
  },

  async create(data) {
    try {
      return await vehicleRepository.create(normalizeVehicle(data));
    } catch (error) {
      translatePersistenceError(error);
    }
  },

  async update(id, data) {
    try {
      const vehicle = await vehicleRepository.update(id, normalizeVehicle(data));
      if (!vehicle) throw new AppError(404, 'VEHICLE_NOT_FOUND', 'Vehicle not found');
      return vehicle;
    } catch (error) {
      translatePersistenceError(error);
    }
  },

  async remove(id) {
    const vehicle = await vehicleRepository.remove(id);
    if (!vehicle) throw new AppError(404, 'VEHICLE_NOT_FOUND', 'Vehicle not found');
  },
};
