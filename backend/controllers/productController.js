const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getProducts = asyncHandler(async (req, res) => {
  const { type, search } = req.query;
  let query = {};

  if (type) {
    query.type = type;
  }

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const products = await Product.find(query).sort({ name: 1 });
  res.json(products);
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private
const createProduct = asyncHandler(async (req, res) => {
  const { name, type, price, description, allowInstallments } = req.body;

  if (!name || !type || !price) {
    res.status(400);
    throw new Error('Por favor complete todos los campos requeridos');
  }

  const product = await Product.create({
    name,
    type,
    price: Number(price),
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
    throw new Error('Datos de producto inválidos');
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      price: Number(req.body.price)
    },
    { new: true }
  );

  res.json(updatedProduct);
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }

  await Product.findByIdAndDelete(req.params.id);
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
    throw new Error('Producto no encontrado');
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
