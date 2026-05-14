const KCMember = require("../models/KCMembers");
const Counter = require("../models/Counter");

exports.getMembershipIdPreview = async (req, res, next) => {
  try {
    const { membershipType, subscriptionType } = req.query;

    if (!membershipType || !subscriptionType) {
      return res.status(400).json({ message: "Missing types" });
    }

    const typeKey = `${membershipType}_${subscriptionType}`;

    // ✅ ONLY READ (NO increment)
    const counter = await Counter.findById(typeKey);

    const nextSeq = (counter ? counter.sequence_value : 0) + 1;

    let prefix = "";
    let startValue = 0;
    let padding = 0;

    switch (typeKey) {
      case "Automotive Abstract_Subscribers":
        prefix = "SUB";
        break;
      case "Automotive Abstract_Exchange":
        prefix = "EXC";
        break;
      case "Automotive Abstract_GOI":
        prefix = "GOI";
        break;
      case "KC Membership Option 1_Individual":
        startValue = 10000;
        break;
      case "KC Membership Option 1_Educational":
        startValue = 12000;
        break;
      case "KC Membership Option 1_Company":
        startValue = 11000;
        break;
      case "KC Membership Option 2_Educational":
        prefix = "ERB";
        padding = 5;
        break;
      case "KC Membership Option 2_ARAI Member Company":
        prefix = "MCB";
        padding = 5;
        break;
      case "KC Membership Option 2_Other Company":
        prefix = "OCB";
        padding = 4;
        break;
      default:
        prefix = "MEM";
    }

    const finalNum = nextSeq + startValue;

    const previewId =
      padding > 0
        ? prefix + finalNum.toString().padStart(padding, "0")
        : prefix + finalNum;

    res.json({ success: true, previewId });
  } catch (error) {
    next(error);
  }
};

// Get all KC members
exports.getAllKCMembers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // 1. Extract parameters from req.query
    const {
      search,
      membershipType, // Changed from membersType to match frontend
      membershipStatus,
      subscriptionType,
    } = req.query;

    const query = {};

    // 2. Global search (Institution Name or Membership ID)
    if (search && search.trim() !== "") {
      const searchValue = search.trim();
      query.$or = [
        { institutionName: { $regex: searchValue, $options: "i" } },
        { membershipId: { $regex: searchValue, $options: "i" } },
      ];
    }

    // 3. Exact Match Filters
    // These only get added to the 'query' object if they exist in req.query
    if (membershipType) {
      query.membershipType = membershipType;
    }

    if (subscriptionType) {
      query.subscriptionType = subscriptionType;
    }

    if (membershipStatus) {
      query.membershipStatus = membershipStatus;
    }

    // 4. Database Operations
    const totalRecords = await KCMember.countDocuments(query);

    const kcMembers = await KCMember.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // 5. Response
    res.json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      count: kcMembers.length,
      data: kcMembers,
    });
  } catch (error) {
    next(error);
  }
};

// Get single KC member
exports.getKCMemberById = async (req, res, next) => {
  try {
    const kcMember = await KCMember.findById(req.params.id);

    if (!kcMember) {
      return res.status(404).json({
        success: false,
        message: "KC Member not found",
      });
    }

    res.json({
      success: true,
      data: kcMember,
    });
  } catch (error) {
    next(error);
  }
};

// Create KC member
exports.createKCMember = async (req, res, next) => {
  try {
    // 1. Prepare Data
    const kcMemberData = {
      institutionName: req.body.institutionName,
      contactPerson: req.body.contactPerson,
      designation: req.body.designation,
      membershipType: req.body.membershipType,
      completeAddress: req.body.completeAddress,
      email: req.body.email,
      phone: req.body.phone,
      alternatePhone: req.body.alternatePhone,
      website: req.body.website,
      membershipStartDate: req.body.membershipStartDate,
      membershipEndDate: req.body.membershipEndDate,
      subscriptionType: req.body.subscriptionType || "",
      fees: req.body.fees,
      membershipStatus: req.body.membershipStatus || "",
      paymentStatus: req.body.paymentStatus,
      lastPaymentDate: req.body.lastPaymentDate,
      transactionId: req.body.transactionId,
      nameOfBank: req.body.nameOfBank,
      notes: req.body.notes,
    };

    // 2. Save to Database
    const kcMember = await KCMember.create({
      ...kcMemberData,
      membershipId: req.body.membershipId, // 🔥 IMPORTANT
    });

    // 3. LOG THE ACTIVITY (Crucial change: use kcMember variable)
    try {
      await ActivityLog.create({
        adminName: "Admin", // Or req.user.name if you have auth
        action: `Added new KC member: ${kcMember.institutionName}`,
        targetId: kcMember._id,
      });
    } catch (logError) {
      console.error("Log failed, but member was created:", logError);
      // We don't call next(logError) here because the member was successfully created
    }

    // 4. Send One Final Response
    res.status(201).json({
      success: true,
      message: "KC Member created successfully",
      data: kcMember,
    });
  } catch (error) {
    next(error);
  }
};

// Update KC member
exports.updateKCMember = async (req, res, next) => {
  try {
    const updateData = {
      institutionName: req.body.institutionName,
      contactPerson: req.body.contactPerson,
      designation: req.body.designation,
      membershipType: req.body.membershipType,
      completeAddress: req.body.completeAddress,
      email: req.body.email,
      phone: req.body.phone,
      alternatePhone: req.body.alternatePhone,
      website: req.body.website,
      membershipStartDate: req.body.membershipStartDate,
      membershipEndDate: req.body.membershipEndDate,
      subscriptionType: req.body.subscriptionType || "",
      fees: req.body.fees,
      membershipStatus: req.body.membershipStatus || "",
      paymentStatus: req.body.paymentStatus,
      lastPaymentDate: req.body.lastPaymentDate,
      transactionId: req.body.transactionId,
      nameOfBank: req.body.nameOfBank,
      notes: req.body.notes,
    };

    const kcMember = await KCMember.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    );

    if (!kcMember) {
      return res.status(404).json({
        success: false,
        message: "KC Member not found",
      });
    }

    res.json({
      success: true,
      message: "KC Member updated successfully",
      data: kcMember,
    });
  } catch (error) {
    next(error);
  }
};

// Delete KC member
exports.deleteKCMember = async (req, res, next) => {
  try {
    const kcMember = await KCMember.findByIdAndDelete(req.params.id);

    if (!kcMember) {
      return res.status(404).json({
        success: false,
        message: "KC Member not found",
      });
    }

    res.json({
      success: true,
      message: "KC Member deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
