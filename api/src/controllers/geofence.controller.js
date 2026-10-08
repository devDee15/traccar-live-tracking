import { geofenceService } from '../services/geofence.service.js';
import { asyncHandler } from '../utils/async-handler.js';

export const listGeofences = asyncHandler(async (request, response) => {
  response.json(await geofenceService.list());
});

export const createGeofence = asyncHandler(async (request, response) => {
  const geofence = await geofenceService.create(request.validated.body);
  request.log.info({ geofenceId: geofence.id }, 'Geofence created');
  response.status(201).json(geofence);
});

export const updateGeofence = asyncHandler(async (request, response) => {
  const geofence = await geofenceService.update(
    request.validated.params.id,
    request.validated.body,
  );
  request.log.info({ geofenceId: geofence._id }, 'Geofence updated');
  response.json(geofence);
});

export const deleteGeofence = asyncHandler(async (request, response) => {
  await geofenceService.remove(request.validated.params.id);
  request.log.info({ geofenceId: request.validated.params.id }, 'Geofence deactivated');
  response.status(204).end();
});
