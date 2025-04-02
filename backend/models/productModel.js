const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['consumable', 'equipment', 'clothing'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Map,
      of: Number,
      default: {
        'Villas del Parque': 0,
        'UAN': 0,
        'Platinum': 0
      }
    },
    description: {
      type: String,
    },
    allowInstallments: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
