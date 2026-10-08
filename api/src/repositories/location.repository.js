import { LocationHistory } from '../models/location-history.model.js';

export const locationRepository = {
  async upsert(event) {
    await LocationHistory.updateOne(
      { eventId: event.eventId },
      {
        $setOnInsert: {
          ...event,
          expiresAt: LocationHistory.expiryFrom(event.timestamp),
        },
      },
      { upsert: true },
    );
  },

  findLatest(vehicleId) {
    return LocationHistory.findOne({ vehicleId }).sort({ timestamp: -1 }).lean();
  },

  findHistory({ vehicleId, fromDate, toDate, limit }) {
    return LocationHistory.find({
      vehicleId,
      timestamp: { $gte: new Date(fromDate), $lte: new Date(toDate) },
    })
      .sort({ timestamp: 1 })
      .limit(limit)
      .lean();
  },

  findSince(timestamp) {
    return LocationHistory.find({ timestamp: { $gte: timestamp } })
      .sort({ vehicleId: 1, timestamp: 1 })
      .lean();
  },
};
