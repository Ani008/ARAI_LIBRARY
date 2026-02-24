const express = require('express');
const router = express.Router();
const {
  getAllAbstracts,
  getAbstractById,
  createAbstract,
  updateAbstract,
  deleteAbstract
} = require('../controllers/abstractController');

router.route('/')
  .get(getAllAbstracts)
  .post(createAbstract);

router.route('/:id')
  .get(getAbstractById)
  .put(updateAbstract)
  .delete(deleteAbstract);

module.exports = router;