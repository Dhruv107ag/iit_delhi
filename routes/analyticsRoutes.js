const express = require('express');
const router = express.Router();
const {
  getLowStockMedicines,
  getStoreSummary,
  getTrendingMedicines,
  getAdminAnalytics,
  getStoreRating
} = require('../controllers/analyticsController');

// All endpoints match the requested Dashboard Analytics routes

// Store Dashboard
router.get('/low-stock/:storeId', getLowStockMedicines);
router.get('/store-summary/:storeId', getStoreSummary);

// Trending Analytics
router.get('/trending', getTrendingMedicines);

// Admin Analytics
router.get('/admin', getAdminAnalytics);

// Review Analytics
router.get('/store-rating/:storeId', getStoreRating);

module.exports = router;
