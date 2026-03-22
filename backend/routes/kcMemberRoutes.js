const express = require('express');
const router = express.Router();
const {
  getAllKCMembers,
  getKCMemberById,
  createKCMember,
  updateKCMember,
  deleteKCMember,
  getMembershipIdPreview 
} = require('../controllers/kcMemberController');

// Global routes
router.route('/')
  .get(getAllKCMembers)
  .post(createKCMember);


router.get('/preview-id', getMembershipIdPreview);

// Dynamic ID routes
router.route('/:id')
  .get(getKCMemberById)
  .put(updateKCMember)
  .delete(deleteKCMember);

module.exports = router;