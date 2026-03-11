const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
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
  arrivalsNewsCompleteReport
} = require('../controllers/reportController');

// ==================== STANDARDS REPORTS ====================
router.get('/standards/department-wise', protect, standardsDepartmentWiseReport);
router.get('/standards/requisition-wise', protect, standardsRequisitionWiseReport);
router.get('/standards/status-wise', protect, standardsStatusWiseReport);
router.get('/standards/number-wise', protect, standardsNumberWiseReport);
router.get('/standards/complete-directory', protect, standardsCompleteDirectoryReport);

// ==================== PERIODICALS REPORTS ====================
router.get('/periodicals/subscription-date', protect, periodicalsSubscriptionDateReport);
router.get('/periodicals/frequency-wise', protect, periodicalsFrequencyWiseReport);
router.get('/periodicals/missing-issues', protect, periodicalsMissingIssuesReport);
router.get('/periodicals/title-wise', protect, periodicalsTitleWiseReport);
router.get('/periodicals/status-wise', protect, periodicalsStatusWiseReport);
router.get('/periodicals/complete-directory', protect, periodicalsCompleteDirectoryReport);

// ==================== ABSTRACTS REPORTS ====================
router.get('/abstracts/subject-wise', protect, abstractsSubjectWiseReport);
router.get('/abstracts/year-wise', protect, abstractsYearlyArchivesReport);
router.get('/abstracts/published-in-aa', protect, abstractsPublishedInAAReport);
router.get('/abstracts/status-wise', protect, abstractsStatusWiseReport);
router.get('/abstracts/complete-directory', protect, abstractsCompleteDirectoryReport);

// ==================== KC MEMBERS REPORTS ====================
router.get('/kcmembers/complete', protect, kcMembersCompleteReport);
router.get('/kcmembers/payment-status', protect, kcMembersPaymentStatusReport);
router.get('/kcmembers/overdue', protect, kcMembersOverdueReport);
router.get('/kcmembers/subscription-analysis', protect, kcMembersSubscriptionAnalysisReport);
router.get('/kcmembers/upcoming-renewals', protect, kcMembersUpcomingRenewalsReport);
router.get('/kcmembers/address-labels', protect, kcMembersPrintAddressLabelsReport);

// ==================== ARRIVALS & NEWS REPORTS ====================
router.get('/arrivals-news/category-wise', protect, arrivalsNewsCategoryWiseReport);
router.get('/arrivals-news/type-wise', protect, arrivalsNewsTypeWiseReport);
router.get('/arrivals-news/priority-wise', protect, arrivalsNewsPriorityWiseReport);
router.get('/arrivals-news/status-wise', protect, arrivalsNewsStatusWiseReport);
router.get('/arrivals-news/complete', protect, arrivalsNewsCompleteReport);

module.exports = router;