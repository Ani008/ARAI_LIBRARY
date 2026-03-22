const AJMTPaper = require('../models/AJMTPaper');
const { sendReviewerEmail } = require('../services/emailService');
const fs = require('fs');
const path = require('path');

exports.getAllPapers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      paperType,
      sortBy = '-createdAt' 
    } = req.query;

    const query = {};
    
    if (status) query.status = status;
    if (paperType) query.paperType = paperType;

    const papers = await AJMTPaper.find(query)
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await AJMTPaper.countDocuments(query);

    res.status(200).json({
      success: true,
      count: papers.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: papers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching papers',
      error: error.message
    });
  }
};

exports.getPaperById = async (req, res) => {
  try {
    const paper = await AJMTPaper.findById(req.params.id);

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    res.status(200).json({
      success: true,
      data: paper
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching paper',
      error: error.message
    });
  }
};

exports.createPaper = async (req, res) => {
  console.log("Body received:", req.body);
  try {
    // 1. Start with everything from the body to ensure uniqueId is included
    const paperData = { ...req.body };

    if (paperData.plagiarismPercentage) {
      paperData.plagiarismPercentage = Number(paperData.plagiarismPercentage);
    }

    // 2. Parse authors if it's a JSON string (from form-data)
    if (typeof paperData.authors === 'string') {
      try {
        paperData.authors = JSON.parse(paperData.authors);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid authors format. Must be a valid JSON array.'
        });
      }
    } else if (!paperData.authors) {
      paperData.authors = [];
    }

    // 3. Parse reviewers if it's a JSON string (from form-data)
    if (typeof paperData.reviewers === 'string') {
      try {
        paperData.reviewers = JSON.parse(paperData.reviewers);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid reviewers format. Must be a valid JSON array.'
        });
      }
    } else if (!paperData.reviewers) {
      paperData.reviewers = [];
    }

    // 4. Handle file upload if present
    if (req.file) {
      paperData.paperFile = req.file.path;
      paperData.paperFileName = req.file.originalname;
      paperData.paperFileSize = req.file.size;
      paperData.paperUploadDate = new Date();
    }

    // 5. Explicitly ensure default status if missing
    if (!paperData.status) {
      paperData.status = 'Draft';
    }

    // 8. Create the paper (This passes the whole cleaned object to Mongoose)
    const paper = await AJMTPaper.create(paperData);

    res.status(201).json({
      success: true,
      message: 'Paper created successfully',
      data: paper
    });

  } catch (error) {
    // Delete uploaded file if paper creation fails
    if (req.file && req.file.path) {
      const fs = require('fs'); // Ensure fs is available
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Error creating paper',
      error: error.message
    });
  }
};

exports.uploadPaperPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const paper = await AJMTPaper.findById(req.params.id);

    if (!paper) {
      // Delete uploaded file if paper not found
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
      
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    // Delete old file if exists
    if (paper.paperFile && fs.existsSync(paper.paperFile)) {
      fs.unlink(paper.paperFile, (err) => {
        if (err) console.error('Error deleting old file:', err);
      });
    }

    // Update paper with new file
    paper.paperFile = req.file.path;
    paper.paperFileName = req.file.originalname;
    paper.paperFileSize = req.file.size;
    paper.paperUploadDate = new Date();

    await paper.save();

    res.status(200).json({
      success: true,
      message: 'PDF uploaded successfully',
      data: paper
    });
  } catch (error) {
    // Delete uploaded file on error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading PDF',
      error: error.message
    });
  }
};

exports.sendReviewerEmail = async (req, res) => {
  try {
    const { id, reviewerNumber } = req.params;
    const { reviewerEmail, customSubject, customBody } = req.body; // Accept custom template

    // Get paper
    const paper = await AJMTPaper.findById(id);

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    // Check if paper has PDF
    if (!paper.paperFile) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded for this paper. Please upload a PDF first.'
      });
    }

    // Check if file exists
    if (!fs.existsSync(paper.paperFile)) {
      return res.status(404).json({
        success: false,
        message: 'Paper file not found on server'
      });
    }

    // Get reviewer by number
    const reviewer = paper.getReviewerByNumber(reviewerNumber);

    if (!reviewer) {
      return res.status(404).json({
        success: false,
        message: `Reviewer ${reviewerNumber} not found`
      });
    }

    // Use provided email or reviewer's email
    const emailTo = reviewerEmail || reviewer.reviewerEmail;

    // Send email with custom template if provided
    const emailResult = await sendReviewerEmail(
      emailTo,
      reviewer.reviewerName,
      paper,
      paper.paperFile,
      customSubject,  // Pass custom subject
      customBody      // Pass custom body
    );

    // Update reviewer email status
    reviewer.emailSent = true;
    reviewer.emailSentDate = new Date();
    await paper.save();

    res.status(200).json({
      success: true,
      message: `Email sent successfully to ${reviewer.reviewerName}`,
      data: {
        reviewerNumber: reviewer.reviewerNumber,
        reviewerName: reviewer.reviewerName,
        emailSentTo: emailTo,
        emailSentDate: reviewer.emailSentDate,
        emailResult: emailResult
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending email',
      error: error.message
    });
  }
};

exports.updatePaper = async (req, res) => {
  try {
    // Validate reviewers count if provided
    if (req.body.reviewers && req.body.reviewers.length > 3) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 3 reviewers allowed'
      });
    }

    const paper = await AJMTPaper.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Paper updated successfully',
      data: paper
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating paper',
      error: error.message
    });
  }
};

exports.deletePaper = async (req, res) => {
  try {
    const paper = await AJMTPaper.findById(req.params.id);

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    // Delete associated file
    if (paper.paperFile && fs.existsSync(paper.paperFile)) {
      fs.unlink(paper.paperFile, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    await paper.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Paper and associated file deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting paper',
      error: error.message
    });
  }
};

exports.addAuthor = async (req, res) => {
  try {
    const paper = await AJMTPaper.findById(req.params.id);

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    const authorData = {
      authorName: req.body.authorName,
      authorAddress: req.body.authorAddress,
      authorCity: req.body.authorCity,
      authorInstitution: req.body.authorInstitution,
      authorEmail: req.body.authorEmail,
      authorPhone: req.body.authorPhone
    };

    paper.authors.push(authorData);
    await paper.save();

    res.status(200).json({
      success: true,
      message: 'Author added successfully',
      data: paper
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error adding author',
      error: error.message
    });
  }
};

exports.updateAuthor = async (req, res) => {
  try {
    const paper = await AJMTPaper.findById(req.params.id);

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    const author = paper.authors.id(req.params.authorId);

    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }

    // Update author fields
    if (req.body.authorName) author.authorName = req.body.authorName;
    if (req.body.authorAddress !== undefined) author.authorAddress = req.body.authorAddress;
    if (req.body.authorCity !== undefined) author.authorCity = req.body.authorCity;
    if (req.body.authorInstitution !== undefined) author.authorInstitution = req.body.authorInstitution;
    if (req.body.authorEmail !== undefined) author.authorEmail = req.body.authorEmail;
    if (req.body.authorPhone !== undefined) author.authorPhone = req.body.authorPhone;

    await paper.save();

    res.status(200).json({
      success: true,
      message: 'Author updated successfully',
      data: paper
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating author',
      error: error.message
    });
  }
};

exports.deleteAuthor = async (req, res) => {
  try {
    const paper = await AJMTPaper.findById(req.params.id);

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    paper.authors.pull(req.params.authorId);
    await paper.save();

    res.status(200).json({
      success: true,
      message: 'Author deleted successfully',
      data: paper
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error deleting author',
      error: error.message
    });
  }
};

exports.addReviewer = async (req, res) => {
  try {
    const paper = await AJMTPaper.findById(req.params.id);

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    if (paper.reviewers.length >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 3 reviewers allowed'
      });
    }

    const reviewerData = {
      reviewerNumber: req.body.reviewerNumber || paper.reviewers.length + 1,
      reviewerName: req.body.reviewerName,
      reviewerEmail: req.body.reviewerEmail,
    };

    paper.reviewers.push(reviewerData);
    await paper.save();

    res.status(200).json({
      success: true,
      message: 'Reviewer added successfully',
      data: paper
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error adding reviewer',
      error: error.message
    });
  }
};

exports.updateReviewer = async (req, res) => {
  try {
    const paper = await AJMTPaper.findById(req.params.id);

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    const reviewer = paper.reviewers.id(req.params.reviewerId);

    if (!reviewer) {
      return res.status(404).json({
        success: false,
        message: 'Reviewer not found'
      });
    }

    // Update reviewer fields
    if (req.body.reviewerName) reviewer.reviewerName = req.body.reviewerName;
    if (req.body.reviewerEmail) reviewer.reviewerEmail = req.body.reviewerEmail;
    if (req.body.reviewerNumber !== undefined) reviewer.reviewerNumber = req.body.reviewerNumber;

    await paper.save();

    res.status(200).json({
      success: true,
      message: 'Reviewer updated successfully',
      data: paper
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating reviewer',
      error: error.message
    });
  }
};

exports.deleteReviewer = async (req, res) => {
  try {
    const paper = await AJMTPaper.findById(req.params.id);

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    paper.reviewers.pull(req.params.reviewerId);
    await paper.save();

    res.status(200).json({
      success: true,
      message: 'Reviewer deleted successfully',
      data: paper
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error deleting reviewer',
      error: error.message
    });
  }
};
