const checkPermission = (moduleName) => {
  return (req, res, next) => {
    try {
      // Safety check
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      // Admin has access to everything
      if (req.user.role === "ADMIN") {
        return next();
      }

      // Check permission
      if (req.user.permissions?.[moduleName]) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `You don't have permission to access ${moduleName}.`,
      });
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  checkPermission,
};