const Review = require('../models/Review');
const Medicine = require('../models/Medicine');
const Doctor = require('../models/Doctor');
const Store = require('../models/Store');
const { extractUserData } = require('../middleware/authMiddleware');

// @desc    Add a new review
// @route   POST /api/reviews
// @access  Public
const addReview = async (req, res) => {
  try {
    const { type, medicineId, doctorId, storeId, rating, comment } = req.body;

    // Validate type
    if (!['medicine', 'doctor', 'store'].includes(type)) {
      return res.status(400).json({ message: 'Invalid review type. Must be medicine, doctor, or store' });
    }

    // Validate based on type
    if (type === 'medicine') {
      if (!medicineId) return res.status(400).json({ message: 'medicineId is required' });
      if (!storeId) return res.status(400).json({ message: 'storeId is required for medicine reviews' });
      
      const medicineExists = await Medicine.findById(medicineId);
      if (!medicineExists) return res.status(404).json({ message: 'Medicine not found' });
      
      const storeExists = await Store.findById(storeId);
      if (!storeExists) return res.status(404).json({ message: 'Store not found' });
      
    } else if (type === 'doctor') {
      if (!doctorId) return res.status(400).json({ message: 'doctorId is required' });
      
      const doctorExists = await Doctor.findById(doctorId);
      if (!doctorExists) return res.status(404).json({ message: 'Doctor not found' });
      
    } else if (type === 'store') {
      if (!storeId) return res.status(400).json({ message: 'storeId is required' });
      
      const storeExists = await Store.findById(storeId);
      if (!storeExists) return res.status(404).json({ message: 'Store not found' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const reviewOpts = { type, rating, comment };
    if (medicineId) reviewOpts.medicineId = medicineId;
    if (doctorId) reviewOpts.doctorId = doctorId;
    if (storeId) reviewOpts.storeId = storeId;
    
    const user = extractUserData(req);
    if (user?.id) reviewOpts.userId = user.id;

    const newReview = new Review(reviewOpts);
    const savedReview = await newReview.save();

    res.status(201).json(savedReview);
  } catch (error) {
    res.status(500).json({ message: 'Error adding review', error: error.message });
  }
};

// Helper function to calculate review stats
const formatReviewsResponse = (reviews) => {
  const totalReviews = reviews.length;
  let averageRating = 0;
  
  if (totalReviews > 0) {
    const sum = reviews.reduce((acc, current) => acc + current.rating, 0);
    averageRating = (sum / totalReviews).toFixed(1);
  }

  return {
    totalReviews,
    averageRating: Number(averageRating),
    reviews
  };
};

// @desc    Get Reviews by Store
// @route   GET /api/reviews/store/:storeId
// @access  Public
const getReviewsByStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const reviews = await Review.find({ storeId, type: 'store' }).sort({ createdAt: -1 });
    
    res.status(200).json(formatReviewsResponse(reviews));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching store reviews', error: error.message });
  }
};

// @desc    Get Reviews by Doctor
// @route   GET /api/reviews/doctor/:doctorId
// @access  Public
const getReviewsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const reviews = await Review.find({ doctorId, type: 'doctor' })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(formatReviewsResponse(reviews));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctor reviews', error: error.message });
  }
};

// @desc    Get Reviews authored by User
// @route   GET /api/reviews/user
// @access  Private (Logged-in user)
const getUserReviews = async (req, res) => {
  try {
    if (!req.session?.user) return res.status(401).json({ message: 'Not authenticated' });
    
    const reviews = await Review.find({ userId: req.session.user.id })
      .populate('doctorId', 'name specialization')
      .populate('medicineId', 'name')
      .populate('storeId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(formatReviewsResponse(reviews));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user reviews', error: error.message });
  }
};

// @desc    Get Reviews by Medicine
// @route   GET /api/reviews/medicine/:medicineId
// @access  Public
const getReviewsByMedicine = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const reviews = await Review.find({ medicineId, type: 'medicine' }).sort({ createdAt: -1 });

    res.status(200).json(formatReviewsResponse(reviews));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching medicine reviews', error: error.message });
  }
};

// @desc    Get All Reviews (Admin only)
// @route   GET /api/reviews
// @access  Private (Admin)
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('medicineId', 'name')
      .populate('doctorId', 'name')
      .populate('storeId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

module.exports = {
  addReview,
  getReviewsByStore,
  getReviewsByDoctor,
  getReviewsByMedicine,
  getUserReviews,
  getAllReviews
};
