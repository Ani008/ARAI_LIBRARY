import api from "./api";
import toast from "react-hot-toast";

export const downloadReport = async (endpoint, fileName, fileType = "pdf") => {
  try {
    const response = await api.get(endpoint, {
      responseType: "blob",
    });

    const blob = response.data;

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${fileName}.${fileType}`;

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        toast.error(error.response?.data?.message || "No records found.");
        return;
      }

      if (error.response.status === 400) {
        toast.error(error.response?.data?.message || "Invalid request.");
        return;
      }
    }

    toast.error("Failed to download report.");
  }
};
