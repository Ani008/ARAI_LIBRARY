const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();
const {
  getAllAbstracts,
  getAbstractById,
  createAbstract,
  updateAbstract,
  deleteAbstract
} = require('../controllers/abstractController');

const { uploadExcel, handleUploadError } = require('../middleware/upload');
const {
  importAbstractsExcel
} = require("../controllers/excelUpload/excelAbstractController");

router.post(
  '/import-excel',
  protect,                  // only logged in
  authorize('ADMIN'),       // only admin
  uploadExcel,
  handleUploadError,
  importAbstractsExcel
);

router.route('/')
  .get(getAllAbstracts)
  .post(createAbstract);

router.route('/:id')
  .get(getAbstractById)
  .put(updateAbstract)
  .delete(deleteAbstract);

module.exports = router;