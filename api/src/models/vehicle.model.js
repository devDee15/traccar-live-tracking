import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    imei: { type: String, required: true, unique: true, trim: true },
    vehicleNumber: { type: String, required: true, unique: true, trim: true },
    deviceName: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

vehicleSchema.index({ active: 1, vehicleNumber: 1 });

export const Vehicle = mongoose.model('Vehicle', vehicleSchema);
