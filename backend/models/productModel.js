const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['consumable', 'equipment', 'clothing'],
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  stock: {
    type: Map,
    of: Number,
    default: {
      'Villas del Parque': 0,
      'UAN': 0
    }
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
