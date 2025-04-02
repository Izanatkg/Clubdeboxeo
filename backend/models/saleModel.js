const mongoose = require('mongoose');

const saleItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product',
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const installmentSchema = mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  paid: {
    type: Boolean,
    default: false,
  },
  paidDate: {
    type: Date,
  },
});

const saleSchema = mongoose.Schema(
  {
    items: [saleItemSchema],
    total: {
      type: Number,
      required: true,
    },
    gym: {
      type: String,
      enum: ['Villas del Parque', 'UAN', 'Platinum'],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'installments'],
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    installments: [installmentSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Sale', saleSchema);
