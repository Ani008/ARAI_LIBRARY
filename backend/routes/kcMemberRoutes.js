const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Import the main KC Member controllers
const {
  getAllKCMembers,
  getKCMemberById,
  createKCMember,
  updateKCMember,
  deleteKCMember,
  getMembershipIdPreview 
} = require('../controllers/kcMemberController');

// Import the upload middleware
const { uploadExcel, handleUploadError } = require('../middleware/upload');

// Import the specific Excel import controller
const {
  importKCMembers
} = require("../controllers/excelUpload/excelKcMembershipController");

// 1. Specialized / Action Routes
router.post(
  '/import-excel', 
  protect, 
  authorize('ADMIN'), 
  uploadExcel,
  handleUploadError,
  importKCMembers
);

// Route to preview the next generated ID (if you have this logic in your controller)
router.get('/preview-id',getMembershipIdPreview);

// 2. Collection Routes
router.route('/')
  .get(getAllKCMembers)
  .post(createKCMember);

// 3. Document Specific Routes (Keep :id at the bottom)
router.route('/:id')
  .get(getKCMemberById)
  .put(updateKCMember)
  .delete(deleteKCMember);

module.exports = router;