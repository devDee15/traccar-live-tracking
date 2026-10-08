import { Router } from 'express';

import { dashboardRouter } from './dashboard.routes.js';
import { healthRouter } from './health.routes.js';
import { geofenceRouter } from './geofence.routes.js';
import { trackingRouter } from './tracking.routes.js';
import { vehicleRouter } from './vehicle.routes.js';

export const router = Router();

router.use('/health', healthRouter);
router.use('/tracking', trackingRouter);
router.use('/dashboard', dashboardRouter);
router.use('/vehicles', vehicleRouter);
router.use('/geofences', geofenceRouter);
