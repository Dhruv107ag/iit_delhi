const express = require('express');
const router = express.Router();
const {
  addReview,
  getReviewsByStore,
  getReviewsByDoctor,
  getReviewsByMedicine
} = require('../controllers/reviewController');

// Add a new review
router.post('/', addReview);

// Get reviews based on target references
router.get('/store/:storeId', getReviewsByStore);
router.get('/doctor/:doctorId', getReviewsByDoctor);
router.get('/medicine/:medicineId', getReviewsByMedicine);

module.exports = router;
