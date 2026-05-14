const ActivityLog = require('../models/ActivityLog');

// Helper function to get client IP
const getClientIp = (req) => {
  return req.ip || 
         req.headers['x-forwarded-for']?.split(',')[0] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress;
};

// Create activity log entry
const createActivityLog = async (logData) => {
  try {
    const log = new ActivityLog(logData);
    await log.save();
    return log;
  } catch (error) {
    console.error('Error creating activity log:', error);
    throw error;
  }
};

// Log user login
const logLogin = async (req, user) => {
  try {
    await createActivityLog({
      userId: user._id,
      username: user.role,
      action: 'LOGIN',
      description: `Logged into system`,
      entityType: 'System',
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent']
    });
  } catch (error) {
    console.error('Error logging login:', error);
  }
};

// Log user logout
const logLogout = async (req, user) => {
  try {
    await createActivityLog({
      userId: user._id,
      username: user.role,
      action: 'LOGOUT',
      description: `Logged out from system`,
      entityType: 'System',
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent']
    });
  } catch (error) {
    console.error('Error logging logout:', error);
  }
};

// Log periodical creation
const logPeriodicalCreate = async (req, user, periodical) => {
  try {
    await createActivityLog({
      userId: user._id,
      username: user.role || "Unknown",
      action: 'CREATE_PERIODICAL',
      description: `${user.role} added new periodical: ${periodical.title}`,
      entityType: 'Periodical',
      entityId: periodical._id,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent']
    });
  } catch (error) {
    console.error('Error logging periodical creation:', error);
  }
};

// Log periodical update
const logPeriodicalUpdate = async (req, user, periodicalId, periodicalTitle) => {
  try {
    await createActivityLog({
      userId: user.id || user._id,
      username: user.role || "Unknown",
      action: 'UPDATE_PERIODICAL',
      description: `${user.role} Updated Periodical: ${periodicalTitle}`,
      entityType: 'Periodical',
      entityId: periodicalId,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent']
    });
  } catch (error) {
    console.error('Error logging periodical update:', error);
  }
};

// Log periodical deletion
const logPeriodicalDelete = async (req, user, periodicalId, periodicalTitle) => {
  try {
    await createActivityLog({
      userId: user._id,
      username: user.role,
      action: 'DELETE_PERIODICAL',
      description: `${user.role} Deleted Periodical: ${periodicalTitle}`,
      entityType: 'Periodical',
      entityId: periodicalId,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent']
    });
  } catch (error) {
    console.error('Error logging periodical deletion:', error);
  }
};

// Log standard creation
const logStandardCreate = async (req, user, standard) => {
  try {
    await createActivityLog({
      userId: user._id || user.id,
      username: user.role || "Unknown",
      action: 'CREATE_STANDARD',
      description: `${user.role} added new standard: ${standard.title}`,
      entityType: 'Standard',
      entityId: standard._id,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent']
    });
  } catch (error) {
    console.error('Error logging standard creation:', error);
  }
};


// Log standard update
const logStandardUpdate = async (req, user, standardId, standardTitle) => {
  try {
    await createActivityLog({
      userId: user.id || user._id,
      username: user.role || "Unknown",
      action: 'UPDATE_STANDARD',
      description: `${user.role} updated standard: ${standardTitle}`,
      entityType: 'Standard',
      entityId: standardId,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent']
    });
  } catch (error) {
    console.error('Error logging standard update:', error);
  }
};


// Log standard deletion
const logStandardDelete = async (req, user, standardId, standardTitle) => {
  try {
    await createActivityLog({
      userId: user._id,
      username: user.role,
      action: 'DELETE_STANDARD',
      description: `${user.role} Deleted standard: ${standardTitle}`,
      entityType: 'Standard',
      entityId: standardId,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent']
    });
  } catch (error) {
    console.error('Error logging standard deletion:', error);
  }
};

// Get all activity logs with filters
const getActivityLogs = async (req, res) => {
  try {
    const { 
      userId, 
      action, 
      entityType, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 50 
    } = req.query;

    const query = {};

    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (entityType) query.entityType = entityType;
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await ActivityLog.find(query)
      .populate('userId', 'username email firstName lastName')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await ActivityLog.countDocuments(query);

    // Format logs with time
    const formattedLogs = logs.map(log => {
      const date = new Date(log.timestamp);
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;
      const formattedTime = `${hours}:${minutesStr} ${ampm}`;

      return {
        ...log,
        formattedTime,
        formattedEntry: `${formattedTime} : ${log.description}`
      };
    });

    res.status(200).json({
      success: true,
      data: formattedLogs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity logs',
      error: error.message
    });
  }
};

// Get recent activity logs (last 24 hours by default)
const getRecentActivityLogs = async (req, res) => {
  try {
    const { hours = 24, limit = 100 } = req.query;

    const startDate = new Date();
    startDate.setHours(startDate.getHours() - parseInt(hours));

    const logs = await ActivityLog.find({
      timestamp: { $gte: startDate }
    })
      .populate('userId', 'username email firstName lastName')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();

    // Format logs
    const formattedLogs = logs.map(log => {
      const date = new Date(log.timestamp);
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;
      const formattedTime = `${hours}:${minutesStr} ${ampm}`;

      return {
        ...log,
        formattedTime,
        formattedEntry: `${formattedTime} : ${log.description}`
      };
    });

    res.status(200).json({
      success: true,
      data: formattedLogs,
      count: formattedLogs.length
    });
  } catch (error) {
    console.error('Error fetching recent activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activity logs',
      error: error.message
    });
  }
};

// Get activity logs for specific user
const getUserActivityLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await ActivityLog.find({ userId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await ActivityLog.countDocuments({ userId });

    // Format logs
    const formattedLogs = logs.map(log => {
      const date = new Date(log.timestamp);
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;
      const formattedTime = `${hours}:${minutesStr} ${ampm}`;

      return {
        ...log,
        formattedTime,
        formattedEntry: `${formattedTime} : ${log.description}`
      };
    });

    res.status(200).json({
      success: true,
      data: formattedLogs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching user activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user activity logs',
      error: error.message
    });
  }
};

// Get activity statistics
const getActivityStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchQuery = {};
    if (startDate || endDate) {
      matchQuery.timestamp = {};
      if (startDate) matchQuery.timestamp.$gte = new Date(startDate);
      if (endDate) matchQuery.timestamp.$lte = new Date(endDate);
    }

    const stats = await ActivityLog.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const totalLogs = await ActivityLog.countDocuments(matchQuery);
    const uniqueUsers = await ActivityLog.distinct('userId', matchQuery);

    res.status(200).json({
      success: true,
      data: {
        actionBreakdown: stats,
        totalLogs,
        uniqueUsers: uniqueUsers.length
      }
    });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity stats',
      error: error.message
    });
  }
};

module.exports = {
  createActivityLog,
  logLogin,
  logLogout,
  logPeriodicalCreate,
  logPeriodicalUpdate,
  logPeriodicalDelete,
  logStandardCreate,
  logStandardUpdate,
  logStandardDelete,
  getActivityLogs,
  getRecentActivityLogs,
  getUserActivityLogs,
  getActivityStats
};