import { Geofence } from '../models/geofence.model.js';

export const geofenceRepository = {
  findAll() {
    return Geofence.find({ active: true }).sort({ name: 1 }).lean();
  },

  create(data) {
    return Geofence.create(data);
  },

  update(id, data) {
    return Geofence.findOneAndUpdate({ _id: id, active: true }, data, {
      new: true,
      runValidators: true,
    }).lean();
  },

  remove(id) {
    return Geofence.findOneAndUpdate(
      { _id: id, active: true },
      { active: false },
      { new: true },
    ).lean();
  },
};
