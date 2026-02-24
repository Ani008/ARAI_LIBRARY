const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  // Standards Reports
  standardsDepartmentWiseReport,
  standardsCategoryWiseReport,
  standardsAmendmentsReport,
  
  // Periodicals Reports
  periodicalsYearWiseReport,
  periodicalsFrequencyWiseReport,
  periodicalsMissingIssuesReport,
  
  // Abstracts Reports
  abstractsDepartmentWiseReport,
  abstractsYearWiseReport,
  abstractsKeywordAnalysisReport,
  
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
router.get('/standards/category-wise', protect, standardsCategoryWiseReport);
router.get('/standards/amendments', protect, standardsAmendmentsReport);

// ==================== PERIODICALS REPORTS ====================
router.get('/periodicals/year-wise', protect, periodicalsYearWiseReport);
router.get('/periodicals/frequency-wise', protect, periodicalsFrequencyWiseReport);
router.get('/periodicals/missing-issues', protect, periodicalsMissingIssuesReport);

// ==================== ABSTRACTS REPORTS ====================
router.get('/abstracts/department-wise', protect, abstractsDepartmentWiseReport);
router.get('/abstracts/year-wise', protect, abstractsYearWiseReport);
router.get('/abstracts/keyword-analysis', protect, abstractsKeywordAnalysisReport);

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