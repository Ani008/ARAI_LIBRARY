const express = require('express');
const router = express.Router();
const { uploadPaperPDF, handleUploadError, uploadExcel } = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');
const {
  getAllPapers,
  getPaperById,
  createPaper,
  updatePaper,
  deletePaper,
  uploadPaperPDF: uploadPDF,
  sendReviewerEmail,
  addAuthor,
  updateAuthor,
  deleteAuthor,
  addReviewer,
  updateReviewer,
  deleteReviewer,
  downloadPaper,
  sendAuthorsEmail,
} = require('../controllers/ajmtPaperController');

const {
  importAJMTPapers
} = require("../controllers/excelUpload/excelAJMTController");


router.post(
  '/import-excel',
  protect,                  
  authorize('ADMIN'),       
  uploadExcel,
  handleUploadError,
  importAJMTPapers
);

// Main Paper Routes
router.route('/')
  .get(getAllPapers)      
  .post(uploadPaperPDF, handleUploadError, createPaper);  

router.route('/:id')
  .get(getPaperById)      
  .put(updatePaper)       
  .delete(deletePaper);   

// File Upload Routes
router.route('/:id/upload-pdf')
  .post(uploadPaperPDF, handleUploadError, uploadPDF);  

// Email Routes
router.route('/:id/send-email/:reviewerNumber')
  .post(sendReviewerEmail);  

// Author Routes
router.route('/:id/authors')
  .post(addAuthor);      

router.route('/:id/authors/:authorId')
  .put(updateAuthor)      
  .delete(deleteAuthor);  

// Reviewer Routes
router.route('/:id/reviewers')
  .post(addReviewer);     

router.route('/:id/reviewers/:reviewerId')
  .put(updateReviewer)   
  .delete(deleteReviewer);

router.route('/:id/download')
  .get(downloadPaper);

router.post('/:id/send-authors-email', sendAuthorsEmail);
  
module.exports = router;