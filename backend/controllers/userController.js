const User = require("../models/User");

// GET /api/users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, "-password").sort({ role: 1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePermissions = async (req, res, next) => {
  try {

    const { permissions } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Admin permissions should never be editable
    if (user.role === "ADMIN") {
      return res.status(400).json({
        success: false,
        message: "Admin permissions cannot be modified.",
      });
    }

    user.permissions = permissions;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Permissions updated successfully.",
      data: user,
    });

  } catch (error) {
    next(error);
  }
};