const express = require('express');
const router = express.Router();
const {
  getPayments,
  createPayment,
  getPaymentById,
  getPaymentSummary,
  deletePayment,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getPayments)
  .post(protect, createPayment);

router.get('/summary', protect, getPaymentSummary);
router.get('/:id', protect, getPaymentById);
router.delete('/:id', protect, deletePayment);

module.exports = router;
