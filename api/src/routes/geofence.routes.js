import { Router } from 'express';
import { z } from 'zod';

import {
  createGeofence,
  deleteGeofence,
  listGeofences,
  updateGeofence,
} from '../controllers/geofence.controller.js';
import { validate } from '../common/middleware/validate.js';

const idParams = z.object({ id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid geofence id') });
const geofenceBody = z.object({
  name: z.string().trim().min(1).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().positive().max(100_000),
});

export const geofenceRouter = Router();

geofenceRouter.get('/', listGeofences);
geofenceRouter.post('/', validate(z.object({ body: geofenceBody })), createGeofence);
geofenceRouter.put(
  '/:id',
  validate(z.object({ params: idParams, body: geofenceBody })),
  updateGeofence,
);
geofenceRouter.delete('/:id', validate(z.object({ params: idParams })), deleteGeofence);
