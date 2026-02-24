const express = require('express');
const router = express.Router();
const {
  getAllKCMembers,
  getKCMemberById,
  createKCMember,
  updateKCMember,
  deleteKCMember
} = require('../controllers/kcMemberController');

router.route('/')
  .get(getAllKCMembers)
  .post(createKCMember);

router.route('/:id')
  .get(getKCMemberById)
  .put(updateKCMember)
  .delete(deleteKCMember);

module.exports = router;