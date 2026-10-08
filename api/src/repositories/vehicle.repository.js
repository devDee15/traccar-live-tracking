import { Vehicle } from '../models/vehicle.model.js';

export const vehicleRepository = {
  findAll({ limit, skip }) {
    return Vehicle.find({ active: true }).sort({ vehicleNumber: 1 }).skip(skip).limit(limit).lean();
  },

  count() {
    return Vehicle.countDocuments({ active: true });
  },

  findById(id) {
    return Vehicle.findOne({ _id: id, active: true }).lean();
  },

  findByImei(imei) {
    return Vehicle.findOne({ imei, active: true }).lean();
  },

  create(data) {
    return Vehicle.create(data);
  },

  update(id, data) {
    return Vehicle.findOneAndUpdate({ _id: id, active: true }, data, {
      new: true,
      runValidators: true,
    }).lean();
  },

  remove(id) {
    return Vehicle.findOneAndUpdate(
      { _id: id, active: true },
      { active: false },
      { new: true },
    ).lean();
  },
};
