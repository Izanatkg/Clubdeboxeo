const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Student',
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentType: {
      type: String,
      enum: ['class', 'weekly', 'monthly'],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card'],
      required: true,
    },
    gym: {
      type: String,
      enum: ['Villas del Parque', 'UAN', 'Platinum'],
      required: true,
    },
    comments: {
      type: String,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
