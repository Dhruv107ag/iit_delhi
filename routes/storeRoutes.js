const express = require('express');
const router = express.Router();
const {
  createStore,
  getStores,
  getStore,
  updateStore,
  deleteStore
} = require('../controllers/storeController');

const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Protect all store routes for store_owner only
router.use(requireAuth, requireRole('store_owner'));

// Standard CRUD operations
router.route('/')
  .post(createStore)
  .get(getStores);

router.route('/:id')
  .get(getStore)
  .put(updateStore)
  .delete(deleteStore);

module.exports = router;
