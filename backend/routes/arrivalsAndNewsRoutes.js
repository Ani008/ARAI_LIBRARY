const express = require('express');
const router = express.Router();
const { sendArrivalNewsEmail } = require('../controllers/emailController');

const {
  getAllArrivalsAndNews,
  getArrivalsAndNewsById,
  createArrivalNews,
  addNewsRow,
  updateArrivalsAndNews,
  deleteArrivalsAndNews,
  getArrivalsAndNewsStatistics
} = require('../controllers/arrivalsAndNewsController');



router.post("/send-email", sendArrivalNewsEmail);
// Statistics
router.get('/statistics', getArrivalsAndNewsStatistics);


// Add single row (IMPORTANT)
router.post('/add-row/:id', addNewsRow);


// Main CRUD
router.route('/')
  .get(getAllArrivalsAndNews)
  .post(createArrivalNews);

router.route('/:id')
  .get(getArrivalsAndNewsById)
  .put(updateArrivalsAndNews)
  .delete(deleteArrivalsAndNews);


module.exports = router;