const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  expiry: { type: Date },
  manufactureDate: { type: Date },
  composition: { type: String },
  status: { type: String, enum: ['Available', 'Out of Stock'], default: 'Available' },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' }
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);
