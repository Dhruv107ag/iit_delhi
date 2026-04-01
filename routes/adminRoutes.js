const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Protect all admin routes for admin only
router.use(requireAuth, requireRole('admin'));

// Example Admin endpoint
router.get('/dashboard', (req, res) => {
  res.status(200).json({ message: 'Welcome to the Admin Dashboard!' });
});

module.exports = router;
