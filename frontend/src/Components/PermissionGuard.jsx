import React from "react";

const PermissionGuard = ({
  module,
  children,
  fallback,
}) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return children;

  if (user.role === "ADMIN") {
    return children;
  }

  const hasAccess = user.permissions?.[module];

  if (hasAccess) {
    return children;
  }

  return fallback;
};

export default PermissionGuard;