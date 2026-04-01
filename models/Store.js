const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  openingTime: { type: String },
  closingTime: { type: String },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'store_owner' }
}, { timestamps: true });

module.exports = mongoose.model('Store', storeSchema);
