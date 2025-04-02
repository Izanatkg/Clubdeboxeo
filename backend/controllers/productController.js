const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getProducts = asyncHandler(async (req, res) => {
  const { type } = req.query;
  let query = {};

  if (type) {
    query.type = type;
  }

  const products = await Product.find(query).sort({ name: 1 });
  res.json(products);
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, type, price, description, allowInstallments } = req.body;

  if (!name || !type || !price) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }

  const product = await Product.create({
    name,
    type,
    price,
    description,
    allowInstallments: allowInstallments || false,
    stock: {
      'Villas del Parque': 0,
      'UAN': 0,
      'Platinum': 0
    }
  });

  if (product) {
    res.status(201).json(product);
  } else {
    res.status(400);
    throw new Error('Invalid product data');
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to update products');
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updatedProduct);
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to delete products');
  }

  await product.remove();
  res.json({ id: req.params.id });
});

// @desc    Update product stock
// @route   PUT /api/products/:id/stock
// @access  Private
const updateStock = asyncHandler(async (req, res) => {
  const { gym, quantity } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if user has permission to update stock for this gym
  if (req.user.role !== 'admin' && gym !== req.user.assignedGym) {
    res.status(401);
    throw new Error('Not authorized to update stock for this gym');
  }

  const currentStock = product.stock.get(gym) || 0;
  product.stock.set(gym, currentStock + quantity);
  await product.save();

  res.json(product);
});

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
};
