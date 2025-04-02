const express = require('express');
const router = express.Router();
const {
  getSales,
  createSale,
  getSaleById,
  updateInstallment,
  getSalesSummary,
} = require('../controllers/saleController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getSales)
  .post(protect, createSale);

router.get('/summary', protect, getSalesSummary);
router.get('/:id', protect, getSaleById);
router.put('/:id/installments/:installmentId', protect, updateInstallment);

module.exports = router;
