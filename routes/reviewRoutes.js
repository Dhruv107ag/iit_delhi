const express = require('express');
const router = express.Router();
const {
  addReview,
  getReviewsByStore,
  getReviewsByDoctor,
  getReviewsByMedicine,
  getUserReviews,
  getAllReviews
} = require('../controllers/reviewController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Get all reviews (Admin only)
router.get('/', requireAuth, requireRole('admin'), getAllReviews);

// Get User's reviews
router.get('/user', requireAuth, getUserReviews);

// Add a new review
router.post('/', addReview);

// Get reviews based on target references
router.get('/store/:storeId', getReviewsByStore);
router.get('/doctor/:doctorId', getReviewsByDoctor);
router.get('/medicine/:medicineId', getReviewsByMedicine);

module.exports = router;
