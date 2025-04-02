const mongoose = require('mongoose');

const studentSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    photoUrl: {
      type: String,
    },
    gym: {
      type: String,
      enum: ['Villas del Parque', 'UAN', 'Platinum'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'overdue'],
      default: 'active',
    },
    lastPayment: {
      type: Date,
    },
    nextPaymentDate: {
      type: Date,
    },
    membershipType: {
      type: String,
      enum: ['class', 'weekly', 'monthly'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Student', studentSchema);
