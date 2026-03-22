const express = require('express');
const router = express.Router();
const { uploadPaperPDF, handleUploadError } = require('../middleware/upload');
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
} = require('../controllers/ajmtPaperController');

// Main Paper Routes
router.route('/')
  .get(getAllPapers)      // GET /api/ajmt-papers
  .post(uploadPaperPDF, handleUploadError, createPaper);  // POST /api/ajmt-papers (with optional file upload)

router.route('/:id')
  .get(getPaperById)      // GET /api/ajmt-papers/:id
  .put(updatePaper)       // PUT /api/ajmt-papers/:id
  .delete(deletePaper);   // DELETE /api/ajmt-papers/:id

// File Upload Routes
router.route('/:id/upload-pdf')
  .post(uploadPaperPDF, handleUploadError, uploadPDF);  // POST /api/ajmt-papers/:id/upload-pdf

// Email Routes
router.route('/:id/send-email/:reviewerNumber')
  .post(sendReviewerEmail);  // POST /api/ajmt-papers/:id/send-email/:reviewerNumber

// Author Routes
router.route('/:id/authors')
  .post(addAuthor);       // POST /api/ajmt-papers/:id/authors

router.route('/:id/authors/:authorId')
  .put(updateAuthor)      // PUT /api/ajmt-papers/:id/authors/:authorId
  .delete(deleteAuthor);  // DELETE /api/ajmt-papers/:id/authors/:authorId

// Reviewer Routes
router.route('/:id/reviewers')
  .post(addReviewer);     // POST /api/ajmt-papers/:id/reviewers

router.route('/:id/reviewers/:reviewerId')
  .put(updateReviewer)    // PUT /api/ajmt-papers/:id/reviewers/:reviewerId
  .delete(deleteReviewer);// DELETE /api/ajmt-papers/:id/reviewers/:reviewerId


module.exports = router;