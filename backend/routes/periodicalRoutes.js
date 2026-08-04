const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkPermission } = require("../middleware/permissions");

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

router.use(protect);
router.use(checkPermission("periodicals"));

router.get('/suggestions', getPeriodicalSuggestions);

router.patch('/bulk-disposal', bulkDisposalByYear);

router.get('/disposal-preview', getDisposalPreviewCount);

router.post(
  '/import-excel',
  uploadExcel,
  handleUploadError,
  importPeriodicalsExcel
);

router.route('/')
  .get(getAllPeriodicals)
  .post(createPeriodical);

router.route('/:id')
  .get(getPeriodicalById)
  .put(updatePeriodical)
  .delete(deletePeriodical);

module.exports = router;