import { trackingService } from '../services/tracking.service.js';
import { asyncHandler } from '../utils/async-handler.js';

export const getLatestLocation = asyncHandler(async (request, response) => {
  const location = await trackingService.latest(request.validated.params.vehicleId);
  response.json({ location });
});

export const getLocationHistory = asyncHandler(async (request, response) => {
  const items = await trackingService.history(request.validated.query);
  response.json({ items, count: items.length });
});
