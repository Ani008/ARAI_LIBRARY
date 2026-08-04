import React, { useEffect, useState } from "react";
import { X, Shield } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

const STAFFS = ["STAFF1", "STAFF2", "STAFF3", "STAFF4"];

const MODULES = [
  { key: "standards", label: "Standards" },
  { key: "periodicals", label: "Periodicals" },
  { key: "abstracts", label: "Abstracts" },
  { key: "kcMembers", label: "KC Members" },
  { key: "ajmtPapers", label: "AJMT Papers"},
  { key: "arrivalsNews", label: "New Arrivals & News" },
  { key: "reports", label: "Reports"},
  { key: "upload", label: "Upload Excel"},
];

const PermissionModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchPermissions();
    }
  }, [isOpen]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);

      const res = await api.get("/users");

      if (res.data.success) {
        setPermissions(res.data.data.filter((user) => user.role !== "ADMIN"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (staffRole, moduleKey) => {
    setPermissions((prev) =>
      prev.map((user) => {
        if (user.role !== staffRole) return user;

        return {
          ...user,
          permissions: {
            ...user.permissions,
            [moduleKey]: !user.permissions[moduleKey],
          },
        };
      }),
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      await Promise.all(
        permissions.map((user) =>
          api.put(`/users/${user._id}/permissions`, {
            permissions: user.permissions,
          }),
        ),
      );

      toast.success("Permissions updated successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update permissions");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl">
        {/* Header */}

        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <Shield className="text-blue-600" size={22} />
            <div>
              <h2 className="text-xl font-bold">Manage Staff Permissions</h2>

              <p className="text-sm text-gray-500">
                Grant or revoke module access for staff members.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="hover:bg-gray-100 p-2 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}

        <div className="p-6 overflow-x-auto">
          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : (
            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-3 text-left">Staff</th>

                  {MODULES.map((module) => (
                    <th key={module.key} className="border p-3 text-center">
                      {module.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {permissions.map((user) => (
                  <tr key={user.role}>
                    <td className="border p-3 font-semibold">{user.role}</td>

                    {MODULES.map((module) => (
                      <td key={module.key} className="border text-center">
                        <input
                          type="checkbox"
                          checked={user.permissions?.[module.key] || false}
                          disabled={loading}
                          onChange={() =>
                            handleCheckboxChange(user.role, module.key)
                          }
                          className="h-5 w-5 accent-blue-600 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}

        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 rounded-lg border">
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionModal;
