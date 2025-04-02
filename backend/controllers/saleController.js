const asyncHandler = require('express-async-handler');
const Sale = require('../models/saleModel');
const Product = require('../models/productModel');

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
const getSales = asyncHandler(async (req, res) => {
  const { startDate, endDate, gym } = req.query;
  let query = {};

  // Filter by gym if user is not admin
  if (req.user.role !== 'admin') {
    query.gym = req.user.assignedGym;
  } else if (gym) {
    query.gym = gym;
  }

  // Filter by date range if provided
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const sales = await Sale.find(query)
    .populate('items.product', 'name price')
    .populate('customer', 'name phone')
    .populate('processedBy', 'name')
    .sort({ createdAt: -1 });

  res.json(sales);
});

// @desc    Create new sale
// @route   POST /api/sales
// @access  Private
const createSale = asyncHandler(async (req, res) => {
  const { items, paymentMethod, customerId, installments } = req.body;

  if (!items || items.length === 0 || !paymentMethod) {
    res.status(400);
    throw new Error('Please provide items and payment method');
  }

  // Calculate total and validate stock
  let total = 0;
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.product}`);
    }

    // Check stock availability
    const currentStock = product.stock.get(req.user.assignedGym) || 0;
    if (currentStock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for product: ${product.name}`);
    }

    total += product.price * item.quantity;
  }

  // Validate installments if payment method is installments
  if (paymentMethod === 'installments') {
    if (!installments || installments.length === 0) {
      res.status(400);
      throw new Error('Please provide installment details');
    }

    const installmentsTotal = installments.reduce((sum, inst) => sum + inst.amount, 0);
    if (installmentsTotal !== total) {
      res.status(400);
      throw new Error('Installments total does not match sale total');
    }
  }

  // Create sale
  const sale = await Sale.create({
    items: items.map(item => ({
      product: item.product,
      quantity: item.quantity,
      price: item.price,
    })),
    total,
    gym: req.user.assignedGym,
    paymentMethod,
    customer: customerId,
    processedBy: req.user.id,
    installments: paymentMethod === 'installments' ? installments : [],
  });

  if (sale) {
    // Update stock for each product
    for (const item of items) {
      const product = await Product.findById(item.product);
      const currentStock = product.stock.get(req.user.assignedGym) || 0;
      product.stock.set(req.user.assignedGym, currentStock - item.quantity);
      await product.save();
    }

    const populatedSale = await Sale.findById(sale._id)
      .populate('items.product', 'name price')
      .populate('customer', 'name phone')
      .populate('processedBy', 'name');

    res.status(201).json(populatedSale);
  } else {
    res.status(400);
    throw new Error('Invalid sale data');
  }
});

// @desc    Get sale by ID
// @route   GET /api/sales/:id
// @access  Private
const getSaleById = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id)
    .populate('items.product', 'name price')
    .populate('customer', 'name phone')
    .populate('processedBy', 'name');

  if (!sale) {
    res.status(404);
    throw new Error('Sale not found');
  }

  // Check if user has permission to view this sale
  if (req.user.role !== 'admin' && sale.gym !== req.user.assignedGym) {
    res.status(401);
    throw new Error('Not authorized to view this sale');
  }

  res.json(sale);
});

// @desc    Update installment payment
// @route   PUT /api/sales/:id/installments/:installmentId
// @access  Private
const updateInstallment = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id);

  if (!sale) {
    res.status(404);
    throw new Error('Sale not found');
  }

  // Check if user has permission to update this sale
  if (req.user.role !== 'admin' && sale.gym !== req.user.assignedGym) {
    res.status(401);
    throw new Error('Not authorized to update this sale');
  }

  const installment = sale.installments.id(req.params.installmentId);
  if (!installment) {
    res.status(404);
    throw new Error('Installment not found');
  }

  installment.paid = true;
  installment.paidDate = new Date();
  await sale.save();

  res.json(sale);
});

// @desc    Get sales summary
// @route   GET /api/sales/summary
// @access  Private
const getSalesSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate, gym } = req.query;
  let query = {};

  // Filter by gym if user is not admin
  if (req.user.role !== 'admin') {
    query.gym = req.user.assignedGym;
  } else if (gym) {
    query.gym = gym;
  }

  // Filter by date range if provided
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const summary = await Sale.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$paymentMethod',
        total: { $sum: '$total' },
        count: { $sum: 1 },
      },
    },
  ]);

  res.json(summary);
});

module.exports = {
  getSales,
  createSale,
  getSaleById,
  updateInstallment,
  getSalesSummary,
};
