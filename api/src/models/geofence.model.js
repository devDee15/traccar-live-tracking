import mongoose from 'mongoose';

const geofenceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    center: {
      type: { type: String, enum: ['Point'], default: 'Point', required: true },
      coordinates: {
        type: [Number],
        required: true,
        validate: [
          (coordinates) => coordinates.length === 2,
          'Coordinates must be [longitude, latitude]',
        ],
      },
    },
    radius: { type: Number, required: true, min: 1 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

geofenceSchema.index({ center: '2dsphere' });

export const Geofence = mongoose.model('Geofence', geofenceSchema);
