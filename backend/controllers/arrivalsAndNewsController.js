const ArrivalsAndNews = require("../models/ArrivalsAndNews");

// ===============================
// Get All (with pagination + search)
// ===============================
exports.getAllArrivalsAndNews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const { search, startDate, endDate } = req.query;

    const query = {};

    // 🔎 search by heading
    if (search && search.trim() !== "") {
      query.heading = { $regex: search.trim(), $options: "i" };
    }

    // date filter
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const totalRecords = await ArrivalsAndNews.countDocuments(query);

    const items = await ArrivalsAndNews.find(query)
      .sort({ date: -1 })
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

// ===============================
// Get Single
// ===============================
exports.getArrivalsAndNewsById = async (req, res, next) => {
  try {
    const item = await ArrivalsAndNews.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// Create (date + heading + rows)
// ===============================
exports.createArrivalNews = async (req, res) => {
  try {
    const { date, heading, news } = req.body;

    const newEntry = new ArrivalsAndNews({
      date,
      heading,
      news,
    });

    const saved = await newEntry.save();

    res.status(201).json({
      success: true,
      data: saved,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error creating news",
    });
  }
};

// ===============================
// Add Row (Add News Button)
// ===============================
exports.addNewsRow = async (req, res) => {
  try {
    const { id } = req.params;
    const newRow = req.body;

    const updated = await ArrivalsAndNews.findByIdAndUpdate(
      id,
      { $push: { news: newRow } },
      { new: true },
    );

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding row",
    });
  }
};

// ===============================
// Update full entry
// ===============================
exports.updateArrivalsAndNews = async (req, res, next) => {
  try {
    const { date, heading, news } = req.body;

    const item = await ArrivalsAndNews.findByIdAndUpdate(
      req.params.id,
      { date, heading, news },
      { new: true, runValidators: true },
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.json({
      success: true,
      message: "Updated successfully",
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// Delete
// ===============================
exports.deleteArrivalsAndNews = async (req, res, next) => {
  try {
    const item = await ArrivalsAndNews.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// Statistics
// ===============================
exports.getArrivalsAndNewsStatistics = async (req, res, next) => {
  try {
    const totalItems = await ArrivalsAndNews.countDocuments();

    const totalNewsRows = await ArrivalsAndNews.aggregate([
      { $unwind: "$news" },
      { $count: "totalRows" },
    ]);

    res.json({
      success: true,
      statistics: {
        totalEntries: totalItems,
        totalNewsRows: totalNewsRows[0]?.totalRows || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
