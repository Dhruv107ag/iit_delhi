const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String },
  experience: { type: String },
  description: { type: String },
  timing: { type: String },
  availability: { type: Boolean, default: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
