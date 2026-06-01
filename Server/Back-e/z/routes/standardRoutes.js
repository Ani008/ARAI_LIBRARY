const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
const {
  getAllStandards,
  getStandardById,
  createStandard,
  updateStandard,
  deleteStandard,
  getNextIcn,
  getUniqueFieldValues
} = require('../controllers/standardController');

const { uploadExcel, handleUploadError } = require('../middleware/upload');

const {
  importStandardsExcel
} = require("../controllers/excelUpload/excelStandardController");

router.post(
  '/import-excel',
  protect,     // only admin
  uploadExcel,
  handleUploadError,
  importStandardsExcel
);

router.get('/next-icn', getNextIcn);
router.get('/unique-values/:field', getUniqueFieldValues);

router.route('/')
  .get(getAllStandards)
  .post(protect, createStandard);

router.route('/:id')
  .get(getStandardById)
  .put(protect, updateStandard)
  .delete(protect, deleteStandard);




module.exports = router;