import { createHash, randomUUID } from 'node:crypto';
import { z } from 'zod';

export const rawTraccarPositionSchema = z.object({
  device: z.object({
    id: z.number().or(z.string()),
    uniqueId: z.string().min(1),
  }),
  position: z.object({
    id: z.number().or(z.string()).optional(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    speed: z.number().nonnegative().default(0),
    course: z.number().min(0).max(360).default(0),
    fixTime: z.string().or(z.date()),
  }),
});

export const locationEventSchema = z.object({
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

export function createLocationEvent(raw, vehicle) {
  const timestamp = new Date(raw.position.fixTime).toISOString();
  const identity = [
    raw.position.id,
    raw.device.uniqueId,
    timestamp,
    raw.position.latitude,
    raw.position.longitude,
  ]
    .filter((value) => value !== undefined)
    .join(':');

  return locationEventSchema.parse({
    schemaVersion: 1,
    eventId: createHash('sha256').update(identity).digest('hex'),
    correlationId: randomUUID(),
    vehicleId: vehicle._id.toString(),
    imei: raw.device.uniqueId,
    latitude: raw.position.latitude,
    longitude: raw.position.longitude,
    speed: Number((raw.position.speed * 1.852).toFixed(2)),
    speedUnit: 'kmh',
    course: raw.position.course === 360 ? 0 : raw.position.course,
    timestamp,
    receivedAt: new Date().toISOString(),
  });
}
