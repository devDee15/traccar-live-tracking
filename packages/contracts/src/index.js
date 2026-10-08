import { z } from 'zod';

export const vehicleLocationUpdateSchema = z.object({
  schemaVersion: z.literal(1),
  eventId: z.string().min(1),
  correlationId: z.string().uuid(),
  vehicleId: z.string().min(1),
  imei: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  speed: z.number().nonnegative(),
  speedUnit: z.literal('kmh'),
  course: z.number().min(0).max(360),
  timestamp: z.string().datetime(),
  receivedAt: z.string().datetime(),
});

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
    requestId: z.string().optional(),
  }),
});
