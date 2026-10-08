import { Router } from 'express';
import { z } from 'zod';

import {
  createVehicle,
  deleteVehicle,
  getVehicle,
  listVehicles,
  updateVehicle,
} from '../controllers/vehicle.controller.js';
import { validate } from '../common/middleware/validate.js';

const idParams = z.object({ id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid vehicle id') });
const vehicleBody = z.object({
  imei: z.string().regex(/^\d{10,20}$/, 'IMEI must contain 10 to 20 digits'),
  vehicleNumber: z.string().trim().min(1).max(32),
  deviceName: z.string().trim().min(1).max(100),
});

export const vehicleRouter = Router();

vehicleRouter.get(
  '/',
  validate({
    safeParse: (input) =>
      z
        .object({
          query: z.object({
            page: z.coerce.number().int().positive().default(1),
            limit: z.coerce.number().int().positive().max(100).default(25),
          }),
        })
        .safeParse(input),
  }),
  listVehicles,
);
vehicleRouter.get('/:id', validate(z.object({ params: idParams })), getVehicle);
vehicleRouter.post('/', validate(z.object({ body: vehicleBody })), createVehicle);
vehicleRouter.put(
  '/:id',
  validate(z.object({ params: idParams, body: vehicleBody.partial() })),
  updateVehicle,
);
vehicleRouter.delete('/:id', validate(z.object({ params: idParams })), deleteVehicle);
