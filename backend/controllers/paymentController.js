const asyncHandler = require('express-async-handler');
const Payment = require('../models/paymentModel');
const Student = require('../models/studentModel');

// Function to calculate next payment date based on payment type
const calculateNextPaymentDate = (currentDate, paymentType) => {
  const date = new Date(currentDate);
  switch (paymentType) {
    case 'monthly':
      // Add one month
      date.setMonth(date.getMonth() + 1);
      break;
    case 'weekly':
      // Add 7 days
      date.setDate(date.getDate() + 7);
      break;
    case 'class':
      // For single class, next payment is the same day
      break;
    default:
      return null;
  }
  return date;
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
const getPayments = asyncHandler(async (req, res) => {
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

  const payments = await Payment.find(query)
    .populate('student', 'name phone')
    .populate('processedBy', 'name')
    .sort({ createdAt: -1 });

  res.json(payments);
});

// @desc    Create new payment
// @route   POST /api/payments
// @access  Private
const createPayment = asyncHandler(async (req, res) => {
  const { studentId, amount, paymentType, paymentMethod, comments, paymentDate } = req.body;

  if (!studentId || !amount || !paymentType || !paymentMethod) {
    res.status(400);
    throw new Error('Por favor complete todos los campos requeridos');
  }

  const student = await Student.findById(studentId);
  if (!student) {
    res.status(404);
    throw new Error('Estudiante no encontrado');
  }

  // Check if user has permission to process payment for this student
  if (req.user.role !== 'admin' && student.gym !== req.user.assignedGym) {
    res.status(401);
    throw new Error('No autorizado para procesar pagos para este estudiante');
  }

  // Calculate next payment date based on payment type and payment date
  const currentPaymentDate = paymentDate ? new Date(paymentDate) : new Date();
  const nextPaymentDate = calculateNextPaymentDate(currentPaymentDate, paymentType);

  // Create payment
  const payment = await Payment.create({
    student: studentId,
    amount,
    paymentType,
    paymentMethod,
    comments,
    gym: student.gym,
    processedBy: req.user._id,
    paymentDate: currentPaymentDate,
  });

  if (payment) {
    // Update student's last payment date and next payment date
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      {
        lastPayment: currentPaymentDate,
        nextPaymentDate: nextPaymentDate,
        status: 'active',
      },
      { new: true }
    );

    // Return payment with populated fields
    const populatedPayment = await Payment.findById(payment._id)
      .populate('student', 'name phone')
      .populate('processedBy', 'name');

    res.status(201).json(populatedPayment);
  } else {
    res.status(400);
    throw new Error('Error al procesar el pago');
  }
});

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('student', 'name phone')
    .populate('processedBy', 'name');

  if (!payment) {
    res.status(404);
    throw new Error('Pago no encontrado');
  }

  // Check if user has permission to view this payment
  if (req.user.role !== 'admin' && payment.gym !== req.user.assignedGym) {
    res.status(401);
    throw new Error('No autorizado para ver este pago');
  }

  res.json(payment);
});

// @desc    Get payment summary
// @route   GET /api/payments/summary
// @access  Private
const getPaymentSummary = asyncHandler(async (req, res) => {
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

  const summary = await Payment.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$paymentType',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  res.json(summary);
});

module.exports = {
  getPayments,
  createPayment,
  getPaymentById,
  getPaymentSummary,
};
