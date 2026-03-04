const KCMember = require("../models/KCMembers");

// Get all KC members
exports.getAllKCMembers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const { search, membersType, status } = req.query;

    const query = {};

    // 🔎 Global search
    if (search && search.trim() !== "") {
      const searchValue = search.trim();

      query.$or = [
        { institutionName: { $regex: searchValue, $options: "i" } },
        { membershipId: { $regex: searchValue, $options: "i" } },
      ];
    }

    if (membersType) query.membershipType = membersType;
    if (status) query.status = status;

    const totalRecords = await KCMember.countDocuments(query);

    const kcMembers = await KCMember.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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
      membershipId: req.body.membershipId,
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
      paymentFrequency: req.body.paymentFrequency,
      paymentStatus: req.body.paymentStatus,
      lastPaymentDate: req.body.lastPaymentDate,
      transactionId: req.body.transactionId,
      nameOfBank: req.body.nameOfBank,
      notes: req.body.notes,
    };

    // 2. Save to Database
    const kcMember = await KCMember.create(kcMemberData);

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
      membershipId: req.body.membershipId,
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
      paymentFrequency: req.body.paymentFrequency,
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
