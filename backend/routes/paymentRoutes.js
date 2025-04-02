const express = require('express');
const router = express.Router();
const {
  getPayments,
  createPayment,
  getPaymentById,
  getPaymentSummary,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getPayments)
  .post(protect, createPayment);

router.get('/summary', protect, getPaymentSummary);
router.get('/:id', protect, getPaymentById);

module.exports = router;
