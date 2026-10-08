import { Router } from 'express';
import { z } from 'zod';

import { validate } from '../common/middleware/validate.js';
import { getLatestLocation, getLocationHistory } from '../controllers/tracking.controller.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid vehicle id');

export const trackingRouter = Router();

trackingRouter.get(
  '/latest/:vehicleId',
  validate(z.object({ params: z.object({ vehicleId: objectId }) })),
  getLatestLocation,
);
trackingRouter.get(
  '/history',
  validate(
    z.object({
      query: z
        .object({
          vehicleId: objectId,
          fromDate: z.coerce.date(),
          toDate: z.coerce.date(),
          limit: z.coerce.number().int().positive().max(10_000).default(5_000),
        })
        .refine(({ fromDate, toDate }) => fromDate <= toDate, 'fromDate must not be after toDate'),
    }),
  ),
  getLocationHistory,
);
