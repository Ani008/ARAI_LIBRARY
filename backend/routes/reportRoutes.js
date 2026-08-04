const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkPermission } = require("../middleware/permissions"); 
const {
  // Standards Reports
  standardsDepartmentWiseReport,
  standardsRequisitionWiseReport, 
  standardsStatusWiseReport,
  standardsNumberWiseReport,
  standardsCompleteDirectoryReport,
  
  // Periodicals Reports
  periodicalsSubscriptionDateReport,
  periodicalsFrequencyWiseReport,
  periodicalsTitleWiseReport,
  periodicalsStatusWiseReport,
  periodicalsCompleteDirectoryReport,
  periodicalsMissingIssuesReport,
  
  // Abstracts Reports
  abstractsSubjectWiseReport,
  abstractsYearlyArchivesReport,
  abstractsPublishedInAAReport,
  abstractsStatusWiseReport,
  abstractsCompleteDirectoryReport,
  
  // KC Members Reports
  kcMembersCompleteReport,
  kcMembersPaymentStatusReport,
  kcMembersOverdueReport,
  kcMembersSubscriptionAnalysisReport,
  kcMembersUpcomingRenewalsReport,
  kcMembersPrintAddressLabelsReport,

  arrivalsNewsCategoryWiseReport,
  arrivalsNewsTypeWiseReport,
  arrivalsNewsPriorityWiseReport,
  arrivalsNewsStatusWiseReport,
  arrivalsNewsCompleteReport,

  ajmtStatusWiseReport,
  ajmtReport,

  completeBackupReport,
} = require('../controllers/reportController');

router.use(protect);
router.use(checkPermission("reports"));

// ==================== STANDARDS REPORTS ====================
router.get('/standards/department-wise', standardsDepartmentWiseReport);
router.get('/standards/requisition-wise', standardsRequisitionWiseReport);
router.get('/standards/status-wise', standardsStatusWiseReport);
router.get('/standards/number-wise', standardsNumberWiseReport);
router.get('/standards/complete-directory', standardsCompleteDirectoryReport);

// ==================== PERIODICALS REPORTS ====================
router.get('/periodicals/subscription-date', periodicalsSubscriptionDateReport);
router.get('/periodicals/frequency-wise', periodicalsFrequencyWiseReport);
router.get('/periodicals/missing-issues', periodicalsMissingIssuesReport);
router.get('/periodicals/title-wise', periodicalsTitleWiseReport);
router.get('/periodicals/status-wise', periodicalsStatusWiseReport);
router.get('/periodicals/complete-directory', periodicalsCompleteDirectoryReport);

// ==================== ABSTRACTS REPORTS ====================
router.get('/abstracts/subject-wise', abstractsSubjectWiseReport);
router.get('/abstracts/year-wise', abstractsYearlyArchivesReport);
router.get('/abstracts/published-in-aa', abstractsPublishedInAAReport);
router.get('/abstracts/status-wise', abstractsStatusWiseReport);
router.get('/abstracts/complete-directory', abstractsCompleteDirectoryReport);

// ==================== KC MEMBERS REPORTS ====================
router.get('/kcmembers/complete', kcMembersCompleteReport);
router.get('/kcmembers/payment-status', kcMembersPaymentStatusReport);
router.get('/kcmembers/overdue', kcMembersOverdueReport);
router.get('/kcmembers/subscription-analysis', kcMembersSubscriptionAnalysisReport);
router.get('/kcmembers/upcoming-renewals', kcMembersUpcomingRenewalsReport);
router.get('/kcmembers/address-labels', kcMembersPrintAddressLabelsReport);

// ==================== ARRIVALS & NEWS REPORTS ====================
router.get('/arrivals-news/category-wise', arrivalsNewsCategoryWiseReport);
router.get('/arrivals-news/type-wise', arrivalsNewsTypeWiseReport);
router.get('/arrivals-news/priority-wise', arrivalsNewsPriorityWiseReport);
router.get('/arrivals-news/status-wise', arrivalsNewsStatusWiseReport);
router.get('/arrivals-news/complete', arrivalsNewsCompleteReport);


router.get("/ajmt/status", ajmtStatusWiseReport);
router.get("/ajmt/complete", ajmtReport);


router.get("/backup/complete", completeBackupReport);

module.exports = router;