import { FileText, BookOpen, Car, Users } from "lucide-react";
import { useState } from "react";
import PermissionGuard from "../Components/PermissionGuard";
import AccessDeniedOverlay from "../Components/AccessDeniedOverlay";

import api from "../services/api";
import toast from "react-hot-toast";

const UploadCards = () => {
  const [files, setFiles] = useState({
    standards: null,
    periodicals: null,
    abstracts: null,
    kcmembers: null,
    ajmtpapers: null,
  });

  const handleFileChange = (type, file) => {
    setFiles((prev) => ({
      ...prev,
      [type]: file,
    }));
  };

  const uploadRoutes = {
    standards: "/standards/import-excel",
    abstracts: "/abstracts/import-excel",
    periodicals: "/periodicals/import-excel",
    kcmembers: "/kcmembers/import-excel",
    ajmtpapers: "/ajmtpapers/import-excel",
  };

  const validateFileName = (type, file) => {
    const name = file.name.toLowerCase();

    if (type === "standards" && !name.includes("standard")) {
      toast.error("Please upload a Standards Excel file.");
      return false;
    }

    if (type === "periodicals" && !name.includes("periodical")) {
      toast.error("Please upload a Periodicals Excel file.");
      return false;
    }

    if (type === "abstracts" && !name.includes("abstract")) {
      toast.error("Please upload an Abstracts Excel file.");
      return false;
    }

    if (
      type === "kcmembers" &&
      !name.includes("kc") &&
      !name.includes("member")
    ) {
      toast.error("Please upload a KC Members Excel file.");
      return false;
    }

    if (
      type === "ajmtpapers" &&
      !name.includes("ajmt") &&
      !name.includes("paper")
    ) {
      toast.error("Please upload an AJMT Papers Excel file.");
      return false;
    }

    return true;
  };

  const handleUpload = async (type) => {
    if (!files[type]) {
      toast.error("Please choose a file first");
      return;
    }

    // 1. Validate file name BEFORE calling the API
    if (!validateFileName(type, files[type])) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", files[type]);

      const res = await api.post(uploadRoutes[type], formData);

      const data = res.data;

      // Dynamic success message
      const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
      toast.success(`${typeLabel} uploaded successfully`);

      // Optional: Clear the file state after success
      setFiles((prev) => ({ ...prev, [type]: null }));
    } catch (err) {
      console.error(err);
      toast.error("Server error during upload");
    }
  };

  const handleDownloadBackup = async () => {
    try {
      const response = await api.get("/reports/backup/complete", {
        responseType: "blob",
      });

      const blob = response.data;

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Backup_Sheet_${Date.now()}.xlsx`;

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

      toast.success("Backup downloaded successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download backup report.");
    }
  };

  const cardStyle =
    "bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition";

  return (
    <PermissionGuard
      module="upload"
      fallback={<AccessDeniedOverlay title="Upload Management" />}
    >
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {/* Upload Standards */}
        <div className={cardStyle}>
          <div className="flex items-center gap-3 mb-3">
            <FileText className="text-blue-600" />
            <h3 className="font-semibold text-gray-800">Upload Standards</h3>
          </div>

          <input
            type="file"
            className="text-sm mb-3 bg-gray-50 border border-gray-300 rounded-md p-7"
            onChange={(e) => handleFileChange("standards", e.target.files[0])}
          />

          <button
            onClick={() => handleUpload("standards")}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Upload Standards
          </button>
        </div>

        {/* Upload Periodicals */}
        <div className={cardStyle}>
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="text-blue-600" />
            <h3 className="font-semibold text-gray-800">Upload Periodicals</h3>
          </div>

          <input
            type="file"
            className="text-sm mb-3 bg-gray-50 border border-gray-300 rounded-md p-7"
            onChange={(e) => handleFileChange("periodicals", e.target.files[0])}
          />

          <button
            onClick={() => handleUpload("periodicals")}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Upload Periodicals
          </button>
        </div>

        {/* Upload Abstracts */}
        <div className={cardStyle}>
          <div className="flex items-center gap-3 mb-3">
            <Car className="text-blue-600" />
            <h3 className="font-semibold text-gray-800">
              Upload Automotive Abstracts
            </h3>
          </div>

          <input
            type="file"
            className="text-sm mb-3 bg-gray-50 border border-gray-300 rounded-md p-7"
            onChange={(e) => handleFileChange("abstracts", e.target.files[0])}
          />

          <button
            onClick={() => handleUpload("abstracts")}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Upload Automotive Abstracts
          </button>
        </div>

        <div className={cardStyle}>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Users className="text-green-600" />
              <h3 className="font-semibold text-gray-800">KC Memberships</h3>
            </div>
            <input
              type="file"
              className="text-sm mb-3 bg-gray-50 border border-gray-300 rounded-md p-4 w-full"
              onChange={(e) => handleFileChange("kcmembers", e.target.files[0])}
            />
          </div>
          <button
            onClick={() => handleUpload("kcmembers")}
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
          >
            Upload KC Members
          </button>
        </div>

        <div className={cardStyle}>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Users className="text-blue-600" />
              <h3 className="font-semibold text-gray-800">AJMT Papers</h3>
            </div>
            <input
              type="file"
              className="text-sm mb-3 bg-gray-50 border border-gray-300 rounded-md p-4 w-full"
              onChange={(e) =>
                handleFileChange("ajmtpapers", e.target.files[0])
              }
            />
          </div>
          <button
            onClick={() => handleUpload("ajmtpapers")}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Upload AJMT Papers
          </button>
        </div>

        <div className={cardStyle}>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Users className="text-blue-600" />
              <h3 className="font-semibold text-gray-800">
                Complete Backup Report
              </h3>
            </div>
          </div>
          <button
            onClick={handleDownloadBackup}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Download Complete Backup Report
          </button>
        </div>
      </div>
    </PermissionGuard>
  );
};

export default UploadCards;
