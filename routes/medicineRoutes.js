const express = require('express');
const router = express.Router();
const {
  searchMedicines,
  getSuggestions,
  getTrendingMedicines,
  addMedicine,
  getAllMedicines,
  getSingleMedicine,
  updateMedicine,
  deleteMedicine,
  checkoutMedicines
} = require('../controllers/medicineController');

// Define static routes first to prevent conflicts with /:id
router.get('/search', searchMedicines);
router.get('/suggestions', getSuggestions);
router.get('/trending', getTrendingMedicines);
router.post('/checkout', checkoutMedicines);

// Standard CRUD operations
router.route('/')
  .post(addMedicine)
  .get(getAllMedicines);

router.route('/:id')
  .get(getSingleMedicine)
  .put(updateMedicine)
  .delete(deleteMedicine);

module.exports = router;
