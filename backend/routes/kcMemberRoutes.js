const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { checkPermission } = require("../middleware/permissions");

const router = express.Router();

const {
  getAllKCMembers,
  getKCMemberById,
  createKCMember,
  updateKCMember,
  deleteKCMember,
  getMembershipIdPreview,
  getMembershipCounts
} = require('../controllers/kcMemberController');

const { uploadExcel, handleUploadError } = require('../middleware/upload');

const {
  importKCMembers
} = require("../controllers/excelUpload/excelKcMembershipController");

router.use(protect);
router.use(checkPermission("kcMembers"));

router.post(
  '/import-excel',
  uploadExcel,
  handleUploadError,
  importKCMembers
);

// Route to preview the next generated ID (if you have this logic in your controller)
router.get('/preview-id',getMembershipIdPreview);

// Route to get membership counts
router.get('/counts', getMembershipCounts);

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