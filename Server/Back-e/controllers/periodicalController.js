const Periodical = require("../models/Periodical");
const { logPeriodicalDelete } = require("../controllers/activityLogController");
const { logPeriodicalCreate } = require("../controllers/activityLogController");
const { logPeriodicalUpdate } = require("../controllers/activityLogController");

// Get all periodicals
exports.getAllPeriodicals = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // 2️⃣ Extract filters
    const { search, frequency, language, status, startYear, endYear } =
      req.query;

    // 3️⃣ Build dynamic query object
    const query = {};

    // 🔎 Global search (ICN, Standard No, Title)
    if (search && search.trim() !== "") {
      const searchValue = search.trim();

      query.$or = [
        { title: { $regex: searchValue, $options: "i" } },
        { publisher: { $regex: searchValue, $options: "i" } },
        { icnNumber: { $regex: searchValue, $options: "i" } },
      ];

      // If search is a number, also match icnNumber exactly
      if (!isNaN(searchValue)) {
        query.$or.push({ icnNumber: Number(searchValue) });
      }
    }

    if (startYear && endYear) {
      query.periodicalYear = {
        $gte: Number(startYear),
        $lte: Number(endYear),
      };
    } else if (startYear) {
      query.periodicalYear = { $gte: Number(startYear) };
    } else if (endYear) {
      query.periodicalYear = { $lte: Number(endYear) };
    }

    if (frequency) query.frequency = frequency;
    if (language) query.language = language;
    if (status) query.status = status;

    // 4️⃣ Get total filtered count
    const totalRecords = await Periodical.countDocuments(query);

    // 5️⃣ Fetch paginated filtered records
    const periodicals = await Periodical.find(query)
      .sort({ icnNumber: -1 })
      .skip(skip)
      .limit(limit);

    // 6️⃣ Send response
    res.json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      count: periodicals.length,
      data: periodicals,
    });
  } catch (error) {
    next(error);
  }
};

// Get single periodical
exports.getPeriodicalById = async (req, res, next) => {
  try {
    const periodical = await Periodical.findById(req.params.id);

    if (!periodical) {
      return res.status(404).json({
        success: false,
        message: "Periodical not found",
      });
    }

    res.json({
      success: true,
      data: periodical,
    });
  } catch (error) {
    next(error);
  }
};

exports.createPeriodical = async (req, res, next) => {
  try {
    const periodicalData = {
      // ... your existing data mapping ...
      title: req.body.title,
      subtitle: req.body.subtitle,
      authors: req.body.authors || [],
      publisher: req.body.publisher,
      issn: req.body.issn,
      volume: req.body.volume,
      issue: req.body.issue,
      periodicalMonth: req.body.periodicalMonth,
      periodicalYear: req.body.periodicalYear,
      series: req.body.series,
      notes: req.body.notes,
      subscriptionDate: req.body.subscriptionDate,
      frequency: req.body.frequency,
      receiptDate: req.body.receiptDate,
      departmentToIssue: req.body.departmentToIssue,
      departmentIssueDate: req.body.departmentIssueDate,
      addOnCopies: req.body.addOnCopies,
      orderNo: req.body.orderNo,
      poNo: req.body.poNo,
      vendorDetails: {
        name: req.body.vendorDetails?.name || "",
        phone: req.body.vendorDetails?.phone || null,
        email: req.body.vendorDetails?.email || "",
      },
      mode: req.body.mode,
      url: req.body.url,
      paymentDetails: {
        currency: req.body.paymentDetails?.currency || "",
        amount: req.body.paymentDetails?.amount || null,
      },
      remarksForPayment: req.body.remarksForPayment,
      language: req.body.language,
      status: req.body.status || "Active",
    };

    const periodical = await Periodical.create(periodicalData);

    // LOG THE ACTIVITY
    await logPeriodicalCreate(req, req.user, periodical);
  } catch (error) {
    next(error);
  }
};

// Update periodical
exports.updatePeriodical = async (req, res, next) => {
  try {
    const updateData = {
      title: req.body.title,
      subtitle: req.body.subtitle,
      authors: req.body.authors || [],
      publisher: req.body.publisher,
      issn: req.body.issn,
      volume: req.body.volume,
      issue: req.body.issue,
      periodicalMonth: req.body.periodicalMonth,
      periodicalYear: req.body.periodicalYear,
      series: req.body.series,
      notes: req.body.notes,
      subscriptionDate: req.body.subscriptionDate,
      frequency: req.body.frequency,
      receiptDate: req.body.receiptDate,
      departmentToIssue: req.body.departmentToIssue,
      departmentIssueDate: req.body.departmentIssueDate,
      addOnCopies: req.body.addOnCopies,
      orderNo: req.body.orderNo,
      poNo: req.body.poNo,
      vendorDetails: {
        name: req.body.vendorDetails?.name || "",
        phone: req.body.vendorDetails?.phone || null,
        email: req.body.vendorDetails?.email || "",
      },
      mode: req.body.mode,
      url: req.body.url,
      paymentDetails: {
        currency: req.body.paymentDetails?.currency || "",
        amount: req.body.paymentDetails?.amount || null,
      },
      remarksForPayment: req.body.remarksForPayment,
      language: req.body.language,
      status: req.body.status || "Active",
    };

    const periodical = await Periodical.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    );

    // LOG THE ACTIVITY
    await logPeriodicalUpdate(req, req.user, periodical._id, periodical.title);

    if (!periodical) {
      return res.status(404).json({
        success: false,
        message: "Periodical not found",
      });
    }

    res.json({
      success: true,
      message: "Periodical updated successfully",
      data: periodical,
    });
  } catch (error) {
    next(error);
  }
};

// Delete periodical
exports.deletePeriodical = async (req, res, next) => {
  try {
    const periodical = await Periodical.findByIdAndDelete(req.params.id);

    // LOG THE ACTIVITY
    await logPeriodicalDelete(req, req.user, periodical._id, periodical.title);

    if (!periodical) {
      return res.status(404).json({
        success: false,
        message: "Periodical not found",
      });
    }

    res.json({
      success: true,
      message: "Periodical deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
exports.getPeriodicalSuggestions = async (req, res, next) => {
  try {
    const { field, query } = req.query;

    // Define which fields are searchable to prevent database exposure
    const allowedFields = {
      poNo: "poNo",
      vendorName: "vendorDetails.name",
      vendorPhone: "vendorDetails.phone",
      vendorEmail: "vendorDetails.email",
    };

    const dbField = allowedFields[field];

    if (!dbField) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid field requested" });
    }

    // Build the filter: find distinct values that match the user's input (case-insensitive)
    const filter = {};
    if (query) {
      filter[dbField] = { $regex: query, $options: "i" };
    }

    // Get distinct values from the database
    const suggestions = await Periodical.distinct(dbField, filter);

    res.json({
      success: true,
      data: suggestions.slice(0, 10), // Limit to top 10 suggestions for cleaner UI
    });
  } catch (error) {
    next(error);
  }
};

exports.bulkDisposalByYear = async (req, res, next) => {
  try {
    const { startYear, endYear } = req.body;

    if (!startYear || !endYear) {
      return res.status(400).json({
        success: false,
        message: "Please provide both start and end years",
      });
    }

    // Update all matching records from Active to Disposal
    const result = await Periodical.updateMany(
      {
        periodicalYear: { $gte: Number(startYear), $lte: Number(endYear) },
        status: "Active",
      },
      { $set: { status: "Disposal" } },
    );

    res.json({
      success: true,
      message: `Successfully moved ${result.modifiedCount} records to Disposal`,
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

exports.getDisposalPreviewCount = async (req, res, next) => {
  try {
    const { startYear, endYear } = req.query;

    if (!startYear || !endYear) {
      return res.status(400).json({
        success: false,
        message: "Start and End years are required for preview",
      });
    }

    // Count how many ACTIVE records fall in this range
    const count = await Periodical.countDocuments({
      periodicalYear: { $gte: Number(startYear), $lte: Number(endYear) },
      status: "Active",
    });

    res.json({
      success: true,
      count,
    });
  } catch (error) {
    next(error);
  }
};
