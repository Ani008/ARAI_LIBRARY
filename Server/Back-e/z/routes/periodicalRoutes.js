const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
  getAllPeriodicals,
  getPeriodicalById,
  createPeriodical,
  updatePeriodical,
  deletePeriodical,
  getPeriodicalSuggestions,
  bulkDisposalByYear,
  getDisposalPreviewCount
} = require('../controllers/periodicalController');

const { uploadExcel, handleUploadError } = require('../middleware/upload');

const {
  importPeriodicalsExcel,
} = require("../controllers/excelUpload/excelPeriodicalController");

router.get('/suggestions', getPeriodicalSuggestions);

router.patch('/bulk-disposal', bulkDisposalByYear);

router.get('/disposal-preview', getDisposalPreviewCount);

router.post(
  '/import-excel',
  protect, // any logged in user
  uploadExcel,
  handleUploadError,
  importPeriodicalsExcel
);

router.route('/')
  .get(getAllPeriodicals)
  .post(protect, createPeriodical);

router.route('/:id')
  .get(getPeriodicalById)
  .put(protect, updatePeriodical)
  .delete(protect, deletePeriodical);

module.exports = router;