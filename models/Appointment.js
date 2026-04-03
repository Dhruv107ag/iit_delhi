const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  appointmentDate: { 
    type: Date, 
    required: true 
  },
  reason: { 
    type: String 
  },
  chatHistory: [
    {
      sender: { type: String, enum: ['user', 'doctor'] },
      message: { type: String },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  lastMessage: { type: String },
  lastMessageTime: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
