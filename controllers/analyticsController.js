const Medicine = require('../models/Medicine');
const Store = require('../models/Store');
const Doctor = require('../models/Doctor');
const Review = require('../models/Review');

// @desc    Get Low Stock Medicines for a Store
// @route   GET /api/analytics/low-stock/:storeId
// @access  Public
const getLowStockMedicines = async (req, res) => {
  try {
    const { storeId } = req.params;
    
    const lowStockMedicines = await Medicine.find({
      storeId,
      $or: [
        { quantity: { $lte: 10 } },
        { status: 'Out of Stock' }
      ]
    }).sort({ quantity: 1 });

    res.status(200).json(lowStockMedicines);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching low stock medicines', error: error.message });
  }
};

// @desc    Get Store Medicines Summary
// @route   GET /api/analytics/store-summary/:storeId
// @access  Public
const getStoreSummary = async (req, res) => {
  try {
    const { storeId } = req.params;
    
    // Using parallel execution for efficiency
    const [totalMedicines, totalAvailable, totalOutOfStock] = await Promise.all([
      Medicine.countDocuments({ storeId }),
      Medicine.countDocuments({ storeId, status: 'Available' }),
      Medicine.countDocuments({ storeId, status: 'Out of Stock' })
    ]);

    res.status(200).json({
      totalMedicines,
      totalAvailable,
      totalOutOfStock
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching store summary', error: error.message });
  }
};

// @desc    Get Trending Medicines (Improved)
// @route   GET /api/analytics/trending
// @access  Public
const getTrendingMedicines = async (req, res) => {
  try {
    // Trending based on highest quantity overall
    const trending = await Medicine.find()
      .sort({ quantity: -1 })
      .limit(10)
      .populate('storeId', 'name address'); // Populate basic store info

    res.status(200).json(trending);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trending medicines', error: error.message });
  }
};

// @desc    Get Admin Dashboard Analytics
// @route   GET /api/analytics/admin
// @access  Public
const getAdminAnalytics = async (req, res) => {
  try {
    const [totalStores, totalMedicines, totalDoctors, totalReviews] = await Promise.all([
      Store.countDocuments(),
      Medicine.countDocuments(),
      Doctor.countDocuments(),
      Review.countDocuments()
    ]);

    res.status(200).json({
      totalStores,
      totalMedicines,
      totalDoctors,
      totalReviews
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin analytics', error: error.message });
  }
};

// @desc    Get Store Rating Analytics
// @route   GET /api/analytics/store-rating/:storeId
// @access  Public
const getStoreRating = async (req, res) => {
  try {
    const { storeId } = req.params;
    
    // Calculate using MongoDB Aggregation Pipeline
    const stats = await Review.aggregate([
      // Match reviews linked to this store (either store reviews directly or medicine/doctor reviews logically linking to store if that was the data model,
      // but schema says storeId is present on type=medicine and type=store. We'll use all reviews referencing this storeId)
      { 
        $match: { 'storeId': storeId } // Mongoose handles string to ObjectId conversion differently in aggregations sometimes, but here storeId might need to be mongoose.Types.ObjectId. Let's use simple find instead for robustness, or handle type safely.
      }
    ]);

    // To avoid ObjectId casting issues in raw aggregation, a simple find & reduce is highly robust and lightweight enough for basic use cases:
    const reviews = await Review.find({ storeId });
    
    const totalReviews = reviews.length;
    let averageRating = 0;
    
    if (totalReviews > 0) {
      const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
      averageRating = Number((sum / totalReviews).toFixed(1));
    }

    res.status(200).json({
      averageRating,
      totalReviews
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching store rating', error: error.message });
  }
};

module.exports = {
  getLowStockMedicines,
  getStoreSummary,
  getTrendingMedicines,
  getAdminAnalytics,
  getStoreRating
};
