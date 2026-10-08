import { vehicleService } from '../services/vehicle.service.js';
import { asyncHandler } from '../utils/async-handler.js';

export const listVehicles = asyncHandler(async (request, response) => {
  response.json(await vehicleService.list(request.validated.query));
});

export const getVehicle = asyncHandler(async (request, response) => {
  response.json(await vehicleService.get(request.validated.params.id));
});

export const createVehicle = asyncHandler(async (request, response) => {
  const vehicle = await vehicleService.create(request.validated.body);
  request.log.info({ vehicleId: vehicle.id, imei: vehicle.imei }, 'Vehicle created');
  response.status(201).json(vehicle);
});

export const updateVehicle = asyncHandler(async (request, response) => {
  const vehicle = await vehicleService.update(request.validated.params.id, request.validated.body);
  request.log.info({ vehicleId: vehicle._id }, 'Vehicle updated');
  response.json(vehicle);
});

export const deleteVehicle = asyncHandler(async (request, response) => {
  await vehicleService.remove(request.validated.params.id);
  request.log.info({ vehicleId: request.validated.params.id }, 'Vehicle deactivated');
  response.status(204).end();
});
