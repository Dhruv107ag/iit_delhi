const express = require('express');
const router = express.Router();
const {
  addDoctor,
  getDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor,
  searchDoctors
} = require('../controllers/doctorController');

// Standard CRUD operations
router.get('/search', searchDoctors);

router.route('/')
  .post(addDoctor)
  .get(getDoctors);

router.route('/:id')
  .get(getDoctor)
  .put(updateDoctor)
  .delete(deleteDoctor);

module.exports = router;
