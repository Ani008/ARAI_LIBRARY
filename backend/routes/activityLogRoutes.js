const express = require('express');
const router = express.Router();
const {
  getActivityLogs,
  getRecentActivityLogs,
  getUserActivityLogs,
  getActivityStats
} = require('../controllers/activityLogController');
const { protect, authorize } = require('../middleware/auth'); // Adjust path as needed

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/activity-logs
 * @desc    Get all activity logs with filters
 * @access  Private (Admin)
 * @query   userId, action, entityType, startDate, endDate, page, limit
 */
router.get('/', authorize('ADMIN'), getActivityLogs);

/**
 * @route   GET /api/activity-logs/recent
 * @desc    Get recent activity logs (last 24 hours by default)
 * @access  Private (Admin)
 * @query   hours, limit
 */
router.get('/recent', authorize('ADMIN'), getRecentActivityLogs);

/**
 * @route   GET /api/activity-logs/stats
 * @desc    Get activity statistics
 * @access  Private (Admin)
 * @query   startDate, endDate
 */
router.get('/stats', authorize('ADMIN'), getActivityStats);

/**
 * @route   GET /api/activity-logs/user/:userId
 * @desc    Get activity logs for specific user
 * @access  Private (Admin or own user)
 * @param   userId - User ID
 * @query   page, limit
 */
router.get('/user/:userId', getUserActivityLogs);

module.exports = router;