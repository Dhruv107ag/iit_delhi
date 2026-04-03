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

// Protected routes (store_owner and admin)
router.post('/', requireAuth, requireRole('store_owner', 'admin'), createStore);
router.put('/:id', requireAuth, requireRole('store_owner', 'admin'), updateStore);
router.delete('/:id', requireAuth, requireRole('store_owner', 'admin'), deleteStore);

module.exports = router;

