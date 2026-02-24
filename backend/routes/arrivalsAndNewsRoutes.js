const express = require('express');
const router = express.Router();
const {
  getAllArrivalsAndNews,
  getArrivalsAndNewsById,
  createArrivalsAndNews,
  updateArrivalsAndNews,
  deleteArrivalsAndNews,
  getArrivalsAndNewsStatistics
} = require('../controllers/arrivalsAndNewsController');

// Statistics route
router.get('/statistics', getArrivalsAndNewsStatistics);

// Main CRUD routes
router.route('/')
  .get(getAllArrivalsAndNews)
  .post(createArrivalsAndNews);

router.route('/:id')
  .get(getArrivalsAndNewsById)
  .put(updateArrivalsAndNews)
  .delete(deleteArrivalsAndNews);

module.exports = router;