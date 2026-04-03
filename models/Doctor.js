const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  specialization: { type: String },
  experience: { type: String },
  description: { type: String },
  timing: { type: String },
  availability: { type: Boolean, default: true },
  role: { type: String, default: 'doctor' },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
