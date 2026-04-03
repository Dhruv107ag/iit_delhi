const express = require('express');
const router = express.Router();
const {
  createStore,
  getStores,
  getStore,
  updateStore,
  deleteStore,
  searchStores
} = require('../controllers/storeController');

const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Public routes (for Search page)
router.get('/', getStores);
router.get('/search', searchStores);
router.get('/:id', getStore);

// Protected routes (store_owner only)
router.post('/', requireAuth, requireRole('store_owner'), createStore);
router.put('/:id', requireAuth, requireRole('store_owner'), updateStore);
router.delete('/:id', requireAuth, requireRole('store_owner'), deleteStore);

module.exports = router;

