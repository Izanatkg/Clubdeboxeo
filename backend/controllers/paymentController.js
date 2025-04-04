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
  const { startDate, endDate, paymentType, paymentMethod, gym } = req.query;
  let query = {};

  // Filter by gym if user is not admin
  if (req.user.role !== 'admin') {
    query.gym = req.user.assignedGym;
  } else if (gym) {
    query.gym = gym;
  }

  // Filter by date range if provided
  if (startDate && endDate) {
    query.paymentDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  // Filter by payment type if provided
  if (paymentType) {
    query.paymentType = paymentType;
  }

  // Filter by payment method if provided
  if (paymentMethod) {
    query.paymentMethod = paymentMethod;
  }

  // Get all payments and check for valid student references
  const payments = await Payment.find(query)
    .populate({
      path: 'student',
      select: 'name',
      match: { _id: { $exists: true } } // Solo estudiantes que existen
    })
    .populate('processedBy', 'name')
    .sort({ paymentDate: -1 });

  // Limpiar pagos con referencias rotas
  const validPayments = payments.filter(payment => payment.student !== null);

  // Si hay pagos inválidos, eliminarlos
  const invalidPayments = payments.filter(payment => payment.student === null);
  if (invalidPayments.length > 0) {
    await Payment.deleteMany({
      _id: { $in: invalidPayments.map(p => p._id) }
    });
  }

  res.json(validPayments);
});

// @desc    Create new payment
// @route   POST /api/payments
// @access  Private
const createPayment = asyncHandler(async (req, res) => {
  const { student, amount, paymentType, paymentMethod, comments, paymentDate } = req.body;

  // Validate required fields
  if (!student || !amount || !paymentType || !paymentMethod) {
    res.status(400);
    throw new Error('Por favor complete todos los campos requeridos');
  }

  // Validate student exists
  const studentExists = await Student.findById(student);
  if (!studentExists) {
    res.status(404);
    throw new Error('Estudiante no encontrado');
  }

  // Create payment
  const payment = await Payment.create({
    student,
    amount,
    paymentType,
    paymentMethod,
    comments,
    gym: req.user.assignedGym,
    processedBy: req.user._id,
    paymentDate: paymentDate || new Date(),
  });

  // Populate the payment with student and processedBy details
  const populatedPayment = await Payment.findById(payment._id)
    .populate('student', 'name')
    .populate('processedBy', 'name');

  // Update student's payment dates
  await Student.findByIdAndUpdate(student, {
    lastPaymentDate: payment.paymentDate,
    nextPaymentDate: calculateNextPaymentDate(payment.paymentDate, paymentType),
  });

  res.status(201).json(populatedPayment);
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

// @desc    Delete payment
// @route   DELETE /api/payments/:id
// @access  Private
const deletePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('student', 'name lastPaymentDate nextPaymentDate')
    .populate('processedBy', 'name');

  if (!payment) {
    res.status(404);
    throw new Error('Pago no encontrado');
  }

  // Check if user has permission to delete this payment
  if (req.user.role !== 'admin' && payment.gym !== req.user.assignedGym) {
    res.status(401);
    throw new Error('No autorizado para eliminar este pago');
  }

  // Si el estudiante existe, actualiza sus fechas de pago
  if (payment.student && payment.student._id) {
    // Get all payments for this student, ordered by date
    const studentPayments = await Payment.find({ 
      student: payment.student._id,
      _id: { $ne: payment._id } // Excluir el pago que vamos a eliminar
    }).sort({ paymentDate: -1 });

    // Update student's payment dates based on the most recent remaining payment
    if (studentPayments.length > 0) {
      const latestPayment = studentPayments[0];
      await Student.findByIdAndUpdate(payment.student._id, {
        lastPaymentDate: latestPayment.paymentDate,
        nextPaymentDate: calculateNextPaymentDate(
          latestPayment.paymentDate,
          latestPayment.paymentType
        ),
      });
    } else {
      // If no other payments exist, reset payment dates
      await Student.findByIdAndUpdate(payment.student._id, {
        lastPaymentDate: null,
        nextPaymentDate: null,
      });
    }
  }

  // Delete the payment
  await payment.deleteOne();

  res.json({ id: req.params.id, message: 'Pago eliminado exitosamente' });
});

module.exports = {
  getPayments,
  createPayment,
  getPaymentById,
  getPaymentSummary,
  deletePayment,
};
