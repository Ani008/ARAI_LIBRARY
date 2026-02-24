const ArrivalsAndNews = require('../models/ArrivalsAndNews');

// Get all arrivals and news (Production Version)
exports.getAllArrivalsAndNews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const { search, type, priority, status, category } = req.query;

    const query = {};

    // 🔎 Title search only
    if (search && search.trim() !== "") {
      query.title = { $regex: search.trim(), $options: "i" };
    }

    // Filters
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (status) query.status = status;
    if (category) query.category = category;

    const totalRecords = await ArrivalsAndNews.countDocuments(query);

    const items = await ArrivalsAndNews.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      count: items.length,
      data: items,
    });

  } catch (error) {
    next(error);
  }
};

// Get single item
exports.getArrivalsAndNewsById = async (req, res, next) => {
  try {
    const item = await ArrivalsAndNews.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// Create new item
exports.createArrivalsAndNews = async (req, res, next) => {
  try {
    const itemData = {
      type: req.body.type,
      priority: req.body.priority || 'Medium',
      title: req.body.title,
      itemType: req.body.itemType,
      authorPublisher: req.body.authorPublisher,
      callNumber: req.body.callNumber,
      isbnIssn: req.body.isbnIssn,
      description: req.body.description,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      category: req.body.category,
      status: req.body.status || 'Active',
      tagsKeywords: req.body.tagsKeywords || [],
      urlLink: req.body.urlLink,
      attachmentImageUrl: req.body.attachmentImageUrl,
      targetAudience: {
        students: req.body.targetAudience?.students || false,
        faculty: req.body.targetAudience?.faculty || false,
        staff: req.body.targetAudience?.staff || false,
        public: req.body.targetAudience?.public || false
      },
      remarks: req.body.remarks
    };

    const item = await ArrivalsAndNews.create(itemData);

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// Update item
exports.updateArrivalsAndNews = async (req, res, next) => {
  try {
    const updateData = {
      type: req.body.type,
      priority: req.body.priority,
      title: req.body.title,
      itemType: req.body.itemType,
      authorPublisher: req.body.authorPublisher,
      callNumber: req.body.callNumber,
      isbnIssn: req.body.isbnIssn,
      description: req.body.description,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      category: req.body.category,
      status: req.body.status,
      tagsKeywords: req.body.tagsKeywords || [],
      urlLink: req.body.urlLink,
      attachmentImageUrl: req.body.attachmentImageUrl,
      targetAudience: {
        students: req.body.targetAudience?.students || false,
        faculty: req.body.targetAudience?.faculty || false,
        staff: req.body.targetAudience?.staff || false,
        public: req.body.targetAudience?.public || false
      },
      remarks: req.body.remarks
    };

    const item = await ArrivalsAndNews.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      message: 'Item updated successfully',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// Delete item
exports.deleteArrivalsAndNews = async (req, res, next) => {
  try {
    const item = await ArrivalsAndNews.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get statistics
exports.getArrivalsAndNewsStatistics = async (req, res, next) => {
  try {
    const totalItems = await ArrivalsAndNews.countDocuments();
    
    // Count by type
    const typeStats = await ArrivalsAndNews.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Count by priority
    const priorityStats = await ArrivalsAndNews.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Count by status
    const statusStats = await ArrivalsAndNews.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      statistics: {
        totalItems,
        byType: typeStats,
        byPriority: priorityStats,
        byStatus: statusStats
      }
    });
  } catch (error) {
    next(error);
  }
};