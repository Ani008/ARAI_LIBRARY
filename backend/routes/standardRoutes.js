const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
const {
  getAllStandards,
  getStandardById,
  createStandard,
  updateStandard,
  deleteStandard
} = require('../controllers/standardController');

router.route('/')
  .get(getAllStandards)
  .post(protect, authorize('ADMIN'), createStandard);

router.route('/:id')
  .get(getStandardById)
  .put(protect, authorize('ADMIN'), updateStandard)
  .delete(protect, authorize('ADMIN'), deleteStandard);


module.exports = router;