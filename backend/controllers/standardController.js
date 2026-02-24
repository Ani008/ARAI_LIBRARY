const Standard = require("../models/Standard");
const { logStandardDelete } = require("../controllers/activityLogController");
const { logStandardCreate } = require("../controllers/activityLogController");
const { logStandardUpdate } = require("../controllers/activityLogController");

// @route   GET /api/standards
// @route   GET /api/standards
// Example:
// /api/standards?page=1&limit=5&search=iso&department=Mechanical&category=ASTM&status=Active

exports.getAllStandards = async (req, res, next) => {
  try {
    console.log("SEARCH VALUE:", req.query.search);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // 2️⃣ Extract filters
    const { search, department, category, status } = req.query;

    // 3️⃣ Build dynamic query object
    const query = {};

    // 🔎 Global search (ICN, Standard No, Title)
    if (search && search.trim() !== "") {
      const searchValue = search.trim();

      query.$or = [
        { title: { $regex: searchValue, $options: "i" } },
        { standardNumber: { $regex: searchValue, $options: "i" } },
      ];

      // If search is a number, also match icnNumber exactly
      if (!isNaN(searchValue)) {
        query.$or.push({ icnNumber: Number(searchValue) });
      }
    }

    if (department) query.department = department;
    if (category) query.category = category;
    if (status) query.status = status;

    // 4️⃣ Get total filtered count
    const totalRecords = await Standard.countDocuments(query);

    // 5️⃣ Fetch paginated filtered records
    const standards = await Standard.find(query)
      .sort({ icnNumber: -1 })
      .skip(skip)
      .limit(limit);

    // 6️⃣ Send response
    res.json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      count: standards.length,
      data: standards,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single standard
// @route   GET /api/standards/:id
exports.getStandardById = async (req, res, next) => {
  try {
    const standard = await Standard.findById(req.params.id);

    if (!standard) {
      return res.status(404).json({
        success: false,
        message: "Standard not found",
      });
    }

    res.json({
      success: true,
      data: standard,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/standards
exports.createStandard = async (req, res, next) => {
  try {
    const standard = await Standard.create(req.body);

    // LOG THE ACTIVITY
    await logStandardCreate(req, req.user, standard);

    res.status(201).json({
      success: true,
      message: "Standard created successfully",
      data: standard,
    });
  } catch (error) {
    // Handle Mongoose duplicate key error (for standardNumber)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          "Duplicate field value entered: Standard Number already exists",
      });
    }
    next(error);
  }
};

// @route   PUT /api/standards/:id
exports.updateStandard = async (req, res, next) => {
  try {
    // We use req.body directly to capture all updated fields
    const standard = await Standard.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    await logStandardUpdate(req, req.user, standard._id, standard.title);

    if (!standard) {
      return res.status(404).json({
        success: false,
        message: "Standard not found",
      });
    }

    res.json({
      success: true,
      message: "Standard updated successfully",
      data: standard,
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/standards/:id
exports.deleteStandard = async (req, res, next) => {
  try {
    const standard = await Standard.findByIdAndDelete(req.params.id);

    if (!standard) {
      return res.status(404).json({
        success: false,
        message: "Standard not found",
      });
    }

    await Standard.findByIdAndDelete(req.params.id);

    // ✅ Call your logger function
    await logStandardDelete(
      req,
      req.user, // Comes from protect middleware
      standard._id,
      standard.title,
    );

    res.json({
      success: true,
      message: "Standard deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
