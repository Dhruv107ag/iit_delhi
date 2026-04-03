const express = require('express');
const router = express.Router();
const {
  addReview,
  getReviewsByStore,
  getReviewsByDoctor,
  getReviewsByMedicine,
  getAllReviews
} = require('../controllers/reviewController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Get all reviews (Admin only)
router.get('/', requireAuth, requireRole('admin'), getAllReviews);

// Add a new review
router.post('/', addReview);

// Get reviews based on target references
router.get('/store/:storeId', getReviewsByStore);
router.get('/doctor/:doctorId', getReviewsByDoctor);
router.get('/medicine/:medicineId', getReviewsByMedicine);

module.exports = router;
