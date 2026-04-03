const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['medicine', 'doctor', 'store'], 
    required: true 
  },
  medicineId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Medicine' 
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor' 
  },
  storeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Store',
    required: function() {
      // Required for medicine and store reviews
      return this.type === 'medicine' || this.type === 'store';
    }
  },
  rating: { 
    type: Number, 
    required: true,
    min: 1,
    max: 5
  },
  comment: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
