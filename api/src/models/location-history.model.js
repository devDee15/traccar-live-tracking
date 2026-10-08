import mongoose from 'mongoose';

const TWO_YEARS_SECONDS = 60 * 60 * 24 * 365 * 2;

const locationHistorySchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true },
    correlationId: { type: String, required: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    imei: { type: String, required: true, index: true },
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    speed: { type: Number, required: true, min: 0 },
    speedUnit: { type: String, enum: ['kmh'], default: 'kmh', required: true },
    course: { type: Number, required: true, min: 0, max: 359.999 },
    timestamp: { type: Date, required: true },
    receivedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
  },
  { collection: 'location_history', timestamps: true },
);

locationHistorySchema.index({ vehicleId: 1, timestamp: 1 });
locationHistorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

locationHistorySchema.statics.expiryFrom = function expiryFrom(timestamp) {
  return new Date(new Date(timestamp).getTime() + TWO_YEARS_SECONDS * 1000);
};

export const LocationHistory = mongoose.model('LocationHistory', locationHistorySchema);
