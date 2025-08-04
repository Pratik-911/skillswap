const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  learnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 60
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  meetingLink: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Index for efficient querying
AppointmentSchema.index({ teacherId: 1, scheduledDate: 1 });
AppointmentSchema.index({ learnerId: 1, scheduledDate: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);
