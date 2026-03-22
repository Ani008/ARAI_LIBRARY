const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const {
  getAllPeriodicals,
  getPeriodicalById,
  createPeriodical,
  updatePeriodical,
  deletePeriodical
} = require('../controllers/periodicalController');
const { uploadExcel, handleUploadError } = require('../middleware/upload');
const {
  importPeriodicalsExcel,
} = require("../controllers/excelUpload/excelPeriodicalController");

router.post(
  '/import-excel',
  protect,                  // only logged in
  authorize('ADMIN'),       // only admin
  uploadExcel,
  handleUploadError,
  importPeriodicalsExcel
);

router.route('/')
  .get(getAllPeriodicals)
  .post(protect, authorize('ADMIN'), createPeriodical);

router.route('/:id')
  .get(getPeriodicalById)
  .put(protect, authorize('ADMIN'), updatePeriodical)
  .delete(protect, authorize('ADMIN'), deletePeriodical);

module.exports = router;